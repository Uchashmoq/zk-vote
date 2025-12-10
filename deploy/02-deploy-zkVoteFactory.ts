import { verifyContract } from "@nomicfoundation/hardhat-verify/verify";
import { network } from "hardhat";

const hre = await network.connect();
const { ethers } = hre;
//0xe4fC9Dbd3132Fb30adC25eEd652a6a7375E881bC
//0xc51405826d9942d45FE3c0A73BBd3505A8403Efe
//0xc4A0bEB46BE2D1f89DFbeCb2A319c84d447CEafB
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

  const factoryAddress = await factory.getAddress();
  console.log("ZkVoteFactory deployed to:", factoryAddress);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
