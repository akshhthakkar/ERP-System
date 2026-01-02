import React, { useState } from "react";
import toast from "react-hot-toast";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { Link } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import Input from "../components/Input";
import Button from "../components/Button";

const ForgotPassword = () => {
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/pass/forgot-password`,
        values
      );
      toast.success("Recovery instructions sent to your email");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to process request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your email to receive recovery instructions"
    >
      <Formik
        initialValues={{ email: "" }}
        validationSchema={Yup.object({
          email: Yup.string()
            .email("Invalid email address")
            .required("Email is required"),
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
              id="email"
              name="email"
              label="Email Address"
              placeholder="name@company.com"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.email && errors.email}
            />

            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Send Recovery Link
            </Button>

            <div className="text-center">
              <Link
                to="/"
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                ← Back to Sign In
              </Link>
            </div>
          </Form>
        )}
      </Formik>
    </AuthLayout>
  );
};

export default ForgotPassword;
