import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import Analytics from "./pages/analytics";
import Officers from "./pages/officers";
import Reports from "./pages/reports";
import LiveReportMap from "./components/dashboard/LiveReportMap";
import RecentReports from "./components/dashboard/RecentReports";
import ReportDetailModal from "./components/reports/ReportDetailModal";
import ReportingProcess from "./pages/process";
import { DashboardProvider, useDashboard } from "./lib/AppContext";

const StaffRoute = ({ children }) => {
  const { token } = useDashboard();
  return token ? children : <Navigate to="/login" replace />;
};

const App = () => (
  <BrowserRouter>
    <DashboardProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<StaffRoute><Dashboard /></StaffRoute>} />
        <Route path="/dashboard/map" element={<StaffRoute><LiveReportMap /></StaffRoute>} />
        <Route path="/dashboard/recent" element={<StaffRoute><RecentReports /></StaffRoute>} />
        <Route path="/reports" element={<StaffRoute><Reports /></StaffRoute>} />
        <Route path="/process" element={<StaffRoute><ReportingProcess /></StaffRoute>} />
        <Route path="/report/:id" element={<StaffRoute><ReportDetailModal /></StaffRoute>} />
        <Route path="/analytics" element={<StaffRoute><Analytics /></StaffRoute>} />
        <Route path="/officers" element={<StaffRoute><Officers /></StaffRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </DashboardProvider>
  </BrowserRouter>
);

export default App;
