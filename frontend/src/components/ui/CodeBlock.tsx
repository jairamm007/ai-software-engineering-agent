import { useState, useRef, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "@/context/ThemeContext";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Download,
  FileText,
  FileType,
  FileImage,
} from "lucide-react";
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun } from "docx";

interface Props {
  language?: string;
  children: string;
  filename?: string;
}

export default function CodeBlock({ language = "text", children, filename }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [collapsed, setCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const code = String(children).replace(/\n$/, "");
  const label = language.toUpperCase();
  const fileName = filename ?? `code-snippet`;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadBlob = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadTXT = () => {
    const blob = new Blob([code], { type: "text/plain" });
    downloadBlob(blob, `${fileName}.txt`);
    setMenuOpen(false);
  };

  const downloadPDF = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    doc.setFont("Courier", "normal");
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(code, 260);
    let y = 15;
    for (const line of lines) {
      if (y > 190) {
        doc.addPage();
        y = 15;
      }
      doc.text(line, 15, y);
      y += 4;
    }
    doc.save(`${fileName}.pdf`);
    setMenuOpen(false);
  };

  const downloadDOCX = async () => {
    const paragraphs = code.split("\n").map(
      (line) =>
        new Paragraph({
          children: [
            new TextRun({
              text: line,
              font: "Courier New",
              size: 20,
            }),
          ],
        })
    );
    const doc = new Document({
      sections: [{ children: paragraphs }],
    });
    const blob = await Packer.toBlob(doc);
    downloadBlob(blob, `${fileName}.docx`);
    setMenuOpen(false);
  };

  return (
    <div className={`group/code relative my-3 overflow-hidden rounded-xl border ${
      isDark ? "border-white/10 bg-[#1a1a2e]" : "border-slate-200 bg-slate-50"
    }`}>
      <div className={`flex items-center justify-between border-b px-3 py-1.5 ${
        isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-200 bg-slate-100/60"
      }`}>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className={`rounded p-0.5 transition-colors ${
              isDark ? "text-slate-400 hover:bg-white/10 hover:text-slate-200" : "text-slate-500 hover:bg-slate-200 hover:text-slate-700"
            }`}
            title={collapsed ? "Expand code" : "Collapse code"}
          >
            {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
          <span className={`text-[11px] font-semibold tracking-wider ${
            isDark ? "text-slate-500" : "text-slate-400"
          }`}>
            {label}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopy}
            className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-all ${
              copied
                ? "bg-emerald-500/15 text-emerald-500"
                : isDark
                  ? "text-slate-400 hover:bg-white/10 hover:text-slate-200"
                  : "text-slate-500 hover:bg-slate-200 hover:text-slate-700"
            }`}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? "Copied" : "Copy"}
          </button>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-all ${
                isDark
                  ? "text-slate-400 hover:bg-white/10 hover:text-slate-200"
                  : "text-slate-500 hover:bg-slate-200 hover:text-slate-700"
              }`}
            >
              <Download size={12} />
              Download
            </button>

            {menuOpen && (
              <div className={`absolute right-0 top-full z-50 mt-1 w-40 overflow-hidden rounded-xl border shadow-xl ${
                isDark ? "border-white/10 bg-[#1a1a2e]" : "border-slate-200 bg-white"
              }`}>
                <button
                  type="button"
                  onClick={downloadTXT}
                  className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-medium transition-colors ${
                    isDark ? "text-slate-300 hover:bg-white/10" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <FileText size={13} className="text-blue-500" />
                  Plain Text (.txt)
                </button>
                <button
                  type="button"
                  onClick={downloadPDF}
                  className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-medium transition-colors ${
                    isDark ? "text-slate-300 hover:bg-white/10" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <FileType size={13} className="text-red-500" />
                  PDF (.pdf)
                </button>
                <button
                  type="button"
                  onClick={() => void downloadDOCX()}
                  className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs font-medium transition-colors ${
                    isDark ? "text-slate-300 hover:bg-white/10" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <FileImage size={13} className="accent-text-base" />
                  Word (.docx)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {!collapsed && (
        <SyntaxHighlighter
          language={language}
          style={isDark ? oneDark : oneLight}
          customStyle={{
            margin: 0,
            borderRadius: 0,
            padding: "0.875rem 1rem",
            background: isDark ? "#1a1a2e" : "#f8fafc",
            fontSize: "0.8125rem",
            lineHeight: "1.6",
          }}
          codeTagProps={{
            style: {
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace",
            },
          }}
        >
          {code}
        </SyntaxHighlighter>
      )}

      {collapsed && (
        <div className={`px-4 py-2.5 text-xs ${isDark ? "text-slate-600" : "text-slate-400"}`}>
          {code.split("\n").length} lines hidden
        </div>
      )}
    </div>
  );
}
