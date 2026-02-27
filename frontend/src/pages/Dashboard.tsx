import { useState } from 'react';
import { formatEther } from 'ethers';
import { useWeb3 } from '../context/Web3Context';
import { useTheme } from '../context/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';
import { useTrustPay, LoanStatus, type Loan } from '../hooks/useTrustPay';
import { useNFTLoan, NFTLoanStatus, type NFTLoan } from '../hooks/useNFTLoan';
import {
  IconWallet, IconChart, IconClipboard, IconBolt, IconCheck,
  IconSkull, IconCart, IconClock, IconNFT, IconDiamond, IconBank,
} from '../components/Icons';

export default function Dashboard() {
  const { address } = useWeb3();
  const { theme } = useTheme();
  const { isMobile } = useResponsive();
  const { buyerLoans, payInstallment, triggerDefault, txPending: bnplPending, loading: bnplLoading } = useTrustPay();
  const nftLoan = useNFTLoan();
  const [tab, setTab] = useState<'bnpl' | 'nft'>('bnpl');

  const txPending = bnplPending || nftLoan.txPending;
  const loading = bnplLoading || nftLoan.loading;

  const active = buyerLoans.filter(l => l.status === LoanStatus.ACTIVE);
  const repaid = buyerLoans.filter(l => l.status === LoanStatus.REPAID);
  const defaulted = buyerLoans.filter(l => l.status === LoanStatus.DEFAULTED);



  if (!address) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 16 }}>
        <IconWallet size={48} color={theme.text3} />
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 20 : 24, fontWeight: 700, color: theme.text }}>Connect Your Wallet</h2>
        <p style={{ fontSize: 15, color: theme.text3, maxWidth: 360, textAlign: 'center' }}>Please connect your wallet to view BNPL loans and payment history.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 16 }}>
        <div className="anim-float"><IconChart size={40} color={theme.text3} /></div>
        <p style={{ color: theme.text3, fontWeight: 500 }}>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: isMobile ? 24 : 36 }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600, color: theme.brand, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>Dashboard</span>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 28 : 36, fontWeight: 700, color: theme.text, marginBottom: 10 }}>Your Loans</h1>
        <p style={{ fontSize: isMobile ? 14 : 16, color: theme.text2 }}>Manage BNPL and NFT-backed loans. Pay on time or face the blockchain's wrath.</p>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(160px, 1fr))', gap: isMobile ? 12 : 20, marginBottom: isMobile ? 24 : 36 }}>
        <StatCard Icon={IconClipboard} label="BNPL Loans" value={buyerLoans.length} color={theme.navy} bg={theme.infoBg} />
        <StatCard Icon={IconBolt} label="Active" value={active.length} color={theme.brand} bg={theme.warnBg} />
        <StatCard Icon={IconCheck} label="Repaid" value={repaid.length} color={theme.ok} bg={theme.okBg} />
        <StatCard Icon={IconSkull} label="Defaulted" value={defaulted.length} color={theme.err} bg={theme.errBg} />
        <StatCard Icon={IconNFT} label="NFT Loans" value={nftLoan.loans.length} color={theme.mode === 'dark' ? '#F472B6' : '#DB2777'} bg={theme.mode === 'dark' ? 'rgba(219,39,119,0.12)' : '#FDF2F8'} />
        <StatCard Icon={IconDiamond} label="Owned NFTs" value={nftLoan.ownedNFTs.length} color={theme.mode === 'dark' ? '#818CF8' : '#6366F1'} bg={theme.mode === 'dark' ? 'rgba(99,102,241,0.12)' : '#EEF2FF'} />
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 8, marginBottom: isMobile ? 20 : 28 }}>
        <button onClick={() => setTab('bnpl')} style={{
          padding: isMobile ? '8px 16px' : '10px 22px', borderRadius: 12, border: 'none',
          background: tab === 'bnpl' ? theme.navy : theme.surfaceAlt,
          color: tab === 'bnpl' ? 'white' : theme.text2,
          fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: "'Inter', sans-serif",
        }}>
          BNPL Loans ({buyerLoans.length})
        </button>
        <button onClick={() => setTab('nft')} style={{
          padding: isMobile ? '8px 16px' : '10px 22px', borderRadius: 12, border: 'none',
          background: tab === 'nft' ? theme.navy : theme.surfaceAlt,
          color: tab === 'nft' ? 'white' : theme.text2,
          fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: "'Inter', sans-serif",
        }}>
          NFT Loans ({nftLoan.loans.length})
        </button>
      </div>

      {/* BNPL Loans Tab */}
      {tab === 'bnpl' && (
        <>
          {buyerLoans.length === 0 ? (
            <EmptyState icon={<IconCart size={48} color={theme.text3} />} title="No BNPL Loans Yet" message="Head to the Shop and start your BNPL journey. Your collateral awaits." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 16 : 20 }}>
              {buyerLoans.map(loan => (
                <LoanCard
                  key={loan.id}
                  loan={loan}
                  onPay={() => payInstallment(loan.id, loan.installmentAmount)}
                  onDefault={() => triggerDefault(loan.id)}
                  txPending={txPending}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* NFT Loans Tab */}
      {tab === 'nft' && (
        <>
          {/* NFT Loan Quick Actions */}
          {nftLoan.ownedNFTs.length > 0 && nftLoan.collectionInfo?.approved && (
            <div style={{
              background: `linear-gradient(135deg, ${theme.mode === 'dark' ? '#1E1B4B' : '#EEF2FF'}, ${theme.mode === 'dark' ? '#312E81' : '#E0E7FF'})`,
              border: `1px solid ${theme.mode === 'dark' ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.15)'}`,
              borderRadius: 20, padding: isMobile ? 20 : 28, marginBottom: 24,
            }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: theme.text, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconDiamond size={20} color={theme.mode === 'dark' ? '#818CF8' : '#6366F1'} />
                Take a New NFT Loan
              </h3>
              <p style={{ fontSize: 14, color: theme.text2, marginBottom: 16 }}>
                Lock your NFT as collateral and receive up to {nftLoan.collectionInfo.maxLoanFormatted} BNB instantly.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                {nftLoan.ownedNFTs.map(nft => (
                  <button
                    key={`${nft.contractAddress}-${nft.tokenId}`}
                    onClick={() => nftLoan.takeLoan(nft.contractAddress, nft.tokenId)}
                    disabled={txPending}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '14px 18px', borderRadius: 14, border: 'none',
                      background: txPending ? theme.line : 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                      color: txPending ? theme.text3 : 'white',
                      fontWeight: 600, fontSize: 13, cursor: txPending ? 'not-allowed' : 'pointer',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: `linear-gradient(135deg, hsl(${(nft.tokenId * 60) % 360}, 70%, 60%), hsl(${(nft.tokenId * 60 + 120) % 360}, 70%, 60%))`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <IconDiamond size={14} color="white" />
                    </div>
                    {txPending ? 'Processing...' : `Lock TPNFT #${nft.tokenId}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {nftLoan.loans.length === 0 ? (
            <EmptyState icon={<IconNFT size={48} color={theme.text3} />} title="No NFT Loans Yet" message="Go to NFT Loans page to take an NFT-backed loan, or use the quick action above." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 16 : 20 }}>
              {nftLoan.loans.map(loan => (
                <NFTLoanCard
                  key={loan.id}
                  loan={loan}
                  onRepay={() => nftLoan.repayLoan(loan.id, loan.totalDue - loan.totalRepaid)}
                  onLiquidate={() => nftLoan.liquidateLoan(loan.id)}
                  txPending={txPending}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ── Empty State ─────────────────────────────────────────── */

function EmptyState({ icon, title, message }: { icon: React.ReactNode; title: string; message: string }) {
  const { theme } = useTheme();
  const { isMobile } = useResponsive();
  return (
    <div style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 20, padding: isMobile ? '48px 24px' : '64px 32px', textAlign: 'center', maxWidth: 450, margin: '0 auto' }}>
      <div style={{ display: 'block', margin: '0 auto 16px' }}>{icon}</div>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: theme.text, marginBottom: 8 }}>{title}</h3>
      <p style={{ fontSize: 14, color: theme.text3 }}>{message}</p>
    </div>
  );
}

/* ── Stat Card ───────────────────────────────────────────── */

function StatCard({ Icon, label, value, color, bg }: { Icon: React.FC<{ size?: number; color?: string }>; label: string; value: number; color: string; bg: string }) {
  const { theme } = useTheme();
  const { isMobile } = useResponsive();
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 16,
      padding: isMobile ? '16px 18px' : '24px 28px', borderRadius: 18,
      background: theme.cardBg, border: `1px solid ${theme.cardBorder}`,
    }}>
      <div style={{
        width: isMobile ? 40 : 48, height: isMobile ? 40 : 48, borderRadius: 14,
        background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={isMobile ? 18 : 22} color={color} />
      </div>
      <div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: isMobile ? 22 : 28, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 13, color: theme.text3, marginTop: 4 }}>{label}</div>
      </div>
    </div>
  );
}

/* ── BNPL Loan Card ──────────────────────────────────────── */

function LoanCard({ loan, onPay, onDefault, txPending }: {
  loan: Loan;
  onPay: () => void;
  onDefault: () => void;
  txPending: boolean;
}) {
  const { theme } = useTheme();
  const { isMobile } = useResponsive();
  const isActive = loan.status === LoanStatus.ACTIVE;
  const isRepaid = loan.status === LoanStatus.REPAID;
  const isDefaulted = loan.status === LoanStatus.DEFAULTED;
  const progress = (loan.installmentsPaid / 4) * 100;
  const due = new Date(loan.nextDueTimestamp * 1000);
  const now = new Date();
  const isOverdue = isActive && due < now;

  const statusConfig = isRepaid
    ? { label: 'Repaid', color: theme.ok, bg: theme.okBg, Icon: IconCheck }
    : isDefaulted
    ? { label: 'Defaulted', color: theme.err, bg: theme.errBg, Icon: IconSkull }
    : isOverdue
    ? { label: 'Overdue', color: theme.err, bg: theme.errBg, Icon: IconClock }
    : { label: 'Active', color: theme.brand, bg: theme.warnBg, Icon: IconBolt };

  return (
    <div style={{
      background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 22,
      padding: 0, overflow: 'hidden',
    }}>
      {/* Card header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: isMobile ? '18px 20px' : '24px 28px', borderBottom: `1px solid ${theme.lineLight}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 14 }}>
          <statusConfig.Icon size={22} color={statusConfig.color} />
          <div>
            <h3 style={{ fontSize: isMobile ? 15 : 17, fontWeight: 700, color: theme.text }}>Loan #{loan.id}</h3>
            <span style={{ fontSize: 13, color: theme.text3 }}>Product #{loan.productId}</span>
          </div>
        </div>
        <div style={{
          padding: '6px 14px', borderRadius: 30,
          background: statusConfig.bg, color: statusConfig.color,
          fontSize: 13, fontWeight: 600,
        }}>
          {statusConfig.label}
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: isMobile ? '18px 20px' : '24px 28px' }}>
        {/* Progress bar */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: theme.text2, fontWeight: 500 }}>Payments</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600, color: theme.text }}>{loan.installmentsPaid}/4</span>
          </div>
          <div style={{ height: 10, background: theme.progressBg, borderRadius: 8, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 8,
              width: `${progress}%`,
              background: isRepaid ? 'linear-gradient(90deg, #059669, #10B981)' : isDefaulted ? 'linear-gradient(90deg, #DC2626, #EF4444)' : 'linear-gradient(90deg, #F97316, #FB923C)',
              transition: 'width 0.5s ease',
            }} />
          </div>
        </div>

        {/* Details grid */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '12px' : '16px 28px', marginBottom: 24 }}>
          <Detail label="Price" value={`${loan.productPriceFormatted} BNB`} />
          <Detail label="Each Payment" value={`${loan.installmentAmountFormatted} BNB`} />
          <Detail label="Repaid" value={`${formatEther(loan.totalRepaid)} BNB`} />
          <Detail label={isActive ? 'Next Due' : 'Status Date'} value={due.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} warn={isOverdue} />
        </div>

        {/* Actions */}
        {isActive && (
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 12 }}>
            <button onClick={onPay} disabled={txPending} style={{
              flex: 1, padding: '14px 0', borderRadius: 12, border: 'none',
              background: txPending ? theme.line : 'linear-gradient(135deg, #F97316, #EA580C)',
              color: txPending ? theme.text3 : 'white',
              fontWeight: 600, fontSize: 14, cursor: txPending ? 'not-allowed' : 'pointer',
              fontFamily: "'Inter', sans-serif",
              boxShadow: txPending ? 'none' : '0 4px 12px rgba(249,115,22,0.25)',
            }}>
              {txPending ? 'Processing...' : `Pay ${loan.installmentAmountFormatted} BNB`}
            </button>
            {isOverdue && (
              <button onClick={onDefault} disabled={txPending} style={{
                padding: '14px 20px', borderRadius: 12,
                border: `1.5px solid ${theme.mode === 'dark' ? '#7F1D1D' : '#FCA5A5'}`,
                background: theme.errBg,
                color: theme.err, fontWeight: 600, fontSize: 14,
                cursor: txPending ? 'not-allowed' : 'pointer', fontFamily: "'Inter', sans-serif",
              }}>
                Liquidate
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── NFT Loan Card ───────────────────────────────────────── */

function NFTLoanCard({ loan, onRepay, onLiquidate, txPending }: {
  loan: NFTLoan;
  onRepay: () => void;
  onLiquidate: () => void;
  txPending: boolean;
}) {
  const { theme } = useTheme();
  const { isMobile } = useResponsive();
  const isActive = loan.status === NFTLoanStatus.ACTIVE;
  const isRepaid = loan.status === NFTLoanStatus.REPAID;
  const isDefaulted = loan.status === NFTLoanStatus.DEFAULTED;
  const isLiquidated = loan.status === NFTLoanStatus.LIQUIDATED;
  const dueDate = new Date(loan.dueTimestamp * 1000);
  const isOverdue = isActive && dueDate < new Date();
  const remaining = loan.totalDue - loan.totalRepaid;

  const statusConfig = isRepaid
    ? { label: 'Repaid', color: theme.ok, bg: theme.okBg, Icon: IconCheck }
    : isDefaulted || isLiquidated
    ? { label: isLiquidated ? 'Liquidated' : 'Defaulted', color: theme.err, bg: theme.errBg, Icon: IconSkull }
    : isOverdue
    ? { label: 'Overdue', color: theme.err, bg: theme.errBg, Icon: IconClock }
    : { label: 'Active', color: theme.mode === 'dark' ? '#818CF8' : '#6366F1', bg: theme.mode === 'dark' ? 'rgba(99,102,241,0.12)' : '#EEF2FF', Icon: IconBank };

  return (
    <div style={{
      background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 22,
      padding: 0, overflow: 'hidden',
    }}>
      {/* Card header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: isMobile ? '18px 20px' : '24px 28px', borderBottom: `1px solid ${theme.lineLight}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 14 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: `linear-gradient(135deg, hsl(${(loan.tokenId * 60) % 360}, 70%, 60%), hsl(${(loan.tokenId * 60 + 120) % 360}, 70%, 60%))`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <IconDiamond size={18} color="white" />
          </div>
          <div>
            <h3 style={{ fontSize: isMobile ? 15 : 17, fontWeight: 700, color: theme.text }}>NFT Loan #{loan.id}</h3>
            <span style={{ fontSize: 13, color: theme.text3 }}>TPNFT #{loan.tokenId}</span>
          </div>
        </div>
        <div style={{
          padding: '6px 14px', borderRadius: 30,
          background: statusConfig.bg, color: statusConfig.color,
          fontSize: 13, fontWeight: 600,
        }}>
          {statusConfig.label}
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: isMobile ? '18px 20px' : '24px 28px' }}>
        {/* Details grid */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: isMobile ? '12px' : '16px 28px', marginBottom: 24 }}>
          <Detail label="Borrowed" value={`${loan.loanAmountFormatted} BNB`} />
          <Detail label="Interest" value={`${loan.interestAmountFormatted} BNB`} />
          <Detail label="Total Due" value={`${loan.totalDueFormatted} BNB`} />
          <Detail label="Repaid" value={`${loan.totalRepaidFormatted} BNB`} />
          <Detail label="Remaining" value={`${formatEther(remaining > 0n ? remaining : 0n)} BNB`} warn={isOverdue} />
          <Detail label={isActive ? 'Due Date' : 'Final Date'} value={dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} warn={isOverdue} />
        </div>

        {/* Actions */}
        {isActive && (
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 12 }}>
            <button onClick={onRepay} disabled={txPending} style={{
              flex: 1, padding: '14px 0', borderRadius: 12, border: 'none',
              background: txPending ? theme.line : 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
              color: txPending ? theme.text3 : 'white',
              fontWeight: 600, fontSize: 14, cursor: txPending ? 'not-allowed' : 'pointer',
              fontFamily: "'Inter', sans-serif",
              boxShadow: txPending ? 'none' : '0 4px 12px rgba(124,58,237,0.3)',
            }}>
              {txPending ? 'Processing...' : `Repay ${formatEther(remaining > 0n ? remaining : 0n)} BNB`}
            </button>
            {isOverdue && (
              <button onClick={onLiquidate} disabled={txPending} style={{
                padding: '14px 20px', borderRadius: 12,
                border: `1.5px solid ${theme.mode === 'dark' ? '#7F1D1D' : '#FCA5A5'}`,
                background: theme.errBg,
                color: theme.err, fontWeight: 600, fontSize: 14,
                cursor: txPending ? 'not-allowed' : 'pointer', fontFamily: "'Inter', sans-serif",
              }}>
                Liquidate
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Detail ──────────────────────────────────────────────── */

function Detail({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  const { theme } = useTheme();
  return (
    <div>
      <div style={{ fontSize: 12, color: theme.text3, marginBottom: 4 }}>{label}</div>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace", fontSize: 14,
        fontWeight: 600, color: warn ? theme.err : theme.text,
      }}>{value}</div>
    </div>
  );
}
