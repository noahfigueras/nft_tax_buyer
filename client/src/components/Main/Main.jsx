import logo from './nft.png';
import React, { useState, useEffect } from 'react';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import './Main.css';
import { ethers } from 'ethers';

const Main = () => {
  // Ethers 
  let provider;
  let signer;
  if(window.ethereum) {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
  }
	// Contract
  const recieverContract = "0x41aaA0cbD93996bcF86141173E738079414f7AeD";
	const ABI = [
	 'function safeTransferFrom(address from, address to, uint256 tokenId) external',
	 'function supportsInterface(bytes4 interfaceId) public view returns (bool)',
	 'function safeTransferFrom(address from,address to,uint256 id,uint256 amount,bytes calldata data) external',
	 'function safeBatchTransferFrom(address from,address to,uint256[] calldata ids,uint256[] calldata amounts,bytes calldata data) external'
	];

	// Hooks 
  const inputPlaceHolder = "https://opensea.io/assets/0x...";
  const [input, setInput] = useState("");
	const [alerts, setAlerts] = useState([]);
	const [confirmations, setConfirmations] = useState([]);
	const [batch, setBatch] = useState([]);
  const [isPending, setPending] = useState(false);
	
	// Functions
	const addToBatch = () => {
		// Reset Alerts and confirmations
		setAlerts([]);
    setConfirmations([]);
		// Validate URL
		if(!input.includes("https://opensea.io/assets/")){
			return setAlerts(oldA => [...oldA, "Url not valid, please copy the url from opensea"]);	
		} 
		if(input.includes("matic")) {
			return setAlerts(oldA => [...oldA, "We don't buy matic tokens at the moment"]);	
		}
		if(input.includes("klaytn")) {
			return setAlerts(oldA => [...oldA, "We don't buy klatyn tokens at the moment"]);	
		}
		
		// Get Info
		const contractAddr = input.slice(26,68);
		const id = input.slice(69);

		// Check if already exists
    for(let b of batch){ 
        if((b.contract === contractAddr) && (b.id === id)){
          if(b.standard === 'ERC721') {
            return setAlerts(oldA => [...oldA, "Token alredy added to the batch"]); 
          }
          let i = batch.indexOf(b);
          let newArr =  [...batch];
          return newArr[i].value++;
        }
		};

    // Add to batch
    checkStandard(contractAddr).then((e) => {
      if(e === false) {
			  return setAlerts(oldA => [...oldA, "Incorrect contract, not supported or Please Connect to Metamask!"]);
      } 
      return setBatch(oldB => [...oldB,
        {
          standard: e,
          contract: contractAddr,
          id: id,
          value: 1
        }
      ]);
    });
	}

  // Delete Button
	const handleRemoveItem = (e) => {
		const name = e.target.getAttribute("name")
		setBatch(batch.filter((item,id) => id !== Number(name)));
  }

  // Submit to sell Button
  const handleSubmit = async () => {
    for(let b of batch) {
      try {
        let tx;
        const contract = new ethers.Contract(b.contract, ABI, signer);
        const from = await signer.getAddress();
        if(b.standard === 'ERC721') {
          const estimate = await contract.estimateGas['safeTransferFrom(address,address,uint256)'](from, recieverContract, b.id);
          const estimateGas = estimate.add(ethers.BigNumber.from("10000"));
          tx = await contract['safeTransferFrom(address,address,uint256)'](from, recieverContract, b.id, {gasLimit: estimateGas});
          setPending(true);
          await tx.wait();
        } else if (b.standard === 'ERC1155') {
          const estimate = await contract.estimateGas['safeTransferFrom(address,address,uint256,uint256,bytes)']
          (from, recieverContract, b.id, b.value, ethers.utils.arrayify("0x"));
          const estimateGas = estimate.add(ethers.BigNumber.from("10000"));
          tx = await contract['safeTransferFrom(address,address,uint256,uint256,bytes)']
          (from, recieverContract, b.id, b.value, ethers.utils.arrayify("0x"), {gasLimit: estimateGas});
          setPending(true);
          await tx.wait();
        }
        // Remove from batch
        setPending(false);
        setBatch(oldB => oldB.slice(1));
        setConfirmations(oldC => [...oldC, tx.hash]);
      } catch (e) {
        setPending(false);
			  return setAlerts(oldA => [...oldA, "Transfer of nft reverted make sure you are owner of nft and contract is correct"]);
      }
    }
  }

  const checkStandard = async (addr) => {
    const contract = new ethers.Contract(addr, ABI, signer);
    try {
      const check = await contract.supportsInterface(0xd9b67a26);
      return check === true ? 'ERC1155' : 'ERC721';
    } catch (e) {
      return false;
    }
  }
   
  useEffect(() => {
    console.log('batch updated');
  }, [batch]);
  
  return(
		 <div className="App-header">
			<img src={logo} className="App-logo" alt="alien" />
			<p>Paste OpenSea url of an NFT you want to sell &#11015;&#65039;</p>
      { window.ethereum ? (
			<InputGroup style={{padding: "20px", maxWidth: "1000px"}} className="mb-3">
					<FormControl
						placeholder={inputPlaceHolder}
						aria-label="Opensea Url"
						aria-describedby="basic-addon2"
						value={input}
						onChange={e => setInput(e.target.value)}
					/>
					<Button onClick={addToBatch} variant="outline-secondary" id="button-addon2">
						Add to sell
					</Button>
      </InputGroup> ) : (
      <Button variant="warning" href="https://metamask.io/download.html" target="_blank">Download Metamask</Button>
      )}
			<div id="alertBox">
				{alerts.map((a,id) => (
 					<Alert key={id} variant="primary">
     				{a}
		   		</Alert>
				))}
			</div>
			<div>
        {confirmations.map((c,id) => (
        <p className="p-alert" key={id}>Transaction confirmed with txID: 
        <a href={"https://etherscan.io/tx/"+c} key={id}>{c}</a>
        </p>
        ))}
				{batch.map((b,id) => (
 					<div className="nft-batch" key={id}>
						<div className="nft-id">
							<p>Contract: {b.contract}</p>
							<p>TokenID: {b.id}</p>
							<p>Amount: {b.value}</p>
						</div>
            { !isPending ? (
						<Button onClick={handleRemoveItem} name={id} className="nft-remove" variant="danger">Delete</Button>
            ) : (<Spinner className="nft-remove" animation="border" variant="light" />)
            }
		   		</div>
				))}
        {batch.length > 0 && (
          <div className="sell-btn">
            <Button onClick={handleSubmit} className="nft-remove" variant="info">Continue to sell</Button>
          </div>
        )}
			</div>
		</div> 
  );
};

export default Main;
