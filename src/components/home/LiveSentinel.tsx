export default function LiveSentinel() {
  return (
    <section
      className="py-20 sm:py-28 bg-[#f4f4f2] border-y border-slate-200/80"
      id="adaptive"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Status Info */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-200/60">
              <span className="material-symbols-outlined text-[26px]">traffic</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Live Sentinel Alert
                </span>
                <span className="text-xs font-mono text-slate-400">Updated 4 mins ago</span>
              </div>
              <h4 className="text-base font-bold text-slate-900 mt-1">
                NH-56 Waghai ⇄ Saputara Ghat Road Status
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Clear visibility, light morning mist between km 42–58. Normal transit
                time (3.5 hrs from Surat). 0 roadblocks.
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">notifications_active</span>
              <span>Get SMS/WhatsApp Alerts</span>
            </button>
            <button
              type="button"
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-teal-800 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Check Corridors</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
