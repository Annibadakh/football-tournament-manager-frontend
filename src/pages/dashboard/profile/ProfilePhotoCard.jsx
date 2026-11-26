import { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { Camera, Trash2 } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import {
  IMAGE_ACCEPT,
  PROFILE_PHOTO_COMPRESSION,
  UPLOAD_PURPOSE,
} from "@/constants/upload.constants";
import { updateMyProfile } from "@/services/me.service";
import { compressImage, uploadFile } from "@/services/upload.service";
import { setUser } from "@/store/slices/authSlice";

const ProfilePhotoCard = ({ user }) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const savePhotoKey = async (photoKey) => {
    const res = await updateMyProfile({ photoKey });
    if (res.ok) dispatch(setUser(res.data));
  };

  // Compress in the browser, upload straight to S3, then save the key on the profile
  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsUploading(true);
    const compressed = await compressImage(file, PROFILE_PHOTO_COMPRESSION);
    const upload = await uploadFile(compressed, UPLOAD_PURPOSE.PROFILE_PHOTO);
    if (upload.ok) await savePhotoKey(upload.key);
    setIsUploading(false);
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    await savePhotoKey(null);
    setIsRemoving(false);
  };

  return (
    <Card title="Profile photo" subtitle="Shown on your public profile and team lists">
      <div className="flex flex-wrap items-center gap-5">
        <Avatar src={user.photoUrl} name={user.fullName} size="xl" />
        <div className="flex flex-wrap gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={IMAGE_ACCEPT}
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            loading={isUploading}
            startIcon={<Camera className="size-4" />}
          >
            {user.photoUrl ? "Change photo" : "Upload photo"}
          </Button>
          {user.photoUrl && (
            <Button
              variant="ghost"
              onClick={handleRemove}
              loading={isRemoving}
              startIcon={<Trash2 className="size-4" />}
            >
              Remove
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ProfilePhotoCard;
