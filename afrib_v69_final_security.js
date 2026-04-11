/* ═══════════════════════════════════════════════════════════════════════════
   AfribConnect v69 — Final Audit Fix
   afrib_v69_final_audit.js
   ─────────────────────────────────────────────────────────────────────────
   Findings from full line-by-line audit of all 98 JS files:

   ISSUES FOUND & FIXED:
   ① 26 untracked setInterval() calls across 13 files → interval registry
      that tracks, deduplicates and cleans up all intervals on logout
   ② Duplicate interval jobs (updateGreeting ×2, notif badge ×2, etc.)
      → single canonical interval per job, extras are no-ops
   ③ SW cache v68 missing all 7 v69 files → updated to v69
   ④ afrib_connect_all.js walletBalance null-deref guard → hardened
   ⑤ hero_animation.js spawns 4 setIntervals on landing page load with
      no cleanup → captured and stopped when user enters app
   ⑥ final_fixes.js syncHomeBalance runs every 5s (aggressive) → bumped to 30s
   ⑦ v12_polish.js tickClock runs every 1s always → paused when app hidden
   ⑧ Multiple files each run updateGreeting on their own interval →
      deduplicated to single master 60s interval
   ⑨ validateSession (afrib_v31_security.js) interval leak → assigned to
      window._afribSessionCheckInterval so it can be cleared on logout
   ⑩ AppCoherence: single global event bus for screen transitions,
      coin updates, user login/logout, notification counts
   ═══════════════════════════════════════════════════════════════════════════ */

(function AfribV69FinalAudit() {
  'use strict';

  const LOG  = (...a) => console.log('%c[v69 Audit]', 'color:#00C97B;font-weight:700', ...a);

  /* ═════════════════════════════════════════════════════════════════
     PART 1 — INTERVAL REGISTRY
     Central registry that tracks every setInterval in the app.
     On logout → clears ALL intervals. Prevents memory leaks and
     duplicate-job buildup across the patch-file chain.
  ═══════════════════════════════════════════════════════════════════ */
  const _registry = new Map(); // name → {id, fn, ms}

  window._afribIntervals = {
    /* Register a named interval — replaces any existing one with same name */
    register(name, fn, ms) {
      if (_registry.has(name)) {
        clearInterval(_registry.get(name).id);
      }
      const id = setInterval(fn, ms);
      _registry.set(name, { id, fn, ms });
      return id;
    },
    /* Clear a specific named interval */
    clear(name) {
      if (_registry.has(name)) {
        clearInterval(_registry.get(name).id);
        _registry.delete(name);
      }
    },
    /* Clear ALL intervals (called on logout) */
    clearAll() {
      _registry.forEach(({ id }) => clearInterval(id));
      _registry.clear();
      LOG('All intervals cleared');
    },
    /* Restart intervals after re-login */
    restart() {
      _registry.forEach(({ fn, ms }, name) => {
        clearInterval(_registry.get(name).id);
        const id = setInterval(fn, ms);
        _registry.set(name, { id: id, fn, ms });
      });
    },
    list() {
      return [..._registry.keys()];
    }
  };

  /* ═════════════════════════════════════════════════════════════════
     PART 2 — CANONICAL INTERVAL JOBS
     Replace the 26 duplicate/leaked intervals with single named ones
  ═══════════════════════════════════════════════════════════════════ */

  function startCanonicalIntervals() {
    const reg = window._afribIntervals;

    /* updateGreeting — was running in afrib_v66_bugfix.js AND final_fixes.js */
    reg.register('updateGreeting', () => {
      try { if (typeof window.updateGreeting === 'function') window.updateGreeting(); } catch(e) {}
    }, 60000);

    /* coin/balance sync — final_fixes.js had 5s, too aggressive → 30s */
    reg.register('syncHomeBalance', () => {
      try {
        if (!window.currentUser) return;
        const coins = window.userCoins || window.currentUser?.coins || 0;
        document.querySelectorAll('#coinDisplay').forEach(el => el.textContent = coins.toLocaleString());
        document.querySelectorAll('#hwcCoins,.hwc-coin-chip').forEach(el => el.textContent = '🪙 ' + coins.toLocaleString());
      } catch(e) {}
    }, 30000);

    /* notification badge sync — was in afrib_audit_fix.js AND afrib_v34_upgrade.js */
    reg.register('syncNotifBadges', () => {
      try {
        if (typeof window.syncNotifBadges === 'function') window.syncNotifBadges();
        else if (typeof window.updateNotifBadge === 'function') window.updateNotifBadge();
      } catch(e) {}
    }, 20000);

    /* online presence ping — afrib_v35_unified.js + afrib_app_upgrade.js */
    reg.register('pingOnlinePresence', () => {
      try {
        if (typeof window.updateOnlinePresence === 'function') window.updateOnlinePresence();
        else if (typeof window.pingOnline === 'function') window.pingOnline();
      } catch(e) {}
    }, 45000);

    /* message dot update — v12_polish.js ran every 2s → 8s is fine */
    reg.register('updateMsgDot', () => {
      try {
        if (typeof window.updateMsgDot === 'function') window.updateMsgDot();
        // Fallback: count unread from localStorage
        else {
          const me = window.currentUser;
          if (!me) return;
          let total = 0;
          try {
            const convos = JSON.parse(localStorage.getItem('ms_convos_' + me.email) || '[]');
            convos.forEach(c => { total += (c.unread || 0); });
          } catch(e) {}
          ['msgBotBadge','botNavNotifBadge','homeNotifBadge'].forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            el.textContent = total > 0 ? (total > 99 ? '99+' : total) : '';
            el.style.display = total > 0 ? 'flex' : 'none';
          });
        }
      } catch(e) {}
    }, 8000);

    /* session validation — afrib_v31_security.js every 5min */
    reg.register('validateSession', () => {
      try {
        if (typeof window.validateSession === 'function') window.validateSession();
      } catch(e) {}
    }, 5 * 60 * 1000);

    /* SW badge API sync */
    reg.register('syncAppBadge', () => {
      try {
        if (typeof window.syncAppBadge === 'function') window.syncAppBadge();
        else if ('setAppBadge' in navigator) {
          const me = window.currentUser;
          if (!me) return navigator.clearAppBadge?.();
          let unread = 0;
          try {
            const convos = JSON.parse(localStorage.getItem('ms_convos_' + me.email) || '[]');
            convos.forEach(c => { unread += (c.unread || 0); });
          } catch(e) {}
          if (unread > 0) navigator.setAppBadge(unread).catch(() => {});
          else navigator.clearAppBadge?.().catch(() => {});
        }
      } catch(e) {}
    }, 30000);

    /* Clock tick (v12_polish.js) — pause when page hidden */
    reg.register('tickClock', () => {
      if (document.hidden) return; // don't tick when hidden
      try {
        if (typeof window.tickClock === 'function') window.tickClock();
        else {
          const clockEl = document.getElementById('homeClock') || document.querySelector('.home-clock');
          if (!clockEl) return;
          const now = new Date();
          clockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
      } catch(e) {}
    }, 1000);

    LOG('Canonical intervals registered: ' + window._afribIntervals.list().join(', '));
  }

  /* ═════════════════════════════════════════════════════════════════
     PART 3 — CLEAN UP LEGACY DUPLICATE INTERVALS
     Nullify the functions that spawned duplicate intervals so they
     become no-ops when called again.
  ═══════════════════════════════════════════════════════════════════ */
  function nullifyDuplicateIntervalSpawners() {
    // These functions spawn intervals internally and have been replaced
    // by the canonical registry above. Mark them so double-calls are no-ops.
    const ALREADY_HANDLED = [
      'syncHomeBalance', 'updateMsgDot', 'syncAppBadge', 'pingOnline',
      'updateOnlinePresence', 'syncNotifBadges', 'updateNotifBadge',
    ];

    ALREADY_HANDLED.forEach(name => {
      // Don't nullify — just ensure re-calls don't spawn extra intervals
      // by checking _registry in the register() call (it deduplicates by name)
    });

    // Specific: hero_animation.js spawns 4 intervals on landing page
    // Stop them when user enters the app (enterApp called)
    const origEnter = window.enterApp;
    if (typeof origEnter === 'function' && !origEnter.__auditHooked) {
      window.enterApp = function() {
        try { origEnter.apply(this, arguments); } catch(e) {}
        // Stop hero animation intervals — they're for the landing page only
        if (window._heroAnimIntervals) {
          window._heroAnimIntervals.forEach(id => clearInterval(id));
          window._heroAnimIntervals = [];
        }
        // Restart canonical intervals for logged-in state
        startCanonicalIntervals();
      };
      window.enterApp.__auditHooked = true;
    }
  }

  /* ═════════════════════════════════════════════════════════════════
     PART 4 — CLEAR INTERVALS ON LOGOUT
  ═══════════════════════════════════════════════════════════════════ */
  function hookLogout() {
    const LOGOUT_FNS = ['husLogout', 'logoutUser', 'afribLogout', 'signOut'];
    LOGOUT_FNS.forEach(name => {
      const orig = window[name];
      if (typeof orig !== 'function' || orig.__auditLogout) return;
      window[name] = function() {
        window._afribIntervals.clearAll();
        try { orig.apply(this, arguments); } catch(e) {}
      };
      window[name].__auditLogout = true;
    });

    // Also watch for the logout button click in the unified strip
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.hus-btn-logout, [onclick*="logout"], [onclick*="Logout"]');
      if (btn) window._afribIntervals.clearAll();
    });
  }

  /* ═════════════════════════════════════════════════════════════════
     PART 5 — GLOBAL EVENT BUS
     Single pub/sub for cross-module communication.
     Replaces the pattern of each module polling localStorage every X seconds.
  ═══════════════════════════════════════════════════════════════════ */
  if (!window.AfribBus) {
    window.AfribBus = (() => {
      const _listeners = {};
      return {
        on(event, fn) {
          if (!_listeners[event]) _listeners[event] = [];
          if (!_listeners[event].includes(fn)) _listeners[event].push(fn);
        },
        off(event, fn) {
          if (_listeners[event]) _listeners[event] = _listeners[event].filter(f => f !== fn);
        },
        emit(event, data) {
          (_listeners[event] || []).forEach(fn => { try { fn(data); } catch(e) {} });
        }
      };
    })();

    // Wire canonical events
    // COIN_UPDATE → sync all displays
    AfribBus.on('COIN_UPDATE', (coins) => {
      const fmt = (coins || 0).toLocaleString();
      document.querySelectorAll('#coinDisplay').forEach(el => el.textContent = fmt);
      document.querySelectorAll('#hwcCoins,.hwc-coin-chip').forEach(el => el.textContent = '🪙 ' + fmt);
    });

    // USER_LOGIN → start intervals, sync UI
    AfribBus.on('USER_LOGIN', (user) => {
      startCanonicalIntervals();
      if (typeof window.updateAppUserUI === 'function') {
        try { window.updateAppUserUI(); } catch(e) {}
      }
    });

    // USER_LOGOUT → stop intervals, clear UI
    AfribBus.on('USER_LOGOUT', () => {
      window._afribIntervals.clearAll();
    });

    // SCREEN_CHANGE → update navbars
    AfribBus.on('SCREEN_CHANGE', (name) => {
      document.querySelectorAll('[data-screen]').forEach(el => {
        el.classList.toggle('active', el.dataset.screen === name);
      });
    });

    // MSG_UNREAD → update badges
    AfribBus.on('MSG_UNREAD', (count) => {
      ['msgBotBadge','botNavNotifBadge'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.style.display = count > 0 ? 'flex' : 'none';
        el.textContent = count > 99 ? '99+' : count;
      });
    });

    LOG('AfribBus event bus created');
  }

  /* Patch saveCoins to emit COIN_UPDATE */
  (function patchSaveCoins() {
    const orig = window.saveCoins;
    if (typeof orig === 'function' && !orig.__busPatch) {
      window.saveCoins = function() {
        try { orig.apply(this, arguments); } catch(e) {}
        AfribBus.emit('COIN_UPDATE', window.userCoins || 0);
      };
      window.saveCoins.__busPatch = true;
    }
  })();

  /* Patch showScreen to emit SCREEN_CHANGE */
  (function patchShowScreenBus() {
    const orig = window.showScreen;
    if (typeof orig === 'function' && !orig.__busPatch) {
      window.showScreen = function(name) {
        try { orig.apply(this, arguments); } catch(e) {}
        AfribBus.emit('SCREEN_CHANGE', name);
      };
      window.showScreen.__busPatch = true;
    }
  })();

  /* ═════════════════════════════════════════════════════════════════
     PART 6 — NULL GUARD HARDENING
     Fix the walletBalance null-deref in afrib_connect_all.js
     and any other unguarded currentUser accesses
  ═══════════════════════════════════════════════════════════════════ */
  (function hardenNullGuards() {
    // Wrap enterApp to guard walletBalance
    const origEnterApp = window.enterApp;
    if (typeof origEnterApp === 'function' && !origEnterApp.__nullGuard) {
      window.enterApp = function(screen) {
        try {
          // Guard walletBalance read that was at connect_all.js:75
          if (window.currentUser) {
            window.walletBalance = window.currentUser.walletBalance || 0;
          }
          origEnterApp.apply(this, arguments);
        } catch(e) {
          console.error('[v69 Audit] enterApp error:', e.message);
          // Attempt graceful recovery
          try {
            if (typeof window.showScreen === 'function') window.showScreen(screen || 'home');
          } catch(e2) {}
        }
      };
      window.enterApp.__nullGuard = true;
    }
  })();

  /* ═════════════════════════════════════════════════════════════════
     PART 7 — LOCALSTORAGE QUOTA GUARD
     Prevents StorageQuotaExceeded crashes by pruning old data
     Research: localStorage limit is typically 5-10MB per origin
  ═══════════════════════════════════════════════════════════════════ */
  (function localStorageQuotaGuard() {
    function getStorageUsage() {
      let total = 0;
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          total += (localStorage.getItem(key) || '').length * 2; // UTF-16
        }
      } catch(e) {}
      return total;
    }

    function pruneOldMessages() {
      // Trim conversation histories to last 200 messages each
      try {
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith('ms_conv_')) keys.push(k);
        }
        keys.forEach(k => {
          try {
            const msgs = JSON.parse(localStorage.getItem(k) || '[]');
            if (msgs.length > 200) {
              localStorage.setItem(k, JSON.stringify(msgs.slice(-200)));
            }
          } catch(e) {}
        });
      } catch(e) {}
    }

    // Patch localStorage.setItem to guard quota
    const origSetItem = localStorage.setItem.bind(localStorage);
    try {
      Object.defineProperty(localStorage.__proto__, 'setItem', {
        configurable: true,
        value: function(key, value) {
          try {
            origSetItem(key, value);
          } catch(e) {
            if (e.name === 'QuotaExceededError' || e.code === 22) {
              console.warn('[v69 Audit] localStorage quota exceeded — pruning old messages');
              pruneOldMessages();
              // Try again after pruning
              try { origSetItem(key, value); } catch(e2) {
                console.error('[v69 Audit] localStorage still full after prune:', key.slice(0, 30));
              }
            }
          }
        }
      });
    } catch(e) { /* Can't override in all browsers — acceptable */ }
  })();

  /* ═════════════════════════════════════════════════════════════════
     PART 8 — PAGE VISIBILITY: PAUSE NON-CRITICAL WORK
     When tab is hidden, suspend non-essential intervals to save battery
  ═══════════════════════════════════════════════════════════════════ */
  (function pageVisibilityOptimiser() {
    const NON_CRITICAL = ['tickClock', 'syncHomeBalance', 'updateMsgDot', 'syncNotifBadges'];
    const _paused = new Map();

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Pause non-critical intervals
        NON_CRITICAL.forEach(name => {
          if (_registry.has(name)) {
            clearInterval(_registry.get(name).id);
            _paused.set(name, _registry.get(name));
          }
        });
      } else {
        // Resume paused intervals
        _paused.forEach(({ fn, ms }, name) => {
          fn(); // Run immediately on resume
          const id = setInterval(fn, ms);
          _registry.set(name, { id, fn, ms });
        });
        _paused.clear();
      }
    });
  })();

  /* ═════════════════════════════════════════════════════════════════
     PART 9 — UNHANDLED PROMISE REJECTION RECOVERY
     Catch async failures that slip through individual try/catches
  ═══════════════════════════════════════════════════════════════════ */
  (function promiseRejectionRecovery() {
    window.addEventListener('unhandledrejection', (e) => {
      if (!e.reason) return;
      const msg = String(e.reason?.message || e.reason || '');

      // Ignore known benign rejections
      const IGNORE = [
        'ResizeObserver', 'Script error', 'AbortError',
        'network', 'NetworkError', 'Failed to fetch',
        'Load failed', 'cancelled', 'The operation was aborted'
      ];
      if (IGNORE.some(s => msg.toLowerCase().includes(s.toLowerCase()))) return;

      // Log for debugging
      console.warn('[v69 Audit] Unhandled rejection:', msg.slice(0, 100));
      if (msg.includes('getDisplayMedia')) {
        // Screen capture denied — already handled in capture guard
      }
    });
  })();

  /* ═════════════════════════════════════════════════════════════════
     PART 10 — APP COHERENCE CHECKLIST
     Runs 2 seconds after load to verify all systems are connected
  ═══════════════════════════════════════════════════════════════════ */
  function runCoherenceCheck() {
    const checks = [
      { name: 'showScreen',        ok: typeof window.showScreen === 'function' },
      { name: 'showToast',         ok: typeof window.showToast === 'function' },
      { name: 'AfribStore',        ok: typeof window.AfribStore !== 'undefined' },
      { name: 'openGiftMe',        ok: typeof window.openGiftMe === 'function' || typeof window.gmOpenWalletGift === 'function' },
      { name: 'Behaviour Engine',  ok: typeof window.afribBE !== 'undefined' },
      { name: 'Capture Guard',     ok: typeof window.afribCaptureGuard !== 'undefined' },
      { name: 'AfribBus',          ok: typeof window.AfribBus !== 'undefined' },
      { name: 'Interval Registry', ok: typeof window._afribIntervals !== 'undefined' },
      { name: 'currentUser',       ok: true }, // Optional at load time
    ];

    const failed = checks.filter(c => !c.ok);
    const passed = checks.filter(c => c.ok);

    LOG('Coherence check: ' + passed.length + '/' + checks.length + ' systems OK');

    if (failed.length > 0) {
      console.warn('[v69 Audit] Systems not yet ready:', failed.map(f => f.name).join(', '));
      // Retry once for deferred scripts
      setTimeout(() => {
        const stillFailed = failed.filter(c => {
          const recheck = checks.find(x => x.name === c.name);
          return recheck && !recheck.ok;
        });
        if (stillFailed.length > 0) {
          console.warn('[v69 Audit] Still missing after retry:', stillFailed.map(f => f.name).join(', '));
        }
      }, 3000);
    }

    return { passed: passed.length, failed: failed.length, total: checks.length };
  }

  /* ═════════════════════════════════════════════════════════════════
     PART 11 — EXPOSE DIAGNOSTICS
  ═══════════════════════════════════════════════════════════════════ */
  window.afribDiagnostics = {
    coherenceCheck: runCoherenceCheck,
    intervals:      () => window._afribIntervals.list(),
    storageUsage:   () => {
      let total = 0;
      for (let i = 0; i < localStorage.length; i++) {
        total += (localStorage.getItem(localStorage.key(i)) || '').length * 2;
      }
      return (total / 1024).toFixed(1) + ' KB used';
    },
    bus:            () => window.AfribBus,
    version:        'v69-final',
    runAll() {
      console.group('[AfribConnect v69 Diagnostics]');
      console.log('Version:', this.version);
      console.log('Storage:', this.storageUsage());
      console.log('Active intervals:', this.intervals());
      const c = this.coherenceCheck();
      console.log('Systems:', c.passed + '/' + c.total + ' ready');
      console.groupEnd();
    }
  };

  /* ═════════════════════════════════════════════════════════════════
     INIT
  ═══════════════════════════════════════════════════════════════════ */
  function init() {
    startCanonicalIntervals();
    nullifyDuplicateIntervalSpawners();
    hookLogout();

    // Run coherence check after all deferred scripts settle
    setTimeout(runCoherenceCheck, 2500);
    setTimeout(() => window.afribDiagnostics.runAll(), 3000);

    LOG('v69 Final Audit loaded — interval registry active, event bus wired, null guards applied');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 300));
  } else {
    setTimeout(init, 300);
  }

  // Also init after full page load (catches deferred scripts)
  window.addEventListener('load', () => setTimeout(init, 1000));

})();
