import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMemberActivitiesList, InputType as MemberActivitiesInput } from "../endpoints/activities/member_GET.schema";
import { postRegisterActivity } from "../endpoints/activities/register_POST.schema";
import { postCheckinActivity } from "../endpoints/activities/checkin_POST.schema";
import { postSubmitFeedback } from "../endpoints/activities/feedback_POST.schema";
import { toast } from "sonner";

export const MEMBER_ACTIVITIES_KEY = ["activities", "member"];

export function useMemberActivitiesList(params: MemberActivitiesInput = {}) {
  return useQuery({
    queryKey: [...MEMBER_ACTIVITIES_KEY, params],
    queryFn: () => getMemberActivitiesList(params),
    // Keep data fresh as status changes often (checkin enabled, etc.)
    staleTime: 30 * 1000, 
  });
}

export function useRegisterActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postRegisterActivity,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: MEMBER_ACTIVITIES_KEY });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useCheckinActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postCheckinActivity,
    onSuccess: (data) => {
      toast.success(`Điểm danh thành công lúc ${data.checkinAt.toLocaleTimeString("vi-VN")}`);
      queryClient.invalidateQueries({ queryKey: MEMBER_ACTIVITIES_KEY });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useSubmitFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postSubmitFeedback,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: MEMBER_ACTIVITIES_KEY });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}