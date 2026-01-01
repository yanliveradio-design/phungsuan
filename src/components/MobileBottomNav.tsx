import React from "react";
import { Link } from "react-router-dom";
import styles from "./MobileBottomNav.module.css";

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface MobileBottomNavProps {
  items: NavItem[];
  currentPath: string;
}

export const MobileBottomNav = ({ items, currentPath }: MobileBottomNavProps) => {
  return (
    <nav className={styles.bottomNav}>
      {items.map((item) => {
        const isActive = currentPath === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`${styles.navItem} ${isActive ? styles.active : ""}`}
          >
            <div className={styles.icon}>{item.icon}</div>
            <span className={styles.label}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};