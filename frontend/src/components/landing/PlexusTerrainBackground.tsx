import { useEffect, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";

const MAX_DPR = 1.5;

interface Palette {
  bg: string;
  line: string;
  cool: string;
  warm: string;
  nodeAlpha: number;
  glowShadowAlpha: number;
  maxLine: number;
}

const DARK: Palette = {
  bg: "#020307",
  line: "150,110,220",
  cool: "180,150,255",
  warm: "110,230,235",
  nodeAlpha: 0.3,
  glowShadowAlpha: 0.95,
  maxLine: 0.22,
};

const LIGHT: Palette = {
  bg: "#ffffff",
  line: "124,58,237",
  cool: "139,92,246",
  warm: "13,148,136",
  nodeAlpha: 0.25,
  glowShadowAlpha: 0.6,
  maxLine: 0.15,
};

interface PNode {
  bx: number;
  by: number;
  phase: number;
  amp: number;
  speed: number;
  glow: boolean;
  warm: boolean;
  depth: number;
  x: number;
  y: number;
}

export default function PlexusTerrainBackground({ className = "" }: { className?: string }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cv = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const g = ctx;
    const palette = isDark ? DARK : LIGHT;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let nodes: PNode[] = [];
    let rafId = 0;

    function buildNodes() {
      const isMobile = w < 768;
      const cols = isMobile ? 18 : 34;
      const rows = isMobile ? 8 : 13;
      const list: PNode[] = [];
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const jitterX = (Math.random() - 0.5) * (w / cols) * 1.1;
          const jitterY = (Math.random() - 0.5) * (h / rows) * 1.1;
          list.push({
            bx: (i / (cols - 1)) * w + jitterX,
            by: (j / (rows - 1)) * h + jitterY,
            phase: Math.random() * Math.PI * 2,
            amp: 10 + Math.random() * 26,
            speed: 0.3 + Math.random() * 0.5,
            glow: Math.random() < 0.06,
            warm: Math.random() < 0.4,
            depth: 0.5 + Math.random() * 0.5,
            x: 0,
            y: 0,
          });
        }
      }
      nodes = list;
    }

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildNodes();
    }

    function drawFrame(t: number) {
      g.clearRect(0, 0, w, h);

      for (const n of nodes) {
        const wave =
          Math.sin(n.bx * 0.012 + t * 0.18) * n.amp * 0.6 +
          Math.sin(n.by * 0.02 + t * 0.12 + n.phase) * n.amp * 0.4;
        n.x = n.bx + Math.sin(t * 0.3 * n.speed + n.phase) * 4;
        n.y = n.by + wave;
      }

      const maxD = 46;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < maxD) {
            const alpha = palette.maxLine * (1 - d / maxD) * Math.min(a.depth, b.depth);
            g.strokeStyle = `rgba(${palette.line},${alpha})`;
            g.lineWidth = 0.5;
            g.beginPath();
            g.moveTo(a.x, a.y);
            g.lineTo(b.x, b.y);
            g.stroke();
          }
        }
      }

      for (const n of nodes) {
        if (n.glow) continue;
        g.fillStyle = `rgba(${palette.line},${palette.nodeAlpha})`;
        g.beginPath();
        g.arc(n.x, n.y, 0.9, 0, Math.PI * 2);
        g.fill();
      }

      for (const n of nodes) {
        if (!n.glow) continue;
        const col = n.warm ? palette.warm : palette.cool;
        g.save();
        g.shadowBlur = 16;
        g.shadowColor = `rgba(${col},${palette.glowShadowAlpha})`;
        g.fillStyle = `rgba(${col},1)`;
        g.beginPath();
        g.arc(n.x, n.y, 1.8, 0, Math.PI * 2);
        g.fill();
        g.restore();
      }
    }

    resize();
    window.addEventListener("resize", resize);

    const start = performance.now();
    if (prefersReducedMotion) {
      drawFrame(0);
    } else {
      const loop = (now: number) => {
        rafId = requestAnimationFrame(loop);
        if (document.hidden) return;
        drawFrame((now - start) / 1000);
      };
      rafId = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 ${className}`}
      style={{ background: isDark ? DARK.bg : LIGHT.bg }}
    />
  );
}
