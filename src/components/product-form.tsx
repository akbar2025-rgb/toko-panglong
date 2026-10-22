"use client";

import { useId, useState, type FormEvent } from "react";
import { PRODUCT_CATEGORIES, PRODUCT_UNITS } from "@/lib/constants";
import type {
  ActionResult,
  Product,
  ProductCategory,
  ProductInput,
  ProductUnit,
} from "@/lib/types";

type ProductFormProps = {
  product: Product | null;
  existingCodes: { id: string; code: string }[];
  onSubmit: (input: ProductInput) => ActionResult;
  onCancel: () => void;
};

type FormValues = {
  name: string;
  code: string;
  category: ProductCategory;
  dimension: string;
  length: string;
  unit: ProductUnit;
  stock: string;
  minStock: string;
  costPrice: string;
  sellPrice: string;
};

function initialValues(product: Product | null): FormValues {
  return {
    name: product?.name ?? "",
    code: product?.code ?? "",
    category: product?.category ?? "Balok",
    dimension: product?.dimension ?? "",
    length: product?.length ?? "",
    unit: product?.unit ?? "batang",
    stock: String(product?.stock ?? 0),
    minStock: String(product?.minStock ?? 0),
    costPrice: String(product?.costPrice ?? 0),
    sellPrice: String(product?.sellPrice ?? 0),
  };
}

function toNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

export function ProductForm({
  product,
  existingCodes,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const baseId = useId();
  const [values, setValues] = useState<FormValues>(() =>
    initialValues(product),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");

  function update<K extends keyof FormValues>(
    key: K,
    value: FormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    const stock = toNumber(values.stock);
    const minStock = toNumber(values.minStock);
    const costPrice = toNumber(values.costPrice);
    const sellPrice = toNumber(values.sellPrice);
    const name = values.name.trim();
    const code = values.code.trim().toUpperCase();
    const dimension = values.dimension.trim();
    const length = values.length.trim();

    if (name.length < 2) {
      nextErrors.name = "Nama barang minimal dua karakter.";
    }

    if (code.length < 2) {
      nextErrors.code = "Kode barang minimal dua karakter.";
    } else if (
      existingCodes.some(
        (entry) =>
          entry.id !== product?.id &&
          entry.code.toLowerCase() === code.toLowerCase(),
      )
    ) {
      nextErrors.code = "Kode barang sudah dipakai barang lain.";
    }

    if (!dimension) {
      nextErrors.dimension = "Ukuran barang perlu diisi.";
    }

    if (!Number.isInteger(stock) || stock < 0) {
      nextErrors.stock = "Stok harus berupa angka bulat nol atau lebih.";
    }

    if (!Number.isInteger(minStock) || minStock < 0) {
      nextErrors.minStock =
        "Batas minimum harus berupa angka bulat nol atau lebih.";
    }

    if (!Number.isFinite(costPrice) || costPrice < 0) {
      nextErrors.costPrice = "Harga beli tidak boleh negatif.";
    }

    if (!Number.isFinite(sellPrice) || sellPrice < 0) {
      nextErrors.sellPrice = "Harga jual tidak boleh negatif.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setFormError("Periksa kembali kolom yang ditandai.");
      return;
    }

    const result = onSubmit({
      name,
      code,
      category: values.category,
      dimension,
      length,
      unit: values.unit,
      stock,
      minStock,
      costPrice,
      sellPrice,
    });

    if (!result.ok) {
      setFormError(result.message ?? "Barang belum dapat disimpan.");
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4">
      {formError ? (
        <div
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger-soft px-3 py-2.5 text-sm font-medium text-danger"
        >
          {formError}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor={`${baseId}-name`} className="field-label">
            Nama barang
          </label>
          <input
            id={`${baseId}-name`}
            autoFocus
            type="text"
            value={values.name}
            onChange={(event) => update("name", event.target.value)}
            className="field"
            placeholder="Contoh: Balok Meranti"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? `${baseId}-name-error` : undefined}
          />
          {errors.name ? (
            <p id={`${baseId}-name-error`} className="field-error">
              {errors.name}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor={`${baseId}-code`} className="field-label">
            Kode barang
          </label>
          <input
            id={`${baseId}-code`}
            type="text"
            value={values.code}
            onChange={(event) =>
              update("code", event.target.value.toUpperCase())
            }
            className="field font-mono uppercase"
            placeholder="MRT-BLK-46"
            aria-invalid={Boolean(errors.code)}
            aria-describedby={errors.code ? `${baseId}-code-error` : undefined}
          />
          {errors.code ? (
            <p id={`${baseId}-code-error`} className="field-error">
              {errors.code}
            </p>
          ) : (
            <p className="field-help">Dipakai di nota dan pencarian.</p>
          )}
        </div>

        <div>
          <label htmlFor={`${baseId}-category`} className="field-label">
            Kategori
          </label>
          <select
            id={`${baseId}-category`}
            value={values.category}
            onChange={(event) =>
              update("category", event.target.value as ProductCategory)
            }
            className="field"
          >
            {PRODUCT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`${baseId}-dimension`} className="field-label">
            Ukuran
          </label>
          <input
            id={`${baseId}-dimension`}
            type="text"
            value={values.dimension}
            onChange={(event) => update("dimension", event.target.value)}
            className="field"
            placeholder="4 x 6 cm"
            aria-invalid={Boolean(errors.dimension)}
            aria-describedby={
              errors.dimension ? `${baseId}-dimension-error` : undefined
            }
          />
          {errors.dimension ? (
            <p id={`${baseId}-dimension-error`} className="field-error">
              {errors.dimension}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor={`${baseId}-length`} className="field-label">
            Panjang
          </label>
          <input
            id={`${baseId}-length`}
            type="text"
            value={values.length}
            onChange={(event) => update("length", event.target.value)}
            className="field"
            placeholder="4 m"
          />
        </div>

        <div>
          <label htmlFor={`${baseId}-unit`} className="field-label">
            Satuan
          </label>
          <select
            id={`${baseId}-unit`}
            value={values.unit}
            onChange={(event) =>
              update("unit", event.target.value as ProductUnit)
            }
            className="field"
          >
            {PRODUCT_UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`${baseId}-stock`} className="field-label">
            Stok saat ini
          </label>
          <input
            id={`${baseId}-stock`}
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            value={values.stock}
            onChange={(event) => update("stock", event.target.value)}
            className="field font-mono"
            aria-invalid={Boolean(errors.stock)}
            aria-describedby={errors.stock ? `${baseId}-stock-error` : undefined}
          />
          {errors.stock ? (
            <p id={`${baseId}-stock-error`} className="field-error">
              {errors.stock}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor={`${baseId}-min-stock`} className="field-label">
            Batas minimum stok
          </label>
          <input
            id={`${baseId}-min-stock`}
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            value={values.minStock}
            onChange={(event) => update("minStock", event.target.value)}
            className="field font-mono"
            aria-invalid={Boolean(errors.minStock)}
            aria-describedby={
              errors.minStock ? `${baseId}-min-stock-error` : undefined
            }
          />
          {errors.minStock ? (
            <p id={`${baseId}-min-stock-error`} className="field-error">
              {errors.minStock}
            </p>
          ) : (
            <p className="field-help">Barang ditandai menipis di angka ini.</p>
          )}
        </div>

        <div>
          <label htmlFor={`${baseId}-cost-price`} className="field-label">
            Harga beli
          </label>
          <input
            id={`${baseId}-cost-price`}
            type="number"
            inputMode="numeric"
            min="0"
            step="1000"
            value={values.costPrice}
            onChange={(event) => update("costPrice", event.target.value)}
            className="field font-mono"
            aria-invalid={Boolean(errors.costPrice)}
            aria-describedby={
              errors.costPrice ? `${baseId}-cost-price-error` : undefined
            }
          />
          {errors.costPrice ? (
            <p id={`${baseId}-cost-price-error`} className="field-error">
              {errors.costPrice}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor={`${baseId}-sell-price`} className="field-label">
            Harga jual
          </label>
          <input
            id={`${baseId}-sell-price`}
            type="number"
            inputMode="numeric"
            min="0"
            step="1000"
            value={values.sellPrice}
            onChange={(event) => update("sellPrice", event.target.value)}
            className="field font-mono"
            aria-invalid={Boolean(errors.sellPrice)}
            aria-describedby={
              errors.sellPrice ? `${baseId}-sell-price-error` : undefined
            }
          />
          {errors.sellPrice ? (
            <p id={`${baseId}-sell-price-error`} className="field-error">
              {errors.sellPrice}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Batal
        </button>
        <button type="submit" className="btn btn-primary">
          Simpan barang
        </button>
      </div>
    </form>
  );
}
