import React from "react";
import { Link } from "react-router-dom";
import { Badge } from "./Badge";
import { BorrowItemActions } from "./BorrowItemActions";
import { MemberBorrowItem } from "../endpoints/library/my-borrows_GET.schema";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { BookOpen, MessageSquare } from "lucide-react";
import styles from "./BorrowRequestItem.module.css";

interface BorrowRequestItemProps {
  item: MemberBorrowItem;
  role: "borrower" | "owner";
  onAction: (id: number, action: string, note?: string) => void;
  className?: string;
}

const statusMap: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "secondary" }> = {
  pending: { label: "Chờ duyệt", variant: "warning" },
  approved: { label: "Đã duyệt", variant: "success" },
  borrowed: { label: "Đang mượn", variant: "success" },
  return_requested: { label: "Chờ trả", variant: "warning" },
  completed: { label: "Hoàn thành", variant: "secondary" },
  cancelled: { label: "Đã hủy", variant: "destructive" },
};

export const BorrowRequestItem = ({ item, role, onAction, className }: BorrowRequestItemProps) => {
  const statusInfo = statusMap[item.status] || { label: item.status, variant: "default" };

  return (
    <div className={`${styles.itemCard} ${className || ""}`}>
      <div className={styles.itemHeader}>
        <div className={styles.bookInfo}>
          {item.bookCoverUrl ? (
            <img src={item.bookCoverUrl} alt="" className={styles.thumb} />
          ) : (
            <div className={styles.placeholderThumb}>
              <BookOpen size={16} />
            </div>
          )}
          <div className={styles.bookDetails}>
            <Link to={`/books/${item.bookId}`} className={styles.bookTitle}>
              {item.bookTitle}
            </Link>
            {item.bookAuthor && <p className={styles.bookAuthor}>{item.bookAuthor}</p>}
          </div>
        </div>
        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
      </div>

      <div className={styles.metaInfo}>
        <p>
          {role === "borrower" ? "Chủ sách: " : "Người mượn: "}
          <span className={styles.highlight}>
            {role === "borrower" ? item.ownerName : item.borrowerName}
          </span>
        </p>
        <p className={styles.date}>
          {format(new Date(item.createdAt), "dd/MM/yyyy", { locale: vi })}
        </p>
      </div>

      <BorrowItemActions item={item} role={role} onAction={onAction} />

      {item.status === "completed" && item.completionNote && (
        <div className={styles.completionNote}>
          <MessageSquare size={14} />
          <span>"{item.completionNote}"</span>
        </div>
      )}
    </div>
  );
};