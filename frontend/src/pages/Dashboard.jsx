import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import PHChart from "../components/PHChart";
import TemperatureChart from "../components/TemperatureChart";
import ResidualChart from "../components/ResidualChart";
import AlertBanner from "../components/AlertBanner";
import api from "../services/api";

const navItems = [
  { id: "overview", label: "Overview" },
  { id: "hardware", label: "Hardware" },
  { id: "analytics", label: "Analytics" },
  { id: "alerts", label: "Alerts" },
  { id: "history", label: "History" },
  { id: "settings", label: "Settings" },
];

const formatChartData = (rows) =>
  rows.map((row) => ({
    ...row,
    time: new Date(row.created_at).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  }));

const formatAgo = (timestamp) => {
  if (!timestamp) {
    return "No packets received yet";
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

function Dashboard() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("overview");

  const loadDashboard = async () => {
    try {
      setError("");
      const [statsResponse, historyResponse] = await Promise.all([
        api.get("/dashboard/stats"),
        api.get("/sensor/history?limit=20"),
      ]);

      setStats(statsResponse.data.data);
      setHistory(historyResponse.data.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 5000);
    return () => clearInterval(interval);
  }, []);

  const latest = stats?.latest;
  const chartData = formatChartData(stats?.chartData || []);
  const hardwareConnected = latest ? Date.now() - new Date(latest.created_at).getTime() < 15000 : false;
  const statusLabel = hardwareConnected ? "Hardware Connected" : "Hardware Disconnected";
  const statusTone = hardwareConnected
    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
    : "border-rose-400/20 bg-rose-400/10 text-rose-200";

  const heroMetrics = useMemo(
    () => [
      {
        label: "Current pH",
        value: latest ? latest.ph : "--",
        note: `Filtered: ${latest ? latest.filtered_ph : "--"}`,
        tone: "from-sky-500/20 to-sky-500/0 border-sky-400/20",
      },
      {
        label: "Current Temperature",
        value: latest ? `${latest.temperature} C` : "--",
        note: `Filtered: ${latest ? latest.filtered_temperature : "--"} C`,
        tone: "from-amber-500/20 to-amber-500/0 border-amber-400/20",
      },
      {
        label: "Residual Integrity",
        value: latest ? `${latest.residual_ph} / ${latest.residual_temperature}` : "--",
        note: `Avg residuals: ${stats?.averages?.residual_ph ?? "--"} | ${stats?.averages?.residual_temperature ?? "--"}`,
        tone: "from-cyan-500/20 to-cyan-500/0 border-cyan-400/20",
      },
      {
        label: "Fault Status",
        value: latest ? latest.status : "NO DATA",
        note: latest ? new Date(latest.created_at).toLocaleString() : "Waiting for first packet",
        tone: latest?.status === "FAULT" ? "from-rose-500/25 to-rose-500/0 border-rose-400/20" : "from-emerald-500/20 to-emerald-500/0 border-emerald-400/20",
      },
    ],
    [latest, stats]
  );

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-300">Loading command center...</div>;
  }

  return (
    <div className="min-h-screen px-4 py-4 md:px-6">
      <div className="mx-auto grid max-w-[1800px] gap-4 xl:grid-cols-[290px_minmax(0,1fr)]">
        <aside className="glass-panel flex flex-col justify-between overflow-hidden">
          <div className="p-5">
            <div className="rounded-[28px] border border-cyan-400/15 bg-cyan-400/5 p-5">
              <p className="section-title">IoT Research Grid</p>
              <h1 className="mt-4 text-3xl font-semibold leading-tight text-white">
                Aqua Sentinel
                <br />
                Control Deck
              </h1>
              <p className="mt-4 text-sm leading-7 text-slate-400">
                Premium operator workspace for cross-validated sensor health, telemetry confidence, and fault visibility.
              </p>
            </div>

            <div className="mt-6 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm transition ${
                    activeSection === item.id
                      ? "bg-cyan-400/12 text-cyan-100 ring-1 ring-cyan-300/20"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                  onClick={() => setActiveSection(item.id)}
                >
                  <span>{item.label}</span>
                  <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    {item.id === activeSection ? "Live" : ""}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-white/5 p-5">
            <div className="rounded-[26px] bg-white/[0.04] p-4">
              <p className="text-sm font-semibold text-white">{user?.email}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.3em] text-slate-500">Authenticated Operator</p>
              <button className="secondary-button mt-4 w-full" onClick={logout}>
                Logout
              </button>
            </div>
          </div>
        </aside>

        <main className="space-y-4">
          <div className="glass-panel p-4 md:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="section-title">Operations Center</p>
                <h2 className="mt-3 text-3xl font-semibold text-white md:text-5xl">
                  Water Quality Fault Detection Console
                </h2>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400 md:text-base">
                  Track pH and DS18B20 telemetry, inspect Kalman residual behavior, and instantly understand whether the embedded hardware is actively streaming.
                </p>
              </div>

              <div className="flex flex-col items-stretch gap-3 md:flex-row">
                <button className={`status-chip justify-center ${statusTone}`}>
                  <span className={`h-2.5 w-2.5 rounded-full ${hardwareConnected ? "bg-emerald-300" : "bg-rose-300"}`} />
                  {statusLabel}
                </button>
                <button className="secondary-button" onClick={loadDashboard}>
                  Refresh Live Data
                </button>
              </div>
            </div>
          </div>

          {error ? <div className="glass-panel border border-rose-500/20 p-4 text-rose-300">{error}</div> : null}

          <div id="overview" className="space-y-4">
            <AlertBanner latest={latest} />

            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
              {heroMetrics.map((metric) => (
                <div key={metric.label} className={`rounded-[28px] border bg-gradient-to-br ${metric.tone} p-5`}>
                  <p className="section-title text-[10px]">{metric.label}</p>
                  <div className="mt-5 text-3xl font-semibold text-white">{metric.value}</div>
                  <p className="mt-4 text-sm leading-6 text-slate-400">{metric.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 2xl:grid-cols-[minmax(0,1.6fr)_minmax(360px,0.85fr)]">
            <section id="hardware" className="glass-panel p-5 md:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="section-title">Hardware Link</p>
                  <h3 className="mt-3 text-3xl font-semibold text-white">Embedded Device Status</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    This panel makes it obvious whether the ESP32 is currently communicating with the backend and how fresh the latest packet is.
                  </p>
                </div>
                <div className={`rounded-full border px-4 py-2 text-sm font-medium ${statusTone}`}>{statusLabel}</div>
              </div>

              <div className="mt-6 grid gap-4 xl:grid-cols-2">
                <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                  <p className="section-title text-[10px]">Live Device</p>
                  <h4 className="mt-3 text-3xl font-semibold text-white">ESP32 Node</h4>
                  <p className="mt-3 text-sm text-slate-400">
                    Last packet: {latest ? new Date(latest.created_at).toLocaleString() : "No data"}
                  </p>
                  <p className="mt-2 text-sm text-slate-400">Recency: {formatAgo(latest?.created_at)}</p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <span className={`status-chip ${statusTone}`}>{hardwareConnected ? "Connected" : "Disconnected"}</span>
                    <span className={`status-chip ${latest?.status === "FAULT" ? "border-rose-400/20 bg-rose-400/10 text-rose-200" : "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"}`}>
                      {latest?.status || "Awaiting stream"}
                    </span>
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                  <p className="section-title text-[10px]">System Readiness</p>
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
                      <span className="text-sm text-slate-300">Telemetry Stream</span>
                      <span className={`font-medium ${hardwareConnected ? "text-emerald-300" : "text-rose-300"}`}>
                        {hardwareConnected ? "Receiving" : "Stopped"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="alerts" className="space-y-4">
              <div className="glass-panel p-5">
                <p className="section-title">Live Alerts</p>
                <h3 className="mt-3 text-2xl font-semibold text-white">Fault Broadcast</h3>
                <div className="mt-5 rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                  {latest?.status === "FAULT" ? (
                    <>
                      <div className="status-chip border-rose-400/20 bg-rose-400/10 text-rose-200">Risk Detected</div>
                      <p className="mt-4 text-sm leading-7 text-slate-300">
                        Residual thresholds have been exceeded. Inspect the analytics panels to identify whether the issue is thermal drift, pH instability, or a hardware interruption.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="status-chip border-emerald-400/20 bg-emerald-400/10 text-emerald-200">No Critical Alerts</div>
                      <p className="mt-4 text-sm leading-7 text-slate-300">
                        The latest cross-validated measurements are stable and currently within expected residual limits.
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div id="settings" className="glass-panel p-5">
                <p className="section-title">Operator Notes</p>
                <div className="mt-4 space-y-3 text-sm text-slate-400">
                  <p>Polling cadence: every 5 seconds</p>
                  <p>pH threshold: 0.35 residual units</p>
                  <p>Temperature threshold: 1.5 residual units</p>
                  <p>Recommended hardware state: packets every 5 to 10 seconds</p>
                </div>
              </div>
            </section>
          </div>

          <section id="analytics" className="grid gap-4 xl:grid-cols-2">
            <PHChart data={chartData} />
            <TemperatureChart data={chartData} />
          </section>

          <section className="grid gap-4 2xl:grid-cols-[minmax(0,1.4fr)_minmax(360px,0.9fr)]">
            <ResidualChart data={chartData} />

            <div className="glass-panel p-5">
              <p className="section-title">System Snapshot</p>
              <h3 className="mt-3 text-2xl font-semibold text-white">Research Summary</h3>
              <div className="mt-5 space-y-3">
                <div className="rounded-2xl bg-white/[0.03] p-4">
                  <p className="text-sm text-slate-400">Total Readings</p>
                  <p className="mt-2 text-3xl font-semibold text-white">{stats?.totals?.readings ?? 0}</p>
                </div>
                <div className="rounded-2xl bg-white/[0.03] p-4">
                  <p className="text-sm text-slate-400">Fault Events</p>
                  <p className="mt-2 text-3xl font-semibold text-rose-300">{stats?.totals?.faults ?? 0}</p>
                </div>
                <div className="rounded-2xl bg-white/[0.03] p-4">
                  <p className="text-sm text-slate-400">Average pH</p>
                  <p className="mt-2 text-3xl font-semibold text-cyan-200">{stats?.averages?.ph ?? 0}</p>
                </div>
                <div className="rounded-2xl bg-white/[0.03] p-4">
                  <p className="text-sm text-slate-400">Average Temperature</p>
                  <p className="mt-2 text-3xl font-semibold text-amber-200">{stats?.averages?.temperature ?? 0} C</p>
                </div>
              </div>
            </div>
          </section>

          <section id="history" className="glass-panel p-5 md:p-6">
            <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="section-title">Historical Log</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Telemetry Archive</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Review processed readings, filtered outputs, and fault labels from the most recent telemetry frames.
                </p>
              </div>
              <div className="text-sm text-slate-400">
                Current section: <span className="text-white">{activeSection}</span>
              </div>
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
                        <span
                          className={`status-chip ${
                            row.status === "FAULT"
                              ? "border-rose-400/20 bg-rose-400/10 text-rose-200"
                              : "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
