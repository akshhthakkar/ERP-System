import React from "react";
import PropTypes from "prop-types";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  isLoading = false,
  disabled,
  ...props
}) => {
  const baseClass = "btn";
  // Formal variants: simpler, less rounded
  const variantClass =
    variant === "outline"
      ? "border border-gray-300 text-gray-700 hover:bg-gray-50 bg-white"
      : variant === "secondary"
      ? "btn-secondary"
      : variant === "danger"
      ? "btn-danger"
      : "btn-primary"; // Default primary (Slate)

  const sizeClass =
    size === "sm"
      ? "text-xs px-3 py-1.5"
      : size === "lg"
      ? "text-lg px-6 py-2.5"
      : "px-4 py-2";

  return (
    <button
      className={`${baseClass} ${variantClass} ${sizeClass} ${className} ${
        disabled || isLoading ? "opacity-50 cursor-not-allowed" : ""
      }`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="mr-2 animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full"></span>
      ) : null}
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(["primary", "secondary", "danger", "outline"]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  isLoading: PropTypes.bool,
};

export default Button;
