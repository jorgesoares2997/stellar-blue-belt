#!/usr/bin/env bash
set -euo pipefail

# Required env vars:
# - SOROBAN_SOURCE
# - ADMIN_ADDRESS
# Optional:
# - SOROBAN_NETWORK (default: testnet)

SOROBAN_NETWORK="${SOROBAN_NETWORK:-testnet}"

if [[ -z "${SOROBAN_SOURCE:-}" || -z "${ADMIN_ADDRESS:-}" ]]; then
  echo "Usage: SOROBAN_SOURCE=<identity> ADMIN_ADDRESS=<G...> $0"
  exit 1
fi

cargo build --target wasm32v1-none --release -p governance

CONTRACT_ID=$(
  soroban contract deploy \
    --network "$SOROBAN_NETWORK" \
    --source "$SOROBAN_SOURCE" \
    --wasm target/wasm32v1-none/release/governance.wasm
)

soroban contract invoke \
  --network "$SOROBAN_NETWORK" \
  --source "$SOROBAN_SOURCE" \
  --id "$CONTRACT_ID" \
  -- init \
  --admin "$ADMIN_ADDRESS"

echo "Governance deployed: $CONTRACT_ID"
