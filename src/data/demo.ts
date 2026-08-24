import type { PlaylistSummary, Track } from "@/domain/models";

export const DEMO_USER_ID = "demo-user";

export const demoPlaylists: PlaylistSummary[] = [
  {
    id: "demo-gece-yolculugu",
    name: "Gece Yolculuğu",
    description: "Şehir ışıkları, sakin ritimler ve uzun yollar.",
    imageUrl: null,
    itemCount: 8,
    ownerName: "Demo Kullanıcı",
    collaborative: false,
    snapshotId: "demo-snapshot-night",
    spotifyUrl: null,
    source: "demo",
  },
  {
    id: "demo-karisik-enerji",
    name: "Karışık Enerji",
    description: "Türkçe ve İngilizce, poptan elektroniğe bir seçki.",
    imageUrl: null,
    itemCount: 8,
    ownerName: "Demo Kullanıcı",
    collaborative: true,
    snapshotId: "demo-snapshot-energy",
    spotifyUrl: null,
    source: "demo",
  },
];

const allDemoTracks: Record<string, Track[]> = {
  "demo-gece-yolculugu": [
    track(
      "demo-01",
      "Geceye Bir Şarkı",
      ["Lal Rüzgâr"],
      "Kıyı Çizgisi",
      221000,
    ),
    track(
      "demo-02",
      "Midnight Avenue",
      ["The Satellites"],
      "Neon Lines",
      198000,
    ),
    track("demo-03", "Luna Tranquila", ["Mar Azul"], "Después del Sol", 244000),
    track("demo-04", "Yavaşça", ["Ada"], "İç Sesler", 207000),
    track("demo-05", "Glass Skyline", ["Northbound"], "City Static", 234000),
    track("demo-06", "Sessiz Sokaklar", ["Gri Bahçe"], "Gece Notları", 260000),
    track("demo-07", "Dream Circuit", ["Soft Voltage"], "Low Light", 193000),
    track("demo-08", "Calma", ["Isla Norte"], "Aire", 215000),
  ],
  "demo-karisik-enerji": [
    track("demo-09", "Koş Koş", ["Rota 90"], "Başlangıç", 184000),
    track("demo-10", "Electric Hearts", ["Nova Club"], "After Hours", 201000),
    track("demo-11", "Baila Conmigo", ["Sol Rojo"], "Fiesta", 176000),
    track("demo-12", "Yüksek Ses", ["Kuzey Çizgisi"], "Canlı", 229000),
    track("demo-13", "Run It Back", ["Fast Forward"], "Momentum", 188000),
    track("demo-14", "Güneş Açınca", ["Mavi Oda"], "Yazlık", 213000),
    track("demo-15", "Pulse Driver", ["Metric Bloom"], "Kinetic", 205000),
    track("demo-16", "Son Dans", ["Renkli Cam"], "Bir Gece", 238000),
  ],
};

function track(
  id: string,
  name: string,
  artists: string[],
  album: string,
  durationMs: number,
): Track {
  return {
    id,
    uri: `spotify:track:${id}`,
    name,
    artists,
    album,
    durationMs,
    spotifyUrl: null,
    imageUrl: null,
    isPlayable: true,
    isLocal: false,
  };
}

export function getDemoTracks(playlistId: string) {
  return allDemoTracks[playlistId] ?? [];
}

export function getDemoPlaylist(playlistId: string) {
  return demoPlaylists.find((playlist) => playlist.id === playlistId) ?? null;
}
