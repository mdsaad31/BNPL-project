import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import DevPanel from './DevPanel';
import { useTheme } from '../context/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';

export default function Layout() {
  const { theme } = useTheme();
  const { isMobile, isTablet } = useResponsive();

  const px = isMobile ? 16 : isTablet ? 32 : 48;
  const pt = isMobile ? 80 : 120;
  const pb = isMobile ? 48 : 96;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: theme.pageBg, transition: 'background 0.3s' }}>
      <Navbar />

      {/* Main content */}
      <main
        style={{
          flex: 1,
          width: '100%',
          maxWidth: 1200,
          margin: '0 auto',
          padding: `${pt}px ${px}px ${pb}px`,
        }}
      >
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${theme.line}`, background: theme.footerBg, transition: 'background 0.3s, border-color 0.3s' }}>
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: isMobile ? '32px 16px' : '48px 48px',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            flexWrap: 'wrap',
            alignItems: isMobile ? 'flex-start' : 'center',
            justifyContent: 'space-between',
            gap: isMobile ? 16 : 24,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #F97316, #EA580C)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>T</span>
            </div>
            <span style={{ fontWeight: 700, color: theme.text, fontSize: 15 }}>TrustPay</span>
            {!isMobile && (
              <>
                <span style={{ color: theme.line }}>|</span>
                <span style={{ fontSize: 13, color: theme.text3 }}>Non-custodial BNPL on BNB Chain</span>
              </>
            )}
          </div>
          {!isMobile && (
            <p style={{ fontSize: 13, color: theme.text3, textAlign: 'center' }}>
              Built with mass amounts of caffeine and impeccable smart contracts.
            </p>
          )}
          <p style={{ fontSize: 12, color: theme.text3 }}>© 2026 TrustPay</p>
        </div>
      </footer>

      <DevPanel />
    </div>
  );
}
