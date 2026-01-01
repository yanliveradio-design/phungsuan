import { schema, OutputType } from "./send_POST.schema";
import { getServerUserSession } from "../../../helpers/getServerUserSession";
import { createBulkNotifications } from "../../../helpers/NotificationService";
import { logAudit } from "../../../helpers/AuditLogger";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const session = await getServerUserSession(request);

    if (!session.user.role || session.user.role !== "admin") {
      return new Response(
        superjson.stringify({ error: "Bạn không có quyền thực hiện hành động này." }),
        { status: 403 }
      );
    }

    const json = superjson.parse(await request.text());
    const input = schema.parse(json);

    const result = await createBulkNotifications({
      title: input.title,
      message: input.message,
      link: input.link,
      type: "admin_manual",
      isImportant: input.isImportant,
      sentByAdmin: session.user.id,
      targetType: input.targetType,
      targetFilter: input.targetFilter,
    });

    // Log audit
    await logAudit(
      session.user.id,
      "notification_sent",
      "notification_batch",
      result.batchId,
      `Gửi thông báo "${input.title}" tới ${result.recipientCount} người dùng`
    );

    return new Response(
      superjson.stringify({
        batchId: result.batchId,
        recipientCount: result.recipientCount,
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