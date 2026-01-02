import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { BsTrash, BsCheck2Circle } from "react-icons/bs";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";

const Sales = () => {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [currentItem, setCurrentItem] = useState({
    productName: "",
    productId: "",
    price: 0,
    qty: 0,
    amount: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/products/getproducts`
        );
        setProducts(res.data.result);
      } catch (error) {
        console.error("Error fetching products", error);
      }
    };
    fetchProducts();
  }, []);

  const findProduct = (name) => {
    const product = products.find(
      (p) => p.name.toLowerCase() === name.toLowerCase()
    );
    if (product) {
      setCurrentItem((prev) => ({
        ...prev,
        productName: product.name,
        productId: product._id,
        price: product.price,
        amount: product.price * prev.qty,
      }));
    } else {
      setCurrentItem((prev) => ({
        ...prev,
        productName: name,
        productId: "",
        price: 0,
        amount: 0,
      }));
    }
  };

  const handleQtyChange = (val) => {
    const qty = parseInt(val) || 0;
    setCurrentItem((prev) => ({ ...prev, qty, amount: prev.price * qty }));
  };

  const addToCart = () => {
    if (!currentItem.productName || currentItem.qty <= 0) return;
    setCartItems([...cartItems, { ...currentItem }]);
    setCurrentItem({
      productName: "",
      productId: "",
      price: 0,
      qty: 0,
      amount: 0,
    });
  };

  const handleCheckout = async () => {
    if (!customerName || !email || cartItems.length === 0) return;
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/sales/create`, {
        customer: customerName,
        customermail: email,
        products: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.qty,
        })),
      });
      toast.success("Sale Recorded & Invoice Generated");
      setCartItems([]);
      setCustomerName("");
      setEmail("");
    } catch (error) {
      console.error(error);
      toast.error("Transaction Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-100px)]">
      {/* Left Panel: Inputs */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <Card title="Customer Details">
          <Input
            label="Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Customer Name"
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Customer Email"
          />
        </Card>

        <Card title="Order Entry">
          <Input
            label="Product"
            value={currentItem.productName}
            onChange={(e) => findProduct(e.target.value)}
            list="product-list"
            placeholder="Search Product..."
          />
          <datalist id="product-list">
            {products.map((p) => (
              <option key={p._id} value={p.name} />
            ))}
          </datalist>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Rate"
              value={currentItem.price}
              readOnly
              className="bg-slate-50"
            />
            <Input
              label="Qty"
              type="number"
              value={currentItem.qty}
              onChange={(e) => handleQtyChange(e.target.value)}
            />
            <Input
              label="Total"
              value={currentItem.amount}
              readOnly
              className="bg-slate-50 font-semibold"
            />
          </div>
          <Button
            onClick={addToCart}
            className="w-full mt-4"
            variant="secondary"
          >
            Add Line Item
          </Button>
        </Card>
      </div>

      {/* Right Panel: Invoice Preview */}
      <div className="lg:col-span-7 flex flex-col h-full">
        <Card
          className="flex-1 flex flex-col p-0 overflow-hidden border-slate-300"
          title="Invoice Draft"
        >
          <div className="flex-1 overflow-auto bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="p-3 font-semibold text-slate-700">Item</th>
                  <th className="p-3 font-semibold text-slate-700 text-right">
                    Qty
                  </th>
                  <th className="p-3 font-semibold text-slate-700 text-right">
                    Rate
                  </th>
                  <th className="p-3 font-semibold text-slate-700 text-right">
                    Amount
                  </th>
                  <th className="p-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cartItems.map((item, index) => (
                  <tr key={index}>
                    <td className="p-3 text-slate-800">{item.productName}</td>
                    <td className="p-3 text-right text-slate-600">
                      {item.qty}
                    </td>
                    <td className="p-3 text-right text-slate-600">
                      {item.price}
                    </td>
                    <td className="p-3 text-right font-medium text-slate-900">
                      {item.amount}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => {
                          const n = [...cartItems];
                          n.splice(index, 1);
                          setCartItems(n);
                        }}
                        className="text-red-400 hover:text-red-600"
                      >
                        <BsTrash />
                      </button>
                    </td>
                  </tr>
                ))}
                {cartItems.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="p-12 text-center text-slate-400 italic"
                    >
                      No items drafted
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-200 bg-slate-50">
            <div className="flex justify-between items-center text-lg font-bold text-slate-900 mb-4">
              <span>Grand Total</span>
              <span>
                ₹{cartItems.reduce((a, c) => a + c.amount, 0).toLocaleString()}
              </span>
            </div>
            <Button
              onClick={handleCheckout}
              isLoading={loading}
              className="w-full py-3 text-base"
            >
              <BsCheck2Circle className="mr-2" /> Process Transaction
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Sales;
