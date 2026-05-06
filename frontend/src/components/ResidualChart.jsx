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

function ResidualChart({ data }) {
  return (
    <div className="glass-panel p-5">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">Residual Analysis</h3>
        <p className="text-sm text-slate-400">Residual drift between raw and Kalman-filtered readings.</p>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" />
            <XAxis dataKey="time" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="residual_ph" stroke="#22d3ee" strokeWidth={2} dot={false} name="Residual pH" />
            <Line
              type="monotone"
              dataKey="residual_temperature"
              stroke="#f97316"
              strokeWidth={2}
              dot={false}
              name="Residual Temp"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ResidualChart;
