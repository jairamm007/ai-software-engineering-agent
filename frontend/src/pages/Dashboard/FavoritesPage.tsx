import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, FolderGit2, Clock, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getRepositories } from "@/services/repository";
import { useTheme } from "@/context/ThemeContext";
import DashboardLayout from "@/layouts/DashboardLayout";

const FAVORITES_KEY = "favorite-repos";

function loadFavorites(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFavorites(ids: string[]) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function FavoritesPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [favoriteIds, setFavoriteIds] = useState<string[]>(loadFavorites);

  const { data: repos = [] } = useQuery({
    queryKey: ["repositories"],
    queryFn: getRepositories,
  });

  useEffect(() => {
    saveFavorites(favoriteIds);
  }, [favoriteIds]);

  const toggleFavorite = (id: string) => {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  const favorites = repos.filter((r) => favoriteIds.includes(r.id));

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 md:p-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl ${
              isDark ? "bg-amber-500/10" : "bg-amber-100"
            }`}
          >
            <Star size={16} className="text-amber-500 fill-amber-500" />
          </div>
          <div>
            <h1
              className={`text-lg font-semibold font-[Inter] ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Favorites
            </h1>
            <p
              className={`text-xs font-[Inter] ${
                isDark ? "text-slate-500" : "text-slate-400"
              }`}
            >
              {favorites.length} starred{" "}
              {favorites.length === 1 ? "repository" : "repositories"}
            </p>
          </div>
        </motion.div>

        {favorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`flex flex-col items-center justify-center rounded-2xl border py-20 ${
              isDark
                ? "border-white/[0.06] bg-white/[0.01]"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            <Star
              size={40}
              className={`mb-4 ${isDark ? "text-slate-700" : "text-slate-300"}`}
            />
            <p
              className={`text-sm font-medium font-[Inter] ${
                isDark ? "text-slate-500" : "text-slate-400"
              }`}
            >
              Star repositories from the repository list to see them here
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid gap-4 overflow-hidden sm:grid-cols-2"
          >
            <AnimatePresence mode="popLayout">
              {favorites.map((repo, i) => (
                <motion.div
                  key={repo.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: 0.05 + i * 0.05 }}
                  whileHover={{ y: -3 }}
                  className={`group relative rounded-2xl border p-5 transition-shadow ${
                    isDark
                      ? "border-white/[0.06] bg-white/[0.02] hover:shadow-lg hover:shadow-amber-500/5"
                      : "border-slate-200 bg-white hover:shadow-lg hover:shadow-slate-200/50"
                  }`}
                >
                  <Link
                    to={`/repositories/${repo.id}`}
                    className="absolute inset-0 rounded-2xl"
                  />
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg accent-bg-light`}
                      >
                        <FolderGit2 size={14} className="accent-text-base" />
                      </div>
                      <div>
                        <p
                          className={`text-sm font-medium font-[Inter] ${
                            isDark ? "text-white" : "text-slate-900"
                          }`}
                        >
                          {repo.name}
                        </p>
                        <p
                          className={`text-xs font-[Inter] ${
                            isDark ? "text-slate-500" : "text-slate-400"
                          }`}
                        >
                          {repo._count.files}{" "}
                          {repo._count.files === 1 ? "file" : "files"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(repo.id);
                      }}
                      className={`relative z-10 rounded-lg p-1.5 transition-colors ${
                        isDark
                          ? "text-amber-400 hover:bg-amber-400/10"
                          : "text-amber-500 hover:bg-amber-100"
                      }`}
                    >
                      <Star size={14} className="fill-current" />
                    </button>
                  </div>

                  <div
                    className={`flex items-center justify-between ${
                      isDark ? "text-slate-500" : "text-slate-400"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-xs font-[Inter]">
                        <Clock size={10} />
                        {formatDate(repo.createdAt)}
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-[Inter]">
                      <ExternalLink size={10} />
                      <span className="max-w-[120px] truncate">
                        {repo.githubUrl.replace("https://github.com/", "")}
                      </span>
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
