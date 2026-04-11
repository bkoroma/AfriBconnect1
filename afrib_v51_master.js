/* ═══════════════════════════════════════════════════════════════════════════
   AfribConnect v50 — HOME SCREEN COMPLETE FIX
   ─────────────────────────────────────────────────────────────────────────
   One authoritative patch that:
   1. Canonicalises all home CSS (ends the 3-layer conflict)
   2. Rebuilds every dynamic section with guaranteed render
   3. Wires all live data (balance, coins, XP, greeting, streak)
   4. Adds the Gen-Z polish the screen was missing
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────────────────────────────────
   §1  CANONICAL HOME CSS  — injected last so it wins every specificity fight
─────────────────────────────────────────────────────────────────────────── */
(function injectHomeCSS() {
  const prev = document.getElementById('home-v50');
  if (prev) prev.remove();

  const s = document.createElement('style');
  s.id = 'home-v50';
  s.textContent = `

/* ════════════════════════════════════════
   RESET: make sure the screen shows
════════════════════════════════════════ */
#screen-home { display: none; position: relative; }
#screen-home.active { display: block !important; }
#screen-home .screen-content {
  padding: 0 0 100px !important;
  max-width: 600px !important;
  margin: 0 auto !important;
}

/* ════════════════════════════════════════
   KEYFRAMES
════════════════════════════════════════ */
@keyframes h50In     { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
@keyframes h50Pop    { from{opacity:0;transform:scale(.92)} to{opacity:1;transform:none} }
@keyframes h50Pulse  { 0%,100%{opacity:1} 50%{opacity:.45} }
@keyframes h50Float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
@keyframes h50Orbit  { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-9px) scale(1.05)} }
@keyframes h50Breath { 0%,100%{opacity:.1;transform:translateY(-50%) scale(1)} 50%{opacity:.18;transform:translateY(-52%) scale(1.05)} }
@keyframes h50Ping   { 0%{transform:scale(1);opacity:1} 70%{transform:scale(2.4);opacity:0} 100%{opacity:0} }
@keyframes h50Ticker { from{opacity:0;transform:translateX(6px)} to{opacity:1;transform:none} }
@keyframes h50Shimmer{ 0%,100%{background-position:200% center} 50%{background-position:-200% center} }
@keyframes h50ScoreUp{ from{transform:scale(1.6);opacity:0} to{transform:scale(1);opacity:1} }

/* ════════════════════════════════════════
   TOP HEADER
════════════════════════════════════════ */
.home-header {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  padding: 18px 18px 0 !important;
  margin-bottom: 0 !important;
  animation: h50In .4s ease both !important;
}

.home-greeting {
  font-family: 'Syne', 'Plus Jakarta Sans', sans-serif !important;
  font-size: 22px !important;
  font-weight: 900 !important;
  line-height: 1.15 !important;
  margin-bottom: 2px !important;
  color: #fff !important;
  -webkit-text-fill-color: unset !important;
  background: none !important;
}
.home-greeting .h50-name-grad {
  background: linear-gradient(120deg, #F5C842 30%, #FF8C00 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.home-sub {
  font-size: 11px !important;
  color: rgba(255,255,255,.38) !important;
  font-family: 'Plus Jakarta Sans', 'DM Sans', sans-serif !important;
  margin: 0 !important;
}

/* Header right badges */
.home-live {
  display: inline-flex !important;
  align-items: center !important;
  gap: 5px !important;
  background: rgba(0,230,118,.07) !important;
  border: 1px solid rgba(0,230,118,.22) !important;
  border-radius: 100px !important;
  padding: 4px 10px !important;
  font-size: 10px !important;
  font-weight: 800 !important;
  letter-spacing: .8px !important;
  text-transform: uppercase !important;
  color: #00E676 !important;
}
.hhb-live-dot, .home-live .badge-dot {
  width: 6px !important; height: 6px !important;
  border-radius: 50% !important;
  background: #00E676 !important;
  display: inline-block !important;
  animation: h50Pulse 1.5s ease infinite !important;
}
#homeXP {
  font-family: 'Space Mono', monospace !important;
  font-size: 10px !important;
  font-weight: 700 !important;
  color: #F5C842 !important;
  background: rgba(245,200,66,.08) !important;
  border: 1px solid rgba(245,200,66,.22) !important;
  border-radius: 100px !important;
  padding: 4px 10px !important;
  cursor: pointer !important;
  transition: all .2s !important;
  white-space: nowrap !important;
}
#homeXP:hover { background: rgba(245,200,66,.15) !important; }

/* ════════════════════════════════════════
   HERO BANNER  — 165px tall
════════════════════════════════════════ */
.home-hero-banner {
  position: relative !important;
  margin: 12px 16px 0 !important;
  height: 162px !important;
  border-radius: 22px !important;
  overflow: hidden !important;
  background: linear-gradient(135deg, #0d0b1e 0%, #1a0f35 45%, #0b1018 100%) !important;
  border: 1px solid rgba(155,89,255,.22) !important;
  box-shadow:
    0 20px 50px rgba(0,0,0,.65),
    inset 0 1px 0 rgba(155,89,255,.15),
    inset 0 -1px 0 rgba(0,0,0,.4) !important;
  animation: h50In .5s .08s ease both !important;
}
.home-hero-banner::before {
  content: '' !important;
  position: absolute !important;
  inset: 0 !important;
  background:
    radial-gradient(ellipse 55% 90% at 88% 50%, rgba(245,200,66,.18) 0%, transparent 65%),
    radial-gradient(ellipse 35% 60% at 12% 90%, rgba(155,89,255,.14) 0%, transparent 55%),
    radial-gradient(ellipse 25% 40% at 52% 4%,  rgba(0,212,255,.07)  0%, transparent 50%) !important;
  pointer-events: none !important;
}
.home-hero-banner::after {
  content: '' !important;
  position: absolute !important;
  inset: 0 !important;
  background-image: radial-gradient(rgba(155,89,255,.05) 1px, transparent 1px) !important;
  background-size: 20px 20px !important;
  pointer-events: none !important;
}

/* Orbs inside banner */
.hhb-orb { position: absolute !important; border-radius: 50% !important; pointer-events: none !important; }
.hhb-orb-1 {
  width: 120px !important; height: 120px !important;
  right: -20px !important; top: -30px !important;
  background: radial-gradient(circle at 38% 38%, rgba(245,200,66,.45), rgba(245,200,66,.02) 68%) !important;
  animation: h50Orbit 7s ease-in-out infinite !important;
  box-shadow: 0 0 55px rgba(245,200,66,.18) !important;
}
.hhb-orb-2 {
  width: 80px !important; height: 80px !important;
  right: 86px !important; bottom: -18px !important;
  background: radial-gradient(circle at 38% 38%, rgba(255,87,87,.38), rgba(255,87,87,.02) 68%) !important;
  animation: h50Orbit 5s ease-in-out infinite !important;
  animation-delay: -2.5s !important;
  box-shadow: 0 0 38px rgba(255,87,87,.18) !important;
}
.hhb-orb-3 {
  width: 52px !important; height: 52px !important;
  right: 162px !important; top: 8px !important;
  background: radial-gradient(circle at 38% 38%, rgba(0,230,118,.35), rgba(0,230,118,.02) 68%) !important;
  animation: h50Orbit 8s ease-in-out infinite !important;
  animation-delay: -4s !important;
  box-shadow: 0 0 24px rgba(0,230,118,.16) !important;
}

.hhb-map {
  position: absolute !important;
  right: 16px !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  font-size: 82px !important;
  opacity: .09 !important;
  animation: h50Breath 5s ease-in-out infinite !important;
  pointer-events: none !important;
  user-select: none !important;
}

.hhb-content {
  position: relative !important;
  z-index: 2 !important;
  padding: 18px 20px !important;
  height: 100% !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: space-between !important;
  box-sizing: border-box !important;
}

.hhb-live-chip {
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;
  background: rgba(0,230,118,.09) !important;
  border: 1px solid rgba(0,230,118,.25) !important;
  border-radius: 100px !important;
  padding: 4px 10px !important;
  font-size: 9px !important;
  font-weight: 800 !important;
  letter-spacing: 1px !important;
  color: #00E676 !important;
  text-transform: uppercase !important;
  width: fit-content !important;
}

.hhb-title {
  font-family: 'Syne', sans-serif !important;
  font-size: 20px !important;
  font-weight: 900 !important;
  line-height: 1.2 !important;
  color: #fff !important;
  margin: 0 !important;
}
.hhb-title span {
  background: linear-gradient(90deg, #F5C842, #FF8C00) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  background-clip: text !important;
}

.hhb-ticker-row {
  display: flex !important;
  align-items: center !important;
  gap: 7px !important;
  overflow: hidden !important;
}
.hhb-ticker-badge {
  font-size: 9px !important;
  font-weight: 900 !important;
  color: #fff !important;
  background: #FF5757 !important;
  border-radius: 4px !important;
  padding: 2px 6px !important;
  letter-spacing: .4px !important;
  animation: h50Pulse 1.6s ease infinite !important;
  flex-shrink: 0 !important;
}
#homeTicker {
  font-size: 11px !important;
  color: rgba(255,255,255,.5) !important;
  font-family: 'Plus Jakarta Sans', sans-serif !important;
  font-weight: 500 !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  flex: 1 !important;
  transition: opacity .3s !important;
}

/* ════════════════════════════════════════
   INNER PADDING WRAPPER
════════════════════════════════════════ */
#screen-home .screen-content > div:last-child {
  padding: 0 16px !important;
}

/* ════════════════════════════════════════
   ONBOARDING CHECKLIST  (dynamic)
════════════════════════════════════════ */
#onboardingChecklist > div {
  background: rgba(23,20,31,.7) !important;
  border: 1px solid rgba(255,255,255,.08) !important;
  border-radius: 16px !important;
  padding: 14px 16px !important;
  margin-bottom: 12px !important;
}

/* ════════════════════════════════════════
   DAILY CHALLENGE  (dynamic)
════════════════════════════════════════ */
#dailyChallengeCard > div {
  background: linear-gradient(135deg, rgba(245,200,66,.07), rgba(255,140,0,.04)) !important;
  border: 1px solid rgba(245,200,66,.2) !important;
  border-radius: 16px !important;
  padding: 14px 16px !important;
  margin-bottom: 12px !important;
}
#dailyChallengeCard button {
  background: linear-gradient(135deg, #F5C842, #FF8C00) !important;
  color: #000 !important;
  border: none !important;
  border-radius: 100px !important;
  padding: 8px 16px !important;
  font-size: 11px !important;
  font-weight: 900 !important;
  cursor: pointer !important;
  font-family: 'Plus Jakarta Sans', sans-serif !important;
  letter-spacing: .3px !important;
  text-transform: uppercase !important;
  transition: all .2s !important;
  white-space: nowrap !important;
}

/* ════════════════════════════════════════
   XP PROGRESS BAR
════════════════════════════════════════ */
.home-xp-bar-wrap {
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
  background: rgba(23,20,31,.7) !important;
  border: 1px solid rgba(255,255,255,.07) !important;
  border-radius: 16px !important;
  padding: 12px 14px !important;
  margin-bottom: 12px !important;
  box-shadow: 0 2px 12px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.04) !important;
  animation: h50In .5s .15s ease both !important;
}
.hxp-level-badge {
  width: 44px !important; height: 44px !important;
  border-radius: 12px !important;
  flex-shrink: 0 !important;
  background: linear-gradient(135deg, #F5C842, #FF8C00) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-family: 'Syne', sans-serif !important;
  font-size: 17px !important;
  font-weight: 900 !important;
  color: #000 !important;
  box-shadow: 0 4px 14px rgba(245,200,66,.3) !important;
}
.hxp-info { flex: 1 !important; min-width: 0 !important; }
.hxp-top {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  margin-bottom: 7px !important;
}
.hxp-name {
  font-size: 12px !important;
  font-weight: 700 !important;
  color: rgba(255,255,255,.85) !important;
  font-family: 'Plus Jakarta Sans', sans-serif !important;
}
.hxp-pts {
  font-family: 'Space Mono', monospace !important;
  font-size: 11px !important;
  color: #F5C842 !important;
  font-weight: 700 !important;
}
.hxp-track {
  height: 6px !important;
  background: rgba(255,255,255,.07) !important;
  border-radius: 100px !important;
  overflow: hidden !important;
}
.hxp-fill {
  height: 100% !important;
  border-radius: 100px !important;
  background: linear-gradient(90deg, #F5C842, #FF8C00) !important;
  box-shadow: 0 0 10px rgba(245,200,66,.45) !important;
  transition: width 1s cubic-bezier(.34,1.56,.64,1) !important;
}

/* ════════════════════════════════════════
   WALLET CARD
════════════════════════════════════════ */
.home-wallet-card {
  position: relative !important;
  background: linear-gradient(140deg, #0c0918 0%, #1a1230 50%, #0c1018 100%) !important;
  border: 1px solid rgba(155,89,255,.28) !important;
  border-radius: 22px !important;
  padding: 22px 22px 18px !important;
  margin: 0 0 6px !important;
  overflow: hidden !important;
  box-shadow:
    0 16px 48px rgba(0,0,0,.6),
    0 4px 14px rgba(155,89,255,.1),
    inset 0 1px 0 rgba(155,89,255,.18),
    inset 0 -1px 0 rgba(0,0,0,.4) !important;
  animation: h50Pop .45s .18s ease both !important;
  display: block !important;
}
.home-wallet-card::before {
  content: '' !important;
  position: absolute !important;
  inset: 0 !important;
  border-radius: inherit !important;
  background:
    radial-gradient(ellipse 65% 60% at 85% 45%, rgba(245,200,66,.1) 0%, transparent 65%),
    radial-gradient(ellipse 40% 70% at 5%  55%, rgba(155,89,255,.1) 0%, transparent 58%) !important;
  pointer-events: none !important;
}
.home-wallet-card::after {
  content: '' !important;
  position: absolute !important;
  inset: 0 !important;
  border-radius: inherit !important;
  background-image:
    linear-gradient(rgba(155,89,255,.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(155,89,255,.025) 1px, transparent 1px) !important;
  background-size: 18px 18px !important;
  pointer-events: none !important;
}

.hwc-coin-chip {
  position: absolute !important;
  top: 14px !important; right: 18px !important;
  z-index: 2 !important;
  background: rgba(245,200,66,.1) !important;
  border: 1px solid rgba(245,200,66,.28) !important;
  border-radius: 100px !important;
  padding: 4px 10px !important;
  font-size: 11px !important;
  font-weight: 800 !important;
  color: #F5C842 !important;
  font-family: 'Space Mono', monospace !important;
  transition: transform .2s !important;
}

.hwc-left { position: relative !important; z-index: 2 !important; margin-bottom: 14px !important; }
.hwc-label {
  font-size: 9px !important;
  color: rgba(155,89,255,.6) !important;
  letter-spacing: 2px !important;
  text-transform: uppercase !important;
  margin-bottom: 5px !important;
  font-weight: 800 !important;
  font-family: 'Plus Jakarta Sans', sans-serif !important;
}
.hwc-amount {
  font-family: 'Syne', sans-serif !important;
  font-size: 36px !important;
  font-weight: 900 !important;
  color: #F5C842 !important;
  line-height: 1 !important;
  margin-bottom: 3px !important;
  text-shadow: 0 0 28px rgba(245,200,66,.35) !important;
}
.hwc-usd {
  font-size: 11px !important;
  color: rgba(255,255,255,.35) !important;
  font-family: 'Space Mono', monospace !important;
}
.hwc-btns {
  display: flex !important;
  gap: 8px !important;
  flex-wrap: wrap !important;
  position: relative !important;
  z-index: 2 !important;
}
.hwc-btn {
  padding: 10px 16px !important;
  border-radius: 100px !important;
  font-size: 12px !important;
  font-weight: 800 !important;
  cursor: pointer !important;
  border: none !important;
  font-family: 'Plus Jakarta Sans', sans-serif !important;
  letter-spacing: .3px !important;
  text-transform: uppercase !important;
  transition: all .2s cubic-bezier(.34,1.56,.64,1) !important;
  white-space: nowrap !important;
}
.hwc-btn.primary {
  background: linear-gradient(135deg, #F5C842, #FF8C00) !important;
  color: #000 !important;
  box-shadow: 0 4px 16px rgba(245,200,66,.35) !important;
}
.hwc-btn.primary:hover { transform: translateY(-2px) scale(1.04) !important; box-shadow: 0 8px 22px rgba(245,200,66,.5) !important; }
.hwc-btn.primary:active { transform: scale(.94) !important; }
.hwc-btn.ghost {
  background: rgba(255,255,255,.06) !important;
  color: rgba(255,255,255,.75) !important;
  border: 1px solid rgba(255,255,255,.1) !important;
}
.hwc-btn.ghost:active { transform: scale(.94) !important; }

/* ════════════════════════════════════════
   SECTION LABEL
════════════════════════════════════════ */
.section-label {
  display: block !important;
  font-family: 'Plus Jakarta Sans', 'DM Sans', sans-serif !important;
  font-size: 10px !important;
  font-weight: 800 !important;
  letter-spacing: 2px !important;
  text-transform: uppercase !important;
  color: rgba(255,255,255,.3) !important;
  padding: 18px 0 8px !important;
  margin: 0 !important;
}

/* ════════════════════════════════════════
   QUICK ACTIONS GRID
════════════════════════════════════════ */
.home-quick-grid {
  display: grid !important;
  grid-template-columns: repeat(5, 1fr) !important;
  gap: 9px !important;
  animation: h50In .5s .24s ease both !important;
}

.hq-card {
  position: relative !important;
  background: linear-gradient(160deg, rgba(255,255,255,.055), rgba(255,255,255,.02)) !important;
  border: 1px solid rgba(255,255,255,.08) !important;
  border-radius: 16px !important;
  padding: 15px 6px 12px !important;
  text-align: center !important;
  cursor: pointer !important;
  overflow: hidden !important;
  transition: all .25s cubic-bezier(.34,1.56,.64,1) !important;
  box-shadow: 0 4px 16px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.07) !important;
  -webkit-tap-highlight-color: transparent !important;
}

/* Per-card accent colours */
.hq-card:nth-child(1)  { --hqc: rgba(245,200,66,.6);  --hqb: rgba(245,200,66,.12); }
.hq-card:nth-child(2)  { --hqc: rgba(0,230,118,.6);   --hqb: rgba(0,230,118,.1); }
.hq-card:nth-child(3)  { --hqc: rgba(0,212,255,.6);   --hqb: rgba(0,212,255,.1); }
.hq-card:nth-child(4)  { --hqc: rgba(155,89,255,.6);  --hqb: rgba(155,89,255,.1); }
.hq-card:nth-child(5)  { --hqc: rgba(255,140,0,.6);   --hqb: rgba(255,140,0,.1); }
.hq-card:nth-child(6)  { --hqc: rgba(255,60,172,.6);  --hqb: rgba(255,60,172,.1); }
.hq-card:nth-child(7)  { --hqc: rgba(251,191,36,.6);  --hqb: rgba(251,191,36,.1); }
.hq-card:nth-child(8)  { --hqc: rgba(16,185,129,.6);  --hqb: rgba(16,185,129,.1); }
.hq-card:nth-child(9)  { --hqc: rgba(236,72,153,.6);  --hqb: rgba(236,72,153,.1); }
.hq-card:nth-child(10) { --hqc: rgba(56,189,248,.6);  --hqb: rgba(56,189,248,.1); }

.hq-card::before {
  content: '' !important;
  position: absolute !important; inset: 0 !important;
  border-radius: inherit !important;
  background: radial-gradient(circle at 50% 0%, var(--hqb, rgba(245,200,66,.1)), transparent 72%) !important;
  opacity: 0 !important; transition: opacity .25s !important;
}
.hq-card::after {
  content: '' !important;
  position: absolute !important;
  top: 0 !important; left: 10% !important; right: 10% !important; height: 1px !important;
  background: linear-gradient(90deg, transparent, var(--hqc, rgba(245,200,66,.5)), transparent) !important;
  opacity: 0 !important; transition: opacity .25s !important;
}
.hq-card:hover::before, .hq-card:hover::after { opacity: 1 !important; }
.hq-card:hover {
  transform: translateY(-6px) scale(1.04) !important;
  border-color: rgba(255,255,255,.14) !important;
  box-shadow: 0 16px 36px rgba(0,0,0,.4), 0 0 20px var(--hqb, rgba(245,200,66,.1)) !important;
}
.hq-card:active { transform: scale(.91) !important; transition-duration: .08s !important; background: rgba(255,255,255,.08) !important; }

.hq-icon {
  font-size: 24px !important;
  display: block !important;
  margin-bottom: 6px !important;
  transition: transform .25s cubic-bezier(.34,1.56,.64,1) !important;
  filter: drop-shadow(0 2px 5px rgba(0,0,0,.4)) !important;
}
.hq-card:hover .hq-icon { transform: scale(1.28) translateY(-2px) !important; }
.hq-label {
  font-size: 10px !important;
  font-weight: 800 !important;
  color: rgba(255,255,255,.85) !important;
  font-family: 'Plus Jakarta Sans', sans-serif !important;
  letter-spacing: .2px !important;
  line-height: 1.2 !important;
}
.hq-sub {
  font-size: 8px !important;
  color: rgba(255,255,255,.3) !important;
  margin-top: 2px !important;
  line-height: 1.3 !important;
}

/* ════════════════════════════════════════
   GAMES STRIP
════════════════════════════════════════ */
.home-games-strip {
  display: flex !important;
  gap: 10px !important;
  overflow-x: auto !important;
  padding-bottom: 4px !important;
  scrollbar-width: none !important;
  -webkit-overflow-scrolling: touch !important;
  animation: h50In .5s .30s ease both !important;
}
.home-games-strip::-webkit-scrollbar { display: none !important; }

.hgs-card {
  flex-shrink: 0 !important;
  width: 110px !important; height: 90px !important;
  border-radius: 18px !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 5px !important;
  cursor: pointer !important;
  position: relative !important;
  overflow: hidden !important;
  border: 1px solid rgba(255,255,255,.09) !important;
  transition: all .28s cubic-bezier(.34,1.56,.64,1) !important;
  box-shadow: 0 6px 20px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.1) !important;
  -webkit-tap-highlight-color: transparent !important;
}
.hgs-card:nth-child(1) { background: linear-gradient(140deg,#1e0a00,#3a1500) !important; }
.hgs-card:nth-child(2) { background: linear-gradient(140deg,#001808,#003518) !important; }
.hgs-card:nth-child(3) { background: linear-gradient(140deg,#090018,#180035) !important; }
.hgs-card:nth-child(4) { background: linear-gradient(140deg,#1a0000,#360000) !important; }
.hgs-card:nth-child(5) { background: linear-gradient(140deg,#001018,#002e3e) !important; }
.hgs-card::before {
  content: '' !important;
  position: absolute !important; inset: 0 !important;
  background: linear-gradient(180deg, rgba(255,255,255,.08) 0%, transparent 42%) !important;
  pointer-events: none !important;
}
.hgs-card:hover { transform: translateY(-6px) scale(1.06) !important; box-shadow: 0 20px 44px rgba(0,0,0,.55) !important; border-color: rgba(255,255,255,.22) !important; }
.hgs-card:active { transform: scale(.93) !important; transition-duration: .08s !important; }
.hgs-icon {
  font-size: 28px !important;
  z-index: 1 !important;
  filter: drop-shadow(0 3px 10px rgba(0,0,0,.5)) !important;
  transition: transform .28s cubic-bezier(.34,1.56,.64,1) !important;
}
.hgs-card:hover .hgs-icon { transform: scale(1.3) translateY(-4px) !important; }
.hgs-name { font-size: 10px !important; font-weight: 800 !important; color: rgba(255,255,255,.85) !important; text-align: center !important; z-index: 1 !important; font-family: 'Plus Jakarta Sans', sans-serif !important; letter-spacing: .2px !important; }
.hgs-badge {
  position: absolute !important; top: 7px !important; right: 7px !important;
  background: linear-gradient(135deg,#FF5757,#FF3CAC) !important;
  color: #fff !important; font-size: 8px !important; font-weight: 900 !important;
  border-radius: 100px !important; padding: 2px 6px !important; letter-spacing: .3px !important;
  box-shadow: 0 2px 8px rgba(255,87,87,.45) !important;
}

/* ════════════════════════════════════════
   AFRIMATCH TEASER  (dynamic)
════════════════════════════════════════ */
#homeAfriMatchTeaser > div {
  border-radius: 18px !important;
  overflow: hidden !important;
}

/* ════════════════════════════════════════
   TRENDING GRID
════════════════════════════════════════ */
.home-trending {
  display: grid !important;
  grid-template-columns: 1fr 1fr !important;
  gap: 9px !important;
  animation: h50In .5s .36s ease both !important;
}
.trending-item {
  background: rgba(255,255,255,.03) !important;
  border: 1px solid rgba(255,255,255,.07) !important;
  border-radius: 14px !important;
  padding: 12px !important;
  display: flex !important;
  gap: 10px !important;
  align-items: center !important;
  cursor: pointer !important;
  transition: all .22s !important;
  box-shadow: 0 2px 8px rgba(0,0,0,.2) !important;
  -webkit-tap-highlight-color: transparent !important;
}
.trending-item:hover { border-color: rgba(245,200,66,.2) !important; transform: translateY(-2px) !important; box-shadow: 0 8px 20px rgba(0,0,0,.3) !important; }
.trending-item:active { transform: scale(.97) !important; }
.ti-thumb { width: 42px !important; height: 42px !important; border-radius: 11px !important; display: flex !important; align-items: center !important; justify-content: center !important; font-size: 19px !important; flex-shrink: 0 !important; }
.ti-thumb.gold   { background: rgba(245,200,66,.12) !important; }
.ti-thumb.orange { background: rgba(255,140,0,.12) !important; }
.ti-thumb.green  { background: rgba(0,230,118,.1) !important; }
.ti-thumb.blue   { background: rgba(0,212,255,.1) !important; }
.ti-name { font-size: 12px !important; font-weight: 700 !important; color: #fff !important; margin-bottom: 2px !important; line-height: 1.3 !important; }
.ti-sub  { font-size: 10px !important; color: rgba(255,255,255,.38) !important; line-height: 1.3 !important; }
.ti-badge { font-size: 8px !important; font-weight: 800 !important; padding: 2px 6px !important; border-radius: 100px !important; background: rgba(0,230,118,.12) !important; color: #00E676 !important; display: inline-block !important; margin-top: 2px !important; letter-spacing: .3px !important; }

/* ════════════════════════════════════════
   SHARE CARD
════════════════════════════════════════ */
.home-share-card {
  margin-top: 8px !important;
  padding: 16px 18px !important;
  background: linear-gradient(135deg, rgba(245,200,66,.05), rgba(255,140,0,.03)) !important;
  border: 1px solid rgba(245,200,66,.13) !important;
  border-radius: 18px !important;
  box-shadow: 0 4px 16px rgba(0,0,0,.18) !important;
  animation: h50In .5s .42s ease both !important;
}
.home-share-title { font-size: 12px !important; font-weight: 700 !important; margin-bottom: 10px !important; color: rgba(255,255,255,.8) !important; }
.home-share-btns { display: flex !important; gap: 7px !important; flex-wrap: wrap !important; }
.share-btn {
  display: flex !important; align-items: center !important; gap: 4px !important;
  padding: 7px 12px !important; border-radius: 100px !important;
  font-size: 11px !important; font-weight: 800 !important;
  cursor: pointer !important; transition: all .18s !important;
  font-family: 'Plus Jakarta Sans', sans-serif !important;
  -webkit-tap-highlight-color: transparent !important;
}
.share-btn:active { transform: scale(.92) !important; }
.share-btn-wa { background: rgba(37,211,102,.1) !important; border: 1px solid rgba(37,211,102,.28) !important; color: #25d366 !important; }
.share-btn-tw { background: rgba(255,255,255,.07) !important; border: 1px solid rgba(255,255,255,.12) !important; color: rgba(255,255,255,.65) !important; }
.share-btn-fb { background: rgba(24,119,242,.1) !important; border: 1px solid rgba(24,119,242,.28) !important; color: #60a5fa !important; }
.share-btn-cp { background: rgba(245,200,66,.08) !important; border: 1px solid rgba(245,200,66,.22) !important; color: #F5C842 !important; }

/* ════════════════════════════════════════
   SMART SUGGESTIONS & DEAL OF DAY
════════════════════════════════════════ */
#smartSuggestions, #dealOfDay { margin-bottom: 10px !important; }
#dealOfDay > div { border-radius: 16px !important; overflow: hidden !important; }

/* ════════════════════════════════════════
   KYC BADGE
════════════════════════════════════════ */
.kyc-badge {
  font-size: 9px !important;
  font-weight: 800 !important;
  padding: 4px 8px !important;
  border-radius: 100px !important;
  cursor: pointer !important;
  transition: all .2s !important;
  letter-spacing: .4px !important;
  text-transform: uppercase !important;
}

/* ════════════════════════════════════════
   ANIMATE-IN UTILITY
════════════════════════════════════════ */
.home-animate-in { animation: h50In .5s ease both !important; }

/* ════════════════════════════════════════
   RESPONSIVE
════════════════════════════════════════ */
@media (max-width: 480px) {
  .home-quick-grid { grid-template-columns: repeat(4, 1fr) !important; gap: 7px !important; }
  .hq-card { padding: 13px 5px 11px !important; }
  .hq-icon { font-size: 21px !important; }
  .home-hero-banner { height: 148px !important; margin: 10px 12px 0 !important; }
  .hhb-title { font-size: 18px !important; }
  .hwc-amount { font-size: 30px !important; }
  .home-header { padding: 14px 14px 0 !important; }
  .hgs-card { width: 96px !important; height: 82px !important; }
}
@media (max-width: 360px) {
  .home-quick-grid { grid-template-columns: repeat(3, 1fr) !important; }
  .hwc-amount { font-size: 26px !important; }
}
`;
  document.head.appendChild(s);
})();


/* ─────────────────────────────────────────────────────────────────────────
   §2  HOME DATA ENGINE  — wires every live data point
─────────────────────────────────────────────────────────────────────────── */
const _H50 = {

  /* Time-of-day greeting with emoji */
  greeting() {
    const h = new Date().getHours();
    if (h >= 5  && h < 12) return ['Good morning',   '☀️'];
    if (h >= 12 && h < 17) return ['Good afternoon',  '🌤️'];
    if (h >= 17 && h < 21) return ['Good evening',    '🌅'];
    return ['Night owl', '🌙'];
  },

  /* Sync the header greeting with gradient name */
  syncGreeting() {
    const el = document.querySelector('.home-greeting');
    if (!el) return;
    const [text, emoji] = this.greeting();
    const name = window.currentUser?.first || 'there';
    el.innerHTML = `${text}, <span class="h50-name-grad">${name}</span> ${emoji}`;
  },

  /* Sync wallet balance + coin chip */
  syncBalance() {
    const bal    = window.walletBalance || window.currentUser?.walletBalance || 0;
    const coins  = window.userCoins ?? (window.currentUser?.coins ?? 0);
    const email  = window.currentUser?.email;

    // homeBalance
    const balEl = document.getElementById('homeBalance');
    if (balEl) balEl.textContent = '$' + bal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // hwcCoins chip
    const chipEl = document.getElementById('hwcCoins');
    if (chipEl) chipEl.textContent = '🪙 ' + coins.toLocaleString();

    // homeBalanceUSD / equivalent
    const usdEl = document.getElementById('homeBalanceUSD');
    if (usdEl) {
      try {
        const kes = typeof convertCurrency === 'function' ? convertCurrency(bal, 'USD', 'KES') : bal * 132;
        usdEl.textContent = `≈ KES ${Math.round(kes).toLocaleString()}`;
      } catch(_) { usdEl.textContent = `≈ $${bal.toFixed(2)} USD`; }
    }

    // Earned gift coins chip
    if (email) {
      const earned = parseInt(localStorage.getItem('afrib_gift_earned_' + email) || '0');
      const chip = document.getElementById('homeGiftEarnedChip');
      if (chip) {
        const subEl = chip.querySelector('.h50-earned-sub');
        if (subEl) subEl.textContent = `🪙 ${earned.toLocaleString()} earned coins · Tap to use or cash out`;
        chip.style.display = earned > 0 ? 'flex' : 'none';
      }
    }
  },

  /* Sync XP bar */
  syncXP() {
    if (!window.currentUser) return;
    const xp    = window.currentUser.xp || (typeof getXP === 'function' ? getXP() : 0);
    const level = window.currentUser.level || Math.floor(xp / 500) + 1;
    const xpForNext = level * 500;
    const pct   = Math.min(100, Math.round((xp % 500) / 5));

    const badgeEl = document.getElementById('hxpLevelBadge');
    const nameEl  = document.getElementById('hxpName');
    const ptsEl   = document.getElementById('hxpPts');
    const fillEl  = document.getElementById('hxpFill');
    const xpBadge = document.getElementById('homeXP');

    const RANKS = ['Explorer','Connector','Trader','Champion','Legend','Icon'];
    const rank  = RANKS[Math.min(level - 1, RANKS.length - 1)] || 'Legend';

    if (badgeEl) { badgeEl.textContent = level; badgeEl.style.animation = 'h50ScoreUp .5s ease both'; }
    if (nameEl)  nameEl.textContent = `Level ${level} — ${rank}`;
    if (ptsEl)   ptsEl.textContent  = xp.toLocaleString() + ' XP';
    if (fillEl)  fillEl.style.width = pct + '%';
    if (xpBadge) {
      const streak = typeof getStreak === 'function' ? getStreak() : 0;
      xpBadge.textContent = `⭐ ${xp.toLocaleString()} XP${streak > 0 ? ' · 🔥' + streak + 'd' : ''}`;
    }
  },

  /* KYC badge */
  syncKYC() {
    const el = document.getElementById('kycBadge');
    if (!el || !window.currentUser) return;
    const verified = !!window.currentUser.kycVerified;
    el.textContent = verified ? '✅ Verified' : '⚠️ Unverified';
    el.style.cssText += verified
      ? 'background:rgba(0,230,118,.08);border:1px solid rgba(0,230,118,.22);color:#00E676'
      : 'background:rgba(255,191,36,.07);border:1px solid rgba(255,191,36,.2);color:#fbbf24';
  },

  /* Ticker messages */
  _tickerIndex: 0,
  _tickerTimer: null,
  startTicker() {
    const el = document.getElementById('homeTicker');
    if (!el) return;
    const msgs = [
      '🌍 Africans connecting across 54 countries right now',
      '🎁 Send a gift to someone who matters today',
      '💰 Send money home instantly — zero borders',
      '🎲 Ludo match starting · Challenge a friend',
      '✨ New members joining every minute',
      '🤖 AfriBAI is online and ready to help you',
      '🛒 Fresh listings in the marketplace · Shop now',
      '💕 AfriMatch — find your African connection',
    ];
    clearInterval(this._tickerTimer);
    el.textContent = msgs[0];
    el.style.opacity = '1';
    this._tickerTimer = setInterval(() => {
      el.style.opacity = '0';
      setTimeout(() => {
        this._tickerIndex = (this._tickerIndex + 1) % msgs.length;
        el.textContent = msgs[this._tickerIndex];
        el.style.opacity = '1';
      }, 350);
    }, 4200);
  },

  /* Run all dynamic section renders */
  renderAll() {
    this.syncGreeting();
    this.syncBalance();
    this.syncXP();
    this.syncKYC();
    this.startTicker();
    // Audit Fix: sync home profile card and notification badges
    try { if (typeof window.renderHomeProfileCard === 'function') window.renderHomeProfileCard(); } catch(_) {}
    try { if (typeof window._syncNotifBadges === 'function') window._syncNotifBadges(); } catch(_) {}

    try { if (typeof renderTrending === 'function') renderTrending(); } catch(_) {}
    try { if (typeof renderDailyChallenge === 'function') renderDailyChallenge(); } catch(_) {}
    try { if (typeof renderDealOfTheDay === 'function') renderDealOfTheDay(); } catch(_) {}
    try { if (typeof renderOnboardingChecklist === 'function') renderOnboardingChecklist(); } catch(_) {}
    try { if (typeof renderSmartSuggestions === 'function') renderSmartSuggestions(); } catch(_) {}

    // AfriMatch teaser
    try {
      const amEl = document.getElementById('homeAfriMatchTeaser');
      if (amEl && window.currentUser) {
        const profiles = window.dmProfiles || [];
        if (profiles.length > 0) {
          const match = profiles[Math.floor(Math.random() * Math.min(profiles.length, 3))];
          amEl.innerHTML = `
            <div onclick="showScreen('hub')" style="
              background:linear-gradient(135deg,rgba(255,60,172,.08),rgba(155,89,255,.06));
              border:1px solid rgba(255,60,172,.2);border-radius:18px;
              padding:14px 16px;display:flex;align-items:center;gap:12px;
              cursor:pointer;margin-bottom:4px;transition:all .2s;
              -webkit-tap-highlight-color:transparent"
              onmouseover="this.style.borderColor='rgba(255,60,172,.4)'"
              onmouseout="this.style.borderColor='rgba(255,60,172,.2)'">
              <div style="width:48px;height:48px;border-radius:50%;
                background:linear-gradient(135deg,#FF3CAC,#9B59FF);
                display:flex;align-items:center;justify-content:center;
                font-family:Syne,sans-serif;font-size:17px;font-weight:900;
                color:#fff;flex-shrink:0;
                box-shadow:0 4px 14px rgba(255,60,172,.35)">
                ${((match.first||'A')[0]+(match.last||'M')[0]).toUpperCase()}
              </div>
              <div style="flex:1;min-width:0">
                <div style="font-size:13px;font-weight:800;color:#fff">
                  ${match.first} ${match.last}
                  <span style="font-size:10px;font-weight:700;color:#FF3CAC;margin-left:6px">💕 NEW</span>
                </div>
                <div style="font-size:11px;color:rgba(255,255,255,.45)">${match.profession||'Member'} · ${match.country||'Africa'}</div>
              </div>
              <span style="color:rgba(255,60,172,.5);font-size:18px">→</span>
            </div>`;
        } else {
          amEl.innerHTML = `
            <div onclick="showScreen('hub')" style="
              background:linear-gradient(135deg,rgba(255,60,172,.07),rgba(155,89,255,.05));
              border:1px solid rgba(255,60,172,.18);border-radius:18px;
              padding:14px 16px;display:flex;align-items:center;gap:10px;
              cursor:pointer;margin-bottom:4px;-webkit-tap-highlight-color:transparent">
              <span style="font-size:26px">💕</span>
              <div>
                <div style="font-size:13px;font-weight:800;color:#fff">Find Your AfriMatch</div>
                <div style="font-size:11px;color:rgba(255,255,255,.4)">Create your profile · Meet Africans worldwide</div>
              </div>
              <span style="margin-left:auto;color:rgba(255,60,172,.45);font-size:16px">→</span>
            </div>`;
        }
      }
    } catch(_) {}

    // Gift earned chip
    this.renderGiftChip();
  },

  renderGiftChip() {
    const email = window.currentUser?.email;
    if (!email) return;
    const earned = parseInt(localStorage.getItem('afrib_gift_earned_' + email) || '0');

    let chip = document.getElementById('homeGiftEarnedChip');
    if (!chip) {
      chip = document.createElement('div');
      chip.id = 'homeGiftEarnedChip';
      chip.onclick = () => { if (typeof openGiftCashout === 'function') openGiftCashout(); };
      chip.style.cssText = [
        'display:none', 'align-items:center', 'gap:10px',
        'background:linear-gradient(135deg,rgba(155,89,255,.08),rgba(0,212,255,.05))',
        'border:1.5px solid rgba(155,89,255,.25)',
        'border-radius:16px', 'padding:12px 14px',
        'margin-bottom:10px', 'cursor:pointer',
        'transition:all .2s cubic-bezier(.34,1.56,.64,1)',
        '-webkit-tap-highlight-color:transparent',
      ].join(';');
      chip.onmouseover = function() { this.style.borderColor = 'rgba(155,89,255,.5)'; this.style.transform = 'translateY(-2px)'; };
      chip.onmouseout  = function() { this.style.borderColor = 'rgba(155,89,255,.25)'; this.style.transform = ''; };

      chip.innerHTML = `
        <span style="font-size:22px">🎁</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:12px;font-weight:800;color:#fff;margin-bottom:1px">You've earned gift coins!</div>
          <div class="h50-earned-sub" style="font-size:11px;color:rgba(155,89,255,.75);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
            🪙 ${earned.toLocaleString()} earned coins · Tap to use or cash out
          </div>
        </div>
        <span style="font-size:16px;color:rgba(155,89,255,.5);flex-shrink:0">→</span>
      `;

      // Insert after XP bar
      const xpBar = document.querySelector('.home-xp-bar-wrap');
      if (xpBar && xpBar.parentNode) xpBar.parentNode.insertBefore(chip, xpBar.nextSibling);
    }

    chip.style.display = earned > 0 ? 'flex' : 'none';
    if (earned > 0) {
      const sub = chip.querySelector('.h50-earned-sub');
      if (sub) sub.textContent = `🪙 ${earned.toLocaleString()} earned coins · Tap to use or cash out`;
    }
  },

  /* Full refresh */
  refresh() {
    if (!window.currentUser) return;
    setTimeout(() => { try { this.renderAll(); } catch(e) { console.warn('[H50 refresh]', e); } }, 0);
  },
};

window._H50 = _H50;


/* ─────────────────────────────────────────────────────────────────────────
   §3  HOOK INTO APP LIFECYCLE
─────────────────────────────────────────────────────────────────────────── */
(function hookLifecycle() {

  /* Patch showScreen */
  const origShow = window.showScreen;
  window.showScreen = function(name) {
    try { if (typeof origShow === 'function') origShow.call(this, name); } catch(_) {}
    if (name === 'home') setTimeout(() => _H50.refresh(), 80);
  };
  window.showScreen._v50 = true;

  /* Patch enterApp */
  const origEnter = window.enterApp;
  window.enterApp = function(screen) {
    try { if (typeof origEnter === 'function') origEnter.call(this, screen); } catch(_) {}
    setTimeout(() => _H50.refresh(), 250);
  };

  /* Patch updateCoinDisplay to also refresh the chip */
  const origUCD = window.updateCoinDisplay;
  window.updateCoinDisplay = function() {
    try { if (typeof origUCD === 'function') origUCD.apply(this, arguments); } catch(_) {}
    try { _H50.syncBalance(); } catch(_) {}
  };

  /* Patch updateBalanceDisplay */
  const origUBD = window.updateBalanceDisplay;
  window.updateBalanceDisplay = function() {
    try { if (typeof origUBD === 'function') origUBD.apply(this, arguments); } catch(_) {}
    try { _H50.syncBalance(); } catch(_) {}
  };

  /* Initial render if already on home */
  document.addEventListener('DOMContentLoaded', () => setTimeout(() => {
    const home = document.getElementById('screen-home');
    if (home?.classList.contains('active')) _H50.refresh();
    else _H50.startTicker(); // at least start the ticker
  }, 400));

  setTimeout(() => {
    if (window.currentUser) _H50.refresh();
  }, 600);

})();

console.log('[AfribConnect] ✅ v50 Home Screen — Canonical CSS | Live Data Engine | All Sections Wired');
