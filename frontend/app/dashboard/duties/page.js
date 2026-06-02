"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ClipboardList,
  Plus,
  Search,
  Trash2,
  RefreshCcw,
  User,
  Building2,
} from "lucide-react";

const emptyDuty = {
  guardId: "",
  clientId: "",
  shift: "Day Shift",
  dutyTime: "",
  dutyPoint: "",
  date: "",
};

export default function DutiesPage() {
  const [duties, setDuties] = useState([]);
  const [guards, setGuards] = useState([]);
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [newDuty, setNewDuty] = useState(emptyDuty);

  const loadData = () => {
    setGuards(JSON.parse(localStorage.getItem("guards")) || []);
    setClients(JSON.parse(localStorage.getItem("clients")) || []);
    setDuties(JSON.parse(localStorage.getItem("duties")) || []);
  };

  useEffect(() => {
    loadData();

    window.addEventListener("guards-updated", loadData);
    window.addEventListener("clients-updated", loadData);
    window.addEventListener("duties-updated", loadData);
    window.addEventListener("storage", loadData);

    return () => {
      window.removeEventListener("guards-updated", loadData);
      window.removeEventListener("clients-updated", loadData);
      window.removeEventListener("duties-updated", loadData);
      window.removeEventListener("storage", loadData);
    };
  }, []);

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2500);
  };

  const saveDuties = (updatedDuties) => {
    setDuties(updatedDuties);
    localStorage.setItem("duties", JSON.stringify(updatedDuties));
    window.dispatchEvent(new Event("duties-updated"));
  };

  const saveGuards = (updatedGuards) => {
    setGuards(updatedGuards);
    localStorage.setItem("guards", JSON.stringify(updatedGuards));
    window.dispatchEvent(new Event("guards-updated"));
  };

  const activeGuards = guards.filter((guard) => guard.status === "Active");
  const activeClients = clients.filter((client) => client.status === "Active");

  const getGuard = (id) =>
    guards.find((guard) => String(guard.id) === String(id));

  const getClient = (id) =>
    clients.find((client) => String(client.id) === String(id));

  const filteredDuties = useMemo(() => {
    const value = search.toLowerCase();

    return duties.filter((duty) => {
      return (
        duty.guardName?.toLowerCase().includes(value) ||
        duty.fatherName?.toLowerCase().includes(value) ||
        duty.clientName?.toLowerCase().includes(value) ||
        duty.licenseNumber?.toLowerCase().includes(value) ||
        duty.weaponType?.toLowerCase().includes(value) ||
        duty.dutyPoint?.toLowerCase().includes(value) ||
        duty.shift?.toLowerCase().includes(value) ||
        duty.date?.includes(search)
      );
    });
  }, [duties, search]);

  const handleAddDuty = () => {
    if (
      !newDuty.guardId ||
      !newDuty.clientId ||
      !newDuty.date ||
      !newDuty.dutyPoint
    ) {
      showMessage("Please select guard, client, duty point and date");
      return;
    }

    const guard = getGuard(newDuty.guardId);
    const client = getClient(newDuty.clientId);

    if (!guard || !client) {
      showMessage("Selected guard or client not found");
      return;
    }

    const duty = {
      id: Date.now(),
      guardId: guard.id,
      clientId: client.id,
      guardName: guard.name,
      fatherName: guard.fatherName || "",
      clientName: client.company || client.name || "",
      clientOwner: client.owner || "",
      licenseNumber: guard.licenseNumber || "",
      weaponType: guard.weaponType || "",
      shift: newDuty.shift,
      dutyTime: newDuty.dutyTime,
      dutyPoint: newDuty.dutyPoint,
      date: newDuty.date,
      createdAt: new Date().toISOString(),
    };

    saveDuties([duty, ...duties]);

    const updatedGuards = guards.map((item) =>
      String(item.id) === String(guard.id)
        ? {
            ...item,
            dutyLocation: newDuty.dutyPoint,
            shift: newDuty.shift,
            dutyTime: newDuty.dutyTime,
          }
        : item
    );

    saveGuards(updatedGuards);

    setNewDuty(emptyDuty);
    showMessage("Duty assigned successfully ✅");
  };

  const handleDeleteDuty = (id) => {
    if (!confirm("Delete this duty?")) return;

    const updatedDuties = duties.filter((duty) => duty.id !== id);
    saveDuties(updatedDuties);
    showMessage("Duty deleted successfully");
  };

  const handleRefresh = () => {
    loadData();
    showMessage("Duties refreshed ✅");
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Duty Assignment
          </h1>

          <p className="text-gray-500 mt-1">
            Assign guards to clients and keep duty point connected with
            attendance
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

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          title="Total Duties"
          value={duties.length}
          icon={ClipboardList}
        />

        <StatCard
          title="Active Guards"
          value={activeGuards.length}
          icon={User}
        />

        <StatCard
          title="Active Clients"
          value={activeClients.length}
          icon={Building2}
        />
      </div>

      {/* ADD DUTY */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-5">
          Assign New Duty
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <select
            value={newDuty.guardId}
            onChange={(e) =>
              setNewDuty({ ...newDuty, guardId: e.target.value })
            }
            className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="">Select Guard</option>

            {activeGuards.map((guard) => (
              <option key={guard.id} value={guard.id}>
                {guard.name}
                {guard.fatherName ? ` S/O ${guard.fatherName}` : ""}
              </option>
            ))}
          </select>

          <select
            value={newDuty.clientId}
            onChange={(e) => {
              const client = getClient(e.target.value);

              setNewDuty({
                ...newDuty,
                clientId: e.target.value,
                dutyPoint: client?.address || newDuty.dutyPoint,
              });
            }}
            className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="">Select Client</option>

            {activeClients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.company || client.name}
              </option>
            ))}
          </select>

          <select
            value={newDuty.shift}
            onChange={(e) =>
              setNewDuty({ ...newDuty, shift: e.target.value })
            }
            className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:border-blue-500"
          >
            <option>Day Shift</option>
            <option>Night Shift</option>
            <option>Evening Shift</option>
          </select>

          <input
            type="text"
            placeholder="7:00 PM - 7:00 AM"
            value={newDuty.dutyTime}
            onChange={(e) =>
              setNewDuty({
                ...newDuty,
                dutyTime: e.target.value,
              })
            }
            className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:border-blue-500 min-w-[220px]"
          />

          <input
            type="date"
            value={newDuty.date}
            onChange={(e) =>
              setNewDuty({ ...newDuty, date: e.target.value })
            }
            className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:border-blue-500"
          />

          <input
            type="text"
            placeholder="Duty Point / Location"
            value={newDuty.dutyPoint}
            onChange={(e) =>
              setNewDuty({ ...newDuty, dutyPoint: e.target.value })
            }
            className="md:col-span-4 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:border-blue-500"
          />

          <button
            onClick={handleAddDuty}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-5 py-3 rounded-2xl flex items-center justify-center gap-2 font-bold hover:scale-[1.02] transition"
          >
            <Plus size={20} />
            Assign
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />

          <input
            type="text"
            placeholder="Search by guard, father name, client, license no, weapon type, duty point, shift or date..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-3 outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
  {/* TABLE HEADER */}
  <div className="px-6 py-5 border-b border-gray-100">
    <h2 className="text-2xl font-bold text-gray-800">
      Assigned Duties
    </h2>

    <p className="text-gray-500 text-sm mt-1">
      Professional duty records connected with guards and clients
    </p>
  </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1600px] border-collapse">
            <thead className="bg-gradient-to-r from-[#071739] to-[#0A1F4D] text-white whitespace-nowrap">
              <tr>
                <th className="px-5 py-4 text-left font-semibold">
                  Guard Name
                </th>
                
                <th className="px-5 py-4 text-left font-semibold">
                  Father Name
                </th>
                
                <th className="px-5 py-4 text-left font-semibold">
                  Client Name
                </th>
                
                <th className="px-5 py-4 text-left font-semibold">
                  License No
                </th>
                
                <th className="px-5 py-4 text-left font-semibold">
                  Weapon Type
                </th>
                
                <th className="px-5 py-4 text-left font-semibold">
                  Duty Point
                </th>
                
                <th className="px-5 py-4 text-left font-semibold">
                  Shift
                </th>
                
                <th className="px-5 py-4 text-left font-semibold whitespace-nowrap">
                  Duty Time
                </th>
                
                <th className="px-5 py-4 text-left font-semibold">
                  Date
                </th>
                
                <th className="px-5 py-4 text-center font-semibold">
                  Action
                </th>
              </tr>
            </thead>
                
            <tbody>
              {filteredDuties.length === 0 ? (
                <tr>
                  <td
                    colSpan="10"
                    className="text-center py-12 text-gray-500"
                  >
                    No duties assigned yet.
                  </td>
                </tr>
              ) : (
                filteredDuties.map((duty, index) => (
                  <tr
                    key={duty.id}
                    className={`border-b border-gray-100 hover:bg-blue-50/40 transition-all ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/40"
                    }`}
                  >
                    <td className="px-5 py-4 whitespace-nowrap font-semibold text-gray-800">
                      {duty.guardName || "N/A"}
                    </td>
                  
                    <td className="px-5 py-4 whitespace-nowrap text-gray-700">
                      {duty.fatherName || "N/A"}
                    </td>
                  
                    <td className="px-5 py-4 whitespace-nowrap text-gray-700">
                      {duty.clientName || "N/A"}
                    </td>
                  
                    <td className="px-5 py-4 whitespace-nowrap text-gray-700 font-medium">
                      {duty.licenseNumber || "N/A"}
                    </td>
                  
                    <td className="px-5 py-4 whitespace-nowrap text-gray-700">
                      {duty.weaponType || "N/A"}
                    </td>
                  
                    <td className="px-5 py-4 whitespace-nowrap text-gray-700">
                      {duty.dutyPoint || "N/A"}
                    </td>
                  
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                        {duty.shift || "N/A"}
                      </span>
                    </td>
                  
                    <td className="px-5 py-4 whitespace-nowrap text-gray-700 font-medium">
                      {duty.dutyTime || "N/A"}
                    </td>
                  
                    <td className="px-5 py-4 whitespace-nowrap text-gray-700">
                      {duty.date || "N/A"}
                    </td>
                  
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => handleDeleteDuty(duty.id)}
                        className="bg-red-100 hover:bg-red-200 text-red-700 w-10 h-10 rounded-xl inline-flex items-center justify-center transition"
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

function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition">
      <Icon className="text-blue-600 mb-3" size={28} />

      <p className="text-gray-500 text-sm">{title}</p>

      <h2 className="text-3xl font-bold text-gray-800 mt-1">{value}</h2>
    </div>
  );
}
