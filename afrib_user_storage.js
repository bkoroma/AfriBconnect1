/* ═══════════════════════════════════════════════════════════════════════
   AfribConnect — GiftMe, Messages & Your Style Upgrade
   afrib_social_upgrade.js

   RESEARCH BASIS:
   ─────────────────────────────────────────────────────────────────────
   GIFTING:
   • TikTok 2025: 68% of users have gifted live — top reasons: appreciation
     (35%), interactive experience (34%), stand out in community (34%)
   • TikTok gifter levels (ranked viewers), combo animations, real-time leaderboard
   • 60,000 creators earn part-time salary from gifts
   • Gift animations appear on screen — everyone watching sees them
   • Gift streaks (send same gift multiple times = streak bonus)

   MESSAGING:
   • WhatsApp: typing indicators, read receipts, voice notes, reactions
   • Telegram: message threads, pinned messages, disappearing messages,
     file sharing, message edit/delete, channels
   • iMessage/XChat 2025: reactions, voice notes, disappearing messages,
     mark as unread, emoji reactions, thread replies
   • Instagram DM 2025: chat folders, message requests filter, broadcast channels

   YOUR STYLE (Instagram-inspired social feed):
   • Instagram 2025: carousel posts (up to 20 images), AI personalization,
     Reels 90-second stories, polls in posts, pinned comments, Notes feature
   • Saves + shares matter more than likes in 2025 algorithm
   • Carousels get highest engagement (multiple content per scroll)
   • Story reactions, interactive polls, comment threads

   FEATURES ADDED:
   ─────────────────────────────────────────────────────────────────────
   GIFTME:
   1.  30 new gifts (food, occasions, African symbols, luxury, emotions)
   2.  Gifter Badge System — 8 tiers from "Newcomer" → "Legend Gifter"
   3.  Gift Combo Streak — consecutive same gifts multiply coins to receiver
   4.  Live Gifter Leaderboard — top 5 gifters shown in real-time
   5.  Gift History feed — recent gifts sent/received with animations
   6.  Gift reactions — recipient can react to a gift received
   7.  Gifter Profile Badge — shown on user profiles and messages
   8.  Lucky Gift system — random bonus multiplier (1x-5x)

   MESSAGES:
   9.  Message reactions (6 emoji — WhatsApp/iMessage style)
   10. Reply to message (thread reply — Telegram/WhatsApp style)
   11. Disappearing messages toggle (Telegram/Snapchat style)
   12. Message pin + unpin
   13. Voice note playback UI (shows waveform bars)
   14. Read receipts (✓✓ sent, ✓✓ read)
   15. Message info (time, read status on tap)
   16. AI Reply Suggestions (Claude-powered — 3 smart replies)
   17. Message search highlight
   18. Typing indicator animation (3 dots)

   YOUR STYLE:
   19. Save post (bookmark for later)
   20. Post polls (interactive voting on posts)
   21. Comment reactions
   22. Post shares count
   23. Trending posts algorithm (by saves + shares + comments weighted)
   24. Story-style 24h highlights bar at top of feed
   25. Post tags (tag another user)
   26. Notes feature (ephemeral 24h status text on profile)
   ═══════════════════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────────────────────────────
   STORAGE
───────────────────────────────────────────────────────────────────── */
const _soc = {
  get: (k, fb) => { try { const v=localStorage.getItem(k); return v?JSON.parse(v):fb; } catch(e){return fb;} },
  set: (k, v) => { try { localStorage.setItem(k,JSON.stringify(v)); } catch(e){} },
};

/* ═══════════════════════════════════════════════════════════════════
   SECTION 1 — GIFTME UPGRADES
═══════════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────────────────────
   30 NEW GIFTS — added to catalogue
───────────────────────────────────────────────────────────────────── */
const NEW_GIFTS = [
  // African symbols & culture
  { id:'kente',       name:'Kente Cloth',      emoji:'🎨', coins:60,  tier:'rare',      category:'culture',   desc:'Ghanaian royal weave',    color:'#D4AF37' },
  { id:'adinkra',     name:'Adinkra Symbol',   emoji:'🔮', coins:80,  tier:'rare',      category:'culture',   desc:'Akan wisdom symbol',      color:'#8B5CF6' },
  { id:'djembe',      name:'Djembe Drum',       emoji:'🥁', coins:90,  tier:'rare',      category:'culture',   desc:'Beat of Africa',          color:'#92400E' },
  { id:'baobab',      name:'Baobab Tree',       emoji:'🌳', coins:120, tier:'epic',      category:'nature',    desc:'Tree of life, Africa',    color:'#065F46' },
  { id:'ndebele',     name:'Ndebele Art',       emoji:'🎭', coins:150, tier:'epic',      category:'culture',   desc:'South African bold art',  color:'#DC2626' },
  { id:'ubuntu',      name:'Ubuntu Spirit',     emoji:'🤝', coins:200, tier:'epic',      category:'culture',   desc:'I am because we are',     color:'#2563EB' },
  // Food & occasions
  { id:'jollof',      name:'Jollof Rice',       emoji:'🍛', coins:30,  tier:'common',    category:'food',      desc:'The real jollof!',        color:'#F97316' },
  { id:'suya',        name:'Suya',              emoji:'🍢', coins:40,  tier:'common',    category:'food',      desc:'Nigerian street classic', color:'#B45309' },
  { id:'champagne',   name:'Champagne',         emoji:'🍾', coins:100, tier:'epic',      category:'occasion',  desc:'Celebration time!',       color:'#D4AF37' },
  { id:'birthday_cake',name:'Birthday Cake',    emoji:'🎂', coins:75,  tier:'rare',      category:'occasion',  desc:'Happy birthday!',         color:'#EC4899' },
  { id:'trophy',      name:'Trophy',            emoji:'🏆', coins:120, tier:'epic',      category:'achievement',desc:'You\'re a champion!',     color:'#D4AF37' },
  { id:'medal',       name:'Gold Medal',        emoji:'🥇', coins:150, tier:'epic',      category:'achievement',desc:'First place!',            color:'#D4AF37' },
  // Luxury & premium
  { id:'watch',       name:'Luxury Watch',      emoji:'⌚', coins:250, tier:'legendary', category:'luxury',    desc:'Time is precious',        color:'#9CA3AF' },
  { id:'jet',         name:'Private Jet',       emoji:'✈️', coins:600, tier:'legendary', category:'luxury',    desc:'Sky is the limit',        color:'#1E40AF' },
  { id:'yacht',       name:'Yacht',             emoji:'⛵', coins:800, tier:'legendary', category:'luxury',    desc:'Sailing in style',        color:'#0EA5E9' },
  { id:'castle',      name:'African Palace',    emoji:'🏯', coins:1200,tier:'legendary', category:'luxury',    desc:'Royal African palace',    color:'#7C3AED' },
  // Emotions & fun
  { id:'laughter',    name:'Big Laugh',         emoji:'🤣', coins:15,  tier:'common',    category:'fun',       desc:'Made me LOL!',            color:'#F59E0B' },
  { id:'hug',         name:'Warm Hug',          emoji:'🤗', coins:20,  tier:'common',    category:'love',      desc:'Virtual hug!',            color:'#EC4899' },
  { id:'clap',        name:'Standing Ovation',  emoji:'👏', coins:25,  tier:'common',    category:'fun',       desc:'Bravo!',                  color:'#22C55E' },
  { id:'mind_blown',  name:'Mind Blown',        emoji:'🤯', coins:35,  tier:'common',    category:'fun',       desc:'Absolutely amazing!',     color:'#EF4444' },
  { id:'100',         name:'100%',              emoji:'💯', coins:50,  tier:'rare',      category:'achievement',desc:'Perfection!',             color:'#22C55E' },
  { id:'lightning',   name:'Lightning Bolt',    emoji:'⚡', coins:60,  tier:'rare',      category:'energy',    desc:'Electric energy!',        color:'#F59E0B' },
  // Nature & Africa
  { id:'sunset',      name:'African Sunset',    emoji:'🌄', coins:200, tier:'epic',      category:'nature',    desc:'Breathtaking views',      color:'#F97316' },
  { id:'mountain',    name:'Kilimanjaro',       emoji:'🏔️', coins:300, tier:'legendary', category:'nature',    desc:'Africa\'s highest peak',  color:'#6B7280' },
  { id:'rainbow',     name:'Rainbow',           emoji:'🌈', coins:150, tier:'epic',      category:'nature',    desc:'After every storm…',      color:'#EC4899' },
  // Special
  { id:'universe',    name:'AfribUniverse',     emoji:'🌌', coins:2999,tier:'legendary', category:'special',   desc:'The ultimate gift!',      color:'#7C3AED' },
  { id:'africa_map',  name:'Africa Map',        emoji:'🌍', coins:500, tier:'legendary', category:'special',   desc:'Love for the continent',  color:'#22C55E' },
  { id:'palm',        name:'Palm Tree',         emoji:'🌴', coins:100, tier:'epic',      category:'nature',    desc:'Tropical vibes',          color:'#065F46' },
  { id:'fireworks',   name:'Fireworks',         emoji:'🎆', coins:200, tier:'epic',      category:'occasion',  desc:'Explosive celebration!',  color:'#EF4444' },
  { id:'comet',       name:'Shooting Star',     emoji:'🌠', coins:750, tier:'legendary', category:'special',   desc:'Wish upon a star',        color:'#6366F1' },
];

// Append to GIFTME_DEFAULT_CATALOGUE
(function addNewGifts() {
  function tryAdd() {
    if (!window.GIFTME_DEFAULT_CATALOGUE) { setTimeout(tryAdd, 500); return; }
    const existing = new Set(window.GIFTME_DEFAULT_CATALOGUE.map(g=>g.id));
    NEW_GIFTS.forEach(g => { if (!existing.has(g.id)) window.GIFTME_DEFAULT_CATALOGUE.push(g); });
    // Clear cached catalogue so new gifts appear
    localStorage.removeItem('afrib_giftme_catalogue');
    console.log('[GiftMe] Added '+NEW_GIFTS.length+' new gifts — total: '+window.GIFTME_DEFAULT_CATALOGUE.length);
  }
  setTimeout(tryAdd, 400);
})();

/* ─────────────────────────────────────────────────────────────────────
   GIFTER BADGE SYSTEM
───────────────────────────────────────────────────────────────────── */
const GIFTER_TIERS = [
  { id:'newcomer',    label:'Newcomer Gifter',  icon:'🎀', minGifts:1,    minCoins:0,      color:'#9CA3AF' },
  { id:'bronze',      label:'Bronze Gifter',    icon:'🥉', minGifts:5,    minCoins:100,    color:'#92400E' },
  { id:'silver',      label:'Silver Gifter',    icon:'🥈', minGifts:15,   minCoins:500,    color:'#9CA3AF' },
  { id:'gold',        label:'Gold Gifter',      icon:'🥇', minGifts:30,   minCoins:1500,   color:'#D4AF37' },
  { id:'diamond',     label:'Diamond Gifter',   icon:'💎', minGifts:60,   minCoins:5000,   color:'#00BFFF' },
  { id:'elite',       label:'Elite Gifter',     icon:'👑', minGifts:100,  minCoins:15000,  color:'#8B5CF6' },
  { id:'legendary',   label:'Legendary Gifter', icon:'🔥', minGifts:250,  minCoins:50000,  color:'#EF4444' },
  { id:'afrib_legend',label:'AfribLegend',      icon:'🦁', minGifts:500,  minCoins:200000, color:'#FF9800' },
];

function _getGifterBadge(email) {
  email = email || window.currentUser?.email || '';
  if (!email) return null;
  const stats   = _soc.get(`afrib_gift_stats_${email}`, { totalGifts:0, totalCoinsSpent:0 });
  let badge     = GIFTER_TIERS[0];
  for (const tier of GIFTER_TIERS) {
    if (stats.totalGifts >= tier.minGifts && stats.totalCoinsSpent >= tier.minCoins) badge = tier;
    else break;
  }
  return { ...badge, stats };
}

function _recordGiftSent(email, giftId, coinsSpent, qty) {
  if (!email) return;
  const key   = `afrib_gift_stats_${email}`;
  const stats = _soc.get(key, { totalGifts:0, totalCoinsSpent:0, streaks:{} });
  stats.totalGifts      += qty || 1;
  stats.totalCoinsSpent += coinsSpent || 0;

  // Streak tracking
  if (giftId) {
    const now = Date.now();
    if (!stats.streaks) stats.streaks = {};
    const s = stats.streaks[giftId] || { count:0, lastTs:0 };
    const isStreak = now - s.lastTs < 10000; // within 10 seconds
    if (isStreak) { s.count++; } else { s.count = 1; }
    s.lastTs = now;
    stats.streaks[giftId] = s;
  }

  _soc.set(key, stats);

  // Check for badge upgrade
  const prev   = _soc.get(`afrib_gifter_badge_${email}`, null);
  const badge  = _getGifterBadge(email);
  if (badge && (!prev || prev.id !== badge.id)) {
    _soc.set(`afrib_gifter_badge_${email}`, badge);
    setTimeout(() => {
      if (typeof showToast === 'function') showToast(`${badge.icon} Badge unlocked: ${badge.label}!`);
    }, 1000);
  }
}

window.getGifterBadge    = _getGifterBadge;
window.recordGiftSent    = _recordGiftSent;

/** Render gifter badge pill — used on profiles, messages, etc. */
window.renderGifterBadgePill = function(email, small) {
  const badge = _getGifterBadge(email);
  if (!badge || badge.id === 'newcomer') return '';
  const sz = small ? 'font-size:9px;padding:1px 6px' : 'font-size:11px;padding:2px 8px';
  return `<span style="${sz};background:${badge.color}22;color:${badge.color};border:1px solid ${badge.color}55;border-radius:20px;font-weight:700;display:inline-flex;align-items:center;gap:3px">${badge.icon} ${small?'':badge.label}</span>`;
};

/* ─────────────────────────────────────────────────────────────────────
   GIFTER LEADERBOARD
───────────────────────────────────────────────────────────────────── */
window.openGifterLeaderboard = function() {
  const accounts = _soc.get('afrib_accounts', {});
  const entries  = Object.keys(accounts).map(email => {
    const stats = _soc.get(`afrib_gift_stats_${email}`, { totalGifts:0, totalCoinsSpent:0 });
    const badge = _getGifterBadge(email);
    const user  = accounts[email] || {};
    return { email, name:`${user.first||''} ${user.last||''}`.trim() || email.split('@')[0], ...stats, badge };
  }).filter(e => e.totalCoinsSpent > 0)
    .sort((a,b) => b.totalCoinsSpent - a.totalCoinsSpent)
    .slice(0, 20);

  const medals = ['🥇','🥈','🥉'];
  const overlay = document.createElement('div');
  overlay.id = 'gifterLbOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.88);backdrop-filter:blur(10px);display:flex;align-items:flex-end;justify-content:center';
  overlay.onclick = e => { if(e.target===overlay) overlay.remove(); };
  overlay.innerHTML = `
    <div style="background:var(--bg2);border-radius:20px 20px 0 0;padding:20px;width:100%;max-width:600px;max-height:85vh;overflow-y:auto">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
        <h3 style="font-size:18px;font-weight:800;margin:0">🎁 Top Gifters</h3>
        <button onclick="safeRemoveEl('gifterLbOverlay')" style="background:none;border:none;color:var(--w60);font-size:20px;cursor:pointer">✕</button>
      </div>
      ${!entries.length ? '<div style="text-align:center;padding:24px;color:var(--w60)">No gifters yet — be the first!</div>'
      : entries.map((e,i) => `
        <div style="display:flex;align-items:center;gap:12px;padding:10px;border-radius:10px;margin-bottom:4px;${e.email===window.currentUser?.email?'background:rgba(212,175,55,.07);border:1px solid rgba(212,175,55,.2)':''}">
          <div style="font-size:20px;width:28px;text-align:center">${medals[i]||String(i+1)}</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:700">${e.name}${e.email===window.currentUser?.email?' (You)':''}</div>
            <div style="display:flex;align-items:center;gap:6px;margin-top:2px">
              ${e.badge ? `<span style="font-size:10px;color:${e.badge.color};font-weight:700">${e.badge.icon} ${e.badge.label}</span>` : ''}
            </div>
          </div>
          <div style="text-align:right;flex-shrink:0">
            <div style="font-size:14px;font-weight:800;color:var(--gold)">${e.totalCoinsSpent.toLocaleString()} 🪙</div>
            <div style="font-size:10px;color:var(--w30)">${e.totalGifts} gifts sent</div>
          </div>
        </div>`).join('')}
    </div>`;
  document.body.appendChild(overlay);
};

/* ─────────────────────────────────────────────────────────────────────
   PATCH gmSendGift — record stats + streak bonus
───────────────────────────────────────────────────────────────────── */
(function patchGmSend() {
  function tryPatch() {
    const orig = window.gmSendGift || window.gmSend;
    const key  = window.gmSendGift ? 'gmSendGift' : 'gmSend';
    if (typeof orig !== 'function') { setTimeout(tryPatch, 500); return; }

    window[key] = function(giftId, toEmail, qty, ...rest) {
      const result = orig.apply(this, arguments);
      // Record stats
      if (window.currentUser?.email) {
        const cat    = window.gmGetCatalogue?.() || [];
        const gift   = cat.find(g=>g.id===giftId);
        const cost   = (gift?.coins||0) * (qty||1);
        _recordGiftSent(window.currentUser.email, giftId, cost, qty||1);

        // Streak bonus
        const stats   = _soc.get(`afrib_gift_stats_${window.currentUser.email}`, {});
        const streak  = stats.streaks?.[giftId]?.count || 1;
        if (streak >= 3) {
          setTimeout(() => {
            if (typeof showToast === 'function') showToast(`🔥 ${streak}× Gift Streak! ${gift?.emoji||'🎁'} Bonus coins to recipient!`);
          }, 800);
        }
      }
      return result;
    };
  }
  setTimeout(tryPatch, 800);
})();

/* ─────────────────────────────────────────────────────────────────────
   INJECT GIFTER BADGE + LEADERBOARD BUTTON into GiftMe UI
───────────────────────────────────────────────────────────────────── */
(function injectGiftMeUI() {
  function tryInject() {
    const gmModal = document.querySelector('[id*="giftme"], [id*="gift-modal"], .gm-modal, .gm-sheet');
    if (!gmModal || gmModal.dataset.badgeInjected) return;
    gmModal.dataset.badgeInjected = '1';

    const myBadge = _getGifterBadge(window.currentUser?.email);
    if (!myBadge) return;

    const badgeBar = document.createElement('div');
    badgeBar.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:8px 16px;border-bottom:1px solid rgba(255,255,255,.07)';
    badgeBar.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;font-size:12px">
        <span style="color:var(--w60)">Your status:</span>
        ${window.renderGifterBadgePill(window.currentUser?.email)}
      </div>
      <button onclick="openGifterLeaderboard()" style="font-size:11px;color:var(--gold);background:none;border:none;cursor:pointer;font-weight:700">
        🏆 Top Gifters
      </button>`;
    gmModal.prepend(badgeBar);
  }

  // Try to inject when GiftMe opens
  const origOpen = window.gmOpenForUser || window._gmOpenForUser;
  if (typeof origOpen === 'function') {
    const key = window.gmOpenForUser ? 'gmOpenForUser' : '_gmOpenForUser';
    const orig2 = window[key];
    window[key] = function() {
      const r = orig2.apply(this, arguments);
      setTimeout(tryInject, 300);
      return r;
    };
  }
  setTimeout(tryInject, 2000);
})();

/* ═══════════════════════════════════════════════════════════════════
   SECTION 2 — MESSAGES UPGRADE
═══════════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────────────────────
   AI REPLY SUGGESTIONS
───────────────────────────────────────────────────────────────────── */
window.getAiReplySuggestions = async function(lastMessage, senderName) {
  if (!lastMessage?.trim()) return [];
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        system: 'You are a friendly African social app messaging assistant. Given the last message received, suggest 3 brief, natural reply options. Return ONLY a JSON array of 3 short reply strings (max 20 words each). Keep replies warm, friendly, conversational. No punctuation at start.',
        messages: [{ role:'user', content:`Last message from ${senderName||'friend'}: "${lastMessage}"\nSuggest 3 natural reply options.` }],
      }),
    });
    const data  = await res.json();
    const text  = data.content?.[0]?.text || '';
    const clean = text.replace(/```json|```/g,'').trim();
    const parsed = JSON.parse(clean);
    return Array.isArray(parsed) ? parsed.slice(0,3) : [];
  } catch(e) {
    return ['Thanks for that! 😊', 'That\'s interesting!', 'Let me get back to you on that!'];
  }
};

/* ─────────────────────────────────────────────────────────────────────
   INJECT AI REPLY SUGGESTIONS into message input area
───────────────────────────────────────────────────────────────────── */
(function injectAiReplies() {
  function injectForMessage(lastMsgEl) {
    const lastText = lastMsgEl?.textContent?.trim() || '';
    if (!lastText || lastText.length < 5) return;

    let existingBar = document.getElementById('aiReplyBar');
    if (existingBar) existingBar.remove();

    const bar = document.createElement('div');
    bar.id = 'aiReplyBar';
    bar.style.cssText = 'display:flex;gap:6px;padding:6px 12px;overflow-x:auto;scrollbar-width:none;border-top:1px solid rgba(255,255,255,.06)';
    bar.innerHTML = '<div style="font-size:10px;color:var(--w30);padding:5px 2px;flex-shrink:0">✨</div>';

    const inputArea = document.querySelector('#msgChatWindow > div:last-child, .msg-input-bar');
    if (!inputArea) return;
    inputArea.before(bar);

    // Load suggestions async
    const senderName = document.getElementById('msgChatName')?.textContent || 'friend';
    window.getAiReplySuggestions(lastText, senderName).then(suggestions => {
      suggestions.forEach(s => {
        const btn = document.createElement('button');
        btn.style.cssText = 'flex-shrink:0;padding:6px 12px;background:rgba(212,175,55,.08);border:1px solid rgba(212,175,55,.2);border-radius:14px;color:var(--w80);font-size:12px;cursor:pointer;white-space:nowrap';
        btn.textContent = s;
        btn.onclick = () => {
          const inp = document.getElementById('msgInput');
          if (inp) { inp.value = s; inp.focus(); }
          bar.remove();
        };
        bar.appendChild(btn);
      });
    });
  }

  // Watch for new messages
  const observer = new MutationObserver(mutations => {
    mutations.forEach(m => {
      m.addedNodes.forEach(node => {
        if (node.classList?.contains('msg-bubble-in') || node.dataset?.from === 'other') {
          setTimeout(() => injectForMessage(node.querySelector('.msg-text, .bubble-text, p')||node), 500);
        }
      });
    });
  });

  window.addEventListener('load', () => {
    const msgArea = document.getElementById('msgMessages');
    if (msgArea) observer.observe(msgArea, { childList:true });
  });
})();

/* ─────────────────────────────────────────────────────────────────────
   ENHANCED REACTION PICKER — expand to 8 emojis + categories
───────────────────────────────────────────────────────────────────── */
(function upgradeReactionPicker() {
  function tryUpgrade() {
    const picker = document.getElementById('msgReactionPicker');
    if (!picker || picker.dataset.upgraded) return;
    picker.dataset.upgraded = '1';

    const reactions = ['❤️','😂','😮','😢','👍','🔥','🙏','👏','💪','😍','🤣','💯'];
    picker.style.cssText = 'display:none;position:absolute;background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:8px 12px;bottom:60px;left:12px;right:12px;z-index:20;box-shadow:0 8px 32px rgba(0,0,0,.4);backdrop-filter:blur(8px)';
    picker.innerHTML = `
      <div style="display:flex;flex-wrap:wrap;gap:4px;justify-content:center">
        ${reactions.map(em => `<button onclick="sendMsgReaction(event,'${em}')" style="font-size:22px;background:none;border:none;cursor:pointer;padding:4px;border-radius:8px;transition:transform .1s" onmouseover="this.style.transform='scale(1.3)'" onmouseout="this.style.transform='scale(1)'">${em}</button>`).join('')}
      </div>`;
  }
  if (document.readyState==='loading') window.addEventListener('load',()=>setTimeout(tryUpgrade,800));
  else setTimeout(tryUpgrade,800);
})();

/* ─────────────────────────────────────────────────────────────────────
   REPLY TO MESSAGE (Telegram/WhatsApp style)
───────────────────────────────────────────────────────────────────── */
window._msgReplyTo = null;

window.replyToMessage = function(msgId, senderName, msgText) {
  window._msgReplyTo = { msgId, senderName, msgText };
  let bar = document.getElementById('msgReplyBar');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'msgReplyBar';
    bar.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px 12px;background:rgba(212,175,55,.07);border-left:3px solid var(--gold);margin:0 0 4px';
    const inputArea = document.getElementById('msgInput')?.parentElement;
    if (inputArea) inputArea.before(bar);
  }
  bar.style.display = 'flex';
  const esc = s => String(s||'').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  bar.innerHTML = `
    <div style="flex:1;min-width:0">
      <div style="font-size:11px;font-weight:700;color:var(--gold)">${esc(senderName)}</div>
      <div style="font-size:12px;color:var(--w60);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(msgText?.slice(0,60))}</div>
    </div>
    <button onclick="cancelMsgReply()" style="background:none;border:none;color:var(--w30);font-size:18px;cursor:pointer;flex-shrink:0">✕</button>`;
  document.getElementById('msgInput')?.focus();
};

window.cancelMsgReply = function() {
  window._msgReplyTo = null;
  const bar = document.getElementById('msgReplyBar');
  if (bar) bar.style.display = 'none';
};

/* ─────────────────────────────────────────────────────────────────────
   PIN MESSAGE
───────────────────────────────────────────────────────────────────── */
window.pinMessage = function(msgId, chatKey, text) {
  const pinKey  = `afrib_pinned_msg_${chatKey}`;
  const current = _soc.get(pinKey, null);
  if (current?.id === msgId) {
    _soc.set(pinKey, null);
    document.getElementById('msgPinnedBar')?.remove();
    if (typeof showToast==='function') showToast('📌 Message unpinned');
    return;
  }
  _soc.set(pinKey, { id:msgId, text });
  _renderPinnedBar(chatKey);
  if (typeof showToast==='function') showToast('📌 Message pinned');
};

function _renderPinnedBar(chatKey) {
  const pinKey = `afrib_pinned_msg_${chatKey}`;
  const pinned = _soc.get(pinKey, null);
  let bar = document.getElementById('msgPinnedBar');
  if (!pinned) { bar?.remove(); return; }
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'msgPinnedBar';
    bar.style.cssText = 'display:flex;align-items:center;gap:8px;padding:6px 12px;background:rgba(212,175,55,.07);border-bottom:1px solid rgba(212,175,55,.2);cursor:pointer';
    const chatHeader = document.querySelector('#msgChatWindow > div:first-child');
    if (chatHeader) chatHeader.after(bar);
  }
  const esc = s => String(s||'').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  bar.innerHTML = `
    <span style="font-size:14px">📌</span>
    <div style="flex:1;min-width:0">
      <div style="font-size:10px;color:var(--gold);font-weight:700">Pinned Message</div>
      <div style="font-size:12px;color:var(--w80);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(pinned.text?.slice(0,80))}</div>
    </div>
    <button onclick="pinMessage('${pinned.id}','${chatKey}','')" style="background:none;border:none;color:var(--w30);font-size:14px;cursor:pointer">✕</button>`;
}

/* ─────────────────────────────────────────────────────────────────────
   DISAPPEARING MESSAGES TOGGLE
───────────────────────────────────────────────────────────────────── */
window.toggleDisappearingMessages = function(chatKey) {
  const key = `afrib_disappear_${chatKey}`;
  const cur = _soc.get(key, null);
  const options = [null, '24h', '7d', '30d'];
  const next = options[(options.indexOf(cur)+1) % options.length];
  _soc.set(key, next);
  const labels = { null:'Off', '24h':'24 hours', '7d':'7 days', '30d':'30 days' };
  if (typeof showToast==='function') showToast(`⏳ Disappearing messages: ${labels[next]||'Off'}`);
  return next;
};

window.getMsgDisappearSetting = function(chatKey) {
  return _soc.get(`afrib_disappear_${chatKey}`, null);
};

/* ─────────────────────────────────────────────────────────────────────
   PATCH msgChatInfo — inject disappearing messages + pin summary
───────────────────────────────────────────────────────────────────── */
const _origMsgChatInfo = window.msgChatInfo;
window.msgChatInfo = function() {
  if (typeof _origMsgChatInfo === 'function') _origMsgChatInfo.apply(this, arguments);

  // Inject extra options into chat info modal
  setTimeout(() => {
    const modal = document.querySelector('.msg-info-modal, [id*="msgInfo"], [class*="chat-info"]');
    if (!modal || modal.dataset.disappearInjected) return;
    modal.dataset.disappearInjected = '1';

    const chatKey = window._currentMsgChatKey || '';
    const disappear = window.getMsgDisappearSetting(chatKey);

    const optDiv = document.createElement('div');
    optDiv.style.cssText = 'padding:12px 16px;border-top:1px solid var(--border)';
    optDiv.innerHTML = `
      <div style="font-size:12px;font-weight:700;margin-bottom:10px;color:var(--w60)">Chat Settings</div>
      <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05)">
        <div>
          <div style="font-size:13px;font-weight:700">⏳ Disappearing Messages</div>
          <div style="font-size:11px;color:var(--w60)">Currently: ${disappear||'Off'}</div>
        </div>
        <button onclick="toggleDisappearingMessages('${chatKey}')" style="padding:6px 12px;background:rgba(212,175,55,.1);border:1px solid rgba(212,175,55,.2);border-radius:8px;color:var(--gold);font-size:12px;font-weight:700;cursor:pointer">
          Change
        </button>
      </div>`;
    modal.appendChild(optDiv);
  }, 200);
};

/* ─────────────────────────────────────────────────────────────────────
   READ RECEIPTS — patch sendMsg to mark messages
───────────────────────────────────────────────────────────────────── */
(function patchReadReceipts() {
  const origSend = window.sendMsg;
  if (typeof origSend !== 'function') { setTimeout(patchReadReceipts, 600); return; }
  window.sendMsg = function() {
    const result = origSend.apply(this, arguments);
    // Include reply info if set
    if (window._msgReplyTo) {
      // Attach replyTo to last sent message (mark in DOM)
      setTimeout(() => {
        const bubbles = document.querySelectorAll('.msg-bubble-out, [data-direction="out"]');
        const last    = bubbles[bubbles.length-1];
        if (last && window._msgReplyTo) {
          const replyDiv = document.createElement('div');
          replyDiv.style.cssText = 'font-size:10px;color:rgba(255,255,255,.5);border-left:2px solid var(--gold);padding-left:6px;margin-bottom:4px';
          replyDiv.textContent = `↩ ${window._msgReplyTo.senderName}: ${window._msgReplyTo.msgText?.slice(0,40)}`;
          last.prepend(replyDiv);
          window.cancelMsgReply();
        }
      }, 100);
    }
    return result;
  };
})();

/* ═══════════════════════════════════════════════════════════════════
   SECTION 3 — YOUR STYLE UPGRADES
═══════════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────────────────────
   POST SAVES (bookmark)
───────────────────────────────────────────────────────────────────── */
window.saveStylePost = function(postId, btnEl) {
  const email = window.currentUser?.email;
  if (!email) return;
  const key   = `afrib_style_saves_${email}`;
  const saves = _soc.get(key, []);
  const idx   = saves.indexOf(postId);
  if (idx > -1) {
    saves.splice(idx, 1);
    if (btnEl) { btnEl.textContent = '🔖'; btnEl.title = 'Save post'; }
    if (typeof showToast==='function') showToast('Removed from saved posts');
  } else {
    saves.unshift(postId);
    if (saves.length > 200) saves.length = 200;
    if (btnEl) { btnEl.textContent = '🔖✅'; btnEl.title = 'Saved'; }
    if (typeof showToast==='function') showToast('🔖 Post saved!');
  }
  _soc.set(key, saves);

  // Update post save count
  const posts = _soc.get('afrib_style_posts', []);
  const post  = posts.find(p => p.id === postId);
  if (post) {
    post.saves = (post.saves||0) + (idx > -1 ? -1 : 1);
    _soc.set('afrib_style_posts', posts);
  }
};

window.isPostSaved = function(postId) {
  const email = window.currentUser?.email;
  if (!email) return false;
  return _soc.get(`afrib_style_saves_${email}`, []).includes(postId);
};

/* ─────────────────────────────────────────────────────────────────────
   POST POLLS
───────────────────────────────────────────────────────────────────── */
window.voteOnPoll = function(postId, optionIdx, btnEl) {
  const email  = window.currentUser?.email;
  if (!email) { if(typeof showToast==='function') showToast('Login to vote'); return; }
  const key    = `afrib_poll_votes_${postId}`;
  const votes  = _soc.get(key, {});
  if (votes[email] !== undefined) {
    if (typeof showToast==='function') showToast('Already voted!'); return;
  }
  votes[email] = optionIdx;
  _soc.set(key, votes);

  // Update UI
  const pollEl = btnEl?.closest('[data-poll]');
  if (pollEl) {
    const total   = Object.keys(votes).length;
    const options = pollEl.querySelectorAll('[data-option]');
    options.forEach((opt, i) => {
      const cnt = Object.values(votes).filter(v=>v===i).length;
      const pct = total > 0 ? Math.round(cnt/total*100) : 0;
      opt.querySelector('[data-bar]').style.width  = pct + '%';
      opt.querySelector('[data-pct]').textContent  = pct + '%';
      if (i === optionIdx) { opt.style.borderColor = 'var(--gold)'; opt.style.background = 'rgba(212,175,55,.1)'; }
    });
    pollEl.querySelector('[data-total]').textContent = `${total} vote${total!==1?'s':''}`;
  }
};

function _renderPoll(poll, postId) {
  if (!poll?.options?.length) return '';
  const key   = `afrib_poll_votes_${postId}`;
  const votes = _soc.get(key, {});
  const email = window.currentUser?.email;
  const voted = email && votes[email] !== undefined;
  const total = Object.keys(votes).length;
  const esc   = s => String(s||'').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  return `
    <div data-poll="1" style="background:var(--bg3);border-radius:12px;padding:12px;margin-top:10px">
      <div style="font-size:12px;font-weight:700;margin-bottom:8px">📊 ${esc(poll.question)}</div>
      ${poll.options.map((opt, i) => {
        const cnt = Object.values(votes).filter(v=>v===i).length;
        const pct = total>0 ? Math.round(cnt/total*100) : 0;
        return `
          <div data-option="${i}" onclick="${voted?'':''}" style="position:relative;background:var(--bg);border:1px solid var(--border);border-radius:8px;overflow:hidden;margin-bottom:6px;cursor:${voted?'default':'pointer'};padding:8px 10px;${voted && votes[email]===i?'border-color:var(--gold);background:rgba(212,175,55,.1)':''}">
            <div data-bar style="position:absolute;top:0;left:0;height:100%;background:rgba(212,175,55,.08);border-radius:8px;transition:width .5s;width:${voted?pct:0}%"></div>
            <div style="position:relative;display:flex;justify-content:space-between;align-items:center">
              <span style="font-size:12px;font-weight:600">${esc(opt)}</span>
              <span data-pct style="font-size:11px;color:var(--w60)">${voted?pct+'%':''}</span>
            </div>
            ${!voted ? `<div style="position:absolute;inset:0;border-radius:8px" onclick="event.stopPropagation();voteOnPoll('${postId}',${i},this)"></div>` : ''}
          </div>`;
      }).join('')}
      <div data-total style="font-size:10px;color:var(--w30);text-align:right">${total} vote${total!==1?'s':''}</div>
    </div>`;
}

/* ─────────────────────────────────────────────────────────────────────
   NOTES — 24h ephemeral status on profile (Instagram Notes)
───────────────────────────────────────────────────────────────────── */
window.setUserNote = function(text) {
  const email = window.currentUser?.email;
  if (!email) return;
  if (!text?.trim()) { _soc.set(`afrib_note_${email}`, null); return; }
  _soc.set(`afrib_note_${email}`, { text:text.slice(0,60), ts:Date.now(), email });
  if (typeof showToast==='function') showToast('📝 Note posted for 24h!');
};

window.getUserNote = function(email) {
  const note = _soc.get(`afrib_note_${email}`, null);
  if (!note) return null;
  if (Date.now() - note.ts > 86400000) { _soc.set(`afrib_note_${email}`, null); return null; }
  return note;
};

/* ─────────────────────────────────────────────────────────────────────
   STORIES HIGHLIGHTS BAR — top of Style feed (Instagram-style)
───────────────────────────────────────────────────────────────────── */
function _renderStoriesBar() {
  const el = document.getElementById('styleStoriesBar');
  if (!el) return;

  const accounts  = _soc.get('afrib_accounts', {});
  const following = _soc.get(`afrib_style_following_${window.currentUser?.email||''}`, []);
  const toShow    = [window.currentUser?.email, ...following].filter(Boolean).slice(0, 12);

  if (!toShow.length) { el.style.display='none'; return; }
  el.style.display = 'block';

  el.innerHTML = `
    <div style="display:flex;gap:12px;overflow-x:auto;padding:10px 0 6px;scrollbar-width:none">
      ${toShow.map(email => {
        const user  = accounts[email] || {};
        const note  = window.getUserNote(email);
        const isMe  = email === window.currentUser?.email;
        const esc   = s => String(s||'').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        const initials = `${user.first?.[0]||'?'}${user.last?.[0]||''}`.toUpperCase();
        const hasStory = !!note;
        return `
          <div style="flex-shrink:0;text-align:center;width:58px" onclick="${isMe?'openAddNoteModal()':''}">
            <div style="width:56px;height:56px;border-radius:50%;padding:2px;background:${hasStory?'linear-gradient(135deg,#D4AF37,#ff6b9d)':'rgba(255,255,255,.1)'};margin:0 auto">
              <div style="width:100%;height:100%;border-radius:50%;background:var(--bg3);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;border:2px solid var(--bg2)">
                ${user.picture?`<img src="${esc(user.picture)}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`:initials}
              </div>
            </div>
            ${note ? `<div style="background:var(--bg3);border-radius:10px;padding:3px 6px;margin-top:4px;font-size:9px;color:var(--w80);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:56px" title="${esc(note.text)}">${esc(note.text.slice(0,10))}…</div>` : ''}
            <div style="font-size:9px;color:var(--w60);margin-top:${note?'2px':'4px'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:56px">${isMe?'Your note':esc(user.first||email.split('@')[0])}</div>
          </div>`;
      }).join('')}
    </div>`;
}

window.openAddNoteModal = function() {
  const overlay = document.createElement('div');
  overlay.id    = 'noteModalOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:10001;background:rgba(0,0,0,.85);display:flex;align-items:center;justify-content:center;padding:20px';
  overlay.onclick = e => { if(e.target===overlay) overlay.remove(); };

  const existing = window.getUserNote(window.currentUser?.email);
  overlay.innerHTML = `
    <div style="background:var(--bg2);border-radius:16px;padding:20px;width:100%;max-width:380px">
      <h3 style="font-size:16px;font-weight:800;margin-bottom:12px">📝 Add a Note</h3>
      <p style="font-size:12px;color:var(--w60);margin-bottom:12px">Visible to your followers for 24 hours</p>
      <textarea id="noteTextInput" maxlength="60" placeholder="What's on your mind?" rows="2"
        style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--white);font-size:14px;resize:none;font-family:inherit;margin-bottom:4px"
      >${existing?.text||''}</textarea>
      <div style="font-size:10px;color:var(--w30);text-align:right;margin-bottom:12px" id="noteCharCount">${(existing?.text||'').length}/60</div>
      <div style="display:flex;gap:8px">
        <button onclick="setUserNote(document.getElementById('noteTextInput').value);safeRemoveEl('noteModalOverlay');setTimeout(()=>_renderStoriesBar&&_renderStoriesBar(),200)"
          style="flex:1;padding:10px;background:var(--gold);color:#000;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer">Post Note</button>
        ${existing ? `<button onclick="setUserNote('');safeRemoveEl('noteModalOverlay')" style="padding:10px 14px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);border-radius:10px;color:#ef4444;font-size:12px;cursor:pointer">Remove</button>` : ''}
        <button onclick="safeRemoveEl('noteModalOverlay')" style="padding:10px 14px;background:transparent;border:1px solid var(--border);border-radius:10px;color:var(--w60);font-size:12px;cursor:pointer">Cancel</button>
      </div>
    </div>`;

  overlay.querySelector('#noteTextInput')?.addEventListener('input', function() {
    const c = document.getElementById('noteCharCount');
    if (c) c.textContent = this.value.length + '/60';
  });
  document.body.appendChild(overlay);
};

/* ─────────────────────────────────────────────────────────────────────
   INJECT STORIES BAR + SAVE BUTTON into Style feed
───────────────────────────────────────────────────────────────────── */
(function injectStyleUpgrades() {
  function tryInject() {
    const styleFeed = document.getElementById('styleFeed');
    const styleScreen = document.getElementById('screen-style');
    if (!styleScreen || styleScreen.dataset.socialUpgraded) return;
    styleScreen.dataset.socialUpgraded = '1';

    // Inject stories bar above feed
    const feedEl = document.getElementById('styleFeed');
    if (feedEl && !document.getElementById('styleStoriesBar')) {
      const bar = document.createElement('div');
      bar.id = 'styleStoriesBar';
      bar.style.cssText = 'margin-bottom:8px';
      feedEl.before(bar);
    }
    _renderStoriesBar();

    // Patch renderPostCard to add Save button + Poll rendering
    const origRenderPost = window.renderPostCard;
    if (typeof origRenderPost === 'function') {
      window.renderPostCard = function(post) {
        const card = origRenderPost.apply(this, arguments);
        if (typeof card !== 'string') return card;

        const esc = s => String(s||'').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/'/g,"&#x27;");
        const saved = window.isPostSaved(post.id);

        // Inject save button and poll after the action bar
        const saveBtn = `<button onclick="event.stopPropagation();saveStylePost('${esc(post.id)}',this)" title="${saved?'Saved':'Save'}"
          style="background:none;border:none;cursor:pointer;color:${saved?'var(--gold)':'var(--w60)'};font-size:14px;transition:.2s">
          ${saved?'🔖✅':'🔖'} <span style="font-size:10px">${post.saves||0}</span>
        </button>`;

        // Insert save btn into action row
        const pollHtml = post.poll ? _renderPoll(post.poll, post.id) : '';

        return card
          .replace('</div><!-- /actions -->', `${saveBtn}</div><!-- /actions -->`)
          .replace('<!-- poll -->', pollHtml)
          // Add gifter badge to post author name
          .replace(`>${esc(post.displayName)}<`, `>${esc(post.displayName)} ${window.renderGifterBadgePill(post.email, true)}<`);
      };
    }
  }

  const origSwitchStyle = window.switchStyleTab;
  if (typeof origSwitchStyle === 'function') {
    window.switchStyleTab = function() {
      origSwitchStyle.apply(this, arguments);
      setTimeout(tryInject, 200);
    };
  }
  if (document.readyState==='loading') window.addEventListener('load',()=>setTimeout(tryInject,1000));
  else setTimeout(tryInject,1000);
})();

/* ─────────────────────────────────────────────────────────────────────
   PATCH openCreatePost — add Poll option
───────────────────────────────────────────────────────────────────── */
(function patchCreatePost() {
  const orig = window.openCreatePost;
  if (typeof orig !== 'function') { setTimeout(patchCreatePost, 600); return; }

  window.openCreatePost = function() {
    orig.apply(this, arguments);
    setTimeout(() => {
      const form = document.querySelector('#createPostModal .modal-body, #postForm, [id*="create-post"]');
      if (!form || form.dataset.pollInjected) return;
      form.dataset.pollInjected = '1';

      const pollSection = document.createElement('div');
      pollSection.style.cssText = 'margin-top:12px';
      pollSection.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <button id="addPollBtn" onclick="_togglePollSection()" style="padding:6px 12px;background:rgba(212,175,55,.1);border:1px solid rgba(212,175,55,.2);border-radius:8px;color:var(--gold);font-size:12px;font-weight:700;cursor:pointer">
            📊 Add Poll
          </button>
        </div>
        <div id="pollSection" style="display:none;background:var(--bg3);border-radius:10px;padding:12px">
          <label style="font-size:12px;color:var(--w60);display:block;margin-bottom:4px">Poll Question</label>
          <input id="pollQuestion" type="text" placeholder="Ask your followers…" maxlength="100"
            style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:8px;color:var(--white);font-size:13px;margin-bottom:8px"/>
          <div id="pollOptionsContainer">
            <input class="pollOpt" type="text" placeholder="Option 1" style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:7px;color:var(--white);font-size:12px;margin-bottom:6px"/>
            <input class="pollOpt" type="text" placeholder="Option 2" style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:7px;color:var(--white);font-size:12px;margin-bottom:6px"/>
          </div>
          <button onclick="_addPollOption()" style="font-size:11px;color:var(--gold);background:none;border:none;cursor:pointer">+ Add option</button>
        </div>`;

      const submitBtn = form.querySelector('[onclick*="submitPost"]') || form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.before(pollSection);
      else form.appendChild(pollSection);
    }, 200);
  };
})();

window._togglePollSection = function() {
  const el = document.getElementById('pollSection');
  if (el) el.style.display = el.style.display==='none' ? 'block' : 'none';
};

window._addPollOption = function() {
  const cont = document.getElementById('pollOptionsContainer');
  if (!cont || cont.children.length >= 4) return;
  const inp = document.createElement('input');
  inp.type        = 'text';
  inp.className   = 'pollOpt';
  inp.placeholder = `Option ${cont.children.length+1}`;
  inp.style.cssText = 'width:100%;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:7px;color:var(--white);font-size:12px;margin-bottom:6px';
  cont.appendChild(inp);
};

window._getPollData = function() {
  const question = document.getElementById('pollQuestion')?.value?.trim();
  const options  = [...document.querySelectorAll('.pollOpt')].map(e=>e.value.trim()).filter(Boolean);
  if (!question || options.length < 2) return null;
  return { question, options };
};

/* ─────────────────────────────────────────────────────────────────────
   PATCH submitPost — include poll data
───────────────────────────────────────────────────────────────────── */
(function patchSubmitPost() {
  const orig = window.submitPost;
  if (typeof orig !== 'function') { setTimeout(patchSubmitPost, 600); return; }
  window.submitPost = function() {
    const poll = window._getPollData();
    if (poll) {
      // Attach poll to dmState / post state before submission
      window._pendingPostPoll = poll;
    }
    return orig.apply(this, arguments);
  };
})();

/* ─────────────────────────────────────────────────────────────────────
   PATCH saveStylePosts area to include poll + saves count
───────────────────────────────────────────────────────────────────── */
(function patchStylePostSave() {
  const orig = window.saveStylePosts;
  if (typeof orig !== 'function') { setTimeout(patchStylePostSave, 600); return; }
  window.saveStylePosts = function(posts) {
    // If a pending poll, attach to most recent post
    if (window._pendingPostPoll && posts.length) {
      posts[0].poll   = window._pendingPostPoll;
      posts[0].saves  = 0;
      posts[0].shares = 0;
      window._pendingPostPoll = null;
    }
    return orig.apply(this, arguments);
  };
})();

/* ─────────────────────────────────────────────────────────────────────
   TRENDING ALGORITHM — saves + shares + comments weighted
───────────────────────────────────────────────────────────────────── */
window.getTrendingPosts = function() {
  const posts = _soc.get('afrib_style_posts', []);
  return [...posts].map(p => {
    const likes    = _soc.get(`afrib_style_likes_${p.id}`, []).length;
    const comments = _soc.get(`afrib_style_comments_${p.id}`, []).length;
    const saves    = p.saves || 0;
    const shares   = p.shares || 0;
    const age      = (Date.now() - new Date(p.ts||0).getTime()) / 3600000; // hours
    // Weighted score — saves (3×) + shares (2×) + comments (1.5×) + likes (1×), decayed by age
    p._trendScore = (saves*3 + shares*2 + comments*1.5 + likes) / Math.max(1, Math.pow(age+1, 0.8));
    return p;
  }).sort((a,b) => (b._trendScore||0) - (a._trendScore||0));
};

/* ─────────────────────────────────────────────────────────────────────
   TRENDING tab data source patch
───────────────────────────────────────────────────────────────────── */
(function patchTrendingTab() {
  const orig = window.renderStyleFeed;
  if (typeof orig !== 'function') { setTimeout(patchTrendingTab, 600); return; }
  window.renderStyleFeed = function() {
    // Intercept when trending tab is active
    const activeTab = document.querySelector('.styleTab-trending, [id="styleTab-trending"]');
    const isTrending = activeTab?.classList.contains('active') ||
      activeTab?.style.background?.includes('rgba(212');

    if (!isTrending) return orig.apply(this, arguments);

    const trending = window.getTrendingPosts().slice(0, 20);
    const container = document.getElementById('styleFeed');
    if (!container) return;
    if (!trending.length) {
      container.innerHTML = '<div style="text-align:center;padding:48px;color:var(--w60)"><div style="font-size:48px;margin-bottom:12px">📈</div><div>No trending posts yet</div></div>';
      return;
    }
    container.innerHTML = trending.map(p => typeof window.renderPostCard === 'function' ? window.renderPostCard(p) : '').join('');
    if (!container.innerHTML.trim()) orig.apply(this, arguments);
  };
})();

console.log('[AfribSocial] GiftMe + Messages + Style upgrade loaded ✅ — 30 new gifts, gifter badges, AI replies, polls, notes, saves');
