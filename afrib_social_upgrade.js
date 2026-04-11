/* ═══════════════════════════════════════════════════════════════════════════
   AfribConnect — SOCIAL NOTIFICATION ENGINE
   afrib_social_notifs.js   (load after all other scripts)

   Delivers real-time in-app + browser push notifications when:
   ❤️  Someone likes your YourStyle post
   💬  Someone comments on your post
   👥  Someone starts following you
   🔁  Someone likes a post you commented on (mention chain)

   Architecture:
   • localStorage as the notification store (key: afrib_notifications)
   • BroadcastChannel API for cross-tab delivery (same browser, same origin)
   • StorageEvent fallback for browsers without BroadcastChannel
   • Browser Push Notification API (if permission granted)
   • Animated in-app toast with avatar + action button
   • Debouncing — max 1 like notification per post per 60s to prevent spam
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

(function AfribSocialNotifs() {

  /* ─────────────────────────────────────────────────────────────────────────
     §0  CONSTANTS
  ───────────────────────────────────────────────────────────────────────── */
  const NOTIF_KEY       = 'afrib_notifications';
  const NOTIF_CHAN      = 'afrib_notif_chan';       // BroadcastChannel name
  const DEBOUNCE_KEY    = 'afrib_notif_debounce';  // throttle store
  const DEBOUNCE_MS     = 60_000;                  // 60s between like notifs on same post
  const MAX_NOTIFS      = 100;
  const log = (...a) => console.log('%c[Notifs]', 'color:#D4AF37;font-weight:700', ...a);

  /* ─────────────────────────────────────────────────────────────────────────
     §1  CORE STORAGE HELPERS
  ───────────────────────────────────────────────────────────────────────── */
  function _read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch(e) { return fallback; }
  }
  function _write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) {}
  }

  /* ─────────────────────────────────────────────────────────────────────────
     §2  CROSS-TAB CHANNEL (BroadcastChannel + StorageEvent fallback)
  ───────────────────────────────────────────────────────────────────────── */
  let _bc = null;
  (function initChannel() {
    try {
      _bc = new BroadcastChannel(NOTIF_CHAN);
      _bc.onmessage = e => _onChannelMessage(e.data);
    } catch(e) {
      // StorageEvent fallback
      window.addEventListener('storage', ev => {
        if (ev.key === '_afrib_notif_msg') {
          try { _onChannelMessage(JSON.parse(ev.newValue || '{}')); } catch(_) {}
        }
      });
    }
  })();

  function _broadcast(msg) {
    try {
      if (_bc) { _bc.postMessage(msg); }
      else {
        // Fallback: write + delete to trigger StorageEvent in other tabs
        _write('_afrib_notif_msg', msg);
        setTimeout(() => { try { localStorage.removeItem('_afrib_notif_msg'); } catch(e) {} }, 200);
      }
    } catch(e) {}
  }

  function _onChannelMessage(data) {
    if (!data || data.type !== 'new_notif') return;
    const session = _read('afrib_session', null);
    if (!session) return;
    // Only show if the notification is for the current logged-in user
    if (data.recipientEmail !== session.email) return;
    // Store it
    _storeNotif(data.notif);
    // Show the toast
    _showSocialToast(data.notif);
    // Browser push
    _sendBrowserPush(data.notif.title, data.notif.body, data.notif.icon);
  }

  /* ─────────────────────────────────────────────────────────────────────────
     §3  NOTIFICATION STORE
  ───────────────────────────────────────────────────────────────────────── */
  function _storeNotif(notif) {
    const notifs = _read(NOTIF_KEY, []);
    // Dedup by id
    if (notifs.find(n => n.id === notif.id)) return;
    notifs.unshift(notif);
    if (notifs.length > MAX_NOTIFS) notifs.length = MAX_NOTIFS;
    _write(NOTIF_KEY, notifs);
    // Sync legacy key
    _write('afrib_user_notifs', notifs);
    // Update badge
    _updateBadge(notifs.filter(n => !n.read).length);
    // Refresh open panel
    try {
      const panel = document.getElementById('notifPanel');
      if (panel && panel.style.display !== 'none' && typeof _renderNotifPanel === 'function') {
        _renderNotifPanel(panel);
      }
    } catch(e) {}
  }

  function _updateBadge(count) {
    const badge = document.getElementById('notifBadge');
    if (!badge) return;
    badge.textContent = count > 99 ? '99+' : String(count);
    badge.style.display = count > 0 ? 'flex' : 'none';
    // Pulse animation
    badge.style.animation = 'none';
    badge.offsetHeight; // reflow
    badge.style.animation = 'notifBadgePop .35s cubic-bezier(.36,.07,.19,.97)';
  }

  /* ─────────────────────────────────────────────────────────────────────────
     §4  DEBOUNCE — prevent notification spam on rapid likes
  ───────────────────────────────────────────────────────────────────────── */
  function _isDebounced(key) {
    const store = _read(DEBOUNCE_KEY, {});
    const last  = store[key] || 0;
    return (Date.now() - last) < DEBOUNCE_MS;
  }
  function _setDebounce(key) {
    const store = _read(DEBOUNCE_KEY, {});
    store[key] = Date.now();
    // Trim old entries
    const now = Date.now();
    Object.keys(store).forEach(k => { if (now - store[k] > DEBOUNCE_MS * 10) delete store[k]; });
    _write(DEBOUNCE_KEY, store);
  }

  /* ─────────────────────────────────────────────────────────────────────────
     §5  DELIVER NOTIFICATION — write + broadcast
  ───────────────────────────────────────────────────────────────────────── */
  function _deliver(recipientEmail, notif) {
    if (!recipientEmail) return;

    // If recipient is currently viewing this tab — show directly
    const session = _read('afrib_session', null);
    const isCurrentUser = session && session.email === recipientEmail;

    if (isCurrentUser) {
      _storeNotif(notif);
      _showSocialToast(notif);
      _sendBrowserPush(notif.title, notif.body, notif.icon);
    } else {
      // Cross-tab: broadcast and store
      _storeNotif(notif);   // store so other tab picks it up via storage key
      _broadcast({ type: 'new_notif', recipientEmail, notif });
    }
  }

  /* ─────────────────────────────────────────────────────────────────────────
     §6  BEAUTIFUL IN-APP TOAST — floating card with avatar
  ───────────────────────────────────────────────────────────────────────── */
  function _showSocialToast(notif) {
    // Inject keyframes once
    if (!document.getElementById('afrib-notif-styles')) {
      const style = document.createElement('style');
      style.id = 'afrib-notif-styles';
      style.textContent = `
        @keyframes notifSlideIn {
          from { opacity:0; transform:translateX(110%); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes notifSlideOut {
          from { opacity:1; transform:translateX(0); }
          to   { opacity:0; transform:translateX(110%); }
        }
        @keyframes notifBadgePop {
          0%,100% { transform:scale(1); }
          30%     { transform:scale(1.5); }
          60%     { transform:scale(.9); }
        }
        @keyframes notifHeartBurst {
          0%   { transform:scale(1); }
          40%  { transform:scale(1.6); }
          70%  { transform:scale(.85); }
          100% { transform:scale(1); }
        }
        .afrib-notif-toast {
          position:fixed;
          top:72px;
          right:16px;
          z-index:99999;
          max-width:340px;
          min-width:280px;
          background:rgba(13,10,20,.97);
          border:1px solid rgba(212,175,55,.25);
          border-radius:16px;
          padding:14px 16px;
          display:flex;
          align-items:flex-start;
          gap:12px;
          box-shadow:0 12px 48px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.04);
          backdrop-filter:blur(20px);
          cursor:pointer;
          animation:notifSlideIn .4s cubic-bezier(.16,1,.3,1) forwards;
          font-family:var(--font-b,'Space Grotesk',system-ui,sans-serif);
        }
        .afrib-notif-toast:hover { border-color:rgba(212,175,55,.45); }
        .afrib-notif-toast.leaving { animation:notifSlideOut .35s ease forwards; }
        .afrib-notif-avatar {
          width:40px;height:40px;border-radius:50%;
          background:linear-gradient(135deg,#D4AF37,#E85D26);
          color:#07050A;font-weight:800;font-size:15px;
          display:flex;align-items:center;justify-content:center;
          flex-shrink:0;position:relative;
        }
        .afrib-notif-avatar-icon {
          position:absolute;bottom:-3px;right:-3px;
          width:18px;height:18px;border-radius:50%;
          background:#07050A;border:2px solid rgba(13,10,20,.97);
          display:flex;align-items:center;justify-content:center;
          font-size:9px;line-height:1;
        }
        .afrib-notif-close {
          margin-left:auto;background:none;border:none;
          color:rgba(255,255,255,.25);cursor:pointer;
          font-size:14px;padding:0 0 0 4px;flex-shrink:0;
          transition:color .2s;
        }
        .afrib-notif-close:hover { color:rgba(255,255,255,.6); }
        .afrib-notif-title {
          font-size:13px;font-weight:700;color:#fff;
          line-height:1.3;margin-bottom:2px;
        }
        .afrib-notif-body {
          font-size:11px;color:rgba(255,255,255,.5);
          line-height:1.5;
        }
        .afrib-notif-time {
          font-size:10px;color:rgba(255,255,255,.25);
          margin-top:4px;
        }
        .afrib-notif-action {
          margin-top:8px;
          display:inline-block;
          background:rgba(212,175,55,.1);
          border:1px solid rgba(212,175,55,.2);
          color:var(--gold,#D4AF37);
          font-size:11px;font-weight:700;
          padding:4px 12px;border-radius:100px;
          cursor:pointer;transition:all .2s;
        }
        .afrib-notif-action:hover {
          background:rgba(212,175,55,.2);
        }
      `;
      document.head.appendChild(style);
    }

    // Dismiss any existing toast of same type
    const existing = document.querySelector('.afrib-notif-toast[data-notif-type="' + notif.type + '"]');
    if (existing) _dismissToast(existing, true);

    const initials = notif._senderInitials || notif.icon || '🔔';
    const isEmoji  = /\p{Emoji}/u.test(initials) && initials.length <= 2;

    const toast = document.createElement('div');
    toast.className = 'afrib-notif-toast';
    toast.setAttribute('data-notif-type', notif.type || 'system');
    toast.title = 'Click to view';

    toast.innerHTML = `
      <div class="afrib-notif-avatar" style="${isEmoji ? 'font-size:20px;' : ''}">
        ${isEmoji ? initials : (initials.slice(0,2).toUpperCase())}
        <div class="afrib-notif-avatar-icon">${notif.icon || '🔔'}</div>
      </div>
      <div style="flex:1;min-width:0">
        <div class="afrib-notif-title">${_esc(notif.title)}</div>
        ${notif.body ? `<div class="afrib-notif-body">${_esc(notif.body)}</div>` : ''}
        <div class="afrib-notif-time">Just now</div>
        ${notif.action ? `<div class="afrib-notif-action" onclick="event.stopPropagation();${notif.action}">View post →</div>` : ''}
      </div>
      <button class="afrib-notif-close" onclick="event.stopPropagation();this.closest('.afrib-notif-toast') && _dismissSocialToast(this.closest('.afrib-notif-toast'))">✕</button>
    `;

    // Click → go to YourStyle / notifications
    toast.addEventListener('click', () => {
      _dismissToast(toast);
      try {
        if (notif.action) { if (typeof window._afribSafeNotifAction === 'function') { window._afribSafeNotifAction(notif.action); } else if (typeof showScreen === 'function') { showScreen('style'); } }
        else if (typeof showScreen === 'function') { showScreen('style'); }
      } catch(e) {}
    });

    document.body.appendChild(toast);

    // Auto-dismiss after 6s
    toast._timer = setTimeout(() => _dismissToast(toast), 6000);
    // Pause on hover
    toast.addEventListener('mouseenter', () => clearTimeout(toast._timer));
    toast.addEventListener('mouseleave', () => {
      toast._timer = setTimeout(() => _dismissToast(toast), 3000);
    });
  }

  function _dismissToast(toast, immediate) {
    clearTimeout(toast._timer);
    if (immediate) { toast.remove(); return; }
    toast.classList.add('leaving');
    setTimeout(() => toast.remove(), 400);
  }
  // Expose for inline onclick
  window._dismissSocialToast = _dismissToast;

  function _esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ─────────────────────────────────────────────────────────────────────────
     §7  BROWSER PUSH NOTIFICATION
  ───────────────────────────────────────────────────────────────────────── */
  function _sendBrowserPush(title, body, iconEmoji) {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    try {
      new Notification(title, {
        body: body || '',
        icon: './icon-192.png',
        tag:  'afrib-social-' + Date.now(),
        badge: './icon-192.png',
      });
    } catch(e) {}
  }

  /* Request push permission on first like action */
  function _maybeRequestPushPermission() {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'default') return;
    Notification.requestPermission().catch(() => {});
  }

  /* ─────────────────────────────────────────────────────────────────────────
     §8  PATCH: togglePostLike — the main hook
  ───────────────────────────────────────────────────────────────────────── */
  (function patchTogglePostLike() {
    function waitAndPatch() {
      if (typeof window.togglePostLike !== 'function') {
        setTimeout(waitAndPatch, 300); return;
      }
      if (window.togglePostLike._socialNotif) return;

      const _orig = window.togglePostLike;
      window.togglePostLike = function(postId, btn) {
        // Run original first so likes are saved
        _orig.call(this, postId, btn);

        try {
          const me = window.currentUser || _read('afrib_session', null);
          if (!me) return;

          // Check if we just liked (not un-liked) by reading updated likes list
          const likes = _readPostLikes(postId);
          const justLiked = likes.includes(me.email);
          if (!justLiked) return; // it was an un-like, no notification

          // Get the post to find the author
          const post = _findPost(postId);
          if (!post) return;
          if (post.authorEmail === me.email) return; // own post, no notif

          // Debounce — don't spam the author with every like
          const debounceKey = `like_${postId}_${post.authorEmail}`;
          if (_isDebounced(debounceKey)) return;
          _setDebounce(debounceKey);

          // Build notification
          const senderName = ((me.first || '') + ' ' + (me.last || '')).trim() || 'Someone';
          const initials   = ((me.first || 'A')[0] + (me.last || 'A')[0]).toUpperCase();
          const preview    = post.caption ? (post.caption.slice(0, 55) + (post.caption.length > 55 ? '…' : '')) : '📷 your photo';

          const notif = {
            id:               'like_' + Date.now() + '_' + Math.random().toString(36).slice(2,5),
            type:             'social',
            icon:             '❤️',
            title:            senderName + ' liked your post',
            body:             '"' + preview + '"',
            action:           "showScreen('style')",
            read:             false,
            time:             new Date().toISOString(),
            _senderInitials:  initials,
            _postId:          postId,
          };

          _deliver(post.authorEmail, notif);
          _maybeRequestPushPermission();

          // Heart burst animation on button
          if (btn) {
            btn.style.animation = 'none';
            btn.offsetHeight;
            btn.style.animation = 'notifHeartBurst .45s ease';
          }

        } catch(err) {
          console.warn('[Notifs] togglePostLike patch error:', err);
        }
      };
      window.togglePostLike._socialNotif = true;
      log('❤️  Like notifications patched ✅');
    }
    waitAndPatch();
  })();

  /* ─────────────────────────────────────────────────────────────────────────
     §9  PATCH: addComment — notify post author on new comment
  ───────────────────────────────────────────────────────────────────────── */
  (function patchAddComment() {
    function waitAndPatch() {
      if (typeof window.addComment !== 'function') {
        setTimeout(waitAndPatch, 300); return;
      }
      if (window.addComment._socialNotif) return;

      const _orig = window.addComment;
      window.addComment = function(postId) {
        // Get comment text before original runs (it clears the input)
        const inputEl = document.getElementById('newComment');
        const commentText = inputEl?.value.trim() || '';

        _orig.call(this, postId);

        try {
          const me = window.currentUser || _read('afrib_session', null);
          if (!me || !commentText) return;

          const post = _findPost(postId);
          if (!post) return;
          if (post.authorEmail === me.email) return; // own post

          const senderName = ((me.first || '') + ' ' + (me.last || '')).trim() || 'Someone';
          const initials   = ((me.first || 'A')[0] + (me.last || 'A')[0]).toUpperCase();
          const preview    = commentText.slice(0, 60) + (commentText.length > 60 ? '…' : '');

          const notif = {
            id:               'comment_' + Date.now() + '_' + Math.random().toString(36).slice(2,5),
            type:             'social',
            icon:             '💬',
            title:            senderName + ' commented on your post',
            body:             '"' + preview + '"',
            action:           "showScreen('style')",
            read:             false,
            time:             new Date().toISOString(),
            _senderInitials:  initials,
            _postId:          postId,
          };

          _deliver(post.authorEmail, notif);

        } catch(err) {
          console.warn('[Notifs] addComment patch error:', err);
        }
      };
      window.addComment._socialNotif = true;
      log('💬 Comment notifications patched ✅');
    }
    waitAndPatch();
  })();

  /* ─────────────────────────────────────────────────────────────────────────
     §10  PATCH: toggleStyleFollowBtn — notify user when followed
  ───────────────────────────────────────────────────────────────────────── */
  (function patchFollow() {
    function waitAndPatch() {
      if (typeof window.toggleStyleFollowBtn !== 'function') {
        setTimeout(waitAndPatch, 300); return;
      }
      if (window.toggleStyleFollowBtn._socialNotif) return;

      const _orig = window.toggleStyleFollowBtn;
      window.toggleStyleFollowBtn = function(targetEmail, btn) {
        // Check current follow state BEFORE the toggle
        const me = window.currentUser || _read('afrib_session', null);
        const wasFollowing = me ? _isFollowing(me.email, targetEmail) : false;

        _orig.call(this, targetEmail, btn);

        try {
          if (!me) return;
          if (me.email === targetEmail) return;

          const nowFollowing = !wasFollowing; // toggled
          if (!nowFollowing) return; // unfollowed — no notification

          const senderName = ((me.first || '') + ' ' + (me.last || '')).trim() || 'Someone';
          const initials   = ((me.first || 'A')[0] + (me.last || 'A')[0]).toUpperCase();

          const notif = {
            id:               'follow_' + Date.now() + '_' + Math.random().toString(36).slice(2,5),
            type:             'social',
            icon:             '👥',
            title:            senderName + ' started following you',
            body:             'Tap to view their profile on YourStyle',
            action:           "showScreen('style')",
            read:             false,
            time:             new Date().toISOString(),
            _senderInitials:  initials,
          };

          _deliver(targetEmail, notif);

        } catch(err) {
          console.warn('[Notifs] toggleStyleFollowBtn patch error:', err);
        }
      };
      window.toggleStyleFollowBtn._socialNotif = true;
      log('👥 Follow notifications patched ✅');
    }
    waitAndPatch();
  })();

  /* ─────────────────────────────────────────────────────────────────────────
     §11  HELPERS — find post and read likes from correct storage
  ───────────────────────────────────────────────────────────────────────── */
  function _findPost(postId) {
    try {
      const posts = JSON.parse(localStorage.getItem('afrib_style_posts') || '[]');
      return posts.find(p => p.id === postId) || null;
    } catch(e) { return null; }
  }

  function _readPostLikes(postId) {
    try {
      return JSON.parse(localStorage.getItem('afrib_style_likes_' + postId) || '[]');
    } catch(e) { return []; }
  }

  function _isFollowing(myEmail, targetEmail) {
    try {
      const list = JSON.parse(localStorage.getItem('afrib_style_following_' + myEmail) || '[]');
      return list.includes(targetEmail);
    } catch(e) { return false; }
  }

  /* ─────────────────────────────────────────────────────────────────────────
     §12  NOTIFICATION PANEL BADGE — keep in sync on every storage change
  ───────────────────────────────────────────────────────────────────────── */
  window.addEventListener('storage', e => {
    if (e.key === NOTIF_KEY) {
      try {
        const notifs = JSON.parse(e.newValue || '[]');
        _updateBadge(notifs.filter(n => !n.read).length);
      } catch(_) {}
    }
  });

  /* ─────────────────────────────────────────────────────────────────────────
     §13  PUBLIC API — expose for external use
  ───────────────────────────────────────────────────────────────────────── */
  window.AfribNotifs = {
    deliver:    _deliver,
    storeNotif: _storeNotif,
    updateBadge: count => _updateBadge(count),
    showToast:  _showSocialToast,
    /** Send a like notification manually (for testing or admin use) */
    testLikeNotif: function() {
      const me = window.currentUser || _read('afrib_session', null);
      if (!me) { console.warn('Not logged in'); return; }
      _deliver(me.email, {
        id: 'test_' + Date.now(),
        type: 'social',
        icon: '❤️',
        title: 'TestUser liked your post',
        body: '"Beautiful look! Love the Kente pattern 🌍"',
        action: "showScreen('style')",
        read: false,
        time: new Date().toISOString(),
        _senderInitials: 'TU',
      });
    },
  };

  log('🔔 Social notification engine loaded ✅  (like + comment + follow)');

})();
