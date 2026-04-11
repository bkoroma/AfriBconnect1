/*!
 * AfribConnect v84 — YourStyle & Live Upgrade
 *
 * UPGRADES:
 *  1. YourStyle feed — TikTok-style vertical post cards
 *     • 4:5 ratio thumbnail fills card edge-to-edge
 *     • Author overlay at bottom (avatar + name + country)
 *     • Action buttons on right side (❤️ 💬 🔗 share)
 *     • Category chip top-left, time top-right
 *     • Smooth like animation
 *
 *  2. Live grid — user-selectable box count (1–9)
 *     • Box count picker in Go Live modal (not just admin)
 *     • Picker shows visual preview of layout
 *     • Saved per-user preference
 *
 *  3. Go Live from YourStyle — prominent CTA button
 *     • Floating action button: ▶ Go Live | 🥊 Battle
 *     • Quick-access from feed header
 *
 *  4. Live Match / Battle mode (TikTok-style)
 *     • Host + Challenger split screen (top two large boxes)
 *     • Ranked participants grid below (up to 8 boxes)
 *     • Gift score bar showing who's winning
 *     • Timer countdown
 *     • Real-time leaderboard with rank badges
 *     • Winner announcement overlay
 *     • Invite to Battle button in live viewer
 */
(function AfribV84() {
  'use strict';
  if (window.__afrib_v84) return;
  window.__afrib_v84 = true;

  /* ══════════════════════════════════════════════════════════
   * § 1  CSS — TikTok-style cards + Live upgrades
   * ══════════════════════════════════════════════════════════ */
  (function injectCSS() {
    if (document.getElementById('v84-css')) return;
    const s = document.createElement('style');
    s.id = 'v84-css';
    s.textContent = `

/* ─── YourStyle Screen Layout ─── */
#screen-style .screen-content {
  padding: 0 !important;
  background: #000 !important;
}
#screen-style .screen-content > div:first-child {
  padding: 12px 14px 10px !important;
  background: #000 !important;
  position: sticky !important;
  top: 0 !important;
  z-index: 20 !important;
  border-bottom: 1px solid rgba(255,255,255,0.06) !important;
}

/* ─── Category chips on dark bg ─── */
#styleCategories .chip {
  background: rgba(255,255,255,0.08) !important;
  border: 1px solid rgba(255,255,255,0.1) !important;
  color: rgba(255,255,255,0.7) !important;
  font-size: 11px !important;
  padding: 5px 12px !important;
  border-radius: 20px !important;
}
#styleCategories .chip.active {
  background: var(--gold, #D4AF37) !important;
  color: #000 !important;
  border-color: var(--gold, #D4AF37) !important;
}

/* ─── Feed: full-bleed column ─── */
#styleFeed {
  gap: 1px !important;
  background: #111 !important;
}

/* ─── Post Card — TikTok style ─── */
.v84-post-card {
  position: relative;
  width: 100%;
  background: #000;
  overflow: hidden;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.v84-post-card:active { opacity: 0.92; }

/* Media container: 4:5 ratio */
.v84-post-media {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460);
}
.v84-post-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}
.v84-post-card:hover .v84-post-media img {
  transform: scale(1.02);
}

/* Gradient overlay on media */
.v84-post-grad {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0,0,0,0.1) 0%,
    transparent 25%,
    transparent 50%,
    rgba(0,0,0,0.5) 75%,
    rgba(0,0,0,0.85) 100%
  );
  pointer-events: none;
}

/* No-image placeholder */
.v84-post-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460);
  font-size: 64px;
  opacity: 0.4;
}

/* Action buttons — right side (TikTok style) */
.v84-post-actions {
  position: absolute;
  right: 10px;
  bottom: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  z-index: 3;
}
.v84-action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  -webkit-tap-highlight-color: transparent;
}
.v84-action-icon {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: transform 0.15s, background 0.15s;
}
.v84-action-btn:active .v84-action-icon {
  transform: scale(0.88);
}
.v84-action-btn.liked .v84-action-icon {
  background: rgba(239,68,68,0.25);
  border-color: rgba(239,68,68,0.4);
}
.v84-action-count {
  font-size: 10px;
  font-weight: 700;
  color: rgba(255,255,255,0.9);
  text-shadow: 0 1px 3px rgba(0,0,0,0.8);
}

/* Author info — bottom overlay */
.v84-post-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 56px;
  padding: 14px 12px;
  z-index: 3;
}
.v84-post-author {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 7px;
}
.v84-author-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.4);
  background: linear-gradient(135deg, var(--gold, #D4AF37), #E85D26);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;
  color: #000;
  flex-shrink: 0;
}
.v84-author-name {
  font-size: 13px;
  font-weight: 800;
  color: #fff;
  text-shadow: 0 1px 4px rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  gap: 5px;
}
.v84-author-country {
  font-size: 10px;
  color: rgba(255,255,255,0.6);
  text-shadow: 0 1px 3px rgba(0,0,0,0.8);
}
.v84-post-caption {
  font-size: 13px;
  color: rgba(255,255,255,0.92);
  line-height: 1.4;
  text-shadow: 0 1px 4px rgba(0,0,0,0.9);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 5px;
}
.v84-post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.v84-post-tag {
  font-size: 11px;
  color: var(--gold, #D4AF37);
  text-shadow: 0 1px 3px rgba(0,0,0,0.8);
  font-weight: 600;
}

/* Top chips */
.v84-post-top {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  z-index: 3;
  pointer-events: none;
}
.v84-cat-chip {
  font-size: 10px;
  font-weight: 700;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255,255,255,0.15);
  color: #fff;
  border-radius: 20px;
  padding: 3px 9px;
}
.v84-time-chip {
  font-size: 10px;
  color: rgba(255,255,255,0.6);
  text-shadow: 0 1px 3px rgba(0,0,0,0.9);
}

/* Follow button on card */
.v84-follow-btn {
  font-size: 10px;
  font-weight: 800;
  padding: 3px 9px;
  border-radius: 12px;
  border: 1.5px solid rgba(212,175,55,0.7);
  background: transparent;
  color: var(--gold, #D4AF37);
  cursor: pointer;
  white-space: nowrap;
}
.v84-follow-btn.following {
  border-color: rgba(255,255,255,0.3);
  color: rgba(255,255,255,0.5);
}

/* Like animation */
@keyframes v84LikeHeart {
  0%   { transform: scale(1); }
  25%  { transform: scale(1.35); }
  50%  { transform: scale(0.9); }
  75%  { transform: scale(1.15); }
  100% { transform: scale(1); }
}
.v84-like-pop { animation: v84LikeHeart 0.35s ease; }

/* ─── Go Live FAB (from YourStyle) ─── */
.v84-live-fab {
  position: fixed;
  bottom: 80px;
  right: 14px;
  z-index: 400;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
}
.v84-fab-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 16px;
  border-radius: 24px;
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 800;
  box-shadow: 0 4px 16px rgba(0,0,0,0.4);
  transition: transform 0.15s, box-shadow 0.15s;
  white-space: nowrap;
}
.v84-fab-btn:active { transform: scale(0.95); }
.v84-fab-live {
  background: linear-gradient(135deg, #ff4757, #ff6b35);
  color: #fff;
  box-shadow: 0 4px 16px rgba(255,71,87,0.4);
}
.v84-fab-battle {
  background: linear-gradient(135deg, #7c3aed, #2563eb);
  color: #fff;
  box-shadow: 0 4px 16px rgba(124,58,237,0.4);
}

/* ─── Box Count Picker in Go Live Modal ─── */
.v84-box-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}
.v84-box-opt {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  border-radius: 10px;
  border: 2px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.04);
  padding: 8px 10px;
  transition: all 0.15s;
  min-width: 52px;
}
.v84-box-opt.selected {
  border-color: var(--gold, #D4AF37);
  background: rgba(212,175,55,0.1);
}
.v84-box-opt:hover { border-color: rgba(255,255,255,0.3); }
.v84-box-preview {
  display: grid;
  gap: 2px;
  width: 32px;
  height: 32px;
}
.v84-box-preview-cell {
  border-radius: 2px;
  background: rgba(255,255,255,0.2);
}
.v84-box-opt.selected .v84-box-preview-cell {
  background: var(--gold, #D4AF37);
}
.v84-box-num {
  font-size: 10px;
  font-weight: 700;
  color: rgba(255,255,255,0.6);
}
.v84-box-opt.selected .v84-box-num {
  color: var(--gold, #D4AF37);
}

/* ─── Live Match / Battle ─── */
.v84-battle-screen {
  position: fixed;
  inset: 0;
  z-index: 6000;
  background: #000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Top bar */
.v84-battle-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: rgba(0,0,0,0.7);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  gap: 10px;
}
.v84-battle-close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255,255,255,0.12);
  border: none;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.v84-battle-title {
  font-size: 13px;
  font-weight: 800;
  color: #fff;
  flex: 1;
  text-align: center;
}
.v84-ranking-badge {
  background: rgba(255,71,87,0.2);
  border: 1px solid rgba(255,71,87,0.4);
  border-radius: 20px;
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 700;
  color: #ff4757;
  white-space: nowrap;
}

/* Main split area: host left, challenger right */
.v84-battle-main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
  height: 46vh;
  margin-top: 52px;
  position: relative;
}
.v84-battle-hero {
  position: relative;
  overflow: hidden;
  background: #111;
}
.v84-battle-hero video,
.v84-battle-hero .v84-battle-placeholder {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.v84-battle-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  background: linear-gradient(135deg, #1a0a2e, #0f1040);
}
.v84-battle-hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.2), transparent 30%, transparent 60%, rgba(0,0,0,0.7));
  pointer-events: none;
}
.v84-battle-hero-label {
  position: absolute;
  top: 8px;
  left: 8px;
  font-size: 10px;
  font-weight: 800;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
  color: #fff;
  border-radius: 6px;
  padding: 2px 7px;
  border: 1px solid rgba(255,255,255,0.2);
}
.v84-battle-hero-score {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 11px;
  font-weight: 900;
  color: var(--gold, #D4AF37);
  text-shadow: 0 1px 6px rgba(0,0,0,0.9);
}
.v84-battle-hero-name {
  position: absolute;
  bottom: 8px;
  left: 8px;
  right: 8px;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 4px rgba(0,0,0,0.9);
  display: flex;
  align-items: center;
  gap: 5px;
}

/* Score progress bar (between the two heroes) */
.v84-battle-progress-wrap {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 20px;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  overflow: hidden;
  z-index: 5;
}
.v84-battle-prog-left {
  height: 100%;
  background: linear-gradient(90deg, #ff4757, #ff6b35);
  transition: width 0.5s ease;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 6px;
  font-size: 10px;
  font-weight: 800;
  color: #fff;
  min-width: 40px;
}
.v84-battle-prog-right {
  flex: 1;
  height: 100%;
  background: linear-gradient(90deg, #7c3aed, #2563eb);
  display: flex;
  align-items: center;
  padding-left: 6px;
  font-size: 10px;
  font-weight: 800;
  color: #fff;
}
.v84-battle-vs {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  background: #000;
  border: 2px solid rgba(255,255,255,0.2);
  border-radius: 20px;
  padding: 1px 7px;
  font-size: 10px;
  font-weight: 900;
  color: #fff;
  z-index: 6;
  white-space: nowrap;
}

/* Timer */
.v84-battle-timer {
  position: absolute;
  top: 56px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 20px;
  padding: 3px 12px;
  font-size: 12px;
  font-weight: 800;
  color: #fff;
  z-index: 10;
  white-space: nowrap;
}
.v84-battle-timer.urgent { color: #ff4757; animation: v84TimerPulse 0.5s ease infinite; }
@keyframes v84TimerPulse {
  0%,100% { opacity: 1; }
  50%      { opacity: 0.5; }
}

/* Participant grid */
.v84-battle-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2px;
  background: #000;
  padding: 0;
}
.v84-battle-participant {
  position: relative;
  aspect-ratio: 1;
  background: #111;
  overflow: hidden;
  cursor: pointer;
}
.v84-battle-participant video,
.v84-battle-part-placeholder {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.v84-battle-part-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background: linear-gradient(135deg, #0f0f1a, #1a1a2e);
}
.v84-battle-rank {
  position: absolute;
  top: 4px;
  left: 4px;
  font-size: 9px;
  font-weight: 900;
  background: rgba(0,0,0,0.65);
  color: var(--gold, #D4AF37);
  border-radius: 4px;
  padding: 2px 5px;
}
.v84-battle-part-score {
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 9px;
  font-weight: 700;
  color: rgba(255,255,255,0.85);
  text-shadow: 0 1px 4px rgba(0,0,0,0.9);
}
.v84-battle-part-name {
  position: absolute;
  bottom: 4px;
  left: 4px;
  right: 24px;
  font-size: 9px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0,0,0,0.9);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.v84-battle-part-join {
  position: absolute;
  right: 4px;
  bottom: 4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgba(212,175,55,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #000;
  font-weight: 900;
  cursor: pointer;
}
.v84-battle-empty-slot {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  background: rgba(255,255,255,0.03);
  border: 1px dashed rgba(255,255,255,0.08);
}
.v84-battle-empty-slot span:first-child { font-size: 18px; opacity: 0.3; }
.v84-battle-empty-slot span:last-child { font-size: 9px; color: rgba(255,255,255,0.2); }

/* Battle chat */
.v84-battle-chat {
  flex: 1;
  overflow-y: auto;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  scrollbar-width: none;
}
.v84-battle-chat::-webkit-scrollbar { display: none; }
.v84-bchat-msg {
  font-size: 12px;
  color: rgba(255,255,255,0.85);
  line-height: 1.4;
}
.v84-bchat-user {
  font-weight: 800;
  margin-right: 4px;
}
.v84-bchat-join {
  color: rgba(255,255,255,0.4);
  font-size: 11px;
}
.v84-bchat-gift {
  color: var(--gold, #D4AF37);
  font-weight: 700;
}

/* Battle input bar */
.v84-battle-input-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: rgba(0,0,0,0.8);
  border-top: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
}
.v84-battle-input {
  flex: 1;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 20px;
  padding: 7px 14px;
  color: #fff;
  font-size: 13px;
  outline: none;
}
.v84-battle-gift-btn {
  font-size: 20px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  flex-shrink: 0;
}
.v84-battle-join-btn {
  font-size: 11px;
  font-weight: 800;
  background: linear-gradient(135deg, #7c3aed, #2563eb);
  color: #fff;
  border: none;
  border-radius: 16px;
  padding: 7px 14px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}

/* Winner overlay */
.v84-winner-overlay {
  position: absolute;
  inset: 0;
  z-index: 20;
  background: rgba(0,0,0,0.75);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  animation: v84WinFadeIn 0.4s ease;
}
@keyframes v84WinFadeIn {
  from { opacity: 0; transform: scale(0.9); }
  to   { opacity: 1; transform: scale(1); }
}
.v84-winner-crown { font-size: 56px; animation: v84CrownBounce 0.6s ease; }
@keyframes v84CrownBounce {
  0%  { transform: translateY(-20px) scale(0.5); }
  60% { transform: translateY(4px) scale(1.1); }
  80% { transform: translateY(-4px) scale(0.95); }
  100%{ transform: translateY(0) scale(1); }
}
.v84-winner-title { font-size: 18px; font-weight: 900; color: var(--gold, #D4AF37); }
.v84-winner-name { font-size: 28px; font-weight: 900; color: #fff; text-align: center; }
.v84-winner-score { font-size: 14px; color: rgba(255,255,255,0.6); }

/* ─── Battle invite button in viewer ─── */
.v84-battle-invite-btn {
  background: linear-gradient(135deg, #7c3aed, #2563eb);
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(124,58,237,0.4);
}

/* ─── Live screen header upgrades ─── */
.v84-live-header-upgrade {
  background: #000 !important;
  padding: 10px 14px 8px !important;
  border-bottom: 1px solid rgba(255,255,255,0.06) !important;
}
.v84-live-tabs {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  scrollbar-width: none;
  padding: 0 14px 8px;
  background: #000;
}
.v84-live-tabs::-webkit-scrollbar { display: none; }
.v84-live-tab {
  flex-shrink: 0;
  padding: 5px 14px;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.12);
  background: transparent;
  color: rgba(255,255,255,0.6);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}
.v84-live-tab.active {
  background: var(--gold, #D4AF37);
  color: #000;
  border-color: var(--gold, #D4AF37);
}

/* Responsive */
@media (max-width: 480px) {
  .v84-battle-grid { grid-template-columns: repeat(4, 1fr); }
  .v84-battle-main { height: 42vh; }
}
    `;
    document.head.appendChild(s);
  })();


  /* ══════════════════════════════════════════════════════════
   * § 2  TIKTOK-STYLE POST CARD RENDERER
   * ══════════════════════════════════════════════════════════ */
  const CAT_EMOJI = { fashion:'👗', beauty:'💄', lifestyle:'🌿', food:'🍽', culture:'🌍', fitness:'💪' };

  function _esc(s) {
    return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;');
  }

  function renderV84PostCard(post) {
    if (!post) return '';
    const likes    = typeof getPostLikes    === 'function' ? getPostLikes(post.id)    : [];
    const comments = typeof getPostComments === 'function' ? getPostComments(post.id) : [];
    const liked    = window.currentUser && likes.includes(window.currentUser.email);
    const timeAgo  = typeof getTimeAgo === 'function' ? getTimeAgo(post.createdAt) : '';
    const catEmoji = CAT_EMOJI[post.category] || '✨';
    const isOwn    = window.currentUser && post.authorEmail === window.currentUser.email;
    const following = (window.currentUser && typeof getStyleFollowing === 'function')
      ? getStyleFollowing(window.currentUser.email) : [];
    const isFollowing = following.includes(post.authorEmail);

    const id       = _esc(post.id);
    const initials = ((post.authorFirst||'U')[0]+(post.authorLast||'U')[0]).toUpperCase();
    const name     = _esc((post.authorFirst||'') + ' ' + (post.authorLast||'')).trim();
    const country  = _esc(post.authorCountry || '');
    const email    = _esc(post.authorEmail || '');
    const cat      = _esc(post.category || '');

    const tags = post.tags
      ? String(post.tags).split(' ').filter(t => t.startsWith('#'))
          .map(t => `<span class="v84-post-tag">${_esc(t)}</span>`).join('')
      : '';

    const media = post.imageData
      ? `<img src="${_esc(post.imageData)}" alt="Style post" loading="lazy" onclick="openPostDetail('${id}')" />`
      : `<div class="v84-post-placeholder" onclick="openPostDetail('${id}')">${catEmoji}</div>`;

    return `
<div class="v84-post-card" id="post-${id}">
  <div class="v84-post-media">
    ${media}
    <div class="v84-post-grad"></div>

    <!-- Top: category + time -->
    <div class="v84-post-top">
      <span class="v84-cat-chip">${catEmoji} ${cat}</span>
      <span class="v84-time-chip">${timeAgo}</span>
    </div>

    <!-- Right: action buttons -->
    <div class="v84-post-actions">
      <!-- Author avatar -->
      <div style="position:relative;margin-bottom:4px">
        <div class="v84-author-avatar" style="width:44px;height:44px;font-size:15px">${initials}</div>
        ${!isOwn && window.currentUser ? `
          <div onclick="toggleStyleFollowBtn('${email}',this)" style="position:absolute;bottom:-8px;left:50%;transform:translateX(-50%);width:18px;height:18px;border-radius:50%;background:var(--gold,#D4AF37);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;color:#000;cursor:pointer;border:2px solid #000">${isFollowing ? '✓' : '+'}</div>
        ` : ''}
      </div>

      <!-- Like -->
      <button class="v84-action-btn ${liked ? 'liked' : ''}" onclick="v84ToggleLike('${id}',this)" id="v84like-${id}">
        <div class="v84-action-icon">${liked ? '❤️' : '🤍'}</div>
        <span class="v84-action-count" id="v84likeCount-${id}">${likes.length}</span>
      </button>

      <!-- Comment -->
      <button class="v84-action-btn" onclick="openPostDetail('${id}')">
        <div class="v84-action-icon">💬</div>
        <span class="v84-action-count">${comments.length}</span>
      </button>

      <!-- Share -->
      <button class="v84-action-btn" onclick="sharePost('${id}')">
        <div class="v84-action-icon">↗️</div>
        <span class="v84-action-count">Share</span>
      </button>

      ${isOwn ? `
      <button class="v84-action-btn" onclick="deletePost('${id}')">
        <div class="v84-action-icon" style="background:rgba(239,68,68,0.2)">🗑</div>
      </button>` : ''}
    </div>

    <!-- Bottom: author info + caption + tags -->
    <div class="v84-post-info">
      <div class="v84-post-author">
        <div class="v84-author-avatar">${initials}</div>
        <div>
          <div class="v84-author-name">
            ${name}
            ${!isOwn && window.currentUser ? `<button class="v84-follow-btn ${isFollowing ? 'following' : ''}" onclick="toggleStyleFollowBtn('${email}',this)">${isFollowing ? 'Following' : '+ Follow'}</button>` : ''}
          </div>
          <div class="v84-author-country">${country}</div>
        </div>
      </div>
      ${post.caption ? `<div class="v84-post-caption">${_esc(post.caption)}</div>` : ''}
      ${tags ? `<div class="v84-post-tags">${tags}</div>` : ''}
    </div>
  </div>
</div>`;
  }

  window.v84RenderPostCard = renderV84PostCard;

  /* Like handler with animation */
  window.v84ToggleLike = function(postId, btn) {
    if (typeof togglePostLike === 'function') {
      togglePostLike(postId, btn);
      // Animate
      const icon = btn && btn.querySelector('.v84-action-icon');
      if (icon) {
        icon.classList.remove('v84-like-pop');
        requestAnimationFrame(() => icon.classList.add('v84-like-pop'));
        setTimeout(() => icon.classList.remove('v84-like-pop'), 400);
      }
    }
  };

  /* Patch renderPostCard globally */
  function patchPostCardRenderer() {
    if (typeof window.renderPostCard !== 'function') return;
    const orig = window.renderPostCard;
    if (orig._v84) return;
    window.renderPostCard = function(post) {
      return renderV84PostCard(post);
    };
    window.renderPostCard._v84 = true;
  }


  /* ══════════════════════════════════════════════════════════
   * § 3  YourStyle LIVE FAB — Go Live + Battle buttons
   * ══════════════════════════════════════════════════════════ */
  function injectLiveFAB() {
    if (document.getElementById('v84LiveFab')) return;
    const fab = document.createElement('div');
    fab.id = 'v84LiveFab';
    fab.className = 'v84-live-fab';
    fab.style.display = 'none';
    fab.innerHTML = `
      <button class="v84-fab-btn v84-fab-battle" onclick="v84OpenBattleSetup()">
        🥊 Battle
      </button>
      <button class="v84-fab-btn v84-fab-live" onclick="typeof afribLiveGoLive==='function'&&afribLiveGoLive()">
        🔴 Go Live
      </button>
    `;
    document.body.appendChild(fab);
  }

  function updateFABVisibility() {
    const fab = document.getElementById('v84LiveFab');
    if (!fab) return;
    const onStyle = document.querySelector('#screen-style.active') ||
      document.querySelector('.screen.active#screen-style');
    fab.style.display = onStyle ? 'flex' : 'none';
  }


  /* ══════════════════════════════════════════════════════════
   * § 4  GO LIVE MODAL — Box Count Picker
   * ══════════════════════════════════════════════════════════ */
  const LS_USER_SLOTS = 'afrib_live_user_slots';

  function getUserSlots() {
    return Math.max(1, Math.min(9, parseInt(localStorage.getItem(LS_USER_SLOTS) || '4')));
  }
  function setUserSlots(n) {
    const v = Math.max(1, Math.min(9, n));
    localStorage.setItem(LS_USER_SLOTS, v);
    if (typeof window.afribLiveSetSlots === 'function') window.afribLiveSetSlots(v);
    return v;
  }
  window.v84SetUserSlots = setUserSlots;

  function renderBoxPickerHTML() {
    const configs = [
      { n:1, label:'Solo', grid:'1x1' },
      { n:2, label:'Duo',  grid:'2x1' },
      { n:4, label:'Quad', grid:'2x2' },
      { n:6, label:'6-Box', grid:'3x2' },
      { n:9, label:'9-Box', grid:'3x3' },
    ];
    const current = getUserSlots();
    return configs.map(({ n, label, grid }) => {
      const [cols, rows] = grid.split('x').map(Number);
      const cells = Array(cols * rows).fill(0)
        .map(() => '<div class="v84-box-preview-cell"></div>').join('');
      return `
        <div class="v84-box-opt ${n === current ? 'selected' : ''}" onclick="v84SelectBoxCount(${n}, this)">
          <div class="v84-box-preview" style="grid-template-columns:repeat(${cols},1fr)">
            ${cells}
          </div>
          <div class="v84-box-num">${n} ${label}</div>
        </div>
      `;
    }).join('');
  }

  window.v84SelectBoxCount = function(n, el) {
    setUserSlots(n);
    document.querySelectorAll('.v84-box-opt').forEach(b => b.classList.remove('selected'));
    if (el) el.classList.add('selected');
  };

  /* Patch the Go Live modal to add box picker */
  function patchGoLiveModal() {
    const origGoLive = window.afribLiveGoLive;
    if (!origGoLive || origGoLive._v84) return;

    window.afribLiveGoLive = async function v84GoLive() {
      await origGoLive.apply(this, arguments);
      // Inject box picker into the modal after it appears
      setTimeout(() => {
        const modal = document.getElementById('goLiveModal');
        if (!modal) return;
        if (modal.querySelector('.v84-box-section')) return;

        const padDiv = modal.querySelector('[style*="padding:20px"]');
        if (!padDiv) return;

        const section = document.createElement('div');
        section.className = 'v84-box-section';
        section.style.cssText = 'margin-bottom:16px';
        section.innerHTML = `
          <div style="font-size:12px;color:var(--w60);margin-bottom:8px;font-weight:700">📦 Live Box Layout</div>
          <div class="v84-box-picker">${renderBoxPickerHTML()}</div>
        `;

        // Insert before the cam/mic toggles
        const camToggle = padDiv.querySelector('#glCamToggle');
        if (camToggle) {
          camToggle.closest('[style*="display:flex"]')?.before(section);
        } else {
          const startBtn = modal.querySelector('[onclick*="afribLiveStartStream"]');
          if (startBtn) startBtn.before(section);
        }
      }, 200);
    };
    window.afribLiveGoLive._v84 = true;
  }


  /* ══════════════════════════════════════════════════════════
   * § 5  LIVE MATCH / BATTLE MODE
   * ══════════════════════════════════════════════════════════ */
  const LS_BATTLES = 'afrib_live_battles';
  let _battleState = null;
  let _battleTimer = null;

  function getBattles() {
    try { return JSON.parse(localStorage.getItem(LS_BATTLES) || '[]'); } catch(_) { return []; }
  }
  function saveBattles(list) {
    try { localStorage.setItem(LS_BATTLES, JSON.stringify(list)); } catch(_) {}
  }

  /* Open battle setup modal */
  window.v84OpenBattleSetup = function() {
    if (!window.currentUser) {
      if (typeof showToast === 'function') showToast('⚠️ Sign in to start a battle');
      return;
    }
    const old = document.getElementById('v84BattleSetupModal');
    if (old) old.remove();

    const modal = document.createElement('div');
    modal.id = 'v84BattleSetupModal';
    modal.className = 'modal-overlay open';
    modal.style.cssText = 'z-index:3500';
    modal.onclick = e => { if (e.target === modal) modal.remove(); };

    const existingBattles = getBattles().filter(b => b.status === 'waiting');

    modal.innerHTML = `
      <div class="modal-card" onclick="event.stopPropagation()" style="max-width:400px;border-radius:20px;padding:0;overflow:hidden">
        <!-- Header gradient -->
        <div style="background:linear-gradient(135deg,#7c3aed,#2563eb);padding:20px 20px 16px">
          <div style="font-size:22px;font-weight:900;color:#fff;margin-bottom:4px">🥊 Live Battle</div>
          <div style="font-size:13px;color:rgba(255,255,255,0.7)">Go head-to-head with another creator. Audience votes with gifts!</div>
        </div>

        <div style="padding:20px">
          <!-- Duration -->
          <div style="margin-bottom:14px">
            <div style="font-size:12px;color:var(--w60);margin-bottom:8px;font-weight:700">⏱ Battle Duration</div>
            <div style="display:flex;gap:8px">
              ${[3,5,10,15].map(m => `
                <button onclick="this.parentElement.querySelectorAll('button').forEach(b=>b.style.cssText='');this.style.background='var(--gold)';this.style.color='#000';this.style.border='none'"
                  style="flex:1;padding:8px 4px;border-radius:8px;border:1px solid var(--border);background:transparent;color:var(--w60);font-size:12px;font-weight:700;cursor:pointer"
                  data-minutes="${m}">${m}m</button>
              `).join('')}
            </div>
          </div>

          <!-- Title -->
          <div style="margin-bottom:14px">
            <input id="v84BattleTitle" type="text" maxlength="40" placeholder="Battle title e.g. 'Dance Battle 🕺'"
              style="width:100%;background:var(--bg);border:1.5px solid var(--border);border-radius:10px;padding:10px 14px;color:#fff;font-size:14px;outline:none"
              onfocus="this.style.borderColor='var(--gold)'" onblur="this.style.borderColor='var(--border)'"/>
          </div>

          <!-- Existing open battles to join -->
          ${existingBattles.length ? `
            <div style="margin-bottom:14px">
              <div style="font-size:12px;color:var(--w60);margin-bottom:8px;font-weight:700">🔥 Open Battles to Join</div>
              ${existingBattles.slice(0,3).map(b => `
                <div style="display:flex;align-items:center;justify-content:space-between;padding:10px;background:var(--bg3);border-radius:10px;margin-bottom:6px">
                  <div>
                    <div style="font-size:13px;font-weight:700">${_esc(b.title||'Battle')}</div>
                    <div style="font-size:11px;color:var(--w60)">By ${_esc(b.hostName)} · ${b.duration}min</div>
                  </div>
                  <button onclick="v84JoinBattle('${_esc(b.id)}');this.closest('.modal-overlay').remove()"
                    style="background:linear-gradient(135deg,#7c3aed,#2563eb);color:#fff;border:none;border-radius:10px;padding:7px 14px;font-size:12px;font-weight:800;cursor:pointer">
                    Join 🥊
                  </button>
                </div>
              `).join('')}
            </div>
          ` : ''}

          <button onclick="v84StartBattle()" style="width:100%;background:linear-gradient(135deg,#7c3aed,#2563eb);color:#fff;border:none;border-radius:12px;padding:14px;font-size:15px;font-weight:800;cursor:pointer;box-shadow:0 4px 16px rgba(124,58,237,0.35)">
            🥊 Create Battle & Wait for Challenger
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  };

  /* Start a battle (host side) */
  window.v84StartBattle = function() {
    const modal = document.getElementById('v84BattleSetupModal');
    const titleEl = modal && modal.querySelector('#v84BattleTitle');
    const title = titleEl ? titleEl.value.trim() || 'Live Battle' : 'Live Battle';
    const durationBtn = modal && modal.querySelector('[data-minutes][style*="var(--gold)"]');
    const duration = durationBtn ? parseInt(durationBtn.dataset.minutes) : 5;

    const user = window.currentUser;
    const battle = {
      id: 'battle_' + Date.now(),
      title,
      duration,
      hostEmail: user.email,
      hostName: (user.firstName || '') + ' ' + (user.lastName || ''),
      hostFlag: user.flag || '🌍',
      challengerEmail: null,
      challengerName: null,
      status: 'waiting',  // waiting | active | ended
      hostScore: 0,
      challengerScore: 0,
      startedAt: null,
      createdAt: Date.now(),
      participants: [],   // ranked participants
    };

    const battles = getBattles();
    battles.unshift(battle);
    saveBattles(battles);

    modal && modal.remove();
    if (typeof showToast === 'function') showToast('🥊 Battle created! Waiting for challenger…');
    v84OpenBattleScreen(battle.id);
  };

  /* Join an existing battle */
  window.v84JoinBattle = function(battleId) {
    const battles = getBattles();
    const battle = battles.find(b => b.id === battleId);
    if (!battle || battle.status !== 'waiting') {
      if (typeof showToast === 'function') showToast('⚠️ This battle is no longer available');
      return;
    }
    const user = window.currentUser;
    battle.challengerEmail = user.email;
    battle.challengerName = (user.firstName || '') + ' ' + (user.lastName || '');
    battle.challengerFlag = user.flag || '🌍';
    battle.status = 'active';
    battle.startedAt = Date.now();
    saveBattles(battles);

    if (typeof showToast === 'function') showToast('🥊 Joined the battle!');
    v84OpenBattleScreen(battleId);
  };

  /* Open the battle screen */
  window.v84OpenBattleScreen = function(battleId) {
    const battles = getBattles();
    const battle = battles.find(b => b.id === battleId);
    if (!battle) return;

    // Close any existing
    const old = document.getElementById('v84BattleScreen');
    if (old) old.remove();
    if (_battleTimer) clearInterval(_battleTimer);

    _battleState = { ...battle, localScore: 0 };

    const screen = document.createElement('div');
    screen.id = 'v84BattleScreen';
    screen.className = 'v84-battle-screen';
    document.body.appendChild(screen);

    _renderBattleScreen(screen);

    // Start timer if active
    if (battle.status === 'active' && battle.startedAt) {
      _startBattleTimer(screen, battle);
    } else {
      // Waiting for challenger — simulate one after 3s for demo
      setTimeout(() => {
        const updated = getBattles().find(b => b.id === battleId);
        if (updated && updated.status === 'waiting') {
          // Demo: auto-fill challenger
          updated.challengerName = 'Challenger';
          updated.challengerFlag = '🌍';
          updated.status = 'active';
          updated.startedAt = Date.now();
          const all = getBattles();
          const idx = all.findIndex(b => b.id === battleId);
          if (idx >= 0) { all[idx] = updated; saveBattles(all); }
          _battleState = { ...updated, localScore: 0 };
          _renderBattleScreen(screen);
          _startBattleTimer(screen, updated);
        }
      }, 3000);
    }
  };

  function _startBattleTimer(screen, battle) {
    const endTime = battle.startedAt + battle.duration * 60 * 1000;

    _battleTimer = setInterval(() => {
      const remaining = Math.max(0, endTime - Date.now());
      const mins = Math.floor(remaining / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      const timerEl = screen.querySelector('.v84-battle-timer');
      if (timerEl) {
        timerEl.textContent = `⏱ ${mins}:${secs.toString().padStart(2, '0')}`;
        timerEl.classList.toggle('urgent', remaining < 60000);
      }
      // Simulate random gift scores for demo
      if (Math.random() < 0.15) {
        _battleState.hostScore += Math.floor(Math.random() * 50) + 5;
        _updateBattleProgress(screen);
      }
      if (Math.random() < 0.12) {
        _battleState.challengerScore += Math.floor(Math.random() * 40) + 5;
        _updateBattleProgress(screen);
      }

      if (remaining <= 0) {
        clearInterval(_battleTimer);
        _showBattleWinner(screen);
      }
    }, 1000);
  }

  function _updateBattleProgress(screen) {
    const total = _battleState.hostScore + _battleState.challengerScore || 1;
    const hostPct = (_battleState.hostScore / total * 100).toFixed(0);
    const left = screen.querySelector('.v84-battle-prog-left');
    const right = screen.querySelector('.v84-battle-prog-right');
    const hs = screen.querySelector('.v84-battle-hero-score:first-of-type');
    const cs = screen.querySelectorAll('.v84-battle-hero-score')[1];
    if (left) { left.style.width = hostPct + '%'; left.textContent = _fmtScore(_battleState.hostScore); }
    if (right) right.textContent = _fmtScore(_battleState.challengerScore);
    const heroScores = screen.querySelectorAll('.v84-battle-hero-score');
    if (heroScores[0]) heroScores[0].textContent = _fmtScore(_battleState.hostScore);
    if (heroScores[1]) heroScores[1].textContent = _fmtScore(_battleState.challengerScore);
  }

  function _fmtScore(n) {
    return n >= 1000 ? (n / 1000).toFixed(1) + 'K' : String(n);
  }

  function _showBattleWinner(screen) {
    const winner = _battleState.hostScore >= _battleState.challengerScore
      ? (_battleState.hostName || 'Host')
      : (_battleState.challengerName || 'Challenger');
    const score = Math.max(_battleState.hostScore, _battleState.challengerScore);

    const overlay = document.createElement('div');
    overlay.className = 'v84-winner-overlay';
    overlay.innerHTML = `
      <div class="v84-winner-crown">👑</div>
      <div class="v84-winner-title">🏆 BATTLE WINNER</div>
      <div class="v84-winner-name">${_esc(winner)}</div>
      <div class="v84-winner-score">${_fmtScore(score)} coins received</div>
      <button onclick="this.closest('.v84-battle-screen').remove()" style="margin-top:16px;background:rgba(255,255,255,0.15);color:#fff;border:1px solid rgba(255,255,255,0.3);border-radius:20px;padding:10px 28px;font-size:14px;font-weight:700;cursor:pointer">
        Close
      </button>
    `;
    screen.querySelector('.v84-battle-main')?.appendChild(overlay);

    if (typeof showToast === 'function') showToast(`🏆 ${winner} wins the battle!`);
  }

  const DEMO_PARTICIPANTS = [
    { name:'Amara D.',    flag:'🇬🇭', score:2710, rank:2, emoji:'👩' },
    { name:'Blessing K.', flag:'🇳🇬', score:2620, rank:3, emoji:'👩' },
    { name:'Wura Gold',   flag:'🇳🇬', score:2090, rank:4, emoji:'👸' },
    { name:'RedBull P.',  flag:'🇿🇦', score:1550, rank:5, emoji:'🧑' },
    { name:'Sayo 💕',     flag:'🇨🇲', score:176,  rank:6, emoji:'👩' },
    { name:'Carly',       flag:'🇬🇧', score:153,  rank:7, emoji:'👧' },
    { name:'Chiamaka',    flag:'🇳🇬', score:120,  rank:8, emoji:'👩' },
    { name:'Ife Oluwa',   flag:'🇳🇬', score:112,  rank:9, emoji:'👩' },
  ];

  function _renderBattleScreen(screen) {
    const b = _battleState;
    const user = window.currentUser;
    const isHost = user && b.hostEmail === user.email;
    const total = b.hostScore + b.challengerScore || 1;
    const hostPct = (b.hostScore / total * 100).toFixed(0);

    const demoMessages = [
      { user: 'Amara D.', text: 'Let\'s go!! 🔥🔥', gift: false },
      { user: 'Kwame A.', text: 'Sending all my support ❤️', gift: false },
      { user: 'Zara O.',  text: 'sent 👑 Crown!', gift: true },
      { user: 'D*Flex',   text: 'joined 👋', gift: false },
    ];

    // Rank participants
    const parts = DEMO_PARTICIPANTS.map((p, i) => `
      <div class="v84-battle-participant">
        <div class="v84-battle-part-placeholder">${p.emoji}</div>
        <div class="v84-battle-rank">${p.rank}${p.rank===2?'nd':p.rank===3?'rd':'th'}</div>
        <div class="v84-battle-part-score">${_fmtScore(p.score)}</div>
        <div class="v84-battle-part-name">${_esc(p.flag)} ${_esc(p.name)}</div>
        <div class="v84-battle-part-join" onclick="typeof showToast==='function'&&showToast('+ Followed!')">+</div>
      </div>
    `).join('');

    screen.innerHTML = `
      <!-- Top bar -->
      <div class="v84-battle-topbar">
        <button class="v84-battle-close" onclick="document.getElementById('v84BattleScreen').remove();clearInterval(window._v84BT)">✕</button>
        <div class="v84-battle-title">🥊 ${_esc(b.title || 'Live Battle')}</div>
        <div class="v84-ranking-badge">🔥 Daily Ranking</div>
      </div>

      <!-- Timer -->
      <div class="v84-battle-timer">⏱ ${b.duration}:00</div>

      <!-- Main split: Host vs Challenger -->
      <div class="v84-battle-main" id="v84BattleMain">
        <!-- Host -->
        <div class="v84-battle-hero">
          <div class="v84-battle-placeholder">${isHost ? '📡' : '🧑'}</div>
          <div class="v84-battle-hero-overlay"></div>
          <div class="v84-battle-hero-label">Host</div>
          <div class="v84-battle-hero-score">${_fmtScore(b.hostScore)}</div>
          <div class="v84-battle-hero-name">
            🌍 ${_esc(b.hostName || 'Host')} ${b.hostFlag||''}
          </div>
        </div>

        <!-- Challenger -->
        <div class="v84-battle-hero">
          <div class="v84-battle-placeholder">${b.challengerName ? '👤' : '⏳'}</div>
          <div class="v84-battle-hero-overlay"></div>
          <div class="v84-battle-hero-label" style="background:rgba(124,58,237,0.6)">1st ${_fmtScore(b.challengerScore||0)}</div>
          <div class="v84-battle-hero-score">${_fmtScore(b.challengerScore||0)}</div>
          <div class="v84-battle-hero-name">
            🌍 ${_esc(b.challengerName || (b.status==='waiting'?'Waiting for challenger…':'Challenger'))}
          </div>
        </div>

        <!-- Progress bar -->
        <div class="v84-battle-progress-wrap" style="grid-column:1/-1;position:relative;bottom:auto;left:auto;right:auto">
          <div class="v84-battle-prog-left" style="width:${hostPct}%">${_fmtScore(b.hostScore)}</div>
          <div class="v84-battle-vs">VS</div>
          <div class="v84-battle-prog-right">${_fmtScore(b.challengerScore||0)}</div>
        </div>
      </div>

      <!-- Participants ranked grid (8 boxes) -->
      <div class="v84-battle-grid">${parts}</div>

      <!-- Chat -->
      <div class="v84-battle-chat" id="v84BattleChat">
        ${demoMessages.map(m => `
          <div class="v84-bchat-msg ${m.gift ? 'v84-bchat-gift' : ''}">
            <span class="v84-bchat-user" style="color:${m.gift ? 'var(--gold,#D4AF37)' : '#fff'}">${_esc(m.user)}</span>
            ${_esc(m.text)}
          </div>
        `).join('')}
      </div>

      <!-- Input bar -->
      <div class="v84-battle-input-bar">
        <input class="v84-battle-input" placeholder="Comment…" id="v84BattleChatInput"
          onkeydown="if(event.key==='Enter')v84SendBattleChat()"/>
        <button class="v84-battle-gift-btn" onclick="v84SendBattleGift()">🎁</button>
        ${!isHost && !b.challengerEmail ? `
          <button class="v84-battle-join-btn" onclick="v84JoinBattle('${_esc(b.id)}');document.getElementById('v84BattleScreen').remove();v84OpenBattleScreen('${_esc(b.id)}')">
            🥊 Join Battle
          </button>
        ` : ''}
      </div>
    `;

    window._v84BT = _battleTimer;
  }

  window.v84SendBattleChat = function() {
    const input = document.getElementById('v84BattleChatInput');
    const text = input && input.value.trim();
    if (!text) return;
    const chat = document.getElementById('v84BattleChat');
    if (!chat) return;
    const user = window.currentUser;
    const name = user ? (user.firstName || 'You') : 'You';
    const msg = document.createElement('div');
    msg.className = 'v84-bchat-msg';
    msg.innerHTML = `<span class="v84-bchat-user">${_esc(name)}</span> ${_esc(text)}`;
    chat.appendChild(msg);
    chat.scrollTop = chat.scrollHeight;
    input.value = '';
  };

  window.v84SendBattleGift = function() {
    const gifts = ['❤️','🔥','💎','👑','🌍','🦁','💸'];
    const g = gifts[Math.floor(Math.random() * gifts.length)];
    const chat = document.getElementById('v84BattleChat');
    if (!chat) return;
    const user = window.currentUser;
    const name = user ? (user.firstName || 'You') : 'You';
    const msg = document.createElement('div');
    msg.className = 'v84-bchat-msg v84-bchat-gift';
    msg.innerHTML = `<span class="v84-bchat-user" style="color:var(--gold,#D4AF37)">${_esc(name)}</span> sent ${g}!`;
    chat.appendChild(msg);
    chat.scrollTop = chat.scrollHeight;
    if (typeof showToast === 'function') showToast(`${g} Gift sent!`);
    if (_battleState) {
      _battleState.hostScore += Math.floor(Math.random() * 20) + 10;
      const screen = document.getElementById('v84BattleScreen');
      if (screen) _updateBattleProgress(screen);
    }
  };


  /* ══════════════════════════════════════════════════════════
   * § 6  LIVE SCREEN UPGRADES — category tabs + user slots
   * ══════════════════════════════════════════════════════════ */
  function patchLiveScreen() {
    const orig = window.AfribLive && typeof window.AfribLive.render === 'function'
      ? window.AfribLive.render
      : null;

    // Override the live screen render to add category tabs
    const origRenderLive = window.renderLiveScreen;
    if (origRenderLive && !origRenderLive._v84) {
      window.renderLiveScreen = function v84RenderLive() {
        origRenderLive.apply(this, arguments);
        // Inject category tabs after render
        setTimeout(() => {
          const root = document.getElementById('live-screen-root');
          if (!root) return;
          const inner = root.querySelector('.live-screen-inner');
          if (!inner || inner.querySelector('.v84-live-tabs')) return;

          const tabs = document.createElement('div');
          tabs.className = 'v84-live-tabs';
          tabs.innerHTML = [
            { label:'🌍 All', key:'all' },
            { label:'🎵 Music', key:'music' },
            { label:'💃 Dance', key:'dance' },
            { label:'🍳 Cooking', key:'cooking' },
            { label:'💬 Chat', key:'chat' },
            { label:'🏋️ Fitness', key:'fitness' },
            { label:'🎨 Art', key:'art' },
          ].map((t, i) => `
            <button class="v84-live-tab ${i===0?'active':''}" onclick="this.parentElement.querySelectorAll('.v84-live-tab').forEach(b=>b.classList.remove('active'));this.classList.add('active')">
              ${t.label}
            </button>
          `).join('');

          const header = inner.querySelector('.live-header');
          if (header) header.after(tabs);
        }, 100);
      };
      window.renderLiveScreen._v84 = true;
    }
  }


  /* ══════════════════════════════════════════════════════════
   * § 7  YOURSTYLE SCREEN LAYOUT UPGRADE
   * ══════════════════════════════════════════════════════════ */
  function upgradeYourStyleHeader() {
    const styleScreen = document.getElementById('screen-style');
    if (!styleScreen) return;
    // Ensure Go Live button is added to header if not present
    const header = styleScreen.querySelector('.screen-content > div:first-child');
    if (!header) return;
    if (header.querySelector('.v84-header-live-btn')) return;

    // Add battle + live shortcuts to existing header
    const actionsDiv = header.querySelector('[style*="display:flex"][style*="gap"]');
    if (actionsDiv) {
      const liveBtn = document.createElement('button');
      liveBtn.className = 'v84-header-live-btn';
      liveBtn.innerHTML = '🔴 Live';
      liveBtn.style.cssText = 'background:rgba(255,71,87,0.15);border:1px solid rgba(255,71,87,0.3);color:#ff4757;border-radius:8px;padding:7px 12px;font-size:12px;font-weight:800;cursor:pointer';
      liveBtn.onclick = () => {
        if (typeof switchStyleTab === 'function') switchStyleTab('live', null);
      };
      actionsDiv.prepend(liveBtn);
    }
  }


  /* ══════════════════════════════════════════════════════════
   * § 8  ROUTER — show/hide FAB based on screen
   * ══════════════════════════════════════════════════════════ */
  function patchRouter() {
    const origShow = window.showScreen;
    if (!origShow || origShow._v84fab) return;
    window.showScreen = function(name) {
      const r = origShow.apply(this, arguments);
      setTimeout(updateFABVisibility, 100);
      return r;
    };
    window.showScreen._v84fab = true;

    if (window.AfribRouter && !window.AfribRouter._v84fab) {
      const origGo = window.AfribRouter.go.bind(window.AfribRouter);
      window.AfribRouter.go = function(name) {
        const r = origGo(name);
        setTimeout(updateFABVisibility, 100);
        return r;
      };
      window.AfribRouter._v84fab = true;
    }
  }


  /* ══════════════════════════════════════════════════════════
   * § 9  INIT
   * ══════════════════════════════════════════════════════════ */
  function init() {
    patchPostCardRenderer();
    injectLiveFAB();
    patchGoLiveModal();
    patchLiveScreen();
    patchRouter();
    upgradeYourStyleHeader();

    // Refresh feed if already on style screen
    try {
      const active = document.querySelector('.screen.active');
      if (active && active.id === 'screen-style') {
        if (typeof renderStyleFeed === 'function') renderStyleFeed();
        upgradeYourStyleHeader();
        updateFABVisibility();
      }
    } catch(_) {}

    // Re-run after login
    document.addEventListener('afrib:login', function() {
      setTimeout(() => {
        patchPostCardRenderer();
        patchGoLiveModal();
        patchLiveScreen();
        upgradeYourStyleHeader();
        injectLiveFAB();
        updateFABVisibility();
      }, 800);
    });

    // AfribRouter screen event
    if (window.AfribRouter && window.AfribRouter.on) {
      window.AfribRouter.on('style', () => {
        setTimeout(() => {
          upgradeYourStyleHeader();
          updateFABVisibility();
          if (typeof renderStyleFeed === 'function') renderStyleFeed();
        }, 100);
      });
    }

    console.info('%c✅ AfribConnect v84 — YourStyle + Live Upgrade loaded', 'color:#D4AF37;font-weight:bold');
  }

  if (document.readyState !== 'loading') {
    setTimeout(init, 900);
  } else {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 900));
  }

})();
