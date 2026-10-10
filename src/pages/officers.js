import React from "react";
import AdminLayout from "../components/layout/AdminLayout";

const team = [
  ["MC", "Martha Chirwa", "Senior Environmental Officer", "Lilongwe", 8, 5],
  ["JN", "James Nkhoma", "Environmental Officer", "Blantyre", 6, 4],
  ["RM", "Ruth Moyo", "Field Response Officer", "Mzuzu", 5, 3],
  ["PK", "Peter Kachale", "Environmental Officer", "Zomba", 4, 2],
];

const Officers = () => (
  <AdminLayout title="Officers">
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs font-bold tracking-widest text-gray-500">
          TEAM MANAGEMENT
        </p>
        <h1 className="my-2 font-['Manrope',sans-serif] text-3xl font-bold text-gray-900 sm:text-4xl">
          Regional officers
        </h1>
        <p className="text-base text-gray-600">
          Manage your response team and active assignments.
        </p>
      </div>
      <button className="rounded-lg bg-[#185835] px-5 py-3 text-sm font-semibold text-white">
        ＋ Invite officer
      </button>
    </div>
    <div className="mb-5 grid grid-cols-2 overflow-hidden rounded-xl border border-gray-200 bg-white sm:grid-cols-4">
      {[
        ["12", "Team members"],
        ["8", "Available now"],
        ["23", "Active assignments"],
        ["4.8 ★", "Average rating"],
      ].map(([value, label]) => (
        <div
          className="border-b border-r border-gray-100 p-4 last:border-r-0 sm:border-b-0"
          key={label}
        >
          <b className="block text-2xl">{value}</b>
          <span className="text-sm text-gray-500">{label}</span>
        </div>
      ))}
    </div>
    <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
      <h2 className="mb-4 text-lg font-bold">Officer directory</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {team.map(([initials, name, role, region, active, resolved], index) => (
          <article
            className="rounded-lg border border-gray-200 p-5"
            key={initials}
          >
            <div className="flex items-center gap-3">
              <span
                className={`grid h-12 w-12 place-items-center rounded-full text-sm font-bold ${["bg-green-100 text-green-800", "bg-indigo-100 text-indigo-800", "bg-rose-100 text-rose-800", "bg-amber-100 text-amber-800"][index]}`}
              >
                {initials}
              </span>
              <div>
                <b className="block text-base">{name}</b>
                <span className="text-sm text-gray-500">{role}</span>
              </div>
              <span className="ml-auto text-xs text-green-700">
                ● Available
              </span>
            </div>
            <p className="mt-4 border-b border-gray-100 pb-3 text-sm text-gray-600">
              ⌖ {region} Regional Office
            </p>
            <div className="flex justify-between pt-3 text-sm text-gray-500">
              <span>
                <b className="text-gray-800">{active}</b> active cases
              </span>
              <span>
                <b className="text-gray-800">{resolved}</b> resolved this month
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  </AdminLayout>
);

export default Officers;
