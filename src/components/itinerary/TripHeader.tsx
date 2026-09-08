import type { TripMeta } from "@/types/itinerary";

interface TripHeaderProps {
  trip: TripMeta;
  weatherAlert?: string;
}

export default function TripHeader({ trip, weatherAlert }: TripHeaderProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs mb-1.5">
            <span className="bg-teal-50 text-teal-700 border border-teal-200/60 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
              AI Generated Itinerary
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-medium">{trip.duration}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {trip.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-2.5 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg">
              <span className="material-symbols-outlined text-[15px] text-slate-400">
                calendar_today
              </span>
              {trip.dates}
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg">
              <span className="material-symbols-outlined text-[15px] text-slate-400">group</span>
              {trip.travelers} Travelers
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg">
              <span className="material-symbols-outlined text-[15px] text-slate-400">payments</span>
              ₹{trip.totalBudget.toLocaleString("en-IN")} Total
            </span>
            {weatherAlert && (
              <span className="flex items-center gap-1.5 text-amber-800 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-lg font-medium">
                <span className="material-symbols-outlined text-[15px]">rainy</span>
                {weatherAlert}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">share</span>
            Share
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-colors shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            Book All
          </button>
        </div>
      </div>
    </div>
  );
}
