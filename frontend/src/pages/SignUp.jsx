import React, { useState } from "react";
import toast from "react-hot-toast";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../redux/UsersSlice";
import axios from "axios";
import AuthLayout from "../layouts/AuthLayout";
import Input from "../components/Input";
import Button from "../components/Button";
import { GoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";

const SignUp = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [errorMessage, setErrorMessage] = useState("");

  const initialValues = {
    username: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  };

  const validationSchema = Yup.object({
    username: Yup.string().min(3, "Too short").required("Required"),
    email: Yup.string().email("Invalid email").required("Required"),
    mobile: Yup.string()
      .matches(/^[0-9]+$/, "Invalid phone")
      .required("Required"),
    password: Yup.string().min(8, "Min 8 characters").required("Required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords don't match")
      .required("Required"),
  });

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

  const handleRegister = async (values, { setSubmitting }) => {
    setErrorMessage("");
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/user/register`, {
        ...values,
        gender: "male", // Defaulting for simplicity in new UI
      });
      toast.success("Registration Successful");
      navigate("/");
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.code === 11000
      ) {
        toast.error("Username or email already exists");
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Get Started" subtitle="Create your account now">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleRegister}
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
              placeholder="Choose a username"
              value={values.username}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.username && errors.username}
            />
            <Input
              id="email"
              name="email"
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.email && errors.email}
            />
            <Input
              id="mobile"
              name="mobile"
              label="Phone Number"
              placeholder="Enter your mobile number"
              value={values.mobile}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.mobile && errors.mobile}
            />
            <Input
              id="password"
              name="password"
              label="Password"
              type="password"
              placeholder="Create a password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.password && errors.password}
            />
            <Input
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              value={values.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.confirmPassword && errors.confirmPassword}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isSubmitting}
              style={{ width: "100%", marginTop: "10px" }}
            >
              Sign Up
            </Button>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or register with
                </span>
              </div>
            </div>
            <a
              href={`${import.meta.env.VITE_API_URL}/user/google`}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <FcGoogle size={20} />
              <span>Sign up with Google</span>
            </a>
            <div className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/" style={{ color: "#007bff", fontWeight: "500" }}>
                Sign In
              </Link>
            </div>
          </Form>
        )}
      </Formik>
    </AuthLayout>
  );
};

export default SignUp;
