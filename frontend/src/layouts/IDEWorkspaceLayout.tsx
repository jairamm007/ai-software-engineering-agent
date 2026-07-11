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
  return <div className="overflow-hidden rounded-2xl border bg-slate-50 shadow-sm dark:border-slate-700 dark:bg-slate-950"><Group orientation="vertical"><Panel defaultSize={bottomPanel ? 72 : 100} minSize={40}><Group orientation="horizontal"><Panel defaultSize={25} minSize={15}>{sidebar}</Panel><ResizeHandle /><Panel defaultSize={50} minSize={30}>{editor}</Panel><ResizeHandle /><Panel defaultSize={25} minSize={18}>{assistant}</Panel></Group></Panel>{bottomPanel && <><Separator className="h-1 bg-slate-200 transition hover:bg-blue-400 dark:bg-slate-700" /><Panel defaultSize={28} minSize={15}>{bottomPanel}</Panel></>}</Group></div>;
}
