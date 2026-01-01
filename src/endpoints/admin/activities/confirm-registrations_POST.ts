import { schema, OutputType } from "./confirm-registrations_POST.schema";
import superjson from "superjson";
import { db } from "../../../helpers/db";
import { getServerUserSession } from "../../../helpers/getServerUserSession";
import { logAudit } from "../../../helpers/AuditLogger";

export async function handle(request: Request) {
  try {
    // 1. Auth Check
    const { user } = await getServerUserSession(request);
    if (user.role !== "admin") {
      return new Response(
        superjson.stringify({
          error: "Bạn không có quyền thực hiện thao tác này (Admin only)",
        }),
        { status: 403 }
      );
    }

    // 2. Parse Input
    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    if (input.registrationIds.length === 0) {
      return new Response(
        superjson.stringify({
          success: true,
          confirmedCount: 0,
        } satisfies OutputType)
      );
    }

    // 3. Update Registrations
    // We use a transaction to ensure data consistency and audit logging
    const confirmedCount = await db.transaction().execute(async (trx) => {
      const now = new Date();

      // Update status to 'confirmed'
      const updateResult = await trx
        .updateTable("activityRegistration")
        .set({
          status: "confirmed",
          confirmedAt: now,
          confirmedBy: user.id,
        })
        .where("id", "in", input.registrationIds)
        // Only update pending ones to avoid re-confirming or messing up other states if any
        .where("status", "=", "pending")
        .returning(["id", "userId", "activityId"])
        .execute();

      // 4. Audit Log
      // We log individually for better traceability
      for (const reg of updateResult) {
        await logAudit(
          user.id,
          "registration_confirmed",
          "activity_registration",
          reg.id,
          `Confirmed registration for user ${reg.userId} in activity ${reg.activityId}`
        );
      }

      return updateResult.length;
    });

    return new Response(
      superjson.stringify({
        success: true,
        confirmedCount,
      } satisfies OutputType)
    );
  } catch (error) {
    if (error instanceof Error) {
      return new Response(superjson.stringify({ error: error.message }), {
        status: 400,
      });
    }
    return new Response(
      superjson.stringify({ error: "Đã xảy ra lỗi không xác định" }),
      { status: 500 }
    );
  }
}