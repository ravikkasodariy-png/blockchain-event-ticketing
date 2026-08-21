import React from 'react';
import { CheckCircle2, AlertCircle, Loader2, X, ExternalLink } from 'lucide-react';

export default function Notification({ notification, onClose }) {
  if (!notification || !notification.message) return null;

  const { type = 'info', title, message, txHash } = notification;

  return (
    <div className="toast-container">
      <div className={`toast ${type}`}>
        <div className="toast-icon">
          {type === 'success' && <CheckCircle2 size={20} />}
          {type === 'error' && <AlertCircle size={20} />}
          {type === 'loading' && <Loader2 size={20} className="spinner" />}
        </div>
        <div className="toast-content">
          {title && <div className="toast-title">{title}</div>}
          <div className="toast-message">{message}</div>
          {txHash && (
            <div style={{ marginTop: '0.4rem', fontSize: '0.8rem' }}>
              <span style={{ color: '#9ca3af' }}>Tx: {txHash.substring(0, 10)}...{txHash.substring(txHash.length - 8)}</span>
            </div>
          )}
        </div>
        {onClose && type !== 'loading' && (
          <button className="toast-close" onClick={onClose}>
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
