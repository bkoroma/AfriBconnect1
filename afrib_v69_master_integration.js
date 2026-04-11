/* ═══════════════════════════════════════════════════════════════════════
   AfribConnect v69 — Quartz Gifter + GiftMe UI Stylesheet
   Load AFTER: afrib_home_upgrade.css
   ═══════════════════════════════════════════════════════════════════════ */

/* ── Keyframes ── */
@keyframes v69GiftPulse {
  0%,100% { box-shadow:0 4px 18px rgba(0,0,0,.32); border-color:rgba(212,175,55,.18); }
  50%      { box-shadow:0 6px 24px rgba(212,175,55,.32),0 0 16px rgba(212,175,55,.14); border-color:rgba(212,175,55,.42); }
}
@keyframes v69PanelIn {
  from { opacity:0; transform:translateY(40px) scale(.98); }
  to   { opacity:1; transform:translateY(0) scale(1); }
}
@keyframes v69ChipGlow {
  0%,100% { box-shadow:0 4px 16px rgba(0,0,0,.4), 0 0 10px rgba(212,175,55,.25); }
  50%      { box-shadow:0 4px 20px rgba(0,0,0,.45), 0 0 22px rgba(212,175,55,.5); }
}
@keyframes v69CrystalFloat {
  0%,100% { transform:translateY(0); }
  50%      { transform:translateY(-3px); }
}
@keyframes v69FireFlicker {
  0%,100% { opacity:.8; transform:scaleY(1); }
  50%      { opacity:1;  transform:scaleY(1.08); }
}
@keyframes v69BadgeSpin {
  from { transform:rotate(0deg); }
  to   { transform:rotate(360deg); }
}

/* ── Quartz Hero Chip ── */
.v69-quartz-chip {
  animation: v69ChipGlow 3s ease-in-out infinite;
}
.v69-quartz-chip svg {
  animation: v69CrystalFloat 4s ease-in-out infinite;
  overflow: visible;
}

/* ── GiftMe nav button ── */
.hus-nav-btn[data-screen="giftme"] {
  color: rgba(212,175,55,.75) !important;
}
.hus-nav-btn[data-screen="giftme"] span {
  color: rgba(212,175,55,.65) !important;
}
.hus-nav-btn[data-screen="giftme"]:hover {
  background: rgba(212,175,55,.1) !important;
  color: #D4AF37 !important;
}
.hus-nav-btn[data-screen="giftme"]:hover span {
  color: #D4AF37 !important;
}

/* ── GiftMe Quick-Action card ── */
.hq-giftme-card {
  --cc: rgba(212,175,55,.22) !important;
  --cb: rgba(212,175,55,.65) !important;
  animation: v69GiftPulse 3.5s ease-in-out infinite;
}
.hq-giftme-card .hq-icon {
  filter: drop-shadow(0 0 8px rgba(212,175,55,.5)) drop-shadow(0 2px 6px rgba(0,0,0,.4));
}

/* ── Screen header GiftMe buttons ── */
.v69-giftme-btn {
  flex-shrink: 0;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.v69-giftme-btn:active {
  transform: scale(.96) !important;
  box-shadow: none !important;
}

/* ── Top Gifters Leaderboard Strip ── */
.v69-gifter-strip {
  /* Matches the home-animate-in delay set inline */
}
.v69-gifter-scroll {
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.v69-gifter-scroll::-webkit-scrollbar {
  display: none;
}
.v69-gifter-card {
  /* Base styles set inline; hover handled via JS for cross-browser compat */
  will-change: transform;
}

/* ── Quartz Panel scrollbar hide ── */
#v69-quartz-panel > div {
  scrollbar-width: none;
}
#v69-quartz-panel > div::-webkit-scrollbar {
  display: none;
}

/* ── Tier-colored glow on panel level badges ── */
.v69-level-badge-basic     { box-shadow:0 0 14px rgba(249,168,212,.3); }
.v69-level-badge-active    { box-shadow:0 0 16px rgba(244,114,182,.4); }
.v69-level-badge-power     { box-shadow:0 0 16px rgba(186,230,253,.35); }
.v69-level-badge-elite     { box-shadow:0 0 18px rgba(212,175,55,.4); }
.v69-level-badge-legendary { box-shadow:0 0 22px rgba(255,152,0,.5); }
.v69-level-badge-god       { box-shadow:0 0 28px rgba(212,175,55,.7); animation:v69ChipGlow 2s ease-in-out infinite; }

/* ── Mobile responsiveness ── */
@media (max-width: 480px) {
  .v69-giftme-btn span { display:none; }
  .v69-giftme-btn { padding:6px 9px; font-size:14px; }
  .v69-quartz-chip > div:last-child { display:none; }
  .v69-quartz-chip { padding:4px 6px; }
}
@media (max-width: 380px) {
  .v69-gifter-card { min-width:72px; }
}

/* ── Light mode overrides ── */
.light-mode .hq-giftme-card {
  --cc: rgba(184,134,11,.18) !important;
  --cb: rgba(184,134,11,.55) !important;
}
.light-mode .v69-giftme-btn {
  background: linear-gradient(135deg,rgba(184,134,11,.15),rgba(220,80,120,.1)) !important;
  border-color: rgba(184,134,11,.45) !important;
  color: #b8860b !important;
}
.light-mode .hus-nav-btn[data-screen="giftme"] {
  color: rgba(184,134,11,.75) !important;
}
.light-mode .hus-nav-btn[data-screen="giftme"] span {
  color: rgba(184,134,11,.6) !important;
}
