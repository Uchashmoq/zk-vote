import { ethers } from "ethers";
import type { BigNumberish } from "ethers";
import * as snarkjs from "snarkjs";
import { buildMimcSponge } from "circomlibjs";
import * as wasmLoader from "./Verifier";
import { zkVoteAbi } from "@/abi";

import { calculateHash, generateZeros } from "./zk-auth";

let cachedVerifierZkey: Uint8Array | null = null;
let verifierZkeyPromise: Promise<Uint8Array> | null = null;
export async function getVerifierZkey(): Promise<Uint8Array> {
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
