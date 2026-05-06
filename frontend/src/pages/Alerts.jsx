import { useDashboardData } from "../context/DashboardDataContext";

function Alerts() {
  const { latest, history, stats } = useDashboardData();
  const alertRows = history.filter((row) => row.status !== "NORMAL");

  const getAlertStyle = (status) => {
    if (status === "SENSOR_FAULT") {
      return {
        wrapper: "border-amber-300/15 bg-amber-300/8",
        chip: "border-amber-300/20 bg-amber-300/10 text-amber-100",
        label: "Sensor Fault",
      };
    }

    if (status === "CONTAMINATION") {
      return {
        wrapper: "border-sky-300/15 bg-sky-300/8",
        chip: "border-sky-300/20 bg-sky-300/10 text-sky-100",
        label: "Contamination Alert",
      };
    }

    return {
      wrapper: "border-rose-400/15 bg-rose-500/8",
      chip: "border-rose-400/20 bg-rose-400/10 text-rose-200",
      label: "Critical Event",
    };
  };

  const getLiveTone = (status) => {
    if (status === "SENSOR_FAULT") {
      return "text-amber-200";
    }
    if (status === "CONTAMINATION") {
      return "text-sky-200";
    }
    if (status === "CRITICAL") {
      return "text-rose-300";
    }
    return "text-emerald-300";
  };

  return (
    <div className="grid gap-4 2xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
      <section className="glass-panel p-5 md:p-6">
        <p className="section-title">Fault Broadcast</p>
        <h3 className="mt-3 text-3xl font-semibold text-white">Alert Center</h3>
        <div className="mt-6 space-y-4">
          {alertRows.length ? (
            alertRows.map((row) => {
              const style = getAlertStyle(row.status);
              return (
              <div key={row.id} className={`rounded-[24px] border p-5 ${style.wrapper}`}>
                <div className={`status-chip ${style.chip}`}>{style.label}</div>
                <p className="mt-4 text-sm leading-7 text-slate-300">
                  {new Date(row.created_at).toLocaleString()} | pH residual {row.residual_ph} | temperature residual {row.residual_temperature}
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-400">
                  Raw pH {row.ph} | raw temperature {row.temperature}
                </p>
                {row.classification_reason ? (
                  <p className="mt-2 text-sm leading-7 text-slate-500">{row.classification_reason}</p>
                ) : null}
              </div>
            );
            })
          ) : (
            <div className="rounded-[24px] border border-emerald-400/15 bg-emerald-500/8 p-5 text-emerald-100">
              No active alert rows in the recent telemetry window.
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="glass-panel p-5">
          <p className="section-title">Live Status</p>
          <p className={`mt-3 text-3xl font-semibold ${getLiveTone(latest?.status)}`}>
            {latest?.status || "NO DATA"}
          </p>
          {latest?.classification_reason ? (
            <p className="mt-3 text-sm leading-7 text-slate-500">{latest.classification_reason}</p>
          ) : null}
          <p className="mt-3 text-sm leading-7 text-slate-400">
            Most recent frame is {latest ? `from ${new Date(latest.created_at).toLocaleString()}` : "not yet available"}.
          </p>
        </div>

        <div className="glass-panel p-5">
          <p className="section-title">Summary</p>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-3">
              <span className="text-sm text-slate-300">Sensor Faults</span>
              <span className="font-medium text-amber-200">{stats?.totals?.sensorFaults ?? 0}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-3">
              <span className="text-sm text-slate-300">Contamination Alerts</span>
              <span className="font-medium text-sky-200">{stats?.totals?.contaminationAlerts ?? 0}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-3">
              <span className="text-sm text-slate-300">Critical Events</span>
              <span className="font-medium text-rose-300">{stats?.totals?.criticalAlerts ?? 0}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-3">
              <span className="text-sm text-slate-300">Normal Frames</span>
              <span className="font-medium text-emerald-300">{stats?.totals?.normal ?? 0}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Alerts;
