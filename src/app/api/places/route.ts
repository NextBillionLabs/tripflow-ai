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
    // Clean the query — remove generic words that confuse Google Places
    const cleanQuery = query
      .replace(/\b(area|zone|check.?in|arrival|departure|hotel|stay|visit|explore)\b/gi, "")
      .replace(/&/g, " ")
      .trim();

    // Step 1: Try exact place name first (no suffix)
    let searchRes = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
        cleanQuery
      )}&key=${API_KEY}`
    );
    let searchData = await searchRes.json();
    let placeId = searchData.results?.[0]?.place_id;

    // Step 2: If no results, try with "India" suffix
    if (!placeId) {
      searchRes = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
          cleanQuery + " India"
        )}&key=${API_KEY}`
      );
      searchData = await searchRes.json();
      placeId = searchData.results?.[0]?.place_id;
    }

    if (!placeId) return NextResponse.json({ photos: [] });

    // Step 3: Get photo references from place details
    const detailsRes = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos,name&key=${API_KEY}`
    );
    const detailsData = await detailsRes.json();
    const rawPhotos: Array<{ photo_reference: string }> =
      detailsData.result?.photos || [];

    // Step 4: Build photo URLs (limit to requested count)
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
