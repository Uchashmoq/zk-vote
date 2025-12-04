import { mimcSpongecontract } from "circomlibjs";

const { createCode, abi } = mimcSpongecontract;

const bytecode = createCode("mimcsponge", 220);
console.log("MiMC Sponge bytecode:", bytecode);
