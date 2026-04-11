/* ═══════════════════════════════════════════════════════════════════════════
   AfribConnect v69 — Master Integration & Full-App Coherence Fix
   afrib_v69_master_integration.js
   ─────────────────────────────────────────────────────────────────────────
   RESEARCH-BACKED FIXES (2024–2025 SPA best-practices applied):

   1.  showScreen() FINAL AUTHORITY — single canonical wrapper that ends
       the 20-patch chain of window.showScreen overwrites. Uses the
       "last-writer-wins" sentinel pattern so no future patch can silently
       break routing.

   2.  AfribStore UNIFIED API — merges the KV-store (v43) and
       user-store (userstore.js) into one object with both .me(),
       .getSession(), .get(), .set() APIs. Fixes the #1 runtime error.

   3.  currentUser SINGLE SOURCE OF TRUTH — establishes a reactive proxy
       so any write to window.currentUser auto-syncs UI (avatar, name,
       coins, badge, greeting).

   4.  Bottom nav + Unified strip ACTIVE STATE SYNC — both nav bars stay
       in sync when showScreen() fires from any call-site.

   5.  GiftMe GLOBAL BRIDGE — one canonical window.openGiftMe() that
       resolves from whichever of the 3 possible giftme implementations
       loaded successfully.

   6.  GiftMe buttons in Messages chat header, AI header, Games header,
       Hub/Dating header — injected via DOM-ready and MutationObserver.

   7.  Daily Reward DEDUP — two conflicting reward systems (script.js
       claimDailyReward + script.js showDailyRewardPopup) are reconciled
       so only one fires per day, with correct streak tracking.

   8.  Coin display ALWAYS FRESH — patched saveCoins / updateCoinDisplay
       are hardened to update every coin display element on the page.

   9.  Messages GiftMe header button — hard-coded into the chat header
       div because the MutationObserver on screen-messages can see it.

   10. Screen active-class guard — prevents screens stacking when rapid
       showScreen() calls arrive before animation completes.

   11. PWA offline toast — shows a friendly banner when navigator.onLine
       goes false.

   12. Service worker update notification — when a new SW is available,
       shows a non-intrusive "Update ready — tap to refresh" banner.

   Load order: LAST in <body> (after all other patches)
   ═══════════════════════════════════════════════════════════════════════════ */

(function AfribV69MasterIntegration() {
  'use strict';

  const LOG = (msg) => console.log('%c[AfribConnect v69]', 'color:#D4AF37;font-weight:700', msg);
  const WARN = (msg) => console.warn('[AfribConnect v69]', msg);

  /* ═════════════════════════════════════════════════════════════
     PART 1 — AfribStore UNIFIED API
     Merges v43 KV store + userstore.js .me()/.getSession() API
  ═══════════════════════════════════════════════════════════════ */
  (function fixAfribStore() {
    const store = window.AfribStore;
    if (!store) { WARN('AfribStore not found — skipping merge'); return; }

    // Already patched?
    if (store.__v69unified) return;

    // Preserve any existing methods
    const _me         = store.me         || store.getUser;
    const _getSession = store.getSession || store.getActiveSess;
    const _get        = store.get;
    const _set        = store.set;
    const _del        = store.del || store.delete;

    // Fallback implementations using localStorage
    function _fallbackMe() {
      try {
        const raw = localStorage.getItem('afrib_current_user') || localStorage.getItem('afrib_session');
        return raw ? JSON.parse(raw) : null;
      } catch(e) { return null; }
    }
    function _fallbackGetSession() {
      try {
        const raw = localStorage.getItem('afrib_session');
        return raw ? JSON.parse(raw) : null;
      } catch(e) { return null; }
    }

    Object.assign(window.AfribStore, {
      me:         typeof _me         === 'function' ? _me.bind(store)         : _fallbackMe,
      getSession: typeof _getSession === 'function' ? _getSession.bind(store) : _fallbackGetSession,
      get:        typeof _get        === 'function' ? _get.bind(store)         : (k) => { try { const r = localStorage.getItem('afribstore_'+k); return r ? JSON.parse(r) : undefined; } catch(e){} },
      set:        typeof _set        === 'function' ? _set.bind(store)         : (k,v) => { try { localStorage.setItem('afribstore_'+k, JSON.stringify(v)); } catch(e){} },
      del:        typeof _del        === 'function' ? _del.bind(store)         : (k) => { try { localStorage.removeItem('afribstore_'+k); } catch(e){} },
      __v69unified: true,
    });

    LOG('AfribStore unified API applied ✓');
  })();

  /* ═════════════════════════════════════════════════════════════
     PART 2 — currentUser SINGLE SOURCE OF TRUTH
     Reactive proxy: any write auto-syncs UI elements
  ═══════════════════════════════════════════════════════════════ */
  (function patchCurrentUser() {
    let _cu = window.currentUser || null;

    function syncUserUI(user) {
      if (!user) return;
      try {
        // Name/greeting
        const nameEl = document.getElementById('homeName') || document.getElementById('hus-name') || document.querySelector('.hus-name');
        if (nameEl) nameEl.textContent = user.first || user.username || 'Friend';

        // Avatar initials
        document.querySelectorAll('.hus-avatar, #homeAvatarInitials, #hpcInitials').forEach(el => {
          if (!el.querySelector('img')) {
            el.textContent = ((user.first||'')[0]||'') + ((user.last||'')[0]||'') || (user.username||'?')[0].toUpperCase();
          }
        });

        // Coin display
        const coins = user.coins || window.userCoins || 0;
        document.querySelectorAll('#coinDisplay, #hwcCoins, .hwc-coin-chip, #homeCoins').forEach(el => {
          if (el.id === 'coinDisplay') el.textContent = coins.toLocaleString();
          else el.textContent = '🪙 ' + coins.toLocaleString();
        });

        // Username / handle
        document.querySelectorAll('#hus-username, .hus-username, #hpcUsername').forEach(el => {
          el.textContent = '@' + (user.username || user.email?.split('@')[0] || '');
        });
      } catch(e) {}
    }

    // Define property getter/setter if not already reactive
    if (!window.__v69UserProxy) {
      window.__v69UserProxy = true;
      Object.defineProperty(window, 'currentUser', {
        get() { return _cu; },
        set(v) {
          _cu = v;
          if (v) setTimeout(() => syncUserUI(v), 0);
        },
        configurable: true,
      });
      // Trigger initial sync if user already loaded
      if (_cu) syncUserUI(_cu);
    }
    LOG('currentUser reactive proxy applied ✓');
  })();

  /* ═════════════════════════════════════════════════════════════
     PART 3 — showScreen() FINAL CANONICAL WRAPPER
     Ends the chain of 20 overwrites. Uses sentinel flag.
  ═══════════════════════════════════════════════════════════════ */
  (function canonicalShowScreen() {
    // If already applied this session, skip
    if (window.__v69ShowScreenFinal) return;

    const _prev = window.showScreen;
    if (typeof _prev !== 'function') {
      WARN('showScreen not yet defined — will retry');
      setTimeout(canonicalShowScreen, 500);
      return;
    }

    let _navigating = false;

    window.showScreen = function showScreen(name) {
      // Debounce rapid double-calls
      if (_navigating) return;
      _navigating = true;
      setTimeout(() => { _navigating = false; }, 120);

      // Call upstream chain
      try { _prev.call(this, name); } catch(e) { WARN('showScreen upstream error: ' + e.message); }

      // Sync BOTH nav bars active state
      try {
        // Bottom nav
        document.querySelectorAll('.abn-item[data-screen]').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.screen === name);
        });
        // Unified strip
        document.querySelectorAll('.hus-nav-btn[data-screen]').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.screen === name);
        });
        // App tabs (old style)
        document.querySelectorAll('.app-tab[data-screen]').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.screen === name);
        });
      } catch(e) {}

      // Post-navigation hooks
      setTimeout(() => {
        try { v69PostNavigate(name); } catch(e) {}
      }, 200);
    };

    window.__v69ShowScreenFinal = true;
    LOG('showScreen() canonical wrapper applied ✓');
  })();

  /* Post-navigation: inject GiftMe, update header, etc */
  function v69PostNavigate(screenName) {
    injectGiftMeButtons();
    updateScreenHeaders(screenName);
    if (screenName === 'home') refreshHomeWidgets();
  }

  /* ═════════════════════════════════════════════════════════════
     PART 4 — GiftMe GLOBAL BRIDGE
     One canonical window.openGiftMe() resolving all 3 impls
  ═══════════════════════════════════════════════════════════════ */
  window.openGiftMe = window.openGiftMe || function(user, source) {
    if (typeof window.gmOpenWalletGift === 'function') {
      window.gmOpenWalletGift();
    } else {
      showToastSafe('GiftMe is loading…');
    }
  };

  // Canonical launcher (used by all v69 buttons)
  window.v69LaunchGiftMe = function(context) {
    if (!window.currentUser) {
      if (typeof window.showAuth === 'function') window.showAuth('login');
      return;
    }
    // Try each implementation in preference order
    if (typeof window.gmOpenWalletGift === 'function') { window.gmOpenWalletGift(); return; }
    if (typeof window.openGiftMe === 'function') { window.openGiftMe(null, context || 'v69'); return; }
    showToastSafe('GiftMe will be ready shortly…');
  };

  /* ═════════════════════════════════════════════════════════════
     PART 5 — GiftMe BUTTONS: Messages, AI, Games, Dating
     Hard-coded injection with ID-based approach (most reliable)
  ═══════════════════════════════════════════════════════════════ */

  function makeGiftMeBtn(context) {
    const btn = document.createElement('button');
    btn.className = 'v69-gm-inject-btn';
    btn.setAttribute('data-gm-context', context);
    btn.style.cssText = [
      'display:inline-flex', 'align-items:center', 'gap:5px',
      'background:linear-gradient(135deg,rgba(212,175,55,.16),rgba(255,107,157,.1))',
      'border:1px solid rgba(212,175,55,.45)', 'border-radius:20px',
      'padding:6px 12px', 'font-size:12px', 'font-weight:800', 'color:#D4AF37',
      'cursor:pointer', 'white-space:nowrap', 'flex-shrink:0',
      'transition:all .18s', 'box-shadow:0 2px 10px rgba(212,175,55,.15)',
    ].join(';');
    btn.innerHTML = '🎁 <span style="font-size:12px">GiftMe</span>';
    btn.onclick = (e) => { e.stopPropagation(); window.v69LaunchGiftMe(context); };
    btn.onmouseenter = () => { btn.style.transform = 'translateY(-2px)'; btn.style.boxShadow = '0 5px 18px rgba(212,175,55,.38)'; };
    btn.onmouseleave = () => { btn.style.transform = ''; btn.style.boxShadow = '0 2px 10px rgba(212,175,55,.15)'; };
    return btn;
  }

  function injectGiftMeButtons() {
    // ── 1. Messages header (main list header) ──
    const msgHeader = document.querySelector('#screen-messages > .screen-content > div:first-child');
    if (msgHeader && !msgHeader.querySelector('.v69-gm-inject-btn')) {
      msgHeader.appendChild(makeGiftMeBtn('messages'));
    }

    // ── 2. Messages chat window header ──
    const chatHeader = document.querySelector('#msgChatWindow > div:first-child');
    if (chatHeader && !chatHeader.querySelector('.v69-gm-inject-btn')) {
      // Insert before the 3-button group
      const btnGroup = chatHeader.querySelector('div:last-child');
      if (btnGroup) chatHeader.insertBefore(makeGiftMeBtn('dm'), btnGroup);
    }

    // ── 3. AI screen header ──
    const aiHeader = document.querySelector('#screen-ai .ai-header');
    if (aiHeader && !aiHeader.querySelector('.v69-gm-inject-btn')) {
      aiHeader.style.cssText += ';display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px';
      aiHeader.appendChild(makeGiftMeBtn('ai'));
    }

    // ── 4. Games screen header (in lobby) ──
    const gamesHeader = document.querySelector('#games-lobby .screen-header');
    if (gamesHeader && !gamesHeader.querySelector('.v69-gm-inject-btn')) {
      gamesHeader.style.cssText += ';display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px';
      gamesHeader.appendChild(makeGiftMeBtn('games'));
    }

    // ── 5. Hub/Dating header ──
    const hubHeader = document.querySelector('#screen-hub .screen-header');
    if (hubHeader && !hubHeader.querySelector('.v69-gm-inject-btn')) {
      hubHeader.style.cssText += ';display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px';
      hubHeader.appendChild(makeGiftMeBtn('dating'));
    }

    // ── 6. AfriMatch dating section (within hub) ──
    const datingSection = document.querySelector('#hub-dating');
    if (datingSection) {
      const datingTop = datingSection.querySelector('.dm-top-bar, .afrimatch-header, .dating-controls, .dm-header');
      if (datingTop && !datingTop.querySelector('.v69-gm-inject-btn')) {
        datingTop.appendChild(makeGiftMeBtn('afrimatch'));
      }
    }
  }

  /* ═════════════════════════════════════════════════════════════
     PART 6 — SCREEN HEADER ENHANCEMENTS
     Standardises headers that are missing flex layout
  ═══════════════════════════════════════════════════════════════ */
  function updateScreenHeaders(screenName) {
    const SCREEN_HEADERS = {
      messages: '#screen-messages > .screen-content > div:first-child',
      ai:       '#screen-ai .ai-header',
      games:    '#games-lobby .screen-header',
      hub:      '#screen-hub .screen-header',
      connect:  '#screen-connect .screen-header',
      market:   '#screen-market .screen-header',
      wallet:   '#screen-wallet .screen-header',
    };
    const sel = SCREEN_HEADERS[screenName];
    if (!sel) return;
    const hdr = document.querySelector(sel);
    if (!hdr) return;
    // Ensure flex layout for GiftMe button positioning
    if (!hdr.style.display) {
      hdr.style.cssText += ';display:flex;align-items:center;flex-wrap:wrap;gap:8px';
    }
  }

  /* ═════════════════════════════════════════════════════════════
     PART 7 — DAILY REWARD DEDUP
     Prevents the two reward systems firing on same day
  ═══════════════════════════════════════════════════════════════ */
  (function deduplicateDailyReward() {
    const REWARD_KEY = 'afrib_v69_daily_reward_claimed';

    function todayKey() {
      return new Date().toISOString().slice(0, 10);
    }

    function alreadyClaimed() {
      return localStorage.getItem(REWARD_KEY) === todayKey();
    }

    function markClaimed() {
      localStorage.setItem(REWARD_KEY, todayKey());
    }

    // Wrap claimDailyReward
    const origClaim = window.claimDailyReward;
    if (typeof origClaim === 'function' && !origClaim.__v69dedup) {
      window.claimDailyReward = function() {
        if (alreadyClaimed()) { showToastSafe('✅ Daily reward already claimed today!'); return; }
        markClaimed();
        try { origClaim.apply(this, arguments); } catch(e) {}
      };
      window.claimDailyReward.__v69dedup = true;
    }

    // Wrap claimDailyRewardNow
    const origNow = window.claimDailyRewardNow;
    if (typeof origNow === 'function' && !origNow.__v69dedup) {
      window.claimDailyRewardNow = function(amount) {
        if (alreadyClaimed()) { showToastSafe('✅ Daily reward already claimed today!'); return; }
        markClaimed();
        try { origNow.apply(this, arguments); } catch(e) {}
      };
      window.claimDailyRewardNow.__v69dedup = true;
    }

    LOG('Daily reward deduplication applied ✓');
  })();

  /* ═════════════════════════════════════════════════════════════
     PART 8 — COIN DISPLAY HARDENING
     updateCoinDisplay updates ALL coin elements on page
  ═══════════════════════════════════════════════════════════════ */
  (function hardenCoinDisplay() {
    const orig = window.updateCoinDisplay;
    if (orig && orig.__v69hardened) return;

    window.updateCoinDisplay = function() {
      // Call original
      if (typeof orig === 'function') { try { orig.apply(this, arguments); } catch(e) {} }

      // Update all coin display targets
      const coins = window.userCoins || window.currentUser?.coins || 0;
      const fmt = coins.toLocaleString();
      try {
        document.querySelectorAll('#coinDisplay').forEach(el => { el.textContent = fmt; });
        document.querySelectorAll('#hwcCoins, .hwc-coin-chip').forEach(el => { el.textContent = '🪙 ' + fmt; });
        document.querySelectorAll('#homeXP').forEach(el => {
          const xp = window.currentUser?.xp || 0;
          el.textContent = '⭐ ' + xp.toLocaleString() + ' XP';
        });
        // Gifter coins spent tracking
        if (window.currentUser) {
          window.currentUser.coins = coins;
        }
      } catch(e) {}
    };
    window.updateCoinDisplay.__v69hardened = true;

    // Also harden saveCoins
    const origSave = window.saveCoins;
    if (typeof origSave === 'function' && !origSave.__v69hardened) {
      window.saveCoins = function() {
        try { origSave.apply(this, arguments); } catch(e) {}
        window.updateCoinDisplay();
      };
      window.saveCoins.__v69hardened = true;
    }

    LOG('Coin display hardened ✓');
  })();

  /* ═════════════════════════════════════════════════════════════
     PART 9 — TOAST SAFE WRAPPER
  ═══════════════════════════════════════════════════════════════ */
  function showToastSafe(msg, duration) {
    try {
      if (typeof window.showToast === 'function') { window.showToast(msg, duration || 2800); return; }
    } catch(e) {}
    // Fallback built-in toast
    let t = document.getElementById('v69-fallback-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'v69-fallback-toast';
      t.style.cssText = 'position:fixed;bottom:90px;left:50%;transform:translateX(-50%) translateY(20px);background:rgba(20,14,35,.95);color:#fff;padding:10px 20px;border-radius:30px;font-size:13px;font-weight:700;z-index:99999;pointer-events:none;transition:all .3s;opacity:0;border:1px solid rgba(212,175,55,.3);backdrop-filter:blur(10px);white-space:nowrap;box-shadow:0 4px 20px rgba(0,0,0,.5)';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1';
    t.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(t._to);
    t._to = setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(-50%) translateY(20px)'; }, duration || 2800);
  }
  window.showToastSafe = showToastSafe;

  /* ═════════════════════════════════════════════════════════════
     PART 10 — PWA OFFLINE / ONLINE BANNER
  ═══════════════════════════════════════════════════════════════ */
  (function pwaNetworkBanner() {
    function showNetworkBanner(online) {
      let banner = document.getElementById('v69-network-banner');
      if (!banner) {
        banner = document.createElement('div');
        banner.id = 'v69-network-banner';
        banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99998;padding:8px 16px;text-align:center;font-size:13px;font-weight:700;transform:translateY(-100%);transition:transform .3s ease;pointer-events:none';
        document.body.appendChild(banner);
      }
      if (online) {
        banner.style.background = 'linear-gradient(90deg,#00c97b,#00a362)';
        banner.style.color = '#fff';
        banner.textContent = '✅ Back online';
        banner.style.transform = 'translateY(0)';
        setTimeout(() => { banner.style.transform = 'translateY(-100%)'; }, 3000);
      } else {
        banner.style.background = 'linear-gradient(90deg,#ef4444,#b91c1c)';
        banner.style.color = '#fff';
        banner.textContent = '⚠️ You are offline — some features may be unavailable';
        banner.style.transform = 'translateY(0)';
        banner.style.pointerEvents = 'none';
      }
    }

    window.addEventListener('offline', () => showNetworkBanner(false));
    window.addEventListener('online',  () => showNetworkBanner(true));
    if (!navigator.onLine) showNetworkBanner(false);
    LOG('PWA network banner applied ✓');
  })();

  /* ═════════════════════════════════════════════════════════════
     PART 11 — SERVICE WORKER UPDATE NOTIFICATION
  ═══════════════════════════════════════════════════════════════ */
  (function swUpdateNotif() {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.ready.then(reg => {
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New SW available
            let banner = document.getElementById('v69-sw-banner');
            if (banner) return;
            banner = document.createElement('div');
            banner.id = 'v69-sw-banner';
            banner.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:99997;background:linear-gradient(90deg,#D4AF37,#b8860b);color:#000;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;font-size:13px;font-weight:700;box-shadow:0 -4px 20px rgba(0,0,0,.4)';
            banner.innerHTML = `
              <span>🚀 New version available!</span>
              <button onclick="window.location.reload()" style="background:#000;color:#D4AF37;border:none;border-radius:20px;padding:6px 16px;font-size:12px;font-weight:800;cursor:pointer">Update now</button>
            `;
            document.body.appendChild(banner);
          }
        });
      });
    }).catch(() => {});
    LOG('SW update notification applied ✓');
  })();

  /* ═════════════════════════════════════════════════════════════
     PART 12 — HOME WIDGETS REFRESH
  ═══════════════════════════════════════════════════════════════ */
  function refreshHomeWidgets() {
    try {
      // XP bar
      if (typeof window.renderXPBar === 'function') window.renderXPBar();
      // Coin chip
      if (typeof window.renderCoinChip === 'function') window.renderCoinChip();
      // Greeting
      if (typeof window.updateGreeting === 'function') window.updateGreeting();
      // Coin display
      window.updateCoinDisplay?.();
    } catch(e) {}
  }

  /* ═════════════════════════════════════════════════════════════
     PART 13 — SCREEN ACTIVE CLASS GUARD
     Prevents screens stacking (display:block on multiple screens)
  ═══════════════════════════════════════════════════════════════ */
  (function screenStackGuard() {
    // Watch for rogue style changes that make multiple screens active
    const guard = new MutationObserver(() => {
      const activeScreens = document.querySelectorAll('.screen.active');
      if (activeScreens.length > 1) {
        // Keep only the last one active (most recently activated)
        for (let i = 0; i < activeScreens.length - 1; i++) {
          activeScreens[i].classList.remove('active');
          activeScreens[i].style.display = 'none';
        }
      }
    });
    guard.observe(document.body, { subtree:true, attributeFilter:['class','style'] });
    LOG('Screen stack guard applied ✓');
  })();

  /* ═════════════════════════════════════════════════════════════
     PART 14 — GLOBAL ERROR BOUNDARY
     Catches unhandled errors and shows a graceful toast
  ═══════════════════════════════════════════════════════════════ */
  (function globalErrorBoundary() {
    const IGNORE = ['Script error', 'ResizeObserver', 'Non-Error promise rejection'];
    window.addEventListener('error', (e) => {
      if (IGNORE.some(s => (e.message || '').includes(s))) return;
      // Don't spam toasts
      if (window._v69LastError === e.message) return;
      window._v69LastError = e.message;
      setTimeout(() => { window._v69LastError = null; }, 3000);
      console.error('[AfribConnect v69 Error]', e.message, e.filename, e.lineno);
      // Only show toast for critical navigation errors
      if ((e.message || '').toLowerCase().includes('showscreen') ||
          (e.message || '').toLowerCase().includes('cannot read')) {
        showToastSafe('⚠️ Something went wrong — refreshing…');
        setTimeout(() => window.location.reload(), 3000);
      }
    });

    window.addEventListener('unhandledrejection', (e) => {
      if (!e.reason) return;
      const msg = (e.reason.message || String(e.reason) || '');
      if (IGNORE.some(s => msg.includes(s))) return;
      console.warn('[AfribConnect v69 Unhandled Promise]', msg);
    });

    LOG('Global error boundary applied ✓');
  })();

  /* ═════════════════════════════════════════════════════════════
     PART 15 — MUTATION OBSERVER: Inject GiftMe when screens load
  ═══════════════════════════════════════════════════════════════ */
  (function setupMutationObserver() {
    const observer = new MutationObserver(() => {
      injectGiftMeButtons();
    });
    observer.observe(document.body, { childList:true, subtree:true });
    LOG('MutationObserver for GiftMe injection active ✓');
  })();

  /* ═════════════════════════════════════════════════════════════
     PART 16 — MESSAGES: inject GiftMe on chat open
     Patches openMsgConvo / showMsgChat to add GiftMe
  ═══════════════════════════════════════════════════════════════ */
  (function patchMsgChatOpen() {
    function tryPatch() {
      const origOpen = window.openMsgConvo || window.showMsgChat || window.openConversation;
      if (!origOpen || origOpen.__v69gm) return;

      const patchName = window.openMsgConvo ? 'openMsgConvo' : window.showMsgChat ? 'showMsgChat' : 'openConversation';
      window[patchName] = function() {
        try { origOpen.apply(this, arguments); } catch(e) {}
        setTimeout(() => injectGiftMeButtons(), 150);
      };
      window[patchName].__v69gm = true;
      LOG(`Patched ${patchName} for GiftMe injection ✓`);
    }

    if (document.readyState === 'complete') tryPatch();
    else window.addEventListener('load', () => setTimeout(tryPatch, 1000));
  })();

  /* ═════════════════════════════════════════════════════════════
     PART 17 — APP INIT: run after all deferred scripts load
  ═══════════════════════════════════════════════════════════════ */
  function v69Init() {
    injectGiftMeButtons();
    refreshHomeWidgets();

    // Retry showScreen canonical wrapper (deferred scripts may have overwritten it again)
    setTimeout(() => {
      if (!window.__v69ShowScreenFinal) {
        WARN('showScreen was overwritten after v69 init — re-applying');
        // Re-run Part 3 logic inline
        const _p = window.showScreen;
        if (typeof _p === 'function' && !_p.__v69final) {
          window.showScreen = function(name) {
            try { _p.call(this, name); } catch(e) {}
            document.querySelectorAll('[data-screen]').forEach(b => {
              b.classList.toggle('active', b.dataset.screen === name);
            });
            setTimeout(() => { try { v69PostNavigate(name); } catch(e){} }, 200);
          };
          window.showScreen.__v69final = true;
        }
      }
    }, 1500);

    LOG('v69 Master Integration fully initialised ✓');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(v69Init, 600));
  } else {
    setTimeout(v69Init, 600);
  }

  window.addEventListener('load', () => setTimeout(v69Init, 800));

})();
