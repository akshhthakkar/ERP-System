import React from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";

const NotFound = () => {
  return (
    <AuthLayout title="404" subtitle="Page Not Found">
      <div className="text-center">
        <p className="text-slate-600 mb-6">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-slate-900 hover:bg-slate-800"
        >
          Go to Home
        </Link>
      </div>
    </AuthLayout>
  );
};

export default NotFound;
