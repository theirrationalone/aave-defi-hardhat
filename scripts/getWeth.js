const { getNamedAccounts, ethers } = require("hardhat");

const AMOUNT = ethers.utils.parseEther("0.02").toString();

const getWeth = async () => {
    const { deployer } = await getNamedAccounts();
    const wethContractAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    const iWeth = await ethers.getContractAt("IWeth", wethContractAddress, deployer);

    console.log("\x1b[33m%s\x1b[0m", "Depositing Ethers to get Wrapped Ethers, Please Wait...");
    const txResponse = await iWeth.deposit({ value: AMOUNT });
    await txResponse.wait(1);
    console.log("\x1b[32m%s\x1b[0m", "Deposition Successful!");

    console.log("\x1b[33m%s\x1b[0m", "Please wait a bit to wrapped ethers Balance...");
    const wethBalance = await iWeth.balanceOf(deployer);
    console.log("\x1b[32m%s\x1b[0m", `You got ${ethers.utils.formatUnits(wethBalance.toString(), "ether")} WETH!`);
    console.log("");
};

module.exports = {
    getWeth,
    AMOUNT,
};
