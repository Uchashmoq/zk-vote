import { network } from "hardhat";
const { ethers } = await network.connect();

async function main() {
  const zkFactoryAddress = "0xe4fC9Dbd3132Fb30adC25eEd652a6a7375E881bC";

  const voteMeta = JSON.stringify({ title: "111", description: "111" });
  const candidateMetas = [
    JSON.stringify({
      name: "222",
      imageUrl: "",
      imageCid: "",
      notes: "222",
    }),
  ];
  const voters = ["0xcBdF9890B5935F01B2f21583d1885CdC8389eb5F"];
  const startTime = 1765294320n;
  const endTime = 1765222320n;

  const factory = await ethers.getContractAt("ZkVoteFactory", zkFactoryAddress);

  console.log("Creating vote on factory", zkFactoryAddress);
  const tx = await factory.createVote(
    voteMeta,
    candidateMetas,
    voters,
    startTime,
    endTime
  );
  const receipt = await tx.wait();
  const parsed = receipt?.logs
    ?.map((log) => {
      try {
        return factory.interface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find((evt) => evt && evt.name === "VoteCreated");

  const voteAddr =
    parsed?.args?.addr ?? (await factory.votes((await factory.voteNum()) - 1n));

  console.log(`Vote created tx: ${receipt?.hash}`);
  console.log(`New vote address: ${voteAddr}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
