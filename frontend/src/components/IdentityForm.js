import React, { useState } from "react";
import {
  BrowserProvider,
  keccak256,
  toUtf8Bytes,
  getBytes,
} from "ethers";

function IdentityForm() {
  const [formData, setFormData] = useState({
    name: "",
    university: "",
    role: "",
    email: "",
  });

  const [signedClaim, setSignedClaim] = useState(null);

  // Handle input changes for identity form
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Sign the JSON identity claim
  const handleSign = async () => {
    if (!window.ethereum) {
      alert("🦊 MetaMask n'est pas installé !");
      return;
    }

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const claimMessage = JSON.stringify(formData);
      const hash = keccak256(toUtf8Bytes(claimMessage));
      const signature = await signer.signMessage(getBytes(hash));

      setSignedClaim({
        message: claimMessage,
        messageHash: hash,
        signature,
        address: await signer.getAddress(),
        timestamp: new Date().toISOString(),
      });

      alert("✅ Identité signée !");
    } catch (err) {
      console.error(err);
      alert("Erreur pendant la signature.");
    }
  };

  // Export signed identity claim to JSON file
  const handleExport = () => {
    if (!signedClaim) return;

    const blob = new Blob([JSON.stringify(signedClaim, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "identity_claim.json";
    link.click();
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>🪪 Projet : Identité Numérique</h1>

      {/* Identity Form */}
      <h2>Créer et signer une identité</h2>
      <input
        name="name"
        placeholder="Nom complet"
        value={formData.name}
        onChange={handleChange}
        style={{ width: "100%", marginBottom: "10px" }}
      />
      <input
        name="university"
        placeholder="Université"
        value={formData.university}
        onChange={handleChange}
        style={{ width: "100%", marginBottom: "10px" }}
      />
      <input
        name="role"
        placeholder="Rôle"
        value={formData.role}
        onChange={handleChange}
        style={{ width: "100%", marginBottom: "10px" }}
      />
      <input
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        style={{ width: "100%", marginBottom: "10px" }}
      />
      <button onClick={handleSign} style={{ marginRight: "10px" }}>
        Signer l'identité
      </button>
      <button onClick={handleExport} disabled={!signedClaim}>
        Exporter la preuve signée
      </button>

      {signedClaim && (
        <div style={{ marginTop: "20px", whiteSpace: "pre-wrap" }}>
          <h3>Identité signée :</h3>
          <p>Message: {signedClaim.message}</p>
          <p>Signature: {signedClaim.signature}</p>
          <p>Adresse: {signedClaim.address}</p>
          <p>Timestamp: {signedClaim.timestamp}</p>
        </div>
      )}
    </div>
  );
}

export default IdentityForm;