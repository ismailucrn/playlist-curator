import type { CategoryModel, Track } from "@/domain/models";

export const trackFixture: Track = {
  id: "track-1",
  uri: "spotify:track:track-1",
  name: "Midnight Run",
  artists: ["Soft Voltage"],
  album: "Neon Momentum",
  durationMs: 200_000,
  spotifyUrl: null,
  imageUrl: null,
  isPlayable: true,
  isLocal: false,
};

export const categoryFixture: CategoryModel = {
  id: "category-1",
  name: "Gece Sürüşü",
  slug: "gece-surusu",
  type: "mood",
  description: "Gece sürüşü",
  rules: [
    { field: "title", operator: "contains", value: "midnight", weight: 0.8 },
    { field: "album", operator: "contains", value: "neon", weight: 0.6 },
  ],
  seedTrackIds: [],
};
