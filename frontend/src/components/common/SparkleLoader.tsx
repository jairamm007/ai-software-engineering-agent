import { cn } from "@/lib/utils";

interface SparkleLoaderProps {
  size?: number;
  className?: string;
}

export function SparkleLoader({ size = 33, className }: SparkleLoaderProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      <path
        className="star-main"
        d="M97 62 C99 85,100 92,122 100 C100 108,99 115,97 138 C95 115,94 108,72 100 C94 92,95 85,97 62 Z"
        fill="none"
        stroke="#a855f7"
        strokeWidth="12"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <g className="star-accent" stroke="#a855f7" strokeWidth="9" strokeLinecap="round">
        <line x1="140" y1="45" x2="140" y2="65" />
        <line x1="130" y1="55" x2="150" y2="55" />
      </g>
    </svg>
  );
}
