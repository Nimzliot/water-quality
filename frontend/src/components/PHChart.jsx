import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function PHChart({ data }) {
  return (
    <div className="glass-panel p-5">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">pH Signal vs Kalman Estimate</h3>
        <p className="text-sm text-slate-400">Raw analog pH readings cross-validated against the smoothed estimate.</p>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" />
            <XAxis dataKey="time" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="ph" stroke="#38bdf8" strokeWidth={2} dot={false} name="Raw pH" />
            <Line type="monotone" dataKey="filtered_ph" stroke="#34d399" strokeWidth={2} dot={false} name="Filtered pH" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default PHChart;
