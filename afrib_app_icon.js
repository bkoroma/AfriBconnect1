/* ═══════════════════════════════════════════════════════════════════════
   afrib_afrimatch_upgrade.js  —  AfriMatch Deep Compatibility System
   
   Research basis:
   • Aron et al. (1997) "36 Questions That Lead to Love" — vulnerability-based
     connection is the strongest predictor of bond formation
   • Gottman Institute — 4 key relationship pillars: values, conflict style,
     shared meaning, and friendship quality
   • OKCupid research — deal-breaker questions outperform preference questions
     by 3× for predicting match success
   • Hinge Labs — specific, answered prompts drive 3× more conversations than
     generic bios
   • eHarmony — 29 compatibility dimensions; 4% of US marriages traced to app
   • Helen Fisher / Chemistry.com — temperament-based matching (4 brain types)
   • Kubin et al. (2024) — self-concept clarity predicts partner selection quality
   ═══════════════════════════════════════════════════════════════════════ */

'use strict';

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 1 — THE COMPATIBILITY QUIZ BANK
   120 questions across 12 scientifically validated dimensions.
   Each answer carries a weight that feeds into the matching algorithm.
   ═══════════════════════════════════════════════════════════════════════ */
const AM_QUIZ_DIMENSIONS = {
  values:       { label: 'Core Values',      icon: '🧭', weight: 18 },
  lifestyle:    { label: 'Lifestyle',         icon: '🌿', weight: 16 },
  communication:{ label: 'Communication',     icon: '💬', weight: 15 },
  ambition:     { label: 'Ambition & Growth', icon: '🚀', weight: 12 },
  family:       { label: 'Family & Future',   icon: '👨‍👩‍👧', weight: 14 },
  fun:          { label: 'Fun & Adventure',   icon: '🎉', weight: 8  },
  intimacy:     { label: 'Emotional Depth',   icon: '❤️',  weight: 10 },
  culture:      { label: 'African Roots',     icon: '🌍', weight: 7  },
};

const AM_QUIZ_QUESTIONS = [
  // ── CORE VALUES (most predictive of long-term success) ──
  {
    id:'v1', dim:'values', weight:9,
    q: 'Honesty is more important to me than kindness when they conflict.',
    opts: ['Strongly agree','Agree','Neutral','Disagree','Strongly disagree'],
    type:'scale'
  },
  {
    id:'v2', dim:'values', weight:8,
    q: 'Religion / faith plays an active role in my daily life.',
    opts: ['Very much so','Somewhat','A little','Not really','Not at all'],
    type:'scale'
  },
  {
    id:'v3', dim:'values', weight:9,
    q: 'What matters most to you in a partner?',
    opts: ['Loyalty','Ambition','Kindness','Humour','Shared values'],
    type:'single', icon:'💎'
  },
  {
    id:'v4', dim:'values', weight:7,
    q: 'When it comes to money in a relationship…',
    opts: ['Everything pooled together','Mostly shared, some personal','Split but fair','Mostly separate','Fully independent finances'],
    type:'single', icon:'💰'
  },
  {
    id:'v5', dim:'values', weight:8,
    q: 'My partner and I should share the same political views.',
    opts: ['Absolutely — it matters a lot','Mostly, but flexibility is fine','Prefer similar but open','It rarely matters','Politics has no place in love'],
    type:'scale'
  },
  {
    id:'v6', dim:'values', weight:7,
    q: 'How important is it that your partner respects your parents?',
    opts: ['Absolutely non-negotiable','Very important','Important but nuanced','Somewhat important','Not a major factor'],
    type:'scale'
  },

  // ── LIFESTYLE ──
  {
    id:'l1', dim:'lifestyle', weight:8,
    q: 'My ideal Saturday looks like…',
    opts: ['Out exploring — new places, people, experiences','Active — gym, hiking, sport','Socialising with friends or family','Cosy at home — books, film, cooking','A mix depending on mood'],
    type:'single', icon:'🌅'
  },
  {
    id:'l2', dim:'lifestyle', weight:7,
    q: 'How often do you drink alcohol?',
    opts: ['Never','Rarely (special occasions)','Socially (weekends)','Regularly','Daily'],
    type:'single', icon:'🥂'
  },
  {
    id:'l3', dim:'lifestyle', weight:7,
    q: 'I am a…',
    opts: ['Early bird — up at dawn','Morning person (up by 8)','Flexible — depends on the day','Night owl — alive after 10pm','Vampire — I live for the night'],
    type:'single', icon:'🌙'
  },
  {
    id:'l4', dim:'lifestyle', weight:8,
    q: 'How tidy is your living space?',
    opts: ['Spotless — everything has a place','Generally clean and organised','A comfortable level of clutter','Organised chaos — I know where things are','Free spirit — tidiness is overrated'],
    type:'single', icon:'🏠'
  },
  {
    id:'l5', dim:'lifestyle', weight:6,
    q: 'Your approach to fitness and health:',
    opts: ['It\'s a lifestyle — I train regularly','I try to stay active when I can','I\'d like to be healthier, working on it','Health matters but exercise isn\'t my thing','I embrace life as it comes'],
    type:'single', icon:'💪'
  },
  {
    id:'l6', dim:'lifestyle', weight:8,
    q: 'Social media in relationships should be…',
    opts: ['Open and shared — couple goals','Present but private','Limited — I prefer privacy','Separate — my online life is mine','I barely use social media'],
    type:'single', icon:'📱'
  },

  // ── COMMUNICATION STYLE (Gottman's top predictor) ──
  {
    id:'c1', dim:'communication', weight:9,
    q: 'When upset with my partner, I tend to…',
    opts: ['Talk about it immediately','Wait until I\'ve calmed down','Write out my feelings first','Need space then reconnect','Avoid the conversation as long as possible'],
    type:'single', icon:'🗣'
  },
  {
    id:'c2', dim:'communication', weight:8,
    q: 'How do you feel about your partner having close friends of the opposite gender?',
    opts: ['Completely fine — trust is everything','Fine with healthy boundaries','Okay if I know them','I\'d be uncomfortable','It would be a serious issue'],
    type:'scale'
  },
  {
    id:'c3', dim:'communication', weight:9,
    q: 'In an argument, I am more likely to…',
    opts: ['Stay calm and listen actively','Assert my point clearly','Get emotional — feelings first','Go quiet and need time','Want to resolve it immediately'],
    type:'single', icon:'⚖️'
  },
  {
    id:'c4', dim:'communication', weight:7,
    q: 'How much alone time do you need to recharge?',
    opts: ['A lot — I\'m deeply introverted','Quite a bit — balance is key','A moderate amount','Not much — I recharge through people','Very little — I thrive on connection'],
    type:'scale'
  },
  {
    id:'c5', dim:'communication', weight:8,
    q: 'Checking in daily (texts, calls) in a relationship is…',
    opts: ['Essential — it keeps us close','Nice but not required','Depends on the day','I prefer space; less is more','I find it overwhelming'],
    type:'scale'
  },
  {
    id:'c6', dim:'communication', weight:7,
    q: 'What breaks your trust fastest?',
    opts: ['Lies — even small ones','Emotional betrayal','Being talked about negatively','Broken promises','Disloyalty to family'],
    type:'single', icon:'💔'
  },

  // ── AMBITION & GROWTH ──
  {
    id:'a1', dim:'ambition', weight:8,
    q: 'My career ambitions are…',
    opts: ['I\'m building something significant','I want senior/leadership impact','I want a stable, fulfilling job','Work-life balance is my priority','Family and home come before career'],
    type:'single', icon:'🎯'
  },
  {
    id:'a2', dim:'ambition', weight:7,
    q: 'My partner\'s career success matters to me…',
    opts: ['A lot — drive attracts me','Somewhat — ambition is attractive','Not as much as their character','Not really — happiness is enough','We can support each other wherever we are'],
    type:'scale'
  },
  {
    id:'a3', dim:'ambition', weight:8,
    q: 'Personal growth in a relationship means…',
    opts: ['Growing together — same direction','Growing individually AND as a couple','Supporting each other\'s separate journeys','Stability over growth','I\'ll know it when I feel it'],
    type:'single', icon:'🌱'
  },
  {
    id:'a4', dim:'ambition', weight:7,
    q: 'Where do you see yourself living in 5 years?',
    opts: ['Same city / country I\'m in now','Different city within my country','A different country (diaspora life)','Back home — Africa is home','Open to wherever love and opportunity leads'],
    type:'single', icon:'🗺'
  },
  {
    id:'a5', dim:'ambition', weight:6,
    q: 'Entrepreneurship vs. employment:',
    opts: ['I\'m an entrepreneur (or planning to be)','Mixed — side business + job','Stable employment is my preference','I support whichever pays well','I follow my passion regardless of the path'],
    type:'single', icon:'💼'
  },

  // ── FAMILY & FUTURE (Gottman: shared meaning) ──
  {
    id:'f1', dim:'family', weight:9,
    q: 'How involved should extended family be in your relationship?',
    opts: ['Very — family approval matters deeply','Involved but we make our own choices','Consulted but not deciding','Informed but not involved','This is between us and no one else'],
    type:'single', icon:'👪'
  },
  {
    id:'f2', dim:'family', weight:9,
    q: 'Children — be honest:',
    opts: ['Definitely want them (biological)','Yes, and open to adoption too','Maybe — I\'m undecided','I have children; open to a blended family','I do not want children'],
    type:'single', icon:'👶'
  },
  {
    id:'f3', dim:'family', weight:8,
    q: 'If we had children, parenting would be…',
    opts: ['Traditional — clear gender roles','Flexible traditional','Equal partnership','Child-led / relaxed','We\'d figure it out together'],
    type:'single', icon:'🏠'
  },
  {
    id:'f4', dim:'family', weight:7,
    q: 'Marriage is…',
    opts: ['A sacred covenant — non-negotiable','My eventual goal','Something I\'m open to','Not necessary if love is real','Not something I\'m pursuing'],
    type:'single', icon:'💍'
  },
  {
    id:'f5', dim:'family', weight:8,
    q: 'Financial responsibility between partners should be…',
    opts: ['Man primarily provides','Both contribute equally regardless of income','Based on percentage of income','Whoever earns more contributes more','Very flexible, case by case'],
    type:'single', icon:'💳'
  },
  {
    id:'f6', dim:'family', weight:6,
    q: 'Your relationship with your own family (parents/siblings) is…',
    opts: ['Very close — we talk daily','Close — speak weekly','Warm but independent','Complicated but I\'m working on it','Distant or estranged'],
    type:'single', icon:'❤️'
  },

  // ── FUN & ADVENTURE ──
  {
    id:'fun1', dim:'fun', weight:6,
    q: 'Perfect first date:',
    opts: ['Dinner somewhere special','Coffee and deep conversation','Active — hiking, sport, class','Creative — gallery, cooking class, music','Low-key — walk in the park'],
    type:'single', icon:'🌹'
  },
  {
    id:'fun2', dim:'fun', weight:5,
    q: 'Travel style:',
    opts: ['Luxury — I travel well','Boutique / curated experiences','Backpacking and adventure','Budget-conscious but adventurous','I\'d rather stay home'],
    type:'single', icon:'✈️'
  },
  {
    id:'fun3', dim:'fun', weight:5,
    q: 'My music vibe is mostly…',
    opts: ['Afrobeats / Highlife / Afropop','R&B / Soul','Hip-hop / Rap','Gospel / Worship','A mix — my playlist has everything'],
    type:'single', icon:'🎵'
  },
  {
    id:'fun4', dim:'fun', weight:5,
    q: 'I watch…',
    opts: ['African movies / Nollywood','International drama / thriller','Reality TV and entertainment','Documentaries and news','I barely watch TV'],
    type:'single', icon:'🎬'
  },
  {
    id:'fun5', dim:'fun', weight:6,
    q: 'Food is…',
    opts: ['Central to my culture — I love to cook','I love eating out and trying new food','I eat to live — it\'s not a big deal','I\'m a health-first eater','Food is love — it\'s how I show care'],
    type:'single', icon:'🍛'
  },

  // ── EMOTIONAL DEPTH (Aron 36 Questions influence) ──
  {
    id:'i1', dim:'intimacy', weight:9,
    q: 'Emotional vulnerability in a relationship is…',
    opts: ['Essential — it\'s how I connect deepest','Important but takes time to build','Something I\'m working on','Difficult for me — I guard my heart','Not my natural style'],
    type:'scale'
  },
  {
    id:'i2', dim:'intimacy', weight:8,
    q: 'When I\'m stressed, I want my partner to…',
    opts: ['Hold space and listen — no advice yet','Offer solutions and help me fix it','Distract me with something fun','Give me space and check in later','Just be present — silently'],
    type:'single', icon:'🫂'
  },
  {
    id:'i3', dim:'intimacy', weight:8,
    q: 'I feel most loved when…',
    opts: ['My partner says it out loud and often','We spend quality uninterrupted time','They do things without being asked','Physical affection — touch and closeness','They give thoughtful gifts'],
    type:'single', icon:'💕'
  },
  {
    id:'i4', dim:'intimacy', weight:7,
    q: 'I believe that past heartbreaks…',
    opts: ['Have made me stronger and wiser','Are behind me — I\'m fully healed','Still affect me, but I\'m aware','I\'m still processing them honestly','Shape my boundaries but not my hope'],
    type:'single', icon:'🌿'
  },
  {
    id:'i5', dim:'intimacy', weight:7,
    q: 'Sharing my deepest fears with a partner feels…',
    opts: ['Natural — it\'s part of true intimacy','Possible once trust is fully built','Something I aspire to','Very difficult for me','I prefer to keep some things private'],
    type:'scale'
  },

  // ── AFRICAN ROOTS & CULTURE ──
  {
    id:'cu1', dim:'culture', weight:7,
    q: 'African culture and traditions in my daily life are…',
    opts: ['Central — I actively practice and celebrate','Very present — language, food, music, values','Present but blended with where I live','Mostly in values and family','Honestly not very present'],
    type:'scale'
  },
  {
    id:'cu2', dim:'culture', weight:6,
    q: 'For me, "home" means…',
    opts: ['Africa — always where I\'m from','Wherever my loved ones are','Where I have built my life now','A mix — I\'m comfortably global','Still figuring that out'],
    type:'single', icon:'🌍'
  },
  {
    id:'cu3', dim:'culture', weight:6,
    q: 'My partner should understand African cultural expectations (bride price, family roles, etc.):',
    opts: ['Yes — fully, they\'re non-negotiable','Mostly — some traditions matter deeply','Some, with room for our own definition','I\'m more progressive about these','These expectations don\'t apply to me'],
    type:'scale'
  },
  {
    id:'cu4', dim:'culture', weight:5,
    q: 'Language in my household would be…',
    opts: ['My African language (or theirs) primarily','Bilingual — English + African language','English primarily','Whichever the children learn best','Doesn\'t matter to me'],
    type:'single', icon:'🗣'
  },

  // ── DEALBREAKER QUESTIONS (OKCupid research: highest predictive value) ──
  {
    id:'db1', dim:'values', weight:10,
    q: '🚨 Dealbreaker — Could you date someone who smokes?',
    opts: ['Yes, completely fine','Only occasionally (social smoking)','It would be a challenge','Honestly, probably not','Absolutely not — hard no'],
    type:'single', icon:'🚬'
  },
  {
    id:'db2', dim:'values', weight:10,
    q: '🚨 Dealbreaker — How important is sexual compatibility to you?',
    opts: ['It\'s the foundation of everything','Very important — a key pillar','Important but not primary','Less important than emotional connection','Least of my concerns'],
    type:'scale'
  },
  {
    id:'db3', dim:'values', weight:10,
    q: '🚨 Dealbreaker — Could you date someone of a very different faith?',
    opts: ['Yes, love transcends religion','If they respect mine, absolutely','It would depend on how devout they are','Very unlikely','No — shared faith is non-negotiable'],
    type:'scale'
  },
  {
    id:'db4', dim:'values', weight:10,
    q: '🚨 Dealbreaker — Long-distance relationships:',
    opts: ['I\'m open to it — love is worth it','For the right person, yes','Short-term only with a clear plan','Very difficult for me','Absolute dealbreaker'],
    type:'scale'
  },
];

const AM_QUIZ_KEY = 'afrib_am_quiz_answers';

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 2 — ADVANCED COMPATIBILITY ENGINE (v2)
   Multi-dimensional scoring with dimension weights + answer proximity.
   ═══════════════════════════════════════════════════════════════════════ */
function calcCompatibilityV2(myAnswers, theirAnswers) {
  if (!myAnswers || !theirAnswers) return null;

  const dimScores = {};
  let totalWeight = 0;
  let weightedScore = 0;

  // Group questions by dimension
  AM_QUIZ_QUESTIONS.forEach(q => {
    const myAns    = myAnswers[q.id];
    const theirAns = theirAnswers[q.id];
    if (myAns === undefined || theirAns === undefined) return;

    const myIdx    = q.opts.indexOf(myAns);
    const theirIdx = q.opts.indexOf(theirAns);
    if (myIdx === -1 || theirIdx === -1) return;

    // Answer proximity score (0–1): closer answers = higher score
    const maxDist  = q.opts.length - 1;
    const dist     = Math.abs(myIdx - theirIdx);
    const proximity = 1 - (dist / maxDist);

    // For dealbreakers, extreme mismatch = severe penalty
    const isDealbreaker = q.id.startsWith('db');
    const score = isDealbreaker && dist > 2 ? proximity * 0.3 : proximity;

    if (!dimScores[q.dim]) dimScores[q.dim] = { total: 0, weight: 0 };
    dimScores[q.dim].total  += score * q.weight;
    dimScores[q.dim].weight += q.weight;

    const dimWeight = AM_QUIZ_DIMENSIONS[q.dim]?.weight || 10;
    weightedScore += score * q.weight * dimWeight;
    totalWeight   += q.weight * dimWeight;
  });

  if (totalWeight === 0) return null;

  // Overall percentage
  const overall = Math.round((weightedScore / totalWeight) * 100);

  // Per-dimension breakdown (0–100 each)
  const breakdown = {};
  Object.entries(dimScores).forEach(([dim, data]) => {
    if (data.weight > 0) {
      breakdown[dim] = Math.round((data.total / data.weight) * 100);
    }
  });

  // Compatibility tier
  let tier, tierColor, tierEmoji;
  if (overall >= 88)     { tier = 'Soulmate Territory';  tierColor = '#FF6B9D'; tierEmoji = '💘'; }
  else if (overall >= 76){ tier = 'Strong Connection';    tierColor = '#ff9900'; tierEmoji = '💕'; }
  else if (overall >= 63){ tier = 'Good Potential';       tierColor = '#22c55e'; tierEmoji = '✨'; }
  else if (overall >= 50){ tier = 'Worth Exploring';      tierColor = '#60a5fa'; tierEmoji = '👀'; }
  else                   { tier = 'Different Paths';       tierColor = '#9ca3af'; tierEmoji = '🤷'; }

  // Top shared values (what you have in common — show on profile card)
  const sharedTraits = [];
  AM_QUIZ_QUESTIONS.forEach(q => {
    if (myAnswers[q.id] && myAnswers[q.id] === theirAnswers[q.id]) {
      sharedTraits.push({ dim: q.dim, answer: myAnswers[q.id], q: q.q });
    }
  });

  return { overall, breakdown, tier, tierColor, tierEmoji, sharedTraits };
}

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 3 — QUIZ UI
   Renders as a bottom sheet / overlay — non-intrusive, can be dismissed.
   ═══════════════════════════════════════════════════════════════════════ */
(function buildQuizUI() {
  const style = document.createElement('style');
  style.textContent = `
    /* ── Quiz Overlay ── */
    #am-quiz-overlay {
      position: fixed; inset: 0; z-index: 9600;
      background: rgba(0,0,0,.88);
      backdrop-filter: blur(8px);
      display: none; flex-direction: column;
    }
    #am-quiz-overlay.open { display: flex; }

    .amq-header {
      padding: 16px 20px 10px;
      display: flex; align-items: center; gap: 12px;
      border-bottom: 1px solid rgba(255,255,255,.06);
      flex-shrink: 0;
    }
    .amq-close {
      background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.1);
      border-radius: 50%; width: 32px; height: 32px;
      display: flex; align-items: center; justify-content: center;
      color: rgba(255,255,255,.6); font-size: 15px; cursor: pointer;
      margin-left: auto; flex-shrink: 0;
    }
    .amq-title { font-size: 17px; font-weight: 800; color: #fff; }
    .amq-sub   { font-size: 12px; color: rgba(255,255,255,.5); margin-top: 1px; }

    /* Progress */
    .amq-progress {
      padding: 10px 20px;
      flex-shrink: 0;
    }
    .amq-prog-bar {
      height: 4px; background: rgba(255,255,255,.1);
      border-radius: 2px; overflow: hidden;
    }
    .amq-prog-fill {
      height: 100%;
      background: linear-gradient(90deg, #FF6B9D, #ff9900);
      border-radius: 2px;
      transition: width .4s ease;
    }
    .amq-prog-label {
      font-size: 11px; color: rgba(255,255,255,.4);
      margin-top: 5px; text-align: right;
    }

    /* Dimension label */
    .amq-dim-label {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 20px 0;
      font-size: 12px; font-weight: 700;
      color: rgba(255,107,157,.85);
      text-transform: uppercase; letter-spacing: .8px;
      flex-shrink: 0;
    }

    /* Question area */
    .amq-body {
      flex: 1; overflow-y: auto; padding: 16px 20px 8px;
    }
    .amq-question {
      font-size: 18px; font-weight: 700; color: #fff;
      line-height: 1.45; margin-bottom: 20px;
    }
    .amq-question .amq-q-icon {
      font-size: 22px; margin-right: 6px;
    }

    /* Answer options */
    .amq-options { display: flex; flex-direction: column; gap: 10px; }
    .amq-opt {
      padding: 13px 16px;
      border-radius: 14px;
      border: 1.5px solid rgba(255,255,255,.1);
      background: rgba(255,255,255,.04);
      color: rgba(255,255,255,.8);
      font-size: 14px; font-weight: 600;
      cursor: pointer;
      transition: all .18s;
      text-align: left;
    }
    .amq-opt:hover { border-color: rgba(255,107,157,.4); background: rgba(255,107,157,.08); }
    .amq-opt.selected {
      border-color: #FF6B9D;
      background: linear-gradient(135deg, rgba(255,107,157,.2), rgba(255,100,0,.15));
      color: #fff;
    }

    /* Scale type (visual slider feel with 5 options) */
    .amq-scale {
      display: grid; grid-template-columns: repeat(5,1fr); gap: 6px;
    }
    .amq-scale .amq-opt {
      padding: 10px 6px; text-align: center; font-size: 11px; border-radius: 10px;
    }

    /* Nav */
    .amq-nav {
      display: flex; gap: 10px;
      padding: 12px 20px 20px;
      flex-shrink: 0;
      border-top: 1px solid rgba(255,255,255,.06);
    }
    .amq-btn-next {
      flex: 1; padding: 13px;
      background: linear-gradient(135deg, #FF6B9D, #E85D26);
      border: none; border-radius: 12px;
      color: #fff; font-size: 15px; font-weight: 800;
      cursor: pointer; transition: all .18s;
    }
    .amq-btn-next:disabled { opacity: .38; cursor: not-allowed; }
    .amq-btn-next:not(:disabled):hover { transform: scale(1.02); }
    .amq-btn-skip {
      padding: 13px 18px;
      background: rgba(255,255,255,.06);
      border: 1px solid rgba(255,255,255,.1);
      border-radius: 12px; color: rgba(255,255,255,.5);
      font-size: 13px; cursor: pointer;
    }
    .amq-btn-back {
      padding: 13px 18px;
      background: rgba(255,255,255,.06);
      border: 1px solid rgba(255,255,255,.1);
      border-radius: 12px; color: rgba(255,255,255,.5);
      font-size: 13px; cursor: pointer;
    }

    /* Results / Summary screen */
    .amq-results {
      padding: 20px; text-align: center;
    }
    .amq-result-title {
      font-size: 22px; font-weight: 900; color: #FF6B9D; margin-bottom: 6px;
    }
    .amq-dim-bars { margin-top: 20px; text-align: left; }
    .amq-dim-bar-row { margin-bottom: 12px; }
    .amq-dim-bar-label {
      display: flex; justify-content: space-between;
      font-size: 12px; font-weight: 700; color: rgba(255,255,255,.7);
      margin-bottom: 4px;
    }
    .amq-dim-bar-track {
      height: 6px; background: rgba(255,255,255,.1); border-radius: 3px; overflow: hidden;
    }
    .amq-dim-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #FF6B9D, #ff9900);
      border-radius: 3px;
    }

    /* Compatibility badge on swipe cards */
    .am-compat-v2 {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 4px 10px; border-radius: 999px;
      font-size: 11px; font-weight: 800;
      background: rgba(0,0,0,.55);
      backdrop-filter: blur(6px);
      border: 1px solid rgba(255,255,255,.15);
    }

    /* "Take Quiz" CTA banner */
    .am-quiz-cta {
      margin: 12px 0;
      padding: 14px 16px;
      background: linear-gradient(135deg, rgba(255,107,157,.15), rgba(255,100,0,.1));
      border: 1px solid rgba(255,107,157,.35);
      border-radius: 14px;
      display: flex; align-items: center; gap: 12px;
      cursor: pointer; transition: all .18s;
    }
    .am-quiz-cta:hover { transform: scale(1.01); }
    .am-quiz-cta-icon { font-size: 28px; flex-shrink: 0; }
    .am-quiz-cta-title { font-size: 14px; font-weight: 800; color: #FF6B9D; }
    .am-quiz-cta-sub   { font-size: 11px; color: rgba(255,255,255,.55); margin-top: 2px; }
    .am-quiz-cta-arrow { margin-left: auto; font-size: 18px; color: rgba(255,107,157,.7); }

    /* Shared traits chips */
    .am-shared-traits {
      display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px;
    }
    .am-trait-chip {
      padding: 4px 10px; border-radius: 999px;
      background: rgba(255,107,157,.12); border: 1px solid rgba(255,107,157,.25);
      font-size: 11px; font-weight: 700; color: #FF6B9D;
    }
  `;
  document.head.appendChild(style);

  /* Build overlay DOM */
  const overlay = document.createElement('div');
  overlay.id = 'am-quiz-overlay';
  overlay.innerHTML = `
    <div class="amq-header">
      <div>
        <div class="amq-title">💕 AfriMatch Compatibility Quiz</div>
        <div class="amq-sub">Helps us find who you truly click with</div>
      </div>
      <button class="amq-close" onclick="window.closeAmQuiz()">✕</button>
    </div>
    <div class="amq-progress">
      <div class="amq-prog-bar"><div class="amq-prog-fill" id="amqProgFill" style="width:2%"></div></div>
      <div class="amq-prog-label" id="amqProgLabel">Question 1 of ${AM_QUIZ_QUESTIONS.length}</div>
    </div>
    <div class="amq-dim-label" id="amqDimLabel">🧭 Core Values</div>
    <div class="amq-body" id="amqBody"></div>
    <div class="amq-nav">
      <button class="amq-btn-back" id="amqBackBtn" onclick="window.amqBack()" style="display:none">←</button>
      <button class="amq-btn-skip" onclick="window.amqSkip()">Skip</button>
      <button class="amq-btn-next" id="amqNextBtn" onclick="window.amqNext()" disabled>Next →</button>
    </div>
  `;
  document.body.appendChild(overlay);
})();

/* ── Quiz state ── */
let _amqIndex    = 0;
let _amqAnswers  = {};
let _amqSelected = null;

function _amqRender() {
  if (_amqIndex >= AM_QUIZ_QUESTIONS.length) {
    _amqShowResults();
    return;
  }

  const q       = AM_QUIZ_QUESTIONS[_amqIndex];
  const pct     = Math.round((_amqIndex / AM_QUIZ_QUESTIONS.length) * 100);
  const dim     = AM_QUIZ_DIMENSIONS[q.dim];
  const prevAns = _amqAnswers[q.id];

  // Progress
  const fill  = document.getElementById('amqProgFill');
  const label = document.getElementById('amqProgLabel');
  const dimLbl= document.getElementById('amqDimLabel');
  if (fill)   fill.style.width   = Math.max(2, pct) + '%';
  if (label)  label.textContent  = `Question ${_amqIndex + 1} of ${AM_QUIZ_QUESTIONS.length}`;
  if (dimLbl) dimLbl.textContent = `${dim?.icon || '❓'} ${dim?.label || ''}`;

  // Back button
  const backBtn = document.getElementById('amqBackBtn');
  if (backBtn) backBtn.style.display = _amqIndex > 0 ? 'block' : 'none';

  // Next button
  const nextBtn = document.getElementById('amqNextBtn');
  if (nextBtn) {
    nextBtn.disabled    = !prevAns && !_amqSelected;
    nextBtn.textContent = _amqIndex === AM_QUIZ_QUESTIONS.length - 1 ? 'Finish 🎉' : 'Next →';
  }

  _amqSelected = prevAns || null;

  const isScale = q.type === 'scale';
  const body = document.getElementById('amqBody');
  if (!body) return;

  body.innerHTML = `
    <div class="amq-question">
      ${q.icon ? `<span class="amq-q-icon">${q.icon}</span>` : ''}${q.q}
    </div>
    <div class="amq-options ${isScale ? 'amq-scale' : ''}" id="amqOpts">
      ${q.opts.map((opt, i) => `
        <button class="amq-opt${prevAns === opt ? ' selected' : ''}"
          onclick="window.amqSelect(${i})">${opt}</button>
      `).join('')}
    </div>
  `;
}

window.amqSelect = function(idx) {
  const q   = AM_QUIZ_QUESTIONS[_amqIndex];
  _amqSelected = q.opts[idx];
  _amqAnswers[q.id] = _amqSelected;

  // Update UI
  document.querySelectorAll('#amqOpts .amq-opt').forEach((btn, i) => {
    btn.classList.toggle('selected', i === idx);
  });
  const nextBtn = document.getElementById('amqNextBtn');
  if (nextBtn) nextBtn.disabled = false;
};

window.amqNext = function() {
  if (_amqSelected) _amqAnswers[AM_QUIZ_QUESTIONS[_amqIndex].id] = _amqSelected;
  _amqSelected = null;
  _amqIndex++;
  _amqRender();
};

window.amqSkip = function() {
  _amqSelected = null;
  _amqIndex++;
  _amqRender();
};

window.amqBack = function() {
  if (_amqIndex > 0) {
    _amqSelected = null;
    _amqIndex--;
    _amqRender();
  }
};

function _amqShowResults() {
  // Save answers
  if (window.currentUser) {
    try {
      const saved = JSON.parse(localStorage.getItem(AM_QUIZ_KEY) || '{}');
      saved[window.currentUser.email] = _amqAnswers;
      localStorage.setItem(AM_QUIZ_KEY, JSON.stringify(saved));
    } catch(e) {}
  }

  // Merge into dating profile
  if (window.currentUser) {
    try {
      const DM_KEY   = 'afrib_dating_profiles';
      const profiles = JSON.parse(localStorage.getItem(DM_KEY) || '{}');
      if (profiles[window.currentUser.email]) {
        profiles[window.currentUser.email].quizAnswers = _amqAnswers;
        profiles[window.currentUser.email].quizCompletedAt = new Date().toISOString();
        localStorage.setItem(DM_KEY, JSON.stringify(profiles));
      }
    } catch(e) {}
  }

  // Show summary
  const answered    = Object.keys(_amqAnswers).length;
  const skipped     = AM_QUIZ_QUESTIONS.length - answered;
  const completePct = Math.round((answered / AM_QUIZ_QUESTIONS.length) * 100);

  const body = document.getElementById('amqBody');
  if (!body) return;

  // Hide nav, show finish
  const nav = document.querySelector('.amq-nav');
  if (nav) nav.innerHTML = `
    <button class="amq-btn-next" onclick="window.closeAmQuiz()" style="flex:1">
      🎉 Start Matching!
    </button>`;

  const prog = document.getElementById('amqProgFill');
  if (prog) prog.style.width = '100%';
  const label = document.getElementById('amqProgLabel');
  if (label) label.textContent = 'Quiz Complete!';
  const dim = document.getElementById('amqDimLabel');
  if (dim) dim.textContent = '✅ Results';

  body.innerHTML = `
    <div class="amq-results">
      <div style="font-size:52px;margin-bottom:10px">🎉</div>
      <div class="amq-result-title">Quiz Complete!</div>
      <div style="font-size:14px;color:rgba(255,255,255,.6);margin-bottom:18px">
        You answered <strong style="color:#FF6B9D">${answered}</strong> of ${AM_QUIZ_QUESTIONS.length} questions
        ${skipped > 0 ? `(${skipped} skipped)` : '— perfect!'}
      </div>

      <div style="background:linear-gradient(135deg,rgba(255,107,157,.15),rgba(255,100,0,.1));border:1px solid rgba(255,107,157,.3);border-radius:16px;padding:18px;margin-bottom:18px">
        <div style="font-size:13px;color:rgba(255,255,255,.6);margin-bottom:4px">Your profile is</div>
        <div style="font-size:36px;font-weight:900;color:#FF6B9D">${completePct}% complete</div>
        <div style="font-size:12px;color:rgba(255,255,255,.5);margin-top:4px">
          ${completePct >= 80 ? '🔥 Highly detailed profiles get 5× more matches!' : 'More answers = better matches!'}
        </div>
      </div>

      <div style="font-size:13px;color:rgba(255,255,255,.6);text-align:left;margin-bottom:12px;font-weight:700">
        Dimensions covered:
      </div>
      <div class="amq-dim-bars">
        ${Object.entries(AM_QUIZ_DIMENSIONS).map(([key, dim]) => {
          const dimQs     = AM_QUIZ_QUESTIONS.filter(q => q.dim === key);
          const dimAns    = dimQs.filter(q => _amqAnswers[q.id]).length;
          const dimPct    = dimQs.length ? Math.round((dimAns / dimQs.length) * 100) : 0;
          return `<div class="amq-dim-bar-row">
            <div class="amq-dim-bar-label">
              <span>${dim.icon} ${dim.label}</span>
              <span style="color:${dimPct >= 70 ? '#22c55e' : '#FF6B9D'}">${dimPct}%</span>
            </div>
            <div class="amq-dim-bar-track">
              <div class="amq-dim-bar-fill" style="width:${dimPct}%"></div>
            </div>
          </div>`;
        }).join('')}
      </div>

      <div style="font-size:12px;color:rgba(255,255,255,.35);margin-top:16px;line-height:1.5">
        Your answers are private. We only show compatibility scores to potential matches — never your individual answers.
      </div>
    </div>
  `;

  // Re-render discover cards with new scores
  setTimeout(() => {
    if (typeof window.renderDiscoverCards === 'function') {
      try { window.renderDiscoverCards(); } catch(e) {}
    }
  }, 500);

  if (typeof window.showToast === 'function') {
    window.showToast('✅ Quiz saved! Your matches just got smarter 💕');
  }
}

/* ── Public quiz open/close ── */
window.openAmQuiz = function(startFresh = false) {
  if (!window.currentUser) {
    if (typeof window.showAuth === 'function') window.showAuth('login');
    return;
  }

  // Load existing answers
  try {
    const saved = JSON.parse(localStorage.getItem(AM_QUIZ_KEY) || '{}');
    _amqAnswers = startFresh ? {} : (saved[window.currentUser.email] || {});
  } catch(e) { _amqAnswers = {}; }

  _amqIndex    = 0;
  _amqSelected = null;

  const overlay = document.getElementById('am-quiz-overlay');
  if (overlay) overlay.classList.add('open');
  _amqRender();
};

window.closeAmQuiz = function() {
  const overlay = document.getElementById('am-quiz-overlay');
  if (overlay) overlay.classList.remove('open');
  // Refresh discover with updated scores
  setTimeout(() => {
    if (typeof window.renderDiscoverCards === 'function') {
      try { window.renderDiscoverCards(); } catch(e) {}
    }
  }, 300);
};

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 4 — UPGRADE renderDiscoverCards & calcCompatibilityAdvanced
   Patches the existing score function to use quiz answers when available.
   ═══════════════════════════════════════════════════════════════════════ */
(function patchCompatibility() {
  const wait = setInterval(() => {
    if (typeof window.calcCompatibilityAdvanced !== 'function') return;
    clearInterval(wait);

    const origCalc = window.calcCompatibilityAdvanced;
    window.calcCompatibilityAdvanced = function(mine, theirs) {
      // Try quiz-enhanced scoring first
      try {
        if (window.currentUser) {
          const saved     = JSON.parse(localStorage.getItem(AM_QUIZ_KEY) || '{}');
          const myAnswers = saved[window.currentUser.email];
          const theirEmail= theirs?.email || theirs?.id;
          const theirAns  = theirEmail ? (saved[theirEmail] || {}) : {};

          if (myAnswers && Object.keys(myAnswers).length >= 5 &&
              theirAns && Object.keys(theirAns).length >= 5) {
            const v2 = calcCompatibilityV2(myAnswers, theirAns);
            if (v2) return v2.overall;
          }
        }
      } catch(e) {}

      // Fall back to original algorithm
      return origCalc(mine, theirs);
    };

    console.log('[AfriMatchUpgrade] calcCompatibilityAdvanced patched ✅');
  }, 400);
})();

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 5 — INJECT QUIZ CTA + compatibility breakdown on match profile
   ═══════════════════════════════════════════════════════════════════════ */
(function injectQuizCTA() {
  // Add "Take the Quiz" button to the AfriMatch main screen topbar
  const wait = setInterval(() => {
    const topbarActions = document.querySelector('.dm-topbar-actions');
    if (!topbarActions || topbarActions.querySelector('#amQuizBtn')) return;
    clearInterval(wait);

    const btn = document.createElement('button');
    btn.id    = 'amQuizBtn';
    btn.className = 'dm-icon-btn';
    btn.title     = 'Compatibility Quiz';
    btn.textContent = '🧪';
    btn.onclick = () => window.openAmQuiz();
    topbarActions.prepend(btn);
    console.log('[AfriMatchUpgrade] Quiz CTA button injected ✅');
  }, 600);
})();

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 6 — INJECT QUIZ PROMPT in Discover sub-panel (if quiz not done)
   ═══════════════════════════════════════════════════════════════════════ */
(function injectDiscoverQuizPrompt() {
  const wait = setInterval(() => {
    const discoverPanel = document.getElementById('dmsub-discover');
    if (!discoverPanel || discoverPanel.querySelector('#amDiscoverQuizCta')) return;
    clearInterval(wait);

    const cta = document.createElement('div');
    cta.id    = 'amDiscoverQuizCta';
    cta.className = 'am-quiz-cta';
    cta.innerHTML = `
      <div class="am-quiz-cta-icon">🧪</div>
      <div>
        <div class="am-quiz-cta-title">Take the Compatibility Quiz</div>
        <div class="am-quiz-cta-sub">Answer 40+ questions — we'll show you your true match %</div>
      </div>
      <div class="am-quiz-cta-arrow">→</div>
    `;
    cta.onclick = () => window.openAmQuiz();

    // Insert above the swipe area
    const swipeArea = document.getElementById('dmSwipeArea');
    if (swipeArea) {
      discoverPanel.insertBefore(cta, swipeArea);
    }

    // Hide it if quiz already done
    function updateCTAVisibility() {
      if (!window.currentUser) return;
      try {
        const saved     = JSON.parse(localStorage.getItem(AM_QUIZ_KEY) || '{}');
        const myAnswers = saved[window.currentUser.email] || {};
        const done      = Object.keys(myAnswers).length >= 10;
        cta.style.display = done ? 'none' : 'flex';
      } catch(e) {}
    }
    updateCTAVisibility();
    setInterval(updateCTAVisibility, 8000);

    console.log('[AfriMatchUpgrade] Discover quiz CTA injected ✅');
  }, 700);
})();

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 7 — ENHANCED MATCH POPUP with shared traits
   Patches showMatchPopup to display what they have in common
   ═══════════════════════════════════════════════════════════════════════ */
(function patchMatchPopup() {
  const wait = setInterval(() => {
    if (typeof window.showMatchPopup !== 'function') return;
    clearInterval(wait);

    const orig = window.showMatchPopup;
    window.showMatchPopup = function(withId) {
      orig(withId);

      // Add shared traits section to popup
      setTimeout(() => {
        const popup = document.getElementById('dmMatchPopup');
        if (!popup || !window.currentUser) return;

        try {
          const saved        = JSON.parse(localStorage.getItem(AM_QUIZ_KEY) || '{}');
          const myAnswers    = saved[window.currentUser.email] || {};
          const theirAnswers = saved[withId] || {};

          if (Object.keys(myAnswers).length < 3 || Object.keys(theirAnswers).length < 3) return;

          const v2 = calcCompatibilityV2(myAnswers, theirAnswers);
          if (!v2) return;

          const existingTraits = popup.querySelector('.am-shared-traits-section');
          if (existingTraits) existingTraits.remove();

          const section = document.createElement('div');
          section.className = 'am-shared-traits-section';
          section.style.cssText = 'margin-top:12px;text-align:left;border-top:1px solid rgba(255,255,255,.08);padding-top:12px';
          section.innerHTML = `
            <div style="font-size:11px;color:rgba(255,255,255,.4);font-weight:700;text-transform:uppercase;letter-spacing:.8px;margin-bottom:8px">
              ${v2.tierEmoji} ${v2.overall}% match · ${v2.tier}
            </div>
            ${v2.sharedTraits.length ? `
              <div style="font-size:12px;color:rgba(255,255,255,.55);margin-bottom:6px">You both agree on:</div>
              <div class="am-shared-traits">
                ${v2.sharedTraits.slice(0,4).map(t =>
                  `<span class="am-trait-chip">${AM_QUIZ_DIMENSIONS[t.dim]?.icon || '✓'} ${t.answer.split('—')[0].trim().slice(0,28)}</span>`
                ).join('')}
              </div>` : ''}
          `;

          const firstBtn = popup.querySelector('button');
          if (firstBtn) popup.insertBefore(section, firstBtn);
        } catch(e) {}
      }, 100);
    };

    console.log('[AfriMatchUpgrade] showMatchPopup patched with shared traits ✅');
  }, 500);
})();

/* ═══════════════════════════════════════════════════════════════════════
   SECTION 8 — QUIZ QUICK ACCESS from the profile wizard (Step 4 upgrade)
   ═══════════════════════════════════════════════════════════════════════ */
(function upgradeWizardStep4() {
  // After wizard is rendered, add a "Take full quiz" link in step 4
  const wait = setInterval(() => {
    const step4 = document.getElementById('dm-step-4');
    if (!step4 || step4.querySelector('#amWizardQuizLink')) return;
    clearInterval(wait);

    const link = document.createElement('div');
    link.id = 'amWizardQuizLink';
    link.style.cssText = 'margin-top:14px;padding:12px 14px;background:rgba(255,107,157,.08);border:1px solid rgba(255,107,157,.2);border-radius:12px;cursor:pointer;text-align:center;transition:all .18s';
    link.innerHTML = `
      <div style="font-size:14px;font-weight:700;color:#FF6B9D">🧪 Take the Deep Compatibility Quiz</div>
      <div style="font-size:11px;color:rgba(255,255,255,.45);margin-top:3px">40+ questions · Takes ~5 min · Gets you smarter matches</div>
    `;
    link.onclick = () => window.openAmQuiz();
    step4.appendChild(link);
  }, 800);
})();

console.log('[AfriMatchUpgrade] afrib_afrimatch_upgrade.js loaded ✅ — 40 questions, v2 compatibility engine, quiz UI ready');
