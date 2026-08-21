import React from 'react';
import { ethers } from 'ethers';
import { User, Eye, ShoppingBag } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function EventCard({
  event,
  onViewEvent,
  onBuyTicket,
  account
}) {
  const { id, name, description, ticketPrice, totalTickets, ticketsSold, organizer } = event;
  const total = Number(totalTickets);
  const sold = Number(ticketsSold);
  const remaining = Math.max(0, total - sold);
  const isSoldOut = remaining === 0;
  const priceFormatted = ethers.formatEther(ticketPrice);

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const isOrganizer = account && organizer && account.toLowerCase() === organizer.toLowerCase();

  return (
    <div className="card-base p-5 flex flex-col justify-between transition duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300">
      <div>
        {/* Top line: Tag & Status */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Event #{id}
          </span>
          <StatusBadge status={isSoldOut ? 'SOLD OUT' : 'AVAILABLE'} />
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-1">
          {name}
        </h3>

        {/* Description */}
        <p className="mt-2 text-xs text-secondary-text leading-relaxed line-clamp-2 min-h-[2.5rem]">
          {description || 'No description provided.'}
        </p>

        {/* Key Metrics */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-secondary-text block">Price</span>
            <span className="text-sm font-bold text-slate-900">
              {priceFormatted} ETH
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs text-secondary-text block">Remaining</span>
            <span className="text-xs font-semibold text-slate-800">
              {remaining} <span className="font-normal text-slate-400">/ {total}</span>
            </span>
          </div>
        </div>

        {/* Organizer */}
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <User size={13} className="text-slate-400" />
            Organizer: <span className="font-mono text-slate-700">{formatAddress(organizer)}</span>
          </span>
          {isOrganizer && (
            <span className="text-[10px] font-medium bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
              You
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onViewEvent(event)}
          className="btn-secondary flex-1 py-1.5 text-xs"
        >
          <Eye size={14} />
          <span>View Event</span>
        </button>
        <button
          type="button"
          onClick={() => onBuyTicket(event)}
          disabled={isSoldOut}
          className="btn-primary flex-1 py-1.5 text-xs"
        >
          <ShoppingBag size={14} />
          <span>{isSoldOut ? 'Sold Out' : 'Buy Ticket'}</span>
        </button>
      </div>
    </div>
  );
}
