import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-col gap-4 border-b border-line pb-5 lg:mb-8 lg:flex-row lg:items-end lg:justify-between lg:pb-6">
      <div className="max-w-2xl">
        <h1 className="font-heading text-[clamp(1.85rem,3vw,2.55rem)] font-semibold leading-[1.03] tracking-[-0.035em] text-ink">
          {title}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
          {description}
        </p>
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
}
