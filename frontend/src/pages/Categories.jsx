import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import Modal from "../components/Modal";
import {
  BsPlus,
  BsTag,
  BsPencil,
  BsTrash,
  BsLock,
  BsCheck,
  BsX,
} from "react-icons/bs";

const Categories = () => {
  const [categories, setCategories] = useState({ system: [], custom: [] });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/categories`);
      setCategories(res.data.result?.grouped || { system: [], custom: [] });
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/categories`, {
        name: newCategoryName.trim(),
      });
      toast.success("Category created!");
      setNewCategoryName("");
      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      console.error("Create error:", error);
      toast.error(error.response?.data?.message || "Failed to create category");
    }
  };

  const handleUpdate = async (id, name) => {
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/categories/${id}`, {
        name: name.trim(),
      });
      toast.success("Category updated!");
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.message || "Failed to update category");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/categories/${id}`);
      toast.success("Category deleted!");
      setDeleteConfirm(null);
      fetchCategories();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.message || "Failed to delete category");
      setDeleteConfirm(null);
    }
  };

  const CategoryRow = ({ category, isSystem }) => {
    const [editName, setEditName] = useState(category.name);
    const isEditing = editingCategory === category._id;

    return (
      <div className="flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${
              isSystem
                ? "bg-slate-100 text-slate-500"
                : "bg-teal-100 text-teal-600"
            }`}
          >
            {isSystem ? <BsLock size={16} /> : <BsTag size={16} />}
          </div>
          {isEditing ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="input-field py-1 px-2 text-sm w-48"
              autoFocus
            />
          ) : (
            <span className="font-medium text-slate-800">{category.name}</span>
          )}
          {isSystem && (
            <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded">
              System
            </span>
          )}
        </div>

        {!isSystem && (
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => handleUpdate(category._id, editName)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded"
                  title="Save"
                >
                  <BsCheck size={18} />
                </button>
                <button
                  onClick={() => setEditingCategory(null)}
                  className="p-2 text-slate-400 hover:bg-slate-50 rounded"
                  title="Cancel"
                >
                  <BsX size={18} />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditingCategory(category._id)}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Edit"
                >
                  <BsPencil size={16} />
                </button>
                <button
                  onClick={() => setDeleteConfirm(category)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Delete"
                >
                  <BsTrash size={16} />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
          <p className="text-slate-500">
            Manage product categories for your inventory
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2"
        >
          <BsPlus size={18} /> Add Category
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">
          Loading categories...
        </div>
      ) : (
        <>
          {/* System Categories */}
          <Card className="mb-6">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <BsLock className="text-slate-400" />
              Default Categories
              <span className="text-xs font-normal text-slate-400">
                (Read-only)
              </span>
            </h3>
            <div className="space-y-2">
              {categories.system.map((cat) => (
                <CategoryRow key={cat._id} category={cat} isSystem={true} />
              ))}
            </div>
          </Card>

          {/* Custom Categories */}
          <Card>
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <BsTag className="text-teal-500" />
              Your Categories
              <span className="text-xs font-normal text-slate-400">
                ({categories.custom.length})
              </span>
            </h3>
            {categories.custom.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <BsTag size={32} className="mx-auto mb-2 opacity-30" />
                <p>No custom categories yet</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-teal-600 hover:underline mt-2"
                >
                  Create your first category
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {categories.custom.map((cat) => (
                  <CategoryRow key={cat._id} category={cat} isSystem={false} />
                ))}
              </div>
            )}
          </Card>
        </>
      )}

      {/* Add Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setNewCategoryName("");
        }}
        title="Add New Category"
      >
        <div className="space-y-4">
          <Input
            label="Category Name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Enter category name"
          />
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                setNewCategoryName("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create Category</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Category"
      >
        <div className="space-y-4">
          <p className="text-slate-600">
            Are you sure you want to delete{" "}
            <strong>{deleteConfirm?.name}</strong>?
          </p>
          <p className="text-amber-600 text-sm">
            ⚠️ Categories with products cannot be deleted. Reassign products
            first.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={() => handleDelete(deleteConfirm._id)}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Categories;
