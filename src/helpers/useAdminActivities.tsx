import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminActivitiesList,
  InputType as ListInput,
} from "../endpoints/admin/activities/list_GET.schema";
import {
  postCreateActivity,
  InputType as CreateInput,
} from "../endpoints/admin/activities/create_POST.schema";
import {
  postUpdateActivity,
  InputType as UpdateInput,
} from "../endpoints/admin/activities/update_POST.schema";
import {
  postToggleCheckin,
  InputType as ToggleCheckinInput,
} from "../endpoints/admin/activities/toggle-checkin_POST.schema";
import {
  postCloseActivity,
  InputType as CloseInput,
} from "../endpoints/admin/activities/close_POST.schema";
import { postBulkDeleteActivities } from "../endpoints/admin/activities/bulk-delete_POST.schema";
import { toast } from "sonner";

export const ADMIN_ACTIVITIES_KEY = ["admin", "activities"] as const;

export function useAdminActivitiesList(filters: ListInput) {
  return useQuery({
    queryKey: [...ADMIN_ACTIVITIES_KEY, filters],
    queryFn: () => getAdminActivitiesList(filters),
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateInput) => postCreateActivity(data),
    onSuccess: () => {
      toast.success("Tạo hoạt động thành công");
      queryClient.invalidateQueries({ queryKey: ADMIN_ACTIVITIES_KEY });
    },
    onError: (error) => {
      toast.error(`Lỗi: ${error.message}`);
    },
  });
}

export function useUpdateActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateInput) => postUpdateActivity(data),
    onSuccess: () => {
      toast.success("Cập nhật hoạt động thành công");
      queryClient.invalidateQueries({ queryKey: ADMIN_ACTIVITIES_KEY });
    },
    onError: (error) => {
      toast.error(`Lỗi: ${error.message}`);
    },
  });
}

export function useToggleCheckin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ToggleCheckinInput) => postToggleCheckin(data),
    onSuccess: (data) => {
      toast.success(
        `Đã ${data.checkinEnabled ? "bật" : "tắt"} check-in cho hoạt động`
      );
      queryClient.invalidateQueries({ queryKey: ADMIN_ACTIVITIES_KEY });
    },
    onError: (error) => {
      toast.error(`Lỗi: ${error.message}`);
    },
  });
}

export function useCloseActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CloseInput) => postCloseActivity(data),
    onSuccess: () => {
      toast.success("Đã đóng hoạt động");
      queryClient.invalidateQueries({ queryKey: ADMIN_ACTIVITIES_KEY });
    },
    onError: (error) => {
      toast.error(`Lỗi: ${error.message}`);
    },
  });
}

export function useBulkDeleteActivities() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { activityIds: number[] }) => postBulkDeleteActivities(data),
    onSuccess: (data) => {
      toast.success(`Đã xóa ${data.deletedCount} hoạt động`);
      queryClient.invalidateQueries({ queryKey: ADMIN_ACTIVITIES_KEY });
    },
    onError: (error) => {
      toast.error(`Lỗi: ${error.message}`);
    },
  });
}