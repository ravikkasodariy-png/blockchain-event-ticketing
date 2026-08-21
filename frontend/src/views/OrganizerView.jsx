import React, { useState } from 'react';
import { ethers } from 'ethers';
import { ShieldCheck, Search, Loader2, CheckCircle2, XCircle, AlertCircle, Calendar, PlusCircle, ArrowRight } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { getContractReadOnly, parseBlockchainError } from '../blockchain/contract';

export default function OrganizerView({
  events = [],
  account,
  onNavigateCreate,
  onViewEvent
}) {
  const [ticketIdInput, setTicketIdInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Filter events organized by the connected user
  const myOrganizedEvents = events.filter(
    (e) => account && e.organizer && e.organizer.toLowerCase() === account.toLowerCase()
  );

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

      const verification = await contract.verifyTicket(id);
      const [isValid, eventId, owner, isCancelled] = verification;

      const totalTicketsMinted = await contract.ticketCount();
      const exists = id < Number(totalTicketsMinted);

      let eventData = null;
      if (exists && Number(eventId) > 0) {
        try {
          const eventRes = await contract.getFunction('getEvent')(eventId);
          eventData = {
            id: Number(eventId),
            name: eventRes.name,
            description: eventRes.description,
            ticketPrice: eventRes.ticketPrice,
            organizer: eventRes.organizer
          };
        } catch (eventErr) {
          console.warn('Could not fetch event data for verified ticket:', eventErr);
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
      console.error('Verification error:', err);
      setError(parseBlockchainError(err));
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Organizer Tools</h2>
        <p className="text-sm text-secondary-text mt-0.5">
          Verify attendee tickets and inspect your organized events.
        </p>
      </div>

      {/* Ticket Verification Card */}
      <div className="card-base p-6">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck size={18} className="text-slate-700" />
          <h3 className="text-sm font-bold text-slate-900">Ticket Verification</h3>
        </div>
        <p className="text-xs text-secondary-text mb-4">
          Verify a ticket on the blockchain ledger before granting entry.
        </p>

        <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-3 max-w-lg">
          <input
            type="number"
            min="0"
            step="1"
            className="input-field font-mono text-xs"
            placeholder="Enter Ticket ID (e.g. 0, 1, 2...)"
            value={ticketIdInput}
            onChange={(e) => setTicketIdInput(e.target.value)}
            disabled={isVerifying}
          />
          <button
            type="submit"
            disabled={isVerifying}
            className="btn-primary text-xs py-2 whitespace-nowrap"
          >
            {isVerifying ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <Search size={14} />
                <span>Verify Ticket</span>
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-xs text-rose-700 max-w-lg">
            <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* Verification Result */}
        {result && (
          <div className="mt-5 p-5 border border-border rounded-lg bg-slate-50 max-w-lg">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="font-mono text-xs font-semibold text-slate-900">
                Ticket #{result.ticketId}
              </span>
              <StatusBadge
                status={
                  result.isValid
                    ? 'VALID'
                    : result.isCancelled
                    ? 'CANCELLED'
                    : 'INVALID'
                }
              />
            </div>

            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-secondary-text">Status</span>
                <span className="font-semibold text-slate-900">
                  {result.isValid
                    ? 'Valid & Active Pass'
                    : result.isCancelled
                    ? 'Cancelled & Refunded'
                    : 'Ticket Does Not Exist'}
                </span>
              </div>

              {result.event && (
                <>
                  <div className="flex justify-between">
                    <span className="text-secondary-text">Event</span>
                    <span className="font-semibold text-slate-900">{result.event.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary-text">Event ID</span>
                    <span className="font-semibold text-slate-900">#{result.eventId}</span>
                  </div>
                </>
              )}

              {result.exists && (
                <div className="pt-2 border-t border-slate-200 flex flex-col">
                  <span className="text-secondary-text">Owner Address</span>
                  <span className="font-mono text-slate-900 mt-0.5 break-all">{result.owner}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Organizer's Events List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Events Organized by You</h3>
            <p className="text-xs text-secondary-text">
              Track attendance, capacity, and sales metrics for events you created.
            </p>
          </div>

          <button
            onClick={onNavigateCreate}
            className="btn-secondary text-xs py-1.5"
          >
            <PlusCircle size={14} />
            <span>Create New Event</span>
          </button>
        </div>

        {!account ? (
          <div className="card-base p-6 text-center text-xs text-secondary-text">
            Connect your wallet to see events you have organized.
          </div>
        ) : myOrganizedEvents.length === 0 ? (
          <div className="card-base p-8 text-center">
            <h4 className="text-sm font-semibold text-slate-900">No organized events yet</h4>
            <p className="text-xs text-secondary-text mt-1">
              You haven't created any events with your current connected wallet ({account.substring(0, 6)}...{account.substring(account.length - 4)}).
            </p>
            <button
              onClick={onNavigateCreate}
              className="btn-primary mt-4 text-xs py-1.5"
            >
              <PlusCircle size={14} />
              <span>Create Your First Event</span>
            </button>
          </div>
        ) : (
          <div className="card-base overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-border text-secondary-text font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Tickets Sold</th>
                  <th className="px-4 py-3">Capacity</th>
                  <th className="px-4 py-3">Revenue</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {myOrganizedEvents.map((e) => {
                  const sold = Number(e.ticketsSold || 0);
                  const total = Number(e.totalTickets || 0);
                  const priceEth = parseFloat(ethers.formatEther(e.ticketPrice || 0));
                  const revenue = (sold * priceEth).toFixed(3);

                  return (
                    <tr key={e.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {e.name}
                      </td>
                      <td className="px-4 py-3 font-mono">
                        {ethers.formatEther(e.ticketPrice)} ETH
                      </td>
                      <td className="px-4 py-3">
                        {sold}
                      </td>
                      <td className="px-4 py-3">
                        {total}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900 font-mono">
                        {revenue} ETH
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => onViewEvent(e)}
                          className="btn-secondary py-1 px-2.5 text-[11px]"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
