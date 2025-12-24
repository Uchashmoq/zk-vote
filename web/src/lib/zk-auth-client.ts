import { ethers } from "ethers";
import type { BigNumberish } from "ethers";
import * as snarkjs from "snarkjs";
import * as wasmLoader from "./Verifier";
import { buildMimcSponge } from "circomlibjs";

export interface Commitment {
  nullifier: string;
  secret: string;
  commitment: any;
}

const loadWebAssembly: any = (wasmLoader as any).default ?? wasmLoader;

const FIELD_SIZE = BigInt(
  "21888242871839275222246405745257275088548364400416034343698204186575808495617"
);

const ZERO_VALUE =
  BigInt(ethers.keccak256(ethers.toUtf8Bytes("zk-vote"))) % FIELD_SIZE;

const LEVELS = 20;

function calculateHash(mimc: any, left: any, right: any) {
  return BigInt(mimc.F.toString(mimc.multiHash([left, right])));
}

function getVerifierWASM() {
  return loadWebAssembly().buffer;
}

let mimcInstance: any | null = null;
async function getMimc(): Promise<any | null> {
  if (mimcInstance) return mimcInstance;
  mimcInstance = await buildMimcSponge();
  return mimcInstance;
}

function generateZeros(mimc: any, levels: number) {
  let zeros = [];
  zeros[0] = ZERO_VALUE;
  for (let i = 1; i <= levels; i++)
    zeros[i] = calculateHash(mimc, zeros[i - 1], zeros[i - 1]);
  return zeros;
}

function convertCallData(calldata: any) {
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

let cachedVerifierZkey: Uint8Array | null = null;
let verifierZkeyPromise: Promise<Uint8Array> | null = null;
async function getVerifierZkey(): Promise<Uint8Array> {
  if (cachedVerifierZkey) return cachedVerifierZkey;
  if (verifierZkeyPromise) return verifierZkeyPromise;
  verifierZkeyPromise = fetch("/Verifier.zkey")
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch Verifier.zkey");
      return res.arrayBuffer();
    })
    .then((buffer) => {
      cachedVerifierZkey = new Uint8Array(buffer);
      return cachedVerifierZkey;
    })
    .catch((err) => {
      verifierZkeyPromise = null;
      throw err;
    });
  return verifierZkeyPromise;
}

export async function generateCommitment(): Promise<Commitment> {
  const mimc = await getMimc();
  const secret = BigInt(ethers.hexlify(ethers.randomBytes(31))).toString();
  const nullifier = BigInt(ethers.hexlify(ethers.randomBytes(31))).toString();

  const commitment = mimc.F.toString(mimc.multiHash([nullifier, secret]));
  const nullifierHash = mimc.F.toString(mimc.multiHash([nullifier]));
  return {
    nullifier: nullifier,
    secret: secret,
    commitment: commitment,
  };
}

export async function calculateMerkleRootAndPath(
  elements: any[],
  element?: any
) {
  const capacity = 2 ** LEVELS;
  if (elements.length > capacity) throw new Error("Tree is full");
  const mimc = await getMimc();

  const zeros = generateZeros(mimc, LEVELS);
  let layers = [];
  layers[0] = elements.slice();
  for (let level = 1; level <= LEVELS; level++) {
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
    layers[LEVELS].length > 0 ? layers[LEVELS][0] : zeros[LEVELS - 1];

  let pathElements = [];
  let pathIndices = [];

  if (element) {
    const bne = BigInt(element);
    let index = layers[0].findIndex((e) => BigInt(e) == bne);
    if (index === -1) {
      throw new Error("Element not found in tree");
    }
    for (let level = 0; level < LEVELS; level++) {
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

export async function calculateMerkleRootAndZKProof(
  rootAndPath: any,
  commitment: Commitment
) {
  const zkey = await getVerifierZkey();
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
    nullifier: publicSignals[0],
    root: publicSignals[1],
    proof_a: cd.a,
    proof_b: cd.b,
    proof_c: cd.c,
  };
}

export function serializeSecretAndNullifierToBase64(data: Commitment): string {
  const json = JSON.stringify(data, (key, value) =>
    typeof value === "bigint" ? value.toString() : value
  );

  const bytes = new TextEncoder().encode(json);
  const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join(
    ""
  );
  return btoa(binString);
}

export function deserializeSecretAndNullifierFromBase64(
  base64: string
): Commitment {
  const binString = atob(base64);
  const bytes = Uint8Array.from(binString, (char) => char.charCodeAt(0));
  const json = new TextDecoder().decode(bytes);
  return JSON.parse(json) as Commitment;
}
