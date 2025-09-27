// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @notice ERC20 token representing fractional ownership of an NFT
contract FractionalToken is ERC20, Ownable {
    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _totalShares,
        address originalOwner
    ) ERC20(_name, _symbol) Ownable(originalOwner) {
        _mint(originalOwner, _totalShares * (10 ** decimals()));
    }
}
