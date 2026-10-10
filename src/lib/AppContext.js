import React, { createContext, useContext, useState } from "react";
import { reportsSeed } from "./reportData";

const DashboardContext = createContext(null);

export const DashboardProvider = ({ children }) => {
  const [reports, setReports] = useState(reportsSeed);
  const updateReport = (id, updates) =>
    setReports((items) =>
      items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    );
  return (
    <DashboardContext.Provider value={{ reports, updateReport }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context)
    throw new Error("useDashboard must be used inside DashboardProvider");
  return context;
};
