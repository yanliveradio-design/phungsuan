import { z } from "zod";
import superjson from "superjson";

const ImportedBookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  coverUrl: z.string().optional().nullable(),
  province: z.string().optional().nullable(),
  district: z.string().optional().nullable(),
  ownerName: z.string().optional().nullable(),
  ownerPhoneFull: z.string().optional().nullable(),
});

export const schema = z.object({
  books: z.array(ImportedBookSchema),
});

export type InputType = z.infer<typeof schema>;

export type OutputType = {
  imported: number;
  errors: {
    row: number;
    message: string;
  }[];
};

export const postImportBooks = async (
  body: InputType,
  init?: RequestInit
): Promise<OutputType> => {
  const validatedInput = schema.parse(body);
  const result = await fetch(`/_api/admin/books/import`, {
    method: "POST",
    body: superjson.stringify(validatedInput),
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!result.ok) {
    const errorObject = superjson.parse<{ error: string }>(await result.text());
    throw new Error(errorObject.error);
  }
  return superjson.parse<OutputType>(await result.text());
};