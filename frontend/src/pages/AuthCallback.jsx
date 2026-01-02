import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../redux/UsersSlice";
import toast from "react-hot-toast";

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      // Store token immediately to valid subsequent requests
      localStorage.setItem("token", token);

      const fetchUser = async () => {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/user/profile`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            // Assuming the structure is { result: userObject, ... } based on repo successResponse
            // or { status, result, message }
            if (data.result) {
              dispatch(login({ user: data.result, token }));
              toast.success("Login Successful");
              navigate("/dashboard");
            } else {
              throw new Error("Invalid response structure");
            }
          } else {
            throw new Error("Failed to fetch profile");
          }
        } catch (error) {
          console.error("Error in Auth Callback:", error);
          toast.error("Login verification failed");
          navigate("/login");
        }
      };

      fetchUser();
    } else {
      toast.error("Google Login Failed");
      navigate("/login");
    }
  }, [searchParams, navigate, dispatch]);

  return <div>Loading...</div>;
};

export default AuthCallback;
