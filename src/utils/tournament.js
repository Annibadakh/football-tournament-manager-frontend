import { formatDate } from "@/utils/date";
import { formatCurrency } from "@/utils/number";

export const formatEntryFee = (entryFee) => {
  if (entryFee == null) return "Fee to be announced";
  if (entryFee === 0) return "Free entry";
  return formatCurrency(entryFee);
};

export const formatDateRange = (startDate, endDate) => {
  if (!startDate) return "Dates to be announced";
  if (!endDate || endDate === startDate) return formatDate(startDate);
  return `${formatDate(startDate)} – ${formatDate(endDate)}`;
};

// "7-a-side · Open (all ages) · Men"
export const formatCategories = (tournament) =>
  [tournament.gameFormat?.name, tournament.ageGroup?.name, tournament.genderCategory?.name]
    .filter(Boolean)
    .join(" · ");
