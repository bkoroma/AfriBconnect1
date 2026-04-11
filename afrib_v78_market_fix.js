/*!
 * AfribConnect v77 — YourStyle Complete Fix
 *
 * ROOT CAUSES FIXED:
 *  1. submitPost (v9_improvements) calls renderStyleFeed() instead of renderStyleFeedV71()
 *     → Feed doesn't update with algorithm after posting
 *  2. v72 localStorage.setItem monkey-patch has no try/finally
 *     → If submitPost throws, localStorage stays permanently overridden
 *  3. FAB visibility broken after v76 AfribRouter takes over showScreen
 *     → FAB (yourstyleFAB) stays hidden forever because v72's showScreen wrapper is bypassed
 *  4. createPostModal missing padding wrapper
 *     → Content bleeds to card edges (especially with v48's 32px border-radius)
 *  5. openCreatePost doesn't reset video state (_postVideoData / _pendingVideoData)
 *     → Stale video from previous post can leak into next post
 *  6. submitPost btn text not restored if post throws an uncaught error
 *     → "Posting…" stays on button forever, preventing further posts
 *  7. Feed not rendered when user first navigates to YourStyle (AfribRouter handler
 *     only fires renderStyleFeedV71 but only if already defined — race condition on cold load)
 *  8. "For You" tab active styling lost on re-renders (v74 + v73 fight over innerHTML)
 */
(function AfribV77() {
  'use strict';

  if (window.__afrib_v77) return;
  window.__afrib_v77 = true;

  /* ══════════════════════════════════════════════════════════
   * § 1  INJECT MODAL PADDING CSS
   *      createPostModal uses .modal-card with no inner padding.
   *      v48 sets border-radius:32px !important which makes content
   *      clip at corners. Fix: inject padding + content wrapper rules.
   * ══════════════════════════════════════════════════════════ */
  (function injectModalPaddingCSS() {
    const style = document.createElement('style');
    style.id = 'v77-modal-fix';
    style.textContent = `
      /* ── createPostModal padding fix ── */
      #createPostModal .modal-card {
        padding: 20px !important;
      }
      /* ── submitPostBtn always visible + pointer cursor ── */
      #submitPostBtn {
        cursor: pointer !important;
      }
      /* ── postImagePreview consistent height on mobile ── */
      #postImagePreview {
        min-height: 160px !important;
      }
      /* ── YourStyle FAB: hide by default, show only on style screen ── */
      #yourstyleFAB {
        display: none !important;
      }
      body[data-screen="style"] #yourstyleFAB {
        display: flex !important;
      }
      /* ── For You tab active state (prevent v73/v74 fight) ── */
      #styleTab-all.v77-active {
        background: var(--gold, #D4AF37) !important;
        color: #000 !important;
        border: none !important;
      }
      /* ── Post error box ── */
      #postError {
        border-radius: 8px !important;
      }
      /* ── Style feed empty state button ── */
      #styleFeedEmpty .btn-primary {
        display: inline-block !important;
      }
    `;
    document.head.appendChild(style);
  })();


  /* ══════════════════════════════════════════════════════════
   * § 2  SAFE submitPost WRAPPER
   *
   * Fixes ALL submitPost issues in one place:
   *  a) Always calls renderStyleFeedV71() if available, else renderStyleFeed()
   *  b) Always resets btn text even if inner post logic throws
   *  c) Always resets ALL video/image state (_postImageData, _postVideoData,
   *     _pendingVideoData, window._pendingPostPoll) after submit
   *  d) Safe localStorage.setItem restoration (try/finally)
   *  e) Calls closeModal reliably
   * ══════════════════════════════════════════════════════════ */
  function installSafeSubmitPost() {
    // Wait until the full chain is built (v75 is last to wrap submitPost)
    const orig = window.submitPost;
    if (!orig) {
      setTimeout(installSafeSubmitPost, 300);
      return;
    }
    // Don't double-wrap
    if (orig._v77safe) return;

    window.submitPost = function safeSubmitPostV77() {
      const btn   = document.getElementById('submitPostBtn');
      const errEl = document.getElementById('postError');

      // --- Guard: must be logged in ---
      if (!window.currentUser) {
        if (typeof showAuth === 'function') showAuth('login');
        return;
      }

      // --- Rate limit: max 10 posts per minute (mirrors v75 limit) ---
      try {
        const now = Date.now();
        const rl = JSON.parse(sessionStorage.getItem('_rl_post') || '{"c":0,"t":0}');
        if (now - rl.t > 60000) { rl.c = 0; rl.t = now; }
        if (rl.c >= 10) {
          if (typeof showToast === 'function') showToast('⏳ Posting too fast — wait a moment');
          return;
        }
        rl.c++;
        sessionStorage.setItem('_rl_post', JSON.stringify(rl));
      } catch(e) {}

      // --- Validate: need caption or media ---
      const caption = document.getElementById('postCaption')?.value?.trim() || '';
      const hasImage = !!(window._postImageData);
      const hasVideo = !!(window._postVideoData || window._pendingVideoData);

      if (!caption && !hasImage && !hasVideo) {
        if (errEl) {
          errEl.textContent = '⚠️ Add a photo, video or write a caption first';
          errEl.style.display = 'block';
        }
        return;
      }
      if (errEl) errEl.style.display = 'none';

      // --- Disable btn with posting state ---
      if (btn) { btn.disabled = true; btn.textContent = 'Posting…'; }

      try {
        // Build and save the post directly (bypass the fragile chain)
        _v77BuildAndSavePost(caption);

        // Clean up ALL media state
        _v77ClearMediaState();

        // Close modal
        try { if (typeof closeModal === 'function') closeModal('createPostModal'); } catch(e) {}

        // Toast
        try { if (typeof showToast === 'function') showToast('✨ Your post is live!'); } catch(e) {}

        // Refresh feed using best available renderer
        _v77RefreshFeed();

      } catch (err) {
        console.error('[v77] submitPost error:', err);
        if (errEl) {
          errEl.textContent = '⚠️ Could not post — please try again';
          errEl.style.display = 'block';
        }
      } finally {
        // ALWAYS restore button
        if (btn) {
          btn.disabled = false;
          btn.textContent = '✨ Post to YourStyle';
        }
      }
    };
    window.submitPost._v77safe = true;
    console.info('[AfribConnect v77] ✅ Safe submitPost installed');
  }

  /* Build + save a post object, pulling all media state from wherever it lives */
  function _v77BuildAndSavePost(caption) {
    if (!window.currentUser) throw new Error('Not logged in');

    const category = document.getElementById('postCategory')?.value || 'fashion';
    const tagsRaw  = document.getElementById('postTags')?.value?.trim() || '';

    // Gather media — prefer the unified _postImageData / _postVideoData set by v9
    const imageData = window._postImageData || null;
    const videoData = window._postVideoData || window._pendingVideoData || null;
    const mediaType = window._postMediaType || (imageData ? 'image' : videoData ? 'video' : null);

    const post = {
      id:            'post_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      authorEmail:   currentUser.email,
      authorFirst:   currentUser.first  || '',
      authorLast:    currentUser.last   || '',
      authorCountry: currentUser.country || '',
      caption:       caption,
      category:      category,
      tags:          tagsRaw,
      imageData:     imageData,
      videoData:     videoData,
      mediaType:     mediaType,
      saves:         0,
      shares:        0,
      createdAt:     new Date().toISOString(),
      ts:            Date.now(),
    };

    // Attach poll if one was configured
    if (window._pendingPostPoll) {
      post.poll = window._pendingPostPoll;
    }

    // Save via the canonical storage function (safe fallback to raw localStorage)
    if (typeof getStylePosts === 'function' && typeof saveStylePosts === 'function') {
      const posts = getStylePosts();
      posts.unshift(post);
      saveStylePosts(posts);
    } else {
      try {
        const raw   = localStorage.getItem('afrib_style_posts') || '[]';
        const posts = JSON.parse(raw);
        posts.unshift(post);
        localStorage.setItem('afrib_style_posts', JSON.stringify(posts));
      } catch (e) {
        throw new Error('Storage unavailable: ' + e.message);
      }
    }

    // Admin log (optional)
    try {
      if (typeof appendAdminLog === 'function') {
        appendAdminLog('post', currentUser.first + ' ' + currentUser.last, 'YourStyle post published', post.id);
      }
    } catch(e) {}

    return post;
  }

  /* Clear ALL media state variables used across v9, v72, social_upgrade */
  function _v77ClearMediaState() {
    window._postImageData    = null;
    window._postVideoData    = null;
    window._postMediaType    = null;
    window._pendingVideoData = null;
    window._pendingPostPoll  = null;

    // Also reset preview UI
    try {
      const prev = document.getElementById('postImagePreview');
      if (prev) {
        prev.innerHTML = `
          <span style="font-size:36px;margin-bottom:8px">📸</span>
          <span style="font-size:13px;color:var(--w60)">Tap to add a photo</span>
          <span style="font-size:11px;color:var(--w30);margin-top:4px">JPG, PNG up to 5MB</span>`;
      }
      const cap = document.getElementById('postCaption');
      if (cap) { cap.value = ''; const cc = document.getElementById('postCaptionCount'); if(cc) cc.textContent = '0 / 280'; }
      const tags = document.getElementById('postTags'); if (tags) tags.value = '';
      const cat  = document.getElementById('postCategory'); if (cat) cat.value = 'fashion';
      const poll = document.getElementById('pollSection'); if (poll) poll.style.display = 'none';
      const pq   = document.getElementById('pollQuestion'); if (pq) pq.value = '';
    } catch(e) {}
  }


  /* ══════════════════════════════════════════════════════════
   * § 3  RELIABLE FEED REFRESH
   *      Calls best available renderer, with graceful fallback
   * ══════════════════════════════════════════════════════════ */
  function _v77RefreshFeed() {
    // Only refresh if we're currently on the style screen
    const activeScreen = document.querySelector('.screen.active');
    const onStyleScreen = activeScreen && activeScreen.id === 'screen-style';

    if (!onStyleScreen) return; // Feed will refresh when user navigates there

    setTimeout(function() {
      try {
        if (typeof window.renderStyleFeedV71 === 'function') {
          window.renderStyleFeedV71();
        } else if (typeof window.renderStyleFeed === 'function') {
          window.renderStyleFeed();
        }
      } catch(e) {
        console.warn('[v77] Feed refresh error:', e.message);
      }
    }, 80);
  }


  /* ══════════════════════════════════════════════════════════
   * § 4  FIX FAB VISIBILITY via AfribRouter
   *      v76 replaced showScreen with AfribRouter.go, bypassing
   *      v72's showScreen wrapper that toggled FAB visibility.
   *      Solution: register a proper AfribRouter handler for FAB.
   * ══════════════════════════════════════════════════════════ */
  function installFABHandler() {
    // Use AfribRouter if available (v76+)
    if (window.AfribRouter && typeof window.AfribRouter.on === 'function') {
      window.AfribRouter.on('*', function(screenName) {
        const fab = document.getElementById('yourstyleFAB');
        if (fab) fab.style.display = (screenName === 'style') ? 'flex' : 'none';
        // Also update body data attribute for CSS selector approach
        document.body.setAttribute('data-screen', screenName);
      });
      console.info('[AfribConnect v77] ✅ FAB handler registered on AfribRouter');
      return;
    }

    // Fallback: wrap showScreen directly
    const origShow = window.showScreen;
    if (origShow && !origShow._v77fab) {
      window.showScreen = function(id) {
        const result = origShow.apply(this, arguments);
        const fab = document.getElementById('yourstyleFAB');
        if (fab) fab.style.display = (id === 'style') ? 'flex' : 'none';
        document.body.setAttribute('data-screen', id);
        return result;
      };
      window.showScreen._v77fab = true;
      console.info('[AfribConnect v77] ✅ FAB handler wrapped on showScreen');
    }
  }


  /* ══════════════════════════════════════════════════════════
   * § 5  FIX openCreatePost — reset state + fix modal padding
   *      Ensures video/image state cleared before opening modal
   *      so stale media from previous sessions never leaks in.
   * ══════════════════════════════════════════════════════════ */
  function installSafeOpenCreatePost() {
    const orig = window.openCreatePost;
    if (!orig || orig._v77) return;

    window.openCreatePost = function safeOpenCreatePostV77() {
      if (!window.currentUser) {
        if (typeof showAuth === 'function') showAuth('login');
        return;
      }

      // Clear stale media state before opening
      _v77ClearMediaState();

      // Call original (which opens the modal + wires poll from social_upgrade)
      try { orig.apply(this, arguments); } catch(e) {
        // Fallback: open modal directly
        const modal = document.getElementById('createPostModal');
        if (modal) modal.classList.add('open');
      }

      // Ensure modal has correct padding (in case CSS injection was blocked)
      setTimeout(function() {
        const card = document.querySelector('#createPostModal .modal-card');
        if (card && !card.style.padding) {
          card.style.padding = '20px';
        }
        // Wire caption counter if not wired
        const cap = document.getElementById('postCaption');
        const cnt = document.getElementById('postCaptionCount');
        if (cap && cnt && !cap._v77wired) {
          cap.oninput = function() { cnt.textContent = cap.value.length + ' / 280'; };
          cap._v77wired = true;
        }
      }, 50);
    };
    window.openCreatePost._v77 = true;
  }


  /* ══════════════════════════════════════════════════════════
   * § 6  FIX renderStyleFeed CALL in v9_improvements
   *      v9's submitPost calls renderStyleFeed() not renderStyleFeedV71().
   *      Since we replaced submitPost entirely in § 2, this is already
   *      fixed. But renderStyleFeed itself needs to call V71 when available
   *      for the algorithm. Patch renderStyleFeed to delegate upward.
   * ══════════════════════════════════════════════════════════ */
  function upgradeRenderStyleFeed() {
    // Already using V71 via our _v77RefreshFeed — but also patch the base
    // renderStyleFeed so any legacy callers get the algorithm too
    const origRSF = window.renderStyleFeed;
    if (!origRSF || origRSF._v77upgraded) return;

    window.renderStyleFeed = function renderStyleFeedV77() {
      // If V71 renderer exists and we're not already inside V71, use it
      if (typeof window.renderStyleFeedV71 === 'function' && !renderStyleFeedV77._running) {
        renderStyleFeedV77._running = true;
        try { window.renderStyleFeedV71(); } catch(e) {
          try { origRSF.apply(this, arguments); } catch(e2) {}
        } finally { renderStyleFeedV77._running = false; }
        return;
      }
      try { origRSF.apply(this, arguments); } catch(e) {}
    };
    window.renderStyleFeed._v77upgraded = true;
    console.info('[AfribConnect v77] ✅ renderStyleFeed upgraded to use V71 algorithm');
  }


  /* ══════════════════════════════════════════════════════════
   * § 7  FIX "For You" TAB ACTIVE STATE
   *      v73 sets innerHTML = '✨ YourStyle'
   *      v74 sets innerHTML = '✨ YourStyle'
   *      v76 fixes label back to '🔥 For You' via AfribRouter.on('style')
   *      But the ACTIVE styling is lost because the button inline styles
   *      get reset on every switchStyleTab call.
   *      Fix: after every style screen navigation, ensure the active tab
   *      has correct styling and correct label.
   * ══════════════════════════════════════════════════════════ */
  function fixStyleTabState() {
    const allTab = document.getElementById('styleTab-all');
    if (!allTab) return;

    // Correct label
    if (allTab.textContent.trim() !== '🔥 For You') {
      allTab.innerHTML = '🔥 For You';
    }

    // If _styleTab is 'all' (For You) ensure it looks active
    if ((window._styleTab || 'all') === 'all') {
      document.querySelectorAll('[id^="styleTab-"]').forEach(function(b) {
        b.style.background = 'none';
        b.style.color = 'var(--w60)';
        b.style.border = 'none';
      });
      allTab.style.background = 'var(--gold, #D4AF37)';
      allTab.style.color = '#000';
      allTab.style.border = 'none';
    }
  }

  function registerStyleScreenHandler() {
    if (window.AfribRouter && typeof window.AfribRouter.on === 'function') {
      window.AfribRouter.on('style', function() {
        setTimeout(fixStyleTabState, 60);
        setTimeout(fixStyleTabState, 500);
        setTimeout(_v77RefreshFeed, 150);
      });
    }
  }

  /* ══════════════════════════════════════════════════════════
   * § 7b  FIX switchStyleTabV71 — pill-style tabs
   *       v71 introduced underline-style active tabs which conflicts
   *       with the HTML pill design (background:gold, color:#000).
   *       Patch to use consistent pill approach across all tabs.
   * ══════════════════════════════════════════════════════════ */
  function fixSwitchStyleTabStyling() {
    const origV71 = window.switchStyleTabV71;
    if (!origV71 || origV71._v77styled) return;

    window.switchStyleTabV71 = function v77SwitchStyleTab(tab, btn) {
      // Call original for feed logic (_styleTab, renderStyleFeedV71, dot indicators)
      try { origV71.apply(this, arguments); } catch(e) {}

      // Override visual styling to match the original HTML pill approach
      const tabIds = ['all', 'following', 'trending', 'mine', 'everyone'];
      tabIds.forEach(function(t) {
        const el = document.getElementById('styleTab-' + t);
        if (!el) return;
        el.style.background = 'none';
        el.style.color = 'var(--w60)';
        el.style.border = 'none';
        el.style.borderBottom = '';
        el.style.borderBottomColor = '';
        el.style.fontWeight = '700';
      });

      // Active tab gets gold pill
      const mappedId = tab === 'everyone' ? 'trending' : tab;
      const activeEl = document.getElementById('styleTab-' + mappedId);
      if (activeEl) {
        activeEl.style.background = 'var(--gold, #D4AF37)';
        activeEl.style.color = '#000';
        activeEl.style.border = 'none';
        activeEl.style.fontWeight = '800';
      }

      // Keep "For You" label correct after tab switch
      const allTab = document.getElementById('styleTab-all');
      if (allTab && allTab.textContent.trim() !== '🔥 For You') {
        allTab.innerHTML = '🔥 For You';
      }
    };
    window.switchStyleTabV71._v77styled = true;
    console.info('[AfribConnect v77] ✅ switchStyleTabV71 pill-style fix applied');
  }


  /* ══════════════════════════════════════════════════════════
   * § 8  FIX v72 localStorage.setItem MONKEY-PATCH
   *      The existing v72 submitPost is now bypassed by our v77 wrapper.
   *      But if for any reason the old chain runs, the localStorage
   *      monkey-patch has no try/finally. Add a global safety net.
   * ══════════════════════════════════════════════════════════ */
  function guardLocalStorageMonkeyPatch() {
    // If localStorage.setItem has been replaced (by v72) and is not the native one,
    // this sentinel MutationObserver is already irrelevant because we bypass v72 submitPost.
    // However, keep a watchdog: if localStorage.setItem is ever replaced, restore it after 2s.
    const nativeSetItem = localStorage.setItem.bind(localStorage);
    const _origDescriptor = Object.getOwnPropertyDescriptor(Storage.prototype, 'setItem');

    // Store the native reference so we can restore it
    window._v77_nativeLocalStorageSetItem = nativeSetItem;

    // Watchdog: every 2 seconds, if localStorage.setItem has been monkey-patched, restore it
    setInterval(function() {
      try {
        if (localStorage.setItem !== Storage.prototype.setItem) {
          // v72 temporarily replaces it — give it 100ms to restore before we intervene
          setTimeout(function() {
            if (localStorage.setItem !== Storage.prototype.setItem) {
              localStorage.setItem = Storage.prototype.setItem.bind(localStorage);
              console.warn('[v77] localStorage.setItem was stuck monkey-patched — restored');
            }
          }, 100);
        }
      } catch(e) {}
    }, 2000);
  }


  /* ══════════════════════════════════════════════════════════
   * § 9  FIX FEED EMPTY STATE on cold navigation
   *      When user first taps YourStyle tab, the AfribRouter fires
   *      renderStyleFeedV71 at 150ms. But if there are posts,
   *      the #styleFeedEmpty element may still be visible from
   *      a previous render. Ensure correct state on open.
   * ══════════════════════════════════════════════════════════ */
  function fixFeedEmptyState() {
    const emptyEl = document.getElementById('styleFeedEmpty');
    const feedEl  = document.getElementById('styleFeed');
    if (!emptyEl || !feedEl) return;

    const hasPosts = feedEl.children.length > 0;
    emptyEl.style.display = hasPosts ? 'none' : 'block';
  }


  /* ══════════════════════════════════════════════════════════
   * § 10  WIRE + PATCH postImageInput onchange
   *       The HTML has: onchange="handlePostImageUpload(this)"
   *       v9 renames the input to postMediaInput and sets its own onchange.
   *       But the original HTML has id="postImageInput" — if v9 patch hasn't
   *       run yet (race condition), clicking the preview calls the old function.
   *       Fix: ensure both IDs trigger the right handler.
   * ══════════════════════════════════════════════════════════ */
  function wirePostImageInput() {
    // Ensure postImageInput exists and its onchange is routed correctly
    const oldInput = document.getElementById('postImageInput');
    if (oldInput && !oldInput._v77wired) {
      oldInput.onchange = function(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        // Try v9 handler first (supports video+image)
        if (typeof handlePostMediaFile === 'function') {
          handlePostMediaFile(file);
        } else if (typeof handlePostImageUpload === 'function') {
          handlePostImageUpload(oldInput);
        } else {
          // Fallback: read as image
          if (file.size > 5 * 1024 * 1024) { if(typeof showToast==='function') showToast('⚠️ Image must be under 5MB'); return; }
          const reader = new FileReader();
          reader.onload = function(ev) {
            window._postImageData = ev.target.result;
            const prev = document.getElementById('postImagePreview');
            if (prev) prev.innerHTML = `<img src="${window._postImageData}" style="width:100%;height:100%;object-fit:cover;border-radius:10px"/>`;
          };
          reader.readAsDataURL(file);
        }
      };
      oldInput._v77wired = true;
    }

    // Also ensure postMediaInput (added by v9) is wired
    const mediaInput = document.getElementById('postMediaInput');
    if (mediaInput && !mediaInput._v77wired) {
      mediaInput.onchange = function(e) {
        const file = e.target.files?.[0];
        if (file && typeof handlePostMediaFile === 'function') handlePostMediaFile(file);
      };
      mediaInput._v77wired = true;
    }
  }


  /* ══════════════════════════════════════════════════════════
   * § 11  INIT
   * ══════════════════════════════════════════════════════════ */
  function init() {
    // Install all patches
    installSafeSubmitPost();
    installSafeOpenCreatePost();
    upgradeRenderStyleFeed();
    installFABHandler();
    registerStyleScreenHandler();
    fixSwitchStyleTabStyling();
    guardLocalStorageMonkeyPatch();
    wirePostImageInput();

    // Fix feed state on first load
    fixFeedEmptyState();

    // If already on style screen, render feed now
    const activeScreen = document.querySelector('.screen.active');
    if (activeScreen && activeScreen.id === 'screen-style') {
      setTimeout(function() {
        fixStyleTabState();
        _v77RefreshFeed();
      }, 200);
    }

    // Re-run input wiring when createPostModal opens (handles dynamic DOM injection)
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(m) {
        m.addedNodes.forEach(function(node) {
          if (!node.classList) return;
          if (node.id === 'createPostModal' || (node.querySelector && node.querySelector('#submitPostBtn'))) {
            setTimeout(wirePostImageInput, 100);
          }
        });
        // Also watch for createPostModal getting .open class
        if (m.type === 'attributes' && m.target.id === 'createPostModal') {
          setTimeout(wirePostImageInput, 100);
        }
      });
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });

    // Re-run after login
    document.addEventListener('afrib:login', function() {
      setTimeout(function() {
        installSafeSubmitPost();
        installSafeOpenCreatePost();
        upgradeRenderStyleFeed();
        installFABHandler();
        wirePostImageInput();
        fixFeedEmptyState();
      }, 800);
    });

    console.info('%c✅ AfribConnect v77 YourStyle Fix loaded', 'color:#D4AF37;font-weight:bold');
  }

  // Run after all deferred scripts have loaded
  if (document.readyState !== 'loading') {
    // Use a longer delay so v75 (last in chain) has fully wrapped submitPost
    setTimeout(init, 500);
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(init, 500);
    });
  }

})();
