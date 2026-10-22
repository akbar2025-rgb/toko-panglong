"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { createSeedData } from "@/lib/seed";
import { nextInvoiceNo } from "@/lib/format";
import type {
  ActionResult,
  AppData,
  ContactInput,
  Product,
  ProductInput,
  Purchase,
  PurchaseInput,
  Sale,
  SaleInput,
  Settings,
  TransactionStatus,
} from "@/lib/types";

const STORAGE_KEY = "panglong.data.v1";

type StoreStatus = "loading" | "ready" | "error";

type StoreState = {
  data: AppData;
  status: StoreStatus;
  loadError: string | null;
  storageWarning: string | null;
};

type StoreAction =
  | {
      type: "HYDRATE";
      data: AppData;
      storageWarning?: string | null;
    }
  | { type: "LOAD_ERROR"; message: string }
  | { type: "STORAGE_WARNING"; message: string }
  | { type: "ADD_PRODUCT"; product: Product }
  | { type: "UPDATE_PRODUCT"; id: string; input: ProductInput }
  | { type: "DELETE_PRODUCT"; id: string }
  | { type: "ADD_CONTACT"; contact: AppData["contacts"][number] }
  | {
      type: "UPDATE_CONTACT";
      id: string;
      input: ContactInput;
    }
  | { type: "DELETE_CONTACT"; id: string }
  | { type: "CREATE_SALE"; sale: Sale }
  | { type: "CREATE_PURCHASE"; purchase: Purchase }
  | { type: "SET_SALE_STATUS"; id: string; status: TransactionStatus }
  | { type: "SET_PURCHASE_STATUS"; id: string; status: TransactionStatus }
  | { type: "UPDATE_SETTINGS"; settings: Settings }
  | { type: "RESET" };

type StoreContextValue = {
  data: AppData;
  status: StoreStatus;
  loadError: string | null;
  storageWarning: string | null;
  addProduct: (input: ProductInput) => ActionResult;
  updateProduct: (id: string, input: ProductInput) => ActionResult;
  deleteProduct: (id: string) => void;
  addContact: (input: ContactInput) => ActionResult;
  updateContact: (id: string, input: ContactInput) => ActionResult;
  deleteContact: (id: string) => void;
  createSale: (input: SaleInput) => ActionResult;
  createPurchase: (input: PurchaseInput) => ActionResult;
  setSaleStatus: (id: string, status: TransactionStatus) => void;
  setPurchaseStatus: (id: string, status: TransactionStatus) => void;
  updateSettings: (settings: Settings) => void;
  resetData: () => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

function makeId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function initialStoreState(): StoreState {
  return {
    data: createSeedData(),
    status: "loading",
    loadError: null,
    storageWarning: null,
  };
}

function reducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {
    case "HYDRATE":
      return {
        data: action.data,
        status: "ready",
        loadError: null,
        storageWarning: action.storageWarning ?? null,
      };
    case "LOAD_ERROR":
      return {
        ...state,
        status: "error",
        loadError: action.message,
      };
    case "STORAGE_WARNING":
      return { ...state, storageWarning: action.message };
    case "ADD_PRODUCT":
      return {
        ...state,
        data: {
          ...state.data,
          products: [action.product, ...state.data.products],
        },
      };
    case "UPDATE_PRODUCT":
      return {
        ...state,
        data: {
          ...state.data,
          products: state.data.products.map((product) =>
            product.id === action.id
              ? { ...product, ...action.input }
              : product,
          ),
        },
      };
    case "DELETE_PRODUCT":
      return {
        ...state,
        data: {
          ...state.data,
          products: state.data.products.filter(
            (product) => product.id !== action.id,
          ),
        },
      };
    case "ADD_CONTACT":
      return {
        ...state,
        data: {
          ...state.data,
          contacts: [action.contact, ...state.data.contacts],
        },
      };
    case "UPDATE_CONTACT":
      return {
        ...state,
        data: {
          ...state.data,
          contacts: state.data.contacts.map((contact) =>
            contact.id === action.id
              ? { ...contact, ...action.input }
              : contact,
          ),
        },
      };
    case "DELETE_CONTACT":
      return {
        ...state,
        data: {
          ...state.data,
          contacts: state.data.contacts.filter(
            (contact) => contact.id !== action.id,
          ),
        },
      };
    case "CREATE_SALE": {
      const sold = new Map<string, number>();

      action.sale.items.forEach((item) => {
        sold.set(item.productId, (sold.get(item.productId) ?? 0) + item.quantity);
      });

      return {
        ...state,
        data: {
          ...state.data,
          sales: [action.sale, ...state.data.sales],
          products: state.data.products.map((product) => {
            const quantity = sold.get(product.id);
            return quantity
              ? { ...product, stock: product.stock - quantity }
              : product;
          }),
        },
      };
    }
    case "CREATE_PURCHASE": {
      const received = new Map<string, { quantity: number; unitPrice: number }>();

      action.purchase.items.forEach((item) => {
        const current = received.get(item.productId);
        received.set(item.productId, {
          quantity: (current?.quantity ?? 0) + item.quantity,
          unitPrice: item.unitPrice,
        });
      });

      return {
        ...state,
        data: {
          ...state.data,
          purchases: [action.purchase, ...state.data.purchases],
          products: state.data.products.map((product) => {
            const incoming = received.get(product.id);

            if (!incoming) {
              return product;
            }

            return {
              ...product,
              stock: product.stock + incoming.quantity,
              costPrice: incoming.unitPrice,
            };
          }),
        },
      };
    }
    case "SET_SALE_STATUS":
      return {
        ...state,
        data: {
          ...state.data,
          sales: state.data.sales.map((sale) =>
            sale.id === action.id ? { ...sale, status: action.status } : sale,
          ),
        },
      };
    case "SET_PURCHASE_STATUS":
      return {
        ...state,
        data: {
          ...state.data,
          purchases: state.data.purchases.map((purchase) =>
            purchase.id === action.id
              ? { ...purchase, status: action.status }
              : purchase,
          ),
        },
      };
    case "UPDATE_SETTINGS":
      return {
        ...state,
        data: {
          ...state.data,
          settings: action.settings,
        },
      };
    case "RESET":
      return {
        data: createSeedData(),
        status: "ready",
        loadError: null,
        storageWarning: null,
      };
    default:
      return state;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isAppData(value: unknown): value is AppData {
  if (!isRecord(value)) {
    return false;
  }

  return (
    value.version === 1 &&
    Array.isArray(value.products) &&
    Array.isArray(value.contacts) &&
    Array.isArray(value.sales) &&
    Array.isArray(value.purchases) &&
    isRecord(value.settings)
  );
}

function stockProblem(
  products: Product[],
  items: { productId: string; quantity: number }[],
) {
  const totals = new Map<string, number>();

  for (const item of items) {
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      return "Jumlah barang harus berupa angka bulat lebih dari nol.";
    }

    totals.set(
      item.productId,
      (totals.get(item.productId) ?? 0) + item.quantity,
    );
  }

  for (const [productId, quantity] of totals) {
    const product = products.find((entry) => entry.id === productId);

    if (!product) {
      return "Ada barang yang tidak ditemukan. Muat ulang halaman lalu coba lagi.";
    }

    if (quantity > product.stock) {
      return `Stok ${product.name} ${product.dimension} hanya ${product.stock} ${product.unit}.`;
    }
  }

  return null;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialStoreState);

  useEffect(() => {
    let raw: string | null;

    try {
      raw = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      dispatch({
        type: "HYDRATE",
        data: createSeedData(),
        storageWarning:
          "Penyimpanan browser tidak tersedia. Data hanya bertahan selama tab ini terbuka.",
      });
      return;
    }

    if (!raw) {
      dispatch({ type: "HYDRATE", data: createSeedData() });
      return;
    }

    try {
      const parsed: unknown = JSON.parse(raw);

      if (!isAppData(parsed)) {
        throw new Error("Format data tidak dikenali.");
      }

      dispatch({ type: "HYDRATE", data: parsed });
    } catch {
      dispatch({
        type: "LOAD_ERROR",
        message:
          "Data toko yang tersimpan di browser tidak dapat dibaca. Data mungkin berasal dari versi lama atau rusak.",
      });
    }
  }, []);

  useEffect(() => {
    if (state.status !== "ready") {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
    } catch {
      dispatch({
        type: "STORAGE_WARNING",
        message:
          "Perubahan terakhir tidak dapat disimpan di browser. Data hanya bertahan selama tab ini terbuka.",
      });
    }
  }, [state.data, state.status]);

  const value = useMemo<StoreContextValue>(() => {
    const { data } = state;

    function addProduct(input: ProductInput): ActionResult {
      const duplicate = data.products.some(
        (product) => product.code.toLowerCase() === input.code.toLowerCase(),
      );

      if (duplicate) {
        return { ok: false, message: "Kode barang sudah dipakai." };
      }

      dispatch({
        type: "ADD_PRODUCT",
        product: {
          ...input,
          id: makeId("prd"),
          createdAt: new Date().toISOString(),
        },
      });

      return { ok: true };
    }

    function updateProduct(id: string, input: ProductInput): ActionResult {
      const duplicate = data.products.some(
        (product) =>
          product.id !== id &&
          product.code.toLowerCase() === input.code.toLowerCase(),
      );

      if (duplicate) {
        return { ok: false, message: "Kode barang sudah dipakai." };
      }

      dispatch({ type: "UPDATE_PRODUCT", id, input });
      return { ok: true };
    }

    function deleteProduct(id: string) {
      dispatch({ type: "DELETE_PRODUCT", id });
    }

    function addContact(input: ContactInput): ActionResult {
      dispatch({
        type: "ADD_CONTACT",
        contact: {
          ...input,
          id: makeId("ctc"),
          createdAt: new Date().toISOString(),
        },
      });

      return { ok: true };
    }

    function updateContact(id: string, input: ContactInput): ActionResult {
      dispatch({ type: "UPDATE_CONTACT", id, input });
      return { ok: true };
    }

    function deleteContact(id: string) {
      dispatch({ type: "DELETE_CONTACT", id });
    }

    function createSale(input: SaleInput): ActionResult {
      if (input.items.length === 0) {
        return { ok: false, message: "Tambahkan minimal satu barang." };
      }

      const problem = stockProblem(data.products, input.items);

      if (problem) {
        return { ok: false, message: problem };
      }

      const items = input.items.map((item) => {
        const product = data.products.find(
          (entry) => entry.id === item.productId,
        );

        if (!product) {
          throw new Error("Barang tidak ditemukan.");
        }

        return {
          productId: product.id,
          productName: [product.name, product.dimension, product.length]
            .filter(Boolean)
            .join(" / "),
          unit: product.unit,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          costPrice: product.costPrice,
        };
      });

      const subtotal = items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0,
      );

      if (input.discount < 0 || input.discount > subtotal) {
        return {
          ok: false,
          message: "Diskon harus berada di antara nol dan subtotal.",
        };
      }

      const customer = data.contacts.find(
        (contact) =>
          contact.id === input.customerId && contact.type === "pelanggan",
      );

      const invoiceNo = nextInvoiceNo(
        "PJL",
        input.date,
        data.sales.map((sale) => sale.invoiceNo),
      );

      const sale: Sale = {
        id: makeId("sale"),
        invoiceNo,
        date: input.date,
        customerId: customer?.id ?? null,
        customerName: customer?.name ?? "Pelanggan umum",
        items,
        discount: input.discount,
        total: Math.max(0, subtotal - input.discount),
        status: input.status,
        note: input.note.trim(),
        createdAt: new Date().toISOString(),
      };

      dispatch({ type: "CREATE_SALE", sale });
      return { ok: true, invoiceNo };
    }

    function createPurchase(input: PurchaseInput): ActionResult {
      if (input.items.length === 0) {
        return { ok: false, message: "Tambahkan minimal satu barang." };
      }

      const negativeQuantity = input.items.some(
        (item) => !Number.isInteger(item.quantity) || item.quantity <= 0,
      );

      if (negativeQuantity) {
        return {
          ok: false,
          message: "Jumlah barang harus berupa angka bulat lebih dari nol.",
        };
      }

      const items = input.items.map((item) => {
        const product = data.products.find(
          (entry) => entry.id === item.productId,
        );

        if (!product) {
          throw new Error("Barang tidak ditemukan.");
        }

        return {
          productId: product.id,
          productName: [product.name, product.dimension, product.length]
            .filter(Boolean)
            .join(" / "),
          unit: product.unit,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          costPrice: product.costPrice,
        };
      });

      const supplier = data.contacts.find(
        (contact) =>
          contact.id === input.supplierId && contact.type === "pemasok",
      );

      const invoiceNo = nextInvoiceNo(
        "PB",
        input.date,
        data.purchases.map((purchase) => purchase.invoiceNo),
      );

      const purchase: Purchase = {
        id: makeId("purchase"),
        invoiceNo,
        date: input.date,
        supplierId: supplier?.id ?? null,
        supplierName: supplier?.name ?? "Pemasok tidak dicatat",
        items,
        total: items.reduce(
          (sum, item) => sum + item.quantity * item.unitPrice,
          0,
        ),
        status: input.status,
        note: input.note.trim(),
        createdAt: new Date().toISOString(),
      };

      dispatch({ type: "CREATE_PURCHASE", purchase });
      return { ok: true, invoiceNo };
    }

    return {
      data,
      status: state.status,
      loadError: state.loadError,
      storageWarning: state.storageWarning,
      addProduct,
      updateProduct,
      deleteProduct,
      addContact,
      updateContact,
      deleteContact,
      createSale,
      createPurchase,
      setSaleStatus: (id, status) =>
        dispatch({ type: "SET_SALE_STATUS", id, status }),
      setPurchaseStatus: (id, status) =>
        dispatch({ type: "SET_PURCHASE_STATUS", id, status }),
      updateSettings: (settings) =>
        dispatch({ type: "UPDATE_SETTINGS", settings }),
      resetData: () => dispatch({ type: "RESET" }),
    };
  }, [state]);

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);

  if (!context) {
    throw new Error("useStore harus dipakai di dalam StoreProvider.");
  }

  return context;
}
