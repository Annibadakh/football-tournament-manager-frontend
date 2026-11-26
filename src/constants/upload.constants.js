// Mirrors backend constants/upload.constants.js
export const UPLOAD_PURPOSE = Object.freeze({
  PROFILE_PHOTO: 1,
});

export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";

// Compressed in the browser before upload (backend allows up to 2 MB)
export const PROFILE_PHOTO_COMPRESSION = Object.freeze({
  maxSizeMB: 0.4,
  maxWidthOrHeight: 800,
  fileType: "image/webp",
  initialQuality: 0.85,
});
