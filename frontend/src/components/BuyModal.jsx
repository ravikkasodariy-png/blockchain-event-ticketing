import React from 'react';
import { ethers } from 'ethers';
import { X, Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function BuyModal({ event, onClose, onConfirm, isBuying, buyStep }) {
  if (!event) return null;

  const priceFormatted = ethers.formatEther(event.ticketPrice);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
      <div
        className="bg-white border border-border rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">
            Confirm Ticket Purchase
          </h3>
          <button
            onClick={onClose}
            disabled={isBuying}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg space-y-2.5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-secondary-text">Event</span>
              <span className="font-semibold text-slate-900">{event.name}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-secondary-text">Ticket Price</span>
              <span className="font-bold text-slate-900">{priceFormatted} ETH</span>
            </div>
            <div className="flex justify-between items-center text-xs text-secondary-text pt-2 border-t border-slate-200">
              <span>Network</span>
              <span>Ethereum (Localhost 31337)</span>
            </div>
          </div>

          {/* Status Alert if in progress */}
          {isBuying ? (
            <div className="p-3 bg-slate-100 border border-slate-200 rounded-lg flex items-center gap-3">
              <Loader2 size={18} className="animate-spin text-slate-700 flex-shrink-0" />
              <p className="text-xs text-slate-700">
                {buyStep === 'waiting' && 'Waiting for wallet confirmation in MetaMask...'}
                {buyStep === 'mining' && 'Transaction submitted. Awaiting block confirmation...'}
                {!buyStep && 'Processing transaction on the blockchain...'}
              </p>
            </div>
          ) : (
            <p className="text-xs text-secondary-text">
              By confirming, MetaMask will prompt you to transfer <strong>{priceFormatted} ETH</strong> to the smart contract. A unique Ticket ID will be minted to your wallet.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-border flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isBuying}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(event.id, event.ticketPrice)}
            disabled={isBuying}
            className="btn-primary"
          >
            {isBuying ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>Confirm Purchase</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
