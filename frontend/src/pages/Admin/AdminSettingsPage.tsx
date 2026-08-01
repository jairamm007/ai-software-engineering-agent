import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Palette, Mail, Bot, AlertTriangle, Save, Database, Shield, ChevronRight } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { toast } from "sonner";
import { getSystemSettings, updateSystemSettings } from "@/services/admin";
import { LoadingIndicator } from "@/components/LoadingIndicator";

interface SettingsSection {
  key: string;
  label: string;
  icon: React.ElementType;
  description: string;
}

const sections: SettingsSection[] = [
  { key: "general", label: "General", icon: Globe, description: "Basic platform configuration" },
  { key: "appearance", label: "Appearance", icon: Palette, description: "Customize the look and feel" },
  { key: "email", label: "Email", icon: Mail, description: "Email notifications and SMTP" },
  { key: "ai", label: "AI Providers", icon: Bot, description: "Select and configure AI providers" },
  { key: "maintenance", label: "Maintenance", icon: AlertTriangle, description: "Control platform availability" },
  { key: "backup", label: "Backup", icon: Database, description: "Configure automatic backups" },
];

const defaults: Record<string, string> = {
  siteName: "AI Engineering Agent",
  siteDescription: "AI-powered code analysis and collaboration platform",
  allowSignups: "true",
  requireEmailVerification: "true",
  accentColor: "violet",
  aiProvider: "groq",
  maintenanceMode: "false",
  maintenanceMessage: "We are currently performing scheduled maintenance. Please check back later.",
  emailNotifications: "true",
  backupFrequency: "daily",
  maxUploadSize: "50",
};

export default function AdminSettingsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [activeSection, setActiveSection] = useState("general");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Record<string, string>>(defaults);

  useEffect(() => {
    getSystemSettings()
      .then((data) => {
        setSettings((prev) => ({ ...prev, ...data }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSystemSettings(settings);
      toast.success("Settings saved successfully");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [key]: String(value) }));
  };

  const cardClass = isDark ? "border-white/[0.06] bg-[#111118]" : "border-slate-200 bg-white";
  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textSecondary = isDark ? "text-slate-400" : "text-slate-500";
  const textMuted = isDark ? "text-slate-500" : "text-slate-400";
  const inputClass = `w-full rounded-xl border py-2.5 px-4 text-[13px] outline-none transition-all ${
    isDark
      ? "border-white/[0.06] bg-[#0a0a0f] text-white placeholder:text-slate-600 focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20"
      : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/20"
  }`;
  const labelClass = `mb-2 block text-[13px] font-medium ${textSecondary}`;

  function Toggle({ value, onChange, accentClass }: { value: boolean; onChange: () => void; accentClass?: string }) {
    const onColor = accentClass || "bg-gradient-to-r from-rose-500 to-orange-500";
    return (
      <button
        type="button"
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${
          value ? onColor : isDark ? "bg-white/[0.1]" : "bg-slate-200"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ${
            value ? "translate-x-[22px]" : "translate-x-[2px]"
          }`}
        />
      </button>
    );
  }

  function SettingRow({
    title,
    description,
    children,
    className,
  }: {
    title: string;
    description: string;
    children: React.ReactNode;
    className?: string;
  }) {
    return (
      <div className={`flex items-center justify-between rounded-xl border p-4 ${isDark ? "border-white/[0.06] bg-[#0a0a0f]" : "border-slate-200 bg-slate-50"} ${className || ""}`}>
        <div className="mr-4">
          <p className={`text-[13px] font-medium ${textPrimary}`}>{title}</p>
          <p className={`mt-0.5 text-[12px] ${textMuted}`}>{description}</p>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${textPrimary}`}>System Settings</h1>
          <p className={`mt-1 text-[13px] ${textSecondary}`}>Configure platform-wide options</p>
        </div>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-5 py-2.5 text-[13px] font-medium text-white shadow-lg shadow-rose-500/20 transition-all hover:shadow-rose-500/30 disabled:opacity-50"
        >
          {saving ? <LoadingIndicator size="sm" /> : <Save size={14} />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Sidebar Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-2xl border p-2 ${cardClass}`}
        >
          <nav className="space-y-0.5">
            {sections.map((s) => {
              const active = activeSection === s.key;
              const Icon = s.icon;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setActiveSection(s.key)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
                    active
                      ? isDark
                        ? "bg-gradient-to-r from-rose-500/10 to-orange-500/10 text-white"
                        : "bg-gradient-to-r from-rose-50 to-orange-50 text-slate-900"
                      : isDark
                        ? "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      active
                        ? "bg-gradient-to-br from-rose-500 to-orange-500 text-white"
                        : isDark
                          ? "bg-white/[0.06] text-slate-500"
                          : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    <Icon size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[13px] font-medium">{s.label}</span>
                    <span className={`block text-[11px] ${textMuted}`}>{s.description}</span>
                  </div>
                  <ChevronRight size={14} className={`shrink-0 transition-transform ${active ? "rotate-90 opacity-100" : "opacity-0"} ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                </button>
              );
            })}
          </nav>
        </motion.div>

        {/* Content Area */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={`rounded-2xl border p-6 ${cardClass}`}
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <LoadingIndicator size="sm" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
              >
                {/* General */}
                {activeSection === "general" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className={`text-[15px] font-semibold ${textPrimary}`}>General Settings</h3>
                      <p className={`mt-1 text-[13px] ${textMuted}`}>Basic platform configuration</p>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className={labelClass}>Site Name</label>
                        <input type="text" value={settings.siteName} onChange={(e) => updateSetting("siteName", e.target.value)} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Site Description</label>
                        <textarea value={settings.siteDescription} onChange={(e) => updateSetting("siteDescription", e.target.value)} rows={3} className={inputClass} />
                      </div>
                      <SettingRow
                        title="Allow New Signups"
                        description="Allow new users to register accounts"
                      >
                        <Toggle value={settings.allowSignups === "true"} onChange={() => updateSetting("allowSignups", settings.allowSignups !== "true")} />
                      </SettingRow>
                      <SettingRow
                        title="Require Email Verification"
                        description="Users must verify email before accessing the platform"
                      >
                        <Toggle value={settings.requireEmailVerification === "true"} onChange={() => updateSetting("requireEmailVerification", settings.requireEmailVerification !== "true")} />
                      </SettingRow>
                    </div>
                  </div>
                )}

                {/* Appearance */}
                {activeSection === "appearance" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className={`text-[15px] font-semibold ${textPrimary}`}>Appearance</h3>
                      <p className={`mt-1 text-[13px] ${textMuted}`}>Customize the look and feel</p>
                    </div>
                    <div>
                      <label className={labelClass}>Accent Color</label>
                      <div className="mt-2 flex gap-3">
                        {[
                          { name: "violet", color: "#8b5cf6" },
                          { name: "blue", color: "#3b82f6" },
                          { name: "emerald", color: "#10b981" },
                          { name: "rose", color: "#f43f5e" },
                          { name: "amber", color: "#f59e0b" },
                          { name: "cyan", color: "#06b6d4" },
                        ].map((c) => (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => updateSetting("accentColor", c.name)}
                            className={`relative h-10 w-10 rounded-xl transition-all ${
                              settings.accentColor === c.name
                                ? "scale-110 ring-2 ring-white ring-offset-2 ring-offset-[#111118] shadow-lg"
                                : "hover:scale-105"
                            }`}
                            style={{ backgroundColor: c.color }}
                          >
                            {settings.accentColor === c.name && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Default Theme</label>
                      <div className="mt-2 grid grid-cols-2 gap-3">
                        {(["dark", "light"] as const).map((t) => (
                          <button
                            key={t}
                            type="button"
                            className={`flex items-center justify-center gap-2 rounded-xl border p-4 text-[13px] font-medium transition-all ${
                              theme === t
                                ? "border-rose-500/50 bg-rose-500/10 text-rose-500"
                                : isDark
                                  ? "border-white/[0.06] bg-[#0a0a0f] text-slate-400 hover:bg-white/[0.04]"
                                  : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            <div className={`h-5 w-5 rounded-md ${t === "dark" ? "bg-slate-800 border border-white/10" : "bg-white border border-slate-200"}`} />
                            {t === "dark" ? "Dark" : "Light"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Email */}
                {activeSection === "email" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className={`text-[15px] font-semibold ${textPrimary}`}>Email Settings</h3>
                      <p className={`mt-1 text-[13px] ${textMuted}`}>Configure email notifications and SMTP</p>
                    </div>
                    <SettingRow
                      title="Email Notifications"
                      description="Send email notifications for important events"
                    >
                      <Toggle value={settings.emailNotifications === "true"} onChange={() => updateSetting("emailNotifications", settings.emailNotifications !== "true")} />
                    </SettingRow>
                    <div className={`rounded-xl border p-5 ${isDark ? "border-white/[0.06] bg-[#0a0a0f]" : "border-slate-200 bg-slate-50"}`}>
                      <div className="mb-4 flex items-center gap-2.5">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-orange-500 text-white`}>
                          <Mail size={14} />
                        </div>
                        <p className={`text-[13px] font-semibold ${textPrimary}`}>SMTP Configuration</p>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className={labelClass}>SMTP Host</label>
                          <input type="text" placeholder="smtp.example.com" className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>SMTP Port</label>
                          <input type="text" placeholder="587" className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Username</label>
                          <input type="text" placeholder="user@example.com" className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Password</label>
                          <input type="password" placeholder="••••••••" className={inputClass} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Providers */}
                {activeSection === "ai" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className={`text-[15px] font-semibold ${textPrimary}`}>AI Provider Settings</h3>
                      <p className={`mt-1 text-[13px] ${textMuted}`}>Select and configure AI providers</p>
                    </div>
                    <div>
                      <label className={labelClass}>Primary AI Provider</label>
                      <select value={settings.aiProvider} onChange={(e) => updateSetting("aiProvider", e.target.value)} className={inputClass}>
                        <option value="groq">Groq (Llama 3.3) - Free</option>
                        <option value="cerebras">Cerebras (Llama 3.3) - Free</option>
                        <option value="gemini">Google Gemini 2.0 - Free</option>
                        <option value="openai">OpenAI GPT-4o Mini - Paid</option>
                        <option value="together">Together AI - Paid</option>
                        <option value="openrouter">OpenRouter - Paid</option>
                      </select>
                    </div>
                    <div className={`rounded-xl border p-4 ${isDark ? "border-emerald-500/20 bg-emerald-500/5" : "border-emerald-200 bg-emerald-50"}`}>
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
                          <Bot size={14} className="text-emerald-500" />
                        </div>
                        <div>
                          <p className={`text-[13px] font-medium ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>
                            Multi-provider fallback is active
                          </p>
                          <p className={`text-[12px] ${isDark ? "text-emerald-400/60" : "text-emerald-600/80"}`}>
                            If the primary provider fails, requests automatically fall back to the next available provider.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Maintenance */}
                {activeSection === "maintenance" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className={`text-[15px] font-semibold ${textPrimary}`}>Maintenance Mode</h3>
                      <p className={`mt-1 text-[13px] ${textMuted}`}>Control platform availability</p>
                    </div>
                    <div
                      className={`rounded-xl border p-4 ${
                        settings.maintenanceMode === "true"
                          ? isDark
                            ? "border-amber-500/20 bg-amber-500/5"
                            : "border-amber-200 bg-amber-50"
                          : isDark
                            ? "border-white/[0.06] bg-[#0a0a0f]"
                            : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                              settings.maintenanceMode === "true" ? "bg-amber-500/20" : isDark ? "bg-white/[0.06]" : "bg-slate-100"
                            }`}
                          >
                            <AlertTriangle size={18} className={settings.maintenanceMode === "true" ? "text-amber-500" : isDark ? "text-slate-400" : "text-slate-500"} />
                          </div>
                          <div>
                            <p className={`text-[13px] font-medium ${textPrimary}`}>Maintenance Mode</p>
                            <p className={`text-[12px] ${textMuted}`}>
                              {settings.maintenanceMode === "true" ? "Platform is in maintenance mode" : "Platform is live and accessible"}
                            </p>
                          </div>
                        </div>
                        <Toggle
                          value={settings.maintenanceMode === "true"}
                          onChange={() => updateSetting("maintenanceMode", settings.maintenanceMode !== "true")}
                          accentClass="bg-amber-500"
                        />
                      </div>
                    </div>
                    <AnimatePresence>
                      {settings.maintenanceMode === "true" && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                          <label className={labelClass}>Maintenance Message</label>
                          <textarea value={settings.maintenanceMessage} onChange={(e) => updateSetting("maintenanceMessage", e.target.value)} rows={3} className={inputClass} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Backup */}
                {activeSection === "backup" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className={`text-[15px] font-semibold ${textPrimary}`}>Backup Settings</h3>
                      <p className={`mt-1 text-[13px] ${textMuted}`}>Configure automatic backups</p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelClass}>Backup Frequency</label>
                        <select value={settings.backupFrequency} onChange={(e) => updateSetting("backupFrequency", e.target.value)} className={inputClass}>
                          <option value="hourly">Hourly</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Max Upload Size (MB)</label>
                        <input type="number" value={settings.maxUploadSize} onChange={(e) => updateSetting("maxUploadSize", e.target.value)} className={inputClass} />
                      </div>
                    </div>
                    <div className={`rounded-xl border p-5 ${isDark ? "border-white/[0.06] bg-[#0a0a0f]" : "border-slate-200 bg-slate-50"}`}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-orange-500 text-white">
                          <Database size={14} />
                        </div>
                        <div>
                          <p className={`text-[13px] font-semibold ${textPrimary}`}>Database Backup</p>
                          <p className={`text-[12px] ${textMuted}`}>Last backup: Never</p>
                        </div>
                      </div>
                      <p className={`mb-4 text-[13px] ${textMuted}`}>
                        Configure automated backups to protect your data.
                      </p>
                      <button
                        type="button"
                        className="flex items-center gap-2 rounded-xl border border-rose-500/30 px-4 py-2.5 text-[13px] font-medium text-rose-500 transition-all hover:bg-rose-500/5"
                      >
                        <Shield size={14} />
                        Create Manual Backup
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>
      </div>
    </div>
  );
}
