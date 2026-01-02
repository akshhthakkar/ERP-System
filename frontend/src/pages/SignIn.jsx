import React, { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { login } from "../redux/UsersSlice";
import AuthLayout from "../layouts/AuthLayout";
import Input from "../components/Input";
import Button from "../components/Button";
import toast from "react-hot-toast";
import { GoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";

const SignIn = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/user/google-login`,
        {
          token: credentialResponse.credential,
        }
      );
      if (res.data && res.data.result && res.data.result.token) {
        dispatch(login(res.data.result));
        toast.success("Login Successful");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Google Login Error", error);
      toast.error("Google Login Failed");
    }
  };

  const handleLogin = async (values, { setSubmitting }) => {
    // ... existing ...
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/user/login`,
        values
      );
      if (res.data && res.data.result && res.data.result.token) {
        dispatch(login(res.data.result));
        toast.success("Login Successful");
        navigate("/dashboard");
      } else {
        toast.error("Unexpected response from server");
      }
    } catch (error) {
      // ...
      console.error(error);
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        toast.error("Invalid username or password");
      } else {
        toast.error("Failed to connect to server");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const initialValues = {
    username: "",
    password: "",
  };

  const validationSchema = Yup.object({
    username: Yup.string().required("Username is required"),
    password: Yup.string().required("Password is required"),
  });

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your account to continue"
    >
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleLogin}
      >
        {({
          isSubmitting,
          errors,
          touched,
          handleChange,
          handleBlur,
          values,
        }) => (
          <Form>
            <Input
              id="username"
              name="username"
              label="Username"
              placeholder="Enter your username"
              value={values.username}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.username && errors.username}
            />
            <Input
              id="password"
              name="password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.password && errors.password}
            />
            <div className="flex justify-between items-center mb-6">
              <label className="flex items-center text-sm text-gray-600">
                <input type="checkbox" className="mr-2" /> Remember me
              </label>
              <Link
                to="/forgotpassword"
                style={{ color: "#007bff", fontSize: "14px" }}
              >
                Forgot Password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isSubmitting}
              style={{ width: "100%" }}
            >
              Sign In
            </Button>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>
            <a
              href={`${import.meta.env.VITE_API_URL}/user/google`}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <FcGoogle size={20} />
              <span>Sign in with Google</span>
            </a>
            <div className="mt-6 text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                style={{ color: "#007bff", fontWeight: "500" }}
              >
                Sign Up
              </Link>
            </div>
          </Form>
        )}
      </Formik>
    </AuthLayout>
  );
};

export default SignIn;
