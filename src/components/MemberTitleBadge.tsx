import React from 'react';
import { TitleColor } from '../helpers/schema';
import styles from './MemberTitleBadge.module.css';

interface MemberTitleBadgeProps {
  /** The title name to display */
  name: string;
  /** The color theme for the badge */
  color: TitleColor;
  /** The size of the badge. Defaults to "sm" */
  size?: 'sm' | 'md';
  /** Additional CSS classes */
  className?: string;
}

/**
 * A reusable component for displaying member titles with specific color themes.
 * Follows the Wabi-Sabi aesthetic with soft, organic colors and subtle borders.
 */
export const MemberTitleBadge = ({
  name,
  color,
  size = 'sm',
  className = '',
}: MemberTitleBadgeProps) => {
  return (
    <span
      className={`${styles.badge} ${styles[color]} ${styles[size]} ${className}`}
    >
      {name}
    </span>
  );
};