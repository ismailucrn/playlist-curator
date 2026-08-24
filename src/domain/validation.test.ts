import { describe, expect, it } from "vitest";
import { categoryInputSchema, scoreSchema } from "@/domain/validation";

describe("category validation", () => {
  it("Türkçe kategori adını güvenli slug'a dönüştürür", () => {
    const result = categoryInputSchema.parse({
      name: "Gece Sürüşü",
      type: "mood",
    });
    expect(result.slug).toBe("gece-surusu");
  });

  it("bilinmeyen kategori türünü reddeder", () => {
    expect(() =>
      categoryInputSchema.parse({ name: "Test", type: "tempo" }),
    ).toThrow();
  });
});

describe("confidence bounds", () => {
  it.each([0, 0.5, 1])("%s değerini kabul eder", (value) => {
    expect(scoreSchema.parse(value)).toBe(value);
  });

  it.each([-0.01, 1.01, Number.NaN])("%s değerini reddeder", (value) => {
    expect(() => scoreSchema.parse(value)).toThrow();
  });
});
