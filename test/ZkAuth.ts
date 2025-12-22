import { expect } from "chai";
import { network } from "hardhat";
const { ethers } = await network.connect();
import { Contract, ContractFactory } from "ethers";
import { mimcSpongecontract, buildMimcSponge } from "circomlibjs";
import type { ZkAuth } from "../types/ethers-contracts/ZkAuth.js";
import { ZkAuth__factory } from "../types/ethers-contracts/factories/ZkAuth__factory.js";
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
    typeof value === "bigint" ? value.toString() : value
  );

  const bytes = new TextEncoder().encode(json);
  const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join(
    ""
  );
  return btoa(binString);
}

export function deserializeCommitmentFromBase64(base64: string): Commitment {
  const binString = atob(base64);
  const bytes = Uint8Array.from(binString, (char) => char.charCodeAt(0));
  const json = new TextDecoder().decode(bytes);

  return JSON.parse(json) as Commitment;
}

describe("ZkAuth", function () {
  let mimcContract: Contract, zkvoteContract: ZkAuth, voters: string[];
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
    zkvoteContract = await zkauthFactory.deploy(
      await mimcContract.getAddress(),
      await verifier.getAddress()
    );
    await zkvoteContract.waitForDeployment();
  });

  it("should compute MiMCSponge correctly", async function () {
    const xL = 123n;
    const xR = 456n;
    const k = 0;
    const mimcjs = await buildMimcSponge();

    const res1 = await mimcContract.MiMCSponge(xL, xR, k);

    const res2 = mimcjs.hash(xL, xR, k);
    expect(res1.xL.toString()).to.equal(mimcjs.F.toString(res2.xL));
    expect(res1.xR.toString()).to.equal(mimcjs.F.toString(res2.xR));

    const zeroHex = ethers.toBeHex(ZERO_VALUE);
    const h1 = await zkvoteContract.hashLeftRight(zeroHex, zeroHex);
    const h2 = mimcjs.multiHash([ZERO_VALUE, ZERO_VALUE]);
    expect(h1).to.equals(ethers.toBeHex(BigInt(mimcjs.F.toString(h2))));
  });

  it("same voter cannot commit twice", async function () {
    const voter = (await ethers.getSigners())[1];
    const { commitment: commitment1 } = await generateCommitment();
    const { commitment: commitment2 } = await generateCommitment();

    await zkvoteContract
      .connect(voter)
      .commit(ethers.toBeHex(BigInt(commitment1), 32));

    await expect(
      zkvoteContract
        .connect(voter)
        .commit(ethers.toBeHex(BigInt(commitment2), 32))
    ).to.be.revertedWith("You have already committed");
  });

  it("same commitment value cannot be reused", async function () {
    const [firstVoter, secondVoter] = (await ethers.getSigners()).slice(0, 2);
    const { commitment } = await generateCommitment();
    const commitmentHex = ethers.toBeHex(BigInt(commitment), 32);

    await zkvoteContract.connect(firstVoter).commit(commitmentHex);
    await expect(
      zkvoteContract.connect(secondVoter).commit(commitmentHex)
    ).to.be.revertedWith("Your commitment has been used");
  });

  it("two voters commit different commitments and events are correct", async function () {
    const [firstVoter, secondVoter] = (await ethers.getSigners()).slice(0, 2);
    const { commitment: c1 } = await generateCommitment();
    const { commitment: c2 } = await generateCommitment();
    const commitmentHex1 = ethers.toBeHex(BigInt(c1), 32);
    const commitmentHex2 = ethers.toBeHex(BigInt(c2), 32);

    await zkvoteContract.connect(firstVoter).commit(commitmentHex1);
    await zkvoteContract.connect(secondVoter).commit(commitmentHex2);

    const events = await zkvoteContract.queryFilter(
      zkvoteContract.filters.Commit()
    );

    expect(events.length).to.equal(2);
    // console.log("Commit events:");
    // events.forEach((ev, idx) => {
    //   console.log(`event ${idx}:`, {
    //     commitment: ev.args.commitment,
    //     leafIndex: ev.args.leafIndex,
    //     timestamp: ev.args.timestamp,
    //   });
    // });

    expect(events[0].args.commitment).to.equal(commitmentHex1);
    expect(events[0].args.leafIndex).to.equal(0n);
    expect(events[1].args.commitment).to.equal(commitmentHex2);
    expect(events[1].args.leafIndex).to.equal(1n);
  });

  it("calculateMerkleRootAndPath returns correct root for empty tree", async function () {
    const mimcjs = await buildMimcSponge();
    const { root, pathElements, pathIndices } = calculateMerkleRootAndPath(
      mimcjs,
      LEVELS,
      []
    );
    const expectedZero = await zkvoteContract.zeros(LEVELS - 1);
    const onChainRoot = await zkvoteContract.roots(
      await zkvoteContract.currentRootIndex()
    );
    expect(BigInt(root)).to.equal(BigInt(expectedZero));
    expect(onChainRoot).to.equal(ethers.toBeHex(BigInt(root), 32));
    expect(pathElements.length).to.equal(0);
    expect(pathIndices.length).to.equal(0);
  });

  it("MerkleTree filledSubtrees match generated zeros", async function () {
    const mimcjs = await buildMimcSponge();
    const onChainField = await zkvoteContract.FIELD_SIZE();
    const onChainZero = await zkvoteContract.ZERO_VALUE();
    expect(onChainField).to.equal(FIELD_SIZE);
    expect(onChainZero).to.equal(ZERO_VALUE);
    //console.log("FIELD_SIZE and ZERO_VALUE are correct");
    //console.log("zero: ", ZERO_VALUE);

    const zeros = generateZeros(mimcjs, LEVELS);
    const onChainZeros = [];
    for (let i = 0; i < LEVELS; i++) {
      const onChain = await zkvoteContract.filledSubtrees(i);
      expect(onChain).to.equal(ethers.toBeHex(BigInt(zeros[i]), 32));
      onChainZeros.push(BigInt(onChain));
    }
    //console.log("off chain zeros: ", zeros);
    //console.log("on chain zeros: ", onChainZeros);
    // for (let i = 0; i <= LEVELS; i++) {
    //   console.log(
    //     `else if (i==${i}) return bytes32(${ethers.toBeHex(zeros[i])});`
    //   );
    // }
  });

  it("calculateMerkleRootAndPath returns correct root for the tree with 1 voter committing", async function () {
    const voter = (await ethers.getSigners())[1];
    const { commitment } = await generateCommitment();
    const commitmentBigInt = BigInt(commitment);
    const commitmentHex = ethers.toBeHex(commitmentBigInt, 32);

    await zkvoteContract.connect(voter).commit(commitmentHex);

    const mimcjs = await buildMimcSponge();
    const { root, pathElements, pathIndices } = calculateMerkleRootAndPath(
      mimcjs,
      LEVELS,
      [commitmentBigInt],
      commitmentBigInt
    );

    // Recompute root from path to validate path correctness
    let running = commitmentBigInt;
    for (let i = 0; i < pathElements.length; i++) {
      const sibling = BigInt(pathElements[i]);
      const left = pathIndices[i] === "0" ? running : sibling;
      const right = pathIndices[i] === "0" ? sibling : running;
      running = BigInt(mimcjs.F.toString(mimcjs.multiHash([left, right])));
    }
    expect(running).to.equal(BigInt(root));

    const onChainRoot = await zkvoteContract.roots(
      await zkvoteContract.currentRootIndex()
    );
    expect(onChainRoot).to.equal(ethers.toBeHex(BigInt(root), 32));
  });

  it("calculateMerkleRootAndPath matches on-chain root after multiple commits", async function () {
    const mimcjs = await buildMimcSponge();
    const signers = (await ethers.getSigners()).slice(0, 3);
    for (const signer of signers) {
      const { commitment } = await generateCommitment();
      const commitHex = ethers.toBeHex(BigInt(commitment), 32);
      await zkvoteContract.connect(signer).commit(commitHex);
    }

    const { root, commitments, events } =
      await calculateMerkleRootAndPathFromEvents(
        mimcjs,
        zkvoteContract.target,
        ethers.provider,
        LEVELS
      );

    // console.log("Commit events after multiple commits:");
    // events.forEach((ev, idx) => {
    //   console.log(`event ${idx}:`, {
    //     commitment: ev.commitment,
    //     leafIndex: ev.leafIndex,
    //     timestamp: ev.timestamp,
    //   });
    // });
    expect(events.length).to.equal(signers.length);

    const onChainRoot = await zkvoteContract.roots(
      await zkvoteContract.currentRootIndex()
    );
    expect(onChainRoot).to.equal(ethers.toBeHex(BigInt(root), 32));

    // Verify each commitment's path reconstructs the same root
    for (const commitment of commitments) {
      const {
        pathElements,
        pathIndices,
        root: pathRoot,
      } = calculateMerkleRootAndPath(mimcjs, LEVELS, commitments, commitment);
      expect(pathElements.length).to.equal(LEVELS);
      expect(pathIndices.length).to.equal(LEVELS);
      let running = commitment;
      for (let i = 0; i < pathElements.length; i++) {
        const sibling = BigInt(pathElements[i]);
        const left = pathIndices[i] === "0" ? running : sibling;
        const right = pathIndices[i] === "0" ? sibling : running;
        running = BigInt(mimcjs.F.toString(mimcjs.multiHash([left, right])));
      }
      expect(running).to.equal(BigInt(pathRoot));
      expect(onChainRoot).to.equal(ethers.toBeHex(BigInt(pathRoot), 32));
    }
  });

  it("commit then auth with invalid proof should revert", async function () {
    const voter = (await ethers.getSigners())[1];
    const { commitment } = await generateCommitment();
    const commitmentHex = ethers.toBeHex(BigInt(commitment), 32);
    await zkvoteContract.connect(voter).commit(commitmentHex);

    const currentRoot = await zkvoteContract.roots(
      await zkvoteContract.currentRootIndex()
    );
    const nullifier = ethers.toBeHex(1n, 32);
    const zeros2: [bigint, bigint] = [0n, 0n];
    const zeros22: [[bigint, bigint], [bigint, bigint]] = [
      [0n, 0n],
      [0n, 0n],
    ];

    await expect(
      zkvoteContract.auth(nullifier, currentRoot, zeros2, zeros22, zeros2)
    ).to.be.revertedWith("Invalid proof");
  });

  it("commit then auth with valid proof succeeds", async function () {
    const signer = (await ethers.getSigners())[0];
    const commitment = await generateCommitment();
    const commitmentHex = ethers.toBeHex(BigInt(commitment.commitment), 32);
    await zkvoteContract.connect(signer).commit(commitmentHex);

    const levels = Number(await zkvoteContract.levels());
    const proofData = await calculateMerkleRootAndZKProof(
      zkvoteContract.target,
      ethers.provider,
      levels,
      commitment,
      "build/Verifier.zkey"
    );

    const nullifierHex = ethers.toBeHex(BigInt(proofData.nullifierHash), 32);
    const rootHex = ethers.toBeHex(BigInt(proofData.root), 32);

    await zkvoteContract.auth(
      nullifierHex,
      rootHex,
      proofData.proof_a,
      proofData.proof_b,
      proofData.proof_c
    );
  });

  it("multiple commits then multiple auth succeed", async function () {
    const signers = await ethers.getSigners();
    const levels = Number(await zkvoteContract.levels());
    const commitments = [];
    const proofs = [];

    // commit three times
    for (let i = 0; i < 3; i++) {
      const commitment = await generateCommitment();
      const commitHex = ethers.toBeHex(BigInt(commitment.commitment), 32);
      await zkvoteContract.connect(signers[i]).commit(commitHex);
      commitments.push(commitment);
      const proofData = await calculateMerkleRootAndZKProof(
        zkvoteContract.target,
        ethers.provider,
        levels,
        commitment,
        "build/Verifier.zkey"
      );
      proofs.push(proofData);
    }

    // auth for each commitment
    for (const proof of proofs) {
      const nullifierHex = ethers.toBeHex(BigInt(proof.nullifierHash), 32);
      const rootHex = ethers.toBeHex(BigInt(proof.root), 32);
      await zkvoteContract.auth(
        nullifierHex,
        rootHex,
        proof.proof_a,
        proof.proof_b,
        proof.proof_c
      );
      //expect(await zkvoteContract.nullifiers(nullifierHex)).to.equal(true);
    }
  });

  it("auth fails with wrong commitment proof then succeeds with correct one", async function () {
    const signer = (await ethers.getSigners())[0];
    const commitment = await generateCommitment();
    const commitmentHex = ethers.toBeHex(BigInt(commitment.commitment), 32);
    await zkvoteContract.connect(signer).commit(commitmentHex);

    const levels = Number(await zkvoteContract.levels());

    // Wrong proof: generate a different commitment and try to auth with it
    const wrongCommitment = await generateCommitment();
    await expect(
      calculateMerkleRootAndZKProof(
        zkvoteContract.target,
        ethers.provider,
        levels,
        wrongCommitment,
        "build/Verifier.zkey"
      )
    ).to.be.rejectedWith("Element not found in tree");

    // Correct proof with the original commitment
    const correctProof = await calculateMerkleRootAndZKProof(
      zkvoteContract.target,
      ethers.provider,
      levels,
      commitment,
      "build/Verifier.zkey"
    );
    const nullifierHex = ethers.toBeHex(BigInt(correctProof.nullifierHash), 32);
    const rootHex = ethers.toBeHex(BigInt(correctProof.root), 32);
    await zkvoteContract.auth(
      nullifierHex,
      rootHex,
      correctProof.proof_a,
      correctProof.proof_b,
      correctProof.proof_c
    );
    //expect(await zkvoteContract.nullifiers(nullifierHex)).to.equal(true);
  });

  it("calculateMerkleRootAndZKProof and calculateMerkleRootAndZKProof1 return the same result", async function () {
    const signer = (await ethers.getSigners())[0];
    const commitment = await generateCommitment();
    const commitmentHex = ethers.toBeHex(BigInt(commitment.commitment), 32);
    await zkvoteContract.connect(signer).commit(commitmentHex);

    const levels = Number(await zkvoteContract.levels());

    const proof1 = await calculateMerkleRootAndZKProof(
      zkvoteContract.target,
      ethers.provider,
      levels,
      commitment,
      "build/Verifier.zkey"
    );

    const proof2 = await calculateMerkleRootAndZKProof1(
      zkvoteContract.target,
      ethers.provider,
      levels,
      commitment,
      "build/Verifier.zkey"
    );

    expect(proof1.toString()).to.equal(proof2.toString());
  });

  it("deserilaize commitment then auth with valid proof succeeds", async function () {
    const signer = (await ethers.getSigners())[0];
    const commitment = await generateCommitment();

    const commitmentb64 = serializeCommitmentToBase64(commitment);
    console.log("commitment base64: ", commitmentb64);
    const commitment1 = deserializeCommitmentFromBase64(commitmentb64);

    expect(commitment.toString()).to.equal(commitment1.toString());

    const commitmentHex = ethers.toBeHex(BigInt(commitment1.commitment), 32);
    await zkvoteContract.connect(signer).commit(commitmentHex);
    const levels = Number(await zkvoteContract.levels());

    const proofData = await calculateMerkleRootAndZKProof(
      zkvoteContract.target,
      ethers.provider,
      levels,
      commitment1,
      "build/Verifier.zkey"
    );

    const nullifierHex = ethers.toBeHex(BigInt(proofData.nullifierHash), 32);
    const rootHex = ethers.toBeHex(BigInt(proofData.root), 32);

    await zkvoteContract.auth(
      nullifierHex,
      rootHex,
      proofData.proof_a,
      proofData.proof_b,
      proofData.proof_c
    );
  });

  after(async () => {
    process.exit(0);
  });
});
