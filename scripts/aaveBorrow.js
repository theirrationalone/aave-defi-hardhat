const { getNamedAccounts, ethers } = require("hardhat");
const { getWeth, AMOUNT } = require("./getWeth");

const main = async () => {
    const { deployer } = await getNamedAccounts();

    const aaveLendingPoolAddressesProviderAddress = "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5";

    await getWeth();

    const lendingPool = await getLendingPool(aaveLendingPoolAddressesProviderAddress, deployer);
    const lendingPoolAddress = lendingPool.address;

    const wethContractAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

    await approveERC20Token(wethContractAddress, lendingPoolAddress, AMOUNT, deployer);

    await getUserDataFromPool(lendingPool, deployer);

    await depositCollateral(lendingPool, wethContractAddress, AMOUNT, deployer, 0);

    const { totalCollateralETH, totalDebtETH, availableBorrowsETH } = await getUserDataFromPool(lendingPool, deployer);

    const daiEthPriceFeedAddress = "0x773616E4d11A78F511299002da57A0a94577F1f4";

    const latestDaiPrice = await getDaiPrice(daiEthPriceFeedAddress, deployer);

    const daiAmountToBorrow = +availableBorrowsETH.toString() * 0.95 * (1 / +latestDaiPrice);
    const daiAmountToBorrowWei = ethers.utils.parseEther(daiAmountToBorrow.toString());

    console.log("\x1b[34m%s\x1b[0m", `You can Borrow: ${daiAmountToBorrowWei} DAI`);

    const daiTokenAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";

    await borrowFromAave(lendingPool, daiTokenAddress, daiAmountToBorrowWei, 1, 0, deployer);

    await getUserDataFromPool(lendingPool, deployer);

    await repayBack(lendingPool, daiTokenAddress, daiAmountToBorrowWei, 1, deployer);

    await getUserDataFromPool(lendingPool, deployer);
};

const repayBack = async (lendingPool, assetTokenAddress, amountToRepay, interestRateModeStable, account) => {
    console.log("\x1b[33m%s\x1b[0m", "Repaying Back, Please wait...");

    await approveERC20Token(assetTokenAddress, lendingPool.address, amountToRepay, account);

    const txResponse = await lendingPool.repay(assetTokenAddress, amountToRepay, interestRateModeStable, account);
    await txResponse.wait(1);

    console.log("\x1b[32m%s\x1b[0m", "Repaid Successfully !");
    console.log("");
};

const borrowFromAave = async (
    lendingPool,
    assetTokenAddress,
    amountToBorrow,
    interestRateModeStable,
    referalCode,
    account
) => {
    console.log("\x1b[33m%s\x1b[0m", "Borrowing, Please wait...");
    const txResponse = await lendingPool.borrow(
        assetTokenAddress,
        amountToBorrow,
        interestRateModeStable,
        referalCode,
        account
    );
    await txResponse.wait(1);

    console.log("\x1b[32m%s\x1b[0m", "Borrowed Successfully!");
    console.log("");
};

const getDaiPrice = async (daiEthAddress, deployer) => {
    const priceFeed = await ethers.getContractAt("AggregatorV3Interface", daiEthAddress, deployer);

    const decimals = (await priceFeed.decimals()).toString();

    const latestPrice = (await priceFeed.latestRoundData())[1].toString();

    console.log("\x1b[34m%s\x1b[0m", `Latest DAI/ETH Price: ${latestPrice}`);
    console.log("\x1b[34m%s\x1b[0m", `Decimals: ${decimals}`);
    console.log("");

    return latestPrice;
};

const depositCollateral = async (lendingPool, assetTokenAddress, amountToDeposit, onBehalfOfAddress, referalCode) => {
    console.log("\x1b[33m%s\x1b[0m", "Depositing Collateral, Please wait...");
    const txResponse = await lendingPool.deposit(assetTokenAddress, amountToDeposit, onBehalfOfAddress, referalCode);
    await txResponse.wait(1);
    console.log("\x1b[32m%s\x1b[0m", "Deposition Successful !");
    console.log("");
};

const getUserDataFromPool = async (lendingPool, userAccount) => {
    console.log("\x1b[33m%s\x1b[0m", "Fetching User finance Data Information, Please wait...");
    const { totalCollateralETH, totalDebtETH, availableBorrowsETH } = await lendingPool.getUserAccountData(userAccount);
    console.log("\x1b[32m%s\x1b[0m", "Information Fetched Successfully: ");
    console.log("\x1b[34m%s\x1b[0m", `Your Total collateral: ${totalCollateralETH.toString()} WEI`);
    console.log("\x1b[34m%s\x1b[0m", `You Borrowed ${totalDebtETH.toString()} WEI`);
    console.log("\x1b[34m%s\x1b[0m", `You can Borrow ${availableBorrowsETH.toString()} WEI`);
    console.log("");

    return {
        totalCollateralETH,
        totalDebtETH,
        availableBorrowsETH,
    };
};

const approveERC20Token = async (erc20TokenAddress, spenderAddress, amountToSpend, account) => {
    console.log("\x1b[33m%s\x1b[0m", "Approving Token, Please wait...");

    const IERC20 = await ethers.getContractAt("IERC20", erc20TokenAddress, account);

    const txResponse = await IERC20.approve(spenderAddress, amountToSpend);
    await txResponse.wait(1);
    console.log("\x1b[32m%s\x1b[0m", "Token Approved Successfully !");
    console.log("");
};

const getLendingPool = async (wethAddress, account) => {
    console.log("\x1b[33m%s\x1b[0m", "Finding Lending Pool, Please wait..");
    const ILendingPoolAddressesProvider = await ethers.getContractAt(
        "ILendingPoolAddressesProvider",
        wethAddress,
        account
    );

    const lendingPoolAddress = await ILendingPoolAddressesProvider.getLendingPool();
    const ILendingPool = await ethers.getContractAt("ILendingPool", lendingPoolAddress, account);

    console.log("\x1b[32m%s\x1b[0m", `Got Lending Pool with address: ${ILendingPool.address} !`);
    console.log("");
    return ILendingPool;
};

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.log(`\x1b[31maaveBorrow.js -- ERROR: ${err}\x1b[0m`);
    });
