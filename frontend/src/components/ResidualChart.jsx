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
        <h3 className="text-lg font-semibold text-black">Residual Analysis</h3>
        <p className="text-sm text-slate-500">Residual drift between raw and Kalman-filtered readings.</p>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="rgba(0, 0, 0, 0.08)" />
            <XAxis dataKey="time" stroke="#525252" />
            <YAxis stroke="#525252" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="residual_ph" stroke="#8b5cf6" strokeWidth={2.5} dot={false} name="Residual pH" />
            <Line
              type="monotone"
              dataKey="residual_temperature"
              stroke="#f97316"
              strokeWidth={2.5}
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
