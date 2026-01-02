import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Card from "../components/Card";
import Button from "../components/Button";
import {
  BsBell,
  BsExclamationTriangle,
  BsGraphDown,
  BsArchive,
  BsCheckAll,
  BsInfoCircle,
  BsArrowRepeat,
} from "react-icons/bs";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, unread

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/notifications`
      );
      setNotifications(res.data.result?.notifications || []);
      setUnreadCount(res.data.result?.unreadCount || 0);
    } catch (error) {
      console.error("Fetch error", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/notifications/read/${id}`
      );
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Mark as read error", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/notifications/read-all`);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Mark all as read error", error);
      toast.error("Failed to mark all as read");
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "LOW_STOCK":
        return <BsExclamationTriangle className="text-orange-600" />;
      case "FORECAST_WARNING":
        return <BsGraphDown className="text-purple-600" />;
      case "DEAD_STOCK":
        return <BsArchive className="text-gray-600" />;
      case "RESTOCK_REMINDER":
        return <BsArrowRepeat className="text-blue-600" />;
      case "SYSTEM":
      default:
        return <BsInfoCircle className="text-teal-600" />;
    }
  };

  const getNotificationStyle = (type) => {
    switch (type) {
      case "LOW_STOCK":
        return "bg-orange-50 border-orange-200";
      case "FORECAST_WARNING":
        return "bg-purple-50 border-purple-200";
      case "DEAD_STOCK":
        return "bg-gray-50 border-gray-200";
      case "RESTOCK_REMINDER":
        return "bg-blue-50 border-blue-200";
      case "SYSTEM":
      default:
        return "bg-teal-50 border-teal-200";
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "LOW_STOCK":
        return "Low Stock";
      case "FORECAST_WARNING":
        return "Forecast";
      case "DEAD_STOCK":
        return "Dead Stock";
      case "RESTOCK_REMINDER":
        return "Restock";
      case "SYSTEM":
      default:
        return "System";
    }
  };

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-100 text-teal-700 rounded-lg relative">
            <BsBell size={24} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
            <p className="text-slate-500">
              Alerts, warnings, and system updates.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            className="input-field py-1.5 text-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="unread">Unread ({unreadCount})</option>
          </select>
          {unreadCount > 0 && (
            <Button
              variant="secondary"
              className="flex items-center gap-2 text-sm"
              onClick={markAllAsRead}
            >
              <BsCheckAll /> Mark All Read
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 text-slate-500">
            Loading notifications...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <Card className="text-center py-12 text-slate-400">
            <BsBell size={32} className="mx-auto mb-3 opacity-20" />
            {filter === "unread"
              ? "No unread notifications"
              : "No notifications yet"}
          </Card>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif._id}
              onClick={() => !notif.isRead && markAsRead(notif._id)}
              className={`
                flex items-start gap-4 p-4 rounded-lg border cursor-pointer
                transition-all duration-200
                ${getNotificationStyle(notif.type)}
                ${!notif.isRead ? "border-l-4 shadow-sm" : "opacity-70"}
                hover:shadow-md
              `}
            >
              <div
                className={`
                  p-3 rounded-full flex-shrink-0
                  ${!notif.isRead ? "bg-white shadow-sm" : "bg-white/50"}
                `}
              >
                {getNotificationIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`
                      text-xs font-semibold px-2 py-0.5 rounded
                      ${
                        notif.type === "LOW_STOCK"
                          ? "bg-orange-100 text-orange-700"
                          : notif.type === "FORECAST_WARNING"
                          ? "bg-purple-100 text-purple-700"
                          : notif.type === "DEAD_STOCK"
                          ? "bg-gray-100 text-gray-700"
                          : notif.type === "RESTOCK_REMINDER"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-teal-100 text-teal-700"
                      }
                    `}
                  >
                    {getTypeLabel(notif.type)}
                  </span>
                  {!notif.isRead && (
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </div>
                <p
                  className={`text-slate-800 ${
                    !notif.isRead ? "font-medium" : ""
                  }`}
                >
                  {notif.message}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-slate-400">
                    {new Date(notif.createdAt).toLocaleString()}
                  </span>
                  {notif.productId && (
                    <span className="text-xs text-slate-500">
                      Product: {notif.productId.name || notif.productId}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
