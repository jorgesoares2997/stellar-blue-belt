"use client";

import { useSyncExternalStore } from "react";
import { ensureWalletKitInitialized } from "@/lib/wallet-kit";

type WalletState = {
  walletName: string | null;
  address: string | null;
  network: string | null;
  connected: boolean;
  loading: boolean;
  error: string | null;
};

const initialState: WalletState = {
  walletName: null,
  address: null,
  network: null,
  connected: false,
  loading: false,
  error: null,
};

let state: WalletState = initialState;
const listeners = new Set<() => void>();

function setState(updater: WalletState | ((prev: WalletState) => WalletState)) {
  state = typeof updater === "function" ? updater(state) : updater;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

async function refreshFromWallet() {
  const StellarWalletsKit = await ensureWalletKitInitialized();
  const { address } = await StellarWalletsKit.getAddress();

  let networkPassphrase: string | null = null;
  try {
    const networkResult = await StellarWalletsKit.getNetwork();
    networkPassphrase = networkResult.networkPassphrase ?? null;
  } catch {
    // Some wallets may not return network details consistently.
  }

  setState((prev) => ({
    ...prev,
    walletName: StellarWalletsKit.selectedModule?.productName ?? prev.walletName,
    address,
    network:
      networkPassphrase ??
      process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE ??
      null,
    connected: true,
    loading: false,
    error: null,
  }));
}

export function useStellarWallet() {
  const wallet = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const connect = async () => {
    const StellarWalletsKit = await ensureWalletKitInitialized();
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const authResult = await StellarWalletsKit.authModal();
      setState((prev) => ({
        ...prev,
        walletName: StellarWalletsKit.selectedModule?.productName ?? null,
        address: authResult.address ?? null,
        connected: Boolean(authResult.address),
        loading: false,
        error: null,
      }));
      await refreshFromWallet();
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        connected: false,
        error:
          error instanceof Error
            ? error.message
            : "Wallet connection failed.",
      }));
    }
  };

  const disconnect = async () => {
    const StellarWalletsKit = await ensureWalletKitInitialized();
    try {
      await StellarWalletsKit.disconnect();
    } catch {
      // Some wallet modules do not implement disconnect.
    }
    setState(initialState);
  };

  const shortAddress = wallet.address
    ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`
    : null;

  return {
    ...wallet,
    shortAddress,
    connect,
    disconnect,
  };
}
