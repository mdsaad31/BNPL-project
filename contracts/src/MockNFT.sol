// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockNFT
 * @notice A simple ERC-721 for testing and demo purposes.
 *         Anyone can mint tokens for free.
 */
contract MockNFT is ERC721, Ownable {
    uint256 public nextTokenId;

    constructor(string memory name, string memory symbol) ERC721(name, symbol) Ownable(msg.sender) {}

    /**
     * @notice Mint a new NFT to the caller.
     */
    function mint() external returns (uint256) {
        uint256 tokenId = nextTokenId++;
        _mint(msg.sender, tokenId);
        return tokenId;
    }

    /**
     * @notice Mint a new NFT to a specific address.
     */
    function mintTo(address to) external returns (uint256) {
        uint256 tokenId = nextTokenId++;
        _mint(to, tokenId);
        return tokenId;
    }
}
