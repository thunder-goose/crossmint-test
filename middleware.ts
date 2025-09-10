// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { kindeHelpers } from "./lib/kinde";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("id_token")?.value;

  if (!token) {
    // Redirect to Kinde with prompt=none
    const authUrl = kindeHelpers.getAuthUrl({ prompt: "none" });
    return NextResponse.redirect(authUrl);
  }

  return NextResponse.next();
}
