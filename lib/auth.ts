// lib/auth.ts
import NextAuth, { type NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Resend from "next-auth/providers/resend"; // ✅ use Resend provider (no Nodemailer)
import { prisma } from "@/lib/prisma";

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },

  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY!,   // e.g. re_XYZ...
      from: process.env.EMAIL_FROM!,         // e.g. "TakeHomeCompare <login@takehomecompare.com>"
    }),
  ],

  pages: {
    signIn: "/signin",
  },

  callbacks: {
    async session({ session, token }) {
      // expose userId on session
      if (token?.sub) (session as any).userId = token.sub;
      return session;
    },
  },

  // trustHost: true, // uncomment if you use multiple domains
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
