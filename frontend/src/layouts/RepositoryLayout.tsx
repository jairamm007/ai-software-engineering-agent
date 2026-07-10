import type { ReactNode } from "react";

interface Props {
  title: string;
  children: ReactNode;
}

export default function RepositoryLayout({
  title,
  children,
}: Props) {
  return (
    <div className="space-y-6">
      <header className="border-b pb-4">
        <h1 className="text-3xl font-bold">
          {title}
        </h1>
      </header>

      <nav className="flex gap-6 border-b pb-3">
        <button>Overview</button>
        <button>Files</button>
        <button>AI Chat</button>
        <button>Review</button>
        <button>Architecture</button>
        <button>Documentation</button>
      </nav>

      <section>{children}</section>
    </div>
  );
}