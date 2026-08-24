import type {
  CategoryModel,
  ClassificationProvider,
  ClassificationSuggestion,
  Track,
} from "@/domain/models";
import { clampScore } from "@/lib/utils";

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export class DemoClassificationProvider implements ClassificationProvider {
  readonly id = "demo" as const;
  readonly name = "Demo provider";

  async classifyTrack(
    track: Track,
    categories: CategoryModel[],
  ): Promise<ClassificationSuggestion[]> {
    return categories.map((category) => {
      const normalized = stableHash(`${track.id}:${category.id}`) / 0xffffffff;
      const score = clampScore(Number((0.35 + normalized * 0.64).toFixed(2)));

      return {
        trackId: track.id,
        categoryId: category.id,
        score,
        evidence: [
          `Demo modu “${track.name}” ve “${category.name}” kimliklerinden deterministik bir örnek puan üretti.`,
        ],
        source: this.id,
        status: "suggested",
      };
    });
  }

  async classifyTracks(tracks: Track[], categories: CategoryModel[]) {
    const results = await Promise.all(
      tracks.map((track) => this.classifyTrack(track, categories)),
    );
    return results.flat();
  }
}
