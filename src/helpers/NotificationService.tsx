import { db } from "./db";
import {
  NotificationType,
  NotificationChannel,
  Notification,
  NotificationBatch,
} from "./schema";
import { Selectable } from "kysely";

// Helper to check for duplicate notifications
async function checkDuplicateNotification(
  userId: number,
  relatedId: number | null | undefined,
  relatedType: string | null | undefined,
  type: NotificationType
): Promise<boolean> {
  if (!relatedId || !relatedType) return false;
  
  const existing = await db
    .selectFrom("notification")
    .where("userId", "=", userId)
    .where("relatedId", "=", relatedId)
    .where("relatedType", "=", relatedType)
    .where("type", "=", type)
    .select("id")
    .executeTakeFirst();
  
  return !!existing;
}

// Types for creating notifications
export type CreateNotificationParams = {
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  link?: string | null;
  relatedId?: number | null;
  relatedType?: string | null;
  isImportant?: boolean;
  sentByAdmin?: number | null;
  skipDuplicateCheck?: boolean;
};

export type CreateBulkNotificationParams = {
  title: string;
  message: string;
  type: NotificationType;
  link?: string | null;
  isImportant?: boolean;
  sentByAdmin: number;
  targetType: "all" | "trusted" | "province" | "specific";
  targetFilter?: any; // Can be province string or array of user IDs
};

/**
 * Checks if a user is currently in their quiet hours.
 */
export async function isInQuietHours(userId: number): Promise<boolean> {
  const settings = await db
    .selectFrom("userNotificationSettings")
    .where("userId", "=", userId)
    .select(["quietHoursEnabled", "quietHoursStart", "quietHoursEnd"])
    .executeTakeFirst();

  if (
    !settings ||
    !settings.quietHoursEnabled ||
    !settings.quietHoursStart ||
    !settings.quietHoursEnd
  ) {
    return false;
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [startH, startM] = settings.quietHoursStart.split(":").map(Number);
  const [endH, endM] = settings.quietHoursEnd.split(":").map(Number);

  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  if (startMinutes < endMinutes) {
    // e.g. 22:00 to 23:00
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  } else {
    // e.g. 22:00 to 07:00 (crosses midnight)
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }
}

/**
 * Creates a single notification for a user.
 * Handles channel logic (though currently defaults to in_app).
 * Returns null if duplicate exists and check is enabled.
 */
export async function createNotification(
  params: CreateNotificationParams
): Promise<Selectable<Notification> | null> {
  // In a full implementation with email, we would check user settings here.
  // For now, we default to 'in_app' as per requirements, but we can still check quiet hours
  // to potentially delay "push" notifications if we had them.
  // Since we only store in DB, we just create it.

  // Check for duplicate notification unless explicitly skipped
  if (params.skipDuplicateCheck !== true) {
    const isDuplicate = await checkDuplicateNotification(
      params.userId,
      params.relatedId,
      params.relatedType,
      params.type
    );
    if (isDuplicate) {
      console.log(
        `Skipping duplicate notification for user ${params.userId}, type ${params.type}, relatedId ${params.relatedId}`
      );
      return null;
    }
  }

  // Check user settings to see if they want notifications for this channel?
  // For now, we assume critical system notifications always go through or default to in_app.
  const channel: NotificationChannel = "in_app";

  const result = await db
    .insertInto("notification")
    .values({
      userId: params.userId,
      title: params.title,
      message: params.message,
      type: params.type,
      link: params.link,
      relatedId: params.relatedId,
      relatedType: params.relatedType,
      isImportant: params.isImportant ?? false,
      sentByAdmin: params.sentByAdmin,
      channel: channel,
      isRead: false,
      // createdAt is generated
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  return result;
}

/**
 * Triggers notifications for new activity creation.
 * Notifies all active members about the new activity.
 */
export async function triggerNewActivityNotification(
  activityId: number,
  adminId: number
) {
  const activity = await db
    .selectFrom("activity")
    .where("id", "=", activityId)
    .select(["title"])
    .executeTakeFirst();

  if (!activity) return;

  // Get all active members (both member and admin roles)
  const activeUsers = await db
    .selectFrom("users")
    .where("isActive", "=", true)
    .select("id")
    .execute();

  if (activeUsers.length === 0) return;

  const title = "Hoạt động mới";
  const message = `Hoạt động mới vừa được đăng: ${activity.title}`;

  // Filter out users who already have this notification
  const usersToNotify: number[] = [];
  for (const user of activeUsers) {
    const isDuplicate = await checkDuplicateNotification(
      user.id,
      activityId,
      "activity",
      "new_activity"
    );
    if (!isDuplicate) {
      usersToNotify.push(user.id);
    }
  }

  if (usersToNotify.length === 0) {
    console.log("No users to notify for new activity - all already notified");
    return;
  }

  console.log(
    `Creating new activity notifications for ${usersToNotify.length} users`
  );

  const notifications = usersToNotify.map((userId) => ({
    userId,
    title,
    message,
    type: "new_activity" as NotificationType,
    link: "/activities",
    relatedId: activityId,
    relatedType: "activity",
    channel: "in_app" as NotificationChannel,
    isRead: false,
    isImportant: false,
    sentByAdmin: adminId,
  }));

  // Bulk insert in chunks
  const chunkSize = 500;
  for (let i = 0; i < notifications.length; i += chunkSize) {
    const chunk = notifications.slice(i, i + chunkSize);
    await db.insertInto("notification").values(chunk).execute();
  }
}

/**
 * Creates notifications for multiple users based on target criteria.
 * Used by admin manual send.
 */
export async function createBulkNotifications(
  params: CreateBulkNotificationParams
): Promise<{ batchId: number; recipientCount: number }> {
  // 1. Determine recipients
  let query = db.selectFrom("users").select("id");

  if (params.targetType === "trusted") {
    query = query.where("isTrustedMember", "=", true);
  } else if (params.targetType === "province" && typeof params.targetFilter === "string") {
    query = query.where("province", "=", params.targetFilter);
  } else if (
    params.targetType === "specific" &&
    Array.isArray(params.targetFilter) &&
    params.targetFilter.length > 0
  ) {
    query = query.where("id", "in", params.targetFilter);
  }
  // 'all' needs no filter

  const recipients = await query.execute();
  const recipientIds = recipients.map((r) => r.id);

  if (recipientIds.length === 0) {
    return { batchId: 0, recipientCount: 0 };
  }

  // 2. Create Notification Batch Record
  const batch = await db
    .insertInto("notificationBatch")
    .values({
      title: params.title,
      message: params.message,
      link: params.link,
      sentByAdmin: params.sentByAdmin,
      targetType: params.targetType,
      targetFilter: JSON.stringify(params.targetFilter),
      recipientCount: recipientIds.length,
    })
    .returning("id")
    .executeTakeFirstOrThrow();

  // 3. Bulk insert notifications
  // Kysely supports bulk insert. We'll do it in chunks if necessary, but for now simple bulk.
  const notifications = recipientIds.map((userId) => ({
    userId,
    title: params.title,
    message: params.message,
    type: params.type,
    link: params.link,
    isImportant: params.isImportant ?? false,
    sentByAdmin: params.sentByAdmin,
    channel: "in_app" as NotificationChannel,
    isRead: false,
    relatedId: batch.id,
    relatedType: "notification_batch",
  }));

  // Insert in chunks of 500 to be safe with query size limits
  const chunkSize = 500;
  for (let i = 0; i < notifications.length; i += chunkSize) {
    const chunk = notifications.slice(i, i + chunkSize);
    await db.insertInto("notification").values(chunk).execute();
  }

  return { batchId: batch.id, recipientCount: recipientIds.length };
}

/**
 * Triggers notifications for activity events.
 */
export async function triggerActivityNotification(
  activityId: number,
  type: "reminder" | "cancelled"
) {
  const activity = await db
    .selectFrom("activity")
    .where("id", "=", activityId)
    .select(["title", "startTime", "location"])
    .executeTakeFirst();

  if (!activity) return;

  // Get all registered users
  const registrations = await db
    .selectFrom("activityRegistration")
    .where("activityId", "=", activityId)
    .select("userId")
    .execute();

  if (registrations.length === 0) return;

  const notificationType: NotificationType =
    type === "cancelled" ? "activity_cancelled" : "activity_reminder";
  
  const title =
    type === "cancelled"
      ? `Hoạt động bị hủy: ${activity.title}`
      : `Nhắc nhở: ${activity.title} sắp diễn ra`;
  
  const message =
    type === "cancelled"
      ? `Rất tiếc, hoạt động "${activity.title}" đã bị hủy. Vui lòng kiểm tra lại lịch trình.`
      : `Hoạt động "${activity.title}" sẽ diễn ra vào ${new Date(
          activity.startTime
        ).toLocaleString("vi-VN")}. Địa điểm: ${activity.location || "Chưa cập nhật"}.`;

  const notifications = registrations.map((reg) => ({
    userId: reg.userId,
    title,
    message,
    type: notificationType,
    link: `/activities/${activityId}`,
    relatedId: activityId,
    relatedType: "activity",
    channel: "in_app" as NotificationChannel,
    isRead: false,
    isImportant: type === "cancelled", // Cancellations are important
  }));

  // Bulk insert
  if (notifications.length > 0) {
     const chunkSize = 500;
    for (let i = 0; i < notifications.length; i += chunkSize) {
      const chunk = notifications.slice(i, i + chunkSize);
      await db.insertInto("notification").values(chunk).execute();
    }
  }
}

/**
 * Triggers notifications for borrow flow events.
 */
export async function triggerBorrowNotification(
  borrowRecordId: number,
  type: "request" | "approved" | "rejected" | "return_reminder" | "confirmed"
) {
  const record = await db
    .selectFrom("borrowRecord")
    .innerJoin("book", "borrowRecord.bookId", "book.id")
    .where("borrowRecord.id", "=", borrowRecordId)
    .select([
      "borrowRecord.borrowerId",
      "book.ownerId",
      "book.title",
      "book.id as bookId",
    ])
    .executeTakeFirst();

  if (!record || !record.ownerId) return;

  let targetUserId: number;
  let title: string;
  let message: string;
  let notifType: NotificationType;
  let link = `/profile/borrows`; // Generic link to borrows page

  switch (type) {
    case "request":
      targetUserId = record.ownerId;
      title = "Yêu cầu mượn sách mới";
      message = `Có người muốn mượn cuốn sách "${record.title}" của bạn.`;
      notifType = "borrow_request";
      break;
    case "approved": {
      targetUserId = record.borrowerId;
      title = "Yêu cầu mượn sách được chấp nhận";
      message = `Yêu cầu mượn cuốn sách "${record.title}" đã được chủ sách chấp nhận. Hãy liên hệ để nhận sách.`;
      notifType = "borrow_approved";

      // Check for duplicate first
      const isDuplicate = await checkDuplicateNotification(
        targetUserId,
        borrowRecordId,
        "borrow_record",
        notifType
      );
      if (isDuplicate) {
        console.log(
          `Skipping duplicate borrow approved notification for record ${borrowRecordId}`
        );
        return;
      }

      // Check user notification settings for email
      const userSettings = await db
        .selectFrom("userNotificationSettings")
        .where("userId", "=", targetUserId)
        .select(["emailEnabled"])
        .executeTakeFirst();

      const inQuietHours = await isInQuietHours(targetUserId);
      const channel: NotificationChannel =
        userSettings?.emailEnabled && !inQuietHours ? "both" : "in_app";

      // Create notification with appropriate channel
      await db
        .insertInto("notification")
        .values({
          userId: targetUserId,
          title,
          message,
          type: notifType,
          link,
          relatedId: borrowRecordId,
          relatedType: "borrow_record",
          isImportant: false,
          channel,
          isRead: false,
        })
        .execute();
      return;
    }
    case "rejected":
      targetUserId = record.borrowerId;
      title = "Yêu cầu mượn sách bị từ chối";
      message = `Rất tiếc, yêu cầu mượn cuốn sách "${record.title}" đã bị từ chối.`;
      notifType = "borrow_rejected";
      break;
    case "return_reminder":
      targetUserId = record.borrowerId;
      title = "Nhắc nhở trả sách";
      message = `Đừng quên trả cuốn sách "${record.title}" đúng hạn nhé.`;
      notifType = "return_reminder";
      break;
    case "confirmed":
      // Usually notify the other party that completion is confirmed?
      // Or notify borrower that owner confirmed return.
      targetUserId = record.borrowerId;
      title = "Xác nhận trả sách thành công";
      message = `Chủ sách đã xác nhận nhận lại cuốn sách "${record.title}". Quá trình mượn sách hoàn tất.`;
      notifType = "return_confirmed";
      break;
    default:
      return;
  }

  // For all other types, use the standard createNotification
  await createNotification({
    userId: targetUserId,
    title,
    message,
    type: notifType,
    link,
    relatedId: borrowRecordId,
    relatedType: "borrow_record",
    isImportant: false,
  });
}