"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSmartWallet } from "@/components/smart-wallet-context";
import type { Balances } from "@crossmint/wallets-sdk";

export function WalletBalance() {
  const { wallet } = useSmartWallet();
  const [balances, setBalances] = useState<Balances | null>(null);

  useEffect(() => {
    async function fetchBalances() {
      if (!wallet) return;
      try {
        const balances = await wallet.balances();
        console.log("Balance", balances);
        setBalances(balances);
      } catch (error) {
        console.error("Error fetching wallet balances:", error);
        alert("Error fetching wallet balances: " + error);
      }
    }
    fetchBalances();
  }, [wallet]);

  const formatBalance = (balance: string) => {
    return Number(balance).toFixed(2);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="border-t my-1"></div>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Image src="/usdc.svg" alt="USDC" width={24} height={24} />
          <p className="font-medium">USDC</p>
        </div>
        <div className="text-gray-700 font-medium">
          $ {formatBalance(balances?.usdc.amount || "0")}
        </div>
      </div>
      <div className="flex flex-col gap-2 mt-2">
        <a
          href="https://faucet.circle.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 text-sm py-1.5 px-3 rounded-md bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
        >
          + Get free test USDC
        </a>
      </div>
      <div className="text-gray-500 text-xs">
        Refresh the page after topping up. Balance may take a few seconds to
        update.
      </div>
    </div>
  );
}
