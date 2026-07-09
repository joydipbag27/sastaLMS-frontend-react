import React from "react";

const Card = ({ title, subtitle, children, className = "" }) => {
  return (
    <div className={`bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-slate-100 shadow-[0_12px_40px_rgba(0,0,0,0.02)] ${className}`}>
      {(title || subtitle) && (
        <div className="border-b border-slate-100 pb-4 mb-4">
          {title && <h3 className="text-lg font-bold font-outfit text-indigo-650 tracking-wide">{title}</h3>}
          {subtitle && <p className="text-xs text-slate-500 mt-1 font-sans">{subtitle}</p>}
        </div>
      )}
      <div className="space-y-4 font-sans text-slate-700">{children}</div>
    </div>
  );
};

export default Card;
