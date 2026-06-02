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
  RefreshCcw,
  BadgeCheck,
  AlertTriangle,
} from "lucide-react";

const COMPANY_NAME = "TIGHT SECURITY SERVICE (PVT) LTD";

export default function ReportsPage() {
  const [guards, setGuards] = useState([]);
  const [clients, setClients] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [payroll, setPayroll] = useState([]);
  const [licenses, setLicenses] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [message, setMessage] = useState("");

  const loadReportsData = () => {
    try {
      setGuards(JSON.parse(localStorage.getItem("guards")) || []);
      setClients(JSON.parse(localStorage.getItem("clients")) || []);
      setAttendance(JSON.parse(localStorage.getItem("attendanceRecords")) || []);
      setPayroll(JSON.parse(localStorage.getItem("payrollRecords")) || []);
      setLicenses(JSON.parse(localStorage.getItem("licenses")) || []);
    } catch {
      setGuards([]);
      setClients([]);
      setAttendance([]);
      setPayroll([]);
      setLicenses([]);
    }
  };

  useEffect(() => {
    loadReportsData();

    window.addEventListener("storage", loadReportsData);
    window.addEventListener("guards-updated", loadReportsData);
    window.addEventListener("clients-updated", loadReportsData);
    window.addEventListener("attendance-updated", loadReportsData);
    window.addEventListener("payroll-updated", loadReportsData);
    window.addEventListener("licenses-updated", loadReportsData);

    return () => {
      window.removeEventListener("storage", loadReportsData);
      window.removeEventListener("guards-updated", loadReportsData);
      window.removeEventListener("clients-updated", loadReportsData);
      window.removeEventListener("attendance-updated", loadReportsData);
      window.removeEventListener("payroll-updated", loadReportsData);
      window.removeEventListener("licenses-updated", loadReportsData);
    };
  }, []);

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2500);
  };

  const monthlyAttendance = useMemo(() => {
    return attendance.filter((item) => item.date?.startsWith(selectedMonth));
  }, [attendance, selectedMonth]);

  const monthlyPayroll = useMemo(() => {
    return payroll.filter(
      (item) =>
        item.month === selectedMonth ||
        item.date?.startsWith(selectedMonth) ||
        item.createdAt?.startsWith(selectedMonth)
    );
  }, [payroll, selectedMonth]);

  const activeGuards = guards.filter((guard) => guard.status === "Active");

  const presentCount = monthlyAttendance.filter(
    (item) => item.status === "Present"
  ).length;

  const absentCount = monthlyAttendance.filter(
    (item) => item.status === "Absent"
  ).length;

  const lateCount = monthlyAttendance.filter(
    (item) => item.status === "Late"
  ).length;

  const totalPayroll = monthlyPayroll.reduce((sum, item) => {
    return sum + Number(item.finalSalary || item.totalSalary || item.salary || 0);
  }, 0);

  const getLicenseStatus = (expiryDate) => {
    if (!expiryDate) return "N/A";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);

    return expiry >= today ? "Valid" : "Expired";
  };

  const validLicenses = licenses.filter(
    (item) => getLicenseStatus(item.expiryDate) === "Valid"
  ).length;

  const expiredLicenses = licenses.filter(
    (item) => getLicenseStatus(item.expiryDate) === "Expired"
  ).length;

  const handleRefresh = () => {
    loadReportsData();
    showMessage("Reports refreshed successfully ✅");
  };

  const openPrintWindow = (title, bodyHTML) => {
    const html = `
      <html>
      <head>
        <title>${title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 24px;
            color: #111827;
          }

          .company-title {
            text-align: center;
            font-size: 24px;
            font-weight: 800;
            text-transform: uppercase;
            margin-bottom: 4px;
          }

          .report-title {
            text-align: center;
            font-size: 16px;
            font-weight: 700;
            margin-bottom: 18px;
          }

          .meta {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 12px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
          }

          th, td {
            border: 1px solid #111827;
            padding: 8px;
            font-size: 12px;
            text-align: left;
            vertical-align: top;
          }

          th {
            background: #f3f4f6;
            font-weight: 800;
          }

          .summary {
            margin-top: 16px;
            font-size: 13px;
            font-weight: 700;
          }

          .footer {
            margin-top: 18px;
            font-size: 12px;
            font-weight: 600;
          }

          @media print {
            body {
              padding: 12px;
            }
          }
        </style>
      </head>

      <body>
        <div class="company-title">${COMPANY_NAME}</div>
        ${bodyHTML}
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      alert("Please allow popups to print/download the report.");
      return;
    }

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const downloadGuardsList = () => {
    let rows = "";

    guards.forEach((guard, index) => {
      rows += `
        <tr>
          <td>${index + 1}</td>
          <td>${guard.name || ""}</td>
          <td>${guard.fatherName || ""}</td>
          <td>${guard.cnic || ""}</td>
          <td>${guard.address || ""}</td>
          <td>${guard.dutyLocation || ""}</td>
          <td>${guard.phone || ""}</td>
        </tr>
      `;
    });

    openPrintWindow(
      "Guards Verification List",
      `
        <div class="report-title">GUARDS VERIFICATION LIST</div>

        <div class="meta">
          <span>Total Guards: ${guards.length}</span>
          <span>Generated Date: ${new Date().toLocaleDateString()}</span>
        </div>

        <table>
          <thead>
            <tr>
              <th>Sr.No#</th>
              <th>Guard Name</th>
              <th>Guard Father Name</th>
              <th>ID Card Number (CNIC)</th>
              <th>Guard Address</th>
              <th>Duty Point</th>
              <th>Guard Mobile Number</th>
            </tr>
          </thead>
          <tbody>
            ${
              rows ||
              `<tr><td colspan="7" style="text-align:center;">No guards found.</td></tr>`
            }
          </tbody>
        </table>

        <div class="footer">
          This report is issued by ${COMPANY_NAME} for official record and verification purposes.
        </div>
      `
    );
  };

  const downloadAttendanceReport = () => {
    let rows = "";

    monthlyAttendance.forEach((item, index) => {
      rows += `
        <tr>
          <td>${index + 1}</td>
          <td>${item.guardName || ""}</td>
          <td>${item.fatherName || ""}</td>
          <td>${item.dutyPoint || item.dutyLocation || ""}</td>
          <td>${item.date || ""}</td>
          <td>${item.time || ""}</td>
          <td>${item.status || ""}</td>
          <td>${item.markedBy || ""}</td>
        </tr>
      `;
    });

    openPrintWindow(
      "Monthly Attendance Report",
      `
        <div class="report-title">MONTHLY ATTENDANCE REPORT</div>

        <div class="meta">
          <span>Month: ${selectedMonth}</span>
          <span>Generated Date: ${new Date().toLocaleDateString()}</span>
        </div>

        <table>
          <thead>
            <tr>
              <th>Sr.No#</th>
              <th>Guard Name</th>
              <th>Father Name</th>
              <th>Duty Point</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Marked By</th>
            </tr>
          </thead>
          <tbody>
            ${
              rows ||
              `<tr><td colspan="8" style="text-align:center;">No attendance found.</td></tr>`
            }
          </tbody>
        </table>

        <div class="summary">
          Present: ${presentCount} | Absent: ${absentCount} | Late: ${lateCount}
        </div>
      `
    );
  };

  const downloadPayrollReport = () => {
    let rows = "";

    monthlyPayroll.forEach((item, index) => {
      rows += `
        <tr>
          <td>${index + 1}</td>
          <td>${item.guardName || ""}</td>
          <td>${item.presentDays || item.presentCount || 0}</td>
          <td>${item.salary || item.perDaySalary || 0}</td>
          <td>${item.advance || item.deduction || 0}</td>
          <td>${item.finalSalary || item.totalSalary || 0}</td>
        </tr>
      `;
    });

    openPrintWindow(
      "Monthly Payroll Report",
      `
        <div class="report-title">MONTHLY PAYROLL REPORT</div>

        <div class="meta">
          <span>Month: ${selectedMonth}</span>
          <span>Generated Date: ${new Date().toLocaleDateString()}</span>
        </div>

        <table>
          <thead>
            <tr>
              <th>Sr.No#</th>
              <th>Guard Name</th>
              <th>Present Days</th>
              <th>Salary / Per Day</th>
              <th>Advance / Deduction</th>
              <th>Final Salary</th>
            </tr>
          </thead>
          <tbody>
            ${
              rows ||
              `<tr><td colspan="6" style="text-align:center;">No payroll found.</td></tr>`
            }
          </tbody>
        </table>

        <div class="summary">
          Total Payroll: Rs. ${totalPayroll.toLocaleString()}
        </div>
      `
    );
  };

  const downloadLicenseReport = () => {
    let rows = "";

    licenses.forEach((item, index) => {
      rows += `
        <tr>
          <td>${index + 1}</td>
          <td>${item.weaponType || ""}</td>
          <td>${item.licenseNumber || ""}</td>
          <td>${item.validityArea || ""}</td>
          <td>${item.issueDate || ""}</td>
          <td>${item.expiryDate || ""}</td>
          <td>${getLicenseStatus(item.expiryDate)}</td>
        </tr>
      `;
    });

    openPrintWindow(
      "License Expiry Report",
      `
        <div class="report-title">LICENSE EXPIRY REPORT</div>

        <div class="meta">
          <span>Total Licenses: ${licenses.length}</span>
          <span>Generated Date: ${new Date().toLocaleDateString()}</span>
        </div>

        <table>
          <thead>
            <tr>
              <th>Sr.No#</th>
              <th>Weapon Type</th>
              <th>License Number</th>
              <th>Validity Area</th>
              <th>Issue Date</th>
              <th>Expiry Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${
              rows ||
              `<tr><td colspan="7" style="text-align:center;">No licenses found.</td></tr>`
            }
          </tbody>
        </table>

        <div class="summary">
          Valid Licenses: ${validLicenses} | Expired Licenses: ${expiredLicenses}
        </div>
      `
    );
  };

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
      title: "Valid Licenses",
      value: validLicenses,
      subtitle: `${expiredLicenses} Expired`,
      icon: BadgeCheck,
      bg: "bg-cyan-100",
      color: "text-cyan-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Reports & Official Documents
          </h1>

          <p className="text-gray-500 mt-1">
            Generate professional security agency reports for verification,
            attendance, payroll and licenses.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-white border border-gray-200 px-5 py-3 rounded-2xl outline-none focus:border-blue-500"
          />

          <button
            onClick={handleRefresh}
            className="bg-white border border-gray-200 px-5 py-3 rounded-2xl flex items-center gap-2 hover:bg-gray-50 transition"
          >
            <RefreshCcw size={18} />
            Refresh
          </button>
        </div>
      </div>

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-2xl font-medium">
          {message}
        </div>
      )}

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
                  <p className="text-gray-500 text-sm">{card.title}</p>

                  <h2 className="text-3xl font-bold text-gray-800 mt-2">
                    {card.value}
                  </h2>

                  <p className="text-gray-400 text-sm mt-1">{card.subtitle}</p>
                </div>

                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center ${card.bg}`}
                >
                  <Icon className={card.color} size={28} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ReportCard
          icon={<ShieldCheck className="text-blue-600" size={28} />}
          title="Guard Verification List"
          description="Official guard list for police, social security, client verification and company records."
          buttonText="Download Guards List"
          onClick={downloadGuardsList}
        />

        <ReportCard
          icon={<CalendarCheck className="text-green-600" size={28} />}
          title="Monthly Attendance Report"
          description="Month-wise attendance report with present, absent and late status."
          buttonText="Download Attendance Report"
          onClick={downloadAttendanceReport}
        />

        <ReportCard
          icon={<Wallet className="text-orange-600" size={28} />}
          title="Monthly Payroll Report"
          description="Payroll report connected with guard attendance and salary records."
          buttonText="Download Payroll Report"
          onClick={downloadPayrollReport}
        />

        <ReportCard
          icon={<FileText className="text-purple-600" size={28} />}
          title="License Expiry Report"
          description="Weapon license report with validity area, issue date, expiry date and status."
          buttonText="Download License Report"
          onClick={downloadLicenseReport}
        />
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800">
            Monthly Attendance Preview
          </h2>

          <p className="text-gray-500 text-sm mt-1">
            Attendance summary for {selectedMonth}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gradient-to-r from-[#071739] to-[#0A1F4D] text-white">
              <tr>
                <th className="text-left px-6 py-4">Guard Name</th>
                <th className="text-left px-6 py-4">Father Name</th>
                <th className="text-left px-6 py-4">Duty Point</th>
                <th className="text-left px-6 py-4">Date</th>
                <th className="text-left px-6 py-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {monthlyAttendance.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-gray-500">
                    No attendance found for this month.
                  </td>
                </tr>
              ) : (
                monthlyAttendance.slice(0, 8).map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 hover:bg-blue-50/40 transition"
                  >
                    <td className="px-6 py-5 font-semibold text-gray-800">
                      {item.guardName || "N/A"}
                    </td>

                    <td className="px-6 py-5 text-gray-700">
                      {item.fatherName || "N/A"}
                    </td>

                    <td className="px-6 py-5 text-gray-700">
                      {item.dutyPoint || item.dutyLocation || "N/A"}
                    </td>

                    <td className="px-6 py-5 text-gray-700">
                      {item.date || "N/A"}
                    </td>

                    <td className="px-6 py-5">
                      <StatusBadge status={item.status || "Present"} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ReportCard({ icon, title, description, buttonText, onClick }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
          {icon}
        </div>

        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>

          <p className="text-gray-500 mt-2 leading-relaxed">{description}</p>

          <button
            onClick={onClick}
            className="mt-5 bg-[#071739] hover:bg-[#0A1F4D] text-white px-5 py-3 rounded-2xl flex items-center gap-2 transition"
          >
            <Download size={18} />
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Present: "bg-green-100 text-green-700",
    Absent: "bg-red-100 text-red-700",
    Late: "bg-yellow-100 text-yellow-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}
