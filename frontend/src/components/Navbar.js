import React from 'react';

function Navbar({ activePage, setActivePage }) {
  return (
    <nav style={{ display: 'flex', gap: '20px', justifyContent: 'center', padding: '10px', background: '#eee' }}>
      <button
        style={{ fontWeight: activePage === 'identity' ? 'bold' : 'normal' }}
        onClick={() => setActivePage('identity')}
      >
        Créer Identité
      </button>

      <button
        style={{ fontWeight: activePage === 'sign' ? 'bold' : 'normal' }}
        onClick={() => setActivePage('sign')}
      >
        Signer Document
      </button>

      <button
        style={{ fontWeight: activePage === 'verify' ? 'bold' : 'normal' }}
        onClick={() => setActivePage('verify')}
      >
        Vérifier Attestation
      </button>
    </nav>
  );
}

export default Navbar;
