"use client";

import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  const stats = [
    {
      title: "Total Guards",
      value: "45",
      color: "bg-blue-500",
    },
    {
      title: "Active Duties",
      value: "18",
      color: "bg-green-500",
    },
    {
      title: "Clients",
      value: "12",
      color: "bg-purple-500",
    },
    {
      title: "Monthly Revenue",
      value: "$978K",
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">
            Security Agency Dashboard
          </h1>

          <p className="text-gray-500 mt-2">
            Welcome back, Admin 👋
          </p>
        </div>

        <button
          onClick={() => router.push("/dashboard/reports")}
          className="bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-all duration-300 text-white px-6 py-3 rounded-xl shadow-lg"
        >
          Generate Report
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 p-6 border border-gray-100"
          >
            <div
              className={`w-14 h-14 rounded-2xl ${item.color} mb-5`}
            ></div>

            <h2 className="text-gray-500 text-sm">
              {item.title}
            </h2>

            <p className="text-4xl font-bold text-gray-800 mt-2">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Main Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Activities */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-md p-6">

          <h2 className="text-3xl font-bold mb-8">
            Recent Activities
          </h2>

          <div className="space-y-6">

            <div className="flex justify-between border-b pb-4">
              <div>
                <h3 className="font-bold text-lg">
                  Guard Assigned
                </h3>

                <p className="text-gray-500">
                  Ali assigned to City Mall Duty
                </p>
              </div>

              <span className="text-gray-400 text-sm">
                2 min ago
              </span>
            </div>

            <div className="flex justify-between border-b pb-4">
              <div>
                <h3 className="font-bold text-lg">
                  New Client Added
                </h3>

                <p className="text-gray-500">
                  ABC Company registered
                </p>
              </div>

              <span className="text-gray-400 text-sm">
                1 hour ago
              </span>
            </div>

            <div className="flex justify-between">
              <div>
                <h3 className="font-bold text-lg">
                  Payroll Generated
                </h3>

                <p className="text-gray-500">
                  Monthly salaries processed
                </p>
              </div>

              <span className="text-gray-400 text-sm">
                Today
              </span>
            </div>

          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-md p-6">

          <h2 className="text-3xl font-bold mb-8">
            Quick Actions
          </h2>

          <div className="space-y-5">

            <button
              onClick={() => router.push("/dashboard/guards")}
              className="w-full bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-all duration-300 text-white py-4 rounded-xl font-semibold shadow-lg"
            >
              Add Guard
            </button>

            <button
              onClick={() => router.push("/dashboard/clients")}
              className="w-full bg-green-600 hover:bg-green-700 hover:scale-105 transition-all duration-300 text-white py-4 rounded-xl font-semibold shadow-lg"
            >
              Add Client
            </button>

            <button
              onClick={() => router.push("/dashboard/duties")}
              className="w-full bg-purple-600 hover:bg-purple-700 hover:scale-105 transition-all duration-300 text-white py-4 rounded-xl font-semibold shadow-lg"
            >
              Create Duty
            </button>

            <button
              onClick={() => router.push("/dashboard/payroll")}
              className="w-full bg-orange-500 hover:bg-orange-600 hover:scale-105 transition-all duration-300 text-white py-4 rounded-xl font-semibold shadow-lg"
            >
              Generate Payroll
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}
