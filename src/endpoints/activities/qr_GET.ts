import { schema, OutputType } from "./qr_GET.schema";
import superjson from "superjson";

export async function handle(request: Request) {
  try {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    
    const input = schema.parse(queryParams);

    // Determine the domain from the request headers or fallback to a relative path if necessary,
    // but QR codes usually need absolute URLs.
    const host = request.headers.get("host") || url.host;
    const protocol = request.headers.get("x-forwarded-proto") || "https"; // Default to https in production
    const domain = `${protocol}://${host}`;

    const checkInUrl = `${domain}/checkin?activityId=${input.activityId}`;

    return new Response(
      superjson.stringify({
        activityId: input.activityId,
        checkInUrl,
      } satisfies OutputType),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      superjson.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}