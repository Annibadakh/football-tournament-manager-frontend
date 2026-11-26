import axios from "axios";
import imageCompression from "browser-image-compression";
// Bundled copy of the library for the compression web worker (its default loads it from a public CDN)
import compressionWorkerLibUrl from "browser-image-compression/dist/browser-image-compression.js?url";
import { request } from "@/services/request";
import { toast } from "sonner";

const UPLOAD_FAILED_MESSAGE = "Upload failed. Please try again.";

export const compressImage = (file, options) =>
  imageCompression(file, { useWebWorker: true, libURL: compressionWorkerLibUrl, ...options });

/**
 * Two-step upload: the API returns a presigned POST, then the browser sends the file straight to S3.
 * Returns { ok, key } where key is saved on the related record (e.g. photoKey).
 */
export const uploadFile = async (file, purpose) => {
  const presign = await request(
    {
      method: "post",
      url: "/uploads",
      data: { purpose, contentType: file.type, size: file.size },
    },
    { successToast: false },
  );
  if (!presign.ok) return { ok: false, key: null };

  const form = new FormData();
  Object.entries(presign.data.fields).forEach(([name, value]) => form.append(name, value));
  form.append("file", file);

  try {
    // Plain axios: S3 must not receive our auth header or cookies
    await axios.post(presign.data.url, form);
    return { ok: true, key: presign.data.key };
  } catch {
    toast.error(UPLOAD_FAILED_MESSAGE);
    return { ok: false, key: null };
  }
};
