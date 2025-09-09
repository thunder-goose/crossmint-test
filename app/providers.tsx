"use client";

import {
  CrossmintProvider,
  CrossmintWalletProvider,
} from "@crossmint/client-sdk-react-ui";

import { KindeProvider } from "@kinde-oss/kinde-auth-nextjs";
import { SmartWalletManager } from "@/components/smart-wallet-context";

if (!process.env.NEXT_PUBLIC_CROSSMINT_API_KEY) {
  throw new Error("NEXT_PUBLIC_CROSSMINT_API_KEY is not set");
}

// Inner component that can use Kinde hooks
function CrossmintProviders({ children }: { children: React.ReactNode }) {
  return (
    <CrossmintProvider apiKey={process.env.NEXT_PUBLIC_CROSSMINT_API_KEY || ""}>
      <SmartWalletManager>
        {/* <CrossmintWalletProvider
          createOnLogin={{
            chain: "base-sepolia",
            signer: {
              type: "email",
            },
          }}
        > */}
        {children}
        {/* </CrossmintWalletProvider> */}
      </SmartWalletManager>
    </CrossmintProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <KindeProvider>
      <CrossmintProviders>{children}</CrossmintProviders>
    </KindeProvider>
  );
}
