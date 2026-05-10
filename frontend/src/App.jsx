import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import DashboardLayout from "./components/DashboardLayout";
import Overview from "./pages/Overview";
import Hardware from "./pages/Hardware";
import Analytics from "./pages/Analytics";
import Alerts from "./pages/Alerts";
import History from "./pages/History";
import Settings from "./pages/Settings";
import { useAuth } from "./context/AuthContext";
import { DashboardDataProvider } from "./context/DashboardDataContext";

const ProtectedRoute = ({ children }) => {
  const { token, authLoading } = useAuth();
  if (authLoading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-600">Loading session...</div>;
  }
  return token ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { token, authLoading } = useAuth();
  if (authLoading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-600">Loading session...</div>;
  }
  return token ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/dashboard" replace />}
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardDataProvider>
              <DashboardLayout />
            </DashboardDataProvider>
          </ProtectedRoute>
        }
      >
        <Route index element={<Overview />} />
        <Route path="hardware" element={<Hardware />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="history" element={<History />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
