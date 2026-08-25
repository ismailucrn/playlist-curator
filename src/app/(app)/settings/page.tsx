import Link from "next/link";
import {
  Beaker,
  ExternalLink,
  KeyRound,
  Link2Off,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { requireCurrentUser } from "@/auth/session";
import { SettingsClient } from "@/components/settings-client";
import { Badge } from "@/components/ui/badge";
import { buttonClass } from "@/components/ui/button";
import { spotifyConfigured } from "@/lib/env";

export const metadata = { title: "Ayarlar" };

export default async function SettingsPage() {
  const user = await requireCurrentUser();
  const connected = user.mode === "spotify" && Boolean(user.spotifyAccount);
  return (
    <div className="fade-up max-w-5xl">
      <Badge tone="violet">Uygulama ayarları</Badge>
      <h1 className="mt-4 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">
        Ayarlar
      </h1>
      <p className="text-muted mt-2 text-sm leading-6">
        Bağlantınızı ve sınıflandırma davranışını yönetin.
      </p>
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section className="glass-panel rounded-3xl p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="bg-accent/10 text-accent grid size-11 place-items-center rounded-2xl">
                <KeyRound className="size-5" />
              </span>
              <div>
                <h2 className="font-semibold">Spotify bağlantısı</h2>
                <p className="text-muted mt-1 text-xs">
                  OAuth ve erişim durumu
                </p>
              </div>
            </div>
            <Badge tone={connected ? "accent" : "violet"}>
              {connected ? "Bağlı" : "Demo"}
            </Badge>
          </div>
          <div className="mt-6 rounded-2xl border border-white/[.07] bg-white/[.025] p-4">
            <p className="text-sm font-medium">{user.displayName}</p>
            <p className="text-muted mt-1 text-xs leading-5">
              {connected
                ? "Access token yalnızca sunucuda şifreli saklanıyor. Refresh token altı ay sonra yeniden yetkilendirme gerektirir."
                : spotifyConfigured
                  ? "Spotify bağlantısı hazır; istediğiniz zaman gerçek hesabınızı bağlayabilirsiniz."
                  : "Spotify ortam değişkenleri eklenmedi. Tüm demo özellikleri kullanılabilir."}
            </p>
          </div>
          <div className="mt-3 rounded-2xl border border-emerald-300/15 bg-emerald-300/[.05] p-4">
            <p className="text-xs font-semibold text-emerald-200">
              Mevcut listeleriniz korunur
            </p>
            <p className="text-muted mt-1 text-xs leading-5">
              Uygulama playlist silme, takibi bırakma veya mevcut listeyi
              değiştirme isteği gönderemez. Yalnızca yeni özel liste oluşturup
              seçtiğiniz parçaları o listeye ekleyebilir.
            </p>
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            {!connected ? (
              <Link
                href="/api/auth/spotify/start"
                className={buttonClass("primary", "flex-1")}
              >
                Spotify ile bağlan <ExternalLink className="size-4" />
              </Link>
            ) : (
              <form
                action="/api/auth/spotify/disconnect"
                method="post"
                className="flex-1"
              >
                <button className={buttonClass("danger", "w-full")}>
                  <Link2Off className="size-4" /> Bağlantıyı kaldır
                </button>
              </form>
            )}
            <form action="/api/auth/logout" method="post" className="flex-1">
              <button className={buttonClass("secondary", "w-full")}>
                <LogOut className="size-4" /> Çıkış yap
              </button>
            </form>
          </div>
        </section>
        <section className="glass-panel rounded-3xl p-6">
          <div className="flex items-center gap-3">
            <span className="bg-violet/10 text-violet grid size-11 place-items-center rounded-2xl">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <h2 className="font-semibold">Sınıflandırma provider&apos;ı</h2>
              <p className="text-muted mt-1 text-xs">
                Yeni çalışmalarda kullanılacak kaynak
              </p>
            </div>
          </div>
          <div className="mt-6">
            <SettingsClient activeProvider={user.activeProvider} />
          </div>
        </section>
        <section className="glass-panel rounded-3xl p-6 lg:col-span-2">
          <div className="flex gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#ffb982]/10 text-[#ffb982]">
              <Beaker className="size-5" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold">Deneysel yazılım</h2>
                <Badge>v0.1 MVP</Badge>
              </div>
              <p className="text-muted mt-2 max-w-3xl text-sm leading-6">
                Playlist Curator kusursuz bir müzik sınıflandırma modeli
                değildir. Sonuçlar öneridir ve kullanıcı kontrolü gerektirir.
                Spotify içeriği LLM veya başka bir yapay zekâ modeline
                gönderilmez; gerçek metadata entegrasyonları yalnızca kullanımı
                yasal sağlayıcı adapter&apos;ları üzerinden eklenmelidir.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
