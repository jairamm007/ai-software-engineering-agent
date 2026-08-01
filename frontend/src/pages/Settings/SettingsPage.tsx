import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Bell, Trash2, Download, Cpu, Thermometer, ChevronDown, ChevronUp, Check, Shield, Database, Zap, X, Palette, Bot, Sparkles } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/layouts/DashboardLayout";
import api from "@/lib/axios";
import { LoadingIndicator } from "@/components/LoadingIndicator";

const accentColors = [
  { id: "violet" as const, color: "bg-violet-500", ring: "ring-violet-500" },
  { id: "blue" as const, color: "bg-blue-500", ring: "ring-blue-500" },
  { id: "emerald" as const, color: "bg-emerald-500", ring: "ring-emerald-500" },
  { id: "amber" as const, color: "bg-amber-500", ring: "ring-amber-500" },
  { id: "rose" as const, color: "bg-rose-500", ring: "ring-rose-500" },
];

const providers = [
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "Google", speed: "Fast", color: "from-blue-500 to-cyan-500" },
  { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B", provider: "Groq", speed: "Very Fast", color: "from-orange-500 to-amber-500" },
  { id: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B", provider: "OpenRouter", speed: "Fast", color: "from-violet-500 to-purple-500" },
  { id: "gpt-4.1-mini", name: "GPT-4.1 Mini", provider: "OpenAI", speed: "Fast", color: "from-emerald-500 to-teal-500" },
  { id: "llama-3.3-70b", name: "Llama 3.3 70B", provider: "Cerebras", speed: "Ultra Fast", color: "from-cyan-500 to-sky-500" },
  { id: "meta-llama/Llama-3-70b-chat-hf", name: "Llama 3 70B", provider: "Together", speed: "Fast", color: "from-pink-500 to-rose-500" },
  { id: "mistral-large-latest", name: "Mistral Large", provider: "Mistral", speed: "Fast", color: "from-amber-500 to-yellow-500" },
];

const speedColors: Record<string, string> = {
  "Ultra Fast": "bg-emerald-400",
  "Very Fast": "bg-emerald-400",
  "Fast": "bg-sky-400",
  "Medium": "bg-amber-400",
  "Slow": "bg-red-400",
};

interface Preferences {
  defaultModel: string;
  temperature: number;
  theme: string;
  accentColor: string;
}

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
    <div
      className={`rounded-2xl border shadow-sm overflow-hidden transition-colors ${
        isDark
          ? "border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02]"
          : "border-slate-200 bg-white"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex w-full items-center justify-between p-5 text-left transition-colors ${
          isDark ? "hover:bg-white/[0.02]" : "hover:bg-slate-50/80"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ backgroundColor: "var(--accent-light)" }}
          >
            {icon}
          </div>
          <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
            {title}
          </h2>
        </div>
        {open ? (
          <ChevronUp
            size={18}
            className={isDark ? "text-slate-500" : "text-slate-400"}
          />
        ) : (
          <ChevronDown
            size={18}
            className={isDark ? "text-slate-500" : "text-slate-400"}
          />
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <div
              className={`border-t px-5 pb-5 pt-4 ${
                isDark ? "border-white/10" : "border-slate-100"
              }`}
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Toggle({
  enabled,
  onChange,
  label,
  description,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>
          {label}
        </p>
        {description && (
          <p className={`mt-0.5 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            {description}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className="relative h-6 w-11 rounded-full transition-colors"
        style={{
          backgroundColor: enabled
            ? "var(--accent)"
            : isDark
              ? "rgba(255,255,255,0.1)"
              : "#e2e8f0",
        }}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            enabled ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  danger,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onCancel}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full max-w-md rounded-2xl border p-6 shadow-2xl ${
              isDark ? "border-white/10 bg-slate-900" : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  danger ? "bg-red-500/15" : "accent-bg-light"
                }`}
              >
                {danger ? (
                  <Trash2 size={18} className="text-red-500" />
                ) : (
                  <Shield size={18} className="accent-text-base" />
                )}
              </div>
              <div className="flex-1">
                <h3
                  className={`text-lg font-bold ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {title}
                </h3>
                <p
                  className={`mt-2 text-sm ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  {message}
                </p>
              </div>
              <button
                type="button"
                onClick={onCancel}
                className={`shrink-0 rounded-lg p-1 transition-colors ${
                  isDark ? "text-slate-400 hover:bg-white/5" : "text-slate-400 hover:bg-slate-100"
                }`}
              >
                <X size={16} />
              </button>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isDark ? "text-slate-300 hover:bg-white/5" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${
                  danger ? "bg-red-600 hover:bg-red-500" : ""
                }`}
                style={!danger ? { backgroundColor: "var(--accent)" } : undefined}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function SettingsPage() {
  const { theme, toggleTheme, accent, setAccent } = useTheme();
  const isDark = theme === "dark";
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [defaultModel, setDefaultModel] = useState("gemini-2.5-flash");
  const [temperature, setTemperature] = useState(0.3);
  const [notifications, setNotifications] = useState({
    aiResults: true,
    repoUpdates: true,
    weeklyDigest: false,
    securityAlerts: true,
  });
  const [exporting, setExporting] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: prefs } = useQuery<Preferences>({
    queryKey: ["userPreferences"],
    queryFn: async () => {
      const { data } = await api.get("/user/preferences");
      return data;
    },
  });

  const savePrefsMutation = useMutation({
    mutationFn: async (updates: Partial<Preferences>) => {
      const { data } = await api.put("/user/preferences", updates);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userPreferences"] });
    },
  });

  useEffect(() => {
    if (prefs) {
      if (prefs.defaultModel) setDefaultModel(prefs.defaultModel);
      if (prefs.temperature != null) setTemperature(prefs.temperature);
      if (prefs.theme && prefs.theme !== theme) toggleTheme();
      if (prefs.accentColor && prefs.accentColor !== accent) {
        setAccent(prefs.accentColor as typeof accent);
      }
    }
  }, [prefs]);

  const handleModelChange = (modelId: string) => {
    setDefaultModel(modelId);
    savePrefsMutation.mutate({ defaultModel: modelId });
  };

  const handleTemperatureChange = (value: number) => {
    setTemperature(value);
    savePrefsMutation.mutate({ temperature: value });
  };

  const handleThemeChange = (newTheme: "light" | "dark") => {
    if ((isDark && newTheme === "dark") || (!isDark && newTheme === "light")) return;
    toggleTheme();
    savePrefsMutation.mutate({ theme: newTheme });
  };

  const handleAccentChange = (newAccent: typeof accent) => {
    setAccent(newAccent);
    savePrefsMutation.mutate({ accentColor: newAccent });
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const { data } = await api.get("/user/export");
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `asea-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // export failed silently
    } finally {
      setExporting(false);
    }
  };

  const handleClearCache = async () => {
    setClearing(true);
    try {
      await api.post("/user/clear-cache");
      const keysToKeep = ["theme", "accent", "sidebar-mode"];
      const allKeys = Object.keys(localStorage);
      for (const key of allKeys) {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      }
    } catch {
      // clear failed silently
    } finally {
      setClearing(false);
    }
  };

  const handleDeleteAll = async () => {
    setDeleting(true);
    try {
      await api.delete("/user/account");
      await logout();
      navigate("/login", { replace: true });
    } catch {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6 pb-12">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <h1
            className={`text-2xl font-bold sm:text-3xl font-[Outfit] ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Settings
          </h1>
          <p
            className={`mt-1 text-sm font-[Inter] ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Configure your AI agent, preferences, and integrations
          </p>
        </motion.div>

        {/* Appearance */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <SettingsSection title="Appearance" icon={<Sun size={18} style={{ color: "var(--accent)" }} />}>
            <div className="space-y-1">
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                    Theme
                  </p>
                  <p className={`mt-0.5 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    Switch between dark and light mode
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleThemeChange("light")}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-all ${
                      !isDark
                        ? "text-white shadow-sm"
                        : isDark
                          ? "border border-white/10 text-slate-400 hover:bg-white/5"
                          : "border border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                    style={!isDark ? { backgroundColor: "var(--accent)" } : undefined}
                  >
                    <Sun size={14} /> Light
                  </button>
                  <button
                    type="button"
                    onClick={() => handleThemeChange("dark")}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition-all ${
                      isDark
                        ? "text-white shadow-sm"
                        : "border border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                    style={isDark ? { backgroundColor: "var(--accent)" } : undefined}
                  >
                    <Moon size={14} /> Dark
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                    Accent Color
                  </p>
                  <p className={`mt-0.5 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    Primary color for UI elements
                  </p>
                </div>
                <div className="flex gap-2">
                  {accentColors.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleAccentChange(c.id)}
                      className={`h-7 w-7 rounded-full ${c.color} ring-2 ring-offset-2 transition-all ${
                        isDark ? "ring-offset-slate-900" : "ring-offset-white"
                      } ${
                        accent === c.id
                          ? "ring-white scale-110"
                          : "ring-transparent hover:ring-white/50"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </SettingsSection>
        </motion.div>

        {/* AI Model */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <SettingsSection
            title="AI Model"
            icon={<Cpu size={18} style={{ color: "var(--accent)" }} />}
          >
            <div className="space-y-5">
              {/* Model selection */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={14} className={isDark ? "text-slate-500" : "text-slate-400"} />
                  <label className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                    Default Model
                  </label>
                  {savePrefsMutation.isPending && (
                    <LoadingIndicator size="sm" />
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {providers.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleModelChange(p.id)}
                      className={`relative rounded-xl border p-4 text-left transition-all ${
                        defaultModel === p.id
                          ? isDark
                            ? "border-white/20 bg-white/[0.08] shadow-lg"
                            : "border-slate-200 bg-white shadow-md"
                          : isDark
                            ? "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
                            : "border-slate-100 bg-slate-50/80 hover:bg-slate-50"
                      }`}
                    >
                      {defaultModel === p.id && (
                        <div className="absolute right-3 top-3">
                          <Check size={14} style={{ color: "var(--accent)" }} />
                        </div>
                      )}
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${p.color} text-sm text-white shadow-sm`}
                      >
                        <Bot size={16} />
                      </div>
                      <p className={`mt-3 text-sm font-semibold font-[Outfit] ${isDark ? "text-white" : "text-slate-900"}`}>
                        {p.name}
                      </p>
                      <p className={`mt-0.5 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                        {p.provider}
                      </p>
                      <div className="mt-2 flex items-center gap-1.5">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            speedColors[p.speed] || "bg-slate-400"
                          }`}
                        />
                        <span
                          className={`text-[10px] font-medium ${
                            isDark ? "text-slate-500" : "text-slate-400"
                          }`}
                        >
                          {p.speed}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Temperature */}
              <div className={`rounded-xl border p-4 ${isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-100 bg-slate-50/80"}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Thermometer size={14} className={isDark ? "text-slate-500" : "text-slate-400"} />
                    <label className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                      Temperature
                    </label>
                    {savePrefsMutation.isPending && (
                      <LoadingIndicator size="sm" />
                    )}
                  </div>
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-mono ${
                      isDark ? "bg-white/10 text-slate-300" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {temperature.toFixed(1)}
                  </span>
                </div>
                <p className={`mt-0.5 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  Lower = more focused, Higher = more creative
                </p>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => handleTemperatureChange(parseFloat(e.target.value))}
                  className="mt-3 w-full accent-[var(--accent)]"
                />
                <div className="flex justify-between text-[10px]">
                  <span className={isDark ? "text-slate-600" : "text-slate-400"}>Precise</span>
                  <span className={isDark ? "text-slate-600" : "text-slate-400"}>Balanced</span>
                  <span className={isDark ? "text-slate-600" : "text-slate-400"}>Creative</span>
                </div>
              </div>

              {/* Retry Strategy */}
              <div className={`rounded-xl border p-4 ${isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-100 bg-slate-50/80"}`}>
                <div className="flex items-center gap-2">
                  <Palette size={14} className={isDark ? "text-slate-500" : "text-slate-400"} />
                  <label className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                    Retry Strategy
                  </label>
                </div>
                <p className={`mt-2 text-xs leading-relaxed ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  The agent automatically tries fallback providers in order with exponential backoff when a model fails.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {["Gemini", "Groq", "OpenAI", "OpenRouter", "Cerebras", "Together", "Mistral"].map(
                    (name, i, arr) => (
                      <span key={name} className="flex items-center gap-1">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${
                            isDark ? "bg-white/10 text-slate-300" : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {name}
                        </span>
                        {i < arr.length - 1 && (
                          <span className={`text-[10px] ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                            →
                          </span>
                        )}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          </SettingsSection>
        </motion.div>

        {/* Notifications */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <SettingsSection
            title="Notifications"
            icon={<Bell size={18} style={{ color: "var(--accent)" }} />}
            defaultOpen={false}
          >
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
          <SettingsSection
            title="Data & Privacy"
            icon={<Shield size={18} style={{ color: "var(--accent)" }} />}
            defaultOpen={false}
          >
            <div className="space-y-3">
              {/* Export */}
              <div
                className={`rounded-xl border p-4 ${
                  isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-100 bg-slate-50/80"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Download size={16} className="text-blue-500" />
                    <div>
                      <p className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                        Export All Data
                      </p>
                      <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                        Download your repositories, chats, and settings as JSON
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleExport}
                    disabled={exporting}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5 disabled:opacity-50"
                  >
                    {exporting ? (
                      <LoadingIndicator size="sm" />
                    ) : (
                      <Download size={12} />
                    )}
                    {exporting ? "Exporting..." : "Export"}
                  </button>
                </div>
              </div>

              {/* Clear Cache */}
              <div
                className={`rounded-xl border p-4 ${
                  isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-100 bg-slate-50/80"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Database size={16} className="text-amber-500" />
                    <div>
                      <p className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                        Cache & Local Data
                      </p>
                      <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                        Clear cached AI responses and local repository data
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearCache}
                    disabled={clearing}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5 disabled:opacity-50"
                  >
                    {clearing ? (
                      <LoadingIndicator size="sm" />
                    ) : (
                      <Database size={12} />
                    )}
                    {clearing ? "Clearing..." : "Clear"}
                  </button>
                </div>
              </div>

              {/* Delete All */}
              <div
                className={`rounded-xl border p-4 ${
                  isDark ? "border-red-500/10 bg-red-500/5" : "border-red-100 bg-red-50/80"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Trash2 size={16} className="text-red-500" />
                    <div>
                      <p className="text-sm font-medium text-red-600">Delete All Data</p>
                      <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                        Permanently remove all repositories, history, and settings
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={deleting}
                    className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-500/20 dark:text-red-400 dark:hover:bg-red-500/10 disabled:opacity-50"
                  >
                    {deleting ? (
                      <LoadingIndicator size="sm" />
                    ) : (
                      <Trash2 size={12} />
                    )}
                    {deleting ? "Deleting..." : "Delete All"}
                  </button>
                </div>
              </div>
            </div>
          </SettingsSection>
        </motion.div>

        {/* About */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <SettingsSection
            title="About"
            icon={<Zap size={18} style={{ color: "var(--accent)" }} />}
            defaultOpen={false}
          >
            <div
              className={`flex items-center justify-between rounded-xl border p-4 ${
                isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-100 bg-slate-50/80"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl accent-gradient">
                  <Zap size={20} className="text-white" />
                </div>
                <div>
                  <p className={`text-sm font-semibold font-[Outfit] ${isDark ? "text-white" : "text-slate-900"}`}>
                    AI Software Engineering Agent
                  </p>
                  <p className={`text-xs font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    Version 1.0.0 · Built with LangGraph + React
                  </p>
                </div>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${
                  isDark ? "bg-emerald-500/15 text-emerald-400" : "bg-emerald-50 text-emerald-600"
                }`}
              >
                Active
              </span>
            </div>
          </SettingsSection>
        </motion.div>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete All Data"
        message="This will permanently delete all your repositories, chat history, and settings. This action cannot be undone."
        confirmLabel={deleting ? "Deleting..." : "Delete Everything"}
        onConfirm={handleDeleteAll}
        onCancel={() => setShowDeleteConfirm(false)}
        danger
      />
    </DashboardLayout>
  );
}
