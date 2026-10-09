import React from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/layout/AdminLayout";
import StatCard from "../components/dashboard/StatCard";
import LiveReportMap from "../components/dashboard/LiveReportMap";
import RecentReports from "../components/dashboard/RecentReports";
import { useDashboard } from "../lib/AppContext";

const Dashboard = () => {
  const { reports } = useDashboard();
  const pending = reports.filter((report) =>
    ["SUBMITTED", "UNDER_REVIEW"].includes(report.status),
  ).length;
  const progress = reports.filter(
    (report) => report.status === "IN_PROGRESS",
  ).length;
  const resolved = reports.filter(
    (report) => report.status === "RESOLVED",
  ).length;

  return (
    <AdminLayout title="Overview">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-widest text-gray-500">
            THURSDAY, OCTOBER 9, 2026
          </p>
          <h1 className="my-2 font-['Manrope',sans-serif] text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Good morning, Thoko <span className="text-green-700"></span>
          </h1>
          <p className="text-base text-gray-600">
            Here’s what’s happening across your region today.
          </p>
        </div>
        <Link
          className="rounded-lg bg-[#185835] px-5 py-3 text-sm font-semibold text-white hover:bg-[#12472a]"
          to="/reports"
        >
          View reports queue <span className="ml-2">→</span>
        </Link>
      </div>
      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total reports"
          value={reports.length}
          change="↑ 12%"
          note="vs. last month"
          icon="▤"
        />
        <StatCard
          title="Pending review"
          value={pending}
          change="Needs attention"
          note="Review new cases"
          icon="◷"
        />
        <StatCard
          title="In progress"
          value={progress}
          change="Active cases"
          note="Across your region"
          icon="↗"
        />
        <StatCard
          title="Resolved cases"
          value={resolved}
          change="↑ 8%"
          note="vs. last month"
          icon="✓"
        />
      </div>
      <div className="mb-5 grid gap-5 xl:grid-cols-[1.45fr_1fr]">
        <LiveReportMap />
        <RecentReports />
      </div>
      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold">Regional response</h2>
            <p className="mt-1 text-sm text-gray-500">
              Monthly case resolution performance
            </p>
          </div>
          <span className="text-sm text-gray-500">This month</span>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          <div>
            <span className="block text-sm text-gray-500">Resolution rate</span>
            <b className="mt-1 block text-2xl text-[#185835]">78%</b>
          </div>
          <div>
            <span className="block text-sm text-gray-500">
              Average response time
            </span>
            <b className="mt-1 block text-2xl">4.2 hrs</b>
          </div>
          <div>
            <span className="block text-sm text-gray-500">
              Citizen satisfaction
            </span>
            <b className="mt-1 block text-2xl">4.8 / 5</b>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
};

export default Dashboard;
