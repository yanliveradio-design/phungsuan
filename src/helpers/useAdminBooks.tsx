import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminBooksList,
  InputType as ListInput,
} from "../endpoints/admin/books/list_GET.schema";
import {
  getAdminBookIds,
  InputType as AllIdsInput,
} from "../endpoints/admin/books/all-ids_GET.schema";
import {
  postImportBooks,
  InputType as ImportInput,
} from "../endpoints/admin/books/import_POST.schema";
import {
  postBatchUpdateBooks,
  InputType as BatchUpdateInput,
} from "../endpoints/admin/books/batch-update_POST.schema";
import { toast } from "sonner";

export const ADMIN_BOOKS_KEY = ["admin", "books"] as const;

export function useAdminBooksList(filters: ListInput) {
  return useQuery({
    queryKey: [...ADMIN_BOOKS_KEY, filters],
    queryFn: () => getAdminBooksList(filters),
  });
}

export function useAdminBookIds(params: AllIdsInput, enabled: boolean = true) {
  return useQuery({
    queryKey: [...ADMIN_BOOKS_KEY, "all-ids", params],
    queryFn: () => getAdminBookIds(params),
    enabled,
  });
}

export function useImportBooks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ImportInput) => postImportBooks(data),
    onSuccess: (data) => {
      if (data.errors.length > 0) {
        toast.warning(`Imported ${data.imported} books with ${data.errors.length} errors.`);
      } else {
        toast.success(`Successfully imported ${data.imported} books.`);
      }
      queryClient.invalidateQueries({ queryKey: ADMIN_BOOKS_KEY });
    },
    onError: (error) => {
      toast.error(`Import failed: ${error.message}`);
    },
  });
}

export function useBatchUpdateBooks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BatchUpdateInput) => postBatchUpdateBooks(data),
    onSuccess: (data) => {
      toast.success(`Updated ${data.updatedCount} books successfully.`);
      queryClient.invalidateQueries({ queryKey: ADMIN_BOOKS_KEY });
    },
    onError: (error) => {
      toast.error(`Update failed: ${error.message}`);
    },
  });
}