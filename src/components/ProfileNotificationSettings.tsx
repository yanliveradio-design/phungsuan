import React from "react";
import { Switch } from "./Switch";
import { Bell, Mail, Smartphone } from "lucide-react";
import {
  useNotificationSettings,
  useUpdateNotificationSettings,
} from "../helpers/useNotifications";
import { Skeleton } from "./Skeleton";
import styles from "./ProfileNotificationSettings.module.css";

export const ProfileNotificationSettings = () => {
  const { data, isLoading } = useNotificationSettings();
  const { mutate: updateSettings } = useUpdateNotificationSettings();

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <Skeleton style={{ width: "150px", height: "1.5rem" }} />
        </div>
        <div className={styles.settingsList}>
          <Skeleton style={{ width: "100%", height: "3rem" }} />
          <Skeleton style={{ width: "100%", height: "3rem" }} />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const handleToggle = (key: "emailEnabled" | "inAppEnabled", value: boolean) => {
    updateSettings({
      ...data.settings,
      // Ensure quiet hours fields are present and valid strings if they are null
      quietHoursStart: data.settings.quietHoursStart || "22:00",
      quietHoursEnd: data.settings.quietHoursEnd || "07:00",
      [key]: value,
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <Bell size={20} className={styles.icon} />
          Cài đặt thông báo
        </h2>
      </div>

      <div className={styles.settingsList}>
        <div className={styles.settingItem}>
          <div className={styles.settingInfo}>
            <div className={styles.settingLabel}>
              <Smartphone size={16} />
              <span>Thông báo trong ứng dụng</span>
            </div>
            <p className={styles.settingDesc}>
              Nhận thông báo trực tiếp trên web khi có hoạt động mới.
            </p>
          </div>
          <Switch
            checked={data.settings.inAppEnabled}
            onCheckedChange={(checked) => handleToggle("inAppEnabled", checked)}
          />
        </div>

        <div className={styles.settingItem}>
          <div className={styles.settingInfo}>
            <div className={styles.settingLabel}>
              <Mail size={16} />
              <span>Thông báo qua Email</span>
            </div>
            <p className={styles.settingDesc}>
              Nhận email tổng hợp về các hoạt động quan trọng.
            </p>
          </div>
          <Switch
            checked={data.settings.emailEnabled}
            onCheckedChange={(checked) => handleToggle("emailEnabled", checked)}
          />
        </div>
      </div>
    </div>
  );
};