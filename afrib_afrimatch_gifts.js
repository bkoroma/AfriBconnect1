/*!
 * AfribConnect v93 — Admin Algorithm Controls
 * Injects into admin.html + superadmin.html
 *
 * ADMIN FEATURES:
 *  • Algorithm weight sliders (tune like/comment/share/save weights)
 *  • Post Boost — manually boost any post in the feed
 *  • Post Suppress — hide from algorithm (not delete)
 *  • XP Events — create bonus XP windows
 *  • Quest Editor — customize weekly quests
 *  • Trending Dashboard — live trending posts/topics/creators
 *  • Engagement Analytics — per-post watch time, saves, shares
 *
 * SUPER ADMIN FEATURES:
 *  • Global algorithm toggle (on/off)
 *  • Algorithm preset profiles (Engagement-heavy, Recency-heavy, Balanced)
 *  • Feed diversity slider
 *  • Viral threshold setting
 *  • Mystery box reward editor
 *  • View all quest progress across users
 */

(function AdminV93Algorithm() {
  'use strict';
  if (window.__adminV93) return;
  window.__adminV93 = true;

  const isAdmin = !!document.getElementById('p-dashboard');
  const isSA    = !!document.getElementById('sp-revenue');
  if (!isAdmin && !isSA) return;

  /* ═══════════════════════════════════════
     HELPERS
  ═══════════════════════════════════════ */
  function tp(k, fb) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch(_) { return fb; } }
  function sp(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch(_) {} }
  function toast(msg) { if (typeof showToastA === 'function') showToastA(msg); else if (typeof toastSa === 'function') toastSa(msg); }
  function log(a, d) { if (typeof appendLog === 'function') { const admin = tp('admin_session',{}).user || 'admin'; appendLog('admin', admin, a, d||''); } }

  function getPosts() { return tp('afrib_style_posts', []); }
  function getPostEng(postId) { return (tp('afrib_eng_v93', {})[postId]) || { views:0, qualifiedViews:0, likes:0, comments:0, shares:0, saves:0, totalWatchMs:0 }; }
  function getAlgoWeights() { return tp('afrib_algo_weights', { like:1, comment:2, share:3, save:4, watchMs:0.001, qualView:2, recencyHalf:12, newCreatorBoost:1.5, affinityBoost:1.8, viralThreshold:0.15 }); }
  function getPostLikes(id) { return tp('afrib_style_likes_'+id, []); }
  function getPostComments(id) { return tp('afrib_style_comments_'+id, []); }

  /* ═══════════════════════════════════════
     ADMIN PANEL INJECTION
  ═══════════════════════════════════════ */
  if (isAdmin) initAdmin();
  if (isSA)    initSA();

  /* ─────────────────────────────────────
     ADMIN
  ───────────────────────────────────── */
  function initAdmin() {
    // Inject new tab
    const nav = document.querySelector('.adm-tabs');
    if (!nav || nav.dataset.v93algo) return;
    nav.dataset.v93algo = '1';

    const settingsBtn = [...(nav.querySelectorAll('.adm-tab')||[])].find(b => b.textContent.includes('Settings'));
    const btn = document.createElement('button');
    btn.className = 'adm-tab';
    btn.style.background = 'rgba(124,58,237,.08)';
    btn.style.borderColor = 'rgba(124,58,237,.2)';
    btn.textContent = '🧠 Algorithm';
    btn.onclick = () => { if (typeof goPanel === 'function') goPanel(btn, 'algorithm'); };
    if (settingsBtn) nav.insertBefore(btn, settingsBtn);
    else nav.appendChild(btn);

    // Inject panel HTML
    _injectAlgoPanel();

    // Patch goPanel
    const origGoPanel = window.goPanel;
    if (origGoPanel && !origGoPanel._v93algo) {
      window.goPanel = function(b, name) {
        origGoPanel.apply(this, arguments);
        if (name === 'algorithm') setTimeout(_renderAlgoPanel, 100);
        // Also enhance the feed panel with algo controls
        if (name === 'feed') setTimeout(_enhanceFeedWithAlgoControls, 200);
      };
      window.goPanel._v93algo = true;
    }
  }

  function _injectAlgoPanel() {
    const main = document.querySelector('.adm-content') || document.querySelector('main');
    if (!main || document.getElementById('p-algorithm')) return;

    const wrap = document.createElement('div');
    wrap.innerHTML = `
    <div class="panel" id="p-algorithm">
      <div class="panel-title">🧠 Algorithm Control</div>
      <div class="panel-sub">Tune the feed algorithm, boost posts, create XP events, and manage quests</div>

      <!-- ALGORITHM WEIGHTS -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
        <div class="chart-card">
          <div class="chart-title">⚖️ Engagement Signal Weights</div>
          <p style="font-size:12px;color:var(--w60);margin-bottom:14px">Higher weight = signal matters more. Research: saves (4) > shares (3) > comments (2) > likes (1)</p>
          <div id="algoWeightSliders"></div>
          <div style="display:flex;gap:8px;margin-top:14px">
            <button class="btn btn-gold" onclick="saveAlgoWeights()" style="flex:1">💾 Save Weights</button>
            <button class="btn btn-ghost" onclick="resetAlgoWeights()" style="flex:0 0 auto">↺ Reset</button>
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-title">⚡ Algorithm Presets</div>
          <p style="font-size:12px;color:var(--w60);margin-bottom:14px">Apply research-backed presets instantly</p>
          <div style="display:flex;flex-direction:column;gap:8px">
            <button class="btn btn-gold" onclick="applyAlgoPreset('engagement')" style="width:100%">💎 Engagement-Heavy (TikTok-style)</button>
            <button class="btn btn-ghost" onclick="applyAlgoPreset('balanced')" style="width:100%">⚖️ Balanced (Instagram-style)</button>
            <button class="btn btn-ghost" onclick="applyAlgoPreset('recency')" style="width:100%">🕐 Recency-Heavy (Twitter-style)</button>
            <button class="btn btn-ghost" onclick="applyAlgoPreset('viral')" style="width:100%">🔥 Viral-Boost Mode</button>
          </div>
          <div style="margin-top:14px;padding:10px;background:rgba(255,255,255,.04);border-radius:8px;font-size:11px;color:var(--w60)">
            Active preset: <span id="currentPreset" style="color:var(--gold)">Custom</span>
          </div>
        </div>
      </div>

      <!-- TRENDING DASHBOARD -->
      <div class="chart-card" style="margin-bottom:16px">
        <div class="chart-title">🔥 Trending Right Now</div>
        <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">
          <button class="btn btn-ghost" onclick="renderTrendingAdmin()">🔄 Refresh</button>
          <button class="btn btn-ghost" onclick="exportTrendingCSV()" style="color:var(--gold)">📥 Export</button>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">
          <div>
            <div style="font-size:11px;font-weight:700;color:rgba(255,255,255,.5);margin-bottom:8px;text-transform:uppercase">🔥 Trending Posts</div>
            <div id="trendingPostsList"></div>
          </div>
          <div>
            <div style="font-size:11px;font-weight:700;color:rgba(255,255,255,.5);margin-bottom:8px;text-transform:uppercase">📈 Trending Topics</div>
            <div id="trendingTopicsList"></div>
          </div>
          <div>
            <div style="font-size:11px;font-weight:700;color:rgba(255,255,255,.5);margin-bottom:8px;text-transform:uppercase">👑 Trending Creators</div>
            <div id="trendingCreatorsList"></div>
          </div>
        </div>
      </div>

      <!-- POST BOOST / SUPPRESS -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
        <div class="chart-card">
          <div class="chart-title">🚀 Post Boost</div>
          <p style="font-size:12px;color:var(--w60);margin-bottom:12px">Manually boost a post's feed score. It will appear higher for all users.</p>
          <div class="mf"><label>Post ID or Search</label>
            <input id="boostPostSearch" placeholder="Post ID or search caption…" oninput="searchPostsForBoost(this.value)" style="width:100%"/>
          </div>
          <div id="boostSearchResults" style="max-height:120px;overflow-y:auto;margin-bottom:10px"></div>
          <div class="mf"><label>Boost Multiplier</label>
            <select id="boostMultiplier">
              <option value="2">2× — Minor boost</option>
              <option value="5">5× — Strong boost</option>
              <option value="10">10× — Featured post</option>
              <option value="50">50× — Top of every feed</option>
            </select>
          </div>
          <button class="btn btn-gold" onclick="applyPostBoost()" style="width:100%">🚀 Apply Boost</button>
          <div style="margin-top:10px;font-size:12px;color:var(--w60)">Active boosts: <span id="activeBoostCount">0</span></div>
          <div id="activeBoostsList" style="margin-top:8px"></div>
        </div>

        <div class="chart-card">
          <div class="chart-title">🚫 Post Suppression</div>
          <p style="font-size:12px;color:var(--w60);margin-bottom:12px">Hide posts from the algorithm (doesn't delete them). Good for borderline content.</p>
          <div class="mf"><label>Search Post to Suppress</label>
            <input id="suppressSearch" placeholder="Post ID or caption…" oninput="searchPostsForSuppress(this.value)" style="width:100%"/>
          </div>
          <div id="suppressSearchResults" style="max-height:120px;overflow-y:auto;margin-bottom:10px"></div>
          <button class="btn btn-red" onclick="applySuppression()" id="suppressBtn" disabled style="width:100%">🚫 Suppress Post</button>
          <div style="margin-top:10px">
            <div style="font-size:11px;font-weight:700;color:rgba(255,255,255,.5);margin-bottom:6px;text-transform:uppercase">Suppressed Posts</div>
            <div id="suppressedList"></div>
          </div>
        </div>
      </div>

      <!-- XP EVENTS -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
        <div class="chart-card">
          <div class="chart-title">⚡ XP Events</div>
          <p style="font-size:12px;color:var(--w60);margin-bottom:12px">Create bonus XP windows to spike engagement</p>
          <div class="mf"><label>Event Name</label><input id="xpEventName" placeholder="e.g. Weekend Double XP"/></div>
          <div class="mf"><label>XP Multiplier</label>
            <select id="xpEventMult">
              <option value="1.5">1.5× — Small boost</option>
              <option value="2">2× — Double XP 🔥</option>
              <option value="3">3× — Triple XP ⚡</option>
              <option value="5">5× — MEGA XP 🚀</option>
            </select>
          </div>
          <div class="mf"><label>Duration (hours)</label><input type="number" id="xpEventHours" value="24" min="1" max="168"/></div>
          <button class="btn btn-gold" onclick="createXPEvent()" style="width:100%">⚡ Activate XP Event</button>
          <div id="xpEventStatus" style="margin-top:10px;font-size:12px;color:var(--w60)"></div>
        </div>
        <div class="chart-card">
          <div class="chart-title">🎯 Quest Editor</div>
          <p style="font-size:12px;color:var(--w60);margin-bottom:12px">Customize weekly quests. Changes apply to new week.</p>
          <div id="questEditorList" style="max-height:200px;overflow-y:auto;margin-bottom:10px"></div>
          <button class="btn btn-ghost" onclick="addCustomQuest()" style="width:100%;margin-bottom:6px">+ Add Quest</button>
          <button class="btn btn-gold" onclick="saveCustomQuests()" style="width:100%">💾 Save Quests</button>
          <button class="btn btn-ghost" onclick="resetCustomQuests()" style="width:100%;margin-top:6px;color:var(--red)">↺ Reset to Defaults</button>
        </div>
      </div>

      <!-- ENGAGEMENT ANALYTICS -->
      <div class="chart-card">
        <div class="chart-title">📊 Post Engagement Analytics</div>
        <div class="search-row">
          <input class="s-inp" id="engSearch" placeholder="🔍 Search by caption or author…" oninput="filterEngTable()"/>
          <select class="s-sel" id="engSort" onchange="filterEngTable()">
            <option value="views">Sort: Views</option>
            <option value="qviews">Sort: Qualified Views</option>
            <option value="saves">Sort: Saves</option>
            <option value="shares">Sort: Shares</option>
            <option value="watchtime">Sort: Watch Time</option>
          </select>
          <button class="btn btn-ghost" onclick="exportEngCSV()">📥 Export CSV</button>
        </div>
        <div class="tbl-wrap"><table class="data-tbl">
          <thead><tr><th>Post</th><th>Author</th><th>👁 Views</th><th>✅ Qual.Views</th><th>❤️ Likes</th><th>💬 Comments</th><th>🔗 Shares</th><th>🔖 Saves</th><th>⏱ Avg Watch</th><th>Algorithm Score</th><th>Actions</th></tr></thead>
          <tbody id="engTableBody"></tbody>
        </table></div>
      </div>
    </div>
    `;
    main.appendChild(wrap);
  }

  function _renderAlgoPanel() {
    _renderWeightSliders();
    renderTrendingAdmin();
    _renderBoostsList();
    _renderSuppressedList();
    _renderQuestEditor();
    filterEngTable();
    _updateXPEventStatus();
  }

  function _renderWeightSliders() {
    const el = document.getElementById('algoWeightSliders');
    if (!el) return;
    const w = getAlgoWeights();
    const fields = [
      { key:'like',          label:'Like weight',          min:0.5, max:5,   step:0.5, unit:'' },
      { key:'comment',       label:'Comment weight',       min:1,   max:10,  step:0.5, unit:'' },
      { key:'share',         label:'Share weight',         min:1,   max:10,  step:0.5, unit:'' },
      { key:'save',          label:'Save weight',          min:1,   max:15,  step:0.5, unit:'' },
      { key:'qualView',      label:'Qualified view weight',min:0.5, max:5,   step:0.5, unit:'' },
      { key:'recencyHalf',   label:'Recency half-life',    min:1,   max:168, step:1,   unit:'h' },
      { key:'newCreatorBoost',label:'New creator boost',   min:1,   max:5,   step:0.1, unit:'×' },
      { key:'affinityBoost', label:'User affinity boost',  min:0,   max:5,   step:0.1, unit:'×' },
    ];
    el.innerHTML = fields.map(f => `
      <div style="margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
          <span style="color:var(--w60)">${f.label}</span>
          <span style="color:var(--gold);font-weight:700" id="slider_val_${f.key}">${(w[f.key]||0)}${f.unit}</span>
        </div>
        <input type="range" min="${f.min}" max="${f.max}" step="${f.step}" value="${w[f.key]||0}"
          style="width:100%;accent-color:var(--gold)"
          oninput="document.getElementById('slider_val_${f.key}').textContent=this.value+'${f.unit}'"
          id="slider_${f.key}"/>
      </div>
    `).join('');
  }

  window.saveAlgoWeights = function() {
    const keys = ['like','comment','share','save','qualView','recencyHalf','newCreatorBoost','affinityBoost'];
    const weights = getAlgoWeights();
    keys.forEach(k => {
      const el = document.getElementById('slider_'+k);
      if (el) weights[k] = parseFloat(el.value);
    });
    sp('afrib_algo_weights', weights);
    document.getElementById('currentPreset').textContent = 'Custom';
    toast('✅ Algorithm weights saved — feed will update');
    log('Algorithm weights saved');
    if (typeof v93SetAlgoWeight === 'function') {
      keys.forEach(k => v93SetAlgoWeight(k, weights[k]));
    }
  };

  window.resetAlgoWeights = function() {
    localStorage.removeItem('afrib_algo_weights');
    _renderWeightSliders();
    toast('✅ Weights reset to defaults');
  };

  window.applyAlgoPreset = function(preset) {
    const presets = {
      engagement: { like:1, comment:2.5, share:4, save:6, qualView:3, recencyHalf:24, newCreatorBoost:1.5, affinityBoost:2 },
      balanced:   { like:1, comment:2,   share:3, save:4, qualView:2, recencyHalf:12, newCreatorBoost:1.5, affinityBoost:1.8 },
      recency:    { like:0.5, comment:1, share:1.5, save:2, qualView:1, recencyHalf:3, newCreatorBoost:2, affinityBoost:1 },
      viral:      { like:1, comment:3, share:6, save:8, qualView:4, recencyHalf:48, newCreatorBoost:3, affinityBoost:2.5, viralThreshold:0.08 },
    };
    const names = { engagement:'TikTok-style', balanced:'Instagram-style', recency:'Twitter-style', viral:'Viral-Boost Mode' };
    const w = presets[preset];
    if (!w) return;
    sp('afrib_algo_weights', w);
    document.getElementById('currentPreset').textContent = names[preset] || preset;
    _renderWeightSliders();
    toast(`✅ Preset applied: ${names[preset]}`);
    log(`Algorithm preset applied: ${preset}`);
  };

  /* Trending panel */
  window.renderTrendingAdmin = function() {
    const posts = getPosts();
    const engData = tp('afrib_eng_v93', {});
    const weights = getAlgoWeights();

    // Trending posts (velocity)
    const scored = posts.map(p => {
      const ageH = p.createdAt ? Math.max(0.5, (Date.now()-new Date(p.createdAt).getTime())/3600000) : 1;
      const eng = engData[p.id] || {};
      const likes = getPostLikes(p.id).length;
      const comments = getPostComments(p.id).length;
      const totalEng = likes*weights.like + comments*weights.comment + (eng.shares||0)*weights.share + (eng.saves||0)*weights.save;
      return { post:p, velocity: totalEng / Math.sqrt(ageH) };
    }).sort((a,b) => b.velocity - a.velocity).slice(0,5);

    const postsEl = document.getElementById('trendingPostsList');
    if (postsEl) postsEl.innerHTML = scored.map((s,i) => `
      <div style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,.05);display:flex;align-items:center;gap:8px">
        <span style="font-size:13px">${['🥇','🥈','🥉','4.','5.'][i]}</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:11px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${s.post.caption?.slice(0,35)||'—'}</div>
          <div style="font-size:10px;color:var(--w60)">${s.post.authorFirst||''} · vel:${s.velocity.toFixed(1)}</div>
        </div>
        <button style="background:rgba(212,175,55,.1);border:1px solid rgba(212,175,55,.3);color:var(--gold);border-radius:6px;padding:2px 6px;font-size:9px;cursor:pointer"
          onclick="boostPostById('${s.post.id}')">🚀 Boost</button>
      </div>`).join('') || '<div style="color:var(--w60);font-size:12px">No posts yet</div>';

    // Trending topics
    const topicCount = {};
    const recent = posts.filter(p => p.createdAt && (Date.now()-new Date(p.createdAt).getTime()) < 72*3600000);
    recent.forEach(p => {
      const cat = p.category||'general'; topicCount[cat]=(topicCount[cat]||0)+1;
      (p.tags||'').split(/[\s,]+/).filter(t=>t).forEach(t=>{topicCount[t]=(topicCount[t]||0)+1;});
    });
    const topics = Object.entries(topicCount).sort((a,b)=>b[1]-a[1]).slice(0,6);
    const topicsEl = document.getElementById('trendingTopicsList');
    if (topicsEl) topicsEl.innerHTML = topics.map(([t,n]) => `
      <div style="padding:5px 0;border-bottom:1px solid rgba(255,255,255,.05);display:flex;justify-content:space-between;font-size:12px">
        <span>${t}</span><span style="color:var(--gold)">${n} posts</span>
      </div>`).join('') || '<div style="color:var(--w60);font-size:12px">No topics yet</div>';

    // Trending creators
    const creatorEng = {};
    posts.forEach(p => {
      const e = p.authorEmail; if(!e) return;
      creatorEng[e]=creatorEng[e]||{n:(p.authorFirst||'?'),eng:0};
      creatorEng[e].eng += getPostLikes(p.id).length + getPostComments(p.id).length*2;
    });
    const creatorsEl = document.getElementById('trendingCreatorsList');
    if (creatorsEl) creatorsEl.innerHTML = Object.entries(creatorEng).sort((a,b)=>b[1].eng-a[1].eng).slice(0,5).map(([email,data],i)=>`
      <div style="padding:5px 0;border-bottom:1px solid rgba(255,255,255,.05);display:flex;justify-content:space-between;font-size:12px">
        <span>${['🥇','🥈','🥉','4.','5.'][i]} ${data.n}</span><span style="color:var(--gold)">❤️ ${data.eng}</span>
      </div>`).join('') || '<div style="color:var(--w60);font-size:12px">No creators</div>';
  };

  window.exportTrendingCSV = function() {
    const posts = getPosts();
    const engData = tp('afrib_eng_v93', {});
    const rows = [['Post ID','Caption','Author','Views','QualViews','Likes','Comments','Shares','Saves','Watch MS']];
    posts.forEach(p => {
      const e = engData[p.id]||{};
      rows.push([p.id,(p.caption||'').replace(/,/g,''),p.authorEmail||'',e.views||0,e.qualifiedViews||0,
        getPostLikes(p.id).length, getPostComments(p.id).length, e.shares||0, e.saves||0, e.totalWatchMs||0]);
    });
    const a=document.createElement('a'); a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(rows.map(r=>r.join(',')).join('\n'));
    a.download='trending_'+new Date().toISOString().slice(0,10)+'.csv'; a.click();
  };

  /* Post boost */
  let _boostTargetPost = null;
  window.searchPostsForBoost = function(q) {
    if (!q) { document.getElementById('boostSearchResults').innerHTML=''; return; }
    const results = getPosts().filter(p => (p.caption||'').toLowerCase().includes(q.toLowerCase()) || p.id === q).slice(0,5);
    document.getElementById('boostSearchResults').innerHTML = results.map(p => `
      <div onclick="selectBoostPost('${p.id}')" style="padding:7px;background:rgba(255,255,255,.04);border-radius:6px;margin-bottom:4px;cursor:pointer;font-size:12px">
        <strong>${p.id.slice(-8)}</strong> — ${p.caption?.slice(0,50)||'No caption'} <span style="color:var(--w60)">(${p.authorFirst||'?'})</span>
      </div>`).join('');
  };
  window.selectBoostPost = function(id) {
    _boostTargetPost = id;
    document.getElementById('boostSearchResults').innerHTML = `<div style="padding:6px;background:rgba(212,175,55,.1);border-radius:6px;font-size:12px;color:var(--gold)">Selected: ${id.slice(-12)}</div>`;
  };
  window.applyPostBoost = function() {
    if (!_boostTargetPost) { toast('⚠️ Select a post first'); return; }
    const mult = parseFloat(document.getElementById('boostMultiplier').value||'2');
    const boosts = tp('afrib_admin_post_boosts',{});
    boosts[_boostTargetPost] = mult;
    sp('afrib_admin_post_boosts', boosts);
    toast(`✅ Post boosted ${mult}× in feed`);
    log(`Boosted post ${_boostTargetPost} × ${mult}`);
    _boostTargetPost = null;
    document.getElementById('boostSearchResults').innerHTML='';
    _renderBoostsList();
  };
  window.boostPostById = function(id) { _boostTargetPost = id; document.getElementById('boostMultiplier').value='5'; applyPostBoost(); };
  function _renderBoostsList() {
    const boosts = tp('afrib_admin_post_boosts',{});
    const el = document.getElementById('activeBoostsList');
    const count = document.getElementById('activeBoostCount');
    const entries = Object.entries(boosts);
    if (count) count.textContent = entries.length;
    if (!el) return;
    el.innerHTML = entries.slice(0,5).map(([id,mult]) => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:4px 0;font-size:11px;border-bottom:1px solid rgba(255,255,255,.04)">
        <span style="color:var(--w60)">${id.slice(-10)}</span>
        <span style="color:#D4AF37">×${mult}</span>
        <button onclick="removeBoost('${id}')" style="background:none;border:none;color:var(--red);cursor:pointer;font-size:11px">✕</button>
      </div>`).join('') || '<div style="color:var(--w60);font-size:11px">No active boosts</div>';
  }
  window.removeBoost = function(id) {
    const boosts = tp('afrib_admin_post_boosts',{}); delete boosts[id]; sp('afrib_admin_post_boosts',boosts);
    _renderBoostsList(); toast('Boost removed');
  };

  /* Suppress */
  let _suppressTargetPost = null;
  window.searchPostsForSuppress = function(q) {
    if (!q) { document.getElementById('suppressSearchResults').innerHTML=''; return; }
    const results = getPosts().filter(p => (p.caption||'').toLowerCase().includes(q.toLowerCase()) || p.id === q).slice(0,5);
    document.getElementById('suppressSearchResults').innerHTML = results.map(p => `
      <div onclick="selectSuppressPost('${p.id}')" style="padding:7px;background:rgba(255,255,255,.04);border-radius:6px;margin-bottom:4px;cursor:pointer;font-size:12px">
        <strong>${p.id.slice(-8)}</strong> — ${p.caption?.slice(0,50)||'No caption'}
      </div>`).join('');
  };
  window.selectSuppressPost = function(id) {
    _suppressTargetPost = id;
    document.getElementById('suppressBtn').disabled = false;
    document.getElementById('suppressSearchResults').innerHTML = `<div style="padding:6px;background:rgba(239,68,68,.1);border-radius:6px;font-size:12px;color:#ef4444">Selected: ${id.slice(-12)}</div>`;
  };
  window.applySuppression = function() {
    if (!_suppressTargetPost) return;
    const s = tp('afrib_admin_suppressed',[]); if (!s.includes(_suppressTargetPost)) s.push(_suppressTargetPost);
    sp('afrib_admin_suppressed',s); toast('✅ Post suppressed from algorithm'); log('Suppressed post', _suppressTargetPost);
    _suppressTargetPost = null; document.getElementById('suppressBtn').disabled = true;
    document.getElementById('suppressSearchResults').innerHTML=''; _renderSuppressedList();
  };
  function _renderSuppressedList() {
    const suppressed = tp('afrib_admin_suppressed',[]);
    const el = document.getElementById('suppressedList');
    if (!el) return;
    el.innerHTML = suppressed.slice(0,10).map(id => `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:3px 0;font-size:11px;border-bottom:1px solid rgba(255,255,255,.04)">
        <span style="color:var(--w60)">${id.slice(-12)}</span>
        <button onclick="unsuppressPost('${id}')" style="background:none;border:none;color:#22c55e;cursor:pointer;font-size:11px">↩ Restore</button>
      </div>`).join('') || '<div style="color:var(--w60);font-size:11px">None suppressed</div>';
  }
  window.unsuppressPost = function(id) {
    sp('afrib_admin_suppressed', tp('afrib_admin_suppressed',[]).filter(x=>x!==id));
    _renderSuppressedList(); toast('✅ Post restored to algorithm');
  };

  /* XP Events */
  window.createXPEvent = function() {
    const name = document.getElementById('xpEventName')?.value.trim();
    const mult = parseFloat(document.getElementById('xpEventMult')?.value||'2');
    const hours = parseInt(document.getElementById('xpEventHours')?.value||'24');
    if (!name) { toast('⚠️ Enter event name'); return; }
    const event = { active:true, name, multiplier:mult, start:new Date().toISOString(), end:new Date(Date.now()+hours*3600000).toISOString() };
    sp('afrib_bonus_event', event);
    toast(`✅ XP Event "${name}" activated (×${mult} for ${hours}h)`);
    log('XP Event created', name);
    _updateXPEventStatus();
  };
  function _updateXPEventStatus() {
    const ev = tp('afrib_bonus_event',null);
    const el = document.getElementById('xpEventStatus');
    if (!el) return;
    if (ev?.active && new Date() < new Date(ev.end)) {
      const left = Math.max(0, (new Date(ev.end)-new Date())/3600000);
      el.innerHTML = `<span style="color:#22c55e">🟢 Active: <strong>${ev.name}</strong> ×${ev.multiplier} · ${left.toFixed(1)}h left</span>
        <button onclick="endXPEvent()" style="margin-left:8px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);color:#ef4444;border-radius:6px;padding:2px 8px;font-size:10px;cursor:pointer">End</button>`;
    } else {
      el.innerHTML = '<span style="color:var(--w60)">No active XP event</span>';
    }
  }
  window.endXPEvent = function() { sp('afrib_bonus_event',{active:false}); _updateXPEventStatus(); toast('XP event ended'); };

  /* Quest editor */
  const DEFAULT_Q = [
    {id:'post1',title:'Post Something',desc:'Share 1 post',icon:'✨',xp:50,coins:5,target:1,action:'post'},
    {id:'like5',title:'Spread the Love',desc:'Like 5 posts',icon:'❤️',xp:30,coins:3,target:5,action:'like'},
    {id:'comment3',title:'Join the Convo',desc:'Comment on 3 posts',icon:'💬',xp:40,coins:4,target:3,action:'comment'},
    {id:'follow2',title:'Grow Network',desc:'Follow 2 creators',icon:'🤝',xp:30,coins:3,target:2,action:'follow'},
    {id:'gift1',title:'Send Love',desc:'Send 1 gift',icon:'🎁',xp:80,coins:10,target:1,action:'gift'},
    {id:'login3',title:'Stay Connected',desc:'Log in 3 days',icon:'🔥',xp:60,coins:8,target:3,action:'login'},
    {id:'share1',title:'Share the Vibe',desc:'Share 1 post',icon:'🔗',xp:40,coins:5,target:1,action:'share'},
  ];
  let _editQuests = null;
  function _renderQuestEditor() {
    _editQuests = JSON.parse(JSON.stringify(tp('afrib_custom_quests', DEFAULT_Q)));
    const el = document.getElementById('questEditorList');
    if (!el) return;
    el.innerHTML = _editQuests.map((q,i) => `
      <div style="display:flex;align-items:center;gap:6px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.05)">
        <span style="font-size:16px">${q.icon}</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:11px;font-weight:700">${q.title}</div>
          <div style="font-size:10px;color:var(--w60)">🎯 ${q.action} ×${q.target} · +${q.xp}XP · 🪙${q.coins}</div>
        </div>
        <button onclick="editQuest(${i})" style="background:rgba(99,102,241,.1);border:1px solid rgba(99,102,241,.2);color:#818cf8;border-radius:5px;padding:2px 6px;font-size:9px;cursor:pointer">Edit</button>
        <button onclick="removeQuest(${i})" style="background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);color:#ef4444;border-radius:5px;padding:2px 6px;font-size:9px;cursor:pointer">✕</button>
      </div>`).join('');
  }
  window.editQuest = function(i) {
    const q = _editQuests[i];
    const newTitle = prompt(`Quest title (currently: ${q.title}):`, q.title);
    if (newTitle) { _editQuests[i].title = newTitle; _renderQuestEditor(); }
  };
  window.removeQuest = function(i) { _editQuests.splice(i,1); _renderQuestEditor(); };
  window.addCustomQuest = function() {
    _editQuests = _editQuests || [];
    _editQuests.push({id:'custom_'+Date.now(),title:'New Quest',desc:'Complete the quest',icon:'🎯',xp:50,coins:5,target:1,action:'post'});
    _renderQuestEditor();
  };
  window.saveCustomQuests = function() {
    sp('afrib_custom_quests', _editQuests);
    toast('✅ Custom quests saved'); log('Custom quests updated');
  };
  window.resetCustomQuests = function() {
    localStorage.removeItem('afrib_custom_quests');
    _editQuests = JSON.parse(JSON.stringify(DEFAULT_Q));
    _renderQuestEditor(); toast('✅ Quests reset to defaults');
  };

  /* Engagement table */
  window.filterEngTable = function() {
    const q = (document.getElementById('engSearch')?.value||'').toLowerCase();
    const sort = document.getElementById('engSort')?.value || 'views';
    const engData = tp('afrib_eng_v93',{});
    const boosts = tp('afrib_admin_post_boosts',{});
    const w = getAlgoWeights();
    let posts = getPosts();
    if (q) posts = posts.filter(p => (p.caption||'').toLowerCase().includes(q) || (p.authorFirst||'').toLowerCase().includes(q));
    posts.sort((a,b) => {
      const ea = engData[a.id]||{}, eb = engData[b.id]||{};
      if (sort==='views') return (eb.views||0)-(ea.views||0);
      if (sort==='qviews') return (eb.qualifiedViews||0)-(ea.qualifiedViews||0);
      if (sort==='saves') return (eb.saves||0)-(ea.saves||0);
      if (sort==='shares') return (eb.shares||0)-(ea.shares||0);
      if (sort==='watchtime') return (eb.totalWatchMs||0)-(ea.totalWatchMs||0);
      return 0;
    });
    const body = document.getElementById('engTableBody');
    if (!body) return;
    body.innerHTML = posts.slice(0,100).map(p => {
      const e = engData[p.id]||{};
      const likes = getPostLikes(p.id).length;
      const comments = getPostComments(p.id).length;
      const ageH = p.createdAt ? Math.max(0.5,(Date.now()-new Date(p.createdAt).getTime())/3600000) : 1;
      const engScore = likes*w.like + comments*w.comment + (e.shares||0)*w.share + (e.saves||0)*w.save;
      const algoScore = Math.round(engScore * Math.pow(0.5, ageH/w.recencyHalf));
      const avgWatch = e.qualifiedViews > 0 ? Math.round((e.totalWatchMs||0)/e.qualifiedViews/1000) : 0;
      const isBooted = !!boosts[p.id];
      const isSuppressed = tp('afrib_admin_suppressed',[]).includes(p.id);
      return `<tr style="${isSuppressed?'opacity:.4':''}">
        <td style="font-size:11px;max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
          ${p.imageData?`<img src="${p.imageData}" style="width:28px;height:28px;border-radius:4px;vertical-align:middle;margin-right:4px">`:'📷 '}
          ${p.caption?.slice(0,35)||'—'}
        </td>
        <td style="font-size:11px;color:var(--w60)">${p.authorFirst||'?'}</td>
        <td>${e.views||0}</td>
        <td style="color:#22c55e">${e.qualifiedViews||0}</td>
        <td style="color:#ef4444">❤️ ${likes}</td>
        <td style="color:var(--w60)">💬 ${comments}</td>
        <td style="color:#818cf8">🔗 ${e.shares||0}</td>
        <td style="color:#D4AF37">🔖 ${e.saves||0}</td>
        <td style="font-size:11px">${avgWatch}s avg</td>
        <td style="color:${algoScore>100?'#22c55e':algoScore>20?'#D4AF37':'var(--w60)'};font-weight:700">
          ${algoScore}${isBooted?` ×${boosts[p.id]}🚀`:''}${isSuppressed?' 🚫':''}
        </td>
        <td style="white-space:nowrap;display:flex;gap:3px">
          <button onclick="boostPostById('${p.id}')" style="background:rgba(212,175,55,.1);border:1px solid rgba(212,175,55,.2);color:#D4AF37;border-radius:5px;padding:2px 6px;font-size:9px;cursor:pointer">🚀</button>
          <button onclick="${isSuppressed?`unsuppressPost('${p.id}')`:`selectSuppressPost('${p.id}');applySuppression()`}" 
            style="background:${isSuppressed?'rgba(34,197,94,.1)':'rgba(239,68,68,.1)'};border:1px solid ${isSuppressed?'rgba(34,197,94,.2)':'rgba(239,68,68,.2)'};color:${isSuppressed?'#22c55e':'#ef4444'};border-radius:5px;padding:2px 6px;font-size:9px;cursor:pointer">
            ${isSuppressed?'↩':'🚫'}</button>
        </td>
      </tr>`;
    }).join('') || '<tr><td colspan="11" style="text-align:center;color:var(--w60);padding:16px">No posts</td></tr>';
  };

  window.exportEngCSV = function() {
    const e = tp('afrib_eng_v93',{});
    const rows = [['Post ID','Author','Caption','Views','QualViews','Likes','Comments','Shares','Saves','AvgWatchS']];
    getPosts().forEach(p => {
      const eng = e[p.id]||{};
      rows.push([p.id,p.authorEmail||'',p.caption?.replace(/,/g,'').slice(0,50)||'',
        eng.views||0,eng.qualifiedViews||0,getPostLikes(p.id).length,getPostComments(p.id).length,
        eng.shares||0,eng.saves||0,eng.qualifiedViews>0?Math.round((eng.totalWatchMs||0)/eng.qualifiedViews/1000):0]);
    });
    const a=document.createElement('a'); a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(rows.map(r=>r.join(',')).join('\n'));
    a.download='engagement_'+new Date().toISOString().slice(0,10)+'.csv'; a.click();
  };

  /* ─────────────────────────────────────
     SUPER ADMIN
  ───────────────────────────────────── */
  function initSA() {
    const nav = document.querySelector('.sa-nav') || document.querySelector('nav');
    if (!nav || nav.dataset.v93sa) return;
    nav.dataset.v93sa = '1';

    const backupBtn = [...(nav.querySelectorAll('.sa-tab')||[])].find(b => b.textContent.includes('Backup'));
    const btn = document.createElement('button');
    btn.className = 'sa-tab';
    btn.textContent = '🧠 Algorithm';
    btn.onclick = () => { if (typeof saPanel === 'function') saPanel(btn, 'saalgopanel'); };
    if (backupBtn) nav.insertBefore(btn, backupBtn);
    else nav.appendChild(btn);

    // Panel HTML
    const main = document.querySelector('.sa-main');
    if (!main || document.getElementById('sp-saalgopanel')) return;
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div class="sa-panel" id="sp-saalgopanel">
        <div class="panel-header">
          <div class="panel-title">🧠 Algorithm Settings</div>
          <div class="panel-sub">Global algorithm controls, mystery box editor, engagement analytics</div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px">
          <div class="sa-form-card highlight">
            <h3>⚙️ Global Algorithm Toggle</h3>
            <div class="mf" style="display:flex;align-items:center;justify-content:space-between">
              <div>
                <div style="font-size:15px;font-weight:700">Smart Feed Algorithm</div>
                <div style="font-size:12px;color:rgba(255,255,255,.5)">TikTok-style personalized ranking</div>
              </div>
              <label class="toggle-sw"><input type="checkbox" id="sa-algoEnabled" checked onchange="saSaveAlgoSettings()"/><span class="ts-sl"></span></label>
            </div>
            <div class="mf" style="margin-top:12px">
              <label>Feed diversity (max % from one creator)</label>
              <input type="range" min="10" max="80" value="30" style="width:100%;accent-color:var(--gold)" id="sa-diversitySlider"
                oninput="document.getElementById('sa-diversityVal').textContent=this.value+'%'"/>
              <div style="display:flex;justify-content:space-between;font-size:11px;color:rgba(255,255,255,.3);margin-top:2px">
                <span>More diverse</span><span id="sa-diversityVal">30%</span><span>Single creator OK</span>
              </div>
            </div>
            <div class="mf">
              <label>Viral threshold (% engagement to trigger viral push)</label>
              <input type="range" min="5" max="50" value="15" style="width:100%;accent-color:var(--gold)" id="sa-viralSlider"
                oninput="document.getElementById('sa-viralVal').textContent=this.value+'%'"/>
              <div style="font-size:11px;color:rgba(255,255,255,.3);margin-top:2px;text-align:right" id="sa-viralVal">15%</div>
            </div>
            <button class="sa-btn-sm btn-gold" onclick="saSaveAlgoSettings()" style="width:100%">💾 Save Algorithm Settings</button>
          </div>

          <div class="sa-form-card">
            <h3>🎁 Mystery Box Editor</h3>
            <p style="font-size:12px;color:rgba(255,255,255,.5);margin-bottom:12px">Set the reward pool for mystery boxes. Cooldown: 6 hours.</p>
            <div class="mf"><label>Cooldown (hours)</label><input type="number" id="sa-mboxCooldown" value="6" min="1" max="168"/></div>
            <div style="margin-bottom:10px">
              <div style="font-size:11px;font-weight:700;color:rgba(255,255,255,.5);margin-bottom:6px;text-transform:uppercase">Reward Tiers</div>
              <div id="sa-mboxRewards"></div>
            </div>
            <button class="sa-btn-sm btn-gold" onclick="saSaveMysteryBox()" style="width:100%">💾 Save Mystery Box</button>
          </div>
        </div>

        <div class="sa-card">
          <div class="sa-card-title"><span>📊</span> Platform Engagement Overview</div>
          <div id="saAlgoEngStats" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;margin-top:10px"></div>
        </div>

        <div class="sa-card" style="margin-top:16px">
          <div class="sa-card-title"><span>🎯</span> Quest Completion Rates</div>
          <div id="saQuestStats"></div>
        </div>
      </div>
    `;
    main.appendChild(wrap);

    // Patch saPanel for new panel
    const origSaPanel = window.saPanel;
    if (origSaPanel && !origSaPanel._v93sa) {
      window.saPanel = function(b, name) {
        origSaPanel.apply(this, arguments);
        if (name === 'saalgopanel') setTimeout(_renderSAAlgoPanel, 100);
      };
      window.saPanel._v93sa = true;
    }
  }

  function _renderSAAlgoPanel() {
    const engData = tp('afrib_eng_v93',{});
    const posts = tp('afrib_style_posts',[]);
    const totalViews = Object.values(engData).reduce((s,e)=>s+(e.views||0),0);
    const totalQViews = Object.values(engData).reduce((s,e)=>s+(e.qualifiedViews||0),0);
    const totalSaves = Object.values(engData).reduce((s,e)=>s+(e.saves||0),0);
    const totalShares = Object.values(engData).reduce((s,e)=>s+(e.shares||0),0);
    const totalWatchMs = Object.values(engData).reduce((s,e)=>s+(e.totalWatchMs||0),0);

    const statsEl = document.getElementById('saAlgoEngStats');
    if (statsEl) statsEl.innerHTML = [
      ['👁', totalViews.toLocaleString(), 'Total Post Views'],
      ['✅', totalQViews.toLocaleString(), 'Qualified Views (3s+)'],
      ['🔖', totalSaves.toLocaleString(), 'Post Saves'],
      ['🔗', totalShares.toLocaleString(), 'Shares'],
      ['⏱', totalViews>0?Math.round(totalWatchMs/totalViews/1000)+'s avg':'—', 'Avg View Duration'],
      ['📊', posts.length, 'Total Posts in Feed'],
    ].map(([icon,val,label]) => `<div style="text-align:center;padding:14px;background:rgba(255,255,255,.04);border-radius:12px">
      <div style="font-size:22px">${icon}</div>
      <div style="font-size:18px;font-weight:900;color:#D4AF37;margin:4px 0">${val}</div>
      <div style="font-size:10px;color:rgba(255,255,255,.4)">${label}</div>
    </div>`).join('');

    // Quest stats
    const questEl = document.getElementById('saQuestStats');
    if (questEl) {
      const DEFAULT_Q = ['post1','like5','comment3','follow2','gift1','login3','share1'];
      const users = tp('afrib_accounts',{});
      const questCompletion = {};
      DEFAULT_Q.forEach(id => { questCompletion[id] = 0; });
      const weekKey = `week_${Math.floor(Date.now()/(7*24*3600000))}`;
      let totalUsers = 0;
      Object.keys(users).forEach(email => {
        const prog = tp(`afrib_quests_${email}_${weekKey}`, {});
        if (Object.keys(prog).length > 0) {
          totalUsers++;
          DEFAULT_Q.forEach(id => { if (prog[id]?.completed) questCompletion[id]++; });
        }
      });
      questEl.innerHTML = totalUsers === 0 ? '<div style="color:rgba(255,255,255,.3);font-size:13px">No quest data yet this week</div>' :
        DEFAULT_Q.map(id => {
          const pct = totalUsers ? Math.round((questCompletion[id]/totalUsers)*100) : 0;
          return `<div style="margin-bottom:10px">
            <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px">
              <span style="color:rgba(255,255,255,.7)">${id}</span>
              <span style="color:#D4AF37">${questCompletion[id]}/${totalUsers} (${pct}%)</span>
            </div>
            <div style="background:rgba(255,255,255,.06);border-radius:4px;height:6px;overflow:hidden">
              <div style="height:100%;width:${pct}%;background:#D4AF37;border-radius:4px"></div>
            </div>
          </div>`;
        }).join('');
    }

    // Mystery box rewards
    const mboxEl = document.getElementById('sa-mboxRewards');
    if (mboxEl) {
      mboxEl.innerHTML = `
        <div style="font-size:11px;color:rgba(255,255,255,.4);margin-bottom:8px">Default reward pool (editable in app JS)</div>
        ${[['🪙 +5 coins','30%'],['🪙 +10 coins','25%'],['🪙 +25 coins','15%'],['🪙 +50 coins','10%'],['⭐ +100 XP','12%'],['⭐ +250 XP','5%'],['🪙 +100 coins','2%'],['🏅 Mystery Badge','1%']].map(([r,c])=>`
          <div style="display:flex;justify-content:space-between;font-size:12px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.05)">
            <span>${r}</span><span style="color:rgba(255,255,255,.4)">${c}</span>
          </div>`).join('')}`;
    }
  }

  window.saSaveAlgoSettings = function() {
    const enabled = document.getElementById('sa-algoEnabled')?.checked ?? true;
    const diversity = parseInt(document.getElementById('sa-diversitySlider')?.value||'30');
    const viral = parseInt(document.getElementById('sa-viralSlider')?.value||'15');
    const s = tp('sa_v92_settings',{});
    s.algoEnabled = enabled;
    s.feedDiversity = diversity;
    s.viralThreshold = viral/100;
    sp('sa_v92_settings', s);
    // Also update live weights
    const w = tp('afrib_algo_weights',{});
    w.viralThreshold = viral/100;
    sp('afrib_algo_weights', w);
    if (typeof toastSa === 'function') toastSa('✅ Algorithm settings saved');
  };

  window.saSaveMysteryBox = function() {
    const cooldown = parseInt(document.getElementById('sa-mboxCooldown')?.value||'6');
    sp('sa_mbox_settings', { cooldownHours: cooldown });
    if (typeof toastSa === 'function') toastSa('✅ Mystery box settings saved');
  };

  /* ─────────────────────────────────────
     ENHANCE FEED PANEL WITH ALGO INDICATORS
  ───────────────────────────────────── */
  function _enhanceFeedWithAlgoControls() {
    const panel = document.getElementById('p-feed');
    if (!panel || panel.dataset.v93algo) return;
    panel.dataset.v93algo = '1';
    const statsEl = panel.querySelector('#feedStats');
    if (!statsEl) return;
    const engData = tp('afrib_eng_v93',{});
    const totalSaves = Object.values(engData).reduce((s,e)=>s+(e.saves||0),0);
    const totalViews = Object.values(engData).reduce((s,e)=>s+(e.views||0),0);
    const extra = document.createElement('div');
    extra.style.marginTop = '12px';
    extra.innerHTML = `
      <div style="display:flex;gap:10px;margin-bottom:8px;padding:10px 12px;background:rgba(124,58,237,.06);border:1px solid rgba(124,58,237,.2);border-radius:10px;flex-wrap:wrap">
        <span style="font-size:12px;color:#818cf8;font-weight:700">🧠 Algorithm Active</span>
        <span style="font-size:11px;color:rgba(255,255,255,.5)">👁 ${totalViews} views tracked</span>
        <span style="font-size:11px;color:rgba(255,255,255,.5)">🔖 ${totalSaves} saves recorded</span>
        <span style="font-size:11px;color:rgba(255,255,255,.5)">Boosts: ${Object.keys(tp('afrib_admin_post_boosts',{})).length}</span>
        <span style="font-size:11px;color:rgba(255,255,255,.5)">Suppressed: ${tp('afrib_admin_suppressed',[]).length}</span>
        <button onclick="if(typeof goPanel==='function')goPanel(document.querySelector('.adm-tab'),null);setTimeout(()=>{const b=[...document.querySelectorAll('.adm-tab')].find(b=>b.textContent.includes('Algorithm'));if(b)b.click()},100)"
          style="background:rgba(124,58,237,.15);border:1px solid rgba(124,58,237,.3);color:#818cf8;border-radius:7px;padding:2px 10px;font-size:10px;font-weight:700;cursor:pointer">
          ⚙️ Manage Algorithm
        </button>
      </div>`;
    statsEl.after(extra);
  }

})();
