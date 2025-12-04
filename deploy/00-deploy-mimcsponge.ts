import { network } from "hardhat";
const { ethers } = await network.connect();
import { mimcSpongecontract } from "circomlibjs";
//0x4F0E0e66C87D812047598E3648FE2BEAF88aF4D0
async function main() {
  const { createCode, abi } = mimcSpongecontract;
  const bytecode = createCode("mimcsponge", 220);

  const [deployer] = await ethers.getSigners();
  console.log("Deploying MiMCSponge from:", deployer.address);

  const factory = new ethers.ContractFactory(abi, bytecode, deployer);
  const mimc = await factory.deploy();
  await mimc.waitForDeployment();

  console.log("MiMCSponge deployed to:", await mimc.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
