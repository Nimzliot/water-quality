import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useDashboardData } from "../context/DashboardDataContext";

const navItems = [
  { to: "/dashboard", label: "Overview" },
  { to: "/dashboard/hardware", label: "Hardware" },
  { to: "/dashboard/analytics", label: "Analytics" },
  { to: "/dashboard/alerts", label: "Alerts" },
  { to: "/dashboard/history", label: "History" },
  { to: "/dashboard/settings", label: "Settings" },
];

function Sidebar() {
  const { user, logout } = useAuth();
  const { hardware } = useDashboardData();

  return (
    <aside className="glass-panel overflow-hidden xl:sticky xl:top-4 xl:h-[calc(100vh-2rem)] xl:self-start">
      <div className="flex h-full flex-col">
        <div className="border-b border-white/5 p-5">
          <div className="rounded-[28px] border border-amber-200/10 bg-[linear-gradient(180deg,rgba(66,52,40,0.55),rgba(29,24,20,0.45))] p-5">
            <p className="section-title">Research Core</p>
            <h1 className="mt-4 text-3xl font-semibold leading-tight text-stone-50">
              Aqua Sentinel
              <br />
              Operator Suite
            </h1>
            <p className="mt-4 text-sm leading-7 text-stone-300/70">
              Multi-page monitoring for heartbeat status, anomaly analytics, operator alerts, and historical telemetry review.
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="rounded-[24px] border border-amber-100/10 bg-[rgba(255,248,239,0.03)] p-4">
            <p className="section-title text-[10px]">Hardware Signal</p>
            <div className="mt-3 flex flex-col gap-3">
              <span className="text-sm text-stone-200">{hardware.deviceId || "ESP32 Node"}</span>
              <span
                className={`status-chip w-fit ${
                  hardware.connected
                    ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
                    : "border-amber-300/20 bg-amber-300/10 text-amber-100"
                }`}
              >
                {hardware.connected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>

          <nav className="mt-6 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/dashboard"}
              className={({ isActive }) =>
                `flex rounded-2xl px-4 py-3 text-sm transition ${
                  isActive
                    ? "bg-amber-200/10 text-amber-50 ring-1 ring-amber-200/20"
                    : "text-stone-400 hover:bg-white/5 hover:text-stone-100"
                }`
              }
            >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="border-t border-white/5 p-5">
          <div className="rounded-[26px] bg-[rgba(255,248,239,0.04)] p-4">
            <p className="break-all text-sm font-semibold text-stone-100">{user?.email}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.3em] text-stone-500">Authenticated Operator</p>
            <button className="secondary-button mt-4 w-full" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
