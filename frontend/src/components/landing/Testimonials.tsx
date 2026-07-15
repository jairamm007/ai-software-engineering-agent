import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "CTO at Streamline",
    avatar: "SC",
    rating: 5,
    text: "Repo Verify completely changed how we do code reviews. What used to take hours now takes minutes. The AI catches things our team misses.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    name: "Marcus Rodriguez",
    role: "Senior Engineer at Vercel",
    avatar: "MR",
    rating: 5,
    text: "The architecture mapping alone is worth it. Being able to visualize dependencies across 200+ files instantly is a game changer.",
    gradient: "from-fuchsia-500 to-pink-600",
  },
  {
    name: "Anika Patel",
    role: "Open Source Maintainer",
    avatar: "AP",
    rating: 5,
    text: "I maintain 3 major open source projects. Repo Verify helps me review PRs faster and keeps documentation up to date automatically.",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    name: "James O'Brien",
    role: "Lead Dev at Shopify",
    avatar: "JO",
    rating: 5,
    text: "The AI chat feature is incredible. I can ask anything about our codebase and get instant, contextual answers. Onboarding new devs is 10x easier.",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    name: "Yuki Tanaka",
    role: "Security Engineer at Stripe",
    avatar: "YT",
    rating: 5,
    text: "Security scanning catches vulnerabilities before they reach production. It's like having a senior security reviewer available 24/7.",
    gradient: "from-orange-500 to-red-600",
  },
  {
    name: "David Kim",
    role: "CS Student at Stanford",
    avatar: "DK",
    rating: 5,
    text: "As a student, being able to chat with complex codebases and get instant explanations has accelerated my learning dramatically.",
    gradient: "from-amber-500 to-yellow-600",
  },
];

export default function Testimonials() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20 md:px-8 md:py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="mb-16 text-center"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false }}
            transition={{ delay: 0.1, duration: 0.4, type: "spring", stiffness: 200 }}
            className={`mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium ${
              isDark ? "border-amber-500/20 bg-amber-500/10 text-amber-300" : "border-amber-200 bg-amber-100 text-amber-700"
            }`}
          >
            <Star size={14} className="text-amber-400 fill-amber-400" />
            Loved by Developers
          </motion.span>
          <h2 className="mt-5 font-[Outfit] text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            What Our{" "}
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              Users Say
            </span>
          </h2>
          <p className={`mx-auto mt-6 max-w-2xl text-lg font-[Inter] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Join thousands of developers who have transformed their workflow with Repo Verify.
          </p>
        </motion.div>

        {/* Testimonial cards - masonry-like layout */}
        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
          {testimonials.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-30px" }}
              transition={{
                duration: 0.6,
                delay: index * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{ y: -3 }}
              className={`mb-5 break-inside-avoid group rounded-2xl border p-6 transition-all duration-300 ${
                isDark
                  ? "border-white/[0.06] bg-white/[0.03] hover:border-white/10 hover:bg-white/[0.06]"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-lg"
              }`}
            >
              {/* Quote icon */}
              <div className="mb-4 flex items-center justify-between">
                <Quote size={20} className={`${isDark ? "text-slate-600" : "text-slate-300"}`} />
                <div className="flex gap-0.5">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
              </div>

              {/* Text */}
              <p className={`mb-6 text-sm leading-relaxed font-[Inter] ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                "{item.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${item.gradient} text-xs font-bold text-white`}>
                  {item.avatar}
                </div>
                <div>
                  <p className={`text-sm font-semibold font-[Outfit] ${isDark ? "text-white" : "text-slate-900"}`}>
                    {item.name}
                  </p>
                  <p className={`text-xs font-[Inter] ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    {item.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
