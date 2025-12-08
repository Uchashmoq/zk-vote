"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import prisma from "@/lib/prisma";
import { Voter } from "../prisma/src/lib/prisma/client";
import { isAddress } from "viem";

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
