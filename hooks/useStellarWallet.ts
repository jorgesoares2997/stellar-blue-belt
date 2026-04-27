"use client";

import { useCallback, useMemo, useState } from "react";
import {
  getAddress,
  getNetwork,
  isAllowed,
  isConnected,
  setAllowed,
} from "@stellar/freighter-api";

type WalletState = {
  address: string | null;
  network: string | null;
  connected: boolean;
  loading: boolean;
  error: string | null;
};

const initialState: WalletState = {
  address: null,
  network: null,
  connected: false,
  loading: false,
  error: null,
};

export function useStellarWallet() {
  const [state, setState] = useState<WalletState>(initialState);

  const connect = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const allowedResult = await isAllowed();
      if (allowedResult.error) {
        throw new Error(allowedResult.error);
      }
      if (!allowedResult.isAllowed) {
        const permission = await setAllowed();
        if (permission.error) {
          throw new Error(permission.error);
        }
      }

      const connectedResult = await isConnected();
      if (connectedResult.error) {
        throw new Error(connectedResult.error);
      }
      if (!connectedResult.isConnected) {
        throw new Error("Freighter is not connected to this site.");
      }

      const addressResult = await getAddress();
      if (addressResult.error || !addressResult.address) {
        throw new Error(addressResult.error ?? "Could not get wallet address.");
      }

      const networkResult = await getNetwork();
      if (networkResult.error) {
        throw new Error(networkResult.error);
      }

      setState({
        address: addressResult.address,
        network: networkResult.network ?? null,
        connected: true,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        connected: false,
        error: error instanceof Error ? error.message : "Wallet connection failed.",
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setState(initialState);
  }, []);

  const shortAddress = useMemo(() => {
    if (!state.address) return null;
    return `${state.address.slice(0, 6)}...${state.address.slice(-4)}`;
  }, [state.address]);

  return {
    ...state,
    shortAddress,
    connect,
    disconnect,
  };
}
