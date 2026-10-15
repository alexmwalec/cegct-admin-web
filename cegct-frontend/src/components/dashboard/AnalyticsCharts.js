import React from "react";

const AnalyticsCharts = ({ analytics }) => {
  const categories = analytics?.categories || [];
  const maxCategoryCount = Math.max(1, ...categories.map((item) => Number(item.count)));
  const monthly = analytics?.monthly || [];
  return (
  <div className="grid gap-5 xl:grid-cols-2">
    <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
      <h2 className="text-lg font-bold">Reports by category</h2>
      <p className="mt-1 text-sm text-gray-500">
        Distribution of reported environmental issues
      </p>
      <div className="mt-6 space-y-5">
        {categories.length ? categories.map((item, index) => (
          <div key={item.category}>
            <div className="mb-2 flex justify-between text-sm">
              <span>{item.category}</span>
              <b>{item.count}</b>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full ${["bg-[#185835]", "bg-emerald-600", "bg-amber-500", "bg-sky-600", "bg-gray-400"][index % 5]}`}
                style={{ width: `${(Number(item.count) / maxCategoryCount) * 100}%` }}
              />
            </div>
          </div>
        )) : <p className="text-sm text-gray-500">No reports in this period.</p>}
      </div>
    </section>
    <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
      <h2 className="text-lg font-bold">Monthly resolution rate</h2>
      <p className="mt-1 text-sm text-gray-500">
        Cases resolved within each month
      </p>
      <div className="mt-7 flex h-56 items-end justify-around gap-3 border-b border-l border-gray-200 px-3">
        {monthly.map((item) => {
          const rate = item.total ? Math.round((item.resolved / item.total) * 100) : 0;
          return (
          <div
            className="flex h-full flex-1 flex-col items-center justify-end gap-2"
            key={item.month}
            title={`${item.resolved} resolved of ${item.total}`}
          >
            <div
              className="w-full max-w-12 rounded-t-md bg-[#39825a]"
              style={{ height: `${rate}%` }}
            />
            <span className="pb-2 text-xs text-gray-500">{item.month.slice(5)}</span>
          </div>
        );})}
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3">
        <div>
          <span className="text-xs text-gray-500">Avg. response</span>
          <b className="mt-1 block text-lg">{analytics?.avgResolutionHours == null ? "—" : `${analytics.avgResolutionHours} hrs`}</b>
        </div>
        <div>
          <span className="text-xs text-gray-500">Resolved cases</span>
          <b className="mt-1 block text-lg">{analytics?.resolvedCount || 0} / {analytics?.reportsCount || 0}</b>
        </div>
        <div>
          <span className="text-xs text-gray-500">Resolution rate</span>
          <b className="mt-1 block text-lg text-green-700">{analytics?.resolutionRate || 0}%</b>
        </div>
      </div>
    </section>
  </div>
  );
};

export default AnalyticsCharts;
