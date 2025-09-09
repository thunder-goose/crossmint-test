"use client";

import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";

export function LogoutButton() {
  return (
    <LogoutLink className="w-full py-2 px-4 rounded-md text-sm font-medium border bg-gray-50 hover:bg-gray-100 transition-colors">
      Log out
    </LogoutLink>
  );
}
