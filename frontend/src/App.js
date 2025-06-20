import React, { useState } from 'react';
import Navbar from './components/Navbar';
import IdentityForm from './components/IdentityForm';
import VerifyClaim from './components/VerifyClaim';
import SignDocument from './components/SignDocument';
import VerifyDocument from './components/VerifyDoc';

function App() {
  // State to track which page/component to show
  const [activePage, setActivePage] = useState('identity');

  // Render the component based on activePage
  const renderPage = () => {
    switch (activePage) {
      case 'identity':
        return <IdentityForm />;
      case 'verify':
        return <VerifyClaim />;
      case 'sign':
        return <SignDocument />;
      case 'verifyDocument':
        return <VerifyDocument />;
      default:
        return <IdentityForm />;
    }
  };

  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>🪪 Projet : Identité Numérique</h1>
      <Navbar activePage={activePage} setActivePage={setActivePage} />
      <main style={{ padding: '20px' }}>
        {renderPage()}
      </main>
    </div>
  );
}

export default App;