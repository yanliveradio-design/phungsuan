import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../helpers/useAuth";
import { useMemberJourney } from "../helpers/useMemberJourney";
import { JourneySummaryCard } from "../components/JourneySummaryCard";
import { JourneyTimeline } from "../components/JourneyTimeline";
import { PageCover } from "../components/PageCover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/Tabs";
import styles from "./my-journey.module.css";

export default function MyJourneyPage() {
  const { authState } = useAuth();
  const { data, isLoading, error } = useMemberJourney();
  const [timelineFilter, setTimelineFilter] = useState<
    "all" | "activities" | "books"
  >("all");

  // Redirect if not authenticated
  if (authState.type === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Đã xảy ra lỗi</h2>
        <p>Không thể tải dữ liệu hành trình của bạn. Vui lòng thử lại sau.</p>
      </div>
    );
  }

  return (
    <>
      <PageCover
        pageKey="myJourney"
        title="Hành trình của tôi"
        subtitle="Theo dõi quá trình tham gia và đóng góp của bạn cho cộng đồng."
      />
      <div className={styles.container}>
        <JourneySummaryCard data={data} isLoading={isLoading} />

        <div className={styles.timelineSection}>
          <h2 className={styles.sectionTitle}>Dòng thời gian</h2>

          <Tabs
            defaultValue="all"
            value={timelineFilter}
            onValueChange={(val) =>
              setTimelineFilter(val as typeof timelineFilter)
            }
            className={styles.tabs}
          >
            <TabsList className={styles.tabsList}>
              <TabsTrigger value="all">Tất cả</TabsTrigger>
              <TabsTrigger value="activities">Hoạt động đã tham gia</TabsTrigger>
              <TabsTrigger value="books">Sách đã đọc/cho mượn</TabsTrigger>
            </TabsList>

            <TabsContent value={timelineFilter} className={styles.tabContent}>
              <JourneyTimeline
                items={data?.timeline}
                isLoading={isLoading}
                filter={timelineFilter}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}