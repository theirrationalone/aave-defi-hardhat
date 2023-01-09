require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL || "MAINNET_RPC_URL___not_provided";
const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL || "GOERLI_RPC_URL___not_provided";
const METAMASK_PRIVATE_KEY = process.env.METAMASK_PRIVATE_KEY || "METAMASK_PRIVATE_KEY___not_provided";
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "COINMARKETCAP_API_KEY___not_provided";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "ETHERSCAN_API_KEY___not_provided";

module.exports = {
    defaultNetwork: "hardhat",
    solidity: {
        compilers: [
            { version: "0.8.0" },
            { version: "0.6.6" },
            { version: "0.6.12" },
            { version: "0.6.0" },
            { version: "0.4.19" },
        ],
    },
    networks: {
        goerli: {
            url: GOERLI_RPC_URL,
            accounts: [METAMASK_PRIVATE_KEY],
            chainId: 5,
            blockConfirmations: 6,
        },
        hardhat: {
            chainId: 31337,
            forking: {
                url: MAINNET_RPC_URL,
            },
        },
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
        users: {
            default: 1,
        },
    },
    gasRporter: {
        enabled: true,
        noColors: true,
        currency: "USD",
        token: "MATIC",
        outputFile: "gas-report.txt",
        coinmarketcap: COINMARKETCAP_API_KEY,
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    mocha: {
        timeout: 1000 * 60 * 5,
    },
};
