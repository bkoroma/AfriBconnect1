/* ═══════════════════════════════════════════════════════════════════════
   AfribConnect v70 — Home Screen Navigation Redesign
   afrib_v70_home_redesign.js

   CHANGES:
   ① Remove the duplicate top nav strip (bottom nav already handles nav)
   ② Compact, sticky greeting bar with avatar + balance + quick icons
   ③ Redesigned quick-action grid: 4 primary + "More" expandable
   ④ Section cards with clear labels and breathing room
   ⑤ Floating action button (FAB) for Send Money
   ⑥ Swipeable games row (horizontal scroll, bigger cards)
   ⑦ Cleaner wallet card — single row, no wrap
   ════════════════════════════════════════════════════════════════════ */

'use strict';

(function afribHomeRedesign() {

  /* ─── wait for DOM + scripts ─── */
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  /* ─── inject CSS ─── */
  function injectCSS() {
    if (document.getElementById('v70-home-css')) return;
    const s = document.createElement('style');
    s.id = 'v70-home-css';
    s.textContent = `

/* ════════════════════════════════════════════
   REMOVE duplicate top nav strip
   Keep profile card but strip the nav row
════════════════════════════════════════════ */
.hus-nav-strip,
.hus-divider {
  display: none !important;
}

/* Compact the profile card — just greeting + avatar row */
.home-unified-strip {
  margin: 0 !important;
  border-radius: 0 !important;
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
  padding-bottom: 6px !important;
  background: rgba(6,3,15,0.97) !important;
  position: sticky;
  top: 0;
  z-index: 100;
}
.hus-profile-row {
  padding: 10px 16px 8px !important;
}
.hus-actions {
  flex-direction: row !important;
  gap: 6px !important;
}

/* ════════════════════════════════════════════
   HERO BANNER — smaller, tighter on mobile
════════════════════════════════════════════ */
.home-hero-banner {
  margin: 0 12px 0 !important;
  border-radius: 18px !important;
  height: 110px !important;
  overflow: hidden;
}
.hhb-title {
  font-size: 17px !important;
  line-height: 1.25 !important;
}
.hhb-live-chip { font-size: 9px !important; }
.hhb-ticker-row { display: none !important; }
.hhb-map { font-size: 52px !important; opacity: 0.18 !important; }

/* ════════════════════════════════════════════
   WALLET CARD — compact single row
════════════════════════════════════════════ */
.home-wallet-card {
  padding: 16px 18px !important;
  margin-bottom: 0 !important;
  flex-direction: row !important;
  align-items: center !important;
  gap: 12px !important;
  border-radius: 18px !important;
}
.hwc-left { flex: 1; min-width: 0; }
.hwc-label { font-size: 9px !important; letter-spacing: 1px !important; margin-bottom: 2px !important; }
.hwc-amount { font-size: 26px !important; margin-bottom: 1px !important; }
.hwc-usd { font-size: 11px !important; }
.hwc-btns {
  flex-direction: column !important;
  gap: 6px !important;
  flex-wrap: nowrap !important;
}
.hwc-btn {
  padding: 8px 14px !important;
  font-size: 11px !important;
  white-space: nowrap;
  border-radius: 10px !important;
}
.hwc-coin-chip {
  top: 10px !important;
  right: 10px !important;
  font-size: 11px !important;
  padding: 3px 8px !important;
}

/* ════════════════════════════════════════════
   XP BAR — slimmer
════════════════════════════════════════════ */
.home-xp-bar-wrap {
  padding: 8px 14px !important;
  border-radius: 12px !important;
  margin-bottom: 0 !important;
}
.hxp-level-badge {
  width: 32px !important; height: 32px !important;
  font-size: 13px !important;
  margin-right: 10px !important;
}
.hxp-name { font-size: 12px !important; }
.hxp-pts  { font-size: 10px !important; }
.hxp-track { height: 5px !important; }

/* ════════════════════════════════════════════
   SECTION LABELS — tighter
════════════════════════════════════════════ */
.section-label {
  font-size: 10px !important;
  letter-spacing: 1.5px !important;
  margin-top: 20px !important;
  margin-bottom: 10px !important;
  color: rgba(255,255,255,0.45) !important;
}

/* ════════════════════════════════════════════
   QUICK ACTIONS — 4-column primary grid
════════════════════════════════════════════ */
.home-quick-grid {
  grid-template-columns: repeat(4, 1fr) !important;
  gap: 8px !important;
}
.hq-card {
  padding: 14px 8px !important;
  border-radius: 14px !important;
}
.hq-icon {
  font-size: 22px !important;
  margin-bottom: 5px !important;
}
.hq-label {
  font-size: 10px !important;
  font-weight: 700 !important;
}
.hq-sub {
  font-size: 8px !important;
}

/* Hide items 5-10 by default, show via .v70-qa-expanded */
.home-quick-grid .hq-card:nth-child(n+5) {
  display: none !important;
}
.home-quick-grid.v70-qa-expanded .hq-card:nth-child(n+5) {
  display: flex !important;
  flex-direction: column;
  align-items: center;
}

/* "Show more" button */
#v70-qa-toggle {
  width: 100%;
  padding: 9px;
  margin-top: 8px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  color: rgba(255,255,255,0.45);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
  -webkit-tap-highlight-color: transparent;
}
#v70-qa-toggle:hover {
  background: rgba(255,255,255,0.07);
  color: rgba(255,255,255,0.7);
}

/* ════════════════════════════════════════════
   GAMES STRIP — bigger, snappier cards
════════════════════════════════════════════ */
.home-games-strip {
  display: flex !important;
  overflow-x: auto !important;
  scrollbar-width: none !important;
  gap: 10px !important;
  padding-bottom: 4px !important;
  -webkit-overflow-scrolling: touch !important;
  scroll-snap-type: x mandatory !important;
}
.home-games-strip::-webkit-scrollbar { display: none; }
.hgs-card {
  min-width: 90px !important;
  width: 90px !important;
  flex-shrink: 0 !important;
  padding: 14px 8px 12px !important;
  border-radius: 16px !important;
  scroll-snap-align: start;
}
.hgs-icon { font-size: 28px !important; }
.hgs-name { font-size: 10px !important; font-weight: 700 !important; }
.hgs-badge {
  font-size: 8px !important;
  padding: 2px 6px !important;
  top: 6px !important;
  right: 6px !important;
}

/* ════════════════════════════════════════════
   FLOATING SEND MONEY FAB
════════════════════════════════════════════ */
#v70-send-fab {
  position: fixed;
  bottom: 76px;
  right: 16px;
  z-index: 500;
  display: none;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}
#v70-send-fab button {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: linear-gradient(135deg, #D4AF37, #b8860b);
  border: none;
  color: #000;
  font-size: 22px;
  cursor: pointer;
  box-shadow: 0 6px 24px rgba(212,175,55,0.45);
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex; align-items: center; justify-content: center;
}
#v70-send-fab button:active {
  transform: scale(0.92);
  box-shadow: 0 2px 10px rgba(212,175,55,0.3);
}
#v70-send-fab .v70-fab-lbl {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.5px;
  color: rgba(212,175,55,0.8);
  text-transform: uppercase;
}

/* Show FAB only on home screen */
body.on-screen-home #v70-send-fab {
  display: flex;
}

/* ════════════════════════════════════════════
   TRENDING SECTION — single column on mobile
════════════════════════════════════════════ */
.home-trending {
  grid-template-columns: 1fr !important;
  gap: 8px !important;
}
.trending-item {
  padding: 11px 12px !important;
  border-radius: 12px !important;
}

/* ════════════════════════════════════════════
   SHARE CARD — compact
════════════════════════════════════════════ */
.home-share-card {
  padding: 14px !important;
  border-radius: 14px !important;
  margin-top: 20px !important;
}
.home-share-title {
  font-size: 12px !important;
  margin-bottom: 10px !important;
}
.home-share-btns {
  display: grid !important;
  grid-template-columns: 1fr 1fr !important;
  gap: 6px !important;
}
.share-btn {
  padding: 8px !important;
  font-size: 11px !important;
  border-radius: 9px !important;
}

/* ════════════════════════════════════════════
   SPACING WRAPPER — consistent padding
════════════════════════════════════════════ */
#screen-home .screen-content > div[style*="padding:0 16px"],
#screen-home .screen-content > div[style*="padding: 0 16px"] {
  padding: 0 12px !important;
}

/* ════════════════════════════════════════════
   SECTION DIVIDERS — subtle visual breaks
════════════════════════════════════════════ */
.v70-section-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0.06) 70%, transparent);
  margin: 20px 0 0;
}

/* ════════════════════════════════════════════
   ONBOARDING + DAILY CHALLENGE — compact
════════════════════════════════════════════ */
#onboardingChecklist,
#dailyChallengeCard {
  margin-bottom: 8px !important;
}

/* Hide smart suggestions & deal of day (reduce noise) */
#smartSuggestions,
#dealOfDay {
  display: none !important;
}

/* ════════════════════════════════════════════
   AFRIMATCH TEASER — smaller
════════════════════════════════════════════ */
#homeAfriMatchTeaser > div {
  padding: 12px 14px !important;
  border-radius: 14px !important;
}

/* ════════════════════════════════════════════
   RESPONSIVE: portrait phone default
════════════════════════════════════════════ */
@media (min-width: 480px) {
  .home-quick-grid {
    grid-template-columns: repeat(5, 1fr) !important;
  }
  .home-quick-grid .hq-card:nth-child(n+5) {
    display: flex !important;
    flex-direction: column;
    align-items: center;
  }
  #v70-qa-toggle { display: none !important; }
}
@media (min-width: 768px) {
  .home-quick-grid {
    grid-template-columns: repeat(5, 1fr) !important;
  }
  .home-quick-grid .hq-card:nth-child(n+6) {
    display: none !important;
  }
  .home-hero-banner { height: 160px !important; }
  .hhb-title { font-size: 22px !important; }
  .hhb-ticker-row { display: flex !important; }
  .home-trending { grid-template-columns: repeat(2,1fr) !important; }
  #v70-send-fab { display: none !important; }
}
    `;
    document.head.appendChild(s);
  }

  /* ─── Inject the "Show more / less" toggle for quick actions ─── */
  function injectQAToggle() {
    const grid = document.querySelector('.home-quick-grid');
    if (!grid || document.getElementById('v70-qa-toggle')) return;

    const btn = document.createElement('button');
    btn.id = 'v70-qa-toggle';
    btn.textContent = '▾  More Actions';
    btn.setAttribute('aria-expanded', 'false');

    btn.addEventListener('click', () => {
      const expanded = grid.classList.toggle('v70-qa-expanded');
      btn.textContent = expanded ? '▴  Less' : '▾  More Actions';
      btn.setAttribute('aria-expanded', expanded);
    });

    // Insert after the grid
    grid.insertAdjacentElement('afterend', btn);
  }

  /* ─── Inject the Send Money FAB ─── */
  function injectSendFAB() {
    if (document.getElementById('v70-send-fab')) return;
    const fab = document.createElement('div');
    fab.id = 'v70-send-fab';
    fab.innerHTML = `
      <button onclick="showScreen('wallet');setTimeout(openSend,150)" aria-label="Send Money">
        💸
      </button>
      <div class="v70-fab-lbl">Send</div>
    `;
    document.body.appendChild(fab);
  }

  /* ─── Track active screen to show/hide FAB ─── */
  function patchShowScreenForFAB() {
    const orig = window.showScreen;
    if (typeof orig !== 'function' || orig._v70fab) return;
    const origFn = orig;
    window.showScreen = function showScreen(name) {
      const result = origFn.apply(this, arguments);
      document.body.classList.toggle('on-screen-home', name === 'home');
      return result;
    };
    window.showScreen._v70fab = true;
    // Copy other patch flags
    if (origFn._v70health) window.showScreen._v70health = true;
    if (origFn._v69) window.showScreen._v69 = true;
    // Set initial state
    const homeScreen = document.getElementById('screen-home');
    if (homeScreen && homeScreen.classList.contains('active')) {
      document.body.classList.add('on-screen-home');
    }
  }

  /* ─── Add section dividers between main home sections ─── */
  function addSectionDividers() {
    // Add visual spacing between the hero and wallet card
    const walletCard = document.querySelector('.home-wallet-card');
    if (walletCard && !walletCard.previousElementSibling?.classList?.contains('v70-section-divider')) {
      const div = document.createElement('div');
      div.className = 'v70-section-divider';
      walletCard.insertAdjacentElement('beforebegin', div);
    }
  }

  /* ─── Smooth scroll snap hint on games strip ─── */
  function enhanceGamesStrip() {
    const strip = document.querySelector('.home-games-strip');
    if (!strip || strip._v70enhanced) return;
    strip._v70enhanced = true;

    // Add scroll indicator dots
    const cards = strip.querySelectorAll('.hgs-card');
    if (cards.length < 2) return;

    const dotsWrap = document.createElement('div');
    dotsWrap.style.cssText = 'display:flex;justify-content:center;gap:5px;margin-top:8px';
    cards.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.style.cssText = `width:${i===0?'16':'5'}px;height:5px;border-radius:3px;background:${i===0?'rgba(212,175,55,.7)':'rgba(255,255,255,.12)'};transition:all .25s`;
      dotsWrap.appendChild(dot);
    });
    strip.insertAdjacentElement('afterend', dotsWrap);

    // Update dots on scroll
    strip.addEventListener('scroll', () => {
      const scrollPct = strip.scrollLeft / (strip.scrollWidth - strip.clientWidth);
      const active = Math.round(scrollPct * (cards.length - 1));
      dotsWrap.querySelectorAll('div').forEach((dot, i) => {
        dot.style.width    = i === active ? '16px' : '5px';
        dot.style.background = i === active ? 'rgba(212,175,55,.7)' : 'rgba(255,255,255,.12)';
      });
    }, { passive: true });
  }

  /* ─── INIT ─── */
  ready(function() {
    injectCSS();

    // Run DOM-dependent enhancements after scripts settle
    setTimeout(function() {
      injectQAToggle();
      injectSendFAB();
      patchShowScreenForFAB();
      addSectionDividers();
      enhanceGamesStrip();
      console.info('[v70-home] Navigation redesign applied ✅');
    }, 700);
  });

})();
