export default function CTABanner() {
  return (
    <section className="py-16 px-5 sm:px-8 max-w-7xl mx-auto">
      <div className="bg-slate-950 rounded-2xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800 shadow-md">
        {/* Left: Copy */}
        <div className="text-center md:text-left">
          <span className="text-[11px] font-bold uppercase tracking-wider text-teal-300">
            Weekend Road Assurance
          </span>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight mt-1">
            Need an unplanned weekend escape?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Get a customized itinerary with pre-verified stays and real toll passes in
            under 30 seconds.
          </p>
        </div>

        {/* Right: Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
          <a
            href="#"
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs transition-all text-center shadow-sm"
          >
            Start Instant Plan
          </a>
          <button
            type="button"
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-all border border-white/20 text-center cursor-pointer"
          >
            Speak to Road Expert
          </button>
        </div>
      </div>
    </section>
  );
}
