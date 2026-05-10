"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
    } else {
      setIsReady(true);
    }
  }, []);

  if (!isReady) return null;

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: "📊" },
    { name: "Guards", path: "/dashboard/guards", icon: "🛡️" },
    { name: "Clients", path: "/dashboard/clients", icon: "🏢" },
    { name: "Duties", path: "/dashboard/duties", icon: "📅" },
    { name: "Attendance", path: "/dashboard/attendance", icon: "🕒" },
    { name: "Payroll", path: "/dashboard/payroll", icon: "💰" },
    { name: "Licenses", path: "/dashboard/licenses", icon: "📄" },
    { name: "Weapons", path: "/dashboard/weapons", icon: "🔫" },
    { name: "Reports", path: "/dashboard/reports", icon: "📈" },
    { name: "Settings", path: "/dashboard/settings", icon: "⚙️" },
  ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">

      {/* Sidebar */}
      <div className="w-72 bg-gradient-to-b from-gray-950 to-gray-900 text-white flex flex-col shadow-2xl">

        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-3xl font-bold tracking-wide">
            Security Agency
          </h1>

          <p className="text-gray-400 text-sm mt-1">
            Admin Panel
          </p>
        </div>

        {/* Menu */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">

          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group
              
              ${
                pathname === item.path
                  ? "bg-blue-600 shadow-lg"
                  : "hover:bg-white/10 hover:translate-x-2"
              }`}
            >
              <span className="text-xl group-hover:scale-110 transition">
                {item.icon}
              </span>

              <span className="font-medium tracking-wide">
                {item.name}
              </span>
            </Link>
          ))}
        </div>

        {/* Bottom */}
        <div className="p-4 border-t border-gray-800">

          <button
            onClick={() => {
              localStorage.removeItem("token");
              router.replace("/login");
            }}
            className="w-full bg-red-500 hover:bg-red-600 transition-all duration-300 py-3 rounded-xl font-semibold shadow-lg hover:scale-105"
          >
            Logout
          </button>

        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">

        {/* Top Navbar */}
        <div className="bg-white shadow-md px-8 py-5 flex justify-between items-center sticky top-0 z-50">

          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Security Agency System
            </h1>

            <p className="text-gray-500 text-sm">
              Professional Management Dashboard
            </p>
          </div>

          <div className="flex items-center gap-4">

            <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">
              A
            </div>

          </div>
        </div>

        {/* Page Content */}
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
