import { z } from "zod";

const imageSchema = z.object({
  url: z.string(),
  height: z.number().nullable().optional(),
  width: z.number().nullable().optional(),
});
const externalUrlsSchema = z.object({ spotify: z.string().optional() }).loose();
const ownerSchema = z
  .object({ id: z.string(), display_name: z.string().nullable().optional() })
  .loose();

export const spotifyProfileSchema = z
  .object({
    account_id: z.string(),
    id: z.string(),
    display_name: z.string().nullable(),
    images: z.array(imageSchema).optional().default([]),
  })
  .loose();

export const simplifiedPlaylistSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable().optional().default(""),
    collaborative: z.boolean().default(false),
    owner: ownerSchema,
    public: z.boolean().nullable().optional(),
    snapshot_id: z.string().nullable().optional(),
    images: z.array(imageSchema).default([]),
    external_urls: externalUrlsSchema.optional().default({}),
    items: z.object({ total: z.number().int().nonnegative() }).loose(),
  })
  .loose();

export const playlistPageSchema = z.object({
  items: z.array(simplifiedPlaylistSchema),
  next: z.string().nullable(),
  total: z.number().int().nonnegative(),
});

const artistSchema = z.object({ name: z.string() }).loose();
const albumSchema = z
  .object({
    name: z.string(),
    images: z.array(imageSchema).default([]),
  })
  .loose();

export const spotifyTrackSchema = z
  .object({
    type: z.literal("track"),
    id: z.string().nullable(),
    uri: z.string(),
    name: z.string(),
    artists: z.array(artistSchema),
    album: albumSchema,
    duration_ms: z.number().int().nonnegative(),
    external_urls: externalUrlsSchema.optional().default({}),
    is_playable: z.boolean().optional(),
    is_local: z.boolean().optional().default(false),
  })
  .loose();

export const playlistItemSchema = z
  .object({
    item: z.unknown().nullable(),
    is_local: z.boolean().optional().default(false),
  })
  .loose();

export const playlistItemsPageSchema = z.object({
  items: z.array(playlistItemSchema),
  next: z.string().nullable(),
  total: z.number().int().nonnegative(),
});

export const playlistDetailsSchema = simplifiedPlaylistSchema;

export const createPlaylistResponseSchema = z
  .object({
    id: z.string(),
    external_urls: externalUrlsSchema.optional().default({}),
  })
  .loose();

export const tokenResponseSchema = z.object({
  access_token: z.string().min(1),
  token_type: z.literal("Bearer"),
  scope: z.string().default(""),
  expires_in: z.number().int().positive(),
  refresh_token: z.string().min(1).optional(),
});
