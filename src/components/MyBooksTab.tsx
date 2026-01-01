import React from "react";
import { Plus } from "lucide-react";
import { Button } from "./Button";
import { MemberBookSubmitDialog } from "./MemberBookSubmitDialog";
import { MyBookSubmissionCard } from "./MyBookSubmissionCard";
import { BorrowRequestItem } from "./BorrowRequestItem";
import { Skeleton } from "./Skeleton";
import { useMemberBookSubmissions } from "../helpers/useMemberBookSubmissions";
import { useMyBorrows, useBorrowAction } from "../helpers/useMemberLibrary";
import { toast } from "sonner";
import styles from "./MyBooksTab.module.css";

interface MyBooksTabProps {
  className?: string;
}

export const MyBooksTab = ({ className }: MyBooksTabProps) => {
  const { data: booksData, isFetching: isFetchingBooks } = useMemberBookSubmissions({ page: 1, limit: 50 });
  const { data: borrowsData, isFetching: isFetchingBorrows } = useMyBorrows({ role: "owner" });
  
  const { mutate: borrowAction } = useBorrowAction();

  const handleAction = (borrowId: number, action: string, note?: string) => {
    // @ts-ignore - action string is compatible with enum in schema but TS might complain about string vs enum
    borrowAction({ borrowId, action, note }, {
      onSuccess: () => toast.success("Thao tác thành công"),
      onError: (err) => toast.error(err.message)
    });
  };

  return (
    <div className={`${styles.container} ${className || ""}`}>
      {/* Section 1: Uploaded Books */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Sách đã chia sẻ</h2>
          <MemberBookSubmitDialog>
            <Button>
              <Plus size={16} />
              Chia sẻ sách
            </Button>
          </MemberBookSubmitDialog>
        </div>

        {isFetchingBooks && !booksData ? (
          <div className={styles.grid}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className={styles.cardSkeleton} />
            ))}
          </div>
        ) : booksData && booksData.books.length > 0 ? (
          <div className={styles.grid}>
            {booksData.books.map((book) => (
              <MyBookSubmissionCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📖</div>
            <h3>Chưa có sách nào</h3>
            <p>Bạn chưa chia sẻ sách nào. Hãy bắt đầu chia sẻ!</p>
          </div>
        )}
      </section>

      {/* Section 2: Borrow Requests */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Yêu cầu mượn</h2>
        </div>

        {isFetchingBorrows && !borrowsData ? (
          <div className={styles.list}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className={styles.listItemSkeleton} />
            ))}
          </div>
        ) : borrowsData && borrowsData.borrows.length > 0 ? (
          <div className={styles.list}>
            {borrowsData.borrows.map((item) => (
              <BorrowRequestItem 
                key={item.id} 
                item={item} 
                role="owner" 
                onAction={handleAction}
              />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📬</div>
            <h3>Chưa có yêu cầu nào</h3>
            <p>Chưa có ai mượn sách của bạn.</p>
          </div>
        )}
      </section>
    </div>
  );
};