import { useEffect, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";

const TAU = Math.PI * 2;
const MAX_DPR = 1.5;
const LINK_DIST = 46;
const LINK_BUCKETS = 6;

function hash01(a: number, b: number, c = 0): number {
  const n = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453;
  return n - Math.floor(n);
}

function makeGlowSprite(rgb: number[], alpha: number): HTMLCanvasElement | null {
  const size = 64;
  const sprite = document.createElement("canvas");
  sprite.width = size;
  sprite.height = size;
  const g = sprite.getContext("2d");
  if (!g) return null;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  if (!grad) return null;
  grad.addColorStop(0, `rgba(${rgb.join(",")},${alpha})`);
  grad.addColorStop(0.45, `rgba(${rgb.join(",")},${alpha * 0.4})`);
  grad.addColorStop(1, `rgba(${rgb.join(",")},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return sprite;
}

interface PNode {
  x: number;
  y: number;
  jx: number;
  jy: number;
  glow: boolean;
  teal: boolean;
  glowR: number;
  pulse: number;
  w1: number;
  w2: number;
  w3: number;
}

interface Palette {
  bg: string;
  line: number[];
  node: number[];
  glowCool: number[];
  glowWarm: number[];
  glowAlpha: number;
  nodeAlpha: number;
  maxLine: number;
  additive: boolean;
}

const DARK: Palette = {
  bg: "#020307",
  line: [150, 110, 220],
  node: [150, 110, 220],
  glowCool: [180, 150, 255],
  glowWarm: [110, 230, 235],
  glowAlpha: 0.95,
  nodeAlpha: 0.35,
  maxLine: 0.22,
  additive: true,
};

const LIGHT: Palette = {
  bg: "#ffffff",
  line: [124, 58, 237],
  node: [124, 58, 237],
  glowCool: [139, 92, 246],
  glowWarm: [13, 148, 136],
  glowAlpha: 0.5,
  nodeAlpha: 0.3,
  maxLine: 0.15,
  additive: false,
};

export default function PlexusMeshBackground() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sizeRef = useRef({ w: 1, h: 1, dpr: 1 });
  const paletteRef = useRef(DARK);
  const spritesRef = useRef<{ cool: HTMLCanvasElement | null; warm: HTMLCanvasElement | null }>({
    cool: null,
    warm: null,
  });

  useEffect(() => {
    const palette = isDark ? DARK : LIGHT;
    paletteRef.current = palette;
    spritesRef.current = {
      cool: makeGlowSprite(palette.glowCool, palette.glowAlpha),
      warm: makeGlowSprite(palette.glowWarm, palette.glowAlpha),
    };
  }, [isDark]);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let nodes: PNode[] = [];
    let pairs: number[][] = [];

    const buildGrid = (w: number, h: number) => {
      const mobile = window.innerWidth < 768;
      const cols = mobile
        ? Math.min(20, Math.max(5, Math.round(w / 42)))
        : Math.min(34, Math.max(8, Math.round(w / 42)));
      const rows = mobile
        ? Math.min(9, Math.max(4, Math.round(h / 95)))
        : Math.min(14, Math.max(6, Math.round(h / 60)));

      const next: PNode[] = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const gx = cols > 1 ? (c / (cols - 1)) * w : w / 2;
          const gy = rows > 1 ? (r / (rows - 1)) * h : h / 2;
          next.push({
            x: gx,
            y: gy,
            jx: (hash01(r, c) - 0.5) * 14,
            jy: (hash01(r, c, 1) - 0.5) * 14,
            glow: hash01(r, c, 2) < 0.06,
            teal: hash01(r, c, 3) < 0.4,
            glowR: 14 + hash01(r, c, 4) * 10,
            pulse: hash01(r, c, 5) * TAU,
            w1: hash01(r, c, 6) * TAU,
            w2: hash01(r, c, 7) * TAU,
            w3: hash01(r, c, 8) * TAU,
          });
        }
      }

      const idx = (r: number, c: number) => r * cols + c;
      const links: number[][] = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = idx(r, c);
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              if (dr === 0 && dc === 0) continue;
              const rr = r + dr;
              const cc = c + dc;
              if (rr < 0 || rr >= rows || cc < 0 || cc >= cols) continue;
              const j = idx(rr, cc);
              if (j <= i) continue;
              links.push([i, j]);
            }
          }
        }
      }

      nodes = next;
      pairs = links;
    };

    const onResize = () => {
      const w = cv.clientWidth || cv.parentElement?.clientWidth || window.innerWidth;
      const h = cv.clientHeight || cv.parentElement?.clientHeight || window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      sizeRef.current = { w, h, dpr };
      buildGrid(w, h);
    };
    onResize();
    window.addEventListener("resize", onResize);

    const draw = (now: number) => {
      const { w, h, dpr } = sizeRef.current;
      const palette = paletteRef.current;
      const t = now * 0.001;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = palette.bg;
      ctx.fillRect(0, 0, w, h);

      const n = nodes.length;
      const px = new Float32Array(n);
      const py = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const node = nodes[i];
        const x = node.x + node.jx;
        const y = node.y + node.jy;
        px[i] = x + Math.sin(y * 0.02 + t * 0.18) * 3;
        py[i] =
          y +
          Math.sin(x * 0.02 + t * 0.35 + node.w1) * 9 +
          Math.sin(y * 0.03 + t * 0.22 + node.w2) * 7 +
          Math.sin((x + y) * 0.013 + t * 0.12 + node.w3) * 6;
      }

      const buckets: Path2D[] = Array.from({ length: LINK_BUCKETS }, () => new Path2D());
      const counts = new Array<number>(LINK_BUCKETS).fill(0);
      for (let p = 0; p < pairs.length; p++) {
        const a = pairs[p][0];
        const b = pairs[p][1];
        const dx = px[a] - px[b];
        const dy = py[a] - py[b];
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d >= LINK_DIST) continue;
        const alpha = palette.maxLine * (1 - d / LINK_DIST);
        const bucket = Math.min(LINK_BUCKETS - 1, Math.floor(alpha / (palette.maxLine / LINK_BUCKETS)));
        counts[bucket]++;
        const path = buckets[bucket];
        path.moveTo(px[a], py[a]);
        path.lineTo(px[b], py[b]);
      }

      ctx.strokeStyle = `rgba(${palette.line.join(",")},1)`;
      ctx.lineWidth = 0.5;
      for (let b = 0; b < LINK_BUCKETS; b++) {
        if (counts[b] === 0) continue;
        ctx.globalAlpha = (b + 0.5) * (palette.maxLine / LINK_BUCKETS);
        ctx.stroke(buckets[b]);
      }

      const sprites = spritesRef.current;
      ctx.globalCompositeOperation = palette.additive ? "lighter" : "source-over";
      for (let i = 0; i < n; i++) {
        const node = nodes[i];
        if (!node.glow) continue;
        const sprite = node.teal ? sprites.warm : sprites.cool;
        if (!sprite) continue;
        const r = node.glowR * (1 + 0.12 * Math.sin(t * 0.8 + node.pulse));
        ctx.globalAlpha = 1;
        ctx.drawImage(sprite, px[i] - r, py[i] - r, r * 2, r * 2);
      }
      ctx.globalCompositeOperation = "source-over";

      for (let i = 0; i < n; i++) {
        const node = nodes[i];
        if (node.glow) {
          ctx.fillStyle = node.teal
            ? `rgba(${palette.glowWarm.join(",")},1)`
            : `rgba(${palette.glowCool.join(",")},1)`;
          ctx.globalAlpha = 0.95;
          ctx.fillRect(px[i] - 0.9, py[i] - 0.9, 1.8, 1.8);
        } else {
          ctx.fillStyle = `rgba(${palette.node.join(",")},1)`;
          ctx.globalAlpha = palette.nodeAlpha;
          ctx.fillRect(px[i] - 0.45, py[i] - 0.45, 0.9, 0.9);
        }
      }
      ctx.globalAlpha = 1;
    };

    let raf = 0;
    if (prefersReduced) {
      draw(10 * 1000);
    } else {
      const loop = (now: number) => {
        raf = requestAnimationFrame(loop);
        if (document.hidden) return;
        draw(now);
      };
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 h-full w-full"
    />
  );
}
