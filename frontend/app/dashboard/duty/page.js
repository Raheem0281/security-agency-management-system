"use client";

import { useState, useEffect } from "react";
import API from "../../../services/api";

export default function DutyPage() {

  const [duties, setDuties] = useState([]);
  const [guards, setGuards] = useState([]);
  const [clients, setClients] = useState([]);

  const [newDuty, setNewDuty] = useState({
    guardId: "",
    clientId: "",
    shift: "Day",
    date: "",
  });

  // 🔹 Fetch Data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 🔥 Future API
      // const dutyRes = await API.get("/duties");
      // const guardRes = await API.get("/guards");
      // const clientRes = await API.get("/clients");

      // setDuties(dutyRes.data.data);
      // setGuards(guardRes.data.data);
      // setClients(clientRes.data.data);

      // 🔴 Temporary
      const guardsData = [
        { id: 1, name: "Ali Khan" },
        { id: 2, name: "Ahmed Raza" },
      ];

      const clientsData = [
        { id: 1, name: "ABC Company" },
        { id: 2, name: "XYZ Ltd" },
      ];

      setGuards(guardsData);
      setClients(clientsData);

      setDuties([
        {
          id: 1,
          guardId: 1,
          clientId: 1,
          shift: "Day",
          date: "2026-04-20",
        },
      ]);

    } catch (error) {
      console.log(error);
    }
  };

  // 🔹 Add Duty
  const handleAddDuty = async () => {
    try {
      // 🔥 Future API
      // await API.post("/duties", newDuty);
      // fetchData();

      // 🔴 Temporary
      setDuties([
        ...duties,
        {
          id: duties.length + 1,
          ...newDuty,
        },
      ]);

      setNewDuty({
        guardId: "",
        clientId: "",
        shift: "Day",
        date: "",
      });

    } catch (error) {
      console.log(error);
    }
  };

  // 🔹 Delete
  const handleDeleteDuty = async (id) => {
    try {
      // 🔥 Future API
      // await API.delete(`/duties/${id}`);
      // fetchData();

      setDuties(duties.filter((d) => d.id !== id));

    } catch (error) {
      console.log(error);
    }
  };

  // 🔹 Helpers
  const getGuardName = (id) => {
    const g = guards.find((g) => g.id == id);
    return g ? g.name : "N/A";
  };

  const getClientName = (id) => {
    const c = clients.find((c) => c.id == id);
    return c ? c.name : "N/A";
  };

  return (
    <div>

      <h2 className="text-xl font-bold mb-4">Duty Assignment</h2>

      {/* FORM */}
      <div className="bg-white p-4 rounded shadow mb-4 grid grid-cols-4 gap-4">

        <select
          className="border p-2"
          value={newDuty.guardId}
          onChange={(e) =>
            setNewDuty({ ...newDuty, guardId: e.target.value })
          }
        >
          <option value="">Select Guard</option>
          {guards.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>

        <select
          className="border p-2"
          value={newDuty.clientId}
          onChange={(e) =>
            setNewDuty({ ...newDuty, clientId: e.target.value })
          }
        >
          <option value="">Select Client</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          className="border p-2"
          value={newDuty.shift}
          onChange={(e) =>
            setNewDuty({ ...newDuty, shift: e.target.value })
          }
        >
          <option>Day</option>
          <option>Night</option>
        </select>

        <input
          type="date"
          className="border p-2"
          value={newDuty.date}
          onChange={(e) =>
            setNewDuty({ ...newDuty, date: e.target.value })
          }
        />
      </div>

      <button
        onClick={handleAddDuty}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        Assign Duty
      </button>

      {/* TABLE */}
      <table className="w-full bg-white shadow rounded">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2">ID</th>
            <th className="p-2">Guard</th>
            <th className="p-2">Client</th>
            <th className="p-2">Shift</th>
            <th className="p-2">Date</th>
            <th className="p-2">Action</th>
          </tr>
        </thead>

        <tbody>
          {duties.map((d) => (
            <tr key={d.id} className="text-center border-t">
              <td className="p-2">{d.id}</td>
              <td className="p-2">{getGuardName(d.guardId)}</td>
              <td className="p-2">{getClientName(d.clientId)}</td>
              <td className="p-2">{d.shift}</td>
              <td className="p-2">{d.date}</td>
              <td className="p-2">
                <button
                  onClick={() => handleDeleteDuty(d.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}
