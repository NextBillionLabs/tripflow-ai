"use client";

import { useState, useRef, useEffect, useMemo } from "react";

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function DatePicker({ value, onChange }: DatePickerProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selected = value ? new Date(value) : null;

  const [isOpen, setIsOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(selected?.getMonth() ?? today.getMonth());
  const [viewYear, setViewYear] = useState(selected?.getFullYear() ?? today.getFullYear());
  const [slideDir, setSlideDir] = useState<"left" | "right" | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days: { date: number; month: "prev" | "current" | "next"; full: Date }[] = [];

    // Previous month trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      days.push({ date: d, month: "prev", full: new Date(viewYear, viewMonth - 1, d) });
    }

    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: i, month: "current", full: new Date(viewYear, viewMonth, i) });
    }

    // Next month leading days
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: i, month: "next", full: new Date(viewYear, viewMonth + 1, i) });
    }

    return days;
  }, [viewMonth, viewYear]);

  const goToPrevMonth = () => {
    setSlideDir("right");
    setTimeout(() => setSlideDir(null), 200);
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const goToNextMonth = () => {
    setSlideDir("left");
    setTimeout(() => setSlideDir(null), 200);
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelect = (day: typeof calendarDays[0]) => {
    if (day.full < today) return;
    const yyyy = day.full.getFullYear();
    const mm = String(day.full.getMonth() + 1).padStart(2, "0");
    const dd = String(day.full.getDate()).padStart(2, "0");
    onChange(`${yyyy}-${mm}-${dd}`);
    setIsOpen(false);
  };

  const isToday = (d: Date) =>
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();

  const isSelected = (d: Date) =>
    selected &&
    d.getDate() === selected.getDate() &&
    d.getMonth() === selected.getMonth() &&
    d.getFullYear() === selected.getFullYear();

  const isPast = (d: Date) => d < today;

  const formatDisplay = () => {
    if (!selected) return null;
    const day = selected.getDate();
    const month = MONTHS[selected.getMonth()].slice(0, 3);
    const year = selected.getFullYear();
    const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][selected.getDay()];
    return { day, month, year, weekday };
  };

  const display = formatDisplay();

  return (
    <div ref={wrapperRef} className="relative">
      {/* Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-teal-600 transition-all cursor-pointer h-full"
      >
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
          Departure
        </span>
        {display ? (
          <div className="flex items-baseline gap-1.5">
            <span className="text-[22px] font-bold text-slate-900 leading-none">{display.day}</span>
            <div>
              <span className="text-[13px] font-bold text-slate-900">{display.month} {display.year}</span>
              <span className="text-[11px] text-teal-700 font-medium block">{display.weekday}</span>
            </div>
          </div>
        ) : (
          <>
            <span className="text-[15px] font-bold text-slate-300 block">Pick date</span>
            <span className="text-[11px] text-slate-400 block">When to travel</span>
          </>
        )}
      </div>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-1 w-[300px] bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-[fadeSlideUp_0.2s_ease-out]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-teal-600 to-teal-700">
            <button
              type="button"
              onClick={goToPrevMonth}
              className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-white text-[20px]">chevron_left</span>
            </button>
            <span className="text-white font-bold text-sm">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={goToNextMonth}
              className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-white text-[20px]">chevron_right</span>
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 px-3 pt-2">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div
            className={`grid grid-cols-7 px-3 pb-3 transition-transform duration-200 ${
              slideDir === "left" ? "animate-[slideLeft_0.2s_ease-out]" :
              slideDir === "right" ? "animate-[slideRight_0.2s_ease-out]" : ""
            }`}
          >
            {calendarDays.map((day, i) => {
              const past = isPast(day.full);
              const sel = isSelected(day.full);
              const tod = isToday(day.full);
              const other = day.month !== "current";

              return (
                <button
                  key={i}
                  type="button"
                  disabled={past && !tod}
                  onClick={() => handleSelect(day)}
                  className={`
                    w-full aspect-square flex items-center justify-center text-xs font-medium rounded-xl
                    transition-all duration-150 cursor-pointer relative
                    ${sel
                      ? "bg-teal-600 text-white font-bold shadow-md scale-110"
                      : tod
                      ? "bg-teal-50 text-teal-700 font-bold ring-2 ring-teal-300"
                      : past && !tod
                      ? "text-slate-200 cursor-not-allowed"
                      : other
                      ? "text-slate-300"
                      : "text-slate-700 hover:bg-teal-50 hover:text-teal-700 active:scale-90"
                    }
                  `}
                >
                  {day.date}
                  {tod && !sel && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-teal-500" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                const yyyy = today.getFullYear();
                const mm = String(today.getMonth() + 1).padStart(2, "0");
                const dd = String(today.getDate()).padStart(2, "0");
                onChange(`${yyyy}-${mm}-${dd}`);
                setViewMonth(today.getMonth());
                setViewYear(today.getFullYear());
                setIsOpen(false);
              }}
              className="text-xs font-semibold text-teal-700 hover:text-teal-900 cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => { onChange(""); setIsOpen(false); }}
              className="text-xs font-medium text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
