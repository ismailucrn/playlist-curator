"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, LoaderCircle } from "lucide-react";
import type { ClassificationProviderId } from "@/domain/models";
import { cn } from "@/lib/utils";

const providers: {
  id: ClassificationProviderId;
  name: string;
  description: string;
}[] = [
  {
    id: "demo",
    name: "Demo provider",
    description:
      "Geliştirme için deterministik, sahte ve açıklanabilir puanlar.",
  },
  {
    id: "rule-based",
    name: "Kural tabanlı",
    description: "Yerel eşleşme kuralları ve kabul ettiğiniz geçmiş etiketler.",
  },
];

export function SettingsClient({ activeProvider }: { activeProvider: string }) {
  const router = useRouter();
  const [active, setActive] = useState(activeProvider);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function choose(provider: ClassificationProviderId) {
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/settings/provider", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });
      const body = await response.json();
      if (!response.ok)
        throw new Error(body.error?.message ?? "Provider değiştirilemedi.");
      setActive(provider);
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Provider değiştirilemedi.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <div className="space-y-3">
        {providers.map((provider) => (
          <button
            key={provider.id}
            disabled={pending}
            onClick={() => choose(provider.id)}
            className={cn(
              "flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition",
              active === provider.id
                ? "border-accent/25 bg-accent/[.07]"
                : "border-white/[.07] bg-white/[.025] hover:bg-white/[.045]",
            )}
          >
            <span
              className={cn(
                "mt-0.5 grid size-6 shrink-0 place-items-center rounded-lg border",
                active === provider.id
                  ? "border-accent bg-accent text-[#07110b]"
                  : "border-white/10 text-transparent",
              )}
            >
              {pending && active !== provider.id ? (
                <LoaderCircle className="size-3.5 animate-spin" />
              ) : (
                <Check className="size-3.5" />
              )}
            </span>
            <span>
              <span className="block text-sm font-semibold">
                {provider.name}
              </span>
              <span className="text-muted mt-1 block text-xs leading-5">
                {provider.description}
              </span>
            </span>
          </button>
        ))}
      </div>
      {error ? <p className="mt-3 text-xs text-red-200">{error}</p> : null}
    </div>
  );
}
