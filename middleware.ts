// middleware.ts
import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";

export default withAuth({
  // Configure authentication behavior
  isReturnToCurrentPage: true,
  // For SSO behavior, we want to redirect to login when not authenticated
  loginPage: `/api/auth/login?org_code=${encodeURIComponent(
    process.env.NEXT_PUBLIC_KINDE_ORG_CODE || ""
  )}`,
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
