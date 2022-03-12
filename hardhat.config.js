require("@nomiclabs/hardhat-waffle");
require('@openzeppelin/hardhat-upgrades');
require('hardhat-dependency-compiler');

module.exports = {
  defaultNetwork: "rinkeby",
  networks: {
    hardhat: {
    },
    rinkeby: {
      url: proccess.env.API_ENDPOINT,
      accounts: [privateKey1, privateKey2, ...]
    }
  },
  solidity: {
    version: "0.5.15",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  
  dependencyCompiler: {
      paths: [
        '@gnosis.pm/safe-contracts/contracts/GnosisSafe.sol',
        '@gnosis.pm/safe-contracts/contracts/proxies/GnosisSafeProxyFactory.sol',
      ],
    }
}
