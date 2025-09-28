// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./UserVerification.sol";

/**
 * @title ServiceManager
 * @dev Manages services with start and end locations, allowing users to accept and track services
 */
contract ServiceManager is Ownable {
    
    // Dependencies
    UserVerification public userVerification;
    address public serviceNFT;
    
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
    
    constructor(address _userVerification, address _serviceNFT) Ownable(msg.sender) {
        userVerification = UserVerification(_userVerification);
        serviceNFT = _serviceNFT;
    }
    
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
        require(userVerification.isUserVerified(msg.sender), "User must be verified to create services");
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(deadline > block.timestamp, "Deadline must be in the future");
        require(msg.value >= reward, "Insufficient payment for reward");
        
        // Mint NFT representing the service
        (bool success, bytes memory data) = serviceNFT.call(
            abi.encodeWithSignature(
                "mintServiceNFT(address,string,string,int256,int256,string,int256,int256,string,uint256,uint256)",
                msg.sender,
                title,
                description,
                startLat,
                startLon,
                startAddress,
                endLat,
                endLon,
                endAddress,
                reward,
                deadline
            )
        );
        
        require(success, "Failed to mint service NFT");
        
        uint256 tokenId = abi.decode(data, (uint256));
        uint256 serviceId = nextServiceId++;
        
        // Store minimal service data for backward compatibility
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
        
        return tokenId; // Return NFT token ID instead of service ID
    }
    
    /**
     * @dev Accept a service NFT
     * @param tokenId Token ID of the service NFT to accept
     */
    function acceptService(uint256 tokenId) external {
        require(userVerification.isUserVerified(msg.sender), "User must be verified to accept services");
        
        // Accept the service NFT (this will transfer ownership to the accepter)
        (bool success,) = serviceNFT.call(
            abi.encodeWithSignature("acceptServiceNFT(uint256,address)", tokenId, msg.sender)
        );
        
        require(success, "Failed to accept service NFT");
        
        emit ServiceAccepted(tokenId, msg.sender, address(0)); // Creator will be retrieved from NFT
    }
    
    /**
     * @dev Complete a service NFT (only by the accepter)
     * @param tokenId Token ID of the service NFT to complete
     */
    function completeService(uint256 tokenId) external payable {
        // Complete and burn the service NFT (this will transfer reward to the accepter)
        (bool success,) = serviceNFT.call{value: msg.value}(
            abi.encodeWithSignature("completeAndBurnServiceNFT(uint256)", tokenId)
        );
        
        require(success, "Failed to complete service NFT");
        
        emit ServiceCompleted(tokenId, msg.sender, address(0), 0); // Details will be retrieved from NFT
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
     * @dev Get user's verification information
     * @param userAddress Address of the user
     */
    function getUserInfo(address userAddress) external view returns (
        bool isVerified,
        string memory fullName,
        string memory attestationId,
        uint256 verifiedAt
    ) {
        if (userVerification.isUserVerified(userAddress)) {
            UserVerification.VerifiedUser memory user = userVerification.getVerifiedUser(userAddress);
            return (
                true,
                string(abi.encodePacked(user.firstName, " ", user.lastName)),
                user.attestationId,
                user.verifiedAt
            );
        } else {
            return (false, "", "", 0);
        }
    }
    
    /**
     * @dev Get service data from NFT
     * @param tokenId Token ID of the service NFT
     */
    function getServiceDataFromNFT(uint256 tokenId) external view returns (
        uint256 id,
        address creator,
        string memory title,
        string memory description,
        int256 startLat,
        int256 startLon,
        string memory startAddress,
        int256 endLat,
        int256 endLon,
        string memory endAddress,
        uint256 reward,
        uint256 deadline,
        address acceptedBy,
        bool completed,
        bool burned,
        uint256 createdAt,
        uint256 acceptedAt,
        uint256 completedAt
    ) {
        (bool success, bytes memory data) = serviceNFT.staticcall(
            abi.encodeWithSignature("getServiceData(uint256)", tokenId)
        );
        
        require(success, "Failed to get service data from NFT");
        
        // Decode the returned data
        return abi.decode(data, (
            uint256, address, string, string,
            int256, int256, string, int256, int256, string,
            uint256, uint256, address, bool, bool,
            uint256, uint256, uint256
        ));
    }
    
    /**
     * @dev Get service locations from NFT
     * @param tokenId Token ID of the service NFT
     */
    function getServiceLocationsFromNFT(uint256 tokenId) external view returns (
        int256 startLat,
        int256 startLon,
        string memory startAddress,
        int256 endLat,
        int256 endLon,
        string memory endAddress
    ) {
        (bool success, bytes memory data) = serviceNFT.staticcall(
            abi.encodeWithSignature("getServiceLocations(uint256)", tokenId)
        );
        
        require(success, "Failed to get service locations from NFT");
        
        // Decode the returned data
        return abi.decode(data, (int256, int256, string, int256, int256, string));
    }
    
    /**
     * @dev Get active services from NFT contract
     */
    function getActiveServicesFromNFT() external view returns (uint256[] memory) {
        (bool success, bytes memory data) = serviceNFT.staticcall(
            abi.encodeWithSignature("getActiveServices()")
        );
        
        require(success, "Failed to get active services from NFT");
        
        return abi.decode(data, (uint256[]));
    }
    
    /**
     * @dev Get user's services from NFT contract
     * @param user Address of the user
     */
    function getUserServicesFromNFT(address user) external view returns (uint256[] memory) {
        (bool success, bytes memory data) = serviceNFT.staticcall(
            abi.encodeWithSignature("getUserServices(address)", user)
        );
        
        require(success, "Failed to get user services from NFT");
        
        return abi.decode(data, (uint256[]));
    }
    
    /**
     * @dev Get user's accepted services from NFT contract
     * @param user Address of the user
     */
    function getAcceptedServicesFromNFT(address user) external view returns (uint256[] memory) {
        (bool success, bytes memory data) = serviceNFT.staticcall(
            abi.encodeWithSignature("getAcceptedServices(address)", user)
        );
        
        require(success, "Failed to get accepted services from NFT");
        
        return abi.decode(data, (uint256[]));
    }
    
    /**
     * @dev Update the user verification contract address (only owner)
     * @param _userVerification New user verification contract address
     */
    function setUserVerification(address _userVerification) external onlyOwner {
        require(_userVerification != address(0), "Invalid verification contract address");
        userVerification = UserVerification(_userVerification);
    }
    
    /**
     * @dev Update the service NFT contract address (only owner)
     * @param _serviceNFT New service NFT contract address
     */
    function setServiceNFT(address _serviceNFT) external onlyOwner {
        require(_serviceNFT != address(0), "Invalid service NFT contract address");
        serviceNFT = _serviceNFT;
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
