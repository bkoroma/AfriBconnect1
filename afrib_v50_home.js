/* ═══════════════════════════════════════════════════════════════════════════
   AfribConnect v49
   ─────────────────────────────────────────────────────────────────────────
   1. MESSAGES — Gen-Z glassmorphic redesign
   2. HOMEPAGE — layout, live data, quick actions overhaul
   3. GIFT COIN SPLIT — 50/50 split, earned wallet, TikTok cashout flow
   4. ADMIN USER PAYOUTS — new sp-userpayouts panel with all user data
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

/* ═══════════════════════════════════════════════════════════════════════════
   PART 1 — MESSAGES: Gen-Z Style Overhaul
   ═══════════════════════════════════════════════════════════════════════════ */

(function upgradeMessenger() {
  /* Inject styles — override the messenger's embedded CSS with Gen-Z palette */
  const s = document.createElement('style');
  s.id = 'ms-v49-styles';
  s.textContent = `
  /* ── Fonts + keyframes ── */
  @keyframes msSlideIn  { from{transform:translateX(100%)} to{transform:translateX(0)} }
  @keyframes msSlideOut { from{transform:translateX(0)} to{transform:translateX(-28%)} }
  @keyframes msTypePop  { 0%,100%{transform:scale(.6);opacity:.25} 50%{transform:scale(1);opacity:1} }
  @keyframes msNewMsg   { from{opacity:0;transform:translateY(12px) scale(.95)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes msPing     { 0%{transform:scale(1);opacity:1} 70%{transform:scale(2.2);opacity:0} 100%{transform:scale(1);opacity:0} }

  /* App container */
  .ms-app {
    background: #050407 !important;
    font-family: 'Plus Jakarta Sans', 'DM Sans', sans-serif !important;
    height: calc(100dvh - 56px) !important;
  }

  /* ── List view header ── */
  #msListView .ms-header {
    background: rgba(5,4,7,.9) !important;
    backdrop-filter: blur(24px) !important;
    border-bottom: 1px solid rgba(155,89,255,.15) !important;
    padding: 14px 18px !important;
  }
  #msListView .ms-header > div:first-child {
    font-family: 'Syne', sans-serif !important;
    font-size: 22px !important;
    font-weight: 900 !important;
    background: linear-gradient(135deg,#F5C842,#FF8C00) !important;
    -webkit-background-clip: text !important;
    -webkit-text-fill-color: transparent !important;
    background-clip: text !important;
  }

  /* ── Search box ── */
  #msSearchInput, #msNewSearch {
    background: rgba(255,255,255,.06) !important;
    border: 1px solid rgba(255,255,255,.09) !important;
    border-radius: 100px !important;
    color: #fff !important;
    font-size: 14px !important;
    font-weight: 500 !important;
    padding: 10px 16px 10px 38px !important;
    transition: border-color .2s, box-shadow .2s !important;
  }
  #msSearchInput:focus, #msNewSearch:focus {
    border-color: rgba(155,89,255,.5) !important;
    box-shadow: 0 0 0 3px rgba(155,89,255,.1) !important;
    outline: none !important;
  }

  /* ── Tabs ── */
  .ms-tab-btn {
    font-family: 'Plus Jakarta Sans', sans-serif !important;
    font-size: 11px !important;
    font-weight: 800 !important;
    letter-spacing: .6px !important;
    text-transform: uppercase !important;
    border-radius: 100px !important;
    padding: 7px 16px !important;
    transition: all .18s cubic-bezier(.34,1.56,.64,1) !important;
  }
  .ms-tab-btn.active {
    background: rgba(155,89,255,.2) !important;
    border: 1px solid rgba(155,89,255,.45) !important;
    color: #c8a9ff !important;
    box-shadow: 0 2px 10px rgba(155,89,255,.2) !important;
  }
  .ms-tab-btn:not(.active) {
    background: rgba(255,255,255,.05) !important;
    border: 1px solid rgba(255,255,255,.08) !important;
    color: rgba(255,255,255,.4) !important;
  }

  /* ── Conversation list items ── */
  .ms-convo-item {
    padding: 13px 18px !important;
    border-bottom: 1px solid rgba(255,255,255,.04) !important;
    transition: background .15s !important;
    position: relative !important;
  }
  .ms-convo-item:hover, .ms-convo-item:active {
    background: rgba(155,89,255,.04) !important;
  }
  .ms-convo-item.unread {
    background: rgba(245,200,66,.025) !important;
  }
  .ms-convo-item.unread::before {
    content: '';
    position: absolute;
    left: 0; top: 50%; transform: translateY(-50%);
    width: 3px; height: 36px;
    border-radius: 0 2px 2px 0;
    background: linear-gradient(180deg,#F5C842,#FF8C00);
  }

  /* ── Avatars — story ring style ── */
  .ms-avatar {
    background: linear-gradient(135deg,#F5C842,#FF3CAC,#9B59FF) !important;
    border-radius: 50% !important;
    flex-shrink: 0 !important;
    font-family: 'Syne', sans-serif !important;
    font-weight: 900 !important;
  }
  /* Story ring on unread avatars */
  .ms-convo-item.unread .ms-avatar {
    box-shadow: 0 0 0 2px #050407, 0 0 0 4px #F5C842 !important;
  }

  /* Online dot — pulsing */
  .ms-online-dot {
    background: #00E676 !important;
    box-shadow: 0 0 6px #00E676 !important;
    animation: none !important;
  }
  .ms-online-dot::after {
    content: '';
    position: absolute; inset: -3px;
    border-radius: 50%;
    background: rgba(0,230,118,.3);
    animation: msPing 2s ease infinite;
  }

  /* Unread badge */
  .ms-unread-badge {
    background: linear-gradient(135deg,#F5C842,#FF8C00) !important;
    color: #000 !important;
    font-weight: 900 !important;
    font-size: 10px !important;
    min-width: 18px !important; height: 18px !important;
    border-radius: 100px !important;
  }

  /* Convo name */
  .ms-convo-name {
    font-weight: 700 !important;
    font-size: 14px !important;
  }
  .ms-convo-preview {
    font-size: 12px !important;
    color: rgba(255,255,255,.42) !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }
  .ms-convo-time {
    font-size: 10px !important;
    color: rgba(255,255,255,.28) !important;
    font-family: 'Space Mono', monospace !important;
  }

  /* ── Chat header ── */
  #msChatView .ms-header {
    background: rgba(5,4,7,.92) !important;
    backdrop-filter: blur(24px) !important;
    border-bottom: 1px solid rgba(155,89,255,.12) !important;
    padding: 10px 14px !important;
  }
  #msChatName {
    font-family: 'Plus Jakarta Sans', sans-serif !important;
    font-weight: 800 !important;
    font-size: 15px !important;
  }
  #msChatStatus {
    font-size: 11px !important;
    color: #00E676 !important;
    font-weight: 600 !important;
  }

  /* Action buttons in chat header */
  .ms-icon-btn {
    border-radius: 12px !important;
    transition: all .18s cubic-bezier(.34,1.56,.64,1) !important;
  }
  .ms-icon-btn:active { transform: scale(.88) !important; }

  /* ── Message area ── */
  #msMsgArea {
    background: #050407 !important;
    background-image:
      radial-gradient(ellipse 50% 40% at 20% 30%, rgba(155,89,255,.04) 0%, transparent 55%),
      radial-gradient(ellipse 40% 40% at 80% 70%, rgba(245,200,66,.03) 0%, transparent 50%) !important;
  }

  /* ── Bubbles ── */
  .ms-bubble {
    border-radius: 20px !important;
    font-size: 14px !important;
    line-height: 1.55 !important;
    max-width: 76% !important;
    animation: msNewMsg .25s cubic-bezier(.34,1.56,.64,1) both !important;
  }
  .ms-bubble.mine {
    background: linear-gradient(135deg,#F5C842,#FF8C00) !important;
    color: #000 !important;
    font-weight: 600 !important;
    border-bottom-right-radius: 4px !important;
    box-shadow: 0 4px 14px rgba(245,200,66,.2) !important;
  }
  .ms-bubble.theirs {
    background: rgba(255,255,255,.09) !important;
    border: 1px solid rgba(255,255,255,.08) !important;
    color: #fff !important;
    border-bottom-left-radius: 4px !important;
  }

  /* Reaction pills */
  .ms-react-pill {
    background: rgba(255,255,255,.07) !important;
    border: 1px solid rgba(255,255,255,.1) !important;
    border-radius: 100px !important;
    font-size: 12px !important;
    padding: 3px 9px !important;
    transition: all .15s !important;
  }
  .ms-react-pill:hover {
    background: rgba(155,89,255,.18) !important;
    border-color: rgba(155,89,255,.35) !important;
    transform: scale(1.1) !important;
  }

  /* Date separator */
  .ms-date-sep {
    font-size: 10px !important;
    font-weight: 800 !important;
    letter-spacing: 1px !important;
    text-transform: uppercase !important;
    color: rgba(255,255,255,.22) !important;
  }

  /* Reply quote */
  .ms-reply-quote {
    background: rgba(155,89,255,.07) !important;
    border-left-color: #9B59FF !important;
    border-radius: 6px !important;
  }

  /* ── Input row ── */
  #msChatView > div:last-child,
  div[style*="border-top"][style*="padding:9px"] {
    background: rgba(5,4,7,.95) !important;
    backdrop-filter: blur(20px) !important;
    border-top: 1px solid rgba(155,89,255,.12) !important;
    padding: 10px 12px 14px !important;
  }
  #msChatTextInput {
    background: rgba(255,255,255,.07) !important;
    border: 1.5px solid rgba(255,255,255,.1) !important;
    border-radius: 22px !important;
    color: #fff !important;
    font-family: 'Plus Jakarta Sans', sans-serif !important;
    font-size: 14px !important;
    padding: 10px 16px !important;
    line-height: 1.5 !important;
    resize: none !important;
    transition: border-color .2s, box-shadow .2s !important;
  }
  #msChatTextInput:focus {
    border-color: rgba(155,89,255,.5) !important;
    box-shadow: 0 0 0 3px rgba(155,89,255,.1) !important;
    outline: none !important;
  }
  #msChatTextInput::placeholder { color: rgba(255,255,255,.3) !important; }

  /* Send button */
  .ms-send-btn {
    background: linear-gradient(135deg,#9B59FF,#00D4FF) !important;
    box-shadow: 0 4px 14px rgba(155,89,255,.35) !important;
    border-radius: 50% !important;
    transition: all .2s cubic-bezier(.34,1.56,.64,1) !important;
  }
  .ms-send-btn:hover { transform: scale(1.1) !important; box-shadow: 0 6px 20px rgba(155,89,255,.5) !important; }
  .ms-send-btn:active { transform: scale(.9) !important; }

  /* Compose new chat button */
  button[title="New message"].ms-send-btn,
  #msListView .ms-send-btn {
    background: linear-gradient(135deg,#F5C842,#FF8C00) !important;
    box-shadow: 0 4px 14px rgba(245,200,66,.35) !important;
  }

  /* Icon action buttons */
  label.ms-icon-btn, button.ms-icon-btn {
    background: rgba(255,255,255,.06) !important;
    color: rgba(255,255,255,.5) !important;
    border: 1px solid rgba(255,255,255,.08) !important;
  }

  /* Emoji picker */
  #msEmojiPicker {
    background: rgba(9,8,13,.97) !important;
    border-top: 1px solid rgba(155,89,255,.15) !important;
    backdrop-filter: blur(20px) !important;
  }

  /* Typing indicator */
  .ms-typing-dot {
    background: rgba(155,89,255,.7) !important;
    animation: msTypePop .8s ease infinite !important;
    width: 7px !important; height: 7px !important;
  }
  .ms-typing-dot:nth-child(2) { animation-delay: .15s !important; }
  .ms-typing-dot:nth-child(3) { animation-delay: .30s !important; }

  /* Reply bar */
  #msReplyBar {
    background: rgba(155,89,255,.07) !important;
    border-left-color: #9B59FF !important;
    border-radius: 10px !important;
    margin: 6px 12px !important;
  }

  /* New chat list */
  #msNewList .ms-convo-item:hover {
    background: rgba(155,89,255,.06) !important;
  }

  /* Online toggle chip */
  #msOnlineToggle {
    border-radius: 100px !important;
    font-size: 11px !important;
    font-weight: 800 !important;
    letter-spacing: .3px !important;
    text-transform: uppercase !important;
    transition: all .2s !important;
  }

  /* New message header */
  #msNewView .ms-header {
    background: rgba(5,4,7,.92) !important;
    backdrop-filter: blur(24px) !important;
    border-bottom: 1px solid rgba(155,89,255,.12) !important;
  }
  #msNewView .ms-header > div:nth-child(2) {
    font-family: 'Syne', sans-serif !important;
    font-weight: 900 !important;
  }
  `;
  document.head.appendChild(s);
})();


/* ═══════════════════════════════════════════════════════════════════════════
   PART 2 — HOMEPAGE: Comprehensive fix + Gen-Z upgrade
   ═══════════════════════════════════════════════════════════════════════════ */

(function upgradeHomepage() {
  const CSS = document.createElement('style');
  CSS.id = 'home-v49-styles';
  CSS.textContent = `
  /* ── Screen ── */
  #screen-home { min-height: 100dvh; }
  #screen-home .screen-content { padding: 0 0 100px !important; }

  /* ── Header ── */
  .home-header {
    padding: 16px 18px 0 !important;
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    margin-bottom: 4px !important;
  }

  /* ── Hero banner ── */
  .home-hero-banner {
    margin: 12px 16px 0 !important;
    border-radius: 22px !important;
    height: 165px !important;
    background: linear-gradient(140deg,#0d0a1a 0%,#170f2e 50%,#0a0c18 100%) !important;
    border: 1px solid rgba(155,89,255,.2) !important;
    box-shadow: 0 20px 50px rgba(0,0,0,.6), inset 0 1px 0 rgba(155,89,255,.12) !important;
    overflow: hidden !important;
    position: relative !important;
  }
  .home-hero-banner::before {
    content: '';
    position: absolute; inset: 0;
    background:
      radial-gradient(ellipse 55% 90% at 88% 50%, rgba(245,200,66,.18) 0%, transparent 65%),
      radial-gradient(ellipse 35% 60% at 15% 90%, rgba(155,89,255,.12) 0%, transparent 55%),
      radial-gradient(ellipse 25% 40% at 55% 5%,  rgba(0,212,255,.07) 0%, transparent 50%);
    pointer-events: none;
  }
  .hhb-title {
    font-family: 'Syne', sans-serif !important;
    font-size: 20px !important;
    font-weight: 900 !important;
    line-height: 1.15 !important;
    color: #fff !important;
  }
  .hhb-title span {
    background: linear-gradient(135deg,#F5C842,#FF8C00) !important;
    -webkit-background-clip: text !important;
    -webkit-text-fill-color: transparent !important;
    background-clip: text !important;
  }
  .hhb-live-chip {
    display: inline-flex !important;
    align-items: center !important;
    gap: 5px !important;
    background: rgba(0,230,118,.08) !important;
    border: 1px solid rgba(0,230,118,.2) !important;
    border-radius: 100px !important;
    font-size: 9px !important;
    font-weight: 800 !important;
    letter-spacing: 1.2px !important;
    color: #00E676 !important;
    padding: 4px 10px !important;
    margin-bottom: 8px !important;
  }
  .hhb-ticker-row {
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    margin-top: auto !important;
  }
  .hhb-ticker-badge {
    background: #FF5757 !important;
    color: #fff !important;
    font-size: 8px !important;
    font-weight: 900 !important;
    padding: 2px 7px !important;
    border-radius: 4px !important;
    letter-spacing: .6px !important;
    animation: homePulse 1.5s ease infinite !important;
    flex-shrink: 0 !important;
  }
  @keyframes homePulse { 0%,100%{opacity:1} 50%{opacity:.6} }

  #homeTicker {
    font-size: 11px !important;
    color: rgba(255,255,255,.55) !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    font-weight: 500 !important;
  }

  /* ── XP bar ── */
  .home-xp-bar-wrap {
    display: flex !important;
    align-items: center !important;
    gap: 12px !important;
    background: rgba(23,20,31,.7) !important;
    border: 1px solid rgba(255,255,255,.07) !important;
    border-radius: 16px !important;
    padding: 10px 14px !important;
    margin: 12px 16px 10px !important;
  }
  .hxp-level-badge {
    width: 36px !important; height: 36px !important;
    border-radius: 50% !important;
    background: linear-gradient(135deg,#F5C842,#FF8C00) !important;
    color: #000 !important;
    font-family: 'Syne', sans-serif !important;
    font-size: 14px !important;
    font-weight: 900 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    flex-shrink: 0 !important;
    box-shadow: 0 4px 12px rgba(245,200,66,.3) !important;
  }
  .hxp-info { flex: 1 !important; }
  .hxp-top { display: flex !important; justify-content: space-between !important; margin-bottom: 5px !important; }
  .hxp-name { font-size: 12px !important; font-weight: 700 !important; color: rgba(255,255,255,.8) !important; }
  .hxp-pts  { font-family: 'Space Mono', monospace !important; font-size: 11px !important; color: #F5C842 !important; }
  .hxp-track { background: rgba(255,255,255,.07) !important; border-radius: 6px !important; height: 6px !important; overflow: hidden !important; }
  .hxp-fill  { height: 100% !important; border-radius: 6px !important; background: linear-gradient(90deg,#F5C842,#FF8C00) !important; box-shadow: 0 0 8px rgba(245,200,66,.4) !important; transition: width .8s cubic-bezier(.34,1.56,.64,1) !important; }

  /* ── Wallet card ── */
  .home-wallet-card {
    margin: 0 16px 14px !important;
    border-radius: 22px !important;
    position: relative !important;
    overflow: hidden !important;
  }
  .hwc-coin-chip {
    position: absolute !important;
    top: 14px !important; right: 14px !important;
    background: rgba(245,200,66,.1) !important;
    border: 1px solid rgba(245,200,66,.3) !important;
    border-radius: 100px !important;
    font-size: 11px !important;
    font-weight: 800 !important;
    color: #F5C842 !important;
    padding: 4px 10px !important;
    font-family: 'Space Mono', monospace !important;
  }
  .hwc-btns {
    display: flex !important;
    gap: 8px !important;
    flex-wrap: wrap !important;
    margin-top: 16px !important;
  }

  /* ── Section label ── */
  .section-label {
    font-family: 'Plus Jakarta Sans', sans-serif !important;
    font-size: 10px !important;
    font-weight: 800 !important;
    letter-spacing: 2px !important;
    text-transform: uppercase !important;
    color: rgba(255,255,255,.35) !important;
    padding: 14px 18px 8px !important;
    display: block !important;
    margin: 0 !important;
  }

  /* ── Quick actions grid ── */
  .home-quick-grid {
    display: grid !important;
    grid-template-columns: repeat(5, 1fr) !important;
    gap: 10px !important;
    padding: 0 16px !important;
    margin-bottom: 4px !important;
  }
  @media (max-width: 400px) {
    .home-quick-grid { grid-template-columns: repeat(4, 1fr) !important; }
  }
  .hq-card {
    background: rgba(23,20,31,.7) !important;
    border: 1px solid rgba(255,255,255,.07) !important;
    border-radius: 16px !important;
    padding: 14px 8px 12px !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    gap: 5px !important;
    cursor: pointer !important;
    transition: all .2s cubic-bezier(.34,1.56,.64,1) !important;
    position: relative !important;
    overflow: hidden !important;
    -webkit-tap-highlight-color: transparent !important;
  }
  .hq-card:active { transform: scale(.9) !important; background: rgba(155,89,255,.1) !important; }
  .hq-icon { font-size: 22px !important; line-height: 1 !important; }
  .hq-label { font-size: 10px !important; font-weight: 800 !important; color: rgba(255,255,255,.8) !important; text-align: center !important; letter-spacing: .3px !important; }
  .hq-sub { font-size: 8px !important; color: rgba(255,255,255,.3) !important; text-align: center !important; display: none !important; }

  /* ── Gift earned chip ── */
  #homeGiftEarnedChip {
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    background: rgba(155,89,255,.08) !important;
    border: 1px solid rgba(155,89,255,.25) !important;
    border-radius: 14px !important;
    padding: 12px 16px !important;
    margin: 0 16px 10px !important;
    cursor: pointer !important;
    transition: all .2s !important;
  }
  #homeGiftEarnedChip:active { transform: scale(.97) !important; }

  /* ── Games strip ── */
  .home-games-strip {
    display: flex !important;
    gap: 10px !important;
    padding: 0 16px !important;
    overflow-x: auto !important;
    scrollbar-width: none !important;
    -webkit-overflow-scrolling: touch !important;
  }
  .home-games-strip::-webkit-scrollbar { display: none; }
  .hgs-card {
    background: rgba(23,20,31,.7) !important;
    border: 1px solid rgba(255,255,255,.07) !important;
    border-radius: 16px !important;
    padding: 14px 16px !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    gap: 6px !important;
    min-width: 72px !important;
    flex-shrink: 0 !important;
    cursor: pointer !important;
    position: relative !important;
    transition: all .2s cubic-bezier(.34,1.56,.64,1) !important;
  }
  .hgs-card:active { transform: scale(.9) !important; }
  .hgs-icon { font-size: 26px !important; }
  .hgs-name { font-size: 9px !important; font-weight: 800 !important; color: rgba(255,255,255,.6) !important; text-align: center !important; letter-spacing: .3px !important; text-transform: uppercase !important; }
  .hgs-badge {
    position: absolute !important; top: 5px !important; right: 5px !important;
    background: linear-gradient(135deg,#FF5757,#FF3CAC) !important;
    color: #fff !important; font-size: 7px !important; font-weight: 900 !important;
    padding: 2px 5px !important; border-radius: 4px !important; letter-spacing: .5px !important;
  }

  /* ── Trending ── */
  .home-trending {
    display: grid !important;
    grid-template-columns: 1fr 1fr !important;
    gap: 10px !important;
    padding: 0 16px !important;
    margin-bottom: 4px !important;
  }
  .trending-item {
    border-radius: 14px !important;
    padding: 12px !important;
    border: 1px solid rgba(255,255,255,.06) !important;
    background: rgba(23,20,31,.6) !important;
    transition: all .2s !important;
  }
  .trending-item:active { transform: scale(.97) !important; }

  /* ── Share card ── */
  .home-share-card {
    margin: 0 16px 16px !important;
    background: rgba(23,20,31,.6) !important;
    border: 1px solid rgba(255,255,255,.07) !important;
    border-radius: 18px !important;
    padding: 16px !important;
  }
  .home-share-title {
    font-size: 13px !important;
    font-weight: 700 !important;
    margin-bottom: 10px !important;
  }
  .home-share-btns { display: flex !important; gap: 8px !important; flex-wrap: wrap !important; }
  .share-btn {
    font-size: 11px !important; font-weight: 800 !important;
    padding: 7px 14px !important; border-radius: 100px !important;
    border: none !important; cursor: pointer !important;
    letter-spacing: .3px !important; transition: transform .15s !important;
  }
  .share-btn:active { transform: scale(.92) !important; }
  .share-btn-wa { background: #22c55e !important; color: #000 !important; }
  .share-btn-tw { background: rgba(255,255,255,.1) !important; color: #fff !important; border: 1px solid rgba(255,255,255,.15) !important; }
  .share-btn-fb { background: rgba(59,130,246,.2) !important; color: #93c5fd !important; }
  .share-btn-cp { background: rgba(255,255,255,.07) !important; color: rgba(255,255,255,.7) !important; }
  `;
  document.head.appendChild(CSS);

  /* Live ticker — rotates fun messages */
  function refreshTicker() {
    const el = document.getElementById('homeTicker');
    if (!el) return;
    const msgs = [
      '🌍 Africans connecting across 54 countries right now',
      '🎁 Gifts sent today — be the next to send one!',
      '💰 Money moving across borders in seconds',
      '🎲 Games live — join a Ludo match now',
      '✨ New members joining every minute',
      '🤖 AfriBAI answering questions across the continent',
    ];
    let i = 0;
    el.textContent = msgs[0];
    setInterval(() => {
      el.style.opacity = '0';
      setTimeout(() => { i = (i + 1) % msgs.length; el.textContent = msgs[i]; el.style.opacity = '1'; }, 300);
    }, 4000);
    el.style.transition = 'opacity .3s';
  }

  /* Gift earned chip — shows on home if user has earned coins */
  function renderGiftEarnedChip() {
    const email = window.currentUser?.email;
    if (!email) return;
    const earned = parseInt(localStorage.getItem('afrib_gift_earned_' + email) || '0');
    if (!earned) return;

    let chip = document.getElementById('homeGiftEarnedChip');
    if (!chip) {
      chip = document.createElement('div');
      chip.id = 'homeGiftEarnedChip';
      chip.onclick = () => { if (typeof openGiftCashout === 'function') openGiftCashout(); };
      // Insert after XP bar
      const xpBar = document.querySelector('.home-xp-bar-wrap');
      if (xpBar) xpBar.parentNode?.insertBefore(chip, xpBar.nextSibling);
    }
    chip.innerHTML = `
      <span style="font-size:22px">🎁</span>
      <div style="flex:1">
        <div style="font-size:12px;font-weight:800;color:#fff">You've earned gift coins!</div>
        <div style="font-size:11px;color:rgba(155,89,255,.8);font-weight:600">🪙 ${earned.toLocaleString()} coins ready to use or cash out</div>
      </div>
      <span style="font-size:16px;color:rgba(155,89,255,.6)">→</span>
    `;
  }

  /* Patch enterApp and showScreen('home') */
  const origEnter = window.enterApp;
  window.enterApp = function(screen) {
    try { if (typeof origEnter === 'function') origEnter.call(this, screen); } catch(_) {}
    setTimeout(() => { refreshTicker(); renderGiftEarnedChip(); }, 500);
  };

  const origShowScreen = window.showScreen;
  window.showScreen = function(name) {
    try { if (typeof origShowScreen === 'function') origShowScreen.call(this, name); } catch(_) {}
    if (name === 'home') setTimeout(() => { refreshTicker(); renderGiftEarnedChip(); }, 200);
  };
  window.showScreen._v49 = true;

  document.addEventListener('DOMContentLoaded', () => setTimeout(() => { refreshTicker(); renderGiftEarnedChip(); }, 600));
})();


/* ═══════════════════════════════════════════════════════════════════════════
   PART 3 — GIFT COIN SPLIT + CASHOUT (TikTok model)
   ═══════════════════════════════════════════════════════════════════════════

   Flow:
   • Sender buys 100 coins → spends them on a gift
   • App takes 50% (50 coins platform revenue) → logged to sa_gift_revenue
   • Recipient gets 50% (50 coins) → stored at afrib_gift_earned_{email}
   • Recipient can: (a) buy more coins with earned coins, (b) cash out

   Storage keys:
   • afrib_gift_earned_{email}    — coins earned from gifts received
   • afrib_cashout_requests       — array of pending cashout requests
   • sa_gift_revenue              — platform's accumulated gift commission
   • sa_settings.giftSplitRate   — configurable, default 50
*/

const GIFT_EARNED_KEY = email => 'afrib_gift_earned_' + email;
const CASHOUT_REQUESTS_KEY = 'afrib_cashout_requests';
const GIFT_REVENUE_KEY = 'sa_gift_revenue';

/* ── Helpers ── */
window.getGiftEarned = function getGiftEarned(email) {
  return parseInt(localStorage.getItem(GIFT_EARNED_KEY(email)) || '0');
};
function getGiftEarned(email) { return window.getGiftEarned(email); }

window.addGiftEarned = function(email, coins) {
  if (!email || coins <= 0) return;
  const current = getGiftEarned(email);
  localStorage.setItem(GIFT_EARNED_KEY(email), String(current + Math.floor(coins)));
  // Notify recipient
  try {
    if (window.currentUser?.email === email) {
      window._payRefreshAllCoinDisplays?.();
      const chip2 = document.getElementById('homeGiftEarnedChip');
      if (chip2) {
        const total = current + Math.floor(coins);
        const sub = chip2.querySelector('div div:last-child');
        if (sub) sub.textContent = `🪙 ${total.toLocaleString()} coins ready to use or cash out`;
      }
    }
  } catch(_) {}
};

window.addGiftRevenue = function(coins) {
  try {
    const current = parseInt(localStorage.getItem(GIFT_REVENUE_KEY) || '0');
    localStorage.setItem(GIFT_REVENUE_KEY, String(current + Math.floor(coins)));
  } catch(_) {}
};

window.getSplitRate = function() {
  try {
    const s = JSON.parse(localStorage.getItem('sa_settings') || '{}');
    return Math.max(1, Math.min(99, parseInt(s.giftSplitRate || '50')));
  } catch(_) { return 50; }
};

/* ── PATCH gmSendGift to apply 50/50 split ── */
(function patchGmSendSplit() {
  function doPatch() {
    const orig = window.gmSendGift;
    if (typeof orig !== 'function' || orig._v49split) return false;

    window.gmSendGift = function() {
      // Capture what we need BEFORE the send happens
      const gift      = window._gmSelectedGift;
      const recipient = window._gmRecipient;
      const qty       = window._gmQty || 1;
      if (!gift || !recipient || !window.currentUser) { try { orig.apply(this, arguments); } catch(_) {} return; }

      const totalCoins   = gift.coins * qty;
      const splitRate    = getSplitRate();               // default 50%
      const recipientPct = splitRate;                    // recipient gets splitRate %
      const platformPct  = 100 - splitRate;              // platform gets the rest
      const recipientGet = Math.floor(totalCoins * recipientPct / 100);
      const platformGet  = totalCoins - recipientGet;
      const recipEmail   = recipient.email || recipient.username;

      // Run the original send (deducts full coins from sender, plays animation, logs)
      try { orig.apply(this, arguments); } catch(e) { console.error('[gmSendGift]', e); return; }

      // Credit recipient's earned wallet
      if (recipEmail) {
        addGiftEarned(recipEmail, recipientGet);

        // Also credit actual coins if recipient is the current user (same device demo)
        if (recipEmail === window.currentUser?.email) {
          window.afribSetCoins?.(recipEmail,
            (window.afribGetCoins?.(recipEmail) || 0) + recipientGet,
            'gift_received');
        } else {
          // Cross-user: write to recipient's account in localStorage
          try {
            const accounts = JSON.parse(localStorage.getItem('afrib_accounts') || '{}');
            if (accounts[recipEmail]) {
              const prevCoins = parseInt(localStorage.getItem('afrib_gift_earned_' + recipEmail) || '0');
              // Already written by addGiftEarned above — just ensure account knows
              accounts[recipEmail].giftEarned = (accounts[recipEmail].giftEarned || 0) + recipientGet;
              localStorage.setItem('afrib_accounts', JSON.stringify(accounts));
            }
          } catch(_) {}
        }

        // In-app notification to recipient
        try {
          if (typeof sendInAppNotification === 'function') {
            sendInAppNotification(
              '🎁 You received a gift!',
              `${gift.emoji} ${gift.name}${qty > 1 ? ' ×' + qty : ''} — you earned 🪙${recipientGet} coins`
            );
          }
        } catch(_) {}
      }

      // Platform revenue
      addGiftRevenue(platformGet);

      // Log to admin transaction ledger
      try {
        const log = JSON.parse(localStorage.getItem('sa_transaction_log') || '[]');
        log.unshift({
          ref:        'GIFT' + Date.now(),
          date:       new Date().toISOString(),
          user:       window.currentUser.email,
          type:       'gift',
          gross:      totalCoins,
          recipient:  recipEmail,
          coins_sent: totalCoins,
          recipient_earned: recipientGet,
          platform_earned:  platformGet,
          split_rate: splitRate,
          gift_name:  gift.name,
          status:     'completed',
        });
        if (log.length > 5000) log.splice(5000);
        localStorage.setItem('sa_transaction_log', JSON.stringify(log));
      } catch(_) {}
    };

    window.gmSendGift._v49split = true;
    return true;
  }

  if (!doPatch()) {
    const t = setInterval(() => { if (doPatch()) clearInterval(t); }, 300);
    setTimeout(() => clearInterval(t), 8000);
  }
})();


/* ── Also process earned coins when processing pending gifts ── */
(function patchGmProcessPending() {
  const orig = window.gmProcessPendingGifts;
  if (typeof orig !== 'function') return;
  window.gmProcessPendingGifts = function(userEmail) {
    if (!userEmail) return;
    try {
      const pending = JSON.parse(localStorage.getItem('afrib_giftme_pending') || '[]');
      const mine    = pending.filter(p => p.to === userEmail);
      // For each pending gift, credit the earned wallet
      mine.forEach(p => {
        const totalCoins = (p.coins || 0);
        const splitRate  = getSplitRate();
        const earned     = Math.floor(totalCoins * splitRate / 100);
        if (earned > 0) addGiftEarned(userEmail, earned);
      });
    } catch(_) {}
    try { orig.call(this, userEmail); } catch(e) { console.error('[gmProcessPending]', e); }
  };
})();


/* ─────────────────────────────────────────────────────────────────────────
   GIFT CASHOUT UI — TikTok-style cashout drawer
─────────────────────────────────────────────────────────────────────────── */
(function buildGiftCashoutUI() {
  /* Inject styles */
  const s = document.createElement('style');
  s.id = 'cashout-v49-styles';
  s.textContent = `
  /* ── Cashout overlay ── */
  #giftCashoutOverlay {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(0,0,0,.88);
    backdrop-filter: blur(16px);
    display: none; align-items: flex-end; justify-content: center;
  }
  #giftCashoutOverlay.open { display: flex; }

  /* ── Sheet ── */
  .gco-sheet {
    width: 100%; max-width: 480px;
    background: linear-gradient(180deg, #0d0b18 0%, #130f22 100%);
    border: 1px solid rgba(155,89,255,.25);
    border-radius: 28px 28px 0 0;
    padding: 0 0 40px;
    animation: gcoUp .35s cubic-bezier(.34,1.56,.64,1) both;
    max-height: 92vh; overflow-y: auto;
  }
  @keyframes gcoUp { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }

  .gco-handle {
    width: 44px; height: 4px; border-radius: 2px;
    background: rgba(255,255,255,.15);
    margin: 14px auto 0;
  }
  .gco-header {
    padding: 18px 22px 0;
    display: flex; align-items: center; gap: 12px;
  }
  .gco-title {
    font-family: 'Syne', sans-serif;
    font-size: 20px; font-weight: 900;
    background: linear-gradient(135deg,#F5C842,#FF3CAC,#9B59FF);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .gco-close {
    margin-left: auto;
    width: 30px; height: 30px; border-radius: 50%;
    background: rgba(255,255,255,.07);
    border: 1px solid rgba(255,255,255,.1);
    color: rgba(255,255,255,.5);
    font-size: 14px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all .2s;
  }
  .gco-close:hover { background: rgba(255,87,87,.15); color: #f87171; }

  /* Balance card */
  .gco-balance-card {
    margin: 16px 18px;
    background: linear-gradient(135deg,#1a0e2e,#240b3a);
    border: 1px solid rgba(155,89,255,.3);
    border-radius: 20px;
    padding: 20px;
    text-align: center;
    position: relative; overflow: hidden;
  }
  .gco-balance-card::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse at 50% 0%, rgba(155,89,255,.2), transparent 65%);
    pointer-events: none;
  }
  .gco-balance-label {
    font-size: 10px; font-weight: 800;
    letter-spacing: 2px; text-transform: uppercase;
    color: rgba(255,255,255,.4); margin-bottom: 6px;
  }
  .gco-balance-amount {
    font-family: 'Syne', sans-serif;
    font-size: 42px; font-weight: 900;
    background: linear-gradient(135deg,#F5C842,#FF8C00);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text; line-height: 1;
  }
  .gco-balance-usd {
    font-size: 13px; color: rgba(255,255,255,.4);
    font-family: 'Space Mono', monospace;
    margin-top: 4px;
  }

  /* Options */
  .gco-options {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    padding: 4px 18px 16px;
  }
  .gco-opt {
    background: rgba(255,255,255,.05);
    border: 1.5px solid rgba(255,255,255,.09);
    border-radius: 18px;
    padding: 16px 14px;
    cursor: pointer;
    transition: all .2s cubic-bezier(.34,1.56,.64,1);
    text-align: center;
  }
  .gco-opt:hover { border-color: rgba(155,89,255,.4); background: rgba(155,89,255,.07); transform: translateY(-2px); }
  .gco-opt:active { transform: scale(.95); }
  .gco-opt.selected { border-color: rgba(245,200,66,.6); background: rgba(245,200,66,.08); }
  .gco-opt-icon { font-size: 28px; margin-bottom: 8px; }
  .gco-opt-title { font-size: 13px; font-weight: 800; color: #fff; margin-bottom: 3px; }
  .gco-opt-sub   { font-size: 10px; color: rgba(255,255,255,.4); line-height: 1.4; }

  /* Method picker */
  .gco-method-section { padding: 0 18px 16px; }
  .gco-section-title {
    font-size: 10px; font-weight: 800;
    letter-spacing: 2px; text-transform: uppercase;
    color: rgba(255,255,255,.35);
    margin-bottom: 10px;
  }
  .gco-method-grid {
    display: grid; grid-template-columns: repeat(3,1fr); gap: 8px;
  }
  .gco-method-btn {
    background: rgba(255,255,255,.05);
    border: 1.5px solid rgba(255,255,255,.08);
    border-radius: 14px; padding: 12px 8px;
    cursor: pointer; transition: all .18s;
    text-align: center;
  }
  .gco-method-btn:active { transform: scale(.93); }
  .gco-method-btn.active {
    border-color: rgba(245,200,66,.55);
    background: rgba(245,200,66,.07);
  }
  .gco-method-icon { font-size: 22px; margin-bottom: 4px; }
  .gco-method-name { font-size: 10px; font-weight: 700; color: rgba(255,255,255,.7); }

  /* Amount input */
  .gco-amount-section { padding: 0 18px 14px; }
  .gco-amount-input {
    width: 100%; box-sizing: border-box;
    background: rgba(255,255,255,.07);
    border: 1.5px solid rgba(255,255,255,.1);
    border-radius: 14px;
    padding: 14px 18px; color: #fff;
    font-family: 'Space Mono', monospace;
    font-size: 20px; font-weight: 700;
    text-align: center; outline: none;
    transition: border-color .2s, box-shadow .2s;
  }
  .gco-amount-input:focus {
    border-color: rgba(245,200,66,.5);
    box-shadow: 0 0 0 3px rgba(245,200,66,.1);
  }
  .gco-amount-hint {
    font-size: 11px; color: rgba(255,255,255,.35);
    text-align: center; margin-top: 6px;
    font-family: 'Space Mono', monospace;
  }

  /* Quick amounts */
  .gco-quick-row {
    display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px;
  }
  .gco-quick-btn {
    background: rgba(255,255,255,.06);
    border: 1px solid rgba(255,255,255,.1);
    border-radius: 100px; padding: 6px 14px;
    font-size: 12px; font-weight: 700;
    color: rgba(255,255,255,.6); cursor: pointer;
    transition: all .15s;
  }
  .gco-quick-btn:hover { background: rgba(245,200,66,.1); border-color: rgba(245,200,66,.3); color: #F5C842; }

  /* CTA */
  .gco-cta-section { padding: 4px 18px 0; }
  .gco-submit-btn {
    width: 100%;
    background: linear-gradient(135deg,#F5C842,#FF8C00);
    border: none; border-radius: 100px;
    color: #000; font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 15px; font-weight: 900;
    padding: 16px; cursor: pointer;
    letter-spacing: .4px; text-transform: uppercase;
    box-shadow: 0 6px 20px rgba(245,200,66,.35);
    transition: all .2s cubic-bezier(.34,1.56,.64,1);
  }
  .gco-submit-btn:hover { transform: scale(1.02); box-shadow: 0 10px 28px rgba(245,200,66,.5); }
  .gco-submit-btn:active { transform: scale(.96); }
  .gco-submit-btn:disabled { opacity: .35; cursor: not-allowed; }

  /* History */
  .gco-history-section { padding: 16px 18px 0; }
  .gco-history-item {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid rgba(255,255,255,.05);
  }
  .gco-history-icon {
    width: 36px; height: 36px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; flex-shrink: 0;
  }
  .gco-status-pill {
    font-size: 10px; font-weight: 800; letter-spacing: .5px;
    text-transform: uppercase; padding: 3px 9px;
    border-radius: 100px;
  }
  .gco-status-pending  { background: rgba(245,200,66,.12); color: #F5C842; }
  .gco-status-approved { background: rgba(0,230,118,.12);  color: #00E676; }
  .gco-status-rejected { background: rgba(255,87,87,.12);  color: #f87171; }
  `;
  document.head.appendChild(s);

  /* Build the overlay DOM */
  function buildOverlay() {
    if (document.getElementById('giftCashoutOverlay')) return;
    const el = document.createElement('div');
    el.id = 'giftCashoutOverlay';
    el.innerHTML = `
    <div class="gco-sheet" onclick="event.stopPropagation()">
      <div class="gco-handle"></div>
      <div class="gco-header">
        <span style="font-size:26px">💸</span>
        <div class="gco-title">Gift Earnings</div>
        <button class="gco-close" onclick="closeGiftCashout()">✕</button>
      </div>

      <div class="gco-balance-card">
        <div class="gco-balance-label">Earned from Gifts</div>
        <div class="gco-balance-amount" id="gcoBal">0</div>
        <div class="gco-balance-usd" id="gcoBalUsd">≈ $0.00 USD</div>
      </div>

      <div style="padding:0 18px 14px">
        <div class="gco-section-title">What would you like to do?</div>
        <div class="gco-options">
          <div class="gco-opt selected" id="gco-opt-buy" onclick="gcoSelectMode('buy')">
            <div class="gco-opt-icon">🪙</div>
            <div class="gco-opt-title">Buy More Coins</div>
            <div class="gco-opt-sub">Exchange earned coins for spend coins at 1:1</div>
          </div>
          <div class="gco-opt" id="gco-opt-cash" onclick="gcoSelectMode('cash')">
            <div class="gco-opt-icon">💵</div>
            <div class="gco-opt-title">Cash Out</div>
            <div class="gco-opt-sub">Withdraw to mobile money, bank, or PayPal</div>
          </div>
        </div>
      </div>

      <!-- BUY MODE -->
      <div id="gco-buy-section">
        <div class="gco-amount-section">
          <div class="gco-section-title">Amount to convert</div>
          <input type="number" class="gco-amount-input" id="gcoBuyAmt" placeholder="100" min="10" step="10" oninput="gcoUpdateBuyPreview()"/>
          <div class="gco-amount-hint" id="gcoBuyHint">You'll receive 100 spend coins</div>
          <div class="gco-quick-row">
            ${[50,100,200,500].map(n=>`<button class="gco-quick-btn" onclick="document.getElementById('gcoBuyAmt').value=${n};gcoUpdateBuyPreview()">${n}</button>`).join('')}
          </div>
        </div>
        <div class="gco-cta-section">
          <button class="gco-submit-btn" id="gcoBuyBtn" onclick="gcoExecuteBuy()">Convert to Spend Coins 🪙</button>
        </div>
      </div>

      <!-- CASH MODE -->
      <div id="gco-cash-section" style="display:none">
        <div class="gco-method-section">
          <div class="gco-section-title">Withdraw to</div>
          <div class="gco-method-grid" id="gcoMethodGrid"></div>
        </div>
        <div class="gco-amount-section">
          <div class="gco-section-title">Coins to cash out</div>
          <input type="number" class="gco-amount-input" id="gcoCashAmt" placeholder="100" min="100" step="50" oninput="gcoUpdateCashPreview()"/>
          <div class="gco-amount-hint" id="gcoCashHint">Minimum 100 coins · Rate: $1 per 100 coins</div>
          <div class="gco-quick-row">
            ${[100,250,500,1000].map(n=>`<button class="gco-quick-btn" onclick="document.getElementById('gcoCashAmt').value=${n};gcoUpdateCashPreview()">${n}</button>`).join('')}
          </div>
        </div>
        <div class="gco-cta-section">
          <button class="gco-submit-btn" id="gcoCashBtn" onclick="gcoSubmitCashout()">Request Cash Out 💸</button>
        </div>
      </div>

      <!-- History -->
      <div class="gco-history-section">
        <div class="gco-section-title">Recent Requests</div>
        <div id="gcoCashoutHistory"></div>
      </div>
    </div>`;
    el.addEventListener('click', closeGiftCashout);
    document.body.appendChild(el);
  }

  /* Public API */
  window.openGiftCashout = function() {
    buildOverlay();
    const email = window.currentUser?.email;
    const earned = getGiftEarned(email);
    const settings = JSON.parse(localStorage.getItem('sa_settings') || '{}');
    const rate = parseFloat(settings.coinCashoutRate || '1') / 100; // $X per 100 coins

    const el = document.getElementById('giftCashoutOverlay');
    if (!el) return;

    // Balance
    const balEl = document.getElementById('gcoBal');
    const usdEl = document.getElementById('gcoBalUsd');
    if (balEl) balEl.textContent = earned.toLocaleString();
    if (usdEl) usdEl.textContent = `≈ $${(earned * rate).toFixed(2)} USD`;

    // Render method buttons from linked payments
    const grid = document.getElementById('gcoMethodGrid');
    if (grid) {
      const linked = window.currentUser?.linkedPayments || [];
      const methods = [
        { type:'mpesa',  name:'M-Pesa',  icon:'📱' },
        { type:'mtn',    name:'MTN',     icon:'📶' },
        { type:'airtel', name:'Airtel',  icon:'📡' },
        { type:'paypal', name:'PayPal',  icon:'🅿️' },
        { type:'bank',   name:'Bank',    icon:'🏦' },
        { type:'orange', name:'Orange',  icon:'🟠' },
      ].filter(m => linked.some(l => l.type === m.type) || ['mpesa','paypal','bank'].includes(m.type));

      grid.innerHTML = methods.map(m => `
        <div class="gco-method-btn ${m.type==='mpesa'?'active':''}" id="gco-method-${m.type}"
             onclick="gcoSelectMethod('${m.type}',this)" data-method="${m.type}">
          <div class="gco-method-icon">${m.icon}</div>
          <div class="gco-method-name">${m.name}</div>
        </div>`).join('');
      window._gcoCashMethod = 'mpesa';
    }

    // History
    gcoRenderHistory();

    el.classList.add('open');
  };

  window.closeGiftCashout = function() {
    document.getElementById('giftCashoutOverlay')?.classList.remove('open');
  };

  window.gcoSelectMode = function(mode) {
    document.getElementById('gco-opt-buy')?.classList.toggle('selected', mode === 'buy');
    document.getElementById('gco-opt-cash')?.classList.toggle('selected', mode === 'cash');
    document.getElementById('gco-buy-section').style.display  = mode === 'buy'  ? '' : 'none';
    document.getElementById('gco-cash-section').style.display = mode === 'cash' ? '' : 'none';
    window._gcoCashMode = mode;
  };

  window.gcoSelectMethod = function(type, el) {
    document.querySelectorAll('.gco-method-btn').forEach(b => b.classList.remove('active'));
    el?.classList.add('active');
    window._gcoCashMethod = type;
  };

  window.gcoUpdateBuyPreview = function() {
    const amt = parseInt(document.getElementById('gcoBuyAmt')?.value || '0');
    const hint = document.getElementById('gcoBuyHint');
    if (hint) hint.textContent = amt > 0 ? `You'll receive ${amt.toLocaleString()} spend coins` : 'Enter an amount';
  };

  window.gcoUpdateCashPreview = function() {
    const amt = parseInt(document.getElementById('gcoCashAmt')?.value || '0');
    const settings = JSON.parse(localStorage.getItem('sa_settings') || '{}');
    const rate = parseFloat(settings.coinCashoutRate || '1') / 100;
    const hint = document.getElementById('gcoCashHint');
    if (hint) hint.textContent = amt >= 100
      ? `≈ $${(amt * rate).toFixed(2)} USD · ${window._gcoCashMethod || 'M-Pesa'}`
      : 'Minimum 100 coins';
  };

  window.gcoExecuteBuy = function() {
    const email  = window.currentUser?.email;
    const amt    = parseInt(document.getElementById('gcoBuyAmt')?.value || '0');
    const earned = getGiftEarned(email);
    if (amt < 10)       { window.showToast('⚠️ Minimum 10 coins'); return; }
    if (amt > earned)   { window.showToast(`⚠️ You only have ${earned.toLocaleString()} earned coins`); return; }

    // Deduct from earned, credit to spend
    localStorage.setItem(GIFT_EARNED_KEY(email), String(earned - amt));
    window.afribSetCoins?.(email, (window.afribGetCoins?.(email) || 0) + amt, 'gift_earned_convert');

    // Update balance display
    const newEarned = earned - amt;
    const balEl = document.getElementById('gcoBal');
    if (balEl) balEl.textContent = newEarned.toLocaleString();

    closeGiftCashout();
    window.showToast(`✅ ${amt.toLocaleString()} earned coins converted to spend coins!`);
    window._payRefreshAllCoinDisplays?.();
  };

  window.gcoSubmitCashout = function() {
    const email  = window.currentUser?.email;
    const amt    = parseInt(document.getElementById('gcoCashAmt')?.value || '0');
    const method = window._gcoCashMethod || 'mpesa';
    const earned = getGiftEarned(email);
    const settings = JSON.parse(localStorage.getItem('sa_settings') || '{}');
    const rate  = parseFloat(settings.coinCashoutRate || '1') / 100;

    if (!email) { window.showToast('⚠️ Please log in'); return; }
    if (amt < 100) { window.showToast('⚠️ Minimum cashout is 100 coins'); return; }
    if (amt > earned) { window.showToast(`⚠️ You only have ${earned.toLocaleString()} earned coins`); return; }

    // Find linked payment method detail
    const linked = window.currentUser?.linkedPayments || [];
    const pm = linked.find(p => p.type === method);
    const methodDetail = pm?.maskedDetail || method.toUpperCase();

    const request = {
      id:       'CO' + Date.now(),
      email,
      name:     `${window.currentUser.first} ${window.currentUser.last}`.trim(),
      coins:    amt,
      usd:      parseFloat((amt * rate).toFixed(2)),
      method,
      methodDetail,
      status:   'pending',
      requestedAt: new Date().toISOString(),
    };

    // Save request
    try {
      const requests = JSON.parse(localStorage.getItem(CASHOUT_REQUESTS_KEY) || '[]');
      requests.unshift(request);
      localStorage.setItem(CASHOUT_REQUESTS_KEY, JSON.stringify(requests));
    } catch(_) {}

    // Deduct from earned (lock it)
    localStorage.setItem(GIFT_EARNED_KEY(email), String(earned - amt));
    const balEl = document.getElementById('gcoBal');
    if (balEl) balEl.textContent = (earned - amt).toLocaleString();

    gcoRenderHistory();
    closeGiftCashout();
    window.showToast(`✅ Cashout request for $${request.usd.toFixed(2)} submitted!`);
    window.sendInAppNotification?.('💸 Cashout Requested', `$${request.usd.toFixed(2)} via ${method} — admin review pending`);
  };

  function gcoRenderHistory() {
    const el = document.getElementById('gcoCashoutHistory');
    if (!el || !window.currentUser?.email) return;
    try {
      const all = JSON.parse(localStorage.getItem(CASHOUT_REQUESTS_KEY) || '[]');
      const mine = all.filter(r => r.email === window.currentUser.email).slice(0, 8);
      if (!mine.length) { el.innerHTML = '<div style="font-size:12px;color:rgba(255,255,255,.25);text-align:center;padding:16px">No requests yet</div>'; return; }
      const icons = { mpesa:'📱', mtn:'📶', paypal:'🅿️', bank:'🏦', airtel:'📡', orange:'🟠' };
      el.innerHTML = mine.map(r => `
        <div class="gco-history-item">
          <div class="gco-history-icon" style="background:rgba(255,255,255,.06)">${icons[r.method]||'💸'}</div>
          <div style="flex:1">
            <div style="font-size:13px;font-weight:700;color:#fff">$${r.usd.toFixed(2)} · 🪙${r.coins.toLocaleString()}</div>
            <div style="font-size:11px;color:rgba(255,255,255,.35)">${r.methodDetail} · ${new Date(r.requestedAt).toLocaleDateString()}</div>
          </div>
          <span class="gco-status-pill gco-status-${r.status}">${r.status}</span>
        </div>`).join('');
    } catch(_) { el.innerHTML = ''; }
  }

  window.gcoRenderHistory = gcoRenderHistory;
})();


/* ═══════════════════════════════════════════════════════════════════════════
   PART 4 — ADMIN: User Payout Panel  (sp-userpayouts)
   ═══════════════════════════════════════════════════════════════════════════ */

(function buildAdminUserPayouts() {

  /* ── Inject tab + panel into superadmin ── */
  function tryInject() {
    const tabBar = document.querySelector('.sa-tabs, [class*="sa-tab"][onclick]')?.closest('div') ||
                   document.querySelector('#sp-revenue')?.previousElementSibling?.querySelector('div') ||
                   document.querySelector('.sa-nav, [class*="sa-tab-bar"]');

    // Find the tab strip — the row that contains saPanel buttons
    const allTabs = Array.from(document.querySelectorAll('[onclick*="saPanel"]'));
    if (!allTabs.length) return false;
    const tabStrip = allTabs[0].closest('div');
    if (!tabStrip) return false;

    if (tabStrip.querySelector('[data-up-tab]')) return true;

    // Add tab button
    const btn = document.createElement('button');
    btn.className = 'sa-tab';
    btn.setAttribute('data-up-tab', '1');
    btn.setAttribute('onclick', "saPanel(this,'userpayouts')");
    btn.textContent = '👛 User Payouts';
    tabStrip.appendChild(btn);

    // Find panels container
    const panelContainer = document.getElementById('sp-revenue')?.parentNode;
    if (!panelContainer) return false;

    if (document.getElementById('sp-userpayouts')) return true;

    const panel = document.createElement('div');
    panel.className = 'sa-panel';
    panel.id = 'sp-userpayouts';
    panel.innerHTML = `
<div class="panel-header">
  <div class="panel-title">👛 User Gift Payouts</div>
  <div class="panel-sub">All users' earned gift coins, cashout requests, and payout status</div>
</div>

<!-- Summary strip -->
<div id="upSummaryStrip" style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px"></div>

<!-- Cashout Requests table -->
<div class="sa-card" style="margin-bottom:20px">
  <div class="sa-card-title" style="display:flex;justify-content:space-between;align-items:center">
    <div><span>📋</span> Pending Cashout Requests</div>
    <div style="display:flex;gap:8px">
      <select id="upStatusFilter" onchange="loadUserPayouts()" style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:5px 10px;color:var(--white);font-size:12px">
        <option value="all">All statuses</option>
        <option value="pending" selected>Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>
      <button class="sa-btn-sm btn-gold" onclick="loadUserPayouts()">🔄 Refresh</button>
    </div>
  </div>
  <div class="tbl-wrap" style="margin:0">
    <table class="sa-tbl">
      <thead>
        <tr>
          <th>User</th><th>Request ID</th><th>Coins</th><th>USD Value</th>
          <th>Method</th><th>Account</th><th>Requested</th><th>Status</th><th>Actions</th>
        </tr>
      </thead>
      <tbody id="upRequestsBody"></tbody>
    </table>
  </div>
</div>

<!-- All Users Earned Coins table -->
<div class="sa-card">
  <div class="sa-card-title" style="display:flex;justify-content:space-between;align-items:center">
    <div><span>🪙</span> All Users — Earned Gift Coins</div>
    <input type="text" id="upUserSearch" placeholder="🔍 Search users…" oninput="loadUserPayouts()"
           style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:7px 12px;color:var(--white);font-size:12px;max-width:220px"/>
  </div>
  <div class="tbl-wrap" style="margin:0">
    <table class="sa-tbl">
      <thead>
        <tr>
          <th>User</th><th>Earned Coins</th><th>USD Value</th>
          <th>Total Gifts Received</th><th>Cashout Requests</th>
          <th>Wallet Balance</th><th>Status</th><th>Actions</th>
        </tr>
      </thead>
      <tbody id="upUsersBody"></tbody>
    </table>
  </div>
</div>
`;
    panelContainer.appendChild(panel);

    // Register in saPanel loaders
    try {
      const origSaPanel = window.saPanel;
      if (typeof origSaPanel === 'function' && !origSaPanel._v49up) {
        window.saPanel = function(btn, name) {
          origSaPanel.call(this, btn, name);
          if (name === 'userpayouts') {
            try { loadUserPayouts(); } catch(e) { console.error('[loadUserPayouts]', e); }
          }
        };
        window.saPanel._v49up = true;
      }
    } catch(_) {}

    return true;
  }

  /* ── loadUserPayouts ── */
  window.loadUserPayouts = function() {
    try {
      const filterStatus = document.getElementById('upStatusFilter')?.value || 'all';
      const searchQ = (document.getElementById('upUserSearch')?.value || '').toLowerCase();
      const settings = JSON.parse(localStorage.getItem('sa_settings') || '{}');
      const cashoutRate = parseFloat(settings.coinCashoutRate || '1') / 100; // per coin
      const allRequests = JSON.parse(localStorage.getItem(CASHOUT_REQUESTS_KEY) || '[]');
      const allUsers = Object.values(JSON.parse(localStorage.getItem('afrib_accounts') || '{}'));
      const giftRevenue = parseInt(localStorage.getItem(GIFT_REVENUE_KEY) || '0');

      /* ── Summary ── */
      const totalEarned = allUsers.reduce((s, u) =>
        s + parseInt(localStorage.getItem(GIFT_EARNED_KEY(u.email)) || '0'), 0);
      const pendingRequests = allRequests.filter(r => r.status === 'pending');
      const pendingUSD = pendingRequests.reduce((s, r) => s + (r.usd || 0), 0);
      const paidUSD = allRequests.filter(r => r.status === 'approved').reduce((s, r) => s + (r.usd || 0), 0);

      const strip = document.getElementById('upSummaryStrip');
      if (strip) {
        strip.innerHTML = [
          { label:'Total Gift Revenue', val:'🪙 ' + giftRevenue.toLocaleString(), color:'#F5C842',   sub:'Platform 50% share' },
          { label:'User Earned Coins',  val:'🪙 ' + totalEarned.toLocaleString(), color:'#9B59FF',   sub:'Across all users' },
          { label:'Pending Cashout',    val:'$' + pendingUSD.toFixed(2),          color:'#fbbf24',   sub: pendingRequests.length + ' requests' },
          { label:'Total Paid Out',     val:'$' + paidUSD.toFixed(2),             color:'#00E676',   sub:'Approved & completed' },
        ].map(c => `
          <div style="background:var(--bg3,#17141f);border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:14px 16px">
            <div style="font-size:10px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,.35);margin-bottom:4px">${c.label}</div>
            <div style="font-size:22px;font-weight:900;color:${c.color};line-height:1.1">${c.val}</div>
            <div style="font-size:11px;color:rgba(255,255,255,.3);margin-top:3px">${c.sub}</div>
          </div>`).join('');
      }

      /* ── Cashout requests table ── */
      const reqBody = document.getElementById('upRequestsBody');
      if (reqBody) {
        const filtered = allRequests.filter(r => {
          if (filterStatus !== 'all' && r.status !== filterStatus) return false;
          if (searchQ && !(r.email + r.name + r.method).toLowerCase().includes(searchQ)) return false;
          return true;
        });

        const statusBadge = s => ({
          pending:  '<span style="padding:2px 9px;border-radius:100px;font-size:10px;font-weight:800;background:rgba(251,191,36,.12);color:#fbbf24">PENDING</span>',
          approved: '<span style="padding:2px 9px;border-radius:100px;font-size:10px;font-weight:800;background:rgba(0,230,118,.12);color:#00E676">APPROVED</span>',
          rejected: '<span style="padding:2px 9px;border-radius:100px;font-size:10px;font-weight:800;background:rgba(255,87,87,.12);color:#f87171">REJECTED</span>',
        })[s] || s;

        reqBody.innerHTML = filtered.length ? filtered.map(r => `
          <tr>
            <td>
              <div style="font-weight:700;font-size:13px">${(r.name||r.email||'').replace(/</g,'&lt;')}</div>
              <div style="font-size:10px;color:rgba(255,255,255,.35)">${(r.email||'').replace(/</g,'&lt;')}</div>
            </td>
            <td style="font-family:monospace;font-size:11px;color:rgba(255,255,255,.45)">${r.id}</td>
            <td style="font-weight:700;color:#F5C842">🪙 ${(r.coins||0).toLocaleString()}</td>
            <td style="font-weight:700;color:#00E676">$${(r.usd||0).toFixed(2)}</td>
            <td>${r.method||'—'}</td>
            <td style="font-size:11px;color:rgba(255,255,255,.45)">${(r.methodDetail||'—').replace(/</g,'&lt;')}</td>
            <td style="font-size:11px;color:rgba(255,255,255,.35)">${r.requestedAt ? new Date(r.requestedAt).toLocaleDateString() : '—'}</td>
            <td>${statusBadge(r.status)}</td>
            <td>
              ${r.status === 'pending' ? `
              <div style="display:flex;gap:5px">
                <button class="sa-btn-sm" style="background:rgba(0,230,118,.1);border:1px solid rgba(0,230,118,.25);color:#00E676;padding:4px 10px;font-size:11px;border-radius:6px;cursor:pointer"
                        onclick="upApproveRequest('${r.id}')">✅ Approve</button>
                <button class="sa-btn-sm" style="background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);color:#f87171;padding:4px 10px;font-size:11px;border-radius:6px;cursor:pointer"
                        onclick="upRejectRequest('${r.id}')">✕ Reject</button>
              </div>` : '—'}
            </td>
          </tr>`).join('')
          : '<tr><td colspan="9" style="text-align:center;color:rgba(255,255,255,.3);padding:20px">No cashout requests found</td></tr>';
      }

      /* ── Users earned coins table ── */
      const usersBody = document.getElementById('upUsersBody');
      if (usersBody) {
        const filtered = allUsers.filter(u => {
          if (!searchQ) return true;
          return (u.email + u.first + u.last + u.username).toLowerCase().includes(searchQ);
        }).sort((a, b) =>
          parseInt(localStorage.getItem(GIFT_EARNED_KEY(b.email)) || '0') -
          parseInt(localStorage.getItem(GIFT_EARNED_KEY(a.email)) || '0')
        );

        usersBody.innerHTML = filtered.length ? filtered.map(u => {
          const earned = parseInt(localStorage.getItem(GIFT_EARNED_KEY(u.email)) || '0');
          const usdVal = (earned * cashoutRate).toFixed(2);
          const userRequests = allRequests.filter(r => r.email === u.email);
          const pendingReqs = userRequests.filter(r => r.status === 'pending').length;
          const init = ((u.first||'U')[0] + (u.last||'U')[0]).toUpperCase();
          const status = u.banned ? 'banned' : (u.suspended ? 'suspended' : 'active');
          return `
            <tr>
              <td>
                <div style="display:flex;align-items:center;gap:8px">
                  <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#F5C842,#FF3CAC);color:#000;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;flex-shrink:0">${init}</div>
                  <div>
                    <div style="font-weight:700;font-size:13px">${(u.first||'').replace(/</g,'&lt;')} ${(u.last||'').replace(/</g,'&lt;')}</div>
                    <div style="font-size:10px;color:rgba(255,255,255,.35)">${(u.email||'').replace(/</g,'&lt;')}</div>
                  </div>
                </div>
              </td>
              <td style="font-weight:900;color:#F5C842;font-size:15px">${earned > 0 ? '🪙 ' + earned.toLocaleString() : '<span style="color:rgba(255,255,255,.2)">—</span>'}</td>
              <td style="color:#00E676;font-weight:700">${earned > 0 ? '$' + usdVal : '—'}</td>
              <td style="font-size:12px;color:rgba(255,255,255,.5)">${userRequests.length} total</td>
              <td>
                ${pendingReqs > 0
                  ? `<span style="padding:2px 9px;border-radius:100px;font-size:10px;font-weight:800;background:rgba(251,191,36,.12);color:#fbbf24">${pendingReqs} pending</span>`
                  : '<span style="color:rgba(255,255,255,.2);font-size:12px">—</span>'}
              </td>
              <td style="font-weight:700;color:#F5C842">$${(u.walletBalance||0).toFixed(2)}</td>
              <td><span class="badge badge-${status==='active'?'green':status==='banned'?'red':'orange'}">${status}</span></td>
              <td>
                <button class="sa-btn-sm btn-gold" style="padding:4px 10px;font-size:11px"
                        onclick="upGrantCoins('${(u.email||'').replace(/'/g,"\\'")}')" ${earned===0?'disabled':''}>
                  💸 Pay Out
                </button>
              </td>
            </tr>`;
        }).join('')
        : '<tr><td colspan="8" style="text-align:center;color:rgba(255,255,255,.3);padding:20px">No users found</td></tr>';
      }
    } catch(e) { console.error('[loadUserPayouts]', e); if (typeof toastSa==='function') toastSa('⚠️ Payout panel error: ' + e.message); }
  };

  /* ── Approve request ── */
  window.upApproveRequest = function(reqId) {
    try {
      const requests = JSON.parse(localStorage.getItem(CASHOUT_REQUESTS_KEY) || '[]');
      const req = requests.find(r => r.id === reqId);
      if (!req) { if (typeof toastSa==='function') toastSa('⚠️ Request not found'); return; }
      if (!confirm(`Approve cashout of $${req.usd.toFixed(2)} (🪙${req.coins}) for ${req.name}?`)) return;
      req.status = 'approved';
      req.approvedAt = new Date().toISOString();
      localStorage.setItem(CASHOUT_REQUESTS_KEY, JSON.stringify(requests));

      // Add to payout history
      try {
        const hist = JSON.parse(localStorage.getItem('sa_payout_history') || '[]');
        hist.unshift({ date: new Date().toISOString(), amount: req.usd, account: req.methodDetail, method: req.method, ref: req.id, status: 'completed', user: req.email, coins: req.coins });
        localStorage.setItem('sa_payout_history', JSON.stringify(hist));
      } catch(_) {}

      // Notify user
      try {
        const accts = JSON.parse(localStorage.getItem('afrib_accounts') || '{}');
        if (accts[req.email]) {
          if (!accts[req.email].notifications) accts[req.email].notifications = [];
          accts[req.email].notifications.unshift({ type:'payout', icon:'💸', title:'Cashout Approved!', body:`$${req.usd.toFixed(2)} via ${req.method} is on its way!`, time: new Date().toISOString(), read: false });
          localStorage.setItem('afrib_accounts', JSON.stringify(accts));
        }
      } catch(_) {}

      if (typeof toastSa==='function') toastSa(`✅ Cashout approved — $${req.usd.toFixed(2)} for ${req.name}`);
      loadUserPayouts();
    } catch(e) { if (typeof toastSa==='function') toastSa('⚠️ Approve error: ' + e.message); }
  };

  /* ── Reject request ── */
  window.upRejectRequest = function(reqId) {
    try {
      const reason = prompt('Rejection reason (optional):') ?? '';
      const requests = JSON.parse(localStorage.getItem(CASHOUT_REQUESTS_KEY) || '[]');
      const req = requests.find(r => r.id === reqId);
      if (!req) return;
      req.status = 'rejected';
      req.rejectedAt = new Date().toISOString();
      req.rejectionReason = reason;

      // Refund the coins back to user's earned wallet
      const currentEarned = parseInt(localStorage.getItem(GIFT_EARNED_KEY(req.email)) || '0');
      localStorage.setItem(GIFT_EARNED_KEY(req.email), String(currentEarned + req.coins));
      localStorage.setItem(CASHOUT_REQUESTS_KEY, JSON.stringify(requests));

      if (typeof toastSa==='function') toastSa(`↩️ Rejected — 🪙${req.coins} refunded to ${req.name}`);
      loadUserPayouts();
    } catch(e) { if (typeof toastSa==='function') toastSa('⚠️ Reject error: ' + e.message); }
  };

  /* ── Manual pay out ── */
  window.upGrantCoins = function(email) {
    const earned = parseInt(localStorage.getItem(GIFT_EARNED_KEY(email)) || '0');
    if (!earned) { if (typeof toastSa==='function') toastSa('⚠️ No earned coins to pay out'); return; }
    const settings = JSON.parse(localStorage.getItem('sa_settings') || '{}');
    const rate = parseFloat(settings.coinCashoutRate || '1') / 100;
    const usd = (earned * rate).toFixed(2);
    if (!confirm(`Pay out $${usd} (🪙${earned} coins) to ${email}?`)) return;

    // Create approved request directly
    const req = {
      id: 'CO' + Date.now(), email, name: email,
      coins: earned, usd: parseFloat(usd),
      method: 'manual', methodDetail: 'Admin manual payout',
      status: 'approved', requestedAt: new Date().toISOString(), approvedAt: new Date().toISOString(),
    };
    try {
      const requests = JSON.parse(localStorage.getItem(CASHOUT_REQUESTS_KEY) || '[]');
      requests.unshift(req);
      localStorage.setItem(CASHOUT_REQUESTS_KEY, JSON.stringify(requests));
      // Zero out earned
      localStorage.setItem(GIFT_EARNED_KEY(email), '0');
    } catch(_) {}
    if (typeof toastSa==='function') toastSa(`✅ Manual payout of $${usd} recorded for ${email}`);
    loadUserPayouts();
  };

  /* Try injecting on load */
  const obs = new MutationObserver(() => { try { if (tryInject()) obs.disconnect(); } catch(_) {} });
  obs.observe(document.body, { childList: true, subtree: true });
  document.addEventListener('DOMContentLoaded', () => setTimeout(() => { tryInject(); }, 800));
  setTimeout(() => tryInject(), 1500);
  setTimeout(() => tryInject(), 4000);
})();

/* ── GiftMe trigger: add cashout button to GiftMe earned display ── */
(function addCashoutEntryPoints() {
  // Add cashout shortcut to wallet screen
  function addWalletEntry() {
    const wallet = document.getElementById('screen-wallet');
    if (!wallet || wallet.querySelector('#walletCashoutBtn')) return;
    const btn = document.createElement('button');
    btn.id = 'walletCashoutBtn';
    btn.onclick = () => { if (typeof openGiftCashout === 'function') openGiftCashout(); };
    btn.style.cssText = 'display:none;width:100%;margin:10px 0;padding:14px;background:linear-gradient(135deg,rgba(155,89,255,.15),rgba(0,212,255,.1));border:1.5px solid rgba(155,89,255,.3);border-radius:16px;color:#c8a9ff;font-size:14px;font-weight:800;cursor:pointer;text-align:left;font-family:inherit;';
    btn.innerHTML = '🎁 <span>Gift Earnings &amp; Cashout</span> <span style="float:right;color:rgba(155,89,255,.5)">→</span>';

    const firstChild = wallet.querySelector('.screen-content > div, .screen-content > section, .screen-content');
    if (firstChild) firstChild.insertBefore?.(btn, firstChild.firstChild);

    // Update visibility
    function update() {
      const email = window.currentUser?.email;
      const earned = email ? parseInt(localStorage.getItem(GIFT_EARNED_KEY(email)) || '0') : 0;
      if (earned > 0) {
        btn.style.display = 'block';
        btn.innerHTML = `🎁 <span>Gift Earnings: 🪙${earned.toLocaleString()} earned</span> <span style="float:right;color:rgba(155,89,255,.5)">→</span>`;
      } else {
        btn.style.display = 'none';
      }
    }
    update();
    setInterval(update, 3000);
  }

  setTimeout(addWalletEntry, 1500);
})();

console.log('[AfribConnect] ✅ v49 — Messages Gen-Z | Homepage | Gift Coin Split 50/50 | Cashout | Admin User Payouts');
