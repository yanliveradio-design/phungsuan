import "./loadEnv";
import { Hono } from "hono";
import { serveStatic } from "@hono/node-server/serve-static";
import { serve } from "@hono/node-server";

const app = new Hono();

/* =======================
   Helper load endpoint
======================= */
async function callEndpoint(c: any, path: string) {
  try {
    const { handle } = await import(path);
    const response = await handle(c.req.raw);
    if (!(response instanceof Response)) {
      return c.text("Invalid response format", 500);
    }
    return response;
  } catch (e: any) {
    console.error(e);
    return c.text("Error loading endpoint code: " + e.message, 500);
  }
}

/* =======================
   API ROUTES
======================= */

app.get("_api/books/list", c => callEndpoint(c, "./endpoints/books/list_GET"));
app.get("_api/stats/home", c => callEndpoint(c, "./endpoints/stats/home_GET"));
app.get("_api/profile/get", c => callEndpoint(c, "./endpoints/profile/get_GET"));

app.post("_api/auth/logout", c => callEndpoint(c, "./endpoints/auth/logout_POST"));
app.get("_api/auth/session", c => callEndpoint(c, "./endpoints/auth/session_GET"));
app.get("_api/auth/oauth_authorize", c => callEndpoint(c, "./endpoints/auth/oauth_authorize_GET"));
app.get("_api/auth/oauth_callback", c => callEndpoint(c, "./endpoints/auth/oauth_callback_GET"));
app.post("_api/auth/establish_session", c => callEndpoint(c, "./endpoints/auth/establish_session_POST"));
app.post("_api/auth/login_with_password", c => callEndpoint(c, "./endpoints/auth/login_with_password_POST"));
app.post("_api/auth/register_with_password", c => callEndpoint(c, "./endpoints/auth/register_with_password_POST"));

app.get("_api/branding/get", c => callEndpoint(c, "./endpoints/branding/get_GET"));
app.get("_api/theme/active", c => callEndpoint(c, "./endpoints/theme/active_GET"));

app.get("_api/library/books", c => callEndpoint(c, "./endpoints/library/books_GET"));
app.get("_api/library/book-detail", c => callEndpoint(c, "./endpoints/library/book-detail_GET"));
app.get("_api/library/my-borrows", c => callEndpoint(c, "./endpoints/library/my-borrows_GET"));
app.post("_api/library/borrow-request", c => callEndpoint(c, "./endpoints/library/borrow-request_POST"));
app.post("_api/library/borrow-action", c => callEndpoint(c, "./endpoints/library/borrow-action_POST"));
app.post("_api/library/report-book", c => callEndpoint(c, "./endpoints/library/report-book_POST"));

app.get("_api/member/titles", c => callEndpoint(c, "./endpoints/member/titles_GET"));
app.get("_api/member/journey", c => callEndpoint(c, "./endpoints/member/journey_GET"));
app.get("_api/member/book/my-submissions", c => callEndpoint(c, "./endpoints/member/book/my-submissions_GET"));
app.post("_api/member/book/submit", c => callEndpoint(c, "./endpoints/member/book/submit_POST"));

app.get("_api/activities/list", c => callEndpoint(c, "./endpoints/activities/list_GET"));
app.get("_api/activities/qr", c => callEndpoint(c, "./endpoints/activities/qr_GET"));
app.get("_api/activities/member", c => callEndpoint(c, "./endpoints/activities/member_GET"));
app.post("_api/activities/register", c => callEndpoint(c, "./endpoints/activities/register_POST"));
app.post("_api/activities/checkin", c => callEndpoint(c, "./endpoints/activities/checkin_POST"));
app.post("_api/activities/feedback", c => callEndpoint(c, "./endpoints/activities/feedback_POST"));

app.get("_api/feedback/topics", c => callEndpoint(c, "./endpoints/feedback/topics_GET"));
app.get("_api/feedback/published", c => callEndpoint(c, "./endpoints/feedback/published_GET"));

app.get("_api/notifications/list", c => callEndpoint(c, "./endpoints/notifications/list_GET"));
app.get("_api/notifications/settings", c => callEndpoint(c, "./endpoints/notifications/settings_GET"));
app.post("_api/notifications/settings", c => callEndpoint(c, "./endpoints/notifications/settings_POST"));
app.post("_api/notifications/mark-read", c => callEndpoint(c, "./endpoints/notifications/mark-read_POST"));
app.post("_api/notifications/delete-all", c => callEndpoint(c, "./endpoints/notifications/delete-all_POST"));

/* =======================
   ADMIN
======================= */

app.get("_api/admin/books/list", c => callEndpoint(c, "./endpoints/admin/books/list_GET"));
app.get("_api/admin/books/all-ids", c => callEndpoint(c, "./endpoints/admin/books/all-ids_GET"));
app.post("_api/admin/books/import", c => callEndpoint(c, "./endpoints/admin/books/import_POST"));
app.post("_api/admin/books/batch-update", c => callEndpoint(c, "./endpoints/admin/books/batch-update_POST"));
app.post("_api/admin/books/update-cover", c => callEndpoint(c, "./endpoints/admin/books/update-cover_POST"));

app.get("_api/admin/users/list", c => callEndpoint(c, "./endpoints/admin/users/list_GET"));
app.post("_api/admin/users/update-role", c => callEndpoint(c, "./endpoints/admin/users/update-role_POST"));

app.get("_api/admin/members/list", c => callEndpoint(c, "./endpoints/admin/members/list_GET"));
app.get("_api/admin/members/history", c => callEndpoint(c, "./endpoints/admin/members/history_GET"));
app.post("_api/admin/members/lock", c => callEndpoint(c, "./endpoints/admin/members/lock_POST"));
app.post("_api/admin/members/unlock", c => callEndpoint(c, "./endpoints/admin/members/unlock_POST"));
app.post("_api/admin/members/update-trusted", c => callEndpoint(c, "./endpoints/admin/members/update-trusted_POST"));
app.post("_api/admin/members/update-joined-date", c => callEndpoint(c, "./endpoints/admin/members/update-joined-date_POST"));

app.get("_api/admin/titles/list", c => callEndpoint(c, "./endpoints/admin/titles/list_GET"));
app.post("_api/admin/titles/create", c => callEndpoint(c, "./endpoints/admin/titles/create_POST"));
app.post("_api/admin/titles/update", c => callEndpoint(c, "./endpoints/admin/titles/update_POST"));
app.post("_api/admin/titles/delete", c => callEndpoint(c, "./endpoints/admin/titles/delete_POST"));
app.post("_api/admin/titles/assign", c => callEndpoint(c, "./endpoints/admin/titles/assign_POST"));
app.post("_api/admin/titles/unassign", c => callEndpoint(c, "./endpoints/admin/titles/unassign_POST"));

app.get("_api/admin/activities/list", c => callEndpoint(c, "./endpoints/admin/activities/list_GET"));
app.post("_api/admin/activities/create", c => callEndpoint(c, "./endpoints/admin/activities/create_POST"));
app.post("_api/admin/activities/update", c => callEndpoint(c, "./endpoints/admin/activities/update_POST"));
app.post("_api/admin/activities/close", c => callEndpoint(c, "./endpoints/admin/activities/close_POST"));
app.post("_api/admin/activities/bulk-delete", c => callEndpoint(c, "./endpoints/admin/activities/bulk-delete_POST"));
app.get("_api/admin/activities/registrations", c => callEndpoint(c, "./endpoints/admin/activities/registrations_GET"));
app.post("_api/admin/activities/confirm-registrations", c => callEndpoint(c, "./endpoints/admin/activities/confirm-registrations_POST"));
app.post("_api/admin/activities/toggle-checkin", c => callEndpoint(c, "./endpoints/admin/activities/toggle-checkin_POST"));

app.get("_api/admin/feedback/list", c => callEndpoint(c, "./endpoints/admin/feedback/list_GET"));
app.post("_api/admin/feedback/flag", c => callEndpoint(c, "./endpoints/admin/feedback/flag_POST"));
app.post("_api/admin/feedback/retag", c => callEndpoint(c, "./endpoints/admin/feedback/retag_POST"));
app.post("_api/admin/feedback/publish", c => callEndpoint(c, "./endpoints/admin/feedback/publish_POST"));

app.get("_api/admin/settings/get", c => callEndpoint(c, "./endpoints/admin/settings/get_GET"));
app.post("_api/admin/settings/update", c => callEndpoint(c, "./endpoints/admin/settings/update_POST"));

app.get("_api/admin/branding/get", c => callEndpoint(c, "./endpoints/admin/branding/get_GET"));
app.post("_api/admin/branding/update", c => callEndpoint(c, "./endpoints/admin/branding/update_POST"));

app.get("_api/admin/notifications/history", c => callEndpoint(c, "./endpoints/admin/notifications/history_GET"));
app.post("_api/admin/notifications/send", c => callEndpoint(c, "./endpoints/admin/notifications/send_POST"));
app.post("_api/admin/notifications/preview", c => callEndpoint(c, "./endpoints/admin/notifications/preview_POST"));

/* =======================
   STATIC + SPA
======================= */

app.use("/*", serveStatic({ root: "./dist" }));
app.get("*", (c) => serveStatic({ path: "./dist/index.html" })(c));

serve({ fetch: app.fetch, port: 3333 });
console.log("🚀 Server running at http://localhost:3333");
