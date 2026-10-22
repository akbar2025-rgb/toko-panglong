export type ProductUnit = "batang" | "lembar" | "m3" | "set";

export type ProductCategory =
  | "Balok"
  | "Papan"
  | "Reng"
  | "Kusen"
  | "Kayu lapis"
  | "Lainnya";

export type Product = {
  id: string;
  code: string;
  name: string;
  category: ProductCategory;
  dimension: string;
  length: string;
  unit: ProductUnit;
  stock: number;
  minStock: number;
  costPrice: number;
  sellPrice: number;
  createdAt: string;
};

export type ContactType = "pelanggan" | "pemasok";

export type Contact = {
  id: string;
  type: ContactType;
  name: string;
  phone: string;
  address: string;
  note: string;
  createdAt: string;
};

export type TransactionStatus = "lunas" | "belum";

export type LineItem = {
  productId: string;
  productName: string;
  unit: ProductUnit;
  quantity: number;
  unitPrice: number;
  costPrice: number;
};

export type Sale = {
  id: string;
  invoiceNo: string;
  date: string;
  customerId: string | null;
  customerName: string;
  items: LineItem[];
  discount: number;
  total: number;
  status: TransactionStatus;
  note: string;
  createdAt: string;
};

export type Purchase = {
  id: string;
  invoiceNo: string;
  date: string;
  supplierId: string | null;
  supplierName: string;
  items: LineItem[];
  total: number;
  status: TransactionStatus;
  note: string;
  createdAt: string;
};

export type Settings = {
  storeName: string;
  address: string;
  phone: string;
  receiptNote: string;
};

export type AppData = {
  version: 1;
  products: Product[];
  contacts: Contact[];
  sales: Sale[];
  purchases: Purchase[];
  settings: Settings;
};

export type ProductInput = {
  code: string;
  name: string;
  category: ProductCategory;
  dimension: string;
  length: string;
  unit: ProductUnit;
  stock: number;
  minStock: number;
  costPrice: number;
  sellPrice: number;
};

export type ContactInput = {
  type: ContactType;
  name: string;
  phone: string;
  address: string;
  note: string;
};

export type SaleInput = {
  date: string;
  customerId: string | null;
  status: TransactionStatus;
  discount: number;
  note: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
  }[];
};

export type PurchaseInput = {
  date: string;
  supplierId: string | null;
  status: TransactionStatus;
  note: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
  }[];
};

export type ActionResult = {
  ok: boolean;
  message?: string;
  invoiceNo?: string;
};
