import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFeedbackList } from "../endpoints/admin/feedback/list_GET.schema";
import { postRetagFeedback } from "../endpoints/admin/feedback/retag_POST.schema";
import { postPublishFeedback } from "../endpoints/admin/feedback/publish_POST.schema";
import { postFlagFeedback } from "../endpoints/admin/feedback/flag_POST.schema";
import { toast } from "sonner";

export const FEEDBACK_LIST_KEY = ["admin", "feedback", "list"];

export function useFeedbackList(
  tab: "ai_suggested" | "ai_flagged" | "all",
  activityId?: number
) {
  return useQuery({
    queryKey: [...FEEDBACK_LIST_KEY, tab, activityId],
    queryFn: () => getFeedbackList({ tab, activityId }),
  });
}

export function useRetagFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postRetagFeedback,
    onSuccess: () => {
      toast.success("Đã cập nhật chủ đề thành công");
      queryClient.invalidateQueries({ queryKey: FEEDBACK_LIST_KEY });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function usePublishFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postPublishFeedback,
    onSuccess: () => {
      toast.success("Đã xuất bản phản hồi thành công");
      queryClient.invalidateQueries({ queryKey: FEEDBACK_LIST_KEY });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useFlagFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postFlagFeedback,
    onSuccess: (_, variables) => {
      toast.success(
        variables.flagged ? "Đã gắn cờ phản hồi" : "Đã gỡ cờ phản hồi"
      );
      queryClient.invalidateQueries({ queryKey: FEEDBACK_LIST_KEY });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}