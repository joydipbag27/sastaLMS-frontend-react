import React from "react";

const Card = ({ title, subtitle, children, className = "" }) => {
  return (
    <div className={`bg-slate-950 p-5 rounded-lg border border-slate-800 shadow-md ${className}`}>
      {(title || subtitle) && (
        <div className="border-b border-slate-800/80 pb-3 mb-4">
          {title && <h3 className="text-base font-bold text-sky-400">{title}</h3>}
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
};

export default Card;
