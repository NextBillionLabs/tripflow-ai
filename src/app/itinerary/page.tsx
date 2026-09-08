"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import TripHeader from "@/components/itinerary/TripHeader";
import JourneyTimeline from "@/components/itinerary/JourneyTimeline";
import TripSidebar from "@/components/itinerary/TripSidebar";
import type { TripData } from "@/types/itinerary";

function ItineraryContent() {
  const searchParams = useSearchParams();
  const [tripData, setTripData] = useState<TripData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const query = searchParams.get("query");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const travelers = searchParams.get("travelers");
    const days = searchParams.get("days");

    if (!query && !from) {
      setError("No search query provided. Go back to homepage and search for a trip.");
      setLoading(false);
      return;
    }

    const fetchItinerary = async () => {
      try {
        setLoading(true);
        setError(null);

        const body = query
          ? { query }
          : { from, to, travelers: Number(travelers) || 2, days: Number(days) || 2 };

        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to generate itinerary");
        }

        const data = await res.json();
        setTripData(data.itinerary);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchItinerary();
  }, [searchParams]);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-teal-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-teal-600 text-[32px] animate-spin">
              progress_activity
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            TripFlow AI is planning your trip...
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Finding the best routes, hotels, restaurants & activities
          </p>
          <div className="space-y-2.5 text-left max-w-xs mx-auto">
            {[
              "Analyzing route options & transport...",
              "Finding verified hotels & stays...",
              "Discovering local food & attractions...",
              "Checking weather & road conditions...",
            ].map((step, i) => (
              <div
                key={step}
                className="flex items-center gap-2.5 text-xs text-slate-500 animate-pulse"
                style={{ animationDelay: `${i * 0.3}s` }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    // Parse error for friendly message
    let title = "Something went wrong";
    let message = "We couldn't generate your itinerary. Please try again.";
    let icon = "error";

    if (error.includes("503") || error.includes("UNAVAILABLE") || error.includes("high demand")) {
      title = "Our AI is busy right now";
      message = "Too many people are planning trips! Please wait 30 seconds and try again.";
      icon = "hourglass_top";
    } else if (error.includes("429") || error.includes("quota") || error.includes("RESOURCE_EXHAUSTED")) {
      title = "Rate limit reached";
      message = "We've hit the AI request limit. Please wait a minute and try again.";
      icon = "speed";
    } else if (error.includes("invalid") || error.includes("JSON") || error.includes("parse")) {
      title = "AI generated an unexpected response";
      message = "The trip plan came back in a weird format. Let's try again — it usually works on the second attempt.";
      icon = "sync_problem";
    } else if (error.includes("fetch") || error.includes("network") || error.includes("Failed to fetch")) {
      title = "Network connection issue";
      message = "Check your internet connection and try again.";
      icon = "wifi_off";
    }

    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-red-500 text-[32px]">{icon}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">{title}</h2>
          <p className="text-sm text-slate-500 mb-6">{message}</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="px-5 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              ← Go Back
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-teal-700 transition-colors cursor-pointer"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!tripData) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8">
      <TripHeader trip={tripData.trip} weatherAlert={tripData.weatherAlert} />
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8">
          <JourneyTimeline days={tripData.days} />
        </div>
        <div className="lg:col-span-4">
          <TripSidebar
            budget={tripData.budget}
            from={tripData.trip.from}
            to={tripData.trip.to}
          />
        </div>
      </div>
    </div>
  );
}

export default function ItineraryPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 bg-slate-50/50 min-h-screen">
        <Suspense>
          <ItineraryContent />
        </Suspense>
      </main>
    </>
  );
}
