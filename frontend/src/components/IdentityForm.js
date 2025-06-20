import React, { useState } from "react";
import {
  BrowserProvider,
  verifyMessage,
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
  const [verification, setVerification] = useState({
    message: "",
    signature: "",
    expectedAddress: "",
    verifiedAddress: "",
    isValid: null,
  });

  const [doc, setDoc] = useState(null);
  const [docSignature, setDocSignature] = useState(null);

  const [docVerification, setDocVerification] = useState({
    file: null,
    hash: "",
    signature: "",
    expectedAddress: "",
    verifiedAddress: "",
    isValid: null,
  });

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
  const handleVerify = () => {
    try {
      const { message, signature, expectedAddress } = verification;
      if (!message || !signature || !expectedAddress) {
        alert("❗ Veuillez remplir tous les champs.");
        return;
      }

      const hash = keccak256(toUtf8Bytes(message));
      const recovered = verifyMessage(getBytes(hash), signature);

      const isValid =
        recovered.toLowerCase() === expectedAddress.toLowerCase();

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

  // File upload handler for document signing
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDoc(file);
      setDocSignature(null);
    }
  };

  // Sign the uploaded document
  const handleSignDocument = async () => {
    if (!doc) {
      alert("Veuillez sélectionner un fichier.");
      return;
    }

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const buffer = await doc.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const hash = keccak256(bytes);
      const signature = await signer.signMessage(bytes);

      setDocSignature({
        fileName: doc.name,
        fileHash: hash,
        signature,
        address: await signer.getAddress(),
        timestamp: new Date().toISOString(),
      });

      alert("✅ Document signé !");
    } catch (err) {
      console.error(err);
      alert("Erreur pendant la signature du document.");
    }
  };

  // Export document signature JSON
  const handleExportDocument = () => {
    if (!docSignature) return;

    const blob = new Blob([JSON.stringify(docSignature, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "document_attestation.json";
    link.click();
  };

  // Import document signature JSON for verification
  const handleImportDocument = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const json = JSON.parse(text);

      setDocVerification((prev) => ({
        ...prev,
        hash: json.fileHash,
        signature: json.signature,
        expectedAddress: json.address,
      }));
    } catch (err) {
      alert("❌ Erreur de lecture du fichier.");
      console.error(err);
    }
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

      <hr style={{ margin: "30px 0" }} />

      {/* Verify identity */}
      <h2>Vérifier une identité signée</h2>
      <input type="file" onChange={handleImport} style={{ marginBottom: "10px" }} />
      <input
        placeholder="Adresse Ethereum attendue"
        value={verification.expectedAddress}
        onChange={(e) =>
          setVerification({ ...verification, expectedAddress: e.target.value })
        }
        style={{ width: "100%", marginBottom: "10px" }}
      />
      <textarea
        rows="3"
        placeholder="Signature"
        value={verification.signature}
        onChange={(e) =>
          setVerification({ ...verification, signature: e.target.value })
        }
        style={{ width: "100%", marginBottom: "10px" }}
      />
      <textarea
        rows="5"
        placeholder="Message"
        value={verification.message}
        onChange={(e) =>
          setVerification({ ...verification, message: e.target.value })
        }
        style={{ width: "100%", marginBottom: "10px" }}
      />
      <button onClick={handleVerify}>Vérifier</button>

      {verification.isValid !== null && (
        <div style={{ marginTop: "20px" }}>
          <p>Adresse retrouvée : {verification.verifiedAddress}</p>
          <p style={{ color: verification.isValid ? "green" : "red" }}>
            {verification.isValid ? "Signature valide ✅" : "Signature invalide ❌"}
          </p>
        </div>
      )}

      <hr style={{ margin: "30px 0" }} />

      {/* Document signing */}
      <h2>Signer un document</h2>
      <input type="file" onChange={handleFileUpload} style={{ marginBottom: "10px" }} />
      <button onClick={handleSignDocument} disabled={!doc}>
        Signer le document
      </button>
      <button onClick={handleExportDocument} disabled={!docSignature} style={{ marginLeft: "10px" }}>
        Exporter la preuve de signature
      </button>

      {docSignature && (
        <div style={{ marginTop: "20px", whiteSpace: "pre-wrap" }}>
          <h3>Document signé :</h3>
          <p>Nom du fichier: {docSignature.fileName}</p>
          <p>Hash: {docSignature.fileHash}</p>
          <p>Signature: {docSignature.signature}</p>
          <p>Adresse: {docSignature.address}</p>
          <p>Timestamp: {docSignature.timestamp}</p>
        </div>
      )}

      <hr style={{ margin: "30px 0" }} />

      {/* Document verification */}
      <h2>Vérifier un document signé</h2>
      <input
        type="file"
        onChange={async (e) => {
          const file = e.target.files[0];
          if (!file) return;
          const buffer = await file.arrayBuffer();
          const bytes = new Uint8Array(buffer);
          const hash = keccak256(bytes);
          setDocVerification((prev) => ({ ...prev, file, hash }));
        }}
        style={{ marginBottom: "10px" }}
      />
      <input
        type="file"
        accept="application/json"
        onChange={handleImportDocument}
        style={{ marginBottom: "10px" }}
      />
      <input
        placeholder="Adresse Ethereum attendue"
        value={docVerification.expectedAddress}
        onChange={(e) =>
          setDocVerification((prev) => ({ ...prev, expectedAddress: e.target.value }))
        }
        style={{ width: "100%", marginBottom: "10px" }}
      />
      <textarea
        rows="2"
        placeholder="Signature"
        value={docVerification.signature}
        onChange={(e) =>
          setDocVerification((prev) => ({ ...prev, signature: e.target.value }))
        }
        style={{ width: "100%", marginBottom: "10px" }}
      />
      <button
        onClick={async () => {
          try {
            const { file, signature, expectedAddress } = docVerification;
            const buffer = await file.arrayBuffer();
            const bytes = new Uint8Array(buffer);
            const recovered = await verifyMessage(bytes, signature);

            const isValid = recovered.toLowerCase() === expectedAddress.toLowerCase();
            setDocVerification((prev) => ({
              ...prev,
              verifiedAddress: recovered,
              isValid,
            }));
          } catch (err) {
            alert("❌ Erreur pendant la vérification.");
            console.error(err);
          }
        }}
      >
        🔍 Vérifier le document
      </button>

      {docVerification.isValid !== null && (
        <div style={{ marginTop: "20px" }}>
          <p>Adresse retrouvée : {docVerification.verifiedAddress}</p>
          <p style={{ color: docVerification.isValid ? "green" : "red" }}>
            {docVerification.isValid ? "Document authentique ✅" : "Signature invalide ❌"}
          </p>
        </div>
      )}
    </div>
  );
}

export default IdentityForm;
