import { useState } from 'react';
import { useDevTime } from '../hooks/useDevTime';
import { useWeb3 } from '../context/Web3Context';
import { useTheme } from '../context/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';
import { IconBolt, IconX, IconClock, IconCheck } from './Icons';

export default function DevPanel() {
  const { address } = useWeb3();
  const { theme } = useTheme();
  const { isMobile } = useResponsive();
  const { fastForwardDays, fastForwardWeeks, getCurrentTimestamp } = useDevTime();
  const [open, setOpen] = useState(false);
  const [timestamp, setTimestamp] = useState('');
  const [status, setStatus] = useState('');

  if (!address) return null;

  const jump = async (label: string, fn: () => Promise<void>) => {
    setStatus(`Jumping ${label}...`);
    try {
      await fn();
      const ts = await getCurrentTimestamp();
      setTimestamp(new Date(ts * 1000).toLocaleString());
      setStatus(`Done: ${label}`);
    } catch {
      setStatus('Time broke');
    }
  };

  const refresh = async () => {
    try {
      const ts = await getCurrentTimestamp();
      setTimestamp(new Date(ts * 1000).toLocaleString());
    } catch {
      setTimestamp('???');
    }
  };

  const panel: React.CSSProperties = {
    position: 'fixed',
    bottom: isMobile ? 16 : 24,
    right: isMobile ? 16 : 24,
    zIndex: 200,
  };

  const fab: React.CSSProperties = {
    width: isMobile ? 44 : 48,
    height: isMobile ? 44 : 48,
    borderRadius: 16,
    background: theme.navy,
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 4px 20px rgba(30,58,95,0.3)`,
    transition: 'all 0.2s',
  };

  const card: React.CSSProperties = {
    width: isMobile ? 260 : 280,
    borderRadius: 20,
    background: theme.cardBg,
    border: `1px solid ${theme.cardBorder}`,
    boxShadow: `0 20px 60px rgba(0,0,0,${theme.mode === 'dark' ? '0.3' : '0.1'})`,
    overflow: 'hidden',
  };

  const btnStyle: React.CSSProperties = {
    padding: '10px 0',
    borderRadius: 10,
    border: `1px solid ${theme.line}`,
    background: theme.surfaceAlt,
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
    color: theme.text2,
    fontFamily: "'Inter', sans-serif",
    transition: 'all 0.15s',
  };

  return (
    <div style={panel}>
      {!open ? (
        <button style={fab} onClick={() => { setOpen(true); refresh(); }} title="Dev Time Travel">
          <IconBolt size={20} color="white" />
        </button>
      ) : (
        <div style={card} className="anim-down">
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${theme.lineLight}`, background: theme.surfaceAlt }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconBolt size={16} color={theme.brand} />
              <span style={{ fontWeight: 600, fontSize: 14, color: theme.text }}>Time Machine</span>
            </div>
            <button onClick={() => setOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: theme.text3, display: 'flex', alignItems: 'center' }}>
              <IconX size={16} />
            </button>
          </div>

          <div style={{ padding: '20px' }}>
            <p style={{ fontSize: 12, color: theme.text3, fontStyle: 'italic', marginBottom: 16 }}>
              "Time is money" — except here it's free.
            </p>

            {timestamp && (
              <div style={{ padding: '10px 14px', borderRadius: 12, background: theme.surfaceAlt, border: `1px solid ${theme.line}`, marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: theme.text3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <IconClock size={10} color={theme.text3} /> Block Time
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: theme.text2 }}>{timestamp}</div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: '+1 Day', fn: () => fastForwardDays(1) },
                { label: '+3 Days', fn: () => fastForwardDays(3) },
                { label: '+1 Week', fn: () => fastForwardWeeks(1) },
                { label: '+2 Weeks', fn: () => fastForwardWeeks(2) },
              ].map(({ label, fn }) => (
                <button key={label} style={btnStyle} onClick={() => jump(label, fn)}>
                  {label}
                </button>
              ))}
            </div>

            {status && (
              <p style={{ fontSize: 12, color: theme.text3, textAlign: 'center', marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                {status.startsWith('Done') && <IconCheck size={12} color={theme.ok} />}
                {status}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
