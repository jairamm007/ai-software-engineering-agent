import { useState, type ReactNode } from "react";

interface Props {
  graph: ReactNode;
  analytics: ReactNode;
  logs: string[];
}

export default function BottomPanel({ graph, analytics, logs }: Props) {
  const [activeTab, setActiveTab] = useState<"graph" | "analytics" | "logs">("graph");
  const tabs = [{ id: "graph", label: "Dependency Graph" }, { id: "analytics", label: "Analytics" }, { id: "logs", label: "Logs" }] as const;
  return <section className="flex h-full min-h-0 flex-col bg-white dark:bg-slate-900"><div className="flex gap-1 border-b px-3 pt-2">{tabs.map((tab) => <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`rounded-t-lg px-3 py-2 text-sm ${activeTab === tab.id ? "bg-slate-100 font-semibold dark:bg-slate-800" : "text-slate-500 hover:text-slate-900"}`}>{tab.label}</button>)}</div><div className="min-h-0 flex-1 overflow-auto p-3">{activeTab === "graph" && graph}{activeTab === "analytics" && analytics}{activeTab === "logs" && <ol className="space-y-2 text-sm text-slate-600 dark:text-slate-300">{logs.length ? logs.map((log, index) => <li key={`${log}-${index}`}>{log}</li>) : <li>No workspace activity yet.</li>}</ol>}</div></section>;
}
