"use client";

import Link from "next/link";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen">
      
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-5">
        <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>

        <ul className="space-y-3">
          <li><Link href="/dashboard">Dashboard</Link></li>
          <li><Link href="/dashboard/guards">Guards</Link></li>
          <li><Link href="/dashboard/clients">Clients</Link></li>
          <li><Link href="/dashboard/duty">Duty</Link></li>
          <li><Link href="/dashboard/attendance">Attendance</Link></li>
          <li><Link href="/dashboard/payroll">Payroll</Link></li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-100">
        
        {/* Navbar */}
        <div className="bg-white shadow p-4 flex justify-between">
          <h1 className="font-bold">Dashboard</h1>

          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
            className="bg-red-500 text-white px-3 py-1 rounded"
          >
            Logout
          </button>
        </div>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}