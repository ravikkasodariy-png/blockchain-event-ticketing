import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, statusColor }) {
  return (
    <div className="card-base p-5 transition duration-150 hover:border-slate-300">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-secondary-text">
          {title}
        </span>
        {Icon && (
          <div className="p-2 rounded-md bg-slate-100 text-slate-600">
            <Icon size={18} />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-slate-900 tracking-tight">
          {value}
        </span>
        {statusColor && (
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              statusColor === 'green' ? 'bg-emerald-500' : 'bg-slate-400'
            }`}
          />
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-secondary-text">
          {subtitle}
        </p>
      )}
    </div>
  );
}
