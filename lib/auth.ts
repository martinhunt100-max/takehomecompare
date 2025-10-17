// lib/auth.ts
import NextAuth, { type NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import EmailProvider from "next-auth/providers/email";
import { prisma } from "@/lib/prisma";

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },

  // Important: include `from` so NextAuth never tries to use Nodemailer
  providers: [
    EmailProvider({
      from: process.env.EMAIL_FROM, // e.g. "TakeHomeCompare <login@yourdomain.com>"
      async sendVerificationRequest({ identifier, url }) {
        // Use Resend directly (no SMTP/Nodemailer)
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

  // Helps in multi-domain / Vercel previews
  trustHost: true,
} satisfies NextAuthConfig;

// Bind NextAuth and export helpers for App Router usage
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
