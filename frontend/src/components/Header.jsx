import React from "react";
import { BsList, BsPerson, BsArrowRightShort } from "react-icons/bs"; // Breadcrumb arrow
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/UsersSlice";

const Header = ({ OpenSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  // Simple breadcrumb logic
  const path = location.pathname.split("/").filter((x) => x);
  const breadcrumb =
    path.length > 0
      ? path[0].charAt(0).toUpperCase() + path[0].slice(1)
      : "Dashboard";

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10">
      <div className="flex items-center">
        <button
          className="mr-4 text-gray-500 hover:text-gray-700 md:hidden"
          onClick={OpenSidebar}
        >
          <BsList size={24} />
        </button>
        <div className="flex items-center text-sm text-gray-500">
          <span
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
            onClick={() => navigate("/dashboard")}
          >
            Home
          </span>
          <BsArrowRightShort size={20} className="mx-1" />
          <span className="font-medium text-gray-800">{breadcrumb}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Profile Dropdown Area (Simplified for now) */}
        <div className="relative group flex items-center gap-3 pl-4 border-l border-gray-100">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-gray-800 leading-none">
              {user?.username || "User"}
            </p>
            <p className="text-xs text-teal-600 font-medium mt-1">
              Administrator
            </p>
          </div>

          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 p-0.5 shadow-md cursor-pointer hover:shadow-lg transition-all">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
              {user?.image ? (
                <img
                  src={
                    user.image.startsWith("http")
                      ? user.image
                      : `data:image/png;base64,${user.image}`
                  }
                  alt="User"
                  className="w-full h-full object-cover"
                />
              ) : (
                <BsPerson className="text-teal-600 text-lg" />
              )}
            </div>
          </div>

          {/* Dropdown / Sign Out */}
          <button
            onClick={handleLogout}
            className="ml-2 text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
