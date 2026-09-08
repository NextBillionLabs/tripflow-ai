"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CityPicker from "@/components/ui/CityPicker";
import DatePicker from "@/components/ui/DatePicker";

const quickPrompts = [
  "Surat → Saputara · 2D/1N · 2 People",
  "Ahmedabad → Udaipur · Heritage Weekend",
  "Mumbai → Lonavala · Monsoons & Expressway",
];

const trendingCorridors = [
  { label: "Surat → Saputara", from: "Surat", to: "Saputara" },
  { label: "Ahmedabad → Udaipur", from: "Ahmedabad", to: "Udaipur" },
  { label: "Mumbai → Lonavala", from: "Mumbai", to: "Lonavala" },
];

const trustBadges = [
  {
    icon: "verified_user",
    iconColor: "text-teal-300",
    title: "Zero Reschedule Fee",
    subtitle: "Automatic rain & fog hold",
  },
  {
    icon: "local_gas_station",
    iconColor: "text-amber-300",
    title: "Fuel & Toll Calibrated",
    subtitle: "Exact FASTag breakdowns",
  },
  {
    icon: "storefront",
    iconColor: "text-emerald-300",
    title: "Verified Highway Stalls",
    subtitle: "Hygienic halts every 45 km",
  },
  {
    icon: "chat",
    iconColor: "text-teal-200",
    title: "Live WhatsApp Sentinel",
    subtitle: "Route advisories in real-time",
  },
];

export default function HeroSection() {
  const router = useRouter();
  const [nlpQuery, setNlpQuery] = useState("");
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [duration, setDuration] = useState("2");
  const [travelers, setTravelers] = useState(2);
  const [showTravelerPicker, setShowTravelerPicker] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [formError, setFormError] = useState("");

  const handleAIPlan = () => {
    if (!nlpQuery.trim()) {
      setFormError("Please describe your trip first");
      return;
    }
    setFormError("");
    setIsSearching(true);
    const params = new URLSearchParams({ query: nlpQuery });
    router.push(`/itinerary?${params.toString()}`);
  };

  const handleStructuredSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!fromCity.trim() || !toCity.trim()) {
      setFormError("Please enter both From and To cities");
      return;
    }
    if (fromCity.trim().toLowerCase() === toCity.trim().toLowerCase()) {
      setFormError("From and To cities cannot be the same");
      return;
    }

    setIsSearching(true);
    const params = new URLSearchParams({
      from: fromCity,
      to: toCity,
      travelers: String(travelers),
      days: duration,
    });
    router.push(`/itinerary?${params.toString()}`);
  };

  const handleTrendingClick = (from: string, to: string) => {
    setFromCity(from);
    setToCity(to);
  };

  return (
    <section className="relative min-h-[85vh] sm:min-h-[90vh] pt-16 pb-10 sm:pb-16 flex flex-col justify-between overflow-hidden bg-slate-950">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          alt="Scenic highway through Western Ghats"
          className="w-full h-full object-cover object-center brightness-[0.75]"
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&q=80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-950/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 pt-16 pb-8 w-full">
        {/* Headline */}
        <div className="text-center max-w-2xl mx-auto mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-semibold uppercase tracking-wider mb-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Western India Verified Highway Network</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
            Book Adaptive Road Trips & Outstation Cabs
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-200 font-normal">
            Real-time ghat weather sync, toll passes, curated stays & zero-stress
            backup plans.
          </p>
        </div>

        {/* Search Card */}
        <div className="max-w-5xl mx-auto bg-white rounded-3xl p-4 sm:p-6 shadow-xl border border-slate-200">
          {/* Mode Toggle Row */}
          <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 mb-4 gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <button
                type="button"
                className="px-3.5 py-1.5 rounded-full bg-slate-900 text-white flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">directions_car</span>
                <span>Self-Drive / Car</span>
              </button>
              <button
                type="button"
                className="px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">local_taxi</span>
                <span>Outstation Cab</span>
              </button>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/60 text-teal-800 text-xs font-semibold">
                <span className="material-symbols-outlined text-[15px] text-teal-600">
                  auto_awesome
                </span>
                <span>AI Smart Mode Active</span>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 text-xs font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>NH-56 & NH-48 Tolls Live</span>
            </div>
          </div>

          {/* AI NLP Input Area */}
          <div className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-teal-50/70 via-slate-50 to-emerald-50/50 border border-teal-200/60">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800">
                <span className="material-symbols-outlined text-[16px] text-teal-600">
                  psychology
                </span>
                <span>✨ Describe your trip in plain words</span>
                <span className="text-[10px] text-teal-600 font-normal hidden sm:inline">
                  (AI generates your route, ghat forecast & passes instantly)
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Powered by TripFlow AI</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 items-center">
              <div className="relative w-full">
                <input
                  type="text"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-600 shadow-xs"
                  placeholder="E.g., Surat to Saputara for 2 people, 3 days 2 nights, scenic ghat drive under ₹10k"
                  value={nlpQuery}
                  onChange={(e) => setNlpQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAIPlan()}
                />
                <div className="absolute right-2.5 top-2.5 hidden sm:flex items-center gap-1 text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-mono">
                  Natural Language
                </div>
              </div>
              <button
                type="button"
                onClick={handleAIPlan}
                disabled={isSearching}
                className="w-full sm:w-auto shrink-0 bg-slate-900 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {isSearching ? (
                  <>
                    <span className="material-symbols-outlined text-[16px] animate-spin">
                      progress_activity
                    </span>
                    <span>Planning...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px] text-amber-300">
                      auto_awesome
                    </span>
                    <span>Plan with AI</span>
                  </>
                )}
              </button>
            </div>
            {/* Quick Prompts */}
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="text-slate-400 font-medium">Quick prompts:</span>
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:border-teal-600 text-slate-600 hover:text-teal-800 transition-colors cursor-pointer text-left"
                  onClick={() => setNlpQuery(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center my-3.5">
            <div className="flex-grow border-t border-slate-200" />
            <span className="flex-shrink mx-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-white px-2">
              or customize structured trip details
            </span>
            <div className="flex-grow border-t border-slate-200" />
          </div>

          {/* Error Message */}
          {formError && (
            <div className="mb-3 px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-700 font-medium">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {formError}
            </div>
          )}

          {/* Structured Form */}
          <form
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5"
            onSubmit={handleStructuredSearch}
          >
            {/* From City */}
            <CityPicker
              value={fromCity}
              onChange={setFromCity}
              label="From"
              placeholder="e.g. Surat"
              sublabel="Pick-up city"
            />

            {/* To City */}
            <CityPicker
              value={toCity}
              onChange={setToCity}
              label="To"
              placeholder="e.g. Saputara"
              sublabel="Where to go"
            />

            {/* Departure Date */}
            <DatePicker value={departureDate} onChange={setDepartureDate} />

            {/* Duration */}
            <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-teal-600 focus-within:bg-white focus-within:border-teal-600 transition-all">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Duration
              </span>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full text-[15px] font-bold text-slate-900 bg-transparent border-none outline-none p-0 cursor-pointer appearance-none"
              >
                <option value="1">1 Day Trip</option>
                <option value="2">2D / 1N</option>
                <option value="3">3D / 2N</option>
                <option value="4">4D / 3N</option>
                <option value="5">5D / 4N</option>
                <option value="7">1 Week</option>
                <option value="10">10 Days</option>
                <option value="14">2 Weeks</option>
                <option value="21">3 Weeks</option>
                <option value="30">1 Month</option>
              </select>
              <span className="text-[11px] text-teal-700 font-medium block mt-0.5">
                {Number(duration) > 1 ? `${Number(duration) - 1} Night${Number(duration) > 2 ? "s" : ""}` : "No overnight stay"}
              </span>
            </div>

            {/* Travelers */}
            <div className="relative">
              <div
                onClick={() => setShowTravelerPicker(!showTravelerPicker)}
                className="p-3 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-teal-600 transition-all cursor-pointer h-full"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Travelers
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-bold text-slate-900">
                    {travelers} {travelers === 1 ? "Person" : "People"}
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-slate-400">
                    {showTravelerPicker ? "expand_less" : "expand_more"}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 block mt-0.5">Click to change</span>
              </div>

              {showTravelerPicker && (
                <div className="absolute bottom-full right-0 mb-1 min-w-[220px] bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold text-slate-700 whitespace-nowrap">Adults</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setTravelers(Math.max(1, travelers - 1))}
                        className="w-9 h-9 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-90 transition-all cursor-pointer text-lg font-bold"
                      >
                        −
                      </button>
                      <span className="text-xl font-bold text-slate-900 w-8 text-center">{travelers}</span>
                      <button
                        type="button"
                        onClick={() => setTravelers(travelers + 1)}
                        className="w-9 h-9 rounded-full border border-teal-300 bg-teal-50 flex items-center justify-center text-teal-700 hover:bg-teal-100 active:scale-90 transition-all cursor-pointer text-lg font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTravelerPicker(false)}
                    className="w-full mt-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-teal-700 transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>

            {/* Search Button */}
            <button
              type="submit"
              disabled={isSearching}
              className="p-3 rounded-2xl bg-teal-700 hover:bg-teal-800 active:scale-[0.98] text-white font-bold text-sm tracking-tight flex flex-col items-center justify-center gap-1 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-60"
            >
              {isSearching ? (
                <>
                  <span className="material-symbols-outlined text-[22px] animate-spin">
                    progress_activity
                  </span>
                  <span>Planning...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[22px]">search</span>
                  <span>SEARCH ITINERARY</span>
                </>
              )}
            </button>
          </form>

          {/* Trending Corridors Footer */}
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-400 font-medium">Trending:</span>
              {trendingCorridors.map((corridor) => (
                <button
                  key={corridor.label}
                  type="button"
                  onClick={() => handleTrendingClick(corridor.from, corridor.to)}
                  className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 cursor-pointer font-medium transition-colors"
                >
                  {corridor.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <span className="material-symbols-outlined text-[16px] text-teal-600">verified</span>
              <span>Zero fee date reshuffle guaranteed</span>
            </div>
          </div>
        </div>

        {/* Trust Badges Row */}
        <div className="mt-6 max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 text-white text-xs">
          {trustBadges.map((badge) => (
            <div
              key={badge.title}
              className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md rounded-xl p-2.5 border border-white/10"
            >
              <span className={`material-symbols-outlined ${badge.iconColor} text-[20px]`}>
                {badge.icon}
              </span>
              <div>
                <p className="font-bold">{badge.title}</p>
                <p className="text-[11px] text-slate-300">{badge.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
