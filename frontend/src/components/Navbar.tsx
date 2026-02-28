import { Link, useLocation } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { useTheme } from '../context/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';
import { useState } from 'react';
import { IconSun, IconMoon, IconMenu, IconX, IconLogout } from './Icons';

const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/nft-loans', label: 'NFT Loans' },
  { to: '/merchant', label: 'Merchant' },
  { to: '/aura', label: 'Aura ✨' },
];

export default function Navbar() {
  const { address, isConnecting, connect, disconnect } = useWeb3();
  const { theme, isDark, toggle } = useTheme();
  const { isMobile } = useResponsive();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const short = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: theme.navBg,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${theme.line}`,
        transition: 'background 0.3s, border-color 0.3s',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: isMobile ? '0 16px' : '0 48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: isMobile ? 60 : 72,
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 12, textDecoration: 'none' }}>
          <div
            style={{
              width: isMobile ? 34 : 40,
              height: isMobile ? 34 : 40,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #F97316, #EA580C)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(249,115,22,0.25)',
            }}
          >
            <span style={{ color: 'white', fontWeight: 800, fontSize: isMobile ? 15 : 18 }}>T</span>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: isMobile ? 15 : 17, color: theme.text, letterSpacing: '-0.02em' }}>NexaPay</div>
            {!isMobile && <div style={{ fontSize: 11, color: theme.text3, marginTop: -2 }}>BNPL Protocol</div>}
          </div>
        </Link>

        {/* Desktop Nav Links */}
        {!isMobile && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: theme.navPillBg,
              borderRadius: 16,
              padding: 4,
            }}
          >
            {LINKS.map((link) => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    padding: '8px 20px',
                    borderRadius: 12,
                    fontSize: 14,
                    fontWeight: 500,
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    background: active ? theme.navPillActive : 'transparent',
                    color: active ? theme.text : theme.text2,
                    boxShadow: active ? theme.navPillActiveShadow : 'none',
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 12 }}>
          {/* Theme Toggle */}
          <button
            className="theme-toggle"
            onClick={toggle}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Light mode' : 'Dark mode'}
          >
            <div className="toggle-knob">
              {isDark ? <IconMoon size={13} color="#FDBA74" /> : <IconSun size={13} color="#F97316" />}
            </div>
          </button>

          {address ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {!isMobile && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 16px',
                    borderRadius: 14,
                    background: theme.surfaceAlt,
                    border: `1px solid ${theme.line}`,
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: 99, background: theme.ok }} />
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: theme.text2 }}>{short}</span>
                </div>
              )}
              <button
                onClick={disconnect}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: theme.text3,
                  transition: 'all 0.2s',
                }}
                title="Disconnect"
              >
                <IconLogout size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={connect}
              disabled={isConnecting}
              style={{
                padding: isMobile ? '8px 16px' : '10px 24px',
                borderRadius: 12,
                border: 'none',
                background: 'linear-gradient(135deg, #F97316, #EA580C)',
                color: 'white',
                fontWeight: 600,
                fontSize: isMobile ? 13 : 14,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(249,115,22,0.35)',
                transition: 'all 0.2s',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {isConnecting ? 'Connecting...' : isMobile ? 'Connect' : 'Connect Wallet'}
            </button>
          )}

          {/* Mobile toggle */}
          {isMobile && (
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                border: 'none',
                background: theme.surfaceAlt,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.text2,
              }}
            >
              {mobileOpen ? <IconX size={18} /> : <IconMenu size={18} />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && isMobile && (
        <div style={{ borderTop: `1px solid ${theme.line}`, background: theme.surfaceBg, padding: '16px 16px' }} className="anim-down">
          {LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              style={{
                display: 'block',
                padding: '12px 16px',
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none',
                color: location.pathname === link.to ? theme.brand : theme.text2,
                background: location.pathname === link.to ? theme.brand50 : 'transparent',
                marginBottom: 4,
              }}
            >
              {link.label}
            </Link>
          ))}

          {/* Show address in mobile dropdown */}
          {address && (
            <div style={{ padding: '12px 16px', marginTop: 4, borderTop: `1px solid ${theme.line}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: 99, background: theme.ok }} />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: theme.text3 }}>{short}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
