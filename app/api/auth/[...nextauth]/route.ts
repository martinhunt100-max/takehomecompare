// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth";

// Re-export the NextAuth handlers for App Router
export const GET = handlers.GET;
export const POST = handlers.POST;

