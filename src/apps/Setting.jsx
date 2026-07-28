import React, { useState } from "react";
import profile from "../assets/profile-photo.jpeg";
import {
  FiChevronRight,
  FiSearch,
  FiMic,
} from "react-icons/fi";

import {
  FaWifi,
  FaBluetoothB,
  FaBatteryThreeQuarters,
} from "react-icons/fa";

import {
  MdAirplanemodeActive,
  MdSignalCellularAlt,
  MdLink,
} from "react-icons/md";

// Toggle component with macOS pointer cursor and hover effects
const Toggle = ({ enabled, onToggle }) => (
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      if (typeof onToggle === "function") {
        onToggle();
      }
    }}
    className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 flex items-center cursor-pointer ${
      enabled ? "bg-green-500 hover:bg-green-600" : "bg-zinc-600 hover:bg-zinc-500"
    }`}
  >
    <div
      className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
        enabled ? "translate-x-5" : "translate-x-0"
      }`}
    />
  </button>
);

export default function Settings({ 
  isWifiActive: externalWifi, 
  setIsWifiActive: setExternalWifi, 
  isBluetooth: externalBt, 
  setIsBluetooth: setExternalBt 
}) {
  // Local fallback states if props aren't provided by parent
  const [localWifi, setLocalWifi] = useState(true);
  const [localBt, setLocalBt] = useState(true);
  const [airplaneMode, setAirplaneMode] = useState(false);

  // Use prop if provided, otherwise fall back to local state
  const wifiActive = externalWifi !== undefined ? externalWifi : localWifi;
  const toggleWifi = () => {
    if (setExternalWifi) {
      setExternalWifi((prev) => !prev);
    } else {
      setLocalWifi((prev) => !prev);
    }
  };

  const bluetoothActive = externalBt !== undefined ? externalBt : localBt;
  const toggleBluetooth = () => {
    if (setExternalBt) {
      setExternalBt((prev) => !prev);
    } else {
      setLocalBt((prev) => !prev);
    }
  };

  const settings = [
    {
      icon: <MdAirplanemodeActive size={22} />,
      bg: "bg-orange-500",
      title: "Airplane Mode",
      right: (
        <Toggle
          enabled={airplaneMode}
          onToggle={() => setAirplaneMode((prev) => !prev)}
        />
      ),
    },
    {
      icon: <FaWifi size={18} />,
      bg: "bg-blue-500",
      title: "Wi-Fi",
      right: (
        <Toggle
          enabled={wifiActive}
          onToggle={toggleWifi}
        />
      ),
    },
    {
      icon: <FaBluetoothB size={18} />,
      bg: "bg-blue-500",
      title: "Bluetooth",
      right: (
        <Toggle
          enabled={bluetoothActive}
          onToggle={toggleBluetooth}
        />
      ),
    },
    {
      icon: <MdSignalCellularAlt size={18} />,
      bg: "bg-green-500",
      title: "Mobile Service",
    },
    {
      icon: <MdLink size={18} />,
      bg: "bg-green-500",
      title: "Personal Hotspot",
    },
    {
      icon: <FaBatteryThreeQuarters size={18} />,
      bg: "bg-green-500",
      title: "Battery",
    },
    {
      icon: "🔔",
      bg: "bg-red-500",
      title: "Notifications",
    },
    {
      icon: "🔊",
      bg: "bg-pink-500",
      title: "Sounds & Haptics",
    },
    {
      icon: "🌙",
      bg: "bg-indigo-500",
      title: "Focus",
    },
    {
      icon: "⏱",
      bg: "bg-purple-500",
      title: "Screen Time",
    },
    {
      icon: "⚙️",
      bg: "bg-gray-500",
      title: "General",
    },
    {
      icon: "🎮",
      bg: "bg-gray-700",
      title: "Game Center",
    },
    {
      icon: "💡",
      bg: "bg-yellow-500",
      title: "Display & Brightness",
    },
    {
      icon: "🔒",
      bg: "bg-blue-500",
      title: "Privacy & Security",
    },
    {
      icon: "💳",
      bg: "bg-black",
      title: "Wallet & Apple Pay",
    },
    {
      icon: "📦",
      bg: "bg-gray-600",
      title: "Apps",
    },
    {
      icon: "❤️",
      bg: "bg-red-500",
      title: "Health",
    },
    {
      icon: "📷",
      bg: "bg-gray-500",
      title: "Camera",
    },
    {
      icon: "🎵",
      bg: "bg-pink-600",
      title: "Music",
    },
    {
      icon: "📺",
      bg: "bg-black",
      title: "TV",
    },
    {
      icon: "📞",
      bg: "bg-green-500",
      title: "Phone",
    },
    {
      icon: "💬",
      bg: "bg-green-600",
      title: "Messages",
    },
    {
      icon: "✉️",
      bg: "bg-blue-500",
      title: "Mail",
    },
  ];

  return (
    <div className="bg-black h-screen overflow-y-auto text-white flex justify-center select-none">
      <div className="w-full max-w-md px-4 pt-20 sm:pt-6 pb-6">
        {/* Heading */}
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        {/* Apple ID Card */}
        <div className="bg-[#1C1C1E] hover:bg-[#2C2C2E] transition-colors rounded-3xl p-5 mb-5 cursor-pointer">
          <div className="flex items-center">
            <img
              src={profile}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover"
            />
            <div className="ml-4 flex-1">
              <h2 className="text-2xl font-semibold">Bikash Dalapati</h2>
              <p className="text-gray-400 text-sm">
                Apple Account, iCloud and more
              </p>
            </div>
            <FiChevronRight className="text-gray-500" size={22} />
          </div>

          <div className="border-t border-gray-700 my-4"></div>

          <div className="flex justify-between items-center">
            <span className="text-base">iCloud Storage Almost Full</span>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-red-500 flex justify-center items-center text-xs font-semibold">
                1
              </div>
              <FiChevronRight className="text-gray-500" />
            </div>
          </div>
        </div>

        {/* Software Update Card */}
        <div className="bg-[#1C1C1E] hover:bg-[#2C2C2E] transition-colors rounded-2xl p-5 flex justify-between items-center mb-5 cursor-pointer">
          <span className="text-base">Software Update Available</span>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-red-500 flex justify-center items-center text-xs font-semibold">
              1
            </div>
            <FiChevronRight className="text-gray-500" />
          </div>
        </div>

        {/* Settings Items List */}
        <div className="bg-[#1C1C1E] rounded-3xl overflow-hidden">
          {settings.map((item, index) => (
            <div
              key={index}
              className={`flex items-center px-4 py-3 border-b border-gray-800 last:border-none transition-colors ${
                !item.right ? "cursor-pointer hover:bg-[#2C2C2E]" : ""
              }`}
            >
              <div
                className={`${item.bg} w-8 h-8 rounded-lg flex justify-center items-center text-white text-base shrink-0`}
              >
                {item.icon}
              </div>

              <span className="ml-4 flex-1 text-base">{item.title}</span>

              {item.right ? (
                item.right
              ) : (
                <FiChevronRight className="text-gray-500" size={18} />
              )}
            </div>
          ))}
        </div>

        {/* Bottom Space */}
        <div className="h-24"></div>
      </div>

      {/* Search Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md px-4 pb-5 pt-2 flex justify-center">
        <div className="max-w-md w-full bg-[#2C2C2E] rounded-full px-4 py-2.5 flex items-center">
          <FiSearch className="text-gray-400 cursor-pointer" />
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent outline-none flex-1 ml-3 text-white placeholder-gray-500 text-sm cursor-text"
          />
          <FiMic className="text-gray-400 cursor-pointer hover:text-white transition-colors" />
        </div>
      </div>
    </div>
  );
}