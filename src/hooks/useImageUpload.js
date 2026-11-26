import { useState } from "react";
import { compressImage, uploadFile } from "@/services/upload.service";

/**
 * Compress in the browser, then upload straight to S3. Returns the object key (or null).
 * entityId ties the file to its owner (e.g. tournament id for logos).
 */
const useImageUpload = ({ purpose, compression, entityId }) => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = async (file) => {
    setIsUploading(true);
    const compressed = await compressImage(file, compression);
    const result = await uploadFile(compressed, purpose, entityId);
    setIsUploading(false);
    return result.ok ? result.key : null;
  };

  return { uploadImage, isUploading };
};

export default useImageUpload;
