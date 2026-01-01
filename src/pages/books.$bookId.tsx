import React from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useBookDetail } from "../helpers/useMemberLibrary";
import { BookDetailCard } from "../components/BookDetailCard";
import { BorrowFlowCard } from "../components/BorrowFlowCard";
import { Skeleton } from "../components/Skeleton";
import { Button } from "../components/Button";
import styles from "./books.$bookId.module.css";

export default function BookDetailPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const parsedId = parseInt(bookId || "", 10);
  
  const { data, isLoading, error } = useBookDetail(parsedId);

  if (isNaN(parsedId)) {
    return (
      <div className={styles.errorContainer}>
        <AlertCircle size={48} className={styles.errorIcon} />
        <h2>Đường dẫn không hợp lệ</h2>
        <p>Không tìm thấy mã sách trong đường dẫn.</p>
        <Button asChild variant="outline">
          <Link to="/books">Quay lại danh sách</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.backLinkSkeleton}>
            <Skeleton style={{ width: "100px", height: "24px" }} />
          </div>
          <div className={styles.grid}>
            <div className={styles.mainContent}>
              <Skeleton style={{ width: "100%", height: "400px", borderRadius: "12px" }} />
            </div>
            <div className={styles.sidebar}>
              <Skeleton style={{ width: "100%", height: "200px", borderRadius: "12px" }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={styles.errorContainer}>
        <AlertCircle size={48} className={styles.errorIcon} />
        <h2>Không tìm thấy sách</h2>
        <p>Sách bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        <Button asChild variant="outline">
          <Link to="/books">Quay lại danh sách</Link>
        </Button>
      </div>
    );
  }

  const { book, activeBorrow } = data;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <Button asChild variant="ghost" size="sm" className={styles.backButton}>
            <Link to="/books">
              <ArrowLeft size={16} />
              Quay lại danh sách
            </Link>
          </Button>
        </div>

        <div className={styles.grid}>
          <div className={styles.mainContent}>
            <BookDetailCard book={book} />
          </div>
          
          <div className={styles.sidebar}>
            <div className={styles.stickyWrapper}>
              <BorrowFlowCard 
                book={book} 
                activeBorrow={activeBorrow} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}