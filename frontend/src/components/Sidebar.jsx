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
        <div className="border-b border-black/5 p-5">
          <div className="rounded-[28px] border border-black/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(240,240,240,0.95))] p-5">
            <p className="section-title">Research Core</p>
            <h1 className="mt-4 text-3xl font-semibold leading-tight text-stone-950">
              Aqua Sentinel
              <br />
              Operator Suite
            </h1>
            <p className="mt-4 text-sm leading-7 text-stone-600">
              Multi-page monitoring for heartbeat status, anomaly analytics, operator alerts, and historical telemetry review.
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="rounded-[24px] border border-black/10 bg-black/[0.02] p-4">
            <p className="section-title text-[10px]">Hardware Signal</p>
            <div className="mt-3 flex flex-col gap-3">
              <span className="text-sm text-stone-800">{hardware.deviceId || "ESP32 Node"}</span>
              <span
                className={`status-chip w-fit ${
                  hardware.connected
                    ? "border-black/15 bg-black/5 text-black"
                    : "border-black/10 bg-black/5 text-neutral-600"
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
                    ? "bg-black/10 text-black ring-1 ring-black/15"
                    : "text-stone-500 hover:bg-black/5 hover:text-stone-900"
                }`
              }
            >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="border-t border-black/5 p-5">
          <div className="rounded-[26px] bg-black/[0.03] p-4">
            <p className="break-all text-sm font-semibold text-stone-900">{user?.email}</p>
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
