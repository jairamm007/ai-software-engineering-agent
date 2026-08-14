import SparkleMark from "@/components/common/SparkleMark";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const markSizes = {
  sm: 32,
  md: 36,
  lg: 40,
};

export default function Logo({ size = "md", showText = false }: LogoProps) {
  const mark = markSizes[size];

  return (
    <div className="flex items-center gap-2.5">
      <SparkleMark size={mark} />
      {showText && (
        <div className="flex flex-col">
          <span className="font-[Outfit] text-sm font-bold leading-tight">Repo Verify</span>
          <span className="text-[10px] font-[Inter] text-slate-500">AI Software Agent</span>
        </div>
      )}
    </div>
  );
}
