import { GoogleGenAI } from "@google/genai";

// Load all available Gemini API keys
const API_KEYS: string[] = [];
for (let i = 1; i <= 10; i++) {
  const key = process.env[`GEMINI_API_KEY_${i}`];
  if (key) API_KEYS.push(key);
}

if (API_KEYS.length === 0) {
  console.warn("No Gemini API keys found. Add GEMINI_API_KEY_1, GEMINI_API_KEY_2, etc. to environment variables.");
}

// Round-robin counter for load balancing
let currentKeyIndex = 0;

function getNextKey(): string {
  const key = API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  return key;
}

function createClient(): GoogleGenAI {
  return new GoogleGenAI({ apiKey: getNextKey() });
}

/**
 * Send a prompt to Gemini with automatic key rotation and failover.
 */
export async function generateWithGemini(
  prompt: string,
  options?: {
    model?: string;
    systemInstruction?: string;
    temperature?: number;
    maxOutputTokens?: number;
  }
): Promise<string> {
  if (API_KEYS.length === 0) {
    throw new Error("No Gemini API keys configured. Add GEMINI_API_KEY_1 etc. to environment variables.");
  }
  const model = options?.model ?? "gemini-2.5-flash";
  const maxRetries = API_KEYS.length;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const client = createClient();

      const response = await client.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: options?.systemInstruction,
          temperature: options?.temperature ?? 0.7,
          maxOutputTokens: options?.maxOutputTokens ?? 8192,
        },
      });

      return response.text ?? "";
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      const isRetryable =
        msg.includes("429") ||
        msg.includes("503") ||
        msg.includes("RESOURCE_EXHAUSTED") ||
        msg.includes("UNAVAILABLE") ||
        msg.includes("quota") ||
        msg.includes("overloaded") ||
        msg.includes("high demand") ||
        msg.includes("internal") ||
        msg.includes("INTERNAL");

      if (isRetryable && attempt < maxRetries - 1) {
        console.warn(`Gemini key ${attempt + 1}/${maxRetries} failed (${msg.slice(0, 80)}), rotating to next key...`);
        // Small delay before retrying to avoid hammering
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }
      throw error;
    }
  }
  throw new Error("All Gemini API keys exhausted. Try again later.");
}

const ITINERARY_SYSTEM_PROMPT = `You are TripFlow AI, an intelligent Indian travel planning assistant.

Given a user's trip request, generate a COMPLETE day-by-day itinerary in the EXACT JSON format below.
Include REAL Indian locations, restaurants, transport options with realistic prices in INR.

RESPOND WITH ONLY VALID JSON. No markdown, no explanation, no backticks.

JSON Format:
{
  "trip": {
    "title": "City A → City B → City A",
    "from": "Origin City",
    "to": "Destination City",
    "duration": "2D/1N",
    "totalBudget": 8450,
    "travelers": 2,
    "dates": "Day range like Fri 02 - Sat 03 Oct"
  },
  "days": [
    {
      "day": 1,
      "date": "Friday, 02 Oct",
      "segments": [
        {
          "type": "departure",
          "time": "2:00 PM",
          "title": "City Name Railway Station",
          "description": "Brief description of the departure point",
          "transport": {
            "mode": "train",
            "name": "Train Name/Number",
            "departure": "2:00 PM",
            "arrival": "5:00 PM",
            "duration": "3h",
            "price": 90,
            "details": "Platform X, Coach Y"
          },
          "alternatives": [
            { "mode": "bus", "name": "GSRTC Express", "price": 140, "duration": "3h 45m" },
            { "mode": "cab", "name": "Outstation Cab", "price": 1850, "duration": "2h 30m" }
          ]
        },
        {
          "type": "transfer",
          "time": "5:00 PM",
          "title": "Junction/Transfer Point Name",
          "description": "Transfer details",
          "bufferMinutes": 120,
          "transport": {
            "mode": "train",
            "name": "Connecting Train Name",
            "departure": "7:00 PM",
            "arrival": "9:00 PM",
            "duration": "2h",
            "price": 60,
            "details": "Heritage rail or bus connection"
          }
        },
        {
          "type": "stay",
          "time": "9:00 PM",
          "title": "Destination Name",
          "description": "Check-in at hotel",
          "hotel": {
            "name": "Hotel/Resort Name",
            "price": 3200,
            "rating": 4.5,
            "type": "Cottage/Room type",
            "distance": "1.2 km from station"
          }
        }
      ]
    },
    {
      "day": 2,
      "date": "Saturday, 03 Oct",
      "segments": [
        {
          "type": "activity",
          "time": "6:00 AM",
          "title": "Tourist Attraction Name",
          "description": "What to see/do, walking time, best time to visit"
        },
        {
          "type": "food",
          "time": "8:00 AM",
          "title": "Breakfast",
          "foodOptions": [
            { "name": "Restaurant Name", "cuisine": "Local dishes", "price": 120, "rating": 4.6 },
            { "name": "Cafe Name", "cuisine": "Coffee and snacks", "price": 180, "rating": 4.3 }
          ]
        },
        {
          "type": "activity",
          "time": "9:30 AM",
          "title": "Another Tourist Spot",
          "description": "Details about the attraction"
        },
        {
          "type": "food",
          "time": "1:00 PM",
          "title": "Lunch",
          "foodOptions": [
            { "name": "Restaurant", "cuisine": "Thali / local food", "price": 200, "rating": 4.4 }
          ]
        },
        {
          "type": "return",
          "time": "3:00 PM",
          "title": "Return Journey",
          "description": "Return trip details",
          "milestones": [
            { "time": "3:00 PM", "title": "Depart destination", "detail": "Transport mode and details" },
            { "time": "4:30 PM", "title": "Tea/Snack Stop", "detail": "Location, 15 min break" },
            { "time": "7:00 PM", "title": "Arrive home city", "detail": "Trip complete, total distance" }
          ]
        }
      ]
    }
  ],
  "budget": {
    "accommodation": 3200,
    "transport": 2850,
    "food": 1600,
    "activities": 0,
    "contingency": 800,
    "total": 8450
  },
  "weatherAlert": "Rain 60% in monsoon season" 
}

IMPORTANT RULES:
- Use REAL Indian city names, train numbers, bus services (GSRTC, MSRTC, RSRTC etc.)
- Use REAL restaurant/dhaba names when possible, or realistic-sounding ones
- Prices must be realistic for Indian travel (trains ₹50-500, buses ₹100-500, hotels ₹1000-5000)
- Include local food specialties of the region
- Include 2-3 tourist attractions per day
- Include at least 2 food options per meal (breakfast, lunch, dinner)
- Include transfer segments if the route has junctions
- The return segment must have detailed milestones
- Budget must add up correctly
- ONLY return valid JSON, nothing else`;

/**
 * Generate a trip itinerary from user input.
 */
export async function generateItinerary(input: {
  query?: string;
  from?: string;
  to?: string;
  travelers?: number;
  days?: number;
}): Promise<string> {
  let prompt: string;

  if (input.query) {
    prompt = input.query;
  } else {
    prompt = `Plan a trip from ${input.from} to ${input.to} for ${input.travelers || 2} travelers, ${input.days || 2} days ${(input.days || 2) - 1} nights. Include the best transport options, hotels, restaurants, and tourist attractions.`;
  }

  return generateWithGemini(prompt, {
    systemInstruction: ITINERARY_SYSTEM_PROMPT,
    temperature: 0.7,
    maxOutputTokens: 8192,
  });
}

export { API_KEYS };
