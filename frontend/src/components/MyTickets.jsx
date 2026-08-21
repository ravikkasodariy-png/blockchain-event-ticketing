import React, { useState } from 'react';
import { ethers } from 'ethers';
import { Ticket, Send, XCircle, AlertTriangle, Loader2, Sparkles } from 'lucide-react';
import TransferModal from './TransferModal';

export default function MyTickets({
  tickets,
  isLoading,
  account,
  onConnectWallet,
  onCancelTicket,
  cancellingTicketId,
  onTransferTicket,
  transferringTicketId,
  onNavigateEvents
}) {
  const [selectedTicketForTransfer, setSelectedTicketForTransfer] = useState(null);
  const [ticketToCancel, setTicketToCancel] = useState(null);

  if (!account) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🔒</div>
        <h3 className="empty-title">Wallet Not Connected</h3>
        <p className="empty-desc">
          Connect your MetaMask wallet to view your purchased tickets, transfer them, or request refunds.
        </p>
        <button className="btn btn-primary" onClick={onConnectWallet}>
          Connect MetaMask Wallet
        </button>
      </div>
    );
  }

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>My Event Tickets</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Manage your verified on-chain passes. You can transfer them to another wallet or cancel for an automatic ETH refund.
        </p>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div className="spinner spinner-lg" style={{ color: 'var(--primary)', margin: '0 auto 1.5rem' }}></div>
          <p style={{ color: 'var(--text-muted)' }}>Retrieving your tickets from the smart contract...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎟️</div>
          <h3 className="empty-title">You don't own any tickets yet</h3>
          <p className="empty-desc">
            Explore live events and buy your first decentralized event pass with ETH!
          </p>
          <button className="btn btn-primary" onClick={onNavigateEvents}>
            <Sparkles size={16} />
            <span>Browse Events</span>
          </button>
        </div>
      ) : (
        <div className="grid-cards">
          {tickets.map((t) => {
            const isCancelling = cancellingTicketId === t.ticketId;
            const priceFormatted = t.ticketPrice ? ethers.formatEther(t.ticketPrice) : '0';

            return (
              <div key={t.ticketId} className="ticket-pass">
                {/* Header */}
                <div className="ticket-pass-header">
                  <span className="ticket-id-tag">PASS #{t.ticketId}</span>
                  <span className="badge badge-success">VALID PASS</span>
                </div>

                {/* Body */}
                <div className="ticket-pass-body">
                  <h3 className="ticket-event-name">{t.eventName}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    {t.eventDescription || 'No description'}
                  </p>

                  <div className="ticket-meta-grid">
                    <div className="ticket-meta-item">
                      <span className="ticket-meta-label">Event ID</span>
                      <span className="ticket-meta-value">#{t.eventId}</span>
                    </div>
                    <div className="ticket-meta-item">
                      <span className="ticket-meta-label">Ticket Price</span>
                      <span className="ticket-meta-value" style={{ color: '#38bdf8' }}>
                        {priceFormatted} ETH
                      </span>
                    </div>
                    <div className="ticket-meta-item" style={{ gridColumn: 'span 2' }}>
                      <span className="ticket-meta-label">Organizer</span>
                      <span className="ticket-meta-value" style={{ fontSize: '0.8rem' }}>
                        {formatAddress(t.organizer)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer / Actions */}
                <div className="ticket-pass-footer">
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => setSelectedTicketForTransfer(t)}
                    disabled={isCancelling}
                  >
                    <Send size={14} />
                    <span>Transfer</span>
                  </button>

                  <button
                    className="btn btn-danger btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => setTicketToCancel(t)}
                    disabled={isCancelling}
                  >
                    {isCancelling ? (
                      <>
                        <Loader2 size={14} className="spinner" />
                        <span>Cancelling...</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={14} />
                        <span>Cancel (Refund)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Transfer Modal */}
      {selectedTicketForTransfer && (
        <TransferModal
          ticket={selectedTicketForTransfer}
          onClose={() => setSelectedTicketForTransfer(null)}
          onTransfer={(ticketId, to) => {
            onTransferTicket(ticketId, to);
            setSelectedTicketForTransfer(null);
          }}
          isTransferring={transferringTicketId === selectedTicketForTransfer.ticketId}
        />
      )}

      {/* Cancel Confirmation Modal */}
      {ticketToCancel && (
        <div className="modal-overlay" onClick={() => setTicketToCancel(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Cancel Ticket #{ticketToCancel.ticketId}?</h3>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                Are you sure you want to cancel your ticket for <strong>{ticketToCancel.eventName}</strong>?
              </p>
              <div
                style={{
                  background: 'var(--success-bg)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.75rem 1rem',
                  fontSize: '0.85rem',
                  color: '#6ee7b7'
                }}
              >
                ✓ You will receive an immediate refund of{' '}
                <strong>{ethers.formatEther(ticketToCancel.ticketPrice)} ETH</strong> back to your wallet.
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setTicketToCancel(null)}
              >
                Keep Ticket
              </button>
              <button
                className="btn btn-danger"
                onClick={() => {
                  const id = ticketToCancel.ticketId;
                  setTicketToCancel(null);
                  onCancelTicket(id);
                }}
              >
                Confirm Cancellation & Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
