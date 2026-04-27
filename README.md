# StudyGroup DAO - Stellar Journey to Mastery (Blue Belt)

StudyGroup DAO is a decentralized MVP for study communities built on Stellar Testnet.  
It combines governance polls, treasury crowdfunding/split accounting, and achievement certificates in a single dApp.

## Hackathon Submission Info

- **Live Deploy Link:** [ ]
- **Demo Video Link:** [ ]
- **Feedback Form Link:** [ ]
- **Repository Link:** [ ]

## Problem Statement

Study groups often rely on centralized tools for:
- deciding what to study next,
- collecting group funds for tools/courses,
- recognizing member achievements.

StudyGroup DAO moves these flows on-chain to improve transparency, shared ownership, and participation.

## Solution Overview

The app provides four on-chain and AI-powered modules:

- **Governance (Live Poll):**
  members vote on study topics using wallet-signed transactions with a high-end "Fluid Glass" interface.
- **Treasury (Crowdfunding/Split):**
  members donate to a shared pool and track group funding progress with real-time visual feedback.
- **AI Achievements (Google Gemini + NFTs):**
  Google Gemini AI analyzes user milestones to generate unique digital art, which is then minted as an on-chain NFT achievement.
- **Fluid UI & Smooth Scroll:**
  A premium user experience featuring custom cursors, smooth scroll (Lenis), and parallax effects.

## Architecture

- **Frontend:** Next.js (App Router), React, Framer Motion, GSAP
- **AI Integration:** Google Gemini SDK (`@google/generative-ai`)
- **Animation & UX:** Lenis (Smooth Scroll), Framer Motion, GSAP
- **Wallet Integration:** Freighter (`@stellar/freighter-api`)
- **Blockchain Client:** Stellar SDK (`@stellar/stellar-sdk`)
- **Smart Contracts:** Soroban (Rust)
- **Network:** Stellar Testnet

For architecture details, see `ARCHITECTURE.md`.

## Contracts

Soroban workspace location: `contracts/`

- `governance`: poll creation and voting
- `treasury`: contribution and allocation accounting
- `achievements`: eligibility + certificate mint tracking

Deploy scripts are included in:
- `contracts/scripts/deploy-governance.sh`
- `contracts/scripts/deploy-treasury.sh`
- `contracts/scripts/deploy-achievements.sh`
- `contracts/scripts/deploy-all.sh`

## Build and Deploy Contracts (Full Guide)

### 1) Prerequisites

Install and configure:

- Rust toolchain
- Stellar CLI
- Stellar identity for Testnet deploys

Suggested commands:

```bash
# Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup target add wasm32v1-none

# Stellar CLI
cargo install --locked stellar-cli

# Verify
rustc --version
cargo --version
stellar --version
```

### 2) Configure Stellar identity and network

Create an identity and view the public address:

```bash
stellar keys generate admin
stellar keys address admin
```

Fund this address on Stellar Testnet (Friendbot), then set env vars:

```bash
export SOROBAN_SOURCE=admin
export ADMIN_ADDRESS=<YOUR_G_PUBLIC_KEY>
export SOROBAN_NETWORK=testnet
```

Note: the deploy scripts still use `SOROBAN_SOURCE` and `SOROBAN_NETWORK` variable names for compatibility.

### 3) Build all contracts

From project root:

```bash
cd contracts
cargo build --target wasm32v1-none --release
```

This generates:

- `target/wasm32v1-none/release/governance.wasm`
- `target/wasm32v1-none/release/treasury.wasm`
- `target/wasm32v1-none/release/achievements.wasm`

### 4) Deploy contracts (option A: all at once)

```bash
cd contracts
./scripts/deploy-all.sh
```

### 5) Deploy contracts (option B: one by one)

```bash
cd contracts
./scripts/deploy-governance.sh
./scripts/deploy-treasury.sh
./scripts/deploy-achievements.sh
```

Each script:

1. Builds the contract WASM
2. Deploys to Testnet
3. Calls `init --admin <ADMIN_ADDRESS>`
4. Prints the deployed contract ID

### 6) Save deployed contract IDs in frontend env

Create/update `.env.local` in project root:

```env
NEXT_PUBLIC_STELLAR_RPC_URL=https://soroban-testnet.stellar.org
NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
NEXT_PUBLIC_GOVERNANCE_CONTRACT_ID=<GOVERNANCE_CONTRACT_ID>
NEXT_PUBLIC_TREASURY_CONTRACT_ID=<TREASURY_CONTRACT_ID>
NEXT_PUBLIC_NFT_CONTRACT_ID=<ACHIEVEMENTS_CONTRACT_ID>
NEXT_PUBLIC_ACTIVE_POLL_ID=1
```

### 7) Initialize governance poll data (required for voting page)

After deployment, create the first poll so `/governance` can vote on poll `1`:

```bash
stellar contract invoke \
  --network testnet \
  --source admin \
  --id <GOVERNANCE_CONTRACT_ID> \
  -- create_poll \
  --admin <ADMIN_ADDRESS> \
  --question "Which topic should we study next?" \
  --options '["Smart Contract Security Basics","Soroban Testing Deep Dive","Stellar Protocol Internals"]' \
  --deadline_ledger 999999999
```

If needed, check current poll count:

```bash
stellar contract invoke \
  --network testnet \
  --source admin \
  --id <GOVERNANCE_CONTRACT_ID> \
  -- poll_count
```

### 8) Prepare certificate eligibility (required for claiming)

Users must be marked eligible in `achievements` before claiming:

```bash
stellar contract invoke \
  --network testnet \
  --source admin \
  --id <ACHIEVEMENTS_CONTRACT_ID> \
  -- set_eligible \
  --admin <ADMIN_ADDRESS> \
  --member <USER_G_ADDRESS> \
  --eligible true
```

### 9) Run frontend

```bash
npm install
npm run dev
```

Open `http://localhost:3000`, connect Freighter, ensure wallet network is Testnet.

## Frontend Modules

- `/` - dashboard/home
- `/governance` - active poll and vote action
- `/treasury` - treasury balance, progress bar, and donate action
- `/achievements` - AI-powered badge generation and NFT minting

## Functionality Walkthrough (All Features)

### Governance (Poll voting)

1. Connect wallet in header.
2. Open `/governance`.
3. Choose one topic and click **Vote on-chain**.
4. Freighter opens transaction signature request.
5. Confirm signature.
6. App submits Soroban transaction and displays success/error status.

### Treasury (Donate XLM test amount to DAO logic)

1. Connect wallet.
2. Open `/treasury`.
3. Enter a donation amount.
4. Click **Donate XLM (Testnet)**.
5. Confirm signature in Freighter.
6. App submits `contribute(...)` and updates UI status/progress.

### Certificates (Claim NFT-style achievement)

1. Admin first sets your wallet as eligible (contract call above).
2. Connect the same eligible wallet.
3. Open `/certificates`.
4. Keep or edit metadata URI.
5. Click **Claim Certificate**.
6. Confirm signature in Freighter.
7. App submits `claim_certificate(...)` and shows result status.

### Feedback capture

1. Use any page in the app.
2. Persistent bottom prompt is always visible.
3. Click the feedback link after replacing `[LINK_PLACEHOLDER]` with your real form URL.

## Wallets Used For Testing (5 users)

1. [ ]
2. [ ]
3. [ ]
4. [ ]
5. [ ]

## How to Run Locally

```bash
npm install
npm run dev
```

## Environment Variables

Create `.env.local` and set:

```env
NEXT_PUBLIC_STELLAR_RPC_URL=
NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE=
NEXT_PUBLIC_GOVERNANCE_CONTRACT_ID=
NEXT_PUBLIC_TREASURY_CONTRACT_ID=
NEXT_PUBLIC_NFT_CONTRACT_ID=
NEXT_PUBLIC_ACTIVE_POLL_ID=
GEMINI_API_KEY=
```

## User Feedback

In-app persistent feedback prompt is included with:

`Help us improve! Please fill out our Feedback Form: [LINK_PLACEHOLDER]`

Replace placeholder with your final form link:

- **Feedback Form Final Link:** [ ]

## Future Iteration Plan

- [ ] Add full on-chain read models for poll results and treasury state.
- [ ] Add role-based permissions for DAO admin actions.
- [ ] Add richer certificate metadata and gallery.
- [ ] Improve onboarding UX and transaction status details.

## Blue Belt Checklist

- [x] Documented architecture
- [x] Smart contracts + frontend integration
- [x] Freighter wallet integration
- [x] User feedback collection hook
- [ ] Final deploy URL filled
- [ ] Demo video link filled
- [ ] Five real user wallet addresses filled
