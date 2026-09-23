"use client";

import React, { useRef, useEffect, useState } from "react";

export function toDDMMYYYY(val: string): string {
  if (!val) return "";
  const trimmed = val.trim();

  // Already DD-MM-YYYY
  if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) {
    return trimmed;
  }

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split("-");
    return `${d}-${m}-${y}`;
  }

  // YYYY/MM/DD
  if (/^\d{4}\/\d{2}\/\d{2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split("/");
    return `${d}-${m}-${y}`;
  }

  // Try parsing generic date string
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  return trimmed;
}

export function toYYYYMMDD(val: string): string {
  if (!val) return "";
  const trimmed = val.trim();

  // DD-MM-YYYY
  if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) {
    const [d, m, y] = trimmed.split("-");
    return `${y}-${m}-${d}`;
  }

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  return "";
}

function formatAsDDMMYYYY(raw: string, isDeleting: boolean = false): string {
  if (isDeleting) return raw;
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
}

interface DatePickerInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
}

export default function DatePickerInput({
  value,
  onChange,
  placeholder = "DD-MM-YYYY",
  className = "",
  required = false,
  disabled = false,
  id,
}: DatePickerInputProps) {
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const [prevVal, setPrevVal] = useState(value);

  // Normalize incoming value to DD-MM-YYYY on change
  useEffect(() => {
    const normalized = toDDMMYYYY(value);
    if (normalized !== value) {
      onChange(normalized);
    }
    setPrevVal(normalized);
  }, [value, onChange]);

  const displayVal = toDDMMYYYY(value);
  const isoVal = toYYYYMMDD(displayVal);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.value;
    const isDeleting = nextVal.length < prevVal.length;
    setPrevVal(nextVal);

    // If user is deleting, allow raw edit
    if (isDeleting) {
      onChange(nextVal);
      return;
    }

    // Auto-format digits with dashes: DD-MM-YYYY
    const formatted = formatAsDDMMYYYY(nextVal, false);
    onChange(formatted);
  };

  const handleHiddenPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.value; // YYYY-MM-DD
    if (!picked) return;
    const formatted = toDDMMYYYY(picked);
    onChange(formatted);
  };

  const openPicker = () => {
    if (hiddenInputRef.current) {
      if (typeof hiddenInputRef.current.showPicker === "function") {
        hiddenInputRef.current.showPicker();
      } else {
        hiddenInputRef.current.focus();
        hiddenInputRef.current.click();
      }
    }
  };

  return (
    <div className="relative flex items-center w-full">
      {/* Visible formatted text input allowing direct typing in DD-MM-YYYY */}
      <input
        id={id}
        type="text"
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        value={displayVal}
        onChange={handleTextChange}
        maxLength={10}
        className={`w-full pr-10 ${className}`}
      />

      {/* Interactive Calendar Icon Trigger */}
      <div className="absolute right-0 top-0 bottom-0 w-10 flex items-center justify-center pointer-events-auto">
        {/* Invisible native date input layered over icon for 100% native picker clickability */}
        <input
          ref={hiddenInputRef}
          type="date"
          tabIndex={-1}
          aria-hidden="true"
          value={isoVal}
          onChange={handleHiddenPickerChange}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
        />

        {/* Calendar SVG Icon */}
        <button
          type="button"
          tabIndex={-1}
          onClick={openPicker}
          className="w-7 h-7 rounded-[6px] grid place-items-center text-[#64748b] hover:text-[#2563eb] hover:bg-[#eff6ff] transition pointer-events-none"
          title="Choose date from calendar"
        >
          <svg
            className="w-[18px] h-[18px]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
            <circle cx="8" cy="14" r="1" fill="currentColor" />
            <circle cx="12" cy="14" r="1" fill="currentColor" />
            <circle cx="16" cy="14" r="1" fill="currentColor" />
            <circle cx="8" cy="18" r="1" fill="currentColor" />
            <circle cx="12" cy="18" r="1" fill="currentColor" />
          </svg>
        </button>
      </div>
    </div>
  );
}
