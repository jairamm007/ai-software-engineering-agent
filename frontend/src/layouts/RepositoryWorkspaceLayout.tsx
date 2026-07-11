import type { ReactNode } from "react";

interface Props {
  sidebar: ReactNode;
  content: ReactNode;
}

export default function RepositoryWorkspaceLayout({
  sidebar,
  content,
}: Props) {
  return (
    <div className="grid grid-cols-12 gap-6">
      <aside className="col-span-3">
        {sidebar}
      </aside>

      <section className="col-span-9 space-y-6">
        {content}
      </section>
    </div>
  );
}