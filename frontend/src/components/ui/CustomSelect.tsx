import { useState, useRef, useEffect, useCallback } from "react";
import { useTheme } from "@/context/ThemeContext";
import { ChevronDown } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
}

export default function CustomSelect({ value, onChange, options, placeholder = "Select...", className = "", ariaLabel }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  const handleToggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const handleSelect = useCallback(
    (optionValue: string) => {
      onChange(optionValue);
      setOpen(false);
    },
    [onChange]
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        aria-label={ariaLabel}
        className={`w-full rounded-xl border px-4 py-3 text-sm text-left outline-none transition-all duration-200 font-[Inter] flex items-center justify-between gap-2 cursor-pointer ${
          isDark
            ? "border-white/10 bg-white/[0.04] text-white placeholder:text-slate-600 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
            : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
        } ${className}`}
      >
        <span className={`truncate ${!selectedOption ? (isDark ? "text-slate-600" : "text-slate-400") : ""}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={14}
          className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""} ${
            isDark ? "text-slate-500" : "text-slate-400"
          }`}
        />
      </button>

      {open && (
        <div
          className={`absolute left-0 right-0 z-50 mt-1.5 rounded-xl border py-1 shadow-xl animate-fadeIn ${
            isDark
              ? "border-white/[0.12] bg-[#1a1a2e] shadow-black/40"
              : "border-slate-200 bg-white shadow-slate-200/60"
          }`}
          style={{ maxHeight: "240px", overflowY: "auto" }}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`w-full px-4 py-2.5 text-sm text-left transition-all font-[Inter] cursor-pointer ${
                  isSelected
                    ? isDark
                      ? "bg-[var(--accent)]/15 text-white font-semibold"
                      : "accent-bg-light accent-text-base font-semibold"
                    : isDark
                      ? "text-slate-300 hover:bg-white/[0.06]"
                      : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
