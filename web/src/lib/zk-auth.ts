import { ethers } from "ethers";
import type { BigNumberish } from "ethers";
import * as snarkjs from "snarkjs";
import { buildMimcSponge } from "circomlibjs";
import * as wasmLoader from "./Verifier";
import { zkVoteAbi } from "@/abi";

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

let mimcInstance: any | null = null;
export async function getMimc(): Promise<any | null> {
  if (mimcInstance) return mimcInstance;
  mimcInstance = await buildMimcSponge();
  return mimcInstance;
}

export function generateZeros(mimc: any, levels: number) {
  let zeros = [];
  zeros[0] = ZERO_VALUE;
  for (let i = 1; i <= levels; i++)
    zeros[i] = calculateHash(mimc, zeros[i - 1], zeros[i - 1]);
  return zeros;
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
  };
}

export async function calculateMerkleRootAndZKProof1(
  address: any,
  provider: any,
  levels: number,
  commitment: any,
  zkey: any
) {
  const mimc = await getMimc();
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
