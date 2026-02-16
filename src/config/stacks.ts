// Stacks Blockchain Configuration - TESTNET
import { STACKS_TESTNET } from '@stacks/network';

// Use Testnet for development (dummy coins, not real money)
export const NETWORK = STACKS_TESTNET;

// Stacks Testnet API (FREE - no API key needed)
export const STACKS_API_BASE = 'https://api.testnet.hiro.so';

// App metadata for wallet connection
export const APP_CONFIG = {
  appName: 'InstaDrop 402',
  appIconUrl: '/favicon.ico',
};

// API base URL
// Use Serveo URL directly for hackathon demo stability
export const API_BASE = 'https://7103ea96cc5388b2-103-178-194-178.serveousercontent.com/api';

// 1 STX = 1,000,000 microSTX
export const STX_DECIMALS = 1_000_000;

// Convert STX to microSTX
export function stxToMicroStx(stx: number): number {
  return Math.floor(stx * STX_DECIMALS);
}

// Convert microSTX to STX
export function microStxToStx(microStx: number): number {
  return microStx / STX_DECIMALS;
}

// Approximate USD rate for display (testnet, not real)
export const STX_TO_USD_RATE = 0.45;

export function stxToUsd(stx: number): string {
  return (stx * STX_TO_USD_RATE).toFixed(2);
}

// Fetch real STX balance from blockchain (FREE API)
export async function fetchSTXBalance(address: string): Promise<number> {
  try {
    const res = await fetch(`${STACKS_API_BASE}/extended/v1/address/${address}/balances`);
    if (!res.ok) return 0;
    const json = await res.json();
    const microStx = parseInt(json.stx?.balance || '0', 10);
    return microStxToStx(microStx);
  } catch {
    return 0;
  }
}

// Verify a transaction exists on blockchain (FREE API)
export async function verifyTransaction(txId: string): Promise<{
  valid: boolean;
  status: string;
  sender?: string;
  recipient?: string;
  amount?: number;
}> {
  try {
    const res = await fetch(`${STACKS_API_BASE}/extended/v1/tx/${txId}`);
    if (!res.ok) return { valid: false, status: 'not_found' };
    const tx = await res.json();

    const isSTXTransfer = tx.tx_type === 'token_transfer';
    const txStatus = tx.tx_status; // 'success', 'pending', 'abort_by_response', etc.

    return {
      valid: isSTXTransfer && (txStatus === 'success' || txStatus === 'pending'),
      status: txStatus,
      sender: tx.sender_address,
      recipient: isSTXTransfer ? tx.token_transfer?.recipient_address : undefined,
      amount: isSTXTransfer ? microStxToStx(parseInt(tx.token_transfer?.amount || '0', 10)) : undefined,
    };
  } catch {
    return { valid: false, status: 'error' };
  }
}
