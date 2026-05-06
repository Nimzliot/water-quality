import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";

const DashboardDataContext = createContext(null);

const formatChartData = (rows) =>
  rows.map((row) => ({
    ...row,
    time: new Date(row.created_at).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  }));

export const DashboardDataProvider = ({ children }) => {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [simulationLoading, setSimulationLoading] = useState(false);

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

  const runSimulation = async (payload) => {
    setSimulationLoading(true);

    try {
      const response = await api.post("/sensor/simulate", payload);
      await loadDashboard();
      return response.data;
    } finally {
      setSimulationLoading(false);
    }
  };

  const value = useMemo(() => {
    const latest = stats?.latest || null;
    const chartData = formatChartData(stats?.chartData || []);

    return {
      stats,
      history,
      latest,
      chartData,
      hardware: stats?.hardware || {
        connected: false,
        status: "DISCONNECTED",
        deviceId: null,
        lastHeartbeatAt: null,
        firmwareVersion: null,
        ipAddress: null,
      },
      loading,
      simulationLoading,
      error,
      refresh: loadDashboard,
      runSimulation,
    };
  }, [stats, history, loading, simulationLoading, error]);

  return <DashboardDataContext.Provider value={value}>{children}</DashboardDataContext.Provider>;
};

export const useDashboardData = () => useContext(DashboardDataContext);
