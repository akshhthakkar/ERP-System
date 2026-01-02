import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Input from "../components/Input";
import Card from "../components/Card";
import { BsFileEarmarkPdf, BsDownload } from "react-icons/bs";

const Bills = () => {
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/sales/show`
        );
        setBills(res.data.result);
        setFilteredBills(res.data.result);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load bills");
      } finally {
        setLoading(false);
      }
    };
    fetchBills();
  }, []);

  useEffect(() => {
    const s = search.toLowerCase();
    setFilteredBills(
      bills.filter(
        (b) =>
          b.customer.toLowerCase().includes(s) ||
          (b.customermail && b.customermail.toLowerCase().includes(s))
      )
    );
  }, [search, bills]);

  const openPdf = (pdfUrl) => {
    if (!pdfUrl) {
      toast.error("No PDF available for this bill");
      return;
    }
    window.open(pdfUrl, "_blank");
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="title-lg">Transaction History</h1>
        <div className="w-64">
          <Input
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-0"
          />
        </div>
      </div>

      <Card className="p-0 border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="p-3 font-semibold text-slate-600">Date/Time</th>
                <th className="p-3 font-semibold text-slate-600">Customer</th>
                <th className="p-3 font-semibold text-slate-600">Items</th>
                <th className="p-3 font-semibold text-slate-600 text-right">
                  Qty
                </th>
                <th className="p-3 font-semibold text-slate-600 text-right">
                  Amount
                </th>
                <th className="p-3 font-semibold text-slate-600 text-center">
                  PDF
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-slate-500">
                    Retrieving records...
                  </td>
                </tr>
              ) : filteredBills.length > 0 ? (
                filteredBills.map((bill, index) => (
                  <tr
                    key={index}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-3 text-slate-500 whitespace-nowrap">
                      {bill.date}
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-slate-900">
                        {bill.customer}
                      </div>
                      <div className="text-xs text-slate-400">
                        {bill.customermail}
                      </div>
                    </td>
                    <td className="p-3 text-slate-700">
                      {bill.product ? bill.product.productName : "Direct Sale"}
                    </td>
                    <td className="p-3 text-slate-600 text-right">
                      {bill.quantity}
                    </td>
                    <td className="p-3 text-slate-900 font-medium text-right">
                      ₹{bill.amount}
                    </td>
                    <td className="p-3 text-center">
                      {bill.pdfUrl ? (
                        <button
                          onClick={() => openPdf(bill.pdfUrl)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors"
                        >
                          <BsDownload /> Download
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          Not available
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-400">
                    No records matching search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-700">
          <strong>Note:</strong> PDFs are generated when a sale is created. Old
          bills without PDFs will show "Not available". Create a new sale to
          test PDF generation.
        </p>
      </div>
    </div>
  );
};

export default Bills;
