import React, { useState, useEffect } from "react";
import axios from "axios";
import Card from "../components/Card";
import {
  BsArrowUpSquare,
  BsGraphUp,
  BsArchive,
  BsCash,
  BsTrophy,
} from "react-icons/bs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Reports = () => {
  const [activeTab, setActiveTab] = useState("monthly");
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [year, setYear] = useState(String(new Date().getFullYear()));

  // Report Data States
  const [monthlyData, setMonthlyData] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [deadStock, setDeadStock] = useState([]);
  const [profitSummary, setProfitSummary] = useState(null);
  const [revenueByProduct, setRevenueByProduct] = useState([]);

  // Fetch monthly report
  const fetchMonthlyReport = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/report/monthlysales/${month}/${year}`
      );
      setMonthlyData(res.data.result);
    } catch (error) {
      console.error("Monthly report error", error);
      setMonthlyData(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch advanced reports
  const fetchAdvancedReports = async () => {
    setLoading(true);
    try {
      const [topRes, deadRes, profitRes, revenueRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/report/top-products`),
        axios.get(`${import.meta.env.VITE_API_URL}/report/dead-stock`),
        axios.get(`${import.meta.env.VITE_API_URL}/report/profit-summary`),
        axios.get(`${import.meta.env.VITE_API_URL}/report/revenue-by-product`),
      ]);

      setTopProducts(topRes.data.result || []);
      setDeadStock(deadRes.data.result || []);
      setProfitSummary(profitRes.data.result || null);
      setRevenueByProduct(revenueRes.data.result || []);
    } catch (error) {
      console.error("Advanced reports error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "monthly") {
      fetchMonthlyReport();
    } else {
      fetchAdvancedReports();
    }
  }, [month, year, activeTab]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
    },
    scales: {
      y: { ticks: { color: "#5F9598" }, grid: { color: "#e5e7eb" } },
      x: { ticks: { color: "#5F9598" }, grid: { display: false } },
    },
  };

  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear - 1, currentYear - 2];

  const tabs = [
    { id: "monthly", label: "Monthly Sales", icon: <BsGraphUp /> },
    { id: "top", label: "Top Products", icon: <BsTrophy /> },
    { id: "deadstock", label: "Dead Stock", icon: <BsArchive /> },
    { id: "profit", label: "Profit Summary", icon: <BsCash /> },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Advanced Reports
          </h1>
          <p className="text-sm text-slate-500">
            Sales analytics, inventory insights, and profit tracking
          </p>
        </div>

        {/* Month/Year selector for monthly tab */}
        {activeTab === "monthly" && (
          <div className="flex gap-2 bg-white p-1 rounded border border-slate-200">
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="bg-transparent text-sm font-medium text-slate-700 outline-none p-2"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {new Date(0, m - 1).toLocaleString("default", {
                    month: "long",
                  })}
                </option>
              ))}
            </select>
            <div className="w-px bg-slate-200 my-1"></div>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="bg-transparent text-sm font-medium text-slate-700 outline-none p-2"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
              transition-all whitespace-nowrap
              ${
                activeTab === tab.id
                  ? "bg-teal-600 text-white shadow-md"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-teal-300"
              }
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">
          Loading report data...
        </div>
      ) : (
        <>
          {/* Monthly Sales Tab */}
          {activeTab === "monthly" &&
            (monthlyData ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-4">
                  <Card title="Period Summary">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-white border rounded shadow-sm">
                        <span className="text-sm text-slate-500">
                          Total Transactions
                        </span>
                        <span className="text-xl font-bold text-slate-900">
                          {monthlyData.totalSales}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white border rounded shadow-sm">
                        <span className="text-sm text-slate-500">
                          Gross Revenue
                        </span>
                        <span className="text-xl font-bold text-slate-900">
                          {monthlyData.totalAmount}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white border rounded shadow-sm">
                        <span className="text-sm text-slate-500">Profit</span>
                        <span className="text-xl font-bold text-green-600">
                          {monthlyData.profit}
                        </span>
                      </div>
                    </div>
                  </Card>
                </div>
                <div className="md:col-span-2">
                  <Card title="Sales by Product" className="h-[400px]">
                    {monthlyData.chartData?.labels?.length > 0 ? (
                      <div className="h-full p-4">
                        <Bar
                          options={chartOptions}
                          data={{
                            labels: monthlyData.chartData.labels,
                            datasets: [
                              {
                                label: "Revenue",
                                data: monthlyData.chartData.data,
                                backgroundColor: "#1D546D",
                                borderRadius: 4,
                              },
                              {
                                label: "Profit",
                                data: monthlyData.chartData.profitData,
                                backgroundColor: "#5F9598",
                                borderRadius: 4,
                              },
                            ],
                          }}
                        />
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-400">
                        No sales data for this period
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded text-slate-400">
                No data for selected period
              </div>
            ))}

          {/* Top Products Tab */}
          {activeTab === "top" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="Top 5 Selling Products" className="h-[400px]">
                {topProducts.length > 0 ? (
                  <div className="h-full p-4">
                    <Bar
                      options={{ ...chartOptions, indexAxis: "y" }}
                      data={{
                        labels: topProducts.map(
                          (p) => p.productName || "Unknown"
                        ),
                        datasets: [
                          {
                            label: "Units Sold",
                            data: topProducts.map((p) => p.totalQuantity),
                            backgroundColor: [
                              "#10B981",
                              "#3B82F6",
                              "#8B5CF6",
                              "#F59E0B",
                              "#EF4444",
                            ],
                            borderRadius: 4,
                          },
                        ],
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400">
                    No sales data available
                  </div>
                )}
              </Card>

              <Card title="Revenue Distribution">
                <div className="space-y-3">
                  {revenueByProduct.slice(0, 5).map((product, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 flex items-center justify-center bg-teal-100 text-teal-700 rounded font-bold text-sm">
                          {index + 1}
                        </span>
                        <span className="font-medium text-slate-800">
                          {product.productName || "Unknown"}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">
                          ₹{product.totalRevenue?.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500">
                          {product.salesCount} sales
                        </p>
                      </div>
                    </div>
                  ))}
                  {revenueByProduct.length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                      No revenue data
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* Dead Stock Tab */}
          {activeTab === "deadstock" && (
            <Card
              title="Dead Stock Report"
              subtitle="Products with no sales in 30+ days"
            >
              {deadStock.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="p-3 text-left text-xs font-bold text-slate-500 uppercase">
                          Product
                        </th>
                        <th className="p-3 text-left text-xs font-bold text-slate-500 uppercase">
                          Category
                        </th>
                        <th className="p-3 text-right text-xs font-bold text-slate-500 uppercase">
                          Stock
                        </th>
                        <th className="p-3 text-right text-xs font-bold text-slate-500 uppercase">
                          Last Sold
                        </th>
                        <th className="p-3 text-right text-xs font-bold text-slate-500 uppercase">
                          Days Idle
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {deadStock.map((product) => (
                        <tr key={product._id} className="hover:bg-slate-50">
                          <td className="p-3 font-medium text-slate-800">
                            {product.name}
                          </td>
                          <td className="p-3 text-slate-600">
                            {product.category}
                          </td>
                          <td className="p-3 text-right font-mono">
                            {product.inventory}
                          </td>
                          <td className="p-3 text-right text-slate-500">
                            {product.lastSoldAt
                              ? new Date(
                                  product.lastSoldAt
                                ).toLocaleDateString()
                              : "Never"}
                          </td>
                          <td className="p-3 text-right">
                            <span
                              className={`px-2 py-1 rounded text-xs font-bold ${
                                product.daysSinceLastSale === null
                                  ? "bg-red-100 text-red-700"
                                  : product.daysSinceLastSale > 60
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {product.daysSinceLastSale === null
                                ? "Never sold"
                                : `${product.daysSinceLastSale} days`}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <BsArchive size={48} className="mx-auto mb-4 opacity-20" />
                  No dead stock! All products are selling well.
                </div>
              )}
            </Card>
          )}

          {/* Profit Summary Tab */}
          {activeTab === "profit" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white">
                <div className="text-center py-4">
                  <p className="text-teal-100 text-sm mb-2">Total Revenue</p>
                  <p className="text-4xl font-bold">
                    ₹{(profitSummary?.totalRevenue || 0).toLocaleString()}
                  </p>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-slate-600 to-slate-700 text-white">
                <div className="text-center py-4">
                  <p className="text-slate-300 text-sm mb-2">Total Cost</p>
                  <p className="text-4xl font-bold">
                    ₹{(profitSummary?.totalCost || 0).toLocaleString()}
                  </p>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <div className="text-center py-4">
                  <p className="text-green-100 text-sm mb-2">Net Profit</p>
                  <p className="text-4xl font-bold">
                    ₹{(profitSummary?.totalProfit || 0).toLocaleString()}
                  </p>
                </div>
              </Card>

              <Card className="md:col-span-3" title="Summary Statistics">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-50 rounded text-center">
                    <p className="text-2xl font-bold text-slate-900">
                      {profitSummary?.salesCount || 0}
                    </p>
                    <p className="text-sm text-slate-500">Total Sales</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded text-center">
                    <p className="text-2xl font-bold text-slate-900">
                      {profitSummary?.totalQuantity || 0}
                    </p>
                    <p className="text-sm text-slate-500">Units Sold</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded text-center">
                    <p className="text-2xl font-bold text-slate-900">
                      ₹
                      {profitSummary?.salesCount
                        ? Math.round(
                            profitSummary.totalRevenue /
                              profitSummary.salesCount
                          )
                        : 0}
                    </p>
                    <p className="text-sm text-slate-500">Avg Order Value</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {profitSummary?.totalRevenue
                        ? Math.round(
                            (profitSummary.totalProfit /
                              profitSummary.totalRevenue) *
                              100
                          )
                        : 0}
                      %
                    </p>
                    <p className="text-sm text-slate-500">Profit Margin</p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Reports;
