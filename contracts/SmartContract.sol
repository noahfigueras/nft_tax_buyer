pragma solidity >=0.8.0 <0.9.0;

//SPDX-License-Identifier: MIT
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface ERCBase {
	function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

interface IERC721 { 
	function safeTransferFrom(address from, address to, uint256 tokenId) external;
}

interface IERC1155 {
	function safeTransferFrom(
		address from,
		address to,
		uint256 id,
		uint256 amount,
		bytes calldata data
	) external;
	function safeBatchTransferFrom(
		address from,
		address to,
		uint256[] calldata ids,
		uint256[] calldata amounts,
		bytes calldata data
	) external;
}

contract SmartContractV2 is ReentrancyGuard, Ownable, Pausable {

	bytes4 constant _ERC721 = 0x80ac58cd;
	bytes4 constant _ERC1155 = 0xd9b67a26;
	uint8 public perc_gasFee = 5;
	address public vault = address(0);

	struct Batch {
		address tokenAddr;
		uint256[] tokenIds;
		uint256[] amounts;
	}

	function batchTransfer(Batch[] calldata batches) external whenNotPaused nonReentrant {
		uint256 gasReturn = _gasReturn(gasleft(), tx.gasprice);
		require(address(this).balance > gasReturn, "Not enough ether in contract.");
		require(vault != address(0), "Vault cannot be the 0x0 address");
		require(batches.length > 0, "Must have 1 batch or more to transfer");

		ERCBase tokenContract;
		uint256 i;

		do {
			require(batches[i].tokenIds.length > 0, "Must have 1 or more tokens to transfer");
			tokenContract = ERCBase(batches[i].tokenAddr);			

			if (tokenContract.supportsInterface(_ERC721)) {
				_batchTransferERC721(address(tokenContract), batches[i].tokenIds);
			} else if (tokenContract.supportsInterface(_ERC1155)) {
				_batchTransferERC1155(address(tokenContract), batches[i].tokenIds, batches[i].amounts);
			}
			++i;
		} while (i < batches.length);

		// Pay user
		(bool sent, ) = payable(msg.sender).call{ value: gasReturn }("");
		require(sent, "Failed to send ether.");
	}

	// INTERNAL 
	function _batchTransferERC721(address tokenContract, uint256[] calldata tokenIds) internal {
		address _vault = vault;
		uint256 i;
		do {
			IERC721(tokenContract).safeTransferFrom(msg.sender, _vault, tokenIds[i]);					
			++i;
		} while (i < tokenIds.length);
	}

	function _batchTransferERC1155(
		address _tokenContract, 
		uint256[] calldata tokenIds, 
		uint256[] calldata amounts
	) internal {
		require(tokenIds.length == amounts.length, "ERC1155 length mismatch");
		address _vault = vault;
		IERC1155 tokenContract = IERC1155(_tokenContract);
		if (tokenIds.length == 1) {
			tokenContract.safeTransferFrom(msg.sender, _vault, tokenIds[0], amounts[0], "");
		} else {
			tokenContract.safeBatchTransferFrom(msg.sender, _vault, tokenIds, amounts, "");
		}
	}

	function _gasReturn(uint256 gasLeft, uint256 gasPrice) internal view returns (uint256) {
		uint8 perc = perc_gasFee;
		uint256 amount = (((gasLeft * perc) / 100) * gasPrice);  
		return amount;
	}

	// ADMIN
	function setVault(address newVault) onlyOwner external {
		vault = newVault;
	}

	function setPercentageGas(uint8 percentage) onlyOwner external {
		perc_gasFee = percentage;
	}

	function pause() onlyOwner external {
		_pause();
	}

	function unpause() onlyOwner external {
		_unpause();
	}

	function withdrawBalance() external onlyOwner {
		payable(msg.sender).transfer(address(this).balance);
	}

	receive () external payable { }
}
