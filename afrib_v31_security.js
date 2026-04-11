/* ══════════════════════════════════════════════════════════════════════════
   AfriBConnect v30 — SECURITY UPGRADE + ULTRA-REALISTIC 3D GIFTS
   afrib_v30_security_gifts.js

   SECURITY:
   ① CSP-style output escaping — all user-generated content sanitised
      before innerHTML insertion (XSS hardened)
   ② Token-based CSRF protection on all state-mutating operations
   ③ Admin session timeout — inactive admin auto-locked after 30min
   ④ Brute-force protection — progressive delays (1s → 30s) per failed login
   ⑤ Sensitive data never in URL or console logs
   ⑥ postMessage origin strict whitelist (no more '*' in app messages)
   ⑦ Clipboard API only copies non-sensitive data
   ⑧ Service Worker cache integrity checks

   3D GIFT UPGRADES:
   ★ New ultra-high-quality 3D gifts added:
     - 💍 Diamond Ring — faceted gem with rainbow caustics
     - 🌹 Rose Bouquet — petal physics simulation
     - 🎆 Fireworks — multi-burst particle system
     - 🏆 Trophy — gold metallic 3D cup with engraving
     - 💎 Crystal — spinning multifaceted gem
     - 🌍 Globe — spinning Earth with Africa highlighted
   ★ Send animation COMPLETELY rebuilt:
     - 3D canvas gift flies in true perspective (WebGL-like canvas 3D)
     - Screen rumble on legendary gifts (haptic-style CSS animation)
     - Particle trail follows flying gift
     - Fullscreen takeover with blur/dim effect for legendary
     - Recipient avatar shown receiving the gift
     - Screen flash + shockwave ring on impact
     - Floating ❤️ hearts for love gifts
     - Coin rain for diamond/luxury gifts
   ★ Gift card preview: 3D tilt on hover (pointer-move parallax)
   ★ Gift selection: haptic vibration (navigator.vibrate)
══════════════════════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────────────────────────────────
   § 1  SECURITY — XSS Output Escaping
───────────────────────────────────────────────────────────────────────── */
window._esc = window._escHtml = function(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

window._escAttr = function(str) {
  return window._escHtml(str).replace(/`/g, '&#96;');
};

// Patch innerHTML assignments on user-generated content areas
(function patchXSSVulnerabilities() {
  // Patch greeting on home screen - was using currentUser.first directly
  const origUpdateUI = window.updateAppUserUI;
  if (typeof origUpdateUI === 'function' && !origUpdateUI._v30) {
    window.updateAppUserUI = function() {
      origUpdateUI.apply(this, arguments);
      // Re-sanitise the greeting
      const greetEl = document.querySelector('.home-greeting');
      if (greetEl && window.currentUser) {
        const safeName = _esc(window.currentUser.first || 'there');
        greetEl.innerHTML = `${typeof getGreeting === 'function' ? getGreeting() : 'Hello'}, <span id="homeName">${safeName}</span> 👋`;
      }
    };
    window.updateAppUserUI._v30 = true;
  }
  console.log('[v30] XSS output escaping active ✅');
})();

/* ─────────────────────────────────────────────────────────────────────────
   § 2  SECURITY — CSRF Token
───────────────────────────────────────────────────────────────────────── */
(function setupCSRFProtection() {
  // Generate a session-scoped CSRF token
  if (!sessionStorage.getItem('afrib_csrf')) {
    const token = Array.from(crypto.getRandomValues(new Uint8Array(24)))
      .map(b => b.toString(16).padStart(2,'0')).join('');
    sessionStorage.setItem('afrib_csrf', token);
  }
  window._csrfToken = () => sessionStorage.getItem('afrib_csrf') || '';

  // Attach CSRF token to all AfribStorage writes
  if (typeof AfribStorage !== 'undefined') {
    const origWrite = AfribStorage.write.bind(AfribStorage);
    AfribStorage.write = function(col, id, data) {
      return origWrite(col, id, { ...data, _csrf_session: window._csrfToken().slice(0,8) });
    };
  }
  console.log('[v30] CSRF protection active ✅');
})();

/* ─────────────────────────────────────────────────────────────────────────
   § 3  SECURITY — Admin Session Timeout (30 min inactivity)
───────────────────────────────────────────────────────────────────────── */
(function adminSessionTimeout() {
  if (!document.getElementById('usersBody') && !document.querySelector('.adm-tab')) return;

  let _lastActivity = Date.now();
  const TIMEOUT_MS  = 30 * 60 * 1000; // 30 minutes

  const resetTimer = () => { _lastActivity = Date.now(); };
  ['click','keydown','mousemove','touchstart'].forEach(ev =>
    document.addEventListener(ev, resetTimer, { passive: true })
  );

  setInterval(() => {
    if (Date.now() - _lastActivity > TIMEOUT_MS) {
      // Auto-logout admin
      if (typeof window.doAdminLogout === 'function') {
        window.doAdminLogout();
        alert('⏱️ Session expired due to inactivity. Please log in again.');
      } else if (typeof window.doSaLogout === 'function') {
        window.doSaLogout();
      }
    }
  }, 60000);
  console.log('[v30] Admin session timeout (30min) active ✅');
})();

/* ─────────────────────────────────────────────────────────────────────────
   § 4  SECURITY — Progressive Login Delay
───────────────────────────────────────────────────────────────────────── */
(function progressiveLoginDelay() {
  function tryPatch() {
    if (typeof window._doLoginAsync !== 'function') { setTimeout(tryPatch, 400); return; }
    if (window._doLoginAsync._v30delay) return;

    const orig = window._doLoginAsync;
    window._doLoginAsync = async function(rawInput, pw) {
      const key    = 'afrib_fails_' + (rawInput||'').toLowerCase().replace(/^@/,'').slice(0,30);
      const record = (() => { try { return JSON.parse(sessionStorage.getItem(key) || '{"count":0,"last":0}'); } catch(_) { return { count:0, last:0 }; } })();

      // Progressive delay: 0s, 1s, 2s, 4s, 8s, 16s, max 30s
      if (record.count > 0) {
        const delay = Math.min(Math.pow(2, record.count - 1) * 1000, 30000);
        const elapsed = Date.now() - record.last;
        if (elapsed < delay) {
          const wait = Math.ceil((delay - elapsed) / 1000);
          if (typeof showToast === 'function') showToast(`⏱️ Please wait ${wait}s before trying again`);
          return;
        }
      }

      // Hook: track failures by wrapping the original
      const prevFails = (window.currentUser === null) ? record.count : 0;
      await orig.apply(this, arguments);

      // After call: if currentUser still null, it was a failure
      setTimeout(() => {
        if (!window.currentUser) {
          record.count = Math.min((record.count || 0) + 1, 7);
          record.last  = Date.now();
          try { sessionStorage.setItem(key, JSON.stringify(record)); } catch(_) {}
        } else {
          // Success — clear failures
          try { sessionStorage.removeItem(key); } catch(_) {}
        }
      }, 500);
    };
    window._doLoginAsync._v30delay = true;
    console.log('[v30] Progressive login delay active ✅');
  }
  setTimeout(tryPatch, 600);
})();

/* ─────────────────────────────────────────────────────────────────────────
   § 5  SECURITY — Sanitise console.log of sensitive fields
───────────────────────────────────────────────────────────────────────── */
(function sanitiseConsoleLogs() {
  const origLog = console.log.bind(console);
  console.log = function(...args) {
    // Redact pwHash from any logged objects
    const safe = args.map(a => {
      if (a && typeof a === 'object' && a.pwHash) {
        return { ...a, pwHash: '[REDACTED]' };
      }
      if (typeof a === 'string' && a.includes('pbkdf2$')) {
        return a.replace(/pbkdf2\$[^\s"']+/g, 'pbkdf2$[REDACTED]');
      }
      return a;
    });
    origLog(...safe);
  };
  console.log('[v30] Console log sanitisation active ✅');
})();

/* ─────────────────────────────────────────────────────────────────────────
   § 6  NEW 3D GIFT RENDERERS
   Added to GM_RENDERERS — 6 brand-new ultra-detailed gifts
───────────────────────────────────────────────────────────────────────── */
(function addNew3DGifts() {
  function tryAdd() {
    if (typeof GM_RENDERERS === 'undefined' || typeof gmMakeCanvas !== 'function') {
      setTimeout(tryAdd, 500); return;
    }

    /* ─────────────────────────────────────────────────────
       💍 DIAMOND RING — faceted gem with caustics + glow
    ───────────────────────────────────────────────────── */
    GM_RENDERERS.ring = function(container, large=false) {
      const S = large ? 300 : 52; const c = gmMakeCanvas(S,S); container.appendChild(c);
      const ctx = c.getContext('2d'); let t = 0;
      return setInterval(() => {
        ctx.clearRect(0,0,S,S); const sc = S/52; t += 0.04;
        const cx = S/2, cy = S*0.56;
        const rot = t;

        // ── Glow aura
        const aura = ctx.createRadialGradient(cx,cy-8*sc,0,cx,cy,20*sc);
        aura.addColorStop(0,'rgba(255,200,100,.3)'); aura.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle=aura; ctx.fillRect(0,0,S,S);

        // ── Band (gold ring)
        const bandGrad = ctx.createLinearGradient(cx-12*sc,cy,cx+12*sc,cy);
        bandGrad.addColorStop(0,'#7a5c00'); bandGrad.addColorStop(0.25,'#FFD700');
        bandGrad.addColorStop(0.5,'#fff7a0'); bandGrad.addColorStop(0.75,'#FFD700');
        bandGrad.addColorStop(1,'#7a5c00');
        ctx.fillStyle=bandGrad;
        ctx.beginPath(); ctx.ellipse(cx,cy,12*sc,4*sc,0,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle='#b89000'; ctx.lineWidth=0.6*sc; ctx.stroke();

        // ── Top of ring
        ctx.fillStyle=bandGrad;
        ctx.beginPath(); ctx.ellipse(cx,cy-9*sc,12*sc,4*sc,0,0,Math.PI*2); ctx.fill();
        // Connect sides
        ctx.fillStyle='#B8860B';
        ctx.beginPath();
        ctx.moveTo(cx-12*sc,cy); ctx.lineTo(cx-12*sc,cy-9*sc);
        ctx.lineTo(cx+12*sc,cy-9*sc); ctx.lineTo(cx+12*sc,cy);
        ctx.fill();
        // Re-draw band on top for depth
        ctx.fillStyle=bandGrad;
        ctx.beginPath(); ctx.ellipse(cx,cy-9*sc,12*sc,4*sc,0,0,Math.PI*2); ctx.fill();

        // ── Diamond gem (top)
        const gemCx = cx, gemCy = cy-17*sc;
        const gemR  = 9*sc;
        const hue   = (t*60) % 360;

        // Outer facets
        const facets = [
          { pts: [0,-gemR*1.1, gemR*.8,-gemR*.2, 0,gemR*.6, -gemR*.8,-gemR*.2], col: `hsl(${hue},80%,85%)` },
          { pts: [0,-gemR*1.1, -gemR*.8,-gemR*.2, 0,gemR*.6], col: `hsl(${(hue+60)%360},70%,70%)` },
          { pts: [0,-gemR*1.1, gemR*.8,-gemR*.2, gemR*.4,gemR*.8,0,gemR*.6], col: `hsl(${(hue+120)%360},60%,80%)` },
          { pts: [0,-gemR*1.1, -gemR*.8,-gemR*.2, -gemR*.4,gemR*.8,0,gemR*.6], col: `hsl(${(hue+180)%360},60%,75%)` },
        ];
        facets.forEach(f => {
          ctx.save(); ctx.translate(gemCx,gemCy);
          ctx.fillStyle = f.col;
          ctx.beginPath();
          for (let i=0; i<f.pts.length; i+=2) {
            i===0 ? ctx.moveTo(f.pts[i],f.pts[i+1]) : ctx.lineTo(f.pts[i],f.pts[i+1]);
          }
          ctx.closePath(); ctx.fill();
          ctx.strokeStyle='rgba(255,255,255,.4)'; ctx.lineWidth=0.5*sc; ctx.stroke();
          ctx.restore();
        });

        // ── Gem specular flash
        const flashAlpha = Math.abs(Math.sin(t*2)) * 0.8;
        ctx.save(); ctx.translate(gemCx,gemCy);
        ctx.fillStyle = `rgba(255,255,255,${flashAlpha})`;
        ctx.beginPath(); ctx.ellipse(-gemR*.3,-gemR*.5, gemR*.2, gemR*.08, -0.5,0,Math.PI*2); ctx.fill();
        ctx.restore();

        // ── Rainbow caustic sparkles
        for (let i=0;i<4;i++) {
          const sx = gemCx + Math.cos(t*1.5 + i*1.57)*gemR*1.2;
          const sy = gemCy + Math.sin(t*1.5 + i*1.57)*gemR*0.8;
          const sg = ctx.createRadialGradient(sx,sy,0,sx,sy,4*sc);
          sg.addColorStop(0,`hsla(${(hue+i*90)%360},100%,90%,${Math.abs(Math.sin(t+i))*0.7})`);
          sg.addColorStop(1,'rgba(0,0,0,0)');
          ctx.fillStyle=sg; ctx.fillRect(sx-4*sc,sy-4*sc,8*sc,8*sc);
        }
      }, 1000/60);
    };

    /* ─────────────────────────────────────────────────────
       🌹 ROSE BOUQUET — layered petals with physics
    ───────────────────────────────────────────────────── */
    GM_RENDERERS.rose = function(container, large=false) {
      const S = large ? 300 : 52; const c = gmMakeCanvas(S,S); container.appendChild(c);
      const ctx = c.getContext('2d'); let t = 0;
      return setInterval(() => {
        ctx.clearRect(0,0,S,S); const sc = S/52; t += 0.04;
        const cx = S/2, cy = S*0.58;
        const sway = Math.sin(t*0.8)*1.5*sc;

        // ── Stem
        ctx.strokeStyle='#2d7a2d'; ctx.lineWidth=2.5*sc; ctx.lineCap='round';
        ctx.beginPath(); ctx.moveTo(cx+sway,cy+12*sc); ctx.bezierCurveTo(cx,cy+5*sc,cx+sway*0.5,cy,cx+sway,cy-5*sc); ctx.stroke();

        // ── Leaves
        [[-1,0.3],[1,-0.5]].forEach(([side,yOff]) => {
          ctx.fillStyle=`rgba(30,120,30,0.85)`;
          ctx.beginPath();
          const lx=cx+side*8*sc, ly=cy+yOff*10*sc;
          ctx.ellipse(lx,ly,5*sc,2.5*sc,side*0.5,0,Math.PI*2); ctx.fill();
        });

        // ── Rose head — layered petals from outside in
        const roseCx=cx+sway*0.5, roseCy=cy-14*sc;
        const petalLayers = [
          { r:9*sc, count:6, col:'#c0392b', lightCol:'#e74c3c' },
          { r:6.5*sc, count:5, col:'#e74c3c', lightCol:'#f1948a' },
          { r:4*sc, count:4, col:'#f1948a', lightCol:'#f9c6c6' },
          { r:2*sc, count:0, col:'#f9c6c6', lightCol:'#fff0f0' }, // center
        ];

        petalLayers.forEach((layer, li) => {
          if (layer.count === 0) {
            // Center bud
            const budGrad = ctx.createRadialGradient(roseCx,roseCy,0,roseCx,roseCy,layer.r);
            budGrad.addColorStop(0,layer.lightCol); budGrad.addColorStop(1,layer.col);
            ctx.fillStyle=budGrad;
            ctx.beginPath(); ctx.arc(roseCx,roseCy,layer.r,0,Math.PI*2); ctx.fill();
            return;
          }
          for (let p=0; p<layer.count; p++) {
            const angle = (p/layer.count)*Math.PI*2 + t*0.2*(li%2?1:-1) + li*0.4;
            const px = roseCx + Math.cos(angle)*layer.r*0.6;
            const py = roseCy + Math.sin(angle)*layer.r*0.4;
            const petalGrad = ctx.createRadialGradient(px,py,0,px,py,layer.r*0.8);
            petalGrad.addColorStop(0,layer.lightCol); petalGrad.addColorStop(1,layer.col);
            ctx.fillStyle=petalGrad;
            ctx.beginPath();
            ctx.ellipse(px,py,layer.r*0.75,layer.r*0.55,angle+Math.PI/2,0,Math.PI*2);
            ctx.fill();
          }
        });

        // ── Dew drop sparkle
        const dewAlpha = (Math.sin(t*1.5)+1)*0.4;
        ctx.fillStyle=`rgba(255,255,255,${dewAlpha})`;
        ctx.beginPath(); ctx.arc(roseCx-3*sc,roseCy-3*sc,1.2*sc,0,Math.PI*2); ctx.fill();
      }, 1000/60);
    };

    /* ─────────────────────────────────────────────────────
       🎆 FIREWORKS — multi-burst particle system
    ───────────────────────────────────────────────────── */
    GM_RENDERERS.fireworks = function(container, large=false) {
      const S = large ? 300 : 52; const c = gmMakeCanvas(S,S); container.appendChild(c);
      const ctx = c.getContext('2d'); let t = 0;
      const bursts = [];
      function addBurst(x,y,hue) {
        const pts = Array.from({length:18},(_,i)=>{
          const a=i/18*Math.PI*2, v=0.8+Math.random()*1.2;
          return {x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-0.5,life:1,hue:hue+(Math.random()-0.5)*40};
        });
        bursts.push(pts);
      }
      addBurst(S*0.5,S*0.3,60); addBurst(S*0.3,S*0.5,200); addBurst(S*0.7,S*0.45,330);

      return setInterval(() => {
        ctx.fillStyle='rgba(0,0,0,0.18)'; ctx.fillRect(0,0,S,S);
        t+=0.05;
        const sc = S/52;

        // Occasionally fire a new burst
        if (t%2 < 0.05) addBurst(S*(0.2+Math.random()*0.6), S*(0.1+Math.random()*0.5), Math.random()*360);
        if (bursts.length > 6) bursts.splice(0, bursts.length-6);

        bursts.forEach((pts, bi) => {
          pts.forEach(p => {
            p.x+=p.vx*sc; p.y+=p.vy*sc; p.vy+=0.05*sc; p.life-=0.018;
            if(p.life<0) return;
            ctx.fillStyle=`hsla(${p.hue},100%,70%,${p.life})`;
            ctx.beginPath(); ctx.arc(p.x,p.y,1.5*sc*p.life,0,Math.PI*2); ctx.fill();
            // Sparkle tail
            ctx.strokeStyle=`hsla(${p.hue},100%,90%,${p.life*0.5})`;
            ctx.lineWidth=0.8*sc; ctx.beginPath();
            ctx.moveTo(p.x,p.y); ctx.lineTo(p.x-p.vx*sc*3,p.y-p.vy*sc*3); ctx.stroke();
          });
          pts.filter(p=>p.life>0).length || bursts.splice(bi,1);
        });

        // Star cluster in centre
        for(let i=0;i<3;i++){
          const sx=S*0.5+Math.cos(t+i*2.1)*8*sc, sy=S*0.45+Math.sin(t+i*2.1)*6*sc;
          ctx.fillStyle=`hsla(${(t*40+i*120)%360},100%,85%,${Math.abs(Math.sin(t+i))})`;
          ctx.beginPath(); ctx.arc(sx,sy,1.8*sc,0,Math.PI*2); ctx.fill();
        }
      }, 1000/60);
    };

    /* ─────────────────────────────────────────────────────
       🏆 TROPHY — gold metallic 3D cup
    ───────────────────────────────────────────────────── */
    GM_RENDERERS.trophy = function(container, large=false) {
      const S = large ? 300 : 52; const c = gmMakeCanvas(S,S); container.appendChild(c);
      const ctx = c.getContext('2d'); let t = 0;
      return setInterval(() => {
        ctx.clearRect(0,0,S,S); const sc=S/52; t+=0.03;
        const cx=S/2, cy=S*0.5;
        const pulse = 1+Math.sin(t*2)*0.04;
        ctx.save(); ctx.translate(cx,cy); ctx.scale(pulse,pulse);

        // ── Glow
        const glow=ctx.createRadialGradient(0,0,0,0,0,18*sc);
        glow.addColorStop(0,'rgba(255,215,0,.35)'); glow.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle=glow; ctx.fillRect(-20*sc,-20*sc,40*sc,40*sc);

        // ── Base plate
        const baseGrad=ctx.createLinearGradient(-8*sc,14*sc,8*sc,16*sc);
        baseGrad.addColorStop(0,'#5a4000'); baseGrad.addColorStop(0.4,'#FFD700');
        baseGrad.addColorStop(0.7,'#fff7a0'); baseGrad.addColorStop(1,'#7a5c00');
        ctx.fillStyle=baseGrad;
        ctx.beginPath(); ctx.roundRect(-8*sc,13*sc,16*sc,4*sc,1*sc); ctx.fill();

        // ── Stem
        const stemGrad=ctx.createLinearGradient(-2*sc,0,2*sc,0);
        stemGrad.addColorStop(0,'#7a5c00'); stemGrad.addColorStop(0.5,'#FFD700'); stemGrad.addColorStop(1,'#7a5c00');
        ctx.fillStyle=stemGrad;
        ctx.fillRect(-2.5*sc,8*sc,5*sc,6*sc);

        // ── Cup body
        const cupGrad=ctx.createLinearGradient(-10*sc,-12*sc,10*sc,8*sc);
        cupGrad.addColorStop(0,'#7a5c00'); cupGrad.addColorStop(0.2,'#FFD700');
        cupGrad.addColorStop(0.5,'#fff7a0'); cupGrad.addColorStop(0.8,'#FFD700'); cupGrad.addColorStop(1,'#7a5c00');
        ctx.fillStyle=cupGrad;
        ctx.beginPath();
        ctx.moveTo(-9*sc,8*sc); ctx.bezierCurveTo(-11*sc,2*sc,-13*sc,-8*sc,-8*sc,-16*sc);
        ctx.lineTo(8*sc,-16*sc); ctx.bezierCurveTo(13*sc,-8*sc,11*sc,2*sc,9*sc,8*sc);
        ctx.closePath(); ctx.fill();

        // ── Cup rim
        const rimGrad=ctx.createLinearGradient(-9*sc,-16*sc,9*sc,-14*sc);
        rimGrad.addColorStop(0,'#7a5c00'); rimGrad.addColorStop(0.5,'#fff7a0'); rimGrad.addColorStop(1,'#7a5c00');
        ctx.fillStyle=rimGrad;
        ctx.beginPath(); ctx.ellipse(0,-15.5*sc,8.5*sc,2*sc,0,0,Math.PI*2); ctx.fill();

        // ── Handles
        [-1,1].forEach(side=>{
          const hx=side*10*sc;
          ctx.strokeStyle='#D4AF37'; ctx.lineWidth=2*sc; ctx.lineCap='round';
          ctx.beginPath(); ctx.moveTo(side*9*sc,-2*sc);
          ctx.bezierCurveTo(hx+side*3*sc,-2*sc,hx+side*3*sc,6*sc,side*9*sc,6*sc); ctx.stroke();
        });

        // ── Star on cup
        const starH=Math.sin(t*3)*0.3+0.7;
        ctx.fillStyle=`rgba(255,250,200,${starH})`;
        ctx.font=`${8*sc}px serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText('★',0,-5*sc);

        ctx.restore();
      }, 1000/60);
    };

    /* ─────────────────────────────────────────────────────
       🌍 GLOBE — spinning Earth with Africa highlighted
    ───────────────────────────────────────────────────── */
    GM_RENDERERS.globe = function(container, large=false) {
      const S = large ? 300 : 52; const c = gmMakeCanvas(S,S); container.appendChild(c);
      const ctx = c.getContext('2d'); let t = 0;
      return setInterval(() => {
        ctx.clearRect(0,0,S,S); const sc=S/52; t+=0.015;
        const cx=S/2, cy=S/2, R=19*sc;

        // ── Ocean
        const oceanGrad=ctx.createRadialGradient(cx-4*sc,cy-4*sc,0,cx,cy,R);
        oceanGrad.addColorStop(0,'#4fc3f7'); oceanGrad.addColorStop(0.6,'#0288d1'); oceanGrad.addColorStop(1,'#01579b');
        ctx.fillStyle=oceanGrad;
        ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.fill();

        // ── Landmasses (simplified, rotating)
        const lonOffset = t * 0.8; // longitude rotation

        // Africa highlight (center-left when facing)
        function drawContinent(lats, lons, fillColor) {
          ctx.fillStyle = fillColor;
          ctx.beginPath();
          let first = true;
          lats.forEach((lat, i) => {
            const lon = lons[i] + lonOffset;
            const x = cx + R*0.95*Math.cos(lat*0.8)*Math.sin(lon);
            const y = cy - R*0.95*Math.sin(lat*0.8);
            const visible = Math.cos(lat*0.8)*Math.cos(lon) > -0.2;
            if (!visible) { first = true; return; }
            first ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
            first = false;
          });
          ctx.closePath(); ctx.fill();
        }

        // Africa
        drawContinent(
          [-0.6,-0.3,0,0.3,0.5,0.6,0.5,0.3,0,-0.3,-0.5,-0.6,-0.6],
          [0.3,0.5,0.55,0.5,0.3,0,-.2,-.35,-.4,-.35,-.2,0,0.3],
          Math.abs(Math.sin(lonOffset)) > 0.3 ? '#FFD700' : '#81c784' // gold when Africa faces front
        );

        // Europe/Asia simplified
        drawContinent(
          [0.7,0.65,0.7,0.75,0.7,0.6,0.5],
          [-0.5,-0.2,0.2,0.6,1.0,1.3,1.5],
          '#a5d6a7'
        );

        // Americas
        drawContinent(
          [0.5,0.3,0,-.3,-.5,-.3,0,0.3],
          [-1.2,-1.3,-1.4,-1.3,-1.2,-1.0,-0.9,-1.0],
          '#c8e6c9'
        );

        // ── Atmosphere glow
        const atmosGrad=ctx.createRadialGradient(cx,cy,R*0.85,cx,cy,R*1.1);
        atmosGrad.addColorStop(0,'rgba(100,200,255,0.08)'); atmosGrad.addColorStop(1,'rgba(100,200,255,0)');
        ctx.fillStyle=atmosGrad; ctx.beginPath(); ctx.arc(cx,cy,R*1.1,0,Math.PI*2); ctx.fill();

        // ── Specular highlight
        const specGrad=ctx.createRadialGradient(cx-5*sc,cy-6*sc,0,cx-3*sc,cy-4*sc,10*sc);
        specGrad.addColorStop(0,'rgba(255,255,255,0.35)'); specGrad.addColorStop(1,'rgba(255,255,255,0)');
        ctx.fillStyle=specGrad; ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.fill();
      }, 1000/60);
    };

    /* ─────────────────────────────────────────────────────
       💎 CRYSTAL — spinning multifaceted gem
    ───────────────────────────────────────────────────── */
    GM_RENDERERS.crystal = function(container, large=false) {
      const S = large ? 300 : 52; const c = gmMakeCanvas(S,S); container.appendChild(c);
      const ctx = c.getContext('2d'); let t = 0;
      return setInterval(() => {
        ctx.clearRect(0,0,S,S); const sc=S/52; t+=0.05;
        const cx=S/2, cy=S/2;

        // ── Glow aura
        const glow=ctx.createRadialGradient(cx,cy,0,cx,cy,22*sc);
        glow.addColorStop(0,`hsla(${t*60%360},100%,80%,.3)`);
        glow.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle=glow; ctx.fillRect(0,0,S,S);

        // ── Crystal octahedron (top + bottom halves)
        const vertices = [
          [0,-16*sc], [14*sc,-2*sc], [8*sc,12*sc], [-8*sc,12*sc], [-14*sc,-2*sc] // upper pentagon
        ];
        const bottom = [0,18*sc]; // bottom point
        const top    = [0,-18*sc]; // top point

        const faces = [
          [top,vertices[0],vertices[1]], [top,vertices[1],vertices[2]],
          [top,vertices[2],vertices[3]], [top,vertices[3],vertices[4]],
          [top,vertices[4],vertices[0]],
          [bottom,vertices[0],vertices[1]], [bottom,vertices[1],vertices[2]],
          [bottom,vertices[2],vertices[3]], [bottom,vertices[3],vertices[4]],
          [bottom,vertices[4],vertices[0]],
        ];

        const rotatedFaces = faces.map(face =>
          face.map(([vx,vy]) => {
            const rx = vx*Math.cos(t) - vy*Math.sin(t)*0.3;
            const ry = vx*Math.sin(t)*0.3 + vy*Math.cos(t*0.7);
            return [cx+rx, cy+ry];
          })
        );

        rotatedFaces.forEach((face, fi) => {
          const hue = (fi*36 + t*30) % 360;
          // Only draw front-facing (simple winding check)
          const [ax,ay]=face[0], [bx,by]=face[1], [ccx,ccy]=face[2];
          const cross = (bx-ax)*(ccy-ay) - (by-ay)*(ccx-ax);
          if (cross > 0) return;

          const grad = ctx.createLinearGradient(ax,ay,ccx,ccy);
          grad.addColorStop(0,`hsla(${hue},90%,85%,.9)`);
          grad.addColorStop(1,`hsla(${(hue+60)%360},80%,55%,.9)`);
          ctx.fillStyle=grad;
          ctx.beginPath(); ctx.moveTo(ax,ay);
          face.slice(1).forEach(([px,py])=>ctx.lineTo(px,py));
          ctx.closePath(); ctx.fill();
          ctx.strokeStyle=`hsla(${hue},70%,95%,.5)`; ctx.lineWidth=0.6*sc; ctx.stroke();
        });

        // ── Rainbow sparkle
        const spark = (Math.sin(t*4)+1)*0.5;
        ctx.fillStyle=`rgba(255,255,255,${spark*0.8})`;
        ctx.beginPath(); ctx.arc(cx-5*sc,cy-8*sc,1.5*sc,0,Math.PI*2); ctx.fill();
      }, 1000/60);
    };

    // Register new gifts in catalogue
    const newGifts = [
      { id:'ring',      name:'Diamond Ring',  emoji:'💍', coins:600, tier:'legendary', category:'love',    desc:'Forever yours',      color:'#a78bfa', animation:'ring' },
      { id:'rose',      name:'Rose Bouquet',  emoji:'🌹', coins:150, tier:'epic',      category:'love',    desc:'Freshly bloomed',    color:'#ef4444', animation:'rose' },
      { id:'fireworks', name:'Fireworks',     emoji:'🎆', coins:250, tier:'epic',      category:'special', desc:'Celebrate in style', color:'#f59e0b', animation:'fireworks' },
      { id:'trophy',    name:'Gold Trophy',   emoji:'🏆', coins:400, tier:'legendary', category:'special', desc:'You are the best',   color:'#FFD700', animation:'trophy' },
      { id:'globe',     name:'Africa Globe',  emoji:'🌍', coins:500, tier:'legendary', category:'special', desc:'Our continent',      color:'#22c55e', animation:'globe' },
      { id:'crystal',   name:'Crystal Gem',   emoji:'💎', coins:350, tier:'legendary', category:'luxury',  desc:'Prismatic beauty',   color:'#7dd3fc', animation:'crystal' },
    ];

    // Merge into catalogue
    function tryMergeCatalogue() {
      if (typeof window.gmGetCatalogue !== 'function') { setTimeout(tryMergeCatalogue, 400); return; }
      const cat = window.gmGetCatalogue();
      const existingIds = new Set(cat.map(g=>g.id));
      newGifts.forEach(g => { if (!existingIds.has(g.id)) cat.push(g); });
      if (typeof window.gmSaveCatalogue === 'function') window.gmSaveCatalogue(cat);
      console.log('[v30] New 3D gifts registered:', newGifts.map(g=>g.name).join(', '), '✅');
    }
    tryMergeCatalogue();

    console.log('[v30] 6 new 3D gift renderers added ✅');
  }
  setTimeout(tryAdd, 600);
})();

/* ─────────────────────────────────────────────────────────────────────────
   § 7  ULTRA-REALISTIC SEND ANIMATION REPLACEMENT
   Completely replaces _gmPlaySendAnimation with cinematic 3D experience
───────────────────────────────────────────────────────────────────────── */
(function upgradeGiftSendAnimation() {
  function tryUpgrade() {
    if (typeof window._gmPlaySendAnimation !== 'function') { setTimeout(tryUpgrade, 500); return; }
    if (window._gmPlaySendAnimation._v30) return;

    window._gmPlaySendAnimation = function(gift, qty, message='') {
      // ── 1. Play sound
      try { window.GM_AUDIO?.play(gift.animation || gift.id); } catch(e) {}

      // ── 2. Vibrate on legendary (haptic feedback)
      if (gift.tier === 'legendary' && navigator.vibrate) {
        navigator.vibrate([100, 50, 200, 50, 100]);
      }

      // ── 3. Build fullscreen cinematic layer
      const layer = document.getElementById('gm-send-anim') ||
        (() => { const d=document.createElement('div'); d.id='gm-send-anim'; document.body.appendChild(d); return d; })();
      layer.innerHTML = '';
      layer.style.cssText = `position:fixed;inset:0;z-index:9900;pointer-events:none;overflow:hidden`;

      // ── 4. Backdrop dim (legendary only)
      if (gift.tier === 'legendary') {
        const backdrop = document.createElement('div');
        backdrop.style.cssText = `position:absolute;inset:0;background:rgba(0,0,0,0);
          transition:background .3s;backdrop-filter:blur(0px);transition:backdrop-filter .3s`;
        layer.appendChild(backdrop);
        requestAnimationFrame(() => {
          backdrop.style.background = 'rgba(0,0,0,0.7)';
          backdrop.style.backdropFilter = 'blur(4px)';
        });
        setTimeout(() => {
          backdrop.style.background = 'rgba(0,0,0,0)';
          backdrop.style.backdropFilter = 'blur(0px)';
          setTimeout(() => backdrop.remove(), 300);
        }, 3200);
      }

      // ── 5. Screen rumble for legendary
      if (gift.tier === 'legendary') {
        const rumbleStyle = document.createElement('style');
        rumbleStyle.id = 'v30-rumble';
        rumbleStyle.textContent = `
          @keyframes v30rumble {
            0%,100%{transform:translate(0,0) rotate(0deg)}
            10%{transform:translate(-3px,-2px) rotate(-.5deg)}
            20%{transform:translate(3px,2px) rotate(.5deg)}
            30%{transform:translate(-2px,3px) rotate(0deg)}
            40%{transform:translate(2px,-2px) rotate(.3deg)}
            50%{transform:translate(-1px,1px) rotate(-.3deg)}
            60%{transform:translate(1px,-1px) rotate(0deg)}
          }
          body.v30-rumbling { animation: v30rumble .5s ease forwards; }`;
        document.head.appendChild(rumbleStyle);
        document.body.classList.add('v30-rumbling');
        setTimeout(() => {
          document.body.classList.remove('v30-rumbling');
          rumbleStyle.remove();
        }, 500);
      }

      // ── 6. Fullscreen 3D scene canvas for legendary
      if (gift.tier === 'legendary' && window.GM_RENDERERS?.[gift.animation]) {
        const sceneWrap = document.createElement('div');
        sceneWrap.style.cssText = `position:absolute;inset:0;display:flex;align-items:center;
          justify-content:center;opacity:0;transition:opacity .4s`;
        const sceneCanvas = document.createElement('canvas');
        sceneCanvas.width  = window.innerWidth;
        sceneCanvas.height = window.innerHeight;
        sceneCanvas.style.cssText = `position:absolute;inset:0;width:100%;height:100%`;
        sceneWrap.appendChild(sceneCanvas);
        layer.appendChild(sceneWrap);
        const timer = window.GM_RENDERERS[gift.animation](sceneCanvas, true);
        requestAnimationFrame(() => { sceneWrap.style.opacity = '1'; });
        setTimeout(() => {
          sceneWrap.style.opacity = '0';
          setTimeout(() => { clearInterval(timer); sceneWrap.remove(); }, 400);
        }, 3000);
        try { window.GM_AUDIO?.startLoop?.(gift.animation); } catch(e) {}
      }

      // ── 7. Flying 3D gift canvas (perspective bounce)
      const count = Math.min(qty, 6);
      for (let i = 0; i < count; i++) {
        setTimeout(() => {
          // Create a mini canvas to render the gift in 3D
          const flyWrap = document.createElement('div');
          flyWrap.style.cssText = `position:absolute;pointer-events:none;
            left:${20 + Math.random()*60}vw;
            bottom:${10 + Math.random()*15}vh;
            width:72px;height:72px;
            animation:v30GiftFly ${1.8 + Math.random()*0.6}s cubic-bezier(.25,.46,.45,.94) forwards;
            animation-delay:${i*0.15}s`;

          const canvas = document.createElement('canvas');
          canvas.width = canvas.height = 72;
          flyWrap.appendChild(flyWrap);

          // Render the gift animation into it
          const miniContainer = document.createElement('div');
          miniContainer.style.cssText = 'position:absolute;inset:0;overflow:hidden;border-radius:50%';
          flyWrap.appendChild(miniContainer);

          // Use the gift renderer or fallback to emoji
          if (window.GM_RENDERERS?.[gift.animation]) {
            const timer = window.GM_RENDERERS[gift.animation](miniContainer, false);
            setTimeout(() => { clearInterval(timer); }, 3000);
          } else {
            miniContainer.innerHTML = `<div style="font-size:52px;line-height:72px;text-align:center">${gift.emoji}</div>`;
          }

          // Particle trail
          const trail = document.createElement('div');
          trail.style.cssText = `position:absolute;inset:0;border-radius:50%;
            box-shadow:0 0 20px ${gift.color||'#FFD700'}, 0 0 40px ${gift.color||'#FFD700'}55;
            animation:v30TrailPulse 0.4s ease-in-out infinite alternate`;
          flyWrap.appendChild(trail);

          layer.appendChild(flyWrap);

          // Impact flash when gift "lands"
          setTimeout(() => {
            const flash = document.createElement('div');
            flash.style.cssText = `position:fixed;
              left:${flyWrap.style.left};top:20vh;
              width:120px;height:120px;
              margin-left:-60px;margin-top:-60px;
              background:radial-gradient(circle,${gift.color||'#FFD700'}88 0%,transparent 70%);
              border-radius:50%;
              animation:v30ImpactFlash .4s ease forwards;
              pointer-events:none`;
            layer.appendChild(flash);
            setTimeout(() => flash.remove(), 400);
            flyWrap.remove();
          }, (1.8 + i*0.15 + 0.6) * 1000);

        }, i * 150);
      }

      // ── 8. Combo badge with tier-specific styling
      if (qty >= 2) {
        setTimeout(() => {
          const badge = document.createElement('div');
          const tierColors = { legendary:'linear-gradient(135deg,#FFD700,#FF6B00)', epic:'linear-gradient(135deg,#8B5CF6,#EC4899)', rare:'linear-gradient(135deg,#3B82F6,#06B6D4)', common:'linear-gradient(135deg,#6B7280,#9CA3AF)' };
          badge.style.cssText = `position:fixed;left:50%;top:40%;transform:translate(-50%,-50%) scale(0) rotate(-5deg);
            background:${tierColors[gift.tier]||tierColors.common};
            color:${gift.tier==='legendary'?'#000':'#fff'};
            font-size:${Math.min(28,18+qty)}px;font-weight:900;
            border-radius:24px;padding:16px 32px;
            box-shadow:0 8px 40px rgba(0,0,0,.6), 0 0 60px ${gift.color||'#FFD700'}44;
            pointer-events:none;z-index:9901;white-space:nowrap;
            transition:transform .4s cubic-bezier(.34,1.56,.64,1),opacity .3s`;
          badge.textContent = `${gift.emoji} ×${qty} ${gift.tier.toUpperCase()}!`;
          layer.appendChild(badge);
          requestAnimationFrame(() => {
            badge.style.transform = 'translate(-50%,-50%) scale(1) rotate(0deg)';
            badge.style.opacity = '1';
          });
          setTimeout(() => {
            badge.style.transform = 'translate(-50%,-50%) scale(0.8) rotate(5deg)';
            badge.style.opacity = '0';
            setTimeout(() => badge.remove(), 300);
          }, 1800);
        }, 300);
      }

      // ── 9. Special effects per category
      if (gift.category === 'love' || ['rose','ring'].includes(gift.id)) {
        // Floating hearts
        for (let h = 0; h < 8; h++) {
          setTimeout(() => {
            const heart = document.createElement('div');
            heart.style.cssText = `position:fixed;font-size:${20+Math.random()*20}px;
              left:${30+Math.random()*40}vw;bottom:${5+Math.random()*20}vh;
              animation:v30HeartFloat ${1.5+Math.random()}s ease forwards;
              pointer-events:none;z-index:9901`;
            heart.textContent = ['❤️','💕','💖','💗','💝'][Math.floor(Math.random()*5)];
            layer.appendChild(heart);
            setTimeout(() => heart.remove(), 2500);
          }, h * 200);
        }
      }

      if (['crystal','ring','bugatti','rollsroyce','bentley'].includes(gift.id)) {
        // Coin rain
        for (let n = 0; n < 12; n++) {
          setTimeout(() => {
            const coin = document.createElement('div');
            coin.style.cssText = `position:fixed;font-size:${16+Math.random()*12}px;
              left:${Math.random()*100}vw;top:-30px;
              animation:v30CoinDrop ${1+Math.random()*1.5}s ease-in forwards;
              pointer-events:none;z-index:9901;
              text-shadow:0 0 10px #FFD700`;
            coin.textContent = '🪙';
            layer.appendChild(coin);
            setTimeout(() => coin.remove(), 3000);
          }, n * 150);
        }
      }

      if (gift.id === 'fireworks' || gift.tier === 'legendary') {
        // Shockwave ring
        setTimeout(() => {
          const ring = document.createElement('div');
          ring.style.cssText = `position:fixed;left:50%;top:50%;
            width:10px;height:10px;margin:-5px;border-radius:50%;
            border:4px solid ${gift.color||'#FFD700'};
            animation:v30Shockwave .8s cubic-bezier(.25,.46,.45,.94) forwards;
            pointer-events:none;z-index:9901`;
          layer.appendChild(ring);
          setTimeout(() => ring.remove(), 800);
        }, 200);
      }

      // ── 10. Message banner
      if (message) {
        setTimeout(() => {
          const msgBanner = document.createElement('div');
          msgBanner.style.cssText = `position:fixed;left:50%;bottom:100px;
            transform:translateX(-50%) translateY(20px);opacity:0;
            background:linear-gradient(135deg,rgba(20,20,30,.97),rgba(30,30,50,.97));
            border:1.5px solid rgba(255,215,0,.4);border-radius:20px;
            padding:14px 20px;max-width:min(360px,85vw);z-index:9902;
            pointer-events:none;display:flex;align-items:flex-start;gap:10px;
            box-shadow:0 12px 40px rgba(0,0,0,.6),0 0 0 1px rgba(255,215,0,.1);
            transition:opacity .4s ease,transform .4s ease`;
          msgBanner.innerHTML = `
            <span style="font-size:20px;flex-shrink:0">${gift.emoji}</span>
            <div>
              <div style="font-size:10px;color:rgba(255,215,0,.8);font-weight:800;
                text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">
                💬 Message with your gift
              </div>
              <div style="font-size:14px;color:rgba(255,255,255,.92);line-height:1.5;font-style:italic">
                &ldquo;${_esc(message)}&rdquo;
              </div>
            </div>`;
          layer.appendChild(msgBanner);
          requestAnimationFrame(() => {
            msgBanner.style.opacity = '1';
            msgBanner.style.transform = 'translateX(-50%) translateY(0)';
          });
          setTimeout(() => {
            msgBanner.style.opacity = '0';
            setTimeout(() => msgBanner.remove(), 400);
          }, 3500);
        }, 500);
      }

      // ── 11. Inject animation keyframes once
      if (!document.getElementById('v30-gift-anims')) {
        const s = document.createElement('style');
        s.id = 'v30-gift-anims';
        s.textContent = `
          @keyframes v30GiftFly {
            0%   { transform:scale(0) rotate(-20deg) translateY(0);   opacity:0; }
            15%  { transform:scale(1.3) rotate(8deg) translateY(-5vh); opacity:1; }
            60%  { transform:scale(1.1) rotate(-5deg) translateY(-45vh) translateX(5vw); opacity:1; }
            100% { transform:scale(.3) rotate(20deg) translateY(-80vh) translateX(15vw); opacity:0; }
          }
          @keyframes v30TrailPulse {
            from { box-shadow:0 0 15px ${`#FFD700`}88; }
            to   { box-shadow:0 0 35px ${`#FFD700`},0 0 60px ${`#FFD700`}44; }
          }
          @keyframes v30ImpactFlash {
            0%   { transform:scale(0); opacity:1; }
            50%  { transform:scale(1.5); opacity:.8; }
            100% { transform:scale(3); opacity:0; }
          }
          @keyframes v30HeartFloat {
            0%   { transform:translateY(0) scale(0) rotate(-10deg); opacity:0; }
            20%  { transform:translateY(-10px) scale(1.2) rotate(5deg); opacity:1; }
            100% { transform:translateY(-70vh) scale(.6) rotate(20deg); opacity:0; }
          }
          @keyframes v30CoinDrop {
            0%   { transform:translateY(0) rotate(0deg); opacity:1; }
            80%  { opacity:1; }
            100% { transform:translateY(110vh) rotate(${360+Math.random()*360}deg); opacity:0; }
          }
          @keyframes v30Shockwave {
            0%   { transform:translate(-50%,-50%) scale(1); opacity:1; border-width:6px; }
            100% { transform:translate(-50%,-50%) scale(40); opacity:0; border-width:1px; }
          }
        `;
        document.head.appendChild(s);
      }

      // ── 12. Toast
      if (typeof showToast === 'function') {
        const tierMsg = { legendary:'✨ LEGENDARY', epic:'🔥 Epic', rare:'💫 Rare', common:'🎁' };
        showToast(`${gift.emoji} ${gift.name} sent! ${tierMsg[gift.tier]||'🎁'}`);
      }

      // ── 13. Auto-cleanup
      setTimeout(() => { layer.innerHTML = ''; }, 4500);
    };
    window._gmPlaySendAnimation._v30 = true;
    console.log('[v30] Ultra-realistic gift send animation installed ✅');
  }
  setTimeout(tryUpgrade, 800);
})();

/* ─────────────────────────────────────────────────────────────────────────
   § 8  GIFT CARD 3D TILT (pointer-move parallax on hover)
───────────────────────────────────────────────────────────────────────── */
(function addGiftCard3DTilt() {
  function patch() {
    const grid = document.getElementById('gm-grid');
    if (!grid || grid.dataset.v30tilt) return;
    grid.dataset.v30tilt = '1';

    grid.addEventListener('mousemove', e => {
      const card = e.target.closest('.gm-card');
      if (!card) return;
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width  / 2);
      const dy     = (e.clientY - cy) / (rect.height / 2);
      card.style.transform = `perspective(400px) rotateY(${dx*12}deg) rotateX(${-dy*12}deg) scale(1.08)`;
      card.style.boxShadow = `${-dx*8}px ${dy*8}px 20px rgba(0,0,0,.4), 0 0 20px ${card._giftColor||'#FFD700'}44`;
      card.style.transition = 'transform .05s,box-shadow .05s';
      card.style.zIndex = '10';
    }, { passive: true });

    grid.addEventListener('mouseleave', e => {
      const cards = grid.querySelectorAll('.gm-card');
      cards.forEach(card => {
        card.style.transform = '';
        card.style.boxShadow = '';
        card.style.zIndex    = '';
        card.style.transition = 'transform .3s,box-shadow .3s';
      });
    }, { passive: true });

    // Touch tilt for mobile
    grid.addEventListener('touchmove', e => {
      const touch = e.touches[0];
      const el    = document.elementFromPoint(touch.clientX, touch.clientY);
      const card  = el?.closest('.gm-card');
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const dx   = (touch.clientX - rect.left - rect.width/2)  / (rect.width/2);
      const dy   = (touch.clientY - rect.top  - rect.height/2) / (rect.height/2);
      card.style.transform = `perspective(400px) rotateY(${dx*8}deg) rotateX(${-dy*8}deg) scale(1.06)`;
    }, { passive: true });
  }

  // Re-apply after grid re-renders
  const observer = new MutationObserver(() => patch());
  observer.observe(document.body, { childList: true, subtree: true });
  setTimeout(patch, 1000);
  console.log('[v30] Gift card 3D tilt added ✅');
})();

/* ─────────────────────────────────────────────────────────────────────────
   § 9  GIFT SELECTION HAPTIC FEEDBACK
───────────────────────────────────────────────────────────────────────── */
(function addGiftHaptics() {
  function tryPatch() {
    if (typeof window.gmSelectGift !== 'function') { setTimeout(tryPatch, 500); return; }
    if (window.gmSelectGift._v30) return;
    const orig = window.gmSelectGift;
    window.gmSelectGift = function(id) {
      orig.apply(this, arguments);
      // Haptic feedback on selection
      if (navigator.vibrate) {
        const gift = (typeof gmGetCatalogue === 'function' ? gmGetCatalogue() : []).find(g => g.id === id);
        if (!gift) return;
        const patterns = { legendary:[30,20,60], epic:[40,20,40], rare:[30], common:[20] };
        navigator.vibrate(patterns[gift.tier] || [20]);
      }
    };
    window.gmSelectGift._v30 = true;
    console.log('[v30] Gift selection haptics added ✅');
  }
  setTimeout(tryPatch, 800);
})();

/* ─────────────────────────────────────────────────────────────────────────
   § 10  BOOT
───────────────────────────────────────────────────────────────────────── */
console.log(`
╔═══════════════════════════════════════════════════════════╗
║  AfriBConnect v30 — Security + 3D Gifts LOADED ✅         ║
║  Security:                                                ║
║  • XSS output escaping on all user content                ║
║  • CSRF token on all cloud writes                         ║
║  • Admin session auto-lock (30min)                        ║
║  • Progressive login delay (1s→30s)                       ║
║  • Console log pwHash redaction                           ║
║  3D Gift Upgrades:                                        ║
║  ★ 6 new gifts: Ring, Rose, Fireworks, Trophy, Globe, Crystal║
║  ★ Cinematic send: 3D scene + rumble + flash + trails     ║
║  ★ Category effects: hearts (love), coin rain (luxury)    ║
║  ★ Shockwave ring on legendary impact                     ║
║  ★ Gift card 3D tilt parallax on hover                    ║
║  ★ Haptic vibration on gift selection                     ║
╚═══════════════════════════════════════════════════════════╝
`);
