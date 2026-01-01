import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { usePublishedFeedback } from "../helpers/usePublishedFeedback";
import { Skeleton } from "./Skeleton";
import styles from "./FeedbackCarousel.module.css";

export const FeedbackCarousel = ({ className }: { className?: string }) => {
  const { data, isFetching } = usePublishedFeedback({ limit: 10 });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Filter for positive feedback (rating >= 4)
  const positiveFeedback = data?.feedbacks.filter((f) => f.rating >= 4) || [];

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (positiveFeedback.length <= 1) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % positiveFeedback.length);
        setIsTransitioning(false);
      }, 300);
    }, 5000);

    return () => clearInterval(interval);
  }, [positiveFeedback.length]);

  const handleDotClick = (index: number) => {
    if (index === currentIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 300);
  };

  if (isFetching) {
    return (
      <div className={`${styles.carousel} ${className || ""}`}>
        <Skeleton className={styles.cardSkeleton} />
      </div>
    );
  }

  if (!positiveFeedback.length) {
    return null;
  }

  const currentFeedback = positiveFeedback[currentIndex];

  return (
    <div className={`${styles.carousel} ${className || ""}`}>
      <div className={`${styles.card} ${isTransitioning ? styles.fadeOut : styles.fadeIn}`}>
        <div className={styles.quoteDecor}>"</div>
        <div className={styles.rating}>
          {Array.from({ length: currentFeedback.rating }).map((_, i) => (
            <Star key={i} size={16} fill="var(--primary)" color="var(--primary)" />
          ))}
        </div>
        <p className={styles.comment}>
          {currentFeedback.comment || "Trải nghiệm tuyệt vời!"}
        </p>
        <div className={styles.meta}>
          <span className={styles.author}>
            {currentFeedback.user?.fullName || "Ẩn danh"}
          </span>
          {currentFeedback.topicName && (
            <>
              <span className={styles.separator}>·</span>
              <span className={styles.topic}>{currentFeedback.topicName}</span>
            </>
          )}
        </div>
        <div className={styles.leafDecor}>🌱</div>
      </div>

      {positiveFeedback.length > 1 && (
        <div className={styles.dots}>
          {positiveFeedback.map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${index === currentIndex ? styles.activeDot : ""}`}
              onClick={() => handleDotClick(index)}
              aria-label={`Go to feedback ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};