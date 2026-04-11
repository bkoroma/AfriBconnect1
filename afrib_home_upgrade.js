/* ═══════════════════════════════════════════════════════════════
   AFRIBCONNECT — HOME SCREEN v38 — Bold 3D, African-inspired
   ═══════════════════════════════════════════════════════════════ */

@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Outfit:wght@400;500;600;700&display=swap');

:root {
  --hg: #D4AF37; --ho: #FF6B2B; --hgr: #00C97B;
  --hpu: #8B5CF6; --hbl: #38BDF8;
}

/* HEADER */
.home-header {
  display:flex; justify-content:space-between; align-items:center;
  padding:20px 18px 0; margin-bottom:0;
}
.home-greeting {
  font-family:'Syne',sans-serif; font-size:26px; font-weight:800;
  background:linear-gradient(110deg,#fff 40%,var(--hg) 100%);
  -webkit-background-clip:text; -webkit-text-fill-color:transparent;
  background-clip:text; margin-bottom:2px; line-height:1.2;
}
.home-sub { font-size:12px; color:rgba(255,255,255,.45); }

/* HERO BANNER */
.home-hero-banner {
  position:relative; margin:14px 14px 0; height:175px; border-radius:22px;
  overflow:hidden;
  background:linear-gradient(140deg,#100800 0%,#1e1000 40%,#0c180c 100%);
  border:1px solid rgba(212,175,55,.22);
  box-shadow:0 24px 64px rgba(0,0,0,.55),inset 0 1px 0 rgba(212,175,55,.18),inset 0 -1px 0 rgba(0,0,0,.4);
}
.home-hero-banner::before {
  content:''; position:absolute; inset:0;
  background:radial-gradient(ellipse 55% 90% at 88% 50%,rgba(212,175,55,.22) 0%,transparent 65%),radial-gradient(ellipse 35% 60% at 15% 90%,rgba(255,107,43,.14) 0%,transparent 55%),radial-gradient(ellipse 25% 40% at 55% 5%,rgba(0,201,123,.08) 0%,transparent 50%);
  pointer-events:none;
}
.home-hero-banner::after {
  content:''; position:absolute; inset:0;
  background-image:radial-gradient(rgba(212,175,55,.06) 1px,transparent 1px);
  background-size:22px 22px; pointer-events:none;
}

/* Orbs */
.hhb-orb { position:absolute; border-radius:50%; pointer-events:none; }
.hhb-orb-1 {
  width:130px; height:130px; right:-25px; top:-35px;
  background:radial-gradient(circle at 38% 38%,rgba(212,175,55,.45),rgba(212,175,55,.04) 68%);
  animation:hOrbFloat 7s ease-in-out infinite;
  box-shadow:0 0 60px rgba(212,175,55,.18),inset 0 0 35px rgba(212,175,55,.1);
}
.hhb-orb-2 {
  width:85px; height:85px; right:90px; bottom:-18px;
  background:radial-gradient(circle at 38% 38%,rgba(255,107,43,.4),rgba(255,107,43,.04) 68%);
  animation:hOrbFloat 5s ease-in-out infinite; animation-delay:-2.5s;
  box-shadow:0 0 40px rgba(255,107,43,.2);
}
.hhb-orb-3 {
  width:55px; height:55px; right:170px; top:8px;
  background:radial-gradient(circle at 38% 38%,rgba(0,201,123,.35),rgba(0,201,123,.04) 68%);
  animation:hOrbFloat 8s ease-in-out infinite; animation-delay:-4s;
  box-shadow:0 0 25px rgba(0,201,123,.18);
}
@keyframes hOrbFloat {
  0%,100% { transform:translateY(0) scale(1); }
  50%     { transform:translateY(-9px) scale(1.05); }
}
.hhb-map {
  position:absolute; right:18px; top:50%; transform:translateY(-50%);
  font-size:86px; opacity:.1;
  animation:hMapBreath 5s ease-in-out infinite;
  pointer-events:none; user-select:none;
}
@keyframes hMapBreath {
  0%,100% { opacity:.1; transform:translateY(-50%) scale(1); }
  50%     { opacity:.16; transform:translateY(-52%) scale(1.04); }
}
.hhb-content {
  position:relative; z-index:2; padding:20px 22px;
  height:100%; display:flex; flex-direction:column; justify-content:space-between;
}
.hhb-live-chip {
  display:inline-flex; align-items:center; gap:7px;
  background:rgba(0,201,123,.1); border:1px solid rgba(0,201,123,.28);
  border-radius:100px; padding:4px 12px; font-size:10px; font-weight:800;
  color:var(--hgr); letter-spacing:.6px; width:fit-content; text-transform:uppercase;
}
.hhb-live-dot,.home-live .badge-dot {
  width:6px; height:6px; background:var(--hgr); border-radius:50%;
  animation:hLivePulse 1.6s ease-in-out infinite; display:inline-block;
}
@keyframes hLivePulse {
  0%,100% { opacity:1; box-shadow:0 0 0 0 rgba(0,201,123,.6); }
  50%     { opacity:.5; box-shadow:0 0 0 5px rgba(0,201,123,0); }
}
.home-live {
  display:inline-flex; align-items:center; gap:6px;
  background:rgba(0,201,123,.1); border:1px solid rgba(0,201,123,.28);
  border-radius:100px; padding:5px 12px; font-size:11px; font-weight:700; color:var(--hgr);
}
.hhb-title {
  font-family:'Syne',sans-serif; font-size:24px; font-weight:800;
  line-height:1.18; color:#fff;
}
.hhb-title span {
  background:linear-gradient(90deg,var(--hg),var(--ho));
  -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
}
.hhb-ticker-row { display:flex; align-items:center; gap:8px; overflow:hidden; }
.hhb-ticker-badge { font-size:10px; font-weight:800; color:var(--ho); letter-spacing:.5px; flex-shrink:0; }
#homeTicker { font-size:12px; color:rgba(255,255,255,.55); flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; transition:opacity .4s; }

/* XP BAR */
.home-xp-bar-wrap {
  background:rgba(255,255,255,.035); border:1px solid rgba(255,255,255,.07);
  border-radius:16px; padding:14px 16px; margin-bottom:14px;
  display:flex; align-items:center; gap:14px;
  box-shadow:0 2px 12px rgba(0,0,0,.2),inset 0 1px 0 rgba(255,255,255,.06);
}
.hxp-level-badge {
  width:48px; height:48px; border-radius:14px; flex-shrink:0;
  background:linear-gradient(135deg,var(--hg),#a0780a);
  display:flex; align-items:center; justify-content:center;
  font-family:'Syne',sans-serif; font-size:18px; font-weight:800; color:#000;
  box-shadow:0 4px 16px rgba(212,175,55,.45),inset 0 1px 0 rgba(255,255,255,.3);
}
.hxp-info { flex:1; min-width:0; }
.hxp-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
.hxp-name { font-size:13px; font-weight:700; color:rgba(255,255,255,.9); }
.hxp-pts  { font-size:11px; color:var(--hg); font-weight:700; }
.hxp-track { height:7px; background:rgba(255,255,255,.07); border-radius:100px; overflow:hidden; }
.hxp-fill {
  height:100%; background:linear-gradient(90deg,var(--hg),var(--ho));
  border-radius:100px; transition:width .9s cubic-bezier(.4,0,.2,1);
  box-shadow:0 0 12px rgba(212,175,55,.55);
}

/* WALLET CARD */
.home-wallet-card {
  position:relative;
  background:linear-gradient(140deg,#130d00 0%,#221700 55%,#120f00 100%);
  border:1px solid rgba(212,175,55,.32); border-radius:22px;
  padding:24px 26px; margin:0 0 18px;
  display:flex; align-items:center; justify-content:space-between;
  gap:18px; flex-wrap:wrap; overflow:hidden;
  transition:transform .35s ease,box-shadow .35s ease;
  box-shadow:0 16px 48px rgba(0,0,0,.55),0 4px 14px rgba(212,175,55,.12),inset 0 1px 0 rgba(212,175,55,.22),inset 0 -1px 0 rgba(0,0,0,.4);
  transform-style:preserve-3d;
}
.home-wallet-card::before {
  content:''; position:absolute; inset:0; border-radius:inherit;
  background:radial-gradient(ellipse 65% 55% at 82% 50%,rgba(212,175,55,.14) 0%,transparent 68%),radial-gradient(ellipse 38% 70% at 4% 50%,rgba(255,107,43,.09) 0%,transparent 58%);
  pointer-events:none;
}
.home-wallet-card::after {
  content:''; position:absolute; inset:0; border-radius:inherit;
  background-image:linear-gradient(rgba(212,175,55,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(212,175,55,.025) 1px,transparent 1px);
  background-size:18px 18px; pointer-events:none;
}
.home-wallet-card:hover {
  transform:translateY(-3px);
  box-shadow:0 24px 64px rgba(0,0,0,.6),0 8px 22px rgba(212,175,55,.22),inset 0 1px 0 rgba(212,175,55,.3);
}
.hwc-coin-chip {
  position:absolute; top:14px; right:20px; z-index:2;
  background:rgba(212,175,55,.12); border:1px solid rgba(212,175,55,.3);
  border-radius:100px; padding:4px 10px; font-size:11px; font-weight:800; color:var(--hg);
  transition:transform .2s cubic-bezier(.34,1.56,.64,1);
}
.hwc-label { font-size:10px; color:rgba(212,175,55,.5); letter-spacing:1.6px; text-transform:uppercase; margin-bottom:6px; position:relative; z-index:2; }
.hwc-amount { font-family:'Syne',sans-serif; font-size:40px; font-weight:800; color:var(--hg); margin-bottom:2px; position:relative; z-index:2; text-shadow:0 0 30px rgba(212,175,55,.4); }
.hwc-usd { font-size:12px; color:rgba(255,255,255,.38); position:relative; z-index:2; }
.hwc-btns { display:flex; gap:10px; flex-wrap:wrap; position:relative; z-index:2; }
.hwc-btn { padding:11px 18px; border-radius:12px; font-size:13px; font-weight:700; cursor:pointer; border:none; transition:all .2s; }
.hwc-btn.primary { background:linear-gradient(135deg,var(--hg),#9a6e00); color:#000; box-shadow:0 4px 18px rgba(212,175,55,.38); }
.hwc-btn.primary:hover { transform:translateY(-2px); box-shadow:0 8px 26px rgba(212,175,55,.5); }
.hwc-btn.ghost { background:rgba(255,255,255,.06); color:rgba(255,255,255,.8); border:1px solid rgba(255,255,255,.1); }
.hwc-btn.ghost:hover { background:rgba(255,255,255,.12); transform:translateY(-1px); }

/* SECTION LABEL */
.section-label {
  font-size:10px; letter-spacing:2.2px; text-transform:uppercase;
  color:rgba(255,255,255,.32); margin-bottom:10px; margin-top:26px;
}

/* QUICK GRID */
.home-quick-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:9px; }
.hq-card {
  position:relative;
  background:linear-gradient(160deg,rgba(255,255,255,.055) 0%,rgba(255,255,255,.02) 100%);
  border:1px solid rgba(255,255,255,.08); border-radius:16px;
  padding:16px 8px 13px; text-align:center; cursor:pointer;
  transition:all .28s cubic-bezier(.34,1.56,.64,1); transform-style:preserve-3d;
  box-shadow:0 4px 18px rgba(0,0,0,.32),inset 0 1px 0 rgba(255,255,255,.09),inset 0 -1px 0 rgba(0,0,0,.25);
  overflow:hidden;
}
.hq-card:nth-child(1)  { --cc:rgba(212,175,55,.18); --cb:rgba(212,175,55,.55); }
.hq-card:nth-child(2)  { --cc:rgba(0,201,123,.14);  --cb:rgba(0,201,123,.55);  }
.hq-card:nth-child(3)  { --cc:rgba(59,130,246,.14);  --cb:rgba(59,130,246,.55); }
.hq-card:nth-child(4)  { --cc:rgba(139,92,246,.14); --cb:rgba(139,92,246,.55); }
.hq-card:nth-child(5)  { --cc:rgba(255,107,43,.14); --cb:rgba(255,107,43,.55); }
.hq-card:nth-child(6)  { --cc:rgba(244,114,182,.14);--cb:rgba(244,114,182,.55);}
.hq-card:nth-child(7)  { --cc:rgba(251,191,36,.14); --cb:rgba(251,191,36,.55); }
.hq-card:nth-child(8)  { --cc:rgba(16,185,129,.14); --cb:rgba(16,185,129,.55); }
.hq-card:nth-child(9)  { --cc:rgba(236,72,153,.14); --cb:rgba(236,72,153,.55); }
.hq-card:nth-child(10) { --cc:rgba(245,158,11,.14); --cb:rgba(245,158,11,.55); }
.hq-card::before {
  content:''; position:absolute; inset:0; border-radius:inherit;
  background:radial-gradient(circle at 50% 0%,var(--cc,rgba(212,175,55,.1)) 0%,transparent 72%);
  opacity:0; transition:opacity .28s;
}
.hq-card::after {
  content:''; position:absolute; top:0; left:10%; right:10%; height:1px;
  background:linear-gradient(90deg,transparent,var(--cb,rgba(212,175,55,.55)),transparent);
  opacity:0; transition:opacity .28s;
}
.hq-card:hover { transform:translateY(-7px) scale(1.04); border-color:rgba(255,255,255,.16); box-shadow:0 18px 44px rgba(0,0,0,.42),0 0 22px var(--cc,rgba(212,175,55,.18)),inset 0 1px 0 rgba(255,255,255,.14); }
.hq-card:hover::before,.hq-card:hover::after { opacity:1; }
.hq-card:active { transform:translateY(-2px) scale(.97); transition-duration:.1s; }
.hq-icon { font-size:24px; margin-bottom:7px; display:block; filter:drop-shadow(0 2px 6px rgba(0,0,0,.4)); transition:transform .28s cubic-bezier(.34,1.56,.64,1); }
.hq-card:hover .hq-icon { transform:scale(1.3) translateY(-2px); }
.hq-label { font-size:11px; font-weight:700; color:rgba(255,255,255,.88); margin-bottom:2px; }
.hq-sub   { font-size:9px;  color:rgba(255,255,255,.32); line-height:1.35; }

/* GAMES STRIP */
.home-games-strip { display:flex; gap:10px; overflow-x:auto; padding-bottom:4px; scrollbar-width:none; -webkit-overflow-scrolling:touch; }
.home-games-strip::-webkit-scrollbar { display:none; }
.hgs-card {
  flex-shrink:0; width:118px; height:96px; border-radius:18px;
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px;
  cursor:pointer; position:relative; overflow:hidden;
  border:1px solid rgba(255,255,255,.09);
  transition:all .32s cubic-bezier(.34,1.56,.64,1);
  box-shadow:0 6px 22px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.12);
}
.hgs-card:nth-child(1) { background:linear-gradient(140deg,#1e0a00,#3d1800); }
.hgs-card:nth-child(2) { background:linear-gradient(140deg,#001a08,#003d18); }
.hgs-card:nth-child(3) { background:linear-gradient(140deg,#0a0018,#1a0038); }
.hgs-card:nth-child(4) { background:linear-gradient(140deg,#1a0000,#380000); }
.hgs-card:nth-child(5) { background:linear-gradient(140deg,#001218,#003040); }
.hgs-card::before { content:''; position:absolute; inset:0; background:linear-gradient(180deg,rgba(255,255,255,.09) 0%,transparent 45%); pointer-events:none; }
.hgs-card:hover { transform:translateY(-7px) scale(1.06); box-shadow:0 22px 48px rgba(0,0,0,.55); border-color:rgba(255,255,255,.22); }
.hgs-card:active { transform:translateY(-2px) scale(.97); transition-duration:.1s; }
.hgs-icon { font-size:30px; z-index:1; filter:drop-shadow(0 4px 12px rgba(0,0,0,.5)); transition:transform .32s cubic-bezier(.34,1.56,.64,1); }
.hgs-card:hover .hgs-icon { transform:scale(1.35) translateY(-4px); }
.hgs-name { font-size:11px; font-weight:700; color:rgba(255,255,255,.88); text-align:center; z-index:1; }
.hgs-badge {
  position:absolute; top:8px; right:8px;
  background:linear-gradient(135deg,var(--ho),#c43d00);
  color:#fff; font-size:9px; font-weight:800; border-radius:100px;
  padding:2px 7px; letter-spacing:.4px; box-shadow:0 2px 8px rgba(255,107,43,.45);
}

/* TRENDING */
.home-trending { display:grid; grid-template-columns:repeat(2,1fr); gap:9px; }
.trending-item { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07); border-radius:14px; padding:13px; display:flex; gap:11px; align-items:center; cursor:pointer; transition:all .24s; box-shadow:0 2px 10px rgba(0,0,0,.18); }
.trending-item:hover { border-color:rgba(212,175,55,.2); transform:translateY(-2px); box-shadow:0 8px 22px rgba(0,0,0,.28); }
.ti-thumb { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
.ti-thumb.orange { background:rgba(255,107,43,.15); }
.ti-thumb.green  { background:rgba(0,201,123,.12); }
.ti-thumb.blue   { background:rgba(56,189,248,.12); }
.ti-thumb.gold   { background:rgba(212,175,55,.12); }

/* SHARE CARD */
.home-share-card { margin-top:18px; padding:18px 20px; background:linear-gradient(135deg,rgba(212,175,55,.055) 0%,rgba(255,107,43,.035) 100%); border:1px solid rgba(212,175,55,.14); border-radius:18px; box-shadow:0 4px 18px rgba(0,0,0,.18); }
.home-share-title { font-size:13px; font-weight:700; margin-bottom:12px; color:rgba(255,255,255,.88); }
.home-share-btns  { display:flex; gap:8px; flex-wrap:wrap; }
.share-btn { display:flex; align-items:center; gap:5px; padding:8px 13px; border-radius:10px; font-size:12px; font-weight:700; cursor:pointer; border:1px solid; transition:all .2s; }
.share-btn:hover { transform:translateY(-2px); filter:brightness(1.1); }
.share-btn-wa { background:rgba(37,211,102,.1); border-color:rgba(37,211,102,.3); color:#25d366; }
.share-btn-tw { background:rgba(29,161,242,.1); border-color:rgba(29,161,242,.3); color:#1da1f2; }
.share-btn-fb { background:rgba(24,119,242,.1); border-color:rgba(24,119,242,.3); color:#1877f2; }
.share-btn-cp { background:rgba(212,175,55,.1); border-color:rgba(212,175,55,.3); color:var(--hg); }

/* PARTICLES */
.home-particles { position:fixed; inset:0; pointer-events:none; z-index:0; overflow:hidden; }
.home-particle  { position:absolute; border-radius:50%; opacity:0; animation:hPartRise linear infinite; }
@keyframes hPartRise { 0% { opacity:0; transform:translateY(0) scale(0); } 8% { opacity:.7; } 85% { opacity:.15; } 100% { opacity:0; transform:translateY(-100vh) scale(1.6); } }

/* ANIMATE IN */
.home-animate-in { animation:hSlideIn .5s cubic-bezier(.34,1.56,.64,1) both; }
@keyframes hSlideIn { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }

/* RESPONSIVE */
@media (max-width:768px) {
  .home-quick-grid { grid-template-columns:repeat(4,1fr); gap:8px; }
  .home-hero-banner { height:162px; margin:12px 12px 0; }
  .hhb-title { font-size:21px; }
  .hwc-amount { font-size:34px; }
}
@media (max-width:480px) {
  .home-quick-grid { grid-template-columns:repeat(3,1fr); gap:7px; }
  .hq-card { padding:13px 6px 11px; }
  .hq-icon { font-size:20px; }
  .home-hero-banner { height:150px; margin:10px 10px 0; }
  .hhb-title { font-size:19px; }
  .home-header { padding:16px 14px 0; }
}

/* ═══════════════════════════════════════════════
   HOME PROFILE CARD — Audit Fix v56
   ═══════════════════════════════════════════════ */

/* Home notification bell */
#homeNotifBtn {
  padding: 0 !important;
  line-height: 1 !important;
}

/* Profile card hover */
.home-profile-card {
  transition: border-color .2s, box-shadow .2s;
}
.home-profile-card:hover {
  border-color: rgba(212,175,55,.4) !important;
  box-shadow: 0 8px 32px rgba(212,175,55,.12);
}

/* Ensure home header wraps gracefully on small screens */
@media (max-width: 380px) {
  .home-header {
    flex-wrap: wrap;
    gap: 8px;
  }
  #homeAvatarName { display: none !important; }
}

/* Light mode overrides for profile card */
.light-mode .home-profile-card {
  background: linear-gradient(135deg,rgba(212,175,55,.08) 0%,rgba(255,255,255,.95) 100%) !important;
  border-color: rgba(212,175,55,.3) !important;
}
.light-mode #hpcName { color: #1a1209 !important; }
.light-mode #hpcUsername { color: #b8860b !important; }
.light-mode #hpcCountry, .light-mode #hpcRole { color: rgba(0,0,0,.55) !important; }

/* Bottom nav notification bell style */
.abn-notif {
  position: relative;
}
.abn-notif:hover {
  background: rgba(212,175,55,.08);
}

/* ═══════════════════════════════════════════════════════════════════
   UNIFIED HOME STRIP v2 — Glassmorphism + 2025 Micro-interactions
   Research: backdrop-filter blur, pill nav, hover lift, active glow,
   smooth transitions, thumb-friendly 44px touch targets (Apple HIG)
   ═══════════════════════════════════════════════════════════════════ */

/* ── Card shell — glassmorphism over dark gradient background ── */
.home-unified-strip {
  margin: 12px 12px 0;
  position: relative;
  border-radius: 22px;
  overflow: hidden;

  /* Glassmorphism core */
  background: rgba(212,175,55,0.06);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);

  /* Subtle layered border — top edge brighter for depth illusion */
  border: 1px solid rgba(212,175,55,0.2);
  border-top-color: rgba(212,175,55,0.35);

  /* Depth shadow + inner glow */
  box-shadow:
    0 8px 32px rgba(0,0,0,0.45),
    0 1px 0 rgba(212,175,55,0.12) inset,
    0 -1px 0 rgba(0,0,0,0.3) inset;

  animation: husSlideIn .45s cubic-bezier(0.16, 1, 0.3, 1) both;
}

/* Ambient glow orb behind the card */
.home-unified-strip::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse 70% 100% at 10% 50%,
    rgba(212,175,55,0.08) 0%,
    transparent 65%
  );
  pointer-events: none;
  z-index: 0;
}

@keyframes husSlideIn {
  from { opacity: 0; transform: translateY(-10px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* ── Profile row ── */
.hus-profile-row {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 13px 14px 10px;
  position: relative;
  z-index: 1;
  cursor: pointer;
}

/* ── Avatar ── */
.hus-avatar {
  width: 46px;
  height: 46px;
  min-width: 46px;
  border-radius: 50%;
  background: linear-gradient(135deg, #D4AF37 0%, #b8860b 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  font-weight: 900;
  color: #000;
  border: 2px solid rgba(212,175,55,0.5);
  box-shadow: 0 0 0 0 rgba(212,175,55,0);
  transition: transform .2s ease, box-shadow .2s ease;
  position: relative;
  cursor: pointer;
  letter-spacing: -0.5px;
}
.hus-avatar:hover {
  transform: scale(1.08);
  box-shadow: 0 0 0 4px rgba(212,175,55,0.2), 0 4px 14px rgba(212,175,55,0.3);
}

/* Online pulse dot */
.hus-online-dot {
  position: absolute;
  bottom: 0px;
  right: 0px;
  width: 12px;
  height: 12px;
  background: #22c55e;
  border-radius: 50%;
  border: 2px solid #0a0612;
  box-shadow: 0 0 0 0 rgba(34,197,94,0.6);
  animation: husPulse 2.5s ease-in-out infinite;
}
@keyframes husPulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.6); }
  50%      { box-shadow: 0 0 0 5px rgba(34,197,94,0); }
}

/* ── Text info ── */
.hus-info {
  flex: 1;
  min-width: 0;
  cursor: pointer;
  user-select: none;
}
.hus-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
  flex-wrap: nowrap;
}
.hus-name {
  font-size: 15px;
  font-weight: 800;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
  letter-spacing: -0.2px;
}
.hus-verified {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  font-weight: 700;
  color: #22c55e;
  background: rgba(34,197,94,0.1);
  border: 1px solid rgba(34,197,94,0.28);
  border-radius: 20px;
  padding: 1px 7px;
  white-space: nowrap;
  flex-shrink: 0;
  letter-spacing: 0.2px;
}
.hus-username {
  font-size: 12px;
  color: var(--gold);
  margin-bottom: 3px;
  font-weight: 600;
  opacity: 0.85;
}
.hus-meta {
  font-size: 11px;
  color: rgba(255,255,255,0.42);
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.hus-dot { color: rgba(255,255,255,0.18); }

/* ── Action buttons ── */
.hus-actions {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex-shrink: 0;
}

/* Profile button — gold gradient pill */
.hus-btn-profile {
  display: flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(135deg, #D4AF37 0%, #c49b2e 50%, #b8860b 100%);
  color: #000;
  border: none;
  border-radius: 20px;
  padding: 6px 13px;
  font-size: 11.5px;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
  letter-spacing: 0.2px;
  box-shadow: 0 2px 10px rgba(212,175,55,0.3);
  transition: transform .15s ease, box-shadow .15s ease, opacity .15s;
  /* 44px touch target height */
  min-height: 30px;
}
.hus-btn-profile:hover {
  transform: translateY(-1px) scale(1.03);
  box-shadow: 0 4px 16px rgba(212,175,55,0.45);
}
.hus-btn-profile:active {
  transform: scale(0.97);
  box-shadow: 0 1px 6px rgba(212,175,55,0.2);
}

/* Logout button — red ghost pill */
.hus-btn-logout {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(239,68,68,0.08);
  color: rgba(239,68,68,0.85);
  border: 1px solid rgba(239,68,68,0.22);
  border-radius: 20px;
  padding: 5px 13px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  letter-spacing: 0.2px;
  transition: background .15s ease, border-color .15s ease, transform .15s ease;
  min-height: 30px;
}
.hus-btn-logout:hover {
  background: rgba(239,68,68,0.16);
  border-color: rgba(239,68,68,0.4);
  transform: translateY(-1px);
}
.hus-btn-logout:active {
  transform: scale(0.97);
}

/* ── Divider — thin golden gradient line ── */
.hus-divider {
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(212,175,55,0.25) 20%,
    rgba(212,175,55,0.25) 80%,
    transparent 100%
  );
  margin: 0 10px;
  position: relative;
  z-index: 1;
}

/* ── Nav strip — horizontal scrollable pill tabs ── */
.hus-nav-strip {
  display: flex;
  align-items: center;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  padding: 6px 8px 8px;
  gap: 2px;
  position: relative;
  z-index: 1;
}
.hus-nav-strip::-webkit-scrollbar { display: none; }

/* Individual nav button */
.hus-nav-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 6px 11px 5px;
  min-width: 52px;
  min-height: 44px; /* Apple HIG touch target */
  border: none;
  background: transparent;
  color: rgba(255,255,255,0.38);
  font-size: 19px;
  cursor: pointer;
  border-radius: 12px;
  flex-shrink: 0;
  position: relative;
  transition:
    background  .18s ease,
    color       .18s ease,
    transform   .12s ease;
  -webkit-tap-highlight-color: transparent;
}
.hus-nav-btn span {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.35);
  transition: color .18s ease;
  white-space: nowrap;
}

/* Hover state */
.hus-nav-btn:hover {
  background: rgba(255,255,255,0.05);
  color: rgba(255,255,255,0.8);
}
.hus-nav-btn:hover span {
  color: rgba(255,255,255,0.7);
}

/* Active — glowing gold pill */
.hus-nav-btn.active {
  background: rgba(212,175,55,0.16);
  color: #D4AF37;
  box-shadow:
    0 0 0 1px rgba(212,175,55,0.3) inset,
    0 2px 8px rgba(212,175,55,0.12);
}
.hus-nav-btn.active span {
  color: #D4AF37;
  font-weight: 800;
}

/* Press effect */
.hus-nav-btn:active {
  transform: scale(0.92);
}

/* Notification badge on nav buttons */
.hus-nav-btn .notif-badge {
  position: absolute;
  top: 3px;
  right: 4px;
  background: #ef4444;
  color: #fff;
  font-size: 8px;
  font-weight: 800;
  border-radius: 20px;
  min-width: 14px;
  height: 14px;
  padding: 0 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(10,6,18,0.8);
  line-height: 1;
}

/* ── Light mode overrides ── */
.light-mode .home-unified-strip {
  background: rgba(255,255,255,0.65);
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
  border-color: rgba(212,175,55,0.3);
  box-shadow: 0 8px 32px rgba(0,0,0,0.12), 0 1px 0 rgba(255,255,255,0.8) inset;
}
.light-mode .home-unified-strip::before {
  background: radial-gradient(ellipse 70% 100% at 10% 50%, rgba(212,175,55,0.05) 0%, transparent 65%);
}
.light-mode .hus-name     { color: #1a1209; }
.light-mode .hus-meta     { color: rgba(0,0,0,0.5); }
.light-mode .hus-username { color: #b8860b; }
.light-mode .hus-avatar   { border-color: rgba(184,134,11,0.5); }
.light-mode .hus-online-dot { border-color: #f5f0e8; }
.light-mode .hus-nav-btn  { color: rgba(0,0,0,0.38); }
.light-mode .hus-nav-btn span { color: rgba(0,0,0,0.35); }
.light-mode .hus-nav-btn:hover { background: rgba(0,0,0,0.05); color: rgba(0,0,0,0.75); }
.light-mode .hus-nav-btn.active { background: rgba(212,175,55,0.15); color: #b8860b; }
.light-mode .hus-nav-btn.active span { color: #b8860b; }
.light-mode .hus-btn-logout { background: rgba(239,68,68,0.06); }
.light-mode .hus-divider { background: linear-gradient(90deg, transparent, rgba(184,134,11,0.2) 20%, rgba(184,134,11,0.2) 80%, transparent); }

/* ── Responsive ── */
@media (max-width: 380px) {
  .hus-name    { max-width: 100px; font-size: 14px; }
  .hus-meta    { display: none; }  /* hide on tiny screens */
  .hus-btn-profile, .hus-btn-logout { padding: 5px 9px; font-size: 10.5px; }
  .hus-nav-btn { padding: 5px 8px; min-width: 44px; font-size: 17px; }
  .home-unified-strip { margin: 10px 10px 0; border-radius: 18px; }
}

@media (max-width: 320px) {
  .hus-actions { display: none; }
  .hus-name    { max-width: 130px; }
}

