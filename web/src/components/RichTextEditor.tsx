"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const FONT_FAMILIES = [
  { name: "Default (Inter)", value: "inherit" },
  { name: "Arial", value: "Arial, sans-serif" },
  { name: "Georgia", value: "Georgia, serif" },
  { name: "Times New Roman", value: "'Times New Roman', serif" },
  { name: "Courier New", value: "'Courier New', monospace" },
  { name: "Trebuchet MS", value: "'Trebuchet MS', sans-serif" },
  { name: "Verdana", value: "Verdana, sans-serif" },
  { name: "Comic Sans", value: "'Comic Sans MS', cursive, sans-serif" },
];

const FONT_SIZES = [
  { label: "12px", value: "12px" },
  { label: "14px", value: "14px" },
  { label: "16px", value: "16px" },
  { label: "18px", value: "18px" },
  { label: "20px", value: "20px" },
  { label: "24px", value: "24px" },
  { label: "28px", value: "28px" },
  { label: "32px", value: "32px" },
];

const TEXT_COLORS = [
  { label: "Black", color: "#0f172a" },
  { label: "Slate", color: "#475569" },
  { label: "Blue", color: "#2563eb" },
  { label: "Sky", color: "#0284c7" },
  { label: "Emerald", color: "#059669" },
  { label: "Amber", color: "#d97706" },
  { label: "Red", color: "#dc2626" },
  { label: "Purple", color: "#7c3aed" },
  { label: "Pink", color: "#db2777" },
];

const HIGHLIGHT_COLORS = [
  { label: "None", color: "transparent" },
  { label: "Yellow", color: "#fef08a" },
  { label: "Green", color: "#bbf7d0" },
  { label: "Blue", color: "#bfdbfe" },
  { label: "Pink", color: "#fbcfe8" },
  { label: "Orange", color: "#fed7aa" },
  { label: "Purple", color: "#e9d5ff" },
];

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write description here...",
  minHeight = "min-h-[140px]",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [selectedFont, setSelectedFont] = useState("inherit");
  const [selectedSize, setSelectedSize] = useState("14px");
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [showHighlightPalette, setShowHighlightPalette] = useState(false);
  const [currentColor, setCurrentColor] = useState("#0f172a");
  const [currentHighlight, setCurrentHighlight] = useState("transparent");

  // Keep internal editor content in sync with external value on mount or when value changes externally
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const emitChange = useCallback(() => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange(html);
    }
  }, [onChange]);

  // Execute standard formatting commands
  const exec = (command: string, arg?: string) => {
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand(command, false, arg);
    emitChange();
    editorRef.current?.focus();
  };

  // Custom Font Size execution
  const applyFontSize = (sizePx: string) => {
    setSelectedSize(sizePx);
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand("fontSize", false, "7");

    if (editorRef.current) {
      const fontElements = editorRef.current.querySelectorAll(
        "font[size='7'], span[style*='font-size: -webkit-xxx-large'], span[style*='font-size: xxx-large']"
      );
      fontElements.forEach((el) => {
        (el as HTMLElement).style.fontSize = sizePx;
        if (el.tagName.toLowerCase() === "font") {
          el.removeAttribute("size");
        }
      });
    }
    emitChange();
  };

  // Custom Font Family execution
  const applyFontFamily = (family: string) => {
    setSelectedFont(family);
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand("fontName", false, family);
    emitChange();
  };

  // Text Color
  const applyTextColor = (color: string) => {
    setCurrentColor(color);
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand("foreColor", false, color);
    setShowColorPalette(false);
    emitChange();
  };

  // Highlight Color
  const applyHighlightColor = (color: string) => {
    setCurrentHighlight(color);
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand("hiliteColor", false, color);
    setShowHighlightPalette(false);
    emitChange();
  };

  return (
    <div className="border border-[#cbd7ea] rounded-[14px] bg-white overflow-hidden shadow-sm focus-within:border-[#2563eb] focus-within:ring-2 focus-within:ring-[#2563eb]/15 transition-all">
      {/* ================= MS WORD STYLE TOOLBAR ================= */}
      <div className="bg-[#f8fafc] border-b border-[#e2e8f0] p-2 flex flex-wrap items-center gap-1 text-[13px] select-none">
        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 pr-1.5 border-r border-[#e2e8f0]">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec("undo");
            }}
            title="Undo (Ctrl+Z)"
            className="w-7 h-7 rounded-[6px] grid place-items-center text-[#475569] hover:bg-white hover:text-[#2563eb] hover:shadow-xs transition"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M9 14L4 9l5-5" />
              <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" />
            </svg>
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec("redo");
            }}
            title="Redo (Ctrl+Y)"
            className="w-7 h-7 rounded-[6px] grid place-items-center text-[#475569] hover:bg-white hover:text-[#2563eb] hover:shadow-xs transition"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M15 14l5-5-5-5" />
              <path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5v0A5.5 5.5 0 0 0 9.5 20H13" />
            </svg>
          </button>
        </div>

        {/* Font Family Selector */}
        <div className="pr-1 border-r border-[#e2e8f0]">
          <select
            value={selectedFont}
            onChange={(e) => applyFontFamily(e.target.value)}
            className="px-2 py-1 text-[12px] bg-white border border-[#cbd5e1] rounded-[6px] text-[#334155] outline-none hover:border-[#2563eb] cursor-pointer"
            title="Font Family"
          >
            {FONT_FAMILIES.map((f) => (
              <option key={f.name} value={f.value}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        {/* Font Size Selector */}
        <div className="pr-1.5 border-r border-[#e2e8f0]">
          <select
            value={selectedSize}
            onChange={(e) => applyFontSize(e.target.value)}
            className="px-1.5 py-1 text-[12px] bg-white border border-[#cbd5e1] rounded-[6px] text-[#334155] outline-none hover:border-[#2563eb] cursor-pointer"
            title="Font Size"
          >
            {FONT_SIZES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Bold, Italic, Underline, Strikethrough */}
        <div className="flex items-center gap-0.5 pr-1.5 border-r border-[#e2e8f0]">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec("bold");
            }}
            title="Bold (Ctrl+B)"
            className="w-7 h-7 rounded-[6px] grid place-items-center font-bold text-[#1e293b] hover:bg-white hover:text-[#2563eb] hover:shadow-xs transition"
          >
            B
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec("italic");
            }}
            title="Italic (Ctrl+I)"
            className="w-7 h-7 rounded-[6px] grid place-items-center italic font-serif text-[#1e293b] hover:bg-white hover:text-[#2563eb] hover:shadow-xs transition"
          >
            I
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec("underline");
            }}
            title="Underline (Ctrl+U)"
            className="w-7 h-7 rounded-[6px] grid place-items-center underline text-[#1e293b] hover:bg-white hover:text-[#2563eb] hover:shadow-xs transition"
          >
            U
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec("strikeThrough");
            }}
            title="Strikethrough"
            className="w-7 h-7 rounded-[6px] grid place-items-center line-through text-[#64748b] hover:bg-white hover:text-[#2563eb] hover:shadow-xs transition"
          >
            S
          </button>
        </div>

        {/* Text Color & Highlight Popovers */}
        <div className="flex items-center gap-1 pr-1.5 border-r border-[#e2e8f0] relative">
          {/* Text Color Button */}
          <div className="relative">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setShowColorPalette(!showColorPalette);
                setShowHighlightPalette(false);
              }}
              title="Text Color"
              className="flex flex-col items-center justify-center w-7 h-7 rounded-[6px] hover:bg-white hover:shadow-xs transition"
            >
              <span className="font-bold text-[13px] leading-none text-[#1e293b]">A</span>
              <span
                className="w-3.5 h-[3px] rounded-full mt-0.5"
                style={{ backgroundColor: currentColor }}
              />
            </button>

            {showColorPalette && (
              <div
                className="absolute top-8 left-0 z-50 bg-white p-2.5 rounded-[12px] shadow-[0_10px_28px_rgba(15,23,42,0.18)] border border-[#e2e8f0] w-[150px] animate-[pop_0.15s_ease]"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="text-[11px] font-semibold text-[#64748b] mb-1.5">Text Color</div>
                <div className="grid grid-cols-3 gap-1.5">
                  {TEXT_COLORS.map((tc) => (
                    <button
                      key={tc.color}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        applyTextColor(tc.color);
                      }}
                      className="w-8 h-6 rounded-[6px] border border-slate-200 transition hover:scale-110 flex items-center justify-center"
                      style={{ backgroundColor: tc.color }}
                      title={tc.label}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Text Highlight Button */}
          <div className="relative">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setShowHighlightPalette(!showHighlightPalette);
                setShowColorPalette(false);
              }}
              title="Text Highlight Color"
              className="flex flex-col items-center justify-center w-7 h-7 rounded-[6px] hover:bg-white hover:shadow-xs transition"
            >
              <svg className="w-3.5 h-3.5 text-[#334155]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              <span
                className="w-3.5 h-[3px] rounded-full mt-0.5 border border-slate-300"
                style={{ backgroundColor: currentHighlight === "transparent" ? "#fef08a" : currentHighlight }}
              />
            </button>

            {showHighlightPalette && (
              <div
                className="absolute top-8 left-0 z-50 bg-white p-2.5 rounded-[12px] shadow-[0_10px_28px_rgba(15,23,42,0.18)] border border-[#e2e8f0] w-[150px] animate-[pop_0.15s_ease]"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="text-[11px] font-semibold text-[#64748b] mb-1.5">Highlight</div>
                <div className="grid grid-cols-3 gap-1.5">
                  {HIGHLIGHT_COLORS.map((hc) => (
                    <button
                      key={hc.color}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        applyHighlightColor(hc.color);
                      }}
                      className="w-8 h-6 rounded-[6px] border border-slate-200 transition hover:scale-110 flex items-center justify-center text-[10px] text-slate-500"
                      style={{ backgroundColor: hc.color }}
                      title={hc.label}
                    >
                      {hc.color === "transparent" ? "None" : ""}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Alignment: Left, Center, Right, Justify */}
        <div className="flex items-center gap-0.5 pr-1.5 border-r border-[#e2e8f0]">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec("justifyLeft");
            }}
            title="Align Left"
            className="w-7 h-7 rounded-[6px] grid place-items-center text-[#475569] hover:bg-white hover:text-[#2563eb] hover:shadow-xs transition"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="17" y1="10" x2="3" y2="10" />
              <line x1="21" y1="6" x2="3" y2="6" />
              <line x1="21" y1="14" x2="3" y2="14" />
              <line x1="17" y1="18" x2="3" y2="18" />
            </svg>
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec("justifyCenter");
            }}
            title="Align Center"
            className="w-7 h-7 rounded-[6px] grid place-items-center text-[#475569] hover:bg-white hover:text-[#2563eb] hover:shadow-xs transition"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="10" x2="6" y2="10" />
              <line x1="21" y1="6" x2="3" y2="6" />
              <line x1="18" y1="14" x2="6" y2="14" />
              <line x1="21" y1="18" x2="3" y2="18" />
            </svg>
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec("justifyRight");
            }}
            title="Align Right"
            className="w-7 h-7 rounded-[6px] grid place-items-center text-[#475569] hover:bg-white hover:text-[#2563eb] hover:shadow-xs transition"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="21" y1="10" x2="7" y2="10" />
              <line x1="21" y1="6" x2="3" y2="6" />
              <line x1="21" y1="14" x2="3" y2="14" />
              <line x1="21" y1="18" x2="7" y2="18" />
            </svg>
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec("justifyFull");
            }}
            title="Justify"
            className="w-7 h-7 rounded-[6px] grid place-items-center text-[#475569] hover:bg-white hover:text-[#2563eb] hover:shadow-xs transition"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="21" y1="6" x2="3" y2="6" />
              <line x1="21" y1="10" x2="3" y2="10" />
              <line x1="21" y1="14" x2="3" y2="14" />
              <line x1="21" y1="18" x2="3" y2="18" />
            </svg>
          </button>
        </div>

        {/* Bullet and Numbered Lists */}
        <div className="flex items-center gap-0.5 pr-1.5 border-r border-[#e2e8f0]">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec("insertUnorderedList");
            }}
            title="Bullet List"
            className="w-7 h-7 rounded-[6px] grid place-items-center text-[#475569] hover:bg-white hover:text-[#2563eb] hover:shadow-xs transition"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" strokeWidth="3" />
              <line x1="3" y1="12" x2="3.01" y2="12" strokeWidth="3" />
              <line x1="3" y1="18" x2="3.01" y2="18" strokeWidth="3" />
            </svg>
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec("insertOrderedList");
            }}
            title="Numbered List"
            className="w-7 h-7 rounded-[6px] grid place-items-center text-[#475569] hover:bg-white hover:text-[#2563eb] hover:shadow-xs transition"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="10" y1="6" x2="21" y2="6" />
              <line x1="10" y1="12" x2="21" y2="12" />
              <line x1="10" y1="18" x2="21" y2="18" />
              <path d="M4 6h1v4" strokeWidth="1.8" />
              <path d="M4 10h2" strokeWidth="1.8" />
            </svg>
          </button>
        </div>

        {/* Indent / Outdent */}
        <div className="flex items-center gap-0.5 pr-1.5 border-r border-[#e2e8f0]">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec("outdent");
            }}
            title="Decrease Indent"
            className="w-7 h-7 rounded-[6px] grid place-items-center text-[#475569] hover:bg-white hover:text-[#2563eb] hover:shadow-xs transition"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="7 8 3 12 7 16" />
              <line x1="21" y1="12" x2="11" y2="12" />
              <line x1="21" y1="6" x2="11" y2="6" />
              <line x1="21" y1="18" x2="11" y2="18" />
            </svg>
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec("indent");
            }}
            title="Increase Indent"
            className="w-7 h-7 rounded-[6px] grid place-items-center text-[#475569] hover:bg-white hover:text-[#2563eb] hover:shadow-xs transition"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="17 8 21 12 17 16" />
              <line x1="3" y1="12" x2="13" y2="12" />
              <line x1="3" y1="6" x2="13" y2="6" />
              <line x1="3" y1="18" x2="13" y2="18" />
            </svg>
          </button>
        </div>

        {/* Clear Formatting */}
        <div>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec("removeFormat");
            }}
            title="Clear Formatting"
            className="w-7 h-7 rounded-[6px] grid place-items-center text-[#64748b] hover:bg-white hover:text-red-600 hover:shadow-xs transition"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7V4h16v3" />
              <path d="M9 20h6" />
              <path d="M12 4v16" />
              <line x1="18" y1="15" x2="22" y2="19" stroke="red" strokeWidth="2" />
              <line x1="22" y1="15" x2="18" y2="19" stroke="red" strokeWidth="2" />
            </svg>
          </button>
        </div>
      </div>

      {/* ================= EDITABLE CANVAS ================= */}
      <div
        ref={editorRef}
        contentEditable
        onInput={emitChange}
        onBlur={emitChange}
        data-placeholder={placeholder}
        className={`p-3.5 text-[#1e293b] leading-relaxed outline-none overflow-y-auto ${minHeight} prose prose-sm max-w-none focus:outline-none`}
        style={{
          fontFamily: selectedFont === "inherit" ? undefined : selectedFont,
          fontSize: selectedSize,
        }}
      />
    </div>
  );
}
