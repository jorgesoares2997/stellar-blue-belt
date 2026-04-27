#!/usr/bin/env bash
set -euo pipefail

# Deploys all StudyGroup DAO Soroban contracts to Testnet.
# Required env vars:
# - SOROBAN_SOURCE
# - ADMIN_ADDRESS

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

./scripts/deploy-governance.sh
./scripts/deploy-treasury.sh
./scripts/deploy-achievements.sh
