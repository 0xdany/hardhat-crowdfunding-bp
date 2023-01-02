const { network, ethers } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
require("dotenv").config()

// get 2 data from hre(hardhat runtime environment)
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    //AUTO-switching for address in different network/
    //const EthUsdPriceFeedAddress = networkConfig[chainId]["EthUsdPriceFeed"]
    //mocks
    let EthUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        EthUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        EthUsdPriceFeedAddress = networkConfig[chainId]["EthUsdPriceFeed"]
    }

    // console.log("----------------")
    // const deployerCheck = await ethers.getSigners()
    // console.log("Deploying contract with account:", deployer.address)
    // console.log(
    //     "Account balance:",
    //     (await deployerCheck.getBalance()).toString()
    // )
    // console.log("----------------")

    const args = [EthUsdPriceFeedAddress]

    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, //put instructor agrument
        log: true,
        waitConfirmations: network.config.blockConfiramtions || 1,
    })

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args)
    }
    log("---------------------------------")
}

module.exports.tags = ["all", "fundme"]
