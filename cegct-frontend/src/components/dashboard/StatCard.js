import React from "react";

const StatCard = ({ title, value, change, note, icon }) => (
  <article className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
    <div className="flex items-center justify-between text-sm font-medium text-gray-600">
      <span>{title}</span>
      <span className="grid h-10 w-10 place-items-center rounded-lg bg-green-50 text-xl text-[#185835]">
        {icon}
      </span>
    </div>
    <b className="my-3 block font-['Manrope',sans-serif] text-3xl font-bold text-gray-900">
      {value}
    </b>
    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
      <b className="text-green-700">{change}</b>
      <span>{note}</span>
    </div>
  </article>
);

export default StatCard;
