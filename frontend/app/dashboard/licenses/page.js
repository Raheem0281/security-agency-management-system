"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Search,
  Plus,
  Shield,
  CalendarDays,
  FileBadge,
  Pencil,
  Trash2,
  Eye,
  X,
} from "lucide-react";

const emptyLicense = {
  guardId: "",
  guardName: "",
  licenseNumber: "",
  weaponType: "",
  issueDate: "",
  expiryDate: "",
  status: "Active",
};

export default function LicensesPage() {
  const [search, setSearch] = useState("");
  const [guards, setGuards] = useState([]);
  const [licenses, setLicenses] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewLicense, setViewLicense] = useState(null);
  const [editLicense, setEditLicense] = useState(null);
  const [newLicense, setNewLicense] = useState(emptyLicense);
  const [message, setMessage] = useState("");

  const loadData = () => {
    setGuards(JSON.parse(localStorage.getItem("guards")) || []);
    setLicenses(JSON.parse(localStorage.getItem("licenses")) || []);
  };

  useEffect(() => {
    loadData();

    window.addEventListener("guards-updated", loadData);
    window.addEventListener("licenses-updated", loadData);

    return () => {
      window.removeEventListener("guards-updated", loadData);
      window.removeEventListener("licenses-updated", loadData);
    };
  }, []);

  const saveLicenses = (updatedLicenses) => {
    setLicenses(updatedLicenses);
    localStorage.setItem("licenses", JSON.stringify(updatedLicenses));
    window.dispatchEvent(new Event("licenses-updated"));
  };

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2500);
  };

  const filteredLicenses = useMemo(() => {
    const value = search.toLowerCase();

    return licenses.filter(
      (license) =>
        license.guardName?.toLowerCase().includes(value) ||
        license.licenseNumber?.toLowerCase().includes(value) ||
        license.weaponType?.toLowerCase().includes(value)
    );
  }, [licenses, search]);

  const activeCount = licenses.filter(
    (license) => license.status === "Active"
  ).length;

  const expiredCount = licenses.filter(
    (license) => license.status === "Expired"
  ).length;

  const handleGuardSelect = (guardId, setter, currentLicense) => {
    const guard = guards.find(
      (item) => String(item.id) === String(guardId)
    );

    setter({
      ...currentLicense,
      guardId,
      guardName: guard?.name || "",
      licenseNumber: guard?.licenseNumber || "",
      weaponType: guard?.weaponType || "",
    });
  };

  const validateLicense = (license) => {
    return (
      license.guardName &&
      license.licenseNumber &&
      license.weaponType &&
      license.issueDate &&
      license.expiryDate
    );
  };

  const handleAddLicense = () => {
    if (!validateLicense(newLicense)) {
      showMessage("Please fill all required fields");
      return;
    }

    const updated = [
      {
        id: Date.now(),
        ...newLicense,
        createdAt: new Date().toISOString(),
      },
      ...licenses,
    ];

    saveLicenses(updated);
    setNewLicense(emptyLicense);
    setShowAddModal(false);
    showMessage("License added successfully ✅");
  };

  const handleUpdateLicense = () => {
    if (!validateLicense(editLicense)) {
      showMessage("Please fill all required fields");
      return;
    }

    const updated = licenses.map((license) =>
      license.id === editLicense.id ? editLicense : license
    );

    saveLicenses(updated);
    setEditLicense(null);
    showMessage("License updated successfully ✅");
  };

  const handleDelete = (id) => {
    if (!confirm("Delete this license?")) return;

    const updated = licenses.filter((license) => license.id !== id);
    saveLicenses(updated);
    showMessage("License deleted successfully");
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Licenses Management
          </h1>

          <p className="text-gray-500 mt-1">
            Manage weapon licenses connected with guards
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#071739] hover:bg-[#0A1F4D] text-white px-5 py-3 rounded-2xl flex items-center gap-2 shadow-lg transition"
        >
          <Plus size={20} />
          Add License
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
          title="Total Licenses"
          value={licenses.length}
          icon={<BadgeCheck className="text-blue-600" size={28} />}
          bg="bg-blue-100"
          color="text-gray-800"
        />

        <StatCard
          title="Active Licenses"
          value={activeCount}
          icon={<Shield className="text-green-600" size={28} />}
          bg="bg-green-100"
          color="text-green-600"
        />

        <StatCard
          title="Expired Licenses"
          value={expiredCount}
          icon={<FileBadge className="text-red-600" size={28} />}
          bg="bg-red-100"
          color="text-red-600"
        />
      </div>

      {/* SEARCH */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
        <div className="relative">
          <Search
            className="absolute left-4 top-3.5 text-gray-400"
            size={20}
          />

          <input
            type="text"
            placeholder="Search by guard, license number or weapon type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-3 outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-gradient-to-r from-[#071739] to-[#0A1F4D] text-white">
              <tr>
                <th className="text-left px-6 py-4">Guard</th>
                <th className="text-left px-6 py-4">License Number</th>
                <th className="text-left px-6 py-4">Weapon Type</th>
                <th className="text-left px-6 py-4">Issue Date</th>
                <th className="text-left px-6 py-4">Expiry Date</th>
                <th className="text-left px-6 py-4">Status</th>
                <th className="text-center px-6 py-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredLicenses.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-12 text-gray-500"
                  >
                    No licenses found
                  </td>
                </tr>
              ) : (
                filteredLicenses.map((license) => (
                  <tr
                    key={license.id}
                    className="border-b border-gray-100 hover:bg-blue-50/40 transition"
                  >
                    <td className="px-6 py-5 font-semibold text-gray-800">
                      {license.guardName}
                    </td>

                    <td className="px-6 py-5 text-gray-700">
                      {license.licenseNumber}
                    </td>

                    <td className="px-6 py-5 text-gray-700">
                      {license.weaponType}
                    </td>

                    <td className="px-6 py-5 text-gray-700">
                      {license.issueDate}
                    </td>

                    <td className="px-6 py-5 text-gray-700">
                      {license.expiryDate}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          license.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {license.status}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => setViewLicense(license)}
                          className="w-10 h-10 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center"
                        >
                          <Eye size={18} className="text-blue-700" />
                        </button>

                        <button
                          onClick={() => setEditLicense(license)}
                          className="w-10 h-10 rounded-xl bg-yellow-100 hover:bg-yellow-200 flex items-center justify-center"
                        >
                          <Pencil size={18} className="text-yellow-700" />
                        </button>

                        <button
                          onClick={() => handleDelete(license.id)}
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
        <LicenseFormModal
          title="Add New License"
          guards={guards}
          license={newLicense}
          setLicense={setNewLicense}
          onGuardSelect={handleGuardSelect}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddLicense}
          submitText="Save License"
        />
      )}

      {editLicense && (
        <LicenseFormModal
          title="Edit License"
          guards={guards}
          license={editLicense}
          setLicense={setEditLicense}
          onGuardSelect={handleGuardSelect}
          onClose={() => setEditLicense(null)}
          onSubmit={handleUpdateLicense}
          submitText="Save Changes"
        />
      )}

      {viewLicense && (
        <ViewLicenseModal
          license={viewLicense}
          onClose={() => setViewLicense(null)}
        />
      )}
    </div>
  );
}

function LicenseFormModal({
  title,
  guards,
  license,
  setLicense,
  onGuardSelect,
  onClose,
  onSubmit,
  submitText,
}) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-[#071739] text-white p-5 flex items-center justify-between">
          <h2 className="text-xl font-bold">{title}</h2>

          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          <select
            value={license.guardId}
            onChange={(e) =>
              onGuardSelect(e.target.value, setLicense, license)
            }
            className="border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:border-blue-500"
          >
            <option value="">Select Guard</option>

            {guards.map((guard) => (
              <option key={guard.id} value={guard.id}>
                {guard.name}
              </option>
            ))}
          </select>

          <InputField
            icon={<BadgeCheck size={18} />}
            placeholder="License Number"
            value={license.licenseNumber}
            onChange={(e) =>
              setLicense({
                ...license,
                licenseNumber: e.target.value,
              })
            }
          />

          <WeaponTypeSelect
            value={license.weaponType}
            onChange={(value) =>
              setLicense({
                ...license,
                weaponType: value,
              })
            }
          />

          <InputField
            icon={<CalendarDays size={18} />}
            type="date"
            placeholder="Issue Date"
            value={license.issueDate}
            onChange={(e) =>
              setLicense({
                ...license,
                issueDate: e.target.value,
              })
            }
          />

          <InputField
            icon={<CalendarDays size={18} />}
            type="date"
            placeholder="Expiry Date"
            value={license.expiryDate}
            onChange={(e) =>
              setLicense({
                ...license,
                expiryDate: e.target.value,
              })
            }
          />

          <select
            value={license.status}
            onChange={(e) =>
              setLicense({
                ...license,
                status: e.target.value,
              })
            }
            className="border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:border-blue-500"
          >
            <option>Active</option>
            <option>Expired</option>
          </select>
        </div>

        <div className="p-6 pt-0 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-2xl bg-gray-200 hover:bg-gray-300 transition"
          >
            Cancel
          </button>

          <button
            onClick={onSubmit}
            className="px-5 py-3 rounded-2xl bg-[#071739] hover:bg-[#0A1F4D] text-white transition"
          >
            {submitText}
          </button>
        </div>
      </div>
    </div>
  );
}

function WeaponTypeSelect({ value, onChange }) {
  return (
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:border-blue-500"
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
  );
}

function ViewLicenseModal({ license, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-bold text-gray-800">
            License Details
          </h2>

          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="space-y-3 text-gray-700">
          <Detail label="Guard" value={license.guardName} />
          <Detail label="License Number" value={license.licenseNumber} />
          <Detail label="Weapon Type" value={license.weaponType} />
          <Detail label="Issue Date" value={license.issueDate} />
          <Detail label="Expiry Date" value={license.expiryDate} />
          <Detail label="Status" value={license.status} />
        </div>
      </div>
    </div>
  );
}

function InputField({
  icon,
  placeholder,
  value,
  onChange,
  type = "text",
}) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-3.5 text-gray-400">
        {icon}
      </div>

      <input
        type={type}
        placeholder={placeholder}
        value={value || ""}
        onChange={onChange}
        className="w-full border border-gray-200 rounded-2xl pl-12 pr-4 py-3 outline-none focus:border-blue-500"
      />
    </div>
  );
}

function StatCard({ title, value, icon, bg, color }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>

          <h2 className={`text-3xl font-bold mt-1 ${color}`}>
            {value}
          </h2>
        </div>

        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bg}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <p className="bg-gray-50 rounded-2xl p-4">
      <b>{label}:</b> {value || "N/A"}
    </p>
  );
}
