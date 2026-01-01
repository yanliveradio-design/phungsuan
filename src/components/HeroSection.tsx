import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Users, Sparkles } from "lucide-react";
import { Button } from "./Button";
import { useAuth } from "../helpers/useAuth";
import styles from "./HeroSection.module.css";

interface HeroSectionProps {
  className?: string;
}

export const HeroSection = ({ className }: HeroSectionProps) => {
  const { authState } = useAuth();
  const isAuthenticated = authState.type === "authenticated";

  return (
    <section className={`${styles.hero} ${className || ""}`}>
      <div className={styles.background}>
        <div className={styles.gradientBlob1}></div>
        <div className={styles.gradientBlob2}></div>
        <div className={styles.gradientBlob3}></div>
      </div>

      <div className={styles.content}>
        <div className={styles.floatingIcon1}>
          <BookOpen size={32} className={styles.icon} />
        </div>
        <div className={styles.floatingIcon2}>
          <Users size={28} className={styles.icon} />
        </div>
        <div className={styles.floatingIcon3}>
          <Sparkles size={24} className={styles.icon} />
        </div>

        <div className={styles.textContent}>
          <h1 className={styles.title}>
            Kết nối tri thức,
            <br />
            <span className={styles.titleHighlight}>Chia sẻ yêu thương</span>
          </h1>
          <p className={styles.subtitle}>Nơi phụng sự được khơi nguồn, tri thức được lan tỏa.</p>

          <div className={styles.ctas}>
            {isAuthenticated ? (
              <>
                <Button size="lg" asChild className={styles.primaryCta}>
                  <Link to="/books">
                    <BookOpen size={20} />
                    Khám phá sách
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className={styles.secondaryCta}>
                  <Link to="/activities">
                    <Users size={20} />
                    Tham gia hoạt động
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button size="lg" asChild className={styles.primaryCta}>
                  <Link to="/register">
                    <Sparkles size={20} />
                    Tham gia ngay
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className={styles.secondaryCta}>
                  <Link to="/login">Đăng nhập</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};