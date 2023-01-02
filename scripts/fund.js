const { getNamedAccounts, ethers } = require("hardhat")

async function main() {
    const valueFunded = ethers.utils.parseEther("0.05")
    const { deployer } = await getNamedAccounts()
    const fundMe = await ethers.getContract("FundMe", deployer)
    console.log("funding contract...")

    const transactionResponse = await fundMe.fund({
        value: valueFunded,
    })
    await transactionResponse.wait(1)
    console.log(`Funded: ${valueFunded} from`, deployer)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
