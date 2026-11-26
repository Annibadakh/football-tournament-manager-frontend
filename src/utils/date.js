import { differenceInYears, format, isValid, parseISO } from "date-fns";
import { DATE_FORMATS } from "@/constants/common.constants";

// API sends ISO 8601 UTC strings; date-fns formats them in the user's local time
const toDate = (value) => (value instanceof Date ? value : parseISO(value));

export const formatDate = (value, pattern = DATE_FORMATS.DATE) => {
  if (!value) return "";
  const date = toDate(value);
  return isValid(date) ? format(date, pattern) : "";
};

export const formatTime = (value) => formatDate(value, DATE_FORMATS.TIME);

export const formatDateTime = (value) => formatDate(value, DATE_FORMATS.DATE_TIME);

// Public pages show age instead of date of birth
export const getAge = (dateOfBirth, today = new Date()) => {
  if (!dateOfBirth) return null;
  const date = toDate(dateOfBirth);
  return isValid(date) ? differenceInYears(today, date) : null;
};

// Today's calendar date as YYYY-MM-DD, comparable with API date-only fields
export const todayIsoDate = (today = new Date()) => format(today, "yyyy-MM-dd");
