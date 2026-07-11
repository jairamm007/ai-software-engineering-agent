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
      className={`mb-4 flex ${
        role === "user"
          ? "justify-end"
          : "justify-start"
      }`}
    >
      <div
        className={`max-w-3xl rounded-xl px-4 py-3 ${
          role === "user"
            ? "bg-blue-600 text-white"
            : "bg-white border"
        }`}
      >
        {message}
      </div>
    </div>
  );
}