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
import {
  fetchGuards,
  fetchAttendance,
  upsertAttendance,
  createNotification,
} from "../../services/dataService";

export default function UserDashboard() {
  const router = useRouter();

  const [guard, setGuard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [attendanceTime, setAttendanceTime] = useState("");
  const [message, setMessage] = useState("");

  const getId = (item) => item?._id || item?.id;

  const today = new Date().toISOString().split("T")[0];

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  };

  useEffect(() => {
    const loadGuardData = async () => {
      try {
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

        const parsedUserId = getId(parsedUser);

        const allGuards = await fetchGuards();

        const latestGuard =
          allGuards.find(
            (g) => String(getId(g)) === String(parsedUserId)
          ) || parsedUser;

        const updatedGuard = {
          ...parsedUser,
          ...latestGuard,
          role: "guard",
        };

        const guardId = getId(updatedGuard);

        localStorage.setItem("user", JSON.stringify(updatedGuard));
        setGuard(updatedGuard);

        const records = await fetchAttendance({
          guardId,
          date: today,
        });

        const alreadyMarked = records.find(
          (record) =>
            String(record.guardId) === String(guardId) &&
            record.date === today &&
            record.status === "Present"
        );

        if (alreadyMarked) {
          setAttendanceMarked(true);
          setAttendanceTime(alreadyMarked.time || "");
        }
      } catch (error) {
        console.error(error);
        showMessage("Failed to load guard dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadGuardData();
  }, [router, today]);

  const handleAttendance = async () => {
    if (!guard) return;

    const guardId = getId(guard);

    if (!guardId) {
      alert("Guard record not found");
      return;
    }

    if (guard.status && guard.status !== "Active") {
      alert("Only active guards can mark attendance");
      return;
    }

    const now = new Date();

    const date = now.toISOString().split("T")[0];

    if (date > today) {
      alert("Future date attendance is not allowed");
      return;
    }

    const time = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    try {
      const records = await fetchAttendance({
        guardId,
        date,
      });

      const existingRecord = records.find(
        (record) =>
          String(record.guardId) === String(guardId) &&
          record.date === date
      );

      if (existingRecord?.status === "Present") {
        alert("Attendance already marked today ✅");
        setAttendanceMarked(true);
        setAttendanceTime(existingRecord.time || time);
        return;
      }

      await upsertAttendance({
        guardId,
        guardName: guard.name || "",
        fatherName: guard.fatherName || "",
        cnic: guard.cnic || "",
        dutyPoint: guard.dutyLocation || "",
        weaponType: guard.weaponType || "",
        licenseNumber: guard.licenseNumber || guard.weaponNumber || "",
        status: "Present",
        date,
        time,
        markedBy: "Guard",
      });

      try {
        await createNotification({
          title: "Guard Attendance Marked",
          message: `${guard.name} marked attendance at ${
            guard.dutyLocation || "duty point"
          }`,
          type: "attendance",
        });
      } catch (error) {
        console.warn("Notification skipped:", error);
      }

      window.dispatchEvent(new Event("attendance-updated"));
      window.dispatchEvent(new Event("notifications-updated"));

      setAttendanceMarked(true);
      setAttendanceTime(time);

      alert("Attendance marked successfully ✅");
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Failed to mark attendance");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.replace("/guard-login");
  };

  if (loading || !guard) {
    return (
      <div className="min-h-screen bg-[#F4F7FE] flex items-center justify-center">
        <p className="text-gray-600 font-semibold">
          Loading guard dashboard...
        </p>
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

      {message && (
        <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-2xl font-medium">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <InfoCard
          icon={<ShieldCheck className="text-blue-600" size={30} />}
          label="Guard Name"
          value={guard.name || "Not added"}
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
          <h2 className="text-2xl font-bold text-gray-800 mb-5">
            Today Duty
          </h2>

          <div className="space-y-4">
            <DetailRow
              icon={<MapPin className="text-blue-600" />}
              label="Duty Point"
              value={guard.dutyLocation || "No duty assigned"}
            />

            <DetailRow
              icon={<Clock className="text-green-600" />}
              label="Shift"
              value={guard.shift || "Not assigned"}
            />

            <DetailRow
              icon={<CalendarCheck className="text-purple-600" />}
              label="Duty Time"
              value={guard.dutyTime || "Not assigned"}
            />

            <DetailRow
              icon={<Shield className="text-orange-600" />}
              label="Weapon Type"
              value={guard.weaponType || "Not assigned"}
            />

            <DetailRow
              icon={<BadgeCheck className="text-red-600" />}
              label="License No"
              value={guard.licenseNumber || guard.weaponNumber || "Not assigned"}
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-5">
            Mark Attendance
          </h2>

          <p className="text-gray-500 mb-6">
            Guard can mark attendance only once per day.
          </p>

          {guard.status !== "Active" && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl">
              Your account is not active. Attendance cannot be marked.
            </div>
          )}

          {attendanceMarked && (
            <div className="mb-5 bg-green-50 border border-green-200 text-green-700 p-4 rounded-2xl">
              Attendance marked today at {attendanceTime}
            </div>
          )}

          <button
            onClick={handleAttendance}
            disabled={attendanceMarked || guard.status !== "Active"}
            className={`w-full py-4 rounded-2xl font-bold text-white transition ${
              attendanceMarked
                ? "bg-green-600 cursor-not-allowed"
                : guard.status !== "Active"
                ? "bg-gray-400 cursor-not-allowed"
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
