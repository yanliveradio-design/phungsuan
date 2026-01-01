import { useQuery } from "@tanstack/react-query";
import { getPublishedFeedback, InputType } from "../endpoints/feedback/published_GET.schema";

export const USE_PUBLISHED_FEEDBACK_KEY = "publishedFeedback";

export const usePublishedFeedback = (
  params: InputType = {},
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: [USE_PUBLISHED_FEEDBACK_KEY, params],
    queryFn: () => getPublishedFeedback(params),
    enabled: options?.enabled ?? true,
    // Since the endpoint returns random data, we might want to avoid aggressive caching 
    // if the intention is to rotate testimonials on refresh. 
    // However, for a single session, keeping it stable is usually better UX.
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};