import { network } from "hardhat";
//0x2dE00EF6a8b0C1320da58387e6fCDf45d5E8a5a7
const hre = await network.connect();
const { ethers } = hre;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying CommentManager from:", deployer.address);

  const commentManager = await ethers.deployContract("CommentManager");
  await commentManager.waitForDeployment();

  const commentManagerAddress = await commentManager.getAddress();
  console.log("CommentManager deployed to:", commentManagerAddress);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
