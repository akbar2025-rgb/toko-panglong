const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
});

const shortDateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const dayFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
});

const longDateFormatter = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const weekdayFormatter = new Intl.DateTimeFormat("id-ID", {
  weekday: "short",
});

export function formatRupiah(value: number) {
  const safe = Number.isFinite(value) ? value : 0;
  return rupiahFormatter.format(safe).replace(/\u00a0/g, " ");
}

export function formatNumber(value: number) {
  const safe = Number.isFinite(value) ? value : 0;
  return numberFormatter.format(safe);
}

export function formatCompactRupiah(value: number) {
  const safe = Number.isFinite(value) ? value : 0;

  if (Math.abs(safe) >= 1_000_000_000) {
    return `Rp ${new Intl.NumberFormat("id-ID", {
      maximumFractionDigits: 1,
    }).format(safe / 1_000_000_000)} M`;
  }

  if (Math.abs(safe) >= 1_000_000) {
    return `Rp ${new Intl.NumberFormat("id-ID", {
      maximumFractionDigits: 1,
    }).format(safe / 1_000_000)} jt`;
  }

  if (Math.abs(safe) >= 1_000) {
    return `Rp ${new Intl.NumberFormat("id-ID", {
      maximumFractionDigits: 0,
    }).format(safe / 1_000)} rb`;
  }

  return formatRupiah(safe);
}

export function toLocalISO(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayISO() {
  return toLocalISO(new Date());
}

export function isoDaysAgo(days: number) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return toLocalISO(date);
}

export function parseLocalDate(value: string) {
  return new Date(`${value}T12:00:00`);
}

export function formatDate(value: string) {
  return shortDateFormatter.format(parseLocalDate(value));
}

export function formatDay(value: string) {
  return dayFormatter.format(parseLocalDate(value));
}

export function formatDateLong(value: string) {
  return longDateFormatter.format(parseLocalDate(value));
}

export function formatWeekday(value: string) {
  return weekdayFormatter.format(parseLocalDate(value));
}

export function startOfMonthISO() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}

export function addDays(value: string, days: number) {
  const date = parseLocalDate(value);
  date.setDate(date.getDate() + days);
  return toLocalISO(date);
}

export function countDays(start: string, end: string) {
  const startDate = parseLocalDate(start).getTime();
  const endDate = parseLocalDate(end).getTime();
  return Math.round((endDate - startDate) / 86_400_000) + 1;
}

export function isDateInRange(date: string, start: string, end: string) {
  return date >= start && date <= end;
}

export function nextInvoiceNo(
  prefix: "PJL" | "PB",
  date: string,
  existingNumbers: string[],
) {
  const datePart = date.replaceAll("-", "").slice(2);
  const base = `${prefix}-${datePart}-`;
  const used = existingNumbers.filter((number) => number.startsWith(base));
  const next = used.length + 1;
  return `${base}${String(next).padStart(3, "0")}`;
}

export function productDisplayName(
  name: string,
  dimension: string,
  length: string,
) {
  return [name, dimension, length].filter(Boolean).join(" / ");
}
