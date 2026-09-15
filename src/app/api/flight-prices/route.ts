import { NextRequest, NextResponse } from "next/server";

const TOKEN = process.env.TRAVELPAYOUTS_API_TOKEN || "2f65b4929b605142f30844ee8b6f3372";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const origin = searchParams.get("from") || "";
  const destination = searchParams.get("to") || "";
  const date = searchParams.get("date") || ""; // YYYY-MM-DD

  if (!origin || !destination) {
    return NextResponse.json({ error: "Missing from/to" }, { status: 400 });
  }

  // Extract YYYY-MM for the month param
  const month = date ? date.slice(0, 7) : new Date().toISOString().slice(0, 7);

  try {
    // Travelpayouts cheapest prices API
    const url = new URL("https://api.travelpayouts.com/v1/prices/cheap");
    url.searchParams.set("origin", origin);
    url.searchParams.set("destination", destination);
    url.searchParams.set("depart_date", month);
    url.searchParams.set("return_date", "");
    url.searchParams.set("currency", "inr");
    url.searchParams.set("token", TOKEN);

    const res = await fetch(url.toString(), {
      next: { revalidate: 3600 }, // cache 1 hour
    });

    if (!res.ok) throw new Error(`Travelpayouts API error: ${res.status}`);

    const json = await res.json();

    if (!json.success || !json.data) {
      return NextResponse.json({ flights: [] });
    }

    // Transform into array sorted by price
    const flights = Object.entries(json.data as Record<string, {
      price: number;
      airline: string;
      flight_number: number;
      departure_at: string;
      expires_at: string;
    }>)
      .map(([airline, d]) => ({
        airline,
        price: d.price,
        flight_number: d.flight_number,
        departure_at: d.departure_at,
      }))
      .sort((a, b) => a.price - b.price)
      .slice(0, 5); // top 5 cheapest

    return NextResponse.json({ flights, origin, destination, month });
  } catch (err) {
    console.error("flight-prices error:", err);
    return NextResponse.json({ flights: [], error: String(err) });
  }
}
