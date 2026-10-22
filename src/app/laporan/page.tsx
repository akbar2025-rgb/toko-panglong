"use client";

import { useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { SalesBarChart } from "@/components/sales-bar-chart";
import { useToast } from "@/components/toast";
import {
  addDays,
  countDays,
  formatDate,
  formatNumber,
  formatRupiah,
  isDateInRange,
  startOfMonthISO,
  todayISO,
} from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Sale } from "@/lib/types";

function saleCost(sale: Sale) {
  return sale.items.reduce(
    (sum, item) => sum + item.quantity * item.costPrice,
    0,
  );
}

function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

export default function ReportsPage() {
  const { data } = useStore();
  const { showToast } = useToast();
  const [start, setStart] = useState(startOfMonthISO());
  const [end, setEnd] = useState(todayISO());

  const rangeIsOrdered = start <= end;
  const rangeDays = rangeIsOrdered ? countDays(start, end) : 0;
  const rangeError = !rangeIsOrdered
    ? "Tanggal akhir harus setelah tanggal mulai."
    : rangeDays > 31
      ? "Rentang laporan maksimal 31 hari agar grafik dan tabel tetap terbaca."
      : "";

  const sales = rangeError
    ? []
    : data.sales.filter((sale) => isDateInRange(sale.date, start, end));
  const purchases = rangeError
    ? []
    : data.purchases.filter((purchase) =>
        isDateInRange(purchase.date, start, end),
      );
  const revenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const grossProfit = sales.reduce(
    (sum, sale) => sum + sale.total - saleCost(sale),
    0,
  );
  const purchaseTotal = purchases.reduce(
    (sum, purchase) => sum + purchase.total,
    0,
  );
  const receivables = sales
    .filter((sale) => sale.status === "belum")
    .reduce((sum, sale) => sum + sale.total, 0);

  const points = rangeError
    ? []
    : Array.from({ length: rangeDays }, (_, index) => {
        const date = addDays(start, index);
        const value = data.sales
          .filter((sale) => sale.date === date)
          .reduce((sum, sale) => sum + sale.total, 0);
        return { date, value };
      });

  const productMap = new Map<
    string,
    {
      productId: string;
      name: string;
      unit: string;
      quantity: number;
      revenue: number;
      profit: number;
    }
  >();

  sales.forEach((sale) => {
    sale.items.forEach((item) => {
      const current = productMap.get(item.productId);
      const lineRevenue = item.quantity * item.unitPrice;
      const lineProfit = item.quantity * (item.unitPrice - item.costPrice);

      productMap.set(item.productId, {
        productId: item.productId,
        name: current?.name ?? item.productName,
        unit: current?.unit ?? item.unit,
        quantity: (current?.quantity ?? 0) + item.quantity,
        revenue: (current?.revenue ?? 0) + lineRevenue,
        profit: (current?.profit ?? 0) + lineProfit,
      });
    });
  });

  const topProducts = [...productMap.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  function resetRange() {
    setStart(startOfMonthISO());
    setEnd(todayISO());
  }

  function downloadCsv() {
    if (rangeError || sales.length === 0) {
      return;
    }

    const rows = [
      ["Nota", "Tanggal", "Pelanggan", "Status", "Total", "Laba kotor"],
      ...sales.map((sale) => [
        sale.invoiceNo,
        sale.date,
        sale.customerName,
        sale.status === "lunas" ? "Lunas" : "Belum lunas",
        String(sale.total),
        String(sale.total - saleCost(sale)),
      ]),
    ];
    const csv = rows
      .map((row) => row.map((cell) => csvCell(cell)).join(";"))
      .join("\r\n");
    const blob = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `laporan-penjualan-${start}-${end}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast("CSV laporan penjualan diunduh.");
  }

  return (
    <>
      <PageHeader
        title="Laporan"
        description="Lihat omzet, laba kotor, pembelian, dan barang paling laku pada rentang tanggal tertentu. Data berasal dari transaksi contoh di browser ini."
        actions={
          <button
            type="button"
            onClick={downloadCsv}
            disabled={Boolean(rangeError) || sales.length === 0}
            className="btn btn-secondary"
          >
            Unduh CSV
          </button>
        }
      />

      <section className="panel mb-5 p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
          <div>
            <label htmlFor="report-start" className="field-label">
              Mulai
            </label>
            <input
              id="report-start"
              type="date"
              value={start}
              max={end}
              onChange={(event) => setStart(event.target.value)}
              className="field font-mono"
            />
          </div>
          <div>
            <label htmlFor="report-end" className="field-label">
              Sampai
            </label>
            <input
              id="report-end"
              type="date"
              value={end}
              min={start}
              max={todayISO()}
              onChange={(event) => setEnd(event.target.value)}
              className="field font-mono"
            />
          </div>
          <button
            type="button"
            onClick={resetRange}
            className="btn btn-secondary sm:mb-0"
          >
            Bulan ini
          </button>
        </div>
        {rangeError ? (
          <p role="alert" className="field-error mt-3">
            {rangeError}
          </p>
        ) : (
          <p className="mt-3 text-xs text-muted">
            Menampilkan {rangeDays} hari, {formatDate(start)} sampai{" "}
            {formatDate(end)}.
          </p>
        )}
      </section>

      {rangeError ? (
        <section className="panel">
          <EmptyState
            title="Rentang tanggal belum sesuai"
            description={rangeError}
            action={
              <button
                type="button"
                onClick={resetRange}
                className="btn btn-primary"
              >
                Pakai bulan ini
              </button>
            }
          />
        </section>
      ) : (
        <>
          <section className="panel mb-5">
            <dl className="grid grid-cols-2 divide-line sm:grid-cols-4 sm:divide-x">
              <div className="border-b border-line p-4 sm:border-b-0 sm:p-5">
                <dt className="text-xs text-muted">Omzet penjualan</dt>
                <dd className="mt-1.5 font-heading text-lg font-semibold tracking-[-0.03em] tabular-nums text-ink sm:text-2xl">
                  {formatRupiah(revenue)}
                </dd>
              </div>
              <div className="border-b border-line p-4 sm:border-b-0 sm:p-5">
                <dt className="text-xs text-muted">Laba kotor</dt>
                <dd className="mt-1.5 font-heading text-lg font-semibold tracking-[-0.03em] tabular-nums text-ink sm:text-2xl">
                  {formatRupiah(grossProfit)}
                </dd>
              </div>
              <div className="p-4 sm:p-5">
                <dt className="text-xs text-muted">Pembelian</dt>
                <dd className="mt-1.5 font-heading text-lg font-semibold tracking-[-0.03em] tabular-nums text-ink sm:text-2xl">
                  {formatRupiah(purchaseTotal)}
                </dd>
              </div>
              <div className="p-4 sm:p-5">
                <dt className="text-xs text-muted">Nota penjualan</dt>
                <dd className="mt-1.5 font-heading text-lg font-semibold tracking-[-0.03em] tabular-nums text-ink sm:text-2xl">
                  {formatNumber(sales.length)}
                </dd>
                <dd className="mt-1 font-mono text-xs text-muted">
                  <span className="block">Piutang</span>
                  <span className="block tabular-nums">
                    {formatRupiah(receivables)}
                  </span>
                </dd>
              </div>
            </dl>
          </section>

          {sales.length === 0 ? (
            <section className="panel">
              <EmptyState
                title="Belum ada penjualan pada rentang ini"
                description="Pilih rentang tanggal lain atau catat penjualan untuk mengisi laporan."
                action={
                  <button
                    type="button"
                    onClick={resetRange}
                    className="btn btn-primary"
                  >
                    Pakai bulan ini
                  </button>
                }
              />
            </section>
          ) : (
            <div className="grid min-w-0 gap-5">
              <section className="panel min-w-0 p-5 sm:p-6">
                <SalesBarChart
                  points={points}
                  title="Omzet harian"
                  totalLabel={`Total ${formatRupiah(revenue)} dari ${sales.length} nota.`}
                />
              </section>

              <section className="panel">
                <div className="panel-head">
                  <div>
                    <h2 className="panel-title">Barang paling laku</h2>
                    <p className="mt-1 text-xs text-muted">
                      Diurutkan dari omzet terbesar pada rentang ini.
                    </p>
                  </div>
                  <p className="font-mono text-xs text-muted">
                    {topProducts.length} barang
                  </p>
                </div>

                {topProducts.length === 0 ? (
                  <EmptyState
                    title="Belum ada barang terjual"
                    description="Barang yang terjual akan muncul di sini setelah ada nota."
                  />
                ) : (
                  <>
                    <div className="hidden md:block">
                      <table className="table-base">
                        <thead>
                          <tr>
                            <th scope="col">Barang</th>
                            <th scope="col">Terjual</th>
                            <th scope="col">Omzet</th>
                            <th scope="col">Laba kotor</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topProducts.map((product) => (
                            <tr key={product.productId}>
                              <td className="font-semibold text-ink">
                                {product.name}
                              </td>
                              <td className="font-mono text-sm tabular-nums text-ink">
                                {formatNumber(product.quantity)} {product.unit}
                              </td>
                              <td className="font-mono text-sm tabular-nums text-ink">
                                {formatRupiah(product.revenue)}
                              </td>
                              <td className="font-mono text-sm tabular-nums text-ink">
                                {formatRupiah(product.profit)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="md:hidden">
                      {topProducts.map((product) => (
                        <article
                          key={product.productId}
                          className="border-b border-line p-4 last:border-b-0"
                        >
                          <p className="text-sm font-semibold text-ink">
                            {product.name}
                          </p>
                          <div className="mt-2 flex items-baseline justify-between gap-3">
                            <p className="font-mono text-xs text-muted">
                              {formatNumber(product.quantity)} {product.unit}
                            </p>
                            <p className="font-mono text-sm font-medium tabular-nums text-ink">
                              {formatRupiah(product.revenue)}
                            </p>
                          </div>
                          <p className="mt-1 font-mono text-xs text-muted">
                            Laba {formatRupiah(product.profit)}
                          </p>
                        </article>
                      ))}
                    </div>
                  </>
                )}
              </section>
            </div>
          )}
        </>
      )}
    </>
  );
}
