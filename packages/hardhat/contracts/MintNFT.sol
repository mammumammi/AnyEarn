//SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MintNFT is ERC721{
    //multiple owners holdable NFT

    uint256 public nextId;

    constructor() ERC721("DelTok","DTK") {}

    function mint() external returns(uint256){
        uint256 tokenId = nextId;
        nextId++;
        return tokenId;
    }

}