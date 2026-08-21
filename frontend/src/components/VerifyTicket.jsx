import React, { useState } from 'react';
import { ethers } from 'ethers';
import { ShieldCheck, ShieldAlert, Search, Loader2, CheckCircle2, XCircle, AlertCircle, User, Calendar, Tag } from 'lucide-react';
import { getContractReadOnly, parseBlockchainError } from '../blockchain/contract';

export default function VerifyTicket() {
  const [ticketIdInput, setTicketIdInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    const cleanId = ticketIdInput.trim();
    if (cleanId === '' || isNaN(cleanId) || parseInt(cleanId, 10) < 0) {
      setError('Please enter a valid numeric Ticket ID.');
      return;
    }

    setIsVerifying(true);
    try {
      const contract = getContractReadOnly();
      const id = parseInt(cleanId, 10);

      // Call verifyTicket
      const verification = await contract.verifyTicket(id);
      const [isValid, eventId, owner, isCancelled] = verification;

      const totalTicketsMinted = await contract.ticketCount();
      const exists = id < Number(totalTicketsMinted);

      let eventData = null;
      if (exists) {
        try {
          const eventRes = await contract.getFunction("getEvent")(eventId);
          eventData = {
            id: Number(eventId),
            name: eventRes.name,
            description: eventRes.description,
            ticketPrice: eventRes.ticketPrice,
            organizer: eventRes.organizer
          };
        } catch (eventErr) {
          console.warn('Could not fetch event details for verified ticket:', eventErr);
        }
      }

      setResult({
        ticketId: id,
        exists,
        isValid,
        eventId: Number(eventId),
        owner,
        isCancelled,
        event: eventData
      });
    } catch (err) {
      console.error('Ticket verification error:', err);
      setError(parseBlockchainError(err));
    } finally {
      setIsVerifying(false);
    }
  };

  const formatAddress = (addr) => {
    if (!addr || addr === ethers.ZeroAddress) return 'None';
    return addr;
  };

  return (
    <div className="form-container" style={{ maxWidth: '680px' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <div
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'var(--primary-glow)',
            color: '#a5b4fc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem'
          }}
        >
          <ShieldCheck size={28} />
        </div>
        <h2 className="form-title">Verify Ticket On-Chain</h2>
        <p className="form-subtitle">
          Query the Ethereum smart contract directly to verify authenticity, ownership, and cancellation status for any ticket ID.
        </p>
      </div>

      <form onSubmit={handleVerify}>
        <div className="form-group">
          <label className="form-label">Ticket ID *</label>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              type="number"
              min="0"
              step="1"
              className="form-input"
              placeholder="e.g. 0, 1, 2..."
              value={ticketIdInput}
              onChange={(e) => setTicketIdInput(e.target.value)}
              disabled={isVerifying}
              autoFocus
              required
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{ whiteSpace: 'nowrap', padding: '0.75rem 1.5rem' }}
              disabled={isVerifying}
            >
              {isVerifying ? (
                <>
                  <Loader2 size={16} className="spinner" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Search size={16} />
                  <span>Verify</span>
                </>
              )}
            </button>
          </div>
          <span className="form-helper">Ticket IDs are assigned sequentially starting from #0</span>
        </div>
      </form>

      {error && (
        <div className="toast error" style={{ marginTop: '1.5rem', animation: 'none' }}>
          <AlertCircle size={18} className="toast-icon" />
          <div className="toast-content">{error}</div>
        </div>
      )}

      {/* Verification Results */}
      {result && (
        <div className={`verify-result-box ${result.isValid ? 'valid' : 'invalid'}`}>
          {result.isValid ? (
            <>
              <div className="verify-status-title valid">
                <CheckCircle2 size={32} />
                <span>VERIFIED & VALID TICKET</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                This ticket is authentic, active, and confirmed on the blockchain ledger.
              </p>

              <table className="verify-details-table">
                <tbody>
                  <tr>
                    <td>Ticket ID</td>
                    <td>#{result.ticketId}</td>
                  </tr>
                  <tr>
                    <td>Status</td>
                    <td>
                      <span className="badge badge-success">Active & Valid</span>
                    </td>
                  </tr>
                  {result.event && (
                    <>
                      <tr>
                        <td>Event Name</td>
                        <td>{result.event.name}</td>
                      </tr>
                      <tr>
                        <td>Event ID</td>
                        <td>#{result.eventId}</td>
                      </tr>
                      <tr>
                        <td>Price Paid</td>
                        <td>{ethers.formatEther(result.event.ticketPrice)} ETH</td>
                      </tr>
                    </>
                  )}
                  <tr>
                    <td>Current Owner</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>
                      {result.owner}
                    </td>
                  </tr>
                </tbody>
              </table>
            </>
          ) : (
            <>
              <div className="verify-status-title invalid">
                <XCircle size={32} />
                <span>INVALID TICKET</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {!result.exists
                  ? `Ticket #${result.ticketId} has not been minted or does not exist on this contract.`
                  : result.isCancelled
                  ? `Ticket #${result.ticketId} was CANCELLED and refunded. It is no longer valid for admission.`
                  : `Ticket #${result.ticketId} could not be validated.`}
              </p>

              {result.exists && (
                <table className="verify-details-table">
                  <tbody>
                    <tr>
                      <td>Ticket ID</td>
                      <td>#{result.ticketId}</td>
                    </tr>
                    <tr>
                      <td>Status</td>
                      <td>
                        <span className="badge badge-danger">
                          {result.isCancelled ? 'Cancelled & Refunded' : 'Invalid'}
                        </span>
                      </td>
                    </tr>
                    {result.event && (
                      <tr>
                        <td>Associated Event</td>
                        <td>{result.event.name} (#{result.eventId})</td>
                      </tr>
                    )}
                    <tr>
                      <td>Previous Holder</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>
                        {formatAddress(result.owner)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
