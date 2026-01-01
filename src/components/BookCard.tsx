import React from "react";
import { Link } from "react-router-dom";
import { MapPin, User, Book as BookIcon } from "lucide-react";
import { Badge } from "./Badge";
import { Button } from "./Button";
import type { BookData } from "../helpers/BookTypes";
import styles from "./BookCard.module.css";

interface BookCardProps {
  book: BookData;
}

export const BookCard = ({ book }: BookCardProps) => {
  return (
    <Link to={`/books/${book.id}`} className={styles.card}>
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
          <Badge
            variant={book.status === "available" ? "success" : "secondary"}
          >
            {book.status === "available" ? "Có sẵn" : "Đang mượn"}
          </Badge>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.category}>{book.category || "Chưa phân loại"}</div>
        <h3 className={styles.title} title={book.title}>
          {book.title}
        </h3>
        <div className={styles.author}>
          <User size={14} />
          <span>Tác giả: {book.author || "Khuyết danh"}</span>
        </div>
        <div className={styles.owner}>
          <User size={14} />
          <span>Chủ sách: {book.ownerName || "Ẩn danh"}</span>
        </div>

        <div className={styles.divider} />

        <div className={styles.meta}>
          <div className={styles.location}>
            <MapPin size={14} />
            <span>
              {book.district}, {book.province}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};