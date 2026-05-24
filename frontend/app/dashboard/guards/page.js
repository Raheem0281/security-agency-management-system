"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Pencil, Trash2, ShieldCheck, X } from "lucide-react";

const emptyGuard = {
  name: "",
  fatherName: "",
  cnic: "",
  phone: "",
  email: "",
  password: "",
  dutyLocation: "",
  shift: "",
  dutyTime: "",
  licenseNumber: "",
  weaponType: "",
  joinDate: "",
  status: "Active",
};

export default function GuardsPage() {
  const [guards, setGuards] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editGuard, setEditGuard] = useState(null);
  const [newGuard, setNewGuard] = useState(emptyGuard);

  useEffect(() => {
    setGuards(JSON.parse(localStorage.getItem("guards")) || []);
  }, []);

  const saveGuards = (updatedGuards) => {
    setGuards(updatedGuards);
    localStorage.setItem("guards", JSON.stringify(updatedGuards));
    window.dispatchEvent(new Event("guards-updated"));
  };

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2500);
  };

  const filteredGuards = useMemo(() => {
    const value = search.toLowerCase();

    return guards.filter(
      (guard) =>
        guard.name?.toLowerCase().includes(value) ||
        guard.fatherName?.toLowerCase().includes(value) ||
        guard.email?.toLowerCase().includes(value) ||
        guard.cnic?.includes(search) ||
        guard.licenseNumber?.toLowerCase().includes(value) ||
        guard.weaponType?.toLowerCase().includes(value) ||
        guard.dutyLocation?.toLowerCase().includes(value)
    );
  }, [guards, search]);

  const validateGuard = (guard) => {
    return (
      guard.name &&
      guard.fatherName &&
      guard.email &&
      guard.password &&
      guard.cnic &&
      guard.dutyLocation
    );
  };

  const handleAddGuard = () => {
    if (!validateGuard(newGuard)) {
      showMessage("Please fill required fields");
      return;
    }

    const guard = {
      id: Date.now(),
      ...newGuard,
      joinDate:
        newGuard.joinDate || new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
    };

    saveGuards([guard, ...guards]);
    setNewGuard(emptyGuard);
    setShowAddModal(false);
    showMessage("Guard added successfully ✅");
  };

  const handleUpdateGuard = () => {
    if (!validateGuard(editGuard)) {
      showMessage("Please fill required fields");
      return;
    }

    const updated = guards.map((guard) =>
      guard.id === editGuard.id ? editGuard : guard
    );

    saveGuards(updated);
    setEditGuard(null);
    showMessage("Guard updated successfully ✅");
  };

  const handleDeleteGuard = (id) => {
    if (!confirm("Are you sure you want to delete this guard?")) return;

    saveGuards(guards.filter((guard) => guard.id !== id));
    showMessage("Guard deleted successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Guards Management
          </h1>
          <p className="text-gray-500 mt-1">
            Manage guards, login credentials, license number and weapon type
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-5 py-3 rounded-2xl flex items-center gap-2 shadow-lg"
        >
          <Plus size={20} />
          Add Guard
        </button>
      </div>

      {message && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-2xl p-4 font-medium">
          {message}
        </div>
      )}

      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-4 text-gray-400" />

          <input
            type="text"
            placeholder="Search by name, father name, email, CNIC, license no, weapon type or duty point..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#F4F7FE] border border-gray-200 rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1400px]">
            <thead className="bg-[#071739] text-white">
              <tr>
                <th className="p-4 text-left">Guard</th>
                <th className="p-4 text-left">Father Name</th>
                <th className="p-4 text-left">CNIC</th>
                <th className="p-4 text-left">Phone</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Password</th>
                <th className="p-4 text-left">Duty Point</th>
                <th className="p-4 text-left">License Number</th>
                <th className="p-4 text-left">Weapon Type</th>
                <th className="p-4 text-left">Join Date</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredGuards.length === 0 ? (
                <tr>
                  <td colSpan="12" className="text-center py-10 text-gray-500">
                    No guards found
                  </td>
                </tr>
              ) : (
                filteredGuards.map((guard) => (
                  <tr
                    key={guard.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white flex items-center justify-center">
                          <ShieldCheck size={21} />
                        </div>

                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {guard.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            ID #{guard.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-gray-700">{guard.fatherName}</td>
                    <td className="p-4 text-gray-700">{guard.cnic}</td>
                    <td className="p-4 text-gray-700">{guard.phone}</td>
                    <td className="p-4 text-gray-700">{guard.email}</td>
                    <td className="p-4 text-gray-700">{guard.password}</td>
                    <td className="p-4 text-gray-700">{guard.dutyLocation}</td>
                    <td className="p-4 text-gray-700">
                      {guard.licenseNumber || "N/A"}
                    </td>
                    <td className="p-4 text-gray-700">
                      {guard.weaponType || "N/A"}
                    </td>
                    <td className="p-4 text-gray-700">
                      {guard.joinDate || "N/A"}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          guard.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {guard.status}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setEditGuard(guard)}
                          className="w-10 h-10 rounded-xl bg-yellow-100 hover:bg-yellow-200 flex items-center justify-center"
                        >
                          <Pencil size={18} className="text-yellow-700" />
                        </button>

                        <button
                          onClick={() => handleDeleteGuard(guard.id)}
                          className="w-10 h-10 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center"
                        >
                          <Trash2 size={18} className="text-red-700" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <GuardFormModal
          title="Add New Guard"
          guard={newGuard}
          setGuard={setNewGuard}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddGuard}
          submitText="Add Guard"
        />
      )}

      {editGuard && (
        <GuardFormModal
          title="Edit Guard"
          guard={editGuard}
          setGuard={setEditGuard}
          onClose={() => setEditGuard(null)}
          onSubmit={handleUpdateGuard}
          submitText="Save Changes"
        />
      )}
    </div>
  );
}

function GuardFormModal({ title, guard, setGuard, onClose, onSubmit, submitText }) {
  const updateField = (field, value) => {
    setGuard({ ...guard, [field]: value });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-[#071739] text-white p-5 flex items-center justify-between">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
          <Input label="Guard Name" value={guard.name} onChange={(e) => updateField("name", e.target.value)} />
          <Input label="Father Name" value={guard.fatherName} onChange={(e) => updateField("fatherName", e.target.value)} />
          <Input label="CNIC" value={guard.cnic} onChange={(e) => updateField("cnic", e.target.value)} />
          <Input label="Phone" value={guard.phone} onChange={(e) => updateField("phone", e.target.value)} />
          <Input label="Login Email" type="email" value={guard.email} onChange={(e) => updateField("email", e.target.value)} />
          <Input label="Login Password" value={guard.password} onChange={(e) => updateField("password", e.target.value)} />
          <Input label="Duty Point" value={guard.dutyLocation} onChange={(e) => updateField("dutyLocation", e.target.value)} />
          <Input label="Shift" value={guard.shift} placeholder="Day Shift / Night Shift" onChange={(e) => updateField("shift", e.target.value)} />
          <Input label="Duty Time" value={guard.dutyTime} placeholder="8:00 PM - 6:00 AM" onChange={(e) => updateField("dutyTime", e.target.value)} />
          <Input label="License Number" value={guard.licenseNumber} onChange={(e) => updateField("licenseNumber", e.target.value)} />
          
          <WeaponTypeSelect
            value={guard.weaponType}
            onChange={(value) => updateField("weaponType", value)}
          />

          <Input label="Join Date" type="date" value={guard.joinDate} onChange={(e) => updateField("joinDate", e.target.value)} />

          <div>
            <label className="text-sm font-semibold text-gray-600">Status</label>
            <select
              value={guard.status}
              onChange={(e) => updateField("status", e.target.value)}
              className="mt-2 w-full bg-[#F4F7FE] border border-gray-200 rounded-2xl px-4 py-3 outline-none"
            >
              <option>Active</option>
              <option>Inactive</option>
              <option>Leave</option>
            </select>
          </div>
        </div>

        <div className="p-6 pt-0 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-3 rounded-2xl bg-gray-200 hover:bg-gray-300">
            Cancel
          </button>

          <button onClick={onSubmit} className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
            {submitText}
          </button>
        </div>
      </div>
    </div>
  );
}

function WeaponTypeSelect({ value, onChange }) {
  return (
    <div>
      <label className="text-sm font-semibold text-gray-600">
        Weapon Type
      </label>

      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full bg-[#F4F7FE] border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:border-blue-500"
      >
        <option value="">Select Weapon Type</option>

        <optgroup label="Pistols">
          <option value="9MM Pistol">9MM Pistol</option>
          <option value="30 Bore Pistol">30 Bore Pistol</option>
          <option value="44 Bore Pistol">44 Bore Pistol</option>
          <option value="MP5">MP5</option>
        </optgroup>

        <optgroup label="Shotguns">
          <option value="12 Bore Shotgun">12 Bore Shotgun</option>
          <option value="Pump Action Shotgun">Pump Action Shotgun</option>
        </optgroup>

        <optgroup label="Rifles">
          <option value="7MM Rifle">7MM Rifle</option>
          <option value="8MM Rifle">8MM Rifle</option>
          <option value="222 Bore Rifle">222 Bore Rifle</option>
          <option value="223 Bore Rifle">223 Bore Rifle</option>
          <option value="44 Bore Rifle">44 Bore Rifle</option>
          <option value="SMG">SMG</option>
          <option value="AK-47">AK-47</option>
          <option value="G3 Rifle">G3 Rifle</option>
        </optgroup>
      </select>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <div>
      <label className="text-sm font-semibold text-gray-600">{label}</label>
      <input
        type={type}
        value={value || ""}
        placeholder={placeholder || label}
        onChange={onChange}
        className="mt-2 w-full bg-[#F4F7FE] border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:border-blue-500"
      />
    </div>
  );
}
