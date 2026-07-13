import { useState } from "react";
import { motion } from "framer-motion";
import {
  Sun,
  Moon,
  Key,
  Bell,
  Trash2,
  Download,
  Cpu,
  Thermometer,
  ChevronDown,
  ChevronUp,
  Check,
  Eye,
  EyeOff,
  Shield,
  Database,
  Zap,
} from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useTheme } from "@/context/ThemeContext";

const providers = [
  { id: "gemini", name: "Google Gemini", model: "gemini-2.5-flash", color: "from-blue-500 to-cyan-500" },
  { id: "openai", name: "OpenAI", model: "gpt-4.1-mini", color: "from-emerald-500 to-teal-500" },
  { id: "groq", name: "Groq", model: "llama-3.3-70b-versatile", color: "from-orange-500 to-amber-500" },
  { id: "openrouter", name: "OpenRouter", model: "meta-llama/llama-3.3-70b-instruct", color: "from-violet-500 to-purple-500" },
];

const models = [
  { id: "gemini-2.5-flash", provider: "Gemini", label: "Gemini 2.5 Flash" },
  { id: "gpt-4.1-mini", provider: "OpenAI", label: "GPT-4.1 Mini" },
  { id: "llama-3.3-70b-versatile", provider: "Groq", label: "Llama 3.3 70B (Groq)" },
  { id: "meta-llama/llama-3.3-70b-instruct", provider: "OpenRouter", label: "Llama 3.3 70B (OpenRouter)" },
];

interface SettingsSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function SettingsSection({ title, icon, children, defaultOpen = true }: SettingsSectionProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`rounded-2xl border shadow-sm overflow-hidden ${
      isDark ? "border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02]" : "border-slate-200 bg-white"
    }`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex w-full items-center justify-between p-5 text-left transition-colors ${
          isDark ? "hover:bg-white/[0.02]" : "hover:bg-slate-50/80"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${
            isDark ? "bg-violet-500/15" : "bg-violet-50"
          }`}>
            {icon}
          </div>
          <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{title}</h2>
        </div>
        {open ? <ChevronUp size={18} className={isDark ? "text-slate-500" : "text-slate-400"} /> : <ChevronDown size={18} className={isDark ? "text-slate-500" : "text-slate-400"} />}
      </button>
      {open && (
        <div className={`border-t px-5 pb-5 pt-4 ${isDark ? "border-white/10" : "border-slate-100"}`}>
          {children}
        </div>
      )}
    </div>
  );
}

function Toggle({ enabled, onChange, label, description }: { enabled: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>{label}</p>
        {description && <p className={`mt-0.5 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`relative h-6 w-11 rounded-full transition-colors ${enabled ? "bg-violet-500" : isDark ? "bg-white/10" : "bg-slate-200"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${enabled ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}

function ApiKeyInput({ provider, saved, onSave }: { provider: typeof providers[0]; saved: boolean; onSave: (key: string) => void }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [key, setKey] = useState("");
  const [show, setShow] = useState(false);

  return (
    <div className={`rounded-xl border p-4 ${
      isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-100 bg-slate-50/80"
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`h-2 w-2 rounded-full ${saved ? "bg-emerald-400" : "bg-slate-400"}`} />
          <div>
            <p className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>{provider.name}</p>
            <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>{provider.model}</p>
          </div>
        </div>
        {saved && <Check size={14} className="text-emerald-500" />}
      </div>
      <div className="mt-3 flex gap-2">
        <div className="relative flex-1">
          <input
            type={show ? "text" : "password"}
            placeholder={`Enter ${provider.name} API key...`}
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className={`w-full rounded-lg border py-2 pl-3 pr-9 text-xs outline-none transition-colors ${
              isDark
                ? "border-white/10 bg-white/5 text-white placeholder:text-slate-600 focus:border-violet-500"
                : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-violet-500"
            }`}
          />
          <button type="button" onClick={() => setShow(!show)} className={`absolute right-2.5 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        <button
          type="button"
          onClick={() => { onSave(key); setKey(""); }}
          disabled={!key.trim()}
          className="rounded-lg bg-violet-600 px-4 py-2 text-xs font-medium text-white transition-all hover:bg-violet-500 disabled:opacity-40"
        >
          Save
        </button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const [defaultModel, setDefaultModel] = useState("gemini-2.5-flash");
  const [temperature, setTemperature] = useState(0.3);
  const [savedKeys, setSavedKeys] = useState<Record<string, boolean>>({});
  const [notifications, setNotifications] = useState({
    aiResults: true,
    repoUpdates: true,
    weeklyDigest: false,
    securityAlerts: true,
  });

  const handleSaveKey = (providerId: string) => {
    setSavedKeys((prev) => ({ ...prev, [providerId]: true }));
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Settings</h1>
          <p className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Configure your AI agent, preferences, and integrations
          </p>
        </motion.div>

        {/* Appearance */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <SettingsSection title="Appearance" icon={<Sun size={18} className="text-violet-500" />}>
            <div className="space-y-1">
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>Theme</p>
                  <p className={`mt-0.5 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>Switch between dark and light mode</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { if (isDark) toggleTheme(); }}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-all ${
                      !isDark ? "bg-violet-600 text-white shadow-sm" : isDark ? "border border-white/10 text-slate-400 hover:bg-white/5" : "border border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <Sun size={14} /> Light
                  </button>
                  <button
                    type="button"
                    onClick={() => { if (!isDark) toggleTheme(); }}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-all ${
                      isDark ? "bg-violet-600 text-white shadow-sm" : "border border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <Moon size={14} /> Dark
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>Accent Color</p>
                  <p className={`mt-0.5 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>Primary color for UI elements</p>
                </div>
                <div className="flex gap-2">
                  {["bg-violet-500", "bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500"].map((c) => (
                    <button key={c} type="button" className={`h-6 w-6 rounded-full ${c} ring-2 ring-offset-2 transition-all ${isDark ? "ring-offset-slate-900" : "ring-offset-white"} ${c === "bg-violet-500" ? "ring-white" : "ring-transparent hover:ring-white/50"}`} />
                  ))}
                </div>
              </div>
            </div>
          </SettingsSection>
        </motion.div>

        {/* AI Providers */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <SettingsSection title="AI Providers" icon={<Key size={18} className="text-violet-500" />}>
            <p className={`mb-4 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
              API keys are stored locally in your browser. They are never sent to our servers.
            </p>
            <div className="space-y-3">
              {providers.map((p) => (
                <ApiKeyInput key={p.id} provider={p} saved={!!savedKeys[p.id]} onSave={() => handleSaveKey(p.id)} />
              ))}
            </div>
          </SettingsSection>
        </motion.div>

        {/* AI Model */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <SettingsSection title="AI Model" icon={<Cpu size={18} className="text-violet-500" />}>
            <div className="space-y-4">
              <div>
                <label className={`mb-1.5 block text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>Default Model</label>
                <select
                  value={defaultModel}
                  onChange={(e) => setDefaultModel(e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors ${
                    isDark
                      ? "border-white/10 bg-white/5 text-white focus:border-violet-500"
                      : "border-slate-200 bg-white text-slate-900 focus:border-violet-500"
                  }`}
                >
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>{m.label} ({m.provider})</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>Temperature</label>
                  <span className={`rounded-md px-2 py-0.5 text-xs font-mono ${isDark ? "bg-white/10 text-slate-300" : "bg-slate-100 text-slate-600"}`}>{temperature.toFixed(1)}</span>
                </div>
                <p className={`mt-0.5 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>Lower = more focused, Higher = more creative</p>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="mt-2 w-full accent-violet-500"
                />
                <div className="flex justify-between text-[10px]">
                  <span className={isDark ? "text-slate-600" : "text-slate-400"}>Precise</span>
                  <span className={isDark ? "text-slate-600" : "text-slate-400"}>Creative</span>
                </div>
              </div>
              <div>
                <label className={`mb-1.5 block text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>Retry Strategy</label>
                <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  The agent automatically tries fallback providers in order: Gemini → OpenAI → Groq → OpenRouter with exponential backoff.
                </p>
              </div>
            </div>
          </SettingsSection>
        </motion.div>

        {/* Notifications */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <SettingsSection title="Notifications" icon={<Bell size={18} className="text-violet-500" />} defaultOpen={false}>
            <div className="divide-y divide-white/5">
              <Toggle
                enabled={notifications.aiResults}
                onChange={(v) => setNotifications((p) => ({ ...p, aiResults: v }))}
                label="AI Results"
                description="Get notified when AI analysis completes"
              />
              <Toggle
                enabled={notifications.repoUpdates}
                onChange={(v) => setNotifications((p) => ({ ...p, repoUpdates: v }))}
                label="Repository Updates"
                description="Notifications for new repository indexing"
              />
              <Toggle
                enabled={notifications.weeklyDigest}
                onChange={(v) => setNotifications((p) => ({ ...p, weeklyDigest: v }))}
                label="Weekly Digest"
                description="Receive a weekly summary of your activity"
              />
              <Toggle
                enabled={notifications.securityAlerts}
                onChange={(v) => setNotifications((p) => ({ ...p, securityAlerts: v }))}
                label="Security Alerts"
                description="Critical security findings from code scans"
              />
            </div>
          </SettingsSection>
        </motion.div>

        {/* Data & Privacy */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <SettingsSection title="Data & Privacy" icon={<Shield size={18} className="text-violet-500" />} defaultOpen={false}>
            <div className="space-y-3">
              <div className={`rounded-xl border p-4 ${isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-100 bg-slate-50/80"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Download size={16} className="text-blue-500" />
                    <div>
                      <p className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>Export All Data</p>
                      <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>Download your repositories, chats, and settings as JSON</p>
                    </div>
                  </div>
                  <button type="button" className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5">
                    Export
                  </button>
                </div>
              </div>
              <div className={`rounded-xl border p-4 ${isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-100 bg-slate-50/80"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Database size={16} className="text-amber-500" />
                    <div>
                      <p className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>Cache & Local Data</p>
                      <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>Clear cached AI responses and local repository data</p>
                    </div>
                  </div>
                  <button type="button" className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5">
                    Clear
                  </button>
                </div>
              </div>
              <div className={`rounded-xl border p-4 ${isDark ? "border-red-500/10 bg-red-500/5" : "border-red-100 bg-red-50/80"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Trash2 size={16} className="text-red-500" />
                    <div>
                      <p className="text-sm font-medium text-red-600">Delete All Data</p>
                      <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>Permanently remove all repositories, history, and settings</p>
                    </div>
                  </div>
                  <button type="button" className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-500/20 dark:text-red-400 dark:hover:bg-red-500/10">
                    Delete All
                  </button>
                </div>
              </div>
            </div>
          </SettingsSection>
        </motion.div>

        {/* About */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className={`flex items-center justify-between rounded-2xl border p-5 ${
            isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-200 bg-white"
          }`}>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600">
                <Zap size={18} className="text-white" />
              </div>
              <div>
                <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>AI Software Engineering Agent</p>
                <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>Version 1.0.0 · Built with LangGraph + React</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
