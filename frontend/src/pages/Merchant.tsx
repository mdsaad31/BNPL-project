import { useState } from 'react';
import { formatEther } from 'ethers';
import { useWeb3 } from '../context/Web3Context';
import { useTheme } from '../context/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';
import { useTrustPay, LoanStatus, type Loan, type Product } from '../hooks/useTrustPay';
import { useNFTLoan } from '../hooks/useNFTLoan';
import {
  IconStore, IconPackage, IconBolt, IconCheck, IconCoins,
  IconClipboard, IconX, IconPlus, IconNFT, IconDiamond,
  IconEye, IconAlert, IconBank,
} from '../components/Icons';

export default function Merchant() {
  const { address } = useWeb3();
  const { theme } = useTheme();
  const { isMobile } = useResponsive();
  const {
    isMerchant, merchantName, merchantLoans, products,
    registerMerchant, createProduct, toggleProduct, txPending, loading,
  } = useTrustPay();
  const nftLoan = useNFTLoan();

  if (!address) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 16 }}>
        <IconStore size={48} color={theme.text3} />
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 20 : 24, fontWeight: 700, color: theme.text }}>Connect Your Wallet</h2>
        <p style={{ fontSize: 15, color: theme.text3, maxWidth: 360, textAlign: 'center' }}>Connect your wallet to register as a merchant or manage your store.</p>
      </div>
    );
  }

  if (loading || nftLoan.loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 16 }}>
        <div className="anim-float"><IconStore size={40} color={theme.text3} /></div>
        <p style={{ color: theme.text3, fontWeight: 500 }}>Loading merchant data...</p>
      </div>
    );
  }

  if (!isMerchant) {
    return <RegisterForm onRegister={registerMerchant} txPending={txPending} />;
  }

  return (
    <MerchantDashboard
      merchantName={merchantName}
      products={products}
      merchantLoans={merchantLoans}
      createProduct={createProduct}
      toggleProduct={toggleProduct}
      txPending={txPending || nftLoan.txPending}
      nftLoan={nftLoan}
      address={address}
    />
  );
}

/* ── Register Form ───────────────────────────────────────── */

function RegisterForm({ onRegister, txPending }: {
  onRegister: (name: string) => Promise<void>;
  txPending: boolean;
}) {
  const { theme } = useTheme();
  const { isMobile } = useResponsive();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Name is required'); return; }
    setError('');
    try {
      await onRegister(name.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: isMobile ? 32 : 48 }}>
        <IconStore size={56} color={theme.text3} style={{ display: 'block', margin: '0 auto 16px' }} />
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600, color: theme.brand, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>Merchant</span>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 26 : 32, fontWeight: 700, color: theme.text, marginBottom: 10 }}>Open Your Store</h1>
        <p style={{ fontSize: 15, color: theme.text2 }}>Register as a merchant to list products and accept BNPL payments on-chain.</p>
      </div>

      <div style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 24, padding: isMobile ? 24 : 36 }}>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: theme.text, marginBottom: 8 }}>Store Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. CyberForge Electronics"
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          style={{
            width: '100%', padding: '14px 18px', borderRadius: 12,
            border: `1.5px solid ${theme.inputBorder}`, background: theme.inputBg,
            fontSize: 15, color: theme.text, outline: 'none', fontFamily: "'Inter', sans-serif",
            boxSizing: 'border-box',
          }}
        />
        {error && <p style={{ color: theme.err, fontSize: 13, marginTop: 8 }}>{error}</p>}

        <button onClick={handleSubmit} disabled={txPending || !name.trim()} style={{
          width: '100%', padding: '16px 0', borderRadius: 12, border: 'none',
          background: (txPending || !name.trim()) ? theme.line : 'linear-gradient(135deg, #F97316, #EA580C)',
          color: (txPending || !name.trim()) ? theme.text3 : 'white',
          fontWeight: 600, fontSize: 15, cursor: (txPending || !name.trim()) ? 'not-allowed' : 'pointer',
          fontFamily: "'Inter', sans-serif", marginTop: 20,
          boxShadow: (txPending || !name.trim()) ? 'none' : '0 4px 12px rgba(249,115,22,0.3)',
        }}>
          {txPending ? 'Registering...' : 'Register as Merchant'}
        </button>
      </div>
    </div>
  );
}

/* ── Merchant Dashboard ──────────────────────────────────── */

interface NFTHookReturn {
  loans: ReturnType<typeof useNFTLoan>['loans'];
  ownedNFTs: ReturnType<typeof useNFTLoan>['ownedNFTs'];
  collectionInfo: ReturnType<typeof useNFTLoan>['collectionInfo'];
  treasuryBalance: ReturnType<typeof useNFTLoan>['treasuryBalance'];
  txPending: boolean;
  mintDemoNFT: () => Promise<void>;
}

function MerchantDashboard({ merchantName, products, merchantLoans, createProduct, toggleProduct, txPending, nftLoan, address }: {
  merchantName: string;
  products: Product[];
  merchantLoans: Loan[];
  createProduct: (name: string, description: string, imageUri: string, priceInBNB: string) => Promise<void>;
  toggleProduct: (productId: number) => Promise<void>;
  txPending: boolean;
  nftLoan: NFTHookReturn;
  address: string;
}) {
  const { theme } = useTheme();
  const { isMobile } = useResponsive();
  const [tab, setTab] = useState<'overview' | 'products' | 'nfts' | 'orders'>('overview');

  const myProducts = products.filter(p => p.merchant.toLowerCase() === address.toLowerCase());
  const activeLoanCount = merchantLoans.filter(l => l.status === LoanStatus.ACTIVE).length;
  const repaidCount = merchantLoans.filter(l => l.status === LoanStatus.REPAID).length;
  const totalRevenue = merchantLoans.reduce((s, l) => s + l.totalRepaid, 0n);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: isMobile ? 28 : 40 }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600, color: theme.brand, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>Merchant Portal</span>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 28 : 36, fontWeight: 700, color: theme.text, marginBottom: 8 }}>{merchantName}</h1>
        <p style={{ fontSize: 15, color: theme.text2 }}>Manage your products, NFTs, and track BNPL orders.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(170px, 1fr))', gap: isMobile ? 12 : 20, marginBottom: isMobile ? 28 : 40 }}>
        <MStat Icon={IconPackage} label="Products" value={myProducts.length} color={theme.navy} bg={theme.infoBg} />
        <MStat Icon={IconBolt} label="Active Orders" value={activeLoanCount} color={theme.brand} bg={theme.warnBg} />
        <MStat Icon={IconCheck} label="Completed" value={repaidCount} color={theme.ok} bg={theme.okBg} />
        <MStat Icon={IconCoins} label="Revenue" value={`${Number(formatEther(totalRevenue)).toFixed(3)} BNB`} color={theme.mode === 'dark' ? '#A78BFA' : '#7C3AED'} bg={theme.mode === 'dark' ? 'rgba(124,58,237,0.12)' : '#F5F3FF'} />
        <MStat Icon={IconNFT} label="My NFTs" value={nftLoan.ownedNFTs.length} color={theme.mode === 'dark' ? '#F472B6' : '#DB2777'} bg={theme.mode === 'dark' ? 'rgba(219,39,119,0.12)' : '#FDF2F8'} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: isMobile ? 24 : 32, flexWrap: 'wrap' }}>
        {(['overview', 'products', 'nfts', 'orders'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: isMobile ? '8px 16px' : '10px 22px', borderRadius: 12, border: 'none',
            background: tab === t ? theme.navy : theme.surfaceAlt,
            color: tab === t ? 'white' : theme.text2,
            fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: "'Inter', sans-serif",
            textTransform: 'capitalize',
          }}>{t === 'nfts' ? 'NFTs' : t}</button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'overview' && <OverviewTab products={myProducts} merchantLoans={merchantLoans} nftLoan={nftLoan} />}
      {tab === 'products' && <ProductsTab products={myProducts} createProduct={createProduct} toggleProduct={toggleProduct} txPending={txPending} />}
      {tab === 'nfts' && <NFTsTab nftLoan={nftLoan} txPending={txPending} />}
      {tab === 'orders' && <OrdersTab merchantLoans={merchantLoans} />}
    </div>
  );
}

/* ── Overview Tab ────────────────────────────────────────── */

function OverviewTab({ products, merchantLoans, nftLoan }: { products: Product[]; merchantLoans: Loan[]; nftLoan: NFTHookReturn }) {
  const { theme } = useTheme();
  const { isMobile } = useResponsive();
  return (
    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 16 : 24 }}>
      {/* Recent products */}
      <div style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 20, padding: isMobile ? 20 : 28 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: theme.text, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconPackage size={18} color={theme.text2} /> Your Products
        </h3>
        {products.length === 0 ? (
          <p style={{ fontSize: 14, color: theme.text3 }}>No products yet. Go to Products tab to create one!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {products.slice(0, 5).map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: 12, background: theme.surfaceAlt }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.active ? theme.ok : theme.err }} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>{p.name}</span>
                </div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: theme.brand, fontWeight: 600 }}>{p.priceFormatted} BNB</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent orders */}
      <div style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 20, padding: isMobile ? 20 : 28 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: theme.text, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconClipboard size={18} color={theme.text2} /> Recent Orders
        </h3>
        {merchantLoans.length === 0 ? (
          <p style={{ fontSize: 14, color: theme.text3 }}>No orders yet. Share your shop link!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {merchantLoans.slice(0, 5).map(l => {
              const statusCfg = l.status === LoanStatus.REPAID
                ? { label: 'Repaid', color: theme.ok }
                : l.status === LoanStatus.DEFAULTED
                ? { label: 'Defaulted', color: theme.err }
                : { label: 'Active', color: theme.brand };
              return (
                <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: 12, background: theme.surfaceAlt }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: theme.text }}>Loan #{l.id}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: statusCfg.color }}>{statusCfg.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* NFT Overview */}
      <div style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 20, padding: isMobile ? 20 : 28, gridColumn: isMobile ? undefined : '1 / -1' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: theme.text, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          <IconNFT size={18} color={theme.text2} /> NFT Collection Info
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: 16 }}>
          <InfoChip label="Your NFTs" value={String(nftLoan.ownedNFTs.length)} />
          <InfoChip label="Active NFT Loans" value={String(nftLoan.loans.filter(l => l.status === 0).length)} />
          <InfoChip label="Collection Floor" value={nftLoan.collectionInfo ? `${nftLoan.collectionInfo.floorPriceFormatted} BNB` : '—'} />
          <InfoChip label="Treasury" value={`${Number(nftLoan.treasuryBalance).toFixed(4)} BNB`} />
        </div>
      </div>
    </div>
  );
}

function InfoChip({ label, value }: { label: string; value: string }) {
  const { theme } = useTheme();
  return (
    <div style={{ padding: '16px 18px', borderRadius: 14, background: theme.surfaceAlt }}>
      <div style={{ fontSize: 12, color: theme.text3, marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700, color: theme.text }}>{value}</div>
    </div>
  );
}

/* ── Products Tab ────────────────────────────────────────── */

function ProductsTab({ products, createProduct, toggleProduct, txPending }: {
  products: Product[];
  createProduct: (name: string, description: string, imageUri: string, priceInBNB: string) => Promise<void>;
  toggleProduct: (productId: number) => Promise<void>;
  txPending: boolean;
}) {
  const { theme } = useTheme();
  const { isMobile } = useResponsive();
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      {/* Product list */}
      {products.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: isMobile ? 16 : 20, marginBottom: 32 }}>
          {products.map(p => (
            <div key={p.id} style={{
              background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 18, padding: isMobile ? 18 : 24,
              opacity: p.active ? 1 : 0.6,
            }}>
              {/* Image preview */}
              {p.imageUri && (
                <div style={{ height: 120, borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
                  <img src={p.imageUri} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12, gap: 12 }}>
                <div>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: theme.text }}>{p.name}</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.active ? theme.ok : theme.err }} />
                    <span style={{ fontSize: 12, color: p.active ? theme.ok : theme.err, fontWeight: 600 }}>{p.active ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, color: theme.brand, background: theme.warnBg, padding: '4px 10px', borderRadius: 8, whiteSpace: 'nowrap' }}>{p.priceFormatted} BNB</span>
              </div>
              <p style={{ fontSize: 13, color: theme.text3, lineHeight: 1.5, marginBottom: 16 }}>{p.description}</p>

              {/* Toggle button */}
              <button
                onClick={() => toggleProduct(p.id)}
                disabled={txPending}
                style={{
                  width: '100%', padding: '10px 0', borderRadius: 10,
                  border: `1.5px solid ${p.active ? theme.err : theme.ok}`,
                  background: 'transparent',
                  color: p.active ? theme.err : theme.ok,
                  fontWeight: 600, fontSize: 13, cursor: txPending ? 'not-allowed' : 'pointer',
                  fontFamily: "'Inter', sans-serif",
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <IconEye size={14} color={p.active ? theme.err : theme.ok} />
                {txPending ? 'Processing...' : p.active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create button / form */}
      {!showForm ? (
        <button onClick={() => setShowForm(true)} style={{
          padding: '15px 28px', borderRadius: 14, border: `2px dashed ${theme.line}`,
          background: 'transparent', color: theme.text2, fontWeight: 600, fontSize: 14,
          cursor: 'pointer', fontFamily: "'Inter', sans-serif", width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <IconPlus size={16} /> Add New Product
        </button>
      ) : (
        <CreateProductForm onCreate={createProduct} txPending={txPending} onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}

/* ── NFTs Tab ────────────────────────────────────────────── */

function NFTsTab({ nftLoan, txPending }: { nftLoan: NFTHookReturn; txPending: boolean }) {
  const { theme } = useTheme();
  const { isMobile } = useResponsive();

  return (
    <div>
      {/* Collection info banner */}
      {nftLoan.collectionInfo && (
        <div style={{
          background: `linear-gradient(135deg, ${theme.mode === 'dark' ? '#1E1B4B' : '#EEF2FF'}, ${theme.mode === 'dark' ? '#312E81' : '#E0E7FF'})`,
          border: `1px solid ${theme.mode === 'dark' ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.15)'}`,
          borderRadius: 20, padding: isMobile ? 20 : 28, marginBottom: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <IconDiamond size={22} color={theme.mode === 'dark' ? '#818CF8' : '#6366F1'} />
            <h3 style={{ fontSize: 17, fontWeight: 700, color: theme.text }}>TrustPay Demo NFT Collection</h3>
            {nftLoan.collectionInfo.approved && (
              <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: theme.okBg, color: theme.ok }}>Approved</span>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: 16 }}>
            <InfoChip label="Floor Price" value={`${nftLoan.collectionInfo.floorPriceFormatted} BNB`} />
            <InfoChip label="Max Loan (50% LTV)" value={`${nftLoan.collectionInfo.maxLoanFormatted} BNB`} />
            <InfoChip label="Treasury Balance" value={`${Number(nftLoan.treasuryBalance).toFixed(4)} BNB`} />
          </div>
        </div>
      )}

      {/* Owned NFTs */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: theme.text, display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconNFT size={18} color={theme.text2} /> Your NFTs ({nftLoan.ownedNFTs.length})
          </h3>
          <button
            onClick={() => nftLoan.mintDemoNFT()}
            disabled={txPending}
            style={{
              padding: '10px 20px', borderRadius: 12, border: 'none',
              background: txPending ? theme.line : 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
              color: txPending ? theme.text3 : 'white',
              fontWeight: 600, fontSize: 13, cursor: txPending ? 'not-allowed' : 'pointer',
              fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <IconPlus size={14} /> {txPending ? 'Minting...' : 'Mint Demo NFT'}
          </button>
        </div>

        {nftLoan.ownedNFTs.length === 0 ? (
          <div style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 18, padding: isMobile ? '36px 24px' : '48px 32px', textAlign: 'center' }}>
            <IconNFT size={40} color={theme.text3} style={{ display: 'block', margin: '0 auto 12px' }} />
            <h4 style={{ fontSize: 16, fontWeight: 700, color: theme.text, marginBottom: 6 }}>No NFTs Yet</h4>
            <p style={{ fontSize: 14, color: theme.text3 }}>Mint a demo NFT or acquire one to use as collateral for loans.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fill, minmax(200px, 1fr))', gap: isMobile ? 12 : 16 }}>
            {nftLoan.ownedNFTs.map((nft) => (
              <div key={`${nft.contractAddress}-${nft.tokenId}`} style={{
                background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 16, padding: isMobile ? 16 : 20, textAlign: 'center',
              }}>
                <div style={{
                  width: 80, height: 80, borderRadius: 16, margin: '0 auto 12px',
                  background: `linear-gradient(135deg, hsl(${(nft.tokenId * 60) % 360}, 70%, 60%), hsl(${(nft.tokenId * 60 + 120) % 360}, 70%, 60%))`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <IconDiamond size={32} color="white" />
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: theme.text }}>TPNFT #{nft.tokenId}</div>
                <div style={{ fontSize: 12, color: theme.text3, marginTop: 4 }}>Token ID: {nft.tokenId}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active NFT Loans */}
      {nftLoan.loans.length > 0 && (
        <div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: theme.text, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <IconBank size={18} color={theme.text2} /> Your NFT Loans ({nftLoan.loans.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {nftLoan.loans.map(loan => {
              const statusMap: Record<number, { label: string; color: string }> = {
                0: { label: 'Active', color: theme.brand },
                1: { label: 'Repaid', color: theme.ok },
                2: { label: 'Defaulted', color: theme.err },
                3: { label: 'Liquidated', color: theme.err },
              };
              const s = statusMap[loan.status] || statusMap[0];
              return (
                <div key={loan.id} style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 16, padding: isMobile ? 16 : 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, color: theme.text, fontSize: 15 }}>NFT Loan #{loan.id}</div>
                    <div style={{ fontSize: 12, color: theme.text3, marginTop: 2 }}>Token #{loan.tokenId} • Borrowed: {loan.loanAmountFormatted} BNB</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600, color: theme.text }}>Due: {loan.totalDueFormatted} BNB</span>
                    <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, color: s.color, background: theme.surfaceAlt }}>{s.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Create Product Form ─────────────────────────────────── */

function CreateProductForm({ onCreate, txPending, onClose }: {
  onCreate: (name: string, description: string, imageUri: string, priceInBNB: string) => Promise<void>;
  txPending: boolean;
  onClose: () => void;
}) {
  const { theme } = useTheme();
  const { isMobile } = useResponsive();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name.trim() || !desc.trim() || !price.trim()) {
      setError('Name, description, and price are required');
      return;
    }
    if (isNaN(Number(price)) || Number(price) <= 0) {
      setError('Price must be a positive number');
      return;
    }
    try {
      await onCreate(name.trim(), desc.trim(), image.trim(), price.trim());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px', borderRadius: 12,
    border: `1.5px solid ${theme.inputBorder}`, background: theme.inputBg,
    fontSize: 14, color: theme.text, outline: 'none', fontFamily: "'Inter', sans-serif",
    boxSizing: 'border-box',
  };

  return (
    <div style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 22, padding: isMobile ? 24 : 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: theme.text }}>New Product</h3>
        <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 10, border: 'none', background: theme.surfaceAlt, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.text3 }}>
          <IconX size={14} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: theme.text, marginBottom: 6 }}>Product Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. CyberPunk Headset" style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: theme.text, marginBottom: 6 }}>Description</label>
          <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Describe your product..." rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: theme.text, marginBottom: 6 }}>Price (BNB)</label>
            <input type="number" step="0.001" min="0" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: theme.text, marginBottom: 6 }}>Image URL (optional)</label>
            <input type="text" value={image} onChange={e => setImage(e.target.value)} placeholder="https://..." style={inputStyle} />
          </div>
        </div>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, padding: '10px 14px', borderRadius: 10, background: theme.errBg }}>
          <IconAlert size={14} color={theme.err} />
          <p style={{ color: theme.err, fontSize: 13 }}>{error}</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 12, marginTop: 24 }}>
        <button onClick={onClose} style={{
          flex: 1, padding: '14px 0', borderRadius: 12, border: `1.5px solid ${theme.line}`,
          background: 'transparent', color: theme.text2, fontWeight: 600, fontSize: 14,
          cursor: 'pointer', fontFamily: "'Inter', sans-serif",
        }}>Cancel</button>
        <button onClick={handleSubmit} disabled={txPending} style={{
          flex: 1, padding: '14px 0', borderRadius: 12, border: 'none',
          background: txPending ? theme.line : 'linear-gradient(135deg, #F97316, #EA580C)',
          color: txPending ? theme.text3 : 'white',
          fontWeight: 600, fontSize: 14, cursor: txPending ? 'not-allowed' : 'pointer',
          fontFamily: "'Inter', sans-serif",
          boxShadow: txPending ? 'none' : '0 4px 12px rgba(249,115,22,0.3)',
        }}>
          {txPending ? 'Creating...' : 'Create Product'}
        </button>
      </div>
    </div>
  );
}

/* ── Orders Tab ──────────────────────────────────────────── */

function OrdersTab({ merchantLoans }: { merchantLoans: Loan[] }) {
  const { theme } = useTheme();
  const { isMobile } = useResponsive();

  if (merchantLoans.length === 0) {
    return (
      <div style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 20, padding: isMobile ? '36px 24px' : '48px 32px', textAlign: 'center' }}>
        <IconClipboard size={40} color={theme.text3} style={{ display: 'block', margin: '0 auto 12px' }} />
        <h3 style={{ fontSize: 17, fontWeight: 700, color: theme.text, marginBottom: 6 }}>No Orders Yet</h3>
        <p style={{ fontSize: 14, color: theme.text3 }}>Orders will appear here when customers purchase your products.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {merchantLoans.map(loan => {
        const isActive = loan.status === LoanStatus.ACTIVE;
        const isRepaid = loan.status === LoanStatus.REPAID;
        const statusCfg = isRepaid
          ? { label: 'Repaid', color: theme.ok, bg: theme.okBg }
          : loan.status === LoanStatus.DEFAULTED
          ? { label: 'Defaulted', color: theme.err, bg: theme.errBg }
          : { label: 'Active', color: theme.brand, bg: theme.warnBg };

        const progress = (loan.installmentsPaid / 4) * 100;

        return (
          <div key={loan.id} style={{
            background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 18, padding: isMobile ? 18 : 24,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: theme.text }}>Order #{loan.id}</h4>
                <span style={{ fontSize: 12, color: theme.text3 }}>Buyer: {loan.buyer.slice(0, 6)}...{loan.buyer.slice(-4)}</span>
              </div>
              <span style={{
                padding: '5px 12px', borderRadius: 30,
                background: statusCfg.bg, color: statusCfg.color,
                fontSize: 12, fontWeight: 600,
              }}>{statusCfg.label}</span>
            </div>

            {/* Detail row */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div style={{ padding: '10px 14px', borderRadius: 10, background: theme.surfaceAlt }}>
                <div style={{ fontSize: 11, color: theme.text3, marginBottom: 4 }}>Product Price</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600, color: theme.text }}>{loan.productPriceFormatted} BNB</div>
              </div>
              <div style={{ padding: '10px 14px', borderRadius: 10, background: theme.surfaceAlt }}>
                <div style={{ fontSize: 11, color: theme.text3, marginBottom: 4 }}>Repaid</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600, color: theme.text }}>{formatEther(loan.totalRepaid)} BNB</div>
              </div>
              <div style={{ padding: '10px 14px', borderRadius: 10, background: theme.surfaceAlt }}>
                <div style={{ fontSize: 11, color: theme.text3, marginBottom: 4 }}>Due Date</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600, color: theme.text }}>{new Date(loan.nextDueTimestamp * 1000).toLocaleDateString()}</div>
              </div>
            </div>

            {/* Mini progress */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, height: 6, background: theme.progressBg, borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 4,
                  width: `${progress}%`,
                  background: isRepaid ? theme.ok : isActive ? theme.brand : theme.err,
                }} />
              </div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: theme.text2 }}>{loan.installmentsPaid}/4</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Merchant Stat ───────────────────────────────────────── */

function MStat({ Icon, label, value, color, bg }: { Icon: React.FC<{ size?: number; color?: string }>; label: string; value: number | string; color: string; bg: string }) {
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
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: typeof value === 'string' ? (isMobile ? 14 : 18) : (isMobile ? 22 : 28), fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 13, color: theme.text3, marginTop: 4 }}>{label}</div>
      </div>
    </div>
  );
}
