"use client";

import API from "../../../services/api";
import { useEffect, useState } from "react";

export default function PayrollPage() {

  const [records, setRecords] = useState([]);
  const [guards, setGuards] = useState([]);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    guardId: "",
    salary: "",
    deduction: "",
  });

  useEffect(() => {
    setGuards([
      { id: 1, name: "Ali Khan" },
      { id: 2, name: "Ahmed Raza" },
    ]);

    setRecords([]);
  }, []);

  const handleAddPayroll = () => {

    if (!form.guardId || !form.salary) {
      return setMessage("⚠ Fill required fields");
    }

    const guard = guards.find(g => g.id == form.guardId);

    const finalSalary =
      Number(form.salary) - Number(form.deduction || 0);

    setRecords([
      ...records,
      {
        id: records.length + 1,
        guardName: guard?.name,
        salary: form.salary,
        deduction: form.deduction || 0,
        finalSalary,
      }
    ]);

    setForm({ guardId: "", salary: "", deduction: "" });
    setMessage("✅ Payroll generated");
  };

  return (
    <div className="p-6">

      <h2 className="text-xl font-bold mb-3">Payroll</h2>

      {message && <p className="mb-3 text-sm">{message}</p>}

      <div className="grid grid-cols-3 gap-3 mb-4">

        <select
          className="border p-2"
          value={form.guardId}
          onChange={(e) => setForm({ ...form, guardId: e.target.value })}
        >
          <option>Select Guard</option>
          {guards.map(g => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>

        <input
          className="border p-2"
          placeholder="Salary"
          value={form.salary}
          onChange={(e) => setForm({ ...form, salary: e.target.value })}
        />

        <input
          className="border p-2"
          placeholder="Deduction"
          value={form.deduction}
          onChange={(e) => setForm({ ...form, deduction: e.target.value })}
        />

      </div>

      <button
        onClick={handleAddPayroll}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Generate
      </button>

      <table className="w-full text-sm bg-white shadow rounded">
        <thead className="bg-gray-200">
          <tr>
            <th>ID</th>
            <th>Guard</th>
            <th>Salary</th>
            <th>Deduction</th>
            <th>Final</th>
          </tr>
        </thead>

        <tbody>
          {records.map(r => (
            <tr key={r.id} className="text-center hover:bg-gray-50">
              <td>{r.id}</td>
              <td>{r.guardName}</td>
              <td>{r.salary}</td>
              <td>{r.deduction}</td>
              <td className="text-green-600 font-bold">{r.finalSalary}</td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}
