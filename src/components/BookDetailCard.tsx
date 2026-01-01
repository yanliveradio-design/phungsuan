import React from "react";
import { MapPin, User, Calendar, BookOpen } from "lucide-react";
import { Badge } from "./Badge";
import { BookDetail } from "../endpoints/library/book-detail_GET.schema";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import styles from "./BookDetailCard.module.css";

interface BookDetailCardProps {
  book: BookDetail;
}

export const BookDetailCard = ({ book }: BookDetailCardProps) => {
  const formattedDate = book.createdAt 
    ? format(new Date(book.createdAt), "d MMMM, yyyy", { locale: vi })
    : "N/A";

  return (
    <div className={styles.card}>
      <div className={styles.coverSection}>
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            className={styles.coverImage}
          />
        ) : (
          <div className={styles.placeholderCover}>
            <BookOpen size={64} className={styles.placeholderIcon} />
          </div>
        )}
      </div>

      <div className={styles.infoSection}>
        <div className={styles.header}>
          <div className={styles.categoryBadge}>
            <Badge variant="outline">{book.category || "Chưa phân loại"}</Badge>
          </div>
          <div className={styles.statusBadge}>
            <Badge
              variant={book.status === "available" ? "success" : "secondary"}
            >
              {book.status === "available" ? "Có sẵn" : "Đang mượn"}
            </Badge>
          </div>
        </div>

        <h1 className={styles.title}>{book.title}</h1>
        
        <div className={styles.authorRow}>
          <span className={styles.label}>Tác giả:</span>
          <span className={styles.authorName}>{book.author || "Khuyết danh"}</span>
        </div>

        <div className={styles.divider} />

        <div className={styles.metaGrid}>
          <div className={styles.metaItem}>
            <User size={18} className={styles.icon} />
            <div className={styles.metaContent}>
              <span className={styles.metaLabel}>Chủ sở hữu</span>
              <span className={styles.metaValue}>{book.ownerName || "Ẩn danh"}</span>
            </div>
          </div>

          <div className={styles.metaItem}>
            <MapPin size={18} className={styles.icon} />
            <div className={styles.metaContent}>
              <span className={styles.metaLabel}>Địa điểm</span>
              <span className={styles.metaValue}>
                {book.district ? `${book.district}, ${book.province}` : book.province || "Chưa cập nhật"}
              </span>
            </div>
          </div>

          <div className={styles.metaItem}>
            <Calendar size={18} className={styles.icon} />
            <div className={styles.metaContent}>
              <span className={styles.metaLabel}>Ngày đăng</span>
              <span className={styles.metaValue}>{formattedDate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};