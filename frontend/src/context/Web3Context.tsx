import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { BrowserProvider, JsonRpcProvider, type Signer } from 'ethers';

interface Web3State {
  provider: BrowserProvider | null;
  signer: Signer | null;
  address: string | null;
  chainId: number | null;
  isConnecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const Web3Context = createContext<Web3State>({
  provider: null,
  signer: null,
  address: null,
  chainId: null,
  isConnecting: false,
  error: null,
  connect: async () => {},
  disconnect: () => {},
});

export const useWeb3 = () => useContext(Web3Context);

// Read-only provider for when no wallet is connected
// Uses BSC Testnet RPC for production, localhost for development
const BSC_TESTNET_RPC = 'https://data-seed-prebsc-1-s1.binance.org:8545';
// const LOCAL_RPC = 'http://127.0.0.1:8545';

export const getReadOnlyProvider = () => {
  // Use BSC testnet in production, localhost in dev
  const rpc = import.meta.env.PROD ? BSC_TESTNET_RPC : (import.meta.env.VITE_RPC_URL || BSC_TESTNET_RPC);
  return new JsonRpcProvider(rpc);
};

export const Web3Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<Signer | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') {
      setError('MetaMask is not installed. Please install MetaMask to continue.');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const browserProvider = new BrowserProvider(window.ethereum);

      // Try to switch to BSC Testnet (chainId 97)
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x61' }], // 97 in hex
        });
      } catch (switchError: unknown) {
        // If BSC Testnet is not added, add it
        const err = switchError as { code?: number };
        if (err.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x61',
              chainName: 'BNB Smart Chain Testnet',
              nativeCurrency: { name: 'tBNB', symbol: 'tBNB', decimals: 18 },
              rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
              blockExplorerUrls: ['https://testnet.bscscan.com'],
            }],
          });
        }
      }

      await browserProvider.send('eth_requestAccounts', []);
      const signer = await browserProvider.getSigner();
      const address = await signer.getAddress();
      const network = await browserProvider.getNetwork();

      setProvider(browserProvider);
      setSigner(signer);
      setAddress(address);
      setChainId(Number(network.chainId));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(message);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setAddress(null);
    setChainId(null);
    setError(null);
  }, []);

  // Listen for account/chain changes
  useEffect(() => {
    if (typeof window.ethereum === 'undefined') return;

    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = args[0] as string[];
      if (accounts.length === 0) {
        disconnect();
      } else {
        setAddress(accounts[0]);
        // Refresh signer
        if (provider) {
          provider.getSigner().then(setSigner);
        }
      }
    };

    const handleChainChanged = (...args: unknown[]) => {
      const _chainId = args[0] as string;
      setChainId(parseInt(_chainId, 16));
      // Reconnect on chain change
      connect();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, [provider, connect, disconnect]);

  return (
    <Web3Context.Provider
      value={{ provider, signer, address, chainId, isConnecting, error, connect, disconnect }}
    >
      {children}
    </Web3Context.Provider>
  );
};
