import React from "react";
import Card from "../components/Card";

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          H5 ERP
        </h2>
        {title && (
          <h3 className="mt-2 text-center text-lg font-medium text-slate-600">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="mt-1 text-center text-sm text-slate-500">{subtitle}</p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
          {children}
        </Card>
      </div>
    </div>
  );
};

export default AuthLayout;
