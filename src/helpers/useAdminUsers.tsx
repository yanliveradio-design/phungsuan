import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsersList, schema as listSchema } from "../endpoints/admin/users/list_GET.schema";
import { postUpdateUserRole } from "../endpoints/admin/users/update-role_POST.schema";
import { toast } from "sonner";
import { z } from "zod";

export const ADMIN_USERS_KEY = ["admin", "users"];

export function useUsersList(params: z.infer<typeof listSchema>) {
  return useQuery({
    queryKey: [...ADMIN_USERS_KEY, params],
    queryFn: () => getUsersList(params),
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postUpdateUserRole,
    onSuccess: (data) => {
      toast.success(`Đã cập nhật quyền cho user ${data.user.fullName}`);
      queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEY });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}