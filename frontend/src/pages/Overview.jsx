import AlertBanner from "../components/AlertBanner";
import PHChart from "../components/PHChart";
import TemperatureChart from "../components/TemperatureChart";
import { useDashboardData } from "../context/DashboardDataContext";

function Overview() {
  const { latest, stats, chartData, loading } = useDashboardData();

  if (loading) {
    return <div className="glass-panel p-6 text-slate-600">Loading overview...</div>;
  }

  const getStatusTone = (status) => {
    if (status === "SENSOR_FAULT") {
      return "text-stone-700";
    }
    if (status === "CONTAMINATION") {
      return "text-stone-800";
    }
    if (status === "CRITICAL") {
      return "text-black";
    }
    return "text-stone-600";
  };

  const heroMetrics = [
    {
      label: "Current pH",
      value: latest ? latest.ph : "--",
      note: `Filtered: ${latest ? latest.filtered_ph : "--"}`,
      tone: "from-white/10 to-transparent border-white/10",
    },
    {
      label: "Current Temperature",
      value: latest ? `${latest.temperature} C` : "--",
      note: `Filtered: ${latest ? latest.filtered_temperature : "--"} C`,
      tone: "from-white/10 to-transparent border-white/10",
    },
    {
      label: "Residual Integrity",
      value: latest ? `${latest.residual_ph} / ${latest.residual_temperature}` : "--",
      note: `Avg residuals: ${stats?.averages?.residual_ph ?? "--"} | ${stats?.averages?.residual_temperature ?? "--"}`,
      tone: "from-white/10 to-transparent border-white/10",
    },
    {
      label: "Event Status",
      value: latest ? latest.status : "NO DATA",
      note: latest ? new Date(latest.created_at).toLocaleString() : "Waiting for first packet",
      tone: "from-white/0 to-white/0 border-white/10",
    },
  ];

  return (
    <div className="space-y-4">
      <AlertBanner latest={latest} />

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {heroMetrics.map((metric) => (
          <div key={metric.label} className="tone-card rounded-[28px] p-5">
            <p className="section-title text-[10px]">{metric.label}</p>
            <div className={`mt-5 text-3xl font-semibold ${metric.label === "Event Status" ? getStatusTone(metric.value) : "text-stone-950"}`}>
              {metric.value}
            </div>
            <p className="mt-4 text-sm leading-6 text-stone-600">{metric.note}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <PHChart data={chartData} />
        <TemperatureChart data={chartData} />
      </div>
    </div>
  );
}

export default Overview;
