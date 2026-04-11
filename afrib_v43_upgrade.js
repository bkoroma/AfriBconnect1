/* ═══════════════════════════════════════════════════════════════════════
   AFRIBCONNECT v35 — UNIFIED PLATFORM UPGRADE
   Bridges SuperAdmin ↔ Admin ↔ User App as one coherent system
   
   Key fixes:
   • SA-created admins can log into admin.html (bridges sa_admin_accounts → afrib_admin_creds)
   • Admin bans/suspends actually block user login
   • SA maintenance mode shows in user app
   • SA airdrop/coin changes reflect everywhere
   • Admin broadcasts appear as user notifications
   • Real live stats on all three dashboards
   • Branding from SA propagates to user app
   ═══════════════════════════════════════════════════════════════════════ */

'use strict';

(function AfribV35() {

/* ───────────────────────────────────────────────────────────────────────
   UNIVERSAL HELPERS
   ─────────────────────────────────────────────────────────────────────── */
function _ls(key, fb) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fb; } catch { return fb; } }
function _lsSet(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} }
function _lsRaw(key) { try { return localStorage.getItem(key); } catch { return null; } }
function _lsRawSet(key, v) { try { localStorage.setItem(key, String(v)); } catch {} }

function _accounts() {
  if (typeof getAccounts === 'function') try { return getAccounts(); } catch {}
  return _ls('afrib_accounts', {});
}
function _saveAccounts(a) {
  if (typeof saveAccounts === 'function') try { return saveAccounts(a); } catch {}
  _lsSet('afrib_accounts', a);
}
function _coins(email) {
  if (typeof getUserCoins === 'function') try { return getUserCoins(email); } catch {}
  return parseInt(_lsRaw('afrib_coins_' + email) || '0');
}
function _setCoins(email, v) { _lsRawSet('afrib_coins_' + email, Math.max(0, v)); }
function _addLog(action, detail, actor) {
  try {
    const log = _ls('afrib_admin_log', []);
    log.push({ action, detail, user: actor || 'system', ts: new Date().toISOString() });
    _lsSet('afrib_admin_log', log.slice(-2000));
  } catch {}
}
function _toast(msg) {
  if (typeof showToastA === 'function') return showToastA(msg);
  if (typeof toast === 'function') return toast(msg);
  if (typeof showToast === 'function') return showToast(msg);
  let el = document.getElementById('_v35toast');
  if (!el) {
    el = document.createElement('div');
    el.id = '_v35toast';
    el.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1a1614;border:1px solid rgba(212,175,55,.4);color:#fff;padding:11px 22px;border-radius:10px;font-size:13px;font-weight:600;z-index:999999;pointer-events:none;transition:opacity .3s;opacity:0';
    document.body.appendChild(el);
  }
  el.textContent = msg; el.style.opacity = '1';
  clearTimeout(el._t); el._t = setTimeout(() => { el.style.opacity = '0'; }, 3500);
}

const PAGE = (() => {
  const p = location.pathname.toLowerCase();
  if (p.includes('superadmin')) return 'superadmin';
  if (p.includes('admin')) return 'admin';
  return 'app';
})();

/* ═══════════════════════════════════════════════════════════════════════
   ① USER APP
   ═══════════════════════════════════════════════════════════════════════ */
if (PAGE === 'app') {

  /* Maintenance gate */
  function checkMaintenance() {
    const m = _ls('afrib_maintenance', { active: false });
    if (!m.active) {
      const el = document.getElementById('_v35maint');
      if (el) el.remove();
      return;
    }
    if (document.getElementById('_v35maint')) return;
    const d = document.createElement('div');
    d.id = '_v35maint';
    d.style.cssText = 'position:fixed;inset:0;background:#0D0A07;z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;text-align:center;font-family:"DM Sans",system-ui,sans-serif';
    d.innerHTML = `
      <div style="font-size:56px;margin-bottom:20px">🔧</div>
      <h1 style="font-size:24px;font-weight:800;color:#D4AF37;margin-bottom:12px">Under Maintenance</h1>
      <p style="color:rgba(255,255,255,.6);font-size:15px;max-width:340px;line-height:1.7">${m.message || 'AfriBconnect is undergoing scheduled maintenance. We\'ll be back shortly!'}</p>
      ${m.eta ? `<div style="margin-top:20px;font-size:13px;color:rgba(255,255,255,.35)">Back at: ${m.eta}</div>` : ''}`;
    document.body.appendChild(d);
    ['app-shell','landing-page'].forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', checkMaintenance);
  else checkMaintenance();
  setInterval(checkMaintenance, 15000);

  /* Ban/Suspend gate on login */
  function _banCheck(email) {
    const u = _accounts()[email];
    if (!u) return null;
    if (u.banned) return u.banReason || 'Your account has been permanently banned.';
    if (u.suspended) {
      if (u.suspendUntil && new Date(u.suspendUntil) < new Date()) {
        // Suspension expired - lift it
        const accs = _accounts(); accs[email].suspended = false; _saveAccounts(accs);
        return null;
      }
      return u.suspendReason || 'Your account is temporarily suspended.';
    }
    return null;
  }
  window._v35BanCheck = _banCheck;

  function patchLoginBanCheck() {
    const targets = ['doLogin','loginUser','submitLogin','handleLogin'];
    targets.forEach(name => {
      const orig = window[name];
      if (!orig || orig._v35ban) return;
      window[name] = function(email, pass) {
        const emailVal = email || document.getElementById('loginEmail')?.value || document.getElementById('authEmail')?.value || '';
        const reason = _banCheck(emailVal);
        if (reason) {
          const errEl = document.getElementById('loginErr') || document.getElementById('authError') || document.getElementById('auth-error');
          if (errEl) { errEl.textContent = '🚫 ' + reason; errEl.style.display = 'block'; }
          else _toast('🚫 ' + reason);
          return;
        }
        return orig.apply(this, arguments);
      };
      window[name]._v35ban = true;
    });
  }
  setTimeout(patchLoginBanCheck, 400);

  /* Broadcasts as notifications */
  function deliverBroadcasts() {
    if (!window.currentUser) return;
    const broadcasts = _ls('afrib_broadcasts', []);
    if (!broadcasts.length) return;
    const seenKey = 'afrib_bc_seen_' + window.currentUser.email;
    const seen = _ls(seenKey, []);
    const unseen = broadcasts.filter(b => b.active !== false && !seen.includes(b.id));
    if (!unseen.length) return;
    unseen.forEach((b, i) => {
      setTimeout(() => {
        if (typeof addNotification === 'function') {
          try { addNotification('broadcast', b.title || '📢 Announcement', b.message || '', b.emoji || '📢'); } catch {}
        }
        seen.push(b.id);
        _lsSet(seenKey, seen);
      }, 2000 + i * 800);
    });
  }

  /* Online presence ping */
  function pingOnline() {
    if (!window.currentUser) return;
    const email = window.currentUser.email;
    _lsRawSet('afrib_online_' + email, Date.now());
    const accs = _accounts();
    if (accs[email]) {
      accs[email].lastSeen = new Date().toISOString();
      accs[email].isOnline = true;
      _saveAccounts(accs);
    }
  }
  setInterval(pingOnline, 45000);
  document.addEventListener('visibilitychange', () => {
    if (!window.currentUser) return;
    if (document.hidden) {
      const accs = _accounts();
      if (accs[window.currentUser.email]) {
        accs[window.currentUser.email].isOnline = false;
        accs[window.currentUser.email].lastSeen = new Date().toISOString();
        _saveAccounts(accs);
      }
    } else {
      pingOnline();
    }
  });

  /* Patch enterApp */
  function patchEnterApp() {
    const orig = window.enterApp;
    if (!orig || orig._v35) return;
    window.enterApp = function() {
      const r = orig.apply(this, arguments);
      pingOnline();
      setTimeout(deliverBroadcasts, 2500);
      applyBranding();
      return r;
    };
    window.enterApp._v35 = true;
  }
  setTimeout(patchEnterApp, 200);

  /* Branding from SuperAdmin */
  function applyBranding() {
    try {
      const colors = _ls('afrib_colors', null);
      if (colors) {
        if (colors.gold) document.documentElement.style.setProperty('--gold', colors.gold);
        if (colors.orange) document.documentElement.style.setProperty('--orange', colors.orange);
      }
    } catch {}
  }
  document.addEventListener('DOMContentLoaded', applyBranding);

  /* Ads injection */
  function injectAd() {
    const ads = _ls('afrib_ads', []).filter(a => a.active !== false);
    if (!ads.length) return;
    const ad = ads[Math.floor(Math.random() * ads.length)];
    const homeScreen = document.querySelector('#screen-home .screen-content');
    if (!homeScreen) return;
    if (document.getElementById('_v35ad')) return;
    const d = document.createElement('div');
    d.id = '_v35ad';
    d.style.cssText = 'padding:0 16px;margin:4px 0 8px';
    d.innerHTML = `<div style="background:linear-gradient(135deg,rgba(212,175,55,.07),rgba(232,93,38,.04));border:1px solid rgba(212,175,55,.18);border-radius:12px;padding:11px 14px;display:flex;align-items:center;gap:12px;position:relative">
      <span style="font-size:26px">${ad.emoji || '⭐'}</span>
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:700;color:var(--gold,#D4AF37)">${ad.title || 'Sponsored'}</div>
        <div style="font-size:11px;color:rgba(255,255,255,.55);margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${ad.text || ''}</div>
      </div>
      ${ad.url ? `<a href="${ad.url}" target="_blank" rel="noopener" style="flex-shrink:0;background:rgba(212,175,55,.13);border:1px solid rgba(212,175,55,.28);color:var(--gold,#D4AF37);border-radius:7px;padding:5px 11px;font-size:11px;font-weight:700;text-decoration:none">${ad.cta || 'See More'}</a>` : ''}
      <span style="position:absolute;top:4px;right:8px;font-size:9px;color:rgba(255,255,255,.18)">AD</span>
    </div>`;
    const second = homeScreen.children[1];
    if (second) homeScreen.insertBefore(d, second);
    else homeScreen.appendChild(d);
  }
  document.addEventListener('DOMContentLoaded', () => setTimeout(injectAd, 3500));

  console.log('[v35] User app unified ✅');
}

/* ═══════════════════════════════════════════════════════════════════════
   ② ADMIN PANEL
   ═══════════════════════════════════════════════════════════════════════ */
if (PAGE === 'admin') {

  /* ── Bridge: SA-created admins can log into admin.html ── */
  function patchAdminLogin() {
    const origLogin = window.doAdminLogin;
    if (!origLogin || origLogin._v35bridge) return;
    window.doAdminLogin = function() {
      const u = (document.getElementById('aU')?.value || '').trim();
      const p = document.getElementById('aP')?.value || '';
      // Check SA admin accounts first
      const saAdmins = _ls('sa_admin_accounts', []);
      const saAdmin = saAdmins.find(a => a.username === u || a.email === u);
      if (saAdmin && saAdmin.status !== 'suspended') {
        const pwOk = saAdmin.passHash
          ? (saAdmin.passHash.startsWith('plain$') ? p === saAdmin.passHash.slice(6) : p === saAdmin.passHash)
          : p === (saAdmin.password || 'Welcome12!');
        if (pwOk) {
          // Create admin session matching admin.html format
          const session = { user: u, email: saAdmin.email || u, name: saAdmin.displayName || saAdmin.username, loginAt: new Date().toISOString(), fromSA: true };
          localStorage.setItem('admin_session', JSON.stringify(session));
          // Update SA admin last login
          saAdmin.lastLogin = new Date().toISOString();
          saAdmin.loginCount = (saAdmin.loginCount || 0) + 1;
          _lsSet('sa_admin_accounts', saAdmins);
          _addLog('ADMIN_LOGIN', `Admin ${u} logged in via SA credentials`, u);
          if (typeof enterAdminApp === 'function') {
            try { enterAdminApp(); return; } catch {}
          }
          // Fallback: hide login, show app
          const loginEl = document.getElementById('adminLogin');
          const appEl = document.getElementById('adminApp');
          if (loginEl) loginEl.style.display = 'none';
          if (appEl) appEl.style.display = 'block';
          if (typeof initDashboard === 'function') try { initDashboard(); } catch {}
          if (typeof goPanel === 'function') try { goPanel(null, 'dashboard'); } catch {}
          return;
        }
      }
      // Fall through to original login
      return origLogin.apply(this, arguments);
    };
    window.doAdminLogin._v35bridge = true;
  }
  document.addEventListener('DOMContentLoaded', () => setTimeout(patchAdminLogin, 300));

  /* ── Real ban that persists to user app ── */
  window.v35BanUser = function(email, reason) {
    if (!email || !reason) return;
    const accs = _accounts();
    if (!accs[email]) { _toast('❌ User not found'); return; }
    accs[email].banned = true;
    accs[email].banReason = reason;
    accs[email].bannedAt = new Date().toISOString();
    accs[email].bannedBy = 'admin';
    // Invalidate user session
    try {
      const sess = _ls('afrib_session', null);
      if (sess && sess.email === email) localStorage.removeItem('afrib_session');
    } catch {}
    _saveAccounts(accs);
    _addLog('BAN_USER', `Banned ${email}: ${reason}`, 'admin');
    _toast(`✅ ${email} banned`);
    if (typeof renderUsers === 'function') try { renderUsers(); } catch {}
    if (typeof filterUsers === 'function') try { filterUsers(); } catch {}
  };

  window.v35SuspendUser = function(email, reason, days) {
    if (!email) return;
    const accs = _accounts();
    if (!accs[email]) { _toast('❌ User not found'); return; }
    accs[email].suspended = true;
    accs[email].suspendReason = reason || 'Suspended by admin';
    accs[email].suspendedAt = new Date().toISOString();
    accs[email].suspendUntil = days > 0 ? new Date(Date.now() + days * 86400000).toISOString() : null;
    // Invalidate session
    try {
      const sess = _ls('afrib_session', null);
      if (sess && sess.email === email) localStorage.removeItem('afrib_session');
    } catch {}
    _saveAccounts(accs);
    _addLog('SUSPEND_USER', `Suspended ${email}${days > 0 ? ` for ${days}d` : ' permanently'}: ${reason}`, 'admin');
    _toast(`✅ ${email} suspended`);
    if (typeof filterUsers === 'function') try { filterUsers(); } catch {}
  };

  window.v35UnbanUser = function(email) {
    const accs = _accounts();
    if (!accs[email]) { _toast('❌ User not found'); return; }
    delete accs[email].banned; delete accs[email].banReason; delete accs[email].bannedAt; delete accs[email].bannedBy;
    delete accs[email].suspended; delete accs[email].suspendReason; delete accs[email].suspendedAt; delete accs[email].suspendUntil;
    _saveAccounts(accs);
    _addLog('UNBAN', `Unbanned/unsuspended ${email}`, 'admin');
    _toast(`✅ ${email} unbanned`);
    if (typeof filterUsers === 'function') try { filterUsers(); } catch {}
  };

  /* ── Real coin adjustment ── */
  window.v35AdjustCoins = function(email, amount, reason) {
    if (!email || isNaN(amount)) { _toast('❌ Invalid input'); return; }
    const current = _coins(email);
    const newBal = Math.max(0, current + amount);
    _setCoins(email, newBal);
    // Log to SA transaction log
    const txLog = _ls('sa_transaction_log', []);
    txLog.push({ id: 'ADM_' + Date.now(), type: amount > 0 ? 'admin_credit' : 'admin_debit', email, amount: Math.abs(amount), direction: amount > 0 ? 'in' : 'out', note: reason || 'Admin adjustment', ts: new Date().toISOString(), balAfter: newBal });
    _lsSet('sa_transaction_log', txLog.slice(-5000));
    _addLog('COIN_ADJUST', `${email}: ${amount > 0 ? '+' : ''}${amount} (${reason}). Bal: ${newBal}`, 'admin');
    _toast(`✅ ${amount > 0 ? '+' : ''}${amount} coins. New balance: ${newBal.toLocaleString()}`);
    return newBal;
  };

  /* ── Real password reset ── */
  window.v35ResetUserPassword = function(email, newPass) {
    if (!email || !newPass || newPass.length < 6) { _toast('❌ Password must be 6+ characters'); return; }
    const accs = _accounts();
    if (!accs[email]) { _toast('❌ User not found'); return; }
    let hashed = 'plain$' + newPass;
    if (typeof _SEC !== 'undefined' && _SEC.hash) try { hashed = _SEC.hash(newPass); } catch {}
    accs[email].password = hashed;
    accs[email].pwResetAt = new Date().toISOString();
    accs[email].mustChangePass = false;
    _saveAccounts(accs);
    _addLog('RESET_PASSWORD', `Password reset for ${email}`, 'admin');
    _toast('✅ Password reset');
  };

  /* ── Broadcast to users ── */
  window.v35SendBroadcast = function(title, message, emoji) {
    if (!message) { _toast('❌ Message required'); return; }
    const bcs = _ls('afrib_broadcasts', []);
    bcs.push({ id: 'BC_' + Date.now(), title: title || '📢 Announcement', message, emoji: emoji || '📢', active: true, sentAt: new Date().toISOString(), sentBy: 'admin' });
    _lsSet('afrib_broadcasts', bcs);
    _addLog('BROADCAST', `Broadcast sent: "${title}"`, 'admin');
    _toast('✅ Broadcast delivered to all users');
  };

  /* ── Live dashboard stats widget ── */
  function injectLiveStats() {
    const dash = document.getElementById('p-dashboard');
    if (!dash || document.getElementById('_v35live')) return;

    const d = document.createElement('div');
    d.id = '_v35live';
    d.style.cssText = 'background:rgba(34,197,94,.06);border:1px solid rgba(34,197,94,.18);border-radius:12px;padding:16px;margin-bottom:20px';

    function refresh() {
      const accs = _accounts();
      const users = Object.values(accs);
      const now = Date.now();
      const online = users.filter(u => (now - parseInt(_lsRaw('afrib_online_' + u.email) || '0')) < 90000).length;
      const today = new Date().toDateString();
      const newToday = users.filter(u => u.createdAt && new Date(u.createdAt).toDateString() === today).length;
      const banned = users.filter(u => u.banned).length;
      const totalCoins = users.reduce((s, u) => s + _coins(u.email), 0);
      const listings = (() => { try { return Object.keys(localStorage).filter(k => k.startsWith('afrib_listings_')).reduce((s, k) => s + (_ls(k, []).length), 0); } catch { return 0; } })();

      d.innerHTML = `<div style="font-size:10px;font-weight:700;color:#22c55e;letter-spacing:1.2px;margin-bottom:10px">⚡ LIVE PLATFORM STATUS</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:8px">
        ${[['🌐', online, 'Online Now', '#22c55e'],['👥', users.length, 'Total Users', '#D4AF37'],['🆕', newToday, 'New Today', '#3b82f6'],['🪙', totalCoins.toLocaleString(), 'Coins', '#D4AF37'],['🚫', banned, 'Banned', '#ef4444'],['🛒', listings, 'Listings', '#a855f7']].map(([i,v,l,c]) => `
          <div style="background:var(--bg,#0D0A07);border:1px solid var(--border,rgba(255,255,255,.09));border-radius:9px;padding:10px">
            <div style="font-size:18px">${i}</div>
            <div style="font-size:16px;font-weight:700;color:${c};margin:3px 0">${v}</div>
            <div style="font-size:10px;color:rgba(255,255,255,.45)">${l}</div>
          </div>`).join('')}
      </div>
      <div style="font-size:10px;color:rgba(255,255,255,.3);margin-top:10px;text-align:right">Updates every 30s · ${new Date().toLocaleTimeString()}</div>`;
    }

    refresh();
    setInterval(refresh, 30000);
    // Insert after first child of dash
    if (dash.firstChild) dash.insertBefore(d, dash.firstChild.nextSibling || dash.firstChild);
    else dash.appendChild(d);
  }

  /* ── Online badges in user table ── */
  function patchUserTable() {
    const orig = window.renderUsers || window.filterUsers;
    if (!orig || orig._v35badge) return;
    const fn = function() {
      try { orig.apply(this, arguments); } catch {}
      requestAnimationFrame(() => {
        document.querySelectorAll('#usersBody tr').forEach(row => {
          if (!row.cells || row.cells.length < 2) return;
          // Find email cell
          let email = '';
          for (let i = 0; i < Math.min(row.cells.length, 3); i++) {
            const t = row.cells[i].textContent.trim();
            if (t.includes('@')) { email = t; break; }
          }
          if (!email) return;
          const isOnline = (Date.now() - parseInt(_lsRaw('afrib_online_' + email) || '0')) < 90000;
          row.querySelectorAll('._v35dot').forEach(e => e.remove());
          if (isOnline) {
            const dot = document.createElement('span');
            dot.className = '_v35dot';
            dot.title = 'Online now';
            dot.style.cssText = 'display:inline-block;width:7px;height:7px;border-radius:50%;background:#22c55e;box-shadow:0 0 5px #22c55e;margin-left:5px;vertical-align:middle;flex-shrink:0';
            const cell = row.cells[0];
            if (cell) cell.appendChild(dot);
          }
          // Add ban badge
          const accs = _accounts();
          const u = accs[email];
          if (u && (u.banned || u.suspended)) {
            const statusCell = row.cells[row.cells.length - 1];
            if (statusCell && !statusCell.querySelector('._v35banBadge')) {
              const b = document.createElement('span');
              b.className = '_v35banBadge';
              b.style.cssText = `display:inline-block;margin-left:6px;font-size:10px;font-weight:700;padding:2px 7px;border-radius:100px;background:${u.banned ? 'rgba(239,68,68,.13)' : 'rgba(245,158,11,.12)'};color:${u.banned ? '#f87171' : '#f59e0b'};border:1px solid ${u.banned ? 'rgba(239,68,68,.25)' : 'rgba(245,158,11,.2)'}`;
              b.textContent = u.banned ? 'BANNED' : 'SUSPENDED';
              statusCell.appendChild(b);
            }
          }
        });
      });
    };
    fn._v35badge = true;
    if (window.renderUsers) window.renderUsers = fn;
    if (window.filterUsers) window.filterUsers = fn;
  }

  /* ── Inject action buttons into user detail ── */
  function patchUserDetail() {
    const origFns = ['initUserDetail', 'showUserDetail', 'loadUserDetail', 'openUserDetail'];
    origFns.forEach(name => {
      const orig = window[name];
      if (!orig || orig._v35ud) return;
      window[name] = function(emailOrId) {
        const r = orig.apply(this, arguments);
        setTimeout(() => {
          const panel = document.getElementById('p-userdetail') || document.getElementById('userDetailPanel') || document.querySelector('.user-detail-panel');
          if (!panel) return;
          if (panel.querySelector('._v35udactions')) return;
          const email = emailOrId || panel.dataset.email || '';
          const accs = _accounts();
          const u = accs[email] || {};
          const div = document.createElement('div');
          div.className = '_v35udactions';
          div.style.cssText = 'border:1px solid rgba(255,255,255,.09);border-radius:12px;padding:16px;margin:16px 0;background:rgba(255,255,255,.02)';
          div.innerHTML = `
            <div style="font-size:11px;font-weight:700;color:rgba(255,255,255,.45);letter-spacing:1px;margin-bottom:10px">ADMIN ACTIONS</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <button onclick="v35BanUser('${email}',prompt('Reason for ban:'))" ${u.banned ? 'disabled style="opacity:.5"' : ''} style="background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);color:#f87171;border-radius:8px;padding:7px 14px;font-size:12px;font-weight:700;cursor:pointer">${u.banned ? '🚫 Already Banned' : '🚫 Ban User'}</button>
              <button onclick="v35SuspendUser('${email}',prompt('Reason:'),parseInt(prompt('Days (0=permanent):')||'0'))" ${u.suspended ? 'disabled style="opacity:.5"' : ''} style="background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.2);color:#f59e0b;border-radius:8px;padding:7px 14px;font-size:12px;font-weight:700;cursor:pointer">${u.suspended ? '⏸️ Already Suspended' : '⏸️ Suspend'}</button>
              <button onclick="v35UnbanUser('${email}')" style="background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.2);color:#22c55e;border-radius:8px;padding:7px 14px;font-size:12px;font-weight:700;cursor:pointer">✅ Lift Ban/Suspend</button>
              <button onclick="v35ResetUserPassword('${email}',prompt('New password (6+ chars):'))" style="background:rgba(59,130,246,.1);border:1px solid rgba(59,130,246,.2);color:#60a5fa;border-radius:8px;padding:7px 14px;font-size:12px;font-weight:700;cursor:pointer">🔑 Reset Password</button>
              <button onclick="v35AdjustCoins('${email}',parseInt(prompt('Coins (+add / -deduct):')||'0'),prompt('Reason:'))" style="background:rgba(212,175,55,.1);border:1px solid rgba(212,175,55,.2);color:#D4AF37;border-radius:8px;padding:7px 14px;font-size:12px;font-weight:700;cursor:pointer">🪙 Adjust Coins</button>
            </div>`;
          const firstH = panel.querySelector('h2, h3, .ud-card, .panel-title');
          if (firstH) firstH.after(div); else panel.prepend(div);
        }, 250);
        return r;
      };
      window[name]._v35ud = true;
    });
  }

  /* ── Fix broadcast panel to show history ── */
  function patchBroadcastPanel() {
    const orig = window.initBroadcast;
    if (!orig || orig._v35) return;
    window.initBroadcast = function() {
      try { orig.apply(this, arguments); } catch {}
      setTimeout(() => {
        const p = document.getElementById('p-broadcast');
        if (!p) return;
        if (p.querySelector('._v35bclist')) return;
        const bcs = _ls('afrib_broadcasts', []).slice().reverse();
        const div = document.createElement('div');
        div.className = '_v35bclist';
        div.style.cssText = 'margin-top:20px';
        div.innerHTML = `<div style="font-size:14px;font-weight:700;color:var(--gold,#D4AF37);margin-bottom:12px">📋 Broadcast History (${bcs.length})</div>` +
          (bcs.length ? bcs.slice(0, 20).map(b => `
            <div style="background:var(--bg3,#1a1614);border:1px solid var(--border,rgba(255,255,255,.09));border-radius:10px;padding:12px 14px;margin-bottom:8px;display:flex;align-items:flex-start;gap:12px">
              <span style="font-size:22px;flex-shrink:0">${b.emoji || '📢'}</span>
              <div style="flex:1;min-width:0">
                <div style="font-size:13px;font-weight:700">${b.title || ''}</div>
                <div style="font-size:12px;color:rgba(255,255,255,.55);margin-top:3px">${b.message || ''}</div>
                <div style="font-size:11px;color:rgba(255,255,255,.3);margin-top:4px">${new Date(b.sentAt).toLocaleString()} · by ${b.sentBy || 'admin'}</div>
              </div>
            </div>`).join('') : '<div style="font-size:13px;color:rgba(255,255,255,.4)">No broadcasts yet</div>');
        p.appendChild(div);
      }, 300);
    };
    window.initBroadcast._v35 = true;
  }

  /* ── Wait for admin app to be ready then run all patches ── */
  function onAdminReady(fn, tries) {
    tries = tries || 0;
    if (tries > 40) return;
    if (document.getElementById('adminApp') && typeof goPanel === 'function') fn();
    else setTimeout(() => onAdminReady(fn, tries + 1), 250);
  }

  onAdminReady(() => {
    patchUserTable();
    patchUserDetail();
    patchBroadcastPanel();
    setTimeout(injectLiveStats, 600);
    // Auto-refresh dashboard stats
    const origDash = window.initDashboard;
    if (origDash && !origDash._v35) {
      window.initDashboard = function() {
        try { origDash.apply(this, arguments); } catch {}
        setTimeout(injectLiveStats, 400);
      };
      window.initDashboard._v35 = true;
    }
    console.log('[v35] Admin panel unified ✅');
  });
}

/* ═══════════════════════════════════════════════════════════════════════
   ③ SUPERADMIN PANEL
   ═══════════════════════════════════════════════════════════════════════ */
if (PAGE === 'superadmin') {

  /* ── Maintenance mode ── */
  window.v35SetMaintenance = function(active, message, eta) {
    _lsSet('afrib_maintenance', { active: !!active, message: message || '', eta: eta || '', setAt: new Date().toISOString(), setBy: 'superadmin' });
    _addLog('MAINTENANCE_MODE', active ? `ON: ${message}` : 'OFF', 'superadmin');
    _toast(active ? '🔧 Maintenance mode enabled' : '✅ Maintenance mode disabled');
  };

  /* ── Create admin (bridges to admin.html auth) ── */
  window.v35CreateAdmin = function(username, password, displayName, email) {
    if (!username || !password) { _toast('❌ Username and password required'); return; }
    // Write to sa_admin_accounts (SA's own store)
    const admins = _ls('sa_admin_accounts', []);
    if (admins.find(a => a.username === username)) { _toast('❌ Admin username already exists'); return; }
    const newAdmin = { username, email: email || username, displayName: displayName || username, passHash: 'plain$' + password, role: 'admin', status: 'active', loginCount: 0, lastLogin: null, createdAt: new Date().toISOString(), createdBySA: true };
    admins.push(newAdmin);
    _lsSet('sa_admin_accounts', admins);
    // ALSO write to afrib_admin_creds (admin.html's auth key) if first admin
    const adminCreds = _ls('afrib_admin_creds', null);
    if (!adminCreds) {
      _lsSet('afrib_admin_creds', { user: username, passHash: 'plain$' + password });
    }
    _addLog('CREATE_ADMIN', `Created admin: ${username} (${email || ''})`, 'superadmin');
    _toast(`✅ Admin "${username}" created`);
    if (typeof initAdminControl === 'function') try { initAdminControl(); } catch {}
  };

  /* ── Revoke admin ── */
  window.v35RevokeAdmin = function(username) {
    if (!username) return;
    const admins = _ls('sa_admin_accounts', []).filter(a => a.username !== username);
    _lsSet('sa_admin_accounts', admins);
    // Invalidate their session
    try {
      const sess = _ls('admin_session', null);
      if (sess && (sess.user === username || sess.email === username)) localStorage.removeItem('admin_session');
    } catch {}
    _addLog('REVOKE_ADMIN', `Revoked admin: ${username}`, 'superadmin');
    _toast(`✅ Admin "${username}" revoked`);
    if (typeof initAdminControl === 'function') try { initAdminControl(); } catch {}
  };

  /* ── Airdrop coins ── */
  window.v35AirdropCoins = function(amount, reason) {
    if (!amount || isNaN(amount) || amount <= 0) { _toast('❌ Enter a valid amount'); return; }
    const accs = _accounts();
    const users = Object.values(accs);
    let count = 0;
    users.forEach(u => {
      if (!u.email) return;
      _setCoins(u.email, _coins(u.email) + amount);
      count++;
    });
    // Log the airdrop as transactions
    const txLog = _ls('sa_transaction_log', []);
    txLog.push({ id: 'AIR_' + Date.now(), type: 'airdrop', amount, direction: 'in', note: reason || 'SA Airdrop', ts: new Date().toISOString(), recipients: count });
    _lsSet('sa_transaction_log', txLog.slice(-5000));
    _addLog('AIRDROP', `Airdropped ${amount} coins to ${count} users: ${reason}`, 'superadmin');
    _toast(`✅ ${amount.toLocaleString()} coins sent to ${count} users`);
  };

  /* ── Enhanced SA stats ── */
  function patchSAStats() {
    // Patch loadRevenue / loadCoins to inject live stats banner
    ['loadRevenue', 'loadCoins', 'loadSaUsers'].forEach(name => {
      const orig = window[name];
      if (!orig || orig._v35) return;
      window[name] = function() {
        try { orig.apply(this, arguments); } catch {}
        setTimeout(injectSALiveBanner, 300);
      };
      window[name]._v35 = true;
    });
  }

  function injectSALiveBanner() {
    const target = document.querySelector('.sa-panel.active') || document.querySelector('.sa-panel');
    if (!target) return;
    if (document.getElementById('_v35saLive')) return;

    const accs = _accounts();
    const users = Object.values(accs);
    const now = Date.now();
    const online = users.filter(u => (now - parseInt(_lsRaw('afrib_online_' + u.email)||'0')) < 90000).length;
    const today = new Date().toDateString();
    const newToday = users.filter(u => u.createdAt && new Date(u.createdAt).toDateString() === today).length;
    const totalCoins = users.reduce((s, u) => s + _coins(u.email), 0);
    const banned = users.filter(u => u.banned).length;
    const maintenance = _ls('afrib_maintenance', { active: false });

    const d = document.createElement('div');
    d.id = '_v35saLive';
    d.style.cssText = 'background:rgba(212,175,55,.05);border:1px solid rgba(212,175,55,.15);border-radius:12px;padding:14px 16px;margin-bottom:20px';
    d.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <span style="font-size:11px;font-weight:700;color:#D4AF37;letter-spacing:1px">⚡ PLATFORM LIVE STATUS</span>
        <span style="font-size:10px;color:rgba(255,255,255,.3)">${new Date().toLocaleTimeString()}</span>
      </div>
      <div style="display:flex;gap:12px;flex-wrap:wrap">
        ${[['🌐 Online', online,'#22c55e'],['👥 Users', users.length,'#D4AF37'],['🆕 Today', newToday,'#3b82f6'],['🪙 Coins', totalCoins.toLocaleString(),'#D4AF37'],['🚫 Banned', banned,'#ef4444'],['🔧 Maint', maintenance.active ? 'ON':'OFF', maintenance.active?'#f59e0b':'#22c55e']].map(([l,v,c]) =>
          `<div style="background:rgba(0,0,0,.3);border-radius:8px;padding:8px 12px;min-width:80px">
            <div style="font-size:16px;font-weight:700;color:${c}">${v}</div>
            <div style="font-size:10px;color:rgba(255,255,255,.4);margin-top:1px">${l}</div>
          </div>`).join('')}
      </div>`;
    if (target.firstChild) target.insertBefore(d, target.firstChild);
    else target.appendChild(d);
  }

  /* ── Quick-action floating button ── */
  function injectSAQuickPanel() {
    if (document.getElementById('_v35saQA')) return;
    const wrap = document.createElement('div');
    wrap.id = '_v35saQA';
    wrap.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:10000;display:flex;flex-direction:column-reverse;gap:8px;align-items:flex-end';
    wrap.innerHTML = `
      <button id="_v35saQABtn" onclick="document.getElementById('_v35saQAMenu').style.display=document.getElementById('_v35saQAMenu').style.display==='none'?'block':'none'"
        style="width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#D4AF37,#E85D26);border:none;font-size:22px;cursor:pointer;box-shadow:0 4px 20px rgba(212,175,55,.45);transition:transform .2s"
        onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">⚡</button>
      <div id="_v35saQAMenu" style="display:none;background:#1a1614;border:1px solid rgba(212,175,55,.25);border-radius:14px;padding:16px;width:280px;box-shadow:0 8px 40px rgba(0,0,0,.7)">
        <div style="font-size:12px;font-weight:700;color:#D4AF37;margin-bottom:12px">⚡ SuperAdmin Quick Actions</div>
        <button onclick="v35SetMaintenance(!${_ls('afrib_maintenance',{active:false}).active}, prompt('Message (blank to disable):')||'', prompt('ETA (e.g. 2:00pm):')||'')" style="width:100%;background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.25);color:#f59e0b;border-radius:9px;padding:10px;font-size:12px;font-weight:700;cursor:pointer;text-align:left;margin-bottom:6px">
          🔧 Toggle Maintenance Mode
        </button>
        <button onclick="v35AirdropCoins(parseInt(prompt('Coins per user:')||'0'),prompt('Reason:')||'SA Airdrop')" style="width:100%;background:rgba(212,175,55,.1);border:1px solid rgba(212,175,55,.25);color:#D4AF37;border-radius:9px;padding:10px;font-size:12px;font-weight:700;cursor:pointer;text-align:left;margin-bottom:6px">
          🪙 Airdrop Coins to All Users
        </button>
        <button onclick="v35CreateAdmin(prompt('Username:'),prompt('Password:'),prompt('Display Name:'),prompt('Email (optional):'))" style="width:100%;background:rgba(59,130,246,.1);border:1px solid rgba(59,130,246,.25);color:#60a5fa;border-radius:9px;padding:10px;font-size:12px;font-weight:700;cursor:pointer;text-align:left;margin-bottom:6px">
          ➕ Create New Admin Account
        </button>
        <button onclick="v35RevokeAdmin(prompt('Admin username to revoke:'))" style="width:100%;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.25);color:#f87171;border-radius:9px;padding:10px;font-size:12px;font-weight:700;cursor:pointer;text-align:left;margin-bottom:6px">
          ❌ Revoke Admin Access
        </button>
        <button onclick="(()=>{const r=confirm('⚠️ RESET ALL PLATFORM DATA? This is irreversible!');if(r){['afrib_accounts','afrib_admin_log','sa_transaction_log','afrib_broadcasts','afrib_ads'].forEach(k=>localStorage.removeItem(k));_toast('Platform data reset');location.reload();}})();" style="width:100%;background:rgba(239,68,68,.07);border:1px solid rgba(239,68,68,.2);color:rgba(239,68,68,.7);border-radius:9px;padding:8px 10px;font-size:11px;font-weight:600;cursor:pointer;text-align:left">
          🗑️ Reset Platform Data
        </button>
        <div style="border-top:1px solid rgba(255,255,255,.07);margin-top:10px;padding-top:10px;font-size:11px;color:rgba(255,255,255,.35)" id="_v35saStatus">Loading...</div>
      </div>`;
    document.body.appendChild(wrap);

    // Status refresh
    function refreshStatus() {
      const el = document.getElementById('_v35saStatus');
      if (!el) return;
      const accs = _accounts();
      const users = Object.values(accs);
      const maint = _ls('afrib_maintenance', { active: false });
      el.innerHTML = `👥 ${users.length} users &nbsp;·&nbsp; 🚫 ${users.filter(u=>u.banned).length} banned<br>🔧 Maintenance: <b style="color:${maint.active?'#f59e0b':'#22c55e'}">${maint.active?'ON':'OFF'}</b>`;
    }
    refreshStatus();
    setInterval(refreshStatus, 30000);
  }

  /* ── Patch saPanel to inject live stats ── */
  function patchSaPanel() {
    const orig = window.saPanel;
    if (!orig || orig._v35) return;
    window.saPanel = function(btn, name) {
      try { orig.apply(this, arguments); } catch {}
      // Remove old live banner so it refreshes
      const old = document.getElementById('_v35saLive');
      if (old) old.remove();
      setTimeout(injectSALiveBanner, 200);
    };
    window.saPanel._v35 = true;
  }

  function onSAReady(fn, tries) {
    tries = tries || 0;
    if (tries > 40) return;
    const app = document.getElementById('saApp') || document.getElementById('sa-app') || document.getElementById('saContent') || document.querySelector('.sa-content, .sa-panel');
    if (app && typeof saPanel === 'function') fn();
    else setTimeout(() => onSAReady(fn, tries + 1), 250);
  }

  onSAReady(() => {
    patchSAStats();
    patchSaPanel();
    setTimeout(injectSAQuickPanel, 800);
    setTimeout(injectSALiveBanner, 600);
    console.log('[v35] SuperAdmin unified ✅');
  });
}

console.log(`[v35] AfribConnect Unified Platform v35 (${PAGE}) ✅`);

})();
