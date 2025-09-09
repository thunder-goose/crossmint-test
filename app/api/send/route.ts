import { CrossmintWallets, createCrossmint } from "@crossmint/wallets-sdk";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

type SendBody = {
  walletAddress: string;
  amount: string;
  token: string;
  recipient: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SendBody;

    if (!body.walletAddress || !body.amount || !body.token || !body.recipient) {
      return NextResponse.json(
        { error: "walletAddress, amount, token and recipient are required" },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Get Kinde user session and token
    const { getAccessTokenRaw, isAuthenticated, getUser } =
      getKindeServerSession();
    const isUserAuthenticated = await isAuthenticated();

    if (!isUserAuthenticated) {
      return NextResponse.json(
        { error: "User not authenticated" },
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const user = await getUser();
    const kindeToken = await getAccessTokenRaw();

    if (!kindeToken) {
      return NextResponse.json(
        { error: "Unable to get access token" },
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (!user?.email) {
      return NextResponse.json(
        { error: "User email not available" },
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const crossmintApiKey = process.env.CROSSMINT_SERVER_API_KEY ?? "";

    if (!crossmintApiKey) {
      throw new Error(
        "CROSSMINT_SERVER_API_KEY environment variable is required"
      );
    }
    console.log("creating crossmint with user email:", user.email);

    const crossmint = createCrossmint({
      apiKey: crossmintApiKey,
      experimental_customAuth: {
        jwt: kindeToken,
      },
    });

    const crossmintWallets = CrossmintWallets.from(crossmint);

    console.warn(
      "Preparing transaction for wallet:",
      body.walletAddress,
      "user email:",
      user.email
    );

    // For server-side operations, we use email signer type to match the client-side wallet creation
    const wallet = await crossmintWallets.getWallet(body.walletAddress, {
      chain: "base-sepolia",
      signer: {
        type: "email",
        // email: user.email,
      },
    });

    console.log("wallet retrieved successfully", {
      address: wallet.address,
      chain: "base-sepolia",
    });

    console.log("Sending transaction:", {
      recipient: body.recipient,
      token: body.token,
      amount: body.amount,
    });

    const { transactionId } = await wallet.send(
      body.recipient,
      body.token,
      body.amount,
      {
        experimental_prepareOnly: true,
      }
    );

    console.log("Transaction prepared with ID:", transactionId);

    return NextResponse.json(
      {
        transactionId,
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in send API:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
