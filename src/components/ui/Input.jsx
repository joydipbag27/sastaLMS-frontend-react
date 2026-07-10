import React from "react";

const Input = ({
  label,
  id,
  type = "text",
  value,
  onChange,
  placeholder = "",
  required = false,
  disabled = false,
  error = "",
  className = "",
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-slate-600">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`bg-white border ${
          error
            ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/20"
            : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10"
        } text-slate-800 rounded-lg px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-slate-400`}
        {...props}
      />
      {error && <span className="text-xs text-rose-500 font-medium mt-0.5">{error}</span>}
    </div>
  );
};

export default Input;
