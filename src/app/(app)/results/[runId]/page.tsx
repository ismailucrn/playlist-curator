import Link from "next/link";
import { ArrowLeft, CalendarClock, Sparkles } from "lucide-react";
import { requireCurrentUser } from "@/auth/session";
import {
  ResultsClient,
  type ResultViewModel,
} from "@/components/results-client";
import { Badge } from "@/components/ui/badge";
import { getClassificationRun } from "@/repositories/classifications";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ runId: string }>;
}) {
  const user = await requireCurrentUser();
  const { runId } = await params;
  const run = await getClassificationRun(user.id, runId);
  const results: ResultViewModel[] = run.results.map((result) => ({
    id: result.id,
    trackId: result.trackId,
    trackName: result.trackName,
    artistNames: result.artistNames,
    albumName: result.albumName,
    categoryId: result.categoryId,
    categoryName: result.category.name,
    categoryType: result.category.type,
    score: result.score,
    evidence: parseEvidence(result.evidenceJson),
    source: result.source,
    status: result.status as ResultViewModel["status"],
  }));
  return (
    <div className="fade-up">
      <Link
        href={`/playlists/${run.sourcePlaylistId}`}
        className="text-muted inline-flex items-center gap-2 text-sm transition hover:text-white"
      >
        <ArrowLeft className="size-4" /> Listeye dön
      </Link>
      <header className="mt-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="accent">
              <Sparkles className="mr-1 size-3" /> {run.provider}
            </Badge>
            <Badge>
              <CalendarClock className="mr-1 size-3" />{" "}
              {new Intl.DateTimeFormat("tr-TR", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(run.createdAt)}
            </Badge>
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-.045em] sm:text-5xl">
            Sınıflandırma sonuçları
          </h1>
          <p className="text-muted mt-3 text-sm">
            <span className="text-white">{run.sourcePlaylistName}</span> için{" "}
            {results.length} kategori eşleşmesi oluşturuldu.
          </p>
        </div>
      </header>
      <div className="mt-9">
        <ResultsClient
          runId={run.id}
          playlistName={run.sourcePlaylistName}
          mode={user.mode}
          initialResults={results}
        />
      </div>
    </div>
  );
}

function parseEvidence(value: string) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}
