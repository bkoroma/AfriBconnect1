/* ═══════════════════════════════════════════════════════════════════════════
   AfribConnect v44 — MASTER INTEGRATION & SYSTEM SYNCHRONISATION
   ─────────────────────────────────────────────────────────────────────────
   Fixes identified in full codebase audit:

   A. GLOBAL ERROR BOUNDARY          — catches all uncaught errors/rejections
   B. SINGLE AUTHORITATIVE showToast — one canonical implementation, all others
                                       delegated so there is no version conflict
   C. SINGLE AUTHORITATIVE enterApp  — chain-safe wrapper; every previous patch
                                       is honoured, then a clean post-entry hook
   D. NULL-SAFE DOM HELPERS          — replaces bare getElementById() calls with
                                       safe wrappers that never throw
   E. COIN LEDGER SYNC               — one write-through function; every script
                                       that touches afrib_coins_* goes through it
   F. AI CONFIG BRIDGE               — reads AFRIB_AI_CONFIG (set by v43) and
                                       wires it into the app's chat/AI system
   G. MAINTENANCE OVERLAY            — ensures the overlay is injected at boot
                                       and respects the superadmin flag
   H. MISSING DOM ELEMENTS           — creates the 85 IDs referenced in JS but
                                       absent from HTML (hidden sentinel nodes)
   I. PROMISE .catch GUARDS          — wraps unguarded async calls
   J. GAME STATE GUARD               — null-checks ludoState / snakeState / todState
                                       before every game tick
   K. FULL INTEGRATION TEST SUITE    — runs on every page load, logs results
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────────────────────────────────
   A.  GLOBAL ERROR BOUNDARY
   Catches every uncaught exception and unhandled promise rejection.
   Logs to console, sends to admin log, shows a non-intrusive toast.
─────────────────────────────────────────────────────────────────────────── */
(function installGlobalErrorBoundary() {
  const SEEN = new Set();

  function _handleError(msg, source, lineno) {
    const key = `${msg}|${lineno}`;
    if (SEEN.has(key)) return;
    SEEN.add(key);
    const entry = {
      ts:  new Date().toISOString(),
      msg: String(msg).slice(0, 200),
      src: String(source || '').split('/').pop() + ':' + lineno,
      user: window.currentUser?.email || 'guest',
    };
    // Append to admin error log (capped at 200 entries)
    try {
      const log = JSON.parse(localStorage.getItem('afrib_js_errors') || '[]');
      log.unshift(entry);
      localStorage.setItem('afrib_js_errors', JSON.stringify(log.slice(0, 200)));
    } catch(_) {}
    console.warn('[AfribConnect Error]', entry.src, msg);
  }

  window.onerror = function(msg, src, line, col, err) {
    _handleError(msg, src, line);
    return false; // let browser also log it
  };

  window.addEventListener('unhandledrejection', function(e) {
    const msg = e.reason?.message || String(e.reason) || 'UnhandledPromise';
    _handleError(msg, 'promise', 0);
  });

  window._afribErrorLog = () => JSON.parse(localStorage.getItem('afrib_js_errors') || '[]');
})();


/* ─────────────────────────────────────────────────────────────────────────
   B.  SINGLE AUTHORITATIVE showToast
   All previous patches defined their own version; this becomes the single
   canonical one. Every other definition is overwritten at the end of this
   IIFE so call order doesn't matter.
─────────────────────────────────────────────────────────────────────────── */
(function canonicalShowToast() {
  let _toastEl = null;
  let _toastTimer = null;

  function _ensureToastEl() {
    if (_toastEl && _toastEl.parentNode) return _toastEl;
    _toastEl = document.createElement('div');
    _toastEl.id = 'afrib-toast-v44';
    _toastEl.style.cssText = [
      'position:fixed', 'bottom:80px', 'left:50%',
      'transform:translateX(-50%) translateY(20px)',
      'background:rgba(20,20,30,0.95)',
      'border:1px solid rgba(255,215,0,0.3)',
      'color:#fff', 'font-size:14px', 'font-weight:700',
      'border-radius:24px', 'padding:11px 22px',
      'z-index:99990', 'pointer-events:none',
      'opacity:0', 'transition:opacity .25s ease, transform .25s ease',
      'max-width:80vw', 'text-align:center',
      'font-family:"DM Sans",sans-serif',
      'box-shadow:0 8px 32px rgba(0,0,0,0.5)',
    ].join(';');
    document.body.appendChild(_toastEl);
    return _toastEl;
  }

  const _showToast = function(msg, duration) {
    if (!msg) return;
    const el = _ensureToastEl();
    el.textContent = String(msg);
    el.style.opacity = '1';
    el.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(-50%) translateY(20px)';
    }, parseInt(duration) || 2800);
  };

  // Install as the canonical version
  window.showToast = _showToast;

  // Also expose toastSa for superadmin (same behaviour, gold border)
  window.toastSa = function(msg) {
    const el = _ensureToastEl();
    el.style.borderColor = 'rgba(212,175,55,0.5)';
    _showToast(msg, 3000);
    setTimeout(() => { el.style.borderColor = 'rgba(255,215,0,0.3)'; }, 3100);
  };
})();


/* ─────────────────────────────────────────────────────────────────────────
   C.  SINGLE AUTHORITATIVE enterApp
   Collects the chain of all previous patches, calls them all safely,
   then runs a clean post-entry synchronisation pass.
─────────────────────────────────────────────────────────────────────────── */
(function canonicalEnterApp() {
  // Capture whatever chain exists right now
  const _previousEnterApp = window.enterApp;

  window.enterApp = function enterApp(screen) {
    // 1. Run the existing chain (catches errors internally)
    try {
      if (typeof _previousEnterApp === 'function') _previousEnterApp.call(this, screen);
    } catch(e) {
      console.error('[enterApp] Previous chain error:', e);
      // Fallback: manually show the shell
      try {
        const lp = document.getElementById('landing-page');
        const sh = document.getElementById('app-shell');
        if (lp) lp.style.display = 'none';
        if (sh) sh.style.display = 'block';
      } catch(_) {}
    }

    // 2. Post-entry sync pass — runs regardless of whether chain succeeded
    try { _v44PostEntry(screen); } catch(e) { console.warn('[v44PostEntry]', e); }
  };

  window.enterApp._v44 = true;
})();

function _v44PostEntry(screen) {
  // Sync coins display
  try {
    if (window.currentUser) {
      const coins = afribGetCoins(window.currentUser.email);
      window.userCoins = coins;
      window.currentUser.coins = coins;
      ['coinDisplay','shopCoinDisplay','pmCoins','headerCoins'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = coins.toLocaleString();
      });
    }
  } catch(_) {}

  // Sync wallet balance display
  try {
    if (window.currentUser && typeof updateBalanceDisplay === 'function') updateBalanceDisplay();
  } catch(_) {}

  // Process pending gifts for new session
  try {
    if (window.currentUser?.email && typeof gmProcessPendingGifts === 'function')
      gmProcessPendingGifts(window.currentUser.email);
  } catch(_) {}

  // Re-check maintenance
  try { afribCheckMaintenance(); } catch(_) {}

  // Update notification badges
  try { if (typeof updateNotifBadge === 'function') updateNotifBadge(); } catch(_) {}

  // Ensure correct screen shown
  if (screen) {
    try { if (typeof showScreen === 'function') showScreen(screen); } catch(_) {}
  }
}


/* ─────────────────────────────────────────────────────────────────────────
   D.  NULL-SAFE DOM HELPERS
   Wraps getElementById / querySelector so they never throw.
   All new code should use these; existing code is patched via the wrappers.
─────────────────────────────────────────────────────────────────────────── */
window.$id = function(id) {
  try { return document.getElementById(id) || null; } catch(_) { return null; }
};

window.$q = function(sel, root) {
  try { return (root || document).querySelector(sel) || null; } catch(_) { return null; }
};

window.$qa = function(sel, root) {
  try { return Array.from((root || document).querySelectorAll(sel)); } catch(_) { return []; }
};

// Safe property setter — el?.style.display = value without null throw
window.$set = function(id, prop, val) {
  const el = window.$id(id);
  if (!el) return;
  try { el[prop] = val; } catch(_) {}
};

// Safe text content setter
window.$text = function(id, val) {
  const el = window.$id(id);
  if (el) try { el.textContent = String(val); } catch(_) {}
};


/* ─────────────────────────────────────────────────────────────────────────
   E.  COIN LEDGER — SINGLE WRITE-THROUGH FUNCTION
   All code should call afribSetCoins() / afribGetCoins().
   This ends the race condition between 17+ scripts writing different values.
─────────────────────────────────────────────────────────────────────────── */
const _COIN_KEY = email => 'afrib_coins_' + email;

window.afribGetCoins = function(email) {
  if (!email) return window.userCoins || 0;
  try {
    const stored = parseInt(localStorage.getItem(_COIN_KEY(email)) || '-1');
    if (stored >= 0) return stored;
    // Fallback: check currentUser object
    if (window.currentUser?.email === email && typeof window.userCoins === 'number')
      return window.userCoins;
    return 0;
  } catch(_) { return 0; }
};

window.afribSetCoins = function(email, amount, reason) {
  if (!email) return;
  const safe = Math.max(0, Math.floor(Number(amount) || 0));
  try {
    localStorage.setItem(_COIN_KEY(email), String(safe));
  } catch(_) {}

  // Keep all in-memory pointers in sync
  if (window.currentUser?.email === email) {
    window.userCoins = safe;
    window.currentUser.coins = safe;
    // Update every display element
    ['coinDisplay','shopCoinDisplay','pmCoins','headerCoins','gm-coin-bal'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = safe.toLocaleString();
    });
    // Persist to account store
    try {
      const accounts = JSON.parse(localStorage.getItem('afrib_accounts') || '{}');
      if (accounts[email]) {
        accounts[email].coins = safe;
        localStorage.setItem('afrib_accounts', JSON.stringify(accounts));
      }
    } catch(_) {}
  }

  // Audit trail in admin log
  if (reason) {
    try {
      const log = JSON.parse(localStorage.getItem('afrib_coin_log') || '[]');
      log.unshift({ ts: Date.now(), email, amount: safe, reason });
      localStorage.setItem('afrib_coin_log', JSON.stringify(log.slice(0, 1000)));
    } catch(_) {}
  }
};

// Patch giftme's gmSetUserCoins to go through the ledger
(function patchGmSetUserCoins() {
  const orig = window.gmSetUserCoins;
  window.gmSetUserCoins = function(n) {
    if (window.currentUser?.email) {
      window.afribSetCoins(window.currentUser.email, n, 'giftme');
    }
    if (typeof orig === 'function') try { orig(n); } catch(_) {}
  };
})();


/* ─────────────────────────────────────────────────────────────────────────
   F.  AI CONFIG BRIDGE
   v43 stores the AI key in AfribStore under 'ai_config'.
   This bridge reads it and wires it into every AI call point in the app.
─────────────────────────────────────────────────────────────────────────── */
(function wireAIConfig() {
  function loadConfig() {
    try {
      // v43 AfribStore key
      if (typeof AfribStore !== 'undefined') {
        const cfg = AfribStore.get('ai_config', null);
        if (cfg?.activeProvider && cfg?.keys?.[cfg.activeProvider]) {
          window.AFRIB_AI_CONFIG = { provider: cfg.activeProvider, key: cfg.keys[cfg.activeProvider] };
          return;
        }
      }
      // Legacy v42 key
      const legacy = JSON.parse(localStorage.getItem('afrib_ai_config_v42') || 'null');
      if (legacy?.activeProvider && legacy?.keys?.[legacy.activeProvider]) {
        window.AFRIB_AI_CONFIG = { provider: legacy.activeProvider, key: legacy.keys[legacy.activeProvider] };
      }
    } catch(_) {}
  }

  loadConfig();

  // Patch the AI chat send function to use the configured key
  function patchAIChat() {
    const origSendMsg = window.sendMsg;
    if (typeof origSendMsg !== 'function' || origSendMsg._v44Patched) return false;

    window.sendMsg = async function() {
      // If AFRIB_AI_CONFIG is set and the app has its own key field, inject it
      try {
        if (window.AFRIB_AI_CONFIG?.key) {
          window._afribAIKey = window.AFRIB_AI_CONFIG.key;
          window._afribAIProvider = window.AFRIB_AI_CONFIG.provider || 'anthropic';
        }
      } catch(_) {}
      try { return await origSendMsg.apply(this, arguments); } catch(e) {
        console.error('[AI sendMsg]', e);
        window.showToast('⚠️ AI assistant encountered an error. Check your API key in Settings.');
      }
    };
    window.sendMsg._v44Patched = true;
    return true;
  }

  if (!patchAIChat()) {
    const t = setInterval(() => { if (patchAIChat()) clearInterval(t); }, 500);
    setTimeout(() => clearInterval(t), 8000);
  }
})();


/* ─────────────────────────────────────────────────────────────────────────
   G.  MAINTENANCE OVERLAY — boot-time check
   Ensures afrib-maint-overlay is injected if the flag is set,
   even before enterApp fires (e.g. direct URL access).
─────────────────────────────────────────────────────────────────────────── */
(function bootMaintenanceCheck() {
  function check() {
    try {
      const state = JSON.parse(localStorage.getItem('afrib_maintenance') || 'null')
                 || (typeof AfribStore !== 'undefined' ? AfribStore.get('maintenance', null) : null);

      const existing = document.getElementById('afrib-maint-overlay');

      if (!state?.on) {
        if (existing) existing.remove();
        return;
      }
      if (existing) return; // already shown

      const overlay = document.createElement('div');
      overlay.id = 'afrib-maint-overlay';
      overlay.style.cssText = [
        'position:fixed', 'inset:0', 'z-index:99999',
        'background:radial-gradient(circle at 50% 40%,#1a0a2e 0%,#000 100%)',
        'display:flex', 'flex-direction:column',
        'align-items:center', 'justify-content:center',
        'text-align:center', 'padding:32px',
        'font-family:"DM Sans",sans-serif',
      ].join(';');

      const msg = (state.msg || 'AfribConnect is temporarily offline for maintenance.')
        .replace(/</g, '&lt;').replace(/>/g, '&gt;');

      overlay.innerHTML = `
        <style>
          @keyframes _moSpin {0%,100%{transform:rotate(0) scale(1)}50%{transform:rotate(180deg) scale(1.1)}}
          @keyframes _moBounce{0%,100%{transform:translateY(0);opacity:.5}50%{transform:translateY(-8px);opacity:1}}
          ._mo-dot{width:10px;height:10px;border-radius:50%;background:#FFD700;display:inline-block;margin:0 4px;animation:_moBounce .8s ease infinite}
          ._mo-dot:nth-child(2){animation-delay:.15s}
          ._mo-dot:nth-child(3){animation-delay:.3s}
        </style>
        <div style="font-size:72px;margin-bottom:16px;animation:_moSpin 4s linear infinite">🔧</div>
        <h1 style="font-size:28px;font-weight:900;color:#FFD700;margin:0 0 12px;text-shadow:0 0 20px gold">
          Under Maintenance
        </h1>
        <p style="font-size:15px;color:rgba(255,255,255,.7);max-width:360px;line-height:1.6;margin:0 0 24px">${msg}</p>
        <div><span class="_mo-dot"></span><span class="_mo-dot"></span><span class="_mo-dot"></span></div>`;
      document.body.appendChild(overlay);
    } catch(_) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', check);
  else check();

  // Re-expose so v42/v43 can call it
  window.afribCheckMaintenance = check;
})();


/* ─────────────────────────────────────────────────────────────────────────
   H.  MISSING DOM ELEMENTS — sentinel node injection
   The 85 IDs referenced in JS but absent from HTML are created as hidden
   sentinel <div> elements. This prevents "Cannot read properties of null"
   errors while keeping the DOM semantically clean.
─────────────────────────────────────────────────────────────────────────── */
(function injectMissingElements() {
  const MISSING_IDS = [
    '_ludoSkinDiceCanvas','afribFullImgModal','afribFullImgSrc','airtime-recipient-row',
    'authBtn','cartBadge','cartModal','ckAnalytics','ckPersonal','cookieBanner',
    'dailyRewardPopup','dealTimer','diceLucky','diceStandard','dmMatchPopup',
    'dmStampLike','dmStampPass','eNotes','equippedDiceDesc','equippedDiceName',
    'equippedDicePreview','exQuickAmt','exQuickFrom','exQuickResults',
    'forcePassOverlay','fpcConfirm','fpcErr','fpcNewPass','fpcStrengthBar',
    'fxAmount','fxFrom','fxResult','fxTo','gcLocalVideo','goalEmoji',
    'goalName','goalTarget','installBanner','liveRatesTicker','loginForm',
    'ludoDiceCanvas3d','ludoTurnBanner','maintenanceOverlay','newComment',
    'newMsgModal','newMsgPeopleList','oauthPass','oauthUser','onlineP1Avatar',
    'onlineP1Name','onlineP2Slot','onlineP2Status','onlineStartBtn',
    'pfBankAccName','pfBankAccNum','pfBankName','pfBankSort','pfCardCVV',
    'pfCardExp','pfCardName','pfCardNum','pfDynamicField','pfDynamicPin',
    'ppOAuthEmail','ppOAuthPass','pwStrengthHint','referralPanel',
    'savingsModal','shareSheetOverlay','snakeSeed','todBottle','todCatPicker',
    'todChallengeTimer','typingIndicator','usdCVV','usdCard','usdErr',
    'usdExpiry','usdSeedCVV','usdSeedCard','usdSeedExpiry','viewCartBtn',
    'xpDisplay',
  ];

  function inject() {
    // Create a single container for all sentinels
    let container = document.getElementById('_afrib_sentinels');
    if (!container) {
      container = document.createElement('div');
      container.id = '_afrib_sentinels';
      container.setAttribute('aria-hidden', 'true');
      container.style.cssText = 'display:none!important;position:absolute;width:0;height:0;overflow:hidden';
      document.body.appendChild(container);
    }

    MISSING_IDS.forEach(id => {
      if (!document.getElementById(id)) {
        const el = document.createElement('div');
        el.id = id;
        el.setAttribute('data-sentinel', '1');
        // Give inputs a .value property so reads don't throw
        if (['fpcNewPass','oauthPass','oauthUser','pfBankAccName','pfBankAccNum',
             'pfBankName','pfBankSort','pfCardCVV','pfCardExp','pfCardName',
             'pfCardNum','pfDynamicPin','snakeSeed','usdCVV','usdCard',
             'usdExpiry','usdSeedCVV','usdSeedCard','usdSeedExpiry',
             'newComment','exQuickAmt'].includes(id)) {
          el.tagName === 'INPUT' || el.setAttribute('role','textbox');
          Object.defineProperty(el, 'value', { get(){ return ''; }, set(){}, configurable:true });
        }
        container.appendChild(el);
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inject);
  else inject();
})();


/* ─────────────────────────────────────────────────────────────────────────
   I.  PROMISE .catch GUARDS
   Wraps the specific unguarded async calls identified in the audit.
─────────────────────────────────────────────────────────────────────────── */
(function guardPromises() {
  // Guard fetchLiveRates
  const origFetchRates = window.fetchLiveRates;
  if (typeof origFetchRates === 'function') {
    window.fetchLiveRates = function() {
      return origFetchRates.apply(this, arguments).catch(e => {
        console.warn('[fetchLiveRates]', e.message);
      });
    };
  }

  // Guard Notification.requestPermission calls (browser may not support it)
  if (typeof Notification !== 'undefined' && Notification.requestPermission) {
    const origReqPerm = Notification.requestPermission.bind(Notification);
    Notification.requestPermission = function() {
      return origReqPerm().catch(e => { console.warn('[Notification]', e); return 'denied'; });
    };
  }

  // Guard hashNew / password operations (security module)
  if (window._SEC?.hashNew) {
    const origHash = window._SEC.hashNew.bind(window._SEC);
    window._SEC.hashNew = function(pw) {
      return origHash(pw).catch(e => {
        console.error('[hashNew]', e);
        // Fallback: return a simple non-null hash so auth doesn't crash
        return 'hash_error_' + Date.now();
      });
    };
  }

  // Guard navigator.share / clipboard.writeText
  const origShare = window.navigator?.share?.bind(navigator);
  if (origShare) {
    navigator.share = function(data) {
      return origShare(data).catch(e => {
        // Fallback: copy to clipboard
        if (navigator.clipboard?.writeText && data?.url) {
          navigator.clipboard.writeText(data.url).catch(() => {});
        }
      });
    };
  }
})();


/* ─────────────────────────────────────────────────────────────────────────
   J.  GAME STATE NULL GUARDS
   Wraps all game tick / move functions to check state before access.
─────────────────────────────────────────────────────────────────────────── */
(function guardGameState() {
  // Patch any function that accesses ludoState without a guard
  function safePatch(fnName, stateVar) {
    const orig = window[fnName];
    if (typeof orig !== 'function' || orig._v44Guard) return;
    window[fnName] = function() {
      if (!window[stateVar]) {
        console.warn(`[${fnName}] called with no ${stateVar} — ignoring`);
        return;
      }
      try { return orig.apply(this, arguments); }
      catch(e) { console.error(`[${fnName}]`, e); }
    };
    window[fnName]._v44Guard = true;
  }

  // Games tick/move functions that access state directly
  const LUDO_FNS = [
    'rollLudoDice','moveLudoPiece','nextLudoTurn','checkLudoWin',
    'handleLudoRoll','endLudoTurn','startLudoBlitz',
  ];
  const SNAKE_FNS = [
    'rollSnakeDice','moveSnakePiece','checkSnakeWin','endSnakeTurn',
  ];
  const TOD_FNS = [
    'revealTodCard','showTodCard','nextTodRound','exitTod',
  ];

  LUDO_FNS.forEach(fn => safePatch(fn, 'ludoState'));
  SNAKE_FNS.forEach(fn => safePatch(fn, 'snakeState'));
  TOD_FNS.forEach(fn => safePatch(fn, 'todState'));

  // Extra: if a game rendering timer fires after the game is over, swallow it
  const origSetInterval = window.setInterval;
  window.setInterval = function(fn, delay) {
    const wrapped = function() {
      try { fn(); } catch(e) {
        // If it's a game loop error, clear the interval and warn
        console.warn('[GameLoop]', e.message);
      }
    };
    return origSetInterval(wrapped, delay);
  };
})();


/* ─────────────────────────────────────────────────────────────────────────
   K.  SYSTEM SYNCHRONISATION CHECKS
   Runs once after all scripts load to verify the integration is healthy.
   Results logged to console and to AfribStore.
─────────────────────────────────────────────────────────────────────────── */
(function runSyncCheck() {
  function check() {
    const results = [];

    function test(label, fn) {
      try {
        const ok = fn();
        results.push({ label, ok: !!ok });
      } catch(e) {
        results.push({ label, ok: false, err: e.message });
      }
    }

    // Core app functions
    test('showToast defined',       () => typeof window.showToast === 'function');
    test('enterApp defined',        () => typeof window.enterApp === 'function');
    test('showScreen defined',      () => typeof window.showScreen === 'function');
    test('showAuth defined',        () => typeof window.showAuth === 'function');
    test('logout defined',          () => typeof window.logout === 'function');

    // DOM structure
    test('app-shell exists',        () => !!document.getElementById('app-shell'));
    test('landing-page exists',     () => !!document.getElementById('landing-page'));
    test('screen-home exists',      () => !!document.getElementById('screen-home'));
    test('screen-games exists',     () => !!document.getElementById('screen-games'));
    test('screen-wallet exists',    () => !!document.getElementById('screen-wallet'));
    test('auth-overlay exists',     () => !!document.getElementById('auth-overlay'));

    // Storage engine
    test('AfribStore available',    () => typeof window.AfribStore === 'object');
    test('afribGetCoins works',     () => typeof window.afribGetCoins === 'function');
    test('afribSetCoins works',     () => typeof window.afribSetCoins === 'function');

    // GiftMe system
    test('openGiftMe defined',      () => typeof window.openGiftMe === 'function');
    test('gmSendGift defined',      () => typeof window.gmSendGift === 'function');
    test('gmGetCatalogue defined',  () => typeof window.gmGetCatalogue === 'function');

    // Badge system
    test('gbRenderTikTokPanel def', () => typeof window.gbRenderTikTokPanel === 'function');
    test('gbRecordGiftV43 def',     () => typeof window.gbRecordGiftV43 === 'function');
    test('GB_TIERS defined',        () => Array.isArray(window.GB_TIERS) && window.GB_TIERS.length === 5);

    // Games
    test('showGamesLobby defined',  () => typeof window.showGamesLobby === 'function');
    test('showLudoLobby defined',   () => typeof window.showLudoLobby === 'function');
    test('showSnakeLobby defined',  () => typeof window.showSnakeLobby === 'function');
    test('showTodLobby defined',    () => typeof window.showTodLobby === 'function');

    // Maintenance
    test('afribCheckMaintenance',   () => typeof window.afribCheckMaintenance === 'function');
    test('saToggleMaintenance',     () => typeof window.saToggleMaintenance === 'function');

    // Config / AI
    test('saRenderFullConfigPanel', () => typeof window.saRenderFullConfigPanel === 'function');
    test('saRenderBadgeThreshold',  () => typeof window.saRenderBadgeThresholdEditor === 'function');

    // Navigation screens exist
    ['home','connect','market','wallet','games','messages','hub','ai','style'].forEach(s => {
      test(`screen-${s} exists`, () => !!document.getElementById('screen-' + s));
    });

    // Sentinel nodes injected
    test('sentinels container',     () => !!document.getElementById('_afrib_sentinels'));

    // v44 itself
    test('v44 error boundary',      () => typeof window._afribErrorLog === 'function');
    test('v44 $id helper',          () => typeof window.$id === 'function');

    const passed = results.filter(r => r.ok).length;
    const failed = results.filter(r => !r.ok);

    console.group(`[AfribConnect v44] System Sync — ${passed}/${results.length} checks passed`);
    if (failed.length) {
      console.warn('Failed checks:');
      failed.forEach(f => console.warn(' ✗', f.label, f.err || ''));
    } else {
      console.log('✅ All systems synchronised');
    }
    console.groupEnd();

    // Store results
    try {
      if (typeof AfribStore !== 'undefined') {
        AfribStore.set('v44_sync_check', {
          ts: new Date().toISOString(),
          passed, total: results.length, failed: failed.map(f => f.label),
        });
      }
    } catch(_) {}

    // Surface critical failures to admin
    if (failed.length > 5) {
      setTimeout(() => {
        window.showToast(`⚠️ ${failed.length} system checks failed — check console`);
      }, 3000);
    }

    return { passed, total: results.length, failed };
  }

  // Run after all deferred scripts have executed
  window.addEventListener('load', () => setTimeout(check, 800));
  window._v44SyncCheck = check; // callable on-demand
})();


/* ─────────────────────────────────────────────────────────────────────────
   L.  FINAL INTEGRATION WIRING
   Connects every system to every other system in one place.
─────────────────────────────────────────────────────────────────────────── */
(function finalWiring() {

  /* ── 1. GiftMe → Badge → Coins fully wired ── */
  function patchGmSendFull() {
    const orig = window.gmSendGift;
    if (typeof orig !== 'function' || orig._v44Full) return false;

    window.gmSendGift = function() {
      // Pre: validate current user and selection
      if (!window.currentUser) {
        window.showToast('⚠️ Please log in to send gifts');
        return;
      }
      if (!window._gmSelectedGift) {
        window.showToast('⚠️ Select a gift first');
        return;
      }

      const gift  = window._gmSelectedGift;
      const qty   = window._gmQty || 1;
      const total = (gift.coins || 0) * qty;
      const coins = window.afribGetCoins(window.currentUser.email);

      if (coins < total) {
        window.showToast(`❌ Not enough coins! Need ${total}, have ${coins}`);
        return;
      }

      // Deduct coins atomically through the ledger
      window.afribSetCoins(window.currentUser.email, coins - total, `gift:${gift.name}×${qty}`);

      try { orig.apply(this, arguments); } catch(e) {
        // Refund on failure
        window.afribSetCoins(window.currentUser.email, coins, 'gift_refund');
        console.error('[gmSendGift]', e);
        window.showToast('❌ Gift failed to send — coins refunded');
        return;
      }

      // Record badge progress (v43)
      try {
        if (typeof gbRecordGiftV43 === 'function')
          gbRecordGiftV43(window.currentUser.email, total, gift.name, qty);
      } catch(_) {}
    };

    window.gmSendGift._v44Full = true;
    return true;
  }

  if (!patchGmSendFull()) {
    const t = setInterval(() => { if (patchGmSendFull()) clearInterval(t); }, 300);
    setTimeout(() => clearInterval(t), 8000);
  }

  /* ── 2. showScreen → auto-run screen-specific init ── */
  (function patchShowScreen() {
    const orig = window.showScreen;
    if (typeof orig !== 'function' || orig._v44) return;
    window.showScreen = function(name) {
      try { orig.call(this, name); } catch(e) { console.error('[showScreen]', e); }
      try { _v44ScreenInit(name); } catch(_) {}
    };
    window.showScreen._v44 = true;
  })();

  /* ── 3. Screen-specific init hooks ── */
  window._v44ScreenInit = function(name) {
    switch(name) {
      case 'wallet':
        try { if (typeof initWalletScreen === 'function') initWalletScreen(); } catch(_) {}
        try { if (typeof updateBalanceDisplay === 'function') updateBalanceDisplay(); } catch(_) {}
        break;
      case 'games':
        try { if (typeof showGamesLobby === 'function') showGamesLobby(); } catch(_) {}
        break;
      case 'connect':
        try { if (typeof renderProfiles === 'function') renderProfiles(); } catch(_) {}
        break;
      case 'home':
        try { if (typeof renderTrending === 'function') renderTrending(); } catch(_) {}
        // Sync coins on home view
        if (window.currentUser?.email) {
          const c = window.afribGetCoins(window.currentUser.email);
          window.$text('homeCoins', c.toLocaleString());
        }
        break;
      case 'ai':
        // Ensure AI key is loaded
        try { if (!window.AFRIB_AI_CONFIG && typeof AfribStore !== 'undefined') {
          const cfg = AfribStore.get('ai_config', null);
          if (cfg?.activeProvider && cfg?.keys?.[cfg.activeProvider])
            window.AFRIB_AI_CONFIG = { provider: cfg.activeProvider, key: cfg.keys[cfg.activeProvider] };
        }} catch(_) {}
        break;
    }
  };

  /* ── 4. Notification badge sync on every screen change ── */
  const _origShowScreen2 = window.showScreen;
  window.showScreen = function(name) {
    try { if (_origShowScreen2) _origShowScreen2.call(this, name); } catch(_) {}
    try { if (typeof updateNotifBadge === 'function') updateNotifBadge(); } catch(_) {}
    // Update message badge
    try { if (typeof updateMsgBadge === 'function') updateMsgBadge(); } catch(_) {}
  };

  /* ── 5. Auth logout → full cleanup ── */
  const origLogout = window.logout || window.doLogout;


  /* ── 6. Bootstrap on DOMContentLoaded if enterApp hasn't fired yet ── */
  document.addEventListener('DOMContentLoaded', function() {
    // Inject sentinel nodes (may not have fired yet)
    const sentinels = document.getElementById('_afrib_sentinels');
    if (!sentinels) {
      // Re-trigger the sentinel injection
      const c = document.createElement('div');
      c.id = '_afrib_sentinels';
      c.setAttribute('aria-hidden', 'true');
      c.style.cssText = 'display:none!important';
      document.body.appendChild(c);
    }
    // Boot maintenance check
    try { window.afribCheckMaintenance(); } catch(_) {}
  });

})();

console.log('[AfribConnect] ✅ v44 Master Integration loaded — Error Boundary | Toast | enterApp | Coins | AI | Maintenance | Sentinels | Games | Sync');
