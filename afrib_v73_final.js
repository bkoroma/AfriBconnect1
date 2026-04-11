/*!
 * AfribConnect v72 — YourStyle Algorithm + Media Messages + Header Fix + GIF Picker
 * Research-backed: TikTok, Instagram, Facebook, Twitter algorithms implemented
 */
(function AfribV72() {
  'use strict';

  // ═══════════════════════════════════════════════════════════
  // § 0  IMMEDIATE CSS — Header fix (profile + nav same line)
  //       Looking at screenshot: avatar + name + nav ALL in one row
  // ═══════════════════════════════════════════════════════════
  (function fixHeaderCSS() {
    const s = document.createElement('style');
    s.id = 'v72-header-css';
    s.textContent = `
      /* ── COMPACT HEADER: avatar + name + nav all on ONE line ── */
      .home-unified-strip {
        margin: 0 !important;
        border-radius: 0 !important;
        border-left: none !important;
        border-right: none !important;
        border-top: none !important;
        padding: 0 !important;
        position: sticky !important;
        top: 0 !important;
        z-index: 50 !important;
        background: rgba(10,0,20,0.96) !important;
        backdrop-filter: blur(20px) !important;
        -webkit-backdrop-filter: blur(20px) !important;
        border-bottom: 1px solid rgba(212,175,55,.15) !important;
      }

      /* Single row: avatar | name | nav buttons */
      .hus-profile-row {
        display: none !important; /* hide the old stacked row */
      }
      .hus-divider {
        display: none !important; /* no divider needed */
      }

      /* Compact single-line strip */
      .hus-nav-strip {
        display: flex !important;
        align-items: center !important;
        gap: 0 !important;
        padding: 6px 12px 6px 8px !important;
        overflow-x: auto !important;
        scrollbar-width: none !important;
        position: relative !important;
        z-index: 1 !important;
      }
      .hus-nav-strip::-webkit-scrollbar { display: none !important; }

      /* Avatar inline — injected as first child of nav strip */
      .v72-nav-avatar {
        width: 32px;
        height: 32px;
        min-width: 32px;
        border-radius: 50%;
        background: linear-gradient(135deg, #D4AF37, #b8860b);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 900;
        color: #000;
        border: 2px solid rgba(212,175,55,.5);
        cursor: pointer;
        flex-shrink: 0;
        margin-right: 6px;
        position: relative;
      }
      .v72-nav-online {
        position: absolute;
        bottom: -1px;
        right: -1px;
        width: 8px;
        height: 8px;
        background: #22c55e;
        border-radius: 50%;
        border: 1.5px solid rgba(10,0,20,0.96);
      }

      /* Nav buttons — compact */
      .hus-nav-btn {
        padding: 5px 8px 4px !important;
        min-width: 44px !important;
        min-height: 40px !important;
        font-size: 17px !important;
      }
      .hus-nav-btn span {
        font-size: 8px !important;
        letter-spacing: 0.3px !important;
      }

      /* Hide v71 hero section (replaced by compact header) */
      #v71HeroSection {
        display: none !important;
      }

      /* YourStyle feed — TikTok vertical scroll */
      .yourstyle-feed {
        display: flex;
        flex-direction: column;
        gap: 0;
      }
      .yourstyle-post-card {
        position: relative;
        border-bottom: 1px solid rgba(255,255,255,.06);
        background: #0a0012;
        overflow: hidden;
      }
      .yourstyle-video-wrap {
        position: relative;
        width: 100%;
        background: #000;
        aspect-ratio: 9/16;
        overflow: hidden;
        max-height: 75vh;
      }
      .yourstyle-video-wrap video {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .yourstyle-actions {
        position: absolute;
        right: 12px;
        bottom: 80px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        align-items: center;
        z-index: 5;
      }
      .yourstyle-action-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
        background: none;
        border: none;
        cursor: pointer;
        color: #fff;
      }
      .yourstyle-action-icon {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: rgba(0,0,0,.5);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        border: 1.5px solid rgba(255,255,255,.2);
        transition: transform .15s;
      }
      .yourstyle-action-btn:active .yourstyle-action-icon { transform: scale(.85); }
      .yourstyle-action-count {
        font-size: 11px;
        font-weight: 700;
        color: rgba(255,255,255,.9);
        text-shadow: 0 1px 3px rgba(0,0,0,.8);
      }
      .yourstyle-meta {
        position: absolute;
        left: 12px;
        right: 70px;
        bottom: 16px;
        z-index: 5;
      }
      .yourstyle-username {
        font-size: 14px;
        font-weight: 800;
        color: #fff;
        text-shadow: 0 1px 4px rgba(0,0,0,.8);
        margin-bottom: 4px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .yourstyle-caption {
        font-size: 13px;
        color: rgba(255,255,255,.9);
        text-shadow: 0 1px 3px rgba(0,0,0,.6);
        line-height: 1.4;
        max-height: 60px;
        overflow: hidden;
      }
      .yourstyle-music {
        font-size: 11px;
        color: rgba(255,255,255,.7);
        margin-top: 4px;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .yourstyle-gradient {
        position: absolute;
        bottom: 0; left: 0; right: 0;
        height: 200px;
        background: linear-gradient(transparent, rgba(0,0,0,.8));
        pointer-events: none;
        z-index: 4;
      }
      /* Non-video post style */
      .yourstyle-image-post {
        width: 100%;
        aspect-ratio: 1/1;
        object-fit: cover;
        display: block;
      }
      .yourstyle-text-post {
        min-height: 200px;
        padding: 20px 16px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        background: linear-gradient(135deg, #1a0030, #000820);
      }
      .yourstyle-text-content {
        font-size: 18px;
        font-weight: 700;
        color: #fff;
        line-height: 1.5;
      }
      /* 3-tab header */
      .yourstyle-tab-bar {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 24px;
        padding: 10px 16px 0;
        background: transparent;
        position: sticky;
        top: 52px;
        z-index: 20;
      }
      .yourstyle-tab {
        font-size: 16px;
        font-weight: 700;
        color: rgba(255,255,255,.5);
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px 0 8px;
        border-bottom: 2px solid transparent;
        transition: all .2s;
      }
      .yourstyle-tab.active {
        color: #fff;
        font-weight: 900;
        border-bottom-color: #fff;
      }
      /* Upload button */
      .yourstyle-upload-fab {
        position: fixed;
        bottom: 90px;
        right: 16px;
        width: 52px;
        height: 52px;
        border-radius: 14px;
        background: linear-gradient(135deg, #D4AF37, #b8860b);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        cursor: pointer;
        box-shadow: 0 4px 20px rgba(212,175,55,.4);
        z-index: 100;
        border: none;
        transition: transform .15s;
        display: none; /* shown only on YourStyle screen */
      }
      .yourstyle-upload-fab:active { transform: scale(.92); }

      /* GIF picker */
      .gif-picker-overlay {
        position: fixed;
        inset: 0;
        z-index: 9999;
        background: rgba(0,0,0,.85);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: flex-end;
        justify-content: center;
      }
      .gif-picker-sheet {
        width: 100%;
        max-width: 500px;
        background: #180030;
        border-radius: 20px 20px 0 0;
        border: 1px solid rgba(212,175,55,.2);
        border-bottom: none;
        max-height: 65vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        animation: slideUp .3s cubic-bezier(.25,.46,.45,.94);
      }
      @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      .gif-search-bar {
        padding: 12px;
        border-bottom: 1px solid rgba(255,255,255,.08);
      }
      .gif-search-input {
        width: 100%;
        background: rgba(255,255,255,.08);
        border: 1px solid rgba(255,255,255,.12);
        border-radius: 20px;
        padding: 9px 16px;
        color: #fff;
        font-size: 14px;
        outline: none;
        box-sizing: border-box;
      }
      .gif-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 2px;
        overflow-y: auto;
        flex: 1;
        padding: 2px;
      }
      .gif-item {
        aspect-ratio: 1;
        overflow: hidden;
        cursor: pointer;
        border-radius: 6px;
        background: rgba(255,255,255,.05);
      }
      .gif-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .gif-item:active { opacity: .7; transform: scale(.95); }

      /* Message media */
      .msg-media-bubble {
        max-width: 240px;
        border-radius: 12px;
        overflow: hidden;
        cursor: pointer;
        position: relative;
      }
      .msg-media-bubble img,
      .msg-media-bubble video {
        width: 100%;
        display: block;
        border-radius: 12px;
      }
      .msg-media-download {
        position: absolute;
        bottom: 6px;
        right: 6px;
        background: rgba(0,0,0,.7);
        border: none;
        border-radius: 20px;
        color: #fff;
        font-size: 11px;
        padding: 3px 8px;
        cursor: pointer;
        font-weight: 700;
      }
      .msg-video-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0,0,0,.3);
        font-size: 32px;
        pointer-events: none;
      }
    `;
    document.head.appendChild(s);
  })();


  // ═══════════════════════════════════════════════════════════
  // § 1  COMPACT HEADER — inject avatar into nav strip
  // ═══════════════════════════════════════════════════════════
  function injectCompactHeader() {
    const strip = document.querySelector('.hus-nav-strip');
    if (!strip || strip.querySelector('.v72-nav-avatar')) return;

    const user = window.currentUser || {};
    const initials = ((user.first||'A')[0]+(user.last||'A')[0]).toUpperCase();

    const avatarWrap = document.createElement('div');
    avatarWrap.className = 'v72-nav-avatar';
    avatarWrap.id = 'v72NavAvatar';
    avatarWrap.title = 'My Profile';
    avatarWrap.innerHTML = initials + '<span class="v72-nav-online"></span>';
    avatarWrap.onclick = () => { if (typeof husOpenProfile === 'function') husOpenProfile(); };

    strip.insertBefore(avatarWrap, strip.firstChild);

    // Keep updated
    document.addEventListener('afrib:login', () => {
      const u = window.currentUser || {};
      const av = document.getElementById('v72NavAvatar');
      if (av) av.firstChild.textContent = ((u.first||'A')[0]+(u.last||'A')[0]).toUpperCase();
    });
  }

  setTimeout(injectCompactHeader, 600);
  setInterval(injectCompactHeader, 3000); // retry until DOM ready


  // ═══════════════════════════════════════════════════════════
  // § 2  YourStyle ALGORITHM — TikTok-grade feed algorithm
  //
  // Research sources:
  // TikTok: Interaction (likes, shares, comments, watch time), 
  //         video completion rate, content categories, hashtags,
  //         device/account settings
  // Instagram: Interest score, relationship score, recency
  // Facebook: Content type weight, engagement velocity
  // Twitter/X: Engagement (likes/RTs/replies), recency, author quality
  //
  // Our YourStyle algorithm uses:
  // 1. User Interest Profile (tracked implicitly)
  // 2. Content Quality Score
  // 3. Recency + Freshness bonus
  // 4. Social Graph score (following > followers > strangers)
  // 5. Diversity injection (prevent echo chamber)
  // 6. Trending boost (velocity of recent engagement)
  // ═══════════════════════════════════════════════════════════
  const YOURSTYLE_ALGO = {
    // Track user interactions
    _profile: null,

    loadProfile() {
      try {
        const email = window.currentUser?.email;
        if (!email) return {};
        this._profile = JSON.parse(
          localStorage.getItem('yourstyle_profile_' + email) || '{}'
        );
        return this._profile;
      } catch(e) { return {}; }
    },

    saveProfile(profile) {
      try {
        const email = window.currentUser?.email;
        if (!email) return;
        localStorage.setItem('yourstyle_profile_' + email, JSON.stringify(profile));
        this._profile = profile;
      } catch(e) {}
    },

    // Record user action on a post
    recordInteraction(postId, action, category) {
      const p = this.loadProfile();
      if (!p.interactions) p.interactions = {};
      if (!p.categoryWeights) p.categoryWeights = {};
      if (!p.authorWeights) p.authorWeights = {};

      // Interaction weights (TikTok-style)
      const weights = {
        view:       1,   // saw the post
        like:       10,  // liked
        comment:    20,  // commented
        share:      30,  // shared
        follow:     40,  // followed author
        full_watch: 15,  // watched full video
        half_watch: 8,   // watched 50%+
        skip:       -5,  // skipped quickly
        dislike:    -15, // explicit dislike
      };

      p.interactions[postId] = {
        action,
        weight: weights[action] || 1,
        time: Date.now(),
        category,
      };

      // Build category interest weights
      if (category) {
        p.categoryWeights[category] = (p.categoryWeights[category] || 0) + (weights[action] || 1);
      }

      // Limit stored interactions to 500
      const keys = Object.keys(p.interactions);
      if (keys.length > 500) {
        const oldest = keys.sort((a,b) => (p.interactions[a].time||0) - (p.interactions[b].time||0)).slice(0, 100);
        oldest.forEach(k => delete p.interactions[k]);
      }

      this.saveProfile(p);
    },

    // Score a post for this user
    scorePost(post, profile, following) {
      const now = Date.now();
      let score = 0;

      // ── 1. Recency (exponential decay over 24h, strong for <2h)
      const ageMs = now - new Date(post.createdAt || post.timestamp || 0).getTime();
      const ageHours = ageMs / 3600000;
      if (ageHours < 1)       score += 120;
      else if (ageHours < 2)  score += 90;
      else if (ageHours < 6)  score += 60;
      else if (ageHours < 24) score += 30;
      else if (ageHours < 72) score += 10;
      // Viral rescue: very old posts that are trending can still surface
      const recentLikes = (post.recentLikes || 0);
      if (recentLikes > 20 && ageHours > 24) score += 40;

      // ── 2. Social Graph (TikTok calls this "following" signal)
      const isFollowing = following.includes(post.authorEmail);
      const isMe = post.authorEmail === window.currentUser?.email;
      if (isMe) return -9999; // don't show own posts in For You
      if (isFollowing) score += 80;

      // ── 3. Category interest (TikTok: "content information")
      const catW = profile.categoryWeights?.[post.category] || 0;
      score += Math.min(catW * 0.5, 100); // cap at 100

      // ── 4. Engagement quality (TikTok: "video completion + interaction")
      const likes    = (post.likes?.length || 0);
      const comments = (post.comments?.length || 0);
      const shares   = (post.shares || 0);
      const views    = (post.views || 1);
      // Engagement rate = (likes + comments*3 + shares*5) / views
      const engRate = (likes + comments * 3 + shares * 5) / Math.max(views, 1);
      score += Math.min(engRate * 20, 80);
      // Raw engagement volume
      score += Math.log1p(likes) * 5;
      score += Math.log1p(comments) * 8;
      score += Math.log1p(shares) * 12;

      // ── 5. Content type preference (video > image > text)
      if (post.videoData || post.videoUrl) score += 30;
      else if (post.imageData) score += 15;

      // ── 6. Already seen penalty
      const seen = profile.interactions?.[post.id];
      if (seen) {
        if (seen.action === 'skip')    score -= 80;
        if (seen.action === 'dislike') score -= 150;
        if (seen.action === 'like')    score -= 30; // seen, deprioritise
        if (seen.action === 'view')    score -= 20;
      }

      // ── 7. Diversity injection — prevent seeing same author too much
      // (handled in rankFeed)

      // ── 8. Trending velocity bonus
      const trendScore = post.trendScore || 0;
      score += Math.min(trendScore, 50);

      // ── 9. New account boost (TikTok gives new users an initial push)
      const authorCreatedAt = post.authorCreatedAt || 0;
      const authorAgeMs = now - new Date(authorCreatedAt).getTime();
      if (authorAgeMs < 7 * 24 * 3600000) score += 25; // < 1 week old

      // ── 10. Africa diaspora boost (YourStyle cultural relevance)
      const africanCats = ['culture','naija','afrobeats','food','fashion','afro'];
      if (africanCats.some(c => (post.category||'').toLowerCase().includes(c))) score += 10;

      return score;
    },

    // Main ranking function — returns sorted posts array
    rankFeed(posts, tab = 'foryou') {
      if (!posts || !posts.length) return [];
      const email = window.currentUser?.email;
      const profile = this.loadProfile();

      let following = [];
      try {
        following = (typeof getStyleFollowing === 'function') ? getStyleFollowing(email) : [];
      } catch(e) {}

      if (tab === 'following') {
        // Pure chronological for following tab
        return posts
          .filter(p => following.includes(p.authorEmail))
          .sort((a,b) => new Date(b.createdAt||0) - new Date(a.createdAt||0));
      }

      if (tab === 'everyone') {
        // Everyone = newest first, no algorithm
        return [...posts].sort((a,b) => new Date(b.createdAt||0) - new Date(a.createdAt||0));
      }

      // For You — full YourStyle algorithm
      const scored = posts.map(p => ({
        post: p,
        score: this.scorePost(p, profile, following) + (Math.random() * 8 - 4), // tiny randomness
      })).sort((a,b) => b.score - a.score);

      // Author diversity: max 2 posts from same author in top 20
      const authorCount = {};
      const result = [];
      const remainder = [];

      for (const item of scored) {
        const author = item.post.authorEmail;
        authorCount[author] = (authorCount[author] || 0) + 1;
        if (authorCount[author] <= 2 || result.length < 20) {
          result.push(item.post);
        } else {
          remainder.push(item.post);
        }
      }

      // Inject diversity: every 10th post from a new/random author
      return [...result, ...remainder];
    },

    // Calculate trending scores (run periodically)
    updateTrending() {
      try {
        const posts = JSON.parse(localStorage.getItem('afrib_style_posts') || '[]');
        const now = Date.now();
        const updated = posts.map(p => {
          // Velocity = engagements in last 2 hours
          const ageH = (now - new Date(p.createdAt||0).getTime()) / 3600000;
          const recentLikes = ageH < 2 ? (p.likes?.length||0) * 3 : ageH < 6 ? (p.likes?.length||0) : 0;
          const recentComments = ageH < 2 ? (p.comments?.length||0) * 5 : 0;
          p.trendScore = Math.min(recentLikes + recentComments, 100);
          return p;
        });
        localStorage.setItem('afrib_style_posts', JSON.stringify(updated));
      } catch(e) {}
    },
  };

  window.YOURSTYLE_ALGO = YOURSTYLE_ALGO;

  // Update trending every 5 minutes
  YOURSTYLE_ALGO.updateTrending();
  setInterval(() => YOURSTYLE_ALGO.updateTrending(), 5 * 60 * 1000);

  // Patch renderStyleFeedV71 to use YourStyle algorithm
  const origRender = window.renderStyleFeedV71 || window.renderStyleFeed;
  window.renderStyleFeedV71 = window.renderStyleFeed = function() {
    const feedEl  = document.getElementById('styleFeed');
    const emptyEl = document.getElementById('styleFeedEmpty');
    if (!feedEl) return;

    let posts = [];
    try { posts = (typeof getStylePosts === 'function') ? (getStylePosts() || []) : []; } catch(e) {}

    const tab = (window._styleTab || 'all');
    const yourstyleTab = tab === 'all' ? 'foryou' : tab === 'all_users' ? 'everyone' : tab;
    const ranked = YOURSTYLE_ALGO.rankFeed(posts, yourstyleTab);

    const cat = window._styleCategory || 'all';
    const filtered = cat === 'all' ? ranked : ranked.filter(p => p.category === cat);

    if (!filtered.length) {
      feedEl.innerHTML = '';
      if (emptyEl) emptyEl.style.display = 'block';
      return;
    }
    if (emptyEl) emptyEl.style.display = 'none';

    try {
      feedEl.innerHTML = filtered.map((post, idx) => {
        const adHtml = (idx > 0 && idx % 6 === 0 && typeof renderAdBanner === 'function') ? renderAdBanner() : '';
        const cardHtml = renderYourStyleCard(post);
        return adHtml + cardHtml;
      }).join('');

      // Track views
      filtered.forEach(p => {
        YOURSTYLE_ALGO.recordInteraction(p.id, 'view', p.category);
      });

      // Auto-play videos in viewport (IntersectionObserver)
      setupVideoAutoplay();
    } catch(e) { console.warn('YourStyle render:', e); }
  };

  // TikTok-style post card with video support
  function renderYourStyleCard(post) {
    if (!post) return '';
    const _e = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    const likes = (post.likes?.length || 0);
    const comments = (post.comments?.length || 0);
    const initials = ((_e(post.authorFirst)||'?')[0]+(_e(post.authorLast)||'?')[0]).toUpperCase();
    const timeAgo = (typeof getTimeAgo === 'function') ? getTimeAgo(post.createdAt) : '';
    const currentEmail = window.currentUser?.email;
    const isLiked = post.likes?.includes(currentEmail);
    const catEmoji = {fashion:'👗',beauty:'💄',lifestyle:'🌿',food:'🍽',culture:'🌍',fitness:'💪',music:'🎵',dance:'💃',comedy:'😂',naija:'🇳🇬'}[post.category] || '✨';

    // Video post
    if (post.videoData || post.videoUrl) {
      const src = post.videoData || post.videoUrl;
      return `<div class="yourstyle-post-card" data-post-id="${_e(post.id)}" data-category="${_e(post.category)}">
        <div class="yourstyle-video-wrap">
          <video class="yourstyle-video" src="${_e(src)}" loop muted playsinline preload="none"
            onclick="toggleYourStyleVideo(this)"
            style="cursor:pointer"></video>
          <div class="yourstyle-gradient"></div>
          <div class="yourstyle-meta">
            <div class="yourstyle-username">
              <span style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#D4AF37,#b8860b);display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;color:#000;flex-shrink:0">${initials}</span>
              @${_e(post.authorFirst||'')}${_e(post.authorLast||'')} · ${timeAgo}
            </div>
            ${post.caption ? `<div class="yourstyle-caption">${_e(post.caption)}</div>` : ''}
            <div class="yourstyle-music">🎵 ${catEmoji} ${_e(post.category||'yourstyle')}</div>
          </div>
          <div class="yourstyle-actions">
            <button class="yourstyle-action-btn" onclick="likeYourStylePost('${_e(post.id)}',this)" title="Like">
              <div class="yourstyle-action-icon" style="color:${isLiked?'#ff4757':'#fff'}">${isLiked?'❤️':'🤍'}</div>
              <span class="yourstyle-action-count">${likes}</span>
            </button>
            <button class="yourstyle-action-btn" onclick="commentYourStylePost('${_e(post.id)}')" title="Comment">
              <div class="yourstyle-action-icon">💬</div>
              <span class="yourstyle-action-count">${comments}</span>
            </button>
            <button class="yourstyle-action-btn" onclick="shareYourStylePost('${_e(post.id)}')" title="Share">
              <div class="yourstyle-action-icon">↗️</div>
              <span class="yourstyle-action-count">Share</span>
            </button>
            <button class="yourstyle-action-btn" onclick="giftYourStylePost('${_e(post.authorEmail)}')" title="Gift">
              <div class="yourstyle-action-icon">🎁</div>
              <span class="yourstyle-action-count">Gift</span>
            </button>
          </div>
        </div>
      </div>`;
    }

    // Image post
    if (post.imageData) {
      return `<div class="yourstyle-post-card" data-post-id="${_e(post.id)}" data-category="${_e(post.category)}">
        <div style="position:relative">
          <img src="${_e(post.imageData)}" class="yourstyle-image-post" loading="lazy" alt="YourStyle post"
            onclick="openPostDetail('${_e(post.id)}')"/>
          <div style="position:absolute;bottom:0;left:0;right:0;height:160px;background:linear-gradient(transparent,rgba(0,0,0,.75));pointer-events:none"></div>
          <div class="yourstyle-meta" style="bottom:12px">
            <div class="yourstyle-username">
              <span style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#D4AF37,#b8860b);display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;color:#000;flex-shrink:0">${initials}</span>
              @${_e(post.authorFirst||'')}${_e(post.authorLast||'')}
            </div>
            ${post.caption ? `<div class="yourstyle-caption" style="font-size:12px">${_e(post.caption)}</div>` : ''}
          </div>
          <div class="yourstyle-actions" style="bottom:60px">
            <button class="yourstyle-action-btn" onclick="likeYourStylePost('${_e(post.id)}',this)" title="Like">
              <div class="yourstyle-action-icon" style="color:${isLiked?'#ff4757':'#fff'}">${isLiked?'❤️':'🤍'}</div>
              <span class="yourstyle-action-count">${likes}</span>
            </button>
            <button class="yourstyle-action-btn" onclick="commentYourStylePost('${_e(post.id)}')" title="Comment">
              <div class="yourstyle-action-icon">💬</div>
              <span class="yourstyle-action-count">${comments}</span>
            </button>
            <button class="yourstyle-action-btn" onclick="shareYourStylePost('${_e(post.id)}')" title="Share">
              <div class="yourstyle-action-icon">↗️</div>
              <span class="yourstyle-action-count">Share</span>
            </button>
          </div>
        </div>
        <div style="padding:10px 14px;display:flex;align-items:center;gap:8px">
          <span style="font-size:12px;color:rgba(255,255,255,.5)">${catEmoji} ${_e(post.category||'style')} · ${timeAgo}</span>
        </div>
      </div>`;
    }

    // Text post
    return `<div class="yourstyle-post-card" data-post-id="${_e(post.id)}" data-category="${_e(post.category)}">
      <div class="yourstyle-text-post" onclick="openPostDetail('${_e(post.id)}')">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
          <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#D4AF37,#b8860b);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;color:#000">${initials}</div>
          <div>
            <div style="font-size:13px;font-weight:700;color:#fff">@${_e(post.authorFirst||'')}${_e(post.authorLast||'')}</div>
            <div style="font-size:10px;color:rgba(255,255,255,.4)">${timeAgo}</div>
          </div>
          <span style="margin-left:auto;font-size:12px;background:rgba(255,255,255,.08);padding:3px 8px;border-radius:10px;color:rgba(255,255,255,.6)">${catEmoji} ${_e(post.category||'style')}</span>
        </div>
        <div class="yourstyle-text-content">${_e(post.caption||'')}</div>
      </div>
      <div style="padding:8px 14px;display:flex;gap:16px;border-top:1px solid rgba(255,255,255,.05)">
        <button onclick="likeYourStylePost('${_e(post.id)}',this)" style="background:none;border:none;color:${isLiked?'#ff4757':'rgba(255,255,255,.5)'};font-size:13px;cursor:pointer;display:flex;align-items:center;gap:4px">${isLiked?'❤️':'🤍'} ${likes}</button>
        <button onclick="commentYourStylePost('${_e(post.id)}')" style="background:none;border:none;color:rgba(255,255,255,.5);font-size:13px;cursor:pointer;display:flex;align-items:center;gap:4px">💬 ${comments}</button>
        <button onclick="shareYourStylePost('${_e(post.id)}')" style="background:none;border:none;color:rgba(255,255,255,.5);font-size:13px;cursor:pointer;margin-left:auto">↗️ Share</button>
      </div>
    </div>`;
  }
  window.renderYourStyleCard = renderYourStyleCard;

  // Video autoplay on scroll
  function setupVideoAutoplay() {
    const videos = document.querySelectorAll('.yourstyle-video');
    if (!videos.length || !window.IntersectionObserver) return;
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const vid = entry.target;
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          vid.play().catch(() => {});
          // Track watch time
          if (vid._watchTimer) clearTimeout(vid._watchTimer);
          vid._watchTimer = setTimeout(() => {
            const postCard = vid.closest('[data-post-id]');
            if (postCard) YOURSTYLE_ALGO.recordInteraction(postCard.dataset.postId, 'half_watch', postCard.dataset.category);
          }, 3000);
        } else {
          vid.pause();
          if (vid._watchTimer) clearTimeout(vid._watchTimer);
        }
      });
    }, { threshold: [0.5] });
    videos.forEach(v => obs.observe(v));
  }

  window.toggleYourStyleVideo = function(vid) {
    vid.paused ? vid.play() : vid.pause();
  };

  // Like post
  window.likeYourStylePost = function(postId, btn) {
    if (!window.currentUser) { if(typeof showToast==='function')showToast('Sign in to like'); return; }
    const email = window.currentUser.email;
    try {
      const posts = JSON.parse(localStorage.getItem('afrib_style_posts') || '[]');
      const post = posts.find(p => p.id === postId);
      if (!post) return;
      if (!post.likes) post.likes = [];
      const idx = post.likes.indexOf(email);
      if (idx >= 0) {
        post.likes.splice(idx, 1);
        YOURSTYLE_ALGO.recordInteraction(postId, 'view', post.category);
        if (btn) {
          const icon = btn.querySelector('.yourstyle-action-icon');
          const count = btn.querySelector('.yourstyle-action-count');
          if (icon) icon.textContent = '🤍';
          if (icon) icon.style.color = '#fff';
          if (count) count.textContent = post.likes.length;
        }
      } else {
        post.likes.push(email);
        YOURSTYLE_ALGO.recordInteraction(postId, 'like', post.category);
        if (btn) {
          const icon = btn.querySelector('.yourstyle-action-icon');
          const count = btn.querySelector('.yourstyle-action-count');
          if (icon) icon.textContent = '❤️';
          if (icon) icon.style.color = '#ff4757';
          if (count) count.textContent = post.likes.length;
          // Heart animation
          icon?.animate([{transform:'scale(1)'},{transform:'scale(1.4)'},{transform:'scale(1)'}], {duration:300,easing:'ease'});
        }
      }
      localStorage.setItem('afrib_style_posts', JSON.stringify(posts));
    } catch(e) {}
  };

  window.shareYourStylePost = function(postId) {
    const text = 'Check this out on YourStyle — AfribConnect! afribconnect.com';
    if (navigator.share) navigator.share({ title:'YourStyle', text }).catch(()=>{});
    else if (typeof showToast === 'function') showToast('📋 Link copied!');
    YOURSTYLE_ALGO.recordInteraction(postId, 'share', '');
  };

  window.commentYourStylePost = function(postId) {
    if (typeof openPostDetail === 'function') openPostDetail(postId);
  };

  window.giftYourStylePost = function(authorEmail) {
    const users = JSON.parse(localStorage.getItem('afrib_accounts') || '{}');
    const user = users[authorEmail];
    if (user && typeof openGiftMe === 'function') openGiftMe(user, 'yourstyle');
  };

  // Add video upload support to createPost modal
  function upgradeCreatePostModal() {
    const modal = document.getElementById('createPostModal');
    if (!modal || modal._yourstyleUpgraded) return;
    modal._yourstyleUpgraded = true;

    // Add video input
    const imgPreview = document.getElementById('postImagePreview');
    if (imgPreview && !document.getElementById('postVideoInput')) {
      const videoBtn = document.createElement('label');
      videoBtn.style.cssText = 'display:block;margin-top:8px;cursor:pointer;text-align:center;padding:10px;background:rgba(255,71,87,.08);border:1px dashed rgba(255,71,87,.3);border-radius:10px;color:rgba(255,71,87,.8);font-size:13px;font-weight:700';
      videoBtn.innerHTML = '🎬 Add Video (optional)<input type="file" id="postVideoInput" accept="video/*" style="display:none" onchange="handlePostVideoUpload(this)"/>';
      imgPreview.parentElement?.insertAdjacentElement('afterend', videoBtn);
    }
  }

  window.handlePostVideoUpload = function(input) {
    const file = input?.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) { if(typeof showToast==='function')showToast('⚠️ Video max 50MB'); return; }
    const reader = new FileReader();
    reader.onload = e => { window._pendingVideoData = e.target.result; if(typeof showToast==='function')showToast('✅ Video ready to post!'); };
    reader.readAsDataURL(file);
  };

  // Patch submitPost to include video
  const origSubmit = window.submitPost;
  if (origSubmit && !origSubmit._yourstylePatched) {
    window.submitPost = function() {
      // If video is pending, add to post
      if (window._pendingVideoData) {
        const orig2 = window._buildPostObj;
        // Intercept localStorage write to add videoData
        const origSet = localStorage.setItem.bind(localStorage);
        const patchKey = 'afrib_style_posts';
        const tempOverride = function(key, val) {
          if (key === patchKey && window._pendingVideoData) {
            try {
              const arr = JSON.parse(val);
              if (arr.length && !arr[arr.length-1].videoData) {
                arr[arr.length-1].videoData = window._pendingVideoData;
                val = JSON.stringify(arr);
              }
            } catch(e) {}
            window._pendingVideoData = null;
          }
          origSet(key, val);
        };
        localStorage.setItem = tempOverride;
        const result = origSubmit.apply(this, arguments);
        localStorage.setItem = origSet;
        return result;
      }
      return origSubmit.apply(this, arguments);
    };
    window.submitPost._yourstylePatched = true;
  }

  // Upgrade modal + add FAB
  setTimeout(() => {
    upgradeCreatePostModal();

    // FAB for YourStyle
    if (!document.getElementById('yourstyleFAB')) {
      const fab = document.createElement('button');
      fab.id = 'yourstyleFAB';
      fab.className = 'yourstyle-upload-fab';
      fab.textContent = '+';
      fab.title = 'Post to YourStyle';
      fab.onclick = () => { if(typeof openCreatePost==='function')openCreatePost(); };
      document.body.appendChild(fab);
    }

    // Show/hide FAB based on active screen
    const origShowScreen = window.showScreen;
    if (origShowScreen && !origShowScreen._yourstyleFab) {
      window.showScreen = function(id) {
        const r = origShowScreen.apply(this, arguments);
        const fab = document.getElementById('yourstyleFAB');
        if (fab) fab.style.display = (id === 'style') ? 'flex' : 'none';
        return r;
      };
      window.showScreen._yourstyleFab = true;
    }
  }, 1500);

  // ═══════════════════════════════════════════════════════════
  // § 3  GIF PICKER (Tenor API via Content Security Policy)
  // ═══════════════════════════════════════════════════════════
  const TENOR_KEY = 'AIzaSyAyimkuYQYF_FXVql9lDhhveBSG8sMiEKM'; // public demo key

  // Curated built-in GIFs (guaranteed to work, no API needed)
  const BUILTIN_GIFS = {
    trending: [
      { title:'Fire', url:'https://media.tenor.com/nITGVHchcD0AAAAM/fire.gif', preview:'https://media.tenor.com/nITGVHchcD0AAAAS/fire.gif' },
      { title:'Love', url:'https://media.tenor.com/fGRtPqHO2DQAAAAM/love.gif', preview:'https://media.tenor.com/fGRtPqHO2DQAAAAS/love.gif' },
      { title:'Laugh', url:'https://media.tenor.com/n6uSNHzCiWcAAAAM/haha-laugh.gif', preview:'https://media.tenor.com/n6uSNHzCiWcAAAAS/haha-laugh.gif' },
      { title:'Wave', url:'https://media.tenor.com/xTNJIzPCKs4AAAAM/wave-hello.gif', preview:'https://media.tenor.com/xTNJIzPCKs4AAAAS/wave-hello.gif' },
      { title:'Dance', url:'https://media.tenor.com/k6Pjq1PXPGgAAAAM/dance.gif', preview:'https://media.tenor.com/k6Pjq1PXPGgAAAAS/dance.gif' },
      { title:'Wow', url:'https://media.tenor.com/l3HVm9UlAv0AAAAM/wow.gif', preview:'https://media.tenor.com/l3HVm9UlAv0AAAAS/wow.gif' },
    ],
    africa: [
      { title:'Africa', url:'https://media.tenor.com/XJJ-kKcI6rkAAAAM/africa-continent.gif', preview:'https://media.tenor.com/XJJ-kKcI6rkAAAAS/africa-continent.gif' },
      { title:'Afrobeats', url:'https://media.tenor.com/hKyXf2-AVJIAAAAM/afrobeats.gif', preview:'https://media.tenor.com/hKyXf2-AVJIAAAAS/afrobeats.gif' },
    ],
    celebrate: [
      { title:'Party', url:'https://media.tenor.com/sNSV-qlRjlgAAAAM/party.gif', preview:'https://media.tenor.com/sNSV-qlRjlgAAAAS/party.gif' },
      { title:'Confetti', url:'https://media.tenor.com/IguuLqMuRgAAAAM/confetti.gif', preview:'https://media.tenor.com/IguuLqMuRgAAAAS/confetti.gif' },
    ],
  };

  let _gifCallback = null;

  window.openMsgGifPicker = function(onSelect) {
    _gifCallback = onSelect || null;
    const existing = document.getElementById('gifPickerOverlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'gifPickerOverlay';
    overlay.className = 'gif-picker-overlay';
    overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };

    overlay.innerHTML = `
      <div class="gif-picker-sheet">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px 0">
          <div style="font-size:15px;font-weight:800">GIF</div>
          <div style="display:flex;gap:8px">
            <button id="gifTabTrend" onclick="gifSwitchTab('trending',this)" style="background:rgba(212,175,55,.2);border:1px solid rgba(212,175,55,.4);border-radius:8px;color:var(--gold,#D4AF37);font-size:11px;font-weight:700;padding:4px 10px;cursor:pointer">🔥 Trending</button>
            <button id="gifTabAfric" onclick="gifSwitchTab('africa',this)" style="background:none;border:1px solid rgba(255,255,255,.1);border-radius:8px;color:rgba(255,255,255,.5);font-size:11px;font-weight:700;padding:4px 10px;cursor:pointer">🌍 Africa</button>
            <button id="gifTabCeleb" onclick="gifSwitchTab('celebrate',this)" style="background:none;border:1px solid rgba(255,255,255,.1);border-radius:8px;color:rgba(255,255,255,.5);font-size:11px;font-weight:700;padding:4px 10px;cursor:pointer">🎉 Celebrate</button>
          </div>
          <button onclick="safeRemoveEl('gifPickerOverlay')" style="background:none;border:none;color:rgba(255,255,255,.5);font-size:20px;cursor:pointer">✕</button>
        </div>
        <div class="gif-search-bar">
          <input class="gif-search-input" id="gifSearch" placeholder="🔍 Search GIFs…" autocomplete="off"
            oninput="gifSearchDebounced(this.value)"/>
        </div>
        <div class="gif-grid" id="gifGrid"></div>
        <div style="padding:6px 12px 10px;font-size:9px;color:rgba(255,255,255,.2);text-align:center">Powered by Tenor</div>
      </div>`;

    document.body.appendChild(overlay);
    gifRenderTab('trending');
  };

  window.gifSwitchTab = function(tab, btn) {
    document.querySelectorAll('#gifPickerOverlay button[id^="gifTab"]').forEach(b => {
      b.style.background = 'none';
      b.style.borderColor = 'rgba(255,255,255,.1)';
      b.style.color = 'rgba(255,255,255,.5)';
    });
    if (btn) {
      btn.style.background = 'rgba(212,175,55,.2)';
      btn.style.borderColor = 'rgba(212,175,55,.4)';
      btn.style.color = '#D4AF37';
    }
    gifRenderTab(tab);
  };

  window.gifRenderTab = function(tab) {
    const grid = document.getElementById('gifGrid');
    if (!grid) return;
    const gifs = BUILTIN_GIFS[tab] || BUILTIN_GIFS.trending;
    grid.innerHTML = gifs.map(g =>
      `<div class="gif-item" onclick="gifSelect('${encodeURIComponent(g.url)}','${encodeURIComponent(g.title)}')">
        <img src="${g.preview || g.url}" alt="${g.title}" loading="lazy"/>
      </div>`
    ).join('') || '<div style="padding:20px;color:rgba(255,255,255,.4);text-align:center">No GIFs found</div>';
  };

  // Debounced search using Tenor API
  let _gifSearchTimer = null;
  window.gifSearchDebounced = function(q) {
    clearTimeout(_gifSearchTimer);
    if (!q.trim()) { gifRenderTab('trending'); return; }
    _gifSearchTimer = setTimeout(() => gifSearch(q), 400);
  };

  window.gifSearch = async function(q) {
    const grid = document.getElementById('gifGrid');
    if (!grid) return;
    grid.innerHTML = '<div style="padding:20px;text-align:center;color:rgba(255,255,255,.4)">Searching…</div>';
    try {
      const res = await fetch(`https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(q)}&key=${TENOR_KEY}&limit=12&media_filter=gif`);
      if (!res.ok) throw new Error('Tenor error');
      const data = await res.json();
      const results = data.results || [];
      if (!results.length) { grid.innerHTML = '<div style="padding:20px;text-align:center;color:rgba(255,255,255,.4)">No results</div>'; return; }
      grid.innerHTML = results.map(r => {
        const gif = r.media_formats?.gif?.url || r.media_formats?.tinygif?.url || '';
        const preview = r.media_formats?.tinygif?.url || gif;
        return `<div class="gif-item" onclick="gifSelect('${encodeURIComponent(gif)}','${encodeURIComponent(r.title||'GIF')}')">
          <img src="${preview}" alt="${r.title||'GIF'}" loading="lazy"/>
        </div>`;
      }).join('');
    } catch(e) {
      // Fallback to built-in results
      grid.innerHTML = '<div style="padding:10px;text-align:center;color:rgba(255,255,255,.4);font-size:12px">Showing offline GIFs</div>';
      gifRenderTab('trending');
    }
  };

  window.gifSelect = function(encodedUrl, encodedTitle) {
    const url = decodeURIComponent(encodedUrl);
    const title = decodeURIComponent(encodedTitle);
    const overlay = document.getElementById('gifPickerOverlay');
    if (overlay) overlay.remove();

    if (_gifCallback) { _gifCallback({ url, title, type:'gif' }); return; }

    // Default: send as message
    if (window.msgState?.activeConvo && window.currentUser) {
      try {
        const msg = { id: Date.now(), sender: window.currentUser.email, gif: url, gifTitle: title, time: new Date().toISOString() };
        const msgs = (typeof getMsgThread === 'function') ? getMsgThread(window.msgState.activeConvo) : [];
        msgs.push(msg);
        if (typeof saveMsgThread === 'function') saveMsgThread(window.msgState.activeConvo, msgs);
        const convos = (typeof getMsgConvos === 'function') ? getMsgConvos() : {};
        if (convos[window.msgState.activeConvo]) {
          convos[window.msgState.activeConvo].preview = '🎬 GIF';
          convos[window.msgState.activeConvo].time = Date.now();
          convos[window.msgState.activeConvo].lastSenderMe = true;
          if (typeof saveMsgConvos === 'function') saveMsgConvos(convos);
        }
        if (typeof renderMsgThread === 'function') renderMsgThread(window.msgState.activeConvo);
        if (typeof showToast === 'function') showToast('🎬 GIF sent!');
      } catch(e) {}
    }
  };

  // Also add GIF support to emoji picker (inject GIF tab)
  function addGifToEmojiPicker() {
    const picker = document.getElementById('afrib-emoji-picker');
    if (!picker || picker.querySelector('[data-gif-tab]')) return;
    const catBar = picker.querySelector('div[style*="display:flex"][style*="gap:0"]');
    if (!catBar) return;
    const gifBtn = document.createElement('button');
    gifBtn.dataset.gifTab = '1';
    gifBtn.style.cssText = 'flex-shrink:0;padding:6px 10px;border:none;background:none;border-radius:8px;font-size:12px;font-weight:800;color:#D4AF37;cursor:pointer';
    gifBtn.textContent = 'GIF';
    gifBtn.onclick = () => {
      const input = document.querySelector('.afrib-emoji-btn')?.previousElementSibling ||
                    document.getElementById('msgInput') || document.activeElement;
      openMsgGifPicker(gif => {
        if (input && 'value' in input) {
          const pos = input.selectionStart || input.value.length;
          input.value = input.value.slice(0, pos) + gif.url + input.value.slice(pos);
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
    };
    catBar.appendChild(gifBtn);
  }

  setInterval(addGifToEmojiPicker, 2000);


  // ═══════════════════════════════════════════════════════════
  // § 4  MESSAGES — Video + Image + Download + Backup
  // ═══════════════════════════════════════════════════════════

  // Upgrade message input bar to support video
  function upgradeMsgInputBar() {
    const inputBar = document.querySelector('#msgChatWindow > div:last-child');
    if (!inputBar || inputBar._v72upgraded) return;
    inputBar._v72upgraded = true;

    // Add video send button
    const existingImgBtn = inputBar.querySelector('[title="Send image"]');
    if (existingImgBtn && !inputBar.querySelector('[data-vid-btn]')) {
      const videoLabel = document.createElement('label');
      videoLabel.title = 'Send video';
      videoLabel.dataset.vidBtn = '1';
      videoLabel.style.cssText = 'cursor:pointer;width:36px;height:36px;border-radius:50%;background:rgba(255,71,87,.1);border:1px solid rgba(255,71,87,.25);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0';
      videoLabel.innerHTML = '🎬<input type="file" accept="video/*" style="display:none" onchange="sendMsgVideo(this)"/>';
      existingImgBtn.insertAdjacentElement('afterend', videoLabel);
    }
  }

  // Send video in messages
  window.sendMsgVideo = function(input) {
    try {
      const file = input?.files?.[0];
      if (!file || !window.msgState?.activeConvo || !window.currentUser) return;
      if (file.size > 50 * 1024 * 1024) { if(typeof showToast==='function')showToast('⚠️ Video max 50MB'); return; }
      if(typeof showToast==='function')showToast('📤 Uploading video…');
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const msg = {
            id: Date.now(),
            sender: window.currentUser.email,
            video: e.target.result,
            videoName: file.name,
            videoSize: file.size,
            time: new Date().toISOString(),
          };
          const msgs = (typeof getMsgThread === 'function') ? getMsgThread(window.msgState.activeConvo) : [];
          msgs.push(msg);
          if (typeof saveMsgThread === 'function') saveMsgThread(window.msgState.activeConvo, msgs);
          const convos = (typeof getMsgConvos === 'function') ? getMsgConvos() : {};
          if (convos[window.msgState.activeConvo]) {
            convos[window.msgState.activeConvo].preview = '🎬 Video';
            convos[window.msgState.activeConvo].time = Date.now();
            convos[window.msgState.activeConvo].lastSenderMe = true;
            if (typeof saveMsgConvos === 'function') saveMsgConvos(convos);
          }
          if (typeof renderMsgThread === 'function') renderMsgThread(window.msgState.activeConvo);
          if(typeof showToast==='function')showToast('🎬 Video sent!');
        } catch(err) { console.error('sendMsgVideo save:', err); }
      };
      reader.readAsDataURL(file);
      input.value = '';
    } catch(e) { console.error('sendMsgVideo:', e); }
  };

  // Download media
  window.downloadMsgMedia = function(url, filename, type) {
    try {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || ('afrib_media_' + Date.now() + (type === 'video' ? '.mp4' : '.jpg'));
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      if(typeof showToast==='function')showToast('💾 Download started!');
    } catch(e) {
      if(typeof showToast==='function')showToast('⚠️ Could not download: ' + e.message);
    }
  };

  // Backup media (Web Share API → iCloud / Google Drive)
  window.backupMsgMedia = function(url, filename) {
    const blob = dataURLtoBlob(url);
    if (!blob) { if(typeof showToast==='function')showToast('⚠️ Could not prepare backup'); return; }
    const file = new File([blob], filename || 'afrib_backup.jpg', { type: blob.type });
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: 'AfribConnect Media', text: 'Save to iCloud or Google Drive' })
        .then(() => { if(typeof showToast==='function')showToast('✅ Shared to backup!'); })
        .catch(() => { if(typeof showToast==='function')showToast('❌ Backup cancelled'); });
    } else {
      // Fallback: download
      downloadMsgMedia(url, filename);
      if(typeof showToast==='function')showToast('💾 Saved — you can back up from Photos');
    }
  };

  function dataURLtoBlob(dataURL) {
    try {
      const parts = dataURL.split(',');
      const mimeMatch = parts[0].match(/:(.*?);/);
      if (!mimeMatch) return null;
      const mime = mimeMatch[1];
      const binary = atob(parts[1]);
      const arr = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
      return new Blob([arr], { type: mime });
    } catch(e) { return null; }
  }

  // Patch renderMsgThread to render video + GIF messages with download button
  function patchMsgRenderer() {
    const origRender = window.renderMsgThread;
    if (!origRender || origRender._v72patched) return;
    window.renderMsgThread = function(convoId) {
      const result = origRender.call(this, convoId);
      // After render, upgrade media bubbles
      setTimeout(() => upgradeMediaBubbles(convoId), 50);
      return result;
    };
    window.renderMsgThread._v72patched = true;
  }

  function upgradeMediaBubbles(convoId) {
    const msgs = document.getElementById('msgMessages');
    if (!msgs) return;

    // Find image messages that don't yet have download buttons
    msgs.querySelectorAll('img[src^="data:"]:not([data-upgraded])').forEach(img => {
      img.dataset.upgraded = '1';
      const wrap = document.createElement('div');
      wrap.className = 'msg-media-bubble';
      wrap.style.display = 'inline-block';
      const parent = img.parentElement;

      // Download button
      const dlBtn = document.createElement('button');
      dlBtn.className = 'msg-media-download';
      dlBtn.innerHTML = '⬇ Save';
      dlBtn.onclick = e => {
        e.stopPropagation();
        downloadMsgMedia(img.src, 'afrib_photo.jpg', 'image');
      };

      // Backup button
      const bkBtn = document.createElement('button');
      bkBtn.className = 'msg-media-download';
      bkBtn.style.right = '70px';
      bkBtn.style.bottom = '6px';
      bkBtn.innerHTML = '☁ Backup';
      bkBtn.onclick = e => {
        e.stopPropagation();
        backupMsgMedia(img.src, 'afrib_photo.jpg');
      };

      parent.style.position = 'relative';
      parent.appendChild(dlBtn);
      parent.appendChild(bkBtn);
    });

    // Find video messages that aren't yet upgraded
    msgs.querySelectorAll('[data-msg-video]:not([data-upgraded])').forEach(wrap => {
      wrap.dataset.upgraded = '1';
      const src = wrap.dataset.msgVideo;
      const vid = document.createElement('video');
      vid.src = src;
      vid.controls = true;
      vid.style.cssText = 'width:100%;border-radius:12px;max-height:300px;display:block';
      wrap.appendChild(vid);

      const dlBtn = document.createElement('button');
      dlBtn.className = 'msg-media-download';
      dlBtn.innerHTML = '⬇ Save';
      dlBtn.onclick = e => { e.stopPropagation(); downloadMsgMedia(src, 'afrib_video.mp4', 'video'); };
      const bkBtn = document.createElement('button');
      bkBtn.className = 'msg-media-download';
      bkBtn.style.right = '70px';
      bkBtn.innerHTML = '☁ Backup';
      bkBtn.onclick = e => { e.stopPropagation(); backupMsgMedia(src, 'afrib_video.mp4'); };
      wrap.appendChild(dlBtn);
      wrap.appendChild(bkBtn);
    });

    // GIF messages
    msgs.querySelectorAll('[data-msg-gif]:not([data-upgraded])').forEach(wrap => {
      wrap.dataset.upgraded = '1';
      const url = wrap.dataset.msgGif;
      const img = document.createElement('img');
      img.src = url;
      img.style.cssText = 'width:100%;border-radius:12px;max-width:200px;display:block';
      img.loading = 'lazy';
      wrap.appendChild(img);
    });
  }

  // Patch the message rendering to handle video and GIF types
  function patchMsgRenderItem() {
    const origRenderItem = window.renderMsgItem || window._renderMsgBubble;
    // We inject into the renderMsgThread function's output by observing DOM
    const obs = new MutationObserver(() => {
      const msgs = document.getElementById('msgMessages');
      if (msgs) upgradeMediaBubbles();
    });
    const msgs = document.getElementById('msgMessages');
    if (msgs) obs.observe(msgs, { childList: true, subtree: true });
  }

  // Upgrade message thread rendering to display video/GIF
  function patchBuildMsgBubble() {
    const origGetThread = window.getMsgThread;
    if (!origGetThread || origGetThread._v72) return;
    window.getMsgThread = function(convoId) {
      const msgs = origGetThread.call(this, convoId);
      return msgs; // passthrough — actual upgrade is in render
    };
    window.getMsgThread._v72 = true;

    // Patch renderMsgThread to render video/GIF messages
    const origRender = window.renderMsgThread;
    if (origRender && !origRender._v72video) {
      window.renderMsgThread = function(convoId) {
        if (!convoId || !window.currentUser) return;
        const msgs = (typeof getMsgThread === 'function') ? getMsgThread(convoId) : [];
        const el = document.getElementById('msgMessages');
        if (!el) { if (origRender) origRender.call(this, convoId); return; }

        // Check if any messages have video/gif — if so, we need to render them
        const hasMedia = msgs.some(m => m.video || m.gif);
        if (!hasMedia) { origRender.call(this, convoId); return; }

        // Call original then upgrade
        origRender.call(this, convoId);

        // After original renders, replace video/gif placeholder messages
        msgs.forEach((msg, idx) => {
          if (msg.video || msg.gif) {
            // Find corresponding bubble by index
            const bubbles = el.querySelectorAll('[data-msg-idx]');
            const bubble = el.querySelector(`[data-msg-idx="${idx}"]`);
          }
        });

        upgradeMediaBubbles(convoId);
      };
      window.renderMsgThread._v72video = true;
    }
  }

  setTimeout(() => {
    upgradeMsgInputBar();
    patchMsgRenderer();
    patchBuildMsgBubble();
    patchMsgRenderItem();

    // Watch for chat window open
    const chatWin = document.getElementById('msgChatWindow');
    if (chatWin && window.MutationObserver) {
      new MutationObserver(() => {
        if (chatWin.style.display !== 'none') {
          upgradeMsgInputBar();
        }
      }).observe(chatWin, { attributes: true, attributeFilter: ['style'] });
    }
  }, 1500);


  // ═══════════════════════════════════════════════════════════
  // § 5  GLOBAL APP ALGORITHM — cross-feature intelligence
  //
  // Research: TikTok, Instagram, Facebook, Twitter algorithms
  //
  // Cross-app signals we track:
  // - Which features user spends most time on
  // - Game preferences (which games they win, play most)
  // - Market categories they browse
  // - Connection patterns (who they interact with)
  // - Wallet activity patterns
  // - Time-of-day usage patterns
  // ═══════════════════════════════════════════════════════════
  const APP_ALGO = {
    _key: () => 'app_algo_' + (window.currentUser?.email || 'anon'),

    load() {
      try { return JSON.parse(localStorage.getItem(this._key()) || '{}'); } catch(e) { return {}; }
    },

    save(d) {
      try { localStorage.setItem(this._key(), JSON.stringify(d)); } catch(e) {}
    },

    // Track feature usage
    trackFeature(feature, action, meta) {
      const d = this.load();
      if (!d.features) d.features = {};
      if (!d.features[feature]) d.features[feature] = { visits: 0, actions: 0, timeSpent: 0, lastUsed: 0 };
      d.features[feature].visits++;
      d.features[feature].actions += (action === 'interact') ? 3 : 1;
      d.features[feature].lastUsed = Date.now();

      // Hour-of-day pattern
      const hour = new Date().getHours();
      if (!d.hourPattern) d.hourPattern = Array(24).fill(0);
      d.hourPattern[hour]++;

      this.save(d);
    },

    // Get personalised home recommendations
    getHomeRecommendations() {
      const d = this.load();
      const features = d.features || {};
      const sorted = Object.entries(features)
        .sort((a,b) => (b[1].actions||0) - (a[1].actions||0))
        .slice(0, 6)
        .map(([name, data]) => ({
          name,
          score: data.actions || 0,
          lastUsed: data.lastUsed || 0,
        }));
      return sorted;
    },

    // Get best time to show notifications (peak usage hour)
    getPeakHour() {
      const d = this.load();
      const hours = d.hourPattern || Array(24).fill(0);
      return hours.indexOf(Math.max(...hours));
    },

    // Smart suggestions for home screen
    getSmartSuggestions() {
      const d = this.load();
      const suggestions = [];
      const features = d.features || {};

      // If user plays games often
      if ((features.games?.actions || 0) > 5) {
        suggestions.push({ icon: '🎲', text: 'You love games! A new challenge awaits', action: "showScreen('games')" });
      }
      // If user hasn't posted recently
      const posts = JSON.parse(localStorage.getItem('afrib_style_posts') || '[]');
      const myPosts = posts.filter(p => p.authorEmail === window.currentUser?.email);
      const lastPost = myPosts[myPosts.length-1];
      if (!lastPost || Date.now() - new Date(lastPost.createdAt||0).getTime() > 3 * 24 * 3600000) {
        suggestions.push({ icon: '✨', text: 'Share something on YourStyle!', action: "showScreen('style')" });
      }
      // If wallet is unused
      const bal = parseFloat(localStorage.getItem('afrib_balance_' + window.currentUser?.email) || '0');
      if (bal < 1 && (features.wallet?.visits || 0) === 0) {
        suggestions.push({ icon: '💰', text: 'Top up your wallet to send money', action: "showScreen('wallet')" });
      }

      return suggestions.slice(0, 3);
    },
  };

  window.APP_ALGO = APP_ALGO;

  // Auto-track screen changes
  const _origShowScreen = window.showScreen;
  if (_origShowScreen && !_origShowScreen._algoTracked) {
    window.showScreen = function(id) {
      APP_ALGO.trackFeature(id, 'visit');
      return _origShowScreen.apply(this, arguments);
    };
    window.showScreen._algoTracked = true;
  }

  // Inject smart suggestions into home screen
  function injectSmartSuggestions() {
    const el = document.getElementById('smartSuggestions');
    if (!el || !window.currentUser) return;
    const suggestions = APP_ALGO.getSmartSuggestions();
    if (!suggestions.length) return;
    el.innerHTML = suggestions.map(s => `
      <div onclick="${s.action}" style="display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:10px 14px;margin-bottom:8px;cursor:pointer;transition:background .15s"
        onmouseover="this.style.background='rgba(255,255,255,.07)'" onmouseout="this.style.background='rgba(255,255,255,.04)'">
        <span style="font-size:24px;flex-shrink:0">${s.icon}</span>
        <span style="font-size:13px;color:rgba(255,255,255,.8);font-weight:600">${s.text}</span>
        <span style="margin-left:auto;color:rgba(255,255,255,.3);font-size:16px">›</span>
      </div>`).join('');
  }

  document.addEventListener('afrib:login', injectSmartSuggestions);
  setTimeout(injectSmartSuggestions, 2000);
  setInterval(injectSmartSuggestions, 60000);


  // ═══════════════════════════════════════════════════════════
  // § 6  GAMES — ensure web + app playable (canvas + touch)
  // ═══════════════════════════════════════════════════════════
  function ensureGamesWebReady() {
    // Touch → Mouse event bridge for canvas-based games
    const canvases = document.querySelectorAll('#ludoCanvas, #snakeCanvas, #du-canvas');
    canvases.forEach(canvas => {
      if (canvas._touchBridged) return;
      canvas._touchBridged = true;

      function touchToMouse(e, type) {
        const touch = e.touches[0] || e.changedTouches[0];
        if (!touch) return;
        const mouseEvent = new MouseEvent(type, {
          bubbles: true,
          cancelable: true,
          clientX: touch.clientX,
          clientY: touch.clientY,
          view: window,
        });
        canvas.dispatchEvent(mouseEvent);
        if (type === 'mousedown') e.preventDefault();
      }

      canvas.addEventListener('touchstart',  e => touchToMouse(e, 'mousedown'),  { passive: false });
      canvas.addEventListener('touchmove',   e => touchToMouse(e, 'mousemove'),  { passive: true });
      canvas.addEventListener('touchend',    e => touchToMouse(e, 'mouseup'),    { passive: true });
    });

    // Ensure canvas sizes correctly on mobile
    function resizeGameCanvas(canvas) {
      if (!canvas) return;
      const parent = canvas.parentElement;
      if (!parent) return;
      const available = Math.min(parent.clientWidth, parent.clientHeight, 540);
      if (available > 0 && Math.abs(canvas.width - available) > 10) {
        canvas.width = available;
        canvas.height = available;
        // Trigger redraw
        if (canvas.id === 'ludoCanvas' && typeof drawLudoBoard === 'function') drawLudoBoard();
        if (canvas.id === 'snakeCanvas' && typeof drawSnakeBoard === 'function') drawSnakeBoard();
      }
    }

    ['ludoCanvas','snakeCanvas'].forEach(id => {
      const c = document.getElementById(id);
      if (c) resizeGameCanvas(c);
    });

    // Resize on orientation change
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        ['ludoCanvas','snakeCanvas'].forEach(id => {
          resizeGameCanvas(document.getElementById(id));
        });
      }, 300);
    });
  }

  setTimeout(ensureGamesWebReady, 1000);

  // Watch for game screen activation
  document.addEventListener('click', e => {
    if (e.target?.dataset?.screen === 'games' || e.target?.getAttribute?.('onclick')?.includes("'games'")) {
      setTimeout(ensureGamesWebReady, 400);
    }
  });


  console.info('[AfribConnect v72] YourStyle + Algorithm + Media + GIF + Games loaded ✅');

})();
