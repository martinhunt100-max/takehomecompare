// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth";

// Auth.js v5 in the App Router exports GET/POST handlers
export const { GET, POST } = handlers;
