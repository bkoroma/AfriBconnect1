/* ═══════════════════════════════════════════════════════════════════════════
   AfribConnect v48 — GEN-Z STYLE SYSTEM
   ─────────────────────────────────────────────────────────────────────────
   Aesthetic direction: AFROFUTURIST MAXIMALISM
   ─ Deep cosmic blacks + electric African sunset palette
   ─ Glassmorphism cards with iridescent borders
   ─ Bouncy spring micro-animations on everything touchable
   ─ Dopamine-hit gradient text everywhere it matters
   ─ TikTok-style bottom nav with animated active indicator
   ─ Story-ring avatars, pill chips, floating orbs
   ─ Custom variable fonts: Clash Display + Plus Jakarta Sans
   ─ GiftMe: full visual overhaul — TikTok live-gift stream aesthetic
   ─ Badge panel: crystal-glow cards, animated crown for legendary
   ═══════════════════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────────────────────────
   §0  FONT INJECTION  (runs immediately so fonts load before first paint)
─────────────────────────────────────────────────────────────────────────── */
(function injectFonts() {
  if (document.getElementById('v48-fonts')) return;
  const link = document.createElement('link');
  link.id = 'v48-fonts';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800;900&family=Space+Mono:wght@400;700&display=swap';
  document.head.appendChild(link);
})();

/* ─────────────────────────────────────────────────────────────────────────
   §1  MASTER STYLE INJECTION
─────────────────────────────────────────────────────────────────────────── */
(function injectV48Styles() {
  if (document.getElementById('v48-styles')) return;
  const s = document.createElement('style');
  s.id = 'v48-styles';
  s.textContent = `

/* ════════════════════════════════════════════════════════════
   DESIGN TOKENS — Gen-Z Afrofuturist palette
════════════════════════════════════════════════════════════ */
:root {
  /* Core backgrounds — deep cosmos */
  --z-bg0:     #050407;
  --z-bg1:     #09080d;
  --z-bg2:     #0f0d16;
  --z-bg3:     #17141f;
  --z-bg4:     #1e1a2a;
  --z-bg5:     #252135;

  /* African sunset palette */
  --z-gold:    #F5C842;
  --z-amber:   #FF8C00;
  --z-coral:   #FF5757;
  --z-green:   #00E676;
  --z-cyan:    #00D4FF;
  --z-violet:  #9B59FF;
  --z-pink:    #FF3CAC;
  --z-lime:    #BEFF0A;

  /* Gradients */
  --z-grad-gold:   linear-gradient(135deg, #F5C842, #FF8C00);
  --z-grad-sunset: linear-gradient(135deg, #FF5757, #FF8C00, #F5C842);
  --z-grad-aurora: linear-gradient(135deg, #9B59FF, #00D4FF, #00E676);
  --z-grad-africa: linear-gradient(135deg, #F5C842, #FF3CAC, #9B59FF);
  --z-grad-neon:   linear-gradient(135deg, #00E676, #00D4FF);
  --z-grad-fire:   linear-gradient(135deg, #FF5757, #FF3CAC);

  /* Text */
  --z-white:  #FFFFFF;
  --z-w80:    rgba(255,255,255,.82);
  --z-w55:    rgba(255,255,255,.55);
  --z-w30:    rgba(255,255,255,.30);
  --z-w12:    rgba(255,255,255,.12);
  --z-w06:    rgba(255,255,255,.06);

  /* Borders */
  --z-border:      rgba(255,255,255,.09);
  --z-border-gold: rgba(245,200,66,.35);
  --z-border-glow: rgba(245,200,66,.55);

  /* Shadows */
  --z-shadow-gold:   0 0 30px rgba(245,200,66,.25);
  --z-shadow-violet: 0 0 30px rgba(155,89,255,.25);
  --z-shadow-coral:  0 0 30px rgba(255,87,87,.25);

  /* Fonts */
  --z-font-display: 'Syne', sans-serif;
  --z-font-body:    'Plus Jakarta Sans', sans-serif;
  --z-font-mono:    'Space Mono', monospace;

  /* Radius */
  --z-r-sm:  12px;
  --z-r-md:  18px;
  --z-r-lg:  24px;
  --z-r-xl:  32px;
  --z-r-pill:100px;

  /* Easing */
  --z-spring:  cubic-bezier(.34,1.56,.64,1);
  --z-ease:    cubic-bezier(.25,.46,.45,.94);
}

/* ════════════════════════════════════════════════════════════
   BASE OVERRIDES
════════════════════════════════════════════════════════════ */
body {
  background: var(--z-bg0) !important;
  font-family: var(--z-font-body) !important;
  -webkit-font-smoothing: antialiased;
}

/* Animated background mesh */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse 60% 50% at 15% 20%, rgba(155,89,255,.07) 0%, transparent 60%),
    radial-gradient(ellipse 50% 60% at 85% 80%, rgba(245,200,66,.06) 0%, transparent 55%),
    radial-gradient(ellipse 40% 40% at 50% 50%, rgba(0,212,255,.04) 0%, transparent 65%);
}

/* ════════════════════════════════════════════════════════════
   NAVIGATION — top app bar
════════════════════════════════════════════════════════════ */
.app-nav {
  background: rgba(5,4,7,.85) !important;
  backdrop-filter: blur(24px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(24px) saturate(180%) !important;
  border-bottom: 1px solid var(--z-border) !important;
  border-bottom-color: rgba(155,89,255,.15) !important;
}

.app-nav-inner {
  height: 56px !important;
}

/* Logo */
.logo, .app-logo {
  font-family: var(--z-font-display) !important;
  font-weight: 900 !important;
  font-size: 17px !important;
  letter-spacing: 1.5px !important;
  background: var(--z-grad-gold) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  background-clip: text !important;
}

.logo-accent {
  background: var(--z-grad-sunset) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  background-clip: text !important;
}

/* App tabs */
.app-tab {
  font-family: var(--z-font-body) !important;
  font-size: 13px !important;
  font-weight: 600 !important;
  border-radius: var(--z-r-pill) !important;
  padding: 6px 16px !important;
  transition: all .22s var(--z-spring) !important;
}
.app-tab:hover {
  color: var(--z-white) !important;
  background: var(--z-w06) !important;
  transform: translateY(-1px) !important;
}
.app-tab.active {
  color: var(--z-bg0) !important;
  background: var(--z-grad-gold) !important;
  box-shadow: 0 4px 16px rgba(245,200,66,.35) !important;
}

/* Avatar */
.app-avatar {
  background: var(--z-grad-africa) !important;
  font-family: var(--z-font-display) !important;
  font-weight: 900 !important;
  font-size: 12px !important;
  width: 34px !important;
  height: 34px !important;
  border: 2px solid transparent !important;
  background-clip: padding-box !important;
  box-shadow: 0 0 0 2px rgba(245,200,66,.4) !important;
}

/* ════════════════════════════════════════════════════════════
   BOTTOM NAV — TikTok style
════════════════════════════════════════════════════════════ */
.app-bottom-nav {
  background: rgba(5,4,7,.92) !important;
  backdrop-filter: blur(28px) saturate(200%) !important;
  -webkit-backdrop-filter: blur(28px) saturate(200%) !important;
  border-top: 1px solid var(--z-border) !important;
  padding: 8px 8px 16px !important;
  position: fixed !important;
  bottom: 0 !important;
  left: 0 !important;
  right: 0 !important;
  display: flex !important;
  z-index: 200 !important;
}

.abn-item {
  flex: 1;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  gap: 3px !important;
  font-size: 10px !important;
  font-weight: 700 !important;
  color: var(--z-w30) !important;
  cursor: pointer !important;
  background: none !important;
  border: none !important;
  padding: 6px 4px !important;
  border-radius: var(--z-r-md) !important;
  transition: all .2s var(--z-spring) !important;
  letter-spacing: .3px !important;
  text-transform: uppercase !important;
  position: relative !important;
}

.abn-item span:first-child {
  font-size: 20px !important;
  line-height: 1 !important;
  transition: transform .25s var(--z-spring) !important;
}

.abn-item:active span:first-child {
  transform: scale(.85) !important;
}

.abn-item.active {
  color: var(--z-gold) !important;
}
.abn-item.active span:first-child {
  transform: scale(1.18) !important;
  filter: drop-shadow(0 0 8px var(--z-gold)) !important;
}
/* Active pip */
.abn-item.active::after {
  content: '';
  position: absolute !important;
  bottom: 2px !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  width: 20px !important;
  height: 3px !important;
  border-radius: 2px !important;
  background: var(--z-grad-gold) !important;
  box-shadow: 0 0 8px var(--z-amber) !important;
}

/* ════════════════════════════════════════════════════════════
   SCREEN CONTENT
════════════════════════════════════════════════════════════ */
.screen-content {
  padding-bottom: 100px !important;
}

.screen-header h2 {
  font-family: var(--z-font-display) !important;
  font-weight: 900 !important;
  font-size: 28px !important;
  background: var(--z-grad-gold);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ════════════════════════════════════════════════════════════
   HOME SCREEN OVERHAUL
════════════════════════════════════════════════════════════ */
.home-greeting {
  font-family: var(--z-font-display) !important;
  font-size: 24px !important;
  font-weight: 900 !important;
  background: linear-gradient(110deg, var(--z-white) 30%, var(--z-gold) 100%) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  background-clip: text !important;
  line-height: 1.15 !important;
}

.home-sub {
  font-size: 12px !important;
  color: var(--z-w55) !important;
  letter-spacing: .3px !important;
}

/* Live chip */
.home-live {
  background: rgba(0,230,118,.08) !important;
  border: 1px solid rgba(0,230,118,.25) !important;
  border-radius: var(--z-r-pill) !important;
  font-size: 10px !important;
  font-weight: 800 !important;
  letter-spacing: .8px !important;
  text-transform: uppercase !important;
  color: var(--z-green) !important;
  padding: 4px 10px !important;
}

/* Quick action cards */
.hq-card {
  background: var(--z-bg3) !important;
  border: 1px solid var(--z-border) !important;
  border-radius: var(--z-r-lg) !important;
  padding: 14px 10px !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  gap: 5px !important;
  cursor: pointer !important;
  transition: all .22s var(--z-spring) !important;
  position: relative !important;
  overflow: hidden !important;
}
.hq-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--z-grad-gold);
  opacity: 0;
  transition: opacity .2s;
  border-radius: inherit;
}
.hq-card:active {
  transform: scale(.93) !important;
}
.hq-card:hover {
  border-color: rgba(245,200,66,.35) !important;
  transform: translateY(-3px) scale(1.03) !important;
  box-shadow: 0 8px 24px rgba(245,200,66,.15) !important;
}
.hq-icon {
  font-size: 24px !important;
  line-height: 1 !important;
  transition: transform .25s var(--z-spring) !important;
}
.hq-card:hover .hq-icon {
  transform: scale(1.2) rotate(-5deg) !important;
}
.hq-label {
  font-size: 11px !important;
  font-weight: 800 !important;
  color: var(--z-white) !important;
  text-transform: uppercase !important;
  letter-spacing: .5px !important;
}
.hq-sub {
  font-size: 9px !important;
  color: var(--z-w30) !important;
}

/* Wallet card */
.home-wallet-card {
  background: linear-gradient(135deg, #0e0c1a 0%, #1a1428 50%, #0e0c1a 100%) !important;
  border: 1px solid rgba(155,89,255,.3) !important;
  border-radius: var(--z-r-xl) !important;
  box-shadow:
    0 0 0 1px rgba(245,200,66,.08),
    0 20px 60px rgba(0,0,0,.6),
    inset 0 1px 0 rgba(255,255,255,.06) !important;
  padding: 22px 20px !important;
  margin: 0 !important;
  position: relative !important;
  overflow: hidden !important;
}
.home-wallet-card::before {
  content: '';
  position: absolute;
  top: -40px; right: -40px;
  width: 150px; height: 150px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(155,89,255,.2), transparent 70%);
  pointer-events: none;
}
.home-wallet-card::after {
  content: '';
  position: absolute;
  bottom: -30px; left: -20px;
  width: 120px; height: 120px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(245,200,66,.12), transparent 70%);
  pointer-events: none;
}

.hwc-label {
  font-size: 10px !important;
  font-weight: 800 !important;
  letter-spacing: 2px !important;
  text-transform: uppercase !important;
  color: var(--z-w55) !important;
}
.hwc-amount {
  font-family: var(--z-font-display) !important;
  font-size: 34px !important;
  font-weight: 900 !important;
  background: var(--z-grad-gold) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  background-clip: text !important;
  line-height: 1.1 !important;
}
.hwc-usd {
  font-size: 11px !important;
  color: var(--z-w30) !important;
  font-family: var(--z-font-mono) !important;
  margin-top: 2px !important;
}

.hwc-btn {
  font-family: var(--z-font-body) !important;
  font-size: 12px !important;
  font-weight: 800 !important;
  border-radius: var(--z-r-pill) !important;
  padding: 9px 16px !important;
  cursor: pointer !important;
  border: none !important;
  transition: all .22s var(--z-spring) !important;
  letter-spacing: .3px !important;
  text-transform: uppercase !important;
}
.hwc-btn.primary {
  background: var(--z-grad-gold) !important;
  color: #000 !important;
  box-shadow: 0 4px 14px rgba(245,200,66,.35) !important;
}
.hwc-btn.primary:active { transform: scale(.92) !important; }
.hwc-btn.ghost {
  background: var(--z-w06) !important;
  color: var(--z-w80) !important;
  border: 1px solid var(--z-border) !important;
}
.hwc-btn.ghost:active { transform: scale(.92) !important; }

/* ════════════════════════════════════════════════════════════
   CARDS — Glassmorphic with iridescent borders
════════════════════════════════════════════════════════════ */
.profile-card, .feat-card, .method-card, .coin-pkg,
.trending-item, .wlm-card, .spend-card, .tx-item {
  background: var(--z-bg3) !important;
  border: 1px solid var(--z-border) !important;
  border-radius: var(--z-r-lg) !important;
  transition: all .22s var(--z-spring) !important;
}
.profile-card:hover, .feat-card:hover, .trending-item:hover {
  border-color: rgba(155,89,255,.35) !important;
  transform: translateY(-3px) scale(1.01) !important;
  box-shadow: 0 12px 32px rgba(0,0,0,.5), 0 0 0 1px rgba(155,89,255,.15) !important;
}

/* Profile name */
.profile-name {
  font-weight: 700 !important;
  font-size: 14px !important;
}

/* Connect button */
.connect-btn-web {
  background: rgba(155,89,255,.12) !important;
  border: 1px solid rgba(155,89,255,.3) !important;
  color: #c8a9ff !important;
  border-radius: var(--z-r-pill) !important;
  font-size: 11px !important;
  font-weight: 800 !important;
  text-transform: uppercase !important;
  letter-spacing: .5px !important;
  transition: all .2s var(--z-spring) !important;
}
.connect-btn-web:hover {
  background: rgba(155,89,255,.25) !important;
  transform: scale(1.06) !important;
}
.connect-btn-web.connected {
  background: rgba(0,230,118,.1) !important;
  color: var(--z-green) !important;
  border-color: rgba(0,230,118,.25) !important;
}

/* Chips / Tags */
.chip {
  background: var(--z-bg4) !important;
  border: 1px solid var(--z-border) !important;
  border-radius: var(--z-r-pill) !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  transition: all .18s var(--z-spring) !important;
}
.chip.active, .chip:hover {
  background: rgba(245,200,66,.12) !important;
  border-color: rgba(245,200,66,.35) !important;
  color: var(--z-gold) !important;
  transform: translateY(-1px) !important;
}

/* ════════════════════════════════════════════════════════════
   BUTTONS — Global upgrade
════════════════════════════════════════════════════════════ */
.btn-primary {
  background: var(--z-grad-gold) !important;
  color: #000 !important;
  font-weight: 800 !important;
  font-family: var(--z-font-body) !important;
  border-radius: var(--z-r-pill) !important;
  letter-spacing: .3px !important;
  border: none !important;
  box-shadow: 0 6px 20px rgba(245,200,66,.3) !important;
  transition: all .22s var(--z-spring) !important;
}
.btn-primary:hover {
  transform: translateY(-2px) scale(1.03) !important;
  box-shadow: 0 10px 28px rgba(245,200,66,.45) !important;
}
.btn-primary:active {
  transform: scale(.95) !important;
}

.btn-ghost {
  background: var(--z-w06) !important;
  border: 1px solid var(--z-border) !important;
  color: var(--z-w80) !important;
  border-radius: var(--z-r-pill) !important;
  font-weight: 700 !important;
  transition: all .2s var(--z-spring) !important;
}
.btn-ghost:hover {
  background: var(--z-w12) !important;
  border-color: rgba(255,255,255,.2) !important;
  transform: translateY(-1px) !important;
}

/* ════════════════════════════════════════════════════════════
   AUTH OVERLAY — Gen-Z login screen
════════════════════════════════════════════════════════════ */
#auth-overlay {
  background: radial-gradient(ellipse at 30% 20%, rgba(155,89,255,.15) 0%, transparent 55%),
              radial-gradient(ellipse at 80% 80%, rgba(245,200,66,.10) 0%, transparent 50%),
              var(--z-bg0) !important;
}
.auth-card {
  background: rgba(23,20,31,.9) !important;
  border: 1px solid rgba(155,89,255,.2) !important;
  border-radius: var(--z-r-xl) !important;
  backdrop-filter: blur(32px) !important;
  box-shadow: 0 40px 80px rgba(0,0,0,.8), 0 0 0 1px rgba(255,255,255,.04) !important;
}
.auth-logo {
  font-family: var(--z-font-display) !important;
  font-weight: 900 !important;
  font-size: 15px !important;
  letter-spacing: 2px !important;
  background: var(--z-grad-gold) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  background-clip: text !important;
}
.auth-title {
  font-family: var(--z-font-display) !important;
  font-weight: 900 !important;
  background: linear-gradient(120deg, #fff 40%, var(--z-gold)) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  background-clip: text !important;
}
.auth-field input, .auth-field select {
  background: var(--z-bg4) !important;
  border: 1px solid var(--z-border) !important;
  border-radius: var(--z-r-md) !important;
  color: var(--z-white) !important;
  font-family: var(--z-font-body) !important;
  transition: border-color .18s, box-shadow .18s !important;
}
.auth-field input:focus {
  border-color: rgba(155,89,255,.5) !important;
  box-shadow: 0 0 0 3px rgba(155,89,255,.12) !important;
  outline: none !important;
}

/* ════════════════════════════════════════════════════════════
   SECTION LABELS
════════════════════════════════════════════════════════════ */
.section-label, .section-tag {
  font-family: var(--z-font-body) !important;
  font-size: 10px !important;
  font-weight: 800 !important;
  letter-spacing: 2px !important;
  text-transform: uppercase !important;
  color: var(--z-w55) !important;
  margin: 20px 0 10px !important;
}

/* ════════════════════════════════════════════════════════════
   TOAST — Pill notification
════════════════════════════════════════════════════════════ */
.toast, #afrib-toast-v44 {
  background: rgba(23,20,31,.97) !important;
  border: 1px solid rgba(155,89,255,.3) !important;
  border-radius: var(--z-r-pill) !important;
  font-family: var(--z-font-body) !important;
  font-size: 13px !important;
  font-weight: 700 !important;
  box-shadow: 0 8px 32px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.04) !important;
  backdrop-filter: blur(20px) !important;
}

/* ════════════════════════════════════════════════════════════
   INPUTS (global) — sleeker
════════════════════════════════════════════════════════════ */
input:not([type=range]):not([type=checkbox]):not([type=radio]),
select, textarea {
  background: var(--z-bg4) !important;
  border: 1px solid var(--z-border) !important;
  border-radius: var(--z-r-md) !important;
  color: var(--z-white) !important;
  font-family: var(--z-font-body) !important;
  transition: border-color .18s, box-shadow .18s !important;
}
input:focus, select:focus, textarea:focus {
  border-color: rgba(155,89,255,.5) !important;
  box-shadow: 0 0 0 3px rgba(155,89,255,.1) !important;
  outline: none !important;
}

/* ════════════════════════════════════════════════════════════
   AI CHAT — Messenger-style bubbles
════════════════════════════════════════════════════════════ */
.chat-window {
  background: var(--z-bg2) !important;
  border: 1px solid var(--z-border) !important;
  border-radius: var(--z-r-lg) !important;
}
.chat-msg.bot .chat-bubble {
  background: var(--z-bg4) !important;
  border: 1px solid var(--z-border) !important;
  border-radius: 18px 18px 18px 4px !important;
  font-size: 14px !important;
  color: var(--z-w80) !important;
}
.chat-msg.user .chat-bubble {
  background: rgba(155,89,255,.18) !important;
  border: 1px solid rgba(155,89,255,.3) !important;
  border-radius: 18px 18px 4px 18px !important;
  color: var(--z-white) !important;
}
.chat-send {
  background: var(--z-grad-violet, linear-gradient(135deg,#9B59FF,#00D4FF)) !important;
  border-radius: var(--z-r-pill) !important;
  box-shadow: 0 4px 14px rgba(155,89,255,.35) !important;
  transition: all .2s var(--z-spring) !important;
}
.chat-send:hover {
  transform: scale(1.1) !important;
  box-shadow: 0 6px 20px rgba(155,89,255,.5) !important;
}

/* ════════════════════════════════════════════════════════════
   GAMES — lobby cards
════════════════════════════════════════════════════════════ */
.game-card, .game-tile, [class*="game-lobby-card"] {
  background: var(--z-bg3) !important;
  border: 1px solid var(--z-border) !important;
  border-radius: var(--z-r-lg) !important;
  transition: all .22s var(--z-spring) !important;
}
.game-card:hover, .game-tile:hover {
  border-color: rgba(245,200,66,.3) !important;
  transform: translateY(-4px) scale(1.02) !important;
  box-shadow: 0 16px 40px rgba(0,0,0,.5), var(--z-shadow-gold) !important;
}

/* ════════════════════════════════════════════════════════════
   WALLET — upgraded
════════════════════════════════════════════════════════════ */
.wlm-card {
  background: var(--z-bg3) !important;
  border-radius: var(--z-r-lg) !important;
  border: 1px solid var(--z-border) !important;
  transition: all .2s var(--z-spring) !important;
}
.wlm-card:hover {
  border-color: rgba(245,200,66,.25) !important;
  transform: translateX(3px) !important;
}
.wlm-badge {
  background: var(--z-grad-gold) !important;
  color: #000 !important;
  border-radius: var(--z-r-pill) !important;
  font-size: 10px !important;
  font-weight: 800 !important;
  letter-spacing: .5px !important;
  text-transform: uppercase !important;
}

/* TX items */
.tx-item {
  border-radius: var(--z-r-md) !important;
  border: none !important;
  border-bottom: 1px solid var(--z-border) !important;
  transition: background .15s !important;
  padding: 12px 0 !important;
}
.tx-item:hover { background: var(--z-w06) !important; }

/* ════════════════════════════════════════════════════════════
   LANDING PAGE — Afrofuturist hero
════════════════════════════════════════════════════════════ */
.hero-title {
  font-family: var(--z-font-display) !important;
  font-weight: 900 !important;
}
.hero-title em {
  background: var(--z-grad-sunset) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  background-clip: text !important;
  font-style: normal !important;
}
.btn-nav {
  background: var(--z-grad-gold) !important;
  color: #000 !important;
  font-weight: 800 !important;
  border-radius: var(--z-r-pill) !important;
  box-shadow: 0 4px 14px rgba(245,200,66,.3) !important;
  transition: all .2s var(--z-spring) !important;
}
.btn-nav:hover {
  transform: translateY(-2px) scale(1.04) !important;
  box-shadow: 0 8px 20px rgba(245,200,66,.45) !important;
}

/* Hero badge */
.hero-badge {
  background: rgba(155,89,255,.1) !important;
  border: 1px solid rgba(155,89,255,.3) !important;
  color: #c8a9ff !important;
}

/* Stats */
.stat-num {
  background: var(--z-grad-gold) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  background-clip: text !important;
  font-family: var(--z-font-display) !important;
  font-weight: 900 !important;
}

/* Feature cards */
.feat-card {
  background: rgba(23,20,31,.7) !important;
  backdrop-filter: blur(12px) !important;
  border-radius: var(--z-r-xl) !important;
}
.feat-card:hover {
  border-color: rgba(155,89,255,.25) !important;
}

/* ════════════════════════════════════════════════════════════
   GIFTME OVERLAY — TikTok Live Gift aesthetic
════════════════════════════════════════════════════════════ */
#gm-overlay {
  background: rgba(0,0,0,.88) !important;
  backdrop-filter: blur(20px) saturate(150%) !important;
}

.gm-drawer {
  background: linear-gradient(180deg, #0e0b18 0%, #130f1f 50%, #0a0814 100%) !important;
  border-top: 1px solid rgba(155,89,255,.3) !important;
  border-radius: 28px 28px 0 0 !important;
  box-shadow: 0 -20px 60px rgba(0,0,0,.8) !important;
}

.gm-handle {
  background: rgba(155,89,255,.3) !important;
  width: 48px !important;
  height: 4px !important;
  border-radius: 2px !important;
}

/* GiftMe header */
.gm-hdr-title {
  font-family: var(--z-font-display) !important;
  font-size: 18px !important;
  font-weight: 900 !important;
  background: var(--z-grad-africa) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  background-clip: text !important;
}

.gm-hdr-coins {
  background: rgba(245,200,66,.1) !important;
  border: 1px solid rgba(245,200,66,.3) !important;
  border-radius: var(--z-r-pill) !important;
  font-size: 12px !important;
  font-weight: 800 !important;
  color: var(--z-gold) !important;
  font-family: var(--z-font-mono) !important;
}

.gm-hdr-close {
  width: 32px !important;
  height: 32px !important;
  border-radius: 50% !important;
  background: var(--z-w06) !important;
  border: 1px solid var(--z-border) !important;
  color: var(--z-w55) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: all .2s var(--z-spring) !important;
}
.gm-hdr-close:hover {
  background: rgba(255,87,87,.15) !important;
  border-color: rgba(255,87,87,.3) !important;
  color: var(--z-coral) !important;
  transform: rotate(90deg) scale(1.1) !important;
}

/* Recipient bar */
.gm-recipient {
  background: rgba(155,89,255,.07) !important;
  border: 1px solid rgba(155,89,255,.2) !important;
  border-radius: var(--z-r-md) !important;
  font-size: 12px !important;
}

/* Tabs */
.gm-tab {
  font-family: var(--z-font-body) !important;
  font-size: 11px !important;
  font-weight: 800 !important;
  border-radius: var(--z-r-pill) !important;
  letter-spacing: .4px !important;
  text-transform: uppercase !important;
  padding: 7px 14px !important;
  transition: all .2s var(--z-spring) !important;
  background: var(--z-w06) !important;
  border: 1px solid var(--z-border) !important;
  color: var(--z-w55) !important;
}
.gm-tab.active {
  background: rgba(155,89,255,.2) !important;
  border-color: rgba(155,89,255,.45) !important;
  color: #c8a9ff !important;
  box-shadow: 0 2px 10px rgba(155,89,255,.2) !important;
}

/* Gift cards */
.gm-card {
  background: var(--z-bg3) !important;
  border: 1.5px solid var(--z-border) !important;
  border-radius: 18px !important;
  transition: all .22s var(--z-spring) !important;
}
.gm-card:hover, .gm-card.selected {
  border-color: rgba(245,200,66,.55) !important;
  background: rgba(245,200,66,.07) !important;
  transform: scale(1.06) translateY(-3px) !important;
}
.gm-card.selected {
  box-shadow: 0 0 20px rgba(245,200,66,.3), 0 6px 20px rgba(0,0,0,.5) !important;
}
.gm-card-name {
  font-family: var(--z-font-body) !important;
  font-size: 10px !important;
  font-weight: 700 !important;
  color: var(--z-w80) !important;
  letter-spacing: .3px !important;
}
.gm-card-price {
  font-family: var(--z-font-mono) !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  color: var(--z-gold) !important;
}

/* Tier dots */
.gm-tier-legendary {
  background: var(--z-gold) !important;
  box-shadow: 0 0 8px var(--z-gold), 0 0 16px rgba(245,200,66,.5) !important;
  animation: zLegPulse 1.2s ease infinite alternate !important;
}
@keyframes zLegPulse {
  from { box-shadow: 0 0 6px var(--z-gold); }
  to   { box-shadow: 0 0 16px var(--z-gold), 0 0 28px rgba(245,200,66,.5); }
}

/* Send bar */
.gm-send-bar {
  border-top: 1px solid rgba(155,89,255,.15) !important;
  padding: 14px 18px 20px !important;
  background: linear-gradient(0deg, rgba(0,0,0,.6), transparent) !important;
}

.gm-qty-wrap {
  background: var(--z-bg4) !important;
  border: 1px solid var(--z-border) !important;
  border-radius: var(--z-r-md) !important;
}

.gm-qty-btn {
  color: var(--z-gold) !important;
  font-size: 20px !important;
  font-weight: 900 !important;
  transition: transform .15s var(--z-spring) !important;
}
.gm-qty-btn:active { transform: scale(.8) !important; }

.gm-send-btn {
  background: var(--z-grad-gold) !important;
  color: #000 !important;
  font-family: var(--z-font-body) !important;
  font-size: 14px !important;
  font-weight: 900 !important;
  border-radius: var(--z-r-pill) !important;
  letter-spacing: .4px !important;
  text-transform: uppercase !important;
  box-shadow: 0 4px 16px rgba(245,200,66,.35) !important;
  transition: all .22s var(--z-spring) !important;
}
.gm-send-btn:not(:disabled):hover {
  transform: scale(1.03) !important;
  box-shadow: 0 8px 24px rgba(245,200,66,.5) !important;
}
.gm-send-btn:not(:disabled):active { transform: scale(.96) !important; }
.gm-send-btn:disabled { opacity: .35 !important; }

.gm-total-cost {
  font-family: var(--z-font-mono) !important;
  font-size: 11px !important;
  color: var(--z-gold) !important;
}

/* Message input */
.gm-msg-input {
  background: var(--z-bg4) !important;
  border: 1px solid var(--z-border) !important;
  border-radius: var(--z-r-md) !important;
  color: var(--z-white) !important;
  font-family: var(--z-font-body) !important;
}
.gm-msg-input:focus {
  border-color: rgba(155,89,255,.45) !important;
  box-shadow: 0 0 0 3px rgba(155,89,255,.1) !important;
}

/* Gift trigger button */
.gm-trigger-btn {
  background: rgba(245,200,66,.1) !important;
  border: 1.5px solid rgba(245,200,66,.35) !important;
  border-radius: var(--z-r-pill) !important;
  color: var(--z-gold) !important;
  font-family: var(--z-font-body) !important;
  font-size: 12px !important;
  font-weight: 800 !important;
  letter-spacing: .4px !important;
  text-transform: uppercase !important;
  transition: all .2s var(--z-spring) !important;
}
.gm-trigger-btn:hover {
  background: rgba(245,200,66,.2) !important;
  transform: scale(1.05) !important;
  box-shadow: 0 4px 14px rgba(245,200,66,.25) !important;
}

/* Flying gift animation */
.gm-flying-gift {
  filter: drop-shadow(0 0 16px currentColor) !important;
}

/* ════════════════════════════════════════════════════════════
   GIFT BADGE PANEL — Quartz crystal glow
════════════════════════════════════════════════════════════ */
#gb-tiktok-panel {
  background: var(--z-bg0) !important;
  font-family: var(--z-font-body) !important;
}

/* Hero section */
.gb-tt-hero {
  background: radial-gradient(ellipse at 50% 0%, rgba(155,89,255,.12) 0%, transparent 65%),
              radial-gradient(ellipse at 80% 100%, rgba(245,200,66,.08) 0%, transparent 55%) !important;
  padding: 28px 20px 22px !important;
}

/* Tier name */
.gb-tt-tier-name {
  font-family: var(--z-font-display) !important;
  font-weight: 900 !important;
  font-size: 22px !important;
  letter-spacing: .5px !important;
}

/* Level tag */
.gb-tt-level-tag {
  background: var(--z-w06) !important;
  border: 1px solid var(--z-border) !important;
  border-radius: var(--z-r-pill) !important;
  font-family: var(--z-font-mono) !important;
  font-size: 12px !important;
  font-weight: 700 !important;
}

/* Progress bar */
.gb-tt-prog-track {
  background: var(--z-w06) !important;
  border-radius: 6px !important;
  height: 7px !important;
}

/* Stats */
.gb-tt-stat-val {
  font-family: var(--z-font-display) !important;
  font-size: 22px !important;
  font-weight: 900 !important;
  background: var(--z-grad-gold) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  background-clip: text !important;
}
.gb-tt-stat-lbl {
  font-size: 9px !important;
  font-weight: 800 !important;
  letter-spacing: 1.2px !important;
  text-transform: uppercase !important;
  color: var(--z-w30) !important;
}

/* Section title */
.gb-tt-section-title {
  font-family: var(--z-font-body) !important;
  font-size: 10px !important;
  font-weight: 800 !important;
  letter-spacing: 2px !important;
  text-transform: uppercase !important;
  color: var(--z-w30) !important;
  padding: 18px 20px 8px !important;
}

/* Badge card */
.gb-tt-badge-card canvas {
  border-radius: 18px !important;
  box-shadow: 0 4px 16px rgba(0,0,0,.5) !important;
  transition: all .22s var(--z-spring) !important;
}
.gb-tt-badge-card.current canvas {
  box-shadow:
    0 0 0 2px rgba(245,200,66,.6),
    0 0 20px rgba(245,200,66,.3),
    0 8px 24px rgba(0,0,0,.6) !important;
  transform: scale(1.06) !important;
}
.gb-tt-badge-card.locked canvas {
  filter: grayscale(.9) brightness(.4) !important;
}
.gb-tt-badge-lbl {
  font-family: var(--z-font-body) !important;
  font-size: 10px !important;
  font-weight: 700 !important;
  letter-spacing: .3px !important;
}
.gb-tt-badge-current-dot {
  background: var(--z-gold) !important;
  box-shadow: 0 0 8px var(--z-gold) !important;
  border: 2px solid var(--z-bg0) !important;
}

/* CTA */
.gb-tt-cta {
  background: rgba(155,89,255,.06) !important;
  border: 1px solid rgba(155,89,255,.2) !important;
  border-radius: var(--z-r-xl) !important;
  margin: 6px 16px 24px !important;
}
.gb-tt-cta-text {
  font-size: 13px !important;
  color: var(--z-w55) !important;
  line-height: 1.5 !important;
}
.gb-tt-cta-text b { color: var(--z-gold) !important; }
.gb-tt-cta-btn {
  background: var(--z-grad-gold) !important;
  border-radius: var(--z-r-pill) !important;
  color: #000 !important;
  font-family: var(--z-font-body) !important;
  font-size: 12px !important;
  font-weight: 900 !important;
  letter-spacing: .4px !important;
  text-transform: uppercase !important;
  box-shadow: 0 4px 14px rgba(245,200,66,.3) !important;
  transition: all .2s var(--z-spring) !important;
}
.gb-tt-cta-btn:hover {
  transform: scale(1.06) !important;
  box-shadow: 0 6px 20px rgba(245,200,66,.45) !important;
}

/* Tier header in strip */
.gb-tt-tier-header {
  background: var(--z-bg3) !important;
  border: 1px solid var(--z-border) !important;
  border-radius: var(--z-r-lg) !important;
}
.gb-tt-tier-header-range {
  font-family: var(--z-font-mono) !important;
  font-size: 9px !important;
  color: var(--z-w30) !important;
}

/* ════════════════════════════════════════════════════════════
   XP + LEVEL BAR
════════════════════════════════════════════════════════════ */
.home-xp-bar-wrap {
  background: var(--z-bg3) !important;
  border: 1px solid var(--z-border) !important;
  border-radius: var(--z-r-lg) !important;
  margin-bottom: 12px !important;
}
.hxp-level-badge {
  background: var(--z-grad-gold) !important;
  color: #000 !important;
  font-family: var(--z-font-display) !important;
  font-weight: 900 !important;
  box-shadow: 0 4px 12px rgba(245,200,66,.3) !important;
}
.hxp-fill {
  background: var(--z-grad-gold) !important;
  box-shadow: 0 0 8px rgba(245,200,66,.4) !important;
}
.hxp-name {
  font-weight: 700 !important;
  font-size: 13px !important;
}
.hxp-pts {
  font-family: var(--z-font-mono) !important;
  font-size: 12px !important;
  color: var(--z-gold) !important;
}

/* ════════════════════════════════════════════════════════════
   MODALS — Glassmorphic
════════════════════════════════════════════════════════════ */
.modal-card, [class*="modal-card"] {
  background: rgba(18,15,28,.97) !important;
  border: 1px solid rgba(155,89,255,.2) !important;
  border-radius: var(--z-r-xl) !important;
  box-shadow: 0 40px 80px rgba(0,0,0,.8) !important;
  backdrop-filter: blur(32px) !important;
}

/* ════════════════════════════════════════════════════════════
   MICRO ANIMATIONS — spring haptic feel
════════════════════════════════════════════════════════════ */
@keyframes zFadeUp {
  from { opacity:0; transform:translateY(16px) scale(.97); }
  to   { opacity:1; transform:translateY(0) scale(1); }
}
@keyframes zPop {
  from { opacity:0; transform:scale(.88); }
  to   { opacity:1; transform:scale(1); }
}
@keyframes zShimmer {
  from { background-position: -200% center; }
  to   { background-position: 200% center; }
}
@keyframes zGlowPulse {
  0%,100% { box-shadow: 0 0 10px rgba(245,200,66,.2); }
  50%      { box-shadow: 0 0 24px rgba(245,200,66,.5); }
}
@keyframes zOrbit {
  from { transform: rotate(0deg) translateX(30px) rotate(0deg); }
  to   { transform: rotate(360deg) translateX(30px) rotate(-360deg); }
}

/* Staggered screen entry */
/* v70 REMOVED: .screen.active > * animation caused black screens on iOS
   (animation-delay kept content at opacity:0 until JS animation fired)
   Screen children now render immediately */
.screen.active > * {
  /* animation removed for iOS compatibility */
}

/* Button tap ripple */
button:active, [role=button]:active {
  transition: transform .08s !important;
}

/* Coin display */
#coinDisplay, #shopCoinDisplay, #pmCoins, #gm-coin-bal {
  font-family: var(--z-font-mono) !important;
  font-weight: 700 !important;
  color: var(--z-gold) !important;
}

/* ════════════════════════════════════════════════════════════
   SCROLLBAR — thin neon
════════════════════════════════════════════════════════════ */
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb {
  background: linear-gradient(var(--z-violet), var(--z-gold));
  border-radius: 2px;
}

/* ════════════════════════════════════════════════════════════
   SELECTION colour
════════════════════════════════════════════════════════════ */
::selection {
  background: rgba(155,89,255,.35);
  color: #fff;
}

/* ════════════════════════════════════════════════════════════
   UTILITY HELPERS
════════════════════════════════════════════════════════════ */
.z-grad-text {
  background: var(--z-grad-gold);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.z-grad-text-africa {
  background: var(--z-grad-africa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.z-glass {
  background: rgba(23,20,31,.7);
  backdrop-filter: blur(20px);
  border: 1px solid var(--z-border);
  border-radius: var(--z-r-lg);
}
.z-glow-gold { box-shadow: 0 0 20px rgba(245,200,66,.3) !important; }
.z-glow-violet { box-shadow: 0 0 20px rgba(155,89,255,.3) !important; }
.z-bounce:active { animation: zBounce .3s var(--z-spring); }
@keyframes zBounce { 0%{transform:scale(1)} 40%{transform:scale(.9)} 100%{transform:scale(1)} }

/* ════════════════════════════════════════════════════════════
   MOBILE RESPONSIVE TWEAKS
════════════════════════════════════════════════════════════ */
@media (max-width: 480px) {
  .hwc-amount { font-size: 28px !important; }
  .gb-tt-tier-name { font-size: 18px !important; }
  .gm-hdr-title { font-size: 16px !important; }
}

`;
  document.head.appendChild(s);
})();


/* ─────────────────────────────────────────────────────────────────────────
   §2  LANDING PAGE ENHANCEMENTS
   Injects floating particles, gradient title, animated stat counters
─────────────────────────────────────────────────────────────────────────── */
(function enhanceLanding() {
  function tryEnhance() {
    const hero = document.querySelector('.hero-content');
    if (!hero || hero._v48) return false;
    hero._v48 = true;

    // Add aurora shimmer badge
    const badge = hero.querySelector('.hero-badge');
    if (badge) {
      badge.style.cssText += ';background:linear-gradient(135deg,rgba(155,89,255,.12),rgba(0,212,255,.08));border-color:rgba(155,89,255,.3);color:#c8a9ff;';
    }

    // Inject floating particles into hero-bg
    const heroBg = document.querySelector('.hero-bg');
    if (heroBg && !heroBg.querySelector('.z-particles')) {
      const particles = document.createElement('div');
      particles.className = 'z-particles';
      particles.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden;';
      const COLORS = ['#F5C842','#FF5757','#9B59FF','#00D4FF','#00E676','#FF3CAC'];
      for (let i = 0; i < 24; i++) {
        const p = document.createElement('div');
        const size = 2 + Math.random() * 4;
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const dur = 4 + Math.random() * 8;
        const delay = -Math.random() * 8;
        p.style.cssText = `
          position:absolute;width:${size}px;height:${size}px;
          border-radius:50%;background:${color};
          left:${x}%;top:${y}%;
          opacity:${.15 + Math.random() * .4};
          animation:zParticle ${dur}s ${delay}s ease-in-out infinite;
          box-shadow:0 0 ${size*3}px ${color};
        `;
        particles.appendChild(p);
      }
      // Add keyframes for particles
      if (!document.getElementById('z-particle-anim')) {
        const ks = document.createElement('style');
        ks.id = 'z-particle-anim';
        ks.textContent = `
          @keyframes zParticle {
            0%,100% { transform:translateY(0) scale(1); opacity:.2; }
            33%      { transform:translateY(-18px) scale(1.3); opacity:.6; }
            66%      { transform:translateY(8px) scale(.8); opacity:.3; }
          }
        `;
        document.head.appendChild(ks);
      }
      heroBg.appendChild(particles);
    }

    return true;
  }

  document.addEventListener('DOMContentLoaded', () => setTimeout(() => { if (!tryEnhance()) setTimeout(tryEnhance, 800); }, 100));
  setTimeout(() => { if (!tryEnhance()) setTimeout(tryEnhance, 1000); }, 200);
})();


/* ─────────────────────────────────────────────────────────────────────────
   §3  STAT COUNTER ANIMATION  (numberrolls up like a slot machine)
─────────────────────────────────────────────────────────────────────────── */
function zAnimateCounter(el, target, suffix, duration) {
  if (!el || el._animated) return;
  el._animated = true;
  const start = Date.now();
  const num = parseFloat(String(target).replace(/[^0-9.]/g, ''));
  const tick = () => {
    const p = Math.min(1, (Date.now() - start) / duration);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(num * ease).toLocaleString() + (suffix || '');
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// Run counters when stats are visible
(function watchStats() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const raw = el.textContent.trim();
      if (/^\d/.test(raw)) zAnimateCounter(el, raw, '', 1200);
      obs.unobserve(el);
    });
  }, { threshold: .5 });

  function attachObs() {
    document.querySelectorAll('.stat-num, .cstat span').forEach(el => obs.observe(el));
  }
  document.addEventListener('DOMContentLoaded', attachObs);
  setTimeout(attachObs, 500);
})();


/* ─────────────────────────────────────────────────────────────────────────
   §4  BOTTOM NAV ACTIVE INDICATOR  (sliding pill under active tab)
─────────────────────────────────────────────────────────────────────────── */
(function enhanceBottomNav() {
  function patch() {
    const nav = document.querySelector('.app-bottom-nav');
    if (!nav || nav._v48) return false;
    nav._v48 = true;

    // Add haptic feedback on tap (mobile)
    nav.querySelectorAll('.abn-item').forEach(btn => {
      btn.addEventListener('click', () => {
        if (navigator.vibrate) navigator.vibrate(8);
      });
    });
    return true;
  }

  document.addEventListener('DOMContentLoaded', () => setTimeout(() => { if (!patch()) setTimeout(patch, 600); }, 200));
  setTimeout(() => { if (!patch()) setTimeout(patch, 800); }, 400);
})();


/* ─────────────────────────────────────────────────────────────────────────
   §5  GIFTME VISUAL UPGRADES
   • Coin rain effect after successful send
   • Gift card hover sparkle
   • Send button pulse while gift is in-flight
─────────────────────────────────────────────────────────────────────────── */
(function enhanceGiftMe() {

  /* Coin rain after send */
  function _rainCoins(count) {
    const EMOJIS = ['🪙','💎','⭐','✨','🎁','💫'];
    for (let i = 0; i < (count || 8); i++) {
      setTimeout(() => {
        const el = document.createElement('div');
        el.textContent = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
        el.style.cssText = `
          position:fixed;
          top:-30px;
          left:${10 + Math.random() * 80}vw;
          font-size:${16 + Math.random() * 20}px;
          z-index:8001;
          pointer-events:none;
          animation:zCoinFall ${1.2 + Math.random() * 1.5}s ease-in forwards;
          filter:drop-shadow(0 0 6px rgba(245,200,66,.6));
        `;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 2800);
      }, i * 80);
    }

    // Inject keyframes once
    if (!document.getElementById('z-coin-fall')) {
      const ks = document.createElement('style');
      ks.id = 'z-coin-fall';
      ks.textContent = `
        @keyframes zCoinFall {
          from { transform:translateY(0) rotate(0deg); opacity:1; }
          to   { transform:translateY(110vh) rotate(${Math.floor(Math.random()*720)}deg); opacity:0; }
        }
      `;
      document.head.appendChild(ks);
    }
  }

  /* Gift card sparkle on hover */
  function attachSparkles() {
    document.querySelectorAll('.gm-card:not([data-sparkle])').forEach(card => {
      card.setAttribute('data-sparkle', '1');
      card.addEventListener('mouseenter', function() {
        const spark = document.createElement('div');
        spark.style.cssText = `
          position:absolute;top:4px;right:6px;font-size:10px;
          pointer-events:none;animation:zSparkPop .5s ease forwards;z-index:2;
        `;
        spark.textContent = '✨';
        this.style.position = 'relative';
        this.appendChild(spark);
        setTimeout(() => spark.remove(), 500);
      });
    });

    if (!document.getElementById('z-spark-anim')) {
      const ks = document.createElement('style');
      ks.id = 'z-spark-anim';
      ks.textContent = `
        @keyframes zSparkPop {
          0%   { opacity:0; transform:scale(0) rotate(-20deg); }
          60%  { opacity:1; transform:scale(1.4) rotate(10deg); }
          100% { opacity:0; transform:scale(.8) rotate(0deg); }
        }
      `;
      document.head.appendChild(ks);
    }
  }

  // Patch gmSendGift to trigger coin rain
  function patchGmSend() {
    const orig = window.gmSendGift;
    if (typeof orig !== 'function' || orig._v48rain) return false;
    window.gmSendGift = function() {
      try { orig.apply(this, arguments); } catch(e) { console.error('[gmSendGift v48]', e); }
      // Coin rain! Scale with gift tier
      const tier = window._gmSelectedGift?.tier || 'common';
      const count = { common: 6, rare: 10, epic: 14, legendary: 20 }[tier] || 8;
      setTimeout(() => _rainCoins(count), 200);
    };
    window.gmSendGift._v48rain = true;
    return true;
  }

  // Attach sparkles whenever GiftMe grid updates
  const gmObs = new MutationObserver(() => {
    attachSparkles();
    if (!window.gmSendGift?._v48rain) patchGmSend();
  });
  gmObs.observe(document.body, { childList: true, subtree: true });

  if (!patchGmSend()) {
    const t = setInterval(() => { if (patchGmSend()) clearInterval(t); }, 300);
    setTimeout(() => clearInterval(t), 8000);
  }
})();


/* ─────────────────────────────────────────────────────────────────────────
   §6  BADGE LEVEL-UP OVERLAY — Gen-Z style
   Replaces the v43 overlay with a more dramatic animated version
─────────────────────────────────────────────────────────────────────────── */
(function patchLevelUpOverlay() {
  // Override _gbShowLevelUpOverlay with Gen-Z version
  window._gbShowLevelUpOverlay = function(level, tier) {
    const existing = document.getElementById('gb-lvlup-v48');
    if (existing) existing.remove();

    const el = document.createElement('div');
    el.id = 'gb-lvlup-v48';
    el.style.cssText = `
      position:fixed;inset:0;z-index:99998;
      background:radial-gradient(ellipse at 50% 30%, rgba(155,89,255,.25) 0%, rgba(0,0,0,.92) 60%);
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      font-family:'Plus Jakarta Sans',sans-serif;
      animation:zLvlIn .4s cubic-bezier(.34,1.56,.64,1) both;
    `;

    const TIER_GRADIENT = {
      basic:     'linear-gradient(135deg,#D1D5DB,#fff)',
      active:    'linear-gradient(135deg,#F472B6,#ff69b4)',
      power:     'linear-gradient(135deg,#93C5FD,#00D4FF)',
      elite:     'linear-gradient(135deg,#F5C842,#FF8C00)',
      legendary: 'linear-gradient(135deg,#F5C842,#FF3CAC,#9B59FF)',
    };
    const grad = TIER_GRADIENT[tier?.id] || TIER_GRADIENT.basic;

    el.innerHTML = `
      <style>
        @keyframes zLvlIn { from{opacity:0;transform:scale(.85)} to{opacity:1;transform:scale(1)} }
        @keyframes zLvlFloat { 0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)} }
        @keyframes zLvlRing { to{transform:rotate(360deg)} }
        @keyframes zLvlNum { from{transform:scale(3);opacity:0} to{transform:scale(1);opacity:1} }
        @keyframes zLvlStar { 0%{transform:scale(0) rotate(0)} 60%{transform:scale(1.3) rotate(180deg)} 100%{transform:scale(0) rotate(360deg)} }
      </style>
      <div style="position:relative;margin-bottom:20px;width:160px;height:160px">
        <!-- Rotating ring -->
        <div style="position:absolute;inset:0;border-radius:50%;border:2px solid transparent;
             background:${grad} border-box;mask:linear-gradient(#fff 0 0) padding-box,linear-gradient(#fff 0 0);
             mask-composite:exclude;animation:zLvlRing 3s linear infinite;"></div>
        <!-- Canvas placeholder / emoji fallback -->
        <div id="gb-lvl-canvas-wrap" style="width:160px;height:160px;display:flex;align-items:center;justify-content:center;animation:zLvlFloat 2s ease infinite">
          <div style="font-size:72px;filter:drop-shadow(0 0 24px ${tier?.color||'gold'})">${tier?.emoji || '🏅'}</div>
        </div>
        <!-- Star burst -->
        ${Array.from({length:8},(_,i)=>{
          const a = i*45;
          return `<div style="position:absolute;top:50%;left:50%;width:8px;height:8px;border-radius:50%;
                 background:${grad};transform-origin:0 0;
                 transform:rotate(${a}deg) translate(80px,-4px);
                 animation:zLvlStar .8s ${i*.1}s ease both"></div>`;
        }).join('')}
      </div>

      <div style="font-size:12px;letter-spacing:4px;text-transform:uppercase;
                  color:rgba(255,255,255,.5);font-weight:800;margin-bottom:8px">
        LEVEL UP!
      </div>

      <div style="font-size:56px;font-weight:900;font-family:'Syne',sans-serif;
                  background:${grad};-webkit-background-clip:text;-webkit-text-fill-color:transparent;
                  background-clip:text;animation:zLvlNum .5s cubic-bezier(.34,1.56,.64,1) both;
                  text-shadow:none;margin-bottom:6px;line-height:1">
        ${level}
      </div>

      <div style="font-size:20px;font-weight:800;
                  background:${grad};-webkit-background-clip:text;-webkit-text-fill-color:transparent;
                  background-clip:text;margin-bottom:8px">
        ${tier?.label || 'Gifter'}
      </div>

      <div style="font-size:13px;color:rgba(255,255,255,.45);margin-bottom:32px;text-align:center;max-width:260px;line-height:1.5">
        Your gifting power just levelled up 🔥
      </div>

      <!-- Emoji row -->
      <div style="font-size:22px;display:flex;gap:8px;margin-bottom:28px">
        ${'⭐'.repeat(Math.min(5, Math.ceil(level / 12)))}
      </div>

      <button onclick="safeRemoveEl('gb-lvlup-v48')"
              style="padding:14px 36px;background:${grad};border:none;
                     border-radius:100px;color:#000;font-size:14px;font-weight:900;
                     cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;
                     letter-spacing:.5px;text-transform:uppercase;
                     box-shadow:0 8px 28px rgba(0,0,0,.5);
                     transition:transform .2s cubic-bezier(.34,1.56,.64,1);"
              onmouseover="this.style.transform='scale(1.06)'"
              onmouseout="this.style.transform='scale(1)'"
              onmousedown="this.style.transform='scale(.94)'">
        Let's go! 🚀
      </button>
    `;

    document.body.appendChild(el);

    // Also draw crystal canvas if available
    setTimeout(() => {
      const wrap = document.getElementById('gb-lvl-canvas-wrap');
      if (!wrap || !window.gbDrawCrystal || !window.GB_TIERS) return;
      const t = window.GB_TIERS.find(x => x.id === tier?.id) || window.GB_TIERS.slice(-1)[0];
      wrap.innerHTML = '';
      const canvas = document.createElement('canvas');
      canvas.width = 140; canvas.height = 140;
      wrap.appendChild(canvas);
      window.gbDrawCrystal(canvas, t, level, true);
    }, 50);

    // Auto-dismiss
    setTimeout(() => { if (el.parentNode) el.remove(); }, 6000);
  };
})();


/* ─────────────────────────────────────────────────────────────────────────
   §7  HOME SCREEN ENHANCEMENTS
   • Greeting personalisation with time-of-day emoji
   • Home screen quick-action icons get bounce on screen load
─────────────────────────────────────────────────────────────────────────── */
(function enhanceHomeScreen() {
  function updateGreeting() {
    const el = document.getElementById('homeName');
    const greetEl = document.querySelector('.home-greeting');
    if (!el || !window.currentUser) return;

    const h = new Date().getHours();
    const greetings = [
      [5,  12, 'Good morning'],
      [12, 17, 'Good afternoon'],
      [17, 21, 'Good evening'],
      [21, 24, 'Night owl'],
      [0,  5,  'Night owl'],
    ];
    const vibes = [
      [5,  12, '☀️'],
      [12, 17, '🌤️'],
      [17, 21, '🌅'],
      [21, 24, '🌙'],
      [0,  5,  '✨'],
    ];
    const greeting = greetings.find(([s,e]) => h >= s && h < e)?.[2] || 'Hey';
    const vibe     = vibes.find(([s,e]) => h >= s && h < e)?.[2] || '👋';

    if (greetEl) {
      const _v48SafeName = String(window.currentUser.first || 'there').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      greetEl.innerHTML = `${greeting}, <span style="background:linear-gradient(135deg,#F5C842,#FF8C00);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">${_v48SafeName}</span> ${vibe}`;
    }
  }

  // Wire into enterApp
  const origEnter = window.enterApp;
  window.enterApp = function(screen) {
    try { if (typeof origEnter === 'function') origEnter.call(this, screen); } catch(_) {}
    setTimeout(updateGreeting, 300);
  };

  // Also run now if already in app
  setTimeout(updateGreeting, 400);
})();


/* ─────────────────────────────────────────────────────────────────────────
   §8  COLOUR THEME VARIABLES — override root to point to v48 palette
─────────────────────────────────────────────────────────────────────────── */
(function overrideRootVars() {
  // Make existing CSS variables point to v48 palette
  const overrides = document.createElement('style');
  overrides.id = 'v48-var-overrides';
  overrides.textContent = `
    :root {
      --bg:     var(--z-bg0) !important;
      --bg2:    var(--z-bg1) !important;
      --bg3:    var(--z-bg3) !important;
      --bg4:    var(--z-bg4) !important;
      --gold:   var(--z-gold) !important;
      --orange: var(--z-amber) !important;
      --gold-dim:     rgba(245,200,66,.12) !important;
      --orange-dim:   rgba(255,140,0,.12)  !important;
      --border:       rgba(255,255,255,.09) !important;
      --border-gold:  rgba(245,200,66,.32) !important;
      --w60:    rgba(255,255,255,.6) !important;
      --w30:    rgba(255,255,255,.3) !important;
      --w10:    rgba(255,255,255,.1) !important;
      --font-b: 'Plus Jakarta Sans', sans-serif !important;
      --font-d: 'Syne', sans-serif !important;
    }
  `;
  document.head.appendChild(overrides);
})();

console.log('[AfribConnect] ✅ v48 Style System — Afrofuturist Maximalist | Gen-Z | GiftMe Enhanced | Level-Up Overlay');
