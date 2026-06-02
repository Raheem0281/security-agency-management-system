"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCcw,
  Eye,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
} from "lucide-react";

export default function AttendancePage() {
  const [guards, setGuards] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedGuard, setSelectedGuard] = useState(null);
  const [historyMonth, setHistoryMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [historyDate, setHistoryDate] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const loadData = () => {
    try {
      setLoading(true);
      setGuards(JSON.parse(localStorage.getItem("guards")) || []);
      setAttendanceRecords(
        JSON.parse(localStorage.getItem("attendanceRecords")) || []
      );
    } catch {
      setMessage("Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener("attendance-updated", loadData);
    window.addEventListener("guards-updated", loadData);
    window.addEventListener("storage", loadData);

    return () => {
      window.removeEventListener("attendance-updated", loadData);
      window.removeEventListener("guards-updated", loadData);
      window.removeEventListener("storage", loadData);
    };
  }, []);

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2500);
  };

  const getGuardById = (guardId) =>
    guards.find((guard) => String(guard.id) === String(guardId));

  const getWeaponType = (record, guard) =>
    record?.weaponType || guard?.weaponType || "N/A";

  const getLicenseNumber = (record, guard) =>
    record?.licenseNumber ||
    guard?.licenseNumber ||
    record?.weaponNumber ||
    guard?.weaponNumber ||
    "N/A";

  const getDutyPoint = (record, guard) =>
    record?.dutyPoint ||
    record?.dutyLocation ||
    guard?.dutyLocation ||
    "N/A";

  const todayAttendance = useMemo(() => {
    return attendanceRecords.filter((record) => record.date === today);
  }, [attendanceRecords, today]);

  const searchedGuards = useMemo(() => {
    const value = search.toLowerCase();
    if (!search.trim()) return [];

    return guards.filter(
      (guard) =>
        guard.name?.toLowerCase().includes(value) ||
        guard.fatherName?.toLowerCase().includes(value) ||
        guard.cnic?.includes(search) ||
        guard.dutyLocation?.toLowerCase().includes(value) ||
        guard.weaponType?.toLowerCase().includes(value) ||
        guard.licenseNumber?.toLowerCase().includes(value) ||
        guard.weaponNumber?.toLowerCase().includes(value)
    );
  }, [guards, search]);

  const presentToday = todayAttendance.filter(
    (record) => record.status === "Present"
  ).length;

  const lateToday = todayAttendance.filter(
    (record) => record.status === "Late"
  ).length;

  const absentToday = Math.max(guards.length - todayAttendance.length, 0);

  const getGuardHistory = (guardId) => {
    return attendanceRecords
      .filter((record) => {
        const sameGuard = String(record.guardId) === String(guardId);
        const sameMonth = record.date?.startsWith(historyMonth);
        const sameDate = historyDate ? record.date === historyDate : true;
        return sameGuard && sameMonth && sameDate;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  };

  const saveAttendance = (updatedRecords) => {
    localStorage.setItem("attendanceRecords", JSON.stringify(updatedRecords));
    setAttendanceRecords(updatedRecords);
    window.dispatchEvent(new Event("attendance-updated"));
  };

  const handleStatusUpdate = (guard, record, newStatus, selectedDate = today) => {
    if (!guard?.id && !record?.guardId) {
      showMessage("Guard not found");
      return;
    }

    const guardId = guard?.id || record.guardId;

    const existingRecord = attendanceRecords.find(
      (item) =>
        String(item.guardId) === String(guardId) && item.date === selectedDate
    );

    let updatedRecords;

    if (existingRecord) {
      updatedRecords = attendanceRecords.map((item) =>
        item.id === existingRecord.id
          ? {
              ...item,
              status: newStatus,
              markedBy: "Admin",
              time:
                item.time ||
                new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
            }
          : item
      );
    } else {
      const newRecord = {
        id: Date.now(),
        guardId: guard.id,
        guardName: guard.name,
        fatherName: guard.fatherName,
        cnic: guard.cnic,
        dutyPoint: guard.dutyLocation,
        weaponType: guard.weaponType,
        licenseNumber: guard.licenseNumber || guard.weaponNumber,
        status: newStatus,
        date: selectedDate,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        markedBy: "Admin",
      };

      updatedRecords = [newRecord, ...attendanceRecords];
    }

    saveAttendance(updatedRecords);
    showMessage(`Attendance marked ${newStatus} ✅`);
  };

  const handleRefresh = () => {
    loadData();
    showMessage("Attendance refreshed successfully ✅");
  };

  const openGuardHistory = (guard, record = {}) => {
    setSelectedGuard({
      guardId: guard?.id || record.guardId,
      guardName: record.guardName || guard?.name,
      fatherName: record.fatherName || guard?.fatherName,
      dutyPoint: getDutyPoint(record, guard),
      weaponType: getWeaponType(record, guard),
      licenseNumber: getLicenseNumber(record, guard),
      guardData: guard,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Attendance Management
          </h1>
          <p className="text-gray-500 mt-1">
            Today attendance only. Previous records stay saved in history.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="bg-white border border-gray-200 px-5 py-3 rounded-2xl flex items-center gap-2 hover:bg-gray-50 transition"
        >
          <RefreshCcw size={18} />
          Refresh
        </button>
      </div>

      {message && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-5 py-4 rounded-2xl font-medium">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <StatCard title="Total Guards" value={guards.length} icon={CalendarCheck} color="text-blue-600" bg="bg-blue-100" />
        <StatCard title="Present Today" value={presentToday} icon={CheckCircle2} color="text-green-600" bg="bg-green-100" />
        <StatCard title="Absent Today" value={absentToday} icon={XCircle} color="text-red-600" bg="bg-red-100" />
        <StatCard title="Late Today" value={lateToday} icon={AlertTriangle} color="text-yellow-600" bg="bg-yellow-100" />
      </div>

      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search all guards by name, CNIC, weapon name, license number or duty point..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-3 outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {search.trim()
                ? "Search Guards & Attendance History"
                : "Today Attendance"}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {search.trim()
                ? "Search all guards and open complete attendance history"
                : `Date: ${today}`}
            </p>
          </div>

          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-2xl text-sm font-semibold">
            New day starts empty automatically
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1250px]">
            <thead className="bg-gradient-to-r from-[#071739] to-[#0A1F4D] text-white">
              <tr>
                <th className="text-left px-6 py-4 whitespace-nowrap">Guard Name</th>
                <th className="text-left px-6 py-4 whitespace-nowrap">Father Name</th>
                <th className="text-left px-6 py-4 whitespace-nowrap">Duty Point</th>
                <th className="text-left px-6 py-4 whitespace-nowrap">Weapon Type</th>
                <th className="text-left px-6 py-4 whitespace-nowrap">License Number</th>
                <th className="text-left px-6 py-4 whitespace-nowrap">Status</th>
                <th className="text-left px-6 py-4 whitespace-nowrap">Time</th>
                <th className="text-center px-6 py-4 whitespace-nowrap">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-14 text-gray-500">
                    Loading attendance...
                  </td>
                </tr>
              ) : search.trim() && searchedGuards.length > 0 ? (
                searchedGuards.map((guard) => {
                  const todayRecord = todayAttendance.find(
                    (item) => String(item.guardId) === String(guard.id)
                  );

                  return (
                    <tr key={guard.id} className="border-b border-gray-100 hover:bg-blue-50/40 transition">
                      <td className="px-6 py-5 font-semibold text-gray-800 whitespace-nowrap">{guard.name || "N/A"}</td>
                      <td className="px-6 py-5 text-gray-700 whitespace-nowrap">{guard.fatherName || "N/A"}</td>
                      <td className="px-6 py-5 text-gray-700 whitespace-nowrap">{guard.dutyLocation || "N/A"}</td>
                      <td className="px-6 py-5 text-gray-700 whitespace-nowrap">{guard.weaponType || "N/A"}</td>
                      <td className="px-6 py-5 text-gray-700 whitespace-nowrap">{guard.licenseNumber || guard.weaponNumber || "N/A"}</td>

                      <td className="px-6 py-5 whitespace-nowrap">
                        <select
                          value={todayRecord?.status || "Present"}
                          onChange={(e) =>
                            handleStatusUpdate(guard, todayRecord || {}, e.target.value, today)
                          }
                          className={`px-3 py-2 rounded-xl text-xs font-semibold outline-none ${
                            todayRecord?.status === "Absent"
                              ? "bg-red-100 text-red-700"
                              : todayRecord?.status === "Late"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          <option value="Present">Present</option>
                          <option value="Absent">Absent</option>
                          <option value="Late">Late</option>
                        </select>
                      </td>

                      <td className="px-6 py-5 text-gray-700 whitespace-nowrap">
                        {todayRecord?.time || "-"}
                      </td>

                      <td className="px-6 py-5 text-center">
                        <button
                          onClick={() => openGuardHistory(guard, todayRecord || {})}
                          className="w-10 h-10 rounded-xl bg-blue-100 hover:bg-blue-200 inline-flex items-center justify-center transition"
                        >
                          <Eye size={18} className="text-blue-700" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : search.trim() && searchedGuards.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-14 text-gray-500">
                    No guard found for this search.
                  </td>
                </tr>
              ) : todayAttendance.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-14 text-gray-500">
                    No guard has marked attendance today.
                  </td>
                </tr>
              ) : (
                todayAttendance.map((record) => {
                  const guard = getGuardById(record.guardId);

                  return (
                    <tr key={record.id} className="border-b border-gray-100 hover:bg-blue-50/40 transition">
                      <td className="px-6 py-5 font-semibold text-gray-800 whitespace-nowrap">{record.guardName || guard?.name || "N/A"}</td>
                      <td className="px-6 py-5 text-gray-700 whitespace-nowrap">{record.fatherName || guard?.fatherName || "N/A"}</td>
                      <td className="px-6 py-5 text-gray-700 whitespace-nowrap">{getDutyPoint(record, guard)}</td>
                      <td className="px-6 py-5 text-gray-700 whitespace-nowrap">{getWeaponType(record, guard)}</td>
                      <td className="px-6 py-5 text-gray-700 whitespace-nowrap">{getLicenseNumber(record, guard)}</td>

                      <td className="px-6 py-5 whitespace-nowrap">
                        <select
                          value={record.status || "Present"}
                          onChange={(e) =>
                            handleStatusUpdate(guard, record, e.target.value, record.date)
                          }
                          className={`px-3 py-2 rounded-xl text-xs font-semibold outline-none ${
                            record.status === "Absent"
                              ? "bg-red-100 text-red-700"
                              : record.status === "Late"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          <option value="Present">Present</option>
                          <option value="Absent">Absent</option>
                          <option value="Late">Late</option>
                        </select>
                      </td>

                      <td className="px-6 py-5 text-gray-700 whitespace-nowrap">{record.time || "N/A"}</td>

                      <td className="px-6 py-5 text-center">
                        <button
                          onClick={() => openGuardHistory(guard, record)}
                          className="w-10 h-10 rounded-xl bg-blue-100 hover:bg-blue-200 inline-flex items-center justify-center transition"
                        >
                          <Eye size={18} className="text-blue-700" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedGuard && (
        <HistoryModal
          guard={selectedGuard}
          history={getGuardHistory(selectedGuard.guardId)}
          historyMonth={historyMonth}
          setHistoryMonth={setHistoryMonth}
          historyDate={historyDate}
          setHistoryDate={setHistoryDate}
          getDutyPoint={getDutyPoint}
          getWeaponType={getWeaponType}
          getLicenseNumber={getLicenseNumber}
          onStatusUpdate={handleStatusUpdate}
          onClose={() => setSelectedGuard(null)}
        />
      )}
    </div>
  );
}

function HistoryModal({
  guard,
  history,
  historyMonth,
  setHistoryMonth,
  historyDate,
  setHistoryDate,
  getDutyPoint,
  getWeaponType,
  getLicenseNumber,
  onStatusUpdate,
  onClose,
}) {
  const guardData = guard.guardData || {};

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        <div className="bg-[#071739] text-white p-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">
              Attendance History - {guard.guardName || guardData.name}
            </h2>
            <p className="text-sm text-gray-300">
              Month and date wise previous attendance
            </p>
          </div>

          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="month"
              value={historyMonth}
              onChange={(e) => setHistoryMonth(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:border-blue-500"
            />

            <input
              type="date"
              value={historyDate}
              onChange={(e) => setHistoryDate(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:border-blue-500"
            />

            <button
              onClick={() => setHistoryDate("")}
              className="bg-gray-100 hover:bg-gray-200 px-5 py-3 rounded-2xl"
            >
              Clear Date
            </button>
          </div>

          <div className="overflow-x-auto border border-gray-100 rounded-2xl">
            <table className="w-full min-w-[950px]">
              <thead className="bg-gradient-to-r from-[#071739] to-[#0A1F4D] text-white">
                <tr>
                  <th className="text-left px-6 py-4">Date</th>
                  <th className="text-left px-6 py-4">Time</th>
                  <th className="text-left px-6 py-4">Duty Point</th>
                  <th className="text-left px-6 py-4">Weapon Type</th>
                  <th className="text-left px-6 py-4">License No</th>
                  <th className="text-left px-6 py-4">Status</th>
                  <th className="text-left px-6 py-4">Marked By</th>
                </tr>
              </thead>

              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-10 text-gray-500">
                      No attendance history found.
                    </td>
                  </tr>
                ) : (
                  history.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-blue-50/40">
                      <td className="px-6 py-5 text-gray-700 whitespace-nowrap">{item.date}</td>
                      <td className="px-6 py-5 text-gray-700 whitespace-nowrap">{item.time || "N/A"}</td>
                      <td className="px-6 py-5 text-gray-700 whitespace-nowrap">{getDutyPoint(item, guardData)}</td>
                      <td className="px-6 py-5 text-gray-700 whitespace-nowrap">{getWeaponType(item, guardData)}</td>
                      <td className="px-6 py-5 text-gray-700 whitespace-nowrap">{getLicenseNumber(item, guardData)}</td>

                      <td className="px-6 py-5 whitespace-nowrap">
                        <select
                          value={item.status || "Present"}
                          onChange={(e) =>
                            onStatusUpdate(guardData, item, e.target.value, item.date)
                          }
                          className={`px-3 py-2 rounded-xl text-xs font-semibold outline-none ${
                            item.status === "Absent"
                              ? "bg-red-100 text-red-700"
                              : item.status === "Late"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          <option value="Present">Present</option>
                          <option value="Absent">Absent</option>
                          <option value="Late">Late</option>
                        </select>
                      </td>

                      <td className="px-6 py-5 text-gray-700 whitespace-nowrap">
                        {item.markedBy || "Guard"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bg }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition">
      <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center mb-4`}>
        <Icon className={color} size={28} />
      </div>
      <p className="text-gray-500 text-sm">{title}</p>
      <h2 className="text-3xl font-bold text-gray-800 mt-1">{value}</h2>
    </div>
  );
}
