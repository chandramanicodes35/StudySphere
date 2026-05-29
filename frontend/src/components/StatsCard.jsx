import React from 'react';

const StatsCard = ({ title, value, icon: Icon, description, trend, colorClass = 'text-indigo-400' }) => {
  return (
    <div className="glass-card p-6 flex items-start justify-between relative overflow-hidden group">
      {/* Dynamic hover backdrop overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-indigo-500/0 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="flex flex-col gap-2 min-w-0 z-10">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        <h3 className="text-3xl font-bold tracking-tight text-white">{value}</h3>
        {description && (
          <span className="text-xs text-slate-400 mt-1 truncate">{description}</span>
        )}
      </div>

      <div className={`p-3.5 rounded-2xl bg-dark-700/60 border border-slate-700/40 ${colorClass} shadow-md z-10 transition-transform duration-300 group-hover:scale-110`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};

export default StatsCard;
