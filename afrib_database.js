/* ═══════════════════════════════════════════════════════════════════════════
   AfribConnect — MASTER INTEGRATION CONNECTOR
   afrib_connect_all.js  (load LAST — after all other scripts)

   PURPOSE: Ensures every module, screen, and feature is properly wired
   together as a single cohesive app. Fixes startup sequence, guards missing
   functions, connects landing → auth → app → screens, and self-tests on load.
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

(function AfribConnectAll() {

  /* ─────────────────────────────────────────────────────────────────────────
     §0  SAFE UTILITY
  ───────────────────────────────────────────────────────────────────────── */
  const $ = id => document.getElementById(id);
  const safeFn = (name, fallback) => {
    if (typeof window[name] === 'function') return window[name];
    console.warn('[AfribConnect] Missing function:', name, '— using fallback');
    return fallback || function() {};
  };
  const log = (...a) => console.log('%c[AfribConnect]', 'color:#D4AF37;font-weight:700', ...a);
  const warn = (...a) => console.warn('%c[AfribConnect]', 'color:#E85D26;font-weight:700', ...a);

  /* ─────────────────────────────────────────────────────────────────────────
     §1  CORE NAVIGATION — ensure all entry points work consistently
  ───────────────────────────────────────────────────────────────────────── */
  (function patchNavigation() {

    // Wrap showLanding to always clean up properly
    const _origShowLanding = window.showLanding;
    window.showLanding = function() {
      const app = $('app-shell');
      const landing = $('landing-page');
      const authOverlay = $('auth-overlay');
      if (app)         app.style.display     = 'none';
      if (landing)     landing.style.display  = 'block';
      if (authOverlay) authOverlay.style.display = 'none';
      document.body.style.overflow = '';
      window.scrollTo(0, 0);
      // Re-observe scroll animations on landing
      try {
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
          el.classList.remove('visible');
        });
        setTimeout(() => {
          const obs = new IntersectionObserver(entries => {
            entries.forEach(e => {
              if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
            });
          }, { threshold: 0.1 });
          document.querySelectorAll('.animate-on-scroll').forEach(el => obs.observe(el));
        }, 100);
      } catch(e) {}
    };

    // Wrap enterApp to ensure landing is hidden and app is shown consistently
    const _origEnterApp = window.enterApp;
    window.enterApp = function(screen) {
      const landing = $('landing-page');
      const app     = $('app-shell');
      const auth    = $('auth-overlay');
      if (landing) landing.style.display = 'none';
      if (app)     app.style.display     = 'block';
      if (auth)    auth.style.display    = 'none';
      document.body.style.overflow = '';
      window.scrollTo(0, 0);
      // Update UI with current user
      try { if (typeof updateAppUserUI === 'function') updateAppUserUI(); } catch(e) {}
      try { if (typeof initApp === 'function') initApp(); } catch(e) {}
      // Sync wallet on every entry
      try {
        if (window.currentUser) {
          window.walletBalance = window.currentUser.walletBalance || 0;
          if (typeof updateBalanceDisplay === 'function') updateBalanceDisplay();
        }
      } catch(e) {}
      // Navigate to requested screen
      const target = screen || 'home';
      try { if (typeof showScreen === 'function') showScreen(target); } catch(e) {}
    };

    // Wrap showScreen to validate screen exists before switching
    const _origShowScreen = window.showScreen;
    window.showScreen = function(name) {
      const screenEl = $('screen-' + name);
      if (!screenEl) {
        warn('showScreen: no screen found for "' + name + '"');
        // Fallback to home
        if (name !== 'home') { window.showScreen('home'); } return;
      }
      // Hide all screens, show target
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      document.querySelectorAll('.app-tab, .abn-item').forEach(b => {
        b.classList.toggle('active', b.dataset && b.dataset.screen === name);
      });
      screenEl.classList.add('active');
      window.scrollTo(0, 0);
      // Per-screen init
      _onScreenShown(name);
    };
    window.showScreen._master = true;

  })();

  /* ─────────────────────────────────────────────────────────────────────────
     §2  PER-SCREEN INIT HOOKS — ensures each screen loads its data
  ───────────────────────────────────────────────────────────────────────── */
  function _onScreenShown(name) {
    try {
      switch(name) {
        case 'home':
          if (typeof renderTrending    === 'function') renderTrending();
          if (typeof updateBalanceDisplay === 'function') updateBalanceDisplay();
          if (typeof renderHomeXP      === 'function') renderHomeXP();
          // Audit Fix: sync home profile card and notification badges
          if (typeof window._syncNotifBadges === 'function') window._syncNotifBadges();
          (function _renderHPC() {
            try {
              var u = window.currentUser;
              if (!u) return;
              var initials = ((u.first||'U')[0]+(u.last||'')[0]).toUpperCase();
              var hA=$('hpcAvatar'),hN=$('hpcName'),hU=$('hpcUsername'),hC=$('hpcCountry'),hR=$('hpcRole');
              var hAv=$('homeAvatar'),hAN=$('homeAvatarName');
              if(hA) hA.textContent=initials;
              if(hN) hN.textContent=((u.first||'')+' '+(u.last||'')).trim()||u.email;
              if(hU) hU.textContent=u.username?'@'+u.username:u.email.split('@')[0];
              if(hC) hC.textContent=u.country||'🌍 Africa';
              if(hR) hR.textContent=u.profession||u.role||'Member';
              if(hAv) hAv.textContent=initials;
              if(hAN) hAN.textContent=u.first||'You';
            } catch(e) {}
          })();
          break;
        case 'wallet':
          if (typeof initWalletScreen  === 'function') initWalletScreen();
          if (typeof updateBalanceDisplay === 'function') updateBalanceDisplay();
          break;
        case 'connect':
          if (typeof renderProfiles    === 'function') renderProfiles();
          break;
        case 'market':
          if (typeof renderProducts    === 'function') renderProducts();
          break;
        case 'hub':
          if (typeof renderLeaderboard === 'function') renderLeaderboard();
          if (typeof renderPhrases     === 'function') renderPhrases();
          if (typeof renderExchange    === 'function') renderExchange();
          if (typeof loadTrivia        === 'function') loadTrivia();
          break;
        case 'games':
          if (typeof showGamesLobby   === 'function') showGamesLobby();
          else if (typeof initGames   === 'function') initGames();
          break;
        case 'messages':
          if (typeof loadMessages     === 'function') loadMessages();
          break;
        case 'ai':
          // AI chat - no init needed
          break;
        case 'style':
          if (typeof renderStyleScreen === 'function') renderStyleScreen();
          break;
      }
    } catch(e) {
      warn('Screen init error for "' + name + '":', e.message);
    }
  }

  /* ─────────────────────────────────────────────────────────────────────────
     §3  AUTH FLOW — ensure login/signup/close all work correctly
  ───────────────────────────────────────────────────────────────────────── */
  (function patchAuth() {

    // Ensure showAuth always reveals the auth overlay properly
    const _origShowAuth = window.showAuth;
    window.showAuth = function(panel) {
      const overlay = $('auth-overlay');
      if (overlay) overlay.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      // Switch panels
      ['login','signup','forgot'].forEach(p => {
        const el = $('auth-' + p);
        if (el) el.style.display = (p === panel) ? 'block' : 'none';
      });
      // Focus first input
      setTimeout(() => {
        const input = overlay?.querySelector('input:not([type=hidden])');
        if (input) { try { input.focus(); } catch(e) {} }
      }, 100);
    };

    // Ensure closeAuth always cleans up
    const _origCloseAuth = window.closeAuth;
    window.closeAuth = function() {
      const overlay = $('auth-overlay');
      if (overlay) overlay.style.display = 'none';
      document.body.style.overflow = '';
    };

    // After successful login: consume pending screen
    const _origEnterAppAsUser = window.enterAppAsUser;
    window.enterAppAsUser = function() {
      const pending = window._pendingScreen;
      window._pendingScreen = null;
      window.closeAuth();
      window.enterApp(pending || undefined);
    };

  })();

  /* ─────────────────────────────────────────────────────────────────────────
     §4  LANDING PAGE INTERACTIONS — connect all new hero UI actions
  ───────────────────────────────────────────────────────────────────────── */
  (function bindLandingInteractions() {

    // Phone app tiles in hero — clicking any tile goes to signup → that screen
    document.querySelectorAll('.phone-app').forEach(tile => {
      tile.addEventListener('click', e => {
        e.stopPropagation();
        const label = tile.querySelector('.phone-app-label')?.textContent?.toLowerCase() || '';
        const screenMap = {
          'connect': 'connect', 'market': 'market', 'wallet': 'wallet',
          'ai': 'ai', 'games': 'games', 'messages': 'messages',
          'giftme': 'hub', 'yourstyle': 'style', 'secure': 'home'
        };
        window._pendingScreen = screenMap[label] || null;
        window.showAuth('signup');
      });
    });

    // Bento feature cards — connect to requireAuth
    document.querySelectorAll('.bento-card').forEach(card => {
      if (!card.getAttribute('onclick')) {
        card.style.cursor = 'default';
      }
    });

    // Scroll indicator — smooth scroll to features
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
      scrollIndicator.style.cursor = 'pointer';
      scrollIndicator.addEventListener('click', () => {
        const features = document.getElementById('features');
        if (features) features.scrollIntoView({ behavior: 'smooth' });
      });
    }

    // Marquee strip — pause on hover
    const marqueeTrack = document.querySelector('.marquee-track');
    const marqueeStrip = document.querySelector('.marquee-strip');
    if (marqueeTrack && marqueeStrip) {
      marqueeStrip.addEventListener('mouseenter', () => {
        marqueeTrack.style.animationPlayState = 'paused';
      });
      marqueeStrip.addEventListener('mouseleave', () => {
        marqueeTrack.style.animationPlayState = 'running';
      });
    }

    // Flag items in community section — tooltip on hover
    document.querySelectorAll('.flag-item').forEach(flag => {
      flag.title = 'AfriBConnect is available here';
    });

    // Stats counter animation — animate numbers when visible
    const statsBlocks = document.querySelectorAll('.stat-block-num, .hm-number');
    if (statsBlocks.length) {
      const statsObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          const el = e.target;
          const rawText = el.textContent.trim();
          const numMatch = rawText.match(/\d+/);
          if (!numMatch) return;
          const target = parseInt(numMatch[0]);
          const suffix = rawText.replace(/\d+/, '');
          let current = 0;
          const step = Math.ceil(target / 40);
          const timer = setInterval(() => {
            current = Math.min(current + step, target);
            el.textContent = current + suffix;
            if (current >= target) clearInterval(timer);
          }, 30);
          statsObs.unobserve(el);
        });
      }, { threshold: 0.5 });
      statsBlocks.forEach(el => {
        const raw = el.textContent.trim();
        if (/^\d/.test(raw)) statsObs.observe(el);
      });
    }

  })();

  /* ─────────────────────────────────────────────────────────────────────────
     §5  GLOBAL TOAST — ensure showToast works everywhere
  ───────────────────────────────────────────────────────────────────────── */
  (function ensureToast() {
    if (typeof window.showToast === 'function') return;
    window.showToast = function(msg, type, duration) {
      const toast = $('toast') || (() => {
        const t = document.createElement('div');
        t.id = 'toast';
        t.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%) translateY(20px);background:rgba(13,10,20,.95);color:#fff;padding:12px 24px;border-radius:100px;font-size:14px;font-weight:600;z-index:9999;opacity:0;transition:all .3s;pointer-events:none;border:1px solid rgba(212,175,55,.25);white-space:nowrap;max-width:90vw;text-align:center;backdrop-filter:blur(12px)';
        document.body.appendChild(t);
        return t;
      })();
      toast.textContent = msg;
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
      if (type === 'error') { toast.style.borderColor = 'rgba(232,93,38,.4)'; toast.style.color = '#ff8866'; }
      else if (type === 'success') { toast.style.borderColor = 'rgba(0,184,122,.4)'; toast.style.color = '#4ade80'; }
      else { toast.style.borderColor = 'rgba(212,175,55,.25)'; toast.style.color = '#fff'; }
      clearTimeout(toast._timer);
      toast._timer = setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
      }, duration || 3000);
    };
  })();

  /* ─────────────────────────────────────────────────────────────────────────
     §6  GLOBAL ERROR HANDLER — catch and surface JS errors gracefully
  ───────────────────────────────────────────────────────────────────────── */
  (function globalErrorHandler() {
    window.addEventListener('error', function(event) {
      // Only log — never let errors crash the app visually
      console.error('[AfribConnect] Runtime error:', event.message, 'in', event.filename, 'line', event.lineno);
      // Don't show toast for minor errors — only for critical ones
    });
    window.addEventListener('unhandledrejection', function(event) {
      console.error('[AfribConnect] Unhandled promise rejection:', event.reason);
      event.preventDefault(); // prevent console noise
    });
  })();

  /* ─────────────────────────────────────────────────────────────────────────
     §7  SESSION GUARD — auto-restore session on page load
  ───────────────────────────────────────────────────────────────────────── */
  (function sessionGuard() {
    // If user is already logged in (session in localStorage) and hits the page,
    // go straight to app. Otherwise show landing.
    const session = (() => {
      try { return JSON.parse(localStorage.getItem('afrib_session') || 'null'); } catch(e) { return null; }
    })();

    if (session && session.email) {
      // Valid session - check if app-shell is visible already (script.js may have done this)
      const app = $('app-shell');
      const landing = $('landing-page');
      if (app && app.style.display !== 'none') {
        // Already in app - just sync
        try { window.currentUser = session; } catch(e) {}
        log('Session restored for', session.first || session.email);
      } else if (landing && landing.style.display !== 'none') {
        // Still on landing - skip to app
        try { window.currentUser = session; } catch(e) {}
        setTimeout(() => {
          if (typeof window.enterApp === 'function') window.enterApp();
        }, 0);
      }
    }
  })();

  /* ─────────────────────────────────────────────────────────────────────────
     §8  NAVBAR — scroll handler + mobile menu (guard if already attached)
  ───────────────────────────────────────────────────────────────────────── */
  (function ensureNavbar() {
    const navbar = $('navbar');
    const hamburger = $('hamburger');
    const mobileMenu = $('mobileMenu');

    if (navbar && !navbar._scrollBound) {
      navbar._scrollBound = true;
      window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 40);
      }, { passive: true });
    }

    if (hamburger && mobileMenu && !hamburger._clickBound) {
      hamburger._clickBound = true;
      hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        mobileMenu.classList.toggle('open');
      });
      mobileMenu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          hamburger.classList.remove('open');
          mobileMenu.classList.remove('open');
        });
      });
    }
  })();

  /* ─────────────────────────────────────────────────────────────────────────
     §9  SCROLL ANIMATIONS — re-initialize for landing page elements
  ───────────────────────────────────────────────────────────────────────── */
  (function ensureScrollAnimations() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: make everything visible
      document.querySelectorAll('.animate-on-scroll').forEach(el => el.classList.add('visible'));
      return;
    }
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.animate-on-scroll:not(.visible)').forEach(el => obs.observe(el));
  })();

  /* ─────────────────────────────────────────────────────────────────────────
     §10  SERVICE WORKER — register and update
  ───────────────────────────────────────────────────────────────────────── */
  (function registerSW() {
    if (!('serviceWorker' in navigator)) return;
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js', { scope: './' })
        .then(reg => {
          log('Service worker registered ✅');
          // Check for updates
          reg.addEventListener('updatefound', () => {
            const newSW = reg.installing;
            newSW.addEventListener('statechange', () => {
              if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                log('App update available — will refresh on next load');
              }
            });
          });
        })
        .catch(e => warn('Service worker registration failed:', e.message));
    });
  })();

  /* ─────────────────────────────────────────────────────────────────────────
     §11  KEYBOARD SHORTCUTS
  ───────────────────────────────────────────────────────────────────────── */
  (function keyboardShortcuts() {
    document.addEventListener('keydown', e => {
      // ESC closes auth overlay
      if (e.key === 'Escape') {
        const authOverlay = $('auth-overlay');
        if (authOverlay && authOverlay.style.display !== 'none') {
          if (typeof window.closeAuth === 'function') window.closeAuth();
        }
      }
      // Alt+H → home screen (when in app)
      if (e.altKey && e.key === 'h') {
        const app = $('app-shell');
        if (app && app.style.display !== 'none') {
          if (typeof window.showScreen === 'function') window.showScreen('home');
        }
      }
    });
  })();

  /* ─────────────────────────────────────────────────────────────────────────
     §12  EMAILJS PLACEHOLDER WARNING
  ───────────────────────────────────────────────────────────────────────── */
  (function checkEmailJS() {
    try {
      const adminSettings = JSON.parse(localStorage.getItem('afrib_admin_settings') || '{}');
      const hasEmailJS = adminSettings.ejs_publicKey && adminSettings.ejs_publicKey !== 'YOUR_PUBLIC_KEY';
      if (!hasEmailJS) {
        log('ℹ️  EmailJS not configured — email features will use fallback mode. Configure in admin.html → Email Settings.');
      }
    } catch(e) {}
  })();

  /* ─────────────────────────────────────────────────────────────────────────
     §13  CONNECTIVITY — detect online/offline and notify user
  ───────────────────────────────────────────────────────────────────────── */
  (function connectivityMonitor() {
    function updateOnlineStatus() {
      const isOnline = navigator.onLine;
      const existingBanner = $('afrib-offline-banner');
      if (!isOnline) {
        if (!existingBanner) {
          const banner = document.createElement('div');
          banner.id = 'afrib-offline-banner';
          banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#1a0a00;border-bottom:1px solid rgba(232,93,38,.4);color:rgba(255,255,255,.7);text-align:center;padding:8px 16px;font-size:13px;font-weight:500;font-family:system-ui,sans-serif';
          banner.textContent = '⚡ You\'re offline — some features may not be available';
          document.body.prepend(banner);
        }
      } else {
        if (existingBanner) existingBanner.remove();
        if (typeof window.showToast === 'function') {
          // Only show "back online" if we were offline
          if (window._wasOffline) window.showToast('✅ Back online!', 'success');
        }
        window._wasOffline = false;
      }
      if (!isOnline) window._wasOffline = true;
    }
    window.addEventListener('online',  updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus(); // Check on load
  })();

  /* ─────────────────────────────────────────────────────────────────────────
     §14  APP READINESS SELF-TEST — run after all scripts load
  ───────────────────────────────────────────────────────────────────────── */
  function runSelfTest() {
    const checks = [
      ['showLanding',         typeof window.showLanding         === 'function'],
      ['showAuth',            typeof window.showAuth            === 'function'],
      ['closeAuth',           typeof window.closeAuth           === 'function'],
      ['enterApp',            typeof window.enterApp            === 'function'],
      ['showScreen',          typeof window.showScreen          === 'function'],
      ['requireAuth',         typeof window.requireAuth         === 'function'],
      ['doLogin',             typeof window.doLogin             === 'function'],
      ['doSignup',            typeof window.doSignup            === 'function'],
      ['doLogout',            typeof window.doLogout            === 'function'],
      ['showToast',           typeof window.showToast           === 'function'],
      ['screen-home',         !!$('screen-home')],
      ['screen-wallet',       !!$('screen-wallet')],
      ['screen-connect',      !!$('screen-connect')],
      ['screen-market',       !!$('screen-market')],
      ['screen-games',        !!$('screen-games')],
      ['screen-messages',     !!$('screen-messages')],
      ['screen-hub',          !!$('screen-hub')],
      ['screen-ai',           !!$('screen-ai')],
      ['landing-page',        !!$('landing-page')],
      ['app-shell',           !!$('app-shell')],
      ['auth-overlay',        !!$('auth-overlay')],
    ];

    let passed = 0, failed = 0;
    const failures = [];
    checks.forEach(([name, ok]) => {
      if (ok) passed++;
      else { failed++; failures.push(name); }
    });

    const pct = Math.round((passed / checks.length) * 100);
    if (failed === 0) {
      log(`✅ Self-test PASSED — ${passed}/${checks.length} checks OK (${pct}%)`);
    } else {
      warn(`⚠️  Self-test: ${passed}/${checks.length} passed — FAILED: ${failures.join(', ')}`);
    }
    return { passed, failed, total: checks.length };
  }

  // Run self-test after DOM and all deferred scripts are ready
  if (document.readyState === 'complete') {
    setTimeout(runSelfTest, 200);
  } else {
    window.addEventListener('load', () => setTimeout(runSelfTest, 200));
  }

  log('🔗 Master integration connector loaded ✅');

})();
