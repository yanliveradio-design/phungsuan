import React from "react";
import { Badge } from "./Badge";
import { Skeleton } from "./Skeleton";
import { FileText, Activity, BookOpen } from "lucide-react";

import styles from "./AdminMemberHistoryHelpers.module.css";

export const HistorySkeleton = () => (
  <div className={styles.skeletonList}>
    <Skeleton style={{ height: "60px", width: "100%" }} />
    <Skeleton style={{ height: "60px", width: "100%" }} />
    <Skeleton style={{ height: "60px", width: "100%" }} />
  </div>
);

interface EmptyStateProps {
  message: string;
  iconName: "FileText" | "Activity" | "BookOpen";
}

export const EmptyState = ({ message, iconName }: EmptyStateProps) => {
  const icons = {
    FileText: <FileText />,
    Activity: <Activity />,
    BookOpen: <BookOpen />,
  };

  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>{icons[iconName]}</div>
      <p>{message}</p>
    </div>
  );
};

export const BorrowStatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "outline" | "secondary" }> = {
    pending: { label: "Chờ duyệt", variant: "warning" },
    approved: { label: "Đã duyệt", variant: "secondary" },
    borrowed: { label: "Đang mượn", variant: "default" },
    return_requested: { label: "Yêu cầu trả", variant: "warning" },
    completed: { label: "Hoàn thành", variant: "success" },
    cancelled: { label: "Đã hủy", variant: "destructive" },
  };

  const config = map[status] || { label: status, variant: "outline" };
  
  return <Badge variant={config.variant} className={styles.miniBadge}>{config.label}</Badge>;
};

export const formatAuditAction = (action: string) => {
  const map: Record<string, string> = {
    user_locked: "Khóa tài khoản",
    user_unlocked: "Mở khóa tài khoản",
    user_trusted_member_changed: "Thay đổi trạng thái tin cậy",
    user_role_changed: "Thay đổi quyền hạn",
    activity_created: "Tạo hoạt động",
    activity_updated: "Cập nhật hoạt động",
    activity_cancelled: "Hủy hoạt động",
    book_approved: "Duyệt sách",
    book_hidden: "Ẩn sách",
    user_joined_date_changed: "Thay đổi ngày tham gia",
  };
  return map[action] || action;
};