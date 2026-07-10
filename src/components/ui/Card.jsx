import React from "react";

const Card = ({ title, subtitle, children, className = "" }) => {
  return (
    <div className={`bg-white p-6 rounded-xl border border-slate-200 shadow-sm ${className}`}>
      {(title || subtitle) && (
        <div className="border-b border-slate-100 pb-4 mb-4">
          {title && <h3 className="text-base font-bold font-outfit text-slate-800">{title}</h3>}
          {subtitle && <p className="text-xs text-slate-500 mt-1 font-sans">{subtitle}</p>}
        </div>
      )}
      <div className="space-y-4 font-sans text-slate-700">{children}</div>
    </div>
  );
};

export default Card;
