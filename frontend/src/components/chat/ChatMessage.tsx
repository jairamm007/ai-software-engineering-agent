import MarkdownMessage from "./MarkdownMessage";

interface Props {
  role: "user" | "assistant";
  message: string;
}

export default function ChatMessage({
  role,
  message,
}: Props) {
  return (
    <div
      className={`mb-5 flex ${
        role === "user"
          ? "justify-end"
          : "justify-start"
      }`}
    >
      <div
        className={`max-w-4xl rounded-xl px-5 py-4 shadow ${
          role === "user"
            ? "bg-blue-600 text-white"
            : "border bg-white"
        }`}
      >
        <MarkdownMessage content={message} />
      </div>
    </div>
  );
}