interface StatCardProps {
  title: string;
  value: string | number;
}

export default function StatCard({
  title,
  value,
}: StatCardProps) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
        padding: 24,
        boxShadow:
          "0 4px 10px rgba(0,0,0,.08)",
      }}
    >
      <h3
        style={{
          color: "#64748b",
          fontSize: 14,
        }}
      >
        {title}
      </h3>

      <h1
        style={{
          marginTop: 10,
          fontSize: 34,
        }}
      >
        {value}
      </h1>
    </div>
  );
}