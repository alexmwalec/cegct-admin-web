import React from "react";

const AnalyticsCharts = () => (
  <div className="grid gap-5 xl:grid-cols-2">
    <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
      <h2 className="text-lg font-bold">Reports by category</h2>
      <p className="mt-1 text-sm text-gray-500">
        Distribution of reported environmental issues
      </p>
      <div className="mt-6 space-y-5">
        {[
          ["Illegal dumping", 48, "bg-[#185835]"],
          ["Water pollution", 31, "bg-emerald-600"],
          ["Air pollution", 24, "bg-amber-500"],
          ["Unsafe waste disposal", 16, "bg-sky-600"],
          ["Other", 9, "bg-gray-400"],
        ].map(([label, percent, color]) => (
          <div key={label}>
            <div className="mb-2 flex justify-between text-sm">
              <span>{label}</span>
              <b>{percent}%</b>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full ${color}`}
                style={{ width: `${percent * 1.8}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
    <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
      <h2 className="text-lg font-bold">Monthly resolution rate</h2>
      <p className="mt-1 text-sm text-gray-500">
        Cases resolved within each month
      </p>
      <div className="mt-7 flex h-56 items-end justify-around gap-3 border-b border-l border-gray-200 px-3">
        {[
          ["May", 52],
          ["Jun", 61],
          ["Jul", 56],
          ["Aug", 70],
          ["Sep", 74],
          ["Oct", 82],
        ].map(([month, height]) => (
          <div
            className="flex h-full flex-1 flex-col items-center justify-end gap-2"
            key={month}
          >
            <div
              className="w-full max-w-12 rounded-t-md bg-[#39825a]"
              style={{ height: `${height}%` }}
            />
            <span className="pb-2 text-xs text-gray-500">{month}</span>
          </div>
        ))}
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3">
        <div>
          <span className="text-xs text-gray-500">Avg. response</span>
          <b className="mt-1 block text-lg">4.2 hrs</b>
        </div>
        <div>
          <span className="text-xs text-gray-500">Resolved cases</span>
          <b className="mt-1 block text-lg">24 / 31</b>
        </div>
        <div>
          <span className="text-xs text-gray-500">Resolution rate</span>
          <b className="mt-1 block text-lg text-green-700">78%</b>
        </div>
      </div>
    </section>
  </div>
);

export default AnalyticsCharts;
