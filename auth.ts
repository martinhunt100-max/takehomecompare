// auth.ts (root of repo)
import NextAuth from "next-auth";               // <-- NOTE: from "next-auth"
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    EmailProvider({
      sendVerificationRequest: async ({ identifier, url }) => {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM,
            to: [identifier],
            subject: "Your sign-in link",
            html: `<p>Click to sign in:</p><p><a href="${url}">${url}</a></p>`
          })
        });
      }
    })
  ],
  pages: { signIn: "/signin" },
  callbacks: {
    async session({ session, token }) {
      if (token?.sub) (session as any).userId = token.sub;
      return session;
    }
  }
});
