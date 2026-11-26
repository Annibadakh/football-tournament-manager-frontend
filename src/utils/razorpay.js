import { RAZORPAY_CHECKOUT_URL } from "@/constants/payment.constants";

let scriptPromise = null;

// Loads Razorpay Checkout once, on first use
export const loadRazorpayCheckout = () => {
  if (window.Razorpay) return Promise.resolve(true);
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = RAZORPAY_CHECKOUT_URL;
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => {
        scriptPromise = null;
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }
  return scriptPromise;
};

/**
 * Opens Checkout for a server-created order.
 * Resolves { status: "success", response } or { status: "dismissed", failureReason }.
 * Failed attempts keep the modal open so the payer can retry with another method.
 */
export const openRazorpayCheckout = (order, { brandColor, onFailure } = {}) =>
  new Promise((resolve) => {
    let failureReason = null;
    const checkout = new window.Razorpay({
      key: order.keyId,
      order_id: order.orderId,
      amount: order.amountPaise,
      currency: order.currency,
      name: "Maidaan",
      description: order.description,
      prefill: order.prefill,
      theme: { color: brandColor },
      handler: (response) => resolve({ status: "success", response }),
      modal: { ondismiss: () => resolve({ status: "dismissed", failureReason }) },
    });
    checkout.on("payment.failed", ({ error }) => {
      failureReason = error?.description ?? "Payment failed";
      onFailure?.(failureReason);
    });
    checkout.open();
  });
