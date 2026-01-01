import React, { useMemo } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar, BookOpen, ArrowRightLeft } from "lucide-react";
import { TimelineItem } from "../endpoints/member/journey_GET.schema";
import { Skeleton } from "./Skeleton";
import styles from "./JourneyTimeline.module.css";

interface Props {
  items?: TimelineItem[];
  isLoading: boolean;
  filter?: "all" | "activities" | "books";
}

export const JourneyTimeline = ({ items, isLoading, filter = "all" }: Props) => {
  const filteredItems = useMemo(() => {
    if (!items) return [];
    if (filter === "activities") {
      return items.filter((item) => item.type === "checkin");
    }
    if (filter === "books") {
      return items.filter(
        (item) =>
          item.type === "borrow_completed" || item.type === "lend_completed"
      );
    }
    return items;
  }, [items, filter]);

  if (isLoading) {
    return (
      <div className={styles.timeline}>
        {[1, 2, 3].map((i) => (
          <div key={i} className={styles.item}>
            <div className={styles.line} />
            <div className={styles.dotSkeleton} />
            <div className={styles.content}>
              <Skeleton className={styles.dateSkeleton} />
              <div className={styles.cardSkeleton}>
                <Skeleton className={styles.titleSkeleton} />
                <Skeleton className={styles.subtitleSkeleton} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!isLoading && (!filteredItems || filteredItems.length === 0)) {
    const emptyMessages = {
      all: "Bạn chưa có hoạt động nào được ghi nhận.",
      activities: "Bạn chưa tham gia hoạt động nào.",
      books: "Bạn chưa có lịch sử đọc sách nào.",
    };

    return (
      <div className={styles.emptyState}>
        <p>{emptyMessages[filter]}</p>
        {filter === "all" && (
          <p className={styles.emptySub}>
            Hãy tham gia các sự kiện hoặc mượn sách để bắt đầu hành trình của mình!
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={styles.timeline}>
      {filteredItems.map((item, index) => {
        const isLast = index === filteredItems.length - 1;
        
        let Icon = Calendar;
        let typeClass = styles.typeCheckin;
        
        if (item.type === "borrow_completed") {
          Icon = BookOpen;
          typeClass = styles.typeBorrow;
        } else if (item.type === "lend_completed") {
          Icon = ArrowRightLeft;
          typeClass = styles.typeLend;
        }

        return (
          <div key={item.id} className={styles.item}>
            {!isLast && <div className={styles.line} />}
            
            <div className={`${styles.dot} ${typeClass}`}>
              <Icon size={14} strokeWidth={2.5} />
            </div>

            <div className={styles.content}>
              <time className={styles.date}>
                {format(item.date, "dd MMMM, yyyy", { locale: vi })}
              </time>
              
              <div className={styles.card}>
                <h3 className={styles.title}>{item.title}</h3>
                {item.subtitle && (
                  <p className={styles.subtitle}>{item.subtitle}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};