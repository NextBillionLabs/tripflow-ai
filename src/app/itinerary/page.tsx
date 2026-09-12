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
  const [loadingStep, setLoadingStep] = useState(0);

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

  // Animate loading steps
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingStep((s) => (s < 4 ? s + 1 : s));
    }, 3000);
    return () => clearInterval(interval);
  }, [loading]);

  // ─── Loading State ───────────────────────────────────────────────────
  if (loading) {
    const steps = [
      { icon: "route", text: "Analyzing best routes", done: loadingStep > 0 },
      { icon: "train", text: "Finding trains, buses & flights", done: loadingStep > 1 },
      { icon: "hotel", text: "Curating stays & hotels", done: loadingStep > 2 },
      { icon: "restaurant", text: "Discovering local food gems", done: loadingStep > 3 },
      { icon: "partly_cloudy_day", text: "Checking weather forecast", done: false },
    ];

    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-lg" style={{ animation: "fadeSlideUp 0.5s ease-out" }}>
          {/* Progress bar */}
          <div className="relative w-64 h-1.5 bg-slate-100 rounded-full mx-auto mb-10 overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-teal-400 to-teal-600 rounded-full transition-all duration-[3000ms] ease-out"
              style={{ width: `${Math.min((loadingStep + 1) * 20, 90)}%` }}
            />
          </div>

          {/* Animated globe icon */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-teal-100/50 animate-ping" style={{ animationDuration: "2s" }} />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center shadow-lg shadow-teal-200/40">
              <span className="material-symbols-outlined text-teal-600 text-[36px] animate-bounce" style={{ animationDuration: "1.5s" }}>
                travel_explore
              </span>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Crafting your journey...
          </h2>
          <p className="text-sm text-slate-400 mb-8">
            Our AI is building a personalized itinerary just for you
          </p>

          {/* Step cards */}
          <div className="space-y-2.5 max-w-xs mx-auto">
            {steps.map((step, i) => (
              <div
                key={step.text}
                className={`flex items-center gap-3 py-2.5 px-3.5 rounded-xl transition-all duration-500 ${
                  i === loadingStep
                    ? "bg-teal-50 border border-teal-200/60 shadow-sm"
                    : step.done
                    ? "bg-white"
                    : "opacity-40"
                }`}
                style={{
                  animation: i <= loadingStep ? `fadeSlideUp 0.4s ease-out ${i * 0.1}s both` : "none",
                }}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-300 ${
                  step.done ? "bg-emerald-100" : i === loadingStep ? "bg-teal-100" : "bg-slate-100"
                }`}>
                  <span className={`material-symbols-outlined text-[16px] ${
                    step.done ? "text-emerald-600" : i === loadingStep ? "text-teal-600" : "text-slate-400"
                  }`}>{step.done ? "check_circle" : step.icon}</span>
                </div>
                <span className={`text-sm font-medium transition-colors duration-300 ${
                  step.done ? "text-emerald-700" : i === loadingStep ? "text-teal-800" : "text-slate-400"
                }`}>{step.text}</span>
                {i === loadingStep && !step.done && (
                  <div className="ml-auto">
                    <span className="w-4 h-4 rounded-full border-2 border-slate-200 border-t-teal-500 animate-spin block" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── Error State ─────────────────────────────────────────────────────
  if (error) {
    const isImpractical = error.includes("IMPRACTICAL_TRIP");
    const isBusy = error.includes("503") || error.includes("UNAVAILABLE") || error.includes("high demand");
    const isRateLimit = error.includes("429") || error.includes("quota") || error.includes("RESOURCE_EXHAUSTED");
    const isParseError = error.includes("invalid") || error.includes("JSON") || error.includes("parse");
    const isNetwork = error.includes("fetch") || error.includes("network") || error.includes("Failed to fetch");

    // ─── Impractical Trip Error (Special UI) ─────────────────────────
    if (isImpractical) {
      const cleanMessage = error.replace("IMPRACTICAL_TRIP: ", "");
      // Extract the RECOMMENDED minimum days — look for "minimum of X", "at least X day", "X to Y days"
      const minDaysMatch = cleanMessage.match(/(?:minimum\s+(?:duration\s+)?(?:of\s+)?|at\s+least\s+|recommend\s+)(\d+)/i)
        || cleanMessage.match(/(\d+)\s*(?:to\s*\d+)?\s*days?\s+(?:is\s+)?(?:required|needed|recommended|minimum)/i);
      const suggestedDays = minDaysMatch?.[1] || "";

      // Get the original query to modify
      const originalQuery = new URLSearchParams(window.location.search).get("query") || "";

      return (
        <div className="min-h-[75vh] flex flex-col items-center justify-center px-4" style={{ animation: "fadeSlideUp 0.4s ease-out" }}>
          <div className="max-w-lg w-full">
            {/* Animated map pin */}
            <div className="text-center mb-8">
              <div className="relative w-28 h-28 mx-auto mb-6">
                {/* Ripple rings */}
                <div className="absolute inset-0 rounded-full border-2 border-amber-200 animate-ping opacity-20" style={{ animationDuration: "2s" }} />
                <div className="absolute inset-2 rounded-full border-2 border-amber-200 animate-ping opacity-15" style={{ animationDuration: "2s", animationDelay: "0.5s" }} />
                {/* Main icon */}
                <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center shadow-xl shadow-amber-200/30">
                  <span className="material-symbols-outlined text-amber-600 text-[48px]">
                    explore_off
                  </span>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mb-3">
                This trip needs more time
              </h2>

              {/* Info card */}
              <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-4 mb-6 text-left">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-amber-600 text-[20px] mt-0.5 shrink-0">info</span>
                  <p className="text-sm text-amber-900 leading-relaxed">{cleanMessage}</p>
                </div>
              </div>
            </div>

            {/* Action cards */}
            <div className="space-y-3">
              {suggestedDays && (
                <button
                  onClick={() => {
                    // Replace the day count in original query with AI-suggested days
                    let newQuery = originalQuery.replace(/\d+\s*day/i, `${suggestedDays} day`);
                    if (newQuery === originalQuery) {
                      newQuery = originalQuery + ` ${suggestedDays} days`;
                    }
                    window.location.href = `/itinerary?query=${encodeURIComponent(newQuery)}`;
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-teal-50 to-teal-100/50 border border-teal-200 hover:border-teal-300 hover:shadow-lg hover:shadow-teal-100 transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-teal-600/30">
                    <span className="material-symbols-outlined text-white text-[24px]">event</span>
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-bold text-teal-900">Try {suggestedDays}-day trip instead</span>
                    <span className="text-xs text-teal-600 block mt-0.5">✨ AI recommended — enough time for travel + fun</span>
                  </div>
                  <span className="material-symbols-outlined text-teal-500 ml-auto text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
              )}

              <button
                onClick={() => {
                  // Add "by flight" to the query so AI considers flights
                  const flightQuery = originalQuery.includes("flight")
                    ? originalQuery
                    : originalQuery + " prefer flight";
                  window.location.href = `/itinerary?query=${encodeURIComponent(flightQuery)}`;
                }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-200 hover:bg-blue-50/50 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/30">
                  <span className="material-symbols-outlined text-white text-[24px]">flight</span>
                </div>
                <div className="text-left">
                  <span className="text-sm font-bold text-slate-900">Try with flights</span>
                  <span className="text-xs text-slate-500 block mt-0.5">Fly there & back — quicker trip possible</span>
                </div>
                <span className="material-symbols-outlined text-slate-400 ml-auto text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>

              <button
                onClick={() => { window.location.href = "/"; }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-slate-600 text-[24px]">edit</span>
                </div>
                <div className="text-left">
                  <span className="text-sm font-bold text-slate-900">Change destination</span>
                  <span className="text-xs text-slate-500 block mt-0.5">Pick somewhere closer for a short trip</span>
                </div>
                <span className="material-symbols-outlined text-slate-400 ml-auto text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    // ─── Unrealistic Budget Error (Special UI) ─────────────────────────
    const isBudgetError = error.includes("UNREALISTIC_BUDGET");
    if (isBudgetError) {
      const cleanMessage = error.replace("UNREALISTIC_BUDGET: ", "");
      // Extract minimum budget like "minimum ₹3,500" or "₹2,500"
      const minBudgetMatch = cleanMessage.match(/(?:minimum\s+)?₹([\d,]+)/i);
      const minBudget = minBudgetMatch?.[1]?.replace(/,/g, "") || "";
      const originalQuery = new URLSearchParams(window.location.search).get("query") || "";

      return (
        <div className="min-h-[75vh] flex flex-col items-center justify-center px-4" style={{ animation: "fadeSlideUp 0.4s ease-out" }}>
          <div className="max-w-lg w-full">
            <div className="text-center mb-8">
              {/* Animated wallet icon */}
              <div className="relative w-28 h-28 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-2 border-rose-200 animate-ping opacity-20" style={{ animationDuration: "2s" }} />
                <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-rose-50 via-red-50 to-orange-50 flex items-center justify-center shadow-xl shadow-rose-200/30">
                  <span className="material-symbols-outlined text-rose-500 text-[48px]">
                    account_balance_wallet
                  </span>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 mb-3">
                Budget too low for this trip
              </h2>

              {/* Info card */}
              <div className="bg-rose-50 border border-rose-200/60 rounded-2xl p-4 mb-6 text-left">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-rose-500 text-[20px] mt-0.5 shrink-0">info</span>
                  <p className="text-sm text-rose-900 leading-relaxed">{cleanMessage}</p>
                </div>
              </div>
            </div>

            {/* Action cards */}
            <div className="space-y-3">
              {minBudget && (
                <button
                  onClick={() => {
                    // Replace budget in query with minimum realistic budget
                    let newQuery = originalQuery.replace(/(?:budget\s*)?₹?\s*\d+/i, `budget ${minBudget}`);
                    if (newQuery === originalQuery) {
                      newQuery = originalQuery + ` budget ${minBudget}`;
                    }
                    window.location.href = `/itinerary?query=${encodeURIComponent(newQuery)}`;
                  }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-emerald-100/50 border border-emerald-200 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-100 transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-600/30">
                    <span className="material-symbols-outlined text-white text-[24px]">savings</span>
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-bold text-emerald-900">Show cheapest option — ₹{Number(minBudget).toLocaleString("en-IN")}</span>
                    <span className="text-xs text-emerald-600 block mt-0.5">✨ Bare minimum — general class + budget food</span>
                  </div>
                  <span className="material-symbols-outlined text-emerald-500 ml-auto text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
              )}

              <button
                onClick={() => { window.location.href = "/"; }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-slate-600 text-[24px]">edit</span>
                </div>
                <div className="text-left">
                  <span className="text-sm font-bold text-slate-900">Change trip details</span>
                  <span className="text-xs text-slate-500 block mt-0.5">Pick a closer city or increase budget</span>
                </div>
                <span className="material-symbols-outlined text-slate-400 ml-auto text-[20px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    // ─── Generic Error UI ────────────────────────────────────────────
    let title = "Oops! Something went wrong";
    let subtitle = "We couldn't generate your itinerary";
    let icon = "cloud_off";
    let hint = "This usually fixes itself — give it another shot!";
    let gradFrom = "from-red-50";
    let gradTo = "to-rose-100";
    let iconColor = "text-red-500";
    let shadowColor = "shadow-red-200/30";

    if (isBusy) {
      title = "AI is overloaded";
      subtitle = "Too many travelers planning trips at once!";
      icon = "hourglass_top";
      hint = "Wait 30 seconds, then try again";
      gradFrom = "from-amber-50"; gradTo = "to-orange-100";
      iconColor = "text-amber-600"; shadowColor = "shadow-amber-200/30";
    } else if (isRateLimit) {
      title = "Whoa, slow down!";
      subtitle = "We hit the request limit temporarily";
      icon = "speed";
      hint = "Wait a minute and you'll be good";
      gradFrom = "from-amber-50"; gradTo = "to-yellow-100";
      iconColor = "text-amber-500"; shadowColor = "shadow-amber-200/30";
    } else if (isParseError) {
      title = "AI had a hiccup";
      subtitle = "The response came back garbled";
      icon = "psychology_alt";
      hint = "Second attempt usually works perfectly";
      gradFrom = "from-purple-50"; gradTo = "to-indigo-100";
      iconColor = "text-purple-500"; shadowColor = "shadow-purple-200/30";
    } else if (isNetwork) {
      title = "Connection lost";
      subtitle = "Can't reach our servers right now";
      icon = "wifi_off";
      hint = "Check your internet and try again";
      gradFrom = "from-slate-50"; gradTo = "to-slate-100";
      iconColor = "text-slate-500"; shadowColor = "shadow-slate-200/30";
    }

    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-4" style={{ animation: "fadeSlideUp 0.4s ease-out" }}>
        <div className="text-center max-w-md">
          {/* Animated icon bubble */}
          <div className="relative w-28 h-28 mx-auto mb-6">
            <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${gradFrom} ${gradTo} animate-pulse opacity-40`} style={{ animationDuration: "2s" }} />
            <div className={`relative w-28 h-28 rounded-full bg-gradient-to-br ${gradFrom} ${gradTo} flex items-center justify-center shadow-xl ${shadowColor}`}>
              <span className={`material-symbols-outlined ${iconColor} text-[48px]`}>{icon}</span>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-1.5">{title}</h2>
          <p className="text-sm text-slate-500 mb-2">{subtitle}</p>

          {/* Hint pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-xs text-slate-500 mb-8">
            <span className="material-symbols-outlined text-[14px]">lightbulb</span>
            {hint}
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer hover:scale-[1.03]"
            >
              ← Go Back
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white text-sm font-semibold hover:from-teal-700 hover:to-teal-800 transition-all cursor-pointer shadow-lg shadow-teal-600/25 hover:scale-[1.03] hover:shadow-xl hover:shadow-teal-600/30 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
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
