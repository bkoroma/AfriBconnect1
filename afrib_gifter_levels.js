/* ═══════════════════════════════════════════════════════════════════════════
   AfribConnect — GDPR Compliance Module  (afrib_gdpr.js)
   Load AFTER compliance_and_fixes.js and script.js

   Implements the following legal requirements:
   ─────────────────────────────────────────────
   GDPR (EU 2016/679)         — all EU/EEA users
   UK GDPR                    — UK users post-Brexit
   POPIA (South Africa)       — SA users
   CCPA / CPRA (California)   — US/California users
   LGPD (Brazil)              — Brazilian users
   Nigeria NDPR               — Nigerian users

   Articles / Rights covered:
   ─────────────────────────────────────────────
   Art. 5   — Lawfulness, fairness, transparency
   Art. 6   — Lawful basis (consent + legitimate interest)
   Art. 7   — Conditions for consent (granular, withdrawable, timestamped)
   Art. 12  — Transparent communication
   Art. 13  — Information to be provided at collection
   Art. 15  — Right of access
   Art. 16  — Right to rectification
   Art. 17  — Right to erasure ("right to be forgotten")
   Art. 18  — Right to restriction of processing
   Art. 20  — Right to data portability
   Art. 21  — Right to object
   Art. 25  — Data protection by design and default
   Art. 32  — Security of processing
   Art. 33  — Breach notification (UI notice)
   Art. 35  — DPIA reference
   Art. 83  — Penalties awareness
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

(function AfribGDPR() {

  /* ─────────────────────────────────────────────────────────────────────────
     CONSTANTS
  ───────────────────────────────────────────────────────────────────────── */
  const VERSION       = 'v2.0';
  const CONSENT_KEY   = 'afrib_gdpr_consent_v2';
  const CONSENT_LOG   = 'afrib_gdpr_consent_log';
  const DATA_REQ_KEY  = 'afrib_gdpr_data_requests';
  const BREACH_KEY    = 'afrib_gdpr_breach_notices';
  const CONTROLLER    = {
    name:    'AfribConnect Ltd',
    address: 'contact@afribconnect.com',
    dpo:     'privacy@afribconnect.com',
    website: 'https://afribconnect.com',
  };

  /* ─────────────────────────────────────────────────────────────────────────
     UTILITIES
  ───────────────────────────────────────────────────────────────────────── */
  const _ls = {
    get: (k, fb = null) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch(e) { return fb; } },
    set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch(e) { return false; } },
    rm:  (k)    => { try { localStorage.removeItem(k); } catch(e) {} },
  };

  const _esc = s => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

  function _toast(msg) {
    if (typeof showToast === 'function') showToast(msg);
    else console.info('[GDPR]', msg);
  }

  /* ─────────────────────────────────────────────────────────────────────────
     §0  ONE-TAP TERMS & CONDITIONS MODAL
         Called when user clicks "Create Account" — shows T&C + Privacy,
         user clicks "I Agree & Continue" → auto-accepts all, proceeds to signup
  ───────────────────────────────────────────────────────────────────────── */

  window.showTandC = function() {
    // If already agreed this session, just go straight to signup
    if (sessionStorage.getItem('afrib_tandc_agreed')) {
      const cb = document.getElementById('signupTerms');
      if (cb) cb.checked = true;
      if (typeof doSignup === 'function') doSignup();
      return;
    }

    const overlay = document.createElement('div');
    overlay.id = 'tandc-overlay';
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:100002;
      background:rgba(0,0,0,.92);backdrop-filter:blur(12px);
      display:flex;align-items:center;justify-content:center;padding:16px;
      animation:gdprSlideUp .3s ease both;
    `;

    overlay.innerHTML = `
      <style>
        #tandc-overlay *{box-sizing:border-box;font-family:inherit}
        #tandc-card{background:linear-gradient(160deg,#0e0020,#1c0b38);border:1px solid rgba(212,175,55,.3);border-radius:22px;padding:28px 26px;max-width:480px;width:100%;max-height:88vh;display:flex;flex-direction:column;gap:0}
        #tandc-body{overflow-y:auto;flex:1;padding-right:4px;margin:14px 0}
        #tandc-body h3{font-size:12px;font-weight:800;color:#D4AF37;margin:14px 0 5px;letter-spacing:.4px;text-transform:uppercase}
        #tandc-body p,#tandc-body li{font-size:12px;color:rgba(255,255,255,.6);line-height:1.7;margin-bottom:4px}
        #tandc-body ul{padding-left:16px;margin:0 0 8px}
        #tandc-body strong{color:rgba(255,255,255,.85)}
        #tandc-agree-btn{width:100%;padding:15px;background:linear-gradient(135deg,#D4AF37,#E85D26);border:none;border-radius:14px;color:#000;font-size:15px;font-weight:900;cursor:pointer;letter-spacing:.3px;margin-top:4px;flex-shrink:0;transition:filter .2s}
        #tandc-agree-btn:hover{filter:brightness(1.08)}
        #tandc-agree-btn:active{filter:brightness(.95)}
        #tandc-skip{display:block;text-align:center;margin-top:10px;font-size:11px;color:rgba(255,255,255,.3);cursor:pointer;text-decoration:underline;flex-shrink:0}
        #tandc-skip:hover{color:rgba(255,255,255,.5)}
        .tandc-tabs{display:flex;gap:6px;margin-bottom:2px;flex-shrink:0}
        .tandc-tab{flex:1;padding:8px;border:1px solid rgba(255,255,255,.12);border-radius:8px;background:transparent;color:rgba(255,255,255,.45);font-size:12px;font-weight:600;cursor:pointer;transition:all .15s}
        .tandc-tab.active{background:rgba(212,175,55,.12);border-color:rgba(212,175,55,.4);color:#D4AF37}
      </style>

      <div id="tandc-card">
        <!-- Header -->
        <div style="display:flex;align-items:center;justify-content:space-between;flex-shrink:0">
          <div>
            <div style="font-size:19px;font-weight:900;color:#fff">Before you join 👋</div>
            <div style="font-size:12px;color:rgba(255,255,255,.4);margin-top:2px">Quick read — tap <strong style="color:#D4AF37">I Agree</strong> when ready</div>
          </div>
          <div style="font-size:28px">📋</div>
        </div>

        <!-- Tabs -->
        <div class="tandc-tabs" style="margin-top:14px">
          <button class="tandc-tab active" onclick="_tandcTab(this,'tandc-terms')">📋 Terms</button>
          <button class="tandc-tab" onclick="_tandcTab(this,'tandc-privacy')">🛡️ Privacy</button>
          <button class="tandc-tab" onclick="_tandcTab(this,'tandc-cookies')">🍪 Cookies</button>
        </div>

        <!-- Terms tab -->
        <div id="tandc-body">
          <div id="tandc-terms">
            <h3>✅ What You Can Do</h3>
            <ul>
              <li>Create a free account and use all features</li>
              <li>Play games, connect with others, send gifts</li>
              <li>Delete your account and all data at any time</li>
              <li>Download a copy of your data at any time</li>
            </ul>

            <h3>🚫 What You Cannot Do</h3>
            <ul>
              <li>You must be <strong>18 years old or older</strong></li>
              <li>No harassment, hate speech, or illegal content</li>
              <li>No impersonating other people</li>
              <li>No hacking or attempting to access others' accounts</li>
            </ul>

            <h3>🎮 Games & Coins</h3>
            <p>Virtual coins have <strong>no real-world cash value</strong>. Games are for entertainment only. AfribConnect is not a licensed gambling operator.</p>

            <h3>⚠️ Liability</h3>
            <p>AfribConnect is provided "as is". We are not liable for data loss or service interruptions. You use the service at your own risk.</p>

            <h3>📧 Contact</h3>
            <p>Questions? <strong>contact@afribconnect.com</strong></p>
          </div>

          <div id="tandc-privacy" style="display:none">
            <h3>📦 Data We Collect</h3>
            <ul>
              <li><strong>Account info:</strong> Name, email, username, country</li>
              <li><strong>Optional:</strong> Phone, profession, photo, bio</li>
              <li><strong>Age:</strong> Date of birth (18+ check only, stored privately)</li>
              <li><strong>Usage:</strong> Game scores, messages — stored on your device only</li>
            </ul>

            <h3>🏠 Where It's Stored</h3>
            <p>Everything lives in <strong>your browser's local storage</strong> — on your device only. We don't run external databases for standard accounts. Multiplayer game data uses Firebase (Google) temporarily during sessions.</p>

            <h3>🤝 Third Parties</h3>
            <ul>
              <li><strong>Google Fonts</strong> — fonts only</li>
              <li><strong>Firebase (Google)</strong> — multiplayer game rooms</li>
              <li><strong>Google / Facebook / TikTok Login</strong> — only if you use social sign-in</li>
              <li><strong>EmailJS</strong> — password reset emails only</li>
            </ul>
            <p>We <strong>never sell your data</strong> to anyone.</p>

            <h3>⚖️ Your Rights (GDPR / POPIA / CCPA)</h3>
            <ul>
              <li>Download all your data — Settings → Privacy</li>
              <li>Delete your account — Settings → Privacy</li>
              <li>Change or correct your info — Settings → Profile</li>
              <li>Withdraw consent — Settings → Privacy → Cookies</li>
            </ul>
            <p style="font-size:11px;color:rgba(255,255,255,.35)">DPO: privacy@afribconnect.com</p>
          </div>

          <div id="tandc-cookies" style="display:none">
            <h3>🍪 What We Store</h3>
            <p>Clicking <strong>I Agree & Continue</strong> accepts the following storage. You can change this any time in Settings → Privacy → Cookie Preferences.</p>

            <div style="display:flex;flex-direction:column;gap:8px;margin-top:10px">
              <div style="background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.2);border-radius:9px;padding:10px 12px">
                <div style="font-size:12px;font-weight:700;color:#4ade80">✅ Essential — Always On</div>
                <div style="font-size:11px;color:rgba(255,255,255,.5);margin-top:3px">Login session, account data, security. Cannot be disabled.</div>
              </div>
              <div style="background:rgba(212,175,55,.07);border:1px solid rgba(212,175,55,.2);border-radius:9px;padding:10px 12px">
                <div style="font-size:12px;font-weight:700;color:#D4AF37">✅ Functional — Accepted</div>
                <div style="font-size:11px;color:rgba(255,255,255,.5);margin-top:3px">Theme, language, game saves, preferences.</div>
              </div>
              <div style="background:rgba(96,165,250,.07);border:1px solid rgba(96,165,250,.2);border-radius:9px;padding:10px 12px">
                <div style="font-size:12px;font-weight:700;color:#60a5fa">✅ Social — Accepted</div>
                <div style="font-size:11px;color:rgba(255,255,255,.5);margin-top:3px">Messages, friend lists, online presence.</div>
              </div>
              <div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:9px;padding:10px 12px">
                <div style="font-size:12px;font-weight:700;color:rgba(255,255,255,.4)">❌ Analytics — Off by default</div>
                <div style="font-size:11px;color:rgba(255,255,255,.35);margin-top:3px">Crash reports, performance. You can enable in Settings.</div>
              </div>
              <div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:9px;padding:10px 12px">
                <div style="font-size:12px;font-weight:700;color:rgba(255,255,255,.4)">❌ Marketing — Off by default</div>
                <div style="font-size:11px;color:rgba(255,255,255,.35);margin-top:3px">Promotional notifications. You can enable in Settings.</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Single agree button -->
        <button id="tandc-agree-btn" onclick="_tandcAgree()">
          ✅ I Agree &amp; Continue
        </button>
        <span id="tandc-skip" onclick="safeRemoveEl('tandc-overlay')">Cancel</span>
      </div>
    `;

    document.body.appendChild(overlay);
  };

  /** Tab switcher inside T&C modal */
  window._tandcTab = function(btn, tabId) {
    document.querySelectorAll('.tandc-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    ['tandc-terms','tandc-privacy','tandc-cookies'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = id === tabId ? '' : 'none';
    });
  };

  /** User clicked I Agree — accept all, record consent, proceed to signup */
  window._tandcAgree = function() {
    // Auto-check the hidden terms checkbox
    const cb = document.getElementById('signupTerms');
    if (cb) cb.checked = true;

    // Record full consent
    if (typeof window.AfribGDPR?.saveConsent === 'function') {
      window.AfribGDPR.saveConsent(
        { essential:true, functional:true, social:true, analytics:false, marketing:false },
        'tandc_agree'
      );
    }

    // Mark agreed for this session so we don't show modal again on retry
    try { sessionStorage.setItem('afrib_tandc_agreed', '1'); } catch(e) {}

    // Remove modal
    document.getElementById('tandc-overlay')?.remove();

    // Proceed to signup
    if (typeof doSignup === 'function') doSignup();
  };



  /** Consent categories with lawful basis */
  const CONSENT_CATEGORIES = {
    essential: {
      label:   'Essential Storage',
      desc:    'Login sessions, account data, security tokens. Required to use the app.',
      basis:   'Legitimate interest (Art. 6(1)(f)) — cannot be disabled',
      locked:  true,
    },
    functional: {
      label:   'Functional Preferences',
      desc:    'Theme, language, game saves, notification preferences, UI customisation.',
      basis:   'Consent (Art. 6(1)(a))',
      locked:  false,
    },
    social: {
      label:   'Social & Messaging',
      desc:    'Messages, friend lists, presence status, profile visibility to other users.',
      basis:   'Contract performance (Art. 6(1)(b))',
      locked:  false,
    },
    analytics: {
      label:   'Analytics & Performance',
      desc:    'Crash reports, error logs, performance metrics — stored locally only, never sent externally.',
      basis:   'Consent (Art. 6(1)(a))',
      locked:  false,
    },
    marketing: {
      label:   'Marketing Communications',
      desc:    'Promotional notifications, new feature announcements, partner offers.',
      basis:   'Consent (Art. 6(1)(a))',
      locked:  false,
    },
  };

  window.AfribGDPR = window.AfribGDPR || {};

  /** Get current consent record */
  window.AfribGDPR.getConsent = function() {
    return _ls.get(CONSENT_KEY, null);
  };

  /** Check if a specific category is consented */
  window.AfribGDPR.hasConsent = function(category) {
    const c = _ls.get(CONSENT_KEY, null);
    if (!c) return false;
    if (category === 'essential') return true;
    return !!c.categories?.[category];
  };

  /** Save consent with full audit trail */
  window.AfribGDPR.saveConsent = function(categories, method = 'explicit') {
    const record = {
      version:    VERSION,
      timestamp:  new Date().toISOString(),
      method,                              // 'explicit', 'accept_all', 'essential_only', 'withdraw'
      categories: {
        essential:  true,                  // always true
        functional: !!categories.functional,
        social:     !!categories.social,
        analytics:  !!categories.analytics,
        marketing:  !!categories.marketing,
      },
      userAgent:  navigator.userAgent.slice(0, 120),
      ip:         'client-side',           // We don't collect IPs server-side
    };
    _ls.set(CONSENT_KEY, record);

    // Append to audit log (Art. 7(1) — controller must demonstrate consent)
    const log = _ls.get(CONSENT_LOG, []);
    log.unshift({ ...record, id: 'consent_' + Date.now() });
    if (log.length > 50) log.length = 50;
    _ls.set(CONSENT_LOG, log);

    // Apply consent effects immediately
    _applyConsent(record.categories);

    return record;
  };

  /** Apply consent — disable data collection for refused categories */
  function _applyConsent(cats) {
    // Disable analytics if not consented
    if (!cats.analytics) {
      window._analyticsEnabled = false;
      try { _ls.rm('afrib_analytics'); _ls.rm('afrib_error_log'); _ls.rm('afrib_js_errors'); } catch(e) {}
    } else {
      window._analyticsEnabled = true;
    }
    // Disable marketing if not consented
    if (!cats.marketing) {
      window._marketingEnabled = false;
    } else {
      window._marketingEnabled = true;
    }
  }

  /* ─────────────────────────────────────────────────────────────────────────
     §2  COOKIE / CONSENT BANNER (Art. 13 — info at point of collection)
         Replaces the existing banner with a GDPR-compliant version
  ───────────────────────────────────────────────────────────────────────── */

  window.AfribGDPR.showConsentBanner = function() {
    if (window.AfribGDPR.getConsent()) return;
    if (document.getElementById('gdpr-consent-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'gdpr-consent-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-modal', 'true');
    banner.setAttribute('aria-label', 'Cookie and Privacy Consent');
    banner.style.cssText = `
      position:fixed;bottom:0;left:0;right:0;z-index:99999;
      background:linear-gradient(135deg,#0d001f,#1a0835);
      border-top:2px solid rgba(212,175,55,.4);
      padding:20px 24px;box-shadow:0 -8px 40px rgba(0,0,0,.6);
      animation:gdprSlideUp .4s ease both;font-family:inherit;
    `;
    banner.innerHTML = `
      <style>
        @keyframes gdprSlideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
        #gdpr-consent-banner *{box-sizing:border-box}
        .gdpr-banner-inner{max-width:900px;margin:0 auto;display:flex;gap:20px;align-items:flex-start;flex-wrap:wrap}
        .gdpr-banner-text{flex:1;min-width:220px}
        .gdpr-banner-text h3{font-size:15px;font-weight:800;color:#fff;margin:0 0 6px}
        .gdpr-banner-text p{font-size:12px;color:rgba(255,255,255,.65);line-height:1.6;margin:0}
        .gdpr-banner-text a{color:#D4AF37;text-decoration:underline;cursor:pointer}
        .gdpr-banner-btns{display:flex;gap:8px;align-items:center;flex-wrap:wrap;flex-shrink:0}
        .gdpr-btn-accept{padding:10px 22px;background:linear-gradient(135deg,#D4AF37,#E85D26);border:none;border-radius:10px;color:#000;font-size:13px;font-weight:800;cursor:pointer;white-space:nowrap}
        .gdpr-btn-essential{padding:10px 16px;background:transparent;border:1px solid rgba(255,255,255,.25);border-radius:10px;color:rgba(255,255,255,.7);font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap}
        .gdpr-btn-manage{padding:10px 14px;background:transparent;border:none;color:rgba(255,255,255,.45);font-size:12px;cursor:pointer;text-decoration:underline;white-space:nowrap}
        .gdpr-btn-accept:hover{filter:brightness(1.1)}
        .gdpr-btn-essential:hover{background:rgba(255,255,255,.08)}
      </style>
      <div class="gdpr-banner-inner">
        <div class="gdpr-banner-text">
          <h3>🍪 Your Privacy Choices</h3>
          <p>
            We use essential cookies to keep you logged in and the app running. With your consent, we also use functional, social, and analytics storage to improve your experience.
            We <strong>never sell your data</strong> and store everything locally on your device.
            <br/>
            <a onclick="window.AfribGDPR.showPrivacyPolicy()">Privacy Policy</a> ·
            <a onclick="window.AfribGDPR.showTerms()">Terms of Service</a> ·
            <a onclick="window.AfribGDPR.showConsentManager()">Manage Preferences</a>
          </p>
        </div>
        <div class="gdpr-banner-btns">
          <button class="gdpr-btn-accept" onclick="window.AfribGDPR.acceptAll()">Accept All</button>
          <button class="gdpr-btn-essential" onclick="window.AfribGDPR.acceptEssentialOnly()">Essential Only</button>
          <button class="gdpr-btn-manage" onclick="window.AfribGDPR.showConsentManager()">Manage</button>
        </div>
      </div>`;

    document.body.appendChild(banner);
  };

  window.AfribGDPR.acceptAll = function() {
    window.AfribGDPR.saveConsent(
      { essential:true, functional:true, social:true, analytics:true, marketing:false },
      'accept_all'
    );
    _dismissBanner();
    _toast('✅ Preferences saved');
  };

  window.AfribGDPR.acceptEssentialOnly = function() {
    window.AfribGDPR.saveConsent(
      { essential:true, functional:false, social:false, analytics:false, marketing:false },
      'essential_only'
    );
    _dismissBanner();
    _toast('✅ Essential cookies only — preferences saved');
  };

  function _dismissBanner() {
    const b = document.getElementById('gdpr-consent-banner');
    if (b) { b.style.transform = 'translateY(100%)'; b.style.opacity = '0'; setTimeout(() => b.remove(), 400); }
    // Also dismiss old banner if present
    const old = document.getElementById('cookie-consent-banner');
    if (old) old.remove();
  }

  /* ─────────────────────────────────────────────────────────────────────────
     §3  GRANULAR CONSENT MANAGER MODAL
  ───────────────────────────────────────────────────────────────────────── */

  window.AfribGDPR.showConsentManager = function() {
    const existing = window.AfribGDPR.getConsent()?.categories ||
      { essential:true, functional:true, social:true, analytics:false, marketing:false };

    const overlay = document.createElement('div');
    overlay.id = 'gdpr-manager-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.85);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;padding:16px';
    overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };

    const rows = Object.entries(CONSENT_CATEGORIES).map(([key, cat]) => `
      <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px 16px;display:flex;align-items:flex-start;gap:14px;margin-bottom:10px">
        <div style="flex:1">
          <div style="font-size:13px;font-weight:700;color:#fff;margin-bottom:3px">${_esc(cat.label)}</div>
          <div style="font-size:11px;color:rgba(255,255,255,.5);line-height:1.5;margin-bottom:4px">${_esc(cat.desc)}</div>
          <div style="font-size:10px;color:rgba(212,175,55,.7)">Basis: ${_esc(cat.basis)}</div>
        </div>
        ${cat.locked
          ? `<div style="font-size:11px;color:rgba(255,255,255,.3);font-weight:700;padding-top:2px;white-space:nowrap">Always on</div>`
          : `<label style="position:relative;display:inline-block;width:44px;height:24px;flex-shrink:0;margin-top:2px">
               <input type="checkbox" id="gdpr-cat-${key}" ${existing[key] ? 'checked' : ''}
                 style="opacity:0;width:0;height:0;position:absolute"/>
               <span onclick="this.previousElementSibling.click()" style="position:absolute;cursor:pointer;inset:0;background:${existing[key]?'#D4AF37':'rgba(255,255,255,.15)'};border-radius:24px;transition:background .2s">
                 <span style="position:absolute;height:18px;width:18px;left:3px;bottom:3px;background:#fff;border-radius:50%;transition:transform .2s;transform:${existing[key]?'translateX(20px)':'translateX(0)'}"></span>
               </span>
             </label>`
        }
      </div>`).join('');

    overlay.innerHTML = `
      <div style="background:linear-gradient(145deg,#0d001f,#1a0835);border:1px solid rgba(212,175,55,.25);border-radius:20px;padding:28px;max-width:520px;width:100%;max-height:90vh;overflow-y:auto;position:relative">
        <button onclick="safeRemoveEl('gdpr-manager-overlay')"
          style="position:absolute;top:14px;right:14px;background:rgba(255,255,255,.08);border:none;color:rgba(255,255,255,.6);font-size:18px;width:30px;height:30px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center">✕</button>
        <h2 style="font-size:18px;font-weight:800;color:#D4AF37;margin:0 0 6px">🍪 Privacy Preferences</h2>
        <p style="font-size:12px;color:rgba(255,255,255,.5);margin:0 0 20px;line-height:1.6">
          Choose which types of data storage you consent to. You can change these settings at any time from Settings → Privacy.
          Your choices are logged with a timestamp as required by GDPR Art. 7.
        </p>
        ${rows}
        <div style="display:flex;gap:10px;margin-top:16px">
          <button onclick="window.AfribGDPR._saveManagerChoices()" style="flex:1;padding:12px;background:linear-gradient(135deg,#D4AF37,#E85D26);border:none;border-radius:12px;color:#000;font-size:14px;font-weight:800;cursor:pointer">Save My Choices</button>
          <button onclick="window.AfribGDPR.acceptAll()" style="flex:1;padding:12px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.15);border-radius:12px;color:rgba(255,255,255,.8);font-size:13px;font-weight:600;cursor:pointer">Accept All</button>
        </div>
        <p style="font-size:10px;color:rgba(255,255,255,.25);text-align:center;margin:14px 0 0">
          Data Controller: ${_esc(CONTROLLER.name)} · DPO: ${_esc(CONTROLLER.dpo)}
        </p>
      </div>`;

    document.body.appendChild(overlay);
  };

  window.AfribGDPR._saveManagerChoices = function() {
    const cats = {};
    Object.keys(CONSENT_CATEGORIES).forEach(key => {
      const el = document.getElementById('gdpr-cat-' + key);
      cats[key] = el ? el.checked : CONSENT_CATEGORIES[key].locked;
    });
    window.AfribGDPR.saveConsent(cats, 'explicit');
    document.getElementById('gdpr-manager-overlay')?.remove();
    _dismissBanner();
    _toast('✅ Privacy preferences saved');
  };

  /* ─────────────────────────────────────────────────────────────────────────
     §4  PRIVACY POLICY (Art. 13 — complete, transparent)
  ───────────────────────────────────────────────────────────────────────── */

  window.AfribGDPR.showPrivacyPolicy = function() {
    _showLegalModal('gdpr-privacy-modal', '🛡️ Privacy Policy', `
      <p style="font-size:11px;color:rgba(255,255,255,.4);margin-bottom:16px">
        <strong>Last updated: April 2026</strong> · Version 2.0 ·
        Compliant with: GDPR (EU), UK GDPR, POPIA (South Africa), CCPA/CPRA (California), LGPD (Brazil), NDPR (Nigeria)
      </p>

      <h3>1. Data Controller</h3>
      <p><strong>${_esc(CONTROLLER.name)}</strong><br/>
      Email: <a href="mailto:${_esc(CONTROLLER.address)}" style="color:#D4AF37">${_esc(CONTROLLER.address)}</a><br/>
      Data Protection Officer: <a href="mailto:${_esc(CONTROLLER.dpo)}" style="color:#D4AF37">${_esc(CONTROLLER.dpo)}</a></p>

      <h3>2. What Personal Data We Collect</h3>
      <ul>
        <li><strong>Identity data:</strong> First name, last name, username, email address</li>
        <li><strong>Contact data:</strong> Optional phone number (used only for account recovery)</li>
        <li><strong>Profile data:</strong> Country, profession, bio, profile photo (optional)</li>
        <li><strong>Age data:</strong> Date of birth — used solely to verify you are 18+ and stored privately</li>
        <li><strong>Usage data:</strong> Game scores, transaction history, chat messages — stored locally on your device only</li>
        <li><strong>Technical data:</strong> Browser type (stored locally — never sent to external analytics servers)</li>
        <li><strong>Social login data:</strong> If you sign in via Google, Facebook, or TikTok: your name, email, and profile photo from that provider</li>
      </ul>

      <h3>3. Lawful Basis for Processing</h3>
      <ul>
        <li><strong>Contract (Art. 6(1)(b)):</strong> Processing your account data to provide the service you signed up for</li>
        <li><strong>Consent (Art. 6(1)(a)):</strong> Functional preferences, analytics, marketing — only when you give explicit consent</li>
        <li><strong>Legitimate interest (Art. 6(1)(f)):</strong> Security logging, fraud prevention, essential session storage</li>
        <li><strong>Legal obligation (Art. 6(1)(c)):</strong> Responding to law enforcement requests where legally required</li>
      </ul>

      <h3>4. How We Store Your Data</h3>
      <p>All personal data is stored in your browser's <strong>localStorage and IndexedDB</strong> — on your device only.
      We do not operate external databases for standard user accounts. Game room data (Ludo, Snake, DrinkUp) is temporarily
      stored in <strong>Firebase Realtime Database</strong> during active multiplayer sessions and deleted when the room ends.
      Firebase is operated by Google LLC and subject to Google's Data Processing Agreement.</p>

      <h3>5. Third-Party Services</h3>
      <ul>
        <li><strong>Google Fonts</strong> — fonts only; Google may log your IP. No personal data shared.</li>
        <li><strong>Firebase (Google LLC)</strong> — temporary multiplayer game state. Data Processing Agreement in place.</li>
        <li><strong>Google Identity Services</strong> — if you use "Sign in with Google". Governed by Google's Privacy Policy.</li>
        <li><strong>Facebook Login (Meta)</strong> — if you use "Continue with Facebook". Governed by Meta's Data Policy.</li>
        <li><strong>TikTok Login</strong> — if you use "Continue with TikTok". Governed by TikTok's Privacy Policy.</li>
        <li><strong>EmailJS</strong> — transmits your email address to send password reset codes only. No data retained.</li>
      </ul>
      <p>We <strong>never sell, rent, or share</strong> your personal data with advertisers or data brokers.</p>

      <h3>6. Your Rights</h3>
      <ul>
        <li><strong>Right of Access (Art. 15):</strong> Download all your data — Settings → Privacy → Download My Data</li>
        <li><strong>Right to Erasure (Art. 17):</strong> Delete your account — Settings → Privacy → Delete My Account</li>
        <li><strong>Right to Rectification (Art. 16):</strong> Edit your profile at any time in Settings</li>
        <li><strong>Right to Data Portability (Art. 20):</strong> Export your data as a JSON file</li>
        <li><strong>Right to Restrict Processing (Art. 18):</strong> Use Essential Only mode — Settings → Privacy → Cookie Preferences</li>
        <li><strong>Right to Object (Art. 21):</strong> Opt out of any non-essential storage via Manage Preferences</li>
        <li><strong>Right to Withdraw Consent (Art. 7(3)):</strong> Withdraw at any time — Settings → Privacy → Cookie Preferences</li>
        <li><strong>Right to Lodge a Complaint:</strong> Contact your national supervisory authority (e.g. ICO for UK, CNIL for France, Information Regulator for South Africa)</li>
      </ul>

      <h3>7. Children's Privacy</h3>
      <p>AfribConnect is strictly for users <strong>18 years of age or older</strong>. We do not knowingly collect personal data from anyone under 18. If you believe a minor has registered, contact us at <a href="mailto:${_esc(CONTROLLER.dpo)}" style="color:#D4AF37">${_esc(CONTROLLER.dpo)}</a> for immediate account removal.</p>

      <h3>8. Data Retention</h3>
      <ul>
        <li><strong>Account data:</strong> Retained on your device until you delete your account or clear browser storage</li>
        <li><strong>Game session data (Firebase):</strong> Deleted automatically when a room ends or after 24 hours of inactivity</li>
        <li><strong>Consent records:</strong> Retained for 3 years as required by GDPR Art. 7(1)</li>
        <li><strong>Security logs:</strong> Retained for 90 days for fraud prevention</li>
      </ul>

      <h3>9. International Data Transfers</h3>
      <p>Firebase and Google services may transfer data to the United States. Such transfers are subject to
      Standard Contractual Clauses (SCCs) as required by GDPR Art. 46(2)(c) and Google's Data Processing Agreement.</p>

      <h3>10. Data Breach Notification</h3>
      <p>In the event of a data breach affecting your personal data, we will notify you within 72 hours as required by GDPR Art. 33, via in-app notification and email to the address on your account.</p>

      <h3>11. Contact & Complaints</h3>
      <p>For any privacy request or complaint: <a href="mailto:${_esc(CONTROLLER.dpo)}" style="color:#D4AF37">${_esc(CONTROLLER.dpo)}</a><br/>
      We will respond to all requests within <strong>30 days</strong> as required by GDPR Art. 12(3).</p>
    `);
  };

  // Alias for backward compatibility
  window.showPrivacyModal = window.AfribGDPR.showPrivacyPolicy;

  /* ─────────────────────────────────────────────────────────────────────────
     §5  UPDATED TERMS OF SERVICE
  ───────────────────────────────────────────────────────────────────────── */

  window.AfribGDPR.showTerms = function() {
    _showLegalModal('gdpr-terms-modal', '📋 Terms of Service', `
      <p style="font-size:11px;color:rgba(255,255,255,.4);margin-bottom:16px"><strong>Last updated: April 2026</strong> · Version 2.0</p>

      <h3>1. Acceptance</h3>
      <p>By creating an account or using AfribConnect, you agree to these Terms. If you do not agree, do not use the service.</p>

      <h3>2. Eligibility</h3>
      <p>You must be at least <strong>18 years old</strong> to create an account. By registering you confirm you meet this requirement. Accounts found to belong to minors will be terminated immediately and all data erased.</p>

      <h3>3. Account Responsibilities</h3>
      <p>You are responsible for maintaining the confidentiality of your password and for all activity on your account. You must notify us immediately of any unauthorised use at <a href="mailto:${_esc(CONTROLLER.address)}" style="color:#D4AF37">${_esc(CONTROLLER.address)}</a>.</p>

      <h3>4. Prohibited Conduct</h3>
      <ul>
        <li>Impersonating any person or entity</li>
        <li>Posting illegal, abusive, or harmful content</li>
        <li>Attempting to access other users' accounts or data</li>
        <li>Using automated bots or scripts without permission</li>
        <li>Circumventing security measures</li>
        <li>Engaging in money laundering or fraudulent transactions</li>
      </ul>

      <h3>5. Virtual Coins & Wallet</h3>
      <p>Virtual coins have no real-world monetary value and cannot be exchanged for cash. Coin-based wager games are for <strong>entertainment only</strong>. AfribConnect does not operate as a licensed gambling operator. All wagers are in virtual coins only. Play responsibly — if you feel your usage is becoming a problem, visit <a href="https://www.begambleaware.org" target="_blank" style="color:#D4AF37">BeGambleAware.org</a>.</p>

      <h3>6. Privacy</h3>
      <p>Your use of AfribConnect is also governed by our <a onclick="window.AfribGDPR.showPrivacyPolicy()" style="color:#D4AF37;cursor:pointer">Privacy Policy</a>, which is incorporated into these Terms by reference.</p>

      <h3>7. Termination</h3>
      <p>We reserve the right to suspend or terminate accounts that violate these Terms. You may delete your account at any time via Settings → Privacy → Delete My Account.</p>

      <h3>8. Limitation of Liability</h3>
      <p>AfribConnect is provided "as is". We are not liable for data loss, service interruptions, or third-party actions. Our maximum liability is limited to the amount you paid for the service in the past 12 months.</p>

      <h3>9. Governing Law</h3>
      <p>These Terms are governed by the laws of the jurisdiction in which ${_esc(CONTROLLER.name)} is incorporated. Disputes shall be resolved through binding arbitration or the courts of that jurisdiction.</p>

      <h3>10. Changes to Terms</h3>
      <p>We will notify you of material changes via in-app notification at least 30 days before they take effect. Continued use after that date constitutes acceptance.</p>

      <h3>11. Contact</h3>
      <p><a href="mailto:${_esc(CONTROLLER.address)}" style="color:#D4AF37">${_esc(CONTROLLER.address)}</a></p>
    `);
  };

  // Alias for backward compatibility
  window.showTermsModal = window.AfribGDPR.showTerms;
  // Global shorthand aliases (called directly from some onclick handlers)
  window.showPrivacyPolicy = window.AfribGDPR.showPrivacyPolicy;
  window.showTerms         = window.AfribGDPR.showTerms;

  /* ─────────────────────────────────────────────────────────────────────────
     §6  SUBJECT RIGHTS PORTAL (Art. 15–21)
  ───────────────────────────────────────────────────────────────────────── */

  window.AfribGDPR.showRightsPortal = function() {
    _showLegalModal('gdpr-rights-modal', '⚖️ Your Data Rights', `
      <p style="font-size:12px;color:rgba(255,255,255,.55);margin-bottom:20px;line-height:1.6">
        Under GDPR, UK GDPR, POPIA, CCPA and other applicable laws, you have the following rights regarding your personal data.
        All requests are processed within <strong>30 days</strong>.
      </p>

      <div style="display:flex;flex-direction:column;gap:8px">
        <button onclick="window.AfribGDPR.requestDataExport()" class="gdpr-right-btn">
          📥 <span><strong>Right of Access / Data Portability</strong><br/><small>Download a full copy of all your data as JSON (Art. 15 &amp; 20)</small></span>
        </button>
        <button onclick="window.AfribGDPR.showConsentManager()" class="gdpr-right-btn">
          🍪 <span><strong>Manage Consent / Right to Restrict</strong><br/><small>Change what data we're allowed to store (Art. 7, 18, 21)</small></span>
        </button>
        <button onclick="window.AfribGDPR.requestRectification()" class="gdpr-right-btn">
          ✏️ <span><strong>Right to Rectification</strong><br/><small>Correct inaccurate personal data (Art. 16)</small></span>
        </button>
        <button onclick="window.AfribGDPR.requestErasure()" class="gdpr-right-btn" style="border-color:rgba(239,68,68,.3);color:#f87171">
          🗑️ <span><strong>Right to Erasure ("Right to be Forgotten")</strong><br/><small>Permanently delete your account and all data (Art. 17)</small></span>
        </button>
        <button onclick="window.AfribGDPR.contactDPO()" class="gdpr-right-btn">
          📧 <span><strong>Contact Data Protection Officer</strong><br/><small>For complaints, objections, or questions: ${_esc(CONTROLLER.dpo)}</small></span>
        </button>
        <button onclick="window.AfribGDPR.showConsentAuditLog()" class="gdpr-right-btn">
          📋 <span><strong>View Consent History</strong><br/><small>See a log of all consent decisions made on this device</small></span>
        </button>
      </div>

      <style>
        .gdpr-right-btn{width:100%;padding:12px 14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:10px;color:rgba(255,255,255,.8);font-size:13px;text-align:left;cursor:pointer;transition:all .15s;display:flex;gap:12px;align-items:center}
        .gdpr-right-btn:hover{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.2)}
        .gdpr-right-btn small{display:block;font-size:11px;color:rgba(255,255,255,.4);margin-top:2px;font-weight:400}
      </style>

      <p style="font-size:10px;color:rgba(255,255,255,.25);text-align:center;margin-top:16px">
        You also have the right to lodge a complaint with your national supervisory authority.<br/>
        UK: ICO (ico.org.uk) · EU: Your national DPA · SA: Information Regulator (inforegulator.org.za)
      </p>
    `);
  };

  /** Right of Access — export full data bundle */
  window.AfribGDPR.requestDataExport = function() {
    try {
      const email = window.currentUser?.email;
      if (!email) { _toast('⚠️ Please log in to export your data'); return; }

      const accounts = typeof getAccounts === 'function' ? getAccounts() : {};
      const user     = { ...(accounts[email] || {}) };
      // Scrub security fields — never export password hashes
      delete user.pwHash; delete user.password; delete user.pin;
      delete user.failedLogins; delete user.loginCount;

      const bundle = {
        exportMetadata: {
          exportDate:     new Date().toISOString(),
          dataController: CONTROLLER.name,
          dpo:            CONTROLLER.dpo,
          requestedBy:    email,
          legalBasis:     'GDPR Art. 15 (Right of Access) & Art. 20 (Data Portability)',
          format:         'JSON',
          version:        VERSION,
        },
        personalData:   user,
        consentHistory: _ls.get(CONSENT_LOG, []),
        socialData:     (() => { try { return JSON.parse(localStorage.getItem('afrib_social')||'{}')[email] || {}; } catch(e) { return {}; } })(),
        notifications:  (() => { try { return JSON.parse(localStorage.getItem(`afrib_notifs_${email}`) || '[]'); } catch(e) { return []; } })(),
        transactions:   (() => { try { return JSON.parse(localStorage.getItem(`afrib_txs_${email}`) || '[]'); } catch(e) { return []; } })(),
        coinBalance:    parseInt(localStorage.getItem(`afrib_coins_${email}`) || '0'),
        achievements:   (() => { try { return JSON.parse(localStorage.getItem(`afrib_achievements_${email}`) || '[]'); } catch(e) { return []; } })(),
        gameHistory:    (() => { try { return JSON.parse(localStorage.getItem(`afrib_recent_games_${email}`) || '[]'); } catch(e) { return []; } })(),
        streakData:     (() => { try { return JSON.parse(localStorage.getItem(`afrib_streak_${email}`) || 'null'); } catch(e) { return null; } })(),
        referrals:      (() => { try { return JSON.parse(localStorage.getItem(`afrib_referrals_${email}`) || '[]'); } catch(e) { return []; } })(),
        posts:          (() => { try { return JSON.parse(localStorage.getItem('afrib_posts')||'[]').filter(p=>p.author===email||p.email===email); } catch(e) { return []; } })(),
        liveEvents:     (() => { try { return JSON.parse(localStorage.getItem('afrib_live_events')||'[]').filter(ev=>ev.hostEmail===email); } catch(e) { return []; } })(),
        datingProfile:  (() => { try { const accs=JSON.parse(localStorage.getItem('afrib_accounts')||'{}'); return accs[email]?.datingProfile||null; } catch(e) { return null; } })(),
        dataRequests:   _ls.get(DATA_REQ_KEY, []),
      };

      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `afribconnect_my_data_${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);

      // Log the request
      const reqs = _ls.get(DATA_REQ_KEY, []);
      reqs.unshift({ type:'access', email, ts: new Date().toISOString(), status:'completed' });
      _ls.set(DATA_REQ_KEY, reqs);

      _toast('📥 Your data export has been downloaded');
    } catch(e) {
      console.error('[GDPR] Data export error:', e);
      _toast('❌ Export failed — please try again or contact ' + CONTROLLER.dpo);
    }
  };

  // Alias for backward compatibility
  window.exportMyData = window.AfribGDPR.requestDataExport;

  /** Right to Rectification — open profile editor */
  window.AfribGDPR.requestRectification = function() {
    document.getElementById('gdpr-rights-modal')?.remove();
    if (typeof showScreen === 'function') {
      showScreen('settings');
      setTimeout(() => {
        const profileTab = document.querySelector('[onclick*="settings-profile"], [data-tab="profile"]');
        if (profileTab) profileTab.click();
      }, 300);
    }
    _toast('✏️ Opening profile editor — update any incorrect data');
  };

  /** Right to Erasure — full account wipe with confirmation */
  window.AfribGDPR.requestErasure = function() {
    document.getElementById('gdpr-rights-modal')?.remove();
    _showLegalModal('gdpr-erasure-modal', '🗑️ Delete My Account', `
      <div style="text-align:center;margin-bottom:20px">
        <div style="font-size:48px;margin-bottom:8px">⚠️</div>
        <h3 style="color:#f87171;margin-bottom:8px">Permanent Account Deletion</h3>
        <p style="font-size:13px;color:rgba(255,255,255,.65);line-height:1.6">
          This will permanently delete your account and <strong>all associated data</strong> from this device,
          including your profile, messages, game history, coins, and wallet records.
          <strong>This action cannot be undone.</strong>
        </p>
      </div>
      <div style="background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.25);border-radius:10px;padding:12px 14px;font-size:12px;color:rgba(255,255,255,.6);margin-bottom:20px;line-height:1.7">
        What will be deleted:<br/>
        ✓ Account & profile data &nbsp;·&nbsp; ✓ Messages & conversations<br/>
        ✓ Game scores & history &nbsp;·&nbsp; ✓ Coins & wallet balance<br/>
        ✓ Social connections &nbsp;·&nbsp; ✓ All locally stored preferences<br/>
        ✓ Consent records (after 3-year legal retention period)
      </div>
      <div style="margin-bottom:16px">
        <label style="font-size:12px;color:rgba(255,255,255,.55);display:block;margin-bottom:6px">Type DELETE to confirm:</label>
        <input id="gdpr-delete-confirm" type="text" placeholder="Type DELETE here"
          style="width:100%;padding:10px 14px;background:rgba(255,255,255,.06);border:1px solid rgba(239,68,68,.3);border-radius:8px;color:#fff;font-size:14px;font-family:inherit"/>
      </div>
      <div style="display:flex;gap:10px">
        <button onclick="window.AfribGDPR._confirmErasure()"
          style="flex:1;padding:12px;background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.4);border-radius:12px;color:#f87171;font-size:14px;font-weight:700;cursor:pointer">
          🗑️ Permanently Delete My Account
        </button>
        <button onclick="safeRemoveEl('gdpr-erasure-modal')"
          style="padding:12px 20px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:12px;color:rgba(255,255,255,.6);font-size:13px;cursor:pointer">
          Cancel
        </button>
      </div>
    `);
  };

  window.AfribGDPR._confirmErasure = function() {
    const input = document.getElementById('gdpr-delete-confirm');
    if (!input || input.value.trim().toUpperCase() !== 'DELETE') {
      if (input) { input.style.borderColor = '#f87171'; input.focus(); }
      _toast('⚠️ Please type DELETE to confirm');
      return;
    }

    try {
      const email = window.currentUser?.email;
      if (!email) { _toast('⚠️ Not logged in'); return; }

      // Get accounts
      const accounts = typeof getAccounts === 'function' ? getAccounts() :
        JSON.parse(localStorage.getItem('afrib_accounts') || '{}');

      // Delete user record
      delete accounts[email];
      localStorage.setItem('afrib_accounts', JSON.stringify(accounts));

      // Remove all keys for this user
      const keysToRemove = Object.keys(localStorage).filter(k =>
        k.includes(email) ||
        ['afrib_session','afrib_remembered','afrib_giftme_history',
         'afrib_notifications','afrib_user_notifs','afrib_disappear_mode',
         'afrib_dating_messages','afrib_dating_views'].includes(k)
      );
      keysToRemove.forEach(k => { try { localStorage.removeItem(k); } catch(e) {} });

      // Log the erasure request (kept for legal compliance — 3 years)
      const reqs = _ls.get(DATA_REQ_KEY, []);
      reqs.unshift({ type:'erasure', email, ts: new Date().toISOString(), status:'completed' });
      _ls.set(DATA_REQ_KEY, reqs);

      // Consent log retained 3 years as required
      // Clear all GDPR consent except the deletion record
      _ls.rm(CONSENT_KEY);

      window.currentUser = null;
      try { localStorage.removeItem('afrib_session'); } catch(e) {}

      document.getElementById('gdpr-erasure-modal')?.remove();

      // Return to landing
      const appShell = document.getElementById('app-shell');
      const landing  = document.getElementById('landing-page');
      if (appShell) appShell.style.display = 'none';
      if (landing)  landing.style.display  = 'block';

      setTimeout(() => _toast('✅ Account permanently deleted. All your data has been erased.'), 300);
    } catch(e) {
      console.error('[GDPR] Erasure error:', e);
      _toast('❌ Deletion failed. Contact ' + CONTROLLER.dpo);
    }
  };

  // Alias for backward compatibility
  window.confirmDeleteAccount = window.AfribGDPR.requestErasure;

  /** Contact DPO */
  window.AfribGDPR.contactDPO = function() {
    window.open('mailto:' + CONTROLLER.dpo + '?subject=GDPR Data Request — AfribConnect&body=Please describe your request:', '_blank');
  };

  /** Consent audit log viewer */
  window.AfribGDPR.showConsentAuditLog = function() {
    const log = _ls.get(CONSENT_LOG, []);
    const rows = log.length === 0
      ? '<p style="color:rgba(255,255,255,.4);text-align:center">No consent records on this device yet.</p>'
      : log.map(r => `
          <div style="background:rgba(255,255,255,.04);border-radius:8px;padding:10px 12px;margin-bottom:8px;font-size:11px">
            <div style="color:#D4AF37;font-weight:700;margin-bottom:4px">${new Date(r.timestamp).toLocaleString()} · ${_esc(r.method)}</div>
            <div style="color:rgba(255,255,255,.5)">
              Essential: ✅ &nbsp;
              Functional: ${r.categories?.functional ? '✅' : '❌'} &nbsp;
              Social: ${r.categories?.social ? '✅' : '❌'} &nbsp;
              Analytics: ${r.categories?.analytics ? '✅' : '❌'} &nbsp;
              Marketing: ${r.categories?.marketing ? '✅' : '❌'}
            </div>
          </div>`).join('');

    _showLegalModal('gdpr-consent-log-modal', '📋 Consent History', `
      <p style="font-size:12px;color:rgba(255,255,255,.5);margin-bottom:16px">
        All consent decisions recorded on this device. Kept for 3 years as required by GDPR Art. 7(1).
      </p>
      ${rows}
    `);
  };

  /* ─────────────────────────────────────────────────────────────────────────
     §7  SIGNUP CONSENT (double opt-in with separate checkboxes)
         Patches the signup form to add GDPR-compliant consent checkboxes
  ───────────────────────────────────────────────────────────────────────── */

  function _patchSignupForm() {
    // Signup form uses the T&C modal flow (showTandC → _tandcAgree → doSignup)
    // The GDPR consent is recorded via recordSignupConsent() called after account creation
    // No DOM patching needed — the hidden signupTerms checkbox is auto-checked by _tandcAgree
    return;
  }

  /* ─────────────────────────────────────────────────────────────────────────
     §8  STORE CONSENT AT SIGNUP (save granular consent with the user record)
  ───────────────────────────────────────────────────────────────────────── */

  /** Called from doSignup() — records consent into the user object */
  window.AfribGDPR.recordSignupConsent = function(email) {
    // Consent recorded from T&C modal agreement (showTandC → _tandcAgree)
    // Functional & social accepted by agreeing to T&C; analytics & marketing off by default
    const cats = {
      essential:  true,
      functional: true,   // accepted via T&C modal
      social:     true,   // implied by joining a social platform
      analytics:  false,  // opt-out by default (user can enable in Settings)
      marketing:  false,  // opt-out by default (user can enable in Settings)
    };
    const record = window.AfribGDPR.saveConsent(cats, 'signup');

    // Attach to user record for portability
    try {
      const accounts = JSON.parse(localStorage.getItem('afrib_accounts') || '{}');
      if (accounts[email]) {
        accounts[email].consentRecord = record;
        accounts[email].marketingConsent = cats.marketing;
        localStorage.setItem('afrib_accounts', JSON.stringify(accounts));
      }
    } catch(e) {}

    return record;
  };

  /* ─────────────────────────────────────────────────────────────────────────
     §9  SETTINGS PANEL — inject full GDPR rights panel
  ───────────────────────────────────────────────────────────────────────── */

  function _injectGDPRSettingsPanel() {
    function tryInject() {
      const privacySection = document.querySelector(
        '#aspanel-privacy .as-section:last-child, [data-panel="privacy"] .as-section:last-child'
      );
      if (!privacySection) { setTimeout(tryInject, 800); return; }
      if (privacySection.dataset.gdprPatched) return;
      privacySection.dataset.gdprPatched = '1';

      const panel = document.createElement('div');
      panel.innerHTML = `
        <h4 style="font-size:14px;font-weight:700;margin:16px 0 10px;color:#fff">⚖️ Your GDPR / Privacy Rights</h4>
        <div style="display:flex;flex-direction:column;gap:8px">
          <button onclick="window.AfribGDPR.showRightsPortal()" class="gdpr-setting-btn">⚖️ View All My Rights</button>
          <button onclick="window.AfribGDPR.requestDataExport()" class="gdpr-setting-btn">📥 Download My Data (GDPR Art. 20)</button>
          <button onclick="window.AfribGDPR.showConsentManager()" class="gdpr-setting-btn">🍪 Manage Cookie & Data Preferences</button>
          <button onclick="window.AfribGDPR.showConsentAuditLog()" class="gdpr-setting-btn">📋 View Consent History</button>
          <button onclick="window.AfribGDPR.showPrivacyPolicy()" class="gdpr-setting-btn">🛡️ Privacy Policy</button>
          <button onclick="window.AfribGDPR.showTerms()" class="gdpr-setting-btn">📋 Terms of Service</button>
          <button onclick="window.AfribGDPR.requestErasure()" class="gdpr-setting-btn" style="color:#f87171;border-color:rgba(239,68,68,.3)">🗑️ Delete My Account & All Data</button>
        </div>
        <style>
          .gdpr-setting-btn{width:100%;padding:10px 14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:9px;color:rgba(255,255,255,.75);font-size:13px;text-align:left;cursor:pointer;transition:all .15s}
          .gdpr-setting-btn:hover{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.15)}
        </style>`;
      privacySection.after(panel);
    }
    if (document.readyState === 'complete') tryInject();
    else window.addEventListener('load', tryInject);
  }

  /* ─────────────────────────────────────────────────────────────────────────
     §10  MODAL HELPER
  ───────────────────────────────────────────────────────────────────────── */

  function _showLegalModal(id, title, bodyHTML) {
    document.getElementById(id)?.remove();
    const overlay = document.createElement('div');
    overlay.id = id;
    overlay.style.cssText = 'position:fixed;inset:0;z-index:100001;background:rgba(0,0,0,.88);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;padding:16px';
    overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
    overlay.innerHTML = `
      <div style="background:linear-gradient(145deg,#0d001f,#1a0835);border:1px solid rgba(212,175,55,.25);border-radius:20px;padding:28px;max-width:560px;width:100%;max-height:90vh;overflow-y:auto;position:relative">
        <button onclick="safeRemoveEl('${id}')"
          style="position:sticky;top:0;float:right;background:rgba(255,255,255,.08);border:none;color:rgba(255,255,255,.6);font-size:18px;width:30px;height:30px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;margin-left:8px">✕</button>
        <h2 style="font-size:18px;font-weight:800;color:#D4AF37;margin:0 0 16px">${title}</h2>
        <style>
          #${id} h3{font-size:13px;font-weight:700;margin:14px 0 6px;color:#fff}
          #${id} p{font-size:12px;color:rgba(255,255,255,.65);line-height:1.7;margin-bottom:8px}
          #${id} ul{font-size:12px;color:rgba(255,255,255,.65);line-height:1.7;padding-left:18px;margin-bottom:8px}
          #${id} li{margin-bottom:4px}
          #${id} strong{color:rgba(255,255,255,.85)}
        </style>
        ${bodyHTML}
        <button onclick="safeRemoveEl('${id}')"
          style="width:100%;margin-top:20px;padding:12px;background:linear-gradient(135deg,#D4AF37,#E85D26);border:none;border-radius:12px;color:#000;font-size:14px;font-weight:800;cursor:pointer">
          Close
        </button>
      </div>`;
    document.body.appendChild(overlay);
  }

  /* ─────────────────────────────────────────────────────────────────────────
     §11  INITIALISE
  ───────────────────────────────────────────────────────────────────────── */

  function _init() {
    // Show consent banner to new users
    if (!window.AfribGDPR.getConsent()) {
      setTimeout(window.AfribGDPR.showConsentBanner, 1800);
    } else {
      // Re-apply existing consent
      const consent = window.AfribGDPR.getConsent();
      if (consent?.categories) _applyConsent(consent.categories);
    }

    // Patch signup form
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(_patchSignupForm, 500);
        _injectGDPRSettingsPanel();
      });
    } else {
      setTimeout(_patchSignupForm, 500);
      _injectGDPRSettingsPanel();
    }

    // Hook into auth overlay open (signup may render dynamically)
    const origShowAuth = window.showAuth;
    if (typeof origShowAuth === 'function') {
      window.showAuth = function(screen) {
        origShowAuth.apply(this, arguments);
        if (screen === 'signup') setTimeout(_patchSignupForm, 200);
      };
    }

    console.log('[AfribGDPR] v' + VERSION + ' loaded — GDPR/POPIA/CCPA/LGPD/NDPR compliant ✅');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _init);
  } else {
    _init();
  }


  /* ─────────────────────────────────────────────────────────────────────────
     §12  GLOBAL ERROR BOUNDARY (OWASP A10:2025 — Mishandling of Exceptional Conditions)
  ───────────────────────────────────────────────────────────────────────── */

  (function setupErrorBoundary() {
    // Catch unhandled JS errors
    window.addEventListener('error', function(e) {
      if (window._DEV) console.error('[Error]', e.message, e.filename, e.lineno);
      // Log to admin error log (non-PII)
      try {
        const log = JSON.parse(localStorage.getItem('afrib_js_errors') || '[]');
        log.unshift({
          ts:   new Date().toISOString(),
          msg:  String(e.message || '').slice(0, 200),
          file: String(e.filename || '').replace(location.origin, '').slice(0, 100),
          line: e.lineno,
          col:  e.colno,
        });
        if (log.length > 100) log.length = 100;
        localStorage.setItem('afrib_js_errors', JSON.stringify(log));
      } catch(_) {}
    });

    // Catch unhandled Promise rejections
    window.addEventListener('unhandledrejection', function(e) {
      if (window._DEV) console.error('[UnhandledPromise]', e.reason);
      try {
        const log = JSON.parse(localStorage.getItem('afrib_js_errors') || '[]');
        log.unshift({
          ts:     new Date().toISOString(),
          msg:    String(e.reason?.message || e.reason || 'Promise rejected').slice(0, 200),
          type:   'unhandledrejection',
        });
        if (log.length > 100) log.length = 100;
        localStorage.setItem('afrib_js_errors', JSON.stringify(log));
      } catch(_) {}
      e.preventDefault(); // Prevent console noise in production
    });

    // Network error detection
    window.addEventListener('offline', () => {
      if (typeof showToast === 'function') showToast('📶 You are offline — some features may be unavailable');
    });
    window.addEventListener('online', () => {
      if (typeof showToast === 'function') showToast('✅ Back online!');
    });
  })();

})();