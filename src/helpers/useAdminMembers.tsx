import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMembersList, MemberListParams } from "../endpoints/admin/members/list_GET.schema";
import { postUpdateMemberTrusted } from "../endpoints/admin/members/update-trusted_POST.schema";
import { postUpdateMemberJoinedDate } from "../endpoints/admin/members/update-joined-date_POST.schema";
import { postLockMember } from "../endpoints/admin/members/lock_POST.schema";
import { postUnlockMember } from "../endpoints/admin/members/unlock_POST.schema";
import { getMemberHistory } from "../endpoints/admin/members/history_GET.schema";
import { toast } from "sonner";

export const ADMIN_MEMBERS_KEY = ["admin", "members"];
export const ADMIN_MEMBER_HISTORY_KEY = ["admin", "member", "history"];

export function useMembersList(params: MemberListParams) {
  return useQuery({
    queryKey: [...ADMIN_MEMBERS_KEY, params],
    queryFn: () => getMembersList(params),
  });
}

export function useMemberHistory(userId: number | undefined) {
  return useQuery({
    queryKey: [...ADMIN_MEMBER_HISTORY_KEY, userId],
    queryFn: () => userId ? getMemberHistory({ userId }) : Promise.reject("No user ID"),
    enabled: !!userId,
  });
}

export function useUpdateMemberTrusted() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postUpdateMemberTrusted,
    onSuccess: (data) => {
      toast.success(
        `Đã ${data.user.isTrustedMember ? "cấp" : "thu hồi"} quyền thành viên tin cậy cho ${data.user.fullName}`
      );
      queryClient.invalidateQueries({ queryKey: ADMIN_MEMBERS_KEY });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateMemberJoinedDate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postUpdateMemberJoinedDate,
    onSuccess: (data) => {
      toast.success(`Đã cập nhật ngày tham gia của ${data.user.fullName}`);
      queryClient.invalidateQueries({ queryKey: ADMIN_MEMBERS_KEY });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useLockMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postLockMember,
    onSuccess: (data) => {
      toast.success(`Đã khóa tài khoản của ${data.user.fullName}`);
      queryClient.invalidateQueries({ queryKey: ADMIN_MEMBERS_KEY });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

export function useUnlockMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postUnlockMember,
    onSuccess: (data) => {
      toast.success(`Đã mở khóa tài khoản cho ${data.user.fullName}`);
      queryClient.invalidateQueries({ queryKey: ADMIN_MEMBERS_KEY });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}