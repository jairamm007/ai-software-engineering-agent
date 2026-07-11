import { useState } from "react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface Props {
  onSend: (message: string) => Promise<void>;
  loading: boolean;
}

export default function ChatInput({
  onSend,
  loading,
}: Props) {
  const [message, setMessage] = useState("");

  const submit = async () => {
    if (!message.trim() || loading) return;

    const text = message;

    setMessage("");

    await onSend(text);
  };

  return (
    <div className="flex gap-3">
      <Input
        value={message}
        disabled={loading}
        placeholder="Ask about this repository..."
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            void submit();
          }
        }}
      />

      <Button
        onClick={() => void submit()}
        disabled={loading}
      >
        {loading ? "Thinking..." : "Send"}
      </Button>
    </div>
  );
}