import React from "react";

const Card = ({ title, subtitle, children, className = "" }) => {
  return (
    <div className={`bg-gradient-to-br from-slate-900/95 to-slate-950/95 backdrop-blur-md p-6 rounded-xl border border-slate-800/70 shadow-lg shadow-black/30 ${className}`}>
      {(title || subtitle) && (
        <div className="border-b border-slate-800/60 pb-4 mb-4">
          {title && <h3 className="text-lg font-bold font-outfit text-sky-400 tracking-wide">{title}</h3>}
          {subtitle && <p className="text-xs text-slate-400 mt-1 font-sans">{subtitle}</p>}
        </div>
      )}
      <div className="space-y-4 font-sans">{children}</div>
    </div>
  );
};

export default Card;
