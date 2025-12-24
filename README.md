# zk-vote

zk-vote is a privacy-preserving voting dApp that lets eligible wallets cast anonymous commitments and prove inclusion with zero-knowledge proofs.

## What it does
- Creates on-chain polls where approved voters commit before the deadline and later reveal with ZK proofs to stay private.
- Displays live progress, candidates, and winners while preventing double voting via nullifiers.
- Supports admin workflows to create polls and upload candidate metadata.

## Features
- Commit-and-reveal flow with downloadable commitment secrets for later proof generation.
- Merkle-based voter list and nullifier checks to block duplicate votes.
- Rich UI: vote timelines, progress rings, candidate cards, winner highlighting, and responsive layouts.

## Core tech
- Smart contracts: Solidity + Hardhat, zkVote ABI, ethers.js interaction.
- Zero-knowledge: circom circuits, Merkle proofs, commitment/nullifier generation (`web/src/lib/zk-auth-client.ts`).
- Frontend: Next.js 13 app router, React, wagmi/viem for wallet connectivity, Tailwind/DaisyUI styling, react-hot-toast feedback.
