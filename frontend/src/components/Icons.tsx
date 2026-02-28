/* ═══════════════════════════════════════════════════════════
   SVG Icon Library — Replaces all emoji usage
   Clean, crisp, professional look
   ═══════════════════════════════════════════════════════════ */

import { useId } from 'react';
import type { CSSProperties } from 'react';

interface P {
  size?: number;
  color?: string;
  style?: CSSProperties;
  className?: string;
}

const d = (size = 24, color = 'currentColor') => ({ size, color });

// ── Lock / Security ─────────────────────────────────────
export function IconLock({ size, color, style, className }: P) {
  const { size: s, color: c } = d(size, color);
  return (
    <svg className={className} style={style} width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}

// ── Shield ──────────────────────────────────────────────
export function IconShield({ size, color, style, className }: P) {
  const { size: s, color: c } = d(size, color);
  return (
    <svg className={className} style={style} width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}

// ── Bolt / Lightning ────────────────────────────────────
export function IconBolt({ size, color, style, className }: P) {
  const { size: s, color: c } = d(size, color);
  return (
    <svg className={className} style={style} width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  );
}

// ── Cart / Shopping ─────────────────────────────────────
export function IconCart({ size, color, style, className }: P) {
  const { size: s, color: c } = d(size, color);
  return (
    <svg className={className} style={style} width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  );
}

// ── Package / Box ───────────────────────────────────────
export function IconPackage({ size, color, style, className }: P) {
  const { size: s, color: c } = d(size, color);
  return (
    <svg className={className} style={style} width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  );
}

// ── Checkmark Circle ────────────────────────────────────
export function IconCheck({ size, color, style, className }: P) {
  const { size: s, color: c } = d(size, color);
  return (
    <svg className={className} style={style} width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  );
}

// ── Skull (defaulted) ───────────────────────────────────
export function IconSkull({ size, color, style, className }: P) {
  const { size: s, color: c } = d(size, color);
  return (
    <svg className={className} style={style} width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="10" r="8"/><circle cx="9" cy="10" r="1.5" fill={c}/><circle cx="15" cy="10" r="1.5" fill={c}/>
      <path d="M8 18v4h2v-2h4v2h2v-4"/>
    </svg>
  );
}

// ── Clock / Timer ───────────────────────────────────────
export function IconClock({ size, color, style, className }: P) {
  const { size: s, color: c } = d(size, color);
  return (
    <svg className={className} style={style} width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

// ── Clipboard / List ────────────────────────────────────
export function IconClipboard({ size, color, style, className }: P) {
  const { size: s, color: c } = d(size, color);
  return (
    <svg className={className} style={style} width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    </svg>
  );
}

// ── Coins / Money ───────────────────────────────────────
export function IconCoins({ size, color, style, className }: P) {
  const { size: s, color: c } = d(size, color);
  return (
    <svg className={className} style={style} width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/>
      <line x1="7" y1="6" x2="7.01" y2="6"/><line x1="9" y1="10" x2="9.01" y2="10"/>
    </svg>
  );
}

// ── Store / Merchant ────────────────────────────────────
export function IconStore({ size, color, style, className }: P) {
  const { size: s, color: c } = d(size, color);
  return (
    <svg className={className} style={style} width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}

// ── Eye / Browse ────────────────────────────────────────
export function IconEye({ size, color, style, className }: P) {
  const { size: s, color: c } = d(size, color);
  return (
    <svg className={className} style={style} width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

// ── Calendar ────────────────────────────────────────────
export function IconCalendar({ size, color, style, className }: P) {
  const { size: s, color: c } = d(size, color);
  return (
    <svg className={className} style={style} width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}

// ── Gift / Reclaim ──────────────────────────────────────
export function IconGift({ size, color, style, className }: P) {
  const { size: s, color: c } = d(size, color);
  return (
    <svg className={className} style={style} width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/>
      <line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
    </svg>
  );
}

// ── Alert / Warning ─────────────────────────────────────
export function IconAlert({ size, color, style, className }: P) {
  const { size: s, color: c } = d(size, color);
  return (
    <svg className={className} style={style} width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}

// ── Wallet ──────────────────────────────────────────────
export function IconWallet({ size, color, style, className }: P) {
  const { size: s, color: c } = d(size, color);
  return (
    <svg className={className} style={style} width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
      <path d="M18 12a1 1 0 0 0 0 4h4v-4z"/>
    </svg>
  );
}

// ── Sun ─────────────────────────────────────────────────
export function IconSun({ size, color, style, className }: P) {
  const { size: s, color: c } = d(size, color);
  return (
    <svg className={className} style={style} width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}

// ── Moon ─────────────────────────────────────────────────
export function IconMoon({ size, color, style, className }: P) {
  const { size: s, color: c } = d(size, color);
  return (
    <svg className={className} style={style} width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

// ── Chevron Down ────────────────────────────────────────
export function IconChevronDown({ size, color, style, className }: P) {
  const { size: s, color: c } = d(size, color);
  return (
    <svg className={className} style={style} width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}

// ── Plus ────────────────────────────────────────────────
export function IconPlus({ size, color, style, className }: P) {
  const { size: s, color: c } = d(size, color);
  return (
    <svg className={className} style={style} width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}

// ── X / Close ───────────────────────────────────────────
export function IconX({ size, color, style, className }: P) {
  const { size: s, color: c } = d(size, color);
  return (
    <svg className={className} style={style} width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

// ── Menu (hamburger) ────────────────────────────────────
export function IconMenu({ size, color, style, className }: P) {
  const { size: s, color: c } = d(size, color);
  return (
    <svg className={className} style={style} width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );
}

// ── Logout ──────────────────────────────────────────────
export function IconLogout({ size, color, style, className }: P) {
  const { size: s, color: c } = d(size, color);
  return (
    <svg className={className} style={style} width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}

// ── Arrow Right ─────────────────────────────────────────
export function IconArrowRight({ size, color, style, className }: P) {
  const { size: s, color: c } = d(size, color);
  return (
    <svg className={className} style={style} width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  );
}

// ── Globe / Chain ───────────────────────────────────────
export function IconGlobe({ size, color, style, className }: P) {
  const { size: s, color: c } = d(size, color);
  return (
    <svg className={className} style={style} width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  );
}

// ── Sparkles ────────────────────────────────────────────
export function IconSparkles({ size, color, style, className }: P) {
  const { size: s, color: c } = d(size, color);
  return (
    <svg className={className} style={style} width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/>
    </svg>
  );
}

// ── Construction / Building ─────────────────────────────
export function IconConstruction({ size, color, style, className }: P) {
  const { size: s, color: c } = d(size, color);
  return (
    <svg className={className} style={style} width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 6V2m-4 4V4m8 2V4"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
    </svg>
  );
}

// ── Dot status indicator ────────────────────────────────
export function IconDot({ size = 8, color, style, className }: P) {
  return (
    <svg className={className} style={style} width={size} height={size} viewBox="0 0 8 8">
      <circle cx="4" cy="4" r="4" fill={color || 'currentColor'} />
    </svg>
  );
}

// ── Chart / Stats ───────────────────────────────────────
export function IconChart({ size, color, style, className }: P) {
  const { size: s, color: c } = d(size, color);
  return (
    <svg className={className} style={style} width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  );
}

// ── Question / Help ─────────────────────────────────────
export function IconHelp({ size, color, style, className }: P) {
  const { size: s, color: c } = d(size, color);
  return (
    <svg className={className} style={style} width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}

// ── NFT / Image ─────────────────────────────────────────
export function IconNFT({ size, color, style, className }: P) {
  const { size: s, color: c } = d(size, color);
  return (
    <svg className={className} style={style} width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  );
}

// ── Diamond / Gem ───────────────────────────────────────
export function IconDiamond({ size, color, style, className }: P) {
  const { size: s, color: c } = d(size, color);
  return (
    <svg className={className} style={style} width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12l4 6-10 13L2 9z"/>
      <path d="M2 9h20"/>
      <path d="M10 3l-2 6 4 13"/>
      <path d="M14 3l2 6-4 13"/>
    </svg>
  );
}

// ── Bank / Vault ────────────────────────────────────────
export function IconBank({ size, color, style, className }: P) {
  const { size: s, color: c } = d(size, color);
  return (
    <svg className={className} style={style} width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18"/><path d="M3 10h18"/><path d="M5 6l7-3 7 3"/>
      <line x1="4" y1="10" x2="4" y2="21"/><line x1="20" y1="10" x2="20" y2="21"/>
      <line x1="8" y1="14" x2="8" y2="17"/><line x1="12" y1="14" x2="12" y2="17"/>
      <line x1="16" y1="14" x2="16" y2="17"/>
    </svg>
  );
}

// ── Refresh / Sync ──────────────────────────────────────
export function IconRefresh({ size, color, style, className }: P) {
  const { size: s, color: c } = d(size, color);
  return (
    <svg className={className} style={style} width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </svg>
  );
}

// ── Aura / Sparkle Star ─────────────────────────────────
export function IconAura({ size, color, style, className }: P) {
  const { size: s, color: c } = d(size, color);
  return (
    <svg className={className} style={style} width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L14.09 8.26L20 9.27L15.55 13.97L16.91 20L12 16.9L7.09 20L8.45 13.97L4 9.27L9.91 8.26L12 2Z"/>
      <circle cx="12" cy="12" r="3" strokeWidth="1.2" opacity="0.5"/>
    </svg>
  );
}

// ── Link / Chain ────────────────────────────────────────
export function IconLink({ size, color, style, className }: P) {
  const { size: s, color: c } = d(size, color);
  return (
    <svg className={className} style={style} width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  );
}

// ── Star (filled) ───────────────────────────────────────
export function IconStar({ size, color, style, className }: P) {
  const { size: s, color: c } = d(size, color);
  return (
    <svg className={className} style={style} width={s} height={s} viewBox="0 0 24 24" fill={c} stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  );
}

// ── Heart / Strong ──────────────────────────────────────
export function IconHeart({ size, color, style, className }: P) {
  const { size: s, color: c } = d(size, color);
  return (
    <svg className={className} style={style} width={s} height={s} viewBox="0 0 24 24" fill={c} stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
}

// ── Trending Up / Rising ────────────────────────────────
export function IconTrendUp({ size, color, style, className }: P) {
  const { size: s, color: c } = d(size, color);
  return (
    <svg className={className} style={style} width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  );
}

// ── Circle (filled) / Neutral ───────────────────────────
export function IconCircle({ size, color, style, className }: P) {
  const { size: s, color: c } = d(size, color);
  return (
    <svg className={className} style={style} width={s} height={s} viewBox="0 0 24 24" fill={c} stroke={c} strokeWidth="1.5">
      <circle cx="12" cy="12" r="9"/>
    </svg>
  );
}

// ── Triangle Warning / Weak ─────────────────────────────
export function IconTriangle({ size, color, style, className }: P) {
  const { size: s, color: c } = d(size, color);
  return (
    <svg className={className} style={style} width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}

// ── Zap Off / Broken ────────────────────────────────────
export function IconZapOff({ size, color, style, className }: P) {
  const { size: s, color: c } = d(size, color);
  return (
    <svg className={className} style={style} width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="12.41 6.75 13 2 10.57 4.92"/>
      <polyline points="18.57 12.91 21 10 15.66 10"/>
      <polyline points="8 8 3 14 12 14 11 22 16 16"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

// ── Target / Bullseye ───────────────────────────────────
export function IconTarget({ size, color, style, className }: P) {
  const { size: s, color: c } = d(size, color);
  return (
    <svg className={className} style={style} width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  );
}

// ── Flag ────────────────────────────────────────────────
export function IconFlag({ size, color, style, className }: P) {
  const { size: s, color: c } = d(size, color);
  return (
    <svg className={className} style={style} width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
      <line x1="4" y1="22" x2="4" y2="15"/>
    </svg>
  );
}

// ── Lightbulb ───────────────────────────────────────────
export function IconLightbulb({ size, color, style, className }: P) {
  const { size: s, color: c } = d(size, color);
  return (
    <svg className={className} style={style} width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6"/>
      <path d="M10 22h4"/>
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5.76.76 1.23 1.52 1.41 2.5"/>
    </svg>
  );
}

// ── NexaPay 3D Logo (BNB-style diamond) ─────────────────
export function IconNexaLogo({ size = 40, style, className }: Omit<P, 'color'>) {
  const uid = useId().replace(/:/g, '');
  const g = (n: string) => `nl${uid}${n}`;

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" style={style} className={className}>
      <defs>
        {/* Main face gradient — BNB gold blending into NexaPay orange */}
        <linearGradient id={g('m')} x1="15" y1="15" x2="85" y2="85" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F0B90B"/>
          <stop offset="40%" stopColor="#F9A825"/>
          <stop offset="70%" stopColor="#F97316"/>
          <stop offset="100%" stopColor="#EA580C"/>
        </linearGradient>
        {/* Top bevel — bright highlight */}
        <linearGradient id={g('hi')} x1="50" y1="6" x2="50" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFE082"/>
          <stop offset="100%" stopColor="#FFB74D"/>
        </linearGradient>
        {/* Bottom bevel — deep shadow */}
        <linearGradient id={g('lo')} x1="50" y1="50" x2="50" y2="96" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#BF360C"/>
          <stop offset="100%" stopColor="#6D2008"/>
        </linearGradient>
        {/* Shine overlay — glass reflection */}
        <linearGradient id={g('sh')} x1="25" y1="10" x2="70" y2="55" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="white" stopOpacity={0.45}/>
          <stop offset="100%" stopColor="white" stopOpacity={0}/>
        </linearGradient>
        {/* Inner ring glow */}
        <radialGradient id={g('rg')} cx="50" cy="50" r="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="white" stopOpacity={0.08}/>
          <stop offset="100%" stopColor="white" stopOpacity={0}/>
        </radialGradient>
        {/* Nexus core glow */}
        <radialGradient id={g('cg')} cx="50" cy="50" r="8" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF8E1" stopOpacity={1}/>
          <stop offset="40%" stopColor="#FFD54F" stopOpacity={0.9}/>
          <stop offset="100%" stopColor="#F0B90B" stopOpacity={0}/>
        </radialGradient>
        {/* Network line gradient */}
        <linearGradient id={g('nl')} x1="50" y1="35" x2="50" y2="65" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF8E1" stopOpacity={0.7}/>
          <stop offset="50%" stopColor="#FFD54F" stopOpacity={0.45}/>
          <stop offset="100%" stopColor="white" stopOpacity={0.15}/>
        </linearGradient>
        {/* Outer node glow */}
        <filter id={g('ng2')} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        {/* Drop shadow */}
        <filter id={g('ds')} x="-15%" y="-10%" width="130%" height="135%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#F97316" floodOpacity={0.35}/>
        </filter>
      </defs>

      <g filter={`url(#${g('ds')})`}>
        {/* ── 3D Bevel edges ── */}
        {/* Top-right bevel (bright) */}
        <polygon points="50,6 96,50 84,50 50,18" fill={`url(#${g('hi')})`} opacity={0.92}/>
        {/* Top-left bevel (warm light) */}
        <polygon points="50,6 4,50 16,50 50,18" fill="#FDBA74" opacity={0.88}/>
        {/* Bottom-right bevel (dark) */}
        <polygon points="96,50 50,94 50,82 84,50" fill="#9A3412" opacity={0.8}/>
        {/* Bottom-left bevel (deepest shadow) */}
        <polygon points="4,50 50,94 50,82 16,50" fill={`url(#${g('lo')})`} opacity={0.78}/>

        {/* ── Main diamond face ── */}
        <polygon points="50,18 84,50 50,82 16,50" fill={`url(#${g('m')})`}/>

        {/* ── Shine (glass reflection on top half) ── */}
        <polygon points="50,18 84,50 50,50 16,50" fill={`url(#${g('sh')})`}/>

        {/* ── Soft inner radial glow ── */}
        <circle cx="50" cy="50" r="28" fill={`url(#${g('rg')})`}/>

        {/* ── Inner diamond ring (BNB signature) ── */}
        <polygon points="50,30 72,50 50,70 28,50" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={1.2}/>

        {/* ── Nexus constellation ── */}
        <g opacity={0.92}>
          {/* Radial spokes — 6 directions */}
          <line x1="50" y1="50" x2="50" y2="33" stroke={`url(#${g('nl')})`} strokeWidth={1.1}/>
          <line x1="50" y1="50" x2="50" y2="67" stroke={`url(#${g('nl')})`} strokeWidth={1.1}/>
          <line x1="50" y1="50" x2="64.7" y2="41.5" stroke={`url(#${g('nl')})`} strokeWidth={1.1}/>
          <line x1="50" y1="50" x2="35.3" y2="58.5" stroke={`url(#${g('nl')})`} strokeWidth={1.1}/>
          <line x1="50" y1="50" x2="64.7" y2="58.5" stroke={`url(#${g('nl')})`} strokeWidth={1.1}/>
          <line x1="50" y1="50" x2="35.3" y2="41.5" stroke={`url(#${g('nl')})`} strokeWidth={1.1}/>

          {/* Hex ring connecting outer nodes */}
          <polygon
            points="50,33 64.7,41.5 64.7,58.5 50,67 35.3,58.5 35.3,41.5"
            fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={0.7}
          />

          {/* Outer nodes — glowing dots at hex vertices */}
          <g filter={`url(#${g('ng2')})`}>
            <circle cx="50" cy="33" r="2.2" fill="#FFE082"/>
            <circle cx="64.7" cy="41.5" r="2.2" fill="#FFD54F"/>
            <circle cx="64.7" cy="58.5" r="2" fill="#FDBA74"/>
            <circle cx="50" cy="67" r="2" fill="#FFB74D"/>
            <circle cx="35.3" cy="58.5" r="2" fill="#FDBA74"/>
            <circle cx="35.3" cy="41.5" r="2.2" fill="#FFD54F"/>
          </g>

          {/* Mid-spoke accent nodes */}
          <circle cx="57.3" cy="37.8" r="1" fill="white" fillOpacity={0.45}/>
          <circle cx="42.7" cy="62.2" r="1" fill="white" fillOpacity={0.3}/>
          <circle cx="57.3" cy="62.2" r="1" fill="white" fillOpacity={0.3}/>
          <circle cx="42.7" cy="37.8" r="1" fill="white" fillOpacity={0.45}/>
          <circle cx="50" cy="41.5" r="0.8" fill="white" fillOpacity={0.35}/>
          <circle cx="50" cy="58.5" r="0.8" fill="white" fillOpacity={0.25}/>

          {/* Central glowing core */}
          <circle cx="50" cy="50" r="8" fill={`url(#${g('cg')})`}/>
          <circle cx="50" cy="50" r="3.5" fill="#FFF8E1" fillOpacity={0.95}/>
          <circle cx="50" cy="50" r="1.8" fill="white"/>
        </g>

        {/* ── Corner satellite diamonds (BNB homage) ── */}
        <polygon points="50,1 53.5,6 50,11 46.5,6" fill="#FCD34D" opacity={0.9}/>
        <polygon points="50,89 53.5,94 50,99 46.5,94" fill="#7C2D12" opacity={0.55}/>
        <polygon points="1,50 6,46.5 11,50 6,53.5" fill="#FDBA74" opacity={0.75}/>
        <polygon points="89,50 94,46.5 99,50 94,53.5" fill="#9A3412" opacity={0.5}/>
      </g>
    </svg>
  );
}
