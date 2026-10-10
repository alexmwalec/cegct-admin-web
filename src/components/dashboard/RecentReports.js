import React from "react";
import { Link } from "react-router-dom";
import { useDashboard } from "../../lib/AppContext";
import SeverityBadge from "../ui/SeverityBadge";

const RecentReports = () => {
  const { reports } = useDashboard();
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold">
            Live report feed{" "}
            <span className="ml-2 rounded-full bg-green-50 px-2 py-1 align-middle text-[10px] font-bold text-green-700">
              ● Live
            </span>
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Recent reports from citizens
          </p>
        </div>
        <Link className="text-sm font-semibold text-[#185835]" to="/reports">
          View all →
        </Link>
      </div>
      {reports.slice(0, 4).map((report) => (
        <Link
          className="flex items-start gap-3 border-t border-gray-100 py-4 hover:bg-gray-50"
          key={report.id}
          to={`/report/${report.id}`}
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-green-50 text-xl text-[#185835]">
            ⌖
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center justify-between gap-2">
              <b className="text-sm">{report.category}</b>
              <time className="text-xs text-gray-500">{report.date}</time>
            </span>
            <span className="mt-1 block text-sm text-gray-600">
              {report.location}
            </span>
            <span className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-gray-400">{report.id}</span>
              <SeverityBadge severity={report.severity} />
            </span>
          </span>
        </Link>
      ))}
      <Link
        className="mt-1 block border-t border-gray-100 pt-4 text-center text-sm font-semibold text-[#185835]"
        to="/reports"
      >
        Open reports queue →
      </Link>
    </section>
  );
};

export default RecentReports;
