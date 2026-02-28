import { useState, useCallback, useEffect } from 'react';
import { Contract, formatEther, parseEther, type Signer } from 'ethers';
import { useWeb3, getReadOnlyProvider } from '../context/Web3Context';
import { CONTRACTS, COLLATERAL_RATIO } from '../contracts';

// ─── Types ──────────────────────────────────────────────
export interface Product {
  id: number;
  name: string;
  description: string;
  imageUri: string;
  price: bigint;
  priceFormatted: string;
  merchant: string;
  active: boolean;
}

export const LoanStatus = {
  ACTIVE: 0,
  REPAID: 1,
  DEFAULTED: 2,
} as const;

export type LoanStatus = (typeof LoanStatus)[keyof typeof LoanStatus];

export interface Loan {
  id: number;
  buyer: string;
  merchant: string;
  productId: number;
  productPrice: bigint;
  productPriceFormatted: string;
  totalRepaid: bigint;
  installmentAmount: bigint;
  installmentAmountFormatted: string;
  installmentsPaid: number;
  nextDueTimestamp: number;
  createdAt: number;
  status: LoanStatus;
  collateralLocked: boolean;
}

// ─── Contract Getters ───────────────────────────────────
function getBNPLContract(signerOrProvider: Signer | ReturnType<typeof getReadOnlyProvider>) {
  return new Contract(CONTRACTS.BNPLLoan.address, CONTRACTS.BNPLLoan.abi, signerOrProvider);
}

function getVaultContract(signerOrProvider: Signer | ReturnType<typeof getReadOnlyProvider>) {
  return new Contract(CONTRACTS.CollateralVault.address, CONTRACTS.CollateralVault.abi, signerOrProvider);
}

function mapProduct(raw: Record<string, unknown>): Product {
  return {
    id: Number(raw.id),
    name: raw.name as string,
    description: raw.description as string,
    imageUri: raw.imageUri as string,
    price: raw.price as bigint,
    priceFormatted: formatEther(raw.price as bigint),
    merchant: raw.merchant as string,
    active: raw.active as boolean,
  };
}

function mapLoan(raw: Record<string, unknown>): Loan {
  return {
    id: Number(raw.id),
    buyer: raw.buyer as string,
    merchant: raw.merchant as string,
    productId: Number(raw.productId),
    productPrice: raw.productPrice as bigint,
    productPriceFormatted: formatEther(raw.productPrice as bigint),
    totalRepaid: raw.totalRepaid as bigint,
    installmentAmount: raw.installmentAmount as bigint,
    installmentAmountFormatted: formatEther(raw.installmentAmount as bigint),
    installmentsPaid: Number(raw.installmentsPaid),
    nextDueTimestamp: Number(raw.nextDueTimestamp),
    createdAt: Number(raw.createdAt),
    status: Number(raw.status) as LoanStatus,
    collateralLocked: false, // set after vault query
  };
}

// ─── Hook: useNexaPay ────────────────────────────────────
export function useNexaPay() {
  const { signer, address } = useWeb3();
  const [products, setProducts] = useState<Product[]>([]);
  const [buyerLoans, setBuyerLoans] = useState<Loan[]>([]);
  const [merchantLoans, setMerchantLoans] = useState<Loan[]>([]);
  const [isMerchant, setIsMerchant] = useState(false);
  const [merchantName, setMerchantName] = useState('');
  const [loading, setLoading] = useState(false);
  const [txPending, setTxPending] = useState(false);
  const [treasuryBalance, setTreasuryBalance] = useState<string>('0');

  // ─── Read Treasury Balance ────────────────────────────
  const fetchTreasuryBalance = useCallback(async () => {
    try {
      const provider = getReadOnlyProvider();
      const contract = getBNPLContract(provider);
      const bal = await contract.treasuryBalance();
      setTreasuryBalance(formatEther(bal));
    } catch (err) {
      console.error('Failed to fetch BNPL treasury balance:', err);
    }
  }, []);

  // ─── Read Products ────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    try {
      const provider = getReadOnlyProvider();
      const contract = getBNPLContract(provider);
      const rawProducts = await contract.getAllProducts();
      setProducts(rawProducts.map((p: Record<string, unknown>) => mapProduct(p)));
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  }, []);

  // ─── Read Buyer Loans ─────────────────────────────────
  const fetchBuyerLoans = useCallback(async () => {
    if (!address) return;
    try {
      const provider = getReadOnlyProvider();
      const contract = getBNPLContract(provider);
      const loanIds: bigint[] = await contract.getBuyerLoans(address);
      const loans = await Promise.all(
        loanIds.map(async (id) => {
          const raw = await contract.getLoan(id);
          const loan = mapLoan(raw);
          // Check if collateral is still locked in vault
          try {
            const vault = getVaultContract(provider);
            const [, , locked] = await vault.getCollateral(address, id);
            loan.collateralLocked = locked as boolean;
          } catch { loan.collateralLocked = false; }
          return loan;
        })
      );
      setBuyerLoans(loans);
    } catch (err) {
      console.error('Failed to fetch buyer loans:', err);
    }
  }, [address]);

  // ─── Read Merchant Loans ──────────────────────────────
  const fetchMerchantLoans = useCallback(async () => {
    if (!address) return;
    try {
      const provider = getReadOnlyProvider();
      const contract = getBNPLContract(provider);
      const loanIds: bigint[] = await contract.getMerchantLoans(address);
      const loans = await Promise.all(
        loanIds.map(async (id) => {
          const raw = await contract.getLoan(id);
          return mapLoan(raw);
        })
      );
      setMerchantLoans(loans);
    } catch (err) {
      console.error('Failed to fetch merchant loans:', err);
    }
  }, [address]);

  // ─── Check Merchant Status ────────────────────────────
  const checkMerchantStatus = useCallback(async () => {
    if (!address) return;
    try {
      const provider = getReadOnlyProvider();
      const contract = getBNPLContract(provider);
      const registered = await contract.registeredMerchants(address);
      setIsMerchant(registered);
      if (registered) {
        const name = await contract.merchantNames(address);
        setMerchantName(name);
      }
    } catch (err) {
      console.error('Failed to check merchant status:', err);
    }
  }, [address]);

  // ─── Write: Register Merchant ─────────────────────────
  const registerMerchant = useCallback(async (name: string) => {
    if (!signer) throw new Error('Wallet not connected');
    setTxPending(true);
    try {
      const contract = getBNPLContract(signer);
      const tx = await contract.registerMerchant(name);
      await tx.wait();
      setIsMerchant(true);
      setMerchantName(name);
    } finally {
      setTxPending(false);
    }
  }, [signer]);

  // ─── Write: Create Product ────────────────────────────
  const createProduct = useCallback(async (
    name: string,
    description: string,
    imageUri: string,
    priceInBNB: string
  ) => {
    if (!signer) throw new Error('Wallet not connected');
    setTxPending(true);
    try {
      const contract = getBNPLContract(signer);
      const tx = await contract.createProduct(name, description, imageUri, parseEther(priceInBNB));
      await tx.wait();
      await fetchProducts();
    } finally {
      setTxPending(false);
    }
  }, [signer, fetchProducts]);

  // ─── Write: Toggle Product Active/Inactive ────────────
  const toggleProduct = useCallback(async (productId: number) => {
    if (!signer) throw new Error('Wallet not connected');
    setTxPending(true);
    try {
      const contract = getBNPLContract(signer);
      const tx = await contract.toggleProduct(productId);
      await tx.wait();
      await fetchProducts();
    } finally {
      setTxPending(false);
    }
  }, [signer, fetchProducts]);

  // ─── Write: Purchase Product ──────────────────────────
  const purchaseProduct = useCallback(async (productId: number, productPrice: bigint) => {
    if (!signer) throw new Error('Wallet not connected');
    setTxPending(true);
    try {
      const collateral = (productPrice * BigInt(COLLATERAL_RATIO)) / 100n;
      const contract = getBNPLContract(signer);
      const tx = await contract.purchaseProduct(productId, { value: collateral });
      await tx.wait();
      await fetchBuyerLoans();
    } finally {
      setTxPending(false);
    }
  }, [signer, fetchBuyerLoans]);

  // ─── Write: Pay Installment ───────────────────────────
  const payInstallment = useCallback(async (loanId: number, installmentAmount: bigint) => {
    if (!signer) throw new Error('Wallet not connected');
    setTxPending(true);
    try {
      const contract = getBNPLContract(signer);
      const tx = await contract.payInstallment(loanId, { value: installmentAmount });
      await tx.wait();
      await fetchBuyerLoans();
    } finally {
      setTxPending(false);
    }
  }, [signer, fetchBuyerLoans]);

  // ─── Write: Trigger Default ───────────────────────────
  const triggerDefault = useCallback(async (loanId: number) => {
    if (!signer) throw new Error('Wallet not connected');
    setTxPending(true);
    try {
      const contract = getBNPLContract(signer);
      const tx = await contract.triggerDefault(loanId);
      await tx.wait();
      await fetchBuyerLoans();
    } finally {
      setTxPending(false);
    }
  }, [signer, fetchBuyerLoans]);

  // ─── Write: Claim Collateral ──────────────────────────
  const claimCollateral = useCallback(async (loanId: number) => {
    if (!signer) throw new Error('Wallet not connected');
    setTxPending(true);
    try {
      const contract = getBNPLContract(signer);
      const tx = await contract.claimCollateral(loanId);
      await tx.wait();
      await fetchBuyerLoans();
    } finally {
      setTxPending(false);
    }
  }, [signer, fetchBuyerLoans]);

  // ─── Get Collateral Info ──────────────────────────────
  const getCollateralInfo = useCallback(async (buyerAddr: string, loanId: number) => {
    const provider = getReadOnlyProvider();
    const vault = getVaultContract(provider);
    const [amount, productPrice, locked] = await vault.getCollateral(buyerAddr, loanId);
    return {
      amount: amount as bigint,
      amountFormatted: formatEther(amount),
      productPrice: productPrice as bigint,
      locked: locked as boolean,
    };
  }, []);

  // ─── Auto-fetch on address change ─────────────────────
  useEffect(() => {
    setLoading(true);
    Promise.all([fetchProducts(), checkMerchantStatus(), fetchBuyerLoans(), fetchMerchantLoans(), fetchTreasuryBalance()])
      .finally(() => setLoading(false));
  }, [address, fetchProducts, checkMerchantStatus, fetchBuyerLoans, fetchMerchantLoans, fetchTreasuryBalance]);

  return {
    // State
    products,
    buyerLoans,
    merchantLoans,
    isMerchant,
    merchantName,
    loading,
    txPending,
    treasuryBalance,
    // Actions
    fetchProducts,
    fetchBuyerLoans,
    fetchMerchantLoans,
    registerMerchant,
    createProduct,
    toggleProduct,
    purchaseProduct,
    payInstallment,
    triggerDefault,
    claimCollateral,
    getCollateralInfo,
  };
}
