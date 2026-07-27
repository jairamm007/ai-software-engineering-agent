import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Save,
  X,
  Linkedin,
  Github,
  Globe,
  CalendarDays,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { toast } from "sonner";
import {
  getAdminProfile,
  updateAdminProfile,
  type AdminProfile,
} from "@/services/admin";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function AdminProfilePage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await getAdminProfile();
      setProfile(data);
      setName(data.name);
      setBio(data.bio ?? "");
      setImageUrl(data.image ?? "");
      setBannerUrl(data.bannerUrl ?? "");
      setLinkedinUrl(data.linkedinUrl ?? "");
      setGithubUrl(data.githubUrl ?? "");
      setPortfolioUrl(data.portfolioUrl ?? "");
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateAdminProfile({
        name: name.trim(),
        bio: bio.trim() || undefined,
        image: imageUrl.trim() || undefined,
        bannerUrl: bannerUrl.trim() || undefined,
        linkedinUrl: linkedinUrl.trim() || undefined,
        githubUrl: githubUrl.trim() || undefined,
        portfolioUrl: portfolioUrl.trim() || undefined,
      });
      setProfile(updated);
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!profile) return;
    setName(profile.name);
    setBio(profile.bio ?? "");
    setImageUrl(profile.image ?? "");
    setBannerUrl(profile.bannerUrl ?? "");
    setLinkedinUrl(profile.linkedinUrl ?? "");
    setGithubUrl(profile.githubUrl ?? "");
    setPortfolioUrl(profile.portfolioUrl ?? "");
  };

  const inputClass = `w-full rounded-xl border py-2.5 px-4 text-[13px] outline-none transition-all ${
    isDark
      ? "border-white/[0.06] bg-white/[0.03] text-white placeholder:text-slate-600 focus:border-rose-500/50"
      : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-rose-500/50"
  }`;

  const labelClass = `mb-1.5 block text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`;

  if (loading) {
    return (
      <div className={`flex min-h-full items-center justify-center ${isDark ? "bg-[#0a0a0f]" : "bg-[#f8fafc]"}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
          <span className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={`space-y-6 ${isDark ? "bg-[#0a0a0f] text-white" : "bg-[#f8fafc] text-slate-900"} min-h-full`}
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={fadeUp}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white">
            <User size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">My Profile</h1>
            <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              View and edit your admin profile
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={fadeUp}
        className={`overflow-hidden rounded-2xl border shadow-sm ${
          isDark ? "border-white/[0.06] bg-[#111118]" : "border-slate-200 bg-white"
        }`}
      >
        {profile && (
          <>
            <div className={`relative h-32 w-full ${profile.bannerUrl ? "" : isDark ? "bg-gradient-to-r from-rose-500/20 to-orange-500/20" : "bg-gradient-to-r from-rose-50 to-orange-50"}`}>
              {profile.bannerUrl && (
                <img src={profile.bannerUrl} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <div className="px-6 pb-6">
              <div className="flex items-end gap-5 -mt-10">
                <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-4 text-2xl font-bold text-white ${isDark ? "border-[#111118]" : "border-white"} bg-gradient-to-br from-rose-500 to-orange-500`}>
                  {profile.image ? (
                    <img src={profile.image} alt="" className="h-20 w-20 rounded-2xl object-cover" />
                  ) : (
                    profile.name[0]?.toUpperCase()
                  )}
                </div>
                <div className="pt-2">
                  <p className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{profile.name}</p>
                  <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>{profile.email}</p>
                </div>
                <div className="ml-auto flex items-center gap-2 pt-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                      profile.role === "admin"
                        ? "bg-red-500/10 text-red-400 ring-1 ring-inset ring-red-500/20"
                        : isDark
                          ? "bg-white/[0.04] text-slate-400 ring-1 ring-inset ring-white/[0.06]"
                          : "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200"
                    }`}
                  >
                    {profile.role ?? "user"}
                  </span>
                  <span className={`flex items-center gap-1.5 text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    <CalendarDays size={12} />
                    Member since {new Date(profile.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </motion.div>

      <motion.div
        variants={fadeUp}
        className={`rounded-2xl border p-6 shadow-sm ${
          isDark ? "border-white/[0.06] bg-[#111118]" : "border-slate-200 bg-white"
        }`}
      >
        <h2 className={`mb-5 text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Edit Profile</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Image URL</label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Tell us about yourself..."
              className={`${inputClass} resize-none`}
            />
          </div>

          <div>
            <label className={labelClass}>Banner URL</label>
            <input
              type="text"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              placeholder="https://..."
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={`${labelClass} flex items-center gap-1.5`}>
                <Linkedin size={13} /> LinkedIn URL
              </label>
              <input
                type="text"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className={inputClass}
              />
            </div>
            <div>
              <label className={`${labelClass} flex items-center gap-1.5`}>
                <Github size={13} /> GitHub URL
              </label>
              <input
                type="text"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
                className={inputClass}
              />
            </div>
            <div>
              <label className={`${labelClass} flex items-center gap-1.5`}>
                <Globe size={13} /> Portfolio URL
              </label>
              <input
                type="text"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://..."
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => void handleCancel()}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                isDark ? "text-slate-300 hover:bg-white/[0.04]" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <X size={14} />
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving || !name.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-rose-500/25 transition-all hover:shadow-xl hover:shadow-rose-500/30 disabled:opacity-50"
            >
              {saving ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Save size={14} />
              )}
              Save Changes
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
