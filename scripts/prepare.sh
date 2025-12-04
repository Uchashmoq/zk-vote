#!/usr/bin/env bash


mkdir -p build
mkdir -p dist

#curl -L --retry 3 --continue-at - -o ./ptau/powersOfTau28_hez_final_15.ptau https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_15.ptau
circom test/circuits/CommitmentHasherTest.circom --wasm --r1cs -o ./build
yarn snarkjs groth16 setup build/CommitmentHasherTest.r1cs ptau/powersOfTau28_hez_final_15.ptau build/CommitmentHasherTest.zkey
circom test/circuits/MerkleTreeCheckerTest.circom --wasm --r1cs -o ./build
yarn snarkjs groth16 setup build/MerkleTreeCheckerTest.r1cs ptau/powersOfTau28_hez_final_15.ptau build/MerkleTreeCheckerTest.zkey
circom circuits/Verifier.circom --r1cs -o ./dist
circom circuits/Verifier.circom --wasm -o ./build
yarn snarkjs groth16 setup dist/Verifier.r1cs ptau/powersOfTau28_hez_final_15.ptau build/Verifier.zkey
yarn snarkjs zkey export verificationkey build/Verifier.zkey build/Verifier_vkey.json
yarn snarkjs zkey export solidityverifier build/Verifier.zkey contracts/Verifier.sol
sed -i -e 's/pragma solidity \^0.6.11/pragma solidity 0.8.17/g' contracts/Verifier.sol
yarn wasm2js build/Verifier_js/Verifier.wasm -o src/Verifier.js
