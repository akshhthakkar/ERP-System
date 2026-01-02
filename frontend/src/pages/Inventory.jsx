import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import {
  BsPlus,
  BsFilter,
  BsSearch,
  BsTrash,
  BsCamera,
  BsUpload,
} from "react-icons/bs";
import Modal from "../components/Modal";
import Button from "../components/Button";
import Input from "../components/Input";
import Card from "../components/Card";
import CameraCapture from "../components/CameraCapture";

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  // Delete Confirmation State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const [categories, setCategories] = useState({ system: [], custom: [] });
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/categories`);
      setCategories(res.data.result?.grouped || { system: [], custom: [] });
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  // Add Product State - Enhanced with new fields
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    cp: "",
    inventory: "",
    categoryId: "",
    image: null,
    base64Image: null,
    minThreshold: "",
    preferredSupplierName: "",
    lastPurchaseCost: "",
  });

  // Preview image source
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/products/getproducts`
      );
      const loadedProducts = res.data.result.map((p) => ({
        ...p,
        imageUrl: p.image ? p.image.imageUrl : null,
      }));
      setProducts(loadedProducts);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    try {
      const formData = new FormData();
      formData.append("name", newProduct.name);
      formData.append("price", newProduct.price);
      formData.append("cp", newProduct.cp || 0);
      formData.append("inventory", newProduct.inventory);
      formData.append("categoryId", newProduct.categoryId); // Use categoryId
      formData.append("minThreshold", newProduct.minThreshold || 10);

      if (newProduct.preferredSupplierName) {
        formData.append(
          "preferredSupplierName",
          newProduct.preferredSupplierName
        );
      }
      if (newProduct.lastPurchaseCost) {
        formData.append("lastPurchaseCost", newProduct.lastPurchaseCost);
      }

      // Handle image - either file or base64
      if (newProduct.image) {
        formData.append("image", newProduct.image);
      } else if (newProduct.base64Image) {
        formData.append("base64Image", newProduct.base64Image);
      } else {
        toast.error("Please add a product image");
        return;
      }

      await axios.post(
        `${import.meta.env.VITE_API_URL}/products/createProduct`,
        formData
      );

      toast.success("Product Added Successfully");
      setIsModalOpen(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error adding product");
    }
  };

  const resetForm = () => {
    setNewProduct({
      name: "",
      price: "",
      cp: "",
      inventory: "",
      categoryId: "",
      image: null,
      base64Image: null,
      minThreshold: "",
      preferredSupplierName: "",
      lastPurchaseCost: "",
    });
    setImagePreview(null);
  };

  const handleCameraCapture = (base64Data) => {
    setNewProduct({ ...newProduct, base64Image: base64Data, image: null });
    setImagePreview(base64Data);
    setIsCameraOpen(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProduct({ ...newProduct, image: file, base64Image: null });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const confirmDelete = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/products/delete/${productToDelete._id}`
      );
      toast.success("Product deleted successfully");
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
      fetchProducts();
    } catch (error) {
      console.error("Delete failed", error);
      toast.error("Failed to delete product");
    }
  };

  // Get all categories as flat array for filtering
  const allCategories = [...categories.system, ...categories.custom];

  const filteredProducts = products.filter((p) => {
    // Filter by category name (legacy string field)
    const matchesCategory = filter ? p.category === filter : true;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Use minThreshold for stock status (or default 10)
  const getStockStatus = (product) => {
    const threshold = product.minThreshold || 10;
    if (product.inventory > threshold)
      return { label: "IN STOCK", color: "bg-emerald-100 text-emerald-800" };
    if (product.inventory > 0)
      return { label: "LOW STOCK", color: "bg-amber-100 text-amber-800" };
    return { label: "OUT OF STOCK", color: "bg-red-100 text-red-800" };
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inventory</h1>
          <p className="text-sm text-slate-500">
            Manage product catalog and stock levels.
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2"
        >
          <BsPlus size={18} /> Add Product
        </Button>
      </div>

      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full max-w-sm">
            <BsSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              className="input-field pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
              <BsFilter className="inline mr-1" /> Filter:
            </span>
            <select
              className="input-field py-1.5"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.system.length > 0 && (
                <optgroup label="Default Categories">
                  {categories.system.map((c) => (
                    <option key={c._id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </optgroup>
              )}
              {categories.custom.length > 0 && (
                <optgroup label="Your Categories">
                  {categories.custom.map((c) => (
                    <option key={c._id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Product Name
                </th>
                <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                  Sell Price
                </th>
                <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                  Cost Price
                </th>
                <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                  Stock
                </th>
                <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                  Status
                </th>
                <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="p-8 text-center text-sm text-slate-500"
                  >
                    Loading inventory data...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="p-8 text-center text-sm text-slate-500"
                  >
                    No products found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product);
                  return (
                    <tr
                      key={product._id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="p-3 text-sm font-medium text-slate-900 border-r border-slate-50">
                        <div className="flex items-center gap-3">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt=""
                              className="w-10 h-10 rounded border border-slate-200 object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-xs text-slate-400">
                              No Img
                            </div>
                          )}
                          {product.name}
                        </div>
                      </td>
                      <td className="p-3 text-sm text-slate-600 border-r border-slate-50">
                        {product.category}
                      </td>
                      <td className="p-3 text-sm font-mono text-slate-700 text-right border-r border-slate-50">
                        ₹{product.price}
                      </td>
                      <td className="p-3 text-sm font-mono text-slate-500 text-right border-r border-slate-50">
                        ₹{product.cp || 0}
                      </td>
                      <td className="p-3 text-sm font-mono text-slate-700 text-right border-r border-slate-50">
                        {product.inventory}
                        {product.minThreshold && (
                          <span className="text-xs text-slate-400 block">
                            min: {product.minThreshold}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center border-r border-slate-50">
                        <span
                          className={`inline-flex px-2 py-0.5 text-xs font-bold rounded ${stockStatus.color}`}
                        >
                          {stockStatus.label}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => confirmDelete(product)}
                          className="text-slate-400 hover:text-red-600 transition-colors p-2"
                          title="Delete Product"
                        >
                          <BsTrash size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title="New Product Entry"
      >
        <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
          <Input
            label="Product Name"
            value={newProduct.name}
            onChange={(e) =>
              setNewProduct({ ...newProduct, name: e.target.value })
            }
            placeholder="Official Product Name"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Sell Price (₹)"
              type="number"
              min="0"
              value={newProduct.price}
              onChange={(e) =>
                setNewProduct({ ...newProduct, price: e.target.value })
              }
              placeholder="Enter selling price"
            />
            <Input
              label="Cost Price (₹)"
              type="number"
              min="0"
              value={newProduct.cp}
              onChange={(e) =>
                setNewProduct({ ...newProduct, cp: e.target.value })
              }
              placeholder="Enter cost price"
            />
            <Input
              label="Initial Stock"
              type="number"
              min="0"
              value={newProduct.inventory}
              onChange={(e) =>
                setNewProduct({ ...newProduct, inventory: e.target.value })
              }
              placeholder="Enter stock quantity"
            />
            <Input
              label="Min Threshold"
              type="number"
              min="0"
              value={newProduct.minThreshold}
              onChange={(e) =>
                setNewProduct({ ...newProduct, minThreshold: e.target.value })
              }
              placeholder="Low stock alert level"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-slate-700">
              Category
            </label>
            <div className="flex gap-2">
              <select
                className="input-field flex-1"
                value={newProduct.categoryId}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, categoryId: e.target.value })
                }
              >
                <option value="">Select Category</option>
                {categories.system.length > 0 && (
                  <optgroup label="Default Categories">
                    {categories.system.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </optgroup>
                )}
                {categories.custom.length > 0 && (
                  <optgroup label="Your Categories">
                    {categories.custom.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              <button
                type="button"
                onClick={() => setIsAddingCategory(!isAddingCategory)}
                className="px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 text-slate-600"
                title="Add new category"
              >
                {isAddingCategory ? "✕" : "+"}
              </button>
            </div>
            {isAddingCategory && (
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  className="input-field flex-1"
                  placeholder="New category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (!newCategoryName.trim()) {
                      toast.error("Enter category name");
                      return;
                    }
                    try {
                      const res = await axios.post(
                        `${import.meta.env.VITE_API_URL}/categories`,
                        {
                          name: newCategoryName.trim(),
                        }
                      );
                      toast.success("Category created!");
                      setNewCategoryName("");
                      setIsAddingCategory(false);
                      fetchCategories();
                      // Auto-select the new category
                      if (res.data.result?._id) {
                        setNewProduct({
                          ...newProduct,
                          categoryId: res.data.result._id,
                        });
                      }
                    } catch (error) {
                      toast.error(
                        error.response?.data?.message || "Failed to create"
                      );
                    }
                  }}
                  className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 text-sm"
                >
                  Add
                </button>
              </div>
            )}
          </div>

          {/* Supplier Info (Optional) */}
          <div className="border-t pt-4 mt-2">
            <p className="text-xs font-medium text-slate-500 uppercase mb-3">
              Supplier Info (Optional)
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Supplier Name"
                value={newProduct.preferredSupplierName}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    preferredSupplierName: e.target.value,
                  })
                }
                placeholder="Preferred supplier"
              />
              <Input
                label="Last Purchase Cost (₹)"
                type="number"
                value={newProduct.lastPurchaseCost}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    lastPurchaseCost: e.target.value,
                  })
                }
              />
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="border border-slate-200 p-4 rounded-lg bg-slate-50">
            <label className="mb-2 text-xs font-medium text-slate-500 uppercase block">
              Product Image
            </label>

            {/* Image Preview */}
            {imagePreview && (
              <div className="mb-3 relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-40 object-contain rounded border bg-white"
                />
                <button
                  onClick={() => {
                    setImagePreview(null);
                    setNewProduct({
                      ...newProduct,
                      image: null,
                      base64Image: null,
                    });
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Upload Options */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsCameraOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
              >
                <BsCamera size={18} />
                Capture from Camera
              </button>
              <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium cursor-pointer">
                <BsUpload size={18} />
                Upload from Device
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddProduct}>Create Record</Button>
          </div>
        </div>
      </Modal>

      {/* Camera Capture Modal */}
      {isCameraOpen && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setIsCameraOpen(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
      >
        <div className="space-y-4">
          <p className="text-slate-600">
            Are you sure you want to delete{" "}
            <strong>{productToDelete?.name}</strong>? This action cannot be
            undone and will remove the product and its image permanently.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDelete}
            >
              Delete Product
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Inventory;
