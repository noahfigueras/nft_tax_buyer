import './App.css';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Main from './components/Main/Main';
import React, { useState, useEffect} from 'react';

function App() {
	// Hooks
  const [user, setUser] = useState([false, null]);

	useEffect(() => {
		// Connect to Metamask
		if(window.ethereum.selectedAddress !== null) {
			setUser([true, window.ethereum.selectedAddress]);
		}
	}, [user]);

  return (
    <div className="App">
      <Navbar user={user} setUser={setUser}/>
      <Main/>
      <Footer/>
    </div>
  );
}

export default App;
