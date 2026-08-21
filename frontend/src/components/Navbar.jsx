import React from 'react';
import { Wallet, Copy, Check, Menu, X, RefreshCw } from 'lucide-react';

export default function Navbar({
  account,
  balance,
  onConnectWallet,
  onDisconnectWallet,
  isConnecting,
  onRefresh,
  isLoading,
  activeTab,
  setActiveTab
}) {
  const [copied, setCopied] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const handleCopy = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const titles = {
    dashboard: 'Dashboard',
    events: 'Events',
    tickets: 'My Tickets',
    create: 'Create Event',
    organizer: 'Organizer Tools',
  };

  return (
    <header className="h-16 bg-surface border-b border-border px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          className="md:hidden p-1.5 rounded-lg border border-border text-slate-600 hover:bg-slate-50"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        <div>
          <h1 className="text-base font-bold text-slate-900 leading-tight">
            {titles[activeTab] || 'Dashboard'}
          </h1>
        </div>
      </div>

      {/* Right: Refresh + Wallet */}
      <div className="flex items-center gap-3">
        <button
          onClick={onRefresh}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          title="Refresh blockchain data"
        >
          <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
        </button>

        {account ? (
          <div className="flex items-center gap-2 bg-slate-50 border border-border px-3 py-1.5 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-slate-800">
              {balance ? `${parseFloat(balance).toFixed(3)} ETH` : '0 ETH'}
            </span>
            <span className="text-slate-300">|</span>
            <button
              onClick={handleCopy}
              className="text-xs font-mono font-medium text-slate-700 hover:text-slate-900 flex items-center gap-1"
              title="Copy connected address"
            >
              <span>{formatAddress(account)}</span>
              {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} className="text-slate-400" />}
            </button>
            <button
              onClick={onDisconnectWallet}
              className="ml-1 text-[11px] text-slate-500 hover:text-slate-800 px-1.5 py-0.5 rounded hover:bg-slate-200 transition-colors"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onConnectWallet}
            disabled={isConnecting}
            className="btn-primary py-1.5 text-xs"
          >
            <Wallet size={15} />
            <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
          </button>
        )}
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-border shadow-lg p-4 space-y-1 z-30">
          {['dashboard', 'events', 'tickets', 'create', 'organizer'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm rounded-lg capitalize ${
                activeTab === tab
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab === 'tickets' ? 'My Tickets' : tab === 'create' ? 'Create Event' : tab}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
