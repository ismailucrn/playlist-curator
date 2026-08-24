"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="glass-panel mx-auto mt-20 max-w-xl rounded-3xl p-8 text-center">
      <AlertTriangle className="mx-auto size-8 text-red-300" />
      <h2 className="mt-5 text-xl font-semibold">Bu ekran yüklenemedi</h2>
      <p className="text-muted mt-3 text-sm leading-6">
        {error.message || "Beklenmeyen bir hata oluştu."}
      </p>
      <Button onClick={reset} className="mt-6">
        <RotateCcw className="size-4" /> Yeniden dene
      </Button>
    </div>
  );
}
