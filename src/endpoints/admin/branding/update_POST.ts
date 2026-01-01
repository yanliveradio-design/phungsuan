import { schema, OutputType } from "./update_POST.schema";
import { getServerUserSession } from "../../../helpers/getServerUserSession";
import { db } from "../../../helpers/db";
import { logAudit } from "../../../helpers/AuditLogger";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const session = await getServerUserSession(request);

    // Strict check for super_admin
    if (session.user.adminRole !== "super_admin") {
      return new Response(
        superjson.stringify({
          error: "Chỉ Super Admin mới có quyền thay đổi thông tin thương hiệu.",
        }),
        { status: 403 }
      );
    }

    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    await db.transaction().execute(async (trx) => {
      // Check if a record exists
      const existingRecord = await trx
        .selectFrom("appBranding")
        .select("id")
        .limit(1)
        .executeTakeFirst();

      let brandingId: number;

      if (existingRecord) {
        // Update existing
        const updated = await trx
          .updateTable("appBranding")
          .set({
            logoType: input.logoType,
            logoValue: input.logoValue,
            appName: input.appName,
            appDescription: input.appDescription || null,
            contactEmail: input.contactEmail || null,
            contactPhone: input.contactPhone || null,
            pageCovers: JSON.stringify(input.pageCovers || {}),
            updatedBy: session.user.id,
            updatedAt: new Date(),
          })
          .where("id", "=", existingRecord.id)
          .returning("id")
          .executeTakeFirstOrThrow();
        brandingId = updated.id;
      } else {
        // Insert new
        const inserted = await trx
          .insertInto("appBranding")
          .values({
            logoType: input.logoType,
            logoValue: input.logoValue,
            appName: input.appName,
            appDescription: input.appDescription || null,
            contactEmail: input.contactEmail || null,
            contactPhone: input.contactPhone || null,
            pageCovers: JSON.stringify(input.pageCovers || {}),
            updatedBy: session.user.id,
            // createdAt is generated
          })
          .returning("id")
          .executeTakeFirstOrThrow();
        brandingId = inserted.id;
      }

      // Log audit
      // We use 'topic_updated' as a proxy for 'branding_updated' since 'branding_updated' isn't in the enum yet
      // Ideally we should add 'branding_updated' to the enum, but we must stick to existing types.
      // 'topic_updated' or 'activity_updated' are closest generic update actions, or we can just use 'admin_manual' if available?
      // Checking AuditAction enum: ... 'topic_updated', 'user_locked' ...
      // Let's use 'topic_updated' with a clear note, or maybe we can interpret 'topic' broadly.
      // Actually, looking at the enum, there isn't a perfect fit. 'topic_updated' is for feedback topics.
      // Let's use 'topic_updated' but specify targetType as 'app_branding'.
      await logAudit(
        session.user.id,
        "topic_updated", // Using as a fallback for generic update
        "app_branding",
        brandingId,
        `Updated branding: ${input.appName}`
      );
    });

    return new Response(
      superjson.stringify({ success: true } satisfies OutputType)
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