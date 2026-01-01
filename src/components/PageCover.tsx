import React from "react";
import { useBranding } from "../helpers/useBranding";
import { Skeleton } from "./Skeleton";
import styles from "./PageCover.module.css";

export type PageCoverKey =
  | "home"
  | "books"
  | "activities"
  | "profile"
  | "myJourney"
  | "admin";

interface PageCoverProps {
  pageKey: PageCoverKey;
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
  fallbackGradient?: boolean;
}

export function PageCover({
  pageKey,
  title,
  subtitle,
  children,
  className,
  fallbackGradient = true,
}: PageCoverProps) {
  const { branding, isLoading } = useBranding();

  if (isLoading) {
    return (
      <div className={`${styles.container} ${className ?? ""}`}>
        <Skeleton className={styles.skeleton} />
      </div>
    );
  }

  const coverUrl = branding?.pageCovers?.[pageKey];
  const hasImage = !!coverUrl;

  // If no image and no fallback gradient, we might render nothing or just a container.
  // But per requirements, "If no cover image and fallbackGradient is true, show a subtle branded gradient".
  // If fallbackGradient is false and no image, we render a plain container (which might be transparent or styled by consumer).
  
  const style: React.CSSProperties = {};
  if (hasImage) {
    style.backgroundImage = `url(${coverUrl})`;
  }

  return (
    <div
      className={`
        ${styles.container} 
        ${hasImage ? styles.hasImage : ""} 
        ${!hasImage && fallbackGradient ? styles.fallbackGradient : ""}
        ${className ?? ""}
      `}
      style={style}
    >
      {/* Overlay for text readability if there is an image */}
      {hasImage && <div className={styles.overlay} />}

      <div className={styles.content}>
        {title && <h1 className={styles.title}>{title}</h1>}
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}