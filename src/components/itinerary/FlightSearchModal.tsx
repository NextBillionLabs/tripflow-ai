"use client";

import { useEffect, useRef } from "react";

// IATA airport code lookup for Indian cities
const CITY_TO_IATA: Record<string, string> = {
  mumbai: "BOM", bombay: "BOM",
  delhi: "DEL", "new delhi": "DEL",
  bangalore: "BLR", bengaluru: "BLR",
  chennai: "MAA", madras: "MAA",
  hyderabad: "HYD",
  ahmedabad: "AMD",
  pune: "PNQ",
  kolkata: "CCU", calcutta: "CCU",
  goa: "GOI", panaji: "GOI",
  jaipur: "JAI",
  kochi: "COK", cochin: "COK",
  lucknow: "LKO",
  nagpur: "NAG",
  surat: "STV",
  shimla: "SLV",
  leh: "IXL",
  varanasi: "VNS",
  amritsar: "ATQ",
  udaipur: "UDR",
  jodhpur: "JDH",
  coimbatore: "CJB",
  bhubaneswar: "BBI",
  patna: "PAT",
  ranchi: "IXR",
  raipur: "RPR",
  indore: "IDR",
  bhopal: "BHO",
  chandigarh: "IXC",
  jammu: "IXJ",
  srinagar: "SXR",
  mangalore: "IXE",
  visakhapatnam: "VTZ",
  tirupati: "TIR",
  madurai: "IXM",
  trichy: "TRZ", tiruchirappalli: "TRZ",
  agra: "AGR",
  aurangabad: "IXU",
  rajkot: "RAJ",
  vadodara: "BDQ",
  dehradun: "DED",
  "port blair": "IXZ",
};

function getCityIATA(city: string): string {
  const key = city.toLowerCase().trim();
  return CITY_TO_IATA[key] || "";
}

// Parse trip date string like "Sat 04 Nov - Sun 05 Nov" or "Sat 04 - Sun 05 Nov"
function parseTripDates(dateStr: string): { depart: string; returnDate: string } {
  const today = new Date();
  const year = today.getFullYear();

  const monthMap: Record<string, string> = {
    jan: "01", feb: "02", mar: "03", apr: "04",
    may: "05", jun: "06", jul: "07", aug: "08",
    sep: "09", oct: "10", nov: "11", dec: "12",
  };

  // Try to extract two dates from string like "Sat 04 Nov - Sun 05 Nov"
  const parts = dateStr.split("-").map(s => s.trim());
  const getDateFromPart = (part: string) => {
    const tokens = part.toLowerCase().split(/\s+/);
    let day = "", month = "";
    for (const t of tokens) {
      if (/^\d+$/.test(t)) day = t.padStart(2, "0");
      if (monthMap[t.slice(0, 3)]) month = monthMap[t.slice(0, 3)];
    }
    // If no month in this part, try from full string
    if (!month) {
      const fullTokens = dateStr.toLowerCase().split(/\s+/);
      for (const t of fullTokens) {
        if (monthMap[t.slice(0, 3)]) { month = monthMap[t.slice(0, 3)]; break; }
      }
    }
    return day && month ? `${year}-${month}-${day}` : "";
  };

  const depart = getDateFromPart(parts[0] || "");
  const returnDate = getDateFromPart(parts[1] || "");
  return { depart, returnDate };
}

interface FlightSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  from?: string;
  to?: string;
  dates?: string;
  travelers?: number;
}

export default function FlightSearchModal({
  isOpen,
  onClose,
  from = "",
  to = "",
  dates = "",
  travelers = 1,
}: FlightSearchModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (!isOpen || scriptLoaded.current) return;

    const originCode = getCityIATA(from);
    const destCode = getCityIATA(to);
    const { depart } = parseTripDates(dates);

    // Start from the original valid widget URL (colors pre-encoded correctly)
    let widgetUrl =
      "https://tpemd.com/content?currency=inr&trs=573780&shmarker=777377" +
      "&show_hotels=false&powered_by=true&locale=en" +
      "&searchUrl=www.aviasales.com%2Fsearch" +
      "&primary_override=%230d9488&color_button=%230d9488&color_icons=%230d9488" +
      "&dark=%23262626&light=%23FFFFFF&secondary=%23FFFFFF&special=%23C4C4C4" +
      "&color_focused=%230d9488&border_radius=8&plain=false" +
      "&promo_id=7879&campaign_id=100";

    // Append pre-fill params
    if (originCode) widgetUrl += `&origin=${originCode}`;
    if (destCode) widgetUrl += `&destination=${destCode}`;
    if (depart) widgetUrl += `&depart_date=${depart}`;
    if (travelers > 1) widgetUrl += `&adults=${travelers}`;

    const script = document.createElement("script");
    script.async = true;
    script.charset = "utf-8";
    script.src = widgetUrl;

    if (containerRef.current) {
      containerRef.current.appendChild(script);
      scriptLoaded.current = true;
    }
  }, [isOpen, from, to, dates, travelers]);

  if (!isOpen) return null;

  const originCode = getCityIATA(from);
  const destCode = getCityIATA(to);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-teal-600">flight</span>
            <span className="font-bold text-slate-900">Search Flights</span>
            {from && to && (
              <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-medium">
                {from} {originCode ? `(${originCode})` : ""} → {to} {destCode ? `(${destCode})` : ""}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-slate-500 text-[20px]">close</span>
          </button>
        </div>

        {/* No airport notice */}
        {(!originCode || !destCode) && (
          <div className="mx-4 mt-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-600 text-[16px]">info</span>
            <p className="text-xs text-amber-800">
              {!originCode && from ? `No direct airport in ${from}.` : ""}
              {!destCode && to ? ` No direct airport in ${to}.` : ""}
              {" "}Search for nearest city airports below.
            </p>
          </div>
        )}

        {/* Widget container */}
        <div className="p-4 min-h-[300px]" ref={containerRef} />
      </div>
    </div>
  );
}
