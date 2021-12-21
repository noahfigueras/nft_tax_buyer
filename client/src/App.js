import './App.css';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Main from './components/Main/Main';
import React, { useState } from 'react';

function App() {
	// Ethers Setup
	//const ethereum = window.ethereum;

	// Hooks
  const [user, setUser] = useState([false, null]);

	/*useEffect(() => {
		// Connect to Metamask
		if(ethereum.selectedAddress !== null) {
			setUser([true, ethereum.selectedAddress]);
		}
	}, []);*/

  return (
    <div className="App">
      <Navbar user={user} setUser={setUser}/>
      <Main/>
      <Footer/>
    </div>
  );
}

export default App;
