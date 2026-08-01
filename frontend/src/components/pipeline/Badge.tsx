interface Props {
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ children, className = "" }: Props) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${className}`}>
      {children}
    </span>
  );
}
