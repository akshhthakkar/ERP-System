import React from "react";

const Card = ({ children, className = "", title, action, ...props }) => {
  return (
    <div className={`card ${className}`} {...props}>
      {(title || action) && (
        <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
          {title && (
            <h3 className="text-base font-semibold text-gray-800">{title}</h3>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
