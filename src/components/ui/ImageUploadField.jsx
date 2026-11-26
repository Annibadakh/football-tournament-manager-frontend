import { useRef } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import useImageUpload from "@/hooks/useImageUpload";
import { IMAGE_ACCEPT } from "@/constants/upload.constants";
import { cn } from "@/utils/cn";

/**
 * Image picker with preview. onUploaded(key) gets the S3 key after upload; onRemove clears it.
 * previewClassName sets the preview shape (square logo, wide banner).
 */
const ImageUploadField = ({
  label,
  previewUrl,
  purpose,
  compression,
  entityId,
  onUploaded,
  onRemove,
  disabled = false,
  previewClassName = "size-24 rounded-xl",
}) => {
  const fileInputRef = useRef(null);
  const { uploadImage, isUploading } = useImageUpload({ purpose, compression, entityId });

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const key = await uploadImage(file);
    if (key) onUploaded(key);
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold text-fg-muted">{label}</p>
      <div className="flex flex-wrap items-center gap-3">
        <div
          className={cn(
            "flex items-center justify-center overflow-hidden border border-dashed border-line bg-surface-muted",
            previewClassName,
          )}
        >
          {previewUrl ? (
            <img src={previewUrl} alt={label} className="size-full object-cover" />
          ) : (
            <ImagePlus className="size-6 text-fg-muted" aria-hidden="true" />
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={IMAGE_ACCEPT}
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            loading={isUploading}
            disabled={disabled}
            onClick={() => fileInputRef.current?.click()}
          >
            {previewUrl ? "Change" : "Upload"}
          </Button>
          {previewUrl && onRemove && (
            <Button
              size="sm"
              variant="ghost"
              disabled={disabled || isUploading}
              onClick={onRemove}
              startIcon={<Trash2 className="size-4" />}
            >
              Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageUploadField;
