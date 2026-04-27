"use client";

import type { Networks } from "@creit.tech/stellar-wallets-kit/types";

let initialized = false;
type WalletKitStatic = {
  init: (params: { modules: unknown[]; network?: Networks }) => void;
  authModal: () => Promise<{ address: string }>;
  getAddress: () => Promise<{ address: string }>;
  getNetwork: () => Promise<{ networkPassphrase: string; network: string }>;
  signTransaction: (
    xdr: string,
    opts?: { networkPassphrase?: string; address?: string },
  ) => Promise<{ signedTxXdr: string; signerAddress?: string }>;
  disconnect: () => Promise<void>;
  selectedModule?: { productName?: string };
};
let kitRef: WalletKitStatic | null = null;

function getNetworkPassphrase() {
  return (
    process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE ??
    "Test SDF Network ; September 2015"
  );
}

function toKitNetwork(passphrase: string): Networks {
  return passphrase as Networks;
}

export async function ensureWalletKitInitialized(): Promise<WalletKitStatic> {
  if (typeof window === "undefined") {
    throw new Error("Wallet Kit can only run in the browser.");
  }
  if (initialized && kitRef) return kitRef;

  const [{ StellarWalletsKit }, { defaultModules }] = await Promise.all([
    import("@creit.tech/stellar-wallets-kit"),
    import("@creit.tech/stellar-wallets-kit/modules/utils"),
  ]);

  StellarWalletsKit.init({
    modules: defaultModules(),
    network: toKitNetwork(getNetworkPassphrase()),
  });

  kitRef = StellarWalletsKit as unknown as WalletKitStatic;
  initialized = true;
  return kitRef!;
}

export function walletKitNetworkPassphrase() {
  return getNetworkPassphrase();
}
