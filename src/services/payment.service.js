import { toast } from "sonner";
import apiClient from "@/services/apiClient";
import { request } from "@/services/request";

export const getTeamPayments = (teamId, options) =>
  request({ method: "get", url: `/teams/${teamId}/payments` }, options);

export const createPaymentOrder = (teamId) =>
  request({ method: "post", url: `/teams/${teamId}/payment-orders` }, { successToast: false });

export const verifyPayment = (paymentId, data) =>
  request(
    { method: "post", url: `/payments/${paymentId}/verification`, data },
    { loadingMessage: "Confirming your payment..." },
  );

export const recordPaymentFailure = (paymentId, reason) =>
  request(
    { method: "post", url: `/payments/${paymentId}/failure`, data: { reason } },
    { successToast: false, errorToast: false },
  );

export const recordOfflinePayment = (teamId, data) =>
  request({ method: "patch", url: `/teams/${teamId}/confirmation`, data });

// Error bodies arrive as a Blob when a file was requested, so read the JSON message from it
const blobErrorMessage = async (error) => {
  try {
    return JSON.parse(await error.response.data.text()).message;
  } catch {
    return "Couldn't open the receipt. Please try again.";
  }
};

// Receipt PDFs need the auth header, so they are fetched as a blob (not a plain link)
const fetchReceipt = async (paymentId, { download = false } = {}) => {
  try {
    const response = await apiClient.get(`/payments/${paymentId}/receipt`, {
      params: download ? { download: 1 } : undefined,
      responseType: "blob",
    });
    return { ok: true, blob: response.data };
  } catch (error) {
    toast.error(error.response ? await blobErrorMessage(error) : "Unable to reach the server.");
    return { ok: false };
  }
};

// Opens the tab synchronously (so popup blockers allow it), then loads the PDF into it
export const viewReceipt = async (paymentId) => {
  const tab = window.open("", "_blank");
  const res = await fetchReceipt(paymentId);
  if (!res.ok) {
    tab?.close();
    return;
  }
  const url = URL.createObjectURL(new Blob([res.blob], { type: "application/pdf" }));
  if (tab) tab.location.href = url;
  else window.location.assign(url);
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

export const downloadReceipt = async (paymentId, receiptNumber) => {
  const res = await fetchReceipt(paymentId, { download: true });
  if (!res.ok) return;
  const url = URL.createObjectURL(res.blob);
  const link = Object.assign(document.createElement("a"), {
    href: url,
    download: `${receiptNumber}.pdf`,
  });
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
};
