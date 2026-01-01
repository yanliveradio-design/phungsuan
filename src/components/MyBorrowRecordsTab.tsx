import React from "react";
import { BorrowRecordCard } from "./BorrowRecordCard";
import { Skeleton } from "./Skeleton";
import { useMyBorrows } from "../helpers/useMemberLibrary";
import { useAuth } from "../helpers/useAuth";
import styles from "./MyBorrowRecordsTab.module.css";

interface MyBorrowRecordsTabProps {
  role: "borrower" | "owner";
  className?: string;
}

export const MyBorrowRecordsTab = ({ role, className }: MyBorrowRecordsTabProps) => {
  const { authState } = useAuth();
  const { data, isFetching } = useMyBorrows(
    { role },
    { enabled: authState.type === "authenticated" }
  );

  const emptyMessages = {
    borrower: {
      icon: "📚",
      title: "Chưa có sách nào",
      description: "Bạn chưa mượn sách nào. Hãy khám phá thư viện!",
    },
    owner: {
      icon: "📖",
      title: "Chưa có người mượn",
      description: "Chưa có ai mượn sách của bạn.",
    },
  };

  const message = emptyMessages[role];

  return (
    <div className={`${styles.container} ${className || ""}`}>
      {isFetching && !data ? (
        <div className={styles.grid}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className={styles.cardSkeleton} />
          ))}
        </div>
      ) : data && data.borrows.length > 0 ? (
        <div className={styles.grid}>
          {data.borrows.map((record) => (
            <BorrowRecordCard key={record.id} record={record} role={role} />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>{message.icon}</div>
          <h3>{message.title}</h3>
          <p>{message.description}</p>
        </div>
      )}
    </div>
  );
};