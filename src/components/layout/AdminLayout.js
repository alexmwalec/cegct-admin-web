import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Brand from "../Brand";
import { useDashboard } from "../../lib/AppContext";

const menu = [
  ["/dashboard", "▦", "Overview"],
  ["/reports", "▤", "Reports"],
  ["/analytics", "◷", "Analytics"],
  ["/officers", "♙", "Officers"],
];

const AdminLayout = ({ title, children }) => {
  const [open, setOpen] = useState(() => window.innerWidth >= 1024);
  const location = useLocation();
  const { reports } = useDashboard();

  return (
    <div className="min-h-screen bg-[#f5f8f6] font-sans text-[#17221c]">
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-gray-200 bg-white p-5 transition-transform ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Brand />
        <div className="my-8 rounded-lg bg-gray-50 p-3">
          <b className="text-sm">NEMA Malawi</b>
          <p className="mt-1 text-xs text-gray-500">Regional operations</p>
        </div>
        <p className="mb-3 px-2 text-xs font-bold tracking-wider text-gray-400">
          WORKSPACE
        </p>
        <nav className="space-y-1">
          {menu.map(([path, icon, label]) => {
            const selected = location.pathname.startsWith(path);
            return (
              <Link
                className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm ${selected ? "bg-green-50 font-semibold text-[#185835]" : "text-gray-600 hover:bg-gray-50"}`}
                key={path}
                to={path}
              >
                <span className="text-lg">{icon}</span>
                {label}
                {path === "/reports" && (
                  <span className="ml-auto rounded-full bg-orange-50 px-2 py-0.5 text-xs text-orange-700">
                    {reports.length}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-gray-100 pt-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[#e5e8d9] font-bold text-[#526c46]">
              TK
            </span>
            <span>
              <b className="block text-sm">Thoko Kalua</b>
              <small className="text-xs text-gray-500">Administrator</small>
            </span>
          </div>
        </div>
      </aside>

      {!open && <div className="hidden lg:block" />}
      {open && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-20 bg-black/30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <main
        className={`min-h-screen transition-[margin] ${open ? "lg:ml-64" : "lg:ml-0"}`}
      >
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-7">
          <div className="flex items-center gap-4">
            <button
              aria-label="Toggle sidebar"
              className="rounded-md border border-gray-200 px-3 py-2 text-gray-600 hover:bg-gray-50"
              onClick={() => setOpen((current) => !current)}
            >
              ☰
            </button>
            <span className="text-sm text-gray-400">
              Workspace <b className="px-2 text-gray-300">/</b>
              <b className="text-gray-800">{title}</b>
            </span>
          </div>
          <div className="hidden items-center gap-5 text-sm text-gray-600 sm:flex">
            <span>
              <i className="mr-2 inline-block h-2 w-2 rounded-full bg-green-500" />
              Live updates
            </span>
            <span className="font-semibold">Thoko Kalua</span>
          </div>
        </header>
        <div className="mx-auto max-w-[1500px] px-4 py-7 sm:px-7 lg:px-10">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
