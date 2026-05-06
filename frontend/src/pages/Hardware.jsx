import { useDashboardData } from "../context/DashboardDataContext";

const formatAgo = (timestamp) => {
  if (!timestamp) {
    return "No heartbeat received";
  }

  const diffSeconds = Math.max(0, Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000));
  if (diffSeconds < 60) {
    return `${diffSeconds}s ago`;
  }
  if (diffSeconds < 3600) {
    return `${Math.floor(diffSeconds / 60)}m ago`;
  }
  return `${Math.floor(diffSeconds / 3600)}h ago`;
};

function Hardware() {
  const { hardware, latest } = useDashboardData();

  return (
    <div className="grid gap-4 2xl:grid-cols-[minmax(0,1.3fr)_minmax(360px,0.9fr)]">
      <section className="glass-panel p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="section-title">Heartbeat Status</p>
            <h3 className="mt-3 text-3xl font-semibold text-white">ESP32 Connection Monitor</h3>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              Hardware is shown as connected only when the backend receives dedicated heartbeat packets from the ESP32 heartbeat endpoint.
            </p>
          </div>
          <div
            className={`status-chip ${
              hardware.connected
                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                : "border-rose-400/20 bg-rose-400/10 text-rose-200"
            }`}
          >
            {hardware.connected ? "Hardware Connected" : "Hardware Disconnected"}
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
            <p className="section-title text-[10px]">Device Identity</p>
            <h4 className="mt-3 text-3xl font-semibold text-white">{hardware.deviceId || "ESP32-WQ-01"}</h4>
            <p className="mt-3 text-sm text-slate-400">Firmware: {hardware.firmwareVersion || "Unknown"}</p>
            <p className="mt-2 text-sm text-slate-400">IP Address: {hardware.ipAddress || "Unavailable"}</p>
          </div>

          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
            <p className="section-title text-[10px]">Heartbeat Freshness</p>
            <p className="mt-3 text-3xl font-semibold text-white">{formatAgo(hardware.lastHeartbeatAt)}</p>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              Latest heartbeat at {hardware.lastHeartbeatAt ? new Date(hardware.lastHeartbeatAt).toLocaleString() : "no heartbeat yet"}.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="glass-panel p-5">
          <p className="section-title">Readiness</p>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-2xl bg-slate-950/40 px-4 py-3">
              <span className="text-sm text-slate-300">Backend API</span>
              <span className="font-medium text-emerald-300">Online</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-950/40 px-4 py-3">
              <span className="text-sm text-slate-300">Database</span>
              <span className="font-medium text-cyan-200">Supabase</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-950/40 px-4 py-3">
              <span className="text-sm text-slate-300">Heartbeat Stream</span>
              <span className={`font-medium ${hardware.connected ? "text-emerald-300" : "text-rose-300"}`}>
                {hardware.connected ? "Receiving" : "Stopped"}
              </span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-5">
          <p className="section-title">Latest Reading</p>
          <p className="mt-3 text-2xl font-semibold text-white">{latest ? `${latest.ph} pH / ${latest.temperature} C` : "No sensor frame yet"}</p>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            Sensor frames and heartbeats are tracked separately, so a device can be connected even if a fresh reading has not been persisted yet.
          </p>
        </div>
      </section>
    </div>
  );
}

export default Hardware;
