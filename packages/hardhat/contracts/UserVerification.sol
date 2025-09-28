// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title UserVerification
 * @dev Manages user verification status and stores verified user information from SelfCore
 */
contract UserVerification is Ownable {
    
    struct VerifiedUser {
        address userAddress;
        string firstName;
        string lastName;
        string attestationId;
        uint256 verifiedAt;
        bool isActive;
    }
    
    // State variables
    mapping(address => VerifiedUser) public verifiedUsers;
    mapping(string => address) public attestationToUser; // Maps attestationId to user address
    address[] public verifiedAddresses;
    
    // Events
    event UserVerified(
        address indexed userAddress,
        string firstName,
        string lastName,
        string attestationId,
        uint256 verifiedAt
    );
    
    event UserRevoked(address indexed userAddress);
    
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Verify a user with their SelfCore attestation data (owner only)
     * @param userAddress Address of the user to verify
     * @param firstName First name from SelfCore verification
     * @param lastName Last name from SelfCore verification
     * @param attestationId SelfCore attestation ID
     */
    function verifyUser(
        address userAddress,
        string memory firstName,
        string memory lastName,
        string memory attestationId
    ) external onlyOwner {
        require(userAddress != address(0), "Invalid user address");
        require(bytes(firstName).length > 0, "First name cannot be empty");
        require(bytes(lastName).length > 0, "Last name cannot be empty");
        require(bytes(attestationId).length > 0, "Attestation ID cannot be empty");
        require(!verifiedUsers[userAddress].isActive, "User already verified");
        require(attestationToUser[attestationId] == address(0), "Attestation already used");
        
        VerifiedUser memory newUser = VerifiedUser({
            userAddress: userAddress,
            firstName: firstName,
            lastName: lastName,
            attestationId: attestationId,
            verifiedAt: block.timestamp,
            isActive: true
        });
        
        verifiedUsers[userAddress] = newUser;
        attestationToUser[attestationId] = userAddress;
        verifiedAddresses.push(userAddress);
        
        emit UserVerified(userAddress, firstName, lastName, attestationId, block.timestamp);
    }

    /**
     * @dev Self-verify a user with their SelfCore attestation data (public)
     * @param firstName First name from SelfCore verification
     * @param lastName Last name from SelfCore verification
     * @param attestationId SelfCore attestation ID
     */
    function selfVerify(
        string memory firstName,
        string memory lastName,
        string memory attestationId
    ) external {
        address userAddress = msg.sender;
        require(userAddress != address(0), "Invalid user address");
        require(bytes(firstName).length > 0, "First name cannot be empty");
        require(bytes(lastName).length > 0, "Last name cannot be empty");
        require(bytes(attestationId).length > 0, "Attestation ID cannot be empty");
        require(!verifiedUsers[userAddress].isActive, "User already verified");
        require(attestationToUser[attestationId] == address(0), "Attestation already used");
        
        VerifiedUser memory newUser = VerifiedUser({
            userAddress: userAddress,
            firstName: firstName,
            lastName: lastName,
            attestationId: attestationId,
            verifiedAt: block.timestamp,
            isActive: true
        });
        
        verifiedUsers[userAddress] = newUser;
        attestationToUser[attestationId] = userAddress;
        verifiedAddresses.push(userAddress);
        
        emit UserVerified(userAddress, firstName, lastName, attestationId, block.timestamp);
    }
    
    /**
     * @dev Revoke a user's verification status
     * @param userAddress Address of the user to revoke
     */
    function revokeVerification(address userAddress) external onlyOwner {
        require(verifiedUsers[userAddress].isActive, "User not verified");
        
        verifiedUsers[userAddress].isActive = false;
        
        emit UserRevoked(userAddress);
    }
    
    /**
     * @dev Check if a user is verified
     * @param userAddress Address to check
     * @return isVerified True if user is verified and active
     */
    function isUserVerified(address userAddress) external view returns (bool isVerified) {
        return verifiedUsers[userAddress].isActive;
    }
    
    /**
     * @dev Get verified user information
     * @param userAddress Address of the user
     * @return userInfo VerifiedUser struct with user information
     */
    function getVerifiedUser(address userAddress) external view returns (VerifiedUser memory userInfo) {
        require(verifiedUsers[userAddress].isActive, "User not verified");
        return verifiedUsers[userAddress];
    }
    
    /**
     * @dev Get user's full name
     * @param userAddress Address of the user
     * @return fullName Concatenated first and last name
     */
    function getUserName(address userAddress) external view returns (string memory fullName) {
        require(verifiedUsers[userAddress].isActive, "User not verified");
        
        VerifiedUser memory user = verifiedUsers[userAddress];
        return string(abi.encodePacked(user.firstName, " ", user.lastName));
    }
    
    /**
     * @dev Get total number of verified users
     * @return count Number of verified users
     */
    function getVerifiedUserCount() external view returns (uint256 count) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < verifiedAddresses.length; i++) {
            if (verifiedUsers[verifiedAddresses[i]].isActive) {
                activeCount++;
            }
        }
        return activeCount;
    }
    
    /**
     * @dev Get all verified user addresses
     * @return addresses Array of verified user addresses
     */
    function getAllVerifiedAddresses() external view returns (address[] memory addresses) {
        uint256 activeCount = 0;
        
        // Count active users first
        for (uint256 i = 0; i < verifiedAddresses.length; i++) {
            if (verifiedUsers[verifiedAddresses[i]].isActive) {
                activeCount++;
            }
        }
        
        // Create array with active users
        address[] memory activeAddresses = new address[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < verifiedAddresses.length; i++) {
            if (verifiedUsers[verifiedAddresses[i]].isActive) {
                activeAddresses[index] = verifiedAddresses[i];
                index++;
            }
        }
        
        return activeAddresses;
    }
}
