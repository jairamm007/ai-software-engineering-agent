import type { Repository } from "@/types/repository";

interface Props {
  repository: Repository;
}

export default function RepositoryCard({
  repository,
}: Props) {
  return (
    <div
      style={{
        background: "white",
        padding: 20,
        borderRadius: 12,
        marginBottom: 15,
        boxShadow:
          "0 4px 12px rgba(0,0,0,.08)",
      }}
    >
      <h2>{repository.name}</h2>

      <p>
        Files:
        {" "}
        {repository.files.length}
      </p>

      <p>
        URL:
        {" "}
        {repository.githubUrl}
      </p>
    </div>
  );
}