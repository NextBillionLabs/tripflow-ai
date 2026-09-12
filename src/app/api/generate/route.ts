import { NextRequest, NextResponse } from "next/server";
import { generateItinerary } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, from, to, travelers, days } = body;

    if (!query && !from && !to) {
      return NextResponse.json(
        { error: "Provide 'query' or 'from'/'to' fields" },
        { status: 400 }
      );
    }

    const rawResult = await generateItinerary({ query, from, to, travelers, days });

    // Strip markdown code fences if Gemini wraps the JSON
    let cleaned = rawResult.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    }

    // Parse and validate the JSON
    const itinerary = JSON.parse(cleaned);

    // If Gemini determined the trip is impractical, throw the error back to frontend
    if (itinerary.error) {
      return NextResponse.json({ error: itinerary.error }, { status: 400 });
    }

    return NextResponse.json({ itinerary });
  } catch (error: unknown) {
    console.error("Generate API error:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "AI returned invalid data. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate itinerary",
      },
      { status: 500 }
    );
  }
}
