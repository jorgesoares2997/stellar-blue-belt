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

The app provides three on-chain modules:

- **Governance (Live Poll):**
  members vote on study topics using wallet-signed transactions.
- **Treasury (Crowdfunding/Split):**
  members donate to a shared pool and track group funding progress.
- **Achievements (NFT Certificates):**
  eligible members claim a certificate on-chain after milestones.

## Architecture

- **Frontend:** Next.js (App Router), React, Tailwind CSS
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

## Frontend Modules

- `/` - dashboard/home
- `/governance` - active poll and vote action
- `/treasury` - treasury balance, progress bar, and donate action
- `/certificates` - claim certificate action

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
