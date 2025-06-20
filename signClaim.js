const { Wallet } = require("ethers");

// 🧠 1. Recréer ton portefeuille à partir de ta phrase mnémonique
const mnemonic = "around remember that garden border risk cute cat embark add couch begin"; // Remplace par la tienne !
const wallet = Wallet.fromPhrase(mnemonic);

// 📜 2. Définir l'attestation (revendication)
const claim = "Je suis étudiante à l’Université FSBM";

// ✍️ 3. Signer le message
wallet.signMessage(claim).then((signature) => {
    console.log("✅ Attestation signée !");
    console.log("Message :", claim);
    console.log("Adresse :", wallet.address);
    console.log("Signature :", signature);
});