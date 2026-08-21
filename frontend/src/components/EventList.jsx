import React, { useState } from 'react';
import { Search, RefreshCw, Calendar, Sparkles, Filter, Ticket } from 'lucide-react';
import EventCard from './EventCard';

export default function EventList({
  events,
  isLoading,
  account,
  onBuyTicket,
  buyingEventId,
  onRefresh,
  onNavigateCreate
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'available', 'soldout'

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.description.toLowerCase().includes(searchTerm.toLowerCase());

    const available = Number(e.totalTickets) - Number(e.ticketsSold);
    const isSoldOut = available <= 0;

    if (!matchesSearch) return false;
    if (filterType === 'available') return !isSoldOut;
    if (filterType === 'soldout') return isSoldOut;
    return true;
  });

  const totalEvents = events.length;
  const totalTickets = events.reduce((acc, curr) => acc + Number(curr.totalTickets), 0);
  const totalTicketsSold = events.reduce((acc, curr) => acc + Number(curr.ticketsSold), 0);

  return (
    <div>
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-tag">
          <Sparkles size={14} />
          <span>Decentralized & Transparent</span>
        </div>
        <h1 className="hero-title">On-Chain Event Tickets</h1>
        <p className="hero-subtitle">
          Discover exclusive conferences, hackathons, and web3 workshops.
          Every ticket is securely verified and stored directly on Ethereum.
        </p>

        {/* Global Stats */}
        <div className="hero-stats">
          <div className="hero-stat-item">
            <span className="hero-stat-value">{totalEvents}</span>
            <span className="hero-stat-label">Live Events</span>
          </div>
          <div className="hero-stat-item">
            <span className="hero-stat-value">{totalTicketsSold}</span>
            <span className="hero-stat-label">Tickets Sold</span>
          </div>
          <div className="hero-stat-item">
            <span className="hero-stat-value">{totalTickets}</span>
            <span className="hero-stat-label">Total Capacity</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="form-input"
            placeholder="Search events by title or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            className={`btn btn-sm ${filterType === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterType('all')}
          >
            All ({events.length})
          </button>
          <button
            className={`btn btn-sm ${filterType === 'available' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterType('available')}
          >
            Available
          </button>
          <button
            className={`btn btn-sm ${filterType === 'soldout' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterType('soldout')}
          >
            Sold Out
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={onRefresh}
            title="Refresh events from blockchain"
          >
            <RefreshCw size={15} className={isLoading ? 'spinner' : ''} />
          </button>
        </div>
      </div>

      {/* Events Grid or States */}
      {isLoading && events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div className="spinner spinner-lg" style={{ color: 'var(--primary)', margin: '0 auto 1.5rem' }}></div>
          <p style={{ color: 'var(--text-muted)' }}>Loading events directly from the blockchain smart contract...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎟️</div>
          <h3 className="empty-title">
            {events.length === 0 ? 'No Events on Blockchain Yet' : 'No Matching Events Found'}
          </h3>
          <p className="empty-desc">
            {events.length === 0
              ? 'Be the first organizer to create a Web3 event on this contract!'
              : 'Try adjusting your search query or filter settings.'}
          </p>
          {events.length === 0 && (
            <button className="btn btn-primary" onClick={onNavigateCreate}>
              <Ticket size={18} />
              <span>Create an Event</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid-cards">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              account={account}
              onBuyTicket={onBuyTicket}
              isBuying={buyingEventId === event.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
