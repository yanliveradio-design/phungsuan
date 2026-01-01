import React from "react";
import { BookOpen, Users, Calendar } from "lucide-react";
import { useStats } from "../helpers/useStats";
import { Skeleton } from "./Skeleton";
import styles from "./StatsBar.module.css";

interface StatsBarProps {
  className?: string;
}

export const StatsBar = ({ className }: StatsBarProps) => {
  const { data: stats, isFetching } = useStats();

  if (isFetching) {
    return (
      <div className={`${styles.statsBar} ${className || ""}`}>
        <div className={styles.stat}>
          <Skeleton className={styles.statSkeleton} />
        </div>
        <div className={styles.stat}>
          <Skeleton className={styles.statSkeleton} />
        </div>
        <div className={styles.stat}>
          <Skeleton className={styles.statSkeleton} />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className={`${styles.statsBar} ${className || ""}`}>
      <div className={styles.stat}>
        <div className={styles.iconWrapper}>
          <BookOpen size={24} className={styles.icon} />
        </div>
        <div className={styles.statContent}>
          <div className={styles.statValue}>{stats.totalBooks}</div>
          <div className={styles.statLabel}>Cuốn sách</div>
        </div>
      </div>

      <div className={styles.divider}></div>

      <div className={styles.stat}>
        <div className={styles.iconWrapper}>
          <Users size={24} className={styles.icon} />
        </div>
        <div className={styles.statContent}>
          <div className={styles.statValue}>{stats.activeMembers}</div>
          <div className={styles.statLabel}>Thành viên</div>
        </div>
      </div>

      <div className={styles.divider}></div>

      <div className={styles.stat}>
        <div className={styles.iconWrapper}>
          <Calendar size={24} className={styles.icon} />
        </div>
        <div className={styles.statContent}>
          <div className={styles.statValue}>{stats.totalActivities}</div>
          <div className={styles.statLabel}>Hoạt động</div>
        </div>
      </div>
    </div>
  );
};