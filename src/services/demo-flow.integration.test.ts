import { describe, expect, it } from "vitest";
import { DemoClassificationProvider } from "@/classification/demo-provider";
import { RuleBasedClassificationProvider } from "@/classification/rule-based-provider";
import { getDemoTracks } from "@/data/demo";
import { categoryFixture } from "@/test/fixtures";

describe("critical demo classification flow", () => {
  it("listeyi sınıflandırır ve kabul edilen sonucu rule-based provider'a taşır", async () => {
    const tracks = getDemoTracks("demo-gece-yolculugu");
    const demoResults = await new DemoClassificationProvider().classifyTracks(
      tracks,
      [categoryFixture],
    );
    expect(demoResults).toHaveLength(tracks.length);

    const accepted = demoResults[0];
    const [personalized] =
      await new RuleBasedClassificationProvider().classifyTrack(
        tracks[0],
        [{ ...categoryFixture, rules: [] }],
        {
          acceptedTags: [
            {
              trackId: accepted.trackId,
              categoryId: accepted.categoryId,
              confidence: Math.max(0.9, accepted.score),
            },
          ],
        },
      );
    expect(personalized.score).toBeGreaterThanOrEqual(0.98);
    expect(personalized.evidence[0]).toContain("kullanıcı");
  });
});
