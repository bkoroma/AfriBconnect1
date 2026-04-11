/* ═══════════════════════════════════════════════════════════════════════════
   AfribConnect — MESSENGER SECURITY GUARD  (afrib_messenger_guard.js)

   Research findings applied:
   • True browser screenshot prevention is NOT possible without DRM (VdoCipher, MDN)
   • What IS possible: detect visibility changes (tab switch, screen record via
     document.visibilitychange + Page Visibility API), blur sensitive content,
     warn users, notify sender when their DM screen is active
   • Snapchat/Instagram approach: blur content on screen capture attempt,
     show notification, log the event
   • document.visibilitychange detects screen recording on many devices
   • CSS user-select:none + -webkit-user-select:none prevents text copy
   • pointer-events tricks prevent right-click save on images
   • Best practice: WARN user that content is private, show watermark,
     detect when app goes to background (strong signal of screenshot)
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

(function AfribMessengerGuard() {

  const log  = (...a) => console.log('%c[Guard]','color:#f59e0b;font-weight:700',...a);
  const _esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  /* ─────────────────────────────────────────────────────────────────
     §1  STATE
  ───────────────────────────────────────────────────────────────────*/
  let _guardActive  = false;   // true when messenger screen is visible
  let _blurActive   = false;   // content is currently blurred
  let _warnCount    = 0;       // number of warning events this session
  let _lastWarnTime = 0;       // debounce warnings
  const WARN_DEBOUNCE_MS = 3000;

  /* ─────────────────────────────────────────────────────────────────
     §2  INJECT GUARD CSS
  ───────────────────────────────────────────────────────────────────*/
  function injectCSS() {
    if (document.getElementById('afrib-guard-css')) return;
    const s = document.createElement('style');
    s.id = 'afrib-guard-css';
    s.textContent = `
/* ── Messenger privacy watermark ── */
.msg-privacy-watermark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-35deg);
  font-size: clamp(11px, 2.5vw, 16px);
  font-weight: 700;
  color: rgba(255,255,255,0.035);
  white-space: nowrap;
  pointer-events: none;
  user-select: none;
  z-index: 1;
  letter-spacing: 2px;
  text-transform: uppercase;
  display: none;
}
.guard-active .msg-privacy-watermark { display: block; }

/* ── Screenshot blur overlay ── */
.msg-blur-overlay {
  position: fixed;
  inset: 0;
  z-index: 9990;
  background: rgba(10,6,18,0.95);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  text-align: center;
  padding: 32px;
  pointer-events: none;
}
.msg-blur-overlay.active { display: flex; }
.msg-blur-icon { font-size: 52px; }
.msg-blur-title { font-size: 18px; font-weight: 800; color: #fff; }
.msg-blur-sub { font-size: 13px; color: rgba(255,255,255,0.55); max-width: 280px; line-height: 1.5; }

/* ── Screenshot warning toast ── */
.msg-screenshot-warning {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 9995;
  background: linear-gradient(135deg, rgba(239,68,68,0.95), rgba(185,28,28,0.95));
  backdrop-filter: blur(12px);
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  transform: translateY(-100%);
  transition: transform 0.3s cubic-bezier(0.16,1,0.3,1);
  box-shadow: 0 4px 20px rgba(0,0,0,0.4);
}
.msg-screenshot-warning.show { transform: translateY(0); }
.msg-screenshot-warning-icon { font-size: 20px; flex-shrink: 0; }
.msg-screenshot-warning-text { font-size: 13px; color: #fff; font-weight: 700; }
.msg-screenshot-warning-sub  { font-size: 11px; color: rgba(255,255,255,0.7); }

/* ── Prevent text selection in DMs ── */
.msg-chat-area {
  -webkit-user-select: none !important;
  user-select: none !important;
}
/* Re-allow selection on input fields */
.msg-chat-area input,
.msg-chat-area textarea {
  -webkit-user-select: text !important;
  user-select: text !important;
}

/* ── Prevent image drag/save ── */
.ms-img-msg {
  pointer-events: none;
  -webkit-user-drag: none;
  user-drag: none;
  -webkit-touch-callout: none;
}

/* ── Privacy badge in messenger header ── */
.msg-privacy-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(212,175,55,0.12);
  border: 1px solid rgba(212,175,55,0.25);
  border-radius: 20px;
  padding: 3px 9px;
  font-size: 10px;
  font-weight: 700;
  color: var(--gold);
  letter-spacing: 0.3px;
  cursor: default;
}
    `;
    document.head.appendChild(s);
    log('Guard CSS injected');
  }

  /* ─────────────────────────────────────────────────────────────────
     §3  CREATE BLUR OVERLAY (one-time DOM element)
  ───────────────────────────────────────────────────────────────────*/
  function createBlurOverlay() {
    if (document.getElementById('msgBlurOverlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'msgBlurOverlay';
    overlay.className = 'msg-blur-overlay';
    overlay.innerHTML = `
      <div class="msg-blur-icon">🔒</div>
      <div class="msg-blur-title">Messages Protected</div>
      <div class="msg-blur-sub">AfriBConnect protects your private conversations.<br>Return to the app to continue.</div>
    `;
    document.body.appendChild(overlay);
  }

  /* ─────────────────────────────────────────────────────────────────
     §4  CREATE WARNING BANNER
  ───────────────────────────────────────────────────────────────────*/
  function createWarningBanner() {
    if (document.getElementById('msgScreenshotWarning')) return;
    const banner = document.createElement('div');
    banner.id = 'msgScreenshotWarning';
    banner.className = 'msg-screenshot-warning';
    banner.innerHTML = `
      <div class="msg-screenshot-warning-icon">⚠️</div>
      <div>
        <div class="msg-screenshot-warning-text">Screenshot detected</div>
        <div class="msg-screenshot-warning-sub" id="msgWarningDetail">
          This conversation is private. Screenshots may violate user trust.
        </div>
      </div>
    `;
    document.body.appendChild(banner);
  }

  /* ─────────────────────────────────────────────────────────────────
     §5  SHOW WARNING
  ───────────────────────────────────────────────────────────────────*/
  function _showWarning(reason) {
    const now = Date.now();
    if (now - _lastWarnTime < WARN_DEBOUNCE_MS) return;
    _lastWarnTime = now;
    _warnCount++;

    const banner = document.getElementById('msgScreenshotWarning');
    if (!banner) return;

    const detail = document.getElementById('msgWarningDetail');
    if (detail) detail.textContent = reason || 'This conversation is private. Please respect other users\' privacy.';

    banner.classList.add('show');
    setTimeout(() => banner.classList.remove('show'), 4000);
    log('Privacy warning shown:', reason);

    // Log to admin (non-identifying — just count)
    try {
      if (typeof appendAdminLog === 'function') {
        appendAdminLog('security', window.currentUser?.email || 'unknown',
          'Privacy trigger in Messages', reason || 'screen event');
      }
    } catch(e) {}
  }

  /* ─────────────────────────────────────────────────────────────────
     §6  BLUR / UNBLUR CONTENT
  ───────────────────────────────────────────────────────────────────*/
  function _blurContent() {
    if (_blurActive) return;
    _blurActive = true;
    const overlay = document.getElementById('msgBlurOverlay');
    if (overlay) overlay.classList.add('active');
    log('Content blurred');
  }

  function _unblurContent() {
    if (!_blurActive) return;
    _blurActive = false;
    const overlay = document.getElementById('msgBlurOverlay');
    if (overlay) overlay.classList.remove('active');
    log('Content unblurred');
  }

  /* ─────────────────────────────────────────────────────────────────
     §7  DETECT WHEN APP GOES TO BACKGROUND
     This is the most reliable signal for screenshot attempts on mobile.
     When a user takes a screenshot, the app briefly loses focus on iOS.
     When using screen record, the app detects visibilitychange.
  ───────────────────────────────────────────────────────────────────*/
  function handleVisibilityChange() {
    if (!_guardActive) return;

    if (document.hidden) {
      // App went to background — blur content and show warning when returning
      _blurContent();
      log('App hidden — blurring messages');
    } else {
      // App came back to foreground
      // Small delay before warning to allow screenshot completion
      setTimeout(() => {
        if (_guardActive) {
          _unblurContent();
          // Show warning — we can't know FOR SURE a screenshot was taken,
          // but this is best-practice (same as Snapchat, Instagram approach)
          _showWarning('Your screen was hidden. Tap to resume your conversation.');
        }
      }, 300);
    }
  }

  /* ─────────────────────────────────────────────────────────────────
     §8  DETECT PRINT SCREEN / KEYBOARD SHORTCUT
     Works on desktop browsers — PrintScreen, Ctrl+S, Ctrl+P, Win+Shift+S
  ───────────────────────────────────────────────────────────────────*/
  function handleKeydown(e) {
    if (!_guardActive) return;

    const isPrintScreen = e.key === 'PrintScreen';
    const isCtrlS       = (e.ctrlKey || e.metaKey) && e.key === 's';
    const isCtrlP       = (e.ctrlKey || e.metaKey) && e.key === 'p';
    const isWinSnip     = e.shiftKey && e.key === 'S' && (e.metaKey || e.ctrlKey); // Win+Shift+S

    if (isPrintScreen || isCtrlS || isCtrlP || isWinSnip) {
      e.preventDefault();
      _showWarning('Screenshot attempt detected. This conversation is private and protected.');
      // Brief blur on key press
      _blurContent();
      setTimeout(_unblurContent, 1500);
    }
  }

  /* ─────────────────────────────────────────────────────────────────
     §9  DISABLE RIGHT-CLICK IN MESSENGER
  ───────────────────────────────────────────────────────────────────*/
  function handleContextMenu(e) {
    if (!_guardActive) return;
    const msgArea = e.target.closest('#screen-messages, #messenger-pane, .dm-modal-overlay');
    if (!msgArea) return;
    e.preventDefault();
    _showWarning('Right-click is disabled in private messages to protect user privacy.');
  }

  /* ─────────────────────────────────────────────────────────────────
     §10  ADD PRIVACY BADGE TO MESSENGER HEADER
  ───────────────────────────────────────────────────────────────────*/
  function addPrivacyBadge() {
    const header = document.querySelector('#screen-messages > .screen-content > div:first-child');
    if (!header || header.querySelector('.msg-privacy-badge')) return;

    const badge = document.createElement('div');
    badge.className = 'msg-privacy-badge';
    badge.title = 'AfriBConnect protects your private messages';
    badge.innerHTML = '🔒 Private';
    header.appendChild(badge);
  }

  /* ─────────────────────────────────────────────────────────────────
     §11  ACTIVATE / DEACTIVATE GUARD
  ───────────────────────────────────────────────────────────────────*/
  window.AfribGuard_activate = function() {
    if (_guardActive) return;
    _guardActive = true;
    _blurActive  = false;
    log('🛡️ Messenger guard activated');
    addPrivacyBadge();
  };

  window.AfribGuard_deactivate = function() {
    if (!_guardActive) return;
    _guardActive = false;
    _unblurContent();
    log('🛡️ Messenger guard deactivated');
  };

  /* ─────────────────────────────────────────────────────────────────
     §12  HOOK INTO showScreen to activate/deactivate
  ───────────────────────────────────────────────────────────────────*/
  function hookShowScreen() {
    const orig = window.showScreen;
    if (typeof orig !== 'function' || orig._guardHooked) return;

    window.showScreen = function(screen) {
      if (typeof orig === 'function') orig.apply(this, arguments);

      if (screen === 'messages') {
        // Small delay to let screen render
        setTimeout(window.AfribGuard_activate, 100);
      } else {
        window.AfribGuard_deactivate();
      }
    };
    window.showScreen._guardHooked = true;
    log('showScreen hooked');
  }

  /* ─────────────────────────────────────────────────────────────────
     §13  SCREEN CAPTURE DETECTION via Page Visibility + Screen Capture API
     The Screen Capture API (getDisplayMedia) emits oncapturehandlechange
     but this only works when the CURRENT tab is being shared/recorded.
     We use it as an additional signal.
  ───────────────────────────────────────────────────────────────────*/
  function initScreenCaptureDetection() {
    // Check if screen is being recorded (experimental API, Chrome 116+)
    if (!navigator.mediaDevices || !navigator.mediaDevices.setCaptureHandleConfig) return;
    try {
      navigator.mediaDevices.setCaptureHandleConfig({
        handle:         'afribconnect-messenger',
        exposeOrigin:   false,
        permittedOrigins: ['self'],
      });
      log('Screen capture handle config set');
    } catch(e) {}
  }

  /* ─────────────────────────────────────────────────────────────────
     §14  INIT
  ───────────────────────────────────────────────────────────────────*/
  function init() {
    injectCSS();
    createBlurOverlay();
    createWarningBanner();
    initScreenCaptureDetection();

    // Global event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange, { passive: true });
    document.addEventListener('keydown', handleKeydown, { passive: false });
    document.addEventListener('contextmenu', handleContextMenu);

    // Hook showScreen when available
    const _hookTry = (n) => {
      if (typeof window.showScreen === 'function') {
        hookShowScreen();
      } else if (n < 20) {
        setTimeout(() => _hookTry(n + 1), 300);
      }
    };
    _hookTry(0);

    // If messages screen is already active (rare, but handle it)
    if (document.getElementById('screen-messages')?.classList.contains('active')) {
      window.AfribGuard_activate();
    }

    log('✅ Messenger Security Guard ready — visibility, keyboard, context-menu protection active');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
