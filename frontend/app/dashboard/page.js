"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Users,
  ClipboardList,
  Wallet,
  FileText,
  RefreshCcw,
} from "lucide-react";
import {
  fetchGuards,
  fetchClients,
  fetchAttendance,
  fetchPayroll,
} from "../../services/dataService";

export default function DashboardPage() {
  const router = useRouter();

  const [guards, setGuards] = useState([]);
  const [clients, setClients] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [payroll, setPayroll] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [guardsData, clientsData, attendanceData, payrollData] =
        await Promise.all([
          fetchGuards(),
          fetchClients(),
          fetchAttendance(),
          fetchPayroll(),
        ]);

      setGuards(guardsData || []);
      setClients(clientsData || []);
      setAttendance(attendanceData || []);
      setPayroll(payrollData || []);
    } catch (error) {
      console.error(error);
      showMessage(
        error?.response?.data?.message || "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const today = new Date().toISOString().split("T")[0];

  const activeGuards = guards.filter((g) => g.status === "Active");
  const todayAttendance = attendance.filter((item) => item.date === today);

  const presentToday = todayAttendance.filter(
    (item) => item.status === "Present"
  ).length;

  const absentToday = Math.max(activeGuards.length - todayAttendance.length, 0);

  const lateToday = todayAttendance.filter(
    (item) => item.status === "Late"
  ).length;

  const totalPayroll = useMemo(() => {
    return payroll.reduce(
      (sum, item) => sum + Number(item.finalSalary || 0),
      0
    );
  }, [payroll]);

  const recentHistory = useMemo(() => {
    return [
      ...guards.slice(0, 3).map((g) => ({
        id: `guard-${g._id || g.id}`,
        title: "Guard Record",
        message: `${g.name || "Guard"} is registered in system`,
        date: String(g.createdAt || "").slice(0, 10) || "N/A",
        time: "",
      })),
      ...attendance.slice(0, 3).map((a) => ({
        id: `attendance-${a._id || a.id}`,
        title: "Attendance Marked",
        message: `${a.guardName || "Guard"} marked ${a.status || "Present"}`,
        date: a.date || "N/A",
        time: a.time || "",
      })),
      ...payroll.slice(0, 3).map((p) => ({
        id: `payroll-${p._id || p.id}`,
        title: "Payroll Generated",
        message: `${p.guardName || "Guard"} payroll for ${p.month}`,
        date: String(p.createdAt || p.generatedAt || "").slice(0, 10) || "N/A",
        time: "",
      })),
    ].slice(0, 5);
  }, [guards, attendance, payroll]);

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
      value: presentToday,
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

        <div className="flex gap-3">
          <button
            onClick={loadDashboardData}
            className="bg-white border border-gray-200 px-6 py-3 rounded-2xl shadow-sm flex items-center gap-2 transition"
          >
            <RefreshCcw size={20} />
            Refresh
          </button>

          <button
            onClick={() => router.push("/dashboard/reports")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2 transition"
          >
            <FileText size={20} />
            Generate Report
          </button>
        </div>
      </div>

      {message && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-5 py-4 rounded-2xl font-medium">
          {message}
        </div>
      )}

      {loading && (
        <div className="bg-white rounded-2xl p-4 text-gray-500 border border-gray-100">
          Loading dashboard data...
        </div>
      )}

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

          {recentHistory.length === 0 ? (
            <div className="text-gray-500 bg-gray-50 rounded-2xl p-5">
              No recent activity yet.
            </div>
          ) : (
            <div className="space-y-3 max-h-[420px] overflow-hidden">
              {recentHistory.map((activity) => (
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

          <div className="mt-6 bg-gray-50 rounded-2xl p-4 text-sm text-gray-600">
            <p>
              Present: <b>{presentToday}</b>
            </p>
            <p>
              Absent: <b>{absentToday}</b>
            </p>
            <p>
              Late: <b>{lateToday}</b>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
