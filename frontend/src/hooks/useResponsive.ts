import { useState, useEffect } from 'react';

/* ═══════════════════════════════════════════════════════════
   useResponsive — Breakpoint hook for inline-style responsiveness
   ═══════════════════════════════════════════════════════════ */

interface Responsive {
  isMobile: boolean;   // < 768
  isTablet: boolean;   // 768–1024
  isDesktop: boolean;  // > 1024
  width: number;
}

const queries = {
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1024px)',
  desktop: '(min-width: 1025px)',
} as const;

function getState(): Responsive {
  if (typeof window === 'undefined') return { isMobile: false, isTablet: false, isDesktop: true, width: 1200 };
  return {
    isMobile: window.matchMedia(queries.mobile).matches,
    isTablet: window.matchMedia(queries.tablet).matches,
    isDesktop: window.matchMedia(queries.desktop).matches,
    width: window.innerWidth,
  };
}

export function useResponsive(): Responsive {
  const [state, setState] = useState(getState);

  useEffect(() => {
    const handler = () => setState(getState());
    const mql = Object.values(queries).map(q => window.matchMedia(q));
    mql.forEach(m => m.addEventListener('change', handler));
    window.addEventListener('resize', handler);
    return () => {
      mql.forEach(m => m.removeEventListener('change', handler));
      window.removeEventListener('resize', handler);
    };
  }, []);

  return state;
}
