import { useEffect, useState } from "react";
import { AlertTriangle, CreditCard, IndianRupee, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import PaymentStatusBadge from "@/components/payment/PaymentStatusBadge";
import ReceiptActions from "@/components/payment/ReceiptActions";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";
import { PAYMENT_STATUS, paymentMethodLabel } from "@/constants/payment.constants";
import { TEAM_STATUS } from "@/constants/team.constants";
import * as paymentService from "@/services/payment.service";
import { formatDateTime } from "@/utils/date";
import { formatCurrency } from "@/utils/number";
import { loadRazorpayCheckout, openRazorpayCheckout } from "@/utils/razorpay";

const BRAND_COLOR = "#0F7B3F";

const ChargeRow = ({ label, value, isTotal = false }) => (
  <div
    className={
      isTotal
        ? "flex justify-between border-t border-line pt-2 font-semibold text-fg"
        : "flex justify-between text-fg-muted"
    }
  >
    <span>{label}</span>
    <span className={isTotal ? "" : "text-fg"}>{formatCurrency(value)}</span>
  </div>
);

const Notice = ({ tone = "muted", icon: Icon, children }) => (
  <p
    className={
      tone === "warning"
        ? "flex items-start gap-2 rounded-lg bg-amber-100 px-3 py-2 text-sm text-warning dark:bg-amber-950 dark:text-amber-300"
        : "flex items-start gap-2 text-sm text-fg-muted"
    }
  >
    {Icon && <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />}
    <span>{children}</span>
  </p>
);

// Entry fee, pay button (captain), offline recording (organizer) and receipts
const PaymentCard = ({ team, isCaptain, isManager, onTeamChanged, onRecordOffline }) => {
  const [info, setInfo] = useState(null);
  const [isPaying, setIsPaying] = useState(false);
  const isAwaiting = team.status === TEAM_STATUS.AWAITING_PAYMENT;

  useEffect(() => {
    let isCurrent = true;
    paymentService.getTeamPayments(team.id, { errorToast: false }).then((res) => {
      if (isCurrent) setInfo(res.ok ? res.data : { charges: null, payments: [] });
    });
    return () => {
      isCurrent = false;
    };
  }, [team.id, team.status]);

  const pay = async () => {
    setIsPaying(true);
    const [isLoaded, orderRes] = await Promise.all([
      loadRazorpayCheckout(),
      paymentService.createPaymentOrder(team.id),
    ]);
    if (!orderRes.ok) return setIsPaying(false);
    if (!isLoaded) {
      setIsPaying(false);
      return toast.error("Couldn't load the payment window. Check your connection and try again.");
    }

    const order = orderRes.data;
    const result = await openRazorpayCheckout(order, {
      brandColor: BRAND_COLOR,
      onFailure: (reason) => paymentService.recordPaymentFailure(order.paymentId, reason),
    });
    if (result.status === "success") {
      const verifyRes = await paymentService.verifyPayment(order.paymentId, {
        orderId: result.response.razorpay_order_id,
        paymentId: result.response.razorpay_payment_id,
        signature: result.response.razorpay_signature,
      });
      if (verifyRes.ok) onTeamChanged();
    } else if (result.failureReason) {
      setInfo((current) => ({ ...current, lastFailureReason: result.failureReason }));
    }
    setIsPaying(false);
  };

  if (!info) return <Skeleton className="h-40 w-full rounded-2xl" />;
  const { charges, payments } = info;
  // Nothing to pay and nothing paid (free entry, or a request that never got approved)
  if (payments.length === 0 && !(charges && isAwaiting)) return null;

  return (
    <Card
      title="Entry fee"
      subtitle={isAwaiting ? "Payment pending" : payments.length ? "Paid" : undefined}
      actions={
        isManager &&
        isAwaiting && (
          <Button
            size="sm"
            variant="outline"
            onClick={onRecordOffline}
            startIcon={<ShieldCheck className="size-4" />}
          >
            Record offline payment
          </Button>
        )
      }
    >
      <div className="flex flex-col gap-4">
        {charges && isAwaiting && (
          <div className="flex flex-col gap-1.5 text-sm">
            <ChargeRow label="Entry fee" value={charges.entryFee} />
            {isCaptain && (
              <>
                <ChargeRow
                  label={`Convenience fee (${charges.convenienceFeePercent}%)`}
                  value={charges.convenienceFee}
                />
                <ChargeRow label="Total to pay online" value={charges.total} isTotal />
              </>
            )}
          </div>
        )}

        {isCaptain && isAwaiting && info.lastFailureReason && (
          <Notice tone="warning" icon={AlertTriangle}>
            Last attempt failed: {info.lastFailureReason}. No money was taken; you can try again.
          </Notice>
        )}

        {isCaptain && isAwaiting && info.canPayOnline && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Notice icon={CreditCard}>
              Pay by UPI, card or net banking. Your team is confirmed as soon as the payment
              succeeds.
            </Notice>
            <Button
              loading={isPaying}
              onClick={pay}
              startIcon={<IndianRupee className="size-4" />}
              className="shrink-0"
            >
              Pay {formatCurrency(charges.total)}
            </Button>
          </div>
        )}
        {isCaptain && isAwaiting && !info.canPayOnline && (
          <Notice icon={CreditCard}>
            {info.isOnlineEnabled
              ? "Online payment is closed because the tournament has started. Pay the organizer directly; they will confirm your team."
              : "Online payment isn't available yet. Pay the organizer directly; they will confirm your team."}
          </Notice>
        )}

        {payments.length > 0 && (
          <ul className="flex flex-col divide-y divide-line rounded-xl border border-line">
            {payments.map((payment) => (
              <li
                key={payment.id}
                className="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:gap-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-fg">
                    {formatCurrency(payment.amount)}
                    <PaymentStatusBadge status={payment.status} />
                  </p>
                  <p className="text-xs text-fg-muted">
                    {paymentMethodLabel(payment)} · {formatDateTime(payment.paidAt)} ·{" "}
                    {payment.receiptNumber}
                    {payment.reference && ` · Ref ${payment.reference}`}
                  </p>
                  {payment.status === PAYMENT_STATUS.REFUND_DUE && (
                    <p className="text-xs text-danger">
                      Arrived after the team was confirmed another way. This amount is refunded
                      outside the app.
                    </p>
                  )}
                </div>
                <ReceiptActions payment={payment} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
};

export default PaymentCard;
