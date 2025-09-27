// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ServiceManager
 * @dev Manages services with start and end locations, allowing users to accept and track services
 */
contract ServiceManager is Ownable {
    
    struct Location {
        int256 latitude;   // Latitude in degrees * 10^6 (to avoid floating point)
        int256 longitude;  // Longitude in degrees * 10^6 (to avoid floating point)
        string locationAddress;    // Human-readable address
    }
    
    struct Service {
        uint256 id;
        address creator;
        string title;
        string description;
        Location startLocation;
        Location endLocation;
        uint256 reward;           // Reward amount in wei
        uint256 deadline;         // Unix timestamp
        ServiceStatus status;
        address acceptedBy;       // Address of user who accepted the service
        uint256 createdAt;
        uint256 acceptedAt;
        bool completed;
    }
    
    enum ServiceStatus {
        Active,     // Service is available for acceptance
        Accepted,   // Service has been accepted by a user
        Completed,  // Service has been completed
        Cancelled   // Service has been cancelled
    }
    
    // State variables
    uint256 public nextServiceId = 1;
    mapping(uint256 => Service) public services;
    mapping(address => uint256[]) public userServices; // Creator's services
    mapping(address => uint256[]) public acceptedServices; // User's accepted services
    
    // Events
    event ServiceCreated(
        uint256 indexed serviceId,
        address indexed creator,
        string title,
        Location startLocation,
        Location endLocation,
        uint256 reward,
        uint256 deadline
    );
    
    event ServiceAccepted(
        uint256 indexed serviceId,
        address indexed accepter,
        address indexed creator
    );
    
    event ServiceCompleted(
        uint256 indexed serviceId,
        address indexed accepter,
        address indexed creator,
        uint256 reward
    );
    
    event ServiceCancelled(
        uint256 indexed serviceId,
        address indexed creator
    );
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Create a new service
     * @param title Service title
     * @param description Service description
     * @param startLat Latitude of start location (multiplied by 10^6)
     * @param startLon Longitude of start location (multiplied by 10^6)
     * @param startAddress Human-readable start address
     * @param endLat Latitude of end location (multiplied by 10^6)
     * @param endLon Longitude of end location (multiplied by 10^6)
     * @param endAddress Human-readable end address
     * @param reward Reward amount in wei
     * @param deadline Unix timestamp deadline
     */
    function createService(
        string memory title,
        string memory description,
        int256 startLat,
        int256 startLon,
        string memory startAddress,
        int256 endLat,
        int256 endLon,
        string memory endAddress,
        uint256 reward,
        uint256 deadline
    ) external payable returns (uint256) {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(deadline > block.timestamp, "Deadline must be in the future");
        require(msg.value >= reward, "Insufficient payment for reward");
        
        uint256 serviceId = nextServiceId++;
        
        services[serviceId] = Service({
            id: serviceId,
            creator: msg.sender,
            title: title,
            description: description,
            startLocation: Location(startLat, startLon, startAddress),
            endLocation: Location(endLat, endLon, endAddress),
            reward: reward,
            deadline: deadline,
            status: ServiceStatus.Active,
            acceptedBy: address(0),
            createdAt: block.timestamp,
            acceptedAt: 0,
            completed: false
        });
        
        userServices[msg.sender].push(serviceId);
        
        emit ServiceCreated(
            serviceId,
            msg.sender,
            title,
            Location(startLat, startLon, startAddress),
            Location(endLat, endLon, endAddress),
            reward,
            deadline
        );
        
        return serviceId;
    }
    
    /**
     * @dev Accept a service
     * @param serviceId ID of the service to accept
     */
    function acceptService(uint256 serviceId) external {
        Service storage service = services[serviceId];
        require(service.id != 0, "Service does not exist");
        require(service.status == ServiceStatus.Active, "Service is not active");
        require(service.creator != msg.sender, "Cannot accept your own service");
        require(block.timestamp <= service.deadline, "Service deadline has passed");
        
        service.status = ServiceStatus.Accepted;
        service.acceptedBy = msg.sender;
        service.acceptedAt = block.timestamp;
        
        acceptedServices[msg.sender].push(serviceId);
        
        emit ServiceAccepted(serviceId, msg.sender, service.creator);
    }
    
    /**
     * @dev Complete a service (only by the accepter)
     * @param serviceId ID of the service to complete
     */
    function completeService(uint256 serviceId) external {
        Service storage service = services[serviceId];
        require(service.id != 0, "Service does not exist");
        require(service.acceptedBy == msg.sender, "Only accepter can complete service");
        require(service.status == ServiceStatus.Accepted, "Service must be accepted first");
        require(!service.completed, "Service already completed");
        
        service.status = ServiceStatus.Completed;
        service.completed = true;
        
        // Transfer reward to accepter
        if (service.reward > 0) {
            payable(msg.sender).transfer(service.reward);
        }
        
        emit ServiceCompleted(serviceId, msg.sender, service.creator, service.reward);
    }
    
    /**
     * @dev Cancel a service (only by the creator)
     * @param serviceId ID of the service to cancel
     */
    function cancelService(uint256 serviceId) external {
        Service storage service = services[serviceId];
        require(service.id != 0, "Service does not exist");
        require(service.creator == msg.sender, "Only creator can cancel service");
        require(service.status == ServiceStatus.Active, "Can only cancel active services");
        
        service.status = ServiceStatus.Cancelled;
        
        // Refund the creator
        if (service.reward > 0) {
            payable(msg.sender).transfer(service.reward);
        }
        
        emit ServiceCancelled(serviceId, msg.sender);
    }
    
    /**
     * @dev Get service details
     * @param serviceId ID of the service
     */
    function getService(uint256 serviceId) external view returns (Service memory) {
        require(services[serviceId].id != 0, "Service does not exist");
        return services[serviceId];
    }
    
    /**
     * @dev Get all services created by a user
     * @param user Address of the user
     */
    function getUserServices(address user) external view returns (uint256[] memory) {
        return userServices[user];
    }
    
    /**
     * @dev Get all services accepted by a user
     * @param user Address of the user
     */
    function getAcceptedServices(address user) external view returns (uint256[] memory) {
        return acceptedServices[user];
    }
    
    /**
     * @dev Get all active services (for browsing)
     */
    function getActiveServices() external view returns (uint256[] memory) {
        uint256[] memory activeServices = new uint256[](nextServiceId - 1);
        uint256 count = 0;
        
        for (uint256 i = 1; i < nextServiceId; i++) {
            if (services[i].status == ServiceStatus.Active) {
                activeServices[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = activeServices[i];
        }
        
        return result;
    }
    
    /**
     * @dev Withdraw contract balance (only owner)
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }
}
