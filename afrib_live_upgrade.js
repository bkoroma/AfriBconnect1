/* ═══════════════════════════════════════════════════
   AFRIBCONNECT — UPGRADED LANDING PAGE
   Aesthetic: African Luxury · Bold · Electric
═══════════════════════════════════════════════════ */

@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

/* ── TOKENS ── */
:root {
  --gold: #D4AF37;
  --gold2: #F5D05E;
  --orange: #E85D26;
  --emerald: #00B87A;
  --bg: #07050A;
  --bg2: #0D0A14;
  --bg3: #13101C;
  --bg4: #1C1828;
  --border: rgba(255,255,255,.07);
  --border-gold: rgba(212,175,55,.25);
  --w80: rgba(255,255,255,.8);
  --w60: rgba(255,255,255,.6);
  --w30: rgba(255,255,255,.3);
  --w10: rgba(255,255,255,.08);
  --font-d: 'Playfair Display', Georgia, serif;
  --font-b: 'Space Grotesk', system-ui, sans-serif;
}

/* ── RESET BODY FOR LANDING ── */
#landing-page {
  background: var(--bg);
  font-family: var(--font-b);
}

/* ═══════════════════════
   NAV — REDESIGNED
═══════════════════════ */
#landing-page .nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  padding: 0;
  transition: all .4s ease;
}
#landing-page .nav::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(7,5,10,.95) 0%, transparent 100%);
  pointer-events: none;
  opacity: 0;
  transition: opacity .4s;
}
#landing-page .nav.scrolled::before { opacity: 1; }
#landing-page .nav.scrolled {
  background: rgba(7,5,10,.88);
  backdrop-filter: blur(20px);
  box-shadow: 0 1px 0 rgba(212,175,55,.12);
}

#landing-page .nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 32px;
  display: flex;
  align-items: center;
  gap: 48px;
}

#landing-page .logo {
  font-family: var(--font-b);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 3px;
  color: var(--gold);
  text-decoration: none;
  position: relative;
}
#landing-page .logo-accent { color: var(--orange); }

#landing-page .nav-links {
  list-style: none;
  display: flex;
  gap: 36px;
  margin-left: auto;
  align-items: center;
}
#landing-page .nav-links a {
  color: var(--w60);
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: .3px;
  transition: color .2s;
}
#landing-page .nav-links a:hover { color: #fff; }

#landing-page .btn-nav-ghost {
  border: 1px solid rgba(255,255,255,.15) !important;
  padding: 9px 22px;
  border-radius: 100px !important;
  color: var(--w80) !important;
  transition: all .25s !important;
  font-size: 13px !important;
}
#landing-page .btn-nav-ghost:hover {
  border-color: var(--gold) !important;
  color: var(--gold) !important;
}
#landing-page .btn-nav {
  background: var(--gold) !important;
  color: #07050A !important;
  font-weight: 700 !important;
  padding: 9px 22px !important;
  border-radius: 100px !important;
  font-size: 13px !important;
  letter-spacing: .3px;
  transition: all .25s !important;
  box-shadow: 0 0 0 0 rgba(212,175,55,0);
}
#landing-page .btn-nav:hover {
  background: var(--gold2) !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 8px 24px rgba(212,175,55,.3) !important;
}

/* ═══════════════════════
   HERO — FULL REDESIGN
═══════════════════════ */
#landing-page .hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  overflow: hidden;
  padding: 0;
  margin: 0;
  max-width: none;
  background: var(--bg);
}

/* Multi-layer atmospheric background */
.hero-canvas {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}
.hero-canvas::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 70% 60% at 10% 50%, rgba(212,175,55,.08) 0%, transparent 60%),
    radial-gradient(ellipse 50% 50% at 85% 30%, rgba(232,93,38,.07) 0%, transparent 55%),
    radial-gradient(ellipse 40% 60% at 60% 90%, rgba(0,184,122,.05) 0%, transparent 50%);
}

/* Animated grid pattern */
.hero-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(212,175,55,.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(212,175,55,.04) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 80%);
  animation: gridShift 20s linear infinite;
}
@keyframes gridShift {
  0% { transform: translate(0, 0); }
  100% { transform: translate(60px, 60px); }
}

/* Floating orbs */
.hero-orb-new {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
}
.hero-orb-a {
  width: 600px; height: 600px;
  background: radial-gradient(circle, rgba(212,175,55,.12) 0%, transparent 70%);
  top: -200px; left: -200px;
  animation: floatA 12s ease-in-out infinite;
}
.hero-orb-b {
  width: 500px; height: 500px;
  background: radial-gradient(circle, rgba(232,93,38,.09) 0%, transparent 70%);
  bottom: -150px; right: -100px;
  animation: floatB 15s ease-in-out infinite;
}
.hero-orb-c {
  width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(0,184,122,.07) 0%, transparent 70%);
  top: 50%; left: 50%;
  transform: translate(-50%,-50%);
  animation: floatC 18s ease-in-out infinite;
}
@keyframes floatA {
  0%,100% { transform: translate(0,0) scale(1); }
  33% { transform: translate(40px,-30px) scale(1.08); }
  66% { transform: translate(-20px,40px) scale(0.95); }
}
@keyframes floatB {
  0%,100% { transform: translate(0,0) scale(1); }
  50% { transform: translate(-30px,-40px) scale(1.1); }
}
@keyframes floatC {
  0%,100% { transform: translate(-50%,-50%) scale(1); opacity: .5; }
  50% { transform: translate(-50%,-50%) scale(1.3); opacity: 1; }
}

/* Noise grain */
.hero-grain {
  position: absolute;
  inset: 0;
  opacity: .03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 256px;
  pointer-events: none;
}

/* Hero layout */
.hero-layout {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 130px 32px 80px;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
}

/* ── LEFT SIDE ── */
.hero-left {}

.hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: rgba(212,175,55,.06);
  border: 1px solid rgba(212,175,55,.2);
  border-radius: 100px;
  padding: 7px 18px;
  margin-bottom: 28px;
  opacity: 0;
  animation: riseIn .7s .1s cubic-bezier(.16,1,.3,1) forwards;
}
.hero-eyebrow-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--emerald);
  box-shadow: 0 0 8px var(--emerald);
  animation: pulse-dot 2s ease-in-out infinite;
}
@keyframes pulse-dot {
  0%,100% { opacity: 1; box-shadow: 0 0 8px var(--emerald); }
  50% { opacity: .5; box-shadow: 0 0 3px var(--emerald); }
}
.hero-eyebrow-text {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--gold);
}

.hero-headline {
  font-family: var(--font-d);
  font-size: clamp(48px, 6vw, 82px);
  font-weight: 900;
  line-height: 1.02;
  margin-bottom: 24px;
  opacity: 0;
  animation: riseIn .8s .2s cubic-bezier(.16,1,.3,1) forwards;
}
.hero-headline .line-plain { color: #fff; display: block; }
.hero-headline .line-gold {
  color: transparent;
  -webkit-text-stroke: 1px var(--gold);
  display: block;
  font-style: italic;
}
.hero-headline .line-accent {
  color: var(--gold);
  display: block;
  position: relative;
}
.hero-headline .line-accent::after {
  content: '';
  position: absolute;
  bottom: 4px; left: 0;
  width: 100%; height: 3px;
  background: linear-gradient(90deg, var(--gold), var(--orange), transparent);
  border-radius: 2px;
  animation: lineGrow 1.2s .9s ease forwards;
  transform-origin: left;
  transform: scaleX(0);
}
@keyframes lineGrow { to { transform: scaleX(1); } }

.hero-body {
  font-size: 17px;
  color: var(--w60);
  line-height: 1.75;
  max-width: 460px;
  margin-bottom: 36px;
  opacity: 0;
  animation: riseIn .7s .35s cubic-bezier(.16,1,.3,1) forwards;
}

.hero-actions {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 48px;
  opacity: 0;
  animation: riseIn .7s .45s cubic-bezier(.16,1,.3,1) forwards;
}
.btn-hero-primary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, var(--gold) 0%, var(--gold2) 50%, var(--orange) 100%);
  color: #07050A;
  font-family: var(--font-b);
  font-weight: 700;
  font-size: 15px;
  padding: 15px 32px;
  border-radius: 100px;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all .3s;
  box-shadow: 0 4px 20px rgba(212,175,55,.25);
  position: relative;
  overflow: hidden;
}
.btn-hero-primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,.15), transparent);
  opacity: 0;
  transition: opacity .3s;
}
.btn-hero-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 36px rgba(212,175,55,.4);
}
.btn-hero-primary:hover::before { opacity: 1; }

.btn-hero-secondary {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: transparent;
  color: var(--w80);
  font-family: var(--font-b);
  font-weight: 500;
  font-size: 15px;
  padding: 15px 28px;
  border-radius: 100px;
  text-decoration: none;
  border: 1px solid rgba(255,255,255,.15);
  cursor: pointer;
  transition: all .3s;
}
.btn-hero-secondary:hover {
  border-color: rgba(255,255,255,.35);
  color: #fff;
  transform: translateY(-2px);
}

/* Trust metrics strip */
.hero-metrics {
  display: flex;
  gap: 36px;
  align-items: center;
  opacity: 0;
  animation: riseIn .7s .6s cubic-bezier(.16,1,.3,1) forwards;
}
.hm-divider { width: 1px; height: 32px; background: var(--border); }
.hm-item {}
.hm-number {
  font-size: 26px;
  font-weight: 700;
  color: var(--gold);
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.hm-label { font-size: 11px; color: var(--w30); margin-top: 3px; letter-spacing: .5px; }

@keyframes riseIn {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ── RIGHT SIDE — Phone Mockup ── */
.hero-right {
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  animation: riseIn .9s .3s cubic-bezier(.16,1,.3,1) forwards;
}

.phone-mockup-wrap {
  position: relative;
  width: 280px;
}

/* Glow behind phone */
.phone-mockup-wrap::before {
  content: '';
  position: absolute;
  inset: -30px;
  background: radial-gradient(ellipse 80% 80% at 50% 50%, rgba(212,175,55,.15) 0%, transparent 70%);
  animation: phoneGlow 4s ease-in-out infinite;
}
@keyframes phoneGlow {
  0%,100% { opacity: .6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
}

/* Floating feature chips around the phone */
.phone-chip {
  position: absolute;
  background: rgba(13,10,20,.9);
  border: 1px solid var(--border-gold);
  border-radius: 12px;
  padding: 8px 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 24px rgba(0,0,0,.4);
  white-space: nowrap;
  z-index: 2;
}
.phone-chip-icon { font-size: 16px; }
.chip-1 {
  top: 8%;
  left: -60px;
  animation: chipFloat1 5s ease-in-out infinite;
}
.chip-2 {
  top: 30%;
  right: -65px;
  animation: chipFloat2 6s ease-in-out infinite;
}
.chip-3 {
  bottom: 30%;
  left: -70px;
  animation: chipFloat3 7s ease-in-out infinite;
}
.chip-4 {
  bottom: 10%;
  right: -55px;
  animation: chipFloat1 5.5s ease-in-out infinite reverse;
}
@keyframes chipFloat1 {
  0%,100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}
@keyframes chipFloat2 {
  0%,100% { transform: translateY(0px); }
  50% { transform: translateY(10px); }
}
@keyframes chipFloat3 {
  0%,100% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
}

/* The actual phone UI */
.phone-shell {
  background: #0D0A14;
  border: 1.5px solid rgba(212,175,55,.25);
  border-radius: 36px;
  overflow: hidden;
  box-shadow:
    0 40px 80px rgba(0,0,0,.7),
    inset 0 1px 0 rgba(255,255,255,.06),
    0 0 0 6px rgba(255,255,255,.03);
  cursor: pointer;
  transition: transform .4s cubic-bezier(.16,1,.3,1), box-shadow .4s;
  position: relative;
  z-index: 1;
}
.phone-shell:hover {
  transform: translateY(-8px) rotateY(-3deg) rotateX(2deg);
  box-shadow:
    0 60px 120px rgba(0,0,0,.8),
    0 0 0 1px rgba(212,175,55,.3),
    0 0 40px rgba(212,175,55,.08);
}

/* Phone status bar */
.phone-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px 6px;
  font-size: 10px;
  color: rgba(255,255,255,.5);
  font-weight: 600;
}
.phone-notch {
  width: 60px; height: 4px;
  background: rgba(255,255,255,.12);
  border-radius: 2px;
}

/* Phone top bar */
.phone-topbar {
  padding: 6px 16px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255,255,255,.05);
}
.phone-brand {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.5px;
  color: var(--gold);
}
.phone-brand span { color: var(--orange); }
.phone-ping {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--emerald);
  box-shadow: 0 0 8px var(--emerald);
  animation: pulse-dot 2s ease-in-out infinite;
}

/* App grid inside phone */
.phone-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 12px 14px;
}
.phone-app {
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.06);
  border-radius: 14px;
  padding: 12px 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  transition: all .2s;
}
.phone-app:hover {
  background: rgba(212,175,55,.08);
  border-color: rgba(212,175,55,.2);
  transform: scale(1.04);
}
.phone-app-icon { font-size: 20px; }
.phone-app-label { font-size: 9px; color: rgba(255,255,255,.4); font-weight: 500; }

/* Phone activity ticker */
.phone-ticker {
  margin: 0 14px 8px;
  background: rgba(212,175,55,.06);
  border: 1px solid rgba(212,175,55,.12);
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 10px;
  color: rgba(255,255,255,.5);
  overflow: hidden;
  white-space: nowrap;
}
.phone-ticker-inner {
  animation: tickerScroll 12s linear infinite;
  display: inline-block;
}
@keyframes tickerScroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

/* CTA bar at bottom of phone */
.phone-cta {
  margin: 4px 14px 16px;
  background: linear-gradient(135deg, var(--gold), var(--orange));
  border-radius: 12px;
  padding: 10px;
  text-align: center;
  font-size: 11px;
  font-weight: 700;
  color: #07050A;
  letter-spacing: .5px;
}

/* ═══════════════════════
   SCROLL INDICATOR
═══════════════════════ */
.scroll-indicator {
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  opacity: 0;
  animation: riseIn .7s 1.2s ease forwards;
  z-index: 2;
}
.scroll-indicator-line {
  width: 1px;
  height: 40px;
  background: linear-gradient(to bottom, var(--gold), transparent);
  animation: scrollLine 2s ease-in-out infinite;
}
@keyframes scrollLine {
  0% { transform: scaleY(0); transform-origin: top; opacity: 1; }
  50% { transform: scaleY(1); transform-origin: top; opacity: 1; }
  100% { transform: scaleY(1); transform-origin: bottom; opacity: 0; }
}
.scroll-indicator-text {
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--w30);
}

/* ═══════════════════════
   MARQUEE STRIP
═══════════════════════ */
.marquee-strip {
  position: relative;
  overflow: hidden;
  background: rgba(212,175,55,.04);
  border-top: 1px solid rgba(212,175,55,.1);
  border-bottom: 1px solid rgba(212,175,55,.1);
  padding: 14px 0;
}
.marquee-strip::before,
.marquee-strip::after {
  content: '';
  position: absolute;
  top: 0; bottom: 0;
  width: 100px;
  z-index: 2;
}
.marquee-strip::before { left: 0; background: linear-gradient(90deg, var(--bg), transparent); }
.marquee-strip::after { right: 0; background: linear-gradient(-90deg, var(--bg), transparent); }
.marquee-track {
  display: flex;
  gap: 0;
  animation: marqueeRoll 30s linear infinite;
  width: max-content;
}
@keyframes marqueeRoll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.marquee-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 40px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--w30);
  white-space: nowrap;
}
.marquee-item .dot { width: 4px; height: 4px; border-radius: 50%; background: var(--gold); opacity: .5; }
.marquee-item .flag { font-size: 16px; }

/* ═══════════════════════
   FEATURES — UPGRADED
═══════════════════════ */
#landing-page .features {
  padding: 120px 0;
  background: var(--bg);
}
.features-header {
  max-width: 1200px;
  margin: 0 auto 70px;
  padding: 0 32px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 40px;
}
.features-header-left {}
.features-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 16px;
  font-weight: 600;
}
.features-eyebrow::before {
  content: '';
  width: 20px; height: 1px;
  background: var(--gold);
}
.features-headline {
  font-family: var(--font-d);
  font-size: clamp(36px, 4vw, 56px);
  font-weight: 900;
  line-height: 1.08;
  color: #fff;
}
.features-headline em { color: var(--gold); font-style: italic; }
.features-desc {
  font-size: 15px;
  color: var(--w60);
  max-width: 280px;
  line-height: 1.7;
  text-align: right;
}

/* Bento grid */
.features-bento {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto auto;
  gap: 16px;
}
.bento-card {
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 24px;
  padding: 32px;
  cursor: pointer;
  transition: all .35s cubic-bezier(.16,1,.3,1);
  position: relative;
  overflow: hidden;
}
.bento-card::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity .35s;
  background: linear-gradient(135deg, rgba(212,175,55,.04) 0%, transparent 60%);
}
.bento-card:hover { transform: translateY(-6px); border-color: rgba(212,175,55,.2); }
.bento-card:hover::before { opacity: 1; }

.bento-card.featured {
  grid-column: span 2;
  background: linear-gradient(135deg, rgba(212,175,55,.06) 0%, rgba(232,93,38,.04) 100%);
  border-color: rgba(212,175,55,.15);
}
.bento-card.tall { grid-row: span 2; }

.bento-icon {
  font-size: 36px;
  margin-bottom: 20px;
  display: block;
  filter: drop-shadow(0 0 12px rgba(212,175,55,.2));
}
.bento-tag {
  display: inline-block;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--gold);
  background: rgba(212,175,55,.08);
  border: 1px solid rgba(212,175,55,.15);
  border-radius: 100px;
  padding: 3px 10px;
  margin-bottom: 12px;
}
.bento-title {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 10px;
  line-height: 1.2;
}
.bento-card.featured .bento-title { font-size: 24px; }
.bento-body {
  font-size: 14px;
  color: var(--w60);
  line-height: 1.7;
  margin-bottom: 20px;
}
.bento-arrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--gold);
  transition: gap .2s;
}
.bento-card:hover .bento-arrow { gap: 10px; }

/* Featured card visual element */
.bento-featured-visual {
  position: absolute;
  right: 24px;
  top: 50%;
  transform: translateY(-50%);
  opacity: .15;
  font-size: 120px;
  line-height: 1;
  pointer-events: none;
}

/* ═══════════════════════
   STATS BANNER
═══════════════════════ */
.stats-banner {
  background: var(--bg2);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  padding: 60px 32px;
}
.stats-banner-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 40px;
}
.stat-block { text-align: center; }
.stat-block-num {
  font-family: var(--font-d);
  font-size: clamp(40px, 5vw, 64px);
  font-weight: 900;
  color: transparent;
  -webkit-text-stroke: 1.5px var(--gold);
  line-height: 1;
  margin-bottom: 8px;
}
.stat-block-num.filled {
  color: var(--gold);
  -webkit-text-stroke: none;
}
.stat-block-label {
  font-size: 13px;
  color: var(--w30);
  font-weight: 500;
  letter-spacing: .5px;
}
.stat-block-sub {
  font-size: 11px;
  color: var(--w30);
  margin-top: 4px;
}

/* ═══════════════════════
   COMMUNITY — UPGRADED
═══════════════════════ */
#landing-page .community {
  padding: 120px 0;
  background: var(--bg);
  position: relative;
  overflow: hidden;
}
.community-glow {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%,-50%);
  width: 800px; height: 400px;
  background: radial-gradient(ellipse, rgba(212,175,55,.04) 0%, transparent 60%);
  pointer-events: none;
}

.community-layout {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
}

.comm-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 20px;
}
.comm-label::before { content: ''; width: 20px; height: 1px; background: var(--gold); }

.comm-headline {
  font-family: var(--font-d);
  font-size: clamp(36px, 4vw, 56px);
  font-weight: 900;
  line-height: 1.08;
  color: #fff;
  margin-bottom: 20px;
}
.comm-headline em { color: var(--gold); font-style: italic; }
.comm-body {
  font-size: 16px;
  color: var(--w60);
  line-height: 1.75;
  margin-bottom: 36px;
  max-width: 420px;
}

.comm-stats-row {
  display: flex;
  gap: 32px;
}
.comm-stat {}
.comm-stat-num {
  font-size: 32px;
  font-weight: 700;
  color: var(--gold);
  line-height: 1;
}
.comm-stat-label { font-size: 12px; color: var(--w30); margin-top: 4px; }

/* Flag cloud */
.flag-cloud {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
}
.flag-item {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  background: rgba(255,255,255,.03);
  border: 1px solid rgba(255,255,255,.05);
  border-radius: 14px;
  transition: all .3s;
  cursor: default;
}
.flag-item:hover {
  background: rgba(212,175,55,.08);
  border-color: rgba(212,175,55,.2);
  transform: scale(1.12);
}
.flag-more-badge {
  grid-column: span 2;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(212,175,55,.06);
  border: 1px dashed rgba(212,175,55,.2);
  border-radius: 14px;
  font-size: 12px;
  color: var(--gold);
  font-weight: 600;
}

/* ═══════════════════════
   DOWNLOAD — UPGRADED
═══════════════════════ */
#landing-page .download {
  padding: 120px 0;
  background: var(--bg2);
  border-top: 1px solid var(--border);
}
.download-layout {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
}
.dl-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--emerald);
  margin-bottom: 20px;
}
.dl-eyebrow::before { content: ''; width: 20px; height: 1px; background: var(--emerald); }
.dl-headline {
  font-family: var(--font-d);
  font-size: clamp(36px, 4vw, 56px);
  font-weight: 900;
  line-height: 1.08;
  color: #fff;
  margin-bottom: 16px;
}
.dl-headline em { color: var(--gold); font-style: italic; }
.dl-body { font-size: 16px; color: var(--w60); line-height: 1.7; margin-bottom: 36px; }

.dl-buttons {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}
.dl-btn-new {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 14px 24px;
  border-radius: 14px;
  text-decoration: none;
  transition: all .3s;
  font-family: var(--font-b);
}
.dl-btn-new.primary {
  background: linear-gradient(135deg, var(--gold), var(--orange));
  color: #07050A;
  box-shadow: 0 4px 20px rgba(212,175,55,.2);
}
.dl-btn-new.primary:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(212,175,55,.35); }
.dl-btn-new.secondary {
  background: rgba(255,255,255,.05);
  border: 1px solid var(--border);
  color: #fff;
}
.dl-btn-new.secondary:hover { background: rgba(255,255,255,.08); border-color: rgba(255,255,255,.15); transform: translateY(-2px); }
.dl-btn-icon { font-size: 22px; }
.dl-btn-text small { display: block; font-size: 10px; opacity: .6; font-weight: 400; }
.dl-btn-text strong { display: block; font-size: 15px; font-weight: 700; }

.dl-pkg-note { font-size: 12px; color: var(--w30); }
.dl-pkg-note code { color: var(--gold); font-size: 11px; }

/* Download visual — mini phone */
.dl-visual {
  display: flex;
  justify-content: center;
  align-items: center;
}
.dl-phone-new {
  width: 220px;
  background: var(--bg3);
  border: 1px solid var(--border-gold);
  border-radius: 32px;
  overflow: hidden;
  box-shadow: 0 40px 80px rgba(0,0,0,.5), 0 0 0 1px rgba(212,175,55,.08);
  cursor: pointer;
  transition: all .4s cubic-bezier(.16,1,.3,1);
  position: relative;
}
.dl-phone-new::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 40%;
  background: linear-gradient(to top, rgba(212,175,55,.06), transparent);
  pointer-events: none;
}
.dl-phone-new:hover { transform: translateY(-10px) scale(1.02); box-shadow: 0 60px 100px rgba(0,0,0,.6), 0 0 0 1px rgba(212,175,55,.2), 0 0 40px rgba(212,175,55,.06); }
.dlp-bar { padding: 14px 16px 8px; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; color: var(--gold); }
.dlp-bar span { color: var(--orange); }
.dlp-body { padding: 0 12px 12px; }
.dlp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px; }
.dlp-tile { background: rgba(255,255,255,.04); border-radius: 12px; padding: 10px; text-align: center; font-size: 20px; }
.dlp-cta { background: linear-gradient(135deg, var(--gold), var(--orange)); border-radius: 10px; padding: 10px; text-align: center; font-size: 11px; font-weight: 700; color: #07050A; }

/* ═══════════════════════
   FOOTER — UPGRADED
═══════════════════════ */
#landing-page .footer {
  background: var(--bg);
  border-top: 1px solid var(--border);
  padding: 80px 0 0;
}
.footer-layout {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px 48px;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 60px;
}
.footer-brand-new {}
.footer-brand-name {
  font-family: var(--font-b);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 3px;
  color: var(--gold);
  margin-bottom: 12px;
}
.footer-brand-name span { color: var(--orange); }
.footer-brand-desc { font-size: 14px; color: var(--w30); line-height: 1.7; max-width: 220px; margin-bottom: 20px; }
.footer-brand-flags { font-size: 18px; letter-spacing: 4px; }
.footer-col-new {}
.footer-col-title { font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--w30); margin-bottom: 16px; }
.footer-col-new a, .footer-col-new p {
  display: block;
  font-size: 14px;
  color: var(--w60);
  text-decoration: none;
  margin-bottom: 10px;
  transition: color .2s;
}
.footer-col-new a:hover { color: var(--gold); }
.footer-bottom-new {
  border-top: 1px solid var(--border);
  padding: 20px 32px;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.footer-bottom-new p { font-size: 12px; color: var(--w30); }
.footer-bottom-new code { color: var(--gold); font-size: 11px; }

/* ═══════════════════════
   MOBILE RESPONSIVE
═══════════════════════ */
@media (max-width: 900px) {
  .hero-layout { grid-template-columns: 1fr; gap: 60px; text-align: center; }
  .hero-left { order: 1; }
  .hero-right { order: 2; }
  .hero-actions { justify-content: center; }
  .hero-metrics { justify-content: center; }
  .hero-body { margin: 0 auto 36px; }
  .phone-chip { display: none; }

  .features-bento { grid-template-columns: 1fr 1fr; }
  .bento-card.featured { grid-column: span 2; }
  .bento-card.tall { grid-row: auto; }

  .stats-banner-inner { grid-template-columns: repeat(2, 1fr); gap: 32px; }
  .community-layout { grid-template-columns: 1fr; gap: 48px; }
  .download-layout { grid-template-columns: 1fr; gap: 48px; }
  .footer-layout { grid-template-columns: 1fr 1fr; gap: 40px; }
  .features-header { flex-direction: column; gap: 16px; }
  .features-desc { text-align: left; }
}

@media (max-width: 600px) {
  .hero-layout { padding: 110px 20px 60px; }
  .features-bento { grid-template-columns: 1fr; padding: 0 20px; }
  .bento-card.featured { grid-column: span 1; }
  .features-header { padding: 0 20px; }
  .stats-banner-inner { grid-template-columns: repeat(2, 1fr); }
  .community-layout, .download-layout { padding: 0 20px; }
  .footer-layout { grid-template-columns: 1fr; padding: 0 20px 40px; }
  .footer-bottom-new { padding: 20px; flex-direction: column; gap: 8px; text-align: center; }
  .phone-mockup-wrap { width: 220px; }
  #landing-page .nav-inner { padding: 16px 20px; }

  .hero-headline { font-size: 42px; }
  .comm-stats-row { gap: 20px; }
}
