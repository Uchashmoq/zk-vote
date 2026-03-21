import { expect } from "chai";
import { network } from "hardhat";
const { ethers } = await network.connect("hardhatMainnet");
import { Contract, ContractFactory } from "ethers";
import { mimcSpongecontract, buildMimcSponge } from "circomlibjs";
import type { ZkAuth } from "../types/ethers-contracts/ZkAuth.js";
import { ZkAuth__factory } from "../types/ethers-contracts/factories/ZkAuth__factory.js";
import type { ZkVoteFactory } from "../types/ethers-contracts/ZkVoteFactory.js";
import { ZkVoteFactory__factory } from "../types/ethers-contracts/factories/ZkVoteFactory__factory.js";
import {
  generateCommitment,
  calculateMerkleRootAndPath,
  generateZeros,
  FIELD_SIZE,
  ZERO_VALUE,
  calculateMerkleRootAndPathFromEvents,
  LEVELS,
  calculateMerkleRootAndZKProof,
  calculateMerkleRootAndZKProof1,
} from "../src/zk-auth.js";

import {
  generateCommitment as generateCommitment1,
  calculateMerkleRootAndPath as calculateMerkleRootAndPath1,
  calculateMerkleRootAndZKProof as calculateMerkleRootAndZKProof1c,
} from "../web/src/lib/zk-auth-client.js";

const { createCode, abi } = mimcSpongecontract;
const bytecode = createCode("mimcsponge", 220);
export interface Commitment {
  nullifier: string;
  secret: string;
  commitment: any;
  nullifierHash: any;
}
export function serializeCommitmentToBase64(data: Commitment): string {
  const json = JSON.stringify(data, (key, value) =>
    typeof value === "bigint" ? value.toString() : value,
  );

  const bytes = new TextEncoder().encode(json);
  const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join(
    "",
  );
  return btoa(binString);
}

export function deserializeCommitmentFromBase64(base64: string): Commitment {
  const binString = atob(base64);
  const bytes = Uint8Array.from(binString, (char) => char.charCodeAt(0));
  const json = new TextDecoder().decode(bytes);

  return JSON.parse(json) as Commitment;
}

describe("performance", function () {
  let mimcContract: Contract, zkauthContract: ZkAuth, voters: string[];
  beforeEach(async function () {
    const deployers = await ethers.getSigners();
    voters = deployers.slice(0, 3).map((signer) => signer.address);
    const deployer = deployers[0];
    const MiMCFactory = new ContractFactory(abi, bytecode, deployer);
    mimcContract = await MiMCFactory.deploy();
    await mimcContract.waitForDeployment();

    const verifier = await ethers.deployContract("Groth16Verifier");
    await verifier.waitForDeployment();

    const zkauthFactory = new ZkAuth__factory(deployer);
    zkauthContract = await zkauthFactory.deploy(
      await mimcContract.getAddress(),
      await verifier.getAddress(),
    );
    await zkauthContract.waitForDeployment();
  });

  it("measures MiMCSponge runtime and gas", async function () {
    const xL = 123n;
    const xR = 456n;
    const k = 0n;

    const start = process.hrtime.bigint();
    const tx = await mimcContract.MiMCSponge.send(xL, xR, k);
    const receipt = await tx.wait();
    const end = process.hrtime.bigint();

    const durationMs = Number(end - start) / 1_000_000;
    const gasUsed = receipt?.gasUsed ?? 0n;

    console.log(
      `[performance] MiMCSponge duration(ms): ${durationMs.toFixed(3)}`,
    );
    console.log(`[performance] MiMCSponge gasUsed: ${gasUsed.toString()}`);

    expect(receipt).to.not.equal(null);
    expect(gasUsed).to.be.greaterThan(0n);
  });

  it("measures ZkAuth commit runtime and gas", async function () {
    const voter = (await ethers.getSigners())[1];
    const { commitment } = await generateCommitment();
    const commitmentHex = ethers.toBeHex(BigInt(commitment), 32);

    const start = process.hrtime.bigint();
    const tx = await zkauthContract.connect(voter).commit(commitmentHex);
    const receipt = await tx.wait();
    const end = process.hrtime.bigint();

    const durationMs = Number(end - start) / 1_000_000;
    const gasUsed = receipt?.gasUsed ?? 0n;

    console.log(
      `[performance] ZkAuth.commit duration(ms): ${durationMs.toFixed(3)}`,
    );
    console.log(`[performance] ZkAuth.commit gasUsed: ${gasUsed.toString()}`);

    expect(receipt).to.not.equal(null);
    expect(gasUsed).to.be.greaterThan(0n);
  });

  it("measures ZkAuth auth runtime and gas", async function () {
    const voter = (await ethers.getSigners())[1];
    const commitment = await generateCommitment();
    const commitmentHex = ethers.toBeHex(BigInt(commitment.commitment), 32);
    await zkauthContract.connect(voter).commit(commitmentHex);

    const levels = Number(await zkauthContract.levels());
    const proofData = await calculateMerkleRootAndZKProof(
      zkauthContract.target,
      ethers.provider,
      levels,
      commitment,
      "build/Verifier.zkey",
    );

    const nullifierHex = ethers.toBeHex(BigInt(proofData.nullifierHash), 32);
    const rootHex = ethers.toBeHex(BigInt(proofData.root), 32);

    const start = process.hrtime.bigint();
    const tx = await zkauthContract
      .connect(voter)
      .auth.send(
        nullifierHex,
        rootHex,
        proofData.proof_a,
        proofData.proof_b,
        proofData.proof_c,
      );
    const receipt = await tx.wait();
    const end = process.hrtime.bigint();

    const durationMs = Number(end - start) / 1_000_000;
    const gasUsed = receipt?.gasUsed ?? 0n;

    console.log(
      `[performance] ZkAuth.auth duration(ms): ${durationMs.toFixed(3)}`,
    );
    console.log(`[performance] ZkAuth.auth gasUsed: ${gasUsed.toString()}`);

    expect(receipt).to.not.equal(null);
    expect(gasUsed).to.be.greaterThan(0n);
  });

  it("measures ZkVoteFactory.createVote runtime and gas", async function () {
    const [deployer, ...rest] = await ethers.getSigners();
    const verifier = await ethers.deployContract("Groth16Verifier");
    await verifier.waitForDeployment();
    const zkVoteFactory: ZkVoteFactory = await new ZkVoteFactory__factory(
      deployer,
    ).deploy(await mimcContract.getAddress(), await verifier.getAddress());
    await zkVoteFactory.waitForDeployment();

    const votersForVote = rest.slice(0, 3).map((s) => s.address);
    const startTime = (await ethers.provider.getBlock("latest")).timestamp + 10;
    const endTime = startTime + 1000;
    const voteMeta = "Performance Vote";
    const candidateMetas = ["A", "B", "C"];

    const start = process.hrtime.bigint();
    const tx = await zkVoteFactory
      .connect(deployer)
      .createVote(voteMeta, candidateMetas, votersForVote, startTime, endTime);
    const receipt = await tx.wait();
    const end = process.hrtime.bigint();

    const durationMs = Number(end - start) / 1_000_000;
    const gasUsed = receipt?.gasUsed ?? 0n;

    console.log(
      `[performance] ZkVoteFactory.createVote duration(ms): ${durationMs.toFixed(
        3,
      )}`,
    );
    console.log(
      `[performance] ZkVoteFactory.createVote gasUsed: ${gasUsed.toString()}`,
    );

    expect(receipt).to.not.equal(null);
    expect(gasUsed).to.be.greaterThan(0n);
  });

  after(async () => {
    process.exit(0);
  });
});
