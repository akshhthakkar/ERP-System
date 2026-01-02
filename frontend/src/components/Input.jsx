import React from "react";
import PropTypes from "prop-types";

const Input = ({
  label,
  error,
  className = "",
  containerClass = "mb-4",
  id,
  icon: Icon,
  ...props
}) => {
  return (
    <div className={`flex flex-col ${containerClass}`}>
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 text-sm font-semibold text-slate-700"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Icon size={18} />
          </div>
        )}
        <input
          id={id}
          className={`input-field w-full rounded-lg border-gray-300 focus:border-teal-500 focus:ring-teal-500 transition-colors ${
            Icon ? "pl-10" : ""
          } ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-200"
              : ""
          } ${className}`}
          {...props}
        />
      </div>
      {error && (
        <span className="mt-1 text-xs text-red-500 font-medium">{error}</span>
      )}
    </div>
  );
};

Input.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  id: PropTypes.string,
};

export default Input;
