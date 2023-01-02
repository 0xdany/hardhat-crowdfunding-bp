const { version } = require("chai")
const { TASK_NODE } = require("hardhat/builtin-tasks/task-names")

require("@nomicfoundation/hardhat-toolbox")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-gas-reporter")
require("solidity-coverage")
require("dotenv").config()
require("solidity-coverage")
require("hardhat-deploy")

const GEORLI_URL = process.env.GEORLI_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const CMC_API_KEY = process.env.CMC_API_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    //solidity: "0.8.8",
    solidity: {
        compilers: [{ version: "0.8.8" }, { version: "0.6.6" }],
    },

    defaultNetwork: "hardhat",
    networks: {
        georli: {
            url: GEORLI_URL || "",
            accounts: [PRIVATE_KEY],
            chainId: 5,
            blockConfirmations: 6,
        },
    },

    namedAccounts: {
        deployer: {
            default: 0,
        },
        user: {
            default: 2,
        },
    },

    gasReporter: {
        enabled: false,
        outputFile: "gas-reporter.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: CMC_API_KEY,
    },

    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
}
