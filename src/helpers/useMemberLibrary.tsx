import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMemberBooks, InputType as BooksInput } from "../endpoints/library/books_GET.schema";
import { getBookDetail } from "../endpoints/library/book-detail_GET.schema";
import { postBorrowRequest } from "../endpoints/library/borrow-request_POST.schema";
import { getMyBorrows, InputType as MyBorrowsInput } from "../endpoints/library/my-borrows_GET.schema";
import { postBorrowAction } from "../endpoints/library/borrow-action_POST.schema";
import { postReportBook } from "../endpoints/library/report-book_POST.schema";

export const LIBRARY_KEYS = {
  books: (filters: BooksInput) => ["library", "books", filters] as const,
  bookDetail: (bookId: number) => ["library", "book", bookId] as const,
  myBorrows: (filters: MyBorrowsInput) => ["library", "my-borrows", filters] as const,
};

export function useMemberBooks(filters: BooksInput) {
  return useQuery({
    queryKey: LIBRARY_KEYS.books(filters),
    queryFn: () => getMemberBooks(filters),
    placeholderData: (prev) => prev,
  });
}

export function useBookDetail(bookId: number) {
  return useQuery({
    queryKey: LIBRARY_KEYS.bookDetail(bookId),
    queryFn: () => getBookDetail({ bookId }),
    enabled: !!bookId,
  });
}

export function useRequestBorrow() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: postBorrowRequest,
    onSuccess: (_, variables) => {
      // Invalidate book detail to update active borrow status
      queryClient.invalidateQueries({ queryKey: LIBRARY_KEYS.bookDetail(variables.bookId) });
      // Invalidate my borrows list
      queryClient.invalidateQueries({ queryKey: ["library", "my-borrows"] });
    },
  });
}

export function useMyBorrows(filters: MyBorrowsInput, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: LIBRARY_KEYS.myBorrows(filters),
    queryFn: () => getMyBorrows(filters),
    enabled: options?.enabled ?? true,
  });
}

export function useBorrowAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postBorrowAction,
    onSuccess: () => {
      // Invalidate all borrow related queries
      queryClient.invalidateQueries({ queryKey: ["library", "my-borrows"] });
      // Also invalidate book details as status might have changed
      queryClient.invalidateQueries({ queryKey: ["library", "book"] });
      // And the main book list as availability might have changed
      queryClient.invalidateQueries({ queryKey: ["library", "books"] });
    },
  });
}

export function useReportBook() {
  return useMutation({
    mutationFn: postReportBook,
  });
}