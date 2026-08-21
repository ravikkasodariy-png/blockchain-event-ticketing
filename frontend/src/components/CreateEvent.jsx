import React, { useState } from 'react';
import { PlusCircle, Loader2, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function CreateEvent({
  onCreateEvent,
  isCreating,
  account,
  onConnectWallet
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [totalTickets, setTotalTickets] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!account) {
      setError('Please connect your MetaMask wallet first.');
      return;
    }

    if (!name.trim()) {
      setError('Please enter an event name.');
      return;
    }

    if (!price || isNaN(price) || parseFloat(price) < 0) {
      setError('Please enter a valid ticket price (in ETH).');
      return;
    }

    if (!totalTickets || isNaN(totalTickets) || parseInt(totalTickets, 10) <= 0) {
      setError('Total tickets must be at least 1.');
      return;
    }

    onCreateEvent({
      name: name.trim(),
      description: description.trim(),
      price: price.trim(),
      totalTickets: parseInt(totalTickets, 10)
    });
  };

  return (
    <div className="form-container">
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <h2 className="form-title">Create New Event</h2>
        <p className="form-subtitle">
          Deploy a new event directly to the smart contract. You will be set as the event organizer.
        </p>
      </div>

      {error && (
        <div className="toast error" style={{ marginBottom: '1.5rem', animation: 'none' }}>
          <AlertCircle size={18} className="toast-icon" />
          <div className="toast-content">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Event Name */}
        <div className="form-group">
          <label className="form-label">Event Name *</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Ethereum Developers Conference 2026"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isCreating}
            required
          />
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label">Event Description</label>
          <textarea
            className="form-textarea"
            rows="3"
            placeholder="Describe your event, topics covered, schedule, venue, etc."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isCreating}
          />
        </div>

        <div className="form-row">
          {/* Ticket Price in ETH */}
          <div className="form-group">
            <label className="form-label">Ticket Price (ETH) *</label>
            <input
              type="number"
              step="0.0001"
              min="0"
              className="form-input"
              placeholder="e.g. 0.02"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={isCreating}
              required
            />
            <span className="form-helper">In ETH (e.g. 0.01 = ~10000000000000000 wei)</span>
          </div>

          {/* Total Tickets */}
          <div className="form-group">
            <label className="form-label">Total Tickets Capacity *</label>
            <input
              type="number"
              step="1"
              min="1"
              className="form-input"
              placeholder="e.g. 100"
              value={totalTickets}
              onChange={(e) => setTotalTickets(e.target.value)}
              disabled={isCreating}
              required
            />
            <span className="form-helper">Maximum attendees allowed</span>
          </div>
        </div>

        {/* Action Button */}
        {account ? (
          <button
            type="submit"
            className="btn btn-primary btn-block"
            style={{ marginTop: '1rem', padding: '0.85rem' }}
            disabled={isCreating}
          >
            {isCreating ? (
              <>
                <Loader2 size={18} className="spinner" />
                <span>Creating Event on Blockchain...</span>
              </>
            ) : (
              <>
                <PlusCircle size={18} />
                <span>Create Event on Blockchain</span>
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary btn-block"
            style={{ marginTop: '1rem', padding: '0.85rem' }}
            onClick={onConnectWallet}
          >
            <span>Connect Wallet to Create Event</span>
          </button>
        )}
      </form>
    </div>
  );
}
