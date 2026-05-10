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
        <h3 className="text-lg font-semibold text-black">pH Signal vs Kalman Estimate</h3>
        <p className="text-sm text-slate-500">Raw analog pH readings cross-validated against the smoothed estimate.</p>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="rgba(0, 0, 0, 0.08)" />
            <XAxis dataKey="time" stroke="#525252" />
            <YAxis stroke="#525252" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="ph" stroke="#2563eb" strokeWidth={2.5} dot={false} name="Raw pH" />
            <Line type="monotone" dataKey="filtered_ph" stroke="#10b981" strokeWidth={2.5} dot={false} name="Filtered pH" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default PHChart;
