interface Props {
  x: number;
  y: number;
  label: string;
  onAction: (action: string) => void;
}

const actions = ["Explain", "Review", "Generate tests for", "Run a security scan on", "Suggest a fix for"];

export default function GraphContextMenu({ x, y, label, onAction }: Props) {
  return <div style={{ left: x, top: y }} className="fixed z-50 w-48 rounded-xl border bg-white p-2 shadow-xl"><p className="truncate px-2 py-1 text-xs text-slate-500">{label}</p>{actions.map((action) => <button key={action} onClick={() => onAction(action)} className="block w-full rounded-lg px-2 py-2 text-left text-sm hover:bg-slate-100">{action}</button>)}</div>;
}
