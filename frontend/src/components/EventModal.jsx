import React from 'react';
import { ethers } from 'ethers';
import { X, User, Tag, Ticket, Shield } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function EventModal({ event, onClose, onOpenBuyModal, account }) {
  if (!event) return null;

  const { id, name, description, ticketPrice, totalTickets, ticketsSold, organizer } = event;
  const total = Number(totalTickets);
  const sold = Number(ticketsSold);
  const available = Math.max(0, total - sold);
  const isSoldOut = available === 0;
  const priceFormatted = ethers.formatEther(ticketPrice);
  const percentage = total > 0 ? Math.min(100, Math.round((sold / total) * 100)) : 0;

  const isOrganizer = account && organizer && account.toLowerCase() === organizer.toLowerCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
      <div
        className="bg-white border border-border rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-semibold text-slate-900">{name}</h3>
            <StatusBadge status={isSoldOut ? 'SOLD OUT' : 'AVAILABLE'} />
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-secondary-text">
              Description
            </span>
            <p className="mt-1 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {description || 'No description provided.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-100 rounded-lg">
            <div>
              <span className="text-xs text-secondary-text">Ticket Price</span>
              <p className="text-lg font-bold text-slate-900 mt-0.5">
                {priceFormatted} ETH
              </p>
            </div>
            <div>
              <span className="text-xs text-secondary-text">Tickets Available</span>
              <p className="text-lg font-bold text-slate-900 mt-0.5">
                {available} <span className="text-xs font-normal text-slate-500">/ {total}</span>
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-xs text-secondary-text mb-1">
              <span>Capacity Sold</span>
              <span>{percentage}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-slate-900 h-1.5 rounded-full transition-all"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <User size={14} className="text-slate-400" />
              Organizer: {organizer ? `${organizer.substring(0, 6)}...${organizer.substring(organizer.length - 4)}` : ''}
              {isOrganizer && <span className="text-xs text-slate-500 font-medium">(You)</span>}
            </span>
            <span className="font-mono text-slate-400">Event #{id}</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-border flex items-center justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onOpenBuyModal(event);
            }}
            disabled={isSoldOut}
            className="btn-primary"
          >
            {isSoldOut ? 'Sold Out' : 'Buy Ticket'}
          </button>
        </div>
      </div>
    </div>
  );
}
