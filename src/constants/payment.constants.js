// Mirrors backend constants/payment.constants.js
export const PAYMENT_METHOD = Object.freeze({
  ONLINE: 1,
  OFFLINE: 2,
});

export const PAYMENT_STATUS = Object.freeze({
  CREATED: 1,
  PAID: 2,
  REFUND_DUE: 3,
});

export const PAYMENT_STATUS_LABEL = Object.freeze({
  [PAYMENT_STATUS.CREATED]: "Pending",
  [PAYMENT_STATUS.PAID]: "Paid",
  [PAYMENT_STATUS.REFUND_DUE]: "Refund due",
});

export const PAYMENT_STATUS_BADGE = Object.freeze({
  [PAYMENT_STATUS.CREATED]: "warning",
  [PAYMENT_STATUS.PAID]: "brand",
  [PAYMENT_STATUS.REFUND_DUE]: "danger",
});

export const OFFLINE_PAYMENT_MODE = Object.freeze({
  CASH: 1,
  UPI: 2,
  BANK_TRANSFER: 3,
  OTHER: 4,
});

export const OFFLINE_PAYMENT_MODE_LABEL = Object.freeze({
  [OFFLINE_PAYMENT_MODE.CASH]: "Cash",
  [OFFLINE_PAYMENT_MODE.UPI]: "UPI",
  [OFFLINE_PAYMENT_MODE.BANK_TRANSFER]: "Bank transfer",
  [OFFLINE_PAYMENT_MODE.OTHER]: "Other",
});

export const OFFLINE_PAYMENT_MODE_OPTIONS = Object.freeze(
  Object.values(OFFLINE_PAYMENT_MODE).map((mode) => ({
    label: OFFLINE_PAYMENT_MODE_LABEL[mode],
    value: mode,
  })),
);

export const PAYMENT_RULES = Object.freeze({
  MAX_OFFLINE_AMOUNT: 1000000,
  REFERENCE_MAX_LENGTH: 100,
});

export const RAZORPAY_CHECKOUT_URL = "https://checkout.razorpay.com/v1/checkout.js";

// "Online · Razorpay" / "Offline · UPI"
export const paymentMethodLabel = (payment) =>
  payment.method === PAYMENT_METHOD.ONLINE
    ? "Online · Razorpay"
    : `Offline · ${OFFLINE_PAYMENT_MODE_LABEL[payment.offlineMode] ?? "Other"}`;
