<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' https://api.emailjs.com; frame-ancestors 'none'; upgrade-insecure-requests;"/>
<meta http-equiv="X-Frame-Options" content="DENY"/>
<meta http-equiv="X-Content-Type-Options" content="nosniff"/>
<meta http-equiv="Cache-Control" content="no-store, no-cache, must-revalidate"/>
  <meta http-equiv="Pragma" content="no-cache"/>
  <meta http-equiv="Expires" content="0"/>
  <meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin"/>
<meta http-equiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), serial=()"/>
<meta name="robots" content="noindex, nofollow"/>
<title>AfriBconnect — Admin Panel</title>
<style>
:root{
  --bg:#0D0A07;--bg2:#111009;--bg3:#1a1614;--bg4:#231f1a;
  --gold:#D4AF37;--orange:#E85D26;--red:#ef4444;--green:#22c55e;--blue:#3b82f6;
  --gold-dim:rgba(212,175,55,.13);--border:rgba(255,255,255,.09);--border-gold:rgba(212,175,55,.22);
  --white:#fff;--w60:rgba(255,255,255,.6);--w30:rgba(255,255,255,.3);--w10:rgba(255,255,255,.1);
  --font:'DM Sans',system-ui,sans-serif;--r:10px;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--white);font-family:var(--font);font-size:14px;min-height:100vh}
input,select,textarea,button{font-family:var(--font);font-size:14px}
a{color:var(--gold);text-decoration:none}

/* LOGIN */
#adminLogin{position:fixed;inset:0;background:var(--bg);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px}
.lc{background:var(--bg3);border:1px solid var(--border-gold);border-radius:16px;padding:40px 36px;width:100%;max-width:420px}
.lc-logo{font-size:20px;font-weight:800;letter-spacing:2px;color:var(--gold);margin-bottom:3px}
.lc-logo span{color:var(--orange)}
.lc-sub{font-size:11px;color:var(--w60);letter-spacing:1px;text-transform:uppercase;margin-bottom:30px}
.lc-field{margin-bottom:16px;position:relative}
.lc-field label{display:block;font-size:12px;color:var(--w60);margin-bottom:6px}
.lc-field input{width:100%;background:var(--bg);border:1.5px solid var(--border);border-radius:8px;padding:11px 14px;color:var(--white);outline:none;font-size:14px;transition:border-color .2s}
.lc-field input:focus{border-color:var(--gold)}
.lc-field input.err{border-color:var(--red)}
.pass-eye{position:absolute;right:12px;bottom:11px;background:none;border:none;color:var(--w60);cursor:pointer;font-size:16px}
.lc-btn{width:100%;background:linear-gradient(135deg,var(--gold),#b8901f);color:var(--bg);border:none;border-radius:8px;padding:13px;font-size:15px;font-weight:700;cursor:pointer;transition:opacity .2s;margin-top:8px}
.lc-btn:hover{opacity:.9}
.lc-btn:disabled{opacity:.6;cursor:wait}
.lc-err{font-size:12px;color:var(--red);margin-top:10px;padding:8px 12px;background:rgba(239,68,68,.1);border-radius:6px;display:none}

/* CHANGE PASSWORD SCREEN */
#changePassScreen{position:fixed;inset:0;background:var(--bg);display:none;align-items:center;justify-content:center;z-index:900;padding:20px}
.cp-card{background:var(--bg3);border:1px solid var(--border-gold);border-radius:16px;padding:36px;width:100%;max-width:420px}
.cp-badge{background:rgba(212,175,55,.12);border:1px solid var(--border-gold);border-radius:8px;padding:10px 14px;font-size:12px;color:var(--gold);margin-bottom:20px}

/* APP LAYOUT */
#adminApp{display:none;min-height:100vh}
.adm-header{background:var(--bg2);border-bottom:1px solid var(--border);padding:0 24px;position:sticky;top:0;z-index:100;display:flex;align-items:center;gap:12px;height:58px}
.adm-logo{font-size:14px;font-weight:800;letter-spacing:2px;color:var(--gold)}
.adm-logo span{color:var(--orange)}
.adm-logo small{font-size:10px;color:var(--w60);margin-left:8px;border:1px solid var(--border-gold);border-radius:4px;padding:1px 7px;letter-spacing:1px}
.adm-nav{display:flex;gap:2px;margin-left:auto;flex-wrap:wrap}
.adm-tab{background:none;border:none;color:var(--w60);padding:7px 13px;border-radius:7px;cursor:pointer;font-size:13px;transition:all .2s;white-space:nowrap}
.adm-tab:hover{color:var(--white);background:var(--w10)}
.adm-tab.active{background:var(--gold-dim);color:var(--gold)}
.adm-user{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--w60);margin-left:12px;cursor:pointer}
.adm-avatar{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,var(--gold),var(--orange));color:var(--bg);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700}
.logout-btn{background:none;border:1px solid var(--border);color:var(--w60);border-radius:6px;padding:5px 12px;font-size:12px;cursor:pointer;transition:all .2s;margin-left:8px}
.logout-btn:hover{color:var(--red);border-color:rgba(239,68,68,.3)}
.adm-main{max-width:1360px;margin:0 auto;padding:24px}

/* PANELS */
.panel{display:none}.panel.active{display:block}
.panel-title{font-size:22px;font-weight:700;margin-bottom:4px}
.panel-sub{font-size:13px;color:var(--w60);margin-bottom:24px}

/* STAT CARDS */
.stat-row{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:14px;margin-bottom:28px}
.stat-card{background:var(--bg3);border:1px solid var(--border);border-radius:var(--r);padding:16px;transition:border-color .2s}
.stat-card:hover{border-color:var(--border-gold)}
.stat-icon{font-size:24px;margin-bottom:8px}
.stat-val{font-size:26px;font-weight:700;color:var(--gold);margin-bottom:2px}
.stat-label{font-size:12px;color:var(--w60)}
.stat-delta{font-size:11px;margin-top:4px;color:var(--green)}
.stat-delta.neg{color:var(--red)}

/* TABLES */
.tbl-wrap{background:var(--bg3);border:1px solid var(--border);border-radius:14px;overflow:hidden;margin-bottom:24px;overflow-x:auto}
.data-tbl{width:100%;border-collapse:collapse;font-size:13px}
.data-tbl th{text-align:left;padding:11px 14px;border-bottom:1px solid var(--border);color:var(--w60);font-size:11px;letter-spacing:.5px;text-transform:uppercase;font-weight:500}
.data-tbl td{padding:11px 14px;border-bottom:1px solid rgba(255,255,255,.04);vertical-align:middle}
.data-tbl tr:last-child td{border-bottom:none}
.data-tbl tr:hover td{background:var(--w10)}

/* BADGES */
.badge{display:inline-block;font-size:10px;font-weight:700;padding:2px 8px;border-radius:100px}
.badge.g{background:rgba(34,197,94,.15);color:#22c55e;border:1px solid rgba(34,197,94,.2)}
.badge.r{background:rgba(239,68,68,.12);color:#f87171;border:1px solid rgba(239,68,68,.2)}
.badge.gold{background:var(--gold-dim);color:var(--gold);border:1px solid var(--border-gold)}
.badge.b{background:rgba(59,130,246,.12);color:#60a5fa;border:1px solid rgba(59,130,246,.2)}
.badge.o{background:rgba(232,93,38,.12);color:var(--orange);border:1px solid rgba(232,93,38,.2)}

/* BTNS */
.btn{border:none;border-radius:7px;padding:6px 14px;font-size:12px;font-weight:600;cursor:pointer;transition:all .2s;white-space:nowrap}
.btn-gold{background:var(--gold);color:var(--bg)}.btn-gold:hover{background:#c9a22a}
.btn-ghost{background:none;border:1px solid var(--border);color:var(--w60)}.btn-ghost:hover{color:var(--white);border-color:var(--w30)}
.btn-red{background:rgba(239,68,68,.12);color:#f87171;border:1px solid rgba(239,68,68,.2)}.btn-red:hover{background:rgba(239,68,68,.2)}
.btn-g{background:rgba(34,197,94,.12);color:#22c55e;border:1px solid rgba(34,197,94,.2)}.btn-g:hover{background:rgba(34,197,94,.2)}
.btn-b{background:rgba(59,130,246,.12);color:#60a5fa;border:1px solid rgba(59,130,246,.2)}.btn-b:hover{background:rgba(59,130,246,.2)}
.btn-row{display:flex;gap:6px;flex-wrap:wrap}

/* SEARCH */
.search-row{display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap;align-items:center}
.s-inp{background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:8px 14px;color:var(--white);outline:none;font-size:13px;flex:1;min-width:200px;transition:border-color .2s}
.s-inp:focus{border-color:var(--border-gold)}
.s-sel{background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--white);padding:8px 12px;font-size:13px;cursor:pointer;outline:none}
.s-sel option{background:var(--bg)}

/* MODAL */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:500;display:none;align-items:center;justify-content:center;padding:20px}
.modal-overlay.open{display:flex}
.modal{background:var(--bg3);border:1px solid var(--border-gold);border-radius:16px;padding:28px;max-width:540px;width:100%;position:relative;max-height:92vh;overflow-y:auto}
.modal h3{font-size:18px;font-weight:700;margin-bottom:5px}
.modal p.msub{font-size:13px;color:var(--w60);margin-bottom:20px}
.modal-close{position:absolute;top:14px;right:16px;background:none;border:none;color:var(--w60);font-size:20px;cursor:pointer}
.modal-close:hover{color:var(--white)}
.mf{margin-bottom:14px}
.mf label{display:block;font-size:12px;color:var(--w60);margin-bottom:5px}
.mf input,.mf select,.mf textarea{width:100%;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:9px 13px;color:var(--white);outline:none;font-size:13px;transition:border-color .2s}
.mf input:focus,.mf select:focus{border-color:var(--gold)}
.mf select option{background:var(--bg)}
.mf textarea{resize:vertical;min-height:80px}
.modal-btns{display:flex;gap:10px;justify-content:flex-end;margin-top:20px}
.mf-err{font-size:11px;color:var(--red);margin-top:4px;display:none}

/* CHARTS */
.chart-row{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;margin-bottom:24px}
.chart-card{background:var(--bg3);border:1px solid var(--border);border-radius:14px;padding:20px}
.chart-title{font-size:14px;font-weight:600;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between}
.bar-chart{display:flex;align-items:flex-end;gap:6px;height:100px;border-bottom:1px solid var(--border);padding-bottom:4px}
.bar{flex:1;border-radius:4px 4px 0 0;transition:all .3s;cursor:pointer;min-height:3px;background:var(--gold-dim);border:1px solid var(--border-gold)}
.bar:hover{background:rgba(212,175,55,.3)}
.bar.green{background:rgba(34,197,94,.2);border-color:rgba(34,197,94,.35)}
.bar.red{background:rgba(239,68,68,.2);border-color:rgba(239,68,68,.35)}
.bar-labels{display:flex;gap:6px;margin-top:6px}
.bar-label{flex:1;text-align:center;font-size:9px;color:var(--w60)}
.prog-bar{height:6px;background:var(--border);border-radius:3px;overflow:hidden;margin:4px 0 8px}
.prog-fill{height:100%;border-radius:3px;background:var(--gold)}
.act-feed{display:flex;flex-direction:column;gap:6px;max-height:280px;overflow-y:auto}
.act-item{display:flex;gap:10px;align-items:flex-start;padding:9px 12px;background:var(--bg);border-radius:8px;border:1px solid var(--border)}
.act-icon{font-size:18px;flex-shrink:0}
.act-text{flex:1;font-size:12px}
.act-text small{color:var(--w60);font-size:11px;display:block;margin-top:1px}
.act-time{font-size:10px;color:var(--w30);flex-shrink:0}
.toggle-sw{position:relative;display:inline-flex;width:42px;height:22px;flex-shrink:0}
.toggle-sw input{opacity:0;width:0;height:0}
.ts-sl{position:absolute;cursor:pointer;inset:0;background:var(--bg4);border-radius:22px;transition:background .3s;border:1px solid var(--border)}
.ts-sl::before{content:'';position:absolute;height:14px;width:14px;left:3px;top:3px;background:var(--w60);border-radius:50%;transition:transform .3s,background .3s}
.toggle-sw input:checked + .ts-sl{background:var(--gold-dim);border-color:var(--border-gold)}
.toggle-sw input:checked + .ts-sl::before{transform:translateX(20px);background:var(--gold)}
.perm-tag{font-size:11px;background:var(--w10);border:1px solid var(--border);border-radius:6px;padding:3px 9px;color:var(--w60);display:inline-block;margin:2px}
.perm-tag.on{background:var(--gold-dim);border-color:var(--border-gold);color:var(--gold)}
.role-card{background:var(--bg3);border:1px solid var(--border);border-radius:var(--r);padding:16px;margin-bottom:8px}
.sec-label{font-size:11px;letter-spacing:1.2px;text-transform:uppercase;color:var(--w60);margin-bottom:10px}
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(60px);background:var(--bg3);border:1px solid var(--border-gold);border-radius:10px;padding:10px 22px;font-size:13px;z-index:9999;transition:transform .3s,opacity .3s;opacity:0;pointer-events:none}
.toast.show{transform:translateX(-50%) translateY(0);opacity:1}
.strength-bar{height:4px;background:var(--border);border-radius:2px;overflow:hidden;margin:6px 0 3px}
.strength-fill{height:100%;border-radius:2px;transition:all .3s}
@media(max-width:900px){.adm-nav{display:none}.adm-header{flex-wrap:wrap;height:auto;padding:10px 16px;gap:8px}.adm-main{padding:16px}.stat-row{grid-template-columns:1fr 1fr}.chart-row{grid-template-columns:1fr}}

/* ── Admin seed modal ── */
.adm-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:1000;display:flex;align-items:center;justify-content:center;padding:16px}
.adm-modal-card{background:var(--bg);border:1px solid var(--border-gold);border-radius:16px;padding:24px;width:100%;max-height:90vh;overflow-y:auto}
.adm-inp{width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:9px 12px;color:var(--white);font-size:13px;outline:none}
.adm-inp:focus{border-color:var(--gold)}
.adm-sel{width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:9px 12px;color:var(--white);font-size:13px;outline:none}
.lbl{display:block;font-size:11px;color:var(--w60);margin-bottom:4px;font-weight:600}
</style>
</head>
<body>

<!-- ══ LOGIN ══ -->
<div id="adminLogin">
  <div class="lc">
    <div class="lc-logo">AFRIB<span>CONNECT</span></div>
    <div class="lc-sub">Admin Dashboard</div>

    <!-- Default credentials banner -->
    <div id="defaultCredsBanner" style="background:rgba(212,175,55,.1);border:1px solid rgba(212,175,55,.3);border-radius:10px;padding:12px 14px;margin-bottom:20px;font-size:12px">
      <div style="font-weight:700;color:var(--gold);margin-bottom:4px">🔑 First-time login</div>
      <div style="color:rgba(255,255,255,.5);font-size:11px">Enter your admin username</div>
      <div style="color:rgba(255,255,255,.5);font-size:11px">Enter your admin password</div>
      <div style="margin-top:6px;font-size:11px;color:rgba(255,255,255,.4)">You will be asked to set a new password after login.</div>
      <button onclick="resetAdminCredsNow()" style="margin-top:8px;background:none;border:1px solid rgba(212,175,55,.4);color:var(--gold);border-radius:6px;padding:4px 12px;font-size:11px;cursor:pointer;font-weight:600">🔄 Reset to defaults</button>
    </div>

    <div class="lc-field">
      <label>Username</label>
      <input type="text" id="aU" placeholder="admin" autocomplete="username" onkeydown="if(event.key==='Enter')document.getElementById('aP').focus()"/>
    </div>
    <div class="lc-field">
      <label>Password</label>
      <input type="password" id="aP" placeholder="••••••••" autocomplete="current-password" onkeydown="if(event.key==='Enter')doAdminLogin()"/>
      <button class="pass-eye" type="button" onclick="toggleAdminPass()">👁</button>
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
      <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--w60);cursor:pointer">
        <input type="checkbox" id="adminRememberMe" style="accent-color:var(--gold);width:14px;height:14px"/>
        Remember me
      </label>
      <span style="font-size:11px;color:var(--w30)">Session saved on login</span>
    </div>
    <button class="lc-btn" id="loginBtn" onclick="doAdminLogin()">🔐 Login to Dashboard</button>
    <div id="loginLockoutBanner" style="display:none;background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.4);border-radius:10px;padding:10px 14px;font-size:12px;color:#fca5a5;margin-bottom:10px;text-align:center">
  🔒 <strong>Account temporarily locked</strong> after too many failed attempts. Please wait before trying again.
</div>
<div class="lc-err" id="loginErr"></div>
  </div>
</div>

<!-- ══ FORCE CHANGE PASSWORD ══ -->
<div id="changePassScreen">
  <div class="cp-card">
    <div class="lc-logo" style="margin-bottom:6px">AFRIB<span style="color:var(--orange)">CONNECT</span></div>
    <div style="font-size:11px;color:var(--w60);letter-spacing:1px;text-transform:uppercase;margin-bottom:20px">Security Update Required</div>
    <div class="cp-badge">⚠️ You must set a new admin password before continuing. Default credentials must be changed.</div>
    <div class="lc-field">
      <label>New Password <span style="color:var(--w30);font-size:10px">(min 8 chars, must include number)</span></label>
      <input type="password" id="cpNewPass" placeholder="New password" oninput="checkCpStrength()"/>
      <div class="strength-bar"><div class="strength-fill" id="cpStrengthFill"></div></div>
      <div style="font-size:11px;color:var(--w60)" id="cpStrengthLabel"></div>
    </div>
    <div class="lc-field">
      <label>Confirm New Password</label>
      <input type="password" id="cpConfirm" placeholder="Repeat password" onkeydown="if(event.key==='Enter')doChangeAdminPass()"/>
    </div>
    <div class="lc-err" id="cpErr"></div>
    <button class="lc-btn" onclick="doChangeAdminPass()" style="margin-top:12px">🔒 Set New Password &amp; Continue</button>
  </div>
</div>

<!-- ══ APP ══ -->
<div id="adminApp">
  <!-- Maintenance mode banner — shown/hidden by afrib_v36_sync.js -->
  <div id="adminMaintBanner" style="display:none;position:sticky;top:0;z-index:500;background:linear-gradient(90deg,rgba(239,68,68,.15),rgba(239,68,68,.1));border-bottom:1px solid rgba(239,68,68,.3);padding:8px 20px;font-size:13px;font-weight:700;color:#f87171;text-align:center">
    🔧 <span class="maint-msg">Maintenance mode is active — users see a maintenance page</span>
    <button onclick="this.parentElement.style.display='none'" style="background:none;border:none;color:#f87171;cursor:pointer;margin-left:12px;font-size:16px">✕</button>
  </div>
  <header class="adm-header">
    <div class="adm-logo">AFRIB<span>CONNECT</span> <small>ADMIN</small></div>
    <nav class="adm-nav">
      <button class="adm-tab active" onclick="goPanel(this,'dashboard')">📊 Dashboard</button>
      <button class="adm-tab" onclick="goPanel(this,'users')">👥 Users</button>
      <button class="adm-tab" onclick="goPanel(this,'wallets')">💰 Wallets</button>
      <button class="adm-tab" onclick="goPanel(this,'games')">🎮 Games</button>
      <button class="adm-tab" onclick="goPanel(this,'passwords')">🔑 Passwords</button>
      <button class="adm-tab" onclick="goPanel(this,'permissions')">🛡️ Permissions</button>
      <button class="adm-tab" onclick="goPanel(this,'activity')">📋 Activity</button>
      <button class="adm-tab" onclick="goPanel(this,'logins')">🔐 Logins</button>
      <button class="adm-tab" onclick="goPanel(this,'userdetail')">👤 User Detail</button>
      <button class="adm-tab" onclick="goPanel(this,'marketplace')">🛒 Marketplace</button>
      <button class="adm-tab" onclick="goPanel(this,'analytics')">📊 Analytics</button>
      <button class="adm-tab" onclick="goPanel(this,'broadcast')">📢 Broadcast</button>
      <button class="adm-tab" onclick="goPanel(this,'dating')">💕 AfriMatch</button>
      <button class="adm-tab" onclick="goPanel(this,'messaging')">💬 Messaging</button>
      <button class="adm-tab" onclick="goPanel(this,'backup')">💾 Backup</button>
      <button class="adm-tab" onclick="goPanel(this,'ads')">📢 Ads</button>
      <button class="adm-tab" onclick="goPanel(this,'feed')">✨ YourStyle</button>
      <button class="adm-tab" onclick="goPanel(this,'giftme')">🎁 GiftMe</button>
      <button class="adm-tab" onclick="goPanel(this,'settings')">⚙️ Settings</button>
    </nav>
    <div class="adm-user" onclick="goPanel(document.querySelector('.adm-tab:last-of-type'),'settings')" title="Go to settings">
      <div class="adm-avatar" id="aAvEl">A</div>
      <span id="aUserLabel">Admin</span>
    </div>
    <button class="logout-btn" onclick="doAdminLogout()">Logout</button>
    <a href="superadmin.html" target="_blank" style="background:linear-gradient(135deg,var(--gold),var(--orange));color:#000;border:none;border-radius:6px;padding:5px 12px;font-size:11px;font-weight:800;cursor:pointer;text-decoration:none;margin-left:6px;letter-spacing:.5px">👑 SUPER ADMIN</a>
    <div id="admin-live-badge" style="display:inline-flex;align-items:center;gap:5px;background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.3);border-radius:20px;padding:4px 10px;font-size:11px;font-weight:700;color:#22c55e;margin-left:8px">
      <span style="width:7px;height:7px;border-radius:50%;background:#22c55e;display:inline-block"></span>
      <span id="admin-live-count">0 online</span>
    </div>
  </header>

  <main class="adm-main">

    <!-- DASHBOARD -->
    <div class="panel active" id="p-dashboard">
      <div class="panel-title">📊 Dashboard</div>
      <div class="panel-sub" id="dashSubtitle">Real-time overview — loading…</div>
      <div class="stat-row" id="dStats"></div>
      <div class="chart-row">
        <div class="chart-card">
          <div class="chart-title">📈 New Signups — Last 7 Days <span id="signupTotal" style="font-size:13px;color:var(--gold)"></span></div>
          <div class="bar-chart" id="signupChart"></div>
          <div class="bar-labels" id="signupLabels"></div>
        </div>
        <div class="chart-card">
          <div class="chart-title">💰 Wallet Balances by Country <span id="walletVolLabel" style="font-size:13px;color:var(--green)"></span></div>
          <div id="walletByCountry"></div>
        </div>
        <div class="chart-card">
          <div class="chart-title">🎮 Game Activity</div>
          <div id="gameBreakdown"></div>
        </div>
        <div class="chart-card">
          <div class="chart-title">🌍 Top Countries</div>
          <div id="countryBreakdown"></div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div>
          <div class="sec-label">Recent Signups</div>
          <div class="tbl-wrap"><table class="data-tbl">
            <thead><tr><th>User</th><th>Country</th><th>Joined</th><th>Status</th></tr></thead>
            <tbody id="recentSignups"></tbody>
          </table></div>
        </div>
        <div>
          <div class="sec-label">Live Activity Feed</div>
          <div class="act-feed" id="actFeed"></div>
        </div>
      </div>
    </div>

    <!-- USERS -->
    <div class="panel" id="p-users">
      <div class="panel-title">👥 User Management</div>
      <div class="panel-sub">View, edit, suspend and manage all registered users</div>
      <div class="search-row">
        <input class="s-inp" id="uSearch" placeholder="🔍  Search by name, email, username…" oninput="filterUsers()"/>
        <select class="s-sel" id="uCountry" onchange="filterUsers()"><option value="">All Countries</option></select>
        <select class="s-sel" id="uStatus" onchange="filterUsers()">
          <option value="">All Status</option><option value="active">Active</option>
          <option value="suspended">Suspended</option><option value="banned">Banned</option>
        </select>
        <button class="btn btn-gold" onclick="exportUsersCSV()">📥 Export CSV</button>
      </div>
      <div id="uCount" style="font-size:12px;color:var(--w60);margin-bottom:10px"></div>
      <div class="tbl-wrap"><table class="data-tbl">
        <thead><tr><th>User</th><th>Username</th><th>Country</th><th>Balance</th><th>DOB / Age</th><th>Joined</th><th>Last Login</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody id="usersBody"></tbody>
      </table></div>
    </div>

    <!-- WALLETS -->
    <div class="panel" id="p-wallets">
      <div class="panel-title">💰 Wallets &amp; Transactions</div>
      <div class="panel-sub">Monitor balances, coins, and payment records from real user accounts</div>
      <div class="stat-row" id="wStats"></div>
      <div class="sec-label">All User Wallets</div>
      <div class="search-row">
        <input class="s-inp" id="wSearch" placeholder="🔍  Search by user name or email…" oninput="filterWallets()"/>
        <select class="s-sel" id="wSort" onchange="filterWallets()">
          <option value="balance">Sort: Balance ↓</option>
          <option value="coins">Sort: Coins ↓</option>
          <option value="name">Sort: Name</option>
        </select>
      </div>
      <div class="tbl-wrap"><table class="data-tbl">
        <thead><tr><th>User</th><th>Email</th><th>Balance (KES)</th><th>Game Coins</th><th>Payment Methods</th><th>Actions</th></tr></thead>
        <tbody id="walletBody"></tbody>
      </table></div>
    </div>

    <!-- GAMES -->
    <div class="panel" id="p-games">
      <div class="panel-title">🎮 Game Control Center</div>
      <div class="panel-sub">Full control over game economics, seeds, Truth or Dare, and live pricing</div>

      <!-- Stats row -->
      <div class="stat-row" id="gStats"></div>

      <!-- Tabs inside games panel -->
      <div style="display:flex;gap:6px;margin:16px 0 14px;background:var(--bg3);border-radius:10px;padding:4px">
        <button class="adm-tab active" id="gtab-economy" onclick="switchGameTab(this,'economy')" style="flex:1">💰 Economy</button>
        <button class="adm-tab" id="gtab-seeds"   onclick="switchGameTab(this,'seeds')"   style="flex:1">🌱 Seeds</button>
        <button class="adm-tab" id="gtab-tod"     onclick="switchGameTab(this,'tod')"     style="flex:1">💋 Truth or Dare</button>
        <button class="adm-tab" id="gtab-leaders" onclick="switchGameTab(this,'leaders')" style="flex:1">🏆 Leaderboard</button>
        <button class="adm-tab" id="gtab-live" onclick="switchGameTab(this,'live')" style="flex:1">🔴 Live</button>
        <button class="adm-tab" onclick="exportGameStatsCSV()" style="flex:0 0 auto;background:rgba(212,175,55,.1);border:1px solid rgba(212,175,55,.3);color:var(--gold);font-size:11px">📊 CSV</button>
      </div>

      <!-- ── ECONOMY TAB ── -->
      <div id="gpanel-economy">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
          <div class="chart-card" style="border:1px solid var(--border)">
            <div style="font-size:13px;font-weight:800;margin-bottom:14px;color:var(--gold)">⚙️ Core Game Settings</div>
            <div class="mf"><label>Coin reward rate (coins per $1 USD)</label><input type="number" id="gsCoinRate" value="100" min="10" max="10000"/></div>
            <div class="mf"><label>Max wager per game (coins)</label><input type="number" id="gsMaxWager" value="500" min="10" max="50000"/></div>
            <div class="mf"><label>Daily free coin reward (coins)</label><input type="number" id="gsDailyMax" value="150" min="10" max="1000"/></div>
            <div class="mf"><label>XP to coin conversion (XP per 🪙1)</label><input type="number" id="gsXpRate" value="100" min="10" max="1000"/></div>
            <button class="btn btn-gold" onclick="saveGameSettings()" style="width:100%;margin-top:4px">💾 Save Settings</button>
          </div>
          <div class="chart-card" style="border:1px solid var(--border)">
            <div style="font-size:13px;font-weight:800;margin-bottom:14px;color:var(--gold)">🎲 Dice Shop Prices</div>
            <div class="mf"><label>Common dice price (coins)</label><input type="number" id="gsDiceCommon" value="100" min="10" max="5000"/></div>
            <div class="mf"><label>Rare dice price (coins)</label><input type="number" id="gsDiceRare" value="175" min="50" max="5000"/></div>
            <div class="mf"><label>Epic dice price (coins)</label><input type="number" id="gsDiceEpic" value="220" min="100" max="10000"/></div>
            <div class="mf"><label>Legendary dice price (coins)</label><input type="number" id="gsDiceLegend" value="500" min="200" max="20000"/></div>
            <div class="mf"><label>Lucky / bias dice surcharge (coins)</label><input type="number" id="gsDiceLucky" value="100" min="0" max="2000"/></div>
            <button class="btn btn-gold" onclick="saveDicePrices()" style="width:100%;margin-top:4px">💾 Save Dice Prices</button>
          </div>
        </div>
      </div>

      <!-- ── SEEDS TAB ── -->
      <div id="gpanel-seeds" style="display:none">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <div style="font-size:13px;color:var(--w60)">Create and manage Snake &amp; Ladder seeds — control prices, rarity, and availability</div>
          <button class="btn btn-gold" onclick="openCreateSeed()">+ Create Seed</button>
        </div>
        <div class="tbl-wrap"><table class="data-tbl">
          <thead><tr><th>Seed</th><th>Name</th><th>Value</th><th>Rarity</th><th>Trait</th><th>Coin Price</th><th>USD Price</th><th>Status</th><th>Sales</th><th>Actions</th></tr></thead>
          <tbody id="seedsBody"></tbody>
        </table></div>
      </div>

      <!-- ── TRUTH OR DARE TAB ── -->
      <div id="gpanel-tod" style="display:none">
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px;margin-bottom:16px">
          <div class="chart-card" style="border:1px solid var(--border);text-align:center;padding:12px">
            <div style="font-size:22px;margin-bottom:4px">👨‍👩‍👧‍👦</div>
            <div style="font-size:11px;font-weight:800">Family</div>
            <div id="todFamilyCount" style="font-size:22px;font-weight:900;color:var(--gold)">0</div>
            <div style="font-size:10px;color:var(--w60)">questions</div>
          </div>
          <div class="chart-card" style="border:1px solid var(--border);text-align:center;padding:12px">
            <div style="font-size:22px;margin-bottom:4px">🥂</div>
            <div style="font-size:11px;font-weight:800">Friends</div>
            <div id="todFriendsCount2" style="font-size:22px;font-weight:900;color:var(--gold)">0</div>
            <div style="font-size:10px;color:var(--w60)">questions</div>
          </div>
          <div class="chart-card" style="border:1px solid var(--border);text-align:center;padding:12px">
            <div style="font-size:22px;margin-bottom:4px">💋</div>
            <div style="font-size:11px;font-weight:800">Couples</div>
            <div id="todCouplesCount" style="font-size:22px;font-weight:900;color:var(--gold)">0</div>
            <div style="font-size:10px;color:var(--w60)">questions</div>
          </div>
          <div class="chart-card" style="border:1px solid var(--border);text-align:center;padding:12px">
            <div style="font-size:22px;margin-bottom:4px">🇳🇬</div>
            <div style="font-size:11px;font-weight:800">Naija</div>
            <div id="todNaijaCount" style="font-size:22px;font-weight:900;color:var(--gold)">0</div>
            <div style="font-size:10px;color:var(--w60)">questions</div>
          </div>
          <div class="chart-card" style="border:1px solid var(--border);text-align:center;padding:12px">
            <div style="font-size:22px;margin-bottom:4px">✈️</div>
            <div style="font-size:11px;font-weight:800">Diaspora</div>
            <div id="todDiasporaCount" style="font-size:22px;font-weight:900;color:var(--gold)">0</div>
            <div style="font-size:10px;color:var(--w60)">questions</div>
          </div>
          <div class="chart-card" style="border:1px solid var(--border);text-align:center;padding:12px">
            <div style="font-size:22px;margin-bottom:4px">🔥</div>
            <div style="font-size:11px;font-weight:800">Hot (18+)</div>
            <div id="todHotCount" style="font-size:22px;font-weight:900;color:var(--gold)">0</div>
            <div style="font-size:10px;color:var(--w60)">questions</div>
          </div>
          <div class="chart-card" style="border:1px solid var(--border);text-align:center;padding:12px">
            <div style="font-size:22px;margin-bottom:4px">🌍</div>
            <div style="font-size:11px;font-weight:800">Africa</div>
            <div id="todAfricaCount" style="font-size:22px;font-weight:900;color:var(--gold)">0</div>
            <div style="font-size:10px;color:var(--w60)">questions</div>
          </div>
        </div>
        <!-- Bulk import + export row -->
        <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">
          <button class="btn btn-ghost" onclick="todBulkImport()" style="color:var(--gold);border-color:rgba(212,175,55,.3)">📥 Bulk Import</button>
          <button class="btn btn-ghost" onclick="todExportAll()" style="color:#22c55e;border-color:rgba(34,197,94,.3)">📤 Export All</button>
          <button class="btn btn-ghost" onclick="todClearMode()" style="color:#ef4444;border-color:rgba(239,68,68,.3)">🗑 Clear Mode</button>
          <button class="btn btn-ghost" onclick="todExportMode()" style="color:var(--w60)">📋 Export Mode CSV</button>
        </div>

        <!-- Add question -->
        <div class="chart-card" style="border:1px solid var(--border-gold);margin-bottom:14px">
          <div style="font-size:13px;font-weight:800;color:var(--gold);margin-bottom:12px">+ Add New Question</div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:10px">
            <select id="todAddMode" class="adm-sel" style="flex:1;min-width:130px">
              <option value="family">👨‍👩‍👧‍👦 Family</option>
              <option value="friends">🥂 Friends</option>
              <option value="couples">💋 Couples</option>
              <option value="naija">🇳🇬 Naija</option>
              <option value="diaspora">✈️ Diaspora</option>
              <option value="hot">🔥 Hot (18+)</option>
              <option value="africa">🌍 Africa</option>
            </select>
            <select id="todAddType" class="adm-sel" style="flex:1;min-width:120px">
              <option value="truth">💬 Truth</option>
              <option value="dare">⚡ Dare</option>
            </select>
            <select id="todAddCat" class="adm-sel" style="flex:1;min-width:120px">
              <option value="chill">😊 Chill</option>
              <option value="spicy">🌶️ Spicy</option>
              <option value="wildcard">🃏 Wildcard</option>
            </select>
          </div>
          <textarea id="todAddText" placeholder="Enter the question or dare here…" rows="3"
            style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:10px;color:var(--white);font-size:13px;outline:none;resize:vertical"
            onfocus="this.style.borderColor='var(--gold)'" onblur="this.style.borderColor='var(--border)'"></textarea>
          <button class="btn btn-gold" onclick="adminAddTodQuestion()" style="margin-top:8px">+ Add Question</button>
        </div>

        <!-- Question list by mode -->
        <div style="display:flex;gap:6px;margin-bottom:10px">
          <button class="btn btn-ghost active" id="todViewFam"    onclick="viewTodMode('family')"   style="flex:1">👨‍👩‍👧‍👦 Family</button>
          <button class="btn btn-ghost"        id="todViewFri"    onclick="viewTodMode('friends')"  style="flex:1">🥂 Friends</button>
          <button class="btn btn-ghost"        id="todViewCou"    onclick="viewTodMode('couples')"  style="flex:1">💋 Couples</button>
          <button class="btn btn-ghost"        id="todViewNai"    onclick="viewTodMode('naija')"    style="flex:1">🇳🇬 Naija</button>
          <button class="btn btn-ghost"        id="todViewDia"    onclick="viewTodMode('diaspora')" style="flex:1">✈️ Diaspora</button>
          <button class="btn btn-ghost"        id="todViewHot"    onclick="viewTodMode('hot')"      style="flex:1">🔥 Hot</button>
          <button class="btn btn-ghost"        id="todViewAfr"    onclick="viewTodMode('africa')"   style="flex:1">🌍 Africa</button>
        </div>
        <div class="tbl-wrap"><table class="data-tbl">
          <thead><tr><th>#</th><th>Type</th><th>Question / Dare</th><th>Source</th><th>Actions</th></tr></thead>
          <tbody id="todBody"></tbody>
        </table></div>
      </div>


      <!-- ── LIVE SETTINGS ── -->
      <div id="gpanel-live" style="display:none">
        <div class="chart-card" style="border:1px solid var(--border-gold);margin-bottom:14px">
          <div style="font-size:13px;font-weight:800;color:var(--gold);margin-bottom:12px">🔴 Live Stream Settings</div>
          <div class="mf">
            <label>Max coins per gift (user limit)</label>
            <input type="number" id="liveMaxGiftCoins" value="1000" min="5" max="100000"/>
          </div>
          <div class="mf">
            <label>Max gifts per session (per user)</label>
            <input type="number" id="liveMaxGiftsPerSession" value="50" min="1" max="500"/>
          </div>
          <div class="mf">
            <label>Min coins to go live</label>
            <input type="number" id="liveMinCoinsToGoLive" value="0" min="0" max="10000"/>
          </div>
          <div class="mf">
            <label>Max live stream slots (concurrent streams)</label>
            <input type="number" id="liveMaxSlots" value="10" min="1" max="50"/>
          </div>
          <button class="btn btn-gold" onclick="saveLiveSettings()" style="width:100%;margin-top:4px">💾 Save Live Settings</button>
        </div>
        <div class="chart-card" style="border:1px solid var(--border)">
          <div style="font-size:13px;font-weight:800;color:var(--gold);margin-bottom:8px">📊 Live Stats</div>
          <div id="liveStatsGrid" style="display:grid;grid-template-columns:1fr 1fr;gap:8px"></div>
        </div>
      </div>

      <!-- ── LEADERBOARD TAB ── -->
      <div id="gpanel-leaders" style="display:none">
        <div class="tbl-wrap"><table class="data-tbl">
          <thead><tr><th>Rank</th><th>Player</th><th>Country</th><th>Coins</th><th>Level</th><th>W/P</th></tr></thead>
          <tbody id="ludoLeaders"></tbody>
        </table></div>
      </div>
    </div>


        <!-- PASSWORDS -->
    <div class="panel" id="p-passwords">
      <div class="panel-title">🔑 Password Management</div>
      <div class="panel-sub">Reset user passwords, force logout, unlock accounts</div>
      <div class="search-row">
        <input class="s-inp" id="pwSearch" placeholder="🔍  Search user by name, email or @username…" oninput="filterPwTable()"/>
        <select class="s-sel" id="pwStatus" onchange="filterPwTable()">
          <option value="">All Users</option><option value="active">Active</option><option value="suspended">Suspended</option>
        </select>
      </div>
      <div class="tbl-wrap"><table class="data-tbl">
        <thead><tr><th>User</th><th>Email</th><th>Username</th><th>Last Login</th><th>Login Count</th><th>Failed Logins</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody id="pwBody"></tbody>
      </table></div>
    </div>

    <!-- PERMISSIONS -->
    <div class="panel" id="p-permissions">
      <div class="panel-title">🛡️ Permissions &amp; Roles</div>
      <div class="panel-sub">Control admin access and feature permissions</div>
      <div class="btn-row" style="margin-bottom:20px">
        <button class="btn btn-gold" onclick="openAddAdmin()">+ Grant Admin Access</button>
      </div>
      <div class="sec-label">Admin Users</div>
      <div class="tbl-wrap"><table class="data-tbl">
        <thead><tr><th>User</th><th>Role</th><th>Permissions</th><th>Granted</th><th>Actions</th></tr></thead>
        <tbody id="adminsBody"></tbody>
      </table></div>
      <div class="sec-label" style="margin-top:24px">Role Definitions</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px" id="roleDefs"></div>
    </div>

    <!-- ACTIVITY -->
    <div class="panel" id="p-activity">
      <div class="panel-title">📋 Activity Log</div>
      <div class="panel-sub">Full audit trail of all platform events</div>
      <div class="search-row">
        <input class="s-inp" id="logSearch" placeholder="🔍  Filter by user, action, detail…" oninput="filterLog()"/>
        <select class="s-sel" id="logType" onchange="filterLog()">
          <option value="">All Events</option>
          <option value="login">🔐 Logins</option>
          <option value="signup">👤 Signups</option>
          <option value="payment">💰 Payments</option>
          <option value="game">🎮 Games</option>
          <option value="admin">🛡️ Admin</option>
          <option value="reset">🔑 Resets</option>
        </select>
        <button class="btn btn-ghost" onclick="clearLog()" style="color:var(--red);border-color:rgba(239,68,68,.3)">🗑 Clear Log</button>
        <button class="btn btn-ghost" onclick="exportLog()">📥 Export CSV</button>
      </div>
      <div id="logCount" style="font-size:12px;color:var(--w60);margin-bottom:10px"></div>
      <div class="tbl-wrap"><table class="data-tbl">
        <thead><tr><th>Time</th><th>Type</th><th>Admin</th><th>Action</th><th>Details</th></tr></thead>
        <tbody id="logBody"></tbody>
      </table></div>
    </div>

    <!-- LOGIN HISTORY PANEL -->
    <div class="panel" id="p-logins">
      <div class="panel-title">🔐 Login History</div>
      <div class="panel-sub">Every signup, login, logout, and failed attempt — real time</div>
      <div class="search-row">
        <input class="s-inp" id="loginSearch" placeholder="🔍 Search by user, email…" oninput="filterLogins()"/>
        <select class="s-sel" id="loginTypeFilter" onchange="filterLogins()">
          <option value="">All Events</option>
          <option value="login">Logins</option>
          <option value="signup">Signups</option>
          <option value="payment">Payments</option>
          <option value="game">Games</option>
          <option value="reset">Resets</option>
          <option value="admin">Admin</option>
        </select>
        <button class="btn btn-ghost" onclick="exportLoginCSV()">📥 Export CSV</button>
        <button class="btn btn-ghost" onclick="filterLogins()" style="color:var(--gold)">🔄 Refresh</button>
      </div>
      <div id="loginCount" style="font-size:12px;color:var(--w60);margin-bottom:10px"></div>
      <div class="tbl-wrap"><table class="data-tbl">
        <thead><tr><th>Time</th><th>Event</th><th>User</th><th>Email / Detail</th><th>Info</th></tr></thead>
        <tbody id="loginBody"></tbody>
      </table></div>
    </div>

    <!-- USER PROFILES PANEL -->
    <div class="panel" id="p-userdetail">
      <div class="panel-title">👤 User Profiles</div>
      <div class="panel-sub">Complete profile for every registered user — all data, activity, wallet, and history</div>
      <div class="search-row">
        <input class="s-inp" id="udSearch" placeholder="🔍 Search name, email, username, country, phone…" oninput="filterUserDetail()"/>
        <select class="s-sel" id="udSort" onchange="filterUserDetail()">
          <option value="joined">Newest First</option>
          <option value="login">Last Active</option>
          <option value="balance">Highest Balance</option>
          <option value="name">Name A–Z</option>
        </select>
        <select class="s-sel" id="udCountryFilter" onchange="filterUserDetail()">
          <option value="">All Countries</option>
        </select>
        <button class="btn btn-ghost" onclick="exportUsersCSV()">📥 Export All</button>
      </div>
      <div id="udCount" style="font-size:12px;color:var(--w60);margin-bottom:14px"></div>
      <div id="udGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px"></div>
    </div>

    <!-- MARKETPLACE ADMIN PANEL -->
    <div class="panel" id="p-marketplace">
      <div class="panel-title">🛒 Marketplace</div>
      <div class="panel-sub">All seller stores, product listings, and purchase transactions</div>
      <div class="stat-row" id="mktAdminStats"></div>
      <div class="sec-label" style="margin-top:16px">Active Seller Stores</div>
      <div id="mktAdminStores" style="margin-bottom:16px"></div>
      <div class="sec-label">All Listings</div>
      <div class="search-row">
        <input class="s-inp" id="mktAdminSearch" placeholder="🔍 Search products or sellers…" oninput="filterAdminListings()"/>
      </div>
      <div class="tbl-wrap"><table class="data-tbl">
        <thead><tr><th>Image</th><th>Product</th><th>Seller</th><th>Price</th><th>Category</th><th>Status</th><th>Listed</th></tr></thead>
        <tbody id="mktListingsBody"></tbody>
      </table></div>
      <div class="sec-label" style="margin-top:16px">Purchase Orders</div>
      <div class="tbl-wrap"><table class="data-tbl">
        <thead><tr><th>Time</th><th>Buyer</th><th>Items</th><th>Amount</th><th>Status</th></tr></thead>
        <tbody id="mktOrdersBody"></tbody>
      </table></div>
    </div>


    <!-- ANALYTICS -->
    <div class="panel" id="p-analytics">
      <div class="panel-title">📊 App Analytics</div>
      <div class="panel-sub">Real user behaviour, engagement events, and feature usage from consenting users</div>
      <div class="stat-row" id="analyticsStats"></div>
      <div class="chart-row">
        <div class="chart-card">
          <div class="chart-title">📈 Event Breakdown</div>
          <div id="analyticsEventBreakdown"></div>
        </div>
        <div class="chart-card">
          <div class="chart-title">👥 User Engagement</div>
          <div id="analyticsEngagement"></div>
        </div>
      </div>
      <div class="sec-label">Recent Events</div>
      <div class="tbl-wrap"><table class="data-tbl">
        <thead><tr><th>Time</th><th>Event</th><th>User</th><th>Value</th></tr></thead>
        <tbody id="analyticsTable"></tbody>
      </table></div>
    </div>

    <!-- BROADCAST -->
    <div class="panel" id="p-broadcast">
      <div class="panel-title">📢 Broadcast Messages</div>
      <div class="panel-sub">Send in-app notifications and announcements to all users or specific segments</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px">
        <div class="chart-card">
          <div class="chart-title">📣 Send Broadcast</div>
          <div class="mf"><label>Message Title</label><input type="text" id="bcastTitle" placeholder="e.g. New Feature Alert!"/></div>
          <div class="mf"><label>Message Body</label><textarea id="bcastBody" rows="3" placeholder="Write your message to all users…"></textarea></div>
          <div class="mf"><label>Target Audience</label>
            <select id="bcastAudience">
              <option value="all">All Users</option>
              <option value="active">Active users only</option>
              <option value="dating">Users with AfriMatch profile</option>
              <option value="noWallet">Users without payment method</option>
            </select>
          </div>
          <div class="mf"><label>Notification Type</label>
            <select id="bcastType">
              <option value="info">ℹ️ Info</option>
              <option value="promo">🎁 Promotion / Offer</option>
              <option value="game">🎮 Game Event</option>
              <option value="dating">💕 AfriMatch Update</option>
              <option value="alert">⚠️ Important Alert</option>
            </select>
          </div>
          <button class="btn btn-gold" onclick="sendBroadcast()" style="width:100%">📢 Send Now</button>
        </div>
        <div class="chart-card">
          <div class="chart-title">📋 Broadcast History</div>
          <div id="bcastHistory"></div>
        </div>
        <div class="chart-card">
          <div class="chart-title">🎁 Coin Airdrop</div>
          <p style="font-size:12px;color:var(--w60);margin-bottom:14px">Send coins to a group of users instantly</p>
          <div class="mf"><label>Amount per User (coins)</label><input type="number" id="airdropAmount" value="10" min="1"/></div>
          <div class="mf"><label>Target</label>
            <select id="airdropTarget">
              <option value="all">All Users</option>
              <option value="top10">Top 10 by coins</option>
              <option value="newToday">Joined today</option>
            </select>
          </div>
          <div class="mf"><label>Reason / Message</label><input type="text" id="airdropReason" placeholder="e.g. Weekend bonus!"/></div>
          <button class="btn btn-gold" onclick="sendAirdrop()" style="width:100%">🪙 Send Airdrop</button>
        </div>
      </div>
    </div>

    <!-- AFRIMATCH DATING ADMIN -->
    <div class="panel" id="p-dating">
      <div class="panel-title">💕 AfriMatch — Dating Management</div>
      <div class="panel-sub">Moderate dating profiles, manage reports, and control dating features</div>

      <div class="stat-row" id="datingStats"></div>

      <!-- Controls -->
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px;margin-bottom:24px">
        <div class="chart-card">
          <div class="chart-title">⚙️ Dating Feature Controls</div>
          <div style="display:flex;flex-direction:column;gap:12px;margin-top:8px">
            <div style="display:flex;align-items:center;justify-content:space-between">
              <span style="font-size:13px">AfriMatch Enabled</span>
              <label class="toggle-sw"><input type="checkbox" id="datingEnabled" checked onchange="saveDatingSettings()"/><span class="ts-sl"></span></label>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between">
              <span style="font-size:13px">Require Profile Photo</span>
              <label class="toggle-sw"><input type="checkbox" id="datingRequirePhoto" onchange="saveDatingSettings()"/><span class="ts-sl"></span></label>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between">
              <span style="font-size:13px">Age Verification (18+)</span>
              <label class="toggle-sw"><input type="checkbox" id="datingAgeGate" checked onchange="saveDatingSettings()"/><span class="ts-sl"></span></label>
            </div>
            <div class="mf" style="margin-bottom:0">
              <label>Daily Super Likes per User</label>
              <input type="number" id="datingDailySuperLikes" value="3" min="1" max="20"/>
            </div>
            <div class="mf" style="margin-bottom:0">
              <label>Daily Swipe Limit (0 = unlimited)</label>
              <input type="number" id="datingSwipeLimit" value="100" min="0"/>
            </div>
            <button class="btn btn-gold" onclick="saveDatingSettings()" style="width:100%;margin-top:4px">💾 Save Settings</button>
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-title">📊 Dating Activity</div>
          <div id="datingActivity"></div>
        </div>
        <div class="chart-card">
          <div class="chart-title">🌍 Top Heritage Groups</div>
          <div id="datingHeritageBreakdown"></div>
        </div>
      </div>

      <!-- Search & Filter -->
      <div class="search-row">
        <input class="s-inp" id="datingSearch" placeholder="🔍 Search by name, email, country, heritage…" oninput="filterDatingProfiles()"/>
        <select class="s-sel" id="datingFilterStatus" onchange="filterDatingProfiles()">
          <option value="">All Profiles</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="reported">Reported</option>
        </select>
        <select class="s-sel" id="datingFilterGender" onchange="filterDatingProfiles()">
          <option value="">All Genders</option>
          <option value="Man">Men</option>
          <option value="Woman">Women</option>
        </select>
        <button class="btn btn-ghost" onclick="exportDatingCSV()">📥 Export CSV</button>
      </div>

      <div id="datingProfileCount" style="font-size:12px;color:var(--w60);margin-bottom:10px"></div>

      <!-- Profiles table -->
      <div class="tbl-wrap">
        <table class="data-tbl">
          <thead><tr><th>Profile</th><th>Age / Gender</th><th>Location</th><th>Heritage</th><th>Goal</th><th>Interests</th><th>Joined</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody id="datingProfilesBody"></tbody>
        </table>
      </div>
    </div>

    <!-- SETTINGS -->
    <!-- ══════════════ GIFTME PANEL ══════════════ -->
    <div class="panel" id="p-giftme">
      <div class="panel-title">🎁 GiftMe Manager</div>
      <div class="panel-sub">Manage gift catalogue, prices, and view gift history</div>

      <!-- Stats row -->
      <div class="stat-row" id="gm-admin-stats" style="margin-bottom:20px"></div>

      <!-- Tabs -->
      <div style="display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap">
        <button class="adm-tab active" id="gm-adm-tab-catalogue" onclick="gmAdmTab(this,'catalogue')" style="padding:8px 18px;font-size:13px">📦 Catalogue</button>
        <button class="adm-tab" id="gm-adm-tab-add" onclick="gmAdmTab(this,'add')" style="padding:8px 18px;font-size:13px">➕ Add New Gift</button>
        <button class="adm-tab" id="gm-adm-tab-history" onclick="gmAdmTab(this,'history')" style="padding:8px 18px;font-size:13px">📊 History</button>
        <button class="adm-tab" id="gm-adm-tab-withdrawals" onclick="gmAdmTab(this,'withdrawals')" style="padding:8px 18px;font-size:13px">💸 Withdrawals</button>
      </div>

      <!-- CATALOGUE TAB -->
      <div id="gm-adm-catalogue">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <div style="font-size:13px;color:var(--w60)">Click any row to edit price. Changes save instantly.</div>
          <button onclick="gmAdmResetToDefaults()" style="background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);color:#EF4444;border-radius:8px;padding:6px 14px;font-size:12px;cursor:pointer">↺ Reset to Defaults</button>
        </div>
        <div id="gm-adm-catalogue-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px"></div>
      </div>

      <!-- ADD GIFT TAB -->
      <div id="gm-adm-add" style="display:none">
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:24px;max-width:480px">
          <div style="font-size:16px;font-weight:800;margin-bottom:18px">➕ Add New Gift</div>
          <div style="display:grid;gap:14px">
            <div>
              <label style="font-size:12px;color:var(--w60);display:block;margin-bottom:5px">Gift Name *</label>
              <input id="gm-new-name" placeholder="e.g. Black Mamba" style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:9px 12px;color:#fff;font-size:14px"/>
            </div>
            <div>
              <label style="font-size:12px;color:var(--w60);display:block;margin-bottom:5px">Emoji *</label>
              <input id="gm-new-emoji" placeholder="e.g. 🐍" style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:9px 12px;color:#fff;font-size:24px;max-width:80px"/>
            </div>
            <div>
              <label style="font-size:12px;color:var(--w60);display:block;margin-bottom:5px">Coin Price *</label>
              <input id="gm-new-coins" type="number" min="1" max="99999" placeholder="e.g. 200" style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:9px 12px;color:#fff;font-size:14px"/>
            </div>
            <div>
              <label style="font-size:12px;color:var(--w60);display:block;margin-bottom:5px">Tier</label>
              <select id="gm-new-tier" style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:9px 12px;color:#fff;font-size:14px">
                <option value="common">Common</option>
                <option value="rare">Rare</option>
                <option value="epic">Epic</option>
                <option value="legendary">Legendary</option>
              </select>
            </div>
            <div>
              <label style="font-size:12px;color:var(--w60);display:block;margin-bottom:5px">Category</label>
              <select id="gm-new-cat" style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:9px 12px;color:#fff;font-size:14px">
                <option value="love">Love</option>
                <option value="wildlife">Wildlife</option>
                <option value="cars">Cars 🚗</option>
                <option value="scene">Scene</option>
                <option value="luxury">Luxury</option>
                <option value="energy">Energy</option>
                <option value="special">Special</option>
                <option value="chill">Chill</option>
              </select>
            </div>
            <div>
              <label style="font-size:12px;color:var(--w60);display:block;margin-bottom:5px">Accent Color</label>
              <input id="gm-new-color" type="color" value="#FFD700" style="width:60px;height:36px;border:1px solid var(--border);border-radius:8px;padding:2px;cursor:pointer;background:var(--bg)"/>
            </div>
            <div>
              <label style="font-size:12px;color:var(--w60);display:block;margin-bottom:5px">Description</label>
              <input id="gm-new-desc" placeholder="Short tagline" style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:9px 12px;color:#fff;font-size:14px"/>
            </div>
          </div>
          <div id="gm-add-err" style="color:#EF4444;font-size:12px;margin-top:10px;display:none"></div>
          <button onclick="gmAdmAddGift()" style="width:100%;margin-top:16px;padding:12px;background:linear-gradient(135deg,var(--gold),var(--orange));border:none;border-radius:10px;color:#000;font-size:15px;font-weight:800;cursor:pointer">➕ Add Gift to Catalogue</button>
        </div>
      </div>

      <!-- HISTORY TAB -->
      <div id="gm-adm-history" style="display:none">
        <div style="font-size:13px;color:var(--w60);margin-bottom:12px">All gift transactions across the platform</div>
        <div id="gm-adm-hist-list"></div>
      </div>

      <!-- WITHDRAWALS TAB -->
      <div id="gm-adm-withdrawals" style="display:none">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
          <div>
            <div style="font-size:15px;font-weight:800;color:var(--white)">💸 Withdrawal Requests</div>
            <div style="font-size:12px;color:var(--w60);margin-top:2px">Review and approve/reject user cash-out requests. Diamonds are held until processed.</div>
          </div>
          <button onclick="dmAdminRenderWithdrawals()" style="background:rgba(0,212,255,.1);border:1px solid rgba(0,212,255,.3);color:#00D4FF;border-radius:8px;padding:6px 14px;font-size:12px;cursor:pointer">🔄 Refresh</button>
        </div>
        <!-- Diamond Economy Stats -->
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;margin-bottom:16px" id="gm-adm-diamond-stats"></div>
        <div id="gm-adm-withdrawals-list"></div>
      </div>
    </div>

    <!-- ══════════════ SETTINGS PANEL ══════════════ -->
    <div class="panel" id="p-settings">

      <!-- Firebase Config for Ludo Online -->
      <div style="background:rgba(255,107,0,.06);border:1px solid rgba(255,107,0,.2);border-radius:12px;padding:18px;margin-bottom:20px">
        <div style="font-size:14px;font-weight:700;color:#ff6b00;margin-bottom:6px">🔥 Firebase Realtime Ludo Config</div>
        <div style="font-size:12px;color:rgba(255,255,255,.5);margin-bottom:14px">Enable real-time online multiplayer for Ludo. Get these values from Firebase Console → Project Settings.</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
          <div>
            <label style="font-size:11px;color:var(--w60)">API Key</label>
            <input class="s-inp" id="fb_cfg_apiKey" placeholder="AIzaSy..." style="margin-top:4px" />
          </div>
          <div>
            <label style="font-size:11px;color:var(--w60)">Auth Domain</label>
            <input class="s-inp" id="fb_cfg_authDomain" placeholder="project.firebaseapp.com" style="margin-top:4px" />
          </div>
          <div>
            <label style="font-size:11px;color:var(--w60)">Database URL</label>
            <input class="s-inp" id="fb_cfg_databaseURL" placeholder="https://project-rtdb.firebaseio.com" style="margin-top:4px" />
          </div>
          <div>
            <label style="font-size:11px;color:var(--w60)">Project ID</label>
            <input class="s-inp" id="fb_cfg_projectId" placeholder="my-project" style="margin-top:4px" />
          </div>
          <div>
            <label style="font-size:11px;color:var(--w60)">Messaging Sender ID</label>
            <input class="s-inp" id="fb_cfg_messagingSenderId" placeholder="123456789" style="margin-top:4px" />
          </div>
          <div>
            <label style="font-size:11px;color:var(--w60)">App ID</label>
            <input class="s-inp" id="fb_cfg_appId" placeholder="1:123:web:abc" style="margin-top:4px" />
          </div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-gold" onclick="saveFBLudoConfig()">💾 Save Firebase Config</button>
          <button class="btn btn-ghost" onclick="loadFBLudoConfigIntoForm()">📥 Load Saved</button>
          <button class="btn btn-ghost" onclick="testFBLudoConnection()">🔌 Test Connection</button>
        </div>
        <div id="fbLudoConfigStatus" style="margin-top:10px;font-size:12px;color:rgba(255,255,255,.5)"></div>
      </div>      <div class="panel-title">⚙️ Settings</div>
      <div class="panel-sub">Admin credentials, platform configuration, and maintenance</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:20px">

        <!-- 🔴 Live Stream Settings -->
        <div class="chart-card">
          <div class="chart-title">🔴 Live Stream Settings</div>
          <p style="font-size:12px;color:var(--w60);margin-bottom:14px">
            Control how many live stream boxes appear on the YourStyle → Live tab.<br>
            Users see this many stream slots at once (empty slots invite users to go live).
          </p>
          <div class="mf">
            <label>Number of Live Stream Boxes (1–10)</label>
            <div style="display:flex;align-items:center;gap:10px;margin-top:8px">
              <input type="range" id="liveSlotRange" min="1" max="10" step="1"
                value="4"
                oninput="document.getElementById('liveSlotVal').textContent=this.value;_updateLiveSlotPreview(parseInt(this.value))"
                style="flex:1;accent-color:var(--gold)"/>
              <span id="liveSlotVal" style="font-size:18px;font-weight:900;color:var(--gold);min-width:24px;text-align:center">4</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--w30);margin-top:2px">
              <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span><span>10 boxes</span>
            </div>
          </div>
          <!-- Preview grid -->
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
            <span style="font-size:11px;color:var(--w60)">Preview</span>
            <span id="liveSlotBadge" style="font-size:11px;background:rgba(212,175,55,.15);color:var(--gold);border-radius:8px;padding:2px 8px;font-weight:700">4 boxes visible</span>
          </div>
          <div id="liveSlotPreview" style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin:0 0 12px;max-height:60px;overflow:hidden">
          </div>
          <button class="btn btn-gold" onclick="adminSaveLiveSlots()" style="width:100%">💾 Save Live Settings</button>
          <div id="liveSlotStatus" style="font-size:12px;color:var(--w60);margin-top:8px"></div>
        </div>

        <!-- Change Admin Password -->
        <div class="chart-card">
          <div class="chart-title">🔐 Change Admin Password</div>
          <div class="mf">
            <label>Current Password</label>
            <input type="password" id="sCurrPass" placeholder="Your current password"/>
            <div class="mf-err" id="sCurrPassErr">Incorrect current password</div>
          </div>
          <div class="mf">
            <label>New Password <span style="color:var(--w30);font-size:10px">(min 8 chars + number)</span></label>
            <input type="password" id="sNewPass" placeholder="New password" oninput="checkSettingsPassStrength()"/>
            <div class="strength-bar"><div class="strength-fill" id="sStrengthFill"></div></div>
            <div style="font-size:11px;color:var(--w60)" id="sStrengthLabel"></div>
            <div class="mf-err" id="sNewPassErr"></div>
          </div>
          <div class="mf">
            <label>Confirm New Password</label>
            <input type="password" id="sConfirmPass" placeholder="Repeat new password"/>
            <div class="mf-err" id="sConfirmPassErr">Passwords do not match</div>
          </div>
          <button class="btn btn-gold" onclick="saveAdminPassword()" style="width:100%">🔒 Change Password</button>
        </div>

        <!-- Change Admin Username -->
        <div class="chart-card">
          <div class="chart-title">👤 Change Admin Username</div>
          <div class="mf"><label>New Username</label><input type="text" id="sAdminUser" placeholder="New username (min 3 chars)"/></div>
          <div class="mf"><label>Confirm with Password</label><input type="password" id="sAdminUserPass" placeholder="Your current password"/></div>
          <button class="btn btn-gold" onclick="saveAdminUsername()" style="width:100%">Save Username</button>
        </div>

        <!-- Platform Stats -->
        <div class="chart-card">
          <div class="chart-title">📊 Platform Stats (Live)</div>
          <div id="platformStats"></div>
        </div>

        <!-- Maintenance -->
        <div class="chart-card">
          <div class="chart-title">🚨 Maintenance Mode</div>
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
            <label class="toggle-sw"><input type="checkbox" id="maintToggle" onchange="document.getElementById('maintLabel').textContent='Maintenance '+(this.checked?'ON 🔴':'OFF ✅')"/><span class="ts-sl"></span></label>
            <span id="maintLabel" style="font-size:13px;color:var(--w60)">Maintenance OFF ✅</span>
          </div>
          <div class="mf"><label>Maintenance Message</label><textarea id="maintMsg" rows="3">We're upgrading AfriBconnect. Back very soon!</textarea></div>
          <button class="btn btn-gold" onclick="saveMaintenance()" style="width:100%">Apply</button>
        </div>

        <!-- Danger Zone -->
        <div class="chart-card" style="border-color:rgba(239,68,68,.3)">
          <div class="chart-title" style="color:var(--red)">⚠️ Danger Zone</div>
          <p style="font-size:12px;color:var(--w60);margin-bottom:14px">These actions are irreversible. Proceed with extreme caution.</p>
          <button class="btn btn-red" style="width:100%;margin-bottom:8px" onclick="clearAllLogs()">🗑 Clear All Activity Logs</button>
          <button class="btn btn-red" style="width:100%" onclick="resetPlatformData()">⚠️ Reset All Platform Data</button>
        </div>
      </div>
    </div>

    <!-- MESSAGING ADMIN PANEL -->
    <div class="panel" id="p-messaging">
      <div class="panel-title">💬 Messaging Monitor</div>
      <div class="panel-sub">View, moderate, and manage all platform DMs and conversations</div>
      <div class="stat-row" id="msgStats"></div>
      <div class="search-row">
        <input class="s-inp" id="msgSearch" placeholder="🔍 Search by user, keyword…" oninput="filterMsgs()"/>
        <select class="s-sel" id="msgFilter" onchange="filterMsgs()">
          <option value="">All Messages</option>
          <option value="flagged">🚩 Flagged</option>
          <option value="media">📷 Contains Media</option>
          <option value="recent">🕐 Last 24h</option>
        </select>
        <button class="btn btn-red" onclick="deleteSelectedMsgs()">🗑 Delete Selected</button>
        <button class="btn btn-ghost" onclick="exportMsgsCSV()">📥 Export CSV</button>
      </div>
      <div class="tbl-wrap"><table class="data-tbl">
        <thead><tr>
          <th><input type="checkbox" id="msgSelectAll" onchange="toggleSelectAllMsgs(this)" style="accent-color:var(--gold)"/></th>
          <th>From</th><th>To</th><th>Message</th><th>Type</th><th>Sent</th><th>Flagged</th><th>Actions</th>
        </tr></thead>
        <tbody id="msgBody"></tbody>
      </table></div>

      <!-- Conversation View Modal -->
      <div id="convoModal" class="modal-overlay" onclick="if(event.target===this)this.classList.remove('open')">
        <div class="modal" style="max-width:620px">
          <button class="modal-close" onclick="document.getElementById('convoModal').classList.remove('open')">✕</button>
          <h3 id="convoTitle">Conversation</h3>
          <p class="msub" id="convoSub"></p>
          <div id="convoThread" style="max-height:400px;overflow-y:auto;border:1px solid var(--border);border-radius:10px;padding:12px;background:var(--bg);display:flex;flex-direction:column;gap:8px"></div>
          <div class="modal-btns">
            <button class="btn btn-red" onclick="deleteConvoFromModal()">🗑 Delete Conversation</button>
            <button class="btn btn-ghost" onclick="document.getElementById('convoModal').classList.remove('open')">Close</button>
          </div>
        </div>
      </div>
    </div>

    <!-- BACKUP & RESTORE PANEL -->
    <div class="panel" id="p-backup">
      <div class="panel-title">💾 Backup & Restore</div>
      <div class="panel-sub">Export all platform data to your device, restore from backup, or clear data</div>

      <!-- Backup Cards -->
      <div class="stat-row" style="grid-template-columns:repeat(auto-fill,minmax(220px,1fr))">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-val" id="bkpUserCount">—</div>
          <div class="stat-label">Users Backed Up</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💬</div>
          <div class="stat-val" id="bkpMsgCount">—</div>
          <div class="stat-label">Messages</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-val" id="bkpTxCount">—</div>
          <div class="stat-label">Transactions</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🕐</div>
          <div class="stat-val" id="bkpLastTime">Never</div>
          <div class="stat-label">Last Backup</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px">
        <!-- Export Section -->
        <div style="background:var(--bg3);border:1px solid var(--border);border-radius:14px;padding:20px">
          <div style="font-size:15px;font-weight:700;margin-bottom:4px">📤 Export Data</div>
          <div style="font-size:12px;color:var(--w60);margin-bottom:16px">Download data to your phone or computer</div>
          <div style="display:flex;flex-direction:column;gap:10px">
            <button class="btn btn-gold" style="width:100%;padding:10px" onclick="exportBackup('full')">
              📦 Full Platform Backup (JSON)
            </button>
            <button class="btn btn-ghost" style="width:100%;padding:10px" onclick="exportBackup('users')">
              👥 Users Only (CSV)
            </button>
            <button class="btn btn-ghost" style="width:100%;padding:10px" onclick="exportBackup('transactions')">
              💰 Transactions (CSV)
            </button>
            <button class="btn btn-ghost" style="width:100%;padding:10px" onclick="exportBackup('messages')">
              💬 Messages (CSV)
            </button>
            <button class="btn btn-ghost" style="width:100%;padding:10px" onclick="exportBackup('games')">
              🎮 Game Data (JSON)
            </button>
            <button class="btn btn-ghost" style="width:100%;padding:10px" onclick="exportBackup('settings')">
              ⚙️ Settings & Config (JSON)
            </button>
          </div>
        </div>

        <!-- Restore / Danger Section -->
        <div style="background:var(--bg3);border:1px solid var(--border);border-radius:14px;padding:20px">
          <div style="font-size:15px;font-weight:700;margin-bottom:4px">📥 Restore / Manage</div>
          <div style="font-size:12px;color:var(--w60);margin-bottom:16px">Import or reset platform data</div>
          <div style="display:flex;flex-direction:column;gap:10px">
            <label style="display:block">
              <div class="btn btn-ghost" style="width:100%;padding:10px;text-align:center;cursor:pointer">
                📂 Restore from JSON Backup
              </div>
              <input type="file" accept=".json" style="display:none" onchange="restoreBackup(this)"/>
            </label>
            <button class="btn btn-ghost" style="width:100%;padding:10px" onclick="scheduleAutoBackup()">
              🔄 Schedule Auto-Backup
            </button>
            <hr style="border:none;border-top:1px solid var(--border);margin:4px 0"/>
            <div style="font-size:11px;color:var(--red);font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-top:4px">⚠️ Danger Zone</div>
            <button class="btn btn-red" style="width:100%;padding:10px" onclick="clearDataConfirm('messages')">
              🗑 Clear All Messages
            </button>
            <button class="btn btn-red" style="width:100%;padding:10px" onclick="clearDataConfirm('gamedata')">
              🎮 Reset All Game Data
            </button>
          </div>
        </div>
      </div>

      <!-- Auto-backup log -->
      <div class="sec-label">Backup History</div>
      <div class="tbl-wrap"><table class="data-tbl">
        <thead><tr><th>Timestamp</th><th>Type</th><th>Size</th><th>Records</th><th>Status</th><th>Action</th></tr></thead>
        <tbody id="backupLogBody"></tbody>
      </table></div>
    </div>

    <!-- ADS MANAGEMENT PANEL -->
    <div class="panel" id="p-ads">
      <div class="panel-title">📢 Ad Publications</div>
      <div class="panel-sub">Create and manage sponsored ads that appear in YourStyle feed and Marketplace</div>
      <div class="stat-row" id="adStats"></div>
      <div style="display:flex;justify-content:flex-end;margin:12px 0">
        <button class="btn btn-gold" onclick="openCreateAd()">+ Create New Ad</button>
      </div>
      <div class="tbl-wrap"><table class="data-tbl">
        <thead><tr><th>Ad</th><th>Title / Tagline</th><th>CTA</th><th>Status</th><th>Impressions</th><th>Clicks</th><th>CTR</th><th>Created</th><th>Actions</th></tr></thead>
        <tbody id="adsBody"></tbody>
      </table></div>
    </div>

    <!-- YOURSTYLE FEED PANEL -->
    <div class="panel" id="p-feed">
      <div class="panel-title">✨ YourStyle Feed</div>
      <div class="panel-sub">All user posts, likes, comments and social activity</div>
      <div class="stat-row" id="feedStats"></div>
      <div class="sec-label" style="margin-top:12px">All Posts</div>
      <div class="search-row">
        <input class="s-inp" id="feedSearch" placeholder="🔍 Search posts, users…" oninput="filterFeedAdmin()"/>
        <select class="s-sel" id="feedCatFilter" onchange="filterFeedAdmin()">
          <option value="">All Categories</option>
          <option value="fashion">👗 Fashion</option>
          <option value="beauty">💄 Beauty</option>
          <option value="lifestyle">🌿 Lifestyle</option>
          <option value="food">🍽 Food</option>
          <option value="culture">🌍 Culture</option>
          <option value="fitness">💪 Fitness</option>
        </select>
      </div>
      <div class="tbl-wrap"><table class="data-tbl">
        <thead><tr><th>Post</th><th>Author</th><th>Category</th><th>Caption</th><th>Likes</th><th>Comments</th><th>Posted</th><th>Actions</th></tr></thead>
        <tbody id="feedBody"></tbody>
      </table></div>
    </div>

    <!-- CREATE AD MODAL -->
    <div id="createAdModal" class="adm-modal-overlay" style="display:none" onclick="if(event.target===this)this.style.display='none'">
      <div class="adm-modal-card" onclick="event.stopPropagation()">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <h3 id="createAdTitle">📢 Create New Ad</h3>
          <button onclick="document.getElementById('createAdModal').style.display='none'" style="background:none;border:none;color:var(--w60);font-size:20px;cursor:pointer">✕</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:12px">
          <div><label class="lbl">Ad Title *</label><input type="text" id="adTitle" placeholder="e.g. Summer Fashion Sale" class="adm-inp"/></div>
          <div><label class="lbl">Tagline</label><input type="text" id="adTagline" placeholder="e.g. Up to 50% off African styles" class="adm-inp"/></div>
          <div><label class="lbl">Call to Action (CTA)</label><input type="text" id="adCta" placeholder="e.g. Shop Now, Learn More" class="adm-inp" value="Shop Now"/></div>
          <div><label class="lbl">Link URL</label><input type="url" id="adUrl" placeholder="https://…" class="adm-inp"/></div>
          <div><label class="lbl">Emoji / Icon</label><input type="text" id="adEmoji" placeholder="🛍" class="adm-inp" maxlength="4" style="font-size:24px"/></div>
          <div>
            <label class="lbl">Ad Image (optional)</label>
            <div id="adImgPreview" onclick="document.getElementById('adImgInput').click()"
              style="width:100%;height:120px;border:2px dashed var(--border-gold);border-radius:10px;display:flex;align-items:center;justify-content:center;cursor:pointer;background:var(--bg3);overflow:hidden">
              <span style="color:var(--w60);font-size:13px">📷 Upload image</span>
            </div>
            <input type="file" id="adImgInput" accept="image/*" style="display:none" onchange="handleAdImageUpload(this)"/>
          </div>
          <div><label class="lbl">Status</label>
            <select id="adStatus" class="adm-sel">
              <option value="active">✅ Active</option>
              <option value="paused">⏸ Paused</option>
            </select>
          </div>
          <input type="hidden" id="adEditId" value=""/>
          <div style="display:flex;gap:8px;margin-top:4px">
            <button class="btn btn-ghost" onclick="document.getElementById('createAdModal').style.display='none'">Cancel</button>
            <button class="btn btn-gold" onclick="saveAd()" style="flex:1">💾 Save Ad</button>
          </div>
        </div>
      </div>
    </div>


    <!-- SEED CREATE/EDIT MODAL -->
    <div id="seedModal" class="adm-modal-overlay" style="display:none" onclick="if(event.target===this)this.style.display='none'">
      <div class="adm-modal-card" onclick="event.stopPropagation()" style="max-width:540px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <h3 id="seedModalTitle">🌱 Create New Seed</h3>
          <button onclick="document.getElementById('seedModal').style.display='none'" style="background:none;border:none;color:var(--w60);font-size:20px;cursor:pointer">✕</button>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div><label class="lbl">Seed Name *</label><input type="text" id="seedName" placeholder="e.g. Golden Ankh Seed" class="adm-inp"/></div>
          <div><label class="lbl">Seed Number *</label><input type="number" id="seedValue" placeholder="e.g. 42" min="1" max="999999" class="adm-inp"/></div>
          <div><label class="lbl">Emoji</label><input type="text" id="seedEmoji" placeholder="🌱" maxlength="4" class="adm-inp" style="font-size:20px;text-align:center"/></div>
          <div>
            <label class="lbl">Rarity</label>
            <select id="seedRarity" class="adm-sel">
              <option value="free">Free</option>
              <option value="common" selected>Common</option>
              <option value="rare">Rare</option>
              <option value="epic">Epic</option>
              <option value="legendary">Legendary</option>
              <option value="premium">Premium ($)</option>
            </select>
          </div>
          <div><label class="lbl">Coin Price (0 = free)</label><input type="number" id="seedCoinPrice" placeholder="100" min="0" max="100000" class="adm-inp"/></div>
          <div><label class="lbl">USD Price (0 = not for sale)</label><input type="number" id="seedUsdPrice" placeholder="0" min="0" max="100" step="0.01" class="adm-inp"/></div>
          <div style="grid-column:1/-1"><label class="lbl">Special Trait / Description *</label><input type="text" id="seedTrait" placeholder="e.g. Fewer snake encounters — safer paths" class="adm-inp"/></div>
          <div style="grid-column:1/-1"><label class="lbl">Full Description</label><textarea id="seedDesc" placeholder="Longer description for the detail popup…" rows="2" class="adm-inp" style="resize:vertical"></textarea></div>
          <div>
            <label class="lbl">Status</label>
            <select id="seedStatus" class="adm-sel">
              <option value="active">✅ Active (visible in shop)</option>
              <option value="hidden">🙈 Hidden (admin only)</option>
            </select>
          </div>
          <div><label class="lbl">Bias (lucky effect)</label>
            <select id="seedBias" class="adm-sel">
              <option value="0">None — standard rolls</option>
              <option value="1">Lucky — biased high</option>
              <option value="2">Power — always 4-6</option>
            </select>
          </div>
        </div>
        <input type="hidden" id="seedEditId" value=""/>
        <div style="display:flex;gap:8px;margin-top:16px">
          <button class="btn btn-ghost" onclick="document.getElementById('seedModal').style.display='none'">Cancel</button>
          <button class="btn btn-gold" onclick="saveSeed()" style="flex:1">💾 Save Seed</button>
        </div>
      </div>
    </div>



    </main>
</div>

<!-- EDIT USER MODAL -->
<div class="modal-overlay" id="editUserModal">
  <div class="modal" onclick="event.stopPropagation()">
    <button class="modal-close" onclick="closeM('editUserModal')">✕</button>
    <h3 id="editUserTitle">Edit User</h3>
    <p class="msub" id="editUserSub"></p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div class="mf"><label>First Name</label><input id="eFirst"/><div class="mf-err" id="eFirstErr">Required</div></div>
      <div class="mf"><label>Last Name</label><input id="eLast"/></div>
    </div>
    <div class="mf"><label>Username</label><input id="eUsername" placeholder="@username"/></div>
    <div class="mf"><label>Country</label>
      <select id="eCountry">
        <option value="">— Select —</option>
        <option>Nigeria</option><option>Kenya</option><option>Ghana</option><option>South Africa</option>
        <option>Sierra Leone</option><option>Liberia</option><option>Ethiopia</option><option>Tanzania</option>
        <option>Uganda</option><option>Senegal</option><option>Cameroon</option><option>Zimbabwe</option>
        <option>Rwanda</option><option>Angola</option><option>Morocco</option><option>Egypt</option>
        <option>Diaspora / Other</option>
      </select>
    </div>
    <div class="mf"><label>Profession</label><input id="eProfession"/></div>
    <div class="mf"><label>Phone Number</label><input id="ePhone" placeholder="+232 76 000 000"/></div>
    <div class="mf"><label>Wallet Balance (USD)</label><input type="number" id="eBalance" min="0" step="0.01"/></div>
    <div class="mf"><label>Game Coins</label><input type="number" id="eCoins" min="0"/></div>
    <div class="mf"><label>Account Status</label>
      <select id="eStatus">
        <option value="active">Active</option>
        <option value="suspended">Suspended</option>
        <option value="banned">Banned</option>
      </select>
    </div>
    <div class="mf">
      <label>Membership Plan <span style="color:var(--w30);font-size:10px">Sets user access tier</span></label>
      <select id="ePlan" style="width:100%;background:var(--bg);border:1.5px solid var(--border);border-radius:8px;padding:10px 12px;color:var(--white);font-size:13px;outline:none;cursor:pointer" onchange="adminPreviewPlan(this.value)">
        <option value="free">Free — Standard access</option>
        <option value="pro">⭐ Pro — $4.99/mo</option>
        <option value="vip">👑 VIP — $19.99/mo · All features</option>
        <option value="business">💼 Business — $49.99/mo · API + Analytics</option>
      </select>
      <div id="ePlanBadge" style="margin-top:6px;min-height:20px"></div>
    </div>
    <div class="mf"><label>Admin Notes <span style="color:var(--w30);font-size:10px">(internal — not shown to user)</span></label><textarea id="eNotes" rows="2"></textarea></div>
    <div class="modal-btns">
      <button class="btn btn-ghost" onclick="closeM('editUserModal')">Cancel</button>
      <button class="btn btn-red" id="suspendBtn" onclick="quickSuspendFromModal()">Suspend</button>
      <button class="btn btn-gold" onclick="saveUserEdit()">Save Changes</button>
    </div>
  </div>
</div>

<!-- RESET PASSWORD MODAL -->
<div class="modal-overlay" id="resetPwModal">
  <div class="modal" onclick="event.stopPropagation()">
    <button class="modal-close" onclick="closeM('resetPwModal')">✕</button>
    <h3>🔑 Reset User Password</h3>
    <p class="msub" id="resetPwFor">Reset password for user</p>
    <div class="mf">
      <label>New Password <span style="color:var(--w30);font-size:10px">(min 8 chars)</span></label>
      <input type="password" id="newPw" placeholder="Enter new password" oninput="checkResetPassStrength()"/>
      <div class="strength-bar"><div class="strength-fill" id="rpStrengthFill"></div></div>
      <div style="font-size:11px;color:var(--w60)" id="rpStrengthLabel"></div>
      <div class="mf-err" id="newPwErr"></div>
    </div>
    <div class="mf">
      <label>Confirm Password</label>
      <input type="password" id="newPwConfirm" placeholder="Repeat password" onkeydown="if(event.key==='Enter')doResetPassword()"/>
      <div class="mf-err" id="newPwConfirmErr">Passwords do not match</div>
    </div>
    <div style="background:rgba(212,175,55,.08);border:1px solid var(--border-gold);border-radius:8px;padding:10px 14px;font-size:12px;color:var(--w60);margin-bottom:4px">
      🔔 The user's password will be updated immediately. Their active session will also be cleared.
    </div>
    <div class="modal-btns">
      <button class="btn btn-ghost" onclick="closeM('resetPwModal')">Cancel</button>
      <button class="btn btn-gold" onclick="doResetPassword()">Reset Password</button>
    </div>
  </div>
</div>

<!-- ADD ADMIN MODAL -->
<div class="modal-overlay" id="addAdminModal">
  <div class="modal" onclick="event.stopPropagation()">
    <button class="modal-close" onclick="closeM('addAdminModal')">✕</button>
    <h3>🛡️ Grant Admin Access</h3>
    <p class="msub">Select a registered user and assign their role</p>
    <div class="mf"><label>Search User</label><input id="addAdminSearch" placeholder="Name, email or @username…" oninput="searchForAdmin()" autocomplete="off"/></div>
    <div id="adminSearchResults" style="margin-bottom:14px"></div>
    <div class="mf"><label>Role</label>
      <select id="addAdminRole" onchange="updatePermCheckboxes()">
        <option value="super">Super Admin — full access</option>
        <option value="moderator">Moderator — users + activity</option>
        <option value="support">Support Agent — passwords + read</option>
        <option value="finance">Finance Manager — wallets + tx</option>
        <option value="games">Games Manager — games only</option>
      </select>
    </div>
    <div class="mf"><label>Permissions</label>
      <div id="permCBs" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px"></div>
    </div>
    <div class="modal-btns">
      <button class="btn btn-ghost" onclick="closeM('addAdminModal')">Cancel</button>
      <button class="btn btn-gold" onclick="doAddAdmin()">Grant Access</button>
    </div>
  </div>
</div>

<!-- ADJUST BALANCE MODAL -->
<div class="modal-overlay" id="adjustBalModal">
  <div class="modal" onclick="event.stopPropagation()">
    <button class="modal-close" onclick="closeM('adjustBalModal')">✕</button>
    <h3>💰 Adjust Balance</h3>
    <p class="msub" id="adjBalFor"></p>
    <div class="mf"><label>New Balance (USD $)</label><input type="number" id="adjNewBal" min="0" step="0.01"/></div>
    <div class="mf"><label>Reason (required)</label><input id="adjReason" placeholder="e.g. Correction, compensation, bonus…"/></div>
    <div class="mf-err" id="adjReasonErr" style="display:none">Please enter a reason</div>
    <div class="modal-btns">
      <button class="btn btn-ghost" onclick="closeM('adjustBalModal')">Cancel</button>
      <button class="btn btn-gold" onclick="doAdjustBalance()">Apply</button>
    </div>
  </div>
</div>

<div class="toast" id="aToast"></div>

<script>
'use strict';
/* ══════════════════════════════════════════════════════
   ADMIN PANEL — AfriBconnect
   All data reads from the same localStorage as the main app.
   No mocks. Everything is real.
══════════════════════════════════════════════════════ */

const ADM_KEY      = 'afrib_admin_creds';
const ADM_LOG_KEY  = 'afrib_admin_log';
const ADM_USERS_KEY= 'afrib_admin_users';
const ADM_SETTINGS = 'afrib_game_settings';

let currentAdmin      = null;
let editingEmail       = null;
let resetPwEmail       = null;
let adjustBalEmail     = null;
let selectedAdminEmail = null;

/* ══════════════════════════════
   SAFE DATA HELPERS
══════════════════════════════ */
function tryParse(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch(e) { console.warn('Parse error for', key, e); return fallback; }
}

function getAdminCreds() {
  return tryParse(ADM_KEY, null) || { user:'admin', passHash: '__init__' };
}
function saveAdminCreds(creds) {
  try { localStorage.setItem(ADM_KEY, JSON.stringify(creds)); return true; }
  catch(e) { showToastA('❌ Failed to save credentials: ' + e.message); return false; }
}

function getAccounts() {
  return tryParse('afrib_accounts', {});
}
function saveAccounts(accounts) {
  try { localStorage.setItem('afrib_accounts', JSON.stringify(accounts)); return true; }
  catch(e) { showToastA('❌ Storage error: ' + e.message); return false; }
}
function getUsers() {
  return Object.values(getAccounts());
}
function getUser(email) {
  return getAccounts()[email] || null;
}
function saveUser(u) {
  if (!u || !u.email) return false;
  const a = getAccounts();
  a[u.email] = u;
  return saveAccounts(a);
}
function getUserCoins(email) {
  return parseInt(localStorage.getItem('afrib_coins_' + email) || '0');
}
function setUserCoins(email, coins) {
  localStorage.setItem('afrib_coins_' + email, Math.max(0, parseInt(coins) || 0));
}
function getAdminUsers() { return tryParse(ADM_USERS_KEY, []); }
function saveAdminUsers(l) { localStorage.setItem(ADM_USERS_KEY, JSON.stringify(l)); }
function getLog() { return tryParse(ADM_LOG_KEY, []); }
function appendLog(type, admin, action, detail='') {
  const l = getLog();
  l.unshift({ time: new Date().toISOString(), type, user: admin || currentAdmin || 'system', action, detail });
  if (l.length > 1000) l.splice(1000);
  localStorage.setItem(ADM_LOG_KEY, JSON.stringify(l));
}
function getGameSettings() {
  return tryParse(ADM_SETTINGS, { coinRate:100, maxWager:500, dailyMax:150 });
}

function getUserStatus(u) {
  if (!u) return 'unknown';
  if (u.banned || u.status === 'banned')         return 'banned';
  if (u.suspended || u.status === 'suspended')   return 'suspended';
  return u.status || 'active';
}

/* ══════════════════════════════════════════════════════════════════════
   🔐 SECURITY ENGINE — PBKDF2-SHA256 (upgraded from plain-text, v66)
   Admin passwords hashed with 200,000 PBKDF2 iterations + random salt.
   Backward-compatible: auto-migrates legacy plain$ hashes on first login.
══════════════════════════════════════════════════════════════════════ */
const _ADMSEC = (() => {
  const ITERATIONS = 200000;
  const HASH       = 'SHA-256';
  const KEY_LEN    = 32; // bytes → 256-bit

  function _enc(str) { return new TextEncoder().encode(str); }

  async function _deriveKey(pw, saltHex) {
    const salt    = Uint8Array.from(saltHex.match(/.{2}/g), h => parseInt(h, 16));
    const keyMat  = await crypto.subtle.importKey('raw', _enc(pw), 'PBKDF2', false, ['deriveBits']);
    const bits    = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: HASH }, keyMat, KEY_LEN * 8
    );
    return Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2,'0')).join('');
  }

  function _randomSalt() {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    return Array.from(bytes).map(b => b.toString(16).padStart(2,'0')).join('');
  }

  /** Hash a new password → returns "pbkdf2adm$<salt>$<hash>" */
  async function hashNew(pw) {
    const salt = _randomSalt();
    const hash = await _deriveKey(pw, salt);
    return `pbkdf2adm$${salt}$${hash}`;
  }

  /** Verify pw against stored hash — handles pbkdf2adm$ and legacy plain$ */
  async function verify(pw, stored) {
    if (!stored || !pw) return false;
    try {
      // ── New PBKDF2 format
      if (stored.startsWith('pbkdf2adm$')) {
        const [, salt, hash] = stored.split('$');
        const derived = await _deriveKey(pw, salt);
        // Constant-time compare
        if (derived.length !== hash.length) return false;
        let diff = 0;
        for (let i = 0; i < derived.length; i++) diff |= derived.charCodeAt(i) ^ hash.charCodeAt(i);
        return diff === 0;
      }
      // ── Legacy plain$ format — accept once, caller will re-hash
      if (stored.startsWith('plain$')) return pw === stored.slice(6);
    } catch(e) { console.error('[_ADMSEC] verify error:', e); }
    return false;
  }

  /** True if hash needs upgrade (not yet PBKDF2) */
  function needsUpgrade(stored) { return !stored || !stored.startsWith('pbkdf2adm$'); }

  return { hashNew, verify, needsUpgrade };
})();

/* ── User password hash (must match main app _SEC engine) ── */
async function hashUserPw(pw) {
  if (typeof _SEC !== 'undefined' && _SEC.hashNew) return _SEC.hashNew(pw);
  // Fallback PBKDF2 matching script.js format
  const salt = Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b=>b.toString(16).padStart(2,'0')).join('');
  const enc  = new TextEncoder();
  const keyMat = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveBits']);
  const bits   = await crypto.subtle.deriveBits({name:'PBKDF2',salt:enc.encode(salt),iterations:100000,hash:'SHA-256'}, keyMat, 256);
  return 'pbkdf2$' + salt + '$' + btoa(String.fromCharCode(...new Uint8Array(bits)));
}
async function hashAdminPw(pw) { return _ADMSEC.hashNew(pw); }

/* ══════════════════════════════
   ADMIN LOGIN
══════════════════════════════ */
function resetAdminCredsNow() {
  localStorage.setItem(ADM_KEY, JSON.stringify({ user: 'admin', passHash: 'plain$Welcome12!' }));
  localStorage.removeItem('admin_session');
  document.getElementById('aU').value = 'admin';
  document.getElementById('aP').value = '';
  document.getElementById('loginErr').style.display = 'none';
  showToastA('✅ Credentials reset to defaults. Password is: Welcome12!');
  const banner = document.getElementById('defaultCredsBanner');
  if (banner) {
    banner.style.background = 'rgba(34,197,94,.1)';
    banner.style.borderColor = 'rgba(34,197,94,.3)';
  }
}

function toggleAdminPass() {
  const inp = document.getElementById('aP');
  inp.type = inp.type === 'password' ? 'text' : 'password';
}

async function doAdminLogin() {
  const u    = (document.getElementById('aU').value || '').trim();
  const p    = document.getElementById('aP').value;
  const errEl = document.getElementById('loginErr');
  const btn  = document.getElementById('loginBtn');

  errEl.style.display = 'none';
  document.getElementById('aU').classList.remove('err');
  document.getElementById('aP').classList.remove('err');

  if (!u) { document.getElementById('aU').classList.add('err'); errEl.textContent='Username is required'; errEl.style.display='block'; return; }
  if (!p) { document.getElementById('aP').classList.add('err'); errEl.textContent='Password is required'; errEl.style.display='block'; return; }

  btn.disabled = true;
  btn.textContent = '⏳ Verifying…';

  // Check SA-managed admin credentials first (afrib_admin_credentials dict)
  try {
    const saCredMap = JSON.parse(localStorage.getItem('afrib_admin_credentials') || '{}');
    if (saCredMap[u]) {
      const pwHash = saCredMap[u];
      // Async PBKDF2 verify — supports both pbkdf2adm$ and legacy plain$
      const pwOk = await _ADMSEC.verify(p, pwHash);
      if (pwOk) {
        // Auto-upgrade plain$ to PBKDF2 in the credential map
        if (_ADMSEC.needsUpgrade(pwHash)) {
          const newHash = await _ADMSEC.hashNew(p);
          saCredMap[u] = newHash;
          localStorage.setItem('afrib_admin_credentials', JSON.stringify(saCredMap));
        }
        btn.disabled = false; btn.textContent = '🔐 Login to Dashboard';
        const sess = { user: u, loginAt: new Date().toISOString(), time: new Date().toISOString() };
        localStorage.setItem('admin_session', JSON.stringify(sess));
        appendLog('login', u, 'Admin login via SA credentials');
        if (typeof enterAdminApp === 'function') enterAdminApp();
        return;
      }
    }
  } catch(e) { console.error('[Admin login] SA cred check error:', e); }

  const creds = getAdminCreds();

  // If no stored hash at all, initialise with hashed default
  if (!creds.passHash) {
    const defaultHash = await _ADMSEC.hashNew('Welcome12!');
    localStorage.setItem(ADM_KEY, JSON.stringify({ user: creds.user || 'admin', passHash: defaultHash, _defaultPw: true }));
    creds.passHash = defaultHash;
    creds._defaultPw = true;
  }

  const passOk = await _ADMSEC.verify(p, creds.passHash);

  btn.disabled = false;
  btn.textContent = '🔐 Login to Dashboard';

  if (u !== creds.user || !passOk) {
    errEl.textContent = '❌ Incorrect username or password';
    errEl.style.display = 'block';
    document.getElementById('aP').classList.add('err');
    appendLog('login', u, 'Failed admin login attempt', 'Wrong credentials');
    return;
  }

  // Auto-upgrade plain$ hash to PBKDF2 on successful login
  if (_ADMSEC.needsUpgrade(creds.passHash)) {
    creds.passHash = await _ADMSEC.hashNew(p);
    delete creds._defaultPw;
    saveAdminCreds(creds);
  }

  currentAdmin = u;

  // Check if using default password — force change
  if (creds._defaultPw || (creds.passHash && await _ADMSEC.verify('Welcome12!', creds.passHash))) {
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('changePassScreen').style.display = 'flex';
    appendLog('login', u, 'Admin login — forced password change (default password)');
    return;
  }

  enterAdminApp();
}

/* ══════════════════════════════
   FORCE PASSWORD CHANGE (first login)
══════════════════════════════ */
function checkCpStrength() {
  checkPassStrength(document.getElementById('cpNewPass').value, 'cpStrengthFill', 'cpStrengthLabel');
}

async function doChangeAdminPass() {
  const pw      = document.getElementById('cpNewPass').value;
  const confirm = document.getElementById('cpConfirm').value;
  const errEl   = document.getElementById('cpErr');
  errEl.style.display = 'none';

  if (pw.length < 8)           { errEl.textContent='❌ Password must be at least 8 characters';    errEl.style.display='block'; return; }
  if (!/[0-9]/.test(pw))       { errEl.textContent='❌ Must include at least one number';           errEl.style.display='block'; return; }
  if (!/[A-Z]/.test(pw))       { errEl.textContent='❌ Must include at least one uppercase letter'; errEl.style.display='block'; return; }
  if (!/[^a-zA-Z0-9]/.test(pw)){ errEl.textContent='❌ Must include at least one special character'; errEl.style.display='block'; return; }
  if (pw !== confirm)           { errEl.textContent='❌ Passwords do not match';                    errEl.style.display='block'; return; }
  if (pw === 'Welcome12!')      { errEl.textContent='❌ You cannot reuse the default password';     errEl.style.display='block'; return; }

  try {
    const creds = getAdminCreds();
    creds.passHash = await _ADMSEC.hashNew(pw);
    delete creds._defaultPw;
    if (!saveAdminCreds(creds)) return;
    // Regenerate session with secure token (NOT the hash)
    const sessionToken = Array.from(crypto.getRandomValues(new Uint8Array(24))).map(b=>b.toString(16).padStart(2,'0')).join('');
    localStorage.setItem('admin_session', JSON.stringify({ user: currentAdmin, token: sessionToken, time: new Date().toISOString() }));
    appendLog('admin', currentAdmin, 'Changed admin password (was using default)');
    document.getElementById('changePassScreen').style.display = 'none';
    enterAdminApp();
    showToastA('✅ Password updated! You are now logged in.');
  } catch(e) {
    console.error('[doChangeAdminPass]', e);
    errEl.textContent = '❌ Error saving password. Please try again.';
    errEl.style.display = 'block';
  }
}

function enterAdminApp() {
  document.getElementById('adminLogin').style.display = 'none';
  document.getElementById('changePassScreen').style.display = 'none';
  document.getElementById('adminApp').style.display = 'block';
  document.getElementById('aAvEl').textContent = currentAdmin[0].toUpperCase();
  document.getElementById('aUserLabel').textContent = currentAdmin;
  document.getElementById('sAdminUser').value = currentAdmin;

  // Save session so admin stays logged in on page refresh
  try {
    // Generate a fresh random session token — never store the password hash as a token
    const sessionToken = Array.from(crypto.getRandomValues(new Uint8Array(24)))
      .map(b => b.toString(16).padStart(2,'0')).join('');
    localStorage.setItem('admin_session', JSON.stringify({
      user:  currentAdmin,
      token: sessionToken,
      time:  new Date().toISOString(),
    }));
    // Save username if "remember me" checked
    const rem = document.getElementById('adminRememberMe');
    if (rem?.checked) {
      localStorage.setItem('admin_saved_username', currentAdmin);
    } else if (rem && !rem.checked) {
      localStorage.removeItem('admin_saved_username');
    }
  } catch(e) {}

  initDashboard();
  loadSettingsFields();
  appendLog('login', currentAdmin, 'Admin logged in successfully');
}

function doAdminLogout() {
  if (!confirm('Log out of the admin panel?')) return;
  appendLog('login', currentAdmin, 'Admin logged out');
  currentAdmin = null;
  try { localStorage.removeItem('admin_session'); } catch(e) {}
  document.getElementById('adminApp').style.display   = 'none';
  document.getElementById('adminLogin').style.display = 'flex';
  document.getElementById('aP').value = '';
  document.getElementById('loginErr').style.display = 'none';
}

/* ══════════════════════════════
   PANEL SWITCHING
══════════════════════════════ */
function goPanel(btn, name) {
  try {
    if (!btn) {
      document.querySelectorAll('.adm-tab').forEach(b => { if (b.textContent.toLowerCase().includes(name)) btn = b; });
    }
    document.querySelectorAll('.adm-tab').forEach(b => b.classList.remove('active'));
    // Clear new-user badges on the tab being clicked
    if (btn) {
      btn.classList.add('active');
      const badge = btn.querySelector('.admin-new-badge');
      if (badge) badge.remove();
      btn.style.background = '';
      btn.style.color = '';
    }
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    const panel = document.getElementById('p-' + name);
    if (panel) panel.classList.add('active');
    const init = { users: initUsers, wallets: initWallets, games: initGames, passwords: initPasswords, permissions: initPermissions, activity: renderLog, settings: initSettings, dashboard: initDashboard, dating: initDating, analytics: initAnalytics, broadcast: initBroadcast, logins: initLoginHistory, ads: initAdsPanel, feed: initFeedPanel, userdetail: initUserDetail, marketplace: initMarketplacePanel, messaging: initMessaging, backup: initBackup, giftme: initGmPanel };
    if (init[name]) init[name]();
  } catch(e) { console.error('goPanel:', e); showToastA('⚠️ Panel error: ' + e.message); }
}
function closeM(id) { const el = document.getElementById(id); if (el) el.classList.remove('open'); }
function showM(id)  { const el = document.getElementById(id); if (el) el.classList.add('open'); }
function showToastA(msg) {
  const t = document.getElementById('aToast');
  if (!t) return;
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3000);
}
function timeAgo(iso) {
  if (!iso) return '—';
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60)    return Math.floor(d) + 's ago';
  if (d < 3600)  return Math.floor(d/60) + 'm ago';
  if (d < 86400) return Math.floor(d/3600) + 'h ago';
  return Math.floor(d/86400) + 'd ago';
}
function formatDate(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'}); }
  catch(e) { return '—'; }
}

/* ══════════════════════════════
   DASHBOARD — 100% real data
══════════════════════════════ */
function initDashboard() {
  const users   = getUsers();
  const now     = new Date();
  const todayStr= now.toDateString();
  const todayUsers = users.filter(u => new Date(u.createdAt || 0).toDateString() === todayStr);
  const totalBal   = users.reduce((s,u) => s + (u.walletBalance || 0), 0);
  const totalCoins = users.reduce((s,u) => s + getUserCoins(u.email), 0);
  const countries  = [...new Set(users.map(u => u.country).filter(Boolean))];
  const suspended  = users.filter(u => getUserStatus(u) === 'suspended').length;
  const weekAgo    = new Date(now - 7*86400000);
  const weekUsers  = users.filter(u => new Date(u.createdAt||0) > weekAgo).length;

  document.getElementById('dashSubtitle').textContent =
    `Live data — ${users.length} registered users · Last updated ${now.toLocaleTimeString()}`;

  document.getElementById('dStats').innerHTML = [
    { icon:'👥', val:users.length,                       label:'Total Users',      delta:`+${weekUsers} this week` },
    { icon:'📈', val:todayUsers.length,                  label:'New Today',        delta:'registrations' },
    { icon:'💰', val:'$'+(totalBal||0).toFixed(2)+' USD',  label:'Total Balances',   delta:'all wallets combined' },
    { icon:'🪙', val:totalCoins.toLocaleString(),        label:'Game Coins',       delta:'in circulation' },
    { icon:'🌍', val:countries.length,                   label:'Countries',        delta:'represented' },
    { icon:'✅', val:users.length - suspended,           label:'Active Users',     delta:`${suspended} suspended` },
  ].map(s => `<div class="stat-card">
    <div class="stat-icon">${s.icon}</div>
    <div class="stat-val">${s.val}</div>
    <div class="stat-label">${s.label}</div>
    <div class="stat-delta">${s.delta}</div>
  </div>`).join('');

  // Signup chart — last 7 days (real data)
  const days = Array.from({length:7}, (_,i) => {
    const d = new Date(now); d.setDate(d.getDate() - (6-i));
    return { label: d.toLocaleDateString('en',{weekday:'short'}), date: d.toDateString() };
  });
  const dayMap = {}; days.forEach(d => { dayMap[d.date] = 0; });
  users.forEach(u => { const ds = new Date(u.createdAt||0).toDateString(); if (dayMap[ds] !== undefined) dayMap[ds]++; });
  const vals = days.map(d => dayMap[d.date]);
  const mx   = Math.max(...vals, 1);
  document.getElementById('signupChart').innerHTML   = vals.map(v => `<div class="bar" style="height:${Math.max(3,(v/mx)*90)}px" title="${v} signups"></div>`).join('');
  document.getElementById('signupLabels').innerHTML  = days.map(d => `<div class="bar-label">${d.label}</div>`).join('');
  document.getElementById('signupTotal').textContent = `${vals.reduce((a,b)=>a+b,0)} this week`;

  // Wallet balances by country (real)
  const balByCountry = {};
  users.forEach(u => { if (u.country) balByCountry[u.country] = (balByCountry[u.country]||0) + (u.walletBalance||0); });
  const topBal = Object.entries(balByCountry).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const maxBal = (topBal[0]?.[1]) || 1;
  document.getElementById('walletByCountry').innerHTML = topBal.length
    ? topBal.map(([c,b]) => `<div style="margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px"><span>${c}</span><span style="color:var(--green)">$${b.toFixed(2)}</span></div>
        <div class="prog-bar"><div class="prog-fill" style="width:${(b/maxBal)*100}%;background:var(--green)"></div></div>
      </div>`).join('')
    : '<div style="color:var(--w60);font-size:13px">No wallet data yet</div>';
  document.getElementById('walletVolLabel').textContent = '$'+(totalBal||0).toFixed(2)+' USD';

  // Game stats (real from ludo progress)
  let totalLudoGames = 0, totalLudoWins = 0;
  users.forEach(u => {
    const prog = tryParse('afrib_ludo_' + u.email, {});
    totalLudoGames += prog.stats?.gamesPlayed || 0;
    totalLudoWins  += prog.stats?.wins || 0;
  });
  document.getElementById('gameBreakdown').innerHTML = [
    { label:'🎲 Ludo',            val: totalLudoGames,  col:'#D4AF37', pct: totalLudoGames ? 100 : 0 },
    { label:'🎲 Ludo Wins',       val: totalLudoWins,   col:'#22c55e', pct: totalLudoGames ? Math.round(totalLudoWins/totalLudoGames*100) : 0 },
    { label:'🪙 Total Coins',     val: totalCoins.toLocaleString(), col:'#E85D26', pct: Math.min(100, totalCoins/100) },
  ].map(g => `<div style="margin-bottom:10px">
    <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px"><span>${g.label}</span><span style="color:${g.col}">${g.val}</span></div>
    <div class="prog-bar"><div class="prog-fill" style="width:${g.pct}%;background:${g.col}"></div></div>
  </div>`).join('');

  // Countries breakdown (real)
  const cCounts = {};
  users.forEach(u => { if (u.country) cCounts[u.country] = (cCounts[u.country]||0)+1; });
  const top = Object.entries(cCounts).sort((a,b)=>b[1]-a[1]).slice(0,6);
  const cMx = (top[0]?.[1]) || 1;
  document.getElementById('countryBreakdown').innerHTML = top.length
    ? top.map(([c,n]) => `<div style="margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px"><span>${c}</span><span style="color:var(--gold)">${n} user${n!==1?'s':''}</span></div>
        <div class="prog-bar"><div class="prog-fill" style="width:${(n/cMx)*100}%"></div></div>
      </div>`).join('')
    : '<div style="color:var(--w60);font-size:13px">No user data yet</div>';

  // Country filter populate
  const sel = document.getElementById('uCountry');
  if (sel) sel.innerHTML = '<option value="">All Countries</option>' + countries.sort().map(c => `<option>${String(c||'').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</option>`).join('');

  // Recent signups
  const recent = [...users].sort((a,b) => new Date(b.createdAt||0) - new Date(a.createdAt||0)).slice(0,6);
  document.getElementById('recentSignups').innerHTML = recent.length
    ? recent.map(u => `<tr>
        <td><strong>${u.first||''} ${u.last||''}</strong><br><small style="color:var(--w60)">@${u.username||'—'}</small></td>
        <td>${u.country||'—'}</td>
        <td>${formatDate(u.createdAt)}</td>
        <td><span class="badge ${getUserStatus(u)==='active'?'g':'o'}">${getUserStatus(u)}</span></td>
      </tr>`).join('')
    : '<tr><td colspan="4" style="color:var(--w60);text-align:center;padding:16px">No users registered yet</td></tr>';

  // Activity feed (real log)
  const log = getLog().slice(0, 12);
  const icons = { login:'🔐', signup:'👤', payment:'💰', game:'🎮', admin:'🛡️', reset:'🔑' };
  document.getElementById('actFeed').innerHTML = log.length
    ? log.map(l => `<div class="act-item">
        <div class="act-icon">${icons[l.type]||'📋'}</div>
        <div class="act-text">${l.action}<small>${l.user}${l.detail ? ' · ' + l.detail : ''}</small></div>
        <div class="act-time">${timeAgo(l.time)}</div>
      </div>`).join('')
    : '<div style="color:var(--w60);font-size:13px;padding:12px">No activity recorded yet</div>';

  // ── Live refresh: watch for new users and auto-refresh dashboard
  _startAdminLiveWatch();
}

/* Live watcher — checks every 10s for new signups and refreshes dashboard */
let _adminLiveWatchInterval = null;
let _adminLastUserCount = 0;
let _adminLastLogCount  = 0;

function _startAdminLiveWatch() {
  try {
    if (_adminLiveWatchInterval) clearInterval(_adminLiveWatchInterval);
    _adminLastUserCount = getUsers().length;
    _adminLastLogCount  = getLog().length;

    _adminLiveWatchInterval = setInterval(() => {
      try {
        const users    = getUsers();
        const log      = getLog();
        const newUsers = users.length - _adminLastUserCount;
        const newLogs  = log.length  - _adminLastLogCount;

        if (newUsers > 0) {
          _adminLastUserCount = users.length;
          // Show new-user toast
          const newest = [...users].sort((a,b) => new Date(b.createdAt||0) - new Date(a.createdAt||0))[0];
          showToastA(`🆕 New user registered: ${newest?.first||''} ${newest?.last||''} (${newest?.email||''})`);
          // Flash the Users tab
          const usersTab = document.querySelector('[onclick*="users"]');
          if (usersTab) {
            usersTab.style.background = 'rgba(212,175,55,.25)';
            usersTab.style.color      = 'var(--gold)';
            const badge = usersTab.querySelector('.admin-new-badge') || (() => {
              const b = document.createElement('span');
              b.className = 'admin-new-badge';
              b.style.cssText = 'background:#22c55e;color:#000;border-radius:20px;padding:0 5px;font-size:10px;font-weight:700;margin-left:4px';
              usersTab.appendChild(b);
              return b;
            })();
            badge.textContent = '+' + newUsers;
            setTimeout(() => { usersTab.style.background = ''; usersTab.style.color = ''; }, 5000);
          }
          // Refresh dashboard stats if active
          const dashPanel = document.getElementById('p-dashboard');
          if (dashPanel && dashPanel.classList.contains('active')) {
            // Only refresh stats, not full page
            _refreshDashStats();
          }
        }

        if (newLogs > 0) {
          _adminLastLogCount = log.length;
          // Refresh activity feed if dashboard is active
          const dashPanel = document.getElementById('p-dashboard');
          if (dashPanel && dashPanel.classList.contains('active')) {
            const icons = { login:'🔐', signup:'👤', payment:'💰', game:'🎮', admin:'🛡️', reset:'🔑', backup:'💾', restore:'📥', danger:'⚠️' };
            const feedEl = document.getElementById('actFeed');
            if (feedEl) {
              feedEl.innerHTML = log.slice(0, 12).map(l => `<div class="act-item">
                <div class="act-icon">${icons[l.type]||'📋'}</div>
                <div class="act-text">${l.action||''}<small>${l.user||''}${l.detail ? ' · ' + l.detail : ''}</small></div>
                <div class="act-time">${timeAgo(l.time)}</div>
              </div>`).join('') || '<div style="color:var(--w60);font-size:13px;padding:12px">No activity yet</div>';
            }
          }
        }
      } catch(e) { console.warn('_adminLiveWatch tick:', e); }
    }, 8000); // every 8 seconds
  } catch(e) { console.error('_startAdminLiveWatch:', e); }
}

/* Lightweight stat-only refresh (no full page re-render) */
function _refreshDashStats() {
  try {
    const users     = getUsers();
    const now       = new Date();
    const todayStr  = now.toDateString();
    const todayUsers= users.filter(u => new Date(u.createdAt||0).toDateString() === todayStr);
    const totalBal  = users.reduce((s,u) => s + (u.walletBalance||0), 0);
    const totalCoins= users.reduce((s,u) => s + getUserCoins(u.email), 0);
    const countries = [...new Set(users.map(u => u.country).filter(Boolean))];
    const suspended = users.filter(u => getUserStatus(u) === 'suspended').length;
    const weekAgo   = new Date(now - 7*86400000);
    const weekUsers = users.filter(u => new Date(u.createdAt||0) > weekAgo).length;
    const statsEl   = document.getElementById('dStats');
    if (!statsEl) return;
    statsEl.innerHTML = [
      { icon:'👥', val:users.length,                        label:'Total Users',     delta:`+${weekUsers} this week` },
      { icon:'📈', val:todayUsers.length,                   label:'New Today',       delta:'registrations' },
      { icon:'💰', val:'$'+(totalBal||0).toFixed(2)+' USD', label:'Total Balances',  delta:'all wallets combined' },
      { icon:'🪙', val:totalCoins.toLocaleString(),         label:'Game Coins',      delta:'in circulation' },
      { icon:'🌍', val:countries.length,                    label:'Countries',       delta:'represented' },
      { icon:'✅', val:users.length - suspended,            label:'Active Users',    delta:`${suspended} suspended` },
    ].map(s => `<div class="stat-card">
      <div class="stat-icon">${s.icon}</div>
      <div class="stat-val">${s.val}</div>
      <div class="stat-label">${s.label}</div>
      <div class="stat-delta">${s.delta}</div>
    </div>`).join('');
    document.getElementById('dashSubtitle').textContent = `Live data — ${users.length} registered users · Last updated ${now.toLocaleTimeString()}`;
    // Refresh recent signups
    const recent = [...users].sort((a,b) => new Date(b.createdAt||0) - new Date(a.createdAt||0)).slice(0,6);
    const rsEl = document.getElementById('recentSignups');
    if (rsEl) {
      rsEl.innerHTML = recent.length
        ? recent.map(u => `<tr>
            <td><strong>${u.first||''} ${u.last||''}</strong><br><small style="color:var(--w60)">@${u.username||'—'}</small></td>
            <td>${u.country||'—'}</td>
            <td>${formatDate(u.createdAt)}</td>
            <td><span class="badge ${getUserStatus(u)==='active'?'g':'o'}">${getUserStatus(u)}</span></td>
          </tr>`).join('')
        : '<tr><td colspan="4" style="color:var(--w60);text-align:center;padding:16px">No users yet</td></tr>';
    }
  } catch(e) { console.error('_refreshDashStats:', e); }
}

/* ══════════════════════════════
   USERS — real data
══════════════════════════════ */
/* ══════════════════════════════════════════════════════
   MEMBERSHIP PLANS — constants & helpers
══════════════════════════════════════════════════════ */
const ADMIN_PLANS = {
  free:     { id:'free',     label:'Free',     emoji:'',   color:'#6B7280', badge:'Member',      wagerMax:100  },
  pro:      { id:'pro',      label:'Pro',       emoji:'⭐', color:'#3B82F6', badge:'⭐ Pro',        wagerMax:1000 },
  vip:      { id:'vip',      label:'VIP',       emoji:'👑', color:'#D4AF37', badge:'👑 VIP',        wagerMax:5000 },
  business: { id:'business', label:'Business',  emoji:'💼', color:'#8B5CF6', badge:'💼 Business',   wagerMax:10000},
};

function adminPreviewPlan(planId) {
  const badgeEl = document.getElementById('ePlanBadge');
  if (!badgeEl) return;
  const plan = ADMIN_PLANS[planId] || ADMIN_PLANS.free;
  if (planId === 'free') { badgeEl.innerHTML = ''; return; }
  badgeEl.innerHTML = `<span style="display:inline-flex;align-items:center;gap:4px;background:${plan.color}22;border:1px solid ${plan.color}66;color:${plan.color};border-radius:20px;padding:3px 12px;font-size:11px;font-weight:800">${plan.badge}</span>`;
}

function getAdminUserPlan(email) {
  try {
    const a = getAccounts();
    const planId = (a[email] && a[email].plan) || 'free';
    return ADMIN_PLANS[planId] || ADMIN_PLANS.free;
  } catch(e) { return ADMIN_PLANS.free; }
}

function initUsers() {
  buildCountryFilter();
  filterUsers();
}

function buildCountryFilter() {
  const countries = [...new Set(getUsers().map(u => u.country).filter(Boolean))].sort();
  const sel = document.getElementById('uCountry');
  if (sel) sel.innerHTML = '<option value="">All Countries</option>' + countries.map(c => `<option>${String(c||'').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</option>`).join('');
}

function filterUsers() {
  const q     = (document.getElementById('uSearch')?.value  || '').toLowerCase().trim();
  const ctry  = document.getElementById('uCountry')?.value  || '';
  const st    = document.getElementById('uStatus')?.value   || '';
  let list    = getUsers();

  if (q)    list = list.filter(u => `${u.first||''} ${u.last||''} ${u.email||''} ${u.username||''}`.toLowerCase().includes(q));
  if (ctry) list = list.filter(u => u.country === ctry);
  if (st)   list = list.filter(u => getUserStatus(u) === st);

  list.sort((a,b) => new Date(b.createdAt||0) - new Date(a.createdAt||0));

  const countEl = document.getElementById('uCount');
  if (countEl) countEl.textContent = `Showing ${list.length} of ${getUsers().length} users`;

  renderUsersTable(list);
}

function renderUsersTable(users) {
  const tbody = document.getElementById('usersBody');
  if (!tbody) return;

  if (!users.length) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:var(--w60);padding:20px">No users found</td></tr>';
    return;
  }

  const _uE = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;');
  tbody.innerHTML = users.map(u => {
    const st    = getUserStatus(u);
    const init  = ((u.first||'U')[0] + (u.last||'')[0]).toUpperCase().replace(/</g,'').replace(/>/g,'');
    const coins = getUserCoins(u.email);
    const dobDisplay = u.dob ? _uE(u.dob) + (u.age ? ` (${parseInt(u.age)||0}y)` : '') : '—';
    const bal   = typeof u.walletBalance === 'number' ? '$' + u.walletBalance.toFixed(2) : '$0.00';
    const phoneDisplay = u.phone ? `<div style="font-size:10px;color:var(--w60)">${_uE(u.phone)}</div>` : '';
    const safeEmail    = _uE(u.email);
    const safeFirst    = _uE(u.first);
    const safeLast     = _uE(u.last);
    const safeUsername = _uE(u.username);
    const safeCountry  = _uE(u.country);
    const safeEmoji    = _uE(u.countryEmoji);
    const safeSt       = _uE(st);

    return `<tr>
      <td><div style="display:flex;align-items:center;gap:8px">
        <div style="width:30px;height:30px;border-radius:50%;background:var(--gold-dim);color:var(--gold);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0">${init}</div>
        <div><div style="font-weight:500">${safeFirst} ${safeLast}</div><div style="font-size:11px;color:var(--w60)">${safeEmail}</div>${phoneDisplay}</div>
      </div></td>
      <td style="color:var(--gold)">@${safeUsername||'—'}</td>
      <td>${safeEmoji} ${safeCountry||'—'}</td>
      <td style="color:var(--gold);font-weight:600">${bal}<br><small style="color:var(--w60)">🪙 ${coins.toLocaleString()}</small></td>
      <td style="font-size:12px;color:var(--w60)">${dobDisplay}</td>
      <td style="font-size:12px">${formatDate(u.createdAt)}</td>
      <td style="font-size:12px;color:var(--w60)">${u.lastLogin ? timeAgo(u.lastLogin) : 'Never'}</td>
      <td><span class="badge ${safeSt==='active'?'g':safeSt==='suspended'?'o':'r'}">${safeSt}</span>
        ${u._forcePassChange ? '<br><span class="badge b" style="margin-top:3px">🔑 must change pw</span>' : ''}
        ${(function(){ const _p=getAdminUserPlan(u.email); return _p.id!=='free' ? '<br><span style="display:inline-block;margin-top:3px;padding:1px 7px;border-radius:10px;font-size:10px;font-weight:800;background:'+_p.color+'22;border:1px solid '+_p.color+'55;color:'+_p.color+'">'+_p.badge+'</span>' : ''; })()}</td>
      <td><div class="btn-row">
        <button class="btn btn-b"    onclick="openEditUser('${safeEmail}')">✏️ Edit</button>
        <button class="btn btn-ghost" onclick="openResetPw('${safeEmail}')">🔑</button>
        <button class="btn ${safeSt==='suspended'?'btn-g':'btn-red'}" onclick="quickSuspend('${safeEmail}')">${safeSt==='suspended'?'Unsuspend':'Suspend'}</button>
      </div></td>
    </tr>`;
  }).join('');
}

function openEditUser(email) {
  const u = getUser(email);
  if (!u) { showToastA('❌ User not found'); return; }
  editingEmail = email;
  const st = getUserStatus(u);

  document.getElementById('eFirst').value      = u.first || '';
  document.getElementById('eLast').value       = u.last || '';
  document.getElementById('eUsername').value   = u.username || '';
  document.getElementById('eCountry').value    = u.country || '';
  document.getElementById('eProfession').value = u.profession || '';
  document.getElementById('ePhone').value      = u.phone || '';
  document.getElementById('eBalance').value    = (u.walletBalance || 0).toFixed ? (u.walletBalance || 0).toFixed(2) : (u.walletBalance || 0);
  document.getElementById('eCoins').value      = getUserCoins(email);
  document.getElementById('eStatus').value     = u.status || 'active';
  document.getElementById('eNotes').value      = u._adminNotes || '';
  // Pre-select user's current plan
  const ePlanEl = document.getElementById('ePlan');
  if (ePlanEl) { ePlanEl.value = u.plan || 'free'; adminPreviewPlan(ePlanEl.value); }
  document.getElementById('editUserTitle').textContent = `Edit: ${u.first||''} ${u.last||''}`;
  document.getElementById('editUserSub').textContent   = `${u.email} · Joined ${formatDate(u.createdAt)}`;
  document.getElementById('suspendBtn').textContent    = st === 'suspended' ? 'Unsuspend' : 'Suspend';
  document.querySelectorAll('#editUserModal .mf-err').forEach(e => e.style.display = 'none');
  showM('editUserModal');
}

function saveUserEdit() {
  if (!editingEmail) return;
  const first = document.getElementById('eFirst').value.trim();
  const errEl = document.getElementById('eFirstErr');
  if (!first) { errEl.style.display='block'; return; }
  errEl.style.display = 'none';

  const a = getAccounts();
  const u = a[editingEmail];
  if (!u) { showToastA('❌ User no longer exists'); closeM('editUserModal'); return; }

  const newUsername = document.getElementById('eUsername').value.trim().toLowerCase();
  // Check username uniqueness (excluding this user)
  if (newUsername && newUsername !== u.username) {
    const taken = Object.values(a).some(x => x.email !== editingEmail && x.username === newUsername);
    if (taken) { showToastA('⚠️ Username @' + newUsername + ' is already taken'); return; }
  }

  u.first       = first;
  u.last        = document.getElementById('eLast').value.trim() || u.last;
  u.username    = newUsername || u.username;
  u.country     = document.getElementById('eCountry').value || u.country;
  u.profession  = document.getElementById('eProfession').value.trim();
  u.phone       = document.getElementById('ePhone')?.value.trim() || u.phone || '';
  u.walletBalance = Math.max(0, parseFloat(document.getElementById('eBalance').value) || 0);
  u.status      = document.getElementById('eStatus').value;
  u._adminNotes = document.getElementById('eNotes').value;
  // Save membership plan
  const newPlan = document.getElementById('ePlan')?.value || 'free';
  if (newPlan !== (u.plan || 'free')) {
    u.plan = newPlan;
    u.planLabel = { free:'Free', pro:'Pro', vip:'VIP', business:'Business' }[newPlan] || 'Free';
    u.planSetAt = new Date().toISOString();
    u.planSetBy = currentAdmin || 'admin';
    appendLog('admin', currentAdmin, `Set plan: ${newPlan}`, editingEmail);
  }

  const newCoins = parseInt(document.getElementById('eCoins').value) || 0;
  setUserCoins(editingEmail, newCoins);

  a[editingEmail] = u;
  if (!saveAccounts(a)) return;

  closeM('editUserModal');
  filterUsers();
  appendLog('admin', currentAdmin, `Edited user ${u.first} ${u.last}`, editingEmail);
  showToastA('✅ User updated successfully');
}

function quickSuspendFromModal() {
  if (!editingEmail) return;
  quickSuspend(editingEmail);
  closeM('editUserModal');
}

function quickSuspend(email) {
  const a = getAccounts();
  const u = a[email];
  if (!u) return;
  const wasSuspended = getUserStatus(u) === 'suspended';
  u.status = wasSuspended ? 'active' : 'suspended';
  // Also set boolean flags for v35 user app ban check
  u.suspended = !wasSuspended;
  if (wasSuspended) { delete u.suspendReason; delete u.suspendedAt; }
  else { u.suspendedAt = new Date().toISOString(); u.suspendReason = u.suspendReason || 'Suspended by admin'; }
  // Invalidate user session if suspending
  if (!wasSuspended) {
    try { const s = JSON.parse(localStorage.getItem('afrib_session')||'null'); if (s && s.email === email) localStorage.removeItem('afrib_session'); } catch {}
  }
  a[email] = u;
  if (!saveAccounts(a)) return;
  filterUsers();
  appendLog('admin', currentAdmin, `${wasSuspended ? 'Unsuspended' : 'Suspended'} user`, email);
  showToastA(`User ${u.status === 'active' ? 'reactivated ✅' : 'suspended ⛔'}`);
}

function exportUsersCSV() {
  const users = getUsers();
  const rows  = [['Name','Email','Username','Country','Profession','Balance (KES)','Coins','DOB','Joined','Last Login','Status']];
  users.forEach(u => rows.push([
    `${u.first||''} ${u.last||''}`, u.email, u.username||'',
    u.country||'', u.profession||'', u.walletBalance||0,
    getUserCoins(u.email), u.dob||'', u.createdAt||'', u.lastLogin||'', getUserStatus(u)
  ]));
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = 'afribconnect_users_' + new Date().toISOString().slice(0,10) + '.csv';
  a.click();
  showToastA('✅ CSV exported — ' + (rows.length-1) + ' users');
  appendLog('admin', currentAdmin, 'Exported users CSV', (rows.length-1) + ' records');
}

/* ══════════════════════════════
   WALLETS — real data
══════════════════════════════ */
function initWallets() {
  const users      = getUsers();
  const totalBal   = users.reduce((s,u) => s + (u.walletBalance||0), 0);
  const totalCoins = users.reduce((s,u) => s + getUserCoins(u.email), 0);
  const withPay    = users.filter(u => (u.linkedPayments||[]).length > 0).length;
  const topBal     = [...users].sort((a,b)=>(b.walletBalance||0)-(a.walletBalance||0))[0];
  const pmTypes = {};
  users.forEach(u => (u.linkedPayments||[]).forEach(pm => { pmTypes[pm.type]=(pmTypes[pm.type]||0)+1; }));
  const topPm = Object.entries(pmTypes).sort((a,b)=>b[1]-a[1])[0];

  document.getElementById('wStats').innerHTML = [
    { icon:'💰', val: '$'+(totalBal||0).toFixed(2),       label:'Total Wallet Balances (USD)' },
    { icon:'🪙', val: totalCoins.toLocaleString(),         label:'Total Game Coins' },
    { icon:'💳', val: withPay + ' users',                  label:'Have Payment Methods' },
    { icon:'🏆', val: topBal ? ('$'+(topBal.walletBalance||0).toFixed(2)) : '$0.00', label:'Highest Balance' },
    { icon:'👤', val: topBal ? (topBal.first||'—').trim() : '—', label:'Top Wallet Holder' },
    { icon:'📱', val: topPm ? topPm[0] + ' ('+topPm[1]+')' : 'None', label:'Most Linked Method' },
  ].map(s => `<div class="stat-card"><div class="stat-icon">${s.icon}</div><div class="stat-val">${s.val}</div><div class="stat-label">${s.label}</div></div>`).join('');

  filterWallets();
}

function filterWallets() {
  const q    = (document.getElementById('wSearch')?.value || '').toLowerCase().trim();
  const sort = document.getElementById('wSort')?.value || 'balance';
  let list   = getUsers();

  if (q) list = list.filter(u => `${u.first||''} ${u.last||''} ${u.email||''}`.toLowerCase().includes(q));

  if (sort === 'balance') list.sort((a,b) => (b.walletBalance||0) - (a.walletBalance||0));
  else if (sort === 'coins') list.sort((a,b) => getUserCoins(b.email) - getUserCoins(a.email));
  else list.sort((a,b) => `${a.first} ${a.last}`.localeCompare(`${b.first} ${b.last}`));

  document.getElementById('walletBody').innerHTML = list.length
    ? list.map(u => {
        const coins  = getUserCoins(u.email);
        const pms    = u.linkedPayments || [];
        const pmBadges = pms.slice(0,3).map(pm => {
          const icons = {paypal:'💙',mpesa:'📱',mtn:'📶',airtel:'📡',bank:'🏦',card:'💳',orange:'🟠',africell:'📲',paystack:'💚',flutterwave:'🦋',wave:'🌊',zeepay:'💚',ecocash:'🟢'};
          return `<span class="badge b" style="margin-right:3px;margin-top:2px">${icons[pm.type]||'💳'} ${pm.type}</span>`;
        }).join('');
        const usdEquiv = ''; // balance is already in USD
        return `<tr>
          <td><strong>${u.first||''} ${u.last||''}</strong><br><small style="color:var(--w60)">@${u.username||'—'}</small></td>
          <td style="font-size:12px;color:var(--w60)">${u.email}</td>
          <td>
            <div style="font-weight:700;color:${(u.walletBalance||0)>0?'var(--green)':'var(--w60)'}">$${(u.walletBalance||0).toFixed(2)}</div>
          </td>
          <td style="color:var(--gold)">🪙 ${coins.toLocaleString()}</td>
          <td>${pms.length > 0 ? pmBadges + (pms.length > 3 ? `<span style="font-size:10px;color:var(--w30)">+${pms.length-3} more</span>` : '') : '<span class="badge r">None linked</span>'}</td>
          <td><div class="btn-row">
            <button class="btn btn-b" onclick="openAdjustBal('${u.email}')">💰 Adjust</button>
            <button class="btn btn-ghost" onclick="viewUserWalletDetail('${u.email}')">📋 Detail</button>
          </div></td>
        </tr>`;
      }).join('')
    : '<tr><td colspan="6" style="text-align:center;color:var(--w60);padding:20px">No wallet data found</td></tr>';
}

function viewUserWalletDetail(email) {
  try {
    const u   = getUser(email);
    if (!u) { showToastA('User not found'); return; }
    const pms = u.linkedPayments || [];
    const txs = tryParse('afrib_txs_' + email, []);
    const totalSent = txs.filter(t=>t.type==='out').reduce((s,t)=>s+(t.amount||0),0);
    const totalRec  = txs.filter(t=>t.type==='in').reduce((s,t)=>s+(t.amount||0),0);
    const esc = v => String(v||'').replace(/</g,'&lt;').replace(/>/g,'&gt;');

    let modal = document.getElementById('walletDetailModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'walletDetailModal';
      modal.className = 'modal-overlay';
      modal.onclick = e => { if (e.target===modal) modal.classList.remove('open'); };
      document.body.appendChild(modal);
    }
    modal.innerHTML = `
      <div class="modal" style="max-width:500px">
        <button class="modal-close" onclick="document.getElementById('walletDetailModal').classList.remove('open')">✕</button>
        <h3>💰 Wallet — ${esc(u.first)} ${esc(u.last)}</h3>
        <p class="msub">${esc(email)}</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
          <div style="background:rgba(212,175,55,.08);border:1px solid rgba(212,175,55,.2);border-radius:10px;padding:14px;text-align:center">
            <div style="font-size:22px;font-weight:700;color:var(--gold)">$${(u.walletBalance||0).toFixed(2)}</div>
            <div style="font-size:11px;color:var(--w60)">Balance (USD)</div>
          </div>
          <div style="background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:10px;padding:14px;text-align:center">
            <div style="font-size:22px;font-weight:700">🪙 ${getUserCoins(email).toLocaleString()}</div>
            <div style="font-size:11px;color:var(--w60)">Platform Coins</div>
          </div>
          <div style="background:rgba(239,68,68,.07);border:1px solid rgba(239,68,68,.15);border-radius:10px;padding:14px;text-align:center">
            <div style="font-size:18px;font-weight:700;color:#f87171">-$${totalSent.toFixed(2)}</div>
            <div style="font-size:11px;color:var(--w60)">Total Sent</div>
          </div>
          <div style="background:rgba(34,197,94,.07);border:1px solid rgba(34,197,94,.15);border-radius:10px;padding:14px;text-align:center">
            <div style="font-size:18px;font-weight:700;color:#22c55e">+$${totalRec.toFixed(2)}</div>
            <div style="font-size:11px;color:var(--w60)">Total Received</div>
          </div>
        </div>
        <div class="sec-label">Payment Methods</div>
        <div style="margin-bottom:14px">${pms.length ? pms.map(pm=>`<span class="perm-tag on">${esc(pm.type||'?')}: ${esc(pm.maskedDetail||'linked')}</span>`).join('') : '<span style="color:var(--w30);font-size:12px">None linked</span>'}</div>
        <div class="sec-label">Recent Transactions</div>
        <div style="display:flex;flex-direction:column;gap:5px;max-height:180px;overflow-y:auto">
          ${txs.slice(0,8).map(t=>`<div style="display:flex;justify-content:space-between;padding:6px 10px;background:rgba(255,255,255,.04);border-radius:7px;font-size:12px">
            <span>${t.type==='out'?'📤 Sent':'📥 Received'} <span style="color:var(--w60)">via ${esc(t.method||'wallet')}${t.note?' — '+esc(t.note):''}</span></span>
            <span style="font-weight:700;color:${t.type==='out'?'#f87171':'#22c55e'}">${t.type==='out'?'-':'+'}$${(t.amount||0).toFixed(2)}</span>
          </div>`).join('') || '<div style="color:var(--w30);font-size:12px;padding:6px">No transactions yet</div>'}
        </div>
        <div class="modal-btns">
          <button class="btn btn-gold" onclick="openAdjustBal('${esc(email)}');document.getElementById('walletDetailModal').classList.remove('open')">💰 Adjust Balance</button>
          <button class="btn btn-ghost" onclick="document.getElementById('walletDetailModal').classList.remove('open')">Close</button>
        </div>
      </div>`;
    modal.classList.add('open');
  } catch(e) { console.error('viewUserWalletDetail:', e); showToastA('⚠️ ' + e.message); }
}

function openAdjustBal(email) {
  const u = getUser(email);
  if (!u) return;
  adjustBalEmail = email;
  document.getElementById('adjBalFor').textContent = `${u.first} ${u.last} (${u.email}) — Current: $${(u.walletBalance||0).toFixed(2)}`;
  document.getElementById('adjNewBal').value = u.walletBalance || 0;
  document.getElementById('adjReason').value = '';
  document.getElementById('adjReasonErr').style.display = 'none';
  showM('adjustBalModal');
}

function doAdjustBalance() {
  if (!adjustBalEmail) return;
  const newBal  = parseFloat(document.getElementById('adjNewBal').value) || 0;
  const reason  = document.getElementById('adjReason').value.trim();
  if (!reason) { document.getElementById('adjReasonErr').style.display='block'; return; }
  document.getElementById('adjReasonErr').style.display = 'none';

  const a = getAccounts();
  const u = a[adjustBalEmail];
  if (!u) { showToastA('❌ User not found'); closeM('adjustBalModal'); return; }
  const oldBal = u.walletBalance || 0;
  u.walletBalance = Math.max(0, newBal);
  a[adjustBalEmail] = u;
  if (!saveAccounts(a)) return;

  closeM('adjustBalModal');
  filterWallets();
  appendLog('admin', currentAdmin, `Adjusted wallet balance: $${oldBal.toFixed(2)} → $${newBal.toFixed(2)} USD`, `${adjustBalEmail}: ${reason}`);
  showToastA(`✅ Balance updated to $${newBal.toFixed(2)} USD`);
}

/* ══════════════════════════════
   GAMES — real data from localStorage
══════════════════════════════ */
/* ══════════════════════════════════════════════════
   GAME CONTROL CENTER — full admin management
   Tabs: Economy | Seeds | Truth or Dare | Leaderboard
══════════════════════════════════════════════════ */

const ADMIN_SEEDS_KEY  = 'afrib_admin_seeds';
const ADMIN_TOD_KEY    = 'afrib_admin_tod';
const DICE_PRICES_KEY  = 'afrib_dice_prices';

function getAdminSeeds() {
  try { return JSON.parse(localStorage.getItem(ADMIN_SEEDS_KEY) || '[]'); } catch(e) { return []; }
}
function saveAdminSeeds(arr) {
  localStorage.setItem(ADMIN_SEEDS_KEY, JSON.stringify(arr));
}
function getAdminTod() {
  try { return JSON.parse(localStorage.getItem(ADMIN_TOD_KEY) || '{}'); } catch(e) { return {}; }
}
function saveAdminTod(obj) {
  localStorage.setItem(ADMIN_TOD_KEY, JSON.stringify(obj));
}
function getDicePrices() {
  try { return JSON.parse(localStorage.getItem(DICE_PRICES_KEY) || '{}'); } catch(e) { return {}; }
}

/* ── Tab switcher ── */
function switchGameTab(btn, tab) {
  document.querySelectorAll('[id^="gtab-"]').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('[id^="gpanel-"]').forEach(p => p.style.display='none');
  if (btn) btn.classList.add('active');
  const panel = document.getElementById('gpanel-'+tab);
  if (panel) panel.style.display = 'block';

  if (tab==='seeds')   renderAdminSeeds();
  if (tab==='tod')     renderTodCounts();
  if (tab==='leaders') renderLeaderboard();
  if (tab==='economy') loadEconomySettings();
}

/* ── ECONOMY ── */
function loadEconomySettings() {
  const s = getGameSettings();
  const d = getDicePrices();
  const setV = (id, val) => { const el=document.getElementById(id); if(el) el.value=val; };
  setV('gsCoinRate',  s.coinRate||100);
  setV('gsMaxWager',  s.maxWager||500);
  setV('gsDailyMax',  s.dailyMax||150);
  setV('gsXpRate',    s.xpRate||100);
  setV('gsDiceCommon',  d.common||100);
  setV('gsDiceRare',    d.rare||175);
  setV('gsDiceEpic',    d.epic||220);
  setV('gsDiceLegend',  d.legendary||500);
  setV('gsDiceLucky',   d.lucky||100);
}

function initGames() {
  const users    = getUsers();
  const gameData = users.map(u => ({
    u,
    prog:  tryParse('afrib_ludo_' + u.email, {}),
    coins: getUserCoins(u.email),
    snake: tryParse('afrib_snake_seeds_' + u.email, [])
  }));
  const totalGames    = gameData.reduce((s,d) => s+(d.prog.stats?.gamesPlayed||0), 0);
  const totalWins     = gameData.reduce((s,d) => s+(d.prog.stats?.wins||0), 0);
  const totalCaptures = gameData.reduce((s,d) => s+(d.prog.stats?.totalCaptures||0), 0);
  const totalCoins    = gameData.reduce((s,d) => s+d.coins, 0);
  const totalSeeds    = gameData.reduce((s,d) => s+(d.snake?.length||0), 0);

  document.getElementById('gStats').innerHTML = [
    { icon:'🎲', val: totalGames,                 label:'Ludo Games Played' },
    { icon:'🏆', val: totalWins,                  label:'Total Wins' },
    { icon:'💥', val: totalCaptures,              label:'Total Captures' },
    { icon:'🪙', val: totalCoins.toLocaleString(),label:'Coins in Circulation' },
    { icon:'🌱', val: totalSeeds,                 label:'Seeds Purchased' },
    { icon:'👥', val: gameData.filter(d=>(d.prog.stats?.gamesPlayed||0)>0).length, label:'Active Players' },
  ].map(s=>`<div class="stat-card"><div class="stat-icon">${s.icon}</div><div class="stat-val">${s.val}</div><div class="stat-label">${s.label}</div></div>`).join('');

  loadEconomySettings();
  switchGameTab(document.getElementById('gtab-economy'), 'economy');
}

function saveGameSettings() {
  const rate  = parseInt(document.getElementById('gsCoinRate')?.value)||100;
  const wager = parseInt(document.getElementById('gsMaxWager')?.value)||500;
  const daily = parseInt(document.getElementById('gsDailyMax')?.value)||150;
  const xpRate= parseInt(document.getElementById('gsXpRate')?.value)||100;
  if (rate<10||rate>100000) { showToastA('⚠️ Coin rate 10–100,000'); return; }
  if (wager<10||wager>500000){ showToastA('⚠️ Max wager 10–500,000'); return; }
  if (daily<10||daily>10000) { showToastA('⚠️ Daily max 10–10,000'); return; }
  localStorage.setItem(ADM_SETTINGS, JSON.stringify({ coinRate:rate, maxWager:wager, dailyMax:daily, xpRate }));
  appendLog('admin', currentAdmin, 'Updated game settings', `coinRate:${rate} maxWager:${wager} daily:${daily} xp:${xpRate}`);
  showToastA('✅ Economy settings saved');
}

function saveDicePrices() {
  const prices = {
    common:    parseInt(document.getElementById('gsDiceCommon')?.value)||100,
    rare:      parseInt(document.getElementById('gsDiceRare')?.value)||175,
    epic:      parseInt(document.getElementById('gsDiceEpic')?.value)||220,
    legendary: parseInt(document.getElementById('gsDiceLegend')?.value)||500,
    lucky:     parseInt(document.getElementById('gsDiceLucky')?.value)||100,
  };
  localStorage.setItem(DICE_PRICES_KEY, JSON.stringify(prices));
  appendLog('admin', currentAdmin, 'Updated dice shop prices', JSON.stringify(prices));
  showToastA('✅ Dice prices saved — shop updated live');
}

/* ── SEEDS PANEL ── */
function renderAdminSeeds() {
  const tbody = document.getElementById('seedsBody');
  if (!tbody) return;

  // Load built-in seeds + admin-created seeds
  const BASE_SEEDS = [
    { id:'seed_none',  name:'Random',     seed:null,  rarity:'free',      coinPrice:0,   usdPrice:0,   trait:'Fully random', status:'active', sales:0 },
    { id:'seed_42',    name:'Seed #42',   seed:42,    rarity:'common',    coinPrice:50,  usdPrice:0,   trait:'Balanced rolls', status:'active', sales:0 },
    { id:'seed_777',   name:'Lucky 777',  seed:777,   rarity:'rare',      coinPrice:100, usdPrice:0,   trait:'More ladders', status:'active', sales:0 },
    { id:'seed_007',   name:'Secret 007', seed:7,     rarity:'common',    coinPrice:80,  usdPrice:0,   trait:'Fewer snakes', status:'active', sales:0 },
    { id:'seed_100',   name:'Speed 100',  seed:100,   rarity:'rare',      coinPrice:120, usdPrice:0,   trait:'High rolls', status:'active', sales:0 },
    { id:'seed_africa',name:'Africa',     seed:1960,  rarity:'epic',      coinPrice:150, usdPrice:0,   trait:'Ladder-seeking', status:'active', sales:0 },
    { id:'seed_ankh',  name:'Ankh',       seed:1352,  rarity:'epic',      coinPrice:200, usdPrice:0,   trait:'Mystical wins', status:'active', sales:0 },
    { id:'seed_kente', name:'Kente',      seed:2024,  rarity:'epic',      coinPrice:200, usdPrice:0,   trait:'Steady rolls', status:'active', sales:0 },
    { id:'seed_zulu',  name:'Zulu',       seed:1879,  rarity:'epic',      coinPrice:250, usdPrice:0,   trait:'Aggressive', status:'active', sales:0 },
    { id:'seed_legend',name:'Legend',     seed:9999,  rarity:'legendary', coinPrice:500, usdPrice:0,   trait:'Top 1%', status:'active', sales:0 },
    { id:'seed_vip',   name:'VIP Diamond',seed:31415, rarity:'premium',   coinPrice:0,   usdPrice:1.99,trait:'Diamond luck', status:'active', sales:0 },
    { id:'seed_royal', name:'Royal',      seed:99999, rarity:'premium',   coinPrice:0,   usdPrice:4.99,trait:'Optimal path', status:'active', sales:0 },
  ];
  const adminSeeds = getAdminSeeds();
  const allSeeds   = [...BASE_SEEDS, ...adminSeeds];

  const RARITY_COLORS = { free:'#6b7280',common:'#22c55e',rare:'#3b82f6',epic:'#a855f7',legendary:'#f59e0b',premium:'#ef4444' };

  tbody.innerHTML = allSeeds.map((s, idx) => {
    const rc = RARITY_COLORS[s.rarity]||'#6b7280';
    const isAdmin = adminSeeds.some(a=>a.id===s.id);
    return `<tr>
      <td><code style="background:var(--bg3);padding:2px 6px;border-radius:4px;font-size:11px">${s.seed ?? 'random'}</code></td>
      <td><strong>${s.name}</strong>${isAdmin?' <span style="font-size:9px;background:rgba(212,175,55,.2);color:var(--gold);border-radius:3px;padding:1px 4px">CUSTOM</span>':''}</td>
      <td><span style="color:${rc};font-weight:700;font-size:11px;text-transform:uppercase">${s.rarity}</span></td>
      <td style="font-size:11px;color:var(--w60)">${s.trait||'—'}</td>
      <td>
        <div style="display:flex;align-items:center;gap:4px">
          <input type="number" value="${s.coinPrice||0}" min="0" id="sc_${s.id}"
            style="width:70px;background:var(--bg);border:1px solid var(--border);border-radius:5px;padding:3px 6px;color:var(--white);font-size:12px;outline:none"
            onfocus="this.style.borderColor='var(--gold)'" onblur="this.style.borderColor='var(--border)'"/>
          <button onclick="updateSeedPrice('${s.id}','coin')" style="background:var(--gold);border:none;border-radius:5px;padding:3px 7px;color:#000;font-size:10px;font-weight:800;cursor:pointer">✓</button>
        </div>
      </td>
      <td>
        <div style="display:flex;align-items:center;gap:4px">
          <input type="number" value="${s.usdPrice||0}" min="0" step="0.01" id="su_${s.id}"
            style="width:65px;background:var(--bg);border:1px solid var(--border);border-radius:5px;padding:3px 6px;color:var(--white);font-size:12px;outline:none"
            onfocus="this.style.borderColor='var(--gold)'" onblur="this.style.borderColor='var(--border)'"/>
          <button onclick="updateSeedPrice('${s.id}','usd')" style="background:#ef4444;border:none;border-radius:5px;padding:3px 7px;color:#fff;font-size:10px;font-weight:800;cursor:pointer">✓</button>
        </div>
      </td>
      <td>
        <button onclick="toggleSeedStatus('${s.id}')" style="background:${s.status==='active'?'rgba(34,197,94,.15)':'rgba(239,68,68,.15)'};border:1px solid ${s.status==='active'?'rgba(34,197,94,.3)':'rgba(239,68,68,.3)'};border-radius:5px;padding:3px 9px;color:${s.status==='active'?'#22c55e':'#ef4444'};font-size:11px;font-weight:700;cursor:pointer">
          ${s.status==='active'?'✅ Active':'🙈 Hidden'}
        </button>
      </td>
      <td style="color:var(--gold);font-weight:700">${s.sales||0}</td>
      <td>
        <div style="display:flex;gap:4px">
          ${isAdmin ? `<button onclick="openEditSeed('${s.id}')" style="background:var(--bg3);border:1px solid var(--border);border-radius:5px;padding:3px 8px;color:var(--white);font-size:11px;cursor:pointer">✏️</button>
          <button onclick="deleteAdminSeed('${s.id}')" style="background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.3);border-radius:5px;padding:3px 8px;color:#ef4444;font-size:11px;cursor:pointer">🗑</button>` :
          `<button onclick="openEditSeed('${s.id}')" style="background:var(--bg3);border:1px solid var(--border);border-radius:5px;padding:3px 8px;color:var(--white);font-size:11px;cursor:pointer">✏️ Edit</button>`}
        </div>
      </td>
    </tr>`;
  }).join('');
}

function updateSeedPrice(seedId, type) {
  const val = type==='coin'
    ? parseInt(document.getElementById('sc_'+seedId)?.value||0)
    : parseFloat(document.getElementById('su_'+seedId)?.value||0);

  const adminSeeds = getAdminSeeds();
  const BASE_IDS   = ['seed_none','seed_42','seed_777','seed_007','seed_100','seed_africa','seed_ankh','seed_kente','seed_zulu','seed_legend','seed_vip','seed_royal'];

  if (BASE_IDS.includes(seedId)) {
    // Store price overrides for built-in seeds
    const overrides = tryParse('afrib_seed_price_overrides','{}');
    if (!overrides[seedId]) overrides[seedId] = {};
    if (type==='coin') overrides[seedId].coinPrice = val;
    else               overrides[seedId].usdPrice  = val;
    localStorage.setItem('afrib_seed_price_overrides', JSON.stringify(overrides));
  } else {
    const idx = adminSeeds.findIndex(s=>s.id===seedId);
    if (idx>=0) {
      if (type==='coin') adminSeeds[idx].coinPrice = val;
      else               adminSeeds[idx].usdPrice  = val;
      saveAdminSeeds(adminSeeds);
    }
  }
  appendLog('admin', currentAdmin, `Updated ${type} price for seed ${seedId}`, `${type}=${val}`);
  showToastA(`✅ ${type==='coin'?'Coin':'USD'} price updated for ${seedId}`);
  renderAdminSeeds();
}

function toggleSeedStatus(seedId) {
  const adminSeeds = getAdminSeeds();
  const idx = adminSeeds.findIndex(s=>s.id===seedId);
  if (idx>=0) {
    adminSeeds[idx].status = adminSeeds[idx].status==='active' ? 'hidden' : 'active';
    saveAdminSeeds(adminSeeds);
    appendLog('admin', currentAdmin, `Toggled seed ${seedId}`, `status:${adminSeeds[idx].status}`);
    renderAdminSeeds();
  } else {
    // Store status override for built-in seeds
    const overrides = tryParse('afrib_seed_status_overrides','{}');
    overrides[seedId] = overrides[seedId]==='active' ? 'hidden' : 'active';
    localStorage.setItem('afrib_seed_status_overrides', JSON.stringify(overrides));
    appendLog('admin', currentAdmin, `Toggled built-in seed ${seedId}`, `status:${overrides[seedId]}`);
    renderAdminSeeds();
  }
}

function openCreateSeed() {
  document.getElementById('seedModalTitle').textContent = '🌱 Create New Seed';
  document.getElementById('seedEditId').value = '';
  ['seedName','seedValue','seedTrait','seedDesc'].forEach(id => { const e=document.getElementById(id); if(e) e.value=''; });
  document.getElementById('seedEmoji').value  = '🌱';
  document.getElementById('seedRarity').value = 'common';
  document.getElementById('seedStatus').value = 'active';
  document.getElementById('seedBias').value   = '0';
  document.getElementById('seedCoinPrice').value = '100';
  document.getElementById('seedUsdPrice').value  = '0';
  document.getElementById('seedModal').style.display = 'flex';
}

function openEditSeed(seedId) {
  const adminSeeds = getAdminSeeds();
  const s = adminSeeds.find(x=>x.id===seedId);
  if (!s) { showToastA('Built-in seed — use price fields to edit pricing'); return; }

  document.getElementById('seedModalTitle').textContent = '✏️ Edit Seed';
  document.getElementById('seedEditId').value   = seedId;
  document.getElementById('seedName').value     = s.name||'';
  document.getElementById('seedValue').value    = s.seed||'';
  document.getElementById('seedEmoji').value    = s.emoji||'🌱';
  document.getElementById('seedRarity').value   = s.rarity||'common';
  document.getElementById('seedCoinPrice').value= s.coinPrice||0;
  document.getElementById('seedUsdPrice').value = s.usdPrice||0;
  document.getElementById('seedTrait').value    = s.trait||'';
  document.getElementById('seedDesc').value     = s.desc||'';
  document.getElementById('seedStatus').value   = s.status||'active';
  document.getElementById('seedBias').value     = s.bias||'0';
  document.getElementById('seedModal').style.display = 'flex';
}

function saveSeed() {
  const name  = document.getElementById('seedName')?.value?.trim();
  const val   = parseInt(document.getElementById('seedValue')?.value||0);
  const emoji = document.getElementById('seedEmoji')?.value||'🌱';
  const rarity= document.getElementById('seedRarity')?.value||'common';
  const coinP = parseInt(document.getElementById('seedCoinPrice')?.value||0);
  const usdP  = parseFloat(document.getElementById('seedUsdPrice')?.value||0);
  const trait = document.getElementById('seedTrait')?.value?.trim();
  const desc  = document.getElementById('seedDesc')?.value?.trim();
  const status= document.getElementById('seedStatus')?.value||'active';
  const bias  = parseInt(document.getElementById('seedBias')?.value||0);
  const editId= document.getElementById('seedEditId')?.value;

  if (!name)  { showToastA('⚠️ Seed name is required'); return; }
  if (!val||val<1) { showToastA('⚠️ Enter a valid seed number (1+)'); return; }
  if (!trait) { showToastA('⚠️ Trait description is required'); return; }

  const adminSeeds = getAdminSeeds();

  if (editId) {
    const idx = adminSeeds.findIndex(s=>s.id===editId);
    if (idx>=0) {
      adminSeeds[idx] = { ...adminSeeds[idx], name, seed:val, emoji, rarity, coinPrice:coinP, usdPrice:usdP, trait, desc, status, bias };
      appendLog('admin', currentAdmin, 'Edited seed: '+editId, `name:${name} seed:${val}`);
    }
  } else {
    const newId = 'seed_admin_'+Date.now();
    adminSeeds.push({ id:newId, name, seed:val, emoji, rarity, coinPrice:coinP, usdPrice:usdP, trait, desc, status, bias, sales:0, createdAt:new Date().toISOString() });
    appendLog('admin', currentAdmin, 'Created new seed', `name:${name} seed:${val} rarity:${rarity}`);
  }

  saveAdminSeeds(adminSeeds);
  document.getElementById('seedModal').style.display = 'none';
  showToastA(`✅ Seed "${name}" ${editId?'updated':'created'}!`);
  renderAdminSeeds();
}

function deleteAdminSeed(seedId) {
  if (!confirm(`Delete seed "${seedId}"? This cannot be undone.`)) return;
  const adminSeeds = getAdminSeeds().filter(s=>s.id!==seedId);
  saveAdminSeeds(adminSeeds);
  appendLog('admin', currentAdmin, 'Deleted seed: '+seedId, '');
  showToastA('🗑 Seed deleted');
  renderAdminSeeds();
}

/* ── TRUTH OR DARE PANEL ── */
const TOD_BASE = {
  family:  { truth:12, dare:10 },
  friends: { truth:14, dare:12 },
  couples: { truth:20, dare:18 },
};

let _todViewMode = 'family';

function renderTodCounts() {
  const extra = getAdminTod();
  const fam = TOD_BASE.family.truth  + TOD_BASE.family.dare  + (extra.family?.truth?.length||0)  + (extra.family?.dare?.length||0);
  const fri = TOD_BASE.friends.truth + TOD_BASE.friends.dare + (extra.friends?.truth?.length||0) + (extra.friends?.dare?.length||0);
  const cou = TOD_BASE.couples.truth + TOD_BASE.couples.dare + (extra.couples?.truth?.length||0) + (extra.couples?.dare?.length||0);
  const setEl = (id,v) => { const e=document.getElementById(id); if(e) e.textContent=v; };
  setEl('todFamilyCount',  fam);
  setEl('todFriendsCount2', fri);
  setEl('todCouplesCount',  cou);
  // New modes
  const extra2 = getAdminTod();
  const BUILTIN = { naija:{truth:18,dare:12}, diaspora:{truth:15,dare:8}, hot:{truth:12,dare:8}, africa:{truth:18,dare:12} };
  ['naija','diaspora','hot','africa'].forEach(m => {
    const b = BUILTIN[m] || {truth:0,dare:0};
    const e = extra2[m] || {truth:[],dare:[]};
    const cnt = b.truth + b.dare + (e.truth||[]).length + (e.dare||[]).length;
    const capM = m.charAt(0).toUpperCase() + m.slice(1);
    setEl(`tod${capM}Count`, cnt);
  });
  viewTodMode(_todViewMode);
}

function viewTodMode(mode) {
  _todViewMode = mode;
  const ALL_VIEW_BTNS = {
    family:'todViewFam', friends:'todViewFri', couples:'todViewCou',
    naija:'todViewNai', diaspora:'todViewDia', hot:'todViewHot', africa:'todViewAfr'
  };
  Object.values(ALL_VIEW_BTNS).forEach(id => {
    const b = document.getElementById(id);
    if (!b) return;
    b.classList.remove('active');
    b.style.background = 'var(--bg)';
    b.style.color = 'var(--w60)';
    b.style.borderColor = 'var(--border)';
  });
  const activeId = ALL_VIEW_BTNS[mode];
  const ab = document.getElementById(activeId);
  if (ab) {
    ab.classList.add('active');
    ab.style.background = 'var(--gold-dim)';
    ab.style.color = 'var(--gold)';
    ab.style.borderColor = 'rgba(212,175,55,.4)';
  }

  const extra = getAdminTod();
  const extraQ = extra[mode] || { truth:[], dare:[] };
  const tbody  = document.getElementById('todBody');
  if (!tbody) return;

  // Get built-in questions from parent window (if embedded) or localStorage
  let builtInTruths = [], builtInDares = [];
  try {
    const todQ = window.opener?.TOD_QUESTIONS || window.parent?.TOD_QUESTIONS;
    if (todQ && todQ[mode]) {
      builtInTruths = todQ[mode].truth || [];
      builtInDares  = todQ[mode].dare  || [];
    }
  } catch(e) {}

  // Fallback: approximate counts from known question sets
  const KNOWN = {
    family:{truth:12,dare:10}, friends:{truth:14,dare:12},
    couples:{truth:20,dare:18}, naija:{truth:18,dare:12},
    diaspora:{truth:15,dare:8}, hot:{truth:12,dare:8}, africa:{truth:18,dare:12}
  };
  const k = KNOWN[mode] || {truth:0,dare:0};
  const baseT = builtInTruths.length || k.truth;
  const baseD = builtInDares.length  || k.dare;

  let rows = '';
  let rowNum = 0;

  // Built-in truths — show actual text if available
  if (builtInTruths.length) {
    builtInTruths.forEach((q, i) => {
      rowNum++;
      rows += `<tr><td>${rowNum}</td>
        <td><span style="background:rgba(34,197,94,.15);color:#22c55e;border-radius:4px;padding:2px 7px;font-size:10px;font-weight:700">TRUTH</span></td>
        <td style="font-size:12px;color:rgba(255,255,255,.75)">${escH(q)}</td>
        <td><span style="font-size:9px;color:var(--w30)">Built-in</span></td>
        <td style="color:var(--w30);font-size:11px">—</td></tr>`;
    });
  } else {
    for (let i = 0; i < baseT; i++) {
      rowNum++;
      rows += `<tr><td>${rowNum}</td>
        <td><span style="background:rgba(34,197,94,.15);color:#22c55e;border-radius:4px;padding:2px 7px;font-size:10px;font-weight:700">TRUTH</span></td>
        <td style="font-size:11px;color:var(--w60);font-style:italic">Built-in truth #${i+1} (open app to see full text)</td>
        <td><span style="font-size:9px;color:var(--w30)">Built-in</span></td>
        <td>—</td></tr>`;
    }
  }

  // Built-in dares
  if (builtInDares.length) {
    builtInDares.forEach((q, i) => {
      rowNum++;
      rows += `<tr><td>${rowNum}</td>
        <td><span style="background:rgba(239,68,68,.15);color:#ef4444;border-radius:4px;padding:2px 7px;font-size:10px;font-weight:700">DARE</span></td>
        <td style="font-size:12px;color:rgba(255,255,255,.75)">${escH(q)}</td>
        <td><span style="font-size:9px;color:var(--w30)">Built-in</span></td>
        <td style="color:var(--w30);font-size:11px">—</td></tr>`;
    });
  } else {
    for (let i = 0; i < baseD; i++) {
      rowNum++;
      rows += `<tr><td>${rowNum}</td>
        <td><span style="background:rgba(239,68,68,.15);color:#ef4444;border-radius:4px;padding:2px 7px;font-size:10px;font-weight:700">DARE</span></td>
        <td style="font-size:11px;color:var(--w60);font-style:italic">Built-in dare #${i+1} (open app to see full text)</td>
        <td><span style="font-size:9px;color:var(--w30)">Built-in</span></td>
        <td>—</td></tr>`;
    }
  }

  // Admin-added truths
  (extraQ.truth||[]).forEach((q, i) => {
    rowNum++;
    rows += `<tr style="background:rgba(212,175,55,.04)"><td>${rowNum}</td>
      <td><span style="background:rgba(34,197,94,.15);color:#22c55e;border-radius:4px;padding:2px 7px;font-size:10px;font-weight:700">TRUTH</span></td>
      <td style="font-size:12px" id="tod-q-truth-${i}">${escH(q)}</td>
      <td><span style="font-size:9px;background:rgba(212,175,55,.15);color:var(--gold);border-radius:3px;padding:1px 6px;font-weight:700">✏️ Admin</span></td>
      <td style="display:flex;gap:4px;align-items:center">
        <button onclick="editTodQuestion('${mode}','truth',${i})" style="background:rgba(59,130,246,.15);border:1px solid rgba(59,130,246,.3);border-radius:5px;padding:2px 7px;color:#60a5fa;font-size:11px;cursor:pointer">✏️</button>
        <button onclick="deleteTodQuestion('${mode}','truth',${i})" style="background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.3);border-radius:5px;padding:2px 7px;color:#ef4444;font-size:11px;cursor:pointer">🗑</button>
      </td></tr>`;
  });

  // Admin-added dares
  (extraQ.dare||[]).forEach((q, i) => {
    rowNum++;
    rows += `<tr style="background:rgba(212,175,55,.04)"><td>${rowNum}</td>
      <td><span style="background:rgba(239,68,68,.15);color:#ef4444;border-radius:4px;padding:2px 7px;font-size:10px;font-weight:700">DARE</span></td>
      <td style="font-size:12px" id="tod-q-dare-${i}">${escH(q)}</td>
      <td><span style="font-size:9px;background:rgba(212,175,55,.15);color:var(--gold);border-radius:3px;padding:1px 6px;font-weight:700">✏️ Admin</span></td>
      <td style="display:flex;gap:4px;align-items:center">
        <button onclick="editTodQuestion('${mode}','dare',${i})" style="background:rgba(59,130,246,.15);border:1px solid rgba(59,130,246,.3);border-radius:5px;padding:2px 7px;color:#60a5fa;font-size:11px;cursor:pointer">✏️</button>
        <button onclick="deleteTodQuestion('${mode}','dare',${i})" style="background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.3);border-radius:5px;padding:2px 7px;color:#ef4444;font-size:11px;cursor:pointer">🗑</button>
      </td></tr>`;
  });

  if (!rows) {
    rows = `<tr><td colspan="5" style="text-align:center;color:var(--w60);padding:20px">
      <div style="font-size:32px;margin-bottom:8px">🎯</div>
      No questions added for ${mode} mode yet.<br>
      <span style="font-size:11px">Use the form above to add your first question!</span>
    </td></tr>`;
  }
  tbody.innerHTML = rows;
}

/* ── Edit in-place ── */
function editTodQuestion(mode, type, idx) {
  const cell = document.getElementById(`tod-q-${type}-${idx}`);
  if (!cell) return;
  const orig = cell.textContent;
  cell.innerHTML = `<textarea style="width:100%;background:var(--bg);border:1px solid var(--gold);border-radius:6px;padding:6px;color:#fff;font-size:12px;resize:vertical" rows="2">${escH(orig)}</textarea>
    <div style="display:flex;gap:6px;margin-top:4px">
      <button onclick="saveTodEdit('${mode}','${type}',${idx},this)" style="background:rgba(34,197,94,.2);border:1px solid rgba(34,197,94,.4);border-radius:5px;padding:3px 10px;color:#22c55e;font-size:11px;cursor:pointer">✅ Save</button>
      <button onclick="viewTodMode('${mode}')" style="background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);border-radius:5px;padding:3px 10px;color:#ef4444;font-size:11px;cursor:pointer">✕ Cancel</button>
    </div>`;
}

function saveTodEdit(mode, type, idx, btn) {
  const cell = btn.closest('td');
  if (!cell) return;
  const ta = cell.querySelector('textarea');
  if (!ta) return;
  const newText = ta.value.trim();
  if (!newText || newText.length < 10) { showToastA('⚠️ Too short'); return; }
  const extra = getAdminTod();
  if (!extra[mode]) extra[mode] = {};
  if (!extra[mode][type]) extra[mode][type] = [];
  extra[mode][type][idx] = newText;
  saveAdminTod(extra);
  appendLog('admin', currentAdmin, `Edited ${mode}/${type} question #${idx}`, newText.substring(0,60));
  showToastA('✅ Question updated');
  renderTodCounts();
  viewTodMode(mode);
}

/* ── Bulk import ── */
function todBulkImport() {
  const mode = _todViewMode || 'family';
  const modal = document.createElement('div');
  modal.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.9);display:flex;align-items:center;justify-content:center;padding:20px';
  modal.innerHTML = `<div style="background:var(--bg3);border:1px solid var(--border-gold);border-radius:20px;padding:24px;max-width:600px;width:100%;max-height:85vh;overflow-y:auto">
    <h3 style="font-size:16px;font-weight:800;color:var(--gold);margin:0 0 6px">📥 Bulk Import Questions</h3>
    <div style="font-size:12px;color:var(--w60);margin-bottom:14px">
      Mode: <strong style="color:var(--gold)">${mode}</strong> — Paste one question per line. 
      Prefix with <code style="background:rgba(34,197,94,.1);padding:1px 4px;border-radius:3px">T:</code> for truth or 
      <code style="background:rgba(239,68,68,.1);padding:1px 4px;border-radius:3px">D:</code> for dare.<br>
      Example: <em>T: What's the most embarrassing thing you've done?</em>
    </div>
    <textarea id="bulkImportText" rows="12" style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:12px;color:#fff;font-size:12px;outline:none;resize:vertical;line-height:1.6"
      placeholder="T: What is your biggest secret?&#10;D: Do 10 push-ups right now&#10;T: Have you ever lied to get out of trouble?&#10;D: Call someone in the room and tell them a compliment"></textarea>
    <div id="bulkImportPreview" style="font-size:11px;color:var(--w60);margin:8px 0"></div>
    <div style="display:flex;gap:8px;margin-top:12px">
      <button onclick="executeBulkImport('${mode}',this.closest('[style*=fixed]'))" 
        style="flex:1;background:linear-gradient(135deg,var(--gold),#b8860b);border:none;border-radius:10px;padding:12px;color:#000;font-size:13px;font-weight:800;cursor:pointer">
        📥 Import Questions
      </button>
      <button onclick="this.closest('[style*=fixed]').remove()"
        style="background:rgba(255,255,255,.08);border:1px solid var(--border);border-radius:10px;padding:12px 18px;color:var(--w60);font-size:13px;cursor:pointer">
        Cancel
      </button>
    </div>
  </div>`;
  document.body.appendChild(modal);

  // Live preview counter
  const ta = modal.querySelector('#bulkImportText');
  const preview = modal.querySelector('#bulkImportPreview');
  ta.addEventListener('input', () => {
    const lines = ta.value.split('
').filter(l => l.trim().match(/^[TtDd]:/));
    const t = lines.filter(l => l.trim().match(/^[Tt]:/)).length;
    const d = lines.filter(l => l.trim().match(/^[Dd]:/)).length;
    preview.textContent = `Preview: ${t} truth${t !== 1 ? 's' : ''} + ${d} dare${d !== 1 ? 's' : ''} ready to import`;
    preview.style.color = (t + d) > 0 ? '#22c55e' : 'var(--w60)';
  });
}

function executeBulkImport(mode, modal) {
  const ta = document.getElementById('bulkImportText');
  if (!ta) return;
  const lines = ta.value.split('
').map(l => l.trim()).filter(Boolean);
  const truths = [], dares = [];

  lines.forEach(line => {
    const lower = line.toLowerCase();
    if (lower.startsWith('t:')) {
      const q = line.slice(2).trim();
      if (q.length >= 10) truths.push(q);
    } else if (lower.startsWith('d:')) {
      const q = line.slice(2).trim();
      if (q.length >= 10) dares.push(q);
    }
  });

  if (!truths.length && !dares.length) {
    showToastA('⚠️ No valid questions found. Use T: and D: prefixes.');
    return;
  }

  const extra = getAdminTod();
  if (!extra[mode]) extra[mode] = {};
  if (!extra[mode].truth) extra[mode].truth = [];
  if (!extra[mode].dare)  extra[mode].dare  = [];
  extra[mode].truth.push(...truths);
  extra[mode].dare.push(...dares);
  saveAdminTod(extra);

  appendLog('admin', currentAdmin, `Bulk imported ${truths.length + dares.length} questions to ${mode}`, `${truths.length}T + ${dares.length}D`);
  showToastA(`✅ Imported ${truths.length} truths + ${dares.length} dares to ${mode}!`);
  renderTodCounts();
  viewTodMode(mode);
  modal.remove();
}

/* ── Export all questions ── */
function todExportAll() {
  const extra = getAdminTod();
  let csv = 'Mode,Type,Question,Source
';
  Object.entries(extra).forEach(([mode, modeQ]) => {
    (modeQ.truth || []).forEach(q => { csv += `"${mode}","truth","${q.replace(/"/g,'""')}","Admin"
`; });
    (modeQ.dare  || []).forEach(q => { csv += `"${mode}","dare","${q.replace(/"/g,'""')}","Admin"
`; });
  });
  const blob = new Blob([csv], { type:'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `afrib_tod_questions_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  showToastA('📤 CSV exported!');
}

function todExportMode() {
  const mode = _todViewMode || 'family';
  const extra = getAdminTod();
  const modeQ = extra[mode] || {};
  let csv = 'Type,Question
';
  (modeQ.truth || []).forEach(q => { csv += `"truth","${q.replace(/"/g,'""')}"
`; });
  (modeQ.dare  || []).forEach(q => { csv += `"dare","${q.replace(/"/g,'""')}"
`; });
  const blob = new Blob([csv], { type:'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `afrib_tod_${mode}_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  showToastA(`📋 ${mode} questions exported!`);
}

function todClearMode() {
  const mode = _todViewMode || 'family';
  if (!confirm(`Delete ALL admin-added questions for "${mode}" mode? Built-in questions are unaffected.`)) return;
  const extra = getAdminTod();
  delete extra[mode];
  saveAdminTod(extra);
  appendLog('admin', currentAdmin, `Cleared all admin questions for ${mode} mode`, '');
  showToastA(`🗑 All admin questions cleared for ${mode}`);
  renderTodCounts();
  viewTodMode(mode);
}

/* ── Helper: HTML escape ── */
function escH(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function adminAddTodQuestion() {
  const mode = document.getElementById('todAddMode')?.value;
  const type = document.getElementById('todAddType')?.value;
  const cat  = document.getElementById('todAddCat')?.value || 'chill';
  const text = (document.getElementById('todAddText')?.value || '').trim();
  if (!mode || !type) { showToastA('⚠️ Select mode and type'); return; }
  if (!text) { showToastA('⚠️ Enter question text'); return; }
  if (text.length < 10) { showToastA('⚠️ Too short (min 10 chars)'); return; }
  if (text.length > 300) { showToastA('⚠️ Too long (max 300 chars)'); return; }

  const extra = getAdminTod();
  if (!extra[mode]) extra[mode] = {};
  if (!extra[mode][type]) extra[mode][type] = [];
  extra[mode][type].push(text);
  saveAdminTod(extra);

  document.getElementById('todAddText').value = '';
  const label = type.charAt(0).toUpperCase() + type.slice(1);
  appendLog('admin', currentAdmin, 'Added TOD question: ' + mode + '/' + type + '/' + cat, text.substring(0,60));
  showToastA('✅ ' + label + ' [' + cat + '] added to ' + mode + ' mode!');
  renderTodCounts();
  viewTodMode(mode);
}


function saveLiveSettings() {
  const settings = {
    maxGiftCoins:         parseInt(document.getElementById('liveMaxGiftCoins')?.value || '1000'),
    maxGiftsPerSession:   parseInt(document.getElementById('liveMaxGiftsPerSession')?.value || '50'),
    minCoinsToGoLive:     parseInt(document.getElementById('liveMinCoinsToGoLive')?.value || '0'),
    maxSlots:             parseInt(document.getElementById('liveMaxSlots')?.value || '10'),
    updatedAt:            new Date().toISOString(),
    updatedBy:            currentAdmin || 'admin',
  };
  localStorage.setItem('afrib_live_settings', JSON.stringify(settings));
  // Also update live slots
  localStorage.setItem('afrib_live_slots', settings.maxSlots);
  appendLog('admin', currentAdmin, 'Updated live stream settings', JSON.stringify(settings));
  showToastA('✅ Live settings saved!');
  initLiveSettings();
}

function initLiveSettings() {
  const s = JSON.parse(localStorage.getItem('afrib_live_settings') || '{}');
  const el = id => document.getElementById(id);
  if (el('liveMaxGiftCoins'))       el('liveMaxGiftCoins').value       = s.maxGiftCoins || 1000;
  if (el('liveMaxGiftsPerSession')) el('liveMaxGiftsPerSession').value = s.maxGiftsPerSession || 50;
  if (el('liveMinCoinsToGoLive'))   el('liveMinCoinsToGoLive').value   = s.minCoinsToGoLive || 0;
  if (el('liveMaxSlots'))           el('liveMaxSlots').value           = s.maxSlots || 10;
  const grid = document.getElementById('liveStatsGrid');
  if (grid) {
    const streams = JSON.parse(localStorage.getItem('afrib_live_streams') || '[]');
    const active  = streams.filter(s => s.active !== false).length;
    grid.innerHTML = `
      <div class="chart-card" style="text-align:center;border:1px solid var(--border)"><div style="font-size:24px;font-weight:900;color:var(--gold)">${active}</div><div style="font-size:11px;color:var(--w60)">Active Streams</div></div>
      <div class="chart-card" style="text-align:center;border:1px solid var(--border)"><div style="font-size:24px;font-weight:900;color:var(--gold)">${s.maxSlots||10}</div><div style="font-size:11px;color:var(--w60)">Max Slots</div></div>
    `;
  }
}

function deleteTodQuestion(mode, type, idx) {
  if (!confirm('Delete this question?')) return;
  const extra = getAdminTod();
  if (extra[mode]?.[type]) {
    extra[mode][type].splice(idx, 1);
    saveAdminTod(extra);
    appendLog('admin', currentAdmin, `Deleted ${mode}/${type} question #${idx}`, '');
    showToastA('🗑 Question deleted');
    renderTodCounts();
  }
}

/* ── LEADERBOARD TAB ── */
function renderLeaderboard() {
  const users    = getUsers();
  const gameData = users.map(u => ({ u, prog:tryParse('afrib_ludo_'+u.email,{}), coins:getUserCoins(u.email) }))
    .filter(d => d.coins>0||(d.prog.stats?.gamesPlayed||0)>0)
    .sort((a,b) => b.coins - a.coins)
    .slice(0,15);
  const medals = ['🥇','🥈','🥉'];
  const tbody  = document.getElementById('ludoLeaders');
  if (!tbody) return;
  tbody.innerHTML = gameData.length
    ? gameData.map(({u,prog,coins},i) => {
        const lvl = prog.stats?.level||1;
        const gp  = prog.stats?.gamesPlayed||0;
        const wins= prog.stats?.wins||0;
        return `<tr>
          <td>${medals[i]||'#'+(i+1)}</td>
          <td><strong>${u.first||''} ${u.last||''}</strong><br><small style="color:var(--w60)">@${u.username||'—'}</small></td>
          <td>${u.country||'—'}</td>
          <td style="color:var(--gold);font-weight:700">🪙 ${coins.toLocaleString()}</td>
          <td><span class="badge gold">Lv ${lvl}</span></td>
          <td style="color:var(--w60)">${wins}W / ${gp}P</td>
        </tr>`;
      }).join('')
    : '<tr><td colspan="6" style="text-align:center;color:var(--w60);padding:20px">No players yet</td></tr>';
}

/* ══════════════════════════════
   PASSWORDS — real resets
══════════════════════════════ */
function initPasswords() { filterPwTable(); }

function filterPwTable() {
  const q  = (document.getElementById('pwSearch')?.value || '').toLowerCase().trim();
  const st = document.getElementById('pwStatus')?.value || '';
  let list = getUsers();
  if (q)  list = list.filter(u => `${u.first||''} ${u.last||''} ${u.email||''} ${u.username||''}`.toLowerCase().includes(q));
  if (st) list = list.filter(u => getUserStatus(u) === st);
  list.sort((a,b) => new Date(b.lastLogin||0) - new Date(a.lastLogin||0));
  renderPwTable(list);
}

function renderPwTable(users) {
  document.getElementById('pwBody').innerHTML = users.length
    ? users.map(u => `<tr>
        <td><strong>${u.first||''} ${u.last||''}</strong></td>
        <td style="font-size:12px;color:var(--w60)">${u.email}</td>
        <td style="color:var(--gold)">@${u.username||'—'}</td>
        <td style="font-size:12px">${u.lastLogin ? timeAgo(u.lastLogin) : 'Never logged in'}</td>
        <td style="text-align:center">${u.loginCount||0}</td>
        <td style="text-align:center;color:${(u.failedLogins||0)>0?'var(--red)':'var(--w60)'}">${u.failedLogins||0}</td>
        <td><span class="badge ${getUserStatus(u)==='active'?'g':'o'}">${getUserStatus(u)}</span>
          ${u._forcePassChange?'<br><span class="badge b" style="margin-top:2px">Must change</span>':''}
        </td>
        <td><div class="btn-row">
          <button class="btn btn-gold"  onclick="openResetPw('${u.email}')">🔑 Reset</button>
          <button class="btn btn-ghost" onclick="forceLogout('${u.email}')">⏏ Logout</button>
          ${(u.failedLogins||0)>0?`<button class="btn btn-g" onclick="clearFailedLogins('${u.email}')">🔓 Unlock</button>`:''}
        </div></td>
      </tr>`).join('')
    : '<tr><td colspan="8" style="text-align:center;color:var(--w60);padding:20px">No users found</td></tr>';
}

function checkPassStrength(pw, fillId, labelId) {
  const fill  = document.getElementById(fillId);
  const label = document.getElementById(labelId);
  if (!fill || !label) return;
  if (!pw) { fill.style.width='0'; label.textContent=''; return; }
  let score = 0;
  if (pw.length >= 8)           score++;
  if (pw.length >= 12)          score++;
  if (/[A-Z]/.test(pw))         score++;
  if (/[0-9]/.test(pw))         score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const levels = [
    {pct:'20%',color:'#ef4444',text:'Very weak'},
    {pct:'40%',color:'#f97316',text:'Weak'},
    {pct:'60%',color:'#eab308',text:'Fair'},
    {pct:'80%',color:'#84cc16',text:'Strong'},
    {pct:'100%',color:'#22c55e',text:'Very strong'},
  ];
  const lvl = levels[Math.min(score,4)];
  fill.style.width      = lvl.pct;
  fill.style.background = lvl.color;
  label.textContent     = lvl.text;
  label.style.color     = lvl.color;
}

function checkResetPassStrength() {
  checkPassStrength(document.getElementById('newPw').value, 'rpStrengthFill', 'rpStrengthLabel');
}

function openResetPw(email) {
  const u = getUser(email);
  if (!u) { showToastA('❌ User not found'); return; }
  resetPwEmail = email;
  document.getElementById('resetPwFor').textContent = `Reset password for: ${u.first||''} ${u.last||''} (${u.email})`;
  document.getElementById('newPw').value        = '';
  document.getElementById('newPwConfirm').value = '';
  document.getElementById('rpStrengthFill').style.width = '0';
  document.getElementById('rpStrengthLabel').textContent = '';
  document.querySelectorAll('#resetPwModal .mf-err').forEach(e => e.style.display='none');
  showM('resetPwModal');
}

function doResetPassword() {
  const pw      = document.getElementById('newPw').value;
  const confirm = document.getElementById('newPwConfirm').value;
  const pwErr   = document.getElementById('newPwErr');
  const cfErr   = document.getElementById('newPwConfirmErr');
  pwErr.style.display = 'none';
  cfErr.style.display = 'none';

  if (pw.length < 8) {
    pwErr.textContent = 'Password must be at least 8 characters';
    pwErr.style.display = 'block';
    return;
  }
  if (!/(?=.*[A-Za-z])(?=.*[0-9])/.test(pw)) {
    pwErr.textContent = 'Password must contain letters and numbers';
    pwErr.style.display = 'block';
    return;
  }
  if (pw !== confirm) {
    cfErr.style.display = 'block';
    return;
  }

  const a = getAccounts();
  const u = a[resetPwEmail];
  if (!u) { showToastA('❌ User no longer exists'); closeM('resetPwModal'); return; }

  // Hash and save new user password
  hashUserPw(pw).then(newHash => {
    u.pwHash           = newHash;
    u._forcePassChange = true;
    u.failedLogins     = 0;
    a[resetPwEmail]    = u;

    if (!saveAccounts(a)) return;

    // Clear their active session so they must log in again
    const session = tryParse('afrib_session', null);
    if (session && session.email === resetPwEmail) {
      localStorage.removeItem('afrib_session');
    }

    closeM('resetPwModal');
    filterPwTable();
    appendLog('reset', currentAdmin, `Reset password for ${u.first} ${u.last}`, u.email);
    showToastA(`✅ Password reset for ${u.first} ${u.last}. They must change it on next login.`);
  }).catch(e => { console.error('confirmResetPw hash:', e); showToastA('❌ Error. Try again.'); });
}

function forceLogout(email) {
  const session = tryParse('afrib_session', null);
  if (session && session.email === email) {
    localStorage.removeItem('afrib_session');
    appendLog('admin', currentAdmin, 'Force logout', email);
    showToastA('✅ Session terminated — user is logged out');
  } else {
    showToastA('ℹ️ User has no active session');
  }
}

function clearFailedLogins(email) {
  const a = getAccounts();
  if (!a[email]) return;
  a[email].failedLogins = 0;
  if (!saveAccounts(a)) return;
  filterPwTable();
  appendLog('admin', currentAdmin, 'Cleared failed login counter', email);
  showToastA('✅ Account unlocked — failed login count reset');
}

/* ══════════════════════════════
   PERMISSIONS
══════════════════════════════ */
const ROLES = {
  super:    { name:'Super Admin',   desc:'Full access to everything',            color:'#D4AF37', perms:['dashboard','users','wallets','games','passwords','permissions','activity','settings'] },
  moderator:{ name:'Moderator',     desc:'Manage users and view activity',       color:'#3b82f6', perms:['dashboard','users','activity'] },
  support:  { name:'Support Agent', desc:'Password resets and read-only access', color:'#22c55e', perms:['dashboard','users','passwords'] },
  finance:  { name:'Finance Mgr',   desc:'Wallets and transactions',             color:'#E85D26', perms:['dashboard','wallets'] },
  games:    { name:'Games Manager', desc:'Game monitoring only',                 color:'#c084fc', perms:['dashboard','games'] },
};
const ALL_PERMS = ['dashboard','users','wallets','games','passwords','permissions','activity','settings'];

function initPermissions() {
  const admins = getAdminUsers();
  document.getElementById('adminsBody').innerHTML = admins.length
    ? admins.map((a,i) => {
        const role = ROLES[a.role] || ROLES.support;
        const _aE = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
        return `<tr>
          <td><strong>${_aE(a.name||a.email)}</strong><br><small style="color:var(--w60)">${_aE(a.email)}</small></td>
          <td><span class="badge" style="background:${_aE(role.color)}22;color:${_aE(role.color)};border-color:${_aE(role.color)}44">${_aE(role.name)}</span></td>
          <td>${(a.perms||role.perms).map(p=>`<span class="perm-tag on">${_aE(p)}</span>`).join('')}</td>
          <td style="font-size:12px">${formatDate(a.addedAt)}</td>
          <td><button class="btn btn-red" onclick="removeAdmin(${parseInt(i)||0})">Remove</button></td>
        </tr>`;
      }).join('')
    : `<tr><td colspan="5" style="text-align:center;color:var(--w60);padding:16px">No additional admins. You (${currentAdmin}) have full access as Super Admin.</td></tr>`;

  document.getElementById('roleDefs').innerHTML = Object.entries(ROLES).map(([k,r]) => `
    <div class="role-card">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <div style="width:10px;height:10px;border-radius:50%;background:${r.color}"></div>
        <strong>${r.name}</strong>
      </div>
      <div style="font-size:12px;color:var(--w60);margin-bottom:8px">${r.desc}</div>
      ${r.perms.map(p => `<span class="perm-tag on">${p}</span>`).join('')}
    </div>`).join('');
}

function openAddAdmin() {
  document.getElementById('addAdminSearch').value = '';
  document.getElementById('adminSearchResults').innerHTML = '';
  selectedAdminEmail = null;
  updatePermCheckboxes();
  showM('addAdminModal');
}

function updatePermCheckboxes() {
  const role = document.getElementById('addAdminRole').value;
  const rp   = ROLES[role]?.perms || [];
  document.getElementById('permCBs').innerHTML = ALL_PERMS.map(p => `
    <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer">
      <input type="checkbox" class="perm-cb" value="${p}" ${rp.includes(p)?'checked':''}/> ${p}
    </label>`).join('');
}

function searchForAdmin() {
  const q = (document.getElementById('addAdminSearch').value || '').toLowerCase().trim();
  if (!q) { document.getElementById('adminSearchResults').innerHTML = ''; return; }
  const users = getUsers().filter(u => `${u.first||''} ${u.last||''} ${u.email||''} ${u.username||''}`.toLowerCase().includes(q)).slice(0,5);
  document.getElementById('adminSearchResults').innerHTML = users.map(u =>
    `<div onclick="pickAdminUser('${u.email}','${u.first||''} ${u.last||''}')"
      style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:8px 12px;cursor:pointer;margin-bottom:4px;font-size:13px;transition:border-color .2s"
      onmouseover="this.style.borderColor='var(--border-gold)'" onmouseout="this.style.borderColor='var(--border)'">
      <strong>${u.first||''} ${u.last||''}</strong> <span style="color:var(--w60)">· ${u.email}</span>
    </div>`
  ).join('') || '<div style="font-size:13px;color:var(--w60);padding:8px">No users found</div>';
}

function pickAdminUser(email, name) {
  selectedAdminEmail = email;
  document.getElementById('addAdminSearch').value = name + ' (' + email + ')';
  document.getElementById('adminSearchResults').innerHTML = '';
}

function doAddAdmin() {
  if (!selectedAdminEmail) { showToastA('⚠️ Select a user first'); return; }
  const role  = document.getElementById('addAdminRole').value;
  const perms = [...document.querySelectorAll('.perm-cb:checked')].map(c => c.value);
  if (!perms.length) { showToastA('⚠️ Select at least one permission'); return; }
  const admins = getAdminUsers();
  if (admins.some(a => a.email === selectedAdminEmail)) { showToastA('⚠️ User already has admin access'); return; }
  const u = getUser(selectedAdminEmail);
  admins.push({ email: selectedAdminEmail, name: u ? `${u.first||''} ${u.last||''}`.trim() : selectedAdminEmail, role, perms, addedAt: new Date().toISOString() });
  saveAdminUsers(admins);
  closeM('addAdminModal');
  initPermissions();
  appendLog('admin', currentAdmin, `Granted ${role} access to ${selectedAdminEmail}`, role);
  showToastA('✅ Admin access granted to ' + (u?.first||selectedAdminEmail));
}

function removeAdmin(idx) {
  if (!confirm('Remove this admin? They will lose access immediately.')) return;
  const admins  = getAdminUsers();
  const removed = admins.splice(idx, 1)[0];
  saveAdminUsers(admins);
  initPermissions();
  appendLog('admin', currentAdmin, 'Removed admin access', removed?.email||'');
  showToastA('Admin removed');
}

/* ══════════════════════════════
   ACTIVITY LOG
══════════════════════════════ */
function renderLog() { filterLog(); }
function filterLog() {
  const log   = getLog();
  const q     = (document.getElementById('logSearch')?.value || '').toLowerCase().trim();
  const type  = document.getElementById('logType')?.value || '';
  const icons = { login:'🔐', signup:'👤', payment:'💰', game:'🎮', admin:'🛡️', reset:'🔑' };
  let list    = log;
  if (q)    list = list.filter(l => `${l.user||''} ${l.action||''} ${l.detail||''}`.toLowerCase().includes(q));
  if (type) list = list.filter(l => l.type === type);

  const countEl = document.getElementById('logCount');
  if (countEl) countEl.textContent = `Showing ${Math.min(list.length,200)} of ${list.length} entries`;

  const _lE = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  document.getElementById('logBody').innerHTML = list.length
    ? list.slice(0,200).map(l => {
        const safeType   = _lE(l.type||'—');
        const safeUser   = _lE(l.user||'—');
        const safeAction = _lE(l.action||'—');
        const safeDetail = _lE(l.detail||'—');
        const typeClass  = l.type==='login'?'b':l.type==='reset'?'gold':l.type==='admin'?'o':'g';
        return `<tr>
          <td style="white-space:nowrap;font-size:12px">${new Date(l.time).toLocaleString()}</td>
          <td><span class="badge ${typeClass}">${icons[l.type]||'📋'} ${safeType}</span></td>
          <td style="color:var(--gold)">${safeUser}</td>
          <td>${safeAction}</td>
          <td style="color:var(--w60);font-size:12px">${safeDetail}</td>
        </tr>`;
      }).join('')
    : '<tr><td colspan="5" style="text-align:center;color:var(--w60);padding:16px">No log entries match your filter</td></tr>';
}

function clearLog() {
  if (!confirm('Clear all activity log entries? This cannot be undone.')) return;
  localStorage.setItem(ADM_LOG_KEY, JSON.stringify([]));
  renderLog();
  showToastA('Activity log cleared');
  appendLog('admin', currentAdmin, 'Cleared activity log');
}

function exportLog() {
  const log = getLog();
  if (!log.length) { showToastA('No log entries to export'); return; }
  const csv = ['Time,Type,Admin,Action,Details',
    ...log.map(l => `"${l.time}","${l.type}","${l.user}","${l.action}","${l.detail}"`)
  ].join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = 'afrib_activity_log_' + new Date().toISOString().slice(0,10) + '.csv';
  a.click();
  showToastA('✅ Log exported — ' + log.length + ' entries');
}

/* ══════════════════════════════
   SETTINGS — real password change
══════════════════════════════ */
function loadSettingsFields() {
  const creds = getAdminCreds();
  document.getElementById('sAdminUser').value = creds.user || 'admin';
  document.getElementById('sCurrPass').value  = '';
  document.getElementById('sNewPass').value   = '';
  document.getElementById('sConfirmPass').value = '';
  const settings = getGameSettings();
  document.getElementById('gsCoinRate').value = settings.coinRate || 100;
  document.getElementById('gsMaxWager').value = settings.maxWager || 500;
  document.getElementById('gsDailyMax').value = settings.dailyMax || 150;
  initSettings();
}

function initSettings() {
  const users = getUsers();
  document.getElementById('platformStats').innerHTML = [
    { label:'Total registered users', val: users.length },
    { label:'Active users',           val: users.filter(u => getUserStatus(u) === 'active').length },
    { label:'Suspended users',        val: users.filter(u => getUserStatus(u) === 'suspended').length },
    { label:'Countries represented',  val: [...new Set(users.map(u => u.country).filter(Boolean))].length },
    { label:'Total wallet balance',   val: '$' + users.reduce((s,u) => s+(u.walletBalance||0), 0).toFixed(2) + ' USD' },
    { label:'Total game coins',       val: users.reduce((s,u) => s + getUserCoins(u.email), 0).toLocaleString() + ' 🪙' },
    { label:'Activity log entries',   val: getLog().length },
  ].map(s => `<div style="display:flex;justify-content:space-between;font-size:13px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05)">
    <span style="color:var(--w60)">${s.label}</span><span style="font-weight:600">${s.val}</span>
  </div>`).join('');

  const maint = tryParse('afrib_maintenance', { on:false, msg:'' });
  document.getElementById('maintToggle').checked = maint.on;
  document.getElementById('maintLabel').textContent = 'Maintenance ' + (maint.on ? 'ON 🔴' : 'OFF ✅');
  if (maint.msg) document.getElementById('maintMsg').value = maint.msg;
  // Load Ludo Shop config (populated by afrib_ludo_skins.js, injected at ~800ms)
  setTimeout(function() {
    if (typeof adminLoadLudoShopConfig === 'function') adminLoadLudoShopConfig();
  }, 600);
  setTimeout(function() {
    if (typeof adminLoadLudoShopConfig === 'function') adminLoadLudoShopConfig();
  }, 1200);
}

function checkSettingsPassStrength() {
  checkPassStrength(document.getElementById('sNewPass').value, 'sStrengthFill', 'sStrengthLabel');
}

async function saveAdminPassword() {
  const curr    = document.getElementById('sCurrPass').value;
  const newPw   = document.getElementById('sNewPass').value;
  const confirm = document.getElementById('sConfirmPass').value;
  const creds   = getAdminCreds();

  // Clear errors
  ['sCurrPassErr','sNewPassErr','sConfirmPassErr'].forEach(id => {
    const el = document.getElementById(id); if (el) el.style.display = 'none';
  });

  // Validate strength
  if (newPw.length < 8)            { const el=document.getElementById('sNewPassErr');    if(el){el.textContent='Password must be at least 8 characters';    el.style.display='block';} return; }
  if (!/[0-9]/.test(newPw))        { const el=document.getElementById('sNewPassErr');    if(el){el.textContent='Must include at least one number';           el.style.display='block';} return; }
  if (!/[A-Z]/.test(newPw))        { const el=document.getElementById('sNewPassErr');    if(el){el.textContent='Must include at least one uppercase letter'; el.style.display='block';} return; }
  if (!/[^a-zA-Z0-9]/.test(newPw)) { const el=document.getElementById('sNewPassErr');    if(el){el.textContent='Must include at least one special character';el.style.display='block';} return; }
  if (newPw !== confirm)            { const el=document.getElementById('sConfirmPassErr');if(el) el.style.display='block'; return; }

  try {
    // Verify current password via PBKDF2 (handles pbkdf2adm$ and legacy plain$)
    const currOk = await _ADMSEC.verify(curr, creds.passHash);
    if (!currOk) {
      const el = document.getElementById('sCurrPassErr');
      if (el) el.style.display = 'block';
      document.getElementById('sCurrPass').focus();
      return;
    }

    creds.passHash = await _ADMSEC.hashNew(newPw);
    delete creds._defaultPw;
    if (!saveAdminCreds(creds)) return;

    // Session token is a random value — NOT the password hash
    const sessionToken = Array.from(crypto.getRandomValues(new Uint8Array(24))).map(b=>b.toString(16).padStart(2,'0')).join('');
    localStorage.setItem('admin_session', JSON.stringify({ user: currentAdmin, token: sessionToken, time: new Date().toISOString() }));

    document.getElementById('sCurrPass').value    = '';
    document.getElementById('sNewPass').value     = '';
    document.getElementById('sConfirmPass').value = '';
    document.getElementById('sStrengthFill').style.width = '0';
    document.getElementById('sStrengthLabel').textContent = '';
    appendLog('admin', currentAdmin, 'Changed admin password');
    showToastA('✅ Admin password changed and saved successfully');
  } catch(e) {
    console.error('[saveAdminPassword]', e);
    showToastA('❌ Error saving password. Please try again.');
  }
}

async function saveAdminUsername() {
  const newUser = document.getElementById('sAdminUser').value.trim();
  const pass    = document.getElementById('sAdminUserPass').value;
  const creds   = getAdminCreds();

  if (!newUser || newUser.length < 3)    { showToastA('⚠️ Username must be at least 3 characters'); return; }
  if (!/^[a-zA-Z0-9_]+$/.test(newUser)) { showToastA('⚠️ Username: letters, numbers, underscores only'); return; }

  try {
    const passOk = await _ADMSEC.verify(pass, creds.passHash);
    if (!passOk) { showToastA('❌ Incorrect current password'); return; }
    const oldUser  = creds.user;
    creds.user     = newUser;
    if (!saveAdminCreds(creds)) return;
    currentAdmin = newUser;
    try {
      const sess = tryParse('admin_session', null);
      if (sess) { sess.user = newUser; localStorage.setItem('admin_session', JSON.stringify(sess)); }
    } catch(e) {}
    document.getElementById('aAvEl').textContent      = newUser[0].toUpperCase();
    document.getElementById('aUserLabel').textContent = newUser;
    document.getElementById('sAdminUserPass').value   = '';
    appendLog('admin', newUser, `Changed admin username from "${oldUser}" to "${newUser}"`);
    showToastA(`✅ Username changed to "${newUser}"`);
  } catch(e) {
    console.error('[saveAdminUsername]', e);
    showToastA('❌ Error saving username. Please try again.');
  }
}

function saveMaintenance() {
  const on  = document.getElementById('maintToggle').checked;
  const msg = document.getElementById('maintMsg').value.trim() || 'We\'re upgrading AfriBconnect. Back very soon!';
  localStorage.setItem('afrib_maintenance', JSON.stringify({ on, msg }));
  appendLog('admin', currentAdmin, `Maintenance mode ${on?'enabled':'disabled'}`, msg);
  showToastA('Maintenance mode ' + (on ? 'ENABLED 🔴' : 'disabled ✅'));
}

/* ══════════════════════════════
   DANGER ZONE
══════════════════════════════ */
function clearAllLogs() {
  if (!confirm('⚠️ Delete ALL activity log entries permanently?')) return;
  if (!confirm('This cannot be undone. Are you absolutely sure?')) return;
  localStorage.setItem(ADM_LOG_KEY, '[]');
  showToastA('Activity log cleared');
  renderLog();
}

function resetPlatformData() {
  const input = prompt('⚠️ DANGER: This will delete ALL user accounts, sessions, and game data.\n\nType "DELETE ALL DATA" to confirm:');
  if (input !== 'DELETE ALL DATA') { showToastA('Reset cancelled'); return; }
  ['afrib_accounts','afrib_session','afrib_remembered'].forEach(k => localStorage.removeItem(k));
  // Clear user-specific keys
  const keys = Object.keys(localStorage).filter(k => k.startsWith('afrib_coins_') || k.startsWith('afrib_ludo_'));
  keys.forEach(k => localStorage.removeItem(k));
  appendLog('admin', currentAdmin, '⚠️ PLATFORM DATA RESET — all user data deleted');
  showToastA('⚠️ All platform data has been cleared');
  initDashboard();
}

/* ══════════════════════════════
   INIT — ensure default admin exists
══════════════════════════════ */
(function init() {
  const stored = tryParse(ADM_KEY, null);

  /* ── Step 1: Seed default credentials ONLY if truly missing ── */
  if (!stored || typeof stored.passHash !== 'string') {
    // No credentials at all — seed defaults
    localStorage.setItem(ADM_KEY, JSON.stringify({ user: 'admin', passHash: 'plain$Welcome12!' }));
    localStorage.removeItem('admin_session');
  }
  // NOTE: Do NOT wipe existing PBKDF2 hashes — they are valid upgraded credentials

  /* ── Step 2: Restore saved session ── */
  try {
    const session = tryParse('admin_session', null);
    if (session && session.user && session.token && session.time) {
      const age = Date.now() - new Date(session.time).getTime();
      // Session valid if under 8 hours and token is a hex string (not a password hash)
      const tokenValid = /^[0-9a-f]{48}$/.test(session.token);
      if (age < 8 * 3600 * 1000 && tokenValid) {
        currentAdmin = session.user;
        enterAdminApp();
        return;
      } else {
        localStorage.removeItem('admin_session');
      }
    }
  } catch(e) { console.error('[Admin session restore]', e); }

  /* ── Step 3: Restore saved username ── */
  try {
    const savedU = localStorage.getItem('admin_saved_username');
    const uEl = document.getElementById('aU');
    if (uEl) {
      uEl.value = savedU || getAdminCreds().user || 'admin';
    }
    const remEl = document.getElementById('adminRememberMe');
    if (remEl && savedU) remEl.checked = true;
  } catch(e) {
    const uEl = document.getElementById('aU');
    if (uEl) uEl.value = 'admin';
  }

  /* ── Step 4: MasterFix will restore encrypted password after it loads ── */
  /* (afribconnect_masterfix.js handles encrypted credential auto-fill) */

  const pEl = document.getElementById('aP');
  if (pEl) pEl.focus();
})();

/* ══════════════════════════════
   AFRIMATCH ADMIN PANEL
══════════════════════════════ */
function getDatingProfiles() {
  try { return Object.values(JSON.parse(localStorage.getItem('afrib_dating_profiles')||'{}')); }
  catch(e) { return []; }
}
function getDatingMatches() {
  try { return Object.values(JSON.parse(localStorage.getItem('afrib_dating_matches')||'{}')); }
  catch(e) { return []; }
}
function tryParseDatingAdmin() {
  try { return JSON.parse(localStorage.getItem('afrib_dating_admin_settings')||'{}'); }
  catch(e) { return {}; }
}

function initDating() {
  const profiles = getDatingProfiles();
  const matches  = getDatingMatches();
  const msgs     = (() => { try { return JSON.parse(localStorage.getItem('afrib_dating_messages')||'{}'); } catch(e) { return {}; } })();
  const likes    = (() => { try { return JSON.parse(localStorage.getItem('afrib_dating_likes')||'{}'); } catch(e) { return {}; } })();
  const allMsgs  = Object.values(msgs).reduce((s,m)=>s+(m.length||0),0);
  const totalLikes = Object.values(likes).reduce((s,l)=>s+l.length,0);

  document.getElementById('datingStats').innerHTML = [
    { icon:'👤', val:profiles.length,  label:'Dating Profiles' },
    { icon:'💕', val:matches.length,   label:'Total Matches' },
    { icon:'💬', val:allMsgs,          label:'Messages Sent' },
    { icon:'❤️', val:totalLikes,       label:'Total Likes' },
    { icon:'🌍', val:[...new Set(profiles.map(p=>p.heritage).filter(Boolean))].length, label:'Heritage Groups' },
    { icon:'✅', val:profiles.filter(p=>p.active!==false).length, label:'Active Profiles' },
  ].map(s=>`<div class="stat-card"><div class="stat-icon">${s.icon}</div><div class="stat-val">${s.val}</div><div class="stat-label">${s.label}</div></div>`).join('');

  // Gender & goal breakdown
  const gC = {Man:0,Woman:0,Other:0};
  profiles.forEach(p=>{const g=p.gender||'Other';gC[g in gC?g:'Other']++;});
  document.getElementById('datingActivity').innerHTML = [
    {label:'👨 Men',val:gC.Man,pct:profiles.length?Math.round(gC.Man/profiles.length*100):0},
    {label:'👩 Women',val:gC.Woman,pct:profiles.length?Math.round(gC.Woman/profiles.length*100):0},
    {label:'💍 Long-term',val:profiles.filter(p=>p.goal==='Long-term').length,pct:profiles.length?Math.round(profiles.filter(p=>p.goal==='Long-term').length/profiles.length*100):0},
    {label:'☕ Casual',val:profiles.filter(p=>p.goal==='Casual dating').length,pct:profiles.length?Math.round(profiles.filter(p=>p.goal==='Casual dating').length/profiles.length*100):0},
  ].map(s=>`<div style="margin-bottom:8px">
    <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px"><span>${s.label}</span><span style="color:var(--gold)">${s.val}</span></div>
    <div class="prog-bar"><div class="prog-fill" style="width:${s.pct}%"></div></div>
  </div>`).join('')||'<div style="color:var(--w60);font-size:13px">No dating profiles yet</div>';

  // Heritage breakdown
  const hC={};
  profiles.forEach(p=>{if(p.heritage)hC[p.heritage]=(hC[p.heritage]||0)+1;});
  const topH=Object.entries(hC).sort((a,b)=>b[1]-a[1]).slice(0,6);
  const mxH=(topH[0]?.[1])||1;
  document.getElementById('datingHeritageBreakdown').innerHTML=topH.length
    ?topH.map(([h,n])=>`<div style="margin-bottom:8px">
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px"><span>${h}</span><span style="color:var(--gold)">${n}</span></div>
      <div class="prog-bar"><div class="prog-fill" style="width:${(n/mxH)*100}%"></div></div>
    </div>`).join('')
    :'<div style="color:var(--w60);font-size:13px">No data yet</div>';

  // Load settings
  const ds=tryParseDatingAdmin();
  document.getElementById('datingEnabled').checked       = ds.enabled!==false;
  document.getElementById('datingRequirePhoto').checked  = ds.requirePhoto||false;
  document.getElementById('datingAgeGate').checked       = ds.ageGate!==false;
  document.getElementById('datingDailySuperLikes').value = ds.dailySuperLikes||3;
  document.getElementById('datingSwipeLimit').value      = ds.swipeLimit||100;

  filterDatingProfiles();
}

function saveDatingSettings() {
  const s={
    enabled:        document.getElementById('datingEnabled').checked,
    requirePhoto:   document.getElementById('datingRequirePhoto').checked,
    ageGate:        document.getElementById('datingAgeGate').checked,
    dailySuperLikes:parseInt(document.getElementById('datingDailySuperLikes').value)||3,
    swipeLimit:     parseInt(document.getElementById('datingSwipeLimit').value)||100,
  };
  localStorage.setItem('afrib_dating_admin_settings',JSON.stringify(s));
  appendLog('admin',currentAdmin,'Updated AfriMatch settings');
  showToastA('✅ AfriMatch settings saved');
}

function filterDatingProfiles() {
  const q      =(document.getElementById('datingSearch')?.value||'').toLowerCase().trim();
  const status = document.getElementById('datingFilterStatus')?.value||'';
  const gender = document.getElementById('datingFilterGender')?.value||'';
  let list     = getDatingProfiles();
  if(q)      list=list.filter(p=>`${p.displayName||''} ${p.email||''} ${p.liveCountry||''} ${p.heritage||''} ${p.occupation||''}`.toLowerCase().includes(q));
  if(gender) list=list.filter(p=>p.gender===gender);
  if(status==='active')    list=list.filter(p=>p.active!==false);
  if(status==='suspended') list=list.filter(p=>p.active===false);

  const cEl=document.getElementById('datingProfileCount');
  if(cEl) cEl.textContent=`Showing ${list.length} of ${getDatingProfiles().length} dating profiles`;

  const tbody=document.getElementById('datingProfilesBody');
  if(!tbody) return;
  tbody.innerHTML=list.length?list.map(p=>{
    const photo=p.photo
      ?`<img src="${p.photo}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;border:1px solid var(--border-gold)"/>`
      :`<div style="width:32px;height:32px;border-radius:50%;background:var(--gold-dim);color:var(--gold);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700">${(p.displayName||'?')[0]}</div>`;
    const interests=(p.interests||[]).slice(0,3).join(', ');
    const isActive=p.active!==false;
    return`<tr>
      <td><div style="display:flex;align-items:center;gap:8px">${photo}<div><div style="font-weight:600">${p.displayName||'Unknown'}</div><div style="font-size:11px;color:var(--w60)">${p.email||'—'}</div></div></div></td>
      <td>${p.age||'?'} · ${p.gender||'?'}</td>
      <td>${p.city||''} ${p.liveCountry||'—'}</td>
      <td><span class="badge gold">${p.heritage||'—'}</span></td>
      <td style="font-size:12px;color:var(--w60)">${p.goal||'—'}</td>
      <td style="font-size:11px;color:var(--w60)">${interests||'—'}</td>
      <td style="font-size:12px">${p.createdAt?new Date(p.createdAt).toLocaleDateString():'—'}</td>
      <td><span class="badge ${isActive?'g':'o'}">${isActive?'Active':'Suspended'}</span></td>
      <td><div class="btn-row">
        <button class="btn btn-b" onclick="viewDatingProfile('${p.email}')">👁 View</button>
        <button class="btn ${isActive?'btn-red':'btn-g'}" onclick="toggleDatingProfile('${p.email}')">${isActive?'Suspend':'Restore'}</button>
        <button class="btn btn-ghost" onclick="deleteDatingProfileAdmin('${p.email}')">🗑</button>
      </div></td>
    </tr>`;
  }).join(''):'<tr><td colspan="9" style="text-align:center;color:var(--w60);padding:20px">No dating profiles found</td></tr>';
}

function viewDatingProfile(email) {
  try {
    const p = JSON.parse(localStorage.getItem('afrib_dating_profiles') || '{}')[email];
    if (!p) { showToastA('Profile not found'); return; }
    const esc = v => String(v||'').replace(/</g,'&lt;').replace(/>/g,'&gt;');

    let modal = document.getElementById('datingProfileModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'datingProfileModal';
      modal.className = 'modal-overlay';
      modal.onclick = e => { if (e.target === modal) modal.classList.remove('open'); };
      document.body.appendChild(modal);
    }

    const interests = (p.interests || []).map(i => `<span class="perm-tag on">${esc(i)}</span>`).join('') || '<span style="color:var(--w30)">—</span>';
    const fields = [
      ['🎂 Age',        p.age||'—'],
      ['⚧ Gender',      p.gender||'—'],
      ['🌍 Lives In',   (p.city||'') + ' ' + (p.liveCountry||'')],
      ['🌱 Heritage',   p.heritage||'—'],
      ['💑 Goal',       p.goal||'—'],
      ['🙏 Religion',   p.religion||'—'],
      ['👶 Children',   p.children||'—'],
      ['💼 Occupation', p.occupation||'—'],
      ['✅ Verified',   p.verified ? 'Yes' : 'No'],
    ];

    modal.innerHTML = `
      <div class="modal" style="max-width:480px">
        <button class="modal-close" onclick="document.getElementById('datingProfileModal').classList.remove('open')">✕</button>
        <h3>💕 AfriMatch Profile</h3>
        <p class="msub">${esc(email)}</p>
        <div style="display:flex;align-items:center;gap:14px;margin-bottom:18px">
          <div style="width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#ec4899,#a855f7);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">
            ${p.photo ? `<img src="${p.photo}" style="width:52px;height:52px;border-radius:50%;object-fit:cover"/>` : '💕'}
          </div>
          <div>
            <div style="font-size:17px;font-weight:700">${esc(p.displayName||'—')}</div>
            <div style="font-size:12px;color:var(--w60)">${esc(email)}</div>
            <span style="font-size:11px;background:${p.active!==false?'rgba(34,197,94,.15)':'rgba(239,68,68,.15)'};color:${p.active!==false?'#22c55e':'#f87171'};border-radius:20px;padding:2px 8px;font-weight:700">${p.active!==false?'Active':'Suspended'}</span>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px">
          ${fields.map(([l,v])=>`<div style="background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:8px;padding:8px 10px">
            <div style="font-size:10px;color:var(--w60);margin-bottom:2px">${l}</div>
            <div style="font-size:12px;font-weight:600">${esc(v)}</div>
          </div>`).join('')}
        </div>
        <div class="sec-label">Interests</div>
        <div style="margin-bottom:14px">${interests}</div>
        ${p.bio ? `<div class="sec-label">Bio</div><div style="font-size:13px;color:var(--w60);background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:8px;padding:10px;margin-bottom:14px;line-height:1.5">${esc(p.bio)}</div>` : ''}
        <div class="modal-btns">
          <button class="btn ${p.active!==false?'btn-red':'btn-g'}" onclick="toggleDatingProfile('${esc(email)}');document.getElementById('datingProfileModal').classList.remove('open')">${p.active!==false?'🚫 Suspend':'✅ Restore'}</button>
          <button class="btn btn-red" onclick="deleteDatingProfileAdmin('${esc(email)}');document.getElementById('datingProfileModal').classList.remove('open')">🗑 Delete</button>
          <button class="btn btn-ghost" onclick="document.getElementById('datingProfileModal').classList.remove('open')">Close</button>
        </div>
      </div>`;
    modal.classList.add('open');
  } catch(e) { console.error('viewDatingProfile:', e); showToastA('⚠️ ' + e.message); }
}

function toggleDatingProfile(email) {
  try {
    const profiles=JSON.parse(localStorage.getItem('afrib_dating_profiles')||'{}');
    if(!profiles[email]) return;
    const was=profiles[email].active!==false;
    profiles[email].active=!was;
    localStorage.setItem('afrib_dating_profiles',JSON.stringify(profiles));
    filterDatingProfiles();
    appendLog('admin',currentAdmin,`${was?'Suspended':'Restored'} dating profile`,email);
    showToastA(`Profile ${was?'suspended':'restored'}`);
  } catch(e){showToastA('Error');}
}

function deleteDatingProfileAdmin(email) {
  if(!confirm(`Permanently delete the dating profile for ${email}?`)) return;
  try {
    const profiles=JSON.parse(localStorage.getItem('afrib_dating_profiles')||'{}');
    delete profiles[email];
    localStorage.setItem('afrib_dating_profiles',JSON.stringify(profiles));
    initDating();
    appendLog('admin',currentAdmin,'Deleted dating profile',email);
    showToastA('Profile deleted');
  } catch(e){showToastA('Error');}
}

function exportDatingCSV() {
  const profiles=getDatingProfiles();
  const rows=[['Name','Email','Age','Gender','Country','Heritage','Goal','Religion','Children','Education','Occupation','Interests','Created','Status']];
  profiles.forEach(p=>rows.push([p.displayName||'',p.email||'',p.age||'',p.gender||'',p.liveCountry||'',p.heritage||'',p.goal||'',p.religion||'',p.children||'',p.education||'',p.occupation||'',(p.interests||[]).join(';'),p.createdAt||'',p.active===false?'Suspended':'Active']));
  const csv=rows.map(r=>r.map(c=>`"${String(c||'').replace(/"/g,'""')}"`).join(',')).join('\n');
  const a=document.createElement('a');
  a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv);
  a.download='afrib_dating_'+new Date().toISOString().slice(0,10)+'.csv';
  a.click();
  showToastA(`✅ Exported ${profiles.length} dating profiles`);
}


/* ========================= LOGIN HISTORY PANEL ========================= */
function initLoginHistory() { filterLogins(); }

function filterLogins() {
  var log    = getLog();
  var q      = (document.getElementById('loginSearch') ? document.getElementById('loginSearch').value : '').toLowerCase().trim();
  var type   = document.getElementById('loginTypeFilter') ? document.getElementById('loginTypeFilter').value : '';
  var icons  = { login:'🔐', signup:'👤', payment:'💰', game:'🎮', admin:'🛡️', reset:'🔑', logout:'🚪' };
  var colors = { login:'b', signup:'g', payment:'gold', game:'b', admin:'o', reset:'gold', logout:'r' };
  var list   = log;
  if (q)    list = list.filter(function(l){ return (l.user+' '+l.action+' '+l.detail).toLowerCase().includes(q); });
  if (type) list = list.filter(function(l){ return l.type === type; });
  var countEl = document.getElementById('loginCount');
  if (countEl) countEl.textContent = 'Showing ' + Math.min(list.length,500) + ' of ' + list.length + ' events';
  var tbody = document.getElementById('loginBody');
  if (!tbody) return;
  if (!list.length) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--w60);padding:20px">No events yet. Events appear as users sign up, log in, and transact.</td></tr>';
    return;
  }
  tbody.innerHTML = list.slice(0,500).map(function(l) {
    var dt   = new Date(l.time);
    var time = dt.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'2-digit'}) + ' ' + dt.toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'});
    var cls  = colors[l.type] || 'g';
    var icon = icons[l.type] || '📋';
    var accounts = tryParse('afrib_accounts', {});
    var userEmail= Object.keys(accounts).find(function(e){ return accounts[e] && (accounts[e].username === l.user || e === l.detail); }) || '';
    var u = accounts[userEmail] || {};
    var _hE = function(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); };
    return '<tr>' +
      '<td style="white-space:nowrap;font-size:11px;color:var(--w60)">' + time + '</td>' +
      '<td><span class="badge ' + _hE(cls) + '">' + icon + ' ' + _hE(l.type||'event') + '</span></td>' +
      '<td><div style="font-weight:600;font-size:12px">' + _hE(l.user||'—') + '</div>' +
        (u.country ? '<div style="font-size:10px;color:var(--w30)">' + _hE(u.countryEmoji||'') + ' ' + _hE(u.country) + '</div>' : '') +
      '</td>' +
      '<td style="font-size:12px;color:var(--w60)">' + _hE(l.detail||'—') + '</td>' +
      '<td style="font-size:12px">' + _hE(l.action||'—') + '</td>' +
    '</tr>';
  }).join('');
}

function exportLoginCSV() {
  var log = getLog();
  if (!log.length) { showToastA('No events to export'); return; }
  var rows = [['Time','Type','User','Detail','Action']].concat(
    log.map(function(l){ return [l.time,l.type,l.user,l.detail,l.action].map(function(v){ return '"'+String(v||'').replace(/"/g,'""')+'"'; }); })
  );
  var a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(rows.map(function(r){ return r.join(','); }).join('\n'));
  a.download = 'afrib_activity_' + new Date().toISOString().slice(0,10) + '.csv';
  a.click();
  showToastA('Exported ' + log.length + ' events');
}

/* ========================= USER PROFILES PANEL ========================= */
function initUserDetail() {
  var users    = getUsers();
  var countries= [];
  users.forEach(function(u){ if(u.country && countries.indexOf(u.country)<0) countries.push(u.country); });
  countries.sort();
  var sel = document.getElementById('udCountryFilter');
  if (sel) sel.innerHTML = '<option value="">All Countries</option>' + countries.map(function(c){ return '<option>'+String(c||'').replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</option>'; }).join('');
  filterUserDetail();
}

function filterUserDetail() {
  var q       = (document.getElementById('udSearch') ? document.getElementById('udSearch').value : '').toLowerCase().trim();
  var sort    = document.getElementById('udSort') ? document.getElementById('udSort').value : 'joined';
  var country = document.getElementById('udCountryFilter') ? document.getElementById('udCountryFilter').value : '';
  var users   = getUsers();
  if (q) users = users.filter(function(u){ return (u.first+' '+u.last+' '+u.email+' '+u.username+' '+u.country+' '+u.phone+' '+u.profession).toLowerCase().includes(q); });
  if (country) users = users.filter(function(u){ return u.country === country; });
  if (sort==='joined')  users.sort(function(a,b){ return new Date(b.createdAt||0)-new Date(a.createdAt||0); });
  if (sort==='login')   users.sort(function(a,b){ return new Date(b.lastLogin||0)-new Date(a.lastLogin||0); });
  if (sort==='balance') users.sort(function(a,b){ return (b.walletBalance||0)-(a.walletBalance||0); });
  if (sort==='name')    users.sort(function(a,b){ return (a.first||'').localeCompare(b.first||''); });
  var countEl = document.getElementById('udCount');
  if (countEl) countEl.textContent = users.length + ' user' + (users.length!==1?'s':'') + ' found';
  var grid = document.getElementById('udGrid');
  if (!grid) return;
  if (!users.length) {
    grid.innerHTML = '<div style="text-align:center;padding:40px;color:var(--w60);grid-column:1/-1"><div style="font-size:32px;margin-bottom:8px">👥</div>No users match</div>';
    return;
  }
  grid.innerHTML = users.map(function(u) {
    var init      = ((u.first||'U')[0]+(u.last||'U')[0]).toUpperCase();
    var coins     = getUserCoins(u.email);
    var txs       = tryParse('afrib_txs_'+u.email, []);
    var sent      = txs.filter(function(t){return t.type==='out';}).reduce(function(s,t){return s+(t.amount||0);},0);
    var recv      = txs.filter(function(t){return t.type==='in';}).reduce(function(s,t){return s+(t.amount||0);},0);
    var status    = getUserStatus(u);
    var lastLogin = u.lastLogin ? timeAgo(u.lastLogin) : 'Never';
    var joined    = formatDate(u.createdAt);
    var pms       = (u.linkedPayments||[]).map(function(p){return p.type;}).join(', ') || 'None';
    var loginCount= u.loginCount || 0;
    var statusColor = status==='active' ? '#22c55e' : status==='suspended' ? '#f97316' : '#ef4444';
    var userLogs  = getLog().filter(function(l){ return l.user===u.email || l.user===(u.first+' '+u.last) || l.detail===u.email; }).slice(0,3);
    return '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:14px;overflow:hidden;transition:border-color .2s" onmouseover="this.style.borderColor=&apos;var(--border-gold)&apos;" onmouseout="this.style.borderColor=&apos;var(--border)&apos;">' +
      '<div style="background:linear-gradient(135deg,#1a0e00,#2a1500);padding:16px;display:flex;align-items:center;gap:12px">' +
        '<div style="width:48px;height:48px;border-radius:50%;background:var(--gold);color:#000;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;flex-shrink:0">'+init+'</div>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-size:15px;font-weight:800">'+(u.first||'')+' '+(u.last||'')+'</div>' +
          '<div style="font-size:11px;color:var(--w60)">@'+(u.username||'—')+' · '+(u.countryEmoji||'🌍')+' '+(u.country||'—')+'</div>' +
        '</div>' +
        '<span style="font-size:10px;padding:3px 8px;border-radius:10px;background:'+statusColor+'22;color:'+statusColor+';border:1px solid '+statusColor+'44">'+status+'</span>' +
      '</div>' +
      '<div style="padding:12px 16px;border-bottom:1px solid var(--border);font-size:12px;color:var(--w60)">' +
        '📧 '+u.email+'<br>' +
        (u.phone ? '📱 '+u.phone+'<br>' : '') +
        (u.profession ? '💼 '+u.profession : '') +
      '</div>' +
      '<div style="display:grid;grid-template-columns:repeat(3,1fr)">' +
        '<div style="padding:10px;text-align:center;border-right:1px solid var(--border)">' +
          '<div style="font-size:14px;font-weight:800;color:var(--gold)">$'+(u.walletBalance||0).toFixed(2)+'</div>' +
          '<div style="font-size:10px;color:var(--w60)">Balance</div>' +
        '</div>' +
        '<div style="padding:10px;text-align:center;border-right:1px solid var(--border)">' +
          '<div style="font-size:14px;font-weight:800;color:var(--orange)">'+coins.toLocaleString()+'🪙</div>' +
          '<div style="font-size:10px;color:var(--w60)">Coins</div>' +
        '</div>' +
        '<div style="padding:10px;text-align:center">' +
          '<div style="font-size:14px;font-weight:800;color:#22c55e">'+loginCount+'</div>' +
          '<div style="font-size:10px;color:var(--w60)">Logins</div>' +
        '</div>' +
      '</div>' +
      '<div style="padding:10px 16px;border-top:1px solid var(--border);font-size:12px">' +
        '<div style="display:flex;justify-content:space-between;margin-bottom:3px"><span style="color:var(--w60)">Sent</span><span style="color:#ef4444">-$'+sent.toFixed(2)+'</span></div>' +
        '<div style="display:flex;justify-content:space-between;margin-bottom:3px"><span style="color:var(--w60)">Received</span><span style="color:#22c55e">+$'+recv.toFixed(2)+'</span></div>' +
        '<div style="display:flex;justify-content:space-between"><span style="color:var(--w60)">Methods</span><span style="font-size:11px">'+pms+'</span></div>' +
      '</div>' +
      '<div style="padding:8px 16px;border-top:1px solid var(--border)">' +
        '<div style="font-size:10px;color:var(--w30);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Recent Activity</div>' +
        (userLogs.length ? userLogs.map(function(l){return '<div style="font-size:11px;color:var(--w60);display:flex;justify-content:space-between;margin-bottom:2px"><span>'+l.action+'</span><span style="color:var(--w30)">'+timeAgo(l.time)+'</span></div>';}).join('') : '<div style="font-size:11px;color:var(--w30)">No activity yet</div>') +
      '</div>' +
      '<div style="padding:8px 16px;border-top:1px solid var(--border);font-size:11px;color:var(--w30);display:flex;justify-content:space-between">' +
        '<span>Joined '+joined+'</span><span>Last seen '+lastLogin+'</span>' +
      '</div>' +
      '<div style="padding:10px 16px;border-top:1px solid var(--border);display:flex;gap:6px">' +
        '<button class="btn btn-b" style="flex:1;font-size:11px" onclick="openEditUser(&quot;+u.email+&quot;)">✏️ Edit</button>' +
        '<button class="btn btn-ghost" style="flex:1;font-size:11px" onclick="openResetPw(&quot;+u.email+&quot;)">🔑 PW</button>' +
        '<button class="btn '+(status==='suspended'?'btn-g':'btn-red')+'" style="flex:1;font-size:11px" onclick="quickSuspend(&quot;+u.email+&quot;)">'+(status==='suspended'?'Unsuspend':'Suspend')+'</button>' +
      '</div>' +
    '</div>';
  }).join('');
}

/* ========================= MARKETPLACE ADMIN PANEL ========================= */
function initMarketplacePanel() {
  var stores    = tryParse('afrib_seller_stores', {});
  var storeList = Object.values(stores);
  var allListings = [];
  storeList.forEach(function(store) {
    var listings = tryParse('afrib_listings_' + store.email, []);
    listings.forEach(function(l){ allListings.push(Object.assign({},l,{storeName:store.name,storeEmail:store.email})); });
  });
  var activeListings = allListings.filter(function(l){ return l.active!==false; });
  var orders = getLog().filter(function(l){ return l.type==='payment' && (l.action||'').toLowerCase().includes('marketplace'); });
  var totalRev = orders.reduce(function(s,l){
    var m=(l.detail||'').match(/\$([\d.]+)/);
    return s+(m?parseFloat(m[1]):0);
  },0);

  var statsEl = document.getElementById('mktAdminStats');
  if (statsEl) statsEl.innerHTML = [
    {icon:'🏪',val:storeList.length,label:'Seller Stores'},
    {icon:'📦',val:activeListings.length,label:'Active Listings'},
    {icon:'💰',val:'$'+totalRev.toFixed(2),label:'Total Sales'},
    {icon:'🛒',val:orders.length,label:'Orders'},
  ].map(function(s){return '<div class="stat-card"><div class="stat-icon">'+s.icon+'</div><div class="stat-val">'+s.val+'</div><div class="stat-label">'+s.label+'</div></div>';}).join('');

  var storesEl = document.getElementById('mktAdminStores');
  if (storesEl) storesEl.innerHTML = storeList.length
    ? storeList.map(function(store){
        var listings = tryParse('afrib_listings_'+store.email,[]);
        return '<div style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:10px;margin-bottom:8px">'+
          '<div style="width:40px;height:40px;border-radius:50%;background:var(--gold);color:#000;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800">'+((store.name||'S')[0].toUpperCase())+'</div>'+
          '<div style="flex:1"><div style="font-weight:700">'+store.name+'</div><div style="font-size:12px;color:var(--w60)">'+store.email+' · '+listings.length+' listings'+(store.contact?' · '+store.contact:'')+'</div></div>'+
          '<div style="text-align:right"><div style="font-size:11px;color:var(--w60)">'+formatDate(store.createdAt)+'</div><div style="font-size:10px;color:var(--gold)">'+listings.filter(function(l){return l.active!==false;}).length+' active</div></div>'+
        '</div>';
      }).join('')
    : '<div style="color:var(--w60);font-size:13px;padding:12px">No seller stores yet</div>';

  filterAdminListings();

  var ordersEl = document.getElementById('mktOrdersBody');
  if (ordersEl) ordersEl.innerHTML = orders.length
    ? orders.slice(0,100).map(function(o){
        var dt=new Date(o.time);
        var time=dt.toLocaleDateString('en-GB',{day:'2-digit',month:'short'})+' '+dt.toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'});
        var m=(o.detail||'').match(/\$([\d.]+)/);
        var amt=m?'$'+parseFloat(m[1]).toFixed(2):'—';
        return '<tr><td style="font-size:12px">'+time+'</td><td style="font-size:12px">'+o.user+'</td><td style="font-size:12px">'+(o.action||'').replace('Marketplace purchase: ','').slice(0,60)+'</td><td style="color:var(--gold);font-weight:700">'+amt+'</td><td><span class="badge g">Completed</span></td></tr>';
      }).join('')
    : '<tr><td colspan="5" style="text-align:center;color:var(--w60);padding:16px">No orders yet</td></tr>';
}

function filterAdminListings() {
  var q = (document.getElementById('mktAdminSearch') ? document.getElementById('mktAdminSearch').value : '').toLowerCase();
  var stores = tryParse('afrib_seller_stores',{});
  var allListings = [];
  Object.values(stores).forEach(function(store){
    var listings = tryParse('afrib_listings_'+store.email,[]);
    listings.forEach(function(l){ allListings.push(Object.assign({},l,{storeName:store.name})); });
  });
  var list = q ? allListings.filter(function(l){ return (l.name||'').toLowerCase().includes(q)||(l.seller||'').toLowerCase().includes(q); }) : allListings;
  var tbody = document.getElementById('mktListingsBody');
  if (!tbody) return;
  tbody.innerHTML = list.length
    ? list.slice(0,200).map(function(p){
        var img = p.imageData
          ? '<img src="'+p.imageData+'" style="width:40px;height:40px;object-fit:cover;border-radius:6px"/>'
          : '<div style="width:40px;height:40px;border-radius:6px;background:var(--bg);display:flex;align-items:center;justify-content:center;font-size:20px">'+(p.emoji||'📦')+'</div>';
        var active = p.active!==false;
        return '<tr><td>'+img+'</td><td style="font-size:12px;font-weight:600">'+(p.name||'—')+'</td><td style="font-size:12px;color:var(--w60)">'+(p.seller||p.storeName||'—')+'</td><td style="color:var(--gold);font-weight:700">'+(p.price||'—')+'</td><td style="font-size:12px">'+(p.category||'—')+'</td><td><span class="badge '+(active?'g':'r')+'">'+(active?'Active':'Paused')+'</span></td><td style="font-size:11px;color:var(--w60)">'+(p.createdAt?new Date(p.createdAt).toLocaleDateString('en-GB'):'—')+'</td></tr>';
      }).join('')
    : '<tr><td colspan="7" style="text-align:center;color:var(--w60);padding:16px">No listings yet</td></tr>';
}


function udAction(btn, action) {
  var email = btn.getAttribute('data-em');
  if (!email) return;
  if (action === 'edit')    openEditUser(email);
  if (action === 'reset')   openResetPw(email);
  if (action === 'suspend') quickSuspend(email);
}

/* ===== ADS PANEL ===== */
let _adImageData = null;

function initAdsPanel() {
  const ads = tryParse('afrib_ads',[]);
  var statsEl = document.getElementById('adStats');
  if (statsEl) statsEl.innerHTML = [
    {icon:'📢',val:ads.length,label:'Total Ads'},
    {icon:'✅',val:ads.filter(a=>a.active!==false).length,label:'Active'},
    {icon:'👁',val:ads.reduce((s,a)=>s+(a.impressions||0),0).toLocaleString(),label:'Total Impressions'},
    {icon:'🖱',val:ads.reduce((s,a)=>s+(a.clicks||0),0).toLocaleString(),label:'Total Clicks'},
  ].map(s=>`<div class="stat-card"><div class="stat-icon">${s.icon}</div><div class="stat-val">${s.val}</div><div class="stat-label">${s.label}</div></div>`).join('');
  renderAdsTable();
}

function renderAdsTable() {
  var ads  = tryParse('afrib_ads',[]);
  var body = document.getElementById('adsBody');
  if (!body) return;
  body.innerHTML = ads.length ? ads.map(function(ad) {
    var ctr = ad.impressions > 0 ? ((ad.clicks||0)/ad.impressions*100).toFixed(1)+'%' : '--';
    var img = ad.imageData ? '<img src="'+ad.imageData+'" style="width:44px;height:44px;object-fit:cover;border-radius:6px"/>'
      : '<div style="width:44px;height:44px;border-radius:6px;background:var(--bg3);display:flex;align-items:center;justify-content:center;font-size:22px">'+(ad.emoji||'\u{1f4e2}')+'</div>';
    var activeBtn = ad.active!==false ? 'Pause' : 'Resume';
    var activeCls = ad.active!==false ? 'btn-red' : 'btn-g';
    return '<tr>'+
      '<td>'+img+'</td>'+
      '<td><strong>'+ad.title+'</strong><br><small style="color:var(--w60)">'+(ad.tagline||'')+'</small></td>'+
      '<td style="font-size:12px">'+ad.cta+'</td>'+
      '<td><span class="badge '+(ad.active!==false?'g':'r')+'">'+(ad.active!==false?'Active':'Paused')+'</span></td>'+
      '<td style="color:var(--w60)">'+(ad.impressions||0)+'</td>'+
      '<td style="color:var(--gold)">'+(ad.clicks||0)+'</td>'+
      '<td>'+ctr+'</td>'+
      '<td style="font-size:11px;color:var(--w60)">'+(ad.createdAt?new Date(ad.createdAt).toLocaleDateString('en-GB'):'--')+'</td>'+
      '<td><div class="btn-row">'+
        '<button class="btn btn-b" data-adid="'+ad.id+'" onclick="editAd(this.dataset.adid)">Edit</button>'+
        '<button class="btn '+activeCls+'" data-adid="'+ad.id+'" onclick="toggleAd(this.dataset.adid)">'+activeBtn+'</button>'+
        '<button class="btn btn-red" data-adid="'+ad.id+'" onclick="deleteAd(this.dataset.adid)">Del</button>'+
      '</div></td>'+
    '</tr>';
  }).join('') : '<tr><td colspan="9" style="text-align:center;color:var(--w60);padding:20px">No ads yet.</td></tr>';
}

function openCreateAd() {
  _adImageData = null;
  document.getElementById('adTitle').value   = '';
  document.getElementById('adTagline').value = '';
  document.getElementById('adCta').value     = 'Shop Now';
  document.getElementById('adUrl').value     = '';
  document.getElementById('adEmoji').value   = '📢';
  document.getElementById('adStatus').value  = 'active';
  document.getElementById('adEditId').value  = '';
  document.getElementById('adImgPreview').innerHTML = '<span style="color:var(--w60);font-size:13px">📷 Upload image</span>';
  document.getElementById('createAdTitle').textContent = '📢 Create New Ad';
  document.getElementById('createAdModal').style.display = 'flex';
}

function editAd(adId) {
  var ads = tryParse('afrib_ads',[]);
  var ad  = ads.find(function(a){return a.id===adId;});
  if (!ad) return;
  _adImageData = ad.imageData || null;
  document.getElementById('adTitle').value   = ad.title   || '';
  document.getElementById('adTagline').value = ad.tagline || '';
  document.getElementById('adCta').value     = ad.cta     || 'Shop Now';
  document.getElementById('adUrl').value     = ad.url     || '';
  document.getElementById('adEmoji').value   = ad.emoji   || '📢';
  document.getElementById('adStatus').value  = ad.active!==false ? 'active' : 'paused';
  document.getElementById('adEditId').value  = adId;
  document.getElementById('createAdTitle').textContent = '✏️ Edit Ad';
  if (_adImageData) document.getElementById('adImgPreview').innerHTML = '<img src="'+_adImageData+'" style="width:100%;height:100%;object-fit:cover"/>';
  document.getElementById('createAdModal').style.display = 'flex';
}

function handleAdImageUpload(input) {
  var file = input.files && input.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    _adImageData = e.target.result;
    document.getElementById('adImgPreview').innerHTML = '<img src="'+_adImageData+'" style="width:100%;height:100%;object-fit:cover"/>';
  };
  reader.readAsDataURL(file);
}

function saveAd() {
  var title   = document.getElementById('adTitle').value.trim();
  var tagline = document.getElementById('adTagline').value.trim();
  var cta     = document.getElementById('adCta').value.trim() || 'Shop Now';
  var url     = document.getElementById('adUrl').value.trim();
  var emoji   = document.getElementById('adEmoji').value.trim() || '📢';
  var status  = document.getElementById('adStatus').value;
  var editId  = document.getElementById('adEditId').value;

  if (!title) { showToastA('⚠️ Ad title is required'); return; }

  var ads = tryParse('afrib_ads',[]);
  if (editId) {
    var idx = ads.findIndex(function(a){return a.id===editId;});
    if (idx > -1) ads[idx] = Object.assign(ads[idx],{title,tagline,cta,url,emoji,imageData:_adImageData||ads[idx].imageData,active:status==='active'});
  } else {
    ads.push({id:'ad_'+Date.now(),title,tagline,cta,url,emoji,imageData:_adImageData||null,active:status==='active',impressions:0,clicks:0,createdAt:new Date().toISOString()});
  }
  localStorage.setItem('afrib_ads', JSON.stringify(ads));
  document.getElementById('createAdModal').style.display = 'none';
  renderAdsTable();
  initAdsPanel();
  showToastA('✅ Ad '+(editId?'updated':'created')+'!');
  appendLog('admin', currentAdmin, (editId?'Updated':'Created')+' ad: '+title);
}

function toggleAd(adId) {
  var ads = tryParse('afrib_ads',[]);
  var ad  = ads.find(function(a){return a.id===adId;});
  if (ad) { ad.active = !ad.active; localStorage.setItem('afrib_ads',JSON.stringify(ads)); renderAdsTable(); showToastA(ad.active?'Ad resumed':'Ad paused'); }
}

function deleteAd(adId) {
  if (!confirm('Delete this ad?')) return;
  var ads = tryParse('afrib_ads',[]).filter(function(a){return a.id!==adId;});
  localStorage.setItem('afrib_ads', JSON.stringify(ads));
  renderAdsTable(); initAdsPanel();
  showToastA('Ad deleted');
}

/* ===== YOURSTYLE FEED PANEL ===== */
function initFeedPanel() {
  var posts = tryParse('afrib_style_posts',[]);
  var statsEl = document.getElementById('feedStats');
  if (statsEl) {
    var totalLikes = posts.reduce(function(s,p){return s+(tryParse('afrib_style_likes_'+p.id,[]).length);},0);
    statsEl.innerHTML = [
      {icon:'✨',val:posts.length,label:'Total Posts'},
      {icon:'❤️',val:totalLikes.toLocaleString(),label:'Total Likes'},
      {icon:'👤',val:[...new Set(posts.map(function(p){return p.authorEmail;}))].length,label:'Active Creators'},
    ].map(function(s){return '<div class="stat-card"><div class="stat-icon">'+s.icon+'</div><div class="stat-val">'+s.val+'</div><div class="stat-label">'+s.label+'</div></div>';}).join('');
  }
  filterFeedAdmin();
}

function filterFeedAdmin() {
  var q   = (document.getElementById('feedSearch')?document.getElementById('feedSearch').value:'').toLowerCase();
  var cat = document.getElementById('feedCatFilter')?document.getElementById('feedCatFilter').value:'';
  var posts = tryParse('afrib_style_posts',[]);
  if (q) posts = posts.filter(function(p){return ((p.caption||'')+(p.authorFirst||'')+(p.authorLast||'')).toLowerCase().includes(q);});
  if (cat) posts = posts.filter(function(p){return p.category===cat;});
  var body = document.getElementById('feedBody');
  if (!body) return;
  body.innerHTML = posts.length ? posts.slice(0,100).map(function(p){
    var likes    = tryParse('afrib_style_likes_'+p.id,[]).length;
    var comments = tryParse('afrib_style_comments_'+p.id,[]).length;
    var img = p.imageData ? '<img src="'+p.imageData+'" style="width:44px;height:44px;object-fit:cover;border-radius:6px"/>' : '<div style="width:44px;height:44px;border-radius:6px;background:var(--bg3);display:flex;align-items:center;justify-content:center">📷</div>';
    return '<tr>'+
      '<td>'+img+'</td>'+
      '<td style="font-size:12px">'+( p.authorFirst||'')+ ' '+(p.authorLast||'')+'<br><small style="color:var(--w60)">'+(p.authorEmail||'')+'</small></td>'+
      '<td style="font-size:12px">'+(p.category||'—')+'</td>'+
      '<td style="font-size:12px;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+( p.caption||'—')+'</td>'+
      '<td style="color:#ef4444">❤️ '+likes+'</td>'+
      '<td style="color:var(--w60)">💬 '+comments+'</td>'+
      '<td style="font-size:11px;color:var(--w60)">'+(p.createdAt?new Date(p.createdAt).toLocaleDateString('en-GB'):'—')+'</td>'+
      '<td><button class="btn btn-red" data-pid="'+p.id+'" onclick="adminDeletePost(this.dataset.pid)">🗑 Remove</button></td>'+
    '</tr>';
  }).join('') : '<tr><td colspan="8" style="text-align:center;color:var(--w60);padding:20px">No posts yet</td></tr>';
}

function adminDeletePost(postId) {
  if (!confirm('Remove this post?')) return;
  var posts = tryParse('afrib_style_posts',[]).filter(function(p){return p.id!==postId;});
  localStorage.setItem('afrib_style_posts', JSON.stringify(posts));
  filterFeedAdmin(); initFeedPanel();
  showToastA('Post removed');
  appendLog('admin',currentAdmin,'Removed YourStyle post',postId);
}

</script>

<script>
/* ── Session Expiry Guard (8 hours) ── */
(function checkAdminSession() {
  try {
    var session = JSON.parse(localStorage.getItem('admin_session') || 'null');
    var app = document.getElementById('adminApp');
    if (session && app && app.style.display !== 'none') {
      var age = Date.now() - new Date(session.time).getTime();
      if (age > 8 * 3600 * 1000) {
        localStorage.removeItem('admin_session');
        app.style.display = 'none';
        document.getElementById('adminLogin').style.display = 'flex';
        alert('Your admin session expired. Please log in again.');
      }
    }
    // Check every 5 minutes
    setInterval(checkAdminSession, 5 * 60 * 1000);
  } catch(e) {}
})();

/* ── Failed Attempt Counter Display ── */
(function trackAdminAttempts() {
  var failCount = 0;
  var MAX_ATTEMPTS = 5;
  var LOCK_MS = 15 * 60 * 1000;
  var lockKey = 'admin_lockout_v2';

  function getLockout() {
    try { return JSON.parse(localStorage.getItem(lockKey) || 'null'); } catch(e) { return null; }
  }

  // Check on page load
  var lockout = getLockout();
  if (lockout && lockout.count >= MAX_ATTEMPTS) {
    var elapsed = Date.now() - lockout.time;
    if (elapsed < LOCK_MS) {
      var banner = document.getElementById('loginLockoutBanner');
      if (banner) banner.style.display = 'block';
    }
  }

  // Override doAdminLogin to track fails
  var _origDoAdminLogin = window.doAdminLogin;
  window.doAdminLogin = function() {
    var lockout = getLockout();
    if (lockout && lockout.count >= MAX_ATTEMPTS) {
      var elapsed = Date.now() - lockout.time;
      if (elapsed < LOCK_MS) {
        var mins = Math.ceil((LOCK_MS - elapsed) / 60000);
        var errEl = document.getElementById('loginErr');
        if (errEl) {
          errEl.textContent = '🔒 Locked out. Try again in ' + mins + ' min' + (mins > 1 ? 's' : '') + '.';
          errEl.style.display = 'block';
        }
        return;
      } else {
        localStorage.removeItem(lockKey);
      }
    }
    if (_origDoAdminLogin) _origDoAdminLogin.apply(this, arguments);
  };
})();

/* ══════════════════════════════════════════════════════
   ADMIN PANEL ENHANCEMENTS v6.0
   - System health indicator
   - Enhanced user search with live filtering
   - Export to CSV
   - Activity heatmap
   - Quick action shortcuts
══════════════════════════════════════════════════════ */

/* System Health Check */
function checkSystemHealth() {
  try {
    const users   = getUsers();
    const total   = users.length;
    const active7 = users.filter(u => {
      if (!u.lastLogin) return false;
      return (Date.now() - new Date(u.lastLogin).getTime()) < 7 * 86400000;
    }).length;
    const suspended = users.filter(u => u.status === 'suspended').length;
    const coins  = users.reduce((s,u) => s + (parseInt(localStorage.getItem('afrib_coins_'+u.email)||0)), 0);
    const storage = (() => {
      try {
        let total = 0;
        for (let k in localStorage) {
          if (localStorage.hasOwnProperty(k)) total += (localStorage.getItem(k)||'').length;
        }
        return (total / 1024).toFixed(1) + ' KB';
      } catch(e) { return 'N/A'; }
    })();

    const el = document.getElementById('sysHealthGrid');
    if (!el) return;
    el.innerHTML = [
      { icon:'👥', val: total,      label:'Total Users',    color:'#22c55e' },
      { icon:'⚡', val: active7,    label:'Active (7d)',    color:'#3b82f6' },
      { icon:'🚫', val: suspended,  label:'Suspended',      color:'#ef4444' },
      { icon:'🪙', val: coins.toLocaleString(), label:'Coins Circulating', color:'#FFD700' },
      { icon:'💾', val: storage,    label:'Storage Used',   color:'#a78bfa' },
    ].map(s => `
      <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:12px;text-align:center">
        <div style="font-size:20px">${s.icon}</div>
        <div style="font-size:18px;font-weight:900;color:${s.color};margin:4px 0">${s.val}</div>
        <div style="font-size:10px;color:rgba(255,255,255,.45);font-weight:600">${s.label}</div>
      </div>`).join('');
  } catch(e) { console.error('checkSystemHealth:', e); }
}

/* Enhanced Live User Search */
function adminLiveSearch(query) {
  query = (query || '').toLowerCase().trim();
  const users = getUsers();
  const rows  = document.querySelectorAll('#usersTable tbody tr');
  let visible = 0;
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    const show = !query || text.includes(query);
    row.style.display = show ? '' : 'none';
    if (show) visible++;
  });
  const countEl = document.getElementById('userSearchCount');
  if (countEl) countEl.textContent = query ? `${visible} result${visible !== 1 ? 's' : ''}` : '';
}

/* Export game stats to CSV */
function exportGameStatsCSV() {
  try {
    const users = getUsers();
    const rows  = [['Player','Email','Games Played','Wins','Losses','Win Rate','XP','Level','Coins Won']];
    users.forEach(u => {
      const prog = tryParse('afrib_ludo_' + u.email, {});
      const s    = prog.stats || {};
      const gp   = s.gamesPlayed || 0;
      const w    = s.wins || 0;
      const wr   = gp > 0 ? Math.round(w/gp*100) + '%' : '0%';
      rows.push([
        `${u.first||''} ${u.last||''}`.trim(),
        u.email,
        gp, w, s.losses||0, wr, s.xp||0, s.level||1, s.coinsWon||0
      ]);
    });
    const csv  = rows.map(r => r.join(',')).join('
');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `afribconnect_game_stats_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToastA('✅ Game stats CSV exported!');
  } catch(e) { showToastA('❌ Export failed: ' + e.message); }
}

/* Quick coin grant/revoke */
function adminGrantCoins(email, amount) {
  if (!email || !amount) return;
  try {
    const key     = 'afrib_coins_' + email;
    const current = parseInt(localStorage.getItem(key) || '0');
    const newAmt  = Math.max(0, current + parseInt(amount));
    localStorage.setItem(key, newAmt);
    appendLog('admin', currentAdmin, `${amount > 0 ? 'Granted' : 'Deducted'} ${Math.abs(amount)} coins`, 'User: ' + email + ' | New balance: ' + newAmt);
    showToastA(`✅ Coins updated for ${email}: ${current} → ${newAmt}`);
    return newAmt;
  } catch(e) { showToastA('❌ ' + e.message); }
}

/* Bulk suspend/unsuspend */
function adminBulkAction(action, emails) {
  if (!emails || !emails.length) { showToastA('No users selected'); return; }
  if (!confirm(`${action} ${emails.length} user(s)?`)) return;
  try {
    const accounts = getAccounts();
    emails.forEach(email => {
      if (accounts[email]) {
        accounts[email].status = action === 'suspend' ? 'suspended' : 'active';
      }
    });
    saveAccounts(accounts);
    appendLog('admin', currentAdmin, `Bulk ${action}: ${emails.length} users`);
    showToastA(`✅ ${emails.length} user(s) ${action}ed`);
    if (typeof renderUsers === 'function') renderUsers();
  } catch(e) { showToastA('❌ ' + e.message); }
}

/* Inject system health grid if panel exists */
(function injectSysHealth() {
  const tryIn = () => {
    const dash = document.getElementById('panel-dashboard');
    if (!dash || document.getElementById('sysHealthGrid')) return;
    const div = document.createElement('div');
    div.style.cssText = 'margin-bottom:16px';
    div.innerHTML = `
      <div style="font-size:12px;color:rgba(255,255,255,.45);font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">⚙️ System Health</div>
      <div id="sysHealthGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px"></div>`;
    dash.insertBefore(div, dash.firstChild);
    checkSystemHealth();
  };
  setTimeout(tryIn, 500);
  setTimeout(tryIn, 2000);
})();

/* Keyboard shortcut: Ctrl+K = focus user search */
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    const search = document.getElementById('userSearchInput') || document.querySelector('[placeholder*="Search user"]');
    if (search) { search.focus(); search.select(); }
  }
});

</script>
<script src="storage_bridge.js"></script>
<script src="email_config.js"></script>
<script src="giftme_diamonds.js"></script>
<script src="improvements.js"></script>
<script src="admin_patch.js"></script>
<script src="afribconnect_masterfix.js"></script>
<script src="master_integration.js"></script>
<script src="afrib_v28_3_complete.js"></script>
<script src="afrib_v31_security.js"></script>
<script src="afrib_v35_unified.js"></script>
<script src="afrib_ludo_skins.js"></script>
<script src="afrib_v36_sync.js" defer>
/* ─── Live Stream Admin Functions ─── */
function adminSaveLiveSlots() {
  const range = document.getElementById('liveSlotRange');
  const val = Math.max(1, Math.min(10, range ? parseInt(range.value) : 4));
  localStorage.setItem('afrib_live_slots', val);
  // Sync with live_settings blob too
  try {
    const ls = JSON.parse(localStorage.getItem('afrib_live_settings') || '{}');
    ls.maxSlots = val;
    localStorage.setItem('afrib_live_settings', JSON.stringify(ls));
  } catch(e) {}
  const status = document.getElementById('liveSlotStatus');
  if (status) {
    status.textContent = '✅ Saved! Users will see ' + val + ' live box' + (val>1?'es':'') + ' on YourStyle.';
    status.style.color = '#22c55e';
    setTimeout(() => { status.textContent = ''; }, 4000);
  }
  _updateLiveSlotPreview(val);
  if (typeof appendLog === 'function') appendLog('admin', currentAdmin, 'Set live stream boxes to ' + val, '');
  if (typeof showToastA === 'function') showToastA('✅ Live: ' + val + ' stream box' + (val>1?'es':'') + ' active');
}

function _updateLiveSlotPreview(n) {
  const preview = document.getElementById('liveSlotPreview');
  if (!preview) return;
  const cols = n <= 2 ? n : n <= 4 ? 2 : n <= 6 ? 3 : n <= 9 ? 3 : 5;
  preview.style.gridTemplateColumns = 'repeat(' + cols + ', 1fr)';
  preview.style.maxHeight = n > 6 ? '90px' : '60px';
  let html = '';
  for (let i=0; i<n; i++) {
    const isActive = i < 2;
    const bg = isActive ? 'rgba(255,71,87,.2)' : 'rgba(255,255,255,.05)';
    const border = isActive ? '1px dashed rgba(255,71,87,.4)' : '1px dashed rgba(255,255,255,.1)';
    const icon = i===0 ? '🔴' : i===1 ? '📡' : '📡';
    const label = isActive ? (i===0?'LIVE':'LIVE 2') : 'SLOT '+(i+1);
    html += '<div style="aspect-ratio:9/16;background:' + bg + ';border:' + border + ';border-radius:6px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px">'
          + '<span style="font-size:12px">' + icon + '</span>'
          + '<span style="font-size:7px;color:rgba(255,255,255,.3);font-weight:700">' + label + '</span>'
          + '</div>';
  }
  preview.innerHTML = html;

  // Update slot count badge
  const badge = document.getElementById('liveSlotBadge');
  if (badge) badge.textContent = n + ' box' + (n>1?'es':'') + ' visible';
}

function adminLoadLiveSettings() {
  const saved = Math.max(1, Math.min(10, parseInt(localStorage.getItem('afrib_live_slots') || '4')));
  const range = document.getElementById('liveSlotRange');
  const valEl = document.getElementById('liveSlotVal');
  const badge = document.getElementById('liveSlotBadge');
  if (range) range.value = saved;
  if (valEl) valEl.textContent = saved;
  if (badge) badge.textContent = saved + ' box' + (saved>1?'es':'') + ' visible';
  _updateLiveSlotPreview(saved);
}

// Hook into settings panel open
(function() {
  const origInit = window.initSettings;
  window.initSettings = function() {
    if (typeof origInit === 'function') origInit.apply(this, arguments);
    setTimeout(adminLoadLiveSettings, 100);
  };
})();

// Also load on panel switch — hook with delay to allow goPanel to be defined
(function _hookGoPanel() {
  const _try = (attempts) => {
    if (attempts > 20) return;
    if (typeof window.goPanel !== 'function') {
      setTimeout(() => _try(attempts + 1), 300); return;
    }
    const orig = window.goPanel;
    if (orig._livePanelPatched) return;
    window.goPanel = function(btn, panel) {
      orig.apply(this, arguments);
      if (panel === 'settings') setTimeout(adminLoadLiveSettings, 200);
    };
    window.goPanel._livePanelPatched = true;
  };
  _try(0);
})();

</script>
<script src="afrib_market_config.js"></script><!-- Marketplace config for admin panel -->
<script src="afrib_database.js"></script>
<script src="afrib_config_upgrade.js"></script>
<script src="admin_v92_upgrade.js"></script>
<script src="admin_v93_algorithm.js"></script>
</body>
</html>
<script>
/* ── Analytics Panel ── */
function initAnalytics() {
  const analytics = tryParse('afrib_analytics', []);
  const users = getUsers();
  const datingProfiles = tryParse('afrib_dating_profiles', {});
  const referrals = tryParse('afrib_referrals', []);
  const streak7 = users.filter(u => {
    const s = tryParse('afrib_daily_' + u.email, {streak:0});
    return (s.streak||0) >= 7;
  }).length;

  document.getElementById('analyticsStats').innerHTML = [
    {icon:'📊', val:analytics.length, label:'Tracked Events (consenting users)'},
    {icon:'💕', val:Object.keys(datingProfiles).length, label:'AfriMatch Profiles'},
    {icon:'🎁', val:referrals.length, label:'Referral Signups'},
    {icon:'🔥', val:streak7, label:'Users with 7+ Day Streak'},
    {icon:'🍪', val:users.filter(u=>localStorage.getItem('afrib_cookie_consent')==='all').length||0, label:'Analytics Consent Granted'},
  ].map(s=>`<div class="stat-card"><div class="stat-icon">${s.icon}</div><div class="stat-val">${s.val}</div><div class="stat-label">${s.label}</div></div>`).join('');

  // Event breakdown
  const evCount = {};
  analytics.forEach(e => { evCount[e.event]=(evCount[e.event]||0)+1; });
  const top = Object.entries(evCount).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const maxE = top[0]?.[1]||1;
  document.getElementById('analyticsEventBreakdown').innerHTML = top.length
    ? top.map(([ev,n]) => `<div style="margin-bottom:8px">
        <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px"><span>${ev}</span><span style="color:var(--gold)">${n}</span></div>
        <div class="prog-bar"><div class="prog-fill" style="width:${(n/maxE)*100}%"></div></div>
      </div>`).join('')
    : '<div style="color:var(--w60);font-size:13px">No analytics data yet. Users must accept cookies.</div>';

  // User engagement
  const consent = users.filter(u => localStorage.getItem('afrib_cookie_consent')).length;
  document.getElementById('analyticsEngagement').innerHTML = [
    {label:'Cookie consent rate', val: users.length ? Math.round(consent/users.length*100)+'%' : '0%'},
    {label:'Avg daily reward streak', val: users.length ? Math.round(users.reduce((s,u)=>{const d=tryParse('afrib_daily_'+u.email,{streak:0});return s+(d.streak||0);},0)/users.length)+'d' : '0d'},
    {label:'Users with AfriMatch', val: Object.keys(datingProfiles).length},
    {label:'Referrals made', val: referrals.length},
  ].map(s=>`<div style="display:flex;justify-content:space-between;font-size:13px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05)">
    <span style="color:var(--w60)">${s.label}</span><span style="font-weight:600">${s.val}</span>
  </div>`).join('');

  // Recent events table
  document.getElementById('analyticsTable').innerHTML = analytics.slice(0,50).map(e => `<tr>
    <td style="font-size:12px">${new Date(e.time).toLocaleString()}</td>
    <td><span class="badge ${e.event==='purchase'?'gold':e.event==='match'?'b':'g'}">${e.event}</span></td>
    <td style="font-size:12px;color:var(--w60)">${e.user||'anon'}</td>
    <td style="font-size:12px;color:var(--w60)">${e.value||'—'}</td>
  </tr>`).join('') || '<tr><td colspan="4" style="text-align:center;color:var(--w60);padding:16px">No analytics yet</td></tr>';
}

/* ── Broadcast Panel ── */
function initBroadcast() {
  const history = tryParse('afrib_broadcasts', []);
  const el = document.getElementById('bcastHistory');
  if (el) {
    el.innerHTML = history.length
      ? history.slice(0,10).map(b => `<div style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,.05)">
          <div style="font-size:13px;font-weight:600">${b.title}</div>
          <div style="font-size:11px;color:var(--w60);margin-top:2px">${b.body?.slice(0,60)}…</div>
          <div style="font-size:10px;color:var(--w30);margin-top:3px">${new Date(b.time).toLocaleString()} · ${b.sent||0} users</div>
        </div>`).join('')
      : '<div style="color:var(--w60);font-size:13px">No broadcasts sent yet</div>';
  }
}

function sendBroadcast() {
  const title    = document.getElementById('bcastTitle').value.trim();
  const body     = document.getElementById('bcastBody').value.trim();
  const audience = document.getElementById('bcastAudience').value;
  const type     = document.getElementById('bcastType').value;
  if (!title) { showToastA('⚠️ Enter a title'); return; }
  if (!body)  { showToastA('⚠️ Enter a message body'); return; }

  let users = getUsers();
  if (audience === 'active')    users = users.filter(u=>(u.status||'active')==='active');
  if (audience === 'dating')    users = users.filter(u=>u.hasDatingProfile);
  if (audience === 'noWallet')  users = users.filter(u=>!(u.linkedPayments||[]).length);

  // Write notification to each user's store
  let sent = 0;
  users.forEach(u => {
    try {
      const key = 'afrib_user_notifs'; // shared for demo; in prod = per-user key
      const notifs = tryParse('afrib_notifs_' + u.email, []);
      notifs.unshift({ id: Date.now()+sent, title, body, type, time: new Date().toISOString(), read: false });
      localStorage.setItem('afrib_notifs_' + u.email, JSON.stringify(notifs.slice(0,50)));
      sent++;
    } catch(e) {}
  });

  // Log broadcast
  const history = tryParse('afrib_broadcasts', []);
  history.unshift({ id: 'BC_'+Date.now(), title, body, message: body, type, audience, sent, active: true, sentAt: new Date().toISOString(), time: new Date().toISOString(), admin: currentAdmin, sentBy: currentAdmin });
  localStorage.setItem('afrib_broadcasts', JSON.stringify(history.slice(0,50)));

  appendLog('admin', currentAdmin, `Broadcast sent: "${title}"`, `${sent} users, audience: ${audience}`);
  document.getElementById('bcastTitle').value = '';
  document.getElementById('bcastBody').value  = '';
  initBroadcast();
  showToastA(`✅ Broadcast sent to ${sent} users!`);
}

function sendAirdrop() {
  const amount  = parseInt(document.getElementById('airdropAmount').value)||10;
  const target  = document.getElementById('airdropTarget').value;
  const reason  = document.getElementById('airdropReason').value.trim()||'Admin bonus';
  let users     = getUsers();
  if (target === 'top10') users = [...users].sort((a,b)=>{const ca=parseInt(localStorage.getItem('afrib_coins_'+a.email)||'0'),cb=parseInt(localStorage.getItem('afrib_coins_'+b.email)||'0');return cb-ca;}).slice(0,10);
  if (target === 'newToday') users = users.filter(u=>new Date(u.createdAt||0).toDateString()===new Date().toDateString());

  let count = 0;
  users.forEach(u => {
    const curr = parseInt(localStorage.getItem('afrib_coins_'+u.email)||'0');
    localStorage.setItem('afrib_coins_'+u.email, curr+amount);
    count++;
  });

  appendLog('admin', currentAdmin, `Coin airdrop: +${amount} to ${count} users`, reason);
  showToastA(`✅ Airdropped 🪙${amount} to ${count} users!`);
}

/* ══════════════════════════════════════════════════
   💬 MESSAGING MONITOR
══════════════════════════════════════════════════ */
let _allMsgs = [];
let _selectedMsgIds = new Set();
let _currentConvoKey = null;

function initMessaging() {
  try {
    _allMsgs = _gatherAllMessages();
    _renderMsgStats();
    _renderMsgTable(_allMsgs);
  } catch(e) { console.error('initMessaging error:', e); showToastA('⚠️ Messaging panel error: ' + e.message); }
}

function _gatherAllMessages() {
  const msgs = [];
  try {
    // DM messages stored per conversation key in localStorage
    const accounts = _safeGetAccounts();
    const emails = Object.keys(accounts);
    const seen = new Set();
    emails.forEach(e1 => {
      emails.forEach(e2 => {
        if (e1 >= e2) return;
        const key = 'afrib_dm_' + [e1,e2].sort().join('_');
        if (seen.has(key)) return;
        seen.add(key);
        try {
          const raw = localStorage.getItem(key);
          if (!raw) return;
          const thread = JSON.parse(raw);
          if (!Array.isArray(thread)) return;
          thread.forEach((m, idx) => {
            msgs.push({
              id: key + '_' + idx,
              convoKey: key,
              from: m.from || e1,
              to: m.from === e1 ? e2 : e1,
              text: m.text || '',
              image: !!m.image,
              ts: m.ts || m.time || 0,
              flagged: !!(m.flagged),
              idx
            });
          });
        } catch(_) {}
      });
    });
    // Also check afrib_dating_messages
    try {
      const dating = JSON.parse(localStorage.getItem('afrib_dating_messages') || '{}');
      Object.entries(dating).forEach(([k, thread]) => {
        if (!Array.isArray(thread)) return;
        thread.forEach((m, idx) => {
          msgs.push({
            id: 'dating_' + k + '_' + idx,
            convoKey: 'dating_' + k,
            from: m.from || '?',
            to: '?',
            text: m.text || '',
            image: !!m.img || !!m.image,
            ts: m.ts || 0,
            flagged: false,
            idx,
            isDating: true
          });
        });
      });
    } catch(_) {}
  } catch(e) { console.error('_gatherAllMessages:', e); }
  return msgs.sort((a,b) => b.ts - a.ts);
}

function _renderMsgStats() {
  try {
    const total = _allMsgs.length;
    const flagged = _allMsgs.filter(m => m.flagged).length;
    const media = _allMsgs.filter(m => m.image).length;
    const today = _allMsgs.filter(m => Date.now() - m.ts < 86400000).length;
    document.getElementById('msgStats').innerHTML = `
      <div class="stat-card"><div class="stat-icon">💬</div><div class="stat-val">${total}</div><div class="stat-label">Total Messages</div></div>
      <div class="stat-card"><div class="stat-icon">🚩</div><div class="stat-val">${flagged}</div><div class="stat-label">Flagged</div></div>
      <div class="stat-card"><div class="stat-icon">📷</div><div class="stat-val">${media}</div><div class="stat-label">Media Shared</div></div>
      <div class="stat-card"><div class="stat-icon">🕐</div><div class="stat-val">${today}</div><div class="stat-label">Last 24h</div></div>`;
  } catch(e) { console.error('_renderMsgStats:', e); }
}

function filterMsgs() {
  try {
    const q = (document.getElementById('msgSearch')?.value || '').toLowerCase();
    const f = document.getElementById('msgFilter')?.value || '';
    let msgs = _allMsgs;
    if (q) msgs = msgs.filter(m => m.from.toLowerCase().includes(q) || m.to.toLowerCase().includes(q) || m.text.toLowerCase().includes(q));
    if (f === 'flagged') msgs = msgs.filter(m => m.flagged);
    if (f === 'media')   msgs = msgs.filter(m => m.image);
    if (f === 'recent')  msgs = msgs.filter(m => Date.now() - m.ts < 86400000);
    _renderMsgTable(msgs);
  } catch(e) { console.error('filterMsgs:', e); }
}

function _renderMsgTable(msgs) {
  try {
    const tbody = document.getElementById('msgBody');
    if (!tbody) return;
    if (!msgs.length) { tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--w60);padding:24px">No messages found</td></tr>'; return; }
    tbody.innerHTML = msgs.slice(0, 200).map(m => `
      <tr>
        <td><input type="checkbox" class="msg-chk" data-id="${m.id}" onchange="_trackMsgSelect(this)" style="accent-color:var(--gold)"/></td>
        <td style="font-size:12px">${_escH(m.from.split('@')[0])}</td>
        <td style="font-size:12px">${_escH(m.to.split('@')[0])}</td>
        <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px">
          ${m.image ? '📷 <em style="color:var(--w60)">Image</em>' : _escH(m.text.slice(0,80))}
        </td>
        <td>${m.isDating ? '<span class="badge b">Dating</span>' : '<span class="badge gold">DM</span>'} ${m.image ? '<span class="badge g">Media</span>' : ''}</td>
        <td style="font-size:11px;color:var(--w60)">${m.ts ? new Date(m.ts).toLocaleString() : '—'}</td>
        <td>${m.flagged ? '<span class="badge r">Flagged</span>' : '<span class="badge g">Clear</span>'}</td>
        <td>
          <div class="btn-row">
            <button class="btn btn-ghost" style="font-size:11px;padding:4px 8px" onclick="viewConvo('${m.convoKey}','${_escH(m.from)}','${_escH(m.to)}')">👁 View</button>
            <button class="btn btn-red" style="font-size:11px;padding:4px 8px" onclick="deleteMsg('${m.id}')">🗑</button>
            <button class="btn ${m.flagged?'btn-g':'btn-red'}" style="font-size:11px;padding:4px 8px" onclick="toggleFlag('${m.id}')">${m.flagged?'✅':'🚩'}</button>
          </div>
        </td>
      </tr>`).join('');
  } catch(e) { console.error('_renderMsgTable:', e); }
}

function _trackMsgSelect(cb) {
  if (cb.checked) _selectedMsgIds.add(cb.dataset.id);
  else _selectedMsgIds.delete(cb.dataset.id);
}
function toggleSelectAllMsgs(cb) {
  document.querySelectorAll('.msg-chk').forEach(c => { c.checked = cb.checked; _trackMsgSelect(c); });
}

function viewConvo(convoKey, from, to) {
  try {
    _currentConvoKey = convoKey;
    document.getElementById('convoTitle').textContent = `💬 Conversation`;
    document.getElementById('convoSub').textContent = `${from} ↔ ${to}`;
    const thread = document.getElementById('convoThread');
    thread.innerHTML = '';
    let msgs = [];
    if (convoKey.startsWith('dating_')) {
      const dating = JSON.parse(localStorage.getItem('afrib_dating_messages') || '{}');
      const k = convoKey.replace('dating_', '');
      msgs = dating[k] || [];
    } else {
      msgs = JSON.parse(localStorage.getItem(convoKey) || '[]');
    }
    if (!msgs.length) { thread.innerHTML = '<div style="color:var(--w60);text-align:center;padding:20px">No messages in this conversation</div>'; }
    msgs.forEach(m => {
      const div = document.createElement('div');
      div.style.cssText = 'padding:8px 12px;border-radius:10px;background:var(--bg4);border:1px solid var(--border);font-size:13px';
      div.innerHTML = `<div style="font-size:11px;color:var(--gold);margin-bottom:4px;font-weight:700">${_escH(m.from||'?')} <span style="color:var(--w30);font-weight:400">${m.ts ? new Date(m.ts).toLocaleString() : ''}</span></div>
        ${m.image ? `<img src="${_escH(m.image)}" style="max-width:200px;border-radius:8px;margin-top:4px"/>` : ''}
        ${m.text ? `<div>${_escH(m.text)}</div>` : ''}`;
      thread.appendChild(div);
    });
    document.getElementById('convoModal').classList.add('open');
  } catch(e) { console.error('viewConvo:', e); showToastA('⚠️ Could not load conversation'); }
}

function deleteConvoFromModal() {
  if (!_currentConvoKey) return;
  if (!confirm('Delete this entire conversation? This cannot be undone.')) return;
  try {
    if (_currentConvoKey.startsWith('dating_')) {
      const dating = JSON.parse(localStorage.getItem('afrib_dating_messages') || '{}');
      delete dating[_currentConvoKey.replace('dating_', '')];
      localStorage.setItem('afrib_dating_messages', JSON.stringify(dating));
    } else {
      localStorage.removeItem(_currentConvoKey);
    }
    document.getElementById('convoModal').classList.remove('open');
    _allMsgs = _gatherAllMessages();
    _renderMsgTable(_allMsgs);
    _renderMsgStats();
    showToastA('✅ Conversation deleted');
    appendLog('admin', currentAdmin, `Deleted conversation: ${_currentConvoKey}`, 'moderation');
  } catch(e) { console.error('deleteConvoFromModal:', e); showToastA('⚠️ Delete failed'); }
}

function deleteMsg(id) {
  try {
    const msg = _allMsgs.find(m => m.id === id);
    if (!msg) return;
    if (!confirm('Delete this message?')) return;
    if (msg.isDating) {
      const dating = JSON.parse(localStorage.getItem('afrib_dating_messages') || '{}');
      const k = msg.convoKey.replace('dating_', '');
      if (dating[k]) { dating[k].splice(msg.idx, 1); localStorage.setItem('afrib_dating_messages', JSON.stringify(dating)); }
    } else {
      const thread = JSON.parse(localStorage.getItem(msg.convoKey) || '[]');
      thread.splice(msg.idx, 1);
      localStorage.setItem(msg.convoKey, JSON.stringify(thread));
    }
    _allMsgs = _gatherAllMessages();
    filterMsgs();
    showToastA('✅ Message deleted');
  } catch(e) { console.error('deleteMsg:', e); showToastA('⚠️ Delete failed: ' + e.message); }
}

function toggleFlag(id) {
  try {
    const msg = _allMsgs.find(m => m.id === id);
    if (!msg) return;
    const key = msg.isDating ? null : msg.convoKey;
    if (!key) { showToastA('Flagging dating messages coming soon'); return; }
    const thread = JSON.parse(localStorage.getItem(key) || '[]');
    if (thread[msg.idx]) { thread[msg.idx].flagged = !thread[msg.idx].flagged; localStorage.setItem(key, JSON.stringify(thread)); }
    _allMsgs = _gatherAllMessages();
    filterMsgs();
  } catch(e) { console.error('toggleFlag:', e); }
}

function deleteSelectedMsgs() {
  if (!_selectedMsgIds.size) { showToastA('Select messages first'); return; }
  if (!confirm(`Delete ${_selectedMsgIds.size} selected messages?`)) return;
  try {
    _selectedMsgIds.forEach(id => {
      const msg = _allMsgs.find(m => m.id === id);
      if (!msg) return;
      const thread = JSON.parse(localStorage.getItem(msg.convoKey) || '[]');
      if (thread[msg.idx]) thread.splice(msg.idx, 1);
      localStorage.setItem(msg.convoKey, JSON.stringify(thread));
    });
    _selectedMsgIds.clear();
    _allMsgs = _gatherAllMessages();
    filterMsgs();
    _renderMsgStats();
    showToastA('✅ Selected messages deleted');
  } catch(e) { console.error('deleteSelectedMsgs:', e); showToastA('⚠️ Error: ' + e.message); }
}

function exportMsgsCSV() {
  try {
    const rows = [['From','To','Message','Type','Timestamp','Flagged']];
    _allMsgs.forEach(m => rows.push([m.from, m.to, m.text.replace(/,/g,''), m.isDating?'Dating':'DM', m.ts?new Date(m.ts).toISOString():'', m.flagged?'Yes':'No']));
    _downloadCSV(rows, 'afrib_messages_' + _dateStamp());
    showToastA('✅ Messages exported');
  } catch(e) { console.error('exportMsgsCSV:', e); showToastA('⚠️ Export failed'); }
}

/* ══════════════════════════════════════════════════
   💾 BACKUP & RESTORE
══════════════════════════════════════════════════ */
let _backupLog = [];

function initBackup() {
  try {
    _backupLog = JSON.parse(localStorage.getItem('afrib_backup_log') || '[]');
    _refreshBackupStats();
    _renderBackupLog();
  } catch(e) { console.error('initBackup:', e); showToastA('⚠️ Backup panel error: ' + e.message); }
}

function _refreshBackupStats() {
  try {
    const users = Object.keys(_safeGetAccounts());
    const msgs = _gatherAllMessages();
    const txLog = JSON.parse(localStorage.getItem('sa_transaction_log') || '[]');
    const lastBkp = _backupLog.length ? new Date(_backupLog[0].ts).toLocaleString() : 'Never';
    const el = (id, v) => { const e = document.getElementById(id); if(e) e.textContent = v; };
    el('bkpUserCount', users.length);
    el('bkpMsgCount', msgs.length);
    el('bkpTxCount', txLog.length);
    el('bkpLastTime', lastBkp);
  } catch(e) { console.error('_refreshBackupStats:', e); }
}

function exportBackup(type) {
  try {
    let data, filename, mime;
    const accounts = _safeGetAccounts();
    const users = Object.values(accounts);

    switch(type) {
      case 'full': {
        // Collect all localStorage keys belonging to the app
        const snapshot = {};
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && (k.startsWith('afrib_') || k.startsWith('sa_') || k.startsWith('admin_'))) {
            try { snapshot[k] = JSON.parse(localStorage.getItem(k)); } catch(_) { snapshot[k] = localStorage.getItem(k); }
          }
        }
        data = JSON.stringify({ _meta: { exported: new Date().toISOString(), version: 'v4.0', type: 'full' }, ...snapshot }, null, 2);
        filename = 'afribconnect_full_backup_' + _dateStamp() + '.json';
        mime = 'application/json';
        break;
      }
      case 'users': {
        const rows = [['Email','Username','First','Last','Country','Joined','Wallet','Status']];
        users.forEach(u => rows.push([u.email||'',u.username||'',u.first||'',u.last||'',u.country||'', u.createdAt||'', u.walletBalance||0, u.banned?'Banned':'Active']));
        data = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
        filename = 'afribconnect_users_' + _dateStamp() + '.csv';
        mime = 'text/csv';
        break;
      }
      case 'transactions': {
        const txLog = JSON.parse(localStorage.getItem('sa_transaction_log') || '[]');
        const rows = [['ID','User','Type','Amount','Currency','Status','Date']];
        txLog.forEach(t => rows.push([t.id||'',t.user||'',t.type||'',t.amount||'',t.currency||'',t.status||'',t.date||'']));
        data = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
        filename = 'afribconnect_transactions_' + _dateStamp() + '.csv';
        mime = 'text/csv';
        break;
      }
      case 'messages': {
        const msgs = _gatherAllMessages();
        const rows = [['From','To','Message','Type','Timestamp','Flagged']];
        msgs.forEach(m => rows.push([m.from,m.to,m.text.replace(/"/g,"'"),m.isDating?'Dating':'DM',m.ts?new Date(m.ts).toISOString():'',m.flagged?'Yes':'No']));
        data = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
        filename = 'afribconnect_messages_' + _dateStamp() + '.csv';
        mime = 'text/csv';
        break;
      }
      case 'games': {
        const gameData = {};
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && (k.includes('ludo') || k.includes('snake') || k.includes('trivia') || k.includes('game'))) {
            try { gameData[k] = JSON.parse(localStorage.getItem(k)); } catch(_) { gameData[k] = localStorage.getItem(k); }
          }
        }
        data = JSON.stringify({ _meta: { exported: new Date().toISOString(), type: 'games' }, ...gameData }, null, 2);
        filename = 'afribconnect_games_' + _dateStamp() + '.json';
        mime = 'application/json';
        break;
      }
      case 'settings': {
        const settingsKeys = ['sa_settings','afrib_admin_tod','afrib_theme','afrib_maintenance','afrib_colors','afrib_brand_headline','afrib_brand_sub','afrib_ads','afrib_live_rates'];
        const settings = {};
        settingsKeys.forEach(k => { try { settings[k] = JSON.parse(localStorage.getItem(k)); } catch(_) { settings[k] = localStorage.getItem(k); } });
        data = JSON.stringify({ _meta: { exported: new Date().toISOString(), type: 'settings' }, ...settings }, null, 2);
        filename = 'afribconnect_settings_' + _dateStamp() + '.json';
        mime = 'application/json';
        break;
      }
      default: showToastA('Unknown backup type'); return;
    }

    // Trigger download
    const blob = new Blob([data], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    // Log the backup
    const entry = { ts: new Date().toISOString(), type, filename, size: _fmtBytes(data.length), records: type === 'users' ? Object.keys(_safeGetAccounts()).length : '—', status: 'Success' };
    _backupLog.unshift(entry);
    if (_backupLog.length > 50) _backupLog.length = 50;
    localStorage.setItem('afrib_backup_log', JSON.stringify(_backupLog));
    _renderBackupLog();
    _refreshBackupStats();
    showToastA(`✅ ${filename} downloaded to your device`);
    appendLog('admin', currentAdmin, `Data export: ${type} → ${filename}`, 'backup');
  } catch(e) { console.error('exportBackup:', e); showToastA('⚠️ Export failed: ' + e.message); }
}

function restoreBackup(input) {
  const file = input.files[0];
  if (!file) return;
  if (!confirm(`Restore from "${file.name}"? Existing data with matching keys will be overwritten.`)) { input.value=''; return; }
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const parsed = JSON.parse(e.target.result);
      let count = 0;
      Object.entries(parsed).forEach(([k, v]) => {
        if (k.startsWith('_')) return; // skip meta
        try { localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v)); count++; } catch(_) {}
      });
      const entry = { ts: new Date().toISOString(), type: 'restore', filename: file.name, size: _fmtBytes(file.size), records: count, status: 'Restored' };
      _backupLog.unshift(entry);
      localStorage.setItem('afrib_backup_log', JSON.stringify(_backupLog));
      _renderBackupLog();
      _refreshBackupStats();
      showToastA(`✅ Restored ${count} keys from ${file.name}`);
      appendLog('admin', currentAdmin, `Data restored from: ${file.name} (${count} keys)`, 'restore');
    } catch(err) { showToastA('⚠️ Restore failed — invalid JSON: ' + err.message); }
  };
  reader.onerror = () => showToastA('⚠️ Could not read file');
  reader.readAsText(file);
  input.value = '';
}

function scheduleAutoBackup() {
  showToastA('⏰ Auto-backup set — next backup in 24h (simulated in localStorage)');
  localStorage.setItem('afrib_auto_backup_scheduled', new Date(Date.now() + 86400000).toISOString());
}

function clearDataConfirm(what) {
  const labels = { messages: 'ALL messages (DMs and dating)', gamedata: 'ALL game data (scores, stats, owned items)' };
  const label = labels[what] || what;
  if (!confirm(`⚠️ WARNING: This will permanently delete ${label}.\n\nThis CANNOT be undone. Are you absolutely sure?`)) return;
  if (!confirm(`Final confirmation: Delete ${label}?`)) return;
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      if (what === 'messages' && (k.startsWith('afrib_dm_') || k === 'afrib_dating_messages')) keysToRemove.push(k);
      if (what === 'gamedata' && (k.includes('ludo') || k.includes('snake') || k.includes('trivia') || k.includes('_coins_') || k.includes('_dice_'))) keysToRemove.push(k);
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
    showToastA(`✅ Deleted ${keysToRemove.length} ${what} records`);
    appendLog('admin', currentAdmin, `DANGER: Cleared ${what} data — ${keysToRemove.length} keys removed`, 'danger');
    initBackup();
  } catch(e) { console.error('clearDataConfirm:', e); showToastA('⚠️ Clear failed: ' + e.message); }
}

function _renderBackupLog() {
  try {
    const tbody = document.getElementById('backupLogBody');
    if (!tbody) return;
    if (!_backupLog.length) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--w60);padding:20px">No backups yet — create your first backup above</td></tr>';
      return;
    }
    tbody.innerHTML = _backupLog.slice(0, 30).map(b => `
      <tr>
        <td style="font-size:12px">${new Date(b.ts).toLocaleString()}</td>
        <td><span class="badge ${b.type==='restore'?'b':'gold'}">${b.type}</span></td>
        <td style="font-size:12px">${b.size}</td>
        <td style="font-size:12px">${b.records}</td>
        <td><span class="badge g">${b.status}</span></td>
        <td style="font-size:12px;color:var(--w60)">${b.filename||'—'}</td>
      </tr>`).join('');
  } catch(e) { console.error('_renderBackupLog:', e); }
}

/* ══════════════════════════════════════════════════
   🛠 SHARED UTILITIES (Error-safe)
══════════════════════════════════════════════════ */
function _safeGetAccounts() {
  try { return JSON.parse(localStorage.getItem('afrib_accounts') || '{}'); } catch(e) { return {}; }
}
function _escH(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function _dateStamp() { return new Date().toISOString().slice(0,10); }
function _fmtBytes(b) {
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b/1024).toFixed(1) + ' KB';
  return (b/1048576).toFixed(2) + ' MB';
}
function _downloadCSV(rows, name) {
  const csv = rows.map(r => r.map(c => `"${String(c||'').replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download=name+'.csv'; a.click();
  setTimeout(()=>URL.revokeObjectURL(url), 1000);
}

/* ══════════════════════════════════════════════════
   🌐 GLOBAL ERROR HANDLER (Admin Panel)
══════════════════════════════════════════════════ */
window.addEventListener('error', e => {
  console.error('[Admin Global Error]', e.message, e.filename, e.lineno);
  // Only show toast for non-trivial errors
  if (e.message && !e.message.includes('Script error')) {
    showToastA('⚠️ JS Error: ' + e.message.slice(0,80));
  }
});
window.addEventListener('unhandledrejection', e => {
  console.error('[Admin Unhandled Promise]', e.reason);
  if (e.reason && e.reason.message) showToastA('⚠️ Async error: ' + String(e.reason.message).slice(0,80));
});

/* Guard all existing init functions against missing DOM elements */
(function patchInits() {
  const safe = fn => function() { try { fn.apply(this, arguments); } catch(e) { console.error(fn.name + ' error:', e); showToastA('⚠️ Panel error: ' + e.message); } };
  ['initUsers','initWallets','initGames','initPasswords','initPermissions','renderLog','initSettings','initDashboard','initDating','initAnalytics','initBroadcast','initLoginHistory','initAdsPanel','initFeedPanel','initUserDetail','initMarketplacePanel'].forEach(name => {
    if (typeof window[name] === 'function') window[name] = safe(window[name]);
  });
})();
</script>

<!-- ══════════════════════════════════════════════════════════
     🎁 GIFTME ADMIN PANEL FUNCTIONS
════════════════════════════════════════════════════════════ -->
<script>
/* ── Storage helpers (mirror giftme.js) ── */
const _GM_KEY      = 'afrib_giftme_catalogue';
const _GM_HIST_KEY = 'afrib_giftme_history';
const _GM_DEFAULTS = [
  { id:'rose',      name:'Rose',        emoji:'🌹', coins:5,   tier:'common',    category:'love',     desc:'A sweet gesture',    color:'#FF6B9D' },
  { id:'heart',     name:'Heart',       emoji:'❤️', coins:10,  tier:'common',    category:'love',     desc:'Show some love',     color:'#EF4444' },
  { id:'sunflower', name:'Sunflower',   emoji:'🌻', coins:15,  tier:'common',    category:'nature',   desc:'Bright as you',      color:'#F59E0B' },
  { id:'coffee',    name:'Coffee',      emoji:'☕', coins:20,  tier:'common',    category:'chill',    desc:'Buy them a coffee',  color:'#92400E' },
  { id:'star',      name:'Star',        emoji:'⭐', coins:25,  tier:'common',    category:'love',     desc:"You're a star",      color:'#FFD700' },
  { id:'diamond',   name:'Diamond',     emoji:'💎', coins:50,  tier:'rare',      category:'luxury',   desc:'Rare & precious',    color:'#00BFFF' },
  { id:'crown',     name:'Crown',       emoji:'👑', coins:75,  tier:'rare',      category:'luxury',   desc:'Crown them king',    color:'#FFD700' },
  { id:'fire',      name:'Fire',        emoji:'🔥', coins:80,  tier:'rare',      category:'energy',   desc:"You're on fire",     color:'#F97316' },
  { id:'gazelle',   name:'Gazelle',     emoji:'🦌', coins:100, tier:'epic',      category:'wildlife', desc:'Swift & graceful',   color:'#D97706', animation:'gazelle' },
  { id:'zebra',     name:'Zebra',       emoji:'🦓', coins:120, tier:'epic',      category:'wildlife', desc:'Uniquely striped',   color:'#374151', animation:'zebra' },
  { id:'rhino',     name:'Rhino',       emoji:'🦏', coins:150, tier:'epic',      category:'wildlife', desc:'Thick-skinned power',color:'#6B7280', animation:'rhino' },
  { id:'hippo',     name:'Hippo',       emoji:'🦛', coins:150, tier:'epic',      category:'wildlife', desc:'River giant',        color:'#7C3AED', animation:'hippo' },
  { id:'crocodile', name:'Croc',        emoji:'🐊', coins:180, tier:'epic',      category:'wildlife', desc:'Ancient & fierce',   color:'#065F46', animation:'croc' },
  { id:'giraffe',   name:'Giraffe',     emoji:'🦒', coins:200, tier:'epic',      category:'wildlife', desc:'Tall & majestic',    color:'#D97706', animation:'giraffe' },
  { id:'cheetah',   name:'Cheetah',     emoji:'🐆', coins:250, tier:'epic',      category:'wildlife', desc:'Fastest on land',    color:'#F59E0B', animation:'cheetah' },
  { id:'wolf',      name:'Wolf',        emoji:'🐺', coins:300, tier:'legendary', category:'wildlife', desc:'Pack leader',        color:'#6366F1', animation:'wolf' },
  { id:'leopard',   name:'Leopard',     emoji:'🐆', coins:350, tier:'legendary', category:'wildlife', desc:'Silent hunter',      color:'#F59E0B', animation:'leopard' },
  { id:'lion',      name:'Lion',        emoji:'🦁', coins:500, tier:'legendary', category:'wildlife', desc:'King of Africa',     color:'#FF9800', animation:'lion' },
  { id:'elephant',  name:'Elephant',    emoji:'🐘', coins:750, tier:'legendary', category:'wildlife', desc:'Greatest of all',    color:'#9CA3AF', animation:'elephant' },
  { id:'beach',     name:'Beach Scene', emoji:'🏖️', coins:400, tier:'legendary', category:'scene',    desc:'Ocean waves & sunset',color:'#0EA5E9',animation:'beach' },
  { id:'waterfall', name:'Waterfall',   emoji:'💦', coins:450, tier:'legendary', category:'scene',    desc:'Victoria Falls',     color:'#06B6D4', animation:'waterfall' },
  { id:'savanna',   name:'Savanna',     emoji:'🌅', coins:500, tier:'legendary', category:'scene',    desc:'African sunrise',    color:'#F97316', animation:'savanna' },
  { id:'galaxy',    name:'Galaxy',      emoji:'🌌', coins:999, tier:'legendary', category:'special',  desc:'To the stars',       color:'#8B5CF6', animation:'galaxy' },
  // ── Luxury Cars
  { id:'ferrari',    name:'Ferrari SF90',    emoji:'🏎️', coins:300, tier:'epic',      category:'cars', desc:'Screaming Italian V8',  color:'#DC2626', animation:'ferrari'   },
  { id:'porsche',    name:'Porsche GT3',     emoji:'🏎️', coins:350, tier:'epic',      category:'cars', desc:'Flat-six perfection',   color:'#E5E7EB', animation:'porsche'   },
  { id:'lambo',      name:'Lamborghini',     emoji:'🏎️', coins:400, tier:'epic',      category:'cars', desc:'Raging Italian bull',   color:'#D97706', animation:'lambo'     },
  { id:'bentley',    name:'Bentley GT',      emoji:'🚗',  coins:550, tier:'legendary', category:'cars', desc:'British grand touring', color:'#1E3A5F', animation:'bentley'   },
  { id:'gwagon',     name:'G-Wagon AMG',     emoji:'🚙',  coins:700, tier:'legendary', category:'cars', desc:'Unstoppable luxury SUV',color:'#1F2937', animation:'gwagon'    },
  { id:'rollsroyce', name:'Rolls-Royce',     emoji:'🚗',  coins:750, tier:'legendary', category:'cars', desc:'The pinnacle of luxury',color:'#C0A060', animation:'rollsroyce'},
  { id:'bugatti',    name:'Bugatti Chiron',  emoji:'🏎️', coins:899, tier:'legendary', category:'cars', desc:'1500hp hypercar king',  color:'#1D4ED8', animation:'bugatti'   },
];

const _GM_TIER_COLORS = { common:'#9CA3AF', rare:'#3B82F6', epic:'#8B5CF6', legendary:'#FFD700' };

function _gmAdmGetCat() {
  try {
    const s = JSON.parse(localStorage.getItem(_GM_KEY)||'null');
    if (s && Array.isArray(s) && s.length) return s;
  } catch(e) {}
  return JSON.parse(JSON.stringify(_GM_DEFAULTS));
}
function _gmAdmSaveCat(cat) {
  localStorage.setItem(_GM_KEY, JSON.stringify(cat));
}
function _gmAdmGetHist() {
  try { return JSON.parse(localStorage.getItem(_GM_HIST_KEY)||'[]'); } catch(e) { return []; }
}

/* ── Init panel ── */
function initGmPanel() {
  _gmAdmRenderStats();
  _gmAdmRenderCatalogue();
}

/* ── Tab switcher ── */
function gmAdmTab(btn, tab) {
  ['catalogue','add','history','withdrawals'].forEach(t => {
    const el = document.getElementById('gm-adm-'+t);
    if (el) el.style.display = (t===tab) ? '' : 'none';
  });
  document.querySelectorAll('#p-giftme .adm-tab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  if (tab === 'history') _gmAdmRenderHistory();
  if (tab === 'withdrawals') {
    const statsEl = document.getElementById('gm-adm-diamond-stats');
    const reqs = typeof dmGetWithdrawRequests === 'function' ? dmGetWithdrawRequests() : [];
    const pending = reqs.filter(r=>r.status==='pending');
    const totalPaid = reqs.filter(r=>r.status==='approved').reduce((s,r)=>s+(r.netUSD||0),0);
    const totalDiamonds = reqs.reduce((s,r)=>s+(r.diamonds||0),0);
    if (statsEl) statsEl.innerHTML = [
      {label:'Pending',val:pending.length,icon:'\u23f3'},
      {label:'Paid Out',val:'$'+totalPaid.toFixed(2),icon:'\U0001f4b8'},
      {label:'Diamonds Cashed',val:totalDiamonds.toLocaleString(),icon:'\U0001f48e'},
      {label:'Revenue Split',val:'50% platform fee',icon:'\U0001f3e6'},
    ].map(s=>'<div class="stat-card"><div class="stat-val">'+s.val+'</div><div class="stat-label">'+s.icon+' '+s.label+'</div></div>').join('');
    if (typeof dmAdminRenderWithdrawals === 'function') dmAdminRenderWithdrawals();
  }
}

/* ── Stats ── */
function _gmAdmRenderStats() {
  const hist = _gmAdmGetHist();
  const cat  = _gmAdmGetCat();
  const totalCoins = hist.reduce((s,h) => s+(h.coins||0), 0);
  const totalSent  = hist.length;
  const topGift    = hist.length ? hist.reduce((acc,h) => { acc[h.giftId]=(acc[h.giftId]||0)+1; return acc; }, {}) : {};
  const topId      = Object.keys(topGift).sort((a,b)=>topGift[b]-topGift[a])[0];
  const topItem    = cat.find(g=>g.id===topId);
  const el = document.getElementById('gm-admin-stats');
  if (!el) return;
  el.innerHTML = [
    { label:'Total Gifts Sent', val: totalSent.toLocaleString(), icon:'🎁' },
    { label:'Coins Spent on Gifts', val: '🪙'+totalCoins.toLocaleString(), icon:'🪙' },
    { label:'Gift Catalogue Size', val: cat.length, icon:'📦' },
    { label:'Most Popular Gift', val: topItem ? topItem.emoji+' '+topItem.name : '—', icon:'🏆' },
  ].map(s => `<div class="stat-card"><div class="stat-val">${s.val}</div><div class="stat-label">${s.label}</div></div>`).join('');
}

/* ── Render catalogue for admin ── */
function _gmAdmRenderCatalogue() {
  const grid = document.getElementById('gm-adm-catalogue-grid');
  if (!grid) return;
  const cat = _gmAdmGetCat();
  grid.innerHTML = '';
  cat.forEach((gift, idx) => {
    const tierCol = _GM_TIER_COLORS[gift.tier] || '#9CA3AF';
    const card = document.createElement('div');
    card.style.cssText = `background:var(--bg2);border:1.5px solid rgba(255,255,255,.08);border-radius:14px;padding:16px;position:relative;`;
    card.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
        <div style="font-size:36px;line-height:1">${gift.emoji}</div>
        <div style="flex:1">
          <div style="font-size:15px;font-weight:800;color:#fff">${gift.name}</div>
          <div style="font-size:11px;color:${tierCol};font-weight:700;text-transform:uppercase;letter-spacing:.5px">${gift.tier}</div>
          <div style="font-size:11px;color:var(--w60)">${gift.category} · ${gift.desc||''}</div>
        </div>
        <button onclick="gmAdmDeleteGift('${gift.id}')"
          style="background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);color:#EF4444;border-radius:8px;padding:4px 10px;font-size:12px;cursor:pointer">✕</button>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-size:13px;color:var(--w60);white-space:nowrap">🪙 Price:</span>
        <input type="number" min="1" max="99999" value="${gift.coins}"
          onchange="gmAdmUpdatePrice('${gift.id}', this.value)"
          style="flex:1;background:var(--bg);border:1.5px solid rgba(255,215,0,.3);border-radius:8px;padding:7px 10px;color:#FFD700;font-size:15px;font-weight:800;text-align:center"/>
        <select onchange="gmAdmUpdateTier('${gift.id}', this.value)"
          style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:7px 8px;color:#fff;font-size:12px">
          ${['common','rare','epic','legendary'].map(t=>`<option value="${t}" ${t===gift.tier?'selected':''}>${t.charAt(0).toUpperCase()+t.slice(1)}</option>`).join('')}
        </select>
      </div>
      <div style="margin-top:8px;display:flex;gap:6px">
        <span style="font-size:10px;padding:3px 8px;border-radius:20px;background:rgba(255,255,255,.06);color:var(--w60)">${gift.category}</span>
        ${gift.animation ? `<span style="font-size:10px;padding:3px 8px;border-radius:20px;background:rgba(99,102,241,.15);color:#818CF8">3D anim</span>` : ''}
      </div>`;
    grid.appendChild(card);
  });
}

/* ── Update price inline ── */
function gmAdmUpdatePrice(id, val) {
  const price = parseInt(val);
  if (isNaN(price) || price < 1) { showToastA('❌ Invalid price'); return; }
  const cat = _gmAdmGetCat();
  const gift = cat.find(g => g.id === id);
  if (!gift) return;
  gift.coins = price;
  _gmAdmSaveCat(cat);
  appendLog('admin', currentAdmin, `Updated gift price: ${gift.name} → 🪙${price}`);
  showToastA(`✅ ${gift.emoji} ${gift.name} price set to 🪙${price}`);
}

/* ── Update tier inline ── */
function gmAdmUpdateTier(id, tier) {
  const cat = _gmAdmGetCat();
  const gift = cat.find(g => g.id === id);
  if (!gift) return;
  gift.tier = tier;
  _gmAdmSaveCat(cat);
  _gmAdmRenderCatalogue();
  showToastA(`✅ ${gift.emoji} ${gift.name} tier → ${tier}`);
}

/* ── Delete gift ── */
function gmAdmDeleteGift(id) {
  if (!confirm('Remove this gift from the catalogue?')) return;
  const cat = _gmAdmGetCat().filter(g => g.id !== id);
  _gmAdmSaveCat(cat);
  _gmAdmRenderCatalogue();
  _gmAdmRenderStats();
  showToastA('🗑️ Gift removed');
}

/* ── Add new gift ── */
function gmAdmAddGift() {
  const name  = (document.getElementById('gm-new-name')?.value||'').trim();
  const emoji = (document.getElementById('gm-new-emoji')?.value||'').trim();
  const coins = parseInt(document.getElementById('gm-new-coins')?.value||'0');
  const tier  = document.getElementById('gm-new-tier')?.value || 'common';
  const cat_v = document.getElementById('gm-new-cat')?.value  || 'love';
  const color = document.getElementById('gm-new-color')?.value|| '#FFD700';
  const desc  = (document.getElementById('gm-new-desc')?.value||'').trim();
  const errEl = document.getElementById('gm-add-err');
  if (errEl) errEl.style.display='none';

  if (!name)           { if(errEl){errEl.textContent='Name is required';errEl.style.display='block';} return; }
  if (!emoji)          { if(errEl){errEl.textContent='Emoji is required';errEl.style.display='block';} return; }
  if (!coins||coins<1) { if(errEl){errEl.textContent='Price must be at least 1 coin';errEl.style.display='block';} return; }

  const cat = _gmAdmGetCat();
  // Generate a unique ID from name
  const id = name.toLowerCase().replace(/[^a-z0-9]/g,'_').replace(/__+/g,'_') + '_' + Date.now().toString(36);
  if (cat.find(g => g.id === id || g.name.toLowerCase() === name.toLowerCase())) {
    if(errEl){errEl.textContent='A gift with this name already exists';errEl.style.display='block';} return;
  }

  cat.push({ id, name, emoji, coins, tier, category: cat_v, color, desc });
  _gmAdmSaveCat(cat);

  // Clear form
  ['gm-new-name','gm-new-emoji','gm-new-coins','gm-new-desc'].forEach(fid => {
    const el = document.getElementById(fid); if(el) el.value='';
  });

  appendLog('admin', currentAdmin, `Added new gift: ${emoji} ${name} at 🪙${coins}`);
  showToastA(`✅ ${emoji} ${name} added to catalogue!`);
  _gmAdmRenderStats();
  // Switch to catalogue tab to show the new gift
  gmAdmTab(document.getElementById('gm-adm-tab-catalogue'), 'catalogue');
}

/* ── Reset to defaults ── */
function gmAdmResetToDefaults() {
  if (!confirm('Reset catalogue to defaults? All custom gifts and price changes will be lost.')) return;
  localStorage.removeItem(_GM_KEY);
  _gmAdmRenderCatalogue();
  _gmAdmRenderStats();
  appendLog('admin', currentAdmin, 'Reset GiftMe catalogue to defaults');
  showToastA('↺ Catalogue reset to defaults');
}

/* ── History ── */
function _gmAdmRenderHistory() {
  const el = document.getElementById('gm-adm-hist-list');
  if (!el) return;
  const hist = _gmAdmGetHist();
  if (!hist.length) {
    el.innerHTML = '<div style="color:var(--w40);text-align:center;padding:40px">No gift transactions yet</div>';
    return;
  }
  el.innerHTML = `
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      <thead>
        <tr style="border-bottom:1px solid var(--border);color:var(--w60);text-align:left">
          <th style="padding:8px 10px">Gift</th>
          <th style="padding:8px 10px">From</th>
          <th style="padding:8px 10px">To</th>
          <th style="padding:8px 10px">Coins</th>
          <th style="padding:8px 10px">Tier</th>
          <th style="padding:8px 10px">Message</th>
          <th style="padding:8px 10px">Time</th>
        </tr>
      </thead>
      <tbody>
        ${hist.slice(0,200).map(h => `
        <tr style="border-bottom:1px solid rgba(255,255,255,.04);transition:background .15s"
            onmouseover="this.style.background='rgba(255,255,255,.03)'" onmouseout="this.style.background=''">
          <td style="padding:8px 10px">${h.giftEmoji||'🎁'} ${h.giftName||h.giftId}</td>
          <td style="padding:8px 10px;color:var(--w80)">${h.fromName||h.from}</td>
          <td style="padding:8px 10px;color:var(--w80)">${h.toName||h.to}</td>
          <td style="padding:8px 10px;color:#FFD700;font-weight:700">🪙${h.coins}${h.qty>1?' ×'+h.qty:''}</td>
          <td style="padding:8px 10px">
            <span style="font-size:10px;padding:2px 8px;border-radius:20px;background:rgba(255,255,255,.07);color:${_GM_TIER_COLORS[h.tier]||'#9CA3AF'}">${h.tier||'—'}</span>
          </td>
          <td style="padding:8px 10px;max-width:180px">
            ${h.message
              ? `<span style="display:inline-block;font-size:11px;font-style:italic;color:rgba(255,255,255,.7);background:rgba(255,215,0,.08);border-left:2px solid rgba(255,215,0,.4);padding:3px 8px;border-radius:0 6px 6px 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px" title="${h.message.replace(/"/g,'&quot;')}">💬 ${h.message}</span>`
              : `<span style="color:var(--w20);font-size:11px">—</span>`
            }
          </td>
          <td style="padding:8px 10px;color:var(--w40);font-size:11px">${new Date(h.time).toLocaleString()}</td>
        </tr>`).join('')}
      </tbody>
    </table>`;
}

function saveFBLudoConfig() {
  const keys = ['apiKey','authDomain','databaseURL','projectId','messagingSenderId','appId'];
  const cfg = {};
  let valid = true;
  keys.forEach(k => {
    const v = document.getElementById('fb_cfg_' + k)?.value?.trim();
    if (!v) { valid = false; }
    cfg[k] = v || '';
  });
  cfg.storageBucket = (cfg.projectId || 'project') + '.firebasestorage.app';
  localStorage.setItem('afrib_firebase_config', JSON.stringify(cfg));
  const el = document.getElementById('fbLudoConfigStatus');
  if (el) el.innerHTML = '<span style="color:#22c55e">✅ Firebase config saved — users can now play online Ludo!</span>';
  showToastA('✅ Firebase config saved');
}
function loadFBLudoConfigIntoForm() {
  try {
    const cfg = JSON.parse(localStorage.getItem('afrib_firebase_config') || 'null');
    if (!cfg) { showToastA('No saved config'); return; }
    ['apiKey','authDomain','databaseURL','projectId','messagingSenderId','appId'].forEach(k => {
      const el = document.getElementById('fb_cfg_' + k);
      if (el && cfg[k]) el.value = cfg[k];
    });
    showToastA('Config loaded');
  } catch {}
}
function testFBLudoConnection() {
  const el = document.getElementById('fbLudoConfigStatus');
  if (el) el.innerHTML = '<span style="color:#f59e0b">⏳ Testing connection…</span>';
  setTimeout(() => {
    const cfg = localStorage.getItem('afrib_firebase_config');
    if (!cfg) {
      if (el) el.innerHTML = '<span style="color:#f87171">❌ No config saved yet</span>';
      return;
    }
    // Simple validation
    try { JSON.parse(cfg); if (el) el.innerHTML = '<span style="color:#22c55e">✅ Config looks valid</span>'; }
    catch { if (el) el.innerHTML = '<span style="color:#f87171">❌ Invalid config JSON</span>'; }
  }, 1000);
}

</script>
