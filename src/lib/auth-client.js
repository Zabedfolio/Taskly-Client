import { createAuthClient } from "better-auth/react";

// Single instance pointing to the Next.js app itself (which handles /api/auth/*)
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
});

export const { signIn, signUp, useSession } = authClient;