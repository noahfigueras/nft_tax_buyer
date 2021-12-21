import logo from './nft.png';
import React, { useState } from 'react';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Button from 'react-bootstrap/Button';

const Main = () => {
	// Hooks 
  const [input, setInput] = useState("");
	const [batch, setBatch] = useState([]);
  const inputPlaceHolder = "https://opensea.io/assets/0x...";
	
	// Functions
	const addToBatch = () => {
		if(!input.includes("https://opensea.io/assets/")){
			return alert("Url not valid, please copy the url from opensea");	
		}
	}

  return(
		 <header className="App-header">
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
		</header> 
  );
};

export default Main;
