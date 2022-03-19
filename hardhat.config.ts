import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

dotenv.config();


// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.8.4',
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
      {
        version: '0.6.12',
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
    ],
  },
  networks: {
    mainnet: {
      url: 'https://polygon-rpc.com/',
      // accounts: getAccounts(),
      gasPrice: 50000000000, //50 Gwei go to  the Polygon Gas Tracker to change this value to the right one.
    },
    testnet: {
      url: 'https://rpc-mumbai.maticvigil.com/',
      // accounts: getAccounts(),
      gasPrice: 30000000000,
    },
    hardhat: {
      forking: {
        url: 'https://polygon-mainnet.g.alchemy.com/v2/e3LCNA1lOmAX4YAEtv526ZNfbnqXXtdJ',
        // blockNumber: 19638689, //19638659,   19638689   19551674
        // loggingEnabled: true
      },
    },
  },
};

export default config;
