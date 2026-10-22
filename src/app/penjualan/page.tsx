"use client";

import Link from "next/link";
import { useState } from "react";
import { Dialog } from "@/components/dialog";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { useToast } from "@/components/toast";
import {
  formatDate,
  formatNumber,
  formatRupiah,
  todayISO,
} from "@/lib/format";
import { useStore } from "@/lib/store";
import type { TransactionStatus } from "@/lib/types";

type StatusFilter = "semua" | TransactionStatus;

export default function SalesPage() {
  const { data, setSaleStatus } = useStore();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("semua");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const thisMonth = todayISO().slice(0, 7);
  const monthSales = data.sales.filter((sale) =>
    sale.date.startsWith(thisMonth),
  );
  const monthTotal = monthSales.reduce((sum, sale) => sum + sale.total, 0);
  const monthUnpaid = monthSales
    .filter((sale) => sale.status === "belum")
    .reduce((sum, sale) => sum + sale.total, 0);
  const filteredSales = data.sales.filter((sale) => {
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      sale.invoiceNo.toLowerCase().includes(query) ||
      sale.customerName.toLowerCase().includes(query);
    const matchesStatus =
      statusFilter === "semua" || sale.status === statusFilter;

    return matchesSearch && matchesStatus;
  });
  const selected = data.sales.find((sale) => sale.id === selectedId) ?? null;

  return (
    <>
      <PageHeader
        title="Penjualan"
        description="Semua nota penjualan, status pembayaran, dan rincian barang. Nomor nota dibuat otomatis untuk setiap transaksi."
        actions={
          <Link href="/penjualan/baru" className="btn btn-primary">
            Catat penjualan
          </Link>
        }
      />

      <div className="mb-5 flex flex-wrap gap-x-7 gap-y-2 rounded-xl border border-line bg-surface px-4 py-3 text-sm">
        <p>
          <span className="text-muted">Omzet bulan ini</span>{" "}
          <span className="font-mono font-medium text-ink">
            {formatRupiah(monthTotal)}
          </span>
        </p>
        <p>
          <span className="text-muted">Transaksi</span>{" "}
          <span className="font-mono font-medium text-ink">
            {formatNumber(monthSales.length)}
          </span>
        </p>
        <p>
          <span className="text-muted">Belum lunas bulan ini</span>{" "}
          <span className="font-mono font-medium text-ink">
            {formatRupiah(monthUnpaid)}
          </span>
        </p>
      </div>

      <section className="panel">
        <div className="border-b border-line p-4">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_200px]">
            <div>
              <label htmlFor="sales-search" className="sr-only">
                Cari nota atau pelanggan
              </label>
              <input
                id="sales-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="field"
                placeholder="Cari nomor nota atau pelanggan"
              />
            </div>
            <div>
              <label htmlFor="sales-status" className="sr-only">
                Filter status
              </label>
              <select
                id="sales-status"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as StatusFilter)
                }
                className="field"
              >
                <option value="semua">Semua status</option>
                <option value="lunas">Lunas</option>
                <option value="belum">Belum lunas</option>
              </select>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted" aria-live="polite">
            {filteredSales.length} nota ditampilkan.
          </p>
        </div>

        {data.sales.length === 0 ? (
          <EmptyState
            title="Belum ada penjualan"
            description="Catat penjualan pertama untuk membuat nota dan mengurangi stok."
            action={
              <Link href="/penjualan/baru" className="btn btn-primary">
                Catat penjualan
              </Link>
            }
          />
        ) : filteredSales.length === 0 ? (
          <EmptyState
            title="Tidak ada nota yang cocok"
            description="Ubah kata kunci atau status pembayaran untuk melihat nota lain."
          />
        ) : (
          <>
            <div className="hidden md:block">
              <table className="table-base">
                <thead>
                  <tr>
                    <th scope="col">Nota</th>
                    <th scope="col">Pelanggan</th>
                    <th scope="col">Barang</th>
                    <th scope="col">Total</th>
                    <th scope="col">Status</th>
                    <th scope="col">
                      <span className="sr-only">Tindakan</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((sale) => (
                    <tr key={sale.id}>
                      <td>
                        <p className="font-mono text-xs font-medium text-ink">
                          {sale.invoiceNo}
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          {formatDate(sale.date)}
                        </p>
                      </td>
                      <td className="max-w-48">
                        <p className="truncate text-sm font-semibold text-ink">
                          {sale.customerName}
                        </p>
                      </td>
                      <td className="text-sm text-muted">
                        {sale.items.reduce(
                          (sum, item) => sum + item.quantity,
                          0,
                        )}{" "}
                        barang
                      </td>
                      <td className="font-mono text-sm font-medium tabular-nums text-ink">
                        {formatRupiah(sale.total)}
                      </td>
                      <td>
                        <StatusBadge
                          tone={sale.status === "lunas" ? "lunas" : "belum"}
                        />
                      </td>
                      <td>
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => setSelectedId(sale.id)}
                            className="inline-flex min-h-11 items-center rounded-lg px-2.5 text-xs font-semibold text-clay transition-colors hover:bg-clay-soft hover:text-clay-dark"
                          >
                            Lihat detail
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="md:hidden" aria-label="Daftar nota penjualan">
              {filteredSales.map((sale) => (
                <li key={sale.id} className="mobile-data-card">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs font-medium text-ink">
                        {sale.invoiceNo}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {formatDate(sale.date)}
                      </p>
                    </div>
                    <StatusBadge
                      tone={sale.status === "lunas" ? "lunas" : "belum"}
                    />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-ink">
                    {sale.customerName}
                  </p>
                  <div className="mt-2 flex items-end justify-between gap-3">
                    <p className="text-xs text-muted">
                      {sale.items.reduce(
                        (sum, item) => sum + item.quantity,
                        0,
                      )}{" "}
                      barang
                    </p>
                    <p className="font-mono text-sm font-medium tabular-nums text-ink">
                      {formatRupiah(sale.total)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedId(sale.id)}
                    className="mt-2 inline-flex min-h-11 items-center rounded-lg text-xs font-semibold text-clay hover:underline"
                  >
                    Lihat detail
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <Dialog
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected ? `Nota ${selected.invoiceNo}` : "Detail nota"}
      >
        {selected ? (
          <div>
            <div className="grid grid-cols-2 gap-4 rounded-xl bg-surface-soft p-4">
              <div>
                <p className="text-xs text-muted">Pelanggan</p>
                <p className="mt-1 text-sm font-semibold text-ink">
                  {selected.customerName}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted">Tanggal</p>
                <p className="mt-1 text-sm font-semibold text-ink">
                  {formatDate(selected.date)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted">Status</p>
                <div className="mt-1">
                  <StatusBadge
                    tone={selected.status === "lunas" ? "lunas" : "belum"}
                  />
                </div>
              </div>
              <div>
                <p className="text-xs text-muted">Jumlah barang</p>
                <p className="mt-1 font-mono text-sm font-medium text-ink">
                  {selected.items.reduce(
                    (sum, item) => sum + item.quantity,
                    0,
                  )}{" "}
                  barang
                </p>
              </div>
            </div>

            <div className="mt-4 divide-y divide-line border-y border-line">
              {selected.items.map((item, index) => (
                <div
                  key={`${selected.id}-${item.productId}-${index}`}
                  className="flex items-start justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink">
                      {item.productName}
                    </p>
                    <p className="mt-0.5 font-mono text-xs text-muted">
                      {formatNumber(item.quantity)} {item.unit} x{" "}
                      {formatRupiah(item.unitPrice)}
                    </p>
                  </div>
                  <p className="shrink-0 font-mono text-sm font-medium tabular-nums text-ink">
                    {formatRupiah(item.quantity * item.unitPrice)}
                  </p>
                </div>
              ))}
            </div>

            <dl className="mt-4">
              <div className="summary-row">
                <dt>Subtotal</dt>
                <dd>
                  {formatRupiah(selected.total + selected.discount)}
                </dd>
              </div>
              <div className="summary-row">
                <dt>Diskon</dt>
                <dd>{formatRupiah(selected.discount)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3 border-t border-line pt-3">
                <dt className="text-sm font-semibold text-ink">Total</dt>
                <dd className="font-heading text-xl font-semibold tracking-[-0.02em] tabular-nums text-ink">
                  {formatRupiah(selected.total)}
                </dd>
              </div>
            </dl>

            {selected.note ? (
              <div className="mt-4 rounded-lg bg-surface-soft p-3">
                <p className="text-xs font-semibold text-muted">Catatan</p>
                <p className="mt-1 text-sm leading-relaxed text-ink">
                  {selected.note}
                </p>
              </div>
            ) : null}

            <div className="mt-4 border-t border-line pt-4">
              <p className="font-mono text-[0.68rem] font-medium text-ink">
                {data.settings.storeName}
              </p>
              {data.settings.receiptNote ? (
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  {data.settings.receiptNote}
                </p>
              ) : null}
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="btn btn-secondary"
              >
                Tutup
              </button>
              {selected.status === "belum" ? (
                <button
                  type="button"
                  onClick={() => {
                    setSaleStatus(selected.id, "lunas");
                    showToast(`Nota ${selected.invoiceNo} ditandai lunas.`);
                  }}
                  className="btn btn-primary"
                >
                  Tandai lunas
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </Dialog>
    </>
  );
}
