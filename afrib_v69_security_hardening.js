/* ═══════════════════════════════════════════════════════════════════════════
   AfribConnect v69 — YourStyle Reactions System + Call Clock
   afrib_v69_post_reactions.js
   ─────────────────────────────────────────────────────────────────────────

   RESEARCH-BASED DESIGN:
   ─────────────────────────────────────────────────────────────────────────
   Facebook Reactions (2016): 6 reactions, long-press to reveal, animated
   Instagram (2022): Double-tap ❤️ + hold for emoji tray (7 reactions)
   Twitter/X: Heart + Bookmarks. No multi-reaction (intentional simplicity)
   TikTok: Floating hearts on tap, emoji storm effect
   Snapchat: Emoji replies that float up from bottom
   WeChat: 6 reactions, small pill display under post
   Line: 7 reactions including a "Wow" face
   Discord: Click ➕ for full picker, existing reactions shown as pills
   LinkedIn (2019): 7 reactions with labels on hover

   AFRIBCONNECT INNOVATION: African-culturally-themed reactions
   ─────────────────────────────────────────────────────────────────────────
   Instead of generic global emojis, reactions are rooted in African expression:
   
   1. ❤️  Love / Ife (Yoruba for love)           — classic love
   2. 🔥  Fire / Ogo (Igbo for glory/fire)       — this is amazing
   3. 😂  Chop knuckle (laughing hard)            — very funny
   4. 👑  Crown / Eze (Igbo for king/queen)       — royalty vibes
   5. 🌍  Africa / Ubuntu (I am because we are)   — community/pride
   6. 💃  Dance / Jollof (celebration)            — yes! I love this!
   7. 🙏  Ase / Amen (affirmation across cultures) — respect/blessings
   8. 😮  Shocked / E don do (pidgin surprise)    — wow/unexpected

   CALL CLOCK:
   ─────────────────────────────────────────────────────────────────────────
   "Call Clock" = the cumulative reaction momentum on a post.
   Named after the African concept of "calling time" — when something has
   reached such cultural resonance the community collectively rings its bell.
   
   Features:
   • Ticking animated clock appears when a post passes 10 total reactions
   • Clock hand speed increases with reaction velocity (reactions/hour)
   • "🕐 Calling" → "🔔 Ringing" → "⚡ VIRAL" states
   • Displayed as a badge on the post card
   • Post detail shows full reaction breakdown with who reacted

   INTERACTION DESIGN:
   ─────────────────────────────────────────────────────────────────────────
   • Long press (500ms) OR long hover (400ms) → reaction tray slides up
   • Quick tap → applies last-used reaction (defaults to ❤️)
   • Reaction tray: 8 emoji bubbles in arc formation with bounce-in
   • Selected reaction shown on button with count
   • Reaction count pills under post show top 3 reactions
   • Animated floating emoji when reaction added (rises from post)
   • Double-tap = apply reaction instantly (like Instagram)
   • Notification sent to post author when someone reacts
   ═══════════════════════════════════════════════════════════════════════════ */

(function AfribPostReactions() {
  'use strict';

  /* ─────────────────────────────────────────────────────────────────
     REACTION DEFINITIONS — African-themed
  ───────────────────────────────────────────────────────────────────── */
  const REACTIONS = [
    { id: 'love',    emoji: '❤️',  label: 'Ife',      color: '#ef4444', glow: 'rgba(239,68,68,.6)'     },
    { id: 'fire',    emoji: '🔥',  label: 'Ogo',      color: '#f97316', glow: 'rgba(249,115,22,.6)'    },
    { id: 'laugh',   emoji: '😂',  label: 'Chop Knuckle', color: '#eab308', glow: 'rgba(234,179,8,.6)' },
    { id: 'crown',   emoji: '👑',  label: 'Eze',      color: '#D4AF37', glow: 'rgba(212,175,55,.7)'    },
    { id: 'africa',  emoji: '🌍',  label: 'Ubuntu',   color: '#22c55e', glow: 'rgba(34,197,94,.6)'     },
    { id: 'clockit', emoji: '💅',  label: 'Clock It', color: '#a855f7', glow: 'rgba(168,85,247,.6)'    },
    { id: 'ase',     emoji: '🙏',  label: 'Àṣẹ',     color: '#38bdf8', glow: 'rgba(56,189,248,.6)'    },
    { id: 'wow',     emoji: '😮',  label: 'E don do', color: '#fb923c', glow: 'rgba(251,146,60,.6)'    },
  ];

  const REACTION_MAP = Object.fromEntries(REACTIONS.map(r => [r.id, r]));

  /* ─────────────────────────────────────────────────────────────────
     STORAGE
  ───────────────────────────────────────────────────────────────────── */
  function getPostReactions(postId) {
    try {
      return JSON.parse(localStorage.getItem('afrib_reactions_' + postId) || '{}');
      // Structure: { love: ['email1','email2'], fire: ['email3'], ... }
    } catch(e) { return {}; }
  }

  function savePostReactions(postId, reactions) {
    try { localStorage.setItem('afrib_reactions_' + postId, JSON.stringify(reactions)); } catch(e) {}
  }

  function getUserReaction(postId, email) {
    const reactions = getPostReactions(postId);
    for (const [id, users] of Object.entries(reactions)) {
      if (Array.isArray(users) && users.includes(email)) return id;
    }
    return null;
  }

  function getTotalReactions(postId) {
    const reactions = getPostReactions(postId);
    return Object.values(reactions).reduce((sum, users) => sum + (Array.isArray(users) ? users.length : 0), 0);
  }

  function getTopReactions(postId, limit = 3) {
    const reactions = getPostReactions(postId);
    return Object.entries(reactions)
      .filter(([, users]) => Array.isArray(users) && users.length > 0)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, limit)
      .map(([id, users]) => ({ ...REACTION_MAP[id], count: users.length }));
  }

  /* ─────────────────────────────────────────────────────────────────
     CALL CLOCK LOGIC
  ───────────────────────────────────────────────────────────────────── */
  function getCallClockState(postId, total) {
    if (total < 10)  return null;
    if (total < 30)  return { state: 'calling',  icon: '💅', label: 'Clocking',   speed: 1   };
    if (total < 100) return { state: 'ringing',  icon: '🕐', label: 'They See You', speed: 2.5 };
    return              { state: 'viral',    icon: '⚡', label: 'CLOCKED OUT', speed: 0.3 };
  }

  function renderCallClock(postId) {
    const total = getTotalReactions(postId);
    const clock = getCallClockState(postId, total);
    if (!clock) return '';

    const colors = { calling: '#D4AF37', ringing: '#f97316', viral: '#ef4444' };
    const col = colors[clock.state];

    return `<div class="afrib-call-clock" data-post="${postId}" data-state="${clock.state}" style="
      display:inline-flex; align-items:center; gap:5px;
      background:${col}18; border:1px solid ${col}40;
      border-radius:20px; padding:3px 10px;
      font-size:10px; font-weight:800; color:${col};
      letter-spacing:.4px; cursor:pointer;
      animation:callClockPulse${clock.state} ${clock.speed}s ease-in-out infinite;
    " onclick="showReactionBreakdown('${postId}')" title="Clock It — see who clocked this post">
      <span class="call-clock-icon" style="font-size:13px">${clock.icon}</span>
      <span>${clock.label}</span>
      <span style="opacity:.7">${total}</span>
    </div>`;
  }

  /* ─────────────────────────────────────────────────────────────────
     REACTION TRAY — arc-formation, slides up on long press
  ───────────────────────────────────────────────────────────────────── */
  let _trayActive = false;
  let _longPressTimer = null;
  let _currentTrayPostId = null;

  function showReactionTray(postId, anchorEl) {
    hideReactionTray();
    _trayActive = true;
    _currentTrayPostId = postId;

    const userReaction = window.currentUser ? getUserReaction(postId, window.currentUser.email) : null;

    const tray = document.createElement('div');
    tray.id = 'afrib-reaction-tray';
    tray.className = 'afrib-reaction-tray';

    tray.innerHTML = `
      <div class="art-backdrop" onclick="hideReactionTray()"></div>
      <div class="art-bubble-row" id="art-bubbles-${postId}">
        ${REACTIONS.map((r, i) => `
          <button class="art-bubble ${userReaction === r.id ? 'art-bubble-active' : ''}"
            data-reaction="${r.id}"
            onclick="applyReaction('${postId}','${r.id}',this)"
            title="${r.label}"
            style="animation-delay:${i * 35}ms; --react-color:${r.color}; --react-glow:${r.glow};"
          >
            <span class="art-emoji">${r.emoji}</span>
            <span class="art-label">${r.label}</span>
          </button>
        `).join('')}
      </div>
      <div class="art-tip-arrow"></div>
    `;

    // Position above the button
    document.body.appendChild(tray);

    const rect = anchorEl.getBoundingClientRect();
    const bubbleRow = tray.querySelector('.art-bubble-row');
    const scrollY   = window.scrollY || document.documentElement.scrollTop;

    // Position: above the button, centred
    bubbleRow.style.position = 'fixed';
    bubbleRow.style.bottom   = (window.innerHeight - rect.top + 12) + 'px';
    bubbleRow.style.left     = Math.max(8, Math.min(window.innerWidth - 320, rect.left - 120)) + 'px';

    // Close on outside click
    setTimeout(() => {
      document.addEventListener('click', _closeTrayOnOutside, { once: true });
    }, 100);
  }

  function _closeTrayOnOutside(e) {
    const tray = document.getElementById('afrib-reaction-tray');
    if (tray && !tray.contains(e.target)) hideReactionTray();
  }

  function hideReactionTray() {
    const tray = document.getElementById('afrib-reaction-tray');
    if (tray) {
      tray.style.animation = 'artFadeOut .15s ease forwards';
      setTimeout(() => tray.remove(), 150);
    }
    _trayActive = false;
    _currentTrayPostId = null;
    if (_longPressTimer) { clearTimeout(_longPressTimer); _longPressTimer = null; }
  }
  window.hideReactionTray = hideReactionTray;

  /* ─────────────────────────────────────────────────────────────────
     APPLY REACTION
  ───────────────────────────────────────────────────────────────────── */
  window.applyReaction = function(postId, reactionId, bubbleEl) {
    if (!window.currentUser) {
      if (typeof window.showAuth === 'function') window.showAuth('login');
      return;
    }

    const email     = window.currentUser.email;
    const reactions = getPostReactions(postId);
    const prev      = getUserReaction(postId, email);

    // Remove previous reaction
    if (prev && reactions[prev]) {
      reactions[prev] = reactions[prev].filter(e => e !== email);
      if (reactions[prev].length === 0) delete reactions[prev];
    }

    // Toggle: if same reaction, just remove it
    if (prev === reactionId) {
      savePostReactions(postId, reactions);
      _updateReactionUI(postId);
      hideReactionTray();
      return;
    }

    // Add new reaction
    if (!reactions[reactionId]) reactions[reactionId] = [];
    if (!reactions[reactionId].includes(email)) reactions[reactionId].push(email);

    savePostReactions(postId, reactions);

    // Store last-used reaction preference
    try { localStorage.setItem('afrib_last_reaction_' + email, reactionId); } catch(e) {}

    // Update UI
    _updateReactionUI(postId);
    hideReactionTray();

    // Floating emoji animation
    const btn = document.querySelector(`[data-post-id="${postId}"] .art-react-btn, #post-${postId} .art-react-btn`);
    if (btn) _floatEmoji(REACTION_MAP[reactionId].emoji, btn);

    // Notify post author
    _notifyAuthor(postId, reactionId);

    if (typeof window.showToast === 'function') {
      const toastMsg = reactionId === 'clockit' 
        ? '💅 Clocked it! You see them!'
        : REACTION_MAP[reactionId].emoji + ' ' + REACTION_MAP[reactionId].label + '!';
      window.showToast(toastMsg, 1800);
    }
  };

  function _getUserLastReaction(email) {
    try { return localStorage.getItem('afrib_last_reaction_' + email) || 'love'; } catch(e) { return 'love'; }
  }

  /* Quick tap — apply last-used reaction */
  window.quickReact = function(postId, btn) {
    if (!window.currentUser) {
      if (typeof window.showAuth === 'function') window.showAuth('login');
      return;
    }
    const lastReaction = _getUserLastReaction(window.currentUser.email);
    window.applyReaction(postId, lastReaction, btn);
  };

  /* ─────────────────────────────────────────────────────────────────
     UPDATE UI AFTER REACTION
  ───────────────────────────────────────────────────────────────────── */
  function _updateReactionUI(postId) {
    const postEl = document.getElementById('post-' + postId);
    if (!postEl) return;

    const userReaction = window.currentUser ? getUserReaction(postId, window.currentUser.email) : null;
    const topReactions = getTopReactions(postId);
    const total        = getTotalReactions(postId);
    const reactDef     = userReaction ? REACTION_MAP[userReaction] : null;

    // Update the reaction button
    const btn = postEl.querySelector('.art-react-btn');
    if (btn) {
      btn.innerHTML = reactDef
        ? `<span style="font-size:18px">${reactDef.emoji}</span><span style="font-size:12px;font-weight:800;color:${reactDef.color}">${reactDef.label}</span>`
        : `<span style="font-size:18px">🤍</span><span style="font-size:12px;font-weight:600;color:var(--w60)">React</span>`;
      btn.style.background = reactDef ? reactDef.color + '15' : 'transparent';
      btn.style.borderColor = reactDef ? reactDef.color + '40' : 'transparent';
    }

    // Update reaction pills row
    const pillsRow = postEl.querySelector('.art-pills-row');
    if (pillsRow) {
      pillsRow.innerHTML = _buildPills(topReactions, total, postId);
    }

    // Update call clock
    const clockContainer = postEl.querySelector('.art-clock-container');
    if (clockContainer) {
      clockContainer.innerHTML = renderCallClock(postId);
    }
  }

  function _buildPills(topReactions, total, postId) {
    if (topReactions.length === 0) return '';
    return topReactions.map(r => `
      <span class="art-pill" onclick="showReactionBreakdown('${postId}')" style="
        display:inline-flex; align-items:center; gap:3px;
        background:${r.color}12; border:1px solid ${r.color}30;
        border-radius:20px; padding:2px 8px; font-size:11px;
        cursor:pointer; transition:all .15s;
      "
      onmouseenter="this.style.background='${r.color}22'"
      onmouseleave="this.style.background='${r.color}12'">
        <span>${r.emoji}</span>
        <span style="font-weight:700;color:${r.color}">${r.count}</span>
      </span>
    `).join('') + (total > 3 ? `<span style="font-size:11px;color:var(--w40);margin-left:2px">+${total - topReactions.reduce((s,r)=>s+r.count,0)}</span>` : '');
  }

  /* ─────────────────────────────────────────────────────────────────
     FLOATING EMOJI ANIMATION
  ───────────────────────────────────────────────────────────────────── */
  function _floatEmoji(emoji, anchorEl) {
    const rect = anchorEl.getBoundingClientRect();
    const el   = document.createElement('div');
    el.className = 'afrib-float-emoji';
    el.textContent = emoji;
    el.style.cssText = `
      position:fixed; left:${rect.left + rect.width/2}px; top:${rect.top}px;
      font-size:28px; pointer-events:none; z-index:99999;
      animation: floatEmojiUp .9s cubic-bezier(.16,1,.3,1) forwards;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 900);
  }

  /* ─────────────────────────────────────────────────────────────────
     NOTIFY POST AUTHOR
  ───────────────────────────────────────────────────────────────────── */
  function _notifyAuthor(postId, reactionId) {
    try {
      const me    = window.currentUser;
      const posts = window.getStylePosts ? window.getStylePosts() : [];
      const post  = posts.find(p => p.id === postId);
      if (!post || post.authorEmail === me.email) return;

      const r = REACTION_MAP[reactionId];
      if (typeof window.addNotification === 'function') {
        window.addNotification(post.authorEmail, {
          type:     'reaction',
          from:     me.email,
          fromName: (me.first || '') + ' ' + (me.last || ''),
          preview:  reactionId === 'clockit'
            ? `💅 ${(me.first||'Someone')} clocked your post!`
            : `${r.emoji} ${r.label} on your post`,
          postId,
          ts:       new Date().toISOString(),
        });
      }
    } catch(e) {}
  }

  /* ─────────────────────────────────────────────────────────────────
     REACTION BREAKDOWN MODAL
  ───────────────────────────────────────────────────────────────────── */
  window.showReactionBreakdown = function(postId) {
    const reactions  = getPostReactions(postId);
    const total      = getTotalReactions(postId);
    const accounts   = window.getAccounts ? window.getAccounts() : {};
    const clock      = getCallClockState(postId, total);

    const modal = document.createElement('div');
    modal.id    = 'afrib-reaction-breakdown';
    modal.style.cssText = `
      position:fixed; inset:0; z-index:99999;
      background:rgba(0,0,0,.85); backdrop-filter:blur(12px);
      display:flex; align-items:flex-end; justify-content:center;
      animation:artModalIn .25s cubic-bezier(.16,1,.3,1) both;
    `;

    // Group by reaction type
    const grouped = REACTIONS.map(r => ({
      ...r,
      users: (reactions[r.id] || []).map(email => accounts[email] || { email, first: email.split('@')[0], last: '' })
    })).filter(r => r.users.length > 0);

    modal.innerHTML = `
      <div style="
        width:min(480px,100vw); max-height:75vh; overflow-y:auto;
        background:linear-gradient(180deg,#0d0920,#06030f);
        border-radius:24px 24px 0 0; padding:0;
        box-shadow:0 -20px 60px rgba(0,0,0,.8);
        border-top:1px solid rgba(212,175,55,.15);
        scrollbar-width:none;
      ">
        <!-- Handle -->
        <div style="width:36px;height:4px;background:rgba(255,255,255,.15);border-radius:2px;margin:12px auto 0"></div>

        <!-- Header -->
        <div style="padding:16px 20px 12px;border-bottom:1px solid rgba(255,255,255,.06)">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
            <div style="font-size:18px;font-weight:900;color:#fff;font-family:Syne,sans-serif">Reactions</div>
            <div style="font-size:13px;font-weight:700;color:rgba(255,255,255,.4)">${total} total</div>
            ${clock ? `
              <div style="margin-left:auto;display:inline-flex;align-items:center;gap:4px;
                background:${clock.state==='viral'?'rgba(239,68,68,.15)':clock.state==='ringing'?'rgba(249,115,22,.12)':'rgba(212,175,55,.1)'};
                border:1px solid ${clock.state==='viral'?'rgba(239,68,68,.3)':clock.state==='ringing'?'rgba(249,115,22,.25)':'rgba(212,175,55,.2)'};
                border-radius:20px;padding:4px 10px;font-size:11px;font-weight:800;
                color:${clock.state==='viral'?'#ef4444':clock.state==='ringing'?'#f97316':'#D4AF37'}">
                ${clock.icon} ${clock.label}
              </div>
            ` : ''}
          </div>
          <!-- Reaction tab filter -->
          <div style="display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding-bottom:2px">
            <button onclick="filterBreakdownTab('all',this)" class="bd-tab bd-tab-active" style="flex-shrink:0;padding:5px 12px;border-radius:20px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);color:#fff;font-size:12px;font-weight:700;cursor:pointer">
              All <span style="color:rgba(255,255,255,.5)">${total}</span>
            </button>
            ${grouped.map(r => `
              <button onclick="filterBreakdownTab('${r.id}',this)" class="bd-tab" style="flex-shrink:0;padding:5px 12px;border-radius:20px;background:${r.color}12;border:1px solid ${r.color}30;color:${r.color};font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap">
                ${r.emoji} ${r.label} <span style="opacity:.7">${r.users.length}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- User list -->
        <div id="bd-user-list" style="padding:12px 16px;display:flex;flex-direction:column;gap:2px">
          ${grouped.flatMap(r => r.users.map(u => `
            <div class="bd-user-row" data-reaction="${r.id}" style="
              display:flex;align-items:center;gap:12px;
              padding:10px 12px;border-radius:12px;
              transition:background .15s; cursor:pointer;
            "
            onmouseenter="this.style.background='rgba(255,255,255,.04)'"
            onmouseleave="this.style.background='transparent'"
            onclick="showPublicProfile && showPublicProfile('${u.email}')">
              <!-- Avatar -->
              <div style="
                width:40px;height:40px;border-radius:50%;flex-shrink:0;
                background:linear-gradient(135deg,${r.color},${r.color}88);
                display:flex;align-items:center;justify-content:center;
                font-size:15px;font-weight:800;color:#fff;
                position:relative;
              ">
                ${((u.first||'?')[0]+(u.last||'')[0]).toUpperCase()}
                <!-- Reaction badge -->
                <span style="
                  position:absolute;bottom:-2px;right:-2px;
                  width:18px;height:18px;border-radius:50%;
                  background:#0d0920;border:1.5px solid rgba(255,255,255,.1);
                  display:flex;align-items:center;justify-content:center;
                  font-size:10px;line-height:1;
                ">${r.emoji}</span>
              </div>
              <!-- Info -->
              <div style="flex:1;min-width:0">
                <div style="font-size:14px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                  ${u.first || ''} ${u.last || ''}
                </div>
                <div style="font-size:11px;color:${r.color};font-weight:600">${r.emoji} ${r.label}</div>
              </div>
              <div style="font-size:18px;opacity:.3">›</div>
            </div>
          `)).join('')}
        </div>

        <div style="height:env(safe-area-inset-bottom,0);min-height:16px"></div>
      </div>
    `;

    modal.onclick = (e) => { if (e.target === modal) { modal.style.animation = 'artModalOut .2s ease forwards'; setTimeout(() => modal.remove(), 200); } };
    document.body.appendChild(modal);
  };

  window.filterBreakdownTab = function(reactionId, tabBtn) {
    // Update tab styles
    document.querySelectorAll('.bd-tab').forEach(t => t.classList.remove('bd-tab-active'));
    tabBtn.classList.add('bd-tab-active');
    tabBtn.style.background = 'rgba(255,255,255,.08)';
    tabBtn.style.borderColor = 'rgba(255,255,255,.12)';
    tabBtn.style.color = '#fff';

    // Show/hide rows
    document.querySelectorAll('.bd-user-row').forEach(row => {
      const show = reactionId === 'all' || row.dataset.reaction === reactionId;
      row.style.display = show ? 'flex' : 'none';
    });
  };

  /* ─────────────────────────────────────────────────────────────────
     BUILD REACTION ROW FOR POST CARD
     Replaces the simple ❤️ button with the full reaction system
  ───────────────────────────────────────────────────────────────────── */
  function buildReactionRow(post) {
    const id          = post.id;
    const me          = window.currentUser;
    const userReaction = me ? getUserReaction(id, me.email) : null;
    const reactDef    = userReaction ? REACTION_MAP[userReaction] : null;
    const topReactions = getTopReactions(id);
    const total       = getTotalReactions(id);
    const comments    = window.getPostComments ? window.getPostComments(id) : [];

    const _esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    const safeId = _esc(id);

    return `
      <!-- Reaction pills row -->
      <div class="art-pills-row" style="display:flex;flex-wrap:wrap;align-items:center;gap:5px;min-height:20px;margin-bottom:8px;padding:0 2px">
        ${_buildPills(topReactions, total, id)}
      </div>

      <!-- Actions row -->
      <div style="display:flex;align-items:center;gap:10px;padding:0 2px">

        <!-- React button — long press or click to react -->
        <button class="art-react-btn"
          data-post-id="${safeId}"
          onclick="quickReact('${safeId}',this)"
          onmousedown="_artLongPressStart('${safeId}',this,event)"
          onmouseup="_artLongPressCancel()"
          onmouseleave="_artLongPressCancel()"
          ontouchstart="_artLongPressStart('${safeId}',this,event)"
          ontouchend="_artLongPressCancel()"
          ondblclick="event.preventDefault();quickReact('${safeId}',this)"
          title="Hold for more reactions"
          style="
            display:inline-flex;align-items:center;gap:6px;
            background:${reactDef ? reactDef.color+'15' : 'transparent'};
            border:1px solid ${reactDef ? reactDef.color+'40' : 'transparent'};
            border-radius:20px;padding:6px 12px;cursor:pointer;
            transition:all .2s;flex-shrink:0;
          "
        >
          <span style="font-size:18px">${reactDef ? reactDef.emoji : '🤍'}</span>
          <span style="font-size:12px;font-weight:${reactDef?800:600};color:${reactDef ? reactDef.color : 'var(--w60)'}">
            ${reactDef ? reactDef.label : 'React'}
          </span>
        </button>

        <!-- Comment button -->
        <button onclick="openPostDetail('${safeId}')"
          style="display:inline-flex;align-items:center;gap:6px;background:transparent;border:1px solid transparent;border-radius:20px;padding:6px 12px;cursor:pointer;color:var(--w60);font-size:14px;transition:all .2s"
          onmouseenter="this.style.background='rgba(255,255,255,.05)';this.style.borderColor='rgba(255,255,255,.1)'"
          onmouseleave="this.style.background='transparent';this.style.borderColor='transparent'"
        >
          💬 <span style="font-size:12px">${comments.length}</span>
        </button>

        <!-- Share button -->
        <button onclick="sharePost('${safeId}')"
          style="display:inline-flex;align-items:center;gap:5px;background:transparent;border:1px solid transparent;border-radius:20px;padding:6px 12px;cursor:pointer;color:var(--w60);font-size:14px;transition:all .2s"
          onmouseenter="this.style.background='rgba(255,255,255,.05)';this.style.borderColor='rgba(255,255,255,.1)'"
          onmouseleave="this.style.background='transparent';this.style.borderColor='transparent'"
        >
          🔗 <span style="font-size:12px">Share</span>
        </button>

        <!-- Call Clock badge -->
        <div class="art-clock-container" style="margin-left:auto">
          ${renderCallClock(id)}
        </div>

      </div>
    `;
  }

  /* Long press handlers */
  window._artLongPressStart = function(postId, btn, e) {
    if (_longPressTimer) clearTimeout(_longPressTimer);
    _longPressTimer = setTimeout(() => {
      e.preventDefault();
      showReactionTray(postId, btn);
    }, 450);
  };
  window._artLongPressCancel = function() {
    if (_longPressTimer) { clearTimeout(_longPressTimer); _longPressTimer = null; }
  };

  /* ─────────────────────────────────────────────────────────────────
     PATCH renderPostCard
  ───────────────────────────────────────────────────────────────────── */
  function patchRenderPostCard() {
    const orig = window.renderPostCard;
    if (!orig || orig.__reactionPatched) return;

    window.renderPostCard = function(post) {
      let html = orig.call(this, post);

      // Replace the old actions row with the new reaction row
      // The old row contains: togglePostLike + openPostDetail + sharePost
      const oldActionsPattern = /<div style="display:flex;align-items:center;gap:16px;margin-top:12px[^"]*">[^]*?<\/div>\s*<\/div>/;

      const newActions = `
        <div style="margin-top:12px;padding:0 2px">
          ${buildReactionRow(post)}
        </div>
      </div>`;

      // Try to replace old actions, fallback to appending
      if (oldActionsPattern.test(html)) {
        html = html.replace(oldActionsPattern, newActions);
      } else {
        // Inject before closing post card div
        html = html.replace('</div>', newActions + '</div>');
      }

      return html;
    };

    window.renderPostCard.__reactionPatched = true;
    console.log('%c[AfribConnect] 🎭 Post reactions patched into renderPostCard', 'color:#D4AF37;font-weight:700');
  }

  /* Also patch openPostDetail to show reactions in detail view */
  function patchPostDetail() {
    const orig = window.openPostDetail;
    if (!orig || orig.__reactionPatched) return;

    window.openPostDetail = function(postId) {
      orig.call(this, postId);

      // After detail opens, inject reaction row
      setTimeout(() => {
        const detail = document.getElementById('postDetailContent');
        if (!detail) return;

        const posts = window.getStylePosts ? window.getStylePosts() : [];
        const post  = posts.find(p => p.id === postId);
        if (!post) return;

        // Find and replace the like button in detail
        const likeBtn = detail.querySelector('[onclick*="togglePostLike"]');
        if (likeBtn) {
          const actionsRow = likeBtn.closest('div[style*="display:flex"]');
          if (actionsRow) {
            const newRow = document.createElement('div');
            newRow.style.cssText = 'margin:10px 16px';
            newRow.innerHTML = buildReactionRow(post);
            actionsRow.replaceWith(newRow);
          }
        }
      }, 80);
    };

    window.openPostDetail.__reactionPatched = true;
  }

  /* ─────────────────────────────────────────────────────────────────
     CSS INJECTION
  ───────────────────────────────────────────────────────────────────── */
  function injectCSS() {
    if (document.getElementById('afrib-reactions-css')) return;
    const s = document.createElement('style');
    s.id = 'afrib-reactions-css';
    s.textContent = `
      /* ── Reaction Tray ── */
      .afrib-reaction-tray { position:fixed; inset:0; z-index:99990; pointer-events:none; }
      .art-backdrop { position:absolute; inset:0; pointer-events:all; }

      .art-bubble-row {
        position:fixed;
        display:flex; align-items:flex-end; gap:6px;
        pointer-events:all;
        padding:10px 12px;
        background:rgba(10,6,18,.95);
        backdrop-filter:blur(20px) saturate(180%);
        -webkit-backdrop-filter:blur(20px) saturate(180%);
        border:1px solid rgba(255,255,255,.1);
        border-radius:50px;
        box-shadow:0 12px 48px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.05);
        z-index:99991;
        animation: artTrayIn .25s cubic-bezier(.34,1.56,.64,1) both;
      }

      @keyframes artTrayIn {
        from { opacity:0; transform:translateY(16px) scale(.85); }
        to   { opacity:1; transform:translateY(0) scale(1); }
      }
      @keyframes artFadeOut {
        to { opacity:0; transform:translateY(8px) scale(.92); }
      }

      /* Reaction bubble */
      .art-bubble {
        display:flex; flex-direction:column; align-items:center; gap:3px;
        background:none; border:none; cursor:pointer; padding:4px 6px;
        border-radius:16px; transition:all .18s cubic-bezier(.34,1.56,.64,1);
        animation: artBubbleIn .3s cubic-bezier(.34,1.56,.64,1) both;
        position:relative;
      }
      .art-bubble:hover {
        transform:scale(1.35) translateY(-6px);
        background:var(--react-color,rgba(212,175,55,.15))22;
      }
      .art-bubble:active { transform:scale(1.1) translateY(-3px); transition-duration:.08s; }

      .art-bubble-active {
        background:var(--react-color,rgba(212,175,55,.15))20 !important;
      }
      .art-bubble-active .art-emoji {
        filter:drop-shadow(0 0 8px var(--react-color));
      }

      @keyframes artBubbleIn {
        from { opacity:0; transform:scale(0) translateY(20px); }
        to   { opacity:1; transform:scale(1) translateY(0); }
      }

      .art-emoji { font-size:28px; line-height:1; filter:drop-shadow(0 2px 6px rgba(0,0,0,.5)); }
      .art-label {
        font-size:9px; font-weight:800; color:rgba(255,255,255,.7);
        letter-spacing:.3px; white-space:nowrap; text-transform:uppercase;
      }
      .art-bubble:hover .art-label { color:var(--react-color,#D4AF37); }

      /* ── Floating emoji animation ── */
      @keyframes floatEmojiUp {
        0%   { opacity:0;   transform:scale(0)   translateY(0); }
        20%  { opacity:1;   transform:scale(1.4) translateY(-10px); }
        100% { opacity:0;   transform:scale(.8)  translateY(-80px); }
      }

      /* ── Clock It / Call Clock pulse animations ── */
      @keyframes callClockPulsecalling {
        0%,100% { opacity:.8; transform:scale(1); }
        50%     { opacity:1;  transform:scale(1.04); }
      }
      @keyframes callClockPulseringing {
        0%,100% { opacity:.85; box-shadow:0 0 0 0 rgba(249,115,22,0); }
        50%     { opacity:1;   box-shadow:0 0 12px 4px rgba(249,115,22,.25); }
      }
      @keyframes callClockPulseviral {
        0%   { transform:scale(1);    box-shadow:0 0 0 0 rgba(239,68,68,.5); }
        50%  { transform:scale(1.06); box-shadow:0 0 16px 6px rgba(239,68,68,.25); }
        100% { transform:scale(1);    box-shadow:0 0 0 0 rgba(239,68,68,0); }
      }

      /* ── Modal animations ── */
      @keyframes artModalIn  { from { opacity:0; transform:translateY(40px); } to { opacity:1; transform:translateY(0); } }
      @keyframes artModalOut { from { opacity:1; transform:translateY(0);     } to { opacity:0; transform:translateY(40px); } }

      /* ── Tab active state ── */
      .bd-tab-active {
        background:rgba(255,255,255,.1) !important;
        border-color:rgba(255,255,255,.2) !important;
        color:#fff !important;
      }

      /* ── Reaction react button hover ── */
      .art-react-btn:hover {
        background:rgba(255,255,255,.05) !important;
        border-color:rgba(255,255,255,.1) !important;
        transform:translateY(-1px);
      }
      .art-react-btn:active { transform:scale(.95); transition-duration:.08s; }

      /* ── Scrollbar hide for breakdown modal ── */
      #afrib-reaction-breakdown > div { scrollbar-width:none; }
      #afrib-reaction-breakdown > div::-webkit-scrollbar { display:none; }

      /* ── Tip arrow (decorative) ── */
      .art-tip-arrow {
        position:fixed; width:10px; height:6px;
        border-left:5px solid transparent; border-right:5px solid transparent;
        border-top:6px solid rgba(10,6,18,.95);
        pointer-events:none; z-index:99992;
      }
    `;
    document.head.appendChild(s);
  }

  /* ─────────────────────────────────────────────────────────────────
     MIGRATE EXISTING LIKES → REACTIONS
     Converts old afrib_style_likes_* data to new reaction format
  ───────────────────────────────────────────────────────────────────── */
  function migrateLegacyLikes() {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key?.startsWith('afrib_style_likes_')) continue;
        const postId   = key.replace('afrib_style_likes_', '');
        const existing = getPostReactions(postId);
        // Only migrate if no reactions yet
        if (Object.keys(existing).length === 0) {
          const likes = JSON.parse(localStorage.getItem(key) || '[]');
          if (likes.length > 0) {
            savePostReactions(postId, { love: likes });
          }
        }
      }
    } catch(e) {}
  }

  /* ─────────────────────────────────────────────────────────────────
     RE-RENDER FEED WHEN REACTIONS CHANGE
  ───────────────────────────────────────────────────────────────────── */
  function patchRenderFeed() {
    // When style feed re-renders, wire double-tap on images
    const orig = window.renderStyleFeed;
    if (!orig || orig.__reactionFeedPatched) return;

    window.renderStyleFeed = function() {
      try { orig.apply(this, arguments); } catch(e) {}
      // Wire double-tap on post images for quick react
      setTimeout(() => {
        document.querySelectorAll('.style-post-card img').forEach(img => {
          if (img.__dblTapWired) return;
          img.__dblTapWired = true;
          img.addEventListener('dblclick', () => {
            const card   = img.closest('.style-post-card');
            const postId = card?.id?.replace('post-', '');
            if (postId) {
              const btn = card.querySelector('.art-react-btn');
              window.quickReact(postId, btn || img);
              // Heart burst effect on image
              _floatEmoji('❤️', img);
            }
          });
        });
      }, 200);
    };
    window.renderStyleFeed.__reactionFeedPatched = true;
  }

  /* ─────────────────────────────────────────────────────────────────
     INIT
  ───────────────────────────────────────────────────────────────────── */
  function init() {
    injectCSS();
    migrateLegacyLikes();
    patchRenderPostCard();
    patchPostDetail();
    patchRenderFeed();

    // Re-patch after other modules may overwrite renderPostCard
    setTimeout(() => {
      patchRenderPostCard();
      patchPostDetail();
      patchRenderFeed();
      // Trigger feed re-render to pick up new reaction UI
      if (typeof window.renderStyleFeed === 'function') {
        try { window.renderStyleFeed(); } catch(e) {}
      }
    }, 1500);

    console.log('%c[AfribConnect] 🎭 Post Reactions + Call Clock loaded', 'color:#D4AF37;font-weight:700');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 600));
  } else {
    setTimeout(init, 600);
  }
  window.addEventListener('load', () => setTimeout(init, 1200));

  // Expose for external use
  window.afribReactions = {
    get:   getPostReactions,
    apply: window.applyReaction,
    total: getTotalReactions,
    top:   getTopReactions,
    breakdown: window.showReactionBreakdown,
  };

})();
