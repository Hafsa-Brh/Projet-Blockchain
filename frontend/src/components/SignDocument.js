import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

function SignDocument() {
  const [file, setFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [signedData, setSignedData] = useState(null);
  const [userAddress, setUserAddress] = useState('');
  const [message, setMessage] = useState(''); // for simple notifications

  // On load, connect wallet (or ask user to connect)
  useEffect(() => {
    async function connectWallet() {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          setUserAddress(accounts[0]);
        } catch (err) {
          setMessage('Connexion au portefeuille annulée');
        }
      } else {
        setMessage('Veuillez installer MetaMask');
      }
    }
    connectWallet();
  }, []);

  const handleFileChange = (e) => {
    const chosenFile = e.target.files[0];
    if (!chosenFile) return;

    setFile(chosenFile);
    setSignedData(null);
    setMessage('');

    const reader = new FileReader();
    reader.onload = (event) => {
      setFileContent(event.target.result);
    };
    reader.readAsText(chosenFile);
  };

  const sha256 = (str) => {
    // Simple SHA256 using SubtleCrypto API (browser native)
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    return window.crypto.subtle.digest('SHA-256', data).then((hashBuffer) => {
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    });
  };

  const handleSignDocument = async () => {
    if (!file || !fileContent) {
      setMessage('Veuillez sélectionner un fichier');
      return;
    }
    if (!userAddress) {
      setMessage('Veuillez connecter votre portefeuille');
      return;
    }

    try {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  const hash = await sha256(fileContent);
  const timestamp = new Date().toISOString();
  const messageToSign = `Document hash: ${hash}\nTimestamp: ${timestamp}`;

  const signature = await signer.signMessage(messageToSign);

  setSignedData({
    fileName: file.name,
    userAddress,
    signature,
    hash,
    timestamp,
  });

  setMessage('Document signé avec succès');
} catch (err) {
  setMessage('Erreur lors de la signature');
}

  };

  const handleExport = () => {
    if (!signedData) {
      setMessage('Veuillez signer le document avant d\'exporter');
      return;
    }

    const content = `
Nom du fichier: ${signedData.fileName}
Adresse: ${signedData.userAddress}
Signature: ${signedData.signature}
Hash (SHA256): ${signedData.hash}
Timestamp: ${signedData.timestamp}
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = signedData.fileName.replace(/\.[^/.]+$/, '') + '_signed.txt';
    link.click();

    URL.revokeObjectURL(url);
  };

  // Simple button style matching IdentityForm.js (adjust as needed)
  const buttonStyle = {
    padding: '8px 16px',
    marginRight: '10px',
    backgroundColor: '#3182CE', // nice blue
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
  };

  const disabledButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#A0AEC0',
    cursor: 'not-allowed',
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto',fontFamily: 'Arial, sans-serif' }}>
      <h2>Signer un document</h2>

      <input type="file" accept=".txt,.pdf,.doc,.docx" onChange={handleFileChange} style={{ marginBottom: '15px' }} />

      <div>
        <button
          style={fileContent && userAddress ? buttonStyle : disabledButtonStyle}
          onClick={handleSignDocument}
          disabled={!fileContent || !userAddress}
        >
          Signer le document
        </button>

        <button
          style={signedData ? buttonStyle : disabledButtonStyle}
          onClick={handleExport}
          disabled={!signedData}
        >
          Exporter le document signé
        </button>
      </div>

      {message && <p style={{ marginTop: '15px', fontWeight: 'bold', color: message.includes('Erreur') ? 'red' : 'green' }}>{message}</p>}

      {signedData && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#F7FAFC', border: '1px solid #CBD5E0', borderRadius: '6px', width:'950px',fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
          <p><strong>Nom du fichier:</strong> {signedData.fileName}</p>
          <p><strong>Adresse:</strong> {signedData.userAddress}</p>
          <p><strong>Signature:</strong> {signedData.signature}</p>
          <p><strong>Hash (SHA256):</strong> {signedData.hash}</p>
          <p><strong>Timestamp:</strong> {signedData.timestamp}</p>
        </div>
      )}
    </div>
  );
}

export default SignDocument;
