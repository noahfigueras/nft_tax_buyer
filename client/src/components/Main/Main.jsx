import logo from './nft.png';
import React, { useState } from 'react';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import './Main.css';

const Main = () => {
	// Hooks 
  const inputPlaceHolder = "https://opensea.io/assets/0x...";
  const [input, setInput] = useState("");
	const [alerts, setAlerts] = useState([]);
	const [batch, setBatch] = useState([]);
	
	// Functions
	const addToBatch = () => {
		// Reset Alerts
		setAlerts([]);
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
				return setAlerts(oldA => [...oldA, "Token alredy added to the batch"]); 
			}
		};

		// Add to batch
		return setBatch(oldB => [...oldB,
		{
			standard: "ERC721",
			contract: contractAddr,
			id: id
		}]);
	}
	
	const handleRemoveItem = (e) => {
		const name = e.target.getAttribute("name")
		console.log(name);
		setBatch(batch.filter((item,id) => id != name));
	}

  return(
		 <div className="App-header">
			<img src={logo} className="App-logo" alt="alien" />
			<p>Paste OpenSea url of an NFT you want to sell &#11015;&#65039;</p>
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
			</InputGroup>
			<div id="alertBox">
				{alerts.map((a,id) => (
 					<Alert key={id} variant="primary">
     				{a}
		   		</Alert>
				))}
			</div>
			<div>
				{batch.map((b,id) => (
 					<div className="nft-batch" key={id}>
						<div className="nft-id">
							<p>Contract: {b.contract}</p>
							<p>TokenID: {b.id}</p>
						</div>
						<Button onClick={handleRemoveItem} name={id} className="nft-remove" variant="danger">Delete</Button>
		   		</div>
				))}
			</div>
		</div> 
  );
};

export default Main;
