import Link from "next/link";
import { AudioWaveform } from "lucide-react";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-3 text-white">
      <span className="bg-accent grid size-10 place-items-center rounded-xl text-[#07110b] shadow-[0_0_28px_rgba(159,245,194,.18)]">
        <AudioWaveform className="size-5" strokeWidth={2.4} />
      </span>
      {!compact ? (
        <span className="leading-none">
          <span className="block text-sm font-bold tracking-[-.02em]">
            PLAYLIST
          </span>
          <span className="text-muted mt-1 block text-[10px] font-semibold tracking-[.24em]">
            CURATOR
          </span>
        </span>
      ) : null}
    </Link>
  );
}
