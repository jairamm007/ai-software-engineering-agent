interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const sizeClasses = {
  sm: { container: "h-8 w-8", text: "text-sm" },
  md: { container: "h-9 w-9", text: "text-base" },
  lg: { container: "h-10 w-10", text: "text-lg" },
};

export default function Logo({ size = "md", showText = false }: LogoProps) {
  const { container, text } = sizeClasses[size];

  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`${container} flex items-center justify-center rounded-xl accent-gradient accent-shadow`}
      >
        <span className={`font-mono font-bold text-white ${text}`}>{">_^"}</span>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className="font-[Outfit] text-sm font-bold leading-tight">Repo Verify</span>
          <span className="text-[10px] font-[Inter] text-slate-500">AI Software Agent</span>
        </div>
      )}
    </div>
  );
}
