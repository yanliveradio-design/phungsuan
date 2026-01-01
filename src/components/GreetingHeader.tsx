import React from "react";
import { useAuth } from "../helpers/useAuth";
import { ThemeModeSwitch } from "./ThemeModeSwitch";
import styles from "./GreetingHeader.module.css";

export const GreetingHeader = ({ className }: { className?: string }) => {
  const { authState } = useAuth();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  const getDisplayName = () => {
    if (authState.type === "authenticated") {
      return authState.user.fullName.split(" ").slice(-1)[0]; // Get first name
    }
    return null;
  };

  const displayName = getDisplayName();

  return (
    <div className={`${styles.header} ${className || ""}`}>
      <div className={styles.greeting}>
        <h1 className={styles.greetingText}>
          {displayName ? `${getGreeting()}, ${displayName}!` : "Chào mừng đến BookShare"}
        </h1>
        <span className={styles.leafDecor}>🌿</span>
      </div>
      <div className={styles.actions}>
        <ThemeModeSwitch />
      </div>
    </div>
  );
};