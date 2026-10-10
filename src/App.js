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
import { DashboardProvider } from "./lib/AppContext";

const App = () => (
  <BrowserRouter>
    <DashboardProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/map" element={<LiveReportMap />} />
        <Route path="/dashboard/recent" element={<RecentReports />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/report/:id" element={<ReportDetailModal />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/officers" element={<Officers />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </DashboardProvider>
  </BrowserRouter>
);

export default App;
