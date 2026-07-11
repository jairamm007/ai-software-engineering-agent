import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { deleteRepository } from "@/services/repository";

import type { Repository } from "@/types/repository";

interface Props {
  repositories: Repository[];
}

export default function RepositoryTable({
  repositories,
}: Props) {
  const queryClient = useQueryClient();

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Delete this repository?\n\nThis action cannot be undone."
    );

    if (!confirmed) return;

    try {
      await deleteRepository(id);

      queryClient.invalidateQueries({
        queryKey: ["repositories"],
      });
    } catch {
      alert("Failed to delete repository.");
    }
  };

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

                    <th className="w-20 text-center">
                      Actions
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

                <td className="text-center">
                  <button
                    type="button"
                    title="Delete Repository"
                    onClick={() => handleDelete(repo.id)}
                    className="rounded-lg p-2 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}