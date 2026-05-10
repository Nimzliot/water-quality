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

function TemperatureChart({ data }) {
  return (
    <div className="glass-panel p-5">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-black">Temperature Signal vs Kalman Estimate</h3>
        <p className="text-sm text-slate-500">DS18B20 measurements compared with filtered thermal behavior.</p>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="rgba(0, 0, 0, 0.08)" />
            <XAxis dataKey="time" stroke="#525252" />
            <YAxis stroke="#525252" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="temperature" stroke="#ef4444" strokeWidth={2.5} dot={false} name="Raw Temp" />
            <Line
              type="monotone"
              dataKey="filtered_temperature"
              stroke="#f59e0b"
              strokeWidth={2.5}
              dot={false}
              name="Filtered Temp"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default TemperatureChart;
