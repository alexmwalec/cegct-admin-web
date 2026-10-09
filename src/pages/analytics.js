import React, { useState } from "react";
import AdminLayout from "../components/layout/AdminLayout";
import AnalyticsCharts from "../components/dashboard/AnalyticsCharts";
import StatCard from "../components/dashboard/StatCard";

const Analytics = () => {
  const [range, setRange] = useState("Last 30 days");
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
            <option>This week</option>
            <option>Last 30 days</option>
            <option>Last 2 months</option>
            <option>This year</option>
          </select>
        </label>
      </div>
      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Reports received"
          value="128"
          change="↑ 14.2%"
          note={`for ${range.toLowerCase()}`}
          icon="▤"
        />
        <StatCard
          title="Resolution rate"
          value="78%"
          change="↑ 6.4%"
          note="vs. previous period"
          icon="✓"
        />
        <StatCard
          title="Avg. response time"
          value="4.2h"
          change="↓ 18%"
          note="faster than last month"
          icon="◷"
        />
        <StatCard
          title="Citizen reports"
          value="94%"
          change="↑ 3.1%"
          note="of all submissions"
          icon="♙"
        />
      </div>
      <AnalyticsCharts />
    </AdminLayout>
  );
};

export default Analytics;
