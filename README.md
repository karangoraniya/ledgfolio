# LedgeFolio

## Short Description

LedgeFolio is a comprehensive web application that integrates Ledger hardware wallets with various Web3 functionalities, including NFT management, cross-chain token bridging, ENS (Ethereum Name Service) domain operations, and cryptocurrency purchases.

## Chart

![Chart](https://silver-autonomous-silverfish-492.mypinata.cloud/ipfs/QmPDQ8T4hFVJdarLfCFkae7hvJddpPttKM8AjZtrDwjfiB)

## Detailed Description

LedgeFolio is designed to provide a seamless interface between Ledger hardware wallets and the Web3 ecosystem. It offers the following key features:

1. **NFT Gallery**: View and manage NFTs associated with your Ledger wallet address.
2. **Cross-Chain Bridge**: Transfer tokens between different blockchain networks using Circle's infrastructure.
3. **ENS Operations**: Purchase abd resolve ENS domains directly from your Ledger wallet.
4. **Cryptocurrency Purchases**: Buy cryptocurrencies securely using your Ledger wallet.[Coming Soon]
5. **Multi-Chain Support**: Interact with Ethereum, Base, and Bitcoin networks. [More network soon]

LedgeFolio aims to simplify complex Web3 operations while maintaining the security of a hardware wallet, making it an ideal solution for users who prioritize both functionality and safety in their blockchain interactions.

## How It's Made

### Technology Stack

- **Frontend Framework**: Next.js
- **Wallet Integration**: Ledger SDK
- **Cross-Chain Functionality**: Circle SDK
- **ENS Operations**: ENS.js library
- **Blockchain Interaction**: Ethers.js, Viem, Wagmi
- **Styling**: Tailwind CSS, Shadcn UI components

### Key Components

1. **Ledger Integration**: Utilizes the Ledger SDK to securely connect and interact with Ledger hardware wallets.
2. **NFT Gallery**: Fetches and displays NFTs using the Alchemy SDK, with dynamic loading and error handling.
3. **Bridge Component**: Implements cross-chain token transfers using the Circle SDK, allowing for seamless movement of assets between supported networks.
4. **ENS Manager**: Integrates ENS SDK for domain operations, including purchasing, resolving, and reverse resolution of ENS domains.
5. **Multi-Chain Support**: Implements support for Ethereum, Base, and Bitcoin networks, allowing users to interact with multiple blockchains from a single interface.

### Development Process

1. Set up a Next.js project with TypeScript for type safety.
2. Integrated Ledger SDK for secure hardware wallet connections.
3. Implemented NFT gallery using Alchemy SDK for fetching NFT data.
4. Developed cross-chain bridging functionality using Circle SDK.
5. Added ENS operations using ENS sdk and wagmi library.
6. Implemented multi-chain support for Ethereum, Base, and Bitcoin.
7. Styled the application using Tailwind CSS and Shadcn UI components for a modern, responsive design.

## Usage Scenarios

### Scenario 1: Sending Tokens

1. Connect your Ledger device to LedgeFolio.
2. Navigate to the Send Tokens section.
3. Select the token you want to send and the destination network.
4. Enter the recipient's address and the amount you wish to send.
5. Review the transaction details, including network fees.
6. Confirm the transaction on your Ledger device.
7. Wait for the transaction to be processed and confirmed on the blockchain.

### Scenario 2: Viewing and Managing NFTs

1. Connect your Ledger device to LedgeFolio.
2. Navigate to the NFT Gallery section.
3. The application fetches and displays all NFTs associated with your Ledger wallet address.
4. View detailed information about each NFT, including images, descriptions, and contract addresses.

### Scenario 3: Bridging Tokens Between Chains

1. Connect your Ledger device and navigate to the Bridge section.
2. Select the source chain (e.g., Ethereum) and the destination chain (e.g., Base).
3. Enter the amount of tokens you want to bridge.
4. Confirm the transaction on your Ledger device.
5. Wait for the bridging process to complete, which includes committing the transaction on the source chain and finalizing it on the destination chain.

### Scenario 4: Purchasing and Managing an ENS Domain

1. Connect your Ledger and go to the ENS Manager section.
2. Search for an available ENS domain (e.g., "karangoraniya.eth").
3. If available, initiate the purchase process.
4. Confirm the purchase transaction on your Ledger device.
5. Once purchased, set up reverse resolution to link your Ethereum address, BTC, SOLANA, DOGECOIN etc.. to the new domain.
6. Use the ENS Manager to manage your domain, such as setting resolver addresses for different cryptocurrencies.

These scenarios demonstrate the versatility of LedgeFolio, showcasing its ability to handle various Web3 operations securely using a Ledger hardware wallet, from sending tokens and managing NFTs to bridging assets and managing ENS domains.

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
