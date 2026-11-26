const LOCALE = "en-IN";

const numberFormatter = new Intl.NumberFormat(LOCALE);
const currencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const compactFormatter = new Intl.NumberFormat(LOCALE, { notation: "compact" });

export const formatNumber = (value) => numberFormatter.format(Number(value) || 0);

export const formatCurrency = (value) => currencyFormatter.format(Number(value) || 0);

// e.g. 12500 → "12.5K" for stat tiles
export const formatCompactNumber = (value) => compactFormatter.format(Number(value) || 0);
