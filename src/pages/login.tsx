import React from "react";
import { Helmet } from "react-helmet";
import { Link, Navigate } from "react-router-dom";
import { Book, ArrowLeft } from "lucide-react";
import { useAuth } from "../helpers/useAuth";
import { OAuthButtonGroup } from "../components/OAuthButtonGroup";
import { Skeleton } from "../components/Skeleton";
import styles from "./login.module.css";

const LoginPage: React.FC = () => {
  const { authState } = useAuth();

  // Redirect to home if already authenticated
  if (authState.type === "authenticated") {
    return <Navigate to="/" replace />;
  }

  // Loading state to prevent UI flicker and provide feedback
  if (authState.type === "loading") {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <Skeleton className={styles.skeletonIcon} />
            <Skeleton className={styles.skeletonTitle} />
            <Skeleton className={styles.skeletonSubtitle} />
          </div>
          <Skeleton className={styles.skeletonButton} />
          <div className={styles.footer}>
            <Skeleton className={styles.skeletonLink} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Helmet>
        <title>Đăng nhập | Cộng đồng Chia sẻ Sách</title>
        <meta name="description" content="Đăng nhập vào Cộng đồng Chia sẻ Sách để khám phá và mượn những cuốn sách hay." />
      </Helmet>

      <div className={styles.card}>
        <div className={styles.tag}>SECURE_ACCESS</div>
        
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <Book size={24} />
          </div>
          <h1 className={styles.title}>Đăng nhập</h1>
          <p className={styles.subtitle}>Chào mừng bạn đến với Cộng đồng Phụng Sự An.</p>
        </div>

        <div className={styles.content}>
          <OAuthButtonGroup className={styles.oauth} />
        </div>

        <div className={styles.footer}>
          <Link to="/" className={styles.backLink}>
            <ArrowLeft size={16} />
            <span>Quay lại trang chủ</span>
          </Link>
        </div>
      </div>

      <div className={styles.backgroundGrid} />
    </div>
  );
};

export default LoginPage;