// pages/api/me.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { auth } from "@/auth"; // v5 helper; no prerender for pages/api

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await auth();
  if (!session?.user?.email) return res.status(401).json({ ok: false });
  return res.status(200).json({ ok: true, email: session.user.email });
}

