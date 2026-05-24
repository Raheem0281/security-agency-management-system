"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  ClipboardList,
  CalendarCheck,
  Wallet,
  BadgeCheck,
  FileText,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  ChevronRight,
} from "lucide-react";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [search, setSearch] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
    } else {
      setIsReady(true);
    }
  }, [router]);

  useEffect(() => {
    const loadSettings = () => {
      const saved = localStorage.getItem("systemSettings");

      if (saved) {
        const parsed = JSON.parse(saved);
        setDarkMode(Boolean(parsed.darkMode));
      } else {
        setDarkMode(false);
      }
    };

    loadSettings();

    window.addEventListener("settings-updated", loadSettings);

    return () => {
      window.removeEventListener("settings-updated", loadSettings);
    };
  }, []);

  useEffect(() => {
    const loadNotifications = () => {
      const saved =
        JSON.parse(localStorage.getItem("adminNotifications")) || [];

      setNotificationCount(saved.length);
    };

    loadNotifications();

    window.addEventListener("storage", loadNotifications);
    window.addEventListener("notifications-updated", loadNotifications);

    return () => {
      window.removeEventListener("storage", loadNotifications);
      window.removeEventListener("notifications-updated", loadNotifications);
    };
  }, []);

  if (!isReady) return null;

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Guards", href: "/dashboard/guards", icon: ShieldCheck },
    { name: "Clients", href: "/dashboard/clients", icon: Users },
    { name: "Duties", href: "/dashboard/duties", icon: ClipboardList },
    { name: "Attendance", href: "/dashboard/attendance", icon: CalendarCheck },
    { name: "Payroll", href: "/dashboard/payroll", icon: Wallet },
    { name: "Licenses", href: "/dashboard/licenses", icon: BadgeCheck },
    { name: "Reports", href: "/dashboard/reports", icon: FileText },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const handleSearch = (e) => {
    if (e.key !== "Enter") return;

    const value = search.toLowerCase().trim();

    if (!value) return;

    if (value.includes("guard")) router.push("/dashboard/guards");
    else if (value.includes("client")) router.push("/dashboard/clients");
    else if (value.includes("license") || value.includes("licence"))
      router.push("/dashboard/licenses");
    else if (value.includes("report")) router.push("/dashboard/reports");
    else if (value.includes("duty") || value.includes("duties"))
      router.push("/dashboard/duties");
    else if (value.includes("attendance"))
      router.push("/dashboard/attendance");
    else if (value.includes("payroll")) router.push("/dashboard/payroll");
    else if (value.includes("setting")) router.push("/dashboard/settings");
    else alert("No result found");
  };

  return (
    <div
      className={`flex h-screen overflow-hidden ${
        darkMode
          ? "dark bg-gray-900 text-white"
          : "bg-[#F4F7FE] text-gray-800"
      }`}
    >
      {/* SIDEBAR */}
      <aside
        className={`h-screen bg-[#0B1120] text-white transition-all duration-300 border-r border-white/10 flex flex-col ${
          sidebarOpen ? "w-[280px]" : "w-[95px]"
        }`}
      >
        {/* LOGO */}
        <div className="h-[90px] min-h-[90px] border-b border-white/10 flex items-center px-5">
          <div className="flex items-center gap-3 w-full">
            <div className="bg-white rounded-2xl shadow-lg border border-white/20 flex items-center justify-center w-[90px] h-[70px] overflow-hidden">
              <Image
                src="/logo.svg"
                alt="Logo"
                width={130}
                height={130}
                priority
                className="object-contain scale-[1.4]"
              />
            </div>

            {sidebarOpen && (
              <div>
                <h2 className="text-[18px] font-bold tracking-wide">
                  Tight Security Service
                </h2>

                <p className="text-xs text-gray-400">
                  We provide more security
                </p>
              </div>
            )}
          </div>
        </div>

        {/* MENU */}
        <nav className="flex-1 overflow-y-auto px-4 py-5 sidebar-scroll">
          <ul className="space-y-3 pb-6">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`group flex items-center justify-between rounded-2xl px-4 py-3 transition-all duration-300 ${
                      active
                        ? "bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg"
                        : "hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        size={22}
                        className="text-gray-300 group-hover:scale-110 transition"
                      />

                      {sidebarOpen && (
                        <span className="font-medium text-[15px]">
                          {item.name}
                        </span>
                      )}
                    </div>

                    {sidebarOpen && active && <ChevronRight size={18} />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* LOGOUT */}
        <div className="p-4 border-t border-white/10 min-h-[80px]">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              router.replace("/login");
            }}
            className="w-full bg-red-500 hover:bg-red-600 transition-all duration-300 rounded-2xl py-3 flex items-center justify-center gap-2 font-medium"
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TOPBAR */}
        <header
          className={`h-[90px] min-h-[90px] border-b px-6 flex items-center justify-between ${
            darkMode
              ? "bg-gray-800 border-gray-700 text-white"
              : "bg-white border-gray-200 text-gray-800"
          }`}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                darkMode
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "bg-[#EEF2FF] hover:bg-blue-100"
              }`}
            >
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <div>
              <h1 className="text-2xl font-bold">
                TIGHT SECURITY SERVICES (PVT)
              </h1>

              <p
                className={
                  darkMode
                    ? "text-sm text-gray-300"
                    : "text-sm text-gray-500"
                }
              >
                Government Of The Home Department
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* SEARCH */}
            <div className="relative hidden md:block">
              <Search
                size={18}
                className="absolute left-4 top-3 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search guards, clients, licenses..."
                value={search}
                onKeyDown={handleSearch}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-[340px] border rounded-2xl pl-11 pr-4 py-3 outline-none focus:border-blue-500 ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-[#F4F7FE] border-gray-200 text-gray-800"
                }`}
              />
            </div>

            {/* NOTIFICATIONS */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-[#F4F7FE] hover:bg-blue-100"
                }`}
              >
                <Bell size={22} />

                {notificationCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <NotificationDropdown darkMode={darkMode} />
              )}
            </div>

            {/* ADMIN */}
            <div
              className={`flex items-center gap-3 px-3 py-2 rounded-2xl ${
                darkMode ? "bg-gray-700" : "bg-[#F4F7FE]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-r from-[#071739] to-[#0A1F4D] flex items-center justify-center shadow-lg">
                  <img
                    src="/logo.svg"
                    alt="Logo"
                    className="w-7 h-7 object-contain brightness-0 invert"
                  />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE */}
        <main
          className={`flex-1 overflow-y-auto p-6 transition-all duration-300 ${
            darkMode
              ? "bg-gray-900 text-white"
              : "bg-[#F4F7FE] text-gray-800"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

function NotificationDropdown({ darkMode }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const loadNotifications = () => {
      const saved =
        JSON.parse(localStorage.getItem("adminNotifications")) || [];

      setNotifications(saved);
    };

    loadNotifications();

    window.addEventListener("storage", loadNotifications);
    window.addEventListener("notifications-updated", loadNotifications);

    return () => {
      window.removeEventListener("storage", loadNotifications);
      window.removeEventListener("notifications-updated", loadNotifications);
    };
  }, []);

  const clearNotifications = () => {
    localStorage.setItem("adminNotifications", JSON.stringify([]));
    setNotifications([]);
    window.dispatchEvent(new Event("notifications-updated"));
  };

  return (
    <div
      className={`absolute right-0 mt-3 w-80 rounded-2xl shadow-2xl border z-50 p-4 ${
        darkMode
          ? "bg-gray-800 border-gray-700 text-white"
          : "bg-white border-gray-100 text-gray-800"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg">Notifications</h3>

        {notifications.length > 0 && (
          <button
            onClick={clearNotifications}
            className="text-xs text-red-500 font-semibold"
          >
            Clear
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div
          className={`rounded-2xl p-4 text-center text-sm ${
            darkMode
              ? "bg-gray-700 text-gray-300"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          No notifications yet.
        </div>
      ) : (
        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 sidebar-scroll">
          {notifications.slice(0, 8).map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition ${
                darkMode
                  ? "bg-gray-700 border-gray-600"
                  : "bg-[#F4F7FE] border-gray-100"
              }`}
            >
              <h4 className="font-semibold text-sm">{item.title}</h4>

              <p
                className={`text-sm mt-1 ${
                  darkMode ? "text-gray-300" : "text-gray-500"
                }`}
              >
                {item.message}
              </p>

              <div
                className={`flex items-center justify-between mt-3 text-xs ${
                  darkMode ? "text-gray-400" : "text-gray-400"
                }`}
              >
                <span>{item.date}</span>
                <span>{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
