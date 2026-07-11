interface Props {
  value: string;
  onChange: (value: string) => void;
  inputRef: RefObject<HTMLInputElement | null>;
}

export default function GraphSearch({ value, onChange, inputRef }: Props) {
  return <input ref={inputRef} value={value} onChange={(event) => onChange(event.target.value)} placeholder="Search files... (/)" className="min-w-52 flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500 dark:bg-slate-800" />;
}
import type { RefObject } from "react";
