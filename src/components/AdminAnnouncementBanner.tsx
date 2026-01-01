import React from "react";
import { X } from "lucide-react";
import { useNotificationsList } from "../helpers/useNotifications";
import { useAuth } from "../helpers/useAuth";
import { useDismissedAnnouncements } from "../helpers/useDismissedAnnouncements";
import { Button } from "./Button";
import styles from "./AdminAnnouncementBanner.module.css";

export const AdminAnnouncementBanner = ({ className }: { className?: string }) => {
  const { authState } = useAuth();
  const { dismiss, isDismissed } = useDismissedAnnouncements();
  
  const isAuthenticated = authState.type === "authenticated";

    const { data, error } = useNotificationsList({ 
    page: 1, 
    limit: 5,
    unreadOnly: true
  });

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    console.error("Error fetching announcements:", error);
    return null;
  }

  const announcement = data?.notifications.find(
    (n) => n.type === "system_announcement" && !n.isRead && !isDismissed(n.id)
  );

  if (!announcement) {
    return null;
  }

  return (
    <div className={`${styles.banner} ${className || ""}`}>
      <div className={styles.content}>
        <div className={styles.icon}>📢</div>
        <div className={styles.text}>
          <h3 className={styles.title}>{announcement.title}</h3>
          <p className={styles.message}>{announcement.message}</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => dismiss(announcement.id)}
        className={styles.dismissButton}
        title="Đóng thông báo"
      >
        <X size={16} />
      </Button>
    </div>
  );
};