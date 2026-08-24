import { z } from "zod";
import { CATEGORY_TYPES, CLASSIFICATION_STATUSES, PROVIDER_IDS } from "@/domain/models";
import { slugify } from "@/lib/utils";

export const scoreSchema = z.number().finite().min(0).max(1);
export const categoryTypeSchema = z.enum(CATEGORY_TYPES);
export const classificationStatusSchema = z.enum(CLASSIFICATION_STATUSES);
export const providerIdSchema = z.enum(PROVIDER_IDS);

export const categoryRuleSchema = z.object({
  field: z.enum(["title", "artist", "album"]),
  operator: z.enum(["contains", "equals"]),
  value: z.string().trim().min(1).max(100),
  weight: scoreSchema.default(0.7),
});

export const categoryInputSchema = z
  .object({
    name: z.string().trim().min(2).max(60),
    type: categoryTypeSchema,
    description: z.string().trim().max(240).default(""),
    rules: z.array(categoryRuleSchema).max(12).default([]),
    seedTrackIds: z.array(z.string().min(1)).max(100).default([]),
  })
  .transform((value) => ({ ...value, slug: slugify(value.name) }))
  .refine((value) => value.slug.length >= 2, {
    message: "Kategori adı geçerli bir slug üretmelidir.",
    path: ["name"],
  });

export const classificationRequestSchema = z.object({
  playlistId: z.string().min(1).max(100),
  categoryIds: z.array(z.string().min(1)).min(1).max(30),
});

export const feedbackRequestSchema = z.object({
  resultIds: z.array(z.string().min(1)).min(1).max(500),
  status: z.enum(["accepted", "rejected"]),
});

export const exportPlaylistSchema = z.object({
  runId: z.string().min(1),
  resultIds: z.array(z.string().min(1)).min(1).max(10_000),
  playlistName: z.string().trim().min(2).max(100),
  clientRequestId: z.uuid(),
});
