import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

const logos = [
  { name: "Vercel", svg: "M24 4.5l12 21H12L24 4.5z" },
  { name: "Stripe", svg: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6z" },
  { name: "GitHub", svg: "M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" },
  { name: "Linear", svg: "M3.24 4.16L10.18 16.8h.01l3.24-5.97 3.17 5.97h6.94L13.22 4.16h-3.3z" },
  { name: "Notion", svg: "M4.46 4.46L12 2l7.54 2.46v15.08L12 22l-7.54-4.46V4.46z" },
  { name: "Figma", svg: "M8 24c2.21 0 4-1.79 4-4v-4H8c-2.21 0-4 1.79-4 4s1.79 4 4 4zM4 12c0-2.21 1.79-4 4-4h4v8H8c-2.21 0-4-1.79-4-4zM12 8c2.21 0 4 1.79 4 4s-1.79 4-4 4h-4V8h4zM16 4c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4h-4V4z" },
  { name: "Slack", svg: "M5.042 15.165a2.528 2.528 0 01-2.52 2.523A2.528 2.528 0 010 15.165a2.527 2.527 0 012.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 012.521-2.52 2.527 2.527 0 012.521 2.52v6.313A2.528 2.528 0 018.834 24a2.528 2.528 0 01-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 01-2.521-2.52A2.528 2.528 0 018.834 0a2.528 2.528 0 012.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 012.521 2.521 2.528 2.528 0 01-2.521 2.521H2.522A2.528 2.528 0 010 8.834a2.528 2.528 0 012.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 012.522-2.521A2.528 2.528 0 0124 8.834a2.528 2.528 0 01-2.522 2.521h-2.522V8.834zm-1.27 0a2.528 2.528 0 01-2.523 2.521 2.527 2.527 0 01-2.52-2.521V2.522A2.527 2.527 0 0115.163 0a2.528 2.528 0 012.523 2.522v6.312zM15.163 18.956a2.528 2.528 0 012.523 2.522A2.528 2.528 0 0115.163 24a2.527 2.527 0 01-2.52-2.522v-2.522h2.52zm0-1.27a2.527 2.527 0 01-2.52-2.523 2.527 2.527 0 012.52-2.52h6.315A2.528 2.528 0 0124 15.163a2.528 2.528 0 01-2.522 2.523h-6.315z" },
  { name: "Datadog", svg: "M11.996 0C5.372 0 0 5.372 0 11.996S5.372 24 11.996 24c6.624 0 12.004-5.372 12.004-12.004S18.62 0 11.996 0zm0 20c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z" },
  { name: "Cloudflare", svg: "M16.5088 16.8447c.1475-.502.2285-1.0322.2285-1.5771 0-3.3115-2.687-5.9985-5.9985-5.9985-.3096 0-.6104.0293-.9014.084-.3447-2.3457-2.3623-4.1504-4.8125-4.1504-2.6377 0-4.7939 2.1562-4.7939 4.7939 0 .2568.0244.5078.0674.7529C.3438 10.5312 0 11.2754 0 12.0957c0 1.875 1.5186 3.3955 3.3955 3.3955h13.0215c1.3232 0 2.4199-1.0762 2.4199-2.4199 0-1.1357-.7861-2.0898-1.8516-2.3564l.4766-3.4565z" },
  { name: "Supabase", svg: "M13.5 2.5L5 11.5h5.5l-1.5 10L20 12.5h-5.5l1.5-10z" },
];

function LogoMarquee({ direction, isDark }: { direction: "left" | "right"; isDark: boolean }) {
  const duplicated = [...logos, ...logos, ...logos];

  return (
    <div className="relative overflow-hidden">
      <motion.div
        animate={{ x: direction === "left" ? ["0%", "-33.333%"] : ["-33.333%", "0%"] }}
        transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
        className="flex gap-12 items-center w-max"
      >
        {duplicated.map((logo, i) => (
          <div
            key={`${logo.name}-${i}`}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-xl border transition-colors ${
              isDark
                ? "border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.05]"
                : "border-slate-100 bg-slate-50 hover:bg-slate-100"
            }`}
          >
            <svg viewBox="0 0 24 24" className={`h-5 w-5 ${isDark ? "fill-slate-400" : "fill-slate-500"}`}>
              <path d={logo.svg} />
            </svg>
            <span className={`text-sm font-medium font-[Inter] whitespace-nowrap ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {logo.name}
            </span>
          </div>
        ))}
      </motion.div>
      {/* Fade edges */}
      <div className={`absolute inset-y-0 left-0 w-24 bg-gradient-to-r pointer-events-none ${isDark ? "from-[#07030F] to-transparent" : "from-white to-transparent"}`} />
      <div className={`absolute inset-y-0 right-0 w-24 bg-gradient-to-l pointer-events-none ${isDark ? "from-[#07030F] to-transparent" : "from-white to-transparent"}`} />
    </div>
  );
}

export default function TrustedLogos() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section className="py-16 sm:py-20 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <p className={`text-sm font-medium font-[Inter] uppercase tracking-widest ${isDark ? "text-slate-500" : "text-slate-400"}`}>
          Trusted by teams at
        </p>
      </motion.div>
      <LogoMarquee direction="left" isDark={isDark} />
    </section>
  );
}
