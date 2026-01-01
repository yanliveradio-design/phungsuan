import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { ArrowLeft, Calendar, MapPin, Users } from "lucide-react";
import { useAdminActivityRegistrations } from "../helpers/useAdminActivityRegistrations";
import { Button } from "../components/Button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/Tabs";
import { Skeleton } from "../components/Skeleton";
import { AdminActivityRegistrationsTable } from "../components/AdminActivityRegistrationsTable";
import styles from "./admin.activities.$activityId.module.css";

export default function AdminActivityDetailPage() {
  const { activityId } = useParams<{ activityId: string }>();
  const navigate = useNavigate();
  const id = activityId ? parseInt(activityId, 10) : 0;

  const { data, isLoading, isError, error } = useAdminActivityRegistrations({
    activityId: id,
  });

  if (isNaN(id)) {
    return <div className={styles.error}>Invalid Activity ID</div>;
  }

  if (isError) {
    return (
      <div className={styles.error}>
        Error: {error instanceof Error ? error.message : "Unknown error"}
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <Helmet>
        <title>
          {data ? `Chi tiết: ${data.activityTitle}` : "Chi tiết hoạt động"} |
          Quản trị
        </title>
      </Helmet>

      <div className={styles.container}>
        <div className={styles.header}>
          <Button
            variant="ghost"
            size="sm"
            className={styles.backButton}
            onClick={() => navigate("/admin")}
          >
            <ArrowLeft size={16} />
            Quay lại
          </Button>

          <div className={styles.titleWrapper}>
            {isLoading ? (
              <Skeleton className={styles.titleSkeleton} />
            ) : (
              <h1 className={styles.title}>{data?.activityTitle}</h1>
            )}
          </div>
        </div>

        <Tabs defaultValue="registrations" className={styles.tabs}>
          <div className={styles.tabsListWrapper}>
            <TabsList>
              <TabsTrigger value="info">Thông tin</TabsTrigger>
              <TabsTrigger value="registrations">Danh sách đăng ký</TabsTrigger>
            </TabsList>
          </div>

          <div className={styles.contentArea}>
            <TabsContent value="info" className={styles.tabContent}>
              <div className={styles.placeholderInfo}>
                <p>Thông tin chi tiết hoạt động sẽ được hiển thị ở đây.</p>
                {/* Placeholder for future implementation */}
              </div>
            </TabsContent>

            <TabsContent value="registrations" className={styles.tabContent}>
              <AdminActivityRegistrationsTable
                data={data}
                isLoading={isLoading}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </>
  );
}