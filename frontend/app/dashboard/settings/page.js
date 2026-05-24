"use client";

import { useEffect, useState } from "react";
import {
  User,
  Shield,
  Bell,
  Lock,
  Globe,
  Moon,
  Save,
  CheckCircle,
} from "lucide-react";

export default function SettingsPage() {
  const defaultSettings = {
    company: "The Smart Security",
    email: "admin@tss.com",
    phone: "+92 300 1234567",
    address: "Lahore, Pakistan",
    darkMode: false,
    notifications: true,
    twoFactor: true,
    language: "English",
  };

  const [settings, setSettings] = useState(defaultSettings);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedSettings = localStorage.getItem("systemSettings");

    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(parsed);

      document.documentElement.classList.toggle(
        "dark",
        parsed.darkMode
      );
    }
  }, []);

  const saveSettings = (updatedSettings) => {
    localStorage.setItem(
      "systemSettings",
      JSON.stringify(updatedSettings)
    );

    window.dispatchEvent(
      new Event("settings-updated")
    );
  };

  const handleToggle = (key) => {
    const updatedSettings = {
      ...settings,
      [key]: !settings[key],
    };

    setSettings(updatedSettings);

    saveSettings(updatedSettings);

    if (key === "darkMode") {
      document.documentElement.classList.toggle(
        "dark",
        updatedSettings.darkMode
      );
    }
  };

  const handleChange = (e) => {
    const updatedSettings = {
      ...settings,
      [e.target.name]: e.target.value,
    };

    setSettings(updatedSettings);
  };

  const handleSave = () => {
    saveSettings(settings);

    setMessage("Settings saved successfully ✅");

    setTimeout(() => {
      setMessage("");
    }, 2500);
  };

  return (
    <div
      className={`space-y-6 ${
        settings.darkMode
          ? "text-white"
          : "text-gray-800"
      }`}
    >
      {/* HEADER */}

      <div>
        <h1 className="text-3xl font-bold">
          System Settings
        </h1>

        <p
          className={`mt-1 ${
            settings.darkMode
              ? "text-gray-300"
              : "text-gray-500"
          }`}
        >
          Manage your security agency system
          settings
        </p>
      </div>

      {/* SUCCESS MESSAGE */}

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-2xl flex items-center gap-2">
          <CheckCircle size={20} />
          {message}
        </div>
      )}

      {/* COMPANY INFO */}

      <SectionCard
        darkMode={settings.darkMode}
        icon={
          <User
            className="text-blue-600"
            size={22}
          />
        }
        iconBg="bg-blue-100"
        title="Company Information"
        subtitle="Update company details"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <InputField
            label="Company Name"
            name="company"
            value={settings.company}
            onChange={handleChange}
            darkMode={settings.darkMode}
          />

          <InputField
            label="Email Address"
            name="email"
            value={settings.email}
            onChange={handleChange}
            darkMode={settings.darkMode}
          />

          <InputField
            label="Contact Number"
            name="phone"
            value={settings.phone}
            onChange={handleChange}
            darkMode={settings.darkMode}
          />

          <InputField
            label="Office Address"
            name="address"
            value={settings.address}
            onChange={handleChange}
            darkMode={settings.darkMode}
          />
        </div>
      </SectionCard>

      {/* SECURITY SETTINGS */}

      <SectionCard
        darkMode={settings.darkMode}
        icon={
          <Shield
            className="text-red-600"
            size={22}
          />
        }
        iconBg="bg-red-100"
        title="Security Settings"
        subtitle="Manage authentication & protection"
      >
        <div className="space-y-5">
          <ToggleRow
            darkMode={settings.darkMode}
            icon={<Lock size={22} />}
            title="Two Factor Authentication"
            subtitle="Extra security for admin login"
            enabled={settings.twoFactor}
            activeColor="bg-blue-600"
            onClick={() =>
              handleToggle("twoFactor")
            }
          />

          <ToggleRow
            darkMode={settings.darkMode}
            icon={<Bell size={22} />}
            title="Notifications"
            subtitle="Receive alerts and updates"
            enabled={settings.notifications}
            activeColor="bg-green-600"
            onClick={() =>
              handleToggle("notifications")
            }
          />

          <ToggleRow
            darkMode={settings.darkMode}
            icon={<Moon size={22} />}
            title="Dark Mode"
            subtitle="Enable dark dashboard theme"
            enabled={settings.darkMode}
            activeColor="bg-purple-600"
            onClick={() =>
              handleToggle("darkMode")
            }
          />
        </div>
      </SectionCard>

      {/* SAVE BUTTON */}

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg"
        >
          <Save size={20} />
          Save Changes
        </button>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function SectionCard({
  darkMode,
  icon,
  iconBg,
  title,
  subtitle,
  children,
}) {
  return (
    <div
      className={`rounded-3xl shadow-sm border p-6 ${
        darkMode
          ? "bg-gray-800 border-gray-700"
          : "bg-white border-gray-100"
      }`}
    >
      <div className="flex items-center gap-3 mb-6">
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center ${iconBg}`}
        >
          {icon}
        </div>

        <div>
          <h2 className="text-xl font-semibold">
            {title}
          </h2>

          <p
            className={`text-sm ${
              darkMode
                ? "text-gray-300"
                : "text-gray-500"
            }`}
          >
            {subtitle}
          </p>
        </div>
      </div>

      {children}
    </div>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  darkMode,
}) {
  return (
    <div>
      <label
        className={`text-sm font-medium ${
          darkMode
            ? "text-gray-300"
            : "text-gray-600"
        }`}
      >
        {label}
      </label>

      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        className={`mt-2 w-full border rounded-2xl px-4 py-3 outline-none focus:border-blue-500 ${
          darkMode
            ? "bg-gray-900 border-gray-700 text-white"
            : "bg-white border-gray-200 text-gray-800"
        }`}
      />
    </div>
  );
}

function ToggleRow({
  darkMode,
  icon,
  title,
  subtitle,
  enabled,
  activeColor,
  onClick,
}) {
  return (
    <div
      className={`flex items-center justify-between border rounded-2xl p-4 transition ${
        darkMode
          ? "border-gray-700 hover:bg-gray-700"
          : "border-gray-100 hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={
            darkMode
              ? "text-gray-300"
              : "text-gray-600"
          }
        >
          {icon}
        </div>

        <div>
          <h3 className="font-semibold">
            {title}
          </h3>

          <p
            className={`text-sm ${
              darkMode
                ? "text-gray-300"
                : "text-gray-500"
            }`}
          >
            {subtitle}
          </p>
        </div>
      </div>

      <button
        onClick={onClick}
        className={`w-14 h-7 rounded-full transition flex items-center px-1 ${
          enabled
            ? `${activeColor} justify-end`
            : "bg-gray-300 justify-start"
        }`}
      >
        <div className="w-5 h-5 bg-white rounded-full"></div>
      </button>
    </div>
  );
}
