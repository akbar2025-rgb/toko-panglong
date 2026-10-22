"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Dialog } from "@/components/dialog";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { ProductForm } from "@/components/product-form";
import { StatusBadge, stockTone } from "@/components/status-badge";
import { useToast } from "@/components/toast";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { formatNumber, formatRupiah } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Product, ProductCategory } from "@/lib/types";

type StockFilter = "semua" | "menipis" | "habis";

export default function InventoryPage() {
  const { data, addProduct, updateProduct, deleteProduct } = useStore();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"semua" | ProductCategory>("semua");
  const [stockFilter, setStockFilter] = useState<StockFilter>("semua");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const lowStockCount = data.products.filter(
    (product) => product.stock <= product.minStock,
  ).length;
  const inventoryValue = data.products.reduce(
    (sum, product) => sum + product.stock * product.costPrice,
    0,
  );

  const filteredProducts = data.products.filter((product) => {
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      product.name.toLowerCase().includes(query) ||
      product.code.toLowerCase().includes(query) ||
      product.dimension.toLowerCase().includes(query);
    const matchesCategory =
      category === "semua" || product.category === category;
    const matchesStock =
      stockFilter === "semua" ||
      (stockFilter === "menipis" &&
        product.stock > 0 &&
        product.stock <= product.minStock) ||
      (stockFilter === "habis" && product.stock <= 0);

    return matchesSearch && matchesCategory && matchesStock;
  });

  const filtersActive =
    search.trim() !== "" || category !== "semua" || stockFilter !== "semua";

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setFormOpen(true);
  }

  function clearFilters() {
    setSearch("");
    setCategory("semua");
    setStockFilter("semua");
  }

  return (
    <>
      <PageHeader
        title="Inventaris"
        description="Catat stok, ukuran, harga beli, dan harga jual kayu. Batas minimum menentukan barang yang masuk daftar perhatian."
        actions={
          <button type="button" onClick={openCreate} className="btn btn-primary">
            Tambah barang
          </button>
        }
      />

      <div className="mb-5 flex flex-wrap gap-x-7 gap-y-2 rounded-xl border border-line bg-surface px-4 py-3 text-sm">
        <p>
          <span className="text-muted">Jenis barang</span>{" "}
          <span className="font-mono font-medium text-ink">
            {formatNumber(data.products.length)}
          </span>
        </p>
        <p>
          <span className="text-muted">Nilai stok</span>{" "}
          <span className="font-mono font-medium text-ink">
            {formatRupiah(inventoryValue)}
          </span>
        </p>
        <p>
          <span className="text-muted">Perlu perhatian</span>{" "}
          <span className="font-mono font-medium text-ink">
            {formatNumber(lowStockCount)}
          </span>{" "}
          <span className="text-muted">jenis</span>
        </p>
      </div>

      <section className="panel">
        <div className="border-b border-line p-4">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px]">
            <div>
              <label htmlFor="inventory-search" className="sr-only">
                Cari barang
              </label>
              <input
                id="inventory-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="field"
                placeholder="Cari nama, kode, atau ukuran"
              />
            </div>
            <div>
              <label htmlFor="inventory-category" className="sr-only">
                Filter kategori
              </label>
              <select
                id="inventory-category"
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as "semua" | ProductCategory)
                }
                className="field"
              >
                <option value="semua">Semua kategori</option>
                {PRODUCT_CATEGORIES.map((entry) => (
                  <option key={entry} value={entry}>
                    {entry}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="inventory-stock" className="sr-only">
                Filter stok
              </label>
              <select
                id="inventory-stock"
                value={stockFilter}
                onChange={(event) =>
                  setStockFilter(event.target.value as StockFilter)
                }
                className="field"
              >
                <option value="semua">Semua stok</option>
                <option value="menipis">Stok menipis</option>
                <option value="habis">Stok habis</option>
              </select>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted" aria-live="polite">
              {filteredProducts.length} barang ditampilkan.
            </p>
            {filtersActive ? (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex min-h-11 items-center text-xs font-semibold text-clay hover:text-clay-dark hover:underline"
              >
                Bersihkan filter
              </button>
            ) : null}
          </div>
        </div>

        {data.products.length === 0 ? (
          <EmptyState
            title="Belum ada barang"
            description="Tambahkan barang pertama agar stok dan penjualan bisa dicatat."
            action={
              <button
                type="button"
                onClick={openCreate}
                className="btn btn-primary"
              >
                Tambah barang
              </button>
            }
          />
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            title="Tidak ada barang yang cocok"
            description="Ubah kata kunci atau bersihkan filter untuk melihat seluruh barang."
            action={
              <button
                type="button"
                onClick={clearFilters}
                className="btn btn-secondary"
              >
                Bersihkan filter
              </button>
            }
          />
        ) : (
          <>
            <div className="hidden md:block">
              <table className="table-base">
                <thead>
                  <tr>
                    <th scope="col">Barang</th>
                    <th scope="col">Ukuran</th>
                    <th scope="col">Stok</th>
                    <th scope="col">Harga jual</th>
                    <th scope="col">Status</th>
                    <th scope="col">
                      <span className="sr-only">Tindakan</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <p className="font-semibold text-ink">{product.name}</p>
                        <p className="mt-1 font-mono text-[0.68rem] text-muted">
                          {product.code} / {product.category}
                        </p>
                      </td>
                      <td>
                        <p className="text-sm text-ink">{product.dimension}</p>
                        <p className="mt-0.5 text-xs text-muted">
                          {product.length || "Tanpa panjang"}
                        </p>
                      </td>
                      <td>
                        <p className="font-mono text-sm font-medium tabular-nums text-ink">
                          {formatNumber(product.stock)} {product.unit}
                        </p>
                        <p className="mt-0.5 text-xs text-muted">
                          Min. {formatNumber(product.minStock)}
                        </p>
                      </td>
                      <td className="font-mono text-sm tabular-nums text-ink">
                        {formatRupiah(product.sellPrice)}
                      </td>
                      <td>
                        <StatusBadge
                          tone={stockTone(product.stock, product.minStock)}
                        />
                      </td>
                      <td>
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEdit(product)}
                            className="inline-flex min-h-11 items-center rounded-lg px-2.5 text-xs font-semibold text-clay transition-colors hover:bg-clay-soft hover:text-clay-dark"
                          >
                            Ubah
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleting(product)}
                            className="inline-flex min-h-11 items-center rounded-lg px-2.5 text-xs font-semibold text-danger transition-colors hover:bg-danger-soft"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="md:hidden" aria-label="Daftar barang">
              {filteredProducts.map((product) => (
                <li key={product.id} className="mobile-data-card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-ink">{product.name}</p>
                      <p className="mt-1 font-mono text-[0.68rem] text-muted">
                        {product.code} / {product.category}
                      </p>
                    </div>
                    <StatusBadge
                      tone={stockTone(product.stock, product.minStock)}
                    />
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-xs text-muted">Ukuran</dt>
                      <dd className="mt-0.5 text-ink">
                        {product.dimension}
                        {product.length ? ` / ${product.length}` : ""}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted">Stok</dt>
                      <dd className="mt-0.5 font-mono tabular-nums text-ink">
                        {formatNumber(product.stock)} {product.unit}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted">Harga jual</dt>
                      <dd className="mt-0.5 font-mono tabular-nums text-ink">
                        {formatRupiah(product.sellPrice)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted">Batas minimum</dt>
                      <dd className="mt-0.5 font-mono tabular-nums text-ink">
                        {formatNumber(product.minStock)} {product.unit}
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-3 flex gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(product)}
                      className="inline-flex min-h-11 items-center rounded-lg px-2.5 text-xs font-semibold text-clay hover:bg-clay-soft"
                    >
                      Ubah
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(product)}
                      className="inline-flex min-h-11 items-center rounded-lg px-2.5 text-xs font-semibold text-danger hover:bg-danger-soft"
                    >
                      Hapus
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Ubah barang" : "Tambah barang"}
      >
        {formOpen ? (
          <ProductForm
            key={editing?.id ?? "barang-baru"}
            product={editing}
            existingCodes={data.products.map((product) => ({
              id: product.id,
              code: product.code,
            }))}
            onCancel={() => setFormOpen(false)}
            onSubmit={(input) => {
              const result = editing
                ? updateProduct(editing.id, input)
                : addProduct(input);

              if (result.ok) {
                showToast(
                  editing
                    ? "Perubahan barang tersimpan."
                    : "Barang baru ditambahkan.",
                );
                setFormOpen(false);
              }

              return result;
            }}
          />
        ) : null}
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (!deleting) {
            return;
          }

          deleteProduct(deleting.id);
          showToast("Barang dihapus. Riwayat transaksi tetap tersimpan.");
        }}
        title="Hapus barang?"
        description={
          deleting
            ? `${deleting.name} ${deleting.dimension} akan dihapus dari inventaris. Nota lama tetap menyimpan nama barang ini.`
            : ""
        }
        confirmLabel="Hapus barang"
        tone="danger"
      />
    </>
  );
}
