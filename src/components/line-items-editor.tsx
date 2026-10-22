"use client";

import { formatNumber, formatRupiah, productDisplayName } from "@/lib/format";
import type { Product } from "@/lib/types";

export type LineDraft = {
  key: string;
  productId: string;
  quantity: string;
  unitPrice: string;
};

export function makeLineDraft(
  products: Product[],
  mode: "sale" | "purchase",
): LineDraft {
  const product = products.find((entry) =>
    mode === "sale" ? entry.stock > 0 : true,
  );

  return {
    key: `line-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    productId: product?.id ?? "",
    quantity: "1",
    unitPrice: String(
      product
        ? mode === "sale"
          ? product.sellPrice
          : product.costPrice
        : 0,
    ),
  };
}

export function LineItemsEditor({
  lines,
  onChange,
  products,
  mode,
}: {
  lines: LineDraft[];
  onChange: (lines: LineDraft[]) => void;
  products: Product[];
  mode: "sale" | "purchase";
}) {
  const priceLabel = mode === "sale" ? "Harga jual" : "Harga beli";

  function updateLine(key: string, patch: Partial<LineDraft>) {
    onChange(
      lines.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    );
  }

  function selectProduct(key: string, productId: string) {
    const product = products.find((entry) => entry.id === productId);
    updateLine(key, {
      productId,
      unitPrice: String(
        product
          ? mode === "sale"
            ? product.sellPrice
            : product.costPrice
          : 0,
      ),
    });
  }

  function removeLine(key: string) {
    if (lines.length <= 1) {
      return;
    }

    onChange(lines.filter((line) => line.key !== key));
  }

  return (
    <div>
      <div className="hidden gap-3 border-b border-line px-4 py-2.5 text-[0.7rem] font-semibold text-muted md:grid md:grid-cols-[minmax(0,1fr)_88px_132px_128px_76px]">
        <span>Barang</span>
        <span>Jumlah</span>
        <span>{priceLabel}</span>
        <span className="text-right">Subtotal</span>
        <span className="text-right">Tindakan</span>
      </div>

      <ul>
        {lines.map((line, index) => {
          const product = products.find(
            (entry) => entry.id === line.productId,
          );
          const quantity = Number(line.quantity);
          const unitPrice = Number(line.unitPrice);
          const subtotal =
            Number.isFinite(quantity) && Number.isFinite(unitPrice)
              ? Math.max(0, quantity) * Math.max(0, unitPrice)
              : 0;

          return (
            <li
              key={line.key}
              className="border-b border-line px-4 py-4 last:border-b-0"
            >
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_88px_132px_128px_76px] md:items-start">
                <div>
                  <label
                    htmlFor={`${line.key}-product`}
                    className="field-label md:sr-only"
                  >
                    Barang {index + 1}
                  </label>
                  <select
                    id={`${line.key}-product`}
                    value={line.productId}
                    onChange={(event) =>
                      selectProduct(line.key, event.target.value)
                    }
                    className="field"
                  >
                    <option value="">Pilih barang</option>
                    {products.map((entry) => (
                      <option
                        key={entry.id}
                        value={entry.id}
                        disabled={mode === "sale" && entry.stock <= 0}
                      >
                        {productDisplayName(
                          entry.name,
                          entry.dimension,
                          entry.length,
                        )}
                        {mode === "sale"
                          ? ` (stok ${entry.stock} ${entry.unit})`
                          : ""}
                      </option>
                    ))}
                  </select>
                  {product ? (
                    <p className="field-help">
                      Stok saat ini {formatNumber(product.stock)} {product.unit}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor={`${line.key}-quantity`}
                    className="field-label md:sr-only"
                  >
                    Jumlah
                  </label>
                  <input
                    id={`${line.key}-quantity`}
                    type="number"
                    inputMode="numeric"
                    min="1"
                    step="1"
                    value={line.quantity}
                    onChange={(event) =>
                      updateLine(line.key, { quantity: event.target.value })
                    }
                    className="field font-mono"
                  />
                </div>

                <div>
                  <label
                    htmlFor={`${line.key}-price`}
                    className="field-label md:sr-only"
                  >
                    {priceLabel}
                  </label>
                  <input
                    id={`${line.key}-price`}
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1000"
                    value={line.unitPrice}
                    onChange={(event) =>
                      updateLine(line.key, { unitPrice: event.target.value })
                    }
                    className="field font-mono"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 md:block md:text-right">
                  <span className="text-xs text-muted md:hidden">Subtotal</span>
                  <span className="font-mono text-sm font-medium tabular-nums text-ink md:mt-3 md:inline-block">
                    {formatRupiah(subtotal)}
                  </span>
                </div>

                <div className="md:text-right">
                  <button
                    type="button"
                    onClick={() => removeLine(line.key)}
                    disabled={lines.length <= 1}
                    className="inline-flex min-h-11 items-center rounded-lg px-2.5 text-xs font-semibold text-danger transition-colors hover:bg-danger-soft disabled:cursor-not-allowed disabled:text-muted disabled:hover:bg-transparent"
                    aria-label={`Hapus baris ${index + 1}`}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="border-t border-line px-4 py-3">
        <button
          type="button"
          onClick={() => onChange([...lines, makeLineDraft(products, mode)])}
          className="inline-flex min-h-11 items-center rounded-lg px-2.5 text-sm font-semibold text-clay transition-colors hover:bg-clay-soft hover:text-clay-dark"
        >
          + Tambah baris
        </button>
      </div>
    </div>
  );
}
