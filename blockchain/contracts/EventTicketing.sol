// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title EventTicketing
 * @dev A decentralized event ticketing system supporting event creation,
 * ticket purchases with ETH, ticket transfers, cancellations with refunds, and verification.
 */
contract EventTicketing {
    struct Event {
        string name;
        string description;
        uint256 ticketPrice;
        uint256 totalTickets;
        uint256 ticketsSold;
        address organizer;
    }

    // Mapping from event ID (1-indexed) => Event details
    mapping(uint256 => Event) public events;
    uint256 public eventCount;

    // Total tickets minted across all events
    uint256 public ticketCount;

    // Mapping from ticket ID => current owner address
    mapping(uint256 => address) public ticketOwner;

    // Mapping from ticket ID => event ID
    mapping(uint256 => uint256) public ticketEvent;

    // Mapping from ticket ID => cancellation status
    mapping(uint256 => bool) public ticketCancelled;

    // Events
    event EventCreated(
        uint256 indexed eventId,
        string name,
        uint256 ticketPrice,
        uint256 totalTickets,
        address indexed organizer
    );

    event TicketPurchased(
        uint256 indexed ticketId,
        uint256 indexed eventId,
        address indexed buyer
    );

    event TicketTransferred(
        uint256 indexed ticketId,
        address indexed from,
        address indexed to
    );

    event TicketCancelled(
        uint256 indexed ticketId,
        uint256 indexed eventId,
        address indexed owner
    );

    /**
     * @notice Allows an organizer to create a new event (1-indexed eventId).
     * @param _name Event title.
     * @param _description Event description.
     * @param _ticketPrice Price per ticket in wei.
     * @param _totalTickets Maximum number of tickets available.
     * @return eventId The newly created event's unique identifier (starts at 1).
     */
    function createEvent(
        string memory _name,
        string memory _description,
        uint256 _ticketPrice,
        uint256 _totalTickets
    ) public returns (uint256) {
        require(bytes(_name).length > 0, "Event name cannot be empty");
        require(_totalTickets > 0, "Total tickets must be greater than 0");

        eventCount++;
        uint256 eventId = eventCount;

        events[eventId] = Event({
            name: _name,
            description: _description,
            ticketPrice: _ticketPrice,
            totalTickets: _totalTickets,
            ticketsSold: 0,
            organizer: msg.sender
        });

        emit EventCreated(eventId, _name, _ticketPrice, _totalTickets, msg.sender);
        return eventId;
    }

    /**
     * @notice Returns details of a specific event (1-indexed).
     * @param _eventId The event identifier (1 <= eventId <= eventCount).
     */
    function getEvent(uint256 _eventId)
        public
        view
        returns (
            string memory name,
            string memory description,
            uint256 ticketPrice,
            uint256 totalTickets,
            uint256 ticketsSold,
            address organizer
        )
    {
        require(_eventId > 0 && _eventId <= eventCount, "Event does not exist");
        Event memory e = events[_eventId];
        return (
            e.name,
            e.description,
            e.ticketPrice,
            e.totalTickets,
            e.ticketsSold,
            e.organizer
        );
    }

    /**
     * @notice Returns total number of events created.
     */
    function getEventCount() public view returns (uint256) {
        return eventCount;
    }

    /**
     * @notice Buy a ticket for an event with exact ETH payment.
     * @param _eventId The event identifier (1 <= eventId <= eventCount).
     * @return ticketId The newly minted ticket ID.
     */
    function buyTicket(uint256 _eventId) public payable returns (uint256) {
        require(_eventId > 0 && _eventId <= eventCount, "Event does not exist");
        Event storage e = events[_eventId];
        require(msg.value == e.ticketPrice, "Incorrect ticket price");
        require(e.ticketsSold < e.totalTickets, "Event is sold out");

        uint256 ticketId = ticketCount;
        ticketCount++;

        e.ticketsSold++;
        ticketOwner[ticketId] = msg.sender;
        ticketEvent[ticketId] = _eventId;
        ticketCancelled[ticketId] = false;

        emit TicketPurchased(ticketId, _eventId, msg.sender);
        return ticketId;
    }

    /**
     * @notice Returns an array of active (non-cancelled) ticket IDs owned by a user.
     * @param _user The address of the user.
     */
    function userTickets(address _user) public view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < ticketCount; i++) {
            if (ticketOwner[i] == _user && !ticketCancelled[i]) {
                count++;
            }
        }

        uint256[] memory tickets = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < ticketCount; i++) {
            if (ticketOwner[i] == _user && !ticketCancelled[i]) {
                tickets[index] = i;
                index++;
            }
        }

        return tickets;
    }

    /**
     * @notice Transfers a ticket from current owner to a new wallet.
     * @param _ticketId The ticket identifier.
     * @param _to The recipient wallet address.
     */
    function transferTicket(uint256 _ticketId, address _to) public {
        require(_ticketId < ticketCount, "Ticket does not exist");
        require(ticketOwner[_ticketId] == msg.sender, "You are not the owner of this ticket");
        require(!ticketCancelled[_ticketId], "Ticket has been cancelled");
        require(_to != address(0), "Recipient cannot be zero address");
        require(_to != msg.sender, "Cannot transfer ticket to yourself");

        ticketOwner[_ticketId] = _to;

        emit TicketTransferred(_ticketId, msg.sender, _to);
    }

    /**
     * @notice Cancels a ticket and sends a refund if applicable.
     * @param _ticketId The ticket identifier.
     */
    function cancelTicket(uint256 _ticketId) public {
        require(_ticketId < ticketCount, "Ticket does not exist");
        require(ticketOwner[_ticketId] == msg.sender, "You are not the owner of this ticket");
        require(!ticketCancelled[_ticketId], "Ticket has already been cancelled");

        ticketCancelled[_ticketId] = true;
        uint256 eventId = ticketEvent[_ticketId];
        Event storage e = events[eventId];

        if (e.ticketsSold > 0) {
            e.ticketsSold--;
        }

        uint256 refundAmount = e.ticketPrice;
        if (refundAmount > 0) {
            (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
            require(success, "ETH refund failed");
        }

        emit TicketCancelled(_ticketId, eventId, msg.sender);
    }

    /**
     * @notice Verifies if a ticket ID is valid and returns its details.
     * @param _ticketId The ticket identifier.
     */
    function verifyTicket(uint256 _ticketId)
        public
        view
        returns (
            bool isValid,
            uint256 eventId,
            address owner,
            bool isCancelled
        )
    {
        if (_ticketId >= ticketCount) {
            return (false, 0, address(0), false);
        }

        bool cancelled = ticketCancelled[_ticketId];
        return (!cancelled, ticketEvent[_ticketId], ticketOwner[_ticketId], cancelled);
    }
}
