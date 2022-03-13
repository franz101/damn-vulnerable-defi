require("@nomiclabs/hardhat-waffle");
require('@openzeppelin/hardhat-upgrades');
require('hardhat-dependency-compiler');
require('dotenv').config()

module.exports = {
  defaultNetwork: "rinkeby",
  networks: {
    hardhat: {
    },
    rinkeby: {
      url: process.env.API_ENDPOINT
      //,accounts: [process.env.API_KEY]
    }
  },
      solidity: {
      compilers: [
        { version: "0.8.7" },
        { version: "0.7.6" },
        { version: "0.6.6" }
      ]
    },
  
  dependencyCompiler: {
      paths: [
        '@gnosis.pm/safe-contracts/contracts/GnosisSafe.sol',
        '@gnosis.pm/safe-contracts/contracts/proxies/GnosisSafeProxyFactory.sol',
      ],
    }
}
