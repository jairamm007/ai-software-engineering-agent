import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export default function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500",
        className
      )}
      {...props}
    />
  );
}