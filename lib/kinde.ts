// lib/kinde.ts
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

// Helper functions for Kinde operations
export const kindeHelpers = {
  getAuthUrl: (options?: { prompt?: string }) => {
    const baseUrl = `https://qoin-stg.eu.kinde.com/oauth2/auth`;
    const params = new URLSearchParams({
      client_id: process.env.KINDE_CLIENT_ID!,
      redirect_uri: process.env.KINDE_SITE_URL + "/api/auth/kinde_callback",
      response_type: "code",
      scope: "openid profile email",
      ...(options?.prompt && { prompt: options.prompt }),
    });
    return `${baseUrl}?${params.toString()}`;
  },

  getLogoutUrl: (options?: { post_logout_redirect_uri?: string }) => {
    const baseUrl = `https://qoin-stg.eu.kinde.com/logout`;
    const params = new URLSearchParams({
      redirect:
        options?.post_logout_redirect_uri ||
        process.env.KINDE_SITE_URL ||
        "https://app2.com/",
    });
    return `${baseUrl}?${params.toString()}`;
  },
};

// Export the server session helper
export { getKindeServerSession };
