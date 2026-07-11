interface Props {
  icon: string;
  label: string;
  value: string | number;
}

export default function AnalyticsCard({ icon, label, value }: Props) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <p className="text-2xl">{icon}</p>
      <p className="mt-3 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
