import NextAuth from "next-auth";
import { ZodError } from "zod";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import type { Provider } from "next-auth/providers";
const credsSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

const ADMIN_PASSWD = process.env.ADMIN_PASSWD;

const providers: Provider[] = [
  Credentials({
    credentials: {
      password: {
        type: "password",
        label: "Admin Password",
        placeholder: "*****",
      },
    },
    authorize: async (credentials) => {
      try {
        const { password } = credsSchema.parse(credentials);
        if (ADMIN_PASSWD && password === ADMIN_PASSWD) {
          return {
            id: "admin",
            name: "Admin",
            role: "admin",
          };
        }
        console.log(`password '${password}' wrong!`);
        return null;
      } catch (error) {
        if (error instanceof ZodError) {
          return null;
        }
        return null;
      }
    },
  }),
];

export const providerMap = providers
  .map((provider) => {
    if (typeof provider === "function") {
      const providerData = provider();
      return { id: providerData.id, name: providerData.name };
    } else {
      return { id: provider.id, name: provider.name };
    }
  })
  .filter((provider) => provider.id !== "credentials");

const nextAuthResult = NextAuth({
  pages: { signIn: "/signin" },
  session: { strategy: "jwt" },
  providers,
});

export const { handlers, auth, signIn } = nextAuthResult;
