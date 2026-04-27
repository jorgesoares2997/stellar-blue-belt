"use client";

import {
  Address,
  BASE_FEE,
  Contract,
  Networks,
  TransactionBuilder,
  nativeToScVal,
  rpc,
  xdr,
} from "@stellar/stellar-sdk";
import { getAddress, signTransaction } from "@stellar/freighter-api";

type ContractCallParams = {
  contractId: string;
  method: string;
  args?: xdr.ScVal[];
};

export const TESTNET_PASSPHRASE = Networks.TESTNET;
export const RPC_URL =
  process.env.NEXT_PUBLIC_STELLAR_RPC_URL ?? "https://soroban-testnet.stellar.org";

export const GOVERNANCE_CONTRACT_ID =
  process.env.NEXT_PUBLIC_GOVERNANCE_CONTRACT_ID ?? "";
export const TREASURY_CONTRACT_ID =
  process.env.NEXT_PUBLIC_TREASURY_CONTRACT_ID ?? "";
export const NFT_CONTRACT_ID = process.env.NEXT_PUBLIC_NFT_CONTRACT_ID ?? "";

const server = new rpc.Server(RPC_URL, {
  allowHttp: RPC_URL.startsWith("http://"),
});

function getNetworkPassphrase() {
  return process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE ?? TESTNET_PASSPHRASE;
}

export async function invokeContract({
  contractId,
  method,
  args = [],
}: ContractCallParams) {
  if (!contractId) {
    throw new Error(
      "Contract ID is missing. Please set NEXT_PUBLIC_*_CONTRACT_ID env vars.",
    );
  }

  const walletAddress = await getConnectedAddress();

  const sourceAccount = await server.getAccount(walletAddress);
  const contract = new Contract(contractId);
  const networkPassphrase = getNetworkPassphrase();

  const tx = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const preparedTx = await server.prepareTransaction(tx);
  const signed = await signTransaction(preparedTx.toXDR(), {
    address: walletAddress,
    networkPassphrase,
  });

  if (signed.error || !signed.signedTxXdr) {
    throw new Error(signed.error ?? "Freighter could not sign the transaction.");
  }

  const signedTx = TransactionBuilder.fromXDR(signed.signedTxXdr, networkPassphrase);
  const sendResponse = await server.sendTransaction(signedTx);

  if (sendResponse.errorResult) {
    throw new Error("Transaction rejected by network.");
  }

  if (sendResponse.status === "PENDING") {
    const txStatus = await server.pollTransaction(sendResponse.hash, {
      attempts: 30,
    });
    return txStatus;
  }

  return sendResponse;
}

export async function getConnectedAddress() {
  const addressResult = await getAddress();
  if (addressResult.error || !addressResult.address) {
    throw new Error(
      addressResult.error ?? "Could not resolve Freighter wallet address.",
    );
  }
  return addressResult.address;
}

export const scVal = {
  string: (value: string) => nativeToScVal(value),
  i128: (value: bigint) => nativeToScVal(value, { type: "i128" }),
  u32: (value: number) => xdr.ScVal.scvU32(value),
  address: (value: string) => new Address(value).toScVal(),
};
