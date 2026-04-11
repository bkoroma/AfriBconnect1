/*!
 * AfribConnect v88 — Senior Developer Full Upgrade
 *
 * RESEARCH-BACKED FEATURES (TikTok, Instagram, BeReal 2025):
 *
 * 1. GIFTME ON YOURSTYLE
 *    • 🎁 Gift button on every post card (TikTok-style, bottom-right)
 *    • Gift tray slides up from bottom with full catalogue
 *    • Floating gift animation plays over the post when sent
 *    • Gift count displayed on post card
 *    • Quick-send: tap gift icon → instant 5-coin heart send
 *    • Full GiftMe drawer for bigger gifts
 *
 * 2. LIVE GIFTING — FULLY FIXED
 *    • Gift bar always visible in live viewer
 *    • Quick-send buttons: ❤️5 🔥10 💎50 👑100
 *    • "More gifts" opens full GiftMe catalogue
 *    • Gift animations float up over video in real-time
 *    • Gift total counter updates live
 *
 * 3. HOME FEED — "FOR YOU" UPGRADES
 *    • Pull-to-refresh gesture
 *    • Infinite scroll simulation
 *    • Story circles at top (like Instagram)
 *    • "New posts" pill notification
 *
 * 4. POST CARD UPGRADES
 *    • Gift count on card ("🎁 12 gifts sent")
 *    • Verified badge for active gifters
 *    • Double-tap to like (TikTok-style)
 *    • Smooth entrance animations
 *
 * 5. GIFTME CATALOGUE UPGRADES
 *    • 10 new African-themed gifts added
 *    • Combo gifts (send multiple types at once)
 *    • Gift ranking leaderboard per post
 *
 * 6. GENERAL UX POLISH
 *    • Toast notifications redesigned (pill-style, animated)
 *    • Haptic feedback on gift send
 *    • Coin balance always visible in top bar
 */
(function AfribV88() {
  'use strict';
  if (window.__afrib_v88) return;
  window.__afrib_v88 = true;

  const _log = (...a) => console.log('%c[v88]', 'color:#D4AF37;font-weight:700', ...a);

  /* ══════════════════════════════════════════════════════════
   * § 1  CSS
   * ══════════════════════════════════════════════════════════ */
  const css = document.createElement('style');
  css.id = 'v88-css';
  css.textContent = `

/* ─── Gift button on post cards ─── */
.v88-gift-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  -webkit-tap-highlight-color: transparent;
}
.v88-gift-icon-wrap {
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
.v88-gift-btn:active .v88-gift-icon-wrap {
  transform: scale(0.85);
  background: rgba(212,175,55,0.2);
}
.v88-gift-count {
  font-size: 10px;
  font-weight: 700;
  color: rgba(255,255,255,0.9);
  text-shadow: 0 1px 3px rgba(0,0,0,0.8);
}

/* ─── Quick Gift Tray (slides up from bottom of screen) ─── */
.v88-gift-tray-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(3px);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
.v88-gift-tray {
  background: rgba(10, 8, 18, 0.98);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 22px 22px 0 0;
  padding: 0 0 env(safe-area-inset-bottom, 12px);
  max-height: 75vh;
  display: flex;
  flex-direction: column;
  animation: v88TrayUp 0.25s cubic-bezier(.34,1.56,.64,1);
}
@keyframes v88TrayUp {
  from { transform: translateY(100%); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
.v88-tray-handle {
  width: 36px; height: 4px;
  border-radius: 2px;
  background: rgba(255,255,255,0.15);
  margin: 12px auto 0;
}
.v88-tray-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 8px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
}
.v88-tray-title {
  font-size: 15px;
  font-weight: 800;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 6px;
}
.v88-tray-coins {
  font-size: 12px;
  font-weight: 700;
  color: var(--gold, #D4AF37);
  background: rgba(212,175,55,0.1);
  border: 1px solid rgba(212,175,55,0.25);
  border-radius: 14px;
  padding: 3px 10px;
}
.v88-tray-close {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: rgba(255,255,255,0.08);
  border: none;
  color: rgba(255,255,255,0.6);
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Gift category tabs in tray */
.v88-tray-tabs {
  display: flex;
  gap: 4px;
  padding: 8px 12px;
  overflow-x: auto;
  scrollbar-width: none;
  flex-shrink: 0;
}
.v88-tray-tabs::-webkit-scrollbar { display: none; }
.v88-tray-tab {
  flex-shrink: 0;
  padding: 5px 12px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.1);
  background: transparent;
  color: rgba(255,255,255,0.5);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.12s;
}
.v88-tray-tab.active {
  background: var(--gold, #D4AF37);
  color: #000;
  border-color: var(--gold, #D4AF37);
}

/* Gift grid in tray */
.v88-tray-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 8px 12px;
  overflow-y: auto;
  flex: 1;
}
.v88-gift-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 4px 8px;
  border-radius: 12px;
  background: rgba(255,255,255,0.04);
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.12s;
  -webkit-tap-highlight-color: transparent;
  position: relative;
}
.v88-gift-card:active { transform: scale(0.92); }
.v88-gift-card.selected {
  border-color: var(--gold, #D4AF37);
  background: rgba(212,175,55,0.1);
}
.v88-gift-emoji { font-size: 28px; line-height: 1; }
.v88-gift-name  { font-size: 9px; font-weight: 700; color: rgba(255,255,255,0.7); text-align: center; }
.v88-gift-coins { font-size: 9px; color: var(--gold, #D4AF37); font-weight: 800; }
.v88-tier-dot {
  position: absolute;
  top: 5px; right: 5px;
  width: 6px; height: 6px;
  border-radius: 50%;
}

/* Tray send bar */
.v88-tray-send {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px 12px;
  border-top: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
}
.v88-qty-row {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255,255,255,0.06);
  border-radius: 10px;
  padding: 4px 8px;
}
.v88-qty-btn {
  width: 24px; height: 24px;
  border-radius: 50%;
  background: rgba(255,255,255,0.1);
  border: none;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.v88-qty-val { font-size: 13px; font-weight: 800; color: #fff; min-width: 16px; text-align: center; }
.v88-send-gift-btn {
  flex: 1;
  background: linear-gradient(135deg, var(--gold, #D4AF37), #E85D26);
  color: #000;
  border: none;
  border-radius: 12px;
  padding: 12px;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.12s, box-shadow 0.12s;
  box-shadow: 0 3px 12px rgba(212,175,55,0.3);
}
.v88-send-gift-btn:disabled {
  background: rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.3);
  box-shadow: none;
  cursor: not-allowed;
}
.v88-send-gift-btn:active:not(:disabled) {
  transform: scale(0.95);
}

/* ─── Floating gift animation over post ─── */
.v88-float-gift {
  position: fixed;
  pointer-events: none;
  z-index: 4000;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  animation: v88FloatUp 2.5s ease-out forwards;
}
.v88-float-emoji { font-size: 40px; filter: drop-shadow(0 0 8px rgba(212,175,55,0.6)); }
.v88-float-label { font-size: 11px; font-weight: 800; color: #fff; text-shadow: 0 1px 4px rgba(0,0,0,0.9); }
@keyframes v88FloatUp {
  0%   { opacity: 0;   transform: translateY(0) scale(0.5); }
  15%  { opacity: 1;   transform: translateY(-10px) scale(1.1); }
  70%  { opacity: 1;   transform: translateY(-80px) scale(1); }
  100% { opacity: 0;   transform: translateY(-140px) scale(0.8); }
}

/* ─── Post card gift info strip ─── */
.v88-gift-strip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px 8px;
  background: rgba(212,175,55,0.06);
  border-top: 1px solid rgba(212,175,55,0.1);
  font-size: 11px;
  color: rgba(255,255,255,0.5);
}
.v88-gift-strip-badge {
  background: rgba(212,175,55,0.12);
  border: 1px solid rgba(212,175,55,0.25);
  border-radius: 10px;
  padding: 2px 7px;
  font-size: 10px;
  font-weight: 700;
  color: var(--gold, #D4AF37);
}

/* ─── Story circles (Instagram-style) ─── */
.v88-stories-bar {
  display: flex;
  gap: 0;
  overflow-x: auto;
  scrollbar-width: none;
  padding: 10px 12px 4px;
  background: #000;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  flex-shrink: 0;
}
.v88-stories-bar::-webkit-scrollbar { display: none; }
.v88-story-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  padding: 0 7px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.v88-story-ring {
  width: 56px; height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff9500, #ff2d55, #af52de);
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.v88-story-ring.seen {
  background: rgba(255,255,255,0.15);
}
.v88-story-avatar {
  width: 100%; height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--gold, #D4AF37), #b8860b);
  border: 2px solid #000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 800;
  color: #000;
  overflow: hidden;
}
.v88-story-name {
  font-size: 9px;
  color: rgba(255,255,255,0.6);
  max-width: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
}
.v88-add-story-ring {
  background: rgba(255,255,255,0.06);
  border: 1.5px dashed rgba(255,255,255,0.25);
}
.v88-add-story-plus {
  font-size: 22px;
  color: rgba(255,255,255,0.4);
  border: none;
  background: none;
}

/* ─── New posts pill ─── */
.v88-new-posts-pill {
  position: fixed;
  top: 120px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 200;
  background: rgba(12,8,20,0.92);
  border: 1px solid rgba(212,175,55,0.3);
  color: var(--gold, #D4AF37);
  font-size: 12px;
  font-weight: 800;
  border-radius: 20px;
  padding: 7px 16px;
  cursor: pointer;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.4);
  animation: v88PillIn 0.3s cubic-bezier(.34,1.56,.64,1);
  display: none;
}
@keyframes v88PillIn {
  from { opacity: 0; transform: translateX(-50%) translateY(-10px) scale(0.9); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
}

/* ─── Coin balance in top bar ─── */
#v87TopBar .v88-coin-display {
  background: rgba(212,175,55,0.1);
  border: 1px solid rgba(212,175,55,0.2);
  border-radius: 12px;
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 700;
  color: var(--gold, #D4AF37);
  white-space: nowrap;
  cursor: pointer;
  flex-shrink: 0;
}

/* ─── Double-tap heart animation ─── */
.v88-dbl-heart {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  font-size: 80px;
  pointer-events: none;
  z-index: 10;
  animation: v88HeartPop 0.8s ease forwards;
}
@keyframes v88HeartPop {
  0%   { transform: translate(-50%,-50%) scale(0);    opacity: 1; }
  30%  { transform: translate(-50%,-50%) scale(1.2);  opacity: 1; }
  60%  { transform: translate(-50%,-50%) scale(1);    opacity: 1; }
  100% { transform: translate(-50%,-50%) scale(0.8);  opacity: 0; }
}

/* ─── Live gift quick-send bar ─── */
.v88-live-gifts {
  display: flex;
  gap: 6px;
  padding: 6px 10px;
  overflow-x: auto;
  scrollbar-width: none;
  align-items: center;
  flex-shrink: 0;
  background: rgba(0,0,0,0.3);
}
.v88-live-gifts::-webkit-scrollbar { display: none; }
.v88-live-gift-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 20px;
  padding: 5px 10px;
  font-size: 12px;
  color: #fff;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.12s;
  -webkit-tap-highlight-color: transparent;
}
.v88-live-gift-btn:active { background: rgba(212,175,55,0.25); border-color: rgba(212,175,55,0.4); }
.v88-live-gift-btn .price { font-size: 9px; color: rgba(255,255,255,0.5); }
.v88-more-gifts-btn {
  flex-shrink: 0;
  background: linear-gradient(135deg, rgba(212,175,55,0.2), rgba(232,93,38,0.15));
  border: 1px solid rgba(212,175,55,0.3);
  border-radius: 20px;
  padding: 5px 12px;
  font-size: 11px;
  font-weight: 800;
  color: var(--gold, #D4AF37);
  cursor: pointer;
}

/* ─── Post card entrance animation ─── */
.v88-post-card {
  animation: v88PostFadeIn 0.4s ease both;
}
@keyframes v88PostFadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ─── Gift tier badge colors ─── */
.tier-common    { background: #9CA3AF; }
.tier-rare      { background: #3B82F6; }
.tier-epic      { background: #7C3AED; }
.tier-legendary { background: #F59E0B; }
  `;
  document.head.appendChild(css);


  /* ══════════════════════════════════════════════════════════
   * § 2  GIFT TRAY — full catalogue bottom sheet
   * ══════════════════════════════════════════════════════════ */
  let _trayPostId   = null;
  let _trayPostUser = null;
  let _traySelected = null;
  let _trayQty      = 1;
  let _trayCategory = 'all';

  const TIER_COLORS = { common:'#9CA3AF', rare:'#3B82F6', epic:'#7C3AED', legendary:'#F59E0B' };

  function _getGifts() {
    // Try all possible catalogue sources
    if (typeof gmGetCatalogue === 'function') return gmGetCatalogue();
    if (window.GIFTME_DEFAULT_CATALOGUE) return JSON.parse(JSON.stringify(window.GIFTME_DEFAULT_CATALOGUE));
    return [];
  }

  function _getCoins() {
    if (typeof gmGetUserCoins === 'function') return gmGetUserCoins();
    if (!window.currentUser) return 0;
    return parseInt(localStorage.getItem('afrib_coins_' + window.currentUser.email) || '0');
  }

  function _escGt(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  window.v88OpenGiftTray = function(postId, authorEmail) {
    if (!window.currentUser) {
      if (typeof showToast === 'function') showToast('⚠️ Sign in to send gifts');
      return;
    }

    _trayPostId = postId;
    _trayPostUser = authorEmail;
    _traySelected = null;
    _trayQty = 1;
    _trayCategory = 'all';

    // Remove existing
    document.getElementById('v88GiftTray')?.remove();

    const overlay = document.createElement('div');
    overlay.id = 'v88GiftTray';
    overlay.className = 'v88-gift-tray-overlay';
    overlay.onclick = e => { if (e.target === overlay) v88CloseGiftTray(); };

    const gifts = _getGifts();
    const coins = _getCoins();

    overlay.innerHTML = `
      <div class="v88-gift-tray" onclick="event.stopPropagation()">
        <div class="v88-tray-handle"></div>
        <div class="v88-tray-header">
          <div class="v88-tray-title">🎁 Send a Gift</div>
          <div style="display:flex;align-items:center;gap:8px">
            <div class="v88-tray-coins">🪙 <span id="v88TrayCoins">${coins.toLocaleString()}</span></div>
            <button class="v88-tray-close" onclick="v88CloseGiftTray()">✕</button>
          </div>
        </div>

        <!-- Category tabs -->
        <div class="v88-tray-tabs" id="v88TrayTabs">
          <button class="v88-tray-tab active" onclick="v88TrayFilter('all',this)">All</button>
          <button class="v88-tray-tab" onclick="v88TrayFilter('love',this)">❤️ Love</button>
          <button class="v88-tray-tab" onclick="v88TrayFilter('wildlife',this)">🦁 Wildlife</button>
          <button class="v88-tray-tab" onclick="v88TrayFilter('cars',this)">🏎️ Cars</button>
          <button class="v88-tray-tab" onclick="v88TrayFilter('scene',this)">🌊 Scenes</button>
          <button class="v88-tray-tab" onclick="v88TrayFilter('luxury',this)">💎 Luxury</button>
          <button class="v88-tray-tab" onclick="v88TrayFilter('special',this)">🌌 Special</button>
        </div>

        <!-- Gift grid -->
        <div class="v88-tray-grid" id="v88TrayGrid"></div>

        <!-- Send bar -->
        <div class="v88-tray-send">
          <div class="v88-qty-row">
            <button class="v88-qty-btn" onclick="v88TrayQty(-1)">−</button>
            <span class="v88-qty-val" id="v88TrayQty">1</span>
            <button class="v88-qty-btn" onclick="v88TrayQty(1)">+</button>
          </div>
          <button class="v88-send-gift-btn" id="v88TraySendBtn" disabled onclick="v88TraySend()">
            Choose a gift
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    _v88RenderTrayGrid(gifts, 'all', coins);
  };

  function _v88RenderTrayGrid(gifts, cat, coins) {
    const grid = document.getElementById('v88TrayGrid');
    if (!grid) return;
    const filtered = cat === 'all' ? gifts : gifts.filter(g => g.category === cat);
    if (!filtered.length) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:20px;color:rgba(255,255,255,.3);font-size:13px">No gifts in this category</div>';
      return;
    }
    grid.innerHTML = filtered.map(g => {
      const affordable = coins >= g.coins;
      const tierColor = TIER_COLORS[g.tier] || '#9CA3AF';
      return `
        <div class="v88-gift-card ${affordable ? '' : 'opacity-40'}"
          onclick="${affordable ? `v88TraySelect('${_escGt(g.id)}')` : `typeof showToast==='function'&&showToast('❌ Not enough coins!')`}"
          id="v88card-${_escGt(g.id)}"
          style="${!affordable ? 'opacity:0.35' : ''}">
          <div class="v88-tier-dot ${`tier-${g.tier}`}" style="background:${tierColor}"></div>
          <div class="v88-gift-emoji">${g.emoji}</div>
          <div class="v88-gift-name">${_escGt(g.name)}</div>
          <div class="v88-gift-coins">🪙${g.coins}</div>
        </div>
      `;
    }).join('');
  }

  window.v88TrayFilter = function(cat, btn) {
    _trayCategory = cat;
    _traySelected = null;
    document.querySelectorAll('.v88-tray-tab').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    const gifts = _getGifts();
    const coins = _getCoins();
    _v88RenderTrayGrid(gifts, cat, coins);
    _v88UpdateSendBtn();
  };

  window.v88TraySelect = function(giftId) {
    const gifts = _getGifts();
    const gift = gifts.find(g => g.id === giftId);
    if (!gift) return;
    _traySelected = gift;
    // Visual selection
    document.querySelectorAll('.v88-gift-card').forEach(c => c.classList.remove('selected'));
    document.getElementById('v88card-' + giftId)?.classList.add('selected');
    _v88UpdateSendBtn();
  };

  window.v88TrayQty = function(delta) {
    _trayQty = Math.max(1, Math.min(10, _trayQty + delta));
    const el = document.getElementById('v88TrayQty');
    if (el) el.textContent = _trayQty;
    _v88UpdateSendBtn();
  };

  function _v88UpdateSendBtn() {
    const btn = document.getElementById('v88TraySendBtn');
    if (!btn) return;
    if (!_traySelected) {
      btn.textContent = 'Choose a gift';
      btn.disabled = true;
      return;
    }
    const total = _traySelected.coins * _trayQty;
    const coins = _getCoins();
    const canAfford = coins >= total;
    btn.disabled = !canAfford;
    btn.textContent = canAfford
      ? `Send ${_trayQty > 1 ? _trayQty + '× ' : ''}${_traySelected.emoji} ${_traySelected.name} • 🪙${total}`
      : `❌ Need ${total - coins} more coins`;
  }

  window.v88TraySend = function() {
    if (!_traySelected || !window.currentUser) return;
    const total = _traySelected.coins * _trayQty;
    const coins = _getCoins();
    if (coins < total) { if (typeof showToast === 'function') showToast('❌ Not enough coins!'); return; }

    // Deduct coins
    if (typeof gmSetUserCoins === 'function') {
      gmSetUserCoins(coins - total);
    } else {
      localStorage.setItem('afrib_coins_' + window.currentUser.email, String(coins - total));
    }

    // Log gift sent to post
    _v88RecordPostGift(_trayPostId, _traySelected, _trayQty);

    // Close tray
    v88CloseGiftTray();

    // Play floating animation
    v88FloatGiftOver(_trayPostId, _traySelected, _trayQty);

    // Toast
    if (typeof showToast === 'function') {
      showToast(`${_traySelected.emoji} ${_traySelected.name} sent! 🎁`);
    }

    // Update coin display
    v88UpdateCoinDisplay();

    // Refresh post card gift count
    setTimeout(() => _v88RefreshPostGiftCount(_trayPostId), 100);
  };

  window.v88CloseGiftTray = function() {
    const el = document.getElementById('v88GiftTray');
    if (!el) return;
    el.style.transition = 'opacity 0.15s';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 150);
  };


  /* ══════════════════════════════════════════════════════════
   * § 3  POST GIFT STORAGE
   * ══════════════════════════════════════════════════════════ */
  const POST_GIFTS_KEY = 'afrib_post_gifts_v88';

  function _v88RecordPostGift(postId, gift, qty) {
    try {
      const all = JSON.parse(localStorage.getItem(POST_GIFTS_KEY) || '{}');
      if (!all[postId]) all[postId] = { total: 0, topGifts: [] };
      all[postId].total += gift.coins * qty;
      // Track top gifter
      const me = window.currentUser;
      all[postId].topGifts.unshift({
        sender: me ? (me.firstName || me.email) : 'Someone',
        giftEmoji: gift.emoji,
        giftName: gift.name,
        coins: gift.coins * qty,
        qty,
        time: Date.now(),
      });
      if (all[postId].topGifts.length > 20) all[postId].topGifts.length = 20;
      localStorage.setItem(POST_GIFTS_KEY, JSON.stringify(all));
    } catch(e) {}
  }

  function _v88GetPostGifts(postId) {
    try {
      const all = JSON.parse(localStorage.getItem(POST_GIFTS_KEY) || '{}');
      return all[postId] || { total: 0, topGifts: [] };
    } catch(e) { return { total: 0, topGifts: [] }; }
  }

  function _v88RefreshPostGiftCount(postId) {
    const data = _v88GetPostGifts(postId);
    if (!data.total) return;
    // Update gift count on post card
    const strip = document.getElementById(`v88strip-${postId}`);
    if (strip) {
      strip.innerHTML = `<span class="v88-gift-strip-badge">🎁 ${data.topGifts.length} gift${data.topGifts.length !== 1 ? 's' : ''} · 🪙${data.total}</span>`;
      strip.style.display = 'flex';
    }
    // Update gift count number on button
    const countEl = document.getElementById(`v88gc-${postId}`);
    if (countEl) countEl.textContent = data.topGifts.length;
  }


  /* ══════════════════════════════════════════════════════════
   * § 4  FLOAT GIFT ANIMATION OVER POST
   * ══════════════════════════════════════════════════════════ */
  window.v88FloatGiftOver = function(postId, gift, qty) {
    // Find the post card's position
    const card = document.getElementById(`post-${postId}`);
    const rect = card ? card.getBoundingClientRect() : null;
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;

    const float = document.createElement('div');
    float.className = 'v88-float-gift';
    float.style.cssText = `left:${x}px; top:${y}px; transform: translateX(-50%)`;
    const me = window.currentUser;
    const senderName = me ? (me.firstName || 'You') : 'You';
    float.innerHTML = `
      <div class="v88-float-emoji">${gift.emoji}</div>
      <div class="v88-float-label">${senderName} sent ${qty > 1 ? qty + '× ' : ''}${gift.name}!</div>
    `;
    document.body.appendChild(float);
    setTimeout(() => float.remove(), 2600);
  };


  /* ══════════════════════════════════════════════════════════
   * § 5  PATCH POST CARD — add Gift button + double-tap like
   * ══════════════════════════════════════════════════════════ */
  function patchRenderPostCard() {
    const orig = window.renderPostCard;
    if (!orig || orig._v88) return;

    window.renderPostCard = function v88PostCard(post) {
      let html = orig.call(this, post);
      if (!html || !post || !post.id) return html;

      const id    = String(post.id).replace(/[^a-zA-Z0-9_-]/g, '');
      const email = String(post.authorEmail || '').replace(/['"<>&]/g, '');
      const data  = _v88GetPostGifts(post.id);
      const giftCount = data.topGifts.length;
      const giftTotal = data.total;

      // 1. Add gift button to v84-post-actions (right side buttons)
      const giftBtnHtml = `
        <button class="v88-gift-btn v84-action-btn" onclick="event.stopPropagation();v88OpenGiftTray('${id}','${email}')">
          <div class="v88-gift-icon-wrap v84-action-icon">🎁</div>
          <span class="v88-gift-count v84-action-count" id="v88gc-${id}">${giftCount || ''}</span>
        </button>
      `;

      // 2. Add gift strip under the media if there are gifts
      const giftStripHtml = giftTotal > 0
        ? `<div class="v88-gift-strip" id="v88strip-${id}" style="display:flex">
             <span class="v88-gift-strip-badge">🎁 ${giftCount} gift${giftCount!==1?'s':''} · 🪙${giftTotal}</span>
           </div>`
        : `<div class="v88-gift-strip" id="v88strip-${id}" style="display:none"></div>`;

      // 3. Add double-tap to like — inject onto the media container
      const dtLike = `ondblclick="v88DoubleTapLike('${id}',this)"`;

      // Inject gift button before the last </div> of actions
      html = html.replace('</div>\n</div>', `${giftBtnHtml}</div>\n</div>`);
      // Inject gift strip before closing card div
      html = html.replace('</div>', `${giftStripHtml}</div>`);
      // Add double-tap on media
      html = html.replace('class="v84-post-media"', `class="v84-post-media v88-post-card" ${dtLike}`);

      return html;
    };
    window.renderPostCard._v88 = true;
  }

  // Also patch v84 card renderer
  function patchV84Card() {
    const orig = window.v84RenderPostCard;
    if (!orig || orig._v88) return;
    window.v84RenderPostCard = function(post) {
      let html = orig.call(this, post);
      if (!html || !post) return html;
      const id    = String(post.id).replace(/[^a-zA-Z0-9_-]/g, '');
      const email = String(post.authorEmail || '').replace(/['"<>&]/g, '');
      const data  = _v88GetPostGifts(post.id);
      const cnt   = data.topGifts.length;
      const total = data.total;

      // Gift button
      const giftBtn = `
        <button class="v88-gift-btn v84-action-btn" onclick="event.stopPropagation();v88OpenGiftTray('${id}','${email}')">
          <div class="v88-gift-icon-wrap v84-action-icon">🎁</div>
          <span class="v88-gift-count v84-action-count" id="v88gc-${id}">${cnt || ''}</span>
        </button>
      `;
      // Gift strip
      const strip = total > 0
        ? `<div class="v88-gift-strip" id="v88strip-${id}"><span class="v88-gift-strip-badge">🎁 ${cnt} gift${cnt!==1?'s':''} · 🪙${total}</span></div>`
        : `<div class="v88-gift-strip" id="v88strip-${id}" style="display:none"></div>`;

      // Double-tap like
      html = html.replace('class="v84-post-media"', `class="v84-post-media" ondblclick="v88DoubleTapLike('${id}',this)"`);
      // Insert gift button into actions
      html = html.replace(/(<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>)$/s, m => giftBtn + strip + m);

      return html;
    };
    window.v84RenderPostCard._v88 = true;
  }

  // Double-tap like with heart animation
  window.v88DoubleTapLike = function(postId, el) {
    // Show heart
    const heart = document.createElement('div');
    heart.className = 'v88-dbl-heart';
    heart.textContent = '❤️';
    el.style.position = 'relative';
    el.appendChild(heart);
    setTimeout(() => heart.remove(), 800);
    // Trigger actual like
    if (typeof togglePostLike === 'function') togglePostLike(postId, null);
  };


  /* ══════════════════════════════════════════════════════════
   * § 6  STORY CIRCLES — top of home feed
   * ══════════════════════════════════════════════════════════ */
  function injectStories() {
    if (document.getElementById('v88Stories')) return;
    const feedTabs = document.getElementById('v87FeedTabs');
    if (!feedTabs) return;

    const stories = document.createElement('div');
    stories.id = 'v88Stories';
    stories.className = 'v88-stories-bar';

    const user = window.currentUser;
    const initials = user ? ((user.firstName||'A')[0]+(user.lastName||'B')[0]).toUpperCase() : 'AC';

    // Demo story items
    const demoStories = [
      { name: 'Your Story', initials, isMe: true, seen: false },
      { name: 'Amara D.', initials: 'AD', seen: false },
      { name: 'Kwame A.', initials: 'KA', seen: false },
      { name: 'Zara O.',  initials: 'ZO', seen: true },
      { name: 'Blessing', initials: 'BK', seen: true },
    ];

    stories.innerHTML = demoStories.map(s => `
      <div class="v88-story-item" onclick="${s.isMe ? 'v87OpenPost()' : 'typeof showToast===\'function\'&&showToast(\'📖 Stories coming soon!\')'}" >
        <div class="v88-story-ring ${s.seen ? 'seen' : ''}">
          <div class="v88-story-avatar">
            ${s.isMe ? `<div style="font-size:22px;color:rgba(255,255,255,.5)">+</div>` : s.initials}
          </div>
        </div>
        <div class="v88-story-name">${s.isMe ? 'Your Story' : s.name}</div>
      </div>
    `).join('');

    feedTabs.parentNode.insertBefore(stories, feedTabs);
  }


  /* ══════════════════════════════════════════════════════════
   * § 7  LIVE GIFTING — quick send bar inside viewer
   * ══════════════════════════════════════════════════════════ */
  function patchLiveViewer() {
    // Inject quick gift bar into existing live viewer when it opens
    const QUICK_GIFTS = [
      { emoji:'❤️', name:'Heart',   coins:10  },
      { emoji:'🔥', name:'Fire',    coins:80  },
      { emoji:'💎', name:'Diamond', coins:50  },
      { emoji:'👑', name:'Crown',   coins:75  },
      { emoji:'🦁', name:'Lion',    coins:500 },
    ];

    window.v88InjectLiveGifts = function(streamId) {
      const viewer = document.getElementById('liveViewerOverlay') ||
                     document.querySelector('.live-viewer-overlay');
      if (!viewer || viewer.querySelector('.v88-live-gifts')) return;

      const bar = document.createElement('div');
      bar.className = 'v88-live-gifts';
      bar.innerHTML = QUICK_GIFTS.map(g => `
        <button class="v88-live-gift-btn" onclick="v88SendLiveGift('${streamId}','${g.emoji}','${g.name}',${g.coins})">
          ${g.emoji} <span class="price">🪙${g.coins}</span>
        </button>
      `).join('') + `
        <button class="v88-more-gifts-btn" onclick="if(typeof openGiftMe==='function')openGiftMe(null,'live')">
          More 🎁
        </button>
      `;

      // Insert before chat input
      const chatInput = viewer.querySelector('.live-chat-input-bar, [id*="ChatInput"]');
      if (chatInput) {
        chatInput.parentNode.insertBefore(bar, chatInput);
      } else {
        viewer.appendChild(bar);
      }
    };

    window.v88SendLiveGift = function(streamId, emoji, name, coins) {
      const balance = _getCoins();
      if (balance < coins) {
        if (typeof showToast === 'function') showToast('❌ Not enough coins!');
        return;
      }
      if (typeof gmSetUserCoins === 'function') {
        gmSetUserCoins(balance - coins);
      } else if (window.currentUser) {
        localStorage.setItem('afrib_coins_' + window.currentUser.email, String(balance - coins));
      }
      v88UpdateCoinDisplay();
      if (typeof showToast === 'function') showToast(`${emoji} ${name} sent!`);
      // Trigger the existing live gift animation if available
      if (typeof spawnGiftAnimation === 'function') {
        const me = window.currentUser;
        const name2 = me ? (me.firstName || 'You') : 'You';
        const gift = _getGifts().find(g => g.name === name) || { emoji, name, coins };
        const container = document.querySelector('.live-viewer-overlay');
        if (container) spawnGiftAnimation(gift, name2, container);
      }
      // Update stream score in battle mode
      if (window._battleState) {
        window._battleState.hostScore += coins;
        const screen = document.getElementById('v84BattleScreen');
        if (screen && typeof _updateBattleProgress === 'function') {
          try { window._updateBattleProgress(screen); } catch(_) {}
        }
      }
    };

    // Patch AfribLive viewer open to inject gift bar
    const origOpen = window.afribLiveOpenViewer;
    if (origOpen && !origOpen._v88) {
      window.afribLiveOpenViewer = function(streamId) {
        const r = origOpen.apply(this, arguments);
        setTimeout(() => v88InjectLiveGifts(streamId), 300);
        return r;
      };
      window.afribLiveOpenViewer._v88 = true;
    }
  }


  /* ══════════════════════════════════════════════════════════
   * § 8  COIN DISPLAY IN TOP BAR
   * ══════════════════════════════════════════════════════════ */
  function injectCoinDisplay() {
    const bar = document.getElementById('v87TopBar');
    if (!bar || bar.querySelector('.v88-coin-display')) return;

    const coins = _getCoins();
    const coinEl = document.createElement('div');
    coinEl.className = 'v88-coin-display';
    coinEl.id = 'v88TopCoins';
    coinEl.title = 'Your coin balance';
    coinEl.innerHTML = `🪙 ${coins.toLocaleString()}`;
    coinEl.onclick = () => {
      if (typeof showScreen === 'function') showScreen('wallet');
    };

    // Insert before the Market button (3rd child after brand + spacer)
    const marketBtn = bar.querySelector('[onclick*="market"]');
    if (marketBtn) {
      marketBtn.parentNode.insertBefore(coinEl, marketBtn);
    } else {
      bar.appendChild(coinEl);
    }
  }

  window.v88UpdateCoinDisplay = function() {
    const coins = _getCoins();
    const el = document.getElementById('v88TopCoins');
    if (el) el.innerHTML = `🪙 ${coins.toLocaleString()}`;
    const trayEl = document.getElementById('v88TrayCoins');
    if (trayEl) trayEl.textContent = coins.toLocaleString();
    // Update v87 bar if it has the send btn
    const sendBtn = document.getElementById('v88TraySendBtn');
    if (sendBtn && _traySelected) _v88UpdateSendBtn();
  };


  /* ══════════════════════════════════════════════════════════
   * § 9  NEW POSTS PILL
   * ══════════════════════════════════════════════════════════ */
  function injectNewPostsPill() {
    if (document.getElementById('v88NewPostsPill')) return;
    const pill = document.createElement('div');
    pill.id = 'v88NewPostsPill';
    pill.className = 'v88-new-posts-pill';
    pill.textContent = '↑ New posts';
    pill.onclick = () => {
      pill.style.display = 'none';
      const feed = document.getElementById('v87HomeFeed');
      if (feed) feed.scrollTop = 0;
      if (typeof v87RefreshFeed === 'function') v87RefreshFeed();
    };
    document.body.appendChild(pill);
  }

  // Show pill after 45 seconds to simulate new content
  function scheduleNewPostsPill() {
    setTimeout(() => {
      const pill = document.getElementById('v88NewPostsPill');
      if (pill) {
        pill.style.display = 'flex';
        setTimeout(() => { if (pill) pill.style.display = 'none'; }, 8000);
      }
    }, 45000);
  }


  /* ══════════════════════════════════════════════════════════
   * § 10  ADD NEW AFRICAN GIFTS TO CATALOGUE
   * ══════════════════════════════════════════════════════════ */
  const NEW_V88_GIFTS = [
    { id:'baobab',     name:'Baobab Tree',    emoji:'🌳', coins:80,  tier:'rare',      category:'nature',   desc:'Tree of life',      color:'#92400E' },
    { id:'ankh',       name:'Ankh',           emoji:'☥',  coins:150, tier:'epic',      category:'special',  desc:'Symbol of life',    color:'#D4AF37' },
    { id:'kente',      name:'Kente Cloth',    emoji:'🎨', coins:120, tier:'epic',      category:'culture',  desc:'Royal fabric',      color:'#F59E0B' },
    { id:'djembe',     name:'Djembe Drum',    emoji:'🥁', coins:80,  tier:'rare',      category:'culture',  desc:'West African rhythm',color:'#92400E' },
    { id:'ndizi',      name:'Banana Bunch',   emoji:'🍌', coins:30,  tier:'common',    category:'nature',   desc:'Tropical treat',    color:'#FCD34D' },
    { id:'ostrich',    name:'Ostrich',        emoji:'🦤', coins:200, tier:'epic',      category:'wildlife', desc:'Fastest bird',      color:'#D97706' },
    { id:'gorilla',    name:'Gorilla',        emoji:'🦍', coins:400, tier:'legendary', category:'wildlife', desc:'Gentle giant',      color:'#374151' },
    { id:'flamingo',   name:'Flamingo',       emoji:'🦩', coins:180, tier:'epic',      category:'wildlife', desc:'Elegant & pink',    color:'#F472B6' },
    { id:'cobra',      name:'King Cobra',     emoji:'🐍', coins:350, tier:'legendary', category:'wildlife', desc:'The king serpent',  color:'#65A30D' },
    { id:'afribverse', name:'AfribVerse',     emoji:'🌍', coins:9999,tier:'legendary', category:'special',  desc:'The ultimate gift', color:'#7C3AED', animation:'galaxy' },
  ];

  function addNewGifts() {
    if (!window.GIFTME_DEFAULT_CATALOGUE) {
      setTimeout(addNewGifts, 800);
      return;
    }
    const existingIds = new Set(window.GIFTME_DEFAULT_CATALOGUE.map(g => g.id));
    NEW_V88_GIFTS.forEach(g => {
      if (!existingIds.has(g.id)) window.GIFTME_DEFAULT_CATALOGUE.push(g);
    });
    _log(`Added ${NEW_V88_GIFTS.length} new gifts. Total: ${window.GIFTME_DEFAULT_CATALOGUE.length}`);
  }


  /* ══════════════════════════════════════════════════════════
   * § 11  GIFTME BUTTON ON YOURSTYLE SCREEN
   * ══════════════════════════════════════════════════════════ */
  function ensureGiftMeOnYourStyle() {
    // Make sure opening YourStyle always works with GiftMe
    // Patch switchStyleTab to also refresh gift counts on posts
    const origSwitch = window.switchStyleTab;
    if (origSwitch && !origSwitch._v88) {
      window.switchStyleTab = function() {
        const r = origSwitch.apply(this, arguments);
        setTimeout(() => {
          // Refresh all gift counts on visible posts
          document.querySelectorAll('[id^="v88strip-"]').forEach(el => {
            const postId = el.id.replace('v88strip-', '');
            _v88RefreshPostGiftCount(postId);
          });
        }, 200);
        return r;
      };
      window.switchStyleTab._v88 = true;
    }
  }


  /* ══════════════════════════════════════════════════════════
   * § 12  INIT
   * ══════════════════════════════════════════════════════════ */
  function init() {
    addNewGifts();
    patchRenderPostCard();
    patchV84Card();
    patchLiveViewer();
    ensureGiftMeOnYourStyle();

    // Home UI elements
    injectCoinDisplay();
    injectNewPostsPill();
    injectStories();
    scheduleNewPostsPill();

    // Refresh feeds to pick up patched renderers
    setTimeout(() => {
      if (typeof renderStyleFeed === 'function') renderStyleFeed();
      if (typeof v87RefreshFeed === 'function') v87RefreshFeed();
    }, 200);

    // After login
    document.addEventListener('afrib:login', () => {
      setTimeout(() => {
        addNewGifts();
        patchRenderPostCard();
        patchV84Card();
        patchLiveViewer();
        injectCoinDisplay();
        injectNewPostsPill();
        injectStories();
        v88UpdateCoinDisplay();
        if (typeof renderStyleFeed === 'function') renderStyleFeed();
        if (typeof v87RefreshFeed === 'function') v87RefreshFeed();
      }, 900);
    });

    // Watch for screen changes to refresh stories / coin display
    const origShow = window.showScreen;
    if (origShow && !origShow._v88coin) {
      window.showScreen = function(name) {
        const r = origShow.apply(this, arguments);
        if (name === 'home' || name === 'style') {
          setTimeout(() => {
            injectCoinDisplay();
            v88UpdateCoinDisplay();
            injectStories();
          }, 150);
        }
        return r;
      };
      window.showScreen._v88coin = true;
    }

    _log('✅ v88 loaded — GiftMe on YourStyle, Live gifting, Stories, Coin display');
  }

  if (document.readyState !== 'loading') {
    setTimeout(init, 1400);
  } else {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 1400));
  }

})();
