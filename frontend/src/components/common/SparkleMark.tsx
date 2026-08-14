import { cn } from "@/lib/utils";

interface SparkleMarkProps {
  size?: number;
  className?: string;
}

export default function SparkleMark({ size = 36, className }: SparkleMarkProps) {
  return (
    <img
      src="/ai-spark-icon.svg"
      alt="Repo Verify"
      width={size}
      height={size}
      draggable={false}
      className={cn("shrink-0", className)}
      style={{ width: size, height: size }}
    />
  );
}
