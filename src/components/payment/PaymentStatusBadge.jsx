import Badge from "@/components/ui/Badge";
import { PAYMENT_STATUS_BADGE, PAYMENT_STATUS_LABEL } from "@/constants/payment.constants";

const PaymentStatusBadge = ({ status, size = "sm" }) => (
  <Badge size={size} variant={PAYMENT_STATUS_BADGE[status]}>
    {PAYMENT_STATUS_LABEL[status]}
  </Badge>
);

export default PaymentStatusBadge;
