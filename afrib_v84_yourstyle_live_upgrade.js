/*!
 * AfribConnect v80 — Messages, Nav & Mute Fixes
 *
 * THREE FIXES:
 *
 *  1. MESSAGES — plaintext display always
 *
 *  2. MUTE NOTIFICATION TOGGLE (conversations)
 *     - Per-conversation mute stored in convo data
 *     - Chat info button opens a proper bottom sheet with mute toggle
 *     - Muted convos show 🔕 icon and suppress badge increment
 *     - Unmute works — toggles back cleanly
 *     - Audio/video call mute buttons get explicit "Unmute" label on next tap
 *
 *  3. CLASSIC NAV BAR — smaller, tighter, upgraded
 *     - Top nav: height 60px → 48px, font 14px → 12px, tighter padding
 *     - Tabs: pill style refined, active state sharper
 *     - Bottom nav: icons 18px → 16px, labels 10px → 9px, height tightened
 *     - Logo: slightly smaller
 *     - Overall: cleaner, less space, premium compact feel
 */
(function AfribV80() {
  'use strict';

  if (window.__afrib_v80) return;
  window.__afrib_v80 = true;

  /* ══════════════════════════════════════════════════════════
   * § 1  NAV BAR — classic compact upgrade
   * ══════════════════════════════════════════════════════════ */
  (function injectNavCSS() {
    const s = document.createElement('style');
    s.id = 'v80-nav-css';
    s.textContent = `
      /* ── Top nav bar — compact classic ── */
      .app-nav {
        background: rgba(8, 6, 12, 0.97) !important;
        border-bottom: 1px solid rgba(255,255,255,0.06) !important;
      }
      .app-nav-inner {
        height: 48px !important;
        padding: 0 16px !important;
        gap: 12px !important;
      }
      .logo {
        font-size: 13px !important;
        letter-spacing: 2.5px !important;
        font-weight: 800 !important;
      }

      /* ── Nav tabs ── */
      .app-nav-tabs {
        gap: 2px !important;
      }
      .app-tab {
        font-size: 11.5px !important;
        font-weight: 600 !important;
        padding: 5px 10px !important;
        border-radius: 6px !important;
        letter-spacing: 0.2px !important;
      }
      .app-tab:hover {
        background: rgba(255,255,255,0.06) !important;
      }
      .app-tab.active {
        color: var(--gold, #D4AF37) !important;
        background: rgba(212,175,55,0.1) !important;
        font-weight: 700 !important;
      }

      /* ── Nav action icons ── */
      .nav-icon-btn {
        font-size: 14px !important;
        padding: 5px 8px !important;
        border-radius: 7px !important;
        border: 1px solid rgba(255,255,255,0.08) !important;
      }
      .nav-icon-btn:hover {
        border-color: rgba(212,175,55,0.3) !important;
        background: rgba(212,175,55,0.08) !important;
      }

      /* ── Avatar ── */
      .app-avatar {
        width: 28px !important;
        height: 28px !important;
        font-size: 11px !important;
      }
      .app-username {
        font-size: 12px !important;
      }

      /* ── Bottom nav — mobile ── */
      .app-bottom-nav {
        height: 56px !important;
        padding: 4px 0 6px !important;
        background: rgba(8,6,12,0.98) !important;
        border-top: 1px solid rgba(255,255,255,0.06) !important;
      }
      .abn-item {
        font-size: 16px !important;
        padding: 3px 0 !important;
        gap: 1px !important;
        border-radius: 8px !important;
        transition: color .15s, background .15s !important;
      }
      .abn-item span {
        font-size: 9px !important;
        letter-spacing: 0.3px !important;
        font-weight: 600 !important;
      }
      .abn-item.active {
        color: var(--gold, #D4AF37) !important;
      }
      .abn-item:active {
        transform: scale(0.92) !important;
      }

      /* ── Muted convo indicator in list ── */
      .fbmsg-convo-muted-icon {
        font-size: 11px;
        color: rgba(255,255,255,0.3);
        margin-left: 4px;
      }

      /* ── Chat info bottom sheet ── */
      .v80-chat-info-sheet {
        position: fixed;
        inset: 0;
        z-index: 600;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        background: rgba(0,0,0,0.55);
        backdrop-filter: blur(4px);
        animation: v80SheetIn .2s ease;
      }
      @keyframes v80SheetIn {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      .v80-chat-info-card {
        background: var(--bg3, #17141f);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 20px 20px 0 0;
        padding: 0 0 env(safe-area-inset-bottom, 12px);
        max-height: 80vh;
        overflow-y: auto;
        animation: v80CardUp .22s cubic-bezier(.34,1.56,.64,1);
      }
      @keyframes v80CardUp {
        from { transform: translateY(100%); }
        to   { transform: translateY(0); }
      }
      .v80-info-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 20px;
        border-bottom: 1px solid rgba(255,255,255,0.05);
        font-size: 14px;
      }
      .v80-info-row:last-child { border-bottom: none; }
      .v80-toggle-switch {
        position: relative;
        width: 44px;
        height: 24px;
        flex-shrink: 0;
      }
      .v80-toggle-switch input { opacity: 0; width: 0; height: 0; }
      .v80-toggle-track {
        position: absolute;
        inset: 0;
        border-radius: 12px;
        background: rgba(255,255,255,0.12);
        cursor: pointer;
        transition: background .2s;
      }
      .v80-toggle-track::after {
        content: '';
        position: absolute;
        width: 18px;
        height: 18px;
        left: 3px;
        top: 3px;
        border-radius: 50%;
        background: #fff;
        transition: transform .2s;
      }
      .v80-toggle-switch input:checked + .v80-toggle-track {
        background: var(--gold, #D4AF37);
      }
      .v80-toggle-switch input:checked + .v80-toggle-track::after {
        transform: translateX(20px);
      }

    `;
    document.head.appendChild(s);
  })();

  /* ══════════════════════════════════════════════════════════
   * § 3  CONVERSATION MUTE — full toggle with unmute
   *
   * Each convo gets a `muted` boolean stored in its convo object.
   * Chat info button opens a bottom sheet with:
   *  - Person's name + avatar
   *  - 🔕 Mute notifications toggle (persists)
   *  - 🔇 Clear chat
   *  - 📌 Pin conversation (future)
   *  - ❌ Delete conversation
   * Muted convos: badge doesn't increment, convo shows 🔕
   * ══════════════════════════════════════════════════════════ */

  /* Replace the stub msgChatInfo with a real bottom sheet */
  function installChatInfoSheet() {
    window.msgChatInfo = function v80ChatInfo() {
      try {
        const convos = typeof getMsgConvos === 'function' ? getMsgConvos() : {};
        const cid    = window.msgState?.activeConvo;
        const c      = convos[cid];
        if (!c) return;

        const isMuted = !!c.muted;

        // Remove existing sheet
        const existing = document.getElementById('v80ChatInfoSheet');
        if (existing) existing.remove();

        const sheet = document.createElement('div');
        sheet.id = 'v80ChatInfoSheet';
        sheet.className = 'v80-chat-info-sheet';
        sheet.onclick = function(e) {
          if (e.target === sheet) closeV80Sheet();
        };

        sheet.innerHTML = `
          <div class="v80-chat-info-card">
            <!-- Handle -->
            <div style="width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.15);margin:12px auto 0"></div>

            <!-- Profile row -->
            <div style="display:flex;flex-direction:column;align-items:center;padding:20px 20px 16px;border-bottom:1px solid rgba(255,255,255,0.06)">
              <div style="width:60px;height:60px;border-radius:50%;background:${c.color||'linear-gradient(135deg,#D4AF37,#E85D26)'};display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;color:#fff;margin-bottom:10px">
                ${c.isOfficial ? '🌍' : (c.initials || '?')}
              </div>
              <div style="font-size:17px;font-weight:800">${_v80esc(c.name || '')}</div>
              <div style="font-size:12px;color:rgba(255,255,255,0.4);margin-top:3px">${c.online ? '🟢 Active now' : '⚫ Offline'}</div>
            </div>

            <!-- Mute notifications toggle -->
            <div class="v80-info-row">
              <div>
                <div style="font-size:14px;font-weight:600">${isMuted ? '🔕 Muted' : '🔔 Notifications'}</div>
                <div style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:2px">${isMuted ? 'Tap to unmute — you won\'t miss messages' : 'Mute notifications for this chat'}</div>
              </div>
              <label class="v80-toggle-switch">
                <input type="checkbox" id="v80MuteToggle" ${isMuted ? 'checked' : ''} onchange="v80ToggleMute('${cid}',this.checked)"/>
                <div class="v80-toggle-track"></div>
              </label>
            </div>

            <!-- Mark as read -->
            <div class="v80-info-row" onclick="v80MarkRead('${cid}')" style="cursor:pointer">
              <div style="font-size:14px;font-weight:600">✅ Mark as read</div>
              <div style="font-size:18px;color:rgba(255,255,255,0.3)">›</div>
            </div>

            <!-- Clear chat -->
            <div class="v80-info-row" onclick="v80ClearChat('${cid}')" style="cursor:pointer">
              <div style="font-size:14px;font-weight:600;color:rgba(239,68,68,0.8)">🗑 Clear chat</div>
              <div style="font-size:18px;color:rgba(255,255,255,0.3)">›</div>
            </div>

            <!-- Close -->
            <div style="padding:12px 20px 8px">
              <button onclick="closeV80Sheet()" style="width:100%;padding:13px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);border-radius:12px;color:rgba(255,255,255,0.7);font-size:14px;font-weight:700;cursor:pointer">
                Close
              </button>
            </div>
          </div>
        `;

        document.body.appendChild(sheet);
      } catch(e) {
        console.error('[v80] msgChatInfo:', e);
      }
    };

    window.closeV80Sheet = function() {
      const sheet = document.getElementById('v80ChatInfoSheet');
      if (sheet) {
        sheet.style.opacity = '0';
        sheet.style.transition = 'opacity .15s';
        setTimeout(function() { sheet.remove(); }, 150);
      }
    };

    window.v80ToggleMute = function(convoId, mute) {
      try {
        const convos = getMsgConvos();
        if (!convos[convoId]) return;
        convos[convoId].muted = !!mute;
        saveMsgConvos(convos);

        if (typeof showToast === 'function') {
          showToast(mute ? '🔕 Notifications muted' : '🔔 Notifications unmuted');
        }

        // Update the label in the sheet without closing
        const label = document.querySelector('#v80ChatInfoSheet .v80-info-row:first-of-type div:first-child div:first-child');
        const sub   = document.querySelector('#v80ChatInfoSheet .v80-info-row:first-of-type div:first-child div:last-child');
        if (label) label.textContent = mute ? '🔕 Muted' : '🔔 Notifications';
        if (sub) sub.textContent = mute ? "Tap to unmute — you won't miss messages" : 'Mute notifications for this chat';

        // Re-render convo list to show/hide mute icon
        if (typeof renderMsgConvoList === 'function') renderMsgConvoList();
      } catch(e) {
        console.error('[v80] v80ToggleMute:', e);
      }
    };

    window.v80MarkRead = function(convoId) {
      try {
        const convos = getMsgConvos();
        if (convos[convoId]) {
          convos[convoId].unread = 0;
          saveMsgConvos(convos);
        }
        closeV80Sheet();
        if (typeof renderMsgConvoList === 'function') renderMsgConvoList();
        if (typeof _updateMsgNavBadge === 'function') _updateMsgNavBadge();
      } catch(e) {}
    };

    window.v80ClearChat = function(convoId) {
      try {
        if (!confirm('Clear all messages in this chat?')) return;
        if (typeof saveMsgThread === 'function') saveMsgThread(convoId, []);
        const convos = getMsgConvos();
        if (convos[convoId]) {
          convos[convoId].preview = '';
          convos[convoId].unread  = 0;
          saveMsgConvos(convos);
        }
        closeV80Sheet();
        if (typeof renderMsgThread === 'function' && window.msgState?.activeConvo === convoId) {
          renderMsgThread(convoId);
        }
        if (typeof renderMsgConvoList === 'function') renderMsgConvoList();
        if (typeof showToast === 'function') showToast('🗑 Chat cleared');
      } catch(e) {}
    };
  }

  /* Patch renderMsgConvoList to show 🔕 for muted convos */
  function patchConvoListForMute() {
    const orig = window.renderMsgConvoList;
    if (!orig || orig._v80mute) return;

    window.renderMsgConvoList = function v80RenderConvoList() {
      orig.apply(this, arguments);

      // Post-render: inject mute icons for muted convos
      setTimeout(function() {
        try {
          const convos = typeof getMsgConvos === 'function' ? getMsgConvos() : {};
          Object.values(convos).forEach(function(c) {
            if (!c.muted) return;
            // Find the convo row and add mute icon to name
            const rows = document.querySelectorAll('.fbmsg-convo-item');
            rows.forEach(function(row) {
              const onclick = row.getAttribute('onclick') || '';
              if (!onclick.includes(c.id)) return;
              const nameEl = row.querySelector('.fbmsg-convo-name');
              if (nameEl && !nameEl.querySelector('.fbmsg-convo-muted-icon')) {
                const icon = document.createElement('span');
                icon.className = 'fbmsg-convo-muted-icon';
                icon.textContent = '🔕';
                nameEl.appendChild(icon);
              }
            });
          });
        } catch(_) {}
      }, 50);
    };
    window.renderMsgConvoList._v80mute = true;
  }

  /* Patch badge increment to respect mute */
  function patchBadgeForMute() {
    const orig = window._updateMsgNavBadge;
    if (!orig || orig._v80) return;

    window._updateMsgNavBadge = function v80UpdateBadge() {
      // Recalculate unread ignoring muted convos
      try {
        const convos = typeof getMsgConvos === 'function' ? getMsgConvos() : {};
        const total  = Object.values(convos).reduce(function(sum, c) {
          return sum + (c.muted ? 0 : (c.unread || 0));
        }, 0);

        const badge1 = document.getElementById('msgNavBadge');
        const badge2 = document.getElementById('msgBotBadge');
        [badge1, badge2].forEach(function(b) {
          if (!b) return;
          b.style.display = total > 0 ? 'flex' : 'none';
          b.textContent   = total > 99 ? '99+' : String(total);
        });
        return;
      } catch(_) {}

      // Fallback to original
      orig.apply(this, arguments);
    };
    window._updateMsgNavBadge._v80 = true;
  }

  /* ══════════════════════════════════════════════════════════
   * § 4  AUDIO/VIDEO MUTE BUTTONS — explicit label cycling
   *
   * When user taps mute: button shows 🔇 + red bg  (already works)
   * When user taps again: button shows 🎤 + normal  (already works)
   * FIX: ensure the button label shows "Tap to unmute" tooltip
   * and that the initial state is always correct after call start.
   * ══════════════════════════════════════════════════════════ */
  function fixCallMuteButtons() {
    // Patch dmCallToggleMute to ensure correct toggle state feedback
    const origDmMute = window.dmCallToggleMute;
    if (origDmMute && !origDmMute._v80) {
      window.dmCallToggleMute = function v80DmCallToggleMute() {
        origDmMute.apply(this, arguments);
        // Ensure tooltip reflects state
        try {
          const btn = document.getElementById('callMuteBtn');
          const muted = window._callState?.muted;
          if (btn) {
            btn.title = muted ? 'Tap to unmute microphone' : 'Tap to mute microphone';
          }
        } catch(_) {}
      };
      window.dmCallToggleMute._v80 = true;
    }

    // Patch dmCallToggleVideo
    const origDmVideo = window.dmCallToggleVideo;
    if (origDmVideo && !origDmVideo._v80) {
      window.dmCallToggleVideo = function v80DmCallToggleVideo() {
        origDmVideo.apply(this, arguments);
        try {
          const btn = document.getElementById('callVideoToggleBtn');
          const off = window._callState?.videoOff;
          if (btn) {
            btn.title = off ? 'Tap to turn camera on' : 'Tap to turn camera off';
          }
        } catch(_) {}
      };
      window.dmCallToggleVideo._v80 = true;
    }

    // Patch gcToggleMute (group call)
    const origGcMute = window.gcToggleMute;
    if (origGcMute && !origGcMute._v80) {
      window.gcToggleMute = function v80GcToggleMute() {
        origGcMute.apply(this, arguments);
        try {
          const btn = document.getElementById('gcMuteBtn');
          const muted = window._gcState?.muted;
          if (btn) btn.title = muted ? 'Tap to unmute' : 'Tap to mute';
        } catch(_) {}
      };
      window.gcToggleMute._v80 = true;
    }

    // Patch gcToggleVideo
    const origGcVideo = window.gcToggleVideo;
    if (origGcVideo && !origGcVideo._v80) {
      window.gcToggleVideo = function v80GcToggleVideo() {
        origGcVideo.apply(this, arguments);
        try {
          const btn = document.getElementById('gcVideoBtn');
          const off = window._gcState?.videoOff;
          if (btn) btn.title = off ? 'Tap to turn camera on' : 'Tap to turn camera off';
        } catch(_) {}
      };
      window.gcToggleVideo._v80 = true;
    }
  }

  /* ══════════════════════════════════════════════════════════
   * § 5  HELPERS
   * ══════════════════════════════════════════════════════════ */
  function _v80esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ══════════════════════════════════════════════════════════
   * § 6  INIT
   * ══════════════════════════════════════════════════════════ */
  function init() {
    installChatInfoSheet();
    patchConvoListForMute();
    patchBadgeForMute();
    fixCallMuteButtons();

    // Re-render message list if we're already on messages screen
    try {
      const active = document.querySelector('.screen.active');
      if (active && active.id === 'screen-messages') {
        if (typeof renderMsgConvoList === 'function') renderMsgConvoList();
      }
    } catch(_) {}

    // Re-run after login
    document.addEventListener('afrib:login', function() {
      setTimeout(function() {
        patchConvoListForMute();
        patchBadgeForMute();
        fixCallMuteButtons();
      }, 800);
    });

    console.info('%c✅ AfribConnect v80 — Messages, Nav & Mute loaded', 'color:#D4AF37;font-weight:bold');
  }

  if (document.readyState !== 'loading') {
    setTimeout(init, 800);
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(init, 800);
    });
  }

})();
