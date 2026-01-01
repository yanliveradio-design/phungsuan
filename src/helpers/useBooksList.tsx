import { useQuery } from "@tanstack/react-query";
import { getBooksList, type InputType, type OutputType } from "../endpoints/books/list_GET.schema";

export const useBooksList = (query: InputType = {}) => {
  return useQuery<OutputType, Error>({
    queryKey: ["books", "list", query],
    queryFn: () => getBooksList(query),
  });
};