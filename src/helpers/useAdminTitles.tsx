import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminTitlesList } from "../endpoints/admin/titles/list_GET.schema";
import { postCreateTitle } from "../endpoints/admin/titles/create_POST.schema";
import { postUpdateTitle } from "../endpoints/admin/titles/update_POST.schema";
import { postDeleteTitle } from "../endpoints/admin/titles/delete_POST.schema";
import { postAssignTitle } from "../endpoints/admin/titles/assign_POST.schema";
import { postUnassignTitle } from "../endpoints/admin/titles/unassign_POST.schema";
import { toast } from "sonner";

export const ADMIN_TITLES_KEY = ["admin", "titles"];

export function useTitlesList() {
  return useQuery({
    queryKey: ADMIN_TITLES_KEY,
    queryFn: () => getAdminTitlesList(),
  });
}

export function useCreateTitle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postCreateTitle,
    onSuccess: (data) => {
      toast.success(`Đã tạo danh hiệu "${data.title.name}"`);
      queryClient.invalidateQueries({ queryKey: ADMIN_TITLES_KEY });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateTitle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postUpdateTitle,
    onSuccess: (data) => {
      toast.success(`Đã cập nhật danh hiệu "${data.title.name}"`);
      queryClient.invalidateQueries({ queryKey: ADMIN_TITLES_KEY });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteTitle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postDeleteTitle,
    onSuccess: () => {
      toast.success("Đã xóa danh hiệu");
      queryClient.invalidateQueries({ queryKey: ADMIN_TITLES_KEY });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useAssignTitle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postAssignTitle,
    onSuccess: (data) => {
      toast.success(
        `Đã gán danh hiệu "${data.title.name}" cho ${data.user.fullName}`
      );
      // Invalidate titles list to update counts if needed, though counts might not be critical to update immediately
      queryClient.invalidateQueries({ queryKey: ADMIN_TITLES_KEY });
      // Also invalidate member titles if we are viewing that user
      queryClient.invalidateQueries({
        queryKey: ["member", "titles", data.user.id],
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useUnassignTitle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postUnassignTitle,
    onSuccess: (_, variables) => {
      toast.success("Đã thu hồi danh hiệu");
      queryClient.invalidateQueries({ queryKey: ADMIN_TITLES_KEY });
      queryClient.invalidateQueries({
        queryKey: ["member", "titles", variables.userId],
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}