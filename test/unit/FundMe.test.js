const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

//UNIT TEST ONLY RUN ON DEVELOPMENT CHAIN
!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Fundme", async function () {
          let fundMe
          let deployer
          let MockV3Aggregator

          const sendValueTest = ethers.utils.parseEther("1") //1 eth

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              // const accounts = await ethers.getSigner()
              // const accountsZero = accounts[0]

              await deployments.fixture(["all"])
              fundMe = await ethers.getContract("FundMe", deployer)

              MockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })

          describe("constructor", async function () {
              it("sets the aggregator address correctly", async function () {
                  const response = await fundMe.getPriceFeed()
                  assert.equal(response, MockV3Aggregator.address)
              })
          })

          describe("fund", async function () {
              it("fails if you dont send enough ETH", async function () {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!"
                  )
              })

              it("updates the amount funded data structure", async function () {
                  await fundMe.fund({ value: sendValueTest })
                  const response = await fundMe.getAddressToAmountFunded(
                      deployer
                  )

                  assert.equal(response.toString(), sendValueTest.toString())
              })

              it("adds funder to array of funders", async function () {
                  await fundMe.fund({ value: sendValueTest })
                  const funder = await fundMe.getFunder(0)

                  assert.equal(deployer, funder)
              })
          })

          describe("withdraw", async function () {
              beforeEach(async function () {
                  await fundMe.fund({ value: sendValueTest })
              })

              it("withdraws ETH from as single funder", async function () {
                  //arrage
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  //act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReciept = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReciept
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  //assert
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
              })

              it("allows to withdraw with multiple funders", async function () {
                  //arrange
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({
                          value: sendValueTest,
                      })
                  }

                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  //act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReciept = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReciept
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  //assert
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )

                  //check if the array is emptied
                  expect(fundMe.getFunder(0)).to.be.reverted

                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })

              it("only allows the owner to withdraw", async function () {
                  beforeEach(async function () {
                      await fundMe.fund({ value: sendValueTest })
                  })
                  const accounts = await ethers.getSigner(1)

                  expect(await ethers.getSigner(1)).to.be.revertedWith(
                      "FundMe__NotOwner"
                  )
              })
          })
      })
