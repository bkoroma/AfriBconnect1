/* ═══════════════════════════════════════════════════════════════════════
   AfribConnect — Email, Payments & Admin Configuration Upgrade
   afrib_config_upgrade.js

   COVERS:
   1. EMAIL CONFIG — EmailJS setup wizard in SA panel (public key, service,
      template IDs, test send button)
   2. PAYMENT GATEWAY CONFIG — PayPal, Flutterwave, Paystack, M-Pesa
      (client IDs, API keys, webhook URLs, test mode toggle)
   3. FIREBASE CONFIG — full Firebase project config panel (all 7 keys)
   4. SA SETTINGS PANEL UPGRADE — new "Integrations" tab housing all above
   5. ADMIN SETTINGS UPGRADE — email/payment status indicators
   6. ALL CONFIG persisted to both localStorage AND IndexedDB (AfribKV)
   ═══════════════════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────────────────────────────
   CONFIG HELPERS — read/write from both localStorage and AfribKV
───────────────────────────────────────────────────────────────────── */
function _cfgGet(key, fb) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fb; }
  catch(e) { return fb; }
}
function _cfgSet(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    if (window.AfribKV) window.AfribKV.set(key, val).catch(()=>{});
  } catch(e) {}
}

/* ─────────────────────────────────────────────────────────────────────
   EMAIL CONFIGURATION — EmailJS
───────────────────────────────────────────────────────────────────── */
window._emailCfgSave = function() {
  const cfg = {
    publicKey:         document.getElementById('ejPublicKey')?.value?.trim()    || '',
    serviceId:         document.getElementById('ejServiceId')?.value?.trim()    || '',
    resetTemplateId:   document.getElementById('ejResetTmpl')?.value?.trim()    || '',
    welcomeTemplateId: document.getElementById('ejWelcomeTmpl')?.value?.trim()  || '',
    contactTemplateId: document.getElementById('ejContactTmpl')?.value?.trim()  || '',
    enabled:           !!document.getElementById('ejEnabled')?.checked,
  };
  _cfgSet('afrib_email_config', cfg);

  // Patch the in-memory EMAILJS_CONFIG
  if (window.EMAILJS_CONFIG) {
    Object.assign(window.EMAILJS_CONFIG, cfg);
  }
  if (typeof showToast === 'function') showToast('✅ Email config saved!');
  _cfgUpdateStatusBadges();
};

window._emailCfgTest = async function() {
  const cfg = _cfgGet('afrib_email_config', {});
  if (!cfg.publicKey || cfg.publicKey === 'YOUR_PUBLIC_KEY') {
    if (typeof showToast === 'function') showToast('⚠️ Configure EmailJS keys first');
    return;
  }
  try {
    if (!window.emailjs) {
      if (typeof showToast === 'function') showToast('⚠️ EmailJS SDK not loaded');
      return;
    }
    emailjs.init(cfg.publicKey);
    await emailjs.send(cfg.serviceId, cfg.resetTemplateId, {
      to_email: window.currentUser?.email || 'test@example.com',
      to_name:  'Test User',
      message:  'AfribConnect email test — configuration is working! ✅',
    });
    if (typeof showToast === 'function') showToast('✅ Test email sent!');
  } catch(e) {
    if (typeof showToast === 'function') showToast('❌ Email test failed: ' + (e?.text || e?.message || String(e)));
  }
};

/* ─────────────────────────────────────────────────────────────────────
   PAYMENT GATEWAY CONFIG
───────────────────────────────────────────────────────────────────── */
window._paymentCfgSave = function(gateway) {
  const fields = {
    paypal:       ['ppClientId','ppClientSecret','ppMode'],
    flutterwave:  ['fwPublicKey','fwSecretKey','fwWebhook','fwMode'],
    paystack:     ['psPublicKey','psSecretKey','psWebhook'],
    stripe:       ['stripePublicKey','stripeSecretKey','stripeWebhook','stripeMode'],
    mpesa:        ['mpesaConsumerKey','mpesaConsumerSecret','mpesaShortcode','mpesaPasskey'],
  };
  const cfg = _cfgGet('afrib_payment_config', {});
  if (!cfg[gateway]) cfg[gateway] = {};
  (fields[gateway] || []).forEach(id => {
    const el = document.getElementById(id);
    if (el) cfg[gateway][el.id.replace(/[A-Z]/g, m=>'_'+m.toLowerCase()).slice(gateway.length>0?0:0)] = el.value?.trim() || '';
  });
  // Also capture mode/enabled toggles
  const modeEl = document.getElementById(gateway + 'Mode') || document.getElementById(gateway.slice(0,2)+'Mode');
  if (modeEl) cfg[gateway].mode = modeEl.value;
  const enabledEl = document.getElementById(gateway + 'Enabled');
  if (enabledEl) cfg[gateway].enabled = enabledEl.checked;
  _cfgSet('afrib_payment_config', cfg);
  if (typeof showToast === 'function') showToast(`✅ ${gateway} config saved!`);
  _cfgUpdateStatusBadges();
};

/* ─────────────────────────────────────────────────────────────────────
   FIREBASE CONFIG
───────────────────────────────────────────────────────────────────── */
window._firebaseCfgSave = function() {
  const fields = ['apiKey','authDomain','projectId','storageBucket','messagingSenderId','appId','databaseURL'];
  const cfg = {};
  fields.forEach(f => {
    const el = document.getElementById('fb_' + f);
    if (el) cfg[f] = el.value?.trim() || '';
  });
  _cfgSet('afrib_firebase_config', cfg);
  // Mirror to individual keys (legacy)
  fields.forEach(f => { if (cfg[f]) localStorage.setItem('afrib_fb_' + f, cfg[f]); });
  if (typeof showToast === 'function') showToast('✅ Firebase config saved! Reload the app for changes to take effect.');
  _cfgUpdateStatusBadges();
};

/* ─────────────────────────────────────────────────────────────────────
   STATUS BADGES — show configured/not configured
───────────────────────────────────────────────────────────────────── */
function _cfgUpdateStatusBadges() {
  const emailCfg   = _cfgGet('afrib_email_config', {});
  const paymentCfg = _cfgGet('afrib_payment_config', {});
  const fbCfg      = _cfgGet('afrib_firebase_config', {});

  const emailOk   = !!(emailCfg.publicKey && emailCfg.publicKey !== 'YOUR_PUBLIC_KEY');
  const paypalOk  = !!(paymentCfg.paypal?.ppClientId || paymentCfg.paypal?.enabled);
  const fbOk      = !!(fbCfg.projectId);

  const badges = {
    'cfgEmailStatus':   { ok: emailOk,  label: 'Email' },
    'cfgPaypalStatus':  { ok: paypalOk, label: 'PayPal' },
    'cfgFirebaseStatus':{ ok: fbOk,     label: 'Firebase' },
  };

  Object.entries(badges).forEach(([id, { ok, label }]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent   = ok ? `✅ ${label} Configured` : `⚠️ ${label} Not Set`;
    el.style.color   = ok ? '#22c55e' : '#f59e0b';
  });
}

/* ─────────────────────────────────────────────────────────────────────
   INJECT "INTEGRATIONS" TAB INTO SA SETTINGS PANEL
───────────────────────────────────────────────────────────────────── */
(function injectIntegrationsTab() {
  function tryInject() {
    const settingsPanel = document.getElementById('sp-sysettings');
    if (!settingsPanel || settingsPanel.dataset.integrationsInjected) return;
    settingsPanel.dataset.integrationsInjected = '1';

    const emailCfg   = _cfgGet('afrib_email_config', {});
    const paymentCfg = _cfgGet('afrib_payment_config', {});
    const fbCfg      = _cfgGet('afrib_firebase_config', {});

    // Build integration section and append to settings panel
    const section = document.createElement('div');
    section.style.cssText = 'margin-top:20px';
    section.innerHTML = `
      <div class="sa-form-card" style="grid-column:1/-1">
        <h3 style="margin-bottom:16px">🔌 Integrations Status</h3>
        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:16px">
          <span id="cfgEmailStatus" style="font-size:11px;font-weight:700">⏳ Loading…</span>
          <span id="cfgPaypalStatus" style="font-size:11px;font-weight:700">⏳ Loading…</span>
          <span id="cfgFirebaseStatus" style="font-size:11px;font-weight:700">⏳ Loading…</span>
        </div>

        <!-- TABS -->
        <div style="display:flex;gap:6px;margin-bottom:16px;border-bottom:1px solid var(--border);padding-bottom:10px;overflow-x:auto">
          ${['Email (EmailJS)','Payments','Firebase','API Keys'].map((t,i) => `
            <button onclick="_cfgTab(${i})" id="cfgTab${i}"
              style="padding:6px 14px;border-radius:8px;border:1px solid ${i===0?'rgba(212,175,55,.3)':'var(--border)'};background:${i===0?'rgba(212,175,55,.12)':'transparent'};color:${i===0?'var(--gold)':'var(--w60)'};font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap">${t}</button>`).join('')}
        </div>

        <!-- EMAIL TAB -->
        <div id="cfgTabPanel0">
          <p style="font-size:12px;color:var(--w60);margin-bottom:12px">
            EmailJS lets you send emails from JavaScript — no backend needed.
            <a href="https://www.emailjs.com" target="_blank" style="color:var(--gold)">Create free account →</a>
          </p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
            ${[
              ['ejPublicKey', 'Public Key', emailCfg.publicKey||'', 'From Account > API Keys'],
              ['ejServiceId', 'Service ID', emailCfg.serviceId||'', 'From Email Services'],
              ['ejResetTmpl', 'Password Reset Template ID', emailCfg.resetTemplateId||'', 'Email Templates'],
              ['ejWelcomeTmpl','Welcome Email Template ID', emailCfg.welcomeTemplateId||'', 'Email Templates'],
            ].map(([id,label,val,hint]) => `
              <div>
                <label style="font-size:11px;color:var(--w60);display:block;margin-bottom:3px">${label}</label>
                <input id="${id}" type="text" value="${val}" placeholder="${hint}"
                  style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:8px 10px;color:var(--white);font-size:12px"/>
              </div>`).join('')}
          </div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
            <label style="position:relative;display:inline-block;width:40px;height:22px">
              <input type="checkbox" id="ejEnabled" ${emailCfg.enabled?'checked':''} style="opacity:0;width:100%;height:100%;position:absolute;cursor:pointer;margin:0"/>
              <span onclick="this.previousElementSibling.click()" style="position:absolute;inset:0;background:${emailCfg.enabled?'var(--gold)':'var(--border)'};border-radius:11px;cursor:pointer">
                <span style="position:absolute;top:2px;left:2px;width:18px;height:18px;background:#fff;border-radius:50%;transition:transform .2s;transform:${emailCfg.enabled?'translateX(18px)':'translateX(0)'}"></span>
              </span>
            </label>
            <span style="font-size:12px">Enable email sending</span>
          </div>
          <div style="display:flex;gap:8px">
            <button onclick="_emailCfgSave()" style="flex:1;padding:10px;background:var(--gold);color:#000;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer">💾 Save Email Config</button>
            <button onclick="_emailCfgTest()" style="padding:10px 14px;background:transparent;border:1px solid var(--border);border-radius:10px;color:var(--w60);font-size:12px;cursor:pointer">📧 Test</button>
          </div>
        </div>

        <!-- PAYMENTS TAB -->
        <div id="cfgTabPanel1" style="display:none">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">

            <!-- PayPal -->
            <div style="background:var(--bg);border-radius:10px;padding:12px">
              <div style="font-size:12px;font-weight:800;margin-bottom:8px">🅿️ PayPal</div>
              ${[['ppClientId','Client ID',paymentCfg.paypal?.ppClientId||''],['ppClientSecret','Client Secret',paymentCfg.paypal?.ppClientSecret||'']].map(([id,l,v])=>`
                <div style="margin-bottom:6px">
                  <label style="font-size:10px;color:var(--w60)">${l}</label>
                  <input id="${id}" type="${id.includes('Secret')?'password':'text'}" value="${v}" style="width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:7px 8px;color:var(--white);font-size:11px"/>
                </div>`).join('')}
              <select id="ppMode" style="width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:7px;color:var(--white);font-size:11px;margin-bottom:8px">
                <option value="sandbox" ${paymentCfg.paypal?.mode!=='live'?'selected':''}>Sandbox (Test)</option>
                <option value="live"    ${paymentCfg.paypal?.mode==='live'?'selected':''}>Live</option>
              </select>
              <button onclick="_paymentCfgSave('paypal')" style="width:100%;padding:8px;background:rgba(0,112,186,.2);border:1px solid rgba(0,112,186,.4);border-radius:8px;color:#60a5fa;font-size:11px;font-weight:700;cursor:pointer">Save PayPal</button>
            </div>

            <!-- Flutterwave -->
            <div style="background:var(--bg);border-radius:10px;padding:12px">
              <div style="font-size:12px;font-weight:800;margin-bottom:8px">🦋 Flutterwave</div>
              ${[['fwPublicKey','Public Key',paymentCfg.flutterwave?.fwPublicKey||''],['fwSecretKey','Secret Key',paymentCfg.flutterwave?.fwSecretKey||'']].map(([id,l,v])=>`
                <div style="margin-bottom:6px">
                  <label style="font-size:10px;color:var(--w60)">${l}</label>
                  <input id="${id}" type="${id.includes('Secret')?'password':'text'}" value="${v}" style="width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:7px 8px;color:var(--white);font-size:11px"/>
                </div>`).join('')}
              <select id="fwMode" style="width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:7px;color:var(--white);font-size:11px;margin-bottom:8px">
                <option value="test" ${paymentCfg.flutterwave?.mode!=='live'?'selected':''}>Test</option>
                <option value="live" ${paymentCfg.flutterwave?.mode==='live'?'selected':''}>Live</option>
              </select>
              <button onclick="_paymentCfgSave('flutterwave')" style="width:100%;padding:8px;background:rgba(245,166,35,.15);border:1px solid rgba(245,166,35,.3);border-radius:8px;color:#f5a623;font-size:11px;font-weight:700;cursor:pointer">Save Flutterwave</button>
            </div>

            <!-- Paystack -->
            <div style="background:var(--bg);border-radius:10px;padding:12px">
              <div style="font-size:12px;font-weight:800;margin-bottom:8px">💚 Paystack</div>
              ${[['psPublicKey','Public Key',paymentCfg.paystack?.psPublicKey||''],['psSecretKey','Secret Key',paymentCfg.paystack?.psSecretKey||'']].map(([id,l,v])=>`
                <div style="margin-bottom:6px">
                  <label style="font-size:10px;color:var(--w60)">${l}</label>
                  <input id="${id}" type="${id.includes('Secret')?'password':'text'}" value="${v}" style="width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:7px 8px;color:var(--white);font-size:11px"/>
                </div>`).join('')}
              <input id="psWebhook" type="url" placeholder="https://yoursite.com/webhook/paystack" value="${paymentCfg.paystack?.psWebhook||''}" style="width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:7px 8px;color:var(--white);font-size:11px;margin-bottom:8px"/>
              <button onclick="_paymentCfgSave('paystack')" style="width:100%;padding:8px;background:rgba(0,195,247,.15);border:1px solid rgba(0,195,247,.3);border-radius:8px;color:#00c3f7;font-size:11px;font-weight:700;cursor:pointer">Save Paystack</button>
            </div>

            <!-- M-Pesa -->
            <div style="background:var(--bg);border-radius:10px;padding:12px">
              <div style="font-size:12px;font-weight:800;margin-bottom:8px">📱 M-Pesa (Safaricom)</div>
              ${[['mpesaConsumerKey','Consumer Key',paymentCfg.mpesa?.mpesaConsumerKey||''],['mpesaConsumerSecret','Consumer Secret',paymentCfg.mpesa?.mpesaConsumerSecret||''],['mpesaShortcode','Business Shortcode',paymentCfg.mpesa?.mpesaShortcode||'']].map(([id,l,v])=>`
                <div style="margin-bottom:6px">
                  <label style="font-size:10px;color:var(--w60)">${l}</label>
                  <input id="${id}" type="${id.includes('Secret')?'password':'text'}" value="${v}" style="width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:7px 8px;color:var(--white);font-size:11px"/>
                </div>`).join('')}
              <button onclick="_paymentCfgSave('mpesa')" style="width:100%;padding:8px;background:rgba(0,164,80,.15);border:1px solid rgba(0,164,80,.3);border-radius:8px;color:#00a450;font-size:11px;font-weight:700;cursor:pointer">Save M-Pesa</button>
            </div>
          </div>
        </div>

        <!-- FIREBASE TAB -->
        <div id="cfgTabPanel2" style="display:none">
          <p style="font-size:12px;color:var(--w60);margin-bottom:12px">
            Firebase is used for multiplayer game rooms and real-time features.
            <a href="https://console.firebase.google.com" target="_blank" style="color:var(--gold)">Firebase Console →</a>
          </p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
            ${[
              ['fb_apiKey',           'API Key',            fbCfg.apiKey||''],
              ['fb_authDomain',       'Auth Domain',        fbCfg.authDomain||''],
              ['fb_projectId',        'Project ID',         fbCfg.projectId||''],
              ['fb_storageBucket',    'Storage Bucket',     fbCfg.storageBucket||''],
              ['fb_messagingSenderId','Messaging Sender ID', fbCfg.messagingSenderId||''],
              ['fb_appId',            'App ID',             fbCfg.appId||''],
              ['fb_databaseURL',      'Database URL (RTDB)', fbCfg.databaseURL||''],
            ].map(([id,l,v]) => `
              <div>
                <label style="font-size:11px;color:var(--w60);display:block;margin-bottom:3px">${l}</label>
                <input id="${id}" type="${id.includes('Key')||id.includes('Secret')?'password':'text'}" value="${v}"
                  style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:8px 10px;color:var(--white);font-size:12px"/>
              </div>`).join('')}
          </div>
          <button onclick="_firebaseCfgSave()" style="width:100%;padding:11px;background:linear-gradient(135deg,#FF9800,#F44336);color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer">🔥 Save Firebase Config</button>
        </div>

        <!-- API KEYS TAB -->
        <div id="cfgTabPanel3" style="display:none">
          <p style="font-size:12px;color:var(--w60);margin-bottom:12px">Configure third-party API keys used across the platform.</p>
          <div style="display:flex;flex-direction:column;gap:10px">
            ${[
              ['cfgAnthropicKey', 'Anthropic (Claude) API Key', 'sk-ant-...', 'afrib_ai_config_v42', 'apiKey'],
              ['cfgGoogleClientId','Google OAuth Client ID', '751955600293-...', 'afrib_oauth_config', 'googleClientId'],
              ['cfgFbAppId',      'Facebook App ID', '5367351986822249', 'afrib_oauth_config', 'facebookAppId'],
              ['cfgTikTokKey',    'TikTok Client Key', 'awqy2d4x2w1e2whn', 'afrib_oauth_config', 'tiktokClientKey'],
            ].map(([id, label, ph, storageKey, field]) => {
              const val = (() => { try { return JSON.parse(localStorage.getItem(storageKey)||'{}')[field]||''; } catch(e){ return ''; } })();
              return `
                <div>
                  <label style="font-size:12px;color:var(--w60);display:block;margin-bottom:4px">${label}</label>
                  <div style="display:flex;gap:8px">
                    <input id="${id}" type="password" value="${val}" placeholder="${ph}"
                      style="flex:1;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:8px 10px;color:var(--white);font-size:12px"/>
                    <button onclick="_saveApiKey('${storageKey}','${field}','${id}')"
                      style="padding:8px 14px;background:var(--gold);color:#000;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer">Save</button>
                  </div>
                </div>`;
            }).join('')}
          </div>
        </div>
      </div>`;

    settingsPanel.querySelector('.sa-form-grid')?.appendChild(section)
      || settingsPanel.appendChild(section);

    setTimeout(_cfgUpdateStatusBadges, 200);
  }

  if (document.readyState === 'loading') window.addEventListener('load', () => setTimeout(tryInject, 1000));
  else setTimeout(tryInject, 1000);
})();

window._cfgTab = function(idx) {
  [0,1,2,3].forEach(i => {
    const btn = document.getElementById(`cfgTab${i}`);
    const pnl = document.getElementById(`cfgTabPanel${i}`);
    if (btn) {
      btn.style.background   = i === idx ? 'rgba(212,175,55,.12)' : 'transparent';
      btn.style.color        = i === idx ? 'var(--gold)' : 'var(--w60)';
      btn.style.borderColor  = i === idx ? 'rgba(212,175,55,.3)' : 'var(--border)';
    }
    if (pnl) pnl.style.display = i === idx ? 'block' : 'none';
  });
};

window._saveApiKey = function(storageKey, field, inputId) {
  const val = document.getElementById(inputId)?.value?.trim() || '';
  const cfg = (() => { try { return JSON.parse(localStorage.getItem(storageKey)||'{}'); } catch(e){ return {}; } })();
  cfg[field] = val;
  _cfgSet(storageKey, cfg);
  if (typeof showToast === 'function') showToast(`✅ API key saved`);
  _cfgUpdateStatusBadges();
};

/* ─────────────────────────────────────────────────────────────────────
   AUTO-LOAD SAVED CONFIG ON START
───────────────────────────────────────────────────────────────────── */
(function loadSavedConfigs() {
  // Patch EMAILJS_CONFIG on load if saved config exists
  const emailCfg = _cfgGet('afrib_email_config', {});
  if (emailCfg.publicKey && window.EMAILJS_CONFIG) {
    Object.assign(window.EMAILJS_CONFIG, emailCfg);
  }

  // Patch OAUTH_CONFIG if saved
  const oauthCfg = _cfgGet('afrib_oauth_config', {});
  if (oauthCfg.googleClientId && window.OAUTH_CONFIG) {
    if (window.OAUTH_CONFIG.google) window.OAUTH_CONFIG.google.clientId = oauthCfg.googleClientId;
  }
})();

/* ─────────────────────────────────────────────────────────────────────
   ADMIN PANEL STATUS BAR — show config status to admin
───────────────────────────────────────────────────────────────────── */
(function injectAdminStatusBar() {
  function tryInject() {
    const adminContent = document.querySelector('.admin-content, .admin-main, #admin-content');
    if (!adminContent || adminContent.dataset.statusBarInjected) return;
    adminContent.dataset.statusBarInjected = '1';

    const emailCfg   = _cfgGet('afrib_email_config', {});
    const paymentCfg = _cfgGet('afrib_payment_config', {});
    const fbCfg      = _cfgGet('afrib_firebase_config', {});

    const bar = document.createElement('div');
    bar.id    = 'adminStatusBar';
    bar.style.cssText = 'background:var(--bg3);border-bottom:1px solid var(--border);padding:8px 16px;display:flex;gap:12px;flex-wrap:wrap;align-items:center;font-size:11px';

    const configs = [
      { label:'Email',    ok: !!(emailCfg.publicKey && emailCfg.publicKey !== 'YOUR_PUBLIC_KEY') },
      { label:'Payments', ok: !!(paymentCfg.paypal?.ppClientId || paymentCfg.flutterwave?.fwPublicKey || paymentCfg.paystack?.psPublicKey) },
      { label:'Firebase', ok: !!(fbCfg.projectId) },
    ];

    bar.innerHTML = `
      <span style="color:var(--w30);font-weight:700;font-size:10px;text-transform:uppercase">Config:</span>
      ${configs.map(c => `<span style="font-weight:700;color:${c.ok?'#22c55e':'#f59e0b'}">${c.ok?'✅':'⚠️'} ${c.label}</span>`).join('')}
      <span style="margin-left:auto;color:var(--w30);font-size:10px">v68 · IndexedDB ✅</span>`;

    adminContent.prepend(bar);
  }

  if (document.readyState === 'loading') window.addEventListener('load', () => setTimeout(tryInject, 800));
  else setTimeout(tryInject, 800);
})();

console.log('[AfribConfig] Email + Payments + API config upgrade loaded ✅');
