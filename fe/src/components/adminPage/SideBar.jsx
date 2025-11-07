import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mainMenuItems, userMenuItems } from "../../data/menuItems";
import DashboardIcon from "../icons/DashboardIcon";
import ChartsIcon from "../icons/ChartsIcon";
import AlarmsIcon from "../icons/AlarmsIcon";
import MapIcon from "../icons/MapIcon";
import ProbesIcon from "../icons/ProbesIcon";
import ProfileIcon from "../icons/ProfileIcon";
import SettingsIcon from "../icons/SettingsIcon";
import LogoutIcon from "../icons/LogoutIcon";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/auth/authSlice";

const SideBar = ({ onMenuSelect, activeComponent }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleMenuClick = (item) => {
    if (item.name.toLowerCase() === "log out") {
      setShowLogoutConfirm(true);
    } else {
      if (onMenuSelect) onMenuSelect(item.name);
    }
  };

  const confirmLogout = () => {
    dispatch(logout());
    navigate("/signin");
    setShowLogoutConfirm(false);
  };

  const cancelLogout = () => setShowLogoutConfirm(false);

  const renderIcon = (name, cls) => {
    switch (name) {
      case "DASHBOARD":
        return <DashboardIcon className={cls} />;
      case "CHARTS":
        return <ChartsIcon className={cls} />;
      case "ALARMS":
        return <AlarmsIcon className={cls} />;
      case "MAP":
        return <MapIcon className={cls} />;
      case "PROBES":
        return <ProbesIcon className={cls} />;
      case "PROFILE":
        return <ProfileIcon className={cls} />;
      case "SETTINGS":
        return <SettingsIcon className={cls} />;
      case "LOG OUT":
        return <LogoutIcon className={cls} />;
      default:
        return null;
    }
  };

  const renderMenu = (menuItems) =>
    menuItems.map((item, index) => {
      const isActive = activeComponent === item.name;
      const itemClass = isActive
        ? "text-green-600 bg-gray-950"
        : "text-[#AAAAAA]";
      const iconClass = `h-8 mr-2 ${itemClass}`;

      return (
        <li
          key={index}
          onClick={() => handleMenuClick(item)}
          className={`flex items-center cursor-pointer transition-colors duration-200 hover:text-green-600 ${itemClass} px-4 py-3`}
        >
          {renderIcon(item.name, iconClass)}
          <span className={`${itemClass} font-medium`}>{item.name}</span>
        </li>
      );
    });

  return (
    <>
      {/* ===== Sidebar ===== */}
      <aside className="w-54 h-screen bg-[#1E1E1E] py-4 flex flex-col fixed left-0 top-0">
        <h1 className="text-white text-2xl mb-6 font-semibold px-4">
          GP-CLOUD
        </h1>

        <ul>{renderMenu(mainMenuItems)}</ul>

        <ul className="mt-auto border-t border-[#A0A0A0] pt-5">
          {renderMenu(userMenuItems)}
        </ul>
      </aside>

      {/* ===== Modal xác nhận đăng xuất ===== */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 flex items-center justify-center 
                     bg-black/30 backdrop-blur-sm z-[9999]"
        >
          <div className="bg-[#1E1E1E]/95 text-white rounded-lg shadow-xl p-6 w-80 border border-gray-700">
            <h2 className="text-lg font-semibold mb-4">Xác nhận đăng xuất</h2>
            <p className="text-sm text-gray-300 mb-6">
              Bạn có chắc chắn muốn đăng xuất không?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
              >
                Hủy
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg transition"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SideBar;
