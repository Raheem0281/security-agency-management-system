"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login"); // ✅ FIX
    } else {
      setIsReady(true);
    }
  }, []);

  if (!isReady) return null; // ✅ no flicker

  return (
    <div className="flex h-screen">
      <div className="w-64 bg-gray-900 text-white p-5">
        <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>

        <ul className="space-y-3">
          <li><Link href="/dashboard">Dashboard</Link></li>
          <li><Link href="/dashboard/guards">Guards</Link></li>
          <li><Link href="/dashboard/clients">Clients</Link></li>
        </ul>
      </div>

      <div className="flex-1 bg-gray-100">
        <div className="bg-white shadow p-4 flex justify-between">
          <h1 className="font-bold">Dashboard</h1>

          <button
            onClick={() => {
              localStorage.removeItem("token");
              router.replace("/login"); // ✅ FIX
            }}
            className="bg-red-500 text-white px-3 py-1 rounded"
          >
            Logout
          </button>
        </div>

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}