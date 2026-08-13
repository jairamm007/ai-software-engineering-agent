import { useEffect, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";

const TAU = Math.PI * 2;
const MAX_DPR = 1.5;

function hash01(a: number, b: number, c = 0): number {
  const n = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453;
  return n - Math.floor(n);
}

function resolveColor(name: string, fallback: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

function hexToRgba(hex: string, alpha: number): string {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) {
    h = h
      .split("")
      .map((ch) => ch + ch)
      .join("");
  }
  if (h.length !== 6) return hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function makeSprite(color: string): HTMLCanvasElement | null {
  const size = 64;
  const sprite = document.createElement("canvas");
  sprite.width = size;
  sprite.height = size;
  const g = sprite.getContext("2d");
  if (!g) return null;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  if (!grad) return null;
  grad.addColorStop(0, color);
  grad.addColorStop(0.4, color);
  grad.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return sprite;
}

interface Vertex {
  gx: number;
  gy: number;
  phase: number;
  speed: number;
  amp: number;
  hot: number;
}

export default function MeshTerrainBackground() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sizeRef = useRef({ w: 1, h: 1, dpr: 1 });
  const paletteRef = useRef({ primary: "#7c3aed", accent: "#ec4899" });
  const spritesRef = useRef<{ primary: HTMLCanvasElement | null; accent: HTMLCanvasElement | null }>({
    primary: null,
    accent: null,
  });
  const isDarkRef = useRef(isDark);

  useEffect(() => {
    isDarkRef.current = isDark;
    const primary = resolveColor("--mesh-primary", "#7c3aed");
    const accent = resolveColor("--mesh-accent", "#ec4899");
    paletteRef.current = { primary, accent };
    spritesRef.current = { primary: makeSprite(primary), accent: makeSprite(accent) };
  }, [isDark]);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const cols = isMobile ? 26 : 52;
    const rows = isMobile ? 12 : 20;

    const f1 = { x: 0.6, y: 0.32 };
    const f2 = { x: 0.42, y: 0.58 };

    const vertices: Vertex[] = [];
    for (let r = 0; r <= rows; r++) {
      for (let c = 0; c <= cols; c++) {
        const jx = (hash01(r, c, 7) - 0.5) * 0.055;
        const jy = (hash01(r, c, 8) - 0.5) * 0.05;
        const dx1 = c / cols + jx - f1.x;
        const dy1 = r / rows + jy - f1.y;
        const dx2 = c / cols + jx - f2.x;
        const dy2 = r / rows + jy - f2.y;
        const cluster = Math.exp(-(dx1 * dx1 + dy1 * dy1) / 0.02) + Math.exp(-(dx2 * dx2 + dy2 * dy2) / 0.025);
        const threshold = 0.08 + 0.32 * Math.min(cluster, 1);
        vertices.push({
          gx: c / cols + jx,
          gy: r / rows + jy,
          phase: hash01(r, c, 3) * TAU,
          speed: 0.5 + hash01(r, c, 4) * 0.8,
          amp: 0.5 + hash01(r, c, 5) * 1.1,
          hot: hash01(r, c, 6) < threshold ? 1 : 0,
        });
      }
    }

    const idx = (r: number, c: number) => r * (cols + 1) + c;
    const near: number[][] = [];
    const mid: number[][] = [];
    const far: number[][] = [];
    const hot: number[][] = [];
    const pushSeg = (a: number, b: number) => {
      const avg = (vertices[a].gy + vertices[b].gy) / 2;
      const list = avg < 0.42 ? near : avg < 0.75 ? mid : far;
      list.push([a, b]);
      if (vertices[a].hot === 1 || vertices[b].hot === 1) hot.push([a, b]);
    };
    for (let r = 0; r <= rows; r++) {
      for (let c = 0; c <= cols; c++) {
        if (c < cols) pushSeg(idx(r, c), idx(r, c + 1));
        if (r < rows) pushSeg(idx(r, c), idx(r + 1, c));
        if (r < rows && c < cols) pushSeg(idx(r, c), idx(r + 1, c + 1));
      }
    }

    const xs = new Float32Array(vertices.length);
    const ys = new Float32Array(vertices.length);

    const onResize = () => {
      const w = cv.clientWidth || cv.parentElement?.clientWidth || window.innerWidth;
      const h = cv.clientHeight || cv.parentElement?.clientHeight || window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      sizeRef.current = { w, h, dpr };
    };
    onResize();
    window.addEventListener("resize", onResize);

    const buildPath = (segs: number[][], path: Path2D) => {
      for (let s = 0; s < segs.length; s++) {
        const a = segs[s][0];
        const b = segs[s][1];
        path.moveTo(xs[a], ys[a]);
        path.lineTo(xs[b], ys[b]);
      }
    };

    const draw = (now: number) => {
      const { w, h, dpr } = sizeRef.current;
      const dark = isDarkRef.current;
      const { primary, accent } = paletteRef.current;
      const t = now * 0.001;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      const cx = w / 2;
      const horizon = h * 0.42;
      const camPanX = Math.sin(t * 0.079) * w * 0.05;
      const camPanY = Math.sin(t * 0.061) * h * 0.012;
      const breath = 1 + 0.02 * Math.sin(t * 0.05);
      const driftA = t * 0.0009;
      const cosD = Math.cos(driftA);
      const sinD = Math.sin(driftA);

      for (let i = 0; i < vertices.length; i++) {
        const v = vertices[i];
        const wx = v.gx - 0.5;
        const wy = v.gy - 0.5;
        const rx = wx * cosD - wy * sinD;
        const ry = wx * sinD + wy * cosD;
        const d = Math.min(1, Math.max(0, ry + 0.5));
        const sc = (0.3 + 0.7 * Math.pow(d, 1.45)) * breath;
        const hgt =
          (0.5 * Math.sin(t * 0.45 + rx * 4.1 + ry * 3.3) +
            0.32 * Math.sin(t * 0.31 + rx * 6.9 - ry * 4.7) +
            0.18 * Math.sin(t * 0.17 + rx * 12.3 + ry * 7.1)) *
          v.amp;
        xs[i] = cx + camPanX + rx * w * 1.3 * sc;
        ys[i] = horizon + camPanY + (h - horizon) * Math.pow(d, 1.7) - hgt * h * 0.17 * sc;
      }

      ctx.strokeStyle = primary;
      ctx.lineWidth = 1;
      ctx.globalAlpha = dark ? 0.5 : 0.26;
      const pNear = new Path2D();
      buildPath(near, pNear);
      ctx.stroke(pNear);

      ctx.globalAlpha = dark ? 0.34 : 0.18;
      const pMid = new Path2D();
      buildPath(mid, pMid);
      ctx.stroke(pMid);

      ctx.globalAlpha = dark ? 0.2 : 0.1;
      const pFar = new Path2D();
      buildPath(far, pFar);
      ctx.stroke(pFar);

      ctx.strokeStyle = accent;
      ctx.globalAlpha = dark ? 0.5 : 0.3;
      const pHot = new Path2D();
      buildPath(hot, pHot);
      ctx.stroke(pHot);

      for (let i = 0; i < vertices.length; i++) {
        const v = vertices[i];
        const d = Math.min(1, Math.max(0, (v.gx - 0.5) * sinD + (v.gy - 0.5) * cosD + 0.5));
        if (d > 0.82) continue;
        const sc = (0.3 + 0.7 * Math.pow(d, 1.45)) * breath;
        const pulse = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * v.speed * 1.7 + v.phase));
        const r = (1.1 + 2.1 * sc) * (isMobile ? 0.8 : 1);
        ctx.globalAlpha = (dark ? 0.75 : 0.55) * pulse;
        ctx.fillStyle = v.hot === 1 ? accent : primary;
        ctx.fillRect(xs[i] - 0.8, ys[i] - 0.8, 1.6, 1.6);
        if (v.hot === 1 && d < 0.72 && spritesRef.current.accent) {
          const s = r * 7;
          ctx.globalAlpha = (dark ? 0.55 : 0.4) * pulse;
          ctx.drawImage(spritesRef.current.accent, xs[i] - s / 2, ys[i] - s / 2, s, s);
        }
      }
      ctx.globalAlpha = 1;
    };

    let raf = 0;
    if (prefersReduced) {
      draw(18 * 1000);
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

  const meshBg =
    (typeof document !== "undefined" ? resolveColor("--mesh-bg", "") : "") || (isDark ? "#07030F" : "#ffffff");

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, ${hexToRgba(meshBg, 0.96)} 0%, ${hexToRgba(meshBg, 0.5)} 30%, ${hexToRgba(meshBg, 0.12)} 55%, ${hexToRgba(meshBg, 0)} 75%)`,
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-24"
        style={{
          background: `linear-gradient(to top, ${hexToRgba(meshBg, 0.9)}, ${hexToRgba(meshBg, 0)})`,
        }}
      />
    </div>
  );
}
