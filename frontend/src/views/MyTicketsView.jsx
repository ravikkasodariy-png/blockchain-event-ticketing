import React from 'react';
import { Ticket, Wallet, ArrowRight } from 'lucide-react';
import TicketCard from '../components/TicketCard';
import { GridSkeleton } from '../components/LoadingSkeleton';

export default function MyTicketsView({
  tickets = [],
  isLoading,
  account,
  onConnectWallet,
  onNavigateEvents,
  onViewTicket,
  onOpenTransfer,
  onOpenCancel
}) {
  if (!account) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">My Tickets</h2>
          <p className="text-sm text-secondary-text mt-0.5">
            View and manage tickets purchased with your connected wallet.
          </p>
        </div>

        <div className="card-base p-12 text-center max-w-md mx-auto">
          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
            <Wallet size={20} />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Wallet Disconnected</h3>
          <p className="text-xs text-secondary-text mt-1">
            Connect your MetaMask wallet to view your purchased tickets, transfers, and refunds.
          </p>
          <button
            onClick={onConnectWallet}
            className="btn-primary mt-4 text-xs py-1.5"
          >
            <Wallet size={14} />
            <span>Connect Wallet</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">My Tickets</h2>
          <p className="text-sm text-secondary-text mt-0.5">
            View and manage tickets purchased with your connected wallet.
          </p>
        </div>

        <span className="text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
          {tickets.length} {tickets.length === 1 ? 'Ticket' : 'Tickets'}
        </span>
      </div>

      {isLoading && tickets.length === 0 ? (
        <GridSkeleton count={3} />
      ) : tickets.length === 0 ? (
        <div className="card-base p-12 text-center max-w-md mx-auto">
          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
            <Ticket size={20} />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No tickets found</h3>
          <p className="text-xs text-secondary-text mt-1">
            Tickets purchased with this wallet will appear here.
          </p>
          <button
            onClick={onNavigateEvents}
            className="btn-secondary mt-4 text-xs py-1.5"
          >
            <span>Explore Events</span>
            <ArrowRight size={14} />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tickets.map((ticket) => (
            <TicketCard
              key={ticket.ticketId}
              ticket={ticket}
              onViewTicket={onViewTicket}
              onOpenTransfer={onOpenTransfer}
              onOpenCancel={onOpenCancel}
            />
          ))}
        </div>
      )}
    </div>
  );
}
