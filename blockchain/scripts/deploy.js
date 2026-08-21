const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("==========================================");
  console.log("Deploying EventTicketing smart contract...");
  console.log("==========================================");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  const EventTicketing = await hre.ethers.getContractFactory("EventTicketing");
  const eventTicketing = await EventTicketing.deploy();
  await eventTicketing.waitForDeployment();

  const contractAddress = await eventTicketing.getAddress();
  console.log("\n>>> EventTicketing deployed to:", contractAddress);

  // Seed sample events for easier testing
  console.log("\nSeeding initial demo events...");

  const tx1 = await eventTicketing.createEvent(
    "Web3 Future Summit 2026",
    "Join leading Ethereum developers, DeFi founders, and researchers exploring the next generation of smart contracts and dApps.",
    hre.ethers.parseEther("0.02"),
    100
  );
  await tx1.wait();

  const tx2 = await eventTicketing.createEvent(
    "Ethereum Hackathon & Demo Day",
    "48-hour global blockchain hackathon with prizes, workshops, and networking for Web3 builders.",
    hre.ethers.parseEther("0.01"),
    50
  );
  await tx2.wait();

  const tx3 = await eventTicketing.createEvent(
    "Decentralized AI & ZK Workshop",
    "Hands-on masterclass on zero-knowledge cryptography, decentralized machine learning, and on-chain intelligence.",
    hre.ethers.parseEther("0.05"),
    25
  );
  await tx3.wait();

  console.log("Seeded 3 sample events on-chain successfully!");

  // Export contract artifacts to the frontend directory
  const frontendContractsDir = path.join(__dirname, "..", "..", "frontend", "src", "contracts");

  if (!fs.existsSync(frontendContractsDir)) {
    fs.mkdirSync(frontendContractsDir, { recursive: true });
  }

  // Read the full compiled artifact
  const artifactPath = path.join(
    __dirname,
    "..",
    "artifacts",
    "contracts",
    "EventTicketing.sol",
    "EventTicketing.json"
  );

  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    fs.writeFileSync(
      path.join(frontendContractsDir, "EventTicketing.json"),
      JSON.stringify(artifact, null, 2)
    );
    console.log("Copied EventTicketing ABI to frontend/src/contracts/EventTicketing.json");
  }

  // Save the deployed address
  fs.writeFileSync(
    path.join(frontendContractsDir, "deployedAddress.json"),
    JSON.stringify({ address: contractAddress, network: hre.network.name }, null, 2)
  );
  console.log("Saved deployed address to frontend/src/contracts/deployedAddress.json");

  console.log("==========================================");
  console.log("Deployment and sync complete!");
  console.log("==========================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
