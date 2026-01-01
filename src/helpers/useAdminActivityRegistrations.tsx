import { useQuery } from "@tanstack/react-query";
import {
  getAdminActivityRegistrations,
  InputType,
} from "../endpoints/admin/activities/registrations_GET.schema";

export const useAdminActivityRegistrations = (params: InputType) => {
  return useQuery({
    queryKey: ["admin", "activity", "registrations", params.activityId],
    queryFn: () => getAdminActivityRegistrations(params),
    enabled: !!params.activityId,
  });
};