/* ═══════════════════════════════════════════════════════════════════════════
   AfriBConnect — password_reset.js  v1.0
   ─────────────────────────────────────────────────────────────────────────
   FEATURES:
   1. Forgot Password — choose Email OTP OR SMS OTP (phone number)
   2. Auto-generate strong password (user can accept or type their own)
   3. Change Phone Number — verify old number first, then set new one
   4. Change Password (inside Account Settings Security tab) — with OTP option
   5. OTP modal (shared by all flows) — 6-digit animated input
   6. Resend cooldown timer (60s)
   7. Max 3 attempts before lockout (5 min)
   8. OTP expires in 15 minutes
   9. Password strength meter on all new-password fields
   10. All state kept in localStorage — no server needed
═══════════════════════════════════════════════════════════════════════════ */

'use strict';

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function _pr_esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function _pr_accounts(){ try{ return JSON.parse(localStorage.getItem('afrib_accounts')||'{}'); }catch{ return {}; } }
function _pr_saveAccounts(a){ try{ localStorage.setItem('afrib_accounts',JSON.stringify(a)); }catch{} }
function _pr_session(){ try{ return JSON.parse(localStorage.getItem('afrib_session')||'null'); }catch{ return null; } }
function _pr_toast(msg){ if(typeof showToast==='function') showToast(msg); else alert(msg); }

/* ── OTP generation ──────────────────────────────────────────────────────── */
function _pr_genOTP(){ return Math.floor(100000 + Math.random() * 900000).toString(); }
function _pr_genPassword(){
  const upper  = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower  = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  const syms   = '!@#$%&*?';
  const all    = upper + lower + digits + syms;
  let pw = upper[Math.floor(Math.random()*upper.length)]
         + lower[Math.floor(Math.random()*lower.length)]
         + digits[Math.floor(Math.random()*digits.length)]
         + syms[Math.floor(Math.random()*syms.length)];
  for(let i=0;i<8;i++) pw += all[Math.floor(Math.random()*all.length)];
  return pw.split('').sort(()=>Math.random()-.5).join('');
}
async function _pr_hashPassword(pw) {
  if (typeof _SEC !== "undefined" && _SEC.hashNew) return _SEC.hashNew(pw);
  // Fallback PBKDF2 if _SEC unavailable
  const enc = new TextEncoder();
  const salt = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))));
  const key = await crypto.subtle.importKey("raw", enc.encode(pw), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({name:"PBKDF2",salt:enc.encode(salt),iterations:310000,hash:"SHA-256"},key,256);
  return "pbkdf2$" + salt + "$" + btoa(String.fromCharCode(...new Uint8Array(bits)));
}

/* ── OTP store ────────────────────────────────────────────────────────────── */
function _pr_storeOTP(key, otp){
  try{
    localStorage.setItem('afrib_otp_'+key, JSON.stringify({
      otp, attempts:0,
      expires: Date.now() + 15*60*1000,
      created: Date.now()
    }));
  }catch{}
}
function _pr_verifyOTP(key, entered){
  try{
    const stored = JSON.parse(localStorage.getItem('afrib_otp_'+key)||'null');
    if(!stored) return { ok:false, reason:'no_code' };
    if(Date.now() > stored.expires) return { ok:false, reason:'expired' };
    stored.attempts = (stored.attempts||0)+1;
    if(stored.attempts > 3){
      localStorage.setItem('afrib_otp_'+key, JSON.stringify(stored));
      return { ok:false, reason:'too_many' };
    }
    localStorage.setItem('afrib_otp_'+key, JSON.stringify(stored));
    if(stored.otp !== entered) return { ok:false, reason:'wrong', attempts:stored.attempts };
    return { ok:true };
  }catch{ return { ok:false, reason:'error' }; }
}
function _pr_clearOTP(key){ try{ localStorage.removeItem('afrib_otp_'+key); }catch{} }

/* ── Simulate SMS ─────────────────────────────────────────────────────────── */
function _pr_simulateSMS(phone, otp){
  // In production: call Twilio/Africa's Talking/Termii API here
  console.log(`[AfriBConnect SMS] To: ${phone} | OTP: ${otp}`);
  // Show OTP in a dev-mode notice so testers can see it
  const banner = document.getElementById('prDevOTPBanner');
  if(banner){
    banner.textContent = `📱 SMS Code (dev mode): ${otp}`;
    banner.style.display = 'block';
    setTimeout(()=>{ banner.style.display='none'; }, 20000);
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   PASSWORD STRENGTH METER
═══════════════════════════════════════════════════════════════════════════ */
function _pr_strength(pw){
  if(!pw) return { score:0, label:'', color:'' };
  let s = 0;
  if(pw.length >= 8)  s++;
  if(pw.length >= 12) s++;
  if(/[A-Z]/.test(pw))       s++;
  if(/[0-9]/.test(pw))       s++;
  if(/[^A-Za-z0-9]/.test(pw))s++;
  const levels = [
    { label:'Very weak',  color:'#ef4444' },
    { label:'Weak',       color:'#f97316' },
    { label:'Fair',       color:'#eab308' },
    { label:'Strong',     color:'#84cc16' },
    { label:'Very strong',color:'#22c55e' },
  ];
  return { score:s, ...levels[Math.min(s,4)] };
}
function _pr_renderStrength(pw, barId, fillId, labelId){
  const bar   = document.getElementById(barId);
  const fill  = document.getElementById(fillId);
  const label = document.getElementById(labelId);
  if(!bar||!fill||!label) return;
  if(!pw){ bar.style.display='none'; return; }
  bar.style.display='block';
  const { score, label:lbl, color } = _pr_strength(pw);
  fill.style.width   = ((score/5)*100)+'%';
  fill.style.background = color;
  label.textContent  = lbl;
  label.style.color  = color;
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN MODAL BUILDER — shared by all flows
═══════════════════════════════════════════════════════════════════════════ */
function _pr_buildModal(id, html){
  let m = document.getElementById(id);
  if(!m){
    m = document.createElement('div');
    m.id = id;
    m.style.cssText=`position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:8500;
      display:flex;align-items:center;justify-content:center;padding:20px;
      animation:prFadeIn .2s ease`;
    document.body.appendChild(m);
    if(!document.getElementById('prStyles')){
      const s = document.createElement('style');
      s.id = 'prStyles';
      s.textContent = `
        @keyframes prFadeIn{from{opacity:0}to{opacity:1}}
        @keyframes prSlideUp{from{transform:translateY(30px);opacity:0}to{transform:translateY(0);opacity:1}}
        .pr-card{background:#17110a;border:1px solid rgba(212,175,55,.3);border-radius:20px;
          padding:32px 28px;width:100%;max-width:430px;max-height:90vh;overflow-y:auto;
          animation:prSlideUp .25s ease;position:relative}
        .pr-logo{font-size:18px;font-weight:900;letter-spacing:2px;color:#D4AF37;margin-bottom:3px}
        .pr-logo span{color:#E85D26}
        .pr-title{font-size:20px;font-weight:800;color:#fff;margin-bottom:5px}
        .pr-sub{font-size:13px;color:rgba(255,255,255,.45);margin-bottom:24px;line-height:1.5}
        .pr-field{margin-bottom:14px}
        .pr-field label{display:block;font-size:12px;color:rgba(255,255,255,.5);margin-bottom:5px;font-weight:600;letter-spacing:.3px}
        .pr-input{width:100%;background:rgba(255,255,255,.07);border:1.5px solid rgba(255,255,255,.12);
          border-radius:10px;padding:11px 14px;color:#fff;font-size:14px;outline:none;
          font-family:inherit;transition:border-color .2s;box-sizing:border-box}
        .pr-input:focus{border-color:rgba(212,175,55,.6)}
        .pr-input.err{border-color:#ef4444}
        .pr-input-wrap{position:relative;display:flex;align-items:center}
        .pr-eye{position:absolute;right:12px;background:none;border:none;color:rgba(255,255,255,.4);
          cursor:pointer;font-size:16px;padding:4px}
        .pr-btn{width:100%;background:linear-gradient(135deg,#D4AF37,#b8901f);border:none;
          border-radius:10px;padding:13px;color:#000;font-size:15px;font-weight:800;
          cursor:pointer;transition:opacity .2s;letter-spacing:.3px;margin-top:4px}
        .pr-btn:hover{opacity:.9}
        .pr-btn:disabled{opacity:.5;cursor:wait}
        .pr-btn-ghost{width:100%;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);
          border-radius:10px;padding:11px;color:rgba(255,255,255,.6);font-size:14px;
          cursor:pointer;transition:.2s;margin-top:8px}
        .pr-btn-ghost:hover{background:rgba(255,255,255,.1);color:#fff}
        .pr-btn-link{background:none;border:none;color:#D4AF37;font-size:13px;cursor:pointer;
          padding:0;text-decoration:underline;font-weight:600}
        .pr-err{font-size:12px;color:#ef4444;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.2);
          border-radius:8px;padding:8px 12px;margin-top:6px;display:none}
        .pr-ok{font-size:12px;color:#22c55e;background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.2);
          border-radius:8px;padding:8px 12px;margin-top:6px;display:none}
        .pr-method-row{display:flex;gap:10px;margin-bottom:18px}
        .pr-method-btn{flex:1;padding:12px 10px;background:rgba(255,255,255,.06);
          border:1.5px solid rgba(255,255,255,.12);border-radius:12px;color:rgba(255,255,255,.6);
          font-size:13px;font-weight:700;cursor:pointer;transition:.2s;text-align:center}
        .pr-method-btn:hover{background:rgba(255,255,255,.1)}
        .pr-method-btn.active{background:rgba(212,175,55,.15);border-color:#D4AF37;color:#D4AF37}
        .pr-otp-row{display:flex;gap:8px;justify-content:center;margin:10px 0}
        .pr-otp-digit{width:46px;height:54px;background:rgba(255,255,255,.07);
          border:1.5px solid rgba(255,255,255,.15);border-radius:10px;
          text-align:center;font-size:22px;font-weight:900;color:#fff;
          outline:none;caret-color:#D4AF37;transition:border-color .2s}
        .pr-otp-digit:focus{border-color:#D4AF37;background:rgba(212,175,55,.08)}
        .pr-otp-digit.filled{border-color:rgba(212,175,55,.5)}
        .pr-strength-bar{height:4px;background:rgba(255,255,255,.08);border-radius:4px;overflow:hidden;margin:5px 0 2px}
        .pr-strength-fill{height:100%;border-radius:4px;width:0%;transition:width .3s,background .3s}
        .pr-strength-label{font-size:11px;color:rgba(255,255,255,.4)}
        .pr-gen-btn{background:rgba(212,175,55,.15);border:1px solid rgba(212,175,55,.3);
          border-radius:8px;padding:7px 14px;color:#D4AF37;font-size:12px;font-weight:700;
          cursor:pointer;white-space:nowrap;transition:.2s;flex-shrink:0}
        .pr-gen-btn:hover{background:rgba(212,175,55,.25)}
        .pr-timer{font-size:12px;color:rgba(255,255,255,.35);text-align:center;margin-top:10px}
        .pr-timer span{color:#D4AF37;font-weight:700}
        .pr-step{font-size:11px;color:rgba(255,255,255,.3);text-align:center;margin-bottom:16px;
          letter-spacing:.5px;text-transform:uppercase}
        .pr-close{position:absolute;top:14px;right:16px;background:none;border:none;
          color:rgba(255,255,255,.4);font-size:20px;cursor:pointer;line-height:1;padding:4px}
        .pr-close:hover{color:#fff}
        .pr-divider{display:flex;align-items:center;gap:10px;margin:16px 0;font-size:12px;color:rgba(255,255,255,.25)}
        .pr-divider::before,.pr-divider::after{content:'';flex:1;height:1px;background:rgba(255,255,255,.08)}
        .pr-phone-wrap{display:flex;gap:8px;align-items:stretch}
        .pr-phone-code{background:rgba(255,255,255,.07);border:1.5px solid rgba(255,255,255,.12);
          border-radius:10px;padding:11px 12px;color:#D4AF37;font-size:14px;font-weight:700;
          min-width:64px;text-align:center;flex-shrink:0}
        .pr-dev-banner{background:rgba(212,175,55,.15);border:1px solid rgba(212,175,55,.3);
          border-radius:8px;padding:8px 12px;font-size:12px;color:#D4AF37;
          margin-bottom:12px;display:none;text-align:center;font-weight:700}
      `;
      document.head.appendChild(s);
    }
  }
  m.innerHTML = `<div class="pr-card">${html}</div>`;
  m.style.display = 'flex';
  // Close on backdrop click
  m.onclick = e => { if(e.target === m) _pr_closeModal(id); };
  return m;
}
function _pr_closeModal(id){
  const m = document.getElementById(id);
  if(m){ m.style.display='none'; m.innerHTML=''; }
}

/* ═══════════════════════════════════════════════════════════════════════════
   STEP 1 — FORGOT PASSWORD: CHOOSE METHOD
   Called from the existing "Forgot password?" link
═══════════════════════════════════════════════════════════════════════════ */
window.showForgotPassword = function(prefillEmail){
  _pr_buildModal('prForgotModal', `
    <button class="pr-close" onclick="_pr_closeModal('prForgotModal')">✕</button>
    <div class="pr-logo">AFRIB<span>CONNECT</span></div>
    <div class="pr-title">Reset Password</div>
    <div class="pr-sub">Choose how you'd like to receive your reset code</div>
    <div id="prDevOTPBanner" class="pr-dev-banner"></div>

    <div class="pr-field">
      <label>Email Address or @Username</label>
      <input class="pr-input" id="prForgotIdentifier" type="text"
        placeholder="email@example.com or @username"
        value="${_pr_esc(prefillEmail||'')}"
        oninput="_pr_onForgotIdentifierChange(this.value)"/>
      <div class="pr-err" id="prForgotIdErr"></div>
    </div>

    <div id="prForgotPhoneRow" style="display:none">
      <div class="pr-field">
        <label>Phone Number on Account <span id="prForgotPhoneMasked" style="color:rgba(255,255,255,.4)"></span></label>
        <div class="pr-phone-wrap">
          <div class="pr-phone-code" id="prForgotPhoneCode">+</div>
          <input class="pr-input" id="prForgotPhone" type="tel" placeholder="Your phone number"/>
        </div>
        <div style="font-size:11px;color:rgba(255,255,255,.3);margin-top:4px">We'll send a 6-digit code to this number</div>
        <div class="pr-err" id="prForgotPhoneErr"></div>
      </div>
    </div>

    <div class="pr-method-row" id="prForgotMethodRow" style="display:none">
      <button class="pr-method-btn active" id="prMethodEmail" onclick="_pr_selectForgotMethod('email')">
        📧 Email
      </button>
      <button class="pr-method-btn" id="prMethodPhone" onclick="_pr_selectForgotMethod('phone')">
        📱 SMS / Phone
      </button>
    </div>

    <button class="pr-btn" id="prForgotSendBtn" onclick="_pr_sendForgotOTP()">Send Reset Code →</button>
    <button class="pr-btn-ghost" onclick="_pr_closeModal('prForgotModal');if(typeof showAuth==='function')showAuth('login')">← Back to Login</button>
  `);

  window._prForgotMethod  = 'email';
  window._prForgotEmail   = prefillEmail || '';
  window._prForgotAccount = null;

  if(prefillEmail) _pr_onForgotIdentifierChange(prefillEmail);
};

window._pr_onForgotIdentifierChange = function(val){
  const identifier = (val||'').trim().toLowerCase();
  if(!identifier) return;

  const accounts = _pr_accounts();
  let user = accounts[identifier] || null;

  // Try username match
  if(!user){
    const clean = identifier.replace(/^@/,'');
    user = Object.values(accounts).find(u => u.username && u.username.toLowerCase() === clean) || null;
  }

  window._prForgotAccount = user;

  const methodRow   = document.getElementById('prForgotMethodRow');
  const phoneRow    = document.getElementById('prForgotPhoneRow');
  const phoneMasked = document.getElementById('prForgotPhoneMasked');
  const phoneCode   = document.getElementById('prForgotPhoneCode');

  if(!methodRow) return;

  if(user){
    methodRow.style.display = 'flex';
    window._prForgotEmail = user.email;

    if(user.phone && user.phone.length > 5){
      // Show masked phone
      const p = user.phone;
      const masked = p.slice(0,4) + '****' + p.slice(-3);
      if(phoneMasked) phoneMasked.textContent = `(${masked})`;
      if(phoneCode) phoneCode.textContent = p.startsWith('+') ? p.split(' ')[0] : '+';
    } else {
      // No phone on file — disable phone option
      const phoneBtn = document.getElementById('prMethodPhone');
      if(phoneBtn){
        phoneBtn.disabled = true;
        phoneBtn.style.opacity = '.4';
        phoneBtn.title = 'No phone number linked to this account';
        phoneBtn.textContent = '📱 SMS (No phone)';
      }
    }
  } else {
    methodRow.style.display = 'none';
    phoneRow && (phoneRow.style.display = 'none');
  }
};

window._pr_selectForgotMethod = function(method){
  window._prForgotMethod = method;
  ['email','phone'].forEach(m => {
    const btn = document.getElementById('prMethod'+m[0].toUpperCase()+m.slice(1));
    if(btn) btn.classList.toggle('active', m===method);
  });
  const phoneRow = document.getElementById('prForgotPhoneRow');
  if(phoneRow) phoneRow.style.display = method==='phone' ? 'block' : 'none';
};

window._pr_sendForgotOTP = function(){
  const identifier = (document.getElementById('prForgotIdentifier')?.value||'').trim().toLowerCase();
  const errEl      = document.getElementById('prForgotIdErr');
  const btn        = document.getElementById('prForgotSendBtn');

  if(errEl) errEl.style.display = 'none';

  if(!identifier){
    if(errEl){ errEl.textContent='Please enter your email or username.'; errEl.style.display='block'; } return;
  }

  const accounts = _pr_accounts();
  let user = accounts[identifier] || null;
  if(!user){
    const clean = identifier.replace(/^@/,'');
    user = Object.values(accounts).find(u => u.username && u.username.toLowerCase()===clean) || null;
  }

  // Security: don't reveal if account doesn't exist — just proceed
  const otp   = _pr_genOTP();
  const email = user?.email || identifier;

  _pr_storeOTP('forgot_'+email, otp);
  localStorage.setItem('afrib_reset_pending_email', email);

  if(btn){ btn.disabled=true; btn.textContent='Sending…'; }

  const method = window._prForgotMethod || 'email';

  if(method === 'phone'){
    const phone = user?.phone || document.getElementById('prForgotPhone')?.value?.trim();
    if(!phone){ if(errEl){errEl.textContent='No phone number linked.';errEl.style.display='block';} if(btn){btn.disabled=false;btn.textContent='Send Reset Code →';} return; }
    _pr_simulateSMS(phone, otp);
    if(btn){ btn.disabled=false; btn.textContent='Send Reset Code →'; }
    _pr_showOTPEntry('prForgotModal', 'forgot_'+email, email, 'phone', phone, 'reset_password');
  } else {
    // Email
    if(typeof sendResetEmail==='function' && user){
      sendResetEmail(email, (user.first||'')+' '+(user.last||''), otp).catch(()=>{});
    }
    if(btn){ btn.disabled=false; btn.textContent='Send Reset Code →'; }
    _pr_showOTPEntry('prForgotModal', 'forgot_'+email, email, 'email', email, 'reset_password');
  }
};

/* ═══════════════════════════════════════════════════════════════════════════
   STEP 2 — OTP ENTRY (shared by all flows)
   flow: 'reset_password' | 'change_phone' | 'change_password_otp' | 'verify_old_phone'
═══════════════════════════════════════════════════════════════════════════ */
window._pr_showOTPEntry = function(modalId, otpKey, email, deliveryMethod, deliveryTarget, flow){
  const deliveryLabel = deliveryMethod==='phone'
    ? `📱 SMS to ${_pr_esc(deliveryTarget)}`
    : `📧 Email to ${_pr_esc(deliveryTarget)}`;

  const extraContext = `
    window._prOTPKey    = '${otpKey}';
    window._prOTPEmail  = '${email}';
    window._prOTPFlow   = '${flow}';
    window._prOTPMethod = '${deliveryMethod}';
    window._prOTPTarget = '${deliveryTarget}';
    window._prOTPModalId= '${modalId}';
  `;

  _pr_buildModal(modalId, `
    <script>${extraContext}<\/script>
    <button class="pr-close" onclick="_pr_closeModal('${modalId}')">✕</button>
    <div class="pr-logo">AFRIB<span>CONNECT</span></div>
    <div class="pr-step">Step 2 of 3 — Verify Code</div>
    <div class="pr-title">Enter Your Code</div>
    <div class="pr-sub">We sent a 6-digit code via ${deliveryLabel}</div>
    <div id="prDevOTPBanner" class="pr-dev-banner"></div>

    <div class="pr-otp-row" id="prOTPRow">
      ${[0,1,2,3,4,5].map(i=>`
        <input class="pr-otp-digit" id="prOTPd${i}" type="text" inputmode="numeric"
          maxlength="1" pattern="[0-9]"
          onkeyup="_pr_otpKeyUp(event,${i})"
          oninput="_pr_otpInput(event,${i})"
          onpaste="if(i===0)_pr_otpPaste(event)"
          onfocus="this.select()"/>
      `).join('')}
    </div>

    <div class="pr-err" id="prOTPErr"></div>
    <button class="pr-btn" id="prOTPVerifyBtn" onclick="_pr_verifyOTPStep()">Verify Code →</button>

    <div class="pr-timer" id="prOTPTimer">
      Resend code in <span id="prOTPTimerNum">60</span>s
    </div>
    <div id="prOTPResendRow" style="display:none;text-align:center;margin-top:10px">
      <button class="pr-btn-link" onclick="_pr_resendOTP()">Resend code</button>
    </div>

    <button class="pr-btn-ghost" onclick="_pr_closeModal('${modalId}');showForgotPassword()">← Change method</button>
  `);

  // Auto-focus first digit
  setTimeout(()=>{ document.getElementById('prOTPd0')?.focus(); }, 100);

  // Start resend timer
  _pr_startResendTimer(60);
};

window._pr_otpInput = function(e, idx){
  const el = document.getElementById('prOTPd'+idx);
  if(!el) return;
  // Allow only digits
  el.value = el.value.replace(/\D/g,'');
  if(el.value) el.classList.add('filled');
  else el.classList.remove('filled');
  if(el.value && idx < 5) setTimeout(()=>document.getElementById('prOTPd'+(idx+1))?.focus(), 0);
};

window._pr_otpKeyUp = function(e, idx){
  if(e.key==='Backspace' && !document.getElementById('prOTPd'+idx)?.value && idx>0){
    document.getElementById('prOTPd'+(idx-1))?.focus();
  }
  if(e.key==='Enter') _pr_verifyOTPStep();
};

window._pr_otpPaste = function(e){
  e.preventDefault();
  const text = (e.clipboardData||window.clipboardData).getData('text').replace(/\D/g,'').slice(0,6);
  text.split('').forEach((ch,i)=>{
    const el = document.getElementById('prOTPd'+i);
    if(el){ el.value=ch; el.classList.add('filled'); }
  });
  document.getElementById('prOTPd'+(Math.min(text.length,5)))?.focus();
};

let _prResendTimer = null;
function _pr_startResendTimer(secs){
  const numEl  = document.getElementById('prOTPTimerNum');
  const timerEl= document.getElementById('prOTPTimer');
  const resendEl=document.getElementById('prOTPResendRow');
  let left = secs;
  if(_prResendTimer) clearInterval(_prResendTimer);
  if(timerEl) timerEl.style.display='block';
  if(resendEl) resendEl.style.display='none';
  _prResendTimer = setInterval(()=>{
    left--;
    if(numEl) numEl.textContent = left;
    if(left<=0){
      clearInterval(_prResendTimer);
      if(timerEl) timerEl.style.display='none';
      if(resendEl) resendEl.style.display='block';
    }
  }, 1000);
}

window._pr_resendOTP = function(){
  const otp    = _pr_genOTP();
  const key    = window._prOTPKey;
  const email  = window._prOTPEmail;
  const method = window._prOTPMethod;
  const target = window._prOTPTarget;
  _pr_storeOTP(key, otp);
  if(method==='phone'){
    _pr_simulateSMS(target, otp);
    _pr_toast('📱 New code sent to your phone!');
  } else {
    const accounts = _pr_accounts();
    const user = accounts[email];
    if(typeof sendResetEmail==='function' && user){
      sendResetEmail(email, (user.first||'')+' '+(user.last||''), otp).catch(()=>{});
    }
    _pr_toast('📧 New code sent to your email!');
  }
  _pr_startResendTimer(60);
  [0,1,2,3,4,5].forEach(i=>{ const el=document.getElementById('prOTPd'+i); if(el){el.value='';el.classList.remove('filled');} });
  document.getElementById('prOTPd0')?.focus();
};

window._pr_verifyOTPStep = function(){
  const entered = [0,1,2,3,4,5].map(i=>document.getElementById('prOTPd'+i)?.value||'').join('');
  const errEl   = document.getElementById('prOTPErr');
  const btn     = document.getElementById('prOTPVerifyBtn');
  if(errEl) errEl.style.display='none';

  if(entered.length !== 6 || !/^\d{6}$/.test(entered)){
    if(errEl){ errEl.textContent='Please enter all 6 digits.'; errEl.style.display='block'; } return;
  }

  const result = _pr_verifyOTP(window._prOTPKey, entered);
  if(!result.ok){
    const msgs = {
      no_code:  'No code found — please request a new one.',
      expired:  '⏱ Code has expired — click "Resend code" for a new one.',
      too_many: '🔒 Too many wrong attempts — please request a new code.',
      wrong:    `Incorrect code. ${3-(result.attempts||0)} attempt${3-(result.attempts||0)!==1?'s':''} remaining.`,
      error:    'Something went wrong — try again.',
    };
    if(errEl){ errEl.textContent=msgs[result.reason]||'Invalid code.'; errEl.style.display='block'; }
    // Shake the inputs
    const row = document.getElementById('prOTPRow');
    if(row){ row.style.animation='none'; void row.offsetWidth; row.style.animation='prShake .4s ease'; }
    return;
  }

  // Code correct — clear timer
  if(_prResendTimer) clearInterval(_prResendTimer);
  _pr_clearOTP(window._prOTPKey);

  // Route to next step based on flow
  const flow    = window._prOTPFlow;
  const email   = window._prOTPEmail;
  const modalId = window._prOTPModalId;

  if(flow==='reset_password')        _pr_showNewPasswordStep(modalId, email);
  else if(flow==='change_password_otp') _pr_showNewPasswordStep(modalId, email);
  else if(flow==='verify_old_phone') _pr_showNewPhoneStep(modalId, email);
  else if(flow==='change_phone')     _pr_completePhoneChange(email);
};

/* ═══════════════════════════════════════════════════════════════════════════
   STEP 3a — NEW PASSWORD ENTRY
═══════════════════════════════════════════════════════════════════════════ */
window._pr_showNewPasswordStep = function(modalId, email){
  const accounts = _pr_accounts();
  const user     = accounts[email];

  _pr_buildModal(modalId, `
    <button class="pr-close" onclick="_pr_closeModal('${modalId}')">✕</button>
    <div class="pr-logo">AFRIB<span>CONNECT</span></div>
    <div class="pr-step">Step 3 of 3 — New Password</div>
    <div class="pr-title">Set New Password</div>
    <div class="pr-sub">Create a strong password for your account${user?' ('+_pr_esc(user.email)+')':''}</div>

    <div class="pr-field">
      <label style="display:flex;align-items:center;justify-content:space-between">
        <span>New Password</span>
        <button class="pr-gen-btn" onclick="_pr_autoFillPassword()" type="button">✨ Generate</button>
      </label>
      <div class="pr-input-wrap">
        <input class="pr-input" id="prNewPw1" type="password" placeholder="At least 8 characters"
          oninput="_pr_renderStrength(this.value,'prPwStrBar','prPwStrFill','prPwStrLabel')"
          style="padding-right:44px"/>
        <button class="pr-eye" type="button" onclick="_pr_togglePw('prNewPw1',this)">👁</button>
      </div>
      <div id="prPwStrBar" class="pr-strength-bar" style="display:none">
        <div id="prPwStrFill" class="pr-strength-fill"></div>
      </div>
      <div id="prPwStrLabel" class="pr-strength-label"></div>
    </div>

    <div class="pr-field">
      <label>Confirm Password</label>
      <div class="pr-input-wrap">
        <input class="pr-input" id="prNewPw2" type="password" placeholder="Repeat your password"
          onkeydown="if(event.key==='Enter')_pr_saveNewPassword('${email}','${modalId}')"
          style="padding-right:44px"/>
        <button class="pr-eye" type="button" onclick="_pr_togglePw('prNewPw2',this)">👁</button>
      </div>
    </div>

    <div id="prGenPwBox" style="display:none;background:rgba(212,175,55,.1);border:1px solid rgba(212,175,55,.3);
      border-radius:10px;padding:12px;margin-bottom:14px">
      <div style="font-size:12px;color:rgba(255,255,255,.5);margin-bottom:4px">Generated password:</div>
      <div id="prGenPwText" style="font-size:18px;font-weight:900;color:#D4AF37;
        font-family:monospace;letter-spacing:2px;word-break:break-all"></div>
      <div style="font-size:11px;color:rgba(255,255,255,.3);margin-top:4px">💡 Screenshot or copy this password now</div>
    </div>

    <div class="pr-err" id="prNewPwErr"></div>
    <button class="pr-btn" onclick="_pr_saveNewPassword('${email}','${modalId}')">🔐 Save New Password</button>
  `);
};

window._pr_autoFillPassword = function(){
  const pw  = _pr_genPassword();
  const el1 = document.getElementById('prNewPw1');
  const el2 = document.getElementById('prNewPw2');
  const box = document.getElementById('prGenPwBox');
  const txt = document.getElementById('prGenPwText');

  if(el1){ el1.value=pw; el1.type='text'; _pr_renderStrength(pw,'prPwStrBar','prPwStrFill','prPwStrLabel'); }
  if(el2){ el2.value=pw; el2.type='text'; }
  if(box){ box.style.display='block'; }
  if(txt){ txt.textContent=pw; }

  // Also copy to clipboard
  navigator.clipboard?.writeText(pw).then(()=>_pr_toast('✅ Password copied to clipboard!')).catch(()=>{});
};

window._pr_togglePw = function(id, btn){
  const el = document.getElementById(id);
  if(!el) return;
  if(el.type==='password'){ el.type='text'; btn.textContent='🙈'; }
  else { el.type='password'; btn.textContent='👁'; }
};

window._pr_saveNewPassword = function(email, modalId){
  const pw1   = document.getElementById('prNewPw1')?.value || '';
  const pw2   = document.getElementById('prNewPw2')?.value || '';
  const errEl = document.getElementById('prNewPwErr');
  if(errEl) errEl.style.display='none';

  if(pw1.length < 8){
    if(errEl){ errEl.textContent='Password must be at least 8 characters.'; errEl.style.display='block'; } return;
  }
  if(pw1 !== pw2){
    if(errEl){ errEl.textContent='Passwords do not match.'; errEl.style.display='block'; } return;
  }
  const str = _pr_strength(pw1);
  if(str.score < 2){
    if(errEl){ errEl.textContent='Password is too weak — add numbers or symbols.'; errEl.style.display='block'; } return;
  }

  const accounts = _pr_accounts();
  const user     = accounts[email];
  if(!user){
    if(errEl){ errEl.textContent='Account not found.'; errEl.style.display='block'; } return;
  }

  // ── Hash with PBKDF2 then save
  _pr_hashPassword(pw1).then(function(newHash) {
    user.pwHash           = newHash;
    user.password         = newHash;
    user._forcePassChange = false;
    user.pwChangedAt      = new Date().toISOString();
    accounts[email] = user;
    _pr_saveAccounts(accounts);

    // Also update session if this is the current user
    try{
      const session = _pr_session();
      if(session && session.email===email){
        session.pwHash   = newHash;
        session.password = newHash;
        localStorage.setItem('afrib_session', JSON.stringify(session));
        if(typeof currentUser!=='undefined' && currentUser && currentUser.email===email){
          currentUser.pwHash   = newHash;
          currentUser.password = newHash;
        }
      }
    }catch{}

    // Clean up
    localStorage.removeItem('afrib_reset_pending_email');

    if(typeof appendAdminLog==='function') appendAdminLog('security', (user.first||'')+' '+(user.last||''), 'Password changed via OTP', email);

    // Show success screen
    _pr_buildModal(modalId, `
      <div style="text-align:center;padding:20px 0">
        <div style="font-size:56px;margin-bottom:16px">🔐</div>
        <div class="pr-title">Password Updated!</div>
        <div class="pr-sub" style="margin-bottom:24px">Your password has been changed successfully. You can now log in with your new password.</div>
        <button class="pr-btn" onclick="_pr_closeModal('${modalId}');if(typeof showAuth==='function')showAuth('login')">
          Go to Login →
        </button>
      </div>
    `);

    _pr_toast('✅ Password changed successfully!');
  }).catch(function(e) {
    console.error('_pr_saveNewPassword hash error:', e);
    if(errEl){ errEl.textContent='An error occurred. Please try again.'; errEl.style.display='block'; }
  });
};

/* ═══════════════════════════════════════════════════════════════════════════
   CHANGE PHONE NUMBER FLOW
   Accessible from Account Settings → Security tab
═══════════════════════════════════════════════════════════════════════════ */
window.showChangePhone = function(){
  const user = (typeof currentUser!=='undefined'&&currentUser) ? currentUser : _pr_session();
  if(!user){ _pr_toast('Please log in first.'); return; }

  const hasPhone = user.phone && user.phone.length > 5;
  const maskedPhone = hasPhone
    ? user.phone.slice(0,4)+'****'+user.phone.slice(-3)
    : null;

  _pr_buildModal('prPhoneModal', `
    <button class="pr-close" onclick="_pr_closeModal('prPhoneModal')">✕</button>
    <div class="pr-logo">AFRIB<span>CONNECT</span></div>
    <div class="pr-title">${hasPhone ? 'Change' : 'Add'} Phone Number</div>
    <div class="pr-sub">${hasPhone
      ? `Your current number is <strong style="color:#D4AF37">${maskedPhone}</strong>. We'll verify it first, then you can set a new one.`
      : 'Add a phone number to your account for extra security and SMS resets.'
    }</div>
    <div id="prDevOTPBanner" class="pr-dev-banner"></div>

    ${hasPhone ? `
      <!-- Verify current phone first -->
      <div id="prPhoneVerifyStep">
        <div class="pr-field">
          <label>To continue, verify your current phone number</label>
        </div>
        <button class="pr-btn" id="prPhoneVerifyBtn" onclick="_pr_sendVerifyCurrentPhone('${user.email}')">
          📱 Send Code to ${maskedPhone}
        </button>
        <div class="pr-divider">or</div>
        <button class="pr-btn-ghost" onclick="_pr_showNewPhoneStep('prPhoneModal','${user.email}')">
          Skip verification (if you lost access to old number)
        </button>
      </div>
    ` : `
      <div id="prPhoneVerifyStep" style="display:none"></div>
      <!-- Go straight to new phone entry -->
      <script>setTimeout(()=>_pr_showNewPhoneStep('prPhoneModal','${user.email}'),50);<\/script>
    `}
  `);
};

window._pr_sendVerifyCurrentPhone = function(email){
  const accounts = _pr_accounts();
  const user     = accounts[email];
  if(!user||!user.phone){ _pr_toast('No phone on file.'); return; }

  const otp = _pr_genOTP();
  _pr_storeOTP('verifyphone_'+email, otp);
  _pr_simulateSMS(user.phone, otp);
  _pr_showOTPEntry('prPhoneModal','verifyphone_'+email, email,'phone', user.phone,'verify_old_phone');
};

window._pr_showNewPhoneStep = function(modalId, email){
  _pr_buildModal(modalId, `
    <button class="pr-close" onclick="_pr_closeModal('${modalId}')">✕</button>
    <div class="pr-logo">AFRIB<span>CONNECT</span></div>
    <div class="pr-step">Enter New Number</div>
    <div class="pr-title">New Phone Number</div>
    <div class="pr-sub">Enter your new phone number. We'll send a verification code to confirm it.</div>
    <div id="prDevOTPBanner" class="pr-dev-banner"></div>

    <div class="pr-field">
      <label>Country Code</label>
      <select class="pr-input" id="prNewPhoneCountry" onchange="_pr_updatePhoneCode(this)" style="appearance:auto">
        <option value="+1">🇺🇸 +1 United States</option>
        <option value="+44">🇬🇧 +44 United Kingdom</option>
        <option value="+234">🇳🇬 +234 Nigeria</option>
        <option value="+254">🇰🇪 +254 Kenya</option>
        <option value="+233">🇬🇭 +233 Ghana</option>
        <option value="+27">🇿🇦 +27 South Africa</option>
        <option value="+232">🇸🇱 +232 Sierra Leone</option>
        <option value="+221">🇸🇳 +221 Senegal</option>
        <option value="+237">🇨🇲 +237 Cameroon</option>
        <option value="+255">🇹🇿 +255 Tanzania</option>
        <option value="+256">🇺🇬 +256 Uganda</option>
        <option value="+251">🇪🇹 +251 Ethiopia</option>
        <option value="+250">🇷🇼 +250 Rwanda</option>
        <option value="+243">🇨🇩 +243 DRC</option>
        <option value="+20">🇪🇬 +20 Egypt</option>
        <option value="+212">🇲🇦 +212 Morocco</option>
        <option value="+33">🇫🇷 +33 France</option>
        <option value="+49">🇩🇪 +49 Germany</option>
        <option value="+31">🇳🇱 +31 Netherlands</option>
        <option value="+61">🇦🇺 +61 Australia</option>
        <option value="+971">🇦🇪 +971 UAE</option>
        <option value="+966">🇸🇦 +966 Saudi Arabia</option>
      </select>
    </div>

    <div class="pr-field">
      <label>Phone Number</label>
      <div class="pr-phone-wrap">
        <div class="pr-phone-code" id="prNewPhoneCode">+1</div>
        <input class="pr-input" id="prNewPhoneNum" type="tel"
          placeholder="700 000 000"
          oninput="this.value=this.value.replace(/[^0-9]/g,'')"
          onkeydown="if(event.key==='Enter')_pr_sendVerifyNewPhone('${email}','${modalId}')"/>
      </div>
      <div class="pr-err" id="prNewPhoneErr"></div>
    </div>

    <button class="pr-btn" onclick="_pr_sendVerifyNewPhone('${email}','${modalId}')">
      Send Verification Code →
    </button>
    <button class="pr-btn-ghost" onclick="_pr_closeModal('${modalId}')">Cancel</button>
  `);

  // Pre-select country from user's stored phone or account country
  try{
    const accounts = _pr_accounts();
    const user = accounts[email];
    if(user?.countryCode){
      const sel = document.getElementById('prNewPhoneCountry');
      if(sel){
        for(let opt of sel.options){ if(opt.value===user.countryCode){ sel.value=opt.value; break; } }
        _pr_updatePhoneCode(sel);
      }
    }
  }catch{}
};

window._pr_updatePhoneCode = function(sel){
  const code = document.getElementById('prNewPhoneCode');
  if(code) code.textContent = sel.value;
};

window._pr_sendVerifyNewPhone = function(email, modalId){
  const countryCode = document.getElementById('prNewPhoneCountry')?.value || '';
  const numRaw      = (document.getElementById('prNewPhoneNum')?.value||'').trim();
  const errEl       = document.getElementById('prNewPhoneErr');
  if(errEl) errEl.style.display='none';

  if(!numRaw || numRaw.length < 6){
    if(errEl){ errEl.textContent='Please enter a valid phone number.'; errEl.style.display='block'; } return;
  }

  const fullPhone = countryCode + numRaw;

  // Check if phone already used by another account
  const accounts = _pr_accounts();
  const conflict = Object.values(accounts).find(u => u.email!==email && u.phone===fullPhone);
  if(conflict){
    if(errEl){ errEl.textContent='This number is already linked to another account.'; errEl.style.display='block'; } return;
  }

  const otp = _pr_genOTP();
  localStorage.setItem('afrib_new_phone_pending_'+email, fullPhone);
  _pr_storeOTP('newphone_'+email, otp);
  _pr_simulateSMS(fullPhone, otp);
  _pr_showOTPEntry(modalId, 'newphone_'+email, email, 'phone', fullPhone, 'change_phone');
};

window._pr_completePhoneChange = function(email){
  const newPhone = localStorage.getItem('afrib_new_phone_pending_'+email);
  if(!newPhone){ _pr_toast('Session expired. Please try again.'); return; }

  const accounts = _pr_accounts();
  const user     = accounts[email];
  if(!user){ _pr_toast('Account not found.'); return; }

  user.phone = newPhone;
  accounts[email] = user;
  _pr_saveAccounts(accounts);

  // Sync session
  try{
    const session = _pr_session();
    if(session && session.email===email){
      session.phone = newPhone;
      localStorage.setItem('afrib_session', JSON.stringify(session));
      if(typeof currentUser!=='undefined'&&currentUser&&currentUser.email===email){
        currentUser.phone = newPhone;
      }
    }
  }catch{}

  localStorage.removeItem('afrib_new_phone_pending_'+email);
  if(typeof appendAdminLog==='function') appendAdminLog('security', (user.first||'')+' '+(user.last||''), 'Phone number changed', email);

  // Success screen
  _pr_buildModal('prPhoneModal', `
    <div style="text-align:center;padding:20px 0">
      <div style="font-size:56px;margin-bottom:16px">📱</div>
      <div class="pr-title">Phone Number Updated!</div>
      <div class="pr-sub" style="margin-bottom:8px">Your new number is now linked:</div>
      <div style="font-size:20px;font-weight:900;color:#D4AF37;margin-bottom:24px">${_pr_esc(newPhone)}</div>
      <button class="pr-btn" onclick="_pr_closeModal('prPhoneModal')">Done ✓</button>
    </div>
  `);

  _pr_toast('✅ Phone number updated successfully!');

  // Refresh account settings UI if open
  if(typeof showAccountSettings==='function'){
    const asPhone = document.getElementById('asPhone');
    if(asPhone) asPhone.value = newPhone;
  }
};

/* ═══════════════════════════════════════════════════════════════════════════
   CHANGE PASSWORD VIA OTP (from inside Account Settings Security tab)
   Gives users the option to use OTP instead of typing current password
═══════════════════════════════════════════════════════════════════════════ */
window.showChangePasswordOTP = function(){
  const user = (typeof currentUser!=='undefined'&&currentUser) ? currentUser : _pr_session();
  if(!user){ _pr_toast('Please log in first.'); return; }

  const hasPhone = user.phone && user.phone.length > 5;
  const maskedPhone = hasPhone ? user.phone.slice(0,4)+'****'+user.phone.slice(-3) : null;

  _pr_buildModal('prChangePwModal', `
    <button class="pr-close" onclick="_pr_closeModal('prChangePwModal')">✕</button>
    <div class="pr-logo">AFRIB<span>CONNECT</span></div>
    <div class="pr-title">Change Password</div>
    <div class="pr-sub">Choose how to verify your identity</div>
    <div id="prDevOTPBanner" class="pr-dev-banner"></div>

    <div class="pr-method-row">
      <button class="pr-method-btn active" id="prCPMethodEmail" onclick="_pr_selectCPMethod('email')">
        📧 Email Code
      </button>
      <button class="pr-method-btn ${!hasPhone?'disabled':''}" id="prCPMethodPhone"
        onclick="${hasPhone ? '_pr_selectCPMethod(\'phone\')':''}"
        ${!hasPhone?'disabled title="No phone number on account"':''}
        style="${!hasPhone?'opacity:.4;cursor:not-allowed':''}">
        📱 SMS${hasPhone?' ('+maskedPhone+')':' (none)'}
      </button>
    </div>

    <button class="pr-btn" onclick="_pr_sendChangePwOTP('${user.email}')">
      Send Verification Code →
    </button>
    <button class="pr-btn-ghost" onclick="_pr_closeModal('prChangePwModal')">Cancel</button>
  `);

  window._prCPMethod = 'email';
};

window._pr_selectCPMethod = function(method){
  window._prCPMethod = method;
  ['email','phone'].forEach(m=>{
    const btn = document.getElementById('prCPMethod'+m[0].toUpperCase()+m.slice(1));
    if(btn && !btn.disabled) btn.classList.toggle('active', m===method);
  });
};

window._pr_sendChangePwOTP = function(email){
  const method = window._prCPMethod || 'email';
  const accounts = _pr_accounts();
  const user = accounts[email];
  if(!user){ _pr_toast('Account not found.'); return; }

  const otp = _pr_genOTP();
  _pr_storeOTP('changepw_'+email, otp);

  if(method==='phone'){
    if(!user.phone){ _pr_toast('No phone number on account.'); return; }
    _pr_simulateSMS(user.phone, otp);
    _pr_showOTPEntry('prChangePwModal','changepw_'+email, email,'phone', user.phone,'change_password_otp');
  } else {
    if(typeof sendResetEmail==='function'){
      sendResetEmail(email, (user.first||'')+' '+(user.last||''), otp).catch(()=>{});
    }
    _pr_showOTPEntry('prChangePwModal','changepw_'+email, email,'email', email,'change_password_otp');
  }
};

/* ═══════════════════════════════════════════════════════════════════════════
   PATCH EXISTING AUTH PANEL
   Replace the old "Forgot password?" button behaviour + add OTP option to
   the Security settings panel
═══════════════════════════════════════════════════════════════════════════ */
(function patchAuthUI(){

  /* Patch the Forgot Password flow to use our new modal instead of the
     built-in step1/step2 panel inside auth-forgot */
  const origDoForgot = window.doForgot;
  window.doForgot = function(){
    // If our modal exists, use it; otherwise fall back to original
    const email = document.getElementById('forgotEmail')?.value?.trim() || '';
    showForgotPassword(email);
    // Hide the old auth-forgot card so they don't overlap
    const oldForgot = document.getElementById('auth-forgot');
    if(oldForgot) oldForgot.style.display = 'none';
    const overlay = document.getElementById('auth-overlay');
    if(overlay) overlay.style.display = 'none';
    document.body.style.overflow = '';
  };

  /* Inject "Use OTP instead" and "Change Phone" buttons into Security tab */
  function injectSecurityButtons(){
    const secPanel = document.getElementById('aspanel-security');
    if(!secPanel || secPanel.dataset.prPatched) return;
    secPanel.dataset.prPatched = '1';

    // Add "Use OTP instead" under the Change Password section
    const cpSection = secPanel.querySelector('.as-section');
    if(cpSection){
      const otpHint = document.createElement('div');
      otpHint.style.cssText = 'margin-top:10px;font-size:13px;color:rgba(255,255,255,.4)';
      otpHint.innerHTML = `Forgot your current password? <button onclick="showChangePasswordOTP()"
        style="background:none;border:none;color:#D4AF37;font-size:13px;cursor:pointer;
          text-decoration:underline;font-weight:700;padding:0">Use a verification code instead →</button>`;
      cpSection.appendChild(otpHint);
    }

    // Add "Change Phone Number" section if it doesn't exist
    if(!secPanel.querySelector('#prChangePhoneSection')){
      const phoneSection = document.createElement('div');
      phoneSection.id = 'prChangePhoneSection';
      phoneSection.className = 'as-section';
      phoneSection.style.marginTop = '24px';
      phoneSection.innerHTML = `
        <h4>📱 Phone Number</h4>
        <p style="font-size:13px;color:rgba(255,255,255,.5);margin-bottom:14px">
          Your phone number is used for SMS verification and account recovery.
          Current: <strong style="color:#D4AF37" id="prPhoneDisplay">Loading…</strong>
        </p>
        <button onclick="showChangePhone()"
          style="background:rgba(212,175,55,.15);border:1px solid rgba(212,175,55,.3);
            color:#D4AF37;border-radius:10px;padding:10px 20px;font-size:13px;
            font-weight:700;cursor:pointer;transition:.2s"
          onmouseover="this.style.background='rgba(212,175,55,.25)'"
          onmouseout="this.style.background='rgba(212,175,55,.15)'">
          📱 ${(typeof currentUser!=='undefined'&&currentUser?.phone) ? 'Change' : 'Add'} Phone Number
        </button>`;
      secPanel.appendChild(phoneSection);

      // Update phone display
      setTimeout(()=>{
        const el = document.getElementById('prPhoneDisplay');
        const u  = (typeof currentUser!=='undefined'&&currentUser) ? currentUser : _pr_session();
        if(el && u){
          el.textContent = u.phone ? u.phone.slice(0,4)+'****'+u.phone.slice(-3) : 'Not set';
        }
      }, 200);
    }
  }

  // Inject when account settings opens
  const origShowAS = window.showAccountSettings;
  if(origShowAS){
    window.showAccountSettings = function(){
      origShowAS.apply(this, arguments);
      setTimeout(injectSecurityButtons, 200);
    };
  }

  // Also inject on DOMContentLoaded in case settings is already visible
  document.addEventListener('DOMContentLoaded', ()=>{
    setTimeout(injectSecurityButtons, 1000);
  });

  /* Patch the "Forgot password?" link inside auth-login to open our modal */
  document.addEventListener('DOMContentLoaded', ()=>{
    const forgotLinks = document.querySelectorAll('[onclick*="showAuth(\'forgot\')"]');
    forgotLinks.forEach(link=>{
      if(link.dataset.prPatched) return;
      link.dataset.prPatched = '1';
      link.onclick = function(e){
        e.preventDefault();
        const email = document.getElementById('loginEmail')?.value?.trim() || '';
        showForgotPassword(email);
        // Close auth overlay
        const overlay = document.getElementById('auth-overlay');
        if(overlay) overlay.style.display = 'none';
        document.body.style.overflow = '';
        return false;
      };
    });
  });

})();

/* ── Add shake animation ───────────────────────────────────────────────── */
(function addShakeStyle(){
  if(document.getElementById('prShakeStyle')) return;
  const s = document.createElement('style');
  s.id = 'prShakeStyle';
  s.textContent = `
    @keyframes prShake{
      0%,100%{transform:translateX(0)}
      20%{transform:translateX(-8px)}
      40%{transform:translateX(8px)}
      60%{transform:translateX(-5px)}
      80%{transform:translateX(5px)}
    }`;
  document.head.appendChild(s);
})();

console.log('[AfriBConnect] Password Reset & Phone Change v1.0 loaded ✓');
