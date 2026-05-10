import { useDashboardData } from "../context/DashboardDataContext";

function Alerts() {
  const { latest, history, stats } = useDashboardData();
  const alertRows = history.filter((row) => row.status !== "NORMAL");

  const getAlertStyle = (status) => {
    if (status === "SENSOR_FAULT") {
      return {
        wrapper: "border-black/10 bg-black/[0.02]",
        chip: "border-black/10 bg-black/5 text-black",
        label: "Sensor Fault",
      };
    }

    if (status === "CONTAMINATION") {
      return {
        wrapper: "border-black/10 bg-black/[0.02]",
        chip: "border-black/10 bg-black/5 text-black",
        label: "Contamination Alert",
      };
    }

    return {
      wrapper: "border-black/10 bg-black/[0.03]",
      chip: "border-black/10 bg-black/5 text-black",
      label: "Critical Event",
    };
  };

  const getLiveTone = (status) => {
    if (status === "SENSOR_FAULT") {
      return "text-stone-700";
    }
    if (status === "CONTAMINATION") {
      return "text-stone-800";
    }
    if (status === "CRITICAL") {
      return "text-black";
    }
    return "text-stone-600";
  };

  return (
    <div className="grid gap-4 2xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
      <section className="glass-panel p-5 md:p-6">
        <p className="section-title">Fault Broadcast</p>
        <h3 className="mt-3 text-3xl font-semibold text-black">Alert Center</h3>
        <div className="mt-6 space-y-4">
          {alertRows.length ? (
            alertRows.map((row) => {
              const style = getAlertStyle(row.status);
              return (
              <div key={row.id} className={`rounded-[24px] border p-5 ${style.wrapper}`}>
                <div className={`status-chip ${style.chip}`}>{style.label}</div>
                <p className="mt-4 text-sm leading-7 text-slate-700">
                  {new Date(row.created_at).toLocaleString()} | pH residual {row.residual_ph} | temperature residual {row.residual_temperature}
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Raw pH {row.ph} | raw temperature {row.temperature}
                </p>
                {row.classification_reason ? (
                  <p className="mt-2 text-sm leading-7 text-slate-500">{row.classification_reason}</p>
                ) : null}
              </div>
            );
            })
          ) : (
            <div className="rounded-[24px] border border-black/10 bg-black/[0.02] p-5 text-neutral-800">
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
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Most recent frame is {latest ? `from ${new Date(latest.created_at).toLocaleString()}` : "not yet available"}.
          </p>
        </div>

        <div className="glass-panel p-5">
          <p className="section-title">Summary</p>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-2xl bg-black/[0.03] px-4 py-3">
              <span className="text-sm text-slate-700">Sensor Faults</span>
              <span className="font-medium text-black">{stats?.totals?.sensorFaults ?? 0}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-black/[0.03] px-4 py-3">
              <span className="text-sm text-slate-700">Contamination Alerts</span>
              <span className="font-medium text-black">{stats?.totals?.contaminationAlerts ?? 0}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-black/[0.03] px-4 py-3">
              <span className="text-sm text-slate-700">Critical Events</span>
              <span className="font-medium text-black">{stats?.totals?.criticalAlerts ?? 0}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-black/[0.03] px-4 py-3">
              <span className="text-sm text-slate-700">Normal Frames</span>
              <span className="font-medium text-black">{stats?.totals?.normal ?? 0}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Alerts;
