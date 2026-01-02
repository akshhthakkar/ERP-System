import React, { useState, useEffect } from "react";
import axios from "axios";
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
      const res = await axios.get(
        "http://localhost:3000/api/products/getproducts"
      );
      setProducts(res.data.result);
    };
    fetchProducts();
  }, []);

  const handleUpdate = async () => {
    if (!selectedProduct.id || !quantity) return;
    setLoading(true);
    try {
      await axios.post("http://localhost:3000/api/products/supply", {
        productId: selectedProduct.id,
        quantityToAdd: parseInt(quantity),
      });
      alert("Stock Updated Successfully");
      setQuantity("");
      setSelectedProduct({ id: "", name: "" });
    } catch (e) {
      alert("Update Failed");
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
              <p className="text-xs text-green-600 mt-1">
                ✓ Product Verified: ID {selectedProduct.id}
              </p>
            )}
          </div>

          <Input
            label="Quantity Received"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
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
