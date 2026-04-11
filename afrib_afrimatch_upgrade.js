/* ═══════════════════════════════════════════════════════════════════════
   afrib_afrimatch_gifts.js  —  AfriMatch × GiftMe Integration
   Enables users to send GiftMe gifts to their dating matches.

   Entry points (called from index.html / script.js patches):
     • sendAfriMatchGift()           — from 🎁 button in chat input row
     • afriMatchSendGiftToProfile(id) — from match cards & match popup
   ═══════════════════════════════════════════════════════════════════════ */

'use strict';

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 1 — GIFT PICKER SHEET (AfriMatch-themed)
   Slides up from the bottom like a native action sheet.
   Shows the GiftMe catalogue filtered to romantic/social gifts + luxury.
   ═══════════════════════════════════════════════════════════════════════ */

(function buildAfriMatchGiftSheet() {

  /* ── Inject styles once ── */
  const style = document.createElement('style');
  style.textContent = `
    /* ── Gift Sheet Overlay ── */
    #am-gift-sheet {
      position: fixed;
      inset: 0;
      z-index: 9500;
      background: rgba(0,0,0,.72);
      backdrop-filter: blur(6px);
      display: none;
      align-items: flex-end;
      justify-content: center;
      padding: 0;
    }
    #am-gift-sheet.open { display: flex; }

    .am-gs-card {
      width: min(520px, 100%);
      background: linear-gradient(165deg, #1a0630, #120420);
      border: 1px solid rgba(255,107,157,.25);
      border-bottom: none;
      border-radius: 22px 22px 0 0;
      padding: 0 0 env(safe-area-inset-bottom, 0);
      max-height: 88vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      animation: amGsSlideUp .32s cubic-bezier(.2,.9,.3,1) forwards;
      box-shadow: 0 -8px 40px rgba(255,107,157,.18);
    }
    @keyframes amGsSlideUp {
      from { transform: translateY(100%); opacity: .4; }
      to   { transform: translateY(0);    opacity: 1; }
    }

    .am-gs-handle {
      width: 36px; height: 4px; border-radius: 2px;
      background: rgba(255,255,255,.2);
      margin: 10px auto 0;
      flex-shrink: 0;
    }

    .am-gs-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 18px 10px;
      flex-shrink: 0;
    }
    .am-gs-title {
      font-size: 16px;
      font-weight: 800;
      background: linear-gradient(135deg, #FF6B9D, #ff9900);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .am-gs-recipient {
      font-size: 11px;
      color: rgba(255,255,255,.5);
      margin-top: 2px;
    }
    .am-gs-close {
      background: rgba(255,255,255,.08);
      border: 1px solid rgba(255,255,255,.1);
      border-radius: 50%;
      width: 30px; height: 30px;
      display: flex; align-items: center; justify-content: center;
      color: rgba(255,255,255,.6);
      font-size: 14px;
      cursor: pointer;
      flex-shrink: 0;
    }

    /* coin balance strip */
    .am-gs-coins {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 18px 10px;
      padding: 8px 12px;
      background: rgba(212,175,55,.08);
      border: 1px solid rgba(212,175,55,.2);
      border-radius: 10px;
      font-size: 12px;
      color: rgba(255,255,255,.7);
      flex-shrink: 0;
    }
    .am-gs-coins-val { color: var(--gold, #D4AF37); font-weight: 800; }

    /* category filter tabs */
    .am-gs-tabs {
      display: flex;
      gap: 6px;
      padding: 0 18px 10px;
      overflow-x: auto;
      flex-shrink: 0;
      scrollbar-width: none;
    }
    .am-gs-tabs::-webkit-scrollbar { display: none; }
    .am-gs-tab {
      flex-shrink: 0;
      padding: 6px 14px;
      border-radius: 999px;
      border: 1.5px solid rgba(255,255,255,.1);
      background: transparent;
      color: rgba(255,255,255,.55);
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      transition: all .18s;
    }
    .am-gs-tab.active {
      background: linear-gradient(135deg, rgba(255,107,157,.25), rgba(255,100,0,.2));
      border-color: rgba(255,107,157,.5);
      color: #FF6B9D;
    }

    /* gift grid */
    .am-gs-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(88px, 1fr));
      gap: 10px;
      padding: 4px 18px 16px;
      overflow-y: auto;
      flex: 1;
    }

    .am-gift-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;
      padding: 12px 8px 10px;
      border-radius: 14px;
      background: rgba(255,255,255,.05);
      border: 1.5px solid transparent;
      cursor: pointer;
      transition: all .18s;
      position: relative;
      text-align: center;
    }
    .am-gift-item:hover {
      background: rgba(255,107,157,.1);
      border-color: rgba(255,107,157,.3);
      transform: translateY(-2px);
    }
    .am-gift-item.selected {
      background: rgba(255,107,157,.18);
      border-color: #FF6B9D;
      box-shadow: 0 0 14px rgba(255,107,157,.3);
    }
    .am-gift-emoji { font-size: 32px; line-height: 1; }
    .am-gift-name  { font-size: 10px; font-weight: 700; color: rgba(255,255,255,.8); }
    .am-gift-cost  { font-size: 10px; color: var(--gold, #D4AF37); font-weight: 700; }
    .am-gift-rarity-badge {
      position: absolute;
      top: 4px; right: 4px;
      font-size: 8px;
      font-weight: 800;
      padding: 1px 4px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: .3px;
    }
    .rarity-rare      { background: rgba(59,130,246,.3);  color: #60a5fa; }
    .rarity-epic      { background: rgba(168,85,247,.3);  color: #c084fc; }
    .rarity-legendary { background: rgba(212,175,55,.3);  color: #D4AF37; }
    .rarity-mythic    { background: rgba(239,68,68,.3);   color: #f87171; }

    /* send bar */
    .am-gs-send-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 18px 16px;
      border-top: 1px solid rgba(255,255,255,.06);
      flex-shrink: 0;
    }
    .am-gs-msg-input {
      flex: 1;
      background: rgba(255,255,255,.06);
      border: 1px solid rgba(255,255,255,.1);
      border-radius: 10px;
      padding: 9px 12px;
      color: #fff;
      font-size: 13px;
      outline: none;
      transition: border .18s;
    }
    .am-gs-msg-input:focus { border-color: rgba(255,107,157,.4); }
    .am-gs-msg-input::placeholder { color: rgba(255,255,255,.3); }
    .am-gs-send-btn {
      padding: 10px 18px;
      background: linear-gradient(135deg, #FF6B9D, #E85D26);
      border: none;
      border-radius: 12px;
      color: #fff;
      font-size: 14px;
      font-weight: 800;
      cursor: pointer;
      white-space: nowrap;
      transition: all .18s;
      flex-shrink: 0;
    }
    .am-gs-send-btn:disabled {
      opacity: .4;
      cursor: not-allowed;
    }
    .am-gs-send-btn:not(:disabled):hover {
      transform: scale(1.03);
    }

    /* Gift message bubble in chat */
    .dm-gift-bubble {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      border-radius: 16px;
      background: linear-gradient(135deg, rgba(255,107,157,.15), rgba(255,100,0,.1));
      border: 1px solid rgba(255,107,157,.3);
      max-width: 240px;
      margin: 4px 0;
      box-shadow: 0 4px 16px rgba(255,107,157,.15);
    }
    .dm-gift-emoji-large { font-size: 32px; flex-shrink: 0; }
    .dm-gift-info { flex: 1; min-width: 0; }
    .dm-gift-label { font-size: 12px; font-weight: 800; color: #FF6B9D; }
    .dm-gift-gname { font-size: 13px; font-weight: 700; color: #fff; }
    .dm-gift-gmsg  { font-size: 11px; color: rgba(255,255,255,.6); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .dm-gift-coins { font-size: 10px; color: var(--gold, #D4AF37); font-weight: 700; margin-top: 2px; }

    /* Match card gift badge positioning */
    .dm-match-card { position: relative; }

    /* Coin-fly animation for gift send confirmation */
    @keyframes amGiftFly {
      0%   { transform: translate(0,0) scale(1);    opacity: 1; }
      100% { transform: translate(0,-120px) scale(2); opacity: 0; }
    }
    .am-gift-fly {
      position: fixed;
      font-size: 28px;
      pointer-events: none;
      z-index: 9999;
      animation: amGiftFly .9s cubic-bezier(.2,.8,.3,1) forwards;
    }
  `;
  document.head.appendChild(style);

  /* ── Gift categories ── */
  const CATEGORIES = [
    { id: 'all',      label: '🎁 All' },
    { id: 'sweet',    label: '🌹 Sweet' },
    { id: 'fun',      label: '🎉 Fun' },
    { id: 'luxury',   label: '💎 Luxury' },
    { id: 'african',  label: '🌍 African' },
  ];

  /* ── Curated gift list for AfriMatch ── */
  const AM_GIFTS = [
    // Sweet / romantic
    { id:'rose',       emoji:'🌹', name:'Red Rose',     coins:50,   cat:'sweet',   rarity:'' },
    { id:'bouquet',    emoji:'💐', name:'Bouquet',      coins:120,  cat:'sweet',   rarity:'' },
    { id:'heart',      emoji:'❤️',  name:'Heart',        coins:30,   cat:'sweet',   rarity:'' },
    { id:'chocolate',  emoji:'🍫', name:'Chocolate',    coins:80,   cat:'sweet',   rarity:'' },
    { id:'ring',       emoji:'💍', name:'Ring',         coins:500,  cat:'sweet',   rarity:'epic' },
    { id:'kiss',       emoji:'💋', name:'Kiss',         coins:40,   cat:'sweet',   rarity:'' },
    { id:'teddy',      emoji:'🧸', name:'Teddy Bear',   coins:100,  cat:'sweet',   rarity:'' },
    { id:'candle',     emoji:'🕯️', name:'Candles',      coins:60,   cat:'sweet',   rarity:'' },

    // Fun / social
    { id:'firecracker',emoji:'🎆', name:'Fireworks',    coins:150,  cat:'fun',     rarity:'' },
    { id:'champagne',  emoji:'🍾', name:'Champagne',    coins:200,  cat:'fun',     rarity:'rare' },
    { id:'confetti',   emoji:'🎊', name:'Confetti',     coins:70,   cat:'fun',     rarity:'' },
    { id:'gift',       emoji:'🎁', name:'Mystery Gift', coins:90,   cat:'fun',     rarity:'' },
    { id:'music',      emoji:'🎵', name:'Love Song',    coins:110,  cat:'fun',     rarity:'' },
    { id:'star',       emoji:'⭐', name:'Star',         coins:180,  cat:'fun',     rarity:'rare' },
    { id:'dance',      emoji:'💃', name:'Dance',        coins:130,  cat:'fun',     rarity:'' },
    { id:'ticket',     emoji:'🎟️', name:'Date Night',   coins:350,  cat:'fun',     rarity:'epic' },

    // Luxury
    { id:'diamond',    emoji:'💎', name:'Diamond',      coins:1000, cat:'luxury',  rarity:'legendary' },
    { id:'crown',      emoji:'👑', name:'Crown',        coins:800,  cat:'luxury',  rarity:'legendary' },
    { id:'car',        emoji:'🚗', name:'Sports Car',   coins:2000, cat:'luxury',  rarity:'legendary' },
    { id:'yacht',      emoji:'⛵', name:'Yacht',        coins:5000, cat:'luxury',  rarity:'mythic' },
    { id:'jet',        emoji:'✈️', name:'Private Jet',  coins:8000, cat:'luxury',  rarity:'mythic' },
    { id:'castle',     emoji:'🏰', name:'Castle',       coins:3000, cat:'luxury',  rarity:'mythic' },
    { id:'necklace',   emoji:'📿', name:'Necklace',     coins:600,  cat:'luxury',  rarity:'epic' },
    { id:'watch',      emoji:'⌚', name:'Luxury Watch', coins:1500, cat:'luxury',  rarity:'legendary' },

    // African themed
    { id:'kente',      emoji:'🧣', name:'Kente Cloth',  coins:200,  cat:'african', rarity:'rare' },
    { id:'drums',      emoji:'🥁', name:'Afro Drums',   coins:150,  cat:'african', rarity:'' },
    { id:'mask',       emoji:'🎭', name:'African Mask', coins:300,  cat:'african', rarity:'epic' },
    { id:'lion',       emoji:'🦁', name:'Afro-Lion',    coins:5000, cat:'african', rarity:'mythic' },
    { id:'savanna',    emoji:'🌅', name:'Sunset',       coins:250,  cat:'african', rarity:'rare' },
    { id:'spices',     emoji:'🌶️', name:'Spice Pack',   coins:100,  cat:'african', rarity:'' },
    { id:'afrobeats',  emoji:'🎶', name:'Afrobeats',    coins:180,  cat:'african', rarity:'rare' },
    { id:'elephant',   emoji:'🐘', name:'Elephant',     coins:400,  cat:'african', rarity:'epic' },
  ];

  /* ── Module state ── */
  let _recipientId   = null;
  let _recipientName = '';
  let _selectedGift  = null;
  let _activeCategory = 'all';

  /* ─────────────────────────────────────────────────────────────
     BUILD SHEET DOM
  ───────────────────────────────────────────────────────────── */
  function buildSheet() {
    if (document.getElementById('am-gift-sheet')) return;

    const sheet = document.createElement('div');
    sheet.id = 'am-gift-sheet';
    sheet.innerHTML = `
      <div class="am-gs-card">
        <div class="am-gs-handle"></div>
        <div class="am-gs-header">
          <div>
            <div class="am-gs-title">🎁 Send a Gift</div>
            <div class="am-gs-recipient" id="am-gs-recipient-label">to your match</div>
          </div>
          <button class="am-gs-close" onclick="window.closeAfriMatchGiftSheet()">✕</button>
        </div>

        <!-- coin balance -->
        <div class="am-gs-coins">
          🪙 Your balance: <span class="am-gs-coins-val" id="am-gs-balance">0</span> coins
        </div>

        <!-- category tabs -->
        <div class="am-gs-tabs" id="am-gs-tabs"></div>

        <!-- gift grid -->
        <div class="am-gs-grid" id="am-gs-grid"></div>

        <!-- send bar -->
        <div class="am-gs-send-bar">
          <input class="am-gs-msg-input" id="am-gs-msg" placeholder="Add a sweet message… (optional)" maxlength="120"/>
          <button class="am-gs-send-btn" id="am-gs-send-btn" onclick="window._amGsSend()" disabled>
            Send 🎁
          </button>
        </div>
      </div>
    `;

    // Close on backdrop click
    sheet.addEventListener('click', e => {
      if (e.target === sheet) window.closeAfriMatchGiftSheet();
    });

    document.body.appendChild(sheet);
    _buildTabs();
  }

  function _buildTabs() {
    const el = document.getElementById('am-gs-tabs');
    if (!el) return;
    el.innerHTML = CATEGORIES.map(c =>
      `<button class="am-gs-tab${c.id === _activeCategory ? ' active' : ''}"
         onclick="window._amGsSetCategory('${c.id}')">${c.label}</button>`
    ).join('');
  }

  function _buildGrid() {
    const grid = document.getElementById('am-gs-grid');
    if (!grid) return;

    const coins = typeof window.userCoins !== 'undefined' ? window.userCoins : 0;
    const bal = document.getElementById('am-gs-balance');
    if (bal) bal.textContent = coins.toLocaleString();

    const items = _activeCategory === 'all'
      ? AM_GIFTS
      : AM_GIFTS.filter(g => g.cat === _activeCategory);

    grid.innerHTML = items.map(g => {
      const affordable = coins >= g.coins;
      const rarityHtml = g.rarity
        ? `<span class="am-gift-rarity-badge rarity-${g.rarity}">${g.rarity}</span>`
        : '';
      const sel = _selectedGift?.id === g.id ? ' selected' : '';
      return `<div class="am-gift-item${sel}${!affordable ? '" style="opacity:.45;cursor:not-allowed' : ''}"
          onclick="${affordable ? `window._amGsSelectGift('${g.id}')` : `window.showToast?.('⚠️ Not enough coins for ${_esc(g.name)}')`}"
          title="${_esc(g.name)} — ${g.coins} coins${!affordable ? ' (not enough coins)' : ''}">
          ${rarityHtml}
          <div class="am-gift-emoji">${g.emoji}</div>
          <div class="am-gift-name">${_esc(g.name)}</div>
          <div class="am-gift-cost">🪙 ${g.coins.toLocaleString()}</div>
        </div>`;
    }).join('');
  }

  function _esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  }

  /* ─────────────────────────────────────────────────────────────
     PUBLIC CONTROLS
  ───────────────────────────────────────────────────────────── */
  window._amGsSetCategory = function(cat) {
    _activeCategory = cat;
    _buildTabs();
    _buildGrid();
  };

  window._amGsSelectGift = function(id) {
    _selectedGift = AM_GIFTS.find(g => g.id === id) || null;
    const btn = document.getElementById('am-gs-send-btn');
    if (btn) btn.disabled = !_selectedGift;
    _buildGrid(); // re-render to show selection highlight
  };

  window._amGsSend = function() {
    if (!_selectedGift || !_recipientId || !window.currentUser) return;

    const coins   = typeof window.userCoins !== 'undefined' ? window.userCoins : 0;
    if (coins < _selectedGift.coins) {
      if (typeof window.showToast === 'function') window.showToast('⚠️ Not enough coins!');
      return;
    }

    const msg     = document.getElementById('am-gs-msg')?.value.trim() || '';
    const gift    = _selectedGift;
    const recipient = _recipientId;
    const rName   = _recipientName;

    // Deduct coins
    window.userCoins = coins - gift.coins;
    if (typeof window.saveCoins === 'function') window.saveCoins();
    if (typeof window.updateCoinDisplay === 'function') window.updateCoinDisplay();

    // Log transaction
    try {
      const saSettings = JSON.parse(localStorage.getItem('sa_settings') || '{}');
      const commRate   = saSettings.commissionRate || 10;
      const grossUsd   = gift.coins * 0.01;
      const commission = parseFloat((grossUsd * commRate / 100).toFixed(2));
      const txLog = JSON.parse(localStorage.getItem('sa_transaction_log') || '[]');
      txLog.unshift({
        ref: 'TXN' + Date.now(),
        date: new Date().toISOString(),
        user: window.currentUser.email,
        type: 'gift',
        gross: grossUsd,
        commission,
        rate: commRate,
        method: 'AfriMatch Gift',
        source: `Sent ${gift.name} to ${rName}`,
        status: 'completed',
      });
      localStorage.setItem('sa_transaction_log', JSON.stringify(txLog.slice(0, 5000)));
    } catch(e) {}

    // Admin audit log
    if (typeof window.appendAdminLog === 'function') {
      window.appendAdminLog('gift', window.currentUser.email,
        `AfriMatch gift sent: ${gift.name}`,
        `to:${rName} coins:${gift.coins}`);
    }

    // Inject gift message into the DM chat
    _injectGiftMessage(recipient, gift, msg);

    // Visual feedback
    _flyGiftEmoji(gift.emoji);
    if (typeof window.showToast === 'function') {
      window.showToast(`🎁 ${gift.emoji} ${gift.name} sent to ${rName}!`);
    }

    // Close sheet
    window.closeAfriMatchGiftSheet();
    _selectedGift = null;
  };

  function _injectGiftMessage(recipientId, gift, personalMsg) {
    if (!window.currentUser) return;
    const matchKey = [window.currentUser.email, recipientId].sort().join('::');

    // Build gift bubble content as a special message
    const giftData = {
      sender:    window.currentUser.email,
      time:      new Date().toISOString(),
      isGift:    true,
      giftId:    gift.id,
      giftEmoji: gift.emoji,
      giftName:  gift.name,
      giftCoins: gift.coins,
      giftMsg:   personalMsg,
      text:      `🎁 ${gift.emoji} Sent a ${gift.name}${personalMsg ? ` — "${personalMsg}"` : ''}`,
    };

    try {
      const DM_MSGS_KEY = 'afrib_dating_messages';
      const allMsgs = JSON.parse(localStorage.getItem(DM_MSGS_KEY) || '{}');
      if (!allMsgs[matchKey]) allMsgs[matchKey] = [];
      allMsgs[matchKey].push(giftData);
      localStorage.setItem(DM_MSGS_KEY, JSON.stringify(allMsgs));
    } catch(e) {}

    // Re-render chat if it's currently open
    if (typeof window.renderChatMessages === 'function') {
      try { window.renderChatMessages(matchKey); } catch(e) {}
    }
  }

  function _flyGiftEmoji(emoji) {
    const el = document.createElement('div');
    el.className = 'am-gift-fly';
    el.textContent = emoji;
    // centre it
    el.style.left  = (window.innerWidth  / 2 - 14) + 'px';
    el.style.top   = (window.innerHeight / 2)       + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 950);
  }

  /* ─────────────────────────────────────────────────────────────
     OPEN / CLOSE
  ───────────────────────────────────────────────────────────── */
  function openSheet(recipientId) {
    if (!window.currentUser) {
      if (typeof window.showAuth === 'function') window.showAuth('login');
      return;
    }

    _recipientId   = recipientId;
    _selectedGift  = null;
    _activeCategory = 'all';

    // Resolve recipient name from dating profile or accounts
    const profile = typeof window.getDmProfileById === 'function'
      ? window.getDmProfileById(recipientId)
      : null;
    const accounts = typeof window.getAccounts === 'function' ? window.getAccounts() : {};
    const acct     = accounts[recipientId];
    _recipientName = profile?.displayName
      || (acct ? `${acct.first || ''} ${acct.last || ''}`.trim() : recipientId);

    buildSheet();

    const labelEl = document.getElementById('am-gs-recipient-label');
    if (labelEl) labelEl.textContent = `to ${_recipientName}`;

    const sendBtn = document.getElementById('am-gs-send-btn');
    if (sendBtn) sendBtn.disabled = true;

    const msgEl = document.getElementById('am-gs-msg');
    if (msgEl) msgEl.value = '';

    _buildTabs();
    _buildGrid();

    const sheet = document.getElementById('am-gift-sheet');
    if (sheet) sheet.classList.add('open');
  }

  window.closeAfriMatchGiftSheet = function() {
    const sheet = document.getElementById('am-gift-sheet');
    if (sheet) sheet.classList.remove('open');
  };

  /* ─────────────────────────────────────────────────────────────
     PUBLIC ENTRY POINTS
  ───────────────────────────────────────────────────────────── */

  /**
   * Called from the 🎁 button in the DM chat input row.
   * Uses the currently active conversation.
   */
  window.sendAfriMatchGift = function() {
    const convo = window.dmState?.activeConvo;
    if (!convo?.otherId) {
      if (typeof window.showToast === 'function') window.showToast('⚠️ Open a chat first to send a gift');
      return;
    }
    openSheet(convo.otherId);
  };

  /**
   * Called from match cards, match popup, and anywhere a profileId is known.
   * @param {string} profileId — the dating profile id / email of the recipient
   */
  window.afriMatchSendGiftToProfile = function(profileId) {
    if (!profileId) return;
    openSheet(profileId);
  };

})();

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 2 — PATCH renderChatMessages to render gift bubbles
   Wraps the existing function to show a special gift card for gift messages.
   ═══════════════════════════════════════════════════════════════════════ */
(function patchRenderChatMessages() {
  const wait = setInterval(() => {
    if (typeof window.renderChatMessages !== 'function') return;
    clearInterval(wait);

    const orig = window.renderChatMessages;
    window.renderChatMessages = function(matchKey) {
      orig(matchKey);

      // After the original renders, upgrade gift messages into gift bubbles
      const msgsEl = document.getElementById('dmChatMessages');
      if (!msgsEl || !window.currentUser) return;

      const DM_MSGS_KEY = 'afrib_dating_messages';
      let allMsgs;
      try { allMsgs = JSON.parse(localStorage.getItem(DM_MSGS_KEY) || '{}'); }
      catch(e) { return; }
      const msgs = allMsgs[matchKey] || [];
      if (!msgs.some(m => m.isGift)) return;

      // Full re-render with gift bubble support
      const isMe = email => email === window.currentUser.email;
      msgsEl.innerHTML = msgs.map(m => {
        const mine = isMe(m.sender);
        if (m.isGift) {
          return `<div style="display:flex;flex-direction:column;align-items:${mine ? 'flex-end' : 'flex-start'};margin:4px 0">
            <div class="dm-gift-bubble">
              <div class="dm-gift-emoji-large">${m.giftEmoji || '🎁'}</div>
              <div class="dm-gift-info">
                <div class="dm-gift-label">${mine ? 'You sent' : 'Received'} a gift!</div>
                <div class="dm-gift-gname">${_escAM(m.giftName || 'Gift')}</div>
                ${m.giftMsg ? `<div class="dm-gift-gmsg">"${_escAM(m.giftMsg)}"</div>` : ''}
                <div class="dm-gift-coins">🪙 ${(m.giftCoins || 0).toLocaleString()} coins</div>
              </div>
            </div>
            <div style="font-size:10px;color:rgba(255,255,255,.3);margin-top:2px;padding:0 4px">${typeof timeAgo2 === 'function' ? timeAgo2(m.time) : ''}</div>
          </div>`;
        }
        return `<div style="display:flex;flex-direction:column;align-items:${mine ? 'flex-end' : 'flex-start'}">
          <div class="dm-msg ${mine ? 'mine' : 'theirs'}">
            ${_escAM(m.text || '')}
            <div class="dm-msg-time">${typeof timeAgo2 === 'function' ? timeAgo2(m.time) : ''}</div>
          </div>
        </div>`;
      }).join('');
      msgsEl.scrollTop = msgsEl.scrollHeight;
    };

    function _escAM(s) {
      return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
        .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
    }

    console.log('[AfriMatchGifts] renderChatMessages patched ✅');
  }, 300);
})();

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 3 — GIFT BUTTON on Swipe Cards (Discover screen)
   Injects a gift button on each profile card so users can gift
   without matching first (requires being matched — guarded in handler).
   ═══════════════════════════════════════════════════════════════════════ */
(function patchDiscoverCards() {
  const wait = setInterval(() => {
    if (typeof window.renderDiscoverCards !== 'function') return;
    clearInterval(wait);

    const orig = window.renderDiscoverCards;
    window.renderDiscoverCards = function() {
      orig.apply(this, arguments);

      // After render, add gift button to top card
      setTimeout(() => {
        const swipeArea = document.getElementById('dmSwipeArea');
        if (!swipeArea) return;

        // Only the top card (first .dm-card)
        const topCard = swipeArea.querySelector('.dm-card, .dm-swipe-card, [data-id]');
        if (!topCard || topCard.querySelector('.am-card-gift-btn')) return;

        const profileId = topCard.dataset.id || topCard.dataset.profileId;
        if (!profileId) return;

        const btn = document.createElement('button');
        btn.className = 'am-card-gift-btn';
        btn.title     = 'Send a gift';
        btn.innerHTML = '🎁';
        btn.style.cssText = [
          'position:absolute', 'top:12px', 'right:12px',
          'background:linear-gradient(135deg,rgba(255,107,157,.85),rgba(255,100,0,.7))',
          'border:none', 'border-radius:50%', 'width:36px', 'height:36px',
          'font-size:18px', 'cursor:pointer', 'z-index:10',
          'display:flex', 'align-items:center', 'justify-content:center',
          'box-shadow:0 4px 14px rgba(255,107,157,.4)',
          'transition:all .2s',
        ].join(';');
        btn.onclick = (e) => {
          e.stopPropagation();
          // Check if matched first
          const matches = typeof window.getMyMatches === 'function' ? window.getMyMatches() : [];
          const isMatch = matches.some(m => m.otherId === profileId);
          if (!isMatch) {
            if (typeof window.showToast === 'function')
              window.showToast('💕 Match with this person first to send a gift!');
            return;
          }
          window.afriMatchSendGiftToProfile(profileId);
        };

        if (getComputedStyle(topCard).position === 'static') {
          topCard.style.position = 'relative';
        }
        topCard.appendChild(btn);
      }, 100);
    };

    console.log('[AfriMatchGifts] renderDiscoverCards patched ✅');
  }, 400);
})();

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 4 — GIFT COUNT BADGE on Matches tab
   Shows how many gifts have been sent/received in each match.
   ═══════════════════════════════════════════════════════════════════════ */
(function addGiftBadgeToMatchesTab() {
  // Add a subtle "gifts sent" indicator on the Matches sub-tab
  const wait = setInterval(() => {
    const matchesTab = document.querySelector('[onclick*="matches"]');
    if (!matchesTab || matchesTab.dataset.giftPatched) return;
    clearInterval(wait);

    matchesTab.dataset.giftPatched = '1';

    // Poll gift count and update badge
    function updateGiftBadge() {
      if (!window.currentUser) return;
      try {
        const DM_MSGS_KEY = 'afrib_dating_messages';
        const allMsgs = JSON.parse(localStorage.getItem(DM_MSGS_KEY) || '{}');
        const count   = Object.values(allMsgs).flat()
          .filter(m => m.isGift && m.sender !== window.currentUser.email).length;

        let badge = matchesTab.querySelector('.am-gift-count-badge');
        if (count > 0) {
          if (!badge) {
            badge = document.createElement('span');
            badge.className = 'am-gift-count-badge';
            badge.style.cssText = 'background:#FF6B9D;color:#fff;border-radius:20px;padding:0 5px;font-size:9px;font-weight:800;margin-left:4px';
            matchesTab.appendChild(badge);
          }
          badge.textContent = count + ' 🎁';
        } else if (badge) {
          badge.remove();
        }
      } catch(e) {}
    }

    updateGiftBadge();
    setInterval(updateGiftBadge, 8000);
  }, 600);
})();

console.log('[AfriMatchGifts] afrib_afrimatch_gifts.js loaded ✅');
