import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotificationsList, NotificationListParams } from "../endpoints/notifications/list_GET.schema";
import { postMarkNotificationsRead } from "../endpoints/notifications/mark-read_POST.schema";
import { postDeleteAllNotifications } from "../endpoints/notifications/delete-all_POST.schema";
import { getNotificationSettings } from "../endpoints/notifications/settings_GET.schema";
import { postUpdateNotificationSettings } from "../endpoints/notifications/settings_POST.schema";
import { postAdminSendNotification } from "../endpoints/admin/notifications/send_POST.schema";
import { getAdminNotificationHistory, NotificationHistoryParams } from "../endpoints/admin/notifications/history_GET.schema";
import { postAdminPreviewRecipients } from "../endpoints/admin/notifications/preview_POST.schema";
import { toast } from "sonner";

export const NOTIFICATIONS_KEY = ["notifications", "list"];
export const NOTIFICATION_SETTINGS_KEY = ["notifications", "settings"];
export const ADMIN_NOTIFICATION_HISTORY_KEY = ["admin", "notifications", "history"];

export function useNotificationsList(params: NotificationListParams) {
  return useQuery({
    queryKey: [...NOTIFICATIONS_KEY, params],
    queryFn: () => getNotificationsList(params),
    // Refresh more often for notifications
    refetchInterval: 30000, 
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: [...NOTIFICATIONS_KEY, "unread-count"],
    queryFn: async () => {
            const data = await getNotificationsList({ page: 1, limit: 1, unreadOnly: true });
      return data.unreadCount;
    },
    refetchInterval: 30000,
  });
}

export function useMarkNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postMarkNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });
}

export function useDeleteAllNotifications() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postDeleteAllNotifications,
    onSuccess: () => {
      toast.success("Đã xóa tất cả thông báo");
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useNotificationSettings() {
  return useQuery({
    queryKey: NOTIFICATION_SETTINGS_KEY,
    queryFn: () => getNotificationSettings(),
  });
}

export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postUpdateNotificationSettings,
    onSuccess: () => {
      toast.success("Đã cập nhật cài đặt thông báo");
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_SETTINGS_KEY });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useAdminSendNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postAdminSendNotification,
    onSuccess: (data) => {
      toast.success(`Đã gửi thông báo tới ${data.recipientCount} người dùng`);
      queryClient.invalidateQueries({ queryKey: ADMIN_NOTIFICATION_HISTORY_KEY });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useAdminNotificationHistory(params: NotificationHistoryParams) {
  return useQuery({
    queryKey: [...ADMIN_NOTIFICATION_HISTORY_KEY, params],
    queryFn: () => getAdminNotificationHistory(params),
  });
}

export function useAdminPreviewRecipients() {
  return useMutation({
    mutationFn: postAdminPreviewRecipients,
  });
}