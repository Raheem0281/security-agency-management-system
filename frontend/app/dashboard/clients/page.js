"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Building2,
  Phone,
  MapPin,
  BadgeCheck,
  User,
  Mail,
  ShieldCheck,
  X,
} from "lucide-react";

const emptyClient = {
  company: "",
  owner: "",
  phone: "",
  email: "",
  address: "",
  cnic: "",
  status: "Active",
};

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState([]);
  const [message, setMessage] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const [newClient, setNewClient] = useState(emptyClient);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = () => {
    const savedClients =
      JSON.parse(localStorage.getItem("clients")) || [];

    setClients(savedClients);
  };

  const saveClients = (updatedClients) => {
    setClients(updatedClients);
    localStorage.setItem("clients", JSON.stringify(updatedClients));
    window.dispatchEvent(new Event("clients-updated"));
  };

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2500);
  };

  const filteredClients = useMemo(() => {
    const value = search.toLowerCase();

    return clients.filter(
      (client) =>
        client.company?.toLowerCase().includes(value) ||
        client.owner?.toLowerCase().includes(value) ||
        client.phone?.includes(search) ||
        client.email?.toLowerCase().includes(value) ||
        client.address?.toLowerCase().includes(value) ||
        client.cnic?.includes(search)
    );
  }, [clients, search]);

  const activeClients = clients.filter(
    (client) => client.status === "Active"
  ).length;

  const inactiveClients = clients.filter(
    (client) => client.status === "Inactive"
  ).length;

  const validateClient = (client) => {
    return (
      client.company &&
      client.owner &&
      client.phone &&
      client.address &&
      client.cnic
    );
  };

  const handleAddClient = () => {
    if (!validateClient(newClient)) {
      showMessage("Please fill Company, Owner, Phone, Address and CNIC");
      return;
    }

    const client = {
      id: Date.now(),
      ...newClient,
    };

    saveClients([client, ...clients]);
    setNewClient(emptyClient);
    setShowAddModal(false);
    showMessage("Client added successfully ✅");
  };

  const handleUpdateClient = () => {
    if (!validateClient(selectedClient)) {
      showMessage("Please fill all required fields");
      return;
    }

    const updatedClients = clients.map((client) =>
      client.id === selectedClient.id ? selectedClient : client
    );

    saveClients(updatedClients);
    setSelectedClient(null);
    showMessage("Client updated successfully ✅");
  };

  const handleDelete = (id) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this client?"
    );

    if (!confirmDelete) return;

    const updatedClients = clients.filter((client) => client.id !== id);

    saveClients(updatedClients);
    showMessage("Client deleted successfully");
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Clients Management
          </h1>

          <p className="text-gray-500 mt-1">
            Manage security clients and company records
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#071739] hover:bg-[#0A1F4D] text-white px-5 py-3 rounded-2xl flex items-center gap-2 transition-all duration-300 shadow-lg hover:scale-[1.02]"
        >
          <Plus size={20} />
          Add New Client
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
          title="Total Clients"
          value={clients.length}
          icon={Building2}
          bg="bg-blue-100"
          color="text-blue-600"
        />

        <StatCard
          title="Active Clients"
          value={activeClients}
          icon={ShieldCheck}
          bg="bg-green-100"
          color="text-green-600"
        />

        <StatCard
          title="Inactive Clients"
          value={inactiveClients}
          icon={BadgeCheck}
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
            placeholder="Search by company, owner, phone, email, CNIC or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-4 py-3 outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800">
            Client Records
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            All clients saved in system database
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-gradient-to-r from-[#071739] to-[#0A1F4D] text-white">
              <tr>
                <th className="text-left px-6 py-4">Company</th>
                <th className="text-left px-6 py-4">Owner</th>
                <th className="text-left px-6 py-4">Contact</th>
                <th className="text-left px-6 py-4">Address</th>
                <th className="text-left px-6 py-4">CNIC</th>
                <th className="text-left px-6 py-4">Status</th>
                <th className="text-center px-6 py-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredClients.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-12 text-gray-500"
                  >
                    No clients found
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    className="border-b border-gray-100 hover:bg-blue-50/40 transition"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-blue-100 flex items-center justify-center">
                          <Building2 className="text-blue-600" size={22} />
                        </div>

                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {client.company}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {client.email || "No email added"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5 text-gray-700">
                      {client.owner}
                    </td>

                    <td className="px-6 py-5 text-gray-700">
                      {client.phone}
                    </td>

                    <td className="px-6 py-5 text-gray-700">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-blue-600" />
                        {client.address}
                      </div>
                    </td>

                    <td className="px-6 py-5 text-gray-700">
                      {client.cnic}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          client.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {client.status}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => setSelectedClient(client)}
                          className="w-10 h-10 rounded-xl bg-yellow-100 hover:bg-yellow-200 flex items-center justify-center transition"
                        >
                          <Pencil size={18} className="text-yellow-700" />
                        </button>

                        <button
                          onClick={() => handleDelete(client.id)}
                          className="w-10 h-10 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center transition"
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
        <ClientModal
          title="Add New Client"
          client={newClient}
          setClient={setNewClient}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddClient}
          submitText="Save Client"
        />
      )}

      {selectedClient && (
        <ClientModal
          title="Edit Client"
          client={selectedClient}
          setClient={setSelectedClient}
          onClose={() => setSelectedClient(null)}
          onSubmit={handleUpdateClient}
          submitText="Update Client"
        />
      )}
    </div>
  );
}

function ClientModal({
  title,
  client,
  setClient,
  onClose,
  onSubmit,
  submitText,
}) {
  const updateField = (field, value) => {
    setClient({
      ...client,
      [field]: value,
    });
  };

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
          <InputField
            icon={<Building2 size={18} />}
            placeholder="Company Name"
            value={client.company}
            onChange={(e) => updateField("company", e.target.value)}
          />

          <InputField
            icon={<User size={18} />}
            placeholder="Owner Name"
            value={client.owner}
            onChange={(e) => updateField("owner", e.target.value)}
          />

          <InputField
            icon={<Phone size={18} />}
            placeholder="Phone Number"
            value={client.phone}
            onChange={(e) => updateField("phone", e.target.value)}
          />

          <InputField
            icon={<Mail size={18} />}
            placeholder="Email Address"
            value={client.email}
            onChange={(e) => updateField("email", e.target.value)}
          />

          <InputField
            icon={<MapPin size={18} />}
            placeholder="Address"
            value={client.address}
            onChange={(e) => updateField("address", e.target.value)}
          />

          <InputField
            icon={<BadgeCheck size={18} />}
            placeholder="Client CNIC"
            value={client.cnic}
            onChange={(e) => updateField("cnic", e.target.value)}
          />

          <select
            value={client.status}
            onChange={(e) => updateField("status", e.target.value)}
            className="border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:border-blue-500"
          >
            <option>Active</option>
            <option>Inactive</option>
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

function InputField({ icon, placeholder, value, onChange }) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-3.5 text-gray-400">
        {icon}
      </div>

      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full border border-gray-200 rounded-2xl pl-12 pr-4 py-3 outline-none focus:border-blue-500"
      />
    </div>
  );
}

function StatCard({ title, value, icon: Icon, bg, color }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>

          <h2 className="text-3xl font-bold text-gray-800 mt-1">
            {value}
          </h2>
        </div>

        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center ${bg}`}
        >
          <Icon className={color} size={28} />
        </div>
      </div>
    </div>
  );
}
