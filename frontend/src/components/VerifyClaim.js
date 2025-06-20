import React, { useState } from "react";
import { verifyMessage, keccak256, toUtf8Bytes, getBytes } from "ethers";

function IdentityForm() {
  const [verification, setVerification] = useState({
    message: "",
    signature: "",
    expectedAddress: "",
    verifiedAddress: "",
    isValid: null,
  });

  // Import JSON file for identity verification
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const json = JSON.parse(text);

      setVerification({
        message: json.message,
        signature: json.signature,
        expectedAddress: json.address,
        verifiedAddress: "",
        isValid: null,
      });
    } catch (err) {
      alert("❌ Erreur de lecture du fichier.");
      console.error(err);
    }
  };

  // Verify the imported identity signature
  const handleVerify = async () => {
    try {
      const { message, signature, expectedAddress } = verification;
      if (!message || !signature || !expectedAddress) {
        alert("❗ Veuillez remplir tous les champs.");
        return;
      }

      // recover address from signature
      const hash = keccak256(toUtf8Bytes(message));
      const recovered = await verifyMessage(getBytes(hash), signature);

      const isValid = recovered.toLowerCase() === expectedAddress.toLowerCase();

      setVerification({
        ...verification,
        messageHash: hash,
        verifiedAddress: recovered,
        isValid,
      });
    } catch (err) {
      console.error("Erreur vérification :", err);
      alert("⚠️ Erreur pendant la vérification.");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "20px" }}>Vérifier une identité signée</h2>

      <input
        type="file"
        accept="application/json"
        onChange={handleImport}
        style={{ marginBottom: "15px" }}
      />

      <input
        placeholder="Adresse Ethereum attendue"
        value={verification.expectedAddress}
        onChange={(e) =>
          setVerification({ ...verification, expectedAddress: e.target.value })
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

      <textarea
        rows={3}
        placeholder="Signature"
        value={verification.signature}
        onChange={(e) =>
          setVerification({ ...verification, signature: e.target.value })
        }
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "15px",
          borderRadius: "5px",
          border: "1.5px solid #ccc",
          fontSize: "16px",
          resize: "vertical",
        }}
      />

      <textarea
        rows={5}
        placeholder="Message"
        value={verification.message}
        onChange={(e) =>
          setVerification({ ...verification, message: e.target.value })
        }
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "15px",
          borderRadius: "5px",
          border: "1.5px solid #ccc",
          fontSize: "16px",
          resize: "vertical",
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
        Vérifier
      </button>

      {verification.isValid !== null && (
        <div
          style={{
            padding: "15px",
            borderRadius: "8px",
            border: `2px solid ${verification.isValid ? "green" : "red"}`,
            backgroundColor: verification.isValid ? "#e6ffe6" : "#ffe6e6",
            fontSize: "16px",
            whiteSpace: "pre-wrap",
          }}
        >
          <p>Adresse retrouvée : {verification.verifiedAddress}</p>
          <p style={{ color: verification.isValid ? "green" : "red" }}>
            {verification.isValid
              ? "Signature valide ✅"
              : "Signature invalide ❌"}
          </p>
        </div>
      )}
    </div>
  );
}

export default IdentityForm;
