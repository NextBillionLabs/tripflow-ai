"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { searchCities } from "@/data/cities";

interface CityPickerProps {
  value: string;
  onChange: (city: string) => void;
  placeholder: string;
  label: string;
  sublabel: string;
}

export default function CityPicker({
  value,
  onChange,
  placeholder,
  label,
  sublabel,
}: CityPickerProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setHighlightIndex(-1);
        if (query.trim()) onChange(query.trim());
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [query, onChange]);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll("[data-city-option]");
      items[highlightIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightIndex]);

  const handleInputChange = (text: string) => {
    setQuery(text);
    onChange(text);
    const matches = searchCities(text);
    setResults(matches);
    setIsOpen(matches.length > 0 && text.length > 0);
    setHighlightIndex(-1);
  };

  const handleSelect = useCallback(
    (city: string) => {
      setQuery(city);
      onChange(city);
      setIsOpen(false);
      setHighlightIndex(-1);
    },
    [onChange]
  );

  const handleFocus = () => {
    if (query) {
      const matches = searchCities(query);
      setResults(matches);
      setIsOpen(matches.length > 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightIndex((prev) => {
          const next = prev < results.length - 1 ? prev + 1 : 0;
          setQuery(results[next]); // Preview in input
          return next;
        });
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightIndex((prev) => {
          const next = prev > 0 ? prev - 1 : results.length - 1;
          setQuery(results[next]); // Preview in input
          return next;
        });
        break;
      case "Enter":
        e.preventDefault();
        if (highlightIndex >= 0 && highlightIndex < results.length) {
          handleSelect(results[highlightIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setHighlightIndex(-1);
        break;
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-teal-600 focus-within:bg-white focus-within:border-teal-600 focus-within:shadow-sm transition-all">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
          {label}
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          className="w-full text-[15px] font-bold text-slate-900 bg-transparent border-none outline-none p-0 placeholder-slate-300"
          placeholder={placeholder}
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
        />
        <span className="text-[11px] text-slate-500 truncate block">{sublabel}</span>
      </div>

      {/* Dropdown suggestions */}
      {isOpen && (
        <div
          ref={listRef}
          role="listbox"
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-52 overflow-y-auto"
        >
          {results.map((city, i) => (
            <button
              key={city}
              type="button"
              data-city-option
              role="option"
              aria-selected={i === highlightIndex}
              className={`w-full text-left px-4 py-2.5 text-sm transition-all duration-150 flex items-center gap-2.5 cursor-pointer first:rounded-t-xl last:rounded-b-xl ${
                i === highlightIndex
                  ? "bg-teal-600 text-white font-bold scale-[1.01] shadow-sm"
                  : "text-slate-800 hover:bg-slate-50"
              }`}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setHighlightIndex(i)}
              onClick={() => handleSelect(city)}
            >
              <span className={`material-symbols-outlined text-[16px] ${
                i === highlightIndex ? "text-teal-200" : "text-slate-400"
              }`}>
                {i === highlightIndex ? "check_circle" : "location_on"}
              </span>
              <span>{city}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
