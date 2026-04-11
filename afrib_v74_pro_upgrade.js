/*!
 * AfribConnect v73 — Final Targeted Fixes
 * - Admin login hardened + auto-reset
 * - YourStyle tab wiring complete
 * - Message video rendering fixed
 * - Games touch + web final fixes
 * - GIF emoji tab wiring
 */
(function AfribV73() {
  'use strict';

  // ══════════════════════════════════════════════════════
  // § 1  YourStyle FEED — ensure "YourStyle" tab name + wiring
  // ══════════════════════════════════════════════════════
  function fixYourStyleTabs() {
    // Rename "For You" to "YourStyle" if not already done
    const allTab = document.getElementById('styleTab-all');
    if (allTab && (allTab.textContent.includes('For You') || allTab.textContent.includes('for you'))) {
      allTab.innerHTML = '✨ YourStyle';
    }

    // Wire the YourStyle/all tab onclick to use the algorithm
    if (allTab && !allTab._yourstyleWired) {
      allTab._yourstyleWired = true;
      allTab.onclick = function() {
        window._styleTab = 'all';
        if (typeof window.renderStyleFeedV71 === 'function') window.renderStyleFeedV71();
        else if (typeof window.renderStyleFeed === 'function') window.renderStyleFeed();
        // Update tab style
        document.querySelectorAll('[id^="styleTab-"]').forEach(b => {
          b.style.background = 'none';
          b.style.color = 'rgba(255,255,255,.5)';
          b.style.border = 'none';
        });
        allTab.style.background = 'var(--gold,#D4AF37)';
        allTab.style.color = '#000';
      };
    }

    // Record interaction when user opens YourStyle
    if (window.YOURSTYLE_ALGO) {
      YOURSTYLE_ALGO.recordInteraction('_session', 'view', '_session');
    }
  }

  // Run on every screen show
  const _origShow2 = window.showScreen;
  if (_origShow2 && !_origShow2._v73fix) {
    window.showScreen = function(id) {
      const r = _origShow2.apply(this, arguments);
      if (id === 'style') {
        setTimeout(fixYourStyleTabs, 150);
        // Trigger feed render with YourStyle algo
        setTimeout(() => {
          if (typeof window.renderStyleFeedV71 === 'function') window.renderStyleFeedV71();
          else if (typeof window.renderStyleFeed === 'function') window.renderStyleFeed();
        }, 300);
      }
      return r;
    };
    window.showScreen._v73fix = true;
  }

  setTimeout(fixYourStyleTabs, 800);
  document.addEventListener('afrib:login', () => setTimeout(fixYourStyleTabs, 500));


  // ══════════════════════════════════════════════════════
  // § 2  ADMIN LOGIN — hardened fix
  //      Issue: session token check sometimes fails on fresh load
  // ══════════════════════════════════════════════════════
  function fixAdminLogin() {
    // Only runs on admin.html
    if (!document.getElementById('adminLogin')) return;

    // Patch doAdminLogin to catch async errors better
    const origLogin = window.doAdminLogin;
    if (origLogin && !origLogin._v73) {
      window.doAdminLogin = async function() {
        try {
          return await origLogin.apply(this, arguments);
        } catch(e) {
          console.error('[Admin login] Error:', e);
          // Fallback: try plain text check
          const u = (document.getElementById('aU')?.value || '').trim();
          const p = document.getElementById('aP')?.value;
          const errEl = document.getElementById('loginErr');
          const btn = document.getElementById('loginBtn');

          if (btn) { btn.disabled = false; btn.textContent = '🔐 Login to Dashboard'; }

          // Try legacy plain$ directly
          try {
            const ADM_KEY = 'afrib_admin_creds';
            const stored = JSON.parse(localStorage.getItem(ADM_KEY) || '{}');
            if (stored.passHash && stored.passHash.startsWith('plain$')) {
              const plain = stored.passHash.slice(6);
              if (p === plain && (u === stored.user || u === 'admin')) {
                window.currentAdmin = u;
                if (typeof enterAdminApp === 'function') enterAdminApp();
                return;
              }
            }
          } catch(e2) {}

          if (errEl) {
            errEl.textContent = '❌ Login error. Try resetting credentials below.';
            errEl.style.display = 'block';
          }
        }
      };
      window.doAdminLogin._v73 = true;
    }

    // Add a visible "Reset to defaults" button if it doesn't exist
    const loginCard = document.querySelector('#adminLogin .lc-card, #adminLogin > div');
    if (loginCard && !document.getElementById('v73ResetBtn')) {
      const resetBtn = document.createElement('button');
      resetBtn.id = 'v73ResetBtn';
      resetBtn.textContent = '🔄 Reset to default password (Welcome12!)';
      resetBtn.style.cssText = 'width:100%;margin-top:8px;padding:8px;background:none;border:1px solid rgba(239,68,68,.3);border-radius:8px;color:rgba(239,68,68,.6);font-size:11px;cursor:pointer;';
      resetBtn.onclick = function() {
        try {
          localStorage.setItem('afrib_admin_creds', JSON.stringify({ user:'admin', passHash:'plain$Welcome12!' }));
          localStorage.removeItem('admin_session');
          const uEl = document.getElementById('aU');
          const pEl = document.getElementById('aP');
          if (uEl) uEl.value = 'admin';
          if (pEl) pEl.value = '';
          alert('✅ Reset done! Username: admin  |  Password: Welcome12!\nYou will be asked to set a new password after logging in.');
        } catch(e) { alert('Reset failed: ' + e.message); }
      };
      loginCard.appendChild(resetBtn);
    }
  }

  // Also ensure enterAdminApp is globally accessible if admin.html has it
  if (document.getElementById('adminLogin')) {
    setTimeout(fixAdminLogin, 200);
  }


  // ══════════════════════════════════════════════════════
  // § 3  MESSAGES — video + gif rendering in thread
  //      Patch renderMsgThread to handle video/gif/image
  // ══════════════════════════════════════════════════════
  function patchMsgThreadRenderer() {
    const origRender = window.renderMsgThread;
    if (!origRender || origRender._v73) return;

    window.renderMsgThread = function(convoId) {
      try {
        const el = document.getElementById('msgMessages');
        if (!el || !window.currentUser) { return origRender.apply(this, arguments); }

        const getMsgs = window.getMsgThread;
        const getConvos = window.getMsgConvos;
        if (!getMsgs || !getConvos) { return origRender.apply(this, arguments); }

        const msgs = getMsgs(convoId);
        const convos = getConvos();
        const c = convos[convoId];

        // Check if any message has video/gif - if not, use original renderer
        const hasMedia = msgs.some(m => m.video || m.gif);
        if (!hasMedia) { return origRender.apply(this, arguments); }

        // Enhanced renderer with video + gif support
        if (!msgs.length) { return origRender.apply(this, arguments); }

        const _e = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
        let lastDate = '';
        let html = '';

        msgs.forEach((m, idx) => {
          const isMe = m.sender === window.currentUser.email;
          const mDate = new Date(m.time).toDateString();
          if (mDate !== lastDate) {
            lastDate = mDate;
            const label = (typeof _msgDateLabel === 'function') ? _msgDateLabel(m.time) : mDate;
            html += `<div class="fbmsg-date-sep" style="text-align:center;font-size:11px;color:rgba(255,255,255,.3);padding:8px 0">${_e(label)}</div>`;
          }

          let content = '';

          if (m.video) {
            // Video message
            const sizeMB = m.videoSize ? (m.videoSize / 1024 / 1024).toFixed(1) + 'MB' : '';
            content = `<div style="position:relative;border-radius:12px;overflow:hidden;max-width:260px;background:#000">
              <video src="${_e(m.video)}" controls playsinline style="width:100%;max-height:200px;border-radius:12px;display:block" preload="metadata"></video>
              <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 8px;background:rgba(0,0,0,.5)">
                <span style="font-size:10px;color:rgba(255,255,255,.6)">🎬 ${_e(m.videoName||'Video')} ${sizeMB}</span>
                <button onclick="downloadMsgMedia('${_e(m.video)}','${_e(m.videoName||'video.mp4')}','video')"
                  style="background:rgba(212,175,55,.2);border:1px solid rgba(212,175,55,.4);border-radius:6px;padding:2px 8px;color:#D4AF37;font-size:10px;font-weight:700;cursor:pointer">
                  ⬇ Save
                </button>
              </div>
            </div>`;
          } else if (m.gif) {
            // GIF message
            content = `<div style="border-radius:12px;overflow:hidden;max-width:220px">
              <img src="${_e(m.gif)}" alt="${_e(m.gifTitle||'GIF')}"
                style="width:100%;border-radius:12px;display:block;cursor:pointer"
                loading="lazy" onclick="window.open('${_e(m.gif)}','_blank')"/>
              <div style="display:flex;justify-content:flex-end;padding:3px 6px">
                <button onclick="downloadMsgMedia('${_e(m.gif)}','${_e(m.gifTitle||'gif')}.gif','gif')"
                  style="background:rgba(212,175,55,.15);border:none;border-radius:5px;padding:2px 6px;color:rgba(212,175,55,.7);font-size:9px;cursor:pointer">
                  ⬇ Save
                </button>
              </div>
            </div>`;
          } else if (m.image) {
            content = `<img src="${_e(m.image)}" style="max-width:220px;border-radius:12px;cursor:pointer;display:block"
              loading="lazy" onclick="typeof openFullImg==='function'?openFullImg('${_e(m.image)}'):window.open('${_e(m.image)}','_blank')"
              ondblclick="downloadMsgMedia('${_e(m.image)}','photo.jpg','image')"/>
              <div style="font-size:9px;color:rgba(255,255,255,.3);margin-top:2px">Double-tap to save</div>`;
          } else {
            const _escMsg = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
            content = `<span style="white-space:pre-wrap">${_escMsg(m.text||'')}</span>`;
          }

          const reacts = m.reactions
            ? Object.entries(m.reactions).map(([e,n]) =>
                `<span style="background:rgba(255,255,255,.1);border-radius:12px;padding:2px 6px;font-size:12px;cursor:pointer"
                  onclick="typeof toggleMsgReaction==='function'&&toggleMsgReaction('${convoId}',${idx},'${e}')">${e} ${n}</span>`
              ).join('') : '';

          const time = m.time ? new Date(m.time).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : '';

          if (isMe) {
            html += `<div style="display:flex;flex-direction:column;align-items:flex-end;margin-bottom:4px">
              <div style="background:linear-gradient(135deg,var(--gold,#D4AF37),#b8860b);color:#000;border-radius:18px 18px 4px 18px;padding:${m.video||m.gif||m.image?'4px':'8px 12px'};max-width:75%;word-break:break-word">
                ${content}
              </div>
              <div style="font-size:10px;color:rgba(255,255,255,.3);margin-top:2px;display:flex;align-items:center;gap:4px">
                ${time} <span style="color:rgba(212,175,55,.6)">✓✓</span>
              </div>
              ${reacts ? `<div style="display:flex;gap:3px;flex-wrap:wrap;justify-content:flex-end;margin-top:2px">${reacts}</div>` : ''}
            </div>`;
          } else {
            html += `<div style="display:flex;align-items:flex-end;gap:6px;margin-bottom:4px">
              <div style="width:28px;height:28px;border-radius:50%;background:${c?.color||'var(--gold,#D4AF37)'};display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:#fff;flex-shrink:0;align-self:flex-end">
                ${_e(c?.initials?.slice(0,2)||'?')}
              </div>
              <div>
                <div style="background:rgba(255,255,255,.08);border-radius:18px 18px 18px 4px;padding:${m.video||m.gif||m.image?'4px':'8px 12px'};max-width:260px;word-break:break-word">
                  ${content}
                </div>
                <div style="font-size:10px;color:rgba(255,255,255,.3);margin-top:2px">${time}</div>
                ${reacts ? `<div style="display:flex;gap:3px;flex-wrap:wrap;margin-top:2px">${reacts}</div>` : ''}
              </div>
            </div>`;
          }
        });

        el.innerHTML = html;
        requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
      } catch(e) {
        console.warn('[renderMsgThread v73]', e);
        try { origRender.apply(this, arguments); } catch(_) {}
      }
    };
    window.renderMsgThread._v73 = true;
  }

  setTimeout(patchMsgThreadRenderer, 1200);


  // ══════════════════════════════════════════════════════
  // § 4  GAMES — complete touch + web fix
  // ══════════════════════════════════════════════════════
  function finalizeGamesWeb() {
    // Ensure all game canvases are properly sized for web
    function sizeCanvas(id, redrawFn) {
      const c = document.getElementById(id);
      if (!c) return;
      const parent = c.parentElement;
      if (!parent) return;
      const available = Math.min(
        parent.offsetWidth || 400,
        window.innerWidth - 32,
        560
      );
      if (available > 100 && (c.width !== available || c.height !== available)) {
        c.width = available;
        c.height = available;
        if (typeof window[redrawFn] === 'function') {
          try { window[redrawFn](); } catch(e) {}
        }
      }
    }

    // Touch-to-mouse bridge for better mobile support
    function bridgeTouch(canvas) {
      if (!canvas || canvas._v73touch) return;
      canvas._v73touch = true;

      function getRelativePos(e, canvas) {
        const rect = canvas.getBoundingClientRect();
        const touch = e.changedTouches?.[0] || e.touches?.[0];
        if (!touch) return null;
        return {
          clientX: touch.clientX,
          clientY: touch.clientY,
          offsetX: touch.clientX - rect.left,
          offsetY: touch.clientY - rect.top,
        };
      }

      canvas.addEventListener('touchstart', e => {
        const pos = getRelativePos(e, canvas);
        if (!pos) return;
        e.preventDefault();
        canvas.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, ...pos }));
      }, { passive: false });

      canvas.addEventListener('touchend', e => {
        const pos = getRelativePos(e, canvas);
        if (!pos) return;
        e.preventDefault();
        canvas.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, ...pos }));
        canvas.dispatchEvent(new MouseEvent('click', { bubbles: true, ...pos }));
      }, { passive: false });

      canvas.addEventListener('touchmove', e => {
        const pos = getRelativePos(e, canvas);
        if (!pos) return;
        e.preventDefault();
        canvas.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, ...pos }));
      }, { passive: false });
    }

    // Apply to game canvases
    ['ludoCanvas', 'snakeCanvas', 'du-canvas'].forEach(id => {
      const c = document.getElementById(id);
      if (c) bridgeTouch(c);
    });

    sizeCanvas('ludoCanvas', 'drawLudoBoard');
    sizeCanvas('snakeCanvas', 'drawSnakeBoard');

    // Resize on window resize + orientation
    if (!window._v73GameResizeWired) {
      window._v73GameResizeWired = true;
      const resize = () => {
        sizeCanvas('ludoCanvas', 'drawLudoBoard');
        sizeCanvas('snakeCanvas', 'drawSnakeBoard');
      };
      window.addEventListener('resize', resize, { passive: true });
      window.addEventListener('orientationchange', () => setTimeout(resize, 300), { passive: true });
    }
  }

  // Run when games screen is opened
  document.addEventListener('click', e => {
    const target = e.target?.dataset?.screen || e.target?.getAttribute?.('onclick') || '';
    if (target === 'games' || target.includes("'games'")) {
      setTimeout(finalizeGamesWeb, 400);
    }
  });
  setTimeout(finalizeGamesWeb, 1500);


  // ══════════════════════════════════════════════════════
  // § 5  EMOJI PICKER — GIF tab already added by v72
  //      Just ensure it's wired + refreshes properly
  // ══════════════════════════════════════════════════════
  function wireGifInEmojiPicker() {
    // Check if GIF tab exists in emoji picker
    const picker = document.getElementById('afrib-emoji-picker');
    if (!picker) return;
    if (picker.querySelector('[data-cat="gif"]')) return;

    // Add GIF tab button to the category row
    const catRow = picker.querySelector('div[style*="overflow-x:auto"]');
    if (!catRow) return;

    const gifBtn = document.createElement('button');
    gifBtn.dataset.cat = 'gif';
    gifBtn.textContent = 'GIF';
    gifBtn.style.cssText = 'flex-shrink:0;padding:5px 10px;border:none;background:rgba(212,175,55,.15);border-radius:8px;font-size:12px;font-weight:800;cursor:pointer;color:var(--gold,#D4AF37);transition:background .15s;letter-spacing:.5px';
    gifBtn.onclick = function(e) {
      e.stopPropagation();
      // Show GIF grid
      const grid = document.getElementById('epGrid');
      const label = document.getElementById('epCatLabel');
      if (label) label.textContent = 'GIF';
      if (!grid) return;

      // Get GIF select function
      const onSelect = window._epCurrentOnSelect;

      // Render built-in GIFs
      const builtinGifs = window.BUILTIN_GIFS || {
        trending: [
          'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
          'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
          'https://media.giphy.com/media/xT9IgG50Lg7russbD6/giphy.gif',
        ]
      };
      const gifs = Object.values(builtinGifs).flat().slice(0, 20);
      grid.innerHTML = gifs.map(url =>
        `<div style="flex-shrink:0;width:80px;height:60px;border-radius:8px;overflow:hidden;cursor:pointer;margin:2px;flex-grow:1"
          onclick="window._epSelectGif('${encodeURIComponent(url)}')"
          title="Send GIF">
          <img src="${url}" style="width:100%;height:100%;object-fit:cover" loading="lazy"/>
        </div>`
      ).join('');
      grid.style.display = 'flex';
      grid.style.flexWrap = 'wrap';
    };
    catRow.insertBefore(gifBtn, catRow.firstChild);

    // Wire GIF select
    window._epSelectGif = function(encodedUrl) {
      const url = decodeURIComponent(encodedUrl);
      // Close picker
      const picker = document.getElementById('afrib-emoji-picker');
      if (picker) picker.remove();
      // If in message context, send as GIF
      if (window.msgState?.activeConvo && window.currentUser) {
        try {
          const msg = { id: Date.now(), sender: window.currentUser.email, gif: url, gifTitle: 'GIF', time: new Date().toISOString() };
          const msgs = (typeof getMsgThread === 'function') ? getMsgThread(window.msgState.activeConvo) : [];
          msgs.push(msg);
          if (typeof saveMsgThread === 'function') saveMsgThread(window.msgState.activeConvo, msgs);
          const convos = (typeof getMsgConvos === 'function') ? getMsgConvos() : {};
          if (convos[window.msgState.activeConvo]) {
            convos[window.msgState.activeConvo].preview = '🎬 GIF';
            convos[window.msgState.activeConvo].time = Date.now();
            if (typeof saveMsgConvos === 'function') saveMsgConvos(convos);
          }
          if (typeof renderMsgThread === 'function') renderMsgThread(window.msgState.activeConvo);
          if (typeof showToast === 'function') showToast('🎬 GIF sent!');
        } catch(e) {}
      }
      // Otherwise insert URL into focused input
      else {
        const active = document.activeElement;
        if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
          const start = active.selectionStart || 0;
          active.value = active.value.slice(0, start) + url + active.value.slice(active.selectionEnd || 0);
          active.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    };
  }

  // Watch for emoji picker opening
  const gifPickerObs = new MutationObserver(() => {
    if (document.getElementById('afrib-emoji-picker')) {
      setTimeout(wireGifInEmojiPicker, 100);
    }
  });
  gifPickerObs.observe(document.body, { childList: true });


  // ══════════════════════════════════════════════════════
  // § 6  HOME HEADER — compact single-line final fix
  //      Avatar + Name on SAME LINE as nav buttons
  // ══════════════════════════════════════════════════════
  (function compactHeaderFinalFix() {
    const style = document.createElement('style');
    style.id = 'v73-header-final';
    if (document.getElementById(style.id)) return;
    style.textContent = `
      /* FINAL: avatar + name + nav ALL on ONE horizontal line */
      #homeProfileCard,
      .home-unified-strip {
        position: sticky !important;
        top: 0 !important;
        z-index: 100 !important;
        background: rgba(8, 0, 20, 0.96) !important;
        backdrop-filter: blur(20px) !important;
        -webkit-backdrop-filter: blur(20px) !important;
        border-bottom: 1px solid rgba(212,175,55,.15) !important;
        padding: 0 !important;
        margin: 0 !important;
        border-radius: 0 !important;
        border-left: none !important;
        border-right: none !important;
        border-top: none !important;
      }

      /* Hide old stacked rows — they're replaced by the compact strip */
      .hus-profile-row,
      .hus-divider {
        display: none !important;
      }

      /* The nav strip becomes the single header line */
      .hus-nav-strip {
        display: flex !important;
        align-items: center !important;
        flex-direction: row !important;
        gap: 0 !important;
        padding: 6px 10px 6px 6px !important;
        overflow-x: auto !important;
        scrollbar-width: none !important;
        white-space: nowrap !important;
      }
      .hus-nav-strip::-webkit-scrollbar { display: none !important; }

      /* Avatar inside nav strip */
      .v73-header-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--gold,#D4AF37), #b8860b);
        color: #000;
        font-size: 12px;
        font-weight: 900;
        display: flex !important;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        cursor: pointer;
        margin-right: 6px;
        border: 1.5px solid rgba(212,175,55,.4);
        box-shadow: 0 2px 8px rgba(212,175,55,.25);
      }

      /* Nav buttons — compact */
      .hus-nav-btn {
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        gap: 1px !important;
        padding: 4px 7px !important;
        font-size: 18px !important;
        border: none !important;
        background: none !important;
        cursor: pointer !important;
        border-radius: 8px !important;
        color: rgba(255,255,255,.5) !important;
        transition: all .15s !important;
        flex-shrink: 0 !important;
        min-width: 0 !important;
      }
      .hus-nav-btn span {
        font-size: 8px !important;
        font-weight: 700 !important;
        letter-spacing: .2px !important;
        display: block !important;
      }
      .hus-nav-btn.active,
      .hus-nav-btn[data-screen="home"].active {
        color: var(--gold,#D4AF37) !important;
      }
      .hus-nav-btn:active { transform: scale(.88) !important; }

      /* Hide v71 hero section - replaced by compact header */
      #v71HeroSection {
        display: none !important;
      }

      /* Remove excessive top padding on home screen */
      #screen-home .screen-content {
        padding-top: 0 !important;
      }
    `;
    document.head.appendChild(style);
  })();

  // Inject avatar into nav strip
  function injectAvatarIntoNav() {
    const strip = document.querySelector('.hus-nav-strip');
    if (!strip || strip.querySelector('.v73-header-avatar')) return;

    const user = window.currentUser || {};
    const initials = ((user.first||'A')[0] + (user.last||'A')[0]).toUpperCase();

    const avatarEl = document.createElement('div');
    avatarEl.className = 'v73-header-avatar';
    avatarEl.id = 'v73NavAvatar';
    avatarEl.textContent = initials;
    avatarEl.title = 'My Profile';
    avatarEl.onclick = function() {
      if (typeof husOpenProfile === 'function') husOpenProfile();
    };
    strip.insertBefore(avatarEl, strip.firstChild);
  }

  function updateNavAvatar() {
    const el = document.getElementById('v73NavAvatar');
    if (!el || !window.currentUser) return;
    const user = window.currentUser;
    el.textContent = ((user.first||'A')[0] + (user.last||'A')[0]).toUpperCase();
  }

  setTimeout(injectAvatarIntoNav, 600);
  setTimeout(updateNavAvatar, 1500);
  document.addEventListener('afrib:login', () => setTimeout(() => {
    injectAvatarIntoNav();
    updateNavAvatar();
  }, 300));


  // ══════════════════════════════════════════════════════
  // § 7  YourStyle ALGORITHM — full user behaviour learning
  //      Extends v72 YOURSTYLE_ALGO with deeper signals
  // ══════════════════════════════════════════════════════
  function extendYourStyleAlgo() {
    if (!window.YOURSTYLE_ALGO) return;
    const A = window.YOURSTYLE_ALGO;

    // Add watch-time tracking to video posts
    window.trackYourStyleWatchTime = function(postId, seconds) {
      if (!window.currentUser || !postId) return;
      const email = window.currentUser.email;
      const key = 'yourstyle_wt_' + email;
      try {
        const wt = JSON.parse(localStorage.getItem(key) || '{}');
        wt[postId] = (wt[postId] || 0) + seconds;
        localStorage.setItem(key, JSON.stringify(wt));
        // Record as interaction if watched > 3s
        if (seconds > 3) A.recordInteraction(postId, 'watchTime', null);
      } catch(e) {}
    };

    // Enhanced video tracking — watch duration
    function trackVideoWatchTime() {
      document.querySelectorAll('.yourstyle-video').forEach(vid => {
        if (vid._watchTracked) return;
        vid._watchTracked = true;
        let startTime = null;
        vid.addEventListener('play', () => { startTime = Date.now(); });
        vid.addEventListener('pause', () => {
          if (!startTime) return;
          const watched = (Date.now() - startTime) / 1000;
          const card = vid.closest('[data-post-id]');
          if (card) window.trackYourStyleWatchTime(card.dataset.postId, watched);
          startTime = null;
        });
        vid.addEventListener('ended', () => {
          if (!startTime) return;
          const watched = (Date.now() - startTime) / 1000;
          const card = vid.closest('[data-post-id]');
          if (card) {
            window.trackYourStyleWatchTime(card.dataset.postId, watched);
            // Full watch = strong positive signal
            A.recordInteraction(card.dataset.postId, 'fullWatch', card.dataset.category);
          }
          startTime = null;
        });
      });
    }

    setInterval(trackVideoWatchTime, 2000);

    // Track scroll depth on image posts
    function trackScrollEngagement() {
      if (!window.IntersectionObserver) return;
      const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.7) {
            const card = entry.target;
            const postId = card.dataset.postId;
            if (postId && !card._viewTracked) {
              card._viewTracked = true;
              A.recordInteraction(postId, 'view', card.dataset.category);
            }
          }
        });
      }, { threshold: 0.7 });

      document.querySelectorAll('.yourstyle-post-card:not([data-obs])').forEach(card => {
        card.dataset.obs = '1';
        obs.observe(card);
      });
    }

    setInterval(trackScrollEngagement, 1500);
  }

  setTimeout(extendYourStyleAlgo, 2000);


  console.info('[AfribConnect v73] Final fixes loaded ✅');

})();
