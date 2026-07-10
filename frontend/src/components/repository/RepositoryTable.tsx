import type { Repository } from "@/types/repository";

interface Props {
  repositories: Repository[];
}

export default function RepositoryTable({
  repositories,
}: Props) {
  return (
    <table className="w-full border-collapse bg-white shadow rounded-xl overflow-hidden">
      <thead className="bg-slate-100">
        <tr>
          <th className="p-4 text-left">Repository</th>
          <th className="p-4 text-left">Files</th>
          <th className="p-4 text-left">Chunks</th>
          <th className="p-4 text-left">Created</th>
        </tr>
      </thead>

      <tbody>
        {repositories.map((repo: Repository) => {
          const files = repo.files.length;

          const chunks =
            repo.files.reduce(
              (sum: number, file) =>
                sum + file.chunks.length,
              0
            );

          return (
            <tr
              key={repo.id}
              className="border-t"
            >
              <td className="p-4">
                {repo.name}
              </td>

              <td className="p-4">
                {files}
              </td>

              <td className="p-4">
                {chunks}
              </td>

              <td className="p-4">
                {new Date(
                  repo.createdAt
                ).toLocaleDateString()}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}