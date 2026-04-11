/*!
 * AfribConnect v86 — Classic Nav + Clean Home Top
 *
 * CHANGES:
 *  1. BOTTOM NAV — Classic AfribConnect traditional style
 *     Matches the original screenshot with emoji + text labels.
 *     Layout: 🏠 Home | 🌍 Connect | 🛒 Market | 💰 Wallet | [+] | 💬 Messages | 🔔 Alerts | ✨ Style
 *     The [+] center button opens YourStyle post creation.
 *
 *  2. HOME SCREEN TOP — Classic clean professional header
 *     Removes gen-z dark-purple strip styling.
 *     Adds proper "Good morning/afternoon/evening, [Name]" greeting.
 *     Clean avatar, subtle gold, no neon/glow effects.
 */
(function AfribV86() {
  'use strict';
  if (window.__afrib_v86) return;
  window.__afrib_v86 = true;

  /* ══════════════════════════════════════════════════════════
   * § 1  CSS
   * ══════════════════════════════════════════════════════════ */
  (function injectCSS() {
    if (document.getElementById('v86-css')) return;
    const s = document.createElement('style');
    s.id = 'v86-css';
    s.textContent = `

/* ─── Bottom nav base ─── */
.app-bottom-nav {
  height: auto !important;
  min-height: 54px !important;
  padding: 4px 0 6px !important;
  background: rgba(6, 4, 10, 0.98) !important;
  border-top: 1px solid rgba(255,255,255,0.07) !important;
  flex-direction: row !important;
  align-items: stretch !important;
  gap: 0 !important;
}

/* Classic emoji+text nav items */
.abn-item,
.v85-nav-item {
  flex: 1 !important;
  background: none !important;
  border: none !important;
  color: rgba(255,255,255,0.45) !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 1px !important;
  padding: 3px 1px 2px !important;
  cursor: pointer !important;
  transition: color 0.15s !important;
  position: relative !important;
  -webkit-tap-highlight-color: transparent !important;
  font-size: 0 !important;
}
.v86-nav-emoji {
  font-size: 18px !important;
  line-height: 1 !important;
  display: block !important;
}
.abn-item span:not(.notif-badge),
.v85-nav-item span:not(.notif-badge) {
  font-size: 9px !important;
  font-weight: 600 !important;
  color: inherit !important;
  letter-spacing: 0 !important;
  line-height: 1 !important;
  white-space: nowrap !important;
}
.abn-item.active,
.v85-nav-item.active {
  color: var(--gold, #D4AF37) !important;
}
.abn-item:active,
.v85-nav-item:active {
  opacity: 0.7 !important;
  transform: scale(0.92) !important;
}

/* Hide v85 SVG icon wrappers — we use emoji */
.v85-nav-icon { display: none !important; }

/* ─── Center + create button ─── */
.v85-create-btn,
.v86-center-btn {
  flex: 0 0 auto !important;
  width: 64px !important;
  background: none !important;
  border: none !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 2px !important;
  cursor: pointer !important;
  padding: 2px 0 !important;
  top: 0 !important;
  -webkit-tap-highlight-color: transparent !important;
}
.v85-create-inner,
.v86-plus-inner {
  width: 44px !important;
  height: 28px !important;
  border-radius: 8px !important;
  background: linear-gradient(135deg, #D4AF37, #E85D26) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-shadow: 0 3px 10px rgba(212,175,55,0.3) !important;
  transition: transform 0.12s !important;
}
.v85-create-inner::before { content: none !important; }
.v85-create-btn:active .v85-create-inner,
.v86-center-btn:active .v86-plus-inner {
  transform: scale(0.88) !important;
}
.v85-create-plus,
.v86-plus-icon {
  font-size: 20px !important;
  font-weight: 300 !important;
  color: #000 !important;
  line-height: 1 !important;
}
.v86-post-label {
  font-size: 9px !important;
  font-weight: 600 !important;
  color: rgba(255,255,255,0.35) !important;
  white-space: nowrap !important;
}

/* ─── HOME SCREEN — clean classic header ─── */

/* Greeting bar added above profile strip */
.v86-greeting-bar {
  padding: 14px 16px 6px;
  background: #080612;
  border-bottom: 1px solid rgba(212,175,55,0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.v86-greeting-left { flex: 1; }
.v86-greeting-title {
  font-size: 20px;
  font-weight: 800;
  color: #fff;
  line-height: 1.15;
}
.v86-greeting-title span { color: var(--gold, #D4AF37); }
.v86-greeting-sub {
  font-size: 11px;
  color: rgba(255,255,255,0.35);
  margin-top: 2px;
}
.v86-greeting-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(212,175,55,0.3);
  background: linear-gradient(135deg, #D4AF37, #b8860b);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 800;
  color: #000;
  cursor: pointer;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(212,175,55,0.18);
}

/* Profile strip — clean, no gen-z styling */
#homeProfileStrip {
  background: #080612 !important;
  border-bottom: none !important;
  padding: 8px 16px 10px !important;
}
#hpcAvatar {
  background: linear-gradient(135deg, #D4AF37, #b8860b) !important;
  border: 2px solid rgba(212,175,55,0.3) !important;
  box-shadow: 0 1px 6px rgba(212,175,55,0.15) !important;
}
#hpcName {
  -webkit-background-clip: unset !important;
  -webkit-text-fill-color: #fff !important;
  background: none !important;
  color: #fff !important;
  font-size: 14px !important;
}
#hpcKyc {
  background: rgba(212,175,55,0.12) !important;
  color: var(--gold, #D4AF37) !important;
  border: 1px solid rgba(212,175,55,0.25) !important;
}
#hpcCountry, #hpcRole {
  color: rgba(255,255,255,0.38) !important;
}
/* Hide logout from the strip — it's in the profile modal */
#homeProfileStrip button[onclick*="doLogout"],
#homeProfileStrip button[onclick*="Logout"] {
  display: none !important;
}
/* Notification bell in strip — subtle */
#homeProfileStrip button[onclick*="toggleNotifPanel"] {
  background: rgba(255,255,255,0.05) !important;
  border: 1px solid rgba(255,255,255,0.08) !important;
  color: rgba(255,255,255,0.6) !important;
}

/* XP bar — minimal */
.v71-xp-bar {
  background: rgba(255,255,255,0.03) !important;
  border: 1px solid rgba(255,255,255,0.06) !important;
}
.v71-xp-fill {
  background: linear-gradient(90deg, var(--gold, #D4AF37), #b8860b) !important;
}

/* Wallet — clean premium card */
.v71-wallet {
  background: linear-gradient(135deg, #0c0a1e, #10071a) !important;
  border: 1px solid rgba(212,175,55,0.15) !important;
  border-radius: 16px !important;
}
.v71-wallet-amount {
  font-size: 30px !important;
  font-weight: 900 !important;
  color: #fff !important;
  -webkit-text-fill-color: #fff !important;
  background: none !important;
  -webkit-background-clip: unset !important;
}
.v71-wallet-label {
  font-size: 9px !important;
  color: rgba(255,255,255,0.35) !important;
  letter-spacing: 1px !important;
}

/* Quick action items — cleaner */
.v71-qa-item {
  background: rgba(255,255,255,0.04) !important;
  border: 1px solid rgba(255,255,255,0.07) !important;
  border-radius: 12px !important;
}
.v71-qa-label {
  font-size: 10px !important;
  font-weight: 600 !important;
  color: rgba(255,255,255,0.55) !important;
}
.v71-section-title {
  font-size: 14px !important;
  font-weight: 700 !important;
  color: rgba(255,255,255,0.85) !important;
}

/* Alerts (formerly abn-notif) — restore visibility */
.abn-notif { display: flex !important; }

/* Bottom padding for content */
#screen-home .screen-content {
  padding-bottom: 70px !important;
}
    `;
    document.head.appendChild(s);
  })();


  /* ══════════════════════════════════════════════════════════
   * § 2  BUILD CLASSIC BOTTOM NAV
   * ══════════════════════════════════════════════════════════ */
  function buildNav() {
    const nav = document.querySelector('.app-bottom-nav');
    if (!nav) return;

    // Find current active screen
    const activeItem = nav.querySelector('.abn-item.active, .v85-nav-item.active');
    const activeScreen = activeItem ? (activeItem.dataset.screen || 'home') : 'home';

    function navItem(screen, emoji, label, onclickOverride) {
      const isActive = screen === activeScreen;
      const onclick = onclickOverride || `showScreen('${screen}')`;
      let badge = '';
      if (screen === 'messages') {
        badge = `<span class="notif-badge" id="msgBotBadge" style="display:none;position:absolute;top:2px;right:5px;min-width:15px;height:15px;border-radius:8px;font-size:8px;font-weight:800;background:#ef4444;color:#fff;line-height:15px;text-align:center;padding:0 3px">0</span>`;
      } else if (screen === 'alerts') {
        badge = `<span class="notif-badge" id="botNavNotifBadge" style="display:none;position:absolute;top:2px;right:5px;min-width:15px;height:15px;border-radius:8px;font-size:8px;font-weight:800;background:#ef4444;color:#fff;line-height:15px;text-align:center;padding:0 3px">0</span>`;
      }
      return `
        <button class="abn-item v85-nav-item${isActive ? ' active' : ''}"
          data-screen="${screen}"
          onclick="${onclick}"
          title="${label}">
          <span class="v86-nav-emoji">${emoji}</span>
          <span>${label}</span>
          ${badge}
        </button>
      `;
    }

    // Center + Post button
    const createBtn = `
      <button class="v85-create-btn v86-center-btn" onclick="v86OpenCreate()" title="Post to YourStyle">
        <div class="v85-create-inner v86-plus-inner">
          <span class="v85-create-plus v86-plus-icon">+</span>
        </div>
        <span class="v86-post-label">Post</span>
      </button>
    `;

    nav.innerHTML =
      navItem('home',     '🏠', 'Home')     +
      navItem('connect',  '🌍', 'Connect')  +
      navItem('market',   '🛒', 'Market')   +
      navItem('wallet',   '💰', 'Wallet')   +
      createBtn                              +
      navItem('messages', '💬', 'Messages') +
      navItem('alerts',   '🔔', 'Alerts',  `toggleNotifPanel()`) +
      navItem('style',    '✨', 'YourStyle');

    nav._v86 = true;
    nav._v85 = false;
  }

  // Open YourStyle + post modal
  window.v86OpenCreate = function() {
    if (typeof showScreen === 'function') showScreen('style');
    setTimeout(() => {
      if (typeof openCreatePost === 'function') openCreatePost();
    }, 200);
  };

  // Keep active state in sync
  function syncActive(name) {
    document.querySelectorAll('.abn-item, .v85-nav-item').forEach(btn => {
      const s = btn.dataset.screen;
      btn.classList.toggle('active',
        s === name ||
        (name === 'ai' && s === 'home') ||
        (name === 'hub' && s === 'home')
      );
    });
  }

  function patchShowScreen() {
    const orig = window.showScreen;
    if (!orig || orig._v86) return;
    window.showScreen = function(name) {
      const r = orig.apply(this, arguments);
      syncActive(name);
      return r;
    };
    window.showScreen._v86 = true;
  }


  /* ══════════════════════════════════════════════════════════
   * § 3  CLASSIC HOME GREETING
   * ══════════════════════════════════════════════════════════ */
  function injectGreeting() {
    // Don't add twice
    if (document.getElementById('v86GreetBar')) return;

    const strip = document.getElementById('homeProfileStrip');
    if (!strip) return;

    // Hide logout from strip
    strip.querySelectorAll('button').forEach(btn => {
      if (btn.getAttribute('onclick') && (
        btn.getAttribute('onclick').includes('doLogout') ||
        btn.getAttribute('onclick').includes('Logout')
      )) btn.style.display = 'none';
    });

    const user = window.currentUser;
    const firstName = user ? (user.firstName || user.name || 'there') : 'there';
    const initials  = user ? ((user.firstName||'A')[0] + (user.lastName||'B')[0]).toUpperCase() : 'AB';
    const h = new Date().getHours();
    const timeWord = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
    const emoji    = h < 12 ? '🌅' : h < 17 ? '☀️' : '🌙';

    const bar = document.createElement('div');
    bar.id = 'v86GreetBar';
    bar.className = 'v86-greeting-bar';
    bar.innerHTML = `
      <div class="v86-greeting-left">
        <div class="v86-greeting-title">Good ${timeWord}, <span>${firstName}</span> ${emoji}</div>
        <div class="v86-greeting-sub">Africa's Super App · Welcome back</div>
      </div>
      <div class="v86-greeting-avatar" id="v86GreetAvatar"
        onclick="if(typeof showProfileModal==='function')showProfileModal()">${initials}</div>
    `;

    strip.parentNode.insertBefore(bar, strip);

    // Hide the original profile strip since greeting bar replaces it
    strip.style.display = 'none';
  }

  function refreshGreeting() {
    const bar = document.getElementById('v86GreetBar');
    const user = window.currentUser;
    if (!user) return;

    const firstName = user.firstName || user.name || 'there';
    const initials  = ((user.firstName||'A')[0] + (user.lastName||'B')[0]).toUpperCase();
    const h = new Date().getHours();
    const timeWord = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening';
    const emoji    = h < 12 ? '🌅' : h < 17 ? '☀️' : '🌙';

    if (bar) {
      const title = bar.querySelector('.v86-greeting-title');
      if (title) title.innerHTML = `Good ${timeWord}, <span>${firstName}</span> ${emoji}`;
      const av = bar.querySelector('#v86GreetAvatar');
      if (av) av.textContent = initials;
    } else {
      injectGreeting();
    }
  }


  /* ══════════════════════════════════════════════════════════
   * § 4  INIT
   * ══════════════════════════════════════════════════════════ */
  function init() {
    buildNav();
    patchShowScreen();
    injectGreeting();

    document.addEventListener('afrib:login', () => {
      setTimeout(() => {
        buildNav();
        refreshGreeting();
      }, 600);
    });

    // Re-build if nav gets replaced
    const navParent = document.querySelector('.app-bottom-nav')?.parentElement;
    if (navParent) {
      new MutationObserver(() => {
        const nav = document.querySelector('.app-bottom-nav');
        if (nav && !nav._v86) buildNav();
      }).observe(navParent, { childList: true, subtree: false });
    }

    console.info('%c✅ AfribConnect v86 — Classic Nav + Clean Home', 'color:#D4AF37;font-weight:bold');
  }

  if (document.readyState !== 'loading') {
    setTimeout(init, 1100);
  } else {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 1100));
  }

})();
