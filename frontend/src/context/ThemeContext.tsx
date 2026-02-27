import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

/* ═══════════════════════════════════════════════════════════
   Theme Context — Light / Dark mode
   ═══════════════════════════════════════════════════════════ */

// ── Light palette ───────────────────────────────────────
const light = {
  mode: 'light' as 'light' | 'dark',
  // page
  pageBg: '#FAFBFC',
  surfaceBg: '#FFFFFF',
  surfaceAlt: '#F4F6F8',
  surfaceHover: '#EEF1F5',
  // text
  text: '#1A2332',
  text2: '#556A7E',
  text3: '#8B99AB',
  // borders
  line: '#E2E8F0',
  lineLight: '#EDF1F6',
  // brand
  brand: '#F97316',
  brandLight: '#FDBA74',
  brandDark: '#EA580C',
  brandDarker: '#C2410C',
  brand50: '#FFF7ED',
  brand100: '#FFEDD5',
  brand200: '#FED7AA',
  // navy
  navy: '#1E3A5F',
  navyLight: '#2A4A73',
  navyDark: '#102A43',
  navyDarker: '#0B1D33',
  // feedback
  ok: '#22C55E',
  okBg: '#F0FDF4',
  err: '#EF4444',
  errBg: '#FEF2F2',
  info: '#3B82F6',
  infoBg: '#EFF6FF',
  warn: '#F59E0B',
  warnBg: '#FFFBEB',
  // nav
  navBg: 'rgba(255,255,255,0.85)',
  navPillBg: '#F4F6F8',
  navPillActive: '#FFFFFF',
  navPillActiveShadow: '0 1px 3px rgba(0,0,0,0.06)',
  // card
  cardBg: '#FFFFFF',
  cardBorder: '#E2E8F0',
  cardShadow: '0 1px 3px rgba(0,0,0,0.04)',
  // modal
  modalOverlay: 'rgba(15,23,42,0.4)',
  // footer
  footerBg: '#FFFFFF',
  // hero
  heroGrad: 'linear-gradient(135deg, #1E3A5F 0%, #162D4A 50%, #0F2137 100%)',
  heroOrb: 'rgba(249,115,22,0.12)',
  heroText: '#FFFFFF',
  heroTextMuted: 'rgba(255,255,255,0.65)',
  heroTextFaint: 'rgba(255,255,255,0.35)',
  heroChipBg: 'rgba(255,255,255,0.08)',
  heroChipBorder: 'rgba(255,255,255,0.12)',
  heroBorder: 'rgba(255,255,255,0.1)',
  // progress bar bg
  progressBg: '#F0F3F7',
  // input
  inputBg: '#FAFBFC',
  inputBorder: '#E2E8F0',
  // misc
  codeBg: '#F4F6F8',
};

// ── Dark palette ────────────────────────────────────────
const dark: typeof light = {
  mode: 'dark',
  pageBg: '#0C1222',
  surfaceBg: '#131B2E',
  surfaceAlt: '#1A2540',
  surfaceHover: '#1E2D4A',
  text: '#E8EDF5',
  text2: '#94A3B8',
  text3: '#64748B',
  line: '#1E2D4A',
  lineLight: '#1A2540',
  brand: '#F97316',
  brandLight: '#FDBA74',
  brandDark: '#EA580C',
  brandDarker: '#C2410C',
  brand50: 'rgba(249,115,22,0.08)',
  brand100: 'rgba(249,115,22,0.12)',
  brand200: 'rgba(249,115,22,0.18)',
  navy: '#1E3A5F',
  navyLight: '#2A4A73',
  navyDark: '#0F2137',
  navyDarker: '#0B1D33',
  ok: '#22C55E',
  okBg: 'rgba(34,197,94,0.1)',
  err: '#EF4444',
  errBg: 'rgba(239,68,68,0.1)',
  info: '#3B82F6',
  infoBg: 'rgba(59,130,246,0.1)',
  warn: '#F59E0B',
  warnBg: 'rgba(245,158,11,0.1)',
  navBg: 'rgba(12,18,34,0.9)',
  navPillBg: '#1A2540',
  navPillActive: '#1E2D4A',
  navPillActiveShadow: '0 1px 3px rgba(0,0,0,0.2)',
  cardBg: '#131B2E',
  cardBorder: '#1E2D4A',
  cardShadow: '0 1px 3px rgba(0,0,0,0.2)',
  modalOverlay: 'rgba(0,0,0,0.6)',
  footerBg: '#0F1829',
  heroGrad: 'linear-gradient(135deg, #0F2137 0%, #0B1D33 50%, #070E1A 100%)',
  heroOrb: 'rgba(249,115,22,0.18)',
  heroText: '#E8EDF5',
  heroTextMuted: 'rgba(232,237,245,0.6)',
  heroTextFaint: 'rgba(232,237,245,0.3)',
  heroChipBg: 'rgba(255,255,255,0.06)',
  heroChipBorder: 'rgba(255,255,255,0.08)',
  heroBorder: 'rgba(255,255,255,0.06)',
  progressBg: '#1A2540',
  inputBg: '#1A2540',
  inputBorder: '#1E2D4A',
  codeBg: '#1A2540',
};

export type Theme = typeof light;

interface ThemeCtx {
  theme: Theme;
  isDark: boolean;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeCtx>({
  theme: light,
  isDark: false,
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(() => {
    try {
      return localStorage.getItem('nexapay-theme') === 'dark';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    localStorage.setItem('nexapay-theme', isDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggle = () => setIsDark(prev => !prev);
  const theme = isDark ? dark : light;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
