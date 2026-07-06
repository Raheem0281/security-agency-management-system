"use client";

import { useEffect, useMemo, useState } from "react";
import { Wallet, Search, User, Plus, Download, Trash2, RefreshCcw } from "lucide-react";
import { fetchGuards, fetchPayroll, fetchAttendance, createPayroll, deletePayroll } from "../../../services/dataService";

export default function PayrollPage() {
  const [guards, setGuards] = useState([]);
  const [records, setRecords] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const [form, setForm] = useState({
    guardId: "",
    salary: "",
    advance: "",
    deduction: "",
  });

  const getId = (item) => item?._id || item?.id;

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [guardsData, recordsData, attendanceData] = await Promise.all([
        fetchGuards(),
        fetchPayroll(),
        fetchAttendance(),
      ]);

      setGuards(guardsData || []);
      setRecords(recordsData || []);
      setAttendance(attendanceData || []);
    } catch (error) {
      console.error(error);
      showMessage(error?.response?.data?.message || "Failed to load payroll data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredRecords = useMemo(() => {
    const value = search.toLowerCase();

    return records
      .filter((r) => r.month === selectedMonth)
      .filter(
        (r) =>
          r.guardName?.toLowerCase().includes(value) ||
          r.fatherName?.toLowerCase().includes(value) ||
          r.dutyLocation?.toLowerCase().includes(value)
      );
  }, [records, selectedMonth, search]);

  const totalFinalSalary = filteredRecords.reduce(
    (sum, r) => sum + Number(r.finalSalary || 0),
    0
  );

  const validatePayroll = () => {
    if (!form.guardId) return "Please select guard";
    if (!form.salary) return "Please enter salary";

    const salary = Number(form.salary || 0);
    const advance = Number(form.advance || 0);
    const deduction = Number(form.deduction || 0);

    if (salary <= 0) return "Salary must be greater than 0";
    if (advance < 0) return "Advance cannot be negative";
    if (deduction < 0) return "Deduction cannot be negative";
    if (advance + deduction > salary) return "Advance and deduction cannot exceed salary";

    return null;
  };

  const handleGeneratePayroll = async () => {
    const error = validatePayroll();
    if (error) {
      showMessage(error);
      return;
    }

    const guard = guards.find((g) => String(getId(g)) === String(form.guardId));
    if (!guard) {
      showMessage("Guard not found");
      return;
    }

    const alreadyExists = records.find(
      (r) => String(r.guardId) === String(getId(guard)) && r.month === selectedMonth
    );

    if (alreadyExists) {
      showMessage("Payroll already generated for this guard/month");
      return;
    }

    const monthAttendance = attendance.filter(
      (a) => String(a.guardId) === String(getId(guard)) && a.date?.startsWith(selectedMonth)
    );

    const presentDays = monthAttendance.filter((a) => a.status === "Present").length;
    const absentDays = monthAttendance.filter((a) => a.status === "Absent").length;
    const lateDays = monthAttendance.filter((a) => a.status === "Late").length;

    const salary = Number(form.salary);
    const advance = Number(form.advance || 0);
    const deduction = Number(form.deduction || 0);
    const perDaySalary = Math.round(salary / 30);
    const earnedSalary = perDaySalary * presentDays;
    const finalSalary = Math.max(earnedSalary - advance - deduction, 0);

    try {
      const newRecord = await createPayroll({
        guardId: getId(guard),
        guardName: guard.name,
        fatherName: guard.fatherName || "",
        dutyLocation: guard.dutyLocation || "",
        month: selectedMonth,
        salary,
        presentDays,
        absentDays,
        lateDays,
        advance,
        deduction,
        finalSalary,
        perDaySalary,
        earnedSalary,
        generatedAt: new Date().toISOString(),
      });

      setRecords([newRecord, ...records]);
      setForm({ guardId: "", salary: "", advance: "", deduction: "" });
      window.dispatchEvent(new Event("payroll-updated"));
      showMessage("Payroll generated successfully ✅");
    } catch (error) {
      console.error(error);
      showMessage(error?.response?.data?.message || "Failed to generate payroll");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this payroll record?")) return;

    try {
      await deletePayroll(id);
      setRecords(records.filter((r) => String(getId(r)) !== String(id)));
      window.dispatchEvent(new Event("payroll-updated"));
      showMessage("Payroll deleted successfully");
    } catch (error) {
      console.error(error);
      showMessage(error?.response?.data?.message || "Failed to delete payroll");
    }
  };

  const handleExport = () => {
    if (filteredRecords.length === 0) {
      showMessage("No payroll records to export");
      return;
    }

    const header = "Guard Name,Father Name,Duty Point,Month,Present,Absent,Late,Salary,Advance,Deduction,Final Salary\n";

    const rows = filteredRecords
      .map((r) =>
        [
          r.guardName,
          r.fatherName || "N/A",
          r.dutyLocation || "N/A",
          r.month,
          r.presentDays,
          r.absentDays,
          r.lateDays || 0,
          r.salary,
          r.advance,
          r.deduction,
          r.finalSalary,
        ]
          .map((v) => `"${v || 0}"`)
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
          <h1 className="text-3xl font-bold text-gray-800">Payroll Management</h1>
          <p className="text-gray-500 mt-1">
            Salary calculated from attendance, advance and deduction
          </p>
        </div>

        <div className="flex gap-3">
          <button onClick={loadData} className="bg-white border border-gray-200 px-5 py-3 rounded-2xl flex items-center gap-2">
            <RefreshCcw size={18} />
            Refresh
          </button>

          <button onClick={handleExport} className="bg-[#071739] text-white px-5 py-3 rounded-2xl flex items-center gap-2">
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
        <StatCard title="Total Final Salary" value={`Rs. ${totalFinalSalary.toLocaleString()}`} />
        <StatCard title="Selected Month" value={selectedMonth} />
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-5">Generate Monthly Payroll</h2>

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
                <option key={getId(g)} value={getId(g)}>
                  {g.name}
                </option>
              ))}
          </select>

          <input
            type="number"
            min="1"
            placeholder="Monthly Salary"
            value={form.salary}
            onChange={(e) => setForm({ ...form, salary: e.target.value })}
            className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 outline-none"
          />

          <input
            type="number"
            min="0"
            placeholder="Advance"
            value={form.advance}
            onChange={(e) => setForm({ ...form, advance: e.target.value })}
            className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 outline-none"
          />

          <input
            type="number"
            min="0"
            placeholder="Deduction"
            value={form.deduction}
            onChange={(e) => setForm({ ...form, deduction: e.target.value })}
            className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 outline-none"
          />

          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 outline-none"
          />
        </div>

        <button onClick={handleGeneratePayroll} className="mt-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold">
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
          <h2 className="text-2xl font-bold text-gray-800">Payroll Records</h2>
          <p className="text-gray-500 text-sm mt-1">
            Present days based monthly salary records
          </p>
        </div>

        <div className="overflow-x-auto max-h-[620px] overflow-y-auto">
          <table className="w-full min-w-[1300px]">
            <thead className="bg-gradient-to-r from-[#071739] to-[#0A1F4D] text-white sticky top-0 z-10">
              <tr>
                <th className="text-left px-6 py-4">Guard</th>
                <th className="text-left px-6 py-4">Duty Point</th>
                <th className="text-left px-6 py-4">Month</th>
                <th className="text-left px-6 py-4">Present</th>
                <th className="text-left px-6 py-4">Absent</th>
                <th className="text-left px-6 py-4">Late</th>
                <th className="text-left px-6 py-4">Salary</th>
                <th className="text-left px-6 py-4">Advance</th>
                <th className="text-left px-6 py-4">Deduction</th>
                <th className="text-left px-6 py-4">Final</th>
                <th className="text-center px-6 py-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="11" className="text-center py-12 text-gray-500">
                    Loading payroll...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-center py-12 text-gray-500">
                    No payroll records found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={getId(r)} className="border-b border-gray-100 hover:bg-blue-50/40 transition">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-blue-100 flex items-center justify-center">
                          <User className="text-blue-600" size={22} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{r.guardName}</h3>
                          <p className="text-xs text-gray-500">{r.fatherName || "N/A"}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5 text-gray-700">{r.dutyLocation || "N/A"}</td>
                    <td className="px-6 py-5">{r.month}</td>
                    <td className="px-6 py-5 text-green-700 font-semibold">{r.presentDays || 0}</td>
                    <td className="px-6 py-5 text-red-700 font-semibold">{r.absentDays || 0}</td>
                    <td className="px-6 py-5 text-yellow-700 font-semibold">{r.lateDays || 0}</td>
                    <td className="px-6 py-5">Rs. {Number(r.salary || 0).toLocaleString()}</td>
                    <td className="px-6 py-5 text-red-600 font-semibold">Rs. {Number(r.advance || 0).toLocaleString()}</td>
                    <td className="px-6 py-5 text-red-600 font-semibold">Rs. {Number(r.deduction || 0).toLocaleString()}</td>
                    <td className="px-6 py-5 text-green-700 font-bold">Rs. {Number(r.finalSalary || 0).toLocaleString()}</td>

                    <td className="px-6 py-5 text-center">
                      <button
                        onClick={() => handleDelete(getId(r))}
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
