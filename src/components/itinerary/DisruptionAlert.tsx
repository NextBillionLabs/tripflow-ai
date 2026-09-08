"use client";

import { useState } from "react";

const options = [
  {
    id: "option_a",
    label: "Controlled Delay Halt",
    badge: "Recommended",
    badgeColor: "bg-emerald-50 text-emerald-700",
    impact: "+30 min",
    description:
      "Pause 30 mins at Saputara Lake Garden. Road telemetry estimates clearing by 09:10 AM. Minimal waterfall compromise.",
  },
  {
    id: "option_b",
    label: "Scenic Bypass via Vansda",
    badge: null,
    badgeColor: "",
    impact: "+15 min detour",
    description:
      "Reroute 22 km via western botanical trail. Paved single-lane forest corridor. High scenery, low traffic.",
  },
  {
    id: "option_c",
    label: "Indoor Alternative — Museum & Step Garden",
    badge: null,
    badgeColor: "",
    impact: "0 min risk",
    description:
      "Cancel waterfall visit. Redirect to sheltered cultural venues within 800m of town center. Zero road exposure.",
  },
];

export default function DisruptionAlert() {
  const [selected, setSelected] = useState("option_a");
  const [applied, setApplied] = useState(false);

  const handleApply = () => {
    setApplied(true);
  };

  const selectedLabel = options.find((o) => o.id === selected)?.label ?? "";

  return (
    <div className="bg-red-50/60 rounded-2xl border border-red-200/60 p-5 shadow-sm">
      {/* Alert Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
            Live Disruption
          </span>
          <span className="text-xs font-semibold text-slate-700">NH-56 Ghat Corridor</span>
        </div>
        <span className="text-[11px] text-red-600 font-semibold">Updated 4 mins ago</span>
      </div>

      {/* What happened */}
      <h3 className="text-base font-bold text-slate-900">
        ⚠ Heavy Rainfall — Waghai-Saputara Ghat Road (Km 42–54)
      </h3>
      <p className="text-xs text-slate-600 mt-1.5">
        Waterlogging near Ambika river spillway. Original ETA to Gira Waterfall: 8:45 AM →{" "}
        <span className="font-semibold text-red-600">Revised: 9:35 AM (+50 min delay)</span>
      </p>

      {/* AI Recommendation Panel */}
      <div className="mt-4 bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5 text-teal-700 text-xs font-bold">
            <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
            TripFlow AI Recommendation
          </div>
          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded uppercase">
            Adaptive Plan Ready
          </span>
        </div>

        {/* Options */}
        <div className="space-y-2.5">
          {options.map((option) => (
            <label
              key={option.id}
              className={`block p-3.5 rounded-xl cursor-pointer transition-colors border ${
                selected === option.id
                  ? "bg-teal-50/50 border-teal-200"
                  : "bg-slate-50 border-slate-100 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="replan"
                  value={option.id}
                  checked={selected === option.id}
                  onChange={() => setSelected(option.id)}
                  className="mt-0.5 accent-teal-700"
                />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{option.label}</span>
                      {option.badge && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${option.badgeColor}`}
                        >
                          {option.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">{option.impact}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    {option.description}
                  </p>
                </div>
              </div>
            </label>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 mt-4 pt-3 border-t border-slate-100">
          {!applied ? (
            <>
              <button
                type="button"
                onClick={handleApply}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-colors shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                Accept: {selectedLabel}
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Keep Original Plan
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-bold">
              <span className="material-symbols-outlined text-[16px]">check</span>
              Schedule updated — {selectedLabel}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
