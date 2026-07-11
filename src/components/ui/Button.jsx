import React from "react";

const Button = ({
  children,
  onClick,
  type = "button",
  disabled = false,
  className = "",
  variant = "primary",
  isLoading = false,
}) => {
  const baseStyle =
    "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed text-sm select-none active:scale-[0.98]";

  const variants = {
    primary: "bg-brand hover:bg-brand-300 text-[#111111] shadow-sm shadow-brand-100/30 focus:ring-brand",
    success: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-100/30 focus:ring-emerald-500",
    danger: "bg-rose-600 hover:bg-rose-500 text-white shadow-sm shadow-rose-100/30 focus:ring-rose-500",
    warning: "bg-amber-500 hover:bg-amber-400 text-white shadow-sm shadow-amber-100/30 focus:ring-amber-500",
    secondary: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 focus:ring-brand",
    ghost: "bg-transparent hover:bg-slate-50 text-slate-600 focus:ring-brand",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {isLoading && (
        <svg
          className="animate-spin h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
