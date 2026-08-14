import type { ReactNode } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";

interface Props {
  sidebar: ReactNode;
  editor: ReactNode;
  assistant: ReactNode;
  bottomPanel?: ReactNode;
}

const ResizeHandle = () => <Separator className="w-1 bg-slate-200 transition hover:bg-blue-400 dark:bg-slate-700" />;

export default function IDEWorkspaceLayout({ sidebar, editor, assistant, bottomPanel }: Props) {
  return <div className="h-full min-h-0 overflow-hidden rounded-2xl border bg-slate-50 shadow-md dark:border-white/[0.08] dark:bg-[#0a0a0f]"><Group orientation="vertical"><Panel defaultSize={bottomPanel ? 82 : 100} minSize={40}><Group orientation="horizontal"><Panel defaultSize={20} minSize={15}><div className="h-full overflow-y-auto">{sidebar}</div></Panel><ResizeHandle /><Panel defaultSize={55} minSize={40}><div className="h-full overflow-hidden">{editor}</div></Panel><ResizeHandle /><Panel defaultSize={25} minSize={20}><div className="h-full overflow-y-auto">{assistant}</div></Panel></Group></Panel>{bottomPanel && <><Separator className="h-1 bg-slate-200 transition hover:bg-blue-400 dark:bg-slate-700" /><Panel defaultSize={18} minSize={12}><div className="h-full overflow-y-auto">{bottomPanel}</div></Panel></>}</Group></div>;
}
