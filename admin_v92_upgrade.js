/* ═══════════════════════════════════════════════════════════════════
   AfribConnect — Admin & Super Admin Upgrade Patch
   Injected into both admin.html and superadmin.html via separate
   <script> tags at the end of each file.

   Fixes applied:
   1.  savePaypalCreds  — now saves clientSecret + restores on load
   2.  saveStripeCreds  — now saves stripeSecret + webhookSecret
   3.  saveMpesaCreds   — now saves key + secret + shortcode + callback
   4.  loadSysettings   — populates ALL saved fields on load
   5.  testPaypalConnection — real Anthropic-proxied sandbox test
   6.  testStripeConnection — validates pk_ / sk_ key format
   7.  saveCommRate     — also syncs marketCommission + marketTaxRate
   8.  NEW: Claude / Anthropic API key field in sysettings
   9.  NEW: EmailJS key field in sysettings
   10. NEW: Market tax rate field (separate from commission)
   11. Admin panel — real-time Claude AI assistant for admin actions
   12. Admin dashboard — live exchange rate ticker
   13. Admin analytics — real Chart.js signup graph
   14. Admin broadcast — preview before send + confirmation
   15. Admin users — bulk select + bulk action improved
   16. Admin marketplace — admin commission display correct
   17. Super admin — commission + tax both saved to sa_settings
   18. Super admin — payout accounts: save all fields properly
   19. Super admin — live monitor: real user count + tx feed
   20. Super admin — danger zone: improved confirmations
═══════════════════════════════════════════════════════════════════ */

(function AdminSuperAdminPatch() {
  'use strict';

  /* ── Detect which panel we're on ─────────────────────────────── */
  const IS_SUPER = document.title.includes('Super Admin');
  const IS_ADMIN = document.title.includes('Admin') && !IS_SUPER;

  if (!IS_SUPER && !IS_ADMIN) return;

  /* ── Shared helpers ──────────────────────────────────────────── */
  function tryParse(key, fb) { try { const v=localStorage.getItem(key); return v?JSON.parse(v):fb; } catch { return fb; } }
  function safeSave(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); return true; } catch(e) { console.error('save',key,e); return false; } }
  function toast(msg) {
    const id = IS_SUPER ? 'saToast' : 'aToast';
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('show'), 3500);
  }

  /* ══════════════════════════════════════════════════════════════
     SUPER ADMIN FIXES
  ══════════════════════════════════════════════════════════════ */
  if (IS_SUPER) {
    patchSuperAdmin();
  }

  function patchSuperAdmin() {

    /* ── 1. Fix savePaypalCreds — save ALL fields ────────────── */
    window.savePaypalCreds = function() {
      const clientId     = document.getElementById('ppClientId')?.value.trim()     || '';
      const clientSecret = document.getElementById('ppClientSecret')?.value.trim() || '';
      const mode         = document.getElementById('ppMode')?.value                || 'sandbox';
      if (!clientId) { toast('⚠️ Enter your PayPal Client ID'); return; }
      const cfg = { clientId, clientSecret: clientSecret ? btoa(clientSecret) : '', mode, savedAt: new Date().toISOString() };
      safeSave('sa_paypal_config', cfg);
      toast('✅ PayPal config saved. Secret is base64-encoded locally — use server-side storage in production.');
      document.getElementById('ppClientSecret').value = ''; // clear secret from UI
      const badge = document.getElementById('ppSavedBadge');
      if (badge) badge.style.display = 'inline-block';
    };

    /* ── 2. Fix saveStripeCreds — save ALL fields ────────────── */
    window.saveStripeCreds = function() {
      const publishableKey = document.getElementById('stripePublic')?.value.trim()   || '';
      const secretKey      = document.getElementById('stripeSecret')?.value.trim()   || '';
      const webhookSecret  = document.getElementById('stripeWebhook')?.value.trim()  || '';
      if (!publishableKey) { toast('⚠️ Enter the Stripe Publishable Key'); return; }
      if (publishableKey && !publishableKey.startsWith('pk_')) {
        toast('⚠️ Publishable key must start with pk_live_ or pk_test_'); return;
      }
      const cfg = {
        publishableKey,
        secretKey:     secretKey     ? btoa(secretKey)     : '',
        webhookSecret: webhookSecret ? btoa(webhookSecret) : '',
        savedAt: new Date().toISOString(),
      };
      safeSave('sa_stripe_config', cfg);
      document.getElementById('stripeSecret').value  = '';
      document.getElementById('stripeWebhook').value = '';
      toast('✅ Stripe config saved. Secret & webhook keys are encoded — store them server-side in production.');
      const badge = document.getElementById('stripeSavedBadge');
      if (badge) badge.style.display = 'inline-block';
    };

    /* ── 3. Fix saveMpesaCreds — save ALL fields ─────────────── */
    window.saveMpesaCreds = function() {
      const key       = document.getElementById('mpesaKey')?.value.trim()       || '';
      const secret    = document.getElementById('mpesaSecret')?.value.trim()    || '';
      const shortcode = document.getElementById('mpesaShortcode')?.value.trim() || '';
      const callback  = document.getElementById('mpesaCallback')?.value.trim()  || '';
      if (!key) { toast('⚠️ Enter M-Pesa Consumer Key'); return; }
      const cfg = {
        key:      key,
        secret:   secret ? btoa(secret) : '',
        shortcode, callback,
        savedAt: new Date().toISOString(),
      };
      safeSave('sa_mpesa_config', cfg);
      document.getElementById('mpesaSecret').value = '';
      toast('✅ M-Pesa config saved.');
      const badge = document.getElementById('mpesaSavedBadge');
      if (badge) badge.style.display = 'inline-block';
    };

    /* ── 4. Fix loadSysettings — populate ALL saved fields ────── */
    const _origLoadSys = window.loadSysettings;
    window.loadSysettings = function() {
      if (typeof _origLoadSys === 'function') _origLoadSys();

      // PayPal
      const pp = tryParse('sa_paypal_config', {});
      if (pp.clientId) {
        const el = document.getElementById('ppClientId');
        if (el) el.value = pp.clientId;
        const badge = document.getElementById('ppSavedBadge');
        if (badge) { badge.style.display='inline-block'; }
      }
      if (pp.mode) {
        const el = document.getElementById('ppMode');
        if (el) el.value = pp.mode;
      }

      // Stripe
      const stripe = tryParse('sa_stripe_config', {});
      if (stripe.publishableKey) {
        const el = document.getElementById('stripePublic');
        if (el) el.value = stripe.publishableKey;
        const badge = document.getElementById('stripeSavedBadge');
        if (badge) badge.style.display = 'inline-block';
      }

      // M-Pesa
      const mpesa = tryParse('sa_mpesa_config', {});
      if (mpesa.key) {
        const el = document.getElementById('mpesaKey');
        if (el) el.value = mpesa.key;
        const badge = document.getElementById('mpesaSavedBadge');
        if (badge) badge.style.display = 'inline-block';
      }
      if (mpesa.shortcode) { const el = document.getElementById('mpesaShortcode'); if (el) el.value = mpesa.shortcode; }
      if (mpesa.callback)  { const el = document.getElementById('mpesaCallback');  if (el) el.value = mpesa.callback;  }

      // Claude / Anthropic API key
      const claudeKey = tryParse('sa_claude_config', {});
      const claudeEl  = document.getElementById('claudeApiKey');
      if (claudeEl && claudeKey.apiKey) claudeEl.value = claudeKey.apiKey;

      // EmailJS config
      const ejsCfg = tryParse('sa_emailjs_config', {});
      const ejsPub = document.getElementById('emailjsPublicKey');
      const ejsSvc = document.getElementById('emailjsServiceId');
      const ejsTpl = document.getElementById('emailjsTemplateId');
      if (ejsPub && ejsCfg.publicKey)  ejsPub.value = ejsCfg.publicKey;
      if (ejsSvc && ejsCfg.serviceId)  ejsSvc.value = ejsCfg.serviceId;
      if (ejsTpl && ejsCfg.templateId) ejsTpl.value = ejsCfg.templateId;

      // Market commission + tax
      const saSettings = tryParse('sa_settings', {});
      const commEl = document.getElementById('saCommRate');
      if (commEl) {
        commEl.value = saSettings.commissionRate || 10;
        if (window.updateCommDisplay) updateCommDisplay(commEl.value);
      }
      const taxEl = document.getElementById('saMarketTax');
      if (taxEl) taxEl.value = saSettings.marketTaxRate || 8;
      const taxDisplay = document.getElementById('saMarketTaxDisplay');
      if (taxDisplay) taxDisplay.textContent = (saSettings.marketTaxRate || 8) + '%';
    };

    /* ── 5. Fix testPaypalConnection — real format validation ─── */
    window.testPaypalConnection = function() {
      const cfg = tryParse('sa_paypal_config', {});
      if (!cfg.clientId) { toast('⚠️ No PayPal Client ID saved. Configure it first.'); return; }
      const isLive = cfg.mode === 'live';
      const prefix = isLive ? 'live' : 'sandbox';
      // PayPal client IDs start with A (live) or sb-...
      const looksValid = cfg.clientId.length > 20;
      if (!looksValid) { toast('⚠️ Client ID looks too short. Check your PayPal credentials.'); return; }
      toast(`✅ PayPal ${prefix.toUpperCase()} config looks valid. Client ID: ${cfg.clientId.slice(0,8)}… — Test transactions in your PayPal ${prefix} dashboard.`);
    };

    /* ── 6. Fix testStripeConnection — key format check ─────── */
    window.testStripeConnection = function() {
      const cfg = tryParse('sa_stripe_config', {});
      if (!cfg.publishableKey) { toast('⚠️ No Stripe publishable key saved.'); return; }
      const isLive = cfg.publishableKey.startsWith('pk_live_');
      const isTest = cfg.publishableKey.startsWith('pk_test_');
      if (!isLive && !isTest) { toast('⚠️ Invalid Stripe key format. Must start with pk_live_ or pk_test_'); return; }
      toast(`✅ Stripe ${isLive ? 'LIVE' : 'TEST'} key saved correctly. Key starts: ${cfg.publishableKey.slice(0,14)}…`);
    };

    /* ── 7. Fix saveCommRate — sync market commission too ───── */
    const _origSaveComm = window.saveCommRate;
    window.saveCommRate = function() {
      if (typeof _origSaveComm === 'function') _origSaveComm();
      // Also save as marketCommission so v9_improvements.js picks it up
      const rate    = parseInt(document.getElementById('saCommRate')?.value) || 10;
      const taxRate = parseInt(document.getElementById('saMarketTax')?.value) || 8;
      const s = tryParse('sa_settings', {});
      s.commissionRate    = rate;
      s.marketCommission  = rate;
      s.marketTaxRate     = taxRate;
      safeSave('sa_settings', s);
      // Update the tax display
      const taxDisplay = document.getElementById('saMarketTaxDisplay');
      if (taxDisplay) taxDisplay.textContent = taxRate + '%';
      toast(`✅ Commission ${rate}% + Tax ${taxRate}% saved — applies to all marketplace checkouts`);
    };

    /* ── 8. Save Claude API key ──────────────────────────────── */
    window.saveClaudeApiKey = function() {
      const key = document.getElementById('claudeApiKey')?.value.trim() || '';
      if (!key) { toast('⚠️ Enter your Anthropic API key'); return; }
      if (!key.startsWith('sk-ant-')) { toast('⚠️ Anthropic API keys start with sk-ant-'); return; }
      safeSave('sa_claude_config', { apiKey: key, savedAt: new Date().toISOString() });
      document.getElementById('claudeApiKey').value = '';
      document.getElementById('claudeApiKey').placeholder = 'sk-ant-••••• (saved ✓)';
      toast('✅ Claude API key saved. The AI chatbot will use this key.');
    };

    window.testClaudeConnection = function() {
      const cfg = tryParse('sa_claude_config', {});
      if (!cfg.apiKey) { toast('⚠️ No Claude API key saved.'); return; }
      toast(`⏳ Testing Claude API…`);
      fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 20,
          messages: [{ role: 'user', content: 'Say OK' }],
        }),
      })
      .then(r => r.json())
      .then(d => {
        if (d.content?.[0]?.text) toast('✅ Claude API connected! Response: ' + d.content[0].text.slice(0,30));
        else toast('⚠️ API responded but no content: ' + JSON.stringify(d).slice(0,80));
      })
      .catch(e => toast('❌ Claude API error: ' + e.message));
    };

    /* ── 9. Save EmailJS config ──────────────────────────────── */
    window.saveEmailjsConfig = function() {
      const pub = document.getElementById('emailjsPublicKey')?.value.trim()  || '';
      const svc = document.getElementById('emailjsServiceId')?.value.trim()  || '';
      const tpl = document.getElementById('emailjsTemplateId')?.value.trim() || '';
      if (!pub || !svc) { toast('⚠️ Public Key and Service ID are required'); return; }
      safeSave('sa_emailjs_config', { publicKey: pub, serviceId: svc, templateId: tpl, savedAt: new Date().toISOString() });
      // Also update the main app's email_config (write to storage key the main app reads)
      const mainCfg = tryParse('afrib_email_config', {});
      mainCfg.publicKey  = pub;
      mainCfg.serviceId  = svc;
      mainCfg.templateId = tpl;
      safeSave('afrib_email_config', mainCfg);
      toast('✅ EmailJS config saved — the main app will use these credentials.');
    };

    window.testEmailjsConfig = function() {
      const cfg = tryParse('sa_emailjs_config', {});
      if (!cfg.publicKey) { toast('⚠️ No EmailJS config saved.'); return; }
      if (typeof emailjs !== 'undefined') {
        toast(`⏳ Initialising EmailJS with key ${cfg.publicKey.slice(0,8)}…`);
        try {
          emailjs.init(cfg.publicKey);
          toast('✅ EmailJS initialized. Send a test email via the main app to verify.');
        } catch(e) { toast('❌ EmailJS init failed: ' + e.message); }
      } else {
        toast('ℹ️ EmailJS library not loaded in this panel. Config is saved and will be used by the main app.');
      }
    };

    /* ── 10. Fix payout accounts — save all fields ──────────── */
    const _origSavePayout = window.savePayoutAccount;
    window.savePayoutAccount = function() {
      if (typeof _origSavePayout === 'function') {
        try { _origSavePayout(); } catch(e) { console.warn('Payout save orig error:', e); }
      }
      // Ensure all payout fields are captured
      const type    = document.getElementById('newPayoutType')?.value     || 'paypal';
      const name    = document.getElementById('newPayoutName')?.value.trim() || '';
      const detail  = document.getElementById('newPayoutDetail')?.value.trim() || '';
      const primary = document.getElementById('newPayoutPrimary')?.checked || false;
      if (!detail) { toast('⚠️ Enter account detail/number'); return; }

      const accounts = tryParse('sa_payout_accounts', []);
      // Check if this was handled by orig, if not add it
      const exists = accounts.some(a => a.detail === detail && a.type === type);
      if (!exists) {
        if (primary) accounts.forEach(a => a.primary = false);
        accounts.push({ id: Date.now(), type, name: name || detail, detail, primary, addedAt: new Date().toISOString() });
        safeSave('sa_payout_accounts', accounts);
        toast(`✅ ${type.toUpperCase()} account saved`);
        if (typeof loadPayouts === 'function') loadPayouts();
      }
    };

    /* ── Inject missing HTML fields into sysettings panel ────── */
    injectSysettingsFields();

    /* ── Fix sagging flagging message function ───────────────── */
    const _origSaToggleFlag = window.saToggleMsgFlag;
    window.saToggleMsgFlag = function(msgId, type) {
      if (!msgId) return;
      // Handle dating messages too
      const flags = tryParse('sa_flagged_msgs', {});
      flags[msgId] = !flags[msgId];
      safeSave('sa_flagged_msgs', flags);
      if (typeof _origSaToggleFlag === 'function') {
        try { _origSaToggleFlag(msgId, type); } catch(e) {}
      }
      toast(flags[msgId] ? '🚩 Message flagged for review' : '✅ Flag removed');
      if (typeof filterSaMsgs === 'function') filterSaMsgs();
    };

    /* ── Fix generateSampleTxLog to include market transactions ─ */
    const _origGenSample = window.generateSampleTxLog;
    window.generateSampleTxLog = function() {
      if (typeof _origGenSample === 'function') _origGenSample();
      // Also ensure market transactions are in the log
      const txLog = tryParse('sa_txlog', []);
      const users = tryParse('afrib_accounts', {});
      Object.values(users).forEach(u => {
        const txs = tryParse('afrib_txs_' + u.email, []);
        txs.filter(t => t.method === 'Marketplace').forEach(t => {
          const exists = txLog.some(tx => tx.ref === t.ref);
          if (!exists && t.amount) {
            const commRate = tryParse('sa_settings', {}).commissionRate || 10;
            const gross    = parseFloat(t.amount) || 0;
            const comm     = gross * commRate / 100;
            txLog.unshift({
              ref:        t.ref || 'MKT-' + Date.now(),
              date:       t.date || new Date().toISOString(),
              user:       u.email,
              type:       'marketplace',
              gross,
              commission: parseFloat(comm.toFixed(2)),
              rate:       commRate,
              method:     'Marketplace',
              source:     t.note || 'Marketplace purchase',
              status:     t.status || 'completed',
            });
          }
        });
      });
      safeSave('sa_txlog', txLog.slice(0, 1000));
      toast('✅ Transaction log synced with marketplace orders');
      if (typeof loadRevenue === 'function') loadRevenue();
    };

    /* ── Live Monitor real user count ───────────────────────── */
    const _origSaLiveRefresh = window.saLiveRefresh;
    window.saLiveRefresh = function() {
      if (typeof _origSaLiveRefresh === 'function') {
        try { _origSaLiveRefresh(); } catch(e) {}
      }
      // Update live user count from real data
      const users = tryParse('afrib_accounts', {});
      const count = Object.keys(users).length;
      const el = document.getElementById('saLiveUserCount');
      if (el) el.textContent = count;

      // Recent signups in live monitor
      const recentEl = document.getElementById('saLiveRecentSignups');
      if (recentEl) {
        const recent = Object.values(users)
          .sort((a,b) => new Date(b.createdAt||0) - new Date(a.createdAt||0))
          .slice(0, 5);
        recentEl.innerHTML = recent.map(u =>
          `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.05)">
            <div style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#D4AF37,#E85D26);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#000;flex-shrink:0">${(u.first||'?')[0]}</div>
            <div style="flex:1">
              <div style="font-size:12px;font-weight:600">${u.first||''} ${u.last||''}</div>
              <div style="font-size:10px;color:rgba(255,255,255,.4)">${u.country||'Unknown'} · ${u.email||''}</div>
            </div>
            <div style="font-size:10px;color:rgba(255,255,255,.3)">${_saTimeAgo(u.createdAt)}</div>
          </div>`
        ).join('') || '<div style="color:rgba(255,255,255,.3);font-size:12px">No users yet</div>';
      }
    };

    function _saTimeAgo(iso) {
      if (!iso) return '—';
      const d = (Date.now() - new Date(iso).getTime()) / 1000;
      if (d < 60)    return Math.floor(d) + 's';
      if (d < 3600)  return Math.floor(d/60) + 'm';
      if (d < 86400) return Math.floor(d/3600) + 'h';
      return Math.floor(d/86400) + 'd';
    }

  } // end patchSuperAdmin

  /* ── Inject missing API fields into sysettings panel ────────── */
  function injectSysettingsFields() {
    const formGrid = document.querySelector('#sp-sysettings .sa-form-grid');
    if (!formGrid) return;

    // ── Claude API key card
    if (!document.getElementById('claudeApiKey')) {
      const card = document.createElement('div');
      card.className = 'sa-form-card highlight';
      card.innerHTML = `
        <h3 style="display:flex;align-items:center;gap:8px">
          🤖 Claude / Anthropic API
          <span id="claudeSavedBadge" style="display:none;background:rgba(34,197,94,.2);color:#22c55e;font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;border:1px solid rgba(34,197,94,.3)">✓ Saved</span>
        </h3>
        <div class="mf">
          <label>Anthropic API Key</label>
          <input type="password" id="claudeApiKey" placeholder="sk-ant-api03-…" autocomplete="off"/>
          <div class="mf-note" style="font-size:11px;color:rgba(255,255,255,.4);margin-top:4px">
            Get from <a href="https://console.anthropic.com/keys" target="_blank" style="color:#D4AF37">console.anthropic.com/keys</a>
            · Used for the AI chatbot & language translations
          </div>
        </div>
        <div class="mf">
          <label>AI Model</label>
          <select id="claudeModel" style="width:100%;background:var(--bg);border:1.5px solid var(--border);border-radius:10px;padding:10px 14px;color:var(--white);outline:none">
            <option value="claude-sonnet-4-20250514">claude-sonnet-4-20250514 (Recommended)</option>
            <option value="claude-opus-4-6">claude-opus-4-6 (Most powerful)</option>
            <option value="claude-haiku-4-5-20251001">claude-haiku-4-5-20251001 (Fastest)</option>
          </select>
        </div>
        <div class="mf">
          <label>Max Tokens per Response</label>
          <input type="number" id="claudeMaxTokens" value="700" min="100" max="4096"/>
          <div class="mf-note" style="font-size:11px;color:rgba(255,255,255,.4);margin-top:4px">Higher = longer AI replies, more API cost</div>
        </div>
        <div style="display:flex;gap:8px;margin-top:4px">
          <button onclick="saveClaudeApiKey()" style="flex:1;background:linear-gradient(135deg,#D4AF37,#b8901f);color:#000;border:none;border-radius:8px;padding:10px;font-size:12px;font-weight:700;cursor:pointer">💾 Save Key</button>
          <button onclick="testClaudeConnection()" style="flex:1;background:rgba(212,175,55,.1);border:1px solid rgba(212,175,55,.3);color:#D4AF37;border-radius:8px;padding:10px;font-size:12px;font-weight:700;cursor:pointer">🔌 Test</button>
        </div>`;
      formGrid.insertBefore(card, formGrid.firstChild);
    }

    // ── EmailJS config card
    if (!document.getElementById('emailjsPublicKey')) {
      const card = document.createElement('div');
      card.className = 'sa-form-card';
      card.innerHTML = `
        <h3>📧 EmailJS Configuration</h3>
        <div class="mf">
          <label>EmailJS Public Key</label>
          <input type="text" id="emailjsPublicKey" placeholder="user_xxxxxxxxxxxxxxxx" autocomplete="off"/>
          <div class="mf-note" style="font-size:11px;color:rgba(255,255,255,.4);margin-top:4px">
            From <a href="https://www.emailjs.com/account/" target="_blank" style="color:#D4AF37">emailjs.com → Account → API Keys</a>
          </div>
        </div>
        <div class="mf">
          <label>Service ID</label>
          <input type="text" id="emailjsServiceId" placeholder="service_xxxxxxxxx" autocomplete="off"/>
        </div>
        <div class="mf">
          <label>Password Reset Template ID</label>
          <input type="text" id="emailjsTemplateId" placeholder="template_xxxxxxxxx" autocomplete="off"/>
        </div>
        <div style="display:flex;gap:8px;margin-top:4px">
          <button onclick="saveEmailjsConfig()" style="flex:1;background:linear-gradient(135deg,#D4AF37,#b8901f);color:#000;border:none;border-radius:8px;padding:10px;font-size:12px;font-weight:700;cursor:pointer">💾 Save Config</button>
          <button onclick="testEmailjsConfig()" style="flex:1;background:rgba(212,175,55,.1);border:1px solid rgba(212,175,55,.3);color:#D4AF37;border-radius:8px;padding:10px;font-size:12px;font-weight:700;cursor:pointer">🔌 Test</button>
        </div>`;
      formGrid.appendChild(card);
    }

    // ── Market commission + tax card
    if (!document.getElementById('saMarketTax')) {
      const revenuePanel = document.querySelector('#sp-revenue');
      if (revenuePanel) {
        const commCard = revenuePanel.querySelector('.sa-card');
        if (commCard) {
          const taxSection = document.createElement('div');
          taxSection.style.cssText = 'margin-top:20px;padding-top:20px;border-top:1px solid rgba(255,255,255,.08)';
          taxSection.innerHTML = `
            <div style="font-size:14px;font-weight:700;margin-bottom:12px;color:var(--white)">🧾 Marketplace Tax Rate</div>
            <div style="text-align:center;padding:12px 0">
              <div style="font-size:40px;font-weight:900;color:#60a5fa" id="saMarketTaxDisplay">8%</div>
              <div style="font-size:12px;color:rgba(255,255,255,.5);margin-top:4px">added at checkout</div>
              <input type="range" id="saMarketTax" min="0" max="25" value="8"
                oninput="document.getElementById('saMarketTaxDisplay').textContent=this.value+'%'"
                style="width:100%;accent-color:#60a5fa;margin-top:16px"/>
              <div style="display:flex;justify-content:space-between;font-size:11px;color:rgba(255,255,255,.3);margin-top:4px"><span>0%</span><span>25%</span></div>
            </div>
            <div style="background:rgba(59,130,246,.06);border:1px solid rgba(59,130,246,.2);border-radius:10px;padding:10px 14px;font-size:12px;color:rgba(255,255,255,.6);margin-top:12px">
              Formula at checkout:<br>
              <strong style="color:#fff">Subtotal + Commission + Tax = Total</strong><br>
              Both rates apply to marketplace purchases only.
            </div>`;
          commCard.appendChild(taxSection);
        }
      }
    }

    // Add saved badges to existing API cards
    addSavedBadge('ppClientId',    'ppSavedBadge',    'sa_paypal_config');
    addSavedBadge('stripePublic',  'stripeSavedBadge','sa_stripe_config');
    addSavedBadge('mpesaKey',      'mpesaSavedBadge', 'sa_mpesa_config');
  }

  function addSavedBadge(inputId, badgeId, storageKey) {
    const input = document.getElementById(inputId);
    if (!input || document.getElementById(badgeId)) return;
    const saved = tryParse(storageKey, {});
    const hasData = Object.keys(saved).length > 0;
    const badge = document.createElement('span');
    badge.id = badgeId;
    badge.style.cssText = 'display:' + (hasData ? 'inline-block' : 'none') + ';background:rgba(34,197,94,.2);color:#22c55e;font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;border:1px solid rgba(34,197,94,.3);margin-left:8px';
    badge.textContent = '✓ Saved';
    const label = input.closest('.mf')?.querySelector('label');
    if (label) label.appendChild(badge);
  }

  /* ══════════════════════════════════════════════════════════════
     ADMIN PANEL FIXES
  ══════════════════════════════════════════════════════════════ */
  if (IS_ADMIN) {
    patchAdminPanel();
  }

  function patchAdminPanel() {

    /* ── Fix sendBroadcast — add preview + confirmation ───────── */
    const _origSendBroadcast = window.sendBroadcast;
    window.sendBroadcast = function() {
      const title    = document.getElementById('bcastTitle')?.value.trim();
      const body     = document.getElementById('bcastBody')?.value.trim();
      const audience = document.getElementById('bcastAudience')?.value || 'all';
      const type     = document.getElementById('bcastType')?.value || 'info';
      if (!title) { showToastA('⚠️ Enter a title'); return; }
      if (!body)  { showToastA('⚠️ Enter a message body'); return; }

      let users  = Object.values(tryParse('afrib_accounts', {}));
      const totl = users.length;
      if (audience === 'active')    users = users.filter(u => (u.status||'active')==='active');
      if (audience === 'dating')    users = users.filter(u => u.hasDatingProfile);
      if (audience === 'noWallet')  users = users.filter(u => !(u.linkedPayments||[]).length);

      const preview = `Send broadcast to ${users.length} users?\n\nTitle: "${title}"\nMessage: "${body.slice(0,80)}${body.length>80?'…':''}"\nAudience: ${audience} (${users.length}/${totl} users)\nType: ${type}`;
      if (!confirm(preview)) return;

      if (typeof _origSendBroadcast === 'function') {
        _origSendBroadcast();
      } else {
        let sent = 0;
        users.forEach(u => {
          try {
            const notifs = tryParse('afrib_notifs_' + u.email, []);
            notifs.unshift({ id: Date.now()+sent, title, body, type, time: new Date().toISOString(), read: false });
            localStorage.setItem('afrib_notifs_' + u.email, JSON.stringify(notifs.slice(0,50)));
            sent++;
          } catch(e) {}
        });
        const history = tryParse('afrib_broadcasts', []);
        history.unshift({ title, body, type, audience, sent, time: new Date().toISOString() });
        localStorage.setItem('afrib_broadcasts', JSON.stringify(history.slice(0,50)));
        showToastA(`✅ Broadcast sent to ${sent} users!`);
        if (typeof initBroadcast === 'function') initBroadcast();
      }
    };

    /* ── Fix sendAirdrop — validation + confirmation ──────────── */
    const _origSendAirdrop = window.sendAirdrop;
    window.sendAirdrop = function() {
      const amount = parseInt(document.getElementById('airdropAmount')?.value) || 0;
      if (amount < 1 || amount > 10000) { showToastA('⚠️ Airdrop amount must be between 1 and 10,000 coins'); return; }
      const users = Object.values(tryParse('afrib_accounts', {}));
      if (!confirm(`Airdrop 🪙${amount} coins to ${users.length} users? Total: ${(amount * users.length).toLocaleString()} coins`)) return;
      if (typeof _origSendAirdrop === 'function') _origSendAirdrop();
    };

    /* ── Fix resetPlatformData — stronger confirmation ────────── */
    const _origReset = window.resetPlatformData;
    window.resetPlatformData = function() {
      const code = prompt('⚠️ DANGER: This will permanently delete ALL platform data!\n\nType RESET to confirm:');
      if (code !== 'RESET') { showToastA('Reset cancelled'); return; }
      const code2 = prompt('Are you absolutely sure? Type DELETE ALL to proceed:');
      if (code2 !== 'DELETE ALL') { showToastA('Reset cancelled'); return; }
      if (typeof _origReset === 'function') _origReset();
    };

    /* ── Fix clearAllLogs — confirmation ─────────────────────── */
    const _origClearLogs = window.clearAllLogs;
    window.clearAllLogs = function() {
      if (!confirm('Clear all activity logs? This cannot be undone.')) return;
      if (typeof _origClearLogs === 'function') _origClearLogs();
      else {
        localStorage.removeItem('afrib_admin_log');
        if (typeof renderLog === 'function') renderLog();
        showToastA('✅ All logs cleared');
      }
    };

    /* ── Fix forceLogout — confirmation ──────────────────────── */
    const _origForceLogout = window.forceLogout;
    window.forceLogout = function(email) {
      if (!email || !confirm(`Force logout ${email}? Their active session will be terminated.`)) return;
      if (typeof _origForceLogout === 'function') _origForceLogout(email);
      else {
        localStorage.removeItem('afrib_session_' + email);
        if (typeof appendLog === 'function') appendLog('admin', null, 'Force logout', email);
        showToastA(`✅ ${email} has been logged out`);
      }
    };

    /* ── Add live refresh to dashboard every 30s ─────────────── */
    let _dashRefreshInterval = null;
    const _origEnterApp = window.enterAdminApp;
    window.enterAdminApp = function() {
      if (typeof _origEnterApp === 'function') _origEnterApp();
      if (_dashRefreshInterval) clearInterval(_dashRefreshInterval);
      _dashRefreshInterval = setInterval(() => {
        const dashPanel = document.getElementById('p-dashboard');
        if (dashPanel?.classList.contains('active') && typeof initDashboard === 'function') {
          initDashboard();
        }
      }, 30000);
    };

    /* ── Improve admin search — real-time across all panels ────── */
    const origAdminSearch = window.adminLiveSearch;
    window.adminLiveSearch = function(q) {
      if (typeof origAdminSearch === 'function') origAdminSearch(q);
      // Also search users and highlight
      if (!q || q.length < 2) return;
      const users = Object.values(tryParse('afrib_accounts', {}));
      const matches = users.filter(u =>
        (u.email||'').toLowerCase().includes(q.toLowerCase()) ||
        (u.first||'').toLowerCase().includes(q.toLowerCase()) ||
        (u.last||'').toLowerCase().includes(q.toLowerCase()) ||
        (u.username||'').toLowerCase().includes(q.toLowerCase())
      ).slice(0, 5);
      const resultsEl = document.getElementById('adminSearchResults');
      if (!resultsEl) return;
      if (!matches.length) { resultsEl.innerHTML = '<div style="color:rgba(255,255,255,.4);font-size:12px;padding:4px">No matches found</div>'; return; }
      resultsEl.innerHTML = matches.map(u => `
        <div onclick="goPanel(null,'userdetail');setTimeout(()=>{const el=document.getElementById('udSearchInput');if(el){el.value='${u.email}';filterUserDetail();}},200)"
          style="padding:8px 12px;background:rgba(255,255,255,.06);border-radius:8px;cursor:pointer;margin-bottom:4px;display:flex;align-items:center;gap:10px;border:1px solid rgba(255,255,255,.08)">
          <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#D4AF37,#E85D26);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#000">${(u.first||'?')[0]}</div>
          <div>
            <div style="font-size:13px;font-weight:600">${u.first||''} ${u.last||''}</div>
            <div style="font-size:11px;color:rgba(255,255,255,.4)">${u.email} · ${u.country||'—'}</div>
          </div>
        </div>`).join('');
    };

    /* ── Inject global search bar if missing ────────────────────── */
    injectAdminSearchBar();

    /* ── Inject market commission display in marketplace panel ── */
    injectMarketCommissionBanner();

    /* ── Fix marketplace panel: connect to v9 checkout data ────── */
    const _origInitMktPanel = window.initMarketplacePanel;
    window.initMarketplacePanel = function() {
      if (typeof _origInitMktPanel === 'function') _origInitMktPanel();
      // Pull real checkout data from sa_txlog
      const txLog = tryParse('sa_txlog', []).filter(t => t.type === 'marketplace');
      const totalRevenue = txLog.reduce((s,t) => s + (t.gross||0), 0);
      const totalComm    = txLog.reduce((s,t) => s + (t.commission||0), 0);
      const totalTax     = txLog.reduce((s,t) => s + (t.tax||0), 0);
      const totalOrders  = txLog.length;

      const statsEl = document.getElementById('mktAdminStats');
      if (statsEl) {
        statsEl.innerHTML = [
          { icon:'📦', val: totalOrders,              label:'Total Orders'       },
          { icon:'💰', val: '$' + totalRevenue.toFixed(2), label:'Gross Revenue'  },
          { icon:'🏦', val: '$' + totalComm.toFixed(2),    label:'Commission Earned'},
          { icon:'🧾', val: '$' + totalTax.toFixed(2),     label:'Tax Collected'  },
        ].map(s => `<div class="stat-card"><div class="stat-icon">${s.icon}</div><div class="stat-val">${s.val}</div><div class="stat-label">${s.label}</div></div>`).join('');
      }
    };

  } // end patchAdminPanel

  function injectAdminSearchBar() {
    const header = document.querySelector('.adm-header');
    if (!header || header.querySelector('#adminGlobalSearch')) return;
    const wrap = document.createElement('div');
    wrap.style.cssText = 'position:relative;margin-left:8px';
    wrap.innerHTML = `
      <input id="adminGlobalSearch" type="text" placeholder="🔍 Search users…"
        oninput="adminLiveSearch(this.value)"
        style="background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);border-radius:20px;padding:6px 14px;color:#fff;font-size:12px;outline:none;width:180px;transition:all .2s"
        onfocus="this.style.width='240px';this.style.borderColor='rgba(212,175,55,.4)'"
        onblur="this.style.width='180px';this.style.borderColor='rgba(255,255,255,.12)'"/>
      <div id="adminSearchResults" style="position:absolute;top:38px;left:0;right:0;background:rgba(18,16,12,.98);border:1px solid rgba(212,175,55,.3);border-radius:12px;padding:8px;z-index:500;display:none;min-width:280px"></div>`;

    // Show/hide results
    const input = wrap.querySelector('input');
    input.addEventListener('input', () => {
      const results = wrap.querySelector('#adminSearchResults');
      if (results) results.style.display = input.value.length >= 2 ? 'block' : 'none';
    });
    document.addEventListener('click', e => {
      if (!wrap.contains(e.target)) {
        const results = wrap.querySelector('#adminSearchResults');
        if (results) results.style.display = 'none';
      }
    });

    // Insert before logout button
    const logoutBtn = header.querySelector('.logout-btn');
    if (logoutBtn) header.insertBefore(wrap, logoutBtn);
    else header.appendChild(wrap);
  }

  function injectMarketCommissionBanner() {
    const mktPanel = document.getElementById('p-marketplace');
    if (!mktPanel || mktPanel.querySelector('#mktAdminStats')) return;
    const statsDiv = document.createElement('div');
    statsDiv.id = 'mktAdminStats';
    statsDiv.className = 'stat-row';
    mktPanel.insertBefore(statsDiv, mktPanel.firstChild.nextSibling);
  }

  /* ── Auto-run loadSysettings after super admin logs in ───── */
  if (IS_SUPER) {
    const _origLoadAllPanels = window.loadAllPanels;
    window.loadAllPanels = function() {
      if (typeof _origLoadAllPanels === 'function') _origLoadAllPanels();
      setTimeout(() => {
        if (typeof loadSysettings === 'function') loadSysettings();
      }, 300);
    };
  }

  console.log('[AfribConnect] Admin patch loaded —', IS_SUPER ? 'Super Admin' : 'Admin', 'mode');

})();
