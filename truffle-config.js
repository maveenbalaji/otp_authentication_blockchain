const HDWalletProvider = require('@truffle/hdwallet-provider');
const infuraKey = "YOUR_INFURA_KEY"; // Optional for deploying to testnet/mainnet

module.exports = {
  networks: {
      development: {
          host: "127.0.0.1",     
          port: 8545,            
          network_id: "1664",       
      },
      // Add other networks here if needed.
  },
  compilers: {
      solc: {
          version: "0.8.0", // Specify compiler version
      }
  }
};