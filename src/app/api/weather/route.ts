import { NextRequest, NextResponse } from "next/server";
import { getCurrentWeather, getForecast, checkDisruption } from "@/lib/weather";

export async function GET(request: NextRequest) {
  const city = request.nextUrl.searchParams.get("city") ?? "Saputara";

  try {
    const [weather, forecast] = await Promise.all([
      getCurrentWeather(city),
      getForecast(city),
    ]);

    const disruption = checkDisruption(weather);

    return NextResponse.json({
      weather,
      forecast: forecast.slice(0, 8), // Next 24 hours
      disruption,
    });
  } catch (error: unknown) {
    console.error("Weather API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch weather" },
      { status: 500 }
    );
  }
}
