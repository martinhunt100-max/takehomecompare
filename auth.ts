// auth.ts (place this at the ROOT of the repo)
import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

// If you want to restrict sign-ins to certain domains, you can add logic
// inside sendVerificationRequest or with a signIn() callback later.

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Prisma adapter for persisting users/sessions
  adapter: PrismaAdapter(prisma),

  // Use JWT sessions (simpler in serverless)
  session: { strategy: "jwt" },

  // Email (magic link) provider via Resend API
  providers: [
    EmailProvider({
      from: process.env.EMAIL_FROM, // MUST be a verified sender/domain in Resend
      async sendVerificationRequest({ identifier, url }) {
        // identifier = user's email address
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

  // Custom pages (your /app/(auth)/signin/page.tsx)
  pages: { signIn: "/signin" },

  // Example callback to put the userId on the session if you want it
  callbacks: {
    async session({ session, token }) {
      if (token?.sub) (session as any).userId = token.sub;
      return session;
    },
  },

  // You can also set: trustHost: true, if deploying across multiple domains
  // trustHost: true,
});
