import { useId } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

// Modal with a form body and Cancel / Submit footer; the submit button posts the form by id
const FormModal = ({
  open,
  onClose,
  title,
  submitText = "Save",
  submitVariant = "primary",
  isSubmitting = false,
  onSubmit,
  size,
  children,
}) => {
  const formId = useId();

  return (
    <Modal
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      title={title}
      size={size}
      closeOnOverlayClick={!isSubmitting}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form={formId} variant={submitVariant} loading={isSubmitting}>
            {submitText}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        {children}
      </form>
    </Modal>
  );
};

export default FormModal;
