import React from "react";
import AdminLayout from "../components/layout/AdminLayout";
import { useDashboard } from "../lib/AppContext";

const Officers = () => {
  const { officers, reports, loading } = useDashboard();
  const activeAssignments = reports.filter((report) => report.assignedOfficerId && report.status !== "RESOLVED").length;
  return (
  <AdminLayout title="Officers">
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs font-bold tracking-widest text-gray-500">
          TEAM MANAGEMENT
        </p>
        <h1 className="my-2 font-['Manrope',sans-serif] text-3xl font-bold text-gray-900 sm:text-4xl">
          Regional officers
        </h1>
        <p className="text-base text-gray-600">
          Manage your response team and active assignments.
        </p>
      </div>
      <p className="rounded-lg bg-green-50 px-4 py-3 text-sm font-semibold text-green-900">{officers.length} registered inspectors</p>
    </div>
    <div className="mb-5 grid grid-cols-2 overflow-hidden rounded-xl border border-gray-200 bg-white sm:grid-cols-4">
      {[
        [officers.length, "Team members"],
        ["—", "Availability"],
        [activeAssignments, "Active assignments"],
        ["—", "Average rating"],
      ].map(([value, label]) => (
        <div
          className="border-b border-r border-gray-100 p-4 last:border-r-0 sm:border-b-0"
          key={label}
        >
          <b className="block text-2xl">{value}</b>
          <span className="text-sm text-gray-500">{label}</span>
        </div>
      ))}
    </div>
    <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
      <h2 className="mb-4 text-lg font-bold">Officer directory</h2>
      {loading && <p className="mb-4 text-sm text-gray-500">Loading officer directory…</p>}
      {!loading && !officers.length && <p className="mb-4 text-sm text-gray-500">No inspectors have been added to the users table yet.</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        {officers.map((officer, index) => {
          const initials = officer.name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
          const active = reports.filter((report) => report.assignedOfficerId === officer.id && report.status !== "RESOLVED").length;
          const resolved = reports.filter((report) => report.assignedOfficerId === officer.id && report.status === "RESOLVED").length;
          return (
          <article
            className="rounded-lg border border-gray-200 p-5"
            key={officer.id}
          >
            <div className="flex items-center gap-3">
              <span
                className={`grid h-12 w-12 place-items-center rounded-full text-sm font-bold ${["bg-green-100 text-green-800", "bg-indigo-100 text-indigo-800", "bg-rose-100 text-rose-800", "bg-amber-100 text-amber-800"][index]}`}
              >
                {initials}
              </span>
              <div>
                <b className="block text-base">{officer.name}</b>
                <span className="text-sm text-gray-500">{officer.email}</span>
              </div>
              <span className="ml-auto text-xs text-green-700">
                ● Available
              </span>
            </div>
            <p className="mt-4 border-b border-gray-100 pb-3 text-sm text-gray-600">
              ☎ {officer.phone || "Phone not provided"}
            </p>
            <div className="flex justify-between pt-3 text-sm text-gray-500">
              <span>
                <b className="text-gray-800">{active}</b> active cases
              </span>
              <span>
                <b className="text-gray-800">{resolved}</b> resolved this month
              </span>
            </div>
          </article>
        );})}
      </div>
    </section>
  </AdminLayout>
  );
};

export default Officers;
