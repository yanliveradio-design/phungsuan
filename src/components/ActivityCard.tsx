import React, { useState } from "react";
import {
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { FeedbackDialog } from "./FeedbackDialog";
import { useAuth } from "../helpers/useAuth";
import {
  useRegisterActivity,
  useCheckinActivity,
} from "../helpers/useMemberActivities";
import type { MemberActivityItem } from "../endpoints/activities/member_GET.schema";
import { Link } from "react-router-dom";
import styles from "./ActivityCard.module.css";

interface ActivityCardProps {
  activity: MemberActivityItem;
}

export const ActivityCard = ({ activity }: ActivityCardProps) => {
  const { authState } = useAuth();
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);

  const registerMutation = useRegisterActivity();
  const checkinMutation = useCheckinActivity();

  const startDate = activity.startTime;
  const isAuthenticated = authState.type === "authenticated";

  const handleRegister = async () => {
    if (!isAuthenticated) return;

    await registerMutation.mutateAsync({
      activityId: activity.id,
      action: "register",
    });
  };

  const handleUnregister = async () => {
    if (!isAuthenticated) return;

    await registerMutation.mutateAsync({
      activityId: activity.id,
      action: "unregister",
    });
  };

  const handleCheckin = async () => {
    if (!isAuthenticated) return;

    await checkinMutation.mutateAsync({
      activityId: activity.id,
    });
  };

  const handleFeedbackClick = () => {
    setFeedbackDialogOpen(true);
  };

  // Determine which CTA to show
  const renderCTA = () => {
    const now = new Date();
    const isUpcoming = activity.startTime > now;
    const isOngoing =
      activity.startTime <= now &&
      (activity.endTime === null || activity.endTime > now);
    const isCompleted =
      activity.status === "closed" ||
      (activity.endTime !== null && activity.endTime < now);

    // Unauthenticated users see login prompt
    if (!isAuthenticated) {
      return (
        <Button asChild variant="outline" size="sm" className={styles.ctaButton}>
          <Link to="/login">Đăng nhập để tham gia</Link>
        </Button>
      );
    }

    // Upcoming activities
    if (isUpcoming && activity.status === "open") {
      if (activity.isRegistered) {
        if (activity.registrationStatus === "confirmed") {
          return (
            <p className={styles.confirmedMessage}>
              Đăng ký đã được xác nhận. Nếu cần thay đổi, vui lòng liên hệ admin.
            </p>
          );
        }

        return (
          <Button
            variant="outline"
            size="sm"
            onClick={handleUnregister}
            disabled={registerMutation.isPending}
            className={styles.ctaButton}
          >
            {registerMutation.isPending ? "Đang xử lý..." : "Hủy đăng ký"}
          </Button>
        );
      } else {
        return (
          <Button
            variant="primary"
            size="sm"
            onClick={handleRegister}
            disabled={registerMutation.isPending}
            className={styles.ctaButton}
          >
            {registerMutation.isPending ? "Đang xử lý..." : "Đăng ký"}
          </Button>
        );
      }
    }

    // Ongoing activities
    if (isOngoing && activity.isRegistered && activity.checkinEnabled) {
      if (activity.isCheckedIn) {
        return (
          <Badge variant="success" className={styles.statusBadge}>
            <CheckCircle2 size={14} /> Đã điểm danh
          </Badge>
        );
      } else {
        return (
          <Button
            variant="primary"
            size="sm"
            onClick={handleCheckin}
            disabled={checkinMutation.isPending}
            className={styles.ctaButton}
          >
            <CheckCircle2 size={16} />
            {checkinMutation.isPending ? "Đang điểm danh..." : "Điểm danh"}
          </Button>
        );
      }
    }

    // Completed activities
    if (isCompleted && activity.isCheckedIn) {
      if (activity.hasFeedback) {
        return (
          <Badge variant="outline" className={styles.statusBadge}>
            <MessageSquare size={14} /> Đã gửi phản hồi
          </Badge>
        );
      } else {
        return (
          <Button
            variant="primary"
            size="sm"
            onClick={handleFeedbackClick}
            className={styles.ctaButton}
          >
            <MessageSquare size={16} />
            Gửi phản hồi
          </Button>
        );
      }
    }

    return null;
  };

  return (
    <>
      <div className={styles.card}>
        {activity.imageUrl && (
          <div className={styles.imageContainer}>
            <img
              src={activity.imageUrl}
              alt={activity.title}
              className={styles.image}
            />
          </div>
        )}
        <div className={styles.header}>
          <div className={styles.dateBox}>
            <span className={styles.dateDay}>{format(startDate, "dd")}</span>
            <span className={styles.dateMonth}>Th{format(startDate, "M")}</span>
          </div>
          <div className={styles.headerContent}>
            <h3 className={styles.title}>{activity.title}</h3>
            <div className={styles.statusRow}>
              <Badge
                variant={activity.status === "open" ? "success" : "secondary"}
              >
                {activity.status === "open" ? "Đang mở" : "Đã đóng"}
              </Badge>
              {activity.checkinEnabled && (
                <Badge variant="outline" className={styles.checkinBadge}>
                  <CheckCircle2 size={12} /> Check-in
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className={styles.body}>
          <p className={styles.description}>{activity.description}</p>

          <div className={styles.metaGrid}>
            <div className={styles.metaItem}>
              <Calendar size={16} />
              <span>
                {format(startDate, "HH:mm, EEEE dd/MM/yyyy", { locale: vi })}
              </span>
            </div>

            {activity.location && (
              <div className={styles.metaItem}>
                <MapPin size={16} />
                <span className={styles.truncate}>{activity.location}</span>
              </div>
            )}

            {activity.maxParticipants && (
              <div className={styles.metaItem}>
                <Users size={16} />
                <span>
                  {activity.registrationCount}/{activity.maxParticipants} người
                </span>
              </div>
            )}
          </div>

          <div className={styles.ctaContainer}>{renderCTA()}</div>
        </div>
      </div>

      <FeedbackDialog
        activityId={activity.id}
        activityTitle={activity.title}
        open={feedbackDialogOpen}
        onOpenChange={setFeedbackDialogOpen}
      />
    </>
  );
};