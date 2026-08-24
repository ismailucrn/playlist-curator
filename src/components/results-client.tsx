"use client";

import { useMemo, useState } from "react";
import {
  Check,
  CheckCheck,
  ExternalLink,
  ListPlus,
  LoaderCircle,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import type { ClassificationStatus } from "@/domain/models";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClass } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ResultViewModel {
  id: string;
  trackId: string;
  trackName: string;
  artistNames: string;
  albumName: string;
  categoryId: string;
  categoryName: string;
  categoryType: string;
  score: number;
  evidence: string[];
  source: string;
  status: ClassificationStatus;
}

export function ResultsClient({
  runId,
  playlistName,
  mode,
  initialResults,
}: {
  runId: string;
  playlistName: string;
  mode: string;
  initialResults: ResultViewModel[];
}) {
  const [results, setResults] = useState(initialResults);
  const categoryIds = [...new Set(results.map((result) => result.categoryId))];
  const [activeCategory, setActiveCategory] = useState(categoryIds[0] ?? "all");
  const [selected, setSelected] = useState(
    () =>
      new Set(
        results.filter((result) => result.score >= 0.5).map(({ id }) => id),
      ),
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportName, setExportName] = useState(`${playlistName} · Curated`);
  const [exportResult, setExportResult] = useState<{
    status: string;
    spotifyUrl?: string | null;
    addedCount: number;
  } | null>(null);

  const visible = useMemo(
    () =>
      results.filter(
        (result) =>
          activeCategory === "all" || result.categoryId === activeCategory,
      ),
    [activeCategory, results],
  );
  const acceptedCount = results.filter(
    ({ status }) => status === "accepted",
  ).length;

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function selectVisible() {
    setSelected((current) => {
      const next = new Set(current);
      const allSelected = visible.every(({ id }) => next.has(id));
      visible.forEach(({ id }) =>
        allSelected ? next.delete(id) : next.add(id),
      );
      return next;
    });
  }

  async function feedback(
    status: "accepted" | "rejected",
    ids = [...selected],
  ) {
    if (ids.length === 0) return setError("Önce en az bir sonuç seçin.");
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/classifications/feedback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resultIds: ids, status }),
      });
      const body = await response.json();
      if (!response.ok)
        throw new Error(body.error?.message ?? "Sonuçlar güncellenemedi.");
      setResults((current) =>
        current.map((result) =>
          ids.includes(result.id) ? { ...result, status } : result,
        ),
      );
      if (status === "rejected")
        setSelected((current) => {
          const next = new Set(current);
          ids.forEach((id) => next.delete(id));
          return next;
        });
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Sonuçlar güncellenemedi.",
      );
    } finally {
      setPending(false);
    }
  }

  async function exportPlaylist() {
    const ids = [...selected];
    if (!ids.length) return setError("Dışa aktarmak için sonuç seçin.");
    setPending(true);
    setError(null);
    setExportResult(null);
    try {
      const response = await fetch("/api/exports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          runId,
          resultIds: ids,
          playlistName: exportName,
          clientRequestId: crypto.randomUUID(),
        }),
      });
      const body = await response.json();
      if (!response.ok)
        throw new Error(body.error?.message ?? "Liste oluşturulamadı.");
      setExportResult(body.export);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Liste oluşturulamadı.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section className="min-w-0">
        <div className="flex gap-2 overflow-x-auto pb-3">
          <button
            onClick={() => setActiveCategory("all")}
            className={cn(
              "shrink-0 rounded-xl px-3.5 py-2 text-xs font-semibold",
              activeCategory === "all"
                ? "bg-accent text-[#07110b]"
                : "text-muted border border-white/10 bg-white/[.035]",
            )}
          >
            Tüm sonuçlar{" "}
            <span className="ml-1 opacity-70">{results.length}</span>
          </button>
          {categoryIds.map((id) => {
            const name = results.find(
              (result) => result.categoryId === id,
            )?.categoryName;
            const count = results.filter(
              (result) => result.categoryId === id,
            ).length;
            return (
              <button
                key={id}
                onClick={() => setActiveCategory(id)}
                className={cn(
                  "shrink-0 rounded-xl px-3.5 py-2 text-xs font-semibold",
                  activeCategory === id
                    ? "bg-accent text-[#07110b]"
                    : "text-muted border border-white/10 bg-white/[.035] hover:text-white",
                )}
              >
                {name} <span className="ml-1 opacity-70">{count}</span>
              </button>
            );
          })}
        </div>
        <div className="glass-panel overflow-hidden rounded-3xl">
          <div className="flex flex-col gap-3 border-b border-white/[.07] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">Öneriler</h2>
              <p className="text-muted mt-1 text-xs">
                Her karttaki gerekçe provider tarafından açıklanır.
              </p>
            </div>
            <button
              onClick={selectVisible}
              className={buttonClass("secondary", "min-h-9 text-xs")}
            >
              <CheckCheck className="size-4" /> Görünenleri seç
            </button>
          </div>
          <div className="divide-y divide-white/[.055]">
            {visible.map((result) => (
              <article
                key={result.id}
                className={cn(
                  "grid gap-4 p-4 transition sm:grid-cols-[28px_minmax(0,1fr)_92px_92px] sm:items-center sm:p-5",
                  selected.has(result.id) && "bg-accent/[.025]",
                )}
              >
                <button
                  onClick={() => toggle(result.id)}
                  className={cn(
                    "grid size-6 place-items-center rounded-lg border",
                    selected.has(result.id)
                      ? "border-accent bg-accent text-[#07110b]"
                      : "border-white/15 text-transparent",
                  )}
                >
                  <Check className="size-3.5" />
                  <span className="sr-only">Sonucu seç</span>
                </button>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-sm font-semibold">
                      {result.trackName}
                    </h3>
                    <Badge
                      tone={
                        result.status === "accepted"
                          ? "accent"
                          : result.status === "rejected"
                            ? "danger"
                            : "neutral"
                      }
                    >
                      {result.status === "accepted"
                        ? "Kabul"
                        : result.status === "rejected"
                          ? "Reddedildi"
                          : "Öneri"}
                    </Badge>
                  </div>
                  <p className="text-muted mt-1 truncate text-xs">
                    {result.artistNames} · {result.albumName}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-[#b4c3bc]">
                    {result.evidence[0] ?? "Kanıt bulunamadı."}
                  </p>
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-[10px]">
                    <span className="text-muted">Güven</span>
                    <span className="text-accent font-bold">
                      %{Math.round(result.score * 100)}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/[.07]">
                    <div
                      className="bg-accent h-full rounded-full"
                      style={{ width: `${result.score * 100}%` }}
                    />
                  </div>
                  <p className="text-muted mt-2 truncate text-[10px]">
                    {result.categoryName}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => feedback("accepted", [result.id])}
                    className={cn(
                      "grid size-9 place-items-center rounded-xl border transition",
                      result.status === "accepted"
                        ? "border-accent/30 bg-accent/15 text-accent"
                        : "text-muted hover:text-accent border-white/10",
                    )}
                  >
                    <ThumbsUp className="size-4" />
                    <span className="sr-only">Kabul et</span>
                  </button>
                  <button
                    onClick={() => feedback("rejected", [result.id])}
                    className={cn(
                      "grid size-9 place-items-center rounded-xl border transition",
                      result.status === "rejected"
                        ? "border-red-300/30 bg-red-400/15 text-red-200"
                        : "text-muted border-white/10 hover:text-red-200",
                    )}
                  >
                    <ThumbsDown className="size-4" />
                    <span className="sr-only">Reddet</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <aside className="space-y-5 xl:sticky xl:top-10 xl:self-start">
        <section className="glass-panel rounded-3xl p-5">
          <p className="text-accent text-xs font-semibold tracking-[.14em]">
            TOPLU İŞLEMLER
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-white/[.035] p-3">
              <p className="text-xl font-semibold">{selected.size}</p>
              <p className="text-muted text-[10px]">seçili</p>
            </div>
            <div className="rounded-xl bg-white/[.035] p-3">
              <p className="text-xl font-semibold">{acceptedCount}</p>
              <p className="text-muted text-[10px]">kabul</p>
            </div>
            <div className="rounded-xl bg-white/[.035] p-3">
              <p className="text-xl font-semibold">{results.length}</p>
              <p className="text-muted text-[10px]">sonuç</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              disabled={pending}
              onClick={() => feedback("accepted")}
              className={buttonClass("secondary", "min-h-10 text-xs")}
            >
              <ThumbsUp className="size-3.5" /> Kabul
            </button>
            <button
              disabled={pending}
              onClick={() => feedback("rejected")}
              className={buttonClass("secondary", "min-h-10 text-xs")}
            >
              <ThumbsDown className="size-3.5" /> Reddet
            </button>
          </div>
        </section>
        <section className="glass-panel rounded-3xl p-5">
          <div className="flex items-center gap-2">
            <ListPlus className="text-violet size-5" />
            <h2 className="font-semibold">Yeni liste oluştur</h2>
          </div>
          <p className="text-muted mt-2 text-xs leading-5">
            Seçili sonuçlar aynı şarkıyı tekrar etmeden{" "}
            {mode === "demo" ? "demo çıktısına" : "özel Spotify listenize"}{" "}
            eklenir.
          </p>
          <input
            value={exportName}
            onChange={(event) => setExportName(event.target.value)}
            minLength={2}
            maxLength={100}
            className="mt-4 h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm"
          />
          <Button
            onClick={exportPlaylist}
            disabled={pending || !exportName.trim() || selected.size === 0}
            className="mt-3 w-full"
          >
            {pending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <ListPlus className="size-4" />
            )}{" "}
            {mode === "demo"
              ? "Demo çıktısı oluştur"
              : "Spotify listesi oluştur"}
          </Button>
          {exportResult ? (
            <div className="border-accent/20 bg-accent/10 text-accent mt-4 rounded-xl border p-3 text-xs leading-5">
              {mode === "demo"
                ? `${exportResult.addedCount} parça için demo çıktı kaydı oluşturuldu.`
                : "Spotify listeniz oluşturuldu."}
              {exportResult.spotifyUrl ? (
                <a
                  href={exportResult.spotifyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 flex items-center gap-1 font-semibold underline"
                >
                  Spotify&apos;da aç <ExternalLink className="size-3" />
                </a>
              ) : null}
            </div>
          ) : null}
        </section>
        {error ? (
          <div className="rounded-2xl border border-red-300/20 bg-red-400/10 p-3 text-sm text-red-100">
            {error}
          </div>
        ) : null}
      </aside>
    </div>
  );
}
