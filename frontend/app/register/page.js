"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import API from "../../services/api";

export default function Register() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const validateForm = () => {
    if (!form.name.trim()) return "Name is required";
    if (form.name.trim().length < 3) return "Name must be at least 3 characters";

    if (!form.email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      return "Enter a valid email address";
    }

    if (!form.password) return "Password is required";
    if (form.password.length < 6) return "Password must be at least 6 characters";

    return null;
  };

  const handleRegister = async () => {
    const error = validateForm();

    if (error) {
      alert(error);
      return;
    }

    try {
      setLoading(true);

      await API.post("/auth/register", {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: "admin",
      });

      alert("Admin registered successfully ✅");
      router.push("/login");
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Registration failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen justify-center items-center bg-gray-100 px-4">
      <div className="bg-white p-6 rounded-2xl shadow w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Register Admin
        </h2>

        <input
          type="text"
          placeholder="Name"
          value={form.name}
          className="border p-3 w-full mb-3 rounded-xl outline-none focus:border-green-600"
          onChange={(e) => updateField("name", e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          value={form.email}
          className="border p-3 w-full mb-3 rounded-xl outline-none focus:border-green-600"
          onChange={(e) => updateField("email", e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          className="border p-3 w-full mb-4 rounded-xl outline-none focus:border-green-600"
          onChange={(e) => updateField("password", e.target.value)}
        />

        <button
          onClick={handleRegister}
          disabled={loading}
          className={`text-white w-full p-3 rounded-xl font-semibold ${
            loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </div>
    </div>
  );
}
