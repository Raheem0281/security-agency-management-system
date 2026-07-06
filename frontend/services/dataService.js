import API from "./api";
import { normalizeDoc, normalizeDocs, stripDocMeta } from "../utils/normalize";

export async function loginAdmin(email, password) {
  const res = await API.post("/auth/login", { email, password });
  return res.data.data;
}

export async function loginGuard(email, password) {
  const res = await API.post("/auth/guard-login", {
      email,
      password,
    });

    return {
      guard: normalizeDoc(res.data.data.guard),
      role: res.data.data.role,
      token: res.data.token || res.data.data.token,
    };
  }

export async function fetchGuards() {
  const res = await API.get("/guards");
  return normalizeDocs(res.data.data);
}

export async function createGuard(data) {
    console.log(data);
    const res=await API.post("/guards",data);
    return normalizeDoc(res.data.data);
}

export async function updateGuard(id, data) {
  const res = await API.put(`/guards/${id}`, stripDocMeta(data));
  return normalizeDoc(res.data.data);
}

export async function deleteGuard(id) {
  await API.delete(`/guards/${id}`);
}

  export async function fetchClients() {
    const res = await API.get("/clients");
    const clients = normalizeDocs(res.data.data);

    return clients.map((client) => ({
      ...client,
      company: client.companyName || client.company || "",
      owner: client.ownerName || client.owner || "",
      cnic: client.cnic || "N/A",
      dutyLocation: client.dutyLocation || "",
    }));
  }

  export async function createClient(data) {
    const payload = {
      companyName: data.company,
      ownerName: data.owner,
      phone: data.phone,
      email: data.email,
      address: data.address,
      dutyLocation: data.dutyLocation || data.address,
      status: data.status || "Active",
    };

    const res = await API.post("/clients", payload);

    const client = normalizeDoc(res.data.data);

    return {
      ...client,
      company: client.companyName || "",
      owner: client.ownerName || "",
      cnic: client.cnic || "N/A",
    };
  }

  export async function updateClient(id, data) {
    const payload = {
      companyName: data.company,
      ownerName: data.owner,
      phone: data.phone,
      email: data.email,
      address: data.address,
      dutyLocation: data.dutyLocation || data.address,
      status: data.status || "Active",
    };

    const res = await API.put(`/clients/${id}`, payload);

    const client = normalizeDoc(res.data.data);

    return {
      ...client,
      company: client.companyName || "",
      owner: client.ownerName || "",
      cnic: client.cnic || "N/A",
    };
  }

  export async function deleteClient(id) {
    await API.delete(`/clients/${id}`);
  }


export async function fetchLicenses() {
  const res = await API.get("/licenses");
  return normalizeDocs(res.data.data);
}

export async function createLicense(data) {
  const res = await API.post("/licenses", stripDocMeta(data));
  return normalizeDoc(res.data.data);
}

export async function updateLicense(id, data) {
  const res = await API.put(`/licenses/${id}`, stripDocMeta(data));
  return normalizeDoc(res.data.data);
}

export async function deleteLicense(id) {
  await API.delete(`/licenses/${id}`);
}

export async function fetchDuties() {
  const res = await API.get("/duties");
  return normalizeDocs(res.data.data);
}

export async function createDuty(data) {
  const res = await API.post("/duties", stripDocMeta(data));
  return normalizeDoc(res.data.data);
}

export async function deleteDuty(id) {
  await API.delete(`/duties/${id}`);
}

export async function fetchAttendance(params = {}) {
  const res = await API.get("/attendance", { params });
  return normalizeDocs(res.data.data);
}

export async function upsertAttendance(data) {
  const res = await API.post("/attendance", data);
  return normalizeDoc(res.data.data);
}

export async function fetchPayroll(params = {}) {
  const res = await API.get("/payroll", { params });
  return normalizeDocs(res.data.data);
}

export async function createPayroll(data) {
  const res = await API.post("/payroll", stripDocMeta(data));
  return normalizeDoc(res.data.data);
}

export async function deletePayroll(id) {
  await API.delete(`/payroll/${id}`);
}

export async function fetchActivities() {
  const res = await API.get("/activities");
  return normalizeDocs(res.data.data);
}

export async function createActivity(data) {
  const res = await API.post("/activities", stripDocMeta(data));
  return normalizeDoc(res.data.data);
}

export async function fetchNotifications() {
  const res = await API.get("/notifications");
  return normalizeDocs(res.data.data);
}

export async function createNotification(data) {
  const res = await API.post("/notifications", stripDocMeta(data));
  return normalizeDoc(res.data.data);
}

export async function clearNotifications() {
  await API.delete("/notifications");
}
