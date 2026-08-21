const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EventTicketing Smart Contract", function () {
  let eventTicketing;
  let owner, organizer, buyer1, buyer2, recipient;
  const TICKET_PRICE = ethers.parseEther("0.05");
  const TOTAL_TICKETS = 3;

  beforeEach(async function () {
    [owner, organizer, buyer1, buyer2, recipient] = await ethers.getSigners();

    const EventTicketing = await ethers.getContractFactory("EventTicketing");
    eventTicketing = await EventTicketing.deploy();
    await eventTicketing.waitForDeployment();
  });

  describe("1. Event Creation", function () {
    it("Should allow an organizer to create an event (starts at ID 1)", async function () {
      const tx = await eventTicketing
        .connect(organizer)
        .createEvent("Tech Conference", "Learn Web3", TICKET_PRICE, TOTAL_TICKETS);

      await expect(tx)
        .to.emit(eventTicketing, "EventCreated")
        .withArgs(1, "Tech Conference", TICKET_PRICE, TOTAL_TICKETS, organizer.address);

      expect(await eventTicketing.getEventCount()).to.equal(1);

      const eventData = await eventTicketing.getFunction("getEvent")(1);
      expect(eventData.name).to.equal("Tech Conference");
      expect(eventData.description).to.equal("Learn Web3");
      expect(eventData.ticketPrice).to.equal(TICKET_PRICE);
      expect(eventData.totalTickets).to.equal(TOTAL_TICKETS);
      expect(eventData.ticketsSold).to.equal(0);
      expect(eventData.organizer).to.equal(organizer.address);
    });

    it("Should reject event creation with empty name or 0 tickets", async function () {
      await expect(
        eventTicketing.connect(organizer).createEvent("", "Desc", TICKET_PRICE, 10)
      ).to.be.revertedWith("Event name cannot be empty");

      await expect(
        eventTicketing.connect(organizer).createEvent("Title", "Desc", TICKET_PRICE, 0)
      ).to.be.revertedWith("Total tickets must be greater than 0");
    });
  });

  describe("2. Ticket Purchasing", function () {
    beforeEach(async function () {
      await eventTicketing
        .connect(organizer)
        .createEvent("Blockchain Expo", "Networking & Keynotes", TICKET_PRICE, 2);
    });

    it("Should allow a user to buy a ticket with exact ETH", async function () {
      const tx = await eventTicketing.connect(buyer1).buyTicket(1, { value: TICKET_PRICE });

      await expect(tx)
        .to.emit(eventTicketing, "TicketPurchased")
        .withArgs(0, 1, buyer1.address);

      expect(await eventTicketing.ticketCount()).to.equal(1);
      expect(await eventTicketing.ticketOwner(0)).to.equal(buyer1.address);
      expect(await eventTicketing.ticketEvent(0)).to.equal(1);

      const eventData = await eventTicketing.getFunction("getEvent")(1);
      expect(eventData.ticketsSold).to.equal(1);

      const userTickets = await eventTicketing.userTickets(buyer1.address);
      expect(userTickets.length).to.equal(1);
      expect(userTickets[0]).to.equal(0);
    });

    it("Should revert if incorrect ETH is sent", async function () {
      await expect(
        eventTicketing.connect(buyer1).buyTicket(1, { value: ethers.parseEther("0.01") })
      ).to.be.revertedWith("Incorrect ticket price");
    });

    it("Should revert if event does not exist", async function () {
      await expect(
        eventTicketing.connect(buyer1).buyTicket(99, { value: TICKET_PRICE })
      ).to.be.revertedWith("Event does not exist");

      await expect(
        eventTicketing.connect(buyer1).buyTicket(0, { value: TICKET_PRICE })
      ).to.be.revertedWith("Event does not exist");
    });

    it("Should revert when event is sold out", async function () {
      // Event has 2 tickets total
      await eventTicketing.connect(buyer1).buyTicket(1, { value: TICKET_PRICE });
      await eventTicketing.connect(buyer2).buyTicket(1, { value: TICKET_PRICE });

      const eventData = await eventTicketing.getFunction("getEvent")(1);
      expect(eventData.ticketsSold).to.equal(2);

      // 3rd attempt should fail
      await expect(
        eventTicketing.connect(recipient).buyTicket(1, { value: TICKET_PRICE })
      ).to.be.revertedWith("Event is sold out");
    });
  });

  describe("3. Ticket Transfer", function () {
    beforeEach(async function () {
      await eventTicketing
        .connect(organizer)
        .createEvent("Metaverse Gala", "Music and Art", TICKET_PRICE, 5);
      await eventTicketing.connect(buyer1).buyTicket(1, { value: TICKET_PRICE });
    });

    it("Should allow the owner to transfer their ticket", async function () {
      const tx = await eventTicketing.connect(buyer1).transferTicket(0, recipient.address);

      await expect(tx)
        .to.emit(eventTicketing, "TicketTransferred")
        .withArgs(0, buyer1.address, recipient.address);

      expect(await eventTicketing.ticketOwner(0)).to.equal(recipient.address);

      // buyer1 should have 0 tickets, recipient should have 1
      const buyerTickets = await eventTicketing.userTickets(buyer1.address);
      const recipientTickets = await eventTicketing.userTickets(recipient.address);

      expect(buyerTickets.length).to.equal(0);
      expect(recipientTickets.length).to.equal(1);
      expect(recipientTickets[0]).to.equal(0);
    });

    it("Should revert if unauthorized user attempts to transfer", async function () {
      await expect(
        eventTicketing.connect(buyer2).transferTicket(0, recipient.address)
      ).to.be.revertedWith("You are not the owner of this ticket");
    });

    it("Should revert if transferring to zero address or self", async function () {
      await expect(
        eventTicketing.connect(buyer1).transferTicket(0, ethers.ZeroAddress)
      ).to.be.revertedWith("Recipient cannot be zero address");

      await expect(
        eventTicketing.connect(buyer1).transferTicket(0, buyer1.address)
      ).to.be.revertedWith("Cannot transfer ticket to yourself");
    });
  });

  describe("4. Ticket Cancellation and Refunds", function () {
    beforeEach(async function () {
      await eventTicketing
        .connect(organizer)
        .createEvent("DeFi Summit", "Liquidity & Protocols", TICKET_PRICE, 10);
      await eventTicketing.connect(buyer1).buyTicket(1, { value: TICKET_PRICE });
    });

    it("Should allow ticket owner to cancel and receive refund", async function () {
      const balanceBefore = await ethers.provider.getBalance(buyer1.address);

      const tx = await eventTicketing.connect(buyer1).cancelTicket(0);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      await expect(tx)
        .to.emit(eventTicketing, "TicketCancelled")
        .withArgs(0, 1, buyer1.address);

      const balanceAfter = await ethers.provider.getBalance(buyer1.address);
      // Balance should increase by TICKET_PRICE minus gasUsed
      expect(balanceAfter).to.equal(balanceBefore + TICKET_PRICE - gasUsed);

      expect(await eventTicketing.ticketCancelled(0)).to.be.true;

      // Event ticketsSold should decrease
      const eventData = await eventTicketing.getFunction("getEvent")(1);
      expect(eventData.ticketsSold).to.equal(0);

      // User active tickets list should be empty
      const userTickets = await eventTicketing.userTickets(buyer1.address);
      expect(userTickets.length).to.equal(0);
    });

    it("Should revert if trying to cancel already cancelled ticket", async function () {
      await eventTicketing.connect(buyer1).cancelTicket(0);

      await expect(
        eventTicketing.connect(buyer1).cancelTicket(0)
      ).to.be.revertedWith("Ticket has already been cancelled");
    });

    it("Should revert if unauthorized user attempts to cancel", async function () {
      await expect(
        eventTicketing.connect(buyer2).cancelTicket(0)
      ).to.be.revertedWith("You are not the owner of this ticket");
    });
  });

  describe("5. Ticket Verification", function () {
    beforeEach(async function () {
      await eventTicketing
        .connect(organizer)
        .createEvent("AI & Web3 Hack", "Build agents", TICKET_PRICE, 5);
      await eventTicketing.connect(buyer1).buyTicket(1, { value: TICKET_PRICE });
    });

    it("Should verify a valid active ticket", async function () {
      const [isValid, eventId, ownerAddr, isCancelled] = await eventTicketing.verifyTicket(0);

      expect(isValid).to.be.true;
      expect(eventId).to.equal(1);
      expect(ownerAddr).to.equal(buyer1.address);
      expect(isCancelled).to.be.false;
    });

    it("Should return invalid for cancelled ticket", async function () {
      await eventTicketing.connect(buyer1).cancelTicket(0);

      const [isValid, eventId, ownerAddr, isCancelled] = await eventTicketing.verifyTicket(0);

      expect(isValid).to.be.false;
      expect(eventId).to.equal(1);
      expect(ownerAddr).to.equal(buyer1.address);
      expect(isCancelled).to.be.true;
    });

    it("Should return invalid for non-existent ticket", async function () {
      const [isValid, eventId, ownerAddr, isCancelled] = await eventTicketing.verifyTicket(999);

      expect(isValid).to.be.false;
      expect(eventId).to.equal(0);
      expect(ownerAddr).to.equal(ethers.ZeroAddress);
      expect(isCancelled).to.be.false;
    });
  });
});
