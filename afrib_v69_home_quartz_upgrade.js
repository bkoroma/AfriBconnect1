/* ═══════════════════════════════════════════════════════════════════════
   AfribConnect v69 — Global Coherence Stylesheet
   afrib_v69_global_coherence.css
   ─────────────────────────────────────────────────────────────────────
   Fixes visual inconsistencies across all screens.
   Load LAST in <head>, after all other CSS files.
   ═══════════════════════════════════════════════════════════════════════ */

/* ── CSS Custom Properties (fills gaps where root vars are missing) ── */
:root {
  --gold:        #D4AF37;
  --gold-dim:    rgba(212,175,55,.12);
  --orange:      #FF6B2B;
  --green:       #00C97B;
  --purple:      #8B5CF6;
  --blue:        #38BDF8;
  --pink:        #F472B6;

  --bg1:         #06030f;
  --bg2:         #0d0920;
  --bg3:         #140f2a;
  --border:      rgba(255,255,255,.08);
  --border-gold: rgba(212,175,55,.25);
  --w60:         rgba(255,255,255,.6);
  --w40:         rgba(255,255,255,.4);
  --w20:         rgba(255,255,255,.2);

  /* Scrollbar */
  --scrollbar-w: 4px;
  --scrollbar-track: transparent;
  --scrollbar-thumb: rgba(212,175,55,.2);
}

/* ── Global scrollbar styling ── */
* { scrollbar-width: thin; scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track); }
*::-webkit-scrollbar { width: var(--scrollbar-w); height: var(--scrollbar-w); }
*::-webkit-scrollbar-track { background: var(--scrollbar-track); }
*::-webkit-scrollbar-thumb { background: var(--scrollbar-thumb); border-radius: 100px; }

/* ── Screen transition — smooth slide/fade ── */
.screen {
  display: none;
  position: static;  /* v70: explicitly static, overrides any position:absolute */
}
.screen.active {
  display: block;
  /* v70: no opacity animation - prevents iOS black screen flash */
}

/* ── Screen header standard layout ── */
.screen-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 16px 16px 12px;
}
.screen-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: #fff;
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.screen-header p {
  margin: 0;
  font-size: 12px;
  color: var(--w40);
  flex-basis: 100%;
}

/* ── AI header coherence ── */
.ai-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  padding: 16px;
  border-bottom: 1px solid var(--border);
}
.ai-header h2 { margin: 0; font-size: 18px; font-weight: 800; }
.ai-header p  { margin: 0; font-size: 12px; color: var(--w40); }

/* ── Bottom nav coherence ── */
.app-bottom-nav {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  height: 60px;
  background: rgba(6,3,15,.92);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-top: 1px solid rgba(255,255,255,.07);
  display: flex;
  align-items: center;
  justify-content: space-around;
  z-index: 1000;
  box-shadow: 0 -4px 24px rgba(0,0,0,.4);
  padding-bottom: env(safe-area-inset-bottom, 0);
}
.abn-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 8px;
  background: none;
  border: none;
  color: var(--w40);
  font-size: 20px;
  cursor: pointer;
  border-radius: 10px;
  transition: color .16s, background .16s, transform .12s;
  -webkit-tap-highlight-color: transparent;
  min-width: 44px;
  min-height: 44px;
  justify-content: center;
  position: relative;
}
.abn-item span { font-size: 9px; font-weight: 700; letter-spacing: .4px; text-transform: uppercase; }
.abn-item.active { color: var(--gold); }
.abn-item.active span { color: var(--gold); }
.abn-item:hover { background: rgba(255,255,255,.05); color: var(--w60); }
.abn-item:active { transform: scale(.9); }

/* ── Screen content padding (clears bottom nav) ── */
.screen-content {
  padding-bottom: calc(70px + env(safe-area-inset-bottom, 0));
}
/* Screens that are full-height flex (messages, games) */
.screen-content[style*="height:100%"],
.screen-content[style*="height: 100%"] {
  padding-bottom: 0;
}

/* ── GiftMe injected button standard ── */
.v69-gm-inject-btn {
  flex-shrink: 0;
}
.v69-gm-inject-btn:active {
  transform: scale(.95) !important;
  box-shadow: none !important;
}
@media (max-width: 400px) {
  .v69-gm-inject-btn span { display: none; }
  .v69-gm-inject-btn { padding: 6px 8px !important; }
}

/* ── Messages screen ── */
#screen-messages {
  padding-bottom: 0;
}
#msgChatWindow {
  /* Chat window sits above bottom nav */
  padding-bottom: env(safe-area-inset-bottom, 0);
}

/* ── Coin bar (games) ── */
.coin-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: rgba(212,175,55,.05);
  border-bottom: 1px solid var(--border-gold);
  flex-shrink: 0;
}
.coin-balance { display: flex; align-items: center; gap: 6px; }
.coin-icon { font-size: 20px; }
.coin-amount { font-size: 20px; font-weight: 900; color: var(--gold); }
.coin-label  { font-size: 11px; color: var(--w40); }
.coin-buy-btn {
  background: linear-gradient(135deg, var(--gold), #9a6e00);
  color: #000; border: none; border-radius: 20px;
  padding: 7px 16px; font-size: 12px; font-weight: 800;
  cursor: pointer; transition: all .18s;
}
.coin-buy-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(212,175,55,.4); }

/* ── Hub tabs ── */
.hub-tabs {
  display: flex;
  overflow-x: auto;
  scrollbar-width: none;
  border-bottom: 1px solid var(--border);
  background: var(--bg2);
  flex-shrink: 0;
}
.hub-tabs::-webkit-scrollbar { display: none; }
.hub-tab {
  flex-shrink: 0;
  padding: 10px 16px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--w40);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: color .16s, border-color .16s;
  white-space: nowrap;
}
.hub-tab.active { color: var(--gold); border-bottom-color: var(--gold); }
.hub-tab:hover  { color: var(--w60); }

/* ── Hub panels ── */
.hub-panel { display: none; padding: 16px; }
.hub-panel.active { display: block; }

/* ── Toast ── */
#v69-fallback-toast {
  font-family: 'Syne', 'Outfit', sans-serif;
}

/* ── Network banner ── */
#v69-network-banner {
  font-family: 'Syne', 'Outfit', sans-serif;
}

/* ── SW update banner ── */
#v69-sw-banner {
  font-family: 'Syne', 'Outfit', sans-serif;
}

/* ── Modal backdrop standard ── */
.modal-backdrop, [id$="-modal"] {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* ── Glassmorphism utility class ── */
.glass {
  background: rgba(255,255,255,.04);
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  border: 1px solid rgba(255,255,255,.08);
}

/* ── Gold gradient text utility ── */
.gold-text {
  background: linear-gradient(110deg, #fff 30%, var(--gold));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ── Pulse animation utility ── */
@keyframes v69Pulse {
  0%,100% { opacity:1; }
  50%      { opacity:.5; }
}
.v69-pulse { animation: v69Pulse 2s ease-in-out infinite; }

/* ── Light mode global overrides ── */
.light-mode {
  --bg1: #f5f0e8;
  --bg2: #fff;
  --bg3: #f0ece0;
  --border: rgba(0,0,0,.1);
  --border-gold: rgba(184,134,11,.3);
  --w60: rgba(0,0,0,.6);
  --w40: rgba(0,0,0,.4);
  --w20: rgba(0,0,0,.2);
}
.light-mode .app-bottom-nav {
  background: rgba(255,255,255,.92);
  border-top-color: rgba(0,0,0,.1);
}
.light-mode .abn-item { color: rgba(0,0,0,.4); }
.light-mode .abn-item.active { color: #b8860b; }
.light-mode .screen-header h2 { color: #1a1209; }
.light-mode .hub-tab { color: rgba(0,0,0,.4); }
.light-mode .hub-tab.active { color: #b8860b; border-bottom-color: #b8860b; }
.light-mode .coin-bar { background: rgba(184,134,11,.06); }

/* ── Responsive: extra-small screens ── */
@media (max-width: 360px) {
  .screen-header h2 { font-size: 17px; }
  .abn-item { min-width: 38px; font-size: 18px; }
  .abn-item span { display: none; }
  .hub-tab { padding: 10px 11px; font-size: 12px; }
}

/* ── Safe area bottom spacer ── */
.safe-area-bottom {
  height: env(safe-area-inset-bottom, 0);
  flex-shrink: 0;
}
