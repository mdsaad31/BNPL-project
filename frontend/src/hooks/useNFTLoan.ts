import { useState, useCallback, useEffect } from 'react';
import { Contract, formatEther, type Signer } from 'ethers';
import { useWeb3, getReadOnlyProvider } from '../context/Web3Context';
import { CONTRACTS } from '../contracts';

// ─── Types ──────────────────────────────────────────────
export const NFTLoanStatus = {
  ACTIVE: 0,
  REPAID: 1,
  DEFAULTED: 2,
  LIQUIDATED: 3,
} as const;

export type NFTLoanStatus = (typeof NFTLoanStatus)[keyof typeof NFTLoanStatus];

export interface NFTLoan {
  id: number;
  borrower: string;
  nftContract: string;
  tokenId: number;
  loanAmount: bigint;
  loanAmountFormatted: string;
  interestAmount: bigint;
  interestAmountFormatted: string;
  totalDue: bigint;
  totalDueFormatted: string;
  totalRepaid: bigint;
  totalRepaidFormatted: string;
  dueTimestamp: number;
  createdAt: number;
  status: NFTLoanStatus;
}

export interface CollectionInfo {
  address: string;
  approved: boolean;
  floorPrice: bigint;
  floorPriceFormatted: string;
  maxLoan: bigint;
  maxLoanFormatted: string;
}

export interface OwnedNFT {
  contractAddress: string;
  tokenId: number;
}

// ─── Contract Getters ───────────────────────────────────
function getNFTLoanContract(signerOrProvider: Signer | ReturnType<typeof getReadOnlyProvider>) {
  return new Contract(CONTRACTS.NFTCollateralLoan.address, CONTRACTS.NFTCollateralLoan.abi, signerOrProvider);
}

function getMockNFTContract(signerOrProvider: Signer | ReturnType<typeof getReadOnlyProvider>) {
  return new Contract(CONTRACTS.MockNFT.address, CONTRACTS.MockNFT.abi, signerOrProvider);
}

// ─── Mappers ────────────────────────────────────────────
function mapNFTLoan(raw: unknown[]): NFTLoan {
  return {
    id: Number(raw[0]),
    borrower: raw[1] as string,
    nftContract: raw[2] as string,
    tokenId: Number(raw[3]),
    loanAmount: raw[4] as bigint,
    loanAmountFormatted: formatEther(raw[4] as bigint),
    interestAmount: raw[5] as bigint,
    interestAmountFormatted: formatEther(raw[5] as bigint),
    totalDue: raw[6] as bigint,
    totalDueFormatted: formatEther(raw[6] as bigint),
    totalRepaid: raw[7] as bigint,
    totalRepaidFormatted: formatEther(raw[7] as bigint),
    dueTimestamp: Number(raw[8]),
    createdAt: Number(raw[9]),
    status: Number(raw[10]) as NFTLoanStatus,
  };
}

// ─── Hook ───────────────────────────────────────────────
export function useNFTLoan() {
  const { signer, address } = useWeb3();
  const [loans, setLoans] = useState<NFTLoan[]>([]);
  const [ownedNFTs, setOwnedNFTs] = useState<OwnedNFT[]>([]);
  const [collectionInfo, setCollectionInfo] = useState<CollectionInfo | null>(null);
  const [treasuryBalance, setTreasuryBalance] = useState<string>('0');
  const [loading, setLoading] = useState(false);
  const [txPending, setTxPending] = useState(false);

  // ─── Read: Fetch Borrower Loans ───────────────────────
  const fetchBorrowerLoans = useCallback(async () => {
    if (!address) { setLoans([]); return; }
    try {
      const provider = getReadOnlyProvider();
      const contract = getNFTLoanContract(provider);
      const loanIds: bigint[] = await contract.getBorrowerLoans(address);
      const loanData = await Promise.all(
        loanIds.map(async (id) => {
          const raw = await contract.getLoan(Number(id));
          return mapNFTLoan(raw);
        })
      );
      setLoans(loanData);
    } catch (err) {
      console.error('Failed to fetch NFT loans:', err);
    }
  }, [address]);

  // ─── Read: Fetch Owned MockNFTs ───────────────────────
  const fetchOwnedNFTs = useCallback(async () => {
    if (!address) { setOwnedNFTs([]); return; }
    try {
      const provider = getReadOnlyProvider();
      const nft = getMockNFTContract(provider);
      const nextId = Number(await nft.nextTokenId());
      const owned: OwnedNFT[] = [];
      for (let i = 0; i < nextId; i++) {
        try {
          const owner = await nft.ownerOf(i);
          if (owner.toLowerCase() === address.toLowerCase()) {
            owned.push({ contractAddress: CONTRACTS.MockNFT.address, tokenId: i });
          }
        } catch {
          // token may not exist or was burned
        }
      }
      setOwnedNFTs(owned);
    } catch (err) {
      console.error('Failed to fetch owned NFTs:', err);
    }
  }, [address]);

  // ─── Read: Fetch Collection Info ──────────────────────
  const fetchCollectionInfo = useCallback(async () => {
    try {
      const provider = getReadOnlyProvider();
      const contract = getNFTLoanContract(provider);
      const [approved, floorPrice, maxLoan] = await contract.getCollectionInfo(CONTRACTS.MockNFT.address);
      setCollectionInfo({
        address: CONTRACTS.MockNFT.address,
        approved: approved as boolean,
        floorPrice: floorPrice as bigint,
        floorPriceFormatted: formatEther(floorPrice as bigint),
        maxLoan: maxLoan as bigint,
        maxLoanFormatted: formatEther(maxLoan as bigint),
      });
    } catch (err) {
      console.error('Failed to fetch collection info:', err);
    }
  }, []);

  // ─── Read: Fetch Treasury Balance ─────────────────────
  const fetchTreasuryBalance = useCallback(async () => {
    try {
      const provider = getReadOnlyProvider();
      const contract = getNFTLoanContract(provider);
      const bal = await contract.getTreasuryBalance();
      setTreasuryBalance(formatEther(bal));
    } catch (err) {
      console.error('Failed to fetch treasury balance:', err);
    }
  }, []);

  // ─── Write: Mint Demo NFT ────────────────────────────
  const mintDemoNFT = useCallback(async () => {
    if (!signer) throw new Error('Wallet not connected');
    setTxPending(true);
    try {
      const nft = getMockNFTContract(signer);
      const tx = await nft.mint();
      await tx.wait();
      await fetchOwnedNFTs();
    } finally {
      setTxPending(false);
    }
  }, [signer, fetchOwnedNFTs]);

  // ─── Write: Take Loan ────────────────────────────────
  const takeLoan = useCallback(async (nftContract: string, tokenId: number) => {
    if (!signer) throw new Error('Wallet not connected');
    setTxPending(true);
    try {
      // First approve the NFTCollateralLoan contract to take the NFT
      const nft = new Contract(nftContract, CONTRACTS.MockNFT.abi, signer);
      const approveTx = await nft.approve(CONTRACTS.NFTCollateralLoan.address, tokenId);
      await approveTx.wait();

      // Then take the loan
      const contract = getNFTLoanContract(signer);
      const tx = await contract.takeLoan(nftContract, tokenId);
      await tx.wait();

      await Promise.all([fetchBorrowerLoans(), fetchOwnedNFTs(), fetchTreasuryBalance()]);
    } finally {
      setTxPending(false);
    }
  }, [signer, fetchBorrowerLoans, fetchOwnedNFTs, fetchTreasuryBalance]);

  // ─── Write: Repay Loan ───────────────────────────────
  const repayLoan = useCallback(async (loanId: number, amount: bigint) => {
    if (!signer) throw new Error('Wallet not connected');
    setTxPending(true);
    try {
      const contract = getNFTLoanContract(signer);
      const tx = await contract.repayLoan(loanId, { value: amount });
      await tx.wait();
      await Promise.all([fetchBorrowerLoans(), fetchOwnedNFTs(), fetchTreasuryBalance()]);
    } finally {
      setTxPending(false);
    }
  }, [signer, fetchBorrowerLoans, fetchOwnedNFTs, fetchTreasuryBalance]);

  // ─── Write: Liquidate Loan ───────────────────────────
  const liquidateLoan = useCallback(async (loanId: number) => {
    if (!signer) throw new Error('Wallet not connected');
    setTxPending(true);
    try {
      const contract = getNFTLoanContract(signer);
      const tx = await contract.liquidateLoan(loanId);
      await tx.wait();
      await fetchBorrowerLoans();
    } finally {
      setTxPending(false);
    }
  }, [signer, fetchBorrowerLoans]);

  // ─── Auto-fetch on address change ─────────────────────
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchBorrowerLoans(),
      fetchOwnedNFTs(),
      fetchCollectionInfo(),
      fetchTreasuryBalance(),
    ]).finally(() => setLoading(false));
  }, [address, fetchBorrowerLoans, fetchOwnedNFTs, fetchCollectionInfo, fetchTreasuryBalance]);

  return {
    // State
    loans,
    ownedNFTs,
    collectionInfo,
    treasuryBalance,
    loading,
    txPending,
    // Actions
    fetchBorrowerLoans,
    fetchOwnedNFTs,
    mintDemoNFT,
    takeLoan,
    repayLoan,
    liquidateLoan,
  };
}
