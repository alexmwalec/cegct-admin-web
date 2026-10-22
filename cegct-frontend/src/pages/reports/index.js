import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import StatusBadge from "../../components/ui/StatusBadge";
import SeverityBadge from "../../components/ui/SeverityBadge";
import { useDashboard } from "../../lib/AppContext";
import { statusOptions, labelCase } from "../../lib/reportData";
import { formatDate } from "../../lib/utils";

const Reports = () => {
  const { reports, loading } = useDashboard();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [category, setCategory] = useState("All categories");
  const [page, setPage] = useState(0);
  const pageSize = 13;
  const categories = [...new Set(reports.map((report) => report.category))];
  const filtered = useMemo(
    () =>
      reports.filter(
        (report) =>
          (status === "All statuses" || report.status === status) &&
          (category === "All categories" || report.category === category) &&
          `${report.id} ${report.location} ${report.description}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [reports, query, status, category],
  );
  const pageCount = Math.ceil(filtered.length / pageSize);
  const currentPage = Math.min(page, Math.max(0, pageCount - 1));
  const visibleReports = filtered.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  useEffect(() => {
    setPage(0);
  }, [query, status, category]);

  return (
    <AdminLayout title="Reports">
      <div className="mb-7">
        <p className="text-xs font-bold tracking-widest text-gray-500">
          CASE MANAGEMENT
        </p>
        <h1 className="my-2 font-['Manrope',sans-serif] text-3xl font-bold sm:text-4xl">
          Reports
        </h1>
        <p className="text-base text-gray-600">
          Review and track environmental cases.
        </p>
      </div>
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex flex-wrap gap-3 border-b border-gray-200 p-4">
          <input
            className="min-w-[16rem] flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by code, location or description"
          />
          <select
            className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option>All statuses</option>
            {statusOptions.map((value) => (
              <option key={value} value={value}>
                {labelCase(value)}
              </option>
            ))}
          </select>
          <select
            className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option>All categories</option>
            {categories.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-gray-50 text-xs font-bold text-gray-500">
              <tr>
                {[
                  "CASE ID",
                  "CATEGORY",
                  "SEVERITY",
                  "STATUS",
                  "LOCATION",
                  "DATE",
                ].map((heading) => (
                  <th className="px-4 py-3" key={heading}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleReports.map((report) => (
                <tr
                  className="border-t border-gray-100 text-sm hover:bg-gray-50"
                  key={report.id}
                >
                  <td className="px-4 py-4">
                    <Link
                      className="font-semibold text-[#185835]"
                      to={`/report/${report.id}`}
                    >
                      {report.id}
                    </Link>
                  </td>
                  <td className="px-4 py-4">{report.category}</td>
                  <td className="px-4 py-4">
                    <SeverityBadge severity={report.severity} />
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={report.status} />
                  </td>
                  <td className="px-4 py-4">{report.location}</td>
                  <td className="px-4 py-4">{formatDate(report.createdAt || report.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <p className="p-8 text-center text-sm text-gray-500">Loading reports…</p>}
          {!loading && !filtered.length && (
            <p className="p-8 text-center text-sm text-gray-500">
              No reports match these filters.
            </p>
          )}
        </div>
        {!loading && filtered.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-4 py-3">
            <p className="text-sm text-gray-600">
              Showing {currentPage * pageSize + 1}–{Math.min((currentPage + 1) * pageSize, filtered.length)} of {filtered.length} reports
            </p>
            <div className="flex items-center gap-2">
              <button
                aria-label="Previous reports"
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={currentPage === 0}
                onClick={() => setPage((value) => Math.max(0, value - 1))}
                type="button"
              >
                ← Previous
              </button>
              <span className="px-2 text-sm text-gray-600">{currentPage + 1} / {pageCount}</span>
              <button
                aria-label="Next reports"
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={currentPage >= pageCount - 1}
                onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))}
                type="button"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </section>
    </AdminLayout>
  );
};

export default Reports;
