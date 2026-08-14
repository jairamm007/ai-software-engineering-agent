export default function OrbitingRingsBackground() {
  return (
    <div className="orbit-bg" aria-hidden="true">
      <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        <g transform="translate(900,300)" fill="none" stroke="#a855f7" strokeOpacity="0.15">
          <ellipse rx="260" ry="90" strokeWidth="1" className="ring ring-a" />
          <ellipse rx="180" ry="140" strokeWidth="1" className="ring ring-b" />
          <ellipse rx="110" ry="180" strokeWidth="1" className="ring ring-c" />
        </g>
        <circle cx="900" cy="300" r="5" fill="#a855f7" opacity="0.4" className="pulse-dot" />
      </svg>
    </div>
  );
}