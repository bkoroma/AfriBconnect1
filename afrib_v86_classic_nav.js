/*!
 * AfribConnect v85 — Bottom Nav + Home Screen Upgrade
 *
 * CHANGES:
 *  1. BOTTOM NAV — TikTok-style 5-item layout
 *     • Home | Explore | [+ Create Center Button] | Messages | YourStyle
 *     • Center + button: prominent rounded rectangle, AfribConnect gradient
 *     • Opens YourStyle post creation directly
 *     • Clean icon + label layout, no clutter
 *     • Alerts/Wallet/Connect accessible via Home quick actions
 *
 *  2. HOME SCREEN — Classic professional AfribConnect style
 *     • Removes gen-z/aggressive styling
 *     • Clean card-based layout
 *     • Traditional header with greeting, avatar, notifications
 *     • Wallet balance card — clean and readable
 *     • Quick action grid — icon tiles, no emoji overload
 *     • Activity feed section
 *
 *  3. NAV STRUCTURE — clean icon set matching screenshot
 *     Uses clean SVG-inspired icons via Unicode/emoji
 */
(function AfribV85() {
  'use strict';
  if (window.__afrib_v85) return;
  window.__afrib_v85 = true;

  /* ══════════════════════════════════════════════════════════
   * § 1  BOTTOM NAV REDESIGN — TikTok-style 5 items
   * ══════════════════════════════════════════════════════════ */
  function upgradeBottomNav() {
    const nav = document.querySelector('.app-bottom-nav');
    if (!nav || nav._v85) return;
    nav._v85 = true;

    // Current active screen
    const activeItem = nav.querySelector('.abn-item.active');
    const activeScreen = activeItem ? activeItem.dataset.screen : 'home';

    nav.innerHTML = `
      <!-- Home -->
      <button class="abn-item v85-nav-item ${activeScreen==='home'?'active':''}" data-screen="home" onclick="showScreen('home')" title="Home">
        <div class="v85-nav-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" fill="${activeScreen==='home'?'currentColor':'none'}"/>
          </svg>
        </div>
        <span>Home</span>
      </button>

      <!-- Explore (Connect + Market) -->
      <button class="abn-item v85-nav-item ${activeScreen==='connect'||activeScreen==='market'||activeScreen==='hub'?'active':''}" data-screen="connect" onclick="showScreen('connect')" title="Explore">
        <div class="v85-nav-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/>
            <path d="M12 3C12 3 8.5 7 8.5 12C8.5 17 12 21 12 21M12 3C12 3 15.5 7 15.5 12C15.5 17 12 21 12 21M3 12H21" stroke="currentColor" stroke-width="1.8"/>
          </svg>
        </div>
        <span>Explore</span>
      </button>

      <!-- Center + Create Button -->
      <button class="v85-create-btn" onclick="v85OpenCreate()" title="Create Post">
        <div class="v85-create-inner">
          <span class="v85-create-plus">+</span>
        </div>
      </button>

      <!-- Messages -->
      <button class="abn-item v85-nav-item ${activeScreen==='messages'?'active':''}" data-screen="messages" onclick="showScreen('messages')" title="Messages" style="position:relative">
        <div class="v85-nav-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" fill="${activeScreen==='messages'?'currentColor':'none'}" fill-opacity="${activeScreen==='messages'?'0.15':'0'}"/>
          </svg>
        </div>
        <span>Messages</span>
        <span class="notif-badge" id="msgBotBadge" style="display:none;position:absolute;top:2px;right:8px;min-width:16px;height:16px;border-radius:8px;font-size:9px;font-weight:800;background:#ef4444;color:#fff;line-height:16px;text-align:center;padding:0 3px">0</span>
      </button>

      <!-- YourStyle -->
      <button class="abn-item v85-nav-item ${activeScreen==='style'?'active':''}" data-screen="style" onclick="showScreen('style')" title="YourStyle">
        <div class="v85-nav-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" fill="${activeScreen==='style'?'currentColor':'none'}" fill-opacity="${activeScreen==='style'?'0.2':'0'}"/>
          </svg>
        </div>
        <span>YourStyle</span>
      </button>
    `;
  }

  /* Create button action — goes to YourStyle + opens post modal */
  window.v85OpenCreate = function() {
    if (typeof showScreen === 'function') showScreen('style');
    setTimeout(() => {
      if (typeof openCreatePost === 'function') openCreatePost();
      else if (typeof switchStyleTab === 'function') switchStyleTab('all', null);
    }, 200);
  };

  /* Re-sync active state when screen changes */
  function syncNavActive(screenName) {
    const items = document.querySelectorAll('.v85-nav-item');
    items.forEach(item => {
      const s = item.dataset.screen;
      const isActive =
        s === screenName ||
        (screenName === 'connect' && s === 'connect') ||
        (screenName === 'market' && s === 'connect') ||
        (screenName === 'hub' && s === 'connect') ||
        (screenName === 'wallet' && s === 'home') ||
        (screenName === 'ai' && s === 'home');
      item.classList.toggle('active', isActive);
    });
  }

  function patchShowScreenForNav() {
    const orig = window.showScreen;
    if (!orig || orig._v85nav) return;
    window.showScreen = function(name) {
      const r = orig.apply(this, arguments);
      syncNavActive(name);
      return r;
    };
    window.showScreen._v85nav = true;
  }


  /* ══════════════════════════════════════════════════════════
   * § 2  CSS — Nav + Home
   * ══════════════════════════════════════════════════════════ */
  (function injectCSS() {
    if (document.getElementById('v85-css')) return;
    const s = document.createElement('style');
    s.id = 'v85-css';
    s.textContent = `

/* ─── Bottom Nav Reset + TikTok Style ─── */
.app-bottom-nav {
  height: 62px !important;
  padding: 0 !important;
  background: rgba(6, 4, 10, 0.98) !important;
  border-top: 1px solid rgba(255,255,255,0.07) !important;
  align-items: stretch !important;
  gap: 0 !important;
}

/* Standard nav items */
.v85-nav-item {
  flex: 1 !important;
  background: none !important;
  border: none !important;
  color: rgba(255,255,255,0.45) !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 3px !important;
  padding: 8px 4px 6px !important;
  cursor: pointer !important;
  transition: color 0.15s !important;
  position: relative !important;
  -webkit-tap-highlight-color: transparent !important;
  font-size: 0 !important; /* hide emoji fallback */
}
.v85-nav-item:active { opacity: 0.7 !important; transform: scale(0.94) !important; }
.v85-nav-item.active {
  color: var(--gold, #D4AF37) !important;
}
.v85-nav-item span {
  font-size: 9.5px !important;
  font-weight: 600 !important;
  letter-spacing: 0.2px !important;
  color: inherit !important;
  line-height: 1 !important;
}
.v85-nav-icon {
  width: 24px !important;
  height: 24px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}
.v85-nav-icon svg {
  width: 23px !important;
  height: 23px !important;
}

/* Active indicator dot */
.v85-nav-item.active::after {
  content: '' !important;
  position: absolute !important;
  bottom: 3px !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  width: 4px !important;
  height: 4px !important;
  border-radius: 50% !important;
  background: var(--gold, #D4AF37) !important;
}

/* ─── CENTER + CREATE BUTTON ─── */
.v85-create-btn {
  flex: 0 0 auto !important;
  width: 76px !important;
  background: none !important;
  border: none !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  padding: 0 !important;
  -webkit-tap-highlight-color: transparent !important;
  position: relative !important;
  top: -8px !important; /* raise above nav bar slightly */
}
.v85-create-inner {
  width: 48px !important;
  height: 34px !important;
  border-radius: 10px !important;
  background: linear-gradient(135deg, #D4AF37, #ff9900, #E85D26) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-shadow: 0 4px 14px rgba(212,175,55,0.45), 0 2px 6px rgba(0,0,0,0.4) !important;
  transition: transform 0.12s, box-shadow 0.12s !important;
  position: relative !important;
  overflow: hidden !important;
}
.v85-create-inner::before {
  content: '' !important;
  position: absolute !important;
  inset: 0 !important;
  background: linear-gradient(135deg, rgba(255,255,255,0.18), transparent) !important;
  pointer-events: none !important;
}
.v85-create-btn:active .v85-create-inner {
  transform: scale(0.9) !important;
  box-shadow: 0 2px 8px rgba(212,175,55,0.3) !important;
}
.v85-create-plus {
  font-size: 22px !important;
  font-weight: 300 !important;
  color: #000 !important;
  line-height: 1 !important;
  margin-top: -1px !important;
}

/* ─── HOME SCREEN — Classic Professional ─── */
/* Override gen-z profile strip */
#homeProfileStrip {
  background: #0a0612 !important;
  border-bottom: 1px solid rgba(255,255,255,0.06) !important;
  padding: 10px 16px !important;
}

/* XP bar — subtler */
.v71-xp-bar {
  background: rgba(255,255,255,0.04) !important;
  border: 1px solid rgba(255,255,255,0.08) !important;
  border-radius: 12px !important;
  padding: 10px 14px !important;
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
}
.v71-xp-level {
  width: 34px !important;
  height: 34px !important;
  border-radius: 50% !important;
  background: linear-gradient(135deg, var(--gold, #D4AF37), #b8860b) !important;
  color: #000 !important;
  font-size: 13px !important;
  font-weight: 800 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex-shrink: 0 !important;
}
.v71-xp-track {
  height: 4px !important;
  border-radius: 2px !important;
  background: rgba(255,255,255,0.08) !important;
}
.v71-xp-fill {
  height: 100% !important;
  border-radius: 2px !important;
  background: linear-gradient(90deg, var(--gold, #D4AF37), #ff9900) !important;
  transition: width 0.5s ease !important;
}

/* Wallet card — premium classic */
.v71-wallet {
  background: linear-gradient(135deg, #0d0a1e 0%, #12071e 40%, #0a1020 100%) !important;
  border: 1px solid rgba(212,175,55,0.2) !important;
  border-radius: 18px !important;
  padding: 20px !important;
  position: relative !important;
  overflow: hidden !important;
}
.v71-wallet::before {
  content: '' !important;
  position: absolute !important;
  top: -40px !important;
  right: -40px !important;
  width: 160px !important;
  height: 160px !important;
  border-radius: 50% !important;
  background: radial-gradient(circle, rgba(212,175,55,0.08), transparent 70%) !important;
  pointer-events: none !important;
}
.v71-wallet-label {
  font-size: 10px !important;
  color: rgba(255,255,255,0.4) !important;
  font-weight: 700 !important;
  letter-spacing: 1.5px !important;
  text-transform: uppercase !important;
}
.v71-wallet-amount {
  font-size: 32px !important;
  font-weight: 900 !important;
  color: #fff !important;
  line-height: 1.1 !important;
  margin-top: 4px !important;
}
.v71-wallet-usd {
  font-size: 12px !important;
  color: rgba(255,255,255,0.35) !important;
  margin-top: 3px !important;
}
.v71-wallet-coins {
  position: absolute !important;
  top: 16px !important;
  right: 16px !important;
  background: rgba(212,175,55,0.12) !important;
  border: 1px solid rgba(212,175,55,0.25) !important;
  border-radius: 16px !important;
  padding: 4px 10px !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  color: var(--gold, #D4AF37) !important;
}
.v71-wallet-btns {
  display: flex !important;
  gap: 8px !important;
  margin-top: 14px !important;
}
.v71-wallet-btn {
  flex: 1 !important;
  padding: 10px 8px !important;
  border-radius: 10px !important;
  font-size: 12px !important;
  font-weight: 700 !important;
  border: none !important;
  cursor: pointer !important;
  transition: all 0.15s !important;
}
.v71-wallet-btn.primary {
  background: linear-gradient(135deg, var(--gold, #D4AF37), #b8860b) !important;
  color: #000 !important;
}
.v71-wallet-btn.ghost {
  background: rgba(255,255,255,0.06) !important;
  border: 1px solid rgba(255,255,255,0.1) !important;
  color: rgba(255,255,255,0.65) !important;
}
.v71-wallet-btn:hover { opacity: 0.85 !important; }

/* Section headers */
.v71-section-hdr {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 14px 16px 8px !important;
}
.v71-section-title {
  font-size: 14px !important;
  font-weight: 800 !important;
  color: rgba(255,255,255,0.9) !important;
}
.v71-section-see {
  font-size: 12px !important;
  color: var(--gold, #D4AF37) !important;
  cursor: pointer !important;
  font-weight: 600 !important;
}

/* Quick action grid */
.v71-quick-grid {
  display: grid !important;
  grid-template-columns: repeat(4, 1fr) !important;
  gap: 8px !important;
  padding: 0 14px !important;
}
.v71-qa-item {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  gap: 6px !important;
  padding: 12px 4px 10px !important;
  border-radius: 14px !important;
  background: rgba(255,255,255,0.04) !important;
  border: 1px solid rgba(255,255,255,0.07) !important;
  cursor: pointer !important;
  transition: all 0.15s !important;
  -webkit-tap-highlight-color: transparent !important;
}
.v71-qa-item:active {
  background: rgba(212,175,55,0.08) !important;
  border-color: rgba(212,175,55,0.2) !important;
  transform: scale(0.96) !important;
}
.v71-qa-icon {
  font-size: 22px !important;
  line-height: 1 !important;
}
.v71-qa-label {
  font-size: 10px !important;
  font-weight: 600 !important;
  color: rgba(255,255,255,0.6) !important;
  text-align: center !important;
  line-height: 1.2 !important;
}

/* Hide Alerts bell from bottom nav */
.abn-notif { display: none !important; }

/* Live strip */
.v71-live-strip {
  display: flex !important;
  gap: 10px !important;
  overflow-x: auto !important;
  padding: 0 16px 4px !important;
  scrollbar-width: none !important;
}
.v71-live-strip::-webkit-scrollbar { display: none !important; }
.v71-live-card {
  flex-shrink: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  gap: 4px !important;
  cursor: pointer !important;
}
.v71-live-avatar {
  width: 52px !important;
  height: 52px !important;
  border-radius: 50% !important;
  border: 2px solid #ff4757 !important;
  background: linear-gradient(135deg, #1a1a2e, #16213e) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 20px !important;
  font-weight: 800 !important;
  color: #fff !important;
  position: relative !important;
}
.v71-live-avatar::after {
  content: 'LIVE' !important;
  position: absolute !important;
  bottom: -8px !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  background: #ff4757 !important;
  color: #fff !important;
  font-size: 7px !important;
  font-weight: 800 !important;
  border-radius: 4px !important;
  padding: 1px 4px !important;
  white-space: nowrap !important;
}
.v71-live-name {
  font-size: 10px !important;
  color: rgba(255,255,255,0.6) !important;
  margin-top: 6px !important;
  text-align: center !important;
  max-width: 52px !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}

/* Trending cards */
.home-trending {
  display: grid !important;
  grid-template-columns: repeat(2, 1fr) !important;
  gap: 10px !important;
  padding: 0 16px !important;
}
.trend-card {
  background: rgba(255,255,255,0.04) !important;
  border: 1px solid rgba(255,255,255,0.07) !important;
  border-radius: 14px !important;
  padding: 14px !important;
  cursor: pointer !important;
  transition: all 0.15s !important;
}
.trend-card:active { transform: scale(0.97) !important; }

/* Share card */
.home-share-card {
  background: linear-gradient(135deg, rgba(212,175,55,0.07), rgba(212,175,55,0.03)) !important;
  border: 1px solid rgba(212,175,55,0.15) !important;
  border-radius: 16px !important;
}

/* Hide old Alerts button from bottom nav specifically */
.app-bottom-nav .abn-notif { display: none !important; }

/* Home screen top padding to account for fixed nav */
#screen-home .screen-content {
  padding-bottom: 72px !important;
}

/* Smooth transition for nav items */
.v85-nav-item svg {
  transition: all 0.15s !important;
}

@keyframes v85CreatePop {
  0%  { transform: scale(1); }
  40% { transform: scale(0.88); }
  70% { transform: scale(1.06); }
  100%{ transform: scale(1); }
}
.v85-create-btn:active .v85-create-inner {
  animation: v85CreatePop 0.25s ease !important;
}

/* Profile strip subtle */
#homeProfileStrip {
  padding: 12px 16px !important;
}

/* Remove logout button from home profile strip for cleaner look */
#homeProfileStrip button[onclick*="doLogout"] {
  display: none !important;
}

/* ─── Responsive ─── */
@media (max-width: 360px) {
  .v85-create-inner { width: 42px !important; height: 30px !important; }
  .v85-nav-item span { font-size: 8.5px !important; }
}
    `;
    document.head.appendChild(s);
  })();


  /* ══════════════════════════════════════════════════════════
   * § 3  HOME SCREEN IMPROVEMENTS
   * ══════════════════════════════════════════════════════════ */

  /* Add Wallet shortcut to home bottom actions */
  function addWalletToQuickNav() {
    // Ensure wallet is reachable via a shortcut since we removed it from bottom nav
    // The home quick actions already have it, so this is already handled
  }

  /* Patch logout button — move it into profile modal instead */
  function hideLogoutFromStrip() {
    const strip = document.getElementById('homeProfileStrip');
    if (!strip) return;
    const logoutBtn = strip.querySelector('button[onclick*="doLogout"]');
    if (logoutBtn) logoutBtn.style.display = 'none';
  }

  /* Add subtle notification badge styling */
  function fixNotifBadge() {
    const badge = document.getElementById('botNavNotifBadge');
    if (badge) badge.parentElement.style.display = 'none'; // Hide alerts from nav
  }


  /* ══════════════════════════════════════════════════════════
   * § 4  INIT
   * ══════════════════════════════════════════════════════════ */
  function init() {
    upgradeBottomNav();
    patchShowScreenForNav();
    hideLogoutFromStrip();
    fixNotifBadge();

    // Re-run after login
    document.addEventListener('afrib:login', function() {
      setTimeout(() => {
        upgradeBottomNav();
        hideLogoutFromStrip();
        fixNotifBadge();
      }, 600);
    });

    // Watch for nav re-renders (some patches may re-inject it)
    const obs = new MutationObserver(() => {
      const nav = document.querySelector('.app-bottom-nav');
      if (nav && !nav._v85) {
        upgradeBottomNav();
      }
    });
    const navEl = document.querySelector('.app-bottom-nav');
    if (navEl && navEl.parentElement) {
      obs.observe(navEl.parentElement, { childList: true, subtree: false });
    }

    console.info('%c✅ AfribConnect v85 — Nav + Home Upgrade', 'color:#D4AF37;font-weight:bold');
  }

  if (document.readyState !== 'loading') {
    setTimeout(init, 1000);
  } else {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 1000));
  }

})();
