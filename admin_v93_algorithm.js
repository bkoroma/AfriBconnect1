/*!
 * AfribConnect — Admin Panel Full Upgrade v92
 * 
 * Injects into admin.html via <script> tag at bottom.
 * 
 * WHAT THIS FIXES & ADDS:
 * ─────────────────────────────────────────────────
 * FIXES:
 *  1. Dashboard — adds Live Streams, Post Sounds, Gifter Levels stat cards
 *  2. YourStyle Feed — adds Feature/Pin/Report post, Sound indicator, bulk delete, Comments view
 *  3. GiftMe Withdrawals — implements dmAdminRenderWithdrawals properly
 *  4. Analytics — adds gifter level breakdown, post sound stats, live match stats
 *  5. Users — adds bulk suspend/unsuspend/delete/grant-coins, gifter level badge display
 *  6. Wallets — adds grant coins directly, deduct coins, coin history
 *  7. Settings — adds v91 Live Match settings, post sound library management
 *  8. Broadcast — adds schedule broadcast, segment by gifter level
 *  9. Activity log — adds filter by date range, export with full detail
 *
 * NEW PANELS:
 *  10. 🎵 Sounds Admin — view all post sounds, most used, manage library
 *  11. 🥊 Live Matches — view all matches, scores, participants, stats
 *  12. 🏅 Gifter Levels — leaderboard, level distribution, XP stats, top gifters
 *  13. 📣 Notifications — all user notifications sent, read rates
 *
 * SUPER ADMIN improvements injected separately into superadmin.html
 */

(function AdminV92() {
  'use strict';
  if (window.__adminV92) return;
  window.__adminV92 = true;

  /* ── Only run inside admin panel ── */
  const isAdmin = document.getElementById('p-dashboard') !== null;
  if (!isAdmin) return;

  /* ═══════════════════════════════════════════════════════
     HELPERS
  ═══════════════════════════════════════════════════════ */
  function tp(k, fb) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch(_) { return fb; } }
  function sp(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch(_) { return false; } }
  function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function toast(msg) { if (typeof showToastA === 'function') showToastA(msg); else alert(msg); }
  function log(type, action, detail) {
    if (typeof appendLog === 'function') {
      const admin = (typeof currentAdmin !== 'undefined' ? currentAdmin : null) || tp('admin_session',{}).user || 'admin';
      appendLog(type, admin, action, detail || '');
    }
  }
  function fmtDate(iso) { if (!iso) return '—'; try { return new Date(iso).toLocaleString('en-GB',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}); } catch(_) { return iso; } }
  function statCard(icon, val, label, color) {
    return `<div class="stat-card"><div class="stat-icon">${icon}</div><div class="stat-val" style="${color?'color:'+color:''}">${val}</div><div class="stat-label">${label}</div></div>`;
  }

  /* Data accessors matching main app */
  function getAccts()  { return tp('afrib_accounts', {}); }
  function getUsers()  { return Object.values(getAccts()); }
  function getPosts()  { return tp('afrib_style_posts', []); }
  function getCoins(email) { return parseInt(localStorage.getItem('afrib_coins_'+email)||'0'); }
  function setCoins(email, n) { localStorage.setItem('afrib_coins_'+email, Math.max(0,parseInt(n)||0)); }
  function getLiveStreams() { return tp('afrib_live_streams', []); }
  function getLiveMatches() { return tp('afrib_live_matches_v91', []); }
  function getGifterStats(email) { return tp('afrib_gift_stats_'+email, {}); }
  function getAllGifterStats() {
    const result = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('afrib_gift_stats_')) {
        const email = k.replace('afrib_gift_stats_','');
        const data = tp(k, {});
        if (data.totalCoinsSpent > 0) result.push({ email, ...data });
      }
    }
    return result.sort((a,b) => (b.totalCoinsSpent||0) - (a.totalCoinsSpent||0));
  }
  function getPostGifts(postId) { return tp('afrib_post_gifts_v88',{})[postId] || {total:0,topGifts:[]}; }

  /* ═══════════════════════════════════════════════════════
     §1  CSS ENHANCEMENTS
  ═══════════════════════════════════════════════════════ */
  const style = document.createElement('style');
  style.id = 'admin-v92-css';
  style.textContent = `
  /* New panel tab buttons */
  .adm-tab-new { background: rgba(212,175,55,.08) !important; border: 1px solid rgba(212,175,55,.2) !important; }
  /* Sound indicator badge */
  .v92-sound-pill { display:inline-flex;align-items:center;gap:3px;background:rgba(212,175,55,.12);
    color:#D4AF37;border-radius:8px;padding:1px 6px;font-size:10px;font-weight:700;margin-left:4px; }
  /* Gifter badge inline */
  .v92-gifter-badge { display:inline-flex;align-items:center;gap:3px;border-radius:6px;
    padding:1px 5px;font-size:9px;font-weight:800; }
  /* Match status chip */
  .v92-chip { display:inline-block;border-radius:6px;padding:2px 7px;font-size:10px;font-weight:700;white-space:nowrap; }
  .v92-chip-active  { background:rgba(34,197,94,.12);color:#22c55e;border:1px solid rgba(34,197,94,.25); }
  .v92-chip-ended   { background:rgba(255,255,255,.06);color:rgba(255,255,255,.45); }
  .v92-chip-open    { background:rgba(255,193,7,.12);color:#ffc107;border:1px solid rgba(255,193,7,.25); }
  /* Level distribution bar */
  .v92-level-bar { display:flex;height:8px;border-radius:4px;overflow:hidden;gap:1px;margin-top:4px; }
  .v92-level-seg { height:100%;transition:flex .3s ease; }
  /* Dashboard new section */
  .v92-dash-section { margin-top:20px; }
  .v92-dash-title { font-size:13px;font-weight:800;color:rgba(255,255,255,.7);margin-bottom:10px;
    text-transform:uppercase;letter-spacing:.6px;padding-bottom:6px;border-bottom:1px solid rgba(255,255,255,.07); }
  /* Inline action button mini */
  .v92-mini-btn { padding:3px 8px;border-radius:6px;font-size:10px;font-weight:700;cursor:pointer;border:none;transition:all .15s; }
  .v92-mini-btn-gold  { background:rgba(212,175,55,.15);color:#D4AF37;border:1px solid rgba(212,175,55,.3); }
  .v92-mini-btn-red   { background:rgba(239,68,68,.1);color:#ef4444;border:1px solid rgba(239,68,68,.25); }
  .v92-mini-btn-green { background:rgba(34,197,94,.1);color:#22c55e;border:1px solid rgba(34,197,94,.25); }
  .v92-mini-btn-blue  { background:rgba(99,102,241,.1);color:#818cf8;border:1px solid rgba(99,102,241,.25); }
  .v92-mini-btn:hover { opacity:.8; }
  /* Post preview thumb */
  .v92-post-thumb { width:40px;height:40px;border-radius:6px;object-fit:cover;display:block; }
  .v92-post-thumb-placeholder { width:40px;height:40px;border-radius:6px;background:rgba(255,255,255,.06);
    display:flex;align-items:center;justify-content:center;font-size:16px; }
  /* Score bar small */
  .v92-score-bar-sm { display:flex;height:5px;border-radius:3px;overflow:hidden;gap:1px; }
  .v92-score-seg-sm { height:100%; }
  .v92-score-seg-sm:nth-child(1){background:#ff4757}
  .v92-score-seg-sm:nth-child(2){background:#7c3aed}
  .v92-score-seg-sm:nth-child(3){background:#22c55e}
  .v92-score-seg-sm:nth-child(4){background:#D4AF37}
  `;
  document.head.appendChild(style);

  /* ═══════════════════════════════════════════════════════
     §2  INJECT NEW TABS INTO ADMIN NAV
  ═══════════════════════════════════════════════════════ */
  function injectNewTabs() {
    const nav = document.querySelector('.adm-tabs');
    if (!nav || nav.dataset.v92) return;
    nav.dataset.v92 = '1';

    // We'll add tabs before the settings tab
    const settingsBtn = [...nav.querySelectorAll('.adm-tab')].find(b => b.textContent.includes('Settings'));
    const newTabs = [
      ['sounds',   '🎵 Sounds'],
      ['matches',  '🥊 Matches'],
      ['gifters',  '🏅 Gifters'],
      ['notifs',   '📣 Notifs'],
    ];

    newTabs.forEach(([name, label]) => {
      const btn = document.createElement('button');
      btn.className = 'adm-tab adm-tab-new';
      btn.onclick = () => { if (typeof goPanel === 'function') goPanel(btn, name); };
      btn.textContent = label;
      if (settingsBtn) nav.insertBefore(btn, settingsBtn);
      else nav.appendChild(btn);
    });

    // Inject new panels HTML
    _injectPanelHTMLs();
  }

  function _injectPanelHTMLs() {
    const main = document.querySelector('.adm-content') || document.querySelector('main');
    if (!main) return;

    // Create container for new panels if not exist
    if (!document.getElementById('p-sounds')) {
      const wrap = document.createElement('div');
      wrap.innerHTML = `
        <!-- SOUNDS ADMIN -->
        <div class="panel" id="p-sounds">
          <div class="panel-title">🎵 Post Sounds Manager</div>
          <div class="panel-sub">All sounds added to posts — usage stats, sound library management</div>
          <div class="stat-row" id="soundsStats"></div>
          <div class="v92-dash-section">
            <div class="v92-dash-title">Most Used Sounds</div>
            <div id="soundsTopList"></div>
          </div>
          <div class="v92-dash-section">
            <div class="v92-dash-title">Posts With Sounds</div>
            <div class="search-row">
              <input class="s-inp" id="soundPostSearch" placeholder="🔍 Search by sound name or author…" oninput="v92FilterSoundPosts()"/>
            </div>
            <div class="tbl-wrap"><table class="data-tbl">
              <thead><tr><th>Post</th><th>Author</th><th>Sound</th><th>Artist</th><th>❤️</th><th>Posted</th><th>Actions</th></tr></thead>
              <tbody id="soundPostsBody"></tbody>
            </table></div>
          </div>
        </div>

        <!-- LIVE MATCHES ADMIN -->
        <div class="panel" id="p-matches">
          <div class="panel-title">🥊 Live Matches</div>
          <div class="panel-sub">All match sessions, scores, participants, and gift totals</div>
          <div class="stat-row" id="matchesStats"></div>
          <div class="search-row" style="margin-top:16px">
            <input class="s-inp" id="matchSearch" placeholder="🔍 Search by title, participant…" oninput="v92FilterMatches()"/>
            <select class="s-sel" id="matchStatusFilter" onchange="v92FilterMatches()">
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="active">Active</option>
              <option value="ended">Ended</option>
            </select>
            <button class="btn btn-ghost" onclick="v92ClearEndedMatches()" style="color:var(--red);border-color:rgba(239,68,68,.3)">🗑 Clear Ended</button>
            <button class="btn btn-ghost" onclick="v92InitMatches()">🔄 Refresh</button>
          </div>
          <div class="tbl-wrap"><table class="data-tbl">
            <thead><tr><th>Title</th><th>Status</th><th>Participants</th><th>Duration</th><th>Score Leader</th><th>Total Gifts</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody id="matchesBody"></tbody>
          </table></div>
        </div>

        <!-- GIFTER LEVELS ADMIN -->
        <div class="panel" id="p-gifters">
          <div class="panel-title">🏅 Gifter Levels & Stats</div>
          <div class="panel-sub">Gifter XP, level distribution, top gifters, and economy overview</div>
          <div class="stat-row" id="giftersStats"></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px">
            <div class="chart-card">
              <div class="chart-title">📊 Level Distribution</div>
              <div id="gifterLevelDist"></div>
            </div>
            <div class="chart-card">
              <div class="chart-title">🏆 Top 10 Gifters All-Time</div>
              <div id="gifterTopList"></div>
            </div>
          </div>
          <div class="v92-dash-section">
            <div class="v92-dash-title">All Gifters</div>
            <div class="search-row">
              <input class="s-inp" id="gifterSearch" placeholder="🔍 Search by email…" oninput="v92FilterGifters()"/>
              <select class="s-sel" id="gifterTierFilter" onchange="v92FilterGifters()">
                <option value="">All Tiers</option>
                <option value="basic">Basic (1-10)</option>
                <option value="active">Active (11-20)</option>
                <option value="power">Power (21-30)</option>
                <option value="elite">Elite (31-40)</option>
                <option value="legendary">Legendary (41-49)</option>
                <option value="god">Quartz God (50)</option>
              </select>
              <button class="btn btn-ghost" onclick="v92ExportGiftersCSV()">📥 Export CSV</button>
            </div>
            <div class="tbl-wrap"><table class="data-tbl">
              <thead><tr><th>Rank</th><th>User</th><th>Level</th><th>Tier</th><th>Coins Spent</th><th>Gifts Sent</th><th>Streak</th><th>Actions</th></tr></thead>
              <tbody id="giftersBody"></tbody>
            </table></div>
          </div>
        </div>

        <!-- NOTIFICATIONS ADMIN -->
        <div class="panel" id="p-notifs">
          <div class="panel-title">📣 Notifications Center</div>
          <div class="panel-sub">All in-app notifications — delivery, read rates, and management</div>
          <div class="stat-row" id="notifsStats"></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px">
            <div class="chart-card">
              <div class="chart-title">📤 Send System Notification</div>
              <div class="mf"><label>Title</label><input type="text" id="sysNotifTitle" placeholder="e.g. New feature alert!"/></div>
              <div class="mf"><label>Message</label><textarea id="sysNotifMsg" rows="3" placeholder="Message body…"></textarea></div>
              <div class="mf"><label>Icon</label>
                <select id="sysNotifIcon">
                  <option value="🎁">🎁 Gift</option><option value="🔴">🔴 Live</option>
                  <option value="💰">💰 Wallet</option><option value="🎉">🎉 Event</option>
                  <option value="⚠️">⚠️ Alert</option><option value="✨">✨ Feature</option>
                  <option value="🎮">🎮 Game</option><option value="💕">💕 AfriMatch</option>
                </select>
              </div>
              <div class="mf"><label>Target</label>
                <select id="sysNotifTarget">
                  <option value="all">All Users</option>
                  <option value="active">Active last 7 days</option>
                  <option value="gifters">Users who have gifted</option>
                  <option value="noGift">Never gifted</option>
                  <option value="dating">AfriMatch users</option>
                </select>
              </div>
              <button class="btn btn-gold" onclick="v92SendSystemNotif()" style="width:100%">📣 Send Notification</button>
            </div>
            <div class="chart-card">
              <div class="chart-title">📊 Notification Stats</div>
              <div id="notifBreakdown"></div>
            </div>
          </div>
          <div class="v92-dash-section">
            <div class="v92-dash-title">Notification History</div>
            <div class="tbl-wrap"><table class="data-tbl">
              <thead><tr><th>Time</th><th>Icon</th><th>Title</th><th>Message</th><th>Target</th><th>Sent To</th></tr></thead>
              <tbody id="notifHistBody"></tbody>
            </table></div>
          </div>
        </div>
      `;
      main.appendChild(wrap);
    }
  }

  /* Patch goPanel to init new panels */
  function patchGoPanel() {
    const orig = window.goPanel;
    if (!orig || orig._v92) return;
    window.goPanel = function(btn, name) {
      orig.apply(this, arguments);
      if (name === 'sounds')  v92InitSounds();
      if (name === 'matches') v92InitMatches();
      if (name === 'gifters') v92InitGifters();
      if (name === 'notifs')  v92InitNotifs();
    };
    window.goPanel._v92 = true;
  }

  /* ═══════════════════════════════════════════════════════
     §3  ENHANCE EXISTING PANELS
  ═══════════════════════════════════════════════════════ */

  // ── Dashboard: add new stat cards ──
  function enhanceDashboard() {
    const orig = window.initDashboard;
    if (!orig || orig._v92) return;
    window.initDashboard = function() {
      orig.apply(this, arguments);
      _addDashboardExtras();
    };
    window.initDashboard._v92 = true;
  }

  function _addDashboardExtras() {
    let extra = document.getElementById('v92DashExtra');
    if (!extra) {
      extra = document.createElement('div');
      extra.id = 'v92DashExtra';
      const actFeedParent = document.getElementById('actFeed')?.closest('.chart-row') ||
                            document.getElementById('dStats')?.parentElement;
      if (actFeedParent) actFeedParent.after(extra);
      else document.getElementById('p-dashboard')?.appendChild(extra);
    }

    const users = getUsers();
    const posts = getPosts();
    const streams = getLiveStreams();
    const matches = getLiveMatches();
    const gifterStats = getAllGifterStats();
    const postsWithSound = posts.filter(p => p.sound);
    const totalGiftCoins = gifterStats.reduce((s,g) => s + (g.totalCoinsSpent||0), 0);
    const activeMatches = matches.filter(m => m.status === 'active').length;

    extra.innerHTML = `
      <div class="v92-dash-section">
        <div class="v92-dash-title">🎁 GiftMe & Live Economy</div>
        <div class="stat-row">
          ${statCard('🎁', gifterStats.length, 'Total Gifters', '#D4AF37')}
          ${statCard('🪙', totalGiftCoins.toLocaleString(), 'Coins Gifted (all-time)', '#ff9800')}
          ${statCard('🎵', postsWithSound.length, 'Posts With Sound')}
          ${statCard('🥊', activeMatches, 'Active Matches', '#ff4757')}
          ${statCard('🔴', streams.filter(s=>s.status==='live').length, 'Live Now', '#ff4757')}
          ${statCard('🏅', gifterStats.filter(g=>g.totalCoinsSpent>=530).length, 'Level 10+ Gifters', '#22c55e')}
        </div>
      </div>
      <div class="v92-dash-section">
        <div class="v92-dash-title">📊 Top Gifters Quick View</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          ${gifterStats.slice(0,5).map((g,i) => {
            const name = g.email.split('@')[0];
            const medals = ['🥇','🥈','🥉','4th','5th'];
            return `<div style="background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:10px 14px;display:flex;align-items:center;gap:8px">
              <span style="font-size:16px">${medals[i]}</span>
              <div>
                <div style="font-size:12px;font-weight:700">${esc(name)}</div>
                <div style="font-size:10px;color:var(--w60)">🪙${(g.totalCoinsSpent||0).toLocaleString()} · 🎁${g.totalGifts||0}</div>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>
    `;
  }

  // ── Enhance YourStyle Feed panel ──
  function enhanceFeedPanel() {
    const orig = window.initFeedPanel;
    if (!orig || orig._v92) return;
    window.initFeedPanel = function() {
      _upgradeFeedPanelHTML();
      orig.apply(this, arguments);
    };
    window.initFeedPanel._v92 = true;

    // Enhance filterFeedAdmin to show sound badge + gift count + pin
    const origFilter = window.filterFeedAdmin;
    if (origFilter && !origFilter._v92) {
      window.filterFeedAdmin = function() {
        // Call original
        origFilter.apply(this, arguments);
        // Upgrade the table to add sound badges and extra buttons
        _upgradeFeedTableRows();
      };
      window.filterFeedAdmin._v92 = true;
    }
  }

  function _upgradeFeedPanelHTML() {
    const panel = document.getElementById('p-feed');
    if (!panel || panel.dataset.v92) return;
    panel.dataset.v92 = '1';

    // Add bulk delete + extra filter buttons
    const searchRow = panel.querySelector('.search-row');
    if (searchRow) {
      searchRow.innerHTML += `
        <select class="s-sel" id="feedSoundFilter" onchange="v92FilterFeedBySound()">
          <option value="">All Posts</option>
          <option value="sound">Has Sound 🎵</option>
          <option value="nosound">No Sound</option>
          <option value="gifts">Has Gifts 🎁</option>
        </select>
        <button class="btn btn-ghost" onclick="v92BulkDeleteSelectedPosts()" style="color:var(--red);border-color:rgba(239,68,68,.3)">🗑 Bulk Delete</button>
        <button class="btn btn-ghost" onclick="v92ExportFeedCSV()">📥 Export</button>
        <button class="btn btn-ghost" onclick="initFeedPanel()">🔄 Refresh</button>
      `;
    }

    // Add bulk select column to table header
    const thead = panel.querySelector('thead tr');
    if (thead && !thead.querySelector('th input')) {
      const th = document.createElement('th');
      th.innerHTML = `<input type="checkbox" id="feedSelectAll" onchange="v92ToggleFeedSelectAll(this)" style="accent-color:var(--gold)"/>`;
      thead.insertBefore(th, thead.firstElementChild);

      // Add extra columns
      thead.innerHTML = `
        <th><input type="checkbox" id="feedSelectAll" onchange="v92ToggleFeedSelectAll(this)" style="accent-color:var(--gold)"/></th>
        <th>Post</th><th>Author</th><th>Category</th>
        <th>Caption</th><th>Sound</th><th>❤️</th><th>💬</th><th>🎁</th>
        <th>Posted</th><th>Actions</th>
      `;
    }
  }

  function _upgradeFeedTableRows() {
    const body = document.getElementById('feedBody');
    if (!body) return;
    const posts = tp('afrib_style_posts', []);
    const q = (document.getElementById('feedSearch')?.value||'').toLowerCase();
    const cat = document.getElementById('feedCatFilter')?.value || '';
    const soundFilter = document.getElementById('feedSoundFilter')?.value || '';

    let filtered = posts;
    if (q) filtered = filtered.filter(p => ((p.caption||'')+(p.authorFirst||'')+(p.authorLast||'')).toLowerCase().includes(q));
    if (cat) filtered = filtered.filter(p => p.category === cat);
    if (soundFilter === 'sound') filtered = filtered.filter(p => p.sound);
    if (soundFilter === 'nosound') filtered = filtered.filter(p => !p.sound);
    if (soundFilter === 'gifts') filtered = filtered.filter(p => getPostGifts(p.id).total > 0);

    const rows = filtered.slice(0,100).map(p => {
      const likes = tp('afrib_style_likes_'+p.id,[]).length;
      const comments = tp('afrib_style_comments_'+p.id,[]).length;
      const gifts = getPostGifts(p.id);
      const soundBadge = p.sound
        ? `<span class="v92-sound-pill">🎵 ${esc(p.sound.name)}</span>`
        : '<span style="color:var(--w30);font-size:10px">—</span>';
      const img = p.imageData
        ? `<img src="${p.imageData}" class="v92-post-thumb"/>`
        : `<div class="v92-post-thumb-placeholder">📷</div>`;
      const isPinned = tp('afrib_pinned_posts',[]).includes(p.id);
      const authorName = esc((p.authorFirst||'')+' '+(p.authorLast||''));
      return `<tr>
        <td><input type="checkbox" class="feed-row-cb" data-pid="${esc(p.id)}" style="accent-color:var(--gold)"/></td>
        <td>${img}</td>
        <td style="font-size:12px">${authorName}<br><small style="color:var(--w60)">${esc(p.authorEmail||'')}</small></td>
        <td style="font-size:11px">${esc(p.category||'—')}</td>
        <td style="font-size:11px;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(p.caption||'—')}</td>
        <td>${soundBadge}</td>
        <td style="color:#ef4444">❤️ ${likes}</td>
        <td style="color:var(--w60)">💬 ${comments}</td>
        <td style="color:#D4AF37">${gifts.total ? `🎁 ${gifts.topGifts.length}<br><small>🪙${gifts.total}</small>` : '—'}</td>
        <td style="font-size:10px;color:var(--w60)">${p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-GB') : '—'}</td>
        <td style="white-space:nowrap;display:flex;gap:4px;flex-wrap:wrap">
          <button class="v92-mini-btn v92-mini-btn-blue" onclick="v92ViewPostComments('${esc(p.id)}')">💬</button>
          <button class="v92-mini-btn ${isPinned?'v92-mini-btn-gold':'v92-mini-btn-blue'}" onclick="v92TogglePin('${esc(p.id)}',this)">${isPinned?'📌':'📍'}</button>
          <button class="v92-mini-btn v92-mini-btn-red" onclick="adminDeletePost('${esc(p.id)}')">🗑</button>
        </td>
      </tr>`;
    }).join('');

    body.innerHTML = rows || `<tr><td colspan="11" style="text-align:center;color:var(--w60);padding:20px">No posts found</td></tr>`;
  }

  window.v92FilterFeedBySound = function() {
    if (typeof filterFeedAdmin === 'function') filterFeedAdmin();
    else _upgradeFeedTableRows();
  };

  window.v92ToggleFeedSelectAll = function(cb) {
    document.querySelectorAll('.feed-row-cb').forEach(c => { c.checked = cb.checked; });
  };

  window.v92BulkDeleteSelectedPosts = function() {
    const selected = [...document.querySelectorAll('.feed-row-cb:checked')].map(c => c.dataset.pid);
    if (!selected.length) { toast('⚠️ Select posts first'); return; }
    if (!confirm(`Delete ${selected.length} selected post(s)?`)) return;
    let posts = tp('afrib_style_posts',[]);
    posts = posts.filter(p => !selected.includes(p.id));
    sp('afrib_style_posts', posts);
    toast(`✅ ${selected.length} post(s) deleted`);
    log('admin', `Bulk deleted ${selected.length} posts`, selected.join(', '));
    if (typeof initFeedPanel === 'function') initFeedPanel();
  };

  window.v92TogglePin = function(postId, btn) {
    let pinned = tp('afrib_pinned_posts', []);
    const isPinned = pinned.includes(postId);
    if (isPinned) pinned = pinned.filter(id => id !== postId);
    else { pinned.unshift(postId); if (pinned.length > 10) pinned.length = 10; }
    sp('afrib_pinned_posts', pinned);
    btn.textContent = isPinned ? '📍' : '📌';
    btn.className = `v92-mini-btn ${isPinned ? 'v92-mini-btn-blue' : 'v92-mini-btn-gold'}`;
    toast(isPinned ? '📍 Post unpinned' : '📌 Post pinned to top of feed');
    log('admin', `${isPinned?'Unpinned':'Pinned'} post`, postId);
  };

  window.v92ViewPostComments = function(postId) {
    const comments = tp('afrib_style_comments_'+postId, []);
    const post = tp('afrib_style_posts',[]).find(p => p.id === postId);
    const modal = document.getElementById('editUserModal') || document.createElement('div');
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:3000;display:flex;align-items:center;justify-content:center';
    overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
    overlay.innerHTML = `
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:24px;max-width:500px;width:90%;max-height:70vh;overflow-y:auto">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <h3 style="margin:0">💬 Comments (${comments.length})</h3>
          <button onclick="this.closest('[style*=fixed]').remove()" style="background:none;border:none;color:var(--w60);font-size:20px;cursor:pointer">✕</button>
        </div>
        <div style="font-size:12px;color:var(--w60);margin-bottom:14px">Post: "${esc((post?.caption||'').slice(0,60))}"</div>
        ${comments.length ? comments.map((c,i) => `
          <div style="padding:10px;background:var(--bg3);border-radius:8px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
            <div>
              <div style="font-size:12px;font-weight:700">${esc(c.authorName||c.author||'User')}</div>
              <div style="font-size:12px;margin-top:3px">${esc(c.text||c.content||'')}</div>
              <div style="font-size:10px;color:var(--w40);margin-top:4px">${fmtDate(c.time||c.createdAt||'')}</div>
            </div>
            <button class="v92-mini-btn v92-mini-btn-red" onclick="v92DeleteComment('${esc(postId)}',${i},this)">🗑</button>
          </div>`).join('')
          : '<div style="color:var(--w60);text-align:center;padding:20px">No comments</div>'}
      </div>
    `;
    document.body.appendChild(overlay);
  };

  window.v92DeleteComment = function(postId, idx, btn) {
    let comments = tp('afrib_style_comments_'+postId, []);
    comments.splice(idx, 1);
    sp('afrib_style_comments_'+postId, comments);
    btn.closest('div[style*="padding:10px"]')?.remove();
    toast('Comment deleted');
    log('admin', 'Deleted comment from post', postId);
  };

  window.v92ExportFeedCSV = function() {
    const posts = tp('afrib_style_posts',[]);
    const rows = [['Post ID','Author','Email','Category','Caption','Likes','Comments','Gift Coins','Sound','Posted']];
    posts.forEach(p => {
      rows.push([p.id, (p.authorFirst||'')+' '+(p.authorLast||''), p.authorEmail||'',
        p.category||'', (p.caption||'').replace(/,/g,''), tp('afrib_style_likes_'+p.id,[]).length,
        tp('afrib_style_comments_'+p.id,[]).length, getPostGifts(p.id).total||0,
        p.sound ? p.sound.name : '', p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '']);
    });
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'afrib_posts_' + new Date().toISOString().slice(0,10) + '.csv';
    a.click();
    toast('✅ Posts CSV exported');
  };

  /* ═══════════════════════════════════════════════════════
     §4  SOUNDS ADMIN PANEL
  ═══════════════════════════════════════════════════════ */
  window.v92InitSounds = function() {
    const posts = getPosts();
    const postsWithSound = posts.filter(p => p.sound);

    // Count sound usage
    const soundCount = {};
    postsWithSound.forEach(p => {
      const k = p.sound.id;
      soundCount[k] = soundCount[k] || { ...p.sound, usageCount: 0 };
      soundCount[k].usageCount++;
    });
    const topSounds = Object.values(soundCount).sort((a,b) => b.usageCount - a.usageCount);

    // Stats
    const el = document.getElementById('soundsStats');
    if (el) el.innerHTML = [
      statCard('🎵', postsWithSound.length, 'Posts With Sound'),
      statCard('📀', topSounds.length, 'Unique Sounds Used'),
      statCard('🎙', postsWithSound.filter(p => p.sound.id?.startsWith('recorded')).length, 'Original Recordings'),
      statCard('🔥', topSounds[0]?.name || '—', 'Most Used Sound'),
    ].join('');

    // Top sounds list
    const top = document.getElementById('soundsTopList');
    if (top) top.innerHTML = topSounds.length ? `
      <div class="tbl-wrap"><table class="data-tbl">
        <thead><tr><th>Rank</th><th>Sound</th><th>Artist</th><th>Category</th><th>Used In</th></tr></thead>
        <tbody>${topSounds.slice(0,20).map((s,i) => `<tr>
          <td style="font-size:13px">${i<3?['🥇','🥈','🥉'][i]:'#'+(i+1)}</td>
          <td>${s.emoji||'🎵'} ${esc(s.name)}</td>
          <td style="color:var(--w60)">${esc(s.artist)}</td>
          <td style="font-size:11px">${esc(s.cat||'—')}</td>
          <td><strong style="color:var(--gold)">${s.usageCount}</strong> posts</td>
        </tr>`).join('')}</tbody>
      </table></div>` : '<div style="color:var(--w60);padding:20px">No sounds used yet</div>';

    window.v92FilterSoundPosts();
  };

  window.v92FilterSoundPosts = function() {
    const q = (document.getElementById('soundPostSearch')?.value||'').toLowerCase();
    const posts = getPosts().filter(p => p.sound);
    const filtered = q ? posts.filter(p =>
      (p.sound.name||'').toLowerCase().includes(q) ||
      (p.authorFirst||'').toLowerCase().includes(q) ||
      (p.authorLast||'').toLowerCase().includes(q)
    ) : posts;

    const body = document.getElementById('soundPostsBody');
    if (!body) return;
    body.innerHTML = filtered.slice(0,50).map(p => {
      const img = p.imageData ? `<img src="${p.imageData}" class="v92-post-thumb"/>` : `<div class="v92-post-thumb-placeholder">📷</div>`;
      return `<tr>
        <td>${img}</td>
        <td style="font-size:12px">${esc((p.authorFirst||'')+' '+(p.authorLast||''))}</td>
        <td>${p.sound.emoji||'🎵'} ${esc(p.sound.name)}</td>
        <td style="color:var(--w60);font-size:11px">${esc(p.sound.artist||'')}</td>
        <td style="color:#ef4444">❤️ ${tp('afrib_style_likes_'+p.id,[]).length}</td>
        <td style="font-size:10px;color:var(--w60)">${p.createdAt?new Date(p.createdAt).toLocaleDateString():'—'}</td>
        <td>
          <button class="v92-mini-btn v92-mini-btn-red" onclick="v92RemoveSoundFromPost('${esc(p.id)}')">🗑 Remove Sound</button>
        </td>
      </tr>`;
    }).join('') || `<tr><td colspan="7" style="text-align:center;color:var(--w60);padding:20px">No posts with sounds found</td></tr>`;
  };

  window.v92RemoveSoundFromPost = function(postId) {
    if (!confirm('Remove sound from this post?')) return;
    let posts = getPosts();
    const p = posts.find(x => x.id === postId);
    if (p) { delete p.sound; sp('afrib_style_posts', posts); }
    toast('✅ Sound removed from post');
    log('admin', 'Removed sound from post', postId);
    window.v92InitSounds();
  };

  /* ═══════════════════════════════════════════════════════
     §5  LIVE MATCHES ADMIN PANEL
  ═══════════════════════════════════════════════════════ */
  window.v92InitMatches = function() {
    const matches = getLiveMatches();
    const active = matches.filter(m => m.status === 'active');
    const ended  = matches.filter(m => m.status === 'ended');
    const open   = matches.filter(m => m.status === 'open');

    const el = document.getElementById('matchesStats');
    if (el) el.innerHTML = [
      statCard('🥊', matches.length, 'Total Matches'),
      statCard('🔴', active.length, 'Active Now', '#ff4757'),
      statCard('⏳', open.length, 'Waiting for Players', '#ffc107'),
      statCard('✅', ended.length, 'Completed'),
      statCard('🎁', matches.reduce((s,m) => s + (m.slots||[]).reduce((ss,sl) => ss+(sl.score||0), 0), 0).toLocaleString(), 'Total Gift Coins in Matches', '#D4AF37'),
    ].join('');

    window.v92FilterMatches();
  };

  window.v92FilterMatches = function() {
    const q = (document.getElementById('matchSearch')?.value||'').toLowerCase();
    const statusFilter = document.getElementById('matchStatusFilter')?.value || '';
    let matches = getLiveMatches();
    if (q) matches = matches.filter(m => (m.title||'').toLowerCase().includes(q) || (m.slots||[]).some(s => (s.name||'').toLowerCase().includes(q)));
    if (statusFilter) matches = matches.filter(m => m.status === statusFilter);

    const body = document.getElementById('matchesBody');
    if (!body) return;
    body.innerHTML = matches.slice(0,50).map(m => {
      const totalCoins = (m.slots||[]).reduce((s,sl) => s+(sl.score||0), 0);
      const leader = [...(m.slots||[])].sort((a,b) => (b.score||0)-(a.score||0))[0];
      const filledSlots = (m.slots||[]).filter(s => s.email).length;
      const statusMap = { open:'v92-chip-open', active:'v92-chip-active', ended:'v92-chip-ended' };
      const scoreBar = (m.slots||[]).filter(s=>s.email).map((s,i) =>
        `<div class="v92-score-seg-sm" style="flex:${Math.max(1,s.score||1)}"></div>`).join('');
      return `<tr>
        <td><strong>${esc(m.title||'Untitled Match')}</strong></td>
        <td><span class="v92-chip ${statusMap[m.status]||'v92-chip-ended'}">${m.status||'unknown'}</span></td>
        <td style="font-size:11px">${(m.slots||[]).map(s => s.email ? `<div>${esc((s.name||s.email).split('@')[0])} ${s.isHost?'(Host)':''}</div>` : '<div style="color:var(--w30)">Empty</div>').join('')}</td>
        <td>${m.duration||5} min</td>
        <td style="font-size:11px;color:var(--gold)">${leader?.name ? esc(leader.name.split(' ')[0])+' 🪙'+(leader.score||0) : '—'}</td>
        <td style="color:#D4AF37">${totalCoins ? `🪙${totalCoins.toLocaleString()}` : '—'}</td>
        <td style="font-size:10px;color:var(--w60)">${m.createdAt ? fmtDate(new Date(m.createdAt).toISOString()) : '—'}</td>
        <td>
          <button class="v92-mini-btn v92-mini-btn-red" onclick="v92EndMatch('${esc(m.id||'')}')" ${m.status==='ended'?'disabled':''}>⏹ End</button>
          <button class="v92-mini-btn v92-mini-btn-blue" onclick="v92DeleteMatch('${esc(m.id||'')}')">🗑</button>
        </td>
      </tr>`;
    }).join('') || `<tr><td colspan="8" style="text-align:center;color:var(--w60);padding:20px">No matches found</td></tr>`;
  };

  window.v92EndMatch = function(id) {
    if (!confirm('Force-end this match?')) return;
    let matches = getLiveMatches();
    const m = matches.find(x => x.id === id);
    if (m) { m.status = 'ended'; m.endedAt = Date.now(); sp('afrib_live_matches_v91', matches); }
    toast('✅ Match ended');
    log('admin', 'Force-ended live match', id);
    window.v92InitMatches();
  };

  window.v92DeleteMatch = function(id) {
    if (!confirm('Delete this match?')) return;
    sp('afrib_live_matches_v91', getLiveMatches().filter(m => m.id !== id));
    toast('✅ Match deleted');
    log('admin', 'Deleted live match', id);
    window.v92InitMatches();
  };

  window.v92ClearEndedMatches = function() {
    if (!confirm('Delete all ended matches?')) return;
    const before = getLiveMatches().length;
    sp('afrib_live_matches_v91', getLiveMatches().filter(m => m.status !== 'ended'));
    const after = getLiveMatches().length;
    toast(`✅ Cleared ${before - after} ended matches`);
    log('admin', `Cleared ${before-after} ended matches`);
    window.v92InitMatches();
  };

  /* ═══════════════════════════════════════════════════════
     §6  GIFTER LEVELS ADMIN PANEL
  ═══════════════════════════════════════════════════════ */
  const TIER_THRESHOLDS = { basic:[1,530], active:[531,27600], power:[27601,637000], elite:[637001,8780000], legendary:[8780001,79999999], god:[80000000,Infinity] };
  const TIER_COLORS = { basic:'#F9A8D4', active:'#F472B6', power:'#BAE6FD', elite:'#D4AF37', legendary:'#FF9800', god:'#FFD700' };
  const TIER_NAMES  = { basic:'Basic', active:'Active', power:'Power', elite:'Elite', legendary:'Legendary', god:'Quartz God' };

  function getTierForCoins(coins) {
    for (const [k,[min,max]] of Object.entries(TIER_THRESHOLDS)) {
      if (coins >= min && coins <= max) return k;
    }
    return 'basic';
  }

  function getLevel(coins) {
    if (!window.QUARTZ_LEVELS) return 1;
    let lvl = 1;
    for (const l of window.QUARTZ_LEVELS) { if (coins >= l.coins) lvl = l.level; else break; }
    return lvl;
  }

  window.v92InitGifters = function() {
    const stats = getAllGifterStats();
    const users = getAccts();

    // Tier distribution
    const tierCount = { basic:0, active:0, power:0, elite:0, legendary:0, god:0 };
    stats.forEach(g => { const tier = getTierForCoins(g.totalCoinsSpent||0); tierCount[tier]++; });
    const totalGifters = stats.length;
    const totalCoins = stats.reduce((s,g) => s+(g.totalCoinsSpent||0), 0);
    const avgCoins = totalGifters ? Math.round(totalCoins/totalGifters) : 0;
    const streakUsers = stats.filter(g => (g.streakDays||0) >= 7).length;

    const el = document.getElementById('giftersStats');
    if (el) el.innerHTML = [
      statCard('🎁', totalGifters, 'Total Gifters'),
      statCard('🪙', totalCoins.toLocaleString(), 'Total Coins Gifted', '#D4AF37'),
      statCard('📊', avgCoins.toLocaleString(), 'Avg Coins per Gifter'),
      statCard('🔥', streakUsers, '7+ Day Streak Gifters', '#ff9800'),
      statCard('👑', tierCount.legendary + tierCount.god, 'Legendary+ Gifters', '#ff4757'),
    ].join('');

    // Level distribution
    const dist = document.getElementById('gifterLevelDist');
    if (dist) {
      const tierOrder = ['basic','active','power','elite','legendary','god'];
      const bars = tierOrder.map(t => {
        const count = tierCount[t];
        const pct = totalGifters ? Math.round(count/totalGifters*100) : 0;
        return `<div style="margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
            <span style="color:${TIER_COLORS[t]};font-weight:700">${TIER_NAMES[t]}</span>
            <span style="color:var(--w60)">${count} (${pct}%)</span>
          </div>
          <div style="background:rgba(255,255,255,.06);border-radius:4px;height:8px;overflow:hidden">
            <div style="height:100%;width:${pct}%;background:${TIER_COLORS[t]};border-radius:4px;transition:width .4s"></div>
          </div>
        </div>`;
      }).join('');
      dist.innerHTML = bars || '<div style="color:var(--w60)">No gifter data</div>';
    }

    // Top 10
    const topEl = document.getElementById('gifterTopList');
    if (topEl) {
      const medals = ['🥇','🥈','🥉'];
      topEl.innerHTML = stats.slice(0,10).map((g,i) => {
        const tier = getTierForCoins(g.totalCoinsSpent||0);
        const level = getLevel(g.totalCoinsSpent||0);
        const name = (users[g.email]?.first||g.email.split('@')[0]);
        return `<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05)">
          <div style="font-size:16px;width:24px">${medals[i]||'#'+(i+1)}</div>
          <div style="flex:1">
            <div style="font-size:12px;font-weight:700">${esc(name)}</div>
            <div style="font-size:10px;color:${TIER_COLORS[tier]}">${TIER_NAMES[tier]} · Lv.${level}</div>
          </div>
          <div style="font-size:11px;font-weight:800;color:var(--gold)">🪙${(g.totalCoinsSpent||0).toLocaleString()}</div>
        </div>`;
      }).join('') || '<div style="color:var(--w60);padding:16px">No gifters yet</div>';
    }

    window.v92FilterGifters();
  };

  window.v92FilterGifters = function() {
    const q = (document.getElementById('gifterSearch')?.value||'').toLowerCase();
    const tierFilter = document.getElementById('gifterTierFilter')?.value || '';
    let stats = getAllGifterStats();
    if (q) stats = stats.filter(g => g.email.toLowerCase().includes(q));
    if (tierFilter) stats = stats.filter(g => getTierForCoins(g.totalCoinsSpent||0) === tierFilter);

    const body = document.getElementById('giftersBody');
    if (!body) return;
    const users = getAccts();
    body.innerHTML = stats.slice(0,100).map((g,i) => {
      const tier = getTierForCoins(g.totalCoinsSpent||0);
      const level = getLevel(g.totalCoinsSpent||0);
      const user = users[g.email];
      const name = user ? esc(user.first+' '+(user.last||'')) : esc(g.email.split('@')[0]);
      const streak = g.streakDays||0;
      return `<tr>
        <td style="font-size:12px;font-weight:700">#${i+1}</td>
        <td style="font-size:12px">${name}<br><small style="color:var(--w60)">${esc(g.email)}</small></td>
        <td><strong style="color:var(--gold)">Lv.${level}</strong></td>
        <td><span class="v92-gifter-badge" style="background:${TIER_COLORS[tier]}18;color:${TIER_COLORS[tier]};border:1px solid ${TIER_COLORS[tier]}30">${TIER_NAMES[tier]}</span></td>
        <td style="color:#D4AF37;font-weight:700">🪙${(g.totalCoinsSpent||0).toLocaleString()}</td>
        <td>${(g.totalGifts||0).toLocaleString()}</td>
        <td>${streak >= 7 ? `<span style="color:#ff9800">🔥${streak}d</span>` : streak > 0 ? `${streak}d` : '—'}</td>
        <td style="white-space:nowrap;display:flex;gap:4px">
          <button class="v92-mini-btn v92-mini-btn-gold" onclick="v92GrantCoinsModal('${esc(g.email)}')">🪙 Grant</button>
          <button class="v92-mini-btn v92-mini-btn-blue" onclick="v92ResetGifterXP('${esc(g.email)}')">↺</button>
        </td>
      </tr>`;
    }).join('') || `<tr><td colspan="8" style="text-align:center;color:var(--w60);padding:20px">No gifters found</td></tr>`;
  };

  window.v92ExportGiftersCSV = function() {
    const stats = getAllGifterStats();
    const users = getAccts();
    const rows = [['Rank','Email','Name','Level','Tier','Coins Spent','Gifts Sent','Streak Days']];
    stats.forEach((g,i) => {
      const user = users[g.email];
      const level = getLevel(g.totalCoinsSpent||0);
      const tier = getTierForCoins(g.totalCoinsSpent||0);
      rows.push([i+1, g.email, user?(user.first+' '+(user.last||'')):'', level, TIER_NAMES[tier],
        g.totalCoinsSpent||0, g.totalGifts||0, g.streakDays||0]);
    });
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'afrib_gifters_'+new Date().toISOString().slice(0,10)+'.csv'; a.click();
  };

  window.v92ResetGifterXP = function(email) {
    if (!confirm(`Reset gifter XP for ${email}?`)) return;
    localStorage.removeItem('afrib_gift_stats_'+email);
    localStorage.removeItem('afrib_gift_streak_'+email);
    localStorage.removeItem('afrib_gift_daily_'+email);
    toast('✅ Gifter XP reset for '+email);
    log('admin', 'Reset gifter XP', email);
    window.v92FilterGifters();
  };

  /* ── Grant Coins Modal (used in multiple places) ── */
  window.v92GrantCoinsModal = function(email) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:3000;display:flex;align-items:center;justify-content:center';
    overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
    const current = getCoins(email);
    overlay.innerHTML = `
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:24px;max-width:360px;width:90%">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <h3 style="margin:0">🪙 Grant / Deduct Coins</h3>
          <button onclick="this.closest('[style*=fixed]').remove()" style="background:none;border:none;color:var(--w60);font-size:20px;cursor:pointer">✕</button>
        </div>
        <div style="font-size:12px;color:var(--w60);margin-bottom:14px">User: ${esc(email)}<br>Current balance: 🪙${current.toLocaleString()}</div>
        <div class="mf"><label>Amount (use negative to deduct)</label>
          <input type="number" id="v92CoinAmount" value="100" placeholder="e.g. 100 or -50"/></div>
        <div class="mf"><label>Reason</label>
          <input type="text" id="v92CoinReason" placeholder="e.g. Bonus, correction, penalty…"/></div>
        <div style="display:flex;gap:8px;margin-top:16px">
          <button onclick="v92DoGrantCoins('${esc(email)}')" class="btn btn-gold" style="flex:1">✅ Apply</button>
          <button onclick="this.closest('[style*=fixed]').remove()" class="btn btn-ghost" style="flex:1">Cancel</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  };

  window.v92DoGrantCoins = function(email) {
    const amt = parseInt(document.getElementById('v92CoinAmount')?.value||'0');
    const reason = document.getElementById('v92CoinReason')?.value || 'Admin adjustment';
    if (!amt) { toast('⚠️ Enter an amount'); return; }
    const current = getCoins(email);
    const newBal = Math.max(0, current + amt);
    setCoins(email, newBal);
    toast(`✅ ${amt > 0 ? 'Granted' : 'Deducted'} 🪙${Math.abs(amt)} ${amt>0?'to':'from'} ${email}`);
    log('finance', `${amt>0?'Granted':'Deducted'} ${Math.abs(amt)} coins ${amt>0?'to':'from'} ${email}`, reason);
    document.querySelector('[style*=fixed]')?.remove();
  };

  /* ═══════════════════════════════════════════════════════
     §7  NOTIFICATIONS ADMIN PANEL
  ═══════════════════════════════════════════════════════ */
  window.v92InitNotifs = function() {
    const users = getUsers();
    // Count all notifications across users
    let totalNotifs = 0, readNotifs = 0;
    users.forEach(u => {
      const notifs = u.notifications || [];
      totalNotifs += notifs.length;
      readNotifs += notifs.filter(n => n.read).length;
    });
    const notifHistory = tp('afrib_sys_notifs', []);

    const el = document.getElementById('notifsStats');
    if (el) el.innerHTML = [
      statCard('📣', totalNotifs, 'Total Notifications'),
      statCard('👁', readNotifs, 'Read Notifications', '#22c55e'),
      statCard('📭', totalNotifs - readNotifs, 'Unread'),
      statCard('📤', notifHistory.length, 'System Broadcasts Sent', '#D4AF37'),
    ].join('');

    // Type breakdown
    const breakdown = {};
    users.forEach(u => (u.notifications||[]).forEach(n => { breakdown[n.type||'info'] = (breakdown[n.type||'info']||0)+1; }));
    const bkEl = document.getElementById('notifBreakdown');
    if (bkEl) {
      const max = Math.max(1, ...Object.values(breakdown));
      bkEl.innerHTML = Object.entries(breakdown).sort((a,b)=>b[1]-a[1]).map(([t,n]) => `
        <div style="margin-bottom:8px">
          <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px">
            <span>${t}</span><span style="color:var(--gold)">${n}</span>
          </div>
          <div class="prog-bar"><div class="prog-fill" style="width:${Math.round(n/max*100)}%"></div></div>
        </div>`).join('') || '<div style="color:var(--w60)">No notifications yet</div>';
    }

    // History table
    const histBody = document.getElementById('notifHistBody');
    if (histBody) {
      histBody.innerHTML = notifHistory.slice(0,30).map(n => `<tr>
        <td style="font-size:11px">${fmtDate(n.sentAt)}</td>
        <td style="font-size:18px">${n.icon||'📣'}</td>
        <td style="font-size:12px;font-weight:700">${esc(n.title)}</td>
        <td style="font-size:11px;color:var(--w60);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(n.msg)}</td>
        <td><span class="v92-chip v92-chip-active">${esc(n.target)}</span></td>
        <td style="color:var(--gold);font-weight:700">${n.sentTo||0} users</td>
      </tr>`).join('') || `<tr><td colspan="6" style="text-align:center;color:var(--w60);padding:16px">No system notifications sent</td></tr>`;
    }
  };

  window.v92SendSystemNotif = function() {
    const title = document.getElementById('sysNotifTitle')?.value.trim();
    const msg = document.getElementById('sysNotifMsg')?.value.trim();
    const icon = document.getElementById('sysNotifIcon')?.value || '📣';
    const target = document.getElementById('sysNotifTarget')?.value || 'all';
    if (!title || !msg) { toast('⚠️ Fill in title and message'); return; }

    const accts = getAccts();
    const gifterStats = getAllGifterStats();
    const gifterEmails = new Set(gifterStats.map(g => g.email));

    let targets = Object.values(accts);
    if (target === 'active') {
      const cutoff = Date.now() - 7*24*3600000;
      targets = targets.filter(u => u.lastLogin && new Date(u.lastLogin).getTime() > cutoff);
    } else if (target === 'gifters') {
      targets = targets.filter(u => gifterEmails.has(u.email));
    } else if (target === 'noGift') {
      targets = targets.filter(u => !gifterEmails.has(u.email));
    } else if (target === 'dating') {
      const datingProfiles = tp('afrib_dating_profiles', {});
      targets = targets.filter(u => datingProfiles[u.email]);
    }

    // Push notification to each user
    let count = 0;
    targets.forEach(u => {
      if (!u.email) return;
      const acct = accts[u.email];
      if (!acct) return;
      if (!acct.notifications) acct.notifications = [];
      acct.notifications.unshift({ type:'system', icon, title, body:msg, time:new Date().toISOString(), read:false });
      if (acct.notifications.length > 50) acct.notifications.length = 50;
      accts[u.email] = acct;
      count++;
    });

    sp('afrib_accounts', accts);

    // Log it
    const history = tp('afrib_sys_notifs', []);
    history.unshift({ icon, title, msg, target, sentTo: count, sentAt: new Date().toISOString() });
    if (history.length > 100) history.length = 100;
    sp('afrib_sys_notifs', history);

    toast(`✅ Notification sent to ${count} users`);
    log('broadcast', `System notification sent to ${count} users`, title);
    window.v92InitNotifs();

    // Clear form
    if (document.getElementById('sysNotifTitle')) document.getElementById('sysNotifTitle').value = '';
    if (document.getElementById('sysNotifMsg')) document.getElementById('sysNotifMsg').value = '';
  };

  /* ═══════════════════════════════════════════════════════
     §8  ENHANCE ANALYTICS PANEL
  ═══════════════════════════════════════════════════════ */
  function enhanceAnalytics() {
    const orig = window.initAnalytics;
    if (!orig || orig._v92) return;
    window.initAnalytics = function() {
      orig.apply(this, arguments);
      _addAnalyticsExtras();
    };
    window.initAnalytics._v92 = true;
  }

  function _addAnalyticsExtras() {
    let el = document.getElementById('v92AnalyticsExtra');
    if (!el) {
      el = document.createElement('div');
      el.id = 'v92AnalyticsExtra';
      document.getElementById('p-analytics')?.appendChild(el);
    }
    const gifterStats = getAllGifterStats();
    const matches = getLiveMatches();
    const posts = getPosts();
    const postsWithSound = posts.filter(p=>p.sound);

    el.innerHTML = `
      <div class="v92-dash-section">
        <div class="v92-dash-title">🎁 Gifter Economy Analytics</div>
        <div class="stat-row">
          ${statCard('🏅', gifterStats.length, 'Total Gifters')}
          ${statCard('🪙', gifterStats.reduce((s,g)=>s+(g.totalCoinsSpent||0),0).toLocaleString(), 'Total Coins Gifted', '#D4AF37')}
          ${statCard('🎵', postsWithSound.length, 'Posts With Sounds')}
          ${statCard('🥊', matches.length, 'Total Matches Played')}
          ${statCard('🔥', gifterStats.filter(g=>(g.streakDays||0)>=7).length, 'Active Streak Gifters')}
        </div>
      </div>
      <div class="v92-dash-section">
        <div class="v92-dash-title">📊 Gifter Tier Distribution</div>
        <div class="v92-level-bar">
          ${['basic','active','power','elite','legendary','god'].map(t => {
            const count = gifterStats.filter(g=>getTierForCoins(g.totalCoinsSpent||0)===t).length;
            const pct = gifterStats.length ? (count/gifterStats.length)*100 : 0;
            return `<div class="v92-level-seg" style="flex:${pct||1};background:${TIER_COLORS[t]}" title="${TIER_NAMES[t]}: ${count}"></div>`;
          }).join('')}
        </div>
        <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
          ${['basic','active','power','elite','legendary','god'].map(t => {
            const count = gifterStats.filter(g=>getTierForCoins(g.totalCoinsSpent||0)===t).length;
            return `<div style="font-size:10px"><span style="color:${TIER_COLORS[t]}">●</span> ${TIER_NAMES[t]}: ${count}</div>`;
          }).join('')}
        </div>
      </div>
    `;
  }

  /* ═══════════════════════════════════════════════════════
     §9  ENHANCE USERS PANEL — grant coins button
  ═══════════════════════════════════════════════════════ */
  function enhanceUsersTable() {
    const orig = window.renderUsersTable;
    if (!orig || orig._v92) return;
    window.renderUsersTable = function(users) {
      orig.apply(this, arguments);
      // Inject "🪙 Coins" column into table after render
      const rows = document.querySelectorAll('#usersBody tr');
      rows.forEach(row => {
        if (row.querySelector('.v92-coins-cell')) return;
        const email = row.querySelector('button[onclick*="openEditUser"]')?.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
        if (!email) return;
        const coins = getCoins(email);
        const td = document.createElement('td');
        td.className = 'v92-coins-cell';
        td.style.cssText = 'white-space:nowrap';
        td.innerHTML = `<span style="color:#D4AF37;font-size:11px">🪙${coins.toLocaleString()}</span>
          <button class="v92-mini-btn v92-mini-btn-gold" style="margin-left:4px" onclick="v92GrantCoinsModal('${esc(email)}')">+</button>`;
        // Insert before last cell (actions)
        const lastCell = row.querySelector('td:last-child');
        if (lastCell) row.insertBefore(td, lastCell);
      });

      // Inject gifter level badges
      rows.forEach(row => {
        const email = row.querySelector('button[onclick*="openEditUser"]')?.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
        if (!email) return;
        const gStats = getGifterStats(email);
        if (!gStats.totalCoinsSpent) return;
        const tier = getTierForCoins(gStats.totalCoinsSpent);
        const level = getLevel(gStats.totalCoinsSpent);
        const nameCell = row.querySelector('td:first-child');
        if (nameCell && !nameCell.querySelector('.v92-gifter-badge')) {
          const badge = document.createElement('span');
          badge.className = 'v92-gifter-badge';
          badge.style.cssText = `background:${TIER_COLORS[tier]}18;color:${TIER_COLORS[tier]};border:1px solid ${TIER_COLORS[tier]}30;margin-left:4px`;
          badge.textContent = `Lv.${level}`;
          nameCell.appendChild(badge);
        }
      });
    };
    window.renderUsersTable._v92 = true;
  }

  /* ═══════════════════════════════════════════════════════
     §10  ENHANCE WALLETS PANEL
  ═══════════════════════════════════════════════════════ */
  function enhanceWalletsPanel() {
    const orig = window.initWallets;
    if (!orig || orig._v92) return;
    window.initWallets = function() {
      orig.apply(this, arguments);
      _addWalletExtras();
    };
    window.initWallets._v92 = true;
  }

  function _addWalletExtras() {
    let extra = document.getElementById('v92WalletExtra');
    if (!extra) {
      extra = document.createElement('div');
      extra.id = 'v92WalletExtra';
      extra.style.marginTop = '20px';
      document.getElementById('p-wallets')?.appendChild(extra);
    }
    const gifterStats = getAllGifterStats();
    const topCoins = [...getUsers()].map(u => ({ email:u.email, name:u.first+' '+(u.last||''), coins:getCoins(u.email) }))
      .sort((a,b) => b.coins-a.coins).slice(0,10);
    const totalCoinsInCirculation = topCoins.reduce((s,u) => s+u.coins, 0) + [...getUsers()].slice(topCoins.length).reduce((s,u) => s+getCoins(u.email), 0);

    extra.innerHTML = `
      <div class="v92-dash-section">
        <div class="v92-dash-title">🪙 Coin Economy</div>
        <div class="stat-row">
          ${statCard('🪙', totalCoinsInCirculation.toLocaleString(), 'Coins in Circulation', '#D4AF37')}
          ${statCard('🎁', gifterStats.reduce((s,g)=>s+(g.totalCoinsSpent||0),0).toLocaleString(), 'Coins Gifted (all-time)', '#ff9800')}
          ${statCard('👤', topCoins[0] ? esc(topCoins[0].name) : '—', 'Richest User (coins)')}
        </div>
        <div class="sec-label" style="margin-top:16px">Top 10 Coin Holders</div>
        <div class="tbl-wrap"><table class="data-tbl">
          <thead><tr><th>Rank</th><th>User</th><th>Coin Balance</th><th>Gifted Total</th><th>Actions</th></tr></thead>
          <tbody>${topCoins.map((u,i) => {
            const gifted = (getGifterStats(u.email).totalCoinsSpent||0);
            return `<tr>
              <td>${['🥇','🥈','🥉'][i]||'#'+(i+1)}</td>
              <td style="font-size:12px">${esc(u.name)}<br><small style="color:var(--w60)">${esc(u.email)}</small></td>
              <td style="color:#D4AF37;font-weight:700">🪙${u.coins.toLocaleString()}</td>
              <td style="color:#ff9800">${gifted ? '🎁 '+gifted.toLocaleString() : '—'}</td>
              <td>
                <button class="v92-mini-btn v92-mini-btn-gold" onclick="v92GrantCoinsModal('${esc(u.email)}')">🪙 Adjust</button>
              </td>
            </tr>`;
          }).join('')}</tbody>
        </table></div>
      </div>
    `;
  }

  /* ═══════════════════════════════════════════════════════
     §11  ENHANCE SETTINGS PANEL — v91 Live Match settings
  ═══════════════════════════════════════════════════════ */
  function enhanceSettingsPanel() {
    const orig = window.initSettings;
    if (!orig || orig._v92) return;
    window.initSettings = function() {
      orig.apply(this, arguments);
      _injectSettingsExtras();
    };
    window.initSettings._v92 = true;
  }

  function _injectSettingsExtras() {
    const panel = document.getElementById('p-settings');
    if (!panel || panel.dataset.v92settings) return;
    panel.dataset.v92settings = '1';

    const grid = panel.querySelector('[style*="grid-template-columns:repeat"]') || panel.querySelector('.chart-card')?.parentElement;
    if (!grid) return;

    const extra = document.createElement('div');
    extra.innerHTML = `
      <!-- Post Sound Library Settings -->
      <div class="chart-card">
        <div class="chart-title">🎵 Post Sound Settings</div>
        <div class="mf">
          <label>Allow original recordings</label>
          <label class="toggle-sw"><input type="checkbox" id="soundAllowRecording" checked onchange="v92SaveSoundSettings()"/><span class="ts-sl"></span></label>
        </div>
        <div class="mf"><label>Max recording length (seconds)</label><input type="number" id="soundMaxLength" value="60" min="5" max="300"/></div>
        <div class="mf"><label>Max sound size (MB)</label><input type="number" id="soundMaxMB" value="5" min="1" max="50"/></div>
        <button class="btn btn-gold" onclick="v92SaveSoundSettings()" style="width:100%">💾 Save Sound Settings</button>
      </div>

      <!-- Live Match Settings -->
      <div class="chart-card">
        <div class="chart-title">🥊 Live Match Settings</div>
        <div class="mf"><label>Max match duration (minutes)</label><input type="number" id="matchMaxDuration" value="15" min="1" max="60"/></div>
        <div class="mf"><label>Max participants per match</label><input type="number" id="matchMaxParticipants" value="4" min="2" max="8"/></div>
        <div class="mf">
          <label>Allow open-join matches</label>
          <label class="toggle-sw"><input type="checkbox" id="matchAllowOpen" checked onchange="v92SaveMatchSettings()"/><span class="ts-sl"></span></label>
        </div>
        <div class="mf"><label>Minimum coins to start match</label><input type="number" id="matchMinCoins" value="0" min="0" max="1000"/></div>
        <button class="btn btn-gold" onclick="v92SaveMatchSettings()" style="width:100%">💾 Save Match Settings</button>
        <div id="matchSettingsStatus" style="font-size:11px;color:var(--w60);margin-top:8px"></div>
      </div>

      <!-- Gifter Level Settings -->
      <div class="chart-card">
        <div class="chart-title">🏅 Gifter Level Economy</div>
        <div class="mf"><label>XP multiplier for 3-day streak</label><input type="number" id="xpStreak3" value="1.25" min="1" max="5" step="0.05"/></div>
        <div class="mf"><label>XP multiplier for 7-day streak</label><input type="number" id="xpStreak7" value="2.0" min="1" max="10" step="0.1"/></div>
        <div class="mf"><label>Daily first-gift XP bonus (%)</label><input type="number" id="xpDailyBonus" value="50" min="0" max="200"/></div>
        <button class="btn btn-gold" onclick="v92SaveXPSettings()" style="width:100%">💾 Save XP Settings</button>
        <button class="btn btn-ghost" onclick="v92ResetAllXP()" style="width:100%;margin-top:8px;color:var(--red);border-color:rgba(239,68,68,.3)">⚠️ Reset All Gifter XP</button>
      </div>
    `;
    grid.appendChild(extra);
    _loadV92Settings();
  }

  function _loadV92Settings() {
    const s = tp('afrib_v92_settings', {});
    if (s.soundAllowRecording !== undefined && document.getElementById('soundAllowRecording'))
      document.getElementById('soundAllowRecording').checked = s.soundAllowRecording;
    if (s.soundMaxLength && document.getElementById('soundMaxLength'))
      document.getElementById('soundMaxLength').value = s.soundMaxLength;
    if (s.matchMaxDuration && document.getElementById('matchMaxDuration'))
      document.getElementById('matchMaxDuration').value = s.matchMaxDuration;
    if (s.xpStreak3 && document.getElementById('xpStreak3'))
      document.getElementById('xpStreak3').value = s.xpStreak3;
    if (s.xpStreak7 && document.getElementById('xpStreak7'))
      document.getElementById('xpStreak7').value = s.xpStreak7;
  }

  window.v92SaveSoundSettings = function() {
    const s = tp('afrib_v92_settings', {});
    s.soundAllowRecording = document.getElementById('soundAllowRecording')?.checked ?? true;
    s.soundMaxLength = parseInt(document.getElementById('soundMaxLength')?.value||'60');
    s.soundMaxMB = parseInt(document.getElementById('soundMaxMB')?.value||'5');
    sp('afrib_v92_settings', s);
    toast('✅ Sound settings saved');
    log('admin', 'Saved sound settings');
  };

  window.v92SaveMatchSettings = function() {
    const s = tp('afrib_v92_settings', {});
    s.matchMaxDuration = parseInt(document.getElementById('matchMaxDuration')?.value||'15');
    s.matchMaxParticipants = parseInt(document.getElementById('matchMaxParticipants')?.value||'4');
    s.matchAllowOpen = document.getElementById('matchAllowOpen')?.checked ?? true;
    s.matchMinCoins = parseInt(document.getElementById('matchMinCoins')?.value||'0');
    sp('afrib_v92_settings', s);
    const el = document.getElementById('matchSettingsStatus');
    if (el) el.textContent = '✅ Saved at ' + new Date().toLocaleTimeString();
    toast('✅ Match settings saved');
    log('admin', 'Saved match settings');
  };

  window.v92SaveXPSettings = function() {
    const s = tp('afrib_v92_settings', {});
    s.xpStreak3 = parseFloat(document.getElementById('xpStreak3')?.value||'1.25');
    s.xpStreak7 = parseFloat(document.getElementById('xpStreak7')?.value||'2.0');
    s.xpDailyBonus = parseInt(document.getElementById('xpDailyBonus')?.value||'50');
    sp('afrib_v92_settings', s);
    toast('✅ XP settings saved');
    log('admin', 'Saved gifter XP settings');
  };

  window.v92ResetAllXP = function() {
    if (!confirm('⚠️ This will reset ALL gifter XP, levels, and streaks. Are you absolutely sure?')) return;
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('afrib_gift_stats_') || k.startsWith('afrib_gift_streak_') || k.startsWith('afrib_gift_daily_')))
        localStorage.removeItem(k);
    }
    toast('✅ All gifter XP reset');
    log('admin', 'DANGER: Reset all gifter XP platform-wide');
  };

  /* ═══════════════════════════════════════════════════════
     §12  ENHANCE BROADCAST PANEL
  ═══════════════════════════════════════════════════════ */
  function enhanceBroadcast() {
    const grid = document.querySelector('#p-broadcast [style*="grid-template-columns"]');
    if (!grid || grid.dataset.v92) return;
    grid.dataset.v92 = '1';

    // Add gifter-targeted segment option
    const audience = document.getElementById('bcastAudience');
    if (audience) {
      const opts = [
        ['gifters_basic', '🏅 Basic Gifters (Lv.1-10)'],
        ['gifters_power', '⚡ Power Gifters (Lv.21-30)'],
        ['gifters_elite', '💎 Elite Gifters (Lv.31+)'],
        ['streak7', '🔥 7-Day Streak Users'],
      ];
      opts.forEach(([val, label]) => {
        const opt = document.createElement('option');
        opt.value = val; opt.textContent = label;
        audience.appendChild(opt);
      });
    }

    // Add schedule card
    const schedCard = document.createElement('div');
    schedCard.className = 'chart-card';
    schedCard.innerHTML = `
      <div class="chart-title">⏰ Schedule Broadcast</div>
      <p style="font-size:12px;color:var(--w60);margin-bottom:14px">Schedule a message to go out at a specific time</p>
      <div class="mf"><label>Message</label><textarea id="schedMsg" rows="2" placeholder="Scheduled message…"></textarea></div>
      <div class="mf"><label>Send at</label><input type="datetime-local" id="schedTime"/></div>
      <div class="mf"><label>Target</label>
        <select id="schedTarget"><option value="all">All Users</option><option value="active">Active Users</option></select>
      </div>
      <button class="btn btn-gold" onclick="v92ScheduleBroadcast()" style="width:100%">⏰ Schedule</button>
      <div id="schedList" style="margin-top:12px"></div>
    `;
    grid.appendChild(schedCard);
    v92RenderScheduled();
  }

  window.v92ScheduleBroadcast = function() {
    const msg = document.getElementById('schedMsg')?.value.trim();
    const time = document.getElementById('schedTime')?.value;
    const target = document.getElementById('schedTarget')?.value || 'all';
    if (!msg || !time) { toast('⚠️ Fill in message and time'); return; }
    const scheduled = tp('afrib_scheduled_broadcasts', []);
    scheduled.push({ id: Date.now(), msg, time, target, status:'pending' });
    sp('afrib_scheduled_broadcasts', scheduled);
    toast('⏰ Broadcast scheduled');
    log('broadcast', 'Scheduled broadcast', time);
    v92RenderScheduled();
  };

  function v92RenderScheduled() {
    const el = document.getElementById('schedList');
    if (!el) return;
    const scheduled = tp('afrib_scheduled_broadcasts', []);
    el.innerHTML = scheduled.slice(0,5).map((s,i) => `
      <div style="padding:8px;background:var(--bg3);border-radius:8px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center">
        <div style="font-size:11px">
          <div style="font-weight:700">${esc(s.msg.slice(0,40))}</div>
          <div style="color:var(--w60)">${fmtDate(s.time)} · ${s.target}</div>
        </div>
        <button class="v92-mini-btn v92-mini-btn-red" onclick="v92DeleteScheduled(${i})">✕</button>
      </div>`).join('') || '<div style="color:var(--w60);font-size:12px">No scheduled broadcasts</div>';
  }

  window.v92DeleteScheduled = function(idx) {
    const s = tp('afrib_scheduled_broadcasts', []);
    s.splice(idx, 1);
    sp('afrib_scheduled_broadcasts', s);
    v92RenderScheduled();
  };

  /* ═══════════════════════════════════════════════════════
     §13  ENHANCE ACTIVITY LOG — date range filter
  ═══════════════════════════════════════════════════════ */
  function enhanceActivityLog() {
    const panel = document.getElementById('p-activity');
    if (!panel || panel.dataset.v92) return;
    panel.dataset.v92 = '1';

    const searchRow = panel.querySelector('.search-row');
    if (searchRow) {
      searchRow.innerHTML += `
        <input class="s-inp" type="date" id="logDateFrom" onchange="filterLog()" style="width:130px" title="From date"/>
        <input class="s-inp" type="date" id="logDateTo" onchange="filterLog()" style="width:130px" title="To date"/>
        <button class="btn btn-ghost" onclick="v92ClearDateFilter()">× Clear Dates</button>
      `;
    }

    // Patch filterLog to support date range
    const orig = window.filterLog;
    if (orig && !orig._v92) {
      window.filterLog = function() {
        orig.apply(this, arguments);
        const from = document.getElementById('logDateFrom')?.value;
        const to = document.getElementById('logDateTo')?.value;
        if (!from && !to) return;
        const body = document.getElementById('logBody');
        if (!body) return;
        const rows = [...body.querySelectorAll('tr')];
        rows.forEach(row => {
          const timeCell = row.querySelector('td:first-child');
          if (!timeCell) return;
          try {
            const rowDate = new Date(timeCell.textContent).toISOString().slice(0,10);
            const show = (!from || rowDate >= from) && (!to || rowDate <= to);
            row.style.display = show ? '' : 'none';
          } catch(_) {}
        });
      };
      window.filterLog._v92 = true;
    }
  }

  window.v92ClearDateFilter = function() {
    const f = document.getElementById('logDateFrom');
    const t = document.getElementById('logDateTo');
    if (f) f.value = '';
    if (t) t.value = '';
    if (typeof filterLog === 'function') filterLog();
  };

  /* ═══════════════════════════════════════════════════════
     §14  INIT
  ═══════════════════════════════════════════════════════ */
  function init() {
    injectNewTabs();
    patchGoPanel();
    enhanceDashboard();
    enhanceFeedPanel();
    enhanceAnalytics();
    enhanceUsersTable();
    enhanceWalletsPanel();
    enhanceSettingsPanel();
    enhanceBroadcast();
    enhanceActivityLog();

    // Refresh dashboard extras if already loaded
    if (document.getElementById('p-dashboard')?.classList.contains('active')) {
      setTimeout(_addDashboardExtras, 200);
    }

    console.info('%c✅ AfribConnect Admin v92 — Full upgrade loaded', 'color:#D4AF37;font-weight:bold');
  }

  if (document.readyState !== 'loading') {
    setTimeout(init, 800);
  } else {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 800));
  }

})();
