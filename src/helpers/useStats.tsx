import { useQuery } from "@tanstack/react-query";
import { getHomeStats } from "../endpoints/stats/home_GET.schema";

type StatsData = {
  totalBooks: number;
  totalActivities: number;
  activeMembers: number;
};

/**
 * Hook to get home page statistics.
 * Fetches data from the /stats/home endpoint and provides a compatible interface.
 */
export const useStats = () => {
  const { data, isFetching, error } = useQuery({
    queryKey: ["stats", "home"],
    queryFn: () => getHomeStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    placeholderData: (previousData) => previousData,
  });

  return {
    data: data ? {
      totalBooks: data.totalBooks,
      totalActivities: data.totalActivities,
      activeMembers: data.totalMembers,
    } : undefined,
    isFetching,
    error,
  };
};