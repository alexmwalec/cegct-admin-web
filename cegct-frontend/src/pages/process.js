import React from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/layout/AdminLayout";
import { useDashboard } from "../lib/AppContext";
import StatusBadge from "../components/ui/StatusBadge";
import { formatDate } from "../lib/utils";

const citizenSteps = [
  {
    number: "01",
    title: "Citizen records the issue",
    description: "In the mobile app, the citizen chooses the environmental issue, explains what happened, adds an optional photo, and captures the location. The API saves the report and sends attached evidence to Cloudinary.",
    result: "The report is sent securely to the CEGCT API.",
  },
  {
    number: "02",
    title: "A case number is created",
    description: "The system saves the report and creates a unique case number. The citizen can use this number when contacting the response team.",
    result: "Example format: DD-MM-YYYY-ID001.",
    status: "SUBMITTED",
  },
  {
    number: "03",
    title: "The citizen receives acknowledgement",
    description: "An administrator opens the case conversation and sends the case number and acknowledgement to the citizen.",
    result: "The citizen can see the reply in the mobile case conversation.",
  },
];

const responseSteps = [
  {
    number: "04",
    title: "Officer reviews the evidence",
    description: "The team checks the description, location, urgency, and attached photo, then moves the case to Under review.",
    status: "UNDER_REVIEW",
  },
  {
    number: "05",
    title: "The team takes action",
    description: "Staff records progress notes, contacts the citizen when clarification is needed, and marks the case In progress when response work begins.",
    status: "IN_PROGRESS",
  },
  {
    number: "06",
    title: "Resolution is recorded and shared",
    description: "When the issue is handled, staff records a final update and marks the case Resolved. The citizen receives the new status in the mobile app.",
    status: "RESOLVED",
  },
];

const ProcessStep = ({ number, title, description, result, status }) => (
  <li className="relative flex gap-4 pb-7 last:pb-0">
    <span className="relative z-[1] grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#185835] text-sm font-bold text-white ring-4 ring-green-50">
      {number}
    </span>
    <div className="min-w-0 flex-1 pt-1">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-bold text-gray-900">{title}</h3>
        {status && <StatusBadge status={status} />}
      </div>
      <p className="mt-1 text-sm leading-6 text-gray-600">{description}</p>
      {result && <p className="mt-2 text-sm font-semibold text-[#185835]">{result}</p>}
    </div>
  </li>
);

const ReportingProcess = () => {
  const { reports, realtimeConnected, loading } = useDashboard();
  const latestReport = reports[0];

  return (
    <AdminLayout title="Reporting process">
      <div className="mb-7">
        <p className="text-xs font-bold tracking-widest text-gray-500">PRESENTATION GUIDE</p>
        <h1 className="my-2 font-['Manrope',sans-serif] text-3xl font-bold sm:text-4xl">How a report is handled</h1>
        <p className="max-w-3xl text-base leading-7 text-gray-600">
          Use this guide to explain the full journey in a presentation: from a citizen submitting an environmental concern to the response team resolving it and informing the citizen.
        </p>
      </div>

      <div className="mb-6 grid gap-5 xl:grid-cols-2">
        <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-7">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-wider text-green-800">Citizen side · Mobile app</p>
            <h2 className="mt-1 text-xl font-bold">Report and acknowledgement</h2>
          </div>
          <ol className="relative before:absolute before:bottom-5 before:left-5 before:top-5 before:w-px before:bg-green-100">
            {citizenSteps.map((step) => <ProcessStep key={step.number} {...step} />)}
          </ol>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-7">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-wider text-green-800">Response side · Admin dashboard</p>
            <h2 className="mt-1 text-xl font-bold">Review through resolution</h2>
          </div>
          <ol className="relative before:absolute before:bottom-5 before:left-5 before:top-5 before:w-px before:bg-green-100">
            {responseSteps.map((step) => <ProcessStep key={step.number} {...step} />)}
          </ol>
        </section>
      </div>

      <section className="mb-6 rounded-xl border border-green-200 bg-green-50 p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-green-800">Live presentation sequence</p>
            <h2 className="mt-1 text-xl font-bold text-gray-900">Demonstrate the process with a real report</h2>
          </div>
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${realtimeConnected ? "bg-white text-green-800" : "bg-amber-100 text-amber-800"}`}>
            <span className={`h-2.5 w-2.5 rounded-full ${realtimeConnected ? "animate-pulse bg-green-600" : "bg-amber-500"}`} />
            {realtimeConnected ? "Dashboard connected" : "Dashboard reconnecting"}
          </span>
        </div>
        <ol className="mt-5 grid gap-3 text-sm leading-6 text-gray-700 md:grid-cols-2">
          <li className="rounded-lg bg-white p-4"><b>1. Show the citizen flow.</b> On the mobile app, select a category, enter the issue details, attach an optional photo, confirm location, and submit.</li>
          <li className="rounded-lg bg-white p-4"><b>2. Show the handoff.</b> Open Reports on this dashboard and find the new case number. Open it to show the location, evidence, and status.</li>
          <li className="rounded-lg bg-white p-4"><b>3. Acknowledge the citizen.</b> In Case conversation, select “Send case number to citizen”. Show the reply on the mobile case conversation.</li>
          <li className="rounded-lg bg-white p-4"><b>4. Show follow-up.</b> Change the status, add a progress note, and save. Show the updated status and message in the citizen app.</li>
        </ol>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link className="rounded-lg bg-[#185835] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#12452a]" to="/reports">Open reports queue</Link>
          {latestReport && <Link className="rounded-lg border border-green-800 bg-white px-4 py-2.5 text-sm font-semibold text-green-900 hover:bg-green-100" to={`/report/${encodeURIComponent(latestReport.id)}`}>Open latest case · {latestReport.id}</Link>}
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">Current live queue</h2>
            <p className="mt-1 text-sm text-gray-500">Use a real case during the demonstration so the audience can follow its progress.</p>
          </div>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">{reports.length} cases</span>
        </div>
        {loading ? (
          <p className="mt-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">Loading live reports…</p>
        ) : latestReport ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 p-4">
            <div>
              <Link className="font-bold text-[#185835] hover:underline" to={`/report/${encodeURIComponent(latestReport.id)}`}>{latestReport.id}</Link>
              <p className="mt-1 text-sm text-gray-600">{latestReport.category} · {latestReport.location}</p>
              <p className="mt-1 text-xs text-gray-500">Submitted {formatDate(latestReport.createdAt || latestReport.date)}</p>
            </div>
            <StatusBadge status={latestReport.status} />
          </div>
        ) : (
          <p className="mt-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">No reports are available yet. Submit one from the mobile app to demonstrate the live handoff.</p>
        )}
      </section>
    </AdminLayout>
  );
};

export default ReportingProcess;
