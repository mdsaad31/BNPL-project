import { useWeb3 } from '../context/Web3Context';
import { useTheme } from '../context/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';
import { useNFTLoan, NFTLoanStatus, type NFTLoan, type OwnedNFT } from '../hooks/useNFTLoan';
import { IconWallet, IconNFT, IconDiamond, IconBank, IconCoins, IconClock, IconCheck, IconSkull, IconBolt, IconLock } from '../components/Icons';
import { useState } from 'react';

export default function NFTLoans() {
  const { address } = useWeb3();
  const { theme } = useTheme();
  const { isMobile } = useResponsive();
  const {
    loans, ownedNFTs, collectionInfo, treasuryBalance,
    loading, txPending,
    mintDemoNFT, takeLoan, repayLoan, liquidateLoan,
  } = useNFTLoan();

  const active = loans.filter(l => l.status === NFTLoanStatus.ACTIVE);
  const repaid = loans.filter(l => l.status === NFTLoanStatus.REPAID);

  if (!address) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 16 }}>
        <IconWallet size={48} color={theme.text3} />
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 20 : 24, fontWeight: 700, color: theme.text }}>Connect Your Wallet</h2>
        <p style={{ fontSize: 15, color: theme.text3, maxWidth: 360, textAlign: 'center' }}>Connect your wallet to access NFT-backed loans.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 16 }}>
        <div className="anim-float"><IconDiamond size={40} color={theme.text3} /></div>
        <p style={{ color: theme.text3, fontWeight: 500 }}>Loading NFT loans...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: isMobile ? 32 : 48 }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600, color: theme.brand, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>
          NFT Loans
        </span>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 28 : 36, fontWeight: 700, color: theme.text, marginBottom: 10 }}>
          Borrow Against Your NFTs
        </h1>
        <p style={{ fontSize: isMobile ? 14 : 16, color: theme.text2 }}>
          Lock your NFTs as collateral and receive BNB loans directly to your wallet. Repay with 5% interest within 30 days.
        </p>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(180px, 1fr))', gap: isMobile ? 12 : 20, marginBottom: isMobile ? 32 : 48 }}>
        <StatCard Icon={IconNFT} label="Your NFTs" value={String(ownedNFTs.length)} color={theme.info} bg={theme.infoBg} />
        <StatCard Icon={IconBolt} label="Active Loans" value={String(active.length)} color={theme.brand} bg={theme.warnBg} />
        <StatCard Icon={IconCheck} label="Repaid" value={String(repaid.length)} color={theme.ok} bg={theme.okBg} />
        <StatCard Icon={IconBank} label="Treasury" value={`${parseFloat(treasuryBalance).toFixed(2)} BNB`} color={theme.navy} bg={theme.infoBg} />
      </div>

      {/* Collection Info Banner */}
      {collectionInfo && collectionInfo.approved && (
        <div style={{
          background: `linear-gradient(135deg, ${theme.brand50}, ${theme.brand100})`,
          border: `1px solid ${theme.brand200}`,
          borderRadius: 16,
          padding: isMobile ? 20 : 28,
          marginBottom: isMobile ? 24 : 36,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: isMobile ? 16 : 32,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'linear-gradient(135deg, #F97316, #EA580C)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <IconDiamond size={24} color="white" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: theme.text }}>TrustPay Demo NFT (TPNFT)</div>
              <div style={{ fontSize: 13, color: theme.text2 }}>Approved Collection</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: isMobile ? 24 : 40, marginLeft: isMobile ? 0 : 'auto' }}>
            <div>
              <div style={{ fontSize: 12, color: theme.text3, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Floor Price</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: theme.text }}>{collectionInfo.floorPriceFormatted} BNB</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: theme.text3, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Max Loan (50% LTV)</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: theme.ok }}>{collectionInfo.maxLoanFormatted} BNB</div>
            </div>
          </div>
        </div>
      )}

      {/* My NFTs Section */}
      <div style={{ marginBottom: isMobile ? 32 : 48 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 20 : 24, fontWeight: 700, color: theme.text, display: 'flex', alignItems: 'center', gap: 10 }}>
            <IconNFT size={22} color={theme.brand} /> My NFTs
          </h2>
          <button
            onClick={mintDemoNFT}
            disabled={txPending}
            style={{
              padding: '10px 20px',
              borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(135deg, #F97316, #EA580C)',
              color: 'white',
              fontWeight: 600,
              fontSize: 13,
              cursor: txPending ? 'not-allowed' : 'pointer',
              opacity: txPending ? 0.6 : 1,
              boxShadow: '0 4px 14px rgba(249,115,22,0.35)',
              fontFamily: "'Inter', sans-serif",
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.2s',
            }}
          >
            <IconDiamond size={14} color="white" />
            {txPending ? 'Minting...' : 'Mint Demo NFT'}
          </button>
        </div>

        {ownedNFTs.length === 0 ? (
          <div style={{
            background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 20,
            padding: isMobile ? '40px 24px' : '56px 32px', textAlign: 'center',
          }}>
            <IconNFT size={48} color={theme.text3} style={{ display: 'block', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: theme.text, marginBottom: 8 }}>No NFTs Found</h3>
            <p style={{ fontSize: 14, color: theme.text3 }}>Mint a demo NFT above or transfer an approved NFT to start borrowing.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {ownedNFTs.map(nft => (
              <NFTCard
                key={`${nft.contractAddress}-${nft.tokenId}`}
                nft={nft}
                maxLoan={collectionInfo?.maxLoanFormatted || '0'}
                onTakeLoan={() => takeLoan(nft.contractAddress, nft.tokenId)}
                txPending={txPending}
                theme={theme}
                isMobile={isMobile}
              />
            ))}
          </div>
        )}
      </div>

      {/* Active Loans Section */}
      <div style={{ marginBottom: isMobile ? 32 : 48 }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 20 : 24, fontWeight: 700, color: theme.text, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <IconCoins size={22} color={theme.brand} /> Your NFT Loans
        </h2>

        {loans.length === 0 ? (
          <div style={{
            background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 20,
            padding: isMobile ? '40px 24px' : '56px 32px', textAlign: 'center',
          }}>
            <IconLock size={48} color={theme.text3} style={{ display: 'block', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: theme.text, marginBottom: 8 }}>No Loans Yet</h3>
            <p style={{ fontSize: 14, color: theme.text3 }}>Lock an NFT as collateral to get a BNB loan directly to your wallet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 16 : 20 }}>
            {loans.map(loan => (
              <LoanRow
                key={loan.id}
                loan={loan}
                onRepay={() => repayLoan(loan.id, loan.totalDue - loan.totalRepaid)}
                onLiquidate={() => liquidateLoan(loan.id)}
                txPending={txPending}
                theme={theme}
                isMobile={isMobile}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Stat Card ───────────────────────────────────────────── */
function StatCard({ Icon, label, value, color, bg }: {
  Icon: React.FC<{ size?: number; color?: string }>;
  label: string; value: string; color: string; bg: string;
}) {
  const { theme } = useTheme();
  const { isMobile } = useResponsive();
  return (
    <div style={{
      background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 16,
      padding: isMobile ? 16 : 20, boxShadow: theme.cardShadow, transition: 'all 0.2s',
    }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
        <Icon size={18} color={color} />
      </div>
      <div style={{ fontSize: 12, color: theme.text3, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: theme.text }}>{value}</div>
    </div>
  );
}

/* ── NFT Card ───────────────────────────────────────────── */
function NFTCard({ nft, maxLoan, onTakeLoan, txPending, theme, isMobile }: {
  nft: OwnedNFT; maxLoan: string; onTakeLoan: () => void;
  txPending: boolean; theme: ReturnType<typeof useTheme>['theme']; isMobile: boolean;
}) {
  return (
    <div style={{
      background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 20,
      overflow: 'hidden', boxShadow: theme.cardShadow, transition: 'all 0.2s',
    }}>
      {/* NFT Visual */}
      <div style={{
        height: 160, background: `linear-gradient(135deg, ${theme.navy}, ${theme.navyDark})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: 'linear-gradient(135deg, #F97316, #EA580C)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(249,115,22,0.3)',
        }}>
          <IconDiamond size={36} color="white" />
        </div>
        <div style={{
          position: 'absolute', top: 12, right: 12,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
          borderRadius: 8, padding: '4px 10px',
          fontSize: 12, fontWeight: 600, color: 'white',
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          #{nft.tokenId}
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: isMobile ? 16 : 20 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: theme.text, marginBottom: 4 }}>TPNFT #{nft.tokenId}</div>
        <div style={{ fontSize: 13, color: theme.text3, marginBottom: 16, fontFamily: "'JetBrains Mono', monospace" }}>
          {nft.contractAddress.slice(0, 8)}...{nft.contractAddress.slice(-6)}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, padding: '12px 14px', background: theme.surfaceAlt, borderRadius: 10 }}>
          <span style={{ fontSize: 13, color: theme.text3 }}>Max Loan</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: theme.ok }}>{maxLoan} BNB</span>
        </div>
        <button
          onClick={onTakeLoan}
          disabled={txPending}
          style={{
            width: '100%', padding: '12px 0', borderRadius: 12,
            border: 'none', background: 'linear-gradient(135deg, #F97316, #EA580C)',
            color: 'white', fontWeight: 600, fontSize: 14,
            cursor: txPending ? 'not-allowed' : 'pointer',
            opacity: txPending ? 0.6 : 1,
            boxShadow: '0 4px 14px rgba(249,115,22,0.35)',
            fontFamily: "'Inter', sans-serif",
            transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          <IconLock size={14} color="white" />
          {txPending ? 'Processing...' : 'Lock & Borrow'}
        </button>
      </div>
    </div>
  );
}

/* ── Loan Row ───────────────────────────────────────────── */
function LoanRow({ loan, onRepay, onLiquidate, txPending, theme, isMobile }: {
  loan: NFTLoan; onRepay: () => void; onLiquidate: () => void;
  txPending: boolean; theme: ReturnType<typeof useTheme>['theme']; isMobile: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  const statusConfig = {
    [NFTLoanStatus.ACTIVE]: { label: 'Active', color: theme.brand, bg: theme.warnBg, Icon: IconBolt },
    [NFTLoanStatus.REPAID]: { label: 'Repaid', color: theme.ok, bg: theme.okBg, Icon: IconCheck },
    [NFTLoanStatus.DEFAULTED]: { label: 'Defaulted', color: theme.err, bg: theme.errBg, Icon: IconSkull },
    [NFTLoanStatus.LIQUIDATED]: { label: 'Liquidated', color: theme.err, bg: theme.errBg, Icon: IconSkull },
  };

  const st = statusConfig[loan.status] || statusConfig[NFTLoanStatus.ACTIVE];
  const remaining = loan.totalDue - loan.totalRepaid;
  const remainingFormatted = (Number(remaining) / 1e18).toFixed(4);
  const progress = loan.totalDue > 0n ? Number((loan.totalRepaid * 100n) / loan.totalDue) : 0;
  const dueDate = new Date(loan.dueTimestamp * 1000);
  const isOverdue = Date.now() > loan.dueTimestamp * 1000 && loan.status === NFTLoanStatus.ACTIVE;

  return (
    <div style={{
      background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 20,
      overflow: 'hidden', boxShadow: theme.cardShadow, transition: 'all 0.2s',
    }}>
      {/* Main row */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: isMobile ? 16 : 24,
          cursor: 'pointer',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: isMobile ? 12 : 20,
        }}
      >
        {/* NFT badge */}
        <div style={{
          width: 48, height: 48, borderRadius: 14, flexShrink: 0,
          background: `linear-gradient(135deg, ${theme.navy}, ${theme.navyDark})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <IconDiamond size={22} color="#FDBA74" />
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: 16, color: theme.text }}>NFT Loan #{loan.id}</span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600,
              background: st.bg, color: st.color,
            }}>
              <st.Icon size={12} color={st.color} /> {st.label}
            </span>
          </div>
          <div style={{ fontSize: 13, color: theme.text3, marginTop: 4, fontFamily: "'JetBrains Mono', monospace" }}>
            Token #{loan.tokenId} &middot; {loan.nftContract.slice(0, 8)}...{loan.nftContract.slice(-6)}
          </div>
        </div>

        {/* Amount */}
        <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: theme.text }}>{loan.loanAmountFormatted} BNB</div>
          <div style={{ fontSize: 12, color: theme.text3 }}>borrowed</div>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{ padding: isMobile ? '0 16px 16px' : '0 24px 24px', borderTop: `1px solid ${theme.line}` }}>
          <div style={{ padding: '16px 0', display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 16 }}>
            <InfoCell label="Loan Amount" value={`${loan.loanAmountFormatted} BNB`} theme={theme} />
            <InfoCell label="Interest (5%)" value={`${loan.interestAmountFormatted} BNB`} theme={theme} />
            <InfoCell label="Total Due" value={`${loan.totalDueFormatted} BNB`} theme={theme} />
            <InfoCell label="Repaid" value={`${loan.totalRepaidFormatted} BNB`} theme={theme} />
          </div>

          {/* Progress bar */}
          {loan.status === NFTLoanStatus.ACTIVE && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: theme.text3 }}>Repayment Progress</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: theme.text2 }}>{progress}%</span>
              </div>
              <div style={{ height: 6, borderRadius: 99, background: theme.progressBg, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, borderRadius: 99, background: 'linear-gradient(90deg, #F97316, #EA580C)', transition: 'width 0.3s' }} />
              </div>
            </div>
          )}

          {/* Due date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '10px 14px', borderRadius: 10, background: isOverdue ? theme.errBg : theme.surfaceAlt }}>
            <IconClock size={14} color={isOverdue ? theme.err : theme.text3} />
            <span style={{ fontSize: 13, color: isOverdue ? theme.err : theme.text2, fontWeight: 500 }}>
              {isOverdue ? 'OVERDUE — ' : 'Due: '}{dueDate.toLocaleDateString()} {dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {isOverdue && <span style={{ fontSize: 12, color: theme.err, fontWeight: 600, marginLeft: 'auto' }}>Remaining: {remainingFormatted} BNB</span>}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {loan.status === NFTLoanStatus.ACTIVE && (
              <button
                onClick={(e) => { e.stopPropagation(); onRepay(); }}
                disabled={txPending}
                style={{
                  padding: '10px 24px', borderRadius: 12, border: 'none',
                  background: 'linear-gradient(135deg, #22C55E, #16A34A)',
                  color: 'white', fontWeight: 600, fontSize: 13,
                  cursor: txPending ? 'not-allowed' : 'pointer',
                  opacity: txPending ? 0.6 : 1,
                  boxShadow: '0 4px 14px rgba(34,197,94,0.3)',
                  fontFamily: "'Inter', sans-serif",
                  display: 'flex', alignItems: 'center', gap: 8,
                  transition: 'all 0.2s',
                }}
              >
                <IconCheck size={14} color="white" />
                {txPending ? 'Processing...' : `Repay Full (${remainingFormatted} BNB)`}
              </button>
            )}
            {isOverdue && (
              <button
                onClick={(e) => { e.stopPropagation(); onLiquidate(); }}
                disabled={txPending}
                style={{
                  padding: '10px 24px', borderRadius: 12, border: `1px solid ${theme.err}`,
                  background: 'transparent', color: theme.err, fontWeight: 600, fontSize: 13,
                  cursor: txPending ? 'not-allowed' : 'pointer',
                  opacity: txPending ? 0.6 : 1,
                  fontFamily: "'Inter', sans-serif",
                  display: 'flex', alignItems: 'center', gap: 8,
                  transition: 'all 0.2s',
                }}
              >
                <IconSkull size={14} color={theme.err} />
                Liquidate
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Info Cell ───────────────────────────────────────────── */
function InfoCell({ label, value, theme }: { label: string; value: string; theme: ReturnType<typeof useTheme>['theme'] }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: theme.text3, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>{value}</div>
    </div>
  );
}
