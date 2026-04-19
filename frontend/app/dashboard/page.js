"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const chartData = [
  { day: "Mon", attendance: 8 },
  { day: "Tue", attendance: 10 },
  { day: "Wed", attendance: 7 },
  { day: "Thu", attendance: 12 },
  { day: "Fri", attendance: 9 },
];

export default function Dashboard() {
  const router = useRouter();

  // ================= STATES =================
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState([
    { title: "Total Guards", value: 0 },
    { title: "Total Clients", value: 0 },
    { title: "Active Duties", value: 0 },
    { title: "Attendance Today", value: 0 },
  ]);

  // ================= AUTH CHECK =================
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    loadDashboard();
  }, []);

  // ================= FETCH DATA (API READY) =================
  const loadDashboard = async () => {
    setLoading(true);

    try {
      // 🔥 FUTURE API CALL
      // const res = await API.get("/dashboard");
      // setStats(res.data.stats);

      // 🔴 TEMP DATA (replace later)
      setTimeout(() => {
        setStats([
          { title: "Total Guards", value: 12 },
          { title: "Total Clients", value: 5 },
          { title: "Active Duties", value: 8 },
          { title: "Attendance Today", value: 10 },
        ]);

        setLoading(false);
      }, 700);

    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  // ================= UI =================
  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* LOADING */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">
          Loading dashboard...
        </div>
      ) : (
        <>
          {/* STATS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

            {stats.map((s, i) => (
              <div
                key={i}
                className="bg-white p-4 rounded shadow hover:shadow-md transition"
              >
                <h3 className="text-gray-500 text-sm">{s.title}</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {s.value}
                </p>
              </div>
            ))}

          </div>

          {/* CHART */}
          <div className="bg-white p-6 rounded shadow">

            <h2 className="text-xl font-bold mb-4">
              Attendance Overview
            </h2>

            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>

                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="attendance"
                  strokeWidth={3}
                />

              </LineChart>
            </ResponsiveContainer>

          </div>
        </>
      )}

    </div>
  );
}
