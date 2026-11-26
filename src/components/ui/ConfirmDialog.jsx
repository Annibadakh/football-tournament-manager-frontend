import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

// Replaces window.confirm; keep the dialog open while the action runs (loading)
const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
}) => (
  <Modal
    open={open}
    onClose={loading ? undefined : onClose}
    title={title}
    size="sm"
    closeOnOverlayClick={!loading}
    footer={
      <>
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button variant={variant} onClick={onConfirm} loading={loading}>
          {confirmText}
        </Button>
      </>
    }
  >
    <p className="text-sm text-fg-muted">{message}</p>
  </Modal>
);

export default ConfirmDialog;
