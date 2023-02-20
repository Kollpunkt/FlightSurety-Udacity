var HDWalletProvider = require("@truffle/hdwallet-provider");
var mnemonic = "erosion furnace duty exhaust mirror harvest proof pact anchor rabbit tiny chaos";

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 7545,            // Standard Ethereum port (default: none)
      network_id: "5777",       // Any network (default: none)

      // provider: function() {
      //   return new HDWalletProvider(mnemonic, "http://127.0.0.1:7545/", 0, 50);
      // },
      // network_id: '5777',
      // //gas: 9999999
    }
  },
  compilers: {
    solc: {
      version: "0.5.16"
    }
  }
};