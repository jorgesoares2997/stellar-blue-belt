# Soroban Contracts (Phase 2)

This workspace contains the three StudyGroup DAO Soroban contracts:

- `governance`: study poll creation and voting.
- `treasury`: crowdfunding + split accounting.
- `achievements`: NFT-like certificate issuance tracking.

## Build

From project root:

```bash
cd contracts
cargo build --target wasm32v1-none --release
```

## Deploy to Testnet

Required environment variables:

- `SOROBAN_SOURCE` (configured Soroban identity name)
- `ADMIN_ADDRESS` (Stellar address used as admin)
- `SOROBAN_NETWORK` (optional, defaults to `testnet`)

Deploy all contracts:

```bash
cd contracts
./scripts/deploy-all.sh
```

Or deploy a single contract with:

- `./scripts/deploy-governance.sh`
- `./scripts/deploy-treasury.sh`
- `./scripts/deploy-achievements.sh`
