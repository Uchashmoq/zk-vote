import { network } from "hardhat";
const { ethers } = await network.connect();
//0x609BE21933Db5196EAE6406231e20B08D36fEDCE
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying Groth16Verifier from:", deployer.address);

  const verifier = await ethers.deployContract("Groth16Verifier");
  await verifier.waitForDeployment();

  console.log("Groth16Verifier deployed to:", await verifier.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
