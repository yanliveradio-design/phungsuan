import React, { useMemo } from "react";
import { ActivityCard } from "../components/ActivityCard";
import { Skeleton } from "../components/Skeleton";
import { PageCover } from "../components/PageCover";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/Tabs";
import { useMemberActivitiesList } from "../helpers/useMemberActivities";
import styles from "./activities.module.css";

export default function ActivitiesPage() {
  const { data, isFetching } = useMemberActivitiesList({ status: "open" });

  // Filter activities into tabs based on time
  const { upcoming, ongoing, completed } = useMemo(() => {
    if (!data?.activities) {
      return { upcoming: [], ongoing: [], completed: [] };
    }

    const now = new Date();

    const upcoming = data.activities.filter((activity) => {
      return activity.startTime > now && activity.status === "open";
    });

    const ongoing = data.activities.filter((activity) => {
      const isStarted = activity.startTime <= now;
      const notEnded =
        activity.endTime === null || activity.endTime > now;
      return isStarted && notEnded && activity.status === "open";
    });

    const completed = data.activities.filter((activity) => {
      if (activity.status === "closed") return true;
      if (activity.endTime && activity.endTime < now) return true;
      return false;
    });

    return { upcoming, ongoing, completed };
  }, [data]);

  const renderActivityGrid = (activities: NonNullable<typeof data>["activities"]) => {
    if (isFetching) {
      return (
        <div className={styles.grid}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className={styles.cardSkeleton} />
          ))}
        </div>
      );
    }

    if (!activities || activities.length === 0) {
      return (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📅</div>
          <h3>Chưa có hoạt động nào</h3>
          <p>Không có hoạt động nào trong danh mục này.</p>
        </div>
      );
    }

    return (
      <div className={styles.grid}>
        {activities.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} />
        ))}
      </div>
    );
  };

  return (
    <div className={styles.page}>
      <PageCover
        pageKey="activities"
        title="Hoạt Động Cộng Đồng"
        subtitle="Tham gia các sự kiện, workshop và buổi gặp gỡ để kết nối với cộng đồng yêu sách."
        className={styles.pageCover}
      />

      <div className={styles.container}>
        <Tabs defaultValue="upcoming" className={styles.tabs}>
          <TabsList>
            <TabsTrigger value="upcoming">
              Sắp diễn ra ({upcoming.length})
            </TabsTrigger>
            <TabsTrigger value="ongoing">
              Đang diễn ra ({ongoing.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Đã kết thúc ({completed.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {renderActivityGrid(upcoming)}
          </TabsContent>

          <TabsContent value="ongoing">
            {renderActivityGrid(ongoing)}
          </TabsContent>

          <TabsContent value="completed">
            {renderActivityGrid(completed)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}