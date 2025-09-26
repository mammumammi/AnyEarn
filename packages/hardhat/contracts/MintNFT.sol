//SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MintNFT is ERC721{
    //multiple owners holdable NFT

    uint256 public nextId;

    constructor() ERC721("DelTok","DTK") {}
    event Minted(address indexed owner, uint256 tokenId);
    function mint() external {
        uint256 tokenId = nextId;
        nextId++;

        _safeMint(msg.sender, tokenId);
        emit Minted(msg.sender, tokenId);
        
    }

    function show() external view returns(uint256){
        return nextId;
    }

}