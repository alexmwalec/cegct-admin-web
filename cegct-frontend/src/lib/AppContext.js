import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { apiRequest } from "../services/api";
import { socket } from "../services/socket";

const DashboardContext = createContext(null);

export const DashboardProvider = ({ children }) => {
  const [reports, setReports] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [token, setToken] = useState(() => localStorage.getItem("cegct_token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState("");
  const [realtimeConnected, setRealtimeConnected] = useState(socket.connected);

  const logout = useCallback(() => {
    localStorage.removeItem("cegct_token");
    setToken(null);
    setUser(null);
    setReports([]);
    setOfficers([]);
    setError("");
    socket.disconnect();
    setRealtimeConnected(false);
  }, []);

  useEffect(() => {
    window.addEventListener("cegct:session-expired", logout);
    return () => window.removeEventListener("cegct:session-expired", logout);
  }, [logout]);

  const loadReports = useCallback(async ({ silent = false } = {}) => {
    if (!token) {
      setReports([]);
      setLoading(false);
      return;
    }
    if (!silent) setLoading(true);
    try {
      const result = await apiRequest("/reports");
      setReports(result.data || []);
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setRealtimeConnected(false);
      return undefined;
    }
    loadReports();
    apiRequest("/auth/me")
      .then((result) => setUser(result.user))
      .catch((requestError) => {
        setError(requestError.message);
        localStorage.removeItem("cegct_token");
        setToken(null);
      });
    apiRequest("/officers")
      .then((result) => setOfficers(result.data || []))
      .catch((requestError) => setError(requestError.message));

    socket.auth = { token };
    const onConnect = () => {
      setRealtimeConnected(true);
      loadReports({ silent: true });
    };
    const onDisconnect = () => setRealtimeConnected(false);
    const onNewReport = (report) => setReports((items) => [report, ...items.filter((item) => item.id !== report.id)]);
    const onReportUpdated = (report) => setReports((items) => items.map((item) => item.id === report.id ? { ...item, ...report } : item));
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("admin:new_report", onNewReport);
    socket.on("report:updated", onReportUpdated);
    socket.connect();
    const refreshVisibleReports = () => {
      if (document.visibilityState === "visible") loadReports({ silent: true });
    };
    const refreshTimer = window.setInterval(refreshVisibleReports, 15000);
    document.addEventListener("visibilitychange", refreshVisibleReports);
    return () => {
      window.clearInterval(refreshTimer);
      document.removeEventListener("visibilitychange", refreshVisibleReports);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("admin:new_report", onNewReport);
      socket.off("report:updated", onReportUpdated);
      socket.disconnect();
    };
  }, [token, loadReports]);

  const login = async (email, password) => {
    const result = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem("cegct_token", result.token);
    setUser(result.user);
    setToken(result.token);
    return result.user;
  };

  const updateReport = async (id, updates) => {
    try {
      const result = await apiRequest(`/reports/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...(updates.status ? { status: updates.status } : {}),
          ...(updates.assignedOfficerId !== undefined ? { assignedOfficerId: updates.assignedOfficerId } : {}),
          ...(updates.note ? { note: updates.note } : {}),
        }),
      });
      setReports((items) => items.map((item) => item.id === id ? { ...item, ...result.data } : item));
      setError("");
      return result.data;
    } catch (requestError) {
      setError(requestError.message);
      return null;
    }
  };

  return (
    <DashboardContext.Provider value={{ reports, officers, updateReport, loadReports, loading, error, setError, login, logout, token, user, realtimeConnected }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) throw new Error("useDashboard must be used inside DashboardProvider");
  return context;
};
