import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSettings } from "../endpoints/admin/settings/get_GET.schema";
import { postUpdateSetting } from "../endpoints/admin/settings/update_POST.schema";
import { toast } from "sonner";

export const SETTINGS_KEY = ["admin", "settings"];

export function useSettings() {
  return useQuery({
    queryKey: SETTINGS_KEY,
    queryFn: () => getSettings(),
  });
}

export function useUpdateSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postUpdateSetting,
    onSuccess: () => {
      toast.success("Đã cập nhật cài đặt thành công");
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}