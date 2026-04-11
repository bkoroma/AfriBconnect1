/* ═══════════════════════════════════════════════════════════════════════════
   AfribConnect — AUDIT FIX  (afrib_audit_fix.js)
   Load LAST (after afrib_connect_all.js)

   Fixes applied:
   1. Home Profile Card  — populates hpcAvatar, hpcName, hpcUsername, hpcCountry, hpcRole, hpcKyc
   2. Home Notification Bell — syncs homeNotifBadge + botNavNotifBadge with notifBadge
   3. Home Avatar pill — populates homeAvatar + homeAvatarName
   4. Storage bridge — ensures AfribStorage.connect() is called on app entry
   5. doLogout cloud sync — marks user offline in cloud before clearing session
   6. Notification badge sync — one function keeps ALL three badges in sync
   7. EmailJS key — stores key from admin config to localStorage for init
   8. Bottom nav active state — keeps abn-item active on screen switch
   9. Session restore — re-hydrates home profile card on page reload
   10. Missing toggleUserDropdown guard — ensures dropdown is positioned correctly on mobile
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

(function AfribAuditFix() {

  const $ = id => document.getElementById(id);
  const log = (...a) => console.log('%c[AuditFix]', 'color:#D4AF37;font-weight:700', ...a);

  /* ─────────────────────────────────────────────────────────────────
     §1  HOME PROFILE CARD — populate from currentUser
  ───────────────────────────────────────────────────────────────────*/
  function renderHomeProfileCard() {
    try {
      const u = window.currentUser;
      if (!u) return;

      const initials = ((u.first || 'U')[0] + (u.last || '')[0]).toUpperCase();
      const fullName = ((u.first || '') + ' ' + (u.last || '')).trim() || u.email;
      const username = u.username ? '@' + u.username : (u.email ? u.email.split('@')[0] : '');
      const country  = u.country || '🌍 Africa';
      const role     = u.profession || u.role || 'Member';
      const verified = u.kyc === 'verified' || u.verified ||
                       (u.linkedPayments && u.linkedPayments.length > 0);

      // Unified strip elements
      const hpcA = $('hpcAvatar');
      const hpcN = $('hpcName');
      const hpcU = $('hpcUsername');
      const hpcC = $('hpcCountry');
      const hpcR = $('hpcRole');
      const hpcK = $('hpcKyc');

      if (hpcA) { hpcA.textContent = initials; }
      if (hpcN) { hpcN.textContent = fullName; }
      if (hpcU) { hpcU.textContent = username; }
      if (hpcC) { hpcC.textContent = country; }
      if (hpcR) { hpcR.textContent = role; }
      if (hpcK) {
        hpcK.style.display = verified ? 'inline-block' : 'none';
        hpcK.textContent   = '✓ Verified';
      }

      // Compat: hidden elements for legacy JS references
      const hA  = $('homeAvatar');
      const hAN = $('homeAvatarName');
      if (hA)  { hA.textContent = initials; }
      if (hAN) { hAN.textContent = u.first || username || 'You'; }

      // Sync nav strip active state with current screen
      _syncHusNavActive();

      log('Unified home strip rendered for', fullName);
    } catch(e) { console.error('[AuditFix] renderHomeProfileCard:', e); }
  }

  /** Keep hus-nav-btn.active in sync with current screen */
  function _syncHusNavActive() {
    try {
      const active = document.querySelector('.screen.active');
      if (!active) return;
      const screenName = active.id.replace('screen-','');
      document.querySelectorAll('.hus-nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.screen === screenName);
      });
    } catch(e) {}
  }
  window._syncHusNavActive = _syncHusNavActive;

  // Expose globally for _H50.renderAll and afrib_connect_all.js
  window.renderHomeProfileCard = renderHomeProfileCard;

  /* ─────────────────────────────────────────────────────────────────
     §2  NOTIFICATION BADGE SYNC — keep all 3 badge elements in sync
  ───────────────────────────────────────────────────────────────────*/
  const NOTIF_KEY = 'afrib_notifications';

  function syncNotifBadges() {
    try {
      const notifs = JSON.parse(localStorage.getItem(NOTIF_KEY) || '[]');
      const unread = notifs.filter(n => !n.read).length;
      const ids = ['notifBadge', 'homeNotifBadge', 'botNavNotifBadge', 'msgNavBadge'];
      ids.forEach(id => {
        const el = $(id);
        if (!el) return;
        if (unread > 0) {
          el.textContent = unread > 99 ? '99+' : unread;
          el.style.display = 'flex';
        } else {
          el.style.display = 'none';
        }
      });
    } catch(e) {}
  }

  // Poll badges every 15s and on storage events
  setInterval(syncNotifBadges, 15000);
  window.addEventListener('storage', e => {
    if (e.key === NOTIF_KEY) syncNotifBadges();
  });

  // Expose globally so toggleNotifPanel can call it after marking read
  window._syncNotifBadges = syncNotifBadges;

  /* ─────────────────────────────────────────────────────────────────
     §3  PATCH toggleNotifPanel — sync badges after panel closes
  ───────────────────────────────────────────────────────────────────*/
  (function patchToggleNotifPanel() {
    const orig = window.toggleNotifPanel;
    if (typeof orig !== 'function') return;
    window.toggleNotifPanel = function() {
      orig.apply(this, arguments);
      // Sync badges after a short delay (so read marks are applied first)
      setTimeout(syncNotifBadges, 200);
    };
  })();

  /* §4  doLogout cloud sync — already handled by storage_bridge.js tryPatchLogout()
     No double-wrap needed here. */

  /* ─────────────────────────────────────────────────────────────────
     §5  PATCH enterApp — ensure storage connects + home card renders
  ───────────────────────────────────────────────────────────────────*/
  /* §5 enterApp patch — storage_bridge.js handles cloud sync.
     We only add the home profile card render here, chained after all patches settle. */
  (function chainEnterApp() {
    const _hookEnterApp = () => {
      const orig = window.enterApp;
      if (typeof orig !== 'function') { setTimeout(_hookEnterApp, 300); return; }
      const _tagged = orig._auditFixed;
      if (_tagged) return; // already patched
      window.enterApp = function(screen) {
        orig.apply(this, arguments);
        setTimeout(() => { renderHomeProfileCard(); syncNotifBadges(); }, 200);
      };
      window.enterApp._auditFixed = true;
    };
    _hookEnterApp();
  })();

  /* ─────────────────────────────────────────────────────────────────
     §6  PATCH showScreen — refresh home card when user returns to home
  ───────────────────────────────────────────────────────────────────*/
  (function patchShowScreen() {
    const orig = window.showScreen;
    window.showScreen = function(name) {
      if (typeof orig === 'function') orig.apply(this, arguments);
      // Sync hus-nav-btn active state for any screen switch
      setTimeout(() => {
        document.querySelectorAll('.hus-nav-btn').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.screen === name);
        });
        // Also sync the regular bottom nav items
        document.querySelectorAll('.abn-item[data-screen]').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.screen === name);
        });
      }, 10);
      if (name === 'home') {
        setTimeout(() => {
          renderHomeProfileCard();
          syncNotifBadges();
        }, 80);
      }
    };
  })();

  /* ─────────────────────────────────────────────────────────────────
     §7  PATCH toggleUserDropdown — ensure mobile positioning
  ───────────────────────────────────────────────────────────────────*/
  (function patchToggleUserDropdown() {
    const orig = window.toggleUserDropdown;
    if (typeof orig !== 'function') return;
    window.toggleUserDropdown = function() {
      orig.apply(this, arguments);
      // On mobile, ensure dropdown is visible (not clipped off screen)
      try {
        const dd = $('userDropdown');
        if (dd && dd.style.display === 'block') {
          const rect = dd.getBoundingClientRect();
          if (rect.right > window.innerWidth) {
            dd.style.right = '8px';
            dd.style.left  = 'auto';
          }
          if (rect.bottom > window.innerHeight) {
            dd.style.bottom = '80px';
            dd.style.top    = 'auto';
          }
        }
      } catch(e) {}
    };
  })();

  /* ─────────────────────────────────────────────────────────────────
     §8  STORAGE BRIDGE INIT — connect on page load
  ───────────────────────────────────────────────────────────────────*/
  function initStorageBridge() {
    try {
      if (window.AfribStorage && typeof window.AfribStorage.connect === 'function') {
        window.AfribStorage.connect().then(r => {
          log('Storage bridge:', r.ok ? '✅ Connected to ' + (r.provider || 'provider') : '⚠️ ' + (r.reason || 'local fallback'));
        }).catch(e => {
          log('Storage bridge connect error:', e.message);
        });
      }
    } catch(e) {}
  }

  /* ─────────────────────────────────────────────────────────────────
     §9  MISSING FUNCTION GUARDS — prevent console errors
  ───────────────────────────────────────────────────────────────────*/
  const guards = [
    'renderTrending','renderHomeXP','updateBalanceDisplay','initWalletScreen',
    'renderProfiles','filterProfiles','renderMarketProducts','initGamesScreen',
    'openSend','openTopUp','openRequestMoney','openSavingsGoals',
    'showAchievementsPanel','copyReferralCode','shareApp',
    'showLinkedPayments','saveProfile','showAccountSettings',
    'openSellerDashboard','openCart','openGlobalSearch','toggleTheme',
    '_markAllNotifsRead','_clearAllNotifs','setNotifFilter',
    'showLudoLobby','showSnakeLobby','showDrinkUpLobby','showTodLobby',
    'gmOpenWalletGift','showProfileModal'
  ];
  guards.forEach(fn => {
    if (typeof window[fn] !== 'function') {
      window[fn] = function() {
        console.warn('[AuditFix] ' + fn + ' called before definition — guard triggered');
      };
    }
  });

  /* ─────────────────────────────────────────────────────────────────
     §10  SESSION RESTORE on page reload
  ───────────────────────────────────────────────────────────────────*/
  function tryRestoreSession() {
    try {
      // If session already restored by script.js, just sync the UI
      if (window.currentUser) {
        renderHomeProfileCard();
        syncNotifBadges();
        return;
      }
      // Try reading from session storage
      const sessionRaw = localStorage.getItem('afrib_session');
      if (!sessionRaw) return;
      const session = JSON.parse(sessionRaw);
      if (!session || !session.email) return;

      // Get full user object
      const accountsRaw = localStorage.getItem('afrib_accounts');
      if (!accountsRaw) return;
      const accounts = JSON.parse(accountsRaw);
      const user = accounts[session.email];
      if (!user) return;

      window.currentUser = user;
      renderHomeProfileCard();
      syncNotifBadges();
      log('Session restored for', user.email);
    } catch(e) {}
  }

  /* ─────────────────────────────────────────────────────────────────
     §11A  HUS BUTTON HANDLERS — Profile + Logout from unified strip
     These are global functions called directly by the strip buttons.
     They are robust: guard against missing currentUser, close any
     open dropdown, and give user feedback on failure.
  ───────────────────────────────────────────────────────────────────*/

  /** Open profile modal from the unified home strip */
  window.husOpenProfile = function() {
    try {
      // Close user dropdown if somehow open
      const dd = document.getElementById('userDropdown');
      if (dd) dd.style.display = 'none';

      // Guard: must be logged in
      if (!window.currentUser) {
        console.warn('[AuditFix] husOpenProfile: no currentUser');
        if (typeof window.showToast === 'function') {
          window.showToast('⚠️ Please sign in to view your profile');
        }
        return;
      }

      // Call the main profile modal function
      if (typeof window.showProfileModal === 'function') {
        window.showProfileModal();
      } else {
        console.warn('[AuditFix] husOpenProfile: showProfileModal not defined yet');
        if (typeof window.showToast === 'function') {
          window.showToast('Profile loading… please try again');
        }
      }
    } catch(e) {
      console.error('[AuditFix] husOpenProfile error:', e);
    }
  };

  /** Sign out from the unified home strip */
  window.husLogout = function() {
    try {
      if (!window.currentUser) {
        // Already logged out — go to landing
        if (typeof window.showLanding === 'function') window.showLanding();
        return;
      }

      const name = window.currentUser.first || 'there';
      // Use confirm dialog
      const confirmed = window.confirm(
        'Sign out of AfriBConnect, ' + name + '?'
      );

      if (!confirmed) return;

      // Call the real logout function
      if (typeof window.doLogout === 'function') {
        window.doLogout();
      } else {
        // Hard fallback: clear session and reload
        try { localStorage.removeItem('afrib_session'); } catch(_) {}
        window.currentUser = null;
        window.location.reload();
      }
    } catch(e) {
      console.error('[AuditFix] husLogout error:', e);
      // Last-resort fallback
      try {
        localStorage.removeItem('afrib_session');
        window.location.reload();
      } catch(_) {}
    }
  };

  /* ─────────────────────────────────────────────────────────────────
     §11  EMAIL CONFIG — save emailjs key from admin settings
  ───────────────────────────────────────────────────────────────────*/
  function wireEmailJSConfig() {
    try {
      const cfg = JSON.parse(localStorage.getItem('afrib_email_config') || 'null');
      if (cfg && cfg.ejs_publicKey && cfg.ejs_publicKey.length > 4 && window.emailjs && emailjs.init) {
        emailjs.init(cfg.ejs_publicKey);
        log('EmailJS initialized from afrib_email_config');
      }
    } catch(e) {}
  }

  /* ─────────────────────────────────────────────────────────────────
     §12  BOOT SEQUENCE
  ───────────────────────────────────────────────────────────────────*/
  function boot() {
    log('Audit Fix booting…');
    initStorageBridge();
    wireEmailJSConfig();
    tryRestoreSession();
    syncNotifBadges();
    setTimeout(initMicroInteractions, 600);

    // Re-render home profile card when auth completes
    document.addEventListener('afrib:login', () => {
      setTimeout(() => { renderHomeProfileCard(); syncNotifBadges(); }, 100);
    });

    // Watch for currentUser changes (polling fallback)
    let _lastUser = null;
    setInterval(() => {
      const u = window.currentUser;
      const key = u ? u.email : null;
      if (key !== _lastUser) {
        _lastUser = key;
        if (u) { renderHomeProfileCard(); syncNotifBadges(); }
      }
    }, 2000);

    log('✅ Audit Fix ready');
  }

  /* ─────────────────────────────────────────────────────────────────
     §13  MICRO-INTERACTIONS — ripple, press feedback, nav transitions
  ───────────────────────────────────────────────────────────────────*/
  function initMicroInteractions() {
    // Add ripple effect to profile and logout buttons
    document.addEventListener('click', function(e) {
      const btn = e.target.closest('.hus-btn-profile, .hus-btn-logout, .hus-nav-btn');
      if (!btn) return;

      // Create ripple
      const ripple = document.createElement('span');
      const rect   = btn.getBoundingClientRect();
      const size   = Math.max(rect.width, rect.height) * 2;
      ripple.style.cssText = [
        `width:${size}px`, `height:${size}px`,
        `left:${e.clientX - rect.left - size/2}px`,
        `top:${e.clientY - rect.top - size/2}px`,
        'position:absolute', 'border-radius:50%',
        'background:rgba(255,255,255,0.15)',
        'pointer-events:none', 'transform:scale(0)',
        'animation:husRipple 0.5s ease-out forwards',
      ].join(';');
      btn.style.overflow = 'hidden';
      btn.style.position = btn.style.position || 'relative';
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 520);
    });

    // Inject ripple keyframe CSS if not present
    if (!document.getElementById('hus-ripple-css')) {
      const s = document.createElement('style');
      s.id = 'hus-ripple-css';
      s.textContent = '@keyframes husRipple{to{transform:scale(1);opacity:0}}';
      document.head.appendChild(s);
    }

    // Smooth avatar entrance animation when profile card first renders
    const strip = document.getElementById('homeProfileCard');
    if (strip) {
      const avatar = strip.querySelector('.hus-avatar');
      if (avatar && !avatar._animated) {
        avatar.style.opacity = '0';
        avatar.style.transform = 'scale(0.7) rotate(-10deg)';
        avatar.style.transition = 'opacity 0.4s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';
        setTimeout(() => {
          avatar.style.opacity = '1';
          avatar.style.transform = 'scale(1) rotate(0deg)';
          avatar._animated = true;
        }, 150);
      }
    }

    log('Micro-interactions active');
  }

  /* Patch renderHomeProfileCard to trigger entrance animation */
  const _origRender = window.renderHomeProfileCard;
  window.renderHomeProfileCard = function() {
    if (typeof _origRender === 'function') _origRender.apply(this, arguments);
    // Reset animation for fresh card on each login
    try {
      const avatar = document.querySelector('.hus-avatar');
      if (avatar) { avatar._animated = false; }
      setTimeout(initMicroInteractions, 50);
    } catch(e) {}
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
