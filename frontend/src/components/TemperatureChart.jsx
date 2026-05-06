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
        <h3 className="text-lg font-semibold text-white">Temperature Signal vs Kalman Estimate</h3>
        <p className="text-sm text-slate-400">DS18B20 measurements compared with filtered thermal behavior.</p>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" />
            <XAxis dataKey="time" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="temperature" stroke="#fb7185" strokeWidth={2} dot={false} name="Raw Temp" />
            <Line
              type="monotone"
              dataKey="filtered_temperature"
              stroke="#facc15"
              strokeWidth={2}
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
