import React, { useState } from "react";
import { verifyMessage } from "ethers";

function VerifyDocument() {
  const [docVerification, setDocVerification] = useState({
    file: null,
    hash: "",
    signature: "",
    expectedAddress: "",
    verifiedAddress: "",
    isValid: null,
    importedHash: "",
    importedTimestamp: "",
  });

  // Handle file upload to calculate hash
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Read file as text (same as in SignDocument)
      const fileContent = await file.text();
      
      // Calculate SHA256 hash (same method as SignDocument)
      const encoder = new TextEncoder();
      const data = encoder.encode(fileContent);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      setDocVerification((prev) => ({
        ...prev,
        file,
        hash,
        verifiedAddress: "",
        isValid: null,
      }));
    } catch (err) {
      alert("❌ Erreur lors de la lecture du fichier.");
      console.error(err);
    }
  };

  // Import signature text file (.txt)
  const handleImportSignature = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      
      // Parse the text file to extract signature, address, hash, and timestamp
      const lines = text.split('\n');
      let signature = "";
      let address = "";
      let hash = "";
      let timestamp = "";
      
      lines.forEach(line => {
        if (line.includes('Signature:')) {
          signature = line.split('Signature:')[1]?.trim() || "";
        }
        if (line.includes('Adresse:')) {
          address = line.split('Adresse:')[1]?.trim() || "";
        }
        if (line.includes('Hash (SHA256):')) {
          hash = line.split('Hash (SHA256):')[1]?.trim() || "";
        }
        if (line.includes('Timestamp:')) {
          timestamp = line.split('Timestamp:')[1]?.trim() || "";
        }
      });

      setDocVerification((prev) => ({
        ...prev,
        signature: signature,
        expectedAddress: address,
        importedHash: hash,
        importedTimestamp: timestamp,
        verifiedAddress: "",
        isValid: null,
      }));

      if (!signature || !address || !hash || !timestamp) {
        alert("❌ Impossible de lire toutes les informations du fichier.");
      }
    } catch (err) {
      alert("❌ Erreur lors de la lecture du fichier de signature.");
      console.error(err);
    }
  };

  // Verify document signature
  const handleVerify = async () => {
    try {
      const { hash, signature, expectedAddress, importedHash, importedTimestamp } = docVerification;

      if (!hash || !signature || !expectedAddress || !importedHash || !importedTimestamp) {
        alert("❗ Veuillez sélectionner tous les fichiers et importer la preuve de signature.");
        return;
      }

      // Check if the calculated hash matches the imported hash
      if (hash !== importedHash) {
        alert("❌ Le hash du fichier ne correspond pas à celui de la signature.");
        setDocVerification((prev) => ({
          ...prev,
          verifiedAddress: "N/A",
          isValid: false,
        }));
        return;
      }

      // Reconstruct the original message that was signed
      const messageToVerify = `Document hash: ${importedHash}\nTimestamp: ${importedTimestamp}`;

      // Verify the signature against the reconstructed message
      const recovered = await verifyMessage(messageToVerify, signature);

      const isValid = recovered.toLowerCase() === expectedAddress.toLowerCase();

      setDocVerification((prev) => ({
        ...prev,
        verifiedAddress: recovered,
        isValid,
      }));
    } catch (err) {
      alert("⚠️ Erreur pendant la vérification.");
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "20px" }}>Vérifier un document signé</h2>

      <label>
        Choisir le document à vérifier:
        <input
          type="file"
          onChange={handleFileChange}
          style={{ display: "block", margin: "10px 0 20px 0" }}
        />
      </label>

      <label>
        Importer la preuve de signature (TXT):
        <input
          type="file"
          accept=".txt"
          onChange={handleImportSignature}
          style={{ display: "block", margin: "10px 0 20px 0" }}
        />
      </label>

      <input
        type="text"
        placeholder="Adresse Ethereum attendue"
        value={docVerification.expectedAddress}
        onChange={(e) =>
          setDocVerification((prev) => ({
            ...prev,
            expectedAddress: e.target.value,
            isValid: null,
            verifiedAddress: "",
          }))
        }
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "15px",
          borderRadius: "5px",
          border: "1.5px solid #ccc",
          fontSize: "16px",
        }}
      />

      <button
        onClick={handleVerify}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
          borderRadius: "5px",
          border: "none",
          backgroundColor: "#007bff",
          color: "white",
          marginBottom: "20px",
        }}
      >
        🔍 Vérifier le document
      </button>

      {docVerification.isValid !== null && (
        <div
          style={{
            padding: "15px",
            borderRadius: "8px",
            border: `2px solid ${docVerification.isValid ? "green" : "red"}`,
            backgroundColor: docVerification.isValid ? "#e6ffe6" : "#ffe6e6",
            fontSize: "16px",
          }}
        >
          <p>
            Adresse retrouvée :{" "}
            <strong>{docVerification.verifiedAddress || "N/A"}</strong>
          </p>
          <p style={{ color: docVerification.isValid ? "green" : "red" }}>
            {docVerification.isValid
              ? "Document authentique ✅"
              : "Signature invalide ❌"}
          </p>
        </div>
      )}
    </div>
  );
}

export default VerifyDocument;