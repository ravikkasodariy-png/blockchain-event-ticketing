import React from 'react';

export function CardSkeleton() {
  return (
    <div className="card-base p-5 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="h-5 bg-slate-200 rounded w-3/4 mb-3"></div>
        <div className="h-5 bg-slate-200 rounded w-16"></div>
      </div>
      <div className="space-y-2 mt-3">
        <div className="h-3.5 bg-slate-200 rounded w-full"></div>
        <div className="h-3.5 bg-slate-200 rounded w-5/6"></div>
      </div>
      <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
        <div className="h-4 bg-slate-200 rounded w-24"></div>
        <div className="h-8 bg-slate-200 rounded w-24"></div>
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export default CardSkeleton;
