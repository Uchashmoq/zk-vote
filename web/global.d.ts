// global.d.ts
declare module "*.css";
declare module "*.scss";
declare module "*.sass";

declare module "circomlibjs";
declare module "circomlibjs/src/mimcsponge_gencontract.js" {
  export function createCode(seed: string, nRounds: number): string;
  export const abi: any[];
}

declare module "snarkjs";
