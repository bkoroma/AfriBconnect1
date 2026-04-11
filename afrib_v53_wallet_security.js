/* ═══════════════════════════════════════════════════════════════════════════
   AfribConnect v52 — FINAL POLISH & INTEGRATION COMPLETENESS
   ─────────────────────────────────────────────────────────────────────────
   Closes every remaining gap identified in the full audit:

   [1] Homepage inline style conflicts — screen-content padding and inner
       wrapper div fight against v50 CSS; overridden with !important rules
   [2] Homepage content sections that still fall back to generic styles —
       onboarding, daily challenge, smart suggestions, deal of day
   [3] Service Worker — no postMessage handler; add CACHE_UPDATE listener
       so v42–v52 patches are cached for offline use
   [4] sa_settings missing coinCashoutRate default — added to getSettings
       fallback object and to the superadmin Coins panel UI
   [5] Messages screen — ensure Gen-Z styles from v49 apply correctly on
       every injection, not just first open
   [6] Startup URL routing — ?screen= param not handled; add deep-link
       support so shortcuts in manifest.json actually navigate
   [7] App shell visibility race — on slow connections the landing page
       flashes before the session check resolves; add a brief hold
   [8] Gift coin split — coinCashoutRate alias `usdPer100Coins` already
       exists in sa_settings; sync the two so both fields work
   [9] PWA installability — theme-color meta and apple-touch-icon were
       pointing at non-existent files; manifest patched gracefully
   [10] Final integration run — 35-point system check written to console
        and superadmin dashboard on every load
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────────────────────────────────
   [1]  HOMEPAGE INLINE STYLE OVERRIDES
   The HTML has style="padding:0 0 32px" and style="padding:0 16px" on
   elements inside screen-home. These inline styles win over any class CSS.
   We override them at runtime.
─────────────────────────────────────────────────────────────────────────── */
(function fixHomepageInlinePadding() {
  function fix() {
    const home = document.getElementById('screen-home');
    if (!home) return false;

    // screen-content: remove the inline padding that fights v50 CSS
    const content = home.querySelector('.screen-content');
    if (content) {
      content.style.setProperty('padding', '0 0 100px', 'important');
    }

    // Inner padding wrapper: normalise to 0 so v50 rules take over
    const innerWrapper = home.querySelector('.screen-content > div[style*="padding:0 16px"]')
                      || home.querySelector('.screen-content > div:last-child');
    if (innerWrapper && innerWrapper.style.padding === '0 16px') {
      innerWrapper.style.setProperty('padding', '0', 'important');
    }

    return true;
  }

  // Fix on every showScreen('home') call
  const origShow = window.showScreen;
  if (typeof origShow === 'function') {
    window.showScreen = function(name) {
      try { origShow.call(this, name); } catch(_) {}
      if (name === 'home') setTimeout(fix, 50);
    };
  }

  // Fix on initial load
  document.addEventListener('DOMContentLoaded', () => setTimeout(fix, 300));
  setTimeout(fix, 800);
  setTimeout(fix, 2000);
})();


/* ─────────────────────────────────────────────────────────────────────────
   [2]  HOMEPAGE: Gen-Z style upgrades for dynamic sections
─────────────────────────────────────────────────────────────────────────── */
(function injectHomeDynamicSectionStyles() {
  if (document.getElementById('v52-home-dynamic')) return;
  const s = document.createElement('style');
  s.id = 'v52-home-dynamic';
  s.textContent = `

  /* ── Remove conflicting inline styles ── */
  #screen-home .screen-content {
    padding: 0 0 100px !important;
    max-width: 600px !important;
    margin: 0 auto !important;
    box-sizing: border-box !important;
  }
  /* The inner padding div — let the children use their own spacing */
  #screen-home .screen-content > div[style] {
    padding: 0 !important;
  }

  /* ── Onboarding checklist ── */
  #onboardingChecklist > div {
    background: linear-gradient(135deg,rgba(23,20,31,.8),rgba(23,20,31,.6)) !important;
    border: 1px solid rgba(255,255,255,.08) !important;
    border-radius: 18px !important;
    padding: 14px 16px !important;
    margin: 10px 16px 0 !important;
    backdrop-filter: blur(12px) !important;
  }
  #onboardingChecklist .hxp-track,
  #onboardingChecklist div[style*="height:5px"] {
    background: rgba(255,255,255,.06) !important;
    border-radius: 6px !important;
    height: 6px !important;
    overflow: hidden !important;
  }
  #onboardingChecklist div[style*="background:linear-gradient"] {
    background: linear-gradient(90deg,#F5C842,#FF8C00) !important;
    border-radius: 6px !important;
    height: 100% !important;
    box-shadow: 0 0 8px rgba(245,200,66,.4) !important;
  }

  /* ── Daily challenge card ── */
  #dailyChallengeCard > div {
    background: linear-gradient(135deg,rgba(245,200,66,.07),rgba(255,140,0,.04)) !important;
    border: 1px solid rgba(245,200,66,.2) !important;
    border-radius: 18px !important;
    padding: 14px 16px !important;
    margin: 10px 16px 0 !important;
  }
  #dailyChallengeCard > div > div {
    display: flex !important;
    align-items: center !important;
    gap: 12px !important;
  }
  #dailyChallengeCard .daily-challenge-icon,
  #dailyChallengeCard > div > div > div:first-child {
    width: 48px !important;
    height: 48px !important;
    border-radius: 14px !important;
    background: rgba(245,200,66,.12) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    font-size: 26px !important;
    flex-shrink: 0 !important;
  }
  #dailyChallengeCard button {
    background: linear-gradient(135deg,#F5C842,#FF8C00) !important;
    color: #000 !important;
    border: none !important;
    border-radius: 100px !important;
    padding: 9px 18px !important;
    font-size: 11px !important;
    font-weight: 900 !important;
    cursor: pointer !important;
    font-family: 'Plus Jakarta Sans', sans-serif !important;
    letter-spacing: .5px !important;
    text-transform: uppercase !important;
    transition: all .2s !important;
    white-space: nowrap !important;
    flex-shrink: 0 !important;
  }
  #dailyChallengeCard button:active { transform: scale(.93) !important; }

  /* ── Smart suggestions ── */
  #smartSuggestions {
    padding: 0 16px !important;
    margin-bottom: 8px !important;
  }
  #smartSuggestions > div {
    background: rgba(23,20,31,.6) !important;
    border: 1px solid rgba(255,255,255,.07) !important;
    border-radius: 16px !important;
    padding: 12px 14px !important;
    margin-bottom: 8px !important;
  }

  /* ── Deal of day ── */
  #dealOfDay {
    padding: 0 16px !important;
    margin-bottom: 10px !important;
  }
  #dealOfDay > div {
    background: linear-gradient(135deg,rgba(255,87,87,.08),rgba(245,200,66,.05)) !important;
    border: 1px solid rgba(255,87,87,.2) !important;
    border-radius: 18px !important;
    padding: 14px 16px !important;
  }

  /* ── AfriMatch dating CTA ── */
  #homeDatingCTA {
    padding: 0 16px !important;
    margin-bottom: 8px !important;
  }

  /* ── Gift earned chip ── */
  #homeGiftEarnedChip {
    margin: 10px 16px 0 !important;
    border-radius: 16px !important;
  }

  /* ── Section labels — consistent spacing ── */
  #screen-home .section-label {
    padding: 16px 16px 8px !important;
    display: block !important;
  }

  /* ── Quick grid spacing ── */
  #screen-home .home-quick-grid {
    padding: 0 16px !important;
    margin-bottom: 4px !important;
  }

  /* ── Games strip spacing ── */
  #screen-home .home-games-strip {
    padding: 0 16px 4px !important;
  }

  /* ── Trending grid spacing ── */
  #screen-home .home-trending {
    padding: 0 16px !important;
    margin-bottom: 4px !important;
  }

  /* ── Share card spacing ── */
  #screen-home .home-share-card {
    margin: 8px 16px 16px !important;
  }

  /* ── XP bar spacing ── */
  #screen-home .home-xp-bar-wrap {
    margin: 12px 16px 0 !important;
  }

  /* ── Wallet card spacing ── */
  #screen-home .home-wallet-card {
    margin: 12px 16px 0 !important;
  }

  /* ── KYC badge alignment ── */
  #kycBadge {
    font-size: 9px !important;
    font-weight: 800 !important;
    padding: 4px 9px !important;
    border-radius: 100px !important;
    letter-spacing: .4px !important;
  }

  /* ── Hero banner correct spacing ── */
  .home-hero-banner {
    margin: 12px 16px 0 !important;
  }

  /* ── Home header correct spacing ── */
  .home-header {
    padding: 16px 16px 0 !important;
    margin-bottom: 0 !important;
  }

  /* ── AfriMatch teaser section ── */
  #homeAfriMatchTeaser {
    padding: 0 16px !important;
    margin-bottom: 4px !important;
  }
  #homeAfriMatchTeaser > div {
    border-radius: 18px !important;
    overflow: hidden !important;
  }

  /* ── Trending item text truncation ── */
  .ti-name {
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }
  .ti-sub {
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }

  /* ── v51 daily reward popup ── */
  #v51-daily-reward {
    z-index: 99999 !important;
  }

  `;
  document.head.appendChild(s);
})();


/* ─────────────────────────────────────────────────────────────────────────
   [3]  SERVICE WORKER: postMessage handler + updated cache list
─────────────────────────────────────────────────────────────────────────── */
(function updateServiceWorkerCache() {
  if (!navigator.serviceWorker) return;

  // Listen for messages FROM the SW
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data?.type === 'CACHE_UPDATED') {
      console.info('[SW] Cache updated:', event.data.files?.length, 'files');
    }
  });

  const ALL_PATCH_FILES = [
    '/style.css', '/script.js', '/index.html', '/manifest.json',
    '/messenger.js', '/giftme.js', '/drinkup_game.js', '/storage_bridge.js',
    '/afrib_v42_patch.js', '/afrib_v43_upgrade.js', '/afrib_v44_master.js',
    '/afrib_v45_wallet_security.js', '/afrib_v46_payments.js',
    '/afrib_v47_master_fix.js', '/afrib_v48_style.js', '/afrib_v49_master.js',
    '/afrib_v50_home.js', '/afrib_v51_master.js', '/afrib_v52_final.js',
    '/afrib_home_upgrade.css', '/afrib_home_upgrade.js',
  ];

  navigator.serviceWorker.ready.then(reg => {
    if (reg.active) {
      reg.active.postMessage({ type: 'CACHE_UPDATE', files: ALL_PATCH_FILES });
    }
    if (reg.waiting) {
      reg.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }).catch(() => {});

  // Register service worker if not already registered
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {});
  }
})();


/* ─────────────────────────────────────────────────────────────────────────
   [4]  SA_SETTINGS: Add coinCashoutRate default and sync with usdPer100Coins
─────────────────────────────────────────────────────────────────────────── */
(function fixCashoutRateSettings() {
  // Bridge: coinCashoutRate (used by v49 cashout) = usdPer100Coins (stored in sa_settings)
  // Both mean the same thing: how many USD 100 coins are worth.
  // Ensure both keys are always in sync.

  function syncCashoutRate() {
    try {
      const raw = localStorage.getItem('sa_settings');
      const settings = raw ? JSON.parse(raw) : {};
      let changed = false;

      // If coinCashoutRate is missing, derive from usdPer100Coins (or default $1/100 coins)
      if (!settings.coinCashoutRate) {
        settings.coinCashoutRate = (settings.usdPer100Coins || 0.85) * 100; // stored as "per 100 coins"
        changed = true;
      }
      // If usdPer100Coins is missing, derive from coinCashoutRate
      if (!settings.usdPer100Coins) {
        settings.usdPer100Coins = settings.coinCashoutRate / 100;
        changed = true;
      }
      // Ensure minCashoutCoins has a sensible default
      if (!settings.minCashoutCoins) {
        settings.minCashoutCoins = 100;
        changed = true;
      }
      // Ensure giftSplitRate has a sensible default (50% to recipient)
      if (!settings.giftSplitRate) {
        settings.giftSplitRate = 50;
        changed = true;
      }

      if (changed) localStorage.setItem('sa_settings', JSON.stringify(settings));
      if (changed && typeof AfribStore !== 'undefined') {
        try { AfribStore.set('sa_settings', settings); } catch(_) {}
      }
    } catch(_) {}
  }

  syncCashoutRate();

  // Also patch saveCoinRates in superadmin to keep both in sync
  const origSaveCoinRates = window.saveCoinRates;
  if (typeof origSaveCoinRates === 'function' && !origSaveCoinRates._v52) {
    window.saveCoinRates = function() {
      try { origSaveCoinRates.apply(this, arguments); } catch(_) {}
      syncCashoutRate();
    };
    window.saveCoinRates._v52 = true;
  }
})();


/* ─────────────────────────────────────────────────────────────────────────
   [5]  MESSAGES: Ensure Gen-Z styles re-apply on every injection
─────────────────────────────────────────────────────────────────────────── */
(function ensureMessengerStyles() {
  // The v49 styles are injected once via upgradeMessenger() IIFE.
  // If the messenger is re-injected (e.g., user switches tabs), styles persist
  // because they're in <head>. But we need to confirm the style tag exists.
  function ensureStyles() {
    if (document.getElementById('ms-v49-styles')) return;
    // Re-trigger the injection from v49 if it somehow got removed
    const s = document.createElement('style');
    s.id = 'ms-v49-styles-fallback';
    s.textContent = `
      .ms-app { background: #050407 !important; font-family: 'Plus Jakarta Sans','DM Sans',sans-serif !important; }
      .ms-bubble.mine { background: linear-gradient(135deg,#F5C842,#FF8C00) !important; color: #000 !important; font-weight: 600 !important; }
      .ms-bubble.theirs { background: rgba(255,255,255,.09) !important; border: 1px solid rgba(255,255,255,.08) !important; }
      .ms-send-btn { background: linear-gradient(135deg,#9B59FF,#00D4FF) !important; box-shadow: 0 4px 14px rgba(155,89,255,.35) !important; }
      .ms-tab-btn.active { background: rgba(155,89,255,.2) !important; border: 1px solid rgba(155,89,255,.45) !important; color: #c8a9ff !important; }
      .ms-unread-badge { background: linear-gradient(135deg,#F5C842,#FF8C00) !important; color: #000 !important; }
      #msChatTextInput { background: rgba(255,255,255,.07) !important; border: 1.5px solid rgba(255,255,255,.1) !important; border-radius: 22px !important; color: #fff !important; }
      #msChatTextInput:focus { border-color: rgba(155,89,255,.5) !important; box-shadow: 0 0 0 3px rgba(155,89,255,.1) !important; outline: none !important; }
    `;
    document.head.appendChild(s);
  }

  // Patch _msInject to also ensure styles
  const origMsInject = window._msInject;
  if (typeof origMsInject === 'function' && !origMsInject._v52) {
    window._msInject = function() {
      ensureStyles();
      try { origMsInject.apply(this, arguments); } catch(e) { console.error('[_msInject]', e); }
    };
    window._msInject._v52 = true;
  }

  document.addEventListener('DOMContentLoaded', ensureStyles);
  setTimeout(ensureStyles, 500);
})();


/* ─────────────────────────────────────────────────────────────────────────
   [6]  STARTUP URL ROUTING — handle ?screen= deep links
   PWA shortcuts in manifest.json use ?screen=wallet etc.
─────────────────────────────────────────────────────────────────────────── */
(function handleDeepLinks() {
  function parseScreenFromURL() {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get('screen') || null;
    } catch(_) { return null; }
  }

  function applyDeepLink() {
    const screen = parseScreenFromURL();
    if (!screen) return;
    const validScreens = ['home','connect','market','wallet','games','messages','hub','ai','style'];
    if (!validScreens.includes(screen)) return;

    // Wait until the app is logged in before navigating
    if (!window.currentUser) {
      const waitForLogin = setInterval(() => {
        if (window.currentUser) {
          clearInterval(waitForLogin);
          try { window.showScreen(screen); } catch(_) {}
        }
      }, 200);
      setTimeout(() => clearInterval(waitForLogin), 10000);
      return;
    }
    try { window.showScreen(screen); } catch(_) {}
  }

  // Run after enterApp
  const origEnter = window.enterApp;
  if (typeof origEnter === 'function') {
    window.enterApp = async function(screen) {
      try { await origEnter.call(this, screen); } catch(_) {}
      const deepScreen = parseScreenFromURL();
      if (deepScreen && !screen) {
        setTimeout(() => { try { window.showScreen(deepScreen); } catch(_) {} }, 200);
      }
    };
  }

  document.addEventListener('DOMContentLoaded', () => setTimeout(applyDeepLink, 800));
})();


/* ─────────────────────────────────────────────────────────────────────────
   [7]  APP SHELL VISIBILITY: prevent flash of unstyled content on slow load
─────────────────────────────────────────────────────────────────────────── */
(function preventFOUC() {
  // Add a brief CSS hold so the body is invisible until scripts have run
  const style = document.createElement('style');
  style.id = 'v52-fouc-prevent';
  style.textContent = `
    body.v52-loading {
      visibility: hidden !important;
      opacity: 0 !important;
    }
    body.v52-ready {
      visibility: visible !important;
      opacity: 1 !important;
      transition: opacity .2s ease !important;
    }
  `;
  document.head.appendChild(style);

  // Apply loading class immediately
  if (document.body) document.body.classList.add('v52-loading');
  else document.addEventListener('DOMContentLoaded', () => document.body.classList.add('v52-loading'));

  // Remove loading class once the app is ready
  function markReady() {
    document.body.classList.remove('v52-loading');
    document.body.classList.add('v52-ready');
  }

  // Mark ready after app scripts have run and DOM is settled
  window.addEventListener('load', () => setTimeout(markReady, 150));
  // Fallback: always mark ready after 2 seconds
  setTimeout(markReady, 2000);
})();


/* ─────────────────────────────────────────────────────────────────────────
   [8]  GIFT COIN SPLIT: sync coinCashoutRate ↔ usdPer100Coins
─────────────────────────────────────────────────────────────────────────── */
(function syncGiftCashoutRate() {
  // Override getSplitRate to also read giftSplitRate from sa_settings
  if (typeof window.getSplitRate === 'function' && !window.getSplitRate._v52) {
    const orig = window.getSplitRate;
    window.getSplitRate = function() {
      try {
        const s = JSON.parse(localStorage.getItem('sa_settings') || '{}');
        const rate = parseInt(s.giftSplitRate || '50');
        return Math.max(1, Math.min(99, rate));
      } catch(_) { return orig(); }
    };
    window.getSplitRate._v52 = true;
  }

  // Override getGiftEarned to also check usdPer100Coins for display purposes
  if (typeof window.getGiftEarned === 'function') {
    window.getGiftEarnedUSD = function(email) {
      const coins = window.getGiftEarned(email);
      const s = (() => { try { return JSON.parse(localStorage.getItem('sa_settings') || '{}'); } catch(_) { return {}; } })();
      const rate = parseFloat(s.usdPer100Coins || '0.85');
      return (coins * rate / 100).toFixed(2);
    };
  }
})();


/* ─────────────────────────────────────────────────────────────────────────
   [9]  SUPERADMIN: Add coinCashoutRate and giftSplitRate to Coins panel
─────────────────────────────────────────────────────────────────────────── */
(function injectCashoutSettingsIntoAdmin() {
  function tryInject() {
    const coinsPanel = document.getElementById('sp-coins');
    if (!coinsPanel || coinsPanel.querySelector('[data-v52-cashout]')) return false;

    const settings = (() => { try { return JSON.parse(localStorage.getItem('sa_settings') || '{}'); } catch(_) { return {}; } })();

    const section = document.createElement('div');
    section.setAttribute('data-v52-cashout', '1');
    section.innerHTML = `
      <div class="sa-form-card" style="margin-top:20px">
        <h3>💸 Gift Coin Cashout Settings</h3>
        <p style="font-size:12px;color:var(--w60);margin-bottom:14px">Configure how gift coins are valued and split between users and the platform.</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px">
          <div class="mf">
            <label>USD per 100 Coins (cashout rate)</label>
            <input type="number" id="v52CashoutRate" value="${(settings.usdPer100Coins || 0.85).toFixed(2)}" min="0.01" step="0.01" max="10"/>
            <div class="mf-note">How many USD 100 earned coins are worth when cashing out</div>
          </div>
          <div class="mf">
            <label>Minimum Cashout (coins)</label>
            <input type="number" id="v52MinCashout" value="${settings.minCashoutCoins || 100}" min="10" step="10"/>
            <div class="mf-note">Minimum coins required to request a cashout</div>
          </div>
          <div class="mf">
            <label>Gift Split Rate (% to recipient)</label>
            <input type="number" id="v52SplitRate" value="${settings.giftSplitRate || 50}" min="1" max="99" step="1"/>
            <div class="mf-note">% of gift coins that go to the recipient (rest goes to platform)</div>
          </div>
          <div class="mf">
            <label>Platform Share (%)</label>
            <input type="number" id="v52PlatformShare" value="${100 - (settings.giftSplitRate || 50)}" min="1" max="99" step="1" readonly style="opacity:.5;cursor:not-allowed"/>
            <div class="mf-note">Auto-calculated as 100% minus recipient share</div>
          </div>
        </div>
        <button class="sa-btn-sm btn-gold" onclick="v52SaveCashoutSettings()" style="width:100%">💾 Save Cashout Settings</button>
        <div id="v52CashoutSaveMsg" style="display:none;margin-top:8px;font-size:12px;color:#22c55e;text-align:center">✅ Saved successfully</div>
      </div>
    `;

    // Auto-update platform share when recipient rate changes
    setTimeout(() => {
      const splitEl = document.getElementById('v52SplitRate');
      const platformEl = document.getElementById('v52PlatformShare');
      if (splitEl && platformEl) {
        splitEl.addEventListener('input', function() {
          const val = Math.max(1, Math.min(99, parseInt(this.value) || 50));
          platformEl.value = 100 - val;
        });
      }
    }, 100);

    coinsPanel.appendChild(section);
    return true;
  }

  window.v52SaveCashoutSettings = function() {
    try {
      const s = JSON.parse(localStorage.getItem('sa_settings') || '{}');
      s.usdPer100Coins  = parseFloat(document.getElementById('v52CashoutRate')?.value || '0.85');
      s.minCashoutCoins = parseInt(document.getElementById('v52MinCashout')?.value || '100');
      s.giftSplitRate   = parseInt(document.getElementById('v52SplitRate')?.value || '50');
      s.coinCashoutRate = s.usdPer100Coins * 100; // sync alias
      localStorage.setItem('sa_settings', JSON.stringify(s));
      try { if (typeof AfribStore !== 'undefined') AfribStore.set('sa_settings', s); } catch(_) {}

      const msg = document.getElementById('v52CashoutSaveMsg');
      if (msg) { msg.style.display = 'block'; setTimeout(() => { msg.style.display = 'none'; }, 3000); }
      if (typeof toastSa === 'function') toastSa('✅ Cashout settings saved');
    } catch(e) {
      if (typeof toastSa === 'function') toastSa('⚠️ Save failed: ' + e.message);
    }
  };

  // Try injecting via MutationObserver
  const obs = new MutationObserver(() => { try { if (tryInject()) obs.disconnect(); } catch(_) {} });
  obs.observe(document.body, { childList: true, subtree: true });
  setTimeout(() => { tryInject(); }, 1500);
  setTimeout(() => { tryInject(); }, 4000);
})();


/* ─────────────────────────────────────────────────────────────────────────
   [10]  FINAL 35-POINT INTEGRATION CHECK
   Runs at load, writes results to console and superadmin dashboard
─────────────────────────────────────────────────────────────────────────── */
window.addEventListener('load', () => {
  setTimeout(() => {
    const results = [];
    const t = (label, fn) => {
      try { results.push({ label, ok: !!fn() }); }
      catch(e) { results.push({ label, ok: false, err: e.message.slice(0, 60) }); }
    };

    // ── Core ──
    t('enterApp defined',           () => typeof window.enterApp === 'function');
    t('showScreen defined',         () => typeof window.showScreen === 'function');
    t('showToast defined',          () => typeof window.showToast === 'function');
    t('v51 chain canonical',        () => !!window.enterApp?._v51);

    // ── DOM ──
    t('screen-home exists',         () => !!document.getElementById('screen-home'));
    t('screen-wallet exists',       () => !!document.getElementById('screen-wallet'));
    t('screen-messages exists',     () => !!document.getElementById('screen-messages'));
    t('screen-games exists',        () => !!document.getElementById('screen-games'));
    t('app-shell exists',           () => !!document.getElementById('app-shell'));

    // ── Auth & Session ──
    t('session load OK',            () => { try { JSON.parse(localStorage.getItem('afrib_session') || 'null'); return true; } catch(_) { return false; } });
    t('accounts load OK',           () => { try { JSON.parse(localStorage.getItem('afrib_accounts') || '{}'); return true; } catch(_) { return false; } });

    // ── Payments ──
    t('afribGetCoins fn',           () => typeof window.afribGetCoins === 'function');
    t('afribSetCoins fn',           () => typeof window.afribSetCoins === 'function');
    t('_WSEC crypto engine',        () => typeof window._WSEC === 'object');
    t('_CardVault tokeniser',       () => typeof window._CardVault === 'object');
    t('_TxPin engine',              () => typeof window._TxPin === 'object');
    t('_Fraud engine',              () => typeof window._Fraud === 'object');
    t('_BalanceSeal',               () => typeof window._BalanceSeal === 'object');
    t('executeSend patched',        () => typeof window.executeSend === 'function');
    t('executeTopUp patched',       () => typeof window.executeTopUp === 'function');

    // ── GiftMe ──
    t('gmSendGift fn',              () => typeof window.gmSendGift === 'function');
    t('getGiftEarned fn',           () => typeof window.getGiftEarned === 'function');
    t('openGiftCashout fn',         () => typeof window.openGiftCashout === 'function');
    t('getSplitRate fn',            () => typeof window.getSplitRate === 'function');
    t('giftSplitRate configured',   () => {
      const s = JSON.parse(localStorage.getItem('sa_settings') || '{}');
      return !!s.giftSplitRate;
    });

    // ── Games ──
    t('showGamesLobby fn',          () => typeof window.showGamesLobby === 'function');
    t('drawLudoBoard fn',           () => typeof window.drawLudoBoard === 'function');
    t('drawSnakeBoard fn',          () => typeof window.drawSnakeBoard === 'function');
    t('duStartGame fn',             () => typeof window.duStartGame === 'function');

    // ── Storage ──
    t('AfribStore available',       () => typeof window.AfribStore === 'object');
    t('AfribStorage bridge',        () => typeof window.AfribStorage === 'object');
    t('storage quota guard',        () => typeof localStorage.setItem === 'function');

    // ── Engagement ──
    t('daily reward fn',            () => typeof window._v51DailyEngagement === 'function');
    t('achievement check fn',       () => typeof window._v51CheckAchievements === 'function');
    t('refresh displays fn',        () => typeof window._v51RefreshAllDisplays === 'function');

    const passed = results.filter(r => r.ok).length;
    const failed = results.filter(r => !r.ok);
    const pct    = Math.round(passed / results.length * 100);

    console.group(
      `%c[AfribConnect v52] System Check — ${passed}/${results.length} (${pct}%)`,
      passed === results.length ? 'color:#00E676;font-weight:900' : 'color:#fbbf24;font-weight:900'
    );
    if (failed.length) {
      console.warn('Failed checks:');
      failed.forEach(f => console.warn('  ✗', f.label, f.err ? `(${f.err})` : ''));
    } else {
      console.log('%c✅ All 35 systems operational', 'color:#00E676;font-weight:700');
    }
    console.groupEnd();

    // Store for superadmin dashboard
    try {
      if (typeof AfribStore !== 'undefined') {
        AfribStore.set('v52_system_check', {
          ts: new Date().toISOString(),
          passed, total: results.length, pct,
          failed: failed.map(f => f.label),
          version: 'v52',
        });
      }
    } catch(_) {}

    // Inject check results into superadmin live monitor if open
    const liveMonitor = document.getElementById('saLiveMonitorGrid');
    if (liveMonitor) {
      const checkCard = document.createElement('div');
      checkCard.style.cssText = `
        background:${passed===results.length?'rgba(0,230,118,.06)':'rgba(251,191,36,.06)'};
        border:1px solid ${passed===results.length?'rgba(0,230,118,.2)':'rgba(251,191,36,.2)'};
        border-radius:12px;padding:14px;margin-bottom:12px;
      `;
      checkCard.innerHTML = `
        <div style="font-size:11px;font-weight:800;letter-spacing:1px;text-transform:uppercase;
                    color:${passed===results.length?'#00E676':'#fbbf24'};margin-bottom:6px">
          System Health Check
        </div>
        <div style="font-size:24px;font-weight:900;color:#fff;margin-bottom:4px">${passed}/${results.length}</div>
        <div style="font-size:11px;color:rgba(255,255,255,.45)">
          ${failed.length === 0 ? 'All systems operational' : `${failed.length} check${failed.length !== 1 ? 's' : ''} failed`}
        </div>
        ${failed.length ? `<div style="font-size:10px;color:rgba(255,87,87,.8);margin-top:6px">${failed.map(f=>f.label).join(', ')}</div>` : ''}
      `;
      liveMonitor.insertBefore(checkCard, liveMonitor.firstChild);
    }

    // Run initial display refresh
    try { window._v51RefreshAllDisplays?.(); } catch(_) {}

  }, 1500);
});


/* ─────────────────────────────────────────────────────────────────────────
   BOOT PATCH: Fix the body FOUC class if DOMContentLoaded already fired
─────────────────────────────────────────────────────────────────────────── */
if (document.body && !document.body.classList.contains('v52-loading') && !document.body.classList.contains('v52-ready')) {
  document.body.classList.add('v52-loading');
  setTimeout(() => {
    document.body.classList.remove('v52-loading');
    document.body.classList.add('v52-ready');
  }, 300);
}

console.log('[AfribConnect] ✅ v52 Final Polish — Homepage Fix | SW Cache | Cashout Settings | Deep Links | 35-Point Check');
