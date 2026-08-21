import React from 'react';
import { ethers } from 'ethers';
import { X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function CancelModal({ ticket, onClose, onConfirm, isCancelling }) {
  if (!ticket) return null;

  const refundFormatted = ticket.ticketPrice ? ethers.formatEther(ticket.ticketPrice) : '0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
      <div
        className="bg-white border border-border rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">
            Cancel Ticket #{ticket.ticketId}
          </h3>
          <button
            onClick={onClose}
            disabled={isCancelling}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-700">
            Are you sure you want to cancel your ticket for <strong>{ticket.eventName}</strong>?
          </p>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2.5">
            <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900 leading-relaxed">
              <span className="font-semibold">Automated ETH Refund:</span> The smart contract will immediately transfer <strong>{refundFormatted} ETH</strong> back to your wallet.
            </div>
          </div>

          <p className="text-xs text-secondary-text">
            Once cancelled on the blockchain, this ticket will become invalid and cannot be reinstated.
          </p>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-border flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isCancelling}
            className="btn-secondary"
          >
            Keep Ticket
          </button>
          <button
            type="button"
            onClick={() => onConfirm(ticket.ticketId)}
            disabled={isCancelling}
            className="btn-danger"
          >
            {isCancelling ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Processing Refund...</span>
              </>
            ) : (
              <span>Confirm Refund ({refundFormatted} ETH)</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
