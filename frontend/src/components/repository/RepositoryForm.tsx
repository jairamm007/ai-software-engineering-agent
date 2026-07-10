import { useState } from "react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface Props {
  onSubmit: (url: string) => Promise<void>;
}

export default function RepositoryForm({
  onSubmit,
}: Props) {
  const [url, setUrl] = useState("");

  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!url.trim()) return;

    setLoading(true);

    try {
      await onSubmit(url);

      setUrl("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 flex gap-4"
    >
      <Input
        value={url}
        placeholder="https://github.com/facebook/react"
        onChange={(e) =>
          setUrl(e.target.value)
        }
      />

      <Button disabled={loading}>
        {loading
          ? "Analyzing..."
          : "Analyze Repository"}
      </Button>
    </form>
  );
}