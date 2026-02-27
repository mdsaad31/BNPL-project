import { useState } from 'react';
import { formatEther } from 'ethers';
import { useWeb3 } from '../context/Web3Context';
import { useTheme } from '../context/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';
import { useTrustPay, type Product } from '../hooks/useTrustPay';
import { COLLATERAL_RATIO } from '../contracts';
import { IconCart, IconConstruction, IconPackage, IconAlert, IconX } from '../components/Icons';

export default function Shop() {
  const { address } = useWeb3();
  const { theme } = useTheme();
  const { isMobile } = useResponsive();
  const { products: allProducts, purchaseProduct, txPending, loading } = useTrustPay();
  const products = allProducts.filter(p => p.active);
  const [selected, setSelected] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handlePurchase = async () => {
    if (!selected) return;
    try {
      await purchaseProduct(selected.id, selected.price);
      setShowModal(false);
      setSelected(null);
    } catch (err) {
      console.error('Purchase failed:', err);
      alert(`Purchase failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 16 }}>
        <div className="anim-float"><IconCart size={40} color={theme.text3} /></div>
        <p style={{ color: theme.text3, fontWeight: 500 }}>Loading the goods...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: isMobile ? 32 : 48 }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600, color: theme.brand, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>Shop</span>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 28 : 36, fontWeight: 700, color: theme.text, marginBottom: 10 }}>Marketplace</h1>
        <p style={{ fontSize: isMobile ? 14 : 16, color: theme.text2 }}>Buy with BNPL — because "add to cart" hits different on-chain.</p>
        {!address && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 14, background: theme.warnBg, border: `1px solid ${theme.mode === 'dark' ? 'rgba(245,158,11,0.2)' : '#FED7AA'}`, fontSize: 14, color: theme.mode === 'dark' ? theme.warn : '#9A3412', marginTop: 16 }}>
            <IconAlert size={16} /> Connect your wallet to start buying.
          </div>
        )}
      </div>

      {/* Product Grid */}
      {products.length === 0 ? (
        <div style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 20, padding: isMobile ? '48px 24px' : '64px 32px', textAlign: 'center', maxWidth: 400, margin: '0 auto' }}>
          <IconConstruction size={48} color={theme.text3} style={{ display: 'block', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: 18, fontWeight: 700, color: theme.text, marginBottom: 8 }}>No Products Yet</h3>
          <p style={{ fontSize: 14, color: theme.text3 }}>The shelves are empty. Deploy contracts to stock the shop.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: isMobile ? 20 : 28 }}>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onBuy={() => { setSelected(product); setShowModal(true); }}
              disabled={!address || txPending}
            />
          ))}
        </div>
      )}

      {/* Purchase Modal */}
      {showModal && selected && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? 16 : 24 }}>
          <div style={{ position: 'absolute', inset: 0, background: theme.modalOverlay, backdropFilter: 'blur(8px)' }} onClick={() => setShowModal(false)} />
          <div className="anim-up" style={{ position: 'relative', width: '100%', maxWidth: 440, background: theme.cardBg, borderRadius: 24, boxShadow: `0 24px 64px rgba(0,0,0,${theme.mode === 'dark' ? '0.4' : '0.15'})`, overflow: 'hidden' }}>
            {/* Modal header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '16px 20px' : '20px 28px', borderBottom: `1px solid ${theme.lineLight}` }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 18 : 20, fontWeight: 700, color: theme.text }}>Confirm Purchase</h2>
              <button onClick={() => setShowModal(false)} style={{ width: 32, height: 32, borderRadius: 10, border: 'none', background: theme.surfaceAlt, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.text3 }}>
                <IconX size={14} />
              </button>
            </div>

            {/* Details */}
            <div style={{ padding: isMobile ? 20 : 28 }}>
              <div style={{ borderRadius: 16, border: `1px solid ${theme.line}`, overflow: 'hidden', marginBottom: 24 }}>
                <Row label="Product" value={selected.name} />
                <Row label="Price" value={`${selected.priceFormatted} BNB`} bold />
                <Row label="Collateral (150%)" value={`${formatEther((selected.price * BigInt(COLLATERAL_RATIO)) / 100n)} BNB`} highlight />
                <Row label="Installment (×4)" value={`${formatEther(selected.price / 4n)} BNB/week`} />
              </div>

              <div style={{ padding: '16px 20px', borderRadius: 14, background: theme.infoBg, border: `1px solid ${theme.mode === 'dark' ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.15)'}`, marginBottom: 24 }}>
                <p style={{ fontSize: 13, color: theme.info, lineHeight: 1.65 }}>
                  <strong>How it works:</strong> Collateral is locked in the contract and returned after all 4 payments. Miss a payment after grace period? Liquidated. The blockchain is ruthless like that.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setShowModal(false)} style={{
                  flex: 1, padding: '14px 0', borderRadius: 12, border: `1.5px solid ${theme.line}`,
                  background: 'transparent', color: theme.text2, fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                }}>
                  Cancel
                </button>
                <button onClick={handlePurchase} disabled={txPending} style={{
                  flex: 1, padding: '14px 0', borderRadius: 12, border: 'none',
                  background: 'linear-gradient(135deg, #F97316, #EA580C)', color: 'white',
                  fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                  opacity: txPending ? 0.5 : 1,
                  boxShadow: '0 4px 12px rgba(249,115,22,0.3)',
                }}>
                  {txPending ? 'Processing...' : 'Lock & Buy'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Product Card ────────────────────────────────────────── */

function ProductCard({ product, onBuy, disabled }: { product: Product; onBuy: () => void; disabled: boolean }) {
  const { theme } = useTheme();
  const { isMobile } = useResponsive();
  const collateral = formatEther((product.price * BigInt(COLLATERAL_RATIO)) / 100n);
  const installment = formatEther(product.price / 4n);

  return (
    <div style={{
      background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: 24,
      overflow: 'hidden', transition: 'all 0.25s',
    }}>
      {/* Image placeholder */}
      <div style={{
        height: isMobile ? 160 : 200, background: `linear-gradient(135deg, ${theme.surfaceAlt}, ${theme.line})`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        {product.imageUri ? (
          <img src={product.imageUri} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <>
            <IconPackage size={40} color={theme.text3} />
            <span style={{ fontSize: 12, color: theme.text3, marginTop: 8 }}>Use your imagination</span>
          </>
        )}
        <div style={{
          position: 'absolute', top: 16, right: 16,
          padding: '6px 14px', borderRadius: 12,
          background: theme.mode === 'dark' ? 'rgba(19,27,46,0.92)' : 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)',
          boxShadow: theme.cardShadow,
          border: `1px solid ${theme.cardBorder}`,
        }}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: theme.text }}>{product.priceFormatted} BNB</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: isMobile ? 20 : 28 }}>
        <h3 style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, color: theme.text, marginBottom: 6 }}>{product.name}</h3>
        <p style={{ fontSize: 14, color: theme.text3, marginBottom: 24, lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
          {product.description}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
            <span style={{ color: theme.text3 }}>Collateral</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600, color: theme.brandDark }}>{collateral} BNB</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
            <span style={{ color: theme.text3 }}>4× Weekly</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: theme.text2 }}>{installment} BNB</span>
          </div>
        </div>

        <button onClick={onBuy} disabled={disabled} style={{
          width: '100%', padding: '14px 0', borderRadius: 12, border: 'none',
          background: disabled ? theme.line : 'linear-gradient(135deg, #F97316, #EA580C)',
          color: disabled ? theme.text3 : 'white',
          fontWeight: 600, fontSize: 14, cursor: disabled ? 'not-allowed' : 'pointer',
          fontFamily: "'Inter', sans-serif",
          boxShadow: disabled ? 'none' : '0 4px 12px rgba(249,115,22,0.25)',
        }}>
          {disabled ? 'Connect Wallet' : 'Buy with BNPL'}
        </button>
      </div>
    </div>
  );
}

/* ── Modal Row ───────────────────────────────────────────── */

function Row({ label, value, bold, highlight }: { label: string; value: string; bold?: boolean; highlight?: boolean }) {
  const { theme } = useTheme();
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px 20px',
      borderBottom: `1px solid ${theme.lineLight}`,
      background: highlight ? theme.brand50 : 'transparent',
    }}>
      <span style={{ fontSize: 14, color: theme.text2 }}>{label}</span>
      <span style={{
        fontFamily: "'JetBrains Mono', monospace", fontSize: 14,
        color: highlight ? theme.brandDarker : bold ? theme.text : theme.text2,
        fontWeight: highlight || bold ? 700 : 400,
      }}>{value}</span>
    </div>
  );
}
