/* ═══════════════════════════════════════════════════════════════════════════
   AfribConnect — PWA ENHANCEMENTS  (afrib_pwa_enhancements.js)
   2025 Super App Best Practices

   Features:
   ① SW Update Notification  — "New version available, tap to update"
   ② Install Prompt Banner   — Smart A2HS prompt at the right time
   ③ Biometric Auth Detection — WebAuthn capability check + future hook
   ④ Share API Integration   — Native sharing on mobile
   ⑤ Badge API               — Notification count on app icon (Android/iOS)
   ⑥ Network Quality Monitor — Adapt UI for slow connections
   ⑦ Wake Lock API           — Prevent screen sleep during games
   ⑧ Clipboard API           — Secure copy for wallet addresses
   ⑨ Haptic Feedback         — Vibration on key interactions
   ⑩ Deep Link Handler       — Handle ?screen= URL params on launch
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

(function AfribPWA() {

  const log  = (...a) => console.log('%c[PWA]','color:#8b5cf6;font-weight:700',...a);
  const warn = (...a) => console.warn('%c[PWA]','color:#f97316;font-weight:700',...a);

  /* ─────────────────────────────────────────────────────────────────
     §1  SERVICE WORKER UPDATE NOTIFICATION
  ───────────────────────────────────────────────────────────────────*/
  function initSWUpdateNotification() {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.ready.then(reg => {
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version is ready — show update banner
            _showUpdateBanner(newWorker);
          }
        });
      });
    }).catch(() => {});

    // Listen for controller change (new SW activated)
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) { refreshing = true; window.location.reload(); }
    });
  }

  function _showUpdateBanner(newWorker) {
    if (document.getElementById('afrib-update-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'afrib-update-banner';
    banner.style.cssText = [
      'position:fixed;bottom:80px;left:50%;transform:translateX(-50%)',
      'z-index:10000;background:linear-gradient(135deg,#1a0a00,#2d1500)',
      'border:1px solid rgba(212,175,55,.4);border-radius:14px',
      'padding:12px 18px;display:flex;align-items:center;gap:12px',
      'box-shadow:0 8px 32px rgba(0,0,0,.5);min-width:280px;max-width:90vw',
      'animation:slideUp .3s ease'
    ].join(';');

    banner.innerHTML = `
      <span style="font-size:20px">🚀</span>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:700;color:#fff">Update Available</div>
        <div style="font-size:11px;color:rgba(255,255,255,.55)">New version of AfriBConnect is ready</div>
      </div>
      <button id="afrib-update-btn" style="background:linear-gradient(135deg,#D4AF37,#b8860b);color:#000;border:none;border-radius:8px;padding:7px 14px;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap">
        Update Now
      </button>
      <button onclick="this.parentElement.remove()" style="background:none;border:none;color:rgba(255,255,255,.4);cursor:pointer;font-size:18px;padding:0 4px">✕</button>
    `;

    // Add slideUp animation if not present
    if (!document.getElementById('afrib-pwa-css')) {
      const style = document.createElement('style');
      style.id = 'afrib-pwa-css';
      style.textContent = `
        @keyframes slideUp { from { transform: translateX(-50%) translateY(20px); opacity:0; } to { transform: translateX(-50%) translateY(0); opacity:1; } }
        @keyframes slideDown2 { from { transform: translateY(-100%); } to { transform: translateY(0); } }
        #afrib-install-banner { animation: slideDown2 .3s ease; }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(banner);

    document.getElementById('afrib-update-btn').addEventListener('click', () => {
      newWorker.postMessage({ type: 'SKIP_WAITING' });
      banner.remove();
    });

    // Auto-dismiss after 30 seconds
    setTimeout(() => { if (banner.parentElement) banner.remove(); }, 30000);
    log('Update banner shown');
  }

  /* ─────────────────────────────────────────────────────────────────
     §2  INSTALL PROMPT (Add to Home Screen)
  ───────────────────────────────────────────────────────────────────*/
  let _deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    _deferredPrompt = e;

    // Show install banner after user has been on the app for 30 seconds
    // and hasn't dismissed it before
    const dismissed = localStorage.getItem('afrib_install_dismissed');
    if (!dismissed) {
      setTimeout(() => _showInstallBanner(), 30000);
    }
    log('Install prompt captured');
  });

  function _showInstallBanner() {
    if (!_deferredPrompt || document.getElementById('afrib-install-banner')) return;
    // Only show if user is logged in and on home screen
    if (!window.currentUser) return;

    const banner = document.createElement('div');
    banner.id = 'afrib-install-banner';
    banner.style.cssText = [
      'position:fixed;top:0;left:0;right:0;z-index:9998',
      'background:linear-gradient(135deg,#13091f,#1e1000)',
      'border-bottom:1px solid rgba(212,175,55,.3)',
      'padding:10px 16px;display:flex;align-items:center;gap:12px',
    ].join(';');

    banner.innerHTML = `
      <img src="icon-192.png" style="width:36px;height:36px;border-radius:8px" alt="AfriBConnect"/>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:700;color:#fff">Add to Home Screen</div>
        <div style="font-size:11px;color:rgba(255,255,255,.5)">Fast access to AfriBConnect</div>
      </div>
      <button id="afrib-install-btn" style="background:linear-gradient(135deg,#D4AF37,#b8860b);color:#000;border:none;border-radius:8px;padding:7px 14px;font-size:12px;font-weight:700;cursor:pointer">
        Install
      </button>
      <button id="afrib-install-dismiss" style="background:none;border:none;color:rgba(255,255,255,.4);cursor:pointer;font-size:18px;padding:0 6px">✕</button>
    `;

    document.body.prepend(banner);

    document.getElementById('afrib-install-btn').addEventListener('click', async () => {
      if (!_deferredPrompt) return;
      _deferredPrompt.prompt();
      const { outcome } = await _deferredPrompt.userChoice;
      log('Install prompt outcome:', outcome);
      _deferredPrompt = null;
      banner.remove();
      if (outcome === 'accepted' && typeof window.showToast === 'function') {
        window.showToast('🎉 AfriBConnect installed! Check your home screen.');
      }
    });

    document.getElementById('afrib-install-dismiss').addEventListener('click', () => {
      localStorage.setItem('afrib_install_dismissed', Date.now());
      banner.remove();
    });
  }

  window.addEventListener('appinstalled', () => {
    log('App installed successfully');
    _deferredPrompt = null;
    if (typeof window.showToast === 'function') {
      window.showToast('✅ AfriBConnect installed on your device!');
    }
  });

  /* ─────────────────────────────────────────────────────────────────
     §3  BIOMETRIC AUTH DETECTION (WebAuthn)
  ───────────────────────────────────────────────────────────────────*/
  window.AfribPWA = window.AfribPWA || {};

  window.AfribPWA.canUseBiometrics = async function() {
    try {
      if (!window.PublicKeyCredential) return false;
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch(e) { return false; }
  };

  // Check and show biometric login option in auth modal
  async function checkBiometricAvailability() {
    const canBio = await window.AfribPWA.canUseBiometrics();
    if (!canBio) return;

    // Store that this device supports biometrics
    localStorage.setItem('afrib_biometric_available', '1');
    log('Biometric authentication available on this device');
  }

  /* ─────────────────────────────────────────────────────────────────
     §4  SHARE API INTEGRATION
  ───────────────────────────────────────────────────────────────────*/
  window.AfribPWA.share = async function({ title, text, url }) {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        log('Shared via Web Share API');
        return true;
      } catch(e) {
        if (e.name !== 'AbortError') warn('Share failed:', e.message);
        return false;
      }
    }
    // Fallback: copy to clipboard
    return window.AfribPWA.copyToClipboard(url || text);
  };

  // Patch shareApp to use native sharing
  (function patchShareApp() {
    const _hook = () => {
      const orig = window.shareApp;
      if (typeof orig !== 'function') { setTimeout(_hook, 400); return; }
      if (orig._pwaPatched) return;
      window.shareApp = async function(platform) {
        if (platform === 'copy' || !navigator.share) {
          orig.apply(this, arguments);
          return;
        }
        const appUrl = window.location.origin;
        const shared = await window.AfribPWA.share({
          title: 'AfriBConnect — Africa\'s Super App',
          text: 'Join me on AfriBConnect! Connect with Africans globally, send money, play games and more.',
          url: appUrl,
        });
        if (!shared) orig.apply(this, arguments); // fallback
      };
      window.shareApp._pwaPatched = true;
    };
    _hook();
  })();

  /* ─────────────────────────────────────────────────────────────────
     §5  BADGE API (App Icon Notification Count)
  ───────────────────────────────────────────────────────────────────*/
  window.AfribPWA.setBadge = async function(count) {
    try {
      if ('setAppBadge' in navigator) {
        if (count > 0) {
          await navigator.setAppBadge(count);
        } else {
          await navigator.clearAppBadge();
        }
      }
    } catch(e) {}
  };

  // Sync badge with notification count
  function syncAppBadge() {
    try {
      const notifs = JSON.parse(localStorage.getItem('afrib_notifications') || '[]');
      const unread = notifs.filter(n => !n.read).length;
      window.AfribPWA.setBadge(unread);
    } catch(e) {}
  }

  setInterval(syncAppBadge, 30000);
  window.addEventListener('storage', e => {
    if (e.key === 'afrib_notifications') syncAppBadge();
  });

  /* ─────────────────────────────────────────────────────────────────
     §6  NETWORK QUALITY MONITOR
  ───────────────────────────────────────────────────────────────────*/
  window.AfribPWA.networkQuality = 'good';

  function monitorNetworkQuality() {
    if (!navigator.connection) return;

    function update() {
      const conn = navigator.connection;
      const rtt  = conn.rtt || 0;
      const type = conn.effectiveType || '4g';

      if (type === '2g' || rtt > 1000) {
        window.AfribPWA.networkQuality = 'poor';
        document.body.classList.add('slow-network');
      } else if (type === '3g' || rtt > 300) {
        window.AfribPWA.networkQuality = 'fair';
        document.body.classList.remove('slow-network');
      } else {
        window.AfribPWA.networkQuality = 'good';
        document.body.classList.remove('slow-network');
      }
      log('Network quality:', window.AfribPWA.networkQuality, `(${type}, RTT:${rtt}ms)`);
    }

    update();
    navigator.connection.addEventListener('change', update);
  }

  /* ─────────────────────────────────────────────────────────────────
     §7  WAKE LOCK (Prevent sleep during games)
  ───────────────────────────────────────────────────────────────────*/
  let _wakeLock = null;

  window.AfribPWA.requestWakeLock = async function() {
    try {
      if (!('wakeLock' in navigator)) return false;
      _wakeLock = await navigator.wakeLock.request('screen');
      log('Wake lock acquired');
      _wakeLock.addEventListener('release', () => { _wakeLock = null; });
      return true;
    } catch(e) { return false; }
  };

  window.AfribPWA.releaseWakeLock = async function() {
    try { if (_wakeLock) { await _wakeLock.release(); _wakeLock = null; } } catch(e) {}
  };

  // Auto-request wake lock during Ludo/Snake/DrinkUp games
  (function patchGameWakeLock() {
    const _hook = () => {
      const startFns = ['startLudo','startSnakeGame','duStartGame'];
      const endFns   = ['exitLudo','exitSnake','duConfirmExit'];

      startFns.forEach(fn => {
        const orig = window[fn];
        if (typeof orig !== 'function' || orig._wakeLocked) return;
        window[fn] = function() {
          window.AfribPWA.requestWakeLock();
          return orig.apply(this, arguments);
        };
        window[fn]._wakeLocked = true;
      });

      endFns.forEach(fn => {
        const orig = window[fn];
        if (typeof orig !== 'function' || orig._wakeLocked) return;
        window[fn] = function() {
          window.AfribPWA.releaseWakeLock();
          return orig.apply(this, arguments);
        };
        window[fn]._wakeLocked = true;
      });
    };
    setTimeout(_hook, 1500);
  })();

  /* ─────────────────────────────────────────────────────────────────
     §8  SECURE CLIPBOARD API
  ───────────────────────────────────────────────────────────────────*/
  window.AfribPWA.copyToClipboard = async function(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for non-secure contexts
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      if (typeof window.showToast === 'function') window.showToast('📋 Copied!');
      return true;
    } catch(e) {
      warn('Clipboard copy failed:', e.message);
      return false;
    }
  };

  /* ─────────────────────────────────────────────────────────────────
     §9  HAPTIC FEEDBACK
  ───────────────────────────────────────────────────────────────────*/
  window.AfribPWA.vibrate = function(pattern) {
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(pattern || 50);
      }
    } catch(e) {}
  };

  // Add haptic to key actions
  (function addHaptics() {
    // Vibrate on game dice roll
    document.addEventListener('click', e => {
      const btn = e.target.closest('button, .hq-card, .hgs-card, .abn-item');
      if (!btn) return;
      // Light tap
      if (btn.classList.contains('abn-item') || btn.classList.contains('hq-card')) {
        window.AfribPWA.vibrate(30);
      }
    }, { passive: true });
  })();

  /* ─────────────────────────────────────────────────────────────────
     §10  DEEP LINK HANDLER (?screen=wallet, ?open=notifications, etc.)
  ───────────────────────────────────────────────────────────────────*/
  function handleDeepLink() {
    const params = new URLSearchParams(window.location.search);
    const screen = params.get('screen');
    const open   = params.get('open');

    if (!screen && !open) return;

    // Wait for app to be ready
    const _tryNavigate = (attempts) => {
      if (attempts > 20) return;
      if (!window.currentUser || !window.enterApp) {
        setTimeout(() => _tryNavigate(attempts + 1), 500);
        return;
      }
      if (screen && typeof window.showScreen === 'function') {
        window.showScreen(screen);
        log('Deep link → screen:', screen);
      }
      if (open === 'notifications' && typeof window.toggleNotifPanel === 'function') {
        setTimeout(() => window.toggleNotifPanel(), 300);
      }
      if (open === 'profile' && typeof window.showProfileModal === 'function') {
        setTimeout(() => window.showProfileModal(), 300);
      }
      // Clean URL after handling
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
    };
    _tryNavigate(0);
  }

  /* ─────────────────────────────────────────────────────────────────
     §11  CSS FOR SLOW NETWORK
  ───────────────────────────────────────────────────────────────────*/
  const networkCSS = document.createElement('style');
  networkCSS.textContent = `
    /* Reduce animations on slow networks */
    .slow-network * { animation-duration: 0.1s !important; transition-duration: 0.1s !important; }
    .slow-network .home-hero-banner::before,
    .slow-network .hhb-orb { display: none !important; }
  `;
  document.head.appendChild(networkCSS);

  /* ─────────────────────────────────────────────────────────────────
     §12  BOOT
  ───────────────────────────────────────────────────────────────────*/
  function boot() {
    initSWUpdateNotification();
    checkBiometricAvailability();
    monitorNetworkQuality();
    handleDeepLink();
    syncAppBadge();
    log('✅ PWA Enhancements active — SW updates, install prompt, badge API, wake lock, haptics, deep links');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
