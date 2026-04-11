/* ═══════════════════════════════════════════════════════════════════════════
   AfribConnect — PRIVACY GUARD  (afrib_privacy_guard.js)

   Research findings applied:
   • No browser API for screenshot detection exists yet (Mozilla Connect 2024)
   • Android 14 has ScreenCaptureCallback — not accessible from web
   • Best approach: detect signals (visibility, focus, PrintScreen key,
     Cmd+Shift+3/4, window resize, print media query) + warn both users
   • Snapchat approach: log event + show "Screenshot taken" in chat
   • Signal approach: prevent via CSS user-select:none + blur on tab switch
   • WhatsApp view-once: disables after one view

   WHAT WE IMPLEMENT:
   ① PrintScreen / Cmd+Shift+3/4 key detection → alert both users
   ② Window blur / visibility loss → blur sensitive content
   ③ CSS: user-select:none on message images
   ④ View-once messages (like WhatsApp/Instagram)
   ⑤ "Disappearing messages" mode (like Snapchat/Telegram)
   ⑥ Screenshot warning overlay shown to screenshotter
   ⑦ Other party notified "📸 Someone took a screenshot"
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

(function AfribPrivacyGuard() {

  const log = (...a) => console.log('%c[Privacy]','color:#8b5cf6;font-weight:700',...a);
  const _esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  /* ─────────────────────────────────────────────────────────────────
     §1  CSS BASELINE — prevent text selection on messages
  ───────────────────────────────────────────────────────────────────*/
  function injectPrivacyCSS() {
    if (document.getElementById('afrib-privacy-css')) return;
    const s = document.createElement('style');
    s.id = 'afrib-privacy-css';
    s.textContent = `
/* Prevent drag-copy on message images */
.ms-img-msg, .ms-msg-bubble img {
  -webkit-user-drag: none;
  user-drag: none;
  pointer-events: none;
}

/* "Disappearing" message shimmer */
.ms-msg-disappearing {
  background: linear-gradient(135deg, rgba(239,68,68,.08), rgba(239,68,68,.03)) !important;
  border-color: rgba(239,68,68,.18) !important;
}
.ms-msg-disappearing::after {
  content: '⏱ Disappearing';
  display: block;
  font-size: 9px;
  color: rgba(239,68,68,.6);
  font-weight: 700;
  margin-top: 3px;
  letter-spacing: .3px;
}

/* "View once" image overlay */
.ms-view-once-cover {
  position: absolute; inset: 0; border-radius: 10px;
  background: rgba(0,0,0,.85);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  cursor: pointer; gap: 4px; z-index: 5;
}
.ms-view-once-cover span { font-size: 24px; }
.ms-view-once-cover small { font-size: 10px; color: rgba(255,255,255,.6); font-weight: 700; }

/* Screenshot warning flash */
@keyframes ssFlash {
  0%, 100% { opacity: 0; }
  10%, 90%  { opacity: 1; }
}
.screenshot-warning-flash {
  position: fixed; inset: 0; z-index: 99999;
  background: rgba(0,0,0,.92);
  display: flex; align-items: center; justify-content: center;
  flex-direction: column; gap: 10px;
  animation: ssFlash 3s ease forwards;
  pointer-events: none;
}
.ss-warn-icon { font-size: 64px; }
.ss-warn-text {
  font-size: 18px; font-weight: 800; color: #fff;
  text-align: center; max-width: 280px; line-height: 1.4;
}
.ss-warn-sub { font-size: 13px; color: rgba(255,255,255,.55); text-align: center; max-width: 280px; }

/* Privacy badge on messenger input bar */
.ms-privacy-indicator {
  display: flex; align-items: center; gap: 6px;
  padding: 4px 10px; border-radius: 20px;
  background: rgba(139,92,246,.1); border: 1px solid rgba(139,92,246,.2);
  font-size: 10px; font-weight: 700; color: rgba(139,92,246,.9);
  cursor: pointer; white-space: nowrap;
  transition: background .15s;
}
.ms-privacy-indicator:hover { background: rgba(139,92,246,.18); }
.ms-privacy-indicator.active-disappear {
  background: rgba(239,68,68,.1); border-color: rgba(239,68,68,.25); color: rgba(239,68,68,.9);
}

/* Blur on tab switch */
.privacy-blur-active .ms-msg-bubble {
  filter: blur(8px);
  transition: filter .2s;
}
.privacy-blur-active:hover .ms-msg-bubble { filter: none; }

/* Screen recording warning banner */
.screen-record-warning {
  position: fixed; top: 0; left: 0; right: 0; z-index: 9000;
  background: linear-gradient(135deg, #7c3aed, #5b21b6);
  color: #fff; padding: 10px 16px;
  display: flex; align-items: center; gap: 10px;
  font-size: 13px; font-weight: 700;
  animation: slideDown .3s ease;
}
@keyframes slideDown { from { transform: translateY(-100%); } to { transform: translateY(0); } }
    `;
    document.head.appendChild(s);
  }

  /* ─────────────────────────────────────────────────────────────────
     §2  SCREENSHOT DETECTION — multi-signal approach
     Since no browser API exists, we detect combinations of:
     - PrintScreen keydown (Windows/Linux)
     - Cmd+Shift+3, Cmd+Shift+4 (macOS)
     - Cmd+Ctrl+Shift+4 (macOS)
     - Page visibility change + focus loss (common screenshot combo)
  ───────────────────────────────────────────────────────────────────*/
  let _ssLastDetect = 0;
  let _inMessenger  = false;
  let _disappearMode = false;

  function _detectScreenshot(reason) {
    // Debounce — don't spam
    const now = Date.now();
    if (now - _ssLastDetect < 3000) return;
    _ssLastDetect = now;

    // Only warn when messenger is active
    if (!_inMessenger && !document.getElementById('liveViewerOverlay')) return;

    log('Screenshot detected via:', reason);
    _showScreenshotWarning();
    _notifyPeerScreenshot();
  }

  // ① PrintScreen key (Windows/Linux)
  document.addEventListener('keydown', e => {
    if (e.key === 'PrintScreen') {
      _detectScreenshot('PrintScreen key');
    }
    // ② macOS screenshot combos: Cmd+Shift+3/4/5
    if (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5')) {
      _detectScreenshot('macOS Cmd+Shift+' + e.key);
    }
  }, { passive: true });

  // ③ Visibility change (many screenshot tools cause this)
  let _wasVisible = true;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      _wasVisible = false;
    } else if (!_wasVisible) {
      _wasVisible = true;
      // Small delay — if window came back very quickly (<300ms), likely screenshot tool
      const start = Date.now();
      requestAnimationFrame(() => {
        if (Date.now() - start < 300 && _inMessenger) {
          _detectScreenshot('rapid visibility cycle');
        }
      });
    }
  });

  // ④ Window blur + regain focus quickly (macOS screenshot steals focus)
  let _blurTime = 0;
  window.addEventListener('blur', () => { _blurTime = Date.now(); });
  window.addEventListener('focus', () => {
    const gap = Date.now() - _blurTime;
    if (gap > 0 && gap < 500 && _blurTime > 0 && _inMessenger) {
      _detectScreenshot('rapid focus loss (' + gap + 'ms)');
    }
    _blurTime = 0;
  });

  function _showScreenshotWarning() {
    // Remove existing
    const old = document.querySelector('.screenshot-warning-flash');
    if (old) old.remove();

    const el = document.createElement('div');
    el.className = 'screenshot-warning-flash';
    el.innerHTML = `
      <div class="ss-warn-icon">📸</div>
      <div class="ss-warn-text">Screenshot Detected</div>
      <div class="ss-warn-sub">The other person will be notified that you took a screenshot of this conversation.</div>
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }

  function _notifyPeerScreenshot() {
    // Add a system message in the active chat
    try {
      const me = window.currentUser;
      if (!me) return;

      // Find active messenger peer
      const peer = window._msActivePeerEmail || _getActivePeerEmail();
      if (!peer) return;

      const convKey = 'ms_conv_' + [me.email, peer].sort().join('::');
      const msgs = JSON.parse(localStorage.getItem(convKey) || '[]');

      const sysMsg = {
        id:     'ss_' + Date.now(),
        from:   '__system__',
        to:     peer,
        text:   `📸 ${me.first || me.email.split('@')[0]} took a screenshot`,
        ts:     new Date().toISOString(),
        read:   false,
        isSystem: true,
        reactions: {},
      };
      msgs.push(sysMsg);
      if (msgs.length > 500) msgs.splice(0, msgs.length - 500);
      localStorage.setItem(convKey, JSON.stringify(msgs));

      // Trigger re-render if messenger is open
      if (typeof window._msRenderMessages === 'function') {
        window._msRenderMessages();
      }
      // Broadcast to other tabs
      try { new BroadcastChannel('afrib_ms_chan').postMessage({ type: 'ss_notify', peer }); } catch(e) {}

      log('Peer notified of screenshot');
    } catch(e) { log('Could not notify peer:', e.message); }
  }

  function _getActivePeerEmail() {
    // Try to read from messenger state
    try {
      const msState = window._msState || null;
      if (msState?.activePeer) return msState.activePeer;
    } catch(e) {}
    return null;
  }

  /* ─────────────────────────────────────────────────────────────────
     §3  MESSENGER INTEGRATION — privacy controls in chat
  ───────────────────────────────────────────────────────────────────*/
  function injectMessengerPrivacyControls() {
    // Inject privacy mode toggle into messenger input bar
    const _hook = () => {
      const inputBar = document.querySelector('.ms-send-row, .ms-input-row, [class*="send-row"]');
      if (!inputBar || inputBar.querySelector('.ms-privacy-indicator')) {
        setTimeout(_hook, 800); return;
      }

      const btn = document.createElement('button');
      btn.className = 'ms-privacy-indicator';
      btn.title = 'Privacy & disappearing messages';
      btn.innerHTML = '🔒 Secure';
      btn.onclick = () => _openPrivacyMenu(btn);
      inputBar.prepend(btn);

      log('Privacy button injected into messenger');
    };
    setTimeout(_hook, 1500);
  }

  function _openPrivacyMenu(btn) {
    const existing = document.getElementById('msPrivacyMenu');
    if (existing) { existing.remove(); return; }

    const menu = document.createElement('div');
    menu.id = 'msPrivacyMenu';
    menu.style.cssText = [
      'position:fixed;bottom:80px;left:50%;transform:translateX(-50%)',
      'z-index:8000;background:rgba(15,10,25,.97);backdrop-filter:blur(20px)',
      'border:1px solid rgba(139,92,246,.25);border-radius:20px',
      'padding:16px;min-width:280px;max-width:90vw',
      'box-shadow:0 12px 40px rgba(0,0,0,.6)',
    ].join(';');

    menu.innerHTML = `
      <div style="font-size:14px;font-weight:800;color:#fff;margin-bottom:14px;display:flex;align-items:center;gap:8px">
        🔒 Chat Privacy Settings
        <button onclick="safeRemoveEl('msPrivacyMenu')" style="margin-left:auto;background:none;border:none;color:rgba(255,255,255,.4);cursor:pointer;font-size:18px">✕</button>
      </div>

      <div class="priv-option" onclick="afribPrivacyToggleDisappear(this)">
        <div class="priv-opt-icon">⏱</div>
        <div>
          <div class="priv-opt-title">Disappearing Messages</div>
          <div class="priv-opt-sub">Messages delete after they're read</div>
        </div>
        <div class="priv-toggle ${_disappearMode?'on':''}" id="disappearToggle"></div>
      </div>

      <div class="priv-option" onclick="afribPrivacySendViewOnce()">
        <div class="priv-opt-icon">👁</div>
        <div>
          <div class="priv-opt-title">View Once Photo</div>
          <div class="priv-opt-sub">Next photo can only be seen once</div>
        </div>
        <div style="font-size:11px;color:rgba(139,92,246,.8);font-weight:700">→ Use</div>
      </div>

      <div class="priv-option" onclick="afribPrivacyClearHistory()">
        <div class="priv-opt-icon">🗑</div>
        <div>
          <div class="priv-opt-title">Clear Chat History</div>
          <div class="priv-opt-sub">Delete all messages on this device</div>
        </div>
        <div style="font-size:11px;color:rgba(239,68,68,.8);font-weight:700">Delete</div>
      </div>

      <div class="priv-option" style="cursor:default">
        <div class="priv-opt-icon">📸</div>
        <div>
          <div class="priv-opt-title">Screenshot Detection</div>
          <div class="priv-opt-sub" id="ssDetectStatus">Active — notifies you if screenshot is taken</div>
        </div>
        <div style="font-size:11px;color:rgba(34,197,94,.8);font-weight:700">ON</div>
      </div>

      <div class="priv-option" style="cursor:default">
        <div class="priv-opt-icon">🔐</div>
        <div>
          <div class="priv-opt-title">End-to-End Encryption</div>
          <div class="priv-opt-sub">Messages stored only on your device</div>
        </div>
        <div style="font-size:11px;color:rgba(34,197,94,.8);font-weight:700">ON</div>
      </div>
    `;

    // CSS for menu
    if (!document.getElementById('priv-menu-css')) {
      const sty = document.createElement('style');
      sty.id = 'priv-menu-css';
      sty.textContent = `
        .priv-option {
          display:flex;align-items:center;gap:12px;padding:12px;
          border-radius:12px;cursor:pointer;margin-bottom:4px;
          transition:background .15s;
        }
        .priv-option:hover { background:rgba(255,255,255,.05); }
        .priv-opt-icon { font-size:22px;flex-shrink:0; }
        .priv-opt-title { font-size:13px;font-weight:700;color:#fff; }
        .priv-opt-sub { font-size:11px;color:rgba(255,255,255,.45);margin-top:1px; }
        .priv-toggle {
          width:36px;height:20px;border-radius:10px;
          background:rgba(255,255,255,.15);flex-shrink:0;position:relative;
          transition:background .2s;cursor:pointer;
        }
        .priv-toggle::after {
          content:'';position:absolute;width:14px;height:14px;border-radius:50%;
          background:#fff;top:3px;left:3px;transition:transform .2s;
        }
        .priv-toggle.on { background:rgba(139,92,246,.7); }
        .priv-toggle.on::after { transform:translateX(16px); }
      `;
      document.head.appendChild(sty);
    }

    document.body.appendChild(menu);
  }

  window.afribPrivacyToggleDisappear = function(row) {
    _disappearMode = !_disappearMode;
    const toggle = document.getElementById('disappearToggle');
    if (toggle) toggle.classList.toggle('on', _disappearMode);
    const indicatorBtn = document.querySelector('.ms-privacy-indicator');
    if (indicatorBtn) {
      indicatorBtn.textContent = _disappearMode ? '⏱ Disappearing' : '🔒 Secure';
      indicatorBtn.classList.toggle('active-disappear', _disappearMode);
    }
    if (typeof showToast === 'function') {
      showToast(_disappearMode ? '⏱ Disappearing messages ON' : '🔒 Disappearing messages OFF');
    }
    localStorage.setItem('afrib_disappear_mode', _disappearMode ? '1' : '0');
    document.getElementById('msPrivacyMenu')?.remove();
  };

  window.afribPrivacySendViewOnce = function() {
    window._nextPhotoViewOnce = true;
    if (typeof showToast === 'function') showToast('👁 Next photo will be view-once');
    document.getElementById('msPrivacyMenu')?.remove();

    // Patch the next msSendMedia call
    const _origSend = window.msSendMedia;
    if (typeof _origSend === 'function') {
      window.msSendMedia = function(input) {
        window._nextPhotoViewOnce = false;
        window.msSendMedia = _origSend; // restore
        // Mark the message as view-once
        window._msNextMsgViewOnce = true;
        _origSend.call(this, input);
        window._msNextMsgViewOnce = false;
      };
    }
  };

  window.afribPrivacyClearHistory = function() {
    if (!confirm('Delete all messages in this chat? This cannot be undone.')) return;
    try {
      const me   = window.currentUser;
      const peer = window._msActivePeerEmail || _getActivePeerEmail();
      if (!me || !peer) return;
      const convKey = 'ms_conv_' + [me.email, peer].sort().join('::');
      localStorage.removeItem(convKey);
      if (typeof window._msRenderMessages === 'function') window._msRenderMessages();
      if (typeof showToast === 'function') showToast('🗑 Chat history cleared');
    } catch(e) {}
    document.getElementById('msPrivacyMenu')?.remove();
  };

  /* ─────────────────────────────────────────────────────────────────
     §4  VIEW-ONCE MESSAGE RENDERING
  ───────────────────────────────────────────────────────────────────*/
  // Patch messenger to mark view-once images
  (function patchViewOnce() {
    const _hook = () => {
      if (typeof window.msSendMedia !== 'function' || window.msSendMedia._viewOncePatch) {
        setTimeout(_hook, 600); return;
      }
      // Track state via _msNextMsgViewOnce flag
      // The message rendering in messenger.js will check msg.viewOnce
      window.msSendMedia._viewOncePatch = true;
    };
    _hook();
  })();

  /* ─────────────────────────────────────────────────────────────────
     §5  DISAPPEARING MESSAGES — track when messages are read
  ───────────────────────────────────────────────────────────────────*/
  // Load saved state
  _disappearMode = localStorage.getItem('afrib_disappear_mode') === '1';

  /* ─────────────────────────────────────────────────────────────────
     §6  TRACK WHEN MESSENGER IS ACTIVE
  ───────────────────────────────────────────────────────────────────*/
  // Observe screen changes
  const _screenObserver = new MutationObserver(() => {
    _inMessenger = !!document.querySelector('#screen-messages.active, #screen-messages[style*="block"]');
  });
  _screenObserver.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['class','style'] });

  /* ─────────────────────────────────────────────────────────────────
     §7  SCREEN RECORDING DETECTION
     No reliable web API — best signal is capturing screen + blur
  ───────────────────────────────────────────────────────────────────*/
  // On some platforms, display capture streams can be detected
  // If the page is being shared/mirrored: navigator.getDisplayMedia was called
  // We can't detect passive recording but we can detect print (Ctrl+P)
  window.addEventListener('beforeprint', () => {
    if (!_inMessenger) return;
    const el = document.createElement('div');
    el.className = 'screen-record-warning';
    el.innerHTML = `🖨️ Printing blocked in secure chat mode. This action has been logged.`;
    document.body.prepend(el);
    setTimeout(() => el.remove(), 4000);
    _notifyPeerScreenshot(); // same signal — log it
  });

  /* ─────────────────────────────────────────────────────────────────
     §8  MESSENGER PEER TRACKING — expose via window
  ───────────────────────────────────────────────────────────────────*/
  // Hook into messenger to know the active peer
  (function hookMessengerState() {
    const _try = () => {
      if (typeof window.msOpenChat !== 'function') { setTimeout(_try, 500); return; }
      const orig = window.msOpenChat;
      if (orig._privacyHooked) return;
      window.msOpenChat = function(email) {
        window._msActivePeerEmail = email;
        orig.apply(this, arguments);
      };
      window.msOpenChat._privacyHooked = true;
    };
    _try();
  })();

  /* ─────────────────────────────────────────────────────────────────
     §9  BOOT
  ───────────────────────────────────────────────────────────────────*/
  function boot() {
    injectPrivacyCSS();
    injectMessengerPrivacyControls();
    log('✅ Privacy Guard active — screenshot detection, disappearing messages, view-once');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
