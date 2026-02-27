import { useCallback } from 'react';
import { useWeb3 } from '../context/Web3Context';

/**
 * Hook for manipulating blockchain time on local Hardhat node.
 * Used for demo purposes to fast-forward time and trigger deadlines.
 */
export function useDevTime() {
  const { provider } = useWeb3();

  const fastForward = useCallback(async (seconds: number) => {
    if (!provider) throw new Error('No provider');
    // Use the underlying transport to send raw JSON-RPC
    await provider.send('evm_increaseTime', [seconds]);
    await provider.send('evm_mine', []);
  }, [provider]);

  const fastForwardDays = useCallback(async (days: number) => {
    await fastForward(days * 24 * 60 * 60);
  }, [fastForward]);

  const fastForwardWeeks = useCallback(async (weeks: number) => {
    await fastForward(weeks * 7 * 24 * 60 * 60);
  }, [fastForward]);

  const getCurrentTimestamp = useCallback(async (): Promise<number> => {
    if (!provider) throw new Error('No provider');
    const block = await provider.getBlock('latest');
    return block?.timestamp ?? 0;
  }, [provider]);

  const mineBlock = useCallback(async () => {
    if (!provider) throw new Error('No provider');
    await provider.send('evm_mine', []);
  }, [provider]);

  return {
    fastForward,
    fastForwardDays,
    fastForwardWeeks,
    getCurrentTimestamp,
    mineBlock,
  };
}
