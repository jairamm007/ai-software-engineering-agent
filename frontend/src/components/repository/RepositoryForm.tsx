import { useState } from "react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface Props {
  onSubmit: (url: string) => Promise<void>;
}

const GITHUB_URL_PATTERN = /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+\/?$/;

export default function RepositoryForm({
  onSubmit,
}: Props) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      setError("URL is required.");
      return;
    }

    if (!GITHUB_URL_PATTERN.test(url.trim())) {
      setError("Please enter a valid GitHub repository URL.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await onSubmit(url);
      setUrl("");
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } }; message?: string } | undefined;
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Analysis failed. Check that git is installed and the URL is valid.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Input
            value={url}
            placeholder="https://github.com/facebook/react"
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError("");
            }}
          />
        </div>

        <Button disabled={loading || !url.trim()}>
          {loading ? "Analyzing..." : "Analyze Repository"}
        </Button>
      </form>
      {error && (
        <p className="mt-2 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
