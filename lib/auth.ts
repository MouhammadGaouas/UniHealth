import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    modelName: "User",
    additionalFields: {
      phoneNumber: {
        type: "string",
        required: false,
      },
      gender: {
        type: "string",
        required: false,
      },
      birthday: {
        type: "string",
        required: false,
      },
      role: {
        type: "string",
        required: false,
        defaultValue: "PATIENT",
        input: false,
      },
    },
  },
  plugins: [
    admin({
      defaultRole: "PATIENT",
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;
