"use client";

import { LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";

export function LoginButton() {
  return (
    <LoginLink className="w-full py-2 px-4 rounded-md text-sm font-medium border bg-gray-50 hover:bg-gray-100 transition-colors">
      Login
    </LoginLink>
  );
}
