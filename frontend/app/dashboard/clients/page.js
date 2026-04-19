"use client";

import { useState, useEffect } from "react";
import API from "../../../services/api";

export default function ClientsPage() {

  const [search, setSearch] = useState("");
  const [clients, setClients] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [newClient, setNewClient] = useState({
    name: "",
    contact: "",
    address: "",
  });

  const [editClient, setEditClient] = useState(null);

  // 🔹 Fetch Clients
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      // 🔥 Future API
      // const res = await API.get("/clients");
      // setClients(res.data.data);

      // 🔴 Temporary
      setClients([
        { id: 1, name: "ABC Company", contact: "03001234567", address: "Lahore" },
        { id: 2, name: "XYZ Pvt Ltd", contact: "03111234567", address: "Karachi" },
      ]);

    } catch (error) {
      console.log(error);
    }
  };

  // 🔹 Add Client
  const handleAddClient = async () => {
    try {
      // 🔥 Future API
      // await API.post("/clients", newClient);
      // fetchClients();

      setClients([
        ...clients,
        {
          id: clients.length + 1,
          ...newClient,
        },
      ]);

      setShowModal(false);

      setNewClient({
        name: "",
        contact: "",
        address: "",
      });

    } catch (error) {
      console.log(error);
    }
  };

  // 🔹 Delete Client
  const handleDeleteClient = async (id) => {
    try {
      // 🔥 Future API
      // await API.delete(`/clients/${id}`);
      // fetchClients();

      setClients(clients.filter((c) => c.id !== id));

    } catch (error) {
      console.log(error);
    }
  };

  // 🔹 Edit Client
  const handleEditClient = async () => {
    try {
      // 🔥 Future API
      // await API.put(`/clients/${editClient.id}`, editClient);
      // fetchClients();

      setClients(
        clients.map((c) =>
          c.id === editClient.id ? editClient : c
        )
      );

      setShowEditModal(false);

    } catch (error) {
      console.log(error);
    }
  };

  // 🔹 Search Filter
  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>

      {/* Header */}
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Clients</h2>

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          + Add Client
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search clients..."
        className="border p-2 mb-4 w-full"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Table */}
      <table className="w-full bg-white shadow rounded">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2">ID</th>
            <th className="p-2">Name</th>
            <th className="p-2">Contact</th>
            <th className="p-2">Address</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredClients.length > 0 ? (
            filteredClients.map((c) => (
              <tr key={c.id} className="text-center border-t">
                <td className="p-2">{c.id}</td>
                <td className="p-2">{c.name}</td>
                <td className="p-2">{c.contact}</td>
                <td className="p-2">{c.address}</td>

                <td className="p-2 flex justify-center gap-2">
                  <button
                    onClick={() => {
                      setEditClient(c);
                      setShowEditModal(true);
                    }}
                    className="bg-yellow-500 text-white px-2 py-1 rounded"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDeleteClient(c.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="p-4 text-center text-gray-500">
                No clients found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ADD MODAL */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded w-96">

            <h2 className="text-xl font-bold mb-4">Add Client</h2>

            <input
              className="border p-2 w-full mb-3"
              placeholder="Name"
              value={newClient.name}
              onChange={(e) =>
                setNewClient({ ...newClient, name: e.target.value })
              }
            />

            <input
              className="border p-2 w-full mb-3"
              placeholder="Contact"
              value={newClient.contact}
              onChange={(e) =>
                setNewClient({ ...newClient, contact: e.target.value })
              }
            />

            <input
              className="border p-2 w-full mb-3"
              placeholder="Address"
              value={newClient.address}
              onChange={(e) =>
                setNewClient({ ...newClient, address: e.target.value })
              }
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-400 text-white px-3 py-1 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleAddClient}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && editClient && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded w-96">

            <h2 className="text-xl font-bold mb-4">Edit Client</h2>

            <input
              className="border p-2 w-full mb-3"
              value={editClient.name}
              onChange={(e) =>
                setEditClient({ ...editClient, name: e.target.value })
              }
            />

            <input
              className="border p-2 w-full mb-3"
              value={editClient.contact}
              onChange={(e) =>
                setEditClient({ ...editClient, contact: e.target.value })
              }
            />

            <input
              className="border p-2 w-full mb-3"
              value={editClient.address}
              onChange={(e) =>
                setEditClient({ ...editClient, address: e.target.value })
              }
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowEditModal(false)}
                className="bg-gray-400 text-white px-3 py-1 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleEditClient}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
