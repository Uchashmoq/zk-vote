import { ethers } from "ethers";
import type { BigNumberish } from "ethers";
import * as snarkjs from "snarkjs";
import { buildMimcSponge } from "circomlibjs";
import * as wasmLoader from "./Verifier.js";
import { zkVoteAbi } from "../web/src/abi.js";

const loadWebAssembly: any = (wasmLoader as any).default ?? wasmLoader;

export const FIELD_SIZE = BigInt(
  "21888242871839275222246405745257275088548364400416034343698204186575808495617"
);

export const ZERO_VALUE =
  BigInt(ethers.keccak256(ethers.toUtf8Bytes("zk-vote"))) % FIELD_SIZE;

export const LEVELS = 20;

export function calculateHash(mimc: any, left: any, right: any) {
  return BigInt(mimc.F.toString(mimc.multiHash([left, right])));
}

export function getVerifierWASM() {
  return loadWebAssembly().buffer;
}
export interface Commitment {
  nullifier: string;
  secret: string;
  commitment: any;
  nullifierHash: any;
}

export async function generateCommitment(): Promise<Commitment> {
  const mimc = await buildMimcSponge();
  const secret = BigInt(ethers.hexlify(ethers.randomBytes(31))).toString();
  const nullifier = BigInt(ethers.hexlify(ethers.randomBytes(31))).toString();

  const commitment = mimc.F.toString(mimc.multiHash([nullifier, secret]));
  const nullifierHash = mimc.F.toString(mimc.multiHash([nullifier]));
  return {
    nullifier: nullifier,
    secret: secret,
    commitment: commitment,
    nullifierHash: nullifierHash,
  };
}

export function generateZeros(mimc: any, levels: number) {
  let zeros = [];
  zeros[0] = ZERO_VALUE;
  for (let i = 1; i <= levels; i++)
    zeros[i] = calculateHash(mimc, zeros[i - 1], zeros[i - 1]);
  return zeros;
}

export function calculateMerkleRootAndPath(
  mimc: any,
  levels: number,
  elements: any[],
  element?: any
) {
  const capacity = 2 ** levels;
  if (elements.length > capacity) throw new Error("Tree is full");

  const zeros = generateZeros(mimc, levels);
  let layers = [];
  layers[0] = elements.slice();
  for (let level = 1; level <= levels; level++) {
    layers[level] = [];
    for (let i = 0; i < Math.ceil(layers[level - 1].length / 2); i++) {
      layers[level][i] = calculateHash(
        mimc,
        layers[level - 1][i * 2],
        i * 2 + 1 < layers[level - 1].length
          ? layers[level - 1][i * 2 + 1]
          : zeros[level - 1]
      );
    }
  }

  const root =
    layers[levels].length > 0 ? layers[levels][0] : zeros[levels - 1];

  let pathElements = [];
  let pathIndices = [];

  if (element) {
    const bne = BigInt(element);
    let index = layers[0].findIndex((e) => BigInt(e) == bne);
    if (index === -1) {
      throw new Error("Element not found in tree");
    }
    for (let level = 0; level < levels; level++) {
      pathIndices[level] = index % 2;
      pathElements[level] =
        (index ^ 1) < layers[level].length
          ? layers[level][index ^ 1]
          : zeros[level];
      index >>= 1;
    }
  }

  return {
    root: root.toString(),
    pathElements: pathElements.map((v) => v.toString()),
    pathIndices: pathIndices.map((v) => v.toString()),
  };
}

export async function calculateMerkleRootAndPathFromEvents(
  mimc: any,
  address: any,
  provider: any,
  levels: number,
  element?: any
) {
  const abi = [
    "event Commit(bytes32 indexed commitment, uint32 indexed leafIndex, uint256 timestamp)",
  ];
  const contract = new ethers.Contract(address, abi, provider);
  const events = await contract.queryFilter("Commit", 0, "latest");
  const parsed = events.map((ev) => ({
    commitment: ev.args.commitment,
    leafIndex: ev.args.leafIndex,
    timestamp: ev.args.timestamp,
  }));

  const commitments = parsed
    .sort((a, b) => Number(a.leafIndex) - Number(b.leafIndex))
    .map((p) => BigInt(p.commitment));

  const { root, pathElements, pathIndices } = calculateMerkleRootAndPath(
    mimc,
    levels,
    commitments,
    element ?? commitments[commitments.length - 1]
  );

  return {
    root,
    pathElements,
    pathIndices,
    commitments,
    events: parsed,
  };
}

export function convertCallData(calldata: any) {
  const argv = calldata
    .replace(/["[\]\s]/g, "")
    .split(",")
    .map((x: any) => BigInt(x).toString());

  const a = [argv[0], argv[1]] as [BigNumberish, BigNumberish];
  const b = [
    [argv[2], argv[3]],
    [argv[4], argv[5]],
  ] as [[BigNumberish, BigNumberish], [BigNumberish, BigNumberish]];
  const c = [argv[6], argv[7]] as [BigNumberish, BigNumberish];
  const input = [argv[8], argv[9]] as [BigNumberish, BigNumberish];

  return { a, b, c, input };
}

export async function calculateMerkleRootAndPathFromMethod(
  mimc: any,
  address: any,
  provider: any,
  levels: number,
  element?: any
) {
  const zkVoteContract = new ethers.Contract(address, zkVoteAbi, provider);
  const commitments: string[] = await zkVoteContract.allCommitments();
  const { root, pathElements, pathIndices } = calculateMerkleRootAndPath(
    mimc,
    levels,
    commitments,
    element ?? commitments[commitments.length - 1]
  );

  return {
    root,
    pathElements,
    pathIndices,
    commitments,
  };
}

export async function calculateMerkleRootAndZKProof(
  address: any,
  provider: any,
  levels: number,
  commitment: any,
  zkey: any
) {
  const mimc = await buildMimcSponge();
  const rootAndPath = await calculateMerkleRootAndPathFromEvents(
    mimc,
    address,
    provider,
    levels,
    commitment.commitment
  );
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    {
      nullifier: commitment.nullifier,
      secret: commitment.secret,
      pathElements: rootAndPath.pathElements,
      pathIndices: rootAndPath.pathIndices,
    },
    getVerifierWASM(),
    zkey
  );
  const cd = convertCallData(
    await snarkjs.groth16.exportSolidityCallData(proof, publicSignals)
  );
  return {
    nullifierHash: publicSignals[0],
    root: publicSignals[1],
    proof_a: cd.a,
    proof_b: cd.b,
    proof_c: cd.c,
  };
}

export async function calculateMerkleRootAndZKProof1(
  address: any,
  provider: any,
  levels: number,
  commitment: any,
  zkey: any
) {
  const mimc = await buildMimcSponge();
  const rootAndPath = await calculateMerkleRootAndPathFromMethod(
    mimc,
    address,
    provider,
    levels,
    commitment.commitment
  );
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    {
      nullifier: commitment.nullifier,
      secret: commitment.secret,
      pathElements: rootAndPath.pathElements,
      pathIndices: rootAndPath.pathIndices,
    },
    getVerifierWASM(),
    zkey
  );
  const cd = convertCallData(
    await snarkjs.groth16.exportSolidityCallData(proof, publicSignals)
  );
  return {
    nullifierHash: publicSignals[0],
    root: publicSignals[1],
    proof_a: cd.a,
    proof_b: cd.b,
    proof_c: cd.c,
  };
}
