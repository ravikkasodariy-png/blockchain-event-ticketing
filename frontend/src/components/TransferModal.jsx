import React, { useState } from 'react';
import { ethers } from 'ethers';
import { X, Loader2, Send, AlertTriangle } from 'lucide-react';

export default function TransferModal({ ticket, onClose, onTransfer, isTransferring }) {
  const [recipient, setRecipient] = useState('');
  const [error, setError] = useState('');

  if (!ticket) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const clean = recipient.trim();
    if (!clean) {
      setError('Please enter a recipient address.');
      return;
    }
    if (!ethers.isAddress(clean)) {
      setError('Invalid Ethereum address. Please verify the format.');
      return;
    }
    if (clean.toLowerCase() === ticket.owner.toLowerCase()) {
      setError('Cannot transfer ticket to your own wallet.');
      return;
    }

    onTransfer(ticket.ticketId, clean);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
      <div
        className="bg-white border border-border rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">
            Transfer Ticket #{ticket.ticketId}
          </h3>
          <button
            onClick={onClose}
            disabled={isTransferring}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <p className="text-xs text-secondary-text">Event</p>
              <p className="text-sm font-semibold text-slate-900">{ticket.eventName}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-secondary-text mb-1.5">
                Recipient Wallet Address *
              </label>
              <input
                type="text"
                className="input-field font-mono text-xs"
                placeholder="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                disabled={isTransferring}
                autoFocus
              />
              {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5">
              <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 leading-relaxed">
                This transaction directly transfers on-chain ownership. The recipient will be the sole recognized ticket holder.
              </p>
            </div>
          </div>

          <div className="px-6 py-4 bg-slate-50 border-t border-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isTransferring}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isTransferring}
              className="btn-primary"
            >
              {isTransferring ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Transferring...</span>
                </>
              ) : (
                <>
                  <Send size={15} />
                  <span>Transfer Ticket</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
