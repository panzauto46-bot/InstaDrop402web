import { useState, useEffect, useCallback } from 'react';
import { connect as stacksConnect, disconnect as stacksDisconnect } from '@stacks/connect';

export interface WalletState {
  connected: boolean;
  address: string | null;
  loading: boolean;
}

const STORAGE_KEY = 'instadrop_wallet';

function getStoredWallet(): WalletState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.address) {
        return { connected: true, address: parsed.address, loading: false };
      }
    }
  } catch {
    // ignore
  }
  return { connected: false, address: null, loading: false };
}

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>(() => ({
    ...getStoredWallet(),
    loading: false,
  }));

  // Persist wallet state
  useEffect(() => {
    if (wallet.connected && wallet.address) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ address: wallet.address }));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [wallet.connected, wallet.address]);

  // Check for existing session on mount
  useEffect(() => {
    const stored = getStoredWallet();
    if (stored.connected && stored.address) {
      setWallet({ connected: true, address: stored.address, loading: false });
    }
  }, []);

  const connectWallet = useCallback(async () => {
    setWallet((prev) => ({ ...prev, loading: true }));

    try {
      const result = await stacksConnect({
        forceWalletSelect: true,
      });

      // Get the testnet address from the result
      if (result && result.addresses && result.addresses.length > 0) {
        // Find testnet address (starts with ST) or fallback to first address
        const testnetAddr = result.addresses.find(
          (a: { address: string }) => a.address.startsWith('ST')
        );
        const address = testnetAddr
          ? testnetAddr.address
          : result.addresses[0].address;

        setWallet({ connected: true, address, loading: false });
      } else {
        setWallet((prev) => ({ ...prev, loading: false }));
      }
    } catch {
      setWallet((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    stacksDisconnect();
    localStorage.removeItem(STORAGE_KEY);
    setWallet({ connected: false, address: null, loading: false });
  }, []);

  return {
    wallet,
    connect: connectWallet,
    disconnect: disconnectWallet,
  };
}
