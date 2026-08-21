import React from 'react';
import { CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';

export default function Toast({ notification, onClose }) {
  if (!notification || !notification.message) return null;

  const { type = 'info', title, message, txHash } = notification;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full px-4 sm:px-0">
      <div className="bg-white border border-border rounded-lg shadow-lg p-4 flex items-start gap-3 transition-all animate-in fade-in slide-in-from-bottom-2">
        <div className="flex-shrink-0 mt-0.5">
          {type === 'success' && <CheckCircle2 size={18} className="text-emerald-600" />}
          {type === 'error' && <AlertCircle size={18} className="text-red-600" />}
          {type === 'loading' && <Loader2 size={18} className="text-slate-700 animate-spin" />}
          {type === 'info' && <AlertCircle size={18} className="text-slate-700" />}
        </div>

        <div className="flex-1 min-w-0">
          {title && <h4 className="text-sm font-semibold text-slate-900">{title}</h4>}
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{message}</p>
          {txHash && (
            <p className="text-xs font-mono text-slate-400 mt-1">
              Tx: {txHash.substring(0, 10)}...{txHash.substring(txHash.length - 8)}
            </p>
          )}
        </div>

        {onClose && type !== 'loading' && (
          <button
            onClick={onClose}
            className="flex-shrink-0 text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
          >
            <X size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
