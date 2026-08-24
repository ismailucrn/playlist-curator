import type {
  CategoryModel,
  CategoryRuleInput,
  ClassificationContext,
  ClassificationProvider,
  ClassificationSuggestion,
  Track,
} from "@/domain/models";
import { clampScore } from "@/lib/utils";

function normalize(value: string) {
  return value.trim().toLocaleLowerCase("tr-TR").normalize("NFKC");
}

function fieldValue(track: Track, field: CategoryRuleInput["field"]) {
  if (field === "artist") return track.artists.join(" ");
  if (field === "album") return track.album;
  return track.name;
}

function ruleMatches(track: Track, rule: CategoryRuleInput) {
  const actual = normalize(fieldValue(track, rule.field));
  const expected = normalize(rule.value);
  return rule.operator === "equals" ? actual === expected : actual.includes(expected);
}

export class RuleBasedClassificationProvider implements ClassificationProvider {
  readonly id = "rule-based" as const;
  readonly name = "Kural tabanlı provider";

  async classifyTrack(
    track: Track,
    categories: CategoryModel[],
    context: ClassificationContext = {},
  ): Promise<ClassificationSuggestion[]> {
    return categories.map((category) => {
      const acceptedTag = context.acceptedTags?.find(
        (tag) => tag.trackId === track.id && tag.categoryId === category.id,
      );
      if (acceptedTag) {
        return suggestion(track, category, Math.max(0.98, acceptedTag.confidence), [
          "Bu parça daha önce kullanıcı tarafından bu kategoride kabul edildi.",
        ]);
      }

      if (category.seedTrackIds.includes(track.id)) {
        return suggestion(track, category, 0.96, ["Parça kategori için seed track olarak kaydedilmiş."]);
      }

      const matchingRules = category.rules.filter((rule) => ruleMatches(track, rule));
      if (matchingRules.length === 0) {
        return suggestion(track, category, 0.12, ["Kayıtlı kurallarla doğrudan eşleşme bulunamadı."]);
      }

      const combined = 1 - matchingRules.reduce((remaining, rule) => remaining * (1 - rule.weight), 1);
      const evidence = matchingRules.map(
        (rule) =>
          `${rule.field} alanı “${rule.value}” değeriyle ${rule.operator === "equals" ? "tam" : "kısmi"} eşleşti (+${Math.round(rule.weight * 100)}).`,
      );
      return suggestion(track, category, combined, evidence);
    });
  }

  async classifyTracks(
    tracks: Track[],
    categories: CategoryModel[],
    context?: ClassificationContext,
  ) {
    const results = await Promise.all(
      tracks.map((track) => this.classifyTrack(track, categories, context)),
    );
    return results.flat();
  }
}

function suggestion(
  track: Track,
  category: CategoryModel,
  score: number,
  evidence: string[],
): ClassificationSuggestion {
  return {
    trackId: track.id,
    categoryId: category.id,
    score: Number(clampScore(score).toFixed(2)),
    evidence,
    source: "rule-based",
    status: "suggested",
  };
}
