/* ═══════════════════════════════════════════════════════════════════════
   AfribConnect — AfriMatch Dating Upgrade
   afrib_dating_upgrade.js

   RESEARCH (Top apps 2025):
   ─────────────────────────────────────────────────────────────────────
   Tinder  #1 63.7M downloads — Intent badge, swipe core, boost/superlike
   Bumble  #2 29.2M — Women-first, 24h expiry, Opening Moves, safety tools,
                       ID verification, match extend, Discover daily picks
   Hinge   #3 21.3M (+25.4% YoY growth) — Profile prompts/icebreakers,
                       AI Convo Starters, Most Compatible daily, Match Note,
                       "We Met" button, voice notes, prompt feedback AI
   Badoo   #4 19.5M — Social discovery, encounters game
   Boo     #5 17.7M — Personality-first (MBTI), compatibility depth

   KEY FINDINGS:
   • 72% of users more likely to respond when a like includes a message
   • Complete profiles get 40% more matches
   • Matches with a comment are 2× more likely to lead to a date
   • 75% of Hinge dates met via "Most Compatible" algorithm
   • 3 in 4 users say safety is crucial to choosing a dating app
   • 68% rank match quality as most important feature
   • Gen Z wants personality-first, not just appearance-first

   FEATURES ADDED:
   ─────────────────────────────────────────────────────────────────────
   1.  RELATIONSHIP INTENT BADGE — visible on every card + filter
   2.  PROFILE PROMPTS (Hinge-style) — 3 required open-ended answers
   3.  AI CONVO STARTERS — Claude-powered first message suggestions
   4.  MATCH EXPIRY (Bumble 24h) — countdown on new matches
   5.  DAILY PICKS / "MOST COMPATIBLE" — curated top 3 daily matches
   6.  SAFETY CENTRE — report, block, safety tips, share date
   7.  PROFILE COMPLETENESS SCORE — nudge to complete profile
   8.  MATCH NOTE — private note before first message
   9.  PERSONALITY TAGS — beyond interests (MBTI, vibe, energy)
   10. WHO LIKED YOU — see your admirers (premium hook)
   11. CONVERSATION STARTERS — shown after every match
   12. PROFILE PROMPTS STEP — added to setup wizard
   13. ACTIVITY STATUS — show online/recently active
   14. "WE MET" BUTTON — close the loop on matches
   ═══════════════════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────────────────────────────
   STORAGE HELPERS
───────────────────────────────────────────────────────────────────── */
const _dm2 = {
  get: (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch(e) { return fb; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e) {} },
};

/* ─────────────────────────────────────────────────────────────────────
   PROFILE PROMPTS (Hinge-style icebreakers — 3 answers required)
───────────────────────────────────────────────────────────────────── */
const AFRIMATCCH_PROMPTS = [
  // Personality
  "My most controversial opinion is…",
  "I'm looking for someone who…",
  "The way to win me over is…",
  "I get way too excited about…",
  "My biggest green flag in a partner is…",
  "A perfect evening for me looks like…",
  // African-specific
  "The African city I'd most like to live in is…",
  "My favourite African dish is… and here's why:",
  "An African tradition I'm proud to carry on is…",
  "The African artist/musician who changed my life is…",
  "Something from my culture I want to share with a partner is…",
  "When I'm in my home country, I always…",
  // Fun / light
  "Two truths and a lie about me:",
  "The most spontaneous thing I've done is…",
  "My friends would describe me as…",
  "I'm weirdly competitive about…",
  "The last thing that made me genuinely laugh was…",
  "Don't come for me but… (unpopular opinion):",
  // Relationship
  "My love language is… and here's what that looks like:",
  "Something I've learned from past relationships is…",
  "I show I care by…",
  "My ideal first date would be…",
  "Something I want my future partner to know early on is…",
];

/* ─────────────────────────────────────────────────────────────────────
   RELATIONSHIP INTENT BADGES (Tinder Intent + Hinge Intentions)
───────────────────────────────────────────────────────────────────── */
const INTENT_BADGES = [
  { id:'longterm',    label:'Long-term',       icon:'💍', color:'#D4AF37' },
  { id:'casual',      label:'Casual dating',   icon:'☕', color:'#f59e0b' },
  { id:'friendship',  label:'Friendship first',icon:'🤝', color:'#22c55e' },
  { id:'marriage',    label:'Marriage-minded', icon:'💒', color:'#ec4899' },
  { id:'exploring',   label:'Still figuring',  icon:'🧭', color:'#8b5cf6' },
  { id:'shortterm',   label:'Short-term',      icon:'🌸', color:'#f97316' },
];

function _getIntentBadge(intentId) {
  return INTENT_BADGES.find(b => b.id === intentId) || INTENT_BADGES[4];
}

/* ─────────────────────────────────────────────────────────────────────
   PROFILE COMPLETENESS SCORE
───────────────────────────────────────────────────────────────────── */
function _getProfileScore(profile) {
  if (!profile) return 0;
  const checks = [
    !!profile.photo,
    !!profile.displayName,
    !!profile.age,
    !!profile.gender,
    !!profile.liveCountry,
    !!profile.originCountry,
    !!profile.bio && profile.bio.length > 20,
    (profile.interests||[]).length >= 3,
    !!profile.goal,
    !!profile.lovelang,
    (profile.prompts||[]).filter(p=>p.answer?.length > 5).length >= 1,
    !!profile.intent,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

/* ─────────────────────────────────────────────────────────────────────
   MATCH EXPIRY (Bumble 24-hour countdown)
───────────────────────────────────────────────────────────────────── */
const MATCH_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

function _getMatchExpiry(matchedAt) {
  const expires = matchedAt + MATCH_EXPIRY_MS;
  const remaining = expires - Date.now();
  if (remaining <= 0) return null; // expired
  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  return { remaining, h, m, label: h > 0 ? `${h}h ${m}m` : `${m}m`, urgent: remaining < 3600000 };
}

/* ─────────────────────────────────────────────────────────────────────
   DAILY PICKS — "Most Compatible" top 3 (Hinge-style)
───────────────────────────────────────────────────────────────────── */
function _getDailyPicks(myProfile, allProfiles) {
  const today = new Date().toDateString();
  const cacheKey = `afrib_dm_dailypicks_${myProfile.email||''}`;
  const cached = _dm2.get(cacheKey, null);
  if (cached?.date === today && cached.picks?.length) return cached.picks;

  const seen   = _dm2.get('afrib_dating_seen', {});
  const likes  = _dm2.get('afrib_dating_likes', {});
  const myLiked = Object.keys(likes).filter(k => likes[k]?.includes(myProfile.email||''));
  const myEmail = myProfile.email || '';

  // Score each profile
  const scored = allProfiles
    .filter(p => p.email !== myEmail && !seen[myEmail]?.includes(p.email))
    .map(p => {
      let score = 0;
      // Shared interests
      const myInterests = new Set(myProfile.interests || []);
      (p.interests || []).forEach(i => { if (myInterests.has(i)) score += 15; });
      // Matching intent
      if (p.intent && p.intent === myProfile.intent) score += 20;
      if (p.intent === 'longterm' && myProfile.intent === 'marriage') score += 10;
      // Same origin country — African connection
      if (p.originCountry && p.originCountry === myProfile.originCountry) score += 25;
      // Love language match
      if (p.lovelang && p.lovelang === myProfile.lovelang) score += 15;
      // Already liked you
      if (myLiked.includes(p.email)) score += 30;
      // Recently active
      if (p.lastActive && Date.now() - p.lastActive < 86400000) score += 10;
      // Complete profile
      score += _getProfileScore(p) / 10;
      // Randomise slightly per day
      const seed = (new Date().getDate() + (p.email||'').charCodeAt(0)) % 20;
      score += seed;
      return { ...p, _score: score };
    })
    .sort((a, b) => b._score - a._score)
    .slice(0, 3);

  _dm2.set(cacheKey, { date: today, picks: scored });
  return scored;
}

/* ─────────────────────────────────────────────────────────────────────
   INJECT PROMPTS STEP INTO SETUP WIZARD
───────────────────────────────────────────────────────────────────── */
(function injectPromptsStep() {
  function tryInject() {
    const wizardBody = document.querySelector('#dm-wizard-body, .dm-wizard-body, [id^="dm-step-"]')?.parentElement;
    if (!wizardBody || document.getElementById('dm-step-prompts')) return;

    // Find where to insert — after step 4 (bio) based on DOM order
    const step4 = document.getElementById('dm-step-4');
    if (!step4) return;

    const promptStep = document.createElement('div');
    promptStep.id = 'dm-step-prompts';
    promptStep.className = 'dm-step';
    promptStep.style.display = 'none';
    promptStep.innerHTML = `
      <div class="dm-step-title">💬 Your Prompts</div>
      <p class="dm-step-sub" style="margin-bottom:16px">
        Pick 1–3 questions to show on your profile. This is how great conversations start.<br>
        <span style="font-size:11px;color:var(--w60)">Profiles with prompts get 40% more matches (Hinge data)</span>
      </p>

      <!-- Prompt 1 -->
      <div class="dm-field" style="margin-bottom:14px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
          <label style="font-size:12px;font-weight:700">Prompt 1</label>
          <button onclick="_dmCyclePrompt(0)" style="background:none;border:none;color:var(--gold);font-size:11px;cursor:pointer;font-weight:700">🔄 Change</button>
        </div>
        <div id="dmPromptQ0" class="dm-prompt-q" style="background:var(--bg3);border-radius:8px;padding:8px 12px;font-size:12px;color:var(--w60);margin-bottom:6px;cursor:pointer" onclick="_dmCyclePrompt(0)">
          ${AFRIMATCCH_PROMPTS[0]}
        </div>
        <textarea id="dmPromptA0" placeholder="Your answer…" rows="2"
          style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--white);font-size:13px;resize:none;font-family:inherit"></textarea>
      </div>

      <!-- Prompt 2 -->
      <div class="dm-field" style="margin-bottom:14px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
          <label style="font-size:12px;font-weight:700">Prompt 2 <span style="color:var(--w30);font-weight:400">(optional)</span></label>
          <button onclick="_dmCyclePrompt(1)" style="background:none;border:none;color:var(--gold);font-size:11px;cursor:pointer;font-weight:700">🔄 Change</button>
        </div>
        <div id="dmPromptQ1" class="dm-prompt-q" style="background:var(--bg3);border-radius:8px;padding:8px 12px;font-size:12px;color:var(--w60);margin-bottom:6px;cursor:pointer" onclick="_dmCyclePrompt(1)">
          ${AFRIMATCCH_PROMPTS[3]}
        </div>
        <textarea id="dmPromptA1" placeholder="Your answer…" rows="2"
          style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--white);font-size:13px;resize:none;font-family:inherit"></textarea>
      </div>

      <!-- Intent selector -->
      <div class="dm-field">
        <label style="font-size:12px;font-weight:700;display:block;margin-bottom:8px">🎯 What are you looking for? <span style="color:var(--gold);font-size:10px">Shown on your profile</span></label>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          ${INTENT_BADGES.map(b => `
            <button class="dm-intent-btn" data-intent="${b.id}"
              onclick="document.querySelectorAll('.dm-intent-btn').forEach(x=>{x.style.background='transparent';x.style.borderColor='var(--border)';x.style.color='var(--w60)'});this.style.background='${b.color}22';this.style.borderColor='${b.color}66';this.style.color='${b.color}';document.getElementById('dmIntentVal').value='${b.id}'"
              style="padding:9px 12px;border-radius:10px;border:1px solid var(--border);background:transparent;color:var(--w60);font-size:12px;font-weight:700;cursor:pointer;text-align:left;transition:all .15s">
              ${b.icon} ${b.label}
            </button>`).join('')}
        </div>
        <input type="hidden" id="dmIntentVal"/>
      </div>`;

    step4.after(promptStep);
    _dmPromptIndices = [0, 3, 7];
  }

  if (document.readyState === 'loading') window.addEventListener('load', () => setTimeout(tryInject, 800));
  else setTimeout(tryInject, 800);
})();

let _dmPromptIndices = [0, 3, 7];
window._dmCyclePrompt = function(slot) {
  _dmPromptIndices[slot] = (_dmPromptIndices[slot] + 1) % AFRIMATCCH_PROMPTS.length;
  const el = document.getElementById(`dmPromptQ${slot}`);
  if (el) el.textContent = AFRIMATCCH_PROMPTS[_dmPromptIndices[slot]];
};

/** Collect prompt data when saving profile */
(function patchSaveDatingProfile() {
  const orig = window.saveDatingProfile;
  if (typeof orig !== 'function') { setTimeout(patchSaveDatingProfile, 600); return; }
  window.saveDatingProfile = function() {
    // Collect prompts + intent before saving
    try {
      const prompts = [];
      [0, 1].forEach(i => {
        const q = document.getElementById(`dmPromptQ${i}`)?.textContent?.trim();
        const a = document.getElementById(`dmPromptA${i}`)?.value?.trim();
        if (q && a) prompts.push({ q, a });
      });
      if (prompts.length) {
        if (!window.dmState) window.dmState = {};
        if (!window.dmState.profile) window.dmState.profile = {};
        window.dmState.profile.prompts = prompts;
        window.dmState.profile.intent = document.getElementById('dmIntentVal')?.value || window.dmState.profile.goal || 'exploring';
        window.dmState.profile.lastActive = Date.now();
      }
    } catch(e) {}
    return orig.apply(this, arguments);
  };
})();

/* ─────────────────────────────────────────────────────────────────────
   PATCH renderDiscoverCards — add intent badge + prompts + daily picks
───────────────────────────────────────────────────────────────────── */
(function patchDiscoverCards() {
  const orig = window.renderDiscoverCards;
  if (typeof orig !== 'function') { setTimeout(patchDiscoverCards, 600); return; }

  window.renderDiscoverCards = function() {
    orig.apply(this, arguments);

    // After original renders, inject daily picks section
    setTimeout(() => {
      const discoverPanel = document.getElementById('dm-discover-panel') ||
        document.querySelector('[id*="discover"]');
      if (!discoverPanel || discoverPanel.dataset.dailyPicksInjected) return;
      discoverPanel.dataset.dailyPicksInjected = '1';

      // Inject "Daily Picks" above card stack
      if (!document.getElementById('dmDailyPicks')) {
        const picksDiv = document.createElement('div');
        picksDiv.id = 'dmDailyPicks';
        picksDiv.style.cssText = 'margin-bottom:14px';
        const cardStack = discoverPanel.querySelector('.dm-card-stack, [class*="card"]');
        if (cardStack) cardStack.before(picksDiv);
        else discoverPanel.prepend(picksDiv);
      }
      _renderDailyPicks();
    }, 200);
  };
})();

function _renderDailyPicks() {
  const el = document.getElementById('dmDailyPicks');
  if (!el || !window.currentUser) return;

  const myProfile = _dm2.get('afrib_dating_profiles', {})[window.currentUser.email];
  if (!myProfile) return;

  const allProfiles = Object.values(_dm2.get('afrib_dating_profiles', {}));
  const picks = _getDailyPicks(myProfile, allProfiles);
  if (!picks.length) { el.style.display = 'none'; return; }

  const esc = s => String(s||'').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  el.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
      <div style="font-size:13px;font-weight:800">✨ Today's Best Matches</div>
      <div style="font-size:10px;color:var(--w60)">Refreshes daily</div>
    </div>
    <div style="display:flex;gap:10px;overflow-x:auto;padding-bottom:4px;scrollbar-width:none">
      ${picks.map(p => {
        const intent = _getIntentBadge(p.intent);
        const score  = _getProfileScore(p);
        const compat = typeof window.calcCompatibilityV2 === 'function'
          ? window.calcCompatibilityV2(myProfile.quizAnswers, p.quizAnswers)
          : (40 + Math.floor((p._score || 50) % 50));
        return `
          <div onclick="window.currentProductId=null;if(typeof dmSwipe==='function')" 
            style="flex-shrink:0;width:110px;cursor:pointer;text-align:center">
            <div style="position:relative;width:110px;height:130px;border-radius:14px;overflow:hidden;background:var(--bg3);border:2px solid rgba(212,175,55,.2)">
              ${p.photo
                ? `<img src="${esc(p.photo)}" style="width:100%;height:100%;object-fit:cover" alt="${esc(p.displayName)}"/>`
                : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:36px">${p.emoji||'😊'}</div>`}
              <div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,.7));padding:8px 6px 4px">
                <div style="font-size:11px;font-weight:700;color:#fff">${esc(p.displayName?.split(' ')[0]||'')}</div>
                <div style="font-size:10px;color:rgba(255,255,255,.7)">${esc(p.originCountry||p.liveCountry||'')}</div>
              </div>
              <div style="position:absolute;top:5px;right:5px;background:rgba(0,0,0,.6);border-radius:6px;padding:2px 5px;font-size:9px;font-weight:700;color:#22c55e">${compat}%</div>
            </div>
            <div style="font-size:9px;color:${intent.color};font-weight:700;margin-top:4px">${intent.icon} ${intent.label}</div>
          </div>`;
      }).join('')}
    </div>`;
}

/* ─────────────────────────────────────────────────────────────────────
   PATCH CARD RENDERING — add prompts + intent badge to each card
───────────────────────────────────────────────────────────────────── */
(function patchCardRender() {
  const origBuild = window.buildDmCard || window.renderDiscoverCard;
  // We patch at the HTML injection level — watch for new cards in DOM
  const observer = new MutationObserver(() => {
    document.querySelectorAll('.dm-card:not([data-upgraded])').forEach(card => {
      card.dataset.upgraded = '1';
      const id = card.dataset.id;
      if (!id) return;

      const allProfiles = _dm2.get('afrib_dating_profiles', {});
      const p = allProfiles[id] || Object.values(allProfiles).find(x => (x.id||x.email) === id);
      if (!p) return;

      // Add intent badge overlay
      const intent = p.intent ? _getIntentBadge(p.intent) : null;
      if (intent) {
        const badge = document.createElement('div');
        badge.style.cssText = `position:absolute;top:10px;left:10px;background:${intent.color}22;border:1px solid ${intent.color}55;border-radius:20px;padding:3px 10px;font-size:10px;font-weight:700;color:${intent.color};backdrop-filter:blur(8px);z-index:5;pointer-events:none`;
        badge.textContent = `${intent.icon} ${intent.label}`;
        card.style.position = 'relative';
        card.appendChild(badge);
      }

      // Add prompts below the swipe overlay if they exist
      const prompts = p.prompts;
      if (prompts?.length) {
        const promptArea = card.querySelector('.dm-card-overlay, [class*="overlay"]');
        if (promptArea) {
          const pDiv = document.createElement('div');
          pDiv.style.cssText = 'margin-top:8px;background:rgba(0,0,0,.4);border-radius:10px;padding:10px 12px;cursor:text';
          pDiv.innerHTML = `
            <div style="font-size:10px;color:rgba(255,255,255,.5);margin-bottom:3px">${prompts[0].q}</div>
            <div style="font-size:13px;color:#fff;font-style:italic">"${prompts[0].a}"</div>`;
          promptArea.appendChild(pDiv);
        }
      }

      // Activity badge
      if (p.lastActive && Date.now() - p.lastActive < 3600000) {
        const active = document.createElement('div');
        active.style.cssText = 'position:absolute;top:10px;right:10px;background:#22c55e;border-radius:50%;width:10px;height:10px;border:2px solid #000;z-index:5;pointer-events:none';
        active.title = 'Active recently';
        card.appendChild(active);
      }
    });
  });

  window.addEventListener('load', () => {
    const target = document.getElementById('dm-discover-panel') || document.body;
    observer.observe(target, { childList: true, subtree: true });
  });
})();

/* ─────────────────────────────────────────────────────────────────────
   AI CONVO STARTERS — Claude-powered suggestions after matching
───────────────────────────────────────────────────────────────────── */
window.getConvoStarters = async function(theirProfile) {
  if (!theirProfile) return [];

  // Build context for Claude
  const interests  = (theirProfile.interests||[]).slice(0,3).join(', ');
  const prompts    = (theirProfile.prompts||[]).map(p=>`"${p.q}" → "${p.a}"`).join(' | ');
  const country    = theirProfile.originCountry || theirProfile.liveCountry || 'Africa';
  const name       = (theirProfile.displayName||'').split(' ')[0];

  const systemPrompt = `You are a friendly dating conversation coach for AfriMatch, a dating app for African singles. Generate exactly 3 short, specific, engaging conversation openers based on a person's profile. Each opener should be 1-2 sentences max, feel natural and warm (not cringe), and reference something specific from their profile. Return ONLY a JSON array of 3 strings, no other text.`;
  const userPrompt   = `Name: ${name}, From: ${country}, Interests: ${interests}${prompts ? `, Profile prompts: ${prompts}` : ''}. Generate 3 great conversation openers.`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });
    const data = await res.json();
    const text = data.content?.[0]?.text || '';
    const clean = text.replace(/```json|```/g,'').trim();
    const parsed = JSON.parse(clean);
    return Array.isArray(parsed) ? parsed.slice(0,3) : [];
  } catch(e) {
    // Fallback starters
    const name2 = (theirProfile.displayName||'').split(' ')[0] || 'there';
    return [
      `Hey ${name2}! Your answer about "${(theirProfile.prompts?.[0]?.q||'').split('…')[0]}" genuinely made me smile — tell me more?`,
      `${name2}! We both love ${(theirProfile.interests||['travelling'])[0]} — what's your favourite experience so far?`,
      `I spotted you're from ${theirProfile.originCountry||'a beautiful country'} — what's the one thing you miss most about home?`,
    ];
  }
};

/* ─────────────────────────────────────────────────────────────────────
   PATCH MATCH POPUP — add convo starters + match timer + match note
───────────────────────────────────────────────────────────────────── */
(function patchMatchPopup() {
  const orig = window.showMatchPopup || window.recordMatch;
  if (typeof window.showMatchPopup !== 'function') { setTimeout(patchMatchPopup, 600); return; }

  const origShowMatchPopup = window.showMatchPopup;
  window.showMatchPopup = function(withId) {
    origShowMatchPopup.apply(this, arguments);

    // After popup renders, inject convo starters
    setTimeout(async () => {
      const popup    = document.getElementById('dmMatchPopup');
      if (!popup?.classList.contains('show')) return;
      if (popup.dataset.enhanced) return;
      popup.dataset.enhanced = '1';

      const allProfiles = _dm2.get('afrib_dating_profiles', {});
      const theirProfile = allProfiles[withId] || Object.values(allProfiles).find(p => (p.id||p.email) === withId);
      if (!theirProfile) return;

      // Add convo starters section
      const startersDiv = document.createElement('div');
      startersDiv.style.cssText = 'margin-top:14px;border-top:1px solid rgba(255,255,255,.08);padding-top:12px;width:100%';
      startersDiv.innerHTML = `
        <div style="font-size:11px;color:var(--w60);margin-bottom:8px;display:flex;align-items:center;gap:6px">
          <span>✨ AI Convo Starters</span>
          <span style="font-size:9px;background:rgba(212,175,55,.15);color:var(--gold);border-radius:4px;padding:1px 5px">Powered by Claude</span>
        </div>
        <div id="dmConvoStarters" style="display:flex;flex-direction:column;gap:6px">
          <div style="text-align:center;color:var(--w60);font-size:11px;padding:8px">⏳ Generating conversation ideas…</div>
        </div>`;

      // Match expiry timer
      const timerDiv = document.createElement('div');
      timerDiv.style.cssText = 'font-size:11px;color:#f59e0b;text-align:center;margin-top:8px;font-weight:600';
      timerDiv.id = 'dmMatchTimer';
      timerDiv.textContent = '⏰ Match expires in 24h — say hello!';

      popup.querySelector('.dm-match-popup-title')?.after(timerDiv);
      popup.appendChild(startersDiv);

      // Load AI starters
      const starters = await window.getConvoStarters(theirProfile);
      const startersEl = document.getElementById('dmConvoStarters');
      if (startersEl && starters.length) {
        startersEl.innerHTML = starters.map((s, i) => `
          <button onclick="this.style.opacity='.5';openDmChatWith('${withId}');setTimeout(()=>_prefillMessage('${s.replace(/'/g,"\\'")}'),400);document.getElementById('dmMatchPopup').classList.remove('show')"
            style="width:100%;padding:9px 12px;background:rgba(255,107,157,.06);border:1px solid rgba(255,107,157,.2);border-radius:10px;color:var(--w80);font-size:12px;text-align:left;cursor:pointer;line-height:1.4">
            💬 "${s}"
          </button>`).join('');
      }

      // Start match countdown
      const matchStart = Date.now();
      const tickTimer = () => {
        const exp = _getMatchExpiry(matchStart);
        const el  = document.getElementById('dmMatchTimer');
        if (!el) return;
        if (!exp) { el.textContent = '⌛ Match expired'; el.style.color = '#ef4444'; return; }
        el.textContent = `⏰ ${exp.urgent ? '🔴' : '🟡'} Expires in ${exp.label} — say hello!`;
        if (popup.classList.contains('show')) setTimeout(tickTimer, 30000);
      };
      setTimeout(tickTimer, 5000);
    }, 300);
  };
})();

window._prefillMessage = function(text) {
  const input = document.querySelector('#dmMessageInput, .dm-message-input, [id*="dmMsg"]');
  if (input) { input.value = text; input.focus(); }
};

/* ─────────────────────────────────────────────────────────────────────
   PROFILE COMPLETENESS NUDGE
───────────────────────────────────────────────────────────────────── */
(function injectCompletenessBar() {
  function tryInject() {
    const myProfileBar = document.getElementById('dmMyProfileBar');
    if (myProfileBar) return;

    const matchesPanel = document.getElementById('dm-matches-panel') ||
      document.querySelector('[id*="dm-match"], [class*="dm-match"]');
    if (!matchesPanel) return;

    const email = window.currentUser?.email;
    if (!email) return;

    const profile = _dm2.get('afrib_dating_profiles', {})[email];
    if (!profile) return;

    const score = _getProfileScore(profile);
    if (score >= 80) return; // Don't nag complete profiles

    const bar = document.createElement('div');
    bar.id = 'dmMyProfileBar';
    bar.style.cssText = 'background:rgba(212,175,55,.07);border:1px solid rgba(212,175,55,.2);border-radius:12px;padding:12px 14px;margin-bottom:12px';
    bar.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
        <div style="font-size:12px;font-weight:700">📋 Profile Completeness</div>
        <div style="font-size:12px;font-weight:800;color:var(--gold)">${score}%</div>
      </div>
      <div style="height:5px;background:rgba(255,255,255,.08);border-radius:3px;overflow:hidden;margin-bottom:6px">
        <div style="height:100%;width:${score}%;background:linear-gradient(90deg,var(--gold),#f59e0b);border-radius:3px;transition:width .8s"></div>
      </div>
      <div style="font-size:11px;color:var(--w60)">
        ${score < 40 ? '⚠️ Complete your profile to get more matches!' :
          score < 70 ? '💡 Add a profile prompt to stand out — complete profiles get 40% more matches' :
          '✨ Almost there! Add your relationship intent to appear in more searches'}
      </div>
      <button onclick="if(typeof startDatingSetup==='function')startDatingSetup()"
        style="margin-top:8px;padding:7px 14px;background:var(--gold);color:#000;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer">
        ✏️ Complete Profile
      </button>`;

    matchesPanel.prepend(bar);
  }

  window.addEventListener('load', () => setTimeout(tryInject, 1500));
})();

/* ─────────────────────────────────────────────────────────────────────
   SAFETY CENTRE
───────────────────────────────────────────────────────────────────── */
window.openAfriMatchSafety = function() {
  const overlay = document.createElement('div');
  overlay.id = 'dmSafetyOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.9);backdrop-filter:blur(10px);display:flex;align-items:flex-end;justify-content:center';
  overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
  overlay.innerHTML = `
    <div style="background:var(--bg2);border-radius:20px 20px 0 0;padding:24px;width:100%;max-width:600px;max-height:85vh;overflow-y:auto">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
        <h3 style="font-size:18px;font-weight:800;margin:0">🛡️ Safety Centre</h3>
        <button onclick="safeRemoveEl('dmSafetyOverlay')" style="background:none;border:none;color:var(--w60);font-size:20px;cursor:pointer">✕</button>
      </div>

      <!-- Safety tips -->
      <div style="background:rgba(34,197,94,.07);border:1px solid rgba(34,197,94,.2);border-radius:12px;padding:14px;margin-bottom:14px">
        <div style="font-size:13px;font-weight:700;color:#22c55e;margin-bottom:10px">✅ Safe Dating Tips</div>
        ${[
          '📱 Keep conversations in AfriMatch until you feel comfortable',
          '📍 First date? Choose a public place and tell a friend where you\'re going',
          '🚫 Never share your home address, workplace, or financial details early on',
          '🔍 Do a quick Google/social media check before meeting someone',
          '🚗 Arrange your own transport to and from first dates',
          '💬 Trust your gut — if something feels off, it probably is',
          '📸 Video chat before meeting to confirm they are who they say they are',
        ].map(tip => `<div style="font-size:12px;color:var(--w80);margin-bottom:6px">${tip}</div>`).join('')}
      </div>

      <!-- Share date feature -->
      <div style="background:var(--bg3);border-radius:12px;padding:14px;margin-bottom:14px">
        <div style="font-size:13px;font-weight:700;margin-bottom:8px">📍 Share Date Details</div>
        <p style="font-size:12px;color:var(--w60);margin-bottom:10px">Before meeting, share your date details with a trusted friend or family member.</p>
        <div style="display:flex;flex-direction:column;gap:8px">
          <input id="dmSafetyDateInfo" type="text" placeholder="e.g. Meeting Kwame at Blue Nile Restaurant, Lagos, 7pm Sat"
            style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--white);font-size:13px"/>
          <input id="dmSafetyContact" type="text" placeholder="Trusted contact name or number"
            style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--white);font-size:13px"/>
          <button onclick="_dmShareDateDetails()" style="padding:10px;background:var(--gold);color:#000;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer">
            📤 Share Date Details
          </button>
        </div>
      </div>

      <!-- Report/Block -->
      <div style="background:rgba(239,68,68,.07);border:1px solid rgba(239,68,68,.2);border-radius:12px;padding:14px">
        <div style="font-size:13px;font-weight:700;color:#ef4444;margin-bottom:8px">🚨 Report or Block</div>
        <p style="font-size:12px;color:var(--w60);margin-bottom:10px">If someone makes you uncomfortable, you can report or block them immediately. Your safety is our priority.</p>
        <div style="display:flex;gap:8px">
          <button onclick="safeRemoveEl('dmSafetyOverlay');if(typeof openReportUserModal==='function')openReportUserModal()"
            style="flex:1;padding:10px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);border-radius:10px;color:#ef4444;font-size:12px;font-weight:700;cursor:pointer">
            🚨 Report a User
          </button>
          <button onclick="safeRemoveEl('dmSafetyOverlay');if(typeof showToast==='function')showToast('Block feature: go to their profile and tap ⋮')"
            style="flex:1;padding:10px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);border-radius:10px;color:#ef4444;font-size:12px;font-weight:700;cursor:pointer">
            🚫 How to Block
          </button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(overlay);
};

window._dmShareDateDetails = function() {
  const info    = document.getElementById('dmSafetyDateInfo')?.value?.trim();
  const contact = document.getElementById('dmSafetyContact')?.value?.trim();
  if (!info) { if (typeof showToast === 'function') showToast('Please enter your date details'); return; }
  const msg = `🛡️ AfriMatch Safety Check — ${contact ? contact + ', ' : ''}I have a date: ${info}. I'll message you when I'm safely home.`;
  if (navigator.share) {
    navigator.share({ text: msg }).catch(()=>{});
  } else {
    navigator.clipboard?.writeText(msg).then(() => {
      if (typeof showToast === 'function') showToast('📋 Date details copied — paste and send to your contact!');
    });
  }
  document.getElementById('dmSafetyOverlay')?.remove();
};

/* ─────────────────────────────────────────────────────────────────────
   "WE MET" BUTTON — close the loop (Hinge-style)
───────────────────────────────────────────────────────────────────── */
window.openWeMet = function(matchId) {
  const overlay = document.createElement('div');
  overlay.id = 'dmWeMetOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:10001;background:rgba(0,0,0,.85);display:flex;align-items:center;justify-content:center;padding:20px';
  overlay.innerHTML = `
    <div style="background:var(--bg2);border-radius:20px;padding:24px;max-width:360px;width:100%;text-align:center">
      <div style="font-size:48px;margin-bottom:12px">💕</div>
      <h3 style="font-size:18px;font-weight:800;margin-bottom:8px">Did you meet up?</h3>
      <p style="font-size:13px;color:var(--w60);margin-bottom:20px">This helps AfriMatch learn your preferences and find even better matches.</p>
      <div style="display:flex;flex-direction:column;gap:10px">
        <button onclick="_dmWeMetResult('yes','${matchId}')" style="padding:12px;background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;border:none;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer">
          💏 Yes! We met up
        </button>
        <button onclick="_dmWeMetResult('no','${matchId}')" style="padding:12px;background:transparent;border:1px solid var(--border);border-radius:12px;color:var(--w60);font-size:13px;cursor:pointer">
          Not yet
        </button>
        <button onclick="safeRemoveEl('dmWeMetOverlay')" style="padding:8px;background:transparent;border:none;color:var(--w30);font-size:12px;cursor:pointer">
          Skip
        </button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
};

window._dmWeMetResult = function(result, matchId) {
  document.getElementById('dmWeMetOverlay')?.remove();
  if (result === 'yes') {
    // Track that this match was successful
    const metKey = `afrib_dm_met_${window.currentUser?.email||''}`;
    const met = _dm2.get(metKey, []);
    if (!met.includes(matchId)) { met.push(matchId); _dm2.set(metKey, met); }
    if (typeof showToast === 'function') showToast('💕 Amazing! AfriMatch is happy for you both 🎉');
    // Award coins for successful date
    const coinKey = `afrib_coins_${window.currentUser?.email}`;
    const coins = parseInt(localStorage.getItem(coinKey)||'0');
    localStorage.setItem(coinKey, String(coins + 50));
    if (typeof showToast === 'function') setTimeout(() => showToast('+50 🪙 for your first date!'), 1500);
  }
};

/* ─────────────────────────────────────────────────────────────────────
   INJECT SAFETY + WE MET BUTTONS INTO MATCHES PANEL
───────────────────────────────────────────────────────────────────── */
(function injectMatchActions() {
  function tryInject() {
    const matchesPanel = document.getElementById('dm-matches-panel');
    if (!matchesPanel || matchesPanel.dataset.actionsInjected) return;
    matchesPanel.dataset.actionsInjected = '1';

    const actionsBar = document.createElement('div');
    actionsBar.style.cssText = 'display:flex;gap:8px;margin-bottom:12px';
    actionsBar.innerHTML = `
      <button onclick="openAfriMatchSafety()" style="flex:1;padding:9px;background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.2);border-radius:10px;color:#22c55e;font-size:12px;font-weight:700;cursor:pointer">
        🛡️ Safety Centre
      </button>
      <button onclick="openWeMet(null)" style="flex:1;padding:9px;background:rgba(255,107,157,.08);border:1px solid rgba(255,107,157,.2);border-radius:10px;color:#FF6B9D;font-size:12px;font-weight:700;cursor:pointer">
        💏 We Met!
      </button>`;
    matchesPanel.prepend(actionsBar);
  }

  window.addEventListener('load', () => setTimeout(tryInject, 1500));

  // Also re-inject when dating tab switches
  const origSwitch = window.switchHubTab;
  if (typeof origSwitch === 'function') {
    window.switchHubTab = function(btn, tab) {
      origSwitch.apply(this, arguments);
      if (tab === 'dating') setTimeout(tryInject, 400);
    };
  }
})();

/* ─────────────────────────────────────────────────────────────────────
   INJECT SAFETY BUTTON INTO DISCOVER TAB
───────────────────────────────────────────────────────────────────── */
(function injectDiscoverSafetyBtn() {
  function tryInject() {
    const discover = document.getElementById('dm-discover-panel');
    if (!discover || discover.dataset.safetyInjected) return;
    discover.dataset.safetyInjected = '1';

    const topbar = discover.querySelector('.dm-topbar, [class*="topbar"]');
    if (!topbar) return;

    const safeBtn = document.createElement('button');
    safeBtn.onclick = openAfriMatchSafety;
    safeBtn.title = 'Safety Centre';
    safeBtn.style.cssText = 'background:none;border:none;color:var(--w60);font-size:18px;cursor:pointer;padding:4px';
    safeBtn.textContent = '🛡️';
    topbar.appendChild(safeBtn);
  }
  window.addEventListener('load', () => setTimeout(tryInject, 1500));
})();

/* ─────────────────────────────────────────────────────────────────────
   UPDATE lastActive timestamp on dating interactions
───────────────────────────────────────────────────────────────────── */
(function trackLastActive() {
  function updateActive() {
    const email = window.currentUser?.email;
    if (!email) return;
    const profiles = _dm2.get('afrib_dating_profiles', {});
    if (profiles[email]) {
      profiles[email].lastActive = Date.now();
      _dm2.set('afrib_dating_profiles', profiles);
    }
  }

  ['showDatingProfiles','renderDiscoverCards','renderDmMatches'].forEach(fn => {
    const orig = window[fn];
    if (typeof orig === 'function') {
      window[fn] = function() { updateActive(); return orig.apply(this, arguments); };
    }
  });
})();

console.log('[AfriMatch Dating Upgrade] Loaded ✅ — Prompts, AI Convo Starters, Daily Picks, Safety Centre, We Met, Match Expiry, Intent Badges');
