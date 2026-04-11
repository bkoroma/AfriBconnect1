/* ════════════════════════════════════════════════════════════════════
   AfribConnect — v62 Profile & Logout Fix
   Fixes:
     1. husOpenProfile / husLogout — bridge window.currentUser to
        script.js file-scoped `let currentUser` so guard checks
        never fail when the user IS logged in.
     2. showProfileModal — null-guard on every getElementById call.
     3. doLogout — null-guard on userDropdown before touching it.
     4. Duplicate script protection (afrib_live_upgrade / afrib_app_upgrade).
   ════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── 1. Bridge window.currentUser ↔ script.js let currentUser ──────
     script.js sets `currentUser` (a file-scoped let). Patch-files
     check `window.currentUser`. We wrap enterApp and doLogout so that
     after every login/logout the two stay in sync.                    */

  function installCurrentUserBridge() {
    if (window.__afribCurrentUserBridged) return;

    const _origEnterApp = window.enterApp;
    window.enterApp = function () {
      const r = _origEnterApp && _origEnterApp.apply(this, arguments);
      try {
        if (!window.currentUser && typeof getSession === 'function') {
          const sess = getSession();
          if (sess && sess.email) window.currentUser = sess;
        }
      } catch (_) {}
      return r;
    };

    window.__afribCurrentUserBridged = true;
  }

  /* ── 2. Null-safe showProfileModal ─────────────────────────────── */

  function installSafeShowProfileModal() {
    window.showProfileModal = function () {
      const dd = document.getElementById('userDropdown');
      if (dd) dd.style.display = 'none';

      let user = window.currentUser;
      if (!user && typeof getSession === 'function') {
        user = getSession();
        if (user && user.email) window.currentUser = user;
      }
      if (!user) return;

      function setText(id, val) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
      }
      function setVal(id, val) {
        const el = document.getElementById(id);
        if (el) el.value = val;
      }

      const initials = (
        ((user.first || 'U')[0]) + ((user.last || '')[0] || '')
      ).toUpperCase();

      setText('pmAvatar',   initials);
      setText('pmName',     (user.first || '') + ' ' + (user.last || ''));
      setText('pmUsername', user.username ? '@' + user.username : '');
      setText('pmRole',     user.profession || 'AfriBconnect Member');
      setText('pmCountry',  user.country ? '\uD83D\uDCCD ' + user.country : '');
      setText('pmBio',      user.bio || '');

      const connSize = (window.connectedProfiles instanceof Set)
        ? window.connectedProfiles.size
        : (window.connectedProfiles ? Object.keys(window.connectedProfiles).length : 0);
      setText('pmConnections', connSize);
      setText('pmScore', window.triviaScore || 0);

      const bal = typeof window.walletBalance === 'number' ? window.walletBalance : 0;
      setText('pmBalance', '$' + bal.toFixed(2) + ' USD');

      const coins = typeof window.userCoins === 'number' ? window.userCoins : 0;
      setText('pmCoins', coins.toLocaleString());

      try {
        const ludoRaw  = localStorage.getItem('afrib_ludo_' + (user.email || '')) || '{}';
        const ludoData = JSON.parse(ludoRaw);
        setText('pmLevel', 'Lv ' + ((ludoData.stats && ludoData.stats.level) || 1));
      } catch (_) {
        setText('pmLevel', 'Lv 1');
      }

      const pmEl = document.getElementById('pmLinkedPayments');
      if (pmEl) {
        const linked = user.linkedPayments || [];
        if (linked.length === 0) {
          pmEl.innerHTML = '<div style="font-size:12px;color:var(--w60)">No payment methods linked yet.</div>';
        } else {
          var TYPES = (typeof PAYMENT_TYPES !== 'undefined') ? PAYMENT_TYPES : [];
          pmEl.innerHTML = linked.slice(0, 4).map(function (pm, i) {
            var info = TYPES.find(function (t) { return t.type === pm.type; }) || {};
            return '<span class="pm-payment-pill' + (i === 0 ? ' default-pill' : '') + '">'
              + (info.logo || '\uD83D\uDCB3') + ' '
              + (info.name || pm.type)
              + (i === 0 ? ' \u2713' : '')
              + '</span>';
          }).join('') + (linked.length > 4
            ? '<span class="pm-payment-pill">+' + (linked.length - 4) + ' more</span>'
            : '');
        }
      }

      setVal('pmEditName',       (user.first || '') + ' ' + (user.last || ''));
      setVal('pmEditProfession', user.profession || '');

      const giftZone = document.getElementById('pm-gift-zone');
      if (giftZone) giftZone.style.display = 'block';

      const modal = document.getElementById('profileModal');
      if (modal) modal.classList.add('open');
    };
  }

  /* ── 3. Null-safe doLogout ────────────────────────────────────── */

  function installSafeDoLogout() {
    if (window.doLogout && window.doLogout._v62safe) return;

    const _orig = window.doLogout;
    window.doLogout = function () {
      try {
        if (_orig) _orig.apply(this, arguments);
      } catch (e) {
        // Fallback if original crashes (e.g. missing userDropdown)
        try { localStorage.removeItem('afrib_session'); } catch (_) {}
        window.currentUser = null;
        const shell   = document.getElementById('app-shell');
        const landing = document.getElementById('landing-page');
        if (shell)   shell.style.display  = 'none';
        if (landing) landing.style.display = 'block';
        window.scrollTo(0, 0);
        if (typeof window.showToast === 'function') {
          window.showToast('You have been signed out');
        }
      } finally {
        window.currentUser = null;
        const dd = document.getElementById('userDropdown');
        if (dd) dd.style.display = 'none';
      }
    };
    window.doLogout._v62safe = true;
  }

  /* ── 4. Robust husOpenProfile & husLogout ────────────────────── */

  window.husOpenProfile = function () {
    try {
      const dd = document.getElementById('userDropdown');
      if (dd) dd.style.display = 'none';

      let user = window.currentUser;
      if (!user && typeof getSession === 'function') {
        user = getSession();
        if (user && user.email) window.currentUser = user;
      }

      if (!user) {
        if (typeof window.showToast === 'function') {
          window.showToast('\u26A0\uFE0F Please sign in to view your profile');
        }
        return;
      }

      if (typeof window.showProfileModal === 'function') {
        window.showProfileModal();
      } else {
        if (typeof window.showToast === 'function') {
          window.showToast('Profile loading\u2026 please try again');
        }
      }
    } catch (e) {
      console.error('[v62] husOpenProfile error:', e);
    }
  };

  window.husLogout = function () {
    try {
      let user = window.currentUser;
      if (!user && typeof getSession === 'function') {
        user = getSession();
      }

      if (!user) {
        if (typeof window.showLanding === 'function') {
          window.showLanding();
        } else {
          const shell   = document.getElementById('app-shell');
          const landing = document.getElementById('landing-page');
          if (shell)   shell.style.display  = 'none';
          if (landing) landing.style.display = 'block';
        }
        return;
      }

      const name = user.first || 'there';
      if (!window.confirm('Sign out of AfriBConnect, ' + name + '?')) return;

      if (typeof window.doLogout === 'function') {
        window.doLogout();
      } else {
        try { localStorage.removeItem('afrib_session'); } catch (_) {}
        window.currentUser = null;
        window.location.reload();
      }
    } catch (e) {
      console.error('[v62] husLogout error:', e);
      try {
        localStorage.removeItem('afrib_session');
        window.location.reload();
      } catch (_) {}
    }
  };

  /* ── 5. Remove duplicate deferred script tags ─────────────────── */

  function deduplicateScripts() {
    const seen = {};
    document.querySelectorAll('script[src]').forEach(function (s) {
      const src = s.getAttribute('src');
      if (seen[src]) {
        s.parentNode && s.parentNode.removeChild(s);
      } else {
        seen[src] = true;
      }
    });
  }

  /* ── Boot ───────────────────────────────────────────────────────── */

  function boot() {
    installCurrentUserBridge();
    installSafeShowProfileModal();
    installSafeDoLogout();
    deduplicateScripts();
    console.log('[AfribConnect v62] Profile & logout fix loaded \u2713');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

}());

/* ════════════════════════════════════════════════════════════════════
   AUTH UI UPGRADE — v62
   Injects: split brand panel, bonus banner, particles, trust badges,
   testimonial ticker, and floating phone mockup.
   Runs after DOMContentLoaded so all elements are guaranteed present.
════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Testimonials data ─────────────────────────────────────────── */
  var TESTIS = [
    { text: '"Finally an app that understands us. I sent money home and played Ludo with my cousin in Lagos — all in one place!"', initials: 'AO', name: 'Adaeze O. — London, UK', flag: '🇬🇧' },
    { text: '"AfriBConnect gave me my first 50 coins for free. Now I run a shop on the marketplace and make real money from it."', initials: 'KM', name: 'Kofi M. — Toronto, CA', flag: '🇨🇦' },
    { text: '"The diaspora community I never knew I needed. Met people from my hometown I never would have found anywhere else."', initials: 'FB', name: 'Fatou B. — Paris, FR', flag: '🇫🇷' }
  ];
  var testiIdx = 0;
  var testiTimer = null;

  function abpSetTesti(i) {
    testiIdx = i;
    var card  = document.getElementById('abpTestiCard');
    var text  = document.getElementById('abpTestiText');
    var av    = document.getElementById('abpTestiAvatar');
    var name  = document.getElementById('abpTestiName');
    var flag  = document.getElementById('abpTestiFlag');
    var dots  = document.querySelectorAll('.abp-testi-dot');
    if (!text) return;

    // Fade out
    card.style.opacity = '0';
    card.style.transform = 'translateY(6px)';
    card.style.transition = 'opacity .25s, transform .25s';

    setTimeout(function () {
      var t = TESTIS[i];
      text.textContent = t.text;
      av.textContent   = t.initials;
      name.textContent = t.name;
      if (flag) flag.textContent = t.flag;
      dots.forEach(function (d, idx) {
        d.classList.toggle('active', idx === i);
      });
      card.style.opacity   = '1';
      card.style.transform = 'translateY(0)';
    }, 260);
  }
  window.abpSetTesti = abpSetTesti;

  function startTestiTimer() {
    clearInterval(testiTimer);
    testiTimer = setInterval(function () {
      testiIdx = (testiIdx + 1) % TESTIS.length;
      abpSetTesti(testiIdx);
    }, 6000);
  }

  /* ── Build the brand panel HTML ─────────────────────────────────── */
  function buildBrandPanel() {
    var overlay = document.getElementById('auth-overlay');
    if (!overlay || document.getElementById('authBrandPanel')) return;

    var panel = document.createElement('div');
    panel.className = 'auth-brand-panel';
    panel.id = 'authBrandPanel';
    panel.innerHTML = [
      '<div class="abp-orb-1"></div>',
      '<div class="abp-orb-2"></div>',
      '<div class="abp-orb-3"></div>',
      '<div class="abp-grain"></div>',
      '<div class="abp-adinkra-grid" aria-hidden="true">',
        Array(48).fill(0).map(function(_, i) {
          return '<span>' + (['☽','✦','◈'][i % 3]) + '</span>';
        }).join(''),
      '</div>',
      '<div class="abp-content">',
        '<div class="abp-logo-mark">🌍</div>',
        '<div class="abp-wordmark">AFRIB<span>CONNECT</span></div>',
        '<h2 class="abp-tagline">Africa\'s <em>home</em><br>on the internet</h2>',
        '<p class="abp-desc">Connect, earn, trade, and play — one super-app built for the African diaspora worldwide.</p>',

        // Floating phone mockup
        '<div class="abp-phone" aria-hidden="true">',
          '<div class="abp-phone-inner">',
            '<div class="abp-phone-bar"></div>',
            '<div class="abp-phone-bar"></div>',
            '<div class="abp-phone-bar"></div>',
            '<div class="abp-phone-avatar-row">',
              '<div class="abp-phone-dot"></div>',
              '<div class="abp-phone-dot" style="opacity:.6"></div>',
              '<div class="abp-phone-dot" style="opacity:.4"></div>',
            '</div>',
            '<div class="abp-phone-lines">',
              '<div class="abp-phone-line"></div>',
              '<div class="abp-phone-line"></div>',
              '<div class="abp-phone-line"></div>',
            '</div>',
          '</div>',
        '</div>',

        // Stat chips
        '<div class="abp-stats">',
          '<div class="abp-stat"><span class="abp-stat-icon">🌍</span><div><div class="abp-stat-num">54+</div><div class="abp-stat-text">Countries</div></div></div>',
          '<div class="abp-stat"><span class="abp-stat-icon">🪙</span><div><div class="abp-stat-num">Free</div><div class="abp-stat-text">50 coins on join</div></div></div>',
          '<div class="abp-stat"><span class="abp-stat-icon">🎮</span><div><div class="abp-stat-num">5+</div><div class="abp-stat-text">Live games</div></div></div>',
        '</div>',

        // Perks
        '<div class="abp-perks" style="margin-top:24px">',
          '<div class="abp-perk"><div class="abp-perk-icon">💸</div>Send money across Africa instantly</div>',
          '<div class="abp-perk"><div class="abp-perk-icon">🛒</div>Shop authentic African marketplace</div>',
          '<div class="abp-perk"><div class="abp-perk-icon">💬</div>Encrypted diaspora messaging</div>',
          '<div class="abp-perk"><div class="abp-perk-icon">🎯</div>Earn rewards just for showing up</div>',
        '</div>',

        // Testimonials
        '<div class="abp-testimonials">',
          '<div class="abp-testi-label">Loved by the diaspora</div>',
          '<div class="abp-testi-card" id="abpTestiCard" style="transition:opacity .25s,transform .25s">',
            '<div class="abp-testi-text" id="abpTestiText">' + TESTIS[0].text + '</div>',
            '<div class="abp-testi-author">',
              '<div class="abp-testi-avatar" id="abpTestiAvatar">' + TESTIS[0].initials + '</div>',
              '<span class="abp-testi-name" id="abpTestiName">' + TESTIS[0].name + '</span>',
              '<span class="abp-testi-flag" id="abpTestiFlag">' + TESTIS[0].flag + '</span>',
            '</div>',
          '</div>',
          '<div class="abp-testi-dots">',
            '<div class="abp-testi-dot active" onclick="abpSetTesti(0)"></div>',
            '<div class="abp-testi-dot" onclick="abpSetTesti(1)"></div>',
            '<div class="abp-testi-dot" onclick="abpSetTesti(2)"></div>',
          '</div>',
        '</div>',
      '</div>'
    ].join('');

    // Insert as the FIRST child of the overlay (before the form panel)
    overlay.insertBefore(panel, overlay.firstChild);
    startTestiTimer();
  }

  /* ── Wrap auth-cards in a scrollable form panel ────────────────── */
  function wrapFormPanel() {
    var overlay = document.getElementById('auth-overlay');
    if (!overlay || document.getElementById('authFormPanel')) return;

    var formPanel = document.createElement('div');
    formPanel.className = 'auth-form-panel';
    formPanel.id = 'authFormPanel';

    // Move all auth-card divs + particles into the panel
    var cards = overlay.querySelectorAll('.auth-card, .auth-bg, .auth-orb, .grain');
    cards.forEach(function (el) { formPanel.appendChild(el); });

    overlay.appendChild(formPanel);
  }

  /* ── Inject floating particles into form panel ──────────────────── */
  function injectParticles() {
    var panel = document.getElementById('authFormPanel');
    if (!panel || panel.querySelector('.auth-particles')) return;

    var particlesEl = document.createElement('div');
    particlesEl.className = 'auth-particles';
    particlesEl.setAttribute('aria-hidden', 'true');

    var configs = [
      {left:'15%', dur:'8s', del:'0s',  op:'.5'},
      {left:'40%', dur:'11s',del:'2s',  op:'.3'},
      {left:'70%', dur:'9s', del:'4s',  op:'.4'},
      {left:'85%', dur:'13s',del:'1s',  op:'.25'},
      {left:'55%', dur:'10s',del:'3s',  op:'.35'}
    ];
    configs.forEach(function (c) {
      var p = document.createElement('div');
      p.className = 'auth-particle';
      p.style.cssText = 'left:' + c.left + ';animation-duration:' + c.dur + ';animation-delay:' + c.del + ';opacity:' + c.op + ';bottom:0';
      particlesEl.appendChild(p);
    });

    panel.insertBefore(particlesEl, panel.firstChild);
  }

  /* ── Inject bonus banner into signup card ──────────────────────── */
  function injectBonusBanner() {
    var signupCard = document.getElementById('auth-signup');
    if (!signupCard || signupCard.querySelector('.auth-bonus-banner')) return;

    var form = signupCard.querySelector('.auth-form');
    if (!form) return;

    var banner = document.createElement('div');
    banner.className = 'auth-bonus-banner';
    banner.innerHTML = [
      '<div class="auth-bonus-icon">🎁</div>',
      '<div class="auth-bonus-text">',
        '<div class="auth-bonus-headline">Welcome bonus — 50 coins on signup!</div>',
        '<div class="auth-bonus-sub">Play games, send gifts, and unlock rewards from day one</div>',
      '</div>'
    ].join('');

    signupCard.insertBefore(banner, form);
  }

  /* ── Inject trust badges into both login + signup cards ─────────── */
  function injectTrustBadges() {
    ['auth-login', 'auth-signup'].forEach(function (cardId) {
      var card = document.getElementById(cardId);
      if (!card || card.querySelector('.auth-trust')) return;

      var switchEl = card.querySelector('.auth-switch');
      if (!switchEl) return;

      var isLogin = cardId === 'auth-login';
      var trust = document.createElement('div');
      trust.className = 'auth-trust';
      trust.innerHTML = isLogin
        ? '<div class="auth-trust-item">🔒 Bank-level encryption</div><div class="auth-trust-item">🌍 54+ countries</div><div class="auth-trust-item">⭐ 4.8 rated</div>'
        : '<div class="auth-trust-item">🎁 50 coin welcome gift</div><div class="auth-trust-item">🔒 Encrypted</div><div class="auth-trust-item">✅ Free forever</div>';

      switchEl.parentNode.insertBefore(trust, switchEl.nextSibling);
    });
  }

  /* ── Upgrade the logo in both cards ────────────────────────────── */
  function upgradeLogos() {
    document.querySelectorAll('.auth-logo').forEach(function (el) {
      // Only upgrade plain-text logos (not already upgraded)
      if (el.querySelector('.auth-logo-icon')) return;
      var text = el.textContent.trim();
      el.innerHTML = '<div class="auth-logo-icon">🌍</div><div class="auth-logo-text">' + text.replace('AFRIBCONNECT','AFRIB<span>CONNECT</span>') + '</div>';
    });
  }

  /* ── Upgrade the Back button text ───────────────────────────────── */
  function upgradeBackBtns() {
    document.querySelectorAll('.auth-back').forEach(function (btn) {
      if (btn.textContent.trim() === '← Back') btn.textContent = 'Back';
      if (btn.textContent.trim() === '← Back to login') btn.textContent = 'Back to login';
    });
  }

  /* ── Upgrade CTA button labels ──────────────────────────────────── */
  function upgradeCTAs() {
    var loginBtn = document.querySelector('#auth-login .auth-btn[onclick="doLogin()"]');
    if (loginBtn && loginBtn.textContent.trim() === 'Log In') loginBtn.textContent = 'Sign In →';

    var signupBtn = document.querySelector('#auth-signup .auth-btn[onclick="doSignup()"]');
    if (signupBtn && signupBtn.textContent.trim() === 'Create Account') signupBtn.innerHTML = 'Create My Account 🚀';

    var loginSwitch = document.querySelector('#auth-login .auth-switch');
    if (loginSwitch && loginSwitch.textContent.includes("Don't have an account")) {
      loginSwitch.innerHTML = "New to AfriBConnect? <a href='#' onclick=\"showAuth('signup');return false;\">Create a free account</a>";
    }
  }

  /* ── Boot ─────────────────────────────────────────────────────── */
  function authUIBoot() {
    buildBrandPanel();
    wrapFormPanel();
    injectParticles();
    injectBonusBanner();
    injectTrustBadges();
    upgradeLogos();
    upgradeBackBtns();
    upgradeCTAs();
    console.log('[AfribConnect v62] Auth UI upgrade applied ✓');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', authUIBoot);
  } else {
    authUIBoot();
  }

}());
