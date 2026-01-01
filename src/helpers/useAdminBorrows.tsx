import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminBorrowsList,
  InputType as ListInput,
} from "../endpoints/admin/borrows/list_GET.schema";
import {
  postUpdateBorrowStatus,
  InputType as UpdateStatusInput,
} from "../endpoints/admin/borrows/update-status_POST.schema";
import {
  postGetOwnerPhone,
  InputType as GetPhoneInput,
} from "../endpoints/admin/borrows/get-phone_POST.schema";
import { toast } from "sonner";

export const ADMIN_BORROWS_KEY = ["admin", "borrows"] as const;

export function useAdminBorrowsList(filters: ListInput) {
  return useQuery({
    queryKey: [...ADMIN_BORROWS_KEY, filters],
    queryFn: () => getAdminBorrowsList(filters),
  });
}

export function useUpdateBorrowStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateStatusInput) => postUpdateBorrowStatus(data),
    onSuccess: () => {
      toast.success("Borrow status updated successfully");
      queryClient.invalidateQueries({ queryKey: ADMIN_BORROWS_KEY });
    },
    onError: (error) => {
      toast.error(`Update failed: ${error.message}`);
    },
  });
}

export function useGetOwnerPhone() {
  return useMutation({
    mutationFn: (data: GetPhoneInput) => postGetOwnerPhone(data),
    onError: (error) => {
      toast.error(`Failed to get phone: ${error.message}`);
    },
  });
}