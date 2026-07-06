"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin } from "../../services/dataService";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter email & password");
      return;
    }

    try {
      setLoading(true);
      const { token } = await loginAdmin(email, password);
      localStorage.setItem("token", token);
      router.push("/dashboard");
    } catch (error) {
      alert(
        error.response?.data?.message || "Login failed. Check email & password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-900 via-black to-gray-900">

      <div className="bg-white/10 backdrop-blur-lg p-10 rounded-2xl shadow-2xl w-[400px] border border-white/20 animate-pulse">

        <h1 className="text-4xl font-bold text-center text-white mb-2">
          Security Agency
        </h1>

        <p className="text-center text-gray-300 mb-8">
          Admin Login Panel
        </p>

        <input
          type="email"
          placeholder="Enter Email"
          className="w-full p-3 rounded-lg mb-4 bg-white/20 text-white outline-none border border-gray-500"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Enter Password"
          className="w-full p-3 rounded-lg mb-6 bg-white/20 text-white outline-none border border-gray-500"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-300 text-white py-3 rounded-lg font-bold disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}
