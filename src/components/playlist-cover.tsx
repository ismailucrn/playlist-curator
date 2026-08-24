/* eslint-disable @next/next/no-img-element */
import { AudioLines } from "lucide-react";
import { cn } from "@/lib/utils";

const gradients = [
  "from-[#263e35] via-[#183b32] to-[#8571b9]",
  "from-[#402d46] via-[#28334f] to-[#527f70]",
  "from-[#543933] via-[#48324f] to-[#284944]",
];

export function PlaylistCover({
  name,
  imageUrl,
  className,
}: {
  name: string;
  imageUrl: string | null;
  className?: string;
}) {
  if (imageUrl)
    return (
      <img
        src={imageUrl}
        alt={`${name} kapak görseli`}
        className={cn("bg-surface-2 object-contain", className)}
      />
    );
  const index =
    [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) %
    gradients.length;
  return (
    <div
      className={cn(
        "grid place-items-center bg-gradient-to-br",
        gradients[index],
        className,
      )}
      aria-label={`${name} için demo kapak`}
    >
      <div className="grid size-16 place-items-center rounded-3xl border border-white/15 bg-black/15 text-white/80 backdrop-blur-sm">
        <AudioLines className="size-7" />
      </div>
    </div>
  );
}
