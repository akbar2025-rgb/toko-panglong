import type { ProductCategory, ProductUnit, TransactionStatus } from "@/lib/types";

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  "Balok",
  "Papan",
  "Reng",
  "Kusen",
  "Kayu lapis",
  "Lainnya",
];

export const PRODUCT_UNITS: ProductUnit[] = ["batang", "lembar", "m3", "set"];

export const TRANSACTION_STATUSES: {
  value: TransactionStatus;
  label: string;
}[] = [
  { value: "lunas", label: "Lunas" },
  { value: "belum", label: "Belum lunas" },
];
