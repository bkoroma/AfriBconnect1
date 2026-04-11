/* ═══════════════════════════════════════════════════════════════════════
   AfribConnect — Quartz Gifter Level System (50 Levels)
   afrib_gifter_levels.js

   BASED ON:
   • TikTok Gifter Level coin thresholds (from official TikTok data)
   • Quartz Gifter Badges design (4 tiers: Basic → Active → Power → Elite → Legendary)
   • 50 levels total, "Quartz God" at Level 50

   TIER STRUCTURE (matching images):
   ────────────────────────────────────────────────────────────────────
   BASIC GIFTER     — Levels  1–10  | White/pink crystals, growing size
   ACTIVE GIFTER    — Levels 11–20  | Hot pink crystals with gold ring, glowing
   POWER GIFTER     — Levels 21–30  | White/silver crystals, blue sparkle aura
   ELITE GIFTER     — Levels 31–40  | Black diamond with gold crown + ring
   LEGENDARY GIFTER — Levels 41–49  | Black diamond, large gold crown, fire aura
   QUARTZ GOD       — Level  50     | Max tier — crown + lightning + crystal sceptre

   COIN THRESHOLDS (TikTok official, from image):
   L01=1, L02=8, L03=18, L04=34, L05=56, L06=90, L07=140, L08=220,
   L09=340, L10=530, L11=820, L12=1260, L13=1920, L14=2480, L15=4340,
   L16=6420, L17=9280, L18=13500, L19=19400, L20=27800, L21=39600,
   L22=54600, L23=75800, L24=105000, L25=144000, L26=196000, L27=265000,
   L28=357000, L29=578000, L30=637000, L31=845000, L32=1120000,
   L33=1470000, L34=1920000, L35=2500000, L36=3230000, L37=4180000,
   L38=5430000, L39=6890000, L40=8780000, L41=11200000, L42=14100000,
   L43=17800000, L44=22300000, L45=20000000(milestone), L46=37500000,
   L47=47500000, L48=65700000, L49=75000000, L50=97500000
   ═══════════════════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────────────────────────────
   TIER DEFINITIONS — visual + label for each tier
───────────────────────────────────────────────────────────────────── */
const QUARTZ_TIERS = {
  basic:     { name:'Basic Gifter',     color:'#F9A8D4', glow:'rgba(249,168,212,.5)',  dark:'#be185d', crown:false, crystal:'pink',  ring:'gold'  },
  active:    { name:'Active Gifter',    color:'#F472B6', glow:'rgba(244,114,182,.6)',  dark:'#9d174d', crown:false, crystal:'hot',   ring:'gold'  },
  power:     { name:'Power Gifter',     color:'#BAE6FD', glow:'rgba(186,230,253,.6)',  dark:'#0369a1', crown:false, crystal:'white', ring:'gold'  },
  elite:     { name:'Elite Gifter',     color:'#D4AF37', glow:'rgba(212,175,55,.5)',   dark:'#92400e', crown:true,  crystal:'black', ring:'gold'  },
  legendary: { name:'Legendary Gifter', color:'#FF9800', glow:'rgba(255,152,0,.7)',    dark:'#78350f', crown:true,  crystal:'black', ring:'fire'  },
  god:       { name:'Quartz God',       color:'#D4AF37', glow:'rgba(212,175,55,1)',    dark:'#451a03', crown:true,  crystal:'divine',ring:'divine'},
};

/* ─────────────────────────────────────────────────────────────────────
   50-LEVEL TABLE (coins = cumulative coins spent, matching TikTok data)
───────────────────────────────────────────────────────────────────── */
const QUARTZ_LEVELS = [
  // Basic Gifter — Level 1–10
  { level:1,  coins:1,        tier:'basic',     sublevel:1  },
  { level:2,  coins:8,        tier:'basic',     sublevel:2  },
  { level:3,  coins:18,       tier:'basic',     sublevel:3  },
  { level:4,  coins:34,       tier:'basic',     sublevel:4  },
  { level:5,  coins:56,       tier:'basic',     sublevel:5  },
  { level:6,  coins:90,       tier:'basic',     sublevel:6  },
  { level:7,  coins:140,      tier:'basic',     sublevel:7  },
  { level:8,  coins:220,      tier:'basic',     sublevel:8  },
  { level:9,  coins:340,      tier:'basic',     sublevel:9  },
  { level:10, coins:530,      tier:'basic',     sublevel:10 },
  // Active Gifter — Level 11–20
  { level:11, coins:820,      tier:'active',    sublevel:1  },
  { level:12, coins:1260,     tier:'active',    sublevel:2  },
  { level:13, coins:1920,     tier:'active',    sublevel:3  },
  { level:14, coins:2480,     tier:'active',    sublevel:4  },
  { level:15, coins:4340,     tier:'active',    sublevel:5  },
  { level:16, coins:6420,     tier:'active',    sublevel:6  },
  { level:17, coins:9280,     tier:'active',    sublevel:7  },
  { level:18, coins:13500,    tier:'active',    sublevel:8  },
  { level:19, coins:19400,    tier:'active',    sublevel:9  },
  { level:20, coins:27800,    tier:'active',    sublevel:10 },
  // Power Gifter — Level 21–30
  { level:21, coins:39600,    tier:'power',     sublevel:1  },
  { level:22, coins:54600,    tier:'power',     sublevel:2  },
  { level:23, coins:75800,    tier:'power',     sublevel:3  },
  { level:24, coins:105000,   tier:'power',     sublevel:4  },
  { level:25, coins:144000,   tier:'power',     sublevel:5  },
  { level:26, coins:196000,   tier:'power',     sublevel:6  },
  { level:27, coins:265000,   tier:'power',     sublevel:7  },
  { level:28, coins:357000,   tier:'power',     sublevel:8  },
  { level:29, coins:578000,   tier:'power',     sublevel:9  },
  { level:30, coins:637000,   tier:'power',     sublevel:10 },
  // Elite Gifter — Level 31–40
  { level:31, coins:845000,   tier:'elite',     sublevel:1  },
  { level:32, coins:1120000,  tier:'elite',     sublevel:2  },
  { level:33, coins:1470000,  tier:'elite',     sublevel:3  },
  { level:34, coins:1920000,  tier:'elite',     sublevel:4  },
  { level:35, coins:2500000,  tier:'elite',     sublevel:5  },
  { level:36, coins:3230000,  tier:'elite',     sublevel:6  },
  { level:37, coins:4180000,  tier:'elite',     sublevel:7  },
  { level:38, coins:5430000,  tier:'elite',     sublevel:8  },
  { level:39, coins:6890000,  tier:'elite',     sublevel:9  },
  { level:40, coins:8780000,  tier:'elite',     sublevel:10 },
  // Legendary Gifter — Level 41–49
  { level:41, coins:11200000, tier:'legendary', sublevel:1  },
  { level:42, coins:14100000, tier:'legendary', sublevel:2  },
  { level:43, coins:17800000, tier:'legendary', sublevel:3  },
  { level:44, coins:22300000, tier:'legendary', sublevel:4  },
  { level:45, coins:29000000, tier:'legendary', sublevel:5  },
  { level:46, coins:37500000, tier:'legendary', sublevel:6  },
  { level:47, coins:47500000, tier:'legendary', sublevel:7  },
  { level:48, coins:65700000, tier:'legendary', sublevel:8  },
  { level:49, coins:75000000, tier:'legendary', sublevel:9  },
  // Quartz God — Level 50
  { level:50, coins:97500000, tier:'god',       sublevel:1  },
];

/* ─────────────────────────────────────────────────────────────────────
   LEVEL CALCULATOR
───────────────────────────────────────────────────────────────────── */
window.getQuartzLevel = function(totalCoinsSpent) {
  let current = QUARTZ_LEVELS[0];
  for (const lvl of QUARTZ_LEVELS) {
    if (totalCoinsSpent >= lvl.coins) current = lvl;
    else break;
  }
  const nextLvl = QUARTZ_LEVELS.find(l => l.level === current.level + 1);
  const prevCoins = current.coins;
  const nextCoins = nextLvl?.coins || current.coins;
  const progress  = nextLvl
    ? Math.round(((totalCoinsSpent - prevCoins) / (nextCoins - prevCoins)) * 100)
    : 100;
  return {
    ...current,
    tier:    QUARTZ_TIERS[current.tier],
    tierKey: current.tier,
    next:    nextLvl,
    progress: Math.min(100, Math.max(0, progress)),
    coinsToNext: nextLvl ? Math.max(0, nextCoins - totalCoinsSpent) : 0,
    totalCoinsSpent,
  };
};

window.QUARTZ_LEVELS = QUARTZ_LEVELS;
window.QUARTZ_TIERS  = QUARTZ_TIERS;

/* ─────────────────────────────────────────────────────────────────────
   SVG BADGE RENDERER — draws the crystal badge matching the images
───────────────────────────────────────────────────────────────────── */
window.renderQuartzBadgeSVG = function(level, size) {
  size = size || 56;
  if (!level) return '';

  const tierKey = typeof level === 'object' ? level.tierKey : 'basic';
  const lvlNum  = typeof level === 'object' ? level.level  : 1;
  const tier    = QUARTZ_TIERS[tierKey] || QUARTZ_TIERS.basic;
  const s       = size;

  // Crystal colours per tier
  const crystalColors = {
    basic:     ['#F0E6FF','#E8C8F0','#F9A8D4','#FBAED2','#FCB8DB'],
    active:    ['#FF69B4','#F472B6','#EC4899','#DB2777','#FF1493'],
    power:     ['#E0F2FE','#BAE6FD','#7DD3FC','#38BDF8','#FFFFFF'],
    elite:     ['#1a1a2e','#2d2d4e','#16213e','#0f3460','#1F1F3A'],
    legendary: ['#0d0d1a','#1a1a2e','#0d0d0d','#050510','#000014'],
    god:       ['#D4AF37','#FFD700','#FFF700','#FFED00','#F5C518'],
  };
  const cols = crystalColors[tierKey] || crystalColors.basic;

  // Ring colour
  const ringColor = tier.ring === 'fire'
    ? 'url(#fireRing)'
    : tier.ring === 'divine'
    ? 'url(#divineRing)'
    : '#D4AF37';

  const id = `qb_${lvlNum}_${Math.random().toString(36).slice(2,6)}`;

  // Glow filter intensity by tier
  const glowIntensity = { basic:4, active:7, power:6, elite:5, legendary:10, god:15 };
  const gi = glowIntensity[tierKey] || 4;

  return `<svg width="${s}" height="${s}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="glow_${id}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${tier.color}" stop-opacity=".9"/>
        <stop offset="100%" stop-color="${tier.color}" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="bg_${id}" cx="50%" cy="70%" r="60%">
        <stop offset="0%" stop-color="#1a0a2e"/>
        <stop offset="100%" stop-color="#060010"/>
      </radialGradient>
      <linearGradient id="ring_${id}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFD700"/>
        <stop offset="50%" stop-color="#FFF5A0"/>
        <stop offset="100%" stop-color="#B8860B"/>
      </linearGradient>
      <linearGradient id="fireRing" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FF4500"/>
        <stop offset="50%" stop-color="#FF9800"/>
        <stop offset="100%" stop-color="#FF6B00"/>
      </linearGradient>
      <linearGradient id="divineRing" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#D4AF37"/>
        <stop offset="30%" stop-color="#FFF700"/>
        <stop offset="70%" stop-color="#D4AF37"/>
        <stop offset="100%" stop-color="#FFD700"/>
      </linearGradient>
      <filter id="f_${id}" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="${gi}" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
      <filter id="gf_${id}">
        <feGaussianBlur stdDeviation="3" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>

    <!-- Background circle -->
    <circle cx="50" cy="50" r="48" fill="url(#bg_${id})"/>

    <!-- Glow aura -->
    <circle cx="50" cy="55" r="38" fill="url(#glow_${id})" opacity=".5" filter="url(#f_${id})"/>

    <!-- Gold ring (ellipse platform) -->
    <ellipse cx="50" cy="72" rx="34" ry="9"
      stroke="url(#ring_${id})" stroke-width="3"
      fill="none" opacity=".9"/>
    ${tier.ring === 'fire' ? `
    <ellipse cx="50" cy="72" rx="36" ry="11"
      stroke="#FF6B00" stroke-width="1.5"
      fill="none" opacity=".4"/>` : ''}
    ${tier.ring === 'divine' ? `
    <ellipse cx="50" cy="72" rx="37" ry="12"
      stroke="#FFD700" stroke-width="2"
      fill="none" opacity=".6"/>
    <ellipse cx="50" cy="72" rx="39" ry="13"
      stroke="#FFF700" stroke-width="1"
      fill="none" opacity=".3"/>` : ''}

    <!-- Crystal cluster -->
    ${_crystalPaths(tierKey, cols, id, lvlNum)}

    <!-- Crown (elite+) -->
    ${tier.crown ? _crownSVG(tierKey, id) : ''}

    <!-- Sparkles -->
    ${_sparkleSVG(tierKey, id)}

    <!-- Level number badge -->
    <circle cx="50" cy="91" r="10" fill="#000" opacity=".7"/>
    <circle cx="50" cy="91" r="9" fill="none" stroke="${tier.color}" stroke-width="1.5"/>
    <text x="50" y="95" text-anchor="middle" font-size="8" font-weight="900"
      fill="${tier.color}" font-family="Arial,sans-serif">${lvlNum}</text>
  </svg>`;
};

function _crystalPaths(tierKey, cols, id, lvl) {
  // Growth factor: bigger crystals at higher sub-levels
  const tier  = QUARTZ_TIERS[tierKey];
  const isBlack = tierKey === 'elite' || tierKey === 'legendary' || tierKey === 'god';
  const isDivine = tierKey === 'god';

  if (isBlack) {
    // Black diamond / dark crystal cluster
    return `
      <!-- Main large crystal (dark) -->
      <polygon points="50,18 60,38 55,68 45,68 40,38"
        fill="${cols[0]}" stroke="${cols[1]}" stroke-width="1.5" opacity=".95"/>
      <polygon points="50,18 60,38 50,32" fill="${cols[2]}" opacity=".6"/>
      <!-- Left crystal -->
      <polygon points="36,30 44,46 41,65 32,65 29,46"
        fill="${cols[0]}" stroke="${cols[1]}" stroke-width="1" opacity=".8"/>
      <!-- Right crystal -->
      <polygon points="64,30 72,46 69,65 60,65 57,46"
        fill="${cols[0]}" stroke="${cols[1]}" stroke-width="1" opacity=".8"/>
      <!-- Reflections -->
      <polygon points="46,22 50,32 44,30" fill="white" opacity="${isDivine?'.6':'.15'}"/>
      <polygon points="62,32 66,42 63,40" fill="white" opacity="${isDivine?'.4':'.1'}"/>
      ${isDivine ? `
      <polygon points="50,18 60,38 50,28" fill="#FFD700" opacity=".5"/>
      <polygon points="50,18 40,38 50,28" fill="#FFF700" opacity=".3"/>
      ` : ''}`;
  }

  // Crystal cluster — pink (basic/active) or white/silver (power)
  const c0 = cols[2], c1 = cols[3], c2 = cols[0], c3 = cols[4];
  const isHot   = tierKey === 'active';
  const isPower = tierKey === 'power';

  return `
    <!-- Centre tall crystal -->
    <polygon points="50,14 58,36 54,66 46,66 42,36"
      fill="${c0}" stroke="${c1}" stroke-width="1.5" opacity=".95"/>
    <!-- Centre highlight -->
    <polygon points="50,14 58,36 50,28" fill="${isPower?'white':isHot?'#FFB6C1':'#FFF0F5'}" opacity=".5"/>
    <!-- Left crystal (medium) -->
    <polygon points="37,24 44,42 41,64 34,64 31,42"
      fill="${c2}" stroke="${c1}" stroke-width="1" opacity=".85"/>
    <!-- Right crystal (medium) -->
    <polygon points="63,24 69,42 66,64 59,64 56,42"
      fill="${c2}" stroke="${c1}" stroke-width="1" opacity=".85"/>
    <!-- Far left (small) -->
    <polygon points="26,34 32,48 30,63 24,63 22,48"
      fill="${c3}" stroke="${c1}" stroke-width=".8" opacity=".6"/>
    <!-- Far right (small) -->
    <polygon points="74,34 78,48 76,63 70,63 68,48"
      fill="${c3}" stroke="${c1}" stroke-width=".8" opacity=".6"/>
    <!-- Reflections on crystals -->
    <polygon points="47,18 50,28 43,26" fill="white" opacity=".6"/>
    <polygon points="34,26 37,36 33,34" fill="white" opacity=".4"/>`;
}

function _crownSVG(tierKey, id) {
  const goldLight = tierKey === 'god' ? '#FFF700' : '#FFD700';
  const goldMid   = '#D4AF37';
  const goldDark  = '#8B6914';
  return `
    <!-- Crown -->
    <g transform="translate(28, 4) scale(0.44)">
      <!-- Crown band -->
      <rect x="0" y="38" width="100" height="22" rx="4"
        fill="${goldMid}" stroke="${goldLight}" stroke-width="2"/>
      <!-- Crown points -->
      <polygon points="0,38 16,8 32,38" fill="${goldMid}" stroke="${goldLight}" stroke-width="1.5"/>
      <polygon points="34,38 50,2 66,38" fill="${goldMid}" stroke="${goldLight}" stroke-width="1.5"/>
      <polygon points="68,38 84,8 100,38" fill="${goldMid}" stroke="${goldLight}" stroke-width="1.5"/>
      <!-- Gem in centre point -->
      <circle cx="50" cy="6" r="6" fill="#FF1493" stroke="${goldLight}" stroke-width="1.5"/>
      <circle cx="16" cy="12" r="4" fill="#00BFFF" stroke="${goldLight}" stroke-width="1"/>
      <circle cx="84" cy="12" r="4" fill="#00BFFF" stroke="${goldLight}" stroke-width="1"/>
      <!-- Band gems -->
      <circle cx="50" cy="49" r="5" fill="#FF1493"/>
      <circle cx="18" cy="49" r="3.5" fill="${goldLight}"/>
      <circle cx="82" cy="49" r="3.5" fill="${goldLight}"/>
      <!-- Highlights -->
      <polygon points="0,38 16,8 10,30" fill="${goldLight}" opacity=".4"/>
      <polygon points="34,38 50,2 44,24" fill="${goldLight}" opacity=".4"/>
      <polygon points="68,38 84,8 78,30" fill="${goldLight}" opacity=".4"/>
    </g>
    ${tierKey === 'god' ? `
    <!-- Extra divine lightning bolts -->
    <text x="16" y="30" font-size="10" fill="#FFD700" opacity=".9">⚡</text>
    <text x="70" y="30" font-size="10" fill="#FFD700" opacity=".9">⚡</text>` : ''}`;
}

function _sparkleSVG(tierKey, id) {
  const tier  = QUARTZ_TIERS[tierKey];
  const col   = tier.color;
  const count = { basic:3, active:5, power:6, elite:5, legendary:8, god:12 };
  const n     = count[tierKey] || 3;
  const positions = [
    [15,20],[85,18],[10,55],[90,50],[50,10],
    [20,80],[80,80],[30,15],[70,15],[5,38],
    [95,38],[50,90],[25,65],[75,65],
  ];
  let sparks = '';
  for (let i = 0; i < Math.min(n, positions.length); i++) {
    const [x,y] = positions[i];
    const sz = 2 + (i % 3);
    sparks += `<circle cx="${x}" cy="${y}" r="${sz}" fill="${col}" opacity="${0.4 + (i%3)*0.2}">
      <animate attributeName="opacity" values="${0.2 + i*0.05};${0.9};${0.2 + i*0.05}" dur="${1.5 + i*0.3}s" repeatCount="indefinite"/>
      <animate attributeName="r" values="${sz};${sz*1.5};${sz}" dur="${1.5 + i*0.3}s" repeatCount="indefinite"/>
    </circle>`;
  }
  // 4-point star sparkles for legendary+
  if (tierKey === 'legendary' || tierKey === 'god') {
    sparks += `
      <path d="M15,12 L16.5,15 L20,16.5 L16.5,18 L15,21 L13.5,18 L10,16.5 L13.5,15 Z"
        fill="${col}" opacity=".8">
        <animate attributeName="opacity" values=".3;1;.3" dur="2s" repeatCount="indefinite"/>
      </path>
      <path d="M85,85 L86,88 L89,89 L86,90 L85,93 L84,90 L81,89 L84,88 Z"
        fill="${col}" opacity=".7">
        <animate attributeName="opacity" values=".2;.9;.2" dur="2.5s" repeatCount="indefinite"/>
      </path>`;
  }
  return sparks;
}

/* ─────────────────────────────────────────────────────────────────────
   BADGE PILL — inline pill for profiles, messages, posts
───────────────────────────────────────────────────────────────────── */
window.renderQuartzBadgePill = function(email, size) {
  const stats   = _socGet(`afrib_gift_stats_${email}`, { totalCoinsSpent:0 });
  const lvlData = window.getQuartzLevel(stats.totalCoinsSpent || 0);
  if (!lvlData || lvlData.level < 1) return '';

  // Don't show pill for level 0 (not started)
  if (lvlData.totalCoinsSpent < 1) return '';

  const tier  = lvlData.tier;
  const small = size === 'small' || size === true;
  const sz    = small ? 20 : 28;

  return `<span class="quartz-badge-pill" title="${tier.name} — Level ${lvlData.level}"
    style="display:inline-flex;align-items:center;gap:3px;background:${tier.color}15;border:1px solid ${tier.color}44;border-radius:20px;padding:${small?'2px 5px':'3px 8px'};vertical-align:middle;cursor:pointer"
    onclick="event.stopPropagation();openGifterProfile('${email}')">
    ${window.renderQuartzBadgeSVG(lvlData, sz)}
    ${!small ? `<span style="font-size:10px;font-weight:800;color:${tier.color};white-space:nowrap">L${lvlData.level}</span>` : ''}
  </span>`;
};

function _socGet(k, fb) {
  try { const v=localStorage.getItem(k); return v?JSON.parse(v):fb; }
  catch(e){return fb;}
}

/* ─────────────────────────────────────────────────────────────────────
   LEVEL-UP ANIMATION — full screen pop when gaining a level
───────────────────────────────────────────────────────────────────── */
window.showQuartzLevelUp = function(newLevel) {
  const tier = QUARTZ_TIERS[newLevel.tier] || QUARTZ_TIERS.basic;
  const isGod = newLevel.tierKey === 'god';

  const overlay = document.createElement('div');
  overlay.id = 'quartzLevelUpOverlay';
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:99999;
    background:radial-gradient(ellipse at center, ${tier.color}33 0%, rgba(0,0,0,.92) 70%);
    display:flex;align-items:center;justify-content:center;
    animation:quartzFadeIn .4s ease`;
  overlay.innerHTML = `
    <style>
      @keyframes quartzFadeIn{from{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}
      @keyframes quartzPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
      @keyframes quartzFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
      #quartzLevelUpOverlay .ql-badge{animation:quartzFloat 2s ease-in-out infinite}
    </style>
    <div style="text-align:center;padding:32px;max-width:360px;width:100%" onclick="this.parentElement.remove()">

      <!-- Badge -->
      <div class="ql-badge" style="margin:0 auto 16px;display:inline-block">
        ${window.renderQuartzBadgeSVG(newLevel, 120)}
      </div>

      <!-- Level up text -->
      <div style="font-size:13px;font-weight:700;color:${tier.color};text-transform:uppercase;letter-spacing:2px;margin-bottom:6px;opacity:.8">
        Level Up!
      </div>
      <div style="font-size:32px;font-weight:900;color:#fff;margin-bottom:4px;text-shadow:0 0 20px ${tier.color}">
        Level ${newLevel.level}
      </div>
      <div style="font-size:18px;font-weight:800;color:${tier.color};margin-bottom:16px">
        ${tier.name}
      </div>

      ${isGod ? `
        <div style="font-size:24px;margin-bottom:12px">👑⚡💎⚡👑</div>
        <div style="font-size:14px;color:#FFD700;font-weight:700;margin-bottom:16px">
          You have achieved QUARTZ GOD status!
        </div>` : ''}

      <!-- Progress to next -->
      ${newLevel.next ? `
        <div style="background:rgba(255,255,255,.08);border-radius:10px;padding:10px 14px;margin-bottom:16px;text-align:left">
          <div style="font-size:11px;color:rgba(255,255,255,.5);margin-bottom:4px">Next: Level ${newLevel.next.level}</div>
          <div style="height:4px;background:rgba(255,255,255,.1);border-radius:2px;overflow:hidden">
            <div style="height:100%;width:0%;background:${tier.color};border-radius:2px;transition:width 1s .5s" id="qlProgressBar"></div>
          </div>
          <div style="font-size:10px;color:rgba(255,255,255,.4);margin-top:4px">${newLevel.coinsToNext.toLocaleString()} 🪙 to next level</div>
        </div>` : ''}

      <button onclick="this.closest('#quartzLevelUpOverlay').remove()"
        style="background:${tier.color};color:#000;border:none;border-radius:24px;padding:12px 36px;font-size:15px;font-weight:800;cursor:pointer;letter-spacing:.5px">
        ${isGod ? '👑 EPIC!' : 'Continue →'}
      </button>
      <div style="font-size:11px;color:rgba(255,255,255,.3);margin-top:10px">Tap anywhere to close</div>
    </div>`;

  document.body.appendChild(overlay);
  // Animate progress bar
  setTimeout(() => {
    const bar = document.getElementById('qlProgressBar');
    if (bar) bar.style.width = '5%';
  }, 600);
  // Auto-close after 6 seconds
  setTimeout(() => overlay.remove(), 6000);
};

/* ─────────────────────────────────────────────────────────────────────
   GIFTER PROFILE MODAL — tap badge to see full profile
───────────────────────────────────────────────────────────────────── */
window.openGifterProfile = function(email) {
  const stats     = _socGet(`afrib_gift_stats_${email}`, { totalCoinsSpent:0, totalGifts:0 });
  const lvlData   = window.getQuartzLevel(stats.totalCoinsSpent || 0);
  const tier      = lvlData.tier;
  const accounts  = _socGet('afrib_accounts', {});
  const user      = accounts[email] || {};
  const name      = `${user.first||''} ${user.last||''}`.trim() || email.split('@')[0];

  // Build all level milestones earned
  const earned = QUARTZ_LEVELS.filter(l => l.coins <= (stats.totalCoinsSpent||0));

  const overlay = document.createElement('div');
  overlay.id = 'gifterProfileOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.88);backdrop-filter:blur(10px);display:flex;align-items:flex-end;justify-content:center';
  overlay.onclick = e => { if(e.target===overlay) overlay.remove(); };
  overlay.innerHTML = `
    <div style="background:var(--bg2,#1a1014);border-radius:20px 20px 0 0;padding:24px;width:100%;max-width:480px;max-height:85vh;overflow-y:auto">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
        <h3 style="font-size:16px;font-weight:800;margin:0">🎁 Gifter Profile</h3>
        <button onclick="safeRemoveEl('gifterProfileOverlay')" style="background:none;border:none;color:rgba(255,255,255,.4);font-size:20px;cursor:pointer">✕</button>
      </div>

      <!-- Profile header -->
      <div style="text-align:center;margin-bottom:20px">
        <div style="display:inline-block;margin-bottom:10px">
          ${window.renderQuartzBadgeSVG(lvlData, 100)}
        </div>
        <div style="font-size:18px;font-weight:800">${name}</div>
        <div style="font-size:14px;font-weight:700;color:${tier.color};margin-top:2px">
          ${tier.name} — Level ${lvlData.level}
        </div>
      </div>

      <!-- Stats -->
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:16px">
        ${[
          ['🎁','Total Gifts', (stats.totalGifts||0).toLocaleString()],
          ['🪙','Coins Spent', (stats.totalCoinsSpent||0).toLocaleString()],
          ['⭐','Level', lvlData.level],
        ].map(([ic,lb,vl]) => `
          <div style="text-align:center;background:rgba(255,255,255,.05);border-radius:10px;padding:10px">
            <div style="font-size:20px">${ic}</div>
            <div style="font-size:16px;font-weight:800;color:${tier.color}">${vl}</div>
            <div style="font-size:10px;color:rgba(255,255,255,.4)">${lb}</div>
          </div>`).join('')}
      </div>

      <!-- Progress to next level -->
      ${lvlData.next ? `
        <div style="background:rgba(255,255,255,.05);border-radius:10px;padding:12px;margin-bottom:16px">
          <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px">
            <span style="color:${tier.color};font-weight:700">Progress to Level ${lvlData.next.level}</span>
            <span style="color:rgba(255,255,255,.4)">${lvlData.progress}%</span>
          </div>
          <div style="height:6px;background:rgba(255,255,255,.08);border-radius:3px;overflow:hidden">
            <div style="height:100%;width:${lvlData.progress}%;background:${tier.color};border-radius:3px;transition:width .8s"></div>
          </div>
          <div style="font-size:10px;color:rgba(255,255,255,.3);margin-top:4px">
            ${lvlData.coinsToNext.toLocaleString()} coins to next level
          </div>
        </div>` : `
        <div style="background:${tier.color}22;border:1px solid ${tier.color}44;border-radius:10px;padding:12px;text-align:center;margin-bottom:16px">
          <div style="font-size:24px">👑</div>
          <div style="font-size:14px;font-weight:800;color:${tier.color}">QUARTZ GOD — MAX LEVEL</div>
        </div>`}

      <!-- Level history grid -->
      <div style="margin-bottom:8px">
        <div style="font-size:12px;font-weight:700;color:rgba(255,255,255,.4);margin-bottom:10px">
          Levels Earned (${earned.length}/50)
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          ${QUARTZ_LEVELS.map(l => {
            const isEarned = l.coins <= (stats.totalCoinsSpent||0);
            const isCurrent = l.level === lvlData.level;
            const lTier = QUARTZ_TIERS[l.tier] || QUARTZ_TIERS.basic;
            return `<div title="Level ${l.level} — ${lTier.name}" style="
              width:36px;height:36px;border-radius:8px;
              background:${isEarned?lTier.color+'22':'rgba(255,255,255,.04)'};
              border:1.5px solid ${isCurrent?lTier.color:isEarned?lTier.color+'66':'rgba(255,255,255,.1)'};
              display:flex;align-items:center;justify-content:center;
              font-size:${isCurrent?'11px':'10px'};font-weight:${isCurrent?'900':'600'};
              color:${isEarned?lTier.color:'rgba(255,255,255,.2)'};
              ${isCurrent?`box-shadow:0 0 8px ${lTier.color}66`:''};
              cursor:default">
              ${l.level}
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>`;
  document.body.appendChild(overlay);
};

/* ─────────────────────────────────────────────────────────────────────
   GIFTER LEADERBOARD — top gifters with Quartz badges
───────────────────────────────────────────────────────────────────── */
window.openGifterLeaderboard = function() {
  const accounts = _socGet('afrib_accounts', {});
  const entries  = Object.keys(accounts).map(email => {
    const stats   = _socGet(`afrib_gift_stats_${email}`, { totalGifts:0, totalCoinsSpent:0 });
    const lvlData = window.getQuartzLevel(stats.totalCoinsSpent || 0);
    const user    = accounts[email] || {};
    return {
      email,
      name: `${user.first||''} ${user.last||''}`.trim() || email.split('@')[0],
      totalCoinsSpent: stats.totalCoinsSpent || 0,
      totalGifts: stats.totalGifts || 0,
      lvlData,
    };
  })
  .filter(e => e.totalCoinsSpent > 0)
  .sort((a,b) => b.totalCoinsSpent - a.totalCoinsSpent)
  .slice(0, 20);

  const medals = ['🥇','🥈','🥉'];

  const overlay = document.createElement('div');
  overlay.id = 'gifterLbOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.9);backdrop-filter:blur(10px);display:flex;align-items:flex-end;justify-content:center';
  overlay.onclick = e => { if(e.target===overlay) overlay.remove(); };
  overlay.innerHTML = `
    <div style="background:var(--bg2,#1a1014);border-radius:20px 20px 0 0;padding:20px;width:100%;max-width:600px;max-height:85vh;overflow-y:auto">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
        <div>
          <h3 style="font-size:18px;font-weight:800;margin:0">🏆 Top Gifters</h3>
          <div style="font-size:11px;color:rgba(255,255,255,.4)">Quartz Gifter Leaderboard</div>
        </div>
        <button onclick="safeRemoveEl('gifterLbOverlay')" style="background:none;border:none;color:rgba(255,255,255,.4);font-size:20px;cursor:pointer">✕</button>
      </div>

      ${!entries.length ? `
        <div style="text-align:center;padding:32px;color:rgba(255,255,255,.4)">
          <div style="font-size:48px;margin-bottom:12px">🎁</div>
          <div>No gifters yet — be the first!</div>
        </div>` :
        entries.map((e, i) => {
          const tier = e.lvlData.tier;
          const isMe = e.email === window.currentUser?.email;
          return `
            <div onclick="openGifterProfile('${e.email}')"
              style="display:flex;align-items:center;gap:12px;padding:10px;border-radius:12px;margin-bottom:6px;cursor:pointer;
              ${isMe?`background:${tier.color}12;border:1px solid ${tier.color}33`:'border:1px solid rgba(255,255,255,.04)'}">
              <div style="font-size:18px;width:28px;text-align:center;flex-shrink:0">${medals[i]||String(i+1)}</div>
              <div style="flex-shrink:0">${window.renderQuartzBadgeSVG(e.lvlData, 44)}</div>
              <div style="flex:1;min-width:0">
                <div style="font-size:13px;font-weight:700">${e.name}${isMe?' (You)':''}</div>
                <div style="font-size:11px;color:${tier.color};font-weight:600">
                  ${tier.name} · Level ${e.lvlData.level}
                </div>
              </div>
              <div style="text-align:right;flex-shrink:0">
                <div style="font-size:13px;font-weight:800;color:${tier.color}">${e.totalCoinsSpent.toLocaleString()} 🪙</div>
                <div style="font-size:10px;color:rgba(255,255,255,.3)">${e.totalGifts} gifts</div>
              </div>
            </div>`;
        }).join('')}
    </div>`;
  document.body.appendChild(overlay);
};

/* ─────────────────────────────────────────────────────────────────────
   REPLACE old gifter badge system — override functions from
   afrib_social_upgrade.js with new Quartz system
───────────────────────────────────────────────────────────────────── */
window.renderGifterBadgePill = function(email, small) {
  return window.renderQuartzBadgePill(email, small);
};

window.getGifterBadge = function(email) {
  const stats = _socGet(`afrib_gift_stats_${email}`, { totalCoinsSpent:0 });
  return window.getQuartzLevel(stats.totalCoinsSpent || 0);
};

/* ─────────────────────────────────────────────────────────────────────
   PATCH recordGiftSent — check level up + update display
───────────────────────────────────────────────────────────────────── */
const _origRecordGiftSent = window.recordGiftSent;
window.recordGiftSent = function(email, giftId, coinsSpent, qty) {
  // Call original if exists
  if (typeof _origRecordGiftSent === 'function') _origRecordGiftSent(email, giftId, coinsSpent, qty);

  if (!email) return;
  const statsKey = `afrib_gift_stats_${email}`;
  const stats    = _socGet(statsKey, { totalGifts:0, totalCoinsSpent:0 });
  const prevLevel = window.getQuartzLevel(stats.totalCoinsSpent || 0).level;

  // Update stats
  stats.totalGifts       = (stats.totalGifts||0) + (qty||1);
  stats.totalCoinsSpent  = (stats.totalCoinsSpent||0) + (coinsSpent||0);
  try { localStorage.setItem(statsKey, JSON.stringify(stats)); } catch(e) {}

  // Check for level-up
  const newLevel = window.getQuartzLevel(stats.totalCoinsSpent);
  if (newLevel.level > prevLevel) {
    setTimeout(() => window.showQuartzLevelUp(newLevel), 1200);
  }

  // Update any open profile coin display
  document.querySelectorAll('[data-gifter-coins]').forEach(el => {
    if (!el.dataset.gifterEmail || el.dataset.gifterEmail === email) {
      el.textContent = stats.totalCoinsSpent.toLocaleString();
    }
  });
};

/* ─────────────────────────────────────────────────────────────────────
   INJECT BADGE IN GIFTME PANEL
───────────────────────────────────────────────────────────────────── */
(function injectGiftMeBadge() {
  function tryInject() {
    if (!window.currentUser?.email) return;
    const stats   = _socGet(`afrib_gift_stats_${window.currentUser.email}`, { totalCoinsSpent:0 });
    const lvlData = window.getQuartzLevel(stats.totalCoinsSpent || 0);
    const tier    = lvlData.tier;

    // Find giftme header/topbar
    const gmModal = document.querySelector('[id*="gm-"], [id*="giftme"], .gm-sheet, .gm-modal');
    if (!gmModal || gmModal.dataset.quartzInjected) return;
    gmModal.dataset.quartzInjected = '1';

    const badgeBar = document.createElement('div');
    badgeBar.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:8px 14px 6px;border-bottom:1px solid rgba(255,255,255,.08)';
    badgeBar.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px" onclick="openGifterProfile('${window.currentUser.email}')" style="cursor:pointer">
        ${window.renderQuartzBadgeSVG(lvlData, 36)}
        <div>
          <div style="font-size:11px;font-weight:800;color:${tier.color}">${tier.name}</div>
          <div style="font-size:10px;color:rgba(255,255,255,.4)">Level ${lvlData.level}${lvlData.next ? ` · ${lvlData.coinsToNext.toLocaleString()}🪙 to next`:' · MAX'}</div>
        </div>
      </div>
      <button onclick="openGifterLeaderboard()" style="padding:5px 10px;background:rgba(212,175,55,.1);border:1px solid rgba(212,175,55,.2);border-radius:8px;color:#D4AF37;font-size:11px;font-weight:700;cursor:pointer">
        🏆 Top Gifters
      </button>`;
    gmModal.prepend(badgeBar);
  }

  // Patch giftme open functions
  ['gmOpenForUser','_gmOpenForUser','gmOpenModal','openGiftMe'].forEach(fn => {
    const orig = window[fn];
    if (typeof orig === 'function') {
      window[fn] = function() {
        const r = orig.apply(this, arguments);
        setTimeout(tryInject, 300);
        return r;
      };
    }
  });
  window.addEventListener('load', () => setTimeout(tryInject, 2000));
})();

console.log('[AfribGifterLevels] Quartz Gifter System loaded ✅ — 50 levels, 5 tiers, animated SVG badges, level-up celebrations');
