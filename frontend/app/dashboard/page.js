"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Users,
  ClipboardList,
  Wallet,
  FileText,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();

  const [guards, setGuards] = useState([]);
  const [clients, setClients] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [payroll, setPayroll] = useState([]);
  const [activities, setActivities] = useState([]);

  const loadDashboardData = () => {
    setGuards(JSON.parse(localStorage.getItem("guards")) || []);
    setClients(JSON.parse(localStorage.getItem("clients")) || []);
    setAttendance(JSON.parse(localStorage.getItem("attendanceRecords")) || []);
    setPayroll(JSON.parse(localStorage.getItem("payrollRecords")) || []);
    setActivities(JSON.parse(localStorage.getItem("recentActivities")) || []);
  };

  useEffect(() => {
    loadDashboardData();

    window.addEventListener("storage", loadDashboardData);
    window.addEventListener("attendance-updated", loadDashboardData);
    window.addEventListener("activities-updated", loadDashboardData);
    window.addEventListener("payroll-updated", loadDashboardData);
    window.addEventListener("clients-updated", loadDashboardData);
    window.addEventListener("guards-updated", loadDashboardData);

    return () => {
      window.removeEventListener("storage", loadDashboardData);
      window.removeEventListener("attendance-updated", loadDashboardData);
      window.removeEventListener("activities-updated", loadDashboardData);
      window.removeEventListener("payroll-updated", loadDashboardData);
      window.removeEventListener("clients-updated", loadDashboardData);
      window.removeEventListener("guards-updated", loadDashboardData);
    };
  }, []);

  const totalPayroll = useMemo(() => {
    return payroll.reduce((sum, item) => {
      return sum + Number(item.finalSalary || 0);
    }, 0);
  }, [payroll]);

  const today = new Date().toISOString().split("T")[0];

  const todayAttendance = attendance.filter(
    (item) => item.date === today && item.status === "Present"
  );

  const stats = [
    {
      title: "Total Guards",
      value: guards.length,
      icon: ShieldCheck,
      path: "/dashboard/guards",
    },
    {
      title: "Total Clients",
      value: clients.length,
      icon: Users,
      path: "/dashboard/clients",
    },
    {
      title: "Today Present",
      value: todayAttendance.length,
      icon: ClipboardList,
      path: "/dashboard/attendance",
    },
    {
      title: "Payroll Amount",
      value: `Rs. ${totalPayroll.toLocaleString()}`,
      icon: Wallet,
      path: "/dashboard/payroll",
    },
  ];

  const quickActions = [
    { title: "Add Guard", path: "/dashboard/guards" },
    { title: "Add Client", path: "/dashboard/clients" },
    { title: "View Attendance", path: "/dashboard/attendance" },
    { title: "Generate Report", path: "/dashboard/reports" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">
            Security Agency Dashboard
          </h1>

          <p className="text-gray-500 mt-2">
            Live overview connected with guards, clients, attendance and payroll
          </p>
        </div>

        <button
          onClick={() => router.push("/dashboard/reports")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2 transition"
        >
          <FileText size={20} />
          Generate Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.title}
              onClick={() => router.push(item.path)}
              className="text-left bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-5">
                <Icon className="text-blue-600" size={28} />
              </div>

              <p className="text-gray-500">{item.title}</p>

              <h2 className="text-4xl font-bold text-gray-800 mt-2">
                {item.value}
              </h2>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Recent History
            </h2>

            <button
              onClick={() => router.push("/dashboard/reports")}
              className="text-blue-600 font-semibold"
            >
              View All
            </button>
          </div>

          {activities.length === 0 ? (
            <div className="text-gray-500 bg-gray-50 rounded-2xl p-5">
              No recent activity yet.
            </div>
          ) : (
            <div className="space-y-3 max-h-[420px] overflow-hidden">
              {activities.slice(0, 3).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between border-b border-gray-200 pb-4"
                >
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">
                      {activity.title}
                    </h3>

                    <p className="text-gray-500">{activity.message}</p>

                    <p className="text-xs text-gray-400 mt-1">
                      {activity.date}
                    </p>
                  </div>

                  <span className="text-gray-400 text-sm">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Quick Actions
          </h2>

          <div className="space-y-5">
            {quickActions.map((action) => (
              <button
                key={action.title}
                onClick={() => router.push(action.path)}
                className="w-full bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-800 py-4 rounded-2xl font-bold transition"
              >
                {action.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
