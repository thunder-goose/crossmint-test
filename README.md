

<div align="center">
<img width="200" alt="Image" src="https://github.com/user-attachments/assets/8b617791-cd37-4a5a-8695-a7c9018b7c70" />
<br>
<br>
<h1>Wallets Server Quickstart</h1>

<div align="center">
<a href="https://docs.crossmint.com/introduction/platform/wallets">Docs</a> | <a href="https://github.com/crossmint">See all quickstarts</a>
</div>

<br>
<br>
</div>

## Introduction
Create and interact with Crossmint wallets creating all transactions on the server side and only using the client to sign with a non-custodial signer.

This quickstart uses Crossmint Auth and uses your email as a signer for that wallet.

**Learn how to:**
- Create a wallet
- View its balance for USDC
- Create a send USDC transaction from the server
- Sign a transaction with a non-custodial signer on the client

## Setup
1. Clone the repository and navigate to the project folder:
```bash
git clone https://github.com/crossmint/wallets-server-quickstart.git && cd wallets-server-quickstart
```

2. Install all dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Set up the environment variables:
```bash
cp .env.template .env
```

4. Get a Crossmint client API key from [here](https://docs.crossmint.com/introduction/platform/api-keys/client-side) and add it to the `.env` file. Make sure your API key has the following scopes: `users.create`, `users.read`, `wallets.read`, `wallets.create`, `wallets:transactions.create`, `wallets:transactions.sign`, `wallets:balance.read`, `wallets.fund`.
```bash
NEXT_PUBLIC_CROSSMINT_API_KEY=your_api_key
```

5. Get a Crossmint server API key from [here](https://docs.crossmint.com/introduction/platform/api-keys/server-side) and add it to the `.env` file. Make sure your API key has the following scopes: `wallets.read` and `wallets:transactions.create`.
```bash
CROSSMINT_SERVER_API_KEY=your_api_key
```

6. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## Using in production
1. Create a [production API key](https://docs.crossmint.com/introduction/platform/api-keys/client-side).`
