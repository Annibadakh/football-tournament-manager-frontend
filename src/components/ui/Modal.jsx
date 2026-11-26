import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";

const SIZES = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-3xl",
  full: "max-w-[calc(100vw-2rem)] h-[calc(100dvh-2rem)]",
};

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const Modal = ({
  open,
  onClose,
  title,
  size = "md",
  footer,
  closeOnOverlayClick = true,
  className = "",
  children,
}) => {
  const titleId = useId();
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Lock page scroll, move focus inside, and restore focus to the opener on close
  useEffect(() => {
    if (!open) return undefined;
    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const firstFocusable = dialogRef.current?.querySelector(FOCUSABLE_SELECTOR);
    (firstFocusable ?? dialogRef.current)?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open]);

  // Escape closes; Tab cycles within the dialog (focus trap)
  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      onCloseRef.current?.();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = [...dialogRef.current.querySelectorAll(FOCUSABLE_SELECTOR)];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div
        className="absolute inset-0 bg-ink-950/60 backdrop-blur-[2px]"
        aria-hidden="true"
        onClick={closeOnOverlayClick ? () => onCloseRef.current?.() : undefined}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={cn(
          "relative flex max-h-[calc(100dvh-2rem)] w-full flex-col rounded-2xl border border-line bg-surface shadow-xl outline-none",
          SIZES[size] ?? SIZES.md,
          className,
        )}
      >
        <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
          <h2 id={titleId} className="text-lg text-fg">
            {title}
          </h2>
          <button
            type="button"
            onClick={() => onCloseRef.current?.()}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-fg-muted hover:bg-surface-muted hover:text-fg"
          >
            <X className="size-5" />
          </button>
        </header>
        <div className="overflow-y-auto px-5 py-4 text-fg">{children}</div>
        {footer && (
          <footer className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-3">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
