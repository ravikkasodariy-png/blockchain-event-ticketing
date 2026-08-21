import React from 'react';
import { ethers } from 'ethers';
import { Eye, Send, XCircle, User, Ticket as TicketIcon } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function TicketCard({
  ticket,
  onViewTicket,
  onOpenTransfer,
  onOpenCancel
}) {
  const { ticketId, eventId, eventName, owner, ticketPrice } = ticket;
  const priceFormatted = ticketPrice ? ethers.formatEther(ticketPrice) : '0';

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <div className="card-base p-5 flex flex-col justify-between transition duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono font-semibold text-slate-500">
            Ticket #{ticketId}
          </span>
          <StatusBadge status="VALID" />
        </div>

        <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-1">
          {eventName}
        </h3>

        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-secondary-text block">Event ID</span>
            <span className="font-semibold text-slate-800">#{eventId}</span>
          </div>
          <div className="text-right">
            <span className="text-secondary-text block">Price Paid</span>
            <span className="font-semibold text-slate-800">{priceFormatted} ETH</span>
          </div>
        </div>

        <div className="mt-3 text-xs text-secondary-text flex items-center gap-1.5">
          <User size={13} className="text-slate-400" />
          <span>Owner:</span>
          <span className="font-mono text-slate-700">{formatAddress(owner)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onViewTicket(ticket)}
          className="btn-secondary flex-1 py-1.5 text-xs"
        >
          <Eye size={13} />
          <span>View</span>
        </button>
        <button
          type="button"
          onClick={() => onOpenTransfer(ticket)}
          className="btn-secondary flex-1 py-1.5 text-xs"
        >
          <Send size={13} />
          <span>Transfer</span>
        </button>
        <button
          type="button"
          onClick={() => onOpenCancel(ticket)}
          className="btn-danger py-1.5 px-2.5 text-xs"
          title="Cancel ticket for automatic ETH refund"
        >
          <XCircle size={14} />
          <span>Cancel</span>
        </button>
      </div>
    </div>
  );
}
