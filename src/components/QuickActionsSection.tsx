import React from "react";
import { Link } from "react-router-dom";
import { Search, BookPlus, Calendar, TrendingUp } from "lucide-react";
import { useAuth } from "../helpers/useAuth";
import styles from "./QuickActionsSection.module.css";

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  description: string;
  to: string;
  gradient: string;
}

export const QuickActionsSection = ({ className }: { className?: string }) => {
  const { authState } = useAuth();

  if (authState.type !== "authenticated") {
    return null;
  }

  const actions: QuickAction[] = [
    {
      icon: <Search size={28} />,
      label: "Tìm sách",
      description: "Khám phá kho sách",
      to: "/books",
      gradient: "linear-gradient(135deg, var(--primary), color-mix(in srgb, var(--primary) 70%, var(--info)))",
    },
    {
      icon: <BookPlus size={28} />,
      label: "Chia sẻ sách",
      description: "Đóng góp tri thức",
      to: "/books?tab=mybooks",
      gradient: "linear-gradient(135deg, var(--secondary), color-mix(in srgb, var(--secondary) 70%, var(--warning)))",
    },
    {
      icon: <Calendar size={28} />,
      label: "Hoạt động",
      description: "Sự kiện cộng đồng",
      to: "/activities",
      gradient: "linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--info) 80%, var(--primary)))",
    },
    {
      icon: <TrendingUp size={28} />,
      label: "Hành trình",
      description: "Theo dõi tiến độ",
      to: "/my-journey",
      gradient: "linear-gradient(135deg, var(--success), color-mix(in srgb, var(--success) 70%, var(--primary)))",
    },
  ];

  return (
    <section className={`${styles.section} ${className || ""}`}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>
          Bắt đầu hành trình
          <span className={styles.sparkle}>✨</span>
        </h2>
        <div className={styles.actions}>
          {actions.map((action, index) => (
            <Link
              key={action.to}
              to={action.to}
              className={styles.actionCard}
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
            >
              <div
                className={styles.iconWrapper}
                style={{ background: action.gradient }}
              >
                {action.icon}
              </div>
              <div className={styles.actionContent}>
                <h3 className={styles.actionLabel}>{action.label}</h3>
                <p className={styles.actionDescription}>{action.description}</p>
              </div>
              <div className={styles.arrow}>→</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};