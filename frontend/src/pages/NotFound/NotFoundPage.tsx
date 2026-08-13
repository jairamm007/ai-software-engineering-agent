import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import PlexusTerrainBackground from "@/components/landing/PlexusTerrainBackground";
import GradientOrbs from "@/components/motion/GradientOrbs";
import Magnetic from "@/components/motion/Magnetic";
import { glassCard } from "@/components/motion/styles";
import { Compass, Home, Search, LifeBuoy } from "lucide-react";

export default function NotFoundPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const links = [
    { to: "/dashboard", icon: Home, label: "Go to Dashboard" },
    { to: "/docs", icon: Search, label: "Read the Docs" },
    { to: "/support", icon: LifeBuoy, label: "Get Support" },
  ];

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={cn("flex min-h-screen items-center justify-center font-[Inter] transition-colors duration-300", isDark ? "bg-[#07030F] text-white" : "bg-white text-slate-900")}
    >
      <PlexusTerrainBackground />
      <GradientOrbs />

      <div className="relative z-10 mx-auto max-w-lg px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 16 }}
          className="relative mx-auto mb-8 flex h-32 w-32 items-center justify-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 24, ease: "linear" }}
            className="absolute inset-0 rounded-full border border-dashed border-violet-500/30"
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-2xl shadow-violet-500/30"
          >
            <Compass size={34} className="text-white" />
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="font-[Outfit] text-7xl font-extrabold tracking-tight sm:text-8xl"
        >
          4
          <motion.span
            animate={{ opacity: [1, 0.2, 1], y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
            className="inline-block bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent"
          >
            0
          </motion.span>
          4
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className={cn("mt-3 text-lg", isDark ? "text-slate-400" : "text-slate-500")}
        >
          This page drifted off into an unexplored codebase.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          className="mt-10 grid gap-3 sm:grid-cols-3"
        >
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Magnetic key={link.label} strength={0.3}>
                <motion.div whileHover={{ y: -4, scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                  <Link
                    to={link.to}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-xl border px-4 py-5 text-sm font-medium transition-shadow duration-300",
                      glassCard(isDark),
                      isDark ? "hover:shadow-lg hover:shadow-violet-500/10" : "hover:shadow-lg hover:shadow-slate-200/60"
                    )}
                  >
                    <Icon size={18} className="text-violet-500" />
                    {link.label}
                  </Link>
                </motion.div>
              </Magnetic>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-10"
        >
          <Link
            to="/"
            className={cn("inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium transition-all", isDark ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-900")}
          >
            <Home size={15} /> Back to Home
          </Link>
        </motion.div>
      </div>
    </motion.main>
  );
}
