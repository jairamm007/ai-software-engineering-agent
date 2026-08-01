import { Sparkles } from "lucide-react";

interface LoadingIndicatorProps {
  size?: "sm" | "md" | "lg";
  label?: string;
}

export function LoadingIndicator({ size = "md", label }: LoadingIndicatorProps) {
  const sparkleSize = { sm: 20, md: 28, lg: 36 }[size];

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <Sparkles size={sparkleSize} className="text-purple-400 animate-sparkle-pulse" />
      {label && <span className="text-sm text-gray-500">{label}</span>}
    </div>
  );
}
