import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Bell,
  Settings,
  Check,
  Clock,
  MoreHorizontal,
  Mail,
  Smartphone,
  Moon,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  useNotificationsList,
  useUnreadCount,
  useMarkNotificationsRead,
  useNotificationSettings,
  useUpdateNotificationSettings,
  useDeleteAllNotifications,
} from "../helpers/useNotifications";
import { Button } from "./Button";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./Dialog";
import { Switch } from "./Switch";
import { Input } from "./Input";
import { Skeleton } from "./Skeleton";
import { Badge } from "./Badge";
import { Form, FormItem, FormLabel, FormControl, FormDescription, useForm } from "./Form";
import { z } from "zod";
import styles from "./NotificationCenter.module.css";

export const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  const { data: unreadCount = 0 } = useUnreadCount();
  const { data: notificationsData, isLoading, refetch } = useNotificationsList({
    page: 1,
    limit: 20,
  });
  
  const markReadMutation = useMarkNotificationsRead();
  const deleteAllMutation = useDeleteAllNotifications();

  const handleMarkAllRead = () => {
    markReadMutation.mutate({ markAll: true });
  };

  const handleMarkRead = (id: number) => {
    markReadMutation.mutate({ notificationIds: [id] });
  };

  const handleDeleteAll = () => {
    if (
      window.confirm(
        "Bạn có chắc muốn xóa tất cả thông báo? Hành động này không thể hoàn tác.",
      )
    ) {
      deleteAllMutation.mutate({});
    }
  };

  const notifications = notificationsData?.notifications || [];

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className={styles.bellButton}>
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className={styles.badge}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className={styles.popoverContent} align="end" sideOffset={8}>
          <div className={styles.header}>
            <h3 className={styles.title}>Thông báo</h3>
            <div className={styles.headerActions}>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setSettingsOpen(true)}
                title="Cài đặt thông báo"
              >
                <Settings size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleMarkAllRead}
                title="Đánh dấu tất cả đã đọc"
                disabled={unreadCount === 0}
              >
                <Check size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleDeleteAll}
                title="Xóa tất cả"
                disabled={notifications.length === 0}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>

          <div className={styles.listContainer}>
            {isLoading ? (
              <div className={styles.loadingState}>
                {[1, 2, 3].map((i) => (
                  <div key={i} className={styles.skeletonItem}>
                    <Skeleton className={styles.skeletonAvatar} />
                    <div className={styles.skeletonContent}>
                      <Skeleton className={styles.skeletonTitle} />
                      <Skeleton className={styles.skeletonText} />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className={styles.emptyState}>
                <Bell size={32} className={styles.emptyIcon} />
                <p>Không có thông báo nào</p>
              </div>
            ) : (
              <div className={styles.list}>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`${styles.item} ${!notification.isRead ? styles.unread : ""}`}
                    onClick={() => !notification.isRead && handleMarkRead(notification.id)}
                  >
                    {!notification.isRead && <div className={styles.unreadDot} />}
                    <div className={styles.itemContent}>
                      <div className={styles.itemHeader}>
                        <span className={styles.itemTitle}>{notification.title}</span>
                        <span className={styles.timeAgo}>
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: vi,
                          })}
                        </span>
                      </div>
                      <p className={styles.itemMessage}>{notification.message}</p>
                      {notification.link && (
                        <Link 
                          to={notification.link} 
                          className={styles.itemLink}
                          onClick={() => setIsOpen(false)}
                        >
                          Xem chi tiết
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.footer}>
            <Button variant="ghost" size="sm" className={styles.viewAllBtn}>
              Xem tất cả
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <NotificationSettingsDialog 
        open={settingsOpen} 
        onOpenChange={setSettingsOpen} 
      />
    </>
  );
};

const settingsSchema = z.object({
  emailEnabled: z.boolean(),
  inAppEnabled: z.boolean(),
  quietHoursEnabled: z.boolean(),
  quietHoursStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Định dạng giờ không hợp lệ (HH:MM)"),
  quietHoursEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Định dạng giờ không hợp lệ (HH:MM)"),
});

const NotificationSettingsDialog = ({ 
  open, 
  onOpenChange 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) => {
  const { data: settingsData, isLoading } = useNotificationSettings();
  const updateSettingsMutation = useUpdateNotificationSettings();

  const form = useForm({
    defaultValues: {
      emailEnabled: true,
      inAppEnabled: true,
      quietHoursEnabled: false,
      quietHoursStart: "22:00",
      quietHoursEnd: "07:00",
    },
    schema: settingsSchema,
  });

  // Sync data when loaded
  React.useEffect(() => {
    if (settingsData?.settings) {
      const s = settingsData.settings;
      form.setValues({
        emailEnabled: s.emailEnabled,
        inAppEnabled: s.inAppEnabled,
        quietHoursEnabled: s.quietHoursEnabled,
        quietHoursStart: s.quietHoursStart || "22:00",
        quietHoursEnd: s.quietHoursEnd || "07:00",
      });
    }
  }, [settingsData, form.setValues]);

  const handleSubmit = (values: z.infer<typeof settingsSchema>) => {
    updateSettingsMutation.mutate(values, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={styles.dialogContent}>
        <DialogHeader>
          <DialogTitle>Cài đặt thông báo</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className={styles.dialogLoading}>
            <Skeleton style={{ height: "40px", marginBottom: "1rem" }} />
            <Skeleton style={{ height: "40px", marginBottom: "1rem" }} />
            <Skeleton style={{ height: "100px" }} />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className={styles.settingsForm}>
              <div className={styles.settingGroup}>
                <div className={styles.settingRow}>
                  <div className={styles.settingInfo}>
                    <div className={styles.settingIcon}>
                      <Mail size={18} />
                    </div>
                    <div>
                      <p className={styles.settingLabel}>Email thông báo</p>
                      <p className={styles.settingDesc}>Nhận thông báo qua email đăng ký</p>
                    </div>
                  </div>
                  <div className={styles.settingControl}>
                    <Badge variant="secondary" className={styles.comingSoon}>Sắp ra mắt</Badge>
                    <FormItem name="emailEnabled">
                      <FormControl>
                        <Switch 
                          checked={form.values.emailEnabled} 
                          onCheckedChange={(c) => form.setValues(prev => ({ ...prev, emailEnabled: c }))}
                          disabled
                        />
                      </FormControl>
                    </FormItem>
                  </div>
                </div>

                <div className={styles.settingRow}>
                  <div className={styles.settingInfo}>
                    <div className={styles.settingIcon}>
                      <Smartphone size={18} />
                    </div>
                    <div>
                      <p className={styles.settingLabel}>Thông báo trong ứng dụng</p>
                      <p className={styles.settingDesc}>Hiển thị thông báo trên web</p>
                    </div>
                  </div>
                  <FormItem name="inAppEnabled">
                    <FormControl>
                      <Switch 
                        checked={form.values.inAppEnabled} 
                        onCheckedChange={(c) => form.setValues(prev => ({ ...prev, inAppEnabled: c }))}
                      />
                    </FormControl>
                  </FormItem>
                </div>
              </div>

              <div className={styles.settingGroup}>
                <div className={styles.settingRow}>
                  <div className={styles.settingInfo}>
                    <div className={styles.settingIcon}>
                      <Moon size={18} />
                    </div>
                    <div>
                      <p className={styles.settingLabel}>Giờ yên tĩnh</p>
                      <p className={styles.settingDesc}>Tắt thông báo trong khoảng thời gian này</p>
                    </div>
                  </div>
                  <FormItem name="quietHoursEnabled">
                    <FormControl>
                      <Switch 
                        checked={form.values.quietHoursEnabled} 
                        onCheckedChange={(c) => form.setValues(prev => ({ ...prev, quietHoursEnabled: c }))}
                      />
                    </FormControl>
                  </FormItem>
                </div>

                {form.values.quietHoursEnabled && (
                  <div className={styles.timeInputs}>
                    <FormItem name="quietHoursStart" className={styles.timeField}>
                      <FormLabel>Bắt đầu</FormLabel>
                      <FormControl>
                        <Input 
                          type="time" 
                          value={form.values.quietHoursStart}
                          onChange={(e) => form.setValues(prev => ({ ...prev, quietHoursStart: e.target.value }))}
                        />
                      </FormControl>
                    </FormItem>
                    <span className={styles.timeSeparator}>-</span>
                    <FormItem name="quietHoursEnd" className={styles.timeField}>
                      <FormLabel>Kết thúc</FormLabel>
                      <FormControl>
                        <Input 
                          type="time" 
                          value={form.values.quietHoursEnd}
                          onChange={(e) => form.setValues(prev => ({ ...prev, quietHoursEnd: e.target.value }))}
                        />
                      </FormControl>
                    </FormItem>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Hủy</Button>
                <Button type="submit" disabled={updateSettingsMutation.isPending}>Lưu cài đặt</Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};