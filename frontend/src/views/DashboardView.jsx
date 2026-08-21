import React from 'react';
import { Calendar, Ticket, ShoppingBag, ShieldCheck, ArrowRight, PlusCircle } from 'lucide-react';
import StatCard from '../components/StatCard';
import EventCard from '../components/EventCard';
import { GridSkeleton } from '../components/LoadingSkeleton';
import { HARDHAT_CHAIN_ID_DECIMAL } from '../blockchain/contract';

export default function DashboardView({
  events = [],
  userTickets = [],
  isLoading,
  account,
  chainId,
  onNavigate,
  onViewEvent,
  onBuyTicket
}) {
  const totalEvents = events.length;
  const myTicketsCount = userTickets.length;
  const totalTicketsSold = events.reduce((acc, curr) => acc + Number(curr.ticketsSold || 0), 0);
  const isHardhat = chainId === HARDHAT_CHAIN_ID_DECIMAL;

  // Recent 3 events
  const recentEvents = events.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Dashboard</h2>
        <p className="text-sm text-secondary-text mt-1">
          Manage your events, tickets, and blockchain activity.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Events"
          value={totalEvents}
          subtitle="On-chain smart contract"
          icon={Calendar}
        />
        <StatCard
          title="My Tickets"
          value={account ? myTicketsCount : '0'}
          subtitle={account ? 'Owned by active wallet' : 'Connect wallet to view'}
          icon={Ticket}
        />
        <StatCard
          title="Tickets Sold"
          value={totalTicketsSold}
          subtitle="Across all active events"
          icon={ShoppingBag}
        />
        <StatCard
          title="Blockchain"
          value={account ? (isHardhat ? 'Connected' : 'Wrong Chain') : 'Disconnected'}
          subtitle={account ? (isHardhat ? 'Hardhat Local (31337)' : 'Switch to Localhost') : 'MetaMask offline'}
          icon={ShieldCheck}
          statusColor={account && isHardhat ? 'green' : 'gray'}
        />
      </div>

      {/* Recent Events Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Events</h3>
            <p className="text-xs text-secondary-text">Explore the latest events deployed to Ethereum.</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('events')}
            className="text-xs font-semibold text-slate-900 hover:text-slate-600 flex items-center gap-1 transition-colors"
          >
            <span>View all events</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {isLoading ? (
          <GridSkeleton count={3} />
        ) : recentEvents.length === 0 ? (
          <div className="card-base p-8 text-center">
            <h4 className="text-sm font-semibold text-slate-900">No events yet</h4>
            <p className="text-xs text-secondary-text mt-1">
              Create your first event on the blockchain to get started.
            </p>
            <button
              onClick={() => onNavigate('create')}
              className="btn-primary mt-4 text-xs py-1.5"
            >
              <PlusCircle size={14} />
              <span>Create Event</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onViewEvent={onViewEvent}
                onBuyTicket={onBuyTicket}
                account={account}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions & Account Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Quick Actions */}
        <div className="card-base p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Quick Actions</h3>
          <p className="text-xs text-secondary-text mb-4">Common tasks and shortcuts.</p>
          
          <div className="space-y-2.5">
            <button
              onClick={() => onNavigate('create')}
              className="w-full flex items-center justify-between p-3 rounded-lg border border-border bg-slate-50 hover:bg-slate-100 transition-colors text-left"
            >
              <div>
                <span className="text-xs font-semibold text-slate-900 block">Host a New Event</span>
                <span className="text-[11px] text-secondary-text">Deploy ticket smart contract configuration</span>
              </div>
              <ArrowRight size={14} className="text-slate-400" />
            </button>

            <button
              onClick={() => onNavigate('tickets')}
              className="w-full flex items-center justify-between p-3 rounded-lg border border-border bg-slate-50 hover:bg-slate-100 transition-colors text-left"
            >
              <div>
                <span className="text-xs font-semibold text-slate-900 block">Manage My Tickets</span>
                <span className="text-[11px] text-secondary-text">View passes, transfer ownership, or cancel</span>
              </div>
              <ArrowRight size={14} className="text-slate-400" />
            </button>

            <button
              onClick={() => onNavigate('organizer')}
              className="w-full flex items-center justify-between p-3 rounded-lg border border-border bg-slate-50 hover:bg-slate-100 transition-colors text-left"
            >
              <div>
                <span className="text-xs font-semibold text-slate-900 block">Ticket Gatekeeper Verification</span>
                <span className="text-[11px] text-secondary-text">Verify attendee ticket validity before entry</span>
              </div>
              <ArrowRight size={14} className="text-slate-400" />
            </button>
          </div>
        </div>

        {/* Blockchain Status Summary */}
        <div className="card-base p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Blockchain Summary</h3>
          <p className="text-xs text-secondary-text mb-4">Current Ethereum node parameters.</p>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-secondary-text">Smart Contract</span>
              <span className="font-semibold text-slate-900">EventTicketing.sol (v0.8.24)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-secondary-text">Network RPC</span>
              <span className="font-mono text-slate-800">http://127.0.0.1:8545</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-secondary-text">Target Chain ID</span>
              <span className="font-mono text-slate-800">31337 (Localhost)</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-secondary-text">Payment Currency</span>
              <span className="font-semibold text-slate-900">ETH (Ethereum Native)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
