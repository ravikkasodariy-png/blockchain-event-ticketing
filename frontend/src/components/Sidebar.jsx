import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  Ticket,
  PlusCircle,
  ShieldCheck,
  Radio,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { CONTRACT_ADDRESS, HARDHAT_CHAIN_ID_DECIMAL, switchToHardhatNetwork } from '../blockchain/contract';

export default function Sidebar({
  activeTab,
  setActiveTab,
  chainId,
  account,
  userTicketsCount = 0
}) {
  const [copied, setCopied] = React.useState(false);
  const isHardhat = chainId === HARDHAT_CHAIN_ID_DECIMAL;

  const handleCopyContract = () => {
    navigator.clipboard.writeText(CONTRACT_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'tickets', label: 'My Tickets', icon: Ticket, badge: userTicketsCount > 0 ? userTicketsCount : null },
    { id: 'create', label: 'Create Event', icon: PlusCircle },
    { id: 'organizer', label: 'Organizer', icon: ShieldCheck },
  ];

  return (
    <aside className="w-64 bg-surface border-r border-border flex flex-col justify-between h-screen sticky top-0 z-30">
      <div>
        {/* Brand */}
        <div className="h-16 px-6 border-b border-border flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
            BP
          </div>
          <span className="font-bold text-base tracking-tight text-slate-900">
            BlockPass
          </span>
          <span className="ml-auto text-[10px] uppercase font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
            dApp
          </span>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                }`}
              >
                <Icon
                  size={17}
                  className={isActive ? 'text-slate-900' : 'text-slate-400'}
                />
                <span>{item.label}</span>
                {item.badge !== null && (
                  <span className="ml-auto text-xs font-semibold bg-slate-200 text-slate-800 px-1.5 py-0.2 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Network & Contract Footer */}
      <div className="p-4 border-t border-border space-y-3">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-secondary-text uppercase tracking-wider">
              Network
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  account
                    ? isHardhat
                      ? 'bg-emerald-500'
                      : 'bg-amber-500'
                    : 'bg-slate-400'
                }`}
              />
              <span className="text-xs font-medium text-slate-800">
                {account
                  ? isHardhat
                    ? 'Local (31337)'
                    : 'Wrong Network'
                  : 'Disconnected'}
              </span>
            </div>
          </div>

          {!isHardhat && account && (
            <button
              onClick={switchToHardhatNetwork}
              className="mt-2 w-full text-xs text-amber-800 bg-amber-100 hover:bg-amber-200 py-1 px-2 rounded font-medium transition-colors"
            >
              Switch to Hardhat
            </button>
          )}

          <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <span>Contract</span>
            <button
              onClick={handleCopyContract}
              className="font-mono text-slate-700 hover:text-slate-900 flex items-center gap-1"
              title="Copy deployed contract address"
            >
              <span>{CONTRACT_ADDRESS.substring(0, 6)}...{CONTRACT_ADDRESS.substring(CONTRACT_ADDRESS.length - 4)}</span>
              {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
