import React, { useState } from 'react';
import { PlusCircle, Loader2, AlertCircle, Wallet } from 'lucide-react';

export default function CreateEventView({
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
      setError('Please connect your MetaMask wallet before creating an event.');
      return;
    }

    if (!name.trim()) {
      setError('Please enter an event name.');
      return;
    }

    if (!price || isNaN(price) || parseFloat(price) < 0) {
      setError('Please enter a valid ticket price in ETH (e.g. 0.02).');
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Create Event</h2>
        <p className="text-sm text-secondary-text mt-0.5">
          Publish a new event to the blockchain smart contract.
        </p>
      </div>

      <div className="card-base p-6 sm:p-8">
        {error && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-700">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-rose-600" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Event Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-text mb-1.5">
              Event Name *
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Developer Hackathon 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isCreating}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-text mb-1.5">
              Description
            </label>
            <textarea
              className="input-field min-h-[90px]"
              rows="3"
              placeholder="Provide event details, schedule, agenda, or prerequisites."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isCreating}
            />
          </div>

          {/* Price & Total Tickets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-text mb-1.5">
                Ticket Price (ETH) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.0001"
                  min="0"
                  className="input-field pr-12 font-mono"
                  placeholder="0.05"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={isCreating}
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                  ETH
                </span>
              </div>
              <p className="text-[11px] text-secondary-text mt-1">Price attendees pay per pass.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-text mb-1.5">
                Total Tickets *
              </label>
              <input
                type="number"
                step="1"
                min="1"
                className="input-field font-mono"
                placeholder="100"
                value={totalTickets}
                onChange={(e) => setTotalTickets(e.target.value)}
                disabled={isCreating}
                required
              />
              <p className="text-[11px] text-secondary-text mt-1">Maximum capacity allowed.</p>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            {account ? (
              <button
                type="submit"
                disabled={isCreating}
                className="btn-primary w-full sm:w-auto"
              >
                {isCreating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Creating event...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle size={16} />
                    <span>Create Event</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={onConnectWallet}
                className="btn-primary w-full sm:w-auto"
              >
                <Wallet size={16} />
                <span>Connect Wallet to Create Event</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
