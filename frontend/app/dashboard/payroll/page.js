"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Wallet,
  Search,
  User,
  Plus,
  Download,
  Trash2,
  RefreshCcw,
} from "lucide-react";

export default function PayrollPage() {
  const [guards, setGuards] = useState([]);
  const [records, setRecords] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const [form, setForm] = useState({
    guardId: "",
    monthlySalary: "",
    advance: "",
    bonus: "",
  });

  const loadData = () => {
    setGuards(JSON.parse(localStorage.getItem("guards")) || []);
    setRecords(JSON.parse(localStorage.getItem("payrollRecords")) || []);
    setAttendance(JSON.parse(localStorage.getItem("attendanceRecords")) || []);
    showMessage("Payroll refreshed ✅");
  };

  useEffect(() => {
    loadData();
    window.addEventListener("attendance-updated", loadData);
    return () => window.removeEventListener("attendance-updated", loadData);
  }, []);

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2500);
  };

  const filteredRecords = useMemo(() => {
    return records
      .filter((r) => r.month === selectedMonth)
      .filter(
        (r) =>
          r.guardName?.toLowerCase().includes(search.toLowerCase()) ||
          r.fatherName?.toLowerCase().includes(search.toLowerCase()) ||
          r.dutyLocation?.toLowerCase().includes(search.toLowerCase())
      );
  }, [records, selectedMonth, search]);

  const totalFinalSalary = filteredRecords.reduce(
    (sum, r) => sum + Number(r.finalSalary || 0),
    0
  );

  const handleGeneratePayroll = () => {
    if (!form.guardId || !form.monthlySalary) {
      showMessage("Please select guard and enter monthly salary");
      return;
    }

    const guard = guards.find((g) => String(g.id) === String(form.guardId));
    if (!guard) return showMessage("Guard not found");

    const alreadyExists = records.find(
      (r) => String(r.guardId) === String(guard.id) && r.month === selectedMonth
    );

    if (alreadyExists) {
      showMessage("Payroll already generated for this guard/month");
      return;
    }

    const monthAttendance = attendance.filter(
      (a) =>
        String(a.guardId) === String(guard.id) &&
        a.date?.startsWith(selectedMonth)
    );

    const presentDays = monthAttendance.filter((a) => a.status === "Present").length;
    const absentDays = monthAttendance.filter((a) => a.status === "Absent").length;

    const monthlySalary = Number(form.monthlySalary);
    const perDaySalary = Math.round(monthlySalary / 30);
    const earnedSalary = perDaySalary * presentDays;
    const advance = Number(form.advance || 0);
    const bonus = Number(form.bonus || 0);
    const finalSalary = earnedSalary - advance + bonus;

    const newRecord = {
      id: Date.now(),
      guardId: guard.id,
      guardName: guard.name,
      fatherName: guard.fatherName,
      dutyLocation: guard.dutyLocation,
      month: selectedMonth,
      presentDays,
      absentDays,
      monthlySalary,
      perDaySalary,
      earnedSalary,
      advance,
      bonus,
      finalSalary,
      generatedAt: new Date().toLocaleString(),
    };

    const updated = [newRecord, ...records];
    localStorage.setItem("payrollRecords", JSON.stringify(updated));
    setRecords(updated);

    setForm({
      guardId: "",
      monthlySalary: "",
      advance: "",
      bonus: "",
    });

    window.dispatchEvent(new Event("payroll-updated"));
    showMessage("Payroll generated successfully ✅");
  };

  const handleDelete = (id) => {
    if (!confirm("Delete this payroll record?")) return;

    const updated = records.filter((r) => r.id !== id);
    localStorage.setItem("payrollRecords", JSON.stringify(updated));
    setRecords(updated);
    window.dispatchEvent(new Event("payroll-updated"));
    showMessage("Payroll deleted");
  };

  const handleExport = () => {
    if (filteredRecords.length === 0) {
      showMessage("No payroll records to export");
      return;
    }

    const header =
      "Guard Name,Father Name,Duty Point,Month,Present,Absent,Monthly Salary,Per Day,Earned,Advance,Bonus,Final\n";

    const rows = filteredRecords
      .map((r) =>
        [
          r.guardName,
          r.fatherName || "N/A",
          r.dutyLocation,
          r.month,
          r.presentDays,
          r.absentDays,
          r.monthlySalary,
          r.perDaySalary,
          r.earnedSalary,
          r.advance,
          r.bonus,
          r.finalSalary,
        ]
          .map((v) => `"${v || ""}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `payroll-${selectedMonth}.csv`;
    link.click();

    URL.revokeObjectURL(url);
    showMessage("Payroll exported ✅");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Payroll Management
          </h1>
          <p className="text-gray-500 mt-1">
            Salary calculated by present days minus advance plus bonus
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={loadData}
            className="bg-white border border-gray-200 px-5 py-3 rounded-2xl flex items-center gap-2"
          >
            <RefreshCcw size={18} />
            Refresh
          </button>

          <button
            onClick={handleExport}
            className="bg-[#071739] text-white px-5 py-3 rounded-2xl flex items-center gap-2"
          >
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {message && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-5 py-4 rounded-2xl font-medium">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard title="Payroll Records" value={filteredRecords.length} />
        <StatCard
          title="Total Final Salary"
          value={`Rs. ${totalFinalSalary.toLocaleString()}`}
        />
        <StatCard title="Selected Month" value={selectedMonth} />
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-5">
          Generate Monthly Payroll
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <select
            value={form.guardId}
            onChange={(e) => setForm({ ...form, guardId: e.target.value })}
            className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 outline-none"
          >
            <option value="">Select Guard</option>
            {guards
              .filter((g) => g.status === "Active")
              .map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
          </select>

          <input
            type="number"
            placeholder="Monthly Salary"
            value={form.monthlySalary}
            onChange={(e) =>
              setForm({ ...form, monthlySalary: e.target.value })
            }
            className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 outline-none"
          />

          <input
            type="number"
            placeholder="Advance"
            value={form.advance}
            onChange={(e) => setForm({ ...form, advance: e.target.value })}
            className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 outline-none"
          />

          <input
            type="number"
            placeholder="Bonus"
            value={form.bonus}
            onChange={(e) => setForm({ ...form, bonus: e.target.value })}
            className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 outline-none"
          />

          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 outline-none"
          />
        </div>

        <button
          onClick={handleGeneratePayroll}
          className="mt-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold"
        >
          <Plus size={20} />
          Generate Payroll
        </button>
      </div>

      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search guard, father name or duty point..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-3 outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800">
            Payroll Records
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Present days based monthly salary records
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1300px]">
            <thead className="bg-gradient-to-r from-[#071739] to-[#0A1F4D] text-white">
              <tr>
                <th className="text-left px-6 py-4">Guard</th>
                <th className="text-left px-6 py-4">Duty Point</th>
                <th className="text-left px-6 py-4">Month</th>
                <th className="text-left px-6 py-4">Present</th>
                <th className="text-left px-6 py-4">Absent</th>
                <th className="text-left px-6 py-4">Monthly</th>
                <th className="text-left px-6 py-4">Per Day</th>
                <th className="text-left px-6 py-4">Earned</th>
                <th className="text-left px-6 py-4">Advance</th>
                <th className="text-left px-6 py-4">Bonus</th>
                <th className="text-left px-6 py-4">Final</th>
                <th className="text-center px-6 py-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="12" className="text-center py-12 text-gray-500">
                    No payroll records found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-gray-100 hover:bg-blue-50/40 transition"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-blue-100 flex items-center justify-center">
                          <User className="text-blue-600" size={22} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {r.guardName}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {r.fatherName || "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5 text-gray-700">
                      {r.dutyLocation || "N/A"}
                    </td>
                    <td className="px-6 py-5">{r.month}</td>
                    <td className="px-6 py-5 text-green-700 font-semibold">
                      {r.presentDays}
                    </td>
                    <td className="px-6 py-5 text-red-700 font-semibold">
                      {r.absentDays}
                    </td>
                    <td className="px-6 py-5">
                      Rs. {Number(r.monthlySalary).toLocaleString()}
                    </td>
                    <td className="px-6 py-5">
                      Rs. {Number(r.perDaySalary).toLocaleString()}
                    </td>
                    <td className="px-6 py-5 text-blue-700 font-semibold">
                      Rs. {Number(r.earnedSalary).toLocaleString()}
                    </td>
                    <td className="px-6 py-5 text-red-600 font-semibold">
                      Rs. {Number(r.advance).toLocaleString()}
                    </td>
                    <td className="px-6 py-5">
                      Rs. {Number(r.bonus).toLocaleString()}
                    </td>
                    <td className="px-6 py-5 text-green-700 font-bold">
                      Rs. {Number(r.finalSalary).toLocaleString()}
                    </td>

                    <td className="px-6 py-5 text-center">
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="bg-red-100 hover:bg-red-200 text-red-700 w-10 h-10 rounded-xl inline-flex items-center justify-center"
                      >
                        <Trash2 size={18} />
                      </button>
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

function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <Wallet className="text-blue-600 mb-3" size={28} />
      <p className="text-gray-500 text-sm">{title}</p>
      <h2 className="text-3xl font-bold text-gray-800 mt-1">{value}</h2>
    </div>
  );
}
