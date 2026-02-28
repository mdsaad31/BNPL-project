import { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useWeb3 } from '../context/Web3Context';
import { useResponsive } from '../hooks/useResponsive';
import { useAura, AURA_TIERS, type AuraFactor, type AuraMetrics } from '../hooks/useAura';
import { formatEther } from 'ethers';

/* ═══════════════════════════════════════════════════════════
   AURA — On-Chain Credit Score
   Every wallet has an Aura. Build it wisely.
   ═══════════════════════════════════════════════════════════ */

export default function Aura() {
  const { theme } = useTheme();
  const { address, connect } = useWeb3();
  const { isMobile } = useResponsive();
  const { score, tier, factors, metrics, loading } = useAura();

  // ── Animated score counter ──────────────────────────
  const [displayScore, setDisplayScore] = useState(0);
  useEffect(() => {
    if (loading) return;
    let frame = 0;
    const target = score;
    const duration = 60; // frames
    const start = 0;
    const step = () => {
      frame++;
      const progress = Math.min(frame / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(start + (target - start) * eased));
      if (frame < duration) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [score, loading]);

  // ── SVG Gauge parameters ────────────────────────────
  const gaugeRadius = isMobile ? 100 : 130;
  const gaugeStroke = isMobile ? 14 : 18;
  const gaugeSize = (gaugeRadius + gaugeStroke) * 2 + 20;
  const circumference = 2 * Math.PI * gaugeRadius * 0.75; // 270° arc
  const fillPct = loading ? 0 : score / 1000;
  const dashOffset = circumference * (1 - fillPct);

  if (!address) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 24, padding: 32 }}>
        <div style={{ fontSize: 64 }}>✨</div>
        <h2 style={{ color: theme.text, fontSize: 28, fontWeight: 700, margin: 0 }}>Discover Your Aura</h2>
        <p style={{ color: theme.text2, fontSize: 16, maxWidth: 440, textAlign: 'center', lineHeight: 1.6 }}>
          Connect your wallet to reveal your on-chain credit score — computed from every loan you've ever taken on NexaPay.
        </p>
        <button
          onClick={connect}
          style={{
            background: `linear-gradient(135deg, ${tier.gradientFrom}, ${tier.gradientTo})`,
            color: '#fff', border: 'none', borderRadius: 12, padding: '14px 36px',
            fontSize: 16, fontWeight: 600, cursor: 'pointer',
          }}
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: isMobile ? '24px 16px' : '40px 32px', maxWidth: 960, margin: '0 auto' }}>
      {/* ── Header ─────────────────────────────────── */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ fontSize: 32 }}>✨</span>
          <h1 style={{ margin: 0, fontSize: isMobile ? 32 : 42, fontWeight: 800, color: theme.text, letterSpacing: '-0.02em' }}>
            Aura Score
          </h1>
        </div>
        <p style={{ color: theme.text2, fontSize: 15, margin: 0 }}>
          Your on-chain reputation, distilled into a single number
        </p>
      </div>

      {/* ── Score Gauge ────────────────────────────── */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        background: theme.cardBg, border: `1px solid ${theme.cardBorder}`,
        borderRadius: 24, padding: isMobile ? '32px 16px' : '48px 32px',
        boxShadow: theme.cardShadow, marginBottom: 32,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Glow effect behind gauge */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -60%)',
          width: gaugeSize * 1.5, height: gaugeSize * 1.5,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${tier.color}18 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative' }}>
          <svg width={gaugeSize} height={gaugeSize * 0.7} viewBox={`0 0 ${gaugeSize} ${gaugeSize * 0.78}`}>
            {/* Track */}
            <circle
              cx={gaugeSize / 2} cy={gaugeSize / 2}
              r={gaugeRadius}
              fill="none"
              stroke={theme.progressBg}
              strokeWidth={gaugeStroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={0}
              transform={`rotate(135 ${gaugeSize / 2} ${gaugeSize / 2})`}
            />
            {/* Fill */}
            <circle
              cx={gaugeSize / 2} cy={gaugeSize / 2}
              r={gaugeRadius}
              fill="none"
              stroke={`url(#auraGrad)`}
              strokeWidth={gaugeStroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              transform={`rotate(135 ${gaugeSize / 2} ${gaugeSize / 2})`}
              style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.33, 1, 0.68, 1)' }}
            />
            <defs>
              <linearGradient id="auraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={tier.gradientFrom} />
                <stop offset="100%" stopColor={tier.gradientTo} />
              </linearGradient>
            </defs>
          </svg>

          {/* Score number overlay centered on gauge */}
          <div style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -40%)',
            textAlign: 'center',
          }}>
            {loading ? (
              <div style={{ color: theme.text3, fontSize: 20 }}>Computing...</div>
            ) : (
              <>
                <div style={{
                  fontSize: isMobile ? 56 : 72, fontWeight: 900,
                  color: tier.color, letterSpacing: '-0.04em',
                  lineHeight: 1, fontVariantNumeric: 'tabular-nums',
                }}>
                  {displayScore}
                </div>
                <div style={{ fontSize: 13, color: theme.text3, fontWeight: 500, marginTop: 4 }}>
                  out of 1,000
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tier badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          background: `${tier.color}15`,
          border: `1.5px solid ${tier.color}40`,
          borderRadius: 100, padding: '10px 24px', marginTop: 8,
        }}>
          <span style={{ fontSize: 22 }}>{tier.emoji}</span>
          <span style={{ fontWeight: 700, fontSize: 17, color: tier.color }}>{tier.label}</span>
        </div>
        <p style={{ color: theme.text2, fontSize: 14, maxWidth: 440, textAlign: 'center', marginTop: 12, lineHeight: 1.5 }}>
          {tier.description}
        </p>

        {/* Wallet address */}
        <div style={{
          marginTop: 16, fontSize: 12, color: theme.text3, fontFamily: 'monospace',
          background: theme.surfaceAlt, padding: '6px 16px', borderRadius: 8,
        }}>
          {address.slice(0, 6)}...{address.slice(-4)}
        </div>
      </div>

      {/* ── Tier Scale ─────────────────────────────── */}
      <div style={{
        background: theme.cardBg, border: `1px solid ${theme.cardBorder}`,
        borderRadius: 20, padding: isMobile ? 20 : 28, marginBottom: 32,
        boxShadow: theme.cardShadow,
      }}>
        <h3 style={{ color: theme.text, fontSize: 16, fontWeight: 700, marginTop: 0, marginBottom: 16 }}>
          Aura Tier Scale
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {AURA_TIERS.map((t) => {
            const isActive = t.tier === tier.tier;
            return (
              <div key={t.tier} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px',
                borderRadius: 10,
                background: isActive ? `${t.color}12` : 'transparent',
                border: isActive ? `1.5px solid ${t.color}30` : '1.5px solid transparent',
                transition: 'all 0.3s',
              }}>
                <span style={{ fontSize: 18, width: 28, textAlign: 'center' }}>{t.emoji}</span>
                <span style={{ fontWeight: isActive ? 700 : 500, color: isActive ? t.color : theme.text2, fontSize: 14, flex: 1 }}>
                  {t.label}
                </span>
                <span style={{
                  fontSize: 12, color: isActive ? t.color : theme.text3,
                  fontFamily: 'monospace', fontWeight: isActive ? 700 : 400,
                }}>
                  {t.minScore}+
                </span>
                {isActive && (
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: t.color, boxShadow: `0 0 8px ${t.color}80`,
                  }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Factor Breakdown ───────────────────────── */}
      <div style={{
        background: theme.cardBg, border: `1px solid ${theme.cardBorder}`,
        borderRadius: 20, padding: isMobile ? 20 : 28, marginBottom: 32,
        boxShadow: theme.cardShadow,
      }}>
        <h3 style={{ color: theme.text, fontSize: 16, fontWeight: 700, marginTop: 0, marginBottom: 20 }}>
          Score Breakdown
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {factors.map((f) => (
            <FactorCard key={f.name} factor={f} theme={theme} isMobile={isMobile} />
          ))}
        </div>
        {/* Base score note */}
        <div style={{
          marginTop: 20, padding: '12px 16px', borderRadius: 12,
          background: theme.surfaceAlt, display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <span style={{ fontSize: 18 }}>🏁</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: theme.text }}>Base Score: 500</div>
            <div style={{ fontSize: 12, color: theme.text3 }}>Every wallet starts here. Your behavior moves it up or down.</div>
          </div>
        </div>
      </div>

      {/* ── Loan Metrics ───────────────────────────── */}
      <div style={{
        background: theme.cardBg, border: `1px solid ${theme.cardBorder}`,
        borderRadius: 20, padding: isMobile ? 20 : 28, marginBottom: 32,
        boxShadow: theme.cardShadow,
      }}>
        <h3 style={{ color: theme.text, fontSize: 16, fontWeight: 700, marginTop: 0, marginBottom: 20 }}>
          On-Chain Metrics
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
          gap: 12,
        }}>
          <MetricTile label="BNPL Loans" value={metrics.totalBNPLLoans} theme={theme} />
          <MetricTile label="Repaid" value={metrics.repaidBNPLLoans} color={theme.ok} theme={theme} />
          <MetricTile label="Defaulted" value={metrics.defaultedBNPLLoans} color={theme.err} theme={theme} />
          <MetricTile label="Active" value={metrics.activeBNPLLoans} color={theme.info} theme={theme} />
          <MetricTile label="NFT Loans" value={metrics.totalNFTLoans} theme={theme} />
          <MetricTile label="NFT Repaid" value={metrics.repaidNFTLoans} color={theme.ok} theme={theme} />
          <MetricTile label="NFT Defaulted" value={metrics.defaultedNFTLoans} color={theme.err} theme={theme} />
          <MetricTile label="Installments" value={`${metrics.totalInstallmentsPaid}/${metrics.maxPossibleInstallments}`} theme={theme} />
          <MetricTile label="Collateral Claimed" value={metrics.collateralClaimed} color={theme.ok} theme={theme} />
          <MetricTile label="Still Locked" value={metrics.collateralLocked} color={theme.warn} theme={theme} />
          <MetricTile label="Overdue BNPL" value={metrics.lateBNPLLoans} color={theme.err} theme={theme} />
          <MetricTile label="On-Time BNPL" value={metrics.onTimeBNPLLoans} color={theme.ok} theme={theme} />
        </div>
        {metrics.totalBNPLVolume > 0n && (
          <div style={{
            marginTop: 16, padding: '10px 16px', borderRadius: 10,
            background: theme.surfaceAlt, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: 13, color: theme.text2 }}>Total BNPL Volume</span>
            <span style={{ fontWeight: 700, fontSize: 14, color: theme.text, fontFamily: 'monospace' }}>
              {parseFloat(formatEther(metrics.totalBNPLVolume)).toFixed(4)} BNB
            </span>
          </div>
        )}
        {metrics.totalNFTVolume > 0n && (
          <div style={{
            marginTop: 8, padding: '10px 16px', borderRadius: 10,
            background: theme.surfaceAlt, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: 13, color: theme.text2 }}>Total NFT Loan Volume</span>
            <span style={{ fontWeight: 700, fontSize: 14, color: theme.text, fontFamily: 'monospace' }}>
              {parseFloat(formatEther(metrics.totalNFTVolume)).toFixed(4)} BNB
            </span>
          </div>
        )}
      </div>

      {/* ── Tips to Improve ────────────────────────── */}
      <ImprovementTips score={score} metrics={metrics} theme={theme} isMobile={isMobile} />

      {/* ── Algorithm Transparency ─────────────────── */}
      <div style={{
        background: theme.cardBg, border: `1px solid ${theme.cardBorder}`,
        borderRadius: 20, padding: isMobile ? 20 : 28,
        boxShadow: theme.cardShadow,
      }}>
        <h3 style={{ color: theme.text, fontSize: 16, fontWeight: 700, marginTop: 0, marginBottom: 12 }}>
          How Aura Works
        </h3>
        <div style={{ fontSize: 13, color: theme.text2, lineHeight: 1.7 }}>
          <p style={{ margin: '0 0 8px' }}>
            Your Aura score is computed <strong style={{ color: theme.text }}>entirely from on-chain data</strong> — no centralized databases, no hidden inputs.
            It reads every loan you've taken on NexaPay (both BNPL and NFT-backed) and evaluates six key factors:
          </p>
          <ol style={{ margin: '8px 0', paddingLeft: 20 }}>
            <li><strong style={{ color: theme.text }}>Repayment Reliability (40%)</strong> — Loan completion rate & default penalty</li>
            <li><strong style={{ color: theme.text }}>Payment Discipline (25%)</strong> — Installment consistency & overdue status</li>
            <li><strong style={{ color: theme.text }}>Borrowing Experience (15%)</strong> — Total loans & account age</li>
            <li><strong style={{ color: theme.text }}>Portfolio Diversity (8%)</strong> — Using both BNPL and NFT lending</li>
            <li><strong style={{ color: theme.text }}>Collateral Behavior (6%)</strong> — Claiming vs. getting liquidated</li>
            <li><strong style={{ color: theme.text }}>NFT Lending Record (6%)</strong> — NFT loan repayment track record</li>
          </ol>
          <p style={{ margin: '8px 0 0' }}>
            Base score is <strong style={{ color: theme.text }}>500</strong>. Final score is clamped to <strong style={{ color: theme.text }}>0–1,000</strong>.
            The algorithm is deterministic — the same wallet always produces the same score.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Factor Card Component ────────────────────────────── */
function FactorCard({ factor: f, theme, isMobile }: { factor: AuraFactor; theme: ReturnType<typeof useTheme>['theme']; isMobile: boolean }) {
  const pct = f.score >= 0
    ? (f.score / f.maxScore) * 100
    : 0;
  const negPct = f.score < 0
    ? (Math.abs(f.score) / Math.abs(f.minScore)) * 100
    : 0;

  const barColor = f.score >= 0
    ? (f.score > f.maxScore * 0.6 ? theme.ok : theme.info)
    : theme.err;

  return (
    <div style={{
      padding: isMobile ? '14px 12px' : '14px 18px',
      borderRadius: 14,
      background: theme.surfaceAlt,
      border: `1px solid ${theme.lineLight}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>{f.icon}</span>
          <span style={{ fontWeight: 600, fontSize: 14, color: theme.text }}>{f.name}</span>
          <span style={{
            fontSize: 11, color: theme.text3, fontWeight: 500,
            background: theme.surfaceHover, padding: '2px 8px', borderRadius: 6,
          }}>
            {f.weight}
          </span>
        </div>
        <span style={{
          fontWeight: 800, fontSize: 16, fontFamily: 'monospace',
          color: f.score > 0 ? theme.ok : f.score < 0 ? theme.err : theme.text3,
        }}>
          {f.score > 0 ? '+' : ''}{f.score}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{
        height: 6, borderRadius: 3,
        background: theme.progressBg, overflow: 'hidden', marginBottom: 6,
      }}>
        {f.score >= 0 ? (
          <div style={{
            height: '100%', borderRadius: 3,
            background: barColor,
            width: `${Math.min(pct, 100)}%`,
            transition: 'width 1s ease-out',
          }} />
        ) : (
          <div style={{
            height: '100%', borderRadius: 3,
            background: theme.err,
            width: `${Math.min(negPct, 100)}%`,
            transition: 'width 1s ease-out',
            marginLeft: 'auto',
          }} />
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: theme.text3 }}>{f.description}</span>
        <span style={{ fontSize: 11, color: theme.text3, fontFamily: 'monospace' }}>
          {f.minScore} to +{f.maxScore}
        </span>
      </div>
    </div>
  );
}

/* ─── Metric Tile ──────────────────────────────────────── */
function MetricTile({ label, value, color, theme }: {
  label: string; value: number | string; color?: string; theme: ReturnType<typeof useTheme>['theme'];
}) {
  return (
    <div style={{
      padding: '14px 12px', borderRadius: 12,
      background: theme.surfaceAlt,
      border: `1px solid ${theme.lineLight}`,
      textAlign: 'center',
    }}>
      <div style={{
        fontWeight: 800, fontSize: 22, color: color || theme.text,
        fontFamily: 'monospace', fontVariantNumeric: 'tabular-nums',
        lineHeight: 1,
      }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: theme.text3, fontWeight: 500, marginTop: 6 }}>
        {label}
      </div>
    </div>
  );
}

/* ─── Improvement Tips ─────────────────────────────────── */
function ImprovementTips({ score, metrics: m, theme, isMobile }: {
  score: number; metrics: AuraMetrics; theme: ReturnType<typeof useTheme>['theme']; isMobile: boolean;
}) {
  const tips = useMemo(() => {
    const list: { tip: string; priority: 'high' | 'medium' | 'low' }[] = [];

    if (!m.hasHistory) {
      list.push({ tip: 'Take your first loan to start building your Aura score.', priority: 'high' });
      return list;
    }

    if (m.defaultedBNPLLoans > 0) {
      list.push({ tip: 'Defaults heavily damage your score. Avoid missing payments.', priority: 'high' });
    }
    if (m.lateBNPLLoans > 0) {
      list.push({ tip: `You have ${m.lateBNPLLoans} overdue BNPL loan(s). Pay them ASAP to stop score damage.`, priority: 'high' });
    }
    if (m.lateNFTLoans > 0) {
      list.push({ tip: `You have ${m.lateNFTLoans} overdue NFT loan(s). Repay before liquidation.`, priority: 'high' });
    }
    if (m.collateralLocked > 0) {
      list.push({ tip: `Claim your collateral on ${m.collateralLocked} repaid loan(s) to boost your collateral score.`, priority: 'medium' });
    }
    if (m.totalNFTLoans === 0 && m.totalBNPLLoans > 0) {
      list.push({ tip: 'Try an NFT-backed loan to earn the Portfolio Diversity bonus (+50).', priority: 'medium' });
    }
    if (m.totalBNPLLoans === 0 && m.totalNFTLoans > 0) {
      list.push({ tip: 'Take a BNPL loan to earn the Portfolio Diversity bonus (+50).', priority: 'medium' });
    }
    if (m.totalBNPLLoans + m.totalNFTLoans < 3) {
      list.push({ tip: 'Take more loans and repay them to build your Borrowing Experience score.', priority: 'low' });
    }
    if (score >= 850) {
      list.push({ tip: 'Your Aura is Legendary! Keep up the flawless record.', priority: 'low' });
    }

    return list;
  }, [score, m]);

  if (tips.length === 0) return null;

  const priorityColors: Record<string, string> = {
    high: theme.err,
    medium: theme.warn,
    low: theme.ok,
  };
  const priorityBg: Record<string, string> = {
    high: theme.errBg,
    medium: theme.warnBg,
    low: theme.okBg,
  };

  return (
    <div style={{
      background: theme.cardBg, border: `1px solid ${theme.cardBorder}`,
      borderRadius: 20, padding: isMobile ? 20 : 28, marginBottom: 32,
      boxShadow: theme.cardShadow,
    }}>
      <h3 style={{ color: theme.text, fontSize: 16, fontWeight: 700, marginTop: 0, marginBottom: 16 }}>
        💡 How to Improve Your Aura
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {tips.map((t, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px',
            borderRadius: 12, background: priorityBg[t.priority],
            border: `1px solid ${priorityColors[t.priority]}25`,
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%', marginTop: 5, flexShrink: 0,
              background: priorityColors[t.priority],
            }} />
            <span style={{ fontSize: 13, color: theme.text, lineHeight: 1.5 }}>{t.tip}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
