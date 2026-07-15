import { useState } from "react";
import { motion } from "framer-motion";
import { Search, FileCode2, FolderGit2, MessageSquare, Filter } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import DashboardLayout from "@/layouts/DashboardLayout";

const tabs = ["All", "Repositories", "Files", "Conversations"];

export default function SearchPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 md:p-8 space-y-6">
        {/* Search Input */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className={`relative rounded-2xl border p-1 ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-white"}`}>
            <Search size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search repositories, files, conversations..."
              className={`w-full rounded-xl bg-transparent py-3 pl-11 pr-4 text-sm outline-none font-[Inter] ${isDark ? "text-white placeholder:text-slate-600" : "text-slate-900 placeholder:text-slate-400"}`}
            />
            <button className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1.5 text-xs font-medium font-[Inter] transition-colors ${isDark ? "bg-white/5 text-slate-400 hover:bg-white/10" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
              <Filter size={12} className="mr-1 inline" /> Filters
            </button>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium font-[Inter] transition-colors ${activeTab === tab ? (isDark ? "bg-violet-500/15 text-violet-300" : "bg-violet-100 text-violet-700") : (isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600")}`}
            >
              {tab}
            </button>
          ))}
        </motion.div>

        {/* Results */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-3">
          {query.length === 0 ? (
            <div className={`flex flex-col items-center justify-center rounded-2xl border py-20 ${isDark ? "border-white/[0.06] bg-white/[0.01]" : "border-slate-200 bg-slate-50"}`}>
              <Search size={40} className={`mb-4 ${isDark ? "text-slate-700" : "text-slate-300"}`} />
              <p className={`text-sm font-medium font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>Start typing to search across your workspace</p>
            </div>
          ) : (
            <>
              {[
                { icon: FolderGit2, title: "ai-software-engineering-agent", type: "Repository", match: "ai, software, engineering" },
                { icon: FileCode2, title: "src/services/auth.ts", type: "File", match: "authentication service" },
                { icon: MessageSquare, title: "Auth flow discussion", type: "Conversation", match: "login, register, oauth" },
              ].map((r, i) => (
                <motion.div
                  key={r.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className={`flex items-center gap-4 rounded-xl border p-4 transition-colors cursor-pointer ${isDark ? "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]" : "border-slate-200 bg-white hover:bg-slate-50"}`}
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isDark ? "bg-violet-500/10" : "bg-violet-100"}`}>
                    <r.icon size={18} className="text-violet-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium font-[Inter] truncate ${isDark ? "text-white" : "text-slate-900"}`}>{r.title}</p>
                    <p className={`text-xs font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>{r.type}</p>
                  </div>
                  <span className={`text-xs font-[Inter] ${isDark ? "text-slate-600" : "text-slate-300"}`}>{r.match}</span>
                </motion.div>
              ))}
            </>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
