// auth.ts (root of repo)
import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) console.warn(`[auth] Missing environment variable: ${name}`);
  return v || "";
}

// ✅ Export the config object so Pages API routes can use it
export const authConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [
    EmailProvider({
      from: requireEnv("EMAIL_FROM"), // must be a verified sender/domain in Resend
      async sendVerificationRequest({ identifier, url }) {
        const RESEND_API_KEY = requireEnv("RESEND_API_KEY");
        const FROM = requireEnv("EMAIL_FROM");

        const html = `
          <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.5">
            <h2>Sign in to TakeHomeCompare</h2>
            <p>Click to sign in:</p>
            <p><a href="${url}" style="display:inline-block;padding:10px 16px;border-radius:6px;background:#000;color:#fff;text-decoration:none">Sign in</a></p>
            <p>If the button doesn't work, copy and paste this URL:</p>
            <p><a href="${url}">${url}</a></p>
          </div>`;

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
            html,
          }),
        });

        if (!resp.ok) {
          const text = await resp.text();
          throw new Error(`Resend API error: ${resp.status} ${text}`);
        }
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
} satisfies Parameters<typeof NextAuth>[0];

// Standard v5 helpers for App Router usage
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
