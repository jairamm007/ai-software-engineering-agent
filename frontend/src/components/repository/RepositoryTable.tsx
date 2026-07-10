import { Link } from "react-router-dom";

import type { Repository } from "@/types/repository";

interface Props {
  repositories: Repository[];
}

export default function RepositoryTable({
  repositories,
}: Props) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <table className="w-full border-collapse">
        <thead className="bg-slate-100">
          <tr>
            <th className="p-4 text-left font-semibold">
              Repository
            </th>

            <th className="p-4 text-left font-semibold">
              Files
            </th>

            <th className="p-4 text-left font-semibold">
              Chunks
            </th>

            <th className="p-4 text-left font-semibold">
              Created
            </th>
          </tr>
        </thead>

        <tbody>
          {repositories.map((repo) => {
            const files = repo.files.length;

            const chunks = repo.files.reduce(
              (sum, file) => sum + file.chunks.length,
              0
            );

            return (
              <tr
                key={repo.id}
                className="border-t transition-colors hover:bg-slate-50"
              >
                <td className="p-4">
                  <Link
                    to={`/repositories/${repo.id}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {repo.name}
                  </Link>
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
    </div>
  );
}