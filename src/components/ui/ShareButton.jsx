import { useEffect, useRef, useState } from "react";
import { Check, Link2, MessageCircle, Share2 } from "lucide-react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";

const canUseNativeShare = () =>
  typeof navigator !== "undefined" && typeof navigator.share === "function";

/**
 * Share a page: phones open the native share sheet; elsewhere a small menu offers
 * WhatsApp and Copy link. Link previews (title/image) arrive later with server rendering.
 */
const ShareButton = ({ title, text, url, size = "sm", variant = "outline", className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef(null);
  const shareUrl = url ?? (typeof window !== "undefined" ? window.location.href : "");
  const message = [text ?? title, shareUrl].filter(Boolean).join("\n");

  useEffect(() => {
    if (!isOpen) return undefined;
    const close = (event) => {
      if (!containerRef.current?.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [isOpen]);

  const share = async () => {
    if (canUseNativeShare()) {
      try {
        await navigator.share({ title, text: text ?? title, url: shareUrl });
      } catch {
        // Cancelled by the user
      }
      return;
    }
    setIsOpen((open) => !open);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy. Select the address bar and copy it instead.");
    }
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <Button
        size={size}
        variant={variant}
        onClick={share}
        startIcon={<Share2 className="size-4" />}
        aria-expanded={isOpen}
      >
        Share
      </Button>
      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 w-48 overflow-hidden rounded-xl border border-line bg-surface shadow-lg"
        >
          <a
            role="menuitem"
            href={`https://wa.me/?text=${encodeURIComponent(message)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 text-sm text-fg hover:bg-surface-muted"
          >
            <MessageCircle className="size-4 text-brand-600" aria-hidden="true" /> WhatsApp
          </a>
          <button
            type="button"
            role="menuitem"
            onClick={copy}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-fg hover:bg-surface-muted"
          >
            {copied ? (
              <Check className="size-4" aria-hidden="true" />
            ) : (
              <Link2 className="size-4" aria-hidden="true" />
            )}
            Copy link
          </button>
        </div>
      )}
    </div>
  );
};

export default ShareButton;
