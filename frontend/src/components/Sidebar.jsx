import React from "react";
import { NavLink } from "react-router-dom";
import {
  BsGrid1X2,
  BsArchive,
  BsCart2,
  BsFileText,
  BsPeople,
  BsBarChart,
  BsGear,
  BsBoxSeam,
} from "react-icons/bs";

const Sidebar = ({ openSidebarToggle, OpenSidebar }) => {
  const menuItems = [
    { name: "Dashboard", icon: <BsGrid1X2 />, path: "/dashboard" },
    { name: "Inventory", icon: <BsArchive />, path: "/inventory" },
    { name: "Sales Panel", icon: <BsCart2 />, path: "/sales" },
    { name: "Billing", icon: <BsFileText />, path: "/bills" },
    { name: "Suppliers", icon: <BsBoxSeam />, path: "/supply" },
    { name: "Reports", icon: <BsBarChart />, path: "/reports" },
    { name: "Profile", icon: <BsPeople />, path: "/profile" },
  ];

  return (
    <aside
      id="sidebar"
      className={openSidebarToggle ? "sidebar-responsive" : ""}
      style={{
        gridArea: "sidebar",
        height: "100%",
        backgroundColor: "#1e293b", // Slate 800 - Formal Dark
        color: "#e2e8f0", // Slate 200
        display: "flex",
        flexDirection: "column",
        boxShadow: "1px 0 0 rgba(0,0,0,0.1)",
      }}
    >
      <div className="p-5 border-b border-slate-700 flex justify-between items-center">
        <div className="flex items-center text-white font-semibold text-lg tracking-wide">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center mr-3 font-bold text-white">
            H5
          </div>
          ERP SYSTEM
        </div>
        <span
          className="md:hidden text-slate-400 cursor-pointer"
          onClick={OpenSidebar}
        >
          ✕
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3">
        <p className="text-xs uppercase text-slate-500 font-semibold mb-2 px-3 tracking-wider">
          Main Menu
        </p>
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded text-sm transition-colors ${
                    isActive
                      ? "bg-slate-700 text-white font-medium"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`
                }
              >
                <span className="mr-3 text-lg opacity-80">{item.icon}</span>
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 border-t border-slate-700">
        <NavLink
          to="/notifications"
          className="flex items-center text-slate-400 hover:text-white text-sm"
        >
          <BsGear className="mr-3" /> System Status
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
