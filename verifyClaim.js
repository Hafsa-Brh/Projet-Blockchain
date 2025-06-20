const { verifyMessage } = require("ethers");

// ✉️ Le message signé qu'on veut vérifier
const message = "Je suis étudiante à l’Université FSBM";

// 🖊️ La signature générée précédemment (copie-la depuis ton terminal après `signClaim.js`)
const signature = "0x8f94ba0fc1acb53253bccedde2aacd5d0eb92fff7a768ee31d90ac9c7e067063457e905334ac0a62a61ad02876debe2f0dbab92f42ca99a062a30711487b83f71b"; // <-- à remplacer

// 🏷️ L'adresse censée être celle de la signataire (copie ton adresse publique)
const expectedAddress = "0x427cF29B107189F87C92cE322e2d977843d3cDA2";

// ✅ Vérification de la signature
async function verify() {
    const recoveredAddress = await verifyMessage(message, signature);

    console.log("Adresse retrouvée :", recoveredAddress);
    console.log("Adresse attendue  :", expectedAddress);

    if (recoveredAddress.toLowerCase() === expectedAddress.toLowerCase()) {
        console.log("✅ Signature valide : ce message a bien été signé par cette adresse.");
    } else {
        console.log("❌ Signature invalide : l’adresse ne correspond pas.");
    }
}

verify();