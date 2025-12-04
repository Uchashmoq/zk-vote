import { expect } from "chai";
import { network } from "hardhat";
const { ethers } = await network.connect();
import { ContractFactory } from "ethers";
import { mimcSpongecontract } from "circomlibjs";
import { ZkVoteFactory__factory } from "../types/ethers-contracts/factories/ZkVoteFactory__factory.js";
import { ZkVote__factory } from "../types/ethers-contracts/factories/ZkVote__factory.js";
import {
  calculateMerkleRootAndZKProof,
  generateCommitment,
} from "../src/zk-auth.js";

const { createCode, abi } = mimcSpongecontract;
const bytecode = createCode("mimcsponge", 220);

describe("ZkVoteFactory", function () {
  let mimcContract, verifierContract, factoryContract;
  let voters: string[];

  beforeEach(async function () {
    const [deployer, ...rest] = await ethers.getSigners();
    voters = rest.slice(0, 3).map((s) => s.address);

    const MiMCFactory = new ContractFactory(abi, bytecode, deployer);
    mimcContract = await MiMCFactory.deploy();
    await mimcContract.waitForDeployment();

    verifierContract = await ethers.deployContract("Groth16Verifier", [], {
      signer: deployer,
    });
    await verifierContract.waitForDeployment();

    factoryContract = await new ZkVoteFactory__factory(deployer).deploy(
      await mimcContract.getAddress(),
      await verifierContract.getAddress()
    );
    await factoryContract.waitForDeployment();
  });

  it("creates a vote and stores reference", async function () {
    const [deployer] = await ethers.getSigners();
    const startTime = (await ethers.provider.getBlock("latest")).timestamp + 10;
    const endTime = startTime + 100;
    const voteMeta = "Election 2024";
    const candidateMetas = ["A", "B", "C"];

    const tx = await factoryContract
      .connect(deployer)
      .createVote(voteMeta, candidateMetas, voters, startTime, endTime);

    const receipt = await tx.wait();
    const voteAddr = await factoryContract.votes(0);
    expect(await factoryContract.voteNum()).to.equal(1n);
    const evt = receipt?.logs
      .map((log) => {
        try {
          return factoryContract.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find((p) => p && p.name === "VoteCreated");
    expect(evt?.args.addr).to.equal(voteAddr);
    expect(evt?.args.creator).to.equal(deployer);
    //const voteMetaHash = ethers.id(voteMeta);
    //expect(evt?.args.voteMeta.hash).to.equal(voteMetaHash);
    expect(evt?.args.voteMeta).to.equal(voteMeta);
    expect(evt?.args.startTime).to.equal(BigInt(startTime));
    expect(evt?.args.endTime).to.equal(BigInt(endTime));
    const vote = ZkVote__factory.connect(voteAddr, deployer);
    expect(await vote.startTime()).to.equal(BigInt(startTime));
    expect(await vote.endTime()).to.equal(BigInt(endTime));
    expect(await vote.voterNum()).to.equal(BigInt(voters.length));
    expect(await vote.candidateNum()).to.equal(BigInt(candidateMetas.length));

    for (let i = 0; i < candidateMetas.length; i++) {
      const candidate = await vote.candidates(i);
      expect(candidate.meta).to.equal(candidateMetas[i]);
      expect(candidate.votes).to.equal(0n);
    }
  });

  it("rejects commit from address not in voters list", async function () {
    const [deployer, ...rest] = await ethers.getSigners();
    const nonVoter = rest[3];
    const startTime = (await ethers.provider.getBlock("latest")).timestamp + 10;
    const endTime = startTime + 100;

    await factoryContract
      .connect(deployer)
      .createVote("Election 2024", ["A", "B", "C"], voters, startTime, endTime);

    const voteAddr = await factoryContract.votes(0);
    const vote = ZkVote__factory.connect(voteAddr, nonVoter);
    const commitment = ethers.toBeHex(1n, 32);

    await expect(vote.commit(commitment)).to.be.revertedWith(
      "You are not voter"
    );
  });

  it("prevents double voting with the same commitment", async function () {
    const [deployer, ...rest] = await ethers.getSigners();
    const committer = rest[0];
    const voter = rest[1];
    const startTime = (await ethers.provider.getBlock("latest")).timestamp;
    const endTime = startTime + 1000;

    await factoryContract
      .connect(deployer)
      .createVote("Election 2024", ["A", "B"], voters, startTime, endTime);

    const voteAddr = await factoryContract.votes(0);
    const vote = ZkVote__factory.connect(voteAddr, committer);

    const commitment = await generateCommitment();
    const commitmentHex = ethers.toBeHex(BigInt(commitment.commitment), 32);
    await vote.connect(committer).commit(commitmentHex);

    const levels = Number(await vote.levels());
    const proof = await calculateMerkleRootAndZKProof(
      vote.target,
      ethers.provider,
      levels,
      commitment,
      "build/Verifier.zkey"
    );

    const nullifierHex = ethers.toBeHex(BigInt(proof.nullifierHash), 32);
    const rootHex = ethers.toBeHex(BigInt(proof.root), 32);

    await vote
      .connect(voter)
      .vote(
        0,
        nullifierHex,
        rootHex,
        proof.proof_a,
        proof.proof_b,
        proof.proof_c
      );
    expect((await vote.candidates(0)).votes).to.equal(1n);

    await expect(
      vote
        .connect(voter)
        .vote(
          0,
          nullifierHex,
          rootHex,
          proof.proof_a,
          proof.proof_b,
          proof.proof_c
        )
    ).to.be.revertedWith("You have voted");
    expect((await vote.candidates(0)).votes).to.equal(1n);
  });
  after(async () => {
    process.exit(0);
  });
});
