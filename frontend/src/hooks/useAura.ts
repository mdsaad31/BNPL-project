import { useState, useCallback, useEffect } from 'react';
import { Contract, formatEther } from 'ethers';
import { useWeb3, getReadOnlyProvider } from '../context/Web3Context';
import { CONTRACTS } from '../contracts';
import { LoanStatus, type Loan } from './useNexaPay';
import { NFTLoanStatus, type NFTLoan } from './useNFTLoan';

// ─── Aura Tiers ─────────────────────────────────────────
export const AuraTier = {
  LEGENDARY: 'Legendary',
  STRONG: 'Strong',
  RISING: 'Rising',
  NEUTRAL: 'Neutral',
  WEAK: 'Weak',
  BROKEN: 'Broken',
  UNRANKED: 'Unranked',
} as const;
export type AuraTier = (typeof AuraTier)[keyof typeof AuraTier];

export interface AuraTierInfo {
  tier: AuraTier;
  label: string;
  iconId: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  minScore: number;
  description: string;
}

export const AURA_TIERS: AuraTierInfo[] = [
  { tier: AuraTier.LEGENDARY, label: 'Legendary Aura', iconId: 'star',     color: '#F59E0B', gradientFrom: '#F59E0B', gradientTo: '#D97706', minScore: 850, description: 'You are the gold standard of DeFi trustworthiness.' },
  { tier: AuraTier.STRONG,    label: 'Strong Aura',    iconId: 'heart',    color: '#8B5CF6', gradientFrom: '#8B5CF6', gradientTo: '#7C3AED', minScore: 700, description: 'Reliable borrower with an excellent track record.' },
  { tier: AuraTier.RISING,    label: 'Rising Aura',    iconId: 'trendup',  color: '#3B82F6', gradientFrom: '#3B82F6', gradientTo: '#2563EB', minScore: 550, description: 'Building a solid reputation on-chain.' },
  { tier: AuraTier.NEUTRAL,   label: 'Neutral Aura',   iconId: 'circle',   color: '#6B7280', gradientFrom: '#6B7280', gradientTo: '#4B5563', minScore: 400, description: 'Average history. Room to grow.' },
  { tier: AuraTier.WEAK,      label: 'Weak Aura',      iconId: 'triangle', color: '#F97316', gradientFrom: '#F97316', gradientTo: '#EA580C', minScore: 200, description: 'Concerning patterns detected. Improve your repayments.' },
  { tier: AuraTier.BROKEN,    label: 'Broken Aura',    iconId: 'zapoff',   color: '#EF4444', gradientFrom: '#EF4444', gradientTo: '#DC2626', minScore: 0,   description: 'Major trust issues. Defaults are killing your score.' },
];

export function getTierForScore(score: number): AuraTierInfo {
  for (const t of AURA_TIERS) {
    if (score >= t.minScore) return t;
  }
  return AURA_TIERS[AURA_TIERS.length - 1];
}

// ─── Factor Breakdown ───────────────────────────────────
export interface AuraFactor {
  name: string;
  description: string;
  score: number;
  maxScore: number;
  minScore: number;
  weight: string;
  icon: string;
}

export interface AuraResult {
  score: number;
  tier: AuraTierInfo;
  factors: AuraFactor[];
  metrics: AuraMetrics;
  loading: boolean;
}

export interface AuraMetrics {
  // BNPL
  totalBNPLLoans: number;
  activeBNPLLoans: number;
  repaidBNPLLoans: number;
  defaultedBNPLLoans: number;
  totalInstallmentsPaid: number;
  maxPossibleInstallments: number;
  totalBNPLVolume: bigint;
  onTimeBNPLLoans: number;
  lateBNPLLoans: number;
  collateralClaimed: number;
  collateralLocked: number;
  // NFT
  totalNFTLoans: number;
  activeNFTLoans: number;
  repaidNFTLoans: number;
  defaultedNFTLoans: number;
  totalNFTVolume: bigint;
  onTimeNFTLoans: number;
  lateNFTLoans: number;
  // General
  firstLoanTimestamp: number;
  hasHistory: boolean;
}

// ─── The Aura Algorithm ─────────────────────────────────
//
// BASE_SCORE = 500
//
// Factor 1: REPAYMENT RELIABILITY    (max +200, min -300)
//   Measures: What % of closed loans were successfully repaid
//   Penalty:  Each default carries a heavy –75 penalty
//
// Factor 2: PAYMENT DISCIPLINE       (max +150, min -100)
//   Measures: Installment completion rate across all BNPL loans
//   Also:     Are active loans current (not overdue)?
//
// Factor 3: BORROWING EXPERIENCE     (max +100, min  0)
//   Measures: How many loans the wallet has taken (log scale)
//   More history = more reliable signal
//
// Factor 4: PORTFOLIO DIVERSITY      (max +50,  min  0)
//   Measures: Has the wallet used both BNPL and NFT-backed loans?
//   Diversified usage shows DeFi maturity
//
// Factor 5: COLLATERAL BEHAVIOR      (max +50,  min -50)
//   Measures: Does the user claim collateral after repayment?
//   Full claims = responsible. Liquidations = bad.
//
// Factor 6: NFT LENDING TRACK RECORD (max +50,  min -50)
//   Measures: NFT loan repayment vs default ratio
//
// TOTAL RANGE: 500 + (-300..+200) + (-100..+150) + (0..+100) + (0..+50) + (-50..+50) + (-50..+50)
//            = 0 to 1100, clamped to [0, 1000]

const BASE_SCORE = 500;

function computeAuraScore(m: AuraMetrics): { score: number; factors: AuraFactor[] } {
  const factors: AuraFactor[] = [];

  // ── Factor 1: Repayment Reliability ────────────────────
  let f1 = 0;
  const closedBNPL = m.repaidBNPLLoans + m.defaultedBNPLLoans;
  const closedNFT = m.repaidNFTLoans + m.defaultedNFTLoans;
  const totalClosed = closedBNPL + closedNFT;
  const totalRepaid = m.repaidBNPLLoans + m.repaidNFTLoans;
  const totalDefaulted = m.defaultedBNPLLoans + m.defaultedNFTLoans;

  if (totalClosed > 0) {
    const repayRatio = totalRepaid / totalClosed;
    // Sigmoid-like scoring: rewards high ratios steeply
    if (repayRatio >= 1.0)      f1 = 200;
    else if (repayRatio >= 0.9) f1 = 170;
    else if (repayRatio >= 0.8) f1 = 130;
    else if (repayRatio >= 0.6) f1 = 60;
    else if (repayRatio >= 0.4) f1 = 0;
    else                        f1 = -100;
    // Each default is a heavy penalty on top
    f1 -= totalDefaulted * 75;
  }
  f1 = clamp(f1, -300, 200);
  factors.push({
    name: 'Repayment Reliability',
    description: `${totalRepaid}/${totalClosed} loans repaid, ${totalDefaulted} defaults`,
    score: f1, maxScore: 200, minScore: -300, weight: '40%',
    icon: 'shield',
  });

  // ── Factor 2: Payment Discipline ─────────────────────
  let f2 = 0;
  if (m.maxPossibleInstallments > 0) {
    const installmentRatio = m.totalInstallmentsPaid / m.maxPossibleInstallments;
    f2 = Math.round(installmentRatio * 200) - 50; // 100% → +150, 50% → +50, 25% → 0
  }
  // Active-but-late loans drag you down
  f2 -= m.lateBNPLLoans * 30;
  f2 -= m.lateNFTLoans * 25;
  // Currently on-time active loans give a small boost
  f2 += m.onTimeBNPLLoans * 10;
  f2 += m.onTimeNFTLoans * 8;
  f2 = clamp(f2, -100, 150);
  factors.push({
    name: 'Payment Discipline',
    description: `${m.totalInstallmentsPaid}/${m.maxPossibleInstallments} installments paid, ${m.lateBNPLLoans + m.lateNFTLoans} overdue`,
    score: f2, maxScore: 150, minScore: -100, weight: '25%',
    icon: 'clock',
  });

  // ── Factor 3: Borrowing Experience ───────────────────
  const totalLoans = m.totalBNPLLoans + m.totalNFTLoans;
  let f3 = 0;
  if (totalLoans >= 10)     f3 = 100;
  else if (totalLoans >= 7) f3 = 80;
  else if (totalLoans >= 5) f3 = 60;
  else if (totalLoans >= 3) f3 = 40;
  else if (totalLoans >= 2) f3 = 25;
  else if (totalLoans >= 1) f3 = 10;
  // Account age bonus (each 30 days of history = +5, max +20)
  if (m.firstLoanTimestamp > 0) {
    const ageInDays = (Date.now() / 1000 - m.firstLoanTimestamp) / 86400;
    f3 += Math.min(20, Math.floor(ageInDays / 30) * 5);
  }
  f3 = clamp(f3, 0, 100);
  factors.push({
    name: 'Borrowing Experience',
    description: `${totalLoans} total loans taken`,
    score: f3, maxScore: 100, minScore: 0, weight: '15%',
    icon: 'chart',
  });

  // ── Factor 4: Portfolio Diversity ────────────────────
  let f4 = 0;
  const hasBNPL = m.totalBNPLLoans > 0;
  const hasNFT = m.totalNFTLoans > 0;
  if (hasBNPL && hasNFT) f4 = 50;
  else if (hasBNPL || hasNFT) f4 = 20;
  factors.push({
    name: 'Portfolio Diversity',
    description: hasBNPL && hasNFT ? 'Both BNPL & NFT loans used' : hasBNPL ? 'BNPL only' : hasNFT ? 'NFT only' : 'No loans',
    score: f4, maxScore: 50, minScore: 0, weight: '8%',
    icon: 'target',
  });

  // ── Factor 5: Collateral Behavior ───────────────────
  let f5 = 0;
  const totalCollateralEvents = m.collateralClaimed + m.collateralLocked + m.defaultedBNPLLoans;
  if (totalCollateralEvents > 0) {
    const claimRatio = m.collateralClaimed / Math.max(1, m.repaidBNPLLoans);
    f5 = Math.round(claimRatio * 50);
    f5 -= m.defaultedBNPLLoans * 25; // Liquidated collateral is terrible
  }
  f5 = clamp(f5, -50, 50);
  factors.push({
    name: 'Collateral Behavior',
    description: `${m.collateralClaimed} claimed, ${m.collateralLocked} still locked`,
    score: f5, maxScore: 50, minScore: -50, weight: '6%',
    icon: 'lock',
  });

  // ── Factor 6: NFT Lending Track Record ──────────────
  let f6 = 0;
  if (m.totalNFTLoans > 0) {
    const nftClosed = m.repaidNFTLoans + m.defaultedNFTLoans;
    if (nftClosed > 0) {
      const nftRepayRatio = m.repaidNFTLoans / nftClosed;
      f6 = Math.round(nftRepayRatio * 80) - 30; // 100% → +50, 50% → +10, 0% → -30
    }
    f6 -= m.defaultedNFTLoans * 20;
  }
  f6 = clamp(f6, -50, 50);
  factors.push({
    name: 'NFT Lending Track Record',
    description: m.totalNFTLoans > 0 ? `${m.repaidNFTLoans}/${m.totalNFTLoans} NFT loans repaid` : 'No NFT lending history',
    score: f6, maxScore: 50, minScore: -50, weight: '6%',
    icon: 'diamond',
  });

  // ── Final Score ─────────────────────────────────────
  const rawScore = BASE_SCORE + f1 + f2 + f3 + f4 + f5 + f6;
  const score = clamp(rawScore, 0, 1000);

  return { score, factors };
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

// ─── Data Fetching ──────────────────────────────────────

function getBNPLContract(provider: ReturnType<typeof getReadOnlyProvider>) {
  return new Contract(CONTRACTS.BNPLLoan.address, CONTRACTS.BNPLLoan.abi, provider);
}
function getVaultContract(provider: ReturnType<typeof getReadOnlyProvider>) {
  return new Contract(CONTRACTS.CollateralVault.address, CONTRACTS.CollateralVault.abi, provider);
}
function getNFTLoanContract(provider: ReturnType<typeof getReadOnlyProvider>) {
  return new Contract(CONTRACTS.NFTCollateralLoan.address, CONTRACTS.NFTCollateralLoan.abi, provider);
}

function mapBNPLLoan(raw: Record<string, unknown>): Loan {
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
    status: Number(raw.status) as import('./useNexaPay').LoanStatus,
    collateralLocked: false,
  };
}

function mapNFTLoan(raw: Record<string, unknown>): NFTLoan {
  const loanAmount = raw.loanAmount as bigint;
  const interestAmount = raw.interestAmount as bigint;
  return {
    id: Number(raw.id),
    borrower: raw.borrower as string,
    nftContract: raw.nftContract as string,
    tokenId: Number(raw.tokenId),
    loanAmount,
    loanAmountFormatted: formatEther(loanAmount),
    interestAmount,
    interestAmountFormatted: formatEther(interestAmount),
    totalDue: loanAmount + interestAmount,
    totalDueFormatted: formatEther(loanAmount + interestAmount),
    totalRepaid: raw.totalRepaid as bigint,
    totalRepaidFormatted: formatEther(raw.totalRepaid as bigint),
    dueTimestamp: Number(raw.dueTimestamp),
    createdAt: Number(raw.createdAt),
    status: Number(raw.status) as import('./useNFTLoan').NFTLoanStatus,
  };
}

// ─── Hook ───────────────────────────────────────────────
export function useAura(targetAddress?: string): AuraResult {
  const { address: walletAddress } = useWeb3();
  const address = targetAddress || walletAddress;

  const [score, setScore] = useState(0);
  const [factors, setFactors] = useState<AuraFactor[]>([]);
  const [metrics, setMetrics] = useState<AuraMetrics>(emptyMetrics());
  const [loading, setLoading] = useState(false);

  const computeAura = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const provider = getReadOnlyProvider();
      const bnpl = getBNPLContract(provider);
      const vault = getVaultContract(provider);
      const nftLoanContract = getNFTLoanContract(provider);
      const now = Date.now() / 1000;

      // ── Fetch BNPL Loans ─────────────────────────────
      const bnplLoanIds: bigint[] = await bnpl.getBuyerLoans(address);
      const bnplLoans: Loan[] = await Promise.all(
        bnplLoanIds.map(async (id) => {
          const raw = await bnpl.getLoan(id);
          const loan = mapBNPLLoan(raw);
          try {
            const [, , locked] = await vault.getCollateral(address, id);
            loan.collateralLocked = locked as boolean;
          } catch { loan.collateralLocked = false; }
          return loan;
        })
      );

      // ── Fetch NFT Loans ──────────────────────────────
      let nftLoans: NFTLoan[] = [];
      try {
        const nftLoanIds: bigint[] = await nftLoanContract.getBorrowerLoans(address);
        nftLoans = await Promise.all(
          nftLoanIds.map(async (id) => {
            const raw = await nftLoanContract.getLoan(id);
            return mapNFTLoan(raw);
          })
        );
      } catch {
        // Contract may not have getBorrowerLoans — gracefully skip
      }

      // ── Compute Metrics ──────────────────────────────
      const m: AuraMetrics = emptyMetrics();

      // BNPL metrics
      m.totalBNPLLoans = bnplLoans.length;
      m.activeBNPLLoans = bnplLoans.filter(l => l.status === LoanStatus.ACTIVE).length;
      m.repaidBNPLLoans = bnplLoans.filter(l => l.status === LoanStatus.REPAID).length;
      m.defaultedBNPLLoans = bnplLoans.filter(l => l.status === LoanStatus.DEFAULTED).length;

      let totalInstallments = 0;
      let maxInstallments = 0;
      let bnplVolume = 0n;
      let firstTimestamp = Infinity;

      for (const loan of bnplLoans) {
        totalInstallments += loan.installmentsPaid;
        maxInstallments += 4; // All BNPL loans have 4 installments
        bnplVolume += loan.productPrice;
        if (loan.createdAt > 0 && loan.createdAt < firstTimestamp) firstTimestamp = loan.createdAt;

        if (loan.status === LoanStatus.ACTIVE) {
          if (loan.nextDueTimestamp < now) m.lateBNPLLoans++;
          else m.onTimeBNPLLoans++;
        }

        if (loan.status === LoanStatus.REPAID) {
          if (loan.collateralLocked) m.collateralLocked++;
          else m.collateralClaimed++;
        }
      }

      m.totalInstallmentsPaid = totalInstallments;
      m.maxPossibleInstallments = maxInstallments;
      m.totalBNPLVolume = bnplVolume;

      // NFT metrics
      m.totalNFTLoans = nftLoans.length;
      m.activeNFTLoans = nftLoans.filter(l => l.status === NFTLoanStatus.ACTIVE).length;
      m.repaidNFTLoans = nftLoans.filter(l => l.status === NFTLoanStatus.REPAID).length;
      m.defaultedNFTLoans = nftLoans.filter(l => l.status === NFTLoanStatus.DEFAULTED || l.status === NFTLoanStatus.LIQUIDATED).length;

      let nftVolume = 0n;
      for (const loan of nftLoans) {
        nftVolume += loan.loanAmount;
        if (loan.createdAt > 0 && loan.createdAt < firstTimestamp) firstTimestamp = loan.createdAt;
        if (loan.status === NFTLoanStatus.ACTIVE) {
          if (loan.dueTimestamp < now) m.lateNFTLoans++;
          else m.onTimeNFTLoans++;
        }
      }
      m.totalNFTVolume = nftVolume;
      m.firstLoanTimestamp = firstTimestamp === Infinity ? 0 : firstTimestamp;
      m.hasHistory = m.totalBNPLLoans > 0 || m.totalNFTLoans > 0;

      // ── Compute Score ────────────────────────────────
      const result = computeAuraScore(m);
      setScore(result.score);
      setFactors(result.factors);
      setMetrics(m);
    } catch (err) {
      console.error('Aura computation failed:', err);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    computeAura();
  }, [computeAura]);

  return {
    score,
    tier: getTierForScore(score),
    factors,
    metrics,
    loading,
  };
}

function emptyMetrics(): AuraMetrics {
  return {
    totalBNPLLoans: 0, activeBNPLLoans: 0, repaidBNPLLoans: 0, defaultedBNPLLoans: 0,
    totalInstallmentsPaid: 0, maxPossibleInstallments: 0, totalBNPLVolume: 0n,
    onTimeBNPLLoans: 0, lateBNPLLoans: 0, collateralClaimed: 0, collateralLocked: 0,
    totalNFTLoans: 0, activeNFTLoans: 0, repaidNFTLoans: 0, defaultedNFTLoans: 0,
    totalNFTVolume: 0n, onTimeNFTLoans: 0, lateNFTLoans: 0,
    firstLoanTimestamp: 0, hasHistory: false,
  };
}
