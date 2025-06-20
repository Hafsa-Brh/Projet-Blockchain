import React, { useState } from "react";


const VerifyClaim = () => {
  const [fileData, setFileData] = useState(null);
  const [address, setAddress] = useState("");
  const [signature, setSignature] = useState("");
  const [message, setMessage] = useState("");
  const [verificationResult, setVerificationResult] = useState(null); // { valid: bool, address: string }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = JSON.parse(event.target.result);
        setFileData(content);
        setAddress(content.address || "");
        setSignature(content.signature || "");
        setMessage(content.message || "");
        setVerificationResult(null); // reset on new file
      } catch {
        alert("Fichier invalide ou mal formaté");
      }
    };
    reader.readAsText(file);
  };

  const verifySignature = async () => {
    if (!address || !signature || !message) {
      alert("Tous les champs doivent être remplis");
      return;
    }

    try {
      if (!window.ethereum) {
        alert("MetaMask est requis pour vérifier la signature");
        return;
      }
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const ethers = require("ethers");
      const recoveredAddress = ethers.utils.verifyMessage(message, signature);

      const valid = recoveredAddress.toLowerCase() === address.toLowerCase();

      setVerificationResult({ valid, address: recoveredAddress });
    } catch (error) {
      alert("Erreur lors de la vérification : " + error.message);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ fontSize: "2.2rem", marginBottom: "20px" }}>Vérifier une identité signée</h1>

      <input
        type="file"
        accept=".json"
        onChange={handleFileChange}
        style={{
          padding: "10px 20px",
          cursor: "pointer",
          borderRadius: "5px",
          border: "1px solid #ccc",
          marginBottom: "15px",
          display: "block",
        }}
      />

      <label style={{ display: "block", marginTop: "10px", fontWeight: "bold" }}>Adresse Ethereum attendue:</label>
      <input
        type="text"
        value={address}
        readOnly
        style={{ width: "100%", padding: "8px", marginBottom: "15px", borderRadius: "5px", border: "1px solid #ccc" }}
      />

      <label style={{ display: "block", marginTop: "10px", fontWeight: "bold" }}>Signature:</label>
      <textarea
        value={signature}
        readOnly
        rows={3}
        style={{ width: "100%", padding: "8px", marginBottom: "15px", borderRadius: "5px", border: "1px solid #ccc", fontFamily: "monospace" }}
      />

      <label style={{ display: "block", marginTop: "10px", fontWeight: "bold" }}>Message:</label>
      <textarea
        value={message}
        readOnly
        rows={4}
        style={{ width: "100%", padding: "8px", marginBottom: "15px", borderRadius: "5px", border: "1px solid #ccc" }}
      />

      <button
        onClick={verifySignature}
        disabled={!address || !signature || !message}
        style={{
          backgroundColor: !address || !signature || !message ? "#ccc" : "#4a90e2",
          color: "white",
          padding: "12px 25px",
          border: "none",
          borderRadius: "5px",
          cursor: !address || !signature || !message ? "not-allowed" : "pointer",
          fontWeight: "bold",
          fontSize: "1rem",
        }}
      >
        Vérifier
      </button>

      {verificationResult && (
        <div
          style={{
            marginTop: "25px",
            padding: "15px",
            borderRadius: "8px",
            border: `2px solid ${verificationResult.valid ? "green" : "red"}`,
            backgroundColor: verificationResult.valid ? "#e0f8e0" : "#f9d6d5",
            fontSize: "1.1rem",
            fontWeight: "bold",
          }}
        >
          <p>Adresse retrouvée: {verificationResult.address}</p>
          <p style={{ color: verificationResult.valid ? "green" : "red" }}>
            Signature {verificationResult.valid ? "valide" : "invalide"}
          </p>
        </div>
      )}
    </div>
  );
};

export default VerifyClaim;
