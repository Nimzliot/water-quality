function SensorCard({ title, value, subtitle, accent = "cyan" }) {
  const accentClass =
    accent === "red"
      ? "from-red-500/10 to-transparent border-black/10"
      : accent === "amber"
        ? "from-amber-500/10 to-transparent border-black/10"
        : "from-sky-500/10 to-transparent border-black/10";

  return (
    <div
      className={`rounded-2xl border bg-gradient-to-br ${accentClass} p-5 backdrop-blur-xl`}
    >
      <p className="text-sm text-slate-600">{title}</p>
      <h3 className="mt-3 text-3xl font-semibold text-black">{value}</h3>
      <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}

export default SensorCard;
