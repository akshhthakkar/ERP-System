import React, { useState } from "react";
import toast from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { selectUser, selectUserId, updateUser } from "../redux/UsersSlice";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";
import axios from "axios";
import {
  BsPerson,
  BsCamera,
  BsEnvelope,
  BsPhone,
  BsGenderAmbiguous,
  BsShieldLock,
} from "react-icons/bs";

const Profile = () => {
  const user = useSelector(selectUser);
  const userId = useSelector(selectUserId);
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    mobile: user?.mobile || "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Helper to get image source
  const getImageSrc = () => {
    if (imageFile) return URL.createObjectURL(imageFile);
    if (user?.image) {
      if (user.image.startsWith("http")) return user.image; // Cloudinary
      return `data:image/png;base64,${user.image}`; // Legacy Base64
    }
    return null;
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const data = new FormData();
      data.append("userId", userId);
      data.append("username", formData.username);
      data.append("mobile", formData.mobile);
      data.append("email", formData.email);

      if (imageFile) {
        data.append("image", imageFile);
      }

      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/user/profile`,
        data,
        {
          // headers: { "Content-Type": "multipart/form-data" }, // Let browser set boundary
        }
      );

      if (res.data && res.data.success) {
        dispatch(updateUser(res.data.result)); // Update Redux store with RESULT (User Object)
        toast.success("Profile Updated Successfully");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Update failed", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Banner & Header */}
      <div className="relative h-48 rounded-2xl bg-gradient-to-r from-[#061E29] to-[#1D546D] overflow-hidden shadow-lg">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute bottom-6 left-8 flex items-end gap-6 z-10">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-md overflow-hidden flex items-center justify-center text-slate-300">
              {getImageSrc() ? (
                <img
                  src={getImageSrc()}
                  className="w-full h-full object-cover"
                  alt="Profile"
                />
              ) : (
                <BsPerson size={64} />
              )}
            </div>
            {isEditing && (
              <label className="absolute bottom-1 right-1 bg-teal-600 text-white p-2 rounded-full cursor-pointer hover:bg-teal-700 shadow-lg transition-transform transform hover:scale-105">
                <BsCamera size={18} />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                />
              </label>
            )}
          </div>

          <div className="mb-2">
            <h1 className="text-3xl font-bold !text-white tracking-tight">
              {user?.username || "Admin User"}
            </h1>
            <p className="text-teal-100 font-medium opacity-90">
              Administrator • H5 ERP System
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Quick Status / Contact */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="h-full">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <BsShieldLock className="text-teal-600" /> Account Status
            </h2>
            <div className="space-y-4">
              <div className="p-3 bg-teal-50 rounded-lg text-teal-800 border border-teal-100 text-sm font-medium flex justify-between">
                <span>Role</span>
                <span className="uppercase tracking-wider">Admin</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg text-slate-600 border border-slate-100 text-sm flex justify-between">
                <span>Member Since</span>
                <span className="font-semibold">
                  {new Date().getFullYear()}
                </span>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Contact Info
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-700">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                    <BsEnvelope />
                  </div>
                  <span className="text-sm truncate" title={formData.email}>
                    {formData.email}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-slate-700">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                    <BsPhone />
                  </div>
                  <span className="text-sm">
                    {formData.mobile || "Not set"}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Edit Form */}
        <div className="lg:col-span-2">
          <Card title="Profile Details" className="h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                readOnly={!isEditing}
                icon={BsPerson}
              />
              <Input
                label="Email Address"
                value={formData.email}
                readOnly
                icon={BsEnvelope}
                className="bg-slate-50 text-slate-500 cursor-not-allowed"
              />
              <Input
                label="Phone Number"
                value={formData.mobile}
                onChange={(e) =>
                  setFormData({ ...formData, mobile: e.target.value })
                }
                readOnly={!isEditing}
                icon={BsPhone}
              />
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
              {isEditing ? (
                <>
                  <Button
                    variant="secondary"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSave} isLoading={loading}>
                    Save User Profile
                  </Button>
                </>
              ) : (
                <Button variant="primary" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
