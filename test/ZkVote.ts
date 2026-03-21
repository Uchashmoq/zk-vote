import { expect } from "chai";
import { network } from "hardhat";
const { ethers } = await network.connect();
import { Contract, ContractFactory } from "ethers";
import { mimcSpongecontract } from "circomlibjs";
import type { ZkVote } from "../types/ethers-contracts/ZkVote.js";
import { ZkVote__factory } from "../types/ethers-contracts/factories/ZkVote__factory.js";
import {
  calculateMerkleRootAndZKProof,
  generateCommitment,
} from "../src/zk-auth.js";

const { createCode, abi } = mimcSpongecontract;
const bytecode = createCode("mimcsponge", 220);

describe("ZkVote", function () {
  let mimcContract: Contract;
  let voteContract: ZkVote;
  let voter1;
  let voter2;

  beforeEach(async function () {
    const [deployer, ...rest] = await ethers.getSigners();
    voter1 = rest[0];
    voter2 = rest[1];

    const MiMCFactory = new ContractFactory(abi, bytecode, deployer);
    mimcContract = await MiMCFactory.deploy();
    await mimcContract.waitForDeployment();

    const verifier = await ethers.deployContract("Groth16Verifier", [], {
      signer: deployer,
    });
    await verifier.waitForDeployment();

    const now = (await ethers.provider.getBlock("latest")).timestamp;
    const zkvoteFactory = new ZkVote__factory(deployer);
    voteContract = await zkvoteFactory.deploy(
      "Election 2026",
      ["Alice", "Bob"],
      [voter1.address, voter2.address],
      now,
      now + 1000,
      await mimcContract.getAddress(),
      await verifier.getAddress(),
    );
    await voteContract.waitForDeployment();
  });

  it("commit and vote flow works, and vote records are correct", async function () {
    const commitment1 = await generateCommitment();
    const commitment2 = await generateCommitment();

    await voteContract
      .connect(voter1)
      .commit(ethers.toBeHex(BigInt(commitment1.commitment), 32));
    await voteContract
      .connect(voter2)
      .commit(ethers.toBeHex(BigInt(commitment2.commitment), 32));

    const committed = await voteContract.committedVoters();
    expect(committed).to.deep.equal([voter1.address, voter2.address]);

    const levels = Number(await voteContract.levels());

    const proof1 = await calculateMerkleRootAndZKProof(
      voteContract.target,
      ethers.provider,
      levels,
      commitment1,
      "build/Verifier.zkey",
    );

    await voteContract
      .connect(voter1)
      .vote(
        0,
        ethers.toBeHex(BigInt(proof1.nullifierHash), 32),
        ethers.toBeHex(BigInt(proof1.root), 32),
        proof1.proof_a,
        proof1.proof_b,
        proof1.proof_c,
      );

    const proof2 = await calculateMerkleRootAndZKProof(
      voteContract.target,
      ethers.provider,
      levels,
      commitment2,
      "build/Verifier.zkey",
    );

    await voteContract
      .connect(voter2)
      .vote(
        1,
        ethers.toBeHex(BigInt(proof2.nullifierHash), 32),
        ethers.toBeHex(BigInt(proof2.root), 32),
        proof2.proof_a,
        proof2.proof_b,
        proof2.proof_c,
      );

    expect((await voteContract.candidates(0)).votes).to.equal(1n);
    expect((await voteContract.candidates(1)).votes).to.equal(1n);

    const votedAddresses = await voteContract.allVotedAddresses();
    expect(votedAddresses).to.deep.equal([voter1.address, voter2.address]);

    const voter1Choices = await voteContract.choicesOfAddress(voter1.address);
    const voter2Choices = await voteContract.choicesOfAddress(voter2.address);

    expect(voter1Choices.length).to.equal(1);
    expect(voter2Choices.length).to.equal(1);
    expect(voter1Choices[0].meta).to.equal("Alice");
    expect(voter2Choices[0].meta).to.equal("Bob");
  });

  after(async () => {
    process.exit(0);
  });
});
