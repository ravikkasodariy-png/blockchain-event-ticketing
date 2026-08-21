import React, { useState } from 'react';
import { Search, PlusCircle, Calendar } from 'lucide-react';
import EventCard from '../components/EventCard';
import { GridSkeleton } from '../components/LoadingSkeleton';

export default function EventsView({
  events = [],
  isLoading,
  account,
  onNavigateCreate,
  onViewEvent,
  onBuyTicket
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'available', 'soldout', 'cancelled'

  const filteredEvents = events.filter((e) => {
    const titleMatch = e.name.toLowerCase().includes(searchTerm.toLowerCase());
    const descMatch = (e.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = titleMatch || descMatch;

    if (!matchesSearch) return false;

    const total = Number(e.totalTickets);
    const sold = Number(e.ticketsSold);
    const available = total - sold;
    const isSoldOut = available <= 0;

    if (filterType === 'available') return !isSoldOut;
    if (filterType === 'soldout') return isSoldOut;
    if (filterType === 'cancelled') return false; // In current contract events are active unless empty
    return true;
  });

  const filterTabs = [
    { id: 'all', label: `All (${events.length})` },
    { id: 'available', label: 'Available' },
    { id: 'soldout', label: 'Sold Out' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Events</h2>
          <p className="text-sm text-secondary-text mt-0.5">
            Manage and explore available events.
          </p>
        </div>

        <button
          onClick={onNavigateCreate}
          className="btn-primary self-start sm:self-auto text-xs py-2"
        >
          <PlusCircle size={15} />
          <span>Create Event</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            className="input-field pl-9 text-xs"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-border self-start sm:self-auto">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                filterType === tab.id
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid or Skeletons or Empty state */}
      {isLoading && events.length === 0 ? (
        <GridSkeleton count={6} />
      ) : filteredEvents.length === 0 ? (
        <div className="card-base p-12 text-center max-w-lg mx-auto">
          <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
            <Calendar size={20} />
          </div>
          <h3 className="text-sm font-bold text-slate-900">
            {events.length === 0 ? 'No events found on blockchain' : 'No matching events'}
          </h3>
          <p className="text-xs text-secondary-text mt-1">
            {events.length === 0
              ? 'Get started by deploying the first event to the smart contract.'
              : 'Try clearing your search query or switching filters.'}
          </p>
          {events.length === 0 && (
            <button
              onClick={onNavigateCreate}
              className="btn-primary mt-4 text-xs py-1.5"
            >
              <PlusCircle size={14} />
              <span>Create Event</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEvents.map((event) => (
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
  );
}
