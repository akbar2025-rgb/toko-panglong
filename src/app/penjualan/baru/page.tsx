"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { EmptyState } from "@/components/empty-state";
import { LineItemsEditor, makeLineDraft } from "@/components/line-items-editor";
import { PageHeader } from "@/components/page-header";
import { useToast } from "@/components/toast";
import { formatRupiah, todayISO } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { TransactionStatus } from "@/lib/types";

export default function NewSalePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { data, createSale } = useStore();
  const customers = data.contacts.filter(
    (contact) => contact.type === "pelanggan",
  );
  const sellableProducts = data.products.filter(
    (product) => product.stock > 0,
  );
  const [date, setDate] = useState(todayISO());
  const [customerId, setCustomerId] = useState("");
  const [status, setStatus] = useState<TransactionStatus>("lunas");
  const [note, setNote] = useState("");
  const [discount, setDiscount] = useState("0");
  const [lines, setLines] = useState(() => [
    makeLineDraft(sellableProducts, "sale"),
  ]);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const subtotal = lines.reduce((sum, line) => {
    const quantity = Number(line.quantity);
    const price = Number(line.unitPrice);

    if (!Number.isFinite(quantity) || !Number.isFinite(price)) {
      return sum;
    }

    return sum + Math.max(0, quantity) * Math.max(0, price);
  }, 0);
  const discountValue = Number(discount) || 0;
  const total = Math.max(0, subtotal - discountValue);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setSubmitting(true);

    if (data.products.length === 0) {
      setFormError("Belum ada barang di inventaris.");
      setSubmitting(false);
      return;
    }

    if (lines.some((line) => !line.productId)) {
      setFormError("Pilih barang pada setiap baris.");
      setSubmitting(false);
      return;
    }

    const items = lines.map((line) => ({
      productId: line.productId,
      quantity: Number(line.quantity),
      unitPrice: Number(line.unitPrice),
    }));

    if (
      items.some(
        (item) =>
          !Number.isInteger(item.quantity) ||
          item.quantity <= 0 ||
          !Number.isFinite(item.unitPrice) ||
          item.unitPrice < 0,
      )
    ) {
      setFormError(
        "Jumlah harus bulat lebih dari nol, dan harga tidak boleh negatif.",
      );
      setSubmitting(false);
      return;
    }

    if (!Number.isFinite(discountValue) || discountValue < 0) {
      setFormError("Diskon tidak boleh negatif.");
      setSubmitting(false);
      return;
    }

    const result = createSale({
      date,
      customerId: customerId || null,
      status,
      discount: discountValue,
      note,
      items,
    });

    if (!result.ok) {
      setFormError(result.message ?? "Penjualan belum dapat disimpan.");
      setSubmitting(false);
      return;
    }

    showToast(`Penjualan ${result.invoiceNo} tersimpan.`);
    router.push("/penjualan");
  }

  if (data.products.length === 0) {
    return (
      <>
        <PageHeader
          title="Catat penjualan"
          description="Penjualan akan mengurangi stok dan menyimpan nota untuk pelanggan."
          actions={
            <Link href="/penjualan" className="btn btn-secondary">
              Kembali
            </Link>
          }
        />
        <section className="panel">
          <EmptyState
            title="Belum ada barang untuk dijual"
            description="Tambahkan barang dan stok terlebih dahulu sebelum mencatat penjualan."
            action={
              <Link href="/inventaris" className="btn btn-primary">
                Buka inventaris
              </Link>
            }
          />
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Catat penjualan"
        description="Pilih barang, periksa jumlah, lalu simpan. Stok berkurang otomatis saat nota tersimpan."
        actions={
          <Link href="/penjualan" className="btn btn-secondary">
            Kembali
          </Link>
        }
      />

      <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <section className="panel">
            <div className="panel-head">
              <div>
                <h2 className="panel-title">Detail nota</h2>
                <p className="mt-1 text-xs text-muted">
                  Pelanggan boleh dikosongkan untuk pembeli umum.
                </p>
              </div>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <div>
                <label htmlFor="sale-date" className="field-label">
                  Tanggal
                </label>
                <input
                  id="sale-date"
                  type="date"
                  value={date}
                  max={todayISO()}
                  onChange={(event) => setDate(event.target.value)}
                  className="field font-mono"
                  required
                />
              </div>
              <div>
                <label htmlFor="sale-status" className="field-label">
                  Status pembayaran
                </label>
                <select
                  id="sale-status"
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as TransactionStatus)
                  }
                  className="field"
                >
                  <option value="lunas">Lunas</option>
                  <option value="belum">Belum lunas</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="sale-customer" className="field-label mb-0">
                    Pelanggan
                  </label>
                  <Link
                    href="/kontak"
                    className="inline-flex min-h-11 items-center text-xs font-semibold text-clay hover:underline"
                  >
                    Kelola kontak
                  </Link>
                </div>
                <select
                  id="sale-customer"
                  value={customerId}
                  onChange={(event) => setCustomerId(event.target.value)}
                  className="field mt-1.5"
                >
                  <option value="">Pelanggan umum</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="sale-note" className="field-label">
                  Catatan
                </label>
                <textarea
                  id="sale-note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  className="field min-h-24 resize-y"
                  rows={3}
                  placeholder="Contoh: Diambil sendiri, alamat pengiriman, atau catatan pembayaran."
                />
              </div>
            </div>
          </section>

          <section className="panel overflow-hidden">
            <div className="panel-head">
              <div>
                <h2 className="panel-title">Barang yang dijual</h2>
                <p className="mt-1 text-xs text-muted">
                  Harga jual bisa disesuaikan per nota.
                </p>
              </div>
            </div>
            {sellableProducts.length === 0 ? (
              <EmptyState
                title="Semua stok habis"
                description="Tambahkan stok lewat pembelian atau ubah stok di inventaris."
                action={
                  <Link href="/inventaris" className="btn btn-primary">
                    Buka inventaris
                  </Link>
                }
              />
            ) : (
              <LineItemsEditor
                lines={lines}
                onChange={setLines}
                products={data.products}
                mode="sale"
              />
            )}
          </section>
        </div>

        <aside
          aria-label="Ringkasan penjualan"
          className="lg:sticky lg:top-6 lg:self-start"
        >
          <section className="panel p-5">
            <h2 className="panel-title">Ringkasan</h2>
            <dl className="mt-4 space-y-2 border-b border-line pb-4">
              <div className="summary-row">
                <dt>Subtotal</dt>
                <dd>{formatRupiah(subtotal)}</dd>
              </div>
              <div className="summary-row">
                <dt>
                  <label htmlFor="sale-discount">Diskon</label>
                </dt>
                <dd className="w-32">
                  <input
                    id="sale-discount"
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1000"
                    value={discount}
                    onChange={(event) => setDiscount(event.target.value)}
                    className="field text-right font-mono"
                  />
                </dd>
              </div>
            </dl>
            <div className="flex items-baseline justify-between gap-3 pt-4">
              <p className="text-sm font-semibold text-ink">Total</p>
              <p className="font-heading text-2xl font-semibold tracking-[-0.03em] tabular-nums text-ink">
                {formatRupiah(total)}
              </p>
            </div>

            {formError ? (
              <div
                role="alert"
                className="mt-4 rounded-lg border border-danger/30 bg-danger-soft px-3 py-2.5 text-sm font-medium text-danger"
              >
                {formError}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting || sellableProducts.length === 0}
              className="btn btn-primary mt-5 w-full"
            >
              {submitting ? "Menyimpan..." : "Simpan penjualan"}
            </button>
            <p className="mt-3 text-xs leading-relaxed text-muted">
              Stok akan berkurang sesuai jumlah pada nota. Nomor nota dibuat
              otomatis.
            </p>
          </section>
        </aside>
      </form>
    </>
  );
}
