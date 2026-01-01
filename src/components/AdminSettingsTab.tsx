import React from "react";
import { useSettings, useUpdateSetting } from "../helpers/useAdminSettings";
import { useAuth } from "../helpers/useAuth";
import { Button } from "./Button";
import { Input } from "./Input";
import { Skeleton } from "./Skeleton";
import { Separator } from "./Separator";
import { Save } from "lucide-react";
import { AdminUserManagement } from "./AdminUserManagement";
import { AdminThemeManager } from "./AdminThemeManager";
import { AdminBrandingManager } from "./AdminBrandingManager";
import styles from "./AdminSettingsTab.module.css";

export const AdminSettingsTab = ({ className }: { className?: string }) => {
  const { authState } = useAuth();
  const currentUser = authState.type === "authenticated" ? authState.user : null;
  const { data, isFetching } = useSettings();
  const updateMutation = useUpdateSetting();

  const settings = data?.settings || [];
  const [localValues, setLocalValues] = React.useState<
    Record<string, number>
  >({});

  React.useEffect(() => {
    if (settings.length > 0) {
      const values: Record<string, number> = {};
      settings.forEach((setting) => {
        values[setting.settingKey] = setting.settingValue;
      });
      setLocalValues(values);
    }
  }, [settings]);

  const handleSave = async (settingKey: string) => {
    await updateMutation.mutateAsync({
      settingKey,
      settingValue: localValues[settingKey],
    });
  };

  const handleChange = (settingKey: string, value: string) => {
    setLocalValues((prev) => ({
      ...prev,
      [settingKey]: parseInt(value) || 0,
    }));
  };

  const getSettingLabel = (key: string): string => {
    const labels: Record<string, string> = {
      publish_limit_per_topic: "Giới hạn xuất bản mỗi chủ đề",
    };
    return labels[key] || key;
  };

  const getSettingDescription = (key: string): string => {
    const descriptions: Record<string, string> = {
      publish_limit_per_topic:
        "Số lượng feedback tối đa được xuất bản cho mỗi chủ đề",
    };
    return descriptions[key] || "";
  };

  if (isFetching) {
    return (
      <div className={`${styles.container} ${className || ""}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>Cài đặt Hệ thống</h2>
        </div>
        <div className={styles.loadingState}>
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} style={{ height: "5rem" }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className || ""}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>Cài đặt Hệ thống</h2>
      </div>

      <div className={styles.settingsList}>
        {settings.map((setting) => (
          <div key={setting.id} className={styles.settingCard}>
            <div className={styles.settingInfo}>
              <h3 className={styles.settingLabel}>
                {getSettingLabel(setting.settingKey)}
              </h3>
              <p className={styles.settingDescription}>
                {getSettingDescription(setting.settingKey)}
              </p>
            </div>
            <div className={styles.settingControl}>
              <div className={styles.currentValue}>
                <span className={styles.valueLabel}>Giá trị hiện tại:</span>
                <span className={styles.valueNumber}>
                  {setting.settingValue}
                </span>
              </div>
              <div className={styles.settingInput}>
                <Input
                  type="number"
                  value={localValues[setting.settingKey] || 0}
                  onChange={(e) =>
                    handleChange(setting.settingKey, e.target.value)
                  }
                  min="0"
                />
                <Button
                  onClick={() => handleSave(setting.settingKey)}
                  disabled={
                    updateMutation.isPending ||
                    localValues[setting.settingKey] === setting.settingValue
                  }
                >
                  <Save size={16} />
                  Lưu
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {settings.length === 0 && (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>Chưa có cài đặt nào.</p>
        </div>
      )}

      {currentUser?.adminRole === "super_admin" && (
        <>
          <Separator className={styles.separator} />
          <AdminUserManagement />

          <Separator className={styles.separator} />
          <AdminThemeManager />

          <Separator className={styles.separator} />
          <AdminBrandingManager />
        </>
      )}
    </div>
  );
};