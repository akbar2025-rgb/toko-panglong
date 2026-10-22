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

export default function NewPurchasePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { data, createPurchase } = useStore();
  const suppliers = data.contacts.filter(
    (contact) => contact.type === "pemasok",
  );
  const [date, setDate] = useState(todayISO());
  const [supplierId, setSupplierId] = useState("");
  const [status, setStatus] = useState<TransactionStatus>("lunas");
  const [note, setNote] = useState("");
  const [lines, setLines] = useState(() => [
    makeLineDraft(data.products, "purchase"),
  ]);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const total = lines.reduce((sum, line) => {
    const quantity = Number(line.quantity);
    const price = Number(line.unitPrice);

    if (!Number.isFinite(quantity) || !Number.isFinite(price)) {
      return sum;
    }

    return sum + Math.max(0, quantity) * Math.max(0, price);
  }, 0);

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

    const result = createPurchase({
      date,
      supplierId: supplierId || null,
      status,
      note,
      items,
    });

    if (!result.ok) {
      setFormError(result.message ?? "Pembelian belum dapat disimpan.");
      setSubmitting(false);
      return;
    }

    showToast(`Pembelian ${result.invoiceNo} tersimpan.`);
    router.push("/pembelian");
  }

  return (
    <>
      <PageHeader
        title="Catat pembelian"
        description="Barang yang masuk akan menambah stok. Harga beli terbaru juga dipakai sebagai harga pokok barang."
        actions={
          <Link href="/pembelian" className="btn btn-secondary">
            Kembali
          </Link>
        }
      />

      {data.products.length === 0 ? (
        <section className="panel">
          <EmptyState
            title="Belum ada barang"
            description="Tambahkan barang di inventaris sebelum mencatat pembelian."
            action={
              <Link href="/inventaris" className="btn btn-primary">
                Buka inventaris
              </Link>
            }
          />
        </section>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]"
        >
          <div className="space-y-5">
            <section className="panel">
              <div className="panel-head">
                <div>
                  <h2 className="panel-title">Detail pembelian</h2>
                  <p className="mt-1 text-xs text-muted">
                    Pemasok boleh dikosongkan bila tidak dicatat.
                  </p>
                </div>
              </div>
              <div className="grid gap-4 p-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="purchase-date" className="field-label">
                    Tanggal
                  </label>
                  <input
                    id="purchase-date"
                    type="date"
                    value={date}
                    max={todayISO()}
                    onChange={(event) => setDate(event.target.value)}
                    className="field font-mono"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="purchase-status" className="field-label">
                    Status pembayaran
                  </label>
                  <select
                    id="purchase-status"
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
                    <label
                      htmlFor="purchase-supplier"
                      className="field-label mb-0"
                    >
                      Pemasok
                    </label>
                    <Link
                      href="/kontak"
                      className="inline-flex min-h-11 items-center text-xs font-semibold text-clay hover:underline"
                    >
                      Kelola kontak
                    </Link>
                  </div>
                  <select
                    id="purchase-supplier"
                    value={supplierId}
                    onChange={(event) => setSupplierId(event.target.value)}
                    className="field mt-1.5"
                  >
                    <option value="">Pemasok tidak dicatat</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="purchase-note" className="field-label">
                    Catatan
                  </label>
                  <textarea
                    id="purchase-note"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    className="field min-h-24 resize-y"
                    rows={3}
                    placeholder="Contoh: Nomor surat jalan, kualitas kayu, atau tempo pembayaran."
                  />
                </div>
              </div>
            </section>

            <section className="panel overflow-hidden">
              <div className="panel-head">
                <div>
                  <h2 className="panel-title">Barang yang masuk</h2>
                  <p className="mt-1 text-xs text-muted">
                    Harga beli bisa disesuaikan dengan nota pemasok.
                  </p>
                </div>
              </div>
              <LineItemsEditor
                lines={lines}
                onChange={setLines}
                products={data.products}
                mode="purchase"
              />
            </section>
          </div>

          <aside
            aria-label="Ringkasan pembelian"
            className="lg:sticky lg:top-6 lg:self-start"
          >
            <section className="panel p-5">
              <h2 className="panel-title">Ringkasan</h2>
              <dl className="mt-4 border-b border-line pb-4">
                <div className="summary-row">
                  <dt>Total pembelian</dt>
                  <dd>{formatRupiah(total)}</dd>
                </div>
              </dl>
              <div className="flex items-baseline justify-between gap-3 pt-4">
                <p className="text-sm font-semibold text-ink">Harus dibayar</p>
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
                disabled={submitting}
                className="btn btn-primary mt-5 w-full"
              >
                {submitting ? "Menyimpan..." : "Simpan pembelian"}
              </button>
              <p className="mt-3 text-xs leading-relaxed text-muted">
                Stok bertambah setelah pembelian disimpan. Harga beli barang
                diperbarui mengikuti baris terakhir pada nota ini.
              </p>
            </section>
          </aside>
        </form>
      )}
    </>
  );
}
