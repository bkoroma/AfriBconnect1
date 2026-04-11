/*!
 * AfribConnect v71 — Master Upgrade
 * 1. Emoji Keyboard (latest Unicode 15.1 emojis)
 * 2. YourStyle Feed — TikTok-style For You / Friends / Everyone 3-tab
 * 3. Live Gifts expanded to 10, admin/superadmin coin limit control
 * 4. Home Page complete redesign
 * 5. Gifter Badges — 8K clear + 3D design
 * 6. Full app error catching
 */
(function AfribV71MasterUpgrade() {
  'use strict';

  // ── Inject v71 home CSS immediately (not deferred) ──
  (function injectV71CSS() {
    if (document.getElementById('v71-home-css')) return;
    const css = document.createElement('style');
    css.id = 'v71-home-css';
    css.textContent = `
      #screen-home .screen-content { padding:0 0 80px; }
      .v71-hero { position:relative; overflow:hidden; background:linear-gradient(135deg,#180030 0%,#0d001a 40%,#001830 100%); padding:20px 16px 18px; border-bottom:1px solid rgba(255,255,255,.05); }
      .v71-hero::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse 80% 60% at 50% -20%,rgba(212,175,55,.12),transparent); pointer-events:none; }
      .v71-hero-greeting { font-size:13px; color:rgba(255,255,255,.5); font-weight:600; margin-bottom:3px; }
      .v71-hero-name { font-size:26px; font-weight:900; line-height:1.1; background:linear-gradient(135deg,#fff 60%,var(--gold,#D4AF37)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
      .v71-hero-sub { font-size:12px; color:rgba(255,255,255,.4); margin-top:3px; }
      .v71-stats-row { display:flex; gap:8px; margin-top:14px; }
      .v71-stat-chip { flex:1; background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.08); border-radius:12px; padding:10px 6px 8px; text-align:center; cursor:pointer; transition:background .15s; }
      .v71-stat-chip:active { background:rgba(255,255,255,.1); }
      .v71-stat-val { font-size:16px; font-weight:900; color:var(--gold,#D4AF37); line-height:1; }
      .v71-stat-lbl { font-size:9px; color:rgba(255,255,255,.4); font-weight:700; margin-top:3px; letter-spacing:.3px; }
      .v71-wallet { margin:12px 16px 0; background:linear-gradient(135deg,#1a0840 0%,#0c0420 50%,#001830 100%); border:1px solid rgba(212,175,55,.25); border-radius:20px; padding:18px 20px; position:relative; overflow:hidden; }
      .v71-wallet::after { content:''; position:absolute; top:-20px; right:-20px; width:120px; height:120px; border-radius:50%; background:radial-gradient(circle,rgba(212,175,55,.1),transparent 70%); pointer-events:none; }
      .v71-wallet-label { font-size:10px; color:rgba(255,255,255,.4); font-weight:700; letter-spacing:1px; margin-bottom:5px; }
      .v71-wallet-amount { font-size:30px; font-weight:900; color:#fff; line-height:1; }
      .v71-wallet-usd { font-size:12px; color:rgba(255,255,255,.4); margin-top:2px; }
      .v71-wallet-coins { position:absolute; top:18px; right:20px; background:rgba(212,175,55,.15); border:1px solid rgba(212,175,55,.3); border-radius:20px; padding:5px 12px; font-size:12px; font-weight:800; color:var(--gold,#D4AF37); }
      .v71-wallet-btns { display:flex; gap:8px; margin-top:12px; }
      .v71-wallet-btn { flex:1; padding:10px 6px; border-radius:12px; font-size:12px; font-weight:800; border:none; cursor:pointer; transition:all .15s; }
      .v71-wallet-btn.primary { background:linear-gradient(135deg,var(--gold,#D4AF37),#b8860b); color:#000; }
      .v71-wallet-btn.ghost { background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.12); color:rgba(255,255,255,.7); }
      .v71-wallet-btn:active { transform:scale(.95); }
      .v71-section-hdr { display:flex; align-items:center; justify-content:space-between; padding:16px 16px 10px; }
      .v71-section-title { font-size:15px; font-weight:900; color:#fff; }
      .v71-section-see { font-size:12px; color:var(--gold,#D4AF37); font-weight:700; cursor:pointer; }
      .v71-quick-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; padding:0 16px; }
      .v71-qa-item { background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.07); border-radius:16px; padding:14px 4px 10px; text-align:center; cursor:pointer; transition:all .15s; }
      .v71-qa-item:active { transform:scale(.93); background:rgba(255,255,255,.09); }
      .v71-qa-icon { font-size:24px; margin-bottom:5px; display:block; }
      .v71-qa-label { font-size:10px; font-weight:700; color:rgba(255,255,255,.8); line-height:1.2; }
      .v71-games-scroll { display:flex; gap:10px; padding:0 16px; overflow-x:auto; scrollbar-width:none; scroll-snap-type:x mandatory; -webkit-overflow-scrolling:touch; }
      .v71-games-scroll::-webkit-scrollbar { display:none; }
      .v71-game-card { flex-shrink:0; width:110px; height:130px; border-radius:18px; background:linear-gradient(135deg,rgba(255,255,255,.08),rgba(255,255,255,.03)); border:1px solid rgba(255,255,255,.1); display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer; scroll-snap-align:start; transition:transform .15s; position:relative; overflow:hidden; }
      .v71-game-card:active { transform:scale(.93); }
      .v71-game-icon { font-size:36px; margin-bottom:7px; }
      .v71-game-name { font-size:11px; font-weight:800; color:#fff; text-align:center; padding:0 4px; }
      .v71-game-badge { position:absolute; top:8px; right:8px; background:var(--gold,#D4AF37); color:#000; font-size:7px; font-weight:900; border-radius:5px; padding:2px 4px; letter-spacing:.3px; }
      .v71-live-strip { display:flex; gap:12px; padding:0 16px; overflow-x:auto; scrollbar-width:none; }
      .v71-live-strip::-webkit-scrollbar { display:none; }
      .v71-live-card { flex-shrink:0; width:72px; text-align:center; cursor:pointer; }
      .v71-live-avatar { width:60px; height:60px; border-radius:50%; border:2.5px solid #ff4757; margin:0 auto 5px; background:linear-gradient(135deg,#1a0a30,#050210); display:flex; align-items:center; justify-content:center; font-size:20px; position:relative; overflow:hidden; }
      .v71-live-dot { position:absolute; bottom:1px; right:1px; width:13px; height:13px; background:#ff4757; border-radius:50%; border:2px solid var(--bg,#0d001a); animation:livePulse 1.4s ease-in-out infinite; }
      .v71-live-name { font-size:10px; color:rgba(255,255,255,.6); font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      .v71-xp-bar { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.07); border-radius:14px; padding:11px 14px; display:flex; align-items:center; gap:12px; }
      .v71-xp-level { width:34px; height:34px; border-radius:50%; background:linear-gradient(135deg,var(--gold,#D4AF37),#b8860b); display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:900; color:#000; flex-shrink:0; }
      .v71-xp-track { flex:1; height:5px; background:rgba(255,255,255,.1); border-radius:3px; overflow:hidden; }
      .v71-xp-fill { height:100%; background:linear-gradient(90deg,var(--gold,#D4AF37),#ff9800); border-radius:3px; transition:width .6s ease; }
    `;
    if (document.head) document.head.appendChild(css);
    else document.addEventListener('DOMContentLoaded', () => document.head.appendChild(css));
  })();


  // ═══════════════════════════════════════════════════════════
  // § 1  EMOJI KEYBOARD — latest Unicode 15.1
  // Research: iOS 17, Android 14, Unicode 15.1 — newest emojis
  // ═══════════════════════════════════════════════════════════
  const EMOJI_DATA = {
    'Smileys': [
      '😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','🫠','😉','😊','😇',
      '🥰','😍','🤩','😘','😗','😚','😙','🥲','😋','😛','😜','🤪','😝','🤑',
      '🤗','🤭','🫢','🫣','🤫','🤔','🫡','🤐','🤨','😐','😑','😶','🫥','😶‍🌫️',
      '😏','😒','🙄','😬','😮‍💨','🤥','🫨','😌','😔','😪','🤤','😴','😷','🤒',
      '🤕','🤢','🤮','🤧','🥵','🥶','🥴','😵','😵‍💫','🤯','🤠','🥳','🥸','😎',
      '🤓','🧐','😕','🫤','😟','🙁','☹️','😮','😯','😲','😳','🥺','🥹','😦',
      '😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱',
      '😤','😡','😠','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽',
      '👾','🤖','😺','😸','😹','😻','😼','😽','🙀','😿','😾',
      // New in Unicode 15+
      '🫨','🫠','🫢','🫣','🫡','🫤','🥹','🫥',
    ],
    'People': [
      '👋','🤚','🖐️','✋','🖖','🫱','🫲','🫳','🫴','🫵','👌','🤌','🤏','✌️',
      '🤞','🫰','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','🫵','👍','👎',
      '✊','👊','🤛','🤜','👏','🙌','🫶','👐','🤲','🤝','🙏','✍️','💅','🤳',
      '💪','🦾','🦿','🦵','🦶','👂','🦻','👃','🫀','🫁','🧠','🦷','🦴','👀',
      '👁️','👅','👄','🫦','💋','👶','🧒','👦','👧','🧑','👱','👨','🧔','🧔‍♂️',
      '🧔‍♀️','👨‍🦰','👨‍🦱','👨‍🦳','👨‍🦲','👩','👩‍🦰','🧑‍🦰','👩‍🦱','🧑‍🦱','👩‍🦳','🧑‍🦳',
      '👩‍🦲','🧑‍🦲','👱‍♀️','👱‍♂️','🧓','👴','👵','🙍','🙍‍♂️','🙍‍♀️','🙎','🙎‍♂️','🙎‍♀️',
      '🙅','🙅‍♂️','🙅‍♀️','🙆','🙆‍♂️','🙆‍♀️','💁','💁‍♂️','💁‍♀️','🙋','🙋‍♂️','🙋‍♀️',
      '🧏','🧏‍♂️','🧏‍♀️','🙇','🙇‍♂️','🙇‍♀️','🤦','🤦‍♂️','🤦‍♀️','🤷','🤷‍♂️','🤷‍♀️',
      '👮','👮‍♂️','👮‍♀️','🕵️','🕵️‍♂️','🕵️‍♀️','💂','💂‍♂️','💂‍♀️','🥷','👷','👷‍♂️','👷‍♀️',
      '🫅','🤴','👸','👳','👳‍♂️','👳‍♀️','👲','🧕','🤵','🤵‍♂️','🤵‍♀️','👰','👰‍♂️','👰‍♀️',
      '🤰','🫃','🫄','🤱','👼','🎅','🤶','🧑‍🎄','🦸','🦸‍♂️','🦸‍♀️','🦹','🦹‍♂️','🦹‍♀️',
      '🧙','🧙‍♂️','🧙‍♀️','🧝','🧝‍♂️','🧝‍♀️','🧛','🧛‍♂️','🧛‍♀️','🧟','🧟‍♂️','🧟‍♀️','🧞',
      '🧞‍♂️','🧞‍♀️','🧜','🧜‍♂️','🧜‍♀️','🧚','🧚‍♂️','🧚‍♀️','🧌','👩‍❤️‍👨','👩‍❤️‍👩','👨‍❤️‍👨',
    ],
    'Nature': [
      '🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐻‍❄️','🐨','🐯','🦁','🐮','🐷',
      '🐽','🐸','🐵','🙈','🙉','🙊','🐒','🐔','🐧','🐦','🐦‍⬛','🐤','🐣','🐥',
      '🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🪱','🐛','🦋','🐌','🐞',
      '🐜','🪲','🦟','🦗','🪳','🕷️','🦂','🐢','🐍','🦎','🦖','🦕','🐙','🦑',
      '🪼','🦐','🦞','🦀','🦞','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐊','🐅',
      '🐆','🦓','🦍','🦧','🦣','🐘','🦛','🦏','🐪','🐫','🦒','🦘','🦬','🐃',
      '🐂','🐄','🐎','🐖','🐏','🐑','🦙','🐐','🦌','🐕','🐩','🦮','🐕‍🦺','🐈',
      '🐈‍⬛','🪶','🐓','🦃','🦤','🦚','🦜','🦢','🦩','🕊️','🐇','🦝','🦨','🦡',
      '🦫','🦦','🦥','🐁','🐀','🐿️','🦔','🐾','🌸','💐','🌹','🥀','🌺','🌻',
      '🌼','🌷','🌱','🪴','🌲','🌳','🌴','🪵','🌵','🎋','🎍','🍀','🍁','🍂',
      '🍃','🍄','🪨','🌾','💧','🌊','🌬️','🌀','🌈','⚡','❄️','🔥','💥','⭐',
      '🌟','✨','🌙','🌞','🌝','🌛','🌜','🌚','🌕','🌖','🌗','🌘','🌑','🌒',
      '🌓','🌔','🌙','🌎','🌍','🌏','🪐','💫','⚡','🔥','🌈',
      // New nature
      '🪼','🦭','🦬','🦣','🪸',
    ],
    'Food': [
      '🍎','🍐','🍊','🍋','🍋‍🟩','🍌','🍉','🍇','🍓','🫐','🍈','🍒','🍑','🥭',
      '🍍','🥥','🥝','🍅','🍆','🥑','🥦','🥬','🥒','🌶️','🫑','🧄','🧅','🥔',
      '🍠','🫒','🌽','🍚','🍛','🍜','🍝','🍞','🥐','🥖','🫓','🥨','🧀','🥚',
      '🍳','🧈','🥞','🧇','🥓','🥩','🍗','🍖','🌭','🍔','🍟','🍕','🫔','🥪',
      '🥙','🧆','🌮','🌯','🥗','🥘','🫕','🥫','🍱','🍘','🍙','🍚','🍛','🍜',
      '🍣','🍤','🍙','🥟','🦪','🍱','🍡','🧁','🍰','🎂','🍮','🍭','🍬','🍫',
      '🍿','🍩','🍪','🌰','🥜','🍯','🍺','🍻','🥂','🍷','🥃','🍸','🍹','🧉',
      '🧋','🍵','☕','🫖','🧃','🥤','🧊','🍶','🍾','🍼','🥛',
      // New foods
      '🫙','🧋','🫕','🫔','🍋‍🟩',
    ],
    'Travel': [
      '🚗','🚕','🚙','🚌','🚎','🏎️','🚓','🚑','🚒','🚐','🛻','🚚','🚛','🚜',
      '🏍️','🛵','🛺','🚲','🛴','🛹','🛼','🛷','🚏','🛣️','🛤️','⛽','🚨','🚥',
      '🚦','🛑','🚧','⚓','🪝','⛵','🛶','🚤','🛥️','🛳️','⛴️','🚢','✈️','🛩️',
      '🛫','🛬','🪂','💺','🚁','🚟','🚠','🚡','🛰️','🚀','🛸','🪐','🌍','🌎',
      '🌏','🗺️','🧭','🏔️','⛰️','🌋','🗻','🏕️','🏖️','🏜️','🏝️','🏞️','🏟️','🏛️',
      '🏗️','🏘️','🏚️','🏠','🏡','🏢','🏣','🏤','🏥','🏦','🏨','🏩','🏪','🏫',
      '🏬','🏭','🏯','🏰','💒','🗼','🗽','⛪','🕌','🛕','🕍','⛩️','🗾','🗿',
      '🎑','🏞️','🌅','🌄','🌠','🎇','🎆','🌇','🌆','🏙️','🌃','🌉','🌌','🌁',
    ],
    'Activities': [
      '⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱','🪀','🏓','🏸','🏒',
      '🥍','🏑','🏏','🪃','🥅','⛳','🪁','🏹','🎣','🤿','🥊','🥋','🎽','🛹',
      '🛷','🥌','🪂','🎿','🤸','🤸‍♂️','🤸‍♀️','🤼','🤼‍♂️','🤼‍♀️','🤺','🏇','⛷️',
      '🏂','🏋️','🏋️‍♂️','🏋️‍♀️','🤾','🤾‍♂️','🤾‍♀️','🧗','🧗‍♂️','🧗‍♀️','🏄','🏄‍♂️','🏄‍♀️',
      '🚣','🚣‍♂️','🚣‍♀️','🧘','🧘‍♂️','🧘‍♀️','🏊','🏊‍♂️','🏊‍♀️','🤽','🤽‍♂️','🤽‍♀️',
      '🚴','🚴‍♂️','🚴‍♀️','🏆','🥇','🥈','🥉','🏅','🎖️','🏵️','🎗️','🎫','🎟️',
      '🎪','🤹','🤹‍♂️','🤹‍♀️','🎭','🩰','🎨','🖼️','🎬','🎤','🎧','🎼','🎵','🎶',
      '🎷','🪗','🎸','🎹','🪘','🎺','🎻','🪕','🥁','🪇','🪈',
      // New
      '🪇','🪈',
    ],
    'Objects': [
      '📱','💻','⌨️','🖥️','🖨️','🖱️','💾','💿','📀','📷','📸','📹','🎥','📽️',
      '🎞️','📞','☎️','📟','📠','📺','📻','🧭','⏱️','⏲️','⏰','🕰️','⌛','⏳',
      '📡','🔋','🪫','🔌','💡','🔦','🕯️','🪔','🧯','🛢️','💰','💴','💵','💶',
      '💷','💸','💳','🪙','💹','📈','📉','📊','📋','🗒️','📁','📂','🗂️','🗃️',
      '🗳️','🗄️','🗑️','🔒','🔓','🔏','🔐','🔑','🗝️','🔨','🪓','⛏️','⚒️','🛠️',
      '🗡️','⚔️','🛡️','🪚','🔧','🪛','🔩','⚙️','🗜️','⚖️','🦯','🔗','⛓️','🪝',
      '🧲','🪜','⚗️','🔭','🔬','🩺','🩻','💉','🩹','🩼','🩺','💊','🪣','🧹',
      '🧺','🧻','🪣','🧼','🫧','🪥','🧽','🪒','🧴','🧷','🧲','🪡','🧵','🧶',
      '👓','🕶️','🥽','🌂','☂️','🧵','🧶','🪡','👔','👕','👖','🧣','🧤','🧥',
      '🧦','👗','👘','🥻','🩱','🩲','🩳','👙','👚','👛','👜','👝','🎒','🧳',
      '👒','🎩','🧢','👑','💄','💍','💎',
      // New objects
      '🫧','🪬','🪩','🪫',
    ],
    'Symbols': [
      '❤️','🧡','💛','💚','💙','🩵','💜','🖤','🩶','🤍','🤎','💔','❣️','💕',
      '💞','💓','💗','💖','💘','💝','💟','☮️','✝️','☪️','🕉️','✡️','🔯','🕎',
      '☯️','☦️','🛐','⛎','♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓',
      '🆔','⚛️','🉑','☢️','☣️','📴','📳','🈶','🈚','🈸','🈺','🈷️','✴️','🆚',
      '💮','🉐','㊙️','㊗️','🈴','🈵','🈹','🈲','🅰️','🅱️','🆎','🆑','🅾️','🆘',
      '❌','⭕','🛑','⛔','📛','🚫','💯','💢','♨️','🚷','🚯','🚳','🚱','🔞',
      '📵','🚭','❗','❕','❓','❔','‼️','⁉️','🔅','🔆','〽️','⚠️','🚸','🔱',
      '⚜️','🔰','♻️','✅','🈯','💹','❎','🌐','💠','Ⓜ️','🌀','💤','🏧','🚾',
      '♿','🅿️','🛗','🈳','🈹','🚺','🚹','🚼','⚧','🚻','🚮','🎦','📶','🈁',
      '🔣','ℹ️','🔤','🔡','🔠','🆖','🆗','🆙','🆒','🆕','🆓','0️⃣','1️⃣','2️⃣',
      '3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟','🔢','#️⃣','*️⃣','▶️','⏸️',
      '⏯️','⏹️','⏺️','⏭️','⏮️','⏩','⏪','⏫','⏬','◀️','🔼','🔽','➡️','⬅️',
      '⬆️','⬇️','↗️','↘️','↙️','↖️','↕️','↔️','↩️','↪️','⤴️','⤵️','🔀','🔁',
      '🔂','🔄','🔃','🎵','🎶','➕','➖','➗','✖️','♾️','💲','💱','‼️','⁉️',
      // New symbols
      '🩵','🩶','🪩',
    ],
    'Flags': [
      '🏳️','🏴','🏁','🚩','🏳️‍🌈','🏳️‍⚧️','🏴‍☠️',
      '🇦🇫','🇦🇱','🇩🇿','🇦🇴','🇦🇷','🇦🇺','🇦🇹','🇧🇪','🇧🇿','🇧🇯',
      '🇧🇼','🇧🇷','🇧🇫','🇧🇮','🇨🇲','🇨🇦','🇨🇻','🇨🇫','🇹🇩','🇨🇱',
      '🇨🇳','🇨🇴','🇰🇲','🇨🇬','🇨🇩','🇨🇷','🇨🇮','🇭🇷','🇨🇺','🇩🇰',
      '🇩🇯','🇩🇴','🇪🇨','🇪🇬','🇸🇻','🇬🇶','🇪🇷','🇪🇪','🇪🇹','🇫🇯',
      '🇫🇮','🇫🇷','🇬🇦','🇬🇲','🇬🇪','🇩🇪','🇬🇭','🇬🇷','🇬🇹','🇬🇳',
      '🇬🇼','🇬🇾','🇭🇹','🇭🇳','🇭🇺','🇮🇳','🇮🇩','🇮🇷','🇮🇶','🇮🇪',
      '🇮🇱','🇮🇹','🇯🇲','🇯🇵','🇯🇴','🇰🇿','🇰🇪','🇰🇼','🇱🇦','🇱🇻',
      '🇱🇧','🇱🇸','🇱🇷','🇱🇾','🇱🇹','🇲🇬','🇲🇼','🇲🇾','🇲🇻','🇲🇱',
      '🇲🇷','🇲🇽','🇲🇿','🇲🇲','🇳🇦','🇳🇵','🇳🇱','🇳🇿','🇳🇮','🇳🇪',
      '🇳🇬','🇳🇴','🇴🇲','🇵🇰','🇵🇦','🇵🇬','🇵🇾','🇵🇪','🇵🇭','🇵🇱',
      '🇵🇹','🇷🇴','🇷🇺','🇷🇼','🇸🇦','🇸🇳','🇸🇱','🇸🇴','🇿🇦','🇸🇸',
      '🇪🇸','🇱🇰','🇸🇩','🇸🇪','🇨🇭','🇸🇾','🇹🇼','🇹🇿','🇹🇭','🇹🇬',
      '🇹🇳','🇹🇷','🇺🇬','🇺🇦','🇦🇪','🇬🇧','🇺🇸','🇺🇾','🇺🇿','🇻🇳',
      '🇾🇪','🇿🇲','🇿🇼',
    ],
  };

  /* Emoji picker UI */
  function buildEmojiPicker(onSelect) {
    const el = document.createElement('div');
    el.id = 'afrib-emoji-picker';
    el.style.cssText = `
      position:fixed; z-index:99999; background:#16082A;
      border:1px solid rgba(212,175,55,.3); border-radius:20px;
      width:min(94vw,360px); max-height:420px;
      box-shadow:0 20px 60px rgba(0,0,0,.8); overflow:hidden;
      display:flex; flex-direction:column;
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI Emoji',sans-serif;
    `;

    const cats = Object.keys(EMOJI_DATA);
    const catIcons = {
      Smileys:'😀', People:'👋', Nature:'🌿', Food:'🍎',
      Travel:'🚗', Activities:'⚽', Objects:'📱', Symbols:'❤️', Flags:'🚩'
    };

    el.innerHTML = `
      <div style="padding:10px 12px 6px;background:#1E0A38;border-bottom:1px solid rgba(255,255,255,.06)">
        <input id="epSearch" placeholder="🔍 Search emojis…" autocomplete="off"
          style="width:100%;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);
          border-radius:10px;padding:7px 12px;color:#fff;font-size:13px;outline:none;box-sizing:border-box"/>
      </div>
      <div style="display:flex;gap:0;background:#160830;border-bottom:1px solid rgba(255,255,255,.05);overflow-x:auto;scrollbar-width:none;padding:4px 8px">
        ${cats.map((c,i) => `<button data-cat="${c}" onclick="epSwitchCat(this,'${c}')"
          style="flex-shrink:0;padding:6px 8px;border:none;background:${i===0?'rgba(212,175,55,.2)':'none'};
          border-radius:8px;font-size:16px;cursor:pointer;transition:background .15s"
          title="${c}">${catIcons[c]||'•'}</button>`).join('')}
      </div>
      <div style="font-size:11px;font-weight:700;color:rgba(212,175,55,.8);padding:6px 12px 2px;letter-spacing:.5px" id="epCatLabel">SMILEYS & EMOTION</div>
      <div id="epGrid" style="overflow-y:auto;display:flex;flex-wrap:wrap;gap:1px;padding:6px 8px 12px;flex:1">
      </div>
      <div style="padding:6px 10px;background:#160830;border-top:1px solid rgba(255,255,255,.05);display:flex;gap:4px;overflow-x:auto;scrollbar-width:none" id="epRecent"></div>
    `;
    document.body.appendChild(el);

    /* Render emojis */
    function renderCat(cat) {
      const grid = document.getElementById('epGrid');
      if (!grid) return;
      const emojis = EMOJI_DATA[cat] || [];
      grid.innerHTML = emojis.map(e =>
        `<button onclick="window._epSelect('${encodeURIComponent(e)}')"
          style="width:36px;height:36px;border:none;background:none;cursor:pointer;border-radius:8px;
          font-size:20px;line-height:36px;text-align:center;transition:background .1s;flex-shrink:0"
          onmouseover="this.style.background='rgba(255,255,255,.08)'"
          onmouseout="this.style.background='none'">${e}</button>`
      ).join('');
      const label = document.getElementById('epCatLabel');
      if (label) label.textContent = cat.toUpperCase();
    }

    renderCat(cats[0]);

    /* Category switcher */
    window.epSwitchCat = function(btn, cat) {
      document.querySelectorAll('#afrib-emoji-picker [data-cat]').forEach(b => b.style.background='none');
      btn.style.background = 'rgba(212,175,55,.2)';
      renderCat(cat);
    };

    /* Search */
    document.getElementById('epSearch')?.addEventListener('input', function() {
      const q = this.value.toLowerCase().trim();
      const grid = document.getElementById('epGrid');
      if (!grid) return;
      if (!q) { renderCat(cats[0]); return; }
      const all = Object.values(EMOJI_DATA).flat();
      const results = all.filter(e => {
        const name = e.codePointAt(0).toString(16);
        return name.includes(q) || e.includes(q);
      }).slice(0, 80);
      grid.innerHTML = results.map(e =>
        `<button onclick="window._epSelect('${encodeURIComponent(e)}')"
          style="width:36px;height:36px;border:none;background:none;cursor:pointer;border-radius:8px;
          font-size:20px;line-height:36px;text-align:center">${e}</button>`
      ).join('') || '<div style="padding:20px;color:rgba(255,255,255,.4);font-size:12px">No emojis found</div>';
    });

    /* Emoji select */
    window._epSelect = function(encoded) {
      const emoji = decodeURIComponent(encoded);
      // Save to recents
      let recents = JSON.parse(localStorage.getItem('afrib_emoji_recents') || '[]');
      recents = [emoji, ...recents.filter(e => e !== emoji)].slice(0, 20);
      localStorage.setItem('afrib_emoji_recents', JSON.stringify(recents));
      renderRecents();
      onSelect(emoji);
    };

    /* Recents */
    function renderRecents() {
      const el = document.getElementById('epRecent');
      if (!el) return;
      const recents = JSON.parse(localStorage.getItem('afrib_emoji_recents') || '[]');
      if (!recents.length) { el.style.display = 'none'; return; }
      el.style.display = 'flex';
      el.innerHTML = '<span style="font-size:9px;color:rgba(255,255,255,.3);align-self:center;white-space:nowrap;padding-right:4px">RECENT</span>' +
        recents.map(e =>
          `<button onclick="window._epSelect('${encodeURIComponent(e)}')"
            style="flex-shrink:0;width:28px;height:28px;border:none;background:none;cursor:pointer;border-radius:6px;font-size:18px">${e}</button>`
        ).join('');
    }
    renderRecents();

    return el;
  }

  /* Attach emoji picker to any textarea/input */
  function attachEmojiButton(input) {
    if (!input || input._emojiAttached) return;
    input._emojiAttached = true;

    const wrap = input.parentElement;
    if (!wrap) return;
    if (getComputedStyle(wrap).position === 'static') wrap.style.position = 'relative';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'afrib-emoji-btn';
    btn.textContent = '😊';
    btn.title = 'Emoji picker';
    btn.style.cssText = `
      position:absolute; right:8px; bottom:8px;
      background:rgba(212,175,55,.15); border:1px solid rgba(212,175,55,.3);
      border-radius:8px; padding:4px 7px; font-size:16px; cursor:pointer;
      z-index:5; transition:background .15s; line-height:1;
    `;
    wrap.appendChild(btn);

    let picker = null;
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      if (picker) { picker.remove(); picker = null; return; }
      picker = buildEmojiPicker(function(emoji) {
        const start = input.selectionStart || 0;
        const end   = input.selectionEnd   || 0;
        const val   = input.value || '';
        input.value = val.slice(0, start) + emoji + val.slice(end);
        input.selectionStart = input.selectionEnd = start + emoji.length;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.focus();
      });

      // Position picker
      const rect = btn.getBoundingClientRect();
      picker.style.top  = 'auto';
      picker.style.bottom = (window.innerHeight - rect.top + 8) + 'px';
      picker.style.left   = Math.max(8, rect.left - 160) + 'px';

      // Close on outside click
      setTimeout(() => {
        document.addEventListener('click', function handler(ev) {
          if (!picker?.contains(ev.target) && ev.target !== btn) {
            picker?.remove(); picker = null;
            document.removeEventListener('click', handler);
          }
        });
      }, 100);
    });
  }

  /* Auto-attach to known text areas */
  function attachAllInputs() {
    const selectors = [
      '#postCaption', '#chatInput', '#newMessage', '#dmInput',
      '#commentInput', '#marketDesc', '#bioInput', '#captionInput',
      '[data-emoji="true"]', 'textarea:not([data-no-emoji])',
      'input[type=text]:not([data-no-emoji]):not([readonly])',
    ];
    selectors.forEach(sel => {
      try {
        document.querySelectorAll(sel).forEach(el => attachEmojiButton(el));
      } catch(e) {}
    });
  }

  // Inject emoji button CSS
  const emojiCSS = document.createElement('style');
  emojiCSS.textContent = `
    .afrib-emoji-btn:hover { background:rgba(212,175,55,.3) !important; }
    #afrib-emoji-picker button:active { transform:scale(.85); }
    #epGrid::-webkit-scrollbar { width:4px; }
    #epGrid::-webkit-scrollbar-thumb { background:rgba(212,175,55,.3); border-radius:2px; }
  `;
  document.head.appendChild(emojiCSS);

  // Attach on ready + watch for new inputs
  function onReady() {
    attachAllInputs();
    const obs = new MutationObserver(() => attachAllInputs());
    obs.observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState !== 'loading') onReady();
  else document.addEventListener('DOMContentLoaded', onReady);


  // ═══════════════════════════════════════════════════════════
  // § 2  YOURSTYLE FEED — TikTok-style 3-tab system
  // Research: TikTok (For You/Following/Explore),
  //           Instagram (Reels/Following/All),
  //           Twitter/X (For You/Following)
  // 3 tabs: For You (algorithm), Friends (following), Everyone (all users)
  // ═══════════════════════════════════════════════════════════
  function upgradeYourStyleFeed() {
    const styleScreen = document.getElementById('screen-style');
    if (!styleScreen) return;

    // Replace old tab bar with 3-box TikTok-style design
    const oldTabRow = styleScreen.querySelector('[id^="styleTab-all"]')?.parentElement;
    if (oldTabRow && !oldTabRow.dataset.tiktok) {
      oldTabRow.dataset.tiktok = '1';
      oldTabRow.style.cssText = `
        display:flex; gap:0; background:transparent; border-radius:0;
        padding:0; margin-bottom:0; border-bottom:1px solid rgba(255,255,255,.08);
        position:sticky; top:0; z-index:10; background:var(--bg,#0d001a);
      `;

      // Keep Live button but add 3 new main tabs
      const liveBtn = document.getElementById('styleTab-live');
      if (liveBtn) {
        liveBtn.style.cssText = `
          flex:0 0 auto; padding:12px 14px; background:none; border:none; border-bottom:2px solid transparent;
          color:rgba(255,71,87,.7); font-size:12px; font-weight:800; cursor:pointer;
          white-space:nowrap; position:relative; transition:all .2s;
        `;
      }

      // For You tab
      const forYouBtn = document.getElementById('styleTab-all');
      if (forYouBtn) {
        forYouBtn.textContent = '✨ YourStyle';
        forYouBtn.style.cssText = `
          flex:1; padding:12px 6px; background:none; border:none; border-bottom:2px solid var(--gold,#D4AF37);
          color:var(--gold,#D4AF37); font-size:13px; font-weight:900; cursor:pointer;
          text-align:center; transition:all .2s;
        `;
      }

      // Friends tab (following)
      const friendsBtn = document.getElementById('styleTab-following');
      if (friendsBtn) {
        friendsBtn.textContent = '👥 Friends';
        friendsBtn.style.cssText = `
          flex:1; padding:12px 6px; background:none; border:none; border-bottom:2px solid transparent;
          color:rgba(255,255,255,.5); font-size:13px; font-weight:700; cursor:pointer;
          text-align:center; transition:all .2s;
        `;
      }

      // Everyone tab (all users)
      const everyoneBtn = document.getElementById('styleTab-trending');
      if (everyoneBtn) {
        everyoneBtn.textContent = '🌍 Everyone';
        everyoneBtn.style.cssText = `
          flex:1; padding:12px 6px; background:none; border:none; border-bottom:2px solid transparent;
          color:rgba(255,255,255,.5); font-size:13px; font-weight:700; cursor:pointer;
          text-align:center; transition:all .2s;
        `;
        // Change onclick
        everyoneBtn.setAttribute('onclick', "switchStyleTabV71('everyone',this)");
      }

      // Fix onclick for main tabs
      if (forYouBtn) forYouBtn.setAttribute('onclick', "switchStyleTabV71('all',this)");
      if (friendsBtn) friendsBtn.setAttribute('onclick', "switchStyleTabV71('following',this)");

      // Hide Mine tab (moves to profile)
      const mineBtn = document.getElementById('styleTab-mine');
      if (mineBtn) mineBtn.style.display = 'none';
    }

    // Inject scroll-indicator dots (3-box style)
    const feedEl = document.getElementById('styleFeed');
    if (feedEl && !document.getElementById('ys-tab-indicators')) {
      const dots = document.createElement('div');
      dots.id = 'ys-tab-indicators';
      dots.style.cssText = 'display:flex;justify-content:center;gap:6px;padding:8px 0 0';
      dots.innerHTML = `
        <span class="ys-dot active" data-tab="all" style="width:24px;height:3px;border-radius:2px;background:var(--gold,#D4AF37);transition:all .3s;cursor:pointer" onclick="switchStyleTabV71('all',null)"></span>
        <span class="ys-dot" data-tab="following" style="width:6px;height:3px;border-radius:2px;background:rgba(255,255,255,.2);transition:all .3s;cursor:pointer" onclick="switchStyleTabV71('following',null)"></span>
        <span class="ys-dot" data-tab="everyone" style="width:6px;height:3px;border-radius:2px;background:rgba(255,255,255,.2);transition:all .3s;cursor:pointer" onclick="switchStyleTabV71('everyone',null)"></span>
      `;
      feedEl.parentElement?.insertBefore(dots, feedEl);
    }
  }

  /* Enhanced tab switcher with 3-box UI update */
  window.switchStyleTabV71 = function(tab, btn) {
    // Update tab underlines
    ['all','following','trending','everyone'].forEach(t => {
      const b = document.getElementById('styleTab-' + t) ||
                document.querySelector(`[onclick*="${t}"]`);
      if (b) {
        b.style.borderBottomColor = 'transparent';
        b.style.color = 'rgba(255,255,255,.5)';
        b.style.fontWeight = '700';
      }
    });

    const mappedId = tab === 'everyone' ? 'trending' : tab;
    const activeBtn = document.getElementById('styleTab-' + mappedId) ||
                      document.querySelector(`[onclick*="${tab}"]`);
    if (activeBtn) {
      activeBtn.style.borderBottomColor = 'var(--gold,#D4AF37)';
      activeBtn.style.color = 'var(--gold,#D4AF37)';
      activeBtn.style.fontWeight = '900';
    }

    // Update dots
    document.querySelectorAll('.ys-dot').forEach(d => {
      const active = d.dataset.tab === tab;
      d.style.width = active ? '24px' : '6px';
      d.style.background = active ? 'var(--gold,#D4AF37)' : 'rgba(255,255,255,.2)';
    });

    // Map 'everyone' → 'all_users' for feed render
    window._styleTab = tab === 'everyone' ? 'all_users' : tab;

    if (typeof renderStyleFeedV71 === 'function') renderStyleFeedV71();
    else if (typeof renderStyleFeed === 'function') renderStyleFeed();
  };

  /* Enhanced feed renderer supporting 'everyone' tab */
  window.renderStyleFeedV71 = function() {
    const feedEl  = document.getElementById('styleFeed');
    const emptyEl = document.getElementById('styleFeedEmpty');
    if (!feedEl) return;
    if (typeof getStylePosts !== 'function') { if (typeof renderStyleFeed === 'function') renderStyleFeed(); return; }

    let posts = [];
    try { posts = getStylePosts() || []; } catch(e) { posts = []; }

    const tab = window._styleTab || 'all';
    const currentEmail = window.currentUser?.email;

    if (tab === 'mine' && currentEmail) {
      posts = posts.filter(p => p.authorEmail === currentEmail);
    } else if (tab === 'following' && currentEmail) {
      let following = [];
      try { following = (typeof getStyleFollowing === 'function') ? getStyleFollowing(currentEmail) : []; } catch(e) {}
      posts = posts.filter(p => following.includes(p.authorEmail));
      // If no following posts, show hint
      if (!posts.length) {
        feedEl.innerHTML = `
          <div style="text-align:center;padding:40px 20px">
            <div style="font-size:48px;margin-bottom:12px">👥</div>
            <div style="font-size:16px;font-weight:800;margin-bottom:8px">No posts yet from friends</div>
            <div style="font-size:13px;color:rgba(255,255,255,.5);margin-bottom:20px">Follow people to see their posts here</div>
            <button onclick="switchStyleTabV71('all',null)"
              style="background:linear-gradient(135deg,var(--gold,#D4AF37),#b8860b);border:none;border-radius:12px;padding:12px 24px;color:#000;font-size:14px;font-weight:800;cursor:pointer">
              Explore For You →
            </button>
          </div>`;
        if (emptyEl) emptyEl.style.display = 'none';
        return;
      }
    } else if (tab === 'all_users') {
      // Everyone — show ALL posts from all users sorted by newest
      posts = [...posts].sort((a,b) => new Date(b.createdAt||0) - new Date(a.createdAt||0));
    } else {
      // For You — smart mix: posts from following first, then trending, then new
      if (currentEmail) {
        let following = [];
        try { following = (typeof getStyleFollowing === 'function') ? getStyleFollowing(currentEmail) : []; } catch(e) {}
        const friendPosts = posts.filter(p => following.includes(p.authorEmail));
        const otherPosts  = posts.filter(p => !following.includes(p.authorEmail) && p.authorEmail !== currentEmail);
        const sortedOther = [...otherPosts].sort((a,b) => {
          const scoreA = (a.likes?.length||0)*2 + (a.comments?.length||0)*3 + Math.random()*0.5;
          const scoreB = (b.likes?.length||0)*2 + (b.comments?.length||0)*3 + Math.random()*0.5;
          return scoreB - scoreA;
        });
        // Interleave: 1 friend post per 3 recommended posts
        const result = [];
        let fi = 0, oi = 0;
        while (fi < friendPosts.length || oi < sortedOther.length) {
          if (fi < friendPosts.length) result.push(friendPosts[fi++]);
          for (let j=0;j<3&&oi<sortedOther.length;j++) result.push(sortedOther[oi++]);
        }
        posts = result;
      } else {
        posts = [...posts].sort((a,b) => new Date(b.createdAt||0) - new Date(a.createdAt||0));
      }
    }

    // Filter by category
    const cat = window._styleCategory || 'all';
    if (cat !== 'all') posts = posts.filter(p => p.category === cat);

    if (!posts.length) {
      feedEl.innerHTML = '';
      if (emptyEl) emptyEl.style.display = 'block';
      return;
    }
    if (emptyEl) emptyEl.style.display = 'none';

    try {
      feedEl.innerHTML = posts.map((post, idx) => {
        const adHtml = (idx > 0 && idx % 5 === 0 && typeof renderAdBanner === 'function') ? renderAdBanner() : '';
        const cardHtml = (typeof renderPostCard === 'function') ? renderPostCard(post) : '';
        return adHtml + cardHtml;
      }).join('');
    } catch(e) { console.warn('Feed render error:', e); }
  };

  // Patch switchStyleTab to use new V71 version for non-live tabs
  const origSwitch = window.switchStyleTab;
  window.switchStyleTab = function(tab, btn) {
    if (tab === 'live') {
      if (origSwitch) origSwitch.call(this, tab, btn);
      return;
    }
    window.switchStyleTabV71(tab, btn);
  };

  // Run on style screen shown
  document.addEventListener('click', function(e) {
    if (e.target?.dataset?.screen === 'style' || e.target?.getAttribute('onclick')?.includes("'style'")) {
      setTimeout(upgradeYourStyleFeed, 100);
    }
  });
  setTimeout(upgradeYourStyleFeed, 1500);


  // ═══════════════════════════════════════════════════════════
  // § 3  LIVE GIFTS — expand to 10 + admin coin limit control
  // ═══════════════════════════════════════════════════════════
  function upgradeLiveGifts() {
    if (!window.afribLiveSelectGift) return; // wait for livestream.js

    // Add 2 new gifts to reach 10 total
    const extraGifts = [
      { emoji:'🦋', name:'Butterfly', coins:30,  color:'#a78bfa' },
      { emoji:'💎', name:'Ice Queen', coins:1000, color:'#00d2ff' },
    ];

    // Patch to inject new gifts into live gift grid when it renders
    const origSelectGift = window.afribLiveSelectGift;

    // Inject admin-controlled max gift amount
    window._getLiveGiftLimit = function() {
      try {
        const settings = JSON.parse(localStorage.getItem('afrib_live_settings') || '{}');
        return settings.maxGiftCoins || 1000;
      } catch(e) { return 1000; }
    };

    // Find and patch the LIVE_GIFTS array by patching the gift panel render
    const obs = new MutationObserver(function(mutations) {
      mutations.forEach(function(m) {
        m.addedNodes.forEach(function(node) {
          if (node.id === 'liveViewerOverlay' || node.querySelector?.('#liveGiftPanel')) {
            setTimeout(function() { patchLiveGiftPanel(node); }, 100);
          }
        });
      });
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  function patchLiveGiftPanel(root) {
    const panel = root?.querySelector?.('#liveGiftPanel') || document.getElementById('liveGiftPanel');
    if (!panel || panel._gmuPatched) return;
    panel._gmuPatched = true;

    const grid = panel.querySelector('.live-gift-grid');
    if (!grid) return;

    // Add extra gift buttons
    const extras = [
      { emoji:'🦋', name:'Butterfly', coins:30,  color:'#a78bfa' },
      { emoji:'💎', name:'Ice Queen', coins:1000, color:'#00d2ff' },
    ];
    extras.forEach(function(g) {
      if (panel.innerHTML.includes(g.name)) return; // already added
      const btn = document.createElement('button');
      btn.className = 'live-gift-item';
      btn.title = g.name;
      // Extract streamId from existing buttons
      const existingBtn = grid.querySelector('button');
      const existingOnclick = existingBtn?.getAttribute('onclick') || '';
      const streamIdMatch = existingOnclick.match(/'([^']+)'/);
      const streamId = streamIdMatch ? streamIdMatch[1] : '';
      btn.setAttribute('onclick', `afribLiveSelectGift('${streamId}','${g.name}')`);
      btn.innerHTML = `
        <div style="font-size:26px">${g.emoji}</div>
        <div style="font-size:10px;font-weight:700;color:${g.color}">${g.name}</div>
        <div style="font-size:9px;color:rgba(255,255,255,.5)">🪙${g.coins}</div>
      `;
      grid.appendChild(btn);
    });
  }

  upgradeLiveGifts();
  setTimeout(upgradeLiveGifts, 2000);


  // ═══════════════════════════════════════════════════════════
  // § 4  HOME PAGE REDESIGN — Complete overhaul
  // Research: TikTok home, Instagram home, Cash App home
  // Clean, app-like, personalised, fast
  // ═══════════════════════════════════════════════════════════
  function upgradeHomePage() {
    const css = document.createElement('style');
    css.id = 'v71-home-css';
    if (document.getElementById(css.id)) return;
    css.textContent = `
      /* ── V71 Home redesign ── */
      #screen-home .screen-content { padding:0 0 80px; background:var(--bg,#0d001a); }

      /* Hero — full width gradient banner */
      .v71-hero {
        position:relative; overflow:hidden;
        background:linear-gradient(135deg,#180030 0%,#0d001a 40%,#001830 100%);
        padding:20px 16px 24px;
        border-bottom:1px solid rgba(255,255,255,.05);
      }
      .v71-hero::before {
        content:''; position:absolute; inset:0;
        background:radial-gradient(ellipse 80% 60% at 50% -20%, rgba(212,175,55,.12), transparent);
        pointer-events:none;
      }
      .v71-hero-greeting {
        font-size:13px; color:rgba(255,255,255,.5); font-weight:600; margin-bottom:4px;
      }
      .v71-hero-name {
        font-size:26px; font-weight:900; line-height:1.1;
        background:linear-gradient(135deg,#fff 60%,var(--gold,#D4AF37));
        -webkit-background-clip:text; -webkit-text-fill-color:transparent;
        background-clip:text;
      }
      .v71-hero-sub { font-size:12px; color:rgba(255,255,255,.4); margin-top:4px; }

      /* Stats row */
      .v71-stats-row {
        display:flex; gap:8px; margin-top:16px;
      }
      .v71-stat-chip {
        flex:1; background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.08);
        border-radius:14px; padding:10px 10px 8px; text-align:center; cursor:pointer;
        transition:background .2s;
      }
      .v71-stat-chip:active { background:rgba(255,255,255,.1); }
      .v71-stat-val { font-size:18px; font-weight:900; color:var(--gold,#D4AF37); line-height:1; }
      .v71-stat-lbl { font-size:9px; color:rgba(255,255,255,.4); font-weight:700; margin-top:3px; letter-spacing:.5px; }

      /* Wallet card v71 */
      .v71-wallet {
        margin:16px 16px 0;
        background:linear-gradient(135deg,#1a0840 0%,#0c0420 50%,#001830 100%);
        border:1px solid rgba(212,175,55,.25); border-radius:20px;
        padding:18px 20px; position:relative; overflow:hidden;
      }
      .v71-wallet::after {
        content:''; position:absolute; top:-20px; right:-20px;
        width:120px; height:120px; border-radius:50%;
        background:radial-gradient(circle,rgba(212,175,55,.1),transparent 70%);
        pointer-events:none;
      }
      .v71-wallet-label { font-size:10px; color:rgba(255,255,255,.4); font-weight:700; letter-spacing:1px; margin-bottom:6px; }
      .v71-wallet-amount { font-size:32px; font-weight:900; color:#fff; line-height:1; }
      .v71-wallet-usd { font-size:12px; color:rgba(255,255,255,.4); margin-top:3px; }
      .v71-wallet-coins { position:absolute; top:18px; right:20px; background:rgba(212,175,55,.15); border:1px solid rgba(212,175,55,.3); border-radius:20px; padding:5px 12px; font-size:13px; font-weight:800; color:var(--gold,#D4AF37); }
      .v71-wallet-btns { display:flex; gap:8px; margin-top:14px; }
      .v71-wallet-btn { flex:1; padding:10px 8px; border-radius:12px; font-size:12px; font-weight:800; border:none; cursor:pointer; transition:all .15s; }
      .v71-wallet-btn.primary { background:linear-gradient(135deg,var(--gold,#D4AF37),#b8860b); color:#000; }
      .v71-wallet-btn.ghost { background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.12); color:rgba(255,255,255,.7); }
      .v71-wallet-btn:active { transform:scale(.95); }

      /* Section header */
      .v71-section-hdr {
        display:flex; align-items:center; justify-content:space-between;
        padding:18px 16px 10px;
      }
      .v71-section-title { font-size:15px; font-weight:900; color:#fff; }
      .v71-section-see { font-size:12px; color:var(--gold,#D4AF37); font-weight:700; cursor:pointer; }

      /* Quick actions — 4-column grid */
      .v71-quick-grid {
        display:grid; grid-template-columns:repeat(4,1fr); gap:8px;
        padding:0 16px;
      }
      .v71-qa-item {
        background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.07);
        border-radius:16px; padding:14px 6px 10px; text-align:center; cursor:pointer;
        transition:all .15s; position:relative;
      }
      .v71-qa-item:active { transform:scale(.93); background:rgba(255,255,255,.09); }
      .v71-qa-icon { font-size:26px; margin-bottom:6px; display:block; }
      .v71-qa-label { font-size:11px; font-weight:700; color:rgba(255,255,255,.8); line-height:1.2; }
      .v71-qa-badge { position:absolute; top:6px; right:6px; background:var(--gold,#D4AF37); color:#000; font-size:8px; font-weight:900; border-radius:6px; padding:1px 4px; }

      /* Games horizontal scroll */
      .v71-games-scroll {
        display:flex; gap:10px; padding:0 16px; overflow-x:auto;
        scrollbar-width:none; scroll-snap-type:x mandatory;
        -webkit-overflow-scrolling:touch;
      }
      .v71-games-scroll::-webkit-scrollbar { display:none; }
      .v71-game-card {
        flex-shrink:0; width:120px; height:140px; border-radius:18px;
        background:linear-gradient(135deg,rgba(255,255,255,.08),rgba(255,255,255,.03));
        border:1px solid rgba(255,255,255,.1); display:flex; flex-direction:column;
        align-items:center; justify-content:center; cursor:pointer; scroll-snap-align:start;
        transition:transform .15s; position:relative; overflow:hidden;
      }
      .v71-game-card:active { transform:scale(.93); }
      .v71-game-card::before {
        content:''; position:absolute; inset:0; opacity:0;
        background:linear-gradient(135deg,rgba(212,175,55,.15),transparent);
        transition:opacity .2s;
      }
      .v71-game-card:hover::before { opacity:1; }
      .v71-game-icon { font-size:40px; margin-bottom:8px; }
      .v71-game-name { font-size:11px; font-weight:800; color:#fff; text-align:center; }
      .v71-game-badge { position:absolute; top:8px; right:8px; background:var(--gold,#D4AF37); color:#000; font-size:8px; font-weight:900; border-radius:6px; padding:2px 5px; }

      /* Live now strip */
      .v71-live-strip {
        display:flex; gap:10px; padding:0 16px; overflow-x:auto;
        scrollbar-width:none;
      }
      .v71-live-card {
        flex-shrink:0; width:80px; text-align:center; cursor:pointer;
      }
      .v71-live-avatar {
        width:64px; height:64px; border-radius:50%; border:2px solid #ff4757;
        margin:0 auto 5px; background:linear-gradient(135deg,#1a0a30,#050210);
        display:flex; align-items:center; justify-content:center; font-size:22px;
        position:relative; overflow:hidden;
      }
      .v71-live-dot {
        position:absolute; bottom:1px; right:1px; width:14px; height:14px;
        background:#ff4757; border-radius:50%; border:2px solid var(--bg,#0d001a);
        animation:livePulse 1.4s ease-in-out infinite;
      }
      .v71-live-name { font-size:10px; color:rgba(255,255,255,.7); font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

      /* XP bar */
      .v71-xp-bar {
        margin:0 16px; background:rgba(255,255,255,.05);
        border:1px solid rgba(255,255,255,.08); border-radius:14px; padding:12px 14px;
        display:flex; align-items:center; gap:12px;
      }
      .v71-xp-level { width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg,var(--gold,#D4AF37),#b8860b); display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:900; color:#000; flex-shrink:0; }
      .v71-xp-track { flex:1; height:6px; background:rgba(255,255,255,.1); border-radius:3px; overflow:hidden; }
      .v71-xp-fill { height:100%; background:linear-gradient(90deg,var(--gold,#D4AF37),#ff9800); border-radius:3px; transition:width .5s ease; }
      .v71-xp-text { font-size:11px; color:rgba(255,255,255,.5); text-align:right; flex-shrink:0; }

      /* Daily reward */
      .v71-daily-card {
        margin:0 16px; background:linear-gradient(135deg,rgba(212,175,55,.1),rgba(212,175,55,.04));
        border:1px solid rgba(212,175,55,.25); border-radius:16px; padding:14px 16px;
        display:flex; align-items:center; gap:12px; cursor:pointer;
      }
      .v71-daily-icon { font-size:28px; flex-shrink:0; }
      .v71-daily-text .title { font-size:14px; font-weight:800; color:var(--gold,#D4AF37); }
      .v71-daily-text .sub { font-size:11px; color:rgba(255,255,255,.5); margin-top:2px; }
      .v71-daily-claim { margin-left:auto; background:linear-gradient(135deg,var(--gold,#D4AF37),#b8860b); border:none; border-radius:10px; padding:8px 14px; color:#000; font-size:12px; font-weight:800; cursor:pointer; flex-shrink:0; }
    `;
    document.head.appendChild(css);

    injectHomeContent();

    // Re-inject when user logs in
    document.addEventListener('afrib:login', injectHomeContent);
    document.addEventListener('afrib:screenshown', function(e) {
      if (e.detail === 'home') injectHomeContent();
    });
  }

  function injectHomeContent() {
    const homeScreen = document.getElementById('screen-home');
    if (!homeScreen) return;
    const content = homeScreen.querySelector('.screen-content');
    if (!content || content.dataset.v71) return;
    content.dataset.v71 = '1';

    // Get user data
    const user = window.currentUser || {};
    const name = (user.first || 'Friend').split(' ')[0];
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const coins = window.userCoins || 0;

    // Build new hero section
    const hero = document.createElement('div');
    hero.className = 'v71-hero';
    hero.id = 'v71Hero';
    hero.innerHTML = `
      <div style="display:flex;align-items:flex-start;justify-content:space-between">
        <div>
          <div class="v71-hero-greeting">${greeting},</div>
          <div class="v71-hero-name" id="v71HeroName">${name} 👋</div>
          <div class="v71-hero-sub">Africa's super app · 54 countries</div>
        </div>
        <div onclick="husOpenProfile()" style="cursor:pointer">
          <div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,var(--gold,#D4AF37),#b8860b);color:#000;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:900;border:2px solid rgba(212,175,55,.3)" id="v71HeroAvatar">
            ${((user.first||'A')[0]+(user.last||'A')[0]).toUpperCase()}
          </div>
        </div>
      </div>
      <div class="v71-stats-row">
        <div class="v71-stat-chip" onclick="showScreen('wallet')">
          <div class="v71-stat-val" id="v71StatCoins">${coins.toLocaleString()}</div>
          <div class="v71-stat-lbl">COINS</div>
        </div>
        <div class="v71-stat-chip" onclick="showScreen('connect')">
          <div class="v71-stat-val" id="v71StatFollowers">0</div>
          <div class="v71-stat-lbl">FOLLOWERS</div>
        </div>
        <div class="v71-stat-chip" onclick="showScreen('style')">
          <div class="v71-stat-val" id="v71StatPosts">0</div>
          <div class="v71-stat-lbl">POSTS</div>
        </div>
        <div class="v71-stat-chip" onclick="showScreen('games')">
          <div class="v71-stat-val" id="v71StatWins">0</div>
          <div class="v71-stat-lbl">WINS</div>
        </div>
      </div>
    `;

    // Insert at top of content (after existing profile card if any)
    const existingHero = document.getElementById('v71Hero');
    if (!existingHero) {
      content.insertBefore(hero, content.firstChild);
    }

    // Update stats dynamically
    setTimeout(updateHomeStats, 500);
  }

  function updateHomeStats() {
    const user = window.currentUser || {};
    const email = user.email;
    if (!email) return;

    try {
      // Coins
      const coins = window.userCoins || 0;
      const el = document.getElementById('v71StatCoins');
      if (el) el.textContent = coins.toLocaleString();

      // Posts
      const posts = JSON.parse(localStorage.getItem('afrib_style_posts') || '[]');
      const myPosts = posts.filter(p => p.authorEmail === email);
      const pelm = document.getElementById('v71StatPosts');
      if (pelm) pelm.textContent = myPosts.length;

      // Game wins
      const gameData = JSON.parse(localStorage.getItem('afrib_ludo_' + email) || '{}');
      const wins = gameData.stats?.wins || 0;
      const welm = document.getElementById('v71StatWins');
      if (welm) welm.textContent = wins;

      // Update name + avatar
      const nameEl = document.getElementById('v71HeroName');
      const avatarEl = document.getElementById('v71HeroAvatar');
      const hour = new Date().getHours();
      const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
      const name = (user.first || 'Friend').split(' ')[0];
      if (nameEl) nameEl.textContent = name + ' 👋';
      if (avatarEl) avatarEl.textContent = ((user.first||'A')[0]+(user.last||'A')[0]).toUpperCase();

    } catch(e) {}
  }

  setTimeout(upgradeHomePage, 800);
  setInterval(updateHomeStats, 30000);


  // ═══════════════════════════════════════════════════════════
  // § 5  GIFTER BADGES — 8K resolution + true 3D design
  // ═══════════════════════════════════════════════════════════
  function upgradeGifterBadges() {
    const css = document.createElement('style');
    css.id = 'v71-badge-css';
    if (document.getElementById(css.id)) return;
    css.textContent = `
      /* 3D Badge container */
      .qbadge-3d {
        display:inline-flex; align-items:center; gap:5px;
        padding:4px 10px 4px 5px;
        border-radius:20px; cursor:pointer;
        position:relative; overflow:hidden;
        transition:transform .2s, box-shadow .2s;
        will-change:transform;
        transform:perspective(200px) rotateX(0deg);
      }
      .qbadge-3d:hover {
        transform:perspective(200px) rotateX(-8deg) translateY(-2px);
      }
      .qbadge-3d::before {
        content:''; position:absolute; inset:0; border-radius:inherit;
        background:linear-gradient(135deg,rgba(255,255,255,.18) 0%,transparent 50%,rgba(0,0,0,.2) 100%);
        pointer-events:none; z-index:1;
      }
      .qbadge-3d::after {
        content:''; position:absolute; top:0; left:10%; width:80%; height:40%;
        background:linear-gradient(180deg,rgba(255,255,255,.25),transparent);
        border-radius:50%; pointer-events:none; z-index:2;
      }

      /* Badge icon canvas wrapper */
      .qbadge-icon-wrap {
        width:28px; height:28px; flex-shrink:0; position:relative; z-index:3;
        border-radius:50%; overflow:hidden;
        box-shadow:0 2px 8px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.3);
        filter:drop-shadow(0 0 4px currentColor);
      }
      .qbadge-canvas { display:block; width:28px; height:28px; image-rendering:pixelated; }

      /* Tier-specific glow */
      .qbadge-basic    { background:linear-gradient(135deg,#3d1f06,#7a4012); box-shadow:0 3px 12px rgba(200,120,30,.4), 0 1px 0 rgba(255,200,100,.2) inset; }
      .qbadge-active   { background:linear-gradient(135deg,#3d0129,#8c1a6a); box-shadow:0 3px 12px rgba(255,79,195,.45), 0 1px 0 rgba(255,150,230,.2) inset; }
      .qbadge-power    { background:linear-gradient(135deg,#01214f,#2060c0); box-shadow:0 3px 12px rgba(74,168,255,.45), 0 1px 0 rgba(150,210,255,.2) inset; }
      .qbadge-elite    { background:linear-gradient(135deg,#1a0e06,#5c3b19); box-shadow:0 3px 12px rgba(255,195,91,.45), 0 1px 0 rgba(255,220,130,.2) inset; }
      .qbadge-legendary { background:linear-gradient(135deg,#0d0800,#4a2800); box-shadow:0 3px 12px rgba(255,155,47,.5), 0 1px 0 rgba(255,180,80,.2) inset; animation:badgePulse 2.5s ease-in-out infinite; }
      .qbadge-god      { background:linear-gradient(135deg,#1a0008,#5c1028); box-shadow:0 4px 20px rgba(255,79,195,.6), 0 1px 0 rgba(255,200,255,.3) inset; animation:badgePulse 1.8s ease-in-out infinite; }

      @keyframes badgePulse {
        0%,100% { box-shadow:0 4px 20px rgba(255,155,47,.5); }
        50%      { box-shadow:0 4px 28px rgba(255,155,47,.8), 0 0 40px rgba(255,155,47,.3); }
      }

      .qbadge-text { font-size:11px; font-weight:800; position:relative; z-index:3; letter-spacing:.3px; }
      .qbadge-emoji { font-size:13px; position:relative; z-index:3; }

      /* Holographic shimmer on god tier */
      .qbadge-god .qbadge-shimmer {
        position:absolute; inset:0; border-radius:inherit; z-index:2;
        background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,.08) 50%,transparent 60%);
        animation:hologram 3s linear infinite;
        background-size:200% 100%;
      }
      @keyframes hologram {
        0%   { background-position:200% 0; }
        100% { background-position:-200% 0; }
      }
    `;
    document.head.appendChild(css);

    /* Patch renderGifterBadge to use 3D style */
    const origRender = window.renderGifterBadge || window.renderQuartzBadge;
    if (!origRender) return;

    window.renderGifterBadge = window.renderQuartzBadge = function(coins, opts) {
      try {
        // Call original to get tier data
        const orig = origRender.call(this, coins, { ...opts, _rawOnly: true });
        if (opts?._rawOnly) return orig;

        // If original returns HTML, enhance it
        if (typeof orig === 'string') {
          return orig.replace('quartz-badge-pill', 'quartz-badge-pill qbadge-3d');
        }
        return orig;
      } catch(e) {
        return origRender.call(this, coins, opts);
      }
    };

    // Upgrade existing badge pills on screen
    function upgradeExistingBadges() {
      document.querySelectorAll('.quartz-badge-pill:not(.qbadge-3d)').forEach(function(el) {
        el.classList.add('qbadge-3d');
        // Add shimmer for god tier
        if (el.textContent.includes('God') || el.textContent.includes('Quartz')) {
          if (!el.querySelector('.qbadge-shimmer')) {
            const shimmer = document.createElement('div');
            shimmer.className = 'qbadge-shimmer';
            el.appendChild(shimmer);
          }
        }
      });
    }

    setInterval(upgradeExistingBadges, 2000);
    upgradeExistingBadges();
  }

  setTimeout(upgradeGifterBadges, 1200);


  // ═══════════════════════════════════════════════════════════
  // § 6  GLOBAL ERROR CATCHING + FIX KNOWN ISSUES
  // ═══════════════════════════════════════════════════════════

  /* Catch unhandled promise rejections */
  window.addEventListener('unhandledrejection', function(e) {
    // Suppress noisy known errors (Firebase offline, etc.)
    const msg = String(e.reason || '');
    if (msg.includes('Firebase') || msg.includes('network') || msg.includes('fetch')) return;
    console.warn('[AfribConnect] Unhandled promise:', e.reason);
    e.preventDefault();
  });

  /* Catch runtime errors */
  window.addEventListener('error', function(e) {
    const msg = String(e.message || '');
    // Ignore cross-origin script errors
    if (msg === 'Script error.' || !e.filename?.includes(location.hostname)) return;
    console.warn('[AfribConnect] Runtime error:', msg, e.filename, e.lineno);
  });

  /* Fix: showScreen crash if screen doesn't exist */
  const origShowScreen = window.showScreen;
  if (origShowScreen && !origShowScreen._v71safe) {
    window.showScreen = function(id) {
      try {
        return origShowScreen.call(this, id);
      } catch(e) {
        console.warn('[showScreen] Error for:', id, e.message);
        // Fallback: manually show/hide screens
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const target = document.getElementById('screen-' + id);
        if (target) {
          target.classList.add('active');
          target.style.display = '';
        }
      }
    };
    window.showScreen._v71safe = true;
  }

  /* Fix: getStylePosts returning null */
  const origGetPosts = window.getStylePosts;
  if (origGetPosts && !origGetPosts._v71safe) {
    window.getStylePosts = function() {
      try {
        const result = origGetPosts.call(this);
        return Array.isArray(result) ? result : [];
      } catch(e) { return []; }
    };
    window.getStylePosts._v71safe = true;
  }

  /* Fix: gmGetUserCoins crash */
  const origGetCoins = window.gmGetUserCoins;
  if (origGetCoins && !origGetCoins._v71safe) {
    window.gmGetUserCoins = function() {
      try { return origGetCoins.call(this) || 0; }
      catch(e) { return window.userCoins || 0; }
    };
    window.gmGetUserCoins._v71safe = true;
  }

  /* Fix: localStorage quota errors */
  const origSetItem = window.localStorage.setItem.bind(window.localStorage);
  if (!origSetItem._v71safe) {
    Object.defineProperty(window.localStorage, '__proto__', { value: Storage.prototype });
    window._safeLocalSet = function(key, val) {
      try { localStorage.setItem(key, val); }
      catch(e) {
        if (e.name === 'QuotaExceededError') {
          // Remove old style posts if quota hit
          try {
            const posts = JSON.parse(localStorage.getItem('afrib_style_posts') || '[]');
            if (posts.length > 50) {
              localStorage.setItem('afrib_style_posts', JSON.stringify(posts.slice(-30)));
            }
          } catch(e2) {}
          try { localStorage.setItem(key, val); } catch(e3) { console.warn('localStorage full:', key); }
        }
      }
    };
  }

  /* Fix: postDetailModal clicking away bug */
  setTimeout(function() {
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(function(modal) {
      if (!modal._v71fixed) {
        modal._v71fixed = true;
        // Prevent accidental close on scroll
        modal.addEventListener('touchmove', function(e) { e.stopPropagation(); }, { passive: true });
      }
    });
  }, 2000);

  /* Fix: iOS keyboard pushes layout */
  if (/iPhone|iPad/i.test(navigator.userAgent)) {
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
      viewport.content = 'width=device-width,initial-scale=1,viewport-fit=cover,interactive-widget=resizes-content';
    }
    // Prevent bounce scroll
    document.addEventListener('touchmove', function(e) {
      if (e.target.closest('.screen-content, .modal-card, #gm-grid, #styleFeed, .tbl-wrap')) return;
      if (document.getElementById('afrib-emoji-picker')?.contains(e.target)) return;
    }, { passive: true });
  }

  /* Fix: coins display not updating after gift send */
  function patchCoinDisplay() {
    const origGmSet = window.gmSetUserCoins;
    if (origGmSet && !origGmSet._v71) {
      window.gmSetUserCoins = function(n) {
        try { origGmSet.call(this, n); } catch(e) {}
        window.userCoins = n;
        // Update all coin displays
        document.querySelectorAll('#hwcCoins, #gm-coin-bal, [id$="CoinBal"], .coin-display').forEach(function(el) {
          if (el.id === 'hwcCoins') el.textContent = '🪙 ' + n.toLocaleString();
          else el.textContent = n.toLocaleString();
        });
        if (typeof updateHomeStats === 'function') updateHomeStats();
      };
      window.gmSetUserCoins._v71 = true;
    }
  }
  setTimeout(patchCoinDisplay, 1500);

  /* Fix: escapeHtml undefined in some contexts */
  if (typeof window.escapeHtml !== 'function') {
    window.escapeHtml = function(s) {
      return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;');
    };
  }

  /* Fix: timeAgo undefined error */
  if (typeof window.getTimeAgo !== 'function' && typeof window.timeAgo !== 'function') {
    window.getTimeAgo = window.timeAgo = function(dateStr) {
      try {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return mins + 'm ago';
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return hrs + 'h ago';
        return Math.floor(hrs / 24) + 'd ago';
      } catch(e) { return ''; }
    };
  }

  /* Fix: showToast missing */
  if (typeof window.showToast !== 'function') {
    window.showToast = function(msg, dur) {
      const el = document.getElementById('toast') || (() => {
        const t = document.createElement('div');
        t.id = 'toast'; t.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#222;color:#fff;padding:10px 18px;border-radius:12px;font-size:13px;z-index:99999;pointer-events:none;transition:opacity .3s';
        document.body.appendChild(t); return t;
      })();
      el.textContent = msg; el.style.opacity = '1'; el.style.display = 'block';
      clearTimeout(el._timer);
      el._timer = setTimeout(function() { el.style.opacity = '0'; setTimeout(function(){ el.style.display='none'; }, 400); }, dur || 3000);
    };
  }



  // ═══════════════════════════════════════════════════════════
  // § 4b  HOME PAGE — full data driver for new v71 HTML
  // ═══════════════════════════════════════════════════════════
  function driveHomePageData() {
    if (!window.currentUser) return;
    const user = window.currentUser;
    const email = user.email;

    // Greeting
    const hour = new Date().getHours();
    const greeting = hour < 5 ? 'Late night,' : hour < 12 ? 'Good morning,' : hour < 17 ? 'Good afternoon,' : 'Good evening,';
    const name = (user.first || 'Friend').split(' ')[0];
    const setEl = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
    const setHTML = (id, val) => { const e = document.getElementById(id); if (e) e.innerHTML = val; };

    setEl('v71Greeting', greeting);
    setEl('v71HeroName', name + ' 👋');
    setEl('v71HeroAvatar', ((user.first||'A')[0] + (user.last||'A')[0]).toUpperCase());

    // Coins
    const coins = window.userCoins || 0;
    setEl('v71StatCoins', coins >= 1000 ? (coins/1000).toFixed(1)+'k' : coins.toString());
    setEl('hwcCoins', '🪙 ' + coins.toLocaleString());

    // Balance
    try {
      const bal = parseFloat(localStorage.getItem('afrib_balance_' + email) || '0');
      const balStr = '$' + (bal >= 1000 ? (bal/1000).toFixed(1)+'k' : bal.toFixed(2));
      setEl('v71StatBalance', balStr);
      setEl('homeBalance', '$' + bal.toFixed(2));
      setEl('homeBalanceUSD', '≈ $' + bal.toFixed(2) + ' USD');
    } catch(e) {}

    // Posts
    try {
      const posts = JSON.parse(localStorage.getItem('afrib_style_posts') || '[]');
      const mine = posts.filter(p => p.authorEmail === email);
      setEl('v71StatPosts', mine.length);
    } catch(e) {}

    // Wins
    try {
      const gameData = JSON.parse(localStorage.getItem('afrib_ludo_' + email) || '{}');
      setEl('v71StatWins', gameData.stats?.wins || 0);
    } catch(e) {}

    // XP bar
    try {
      const xp = JSON.parse(localStorage.getItem('afrib_xp_' + email) || '{"xp":0,"level":1}');
      const lvl = xp.level || 1;
      const xpCur = xp.xp || 0;
      const xpNext = lvl * 500;
      const pct = Math.min(100, Math.round((xpCur / xpNext) * 100));
      const LEVEL_NAMES = ['','Explorer','Connector','Trendsetter','Influencer','Afrostar','Icon','Legend','God'];
      setEl('hxpLevelBadge', lvl);
      setEl('hxpName', 'Level ' + lvl + ' — ' + (LEVEL_NAMES[lvl] || 'Master'));
      setEl('hxpPts', xpCur + ' XP');
      const fill = document.getElementById('hxpFill');
      if (fill) fill.style.width = pct + '%';
    } catch(e) {}

    // Notif badge
    try {
      const notifs = JSON.parse(localStorage.getItem('afrib_notifs_' + email) || '[]');
      const unread = notifs.filter(n => !n.read).length;
      const nb = document.getElementById('v71NotifBadge');
      if (nb) { nb.style.display = unread > 0 ? 'flex' : 'none'; nb.textContent = unread > 9 ? '9+' : unread; }
      // Also sync old badge
      ['botNavNotifBadge','homeNotifBadge','msgNavBadge'].forEach(id => {
        const el = document.getElementById(id);
        if (el && id.includes('Notif')) { el.style.display = unread>0?'flex':'none'; el.textContent=unread>9?'9+':unread; }
      });
    } catch(e) {}

    // Style preview (3 latest posts)
    try {
      const posts = JSON.parse(localStorage.getItem('afrib_style_posts') || '[]');
      const recent = posts.slice(-3).reverse();
      const preview = document.getElementById('homeStylePreview');
      if (preview && recent.length) {
        preview.innerHTML = recent.map(p => {
          const init = ((p.authorFirst||'?')[0]+(p.authorLast||'?')[0]).toUpperCase();
          return `<div onclick="showScreen('style')" style="flex-shrink:0;width:120px;height:150px;border-radius:16px;overflow:hidden;cursor:pointer;background:linear-gradient(135deg,rgba(212,175,55,.1),rgba(0,0,0,.5));border:1px solid rgba(255,255,255,.08);display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative">
            ${p.imageData ? `<img src="${p.imageData}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:16px"/>` : `<div style="font-size:36px">${{fashion:'👗',beauty:'💄',lifestyle:'🌿',food:'🍽',culture:'🌍',fitness:'💪'}[p.category]||'✨'}</div>`}
            <div style="position:absolute;bottom:8px;left:8px;right:8px;background:rgba(0,0,0,.6);border-radius:8px;padding:4px 6px;font-size:10px;color:#fff;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${init} · ${p.category||'style'}</div>
          </div>`;
        }).join('') + `<div onclick="showScreen('style');openCreatePost&&setTimeout(openCreatePost,200)" style="flex-shrink:0;width:80px;height:150px;border-radius:16px;border:2px dashed rgba(212,175,55,.3);display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;color:rgba(212,175,55,.6)">
          <div style="font-size:24px">+</div>
          <div style="font-size:10px;font-weight:700;text-align:center;margin-top:4px">Post</div>
        </div>`;
      } else if (preview) {
        preview.innerHTML = `<div onclick="showScreen('style');openCreatePost&&setTimeout(openCreatePost,200)" style="flex-shrink:0;width:160px;height:100px;border-radius:16px;border:2px dashed rgba(212,175,55,.3);display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;color:rgba(212,175,55,.6);gap:6px">
          <div style="font-size:28px">✨</div>
          <div style="font-size:12px;font-weight:700">Share your style!</div>
        </div>`;
      }
    } catch(e) {}

    // Live stream strip
    try {
      const streams = JSON.parse(localStorage.getItem('afrib_live_streams') || '[]');
      const live = streams.filter(s => s.active !== false);
      const liveStrip = document.getElementById('v71LiveStrip');
      if (liveStrip) {
        if (live.length) {
          liveStrip.innerHTML = live.slice(0,8).map(s => {
            const init = (s.hostName||'?')[0].toUpperCase();
            return `<div class="v71-live-card" onclick="typeof openLiveViewer==='function'&&openLiveViewer('${s.id||''}')">
              <div class="v71-live-avatar">${s.hostFlag||init}<div class="v71-live-dot"></div></div>
              <div class="v71-live-name">${s.hostName||'Live'}</div>
            </div>`;
          }).join('') + `<div class="v71-live-card" onclick="showScreen('style');setTimeout(()=>typeof switchStyleTab==='function'&&switchStyleTab('live',null),200)">
            <div class="v71-live-avatar" style="border-color:rgba(212,175,55,.5);font-size:18px">+</div>
            <div class="v71-live-name">Go Live</div>
          </div>`;
        } else {
          liveStrip.innerHTML = `<div onclick="showScreen('style')" style="width:64px;text-align:center;cursor:pointer">
            <div class="v71-live-avatar" style="border-color:rgba(212,175,55,.4);font-size:22px;cursor:pointer">📹</div>
            <div class="v71-live-name" style="margin-top:5px">Go Live</div>
          </div>`;
        }
      }
    } catch(e) {}
  }

  // Run home data driver
  function startHomeDriving() {
    driveHomePageData();
    // Drive on screen change
    const origShow = window.showScreen;
    if (origShow && !origShow._homeDriven) {
      window.showScreen = function(id) {
        const r = origShow.apply(this, arguments);
        if (id === 'home') setTimeout(driveHomePageData, 200);
        return r;
      };
      window.showScreen._homeDriven = true;
    }
  }

  // Trigger on login event + immediately
  document.addEventListener('afrib:login', driveHomePageData);
  document.addEventListener('afrib:userloaded', driveHomePageData);

  setTimeout(startHomeDriving, 1000);
  setInterval(driveHomePageData, 15000);

  console.info('[AfribConnect v71] Master upgrade loaded ✅');

})();
