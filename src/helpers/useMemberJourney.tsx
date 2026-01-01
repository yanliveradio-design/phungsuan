import { useQuery } from "@tanstack/react-query";
import { getMemberJourney } from "../endpoints/member/journey_GET.schema";

export function useMemberJourney() {
  return useQuery({
    queryKey: ["member", "journey"],
    queryFn: () => getMemberJourney(),
  });
}