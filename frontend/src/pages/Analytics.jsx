import ResidualChart from "../components/ResidualChart";
import PHChart from "../components/PHChart";
import TemperatureChart from "../components/TemperatureChart";
import { useDashboardData } from "../context/DashboardDataContext";

function Analytics() {
  const { chartData, stats } = useDashboardData();

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="glass-panel p-5">
          <p className="section-title">Average pH</p>
          <p className="mt-3 text-3xl font-semibold text-cyan-200">{stats?.averages?.ph ?? 0}</p>
        </div>
        <div className="glass-panel p-5">
          <p className="section-title">Average Temperature</p>
          <p className="mt-3 text-3xl font-semibold text-amber-200">{stats?.averages?.temperature ?? 0} C</p>
        </div>
        <div className="glass-panel p-5">
          <p className="section-title">Residual pH</p>
          <p className="mt-3 text-3xl font-semibold text-white">{stats?.averages?.residual_ph ?? 0}</p>
        </div>
        <div className="glass-panel p-5">
          <p className="section-title">Residual Temperature</p>
          <p className="mt-3 text-3xl font-semibold text-white">{stats?.averages?.residual_temperature ?? 0}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="glass-panel p-5">
          <p className="section-title">Adaptive Kalman Gain pH</p>
          <p className="mt-3 text-3xl font-semibold text-cyan-100">{stats?.averages?.kalman_gain_ph ?? 0}</p>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            Average correction weight applied to pH measurements after the prediction step.
          </p>
        </div>
        <div className="glass-panel p-5">
          <p className="section-title">Adaptive Kalman Gain Temp</p>
          <p className="mt-3 text-3xl font-semibold text-amber-100">{stats?.averages?.kalman_gain_temperature ?? 0}</p>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            Average correction weight applied to temperature measurements under adaptive noise tuning.
          </p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <PHChart data={chartData} />
        <TemperatureChart data={chartData} />
      </div>

      <ResidualChart data={chartData} />
    </div>
  );
}

export default Analytics;
