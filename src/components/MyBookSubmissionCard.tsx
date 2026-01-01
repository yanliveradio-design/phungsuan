import React from "react";
import { Link } from "react-router-dom";
import { Book as BookIcon, Clock, CheckCircle2 } from "lucide-react";
import { Badge } from "./Badge";
import type { MyBookSubmission } from "../endpoints/member/book/my-submissions_GET.schema";
import styles from "./MyBookSubmissionCard.module.css";

interface MyBookSubmissionCardProps {
  book: MyBookSubmission;
  className?: string;
}

export const MyBookSubmissionCard = ({ book, className }: MyBookSubmissionCardProps) => {
  const isApproved = book.isApproved;
  const formattedDate = new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(book.createdAt));

  return (
    <Link to={`/books/${book.id}`} className={`${styles.card} ${className || ""}`}>
      <div className={styles.coverWrapper}>
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            className={styles.coverImage}
            loading="lazy"
          />
        ) : (
          <div className={styles.placeholderCover}>
            <BookIcon size={48} className={styles.placeholderIcon} />
          </div>
        )}
        <div className={styles.statusBadge}>
          {isApproved ? (
            <Badge variant="success">
              <CheckCircle2 size={14} />
              Đã duyệt
            </Badge>
          ) : (
            <Badge variant="warning">
              <Clock size={14} />
              Chờ duyệt
            </Badge>
          )}
        </div>
      </div>

      <div className={styles.content}>
        <h3 className={styles.title} title={book.title}>
          {book.title}
        </h3>
        {book.author && (
          <div className={styles.author}>
            {book.author}
          </div>
        )}
        
        <div className={styles.divider} />
        
        <div className={styles.meta}>
          <div className={styles.statusBadge}>
            <Badge variant={book.status === "available" ? "success" : "secondary"}>
              {book.status === "available" ? "Có sẵn" : book.status === "borrowed" ? "Đang mượn" : "Không khả dụng"}
            </Badge>
          </div>
          <div className={styles.date}>
            {formattedDate}
          </div>
        </div>
      </div>
    </Link>
  );
};