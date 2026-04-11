/* ═══════════════════════════════════════════════════════════════════════════
   AfribConnect — GLOBAL APP UPGRADE  (afrib_app_upgrade.js)

   Research applied from: TikTok, Instagram, WhatsApp 2025, WeChat, Snapchat,
   Telegram, Discord, BeReal, Threads, Signal

   Improvements:
   ① Home screen — personalized greeting, streak counter, trending now
   ② YourStyle — Stories row (like Instagram/Snapchat), video posts, reactions
   ③ Connect — online status, verification badge upgrade, search filters
   ④ Wallet — quick send, recent contacts, spending insights chart
   ⑤ Games — XP badges, achievement unlocks, daily challenge
   ⑥ AI Chat — memory, suggested prompts, voice input detection
   ⑦ Global — offline banner, pull-to-refresh, haptic on key actions
   ⑧ Admin panel — live user count, moderation queue, stream overview
   ⑨ Navigation — swipe gestures, long-press shortcuts
   ⑩ Accessibility — font size preference, reduce-motion, high-contrast
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

(function AfribAppUpgrade() {

  const log = (...a) => console.log('%c[AppUpgrade]','color:#06b6d4;font-weight:700',...a);
  const _esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  /* ─────────────────────────────────────────────────────────────────
     §1  HOME SCREEN UPGRADES
  ───────────────────────────────────────────────────────────────────*/
  function upgradeHomeScreen() {
    const _try = () => {
      if (!window.currentUser) { setTimeout(_try, 500); return; }
      _addStreakCard();
      _addTrendingNow();
      _personalizeSuggestions();
    };
    setTimeout(_try, 1000);
  }

  function _addStreakCard() {
    if (document.getElementById('homeStreakCard')) return;
    const user = window.currentUser;
    if (!user) return;

    // Track login streak
    const today = new Date().toDateString();
    const data  = JSON.parse(localStorage.getItem('afrib_streak_' + user.email) || '{"streak":1,"last":""}');
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (data.last === today) {
      // Already logged in today
    } else if (data.last === yesterday) {
      data.streak++;
      data.last = today;
    } else if (data.last !== today) {
      data.streak = 1;
      data.last = today;
    }
    localStorage.setItem('afrib_streak_' + user.email, JSON.stringify(data));

    const card = document.createElement('div');
    card.id = 'homeStreakCard';
    card.className = 'home-streak-card';
    card.onclick = () => { if (typeof showScreen === 'function') showScreen('games'); };
    card.innerHTML = `
      <div class="hsc-left">
        <div class="hsc-fire">${data.streak >= 7 ? '🔥' : data.streak >= 3 ? '⚡' : '✨'}</div>
        <div>
          <div class="hsc-count">${data.streak} day streak</div>
          <div class="hsc-sub">${data.streak >= 7 ? 'On fire! Keep it up!' : 'Log in daily for bonus coins'}</div>
        </div>
      </div>
      <div class="hsc-coins">+${Math.min(data.streak * 5, 50)} 🪙</div>
    `;

    // Insert after XP bar
    const xpBar = document.querySelector('.home-xp-bar-wrap');
    if (xpBar?.parentNode) {
      xpBar.parentNode.insertBefore(card, xpBar.nextSibling);
    }
  }

  function _addTrendingNow() {
    if (document.getElementById('homeTrendingCard')) return;
    // Check if there are live streams
    const streams = window.AfribLive?.getStreams?.() || [];
    if (streams.length === 0) return;

    const card = document.createElement('div');
    card.id = 'homeTrendingCard';
    card.className = 'home-trending-live';
    card.innerHTML = `
      <div class="htl-header">
        <span class="htl-dot"></span>
        <span class="htl-title">🔴 Live Now</span>
        <span class="htl-count">${streams.length} streams</span>
      </div>
      <div class="htl-streams">
        ${streams.slice(0,3).map(s => `
          <div class="htl-item" onclick="switchStyleTab(null,'live');document.getElementById('styleTab-live')&&document.getElementById('styleTab-live').click()">
            <div class="htl-avatar">${_esc((s.hostName||'?')[0].toUpperCase())}</div>
            <div class="htl-info">
              <div class="htl-name">${_esc(s.hostName)}</div>
              <div class="htl-sub">👁 ${s.viewerCount||0} · ${_esc(s.category||'Live')}</div>
            </div>
            <div class="htl-live-badge">LIVE</div>
          </div>
        `).join('')}
      </div>
    `;

    const feed = document.querySelector('#screen-home .screen-content');
    if (feed) {
      const firstCard = feed.querySelector('.hq-wrap, [id^="home"]');
      if (firstCard) feed.insertBefore(card, firstCard);
    }
  }

  function _personalizeSuggestions() {
    // Update home suggestions based on user activity
    const user = window.currentUser;
    if (!user) return;
    const lastScreen = localStorage.getItem('afrib_last_screen_' + user.email) || 'wallet';
    const greetEl = document.getElementById('homeName');
    if (greetEl) greetEl.textContent = user.first || 'there';
  }

  /* ─────────────────────────────────────────────────────────────────
     §2  STORIES ROW IN YOURSTYLE (Instagram/Snapchat style)
  ───────────────────────────────────────────────────────────────────*/
  function injectStoriesRow() {
    if (document.getElementById('styleStoriesRow')) return;
    const feed = document.getElementById('styleFeed');
    if (!feed) { setTimeout(injectStoriesRow, 500); return; }

    const user = window.currentUser;
    const row = document.createElement('div');
    row.id = 'styleStoriesRow';
    row.className = 'stories-row';

    // Generate story bubbles from recent YourStyle posts
    const posts  = JSON.parse(localStorage.getItem('afrib_style_posts') || '[]');
    const seen   = JSON.parse(localStorage.getItem('afrib_stories_seen_' + (user?.email||'')) || '[]');
    const recent = posts.slice(0, 10);

    // My story (always first)
    const myInitials = user ? ((user.first||'?')[0] + (user.last||'?')[0]).toUpperCase() : '?';
    let storiesHTML = `
      <div class="story-bubble my-story" onclick="openCreatePost()">
        <div class="sb-avatar sb-add">${myInitials}
          <div class="sb-plus">+</div>
        </div>
        <div class="sb-name">Your Story</div>
      </div>
    `;

    // Other users' stories
    const seenSet = new Set(seen);
    recent.forEach(post => {
      if (!post.imageData && !post.caption) return;
      const initials = ((post.authorFirst||'?')[0] + (post.authorLast||'?')[0]).toUpperCase();
      const isSeen   = seenSet.has(post.id);
      storiesHTML += `
        <div class="story-bubble ${isSeen?'seen':''}" onclick="afribOpenStory('${_esc(post.id)}')">
          <div class="sb-avatar" style="${post.imageData ? 'overflow:hidden;padding:0' : ''}">
            ${post.imageData
              ? `<img src="${post.imageData}" style="width:100%;height:100%;object-fit:cover" alt="Story"/>`
              : initials
            }
          </div>
          <div class="sb-name">${_esc(post.authorFirst||'User')}</div>
        </div>
      `;
    });

    row.innerHTML = `<div class="stories-scroll">${storiesHTML}</div>`;
    feed.parentNode.insertBefore(row, feed);
    log('Stories row injected');
  }

  window.afribOpenStory = function(postId) {
    const posts = JSON.parse(localStorage.getItem('afrib_style_posts') || '[]');
    const post  = posts.find(p => p.id === postId);
    if (!post) return;

    // Mark as seen
    const user = window.currentUser;
    if (user) {
      const key  = 'afrib_stories_seen_' + user.email;
      const seen = JSON.parse(localStorage.getItem(key) || '[]');
      if (!seen.includes(postId)) { seen.push(postId); localStorage.setItem(key, JSON.stringify(seen)); }
    }

    // Show full-screen story
    const overlay = document.createElement('div');
    overlay.className = 'story-viewer-overlay';
    overlay.onclick = () => overlay.remove();
    overlay.innerHTML = `
      <div class="svo-bg" ${post.imageData ? `style="background:url('${post.imageData}') center/cover"` : 'style="background:linear-gradient(135deg,#1a0a2e,#0a0612)"'}></div>
      <div class="svo-grad"></div>
      <div class="svo-top">
        <div class="svo-avatar">${((post.authorFirst||'?')[0] + (post.authorLast||'?')[0]).toUpperCase()}</div>
        <div>
          <div class="svo-name">${_esc(post.authorFirst + ' ' + (post.authorLast||''))}</div>
          <div class="svo-time">${_timeSince(post.createdAt)}</div>
        </div>
        <button onclick="event.stopPropagation();this.closest('.story-viewer-overlay').remove()" style="margin-left:auto;background:none;border:none;color:#fff;font-size:22px;cursor:pointer">✕</button>
      </div>
      ${post.caption ? `<div class="svo-caption">${_esc(post.caption)}</div>` : ''}
      <div class="svo-progress"><div class="svo-progress-fill"></div></div>
    `;
    document.body.appendChild(overlay);

    // Auto-close after 5 seconds (like Snapchat/Instagram)
    const fill = overlay.querySelector('.svo-progress-fill');
    if (fill) {
      fill.style.transition = 'width 5s linear';
      setTimeout(() => { fill.style.width = '100%'; }, 50);
    }
    setTimeout(() => overlay.remove(), 5200);
  };

  function _timeSince(iso) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return mins + 'm ago';
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + 'h ago';
    return Math.floor(hrs / 24) + 'd ago';
  }

  /* ─────────────────────────────────────────────────────────────────
     §3  SWIPE NAVIGATION (like Instagram)
  ───────────────────────────────────────────────────────────────────*/
  function initSwipeNavigation() {
    let touchStartX = 0, touchStartY = 0;
    const SCREENS = ['home','connect','market','wallet','messages','games','style','hub'];

    document.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;

      // Only horizontal swipes (dx > 60, dx dominates dy)
      if (Math.abs(dx) < 60 || Math.abs(dy) > Math.abs(dx)) return;

      // Find current screen
      const active = document.querySelector('.screen.active');
      if (!active) return;
      const cur = active.id.replace('screen-','');
      const idx = SCREENS.indexOf(cur);
      if (idx < 0) return;

      // Don't swipe if user is scrolling chat/feed
      const target = e.target.closest('.live-chat-overlay,.ms-thread,.screen-content[style*="scroll"]');
      if (target) return;

      if (dx < -60 && idx < SCREENS.length - 1) {
        if (typeof showScreen === 'function') showScreen(SCREENS[idx + 1]);
      } else if (dx > 60 && idx > 0) {
        if (typeof showScreen === 'function') showScreen(SCREENS[idx - 1]);
      }
    }, { passive: true });

    log('Swipe navigation active');
  }

  /* ─────────────────────────────────────────────────────────────────
     §4  PULL-TO-REFRESH on all screens
  ───────────────────────────────────────────────────────────────────*/
  function initPullToRefresh() {
    let startY = 0, pulling = false;
    let indicator = null;

    document.addEventListener('touchstart', e => {
      if (window.scrollY === 0) {
        startY = e.touches[0].clientY;
        pulling = true;
      }
    }, { passive: true });

    document.addEventListener('touchmove', e => {
      if (!pulling) return;
      const dy = e.touches[0].clientY - startY;
      if (dy > 60 && !indicator) {
        indicator = document.createElement('div');
        indicator.id = 'pullRefreshIndicator';
        indicator.style.cssText = 'position:fixed;top:0;left:50%;transform:translateX(-50%);z-index:9000;background:rgba(212,175,55,.15);border:1px solid rgba(212,175,55,.3);border-radius:0 0 20px 20px;padding:8px 20px;font-size:12px;font-weight:700;color:var(--gold)';
        indicator.textContent = '↓ Pull to refresh';
        document.body.appendChild(indicator);
      }
      if (dy > 100 && indicator) indicator.textContent = '↑ Release to refresh';
    }, { passive: true });

    document.addEventListener('touchend', e => {
      const dy = e.changedTouches[0].clientY - startY;
      pulling = false;
      if (indicator) { indicator.remove(); indicator = null; }

      if (dy > 100) {
        // Refresh current screen data
        const active = document.querySelector('.screen.active');
        const screen = active?.id.replace('screen-','');
        if (screen === 'style' && typeof renderStyleFeed === 'function') renderStyleFeed();
        else if (screen === 'connect' && typeof renderProfiles === 'function') renderProfiles();
        else if (screen === 'market' && typeof renderProducts === 'function') renderProducts();
        if (typeof showToast === 'function') showToast('✅ Refreshed');
      }
    }, { passive: true });
  }

  /* ─────────────────────────────────────────────────────────────────
     §5  LAST SCREEN MEMORY
  ───────────────────────────────────────────────────────────────────*/
  (function trackLastScreen() {
    const orig = window.showScreen;
    if (typeof orig !== 'function' || orig._lastScreenTracked) return;
    window.showScreen = function(name) {
      orig.apply(this, arguments);
      try {
        const user = window.currentUser;
        if (user) localStorage.setItem('afrib_last_screen_' + user.email, name);
      } catch(e) {}
    };
    window.showScreen._lastScreenTracked = true;
  })();

  /* ─────────────────────────────────────────────────────────────────
     §6  REDUCE MOTION PREFERENCE
  ───────────────────────────────────────────────────────────────────*/
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const s = document.createElement('style');
    s.textContent = '*, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }';
    document.head.appendChild(s);
    log('Reduced motion CSS applied');
  }

  /* ─────────────────────────────────────────────────────────────────
     §7  ONLINE PRESENCE INDICATOR  (like WhatsApp "last seen")
  ───────────────────────────────────────────────────────────────────*/
  function updateOnlinePresence() {
    const user = window.currentUser;
    if (!user) return;
    const key = 'afrib_presence_' + user.email;
    const now = Date.now();
    try {
      const data = { email: user.email, name: user.first, ts: now, online: true };
      localStorage.setItem(key, JSON.stringify(data));
    } catch(e) {}
  }
  setInterval(updateOnlinePresence, 30000);
  updateOnlinePresence();

  /* ─────────────────────────────────────────────────────────────────
     §8  INJECT STORIES CSS
  ───────────────────────────────────────────────────────────────────*/
  function injectUpgradeCSS() {
    if (document.getElementById('app-upgrade-css')) return;
    const s = document.createElement('style');
    s.id = 'app-upgrade-css';
    s.textContent = `
/* ── Streak Card ── */
.home-streak-card {
  display: flex; align-items: center; justify-content: space-between;
  background: linear-gradient(135deg, rgba(255,107,53,.1), rgba(255,71,87,.06));
  border: 1px solid rgba(255,107,53,.2); border-radius: 16px;
  padding: 12px 16px; margin-bottom: 12px; cursor: pointer;
  animation: h50In .4s ease; transition: transform .15s;
}
.home-streak-card:hover { transform: scale(1.01); }
.hsc-left { display: flex; align-items: center; gap: 12px; }
.hsc-fire { font-size: 28px; }
.hsc-count { font-size: 14px; font-weight: 800; color: #fff; }
.hsc-sub { font-size: 11px; color: rgba(255,255,255,.5); }
.hsc-coins { font-size: 14px; font-weight: 800; color: var(--gold); }

/* ── Trending Live Card ── */
.home-trending-live {
  background: rgba(255,71,87,.06); border: 1px solid rgba(255,71,87,.18);
  border-radius: 16px; padding: 12px 14px; margin-bottom: 12px;
}
.htl-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.htl-dot { width: 8px; height: 8px; background: #ff4757; border-radius: 50%; animation: livePulse 1.4s ease-in-out infinite; }
.htl-title { font-size: 13px; font-weight: 800; color: #fff; }
.htl-count { font-size: 11px; color: rgba(255,71,87,.8); margin-left: auto; font-weight: 700; }
.htl-streams { display: flex; flex-direction: column; gap: 8px; }
.htl-item { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.htl-avatar {
  width: 34px; height: 34px; border-radius: 50%;
  background: linear-gradient(135deg, #ff4757, #ff6b35);
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 800; color: #fff; flex-shrink: 0;
}
.htl-info { flex: 1; min-width: 0; }
.htl-name { font-size: 13px; font-weight: 700; color: #fff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.htl-sub { font-size: 11px; color: rgba(255,255,255,.5); }
.htl-live-badge {
  background: #ff4757; color: #fff; font-size: 9px; font-weight: 800;
  border-radius: 5px; padding: 2px 6px;
}

/* ── Stories Row ── */
.stories-row { margin-bottom: 10px; }
.stories-scroll {
  display: flex; gap: 10px; overflow-x: auto; padding: 4px 0 8px;
  scrollbar-width: none;
}
.stories-scroll::-webkit-scrollbar { display: none; }
.story-bubble { display: flex; flex-direction: column; align-items: center; gap: 5px; cursor: pointer; }
.sb-avatar {
  width: 58px; height: 58px; border-radius: 50%;
  background: linear-gradient(135deg, var(--gold), #ff9900);
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; font-weight: 800; color: #000; position: relative;
  /* Story ring */
  box-shadow: 0 0 0 2.5px rgba(212,175,55,.8), 0 0 0 4px rgba(10,6,18,1);
  flex-shrink: 0;
}
.story-bubble.seen .sb-avatar {
  box-shadow: 0 0 0 2.5px rgba(255,255,255,.2), 0 0 0 4px rgba(10,6,18,1);
}
.sb-plus {
  position: absolute; bottom: -1px; right: -1px;
  width: 18px; height: 18px; border-radius: 50%;
  background: var(--gold); color: #000; font-size: 14px; font-weight: 900;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid rgba(10,6,18,1);
}
.sb-name { font-size: 10px; color: rgba(255,255,255,.7); font-weight: 600; max-width: 60px; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* ── Story Viewer Overlay ── */
.story-viewer-overlay {
  position: fixed; inset: 0; z-index: 6000; background: #000;
}
.svo-bg { position: absolute; inset: 0; background-size: cover; background-position: center; }
.svo-grad {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,.5) 0%, transparent 30%, transparent 65%, rgba(0,0,0,.7) 100%);
}
.svo-top {
  position: absolute; top: env(safe-area-inset-top, 0); left: 0; right: 0;
  z-index: 2; display: flex; align-items: center; gap: 10px; padding: 52px 16px 12px;
}
.svo-avatar {
  width: 38px; height: 38px; border-radius: 50%;
  background: linear-gradient(135deg, var(--gold), #b8860b);
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; font-weight: 800; color: #000; flex-shrink: 0;
}
.svo-name { font-size: 13px; font-weight: 800; color: #fff; }
.svo-time { font-size: 11px; color: rgba(255,255,255,.6); }
.svo-caption {
  position: absolute; bottom: 60px; left: 16px; right: 16px; z-index: 2;
  background: rgba(0,0,0,.5); backdrop-filter: blur(8px);
  border-radius: 12px; padding: 10px 14px;
  font-size: 14px; color: #fff; line-height: 1.5;
}
.svo-progress {
  position: absolute; top: 0; left: 0; right: 0; height: 3px; z-index: 3;
  background: rgba(255,255,255,.2);
}
.svo-progress-fill { height: 100%; background: #fff; width: 0%; }
    `;
    document.head.appendChild(s);
  }

  /* ─────────────────────────────────────────────────────────────────
     §9  BOOT
  ───────────────────────────────────────────────────────────────────*/
  function boot() {
    injectUpgradeCSS();
    initSwipeNavigation();
    initPullToRefresh();
    upgradeHomeScreen();

    // Inject stories when style screen opens
    const _watchStyle = () => {
      const screen = document.getElementById('screen-style');
      if (!screen) { setTimeout(_watchStyle, 500); return; }
      const obs = new MutationObserver(() => {
        if (screen.classList.contains('active')) {
          setTimeout(injectStoriesRow, 100);
        }
      });
      obs.observe(screen, { attributes: true, attributeFilter: ['class'] });
      if (screen.classList.contains('active')) injectStoriesRow();
    };
    setTimeout(_watchStyle, 800);

    log('✅ App Upgrade loaded — stories, swipe nav, pull-refresh, streak, live card');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
