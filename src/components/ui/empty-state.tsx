import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="glass-panel flex min-h-64 flex-col items-center justify-center rounded-3xl px-6 text-center">
      <div className="text-muted mb-4 rounded-2xl border border-white/10 bg-white/[.04] p-3">
        <Inbox className="size-5" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-muted mt-2 max-w-md text-sm leading-6">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
