import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import DashboardView from './views/DashboardView';
import EventsView from './views/EventsView';
import MyTicketsView from './views/MyTicketsView';
import CreateEventView from './views/CreateEventView';
import OrganizerView from './views/OrganizerView';
import EventModal from './components/EventModal';
import BuyModal from './components/BuyModal';
import TicketDetailsModal from './components/TicketDetailsModal';
import TransferModal from './components/TransferModal';
import CancelModal from './components/CancelModal';
import Toast from './components/Toast';
import {
  getProvider,
  getBrowserProvider,
  getSigner,
  getContract,
  getContractWithSigner,
  getContractReadOnly,
  verifyContractDeployed,
  parseBlockchainError,
  CONTRACT_ADDRESS,
  HARDHAT_CHAIN_ID_DECIMAL
} from './blockchain/contract';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'events', 'tickets', 'create', 'organizer'

  // Notifications
  const [notification, setNotification] = useState(null);

  // Wallet State
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Blockchain Data
  const [events, setEvents] = useState([]);
  const [userTicketsList, setUserTicketsList] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);

  // Modals & Action State
  const [selectedEventForView, setSelectedEventForView] = useState(null);
  const [selectedEventForBuy, setSelectedEventForBuy] = useState(null);
  const [selectedTicketForView, setSelectedTicketForView] = useState(null);
  const [selectedTicketForTransfer, setSelectedTicketForTransfer] = useState(null);
  const [selectedTicketForCancel, setSelectedTicketForCancel] = useState(null);

  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [isBuyingTicket, setIsBuyingTicket] = useState(false);
  const [buyStep, setBuyStep] = useState(null); // 'waiting', 'mining'
  const [isTransferringTicket, setIsTransferringTicket] = useState(false);
  const [isCancellingTicket, setIsCancellingTicket] = useState(false);

  // Notification helper
  const notify = useCallback((type, title, message, txHash = null, autoClose = true) => {
    setNotification({ type, title, message, txHash });
    if (autoClose && type !== 'loading') {
      setTimeout(() => {
        setNotification((prev) => (prev?.message === message ? null : prev));
      }, 5000);
    }
  }, []);

  // Update Account Balance
  const updateBalance = useCallback(async (walletAddress) => {
    if (!walletAddress) return;
    try {
      const provider = getProvider();
      const bal = await provider.getBalance(walletAddress);
      setBalance(ethers.formatEther(bal));
    } catch (err) {
      console.warn('Could not fetch balance:', err);
    }
  }, []);

  // Connect MetaMask Wallet
  const handleConnectWallet = async () => {
    if (!window.ethereum) {
      notify('error', 'MetaMask Missing', 'MetaMask is not installed. Please install MetaMask to interact with the blockchain.', null, false);
      return;
    }

    setIsConnecting(true);
    try {
      const browserProvider = getBrowserProvider();
      const accounts = await browserProvider.send('eth_requestAccounts', []);
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        const network = await browserProvider.getNetwork();
        setChainId(Number(network.chainId));
        await updateBalance(accounts[0]);
        notify('success', 'Wallet Connected', `Connected: ${accounts[0].substring(0, 6)}...${accounts[0].substring(accounts[0].length - 4)}`);
      }
    } catch (err) {
      console.error('Wallet connection failed:', err);
      notify('error', 'Connection Failed', parseBlockchainError(err));
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect Wallet
  const handleDisconnectWallet = () => {
    setAccount(null);
    setBalance(null);
    setUserTicketsList([]);
    notify('info', 'Disconnected', 'Wallet disconnected from dApp.');
  };

  // Fetch all events from smart contract
  const fetchEvents = useCallback(async () => {
    setIsLoadingEvents(true);
    try {
      const provider = getProvider();
      const code = await provider.getCode(CONTRACT_ADDRESS);

      if (!code || code === '0x' || code === '0x0') {
        throw new Error(`No smart contract found at address ${CONTRACT_ADDRESS}. Please redeploy EventTicketing ('npx hardhat run scripts/deploy.js --network localhost').`);
      }

      const contract = getContractReadOnly();
      const countBig = await contract.getEventCount();
      const count = Number(countBig);

      const eventsArray = [];
      for (let i = 1; i <= count; i++) {
        const eventData = await contract.getFunction('getEvent')(i);
        eventsArray.push({
          id: i,
          name: eventData.name,
          description: eventData.description,
          ticketPrice: eventData.ticketPrice,
          totalTickets: eventData.totalTickets,
          ticketsSold: eventData.ticketsSold,
          organizer: eventData.organizer
        });
      }

      // Order newest events first
      setEvents(eventsArray.reverse());
    } catch (err) {
      console.error('Error fetching events from contract:', err);
      notify('error', 'Blockchain Error', parseBlockchainError(err), null, false);
    } finally {
      setIsLoadingEvents(false);
    }
  }, [notify]);

  // Fetch user tickets from smart contract
  const fetchUserTickets = useCallback(async () => {
    if (!account) {
      setUserTicketsList([]);
      return;
    }

    setIsLoadingTickets(true);
    try {
      const contract = getContractReadOnly();
      const ticketIds = await contract.userTickets(account);

      const ticketsWithEventData = [];
      for (let i = 0; i < ticketIds.length; i++) {
        const ticketId = Number(ticketIds[i]);
        const eventId = Number(await contract.ticketEvent(ticketId));
        const eventData = await contract.getFunction('getEvent')(eventId);

        ticketsWithEventData.push({
          ticketId,
          eventId,
          owner: account,
          eventName: eventData.name,
          eventDescription: eventData.description,
          ticketPrice: eventData.ticketPrice,
          organizer: eventData.organizer
        });
      }

      setUserTicketsList(ticketsWithEventData.reverse());
    } catch (err) {
      console.error('Error fetching user tickets:', err);
    } finally {
      setIsLoadingTickets(false);
    }
  }, [account]);

  // MetaMask Event Listeners
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' }).then((accounts) => {
        if (accounts && accounts.length > 0) {
          setAccount(accounts[0]);
          updateBalance(accounts[0]);
        }
      }).catch(console.error);

      window.ethereum.request({ method: 'eth_chainId' }).then((hexChainId) => {
        setChainId(parseInt(hexChainId, 16));
      }).catch(console.error);

      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          updateBalance(accounts[0]);
          notify('info', 'Account Switched', `Active account: ${accounts[0].substring(0, 6)}...${accounts[0].substring(accounts[0].length - 4)}`);
        } else {
          setAccount(null);
          setBalance(null);
          setUserTicketsList([]);
        }
      };

      const handleChainChanged = (hexChainId) => {
        const newChainId = parseInt(hexChainId, 16);
        setChainId(newChainId);
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [updateBalance, notify]);

  // Sync initial data
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    if (account) {
      fetchUserTickets();
      updateBalance(account);
    }
  }, [account, fetchUserTickets, updateBalance]);

  // 1. Create Event Action
  const handleCreateEvent = async ({ name, description, price, totalTickets }) => {
    setIsCreatingEvent(true);
    notify('loading', 'Creating Event...', 'Please confirm the transaction in MetaMask.', null, false);

    try {
      const contract = await getContractWithSigner();
      const priceInWei = ethers.parseEther(price.toString());

      const tx = await contract.createEvent(name, description, priceInWei, totalTickets);
      notify('loading', 'Transaction Submitted', 'Awaiting on-chain confirmation...', tx.hash, false);

      const receipt = await tx.wait();
      notify('success', 'Event Created', `Successfully deployed "${name}"!`, receipt.hash);

      await fetchEvents();
      if (account) await updateBalance(account);
      setActiveTab('events');
    } catch (err) {
      console.error('Create event failed:', err);
      notify('error', 'Creation Failed', parseBlockchainError(err));
    } finally {
      setIsCreatingEvent(false);
    }
  };

  // 2. Buy Ticket Action
  const handleBuyTicket = async (eventId, ticketPriceWei) => {
    if (!account) {
      await handleConnectWallet();
      return;
    }

    setIsBuyingTicket(true);
    setBuyStep('waiting');
    notify('loading', 'Waiting for Confirmation', 'Please approve the transaction in MetaMask.', null, false);

    try {
      const contract = await getContractWithSigner();
      const tx = await contract.buyTicket(eventId, { value: ticketPriceWei });

      setBuyStep('mining');
      notify('loading', 'Transaction Submitted', 'Ticket purchase in progress...', tx.hash, false);

      const receipt = await tx.wait();

      // Find TicketPurchased event
      let purchasedTicketId = null;
      for (const log of receipt.logs) {
        try {
          const parsed = contract.interface.parseLog(log);
          if (parsed && parsed.name === 'TicketPurchased') {
            purchasedTicketId = Number(parsed.args.ticketId);
            break;
          }
        } catch {
          // continue
        }
      }

      const msg = purchasedTicketId !== null
        ? `Ticket #${purchasedTicketId} purchased successfully.`
        : 'Ticket purchased successfully.';

      notify('success', 'Purchase Complete', msg, receipt.hash);

      setSelectedEventForBuy(null);
      await fetchEvents();
      await fetchUserTickets();
      if (account) await updateBalance(account);
    } catch (err) {
      console.error('Buy ticket error:', err);
      notify('error', 'Purchase Failed', parseBlockchainError(err));
    } finally {
      setIsBuyingTicket(false);
      setBuyStep(null);
    }
  };

  // 3. Transfer Ticket Action
  const handleTransferTicket = async (ticketId, recipientAddress) => {
    setIsTransferringTicket(true);
    notify('loading', 'Transferring Ticket...', 'Please confirm the transfer in MetaMask.', null, false);

    try {
      const contract = await getContractWithSigner();
      const tx = await contract.transferTicket(ticketId, recipientAddress);

      notify('loading', 'Transferring Ticket...', 'Updating ownership on the blockchain...', tx.hash, false);
      const receipt = await tx.wait();

      notify('success', 'Transfer Successful', `Ticket #${ticketId} transferred to ${recipientAddress.substring(0, 6)}...${recipientAddress.substring(recipientAddress.length - 4)}.`, receipt.hash);

      setSelectedTicketForTransfer(null);
      await fetchUserTickets();
      if (account) await updateBalance(account);
    } catch (err) {
      console.error('Transfer failed:', err);
      notify('error', 'Transfer Failed', parseBlockchainError(err));
    } finally {
      setIsTransferringTicket(false);
    }
  };

  // 4. Cancel Ticket Action
  const handleCancelTicket = async (ticketId) => {
    setIsCancellingTicket(true);
    notify('loading', 'Cancelling Ticket...', 'Please confirm cancellation and refund in MetaMask.', null, false);

    try {
      const contract = await getContractWithSigner();
      const tx = await contract.cancelTicket(ticketId);

      notify('loading', 'Processing Refund...', 'Cancelling ticket and refunding ETH...', tx.hash, false);
      const receipt = await tx.wait();

      notify('success', 'Ticket Cancelled', `Ticket #${ticketId} cancelled. ETH refund deposited to your wallet.`, receipt.hash);

      setSelectedTicketForCancel(null);
      await fetchEvents();
      await fetchUserTickets();
      if (account) await updateBalance(account);
    } catch (err) {
      console.error('Cancel failed:', err);
      notify('error', 'Cancellation Failed', parseBlockchainError(err));
    } finally {
      setIsCancellingTicket(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-primary-text font-sans">
      {/* Compact Sidebar Navigation */}
      <div className="hidden md:block">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          chainId={chainId}
          account={account}
          userTicketsCount={userTicketsList.length}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <Navbar
          account={account}
          balance={balance}
          onConnectWallet={handleConnectWallet}
          onDisconnectWallet={handleDisconnectWallet}
          isConnecting={isConnecting}
          onRefresh={() => {
            fetchEvents();
            if (account) fetchUserTickets();
          }}
          isLoading={isLoadingEvents || isLoadingTickets}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* View Router */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              events={events}
              userTickets={userTicketsList}
              isLoading={isLoadingEvents}
              account={account}
              chainId={chainId}
              onNavigate={setActiveTab}
              onViewEvent={(event) => setSelectedEventForView(event)}
              onBuyTicket={(event) => setSelectedEventForBuy(event)}
            />
          )}

          {activeTab === 'events' && (
            <EventsView
              events={events}
              isLoading={isLoadingEvents}
              account={account}
              onNavigateCreate={() => setActiveTab('create')}
              onViewEvent={(event) => setSelectedEventForView(event)}
              onBuyTicket={(event) => setSelectedEventForBuy(event)}
            />
          )}

          {activeTab === 'tickets' && (
            <MyTicketsView
              tickets={userTicketsList}
              isLoading={isLoadingTickets}
              account={account}
              onConnectWallet={handleConnectWallet}
              onNavigateEvents={() => setActiveTab('events')}
              onViewTicket={(ticket) => setSelectedTicketForView(ticket)}
              onOpenTransfer={(ticket) => setSelectedTicketForTransfer(ticket)}
              onOpenCancel={(ticket) => setSelectedTicketForCancel(ticket)}
            />
          )}

          {activeTab === 'create' && (
            <CreateEventView
              onCreateEvent={handleCreateEvent}
              isCreating={isCreatingEvent}
              account={account}
              onConnectWallet={handleConnectWallet}
            />
          )}

          {activeTab === 'organizer' && (
            <OrganizerView
              events={events}
              account={account}
              onNavigateCreate={() => setActiveTab('create')}
              onViewEvent={(event) => setSelectedEventForView(event)}
            />
          )}
        </main>
      </div>

      {/* Interactive Modals */}
      {selectedEventForView && (
        <EventModal
          event={selectedEventForView}
          onClose={() => setSelectedEventForView(null)}
          onOpenBuyModal={(event) => setSelectedEventForBuy(event)}
          account={account}
        />
      )}

      {selectedEventForBuy && (
        <BuyModal
          event={selectedEventForBuy}
          onClose={() => {
            if (!isBuyingTicket) setSelectedEventForBuy(null);
          }}
          onConfirm={handleBuyTicket}
          isBuying={isBuyingTicket}
          buyStep={buyStep}
        />
      )}

      {selectedTicketForView && (
        <TicketDetailsModal
          ticket={selectedTicketForView}
          onClose={() => setSelectedTicketForView(null)}
          onOpenTransfer={(ticket) => setSelectedTicketForTransfer(ticket)}
          onOpenCancel={(ticket) => setSelectedTicketForCancel(ticket)}
        />
      )}

      {selectedTicketForTransfer && (
        <TransferModal
          ticket={selectedTicketForTransfer}
          onClose={() => {
            if (!isTransferringTicket) setSelectedTicketForTransfer(null);
          }}
          onTransfer={handleTransferTicket}
          isTransferring={isTransferringTicket}
        />
      )}

      {selectedTicketForCancel && (
        <CancelModal
          ticket={selectedTicketForCancel}
          onClose={() => {
            if (!isCancellingTicket) setSelectedTicketForCancel(null);
          }}
          onConfirm={handleCancelTicket}
          isCancelling={isCancellingTicket}
        />
      )}

      {/* Toast Notification System */}
      <Toast
        notification={notification}
        onClose={() => setNotification(null)}
      />
    </div>
  );
}
