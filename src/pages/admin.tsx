import React from "react";
import { Helmet } from "react-helmet";
import { useAuth } from "../helpers/useAuth";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/Tabs";
import { AdminActivitiesTab } from "../components/AdminActivitiesTab";
import { AdminMembersTab } from "../components/AdminMembersTab";
import { AdminTitlesTab } from "../components/AdminTitlesTab";
import { AdminLibraryTab } from "../components/AdminLibraryTab";
import { AdminFeedbackTab } from "../components/AdminFeedbackTab";
import { AdminNotificationsTab } from "../components/AdminNotificationsTab";
import { AdminSettingsTab } from "../components/AdminSettingsTab";
import styles from "./admin.module.css";

export default function AdminDashboard() {
  const { authState } = useAuth();

  const user = authState.type === "authenticated" ? authState.user : null;

  if (!user) return null;

  return (
    <>
      <Helmet>
        <title>Quản trị hệ thống | Community Book Sharing</title>
      </Helmet>

      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Dashboard Quản Trị</h1>
            <p className={styles.subtitle}>
              Xin chào, <span className={styles.userName}>{user.fullName}</span>
            </p>
          </div>
        </header>

        <Tabs defaultValue="activities" className={styles.tabs}>
          <div className={styles.tabsListWrapper}>
            <TabsList>
              <TabsTrigger value="activities">Hoạt động</TabsTrigger>
              <TabsTrigger value="members">Thành viên</TabsTrigger>
              <TabsTrigger value="titles">Danh hiệu</TabsTrigger>
              <TabsTrigger value="library">Thư viện</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
              <TabsTrigger value="notifications">Thông báo</TabsTrigger>
              <TabsTrigger value="settings">Cài đặt</TabsTrigger>
            </TabsList>
          </div>

          <div className={styles.contentArea}>
            <TabsContent value="activities" className={styles.tabContent}>
              <AdminActivitiesTab />
            </TabsContent>

            <TabsContent value="members" className={styles.tabContent}>
              <AdminMembersTab />
            </TabsContent>

            <TabsContent value="titles" className={styles.tabContent}>
              <AdminTitlesTab />
            </TabsContent>

            <TabsContent value="library" className={styles.tabContent}>
              <AdminLibraryTab />
            </TabsContent>

            <TabsContent value="feedback" className={styles.tabContent}>
              <AdminFeedbackTab />
            </TabsContent>

            <TabsContent value="notifications" className={styles.tabContent}>
              <AdminNotificationsTab />
            </TabsContent>

            <TabsContent value="settings" className={styles.tabContent}>
              <AdminSettingsTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </>
  );
}