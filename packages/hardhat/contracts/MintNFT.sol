// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

import "./FractionalToken.sol";

/// @notice NFT contract that allows minting and fractionalizing NFTs
contract MintNFT is ERC721, Ownable, ERC721Holder {
    uint256 public nextId;

    event Minted(address indexed owner, uint256 tokenId);
    event FractionalizedNFT(address indexed owner, uint256 tokenId, address fractionalizedToken);

    constructor() ERC721("DelTok", "DTK") Ownable(msg.sender) {}

    function mint() external {
        uint256 tokenId = nextId;
        nextId++;
        _safeMint(msg.sender, tokenId);
        emit Minted(msg.sender, tokenId);
    }

    function fractionalizeNft(uint256 tokenId, uint256 totalShares) external {
        require(ownerOf(tokenId) == msg.sender, "Not the Owner of the NFT");
        require(totalShares > 0, "Total shares must be greater than 0");

        FractionalToken fToken = new FractionalToken(
            string(abi.encodePacked("DevTok#", uint2str(tokenId))),
            "fDTK",
            totalShares,
            msg.sender
        );

        safeTransferFrom(msg.sender, address(this), tokenId);

        emit FractionalizedNFT(msg.sender, tokenId, address(fToken));
    }

    function uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j = j / 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i % 10));
            bstr[k] = bytes1(temp);
            _i /= 10;
        }
        return string(bstr);
    }
}
