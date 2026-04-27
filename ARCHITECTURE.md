# StudyGroup DAO Architecture

## Goal
StudyGroup DAO is a decentralized coordination app for study groups on Stellar Testnet. The MVP unifies governance voting, treasury funding, and achievement NFTs into one Next.js application with wallet-based access.

## High-Level Architecture
- **Frontend (`Next.js App Router`)**: Renders dashboard and module pages, collects user input, and triggers blockchain actions.
- **Wallet Layer (`Freighter`)**: Connects user accounts and signs transactions in the browser.
- **Blockchain Client Layer (`@stellar/stellar-sdk`)**: Builds, simulates, and submits Soroban transactions to Stellar Testnet.
- **Smart Contracts (`Soroban / Rust`)**: Encapsulate business logic for Governance, Treasury, and Achievements.
- **Network (`Stellar Testnet`)**: Executes contracts and stores authoritative DAO state.

## Module Boundaries

### 1) Governance Module (Polls)
- Contract stores polls (question, options, deadlines) and vote records.
- Frontend reads active poll data and vote counts via contract view methods.
- Voting flow:
  1. User selects an option in UI.
  2. Frontend builds a Soroban invocation transaction (`vote`).
  3. Freighter signs transaction.
  4. Transaction is submitted to Testnet and UI refreshes state.

### 2) Treasury Module (Crowdfunding + Split Logic)
- Contract tracks contributions and treasury balance.
- Supports donation entries and fund allocation/distribution rules for study tools or shared expenses.
- Donation flow:
  1. User enters amount in UI.
  2. Frontend invokes treasury contract function (for example `contribute`).
  3. Freighter signs, Testnet confirms, UI updates progress and balance.

### 3) Achievements Module (NFT Certificates)
- Contract mints NFT certificates for members who complete defined milestones.
- Frontend checks eligibility/ownership and exposes `claim certificate`.
- Claim flow:
  1. User clicks claim in UI.
  2. Frontend invokes NFT mint method.
  3. Freighter signs and submits.
  4. UI displays certificate state for connected wallet.

## Frontend Organization (MVP Baseline)
- `app/`: Next.js routes and layouts.
- `components/`: Shared UI components (cards, forms, status indicators).
- `hooks/`: Reusable hooks (`useStellarWallet`, contract hooks in later phases).
- `contracts/`: Soroban contract sources, ABI/spec references, and deployment scripts.

## Interaction Pattern with Stellar Testnet
1. User connects wallet through Freighter.
2. App reads account/network info and confirms Testnet context.
3. For read operations, app queries contract state through RPC.
4. For write operations, app builds Soroban transaction and requests signature in Freighter.
5. Signed transaction is submitted; UI handles pending/success/error states and re-fetches contract data.

## Environment and Config (Planned)
- `NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE`: Testnet passphrase.
- `NEXT_PUBLIC_STELLAR_RPC_URL`: Soroban RPC endpoint.
- `NEXT_PUBLIC_GOVERNANCE_CONTRACT_ID`: Governance contract ID.
- `NEXT_PUBLIC_TREASURY_CONTRACT_ID`: Treasury contract ID.
- `NEXT_PUBLIC_NFT_CONTRACT_ID`: Achievement NFT contract ID.

## Non-Functional Notes for Blue Belt
- Keep architecture modular so each feature can be demoed independently.
- Prioritize clear wallet UX, transaction feedback, and recoverable error states.
- Capture user feedback in-app for post-hackathon iteration.
- Deploy on Vercel/Netlify with Testnet-safe defaults.
