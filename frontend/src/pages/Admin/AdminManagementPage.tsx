import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Crown, Users, RefreshCw } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { toast } from "sonner";
import { listAdmins, type AdminAdmin } from "@/services/admin";

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function AdminManagementPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [admins, setAdmins] = useState<AdminAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const data = await listAdmins();
      setAdmins(data);
    } catch {
      toast.error("Failed to load admins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAdmins(); }, []);

  const activeAdmins = admins.filter((a) => !a.suspended).length;
  const suspendedAdmins = admins.filter((a) => a.suspended).length;

  const statCards = [
    { label: "Total Admins", value: admins.length, icon: Shield, gradient: "from-rose-500 to-orange-500" },
    { label: "Active", value: activeAdmins, icon: Users, gradient: "from-emerald-500 to-teal-500" },
    { label: "Suspended", value: suspendedAdmins, icon: Crown, gradient: "from-red-500 to-orange-600" },
  ];

  return (
    <motion.div className="space-y-6" variants={stagger} initial="hidden" animate="show">
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white">
            <Shield size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Admin Management</h1>
            <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Manage administrator accounts</p>
          </div>
        </div>
        <button onClick={() => void fetchAdmins()} className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${isDark ? "border-white/10 text-slate-300 hover:bg-white/5" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statCards.map((s) => (
          <div key={s.label} className={`relative overflow-hidden rounded-2xl border p-5 ${isDark ? "border-white/[0.06] bg-[#111118]" : "border-slate-200 bg-white"}`}>
            <div className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${s.gradient}`} />
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${s.gradient} text-white shadow-lg`}>
              <s.icon size={18} />
            </div>
            <p className={`mt-3 text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>{s.label}</p>
            <p className="mt-1 text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </motion.div>

      <motion.div variants={fadeUp} className={`rounded-2xl border ${isDark ? "border-white/[0.06] bg-[#111118]" : "border-slate-200 bg-white"}`}>
        <div className={`border-b px-6 py-4 ${isDark ? "border-white/[0.06]" : "border-slate-100"}`}>
          <h3 className="text-sm font-semibold">All Administrators</h3>
        </div>
        <div className="divide-y ${isDark ? 'divide-white/[0.06]' : 'divide-slate-100'}">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="px-6 py-4"><div className={`h-10 w-full animate-pulse rounded-lg ${isDark ? "bg-white/[0.06]" : "bg-slate-100"}`} /></div>
            ))
          ) : admins.length === 0 ? (
            <p className={`px-6 py-12 text-center text-sm ${isDark ? "text-slate-500" : "text-slate-400"}`}>No admins found</p>
          ) : (
            admins.map((admin) => (
              <div key={admin.id} className={`flex items-center gap-4 px-6 py-4 transition-colors ${isDark ? "hover:bg-white/[0.02]" : "hover:bg-slate-50"}`}>
                {admin.image ? (
                  <img src={admin.image} alt="" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-orange-500 text-sm font-bold text-white">
                    {admin.name[0]?.toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>{admin.name}</p>
                  <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>{admin.email}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${isDark ? "bg-amber-500/10 text-amber-400" : "bg-amber-50 text-amber-700"}`}>
                  {admins.indexOf(admin) === 0 ? "Super Admin" : "Admin"}
                </span>
                {admin.suspended && (
                  <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-[11px] font-semibold text-red-400">Suspended</span>
                )}
                <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  {new Date(admin.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
