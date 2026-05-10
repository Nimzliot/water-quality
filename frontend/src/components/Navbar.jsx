import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <div className="glass-panel flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-neutral-600">
          Cross-Validated Multi-Sensor Fault Detection
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-black">
          Water Quality Research Dashboard
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="rounded-xl border border-black/10 bg-white/70 px-4 py-2 text-sm text-black">
          {user?.email}
        </div>
        <button className="primary-button" onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;
