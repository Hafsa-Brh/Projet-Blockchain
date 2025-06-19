const { Wallet } = require("ethers");

const wallet = Wallet.createRandom();

console.log("Adresse publique :", wallet.address);
console.log("Clé privée :", wallet.privateKey);
console.log("Phrase mnémonique :", wallet.mnemonic.phrase);
