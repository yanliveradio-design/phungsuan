import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../helpers/useAuth";
import { useProfile } from "../helpers/useProfile";
import { ProfileHeader } from "../components/ProfileHeader";
import { ProfileJoinedDateEditor } from "../components/ProfileJoinedDateEditor";
import { ProfileLocationEditor } from "../components/ProfileLocationEditor";
import { ProfileNotificationSettings } from "../components/ProfileNotificationSettings";
import { ProfileFeedbackForm } from "../components/ProfileFeedbackForm";
import { Button } from "../components/Button";
import { LogOut } from "lucide-react";
import { Helmet } from "react-helmet";
import { PageCover } from "../components/PageCover";
import styles from "./profile.module.css";

export default function ProfilePage() {
  const { authState, logout } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading } = useProfile();

  // Protect route
  useEffect(() => {
    if (authState.type === "unauthenticated") {
      navigate("/login");
    }
  }, [authState, navigate]);

  if (authState.type !== "authenticated") {
    return null; // Or a loading spinner if desired, but SharedLayout handles initial auth loading usually
  }

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className={styles.page}>
      <Helmet>
        <title>Hồ sơ cá nhân | BookShare</title>
      </Helmet>

      <PageCover
        pageKey="profile"
        title="Hồ sơ cá nhân"
        subtitle="Quản lý thông tin cá nhân của bạn"
      />

      <div className={styles.container}>
        <ProfileHeader user={data?.user} isLoading={isLoading} />

        <div className={styles.grid}>
          <div className={styles.mainColumn}>
            <ProfileJoinedDateEditor
              joinedAt={data?.user.joinedAt ?? null}
              joinedAtUpdatedByMember={data?.user.joinedAtUpdatedByMember ?? false}
            />
            <ProfileLocationEditor
              province={data?.user.province ?? null}
              district={data?.user.district ?? null}
            />
            <ProfileNotificationSettings />
            <ProfileFeedbackForm />
          </div>
        </div>

        <div className={styles.footer}>
          <Button
            variant="destructive"
            onClick={handleLogout}
            className={styles.logoutButton}
          >
            <LogOut size={18} />
            Đăng xuất
          </Button>
        </div>
      </div>
    </div>
  );
}