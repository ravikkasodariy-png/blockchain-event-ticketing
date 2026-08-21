import React from 'react';

export default function StatusBadge({ status, className = '' }) {
  const normalized = (status || '').toUpperCase();

  let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';

  if (normalized === 'VALID' || normalized === 'AVAILABLE') {
    badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (normalized === 'SOLD OUT' || normalized === 'CANCELLED' || normalized === 'INVALID') {
    badgeStyle = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (normalized === 'USED' || normalized === 'COMPLETED') {
    badgeStyle = 'bg-slate-100 text-slate-600 border-slate-200';
  } else if (normalized === 'PENDING') {
    badgeStyle = 'bg-amber-50 text-amber-700 border-amber-200';
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-md border tracking-wide uppercase ${badgeStyle} ${className}`}
    >
      {normalized}
    </span>
  );
}
