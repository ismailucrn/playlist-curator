export const CATEGORY_TYPES = ["language", "genre", "mood", "custom"] as const;
export type CategoryType = (typeof CATEGORY_TYPES)[number];

export const CLASSIFICATION_STATUSES = ["suggested", "accepted", "rejected"] as const;
export type ClassificationStatus = (typeof CLASSIFICATION_STATUSES)[number];

export const PROVIDER_IDS = ["demo", "rule-based"] as const;
export type ClassificationProviderId = (typeof PROVIDER_IDS)[number];

export interface Track {
  id: string;
  uri: string;
  name: string;
  artists: string[];
  album: string;
  durationMs: number;
  spotifyUrl: string | null;
  imageUrl: string | null;
  isPlayable: boolean;
  isLocal: boolean;
}

export interface PlaylistSummary {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  itemCount: number;
  ownerName: string;
  collaborative: boolean;
  snapshotId: string | null;
  spotifyUrl: string | null;
  source: "demo" | "spotify";
}

export interface CategoryRuleInput {
  field: "title" | "artist" | "album";
  operator: "contains" | "equals";
  value: string;
  weight: number;
}

export interface CategoryModel {
  id: string;
  name: string;
  slug: string;
  type: CategoryType;
  description: string;
  rules: CategoryRuleInput[];
  seedTrackIds: string[];
}

export interface ClassificationSuggestion {
  trackId: string;
  categoryId: string;
  score: number;
  evidence: string[];
  source: string;
  status: ClassificationStatus;
}

export interface StoredTrackTag {
  trackId: string;
  categoryId: string;
  confidence: number;
}

export interface ClassificationContext {
  acceptedTags?: StoredTrackTag[];
}

export interface ClassificationProvider {
  readonly id: ClassificationProviderId;
  readonly name: string;
  classifyTrack(
    track: Track,
    categories: CategoryModel[],
    context?: ClassificationContext,
  ): Promise<ClassificationSuggestion[]>;
  classifyTracks(
    tracks: Track[],
    categories: CategoryModel[],
    context?: ClassificationContext,
  ): Promise<ClassificationSuggestion[]>;
}

export interface TrackMetadataProvider {
  readonly id: string;
  enrichTracks(tracks: Track[]): Promise<Track[]>;
}
