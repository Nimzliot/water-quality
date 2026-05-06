function SensorCard({ title, value, subtitle, accent = "cyan" }) {
  const accentClass =
    accent === "red"
      ? "from-rose-500/25 to-rose-500/0 border-rose-400/20"
      : accent === "amber"
        ? "from-amber-500/25 to-amber-500/0 border-amber-400/20"
        : "from-cyan-500/25 to-cyan-500/0 border-cyan-400/20";

  return (
    <div
      className={`rounded-2xl border bg-gradient-to-br ${accentClass} p-5 backdrop-blur-xl`}
    >
      <p className="text-sm text-slate-300">{title}</p>
      <h3 className="mt-3 text-3xl font-semibold text-white">{value}</h3>
      <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
    </div>
  );
}

export default SensorCard;
