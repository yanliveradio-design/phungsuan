import React from "react";
import { Skeleton } from "./Skeleton";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { MapPin } from "lucide-react";
import { ProfileAvatar } from "./ProfileAvatar";
import { useMemberTitles } from "../helpers/useMemberTitles";
import { MemberTitleBadge } from "./MemberTitleBadge";
import styles from "./ProfileHeader.module.css";

interface UserProfile {
  fullName: string;
  email: string;
  avatarUrl: string | null;
  isTrustedMember: boolean;
  joinedAt: Date;
  province: string | null;
  district: string | null;
}

interface ProfileHeaderProps {
  user?: UserProfile;
  isLoading: boolean;
  onAvatarUpdate?: () => void;
}

export const ProfileHeader = ({ user, isLoading, onAvatarUpdate }: ProfileHeaderProps) => {
  const { data: titlesData, isLoading: titlesLoading } = useMemberTitles();
  const showSkeleton = isLoading || titlesLoading;

  if (showSkeleton) {
    return (
      <div className={styles.container}>
        <Skeleton className={styles.avatarSkeleton} />
        <div className={styles.infoSkeleton}>
          <Skeleton className={styles.nameSkeleton} />
          <Skeleton className={styles.titlesSkeleton} />
          <Skeleton className={styles.emailSkeleton} />
          <Skeleton className={styles.locationSkeleton} />
          <Skeleton className={styles.dateSkeleton} />
        </div>
      </div>
    );
  }

  if (!user) return null;

  const locationText =
    user.district && user.province
      ? `${user.district}, ${user.province}`
      : "Chưa cập nhật địa điểm";

  return (
    <div className={styles.container}>
      <ProfileAvatar
        avatarUrl={user.avatarUrl}
        fullName={user.fullName}
        onAvatarUpdate={onAvatarUpdate}
      />

      <div className={styles.info}>
        <div className={styles.nameRow}>
          <h1 className={styles.name}>{user.fullName}</h1>
          {titlesData?.titles && titlesData.titles.length > 0 && (
            <div className={styles.badgesContainer}>
              {titlesData.titles.map((title) => (
                <MemberTitleBadge
                  key={title.id}
                  name={title.name}
                  color={title.color}
                  size="md"
                />
              ))}
            </div>
          )}
        </div>
        <p className={styles.email}>{user.email}</p>

        <div className={styles.locationRow}>
          <MapPin size={16} className={styles.locationIcon} />
          <span className={styles.locationText}>{locationText}</span>
        </div>

        <p className={styles.joinedDate}>
          Tham gia từ{" "}
          {format(new Date(user.joinedAt), "d MMMM, yyyy", { locale: vi })}
        </p>
      </div>
    </div>
  );
};