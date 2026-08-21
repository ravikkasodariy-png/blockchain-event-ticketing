import React from 'react';
import { ethers } from 'ethers';
import { X, Send, XCircle, User, Calendar, ShieldCheck } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function TicketDetailsModal({ ticket, onClose, onOpenTransfer, onOpenCancel }) {
  if (!ticket) return null;

  const priceFormatted = ticket.ticketPrice ? ethers.formatEther(ticket.ticketPrice) : '0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
      <div
        className="bg-white border border-border rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-semibold text-slate-900">
              Ticket #{ticket.ticketId}
            </h3>
            <StatusBadge status="VALID" />
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-secondary-text">
              Event
            </span>
            <h4 className="text-base font-bold text-slate-900 mt-0.5">{ticket.eventName}</h4>
            <p className="text-xs text-slate-600 mt-1 whitespace-pre-line">
              {ticket.eventDescription || 'No description provided.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-100 rounded-lg text-xs">
            <div>
              <span className="text-secondary-text">Event ID</span>
              <p className="font-semibold text-slate-900 mt-0.5">#{ticket.eventId}</p>
            </div>
            <div>
              <span className="text-secondary-text">Price Paid</span>
              <p className="font-semibold text-slate-900 mt-0.5">{priceFormatted} ETH</p>
            </div>
            <div className="col-span-2 pt-2 border-t border-slate-200">
              <span className="text-secondary-text">Current Owner</span>
              <p className="font-mono text-slate-900 text-xs mt-0.5 break-all">{ticket.owner}</p>
            </div>
            <div className="col-span-2">
              <span className="text-secondary-text">Organizer</span>
              <p className="font-mono text-slate-900 text-xs mt-0.5 break-all">{ticket.organizer}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-border flex items-center justify-between">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenTransfer(ticket);
              }}
              className="btn-secondary text-xs py-1.5"
            >
              <Send size={14} />
              <span>Transfer</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenCancel(ticket);
              }}
              className="btn-danger text-xs py-1.5"
            >
              <XCircle size={14} />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
