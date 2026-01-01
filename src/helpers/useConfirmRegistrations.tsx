import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  postConfirmRegistrations,
  InputType,
  OutputType,
} from "../endpoints/admin/activities/confirm-registrations_POST.schema";
import { toast } from "sonner";

export const useConfirmRegistrations = () => {
  const queryClient = useQueryClient();

  return useMutation<OutputType, Error, InputType>({
    mutationFn: postConfirmRegistrations,
    onSuccess: (data) => {
      if (data.confirmedCount > 0) {
        toast.success(`Đã xác nhận ${data.confirmedCount} đăng ký thành công`);
      } else {
        toast.info("Không có đăng ký nào cần xác nhận");
      }
      // Invalidate the registrations list to refresh the UI
      queryClient.invalidateQueries({
        queryKey: ["admin", "activity", "registrations"],
      });
    },
    onError: (error) => {
      toast.error(`Lỗi: ${error.message}`);
    },
  });
};