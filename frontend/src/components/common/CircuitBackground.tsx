import { useEffect, useMemo, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

const VIEW_W = 1200;
const VIEW_H = 900;

function hash01(a: number, b: number, c = 0): number {
  const n = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453;
  return n - Math.floor(n);
}

function depthScale(depth: number): number {
  return Math.pow(Math.max(depth, 0.01), 1.4);
}

function projectX(x: number, depth: number): number {
  const sx = 0.35 + 0.65 * depthScale(depth);
  return (0.5 + (x - 0.5) * sx) * VIEW_W;
}

function projectY(depth: number): number {
  return (-0.3 + 1.3 * depthScale(depth)) * VIEW_H;
}

function dydD(depth: number): number {
  return 1.3 * 1.4 * Math.pow(Math.max(depth, 0.01), 0.4);
}

function projectPoint(x: number, depth: number) {
  return { X: projectX(x, depth), Y: projectY(depth) };
}

function projectCell(cx: number, depth: number, w: number, h: number) {
  const ds = depthScale(depth);
  const sx = 0.35 + 0.65 * ds;
  const X = (0.5 + (cx - 0.5) * sx) * VIEW_W;
  const Y = projectY(depth);
  const rectW = sx * w * VIEW_W;
  const rectH = dydD(depth) * h * VIEW_H;
  return { X, Y, w: rectW, h: rectH };
}

function rrPath(X: number, Y: number, w: number, h: number, radius: number): string {
  const r = Math.min(radius, Math.abs(w) / 2, Math.abs(h) / 2);
  const x0 = X - w / 2;
  const x1 = X + w / 2;
  const y0 = Y - h / 2;
  const y1 = Y + h / 2;
  return [
    `M ${x0 + r} ${y0}`,
    `H ${x1 - r}`,
    `A ${r} ${r} 0 0 1 ${x1} ${y0 + r}`,
    `V ${y1 - r}`,
    `A ${r} ${r} 0 0 1 ${x1 - r} ${y1}`,
    `H ${x0 + r}`,
    `A ${r} ${r} 0 0 1 ${x0} ${y1 - r}`,
    `V ${y0 + r}`,
    `A ${r} ${r} 0 0 1 ${x0 + r} ${y0}`,
    "Z",
  ].join(" ");
}

const SIGNALS: number[][][] = [
  [[-0.1, 0.02], [0.18, 0.28], [0.45, 0.52], [0.72, 0.78], [1.1, 1.02]],
  [[0.0, 0.12], [0.3, 0.3], [0.5, 0.62], [0.9, 0.88]],
  [[0.15, 0.05], [0.42, 0.22], [0.36, 0.5], [0.7, 0.7], [0.96, 0.98]],
  [[0.85, 0.08], [0.76, 0.35], [0.96, 0.6], [0.8, 0.9]],
];

function signalPath(points: number[][]): string {
  const projected = points.map(([x, y]) => projectPoint(x, y));
  return projected
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.X.toFixed(1)} ${p.Y.toFixed(1)}`)
    .join(" ");
}

interface Props {
  className?: string;
}

export default function CircuitBackground({ className }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [isMobile] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches
  );
  const [prefersReduced] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  // Window-level mouse parallax (works despite pointer-events-none)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const parX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-16, 16]), { stiffness: 50, damping: 20 });
  const parY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-12, 12]), { stiffness: 50, damping: 20 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth - 0.5);
      mouseY.set(e.clientY / window.innerHeight - 0.5);
    };
    const onLeave = () => {
      mouseX.set(0);
      mouseY.set(0);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, [mouseX, mouseY]);

  const { cells, nodes, pulsePaths } = useMemo(() => {
    const rows = isMobile ? 6 : 10;
    const cols = isMobile ? 7 : 13;
    const out: { d: string; X: number; Y: number }[] = [];
    const nodeOut: { X: number; Y: number; r: number; d: number }[] = [];

    for (let r = 0; r <= rows; r++) {
      const depth = 0.12 + 0.88 * (r / rows);
      for (let c = 0; c <= cols; c++) {
        const h1 = hash01(r, c);
        const h2 = hash01(c, r);
        const cx = 0.44 + (c - cols / 2) * 0.12 + (h1 - 0.5) * 0.07;
        const size = 0.05 + 0.085 * depthScale(depth);
        const w = size * (0.7 + h1 * 0.7);
        const h = size * (0.7 + h2 * 0.7);
        const cell = projectCell(cx, depth, w, h);
        const rad = Math.max(4, Math.min(18, cell.w * 0.18));
        out.push({ d: rrPath(cell.X, cell.Y, cell.w, cell.h, rad), X: cell.X, Y: cell.Y });
        if (hash01(r, c, 1) < 0.16) {
          nodeOut.push({ X: cell.X, Y: cell.Y, r: 1.5 + h1 * 2.5, d: hash01(r, c, 2) });
        }
      }
    }

    const pulseIndexes = isMobile ? [] : [1, 3];
    const pulses = pulseIndexes.map((i) => signalPath(SIGNALS[i]));

    return { cells: out, nodes: nodeOut, pulsePaths: pulses };
  }, [isMobile]);

  const signalD = useMemo(
    () => (prefersReduced ? [] : SIGNALS.map((pts) => signalPath(pts))),
    [prefersReduced]
  );

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
      style={{ "--accent-1": "var(--accent, #8b5cf6)", "--accent-2": "#ec4899", "--glow-color": "rgba(139,92,246,0.4)" } as React.CSSProperties}
    >
      <style>{`
        @keyframes cb-node-pulse {
          0%, 100% { opacity: 0.45; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        @keyframes cb-bokeh {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.05; }
          50% { transform: translate(24px, -32px) scale(1.25); opacity: 0.22; }
        }
        .cb-line { fill: none; stroke: var(--accent-1); }
        .cb-node { animation: cb-node-pulse 3.4s ease-in-out infinite; animation-delay: calc(var(--d) * 3s); }
        .cb-bokeh { animation: cb-bokeh 14s ease-in-out infinite; }
      `}</style>

      {/* Soft focal glow behind the pattern */}
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? "radial-gradient(ellipse 70% 55% at 38% 45%, rgba(139,92,246,0.14), rgba(139,92,246,0.05) 45%, transparent 75%)"
            : "radial-gradient(ellipse 70% 55% at 38% 45%, rgba(139,92,246,0.12), rgba(139,92,246,0.04) 45%, transparent 75%)",
        }}
      />

      {/* Circuit grid layer (drift + parallax) */}
      <motion.div style={{ x: parX, y: parY }} className="absolute -inset-8">
        <motion.div
          animate={
            prefersReduced
              ? undefined
              : { scale: [1, 1.035, 1], x: [0, -22, 0], y: [0, -12, 0] }
          }
          transition={{ repeat: Infinity, duration: 110, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            preserveAspectRatio="xMidYMid slice"
            className="h-full w-full"
            aria-hidden="true"
          >
            <defs>
              <filter id="cb-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3.5" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="cb-node-halo" x="-300%" y="-300%" width="700%" height="700%">
                <feGaussianBlur stdDeviation="4" />
              </filter>
            </defs>

            {/* Soft glow pass */}
            <g filter="url(#cb-glow)" opacity={isDark ? 0.5 : 0.35}>
              {cells.map((c, i) => (
                <path key={`g-${i}`} d={c.d} className="cb-line" strokeWidth="1" opacity={isDark ? 0.4 : 0.3} />
              ))}
            </g>

            {/* Crisp circuit traces */}
            <g>
              {cells.map((c, i) => (
                <path
                  key={`c-${i}`}
                  d={c.d}
                  className="cb-line"
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                  opacity={isDark ? 0.55 : 0.45}
                />
              ))}
            </g>

            {/* Diagonal signal lines */}
            {signalD.map((d, i) => (
              <g key={`s-${i}`}>
                <path
                  d={d}
                  className="cb-line"
                  strokeWidth="2.2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  opacity={isDark ? 0.5 : 0.4}
                  filter="url(#cb-glow)"
                />
                <path
                  d={d}
                  className="cb-line"
                  strokeWidth="1"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  opacity={isDark ? 0.7 : 0.55}
                />
              </g>
            ))}

            {/* Glowing nodes at intersections */}
            {nodes.map((n, i) => (
              <g key={`n-${i}`}>
                <circle
                  cx={n.X}
                  cy={n.Y}
                  r={n.r * 4}
                  fill="var(--accent-2)"
                  opacity={isDark ? 0.3 : 0.2}
                  filter="url(#cb-node-halo)"
                />
                <circle
                  className="cb-node"
                  style={{ "--d": n.d } as React.CSSProperties}
                  cx={n.X}
                  cy={n.Y}
                  r={n.r}
                  fill="var(--accent-2)"
                  opacity={isDark ? 0.9 : 0.8}
                />
              </g>
            ))}

            {/* Traveling light pulses */}
            {pulsePaths.map((d, i) => (
              <g key={`p-${i}`}>
                <motion.circle
                  r={2}
                  fill="var(--accent-2)"
                  opacity={0.95}
                  filter="url(#cb-node-halo)"
                  style={{ offsetPath: `path("${d}")`, offsetRotate: "0deg" }}
                  animate={{ offsetDistance: ["0%", "100%"] }}
                  transition={{ duration: 7 + i * 1.5, repeat: Infinity, ease: "easeInOut", delay: 2 + i * 3 }}
                />
                <motion.circle
                  r={1.1}
                  fill="#ffffff"
                  style={{ offsetPath: `path("${d}")`, offsetRotate: "0deg" }}
                  animate={{ offsetDistance: ["0%", "100%"] }}
                  transition={{ duration: 7 + i * 1.5, repeat: Infinity, ease: "easeInOut", delay: 2 + i * 3 }}
                />
              </g>
            ))}
          </svg>
        </motion.div>
      </motion.div>

      {/* Floating bokeh particles */}
      {!prefersReduced && (
        <div className="absolute inset-0">
          {(isMobile ? [0, 1, 2, 3] : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).map((i) => {
            const size = 2 + hash01(i, 7) * 7;
            return (
              <div
                key={i}
                className="cb-bokeh absolute rounded-full"
                style={{
                  left: `${5 + hash01(i, 3) * 90}%`,
                  top: `${5 + hash01(i, 5) * 90}%`,
                  width: size,
                  height: size,
                  background: "var(--accent-2)",
                  animationDelay: `${hash01(i, 9) * 12}s`,
                  animationDuration: `${10 + hash01(i, 11) * 12}s`,
                }}
              />
            );
          })}
        </div>
      )}

      {/* Readability vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? "radial-gradient(ellipse at center, transparent 45%, rgba(2,6,23,0.35) 100%)"
            : "radial-gradient(ellipse at center, transparent 55%, rgba(255,255,255,0.3) 100%)",
        }}
      />
    </div>
  );
}
