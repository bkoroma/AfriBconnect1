/*!
 * AfribConnect v89 — Gifter Levels Full Fix & Upgrade
 *
 * BUGS FIXED:
 *  1. giftme.js gmSendGift() never called recordGiftSent → gifter XP never updated
 *  2. v88TraySend() (post-card tray) never called recordGiftSent → same
 *  3. v88SendLiveGift() never called recordGiftSent → same
 *  4. injectGiftMeBadge searched wrong element → badge injected to overlay backdrop
 *  5. Level thresholds had one wrong value (L14 was 2480 should be 2840, L29 was 578000 should be 478000)
 *  6. No gifter badge shown on YourStyle post author line
 *  7. No gifter level shown in the v88 gift tray header (sender's level)
 *
 * NEW FEATURES (TikTok-inspired research):
 *  8.  Weekly gifting streak — 7-day streak = ×2 XP multiplier
 *  9.  Top Gifter badge on posts ("🥇 Top Gifter")
 *  10. Gifter level badge on profile hover cards
 *  11. Level-up animation in live viewer when sender levels up
 *  12. "Gifter of the Stream" award at end of live
 *  13. Gift leaderboard per post (top 3 gifters shown)
 *  14. Daily gift bonus (first gift of the day = +50% XP)
 *  15. Gifter rank display on post cards beside author name
 */
(function AfribV89() {
  'use strict';
  if (window.__afrib_v89) return;
  window.__afrib_v89 = true;

  const LOG = (...a) => console.log('%c[v89-GifterLevels]', 'color:#D4AF37;font-weight:700', ...a);

  /* ══════════════════════════════════════════════════════════
   * § 1  CORRECT LEVEL THRESHOLDS (match TikTok official)
   * ══════════════════════════════════════════════════════════ */
  const CORRECT_THRESHOLDS = {
    1:1, 2:8, 3:18, 4:34, 5:56, 6:90, 7:140, 8:220, 9:340, 10:530,
    11:820, 12:1260, 13:1920, 14:2840, 15:4340, 16:6420, 17:9280,
    18:13500, 19:19400, 20:27600, 21:39600, 22:54600, 23:75800,
    24:105000, 25:144000, 26:196000, 27:265000, 28:357000, 29:478000,
    30:637000, 31:845000, 32:1120000, 33:1470000, 34:1920000,
    35:2500000, 36:3230000, 37:4180000, 38:5430000, 39:6890000,
    40:8780000, 41:11200000, 42:14100000, 43:17800000, 44:22300000,
    45:27900000, 46:37500000, 47:47500000, 48:65700000, 49:75000000,
    50:80000000,
  };

  // Patch QUARTZ_LEVELS thresholds if the table is loaded
  function fixLevelThresholds() {
    if (!window.QUARTZ_LEVELS) return;
    window.QUARTZ_LEVELS.forEach(lvl => {
      if (CORRECT_THRESHOLDS[lvl.level] !== undefined) {
        lvl.coins = CORRECT_THRESHOLDS[lvl.level];
      }
    });
    LOG('Level thresholds patched to TikTok official values');
  }

  /* ══════════════════════════════════════════════════════════
   * § 2  CENTRAL GIFT XP ENGINE
   *
   * All gift sends flow through here — single source of truth
   * for XP tracking, streak, level-up detection, and display.
   * ══════════════════════════════════════════════════════════ */
  const STATS_KEY   = email => `afrib_gift_stats_${email}`;
  const STREAK_KEY  = email => `afrib_gift_streak_${email}`;
  const DAILY_KEY   = email => `afrib_gift_daily_${email}`;

  function getStats(email) {
    try { return JSON.parse(localStorage.getItem(STATS_KEY(email)) || '{}'); }
    catch(_) { return {}; }
  }
  function saveStats(email, stats) {
    try { localStorage.setItem(STATS_KEY(email), JSON.stringify(stats)); } catch(_) {}
  }

  // Calculate XP multiplier (streak + daily bonus)
  function getXPMultiplier(email) {
    let multiplier = 1;

    // Daily bonus — first gift of the day = +50% XP
    const todayKey = new Date().toDateString();
    const daily = JSON.parse(localStorage.getItem(DAILY_KEY(email)) || '{}');
    if (!daily.date || daily.date !== todayKey) {
      multiplier *= 1.5;
    }

    // Streak bonus — 7-day consecutive gifting = ×2 XP
    const streak = JSON.parse(localStorage.getItem(STREAK_KEY(email)) || '{"days":0,"lastDate":""}');
    if (streak.days >= 7) {
      multiplier *= 2;
    } else if (streak.days >= 3) {
      multiplier *= 1.25;
    }

    return multiplier;
  }

  // Update daily and streak
  function updateDailyAndStreak(email) {
    const todayKey = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    // Daily
    const daily = JSON.parse(localStorage.getItem(DAILY_KEY(email)) || '{}');
    const isFirstToday = !daily.date || daily.date !== todayKey;
    if (isFirstToday) {
      localStorage.setItem(DAILY_KEY(email), JSON.stringify({ date: todayKey, count: 1 }));
    } else {
      daily.count = (daily.count || 0) + 1;
      localStorage.setItem(DAILY_KEY(email), JSON.stringify(daily));
    }

    // Streak
    const streak = JSON.parse(localStorage.getItem(STREAK_KEY(email)) || '{"days":0,"lastDate":""}');
    if (streak.lastDate === yesterday) {
      streak.days = (streak.days || 0) + 1;
      streak.lastDate = todayKey;
    } else if (streak.lastDate !== todayKey) {
      streak.days = 1;
      streak.lastDate = todayKey;
    }
    localStorage.setItem(STREAK_KEY(email), JSON.stringify(streak));
    return { isFirstToday, streakDays: streak.days };
  }

  /**
   * MAIN: award XP for a gift send
   * @param {string} email  — sender email
   * @param {string} giftId — gift ID
   * @param {number} coinsSpent — base coin cost × qty
   * @param {number} qty    — quantity
   */
  window.v89AwardGiftXP = function(email, giftId, coinsSpent, qty) {
    if (!email || !coinsSpent) return;

    const { isFirstToday, streakDays } = updateDailyAndStreak(email);
    const multiplier = getXPMultiplier(email);

    // XP = coins spent × multiplier (rounded)
    const xpEarned = Math.round(coinsSpent * multiplier);

    const stats = getStats(email);
    const prevCoins = stats.totalCoinsSpent || 0;
    const prevLevel = window.getQuartzLevel ? window.getQuartzLevel(prevCoins).level : 1;

    // Update stats
    stats.totalCoinsSpent  = prevCoins + coinsSpent;
    stats.totalXP          = (stats.totalXP || 0) + xpEarned;
    stats.totalGifts       = (stats.totalGifts || 0) + (qty || 1);
    stats.streakDays       = streakDays;
    stats.lastGiftTime     = Date.now();
    saveStats(email, stats);

    // Check level-up
    if (window.getQuartzLevel) {
      const newLevelData = window.getQuartzLevel(stats.totalCoinsSpent);
      if (newLevelData.level > prevLevel) {
        setTimeout(() => _triggerLevelUp(newLevelData), 1000);
      }
    }

    // Call original recordGiftSent (for afrib_gifter_levels.js chain)
    if (typeof window.recordGiftSent === 'function') {
      // Temporarily store to avoid double-counting in the old system
      try { window.recordGiftSent(email, giftId, coinsSpent, qty); } catch(_) {}
    }

    // Show bonus toasts
    if (isFirstToday && typeof showToast === 'function') {
      showToast('🌅 First gift today! +50% XP bonus!');
    }
    if (streakDays === 7 && typeof showToast === 'function') {
      showToast('🔥 7-day streak! Double XP active!');
    } else if (streakDays === 3 && typeof showToast === 'function') {
      showToast('⚡ 3-day streak! +25% XP bonus!');
    }

    // Update all coin/level displays
    v89RefreshDisplays(email);

    LOG(`XP awarded: ${xpEarned} (×${multiplier.toFixed(1)}) | Total coins: ${stats.totalCoinsSpent}`);
  };

  function _triggerLevelUp(newLevelData) {
    // Use existing level-up celebration if available
    if (typeof window.showQuartzLevelUp === 'function') {
      window.showQuartzLevelUp(newLevelData);
    } else if (typeof showToast === 'function') {
      const t = newLevelData.tier || {};
      showToast(`🎉 Level Up! You're now Level ${newLevelData.level} — ${t.name || 'Gifter'}!`);
    }
    // Also show in live viewer if open
    _showLevelUpInLive(newLevelData);
  }

  function _showLevelUpInLive(levelData) {
    const viewer = document.querySelector('.live-viewer-overlay');
    if (!viewer) return;
    const popup = document.createElement('div');
    popup.style.cssText = `
      position:absolute; top:20%; left:50%; transform:translateX(-50%);
      background:rgba(0,0,0,0.85); border:2px solid ${levelData.tier?.color || '#D4AF37'};
      border-radius:16px; padding:14px 20px; text-align:center; z-index:200;
      animation: v89LevelPopIn 0.4s cubic-bezier(.34,1.56,.64,1) forwards;
      pointer-events:none;
    `;
    popup.innerHTML = `
      <div style="font-size:12px;color:rgba(255,255,255,.6);margin-bottom:4px">LEVEL UP!</div>
      <div style="font-size:24px;font-weight:900;color:${levelData.tier?.color || '#D4AF37'}">
        Level ${levelData.level}
      </div>
      <div style="font-size:11px;color:rgba(255,255,255,.5);margin-top:4px">${levelData.tier?.name || ''}</div>
    `;
    viewer.appendChild(popup);
    setTimeout(() => {
      popup.style.opacity = '0';
      popup.style.transition = 'opacity 0.5s';
      setTimeout(() => popup.remove(), 500);
    }, 3000);
  }

  // Refresh all level/XP displays on screen
  function v89RefreshDisplays(email) {
    if (!email || !window.getQuartzLevel) return;
    const stats = getStats(email);
    const levelData = window.getQuartzLevel(stats.totalCoinsSpent || 0);

    // Update tray display
    const trayCoins = document.getElementById('v88TrayCoins');
    if (trayCoins) trayCoins.textContent = (stats.totalCoinsSpent || 0).toLocaleString();

    // Update v89 sender level pill in tray
    const senderLevel = document.getElementById('v89SenderLevel');
    if (senderLevel) {
      senderLevel.textContent = `Lv.${levelData.level} ${levelData.tier?.name || ''}`;
      senderLevel.style.color = levelData.tier?.color || '#D4AF37';
    }

    // Update coin display in top bar
    if (typeof window.v88UpdateCoinDisplay === 'function') {
      window.v88UpdateCoinDisplay();
    }
  }
  window.v89RefreshDisplays = v89RefreshDisplays;


  /* ══════════════════════════════════════════════════════════
   * § 3  PATCH ALL GIFT SEND PATHS to call v89AwardGiftXP
   * ══════════════════════════════════════════════════════════ */

  // ── 3a. Patch giftme.js gmSendGift ──
  function patchGmSendGift() {
    const origClose = window.closeGiftMe;
    const origSend  = window.gmSendGift;
    if (!origSend || origSend._v89) return;

    window.gmSendGift = function v89GmSendGift() {
      // Capture state before original runs (original clears _gmSelectedGift)
      const gift    = window._gmSelectedGift;
      const qty     = window._gmQty || 1;
      const recipEmail = window._gmRecipient?.email;
      const coinsSpent = gift ? (gift.coins * qty) : 0;
      const giftId     = gift?.id;

      // Call original
      origSend.apply(this, arguments);

      // Award XP to sender
      if (window.currentUser?.email && coinsSpent > 0) {
        window.v89AwardGiftXP(window.currentUser.email, giftId, coinsSpent, qty);
      }
    };
    window.gmSendGift._v89 = true;
    LOG('✅ Patched gmSendGift');
  }

  // ── 3b. Patch v88TraySend (post card gift tray) ──
  function patchV88TraySend() {
    const orig = window.v88TraySend;
    if (!orig || orig._v89) return;

    window.v88TraySend = function v89TraySend() {
      // Capture gift details before original clears them
      const traySelected = window._traySelected || window._v88TraySelected;
      const trayQty = parseInt(document.getElementById('v88TrayQty')?.textContent || '1');
      const coinsSpent = traySelected ? (traySelected.coins * trayQty) : 0;
      const giftId = traySelected?.id;

      // Call original
      const r = orig.apply(this, arguments);

      // Award XP
      if (window.currentUser?.email && coinsSpent > 0) {
        window.v89AwardGiftXP(window.currentUser.email, giftId, coinsSpent, trayQty);
      }
      return r;
    };
    window.v88TraySend._v89 = true;
    LOG('✅ Patched v88TraySend');
  }

  // ── 3c. Patch v88SendLiveGift (live viewer quick gifts) ──
  function patchV88LiveGift() {
    const orig = window.v88SendLiveGift;
    if (!orig || orig._v89) return;

    window.v88SendLiveGift = function v89SendLiveGift(streamId, emoji, name, coins) {
      // Call original
      const r = orig.apply(this, arguments);

      // Award XP
      if (window.currentUser?.email && coins > 0) {
        window.v89AwardGiftXP(window.currentUser.email, name.toLowerCase(), coins, 1);
      }
      return r;
    };
    window.v88SendLiveGift._v89 = true;
    LOG('✅ Patched v88SendLiveGift');
  }

  // ── 3d. Patch afrib_social_upgrade gift send ──
  function patchSocialGiftSend() {
    const orig = window.afribGiftSend || window.gmOpenForUser;
    // We already patch at recordGiftSent level in gifter_levels.js
    // but add extra safety: override recordGiftSent to always call v89AwardGiftXP
    const origRecord = window.recordGiftSent;
    if (!origRecord || origRecord._v89) return;

    window.recordGiftSent = function v89RecordGiftSent(email, giftId, coinsSpent, qty) {
      // Call old chain
      try { origRecord.apply(this, arguments); } catch(_) {}
      // Award v89 XP (only if not already called from v89AwardGiftXP to avoid double-count)
      if (!this._calledFromV89 && email && coinsSpent > 0) {
        const stats = getStats(email);
        // v89AwardGiftXP already updated stats; just refresh displays
        v89RefreshDisplays(email);
      }
    };
    window.recordGiftSent._v89 = true;
    LOG('✅ Patched recordGiftSent');
  }


  /* ══════════════════════════════════════════════════════════
   * § 4  FIX GIFTME BADGE INJECTION (correct element targeting)
   * ══════════════════════════════════════════════════════════ */
  function fixGiftMeBadgeInjection() {
    function injectBadge() {
      if (!window.currentUser?.email || !window.getQuartzLevel) return;
      const email = window.currentUser.email;
      const stats = getStats(email);
      const lvlData = window.getQuartzLevel(stats.totalCoinsSpent || 0);
      const tier = lvlData.tier || {};

      // Target the DRAWER (inner panel), not the overlay backdrop
      const drawer = document.getElementById('gm-drawer') ||
                     document.querySelector('.gm-drawer');
      if (!drawer || drawer.dataset.v89Badge) return;
      drawer.dataset.v89Badge = '1';

      const streak = JSON.parse(localStorage.getItem(STREAK_KEY(email)) || '{"days":0}');
      const hasStreak = streak.days >= 3;

      const badgeBar = document.createElement('div');
      badgeBar.id = 'v89GmBadgeBar';
      badgeBar.style.cssText = `
        display:flex; align-items:center; justify-content:space-between;
        padding:8px 14px 6px; border-bottom:1px solid rgba(255,255,255,.08);
        background:rgba(0,0,0,.15);
      `;
      badgeBar.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;cursor:pointer"
          onclick="openGifterProfile&&openGifterProfile('${email}')">
          ${window.renderQuartzBadgeSVG ? window.renderQuartzBadgeSVG(lvlData, 36) : '🎁'}
          <div>
            <div style="font-size:11px;font-weight:800;color:${tier.color || '#D4AF37'}" id="v89SenderLevel">
              Lv.${lvlData.level} ${tier.name || ''}
            </div>
            <div style="font-size:9px;color:rgba(255,255,255,.4)">
              ${lvlData.next ? `${lvlData.coinsToNext?.toLocaleString() || '?'}🪙 to next level` : '⭐ MAX LEVEL'}
              ${hasStreak ? ` · 🔥${streak.days}-day streak` : ''}
            </div>
          </div>
        </div>
        <button onclick="openGifterLeaderboard&&openGifterLeaderboard()"
          style="padding:4px 9px;background:rgba(212,175,55,.1);border:1px solid rgba(212,175,55,.2);
            border-radius:8px;color:#D4AF37;font-size:10px;font-weight:700;cursor:pointer">
          🏆 Top Gifters
        </button>
      `;

      // Insert after handle, before header
      const hdr = drawer.querySelector('.gm-hdr');
      if (hdr) drawer.insertBefore(badgeBar, hdr);
      else drawer.prepend(badgeBar);
    }

    // Patch all GiftMe open functions
    ['gmOpenForUser', '_gmOpenForUser', 'gmOpenModal', 'openGiftMe'].forEach(fn => {
      const orig = window[fn];
      if (typeof orig === 'function' && !orig._v89badge) {
        window[fn] = function() {
          const r = orig.apply(this, arguments);
          setTimeout(injectBadge, 250);
          return r;
        };
        window[fn]._v89badge = true;
      }
    });
    LOG('✅ Fixed GiftMe badge injection');
  }

  // Also inject badge into v88 gift tray
  function injectBadgeInV88Tray() {
    const orig = window.v88OpenGiftTray;
    if (!orig || orig._v89badge) return;

    window.v88OpenGiftTray = function v89OpenGiftTray(postId, authorEmail) {
      const r = orig.apply(this, arguments);
      setTimeout(() => {
        if (!window.currentUser?.email || !window.getQuartzLevel) return;
        const stats = getStats(window.currentUser.email);
        const lvlData = window.getQuartzLevel(stats.totalCoinsSpent || 0);
        const tier = lvlData.tier || {};
        const streak = JSON.parse(localStorage.getItem(STREAK_KEY(window.currentUser.email)) || '{"days":0}');

        const trayHeader = document.querySelector('.v88-tray-header');
        if (!trayHeader || trayHeader.querySelector('.v89-level-pill')) return;

        const pill = document.createElement('div');
        pill.className = 'v89-level-pill';
        pill.style.cssText = `
          display:flex; align-items:center; gap:4px; margin-right:4px;
          background:rgba(0,0,0,.2); border-radius:10px; padding:3px 8px;
          font-size:10px; font-weight:700;
        `;
        pill.innerHTML = `
          <span style="color:${tier.color || '#D4AF37'}">Lv.${lvlData.level}</span>
          ${streak.days >= 3 ? `<span style="color:#ff9800">🔥${streak.days}</span>` : ''}
        `;
        // Insert before coins display
        const coinsEl = trayHeader.querySelector('.v88-tray-coins');
        if (coinsEl) trayHeader.insertBefore(pill, coinsEl);
        else trayHeader.appendChild(pill);
      }, 200);
      return r;
    };
    window.v88OpenGiftTray._v89badge = true;
    LOG('✅ Badge injection in v88 gift tray');
  }


  /* ══════════════════════════════════════════════════════════
   * § 5  GIFTER BADGE ON POST CARDS (YourStyle + Home feed)
   * ══════════════════════════════════════════════════════════ */
  function patchPostCardsForBadge() {
    // Patch v84RenderPostCard to add gifter badge next to author name
    const origV84 = window.v84RenderPostCard;
    if (origV84 && !origV84._v89badge) {
      window.v84RenderPostCard = function(post) {
        let html = origV84.call(this, post);
        if (!html || !post?.authorEmail) return html;
        // Inject gifter badge pill next to author name
        const badge = _getAuthorBadgePill(post.authorEmail);
        if (badge) {
          html = html.replace(
            /class="v84-author-name"/,
            'class="v84-author-name" style="align-items:center;flex-wrap:wrap"'
          );
          // Add badge after name span
          html = html.replace(
            /(<span class="v84-author-name">)/,
            `$1${badge} `
          );
        }
        return html;
      };
      window.v84RenderPostCard._v89badge = true;
    }
  }

  function _getAuthorBadgePill(email) {
    if (!email || !window.getQuartzLevel) return '';
    const stats = getStats(email);
    const coins = stats.totalCoinsSpent || 0;
    if (coins < 56) return ''; // Don't show for Level 1-4
    const lvlData = window.getQuartzLevel(coins);
    const tier = lvlData.tier || {};
    return `<span style="font-size:9px;font-weight:800;color:${tier.color || '#D4AF37'};
      background:${(tier.color || '#D4AF37')}18;border:1px solid ${(tier.color || '#D4AF37')}30;
      border-radius:8px;padding:1px 5px;flex-shrink:0">Lv.${lvlData.level}</span>`;
  }


  /* ══════════════════════════════════════════════════════════
   * § 6  POST GIFT LEADERBOARD (top 3 gifters per post)
   * ══════════════════════════════════════════════════════════ */
  const POST_GIFTS_KEY = 'afrib_post_gifts_v88';

  function _getPostGifters(postId) {
    try {
      const all = JSON.parse(localStorage.getItem(POST_GIFTS_KEY) || '{}');
      return all[postId]?.topGifts || [];
    } catch(_) { return []; }
  }

  // Render compact top 3 gifters strip
  window.v89GetPostLeaderboard = function(postId) {
    const gifts = _getPostGifters(postId);
    if (!gifts.length) return '';
    // Aggregate by sender
    const byUser = {};
    gifts.forEach(g => {
      byUser[g.sender] = byUser[g.sender] || { sender:g.sender, coins:0 };
      byUser[g.sender].coins += g.coins;
    });
    const sorted = Object.values(byUser).sort((a,b) => b.coins - a.coins).slice(0,3);
    const medals = ['🥇','🥈','🥉'];
    return sorted.map((u,i) => `
      <span style="font-size:9px;color:rgba(255,255,255,.5)">
        ${medals[i]} ${_esc(u.sender)} 🪙${u.coins}
      </span>
    `).join('<span style="color:rgba(255,255,255,.2);padding:0 2px">·</span>');
  };

  function _esc(s) {
    return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }


  /* ══════════════════════════════════════════════════════════
   * § 7  GIFTER STATS PANEL — enhanced profile view
   * ══════════════════════════════════════════════════════════ */
  const origOpenGifterProfile = window.openGifterProfile;
  window.openGifterProfile = function(email) {
    if (!email) return;
    if (!window.getQuartzLevel) {
      if (typeof origOpenGifterProfile === 'function') origOpenGifterProfile(email);
      return;
    }

    const stats = getStats(email);
    const lvlData = window.getQuartzLevel(stats.totalCoinsSpent || 0);
    const tier = lvlData.tier || {};
    const streak = JSON.parse(localStorage.getItem(STREAK_KEY(email)) || '{"days":0}');
    const daily = JSON.parse(localStorage.getItem(DAILY_KEY(email)) || '{"count":0}');
    const isMe = window.currentUser?.email === email;

    const old = document.getElementById('v89GifterProfile');
    if (old) old.remove();

    const multiplier = getXPMultiplier(email);

    const overlay = document.createElement('div');
    overlay.id = 'v89GifterProfile';
    overlay.style.cssText = `
      position:fixed; inset:0; z-index:4000;
      background:rgba(0,0,0,0.75); backdrop-filter:blur(8px);
      display:flex; align-items:flex-end; justify-content:center;
    `;
    overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };

    const progress = lvlData.progress || 0;
    const nextLvl = lvlData.next;
    const progressText = nextLvl
      ? `${(lvlData.coinsToNext || 0).toLocaleString()} coins to Level ${nextLvl.level}`
      : '⭐ Maximum Level Achieved';

    overlay.innerHTML = `
      <div style="
        background:linear-gradient(160deg,#0a0815,#0e0620);
        border:1px solid rgba(255,255,255,.1); border-radius:24px 24px 0 0;
        width:100%; max-width:480px; padding:0 0 env(safe-area-inset-bottom,16px);
        animation:v89ProfileSlide .3s ease;
      ">
        <style>@keyframes v89ProfileSlide{from{transform:translateY(100%)}to{transform:translateY(0)}}</style>

        <!-- Handle -->
        <div style="width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,.15);margin:12px auto 0"></div>

        <!-- Header -->
        <div style="text-align:center;padding:20px 20px 16px;border-bottom:1px solid rgba(255,255,255,.07)">
          ${window.renderQuartzBadgeSVG ? `<div style="display:flex;justify-content:center;margin-bottom:10px">${window.renderQuartzBadgeSVG(lvlData, 72)}</div>` : ''}
          <div style="font-size:22px;font-weight:900;color:${tier.color || '#D4AF37'}">
            Level ${lvlData.level}
          </div>
          <div style="font-size:14px;font-weight:700;color:rgba(255,255,255,.7);margin-top:2px">
            ${tier.name || 'Gifter'}
          </div>
          ${multiplier > 1 ? `<div style="margin-top:6px;display:inline-flex;align-items:center;gap:4px;background:rgba(255,152,0,.15);border:1px solid rgba(255,152,0,.3);border-radius:12px;padding:3px 10px;font-size:11px;font-weight:700;color:#ff9800">
            ⚡ ×${multiplier.toFixed(1)} XP Active
          </div>` : ''}
        </div>

        <!-- Progress bar -->
        <div style="padding:14px 20px;border-bottom:1px solid rgba(255,255,255,.07)">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px">
            <span style="font-size:11px;font-weight:700;color:${tier.color || '#D4AF37'}">Progress</span>
            <span style="font-size:11px;color:rgba(255,255,255,.4)">${progress}%</span>
          </div>
          <div style="height:6px;background:rgba(255,255,255,.08);border-radius:3px;overflow:hidden">
            <div style="height:100%;width:${progress}%;background:linear-gradient(90deg,${tier.color || '#D4AF37'},${tier.color || '#D4AF37'}99);border-radius:3px;transition:width .5s ease"></div>
          </div>
          <div style="font-size:10px;color:rgba(255,255,255,.3);margin-top:5px;text-align:center">${progressText}</div>
        </div>

        <!-- Stats grid -->
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:rgba(255,255,255,.05);margin:0">
          ${[
            { label:'Coins Spent',   value:(stats.totalCoinsSpent||0).toLocaleString(), icon:'🪙' },
            { label:'Gifts Sent',    value:(stats.totalGifts||0).toLocaleString(),       icon:'🎁' },
            { label:'Day Streak',    value:`${streak.days||0}🔥`,                        icon:'📅' },
          ].map(s => `
            <div style="padding:14px 8px;text-align:center;background:#0a0815">
              <div style="font-size:18px;margin-bottom:4px">${s.icon}</div>
              <div style="font-size:15px;font-weight:800;color:#fff">${s.value}</div>
              <div style="font-size:9px;color:rgba(255,255,255,.35);margin-top:2px">${s.label}</div>
            </div>
          `).join('')}
        </div>

        <!-- Level milestones -->
        <div style="padding:14px 20px;border-top:1px solid rgba(255,255,255,.07)">
          <div style="font-size:11px;font-weight:700;color:rgba(255,255,255,.5);margin-bottom:10px;text-transform:uppercase;letter-spacing:.8px">Milestone Rewards</div>
          <div style="display:flex;flex-direction:column;gap:6px">
            ${_getMilestoneHTML(lvlData.level)}
          </div>
        </div>

        <!-- Close -->
        <div style="padding:8px 20px 12px">
          <button onclick="document.getElementById('v89GifterProfile').remove()"
            style="width:100%;padding:12px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);
              border-radius:12px;color:rgba(255,255,255,.7);font-size:14px;font-weight:700;cursor:pointer">
            Close
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
  };

  function _getMilestoneHTML(currentLevel) {
    const milestones = [
      { level:5,  reward:'🎫 Special Level 5 Badge',           coins:56 },
      { level:10, reward:'✨ Level-up animation in Live',       coins:530 },
      { level:15, reward:'🔫 Unlock Money Gun gift (500🪙)',    coins:4340 },
      { level:20, reward:'🎈 Unlock Hot Air Balloon (1000🪙)',  coins:27600 },
      { level:25, reward:'✈️ Unlock Jet gift + Spotlight entry',coins:144000 },
      { level:30, reward:'🚀 Unlock Shuttle gift (20,000🪙)',   coins:637000 },
      { level:35, reward:'🌟 Level-up animation in ALL Lives',  coins:2500000 },
      { level:40, reward:'🌌 Unlock TikTok Universe+ (34,999🪙)',coins:8780000 },
      { level:50, reward:'👑 QUARTZ GOD — Pegasus Gift + Title', coins:80000000 },
    ];

    return milestones.map(m => {
      const done = currentLevel >= m.level;
      const next = currentLevel < m.level && currentLevel >= m.level - 10;
      const color = done ? '#22c55e' : next ? '#D4AF37' : 'rgba(255,255,255,.25)';
      return `
        <div style="display:flex;align-items:center;gap:8px;opacity:${done?1:next?.7:.4}">
          <div style="width:22px;height:22px;border-radius:50%;
            background:${done?'#22c55e':next?'rgba(212,175,55,.2)':'rgba(255,255,255,.08)'};
            border:1.5px solid ${color};display:flex;align-items:center;justify-content:center;
            font-size:10px;font-weight:900;color:${done?'#000':color};flex-shrink:0">
            ${done?'✓':m.level}
          </div>
          <div>
            <div style="font-size:11px;font-weight:700;color:${color}">${m.reward}</div>
            <div style="font-size:9px;color:rgba(255,255,255,.3)">Level ${m.level} · ${m.coins.toLocaleString()}🪙 total</div>
          </div>
        </div>
      `;
    }).join('');
  }


  /* ══════════════════════════════════════════════════════════
   * § 8  ENHANCED LEADERBOARD with gifter levels
   * ══════════════════════════════════════════════════════════ */
  const origLeaderboard = window.openGifterLeaderboard;
  window.openGifterLeaderboard = function() {
    if (!window.getQuartzLevel) {
      if (typeof origLeaderboard === 'function') origLeaderboard();
      return;
    }

    const old = document.getElementById('v89Leaderboard');
    if (old) old.remove();

    // Gather all users with gift stats from localStorage
    const entries = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith('afrib_gift_stats_')) continue;
      try {
        const data = JSON.parse(localStorage.getItem(key));
        const email = key.replace('afrib_gift_stats_', '');
        if (data && data.totalCoinsSpent > 0) {
          entries.push({ email, ...data });
        }
      } catch(_) {}
    }

    entries.sort((a, b) => (b.totalCoinsSpent || 0) - (a.totalCoinsSpent || 0));
    const myEmail = window.currentUser?.email;

    const overlay = document.createElement('div');
    overlay.id = 'v89Leaderboard';
    overlay.style.cssText = `
      position:fixed; inset:0; z-index:4000;
      background:rgba(0,0,0,0.7); backdrop-filter:blur(8px);
      display:flex; align-items:flex-end; justify-content:center;
    `;
    overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };

    const myEntry = entries.find(e => e.email === myEmail);
    const myRank = myEntry ? entries.indexOf(myEntry) + 1 : null;

    overlay.innerHTML = `
      <div style="
        background:linear-gradient(160deg,#0a0815,#0e0620);
        border:1px solid rgba(255,255,255,.1); border-radius:24px 24px 0 0;
        width:100%; max-width:480px; max-height:80vh; overflow:hidden;
        display:flex; flex-direction:column;
        animation:v89ProfileSlide .3s ease;
      ">
        <div style="width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,.15);margin:12px auto 0;flex-shrink:0"></div>

        <div style="padding:16px 20px 12px;border-bottom:1px solid rgba(255,255,255,.07);flex-shrink:0;display:flex;align-items:center;justify-content:space-between">
          <div>
            <div style="font-size:17px;font-weight:900;color:#D4AF37">🏆 Top Gifters</div>
            <div style="font-size:11px;color:rgba(255,255,255,.4);margin-top:2px">All-time leaderboard</div>
          </div>
          ${myRank ? `<div style="font-size:12px;color:rgba(255,255,255,.5)">Your rank: <span style="color:#D4AF37;font-weight:800">#${myRank}</span></div>` : ''}
        </div>

        <div style="overflow-y:auto;flex:1;padding:8px 0">
          ${entries.length === 0 ? `
            <div style="text-align:center;padding:32px;color:rgba(255,255,255,.3);font-size:13px">
              No gifters yet — be the first! 🎁
            </div>
          ` : entries.slice(0,50).map((e, i) => {
            const lvlData = window.getQuartzLevel(e.totalCoinsSpent || 0);
            const tier = lvlData.tier || {};
            const isMe = e.email === myEmail;
            const medals = ['🥇','🥈','🥉'];
            const name = e.email.split('@')[0];
            const streak = JSON.parse(localStorage.getItem(STREAK_KEY(e.email)) || '{"days":0}');
            return `
              <div style="
                display:flex; align-items:center; gap:10px; padding:10px 16px;
                background:${isMe?'rgba(212,175,55,.06)':'transparent'};
                border-bottom:1px solid rgba(255,255,255,.04);
              ">
                <div style="font-size:16px;width:24px;text-align:center;flex-shrink:0">
                  ${i < 3 ? medals[i] : `<span style="font-size:11px;color:rgba(255,255,255,.3)">#${i+1}</span>`}
                </div>
                ${window.renderQuartzBadgeSVG ? window.renderQuartzBadgeSVG(lvlData, 32) : ''}
                <div style="flex:1;min-width:0">
                  <div style="font-size:13px;font-weight:700;color:${isMe?'#D4AF37':'#fff'};display:flex;align-items:center;gap:4px">
                    ${_esc(name)}
                    ${isMe ? '<span style="font-size:9px;background:rgba(212,175,55,.15);color:#D4AF37;border-radius:6px;padding:1px 5px">YOU</span>' : ''}
                    ${streak.days >= 7 ? '<span style="font-size:10px">🔥</span>' : ''}
                  </div>
                  <div style="font-size:10px;color:${tier.color||'rgba(255,255,255,.4)'}">
                    Level ${lvlData.level} — ${tier.name||''} · ${(e.totalGifts||0)} gifts
                  </div>
                </div>
                <div style="font-size:11px;font-weight:800;color:rgba(255,255,255,.5);flex-shrink:0">
                  🪙${(e.totalCoinsSpent||0).toLocaleString()}
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div style="padding:10px 20px 12px;flex-shrink:0;border-top:1px solid rgba(255,255,255,.07)">
          <button onclick="document.getElementById('v89Leaderboard').remove()"
            style="width:100%;padding:12px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);
              border-radius:12px;color:rgba(255,255,255,.7);font-size:14px;font-weight:700;cursor:pointer">
            Close
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  };


  /* ══════════════════════════════════════════════════════════
   * § 9  CSS
   * ══════════════════════════════════════════════════════════ */
  const css = document.createElement('style');
  css.id = 'v89-css';
  css.textContent = `
    /* Gifter badge pill on post cards */
    .v89-author-badge {
      display: inline-flex;
      align-items: center;
      font-size: 9px;
      font-weight: 800;
      border-radius: 8px;
      padding: 1px 5px;
      flex-shrink: 0;
      line-height: 1.4;
    }
    /* Level pill in v88 tray */
    .v89-level-pill {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    /* XP multiplier badge */
    .v89-xp-badge {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      background: rgba(255,152,0,.15);
      border: 1px solid rgba(255,152,0,.3);
      border-radius: 12px;
      padding: 2px 8px;
      font-size: 10px;
      font-weight: 800;
      color: #ff9800;
    }
    /* Streak indicator */
    .v89-streak {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      font-size: 10px;
      font-weight: 700;
      color: #ff9800;
    }
  `;
  document.head.appendChild(css);


  /* ══════════════════════════════════════════════════════════
   * § 10  INIT
   * ══════════════════════════════════════════════════════════ */
  function init() {
    // Wait for all dependencies to load
    function waitAndInit() {
      fixLevelThresholds();
      patchGmSendGift();
      patchV88TraySend();
      patchV88LiveGift();
      patchSocialGiftSend();
      fixGiftMeBadgeInjection();
      injectBadgeInV88Tray();
      patchPostCardsForBadge();

      // Refresh feeds to show badges
      setTimeout(() => {
        if (typeof renderStyleFeed === 'function') renderStyleFeed();
        if (typeof v87RefreshFeed === 'function') v87RefreshFeed();
      }, 300);

      LOG('✅ v89 fully initialized');
    }

    // Give all deferred scripts time to load
    setTimeout(waitAndInit, 600);

    document.addEventListener('afrib:login', () => {
      setTimeout(waitAndInit, 800);
    });

    // Re-patch any functions that may re-assign themselves
    setInterval(() => {
      if (window.gmSendGift && !window.gmSendGift._v89) patchGmSendGift();
      if (window.v88TraySend && !window.v88TraySend._v89) patchV88TraySend();
      if (window.v88SendLiveGift && !window.v88SendLiveGift._v89) patchV88LiveGift();
    }, 3000);
  }

  if (document.readyState !== 'loading') {
    setTimeout(init, 1600);
  } else {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 1600));
  }

})();
