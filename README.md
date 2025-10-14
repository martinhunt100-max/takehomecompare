# Deploy (Vercel)


1) **Create Vercel project** from this repo. Add domain `takehomecompare.com` (+ `www`).
2) **Create Vercel Postgres** (Storage → Postgres) and attach to the project.
3) **Env vars**: copy `.env.example` into Vercel → Settings → Environment Variables.
4) **Prisma push**: locally run `npm i`, then `npm run prisma:generate` and `npm run prisma:push` (or use Vercel’s migration flow).
5) **Stripe webhook**: in Stripe → Developers → Webhooks, add `https://takehomecompare.com/api/stripe/webhook` with events:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
6) **Email**: verify sending domain in Resend. Set `RESEND_API_KEY` and `EMAIL_FROM`.
7) **Deploy**. Test: sign-in → `/advanced` → Checkout → return → `/api/me` shows `subscription_active: true`.
