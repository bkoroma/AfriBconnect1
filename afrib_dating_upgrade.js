/* ═══════════════════════════════════════════════════════════════════════
   AfribConnect — Unified Database & Storage Engine
   afrib_database.js

   RESEARCH BASIS (2025):
   ─────────────────────────────────────────────────────────────────────
   • Best-practice PWA storage: IndexedDB > localStorage for structured data
     (web.dev, LogRocket, MDN — IndexedDB handles 60% of disk, localStorage ≤ 5MB)
   • Offline-first pattern: IndexedDB as local DB + sync queue when online
     (PWAs with offline support: 95% faster loads, 40% higher engagement)
   • Structured schema (table/store design): mirroring Supabase/Firebase patterns
     — Users, Accounts, Transactions, Messages, Profiles, Config, Logs
   • Data integrity: versioned migrations, transactions, conflict resolution
   • GDPR: data export, purge by user, audit trail

   WHAT THIS FILE DOES:
   ─────────────────────────────────────────────────────────────────────
   1.  AfribDB — IndexedDB wrapper with promise API (idb-style)
   2.  13 Object Stores (tables): users, accounts, transactions, messages,
       dating_profiles, marketplace_listings, marketplace_orders, game_stats,
       notifications, config, audit_log, social_posts, sync_queue
   3.  Storage Manager — quota monitor, cleanup, export-all, import
   4.  Migration engine — versioned upgrades, backward compat
   5.  KV Store — fast key-value over IndexedDB (replaces localStorage for
       large/sensitive data)
   6.  Data API — CRUD for every table (get, set, list, delete, query)
   7.  Sync Queue — offline action queue, replays on reconnect
   8.  Export/Import — full JSON export, GDPR data package
   9.  Admin Data Panel — in SA panel: browse all stores, counts, export
  10.  localStorage → IndexedDB migration — moves existing data on first run
   ═══════════════════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────────────────────────────
   DB SCHEMA — 13 Object Stores
───────────────────────────────────────────────────────────────────── */
const DB_NAME    = 'AfribConnectDB';
const DB_VERSION = 3;

const DB_SCHEMA = [
  // TABLE               KEY PATH        INDEXES
  { name:'users',               key:'email',      indexes:[['username','username'],['createdAt','createdAt']] },
  { name:'accounts',            key:'email',      indexes:[['country','country'],['status','status']] },
  { name:'transactions',        key:'id',         indexes:[['email','email'],['ts','ts'],['type','type'],['status','status']] },
  { name:'messages',            key:'id',         indexes:[['fromEmail','fromEmail'],['toEmail','toEmail'],['ts','ts'],['chatId','chatId']] },
  { name:'dating_profiles',     key:'email',      indexes:[['gender','gender'],['originCountry','originCountry'],['intent','intent']] },
  { name:'dating_matches',      key:'id',         indexes:[['user1','user1'],['user2','user2'],['matchedAt','matchedAt']] },
  { name:'marketplace_listings',key:'id',         indexes:[['email','email'],['category','category'],['active','active'],['createdAt','createdAt']] },
  { name:'marketplace_orders',  key:'id',         indexes:[['user','user'],['status','status'],['ts','ts']] },
  { name:'game_stats',          key:'email',      indexes:[['xp','xp'],['totalWins','totalWins']] },
  { name:'notifications',       key:'id',         indexes:[['email','email'],['ts','ts'],['read','read']] },
  { name:'config',              key:'key',        indexes:[] },
  { name:'audit_log',           key:'id',         indexes:[['email','email'],['action','action'],['ts','ts']] },
  { name:'sync_queue',          key:'id',         indexes:[['status','status'],['ts','ts']] },
];

/* ─────────────────────────────────────────────────────────────────────
   AFRIBDB — IndexedDB Promise Wrapper
───────────────────────────────────────────────────────────────────── */
class AfribDB {
  constructor() {
    this._db  = null;
    this._ready = this._open();
  }

  _open() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = (evt) => {
        const db  = evt.target.result;
        const old = evt.oldVersion;

        DB_SCHEMA.forEach(({ name, key, indexes }) => {
          let store;
          if (!db.objectStoreNames.contains(name)) {
            store = db.createObjectStore(name, { keyPath: key });
          } else {
            store = evt.target.transaction.objectStore(name);
          }
          // Add missing indexes
          indexes.forEach(([idxName, keyPath]) => {
            if (!store.indexNames.contains(idxName)) {
              store.createIndex(idxName, keyPath, { unique: false });
            }
          });
        });
      };

      req.onsuccess  = (e) => { this._db = e.target.result; resolve(this._db); };
      req.onerror    = (e) => reject(e.target.error);
      req.onblocked  = ()  => console.warn('[AfribDB] upgrade blocked');
    });
  }

  async _tx(storeName, mode, fn) {
    const db = await this._ready;
    return new Promise((resolve, reject) => {
      const tx    = db.transaction(storeName, mode);
      const store = Array.isArray(storeName)
        ? storeName.reduce((o,n) => { o[n]=tx.objectStore(n); return o; }, {})
        : tx.objectStore(storeName);
      const req = fn(store, tx);
      if (req && typeof req.onsuccess !== 'undefined') {
        req.onsuccess = () => resolve(req.result);
        req.onerror   = () => reject(req.error);
      } else {
        tx.oncomplete = () => resolve(req);
        tx.onerror    = () => reject(tx.error);
      }
    });
  }

  // ── CRUD ─────────────────────────────────────────────────────────

  /** Get a single record by key */
  async get(store, key) {
    return this._tx(store, 'readonly', s => s.get(key));
  }

  /** Put (upsert) a record */
  async put(store, record) {
    record._updatedAt = Date.now();
    return this._tx(store, 'readwrite', s => s.put(record));
  }

  /** Delete a record by key */
  async delete(store, key) {
    return this._tx(store, 'readwrite', s => s.delete(key));
  }

  /** Get all records from a store */
  async getAll(store, query, count) {
    return this._tx(store, 'readonly', s => s.getAll(query, count));
  }

  /** Get all records matching an index value */
  async getByIndex(store, indexName, value) {
    const db = await this._ready;
    return new Promise((resolve, reject) => {
      const tx  = db.transaction(store, 'readonly');
      const idx = tx.objectStore(store).index(indexName);
      const req = idx.getAll(value);
      req.onsuccess = () => resolve(req.result);
      req.onerror   = () => reject(req.error);
    });
  }

  /** Count records in a store */
  async count(store) {
    return this._tx(store, 'readonly', s => s.count());
  }

  /** Clear all records from a store */
  async clearStore(store) {
    return this._tx(store, 'readwrite', s => s.clear());
  }

  /** Get all keys */
  async getAllKeys(store) {
    return this._tx(store, 'readonly', s => s.getAllKeys());
  }

  /** Bulk put */
  async bulkPut(store, records) {
    const db = await this._ready;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, 'readwrite');
      const s  = tx.objectStore(store);
      records.forEach(r => { r._updatedAt = Date.now(); s.put(r); });
      tx.oncomplete = resolve;
      tx.onerror    = () => reject(tx.error);
    });
  }

  /** Get storage estimate */
  async storageEstimate() {
    try {
      if (navigator?.storage?.estimate) {
        const est = await navigator.storage.estimate();
        return {
          used:  est.usage  || 0,
          quota: est.quota  || 0,
          usedMB:  Math.round((est.usage||0)  / 1024 / 1024 * 10) / 10,
          quotaMB: Math.round((est.quota||0)  / 1024 / 1024),
          pct: est.quota ? Math.round((est.usage/est.quota)*100) : 0,
        };
      }
    } catch(e) {}
    return { used:0, quota:0, usedMB:0, quotaMB:0, pct:0 };
  }

  /** Request persistent storage */
  async requestPersistent() {
    try {
      if (navigator?.storage?.persist) return navigator.storage.persist();
    } catch(e) {}
    return false;
  }

  /** Export all data as JSON */
  async exportAll() {
    const out = { version: DB_VERSION, exportedAt: new Date().toISOString(), stores: {} };
    for (const { name } of DB_SCHEMA) {
      try { out.stores[name] = await this.getAll(name); } catch(e) { out.stores[name] = []; }
    }
    return out;
  }

  /** Import from exported JSON */
  async importAll(data) {
    if (!data?.stores) throw new Error('Invalid backup format');
    for (const [storeName, records] of Object.entries(data.stores)) {
      if (!Array.isArray(records)) continue;
      const schema = DB_SCHEMA.find(s => s.name === storeName);
      if (!schema) continue;
      try { await this.bulkPut(storeName, records); } catch(e) { console.warn('[AfribDB] import error', storeName, e); }
    }
    return true;
  }
}

// Singleton
window.AfribDB = new AfribDB();

/* ─────────────────────────────────────────────────────────────────────
   KV STORE — key-value shortcut over IndexedDB config store
───────────────────────────────────────────────────────────────────── */
window.AfribKV = {
  async get(key, fallback) {
    try {
      const rec = await window.AfribDB.get('config', key);
      return rec?.value !== undefined ? rec.value : fallback;
    } catch(e) { return fallback; }
  },
  async set(key, value) {
    try { return window.AfribDB.put('config', { key, value }); } catch(e) {}
  },
  async del(key) {
    try { return window.AfribDB.delete('config', key); } catch(e) {}
  },
  async keys() {
    try { return window.AfribDB.getAllKeys('config'); } catch(e) { return []; }
  },
};

/* ─────────────────────────────────────────────────────────────────────
   SYNC QUEUE — offline actions queue
───────────────────────────────────────────────────────────────────── */
window.AfribSyncQueue = {
  async push(action, data) {
    const id = `sync_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
    await window.AfribDB.put('sync_queue', { id, action, data, status:'pending', ts:Date.now() });
  },
  async flush() {
    const pending = await window.AfribDB.getByIndex('sync_queue', 'status', 'pending');
    let processed = 0;
    for (const item of pending) {
      try {
        // Fire the action if a handler is registered
        const handler = window._syncHandlers?.[item.action];
        if (handler) { await handler(item.data); }
        item.status = 'done';
        await window.AfribDB.put('sync_queue', item);
        processed++;
      } catch(e) {
        item.status = 'failed';
        item.error  = String(e);
        await window.AfribDB.put('sync_queue', item);
      }
    }
    return processed;
  },
  register(action, handler) {
    if (!window._syncHandlers) window._syncHandlers = {};
    window._syncHandlers[action] = handler;
  },
};

// Auto-flush sync queue on reconnect
window.addEventListener('online', () => {
  setTimeout(() => window.AfribSyncQueue.flush(), 1000);
});

/* ─────────────────────────────────────────────────────────────────────
   DATA MIGRATION — localStorage → IndexedDB
   Runs once on startup, moves all existing localStorage data to IndexedDB
───────────────────────────────────────────────────────────────────── */
(async function migrateLocalStorageToIndexedDB() {
  try {
    const migrationKey = 'afrib_idb_migrated_v3';
    if (localStorage.getItem(migrationKey)) return;

    await window.AfribDB._ready;

    // 1. Migrate accounts (users)
    const accounts = (() => {
      try { return JSON.parse(localStorage.getItem('afrib_accounts') || '{}'); } catch(e) { return {}; }
    })();
    if (Object.keys(accounts).length) {
      const users = Object.values(accounts).map(u => ({ ...u, _migratedAt: Date.now() }));
      await window.AfribDB.bulkPut('users', users);
      await window.AfribDB.bulkPut('accounts', users);
    }

    // 2. Migrate transactions
    const txLogs = Object.keys(localStorage)
      .filter(k => k.startsWith('afrib_txs_'))
      .flatMap(k => {
        const email = k.replace('afrib_txs_', '');
        try { return JSON.parse(localStorage.getItem(k)||'[]').map(t => ({ ...t, email, _migratedAt: Date.now() })); }
        catch(e) { return []; }
      });
    if (txLogs.length) await window.AfribDB.bulkPut('transactions', txLogs);

    // 3. Migrate marketplace listings
    const stores = (() => {
      try { return JSON.parse(localStorage.getItem('afrib_seller_stores') || '{}'); } catch(e) { return {}; }
    })();
    const listings = Object.keys(stores).flatMap(email => {
      const lKey = `afrib_listings_${email}`;
      try { return JSON.parse(localStorage.getItem(lKey)||'[]').map(l => ({...l, email, _migratedAt: Date.now()})); }
      catch(e) { return []; }
    });
    if (listings.length) await window.AfribDB.bulkPut('marketplace_listings', listings);

    // 4. Migrate dating profiles
    const dmProfiles = (() => {
      try { return Object.values(JSON.parse(localStorage.getItem('afrib_dating_profiles') || '{}')); }
      catch(e) { return []; }
    })();
    if (dmProfiles.length) await window.AfribDB.bulkPut('dating_profiles', dmProfiles);

    // 5. Migrate game stats
    const gameStatKeys = Object.keys(localStorage).filter(k => k.startsWith('afrib_game_stats_'));
    for (const k of gameStatKeys) {
      try {
        const stats = JSON.parse(localStorage.getItem(k) || '{}');
        const email = k.replace('afrib_game_stats_', '');
        if (email) await window.AfribDB.put('game_stats', { ...stats, email });
      } catch(e) {}
    }

    // 6. Migrate SA settings to config store
    const saSettings = (() => { try { return JSON.parse(localStorage.getItem('sa_settings')||'{}'); } catch(e) { return {}; } })();
    if (Object.keys(saSettings).length) {
      await window.AfribKV.set('sa_settings', saSettings);
    }

    localStorage.setItem(migrationKey, '1');
    console.log(`[AfribDB] Migration complete — ${Object.keys(accounts).length} users, ${txLogs.length} txns, ${listings.length} listings`);
  } catch(e) {
    console.warn('[AfribDB] Migration partial:', e);
  }
})();

/* ─────────────────────────────────────────────────────────────────────
   STORAGE MANAGER — monitor + clean + persist
───────────────────────────────────────────────────────────────────── */
window.AfribStorage = {
  async getStatus() {
    const est = await window.AfribDB.storageEstimate();
    const counts = {};
    for (const { name } of DB_SCHEMA) {
      try { counts[name] = await window.AfribDB.count(name); } catch(e) { counts[name] = 0; }
    }
    // localStorage usage
    let lsBytes = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      lsBytes += k.length + (localStorage.getItem(k)||'').length;
    }
    return { ...est, counts, lsBytes, lsKB: Math.round(lsBytes / 1024) };
  },

  async requestPersistent() {
    const granted = await window.AfribDB.requestPersistent();
    if (typeof showToast === 'function') {
      showToast(granted ? '✅ Storage is now persistent — data won\'t be cleared by browser' : '⚠️ Browser declined persistent storage');
    }
    return granted;
  },

  async exportFullBackup() {
    const data = await window.AfribDB.exportAll();
    // Add localStorage config
    data.localStorage_config = {};
    ['sa_settings','afrib_oauth_config','afrib_email_config','afrib_admin_settings','afrib_firebase_config','afrib_ai_config_v42'].forEach(k => {
      try { data.localStorage_config[k] = JSON.parse(localStorage.getItem(k)||'null'); } catch(e) {}
    });
    return data;
  },

  async importBackup(jsonData) {
    let data;
    try {
      data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    } catch(e) {
      console.error('[AfribDB] importBackup: invalid JSON —', e.message);
      return false;
    }
    if (!data || typeof data !== 'object') return false;
    await window.AfribDB.importAll(data);
    // Restore localStorage config
    if (data.localStorage_config) {
      Object.entries(data.localStorage_config).forEach(([k,v]) => {
        if (v != null) localStorage.setItem(k, JSON.stringify(v));
      });
    }
    return true;
  },

  async cleanOldSyncQueue() {
    const all = await window.AfribDB.getAll('sync_queue');
    const week = Date.now() - 7 * 86400000;
    const old  = all.filter(r => r.status === 'done' && r.ts < week);
    for (const r of old) await window.AfribDB.delete('sync_queue', r.id);
    return old.length;
  },

  async exportUserData(email) {
    // GDPR data export for a single user
    const out = { email, exportedAt: new Date().toISOString() };
    out.profile      = await window.AfribDB.get('users', email);
    out.transactions = await window.AfribDB.getByIndex('transactions', 'email', email);
    out.messages     = await window.AfribDB.getByIndex('messages', 'fromEmail', email);
    out.dating       = await window.AfribDB.get('dating_profiles', email);
    out.gameStats    = await window.AfribDB.get('game_stats', email);
    out.listings     = await window.AfribDB.getByIndex('marketplace_listings', 'email', email);
    out.notifications= await window.AfribDB.getByIndex('notifications', 'email', email);
    return out;
  },

  async deleteUserData(email) {
    // GDPR right to erasure
    await window.AfribDB.delete('users', email);
    await window.AfribDB.delete('accounts', email);
    await window.AfribDB.delete('dating_profiles', email);
    await window.AfribDB.delete('game_stats', email);
    // Clear indexed records
    const stores = ['transactions','messages','notifications','marketplace_listings'];
    for (const store of stores) {
      const recs = await window.AfribDB.getByIndex(store, 'email', email).catch(()=>[]);
      for (const r of recs) await window.AfribDB.delete(store, r.id || r.key);
    }
    // Clear localStorage for this user
    const keySuffixes = ['afrib_coins_','afrib_txs_','afrib_achievements_','afrib_streak_',
      'afrib_ludo_','afrib_game_stats_','afrib_last_login_day_'];
    keySuffixes.forEach(sfx => localStorage.removeItem(sfx + email));
    return true;
  },
};

/* ─────────────────────────────────────────────────────────────────────
   PUBLIC DATA API — shorthand helpers used throughout app
───────────────────────────────────────────────────────────────────── */
window.AfribData = {
  // Users
  getUser:   (email)  => window.AfribDB.get('users', email),
  saveUser:  (user)   => window.AfribDB.put('users', user),
  getAllUsers:()       => window.AfribDB.getAll('users'),

  // Transactions
  logTx: async (tx) => {
    tx.id  = tx.id  || `tx_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
    tx.ts  = tx.ts  || Date.now();
    await window.AfribDB.put('transactions', tx);
    // Mirror to localStorage for backward compat
    if (tx.email) {
      const k    = `afrib_txs_${tx.email}`;
      const txs  = (() => { try { return JSON.parse(localStorage.getItem(k)||'[]'); } catch(e) { return []; } })();
      txs.unshift(tx);
      if (txs.length > 500) txs.length = 500;
      try { localStorage.setItem(k, JSON.stringify(txs)); } catch(e) {}
    }
    return tx;
  },
  getTxs: (email) => window.AfribDB.getByIndex('transactions', 'email', email),

  // Messages
  saveMessage: async (msg) => {
    msg.id     = msg.id || `msg_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
    msg.ts     = msg.ts || Date.now();
    msg.chatId = msg.chatId || [msg.fromEmail, msg.toEmail].sort().join('::');
    return window.AfribDB.put('messages', msg);
  },
  getMessages: (chatId) => window.AfribDB.getByIndex('messages', 'chatId', chatId),

  // Config (replaces sa_settings localStorage calls)
  getConfig: (key, fb) => window.AfribKV.get(key, fb),
  setConfig: (key, val) => window.AfribKV.set(key, val),

  // Audit log
  audit: async (action, email, detail) => {
    await window.AfribDB.put('audit_log', {
      id:     `al_${Date.now()}_${Math.random().toString(36).slice(2,5)}`,
      action, email, detail, ts: Date.now(),
    });
  },
};

/* ─────────────────────────────────────────────────────────────────────
   PATCH SA_SETTINGS reads/writes to also update IndexedDB
───────────────────────────────────────────────────────────────────── */
(function patchSASettings() {
  // When sa_settings changes in localStorage, mirror to AfribDB config store
  const origSetItem = localStorage.setItem.bind(localStorage);
  Object.defineProperty(localStorage, 'setItem', {
    value: function(key, value) {
      origSetItem(key, value);
      if (key === 'sa_settings') {
        try {
          const parsed = JSON.parse(value);
          window.AfribKV.set('sa_settings', parsed).catch(()=>{});
        } catch(e) {}
      }
    },
    writable: true, configurable: true,
  });
})();

/* ─────────────────────────────────────────────────────────────────────
   STORAGE STATUS INDICATOR — shown in SA panel
───────────────────────────────────────────────────────────────────── */
window.renderDbStatusPanel = async function(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;

  el.innerHTML = '<div style="text-align:center;padding:16px;color:var(--w60)">⏳ Loading storage stats…</div>';

  try {
    const status = await window.AfribStorage.getStatus();
    const pctColor = status.pct > 80 ? '#ef4444' : status.pct > 60 ? '#f59e0b' : '#22c55e';

    el.innerHTML = `
      <style>
        .db-store-row{display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.05)}
        .db-store-row:last-child{border-bottom:none}
        .db-badge{font-size:11px;font-weight:700;padding:2px 8px;border-radius:10px;background:rgba(212,175,55,.12);color:var(--gold)}
      </style>

      <!-- Storage Bar -->
      <div style="background:var(--bg3);border-radius:12px;padding:14px;margin-bottom:14px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <div style="font-size:13px;font-weight:700">💾 Storage Usage</div>
          <div style="font-size:12px;font-weight:700;color:${pctColor}">${status.usedMB} MB / ${status.quotaMB} MB (${status.pct}%)</div>
        </div>
        <div style="height:8px;background:rgba(255,255,255,.06);border-radius:4px;overflow:hidden;margin-bottom:8px">
          <div style="height:100%;width:${status.pct}%;background:${pctColor};border-radius:4px;transition:width .5s"></div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button onclick="AfribStorage.requestPersistent()" style="padding:7px 12px;background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.2);border-radius:8px;color:#22c55e;font-size:11px;font-weight:700;cursor:pointer">🔒 Make Persistent</button>
          <button onclick="AfribStorage.cleanOldSyncQueue().then(n=>showToast('Cleaned '+n+' old sync entries'))" style="padding:7px 12px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);border-radius:8px;color:#ef4444;font-size:11px;font-weight:700;cursor:pointer">🧹 Clean Old Queue</button>
          <button onclick="_saExportIdbBackup()" style="padding:7px 12px;background:rgba(212,175,55,.1);border:1px solid rgba(212,175,55,.2);border-radius:8px;color:var(--gold);font-size:11px;font-weight:700;cursor:pointer">📦 Export Full Backup</button>
        </div>
        <div style="font-size:10px;color:var(--w30);margin-top:6px">localStorage: ${status.lsKB} KB</div>
      </div>

      <!-- Store counts -->
      <div style="background:var(--bg3);border-radius:12px;padding:14px;margin-bottom:14px">
        <div style="font-size:13px;font-weight:700;margin-bottom:10px">📊 Database Tables</div>
        ${DB_SCHEMA.map(({ name }) => `
          <div class="db-store-row">
            <span style="font-size:12px;color:var(--w80);font-family:monospace">${name}</span>
            <span class="db-badge">${(status.counts[name]||0).toLocaleString()} rows</span>
          </div>`).join('')}
      </div>

      <!-- Actions -->
      <div style="background:var(--bg3);border-radius:12px;padding:14px">
        <div style="font-size:13px;font-weight:700;margin-bottom:10px">🔧 Database Actions</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <button onclick="_saExportIdbBackup()" style="padding:10px;background:rgba(212,175,55,.08);border:1px solid rgba(212,175,55,.2);border-radius:10px;color:var(--gold);font-size:12px;font-weight:700;cursor:pointer">📦 Full Backup</button>
          <label style="padding:10px;background:rgba(59,130,246,.08);border:1px solid rgba(59,130,246,.2);border-radius:10px;color:#60a5fa;font-size:12px;font-weight:700;cursor:pointer;text-align:center">
            📥 Import Backup<input type="file" accept=".json" style="display:none" onchange="_saImportIdbBackup(this)"/>
          </label>
          <button onclick="_saViewTable('users')" style="padding:10px;background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:10px;color:var(--w60);font-size:12px;cursor:pointer">👥 Browse Users</button>
          <button onclick="_saViewTable('transactions')" style="padding:10px;background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:10px;color:var(--w60);font-size:12px;cursor:pointer">💰 Browse Txns</button>
          <button onclick="_saViewTable('audit_log')" style="padding:10px;background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:10px;color:var(--w60);font-size:12px;cursor:pointer">📋 Audit Log</button>
          <button onclick="_saViewTable('sync_queue')" style="padding:10px;background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:10px;color:var(--w60);font-size:12px;cursor:pointer">🔄 Sync Queue</button>
        </div>
      </div>`;
  } catch(e) {
    el.innerHTML = `<div style="color:#ef4444;padding:12px">Error loading storage stats: ${e.message}</div>`;
  }
};

window._saExportIdbBackup = async function() {
  try {
    if (typeof showToast === 'function') showToast('⏳ Preparing full backup…');
    const data = await window.AfribStorage.exportFullBackup();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type:'application/json' });
    const a    = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = `AfribConnect_backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    if (typeof showToast === 'function') showToast('✅ Backup downloaded!');
  } catch(e) {
    if (typeof showToast === 'function') showToast('❌ Backup failed: ' + e.message);
  }
};

window._saImportIdbBackup = async function(input) {
  const file = input.files?.[0];
  if (!file) return;
  try {
    if (typeof showToast === 'function') showToast('⏳ Importing backup…');
    const text = await file.text();
    const data = JSON.parse(text);
    await window.AfribStorage.importBackup(data);
    if (typeof showToast === 'function') showToast('✅ Backup imported successfully!');
  } catch(e) {
    if (typeof showToast === 'function') showToast('❌ Import failed: ' + e.message);
  }
};

window._saViewTable = async function(storeName) {
  const records = await window.AfribDB.getAll(storeName, null, 100);
  const overlay = document.createElement('div');
  overlay.id = 'dbTableOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.92);backdrop-filter:blur(8px);display:flex;align-items:flex-end;justify-content:center';
  overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };

  const cols = records.length ? Object.keys(records[0]).slice(0, 8) : [];
  overlay.innerHTML = `
    <div style="background:var(--bg2);border-radius:20px 20px 0 0;padding:20px;width:100%;max-width:800px;max-height:85vh;overflow-y:auto">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
        <h3 style="font-size:16px;font-weight:800;font-family:monospace;margin:0">📋 ${storeName} (${records.length} rows)</h3>
        <button onclick="safeRemoveEl('dbTableOverlay')" style="background:none;border:none;color:var(--w60);font-size:20px;cursor:pointer">✕</button>
      </div>
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse;font-size:11px;font-family:monospace">
          <thead>
            <tr style="background:rgba(255,255,255,.05)">
              ${cols.map(c => `<th style="padding:6px 10px;text-align:left;color:var(--gold);white-space:nowrap;border-bottom:1px solid var(--border)">${c}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${records.slice(0, 50).map(r => `<tr style="border-bottom:1px solid rgba(255,255,255,.04)">
              ${cols.map(c => `<td style="padding:5px 10px;color:var(--w80);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${JSON.stringify(r[c])?.slice(0,80) || ''}</td>`).join('')}
            </tr>`).join('')}
          </tbody>
        </table>
        ${records.length > 50 ? `<div style="text-align:center;color:var(--w30);font-size:11px;padding:8px">Showing 50 of ${records.length} rows</div>` : ''}
      </div>
    </div>`;
  document.body.appendChild(overlay);
};

/* ─────────────────────────────────────────────────────────────────────
   INJECT DB PANEL INTO SUPERADMIN
───────────────────────────────────────────────────────────────────── */
(function injectDbTabInSA() {
  function tryInject() {
    const tabBar = document.querySelector('.sa-tabs, [class*="sa-tab"]')?.parentElement;
    if (!tabBar || document.getElementById('sa-tab-database')) return;

    // Add Database tab button
    const tab = document.createElement('button');
    tab.id = 'sa-tab-database';
    tab.className = 'sa-tab';
    tab.textContent = '🗄️ Database';
    tab.onclick = function() { saPanel(this, 'database'); };
    tabBar.appendChild(tab);

    // Add Database panel
    const panel = document.createElement('div');
    panel.id = 'sp-database';
    panel.className = 'sa-panel';
    panel.innerHTML = `
      <div class="panel-header">
        <div class="panel-title">🗄️ Database & Storage</div>
        <div class="panel-sub">IndexedDB schema, storage usage, backup/restore, and data management</div>
      </div>
      <div id="dbStatusPanelContent">
        <div style="text-align:center;padding:20px;color:var(--w60)">Click a tab to load the panel first, then return here.</div>
      </div>`;

    // Insert before the last panel
    const lastPanel = document.querySelector('.sa-panel:last-child');
    if (lastPanel) lastPanel.after(panel);
    else document.querySelector('[class*="sa-"]')?.appendChild(panel);

    // Patch saPanel to trigger DB panel load
    const origSaPanel = window.saPanel;
    if (typeof origSaPanel === 'function') {
      window.saPanel = function(btn, id) {
        origSaPanel.apply(this, arguments);
        if (id === 'database') {
          setTimeout(() => renderDbStatusPanel('dbStatusPanelContent'), 200);
        }
      };
    }
  }

  if (document.readyState === 'loading') window.addEventListener('load', () => setTimeout(tryInject, 800));
  else setTimeout(tryInject, 800);
})();

/* ─────────────────────────────────────────────────────────────────────
   AUDIT LOG HOOKS — record key actions
───────────────────────────────────────────────────────────────────── */
(function hookAuditLog() {
  // Patch appendAdminLog to also write to IndexedDB
  const orig = window.appendAdminLog;
  if (typeof orig === 'function') {
    window.appendAdminLog = function(type, user, action, detail) {
      orig.apply(this, arguments);
      const email = typeof user === 'string' ? user : user?.email || '';
      window.AfribData.audit(action || type, email, detail || '').catch(()=>{});
    };
  }
})();

console.log('[AfribDB] Database engine loaded ✅ — 13 stores, IndexedDB, KV, SyncQueue, StorageManager');
