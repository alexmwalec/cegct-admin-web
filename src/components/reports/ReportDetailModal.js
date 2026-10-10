import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../layout/AdminLayout";
import StatusBadge from "../ui/StatusBadge";
import SeverityBadge from "../ui/SeverityBadge";
import { useDashboard } from "../../lib/AppContext";
import { officerOptions, statusOptions, labelCase } from "../../lib/reportData";

const ReportDetailModal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { reports, updateReport } = useDashboard();
  const report = reports.find((item) => item.id === id);
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);

  if (!report)
    return (
      <AdminLayout title="Case details">
        <section className="rounded-xl bg-white p-10 text-center">
          <h1 className="text-xl font-bold">Report not found</h1>
          <Link
            className="mt-4 inline-block text-green-800 underline"
            to="/reports"
          >
            Return to reports
          </Link>
        </section>
      </AdminLayout>
    );

  const addNote = () => {
    if (!note.trim()) return;
    setNotes((items) => [
      { text: note.trim(), date: new Date().toLocaleString() },
      ...items,
    ]);
    setNote("");
  };

  return (
    <AdminLayout title="Case details">
      <div className="mx-auto max-w-4xl rounded-xl border border-gray-200 bg-white p-5 sm:p-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold tracking-widest text-gray-500">
              CASE FILE
            </p>
            <h1 className="my-2 font-['Manrope',sans-serif] text-2xl font-bold sm:text-3xl">
              {report.id}
            </h1>
            <div className="flex flex-wrap gap-2">
              <SeverityBadge severity={report.severity} />
              <StatusBadge status={report.status} />
            </div>
          </div>
          <button
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
            onClick={() => navigate("/reports")}
          >
            Back to queue
          </button>
        </div>
        <h2 className="mb-2 text-xl font-bold">{report.category}</h2>
        <p className="mb-6 text-base leading-relaxed text-gray-600">
          {report.description}
        </p>
        <div className="mb-6 grid gap-4 rounded-lg bg-gray-50 p-4 sm:grid-cols-2">
          <p className="text-sm">
            <b className="mb-1 block text-xs uppercase text-gray-500">
              Location
            </b>
            ⌖ {report.location}
          </p>
          <p className="text-sm">
            <b className="mb-1 block text-xs uppercase text-gray-500">
              Submitted
            </b>
            {report.date}
          </p>
          <p className="text-sm">
            <b className="mb-1 block text-xs uppercase text-gray-500">
              Reported by
            </b>
            {report.reporter}
          </p>
          <p className="text-sm">
            <b className="mb-1 block text-xs uppercase text-gray-500">
              Coordinates
            </b>
            {report.latitude}, {report.longitude}
          </p>
        </div>
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold">
            Case status
            <select
              className="mt-2 block h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm"
              value={report.status}
              onChange={(event) =>
                updateReport(report.id, { status: event.target.value })
              }
            >
              {statusOptions.map((value) => (
                <option key={value} value={value}>
                  {labelCase(value)}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-semibold">
            Assigned officer
            <select
              className="mt-2 block h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm"
              value={report.officer}
              onChange={(event) =>
                updateReport(report.id, { officer: event.target.value })
              }
            >
              {officerOptions.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
        </div>
        <h2 className="mb-3 text-lg font-bold">Case timeline</h2>
        <div className="mb-6 space-y-4 border-l-2 border-green-100 pl-4">
          {notes.map((item, index) => (
            <div key={`${item.date}-${index}`}>
              <b className="text-sm">Progress update</b>
              <p className="mt-1 text-sm text-gray-600">{item.text}</p>
              <small className="text-xs text-gray-400">{item.date}</small>
            </div>
          ))}
          <div>
            <b className="text-sm">Report submitted</b>
            <p className="mt-1 text-sm text-gray-600">
              Submitted by {report.reporter} · {report.date}
            </p>
          </div>
        </div>
        <label
          className="mb-2 block text-sm font-semibold"
          htmlFor="progress-note"
        >
          Add progress note
        </label>
        <textarea
          className="min-h-24 w-full rounded-lg border border-gray-300 p-3 text-sm"
          id="progress-note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Add an update to this case…"
        />
        <button
          className="mt-3 rounded-lg bg-[#185835] px-5 py-3 text-sm font-semibold text-white"
          onClick={addNote}
        >
          Post update
        </button>
      </div>
    </AdminLayout>
  );
};

export default ReportDetailModal;