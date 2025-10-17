// auth.ts (repo root)
import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs"; // avoid edge for auth

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },

  providers: [
    EmailProvider({
      // ✅ REQUIRED by Auth.js at init time
      server: {
        host: process.env.SMTP_HOST,      // e.g. smtp.resend.com
        port: Number(process.env.SMTP_PORT || 465),
        auth: {
          user: process.env.SMTP_USER,    // e.g. "resend"
          pass: process.env.SMTP_PASSWORD // from Resend SMTP Integration
        },
        secure: true
      },
      // Used as the visible From header and by Resend
      from: process.env.EMAIL_FROM, // e.g. "team@takehomecompare.com"

      // Optional: send via Resend HTTP API (kept here if you prefer it)
      async sendVerificationRequest({ identifier, url }) {
        // If RESEND_API_KEY is not set, fall back to nodemailer SMTP above.
        if (!process.env.RESEND_API_KEY) return;

        const resp = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM,
            to: [identifier],
            subject: "Your sign-in link",
            html: `
              <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;line-height:1.5">
                <h2>Sign in to TakeHomeCompare</h2>
                <p>Click the button below to sign in:</p>
                <p><a href="${url}" style="display:inline-block;padding:10px 16px;border-radius:6px;background:#000;color:#fff;text-decoration:none">Sign in</a></p>
                <p>If the button doesn't work, copy and paste this URL:</p>
                <p><a href="${url}">${url}</a></p>
              </div>
            `,
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

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
