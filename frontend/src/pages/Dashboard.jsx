import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  BsCurrencyDollar,
  BsBoxSeam,
  BsCartCheck,
  BsGraphUp,
  BsArrowRight,
  BsExclamationTriangle,
} from "react-icons/bs";
import Card from "../components/Card";
import Button from "../components/Button";

const Dashboard = () => {
  const [stats, setStats] = useState({
    products: 0,
    sales: 0,
    revenue: 0,
    lowStock: 0,
  });
  const [recentSales, setRecentSales] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch Products & Sales
      const [productsRes, salesRes, notifRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/products/getproducts`),
        axios.get(`${import.meta.env.VITE_API_URL}/sales/show`),
        axios.get(`${import.meta.env.VITE_API_URL}/notifications`),
      ]);

      const products = productsRes.data.result || [];
      const sales = salesRes.data.result || [];
      const notifs = notifRes.data.result || [];

      // Calculate KPI
      const revenue = sales.reduce((acc, sale) => acc + (sale.amount || 0), 0);
      const lowStockCount = products.filter((p) => p.inventory < 10).length;

      setStats({
        products: products.length,
        sales: sales.length,
        revenue,
        lowStock: lowStockCount,
      });

      // Recent Sales (Last 5)
      // Assuming sales backend returns them or we sort them. Backend controller returns all unsorted (maybe?).
      // We should sort by date DESC.
      const sortedSales = [...sales]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
      setRecentSales(sortedSales);

      // Notifications (Limit 5)
      setNotifications(notifs.slice(0, 5));
    } catch (error) {
      console.error("Dashboard Error", error);
    } finally {
      setLoading(false);
    }
  };

  const KPICard = ({ title, value, icon, colorClass, borderClass }) => (
    <Card className={`flex items-center p-4 border-l-4 ${borderClass}`}>
      <div
        className={`w-12 h-12 rounded flex items-center justify-center text-white mr-4 ${colorClass}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">
          {title}
        </p>
        <h3 className="text-2xl font-bold text-slate-900">
          {loading ? "-" : value}
        </h3>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Executive Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Overview of key performance indicators.
          </p>
        </div>
        <Link to="/reports">
          <Button variant="secondary" className="flex items-center gap-2">
            View Reports <BsArrowRight />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Revenue"
          value={`₹${stats.revenue.toLocaleString()}`}
          icon={<BsCurrencyDollar size={24} />}
          colorClass="bg-teal-700"
          borderClass="border-teal-700"
        />
        <KPICard
          title="Total Orders"
          value={stats.sales}
          icon={<BsCartCheck size={24} />}
          colorClass="bg-blue-700"
          borderClass="border-blue-700"
        />
        <KPICard
          title="Active Inventory"
          value={stats.products}
          icon={<BsBoxSeam size={24} />}
          colorClass="bg-indigo-600"
          borderClass="border-indigo-600"
        />
        <KPICard
          title="Low Stock"
          value={stats.lowStock}
          icon={<BsExclamationTriangle size={24} />}
          colorClass="bg-red-500"
          borderClass="border-red-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Recent Activity" className="h-full">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                  <tr>
                    <th className="px-4 py-3 bg-slate-50 text-slate-700">
                      Customer
                    </th>
                    <th className="px-4 py-3 bg-slate-50 text-slate-700">
                      Product
                    </th>
                    <th className="px-4 py-3 bg-slate-50 text-slate-700 text-right">
                      Amount
                    </th>
                    <th className="px-4 py-3 bg-slate-50 text-slate-700">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="text-center py-4">
                        Loading...
                      </td>
                    </tr>
                  ) : recentSales.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="text-center py-4 text-slate-400"
                      >
                        No recent sales
                      </td>
                    </tr>
                  ) : (
                    recentSales.map((sale, i) => (
                      <tr
                        key={i}
                        className="border-b last:border-0 hover:bg-slate-50"
                      >
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {sale.customer}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {sale.product ? sale.product.productName : "N/A"}
                          <span className="text-xs text-slate-400 block">
                            Qty: {sale.quantity}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-slate-900">
                          ₹{sale.amount}
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {new Date(sale.date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-right">
              <Link
                to="/sales"
                className="text-sm font-medium text-teal-600 hover:text-teal-800"
              >
                View All Transacations &rarr;
              </Link>
            </div>
          </Card>
        </div>

        <div>
          <Card title="System Alerts" className="h-full">
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-4">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  All systems normal
                </div>
              ) : (
                notifications.map((notif, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 bg-slate-50 rounded border border-slate-100"
                  >
                    <div className="text-orange-500 mt-0.5">
                      <BsExclamationTriangle />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        Low Stock: {notif.productName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {notif.inventory} units remaining
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 text-center border-t border-slate-100 pt-3">
              <Link
                to="/notifications"
                className="text-sm font-medium text-teal-600 hover:text-teal-800"
              >
                View All Alerts
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
