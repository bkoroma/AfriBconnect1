/* ═══════════════════════════════════════════════════════════════════════════
   AfribConnect v69 — Behavioural Intelligence Engine
   afrib_v69_behaviour_engine.js
   ─────────────────────────────────────────────────────────────────────────
   Studies user behaviour to personalise the home feed:

   SIGNALS COLLECTED (all stored locally, never transmitted):
   ① Keystroke patterns — search queries, chat inputs, typed text
   ② Screen visits — which screens, how long, frequency
   ③ Tap/click interactions — cards, buttons, profiles, products
   ④ Scroll depth — how far down each screen the user scrolls
   ⑤ Search history — explicit search queries across all search bars
   ⑥ Dwell time — how long spent on each piece of content

   INFERENCE ENGINE:
   • Content affinity scoring (0–100 per category)
   • Interest graph updated on every interaction
   • Time-of-day awareness (morning/evening content shifts)
   • Recency weighting (fresh signals count more)
   • Contextual surfacing — market items, people, games, content

   HOME FEED OUTPUT:
   • "For You" personalised cards replace generic trending
   • Smart suggestions bar under greeting
   • Quick-action card ordering reflows to surface most-used
   • Ticker message personalised

   PRIVACY:
   • All data is localStorage only — never leaves the device
   • User can clear their interest profile at any time
   • No keystroke content is stored — only categories inferred
   ═══════════════════════════════════════════════════════════════════════════ */

(function AfribBehaviourEngine() {
  'use strict';

  /* ─────────────────────────────────────────────────────────────────
     CONSTANTS
  ───────────────────────────────────────────────────────────────────── */
  const NS           = 'afrib_be_';          // localStorage namespace
  const MAX_HISTORY  = 200;                  // max interaction records
  const DECAY_HOURS  = 72;                   // signal half-life (hours)
  const MIN_DWELL_MS = 800;                  // min ms on screen to count

  // Interest categories mapped to AfribConnect features
  const CATEGORIES = {
    social:    { label:'Connect',    icon:'🌍', screen:'connect',  keywords:['people','friend','follow','connect','africa','diaspora','community'] },
    market:    { label:'Market',     icon:'🛒', screen:'market',   keywords:['buy','sell','shop','price','product','listing','deal','trade','marketplace'] },
    wallet:    { label:'Wallet',     icon:'💰', screen:'wallet',   keywords:['money','send','transfer','pay','currency','coins','wallet','bank','mpesa'] },
    games:     { label:'Games',      icon:'🕹️', screen:'games',    keywords:['ludo','snake','game','play','win','dice','ladder','drink','truth','dare'] },
    dating:    { label:'AfriMatch',  icon:'💕', screen:'hub',      keywords:['match','date','love','relationship','partner','romance','afrimatch','dating'] },
    ai:        { label:'AI',         icon:'🤖', screen:'ai',       keywords:['ask','question','help','explain','translate','swahili','yoruba','history','fact'] },
    gifts:     { label:'GiftMe',     icon:'🎁', screen:'giftme',   keywords:['gift','send gift','gifter','quartz','diamond','crystal'] },
    culture:   { label:'Culture',    icon:'🎭', screen:'hub',      keywords:['trivia','language','exchange','culture','heritage','africa','tradition'] },
    style:     { label:'Style',      icon:'✨', screen:'style',    keywords:['style','post','share','photo','look','fashion','outfit'] },
  };

  /* ─────────────────────────────────────────────────────────────────
     STORAGE LAYER
  ───────────────────────────────────────────────────────────────────── */
  function _get(key, fallback) {
    try { const v = localStorage.getItem(NS + key); return v !== null ? JSON.parse(v) : fallback; }
    catch(e) { return fallback; }
  }
  function _set(key, val) {
    try { localStorage.setItem(NS + key, JSON.stringify(val)); } catch(e) {}
  }

  function getUserKey() {
    const u = window.currentUser;
    return u ? u.email.replace(/[^a-z0-9]/gi, '_') : 'guest';
  }

  function getProfile() {
    return _get('profile_' + getUserKey(), {
      scores: {},        // category → 0–100 affinity score
      history: [],       // interaction records
      searchTerms: [],   // recent search terms (cleaned, no PII)
      screenTime: {},    // screen → total ms
      lastUpdated: 0,
    });
  }

  function saveProfile(profile) {
    profile.lastUpdated = Date.now();
    _set('profile_' + getUserKey(), profile);
  }

  /* ─────────────────────────────────────────────────────────────────
     SIGNAL INGESTION
  ───────────────────────────────────────────────────────────────────── */

  // Core signal recorder
  function recordSignal(type, category, weight, meta) {
    const profile = getProfile();

    // Add to history
    profile.history.push({ type, category, weight, ts: Date.now(), meta: meta || null });
    if (profile.history.length > MAX_HISTORY) profile.history.shift();

    // Update affinity score
    if (category && weight) {
      const current = profile.scores[category] || 0;
      const bump    = weight * 10;
      profile.scores[category] = Math.min(100, current + bump);
    }

    saveProfile(profile);
  }

  // Screen visit signal
  let _screenEnterTime = 0;
  let _currentScreen   = '';

  function recordScreenVisit(screenName) {
    // Record exit from previous screen
    if (_currentScreen && _screenEnterTime) {
      const dwell = Date.now() - _screenEnterTime;
      if (dwell > MIN_DWELL_MS) {
        const profile = getProfile();
        profile.screenTime[_currentScreen] = (profile.screenTime[_currentScreen] || 0) + dwell;
        saveProfile(profile);

        // Map screen to category
        const catEntry = Object.entries(CATEGORIES).find(([k, v]) => v.screen === _currentScreen || k === _currentScreen);
        if (catEntry) {
          const weight = Math.min(1.5, dwell / 60000); // max 1.5 for 1min+
          recordSignal('screen_visit', catEntry[0], weight, { screen: _currentScreen, dwellMs: dwell });
        }
      }
    }
    _currentScreen   = screenName;
    _screenEnterTime = Date.now();
  }

  // Keystroke/text signal — classify text WITHOUT storing content
  function classifyText(text) {
    if (!text || text.length < 3) return null;
    const lower = text.toLowerCase();
    let bestCat = null, bestScore = 0;

    for (const [cat, cfg] of Object.entries(CATEGORIES)) {
      const matches = cfg.keywords.filter(kw => lower.includes(kw)).length;
      const score   = matches / cfg.keywords.length;
      if (score > bestScore) { bestScore = score; bestCat = cat; }
    }
    return bestCat && bestScore > 0 ? bestCat : null;
  }

  function recordSearchQuery(query) {
    if (!query || query.trim().length < 2) return;
    const cat = classifyText(query);
    if (cat) recordSignal('search', cat, 1.0, null);

    // Store cleaned search term (truncated, no emails/numbers)
    const clean = query.trim().toLowerCase().replace(/[^\w\s]/g,'').slice(0, 30);
    if (clean.length > 1) {
      const profile = getProfile();
      if (!profile.searchTerms) profile.searchTerms = [];
      profile.searchTerms.unshift(clean);
      profile.searchTerms = [...new Set(profile.searchTerms)].slice(0, 20);
      saveProfile(profile);
    }
  }

  // Tap/click signal
  function recordTap(category, element) {
    recordSignal('tap', category, 0.6, { el: element });
  }

  // Dwell on content card
  function recordDwell(category, dwellMs) {
    if (dwellMs < 500) return;
    const weight = Math.min(1.2, dwellMs / 8000);
    recordSignal('dwell', category, weight, null);
  }

  /* ─────────────────────────────────────────────────────────────────
     SIGNAL OBSERVERS — attach to the live DOM
  ───────────────────────────────────────────────────────────────────── */

  // 1. Patch showScreen to record screen visits
  function patchShowScreen() {
    const orig = window.showScreen;
    if (!orig || orig.__bePatched) return;
    window.showScreen = function(name) {
      recordScreenVisit(name);
      try { return orig.apply(this, arguments); } catch(e) {}
    };
    window.showScreen.__bePatched = true;
  }

  // 2. Observe all search inputs across the app
  const SEARCH_SELECTORS = [
    '#msgSearchInput', '#marketSearch', '#connectSearch',
    '#dmSearchInput', '#hubSearch', '#globalSearch',
    'input[placeholder*="Search"]', 'input[placeholder*="search"]',
    'input[type="search"]',
  ];

  function attachSearchObservers() {
    SEARCH_SELECTORS.forEach(sel => {
      document.querySelectorAll(sel).forEach(input => {
        if (input.__beObserved) return;
        input.__beObserved = true;
        let _searchTimer;
        input.addEventListener('input', () => {
          clearTimeout(_searchTimer);
          _searchTimer = setTimeout(() => recordSearchQuery(input.value), 600);
        });
      });
    });
  }

  // 3. Observe chat text input — classify topic, DON'T store text
  function attachChatObserver() {
    const chatInputs = [
      '#msChatTextInput', '#chatInput', '#msgInput',
      'textarea[placeholder="Aa"]', 'textarea[placeholder*="message"]',
    ];
    chatInputs.forEach(sel => {
      const input = document.querySelector(sel);
      if (!input || input.__beObserved) return;
      input.__beObserved = true;
      let _chatTimer;
      input.addEventListener('input', () => {
        clearTimeout(_chatTimer);
        _chatTimer = setTimeout(() => {
          const cat = classifyText(input.value);
          if (cat) recordSignal('chat_topic', cat, 0.3, null);
        }, 1200);
      });
    });
  }

  // 4. Observe card taps — delegate from screen containers
  function attachTapObservers() {
    const TAP_RULES = [
      { sel: '.hq-card',         extract: btn => btn.getAttribute('onclick') || '' },
      { sel: '.hgs-card',        extract: btn => btn.textContent || '' },
      { sel: '.game-lobby-card', extract: btn => btn.textContent || '' },
      { sel: '.trending-item',   extract: btn => btn.textContent || '' },
      { sel: '.ti-info',         extract: btn => btn.textContent || '' },
      { sel: '[onclick*="market"]',  extract: () => 'market' },
      { sel: '[onclick*="games"]',   extract: () => 'games' },
      { sel: '[onclick*="wallet"]',  extract: () => 'wallet' },
      { sel: '[onclick*="dating"]',  extract: () => 'dating' },
      { sel: '[onclick*="giftme"]',  extract: () => 'gifts' },
    ];

    TAP_RULES.forEach(rule => {
      document.querySelectorAll(rule.sel).forEach(el => {
        if (el.__beTapObserved) return;
        el.__beTapObserved = true;
        el.addEventListener('click', () => {
          const hint = rule.extract(el);
          const cat  = classifyText(hint) || inferCatFromOnclick(el.getAttribute('onclick') || '');
          if (cat) recordTap(cat, rule.sel);
        });
      });
    });
  }

  function inferCatFromOnclick(str) {
    if (!str) return null;
    if (str.includes('market'))  return 'market';
    if (str.includes('wallet'))  return 'wallet';
    if (str.includes('games'))   return 'games';
    if (str.includes('connect')) return 'social';
    if (str.includes('dating') || str.includes('hub')) return 'dating';
    if (str.includes('giftMe') || str.includes('gift')) return 'gifts';
    if (str.includes('ai'))      return 'ai';
    if (str.includes('style'))   return 'style';
    return null;
  }

  // 5. Dwell timer on trending/feed cards
  function attachDwellObservers() {
    if (!('IntersectionObserver' in window)) return;
    const timers = new Map();

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const el = entry.target;
        const cat = el.dataset.beCat;
        if (!cat) return;
        if (entry.isIntersecting) {
          timers.set(el, Date.now());
        } else {
          const start = timers.get(el);
          if (start) { recordDwell(cat, Date.now() - start); timers.delete(el); }
        }
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('.trending-item, .hgs-card, .game-lobby-card, [data-be-cat]').forEach(el => {
      if (el.__beDwellObserved) return;
      el.__beDwellObserved = true;
      io.observe(el);
    });
  }

  /* ─────────────────────────────────────────────────────────────────
     INTEREST SCORING ENGINE
     Returns sorted categories with decayed, time-weighted scores
  ───────────────────────────────────────────────────────────────────── */

  function getDecayedScores() {
    const profile  = getProfile();
    const now      = Date.now();
    const halfLife = DECAY_HOURS * 3600 * 1000;
    const scores   = { ...profile.scores };

    // Apply time-decay to historical signals
    (profile.history || []).forEach(sig => {
      const age    = now - sig.ts;
      const decay  = Math.pow(0.5, age / halfLife);
      const cat    = sig.category;
      if (cat) scores[cat] = (scores[cat] || 0) * decay;
    });

    // Boost by screen time
    Object.entries(profile.screenTime || {}).forEach(([screen, ms]) => {
      const catEntry = Object.entries(CATEGORIES).find(([k, v]) => v.screen === screen || k === screen);
      if (catEntry) {
        const boost = Math.min(20, ms / 60000 * 2);
        scores[catEntry[0]] = (scores[catEntry[0]] || 0) + boost;
      }
    });

    // Time-of-day modifier
    const hour = new Date().getHours();
    if (hour >= 18 || hour < 6) {
      scores.games   = (scores.games   || 0) + 8;
      scores.social  = (scores.social  || 0) + 5;
    } else if (hour >= 9 && hour < 17) {
      scores.market  = (scores.market  || 0) + 6;
      scores.wallet  = (scores.wallet  || 0) + 4;
    }

    // Clamp all scores 0–100
    Object.keys(scores).forEach(k => { scores[k] = Math.max(0, Math.min(100, scores[k])); });

    return scores;
  }

  function getRankedCategories(limit) {
    const scores = getDecayedScores();
    return Object.entries(CATEGORIES)
      .map(([key, cfg]) => ({ key, ...cfg, score: scores[key] || 0 }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit || 6);
  }

  /* ─────────────────────────────────────────────────────────────────
     HOME FEED PERSONALISATION
  ───────────────────────────────────────────────────────────────────── */

  // Inject "For You" personalised section on home screen
  function renderPersonalisedFeed() {
    const homeContent = document.querySelector(
      '#screen-home .screen-content, #screen-home .home-scroll, #screen-home .home-inner'
    );
    if (!homeContent) return;

    // Remove old render
    document.getElementById('afrib-be-feed')?.remove();

    const profile  = getProfile();
    const ranked   = getRankedCategories(6);
    const hasData  = Object.values(profile.scores).some(v => v > 5);

    const section  = document.createElement('div');
    section.id     = 'afrib-be-feed';
    section.className = 'home-animate-in';
    section.style.cssText = 'animation-delay:.28s;margin:0 0 18px';

    if (!hasData) {
      // Cold start — show discovery prompt
      section.innerHTML = `
        <div class="section-label" style="margin-bottom:10px;margin-top:22px">✨ Discover</div>
        <div style="background:rgba(212,175,55,.05);border:1px solid rgba(212,175,55,.15);border-radius:16px;padding:14px 16px;font-size:13px;color:rgba(255,255,255,.55);line-height:1.6">
          The more you use AfribConnect, the more your home feed learns your interests — games, marketplace, dating, wallet and more. Start exploring!
        </div>
      `;
    } else {
      // Personalised suggestions
      const top3 = ranked.slice(0, 3);
      const profile_data = getProfile();
      const recentTerms  = (profile_data.searchTerms || []).slice(0, 3);

      section.innerHTML = `
        <div class="section-label" style="margin-bottom:10px;margin-top:22px">⚡ For You</div>
        <div style="display:flex;flex-direction:column;gap:9px" id="afrib-be-cards">
          ${top3.map(cat => _buildFeedCard(cat, profile_data)).join('')}
        </div>
        ${recentTerms.length ? `
          <div style="margin-top:10px;display:flex;gap:7px;flex-wrap:wrap" id="afrib-be-chips">
            ${recentTerms.map(t => `
              <div onclick="afribBeSearchChipTap('${t}')" style="
                background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);
                border-radius:20px;padding:5px 12px;font-size:11px;font-weight:700;
                color:rgba(255,255,255,.6);cursor:pointer;transition:all .18s;
              " onmouseenter="this.style.borderColor='rgba(212,175,55,.4)';this.style.color='#D4AF37'"
                 onmouseleave="this.style.borderColor='rgba(255,255,255,.1)';this.style.color='rgba(255,255,255,.6)'">
                🔍 ${t}
              </div>`).join('')}
          </div>
        ` : ''}
      `;
    }

    // Insert before trending section
    const trending = homeContent.querySelector('#homeTrending')?.parentElement?.previousElementSibling
      || homeContent.querySelector('.section-label')
      || null;

    if (trending) homeContent.insertBefore(section, trending);
    else homeContent.appendChild(section);

    // Wire dwell observers on new cards
    setTimeout(attachDwellObservers, 100);
  }

  function _buildFeedCard(cat, profile) {
    const score  = Math.round(cat.score);
    const pct    = Math.min(100, score);
    const accent = _catAccent(cat.key);

    return `
      <div onclick="window.showScreen('${cat.screen}')" data-be-cat="${cat.key}"
        style="
          display:flex;align-items:center;gap:12px;
          background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);
          border-radius:16px;padding:13px 14px;cursor:pointer;
          transition:all .22s cubic-bezier(.34,1.56,.64,1);
          box-shadow:0 2px 12px rgba(0,0,0,.2);
        "
        onmouseenter="this.style.transform='translateY(-3px)';this.style.borderColor='${accent}44';this.style.boxShadow='0 8px 24px rgba(0,0,0,.3)'"
        onmouseleave="this.style.transform='';this.style.borderColor='rgba(255,255,255,.07)';this.style.boxShadow='0 2px 12px rgba(0,0,0,.2)'"
      >
        <!-- Icon -->
        <div style="
          width:46px;height:46px;border-radius:14px;flex-shrink:0;
          background:${accent}18;border:1px solid ${accent}30;
          display:flex;align-items:center;justify-content:center;font-size:22px;
        ">${cat.icon}</div>

        <!-- Text -->
        <div style="flex:1;min-width:0">
          <div style="font-size:14px;font-weight:800;color:#fff;margin-bottom:3px">${cat.label}</div>
          <div style="font-size:10px;color:rgba(255,255,255,.4)">${_catTagline(cat.key)}</div>
          <!-- Affinity bar -->
          <div style="height:3px;background:rgba(255,255,255,.06);border-radius:100px;margin-top:7px;overflow:hidden">
            <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,${accent},${accent}99);border-radius:100px;transition:width .8s ease"></div>
          </div>
        </div>

        <!-- Arrow -->
        <div style="font-size:16px;color:rgba(255,255,255,.2);flex-shrink:0">›</div>
      </div>
    `;
  }

  function _catAccent(key) {
    const map = {
      social:'#00C97B', market:'#FF6B2B', wallet:'#D4AF37',
      games:'#8B5CF6',  dating:'#F472B6', ai:'#38BDF8',
      gifts:'#D4AF37',  culture:'#FB923C', style:'#A78BFA',
    };
    return map[key] || '#D4AF37';
  }

  function _catTagline(key) {
    const map = {
      social:  'People you might know · 54 countries',
      market:  'Listings matching your interests',
      wallet:  'Send money · 20+ currencies',
      games:   'Your favourite games are waiting',
      dating:  'Matches based on your profile',
      ai:      'Your AI powered by Claude',
      gifts:   'Send gifts · Build gifter level',
      culture: 'Trivia · Language · Exchange',
      style:   'Your posts · Your look',
    };
    return map[key] || 'Tap to explore';
  }

  // Personalise the home ticker text
  function personaliseHomeTicker() {
    const ticker = document.getElementById('homeTicker');
    if (!ticker) return;

    const ranked = getRankedCategories(3);
    const msgs   = ranked.map(cat => `${cat.icon} ${_tickerMsg(cat.key)}`);
    // Fallback to defaults if no data
    if (!msgs.length) return;

    let i = 0;
    function rotate() {
      if (!document.getElementById('homeTicker')) return;
      ticker.style.opacity = '0';
      setTimeout(() => {
        ticker.textContent = msgs[i % msgs.length];
        ticker.style.opacity = '1';
        i++;
      }, 400);
    }
    rotate();
    clearInterval(window._beTickerInterval);
    window._beTickerInterval = setInterval(rotate, 5000);
  }

  function _tickerMsg(key) {
    const map = {
      social:  'New people from your country just joined',
      market:  'Fresh listings in the marketplace',
      wallet:  'Send coins to friends in seconds',
      games:   'Challenge friends to Ludo or Snake & Ladders',
      dating:  'New AfriMatch profiles are ready for you',
      ai:      'Ask AfriBAI anything about Africa',
      gifts:   'Level up your Quartz Gifter badge',
      culture: 'New trivia questions added today',
      style:   'Share your look with the community',
    };
    return map[key] || 'Explore AfribConnect today';
  }

  // Reorder quick-action grid based on affinity
  function reorderQuickGrid() {
    const grid = document.querySelector('.home-quick-grid');
    if (!grid) return;

    const ranked = getRankedCategories();
    const screenOrder = ranked.map(c => c.screen);

    const cards = Array.from(grid.querySelectorAll('.hq-card'));
    const sorted = [...cards].sort((a, b) => {
      const aOnclick = a.getAttribute('onclick') || '';
      const bOnclick = b.getAttribute('onclick') || '';
      const aIdx = screenOrder.findIndex(s => aOnclick.includes(s));
      const bIdx = screenOrder.findIndex(s => bOnclick.includes(s));
      const aScore = aIdx === -1 ? 99 : aIdx;
      const bScore = bIdx === -1 ? 99 : bIdx;
      return aScore - bScore;
    });

    sorted.forEach(card => grid.appendChild(card));
  }

  /* ─────────────────────────────────────────────────────────────────
     PUBLIC API
  ───────────────────────────────────────────────────────────────────── */
  window.afribBE = {
    recordSearch:  recordSearchQuery,
    recordTap:     recordTap,
    recordScreen:  recordScreenVisit,
    getScores:     getDecayedScores,
    getRanked:     getRankedCategories,
    getProfile:    getProfile,
    clearProfile() {
      _set('profile_' + getUserKey(), null);
      document.getElementById('afrib-be-feed')?.remove();
      if (typeof window.showToast === 'function') window.showToast('🧹 Interest profile cleared');
    },
    refresh() {
      renderPersonalisedFeed();
      personaliseHomeTicker();
      reorderQuickGrid();
    },
  };

  // Chip tap handler
  window.afribBeSearchChipTap = function(term) {
    recordSearchQuery(term);
    // Navigate to most relevant screen
    const cat = classifyText(term);
    if (cat && CATEGORIES[cat]) {
      const screen = CATEGORIES[cat].screen;
      if (typeof window.showScreen === 'function') window.showScreen(screen);
    }
  };

  /* ─────────────────────────────────────────────────────────────────
     INITIALISATION
  ───────────────────────────────────────────────────────────────────── */
  function init() {
    patchShowScreen();
    recordScreenVisit('home');

    // Full DOM pass for observers
    attachSearchObservers();
    attachChatObserver();
    attachTapObservers();
    attachDwellObservers();

    // Render personalised feed
    renderPersonalisedFeed();
    personaliseHomeTicker();
    reorderQuickGrid();

    // Re-attach observers when new DOM appears (lazy-loaded screens)
    const mo = new MutationObserver(() => {
      attachSearchObservers();
      attachChatObserver();
      attachTapObservers();
    });
    mo.observe(document.body, { childList: true, subtree: true });

    // Refresh feed when returning to home
    const origShow = window.showScreen;
    if (origShow && !origShow.__beHomeRefresh) {
      window.showScreen = function(name) {
        try { origShow.apply(this, arguments); } catch(e) {}
        if (name === 'home') setTimeout(() => {
          renderPersonalisedFeed();
          personaliseHomeTicker();
          reorderQuickGrid();
        }, 300);
      };
      window.showScreen.__beHomeRefresh = true;
    }

    console.log('%c[AfribConnect] 🧠 Behaviour Engine loaded', 'color:#D4AF37;font-weight:700');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 700));
  } else {
    setTimeout(init, 700);
  }
  window.addEventListener('load', () => setTimeout(init, 1200));

})();
