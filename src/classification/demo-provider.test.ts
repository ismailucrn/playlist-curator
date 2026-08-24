import { describe, expect, it } from "vitest";
import { DemoClassificationProvider } from "@/classification/demo-provider";
import { categoryFixture, trackFixture } from "@/test/fixtures";

describe("DemoClassificationProvider", () => {
  it("aynı girdi için deterministik sonuç üretir", async () => {
    const provider = new DemoClassificationProvider();
    const first = await provider.classifyTrack(trackFixture, [categoryFixture]);
    const second = await provider.classifyTrack(trackFixture, [categoryFixture]);
    expect(first).toEqual(second);
  });

  it("puanları 0-1 aralığında ve evidence ile döndürür", async () => {
    const [result] = await new DemoClassificationProvider().classifyTrack(trackFixture, [categoryFixture]);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(1);
    expect(result.evidence[0]).toContain("deterministik");
  });
});
