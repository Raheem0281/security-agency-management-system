"use client";

import { useEffect, useMemo, useState } from "react";

import {
  FileText,
  Users,
  ShieldCheck,
  CalendarCheck,
  Wallet,
  Download,
  Printer,
  CheckCircle2,
  XCircle,
  TrendingUp,
  RefreshCcw,
} from "lucide-react";

export default function ReportsPage() {
  const [guards, setGuards] = useState([]);
  const [clients, setClients] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [payroll, setPayroll] = useState([]);

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const [message, setMessage] = useState("");

  // ================= LOAD DATA =================

  const loadReportsData = () => {
    const savedGuards =
      JSON.parse(localStorage.getItem("guards")) || [];

    const savedClients =
      JSON.parse(localStorage.getItem("clients")) || [];

    const savedAttendance =
      JSON.parse(localStorage.getItem("attendanceRecords")) || [];

    const savedPayroll =
      JSON.parse(localStorage.getItem("payrollRecords")) || [];

    setGuards(savedGuards);
    setClients(savedClients);
    setAttendance(savedAttendance);
    setPayroll(savedPayroll);
  };

  useEffect(() => {
    loadReportsData();

    window.addEventListener("storage", loadReportsData);

    window.addEventListener(
      "attendance-updated",
      loadReportsData
    );

    window.addEventListener(
      "payroll-updated",
      loadReportsData
    );

    return () => {
      window.removeEventListener(
        "storage",
        loadReportsData
      );

      window.removeEventListener(
        "attendance-updated",
        loadReportsData
      );

      window.removeEventListener(
        "payroll-updated",
        loadReportsData
      );
    };
  }, []);

  // ================= MONTHLY ATTENDANCE =================

  const monthlyAttendance = useMemo(() => {
    return attendance.filter((item) =>
      item.date?.startsWith(selectedMonth)
    );
  }, [attendance, selectedMonth]);

  // ================= COUNTS =================

  const presentCount = monthlyAttendance.filter(
    (item) => item.status === "Present"
  ).length;

  const absentCount = monthlyAttendance.filter(
    (item) => item.status === "Absent"
  ).length;

  const activeGuards = guards.filter(
    (guard) => guard.status === "Active"
  );

  // ================= PAYROLL TOTAL =================

  const totalPayroll = payroll.reduce((sum, item) => {
    return (
      sum +
      Number(
        item.finalSalary ||
          item.salary ||
          item.total ||
          0
      )
    );
  }, 0);

  // ================= REPORT CARDS =================

  const cards = [
    {
      title: "Total Guards",
      value: guards.length,
      subtitle: `${activeGuards.length} Active Guards`,
      icon: ShieldCheck,
      bg: "bg-blue-100",
      color: "text-blue-600",
    },

    {
      title: "Total Clients",
      value: clients.length,
      subtitle: "Registered Clients",
      icon: Users,
      bg: "bg-purple-100",
      color: "text-purple-600",
    },

    {
      title: "Present Attendance",
      value: presentCount,
      subtitle: selectedMonth,
      icon: CheckCircle2,
      bg: "bg-green-100",
      color: "text-green-600",
    },

    {
      title: "Absent Attendance",
      value: absentCount,
      subtitle: selectedMonth,
      icon: XCircle,
      bg: "bg-red-100",
      color: "text-red-600",
    },

    {
      title: "Payroll Total",
      value: `Rs. ${totalPayroll.toLocaleString()}`,
      subtitle: "Monthly Payroll",
      icon: Wallet,
      bg: "bg-orange-100",
      color: "text-orange-600",
    },

    {
      title: "Attendance Records",
      value: monthlyAttendance.length,
      subtitle: "Monthly Records",
      icon: CalendarCheck,
      bg: "bg-cyan-100",
      color: "text-cyan-600",
    },
  ];

  // ================= PRINT =================

  const handlePrint = () => {
    window.print();
  };

  // ================= REFRESH =================

  const handleRefresh = () => {
    loadReportsData();

    setMessage("Reports refreshed successfully ✅");

    setTimeout(() => {
      setMessage("");
    }, 2500);
  };

  // ================= EXPORT CSV =================

  const handleExport = () => {
    const header =
      "Report Type,Value,Description\n";

    const rows = [
      [
        "Total Guards",
        guards.length,
        `${activeGuards.length} active guards`,
      ],

      [
        "Total Clients",
        clients.length,
        "Registered clients",
      ],

      [
        "Present Attendance",
        presentCount,
        selectedMonth,
      ],

      [
        "Absent Attendance",
        absentCount,
        selectedMonth,
      ],

      [
        "Payroll Total",
        totalPayroll,
        "Monthly payroll",
      ],

      [
        "Attendance Records",
        monthlyAttendance.length,
        "Attendance records",
      ],
    ]
      .map((row) =>
        row.map((value) => `"${value}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([header + rows], {
      type: "text/csv",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = `reports-${selectedMonth}.csv`;

    link.click();

    URL.revokeObjectURL(url);

    setMessage("Report exported successfully ✅");

    setTimeout(() => {
      setMessage("");
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Reports & Analytics
          </h1>

          <p className="text-gray-500 mt-1">
            Professional security agency reports
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) =>
              setSelectedMonth(e.target.value)
            }
            className="bg-white border border-gray-200 px-5 py-3 rounded-2xl outline-none focus:border-blue-500"
          />

          <button
            onClick={handleRefresh}
            className="bg-white border border-gray-200 px-5 py-3 rounded-2xl flex items-center gap-2 hover:bg-gray-50 transition"
          >
            <RefreshCcw size={18} />
            Refresh
          </button>

          <button
            onClick={handlePrint}
            className="bg-white border border-gray-200 px-5 py-3 rounded-2xl flex items-center gap-2 hover:bg-gray-50 transition"
          >
            <Printer size={18} />
            Print
          </button>

          <button
            onClick={handleExport}
            className="bg-[#071739] text-white px-5 py-3 rounded-2xl flex items-center gap-2 hover:bg-[#0A1F4D] transition"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      {/* ================= MESSAGE ================= */}

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-2xl font-medium">
          {message}
        </div>
      )}

      {/* ================= STATS ================= */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;

          return (
            <div
              key={index}
              className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">
                    {card.title}
                  </p>

                  <h2 className="text-3xl font-bold text-gray-800 mt-2">
                    {card.value}
                  </h2>

                  <p className="text-gray-400 text-sm mt-1">
                    {card.subtitle}
                  </p>
                </div>

                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center ${card.bg}`}
                >
                  <Icon
                    className={card.color}
                    size={28}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= ATTENDANCE TABLE ================= */}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800">
            Monthly Attendance Report
          </h2>

          <p className="text-gray-500 text-sm mt-1">
            Attendance summary for {selectedMonth}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gradient-to-r from-[#071739] to-[#0A1F4D] text-white">
              <tr>
                <th className="text-left px-6 py-4">
                  Guard Name
                </th>

                <th className="text-left px-6 py-4">
                  Father Name
                </th>

                <th className="text-left px-6 py-4">
                  Duty Point
                </th>

                <th className="text-left px-6 py-4">
                  Date
                </th>

                <th className="text-left px-6 py-4">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {monthlyAttendance.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-12 text-gray-500"
                  >
                    No attendance found for this month
                  </td>
                </tr>
              ) : (
                monthlyAttendance.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 hover:bg-blue-50/40 transition"
                  >
                    <td className="px-6 py-5 font-semibold text-gray-800">
                      {item.guardName}
                    </td>

                    <td className="px-6 py-5 text-gray-700">
                      {item.fatherName || "N/A"}
                    </td>

                    <td className="px-6 py-5 text-gray-700">
                      {item.dutyLocation || "N/A"}
                    </td>

                    <td className="px-6 py-5 text-gray-700">
                      {item.date}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          item.status === "Present"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= PAYROLL SUMMARY ================= */}

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center">
            <TrendingUp
              className="text-orange-600"
              size={28}
            />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Payroll Summary
            </h2>

            <p className="text-gray-500">
              Connected with payroll records
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-[#F5F7FB] rounded-2xl p-5">
            <p className="text-gray-500 text-sm">
              Total Payroll Records
            </p>

            <h2 className="text-4xl font-bold text-[#071739] mt-2">
              {payroll.length}
            </h2>
          </div>

          <div className="bg-[#F5F7FB] rounded-2xl p-5">
            <p className="text-gray-500 text-sm">
              Total Payroll
            </p>

            <h2 className="text-4xl font-bold text-green-600 mt-2">
              Rs. {totalPayroll.toLocaleString()}
            </h2>
          </div>

          <div className="bg-[#F5F7FB] rounded-2xl p-5">
            <p className="text-gray-500 text-sm">
              Active Guards
            </p>

            <h2 className="text-4xl font-bold text-blue-600 mt-2">
              {activeGuards.length}
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}
