// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

import "./UserVerification.sol";

/**
 * @title ServiceNFT
 * @dev NFT contract that represents services, with sharing and burning capabilities
 */
contract ServiceNFT is ERC721, ERC721URIStorage, Ownable, ERC721Holder {
    // Dependencies
    UserVerification public userVerification;
    
    // State variables
    uint256 private _tokenIdCounter;
    
    struct Location {
        int256 latitude;   // Latitude in degrees * 10^6 (to avoid floating point)
        int256 longitude;  // Longitude in degrees * 10^6 (to avoid floating point)
        string locationAddress;    // Human-readable address
    }
    
    struct ServiceNFTData {
        uint256 tokenId;
        address creator;
        string title;
        string description;
        Location startLocation;
        Location endLocation;
        uint256 reward;
        uint256 deadline;
        address acceptedBy;
        bool completed;
        bool burned;
        uint256 createdAt;
        uint256 acceptedAt;
        uint256 completedAt;
    }
    
    // Mappings
    mapping(uint256 => ServiceNFTData) public serviceData;
    mapping(address => uint256[]) public userServices; // Creator's services
    mapping(address => uint256[]) public acceptedServices; // Accepter's services
    mapping(uint256 => uint256) public tokenReward; // Token ID to reward amount
    
    // Events
    event ServiceNFTCreated(
        uint256 indexed tokenId,
        address indexed creator,
        string title,
        uint256 reward,
        uint256 deadline
    );
    
    event ServiceNFTAccepted(
        uint256 indexed tokenId,
        address indexed accepter,
        address indexed creator
    );
    
    event ServiceNFTCompleted(
        uint256 indexed tokenId,
        address indexed accepter,
        uint256 reward
    );
    
    event ServiceNFTBurned(
        uint256 indexed tokenId,
        address indexed accepter,
        uint256 reward
    );
    
    constructor(address _userVerification) ERC721("AnyEarn Service", "AES") Ownable(msg.sender) {
        userVerification = UserVerification(_userVerification);
    }
    
    /**
     * @dev Mint a new service NFT (only callable by ServiceManager)
     * @param creator Address of the service creator
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
     * @return tokenId The minted token ID
     */
    function mintServiceNFT(
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
        uint256 deadline
    ) external onlyOwner returns (uint256) {
        require(userVerification.isUserVerified(creator), "Creator must be verified");
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(reward > 0, "Reward must be greater than 0");
        require(deadline > block.timestamp, "Deadline must be in the future");
        
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        // Mint NFT to ServiceManager contract (it will be transferred later)
        _safeMint(address(this), tokenId);
        
        // Create location structs
        Location memory startLocation = Location({
            latitude: startLat,
            longitude: startLon,
            locationAddress: startAddress
        });
        
        Location memory endLocation = Location({
            latitude: endLat,
            longitude: endLon,
            locationAddress: endAddress
        });
        
        // Store service data
        serviceData[tokenId] = ServiceNFTData({
            tokenId: tokenId,
            creator: creator,
            title: title,
            description: description,
            startLocation: startLocation,
            endLocation: endLocation,
            reward: reward,
            deadline: deadline,
            acceptedBy: address(0),
            completed: false,
            burned: false,
            createdAt: block.timestamp,
            acceptedAt: 0,
            completedAt: 0
        });
        
        tokenReward[tokenId] = reward;
        userServices[creator].push(tokenId);
        
        emit ServiceNFTCreated(tokenId, creator, title, reward, deadline);
        
        return tokenId;
    }
    
    /**
     * @dev Accept a service NFT (share ownership)
     * @param tokenId The token ID to accept
     * @param accepter Address of the accepter
     */
    function acceptServiceNFT(uint256 tokenId, address accepter) external onlyOwner {
        require(userVerification.isUserVerified(accepter), "Accepter must be verified");
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(!serviceData[tokenId].completed, "Service already completed");
        require(!serviceData[tokenId].burned, "Service already burned");
        require(serviceData[tokenId].acceptedBy == address(0), "Service already accepted");
        require(serviceData[tokenId].creator != accepter, "Cannot accept your own service");
        require(block.timestamp <= serviceData[tokenId].deadline, "Service deadline has passed");
        
        // Transfer NFT to accepter (sharing ownership)
        _transfer(address(this), accepter, tokenId);
        
        // Update service data
        serviceData[tokenId].acceptedBy = accepter;
        serviceData[tokenId].acceptedAt = block.timestamp;
        
        acceptedServices[accepter].push(tokenId);
        
        emit ServiceNFTAccepted(tokenId, accepter, serviceData[tokenId].creator);
    }
    
    /**
     * @dev Complete and burn a service NFT
     * @param tokenId The token ID to complete
     */
    function completeAndBurnServiceNFT(uint256 tokenId) external payable {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(serviceData[tokenId].acceptedBy == msg.sender, "Only accepter can complete service");
        require(!serviceData[tokenId].completed, "Service already completed");
        require(!serviceData[tokenId].burned, "Service already burned");
        require(msg.value >= serviceData[tokenId].reward, "Insufficient payment for reward");
        
        // Mark as completed
        serviceData[tokenId].completed = true;
        serviceData[tokenId].completedAt = block.timestamp;
        
        emit ServiceNFTCompleted(tokenId, msg.sender, serviceData[tokenId].reward);
        
        // Burn the NFT and transfer reward
        _burn(tokenId);
        serviceData[tokenId].burned = true;
        
        // Transfer reward to accepter
        if (serviceData[tokenId].reward > 0) {
            payable(msg.sender).transfer(serviceData[tokenId].reward);
        }
        
        emit ServiceNFTBurned(tokenId, msg.sender, serviceData[tokenId].reward);
    }
    
    /**
     * @dev Get service data for a token
     * @param tokenId The token ID
     * @return data ServiceNFTData struct
     */
    function getServiceData(uint256 tokenId) external view returns (ServiceNFTData memory data) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return serviceData[tokenId];
    }
    
    /**
     * @dev Get user's created services
     * @param user Address of the user
     * @return services Array of token IDs
     */
    function getUserServices(address user) external view returns (uint256[] memory services) {
        return userServices[user];
    }
    
    /**
     * @dev Get user's accepted services
     * @param user Address of the user
     * @return services Array of token IDs
     */
    function getAcceptedServices(address user) external view returns (uint256[] memory services) {
        return acceptedServices[user];
    }
    
    /**
     * @dev Get active services (not completed, not burned, not expired)
     * @return activeServices Array of active token IDs
     */
    function getActiveServices() external view returns (uint256[] memory activeServices) {
        uint256 totalTokens = _tokenIdCounter;
        uint256[] memory temp = new uint256[](totalTokens);
        uint256 count = 0;
        
        for (uint256 i = 0; i < totalTokens; i++) {
            if (!serviceData[i].completed && 
                !serviceData[i].burned && 
                serviceData[i].acceptedBy == address(0) &&
                block.timestamp <= serviceData[i].deadline) {
                temp[count] = i;
                count++;
            }
        }
        
        // Create properly sized array
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = temp[i];
        }
        
        return result;
    }
    
    /**
     * @dev Get creator's name for a service
     * @param tokenId The token ID
     * @return name Creator's full name
     */
    function getCreatorName(uint256 tokenId) external view returns (string memory name) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        address creator = serviceData[tokenId].creator;
        return userVerification.getUserName(creator);
    }
    
    /**
     * @dev Get accepter's name for a service
     * @param tokenId The token ID
     * @return name Accepter's full name (empty if not accepted)
     */
    function getAccepterName(uint256 tokenId) external view returns (string memory name) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        address accepter = serviceData[tokenId].acceptedBy;
        if (accepter != address(0)) {
            return userVerification.getUserName(accepter);
        }
        return "";
    }
    
    /**
     * @dev Get start location for a service
     * @param tokenId The token ID
     * @return startLocation Location struct with start coordinates and address
     */
    function getStartLocation(uint256 tokenId) external view returns (Location memory startLocation) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return serviceData[tokenId].startLocation;
    }
    
    /**
     * @dev Get end location for a service
     * @param tokenId The token ID
     * @return endLocation Location struct with end coordinates and address
     */
    function getEndLocation(uint256 tokenId) external view returns (Location memory endLocation) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return serviceData[tokenId].endLocation;
    }
    
    /**
     * @dev Get both start and end locations for a service
     * @param tokenId The token ID
     * @return startLocation Location struct with start coordinates and address
     * @return endLocation Location struct with end coordinates and address
     */
    function getServiceLocations(uint256 tokenId) external view returns (
        Location memory startLocation,
        Location memory endLocation
    ) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return (serviceData[tokenId].startLocation, serviceData[tokenId].endLocation);
    }
    
    /**
     * @dev Override tokenURI to return service metadata
     * @param tokenId The token ID
     * @return uri Token URI with service metadata
     */
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory uri) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        // Create metadata JSON
        ServiceNFTData memory data = serviceData[tokenId];
        string memory status;
        
        if (data.burned) {
            status = "Completed";
        } else if (data.completed) {
            status = "Completed";
        } else if (data.acceptedBy != address(0)) {
            status = "In Progress";
        } else {
            status = "Active";
        }
        
        // Return base64 encoded metadata
        return string(abi.encodePacked(
            "data:application/json;base64,",
            _encode(string(abi.encodePacked(
                '{"name":"', data.title, '",',
                '"description":"', data.description, '",',
                '"attributes":[',
                '{"trait_type":"Creator","value":"', _addressToString(data.creator), '"},',
                '{"trait_type":"Reward","value":"', _uintToString(data.reward), ' ETH"},',
                '{"trait_type":"Status","value":"', status, '"},',
                '{"trait_type":"Start Location","value":"', data.startLocation.locationAddress, '"},',
                '{"trait_type":"End Location","value":"', data.endLocation.locationAddress, '"},',
                '{"trait_type":"Start Coordinates","value":"', _intToString(data.startLocation.latitude), ',', _intToString(data.startLocation.longitude), '"},',
                '{"trait_type":"End Coordinates","value":"', _intToString(data.endLocation.latitude), ',', _intToString(data.endLocation.longitude), '"}',
                ']}'
            )))
        ));
    }
    
    /**
     * @dev Update user verification contract (only owner)
     * @param _userVerification New user verification contract address
     */
    function setUserVerification(address _userVerification) external onlyOwner {
        require(_userVerification != address(0), "Invalid verification contract address");
        userVerification = UserVerification(_userVerification);
    }
    
    // Helper functions
    function _encode(string memory data) internal pure returns (string memory) {
        return Base64.encode(bytes(data));
    }
    
    function _addressToString(address addr) internal pure returns (string memory) {
        return Strings.toHexString(uint160(addr), 20);
    }
    
    function _uintToString(uint256 value) internal pure returns (string memory) {
        return Strings.toString(value);
    }
    
    function _intToString(int256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        bool negative = value < 0;
        uint256 absValue = negative ? uint256(-value) : uint256(value);
        string memory str = Strings.toString(absValue);
        return negative ? string(abi.encodePacked("-", str)) : str;
    }
    
    // Required overrides
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}

// Base64 encoding library
library Base64 {
    string internal constant TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    
    function encode(bytes memory data) internal pure returns (string memory) {
        if (data.length == 0) return "";
        
        string memory table = TABLE;
        string memory result = new string(4 * ((data.length + 2) / 3));
        
        assembly {
            let tablePtr := add(table, 1)
            let resultPtr := add(result, 32)
            
            for {
                let i := 0
            } lt(i, mload(data)) {
                i := add(i, 3)
            } {
                let input := and(mload(add(data, add(32, i))), 0xffffff)
                
                let out := mload(add(tablePtr, and(shr(250, input), 0x3F)))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(shr(244, input), 0x3F))), 0xFF))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(shr(238, input), 0x3F))), 0xFF))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(shr(232, input), 0x3F))), 0xFF))
                out := shl(224, out)
                
                mstore(resultPtr, out)
                
                resultPtr := add(resultPtr, 4)
            }
            
            switch mod(mload(data), 3)
            case 1 {
                mstore(sub(resultPtr, 2), shl(240, 0x3d3d))
            }
            case 2 {
                mstore(sub(resultPtr, 1), shl(248, 0x3d))
            }
        }
        
        return result;
    }
}
