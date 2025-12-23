"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import prisma from "@/lib/prisma";
import { Voter } from "../prisma/src/lib/prisma/client";
import { isAddress } from "viem";
import { pinata } from "./pinata";
import { zkVoteFactoryAddress } from "./address";
import { ethers } from "ethers";
import { zkVoteAbi, zkVoteFactoryAbi } from "./abi";
import {
  Candidate,
  stringToCandidateMeta,
  stringToVoteMeta,
  Vote,
  VoteMeta,
} from "./types";

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL!;
const PRIVATE_KEY = process.env.PRIVATE_KEY!;
const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
const zkVoteFactory = new ethers.Contract(
  zkVoteFactoryAddress,
  zkVoteFactoryAbi,
  provider
);
const creatorAddress = ethers.getAddress(
  new ethers.Wallet(PRIVATE_KEY).address
);

export async function loginAction(
  formData: FormData
): Promise<{ error: string } | undefined> {
  try {
    await signIn("credentials", {
      password: formData.get("password"),
      redirectTo: "/admin",
    });
    return undefined;
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "password wrong" };
    }

    throw error;
  }
}

export async function deleteVoterAction(
  id: Voter["id"]
): Promise<{ error: string } | undefined> {
  if (typeof id !== "number" || Number.isNaN(id)) {
    return { error: "invalid voter id" };
  }

  try {
    await prisma.voter.delete({
      where: { id },
    });
    return undefined;
  } catch (error) {
    console.error(error);
    return { error: "could not delete voter" };
  }
}

export async function createVoterAction(
  formData: FormData
): Promise<{ error: string } | Voter> {
  const name = formData.get("name");
  const address = formData.get("address");

  if (
    typeof name !== "string" ||
    typeof address !== "string" ||
    !name.trim() ||
    !address.trim()
  ) {
    return { error: "name and address are required" };
  }

  if (!isAddress(address.trim())) {
    return { error: "invalid address" };
  }

  const email = formData.get("email");
  const phone = formData.get("phone");
  const note = formData.get("note");
  const additional = formData.get("additional");
  let voter;
  try {
    voter = await prisma.voter.create({
      data: {
        name: name.trim(),
        address: address.trim(),
        email:
          typeof email === "string" && email.trim() ? email.trim() : undefined,
        phone:
          typeof phone === "string" && phone.trim() ? phone.trim() : undefined,
        note: typeof note === "string" && note.trim() ? note.trim() : undefined,
        additional:
          typeof additional === "string" && additional.trim()
            ? additional.trim()
            : undefined,
      },
    });
  } catch (error) {
    console.error(error);
    console.log(formData);
    return { error: "could not create voter" };
  }

  return voter;
}

export async function getVoters() {
  return prisma.voter.findMany();
}

export async function uploadImageAction(
  formData: FormData
): Promise<{ cid: string; url: string } | { error: string }> {
  try {
    const file: File | null = formData.get("file") as unknown as File;
    const { cid } = await pinata.upload.public.file(file);
    const url = await pinata.gateways.public.convert(cid);
    return { cid, url };
  } catch (e) {
    console.log(e);
    return { error: "could not upload image" };
  }
}

export async function queryVotes(
  committedVoter: string | undefined,
  verified: boolean,
  hideNotStarted: boolean,
  hideEnded: boolean
): Promise<{ voteAddr: string; voteMeta: string }[]> {
  const creator = verified ? creatorAddress : ethers.ZeroAddress;
  const voter =
    committedVoter && committedVoter.trim()
      ? ethers.getAddress(committedVoter)
      : ethers.ZeroAddress;
  const [voteAddrs, voteMetas]: [string[], string[]] =
    await zkVoteFactory.queryVote(creator, voter, hideNotStarted, hideEnded);

  return voteAddrs.map((voteAddr, index) => ({
    voteAddr,
    voteMeta: voteMetas[index],
  }));
}

export async function getVoteTime(
  address: string
): Promise<{ startTime: BigInt; endTime: BigInt }> {
  const voteContract = new ethers.Contract(
    ethers.getAddress(address),
    zkVoteAbi,
    provider
  );
  const [startTime, endTime] = await Promise.all([
    voteContract.startTime(),
    voteContract.endTime(),
  ]);

  return { startTime, endTime };
}

async function getAllCandidates0(
  address: string
): Promise<{ index: number; votes: number; meta: string }[]> {
  const voteContract = new ethers.Contract(
    ethers.getAddress(address),
    zkVoteAbi,
    provider
  );
  const candidates: { votes: bigint; meta: string }[] =
    await voteContract.allCandidates();

  return candidates.map((candidate, i) => ({
    index: i,
    votes: Number(candidate.votes),
    meta: candidate.meta,
  }));
}

export async function getAllCandidates(address: string): Promise<Candidate[]> {
  const cs = await getAllCandidates0(address);
  return cs.map((c) => {
    return {
      votes: c.votes,
      index: c.index,
      meta: stringToCandidateMeta(c.meta),
    };
  });
}

export async function getAllVoters(address: string): Promise<string[]> {
  const voteContract = new ethers.Contract(
    ethers.getAddress(address),
    zkVoteAbi,
    provider
  );
  const voters: string[] = await voteContract.allVotes();
  return voters.map((voter) => ethers.getAddress(voter));
}

export async function getVoteMeta(address: string): Promise<VoteMeta> {
  const voteContract = new ethers.Contract(
    ethers.getAddress(address),
    zkVoteAbi,
    provider
  );
  const metaStr: string = await voteContract.meta();
  return stringToVoteMeta(metaStr);
}

export async function getVoteFullInfo(address: string): Promise<Vote> {
  const voteMeta = await getVoteMeta(address);
  const times = await getVoteTime(address);
  const candidates = await getAllCandidates(address);
  const voters = await getAllVoters(address);
  return {
    meta: voteMeta,
    startTime: times.startTime,
    endTime: times.endTime,
    candidates: candidates,
    voters: voters,
  };
}

export async function isCommittedAction(
  address: string,
  userAddress: string
): Promise<boolean> {
  const voteContract = new ethers.Contract(
    ethers.getAddress(address),
    zkVoteAbi,
    provider
  );
  const isCommitted = await voteContract.isCommitted(
    ethers.getAddress(userAddress)
  );
  return isCommitted;
}

export async function getAllCommitments(address: string): Promise<string[]> {
  const voteContract = new ethers.Contract(
    ethers.getAddress(address),
    zkVoteAbi,
    provider
  );
  const allCommitments = await voteContract.allCommitments();
  return allCommitments;
}
