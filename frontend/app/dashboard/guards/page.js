"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Pencil, Trash2, X, Download, RefreshCcw } from "lucide-react";
import {
  fetchGuards,
  createGuard,
  updateGuard,
  deleteGuard,
  fetchLicenses,
} from "../../../services/dataService";

const emptyGuard = {
  name: "",
  fatherName: "",
  cnic: "",
  phone: "",
  email: "",
  password: "",
  address: "",
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
  const [licenses, setLicenses] = useState([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editGuard, setEditGuard] = useState(null);
  const [newGuard, setNewGuard] = useState(emptyGuard);

  const today = new Date().toISOString().split("T")[0];
  const getId = (item) => item?._id || item?.id;

  const showMsg = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [guardsData, licensesData] = await Promise.all([
        fetchGuards(),
        fetchLicenses(),
      ]);
      setGuards(guardsData || []);
      setLicenses(licensesData || []);
    } catch (error) {
      console.error(error);
      showMsg(error?.response?.data?.message || "Failed to load guards");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const isLicenseExpired = (licenseNumber) => {
    const license = licenses.find((l) => l.licenseNumber === licenseNumber);
    if (!license?.expiryDate) return false;
    return license.expiryDate < today;
  };

  const validateGuard = (guard, isEdit = false) => {
    if (!guard.name?.trim()) return "Guard name is required";
    if (!guard.fatherName?.trim()) return "Father name is required";
    if (!/^\d{13}$/.test(guard.cnic || "")) return "CNIC must be 13 digits";
    if (!/^03\d{9}$/.test(guard.phone || "")) return "Enter valid Pakistani phone number";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guard.email || "")) return "Invalid email address";
    if (!isEdit && !guard.password?.trim()) return "Password is required";
    if (!guard.address?.trim()) return "Address is required";
    if (!guard.licenseNumber) return "License number is required";
    if (!guard.weaponType) return "Weapon type is required";
    if (guard.joinDate && guard.joinDate > today) return "Join date cannot be in future";
    if (isLicenseExpired(guard.licenseNumber)) return "Expired license cannot be assigned";

    const duplicateCnic = guards.find(
      (g) => g.cnic === guard.cnic && String(getId(g)) !== String(getId(guard))
    );
    if (duplicateCnic) return "CNIC already exists";

    const duplicateEmail = guards.find(
      (g) => g.email?.toLowerCase() === guard.email?.toLowerCase() && String(getId(g)) !== String(getId(guard))
    );
    if (duplicateEmail) return "Email already exists";

    const duplicatePhone = guards.find(
      (g) => g.phone === guard.phone && String(getId(g)) !== String(getId(guard))
    );
    if (duplicatePhone) return "Phone number already exists";

    return null;
  };

  const filteredGuards = useMemo(() => {
    const value = search.toLowerCase();

    return guards.filter(
      (guard) =>
        guard.name?.toLowerCase().includes(value) ||
        guard.fatherName?.toLowerCase().includes(value) ||
        guard.email?.toLowerCase().includes(value) ||
        guard.phone?.includes(search) ||
        guard.cnic?.includes(search) ||
        guard.address?.toLowerCase().includes(value) ||
        guard.licenseNumber?.toLowerCase().includes(value) ||
        guard.weaponType?.toLowerCase().includes(value) ||
        guard.dutyLocation?.toLowerCase().includes(value)
    );
  }, [guards, search]);

  const handleAddGuard = async () => {
    const error = validateGuard(newGuard);
    if (error) return showMsg(error);

    try {
      const guard = await createGuard({
        ...newGuard,
        joinDate: newGuard.joinDate || today,
      });

      setGuards([guard, ...guards]);
      setNewGuard(emptyGuard);
      setShowAddModal(false);
      showMsg("Guard added successfully ✅");
      window.dispatchEvent(new Event("guards-updated"));
    } catch (error) {
      console.error(error);
      showMsg(error?.response?.data?.message || "Failed to add guard");
    }
  };

  const handleUpdateGuard = async () => {
    const error = validateGuard(editGuard, true);
    if (error) return showMsg(error);

    try {
      const id = getId(editGuard);
      const payload = { ...editGuard };
      if (!payload.password) delete payload.password;

      const updated = await updateGuard(id, payload);

      setGuards(
        guards.map((guard) =>
          String(getId(guard)) === String(id) ? updated : guard
        )
      );

      setEditGuard(null);
      showMsg("Guard updated successfully ✅");
      window.dispatchEvent(new Event("guards-updated"));
    } catch (error) {
      console.error(error);
      showMsg(error?.response?.data?.message || "Failed to update guard");
    }
  };

  const handleDeleteGuard = async (id) => {
    if (!confirm("Are you sure you want to delete this guard?")) return;

    try {
      await deleteGuard(id);
      setGuards(guards.filter((guard) => String(getId(guard)) !== String(id)));
      showMsg("Guard deleted successfully");
      window.dispatchEvent(new Event("guards-updated"));
    } catch (error) {
      console.error(error);
      showMsg(error?.response?.data?.message || "Failed to delete guard");
    }
  };

  const downloadGuardsList = () => {
    const companyName = "TIGHT SECURITY SERVICE (PVT) LTD";
    const generatedDate = new Date().toLocaleDateString();

    let html = `
      <html>
      <head>
        <title>Guards List</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
          .company-title { text-align: center; font-size: 24px; font-weight: 800; margin-bottom: 4px; text-transform: uppercase; }
          .subtitle { text-align: center; font-size: 16px; font-weight: 700; margin-bottom: 18px; }
          .meta { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 12px; font-weight: 600; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #111827; padding: 8px; font-size: 12px; text-align: left; vertical-align: top; }
          th { font-weight: 800; background: #f3f4f6; }
          .footer { margin-top: 16px; font-size: 13px; font-weight: 700; }
          @media print { body { padding: 12px; } }
        </style>
      </head>
      <body>
        <div class="company-title">${companyName}</div>
        <div class="subtitle">GUARDS LIST</div>
        <div class="meta">
          <span>Total Guards: ${guards.length}</span>
          <span>Generated Date: ${generatedDate}</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Sr.No#</th>
              <th>Guard Name</th>
              <th>Guard Father Name</th>
              <th>ID Card Number (CNIC)</th>
              <th>Guard Address</th>
              <th>Duty Point</th>
              <th>Guard Mobile Number</th>
            </tr>
          </thead>
          <tbody>
    `;

    guards.forEach((guard, index) => {
      html += `
        <tr>
          <td>${index + 1}</td>
          <td>${guard.name || ""}</td>
          <td>${guard.fatherName || ""}</td>
          <td>${guard.cnic || ""}</td>
          <td>${guard.address || ""}</td>
          <td>${guard.dutyLocation || ""}</td>
          <td>${guard.phone || ""}</td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
        <div class="footer">
          This report is issued by ${companyName} for official record and verification purposes.
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to download/print the guards list.");
      return;
    }

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Guards Management</h1>
          <p className="text-gray-500 mt-1">
            Manage guards, license number and weapon type are fetched from Licenses page.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={loadData}
            className="bg-white border border-gray-200 text-gray-700 px-5 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-sm"
          >
            <RefreshCcw size={20} />
            Refresh
          </button>

          <button
            onClick={downloadGuardsList}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg"
          >
            <Download size={20} />
            Download Guards List
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-5 py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg"
          >
            <Plus size={20} />
            Add Guard
          </button>
        </div>
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
            placeholder="Search by name, father name, phone, email, CNIC, address, license no, weapon type or duty point..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#F4F7FE] border border-gray-200 rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto max-h-[620px] overflow-y-auto">
          <table className="w-full min-w-[1600px]">
            <thead className="bg-gradient-to-r from-[#071739] to-[#0A1F4D] text-white sticky top-0 z-10">
              <tr>
                <th className="p-4 text-left whitespace-nowrap">Guard Name</th>
                <th className="p-4 text-left whitespace-nowrap">Father Name</th>
                <th className="p-4 text-left whitespace-nowrap">CNIC</th>
                <th className="p-4 text-left whitespace-nowrap">Phone</th>
                <th className="p-4 text-left whitespace-nowrap">Email</th>
                <th className="p-4 text-left whitespace-nowrap">Password</th>
                <th className="p-4 text-left whitespace-nowrap">Address</th>
                <th className="p-4 text-left whitespace-nowrap">Duty Point</th>
                <th className="p-4 text-left whitespace-nowrap">License Number</th>
                <th className="p-4 text-left whitespace-nowrap">Weapon Type</th>
                <th className="p-4 text-left whitespace-nowrap">Join Date</th>
                <th className="p-4 text-left whitespace-nowrap">Status</th>
                <th className="p-4 text-center whitespace-nowrap">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="13" className="text-center py-10 text-gray-500">
                    Loading guards...
                  </td>
                </tr>
              ) : filteredGuards.length === 0 ? (
                <tr>
                  <td colSpan="13" className="text-center py-10 text-gray-500">
                    No guards found.
                  </td>
                </tr>
              ) : (
                filteredGuards.map((guard) => (
                  <tr
                    key={getId(guard)}
                    className="border-b border-gray-100 hover:bg-blue-50/40 transition"
                  >
                    <td className="p-4 font-semibold text-gray-800 whitespace-nowrap">{guard.name || "N/A"}</td>
                    <td className="p-4 text-gray-700 whitespace-nowrap">{guard.fatherName || "N/A"}</td>
                    <td className="p-4 text-gray-700 whitespace-nowrap">{guard.cnic || "N/A"}</td>
                    <td className="p-4 text-gray-700 whitespace-nowrap">{guard.phone || "N/A"}</td>
                    <td className="p-4 text-gray-700 whitespace-nowrap">{guard.email || "N/A"}</td>
                    <td className="p-4 text-gray-700 whitespace-nowrap">••••••••</td>
                    <td className="p-4 text-gray-700 whitespace-nowrap">{guard.address || "N/A"}</td>
                    <td className="p-4 text-gray-700 whitespace-nowrap">{guard.dutyLocation || "N/A"}</td>
                    <td className="p-4 text-gray-700 whitespace-nowrap">{guard.licenseNumber || "N/A"}</td>
                    <td className="p-4 text-gray-700 whitespace-nowrap">{guard.weaponType || "N/A"}</td>
                    <td className="p-4 text-gray-700 whitespace-nowrap">{guard.joinDate || "N/A"}</td>

                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          guard.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : guard.status === "Leave"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {guard.status || "Active"}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setEditGuard({ ...guard, password: "" })}
                          className="w-10 h-10 rounded-xl bg-yellow-100 hover:bg-yellow-200 flex items-center justify-center"
                        >
                          <Pencil size={18} className="text-yellow-700" />
                        </button>

                        <button
                          onClick={() => handleDeleteGuard(getId(guard))}
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
          licenses={licenses}
          today={today}
          onClose={() => {
            setNewGuard(emptyGuard);
            setShowAddModal(false);
          }}
          onSubmit={handleAddGuard}
          submitText="Add Guard"
        />
      )}

      {editGuard && (
        <GuardFormModal
          title="Edit Guard"
          guard={editGuard}
          setGuard={setEditGuard}
          licenses={licenses}
          today={today}
          isEdit
          onClose={() => setEditGuard(null)}
          onSubmit={handleUpdateGuard}
          submitText="Save Changes"
        />
      )}
    </div>
  );
}

function GuardFormModal({
  title,
  guard,
  setGuard,
  licenses,
  today,
  isEdit = false,
  onClose,
  onSubmit,
  submitText,
}) {
  const updateField = (field, value) => {
    setGuard({ ...guard, [field]: value });
  };

  const getLicenseStatus = (expiryDate) => {
    if (!expiryDate) return "Valid";
    return expiryDate >= today ? "Valid" : "Expired";
  };

  const handleLicenseSelect = (licenseNumber) => {
    const selectedLicense = licenses.find(
      (license) => license.licenseNumber === licenseNumber
    );

    if (selectedLicense && getLicenseStatus(selectedLicense.expiryDate) === "Expired") {
      alert("This license is expired. Please select a valid license.");
      setGuard({ ...guard, licenseNumber: "", weaponType: "" });
      return;
    }

    setGuard({
      ...guard,
      licenseNumber: selectedLicense?.licenseNumber || "",
      weaponType: selectedLicense?.weaponType || "",
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-[#071739] text-white p-5 flex items-center justify-between">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
          <Input label="Guard Name" value={guard.name} onChange={(e) => updateField("name", e.target.value)} />
          <Input label="Father Name" value={guard.fatherName} onChange={(e) => updateField("fatherName", e.target.value)} />
          <Input label="CNIC" value={guard.cnic} onChange={(e) => updateField("cnic", e.target.value.replace(/\D/g, "").slice(0, 13))} />
          <Input label="Phone" value={guard.phone} onChange={(e) => updateField("phone", e.target.value.replace(/\D/g, "").slice(0, 11))} />
          <Input label="Login Email" type="email" value={guard.email} onChange={(e) => updateField("email", e.target.value)} />
          <Input label={isEdit ? "New Password Optional" : "Login Password"} value={guard.password} onChange={(e) => updateField("password", e.target.value)} />
          <Input label="Address" value={guard.address} onChange={(e) => updateField("address", e.target.value)} />
          <Input label="Duty Point" value={guard.dutyLocation} onChange={(e) => updateField("dutyLocation", e.target.value)} />
          <Input label="Shift" value={guard.shift} placeholder="Day Shift / Night Shift" onChange={(e) => updateField("shift", e.target.value)} />
          <Input label="Duty Time" value={guard.dutyTime} placeholder="8:00 PM - 6:00 AM" onChange={(e) => updateField("dutyTime", e.target.value)} />

          <LicenseSelect value={guard.licenseNumber} licenses={licenses} today={today} onChange={handleLicenseSelect} />

          <Input label="Weapon Type" value={guard.weaponType} readOnly placeholder="Auto selected from license" />

          <Input label="Join Date" type="date" max={today} value={guard.joinDate} onChange={(e) => updateField("joinDate", e.target.value)} />

          <div>
            <label className="text-sm font-semibold text-gray-600">Status</label>
            <select
              value={guard.status || "Active"}
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

function LicenseSelect({ value, licenses, today, onChange }) {
  return (
    <div>
      <label className="text-sm font-semibold text-gray-600">License Number</label>

      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full bg-[#F4F7FE] border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:border-blue-500"
      >
        <option value="">Select License Number</option>

        {licenses.length === 0 ? (
          <option value="" disabled>No licenses found</option>
        ) : (
          licenses.map((license) => {
            const expired = license.expiryDate && license.expiryDate < today;

            return (
              <option
                key={license._id || license.id}
                value={license.licenseNumber}
                disabled={expired}
              >
                {license.licenseNumber} - {license.weaponType}
                {expired ? " (Expired)" : ""}
              </option>
            );
          })
        )}
      </select>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  readOnly = false,
  max,
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-gray-600">{label}</label>

      <input
        type={type}
        value={value || ""}
        placeholder={placeholder || label}
        onChange={onChange}
        readOnly={readOnly}
        max={max}
        className={`mt-2 w-full border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:border-blue-500 ${
          readOnly ? "bg-gray-100 text-gray-500" : "bg-[#F4F7FE]"
        }`}
      />
    </div>
  );
}
