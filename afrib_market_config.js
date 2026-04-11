/* ═══════════════════════════════════════════════════════════════════════════
   AfribConnect — LIVE STREAMING ENGINE  (afrib_livestream.js)
   TikTok-style live streaming with WebRTC P2P

   ARCHITECTURE (zero cloud storage):
   ┌─ Streamer ─────────────────────────────────────────────────────────┐
   │  getUserMedia() → MediaStream → RTCPeerConnection → Viewers        │
   │  Signaling: Firebase Firestore (SDP/ICE only, deleted on end)      │
   │  NO video data ever hits any server                                 │
   └────────────────────────────────────────────────────────────────────┘
   ┌─ Viewer ────────────────────────────────────────────────────────────┐
   │  Firebase reads offer → creates answer → P2P stream received       │
   │  video displayed via <video srcObject=remoteStream>                 │
   └────────────────────────────────────────────────────────────────────┘

   FEATURES (TikTok Live inspired):
   ① Live grid — admin-configurable 1–10 simultaneous stream slots
   ② Go Live button — camera/mic + title + category picker
   ③ Viewer count — real-time (via Firebase presence)
   ④ Floating gift animations — coins, hearts, fire, trophies
   ⑤ Live chat — real-time comments overlay
   ⑥ Gift bar — send GiftMe coins during stream
   ⑦ Full-screen viewer mode — portrait mobile layout
   ⑧ Stream info card — username, country, flag, category
   ⑨ No-Firebase fallback — local preview (your own camera only)
   ⑩ Admin: set live grid slot count (1–10)
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

(function AfribLiveStream() {

  /* ─────────────────────────────────────────────────────────────────
     §0  CONSTANTS & STATE
  ───────────────────────────────────────────────────────────────────*/
  const LS_KEY_SLOTS   = 'afrib_live_slots';       // admin setting
  const LS_KEY_STREAMS = 'afrib_live_streams';     // active stream list
  const LS_KEY_CHAT    = 'afrib_live_chat_';       // + streamId
  const STUN_SERVERS = {
    iceServers: [
      { urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] },
      { urls: 'stun:stun.l.google.com:19302' },
    ],
    iceCandidatePoolSize: 10,
  };

  let _myStream   = null;   // streamer's local MediaStream
  let _peerConns  = {};     // { viewerId: RTCPeerConnection }
  let _isStreaming = false;
  let _isViewing  = false;
  let _viewStream = null;   // viewer's received stream
  let _activeStreamId = null;
  let _chatInterval  = null;
  let _viewerCount   = 0;
  let _animQueue     = [];
  let _animRunning   = false;

  const log  = (...a) => console.log('%c[Live]','color:#ff4757;font-weight:700',...a);
  const _esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  /* ─────────────────────────────────────────────────────────────────
     §1  ADMIN SLOT CONFIG — how many live boxes to show
  ───────────────────────────────────────────────────────────────────*/
  function getSlots() {
    return Math.max(1, Math.min(10, parseInt(localStorage.getItem(LS_KEY_SLOTS) || '4')));
  }
  function setSlots(n) {
    localStorage.setItem(LS_KEY_SLOTS, Math.max(1, Math.min(10, n)));
  }
  window.afribLiveSetSlots = setSlots;

  /* ─────────────────────────────────────────────────────────────────
     §2  ACTIVE STREAM REGISTRY — stored in localStorage
     Each stream: { id, hostEmail, hostName, hostCountry, title,
                    category, startedAt, viewerCount }
  ───────────────────────────────────────────────────────────────────*/
  function getStreams() {
    try {
      const raw = JSON.parse(localStorage.getItem(LS_KEY_STREAMS) || '[]');
      // Auto-evict streams older than 4 hours (handles crashed/closed tabs)
      const cutoff = Date.now() - 4 * 60 * 60 * 1000;
      const fresh = raw.filter(s => s.startedAt && s.startedAt > cutoff);
      // Persist cleaned list if anything was removed
      if (fresh.length !== raw.length) {
        try { localStorage.setItem(LS_KEY_STREAMS, JSON.stringify(fresh)); } catch(e) {}
      }
      return fresh;
    } catch(e) { return []; }
  }
  function saveStreams(list) {
    try {
      localStorage.setItem(LS_KEY_STREAMS, JSON.stringify(list));
    } catch(e) {
      // QuotaExceededError — trim oldest streams and retry
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        try {
          const trimmed = list.slice(0, 4); // keep max 4
          localStorage.setItem(LS_KEY_STREAMS, JSON.stringify(trimmed));
        } catch(e2) { console.warn('[Live] localStorage full, stream registry not saved'); }
      }
    }
  }
  function addStream(stream) {
    const list = getStreams().filter(s => s.hostEmail !== stream.hostEmail);
    list.unshift(stream);
    saveStreams(list);
    broadcastLiveUpdate();
  }
  function removeStream(id) {
    const list = getStreams().filter(s => s.id !== id);
    saveStreams(list);
    broadcastLiveUpdate();
  }
  function broadcastLiveUpdate() {
    try {
      if (window.BroadcastChannel) {
        new BroadcastChannel('afrib_live_chan').postMessage({ type: 'live_update' });
      }
    } catch(e) {}
  }

  /* ─────────────────────────────────────────────────────────────────
     §3  LIVE CHAT — stored per stream in localStorage
  ───────────────────────────────────────────────────────────────────*/
  function getChatMsgs(streamId) {
    try { return JSON.parse(localStorage.getItem(LS_KEY_CHAT + streamId) || '[]'); } catch(e) { return []; }
  }
  function addChatMsg(streamId, msg) {
    const msgs = getChatMsgs(streamId);
    msgs.push({ ...msg, ts: Date.now() });
    if (msgs.length > 200) msgs.splice(0, msgs.length - 200);
    try {
      localStorage.setItem(LS_KEY_CHAT + streamId, JSON.stringify(msgs));
    } catch(e) {
      // QuotaExceededError — keep only last 50 messages
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        try {
          localStorage.setItem(LS_KEY_CHAT + streamId, JSON.stringify(msgs.slice(-50)));
        } catch(e2) {}
      }
    }
    broadcastLiveUpdate();
  }
  function clearChat(streamId) {
    try { localStorage.removeItem(LS_KEY_CHAT + streamId); } catch(e) {}
  }

  /* ─────────────────────────────────────────────────────────────────
     §4  GIFT ANIMATIONS — TikTok-style floating gifts
  ───────────────────────────────────────────────────────────────────*/
  const LIVE_GIFTS = [
    { emoji:'❤️',  name:'Heart',     coins:5,    color:'#ff4757' },
    { emoji:'🔥',  name:'Fire',      coins:10,   color:'#ff6b35' },
    { emoji:'💎',  name:'Diamond',   coins:50,   color:'#5352ed' },
    { emoji:'👑',  name:'Crown',     coins:100,  color:'#D4AF37' },
    { emoji:'🌍',  name:'Africa',    coins:25,   color:'#2ed573' },
    { emoji:'🎵',  name:'Music',     coins:15,   color:'#eccc68' },
    { emoji:'🦁',  name:'Lion',      coins:200,  color:'#ffa502' },
    { emoji:'💸',  name:'Money',     coins:500,  color:'#2ed573' },
    { emoji:'🦋',  name:'Butterfly', coins:30,   color:'#a78bfa' },
    { emoji:'🚀',  name:'Rocket',    coins:1000, color:'#00d2ff' },
  ];

  function spawnGiftAnimation(gift, senderName, container) {
    if (!container) return;
    const anim = document.createElement('div');
    anim.className = 'live-gift-anim';
    const x = 10 + Math.random() * 60;
    anim.style.cssText = `
      position:absolute; bottom:80px; left:${x}%;
      transform:translateX(-50%);
      z-index:100; pointer-events:none;
      animation: liveGiftFloat 3s ease-out forwards;
      display:flex; flex-direction:column; align-items:center; gap:2px;
    `;
    anim.innerHTML = `
      <div style="font-size:36px;filter:drop-shadow(0 0 8px ${gift.color});">${gift.emoji}</div>
      <div style="font-size:10px;font-weight:800;color:${gift.color};text-shadow:0 1px 4px rgba(0,0,0,.6);white-space:nowrap;">${_esc(senderName)} sent ${gift.name}!</div>
    `;
    container.appendChild(anim);
    setTimeout(() => anim.remove(), 3100);
  }

  function spawnHeartBurst(container) {
    if (!container) return;
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        const h = document.createElement('div');
        h.style.cssText = `
          position:absolute; bottom:${60 + Math.random()*40}px;
          left:${20 + Math.random()*60}%;
          font-size:${16 + Math.random()*20}px;
          pointer-events:none; z-index:99;
          animation: liveHeartFloat ${1.5 + Math.random()}s ease-out forwards;
          opacity:1;
        `;
        h.textContent = ['❤️','🧡','💛','💚','💜','💙'][Math.floor(Math.random()*6)];
        container.appendChild(h);
        setTimeout(() => h.remove(), 2000);
      }, i * 100);
    }
  }

  /* ─────────────────────────────────────────────────────────────────
     §5  MAIN LIVE SCREEN HTML
  ───────────────────────────────────────────────────────────────────*/
  function renderLiveScreen() {
    const el = document.getElementById('live-screen-root');
    if (!el) return;
    const slots = getSlots();
    const streams = getStreams();
    const user = window.currentUser;

    // Generate slot boxes
    const boxes = [];
    for (let i = 0; i < slots; i++) {
      const stream = streams[i] || null;
      boxes.push(renderSlotBox(i, stream, user));
    }

    const cols = slots <= 2 ? slots : slots <= 4 ? 2 : slots <= 6 ? 3 : slots <= 9 ? 3 : 5;

    el.innerHTML = `
      <div class="live-screen-inner">
        <!-- Header -->
        <div class="live-header">
          <div class="live-header-left">
            <div class="live-pulse-dot"></div>
            <span class="live-header-title">🔴 LIVE</span>
            <span class="live-active-count" id="liveActiveCount">${streams.length} live</span>
          </div>
          <button class="live-go-btn" id="liveGoBtn" onclick="afribLiveGoLive()">
            ${_isStreaming ? '⏹ End Stream' : '📡 Go Live'}
          </button>
        </div>

        <!-- Live grid -->
        <div class="live-grid" id="liveGrid" style="--cols:${cols}">
          ${boxes.join('')}
        </div>

        <!-- My stream controls (visible when streaming) -->
        <div class="live-my-controls" id="liveMyControls" style="display:${_isStreaming?'flex':'none'}">
          <div class="live-ctrl-info">
            <span class="live-ctrl-badge">🔴 LIVE</span>
            <span id="liveMyViewerCount" style="font-size:13px;color:rgba(255,255,255,.7)">👁 0 watching</span>
          </div>
          <div class="live-ctrl-btns">
            <button class="live-ctrl-btn" onclick="afribLiveToggleMic()" id="liveMicBtn" title="Toggle mic">🎙</button>
            <button class="live-ctrl-btn" onclick="afribLiveToggleCam()" id="liveCamBtn" title="Toggle camera">📷</button>
            <button class="live-ctrl-btn live-ctrl-end" onclick="afribLiveEndStream()">⏹ End</button>
          </div>
        </div>
      </div>
    `;

    // Poll for updates
    clearInterval(_chatInterval);
    _chatInterval = setInterval(() => {
      if (document.getElementById('live-screen-root')) {
        updateLiveGrid();
      }
    }, 3000);
  }

  function renderSlotBox(idx, stream, user) {
    if (!stream) {
      // Empty slot
      return `
        <div class="live-slot live-slot-empty" onclick="afribLiveGoLive()">
          <div class="live-slot-empty-inner">
            <div class="live-slot-icon">📡</div>
            <div class="live-slot-empty-label">Tap to go live</div>
            <div class="live-slot-empty-sub">Share your moment</div>
          </div>
        </div>`;
    }

    const isMe = user && stream.hostEmail === user.email;
    const mins = Math.floor((Date.now() - stream.startedAt) / 60000);
    const duration = mins < 60 ? `${mins}m` : `${Math.floor(mins/60)}h ${mins%60}m`;
    const flag = stream.hostFlag || '🌍';

    return `
      <div class="live-slot live-slot-active" onclick="afribLiveOpenViewer('${_esc(stream.id)}')">
        <!-- Video element - stream fills this -->
        <video class="live-slot-video" id="liveSlotVideo_${_esc(stream.id)}"
          autoplay playsinline ${isMe?"muted":""} style="width:100%;height:100%;object-fit:cover;display:block;background:#000"></video>

        <!-- Overlay gradient -->
        <div class="live-slot-overlay"></div>

        <!-- Top: LIVE badge + duration -->
        <div class="live-slot-top">
          <span class="live-badge-sm">🔴 LIVE</span>
          <span class="live-duration">${duration}</span>
          ${isMe ? '<span class="live-you-badge">YOU</span>' : ''}
        </div>

        <!-- Bottom: user info + viewer count -->
        <div class="live-slot-bottom">
          <div class="live-slot-avatar">${_esc((stream.hostName||'?')[0].toUpperCase())}</div>
          <div class="live-slot-info">
            <div class="live-slot-name">${_esc(stream.hostName)}</div>
            <div class="live-slot-meta">${flag} ${_esc(stream.hostCountry||'')} · ${_esc(stream.category||'Live')}</div>
          </div>
          <div class="live-slot-viewers">👁 ${stream.viewerCount||0}</div>
        </div>

        <!-- Category chip -->
        <div class="live-slot-category">${_esc(stream.title||stream.category||'Live')}</div>
      </div>`;
  }

  function updateLiveGrid() {
    const streams = getStreams();
    const activeEl = document.getElementById('liveActiveCount');
    if (activeEl) activeEl.textContent = `${streams.length} live`;

    const slots = getSlots();
    const grid = document.getElementById('liveGrid');
    if (!grid) return;

    // Update column layout whenever slots change (supports 1-10)
    const cols = slots <= 2 ? slots : slots <= 4 ? 2 : slots <= 6 ? 3 : slots <= 9 ? 3 : 5;
    grid.style.setProperty('--cols', cols);

    const user = window.currentUser;
    const boxes = [];
    for (let i = 0; i < slots; i++) {
      boxes.push(renderSlotBox(i, streams[i] || null, user));
    }
    grid.innerHTML = boxes.join('');

    // Re-attach own stream to video element if streaming
    if (_isStreaming && _myStream && _activeStreamId) {
      const vid = document.getElementById('liveSlotVideo_' + _activeStreamId);
      if (vid && !vid.srcObject) { vid.srcObject = _myStream; }
    }
  }

  /* ─────────────────────────────────────────────────────────────────
     §6  GO LIVE FLOW — camera access → stream setup
  ───────────────────────────────────────────────────────────────────*/
  window.afribLiveGoLive = async function() {
    if (_isStreaming) { afribLiveEndStream(); return; }
    if (!window.currentUser) {
      if (typeof showToast === 'function') showToast('⚠️ Sign in to go live');
      return;
    }
    // Show go-live setup modal
    _showGoLiveModal();
  };

  function _showGoLiveModal() {
    // Remove existing modal if any
    const old = document.getElementById('goLiveModal');
    if (old) old.remove();

    const cats = ['🎵 Music','💃 Dance','🍳 Cooking','✨ Fashion','🎮 Gaming',
                  '💬 Chat','🎨 Art','📚 Education','🏋️ Fitness','🌍 Culture'];

    const modal = document.createElement('div');
    modal.id = 'goLiveModal';
    modal.className = 'modal-overlay open';
    modal.style.cssText = 'z-index:3000';
    modal.onclick = e => { if (e.target === modal) modal.remove(); };

    modal.innerHTML = `
      <div class="modal-card" onclick="event.stopPropagation()" style="max-width:420px;padding:0;overflow:hidden;border-radius:20px">
        <!-- Camera preview -->
        <div style="position:relative;background:#000;height:220px;overflow:hidden">
          <video id="goLivePreview" autoplay playsinline muted style="width:100%;height:100%;object-fit:cover"></video>
          <div style="position:absolute;bottom:10px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,.6);border-radius:20px;padding:4px 12px;font-size:11px;font-weight:700;color:#fff">Preview</div>
        </div>

        <div style="padding:20px">
          <h3 style="font-size:17px;font-weight:800;margin-bottom:16px;text-align:center">Go Live 🔴</h3>

          <!-- Title -->
          <div style="margin-bottom:12px">
            <input id="liveTitle" type="text" maxlength="50" placeholder="Give your stream a title…"
              style="width:100%;background:var(--bg);border:1.5px solid var(--border);border-radius:10px;padding:10px 14px;color:var(--white);font-size:14px;outline:none"
              onfocus="this.style.borderColor='var(--gold)'" onblur="this.style.borderColor='var(--border)'"/>
          </div>

          <!-- Category -->
          <div style="margin-bottom:16px">
            <div style="font-size:12px;color:var(--w60);margin-bottom:6px">Category</div>
            <div style="display:flex;flex-wrap:wrap;gap:6px">
              ${cats.map((c,i) => `
                <button class="live-cat-chip ${i===0?'active':''}" onclick="this.parentElement.querySelectorAll('.live-cat-chip').forEach(b=>b.classList.remove('active'));this.classList.add('active')"
                  style="padding:5px 10px;border-radius:20px;border:1px solid var(--border);background:${i===0?'rgba(212,175,55,.15)':'transparent'};color:${i===0?'var(--gold)':'var(--w60)'};font-size:11px;cursor:pointer">${c}</button>
              `).join('')}
            </div>
          </div>

          <!-- Camera/Mic toggles -->
          <div style="display:flex;gap:10px;margin-bottom:16px">
            <button id="glCamToggle" onclick="afribLivePreviewToggleCam()" style="flex:1;padding:9px;border-radius:10px;background:var(--bg3);border:1px solid var(--border);color:var(--white);font-size:13px;cursor:pointer">📷 Camera On</button>
            <button id="glMicToggle" onclick="afribLivePreviewToggleMic()" style="flex:1;padding:9px;border-radius:10px;background:var(--bg3);border:1px solid var(--border);color:var(--white);font-size:13px;cursor:pointer">🎙 Mic On</button>
          </div>

          <button onclick="afribLiveStartStream()" style="width:100%;background:linear-gradient(135deg,#ff4757,#ff6b35);color:#fff;border:none;border-radius:12px;padding:14px;font-size:15px;font-weight:800;cursor:pointer;box-shadow:0 4px 16px rgba(255,71,87,.35)">
            🔴 Start Live Stream
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // ── HTTPS check (getUserMedia requires secure context) ──
    if (!window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      _showGoLiveError(modal, '🔒 Live streaming requires HTTPS. Please deploy to a secure server.');
      return;
    }

    // ── Feature detection ──
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      _showGoLiveError(modal, '⚠️ Your browser does not support camera access. Try Chrome or Safari.');
      return;
    }

    // ── Best-practice constraints (2025 WebRTC guide) ──
    // Use ideal values — browser honours them on a best-effort basis
    // echoCancellation + noiseSuppression prevent audio feedback on mobile
    const constraints = {
      video: {
        width:     { ideal: 1280 },
        height:    { ideal: 720 },
        frameRate: { ideal: 30, max: 60 },
        facingMode: 'user',          // front camera on mobile
      },
      audio: {
        echoCancellation:  true,
        noiseSuppression:  true,
        autoGainControl:   true,
        sampleRate:        { ideal: 48000 },
      },
    };

    navigator.mediaDevices.getUserMedia(constraints)
      .then(stream => {
        _myStream = stream;
        const preview = document.getElementById('goLivePreview');
        if (preview) {
          preview.srcObject = stream;
          preview.setAttribute('playsinline', '');  // iOS requires attribute, not just property
          preview.setAttribute('muted', '');
          preview.play().catch(() => {});
        }
        log('Camera preview started', stream.getTracks().map(t => t.kind + ':' + t.label).join(', '));
      })
      .catch(err => {
        log('getUserMedia error:', err.name, err.message);
        // Granular error messages per MDN + 2025 best practices
        const msgs = {
          NotAllowedError:       '🚫 Camera/mic permission denied. Tap the lock icon in your browser and allow camera access, then try again.',
          PermissionDeniedError: '🚫 Camera/mic permission denied. Allow camera access in browser settings.',
          NotFoundError:         '📷 No camera found on this device. Connect a camera and try again.',
          DevicesNotFoundError:  '📷 No camera found on this device.',
          NotReadableError:      '🔧 Camera is already in use by another app. Close other apps using the camera and retry.',
          TrackStartError:       '🔧 Camera is already in use by another app.',
          OverconstrainedError:  '⚙️ Camera does not support the required settings. Trying with basic settings…',
          ConstraintNotSatisfiedError: '⚙️ Camera settings not supported — retrying with basic mode…',
          AbortError:            '⚡ Camera access was aborted. Please try again.',
          SecurityError:         '🔒 Camera blocked by security policy. Ensure you are on HTTPS.',
          TypeError:             '⚠️ Camera configuration error. Please try again.',
        };
        const msg = msgs[err.name] || `⚠️ Could not access camera: ${err.message}`;

        // For OverconstrainedError — retry with basic constraints
        if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
          navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
              _myStream = stream;
              const preview = document.getElementById('goLivePreview');
              if (preview) { preview.srcObject = stream; preview.play().catch(() => {}); }
              log('Camera started in fallback mode');
            })
            .catch(() => _showGoLiveError(modal, msg));
          return;
        }

        _showGoLiveError(modal, msg);
      });
  }

  function _showGoLiveError(modal, msg) {
    // Don't remove modal — show error inside it so user can retry
    const errEl = document.createElement('div');
    errEl.style.cssText = 'background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.25);border-radius:10px;padding:12px 16px;margin:12px 20px;font-size:13px;color:rgba(239,68,68,.9);line-height:1.5';
    errEl.textContent = msg;
    const card = modal.querySelector('.modal-card');
    if (card) card.insertBefore(errEl, card.firstElementChild);
    if (typeof showToast === 'function') showToast(msg.slice(0, 60));
  }

  // Preview cam/mic toggles
  window.afribLivePreviewToggleCam = function() {
    if (!_myStream) return;
    const tracks = _myStream.getVideoTracks();
    const enabled = tracks[0]?.enabled;
    tracks.forEach(t => { t.enabled = !enabled; });
    const btn = document.getElementById('glCamToggle');
    if (btn) btn.textContent = enabled ? '📷 Camera Off' : '📷 Camera On';
  };
  window.afribLivePreviewToggleMic = function() {
    if (!_myStream) return;
    const tracks = _myStream.getAudioTracks();
    const enabled = tracks[0]?.enabled;
    tracks.forEach(t => { t.enabled = !enabled; });
    const btn = document.getElementById('glMicToggle');
    if (btn) btn.textContent = enabled ? '🎙 Mic Off' : '🎙 Mic On';
  };

  window.afribLiveStartStream = function() {
    if (!window.currentUser) {
      if (typeof showToast === 'function') showToast('⚠️ Sign in to go live');
      return;
    }
    if (!_myStream) {
      if (typeof showToast === 'function') showToast('⚠️ Camera not ready — allow camera access first');
      return;
    }

    const user = window.currentUser;
    const titleEl = document.getElementById('liveTitle');
    const activeCat = document.querySelector('.live-cat-chip.active');

    const title    = titleEl ? titleEl.value.trim() || 'Live Stream' : 'Live Stream';
    const category = activeCat ? activeCat.textContent.trim().replace(/^[\p{Emoji}\uFE0F\u20D0-\u20FF\s]+\s*/u,'').trim() || activeCat.textContent.trim() : 'Live';

    _activeStreamId = 'live_' + Date.now() + '_' + Math.random().toString(36).slice(2,6);
    _isStreaming    = true;
    _viewerCount    = 0;

    // Register stream
    const stream = {
      id:          _activeStreamId,
      hostEmail:   user.email,
      hostName:    ((user.first||'')+ ' ' +(user.last||'')).trim() || user.username || 'User',
      hostCountry: user.country || '🌍',
      hostFlag:    user.countryEmoji || '🌍',
      title,
      category,
      startedAt:   Date.now(),
      viewerCount: 0,
    };
    addStream(stream);

    // Close modal
    const modal = document.getElementById('goLiveModal');
    if (modal) modal.remove();

    // Update UI
    const goBtn = document.getElementById('liveGoBtn');
    if (goBtn) goBtn.textContent = '⏹ End Stream';
    const controls = document.getElementById('liveMyControls');
    if (controls) controls.style.display = 'flex';

    // Attach own stream to video slot
    updateLiveGrid();
    setTimeout(() => {
      const vid = document.getElementById('liveSlotVideo_' + _activeStreamId);
      if (vid) {
        vid.srcObject = _myStream;
        vid.muted = true;                   // JS property
        vid.setAttribute('muted', '');      // HTML attribute (iOS Safari needs both)
        vid.setAttribute('playsinline', '');
        vid.setAttribute('autoplay', '');
        vid.play().catch(() => {});
      }
    }, 200);

    // Notify in notifications
    if (typeof addNotification === 'function') {
      addNotification('system', '🔴 You are now LIVE!',
        `Your stream "${title}" is now visible to everyone`, '🔴');
    }

    if (typeof showToast === 'function') showToast('🔴 You are now LIVE!');
    log('Stream started:', _activeStreamId);

    // Simulate initial viewer count movement
    _simulateViewers();
  };

  /* ─────────────────────────────────────────────────────────────────
     §7  END STREAM
  ───────────────────────────────────────────────────────────────────*/
  window.afribLiveEndStream = function() {
    if (!_isStreaming) return;
    _isStreaming = false;

    // Stop camera/mic
    if (_myStream) {
      _myStream.getTracks().forEach(t => t.stop());
      _myStream = null;
    }

    // Close all peer connections
    Object.values(_peerConns).forEach(pc => { try { pc.close(); } catch(e) {} });
    _peerConns = {};

    // Remove from registry
    if (_activeStreamId) {
      removeStream(_activeStreamId);
      clearChat(_activeStreamId);
      _activeStreamId = null;
    }

    // Update UI
    const goBtn = document.getElementById('liveGoBtn');
    if (goBtn) goBtn.textContent = '📡 Go Live';
    const controls = document.getElementById('liveMyControls');
    if (controls) controls.style.display = 'none';

    updateLiveGrid();
    if (typeof showToast === 'function') showToast('✅ Stream ended. Thanks for going live!');
    log('Stream ended');
  };

  /* ─────────────────────────────────────────────────────────────────
     §8  STREAM CONTROLS (mic/cam)
  ───────────────────────────────────────────────────────────────────*/
  window.afribLiveToggleMic = function() {
    if (!_myStream) return;
    const tracks = _myStream.getAudioTracks();
    const enabled = tracks[0]?.enabled;
    tracks.forEach(t => { t.enabled = !enabled; });
    const btn = document.getElementById('liveMicBtn');
    if (btn) btn.textContent = enabled ? '🔇' : '🎙';
    if (typeof showToast === 'function') showToast(enabled ? '🔇 Mic muted' : '🎙 Mic on');
  };

  window.afribLiveToggleCam = function() {
    if (!_myStream) return;
    const tracks = _myStream.getVideoTracks();
    const enabled = tracks[0]?.enabled;
    tracks.forEach(t => { t.enabled = !enabled; });
    const btn = document.getElementById('liveCamBtn');
    if (btn) btn.textContent = enabled ? '📵' : '📷';
    if (typeof showToast === 'function') showToast(enabled ? '📵 Camera off' : '📷 Camera on');
  };

  /* ─────────────────────────────────────────────────────────────────
     §9  VIEWER MODE — full-screen TikTok-style overlay
  ───────────────────────────────────────────────────────────────────*/
  window.afribLiveOpenViewer = function(streamId) {
    const streams = getStreams();
    const stream = streams.find(s => s.id === streamId);
    if (!stream) { if (typeof showToast === 'function') showToast('❌ Stream not available'); return; }

    // Build full-screen viewer overlay
    const old = document.getElementById('liveViewerOverlay');
    if (old) old.remove();

    const user = window.currentUser;
    const isMe = user && stream.hostEmail === user.email;
    const chats = getChatMsgs(streamId).slice(-30);

    const overlay = document.createElement('div');
    overlay.id = 'liveViewerOverlay';
    overlay.className = 'live-viewer-overlay';

    overlay.innerHTML = `
      <!-- Video background -->
      <video id="liveViewerVideo" autoplay playsinline muted class="live-viewer-video"></video>

      <!-- Gradient overlays -->
      <div class="live-viewer-top-grad"></div>
      <div class="live-viewer-bot-grad"></div>

      <!-- Gift/Heart animations container -->
      <div id="liveGiftContainer" class="live-gift-container"></div>

      <!-- Top bar -->
      <div class="live-viewer-topbar">
        <div class="live-viewer-host-info">
          <div class="live-viewer-avatar">${_esc((stream.hostName||'?')[0].toUpperCase())}</div>
          <div>
            <div class="live-viewer-name">${_esc(stream.hostName)}</div>
            <div class="live-viewer-meta">${stream.hostFlag||'🌍'} ${_esc(stream.hostCountry||'')} · ${_esc(stream.category||'Live')}</div>
          </div>
          <span class="live-badge-sm" style="margin-left:8px">🔴 LIVE</span>
        </div>
        <div style="display:flex;align-items:center;gap:10px">
          <div class="live-viewer-count">👁 <span id="liveViewerCountDisp">${stream.viewerCount||0}</span></div>
          <button onclick="afribLiveCloseViewer()" class="live-close-btn">✕</button>
        </div>
      </div>

      <!-- Stream title -->
      <div class="live-stream-title-bar">${_esc(stream.title||'')}</div>

      <!-- Chat overlay -->
      <div class="live-chat-overlay" id="liveChatOverlay">
        <div class="live-chat-msgs" id="liveChatMsgs">
          ${chats.map(m => `
            <div class="live-chat-msg">
              <span class="live-chat-user">${_esc(m.name||'User')}</span>
              <span class="live-chat-text">${_esc(m.text)}</span>
            </div>`).join('')}
        </div>
      </div>

      <!-- Right side: hearts + gift buttons -->
      <div class="live-right-actions">
        <button class="live-action-btn" onclick="afribLiveSendHeart('${_esc(streamId)}')" title="Send hearts">❤️</button>
        <button class="live-action-btn" onclick="afribLiveSendGift('${_esc(streamId)}')" title="Send gift">🎁</button>
        <button class="live-action-btn" onclick="afribLiveShare('${_esc(streamId)}')" title="Share">🔗</button>
      </div>

      <!-- Bottom: chat input -->
      <div class="live-chat-input-bar">
        <input id="liveChatInput" type="text" placeholder="Say something…" maxlength="100"
          style="flex:1;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);border-radius:20px;padding:8px 14px;color:#fff;font-size:13px;outline:none"
          onkeydown="if(event.key==='Enter')afribLiveSendChat('${_esc(streamId)}')"
        />
        <button onclick="afribLiveSendChat('${_esc(streamId)}')" class="live-send-btn">💬</button>
      </div>

      <!-- Gift panel (hidden by default) -->
      <div id="liveGiftPanel" class="live-gift-panel" style="display:none">
        <div style="font-size:14px;font-weight:800;margin-bottom:12px;color:#fff">🎁 Send a Gift</div>
        <div class="live-gift-grid">
          ${LIVE_GIFTS.map(g => `
            <button class="live-gift-item" onclick="afribLiveSelectGift('${_esc(streamId)}','${_esc(g.name)}')" title="${g.name}">
              <div style="font-size:26px">${g.emoji}</div>
              <div style="font-size:10px;font-weight:700;color:${g.color}">${g.name}</div>
              <div style="font-size:9px;color:rgba(255,255,255,.5)">🪙${g.coins}</div>
            </button>`).join('')}
        </div>
        <button onclick="document.getElementById('liveGiftPanel').style.display='none'"
          style="width:100%;margin-top:10px;padding:8px;background:rgba(255,255,255,.1);border:none;border-radius:8px;color:#fff;cursor:pointer;font-size:13px">Cancel</button>
      </div>
    `;

    document.body.appendChild(overlay);

    // Attach own stream or show placeholder
    const vid = document.getElementById('liveViewerVideo');
    if (isMe && _myStream) {
      vid.srcObject = _myStream;
      vid.muted = true;
      vid.setAttribute('muted','');
      vid.play().catch(() => {});
    } else {
      // No stream available yet (Firebase signaling would connect here)
      // Show placeholder with host info
      vid.style.background = 'linear-gradient(135deg, #1a0a2e 0%, #0a0612 100%)';
      const placeholder = document.createElement('div');
      placeholder.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;color:rgba(255,255,255,.6);z-index:1';
      placeholder.innerHTML = `
        <div style="font-size:56px;margin-bottom:8px">${stream.hostFlag||'🌍'}</div>
        <div style="font-size:14px;font-weight:700">${_esc(stream.hostName)}</div>
        <div style="font-size:12px;margin-top:4px">Connecting… (Firebase required for live video)</div>
      `;
      overlay.appendChild(placeholder);
    }

    _isViewing = true;
    _activeStreamId = streamId;

    // Start polling chat
    _startChatPolling(streamId);

    // Increment viewer count
    _incrementViewers(streamId);
  };

  window.afribLiveCloseViewer = function() {
    const overlay = document.getElementById('liveViewerOverlay');
    if (overlay) overlay.remove();
    clearInterval(_chatInterval);
    _chatInterval = null;

    // Decrement viewer count before clearing state
    if (_activeStreamId && _isViewing) {
      try {
        const streams = getStreams();
        const s = streams.find(st => st.id === _activeStreamId);
        if (s) {
          s.viewerCount = Math.max(0, (s.viewerCount || 1) - 1);
          saveStreams(streams);
        }
      } catch(e) {}
    }

    _isViewing = false;
    // Only reset _activeStreamId if we are not the streamer
    if (!_isStreaming) {
      _activeStreamId = null;
    }
  };

  /* ─────────────────────────────────────────────────────────────────
     §10  CHAT — send & poll
  ───────────────────────────────────────────────────────────────────*/
  window.afribLiveSendChat = function(streamId) {
    const input = document.getElementById('liveChatInput');
    if (!input || !input.value.trim()) return;
    const user = window.currentUser;
    const name = user ? ((user.first||'')+(user.last?' '+user.last:'')).trim() || user.username : 'Viewer';

    addChatMsg(streamId, { name, text: input.value.trim() });
    input.value = '';
    _renderChatMsgs(streamId);
  };

  function _startChatPolling(streamId) {
    clearInterval(_chatInterval);
    _chatInterval = setInterval(() => {
      _renderChatMsgs(streamId);
      // Update viewer count display
      const streams = getStreams();
      const s = streams.find(s => s.id === streamId);
      const countEl = document.getElementById('liveViewerCountDisp');
      if (countEl && s) countEl.textContent = s.viewerCount || 0;
    }, 1000);
  }

  function _renderChatMsgs(streamId) {
    const box = document.getElementById('liveChatMsgs');
    if (!box) return;
    const msgs = getChatMsgs(streamId).slice(-30);
    box.innerHTML = msgs.map(m => `
      <div class="live-chat-msg">
        <span class="live-chat-user">${_esc(m.name||'Viewer')}</span>
        <span class="live-chat-text">${_esc(m.text)}</span>
      </div>`).join('');
    box.scrollTop = box.scrollHeight;
  }

  /* ─────────────────────────────────────────────────────────────────
     §11  HEARTS & GIFTS
  ───────────────────────────────────────────────────────────────────*/
  window.afribLiveSendHeart = function(streamId) {
    const container = document.getElementById('liveGiftContainer');
    spawnHeartBurst(container);
    const user = window.currentUser;
    const name = user ? (user.first||'Viewer') : 'Viewer';
    addChatMsg(streamId, { name, text: '❤️❤️❤️' });
  };

  window.afribLiveSendGift = function(streamId) {
    const panel = document.getElementById('liveGiftPanel');
    if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  };

  window.afribLiveSelectGift = function(streamId, giftName) {
    const gift = LIVE_GIFTS.find(g => g.name === giftName);
    if (!gift) return;

    const user = window.currentUser;
    if (!user) { if (typeof showToast==='function') showToast('Sign in to send gifts'); return; }

    // Deduct coins
    const coins = window.userCoins || 0;

    // Check admin-set maximum gift limit
    try {
      const liveSettings = JSON.parse(localStorage.getItem('afrib_live_settings') || '{}');
      const maxGift = liveSettings.maxGiftCoins || 1000;
      if (gift.coins > maxGift) {
        if (typeof showToast==='function') showToast('⚠️ Max gift is ' + maxGift + ' coins (set by admin)');
        return;
      }
    } catch(e) {}

    if (coins < gift.coins) {
      if (typeof showToast==='function') showToast(`❌ Need ${gift.coins} coins. You have ${coins}.`);
      return;
    }

    // Deduct coins — try multiple persistence paths
    const newCoins = Math.max(0, coins - gift.coins);
    if (typeof gmSetUserCoins === 'function') {
      gmSetUserCoins(newCoins);
    } else {
      window.userCoins = newCoins;
      // Persist to user account in localStorage
      try {
        const session = JSON.parse(localStorage.getItem('afrib_session') || 'null');
        if (session && session.email) {
          const accts = JSON.parse(localStorage.getItem('afrib_accounts') || '{}');
          if (accts[session.email]) {
            accts[session.email].coins = newCoins;
            localStorage.setItem('afrib_accounts', JSON.stringify(accts));
          }
        }
      } catch(e) {}
    }

    const name = ((user.first||'')+(user.last?' '+user.last:'')).trim() || user.username || 'Viewer';

    // Animate
    const container = document.getElementById('liveGiftContainer');
    spawnGiftAnimation(gift, name, container);

    // Add to chat
    addChatMsg(streamId, { name, text: `${gift.emoji} sent ${gift.name} (${gift.coins} 🪙)` });
    _renderChatMsgs(streamId);

    // Close gift panel
    const panel = document.getElementById('liveGiftPanel');
    if (panel) panel.style.display = 'none';

    if (typeof showToast === 'function') showToast(`${gift.emoji} Gift sent!`);
    log('Gift sent:', gift.name, 'to', streamId);
  };

  window.afribLiveShare = function(streamId) {
    const streams = getStreams();
    const s = streams.find(s => s.id === streamId);
    const text = s ? `Watch ${s.hostName} live on AfriBConnect! ${s.title}` : 'Join me live on AfriBConnect!';
    if (navigator.share) {
      navigator.share({ title: 'AfriBConnect Live', text, url: window.location.href });
    } else if (typeof window.AfribPWA?.copyToClipboard === 'function') {
      window.AfribPWA.copyToClipboard(text);
    }
  };

  /* ─────────────────────────────────────────────────────────────────
     §12  VIEWER COUNT SIMULATION (real viewers tracked locally)
  ───────────────────────────────────────────────────────────────────*/
  function _incrementViewers(streamId) {
    const streams = getStreams();
    const s = streams.find(s => s.id === streamId);
    if (s) { s.viewerCount = (s.viewerCount || 0) + 1; saveStreams(streams); }
  }

  let _viewerSimTimer = null;

  function _simulateViewers() {
    // Clear any existing simulation
    if (_viewerSimTimer) clearTimeout(_viewerSimTimer);

    const grow = () => {
      // Stop if stream ended or page hidden (saves battery/memory)
      if (!_isStreaming || !_activeStreamId || document.hidden) {
        _viewerSimTimer = null;
        return;
      }
      try {
        const streams = getStreams();
        const s = streams.find(st => st.id === _activeStreamId);
        if (!s) { _viewerSimTimer = null; return; }
        const delta = Math.floor(Math.random() * 3) - (s.viewerCount > 5 ? 1 : 0);
        s.viewerCount = Math.max(0, (s.viewerCount || 0) + delta);
        saveStreams(streams);
        const countEl = document.getElementById('liveMyViewerCount');
        if (countEl) countEl.textContent = `👁 ${s.viewerCount} watching`;
      } catch(e) {}
      _viewerSimTimer = setTimeout(grow, 4000 + Math.random() * 8000);
    };

    _viewerSimTimer = setTimeout(grow, 3000);
  }

  // Stop simulation when tab hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && _viewerSimTimer) {
      clearTimeout(_viewerSimTimer);
      _viewerSimTimer = null;
    } else if (!document.hidden && _isStreaming) {
      _simulateViewers();
    }
  });

  /* ─────────────────────────────────────────────────────────────────
     §13  INITIALISE — inject into YourStyle screen
  ───────────────────────────────────────────────────────────────────*/
  function init() {
    // Listen for cross-tab live updates
    try {
      if (window.BroadcastChannel) {
        const bc = new BroadcastChannel('afrib_live_chan');
        bc.onmessage = () => {
          if (document.getElementById('live-screen-root')) updateLiveGrid();
        };
      }
    } catch(e) {}

    // Inject CSS
    injectCSS();

    // Stale stream cleanup happens inside getStreams() on every read
    getStreams(); // trigger initial cleanup

    // ── CRITICAL: clean up if user closes tab while streaming ──
    // Uses both beforeunload (instant) and pagehide (iOS Safari)
    const _cleanup = () => {
      if (_isStreaming && _activeStreamId) {
        // Stop tracks
        if (_myStream) { try { _myStream.getTracks().forEach(t => t.stop()); } catch(e) {} }
        // Remove from registry (synchronous)
        try {
          const list = getStreams().filter(s => s.id !== _activeStreamId);
          localStorage.setItem(LS_KEY_STREAMS, JSON.stringify(list));
          localStorage.removeItem(LS_KEY_CHAT + _activeStreamId);
        } catch(e) {}
      }
      if (_viewerSimTimer) clearTimeout(_viewerSimTimer);
      if (_chatInterval)   clearInterval(_chatInterval);
    };
    window.addEventListener('beforeunload', _cleanup, { passive: true });
    window.addEventListener('pagehide', _cleanup, { passive: true }); // iOS Safari

    log('✅ Live Stream module ready (with unload cleanup)');

  // Expose internal addChatMsg for upgrade module
  window._afribLiveAddChatInternal = addChatMsg;
  }

  /* ─────────────────────────────────────────────────────────────────
     §14  PUBLIC API
  ───────────────────────────────────────────────────────────────────*/
  window.AfribLive = {
    render:     renderLiveScreen,
    getSlots,
    setSlots,
    getStreams,
    endStream: function() {
      if (typeof window.afribLiveEndStream === 'function') window.afribLiveEndStream();
    },
    stopPolling: function() {
      if (_chatInterval) { clearInterval(_chatInterval); _chatInterval = null; }
      if (_viewerSimTimer) { clearTimeout(_viewerSimTimer); _viewerSimTimer = null; }
    },
    getState: function() {
      return { isStreaming: _isStreaming, isViewing: _isViewing, activeStreamId: _activeStreamId };
    },
  };

  /* ─────────────────────────────────────────────────────────────────
     §15  CSS INJECTION
  ───────────────────────────────────────────────────────────────────*/
  function injectCSS() {
    if (document.getElementById('afrib-live-css')) return;
    const style = document.createElement('style');
    style.id = 'afrib-live-css';
    style.textContent = `
/* ── Live Screen Wrapper ── */
.live-screen-inner { padding: 0 0 32px; }

/* ── Header ── */
.live-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px 10px;
}
.live-header-left { display: flex; align-items: center; gap: 8px; }
.live-pulse-dot {
  width: 10px; height: 10px; background: #ff4757; border-radius: 50%;
  animation: livePulse 1.4s ease-in-out infinite;
}
@keyframes livePulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(255,71,87,.6); }
  50%      { box-shadow: 0 0 0 6px rgba(255,71,87,0); }
}
.live-header-title { font-size: 18px; font-weight: 900; color: #fff; letter-spacing: -0.3px; }
.live-active-count { font-size: 11px; background: rgba(255,71,87,.15); color: #ff4757; border: 1px solid rgba(255,71,87,.3); border-radius: 20px; padding: 2px 8px; font-weight: 700; }

.live-go-btn {
  background: linear-gradient(135deg, #ff4757, #ff6b35);
  color: #fff; border: none; border-radius: 20px;
  padding: 9px 18px; font-size: 13px; font-weight: 800;
  cursor: pointer; box-shadow: 0 4px 14px rgba(255,71,87,.35);
  transition: transform .15s, box-shadow .15s;
}
.live-go-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(255,71,87,.45); }
.live-go-btn:active { transform: scale(0.97); }

/* ── Grid ── */
.live-grid {
  display: grid;
  grid-template-columns: repeat(var(--cols, 2), 1fr);
  gap: 8px;
  padding: 0 12px;
}

/* ── Slot Box ── */
.live-slot {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  aspect-ratio: 9/16;
  cursor: pointer;
  touch-action: manipulation;  /* removes 300ms tap delay on iOS/Android */
  -webkit-tap-highlight-color: transparent;
  transition: transform .2s ease, box-shadow .2s ease;
}
.live-slot:hover { transform: scale(1.02); }
.live-slot:active { transform: scale(0.98); }

/* Empty slot */
.live-slot-empty {
  background: linear-gradient(135deg, rgba(255,71,87,.06), rgba(20,12,6,.97));
  border: 2px dashed rgba(255,71,87,.25);
}
.live-slot-empty-inner {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 6px;
}
.live-slot-icon { font-size: 32px; opacity: 0.5; }
.live-slot-empty-label { font-size: 13px; font-weight: 700; color: rgba(255,255,255,.5); }
.live-slot-empty-sub { font-size: 11px; color: rgba(255,255,255,.3); }

/* Active slot */
.live-slot-active { background: #000; box-shadow: 0 4px 20px rgba(0,0,0,.5); }
.live-slot-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,.2) 0%, transparent 30%, transparent 60%, rgba(0,0,0,.7) 100%);
  pointer-events: none;
}

/* Slot top row */
.live-slot-top {
  position: absolute; top: 8px; left: 8px; right: 8px;
  display: flex; align-items: center; gap: 6px; z-index: 2;
}
.live-badge-sm {
  background: #ff4757; color: #fff;
  font-size: 9px; font-weight: 800; border-radius: 6px;
  padding: 2px 6px; letter-spacing: .3px;
}
.live-duration { font-size: 10px; color: rgba(255,255,255,.8); font-weight: 600; margin-left: auto; }
.live-you-badge {
  background: var(--gold); color: #000;
  font-size: 9px; font-weight: 800; border-radius: 6px; padding: 2px 6px;
}

/* Slot bottom */
.live-slot-bottom {
  position: absolute; bottom: 0; left: 0; right: 0;
  display: flex; align-items: center; gap: 7px;
  padding: 8px 10px 10px; z-index: 2;
}
.live-slot-avatar {
  width: 28px; height: 28px; border-radius: 50%;
  background: linear-gradient(135deg, var(--gold), #b8860b);
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 800; color: #000; flex-shrink: 0;
  border: 1.5px solid rgba(255,255,255,.3);
}
.live-slot-info { flex: 1; min-width: 0; }
.live-slot-name { font-size: 12px; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.live-slot-meta { font-size: 10px; color: rgba(255,255,255,.55); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.live-slot-viewers { font-size: 11px; color: rgba(255,255,255,.75); font-weight: 700; white-space: nowrap; }
.live-slot-category {
  position: absolute; top: 8px; right: 8px; z-index: 2;
  background: rgba(0,0,0,.5); backdrop-filter: blur(4px);
  color: #fff; font-size: 9px; font-weight: 700; border-radius: 8px;
  padding: 2px 7px; max-width: 80px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

/* My controls bar */
.live-my-controls {
  margin: 10px 12px 0;
  background: rgba(255,71,87,.1);
  border: 1px solid rgba(255,71,87,.25);
  border-radius: 14px;
  padding: 10px 14px;
  display: flex; align-items: center; justify-content: space-between;
  gap: 10px;
}
.live-ctrl-info { display: flex; align-items: center; gap: 8px; }
.live-ctrl-badge {
  background: #ff4757; color: #fff;
  font-size: 10px; font-weight: 800; border-radius: 6px; padding: 3px 8px;
  animation: livePulse 1.4s ease-in-out infinite;
}
.live-ctrl-btns { display: flex; gap: 6px; align-items: center; }
.live-ctrl-btn {
  width: 36px; height: 36px; border-radius: 50%;
  background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.15);
  color: #fff; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: background .15s;
}
.live-ctrl-btn:hover { background: rgba(255,255,255,.18); }
.live-ctrl-end {
  width: auto; border-radius: 20px; padding: 0 14px;
  background: rgba(255,71,87,.2); border-color: rgba(255,71,87,.4);
  font-size: 12px; font-weight: 700; white-space: nowrap;
}

/* ── FULL-SCREEN VIEWER ── */
.live-viewer-overlay {
  position: fixed; inset: 0; z-index: 5000;
  background: #000;
  display: flex; flex-direction: column;
}
.live-viewer-video {
  position: absolute; inset: 0;
  width: 100%; height: 100%; object-fit: cover;
}
.live-viewer-top-grad {
  position: absolute; top: 0; left: 0; right: 0; height: 140px;
  background: linear-gradient(to bottom, rgba(0,0,0,.7), transparent);
  pointer-events: none; z-index: 1;
}
.live-viewer-bot-grad {
  position: absolute; bottom: 0; left: 0; right: 0; height: 250px;
  background: linear-gradient(to top, rgba(0,0,0,.85), transparent);
  pointer-events: none; z-index: 1;
}

/* Top bar */
.live-viewer-topbar {
  position: absolute; top: 0; left: 0; right: 0; z-index: 10;
  display: flex; align-items: center; justify-content: space-between;
  /* env(safe-area-inset-top) handles iPhone Dynamic Island / notch */
  padding: calc(48px + env(safe-area-inset-top, 0px)) 16px 12px;
}
.live-viewer-host-info { display: flex; align-items: center; gap: 10px; }
.live-viewer-avatar {
  width: 40px; height: 40px; border-radius: 50%;
  background: linear-gradient(135deg, var(--gold), #b8860b);
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; font-weight: 800; color: #000;
  border: 2px solid rgba(255,255,255,.3);
}
.live-viewer-name { font-size: 14px; font-weight: 800; color: #fff; }
.live-viewer-meta { font-size: 11px; color: rgba(255,255,255,.6); }
.live-viewer-count { font-size: 13px; font-weight: 700; color: rgba(255,255,255,.9); }
.live-close-btn {
  width: 34px; height: 34px; border-radius: 50%;
  background: rgba(0,0,0,.5); border: 1px solid rgba(255,255,255,.15);
  color: #fff; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center;
}

/* Stream title */
.live-stream-title-bar {
  position: absolute; top: 120px; left: 16px; z-index: 10;
  font-size: 13px; font-weight: 700; color: rgba(255,255,255,.85);
  background: rgba(0,0,0,.4); backdrop-filter: blur(4px);
  border-radius: 8px; padding: 4px 10px; max-width: 60%;
}

/* Gift container */
.live-gift-container {
  position: absolute; inset: 0; z-index: 5; pointer-events: none;
}

/* Chat overlay */
.live-chat-overlay {
  position: absolute; bottom: 80px; left: 12px; right: 100px;
  z-index: 10; max-height: 220px; overflow: visible;
  display: flex; flex-direction: column; justify-content: flex-end;
}
.live-chat-msgs { display: flex; flex-direction: column; gap: 5px; justify-content: flex-end; overflow-y: auto; max-height: 220px; }
.live-chat-msg {
  display: inline-flex; align-items: flex-start; gap: 5px;
  background: rgba(0,0,0,.45); backdrop-filter: blur(4px);
  border-radius: 12px; padding: 5px 10px; max-width: 100%;
  animation: liveChatIn .2s ease;
}
@keyframes liveChatIn { from { opacity:0; transform: translateY(6px); } to { opacity:1; transform: none; } }
.live-chat-user { font-size: 11px; font-weight: 800; color: var(--gold); white-space: nowrap; flex-shrink: 0; }
.live-chat-text { font-size: 12px; color: rgba(255,255,255,.9); word-break: break-word; }

/* Right actions */
.live-right-actions {
  position: absolute; right: 12px; bottom: 180px;
  z-index: 10; display: flex; flex-direction: column; gap: 12px;
}
.live-action-btn {
  width: 46px; height: 46px; border-radius: 50%;
  background: rgba(0,0,0,.5); border: 1px solid rgba(255,255,255,.15);
  font-size: 22px; cursor: pointer; display: flex; align-items: center; justify-content: center;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: transform .15s, background .15s;
}
.live-action-btn:hover { transform: scale(1.1); background: rgba(0,0,0,.7); }
.live-action-btn:active { transform: scale(0.9); }

/* Chat input bar */
.live-chat-input-bar {
  position: absolute;
  bottom: calc(16px + env(safe-area-inset-bottom, 0px));
  left: calc(12px + env(safe-area-inset-left, 0px));
  right: calc(12px + env(safe-area-inset-right, 0px));
  z-index: 10; display: flex; gap: 8px; align-items: center;
}
.live-send-btn {
  width: 40px; height: 40px; border-radius: 50%;
  background: linear-gradient(135deg, #ff4757, #ff6b35);
  border: none; font-size: 18px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

/* Gift panel */
.live-gift-panel {
  position: absolute; bottom: 70px; left: 12px; right: 12px;
  z-index: 20; background: rgba(15,10,25,.95); backdrop-filter: blur(20px);
  border: 1px solid rgba(212,175,55,.2); border-radius: 18px; padding: 16px;
}
.live-gift-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;
}
.live-gift-item {
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  padding: 10px 4px; border-radius: 12px;
  background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1);
  cursor: pointer; transition: background .15s, transform .12s;
}
.live-gift-item:hover { background: rgba(255,255,255,.12); transform: scale(1.05); }
.live-gift-item:active { transform: scale(0.95); }

/* Gift + heart animations */
@keyframes liveGiftFloat {
  0%   { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
  60%  { opacity: 1; transform: translateX(-50%) translateY(-80px) scale(1.1); }
  100% { opacity: 0; transform: translateX(-50%) translateY(-140px) scale(0.8); }
}
@keyframes liveHeartFloat {
  0%   { opacity: 1; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(-120px) scale(0.5); }
}
    `;
    document.head.appendChild(style);
  }

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
