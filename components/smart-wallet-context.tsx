"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-nextjs";
import {
  CrossmintWallets,
  createCrossmint,
  Wallet,
} from "@crossmint/wallets-sdk";

// Use the Wallet type from the SDK for base-sepolia chain
type SmartWallet = Wallet<"base-sepolia">;

// Create a context for the smart wallet
interface SmartWalletContextType {
  wallet: SmartWallet | null;
  status: "loading" | "connected" | "disconnected" | "error";
  error?: string;
}

const SmartWalletContext = createContext<SmartWalletContextType>({
  wallet: null,
  status: "loading",
});

export const useSmartWallet = () => useContext(SmartWalletContext);

// Smart Wallet Manager Component
export const SmartWalletManager = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  console.log("SmartWalletManager: Component rendered");
  const { getToken, user, isAuthenticated } = useKindeAuth();
  const [wallet, setWallet] = useState<SmartWallet | null>(null);
  const [status, setStatus] = useState<
    "loading" | "connected" | "disconnected" | "error"
  >("loading");
  const [error, setError] = useState<string>();

  useEffect(() => {
    async function setupWallet() {
      console.log("SmartWalletManager: setupWallet called", {
        isAuthenticated,
        userEmail: user?.email,
      });
      if (!isAuthenticated || !user?.email) {
        console.log(
          "SmartWalletManager: User not authenticated or no email, setting status to disconnected"
        );
        setStatus("disconnected");
        setWallet(null);
        return;
      }

      try {
        setStatus("loading");

        // Get the JWT from Kinde
        const userToken = getToken();

        if (!userToken) {
          throw new Error("No JWT token available from Kinde");
        }

        console.log("Setting up smart wallet with Kinde JWT", {
          hasToken: !!userToken,
          userEmail: user.email,
        });

        console.log("About to create wallet with email signer...");

        // Initialize Crossmint SDK with the user's JWT
        const crossmint = createCrossmint({
          apiKey: process.env.NEXT_PUBLIC_CROSSMINT_API_KEY || "",
          experimental_customAuth: {
            jwt: userToken,
          },
        });

        const crossmintWallets = CrossmintWallets.from(crossmint);

        // Create wallet with email signer
        const smartWallet = await crossmintWallets.getOrCreateWallet({
          chain: "base-sepolia",
          signer: {
            type: "email",
            email: user.email, // Add the user's email address
            onAuthRequired: async (
              needsAuth,
              sendEmailWithOtp,
              verifyOtp,
              reject
            ) => {
              console.log("needsAuth", needsAuth);
              if (needsAuth) {
                try {
                  await sendEmailWithOtp();

                  // Prompt the user to check their email for the OTP code
                  const otp = window.prompt(
                    `Please check your email (${user.email}) for the OTP code and enter it here:`
                  );

                  if (otp) {
                    // Verify the OTP code
                    await verifyOtp(otp);
                  } else {
                    // User cancelled the prompt
                    console.log("User cancelled OTP prompt");
                    reject();
                  }
                } catch (error) {
                  console.error("OTP verification failed:", error);
                  reject();
                }
              }
            },
          },
        });

        console.log("Wallet created with address:", smartWallet.address);

        console.log("Smart wallet created:", smartWallet.address);
        setWallet(smartWallet);
        setStatus("connected");
      } catch (err) {
        console.error("Error setting up smart wallet:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setStatus("error");
      }
    }

    setupWallet();
  }, [getToken, user, isAuthenticated]);

  const contextValue: SmartWalletContextType = {
    wallet,
    status,
    error,
  };

  return (
    <SmartWalletContext.Provider value={contextValue}>
      {children}
    </SmartWalletContext.Provider>
  );
};
