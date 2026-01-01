import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "../components/Button";
import { ActivityCard } from "../components/ActivityCard";
import { Skeleton } from "../components/Skeleton";
import { GreetingHeader } from "../components/GreetingHeader";
import { AdminAnnouncementBanner } from "../components/AdminAnnouncementBanner";
import { FeedbackCarousel } from "../components/FeedbackCarousel";
import { HeroSection } from "../components/HeroSection";
import { StatsBar } from "../components/StatsBar";
import { QuickActionsSection } from "../components/QuickActionsSection";
import { FeaturedBooksCarousel } from "../components/FeaturedBooksCarousel";
import { useMemberActivitiesList } from "../helpers/useMemberActivities";
import { useAuth } from "../helpers/useAuth";
import styles from "./_index.module.css";

export default function MemberHomePage() {
  const { authState } = useAuth();
  const { data: activitiesData, isFetching: isActivitiesLoading } =
    useMemberActivitiesList({ status: "open" });

  const upcomingActivities = activitiesData?.activities.slice(0, 3) || [];
  const isAuthenticated = authState.type === "authenticated";

  return (
    <div className={styles.page}>
      <HeroSection />
      <StatsBar />

      {isAuthenticated && (
        <>
          <GreetingHeader className={styles.greeting} />
          <AdminAnnouncementBanner />
        </>
      )}

      <QuickActionsSection />

      {/* Featured Books Section */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Sách nổi bật
              <span className={styles.leafIcon}>📚</span>
            </h2>
            <Button variant="link" asChild>
              <Link to="/books">
                Xem tất cả <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
          <FeaturedBooksCarousel />
        </div>
      </section>

      {/* Upcoming Activities Section */}
      <section className={styles.activitiesSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              Hoạt động sắp tới
              <span className={styles.leafIcon}>🌿</span>
            </h2>
            <Button variant="link" asChild>
              <Link to="/activities">
                Xem tất cả <ArrowRight size={16} />
              </Link>
            </Button>
          </div>

          {isActivitiesLoading ? (
            <div className={styles.activitiesGrid}>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className={styles.activitySkeleton} />
              ))}
            </div>
          ) : upcomingActivities.length > 0 ? (
            <div className={styles.activitiesGrid}>
              {upcomingActivities.map((activity, index) => (
                <div
                  key={activity.id}
                  className={styles.activityWrapper}
                  style={{
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  <ActivityCard activity={activity} />
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>📅</span>
              <p className={styles.emptyText}>Chưa có hoạt động nào sắp tới</p>
              <p className={styles.emptySubtext}>Hãy quay lại sau nhé!</p>
            </div>
          )}
        </div>
      </section>

      {/* Positive Feedback Carousel */}
      <section className={styles.feedbackSection}>
        <div className={styles.waveTop}></div>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>
            Cộng đồng chia sẻ
            <span className={styles.leafIcon}>🌱</span>
          </h2>
          <FeedbackCarousel />
        </div>
        <div className={styles.waveBottom}></div>
      </section>
    </div>
  );
}