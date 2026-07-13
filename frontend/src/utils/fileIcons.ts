import {
  FileCode2,
  FileJson,
  FileText,
  FileImage,
  File,
  FileType,
  Settings,
  BookOpen,
  Shield,
  Database,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface FileTypeInfo {
  icon: LucideIcon;
  color: string;
  bg: string;
  label: string;
}

const EXTENSION_MAP: Record<string, FileTypeInfo> = {
  ts:     { icon: FileCode2, color: "text-blue-500",   bg: "bg-blue-500/10",   label: "TypeScript" },
  tsx:    { icon: FileCode2, color: "text-cyan-500",   bg: "bg-cyan-500/10",   label: "React TSX" },
  js:     { icon: FileCode2, color: "text-amber-500",  bg: "bg-amber-500/10",  label: "JavaScript" },
  jsx:    { icon: FileCode2, color: "text-orange-500", bg: "bg-orange-500/10", label: "React JSX" },
  json:   { icon: FileJson,  color: "text-orange-400", bg: "bg-orange-400/10", label: "JSON" },
  md:     { icon: BookOpen,  color: "text-violet-500", bg: "bg-violet-500/10", label: "Markdown" },
  css:    { icon: FileType,  color: "text-emerald-500",bg: "bg-emerald-500/10",label: "CSS" },
  scss:   { icon: FileType,  color: "text-pink-500",   bg: "bg-pink-500/10",   label: "SCSS" },
  html:   { icon: FileText,  color: "text-red-500",    bg: "bg-red-500/10",    label: "HTML" },
  py:     { icon: FileCode2, color: "text-green-500",  bg: "bg-green-500/10",  label: "Python" },
  java:   { icon: FileCode2, color: "text-red-600",    bg: "bg-red-600/10",    label: "Java" },
  go:     { icon: FileCode2, color: "text-sky-500",    bg: "bg-sky-500/10",    label: "Go" },
  rs:     { icon: FileCode2, color: "text-orange-600", bg: "bg-orange-600/10", label: "Rust" },
  rb:     { icon: FileCode2, color: "text-red-400",    bg: "bg-red-400/10",    label: "Ruby" },
  yml:    { icon: Settings,  color: "text-slate-400",  bg: "bg-slate-400/10",  label: "YAML" },
  yaml:   { icon: Settings,  color: "text-slate-400",  bg: "bg-slate-400/10",  label: "YAML" },
  env:    { icon: Shield,   color: "text-yellow-500",  bg: "bg-yellow-500/10", label: "Environment" },
  sql:    { icon: Database,  color: "text-indigo-500",  bg: "bg-indigo-500/10", label: "SQL" },
  prisma: { icon: Database,  color: "text-indigo-400",  bg: "bg-indigo-400/10", label: "Prisma" },
  svg:    { icon: FileImage, color: "text-teal-500",   bg: "bg-teal-500/10",   label: "SVG" },
  png:    { icon: FileImage, color: "text-teal-400",   bg: "bg-teal-400/10",   label: "PNG" },
  jpg:    { icon: FileImage, color: "text-teal-400",   bg: "bg-teal-400/10",   label: "JPEG" },
  lock:   { icon: Settings,  color: "text-slate-500",  bg: "bg-slate-500/10",  label: "Lock" },
  txt:    { icon: FileText,  color: "text-slate-400",  bg: "bg-slate-400/10",  label: "Text" },
};

const DEFAULT_TYPE: FileTypeInfo = {
  icon: File,
  color: "text-slate-400",
  bg: "bg-slate-400/10",
  label: "File",
};

export const getFileTypeInfo = (extension: string): FileTypeInfo => {
  return EXTENSION_MAP[extension.toLowerCase()] ?? DEFAULT_TYPE;
};

export const getFileExtension = (path: string): string => {
  return path.split(".").pop()?.toLowerCase() ?? "";
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
