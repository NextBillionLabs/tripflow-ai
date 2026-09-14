"use client";

import { useEffect, useRef } from "react";

interface FlightSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FlightSearchModal({ isOpen, onClose }: FlightSearchModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (!isOpen || scriptLoaded.current) return;

    const script = document.createElement("script");
    script.async = true;
    script.charset = "utf-8";
    script.src =
      "https://tpemd.com/content?currency=inr&trs=573780&shmarker=777377&show_hotels=false&powered_by=true&locale=en&searchUrl=www.aviasales.com%2Fsearch&primary_override=%230d9488&color_button=%230d9488&color_icons=%230d9488&dark=%23262626&light=%23FFFFFF&secondary=%23FFFFFF&special=%23C4C4C4&color_focused=%230d9488&border_radius=8&plain=false&promo_id=7879&campaign_id=100";

    if (containerRef.current) {
      containerRef.current.appendChild(script);
      scriptLoaded.current = true;
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
            <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-medium">Powered by Aviasales</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-slate-500 text-[20px]">close</span>
          </button>
        </div>

        {/* Widget container */}
        <div className="p-4 min-h-[300px]" ref={containerRef} />
      </div>
    </div>
  );
}
