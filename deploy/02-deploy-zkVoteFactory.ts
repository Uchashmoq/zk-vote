import { network } from "hardhat";
const { ethers } = await network.connect();
//0xe4fC9Dbd3132Fb30adC25eEd652a6a7375E881bC
const HASHER = "0x4F0E0e66C87D812047598E3648FE2BEAF88aF4D0";
const VERIFIER = "0x609BE21933Db5196EAE6406231e20B08D36fEDCE";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying ZkVoteFactory from:", deployer.address);

  const factory = await ethers.deployContract("ZkVoteFactory", [
    HASHER,
    VERIFIER,
  ]);
  await factory.waitForDeployment();

  console.log("ZkVoteFactory deployed to:", await factory.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
