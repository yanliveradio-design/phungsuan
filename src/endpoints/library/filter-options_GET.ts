import { schema, OutputType } from "./filter-options_GET.schema";
import superjson from 'superjson';
import { db } from "../../helpers/db";

export async function handle(request: Request) {
  try {
    // No input validation needed as schema is empty object, but we call it for consistency
    schema.parse({});

    // Base filter for books that are visible to members
    const baseQuery = db
      .selectFrom('book')
      .where('isApproved', '=', true)
      .where((eb) => eb.or([
        eb('isHidden', '=', false),
        eb('isHidden', 'is', null)
      ]));

    // 1. Get unique categories
    const categoriesResult = await baseQuery
      .select('category')
      .distinct()
      .where('category', 'is not', null)
      .orderBy('category', 'asc')
      .execute();
    
    const categories = categoriesResult
      .map(r => r.category)
      .filter((c): c is string => c !== null);

    // 2. Get unique province and district pairs
    const locationPairs = await baseQuery
      .select(['province', 'district'])
      .distinct()
      .where('province', 'is not', null)
      .where('district', 'is not', null)
      .orderBy('province', 'asc')
      .orderBy('district', 'asc')
      .execute();

    // 3. Process locations into provinces list and districtsByProvince mapping
    const provincesSet = new Set<string>();
    const districtsMap = new Map<string, Set<string>>();

    locationPairs.forEach(pair => {
      if (pair.province && pair.district) {
        provincesSet.add(pair.province);
        
        if (!districtsMap.has(pair.province)) {
          districtsMap.set(pair.province, new Set());
        }
        districtsMap.get(pair.province)!.add(pair.district);
      }
    });

    const provinces = Array.from(provincesSet).sort();
    const districtsByProvince = Array.from(districtsMap.entries()).map(([province, districts]) => ({
      province,
      districts: Array.from(districts).sort()
    })).sort((a, b) => a.province.localeCompare(b.province));

    return new Response(superjson.stringify({
      categories,
      provinces,
      districtsByProvince
    } satisfies OutputType));

  } catch (error) {
    console.error("Error fetching filter options:", error);
    if (error instanceof Error) {
      return new Response(superjson.stringify({ error: error.message }), { status: 400 });
    }
    return new Response(superjson.stringify({ error: "Unknown error occurred" }), { status: 500 });
  }
}