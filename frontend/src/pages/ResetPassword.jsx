import React, { useState } from "react";
import toast from "react-hot-toast";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import Input from "../components/Input";
import Button from "../components/Button";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState({ type: "", message: "" });

  const token = searchParams.get("token");
  const id = searchParams.get("id");

  if (!token || !id) {
    return (
      <AuthLayout
        title="Invalid Link"
        subtitle="Recovery link is missing required parameters."
      >
        <div className="text-center">
          <Link
            to="/"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Back to Login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/pass/reset`, {
        id,
        token,
        newPassword: values.password,
      });
      toast.success("Password reset successful. Redirecting...");
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Set New Password"
      subtitle="Please enter your new password below"
    >
      <Formik
        initialValues={{ password: "", confirmPassword: "" }}
        validationSchema={Yup.object({
          password: Yup.string()
            .min(6, "Password must be at least 6 characters")
            .required("Password is required"),
          confirmPassword: Yup.string()
            .oneOf([Yup.ref("password"), null], "Passwords must match")
            .required("Confirm Password is required"),
        })}
        onSubmit={handleSubmit}
      >
        {({
          isSubmitting,
          errors,
          touched,
          handleChange,
          handleBlur,
          values,
        }) => (
          <Form className="space-y-6">
            <Input
              id="password"
              name="password"
              type="password"
              label="New Password"
              placeholder="••••••••"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.password && errors.password}
            />
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              label="Confirm Password"
              placeholder="••••••••"
              value={values.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.confirmPassword && errors.confirmPassword}
            />

            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Reset Password
            </Button>
          </Form>
        )}
      </Formik>
    </AuthLayout>
  );
};

export default ResetPassword;
