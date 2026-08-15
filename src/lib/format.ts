const CURRENCY_SYMBOLS: Record<string, string> = {
  BDT: "৳",
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
};

export function formatMoney(amount: number, currency: string, locale: string): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const code = (currency || "USD").toUpperCase();
  const symbol = CURRENCY_SYMBOLS[code] ?? code + " ";
  const grouped = new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en-US", {
    maximumFractionDigits: safeAmount % 1 === 0 ? 0 : 2,
  }).format(safeAmount);
  return `${symbol}${grouped}`;
}

export function formatDate(iso: string | null | undefined, locale: string): string {
  const date = iso ? new Date(iso) : null;
  if (!date || Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatDateTime(iso: string | null | undefined, locale: string): string {
  const date = iso ? new Date(iso) : null;
  if (!date || Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
