import type { BudgetBreakdown } from "@/types/itinerary";
import RouteMap from "./RouteMap";

interface TripSidebarProps {
  budget: BudgetBreakdown;
  from: string;
  to: string;
}

export default function TripSidebar({ budget, from, to }: TripSidebarProps) {
  const budgetItems = [
    { label: "Accommodation", amount: budget.accommodation },
    { label: "Transport & Cabs", amount: budget.transport },
    { label: "Food & Dining", amount: budget.food },
    { label: "Activities", amount: budget.activities },
    { label: "Contingency", amount: budget.contingency },
  ].filter((item) => item.amount > 0);

  return (
    <div className="flex flex-col gap-5 lg:sticky lg:top-24">
      {/* Live Route Map */}
      <RouteMap from={from} to={to} />

      {/* Budget Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900">Budget Breakdown</h3>
          <span className="text-sm font-bold text-slate-900">
            ₹{budget.total.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="space-y-2">
          {budgetItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg text-xs"
            >
              <span className="text-slate-600">{item.label}</span>
              <span className="font-semibold text-slate-900">
                ₹{item.amount.toLocaleString("en-IN")}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Per person estimate</span>
          <button
            type="button"
            className="text-teal-700 font-semibold hover:text-teal-800 cursor-pointer"
          >
            Split Details →
          </button>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">support_agent</span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">24×7 Road Support</p>
            <p className="text-[11px] text-slate-500">TripFlow Emergency Line</p>
          </div>
        </div>
        <button
          type="button"
          className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">call</span>
        </button>
      </div>
    </div>
  );
}
