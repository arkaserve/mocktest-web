// MockTest — Shared Design Tokens
// Import this in any component for consistent styling

export const T = {
  // Colors
  orange:      '#FF6B35',
  orangeDark:  '#e85c26',
  orangeLight: '#FFF3EE',
  orangeBorder:'#fec9b0',
  dark:        '#111111',
  darkMid:     '#222222',
  white:       '#FFFFFF',
  grayBg:      '#F8F8F8',
  grayBorder:  '#EBEBEB',
  textDark:    '#111111',
  textMid:     '#444444',
  textMuted:   '#666666',
  textLight:   '#999999',

  // Typography
  fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",

  // Shadows
  shadowSm:  '0 2px 8px rgba(0,0,0,.06)',
  shadowMd:  '0 4px 16px rgba(0,0,0,.08)',
  shadowLg:  '0 8px 32px rgba(0,0,0,.10)',
  shadowOr:  '0 4px 16px rgba(255,107,53,.3)',
}

// Premium icon components (no emojis)
export const Icon = {
  infinity:  () => <span style={{fontSize:20,fontWeight:700,fontFamily:'serif'}}>∞</span>,
  ai:        () => <span style={{fontSize:11,fontWeight:900,letterSpacing:'-0.5px'}}>MT</span>,
  chart:     () => <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><rect x="2" y="10" width="4" height="8"/><rect x="8" y="6" width="4" height="12"/><rect x="14" y="2" width="4" height="16"/></svg>,
  timer:     () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="11" r="7"/><path d="M10 7v4l2.5 2.5"/><path d="M7.5 2h5M10 2v2"/></svg>,
  pdf:       () => <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M4 2h8l4 4v12a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z" opacity=".15"/><path d="M12 2v4h4M6 10h8M6 13h5"/><path d="M4 2h8l4 4v12a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg>,
  target:    () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="10" cy="10" r="8"/><circle cx="10" cy="10" r="4"/><circle cx="10" cy="10" r="1" fill="currentColor"/></svg>,
  brain:     () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 3C7 3 5 5 5 8c0 1.5.5 2.5 1 3.5C7 13 7 14 7 15h6c0-1 0-2 1-3.5.5-1 1-2 1-3.5 0-3-2-5-5-5z"/><path d="M7 15h6M8 17h4"/></svg>,
  check:     () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l4 4 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  arrow:     () => <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  star:      () => '★',
}
