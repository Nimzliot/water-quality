import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useDashboardData } from "../context/DashboardDataContext";

function DashboardLayout() {
  const { hardware, error, refresh, loading } = useDashboardData();

  return (
    <div className="min-h-screen px-4 py-4 md:px-6">
      <div className="mx-auto grid max-w-[1800px] items-start gap-4 xl:grid-cols-[290px_minmax(0,1fr)]">
        <Sidebar />

        <main className="min-w-0 space-y-4">
          <div className="glass-panel overflow-hidden p-4 md:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="section-title">Operational Deck</p>
                <h2 className="mt-3 text-3xl font-semibold leading-tight text-stone-50 md:text-5xl">
                  Cross-Validated Water Quality Control Room
                </h2>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-300/75 md:text-base">
                  A steadier, more custom operator shell for live telemetry, device heartbeat visibility, analytics, alerts, and historical review.
                </p>
              </div>

              <div className="flex flex-col items-stretch gap-3 md:flex-row">
                <div
                  className={`status-chip justify-center ${
                    hardware.connected
                      ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
                      : "border-amber-300/20 bg-amber-300/10 text-amber-100"
                  }`}
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${hardware.connected ? "bg-emerald-300" : "bg-amber-300"}`} />
                  {hardware.connected ? "Hardware Connected" : "Hardware Disconnected"}
                </div>
                <button className="secondary-button" onClick={refresh} disabled={loading}>
                  {loading ? "Loading..." : "Refresh Live Data"}
                </button>
              </div>
            </div>
          </div>

          {error ? <div className="glass-panel border border-red-300/20 p-4 text-red-200">{error}</div> : null}
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
