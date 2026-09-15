"use client";

import { useState, useRef, useEffect } from "react";
import PlaceGallery from "@/components/itinerary/PlaceGallery";
import type { DayPlan, Segment } from "@/types/itinerary";
import {
  getTrainCheckUrl,
  getTrainStatusUrl,
  getTrainSearchUrl,
  getIrctcUrl,
  getBusUrl,
  getAbhiBusUrl,
  getOyoUrl,
  getMakeMyTripHotelUrl,
  getBookingUrl,
  getSavaariUrl,
  getUberUrl,
  getOlaUrl,
} from "@/lib/affiliate";

function DirectionButton({ place }: { place: string }) {
  const openDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place + ", India")}&travelmode=driving`;
    window.open(url, "_blank");
  };

  return (
    <button
      type="button"
      onClick={openDirections}
      className="inline-flex items-center gap-1 text-[10px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200/60 px-2 py-1 rounded-lg transition-colors cursor-pointer"
    >
      <span className="material-symbols-outlined text-[13px]">directions</span>
      Direction
    </button>
  );
}

interface JourneyTimelineProps {
  days: DayPlan[];
  destination?: string;
  tripFrom?: string;
  tripDates?: string;
  tripTravelers?: number;
}

const nodeStyles: Record<string, { bg: string; icon: string }> = {
  departure: { bg: "bg-slate-900", icon: "trip_origin" },
  transfer: { bg: "bg-indigo-600", icon: "sync" },
  stay: { bg: "bg-slate-900", icon: "hotel" },
  activity: { bg: "bg-amber-500", icon: "wb_twilight" },
  food: { bg: "bg-emerald-600", icon: "restaurant" },
  return: { bg: "bg-slate-900", icon: "flag" },
};

const labelColors: Record<string, string> = {
  departure: "text-teal-700",
  transfer: "text-indigo-600",
  stay: "text-teal-700",
  activity: "text-amber-600",
  food: "text-emerald-700",
  return: "text-teal-700",
};

const modeIcons: Record<string, string> = {
  train: "train",
  bus: "directions_bus",
  cab: "directions_car",
  auto: "electric_rickshaw",
  walk: "directions_walk",
  flight: "flight",
};

const modeEmoji: Record<string, string> = {
  train: "🚆",
  bus: "🚌",
  cab: "🚗",
  auto: "🛺",
  walk: "🚶",
};

// IATA airport codes for Indian cities
const CITY_IATA: Record<string, string> = {
  // ── India ─────────────────────────────────────────────────────────────────
  mumbai: "BOM", bombay: "BOM", delhi: "DEL", "new delhi": "DEL",
  bangalore: "BLR", bengaluru: "BLR", chennai: "MAA", hyderabad: "HYD",
  ahmedabad: "AMD", pune: "PNQ", kolkata: "CCU", goa: "GOI", panaji: "GOI",
  jaipur: "JAI", kochi: "COK", lucknow: "LKO", nagpur: "NAG",
  surat: "STV", shimla: "SLV", leh: "IXL", varanasi: "VNS",
  amritsar: "ATQ", udaipur: "UDR", jodhpur: "JDH", coimbatore: "CJB",
  indore: "IDR", bhopal: "BHO", chandigarh: "IXC", srinagar: "SXR",
  ranchi: "IXR", patna: "PAT", bhubaneswar: "BBI", raipur: "RPR",
  visakhapatnam: "VTZ", madurai: "IXM", trichy: "TRZ", agra: "AGR",
  rajkot: "RAJ", vadodara: "BDQ", dehradun: "DED", jammu: "IXJ",
  guwahati: "GAU", imphal: "IMF", dibrugarh: "DIB", silchar: "IXS",
  "port blair": "IXZ", "andaman": "IXZ", tirupati: "TIR", hubli: "HBX",
  mangalore: "IXE", belgaum: "IXG", aurangabad: "IXU", nashik: "ISK",
  // ── Sri Lanka ─────────────────────────────────────────────────────────────
  "sri lanka": "CMB", colombo: "CMB", kandy: "CMB", bentota: "CMB",
  galle: "CMB", negombo: "CMB", matara: "CMB",
  // ── Southeast Asia ────────────────────────────────────────────────────────
  bangkok: "BKK", "phuket": "HKT", "chiang mai": "CNX", "ko samui": "USM",
  bali: "DPS", denpasar: "DPS", jakarta: "CGK",
  singapore: "SIN", "kuala lumpur": "KUL", penang: "PEN",
  manila: "MNL", cebu: "CEB", boracay: "MPH",
  hanoi: "HAN", "ho chi minh": "SGN", saigon: "SGN", "da nang": "DAD",
  phnom: "PNH", "phnom penh": "PNH", siem: "REP", "siem reap": "REP",
  yangon: "RGN", vientiane: "VTE", kathmandu: "KTM",
  dhaka: "DAC", chittagong: "CGP",
  // ── Middle East ───────────────────────────────────────────────────────────
  dubai: "DXB", "abu dhabi": "AUH", sharjah: "SHJ",
  doha: "DOH", muscat: "MCT", kuwait: "KWI",
  riyadh: "RUH", jeddah: "JED", bahrain: "BAH",
  // ── Europe ────────────────────────────────────────────────────────────────
  london: "LHR", paris: "CDG", amsterdam: "AMS", frankfurt: "FRA",
  rome: "FCO", milan: "MXP", barcelona: "BCN",
  madrid: "MAD", zurich: "ZRH", vienna: "VIE", prague: "PRG",
  // ── Other popular ─────────────────────────────────────────────────────────
  "new york": "JFK", toronto: "YYZ", sydney: "SYD", melbourne: "MEL",
  nairobi: "NBO", mauritius: "MRU", maldives: "MLE", male: "MLE",
  istanbul: "IST",
};

function getCityCode(c: string): string {
  // Strip parentheticals like "(Kashmir)", country in parens etc.
  let clean = c.toLowerCase().trim().replace(/\s*\([^)]*\)/g, "").trim();
  // Direct match
  if (CITY_IATA[clean]) return CITY_IATA[clean];
  // Try first word only (e.g. "Srinagar Kashmir" → "srinagar")
  const first = clean.split(/\s+/)[0];
  if (first && CITY_IATA[first]) return CITY_IATA[first];
  // Partial match — find any key that starts with the input or vice versa
  for (const key of Object.keys(CITY_IATA)) {
    if (clean.startsWith(key) || key.startsWith(clean)) return CITY_IATA[key];
  }
  return "";
}

function parseDepartDate(dateStr: string) {
  const monthMap: Record<string, string> = {
    jan:"01",feb:"02",mar:"03",apr:"04",may:"05",jun:"06",
    jul:"07",aug:"08",sep:"09",oct:"10",nov:"11",dec:"12",
  };
  const year = new Date().getFullYear();
  const part = dateStr.split("-")[0] || dateStr;
  const tokens = part.toLowerCase().split(/\s+/);
  let day = "", month = "";
  for (const t of tokens) {
    if (/^\d+$/.test(t)) day = t.padStart(2,"0");
    if (monthMap[t.slice(0,3)]) month = monthMap[t.slice(0,3)];
  }
  if (!month) {
    for (const t of dateStr.toLowerCase().split(/\s+/))
      if (monthMap[t.slice(0,3)]) { month = monthMap[t.slice(0,3)]; break; }
  }
  return day && month ? `${year}-${month}-${day}` : "";
}

// ─── Travelpayouts Real-Time Widget Loader ───────────────────────────────────
// promo_id=2811 → Schedule Widget (shows real flights + prices for a route)
function TravelpayoutsWidget({ promoId, origin, destination, date, label }: {
  promoId: string; origin?: string; destination?: string; date?: string; label?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current || !containerRef.current) return;
    loaded.current = true;

    const src = `https://tpemd.com/content?` +
      `currency=inr&trs=573780&shmarker=777377` +
      `&color_button=%230d9488` +
      `&target_host=www.aviasales.in%2Fsearch` +
      `&locale=en&powered_by=true` +
      `${origin ? `&origin=${origin}` : ""}` +
      `${destination ? `&destination=${destination}` : ""}` +
      `${date ? `&depart_date=${date}` : ""}` +
      `&with_fallback=false&non_direct_flights=true&min_lines=5` +
      `&border_radius=8` +
      `&color_background=%23FFFFFF&color_text=%23000000&color_border=%23FFFFFF` +
      `&promo_id=${promoId}&campaign_id=100`;

    const s = document.createElement("script");
    s.async = true; s.charset = "utf-8"; s.src = src;
    containerRef.current.appendChild(s);
  }, [promoId, origin, destination, date]);

  return (
    <div className="mt-3 rounded-xl overflow-hidden border border-slate-200">
      {label && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700">
          <div className="flex items-center gap-2 text-white">
            <span className="material-symbols-outlined text-[15px]">schedule</span>
            <span className="text-xs font-bold">{label}</span>
          </div>
          <span className="text-teal-200 text-[10px]">Live data • Aviasales</span>
        </div>
      )}
      <div className="min-h-[300px] bg-white" ref={containerRef} />
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

// ─── Car Rental Widget (Localrent · tp.media · promo_id=8813) ─────────────────
function CarRentalWidget({ city }: { city?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);
  useEffect(() => {
    if (loaded.current || !containerRef.current) return;
    loaded.current = true;
    const s = document.createElement("script");
    s.async = true; s.charset = "utf-8";
    s.src = "https://tp.media/content?campaign_id=222&promo_id=8813&shmarker=777377&trs=573780";
    containerRef.current.appendChild(s);
  }, []);
  return (
    <div className="border border-orange-200 rounded-xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="flex items-center gap-2 text-white">
          <span className="material-symbols-outlined text-[15px]">car_rental</span>
          <span className="text-xs font-bold">Rent a Car{city ? ` in ${city}` : ""}</span>
        </div>
        <span className="text-orange-100 text-[10px]">via Localrent · Live prices</span>
      </div>
      <div className="min-h-[120px] bg-white" ref={containerRef} />
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

function FlightSearchForm({ from, to, dates, travelers }: { from: string; to: string; dates: string; travelers: number }) {
  const [origin, setOrigin] = useState(from.replace(/\s*\(.*\)/, "").trim());
  const [destination, setDestination] = useState(to.replace(/\s*\(.*\)/, "").trim());
  const [date, setDate] = useState(parseDepartDate(dates));
  const [pax, setPax] = useState(travelers || 1);

  const origCode = getCityCode(origin);
  const destCode = getCityCode(destination);

  const buildUrl = () => {
    if (origCode && destCode && date) {
      const [, month, day] = date.split("-");
      return `https://www.aviasales.in/search/${origCode}${day}${month}${destCode}${pax}?adult=${pax}&currency=inr&marker=777377.direct`;
    }
    return `https://www.aviasales.in/?marker=777377.direct`;
  };

  const handleSearch = () => {
    window.open(buildUrl(), "_blank", "noopener,noreferrer");
  };

  return (
    <div className="mt-3 border border-blue-200 rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-blue-600">
        <div className="flex items-center gap-2 text-white">
          <span className="material-symbols-outlined text-[16px]">flight</span>
          <span className="text-xs font-bold uppercase tracking-wide">Flight Search</span>
        </div>
        <span className="text-blue-200 text-[10px]">via Aviasales</span>
      </div>

      <div className="bg-white p-4 space-y-3">
        {/* From / To row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">From</label>
            <div className="relative mt-1">
              <input
                value={origin}
                onChange={e => setOrigin(e.target.value)}
                placeholder="City or airport"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-colors"
              />
              {origCode && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                  {origCode}
                </span>
              )}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">To</label>
            <div className="relative mt-1">
              <input
                value={destination}
                onChange={e => setDestination(e.target.value)}
                placeholder="City or airport"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-colors"
              />
              {destCode && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                  {destCode}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Date + Passengers row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Depart Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full mt-1 px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-colors cursor-pointer"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Passengers</label>
            <select
              value={pax}
              onChange={e => setPax(Number(e.target.value))}
              className="w-full mt-1 px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 transition-colors cursor-pointer"
            >
              {[1,2,3,4,5,6].map(n => (
                <option key={n} value={n}>{n} Passenger{n > 1 ? "s" : ""}</option>
              ))}
            </select>
          </div>
        </div>

        {/* No airport warning */}
        {origin && !origCode && (
          <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            ⚠ &quot;{origin}&quot; has no direct airport. Try a nearby city (e.g. Surat, Mumbai).
          </p>
        )}
        {destination && !destCode && (
          <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            ⚠ &quot;{destination}&quot; has no direct airport. Try a nearby city.
          </p>
        )}

        {/* Search CTA */}
        <button
          type="button"
          onClick={handleSearch}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] transition-all shadow-md shadow-blue-500/25 cursor-pointer flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">flight_takeoff</span>
          Search Flights &amp; Book Now
        </button>
        <p className="text-[10px] text-slate-400 text-center -mt-1">
          Opens Aviasales — compare all airlines &amp; book at best price
        </p>
      </div>
    </div>
  );
}

// ─── Bus & Cab Tab Content ────────────────────────────────────────────────────
type BusEntry = { name: string; duration: string; price: number };
type CabEntry = { name: string; duration: string; price: number };
function BusCabTabContent({ fromCity, toCity, tripDates, buses, cabs }: {
  fromCity: string; toCity: string; tripDates: string;
  buses: BusEntry[]; cabs: CabEntry[];
}) {
  const [from, setFrom] = useState(fromCity);
  const [to, setTo] = useState(toCity);
  const [date, setDate] = useState(parseDepartDate(tripDates));
  const [tab, setTab] = useState<"bus" | "cab" | "rent">("bus");

  const fmtDate = () => {
    if (!date) return undefined;
    return new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).replace(/ /g, "-");
  };

  const aiSuggestion = buses[0] || cabs[0];
  const isBusSuggestion = !!buses[0];

  return (
    <div className="p-3 space-y-3">

      {/* AI suggestion — one compact banner */}
      {aiSuggestion && (
        <div className={`flex items-center gap-3 rounded-xl px-3 py-2.5 border ${isBusSuggestion ? "bg-emerald-50/50 border-emerald-100" : "bg-amber-50/50 border-amber-100"}`}>
          <span className={`material-symbols-outlined text-[18px] ${isBusSuggestion ? "text-emerald-600" : "text-amber-500"}`}>
            {isBusSuggestion ? "directions_bus" : "directions_car"}
          </span>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-slate-800 block truncate">{aiSuggestion.name}</span>
            <span className="text-[11px] text-slate-500">{aiSuggestion.duration}</span>
          </div>
          <span className="text-xs font-bold text-slate-700 shrink-0">~₹{aiSuggestion.price} <span className="text-[10px] font-normal text-slate-400">AI est.</span></span>
        </div>
      )}

      {/* Single route + date row — compact */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <input value={from} onChange={e => setFrom(e.target.value)} placeholder="From"
            className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-teal-400 bg-slate-50" />
        </div>
        <span className="material-symbols-outlined text-slate-400 text-[16px] shrink-0">arrow_forward</span>
        <div className="relative flex-1 min-w-0">
          <input value={to} onChange={e => setTo(e.target.value)} placeholder="To"
            className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-teal-400 bg-slate-50" />
        </div>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          className="shrink-0 w-[120px] px-2 py-2 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-teal-400 bg-slate-50 cursor-pointer" />
      </div>

      {/* Inner tabs: Bus | Cab | Rent a Car */}
      <div className="flex rounded-lg bg-slate-100 p-0.5 gap-0.5">
        {(["bus", "cab", "rent"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${tab === t ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}>
            {t === "bus" ? "🚌 Bus" : t === "cab" ? "🚗 Cab" : "🔑 Rent"}
          </button>
        ))}
      </div>

      {/* Bus panel */}
      {tab === "bus" && (
        <div className="space-y-2">
          <a href={getBusUrl(from, to, fmtDate())} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 active:scale-[0.98] transition-all cursor-pointer">
            <div className="flex items-center gap-2">
              <span className="text-lg">🚌</span>
              <div className="text-left">
                <div className="text-sm font-bold">Search on RedBus</div>
                <div className="text-[11px] text-red-200">{from} → {to}{date ? ` · ${new Date(date).toLocaleDateString("en-IN",{day:"2-digit",month:"short"})}` : ""}</div>
              </div>
            </div>
            <span className="material-symbols-outlined text-[18px] text-red-200">open_in_new</span>
          </a>
          <a href={getAbhiBusUrl(from, to)} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-orange-500 text-white hover:bg-orange-600 active:scale-[0.98] transition-all cursor-pointer">
            <div className="flex items-center gap-2">
              <span className="text-lg">🚍</span>
              <div className="text-left">
                <div className="text-sm font-bold">Search on AbhiBus</div>
                <div className="text-[11px] text-orange-100">{from} → {to}</div>
              </div>
            </div>
            <span className="material-symbols-outlined text-[18px] text-orange-200">open_in_new</span>
          </a>
        </div>
      )}

      {/* Cab panel */}
      {tab === "cab" && (
        <div className="space-y-2">
          <a href={getSavaariUrl(from, to)} target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-teal-700 text-white hover:bg-teal-800 active:scale-[0.98] transition-all cursor-pointer">
            <div className="flex items-center gap-2">
              <span className="text-lg">🚗</span>
              <div className="text-left">
                <div className="text-sm font-bold">Savaari — Outstation Cab</div>
                <div className="text-[11px] text-teal-200">{from} → {to} · Best for long routes</div>
              </div>
            </div>
            <span className="material-symbols-outlined text-[18px] text-teal-300">open_in_new</span>
          </a>
          <div className="grid grid-cols-2 gap-2">
            <a href={getOlaUrl(from, to)} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 active:scale-[0.98] transition-all cursor-pointer">
              Ola
            </a>
            <a href={getUberUrl()} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-700 active:scale-[0.98] transition-all cursor-pointer">
              Uber
            </a>
          </div>
          <p className="text-[10px] text-slate-400 text-center">Ola & Uber best for city/local rides</p>
        </div>
      )}

      {/* Car Rental panel */}
      {tab === "rent" && (
        <CarRentalWidget city={to || fromCity} />
      )}
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

// ─── Flights Tab Content ─────────────────────────────────────────────────────

type FlightEntry = { name: string; departure?: string; arrival?: string; duration: string; price?: number; details?: string };
function FlightsTabContent({ tripFrom, tripTo, tripDates, tripTravelers, flights }: {
  tripFrom: string; tripTo: string; tripDates: string; tripTravelers: number;
  flights: FlightEntry[];
}) {
  const defaultDate = parseDepartDate(tripDates);
  const [date, setDate] = useState(defaultDate);
  const [pax, setPax] = useState(tripTravelers || 1);
  const [origin, setOrigin] = useState(tripFrom.replace(/\s*\([^)]*\)/g, "").trim());
  const [dest, setDest] = useState(tripTo.replace(/\s*\([^)]*\)/g, "").trim());
  const origCode = getCityCode(origin);
  const destCode = getCityCode(dest);

  const buildUrl = () => {
    const [, month, day] = (date || "").split("-");
    // Best case: both IATA codes known → exact pre-filled search URL
    if (origCode && destCode && day && month) {
      return `https://www.aviasales.in/search/${origCode}${day}${month}${destCode}${pax}?adult=${pax}&currency=inr&marker=777377.direct`;
    }
    // Partial: at least one code known → use query params (Aviasales supports ?origin=&destination=)
    const params = new URLSearchParams();
    if (origCode) params.set("origin", origCode); else if (origin) params.set("origin", origin);
    if (destCode) params.set("destination", destCode); else if (dest) params.set("destination", dest);
    if (date) params.set("depart_date", date);
    params.set("adult", String(pax));
    params.set("currency", "inr");
    params.set("marker", "777377.direct");
    return `https://www.aviasales.in/search?${params.toString()}`;
  };

  return (
    <div className="p-3 space-y-4">
      {/* AI flight suggestions - timeline style */}
      {flights.length > 0 && (
        <div className="space-y-2">
          {flights.map((fl, i) => (
            <div key={i} className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[16px]">flight</span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-slate-900 block truncate">{fl.name}</span>
                <span className="text-[11px] text-slate-500">
                  {fl.departure && fl.arrival ? `${fl.departure} → ${fl.arrival} · ` : ""}{fl.duration}
                </span>
              </div>
              <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full shrink-0">AI est.</span>
            </div>
          ))}
        </div>
      )}

      {/* Live price search panel */}
      <div className="border border-blue-200 rounded-xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-4 py-2.5 bg-blue-600">
          <div className="flex items-center gap-2 text-white">
            <span className="material-symbols-outlined text-[16px]">travel_explore</span>
            <span className="text-xs font-bold uppercase tracking-wide">Search Real Prices</span>
          </div>
          <span className="text-blue-200 text-[10px]">via Aviasales · INR</span>
        </div>
        <div className="bg-white p-4 space-y-3">
          {/* From / To */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">From</label>
              <div className="relative mt-1">
                <input value={origin} onChange={e => setOrigin(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200" />
                {origCode && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{origCode}</span>}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">To</label>
              <div className="relative mt-1">
                <input value={dest} onChange={e => setDest(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200" />
                {destCode && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{destCode}</span>}
              </div>
            </div>
          </div>
          {/* Date + Pax */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full mt-1 px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-400 cursor-pointer" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Passengers</label>
              <select value={pax} onChange={e => setPax(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-blue-400 cursor-pointer">
                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Passenger{n>1?"s":""}</option>)}
              </select>
            </div>
          </div>
          <button type="button" onClick={() => window.open(buildUrl(), "_blank", "noopener,noreferrer")}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold hover:from-blue-700 hover:to-blue-800 active:scale-[0.98] transition-all shadow-md shadow-blue-500/25 cursor-pointer flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[18px]">flight_takeoff</span>
            Search &amp; See Real Prices on Aviasales
          </button>
          <p className="text-[10px] text-slate-400 text-center -mt-1">Opens Aviasales — live INR prices, book directly</p>
        </div>
      </div>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────




function TransportCard({ segment, tripFrom, tripTo, tripDates, tripTravelers }: { segment: Segment; tripFrom?: string; tripTo?: string; tripDates?: string; tripTravelers?: number }) {
  const [expanded, setExpanded] = useState(false);

  if (!segment.transport) return null;
  const t = segment.transport;

  // Properly separate ALL options into trains, buses, cabs, flights
  const mainIsTrain = t.mode === "train";
  const mainIsFlight = t.mode === "flight";
  const [activeTab, setActiveTab] = useState<"train" | "bus" | "flight">(
    mainIsFlight ? "flight" : mainIsTrain ? "train" : "bus"
  );

  const trains: { name: string; departure: string; arrival: string; duration: string; price: number; details?: string }[] = [];
  const buses: { name: string; duration: string; price: number }[] = [];
  const cabs: { name: string; duration: string; price: number }[] = [];
  const flights: { name: string; departure: string; arrival: string; duration: string; price: number; details?: string }[] = [];

  // Classify main transport
  if (t.mode === "train") {
    trains.push({ name: t.name, departure: t.departure, arrival: t.arrival, duration: t.duration, price: t.price, details: t.details });
  } else if (t.mode === "bus") {
    buses.push({ name: t.name, duration: t.duration, price: t.price });
  } else if (t.mode === "cab") {
    cabs.push({ name: t.name, duration: t.duration, price: t.price });
  } else if (t.mode === "flight") {
    flights.push({ name: t.name, departure: t.departure, arrival: t.arrival, duration: t.duration, price: t.price, details: t.details });
  }

  // Classify alternatives
  segment.alternatives?.forEach((a) => {
    if (a.mode === "train") trains.push({ name: a.name, departure: "", arrival: "", duration: a.duration, price: a.price });
    else if (a.mode === "bus" || a.mode === "auto") buses.push({ name: a.name, duration: a.duration, price: a.price });
    else if (a.mode === "cab") cabs.push({ name: a.name, duration: a.duration, price: a.price });
    else if (a.mode === "flight") flights.push({ name: a.name, departure: "", arrival: "", duration: a.duration, price: a.price });
  });

  // Clean city names for booking URLs (strip "Airport", "Station", "(Kashmir)" etc.)
  const cleanCity = (s: string) => s.replace(/\s*\(.*?\)/g, "").replace(/\s*(International Airport|Airport|Railway Station|Station|Junction|Bus Stand).*$/i, "").trim();
  const fromCity = cleanCity(tripFrom || segment.title || "");
  const toCity = cleanCity(tripTo || "");

  // Booking URLs
  const trainCheckUrl = (name: string) => getTrainCheckUrl(name);
  const trainStatusUrl = (name: string) => getTrainStatusUrl(name);
  const trainSearchUrl = () => getTrainSearchUrl(fromCity, toCity);
  const busUrl = (date?: string) => getBusUrl(fromCity, toCity, date);
  const cabFromCity = fromCity;

  // Train class prices (estimated from base price)
  const getClassPrices = (basePrice: number) => [
    { cls: "SL", price: Math.round(basePrice * 0.45), avail: "AVL 120" },
    { cls: "3AC", price: basePrice, avail: "AVL 45" },
    { cls: "2AC", price: Math.round(basePrice * 1.6), avail: "WL 5" },
    { cls: "1AC", price: Math.round(basePrice * 2.8), avail: "RAC 2" },
  ];

  return (
    <div className="mt-4">
      {/* Main transport info — always visible */}
      <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">
                {modeIcons[t.mode] ?? "directions"}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">{t.name}</span>
                {t.status && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded uppercase">
                    {t.status}
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-500">
                {t.departure} → {t.arrival} • {t.duration}
                {t.details ? ` • ${t.details}` : ""}
              </span>
            </div>
          </div>
          <div className="text-right flex items-center gap-3">
            <div className="hidden sm:block">
              {mainIsFlight ? (
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">Live price ↓</span>
              ) : (
                <>
                  <span className="text-sm font-bold text-slate-900">₹{t.price}</span>
                  <span className="text-xs text-slate-400">/pax</span>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="text-[10px] font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200/60 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[13px]">
                {expanded ? "expand_less" : "expand_more"}
              </span>
              {expanded ? "Less" : "All Options"}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded view — Train/Bus/Cab tabs */}
      {expanded && (
        <div className="mt-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm animate-[fadeSlideUp_0.2s_ease-out]">
          {/* Tabs */}
          <div className="flex border-b border-slate-100">
            {trains.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveTab("train")}
                className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === "train"
                    ? "text-teal-700 border-b-2 border-teal-600 bg-teal-50/50"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                🚆 Trains ({trains.length})
              </button>
            )}
            {(buses.length > 0 || trains.length > 0) && (
              <button
                type="button"
                onClick={() => setActiveTab("bus")}
                className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === "bus"
                    ? "text-teal-700 border-b-2 border-teal-600 bg-teal-50/50"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                🚌 Bus & Cab ({buses.length + cabs.length})
              </button>
            )}
            {/* Flights tab — always show */}
            <button
              type="button"
              onClick={() => setActiveTab("flight")}
              className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === "flight"
                  ? "text-blue-700 border-b-2 border-blue-600 bg-blue-50/50"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              ✈️ Flights {flights.length > 0 ? `(${flights.length})` : ""}
            </button>
          </div>

          {/* Train Tab */}
          {activeTab === "train" && (
            <div className="p-3 space-y-3">
              {trains.map((train, i) => {
                const classes = getClassPrices(train.price);
                return (
                  <div key={i} className="border border-slate-100 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-sm font-bold text-slate-900">{train.name}</span>
                        <span className="text-xs text-slate-500 block">
                          {train.departure ? `${train.departure} → ${train.arrival} • ${train.duration}` : train.duration}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <span className="bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded border border-emerald-200/60">
                          Runs Daily
                        </span>
                      </div>
                    </div>
                    {/* Class options */}
                    <div className="grid grid-cols-4 gap-1.5 mb-2.5">
                      {classes.map((c) => (
                        <div
                          key={c.cls}
                          className={`text-center py-1.5 px-1 rounded-lg border text-[10px] ${
                            c.avail.startsWith("AVL")
                              ? "border-emerald-200 bg-emerald-50"
                              : c.avail.startsWith("RAC")
                              ? "border-amber-200 bg-amber-50"
                              : "border-red-200 bg-red-50"
                          }`}
                        >
                          <div className="font-bold text-slate-800">{c.cls}</div>
                          <div className="font-bold text-slate-900">₹{c.price}</div>
                          <div className={`font-semibold ${
                            c.avail.startsWith("AVL") ? "text-emerald-600" :
                            c.avail.startsWith("RAC") ? "text-amber-600" : "text-red-600"
                          }`}>
                            {c.avail}
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Action buttons */}
                    <div className="flex gap-1.5 mb-2">
                      <a
                        href={trainCheckUrl(train.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 rounded-lg bg-teal-600 text-white text-[10px] font-bold text-center hover:bg-teal-700 transition-colors cursor-pointer flex items-center justify-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[13px]">visibility</span>
                        Check Availability
                      </a>
                      <a
                        href={trainStatusUrl(train.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold text-center hover:bg-amber-100 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[13px]">train</span>
                        Live Status
                      </a>
                    </div>
                    <a
                      href={getIrctcUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full py-2 rounded-lg bg-slate-900 text-white text-[11px] font-bold text-center hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      🎫 Book Ticket on IRCTC
                    </a>
                  </div>
                );
              })}

              {/* Find all trains link */}
              <div className="pt-1 border-t border-slate-100">
                <a
                  href={trainSearchUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2 text-[11px] font-semibold text-teal-700 hover:text-teal-900 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">search</span>
                  Search all trains on this route on ConfirmTkt
                </a>
              </div>

              {trains.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">No direct trains on this route</p>
              )}
            </div>
          )}

          {/* Bus & Cab Tab */}
          {activeTab === "bus" && (
            <BusCabTabContent
              fromCity={fromCity}
              toCity={toCity}
              tripDates={tripDates || ""}
              buses={buses}
              cabs={cabs}
            />
          )}

          {/* Flights Tab */}
          {activeTab === "flight" && (
            <div className="p-3 space-y-3">
              {/* Date picker to control the Schedule Widget */}
              <FlightsTabContent
                tripFrom={tripFrom || ""}
                tripTo={tripTo || ""}
                tripDates={tripDates || ""}
                tripTravelers={tripTravelers || 1}
                flights={flights}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TransferCard({ segment }: { segment: Segment }) {
  return (
    <>
      {segment.bufferMinutes && (
        <div className="mt-3 bg-emerald-50 rounded-lg px-3.5 py-2.5 flex items-center gap-2 border border-emerald-200/60">
          <span className="material-symbols-outlined text-emerald-600 text-[16px]">
            check_circle
          </span>
          <span className="text-xs text-emerald-700 font-medium">
            Comfortable connection — {segment.bufferMinutes} min transfer buffer
          </span>
        </div>
      )}
      {segment.transport && (
        <div className="mt-3 bg-slate-50 rounded-xl p-3.5 border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">
                {modeIcons[segment.transport.mode] ?? "directions"}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">{segment.transport.name}</span>
                <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded uppercase">
                  {segment.transport.status ?? "Confirmed"}
                </span>
              </div>
              <span className="text-xs text-slate-500">
                {segment.transport.departure} → {segment.transport.arrival} •{" "}
                {segment.transport.duration}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function StayCard({ segment }: { segment: Segment }) {
  const [showHotels, setShowHotels] = useState(false);
  if (!segment.hotel) return null;
  const h = segment.hotel;
  const city = segment.title?.replace(/\s*(Town Center|City|Area|Hotel|Stay).*$/i, "").trim() || segment.title || "";

  return (
    <div className="mt-3 bg-slate-50 rounded-xl p-4 border border-slate-100">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-900">{h.name}</h4>
        <span className="text-sm font-bold text-slate-900">
          ₹{h.price.toLocaleString("en-IN")}
          <span className="text-xs font-normal text-slate-400">/night</span>
        </span>
      </div>
      <p className="text-xs text-slate-500 mt-1">
        {h.type}
        {h.distance ? ` • ${h.distance}` : ""}
        {h.rating ? ` • ${h.rating} ★` : ""}
      </p>
      <div className="flex items-center gap-2 mt-2.5">
        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded uppercase">
          Available
        </span>
        <button
          type="button"
          onClick={() => setShowHotels(!showHotels)}
          className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-teal-700 transition-colors cursor-pointer flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[14px]">hotel</span>
          {showHotels ? "Hide Options" : "Book Hotel"}
        </button>
      </div>

      {showHotels && (
        <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-3 gap-2 animate-[fadeSlideUp_0.2s_ease-out]">
          <a
            href={getOyoUrl(city)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-red-50 border border-red-200/60 hover:bg-red-100 transition-colors cursor-pointer"
          >
            <span className="text-sm font-black text-red-600">OYO</span>
            <span className="text-[9px] font-semibold text-red-500">Budget stays</span>
          </a>
          <a
            href={getMakeMyTripHotelUrl(city)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-blue-50 border border-blue-200/60 hover:bg-blue-100 transition-colors cursor-pointer"
          >
            <span className="text-sm font-black text-blue-600">MMT</span>
            <span className="text-[9px] font-semibold text-blue-500">MakeMyTrip</span>
          </a>
          <a
            href={getBookingUrl(city)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-indigo-50 border border-indigo-200/60 hover:bg-indigo-100 transition-colors cursor-pointer"
          >
            <span className="text-sm font-black text-indigo-600">B.com</span>
            <span className="text-[9px] font-semibold text-indigo-500">Booking.com</span>
          </a>
        </div>
      )}
    </div>
  );
}

function FoodCard({ segment }: { segment: Segment }) {
  if (!segment.foodOptions || segment.foodOptions.length === 0) return null;

  return (
    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      {segment.foodOptions.map((f) => (
        <div
          key={f.name}
          className="bg-slate-50 rounded-xl p-3 border border-slate-100 hover:border-teal-200 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">{f.name}</span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              {f.rating} ★
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{f.cuisine}</p>
          <span className="text-xs font-semibold text-slate-700 mt-1.5 block">
            ₹{f.price}/pax
          </span>
        </div>
      ))}
    </div>
  );
}

function ReturnCard({ segment }: { segment: Segment }) {
  if (!segment.milestones || segment.milestones.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      {segment.milestones.map((m, i) => (
        <div
          key={m.time}
          className={`flex items-start gap-3 px-3.5 py-2.5 rounded-lg ${
            i === (segment.milestones?.length ?? 0) - 1
              ? "bg-emerald-50 border border-emerald-200/60"
              : "bg-slate-50"
          }`}
        >
          <span
            className={`text-xs font-bold shrink-0 w-16 ${
              i === (segment.milestones?.length ?? 0) - 1 ? "text-emerald-700" : "text-slate-900"
            }`}
          >
            {m.time}
          </span>
          <div>
            <span
              className={`text-xs font-bold ${
                i === (segment.milestones?.length ?? 0) - 1 ? "text-emerald-700" : "text-slate-900"
              }`}
            >
              {m.title}
            </span>
            <p
              className={`text-[11px] mt-0.5 ${
                i === (segment.milestones?.length ?? 0) - 1 ? "text-emerald-600" : "text-slate-500"
              }`}
            >
              {m.detail}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function SegmentCard({ segment, destination, tripFrom, tripDates, tripTravelers }: {
  segment: Segment;
  destination?: string;
  tripFrom?: string;
  tripDates?: string;
  tripTravelers?: number;
}) {
  const style = nodeStyles[segment.type] ?? nodeStyles.activity;
  const labelColor = labelColors[segment.type] ?? "text-slate-600";

  return (
    <div className="relative pl-12 pb-8">
      {/* Node */}
      <div
        className={`absolute left-[4px] top-1.5 w-[22px] h-[22px] rounded-full ${style.bg} flex items-center justify-center ring-4 ring-white`}
      >
        <span className="material-symbols-outlined text-white text-[12px]">{style.icon}</span>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div>
            <span className={`text-xs font-semibold uppercase ${labelColor}`}>
              {segment.type.replace("_", " ")} • {segment.time}
            </span>
            <h3 className="text-base font-bold text-slate-900">{segment.title}</h3>
          </div>
          <DirectionButton place={segment.title} />
        </div>
        {segment.description && (
          <p className="text-xs text-slate-500 mt-1">{segment.description}</p>
        )}

        {/* Type-specific content */}
        {segment.type === "departure" && <TransportCard segment={segment} tripFrom={tripFrom} tripTo={destination} tripDates={tripDates} tripTravelers={tripTravelers} />}
        {segment.type === "transfer" && <TransferCard segment={segment} />}
        {segment.type === "stay" && (
          <>
            <PlaceGallery placeName={segment.title} placeType="stay" destination={destination} />
            <StayCard segment={segment} />
          </>
        )}
        {segment.type === "activity" && (
          <PlaceGallery placeName={segment.title} placeType="activity" destination={destination} />
        )}
        {segment.type === "activity" && segment.foodOptions && <FoodCard segment={segment} />}
        {segment.type === "food" && (
          <>
            <FoodCard segment={segment} />
          </>
        )}
        {segment.type === "return" && <ReturnCard segment={segment} />}
        {segment.type === "return" && segment.transport && <TransportCard segment={segment} tripFrom={tripFrom} tripTo={destination} tripDates={tripDates} tripTravelers={tripTravelers} />}
      </div>
    </div>
  );
}

export default function JourneyTimeline({ days, destination, tripFrom, tripDates, tripTravelers }: JourneyTimelineProps) {
  const [expandedDay] = useState<number | null>(null);
  void expandedDay;

  return (
    <div className="relative">
      {/* Continuous vertical spine */}
      <div className="absolute left-[15px] top-8 bottom-8 w-0.5 bg-slate-200" />

      {days.map((day) => (
        <div key={day.day}>
          {/* Day Label */}
          <div className="relative pl-12 pb-5">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Day {day.day} — {day.date}
            </div>
          </div>

          {/* Segments */}
          {day.segments.map((segment, i) => (
            <SegmentCard key={`${day.day}-${i}`} segment={segment} destination={destination} tripFrom={tripFrom} tripDates={tripDates} tripTravelers={tripTravelers} />
          ))}
        </div>
      ))}
    </div>
  );
}




