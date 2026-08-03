import { Sparkles, FileText, Network, Layers, Blocks, ArrowLeftRight, History, Activity, Lightbulb } from "lucide-react";
import type { InsightSectionKey } from "@/types/insights";

export const INSIGHT_TABS: { key: InsightSectionKey; label: string; icon: React.ReactNode }[] = [
  { key: "overview", label: "Overview", icon: <Sparkles size={14} /> },
  { key: "summary", label: "Summary", icon: <FileText size={14} /> },
  { key: "architecture", label: "Architecture", icon: <Network size={14} /> },
  { key: "modules", label: "Modules", icon: <Blocks size={14} /> },
  { key: "dependencies", label: "Dependencies", icon: <ArrowLeftRight size={14} /> },
  { key: "techstack", label: "Tech Stack", icon: <Layers size={14} /> },
  { key: "timeline", label: "Timeline", icon: <History size={14} /> },
  { key: "health", label: "Health", icon: <Activity size={14} /> },
  { key: "recommendations", label: "Recommendations", icon: <Lightbulb size={14} /> },
];
