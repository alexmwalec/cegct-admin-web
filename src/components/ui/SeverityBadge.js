import React from "react";

const SeverityBadge = ({ severity }) => {
  const style =
    {
      CRITICAL: "bg-red-50 text-red-700",
      HIGH: "bg-orange-50 text-orange-700",
      MEDIUM: "bg-amber-50 text-amber-800",
      LOW: "bg-green-50 text-green-700",
    }[severity] || "bg-gray-100 text-gray-700";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${style}`}
    >
      <i className="h-2 w-2 rounded-full bg-current" />
      {severity}
    </span>
  );
};

export default SeverityBadge;
