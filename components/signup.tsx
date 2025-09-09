"use client";

import { RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components";

export function SignUpButton() {
  return (
    <RegisterLink className="w-full py-2 px-4 rounded-md text-sm font-medium border bg-gray-50 hover:bg-gray-100 transition-colors">
      Sign Up
    </RegisterLink>
  );
}
