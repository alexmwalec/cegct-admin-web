import React, { useEffect, useState } from "react";
import AdminLayout from "../components/layout/AdminLayout";
import AnalyticsCharts from "../components/dashboard/AnalyticsCharts";
import StatCard from "../components/dashboard/StatCard";
import { apiRequest } from "../services/api";

const Analytics = () => {
  const [range, setRange] = useState("30d");
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
 
  useEffect(() => {
    let active = true;
    setLoading(true);
    apiRequest(`/analytics?range=${range}`)
      .then((result) => {
        if (active) {
          setAnalytics(result.data);
          setError("");
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    }; 
  }, [range]);
  return (
    <AdminLayout title="Analytics">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-widest text-gray-500">
            INSIGHTS & IMPACT
          </p>
          <h1 className="my-2 font-['Manrope',sans-serif] text-3xl font-bold text-gray-900 sm:text-4xl">
            Environmental analytics
          </h1>
          <p className="text-base text-gray-600">
            Track trends and measure your region’s impact.
          </p>
        </div>
        <label className="flex items-center gap-3 text-sm font-semibold text-gray-700">
          Date range
          <select
            className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-normal"
            value={range}
            onChange={(event) => setRange(event.target.value)}
          >
            <option value="7d">This week</option>
            <option value="30d">Last 30 days</option>
            <option value="2m">Last 2 months</option>
            <option value="1y">This year</option>
          </select>
        </label>
      </div>
      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Reports received"
          value={analytics?.reportsCount ?? "—"}
          change="Report count"
          note={`for ${range === "7d" ? "this week" : range === "30d" ? "the last 30 days" : range === "2m" ? "the last 2 months" : "this year"}`}
          icon="▤"
        />
        <StatCard
          title="Resolution rate"
          value={analytics ? `${analytics.resolutionRate}%` : "—"}
          change={`${analytics?.resolvedCount ?? 0} resolved`}
          note="of reports in selected period"
          icon="✓"
        />
        <StatCard
          title="Avg. response time"
          value={analytics?.avgResolutionHours == null ? "—" : `${analytics.avgResolutionHours}h`}
          change="Average resolution"
          note="time from submission to resolution"
          icon="◷"
        />
        <StatCard
          title="Open reports"
          value={analytics ? Math.max(0, analytics.reportsCount - analytics.resolvedCount) : "—"}
          change="Open reports"
          note="awaiting resolution"
          icon="◷"
        />
      </div>
      {loading && <p className="mb-4 text-sm text-gray-500">Loading analytics…</p>}
      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      <AnalyticsCharts analytics={analytics} />
    </AdminLayout>
  );
};

export default Analytics;
