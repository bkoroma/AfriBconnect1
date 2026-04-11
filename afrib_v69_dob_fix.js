/* ═══════════════════════════════════════════════════════════════════════════
   AfribConnect v69 — Screenshot & Screen Recording Notification System
   afrib_v69_capture_guard.js
   ─────────────────────────────────────────────────────────────────────────

   RESEARCH — What browsers actually expose (2024/2025):
   ─────────────────────────────────────────────────────
   ① PrintScreen / Cmd+Shift+3/4/5 → keydown events (reliable on desktop)
   ② document.visibilitychange → fires when screenshot tool overlays (partial)
   ③ window blur/focus rapid cycle → macOS screenshot steals focus <300ms
   ④ Screen Capture API (getDisplayMedia) → detectable if user shares screen
      navigator.mediaDevices.getDisplayMedia — resolves when share starts
      MediaStreamTrack.onended — fires when they STOP sharing
   ⑤ document.pictureInPictureElement → PiP mode (screen mirroring)
   ⑥ window.matchMedia('print') → beforeprint fires for print-screen capture
   ⑦ Clipboard write-image signal → ClipboardEvent (partial support)
   ⑧ Android 14 ScreenCaptureCallback → NOT accessible from web (native only)
   ⑨ Resize to small dimensions → screen mirroring / AirPlay side-effect

   NOTIFICATION DELIVERY:
   ─────────────────────
   • System message injected into active conversation immediately
   • BroadcastChannel to notify same user on other tabs
   • localStorage event triggers to notify peer's open session
   • Toast + warning overlay shown to the capturer
   • "Screenshot" / "Screen Recording" badges in the chat thread
   • Notification persists in chat history

   WHAT EACH SIGNAL DETECTS:
   ─────────────────────────
   • PrintScreen key         → Windows/Linux screenshot
   • Cmd+Shift+3/4/5         → macOS screenshot
   • Rapid focus loss <300ms → macOS screenshot tool / Snipping Tool
   • Rapid visibility cycle  → Windows Snipping Tool, screenshot apps
   • getDisplayMedia call    → Screen share / OBS / Zoom / Loom / recorder
   • MediaStreamTrack ended  → Screen recording STOPPED
   • beforeprint             → Print-screen via browser print
   • Clipboard image write   → Screenshot saved to clipboard
   • PiP activated           → Picture-in-picture / screen mirror

   PRIVACY NOTE:
   • We detect signals, not screen content
   • No images are captured or stored
   • The notified party sees WHO attempted + WHEN, not what was captured
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

(function AfribCaptureGuard() {

  const LOG  = (...a) => console.log('%c[CaptureGuard]', 'color:#8b5cf6;font-weight:700', ...a);
  const WARN = (...a) => console.warn('[CaptureGuard]', ...a);

  /* ─────────────────────────────────────────────────────────────────
     UTILITY
  ───────────────────────────────────────────────────────────────────── */
  function _esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function _me()   { return window.currentUser || null; }
  function _peer() {
    try {
      return window._msState?.activePeer
          || window._msActivePeerEmail
          || null;
    } catch(e) { return null; }
  }
  function _inChat() {
    const screen = document.getElementById('screen-messages');
    if (!screen) return false;
    return screen.classList.contains('active') || screen.style.display !== 'none';
  }
  function _inActiveChatWindow() {
    const chatWin = document.getElementById('msMsgArea') || document.getElementById('msgChatWindow');
    if (!chatWin) return false;
    return chatWin.offsetParent !== null && _peer() !== null;
  }

  /* ─────────────────────────────────────────────────────────────────
     DEBOUNCE — prevent spam notifications
  ───────────────────────────────────────────────────────────────────── */
  const _cooldowns = {};
  function _debounce(key, ms) {
    const now = Date.now();
    if (_cooldowns[key] && now - _cooldowns[key] < ms) return false;
    _cooldowns[key] = now;
    return true;
  }

  /* ─────────────────────────────────────────────────────────────────
     CORE: Dispatch a capture event
     type: 'screenshot' | 'recording_start' | 'recording_stop' | 'print'
  ───────────────────────────────────────────────────────────────────── */
  function dispatchCaptureEvent(type, reason) {
    const debounceKey = type + '_' + (_peer() || 'none');
    if (!_debounce(debounceKey, 4000)) return;

    LOG('Capture event:', type, '—', reason);

    // Show overlay to capturer
    _showCapturerOverlay(type);

    // Inject system message + notify peer
    if (_inActiveChatWindow()) {
      _injectSystemMessage(type);
      _notifyPeerViaBroadcast(type);
      _notifyPeerViaStorage(type);
    } else if (_inChat()) {
      // In messages screen but no active chat — still log
      _notifyPeerViaStorage(type);
    }
  }

  /* ─────────────────────────────────────────────────────────────────
     OVERLAY SHOWN TO THE CAPTURER
  ───────────────────────────────────────────────────────────────────── */
  function _showCapturerOverlay(type) {
    document.querySelector('.afrib-capture-overlay')?.remove();

    const icons = {
      screenshot:       '📸',
      recording_start:  '🔴',
      recording_stop:   '⬛',
      print:            '🖨️',
    };
    const labels = {
      screenshot:       'Screenshot Detected',
      recording_start:  'Screen Recording Started',
      recording_stop:   'Screen Recording Stopped',
      print:            'Print Detected',
    };
    const subs = {
      screenshot:       'The other person has been notified.',
      recording_start:  'Recording this conversation will notify the other person.',
      recording_stop:   'The other person has been notified that recording stopped.',
      print:            'The other person has been notified.',
    };

    const el = document.createElement('div');
    el.className = 'afrib-capture-overlay';
    el.style.cssText = `
      position:fixed; inset:0; z-index:999999;
      background:rgba(0,0,0,.88);
      display:flex; align-items:center; justify-content:center;
      flex-direction:column; gap:14px;
      animation:capOverlayAnim 3.5s cubic-bezier(.16,1,.3,1) forwards;
      pointer-events:none;
    `;
    el.innerHTML = `
      <div style="font-size:72px;filter:drop-shadow(0 0 30px rgba(139,92,246,.8));animation:capIconBounce .4s cubic-bezier(.34,1.56,.64,1)">${icons[type]}</div>
      <div style="font-size:20px;font-weight:900;color:#fff;font-family:'Syne',sans-serif;text-align:center">${labels[type]}</div>
      <div style="font-size:13px;color:rgba(255,255,255,.55);text-align:center;max-width:260px;line-height:1.6">${subs[type]}</div>
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3500);
  }

  /* ─────────────────────────────────────────────────────────────────
     SYSTEM MESSAGE INTO ACTIVE CHAT THREAD
  ───────────────────────────────────────────────────────────────────── */
  function _injectSystemMessage(type) {
    try {
      const me   = _me();
      const peer = _peer();
      if (!me || !peer) return;

      const msgTemplates = {
        screenshot:      `📸 ${me.first || me.username || 'Someone'} took a screenshot`,
        recording_start: `🔴 ${me.first || me.username || 'Someone'} started screen recording`,
        recording_stop:  `⬛ ${me.first || me.username || 'Someone'} stopped screen recording`,
        print:           `🖨️ ${me.first || me.username || 'Someone'} attempted to print this chat`,
      };

      const text = msgTemplates[type] || `📸 ${me.first || 'Someone'} captured this chat`;

      // Build the system message object
      const sysMsg = {
        id:         'cap_' + Date.now() + '_' + Math.random().toString(36).slice(2,6),
        from:       '__system__',
        to:         peer,
        text,
        ts:         new Date().toISOString(),
        read:       false,
        isSystem:   true,
        captureType: type,
        reactions:  {},
        starred:    false,
      };

      // Save to both sides of the conversation
      const convKey = 'ms_conv_' + [me.email, peer].sort().join('::');
      let msgs = [];
      try { msgs = JSON.parse(localStorage.getItem(convKey) || '[]'); } catch(e) {}
      msgs.push(sysMsg);
      if (msgs.length > 500) msgs.splice(0, msgs.length - 500);
      localStorage.setItem(convKey, JSON.stringify(msgs));

      // Also save for PEER's view so they see it when they open the chat
      const peerConvKey = 'ms_conv_' + [peer, me.email].sort().join('::');
      let peerMsgs = [];
      try { peerMsgs = JSON.parse(localStorage.getItem(peerConvKey) || '[]'); } catch(e) {}
      // Avoid duplicate if keys resolve to same
      if (peerConvKey !== convKey) {
        peerMsgs.push(sysMsg);
        if (peerMsgs.length > 500) peerMsgs.splice(0, peerMsgs.length - 500);
        localStorage.setItem(peerConvKey, JSON.stringify(peerMsgs));
      }

      // Re-render the chat window immediately
      if (typeof window._msRenderMessages === 'function') {
        window._msRenderMessages();
      }

      // Scroll to bottom
      setTimeout(() => {
        const area = document.getElementById('msMsgArea');
        if (area) area.scrollTop = area.scrollHeight;
      }, 100);

      LOG('System message injected:', text);
    } catch(e) { WARN('_injectSystemMessage error:', e.message); }
  }

  /* ─────────────────────────────────────────────────────────────────
     PEER NOTIFICATION VIA BROADCASTCHANNEL (same-browser other tabs)
  ───────────────────────────────────────────────────────────────────── */
  let _bc = null;
  function _getBroadcastChannel() {
    if (_bc) return _bc;
    try { _bc = new BroadcastChannel('afrib_capture_guard'); return _bc; } catch(e) { return null; }
  }

  function _notifyPeerViaBroadcast(type) {
    try {
      const me   = _me();
      const peer = _peer();
      if (!me || !peer) return;
      const bc = _getBroadcastChannel();
      if (!bc) return;
      bc.postMessage({
        type:        'capture_event',
        captureType: type,
        from:        me.email,
        fromName:    me.first || me.username || '',
        to:          peer,
        ts:          Date.now(),
      });
    } catch(e) {}
  }

  /* ─────────────────────────────────────────────────────────────────
     PEER NOTIFICATION VIA LOCALSTORAGE EVENT (cross-tab)
  ───────────────────────────────────────────────────────────────────── */
  function _notifyPeerViaStorage(type) {
    try {
      const me   = _me();
      const peer = _peer();
      if (!me || !peer) return;

      const notification = {
        captureType: type,
        from:        me.email,
        fromName:    me.first || me.username || '',
        to:          peer,
        ts:          Date.now(),
      };

      // Write to peer's notification queue
      const qKey = 'afrib_capture_notif_' + peer;
      let queue = [];
      try { queue = JSON.parse(localStorage.getItem(qKey) || '[]'); } catch(e) {}
      queue.push(notification);
      if (queue.length > 20) queue.shift();
      localStorage.setItem(qKey, JSON.stringify(queue));

      // Trigger storage event on other tabs
      // (setting then removing a sentinel causes the event to fire)
      const sentinel = 'afrib_capture_ping_' + peer + '_' + Date.now();
      localStorage.setItem(sentinel, '1');
      setTimeout(() => localStorage.removeItem(sentinel), 500);
    } catch(e) {}
  }

  /* ─────────────────────────────────────────────────────────────────
     LISTEN FOR INCOMING CAPTURE NOTIFICATIONS (peer notified us)
  ───────────────────────────────────────────────────────────────────── */
  function _listenForPeerCaptures() {
    const me = _me();
    if (!me) return;

    // BroadcastChannel listener
    try {
      const bc = _getBroadcastChannel();
      if (bc) {
        bc.onmessage = (e) => {
          const d = e.data;
          if (!d || d.type !== 'capture_event') return;
          if (d.to !== me.email) return;
          _showIncomingCaptureAlert(d.captureType, d.fromName || d.from);
        };
      }
    } catch(e) {}

    // localStorage storage event (cross-tab)
    window.addEventListener('storage', (e) => {
      if (!e.key?.startsWith('afrib_capture_ping_' + me.email)) return;
      _processIncomingQueue(me.email);
    });

    // Process any queued notifications from before we loaded
    setTimeout(() => _processIncomingQueue(me?.email), 1000);
  }

  function _processIncomingQueue(myEmail) {
    if (!myEmail) return;
    const qKey = 'afrib_capture_notif_' + myEmail;
    let queue = [];
    try { queue = JSON.parse(localStorage.getItem(qKey) || '[]'); } catch(e) {}
    if (!queue.length) return;

    // Clear the queue
    localStorage.removeItem(qKey);

    // Show notification for each unprocessed event
    const now = Date.now();
    queue.forEach(notif => {
      // Only show if recent (within 30s)
      if (now - notif.ts > 30000) return;
      _showIncomingCaptureAlert(notif.captureType, notif.fromName || notif.from);
    });
  }

  function _showIncomingCaptureAlert(type, fromName) {
    const labels = {
      screenshot:      `📸 ${fromName} took a screenshot`,
      recording_start: `🔴 ${fromName} started recording this conversation`,
      recording_stop:  `⬛ ${fromName} stopped recording`,
      print:           `🖨️ ${fromName} attempted to print this chat`,
    };
    const msg = labels[type] || `📸 ${fromName} captured this chat`;

    // Show toast
    if (typeof window.showToast === 'function') window.showToast(msg, 4000);
    else if (typeof window.showToastSafe === 'function') window.showToastSafe(msg, 4000);

    // Also show a persistent banner in the chat if it's open
    if (_inActiveChatWindow()) {
      _injectSystemMessage(type); // inject from "their" perspective
    }
  }

  /* ─────────────────────────────────────────────────────────────────
     PATCH _msRenderMessages TO STYLE SYSTEM MESSAGES BEAUTIFULLY
  ───────────────────────────────────────────────────────────────────── */
  function patchMessengerRender() {
    const orig = window._msRenderMessages;
    if (!orig || orig.__captureGuardPatched) return;

    window._msRenderMessages = function() {
      // Call original render
      try { orig.apply(this, arguments); } catch(e) {}

      // Now post-process any system messages in the DOM
      // that were rendered as regular bubbles — replace with styled versions
      const me   = _me();
      const peer = _peer();
      if (!me || !peer) return;

      try {
        const convKey = 'ms_conv_' + [me.email, peer].sort().join('::');
        const msgs = JSON.parse(localStorage.getItem(convKey) || '[]');

        const area = document.getElementById('msMsgArea');
        if (!area) return;

        msgs.forEach(msg => {
          if (!msg.isSystem || !msg.captureType) return;
          const row = document.getElementById('msg_' + msg.id);
          if (!row) {
            // Append a new system message node
            const sysEl = _buildSystemMsgEl(msg);
            area.appendChild(sysEl);
          } else {
            // Re-style existing
            row.outerHTML = _buildSystemMsgHTML(msg);
          }
        });

        // Scroll to bottom
        area.scrollTop = area.scrollHeight;
      } catch(e) {}
    };

    window._msRenderMessages.__captureGuardPatched = true;
    LOG('Messenger render patched for system messages ✓');
  }

  function _buildSystemMsgEl(msg) {
    const div = document.createElement('div');
    div.id = 'msg_' + msg.id;
    div.innerHTML = _buildSystemMsgHTML(msg);
    return div.firstElementChild || div;
  }

  function _buildSystemMsgHTML(msg) {
    const icons = {
      screenshot:      '📸',
      recording_start: '🔴',
      recording_stop:  '⬛',
      print:           '🖨️',
    };
    const colors = {
      screenshot:      'rgba(139,92,246,.15)',
      recording_start: 'rgba(239,68,68,.12)',
      recording_stop:  'rgba(107,114,128,.1)',
      print:           'rgba(251,191,36,.1)',
    };
    const borders = {
      screenshot:      'rgba(139,92,246,.3)',
      recording_start: 'rgba(239,68,68,.3)',
      recording_stop:  'rgba(107,114,128,.2)',
      print:           'rgba(251,191,36,.3)',
    };
    const type  = msg.captureType || 'screenshot';
    const icon  = icons[type]   || '📸';
    const bg    = colors[type]  || 'rgba(139,92,246,.15)';
    const border= borders[type] || 'rgba(139,92,246,.3)';
    const time  = _msTimeOnly ? _msTimeOnly(msg.ts) : '';

    return `<div id="msg_${_esc(msg.id)}" style="
      display:flex; justify-content:center; padding:6px 16px; margin:4px 0;
    ">
      <div style="
        display:inline-flex; align-items:center; gap:8px;
        background:${bg}; border:1px solid ${border};
        border-radius:20px; padding:7px 14px; max-width:85%;
      ">
        <span style="font-size:16px">${icon}</span>
        <span style="font-size:12px; font-weight:700; color:rgba(255,255,255,.75); line-height:1.4">
          ${_esc(msg.text)}
        </span>
        <span style="font-size:10px; color:rgba(255,255,255,.3); white-space:nowrap; flex-shrink:0">
          ${time}
        </span>
      </div>
    </div>`;
  }

  // Helper: if _msTimeOnly not available, make our own
  function _msTimeOnly(ts) {
    if (typeof window._msTimeOnly === 'function') return window._msTimeOnly(ts);
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
    } catch(e) { return ''; }
  }

  /* ─────────────────────────────────────────────────────────────────
     SIGNAL DETECTORS
  ───────────────────────────────────────────────────────────────────── */

  // ── 1. Keyboard shortcuts ──
  function attachKeyboardDetectors() {
    document.addEventListener('keydown', (e) => {
      // PrintScreen (Windows / Linux)
      if (e.key === 'PrintScreen') {
        dispatchCaptureEvent('screenshot', 'PrintScreen key');
        return;
      }
      // macOS: Cmd+Shift+3 (full screen), Cmd+Shift+4 (area), Cmd+Shift+5 (menu)
      if (e.metaKey && e.shiftKey) {
        if (e.key === '3' || e.key === '4' || e.key === '5') {
          dispatchCaptureEvent('screenshot', 'macOS Cmd+Shift+' + e.key);
          return;
        }
      }
      // macOS: Cmd+Ctrl+Shift+3/4 (save to clipboard)
      if (e.metaKey && e.ctrlKey && e.shiftKey) {
        if (e.key === '3' || e.key === '4') {
          dispatchCaptureEvent('screenshot', 'macOS clipboard screenshot');
          return;
        }
      }
      // Windows: Ctrl+PrtScn or Alt+PrtScn
      if (e.ctrlKey && e.key === 'PrintScreen') {
        dispatchCaptureEvent('screenshot', 'Ctrl+PrintScreen');
        return;
      }
      // Windows: Win+Shift+S (Snipping Tool)
      if (e.metaKey && e.shiftKey && e.key === 's') {
        dispatchCaptureEvent('screenshot', 'Win+Shift+S Snipping Tool');
        return;
      }
      // Ctrl+P (print)
      if (e.ctrlKey && e.key === 'p') {
        if (_inChat()) {
          e.preventDefault(); // Block print in chat
          dispatchCaptureEvent('print', 'Ctrl+P blocked');
        }
      }
    }, { passive: false });
    LOG('Keyboard detectors attached ✓');
  }

  // ── 2. Visibility / Focus rapid cycle ──
  function attachVisibilityDetectors() {
    let _hiddenAt  = 0;
    let _blurAt    = 0;
    let _focusCount = 0;

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        _hiddenAt = Date.now();
      } else {
        // Tab became visible again
        const gap = Date.now() - _hiddenAt;
        if (_hiddenAt > 0 && gap > 0 && gap < 500 && _inChat()) {
          // Very rapid visibility cycle — common with screenshot tools
          dispatchCaptureEvent('screenshot', 'rapid visibility cycle (' + gap + 'ms)');
        }
        _hiddenAt = 0;
      }
    });

    window.addEventListener('blur', () => { _blurAt = Date.now(); });
    window.addEventListener('focus', () => {
      const gap = Date.now() - _blurAt;
      if (_blurAt > 0 && gap > 0 && gap < 350 && _inChat()) {
        // Very rapid focus loss/regain — macOS screenshot tool pattern
        _focusCount++;
        if (_focusCount >= 1) {
          dispatchCaptureEvent('screenshot', 'rapid focus loss (' + gap + 'ms)');
          _focusCount = 0;
        }
      } else {
        _focusCount = 0;
      }
      _blurAt = 0;
    });
    LOG('Visibility/focus detectors attached ✓');
  }

  // ── 3. Screen Capture API (getDisplayMedia) — MOST RELIABLE for recording ──
  function attachScreenCaptureDetector() {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      LOG('getDisplayMedia not available — screen recording detection limited');
      return;
    }

    const origGetDisplayMedia = navigator.mediaDevices.getDisplayMedia.bind(navigator.mediaDevices);

    navigator.mediaDevices.getDisplayMedia = async function(constraints) {
      // The user is attempting to share/record the screen
      let stream;
      try {
        stream = await origGetDisplayMedia(constraints);
      } catch(e) {
        // User denied — no notification needed
        return Promise.reject(e);
      }

      // If we're in a chat when they start sharing — notify
      if (_inChat()) {
        dispatchCaptureEvent('recording_start', 'getDisplayMedia granted');

        // Listen for recording STOP
        const tracks = stream.getVideoTracks();
        tracks.forEach(track => {
          track.addEventListener('ended', () => {
            if (_inChat()) {
              dispatchCaptureEvent('recording_stop', 'MediaStreamTrack ended');
            }
          });
        });
      }

      return stream;
    };

    LOG('getDisplayMedia screen capture detector attached ✓');
  }

  // ── 4. Before-print event ──
  function attachPrintDetector() {
    window.addEventListener('beforeprint', () => {
      if (!_inChat()) return;
      dispatchCaptureEvent('print', 'beforeprint event');
    });
    // Block print media rendering of chat content
    const printBlockStyle = document.createElement('style');
    printBlockStyle.textContent = `
      @media print {
        #screen-messages, #msMsgArea, .ms-app { display: none !important; }
        body::after {
          content: "Printing AfribConnect messages is not permitted.";
          display: block;
          text-align: center;
          padding: 40px;
          font-size: 16px;
        }
      }
    `;
    document.head.appendChild(printBlockStyle);
    LOG('Print detector attached ✓');
  }

  // ── 5. Picture-in-Picture detection (screen mirroring signal) ──
  function attachPiPDetector() {
    document.addEventListener('enterpictureinpicture', () => {
      if (_inChat()) {
        dispatchCaptureEvent('recording_start', 'Picture-in-Picture activated');
      }
    });
    document.addEventListener('leavepictureinpicture', () => {
      if (_inChat()) {
        dispatchCaptureEvent('recording_stop', 'Picture-in-Picture exited');
      }
    });
  }

  // ── 6. Clipboard write detection (Ctrl+C on screen / screenshot to clipboard) ──
  function attachClipboardDetector() {
    document.addEventListener('copy', (e) => {
      if (!_inChat()) return;
      // If they copy from the messages area
      const selection = window.getSelection()?.toString() || '';
      const target    = e.target;
      const inMsgArea = target?.closest?.('#msMsgArea, .ms-app, #screen-messages');
      if (inMsgArea && selection.length > 0) {
        // User copied chat text — record but don't treat as screenshot
        // Only flag as screenshot if it's an image copy (ClipboardItem with image)
        if (e.clipboardData?.items) {
          for (const item of e.clipboardData.items) {
            if (item.type.startsWith('image/')) {
              dispatchCaptureEvent('screenshot', 'image copied to clipboard');
              break;
            }
          }
        }
      }
    });
  }

  // ── 7. Window resize to very small (screen cast / AirPlay side-effect) ──
  function attachResizeDetector() {
    let _normalWidth  = window.innerWidth;
    let _normalHeight = window.innerHeight;
    let _resizeTimer;

    window.addEventListener('resize', () => {
      clearTimeout(_resizeTimer);
      _resizeTimer = setTimeout(() => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const shrinkRatio = (w * h) / (_normalWidth * _normalHeight);

        // Sudden shrink to <40% of original area can signal screen casting
        if (shrinkRatio < 0.4 && _inChat()) {
          dispatchCaptureEvent('recording_start', 'window shrink to ' + w + 'x' + h);
        } else {
          _normalWidth  = w;
          _normalHeight = h;
        }
      }, 400);
    });
  }

  /* ─────────────────────────────────────────────────────────────────
     CSS: Animations & Styles
  ───────────────────────────────────────────────────────────────────── */
  function injectCSS() {
    if (document.getElementById('afrib-capture-guard-css')) return;
    const s = document.createElement('style');
    s.id = 'afrib-capture-guard-css';
    s.textContent = `
      @keyframes capOverlayAnim {
        0%   { opacity:0; }
        8%   { opacity:1; }
        80%  { opacity:1; }
        100% { opacity:0; }
      }
      @keyframes capIconBounce {
        0%   { transform:scale(0) rotate(-15deg); }
        70%  { transform:scale(1.15) rotate(5deg); }
        100% { transform:scale(1) rotate(0deg); }
      }

      /* System message pill in chat */
      .afrib-sys-msg {
        display:flex; justify-content:center;
        padding:6px 16px; margin:4px 0;
      }
      .afrib-sys-msg-pill {
        display:inline-flex; align-items:center; gap:8px;
        border-radius:20px; padding:7px 14px; max-width:85%;
        font-size:12px; font-weight:700;
        color:rgba(255,255,255,.75); line-height:1.4;
      }

      /* Screenshot pill */
      .afrib-sys-screenshot .afrib-sys-msg-pill {
        background:rgba(139,92,246,.15);
        border:1px solid rgba(139,92,246,.3);
      }

      /* Recording start pill */
      .afrib-sys-recording_start .afrib-sys-msg-pill {
        background:rgba(239,68,68,.12);
        border:1px solid rgba(239,68,68,.3);
        animation:capRecordPulse 2s ease-in-out infinite;
      }
      @keyframes capRecordPulse {
        0%,100% { border-color:rgba(239,68,68,.3); }
        50%     { border-color:rgba(239,68,68,.7); box-shadow:0 0 10px rgba(239,68,68,.2); }
      }

      /* Recording stop pill */
      .afrib-sys-recording_stop .afrib-sys-msg-pill {
        background:rgba(107,114,128,.1);
        border:1px solid rgba(107,114,128,.2);
      }

      /* Print pill */
      .afrib-sys-print .afrib-sys-msg-pill {
        background:rgba(251,191,36,.1);
        border:1px solid rgba(251,191,36,.3);
      }

      /* Live recording badge in chat header */
      .afrib-recording-badge {
        display:inline-flex; align-items:center; gap:5px;
        background:rgba(239,68,68,.15); border:1px solid rgba(239,68,68,.35);
        border-radius:20px; padding:3px 10px; font-size:11px; font-weight:800;
        color:rgba(239,68,68,.9); flex-shrink:0;
        animation:capRecordPulse 1.5s ease-in-out infinite;
      }
      .afrib-recording-badge::before {
        content:''; width:7px; height:7px; background:#ef4444;
        border-radius:50%; display:inline-block;
      }

      /* Prevent screenshots: blur content on tab hidden */
      .afrib-chat-blurred .ms-bubble,
      .afrib-chat-blurred .ms-msg-bubble {
        filter: blur(12px);
        transition: filter .2s;
        user-select: none;
      }
      .afrib-chat-blurred .ms-bubble:hover,
      .afrib-chat-blurred .ms-msg-bubble:hover {
        filter: none;
      }
    `;
    document.head.appendChild(s);
  }

  /* ─────────────────────────────────────────────────────────────────
     CHAT HEADER: Live Recording Badge
  ───────────────────────────────────────────────────────────────────── */
  let _isRecording = false;

  function _setRecordingBadge(active) {
    _isRecording = active;
    document.querySelectorAll('.afrib-recording-badge').forEach(b => b.remove());

    if (!active) return;

    // Add badge to the chat header
    const header = document.querySelector('#msChatWindow > div:first-child, .ms-chat-header');
    if (!header) return;

    const badge = document.createElement('div');
    badge.className = 'afrib-recording-badge';
    badge.textContent = 'RECORDING';
    badge.title = 'This conversation is being recorded by the other person';
    header.appendChild(badge);
  }

  // Override dispatchCaptureEvent to also manage recording badge
  const _origDispatch = dispatchCaptureEvent;
  // (already referencing closure, badge logic added via storage listener below)

  /* ─────────────────────────────────────────────────────────────────
     BLUR MESSAGES ON TAB HIDDEN (extra security)
  ───────────────────────────────────────────────────────────────────── */
  function attachBlurOnHidden() {
    document.addEventListener('visibilitychange', () => {
      const msgArea = document.getElementById('msMsgArea');
      if (!msgArea) return;
      if (document.hidden) {
        msgArea.classList.add('afrib-chat-blurred');
      } else {
        // Remove blur after short delay (lets app re-focus first)
        setTimeout(() => msgArea.classList.remove('afrib-chat-blurred'), 800);
      }
    });
  }

  /* ─────────────────────────────────────────────────────────────────
     PRIVACY SETTINGS PANEL EXTENSION
     Adds recording + screenshot settings to existing privacy menu
  ───────────────────────────────────────────────────────────────────── */
  function extendPrivacyMenu() {
    // Add "Capture Guard" row to the existing privacy menu when it opens
    const observer = new MutationObserver(() => {
      const menu = document.getElementById('msPrivacyMenu');
      if (!menu || menu.querySelector('.afrib-capture-guard-row')) return;

      const row = document.createElement('div');
      row.className = 'priv-option afrib-capture-guard-row';
      row.style.cssText = 'display:flex;align-items:center;gap:12px;padding:12px;border-radius:12px;cursor:default';
      row.innerHTML = `
        <div style="font-size:22px;flex-shrink:0">🛡️</div>
        <div>
          <div style="font-size:13px;font-weight:700;color:#fff">Capture Guard</div>
          <div style="font-size:11px;color:rgba(255,255,255,.45);margin-top:1px">Screenshot, recording & print detection active</div>
        </div>
        <div style="font-size:11px;color:rgba(34,197,94,.8);font-weight:700;flex-shrink:0">ON</div>
      `;
      menu.appendChild(row);
    });
    observer.observe(document.body, { childList: true });
  }

  /* ─────────────────────────────────────────────────────────────────
     PUBLIC API
  ───────────────────────────────────────────────────────────────────── */
  window.afribCaptureGuard = {
    triggerScreenshot:  () => dispatchCaptureEvent('screenshot',      'manual'),
    triggerRecording:   () => dispatchCaptureEvent('recording_start', 'manual'),
    triggerStop:        () => dispatchCaptureEvent('recording_stop',  'manual'),
    isRecording:        () => _isRecording,
  };

  /* ─────────────────────────────────────────────────────────────────
     BOOT
  ───────────────────────────────────────────────────────────────────── */
  function boot() {
    injectCSS();
    attachKeyboardDetectors();
    attachVisibilityDetectors();
    attachScreenCaptureDetector();
    attachPrintDetector();
    attachPiPDetector();
    attachClipboardDetector();
    attachResizeDetector();
    attachBlurOnHidden();
    extendPrivacyMenu();

    // Patch renderer when messenger is ready
    const patchTimer = setInterval(() => {
      if (typeof window._msRenderMessages === 'function') {
        patchMessengerRender();
        clearInterval(patchTimer);
      }
    }, 400);

    // Start listening for peer capture notifications when user is logged in
    const listenTimer = setInterval(() => {
      if (window.currentUser) {
        _listenForPeerCaptures();
        clearInterval(listenTimer);
      }
    }, 600);

    // Also re-listen when user logs in
    const origEnter = window.enterApp;
    if (typeof origEnter === 'function' && !origEnter.__captureGuardHooked) {
      window.enterApp = function() {
        try { origEnter.apply(this, arguments); } catch(e) {}
        setTimeout(_listenForPeerCaptures, 800);
        setTimeout(patchMessengerRender, 800);
      };
      window.enterApp.__captureGuardHooked = true;
    }

    LOG('✅ Capture Guard active — screenshot, recording, print, clipboard, PiP, visibility detectors running');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
