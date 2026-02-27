import { Link } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { useTheme } from '../context/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';
import { IconLock, IconBolt, IconShield, IconEye, IconCalendar, IconGift, IconDot, IconArrowRight } from '../components/Icons';

/* ═══════════════════════════════════════════════════════════
   LANDING PAGE — Dark mode + Responsive + SVG icons
   ═══════════════════════════════════════════════════════════ */

export default function Landing() {
  const { connect, address } = useWeb3();
  const { theme } = useTheme();
  const { isMobile, isTablet } = useResponsive();

  const sectionGap = isMobile ? 56 : 96;
  const heroPx = isMobile ? 24 : isTablet ? 40 : 64;
  const heroPy = isMobile ? 48 : 80;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: sectionGap }}>

      {/* ══════════════════════════════════════════════════
          HERO SECTION
          ══════════════════════════════════════════════════ */}
      <section
        style={{
          background: theme.heroGrad,
          borderRadius: isMobile ? 20 : 28,
          padding: `${heroPy}px ${heroPx}px ${heroPy - 8}px`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative orb */}
        <div style={{
          position: 'absolute', top: '-30%', right: '-10%', width: '60%', height: '160%',
          background: `radial-gradient(ellipse, ${theme.heroOrb}, transparent 65%)`,
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          {/* Chip */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 20px', borderRadius: 99,
            background: theme.heroChipBg, border: `1px solid ${theme.heroChipBorder}`,
            fontSize: 13, color: theme.heroTextMuted, marginBottom: isMobile ? 24 : 32,
          }}>
            <IconDot size={8} color={theme.ok} />
            Live on BNB Chain
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: isMobile ? 36 : 'clamp(42px, 6vw, 72px)',
            fontWeight: 700,
            color: theme.heroText,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            marginBottom: isMobile ? 20 : 28,
          }}>
            Buy Now.<br />
            <span style={{ color: theme.brandLight }}>Pay Later.</span>
          </h1>

          <p style={{
            fontSize: isMobile ? 15 : 18, color: theme.heroTextMuted, lineHeight: 1.7,
            maxWidth: 520, margin: '0 auto 12px',
          }}>
            The first non-custodial BNPL protocol. Lock collateral, split into 4 payments. Merchants get paid instantly.
          </p>

          <p style={{ fontSize: isMobile ? 13 : 14, color: theme.heroTextFaint, fontStyle: 'italic', marginBottom: isMobile ? 28 : 40 }}>
            "Because your wallet said no, but the blockchain said maybe."
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: isMobile ? 12 : 16, marginBottom: isMobile ? 36 : 56 }}>
            {address ? (
              <>
                <Link to="/shop" style={{
                  padding: isMobile ? '12px 28px' : '14px 36px', borderRadius: 14, background: 'white', color: '#1E3A5F',
                  fontWeight: 600, fontSize: isMobile ? 14 : 16, textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                }}>
                  Browse Shop <IconArrowRight size={16} />
                </Link>
                <Link to="/dashboard" style={{
                  padding: isMobile ? '12px 28px' : '14px 36px', borderRadius: 14,
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                  color: 'white', fontWeight: 600, fontSize: isMobile ? 14 : 16, textDecoration: 'none',
                }}>
                  My Dashboard
                </Link>
              </>
            ) : (
              <button onClick={connect} style={{
                padding: isMobile ? '14px 32px' : '16px 40px', borderRadius: 14, border: 'none',
                background: 'linear-gradient(135deg, #F97316, #EA580C)', color: 'white',
                fontWeight: 600, fontSize: isMobile ? 15 : 16, cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(249,115,22,0.4)',
                fontFamily: "'Inter', sans-serif",
              }}>
                Connect Wallet to Start
              </button>
            )}
          </div>

          {/* Hero Stats */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: isMobile ? 24 : 48,
            paddingTop: isMobile ? 24 : 32, borderTop: `1px solid ${theme.heroBorder}`,
          }}>
            {[
              { val: '150%', label: 'Collateralized' },
              { val: '4', label: 'Weekly Payments' },
              { val: '0', label: 'Middlemen' },
              { val: '100%', label: 'On-Chain' },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: 'center', minWidth: isMobile ? 64 : 80 }}>
                <div style={{ fontSize: isMobile ? 24 : 32, fontWeight: 800, color: theme.heroText, letterSpacing: '-0.02em' }}>{s.val}</div>
                <div style={{ fontSize: isMobile ? 10 : 11, color: theme.heroTextFaint, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SOCIAL PROOF TICKER
          ══════════════════════════════════════════════════ */}
      <section style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: isMobile ? 20 : 32, padding: '0 16px' }}>
        {[
          '150% collateralized — we\'re not animals',
          '4 weekly payments — patience is a virtue',
          '0 middlemen — they weren\'t invited',
          '100% on-chain — trustless, like your ex',
        ].map((txt, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: isMobile ? 12 : 13, color: theme.text3 }}>
            <IconDot size={6} color={theme.brand} />
            {txt}
          </span>
        ))}
      </section>

      {/* ══════════════════════════════════════════════════
          WHY NEXAPAY
          ══════════════════════════════════════════════════ */}
      <section>
        <SectionHeader num="01" title="Why NexaPay?" subtitle="Because someone had to bring BNPL to Web3, and credit cards are so last century." />

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))', gap: isMobile ? 16 : 24, marginTop: isMobile ? 32 : 48 }}>
          {[
            {
              icon: <IconLock size={26} />, title: 'Non-Custodial',
              desc: "Your funds sit in smart contracts, not in some guy's hot wallet. Sleep well tonight.",
              accent: theme.navy, accentBg: theme.infoBg,
            },
            {
              icon: <IconBolt size={26} />, title: 'Instant Merchant Pay',
              desc: "Merchants get paid the moment you buy. You pay over 4 weeks. Everyone's happy.",
              accent: theme.brand, accentBg: theme.brand50,
            },
            {
              icon: <IconShield size={26} />, title: '150% Collateral',
              desc: "Over-collateralization protects everyone. It's a trust fall — but math does the catching.",
              accent: theme.navy, accentBg: theme.infoBg,
            },
          ].map((f) => (
            <div key={f.title} style={{
              background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: isMobile ? 20 : 24,
              padding: isMobile ? 28 : 40, transition: 'all 0.25s',
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: 18,
                background: f.accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: f.accent, marginBottom: isMobile ? 18 : 24,
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: isMobile ? 18 : 20, fontWeight: 700, color: theme.text, marginBottom: 12 }}>{f.title}</h3>
              <p style={{ fontSize: isMobile ? 14 : 15, color: theme.text2, lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          HOW IT WORKS
          ══════════════════════════════════════════════════ */}
      <section>
        <SectionHeader num="02" title="How It Works" subtitle={`Four simple steps. "Simple" is doing heavy lifting here.`} />

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(auto-fit, minmax(240px, 1fr))', gap: isMobile ? 16 : 24, marginTop: isMobile ? 32 : 48 }}>
          {([
            { step: '01', icon: <IconEye size={28} />, title: 'Browse', desc: "Find something you definitely need. Or just want. We don't judge." },
            { step: '02', icon: <IconLock size={28} />, title: 'Lock Collateral', desc: 'Lock 1.5× the price in BNB. A pinky promise, but with crypto.' },
            { step: '03', icon: <IconCalendar size={28} />, title: 'Pay in 4', desc: 'Four weekly installments. Spread the impact across multiple Fridays.' },
            { step: '04', icon: <IconGift size={28} />, title: 'Reclaim', desc: 'Paid everything? Collateral returned. The system actually works!' },
          ] as const).map((item) => (
            <div key={item.step} style={{
              background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: isMobile ? 20 : 24,
              padding: isMobile ? 28 : 36, transition: 'all 0.25s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isMobile ? 18 : 24 }}>
                <div style={{ color: theme.brand }}>{item.icon}</div>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600,
                  color: theme.brand, letterSpacing: '0.1em',
                }}>
                  {item.step}
                </span>
              </div>
              <h3 style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, color: theme.text, marginBottom: 10 }}>{item.title}</h3>
              <p style={{ fontSize: 14, color: theme.text2, lineHeight: 1.65 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          TRUST BANNER
          ══════════════════════════════════════════════════ */}
      <section style={{
        background: theme.heroGrad,
        borderRadius: isMobile ? 20 : 28, padding: isMobile ? '48px 24px' : '72px 64px', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '24px 24px', pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 24 : 'clamp(28px, 4vw, 40px)',
            fontWeight: 700, color: theme.heroText, marginBottom: 20,
          }}>
            Trustless Finance for the Trust-Averse
          </h2>
          <p style={{ fontSize: isMobile ? 14 : 17, color: theme.heroTextMuted, maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7 }}>
            Every transaction verified on-chain. Every penny in Solidity. No fine print. No hidden fees. No "oops we lost your money" moments.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
            {['Open Source', 'Fully Auditable', 'Permissionless', 'BNB Chain Native'].map((t) => (
              <span key={t} style={{
                padding: isMobile ? '8px 18px' : '10px 24px', borderRadius: 99,
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
                color: 'white', fontSize: isMobile ? 13 : 14, fontWeight: 500,
              }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FAQ
          ══════════════════════════════════════════════════ */}
      <section>
        <SectionHeader num="03" title="Frequently Anticipated Questions" subtitle="We anticipated your skepticism." />

        <div style={{ maxWidth: 680, margin: `${isMobile ? 32 : 48}px auto 0`, display: 'flex', flexDirection: 'column', gap: isMobile ? 14 : 20 }}>
          {[
            {
              q: 'Is this just Afterpay but make it crypto?',
              a: "Basically, yes. Except no company holds your data, no credit checks, and no passive-aggressive emails when you're late. Just cold, hard smart contract logic.",
            },
            {
              q: "What happens if I don't pay?",
              a: "Your collateral gets liquidated. The blockchain doesn't feel bad about it. Think of it as a stern conversation with your parents, but decentralized.",
            },
            {
              q: 'Why 150%? That seems like... a lot.',
              a: '100% would be "just paying for it" and 200% would be absurd. 150% is the Goldilocks zone for trustless lending.',
            },
            {
              q: 'Is this financial advice?',
              a: 'Absolutely not. This is a hackathon project with vibes. Please consult a fortune cookie. Or a real advisor. Whichever is more accessible.',
            },
          ].map((faq) => (
            <div key={faq.q} style={{
              background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: isMobile ? 16 : 20,
              padding: isMobile ? 24 : 32,
            }}>
              <h3 style={{ fontSize: isMobile ? 15 : 16, fontWeight: 700, color: theme.text, marginBottom: 10 }}>{faq.q}</h3>
              <p style={{ fontSize: 14, color: theme.text2, lineHeight: 1.7 }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          CTA
          ══════════════════════════════════════════════════ */}
      <section style={{
        background: theme.mode === 'dark'
          ? `linear-gradient(135deg, ${theme.brand50}, ${theme.pageBg}, ${theme.brand50})`
          : 'linear-gradient(135deg, #FFF7ED, #FAFBFC, #FFF7ED)',
        border: `1px solid ${theme.mode === 'dark' ? theme.brand100 : '#FED7AA'}`,
        borderRadius: isMobile ? 20 : 28, padding: isMobile ? '48px 24px' : '72px 64px', textAlign: 'center',
      }}>
        <h2 style={{
          fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 24 : 'clamp(28px, 4vw, 40px)',
          fontWeight: 700, color: theme.text, marginBottom: 16,
        }}>
          Ready to Split Some Payments?
        </h2>
        <p style={{ fontSize: isMobile ? 14 : 16, color: theme.text2, maxWidth: 420, margin: '0 auto 40px' }}>
          Connect your wallet and join the future of impulsive-but-structured purchasing.
        </p>
        {address ? (
          <Link to="/shop" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: isMobile ? '14px 32px' : '16px 40px', borderRadius: 14,
            background: 'linear-gradient(135deg, #F97316, #EA580C)', color: 'white',
            fontWeight: 600, fontSize: isMobile ? 15 : 17, textDecoration: 'none',
            boxShadow: '0 4px 20px rgba(249,115,22,0.35)',
          }}>
            Start Shopping <IconArrowRight size={18} />
          </Link>
        ) : (
          <button onClick={connect} style={{
            padding: isMobile ? '14px 32px' : '16px 40px', borderRadius: 14, border: 'none',
            background: 'linear-gradient(135deg, #F97316, #EA580C)', color: 'white',
            fontWeight: 600, fontSize: isMobile ? 15 : 17, cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(249,115,22,0.35)',
            fontFamily: "'Inter', sans-serif",
          }}>
            Connect Wallet
          </button>
        )}
      </section>
    </div>
  );
}

/* ── Section Header ──────────────────────────────────────── */

function SectionHeader({ num, title, subtitle }: { num: string; title: string; subtitle: string }) {
  const { theme } = useTheme();
  const { isMobile } = useResponsive();

  return (
    <div style={{ textAlign: 'center' }}>
      <span style={{
        fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600,
        color: theme.brand, letterSpacing: '0.1em', textTransform: 'uppercase',
        display: 'block', marginBottom: 12,
      }}>
        {num}
      </span>
      <h2 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: isMobile ? 24 : 'clamp(28px, 4vw, 40px)',
        fontWeight: 700, color: theme.text, marginBottom: 12,
      }}>
        {title}
      </h2>
      <p style={{ fontSize: isMobile ? 14 : 16, color: theme.text2, maxWidth: 520, margin: '0 auto', lineHeight: 1.65 }}>
        {subtitle}
      </p>
    </div>
  );
}
