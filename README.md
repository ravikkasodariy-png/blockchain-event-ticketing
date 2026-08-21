# 🎟️ Blockchain Event Ticketing App (BlockPass)

A complete, beginner-friendly, and production-clean decentralized event ticketing application built with **React.js + Vite + Solidity (^0.8.24) + Hardhat + ethers.js (v6) + MetaMask**.

The Ethereum blockchain serves as the single source of truth for all events, ticket purchases, ownership records, cancellations with automated refunds, and verification.

---

## 🌟 Features

* **Event Creation**: Organizers can deploy new events to the blockchain by specifying event name, description, ticket price in ETH, and max capacity.
* **Browse Live Events**: Fetch and display on-chain events in real-time, with automatic progress bars and "Sold Out" state tracking.
* **MetaMask Integration**: One-click wallet connection, network status indicator (Hardhat Localhost 31337), real-time balance tracking, and account switching.
* **Buy Tickets with ETH**: Users buy tickets directly through MetaMask with exact ETH transactions.
* **Digital Ticket Passes**: View all owned tickets in a digital pass format with on-chain metadata (Ticket ID, Event ID, Price, Organizer).
* **Transfer Tickets**: Ticket owners can permanently transfer their tickets to any valid Ethereum address.
* **Cancel Ticket with Automated Refund**: Owners can cancel their tickets before the event and receive an instant, secure ETH refund from the smart contract.
* **Public Ticket Verification**: Door staff or attendees can input any Ticket ID to instantly verify on-chain validity, event details, and owner address.
* **Safe Smart Contract Design**: Implements Solidity `^0.8.24`, uses safe `.call{value: amount}("")` pattern for ETH transfers (no deprecated `.transfer()`), and includes comprehensive unit tests.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, JavaScript, CSS3 (Modern Glassmorphism & Web3 Theme), Lucide Icons |
| **Blockchain Interaction** | ethers.js (v6.13+) |
| **Smart Contract** | Solidity (`^0.8.24`) |
| **Development Network** | Hardhat Local Node (Chain ID: `31337`, RPC: `http://127.0.0.1:8545`) |
| **Wallet** | MetaMask |

---

## 📁 Project Structure

```text
blockchain-event-ticketing/
├── blockchain/
│   ├── contracts/
│   │   └── EventTicketing.sol      # Solidity smart contract
│   ├── scripts/
│   │   └── deploy.js               # Deployment script & automatic frontend sync
│   ├── test/
│   │   └── EventTicketing.js       # Comprehensive unit test suite
│   ├── hardhat.config.js           # Hardhat network & compiler config
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── blockchain/
│   │   │   └── contract.js         # ethers.js v6 contract connector & error parser
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Header, tabs, and wallet connect pill
│   │   │   ├── EventCard.jsx       # Event card with purchase action
│   │   │   ├── EventList.jsx       # Grid list, search, and metrics
│   │   │   ├── CreateEvent.jsx     # Event creation form
│   │   │   ├── MyTickets.jsx       # User ticket passes & actions
│   │   │   ├── TransferModal.jsx   # Ownership transfer modal
│   │   │   ├── VerifyTicket.jsx    # Gatekeeper verification station
│   │   │   └── Notification.jsx    # Transaction toasts and feedback
│   │   ├── contracts/
│   │   │   ├── EventTicketing.json # Compiled smart contract ABI
│   │   │   └── deployedAddress.json# Synced deployed contract address
│   │   ├── App.jsx                 # Main application state & wallet listeners
│   │   ├── index.css               # Clean Web3 theme styling
│   │   └── main.jsx                # React DOM entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## 🚀 Step-by-Step Setup Guide

### 1. Prerequisites
* **Node.js** (v18, v20, or v22+)
* **MetaMask** browser extension installed in Chrome, Brave, Edge, or Firefox.

---

### 2. Smart Contract Setup & Local Blockchain

Open a terminal and navigate to the `blockchain` folder:

```bash
cd blockchain
```

#### A. Start the Local Hardhat Blockchain Node
Run the Hardhat local node. This spins up an Ethereum RPC node on `http://127.0.0.1:8545` with 20 pre-funded test accounts (10,000 ETH each):

```bash
npx hardhat node
```

> **Note**: Keep this terminal window running!

#### B. Deploy the Contract (in a new terminal)
Open a second terminal window, navigate to `blockchain`, and deploy `EventTicketing.sol`:

```bash
cd blockchain
npx hardhat run scripts/deploy.js --network localhost
```

The script will:
1. Deploy `EventTicketing` to the local network.
2. Seed 3 initial demo events for testing.
3. Automatically export the contract ABI and deployed address to `frontend/src/contracts/`.

#### C. Run the Smart Contract Tests (Optional)
To verify contract integrity:

```bash
npx hardhat test
```

---

### 3. Frontend Setup

Open a terminal, navigate to the `frontend` folder:

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server will start at `http://localhost:5173`. Open this URL in your browser.

---

## 🦊 Configuring MetaMask for Localhost

To interact with the smart contract, configure MetaMask to connect to your local Hardhat node:

### Step 1: Add Hardhat Localhost Network
1. Click the network dropdown in MetaMask (top-left) -> **Add Network** -> **Add a network manually**.
2. Enter the following parameters:
   * **Network Name**: `Hardhat Localhost`
   * **New RPC URL**: `http://127.0.0.1:8545`
   * **Chain ID**: `31337`
   * **Currency Symbol**: `ETH`
3. Click **Save** and switch to `Hardhat Localhost`.

*(The application also includes an automated "Switch Network" prompt in the navbar if you are on the wrong network!)*

### Step 2: Import Hardhat Test Account
Hardhat generates 20 pre-funded development accounts. You can import one into MetaMask:

1. Copy the private key of Account #0 from your `npx hardhat node` terminal output:
   * **Account #0 Address**: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
   * **Private Key**: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   * *(Account #1 for transfer testing)*: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
2. In MetaMask, click on the **Account Selector** -> **Add account or hardware wallet** -> **Import account**.
3. Paste the private key and click **Import**.
4. You will now have **10,000 ETH** in MetaMask ready for transactions!

> ⚠️ **Security Warning**: These private keys are publicly known and strictly for local development. Never send real funds to these addresses or use these keys on Ethereum mainnet.

---

## 📖 Smart Contract API Reference (`EventTicketing.sol`)

| Function | Type | Description |
|---|---|---|
| `createEvent(name, description, ticketPrice, totalTickets)` | Write | Creates a new event and emits `EventCreated`. |
| `buyTicket(eventId)` | Payable | Purchases a ticket by sending exact `ticketPrice` in ETH. |
| `getEvent(eventId)` | View | Returns full event details (name, description, price, total, sold, organizer). |
| `getEventCount()` | View | Returns total number of events created. |
| `userTickets(userAddress)` | View | Returns array of active, non-cancelled ticket IDs owned by the address. |
| `transferTicket(ticketId, toAddress)` | Write | Transfers ticket ownership to a new wallet. |
| `cancelTicket(ticketId)` | Write | Inactivates ticket and refunds `ticketPrice` in ETH to the caller. |
| `verifyTicket(ticketId)` | View | Returns `(isValid, eventId, owner, isCancelled)` for any ticket ID. |

---

## 🧪 Testing the Complete Application Flow

1. **Connect Wallet**: Click **Connect Wallet** in the navbar and approve the MetaMask popup.
2. **Browse Events**: View the initial seeded events on the **Events** tab.
3. **Buy a Ticket**: Click **Buy Ticket** on an event, confirm the MetaMask transaction, and watch the real-time mining toast.
4. **View My Tickets**: Go to **My Tickets** to view your digital ticket pass.
5. **Transfer a Ticket**: Click **Transfer**, enter Account #1's address (`0x70997970C51812dc3A010C7d01b50e0d17dc79C8`), confirm in MetaMask. Switch to Account #1 in MetaMask to verify they now own the pass.
6. **Cancel a Ticket**: Buy another ticket and click **Cancel (Refund)**. Confirm in MetaMask and verify that the ticket is removed and ETH is refunded to your balance.
7. **Verify a Ticket**: Navigate to **Verify Ticket**, enter a ticket ID (e.g. `0`), and view the on-chain validity badge and owner details.
8. **Create an Event**: Navigate to **Create Event**, enter your custom event details, submit to Ethereum, and see it instantly appear in the **Events** list.

---

## 📄 License
This project is licensed under the MIT License.
