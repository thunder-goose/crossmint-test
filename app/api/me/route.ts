// app/api/me/route.ts
import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function GET() {
  const { getUser, isAuthenticated } = getKindeServerSession();

  const isUserAuthenticated = await isAuthenticated();
  if (!isUserAuthenticated) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const user = await getUser();
  return NextResponse.json({ user });
}
