import type { ReactNode } from "react";

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
    <div className="flex flex-col items-start px-5 py-10 sm:px-6">
      <p className="font-mono text-[0.7rem] font-medium text-muted">Kosong</p>
      <h2 className="mt-2 font-heading text-xl font-semibold tracking-[-0.02em] text-ink">
        {title}
      </h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
