import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Sales from "./pages/Sales";
import Inventory from "./pages/Inventory";
import Bills from "./pages/Bills";
import Reports from "./pages/Reports";
import Supply from "./pages/Supply";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import Categories from "./pages/Categories";
import NotFound from "./pages/NotFound";
import AuthCallback from "./pages/AuthCallback";
import { useSelector, useDispatch } from "react-redux";
import { updateUser } from "./redux/UsersSlice";

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user } = useSelector((state) => state.user);
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return <MainLayout>{children}</MainLayout>;
};

import { Toaster } from "react-hot-toast";

import axios from "axios";

function App() {
  const { token, user } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      // Fetch latest profile data to stay in sync
      const fetchProfile = async () => {
        try {
          const res = await axios.get(
            `${import.meta.env.VITE_API_URL}/user/profile`
          );
          if (res.data && res.data.success) {
            dispatch(updateUser(res.data.result));
          }
        } catch (error) {
          console.error("Failed to fetch profile on mount", error);
        }
      };
      fetchProfile();
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token, dispatch]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<SignIn />} />
        <Route path="/register" element={<SignUp />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/reset" element={<ResetPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Protected Routes directly wrapped */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales"
          element={
            <ProtectedRoute>
              <Sales />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <Inventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bills"
          element={
            <ProtectedRoute>
              <Bills />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supply"
          element={
            <ProtectedRoute>
              <Supply />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <Categories />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
