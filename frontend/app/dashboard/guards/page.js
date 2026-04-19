"use client";

import API from "../../../services/api";
import { useEffect, useState } from "react";

export default function GuardsPage() {
  // ================= STATES =================
  const [search, setSearch] = useState("");
  const [guards, setGuards] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [message, setMessage] = useState("");

  const [newGuard, setNewGuard] = useState({
    name: "",
    phone: "",
    status: "Active",
  });

  const [editGuard, setEditGuard] = useState(null);

  // ================= FETCH =================
  useEffect(() => {
    fetchGuards();
  }, []);

  const fetchGuards = async () => {
    setLoading(true);
    try {
      // const res = await API.get("/guards");
      // setGuards(res.data.data);

      setTimeout(() => {
        setGuards([
          { id: 1, name: "Ali Khan", phone: "03001234567", status: "Active" },
          { id: 2, name: "Ahmed Raza", phone: "03111234567", status: "Inactive" },
        ]);
        setLoading(false);
      }, 600);

    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  // ================= ADD =================
  const handleAddGuard = async () => {
    if (!newGuard.name || !newGuard.phone) {
      setMessage("⚠ Please fill all fields");
      return;
    }

    setActionLoading(true);

    try {
      // await API.post("/guards", newGuard);

      setGuards([
        ...guards,
        { id: guards.length + 1, ...newGuard },
      ]);

      setShowModal(false);
      setMessage("✅ Guard added successfully");

      setNewGuard({ name: "", phone: "", status: "Active" });

    } catch (error) {
      setMessage("❌ Error adding guard");
    }

    setActionLoading(false);
  };

  // ================= DELETE =================
  const handleDeleteGuard = async (id) => {
    setActionLoading(true);

    try {
      // await API.delete(`/guards/${id}`);

      setGuards(guards.filter((g) => g.id !== id));
      setMessage("🗑 Guard deleted");

    } catch (error) {
      setMessage("❌ Delete failed");
    }

    setActionLoading(false);
  };

  // ================= EDIT =================
  const handleEditGuard = async () => {
    if (!editGuard.name || !editGuard.phone) {
      setMessage("⚠ Fill all fields");
      return;
    }

    setActionLoading(true);

    try {
      // await API.put(`/guards/${editGuard.id}`, editGuard);

      setGuards(
        guards.map((g) =>
          g.id === editGuard.id ? editGuard : g
        )
      );

      setShowEditModal(false);
      setMessage("✏ Guard updated");

    } catch (error) {
      setMessage("❌ Update failed");
    }

    setActionLoading(false);
  };

  // ================= FILTER =================
  const filteredGuards = guards.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  // ================= UI =================
  return (
    <div className="p-4">

      {/* MESSAGE */}
      {message && (
        <div className="mb-3 p-2 bg-gray-100 border rounded text-sm">
          {message}
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Guards</h2>

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          + Add Guard
        </button>
      </div>

      {/* SEARCH */}
      <input
        className="border p-2 mb-4 w-full"
        placeholder="Search guards..."
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* LOADING */}
      {loading ? (
        <p className="text-gray-500">Loading guards...</p>
      ) : (

        <table className="w-full bg-white shadow rounded">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">ID</th>
              <th className="p-2">Name</th>
              <th className="p-2">Phone</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredGuards.map((g) => (
              <tr key={g.id} className="text-center border-t">
                <td className="p-2">{g.id}</td>
                <td className="p-2">{g.name}</td>
                <td className="p-2">{g.phone}</td>

                <td className="p-2">
                  <span className={`px-2 py-1 rounded text-white ${
                    g.status === "Active"
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}>
                    {g.status}
                  </span>
                </td>

                <td className="p-2 flex justify-center gap-2">
                  <button
                    onClick={() => {
                      setEditGuard(g);
                      setShowEditModal(true);
                    }}
                    className="bg-yellow-500 text-white px-2 py-1 rounded"
                  >
                    Edit
                  </button>

                  <button
                    disabled={actionLoading}
                    onClick={() => handleDeleteGuard(g.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ================= ADD MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded w-96">

            <h2 className="text-xl font-bold mb-4">Add Guard</h2>

            <input
              className="border p-2 w-full mb-3"
              placeholder="Name"
              value={newGuard.name}
              onChange={(e) =>
                setNewGuard({ ...newGuard, name: e.target.value })
              }
            />

            <input
              className="border p-2 w-full mb-3"
              placeholder="Phone"
              value={newGuard.phone}
              onChange={(e) =>
                setNewGuard({ ...newGuard, phone: e.target.value })
              }
            />

            <select
              className="border p-2 w-full mb-3"
              value={newGuard.status}
              onChange={(e) =>
                setNewGuard({ ...newGuard, status: e.target.value })
              }
            >
              <option>Active</option>
              <option>Inactive</option>
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-400 text-white px-3 py-1 rounded"
              >
                Cancel
              </button>

              <button
                disabled={actionLoading}
                onClick={handleAddGuard}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                {actionLoading ? "Saving..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= EDIT MODAL ================= */}
      {showEditModal && editGuard && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded w-96">

            <h2 className="text-xl font-bold mb-4">Edit Guard</h2>

            <input
              className="border p-2 w-full mb-3"
              value={editGuard.name}
              onChange={(e) =>
                setEditGuard({ ...editGuard, name: e.target.value })
              }
            />

            <input
              className="border p-2 w-full mb-3"
              value={editGuard.phone}
              onChange={(e) =>
                setEditGuard({ ...editGuard, phone: e.target.value })
              }
            />

            <select
              className="border p-2 w-full mb-3"
              value={editGuard.status}
              onChange={(e) =>
                setEditGuard({ ...editGuard, status: e.target.value })
              }
            >
              <option>Active</option>
              <option>Inactive</option>
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowEditModal(false)}
                className="bg-gray-400 text-white px-3 py-1 rounded"
              >
                Cancel
              </button>

              <button
                disabled={actionLoading}
                onClick={handleEditGuard}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                {actionLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
