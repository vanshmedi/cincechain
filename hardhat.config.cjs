// hardhat.config.js
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.26",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: "cancun", 
    },
  },
  networks: {
    hardhat: {
      // Fork Sepolia locally for testing
      // forking: { url: process.env.RPC_URL }
    },
    sepolia: {
      url:      process.env.RPC_URL || "",
      accounts: process.env.PLATFORM_PRIVATE_KEY ? [process.env.PLATFORM_PRIVATE_KEY] : [],
      chainId:  11155111,
    },
    polygon_zkevm: {
      url:      "https://zkevm-rpc.com",
      accounts: process.env.PLATFORM_PRIVATE_KEY ? [process.env.PLATFORM_PRIVATE_KEY] : [],
      chainId:  1101,
    },
  },
  etherscan: {
    apiKey: {
      sepolia:       process.env.ETHERSCAN_API_KEY || "",
      polygonZkEVM:  process.env.POLYGONSCAN_API_KEY || "",
    },
  },
  gasReporter: {
    enabled:  !!process.env.REPORT_GAS,
    currency: "USD",
    coinmarketcap: process.env.CMC_API_KEY,
  },
};
