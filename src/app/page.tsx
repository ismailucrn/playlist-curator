import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Layers3,
  ListMusic,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { getCurrentUser } from "@/auth/session";
import { Brand } from "@/components/brand";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { env, spotifyConfigured } from "@/lib/env";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    message?: string;
    disconnected?: string;
  }>;
}) {
  const [user, query] = await Promise.all([getCurrentUser(), searchParams]);
  return (
    <main className="noise-grid min-h-screen overflow-hidden">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8 lg:px-10">
        <Brand />
        <div className="flex items-center gap-2">
          <Badge tone="accent">Kişisel MVP</Badge>
          {user ? (
            <Link
              href="/dashboard"
              className={buttonClass("secondary", "hidden sm:inline-flex")}
            >
              Dashboard <ArrowRight className="size-4" />
            </Link>
          ) : null}
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-14 px-5 pt-14 pb-20 sm:px-8 lg:grid-cols-[1.06fr_.94fr] lg:px-10 lg:pt-24 lg:pb-28">
        <div className="fade-up flex flex-col items-start">
          <Badge tone="violet" className="mb-6">
            Açıklanabilir sınıflandırma · İnsan kontrolünde
          </Badge>
          <h1 className="max-w-3xl text-5xl leading-[.98] font-semibold tracking-[-.055em] text-balance sm:text-6xl lg:text-7xl">
            Çalma listenizdeki{" "}
            <span className="text-accent">doğru şarkıyı</span> bulun.
          </h1>
          <p className="text-muted mt-7 max-w-xl text-base leading-7 sm:text-lg sm:leading-8">
            Şarkıları dil, tür, ruh hâli veya kendi kategorilerinize ayırın. Her
            önerinin güven puanını görün, son sözü siz söyleyin.
          </p>

          {query.error ? (
            <div className="mt-6 w-full max-w-xl rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
              {query.error === "spotify-not-configured"
                ? "Spotify bağlantısı henüz yapılandırılmamış. Demo moduyla tüm akışı deneyebilirsiniz."
                : (query.message ?? "Spotify bağlantısı tamamlanamadı.")}
            </div>
          ) : null}
          {query.disconnected ? (
            <div className="border-accent/20 bg-accent/10 text-accent mt-6 rounded-2xl border px-4 py-3 text-sm">
              Spotify bağlantısı kaldırıldı.
            </div>
          ) : null}

          <div className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            {user ? (
              <Link
                href="/dashboard"
                className={buttonClass("primary", "px-6")}
              >
                Listelerime git <ArrowRight className="size-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/api/auth/spotify/start"
                  className={buttonClass("primary", "px-6")}
                >
                  Spotify ile bağlan <ArrowRight className="size-4" />
                </Link>
                {env.DEMO_MODE ? (
                  <form action="/api/auth/demo" method="post">
                    <button className={buttonClass("secondary", "w-full px-6")}>
                      Demo&apos;yu aç
                    </button>
                  </form>
                ) : null}
              </>
            )}
          </div>
          <div className="text-muted mt-5 flex items-center gap-2 text-xs">
            <ShieldCheck className="text-accent size-4" /> Token&apos;lar
            tarayıcıya gönderilmez · Spotify içeriği AI modeline aktarılmaz
          </div>
        </div>

        <div
          className="fade-up relative lg:pl-6"
          style={{ animationDelay: "100ms" }}
        >
          <div className="bg-accent/[.035] absolute -inset-8 -z-10 rounded-full blur-3xl" />
          <div className="glass-panel rounded-[2rem] p-4 sm:p-6">
            <div className="flex items-center justify-between border-b border-white/[.07] px-2 pb-5">
              <div>
                <p className="text-muted text-xs font-semibold tracking-[.16em]">
                  GECE YOLCULUĞU
                </p>
                <p className="mt-1 text-sm text-white">8 parça · 3 kategori</p>
              </div>
              <div className="flex -space-x-2">
                <span className="border-surface grid size-8 place-items-center rounded-full border-2 bg-[#355a4a] text-[10px]">
                  TR
                </span>
                <span className="border-surface grid size-8 place-items-center rounded-full border-2 bg-[#524978] text-[10px]">
                  EN
                </span>
                <span className="border-surface grid size-8 place-items-center rounded-full border-2 bg-[#664739] text-[10px]">
                  ES
                </span>
              </div>
            </div>
            <div className="space-y-3 pt-5">
              {[
                [
                  "Midnight Avenue",
                  "The Satellites",
                  "Gece Sürüşü",
                  "94%",
                  "bg-accent",
                ],
                ["Yavaşça", "Ada", "Sakin", "87%", "bg-violet"],
                [
                  "Dream Circuit",
                  "Soft Voltage",
                  "Elektronik",
                  "81%",
                  "bg-[#ffb982]",
                ],
                [
                  "Luna Tranquila",
                  "Mar Azul",
                  "İspanyolca",
                  "76%",
                  "bg-[#7ecaff]",
                ],
              ].map(([name, artist, category, score, color], index) => (
                <div
                  key={name}
                  className="flex items-center gap-3 rounded-2xl border border-white/[.055] bg-white/[.025] p-3.5"
                >
                  <span
                    className={`grid size-10 shrink-0 place-items-center rounded-xl ${color} text-xs font-bold text-[#09100d]`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{name}</p>
                    <p className="text-muted truncate text-xs">{artist}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-accent text-xs font-semibold">{score}</p>
                    <p className="text-muted mt-1 text-[10px]">{category}</p>
                  </div>
                  <CheckCircle2 className="text-accent size-4" />
                </div>
              ))}
            </div>
            <div className="bg-accent mt-5 flex items-center justify-between rounded-2xl px-4 py-3 text-[#08110c]">
              <span className="text-sm font-semibold">Yeni liste hazır</span>
              <span className="text-xs font-bold">4 parça →</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8 lg:px-10">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-accent text-xs font-semibold tracking-[.18em]">
              NASIL ÇALIŞIR?
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-.035em]">
              Üç adımda daha düzenli listeler.
            </h2>
          </div>
          <p className="text-muted hidden max-w-sm text-right text-sm leading-6 md:block">
            Demo provider ile hemen deneyin; daha sonra kendi yasal metadata
            kaynağınızı bağlayın.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            [
              ListMusic,
              "01",
              "Listenizi seçin",
              "Sahibi veya işbirlikçisi olduğunuz Spotify listelerinden başlayın.",
            ],
            [
              Layers3,
              "02",
              "Kategorileri kurun",
              "Dil, tür, ruh hâli veya tamamen size özel başlıklar oluşturun.",
            ],
            [
              Sparkles,
              "03",
              "Kontrol edip aktarın",
              "Puanları inceleyin, önerileri kabul edin ve özel bir Spotify listesi oluşturun.",
            ],
          ].map(([Icon, number, title, description]) => {
            const StepIcon = Icon as typeof ListMusic;
            return (
              <article
                key={String(number)}
                className="glass-panel rounded-3xl p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="text-accent grid size-11 place-items-center rounded-2xl border border-white/10 bg-white/[.04]">
                    <StepIcon className="size-5" />
                  </span>
                  <span className="text-muted text-xs font-semibold tracking-[.18em]">
                    {String(number)}
                  </span>
                </div>
                <h3 className="mt-8 text-lg font-semibold">{String(title)}</h3>
                <p className="text-muted mt-2 text-sm leading-6">
                  {String(description)}
                </p>
              </article>
            );
          })}
        </div>
        {!spotifyConfigured ? (
          <p className="text-muted mt-6 text-center text-xs">
            Spotify anahtarları yapılandırılmadı; bağlantı düğmesi yerine demo
            modu tamamen kullanılabilir.
          </p>
        ) : null}
      </section>
    </main>
  );
}
