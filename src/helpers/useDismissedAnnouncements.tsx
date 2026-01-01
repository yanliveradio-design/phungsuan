import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "floot_dismissed_announcements";

export function useDismissedAnnouncements() {
  const [dismissedIds, setDismissedIds] = useState<number[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setDismissedIds(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load dismissed announcements", e);
    }
  }, []);

  const dismiss = useCallback((id: number) => {
    setDismissedIds((prev) => {
      const next = [...new Set([...prev, id])];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error("Failed to save dismissed announcements", e);
      }
      return next;
    });
  }, []);

  const isDismissed = useCallback(
    (id: number) => dismissedIds.includes(id),
    [dismissedIds]
  );

  return { dismiss, isDismissed };
}