import { useQuery } from "@tanstack/react-query";
import { getFilterOptions } from "../endpoints/library/filter-options_GET.schema";

export const BOOK_FILTERS_QUERY_KEY = ["library", "filter-options"] as const;

/**
 * Hook to fetch available filter options for the book library.
 * Includes categories, provinces, and districts grouped by province.
 */
export const useBookFilterOptions = () => {
  return useQuery({
    queryKey: BOOK_FILTERS_QUERY_KEY,
    queryFn: () => getFilterOptions(),
    staleTime: 1000 * 60 * 30, // 30 minutes, as these options don't change frequently
  });
};