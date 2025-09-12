// middleware.ts
import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";

export default withAuth({
  // Configure authentication behavior
  //   isReturnToCurrentPage: true,
  // For SSO behavior, we want to redirect to login when not authenticated
  loginPage: `/api/auth/login?org_code=${encodeURIComponent(
    process.env.NEXT_PUBLIC_KINDE_ORG_CODE || ""
  )}&`,
});

// export default function middleware(req: NextRequest) {
//   return withAuth(req);
// }

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - root path (/) to allow public access to home page
     * Explicitly include /home route only
     */
    "/home",
  ],
};
