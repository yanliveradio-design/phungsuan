import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postUpdateBookCover, InputType, OutputType } from "../endpoints/admin/books/update-cover_POST.schema";
import { toast } from "sonner";

export const useAdminUpdateBookCover = () => {
  const queryClient = useQueryClient();

  return useMutation<OutputType, Error, InputType>({
    mutationFn: (data) => postUpdateBookCover(data),
    onSuccess: (data) => {
      toast.success("Book cover updated successfully");
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "books"] });
    },
    onError: (error) => {
      toast.error(`Failed to update book cover: ${error.message}`);
    },
  });
};