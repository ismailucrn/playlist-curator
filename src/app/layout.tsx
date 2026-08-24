import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Playlist Curator", template: "%s · Playlist Curator" },
  description: "Çalma listelerini açıklanabilir kategorilerle yeniden düzenle.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
