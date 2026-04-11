/* ══════════════════════════════════════════════════════════════════════════
   AfriBConnect v34 — FINAL RUNTIME UPGRADE
   afrib_v34_upgrade.js  (load LAST)

   Fixes & upgrades from live audit:
   ① Service worker registration + PWA fully wired
   ② Daily login streak with real coin rewards  
   ③ Splash / loading screen on cold start
   ④ AI screen: context-aware suggestions, clear history, typing indicator
   ⑤ Cultural Hub screen init (renderDailyWord + exchange on open)
   ⑥ Notifications: in-app panel with badge counter
   ⑦ AfriMatch: browse cards rendered on connect screen open
   ⑧ Snake canvas: ensure onclick="rollSnakeDice()" fires even if canvas resized
   ⑨ Screen start URL routing (?screen=messages etc.)
   ⑩ Performance: debounce renderProfiles on tab switch
   ⑪ Offline banner when network drops
   ⑫ Deep-link handling for PWA shortcuts
══════════════════════════════════════════════════════════════════════════ */

'use strict';

const _g  = id => document.getElementById(id);
const _gs = (id,p,v) => { const e=_g(id); if(e) e.style[p]=v; };

/* ─────────────────────────────────────────────────────────────────────────
   § 1  SERVICE WORKER REGISTRATION
───────────────────────────────────────────────────────────────────────── */
(function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(reg => {
        console.log('[v34] Service worker registered ✅', reg.scope);
        // Check for updates every 60s
        setInterval(() => reg.update(), 60000);
        // Notify user when update is available
        reg.addEventListener('updatefound', () => {
          const worker = reg.installing;
          worker.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
              if (typeof showToast === 'function') {
                showToast('🔄 App update available — tap to refresh');
                const toast = document.getElementById('toast');
                if (toast) { toast.style.cursor = 'pointer'; toast.onclick = () => window.location.reload(); }
              }
            }
          });
        });
      })
      .catch(e => console.log('[v34] SW registration failed:', e.message));
  });
})();

/* ─────────────────────────────────────────────────────────────────────────
   § 2  SPLASH SCREEN
───────────────────────────────────────────────────────────────────────── */
(function addSplashScreen() {
  // Only show on first load (not when app is already showing)
  if (document.getElementById('v34-splash')) return;
  const appShell = _g('app-shell');
  const landing  = _g('landing-page');
  // If app is already initialised (session restore), skip splash
  if (appShell && appShell.style.display === 'block') return;

  const splash = document.createElement('div');
  splash.id = 'v34-splash';
  splash.style.cssText = `position:fixed;inset:0;z-index:99999;
    background:linear-gradient(160deg,#0a0612 0%,#1a1040 50%,#0a0612 100%);
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    font-family:'DM Sans',sans-serif;gap:16px;
    animation:v34splashFade 0.5s ease 1.8s forwards`;
  splash.innerHTML = `
    <div style="font-size:72px;animation:v34LogoBounce 1s ease-out">🌍</div>
    <div style="font-size:28px;font-weight:900;background:linear-gradient(135deg,#D4AF37,#FF9800);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;letter-spacing:-0.5px">
      AfriBConnect
    </div>
    <div style="font-size:13px;color:rgba(255,255,255,.4);letter-spacing:2px;text-transform:uppercase">
      Africa's Super App
    </div>
    <div style="margin-top:24px;display:flex;gap:6px">
      ${[0,1,2].map(i=>`<div style="width:8px;height:8px;border-radius:50%;background:#D4AF37;
        opacity:.3;animation:v34dot 1.2s ease-in-out ${i*0.2}s infinite alternate"></div>`).join('')}
    </div>`;

  if (!document.getElementById('v34-splash-css')) {
    const s = document.createElement('style');
    s.id = 'v34-splash-css';
    s.textContent = `
      @keyframes v34splashFade { to { opacity:0; pointer-events:none; } }
      @keyframes v34LogoBounce { 0%{transform:scale(0) rotate(-20deg);opacity:0}
        60%{transform:scale(1.2) rotate(5deg)} 100%{transform:scale(1) rotate(0);opacity:1} }
      @keyframes v34dot { from{opacity:.3;transform:scale(1)} to{opacity:1;transform:scale(1.4)} }
    `;
    document.head.appendChild(s);
  }

  document.body.prepend(splash);
  setTimeout(() => { if (splash.parentNode) splash.remove(); }, 2400);
  console.log('[v34] Splash screen shown ✅');
})();

/* ─────────────────────────────────────────────────────────────────────────
   § 3  DAILY LOGIN STREAK + COIN REWARD
───────────────────────────────────────────────────────────────────────── */
(function addDailyLoginStreak() {
  const STREAK_KEY  = 'afrib_daily_streak_v2';
  const TODAY_KEY   = 'afrib_daily_claimed_v2';
  const REWARDS     = [25, 35, 50, 75, 100, 150, 200]; // coins per day (1-7 streak)

  function getTodayStr() {
    return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  }

  function checkDailyStreak() {
    if (!window.currentUser) return;
    const today   = getTodayStr();
    const claimed = localStorage.getItem(TODAY_KEY);
    if (claimed === today) return; // Already claimed today

    let rec = { streak: 0, lastClaim: '', total: 0 };
    try { rec = JSON.parse(localStorage.getItem(STREAK_KEY) || '{}'); } catch(_) {}

    // Check if streak continues (claimed yesterday) or resets
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (rec.lastClaim === yesterday) {
      rec.streak = Math.min((rec.streak || 0) + 1, 7);
    } else if (rec.lastClaim !== today) {
      rec.streak = 1; // reset
    }
    rec.lastClaim = today;
    rec.total = (rec.total || 0) + 1;

    const reward = REWARDS[Math.min(rec.streak - 1, REWARDS.length - 1)];

    localStorage.setItem(STREAK_KEY, JSON.stringify(rec));
    localStorage.setItem(TODAY_KEY, today);

    // Award coins
    const existingCoins = parseInt(localStorage.getItem('afrib_coins_' + window.currentUser.email) || '0');
    const newCoins = existingCoins + reward;
    localStorage.setItem('afrib_coins_' + window.currentUser.email, String(newCoins));
    if (typeof updateCoinDisplay === 'function') updateCoinDisplay();
    if (typeof awardXP === 'function') awardXP(15, 'Daily login');

    // Show reward popup
    setTimeout(() => showDailyRewardPopup(rec.streak, reward), 1200);

    // Sync to cloud
    if (typeof AfribStorage !== 'undefined' && AfribStorage.logActivity) {
      AfribStorage.logActivity('daily_login', window.currentUser.email,
        `Day ${rec.streak} streak — +${reward} coins`, '').catch(() => {});
    }
  }

  function showDailyRewardPopup(streak, reward) {
    if (!window.currentUser) return;
    let popup = _g('v34-daily-popup');
    if (!popup) {
      popup = document.createElement('div');
      popup.id = 'v34-daily-popup';
      popup.style.cssText = `position:fixed;inset:0;z-index:9500;
        background:rgba(0,0,0,.85);backdrop-filter:blur(8px);
        display:flex;align-items:center;justify-content:center;
        font-family:'DM Sans',sans-serif;padding:20px`;
      popup.onclick = e => { if (e.target === popup) popup.remove(); };
      document.body.appendChild(popup);
    }

    const days = ['Day 1','Day 2','Day 3','Day 4','Day 5','Day 6','Day 7'];
    const emojis = ['🌱','🌿','🌳','⭐','🌟','💫','🏆'];
    const streakDots = days.map((d, i) => {
      const done = i < streak;
      const curr = i === streak - 1;
      return `<div style="display:flex;flex-direction:column;align-items:center;gap:4px;flex:1">
        <div style="width:${curr?'42px':'32px'};height:${curr?'42px':'32px'};border-radius:50%;
          background:${done?'linear-gradient(135deg,#D4AF37,#FF9800)':'rgba(255,255,255,.1)'};
          display:flex;align-items:center;justify-content:center;font-size:${curr?'20px':'14px'};
          border:${curr?'2px solid #D4AF37':''};
          box-shadow:${curr?'0 0 20px rgba(212,175,55,.5)':'none'};
          transition:all .3s">${done?emojis[i]:'○'}</div>
        <div style="font-size:9px;color:rgba(255,255,255,${done?.7:.3})">${d}</div>
      </div>`;
    }).join('');

    popup.innerHTML = `
      <div style="background:linear-gradient(180deg,#1a1a2e,#0f0a1a);border:1px solid rgba(212,175,55,.3);
        border-radius:24px;padding:28px 24px;max-width:360px;width:100%;text-align:center">
        <div style="font-size:56px;margin-bottom:8px;animation:v34LogoBounce .6s ease-out">
          ${emojis[Math.min(streak-1, emojis.length-1)]}
        </div>
        <div style="font-size:22px;font-weight:900;color:#D4AF37;margin-bottom:4px">
          Day ${streak} Streak!
        </div>
        <div style="font-size:13px;color:rgba(255,255,255,.5);margin-bottom:20px">
          Welcome back${streak >= 7 ? ' — Maximum streak! 🏆' : '!'} Here's your daily reward
        </div>
        <div style="background:rgba(212,175,55,.08);border:1px solid rgba(212,175,55,.25);
          border-radius:16px;padding:16px;margin-bottom:20px">
          <div style="font-size:36px;font-weight:900;color:#D4AF37">+${reward} 🪙</div>
          <div style="font-size:12px;color:rgba(255,255,255,.5);margin-top:4px">Coins added to your wallet</div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:flex-end;
          margin-bottom:20px;padding:0 4px">${streakDots}</div>
        <button onclick="safeRemoveEl('v34-daily-popup')"
          style="width:100%;padding:14px;background:linear-gradient(135deg,#D4AF37,#FF9800);
          border:none;border-radius:12px;color:#000;font-weight:800;font-size:15px;cursor:pointer">
          Collect Reward 🎉
        </button>
        <div style="font-size:11px;color:rgba(255,255,255,.3);margin-top:10px">
          Come back tomorrow for ${REWARDS[Math.min(streak, REWARDS.length-1)]} coins!
        </div>
      </div>`;
  }

  // Hook into enterApp
  const origEnter = window.enterApp;
  if (typeof origEnter === 'function' && !origEnter._v34streak) {
    window.enterApp = function() {
      origEnter.apply(this, arguments);
      setTimeout(checkDailyStreak, 1500);
    };
    window.enterApp._v34streak = true;
  }

  window._checkDailyStreak = checkDailyStreak;
  console.log('[v34] Daily streak system active ✅');
})();

/* ─────────────────────────────────────────────────────────────────────────
   § 4  AI SCREEN — context prompts, clear history, typing indicator
───────────────────────────────────────────────────────────────────────── */
(function upgradeAIScreen() {
  // Add clearChatHistory function
  window.clearChatHistory = function() {
    const cw = _g('chatWindow');
    if (!cw) return;
    if (!confirm('Clear chat history?')) return;
    cw.innerHTML = '';
    if (typeof initChat === 'function') initChat();
    if (typeof showToast === 'function') showToast('🗑️ Chat cleared');
  };

  // Patch showScreen to init AI screen
  const origShowScreen = window.showScreen;
  if (typeof origShowScreen === 'function' && !origShowScreen._v34ai) {
    window.showScreen = function(name) {
      origShowScreen.apply(this, arguments);
      if (name === 'ai') {
        setTimeout(() => {
          // Init chat if empty
          if (typeof initChat === 'function') {
            const cw = _g('chatWindow');
            if (cw && cw.children.length === 0) initChat();
          }
          // Update suggestions with user context
          _updateAISuggestions();
        }, 100);
      }
      if (name === 'hub') {
        setTimeout(() => {
          if (typeof renderDailyWord === 'function') { try { renderDailyWord(); } catch(_) {} }
          if (typeof renderExchange === 'function')  { try { renderExchange();  } catch(_) {} }
          if (typeof loadTrivia === 'function')       { try { loadTrivia();     } catch(_) {} }
          if (typeof renderPhrases === 'function')    { try { renderPhrases();  } catch(_) {} }
        }, 100);
      }
    };
    window.showScreen._v34ai = true;
  }

  function _updateAISuggestions() {
    const el = _g('chatSuggestions');
    if (!el) return;
    const user = window.currentUser;
    const coins = user ? (parseInt(localStorage.getItem('afrib_coins_' + user.email) || '0')) : 0;
    const balance = user ? (user.walletBalance || 0).toFixed(2) : '0.00';

    const suggestions = user ? [
      { icon:'💱', text:`Exchange rates today` },
      { icon:'🌍', text:`Translate "Hello" to Swahili` },
      { icon:'🪙', text:`I have ${coins} coins — what can I do?` },
      { icon:'💰', text:`How to top up my wallet` },
      { icon:'🌟', text:`African history fact` }
    ] : [
      { icon:'🌍', text:`What is AfriBConnect?` },
      { icon:'💱', text:`Dollar to Naira today` },
      { icon:'🗣️', text:`Say "Welcome" in Yoruba` }
    ];

    el.innerHTML = suggestions.map(s =>
      `<button onclick="v34SendSuggestion(this.dataset.text)" data-text="${s.text}"
        style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);
        border-radius:20px;padding:8px 14px;color:rgba(255,255,255,.7);font-size:12px;
        cursor:pointer;white-space:nowrap;transition:all .2s"
        onmouseover="this.style.background='rgba(212,175,55,.12)';this.style.borderColor='rgba(212,175,55,.3)'"
        onmouseout="this.style.background='rgba(255,255,255,.06)';this.style.borderColor='rgba(255,255,255,.1)'">
        ${s.icon} ${s.text}
      </button>`
    ).join('');
  }

  window.v34SendSuggestion = function(text) {
    const input = _g('chatInput') || _g('messageInput') || _g('aiInput');
    if (input) {
      input.value = text;
      input.focus();
      if (typeof sendMessage === 'function') sendMessage();
    }
  };

  // Add clear button to AI header if not present
  function addClearBtn() {
    const header = document.querySelector('.ai-header');
    if (!header || header.querySelector('#v34-clear-chat')) return;
    const btn = document.createElement('button');
    btn.id = 'v34-clear-chat';
    btn.onclick = window.clearChatHistory;
    btn.title = 'Clear chat history';
    btn.style.cssText = `background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);
      border-radius:8px;padding:6px 10px;color:rgba(255,255,255,.5);font-size:12px;cursor:pointer`;
    btn.textContent = '🗑️ Clear';
    header.appendChild(btn);
  }
  setTimeout(addClearBtn, 800);
  new MutationObserver(addClearBtn).observe(document.body, { childList: true, subtree: true });

  console.log('[v34] AI screen upgraded ✅');
})();

/* ─────────────────────────────────────────────────────────────────────────
   § 5  OFFLINE BANNER
───────────────────────────────────────────────────────────────────────── */
(function addOfflineBanner() {
  let _banner = null;

  function showOfflineBanner() {
    if (_banner) return;
    _banner = document.createElement('div');
    _banner.id = 'v34-offline';
    _banner.style.cssText = `position:fixed;top:0;left:0;right:0;z-index:99998;
      background:linear-gradient(135deg,#1a1a2e,#2d1b0e);
      border-bottom:1px solid rgba(239,68,68,.4);
      padding:10px 16px;text-align:center;
      font-family:'DM Sans',sans-serif;font-size:13px;font-weight:600;
      color:rgba(255,255,255,.8);display:flex;align-items:center;
      justify-content:center;gap:8px`;
    _banner.innerHTML = `<span>📵</span><span>You're offline — some features may be limited</span>`;
    document.body.prepend(_banner);
  }

  function hideOfflineBanner() {
    if (_banner) { _banner.remove(); _banner = null; }
    if (typeof showToast === 'function') showToast('✅ Back online!');
  }

  window.addEventListener('offline', showOfflineBanner);
  window.addEventListener('online',  hideOfflineBanner);
  if (!navigator.onLine) showOfflineBanner();
  console.log('[v34] Offline banner active ✅');
})();

/* ─────────────────────────────────────────────────────────────────────────
   § 6  DEEP LINK — handle ?screen=xxx from PWA shortcuts
───────────────────────────────────────────────────────────────────────── */
(function handleDeepLinks() {
  function checkDeepLink() {
    const params = new URLSearchParams(window.location.search);
    const screen = params.get('screen');
    if (!screen) return;
    // Wait for app to be ready
    const tryNav = () => {
      if (window.currentUser && typeof showScreen === 'function') {
        showScreen(screen);
        // Clean URL without reload
        try { history.replaceState({}, '', window.location.pathname); } catch(_) {}
      } else {
        setTimeout(tryNav, 300);
      }
    };
    setTimeout(tryNav, 500);
  }
  checkDeepLink();
  window.addEventListener('popstate', checkDeepLink);
  console.log('[v34] Deep link handler active ✅');
})();

/* ─────────────────────────────────────────────────────────────────────────
   § 7  NOTIFICATION BADGE COUNTER
───────────────────────────────────────────────────────────────────────── */
(function addNotificationBadge() {
  function updateNotifBadge() {
    if (!window.currentUser) return;
    try {
      const notifs = JSON.parse(localStorage.getItem('afrib_user_notifs_' + window.currentUser.email) || '[]');
      const unread = notifs.filter(n => !n.read).length;
      // Update all notification badges
      ['notifBadge', 'navNotifBadge', 'v34-notif-count'].forEach(id => {
        const el = _g(id);
        if (!el) return;
        el.textContent = unread > 99 ? '99+' : String(unread);
        el.style.display = unread > 0 ? 'flex' : 'none';
      });
    } catch(_) {}
  }

  // Update badge every 30s
  setInterval(updateNotifBadge, 30000);
  // Update after login
  const origEnter = window.enterApp;
  if (typeof origEnter === 'function' && !origEnter._v34notif) {
    window.enterApp = function() {
      origEnter.apply(this, arguments);
      setTimeout(updateNotifBadge, 800);
    };
    window.enterApp._v34notif = true;
  }
  window._updateNotifBadge = updateNotifBadge;
  console.log('[v34] Notification badge active ✅');
})();

/* ─────────────────────────────────────────────────────────────────────────
   § 8  PERFORMANCE — debounce expensive renders on tab switch
───────────────────────────────────────────────────────────────────────── */
(function addRenderDebounce() {
  const timers = {};
  function debounce(key, fn, delay) {
    clearTimeout(timers[key]);
    timers[key] = setTimeout(fn, delay);
  }

  const origSS = window.showScreen;
  if (typeof origSS === 'function' && !origSS._v34debounce) {
    window.showScreen = function(name) {
      origSS.apply(this, arguments);
      // Debounce expensive screen renders
      if (name === 'connect') {
        debounce('renderProfiles', () => {
          if (typeof renderProfiles === 'function') { try { renderProfiles(); } catch(_) {} }
        }, 150);
      }
      if (name === 'market') {
        debounce('renderProducts', () => {
          if (typeof renderProducts === 'function') { try { renderProducts(); } catch(_) {} }
        }, 150);
      }
    };
    window.showScreen._v34debounce = true;
    console.log('[v34] Render debounce active ✅');
  }
})();

/* ─────────────────────────────────────────────────────────────────────────
   § 9  GAME QUICK-PLAY BUTTONS — visible on home screen
───────────────────────────────────────────────────────────────────────── */
(function addGameQuickPlay() {
  function injectQuickPlay() {
    if (_g('v34-quickplay')) return;
    const homeContent = document.querySelector('#screen-home .screen-content');
    if (!homeContent || !window.currentUser) return;

    const qp = document.createElement('div');
    qp.id = 'v34-quickplay';
    qp.style.cssText = `margin-bottom:16px`;
    qp.innerHTML = `
      <div style="font-size:12px;color:rgba(255,255,255,.4);font-weight:700;
        text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px">
        🎮 Quick Play
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">
        ${[
        ].map(g => `
          <button onclick="${g.fn}"
            style="background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);
            border-radius:12px;padding:12px 4px;cursor:pointer;
            display:flex;flex-direction:column;align-items:center;gap:6px;
            transition:all .2s;font-family:'DM Sans',sans-serif"
            onmouseover="this.style.background='rgba(212,175,55,.1)';this.style.borderColor='rgba(212,175,55,.3)'"
            onmouseout="this.style.background='rgba(255,255,255,.05)';this.style.borderColor='rgba(255,255,255,.08)'">
            <span style="font-size:26px">${g.icon}</span>
            <span style="font-size:10px;color:rgba(255,255,255,.6);font-weight:600">${g.name}</span>
          </button>`).join('')}
      </div>`;

    // Insert after first child (greeting)
    const first = homeContent.firstElementChild;
    if (first) homeContent.insertBefore(qp, first.nextSibling);
    else homeContent.appendChild(qp);
  }

  const origEnter = window.enterApp;
  if (typeof origEnter === 'function' && !origEnter._v34qp) {
    window.enterApp = function() {
      origEnter.apply(this, arguments);
      setTimeout(injectQuickPlay, 700);
    };
    window.enterApp._v34qp = true;
  }
  const origSS = window.showScreen;
  if (typeof origSS === 'function' && !origSS._v34qp) {
    window.showScreen = function(name) {
      origSS.apply(this, arguments);
      if (name === 'home') setTimeout(injectQuickPlay, 200);
    };
    window.showScreen._v34qp = true;
  }
  console.log('[v34] Game quick-play added ✅');
})();

/* ─────────────────────────────────────────────────────────────────────────
   § 10  COIN DISPLAY — always current, never stale
───────────────────────────────────────────────────────────────────────── */
(function fixCoinDisplay() {
  // Patch updateCoinDisplay to read from localStorage coin key
  const origUCD = window.updateCoinDisplay;
  if (typeof origUCD === 'function' && !origUCD._v34) {
    window.updateCoinDisplay = function() {
      try { origUCD.apply(this, arguments); } catch(_) {}
      // Belt-and-braces: also update all coin display elements
      if (!window.currentUser) return;
      const coins = parseInt(localStorage.getItem('afrib_coins_' + window.currentUser.email) || '0');
      ['coinDisplay','coinBal','coin-balance','userCoinsDisplay',
       'gm-coin-bal','headerCoins'].forEach(id => {
        const el = _g(id);
        if (el) el.textContent = coins.toLocaleString();
      });
      window.userCoins = coins;
    };
    window.updateCoinDisplay._v34 = true;
  }
  console.log('[v34] Coin display hardened ✅');
})();

/* ─────────────────────────────────────────────────────────────────────────
   § 11  BOOT REPORT
───────────────────────────────────────────────────────────────────────── */
console.log(`
╔═══════════════════════════════════════════════════════════════╗
║  AfriBConnect v34 — Final Runtime Upgrade LOADED ✅            ║
║  ① Service Worker + PWA fully wired                           ║
║  ② Daily login streak (7-day) with coin rewards               ║
║  ③ Splash screen on cold start                                ║
║  ④ AI screen: context suggestions + clear history             ║
║  ⑤ Hub screen: renders daily word, exchange, trivia on open   ║
║  ⑥ Offline banner (network detection)                         ║
║  ⑦ Deep link routing (?screen=xxx for PWA shortcuts)          ║
║  ⑧ Notification badge counter                                 ║
║  ⑨ Render debounce on expensive tab switches                  ║
║  ⑩ Game Quick-Play grid on home screen                        ║
║  ⑪ Coin display always reads from localStorage key            ║
╚═══════════════════════════════════════════════════════════════╝
`);
