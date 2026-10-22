import type {
  AppData,
  Contact,
  LineItem,
  Product,
  Purchase,
  Sale,
} from "@/lib/types";
import { isoDaysAgo, nextInvoiceNo } from "@/lib/format";

const products: Product[] = [
  {
    id: "prd-balok-meranti-46",
    code: "MRT-BLK-46",
    name: "Balok Meranti",
    category: "Balok",
    dimension: "4 x 6 cm",
    length: "4 m",
    unit: "batang",
    stock: 42,
    minStock: 10,
    costPrice: 62_000,
    sellPrice: 78_000,
    createdAt: "2026-01-04T08:00:00.000Z",
  },
  {
    id: "prd-balok-meranti-58",
    code: "MRT-BLK-58",
    name: "Balok Meranti",
    category: "Balok",
    dimension: "5 x 8 cm",
    length: "4 m",
    unit: "batang",
    stock: 28,
    minStock: 8,
    costPrice: 98_000,
    sellPrice: 125_000,
    createdAt: "2026-01-04T08:05:00.000Z",
  },
  {
    id: "prd-papan-meranti-220",
    code: "MRT-PAP-220",
    name: "Papan Meranti",
    category: "Papan",
    dimension: "2 x 20 cm",
    length: "4 m",
    unit: "batang",
    stock: 65,
    minStock: 15,
    costPrice: 48_000,
    sellPrice: 62_000,
    createdAt: "2026-01-04T08:10:00.000Z",
  },
  {
    id: "prd-reng-meranti-34",
    code: "MRT-RNG-34",
    name: "Reng Meranti",
    category: "Reng",
    dimension: "3 x 4 cm",
    length: "4 m",
    unit: "batang",
    stock: 120,
    minStock: 30,
    costPrice: 19_000,
    sellPrice: 26_000,
    createdAt: "2026-01-04T08:15:00.000Z",
  },
  {
    id: "prd-papan-bengkirai-225",
    code: "BKR-PAP-225",
    name: "Papan Bengkirai",
    category: "Papan",
    dimension: "2 x 25 cm",
    length: "4 m",
    unit: "batang",
    stock: 18,
    minStock: 10,
    costPrice: 115_000,
    sellPrice: 148_000,
    createdAt: "2026-01-04T08:20:00.000Z",
  },
  {
    id: "prd-kusen-meranti-510",
    code: "MRT-KSN-510",
    name: "Kusen Meranti",
    category: "Kusen",
    dimension: "5 x 10 cm",
    length: "4 m",
    unit: "batang",
    stock: 6,
    minStock: 8,
    costPrice: 135_000,
    sellPrice: 168_000,
    createdAt: "2026-01-04T08:25:00.000Z",
  },
  {
    id: "prd-kayu-lapis-9mm",
    code: "LAP-9MM",
    name: "Kayu Lapis",
    category: "Kayu lapis",
    dimension: "9 mm",
    length: "122 x 244 cm",
    unit: "lembar",
    stock: 24,
    minStock: 12,
    costPrice: 148_000,
    sellPrice: 185_000,
    createdAt: "2026-01-04T08:30:00.000Z",
  },
  {
    id: "prd-balok-meranti-68",
    code: "MRT-BLK-68",
    name: "Balok Meranti",
    category: "Balok",
    dimension: "6 x 8 cm",
    length: "4 m",
    unit: "batang",
    stock: 0,
    minStock: 6,
    costPrice: 145_000,
    sellPrice: 182_000,
    createdAt: "2026-01-04T08:35:00.000Z",
  },
];

const contacts: Contact[] = [
  {
    id: "ctc-pelanggan-a",
    type: "pelanggan",
    name: "Toko Contoh Bangunan",
    phone: "0812-0000-0001",
    address: "Alamat pelanggan contoh",
    note: "Data contoh",
    createdAt: "2026-02-01T09:00:00.000Z",
  },
  {
    id: "ctc-pelanggan-b",
    type: "pelanggan",
    name: "Pemborong Contoh Jaya",
    phone: "0812-0000-0002",
    address: "Alamat pelanggan contoh",
    note: "Data contoh",
    createdAt: "2026-02-01T09:05:00.000Z",
  },
  {
    id: "ctc-pelanggan-c",
    type: "pelanggan",
    name: "Proyek Contoh Rumah",
    phone: "0812-0000-0003",
    address: "Alamat pelanggan contoh",
    note: "Data contoh",
    createdAt: "2026-02-01T09:10:00.000Z",
  },
  {
    id: "ctc-pemasok-a",
    type: "pemasok",
    name: "Pemasok Contoh Kayu A",
    phone: "0813-0000-0001",
    address: "Alamat pemasok contoh",
    note: "Data contoh",
    createdAt: "2026-02-01T09:15:00.000Z",
  },
  {
    id: "ctc-pemasok-b",
    type: "pemasok",
    name: "Pemasok Contoh Kayu B",
    phone: "0813-0000-0002",
    address: "Alamat pemasok contoh",
    note: "Data contoh",
    createdAt: "2026-02-01T09:20:00.000Z",
  },
];

function findProduct(id: string) {
  const product = products.find((entry) => entry.id === id);

  if (!product) {
    throw new Error(`Produk seed tidak ditemukan: ${id}`);
  }

  return product;
}

function line(
  productId: string,
  quantity: number,
  unitPrice?: number,
): LineItem {
  const product = findProduct(productId);

  return {
    productId,
    productName: [product.name, product.dimension, product.length]
      .filter(Boolean)
      .join(" / "),
    unit: product.unit,
    quantity,
    unitPrice: unitPrice ?? product.sellPrice,
    costPrice: product.costPrice,
  };
}

const today = isoDaysAgo(0);
const yesterday = isoDaysAgo(1);
const twoDays = isoDaysAgo(2);
const threeDays = isoDaysAgo(3);
const fiveDays = isoDaysAgo(5);
const sixDays = isoDaysAgo(6);

const saleDrafts: Omit<Sale, "invoiceNo" | "total">[] = [
  {
    id: "sale-demo-1",
    date: today,
    customerId: "ctc-pelanggan-a",
    customerName: "Toko Contoh Bangunan",
    items: [
      line("prd-balok-meranti-46", 6),
      line("prd-papan-meranti-220", 10),
    ],
    discount: 30_000,
    status: "lunas",
    note: "Data contoh",
    createdAt: new Date(`${today}T09:20:00`).toISOString(),
  },
  {
    id: "sale-demo-2",
    date: today,
    customerId: "ctc-pelanggan-b",
    customerName: "Pemborong Contoh Jaya",
    items: [
      line("prd-reng-meranti-34", 20),
      line("prd-papan-meranti-220", 5),
    ],
    discount: 0,
    status: "belum",
    note: "Data contoh",
    createdAt: new Date(`${today}T13:45:00`).toISOString(),
  },
  {
    id: "sale-demo-3",
    date: yesterday,
    customerId: "ctc-pelanggan-c",
    customerName: "Proyek Contoh Rumah",
    items: [line("prd-kayu-lapis-9mm", 4)],
    discount: 0,
    status: "lunas",
    note: "Data contoh",
    createdAt: new Date(`${yesterday}T11:10:00`).toISOString(),
  },
  {
    id: "sale-demo-4",
    date: twoDays,
    customerId: "ctc-pelanggan-a",
    customerName: "Toko Contoh Bangunan",
    items: [line("prd-papan-bengkirai-225", 3)],
    discount: 0,
    status: "lunas",
    note: "Data contoh",
    createdAt: new Date(`${twoDays}T10:05:00`).toISOString(),
  },
  {
    id: "sale-demo-5",
    date: threeDays,
    customerId: "ctc-pelanggan-b",
    customerName: "Pemborong Contoh Jaya",
    items: [
      line("prd-balok-meranti-58", 4),
      line("prd-kusen-meranti-510", 2),
    ],
    discount: 20_000,
    status: "lunas",
    note: "Data contoh",
    createdAt: new Date(`${threeDays}T14:30:00`).toISOString(),
  },
  {
    id: "sale-demo-6",
    date: fiveDays,
    customerId: "ctc-pelanggan-c",
    customerName: "Proyek Contoh Rumah",
    items: [
      line("prd-reng-meranti-34", 30),
      line("prd-papan-meranti-220", 8),
    ],
    discount: 0,
    status: "belum",
    note: "Data contoh",
    createdAt: new Date(`${fiveDays}T09:40:00`).toISOString(),
  },
  {
    id: "sale-demo-7",
    date: sixDays,
    customerId: "ctc-pelanggan-a",
    customerName: "Toko Contoh Bangunan",
    items: [line("prd-balok-meranti-46", 3)],
    discount: 0,
    status: "lunas",
    note: "Data contoh",
    createdAt: new Date(`${sixDays}T15:15:00`).toISOString(),
  },
];

const saleNumbers: string[] = [];

const sales: Sale[] = saleDrafts
  .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  .map((sale) => {
    const invoiceNo = nextInvoiceNo("PJL", sale.date, saleNumbers);
    saleNumbers.push(invoiceNo);
    const subtotal = sale.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );

    return {
      ...sale,
      invoiceNo,
      total: Math.max(0, subtotal - sale.discount),
    };
  })
  .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

const purchaseDrafts: Omit<Purchase, "invoiceNo" | "total">[] = [
  {
    id: "purchase-demo-1",
    date: twoDays,
    supplierId: "ctc-pemasok-a",
    supplierName: "Pemasok Contoh Kayu A",
    items: [
      line("prd-balok-meranti-46", 20, 62_000),
      line("prd-papan-meranti-220", 30, 48_000),
    ],
    status: "lunas",
    note: "Data contoh",
    createdAt: new Date(`${twoDays}T08:35:00`).toISOString(),
  },
  {
    id: "purchase-demo-2",
    date: isoDaysAgo(4),
    supplierId: "ctc-pemasok-b",
    supplierName: "Pemasok Contoh Kayu B",
    items: [line("prd-kayu-lapis-9mm", 10, 148_000)],
    status: "belum",
    note: "Data contoh",
    createdAt: new Date(`${isoDaysAgo(4)}T10:20:00`).toISOString(),
  },
  {
    id: "purchase-demo-3",
    date: sixDays,
    supplierId: "ctc-pemasok-a",
    supplierName: "Pemasok Contoh Kayu A",
    items: [line("prd-reng-meranti-34", 50, 19_000)],
    status: "lunas",
    note: "Data contoh",
    createdAt: new Date(`${sixDays}T07:50:00`).toISOString(),
  },
];

const purchaseNumbers: string[] = [];

const purchases: Purchase[] = purchaseDrafts
  .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  .map((purchase) => {
    const invoiceNo = nextInvoiceNo("PB", purchase.date, purchaseNumbers);
    purchaseNumbers.push(invoiceNo);

    return {
      ...purchase,
      invoiceNo,
      total: purchase.items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0,
      ),
    };
  })
  .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

export function createSeedData(): AppData {
  return {
    version: 1,
    products,
    contacts,
    sales,
    purchases,
    settings: {
      storeName: "Panglong Kayu",
      address: "Alamat toko belum diisi",
      phone: "",
      receiptNote: "Terima kasih. Simpan nota ini sebagai bukti pembelian.",
    },
  };
}
