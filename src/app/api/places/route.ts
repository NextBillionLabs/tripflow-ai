import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Cache to avoid repeated API calls for same place
const cache = new Map<string, string[]>();

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query");
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "10");

  if (!query) return NextResponse.json({ photos: [] });
  if (!API_KEY) return NextResponse.json({ photos: [] });

  const cacheKey = `${query}-${limit}`;
  if (cache.has(cacheKey)) {
    return NextResponse.json({ photos: cache.get(cacheKey) });
  }

  try {
    // Step 1: Find the place
    const searchRes = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
        query + " India tourist attraction"
      )}&key=${API_KEY}`
    );
    const searchData = await searchRes.json();
    const placeId = searchData.results?.[0]?.place_id;
    if (!placeId) return NextResponse.json({ photos: [] });

    // Step 2: Get photo references from place details
    const detailsRes = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos,name&key=${API_KEY}`
    );
    const detailsData = await detailsRes.json();
    const rawPhotos: Array<{ photo_reference: string }> =
      detailsData.result?.photos || [];

    // Step 3: Build photo URLs (limit to requested count)
    const photoUrls = rawPhotos.slice(0, Math.min(limit, 20)).map(
      (p) =>
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${p.photo_reference}&key=${API_KEY}`
    );

    cache.set(cacheKey, photoUrls);
    return NextResponse.json({ photos: photoUrls });
  } catch {
    return NextResponse.json({ photos: [] });
  }
}
