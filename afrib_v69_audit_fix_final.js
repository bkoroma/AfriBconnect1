/* ═══════════════════════════════════════════════════════════════════
   AfribConnect — v64 Profile Picture / Avatar Upload
   ───────────────────────────────────────────────────────────────────
   Adds a tap-to-upload camera overlay on the profile modal avatar.
   • Compresses images to ≤200KB via canvas before storing
   • Persists to AfribStore (accounts + session + currentUser)
   • Refreshes every avatar surface in the app on save
   • Works with existing pmAvatar element (initials → photo)
   ─────────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  /* ── CSS ──────────────────────────────────────────────────────── */
  const CSS = `
    /* Avatar wrapper — needed for overlay positioning */
    .pm-avatar-wrap {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    /* Camera overlay badge */
    .pm-avatar-cam {
      position: absolute;
      bottom: 0; right: 0;
      width: 22px; height: 22px;
      border-radius: 50%;
      background: var(--gold, #D4AF37);
      display: flex; align-items: center; justify-content: center;
      font-size: 11px;
      box-shadow: 0 0 0 2px var(--bg, #0D0A07);
      pointer-events: none;
      z-index: 2;
      transition: transform .15s ease;
    }
    .pm-avatar-wrap:hover .pm-avatar-cam {
      transform: scale(1.15);
    }
    /* Photo preview inside avatar */
    #pmAvatarImg {
      position: absolute;
      inset: 0;
      width: 100%; height: 100%;
      object-fit: cover;
      border-radius: 50%;
      z-index: 1;
    }
    /* Upload progress ring (shown during processing) */
    .pm-avatar-uploading::after {
      content: '';
      position: absolute;
      inset: -3px;
      border-radius: 50%;
      border: 3px solid transparent;
      border-top-color: var(--gold, #D4AF37);
      animation: afrib-spin .7s linear infinite;
      z-index: 3;
    }
    @keyframes afrib-spin { to { transform: rotate(360deg); } }

    /* Change-photo toast button style */
    #pmAvatarChangeBtn {
      display: none; /* shown only after a photo exists */
      font-size: 11px;
      color: rgba(212,175,55,.7);
      background: none;
      border: none;
      cursor: pointer;
      margin-top: 4px;
      text-decoration: underline;
    }
  `;

  function injectCSS () {
    if (document.getElementById('afrib-v64-avatar-css')) return;
    const s = document.createElement('style');
    s.id = 'afrib-v64-avatar-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* ── Image compression via canvas ────────────────────────────── */
  function compressImage (file, maxBytes, callback) {
    const MAX = maxBytes || 200 * 1024; // 200 KB default
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        let w = img.naturalWidth, h = img.naturalHeight;
        // Scale down to 400×400 max
        const MAX_DIM = 400;
        if (w > MAX_DIM || h > MAX_DIM) {
          if (w > h) { h = Math.round(h * MAX_DIM / w); w = MAX_DIM; }
          else       { w = Math.round(w * MAX_DIM / h); h = MAX_DIM; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);

        let quality = 0.85;
        let dataURL = canvas.toDataURL('image/jpeg', quality);
        // Reduce quality until under MAX
        while (dataURL.length * 0.75 > MAX && quality > 0.3) {
          quality -= 0.1;
          dataURL = canvas.toDataURL('image/jpeg', quality);
        }
        callback(dataURL);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  /* ── Persist avatar to all storage layers ────────────────────── */
  function persistAvatar (dataURL) {
    try {
      // 1. AfribStore (accounts JSON + session)
      if (typeof AfribStore !== 'undefined' && typeof AfribStore.me === 'function') {
        const me = AfribStore.me();
        if (me && me.email) {
          AfribStore.update(me.email, { avatar: dataURL });
        }
      }
    } catch (e) { console.warn('[v64] AfribStore persist error:', e); }

    try {
      // 2. currentUser in-memory
      if (window.currentUser) window.currentUser.avatar = dataURL;
    } catch (_) {}

    try {
      // 3. Legacy afrib_session fallback
      const raw = localStorage.getItem('afrib_session');
      if (raw) {
        const sess = JSON.parse(raw);
        sess.avatar = dataURL;
        localStorage.setItem('afrib_session', JSON.stringify(sess));
      }
    } catch (_) {}
  }

  /* ── Refresh every avatar element across the app ─────────────── */
  function refreshAllAvatars (dataURL, initials) {
    // Profile modal large avatar
    const pmImg = document.getElementById('pmAvatarImg');
    if (pmImg) { pmImg.src = dataURL; pmImg.style.display = 'block'; }

    const pmText = document.getElementById('pmAvatar');
    if (pmText) pmText.style.color = 'transparent'; // hide initials behind photo

    const changeBtn = document.getElementById('pmAvatarChangeBtn');
    if (changeBtn) changeBtn.style.display = 'inline-block';

    // Header / nav bar avatars (various selectors used across patches)
    const selectors = [
      '.afrib-avatar',
      '.user-avatar-img',
      '#profileAvatar',
      '#appAvatar',
      '.pm-avatar',
    ];
    selectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        if (el.id === 'pmAvatar') return; // handled separately above
        // If element already contains an img, update it
        let img = el.querySelector('img');
        if (!img) {
          img = document.createElement('img');
          img.alt = initials || 'Avatar';
          el.style.overflow = 'hidden';
          el.appendChild(img);
        }
        img.src = dataURL;
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:50%';
        // hide initials text node(s)
        el.childNodes.forEach(function (n) {
          if (n.nodeType === Node.TEXT_NODE) n.textContent = '';
        });
      });
    });
  }

  /* ── Build and wire the upload UI ────────────────────────────── */
  function installUploadUI () {
    const pmAvatar = document.getElementById('pmAvatar');
    if (!pmAvatar) return false;

    // Don't double-install
    if (pmAvatar.dataset.v64) return true;
    pmAvatar.dataset.v64 = '1';

    // Wrap pmAvatar in a relative container (if not already)
    let wrap = pmAvatar.parentElement;
    if (!wrap || !wrap.classList.contains('pm-avatar-wrap')) {
      wrap = document.createElement('div');
      wrap.className = 'pm-avatar-wrap';
      // Copy avatar dimensions so the wrap matches
      const cs = getComputedStyle(pmAvatar);
      wrap.style.width  = cs.width;
      wrap.style.height = cs.height;
      wrap.style.borderRadius = '50%';
      pmAvatar.parentNode.insertBefore(wrap, pmAvatar);
      wrap.appendChild(pmAvatar);
    }

    // Hidden photo preview <img> (shown once a photo is set)
    let pmImg = document.getElementById('pmAvatarImg');
    if (!pmImg) {
      pmImg = document.createElement('img');
      pmImg.id = 'pmAvatarImg';
      pmImg.alt = 'Profile photo';
      pmImg.style.display = 'none';
      wrap.appendChild(pmImg);
    }

    // Camera badge
    if (!wrap.querySelector('.pm-avatar-cam')) {
      const cam = document.createElement('div');
      cam.className = 'pm-avatar-cam';
      cam.textContent = '📷';
      wrap.appendChild(cam);
    }

    // Hidden file input
    let fileInput = document.getElementById('pmAvatarInput');
    if (!fileInput) {
      fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.id = 'pmAvatarInput';
      fileInput.accept = 'image/*';
      fileInput.style.display = 'none';
      document.body.appendChild(fileInput);
    }

    // "Change photo" text link (shown after upload)
    let changeBtn = document.getElementById('pmAvatarChangeBtn');
    if (!changeBtn) {
      changeBtn = document.createElement('button');
      changeBtn.id = 'pmAvatarChangeBtn';
      changeBtn.type = 'button';
      changeBtn.textContent = 'Change photo';
      // Insert it after the wrap
      wrap.parentNode.insertBefore(changeBtn, wrap.nextSibling);
      changeBtn.addEventListener('click', function () {
        fileInput.click();
      });
    }

    // Click on avatar → open file picker
    wrap.addEventListener('click', function () {
      fileInput.click();
    });

    // File selected
    fileInput.addEventListener('change', function () {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;

      // Validate type
      if (!file.type.startsWith('image/')) {
        if (typeof window.showToast === 'function') {
          window.showToast('⚠️ Please select an image file');
        }
        return;
      }

      // Show spinner
      wrap.classList.add('pm-avatar-uploading');

      compressImage(file, 200 * 1024, function (dataURL) {
        wrap.classList.remove('pm-avatar-uploading');

        // Persist
        persistAvatar(dataURL);

        // Derive initials for alt text
        const user = window.currentUser || {};
        const initials = (((user.first || 'U')[0]) + ((user.last || '')[0] || '')).toUpperCase();

        // Update all avatar surfaces
        refreshAllAvatars(dataURL, initials);

        if (typeof window.showToast === 'function') {
          window.showToast('✅ Profile photo updated');
        }

        // Reset input so same file can be re-selected
        fileInput.value = '';
      });
    });

    return true;
  }

  /* ── Patch showProfileModal to restore saved avatar on open ─── */
  function patchShowProfileModal () {
    const _orig = window.showProfileModal;
    window.showProfileModal = function () {
      // Run original first
      if (typeof _orig === 'function') {
        try { _orig.apply(this, arguments); } catch (e) { console.warn('[v64] orig showProfileModal error:', e); }
      }

      // Ensure UI is installed (modal may not exist until first open)
      setTimeout(function () {
        installUploadUI();

        // Restore avatar photo if user has one stored
        const user = window.currentUser || {};
        const avatar = user.avatar || '';
        const pmImg  = document.getElementById('pmAvatarImg');
        const pmText = document.getElementById('pmAvatar');
        const changeBtn = document.getElementById('pmAvatarChangeBtn');

        if (avatar && pmImg) {
          pmImg.src = avatar;
          pmImg.style.display = 'block';
          if (pmText) pmText.style.color = 'transparent';
          if (changeBtn) changeBtn.style.display = 'inline-block';
        } else {
          if (pmImg) pmImg.style.display = 'none';
          if (pmText) pmText.style.color = '';
          if (changeBtn) changeBtn.style.display = 'none';
        }
      }, 50);
    };
    window.showProfileModal._v64avatar = true;
  }

  /* ── Boot sequence ────────────────────────────────────────────── */
  function boot () {
    injectCSS();
    patchShowProfileModal();

    // Also patch v62's installSafeShowProfileModal output
    const _origSafe = window.showProfileModal;
    // Re-patch husOpenProfile to use our wrapped version
    const _origHus = window.husOpenProfile;
    window.husOpenProfile = function () {
      if (typeof _origHus === 'function') _origHus.apply(this, arguments);
    };

    // If profile modal is somehow already open, install now
    const modal = document.getElementById('profileModal');
    if (modal && modal.classList.contains('open')) {
      installUploadUI();
    }

    console.log('[AfribConnect v64] Profile picture upload active ✓');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
