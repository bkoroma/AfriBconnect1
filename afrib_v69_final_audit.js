/* ═══════════════════════════════════════════════════════════════════════════
   AfribConnect v69 — Signup DOB Year Dropdown Fix
   afrib_v69_dob_fix.js
   ─────────────────────────────────────────────────────────────────────────
   Issues identified & fixed:
   1. Year dropdown only populated once — if user closes & reopens signup,
      years still show correctly BUT the guard prevents re-running which
      is fine. However if the DOM is reset between views, it breaks.
      Fixed: always ensure years are present whenever signup panel opens.

   2. Year range starts at current year (2026) but should start at
      (currentYear - 18) = 2008 since users must be 18+. Showing 2026,
      2025, 2024... up to 2008 and then blocking at validation is confusing.
      Fixed: top of range = currentYear - 18, bottom = currentYear - 120.

   3. The format toggle (MM/DD vs DD/MM) reorders the selects in the DOM
      but doesn't re-run initDobSelectors — days can get out of sync.
      Fixed: format toggle now re-validates and re-populates days.

   4. No visual grouping by decade makes 127 options hard to scan.
      Fixed: <optgroup> labels every 10 years for quick scanning.

   5. The year select had no autocomplete / type-to-jump behaviour.
      Fixed: keyboard number input jumps to typed year.
   ═══════════════════════════════════════════════════════════════════════════ */

(function AfribDOBFix() {
  'use strict';

  const CURRENT_YEAR = new Date().getFullYear(); // 2026
  const MIN_AGE      = 18;
  const MAX_AGE      = 120;
  const MAX_YEAR     = CURRENT_YEAR - MIN_AGE;   // 2008 — youngest user allowed
  const MIN_YEAR     = CURRENT_YEAR - MAX_AGE;   // 1906 — oldest user allowed

  /* ─────────────────────────────────────────────────────────────────
     CORE: Build year options with decade grouping
  ───────────────────────────────────────────────────────────────────── */
  function buildYearOptions(selectEl) {
    if (!selectEl) return;

    // Clear and reset
    selectEl.innerHTML = '<option value="">Year</option>';

    // Group years by decade using <optgroup>
    let currentDecade = null;
    let group = null;

    for (let y = MAX_YEAR; y >= MIN_YEAR; y--) {
      const decade = Math.floor(y / 10) * 10;

      // Start a new decade group
      if (decade !== currentDecade) {
        if (group) selectEl.appendChild(group);
        group = document.createElement('optgroup');
        group.label = decade + 's';
        currentDecade = decade;
      }

      const opt = document.createElement('option');
      opt.value       = y;
      opt.textContent = y;

      // Mark notable milestone years
      if (y === MAX_YEAR) opt.textContent = y + ' (18 yrs)';

      group.appendChild(opt);
    }
    if (group) selectEl.appendChild(group);

    // Style the select to look better on mobile
    selectEl.style.cssText += ';font-size:15px';
  }

  /* ─────────────────────────────────────────────────────────────────
     CORE: Build day options for the selected month/year
  ───────────────────────────────────────────────────────────────────── */
  function buildDayOptions(dayEl, month, year) {
    if (!dayEl) return;
    const prev = dayEl.value;
    const daysInMonth = month ? new Date(year || CURRENT_YEAR, month, 0).getDate() : 31;

    dayEl.innerHTML = '<option value="">Day</option>';
    for (let d = 1; d <= daysInMonth; d++) {
      const opt = document.createElement('option');
      opt.value = d;
      opt.textContent = d;
      dayEl.appendChild(opt);
    }
    // Restore previous selection if still valid
    if (prev && parseInt(prev) <= daysInMonth) dayEl.value = prev;
  }

  /* ─────────────────────────────────────────────────────────────────
     KEYBOARD TYPE-TO-JUMP on year select
     e.g. typing "1" "9" "9" "5" jumps to 1995
  ───────────────────────────────────────────────────────────────────── */
  function attachYearKeyboard(yearEl) {
    if (!yearEl || yearEl.__dobKeyboard) return;
    yearEl.__dobKeyboard = true;

    let typed = '';
    let timer;

    yearEl.addEventListener('keydown', (e) => {
      // Only digits
      if (!/^\d$/.test(e.key)) return;

      clearTimeout(timer);
      typed += e.key;

      // Jump to closest year in the dropdown
      const target = parseInt(typed);
      if (target >= MIN_YEAR && target <= MAX_YEAR) {
        // Find exact or closest option
        const opts = [...yearEl.options];
        const match = opts.find(o => parseInt(o.value) === target);
        if (match) {
          yearEl.value = match.value;
          yearEl.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }

      // Reset typed buffer after 1.5s of no input
      timer = setTimeout(() => { typed = ''; }, 1500);

      // Reset if 4 digits typed
      if (typed.length >= 4) typed = '';
    });
  }

  /* ─────────────────────────────────────────────────────────────────
     MAIN INIT — replaces and enhances initDobSelectors()
  ───────────────────────────────────────────────────────────────────── */
  function initDOB() {
    const yearEl  = document.getElementById('signupDobYear');
    const monthEl = document.getElementById('signupDobMonth');
    const dayEl   = document.getElementById('signupDobDay');

    if (!yearEl) return;

    // Always rebuild if year count is wrong or outdated
    // Count actual year options (exclude placeholder and optgroup labels)
    const yearOptions = [...yearEl.querySelectorAll('option')].filter(o => o.value !== '');
    const expectedCount = MAX_YEAR - MIN_YEAR + 1;

    if (yearOptions.length !== expectedCount) {
      buildYearOptions(yearEl);
    }

    // Rebuild days
    const month = parseInt(monthEl?.value) || 0;
    const year  = parseInt(yearEl?.value) || CURRENT_YEAR;
    buildDayOptions(dayEl, month, year);

    // Attach keyboard navigation
    attachYearKeyboard(yearEl);
  }

  /* ─────────────────────────────────────────────────────────────────
     PATCH: Replace the original initDobSelectors and populateDobDays
  ───────────────────────────────────────────────────────────────────── */
  function patchOriginals() {
    // Override initDobSelectors
    window.initDobSelectors = function() {
      try { initDOB(); } catch(e) {}
    };

    // Override populateDobDays
    window.populateDobDays = function() {
      try {
        const monthEl = document.getElementById('signupDobMonth');
        const dayEl   = document.getElementById('signupDobDay');
        const yearEl  = document.getElementById('signupDobYear');
        if (!dayEl) return;
        const month = parseInt(monthEl?.value) || 0;
        const year  = parseInt(yearEl?.value)  || CURRENT_YEAR;
        buildDayOptions(dayEl, month, year);
      } catch(e) {}
    };

    // Override getDobValidation to use correct bounds
    const origGetDob = window.getDobValidation;
    if (typeof origGetDob === 'function' && !origGetDob.__v69fixed) {
      window.getDobValidation = function() {
        const month = parseInt(document.getElementById('signupDobMonth')?.value);
        const day   = parseInt(document.getElementById('signupDobDay')?.value);
        const year  = parseInt(document.getElementById('signupDobYear')?.value);

        if (!month || !day || !year) return { error: null, age: null, dob: null };

        // Validate real date
        const dob = new Date(year, month - 1, day);
        if (dob.getFullYear() !== year || dob.getMonth() !== month - 1 || dob.getDate() !== day) {
          return { error: 'Invalid date — please check day, month and year', age: null, dob: null };
        }

        // Future date
        if (year > CURRENT_YEAR || dob > new Date()) {
          return { error: 'Date of birth cannot be in the future', age: null, dob: null };
        }

        // Calculate exact age
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;

        if (age < MIN_AGE) {
          return {
            error: `You must be at least ${MIN_AGE} years old to join AfribConnect`,
            age, dob: null
          };
        }
        if (age > MAX_AGE) {
          return { error: 'Please enter a valid year of birth', age: null, dob: null };
        }

        const dobStr = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        return { error: null, age, dob: dobStr };
      };
      window.getDobValidation.__v69fixed = true;
    }
  }

  /* ─────────────────────────────────────────────────────────────────
     PATCH: showAuth — re-init DOB every time signup panel opens
  ───────────────────────────────────────────────────────────────────── */
  function patchShowAuth() {
    const orig = window.showAuth;
    if (!orig || orig.__dobFixed) return;

    window.showAuth = function(panel) {
      try { orig.apply(this, arguments); } catch(e) {}
      if (panel === 'signup') {
        // Small delay to ensure panel is visible in DOM
        setTimeout(initDOB, 60);
      }
    };
    window.showAuth.__dobFixed = true;
  }

  /* ─────────────────────────────────────────────────────────────────
     PATCH: Format toggle (MM/DD ↔ DD/MM)
     When format changes, re-validate and update days
  ───────────────────────────────────────────────────────────────────── */
  function patchFormatToggle() {
    const orig = window.toggleDobFormat;
    if (!orig || orig.__dobFixed) return;

    window.toggleDobFormat = function() {
      try { orig.apply(this, arguments); } catch(e) {}
      // After format change, re-populate days
      setTimeout(() => {
        try { window.populateDobDays(); } catch(e) {}
        try { if (typeof window.validateDobLive === 'function') window.validateDobLive(); } catch(e) {}
      }, 30);
    };
    window.toggleDobFormat.__dobFixed = true;
  }

  /* ─────────────────────────────────────────────────────────────────
     STYLE INJECTION — improve DOB select appearance
  ───────────────────────────────────────────────────────────────────── */
  function injectDOBStyles() {
    if (document.getElementById('afrib-dob-styles')) return;
    const s = document.createElement('style');
    s.id = 'afrib-dob-styles';
    s.textContent = `
      /* DOB selects — better sizing and appearance */
      #signupDobMonth, #signupDobDay, #signupDobYear {
        flex: 1;
        min-width: 0;
        padding: 10px 8px;
        border-radius: 10px;
        background: var(--bg, #0d0920);
        border: 1.5px solid var(--border, rgba(255,255,255,.1));
        color: var(--white, #fff);
        font-size: 14px;
        outline: none;
        cursor: pointer;
        -webkit-appearance: none;
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(212,175,55,.7)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 10px center;
        padding-right: 28px;
        transition: border-color .2s;
      }
      #signupDobMonth:focus,
      #signupDobDay:focus,
      #signupDobYear:focus {
        border-color: rgba(212,175,55,.55);
        box-shadow: 0 0 0 3px rgba(212,175,55,.1);
      }
      #signupDobYear optgroup {
        color: rgba(212,175,55,.7);
        font-size: 11px;
        font-weight: 700;
        background: #0d0920;
      }
      #signupDobYear option {
        color: #fff;
        background: #0d0920;
        font-size: 14px;
        padding: 4px 0;
      }
      /* Age confirmation tag */
      #signupDobOk {
        font-size: 12px;
        color: #22c55e;
        font-weight: 700;
        margin-top: 4px;
        display: flex;
        align-items: center;
        gap: 5px;
      }
      /* DOB row layout */
      .dob-row {
        display: flex;
        gap: 8px;
      }
      /* Month gets more space */
      .dob-row #signupDobMonth { flex: 1.4; }
      .dob-row #signupDobDay   { flex: 0.8; }
      .dob-row #signupDobYear  { flex: 1.1; }
    `;
    document.head.appendChild(s);
  }

  /* ─────────────────────────────────────────────────────────────────
     INIT
  ───────────────────────────────────────────────────────────────────── */
  function init() {
    injectDOBStyles();
    patchOriginals();
    patchShowAuth();
    patchFormatToggle();

    // Run immediately if signup panel is somehow visible on load
    if (document.getElementById('signupDobYear')) {
      initDOB();
    }

    console.log(
      '%c[AfribConnect] 📅 DOB year dropdown fixed: '+MIN_YEAR+'–'+MAX_YEAR+' (ages '+MIN_AGE+'–'+MAX_AGE+')',
      'color:#D4AF37;font-weight:700'
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 200));
  } else {
    setTimeout(init, 200);
  }
  window.addEventListener('load', () => setTimeout(init, 500));

})();
