/* ═══════════════════════════════════════════════════════════════════════════
   AfribConnect v43 Upgrade
   ─────────────────────────────────────────────────────────────────────────
   1. GIFT BADGE SYSTEM  — TikTok-style  •  admin-configurable thresholds
                           Quartz crystal badge progression (per reference image)
                           Levels 1–60 across 5 tiers with animated crystal renders
   2. STORAGE ENGINE     — Multi-layer write (localStorage + cookie + IndexedDB)
                           Cross-tab sync  •  quota-safe  •  versioned keys
   3. FULL CONFIGURATION — Upgraded superadmin config panel with live validation,
                           badge threshold editor, AI config, storage inspector,
                           platform settings, and connectivity tests
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

/* ═══════════════════════════════════════════════════════════════════════════
   §1  UPGRADED STORAGE ENGINE
   Multi-layer: localStorage (primary) → cookies (fallback) → IndexedDB (large)
   Cross-tab sync via BroadcastChannel  •  versioned keys  •  quota-safe writes
   ═══════════════════════════════════════════════════════════════════════════ */

const AFRIB_STORE_VERSION = 43;
const AFRIB_STORE_PREFIX  = `afrib_v${AFRIB_STORE_VERSION}_`;

const AfribStore = (() => {
  /* ── Cookie helpers ── */
  function _cookieSet(key, val, days = 365) {
    try {
      const exp = new Date(Date.now() + days * 864e5).toUTCString();
      document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(val)};expires=${exp};path=/;SameSite=Lax`;
    } catch(e) {}
  }
  function _cookieGet(key) {
    try {
      const m = document.cookie.match('(?:^|;)\\s*' + encodeURIComponent(key) + '=([^;]*)');
      return m ? decodeURIComponent(m[1]) : null;
    } catch(e) { return null; }
  }

  /* ── IndexedDB helpers ── */
  let _idb = null;
  function _idbOpen() {
    return new Promise((res, rej) => {
      if (_idb) { res(_idb); return; }
      const req = indexedDB.open('afrib_store_v43', 1);
      req.onupgradeneeded = e => e.target.result.createObjectStore('kv', { keyPath: 'k' });
      req.onsuccess  = e => { _idb = e.target.result; res(_idb); };
      req.onerror    = () => rej(req.error);
    });
  }
  async function _idbSet(key, val) {
    try {
      const db = await _idbOpen();
      return new Promise((res, rej) => {
        const tx = db.transaction('kv', 'readwrite');
        tx.objectStore('kv').put({ k: key, v: val });
        tx.oncomplete = () => res(true);
        tx.onerror    = () => rej(tx.error);
      });
    } catch(e) { return false; }
  }
  async function _idbGet(key) {
    try {
      const db = await _idbOpen();
      return new Promise((res, rej) => {
        const req = db.transaction('kv').objectStore('kv').get(key);
        req.onsuccess = () => res(req.result?.v ?? null);
        req.onerror   = () => rej(req.error);
      });
    } catch(e) { return null; }
  }
  async function _idbDel(key) {
    try {
      const db = await _idbOpen();
      return new Promise((res) => {
        const tx = db.transaction('kv', 'readwrite');
        tx.objectStore('kv').delete(key);
        tx.oncomplete = () => res(true);
        tx.onerror    = () => res(false);
      });
    } catch(e) { return false; }
  }
  async function _idbKeys() {
    try {
      const db = await _idbOpen();
      return new Promise((res) => {
        const req = db.transaction('kv').objectStore('kv').getAllKeys();
        req.onsuccess = () => res(req.result || []);
        req.onerror   = () => res([]);
      });
    } catch(e) { return []; }
  }

  /* ── Cross-tab sync ── */
  let _bc = null;
  try { _bc = new BroadcastChannel('afrib_store_sync'); } catch(e) {}
  function _broadcast(action, key, val) {
    try { if (_bc) _bc.postMessage({ action, key, val, ts: Date.now() }); } catch(e) {}
  }
  if (_bc) {
    _bc.onmessage = ({ data }) => {
      if (!data || !data.key) return;
      try {
        if (data.action === 'set')
          localStorage.setItem(data.key, data.val);
        else if (data.action === 'del')
          localStorage.removeItem(data.key);
      } catch(e) {}
    };
  }

  /* ── Quota-safe localStorage write ── */
  function _lsSet(key, val) {
    try {
      localStorage.setItem(key, val);
      return true;
    } catch(e) {
      // localStorage full — prune old versioned keys
      try {
        const oldKeys = Object.keys(localStorage).filter(k =>
          k.startsWith('afrib_v') && !k.startsWith(AFRIB_STORE_PREFIX));
        oldKeys.forEach(k => localStorage.removeItem(k));
        localStorage.setItem(key, val);
        return true;
      } catch(e2) { return false; }
    }
  }

  /* ── Public API ── */
  return {
    /**
     * set(key, value)  — writes to localStorage + cookie + IDB
     * key is automatically namespaced.
     */
    set(key, value) {
      const k   = AFRIB_STORE_PREFIX + key;
      const str = JSON.stringify({ v: value, ts: Date.now() });
      const ok  = _lsSet(k, str);
      _cookieSet(k, str.length > 3800 ? '__idb__' : str);  // cookies capped at ~4K
      _idbSet(k, str);                                       // async, best-effort
      if (ok) _broadcast('set', k, str);
      return ok;
    },

    /**
     * get(key, fallback)  — reads from localStorage, falls back to cookie → IDB
     */
    get(key, fallback = null) {
      const k = AFRIB_STORE_PREFIX + key;
      try {
        const raw = localStorage.getItem(k);
        if (raw) { const p = JSON.parse(raw); return p.v ?? fallback; }
        // Cookie fallback (sync)
        const ck = _cookieGet(k);
        if (ck && ck !== '__idb__') { const p = JSON.parse(ck); return p.v ?? fallback; }
      } catch(e) {}
      return fallback;
    },

    /**
     * getAsync(key, fallback)  — tries IDB if LS misses
     */
    async getAsync(key, fallback = null) {
      const sync = this.get(key, null);
      if (sync !== null) return sync;
      try {
        const k = AFRIB_STORE_PREFIX + key;
        const raw = await _idbGet(k);
        if (raw) { const p = JSON.parse(raw); return p.v ?? fallback; }
      } catch(e) {}
      return fallback;
    },

    del(key) {
      const k = AFRIB_STORE_PREFIX + key;
      try { localStorage.removeItem(k); } catch(e) {}
      _idbDel(k);
      _broadcast('del', k, null);
    },

    /** Legacy key read — reads plain localStorage key without prefix */
    legacy(key, fallback = null) {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch(e) { return fallback; }
    },

    /** Migrate a legacy key into the versioned store */
    migrate(oldKey, newKey) {
      const val = this.legacy(oldKey);
      if (val !== null) {
        this.set(newKey, val);
        localStorage.removeItem(oldKey);
      }
    },

    /** Storage health snapshot for admin inspector */
    async health() {
      const ls = (() => {
        try { return Object.keys(localStorage).length; } catch(e) { return 0; }
      })();
      const idbKeys = await _idbKeys();
      let lsBytes = 0;
      try {
        for (let k in localStorage) lsBytes += (localStorage[k]?.length || 0) * 2;
      } catch(e) {}
      return {
        lsKeys:    ls,
        idbKeys:   idbKeys.length,
        lsKB:      Math.round(lsBytes / 1024),
        lsMaxKB:   5120,
        lsPercent: Math.min(100, Math.round(lsBytes / 51200)),
        hasCookie: !!document.cookie,
        hasIDB:    !!window.indexedDB,
        hasBC:     !!_bc,
      };
    },
  };
})();

// v43 AfribStore is a KV store — preserve user-store methods from userstore.js
// if they exist, so .me(), .get(email), .setOnline() etc. still work
(function mergeAfribStores() {
  const existing = window.AfribStore;
  const kv = AfribStore;

  // If userstore.js already set up AfribStore with .me(), merge rather than replace
  if (existing && typeof existing.me === 'function') {
    // Keep all existing user-store methods, add KV methods
    window.AfribStore = Object.assign({}, existing, {
      // KV methods from v43
      set:      kv.set      || existing.set,
      get:      function(keyOrEmail) {
        // If it looks like an email, use user store
        if (typeof keyOrEmail === 'string' && keyOrEmail.includes('@')) {
          return existing.get ? existing.get(keyOrEmail) : null;
        }
        return kv.get ? kv.get(keyOrEmail) : null;
      },
      del:      kv.del      || existing.del,
      keys:     kv.keys     || existing.keys,
      migrate:  kv.migrate  || existing.migrate,
      stats:    kv.stats    || existing.stats,
    });
    // Also keep KV available under AfribKV alias
    window.AfribKV = kv;
  } else {
    // No prior user store — set v43 as-is (v66_bugfix will patch it next)
    window.AfribStore = kv;
    window.AfribKV    = kv;
  }
})();

/* Migrate legacy badge data into versioned store */
AfribStore.migrate('afrib_gift_badge_data', 'badge_data');
AfribStore.migrate('afrib_ai_config_v42',   'ai_config');
AfribStore.migrate('afrib_maintenance',      'maintenance');
AfribStore.migrate('sa_settings',            'sa_settings');


/* ═══════════════════════════════════════════════════════════════════════════
   §2  GIFT BADGE SYSTEM — TikTok-style
   ─────────────────────────────────────────────────────────────────────────
   Badge progression mirrors the reference image:
     Basic Gifter  (L1–10):  white/clear quartz crystals
     Active Gifter (L11–20): pink quartz crystals with glow ring
     Power Gifter  (L21–30): ice-blue/silver crystals, blue aura
     Elite Gifter  (L31–40): dark/obsidian crystals, gold crown ring
     Legendary     (L41–60): deep obsidian + crown, full pulse, rainbow shimmer

   Admin can set how many gifts are required to advance each level (1–10 per level).
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── Tier definitions matching the reference image ── */
const GB_TIERS = [
  {
    id: 'basic', label: 'Basic Gifter', minLevel: 1, maxLevel: 10,
    color: '#D1D5DB', glow: 'rgba(209,213,219,0.7)', accent: '#fff',
    // Canvas crystal: white/clear quartz
    crystal: { base: '#e8ecf0', mid: '#c8cdd4', shine: '#ffffff', ring: null },
  },
  {
    id: 'active', label: 'Active Gifter', minLevel: 11, maxLevel: 20,
    color: '#F472B6', glow: 'rgba(244,114,182,0.8)', accent: '#ff69b4',
    // Canvas crystal: pink quartz with gold ring
    crystal: { base: '#f9a8d4', mid: '#ec4899', shine: '#fde8f0', ring: '#D4AF37' },
  },
  {
    id: 'power', label: 'Power Gifter', minLevel: 21, maxLevel: 30,
    color: '#93C5FD', glow: 'rgba(147,197,253,0.8)', accent: '#60a5fa',
    // Canvas crystal: ice blue / silver
    crystal: { base: '#bfdbfe', mid: '#93c5fd', shine: '#ffffff', ring: '#D4AF37' },
  },
  {
    id: 'elite', label: 'Elite Gifter', minLevel: 31, maxLevel: 40,
    color: '#D4AF37', glow: 'rgba(212,175,55,0.85)', accent: '#ffd700',
    // Canvas crystal: dark obsidian with gold crown ring
    crystal: { base: '#4a4a5a', mid: '#2a2a38', shine: '#8888aa', ring: '#D4AF37', crown: true },
  },
  {
    id: 'legendary', label: 'Legendary', minLevel: 41, maxLevel: 60,
    color: '#FFD700', glow: 'rgba(255,215,0,0.95)', accent: '#ff9800',
    // Canvas crystal: deep obsidian + crown + rainbow shimmer
    crystal: { base: '#3a3a4a', mid: '#1a1a28', shine: '#aaaacc', ring: '#FFD700', crown: true, rainbow: true },
  },
];

/* ── Badge level-threshold config — admin can override ── */
const GB_THRESHOLDS_KEY = 'badge_thresholds';
const GB_DEFAULT_THRESHOLDS = {
  // giftsPerLevel: how many gifts to complete each individual level (1–60)
  // Array index 0 = level 1 threshold, etc.
  // Default: linear — 1 gift per level for early tiers, more for elite/legendary
  perLevel: [
    // L1-10  Basic: 1 gift each
    1,1,1,1,1,1,1,1,1,1,
    // L11-20 Active: 2 gifts each
    2,2,2,2,2,2,2,2,2,2,
    // L21-30 Power: 3 gifts each
    3,3,3,3,3,3,3,3,3,3,
    // L31-40 Elite: 5 gifts each
    5,5,5,5,5,5,5,5,5,5,
    // L41-60 Legendary: 10 gifts each
    10,10,10,10,10,10,10,10,10,10,
    10,10,10,10,10,10,10,10,10,10,
  ],
};

function gbGetThresholds() {
  return AfribStore.get(GB_THRESHOLDS_KEY, GB_DEFAULT_THRESHOLDS);
}

/** Compute level from raw gift count using configurable thresholds */
function gbCalcLevelV43(totalGifts) {
  const t = gbGetThresholds();
  const perLevel = t.perLevel || GB_DEFAULT_THRESHOLDS.perLevel;
  let remaining = totalGifts;
  let level = 0;
  for (let i = 0; i < perLevel.length && remaining > 0; i++) {
    const cost = perLevel[i] || 1;
    if (remaining >= cost) {
      remaining -= cost;
      level = i + 1;
    } else {
      break; // partially into this level
    }
  }
  return Math.min(level, 60);
}

/** Gifts needed from current total to reach next level */
function gbGiftsToNextLevel(totalGifts) {
  const t = gbGetThresholds();
  const perLevel = t.perLevel || GB_DEFAULT_THRESHOLDS.perLevel;
  let remaining = totalGifts;
  for (let i = 0; i < perLevel.length; i++) {
    const cost = perLevel[i] || 1;
    if (remaining >= cost) { remaining -= cost; }
    else { return cost - remaining; }
  }
  return 0; // max level
}

/** Fraction complete within the current level (0–1) */
function gbLevelProgress(totalGifts) {
  const t = gbGetThresholds();
  const perLevel = t.perLevel || GB_DEFAULT_THRESHOLDS.perLevel;
  let remaining = totalGifts;
  for (let i = 0; i < perLevel.length; i++) {
    const cost = perLevel[i] || 1;
    if (remaining >= cost) { remaining -= cost; }
    else { return remaining / cost; }
  }
  return 1;
}

function gbGetTierV43(level) {
  for (let i = GB_TIERS.length - 1; i >= 0; i--) {
    if (level >= GB_TIERS[i].minLevel) return GB_TIERS[i];
  }
  return GB_TIERS[0];
}

/* ── Badge data store ── */
function gbGetDataV43(email) {
  const all = AfribStore.get('badge_data', {});
  return all[email] || { level: 0, totalGifts: 0, coinsSpent: 0, history: [] };
}
function gbSaveDataV43(email, data) {
  const all = AfribStore.get('badge_data', {});
  all[email] = data;
  AfribStore.set('badge_data', all);
}

/** Called whenever a gift is sent */
function gbRecordGiftV43(email, coinsSpent, giftName, qty) {
  if (!email) return;
  const data = gbGetDataV43(email);
  const count = qty || 1;
  data.coinsSpent  += coinsSpent || 0;
  data.totalGifts  = (data.totalGifts || 0) + count;
  const oldLevel    = data.level || 0;
  data.level        = gbCalcLevelV43(data.totalGifts);
  data.history      = (data.history || []).slice(0, 199);
  data.history.unshift({ giftName, coinsSpent, qty: count, time: Date.now() });
  gbSaveDataV43(email, data);

  const leveledUp = data.level > oldLevel;
  _gbShowSendEffect(giftName, data.level, leveledUp);
  if (leveledUp) _gbShowLevelUpOverlay(data.level, gbGetTierV43(data.level));
  if (document.getElementById('gb-tiktok-panel')) gbRenderTikTokPanel(email);
}

/* ── Crystal canvas renderer — draws quartz crystal per tier ── */
function gbDrawCrystal(canvas, tier, level, animated) {
  const ctx = canvas.getContext('2d');
  const S = canvas.width;
  const cx = S / 2, cy = S * 0.52;
  const sc = S / 100;
  let t = 0;

  function draw() {
    ctx.clearRect(0, 0, S, S);
    const pulse = animated ? (Math.sin(t * 0.06) * 0.06 + 1) : 1;
    const shimmer = animated ? Math.sin(t * 0.04) : 0;
    t++;

    const c = tier.crystal;

    // ── Glow ring (Active / Power / Elite / Legendary)
    if (c.ring) {
      const ringGrad = ctx.createRadialGradient(cx, cy, sc * 12, cx, cy, sc * 42);
      ringGrad.addColorStop(0, c.ring + '55');
      ringGrad.addColorStop(0.6, c.ring + '33');
      ringGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = ringGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, sc * 42 * pulse, 0, Math.PI * 2);
      ctx.fill();

      // Gold ring band
      ctx.strokeStyle = c.ring;
      ctx.lineWidth = sc * 3.5;
      ctx.globalAlpha = 0.7 + shimmer * 0.15;
      ctx.beginPath();
      ctx.ellipse(cx, cy + sc * 20, sc * 36, sc * 9, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // ── Rainbow shimmer overlay for legendary
    if (c.rainbow && animated) {
      const hue = (t * 2) % 360;
      ctx.fillStyle = `hsla(${hue}, 100%, 60%, 0.08)`;
      ctx.beginPath();
      ctx.arc(cx, cy, sc * 40, 0, Math.PI * 2);
      ctx.fill();
    }

    // ── Crystal body — 5 main spires + base cluster
    const spires = [
      { x: 0,        y: -sc*28*pulse, w: sc*12, h: sc*44*pulse, angle: 0 },
      { x: -sc*14,   y: -sc*18*pulse, w: sc*9,  h: sc*34*pulse, angle: -0.18 },
      { x: sc*14,    y: -sc*18*pulse, w: sc*9,  h: sc*34*pulse, angle:  0.18 },
      { x: -sc*24,   y: -sc*8*pulse,  w: sc*7,  h: sc*22*pulse, angle: -0.32 },
      { x: sc*24,    y: -sc*8*pulse,  w: sc*7,  h: sc*22*pulse, angle:  0.32 },
    ];

    spires.forEach((sp, i) => {
      ctx.save();
      ctx.translate(cx + sp.x, cy + sc * 20);
      ctx.rotate(sp.angle);

      // Body gradient
      const bodyGrad = ctx.createLinearGradient(-sp.w, sp.y - cy - sc*20, sp.w, 0);
      bodyGrad.addColorStop(0, c.shine);
      bodyGrad.addColorStop(0.3, c.base);
      bodyGrad.addColorStop(0.7, c.mid);
      bodyGrad.addColorStop(1, c.mid + 'cc');

      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.moveTo(0, sp.y - cy - sc * 20);       // tip
      ctx.lineTo(-sp.w * 0.7, -sp.h * 0.35);
      ctx.lineTo(-sp.w, 0);
      ctx.lineTo(sp.w, 0);
      ctx.lineTo(sp.w * 0.7, -sp.h * 0.35);
      ctx.closePath();
      ctx.fill();

      // Inner shine facet
      ctx.fillStyle = c.shine + '55';
      ctx.beginPath();
      ctx.moveTo(sp.w * 0.15, sp.y - cy - sc * 18);
      ctx.lineTo(sp.w * 0.55, -sp.h * 0.3);
      ctx.lineTo(sp.w * 0.45, -sp.h * 0.1);
      ctx.lineTo(0, sp.y - cy - sc * 18);
      ctx.closePath();
      ctx.fill();

      // Edge outline
      ctx.strokeStyle = c.ring || c.mid;
      ctx.lineWidth = sc * 0.6;
      ctx.globalAlpha = 0.35;
      ctx.stroke();
      ctx.globalAlpha = 1;

      ctx.restore();
    });

    // ── Base platform / cluster
    const baseGrad = ctx.createEllipse
      ? null
      : ctx.createRadialGradient(cx, cy + sc * 20, sc * 2, cx, cy + sc * 22, sc * 38);
    if (baseGrad) {
      baseGrad.addColorStop(0, c.base + 'cc');
      baseGrad.addColorStop(0.5, c.mid + '88');
      baseGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = baseGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy + sc * 22, sc * 36, sc * 10, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // ── Crown (Elite + Legendary)
    if (c.crown) {
      const crownY = cy - sc * 46 * pulse;
      ctx.fillStyle = '#D4AF37';
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = sc * 1.2;
      // Crown base
      ctx.beginPath();
      ctx.roundRect
        ? ctx.roundRect(cx - sc*14, crownY + sc*10, sc*28, sc*9, sc*2)
        : ctx.rect(cx - sc*14, crownY + sc*10, sc*28, sc*9);
      ctx.fill();
      ctx.stroke();
      // Crown points (3)
      [[-10, -8], [0, -14], [10, -8]].forEach(([dx, dy]) => {
        ctx.beginPath();
        ctx.moveTo(cx + dx * sc, crownY + sc * 10);
        ctx.lineTo(cx + dx * sc, crownY + dy * sc);
        ctx.lineTo(cx + (dx + 4) * sc, crownY + sc * 10);
        ctx.fill();
      });
      // Crown gems
      const gemColors = ['#ff69b4', '#FFD700', '#60a5fa'];
      [[-10, 3], [0, 3], [10, 3]].forEach(([dx, dy], gi) => {
        ctx.fillStyle = gemColors[gi];
        ctx.beginPath();
        ctx.arc(cx + dx * sc, crownY + (sc * 10 + sc * dy), sc * 2.5, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // ── Level number — TikTok style bottom badge
    const tierColor = tier.color;
    ctx.fillStyle = '#000000aa';
    ctx.beginPath();
    if (ctx.roundRect)
      ctx.roundRect(cx - sc*16, cy + sc*30, sc*32, sc*14, sc*7);
    else
      ctx.rect(cx - sc*16, cy + sc*30, sc*32, sc*14);
    ctx.fill();
    ctx.fillStyle = tierColor;
    ctx.font = `900 ${sc*10}px 'DM Sans', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`Lv.${level}`, cx, cy + sc * 37);
  }

  if (animated) {
    const timer = setInterval(draw, 1000 / 30);
    return timer;
  } else {
    draw();
    return null;
  }
}

/* ── Level-up overlay (TikTok style full-screen) ── */
function _gbShowLevelUpOverlay(level, tier) {
  const el = document.createElement('div');
  el.id = 'gb-levelup-overlay';
  el.style.cssText = `
    position:fixed;inset:0;z-index:9999;
    background:radial-gradient(circle at 50% 40%,rgba(0,0,0,.85) 0%,rgba(0,0,0,.95) 100%);
    display:flex;flex-direction:column;align-items:center;justify-content:center;
    font-family:'DM Sans',sans-serif;
    animation:gbLvlFadeIn .4s ease;
  `;
  el.innerHTML = `
    <style>
      @keyframes gbLvlFadeIn { from{opacity:0;transform:scale(.9)} to{opacity:1;transform:scale(1)} }
      @keyframes gbLvlShake  { 0%,100%{transform:rotate(0)} 25%{transform:rotate(-4deg)} 75%{transform:rotate(4deg)} }
      @keyframes gbLvlFloat  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
      @keyframes gbStarPop   { 0%{transform:scale(0) rotate(0)} 60%{transform:scale(1.4) rotate(180deg)} 100%{transform:scale(1) rotate(360deg);opacity:0} }
    </style>
    <div style="font-size:13px;letter-spacing:3px;text-transform:uppercase;color:${tier.color};font-weight:900;margin-bottom:12px;opacity:.8">
      LEVEL UP!
    </div>
    <canvas id="gb-lvlup-canvas" width="160" height="160"></canvas>
    <div style="font-size:42px;font-weight:900;color:#fff;margin:16px 0 6px;
                text-shadow:0 0 30px ${tier.color};animation:gbLvlFloat 2s ease infinite">
      Level ${level}
    </div>
    <div style="font-size:18px;font-weight:700;color:${tier.color};margin-bottom:6px">${tier.label}</div>
    <div style="font-size:13px;color:rgba(255,255,255,.5);margin-bottom:32px;max-width:260px;text-align:center">
      You've reached a new gifter rank!
    </div>
    <div style="display:flex;gap:8px">
      ${'⭐'.repeat(Math.min(5, Math.ceil(level / 12)))}
    </div>
    <button onclick="safeRemoveEl('gb-levelup-overlay')"
            style="margin-top:28px;padding:12px 32px;background:linear-gradient(135deg,${tier.color},${tier.accent || tier.color});
                   border:none;border-radius:24px;color:#000;font-size:15px;font-weight:900;cursor:pointer">
      Awesome! 🔥
    </button>
  `;
  document.body.appendChild(el);

  // Render crystal in the overlay canvas
  setTimeout(() => {
    const c = document.getElementById('gb-lvlup-canvas');
    if (c) gbDrawCrystal(c, tier, level, true);
  }, 50);

  // Auto-dismiss after 5s
  setTimeout(() => { if (el.parentNode) el.remove(); }, 5000);
}

/* ── XP send effect (coins rising, like TikTok gift animation) ── */
function _gbShowSendEffect(giftName, level, leveledUp) {
  const el = document.createElement('div');
  el.className = 'gb-send-fx';
  el.style.cssText = `
    position:fixed;bottom:120px;left:50%;transform:translateX(-50%);
    z-index:8000;pointer-events:none;
    display:flex;align-items:center;gap:8px;
    background:rgba(0,0,0,.75);border:1px solid rgba(255,215,0,.4);
    border-radius:24px;padding:10px 18px;
    font-family:'DM Sans',sans-serif;font-size:14px;font-weight:800;color:#FFD700;
    animation:gbSendFx 2s ease forwards;
  `;
  el.innerHTML = leveledUp
    ? `🎁 Gift sent! &nbsp;<span style="color:#4ade80">Level Up → ${level} ⬆️</span>`
    : `🎁 Gift sent! &nbsp;Level ${level}`;
  const style = document.createElement('style');
  style.textContent = `@keyframes gbSendFx{0%{opacity:0;transform:translateX(-50%) translateY(20px)}15%{opacity:1;transform:translateX(-50%) translateY(0)}75%{opacity:1}100%{opacity:0;transform:translateX(-50%) translateY(-30px)}}`;
  el.appendChild(style);
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2100);
}

/* ═══════════════════════════════════════════════════════════════════════════
   §2b  TIKTOK-STYLE BADGE PANEL
   ─────────────────────────────────────────────────────────────────────────
   Shows ONLY the level badges in a clean vertical scroll — exactly like
   TikTok's Gifter/Diamond ranking UI. No verbose stats — just the
   crystal badge, level number, and tier name.
   ═══════════════════════════════════════════════════════════════════════════ */

/* Inject TikTok badge styles */
(function injectTikTokBadgeStyles() {
  if (document.getElementById('gb-tt-styles')) return;
  const s = document.createElement('style');
  s.id = 'gb-tt-styles';
  s.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700;800;900&display=swap');

  /* ════ TIKTOK BADGE PANEL ════ */
  #gb-tiktok-panel {
    background: #0a0a0f;
    font-family: 'DM Sans', sans-serif;
    min-height: 100%;
  }

  /* Hero section — current badge large */
  .gb-tt-hero {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 28px 20px 20px;
    background: radial-gradient(ellipse at 50% 0%, rgba(255,215,0,.12) 0%, transparent 65%);
  }
  .gb-tt-hero-canvas-wrap {
    position: relative;
    margin-bottom: 14px;
  }
  .gb-tt-hero canvas {
    display: block;
  }
  .gb-tt-hero-ring {
    position: absolute;
    inset: -10px;
    border-radius: 50%;
    border: 2px solid transparent;
    background: linear-gradient(#0a0a0f, #0a0a0f) padding-box,
                conic-gradient(from 0deg, transparent 30%, gold 50%, transparent 70%) border-box;
    animation: gbRingRotate 3s linear infinite;
    pointer-events: none;
  }
  @keyframes gbRingRotate { to { transform: rotate(360deg); } }
  .gb-tt-tier-name {
    font-size: 20px;
    font-weight: 900;
    margin-bottom: 4px;
  }
  .gb-tt-level-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(255,255,255,.06);
    border: 1px solid rgba(255,255,255,.12);
    border-radius: 20px;
    padding: 5px 14px;
    font-size: 13px;
    font-weight: 700;
    color: rgba(255,255,255,.8);
    margin-bottom: 14px;
  }

  /* Progress bar */
  .gb-tt-progress {
    width: 100%;
    max-width: 300px;
    margin: 0 auto 6px;
  }
  .gb-tt-prog-track {
    background: rgba(255,255,255,.07);
    border-radius: 6px;
    height: 6px;
    overflow: hidden;
    margin-bottom: 5px;
  }
  .gb-tt-prog-fill {
    height: 100%;
    border-radius: 6px;
    transition: width .8s cubic-bezier(.34,1.56,.64,1);
  }
  .gb-tt-prog-label {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: rgba(255,255,255,.35);
  }

  /* Stats strip */
  .gb-tt-stats {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid rgba(255,255,255,.06);
    width: 100%;
  }
  .gb-tt-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }
  .gb-tt-stat-val {
    font-size: 18px;
    font-weight: 900;
    color: #FFD700;
  }
  .gb-tt-stat-lbl {
    font-size: 10px;
    color: rgba(255,255,255,.35);
    text-transform: uppercase;
    letter-spacing: .5px;
  }

  /* Section title */
  .gb-tt-section-title {
    padding: 20px 20px 10px;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: rgba(255,255,255,.35);
  }

  /* Badge scroll strip — horizontal scroll TikTok style */
  .gb-tt-strip {
    display: flex;
    overflow-x: auto;
    gap: 12px;
    padding: 4px 20px 16px;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
  }
  .gb-tt-strip::-webkit-scrollbar { display: none; }

  /* Individual badge card */
  .gb-tt-badge-card {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    cursor: default;
    position: relative;
    transition: transform .2s;
  }
  .gb-tt-badge-card:active { transform: scale(.96); }
  .gb-tt-badge-card canvas {
    display: block;
    border-radius: 16px;
    transition: filter .3s;
  }
  .gb-tt-badge-card.locked canvas {
    filter: grayscale(.9) brightness(.4);
  }
  .gb-tt-badge-card.current canvas {
    filter: drop-shadow(0 0 10px var(--gb-glow));
  }
  .gb-tt-badge-lbl {
    font-size: 10px;
    font-weight: 700;
    color: rgba(255,255,255,.6);
    white-space: nowrap;
  }
  .gb-tt-badge-card.current .gb-tt-badge-lbl {
    color: #fff;
  }
  .gb-tt-badge-card.locked .gb-tt-badge-lbl {
    color: rgba(255,255,255,.25);
  }
  .gb-tt-badge-current-dot {
    position: absolute;
    top: -4px;
    right: -4px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #FFD700;
    border: 2px solid #0a0a0f;
    box-shadow: 0 0 6px #FFD700;
  }
  .gb-tt-badge-lock {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 16px;
    pointer-events: none;
  }

  /* Tier group header inside strip */
  .gb-tt-tier-header {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 4px;
    background: rgba(255,255,255,.03);
    border: 1px solid rgba(255,255,255,.06);
    border-radius: 16px;
    padding: 10px 14px;
    min-width: 70px;
  }
  .gb-tt-tier-header-name {
    font-size: 9px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: .8px;
    text-align: center;
  }
  .gb-tt-tier-header-range {
    font-size: 9px;
    color: rgba(255,255,255,.3);
  }

  /* Send gift CTA */
  .gb-tt-cta {
    margin: 4px 20px 20px;
    background: linear-gradient(135deg, rgba(255,215,0,.12), rgba(255,107,157,.08));
    border: 1.5px solid rgba(255,215,0,.25);
    border-radius: 18px;
    padding: 16px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .gb-tt-cta-text {
    font-size: 13px;
    color: rgba(255,255,255,.7);
    line-height: 1.4;
  }
  .gb-tt-cta-text b { color: #FFD700; }
  .gb-tt-cta-btn {
    flex-shrink: 0;
    background: linear-gradient(135deg, #FFD700, #FF9800);
    border: none;
    border-radius: 20px;
    padding: 10px 18px;
    color: #000;
    font-size: 13px;
    font-weight: 900;
    cursor: pointer;
    transition: all .2s;
    white-space: nowrap;
  }
  .gb-tt-cta-btn:hover { transform: scale(1.04); box-shadow: 0 4px 16px rgba(255,215,0,.4); }
  `;
  document.head.appendChild(s);
})();

/* Active canvas timers */
const _gbCanvasTimers = {};
function _gbClearCanvasTimers() {
  Object.values(_gbCanvasTimers).forEach(t => t && clearInterval(t));
  Object.keys(_gbCanvasTimers).forEach(k => delete _gbCanvasTimers[k]);
}

/** Main render — TikTok-style panel */
function gbRenderTikTokPanel(email, containerId) {
  _gbClearCanvasTimers();

  const container = containerId
    ? (typeof containerId === 'string' ? document.getElementById(containerId) : containerId)
    : document.getElementById('gb-tiktok-panel')?.parentElement;
  if (!container) return;

  const data    = gbGetDataV43(email || window.currentUser?.email || '');
  const level   = data.level || 0;
  const tier    = level > 0 ? gbGetTierV43(level) : GB_TIERS[0];
  const prog    = gbLevelProgress(data.totalGifts || 0);
  const toNext  = gbGiftsToNextLevel(data.totalGifts || 0);
  const thresholds = gbGetThresholds();

  container.innerHTML = `<div id="gb-tiktok-panel">

    <!-- ── HERO ── -->
    <div class="gb-tt-hero">
      <div class="gb-tt-hero-canvas-wrap">
        <canvas id="gb-hero-canvas" width="140" height="140"></canvas>
        <div class="gb-tt-hero-ring"></div>
      </div>
      <div class="gb-tt-tier-name" style="color:${tier.color}">${tier.label}</div>
      <div class="gb-tt-level-tag">
        🏅 Level ${level} &nbsp;·&nbsp; ${data.totalGifts || 0} gifts sent
      </div>
      ${level < 60 ? `
      <div class="gb-tt-progress">
        <div class="gb-tt-prog-track">
          <div class="gb-tt-prog-fill"
               style="width:${Math.round(prog * 100)}%;background:linear-gradient(90deg,${tier.color},${tier.accent || tier.color})"></div>
        </div>
        <div class="gb-tt-prog-label">
          <span>Level ${level}</span>
          <span>${toNext} gift${toNext !== 1 ? 's' : ''} to Level ${level + 1}</span>
        </div>
      </div>` : `<div style="color:#FFD700;font-size:13px;font-weight:800">🏆 MAX LEVEL REACHED</div>`}
      <div class="gb-tt-stats">
        <div class="gb-tt-stat">
          <div class="gb-tt-stat-val">${level}</div>
          <div class="gb-tt-stat-lbl">Level</div>
        </div>
        <div class="gb-tt-stat">
          <div class="gb-tt-stat-val">${(data.totalGifts || 0).toLocaleString()}</div>
          <div class="gb-tt-stat-lbl">Gifts</div>
        </div>
        <div class="gb-tt-stat">
          <div class="gb-tt-stat-val">${(data.coinsSpent || 0).toLocaleString()}</div>
          <div class="gb-tt-stat-lbl">Coins</div>
        </div>
      </div>
    </div>

    <!-- ── BADGE STRIPS per tier ── -->
    <div class="gb-tt-section-title">All Ranks</div>

    ${GB_TIERS.map(t => {
      const unlocked = level >= t.minLevel;
      const levelRange = Array.from({ length: t.maxLevel - t.minLevel + 1 }, (_, i) => t.minLevel + i);
      // Show key milestone levels: min, 25%, 50%, 75%, max
      const milestones = [
        t.minLevel,
        Math.round(t.minLevel + (t.maxLevel - t.minLevel) * 0.25),
        Math.round(t.minLevel + (t.maxLevel - t.minLevel) * 0.5),
        Math.round(t.minLevel + (t.maxLevel - t.minLevel) * 0.75),
        t.maxLevel,
      ].filter((v, i, a) => a.indexOf(v) === i);

      return `
      <div class="gb-tt-strip" id="gb-strip-${t.id}">
        <div class="gb-tt-tier-header" style="--gb-tier-color:${t.color}">
          <div class="gb-tt-tier-header-name" style="color:${t.color}">${t.label.replace(' Gifter','')}</div>
          <div class="gb-tt-tier-header-range">Lv.${t.minLevel}–${t.maxLevel}</div>
        </div>
        ${milestones.map(lv => {
          const isUnlocked = level >= lv;
          const isCurrent  = level === lv;
          const cls = isCurrent ? 'current' : isUnlocked ? 'unlocked' : 'locked';
          return `
          <div class="gb-tt-badge-card ${cls}" style="--gb-glow:${t.glow}"
               data-tier="${t.id}" data-level="${lv}">
            ${isCurrent ? '<div class="gb-tt-badge-current-dot"></div>' : ''}
            ${!isUnlocked ? '<div class="gb-tt-badge-lock">🔒</div>' : ''}
            <canvas class="gb-badge-canvas" width="72" height="72"
                    data-tier-id="${t.id}" data-level="${lv}" data-unlocked="${isUnlocked}"></canvas>
            <div class="gb-tt-badge-lbl">Lv.${lv}</div>
          </div>`;
        }).join('')}
      </div>`;
    }).join('')}

    <!-- ── CTA ── -->
    <div class="gb-tt-cta">
      <div class="gb-tt-cta-text">
        ${level < 60
          ? `Send <b>${toNext} more gift${toNext !== 1 ? 's' : ''}</b> to reach<br>Level ${level + 1} — ${gbGetTierV43(level + 1).label}`
          : `<b>You are a Legend!</b><br>Maximum gifter rank achieved 🏆`}
      </div>
      ${level < 60 ? `<button class="gb-tt-cta-btn" onclick="if(typeof openGiftMe==='function')openGiftMe(window._currentProfileUser||window.currentUser,'badge')">🎁 Send Gift</button>` : ''}
    </div>

  </div>`;

  // Render hero crystal
  setTimeout(() => {
    const hero = document.getElementById('gb-hero-canvas');
    if (hero && level > 0) {
      _gbCanvasTimers['hero'] = gbDrawCrystal(hero, tier, level, true);
    } else if (hero) {
      // Level 0 — draw first tier plain
      gbDrawCrystal(hero, GB_TIERS[0], 0, false);
    }

    // Render all badge strip crystals
    document.querySelectorAll('.gb-badge-canvas').forEach(c => {
      const tierId   = c.dataset.tierId;
      const lv       = parseInt(c.dataset.level);
      const unlocked = c.dataset.unlocked === 'true';
      const bTier    = GB_TIERS.find(t => t.id === tierId) || GB_TIERS[0];
      const key      = tierId + '_' + lv;
      _gbCanvasTimers[key] = gbDrawCrystal(c, bTier, lv, unlocked && (level === lv));
    });
  }, 60);
}

/** Auto-scroll strip to show current badge */
function gbScrollToCurrent(level) {
  const tier = gbGetTierV43(level);
  const strip = document.getElementById(`gb-strip-${tier.id}`);
  if (!strip) return;
  const current = strip.querySelector('.gb-tt-badge-card.current canvas');
  if (current) {
    setTimeout(() => current.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }), 300);
  }
}


/* ═══════════════════════════════════════════════════════════════════════════
   §3  ADMIN — BADGE THRESHOLD EDITOR
   ─────────────────────────────────────────────────────────────────────────
   Super-admin can set how many gifts are required for each level tier.
   UI: one number input per tier (applies to all levels in that tier).
   Advanced mode: per-level override grid.
   ═══════════════════════════════════════════════════════════════════════════ */

(function injectThresholdEditorStyles() {
  if (document.getElementById('gb-admin-styles')) return;
  const s = document.createElement('style');
  s.id = 'gb-admin-styles';
  s.textContent = `
  #gb-admin-panel {
    background: rgba(255,255,255,.04);
    border: 1.5px solid rgba(255,215,0,.2);
    border-radius: 18px;
    padding: 22px;
    margin: 20px 0;
    font-family: 'DM Sans', sans-serif;
  }
  .gb-admin-title  { font-size:16px;font-weight:900;color:#fff;margin:0 0 4px; }
  .gb-admin-sub    { font-size:12px;color:rgba(255,255,255,.45);margin:0 0 18px; }

  .gb-admin-tier-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 12px;
    margin-bottom: 16px;
  }
  .gb-admin-tier-card {
    background: rgba(255,255,255,.04);
    border: 1px solid rgba(255,255,255,.09);
    border-radius: 14px;
    padding: 14px;
  }
  .gb-admin-tier-label {
    font-size: 12px;
    font-weight: 800;
    margin-bottom: 8px;
  }
  .gb-admin-tier-desc {
    font-size: 10px;
    color: rgba(255,255,255,.35);
    margin-bottom: 8px;
  }
  .gb-admin-input {
    width: 100%;
    box-sizing: border-box;
    background: rgba(255,255,255,.07);
    border: 1px solid rgba(255,255,255,.12);
    border-radius: 8px;
    padding: 8px 12px;
    color: #fff;
    font-size: 14px;
    font-weight: 700;
    outline: none;
    transition: border .2s;
  }
  .gb-admin-input:focus { border-color: rgba(255,215,0,.5); }
  .gb-admin-note {
    font-size: 10px;
    color: rgba(255,255,255,.3);
    margin-top: 4px;
  }

  .gb-admin-save-btn {
    background: linear-gradient(135deg, #D4AF37, #FF9800);
    border: none;
    border-radius: 12px;
    padding: 12px 28px;
    color: #000;
    font-size: 14px;
    font-weight: 900;
    cursor: pointer;
    transition: all .2s;
    margin-right: 8px;
  }
  .gb-admin-save-btn:hover { transform: scale(1.03); box-shadow: 0 4px 16px rgba(255,215,0,.4); }
  .gb-admin-reset-btn {
    background: rgba(255,255,255,.06);
    border: 1px solid rgba(255,255,255,.12);
    border-radius: 12px;
    padding: 12px 20px;
    color: rgba(255,255,255,.6);
    font-size: 13px;
    cursor: pointer;
    transition: all .2s;
  }
  .gb-admin-reset-btn:hover { background: rgba(255,255,255,.1); }

  .gb-admin-preview {
    background: rgba(255,215,0,.05);
    border: 1px solid rgba(255,215,0,.15);
    border-radius: 12px;
    padding: 12px 16px;
    margin-top: 16px;
    font-size: 12px;
    color: rgba(255,255,255,.6);
    line-height: 1.8;
  }
  .gb-admin-preview b { color: #FFD700; }
  `;
  document.head.appendChild(s);
})();

function saRenderBadgeThresholdEditor(containerId) {
  const container = typeof containerId === 'string'
    ? document.getElementById(containerId) : containerId;
  if (!container) return;

  const t = gbGetThresholds();
  // Compute per-tier average (used as simple tier-level input)
  const tierAverages = GB_TIERS.map(tier => {
    const slice = t.perLevel.slice(tier.minLevel - 1, tier.maxLevel);
    const avg = Math.round(slice.reduce((a, b) => a + b, 0) / slice.length);
    return { ...tier, giftsPerLevel: avg };
  });

  container.innerHTML = `
  <div id="gb-admin-panel">
    <div class="gb-admin-title">🏅 Gift Badge — Level Thresholds</div>
    <div class="gb-admin-sub">Set how many gifts users must send to advance each level tier</div>

    <div class="gb-admin-tier-grid">
      ${tierAverages.map(tier => `
      <div class="gb-admin-tier-card">
        <div class="gb-admin-tier-label" style="color:${tier.color}">${tier.label}</div>
        <div class="gb-admin-tier-desc">Levels ${tier.minLevel}–${tier.maxLevel}</div>
        <input type="number" min="1" max="100"
               class="gb-admin-input" id="gb-thr-${tier.id}"
               value="${tier.giftsPerLevel}"/>
        <div class="gb-admin-note">gifts required per level</div>
      </div>`).join('')}
    </div>

    <div>
      <button class="gb-admin-save-btn" onclick="saSaveBadgeThresholds()">💾 Save Thresholds</button>
      <button class="gb-admin-reset-btn" onclick="saResetBadgeThresholds()">↺ Reset to Defaults</button>
    </div>

    <div class="gb-admin-preview" id="gb-thr-preview">
      ${_gbThresholdPreview(tierAverages)}
    </div>
  </div>`;

  // Live preview on input change
  container.querySelectorAll('.gb-admin-input').forEach(inp => {
    inp.addEventListener('input', () => {
      const preview = document.getElementById('gb-thr-preview');
      if (preview) {
        const live = GB_TIERS.map(tier => ({
          ...tier,
          giftsPerLevel: parseInt(document.getElementById(`gb-thr-${tier.id}`)?.value || 1),
        }));
        preview.innerHTML = _gbThresholdPreview(live);
      }
    });
  });
}

function _gbThresholdPreview(tierAverages) {
  let total = 0;
  const rows = tierAverages.map(tier => {
    const levels = tier.maxLevel - tier.minLevel + 1;
    const sub    = tier.giftsPerLevel * levels;
    total += sub;
    return `<b style="color:${tier.color}">${tier.label}</b>: ${tier.giftsPerLevel} gift${tier.giftsPerLevel !== 1 ? 's' : ''}/level × ${levels} levels = ${sub} gifts`;
  });
  return rows.join('<br>') + `<br><b style="color:#FFD700">Total gifts for Level 60: ${total}</b>`;
}

window.saSaveBadgeThresholds = function() {
  const perLevel = [];
  GB_TIERS.forEach(tier => {
    const val = Math.max(1, Math.min(100, parseInt(document.getElementById(`gb-thr-${tier.id}`)?.value || 1)));
    const levels = tier.maxLevel - tier.minLevel + 1;
    for (let i = 0; i < levels; i++) perLevel.push(val);
  });
  AfribStore.set(GB_THRESHOLDS_KEY, { perLevel });
  if (typeof toastSa === 'function') toastSa('✅ Badge thresholds saved — users\' levels will recalculate on next gift');
  else alert('Thresholds saved!');
};

window.saResetBadgeThresholds = function() {
  if (!confirm('Reset to default thresholds?')) return;
  AfribStore.del(GB_THRESHOLDS_KEY);
  const container = document.getElementById('gb-admin-panel')?.parentElement;
  if (container) saRenderBadgeThresholdEditor(container);
  if (typeof toastSa === 'function') toastSa('↺ Badge thresholds reset to defaults');
};


/* ═══════════════════════════════════════════════════════════════════════════
   §4  UPGRADED FULL CONFIGURATION PANEL (superadmin)
   ─────────────────────────────────────────────────────────────────────────
   Sections: Storage Inspector · AI Config · Badge Thresholds ·
             Platform Settings · Connectivity Tests · Export/Import
   ═══════════════════════════════════════════════════════════════════════════ */

(function injectFullConfigStyles() {
  if (document.getElementById('sa-cfg-styles')) return;
  const s = document.createElement('style');
  s.id = 'sa-cfg-styles';
  s.textContent = `
  .sa-cfg-panel {
    font-family: 'DM Sans', sans-serif;
    margin: 0 0 20px;
  }
  .sa-cfg-tabs {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 20px;
    border-bottom: 1px solid rgba(255,255,255,.08);
    padding-bottom: 12px;
  }
  .sa-cfg-tab {
    padding: 8px 16px;
    border-radius: 20px;
    background: rgba(255,255,255,.06);
    border: 1px solid rgba(255,255,255,.1);
    color: rgba(255,255,255,.55);
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: all .2s;
  }
  .sa-cfg-tab.active {
    background: rgba(212,175,55,.15);
    border-color: rgba(212,175,55,.4);
    color: #D4AF37;
  }
  .sa-cfg-section { display: none; }
  .sa-cfg-section.visible { display: block; }

  /* Storage inspector */
  .sa-storage-bar {
    background: rgba(255,255,255,.06);
    border-radius: 8px;
    height: 12px;
    overflow: hidden;
    margin: 8px 0;
  }
  .sa-storage-fill {
    height: 100%;
    border-radius: 8px;
    transition: width .6s;
  }
  .sa-storage-stat-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-top: 12px;
  }
  .sa-storage-stat {
    background: rgba(255,255,255,.04);
    border: 1px solid rgba(255,255,255,.08);
    border-radius: 12px;
    padding: 12px;
    text-align: center;
  }
  .sa-storage-stat-val {
    font-size: 20px;
    font-weight: 900;
    color: #D4AF37;
  }
  .sa-storage-stat-lbl {
    font-size: 10px;
    color: rgba(255,255,255,.4);
    margin-top: 2px;
    text-transform: uppercase;
  }
  .sa-storage-layer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid rgba(255,255,255,.05);
    font-size: 13px;
  }
  .sa-storage-layer-badge {
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 700;
  }
  .sa-badge-ok    { background: rgba(34,197,94,.15);  color: #4ade80; }
  .sa-badge-warn  { background: rgba(251,191,36,.15); color: #fbbf24; }
  .sa-badge-na    { background: rgba(255,255,255,.06); color: rgba(255,255,255,.35); }

  /* Config fields */
  .sa-cfg-field { margin-bottom: 14px; }
  .sa-cfg-label {
    font-size: 12px;
    font-weight: 700;
    color: rgba(255,255,255,.55);
    display: block;
    margin-bottom: 5px;
  }
  .sa-cfg-input {
    width: 100%;
    box-sizing: border-box;
    background: rgba(255,255,255,.06);
    border: 1px solid rgba(255,255,255,.12);
    border-radius: 10px;
    padding: 10px 14px;
    color: #fff;
    font-size: 13px;
    outline: none;
    font-family: inherit;
    transition: border .2s;
  }
  .sa-cfg-input:focus { border-color: rgba(212,175,55,.4); }
  .sa-cfg-input.valid   { border-color: rgba(34,197,94,.5); }
  .sa-cfg-input.invalid { border-color: rgba(239,68,68,.5); }
  .sa-cfg-note {
    font-size: 10px;
    color: rgba(255,255,255,.3);
    margin-top: 4px;
  }
  .sa-cfg-save-btn {
    background: linear-gradient(135deg, #D4AF37, #E85D26);
    border: none;
    border-radius: 12px;
    padding: 12px 28px;
    color: #000;
    font-size: 14px;
    font-weight: 900;
    cursor: pointer;
    transition: all .2s;
    margin-top: 8px;
  }
  .sa-cfg-save-btn:hover { transform: scale(1.03); box-shadow: 0 4px 16px rgba(212,175,55,.4); }

  /* Connectivity test results */
  .sa-conn-result {
    padding: 10px 14px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 600;
    margin-top: 8px;
    min-height: 36px;
    transition: all .3s;
  }
  .sa-conn-result.idle    { background:rgba(255,255,255,.03); color:rgba(255,255,255,.35); }
  .sa-conn-result.testing { background:rgba(99,102,241,.1);   color:#818cf8; }
  .sa-conn-result.ok      { background:rgba(34,197,94,.1);    color:#4ade80; border:1px solid rgba(34,197,94,.3); }
  .sa-conn-result.fail    { background:rgba(239,68,68,.1);    color:#f87171; border:1px solid rgba(239,68,68,.3); }

  /* Export/import */
  .sa-export-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 12px;
  }
  .sa-export-btn {
    background: rgba(255,255,255,.05);
    border: 1px solid rgba(255,255,255,.1);
    border-radius: 12px;
    padding: 14px;
    color: #fff;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: all .2s;
    text-align: center;
  }
  .sa-export-btn:hover { background: rgba(255,255,255,.09); border-color: rgba(212,175,55,.3); color: #D4AF37; }
  `;
  document.head.appendChild(s);
})();

function saRenderFullConfigPanel(containerId) {
  const container = typeof containerId === 'string'
    ? document.getElementById(containerId) : containerId;
  if (!container) return;

  container.innerHTML = `
  <div class="sa-cfg-panel" id="sa-full-cfg">
    <div class="sa-cfg-tabs">
      <button class="sa-cfg-tab active" onclick="saCfgTab(this,'storage')">💾 Storage</button>
      <button class="sa-cfg-tab" onclick="saCfgTab(this,'badges')">🏅 Badges</button>
      <button class="sa-cfg-tab" onclick="saCfgTab(this,'ai')">🤖 AI Config</button>
      <button class="sa-cfg-tab" onclick="saCfgTab(this,'platform')">⚙️ Platform</button>
      <button class="sa-cfg-tab" onclick="saCfgTab(this,'connectivity')">🔌 Connectivity</button>
      <button class="sa-cfg-tab" onclick="saCfgTab(this,'export')">📦 Export / Import</button>
    </div>

    <!-- STORAGE -->
    <div class="sa-cfg-section visible" id="sa-cfg-storage">
      <div id="sa-storage-inspector-inner">Loading…</div>
    </div>

    <!-- BADGES -->
    <div class="sa-cfg-section" id="sa-cfg-badges">
      <div id="sa-badge-thr-container"></div>
    </div>

    <!-- AI CONFIG -->
    <div class="sa-cfg-section" id="sa-cfg-ai">
      <div id="sa-ai-config-container-v43"></div>
    </div>

    <!-- PLATFORM -->
    <div class="sa-cfg-section" id="sa-cfg-platform">
      ${_buildPlatformSection()}
    </div>

    <!-- CONNECTIVITY -->
    <div class="sa-cfg-section" id="sa-cfg-connectivity">
      ${_buildConnectivitySection()}
    </div>

    <!-- EXPORT -->
    <div class="sa-cfg-section" id="sa-cfg-export">
      ${_buildExportSection()}
    </div>
  </div>`;

  // Load async sections
  saRefreshStorageInspector();
  saRenderBadgeThresholdEditor('sa-badge-thr-container');
  if (typeof saRenderAiConfigPanel === 'function')
    saRenderAiConfigPanel('sa-ai-config-container-v43');
}

window.saCfgTab = function(btn, section) {
  document.querySelectorAll('.sa-cfg-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.sa-cfg-section').forEach(s => s.classList.remove('visible'));
  const target = document.getElementById(`sa-cfg-${section}`);
  if (target) target.classList.add('visible');
};

/* Storage inspector */
window.saRefreshStorageInspector = async function() {
  const el = document.getElementById('sa-storage-inspector-inner');
  if (!el) return;
  const h = await AfribStore.health();
  const pct = h.lsPercent;
  const color = pct > 80 ? '#ef4444' : pct > 60 ? '#fbbf24' : '#22c55e';

  el.innerHTML = `
    <div style="margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;font-size:12px;color:rgba(255,255,255,.5);margin-bottom:6px">
        <span>localStorage Usage</span><span>${h.lsKB} / ${h.lsMaxKB} KB (${pct}%)</span>
      </div>
      <div class="sa-storage-bar">
        <div class="sa-storage-fill" style="width:${pct}%;background:${color}"></div>
      </div>
      ${pct > 70 ? `<div style="color:#fbbf24;font-size:11px;margin-top:4px">⚠️ Storage is getting full — consider exporting a backup</div>` : ''}
    </div>
    <div class="sa-storage-stat-grid">
      <div class="sa-storage-stat">
        <div class="sa-storage-stat-val">${h.lsKeys}</div>
        <div class="sa-storage-stat-lbl">LS Keys</div>
      </div>
      <div class="sa-storage-stat">
        <div class="sa-storage-stat-val">${h.idbKeys}</div>
        <div class="sa-storage-stat-lbl">IDB Keys</div>
      </div>
      <div class="sa-storage-stat">
        <div class="sa-storage-stat-val">${h.lsKB}KB</div>
        <div class="sa-storage-stat-lbl">Used</div>
      </div>
    </div>
    <div style="margin-top:16px;border-top:1px solid rgba(255,255,255,.06);padding-top:14px">
      <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.8px;color:rgba(255,255,255,.35);margin-bottom:8px">Storage Layers</div>
      ${[
        ['localStorage', 'Primary fast storage', true],
        ['IndexedDB', 'Large data / overflow',  h.hasIDB],
        ['Cookies', 'Fallback / session',        h.hasCookie],
        ['BroadcastChannel', 'Cross-tab sync',   h.hasBC],
      ].map(([name, desc, avail]) => `
      <div class="sa-storage-layer">
        <div>
          <div style="font-size:13px;font-weight:700;color:#fff">${name}</div>
          <div style="font-size:11px;color:rgba(255,255,255,.35)">${desc}</div>
        </div>
        <span class="sa-storage-layer-badge ${avail ? 'sa-badge-ok' : 'sa-badge-na'}">
          ${avail ? '✓ Active' : '— N/A'}
        </span>
      </div>`).join('')}
    </div>
    <div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap">
      <button onclick="saRefreshStorageInspector()"
              style="padding:8px 16px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:8px;color:rgba(255,255,255,.6);font-size:12px;cursor:pointer">
        🔄 Refresh
      </button>
      <button onclick="saPruneOldStorage()"
              style="padding:8px 16px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.25);border-radius:8px;color:#f87171;font-size:12px;cursor:pointer">
        🧹 Prune Old Keys
      </button>
    </div>`;
};

window.saPruneOldStorage = function() {
  let pruned = 0;
  const keep = ['afrib_v43_', 'sa_', 'afrib_accounts', 'afrib_maintenance'];
  const oldPrefixes = ['afrib_v38_', 'afrib_v39_', 'afrib_v40_', 'afrib_v41_', 'afrib_v42_'];
  try {
    Object.keys(localStorage).forEach(k => {
      if (oldPrefixes.some(p => k.startsWith(p))) {
        localStorage.removeItem(k);
        pruned++;
      }
    });
  } catch(e) {}
  if (typeof toastSa === 'function') toastSa(`🧹 Pruned ${pruned} old storage keys`);
  saRefreshStorageInspector();
};

/* Platform settings */
function _buildPlatformSection() {
  const s = (() => {
    try { return JSON.parse(localStorage.getItem('sa_settings') || '{}'); } catch(e) { return {}; }
  })();
  return `
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
    ${[
      ['App Name', 'sa-plat-appname', s.brandAppName || 'AfribConnect', 'text', 'Display name shown to users'],
      ['Tagline', 'sa-plat-tagline', s.brandTagline || "Africa's Super App", 'text', 'Subtitle under the logo'],
      ['Support Email', 'sa-plat-email', s.supportEmail || '', 'email', 'User-facing support address'],
      ['App URL', 'sa-plat-url', s.appUrl || '', 'url', 'Public URL of the app'],
      ['Coin → USD rate', 'sa-plat-coinusd', s.coinPerUsd || 100, 'number', 'Coins per 1 USD'],
      ['Commission %', 'sa-plat-commission', s.commissionRate || 10, 'number', 'Platform commission rate'],
      ['Min Cash-out (coins)', 'sa-plat-mincash', s.minCashoutCoins || 500, 'number', 'Minimum coin balance to withdraw'],
      ['Referral Bonus (coins)', 'sa-plat-refbonus', s.refBonus || 50, 'number', 'Coins awarded for referral'],
    ].map(([label, id, val, type, note]) => `
    <div class="sa-cfg-field">
      <label class="sa-cfg-label">${label}</label>
      <input type="${type}" id="${id}" value="${val}" class="sa-cfg-input" placeholder="${label}"/>
      <div class="sa-cfg-note">${note}</div>
    </div>`).join('')}
  </div>
  <button class="sa-cfg-save-btn" onclick="saSavePlatformSettings()">💾 Save Platform Settings</button>`;
}

window.saSavePlatformSettings = function() {
  try {
    const s = JSON.parse(localStorage.getItem('sa_settings') || '{}');
    s.brandAppName   = document.getElementById('sa-plat-appname')?.value  || s.brandAppName;
    s.brandTagline   = document.getElementById('sa-plat-tagline')?.value  || s.brandTagline;
    s.supportEmail   = document.getElementById('sa-plat-email')?.value    || '';
    s.appUrl         = document.getElementById('sa-plat-url')?.value      || '';
    s.coinPerUsd     = parseFloat(document.getElementById('sa-plat-coinusd')?.value)    || 100;
    s.commissionRate = parseFloat(document.getElementById('sa-plat-commission')?.value) || 10;
    s.minCashoutCoins= parseInt(document.getElementById('sa-plat-mincash')?.value)     || 500;
    s.refBonus       = parseInt(document.getElementById('sa-plat-refbonus')?.value)    || 50;
    localStorage.setItem('sa_settings', JSON.stringify(s));
    AfribStore.set('sa_settings', s);
    if (typeof toastSa === 'function') toastSa('✅ Platform settings saved');
  } catch(e) {
    console.error('[Config]', e);
    if (typeof toastSa === 'function') toastSa('❌ Save failed — ' + e.message);
  }
};

/* Connectivity tests */
function _buildConnectivitySection() {
  return `
  <div style="display:flex;flex-direction:column;gap:14px">
    ${[
      ['afribconnect.com', 'https://afribconnect.com', 'Main app domain'],
      ['Anthropic API', 'https://api.anthropic.com', 'AI backend'],
      ['OpenAI API', 'https://api.openai.com', 'Alternative AI'],
      ['Firebase / Realtime DB', 'https://firebase.google.com', 'Multiplayer games'],
      ['Ionos Hosting', 'https://www.ionos.com', 'Hosting provider'],
    ].map(([name, url, desc], i) => `
    <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:14px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
        <div>
          <div style="font-size:13px;font-weight:800;color:#fff">${name}</div>
          <div style="font-size:11px;color:rgba(255,255,255,.35)">${desc}</div>
        </div>
        <button onclick="saTestConnectivity('${url}','conn-res-${i}')"
                style="padding:8px 14px;background:rgba(99,102,241,.15);border:1px solid rgba(99,102,241,.3);
                       border-radius:10px;color:#818cf8;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap">
          🔌 Test
        </button>
      </div>
      <div class="sa-conn-result idle" id="conn-res-${i}">Click Test to check connection</div>
    </div>`).join('')}
    <button onclick="saTestAllConnectivity()"
            style="background:linear-gradient(135deg,#4f46e5,#7c3aed);border:none;border-radius:12px;
                   padding:13px 24px;color:#fff;font-size:13px;font-weight:900;cursor:pointer;width:100%">
      🔌 Test All Connections
    </button>
  </div>`;
}

window.saTestConnectivity = async function(url, resultId) {
  const el = document.getElementById(resultId);
  if (!el) return;
  el.className = 'sa-conn-result testing';
  el.textContent = '⏳ Testing…';
  try {
    const start = Date.now();
    const res = await fetch(url, { method: 'HEAD', mode: 'no-cors', signal: AbortSignal.timeout(5000) });
    const ms = Date.now() - start;
    el.className = 'sa-conn-result ok';
    el.textContent = `✅ Reachable (${ms}ms)`;
  } catch(e) {
    el.className = 'sa-conn-result fail';
    el.textContent = e.name === 'TimeoutError' ? '⏱ Timeout after 5s' : `❌ ${e.message}`;
  }
};

window.saTestAllConnectivity = function() {
  [
    ['https://afribconnect.com', 'conn-res-0'],
    ['https://api.anthropic.com', 'conn-res-1'],
    ['https://api.openai.com', 'conn-res-2'],
    ['https://firebase.google.com', 'conn-res-3'],
    ['https://www.ionos.com', 'conn-res-4'],
  ].forEach(([url, id], i) => {
    setTimeout(() => saTestConnectivity(url, id), i * 300);
  });
};

/* Export / import */
function _buildExportSection() {
  return `
  <div style="font-size:13px;color:rgba(255,255,255,.55);margin-bottom:16px;line-height:1.6">
    Export all platform data for backup, or import a previous backup to restore settings.
  </div>
  <div class="sa-export-grid">
    ${[
      ['📥 Export All Settings', 'saExportConfig()'],
      ['📥 Export User Data', 'saExportUsers()'],
      ['📥 Export Badge Data', 'saExportBadges()'],
      ['📤 Import Backup', 'saImportBackup()'],
    ].map(([label, fn]) => `
    <button class="sa-export-btn" onclick="${fn}">${label}</button>`).join('')}
  </div>
  <div style="margin-top:20px;border-top:1px solid rgba(255,255,255,.06);padding-top:16px">
    <div style="font-size:12px;font-weight:800;color:rgba(255,255,255,.35);text-transform:uppercase;letter-spacing:.8px;margin-bottom:10px">Danger Zone</div>
    <button onclick="saClearAllCaches()"
            style="padding:10px 18px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.25);
                   border-radius:10px;color:#f87171;font-size:12px;font-weight:700;cursor:pointer;margin-right:8px">
      🧹 Clear All Caches
    </button>
    <button onclick="saFactoryReset()"
            style="padding:10px 18px;background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.4);
                   border-radius:10px;color:#ef4444;font-size:12px;font-weight:700;cursor:pointer">
      ⚠️ Factory Reset
    </button>
  </div>`;
}

window.saExportConfig = function() {
  const data = {};
  const keys = ['sa_settings', 'afrib_maintenance', AFRIB_STORE_PREFIX + 'ai_config',
                 AFRIB_STORE_PREFIX + 'badge_thresholds', AFRIB_STORE_PREFIX + 'sa_settings'];
  keys.forEach(k => { try { data[k] = JSON.parse(localStorage.getItem(k)); } catch(e) {} });
  _saDownloadJSON(data, `afrib_config_${_saDateStamp()}.json`);
};

window.saExportUsers = function() {
  try {
    const data = JSON.parse(localStorage.getItem('afrib_accounts') || '{}');
    // Strip passwords before export
    const safe = {};
    Object.entries(data).forEach(([k, u]) => {
      safe[k] = { ...u, password: undefined, passwordHash: undefined };
    });
    _saDownloadJSON(safe, `afrib_users_${_saDateStamp()}.json`);
  } catch(e) { if (typeof toastSa === 'function') toastSa('❌ Export failed'); }
};

window.saExportBadges = function() {
  const data = AfribStore.get('badge_data', {});
  _saDownloadJSON(data, `afrib_badges_${_saDateStamp()}.json`);
};

window.saImportBackup = function() {
  const input = document.createElement('input');
  input.type = 'file'; input.accept = '.json';
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        let imported = 0;
        Object.entries(data).forEach(([k, v]) => {
          if (typeof v !== 'undefined') {
            localStorage.setItem(k, JSON.stringify(v));
            imported++;
          }
        });
        if (typeof toastSa === 'function') toastSa(`✅ Imported ${imported} keys from backup`);
      } catch(err) {
        if (typeof toastSa === 'function') toastSa('❌ Invalid backup file');
      }
    };
    reader.readAsText(file);
  };
  input.click();
};

window.saClearAllCaches = function() {
  if (!confirm('Clear all cached data? Settings and user accounts will remain.')) return;
  const keep = ['afrib_accounts', 'sa_settings', 'sa_credentials'];
  Object.keys(localStorage).forEach(k => {
    if (!keep.some(p => k.startsWith(p))) localStorage.removeItem(k);
  });
  if (typeof toastSa === 'function') toastSa('🧹 Caches cleared');
};

window.saFactoryReset = function() {
  const input = prompt('Type "RESET" to perform a factory reset. ALL data will be lost:');
  if (input !== 'RESET') return;
  localStorage.clear();
  if (typeof toastSa === 'function') toastSa('⚠️ Factory reset complete — reload the page');
  setTimeout(() => location.reload(), 1500);
};

function _saDownloadJSON(data, filename) {
  const a = document.createElement('a');
  a.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
  a.download = filename;
  a.click();
  if (typeof toastSa === 'function') toastSa(`📥 Exported: ${filename}`);
}

function _saDateStamp() {
  return new Date().toISOString().slice(0, 10);
}


/* ═══════════════════════════════════════════════════════════════════════════
   §5  WIRING — inject everything into the live app
   ═══════════════════════════════════════════════════════════════════════════ */

/* Hook gmSendGift to record badge progress */
(function patchGmSendV43() {
  function doPatch() {
    if (typeof window.gmSendGift !== 'function') return false;
    if (window.gmSendGift._v43Patched) return true;
    const orig = window.gmSendGift;
    window.gmSendGift = function() {
      orig.apply(this, arguments);
      try {
        if (window.currentUser && window._gmSelectedGift) {
          const total = (window._gmSelectedGift.coins || 0) * (window._gmQty || 1);
          gbRecordGiftV43(
            window.currentUser.email,
            total,
            window._gmSelectedGift.name,
            window._gmQty || 1
          );
        }
      } catch(e) {}
    };
    window.gmSendGift._v43Patched = true;
    return true;
  }
  if (!doPatch()) {
    const t = setInterval(() => { if (doPatch()) clearInterval(t); }, 400);
    setTimeout(() => clearInterval(t), 10000);
  }
})();

/* Inject Badge tab into GiftMe overlay */
(function wireGiftBadgeTabV43() {
  function tryInject() {
    const tabs = document.getElementById('gm-tabs');
    if (!tabs || tabs.querySelector('[data-gb-v43]')) return false;

    const btn = document.createElement('button');
    btn.className = 'gm-tab';
    btn.setAttribute('data-gb-v43', '1');
    btn.textContent = '🏅 My Badge';
    btn.onclick = function() {
      document.querySelectorAll('.gm-tab').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');

      // Hide send bar, show badge panel
      const wrap = document.querySelector('.gm-grid-wrap');
      const sendBar = document.querySelector('.gm-send-bar');
      const msgWrap = document.querySelector('.gm-msg-wrap');
      if (sendBar) sendBar.style.display = 'none';
      if (msgWrap) msgWrap.style.display = 'none';

      if (wrap) {
        wrap.innerHTML = '';
        _gbClearCanvasTimers();
        const email = window.currentUser?.email || '';
        gbRenderTikTokPanel(email, wrap);
        setTimeout(() => gbScrollToCurrent(gbCalcLevelV43(
          gbGetDataV43(email).totalGifts || 0
        )), 400);
      }
    };
    tabs.appendChild(btn);

    // Restore send bar when switching to other tabs
    tabs.querySelectorAll('.gm-tab:not([data-gb-v43])').forEach(t => {
      const orig = t.onclick;
      t.onclick = function(e) {
        document.querySelector('.gm-send-bar') && (document.querySelector('.gm-send-bar').style.display = '');
        document.querySelector('.gm-msg-wrap') && (document.querySelector('.gm-msg-wrap').style.display = '');
        if (typeof orig === 'function') orig.call(this, e);
      };
    });
    return true;
  }

  const observer = new MutationObserver(() => {
    const overlay = document.getElementById('gm-overlay');
    if (overlay?.classList.contains('open')) tryInject();
  });
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
})();

/* Inject full config panel into superadmin settings section */
(function injectFullConfigIntoSuperadmin() {
  function tryInject() {
    const settingsPanel = document.getElementById('sp-sysettings');
    if (!settingsPanel) return false;
    if (settingsPanel.querySelector('#sa-full-cfg')) return true;

    const wrapper = document.createElement('div');
    wrapper.id = 'sa-v43-config-wrap';
    wrapper.style.marginTop = '24px';
    settingsPanel.appendChild(wrapper);
    saRenderFullConfigPanel('sa-v43-config-wrap');
    return true;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(() => { if (!tryInject()) setTimeout(tryInject, 1500); }, 700));
  } else {
    setTimeout(() => { if (!tryInject()) setTimeout(tryInject, 1500); }, 700);
  }
})();

/* Public API exports */
window.gbRenderTikTokPanel          = gbRenderTikTokPanel;
window.gbRecordGiftV43              = gbRecordGiftV43;
window.gbGetDataV43                 = gbGetDataV43;
window.gbCalcLevelV43               = gbCalcLevelV43;
window.gbGetTierV43                 = gbGetTierV43;
window.gbGetThresholds              = gbGetThresholds;
window.gbDrawCrystal                = gbDrawCrystal;
window.gbGiftsToNextLevel           = gbGiftsToNextLevel;
window.gbLevelProgress              = gbLevelProgress;
window.gbCalcLevelV43               = gbCalcLevelV43;
window.saRenderFullConfigPanel      = saRenderFullConfigPanel;
window.saRenderBadgeThresholdEditor = saRenderBadgeThresholdEditor;
window.GB_TIERS                     = GB_TIERS;

console.log('[AfribConnect] ✅ v43 Upgrade loaded — TikTok badges | Storage Engine | Full Config');
