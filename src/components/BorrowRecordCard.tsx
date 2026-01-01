import React from "react";
import { Link } from "react-router-dom";
import { Book as BookIcon, User, Calendar } from "lucide-react";
import { Badge } from "./Badge";
import type { MemberBorrowItem } from "../endpoints/library/my-borrows_GET.schema";
import styles from "./BorrowRecordCard.module.css";

interface BorrowRecordCardProps {
  record: MemberBorrowItem;
  role: "borrower" | "owner";
  className?: string;
}

const statusLabels: Record<string, string> = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  borrowed: "Đang mượn",
  return_requested: "Yêu cầu trả",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
  rejected: "Từ chối",
};

const statusVariants: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  pending: "warning",
  approved: "success",
  borrowed: "default",
  return_requested: "warning",
  completed: "secondary",
  cancelled: "destructive",
  rejected: "destructive",
};

export const BorrowRecordCard = ({ record, role, className }: BorrowRecordCardProps) => {
  const formattedDate = new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(record.createdAt));

  return (
    <Link to={`/books/${record.bookId}`} className={`${styles.card} ${className || ""}`}>
      <div className={styles.coverWrapper}>
        {record.bookCoverUrl ? (
          <img
            src={record.bookCoverUrl}
            alt={record.bookTitle}
            className={styles.coverImage}
            loading="lazy"
          />
        ) : (
          <div className={styles.placeholderCover}>
            <BookIcon size={48} className={styles.placeholderIcon} />
          </div>
        )}
        <div className={styles.statusBadge}>
          <Badge variant={statusVariants[record.status]}>
            {statusLabels[record.status]}
          </Badge>
        </div>
      </div>

      <div className={styles.content}>
        <h3 className={styles.title} title={record.bookTitle}>
          {record.bookTitle}
        </h3>
        {record.bookAuthor && (
          <div className={styles.author}>
            {record.bookAuthor}
          </div>
        )}

        <div className={styles.divider} />

        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <User size={14} />
            <span>
              {role === "borrower" 
                ? `Chủ sách: ${record.ownerName || "N/A"}`
                : `Người mượn: ${record.borrowerName || "N/A"}`
              }
            </span>
          </div>
          <div className={styles.metaItem}>
            <Calendar size={14} />
            <span>{formattedDate}</span>
          </div>
        </div>

        {record.completionNote && (
          <div className={styles.note}>
            <strong>Ghi chú:</strong> {record.completionNote}
          </div>
        )}
      </div>
    </Link>
  );
};