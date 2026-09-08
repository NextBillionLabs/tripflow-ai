import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-12 px-5 sm:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Top Row: Logo + Trust Badges */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            {/* Text Logo */}
            <div className="flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center">
                <span className="text-white font-bold text-xs">TF</span>
              </div>
              <span className="text-base font-bold text-slate-900 tracking-tight">
                TripFlow<span className="text-teal-700">.ai</span>
              </span>
            </div>
            <span className="text-xs text-slate-500">
              | India&apos;s Adaptive Road Trip & Outstation Travel Engine
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1 text-slate-500">
              <span className="material-symbols-outlined text-[15px] text-teal-600">verified</span>
              FASTag & Fuel Calibrated
            </span>
            <span className="flex items-center gap-1 text-slate-500">
              <span className="material-symbols-outlined text-[15px] text-teal-600">shield</span>
              100% Safe Payments
            </span>
            <span className="flex items-center gap-1 text-slate-500">
              <span className="material-symbols-outlined text-[15px] text-teal-600">
                headset_mic
              </span>
              24×7 Road Helpline
            </span>
          </div>
        </div>

        {/* Bottom Row: Copyright + Links */}
        <div className="py-5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2025 TripFlow AI Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-5 flex-wrap">
            <Link href="#" className="hover:text-slate-900 transition-colors">
              Popular Corridors
            </Link>
            <Link href="#" className="hover:text-slate-900 transition-colors">
              Highway Safety Guides
            </Link>
            <Link href="#" className="hover:text-slate-900 transition-colors">
              Hotel & Haveli Partners
            </Link>
            <Link href="#" className="hover:text-slate-900 transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-slate-900 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
