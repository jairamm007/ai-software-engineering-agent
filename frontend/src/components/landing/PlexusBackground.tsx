import { useEffect, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";

const TAU = Math.PI * 2;
const MAX_DPR = 1.5;
const MAX_LINK = 140;
const LINE_ALPHA = 0.6;

function hash01(a: number, b: number, c = 0): number {
  const n = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453;
  return n - Math.floor(n);
}

function makeGlowSprite(rgb: number[], coreAlpha: number): HTMLCanvasElement | null {
  const size = 64;
  const sprite = document.createElement("canvas");
  sprite.width = size;
  sprite.height = size;
  const g = sprite.getContext("2d");
  if (!g) return null;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  if (!grad) return null;
  grad.addColorStop(0, `rgba(${rgb.join(",")},${coreAlpha})`);
  grad.addColorStop(0.5, `rgba(${rgb.join(",")},${coreAlpha * 0.35})`);
  grad.addColorStop(1, `rgba(${rgb.join(",")},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return sprite;
}

interface Point {
  band: number;
  homeX: number;
  phaseX: number;
  phaseY: number;
  spX: number;
  spY: number;
  ampX: number;
  ampY: number;
  glow: boolean;
  glowR: number;
  r: number;
  glowPulse: number;
}

const DARK = {
  bg: "#08060f",
  line: [150, 110, 230] as number[],
  node: [200, 170, 250] as number[],
  glow: [230, 191, 255] as number[],
  nodeAlpha: 0.8,
  glowAlpha: 0.9,
  lineFactor: 1,
};

const LIGHT = {
  bg: "#ffffff",
  line: [124, 58, 237] as number[],
  node: [91, 33, 182] as number[],
  glow: [192, 38, 211] as number[],
  nodeAlpha: 0.5,
  glowAlpha: 0.4,
  lineFactor: 0.5,
};

const BANDS = [
  { y: 0.24, amp: 0.06, freq: 0.0045, phase: 0 },
  { y: 0.52, amp: 0.055, freq: 0.0036, phase: 2.2 },
  { y: 0.8, amp: 0.07, freq: 0.0052, phase: 4.3 },
];

export default function PlexusBackground() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sizeRef = useRef({ w: 1, h: 1, dpr: 1 });
  const glowRef = useRef<HTMLCanvasElement | null>(null);
  const paletteRef = useRef(DARK);

  useEffect(() => {
    const palette = isDark ? DARK : LIGHT;
    paletteRef.current = palette;
    glowRef.current = makeGlowSprite(palette.glow, palette.glowAlpha);
  }, [isDark]);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let points: Point[] = [];

    const buildPoints = (w: number) => {
      const next: Point[] = [];
      for (let b = 0; b < BANDS.length; b++) {
        let x = -60;
        let i = 0;
        while (x < w + 60) {
          x += 18 + hash01(b, i) * 22;
          next.push({
            band: b,
            homeX: x,
            phaseX: hash01(b, i, 1) * TAU,
            phaseY: hash01(b, i, 2) * TAU,
            spX: 0.35 + hash01(b, i, 3) * 0.5,
            spY: 0.3 + hash01(b, i, 4) * 0.45,
            ampX: 4 + hash01(b, i, 5) * 6,
            ampY: 5 + hash01(b, i, 6) * 7,
            glow: hash01(b, i, 7) < 0.1,
            glowR: 10 + hash01(b, i, 8) * 16,
            r: 1 + hash01(b, i, 9),
            glowPulse: hash01(b, i, 10) * TAU,
          });
          i++;
        }
      }
      points = next;
    };

    const onResize = () => {
      const w = cv.clientWidth || cv.parentElement?.clientWidth || window.innerWidth;
      const h = cv.clientHeight || cv.parentElement?.clientHeight || window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      sizeRef.current = { w, h, dpr };
      buildPoints(w);
    };
    onResize();
    window.addEventListener("resize", onResize);

    const draw = (now: number) => {
      const { w, h, dpr } = sizeRef.current;
      const palette = paletteRef.current;
      const t = now * 0.001;
      const flowT = t * 0.12;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = palette.bg;
      ctx.fillRect(0, 0, w, h);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const n = points.length;
      const px = new Float32Array(n);
      const py = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const p = points[i];
        const band = BANDS[p.band];
        px[i] = p.homeX + Math.sin(t * p.spX + p.phaseX) * p.ampX;
        py[i] =
          band.y * h +
          Math.sin(p.homeX * band.freq + band.phase + flowT) * band.amp * h +
          Math.sin(t * p.spY + p.phaseY) * p.ampY;
      }

      const sprite = glowRef.current;
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < n; i++) {
        const p = points[i];
        if (!p.glow || !sprite) continue;
        const r = p.glowR * (1 + 0.18 * Math.sin(t * 0.6 + p.glowPulse));
        ctx.globalAlpha = 0.8;
        ctx.drawImage(sprite, px[i] - r, py[i] - r, r * 2, r * 2);
      }
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;

      const buckets: Path2D[] = Array.from({ length: 8 }, () => new Path2D());
      const counts = new Array<number>(8).fill(0);
      for (let i = 0; i < n; i++) {
        const xi = px[i];
        const yi = py[i];
        const bestD = [-1, -1, -1];
        const bestJ = [-1, -1, -1];
        for (let j = 0; j < n; j++) {
          if (j === i || j < i) continue;
          const dx = px[j] - xi;
          const dy = py[j] - yi;
          const d2 = dx * dx + dy * dy;
          if (d2 > MAX_LINK * MAX_LINK) continue;
          for (let k = 0; k < 3; k++) {
            if (bestD[k] === -1 || d2 < bestD[k]) {
              for (let m = 2; m > k; m--) {
                bestD[m] = bestD[m - 1];
                bestJ[m] = bestJ[m - 1];
              }
              bestD[k] = d2;
              bestJ[k] = j;
              break;
            }
          }
        }
        for (let k = 0; k < 3; k++) {
          if (bestD[k] === -1) continue;
          const alpha = Math.max(0.08, LINE_ALPHA - Math.sqrt(bestD[k]) / 220);
          const bucket = Math.min(7, Math.max(1, Math.floor(alpha / 0.075)));
          const path = buckets[bucket];
          counts[bucket]++;
          path.moveTo(xi, yi);
          path.lineTo(px[bestJ[k]], py[bestJ[k]]);
        }
      }

      ctx.strokeStyle = `rgba(${palette.line.join(",")},1)`;
      ctx.lineWidth = 1;
      for (let b = 0; b < buckets.length; b++) {
        if (counts[b] === 0) continue;
        ctx.globalAlpha = Math.min(1, (b + 0.5) * 0.075 * palette.lineFactor);
        ctx.stroke(buckets[b]);
      }

      ctx.globalAlpha = 1;
      for (let i = 0; i < n; i++) {
        const p = points[i];
        const pulse = 0.7 + 0.3 * Math.sin(t * p.spX + p.phaseX);
        ctx.globalAlpha = palette.nodeAlpha * pulse;
        ctx.fillStyle = p.glow
          ? `rgba(${palette.glow.join(",")},1)`
          : `rgba(${palette.node.join(",")},1)`;
        ctx.fillRect(px[i] - p.r, py[i] - p.r, p.r * 2, p.r * 2);
      }
      ctx.globalAlpha = 1;
    };

    let raf = 0;
    if (prefersReduced) {
      draw(15 * 1000);
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
    <div className="pointer-events-none fixed inset-0 z-0">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
