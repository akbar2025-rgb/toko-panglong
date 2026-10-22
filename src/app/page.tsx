"use client";

import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { SalesBarChart } from "@/components/sales-bar-chart";
import { StatusBadge, stockTone } from "@/components/status-badge";
import { useStore } from "@/lib/store";
import {
  addDays,
  formatDateLong,
  formatRupiah,
  productDisplayName,
  todayISO,
} from "@/lib/format";

export default function DashboardPage() {
  const { data } = useStore();
  const today = todayISO();
  const todaySales = data.sales.filter((sale) => sale.date === today);
  const todayTotal = todaySales.reduce((sum, sale) => sum + sale.total, 0);
  const unpaidSales = data.sales.filter((sale) => sale.status === "belum");
  const unpaidTotal = unpaidSales.reduce((sum, sale) => sum + sale.total, 0);
  const lowStock = data.products
    .filter((product) => product.stock <= product.minStock)
    .sort(
      (a, b) =>
        a.stock / Math.max(a.minStock, 1) - b.stock / Math.max(b.minStock, 1),
    );
  const outOfStock = lowStock.filter((product) => product.stock <= 0).length;
  const recentSales = [...data.sales]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);
  const weekPoints = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(today, index - 6);
    const value = data.sales
      .filter((sale) => sale.date === date)
      .reduce((sum, sale) => sum + sale.total, 0);

    return { date, value };
  });
  const weekTotal = weekPoints.reduce((sum, point) => sum + point.value, 0);

  return (
    <>
      <PageHeader
        title="Ringkasan"
        description={`${formatDateLong(today)}. Angka di halaman ini dihitung dari data contoh yang tersimpan di browser.`}
        actions={
          <>
            <Link href="/pembelian/baru" className="btn btn-secondary">
              Tambah pembelian
            </Link>
            <Link href="/penjualan/baru" className="btn btn-primary">
              Catat penjualan
            </Link>
          </>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        <section className="on-dark min-w-0 rounded-2xl bg-ink px-5 py-6 text-surface sm:px-7 sm:py-7">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
            <div>
              <p className="font-mono text-xs font-medium text-sidebar-muted">
                Penjualan hari ini
              </p>
              <p className="mt-3 font-heading text-[1.75rem] font-semibold leading-none tracking-[-0.05em] tabular-nums min-[360px]:text-[clamp(2.5rem,5vw,4.1rem)]">
                {formatRupiah(todayTotal)}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-sidebar-muted">
                {todaySales.length > 0
                  ? `${todaySales.length} transaksi tercatat hari ini.`
                  : "Belum ada transaksi penjualan hari ini."}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Link href="/penjualan/baru" className="btn btn-primary">
                  Catat penjualan
                </Link>
                <Link
                  href="/penjualan"
                  className="btn border border-sidebar-line text-surface hover:bg-sidebar-soft"
                >
                  Lihat semua penjualan
                </Link>
              </div>
            </div>

            <dl className="grid grid-cols-1 gap-5 border-t border-sidebar-line pt-5 min-[360px]:grid-cols-2 sm:gap-8 lg:grid-cols-1 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
              <div>
                <dt className="text-xs font-medium text-sidebar-muted">
                  Piutang berjalan
                </dt>
                <dd className="mt-1.5 font-mono text-base font-medium tabular-nums sm:text-lg">
                  {formatRupiah(unpaidTotal)}
                </dd>
                <dd className="mt-1 text-xs text-sidebar-muted">
                  {unpaidSales.length} nota belum lunas
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-sidebar-muted">
                  Stok perlu perhatian
                </dt>
                <dd className="mt-1.5 font-mono text-base font-medium tabular-nums sm:text-lg">
                  {lowStock.length} jenis
                </dd>
                <dd className="mt-1 text-xs text-sidebar-muted">
                  {outOfStock > 0
                    ? `${outOfStock} jenis sudah habis`
                    : "Tidak ada yang habis"}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="panel min-w-0">
          <div className="panel-head">
            <div>
              <h2 className="panel-title">Stok perlu ditambah</h2>
              <p className="mt-1 text-xs text-muted">
                Barang yang menyentuh batas minimum.
              </p>
            </div>
            <Link
              href="/inventaris"
              className="link inline-flex min-h-11 items-center text-sm"
            >
              Kelola inventaris
            </Link>
          </div>

          {lowStock.length > 0 ? (
            <ul>
              {lowStock.slice(0, 4).map((product) => (
                <li
                  key={product.id}
                  className="flex items-start justify-between gap-3 border-b border-line px-5 py-3.5 last:border-b-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">
                      {productDisplayName(
                        product.name,
                        product.dimension,
                        product.length,
                      )}
                    </p>
                    <p className="mt-1 font-mono text-[0.68rem] text-muted">
                      {product.code}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-mono text-sm font-medium tabular-nums text-ink">
                      {product.stock} / {product.minStock} {product.unit}
                    </p>
                    <div className="mt-1.5">
                      <StatusBadge
                        tone={stockTone(product.stock, product.minStock)}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-5 py-8">
              <p className="text-sm font-semibold text-ink">
                Semua stok berada di atas batas minimum.
              </p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                Batas minimum bisa diubah per barang di halaman inventaris.
              </p>
            </div>
          )}
        </section>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <section className="panel min-w-0 p-5 sm:p-6">
          <SalesBarChart
            points={weekPoints}
            title="Penjualan 7 hari terakhir"
            totalLabel={`Total ${formatRupiah(weekTotal)} dari ${weekPoints.filter((point) => point.value > 0).length} hari aktif.`}
          />
          <div className="mt-5 flex flex-wrap items-baseline justify-between gap-2 border-t border-line pt-4">
            <p className="text-sm text-muted">Rata-rata per hari</p>
            <p className="font-mono text-sm font-medium tabular-nums text-ink">
              {formatRupiah(weekTotal / 7)}
            </p>
          </div>
        </section>

        <section className="panel min-w-0">
          <div className="panel-head">
            <div>
              <h2 className="panel-title">Penjualan terbaru</h2>
              <p className="mt-1 text-xs text-muted">
                Lima nota terakhir yang tercatat.
              </p>
            </div>
            <Link
              href="/penjualan"
              className="link inline-flex min-h-11 items-center text-sm"
            >
              Semua
            </Link>
          </div>

          {recentSales.length > 0 ? (
            <ul>
              {recentSales.map((sale) => (
                <li
                  key={sale.id}
                  className="border-b border-line px-5 py-3.5 last:border-b-0"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">
                        {sale.customerName}
                      </p>
                      <p className="mt-1 font-mono text-[0.68rem] text-muted">
                        {sale.invoiceNo}
                      </p>
                    </div>
                    <p className="shrink-0 font-mono text-sm font-medium tabular-nums text-ink">
                      {formatRupiah(sale.total)}
                    </p>
                  </div>
                  <div className="mt-2">
                    <StatusBadge
                      tone={sale.status === "lunas" ? "lunas" : "belum"}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-5 py-8 text-sm text-muted">
              Belum ada penjualan. Mulai dari tombol Catat penjualan.
            </div>
          )}
        </section>
      </div>
    </>
  );
}
