"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GuardLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleGuardLogin = () => {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    const savedGuards = localStorage.getItem("guards");
    const guards = savedGuards ? JSON.parse(savedGuards) : [];

    const matchedGuard = guards.find(
      (guard) =>
        guard.email === email &&
        guard.password === password &&
        guard.status === "Active"
    );

    if (!matchedGuard) {
      alert("Invalid guard email/password or guard is inactive");
      return;
    }

    localStorage.setItem("token", "guard-token");

    localStorage.setItem(
      "user",
      JSON.stringify({
        role: "guard",
        ...matchedGuard,
      })
    );

    router.push("/user-dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F7FE]">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Guard Login
        </h1>

        <p className="text-center text-gray-500 mt-2 mb-8">
          Login with credentials provided by admin
        </p>

        <input
          type="email"
          placeholder="Guard Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-200 rounded-2xl px-4 py-3 mb-4 outline-none focus:border-blue-500"
        />

        <input
          type="password"
          placeholder="Guard Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-200 rounded-2xl px-4 py-3 mb-6 outline-none focus:border-blue-500"
        />

        <button
          onClick={handleGuardLogin}
          className="w-full bg-[#071739] hover:bg-[#0A1F4D] text-white py-3 rounded-2xl font-bold transition"
        >
          Login
        </button>
      </div>
    </div>
  );
}
