// pages/api/auth/[...nextauth].ts
import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) console.warn(`[auth] Missing env: ${name}`);
  return v || "";
}

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [
    EmailProvider({
      from: requireEnv("EMAIL_FROM"),
      async sendVerificationRequest({ identifier, url }) {
        const RESEND_API_KEY = requireEnv("RESEND_API_KEY");
        const FROM = requireEnv("EMAIL_FROM");
        const resp = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: FROM,
            to: [identifier],
            subject: "Your sign-in link",
            html: `<p>Click to sign in:</p><p><a href="${url}">${url}</a></p>`,
          }),
        });
        if (!resp.ok) throw new Error(`Resend API error: ${resp.status} ${await resp.text()}`);
      },
    }),
  ],
  pages: { signIn: "/signin" },
  callbacks: {
    async session({ session, token }) {
      if (token?.sub) (session as any).userId = token.sub;
      return session;
    },
  },
});

export default handler;
