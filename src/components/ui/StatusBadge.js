import React from "react";

const StatusBadge = ({ status }) => {
  const style =
    {
      SUBMITTED: "bg-orange-50 text-orange-800",
      UNDER_REVIEW: "bg-blue-50 text-blue-800",
      IN_PROGRESS: "bg-emerald-50 text-emerald-800",
      RESOLVED: "bg-green-50 text-green-800",
      REJECTED: "bg-red-50 text-red-800",
    }[status] || "bg-gray-100 text-gray-700";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${style}`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
};

export default StatusBadge;
