"use client";

import API from "../../../services/api";
import { useEffect, useState } from "react";

export default function AttendancePage() {
  const [attendance, setAttendance] = useState([]);
  const [guards, setGuards] = useState([]);
  const [selectedGuard, setSelectedGuard] = useState("");

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      setGuards([
        { id: 1, name: "Ali Khan" },
        { id: 2, name: "Ahmed Raza" },
      ]);

      setAttendance([
        {
          id: 1,
          guardName: "Ali Khan",
          checkIn: "09:00 AM",
          checkOut: "-",
          status: "Present",
        },
      ]);
    } catch {
      setMessage("❌ Failed to load data");
    }
    setLoading(false);
  };

  const handleCheckIn = async () => {
    if (!selectedGuard) return setMessage("⚠ Select guard");

    setActionLoading(true);

    const guard = guards.find((g) => g.id == selectedGuard);

    const newRecord = {
      id: attendance.length + 1,
      guardName: guard?.name,
      checkIn: new Date().toLocaleTimeString(),
      checkOut: "-",
      status: "Present",
    };

    try {
      setAttendance([...attendance, newRecord]);
      setMessage("✅ Check-in successful");
    } catch {
      setMessage("❌ Error");
    }

    setActionLoading(false);
  };

  const handleCheckOut = (id) => {
    setAttendance(
      attendance.map((a) =>
        a.id === id
          ? { ...a, checkOut: new Date().toLocaleTimeString() }
          : a
      )
    );

    setMessage("✅ Check-out done");
  };

  return (
    <div className="p-6">

      <h2 className="text-xl font-bold mb-3">Attendance</h2>

      {message && <p className="mb-3 text-sm">{message}</p>}

      <div className="flex gap-4 mb-4">

        <select
          className="border p-2"
          onChange={(e) => setSelectedGuard(e.target.value)}
        >
          <option>Select Guard</option>
          {guards.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>

        <button
          onClick={handleCheckIn}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          {actionLoading ? "..." : "Check In"}
        </button>

      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full bg-white shadow rounded text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th>ID</th>
              <th>Guard</th>
              <th>In</th>
              <th>Out</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {attendance.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50 text-center">
                <td>{a.id}</td>
                <td>{a.guardName}</td>
                <td>{a.checkIn}</td>
                <td>{a.checkOut}</td>
                <td>{a.status}</td>
                <td>
                  {a.checkOut === "-" && (
                    <button
                      onClick={() => handleCheckOut(a.id)}
                      className="bg-blue-500 text-white px-2 py-1 rounded"
                    >
                      Out
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

    </div>
  );
}
