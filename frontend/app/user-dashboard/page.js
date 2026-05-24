"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarCheck,
  ClipboardList,
  ShieldCheck,
  Clock,
  MapPin,
  LogOut,
  Phone,
  BadgeCheck,
  Shield,
} from "lucide-react";

export default function UserDashboard() {
  const router = useRouter();

  const [guard, setGuard] = useState(null);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [attendanceTime, setAttendanceTime] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      router.replace("/guard-login");
      return;
    }

    const parsedUser = JSON.parse(user);

    if (parsedUser.role !== "guard") {
      router.replace("/guard-login");
      return;
    }

    setGuard(parsedUser);

    const todayDate = new Date().toISOString().split("T")[0];
    const records = JSON.parse(localStorage.getItem("attendanceRecords")) || [];

    const alreadyMarked = records.find(
      (record) =>
        String(record.guardId) === String(parsedUser.id) &&
        record.date === todayDate &&
        record.status === "Present"
    );

    if (alreadyMarked) {
      setAttendanceMarked(true);
      setAttendanceTime(alreadyMarked.time);
    }
  }, [router]);

  const handleAttendance = () => {
    if (!guard) return;

    const now = new Date();
    const date = now.toISOString().split("T")[0];
    const time = now.toLocaleTimeString();

    const records = JSON.parse(localStorage.getItem("attendanceRecords")) || [];

    const existingRecord = records.find(
      (record) =>
        String(record.guardId) === String(guard.id) &&
        record.date === date
    );

    if (existingRecord?.status === "Present") {
      alert("Attendance already marked today ✅");
      return;
    }

    let updatedRecords;

    if (existingRecord?.status === "Absent") {
      updatedRecords = records.map((record) =>
        record.id === existingRecord.id
          ? {
              ...record,
              status: "Present",
              time,
              markedBy: "Guard",
            }
          : record
      );
    } else {
      const newRecord = {
        id: Date.now(),
        guardId: guard.id,
        guardName: guard.name,
        fatherName: guard.fatherName,
        dutyLocation: guard.dutyLocation,
        status: "Present",
        date,
        time,
        markedBy: "Guard",
      };

      updatedRecords = [newRecord, ...records];
    }

    localStorage.setItem("attendanceRecords", JSON.stringify(updatedRecords));
    window.dispatchEvent(new Event("attendance-updated"));

    const notification = {
      id: Date.now(),
      title: "Guard Attendance Marked",
      message: `${guard.name} marked attendance at ${guard.dutyLocation}`,
      time,
      date,
      type: "attendance",
    };

    const oldNotifications =
      JSON.parse(localStorage.getItem("adminNotifications")) || [];

    localStorage.setItem(
      "adminNotifications",
      JSON.stringify([notification, ...oldNotifications])
    );

    window.dispatchEvent(new Event("notifications-updated"));

    const activity = {
      id: Date.now() + 1,
      title: "Attendance Marked",
      message: `${guard.name} reached ${guard.dutyLocation}`,
      time,
      date,
    };

    const oldActivities =
      JSON.parse(localStorage.getItem("recentActivities")) || [];

    localStorage.setItem(
      "recentActivities",
      JSON.stringify([activity, ...oldActivities])
    );

    window.dispatchEvent(new Event("activities-updated"));

    setAttendanceMarked(true);
    setAttendanceTime(time);

    alert("Attendance marked successfully ✅");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.replace("/guard-login");
  };

  if (!guard) {
    return (
      <div className="min-h-screen bg-[#F4F7FE] flex items-center justify-center">
        <p className="text-gray-600 font-semibold">Loading guard dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7FE] p-6">
      <div className="bg-gradient-to-r from-[#071739] to-[#0A1F4D] rounded-3xl p-6 shadow-xl mb-6 text-white overflow-hidden relative">
        <div className="absolute right-0 top-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="bg-white rounded-2xl p-1 shadow-xl flex items-center justify-center w-[110px] h-[110px] overflow-hidden">
              <img
                src="/logo.svg"
                alt="Company Logo"
                className="w-[140px] h-[140px] object-contain scale-[1.4]"
              />
            </div>

            <div>
              <h1 className="text-4xl font-bold tracking-wide">
                TIGHT SECURITY SERVICE (PVT)
              </h1>

              <p className="text-cyan-100 mt-2">
                Government Of The Home Department
              </p>

              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-200">
                <span>📍 Layyah, Pakistan</span>
                <span>📞 +92 305 8437103</span>
                <span>✉️ support@tsssecurity.com</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 transition px-5 py-4 rounded-2xl flex items-center gap-2 shadow-lg"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <InfoCard
          icon={<ShieldCheck className="text-blue-600" size={30} />}
          label="Guard Name"
          value={guard.name}
        />

        <InfoCard
          icon={<ClipboardList className="text-green-600" size={30} />}
          label="Father Name"
          value={guard.fatherName || "Not added"}
        />

        <InfoCard
          icon={<Phone className="text-purple-600" size={30} />}
          label="Phone"
          value={guard.phone || "Not added"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-5">Today Duty</h2>

          <div className="space-y-4">
            <DetailRow icon={<MapPin className="text-blue-600" />} label="Duty Point" value={guard.dutyLocation || "No duty assigned"} />
            <DetailRow icon={<Clock className="text-green-600" />} label="Shift" value={guard.shift || "Not assigned"} />
            <DetailRow icon={<CalendarCheck className="text-purple-600" />} label="Duty Time" value={guard.dutyTime || "Not assigned"} />
            <DetailRow icon={<Shield className="text-orange-600" />} label="Weapon" value={guard.weapon || "Not assigned"} />
            <DetailRow icon={<BadgeCheck className="text-red-600" />} label="License No" value={guard.licenseNumber || "Not assigned"} />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-5">Mark Attendance</h2>

          <p className="text-gray-500 mb-6">
            Guard can mark attendance only once per day.
          </p>

          {attendanceMarked && (
            <div className="mb-5 bg-green-50 border border-green-200 text-green-700 p-4 rounded-2xl">
              Attendance marked today at {attendanceTime}
            </div>
          )}

          <button
            onClick={handleAttendance}
            disabled={attendanceMarked}
            className={`w-full py-4 rounded-2xl font-bold text-white transition ${
              attendanceMarked
                ? "bg-green-600 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {attendanceMarked ? "Attendance Marked ✅" : "Mark Attendance"}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <div className="mb-3">{icon}</div>
      <p className="text-gray-500">{label}</p>
      <h2 className="text-2xl font-bold text-gray-800 mt-1">{value}</h2>
    </div>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 text-gray-700 bg-[#F4F7FE] p-4 rounded-2xl">
      {icon}
      <p>
        <b>{label}:</b> {value}
      </p>
    </div>
  );
}
