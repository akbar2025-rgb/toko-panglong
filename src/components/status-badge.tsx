type BadgeTone = "lunas" | "belum" | "aman" | "menipis" | "habis";

const styles: Record<BadgeTone, { className: string; label: string }> = {
  lunas: { className: "bg-moss-soft text-moss", label: "Lunas" },
  belum: { className: "bg-amber-soft text-amber", label: "Belum lunas" },
  aman: { className: "bg-moss-soft text-moss", label: "Aman" },
  menipis: { className: "bg-amber-soft text-amber", label: "Stok menipis" },
  habis: { className: "bg-danger-soft text-danger", label: "Stok habis" },
};

export function StatusBadge({
  tone,
  label,
}: {
  tone: BadgeTone;
  label?: string;
}) {
  const badge = styles[tone];

  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${badge.className}`}
    >
      {label ?? badge.label}
    </span>
  );
}

export function stockTone(stock: number, minStock: number): BadgeTone {
  if (stock <= 0) {
    return "habis";
  }

  if (stock <= minStock) {
    return "menipis";
  }

  return "aman";
}
