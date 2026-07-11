import { useState } from "react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface Props {
  onSend: (
    message: string
  ) => void;
}

export default function ChatInput({
  onSend,
}: Props) {
  const [message, setMessage] =
    useState("");

  const submit = () => {
    if (!message.trim()) return;

    onSend(message);

    setMessage("");
  };

  return (
    <div className="flex gap-3">
      <Input
        value={message}
        placeholder="Ask about this repository..."
        onChange={(e) =>
          setMessage(
            e.target.value
          )
        }
        onKeyDown={(e) => {
          if (e.key === "Enter")
            submit();
        }}
      />

      <Button onClick={submit}>
        Send
      </Button>
    </div>
  );
}