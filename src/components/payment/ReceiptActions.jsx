import { useState } from "react";
import { Download, FileText } from "lucide-react";
import Button from "@/components/ui/Button";
import { downloadReceipt, viewReceipt } from "@/services/payment.service";

// View opens the PDF in a new tab; Download saves it as <receipt number>.pdf
const ReceiptActions = ({ payment, size = "sm" }) => {
  const [busy, setBusy] = useState(null);

  const run = async (action, task) => {
    setBusy(action);
    await task();
    setBusy(null);
  };

  return (
    <div className="flex shrink-0 gap-1">
      <Button
        size={size}
        variant="ghost"
        loading={busy === "view"}
        onClick={() => run("view", () => viewReceipt(payment.id))}
        startIcon={<FileText className="size-4" />}
        aria-label={`View receipt ${payment.receiptNumber}`}
      >
        View
      </Button>
      <Button
        size={size}
        variant="ghost"
        loading={busy === "download"}
        onClick={() => run("download", () => downloadReceipt(payment.id, payment.receiptNumber))}
        startIcon={<Download className="size-4" />}
        aria-label={`Download receipt ${payment.receiptNumber}`}
      >
        Download
      </Button>
    </div>
  );
};

export default ReceiptActions;
