import React, { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./Avatar";
import { Spinner } from "./Spinner";
import { Camera } from "lucide-react";
import { useUpdateAvatar } from "../helpers/useUpdateAvatar";
import { toast } from "sonner";
import styles from "./ProfileAvatar.module.css";

interface ProfileAvatarProps {
  avatarUrl: string | null;
  fullName: string;
  className?: string;
  onAvatarUpdate?: () => void;
}

const MAX_FILE_SIZE = 500 * 1024; // 500KB

export const ProfileAvatar = ({
  avatarUrl,
  fullName,
  className,
  onAvatarUpdate,
}: ProfileAvatarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: updateAvatar, isPending } = useUpdateAvatar();
  const [isHovering, setIsHovering] = useState(false);

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleContainerClick = () => {
    if (!isPending) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Kích thước ảnh không được vượt quá 500KB");
      // Reset input so same file can be selected again if needed (though unlikely immediately useful here)
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      
      updateAvatar(
        { avatarData: base64String },
        {
          onSuccess: () => {
            toast.success("Cập nhật ảnh đại diện thành công");
            onAvatarUpdate?.();
          },
          onError: (error) => {
            toast.error(error.message || "Không thể cập nhật ảnh đại diện");
          },
        }
      );
    };
    reader.onerror = () => {
      toast.error("Lỗi khi đọc file ảnh");
    };
    reader.readAsDataURL(file);
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div 
      className={`${styles.container} ${className || ""}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={handleContainerClick}
    >
      <input
        type="file"
        ref={fileInputRef}
        className={styles.hiddenInput}
        accept="image/*"
        onChange={handleFileChange}
        disabled={isPending}
      />
      
      <Avatar className={styles.avatar}>
        <AvatarImage src={avatarUrl ?? undefined} alt={fullName} />
        <AvatarFallback className={styles.avatarFallback}>
          {initials}
        </AvatarFallback>
      </Avatar>

      {(isHovering || isPending) && (
        <div className={styles.overlay}>
          {isPending ? (
            <Spinner size="md" className={styles.spinner} />
          ) : (
            <Camera className={styles.cameraIcon} size={24} />
          )}
        </div>
      )}
    </div>
  );
};