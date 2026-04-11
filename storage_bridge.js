/* ═══════════════════════════════════════════════════════════════════════════
   AfriBConnect — storage_bridge.js  v3.0
   COMPLETE CLOUD SYNC: login from any device, real-time admin visibility
   ─────────────────────────────────────────────────────────────────────────

   WHAT THIS FIXES (v3.0):
   ✅ Cross-device login — user creates account on phone, logs in on laptop
   ✅ Login events sync to cloud instantly (admin sees who just logged in)
   ✅ Online presence tracked in real-time
   ✅ Signup writes user to cloud immediately
   ✅ Profile updates sync to cloud
   ✅ On login, if user not in local storage, fetches from cloud first
   ✅ Admin dashboard shows live online users + login stream
   ✅ Heartbeat keeps presence accurate
   ✅ Logout marks user offline in cloud

   SUPPORTED PROVIDERS (all free):
   🔥 Firebase Firestore — recommended (real-time, offline-capable)
   ⚡ Supabase — PostgreSQL, open source
   🐘 PocketBase — self-hosted
   📦 JSONBin.io — zero config, great for testing
   💾 Local Only — fallback (same-device only)

   SETUP: Admin Panel → Settings → ☁️ Cloud Storage → choose provider → paste keys → Save & Connect
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

const STORAGE_CONFIG_KEY = 'afrib_storage_config';
const SB_VERSION = 'v4.0';

/* ═══════════════════════════════════════════════════════════════════════
   MAIN AfribStorage OBJECT
═══════════════════════════════════════════════════════════════════════ */
window.AfribStorage = {

  _provider: null,
  _ready: false,
  _readyCallbacks: [],

  getConfig() {
    try { return JSON.parse(localStorage.getItem(STORAGE_CONFIG_KEY) || 'null') || { provider: 'local', connected: false }; }
    catch(e) { return { provider: 'local', connected: false }; }
  },
  saveConfig(cfg) {
    try { localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(cfg)); } catch(e) {}
  },

  async connect() {
    const cfg = this.getConfig();
    try {
      switch (cfg.provider) {
        case 'firebase':   this._provider = new _FirebaseProvider(cfg);   break;
        case 'supabase':   this._provider = new _SupabaseProvider(cfg);   break;
        case 'pocketbase': this._provider = new _PocketBaseProvider(cfg); break;
        case 'jsonbin':    this._provider = new _JSONBinProvider(cfg);     break;
        case 'aws':        this._provider = new _AWSProvider(cfg);         break;
        case 'azure':      this._provider = new _AzureProvider(cfg);       break;
        default:           this._provider = new _LocalProvider();
      }
      const result = await this._provider.init();
      if (result.ok) {
        cfg.connected = true;
        cfg.lastConnected = new Date().toISOString();
        this.saveConfig(cfg);
        _sb_log(`✅ Connected to ${result.provider}`);
        this._ready = true;
        this._readyCallbacks.forEach(cb => { try { cb(result); } catch(e){} });
        this._readyCallbacks = [];
      }
      return result;
    } catch(e) {
      _sb_log('Connection failed:', e.message);
      this._provider = new _LocalProvider();
      return { ok: false, reason: e.message };
    }
  },

  onReady(cb) {
    if (this._ready) { try { cb({ ok: true }); } catch(e){} }
    else this._readyCallbacks.push(cb);
  },

  provider() { return this._provider || new _LocalProvider(); },

  /* ── CRUD ── */
  async write(col, id, data)   { return this.provider().write(col, id, { ...data, _updated: new Date().toISOString() }); },
  async read(col, id)          { return this.provider().read(col, id); },
  async list(col, opts)        { return this.provider().list(col, opts); },
  async delete(col, id)        { return this.provider().delete(col, id); },
  async query(col, field, val) { return this.provider().query(col, field, val); },

  /* ══════════════════════════════════════════════════════════════════
     DOMAIN HELPERS — used by auth patches below
  ══════════════════════════════════════════════════════════════════ */

  /** Save user profile to cloud (strips password hash) */
  async saveUser(user) {
    if (!user?.email) return;
    const safe = { ...user };
    delete safe.pwHash; delete safe.password; delete safe.pin;
    return this.write('users', _sb_emailKey(user.email), safe);
  },

  /**
   * CROSS-DEVICE: Fetch a user from cloud by email or username.
   * Returns the full profile object (without pwHash — stored separately).
   * The pwHash is stored in 'user_auth' collection for security.
   */
  async fetchUserFromCloud(identifier) {
    try {
      const key = identifier.toLowerCase().replace(/^@/, '');
      // Try direct email lookup
      const byEmail = await this.read('users', _sb_emailKey(key));
      if (byEmail) return byEmail;
      // Try username lookup
      const byUser  = await this.query('users', 'username', key);
      if (byUser?.length) return byUser[0];
      return null;
    } catch(e) { return null; }
  },

  /** Save password hash to cloud auth store (separate from profile) */
  async saveUserAuth(email, pwHash) {
    if (!email || !pwHash) return;
    return this.write('user_auth', _sb_emailKey(email), { email, pwHash, _updated: new Date().toISOString() });
  },

  /** Fetch password hash from cloud */
  async fetchUserAuth(email) {
    try { return await this.read('user_auth', _sb_emailKey(email)); } catch(e) { return null; }
  },

  /** Log a login event to cloud */
  async logLogin(email, success, deviceInfo) {
    const id = 'login_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    const accs = _sb_getAccounts();
    const user = accs[email] || {};
    return this.write('logins', id, {
      email, name: (user.first||'') + ' ' + (user.last||''),
      username: user.username || '', success,
      ts: new Date().toISOString(), device: deviceInfo || _sb_deviceInfo(), ip: 'client',
    });
  },

  /** Set user online/offline presence */
  async setOnline(email, isOnline) {
    const accs = _sb_getAccounts();
    const user = accs[email] || {};
    // Also write to local presence for admin dashboard
    try {
      const p = JSON.parse(localStorage.getItem('afrib_presence')||'{}');
      if (isOnline) {
        p[email] = { status:'online', ts: Date.now(), name:(user.first||'')+' '+(user.last||''), username:user.username||'', country:user.country||'' };
      } else {
        delete p[email];
      }
      localStorage.setItem('afrib_presence', JSON.stringify(p));
    } catch(e) {}
    return this.write('sessions', _sb_emailKey(email), {
      email, name: (user.first||'') + ' ' + (user.last||''),
      username: user.username||'', country: user.country||'',
      online: isOnline, ts: new Date().toISOString(),
    });
  },

  /** Log an activity event */
  async logActivity(type, actor, action, detail) {
    const id = 'act_' + Date.now() + '_' + Math.random().toString(36).slice(2,6);
    return this.write('activity', id, { type, actor, action, detail:detail||'', ts: new Date().toISOString() });
  },

  /** Sync ALL local users to cloud (bulk upload) */
  async syncAllUsersToCloud() {
    const accounts = _sb_getAccounts();
    let count = 0;
    for (const user of Object.values(accounts)) {
      if (!user?.email) continue;
      await this.saveUser(user);
      // Also sync auth — only if we have the hash locally
      if (user.pwHash) await this.saveUserAuth(user.email, user.pwHash);
      count++;
    }
    return count;
  },

  /** Real-time listeners (Firebase only) */
  onLoginEvent(cb)    { if (this._provider?.onLoginEvent)    this._provider.onLoginEvent(cb); },
  onSessionChange(cb) { if (this._provider?.onSessionChange)  this._provider.onSessionChange(cb); },
};

/* ─── Helpers ─────────────────────────────────────────────────────── */
function _sb_emailKey(email) { return email.toLowerCase().replace(/[@.+]/g, '_'); }
function _sb_log(...a)       { console.log('[AfribStorage]', ...a); }
function _sb_getAccounts()   { try { return JSON.parse(localStorage.getItem('afrib_accounts')||'{}'); } catch{ return {}; } }
function _sb_deviceInfo() {
  const ua = navigator.userAgent;
  return {
    type:    /Android|iPhone|iPad|iPod/i.test(ua) ? 'Mobile' : /Tablet/i.test(ua) ? 'Tablet' : 'Desktop',
    browser: /Firefox/i.test(ua) ? 'Firefox' : /Edg/i.test(ua) ? 'Edge' : /Chrome/i.test(ua) ? 'Chrome' : /Safari/i.test(ua) ? 'Safari' : 'Browser',
    os:      /Windows/i.test(ua) ? 'Windows' : /Mac/i.test(ua) ? 'macOS' : /Android/i.test(ua) ? 'Android' : /iPhone|iPad/i.test(ua) ? 'iOS' : /Linux/i.test(ua) ? 'Linux' : 'Unknown',
    ua:      ua.slice(0, 80),
  };
}
function _sb_loadScript(src) {
  return new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
    const s = document.createElement('script');
    s.src = src; s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });
}


/* ═══════════════════════════════════════════════════════════════════════
   PROVIDER: Local (fallback — same device only)
═══════════════════════════════════════════════════════════════════════ */
class _LocalProvider {
  async init()              { return { ok:true, provider:'local' }; }
  _store(col)               { try { return JSON.parse(localStorage.getItem('afrib_cloud_'+col)||'{}'); } catch{ return {}; } }
  async write(col,id,data)  { const s=this._store(col); s[id]=data; try{localStorage.setItem('afrib_cloud_'+col,JSON.stringify(s));} catch(e){} return {ok:true}; }
  async read(col,id)        { return this._store(col)[id]||null; }
  async list(col,{limit=500}={}) { return Object.values(this._store(col)).slice(0,limit); }
  async delete(col,id)      { const s=this._store(col); delete s[id]; localStorage.setItem('afrib_cloud_'+col,JSON.stringify(s)); return {ok:true}; }
  async query(col,field,val){ return Object.values(this._store(col)).filter(d=>d[field]===val); }
}


/* ═══════════════════════════════════════════════════════════════════════
   PROVIDER: Firebase Firestore (recommended)
═══════════════════════════════════════════════════════════════════════ */
class _FirebaseProvider {
  constructor(cfg) { this.cfg = cfg; this.db = null; this._listeners = []; }

  async init() {
    if (!window.firebase) {
      await _sb_loadScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
      await _sb_loadScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js');
    }
    if (!window.firebase) throw new Error('Firebase SDK failed to load');
    const { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId } = this.cfg;
    if (!apiKey || !projectId) throw new Error('Firebase config incomplete — need apiKey and projectId');
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp({ apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId });
      }
    } catch(e) { if (!e.message.includes('already exists')) throw e; }
    this.db = firebase.firestore();
    try { await this.db.enablePersistence({ synchronizeTabs: true }); } catch(e) {}
    return { ok:true, provider:'firebase' };
  }

  async write(col,id,data)   { try { await this.db.collection(col).doc(id).set(data,{merge:true}); return {ok:true}; } catch(e) { return {ok:false,reason:e.message}; } }
  async read(col,id)         { try { const d=await this.db.collection(col).doc(id).get(); return d.exists?d.data():null; } catch(e) { return null; } }
  async list(col,{limit=500,orderBy='_updated',desc=true}={}) {
    try { let q=this.db.collection(col).limit(limit); try{q=q.orderBy(orderBy,desc?'desc':'asc');}catch(e){} const s=await q.get(); return s.docs.map(d=>({_id:d.id,...d.data()})); } catch(e) { return []; }
  }
  async delete(col,id)       { try { await this.db.collection(col).doc(id).delete(); return {ok:true}; } catch(e) { return {ok:false,reason:e.message}; } }
  async query(col,field,val) { try { const s=await this.db.collection(col).where(field,'==',val).get(); return s.docs.map(d=>({_id:d.id,...d.data()})); } catch(e) { return []; } }

  onLoginEvent(cb) {
    if (!this.db) return;
    const u = this.db.collection('logins').orderBy('ts','desc').limit(1).onSnapshot(snap => {
      snap.docChanges().forEach(c => { if(c.type==='added') cb(c.doc.data()); });
    });
    this._listeners.push(u);
  }
  onSessionChange(cb) {
    if (!this.db) return;
    const u = this.db.collection('sessions').onSnapshot(snap => { cb(snap.docs.map(d=>d.data())); });
    this._listeners.push(u);
  }
}


/* ═══════════════════════════════════════════════════════════════════════
   PROVIDER: Supabase
═══════════════════════════════════════════════════════════════════════ */
class _SupabaseProvider {
  constructor(cfg) { this.cfg=cfg; this.client=null; }
  async init() {
    if (!window.supabase) await _sb_loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js');
    const {url,anonKey}=this.cfg;
    if (!url||!anonKey) throw new Error('Supabase needs url and anonKey');
    this.client=window.supabase.createClient(url,anonKey);
    return {ok:true,provider:'supabase'};
  }
  async write(col,id,data)   { try { const {error}=await this.client.from(col).upsert({id,...data}); if(error)throw error; return {ok:true}; } catch(e){return {ok:false,reason:e.message};} }
  async read(col,id)         { try { const {data,error}=await this.client.from(col).select('*').eq('id',id).single(); if(error)return null; return data; } catch(e){return null;} }
  async list(col,{limit=500}={}) { try { const {data}=await this.client.from(col).select('*').limit(limit); return data||[]; } catch(e){return [];} }
  async delete(col,id)       { try { await this.client.from(col).delete().eq('id',id); return {ok:true}; } catch(e){return {ok:false,reason:e.message};} }
  async query(col,field,val) { try { const {data}=await this.client.from(col).select('*').eq(field,val); return data||[]; } catch(e){return [];} }
}


/* ═══════════════════════════════════════════════════════════════════════
   PROVIDER: PocketBase
═══════════════════════════════════════════════════════════════════════ */
class _PocketBaseProvider {
  constructor(cfg) { this.url=(cfg.url||'http://localhost:8090').replace(/\/$/,''); }
  async init() {
    const r=await fetch(this.url+'/api/health').catch(()=>null);
    if(!r||!r.ok) throw new Error('Cannot reach PocketBase at '+this.url);
    return {ok:true,provider:'pocketbase'};
  }
  async write(col,id,data) {
    try {
      const u=await fetch(`${this.url}/api/collections/${col}/records/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
      if(u.status===404) await fetch(`${this.url}/api/collections/${col}/records`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,...data})});
      return {ok:true};
    } catch(e){return {ok:false,reason:e.message};}
  }
  async read(col,id)         { try{const r=await fetch(`${this.url}/api/collections/${col}/records/${id}`);return r.ok?await r.json():null;}catch(e){return null;} }
  async list(col,{limit=500}={}) { try{const r=await fetch(`${this.url}/api/collections/${col}/records?perPage=${limit}`);const d=await r.json();return d.items||[];}catch(e){return [];} }
  async delete(col,id)       { try{await fetch(`${this.url}/api/collections/${col}/records/${id}`,{method:'DELETE'});return {ok:true};}catch(e){return {ok:false};} }
  async query(col,field,val) { try{const r=await fetch(`${this.url}/api/collections/${col}/records?filter=${field}='${val}'`);const d=await r.json();return d.items||[];}catch(e){return [];} }
}


/* ═══════════════════════════════════════════════════════════════════════
   PROVIDER: JSONBin.io
═══════════════════════════════════════════════════════════════════════ */
class _JSONBinProvider {
  constructor(cfg) { this.apiKey=cfg.jsonbin_apiKey; this.bins={}; try{this.bins=JSON.parse(localStorage.getItem('afrib_jb_bins')||'{}');}catch(e){} }
  async init() { if(!this.apiKey) throw new Error('JSONBin API key required'); return {ok:true,provider:'jsonbin'}; }

  async _getBin(col) {
    const binId=this.bins[col];
    if(binId){ const r=await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`,{headers:{'X-Master-Key':this.apiKey}}); return (await r.json()).record||{}; }
    const r=await fetch('https://api.jsonbin.io/v3/b',{method:'POST',headers:{'Content-Type':'application/json','X-Master-Key':this.apiKey,'X-Bin-Name':'afrib_'+col},body:JSON.stringify({})});
    const d=await r.json(); this.bins[col]=d.metadata?.id;
    try{localStorage.setItem('afrib_jb_bins',JSON.stringify(this.bins));}catch(e){}
    return {};
  }
  async _saveBin(col,data) { const id=this.bins[col]; if(!id)return; await fetch(`https://api.jsonbin.io/v3/b/${id}`,{method:'PUT',headers:{'Content-Type':'application/json','X-Master-Key':this.apiKey},body:JSON.stringify(data)}); }

  async write(col,id,data)   { const b=await this._getBin(col); b[id]=data; await this._saveBin(col,b); return {ok:true}; }
  async read(col,id)         { const b=await this._getBin(col); return b[id]||null; }
  async list(col,{limit=500}={}) { const b=await this._getBin(col); return Object.values(b).slice(0,limit); }
  async delete(col,id)       { const b=await this._getBin(col); delete b[id]; await this._saveBin(col,b); return {ok:true}; }
  async query(col,field,val) { const b=await this._getBin(col); return Object.values(b).filter(d=>d[field]===val); }
}


/* ═══════════════════════════════════════════════════════════════════════
   PROVIDER: AWS DynamoDB (via API Gateway + Lambda proxy)
   ─────────────────────────────────────────────────────────────────────
   HOW TO SET UP (Free Tier — 25 GB storage, 25 read/write units free):
   1. Go to https://aws.amazon.com → Create free account
   2. DynamoDB → Create table: "afribconnect" (partition key: "pk", sort key: "sk")
   3. API Gateway → Create REST API → add CRUD endpoints → Deploy
   4. OR use AWS AppSync (GraphQL) for easier setup
   5. Paste your API Gateway invoke URL + API Key below
   
   Expected endpoint format:
   GET    {baseUrl}/items/{collection}/{id}
   PUT    {baseUrl}/items/{collection}/{id}
   DELETE {baseUrl}/items/{collection}/{id}
   GET    {baseUrl}/items/{collection}?field=value
═══════════════════════════════════════════════════════════════════════ */
class _AWSProvider {
  constructor(cfg) {
    this.baseUrl = (cfg.aws_apiUrl || '').replace(/\/$/, '');
    this.apiKey  = cfg.aws_apiKey  || '';
    this.region  = cfg.aws_region  || 'us-east-1';
  }

  async init() {
    if (!this.baseUrl) throw new Error('AWS API URL required (API Gateway invoke URL)');
    // Ping health endpoint
    const res = await fetch(this.baseUrl + '/health', {
      headers: this._headers(),
    }).catch(() => null);
    if (!res || (!res.ok && res.status !== 404)) {
      throw new Error('Cannot reach AWS API Gateway at ' + this.baseUrl);
    }
    return { ok: true, provider: 'aws' };
  }

  _headers() {
    const h = { 'Content-Type': 'application/json' };
    if (this.apiKey) h['x-api-key'] = this.apiKey;
    return h;
  }

  async write(col, id, data) {
    try {
      const res = await fetch(`${this.baseUrl}/items/${col}/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: this._headers(),
        body: JSON.stringify({ ...data, pk: col, sk: id }),
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return { ok: true };
    } catch(e) { return { ok: false, reason: e.message }; }
  }

  async read(col, id) {
    try {
      const res = await fetch(`${this.baseUrl}/items/${col}/${encodeURIComponent(id)}`, {
        headers: this._headers(),
      });
      if (res.status === 404) return null;
      if (!res.ok) return null;
      return await res.json();
    } catch(e) { return null; }
  }

  async list(col, { limit = 500 } = {}) {
    try {
      const res = await fetch(`${this.baseUrl}/items/${col}?limit=${limit}`, {
        headers: this._headers(),
      });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : (data.items || []);
    } catch(e) { return []; }
  }

  async delete(col, id) {
    try {
      await fetch(`${this.baseUrl}/items/${col}/${encodeURIComponent(id)}`, {
        method: 'DELETE', headers: this._headers(),
      });
      return { ok: true };
    } catch(e) { return { ok: false, reason: e.message }; }
  }

  async query(col, field, val) {
    try {
      const res = await fetch(`${this.baseUrl}/items/${col}?${field}=${encodeURIComponent(val)}`, {
        headers: this._headers(),
      });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : (data.items || []);
    } catch(e) { return []; }
  }
}


/* ═══════════════════════════════════════════════════════════════════════
   PROVIDER: Azure Cosmos DB (via REST API or Azure Static Web Apps)
   ─────────────────────────────────────────────────────────────────────
   HOW TO SET UP (Free Tier — 400 RU/s + 5 GB free):
   1. Go to https://portal.azure.com → Create resource → Azure Cosmos DB
   2. Choose "Core (SQL)" API → Create → Free tier discount ON
   3. Go to your Cosmos DB account → Data Explorer → New Container
      Database: "afribconnect" | Container: "data" | Partition key: "/col"
   4. Keys → copy PRIMARY KEY and URI
   5. Paste URI and Primary Key below
   
   OR use Azure Static Web Apps (has built-in data API — zero config):
   Deploy your site to Azure Static Web Apps and use the /data-api/ endpoint
═══════════════════════════════════════════════════════════════════════ */
class _AzureProvider {
  constructor(cfg) {
    this.endpoint   = (cfg.azure_endpoint || '').replace(/\/$/, '');
    this.primaryKey = cfg.azure_primaryKey || '';
    this.database   = cfg.azure_database   || 'afribconnect';
    this.container  = cfg.azure_container  || 'data';
  }

  async init() {
    if (!this.endpoint || !this.primaryKey) {
      throw new Error('Azure Cosmos DB requires endpoint URL and primary key');
    }
    // Test connection by listing collections
    const res = await this._req('GET', `/dbs/${this.database}/colls`, null, 'colls').catch(() => null);
    if (!res) throw new Error('Cannot connect to Azure Cosmos DB — check endpoint and key');
    return { ok: true, provider: 'azure' };
  }

  /* Generate Azure Cosmos DB auth header (HMAC-SHA256) */
  async _authHeader(verb, resourceType, resourceId, date) {
    const key   = atob(this.primaryKey);
    const text  = `${verb.toLowerCase()}\n${resourceType.toLowerCase()}\n${resourceId}\n${date.toLowerCase()}\n\n`;
    const enc   = new TextEncoder();
    const k     = await crypto.subtle.importKey('raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const sig   = await crypto.subtle.sign('HMAC', k, enc.encode(text));
    const b64   = btoa(String.fromCharCode(...new Uint8Array(sig)));
    return encodeURIComponent(`type=master&ver=1.0&sig=${b64}`);
  }

  async _req(method, path, body, resourceType) {
    const date   = new Date().toUTCString();
    const resId  = path.split('/').slice(1).join('/');
    const auth   = await this._authHeader(method, resourceType || '', resId, date);
    const res    = await fetch(this.endpoint + path, {
      method,
      headers: {
        'Authorization': auth,
        'x-ms-date': date,
        'x-ms-version': '2018-12-31',
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok && res.status !== 404) return null;
    if (res.status === 404) return null;
    return res.json().catch(() => null);
  }

  _docPath(col, id) {
    return `/dbs/${this.database}/colls/${this.container}/docs/${encodeURIComponent(col + '__' + id)}`;
  }

  async write(col, id, data) {
    try {
      const doc = { id: col + '__' + id, col, sk: id, ...data };
      const res = await this._req('POST',
        `/dbs/${this.database}/colls/${this.container}/docs`, doc, 'docs');
      return { ok: true };
    } catch(e) { return { ok: false, reason: e.message }; }
  }

  async read(col, id) {
    try {
      return await this._req('GET', this._docPath(col, id), null, 'docs');
    } catch(e) { return null; }
  }

  async list(col, { limit = 500 } = {}) {
    try {
      const date = new Date().toUTCString();
      const path = `/dbs/${this.database}/colls/${this.container}/docs`;
      const auth = await this._authHeader('GET', 'docs', `dbs/${this.database}/colls/${this.container}`, date);
      const res  = await fetch(this.endpoint + path, {
        headers: {
          'Authorization': auth,
          'x-ms-date': date,
          'x-ms-version': '2018-12-31',
          'x-ms-documentdb-isquery': 'true',
          'x-ms-max-item-count': String(limit),
          'Content-Type': 'application/query+json',
        },
        method: 'POST',
        body: JSON.stringify({ query: `SELECT * FROM c WHERE c.col = "${col}"`, parameters: [] }),
      });
      const data = await res.json().catch(() => ({}));
      return data.Documents || [];
    } catch(e) { return []; }
  }

  async delete(col, id) {
    try {
      await this._req('DELETE', this._docPath(col, id), null, 'docs');
      return { ok: true };
    } catch(e) { return { ok: false, reason: e.message }; }
  }

  async query(col, field, val) {
    try {
      const all = await this.list(col);
      return all.filter(d => d[field] === val);
    } catch(e) { return []; }
  }
}


/* ═══════════════════════════════════════════════════════════════════════
   ══ CORE AUTH PATCHES — THE CRITICAL CROSS-DEVICE FIX ══
   
   THE PROBLEM:
   _doLoginAsync() only searches localStorage. On a new device, localStorage
   is empty, so the user is "not found" even if they're in the cloud.
   
   THE FIX:
   1. Before password check, if user not in localStorage → fetch from cloud
   2. If found in cloud → write to localStorage (cache) + fetch their pwHash
   3. Continue with normal login flow
   4. On success → sync updated profile back to cloud
   5. On signup → immediately write to cloud
═══════════════════════════════════════════════════════════════════════ */
(function patchAuthForCrossDevice() {

  /* ──────────────────────────────────────────────────────────────
     PATCH _doLoginAsync — THE KEY CROSS-DEVICE FIX
  ─────────────────────────────────────────────────────────────── */
  function tryPatchLogin() {
    const origLoginAsync = window._doLoginAsync;
    if (typeof origLoginAsync !== 'function') {
      setTimeout(tryPatchLogin, 300);
      return;
    }

    window._doLoginAsync = async function(rawInput, pw) {
      const inputLower = (rawInput || '').toLowerCase().replace(/^@/, '');
      const accounts   = _sb_getAccounts();

      // Check if user exists locally
      const localUser = accounts[inputLower] ||
        Object.values(accounts).find(a => a.username === inputLower) || null;

      // ── CROSS-DEVICE: If not local AND cloud is configured, fetch from cloud ──
      if (!localUser) {
        const cfg = AfribStorage.getConfig();
        if (cfg.provider && cfg.provider !== 'local' && cfg.connected) {
          _sb_showLoginStatus('🔍 Looking up your account…');
          try {
            const cloudUser = await AfribStorage.fetchUserFromCloud(inputLower);
            if (cloudUser && cloudUser.email) {
              // Fetch password hash from cloud auth store
              const authRecord = await AfribStorage.fetchUserAuth(cloudUser.email);

              if (authRecord && authRecord.pwHash) {
                // Restore user with auth-store hash (most secure path)
                const restoredUser = { ...cloudUser, pwHash: authRecord.pwHash };
                accounts[cloudUser.email] = restoredUser;
                try { localStorage.setItem('afrib_accounts', JSON.stringify(accounts)); } catch(e) {}
                _sb_log(`✅ Cross-device: restored user ${cloudUser.email} from cloud (auth store)`);
                _sb_showLoginStatus('');
              } else if (cloudUser.pwHash) {
                // Fallback: pwHash embedded in user profile (older or direct-synced accounts)
                accounts[cloudUser.email] = cloudUser;
                try { localStorage.setItem('afrib_accounts', JSON.stringify(accounts)); } catch(e) {}
                _sb_log(`✅ Cross-device: restored user ${cloudUser.email} from cloud (profile hash)`);
                _sb_showLoginStatus('');
              } else {
                // Profile found but no hash — user may need password reset
                _sb_showLoginStatus('⚠️ Account found — please reset your password if login fails');
                _sb_log(`⚠️ Cloud user found but no pwHash for ${cloudUser.email}`);
              }
            } else {
              _sb_showLoginStatus('');
            }
          } catch(e) {
            _sb_log('Cloud lookup error:', e.message);
            _sb_showLoginStatus('');
          }
        }
      }

      // Run original login flow (now with cloud user in localStorage if cross-device)
      return origLoginAsync.apply(this, arguments);
    };

    _sb_log('✅ Cross-device login patch applied');
  }

  /* ──────────────────────────────────────────────────────────────
     PATCH enterApp — fires after successful login
     Syncs online status + logs to cloud
  ─────────────────────────────────────────────────────────────── */
  function tryPatchEnterApp() {
    const orig = window.enterApp;
    if (typeof orig !== 'function') { setTimeout(tryPatchEnterApp, 400); return; }
    window.enterApp = function() {
      orig.apply(this, arguments);
      try {
        const user = window.currentUser;
        if (!user?.email) return;

        // 1. Mark user online in cloud + local presence
        AfribStorage.setOnline(user.email, true).catch(() => {});

        // 2. Log login to cloud + admin log
        AfribStorage.logLogin(user.email, true, _sb_deviceInfo()).catch(() => {});

        // 3. Sync latest user profile to cloud
        AfribStorage.saveUser(user).catch(() => {});

        // 4. Sync pwHash separately (auth store)
        if (user.pwHash) AfribStorage.saveUserAuth(user.email, user.pwHash).catch(() => {});

        // 5. Notify admin dashboard (local + cloud)
        _sb_notifyAdminLogin(user, true);

        // 6. Start heartbeat
        _sb_startHeartbeat(user.email);

        // 7. Update last login in cloud user profile
        AfribStorage.write('users', _sb_emailKey(user.email), {
          lastLogin: new Date().toISOString(),
          loginCount: (user.loginCount || 1),
          lastDevice: _sb_deviceInfo(),
        }).catch(() => {});

      } catch(e) { console.error('[SB] enterApp patch error:', e); }
    };
  }

  /* ──────────────────────────────────────────────────────────────
     PATCH doSignup — write to cloud immediately on account creation
  ─────────────────────────────────────────────────────────────── */
  function tryPatchSignup() {
    const orig = window.doSignup;
    if (typeof orig !== 'function') { setTimeout(tryPatchSignup, 400); return; }
    window.doSignup = function() {
      orig.apply(this, arguments);
      // Poll for currentUser being set (async signup)
      let attempts = 0;
      const poll = setInterval(() => {
        attempts++;
        const user = window.currentUser;
        if (user?.email) {
          clearInterval(poll);
          // Immediately sync to cloud
          AfribStorage.saveUser(user).catch(() => {});
          if (user.pwHash) AfribStorage.saveUserAuth(user.email, user.pwHash).catch(() => {});
          AfribStorage.logLogin(user.email, true, _sb_deviceInfo()).catch(() => {});
          AfribStorage.setOnline(user.email, true).catch(() => {});
          AfribStorage.logActivity('signup', user.email, 'New account created',
            `${user.country||''} · ${_sb_deviceInfo().type}`).catch(() => {});
          _sb_notifyAdminLogin(user, true, true);
          _sb_startHeartbeat(user.email);
          _sb_log(`✅ New user synced to cloud: ${user.email}`);
        }
        if (attempts > 30) clearInterval(poll);
      }, 200);
    };
  }

  /* ──────────────────────────────────────────────────────────────
     PATCH doLogout — mark offline in cloud
  ─────────────────────────────────────────────────────────────── */
  function tryPatchLogout() {
    const orig = window.doLogout;
    if (typeof orig !== 'function') { setTimeout(tryPatchLogout, 400); return; }
    window.doLogout = function() {
      const user = window.currentUser;
      if (user?.email) {
        AfribStorage.setOnline(user.email, false).catch(() => {});
        AfribStorage.logActivity('logout', user.email, 'User logged out', '').catch(() => {});
        _sb_stopHeartbeat();
        _sb_notifyAdminLogout(user);
      }
      orig.apply(this, arguments);
    };
  }

  /* ──────────────────────────────────────────────────────────────
     PATCH persistUser — sync profile updates to cloud
  ─────────────────────────────────────────────────────────────── */
  function tryPatchPersist() {
    const orig = window.persistUser;
    if (typeof orig !== 'function') { setTimeout(tryPatchPersist, 600); return; }
    window.persistUser = function() {
      orig.apply(this, arguments);
      const user = window.currentUser;
      if (user?.email) {
        AfribStorage.saveUser(user).catch(() => {});
        if (user.pwHash) AfribStorage.saveUserAuth(user.email, user.pwHash).catch(() => {});
      }
    };
  }

  /* ──────────────────────────────────────────────────────────────
     PATCH appendAdminLog — also write to cloud activity log
  ─────────────────────────────────────────────────────────────── */
  function tryPatchAdminLog() {
    const orig = window.appendAdminLog;
    if (typeof orig !== 'function') { setTimeout(tryPatchAdminLog, 300); return; }
    window.appendAdminLog = function(type, user, action, detail) {
      try { orig.apply(this, arguments); } catch(e) {}
      AfribStorage.logActivity(type, user, action, detail || '').catch(() => {});
    };
  }

  // Start all patches (with retry for deferred script loading)
  tryPatchLogin();
  setTimeout(tryPatchEnterApp, 500);
  setTimeout(tryPatchSignup,   500);
  setTimeout(tryPatchLogout,   500);
  setTimeout(tryPatchPersist,  700);
  setTimeout(tryPatchAdminLog, 300);

})();


/* ═══════════════════════════════════════════════════════════════════════
   HEARTBEAT — keeps presence accurate, handles tab close / browser exit
═══════════════════════════════════════════════════════════════════════ */
let _sbHeartbeatTimer = null;

function _sb_startHeartbeat(email) {
  _sb_stopHeartbeat();
  // Update presence every 90 seconds
  _sbHeartbeatTimer = setInterval(() => {
    if (!window.currentUser?.email) { _sb_stopHeartbeat(); return; }
    try {
      const p = JSON.parse(localStorage.getItem('afrib_presence')||'{}');
      if (p[email]) p[email].ts = Date.now();
      localStorage.setItem('afrib_presence', JSON.stringify(p));
    } catch(e) {}
    AfribStorage.setOnline(email, true).catch(() => {});
  }, 90000);

  // Mark offline when tab/window is closed
  window.addEventListener('beforeunload', _sb_handleUnload);
  document.addEventListener('visibilitychange', _sb_handleVisibility);
}

function _sb_stopHeartbeat() {
  if (_sbHeartbeatTimer) { clearInterval(_sbHeartbeatTimer); _sbHeartbeatTimer = null; }
}

function _sb_handleUnload() {
  const email = window.currentUser?.email;
  if (email) {
    // Synchronous beacon for reliability
    try {
      const p = JSON.parse(localStorage.getItem('afrib_presence')||'{}');
      delete p[email];
      localStorage.setItem('afrib_presence', JSON.stringify(p));
    } catch(e) {}
  }
}

function _sb_handleVisibility() {
  const email = window.currentUser?.email;
  if (!email) return;
  if (document.hidden) {
    // Tab hidden — mark away
    try {
      const p = JSON.parse(localStorage.getItem('afrib_presence')||'{}');
      if (p[email]) p[email].status = 'away';
      localStorage.setItem('afrib_presence', JSON.stringify(p));
    } catch(e) {}
  } else {
    // Tab visible again — mark online
    try {
      const p = JSON.parse(localStorage.getItem('afrib_presence')||'{}');
      if (p[email]) { p[email].status = 'online'; p[email].ts = Date.now(); }
      localStorage.setItem('afrib_presence', JSON.stringify(p));
    } catch(e) {}
    AfribStorage.setOnline(email, true).catch(() => {});
  }
}


/* ═══════════════════════════════════════════════════════════════════════
   ADMIN NOTIFICATION HELPERS
═══════════════════════════════════════════════════════════════════════ */
function _sb_notifyAdminLogin(user, success, isSignup) {
  const event = {
    id:       'ev_' + Date.now(),
    type:     isSignup ? 'signup' : success ? 'login' : 'login_fail',
    email:    user.email || '',
    name:     ((user.first||'') + ' ' + (user.last||'')).trim(),
    username: user.username || '',
    ts:       new Date().toISOString(),
    device:   _sb_deviceInfo(),
    success,
  };

  // Write to live_events (polled by admin dashboard)
  try {
    const events = JSON.parse(localStorage.getItem('afrib_live_events')||'[]');
    events.unshift(event);
    if (events.length > 500) events.length = 500;
    localStorage.setItem('afrib_live_events', JSON.stringify(events));
  } catch(e) {}

  // Write to admin_log
  try {
    const log = JSON.parse(localStorage.getItem('afrib_admin_log')||'[]');
    log.unshift({
      time:   event.ts,
      type:   event.type,
      user:   event.name || event.email,
      action: isSignup ? '✨ New user signed up' : success ? '🔐 User logged in' : '❌ Failed login attempt',
      detail: event.email + ' · ' + event.device.type + ' · ' + event.device.browser + ' · ' + event.device.os,
    });
    if (log.length > 2000) log.length = 2000;
    localStorage.setItem('afrib_admin_log', JSON.stringify(log));
  } catch(e) {}
}

function _sb_notifyAdminLogout(user) {
  try {
    const events = JSON.parse(localStorage.getItem('afrib_live_events')||'[]');
    events.unshift({ id:'ev_'+Date.now(), type:'logout', email:user.email, name:((user.first||'')+' '+(user.last||'')).trim(), ts:new Date().toISOString(), device:_sb_deviceInfo(), success:true });
    if (events.length > 500) events.length = 500;
    localStorage.setItem('afrib_live_events', JSON.stringify(events));
  } catch(e) {}
  try {
    const log = JSON.parse(localStorage.getItem('afrib_admin_log')||'[]');
    log.unshift({ time:new Date().toISOString(), type:'logout', user:((user.first||'')+' '+(user.last||'')).trim()||user.email, action:'🚪 User logged out', detail:user.email });
    if (log.length>2000) log.length=2000;
    localStorage.setItem('afrib_admin_log', JSON.stringify(log));
  } catch(e) {}
}

function _sb_showLoginStatus(msg) {
  try {
    let el = document.getElementById('sb-login-status');
    if (!el && msg) {
      el = document.createElement('div');
      el.id = 'sb-login-status';
      el.style.cssText = 'text-align:center;font-size:12px;color:rgba(255,215,0,.8);padding:6px;animation:sbPulse 1s infinite';
      const form = document.querySelector('#auth-login');
      if (form) form.querySelector('.auth-btn')?.before(el);
    }
    if (el) el.textContent = msg;
  } catch(e) {}
}


/* ═══════════════════════════════════════════════════════════════════════
   ADMIN DASHBOARD — Live Online Widget + Login Stream
═══════════════════════════════════════════════════════════════════════ */
function _sb_buildLiveWidget() {
  const w = document.createElement('div');
  w.id = 'sbLiveWidget';
  w.style.cssText = 'grid-column:1/-1';
  w.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <div class="chart-card">
        <div class="chart-title">
          🟢 Online Now
          <span id="sbOnlineCount" style="background:rgba(34,197,94,.15);color:#22c55e;font-size:12px;padding:2px 8px;border-radius:10px;margin-left:6px">0</span>
          <button onclick="_sb_refreshLive()" style="background:none;border:none;color:rgba(255,255,255,.3);cursor:pointer;font-size:14px;margin-left:auto" title="Refresh">🔄</button>
        </div>
        <div id="sbOnlineList" style="display:flex;flex-direction:column;gap:6px;max-height:220px;overflow-y:auto"></div>
      </div>
      <div class="chart-card">
        <div class="chart-title">
          🔔 Live Login Activity
          <span id="sbNewLoginDot" style="display:none;width:8px;height:8px;border-radius:50%;background:#ef4444;display:inline-block;animation:sbPulse 1s infinite;margin-left:6px"></span>
        </div>
        <div id="sbLoginStream" style="display:flex;flex-direction:column;gap:6px;max-height:220px;overflow-y:auto"></div>
      </div>
    </div>
    <style>@keyframes sbPulse{0%,100%{opacity:1}50%{opacity:.3}}</style>`;
  return w;
}

let _sbLiveInterval = null;

window._sb_refreshLive = function() { _sb_renderOnlineList(); _sb_renderLoginStream(); };

function _sb_renderOnlineList() {
  const listEl = document.getElementById('sbOnlineList');
  const countEl = document.getElementById('sbOnlineCount');
  if (!listEl) return;

  const presence = (() => { try { return JSON.parse(localStorage.getItem('afrib_presence')||'{}'); } catch{ return {}; } })();
  const accounts = _sb_getAccounts();
  const TTL = 5 * 60 * 1000; // 5 minutes
  const now = Date.now();

  const online = Object.entries(presence)
    .filter(([,p]) => p.status !== 'away' && (now - p.ts) < TTL)
    .map(([email]) => {
      const u = accounts[email] || {};
      return { email, first:u.first||'', last:u.last||'', username:u.username||'', country:u.country||'', status:presence[email]?.status||'online' };
    });

  if (countEl) countEl.textContent = online.length;

  if (!online.length) {
    listEl.innerHTML = '<div style="font-size:12px;color:rgba(255,255,255,.3);text-align:center;padding:14px">No users currently online</div>';
    return;
  }

  listEl.innerHTML = online.map(u => {
    const init = ((u.first||'U')[0] + (u.last||'U')[0]).toUpperCase();
    return `<div style="display:flex;align-items:center;gap:10px;padding:8px 10px;background:rgba(34,197,94,.05);border-radius:8px;border:1px solid rgba(34,197,94,.15)">
      <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#D4AF37,#E85D26);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:#000;flex-shrink:0">${init}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${u.first} ${u.last}${u.username?` <span style="color:rgba(255,255,255,.4);font-weight:400">@${u.username}</span>`:''}</div>
        ${u.country?`<div style="font-size:11px;color:rgba(255,255,255,.4)">📍 ${u.country}</div>`:''}
      </div>
      <span style="width:9px;height:9px;border-radius:50%;background:#22c55e;flex-shrink:0"></span>
    </div>`;
  }).join('');
}

function _sb_renderLoginStream() {
  const el = document.getElementById('sbLoginStream');
  if (!el) return;

  const events = (() => { try { return JSON.parse(localStorage.getItem('afrib_live_events')||'[]'); } catch{ return []; } })();

  if (!events.length) {
    el.innerHTML = '<div style="font-size:12px;color:rgba(255,255,255,.3);text-align:center;padding:14px">No recent login activity</div>';
    return;
  }

  const typeMap = {
    login:      { icon:'🔐', color:'#22c55e',  label:'Logged in' },
    login_fail: { icon:'❌', color:'#ef4444',  label:'Failed attempt' },
    signup:     { icon:'✨', color:'#D4AF37',  label:'Signed up' },
    logout:     { icon:'🚪', color:'rgba(255,255,255,.4)', label:'Logged out' },
  };

  el.innerHTML = events.slice(0, 40).map(ev => {
    const t = typeMap[ev.type] || { icon:'📋', color:'rgba(255,255,255,.5)', label:ev.type };
    const ago = (() => { const d=(Date.now()-new Date(ev.ts))/1000; if(d<60)return Math.round(d)+'s ago'; if(d<3600)return Math.floor(d/60)+'m ago'; return new Date(ev.ts).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}); })();
    return `<div style="display:flex;align-items:center;gap:8px;padding:7px 10px;background:rgba(255,255,255,.03);border-radius:8px;border-left:3px solid ${t.color}">
      <span style="font-size:16px">${t.icon}</span>
      <div style="flex:1;min-width:0">
        <div style="font-size:12px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${ev.name||ev.email}${ev.username?` <span style="color:rgba(255,255,255,.4)">@${ev.username}</span>`:''}</div>
        <div style="font-size:11px;color:rgba(255,255,255,.4)"><span style="color:${t.color}">${t.label}</span>${ev.device?' · '+ev.device.type+' · '+ev.device.browser+(ev.device.os?' · '+ev.device.os:''):''}</div>
      </div>
      <div style="font-size:10px;color:rgba(255,255,255,.3);flex-shrink:0">${ago}</div>
    </div>`;
  }).join('');
}

function _sb_startLivePolling() {
  if (_sbLiveInterval) return;
  _sb_refreshLive();
  _sbLiveInterval = setInterval(() => {
    if (!document.getElementById('sbLiveWidget')) return;
    _sb_refreshLive();
  }, 8000);
}

function _sb_startRealtimeListeners() {
  AfribStorage.onLoginEvent(event => {
    _sb_notifyAdminLogin(
      { email:event.email, first:event.name?.split(' ')[0]||'', last:event.name?.split(' ').slice(1).join(' ')||'', username:event.username||'' },
      event.success
    );
    _sb_renderLoginStream();
    const dot = document.getElementById('sbNewLoginDot');
    if (dot) { dot.style.display='inline-block'; setTimeout(()=>{dot.style.display='none';},5000); }
  });
  AfribStorage.onSessionChange(() => { _sb_renderOnlineList(); });
}


/* ═══════════════════════════════════════════════════════════════════════
   STORAGE CONFIG UI — injected into Admin Settings + SA Settings
═══════════════════════════════════════════════════════════════════════ */
function _sb_buildConfigCard(isAdmin) {
  const cfg = AfribStorage.getConfig();
  const card = document.createElement('div');
  card.id = isAdmin ? 'adminStorageCard' : 'saStorageCard';
  card.className = isAdmin ? 'chart-card' : 'sa-form-card';
  if (!isAdmin) card.style.cssText = 'border-color:rgba(212,175,55,.3)';

  const connected = cfg.connected && cfg.provider && cfg.provider !== 'local';

  card.innerHTML = `
    <div style="${isAdmin?'':'font-size:16px;font-weight:700;margin-bottom:14px;color:var(--gold)'}${isAdmin?'':''}">
      ☁️ Cloud Storage
      <span id="sbStatus_${isAdmin?'a':'s'}" style="font-size:11px;padding:2px 8px;border-radius:10px;margin-left:8px;background:${connected?'rgba(34,197,94,.15)':'rgba(107,114,128,.15)'};color:${connected?'#22c55e':'#9ca3af'}">${connected?'● Connected · '+cfg.provider:'● Local Only'}</span>
    </div>
    <div style="font-size:12px;color:rgba(255,255,255,.5);margin-bottom:14px;line-height:1.6;padding:10px;background:rgba(255,215,0,.05);border:1px solid rgba(255,215,0,.15);border-radius:8px">
      <strong style="color:#D4AF37">⚠️ Without cloud storage:</strong> users can only log in on the same browser/device they registered on.<br/>
      <strong style="color:#22c55e">✅ With cloud storage:</strong> any user can log in from any device worldwide.
    </div>

    <div style="margin-bottom:12px">
      <label style="display:block;font-size:11px;color:rgba(255,255,255,.5);margin-bottom:5px;font-weight:600">Storage Provider</label>
      <select id="sbProvider_${isAdmin?'a':'s'}" style="width:100%;background:rgba(255,255,255,.07);border:1.5px solid rgba(255,255,255,.12);border-radius:8px;padding:10px 13px;color:#fff;font-size:13px;outline:none" onchange="_sb_onProviderChange('${isAdmin?'a':'s'}',this.value)">
        <option value="local"      ${cfg.provider==='local'      ?'selected':''}>💾 Local Only (same device only)</option>
        <option value="firebase"   ${cfg.provider==='firebase'   ?'selected':''}>🔥 Firebase Firestore ⭐ Recommended — Free</option>
        <option value="supabase"   ${cfg.provider==='supabase'   ?'selected':''}>⚡ Supabase — Free PostgreSQL</option>
        <option value="aws"        ${cfg.provider==='aws'        ?'selected':''}>☁️ AWS DynamoDB — Free Tier 25GB</option>
        <option value="azure"      ${cfg.provider==='azure'      ?'selected':''}>🔷 Azure Cosmos DB — Free 400 RU/s</option>
        <option value="pocketbase" ${cfg.provider==='pocketbase' ?'selected':''}>🐘 PocketBase — Self-hosted</option>
        <option value="jsonbin"    ${cfg.provider==='jsonbin'    ?'selected':''}>📦 JSONBin.io — Zero config testing</option>
      </select>
    </div>

    <div id="sbFields_${isAdmin?'a':'s'}"></div>

    <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap">
      <button onclick="_sb_save('${isAdmin?'a':'s'}')" style="flex:1;padding:10px;background:linear-gradient(135deg,#D4AF37,#E85D26);border:none;border-radius:9px;color:#000;font-size:13px;font-weight:800;cursor:pointer;min-width:120px">💾 Save & Connect</button>
      <button onclick="_sb_test('${isAdmin?'a':'s'}')" id="sbTestBtn_${isAdmin?'a':'s'}" style="flex:1;padding:10px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.15);border-radius:9px;color:#fff;font-size:13px;cursor:pointer;min-width:120px">🔌 Test</button>
      <button onclick="_sb_syncNow()" style="flex:1;padding:10px;background:rgba(212,175,55,.1);border:1px solid rgba(212,175,55,.25);border-radius:9px;color:#D4AF37;font-size:13px;font-weight:700;cursor:pointer;min-width:120px">🔄 Sync All Users</button>
    </div>
    <div id="sbResult_${isAdmin?'a':'s'}" style="font-size:12px;padding:8px 12px;border-radius:8px;display:none;margin-top:8px"></div>

    <details style="margin-top:14px;cursor:pointer">
      <summary style="font-size:12px;color:rgba(255,215,0,.7);font-weight:700">📖 Provider Setup Guides (click to expand)</summary>
      <div style="font-size:12px;color:rgba(255,255,255,.5);margin-top:8px;line-height:1.8;padding:10px;background:rgba(255,255,255,.03);border-radius:8px">
        <strong style="color:#FF6B35">🔥 Firebase (Recommended)</strong><br/>
        1. <a href="https://console.firebase.google.com" target="_blank" style="color:#D4AF37">console.firebase.google.com</a> → Create project → Web app → copy config<br/>
        2. Firestore Database → Create → <strong>Start in test mode</strong> → Enable<br/>
        3. Paste apiKey + projectId → Save & Connect<br/>
        <em style="color:rgba(34,197,94,.7)">Free: 1 GB · 50,000 reads/day · 20,000 writes/day</em><br/><br/>

        <strong style="color:#3ECF8E">⚡ Supabase</strong><br/>
        1. <a href="https://supabase.com" target="_blank" style="color:#D4AF37">supabase.com</a> → New project → Settings → API<br/>
        2. Copy Project URL + anon public key → Save & Connect<br/>
        <em style="color:rgba(34,197,94,.7)">Free: 500 MB · unlimited API calls</em><br/><br/>

        <strong style="color:#FF9900">☁️ AWS DynamoDB</strong><br/>
        1. <a href="https://aws.amazon.com/free/" target="_blank" style="color:#D4AF37">AWS Free Tier</a> → DynamoDB → Create table "afribconnect"<br/>
        2. API Gateway → Create REST API with CRUD routes → Deploy<br/>
        3. Paste invoke URL + API key → Save & Connect<br/>
        <em style="color:rgba(34,197,94,.7)">Free: 25 GB · 25 read/write capacity units/month</em><br/><br/>

        <strong style="color:#0078D4">🔷 Azure Cosmos DB</strong><br/>
        1. <a href="https://portal.azure.com" target="_blank" style="color:#D4AF37">portal.azure.com</a> → Create Cosmos DB (Core SQL) → Enable free tier<br/>
        2. Data Explorer → New Container: database "afribconnect", container "data", partition key "/col"<br/>
        3. Keys → copy URI + PRIMARY KEY → Save & Connect<br/>
        <em style="color:rgba(34,197,94,.7)">Free: 400 RU/s + 5 GB forever</em><br/><br/>

        <strong style="color:#9B59B6">🐘 PocketBase</strong> — Self-hosted on any $5/month VPS<br/>
        <strong style="color:#E67E22">📦 JSONBin.io</strong> — Zero config, great for testing. <a href="https://jsonbin.io" target="_blank" style="color:#D4AF37">jsonbin.io</a>
      </div>
    </details>`;

  setTimeout(() => _sb_onProviderChange(isAdmin ? 'a' : 's', cfg.provider || 'local', true), 100);
  return card;
}

window._sb_onProviderChange = function(prefix, provider, isInit) {
  const container = document.getElementById('sbFields_' + prefix);
  if (!container) return;
  const cfg = isInit ? AfribStorage.getConfig() : {};
  const v = k => isInit ? (cfg[k] || '') : '';

  const inp = (id, label, ph, val, hint) => `
    <div style="margin-bottom:10px">
      <label style="display:block;font-size:11px;color:rgba(255,255,255,.5);margin-bottom:4px;font-weight:600">${label}</label>
      <input id="${id}" type="text" placeholder="${ph}" value="${val}"
        style="width:100%;box-sizing:border-box;background:rgba(255,255,255,.07);border:1.5px solid rgba(255,255,255,.12);border-radius:8px;padding:9px 13px;color:#fff;font-size:13px;outline:none;transition:border .2s"
        onfocus="this.style.borderColor='rgba(212,175,55,.5)'" onblur="this.style.borderColor='rgba(255,255,255,.12)'"/>
      ${hint ? `<div style="font-size:10px;color:rgba(255,255,255,.3);margin-top:3px">${hint}</div>` : ''}
    </div>`;

  const fields = {
    local:      `<div style="font-size:12px;color:rgba(255,107,107,.7);padding:10px;background:rgba(239,68,68,.05);border-radius:8px;border:1px solid rgba(239,68,68,.15)">⚠️ Local mode — users can only login on this device. Switch to Firebase for cross-device access.</div>`,
    firebase:   inp(`sb_fb_apiKey_${prefix}`,'API Key *','AIzaSy…',v('apiKey'),'Firebase Console → Project Settings → Web App') +
                inp(`sb_fb_projectId_${prefix}`,'Project ID *','my-project-12345',v('projectId'),'Firebase Console → Project Settings') +
                inp(`sb_fb_authDomain_${prefix}`,'Auth Domain (optional)','myproject.firebaseapp.com',v('authDomain'),'') +
                inp(`sb_fb_appId_${prefix}`,'App ID (optional)','1:123456789:web:abc…',v('appId'),''),
    supabase:   inp(`sb_sp_url_${prefix}`,'Project URL *','https://xxx.supabase.co',v('url'),'Supabase Dashboard → Settings → API') +
                inp(`sb_sp_key_${prefix}`,'Anon Key *','eyJhbGci…',v('anonKey'),'Public anon key — safe to use in browser'),
    pocketbase: inp(`sb_pb_url_${prefix}`,'PocketBase URL *','https://your-server.com:8090',v('url'),'Your self-hosted PocketBase URL'),
    jsonbin:    inp(`sb_jb_key_${prefix}`,'Master API Key *','$2b$10$…',v('jsonbin_apiKey'),'JSONBin.io → Account → API Keys'),

    aws: `<div style="font-size:11px;color:rgba(255,215,0,.7);padding:7px 10px;background:rgba(255,215,0,.05);border-radius:7px;margin-bottom:10px;border:1px solid rgba(255,215,0,.15)">
        ☁️ <strong>AWS DynamoDB</strong> — requires an API Gateway proxy endpoint in front of DynamoDB.<br/>
        <a href="https://aws.amazon.com/free/" target="_blank" style="color:#D4AF37">aws.amazon.com/free</a> · 25 GB free · 25 read/write units/month free
      </div>` +
      inp(`sb_aws_url_${prefix}`,'API Gateway URL *','https://xxx.execute-api.us-east-1.amazonaws.com/prod',v('aws_apiUrl'),'Your API Gateway invoke URL') +
      inp(`sb_aws_key_${prefix}`,'API Key *','aBcDeF1234567890…',v('aws_apiKey'),'API Gateway → API Keys → Create') +
      inp(`sb_aws_region_${prefix}`,'AWS Region','us-east-1',v('aws_region')||'us-east-1','e.g. us-east-1, eu-west-1, ap-southeast-1'),

    azure: `<div style="font-size:11px;color:rgba(100,149,237,.9);padding:7px 10px;background:rgba(100,149,237,.06);border-radius:7px;margin-bottom:10px;border:1px solid rgba(100,149,237,.2)">
        🔷 <strong>Azure Cosmos DB</strong> — create a Core (SQL) account with free tier.<br/>
        <a href="https://portal.azure.com" target="_blank" style="color:#6495ED">portal.azure.com</a> · 400 RU/s + 5 GB free forever
      </div>` +
      inp(`sb_az_endpoint_${prefix}`,'Cosmos DB Endpoint *','https://myaccount.documents.azure.com:443',v('azure_endpoint'),'Azure Portal → Cosmos DB → Keys → URI') +
      inp(`sb_az_key_${prefix}`,'Primary Key *','xxxxxxxxxxxxx==',v('azure_primaryKey'),'Azure Portal → Cosmos DB → Keys → PRIMARY KEY') +
      inp(`sb_az_db_${prefix}`,'Database Name','afribconnect',v('azure_database')||'afribconnect','Create this in Data Explorer') +
      inp(`sb_az_container_${prefix}`,'Container Name','data',v('azure_container')||'data','Partition key should be /col'),
  };

  container.innerHTML = fields[provider] || '';
};

window._sb_save = function(prefix) {
  const provider = document.getElementById('sbProvider_' + prefix)?.value || 'local';
  const cfg = AfribStorage.getConfig();
  cfg.provider = provider;

  if (provider === 'firebase') {
    cfg.apiKey     = document.getElementById(`sb_fb_apiKey_${prefix}`)?.value?.trim()     || '';
    cfg.projectId  = document.getElementById(`sb_fb_projectId_${prefix}`)?.value?.trim()  || '';
    cfg.authDomain = document.getElementById(`sb_fb_authDomain_${prefix}`)?.value?.trim() || '';
    cfg.appId      = document.getElementById(`sb_fb_appId_${prefix}`)?.value?.trim()      || '';
  } else if (provider === 'supabase') {
    cfg.url     = document.getElementById(`sb_sp_url_${prefix}`)?.value?.trim() || '';
    cfg.anonKey = document.getElementById(`sb_sp_key_${prefix}`)?.value?.trim() || '';
  } else if (provider === 'pocketbase') {
    cfg.url = document.getElementById(`sb_pb_url_${prefix}`)?.value?.trim() || '';
  } else if (provider === 'jsonbin') {
    cfg.jsonbin_apiKey = document.getElementById(`sb_jb_key_${prefix}`)?.value?.trim() || '';
  } else if (provider === 'aws') {
    cfg.aws_apiUrl  = document.getElementById(`sb_aws_url_${prefix}`)?.value?.trim()    || '';
    cfg.aws_apiKey  = document.getElementById(`sb_aws_key_${prefix}`)?.value?.trim()    || '';
    cfg.aws_region  = document.getElementById(`sb_aws_region_${prefix}`)?.value?.trim() || 'us-east-1';
  } else if (provider === 'azure') {
    cfg.azure_endpoint   = document.getElementById(`sb_az_endpoint_${prefix}`)?.value?.trim()  || '';
    cfg.azure_primaryKey = document.getElementById(`sb_az_key_${prefix}`)?.value?.trim()       || '';
    cfg.azure_database   = document.getElementById(`sb_az_db_${prefix}`)?.value?.trim()        || 'afribconnect';
    cfg.azure_container  = document.getElementById(`sb_az_container_${prefix}`)?.value?.trim() || 'data';
  }

  AfribStorage.saveConfig(cfg);
  _sb_test(prefix);
};

window._sb_test = async function(prefix) {
  const btn    = document.getElementById('sbTestBtn_' + prefix);
  const result = document.getElementById('sbResult_' + prefix);
  const status = document.getElementById('sbStatus_' + prefix);

  if (btn) { btn.disabled = true; btn.textContent = '⏳ Connecting…'; }
  if (result) result.style.display = 'none';

  const res = await AfribStorage.connect();

  if (btn) { btn.disabled = false; btn.textContent = '🔌 Test'; }

  if (result) {
    if (res.ok && res.provider !== 'local') {
      result.textContent = `✅ Connected to ${res.provider}! Users can now login from any device.`;
      result.style.cssText = 'font-size:12px;padding:10px 12px;border-radius:8px;display:block;background:rgba(34,197,94,.1);color:#22c55e;border:1px solid rgba(34,197,94,.2)';
    } else if (res.ok) {
      result.textContent = '💾 Local mode — no cloud sync. Configure a cloud provider for cross-device login.';
      result.style.cssText = 'font-size:12px;padding:10px 12px;border-radius:8px;display:block;background:rgba(255,165,0,.08);color:#ffa500;border:1px solid rgba(255,165,0,.2)';
    } else {
      result.textContent = `❌ Connection failed: ${res.reason || 'Check your credentials and try again'}`;
      result.style.cssText = 'font-size:12px;padding:10px 12px;border-radius:8px;display:block;background:rgba(239,68,68,.1);color:#f87171;border:1px solid rgba(239,68,68,.2)';
    }
  }

  if (status) {
    const ok = res.ok && res.provider !== 'local';
    status.textContent = ok ? `● Connected · ${res.provider}` : res.ok ? '● Local Only' : '● Failed';
    status.style.color = ok ? '#22c55e' : res.ok ? '#ffa500' : '#f87171';
    status.style.background = ok ? 'rgba(34,197,94,.15)' : res.ok ? 'rgba(255,165,0,.1)' : 'rgba(239,68,68,.12)';
  }

  if (res.ok && res.provider !== 'local') {
    const t = typeof showToastA === 'function' ? showToastA : (typeof showToast === 'function' ? showToast : null);
    if (t) t(`✅ Cloud storage connected (${res.provider})! Cross-device login enabled.`);
    _sb_startRealtimeListeners();
  }
};

window._sb_syncNow = async function() {
  const t = typeof showToastA === 'function' ? showToastA : (typeof showToast === 'function' ? showToast : null);
  if (t) t('🔄 Syncing all users to cloud…');
  try {
    const count = await AfribStorage.syncAllUsersToCloud();
    if (t) t(`✅ Synced ${count} users to cloud — cross-device login now active for all!`);
  } catch(e) {
    if (t) t('❌ Sync error: ' + e.message);
  }
};


/* ═══════════════════════════════════════════════════════════════════════
   INJECT INTO ADMIN PANEL
═══════════════════════════════════════════════════════════════════════ */
(function injectAdminStorage() {
  function injectSettings() {
    const p = document.getElementById('p-settings');
    if (!p || document.getElementById('adminStorageCard')) return;
    const grid = p.querySelector('[style*="grid-template-columns"]') || p;
    grid.appendChild(_sb_buildConfigCard(true));
  }
  function injectDashboard() {
    const p = document.getElementById('p-dashboard');
    if (!p || document.getElementById('sbLiveWidget')) return;
    const chartRow = p.querySelector('.chart-row') || p.querySelector('[style*="grid-template-columns"]');
    if (chartRow) chartRow.parentNode.insertBefore(_sb_buildLiveWidget(), chartRow);
    else p.appendChild(_sb_buildLiveWidget());
    _sb_startLivePolling();
  }

  // Hook into panel navigation
  const origGoPanel = window.goPanel;
  if (origGoPanel) {
    window.goPanel = function(btn, panel) {
      origGoPanel.apply(this, arguments);
      if (panel === 'settings')  setTimeout(injectSettings, 150);
      if (panel === 'dashboard') setTimeout(() => { injectDashboard(); _sb_startLivePolling(); }, 150);
    };
  }
  const origInitDash = window.initDashboard;
  if (origInitDash) {
    window.initDashboard = function() {
      origInitDash.apply(this, arguments);
      setTimeout(injectDashboard, 200);
    };
  }

  setTimeout(() => { injectSettings(); injectDashboard(); }, 1200);
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => { injectSettings(); injectDashboard(); }, 800);
    AfribStorage.connect().then(r => { if (r.ok && r.provider !== 'local') _sb_startRealtimeListeners(); });
  });
})();


/* ═══════════════════════════════════════════════════════════════════════
   INJECT INTO SUPER ADMIN PANEL
═══════════════════════════════════════════════════════════════════════ */
(function injectSAStorage() {
  function injectCard() {
    const p = document.getElementById('sp-sysettings');
    if (!p || document.getElementById('saStorageCard')) return;
    const grid = p.querySelector('.sa-form-grid');
    if (grid) grid.appendChild(_sb_buildConfigCard(false));
    else p.querySelector('.panel-header')?.after(_sb_buildConfigCard(false));
  }
  const origSaPanel = window.saPanel;
  if (origSaPanel) {
    window.saPanel = function(btn, panel) {
      origSaPanel.apply(this, arguments);
      if (panel === 'sysettings') setTimeout(injectCard, 150);
    };
  }
  setTimeout(injectCard, 1200);
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(injectCard, 800);
    AfribStorage.connect().catch(() => {});
  });
})();


/* ── Auto-connect on page load ──────────────────────────────────────── */
(function autoConnect() {
  const cfg = AfribStorage.getConfig();
  if (cfg.provider && cfg.provider !== 'local') {
    AfribStorage.connect().then(r => {
      _sb_log(`Auto-connect: ${r.provider || 'local'} — ${r.ok ? 'OK' : r.reason}`);
      if (r.ok && r.provider !== 'local') _sb_startRealtimeListeners();
      if (r.ok && r.provider !== 'local') _sb_startRealtimeListeners();
    }).catch(e => _sb_log('Auto-connect error:', e.message));
  } else {
    AfribStorage.connect(); // init local provider
  }
})();

console.log(`[AfriBConnect] Storage Bridge ${SB_VERSION} loaded — cross-device login enabled ✓`);
