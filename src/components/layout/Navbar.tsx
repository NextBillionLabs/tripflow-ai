"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 py-3.5">
      <div className="max-w-7xl mx-auto bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-sm rounded-2xl px-5 py-2.5 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center">
            <span className="text-white font-bold text-sm">TF</span>
          </div>
          <span className="text-lg font-bold text-slate-900 tracking-tight">
            TripFlow<span className="text-teal-700">.ai</span>
          </span>
        </Link>

        {/* Center Nav — Desktop */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/"
            className="px-3.5 py-1.5 rounded-lg text-[13px] font-semibold text-teal-700 bg-teal-50 flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">explore</span>
            Plan Trip
          </Link>
          <Link
            href="#"
            className="px-3.5 py-1.5 rounded-lg text-[13px] font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">luggage</span>
            My Trips
          </Link>
          <Link
            href="#"
            className="px-3.5 py-1.5 rounded-lg text-[13px] font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">support_agent</span>
            Support
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="bg-slate-900 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">account_circle</span>
            <span className="hidden sm:inline">Login</span>
            <span className="sm:hidden">Login</span>
          </button>

          {/* Mobile Menu */}
          <button
            type="button"
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span className="material-symbols-outlined text-[20px]">
              {mobileOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="md:hidden mt-2 max-w-7xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-lg p-3 animate-[fadeSlideUp_0.15s_ease-out]">
          <nav className="flex flex-col gap-0.5">
            <Link
              href="/"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-teal-700 bg-teal-50"
              onClick={() => setMobileOpen(false)}
            >
              <span className="material-symbols-outlined text-[18px]">explore</span>
              Plan Trip
            </Link>
            <Link
              href="#"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
              onClick={() => setMobileOpen(false)}
            >
              <span className="material-symbols-outlined text-[18px]">luggage</span>
              My Trips
            </Link>
            <Link
              href="#"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
              onClick={() => setMobileOpen(false)}
            >
              <span className="material-symbols-outlined text-[18px]">support_agent</span>
              Support
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
