import { cookies } from "next/headers";
import { verifySessionToken, cookieName } from "@/lib/auth";

export async function getSession(): Promise<{ username: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName())?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
