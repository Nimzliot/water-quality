import { useDashboardData } from "../context/DashboardDataContext";

function History() {
  const { history } = useDashboardData();

  const getStatusChipClass = (status) => {
    if (status === "SENSOR_FAULT") {
      return "border-amber-300/20 bg-amber-300/10 text-amber-100";
    }
    if (status === "CONTAMINATION") {
      return "border-sky-300/20 bg-sky-300/10 text-sky-100";
    }
    if (status === "CRITICAL") {
      return "border-rose-400/20 bg-rose-400/10 text-rose-200";
    }
    return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
  };

  return (
    <section className="glass-panel p-5 md:p-6">
      <div className="mb-4">
        <p className="section-title">Historical Log</p>
        <h3 className="mt-2 text-2xl font-semibold text-white">Telemetry Archive</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr>
              <th className="px-3 py-3 font-medium">Time</th>
              <th className="px-3 py-3 font-medium">pH</th>
              <th className="px-3 py-3 font-medium">Temp</th>
              <th className="px-3 py-3 font-medium">Filtered pH</th>
              <th className="px-3 py-3 font-medium">Filtered Temp</th>
              <th className="px-3 py-3 font-medium">Residual pH</th>
              <th className="px-3 py-3 font-medium">Residual Temp</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium">Source</th>
            </tr>
          </thead>
          <tbody>
            {history.map((row) => (
              <tr key={row.id} className="border-t border-white/5 text-slate-200">
                <td className="px-3 py-4">{new Date(row.created_at).toLocaleString()}</td>
                <td className="px-3 py-4">{row.ph}</td>
                <td className="px-3 py-4">{row.temperature}</td>
                <td className="px-3 py-4">{row.filtered_ph}</td>
                <td className="px-3 py-4">{row.filtered_temperature}</td>
                <td className="px-3 py-4">{row.residual_ph}</td>
                <td className="px-3 py-4">{row.residual_temperature}</td>
                <td className="px-3 py-4">
                  <span className={`status-chip ${getStatusChipClass(row.status)}`}>
                    {row.status}
                  </span>
                </td>
                <td className="px-3 py-4">{row.source_type || "LIVE"}{row.simulation_mode ? ` / ${row.simulation_mode}` : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default History;
