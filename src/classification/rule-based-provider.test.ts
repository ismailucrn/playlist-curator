import { describe, expect, it } from "vitest";
import { RuleBasedClassificationProvider } from "@/classification/rule-based-provider";
import { categoryFixture, trackFixture } from "@/test/fixtures";

describe("RuleBasedClassificationProvider", () => {
  it("eşleşen kuralları birleştirir ve açıklar", async () => {
    const [result] = await new RuleBasedClassificationProvider().classifyTrack(trackFixture, [
      categoryFixture,
    ]);
    expect(result.score).toBe(0.92);
    expect(result.evidence).toHaveLength(2);
  });

  it("kullanıcının daha önce kabul ettiği etikete öncelik verir", async () => {
    const [result] = await new RuleBasedClassificationProvider().classifyTrack(
      trackFixture,
      [categoryFixture],
      { acceptedTags: [{ trackId: trackFixture.id, categoryId: categoryFixture.id, confidence: 1 }] },
    );
    expect(result.score).toBe(1);
    expect(result.evidence[0]).toContain("daha önce");
  });

  it("eşleşme olmadığında düşük ama geçerli puan döndürür", async () => {
    const [result] = await new RuleBasedClassificationProvider().classifyTrack(
      { ...trackFixture, name: "Unknown", artists: ["Unknown"], album: "Unknown" },
      [categoryFixture],
    );
    expect(result.score).toBe(0.12);
  });
});
