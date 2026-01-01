import { schema, OutputType } from "./update-avatar_POST.schema";
import { getServerUserSession } from "../../helpers/getServerUserSession";
import { db } from "../../helpers/db";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const session = await getServerUserSession(request);
    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    // Additional validation for base64 string format if zod regex isn't enough or for specific logic
    if (!input.avatarData.startsWith("data:image/")) {
      return new Response(
        superjson.stringify({
          error: "Invalid image format. Must be a data URL.",
        }),
        { status: 400 }
      );
    }

    // Calculate approximate size in bytes (base64 string length * 0.75)
    // The requirement says "base64 string length should be less than 500KB"
    // 500KB = 500 * 1024 bytes = 512000 characters roughly.
    // Let's stick to the string length check as requested.
    const MAX_SIZE_CHARS = 500 * 1024; // 500KB in characters
    if (input.avatarData.length > MAX_SIZE_CHARS) {
      return new Response(
        superjson.stringify({
          error: "Image too large. Please use an image smaller than 375KB.",
        }),
        { status: 400 }
      );
    }

    const updatedUser = await db
      .updateTable("users")
      .set({
        avatarUrl: input.avatarData,
        updatedAt: new Date(),
      })
      .where("id", "=", session.user.id)
      .returning([
        "id",
        "fullName",
        "email",
        "avatarUrl",
        "province",
        "district",
        "isTrustedMember",
        "joinedAt",
        "joinedAtUpdatedByMember",
      ])
      .executeTakeFirstOrThrow();

    return new Response(
      superjson.stringify({
        success: true,
        user: updatedUser,
      } satisfies OutputType)
    );
  } catch (error) {
    return new Response(
      superjson.stringify({
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      }),
      { status: 500 }
    );
  }
}