import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMySubmissions, InputType as GetInput } from "../endpoints/member/book/my-submissions_GET.schema";
import { postSubmitBook, InputType as PostInput } from "../endpoints/member/book/submit_POST.schema";
import { toast } from "sonner";

export const MEMBER_BOOKS_QUERY_KEY = ["member", "books", "submissions"];

export function useMemberBookSubmissions(params: GetInput = { page: 1, limit: 10 }) {
  return useQuery({
    queryKey: [...MEMBER_BOOKS_QUERY_KEY, params],
    queryFn: () => getMySubmissions(params),
  });
}

export function useSubmitBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PostInput) => postSubmitBook(data),
    onSuccess: () => {
      toast.success("Gửi sách thành công! Sách đang chờ duyệt.");
      queryClient.invalidateQueries({ queryKey: MEMBER_BOOKS_QUERY_KEY });
    },
    onError: (error) => {
      toast.error(`Gửi sách thất bại: ${error.message}`);
    },
  });
}