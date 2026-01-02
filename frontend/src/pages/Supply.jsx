import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";

const Supply = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState({ id: "", name: "" });
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/products/getproducts`
        );
        setProducts(res.data.result);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load products");
      }
    };
    fetchProducts();
  }, []);

  const handleUpdate = async () => {
    if (!selectedProduct.id) {
      toast.error("Please select a product");
      return;
    }
    if (!quantity || parseInt(quantity) <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/products/supply`, {
        productId: selectedProduct.id,
        quantityToAdd: parseInt(quantity),
      });
      toast.success("Stock Updated Successfully!");
      setQuantity("");
      setSelectedProduct({ id: "", name: "" });
    } catch (e) {
      console.error(e);
      toast.error(e.response?.data?.message || "Update Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-12">
      <Card
        title="Supply Chain Management"
        className="border-t-4 border-t-slate-800"
      >
        <div className="space-y-6">
          <p className="text-sm text-slate-500 border-b border-slate-100 pb-4">
            Manually update inventory stock levels from supplier deliveries.
          </p>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Select Product Reference
            </label>
            <input
              list="products"
              className="input-field"
              placeholder="Search by Product Name..."
              value={selectedProduct.name}
              onChange={(e) => {
                const val = e.target.value;
                const p = products.find((i) => i.name === val);
                setSelectedProduct({ name: val, id: p ? p._id : "" });
              }}
            />
            <datalist id="products">
              {products.map((p) => (
                <option key={p._id} value={p.name} />
              ))}
            </datalist>
            {selectedProduct.id && (
              <div className="mt-2">
                <p className="text-xs text-green-600">
                  ✓ Product Verified: {selectedProduct.name}
                </p>
                {(() => {
                  const p = products.find((i) => i._id === selectedProduct.id);
                  if (p && p.dailySalesAvg > 0) {
                    const suggested = Math.ceil(p.dailySalesAvg * 7);
                    return (
                      <p className="text-xs text-blue-600 mt-1">
                        ℹ️ Suggested Restock: {suggested} units (based on 7-day
                        forecast)
                      </p>
                    );
                  }
                  return null;
                })()}
              </div>
            )}
          </div>

          <Input
            label="Quantity Received"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Enter quantity to add"
          />

          <Button onClick={handleUpdate} isLoading={loading} className="w-full">
            Confirm Stock Addition
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Supply;
