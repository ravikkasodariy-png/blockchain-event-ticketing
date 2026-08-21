import { ethers } from "ethers";
import contractArtifact from "../contracts/EventTicketing.json";
import deployedInfo from "../contracts/deployedAddress.json";

export const CONTRACT_ADDRESS = deployedInfo.address;
export const CONTRACT_ABI = contractArtifact.abi;

export const HARDHAT_CHAIN_ID = "0x7a69"; // 31337 in hex
export const HARDHAT_CHAIN_ID_DECIMAL = 31337;

/**
 * Returns an ethers BrowserProvider using window.ethereum.
 */
export function getBrowserProvider() {
  if (typeof window !== "undefined" && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  return null;
}

/**
 * Returns a fallback JsonRpcProvider for local Hardhat node if MetaMask is not connected.
 */
export function getJsonRpcProvider() {
  return new ethers.JsonRpcProvider("http://127.0.0.1:8545");
}

/**
 * Returns the best available provider (BrowserProvider if available, else JsonRpcProvider).
 */
export function getProvider() {
  const browserProvider = getBrowserProvider();
  if (browserProvider) {
    return browserProvider;
  }
  return getJsonRpcProvider();
}

/**
 * Requests accounts from MetaMask and returns the Signer.
 */
export async function getSigner() {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed. Please install MetaMask to interact with the blockchain.");
  }
  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  return await provider.getSigner();
}

/**
 * Returns an instance of the EventTicketing smart contract.
 * @param {ethers.Signer | ethers.Provider} signerOrProvider
 */
export function getContract(signerOrProvider) {
  if (!signerOrProvider) {
    signerOrProvider = getProvider();
  }
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signerOrProvider);
}

/**
 * Returns contract connected to the user's active signer.
 */
export async function getContractWithSigner() {
  const signer = await getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}

/**
 * Returns contract connected for read-only calls.
 */
export function getContractReadOnly() {
  const provider = getProvider();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
}

/**
 * Diagnostic helper to verify that contract bytecode exists at CONTRACT_ADDRESS.
 * Throws a clear descriptive error if bytecode is 0x.
 */
export async function verifyContractDeployed(provider = getProvider()) {
  try {
    const network = await provider.getNetwork();
    console.log("Connected chain:", Number(network.chainId));
    console.log("Contract address:", CONTRACT_ADDRESS);

    const code = await provider.getCode(CONTRACT_ADDRESS);
    console.log("Contract bytecode length:", code.length);

    if (!code || code === "0x" || code === "0x0") {
      const errorMsg = `No contract bytecode found at address ${CONTRACT_ADDRESS} on Chain ID ${network.chainId}. Please make sure your local Hardhat node is running ('npx hardhat node') and redeploy EventTicketing ('npx hardhat run scripts/deploy.js --network localhost').`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    return true;
  } catch (err) {
    console.error("Contract deployment verification failed:", err);
    throw err;
  }
}

/**
 * Prompts MetaMask to switch to or add the local Hardhat network.
 */
export async function switchToHardhatNetwork() {
  if (!window.ethereum) return false;

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: HARDHAT_CHAIN_ID }],
    });
    return true;
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask.
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: HARDHAT_CHAIN_ID,
              chainName: "Hardhat Localhost",
              rpcUrls: ["http://127.0.0.1:8545"],
              nativeCurrency: {
                name: "Ether",
                symbol: "ETH",
                decimals: 18,
              },
            },
          ],
        });
        return true;
      } catch (addError) {
        console.error("Failed to add Hardhat network:", addError);
        return false;
      }
    }
    console.error("Failed to switch network:", switchError);
    return false;
  }
}

/**
 * Parses raw blockchain and MetaMask errors into user-friendly error messages.
 * @param {any} error
 * @returns {string}
 */
export function parseBlockchainError(error) {
  if (!error) return "An unknown error occurred.";

  const errorMessage = error.message || error.toString();

  // Bad data / empty result (no contract at target address)
  if (
    errorMessage.includes("could not decode result data") ||
    errorMessage.includes("BAD_DATA") ||
    errorMessage.includes('value="0x"')
  ) {
    return `No contract found at ${CONTRACT_ADDRESS}. Please redeploy EventTicketing to your Hardhat node ('npx hardhat run scripts/deploy.js --network localhost').`;
  }

  if (
    error.code === 4001 ||
    errorMessage.includes("user rejected") ||
    errorMessage.includes("ACTION_REJECTED")
  ) {
    return "Transaction was rejected in MetaMask.";
  }

  if (
    errorMessage.includes("insufficient funds") ||
    errorMessage.includes("INSUFFICIENT_FUNDS")
  ) {
    return "Insufficient ETH balance in your wallet to complete this transaction.";
  }

  if (errorMessage.includes("Incorrect ticket price")) {
    return "Incorrect ticket price sent with transaction.";
  }

  if (errorMessage.includes("Event is sold out")) {
    return "This event is completely sold out!";
  }

  if (errorMessage.includes("Event does not exist")) {
    return "The specified event ID does not exist on the blockchain.";
  }

  if (errorMessage.includes("Ticket does not exist")) {
    return "The specified ticket ID does not exist.";
  }

  if (errorMessage.includes("You are not the owner of this ticket")) {
    return "You do not own this ticket.";
  }

  if (
    errorMessage.includes("Ticket has been cancelled") ||
    errorMessage.includes("Ticket has already been cancelled")
  ) {
    return "This ticket has already been cancelled.";
  }

  if (errorMessage.includes("Recipient cannot be zero address")) {
    return "Recipient wallet address cannot be the zero address.";
  }

  if (errorMessage.includes("Cannot transfer ticket to yourself")) {
    return "You cannot transfer a ticket to your own wallet address.";
  }

  if (errorMessage.includes("Total tickets must be greater than 0")) {
    return "Event must have at least 1 ticket available.";
  }

  if (errorMessage.includes("Event name cannot be empty")) {
    return "Event name cannot be empty.";
  }

  if (error.reason) {
    return error.reason;
  }

  return errorMessage.length > 140
    ? errorMessage.substring(0, 140) + "..."
    : errorMessage;
}
