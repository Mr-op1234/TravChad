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

const BORDER_STYLES = [
  { label: "Solid", value: "solid" },
  { label: "Dashed", value: "dashed" },
  { label: "Dotted", value: "dotted" },
  { label: "Double", value: "double" },
  { label: "None", value: "none" },
];

const BORDER_WIDTHS = [
  { label: "1px (Thin)", value: "1px" },
  { label: "2px (Medium)", value: "2px" },
  { label: "3px (Thick)", value: "3px" },
  { label: "4px (Heavy)", value: "4px" },
];

const BORDER_COLORS = [
  { label: "Slate", color: "#cbd5e1" },
  { label: "Gray", color: "#94a3b8" },
  { label: "Dark Slate", color: "#334155" },
  { label: "Blue", color: "#2563eb" },
  { label: "Sky", color: "#0284c7" },
  { label: "Emerald", color: "#10b981" },
  { label: "Amber", color: "#f59e0b" },
  { label: "Red", color: "#ef4444" },
  { label: "Purple", color: "#8b5cf6" },
];

const CELL_SHADING_COLORS = [
  { label: "None", color: "transparent" },
  { label: "Light Gray", color: "#f8fafc" },
  { label: "Slate 100", color: "#f1f5f9" },
  { label: "Blue 50", color: "#eff6ff" },
  { label: "Green 50", color: "#f0fdf4" },
  { label: "Yellow 50", color: "#fefce8" },
  { label: "Red 50", color: "#fef2f2" },
  { label: "Purple 50", color: "#faf5ff" },
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

  // Table State
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [tableRowsInput, setTableRowsInput] = useState(3);
  const [tableColsInput, setTableColsInput] = useState(3);
  const [includeHeaderRow, setIncludeHeaderRow] = useState(true);

  // Table context tracking
  const [isInsideTable, setIsInsideTable] = useState(false);
  const [showBorderMenu, setShowBorderMenu] = useState(false);
  const [showShadingMenu, setShowShadingMenu] = useState(false);

  // Border style settings
  const [tableBorderStyle, setTableBorderStyle] = useState("solid");
  const [tableBorderWidth, setTableBorderWidth] = useState("1px");
  const [tableBorderColor, setTableBorderColor] = useState("#cbd5e1");
  const [tableBorderPreset, setTableBorderPreset] = useState<"all" | "outer" | "horizontal" | "none">("all");

  const selectedTableRef = useRef<HTMLTableElement | null>(null);
  const selectedCellRef = useRef<HTMLTableCellElement | null>(null);

  // Image insertion state
  const [showImageMenu, setShowImageMenu] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const imageFileInputRef = useRef<HTMLInputElement>(null);

  const insertImage = (url: string) => {
    if (!url.trim()) return;
    const imgHtml = `<p><img src="${url.trim()}" alt="Inserted image" style="max-width: 100%; height: auto; border-radius: 8px; margin: 12px 0; display: block;" /></p><p><br></p>`;
    editorRef.current?.focus();
    document.execCommand("insertHTML", false, imgHtml);
    setShowImageMenu(false);
    setImageUrlInput("");
    setImagePreviewUrl("");
    emitChange();
  };

  const handleEditorImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      insertImage(dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

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

  // Update table context when cursor moves
  const updateTableContext = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || !sel.anchorNode || !editorRef.current) return;

    let node: Node | null = sel.anchorNode;
    if (node.nodeType === Node.TEXT_NODE) {
      node = node.parentNode;
    }
    const cell = (node as HTMLElement)?.closest?.("td, th") as HTMLTableCellElement | null;
    const table = (node as HTMLElement)?.closest?.("table") as HTMLTableElement | null;

    if (table && cell) {
      selectedTableRef.current = table;
      selectedCellRef.current = cell;
      setIsInsideTable(true);

      const curStyle = table.style.borderStyle || cell.style.borderStyle || "solid";
      const curWidth = table.style.borderWidth || cell.style.borderWidth || "1px";
      const curColor = table.style.borderColor || cell.style.borderColor || "#cbd5e1";
      setTableBorderStyle(curStyle);
      setTableBorderWidth(curWidth);
      setTableBorderColor(curColor);
    } else if (editorRef.current.contains(node)) {
      selectedTableRef.current = null;
      selectedCellRef.current = null;
      setIsInsideTable(false);
      setShowBorderMenu(false);
      setShowShadingMenu(false);
    }
  }, []);

  // Execute standard formatting commands
  const exec = (command: string, arg?: string) => {
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand(command, false, arg);

    // Apply alignment to table cell if active
    if (command.startsWith("justify") && selectedCellRef.current) {
      const alignMap: Record<string, string> = {
        justifyLeft: "left",
        justifyCenter: "center",
        justifyRight: "right",
        justifyFull: "justify",
      };
      if (alignMap[command]) {
        selectedCellRef.current.style.textAlign = alignMap[command];
      }
    }

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

    // Apply to collapsed cell selection
    const sel = window.getSelection();
    if (sel && sel.isCollapsed && selectedCellRef.current) {
      selectedCellRef.current.style.fontSize = sizePx;
    }

    emitChange();
  };

  // Custom Font Family execution
  const applyFontFamily = (family: string) => {
    setSelectedFont(family);
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand("fontName", false, family);

    const sel = window.getSelection();
    if (sel && sel.isCollapsed && selectedCellRef.current) {
      selectedCellRef.current.style.fontFamily = family === "inherit" ? "" : family;
    }

    emitChange();
  };

  // Text Color
  const applyTextColor = (color: string) => {
    setCurrentColor(color);
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand("foreColor", false, color);

    const sel = window.getSelection();
    if (sel && sel.isCollapsed && selectedCellRef.current) {
      selectedCellRef.current.style.color = color;
    }

    setShowColorPalette(false);
    emitChange();
  };

  // Highlight Color
  const applyHighlightColor = (color: string) => {
    setCurrentHighlight(color);
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand("hiliteColor", false, color);

    const sel = window.getSelection();
    if (sel && sel.isCollapsed && selectedCellRef.current) {
      selectedCellRef.current.style.backgroundColor = color === "transparent" ? "" : color;
    }

    setShowHighlightPalette(false);
    emitChange();
  };

  // ================= TABLE OPERATIONS =================
  const applyBordersToTable = (
    style = tableBorderStyle,
    width = tableBorderWidth,
    color = tableBorderColor,
    preset = tableBorderPreset
  ) => {
    const table = selectedTableRef.current;
    if (!table) return;

    const allCells = table.querySelectorAll<HTMLTableCellElement>("th, td");
    table.style.borderCollapse = "collapse";

    if (preset === "none" || style === "none") {
      table.style.border = "none";
      allCells.forEach((c) => {
        c.style.border = "none";
      });
    } else if (preset === "outer") {
      table.style.border = `${width} ${style} ${color}`;
      allCells.forEach((c) => {
        c.style.border = "none";
      });
    } else if (preset === "horizontal") {
      table.style.border = "none";
      allCells.forEach((c) => {
        c.style.borderLeft = "none";
        c.style.borderRight = "none";
        c.style.borderTop = `${width} ${style} ${color}`;
        c.style.borderBottom = `${width} ${style} ${color}`;
      });
    } else {
      // "all" - standard grid
      table.style.border = `${width} ${style} ${color}`;
      allCells.forEach((c) => {
        c.style.border = `${width} ${style} ${color}`;
      });
    }

    setTableBorderStyle(style);
    setTableBorderWidth(width);
    setTableBorderColor(color);
    setTableBorderPreset(preset);
    emitChange();
  };

  const insertTable = (rows: number, cols: number, withHeader: boolean) => {
    let html = `<table style="border-collapse: collapse; width: 100%; margin: 12px 0; border: ${tableBorderWidth} ${tableBorderStyle} ${tableBorderColor};">`;
    let effectiveRows = rows;

    if (withHeader && rows > 0) {
      html += `<thead><tr>`;
      for (let c = 0; c < cols; c++) {
        html += `<th style="border: ${tableBorderWidth} ${tableBorderStyle} ${tableBorderColor}; padding: 8px 12px; background-color: #f8fafc; font-weight: 600; text-align: left;">Header ${c + 1}</th>`;
      }
      html += `</tr></thead>`;
      effectiveRows -= 1;
    }

    html += `<tbody>`;
    for (let r = 0; r < Math.max(1, effectiveRows); r++) {
      html += `<tr>`;
      for (let c = 0; c < cols; c++) {
        html += `<td style="border: ${tableBorderWidth} ${tableBorderStyle} ${tableBorderColor}; padding: 8px 12px; vertical-align: top;">Cell</td>`;
      }
      html += `</tr>`;
    }
    html += `</tbody></table><p><br></p>`;

    editorRef.current?.focus();
    document.execCommand("insertHTML", false, html);
    setShowTableMenu(false);
    emitChange();
    setTimeout(updateTableContext, 60);
  };

  const addRow = (above: boolean) => {
    const cell = selectedCellRef.current;
    if (!cell) return;
    const row = cell.closest("tr");
    if (!row) return;

    const numCols = row.children.length;
    const isHead = row.closest("thead") !== null;
    const newRow = document.createElement("tr");

    for (let i = 0; i < numCols; i++) {
      const newCell = document.createElement(isHead && above ? "th" : "td");
      newCell.style.border = `${tableBorderWidth} ${tableBorderStyle} ${tableBorderColor}`;
      newCell.style.padding = "8px 12px";
      newCell.style.verticalAlign = "top";
      if (isHead && above) {
        newCell.style.backgroundColor = "#f8fafc";
        newCell.style.fontWeight = "600";
      }
      newCell.innerHTML = "<br>";
      newRow.appendChild(newCell);
    }

    if (above) {
      row.parentNode?.insertBefore(newRow, row);
    } else {
      row.parentNode?.insertBefore(newRow, row.nextSibling);
    }

    emitChange();
    selectedCellRef.current = newRow.children[0] as HTMLTableCellElement;
  };

  const deleteRow = () => {
    const cell = selectedCellRef.current;
    if (!cell) return;
    const row = cell.closest("tr");
    const table = cell.closest("table");
    if (!row || !table) return;

    if (table.rows.length <= 1) {
      table.remove();
      setIsInsideTable(false);
    } else {
      const nextFocusRow = row.nextElementSibling || row.previousElementSibling;
      row.remove();
      if (nextFocusRow) {
        selectedCellRef.current = nextFocusRow.children[0] as HTMLTableCellElement;
      }
    }
    emitChange();
  };

  const addColumn = (left: boolean) => {
    const cell = selectedCellRef.current;
    if (!cell) return;
    const table = cell.closest("table");
    if (!table) return;

    const colIndex = cell.cellIndex;

    Array.from(table.rows).forEach((r) => {
      const isHeader = r.closest("thead") !== null || r.children[colIndex]?.tagName.toLowerCase() === "th";
      const newCell = document.createElement(isHeader ? "th" : "td");
      newCell.style.border = `${tableBorderWidth} ${tableBorderStyle} ${tableBorderColor}`;
      newCell.style.padding = "8px 12px";
      newCell.style.verticalAlign = "top";
      if (isHeader) {
        newCell.style.backgroundColor = "#f8fafc";
        newCell.style.fontWeight = "600";
      }
      newCell.innerHTML = "<br>";

      const targetChild = r.children[colIndex];
      if (targetChild) {
        if (left) {
          r.insertBefore(newCell, targetChild);
        } else {
          r.insertBefore(newCell, targetChild.nextSibling);
        }
      } else {
        r.appendChild(newCell);
      }
    });

    emitChange();
  };

  const deleteColumn = () => {
    const cell = selectedCellRef.current;
    if (!cell) return;
    const table = cell.closest("table");
    if (!table) return;

    const colIndex = cell.cellIndex;
    const totalCols = table.rows[0]?.children.length || 0;

    if (totalCols <= 1) {
      table.remove();
      setIsInsideTable(false);
    } else {
      Array.from(table.rows).forEach((r) => {
        if (r.children[colIndex]) {
          r.children[colIndex].remove();
        }
      });
    }
    emitChange();
  };

  const deleteTable = () => {
    if (selectedTableRef.current) {
      selectedTableRef.current.remove();
      selectedTableRef.current = null;
      selectedCellRef.current = null;
      setIsInsideTable(false);
      emitChange();
    }
  };

  const applyCellShading = (color: string) => {
    if (selectedCellRef.current) {
      selectedCellRef.current.style.backgroundColor = color === "transparent" ? "" : color;
      setShowShadingMenu(false);
      emitChange();
    }
  };

  const applyFontToTable = () => {
    if (selectedTableRef.current) {
      selectedTableRef.current.style.fontFamily = selectedFont === "inherit" ? "" : selectedFont;
      selectedTableRef.current.style.fontSize = selectedSize;
      const allCells = selectedTableRef.current.querySelectorAll<HTMLTableCellElement>("th, td");
      allCells.forEach((c) => {
        c.style.fontFamily = selectedFont === "inherit" ? "" : selectedFont;
        c.style.fontSize = selectedSize;
      });
      emitChange();
    }
  };

  // Keyboard navigation inside tables: Tab / Shift+Tab
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Tab") {
      const sel = window.getSelection();
      if (!sel || !sel.anchorNode) return;
      let node: Node | null = sel.anchorNode;
      if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;
      const cell = (node as HTMLElement)?.closest?.("td, th") as HTMLTableCellElement | null;
      const table = (node as HTMLElement)?.closest?.("table") as HTMLTableElement | null;

      if (cell && table) {
        e.preventDefault();
        const cells = Array.from(table.querySelectorAll<HTMLTableCellElement>("th, td"));
        const currentIndex = cells.indexOf(cell);

        if (e.shiftKey) {
          if (currentIndex > 0) {
            const prevCell = cells[currentIndex - 1];
            const range = document.createRange();
            range.selectNodeContents(prevCell);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
            selectedCellRef.current = prevCell;
          }
        } else {
          if (currentIndex < cells.length - 1) {
            const nextCell = cells[currentIndex + 1];
            const range = document.createRange();
            range.selectNodeContents(nextCell);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
            selectedCellRef.current = nextCell;
          } else {
            addRow(false);
          }
        }
      }
    }
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
        <div className="pr-1.5 border-r border-[#e2e8f0]">
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

        {/* ================= INSERT TABLE BUTTON ================= */}
        <div className="relative pl-1">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              setShowTableMenu(!showTableMenu);
              setShowColorPalette(false);
              setShowHighlightPalette(false);
            }}
            title="Insert Table"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[12px] font-semibold transition ${
              isInsideTable
                ? "bg-[#e0f2fe] text-[#0284c7] border border-[#bae6fd]"
                : "text-[#334155] hover:bg-white hover:text-[#2563eb] hover:shadow-xs"
            }`}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="3" y1="15" x2="21" y2="15" />
              <line x1="9" y1="3" x2="9" y2="21" />
              <line x1="15" y1="3" x2="15" y2="21" />
            </svg>
            <span>Table</span>
          </button>

          {showTableMenu && (
            <div
              className="absolute top-8 left-0 z-50 bg-white p-3.5 rounded-[14px] shadow-[0_12px_32px_rgba(15,23,42,0.2)] border border-[#cbd5e1] w-[240px] text-[#1e293b] animate-[pop_0.15s_ease]"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="text-[13px] font-bold text-[#0f172a] mb-2.5 pb-1.5 border-b border-slate-100 flex items-center justify-between">
                <span>Insert Table</span>
                <button
                  type="button"
                  onClick={() => setShowTableMenu(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              </div>

              {/* Quick Presets */}
              <div className="mb-3">
                <div className="text-[11px] font-semibold text-[#64748b] mb-1.5">Quick Presets:</div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      insertTable(2, 2, includeHeaderRow);
                    }}
                    className="p-1.5 rounded-[6px] border border-slate-200 hover:border-[#2563eb] hover:bg-[#eff6ff] text-[11.5px] font-medium text-center"
                  >
                    2 × 2 Table
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      insertTable(3, 3, includeHeaderRow);
                    }}
                    className="p-1.5 rounded-[6px] border border-slate-200 hover:border-[#2563eb] hover:bg-[#eff6ff] text-[11.5px] font-medium text-center"
                  >
                    3 × 3 Table
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      insertTable(4, 2, includeHeaderRow);
                    }}
                    className="p-1.5 rounded-[6px] border border-slate-200 hover:border-[#2563eb] hover:bg-[#eff6ff] text-[11.5px] font-medium text-center"
                  >
                    4 × 2 Table
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      insertTable(5, 4, includeHeaderRow);
                    }}
                    className="p-1.5 rounded-[6px] border border-slate-200 hover:border-[#2563eb] hover:bg-[#eff6ff] text-[11.5px] font-medium text-center"
                  >
                    5 × 4 Table
                  </button>
                </div>
              </div>

              {/* Custom Size Inputs */}
              <div className="space-y-2 mb-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-[11.5px] font-medium text-[#475569]">Rows:</label>
                  <input
                    type="number"
                    min={1}
                    max={15}
                    value={tableRowsInput}
                    onChange={(e) => setTableRowsInput(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 p-1 text-[12px] border border-slate-300 rounded-[5px] text-center"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <label className="text-[11.5px] font-medium text-[#475569]">Columns:</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={tableColsInput}
                    onChange={(e) => setTableColsInput(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 p-1 text-[12px] border border-slate-300 rounded-[5px] text-center"
                  />
                </div>
                <label className="flex items-center gap-2 text-[11.5px] text-[#475569] cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={includeHeaderRow}
                    onChange={(e) => setIncludeHeaderRow(e.target.checked)}
                    className="rounded text-[#2563eb]"
                  />
                  <span>Include Header Row</span>
                </label>
              </div>

              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  insertTable(tableRowsInput, tableColsInput, includeHeaderRow);
                }}
                className="w-full py-1.5 px-3 rounded-[7px] bg-[#2563eb] text-white text-[12px] font-semibold hover:bg-[#1d4ed8] transition shadow-xs text-center"
              >
                Insert Table
              </button>
            </div>
          )}
        </div>

        {/* ================= INSERT IMAGE BUTTON ================= */}
        <div className="relative pl-1">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              setShowImageMenu(!showImageMenu);
              setShowTableMenu(false);
              setShowColorPalette(false);
              setShowHighlightPalette(false);
            }}
            title="Insert Image (URL or Upload)"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-[12px] font-semibold text-[#334155] hover:bg-white hover:text-[#2563eb] hover:shadow-xs transition"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span>Image</span>
          </button>

          {showImageMenu && (
            <div
              className="absolute top-8 left-0 z-50 bg-white p-3.5 rounded-[14px] shadow-[0_12px_32px_rgba(15,23,42,0.2)] border border-[#cbd5e1] w-[260px] text-[#1e293b] animate-[pop_0.15s_ease]"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="text-[13px] font-bold text-[#0f172a] mb-2.5 pb-1.5 border-b border-slate-100 flex items-center justify-between">
                <span>Insert Image</span>
                <button
                  type="button"
                  onClick={() => setShowImageMenu(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              </div>

              {/* Option 1: URL */}
              <div className="space-y-2 mb-3">
                <label className="block text-[11px] font-semibold text-[#64748b]">
                  Paste Image URL:
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="url"
                    placeholder="https://..."
                    value={imageUrlInput}
                    onChange={(e) => {
                      setImageUrlInput(e.target.value);
                      if (e.target.value.trim().startsWith("http")) {
                        setImagePreviewUrl(e.target.value.trim());
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        insertImage(imageUrlInput.trim());
                      }
                    }}
                    className="flex-1 p-1.5 text-[12px] border border-slate-300 rounded-[6px] outline-none focus:border-[#2563eb]"
                  />
                  <button
                    type="button"
                    onClick={() => insertImage(imageUrlInput.trim())}
                    disabled={!imageUrlInput.trim()}
                    className="px-2.5 py-1.5 rounded-[6px] bg-[#2563eb] text-white text-[11.5px] font-semibold hover:bg-[#1d4ed8] disabled:opacity-50 transition"
                  >
                    Insert
                  </button>
                </div>

                {imagePreviewUrl && (
                  <div className="relative aspect-video rounded-[8px] overflow-hidden border border-slate-200 mt-1 max-h-[100px]">
                    <img
                      src={imagePreviewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={() => setImagePreviewUrl("")}
                    />
                  </div>
                )}
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-2 text-gray-400 text-[10px] uppercase font-medium">Or</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              {/* Option 2: Upload from Device */}
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => imageFileInputRef.current?.click()}
                  className="w-full py-2 px-3 border border-dashed border-[#cbd5e1] hover:border-[#2563eb] rounded-[8px] flex items-center justify-center gap-1.5 text-[#334155] hover:text-[#2563eb] font-semibold text-[12px] transition bg-[#f8fafc]"
                >
                  <svg className="w-3.5 h-3.5 text-[#2563eb]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Upload from Device
                </button>
                <input
                  type="file"
                  ref={imageFileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleEditorImageFileUpload}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================= TABLE CONTEXT TOOLBAR ================= */}
      {isInsideTable && (
        <div className="bg-[#f0f9ff] border-b border-[#bae6fd] px-3 py-1.5 flex flex-wrap items-center gap-2 text-[12px] text-[#0369a1] animate-[pop_0.15s_ease]">
          {/* Badge */}
          <div className="flex items-center gap-1.5 font-bold text-[#0284c7] pr-2 border-r border-[#bae6fd]">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="3" y1="15" x2="21" y2="15" />
              <line x1="9" y1="3" x2="9" y2="21" />
              <line x1="15" y1="3" x2="15" y2="21" />
            </svg>
            <span>Table Tools</span>
          </div>

          {/* Rows actions */}
          <div className="flex items-center gap-1 pr-2 border-r border-[#bae6fd]">
            <span className="text-[11px] font-semibold text-[#0284c7] uppercase">Rows:</span>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                addRow(true);
              }}
              title="Add Row Above"
              className="px-2 py-0.5 rounded-[5px] bg-white border border-[#bae6fd] hover:bg-[#e0f2fe] text-[#0369a1] font-medium transition"
            >
              + Above
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                addRow(false);
              }}
              title="Add Row Below"
              className="px-2 py-0.5 rounded-[5px] bg-white border border-[#bae6fd] hover:bg-[#e0f2fe] text-[#0369a1] font-medium transition"
            >
              + Below
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                deleteRow();
              }}
              title="Delete Current Row"
              className="px-2 py-0.5 rounded-[5px] bg-white border border-red-200 text-red-600 hover:bg-red-50 font-medium transition"
            >
              ✕ Row
            </button>
          </div>

          {/* Columns actions */}
          <div className="flex items-center gap-1 pr-2 border-r border-[#bae6fd]">
            <span className="text-[11px] font-semibold text-[#0284c7] uppercase">Cols:</span>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                addColumn(true);
              }}
              title="Add Column Left"
              className="px-2 py-0.5 rounded-[5px] bg-white border border-[#bae6fd] hover:bg-[#e0f2fe] text-[#0369a1] font-medium transition"
            >
              + Left
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                addColumn(false);
              }}
              title="Add Column Right"
              className="px-2 py-0.5 rounded-[5px] bg-white border border-[#bae6fd] hover:bg-[#e0f2fe] text-[#0369a1] font-medium transition"
            >
              + Right
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                deleteColumn();
              }}
              title="Delete Current Column"
              className="px-2 py-0.5 rounded-[5px] bg-white border border-red-200 text-red-600 hover:bg-red-50 font-medium transition"
            >
              ✕ Col
            </button>
          </div>

          {/* Table Borders dropdown popover */}
          <div className="relative pr-2 border-r border-[#bae6fd]">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setShowBorderMenu(!showBorderMenu);
                setShowShadingMenu(false);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[5px] bg-white border border-[#bae6fd] hover:bg-[#e0f2fe] text-[#0369a1] font-semibold transition"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
              </svg>
              <span>Borders</span>
              <span
                className="w-2.5 h-2.5 rounded-full border border-slate-300"
                style={{ backgroundColor: tableBorderColor }}
              />
              <span className="text-[10px]">▼</span>
            </button>

            {showBorderMenu && (
              <div
                className="absolute top-8 left-0 z-50 bg-white p-3 rounded-[12px] shadow-[0_12px_32px_rgba(15,23,42,0.2)] border border-[#cbd5e1] w-[260px] text-[#1e293b] animate-[pop_0.15s_ease]"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="text-[12px] font-bold text-[#0f172a] mb-2 pb-1 border-b border-slate-100 flex items-center justify-between">
                  <span>Table Border Styles</span>
                  <button
                    type="button"
                    onClick={() => setShowBorderMenu(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ✕
                  </button>
                </div>

                {/* Border Style */}
                <div className="mb-2">
                  <label className="block text-[11px] font-semibold text-[#64748b] mb-1">Style</label>
                  <select
                    value={tableBorderStyle}
                    onChange={(e) => {
                      applyBordersToTable(e.target.value, tableBorderWidth, tableBorderColor, tableBorderPreset);
                    }}
                    className="w-full p-1.5 text-[12px] bg-white border border-[#cbd5e1] rounded-[6px] outline-none"
                  >
                    {BORDER_STYLES.map((bs) => (
                      <option key={bs.value} value={bs.value}>{bs.label}</option>
                    ))}
                  </select>
                </div>

                {/* Border Width */}
                <div className="mb-2">
                  <label className="block text-[11px] font-semibold text-[#64748b] mb-1">Width</label>
                  <select
                    value={tableBorderWidth}
                    onChange={(e) => {
                      applyBordersToTable(tableBorderStyle, e.target.value, tableBorderColor, tableBorderPreset);
                    }}
                    className="w-full p-1.5 text-[12px] bg-white border border-[#cbd5e1] rounded-[6px] outline-none"
                  >
                    {BORDER_WIDTHS.map((bw) => (
                      <option key={bw.value} value={bw.value}>{bw.label}</option>
                    ))}
                  </select>
                </div>

                {/* Border Color */}
                <div className="mb-2">
                  <label className="block text-[11px] font-semibold text-[#64748b] mb-1">Color</label>
                  <div className="grid grid-cols-5 gap-1.5 mb-1.5">
                    {BORDER_COLORS.map((bc) => (
                      <button
                        key={bc.color}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          applyBordersToTable(tableBorderStyle, tableBorderWidth, bc.color, tableBorderPreset);
                        }}
                        className={`w-7 h-5 rounded-[4px] border ${tableBorderColor === bc.color ? "ring-2 ring-[#2563eb]" : "border-slate-300"}`}
                        style={{ backgroundColor: bc.color }}
                        title={bc.label}
                      />
                    ))}
                  </div>
                </div>

                {/* Border Preset */}
                <div className="mb-2">
                  <label className="block text-[11px] font-semibold text-[#64748b] mb-1">Apply To</label>
                  <div className="grid grid-cols-2 gap-1 text-[11px]">
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        applyBordersToTable(tableBorderStyle, tableBorderWidth, tableBorderColor, "all");
                      }}
                      className={`p-1.5 rounded-[5px] border text-center font-medium ${tableBorderPreset === "all" ? "bg-[#2563eb] text-white border-[#2563eb]" : "bg-slate-50 border-slate-200 hover:bg-slate-100"}`}
                    >
                      All Borders
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        applyBordersToTable(tableBorderStyle, tableBorderWidth, tableBorderColor, "outer");
                      }}
                      className={`p-1.5 rounded-[5px] border text-center font-medium ${tableBorderPreset === "outer" ? "bg-[#2563eb] text-white border-[#2563eb]" : "bg-slate-50 border-slate-200 hover:bg-slate-100"}`}
                    >
                      Outer Only
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        applyBordersToTable(tableBorderStyle, tableBorderWidth, tableBorderColor, "horizontal");
                      }}
                      className={`p-1.5 rounded-[5px] border text-center font-medium ${tableBorderPreset === "horizontal" ? "bg-[#2563eb] text-white border-[#2563eb]" : "bg-slate-50 border-slate-200 hover:bg-slate-100"}`}
                    >
                      Horizontal Only
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        applyBordersToTable("none", "0px", "transparent", "none");
                      }}
                      className={`p-1.5 rounded-[5px] border text-center font-medium ${tableBorderPreset === "none" ? "bg-[#2563eb] text-white border-[#2563eb]" : "bg-slate-50 border-slate-200 hover:bg-slate-100"}`}
                    >
                      No Borders
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cell Shading */}
          <div className="relative pr-2 border-r border-[#bae6fd]">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setShowShadingMenu(!showShadingMenu);
                setShowBorderMenu(false);
              }}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[5px] bg-white border border-[#bae6fd] hover:bg-[#e0f2fe] text-[#0369a1] font-medium transition"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 11l-8-8-8 8" />
                <path d="M5 19h14" />
              </svg>
              <span>Cell Color</span>
            </button>

            {showShadingMenu && (
              <div
                className="absolute top-8 left-0 z-50 bg-white p-2.5 rounded-[12px] shadow-[0_12px_32px_rgba(15,23,42,0.2)] border border-[#cbd5e1] w-[180px] text-[#1e293b] animate-[pop_0.15s_ease]"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="text-[11px] font-semibold text-[#64748b] mb-1.5">Cell Shading</div>
                <div className="grid grid-cols-4 gap-1.5">
                  {CELL_SHADING_COLORS.map((sc) => (
                    <button
                      key={sc.color}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        applyCellShading(sc.color);
                      }}
                      className="w-8 h-6 rounded-[5px] border border-slate-200 hover:scale-110 transition flex items-center justify-center text-[10px] text-slate-500"
                      style={{ backgroundColor: sc.color }}
                      title={sc.label}
                    >
                      {sc.color === "transparent" ? "None" : ""}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Apply Font to Table */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              applyFontToTable();
            }}
            title="Apply current font family and size to all cells"
            className="px-2 py-0.5 rounded-[5px] bg-white border border-[#bae6fd] hover:bg-[#e0f2fe] text-[#0369a1] font-medium transition"
          >
            Apply Font to Table
          </button>

          {/* Delete Table */}
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              deleteTable();
            }}
            className="ml-auto inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[5px] bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 font-semibold transition"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Delete Table
          </button>
        </div>
      )}

      {/* ================= EDITABLE CANVAS ================= */}
      <div
        ref={editorRef}
        contentEditable
        onInput={() => {
          emitChange();
          updateTableContext();
        }}
        onBlur={emitChange}
        onKeyUp={updateTableContext}
        onMouseUp={updateTableContext}
        onClick={updateTableContext}
        onKeyDown={handleKeyDown}
        data-placeholder={placeholder}
        className={`p-3.5 text-[#1e293b] leading-relaxed outline-none overflow-y-auto ${minHeight} prose prose-sm max-w-none focus:outline-none [&_table]:border-collapse [&_table]:w-full [&_table]:my-3`}
        style={{
          fontFamily: selectedFont === "inherit" ? undefined : selectedFont,
          fontSize: selectedSize,
        }}
      />
    </div>
  );
}
