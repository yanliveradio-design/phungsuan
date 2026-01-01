import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTopicsList } from "../endpoints/admin/topics/list_GET.schema";
import { postCreateTopic } from "../endpoints/admin/topics/create_POST.schema";
import { toast } from "sonner";

export const TOPICS_LIST_KEY = ["admin", "topics", "list"];

export function useTopicsList() {
  return useQuery({
    queryKey: TOPICS_LIST_KEY,
    queryFn: () => getTopicsList(),
  });
}

export function useCreateTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postCreateTopic,
    onSuccess: () => {
      toast.success("Đã tạo chủ đề mới thành công");
      queryClient.invalidateQueries({ queryKey: TOPICS_LIST_KEY });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}