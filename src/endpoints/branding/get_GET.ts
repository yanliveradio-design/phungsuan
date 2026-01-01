import { schema, OutputType, BrandingData, PageCovers } from "./get_GET.schema";
import { db } from "../../helpers/db";
import superjson from "superjson";

const DEFAULT_BRANDING: BrandingData = {
  logoType: "emoji",
  logoValue: "📚",
  appName: "Community Book Sharing",
  appDescription: "A platform for sharing books within the community.",
  contactEmail: null,
  contactPhone: null,
  pageCovers: {},
};

export async function handle(request: Request) {
  try {
    // We don't need to parse input as it's empty, but good practice to validate if schema existed
    // const json = superjson.parse(await request.text());
    // schema.parse(json);

    const brandingRecord = await db
      .selectFrom("appBranding")
      .selectAll()
      .limit(1)
      .executeTakeFirst();

    let branding: BrandingData;

    if (brandingRecord) {
      branding = {
        logoType: brandingRecord.logoType,
        logoValue: brandingRecord.logoValue,
        appName: brandingRecord.appName,
        appDescription: brandingRecord.appDescription,
        contactEmail: brandingRecord.contactEmail,
        contactPhone: brandingRecord.contactPhone,
        pageCovers: (typeof brandingRecord.pageCovers === 'string' 
          ? JSON.parse(brandingRecord.pageCovers) 
          : brandingRecord.pageCovers as PageCovers) || {},
      };
    } else {
      branding = DEFAULT_BRANDING;
    }

    return new Response(
      superjson.stringify({ branding } satisfies OutputType)
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