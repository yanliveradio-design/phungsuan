import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProfile } from "../endpoints/profile/get_GET.schema";
import { postUpdateLocation } from "../endpoints/profile/update-location_POST.schema";
import { postSendFeedback } from "../endpoints/profile/send-feedback_POST.schema";
import { toast } from "sonner";

export const PROFILE_QUERY_KEY = ["profile", "me"];

export function useProfile() {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: () => getProfile(),
  });
}

export function useUpdateLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postUpdateLocation,
    onSuccess: (data) => {
      toast.success("Đã cập nhật địa điểm thành công");
      queryClient.setQueryData(PROFILE_QUERY_KEY, { user: data.user });
    },
    onError: (error) => {
      toast.error(error.message || "Không thể cập nhật địa điểm");
    },
  });
}

export function useSendFeedback() {
  return useMutation({
    mutationFn: postSendFeedback,
    onSuccess: () => {
      toast.success("Đã gửi phản hồi thành công");
    },
    onError: (error) => {
      toast.error(error.message || "Không thể gửi phản hồi");
    },
  });
}