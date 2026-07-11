import type { Repository } from "@/types/repository";

interface Props {
  repository: Repository;
}

export default function RepositoryOverview({
  repository,
}: Props) {
  const totalChunks =
    repository.files.reduce(
      (sum, file) =>
        sum + file.chunks.length,
      0
    );

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="mb-2 text-slate-500">
          Files
        </h3>

        <p className="text-3xl font-bold">
          {repository.files.length}
        </p>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="mb-2 text-slate-500">
          Chunks
        </h3>

        <p className="text-3xl font-bold">
          {totalChunks}
        </p>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="mb-2 text-slate-500">
          Indexed
        </h3>

        <p className="text-lg font-semibold">
          {new Date(
            repository.createdAt
          ).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}