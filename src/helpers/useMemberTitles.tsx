import { useQuery } from "@tanstack/react-query";
import { getMemberTitles } from "../endpoints/member/titles_GET.schema";

export const MEMBER_TITLES_QUERY_KEY = ["member", "titles"];

export function useMemberTitles(userId?: number) {
  return useQuery({
    queryKey: [...MEMBER_TITLES_QUERY_KEY, userId],
    queryFn: () => getMemberTitles({ userId }),
  });
}