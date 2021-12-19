const { expect } = require("chai");

describe("Safe Transfer Reciever Contract", function() {
  it("ERC721 should hit contract and transfer to vault", async function() {
    const Contract = await ethers.getContractFactory("SmartContract");
    const contract = await Contract.deploy();
    await contract.deployed();

    const Nft_mock = await ethers.getContractFactory("MyERC721");
    const nft_mock = await Nft_mock.deploy();
    await nft_mock.deployed();

    const id = 1;
    const [owner, vault] = await ethers.getSigners();

    await contract.recieve({value: ethers.utils.parseUnits("1.0")});
    await contract.setVault(vault.address);

    const transfer = await nft_mock['safeTransferFrom(address,address,uint256)'](owner.address,contract.address,id); 
    const tx = await transfer.wait();
    console.log('NFT Transfer succesfull');

    expect(await nft_mock.ownerOf(id)).to.equal(vault.address);
  });
});
