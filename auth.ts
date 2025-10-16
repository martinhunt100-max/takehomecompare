// auth.ts (root of repo)
import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    // Don't throw at import time for build; only when actually used
    console.warn(`[auth] Missing environment variable: ${name}`);
  }
  return v || "";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Persist users/sessions in Postgres through Prisma
  adapter: PrismaAdapter(prisma),

  // JWT sessions = simpler for serverless
  session: { strategy: "jwt" },

  // Helpful when running on multiple domains (preview/prod) behind Vercel
  trustHost: true,

  // Email magic-link via Resend (no SMTP/Nodemailer)
  providers: [
    EmailProvider({
      from: requireEnv("EMAIL_FROM"), // must be a verified sender/domain in Resend
      async sendVerificationRequest({ identifier, url }) {
        const RESEND_API_KEY = requireEnv("RESEND_API_KEY");
        const FROM = requireEnv("EMAIL_FROM");

        // Minimal HTML (works with Resend click tracking OFF)
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

  // Use your custom sign-in page
  pages: { signIn: "/signin" },

  // Optional: surface userId on session
  callbacks: {
    async session({ session, token }) {
      if (token?.sub) (session as any).userId = token.sub;
      return session;
    },
  },
});
