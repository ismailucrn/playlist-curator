"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Filter,
  LoaderCircle,
  Plus,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import type {
  CategoryModel,
  CategoryType,
  PlaylistSummary,
  Track,
} from "@/domain/models";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClass } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const typeLabels: Record<CategoryType, string> = {
  language: "Dil",
  genre: "Tür",
  mood: "Ruh hâli",
  custom: "Özel",
};

export function PlaylistDetailClient({
  playlist,
  tracks,
  initialCategories,
}: {
  playlist: PlaylistSummary;
  tracks: Track[];
  initialCategories: CategoryModel[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<CategoryType | "all">("all");
  const [categories, setCategories] = useState(initialCategories);
  const [selected, setSelected] = useState(
    () => new Set(initialCategories.slice(0, 3).map(({ id }) => id)),
  );
  const [showCreate, setShowCreate] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredTracks = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("tr-TR");
    if (!needle) return tracks;
    return tracks.filter((track) =>
      [track.name, track.album, ...track.artists]
        .join(" ")
        .toLocaleLowerCase("tr-TR")
        .includes(needle),
    );
  }, [query, tracks]);
  const visibleCategories =
    filter === "all"
      ? categories
      : categories.filter((category) => category.type === filter);

  function toggleCategory(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function classify() {
    if (selected.size === 0) return setError("En az bir kategori seçin.");
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/classifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playlistId: playlist.id,
          categoryIds: [...selected],
        }),
      });
      const body = await response.json();
      if (!response.ok)
        throw new Error(body.error?.message ?? "Sınıflandırma başlatılamadı.");
      router.push(body.redirectTo);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Sınıflandırma başlatılamadı.",
      );
      setPending(false);
    }
  }

  async function createCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const ruleValue = String(form.get("ruleValue") ?? "").trim();
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          type: form.get("type"),
          description: form.get("description"),
          rules: ruleValue
            ? [
                {
                  field: form.get("field"),
                  operator: "contains",
                  value: ruleValue,
                  weight: 0.8,
                },
              ]
            : [],
        }),
      });
      const body = await response.json();
      if (!response.ok)
        throw new Error(body.error?.message ?? "Kategori oluşturulamadı.");
      const refreshed = await fetch("/api/categories").then((result) =>
        result.json(),
      );
      setCategories(refreshed.categories);
      setSelected((current) => new Set([...current, body.category.id]));
      setShowCreate(false);
      event.currentTarget.reset();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Kategori oluşturulamadı.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section className="glass-panel min-w-0 overflow-hidden rounded-3xl">
        <div className="flex flex-col gap-3 border-b border-white/[.07] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <h2 className="font-semibold">Şarkılar</h2>
            <p className="text-muted mt-1 text-xs">
              {filteredTracks.length} / {tracks.length} parça gösteriliyor
            </p>
          </div>
          <label className="flex h-11 min-w-0 items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 sm:w-72">
            <Search className="text-muted size-4" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Şarkı, sanatçı veya albüm ara"
              className="placeholder:text-muted/70 min-w-0 flex-1 bg-transparent text-sm"
            />
          </label>
        </div>
        <div className="text-muted hidden grid-cols-[44px_minmax(180px,1.2fr)_minmax(130px,.8fr)_72px] gap-3 border-b border-white/[.06] px-5 py-3 text-[10px] font-semibold tracking-[.14em] sm:grid">
          <span>#</span>
          <span>ŞARKI</span>
          <span>ALBÜM</span>
          <span>SÜRE</span>
        </div>
        <div className="divide-y divide-white/[.055]">
          {filteredTracks.map((track, index) => (
            <div
              key={track.id}
              className="grid gap-2 px-4 py-3.5 transition hover:bg-white/[.025] sm:grid-cols-[44px_minmax(180px,1.2fr)_minmax(130px,.8fr)_72px] sm:items-center sm:gap-3 sm:px-5"
            >
              <span className="text-muted hidden text-xs sm:block">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium">{track.name}</p>
                  {!track.isPlayable ? (
                    <Badge tone="danger">Pasif</Badge>
                  ) : null}
                </div>
                <p className="text-muted mt-1 truncate text-xs">
                  {track.artists.join(", ")}
                </p>
              </div>
              <p className="text-muted truncate text-xs">{track.album}</p>
              <p className="text-muted text-xs tabular-nums">
                {formatDuration(track.durationMs)}
              </p>
            </div>
          ))}
        </div>
        {filteredTracks.length === 0 ? (
          <div className="text-muted p-12 text-center text-sm">
            Aramanızla eşleşen parça yok.
          </div>
        ) : null}
      </section>

      <aside className="space-y-5 xl:sticky xl:top-10 xl:self-start">
        <section className="glass-panel rounded-3xl p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-accent text-xs font-semibold tracking-[.14em]">
                KATEGORİLER
              </p>
              <h2 className="mt-2 text-lg font-semibold">
                Neye göre ayıralım?
              </h2>
            </div>
            <button
              onClick={() => setShowCreate((value) => !value)}
              className={buttonClass("secondary", "min-h-9 px-3")}
            >
              <Plus className="size-4" />
            </button>
          </div>
          <div className="mt-4 flex gap-1 overflow-x-auto pb-1">
            {(["all", "language", "genre", "mood", "custom"] as const).map(
              (type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={cn(
                    "shrink-0 rounded-lg px-2.5 py-1.5 text-[11px] font-medium",
                    filter === type
                      ? "bg-white/10 text-white"
                      : "text-muted hover:text-white",
                  )}
                >
                  <Filter className="mr-1 inline size-3" />
                  {type === "all" ? "Tümü" : typeLabels[type]}
                </button>
              ),
            )}
          </div>
          <div className="mt-4 max-h-72 space-y-2 overflow-y-auto pr-1">
            {visibleCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => toggleCategory(category.id)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-xl border p-3 text-left transition",
                  selected.has(category.id)
                    ? "border-accent/25 bg-accent/[.075]"
                    : "border-white/[.07] bg-white/[.02] hover:bg-white/[.045]",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border",
                    selected.has(category.id)
                      ? "border-accent bg-accent text-[#07110b]"
                      : "border-white/15 text-transparent",
                  )}
                >
                  <Check className="size-3" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium">
                    {category.name}
                  </span>
                  <span className="text-muted mt-1 block truncate text-[11px]">
                    {typeLabels[category.type]} · {category.rules.length} kural
                  </span>
                </span>
              </button>
            ))}
          </div>
          {categories.length === 0 ? (
            <p className="text-muted mt-4 rounded-xl border border-dashed border-white/10 p-4 text-center text-xs">
              İlk kategorinizi oluşturun.
            </p>
          ) : null}
        </section>

        {showCreate ? (
          <form
            onSubmit={createCategory}
            className="glass-panel rounded-3xl p-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Yeni kategori</h3>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="text-muted hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <input
                name="name"
                required
                minLength={2}
                maxLength={60}
                placeholder="Örn. Pazar sabahı"
                className="placeholder:text-muted/70 h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm"
              />
              <select
                name="type"
                defaultValue="custom"
                className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-3 text-sm"
              >
                <option value="language">Dil</option>
                <option value="genre">Tür</option>
                <option value="mood">Ruh hâli</option>
                <option value="custom">Özel</option>
              </select>
              <textarea
                name="description"
                maxLength={240}
                placeholder="Kısa açıklama (opsiyonel)"
                className="placeholder:text-muted/70 min-h-20 w-full resize-none rounded-xl border border-white/10 bg-black/20 p-3 text-sm"
              />
              <div className="grid grid-cols-[110px_1fr] gap-2">
                <select
                  name="field"
                  defaultValue="title"
                  className="h-11 rounded-xl border border-white/10 bg-black/20 px-2 text-xs"
                >
                  <option value="title">Şarkı adı</option>
                  <option value="artist">Sanatçı</option>
                  <option value="album">Albüm</option>
                </select>
                <input
                  name="ruleValue"
                  maxLength={100}
                  placeholder="İçeriyorsa... (opsiyonel)"
                  className="placeholder:text-muted/70 h-11 min-w-0 rounded-xl border border-white/10 bg-black/20 px-3 text-sm"
                />
              </div>
              <Button disabled={pending} className="w-full">
                {pending ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Plus className="size-4" />
                )}{" "}
                Kategoriyi ekle
              </Button>
            </div>
          </form>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-red-300/20 bg-red-400/10 p-3 text-sm text-red-100">
            {error}
          </div>
        ) : null}
        <Button
          onClick={classify}
          disabled={pending || selected.size === 0}
          className="w-full rounded-2xl py-4"
        >
          <Sparkles className={cn("size-4", pending && "animate-spin")} />{" "}
          {pending
            ? "Sınıflandırılıyor..."
            : `${selected.size} kategoriyle sınıflandır`}
        </Button>
      </aside>
    </div>
  );
}

function formatDuration(durationMs: number) {
  const totalSeconds = Math.round(durationMs / 1000);
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, "0")}`;
}
