import { useQuery } from "@tanstack/react-query";
import { getPublicTopics } from "../endpoints/feedback/topics_GET.schema";

export const usePublicTopics = () => {
  return useQuery({
    queryKey: ["public", "feedback", "topics"],
    queryFn: async () => {
      return await getPublicTopics();
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes since topics don't change often
  });
};