import React from "react";
import { Link } from "react-router-dom";
import { useDashboard } from "../../lib/AppContext";

const LiveReportMap = () => {
  const { reports } = useDashboard();
  const pinColors = {
    CRITICAL: "bg-red-500",
    HIGH: "bg-orange-500",
    MEDIUM: "bg-amber-400",
    LOW: "bg-green-500",
  };
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold">Incident map</h2>
          <p className="mt-1 text-sm text-gray-500">
            Environmental reports across Malawi
          </p>
        </div>
        <span className="rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-600">
          This week
        </span>
      </div>
      <div className="relative mt-5 h-72 overflow-hidden rounded-xl bg-[#e7eee5] bg-[linear-gradient(30deg,transparent_49%,#d5e0d3_50%,transparent_51%),linear-gradient(120deg,transparent_48%,#d8e2d7_49%,transparent_50%)] bg-[length:90px_92px,110px_108px]">
        <div className="absolute -right-8 top-[-15%] h-[130%] w-3 rotate-[25deg] rounded-full bg-[#bedbd7] ring-4 ring-[#dceae4]" />
        {["LILONGWE", "MZUZU", "ZOMBA", "BLANTYRE"].map((city, index) => (
          <span
            key={city}
            className={`absolute text-xs font-bold tracking-wider text-gray-500 ${["left-[28%] top-[46%]", "left-[52%] top-[17%]", "left-[70%] top-[66%]", "left-[75%] top-[81%]"][index]}`}
          >
            {city}
          </span>
        ))}
        {reports
          .filter((report) => report.status !== "RESOLVED" && Number.isFinite(report.latitude) && Number.isFinite(report.longitude))
          .map((report) => {
            const left = Math.min(96, Math.max(4, ((report.longitude - 32.5) / (36 - 32.5)) * 100));
            const top = Math.min(94, Math.max(6, ((-9 - report.latitude) / (-9 + 17.5)) * 100));
            return (
            <Link
              key={report.id}
              to={`/report/${report.id}`}
              title={report.id}
              className={`absolute z-10 grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white shadow-lg ${pinColors[report.severity] || "bg-amber-400"}`}
              style={{ left: `${left}%`, top: `${top}%` }}
            >
              <span className="h-2 w-2 rounded-full bg-white" />
            </Link>
            );
          })}
        <span className="absolute bottom-2 right-2 rounded bg-white/80 px-2 py-1 text-[10px] text-gray-500">
          Map data © OpenStreetMap
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600">
        {[
          ["Critical", "bg-red-500"],
          ["High", "bg-orange-500"],
          ["Medium", "bg-amber-400"],
          ["Low", "bg-green-500"],
        ].map(([label, color]) => (
          <span className="flex items-center gap-2" key={label}>
            <i className={`h-2.5 w-2.5 rounded-full ${color}`} />
            {label}
          </span>
        ))}
      </div>
    </section>
  );
};

export default LiveReportMap;
