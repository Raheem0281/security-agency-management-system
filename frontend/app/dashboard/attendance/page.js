"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCcw,
  Download,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

export default function AttendancePage() {
  const [guards, setGuards] = useState([]);
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [message, setMessage] = useState("");
  const [editGuard, setEditGuard] = useState(null);

  const todayDate = new Date().toISOString().split("T")[0];

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2500);
  };

  const loadData = () => {
    setGuards(JSON.parse(localStorage.getItem("guards")) || []);
    setRecords(JSON.parse(localStorage.getItem("attendanceRecords")) || []);
  };

  useEffect(() => {
    loadData();

    window.addEventListener("attendance-updated", loadData);
    window.addEventListener("guards-updated", loadData);

    return () => {
      window.removeEventListener("attendance-updated", loadData);
      window.removeEventListener("guards-updated", loadData);
    };
  }, []);

  const monthDates = useMemo(() => {
    const [year, month] = selectedMonth.split("-").map(Number);

    const totalDays = new Date(year, month, 0).getDate();

    return Array.from({ length: totalDays }, (_, index) => {
      const day = String(index + 1).padStart(2, "0");
      return `${selectedMonth}-${day}`;
    });
  }, [selectedMonth]);

  const getLicenseNumber = (guard) =>
    guard.licenseNumber || "N/A";

  const getWeaponType = (guard) =>
    guard.weaponType || "N/A";

  const getJoinDate = (guard) => {
    if (guard.joinDate) return guard.joinDate;

    if (guard.createdAt) {
      return guard.createdAt.split("T")[0];
    }

    return `${selectedMonth}-01`;
  };

  const getStatus = (guard, date) => {
    const joinDate = getJoinDate(guard);

    if (date < joinDate) return "NotJoined";

    if (date > todayDate) return "Future";

    const record = records.find(
      (item) =>
        String(item.guardId) === String(guard.id) &&
        item.date === date
    );

    return record?.status || "Absent";
  };

  const filteredGuards = useMemo(() => {
    const value = search.toLowerCase();

    return guards.filter(
      (guard) =>
        guard.name?.toLowerCase().includes(value) ||
        guard.fatherName?.toLowerCase().includes(value) ||
        guard.licenseNumber?.toLowerCase().includes(value) ||
        guard.weaponType?.toLowerCase().includes(value) ||
        guard.dutyLocation?.toLowerCase().includes(value)
    );
  }, [guards, search]);

  const presentCount = useMemo(() => {
    return filteredGuards.reduce((total, guard) => {
      return (
        total +
        monthDates.filter(
          (date) => getStatus(guard, date) === "Present"
        ).length
      );
    }, 0);
  }, [filteredGuards, monthDates, records]);

  const absentCount = useMemo(() => {
    return filteredGuards.reduce((total, guard) => {
      return (
        total +
        monthDates.filter(
          (date) => getStatus(guard, date) === "Absent"
        ).length
      );
    }, 0);
  }, [filteredGuards, monthDates, records]);

  const saveRecords = (updatedRecords) => {
    setRecords(updatedRecords);

    localStorage.setItem(
      "attendanceRecords",
      JSON.stringify(updatedRecords)
    );

    window.dispatchEvent(new Event("attendance-updated"));
  };

  const saveGuards = (updatedGuards) => {
    setGuards(updatedGuards);

    localStorage.setItem("guards", JSON.stringify(updatedGuards));

    window.dispatchEvent(new Event("guards-updated"));
  };

  const handleStatusChange = (guard, date, status) => {
    const existingRecord = records.find(
      (item) =>
        String(item.guardId) === String(guard.id) &&
        item.date === date
    );

    let updatedRecords;

    if (existingRecord) {
      updatedRecords = records.map((item) =>
        item.id === existingRecord.id
          ? {
              ...item,
              status,
              markedBy: "Admin",
              updatedAt: new Date().toISOString(),
            }
          : item
      );
    } else {
      const newRecord = {
        id: Date.now(),
        guardId: guard.id,
        guardName: guard.name,
        fatherName: guard.fatherName,
        licenseNumber: guard.licenseNumber,
        weaponType: guard.weaponType,
        dutyLocation: guard.dutyLocation,
        date,
        status,
        markedBy: "Admin",
        createdAt: new Date().toISOString(),
      };

      updatedRecords = [newRecord, ...records];
    }

    saveRecords(updatedRecords);

    showMessage("Attendance updated successfully ✅");
  };

  const handleDeleteGuard = (guardId) => {
    const confirmDelete = confirm(
      "Delete this guard and related attendance?"
    );

    if (!confirmDelete) return;

    const updatedGuards = guards.filter(
      (guard) => String(guard.id) !== String(guardId)
    );

    const updatedRecords = records.filter(
      (record) => String(record.guardId) !== String(guardId)
    );

    saveGuards(updatedGuards);
    saveRecords(updatedRecords);

    showMessage("Guard deleted successfully");
  };

  const handleUpdateGuard = () => {
    if (
      !editGuard.name ||
      !editGuard.fatherName ||
      !editGuard.dutyLocation
    ) {
      showMessage("Please fill required fields");
      return;
    }

    const updatedGuards = guards.map((guard) =>
      String(guard.id) === String(editGuard.id)
        ? editGuard
        : guard
    );

    const updatedRecords = records.map((record) =>
      String(record.guardId) === String(editGuard.id)
        ? {
            ...record,
            guardName: editGuard.name,
            fatherName: editGuard.fatherName,
            licenseNumber: editGuard.licenseNumber,
            weaponType: editGuard.weaponType,
            dutyLocation: editGuard.dutyLocation,
          }
        : record
    );

    saveGuards(updatedGuards);
    saveRecords(updatedRecords);

    setEditGuard(null);

    showMessage("Guard updated successfully ✅");
  };

  const handleExport = () => {
    const header = [
      "S.No",
      "Guard Name",
      "Father Name",
      "License Number",
      "Weapon Type",
      "Duty Point",
      "Join Date",
      ...monthDates,
    ].join(",");

    const rows = filteredGuards.map((guard, index) => {
      const statuses = monthDates.map((date) => {
        const status = getStatus(guard, date);

        if (status === "Present") return "P";

        if (status === "Absent") return "A";

        return "-";
      });

      return [
        index + 1,
        guard.name,
        guard.fatherName || "N/A",
        getLicenseNumber(guard),
        getWeaponType(guard),
        guard.dutyLocation || "N/A",
        getJoinDate(guard),
        ...statuses,
      ]
        .map((value) => `"${value}"`)
        .join(",");
    });

    const blob = new Blob(
      [header + "\n" + rows.join("\n")],
      {
        type: "text/csv",
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `attendance-${selectedMonth}.csv`;

    link.click();

    URL.revokeObjectURL(url);

    showMessage("Attendance exported successfully ✅");
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Attendance Management
          </h1>

          <p className="text-gray-500 mt-1">
            Monthly guard attendance with license and weapon details
          </p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={loadData}
            className="bg-white border border-gray-200 px-5 py-3 rounded-2xl flex items-center gap-2 hover:bg-gray-50"
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
        <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-2xl p-4 font-medium">
          {message}
        </div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <StatCard title="Total Guards" value={filteredGuards.length} />
        <StatCard title="Present Entries" value={presentCount} />
        <StatCard title="Absent Entries" value={absentCount} />
        <StatCard title="Month" value={selectedMonth} />
      </div>

      {/* FILTER */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-4 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search by name, father name, license no, weapon type or duty point..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#F4F7FE] border border-gray-200 rounded-2xl py-3 pl-12 pr-4 outline-none"
            />
          </div>

          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-[#F4F7FE] border border-gray-200 rounded-2xl px-4 py-3 outline-none"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1800px]">
            <thead className="bg-[#071739] text-white">
              <tr>
                <th className="p-4 text-left">S.No</th>
                <th className="p-4 text-left">Guard Name</th>
                <th className="p-4 text-left">Father Name</th>
                <th className="p-4 text-left">License Number</th>
                <th className="p-4 text-left">Weapon Type</th>
                <th className="p-4 text-left">Duty Point</th>
                <th className="p-4 text-left">Join Date</th>
                <th className="p-4 text-center">Actions</th>

                {monthDates.map((date) => (
                  <th
                    key={date}
                    className="p-4 text-center"
                  >
                    {date.split("-")[2]}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredGuards.length === 0 ? (
                <tr>
                  <td
                    colSpan={8 + monthDates.length}
                    className="text-center py-10 text-gray-500"
                  >
                    No guards found
                  </td>
                </tr>
              ) : (
                filteredGuards.map((guard, index) => (
                  <tr
                    key={guard.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="p-4">{index + 1}</td>

                    <td className="p-4 font-semibold text-gray-800">
                      {guard.name}
                    </td>

                    <td className="p-4 text-gray-700">
                      {guard.fatherName}
                    </td>

                    <td className="p-4 text-gray-700">
                      {guard.licenseNumber || "N/A"}
                    </td>

                    <td className="p-4 text-gray-700">
                      {guard.weaponType || "N/A"}
                    </td>

                    <td className="p-4 text-gray-700">
                      {guard.dutyLocation || "N/A"}
                    </td>

                    <td className="p-4 text-gray-700">
                      {getJoinDate(guard)}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setEditGuard(guard)}
                          className="w-10 h-10 rounded-xl bg-yellow-100 hover:bg-yellow-200 flex items-center justify-center"
                        >
                          <Pencil
                            size={18}
                            className="text-yellow-700"
                          />
                        </button>

                        <button
                          onClick={() =>
                            handleDeleteGuard(guard.id)
                          }
                          className="w-10 h-10 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center"
                        >
                          <Trash2
                            size={18}
                            className="text-red-700"
                          />
                        </button>
                      </div>
                    </td>

                    {monthDates.map((date) => {
                      const status = getStatus(guard, date);

                      if (
                        status === "NotJoined" ||
                        status === "Future"
                      ) {
                        return (
                          <td
                            key={date}
                            className="p-2 text-center text-gray-400"
                          >
                            -
                          </td>
                        );
                      }

                      return (
                        <td key={date} className="p-2 text-center">
                          <select
                            value={status}
                            onChange={(e) =>
                              handleStatusChange(
                                guard,
                                date,
                                e.target.value
                              )
                            }
                            className={`w-12 h-9 rounded-xl text-xs font-bold text-center outline-none ${
                              status === "Present"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            <option value="Present">P</option>
                            <option value="Absent">A</option>
                          </select>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editGuard && (
        <EditGuardModal
          guard={editGuard}
          setGuard={setEditGuard}
          onClose={() => setEditGuard(null)}
          onSave={handleUpdateGuard}
        />
      )}
    </div>
  );
}

function EditGuardModal({
  guard,
  setGuard,
  onClose,
  onSave,
}) {
  const updateField = (field, value) => {
    setGuard({
      ...guard,
      [field]: value,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-[#071739] text-white p-5 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            Edit Guard Details
          </h2>

          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Guard Name"
            value={guard.name}
            onChange={(e) =>
              updateField("name", e.target.value)
            }
          />

          <Input
            label="Father Name"
            value={guard.fatherName}
            onChange={(e) =>
              updateField("fatherName", e.target.value)
            }
          />

          <Input
            label="License Number"
            value={guard.licenseNumber}
            onChange={(e) =>
              updateField("licenseNumber", e.target.value)
            }
          />

          <Input
            label="Weapon Type"
            value={guard.weaponType}
            onChange={(e) =>
              updateField("weaponType", e.target.value)
            }
          />

          <Input
            label="Duty Point"
            value={guard.dutyLocation}
            onChange={(e) =>
              updateField("dutyLocation", e.target.value)
            }
          />

          <Input
            type="date"
            label="Join Date"
            value={guard.joinDate}
            onChange={(e) =>
              updateField("joinDate", e.target.value)
            }
          />
        </div>

        <div className="p-6 pt-0 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-2xl bg-gray-200"
          >
            Cancel
          </button>

          <button
            onClick={onSave}
            className="px-5 py-3 rounded-2xl bg-[#071739] text-white"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-gray-600">
        {label}
      </label>

      <input
        type={type}
        value={value || ""}
        onChange={onChange}
        className="mt-2 w-full bg-[#F4F7FE] border border-gray-200 rounded-2xl px-4 py-3 outline-none"
      />
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <p className="text-gray-500 text-sm">{title}</p>

      <h2 className="text-3xl font-bold text-gray-800 mt-2">
        {value}
      </h2>
    </div>
  );
}
