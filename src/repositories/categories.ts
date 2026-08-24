import "server-only";

import type { CategoryModel, CategoryRuleInput, CategoryType } from "@/domain/models";
import { categoryInputSchema } from "@/domain/validation";
import { db } from "@/lib/db";

export async function listCategories(userId: string): Promise<CategoryModel[]> {
  const categories = await db.category.findMany({
    where: { userId },
    include: { rules: true, seedTracks: true },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    type: category.type as CategoryType,
    description: category.description,
    rules: category.rules.map((rule) => ({
      field: rule.field as CategoryRuleInput["field"],
      operator: rule.operator as CategoryRuleInput["operator"],
      value: rule.value,
      weight: rule.weight,
    })),
    seedTrackIds: category.seedTracks.map(({ trackId }) => trackId),
  }));
}

export async function createCategory(userId: string, input: unknown) {
  const category = categoryInputSchema.parse(input);
  return db.category.create({
    data: {
      userId,
      name: category.name,
      slug: category.slug,
      type: category.type,
      description: category.description,
      rules: { create: category.rules },
      seedTracks: { create: category.seedTrackIds.map((trackId) => ({ trackId })) },
    },
    include: { rules: true, seedTracks: true },
  });
}
