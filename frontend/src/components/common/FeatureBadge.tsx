import { cn } from "@/lib/utils";

interface FeatureBadgeProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function FeatureBadge({ className, style }: FeatureBadgeProps) {
  return (
    <div
      className={cn("relative inline-block shrink-0", className)}
      style={{
        width: 120,
        height: 88,
        borderRadius: 30,
        background: "#F0EDFF",
        ...style,
      }}
    >
      <span
        className="absolute rounded-full"
        style={{
          left: 12,
          top: "50%",
          transform: "translateY(-50%)",
          width: 5,
          height: 60,
          background: "#6D45C7",
        }}
      />
      <svg
        className="absolute"
        style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
        width={40}
        height={40}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#6040B8"
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x={2} y={2} width={8} height={8} rx={2.5} />
        <rect x={14} y={2} width={8} height={8} rx={2.5} />
        <rect x={2} y={14} width={8} height={8} rx={2.5} />
        <rect x={14} y={14} width={8} height={8} rx={2.5} />
      </svg>
    </div>
  );
}
