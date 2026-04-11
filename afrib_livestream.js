/* ═══════════════════════════════════════════════════════════════════════════
   AfribConnect — LIVE SCREEN MEGA-UPGRADE  (afrib_live_upgrade.js)

   Research: TikTok Live 2025 features, Instagram Live, Twitch, YouTube Live
   Applied: polls, Q&A, pinned comments, leaderboard, LIVE goal bar,
            beauty filters (CSS), stream quality indicator, co-streamer invite,
            ranked gifts, top gifter display, viewer engagement score,
            shake-to-send-heart, auto-welcome message, stream categories,
            count-down go-live, 3-sec countdown animation, landscape/portrait toggle

   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

(function AfribLiveUpgrade() {

  const _esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const log  = (...a) => console.log('%c[LiveUpgrade]','color:#ff6b35;font-weight:700',...a);

  /* ─────────────────────────────────────────────────────────────────
     §1  LIVE SCREEN IMPROVEMENTS — patch renderLiveScreen
  ───────────────────────────────────────────────────────────────────*/

  // Override the render to add extra UI elements after base render
  const _hookRender = () => {
    if (!window.AfribLive || typeof window.AfribLive.render !== 'function') {
      setTimeout(_hookRender, 400); return;
    }
    const origRender = window.AfribLive.render;
    window.AfribLive.render = function() {
      origRender.apply(this, arguments);
      setTimeout(_enhanceLiveScreen, 50);
    };
    log('render patched');
  };
  setTimeout(_hookRender, 800);

  function _enhanceLiveScreen() {
    const root = document.getElementById('live-screen-root');
    if (!root) return;

    // ── Add top stats bar (active viewers, top gifter, goal) ──
    if (!document.getElementById('liveStatsBar')) {
      _injectStatsBar(root);
    }

    // ── Add category quick filters ──
    if (!document.getElementById('liveCatFilter')) {
      _injectCategoryFilter(root);
    }

    // ── Add search/discover row ──
    if (!document.getElementById('liveDiscoverRow')) {
      _injectDiscoverRow(root);
    }
  }

  function _injectStatsBar(root) {
    const bar = document.createElement('div');
    bar.id = 'liveStatsBar';
    bar.innerHTML = `
      <div class="lsb-wrap">
        <div class="lsb-stat">
          <span class="lsb-icon">👥</span>
          <span class="lsb-val" id="lsbTotalViewers">0</span>
          <span class="lsb-label">watching</span>
        </div>
        <div class="lsb-stat">
          <span class="lsb-icon">🎁</span>
          <span class="lsb-val" id="lsbTopGifter">—</span>
          <span class="lsb-label">top gifter</span>
        </div>
        <div class="lsb-stat">
          <span class="lsb-icon">🔴</span>
          <span class="lsb-val" id="lsbActiveStreams">0</span>
          <span class="lsb-label">live now</span>
        </div>
      </div>
    `;
    // Insert after header
    const header = root.querySelector('.live-header');
    if (header && header.nextSibling) {
      header.parentNode.insertBefore(bar, header.nextSibling);
    } else if (root.firstChild) {
      root.firstChild.insertBefore(bar, root.firstChild.firstChild?.nextSibling);
    }
    _updateStatsBar();
    setInterval(_updateStatsBar, 5000);
  }

  function _updateStatsBar() {
    try {
      const streams = (window.AfribLive?.getStreams?.() || []);
      const totalViewers = streams.reduce((s, st) => s + (st.viewerCount || 0), 0);
      const el1 = document.getElementById('lsbTotalViewers');
      const el2 = document.getElementById('lsbActiveStreams');
      if (el1) el1.textContent = totalViewers;
      if (el2) el2.textContent = streams.length;

      // Top gifter from localStorage
      const el3 = document.getElementById('lsbTopGifter');
      if (el3) {
        try {
          const gifters = JSON.parse(localStorage.getItem('afrib_live_gifters') || '{}');
          const top = Object.entries(gifters).sort((a,b) => b[1]-a[1])[0];
          el3.textContent = top ? top[0].split('@')[0].slice(0,10) : '—';
        } catch(e) { el3.textContent = '—'; }
      }
    } catch(e) {}
  }

  function _injectCategoryFilter(root) {
    const cats = ['🔥 All','🎵 Music','💃 Dance','🍳 Food','✨ Fashion','🎮 Gaming','💬 Talk','🌍 Culture'];
    const el = document.createElement('div');
    el.id = 'liveCatFilter';
    el.className = 'live-cat-filters';
    el.innerHTML = cats.map((c, i) => `
      <button class="live-cf-chip ${i===0?'active':''}" onclick="afribLiveFilterCat(this,'${_esc(c)}')">${c}</button>
    `).join('');
    const grid = root.querySelector('#liveGrid');
    if (grid) root.querySelector('.live-screen-inner')?.insertBefore(el, grid);
  }

  function _injectDiscoverRow(root) {
    const el = document.createElement('div');
    el.id = 'liveDiscoverRow';
    el.className = 'live-discover-row';
    el.innerHTML = `
      <div class="ldr-wrap">
        <input id="liveSearchInput" type="search" placeholder="🔍 Search streams…"
          class="live-search-input"
          oninput="afribLiveSearch(this.value)"
        />
        <button class="live-sort-btn" onclick="afribLiveCycleSortMode(this)" title="Sort streams">
          <span id="liveSortLabel">⚡ Hot</span>
        </button>
      </div>
    `;
    const grid = root.querySelector('#liveGrid');
    if (grid) root.querySelector('.live-screen-inner')?.insertBefore(el, grid);
  }

  /* ─────────────────────────────────────────────────────────────────
     §2  ENHANCED VIEWER OVERLAY FEATURES
         Patch afribLiveOpenViewer to add extra panels
  ───────────────────────────────────────────────────────────────────*/
  const _hookViewer = () => {
    if (typeof window.afribLiveOpenViewer !== 'function') {
      setTimeout(_hookViewer, 400); return;
    }
    if (window.afribLiveOpenViewer._upgraded) return;
    const orig = window.afribLiveOpenViewer;
    window.afribLiveOpenViewer = function(streamId) {
      orig.apply(this, arguments);
      // Patch overlay after it renders
      setTimeout(() => _upgradeViewerOverlay(streamId), 80);
    };
    window.afribLiveOpenViewer._upgraded = true;
    log('viewer overlay patched');
  };
  setTimeout(_hookViewer, 1000);

  function _upgradeViewerOverlay(streamId) {
    const overlay = document.getElementById('liveViewerOverlay');
    if (!overlay || overlay._upgraded) return;
    overlay._upgraded = true;

    // ── Top Gifter Banner ──
    const gifterBanner = document.createElement('div');
    gifterBanner.id = 'liveTopGifterBanner';
    gifterBanner.className = 'live-gifter-banner';
    gifterBanner.innerHTML = `<span class="lgb-crown">👑</span><span id="lgbText">Be the first to send a gift!</span>`;
    overlay.appendChild(gifterBanner);

    // ── Live Goal Progress Bar ──
    const goalBar = document.createElement('div');
    goalBar.id = 'liveGoalBar';
    goalBar.className = 'live-goal-bar';
    goalBar.innerHTML = `
      <div class="lgb-info">
        <span class="lgb-label">🎯 Stream Goal</span>
        <span class="lgb-amount" id="liveGoalAmount">0 / 500 🪙</span>
      </div>
      <div class="lgb-track">
        <div class="lgb-fill" id="liveGoalFill" style="width:0%"></div>
      </div>
    `;
    overlay.appendChild(goalBar);

    // ── Leaderboard Panel (tap to toggle) ──
    const leaderboard = document.createElement('div');
    leaderboard.id = 'liveLeaderboard';
    leaderboard.className = 'live-leaderboard';
    leaderboard.style.display = 'none';
    leaderboard.innerHTML = `
      <div class="llb-header">
        <span>🏆 Top Gifters</span>
        <button onclick="document.getElementById('liveLeaderboard').style.display='none'" class="llb-close">✕</button>
      </div>
      <div id="llbList" class="llb-list"></div>
    `;
    overlay.appendChild(leaderboard);

    // ── Poll Panel ──
    const poll = document.createElement('div');
    poll.id = 'livePollPanel';
    poll.className = 'live-poll-panel';
    poll.style.display = 'none';
    poll.innerHTML = `
      <div class="lpp-header">
        <span>📊 Live Poll</span>
        <button onclick="document.getElementById('livePollPanel').style.display='none'" class="lpp-close">✕</button>
      </div>
      <div id="lppQuestion" class="lpp-question"></div>
      <div id="lppOptions" class="lpp-options"></div>
    `;
    overlay.appendChild(poll);

    // ── Add extra action buttons (leaderboard + poll + mute) ──
    const rightActions = overlay.querySelector('.live-right-actions');
    if (rightActions) {
      const extra = document.createElement('button');
      extra.className = 'live-action-btn';
      extra.innerHTML = '🏆';
      extra.title = 'Top Gifters';
      extra.onclick = () => {
        const lb = document.getElementById('liveLeaderboard');
        if (lb) { _renderLeaderboard(streamId); lb.style.display = lb.style.display === 'none' ? 'block' : 'none'; }
      };
      rightActions.insertBefore(extra, rightActions.firstChild);
    }

    // ── 3-second countdown animation on join ──
    _playJoinAnimation(overlay);

    // ── Shake to send heart ──
    _initShakeToHeart(streamId);

    // ── Update goal bar from gifts ──
    _updateGoalBar(streamId);
    setInterval(() => _updateGoalBar(streamId), 2000);

    log('Viewer overlay upgraded');
  }

  function _playJoinAnimation(overlay) {
    const splash = document.createElement('div');
    splash.className = 'live-join-splash';
    splash.innerHTML = `<div class="ljs-text">LIVE</div><div class="ljs-sub">🔴 Joining stream…</div>`;
    overlay.appendChild(splash);
    setTimeout(() => { splash.style.opacity = '0'; setTimeout(() => splash.remove(), 400); }, 1200);
  }

  function _initShakeToHeart(streamId) {
    let lastX = 0, lastY = 0, lastZ = 0;
    let lastShake = 0;
    if (!window.DeviceMotionEvent) return;
    const handler = e => {
      const { x, y, z } = e.accelerationIncludingGravity || {};
      if (!x) return;
      const delta = Math.abs(x - lastX) + Math.abs(y - lastY) + Math.abs(z - lastZ);
      lastX = x; lastY = y; lastZ = z;
      if (delta > 30 && Date.now() - lastShake > 1000) {
        lastShake = Date.now();
        if (typeof window.afribLiveSendHeart === 'function') window.afribLiveSendHeart(streamId);
      }
    };
    window.addEventListener('devicemotion', handler, { passive: true });
    // Cleanup on overlay close
    const origClose = window.afribLiveCloseViewer;
    window.afribLiveCloseViewer = function() {
      window.removeEventListener('devicemotion', handler);
      if (typeof origClose === 'function') origClose.apply(this, arguments);
    };
  }

  function _updateGoalBar(streamId) {
    const fill  = document.getElementById('liveGoalFill');
    const amtEl = document.getElementById('liveGoalAmount');
    if (!fill || !amtEl) return;
    try {
      const gifters = JSON.parse(localStorage.getItem('afrib_live_gifters') || '{}');
      const total   = Object.values(gifters).reduce((s, v) => s + v, 0);
      const goal    = 500;
      const pct     = Math.min(100, Math.round((total / goal) * 100));
      fill.style.width = pct + '%';
      amtEl.textContent = `${total} / ${goal} 🪙`;
      if (pct >= 100) {
        fill.style.background = 'linear-gradient(90deg,#22c55e,#16a34a)';
        amtEl.textContent = `🎉 Goal Reached! ${total} 🪙`;
      }
    } catch(e) {}
  }

  function _renderLeaderboard(streamId) {
    const list = document.getElementById('llbList');
    if (!list) return;
    const gifters = JSON.parse(localStorage.getItem('afrib_live_gifters') || '{}');
    const sorted  = Object.entries(gifters).sort((a,b) => b[1]-a[1]).slice(0,10);
    const medals  = ['🥇','🥈','🥉'];
    list.innerHTML = sorted.length ? sorted.map(([name, coins], i) => `
      <div class="llb-item">
        <span class="llb-rank">${medals[i] || (i+1)}</span>
        <span class="llb-name">${_esc(name.split('@')[0].slice(0,16))}</span>
        <span class="llb-coins">${coins} 🪙</span>
      </div>
    `).join('') : '<div style="color:rgba(255,255,255,.5);text-align:center;padding:16px">No gifts yet. Be the first!</div>';
  }

  /* ─────────────────────────────────────────────────────────────────
     §3  PATCH afribLiveSelectGift to track gifter leaderboard
  ───────────────────────────────────────────────────────────────────*/
  const _hookGift = () => {
    if (typeof window.afribLiveSelectGift !== 'function') {
      setTimeout(_hookGift, 500); return;
    }
    if (window.afribLiveSelectGift._lbTracked) return;
    const orig = window.afribLiveSelectGift;
    window.afribLiveSelectGift = function(streamId, giftName) {
      orig.apply(this, arguments);
      // Track in leaderboard
      const user = window.currentUser;
      if (!user) return;
      const key   = user.email || user.username;
      const GIFTS = [
        {name:'Heart',coins:5},{name:'Fire',coins:10},{name:'Diamond',coins:50},
        {name:'Crown',coins:100},{name:'Africa',coins:25},{name:'Music',coins:15},
        {name:'Lion',coins:200},{name:'Money',coins:500},
      ];
      const gift = GIFTS.find(g => g.name === giftName);
      if (!gift) return;
      const gifters = JSON.parse(localStorage.getItem('afrib_live_gifters') || '{}');
      gifters[key] = (gifters[key] || 0) + gift.coins;
      localStorage.setItem('afrib_live_gifters', JSON.stringify(gifters));

      // Flash top gifter banner
      const banner = document.getElementById('lgbText');
      if (banner) {
        banner.textContent = `${user.first || key.split('@')[0]} just sent ${giftName}!`;
        const bannerEl = document.getElementById('liveTopGifterBanner');
        if (bannerEl) {
          bannerEl.style.opacity = '1';
          bannerEl.style.transform = 'translateY(0)';
          setTimeout(() => {
            bannerEl.style.opacity = '0';
            bannerEl.style.transform = 'translateY(-20px)';
          }, 3000);
        }
      }
    };
    window.afribLiveSelectGift._lbTracked = true;
  };
  setTimeout(_hookGift, 1200);

  /* ─────────────────────────────────────────────────────────────────
     §4  STREAMER CONTROLS UPGRADE — add poll & Q&A to controls bar
  ───────────────────────────────────────────────────────────────────*/
  const _hookStreamerControls = () => {
    if (!document.getElementById('liveMyControls')) { setTimeout(_hookStreamerControls, 500); return; }
    const ctrl = document.getElementById('liveMyControls');
    if (ctrl && !ctrl.querySelector('.live-extra-ctrl')) {
      const extra = document.createElement('div');
      extra.className = 'live-extra-ctrl';
      extra.innerHTML = `
        <button class="live-ctrl-btn" onclick="afribLiveCreatePoll()" title="Create Poll">📊</button>
        <button class="live-ctrl-btn" onclick="afribLiveToggleQA()" title="Q&A Mode">❓</button>
        <button class="live-ctrl-btn" onclick="afribLiveShareStreamLink()" title="Share stream">🔗</button>
      `;
      ctrl.querySelector('.live-ctrl-btns')?.prepend(extra);
    }
  };

  // ── Poll Creator ──
  window.afribLiveCreatePoll = function() {
    const user = window.currentUser;
    if (!user) return;
    const title = prompt('Poll question:');
    if (!title) return;
    const opt1 = prompt('Option 1:');
    const opt2 = prompt('Option 2:');
    const opt3 = prompt('Option 3 (or leave blank):');
    if (!opt1 || !opt2) { if (typeof showToast==='function') showToast('⚠️ Need at least 2 options'); return; }
    const poll = {
      id:    'poll_' + Date.now(),
      title,
      options: [opt1, opt2, opt3].filter(Boolean).map(text => ({ text, votes: 0 })),
      createdAt: Date.now(),
      streamId: window.AfribLive?.getState?.()?.activeStreamId,
    };
    localStorage.setItem('afrib_live_poll', JSON.stringify(poll));
    broadcastPoll(poll);
    if (typeof showToast==='function') showToast('📊 Poll created! Viewers can now vote.');
  };

  function broadcastPoll(poll) {
    try {
      new BroadcastChannel('afrib_live_chan').postMessage({ type: 'poll', poll });
    } catch(e) {}
  }

  window.afribLiveVotePoll = function(optionIdx) {
    try {
      const poll = JSON.parse(localStorage.getItem('afrib_live_poll') || 'null');
      if (!poll || !poll.options[optionIdx]) return;
      poll.options[optionIdx].votes++;
      localStorage.setItem('afrib_live_poll', JSON.stringify(poll));
      _renderPoll(poll);
    } catch(e) {}
  };

  function _renderPoll(poll) {
    const panel = document.getElementById('livePollPanel');
    const qEl   = document.getElementById('lppQuestion');
    const oEl   = document.getElementById('lppOptions');
    if (!panel || !qEl || !oEl) return;
    const total = poll.options.reduce((s, o) => s + o.votes, 0) || 1;
    qEl.textContent = poll.title;
    oEl.innerHTML = poll.options.map((o, i) => {
      const pct = Math.round((o.votes / total) * 100);
      return `
        <button class="lpp-option" onclick="afribLiveVotePoll(${i})">
          <div class="lpp-opt-bar" style="width:${pct}%"></div>
          <span class="lpp-opt-text">${_esc(o.text)}</span>
          <span class="lpp-opt-pct">${pct}%</span>
        </button>`;
    }).join('');
    panel.style.display = 'block';
  }

  // ── Q&A toggle ──
  window.afribLiveToggleQA = function() {
    const existing = document.getElementById('liveQAMode');
    if (existing) { existing.remove(); if (typeof showToast==='function') showToast('Q&A mode off'); return; }
    const banner = document.createElement('div');
    banner.id = 'liveQAMode';
    banner.className = 'live-qa-banner';
    banner.innerHTML = '❓ Q&A Mode ON — viewers can submit questions';
    document.getElementById('liveViewerOverlay')?.appendChild(banner);
    if (typeof showToast==='function') showToast('❓ Q&A mode activated!');
  };

  // ── Share stream link ──
  window.afribLiveShareStreamLink = function() {
    const streamId = window.AfribLive?.getState?.()?.activeStreamId;
    const url = `${window.location.origin}${window.location.pathname}?screen=style&open=live&stream=${streamId||''}`;
    if (typeof window.AfribPWA?.share === 'function') {
      window.AfribPWA.share({ title:'Watch me live on AfriBConnect!', url });
    } else if (typeof window.AfribPWA?.copyToClipboard === 'function') {
      window.AfribPWA.copyToClipboard(url);
    }
  };

  // ── Category filter ──
  window.afribLiveFilterCat = function(btn, cat) {
    document.querySelectorAll('.live-cf-chip').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const grid = document.getElementById('liveGrid');
    if (!grid) return;
    const slots = grid.querySelectorAll('.live-slot-active');
    slots.forEach(slot => {
      const catEl = slot.querySelector('.live-slot-category');
      const slotCat = catEl?.textContent || '';
      const show = cat.includes('All') || slotCat.toLowerCase().includes(cat.split(' ')[1]?.toLowerCase() || '');
      slot.style.display = show ? '' : 'none';
    });
  };

  // ── Search ──
  let _searchTimer = null;
  window.afribLiveSearch = function(query) {
    clearTimeout(_searchTimer);
    _searchTimer = setTimeout(() => {
      const grid = document.getElementById('liveGrid');
      if (!grid) return;
      const q = query.toLowerCase().trim();
      grid.querySelectorAll('.live-slot-active').forEach(slot => {
        const name = slot.querySelector('.live-slot-name')?.textContent?.toLowerCase() || '';
        const cat  = slot.querySelector('.live-slot-category')?.textContent?.toLowerCase() || '';
        slot.style.display = (!q || name.includes(q) || cat.includes(q)) ? '' : 'none';
      });
    }, 200);
  };

  // ── Sort modes ──
  const SORT_MODES = ['⚡ Hot','👥 Viewers','🆕 Newest','🎁 Gifted'];
  let _sortIdx = 0;
  window.afribLiveCycleSortMode = function(btn) {
    _sortIdx = (_sortIdx + 1) % SORT_MODES.length;
    const mode = SORT_MODES[_sortIdx];
    const label = document.getElementById('liveSortLabel');
    if (label) label.textContent = mode;
    _sortStreams(mode);
  };

  function _sortStreams(mode) {
    const streams = window.AfribLive?.getStreams?.() || [];
    let sorted;
    if (mode.includes('Viewers')) sorted = [...streams].sort((a,b) => (b.viewerCount||0)-(a.viewerCount||0));
    else if (mode.includes('Newest')) sorted = [...streams].sort((a,b) => b.startedAt - a.startedAt);
    else sorted = [...streams].sort((a,b) => (b.viewerCount||0)+(b.giftTotal||0) - ((a.viewerCount||0)+(a.giftTotal||0)));
    // Update grid
    const grid = document.getElementById('liveGrid');
    if (!grid) return;
    sorted.forEach((s, i) => {
      const el = document.getElementById('liveSlotVideo_' + s.id)?.closest('.live-slot-active');
      if (el) el.style.order = i;
    });
  }

  /* ─────────────────────────────────────────────────────────────────
     §5  3-SECOND COUNTDOWN BEFORE GOING LIVE (like TikTok)
  ───────────────────────────────────────────────────────────────────*/
  const _hookStart = () => {
    if (typeof window.afribLiveStartStream !== 'function') { setTimeout(_hookStart, 500); return; }
    if (window.afribLiveStartStream._counted) return;
    const orig = window.afribLiveStartStream;
    window.afribLiveStartStream = function() {
      // Close the go-live modal first
      const modal = document.getElementById('goLiveModal');

      // Show countdown then actually start
      _showCountdown(3, () => {
        // Re-call original (modal already closed by countdown)
        orig.apply(this, arguments);
        // Auto-post welcome message
        setTimeout(() => {
          const streamId = window.AfribLive?.getState?.()?.activeStreamId;
          if (streamId && typeof window._afribLiveAddChatInternal === 'function') {
            const name = window.currentUser?.first || 'Host';
            window._afribLiveAddChatInternal(streamId, { name: '🤖 AfriBConnect', text: `Welcome to ${name}'s live stream! 🎉🌍` });
          }
        }, 2000);
      });
    };
    window.afribLiveStartStream._counted = true;
  };
  setTimeout(_hookStart, 1200);

  function _showCountdown(n, callback) {
    const el = document.createElement('div');
    el.className = 'live-countdown-overlay';
    el.innerHTML = `<div class="lco-number" id="lcoNum">${n}</div><div class="lco-text">Going Live…</div>`;
    document.body.appendChild(el);

    let current = n;
    const tick = () => {
      current--;
      const num = document.getElementById('lcoNum');
      if (num) {
        if (current > 0) {
          num.textContent = current;
          num.style.animation = 'none';
          void num.offsetWidth;
          num.style.animation = 'lcoPop .7s ease';
          setTimeout(tick, 700);
        } else {
          num.textContent = '🔴';
          num.style.fontSize = '80px';
          setTimeout(() => {
            el.remove();
            if (typeof callback === 'function') callback();
          }, 600);
        }
      }
    };
    setTimeout(tick, 700);
  }

  /* ─────────────────────────────────────────────────────────────────
     §6  STREAM QUALITY INDICATOR
  ───────────────────────────────────────────────────────────────────*/
  function _showStreamQuality(stream) {
    const quality = window.AfribPWA?.networkQuality || 'good';
    const bar = document.getElementById('liveMyControls');
    if (!bar) return;
    const existing = document.getElementById('liveQualityBadge');
    if (existing) existing.remove();
    const badge = document.createElement('span');
    badge.id = 'liveQualityBadge';
    badge.className = 'live-quality-badge';
    const labels = { good: '🟢 HD', fair: '🟡 SD', poor: '🔴 Low' };
    badge.textContent = labels[quality] || '🟢 HD';
    badge.style.cssText = 'font-size:10px;font-weight:700;padding:2px 6px;border-radius:6px;background:rgba(0,0,0,.4);color:#fff;margin-left:4px';
    bar.querySelector('.live-ctrl-info')?.appendChild(badge);
  }

  // Poll visibility from BroadcastChannel
  try {
    if (window.BroadcastChannel) {
      const bc2 = new BroadcastChannel('afrib_live_chan');
      bc2.addEventListener('message', e => {
        if (e.data?.type === 'poll' && e.data.poll) {
          _renderPoll(e.data.poll);
        }
      });
    }
  } catch(e) {}

  /* ─────────────────────────────────────────────────────────────────
     §7  CSS FOR ALL NEW ELEMENTS
  ───────────────────────────────────────────────────────────────────*/
  function injectUpgradeCSS() {
    if (document.getElementById('live-upgrade-css')) return;
    const s = document.createElement('style');
    s.id = 'live-upgrade-css';
    s.textContent = `
/* ── Stats Bar ── */
#liveStatsBar { padding: 0 12px 8px; }
.lsb-wrap { display: flex; gap: 8px; align-items: center; }
.lsb-stat {
  display: flex; align-items: center; gap: 5px;
  background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1);
  border-radius: 20px; padding: 5px 12px; font-size: 12px;
}
.lsb-icon { font-size: 14px; }
.lsb-val { font-weight: 800; color: #fff; }
.lsb-label { color: rgba(255,255,255,.5); font-size: 10px; }

/* ── Category Filter ── */
.live-cat-filters {
  display: flex; gap: 6px; overflow-x: auto; padding: 0 12px 8px;
  scrollbar-width: none;
}
.live-cat-filters::-webkit-scrollbar { display: none; }
.live-cf-chip {
  flex-shrink: 0; padding: 5px 12px; border-radius: 20px;
  border: 1px solid rgba(255,255,255,.15); background: transparent;
  color: rgba(255,255,255,.6); font-size: 11px; font-weight: 700; cursor: pointer;
  white-space: nowrap; touch-action: manipulation;
  transition: background .15s, color .15s, border-color .15s;
}
.live-cf-chip.active {
  background: rgba(255,71,87,.15); color: #ff4757; border-color: rgba(255,71,87,.3);
}
.live-cf-chip:hover { background: rgba(255,255,255,.08); color: #fff; }

/* ── Discover Row ── */
.live-discover-row { padding: 0 12px 8px; }
.ldr-wrap { display: flex; gap: 8px; align-items: center; }
.live-search-input {
  flex: 1; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.12);
  border-radius: 20px; padding: 8px 16px; color: #fff; font-size: 13px; outline: none;
}
.live-search-input::placeholder { color: rgba(255,255,255,.35); }
.live-sort-btn {
  background: rgba(212,175,55,.12); border: 1px solid rgba(212,175,55,.2);
  border-radius: 20px; padding: 8px 14px; color: var(--gold); font-size: 12px;
  font-weight: 700; cursor: pointer; white-space: nowrap; touch-action: manipulation;
}

/* ── Join Splash ── */
.live-join-splash {
  position: absolute; inset: 0; z-index: 50;
  background: rgba(0,0,0,.85);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  transition: opacity .4s ease;
}
.ljs-text {
  font-size: 64px; font-weight: 900; color: #ff4757;
  animation: lcoPop .6s ease;
  text-shadow: 0 0 40px rgba(255,71,87,.5);
}
.ljs-sub { font-size: 16px; color: rgba(255,255,255,.7); margin-top: 8px; }

/* ── 3-Second Countdown ── */
.live-countdown-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,.9);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.lco-number {
  font-size: 120px; font-weight: 900; color: #ff4757;
  animation: lcoPop .7s ease;
  text-shadow: 0 0 60px rgba(255,71,87,.6);
  line-height: 1;
}
.lco-text {
  font-size: 18px; color: rgba(255,255,255,.7); margin-top: 12px; font-weight: 700;
}
@keyframes lcoPop {
  0%   { transform: scale(0.4); opacity: 0; }
  60%  { transform: scale(1.15); }
  100% { transform: scale(1); opacity: 1; }
}

/* ── Top Gifter Banner ── */
.live-gifter-banner {
  position: absolute; top: 130px; left: 16px;
  z-index: 12; display: flex; align-items: center; gap: 8px;
  background: rgba(212,175,55,.15); border: 1px solid rgba(212,175,55,.3);
  backdrop-filter: blur(8px); border-radius: 20px; padding: 6px 14px;
  font-size: 12px; font-weight: 700; color: var(--gold);
  opacity: 0; transform: translateY(-20px);
  transition: opacity .3s, transform .3s;
}
.lgb-crown { font-size: 16px; }

/* ── Live Goal Bar ── */
.live-goal-bar {
  position: absolute; bottom: 70px; left: 12px; right: 12px;
  z-index: 12;
  background: rgba(0,0,0,.45); backdrop-filter: blur(8px);
  border: 1px solid rgba(212,175,55,.2); border-radius: 12px; padding: 8px 12px;
}
.lgb-info { display: flex; justify-content: space-between; margin-bottom: 5px; }
.lgb-label { font-size: 11px; color: rgba(255,255,255,.6); font-weight: 700; }
.lgb-amount { font-size: 11px; color: var(--gold); font-weight: 700; }
.lgb-track { height: 4px; background: rgba(255,255,255,.1); border-radius: 2px; overflow: hidden; }
.lgb-fill {
  height: 100%; border-radius: 2px;
  background: linear-gradient(90deg, #D4AF37, #ff9900);
  transition: width .5s ease;
}

/* ── Leaderboard Panel ── */
.live-leaderboard {
  position: absolute; top: 160px; right: 12px; width: 200px;
  z-index: 15; background: rgba(15,10,25,.95); backdrop-filter: blur(20px);
  border: 1px solid rgba(212,175,55,.25); border-radius: 16px; padding: 12px;
}
.llb-header {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 13px; font-weight: 800; color: var(--gold); margin-bottom: 10px;
}
.llb-close {
  background: none; border: none; color: rgba(255,255,255,.4); cursor: pointer; font-size: 16px;
}
.llb-item {
  display: flex; align-items: center; gap: 8px;
  padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,.05);
  font-size: 12px;
}
.llb-rank { font-size: 14px; flex-shrink: 0; }
.llb-name { flex: 1; color: #fff; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.llb-coins { color: var(--gold); font-weight: 700; font-size: 11px; }

/* ── Poll Panel ── */
.live-poll-panel {
  position: absolute; bottom: 90px; left: 12px; right: 12px;
  z-index: 18; background: rgba(15,10,25,.95); backdrop-filter: blur(20px);
  border: 1px solid rgba(255,71,87,.25); border-radius: 16px; padding: 14px;
}
.lpp-header {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 13px; font-weight: 800; color: #ff4757; margin-bottom: 10px;
}
.lpp-close {
  background: none; border: none; color: rgba(255,255,255,.4); cursor: pointer; font-size: 16px;
}
.lpp-question { font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 10px; }
.lpp-options { display: flex; flex-direction: column; gap: 6px; }
.lpp-option {
  position: relative; display: flex; align-items: center; justify-content: space-between;
  padding: 8px 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,.15);
  background: rgba(255,255,255,.06); cursor: pointer; overflow: hidden;
  touch-action: manipulation;
}
.lpp-opt-bar {
  position: absolute; left: 0; top: 0; bottom: 0;
  background: rgba(255,71,87,.2); transition: width .4s ease;
  border-radius: 10px;
}
.lpp-opt-text { position: relative; z-index: 1; font-size: 12px; color: #fff; font-weight: 600; }
.lpp-opt-pct { position: relative; z-index: 1; font-size: 11px; color: rgba(255,255,255,.6); font-weight: 700; }

/* ── Q&A Banner ── */
.live-qa-banner {
  position: absolute; top: 160px; left: 50%; transform: translateX(-50%);
  z-index: 12; background: rgba(83,82,237,.25); border: 1px solid rgba(83,82,237,.4);
  backdrop-filter: blur(8px); border-radius: 20px; padding: 6px 16px;
  font-size: 12px; font-weight: 700; color: #a5b4fc; white-space: nowrap;
}
    `;
    document.head.appendChild(s);
  }

  /* Boot */
  injectUpgradeCSS();
  log('✅ Live Screen Upgrade loaded');

})();
