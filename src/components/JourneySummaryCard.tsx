import React from "react";
import { format, differenceInDays } from "date-fns";
import { vi } from "date-fns/locale";
import { useBranding } from "../helpers/useBranding";
import { Avatar, AvatarFallback, AvatarImage } from "./Avatar";
import { Skeleton } from "./Skeleton";
import { OutputType } from "../endpoints/member/journey_GET.schema";
import { useMemberTitles } from "../helpers/useMemberTitles";
import { MemberTitleBadge } from "./MemberTitleBadge";
import styles from "./JourneySummaryCard.module.css";

interface Props {
  data?: OutputType;
  isLoading: boolean;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export const JourneySummaryCard = ({ data, isLoading }: Props) => {
  const { branding } = useBranding();
  const { data: titlesData, isLoading: titlesLoading } = useMemberTitles();

  const showSkeleton = isLoading || titlesLoading;

  if (showSkeleton) {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <Skeleton className={styles.avatarSkeleton} />
          <div className={styles.headerInfo}>
            <Skeleton className={styles.nameSkeleton} />
            <Skeleton className={styles.titlesSkeleton} />
            <Skeleton className={styles.dateSkeleton} />
          </div>
        </div>
        <div className={styles.statsGrid}>
          <Skeleton className={styles.statSkeleton} />
          <Skeleton className={styles.statSkeleton} />
          <Skeleton className={styles.statSkeleton} />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { user, summary } = data;
  const daysSinceJoin = differenceInDays(new Date(), user.joinedAt);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <Avatar className={styles.avatar}>
          <AvatarImage src={user.avatarUrl ?? undefined} alt={user.fullName} />
          <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
        </Avatar>
        <div className={styles.headerInfo}>
          <h2 className={styles.name}>{user.fullName}</h2>
          
          {titlesData?.titles && titlesData.titles.length > 0 && (
            <div className={styles.badgesContainer}>
              {titlesData.titles.map((title) => (
                <MemberTitleBadge
                  key={title.id}
                  name={title.name}
                  color={title.color}
                  size="sm"
                />
              ))}
            </div>
          )}

          <div className={styles.metaInfo}>
            <p className={styles.joinedDate}>
              Tham gia từ {format(user.joinedAt, "dd MMMM, yyyy", { locale: vi })}
            </p>
            <p className={styles.membershipDuration}>
              🎖️ {daysSinceJoin} ngày đồng hành cùng{" "}
              {branding?.appName || "cộng đồng"}
            </p>
          </div>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statItem}>
          <span className={styles.statIcon}>🎉</span>
          <div className={styles.statContent}>
            <span className={styles.statValue}>
              {summary.activitiesAttended}
            </span>
            <span className={styles.statLabel}>Hoạt động đã tham gia</span>
          </div>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statIcon}>📖</span>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{summary.booksBorrowed}</span>
            <span className={styles.statLabel}>Sách đã mượn</span>
          </div>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statIcon}>📚</span>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{summary.booksLent}</span>
            <span className={styles.statLabel}>Sách đã cho mượn</span>
          </div>
        </div>
      </div>
    </div>
  );
};
