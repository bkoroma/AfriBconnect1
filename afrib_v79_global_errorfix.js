/*!
 * AfribConnect v78 — Marketplace Complete Fix
 *
 * ROOT CAUSES FIXED:
 *  1. Products grid empty on navigation
 *     → AfribRouter (v76) has no 'market' handler — renderProducts() never
 *       called when user taps Market tab after initial load
 *  2. Sellers tab shows empty even with stores
 *     → renderSellerDirectory() only fires from switchMarketTab, not on screen enter
 *  3. My Listings panel shows empty
 *     → renderMyListings() only fires from switchMarketTab, not on screen enter
 *  4. "Buy Now" always fails for user listings
 *     → buyNow() uses PRODUCTS.find() — PRODUCTS=[] is empty by design
 *       but buyNow was never patched to use getAllListings() like addToCart was
 *  5. addListingModal and createStoreModal missing padding
 *     → No inner padding wrapper — with v48's 32px border-radius, content
 *       clips at the corners (same pattern as createPostModal in v77)
 *  6. filterByCategory selector too broad
 *     → '.filter-chips .chip' matches chips in BOTH Market and YourStyle screens
 *  7. Seller directory not refreshed after store created/edited
 *     → createSellerStore() only calls renderMyListings(), not renderSellerDirectory()
 */
(function AfribV78() {
  'use strict';

  if (window.__afrib_v78) return;
  window.__afrib_v78 = true;

  /* ══════════════════════════════════════════════════════════
   * § 1  MARKET CSS FIXES
   *      - Padding for addListingModal + createStoreModal
   *      - products-grid responsive tweaks
   *      - Seller card hover polish
   * ══════════════════════════════════════════════════════════ */
  (function injectMarketCSS() {
    const style = document.createElement('style');
    style.id = 'v78-market-fix';
    style.textContent = `
      /* ── Modal padding fixes ── */
      #addListingModal .modal-card,
      #createStoreModal .modal-card {
        padding: 20px !important;
      }

      /* ── sellerDashModal header already has padding:20px inline ── */
      #sellerDashModal .modal-card {
        padding: 0 !important;
      }

      /* ── Products grid responsive ── */
      #productsGrid {
        display: grid !important;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)) !important;
        gap: 12px !important;
      }
      @media (min-width: 480px) {
        #productsGrid {
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)) !important;
          gap: 16px !important;
        }
      }

      /* ── Market tab active state ── */
      #mkt-tab-browse.v78-active,
      #mkt-tab-sellers.v78-active,
      #mkt-tab-mystore.v78-active {
        background: var(--gold, #D4AF37) !important;
        color: #000 !important;
      }

      /* ── Seller store cards ── */
      #sellersGrid > div {
        transition: transform .15s ease, border-color .15s ease !important;
      }
      #sellersGrid > div:hover {
        transform: translateY(-2px) !important;
        border-color: var(--border-gold, rgba(212,175,55,.3)) !important;
      }

      /* ── Product card min-height for consistent grid ── */
      .product-card {
        display: flex !important;
        flex-direction: column !important;
      }

      /* ── saveListingBtn always clickable ── */
      #saveListingBtn {
        cursor: pointer !important;
      }

      /* ── Market screen empty state ── */
      #productsGrid:empty::after {
        content: '';
        display: none;
      }
    `;
    document.head.appendChild(style);
  })();


  /* ══════════════════════════════════════════════════════════
   * § 2  AFRIB ROUTER MARKET HANDLER
   *      Register AfribRouter.on('market') to initialize the
   *      market screen correctly every time it's navigated to.
   *      Also wraps showScreen as a fallback if AfribRouter
   *      is not available.
   * ══════════════════════════════════════════════════════════ */
  function registerMarketRouterHandler() {
    function onMarketScreenOpen() {
      // Re-inject sort/filter UI if not already done
      _v78EnsureMarketUI();

      // Get currently active tab and render the right panel
      const activeTab = _v78GetActiveMarketTab();
      if (activeTab === 'sellers') {
        setTimeout(function() {
          try { if (typeof renderSellerDirectory === 'function') renderSellerDirectory(); } catch(e) {}
        }, 80);
      } else if (activeTab === 'mystore') {
        setTimeout(function() {
          try { if (typeof renderMyListings === 'function') renderMyListings(); } catch(e) {}
        }, 80);
      } else {
        // Default: browse tab
        setTimeout(function() {
          try { if (typeof renderProducts === 'function') renderProducts(); } catch(e) {}
        }, 80);
      }

      // Always update cart badge
      setTimeout(function() {
        try { if (typeof updateCartBadge === 'function') updateCartBadge(); } catch(e) {}
      }, 120);
    }

    // AfribRouter approach (v76+)
    if (window.AfribRouter && typeof window.AfribRouter.on === 'function') {
      window.AfribRouter.on('market', onMarketScreenOpen);
      console.info('[AfribConnect v78] ✅ Market handler registered on AfribRouter');
      return;
    }

    // Fallback: wrap showScreen
    const origShow = window.showScreen;
    if (origShow && !origShow._v78market) {
      window.showScreen = function(id) {
        const result = origShow.apply(this, arguments);
        if (id === 'market') onMarketScreenOpen();
        return result;
      };
      window.showScreen._v78market = true;
      console.info('[AfribConnect v78] ✅ Market handler wrapped on showScreen');
    }
  }

  /* Get which market tab is currently visible */
  function _v78GetActiveMarketTab() {
    const panels = { browse: 'mkt-browse-panel', sellers: 'mkt-sellers-panel', mystore: 'mkt-mystore-panel' };
    for (const [tab, id] of Object.entries(panels)) {
      const el = document.getElementById(id);
      if (el && el.style.display !== 'none' && el.style.display !== '') return tab;
    }
    return 'browse'; // default
  }

  /* Ensure the sort/filter market UI has been injected (mirrors afrib_market_upgrade's tryInject) */
  function _v78EnsureMarketUI() {
    const browsePanel = document.getElementById('mkt-browse-panel');
    if (!browsePanel || browsePanel.dataset.mktUpgraded) return;
    // If market upgrade's tryInject hasn't run yet, trigger it
    if (typeof renderProducts === 'function') {
      try { renderProducts(); } catch(e) {}
    }
  }


  /* ══════════════════════════════════════════════════════════
   * § 3  FIX switchMarketTab
   *      Ensure tab styling uses gold-pill approach consistently
   *      and that each tab renders its content on switch.
   * ══════════════════════════════════════════════════════════ */
  function installSafeSwitchMarketTab() {
    const orig = window.switchMarketTab;
    if (!orig || orig._v78) return;

    window.switchMarketTab = function safeSwitch(tab) {
      // Call original (handles panel show/hide + renderSellerDirectory/renderMyListings)
      try { orig.apply(this, arguments); } catch(e) {
        // Fallback: manual panel switching
        ['browse', 'sellers', 'mystore'].forEach(function(t) {
          const panel = document.getElementById('mkt-' + t + '-panel');
          if (panel) panel.style.display = (t === tab) ? 'block' : 'none';
        });
      }

      // Enforce correct tab pill styling
      ['browse', 'sellers', 'mystore'].forEach(function(t) {
        const btn = document.getElementById('mkt-tab-' + t);
        if (!btn) return;
        const active = t === tab;
        btn.style.background = active ? 'var(--gold, #D4AF37)' : 'none';
        btn.style.color      = active ? '#000'                  : 'var(--w60)';
        btn.style.fontWeight = active ? '800'                   : '700';
        btn.classList.toggle('v78-active', active);
      });

      // Trigger renders for tabs that depend on login state
      if (tab === 'mystore') {
        setTimeout(function() {
          try { if (typeof renderMyListings === 'function') renderMyListings(); } catch(e) {}
        }, 50);
      }
      if (tab === 'sellers') {
        setTimeout(function() {
          try { if (typeof renderSellerDirectory === 'function') renderSellerDirectory(); } catch(e) {}
        }, 50);
      }
      if (tab === 'browse') {
        setTimeout(function() {
          try { if (typeof renderProducts === 'function') renderProducts(); } catch(e) {}
        }, 50);
      }
    };
    window.switchMarketTab._v78 = true;
    console.info('[AfribConnect v78] ✅ switchMarketTab patched');
  }


  /* ══════════════════════════════════════════════════════════
   * § 4  FIX filterByCategory — scope to market screen only
   *      Original uses '.filter-chips .chip' which matches chips
   *      in BOTH Market and YourStyle screens simultaneously.
   * ══════════════════════════════════════════════════════════ */
  function fixFilterByCategory() {
    const orig = window.filterByCategory;
    if (!orig || orig._v78) return;

    window.filterByCategory = function safeFilterByCategory(btn, cat) {
      // Only deactivate chips inside the market browse panel, not style chips
      const marketChipsContainer = document.querySelector('#mkt-browse-panel .filter-chips');
      if (marketChipsContainer) {
        marketChipsContainer.querySelectorAll('.chip').forEach(function(c) {
          c.classList.remove('active');
        });
        if (btn && marketChipsContainer.contains(btn)) {
          btn.classList.add('active');
        } else if (btn) {
          btn.classList.add('active');
        }
      } else {
        // Fallback to original behavior
        document.querySelectorAll('#screen-market .filter-chips .chip').forEach(function(c) {
          c.classList.remove('active');
        });
        if (btn) btn.classList.add('active');
      }

      window.activeCategory = cat;
      try { if (typeof renderProducts === 'function') renderProducts(); } catch(e) {}
    };
    window.filterByCategory._v78 = true;
    console.info('[AfribConnect v78] ✅ filterByCategory scoped to market');
  }


  /* ══════════════════════════════════════════════════════════
   * § 5  FIX buyNow — use getAllListings() instead of PRODUCTS[]
   *      PRODUCTS = [] is empty by design (all products are user listings).
   *      buyNow() was never patched like addToCart was.
   * ══════════════════════════════════════════════════════════ */
  function fixBuyNow() {
    const orig = window.buyNow;
    if (!orig || orig._v78) return;

    window.buyNow = function safeBuyNow() {
      if (!window.currentUser) {
        if (typeof showAuth === 'function') showAuth('login');
        if (typeof closeModal === 'function') closeModal('productModal');
        return;
      }

      // Use getAllListings() to find the product (not empty PRODUCTS[])
      const allProducts = (typeof getAllListings === 'function')
        ? getAllListings()
        : [];
      const p = allProducts.find(function(x) {
        return x.id === window.currentProductId || x.id === String(window.currentProductId);
      });

      if (!p) {
        if (typeof showToast === 'function') showToast('⚠️ Product not found');
        return;
      }

      // Use v9's enhanced checkout if available (handles commission + tax)
      if (typeof window.openCheckoutModal === 'function') {
        // v9 checkout: add to cart first then open checkout
        const existing = (window.cartItems || []).find(function(i) { return i.product.id === p.id; });
        if (!existing) {
          if (!window.cartItems) window.cartItems = [];
          window.cartItems.push({ product: p, qty: 1 });
          window.cartCount = (window.cartItems || []).reduce(function(s, i) { return s + i.qty; }, 0);
        }
        try { closeModal('productModal'); } catch(e) {}
        setTimeout(function() {
          try { window.openCheckoutModal(); } catch(e) {
            // Fall through to simple checkout
            _v78SimpleCheckout(p);
          }
        }, 150);
        return;
      }

      // Simple checkout fallback
      _v78SimpleCheckout(p);
    };
    window.buyNow._v78 = true;
    console.info('[AfribConnect v78] ✅ buyNow patched to use getAllListings()');
  }

  function _v78SimpleCheckout(p) {
    const priceNum = parseFloat(String(p.price || p.priceUSD || 0).replace(/[^0-9.]/g, '')) || 0;
    const balance  = window.walletBalance || window.currentUser?.walletBalance || 0;

    if (priceNum > balance) {
      if (typeof showToast === 'function') showToast('⚠️ Insufficient wallet balance — top up first');
      if (typeof closeModal === 'function') closeModal('productModal');
      setTimeout(function() {
        if (typeof showScreen === 'function') showScreen('wallet');
        setTimeout(function() {
          if (typeof openTopUp === 'function') openTopUp();
        }, 200);
      }, 400);
      return;
    }

    if (!confirm('Buy ' + (p.name || 'this item') + ' for ' + (p.price || '$' + priceNum.toFixed(2)) + '?\n\nPay from wallet balance?')) return;

    // Deduct balance
    window.walletBalance = (window.walletBalance || 0) - priceNum;
    if (window.currentUser) window.currentUser.walletBalance = window.walletBalance;
    try { if (typeof persistWallet === 'function') persistWallet(); } catch(e) {}
    try { if (typeof updateBalanceDisplay === 'function') updateBalanceDisplay(); } catch(e) {}

    // Record transaction
    try {
      if (typeof addWalletTransaction === 'function') {
        addWalletTransaction({
          type: 'out', amount: priceNum, currency: 'USD',
          method: 'Marketplace', recipient: p.seller || 'Seller',
          note: p.name, status: 'completed'
        });
      }
    } catch(e) {}

    // Update sales count
    try {
      if (p.isUserListing && p.sellerEmail && typeof getUserListings === 'function') {
        const listings = getUserListings(p.sellerEmail);
        const idx = listings.findIndex(function(l) { return l.id === p.id; });
        if (idx > -1) {
          listings[idx].salesCount = (listings[idx].salesCount || 0) + 1;
          if (typeof saveUserListings === 'function') saveUserListings(p.sellerEmail, listings);
        }
      }
    } catch(e) {}

    if (typeof closeModal === 'function') closeModal('productModal');
    if (typeof showToast === 'function') showToast('🎉 Purchase complete! ' + (p.name || 'Item') + ' is on its way.');
    try { if (typeof appendAdminLog === 'function') appendAdminLog('wallet', window.currentUser.first + ' ' + window.currentUser.last, 'Marketplace purchase: ' + p.name, '$' + priceNum.toFixed(2)); } catch(e) {}
  }


  /* ══════════════════════════════════════════════════════════
   * § 6  FIX createSellerStore — refresh seller directory after save
   *      createSellerStore() only calls renderMyListings() but not
   *      renderSellerDirectory(), so the Sellers tab stays stale.
   * ══════════════════════════════════════════════════════════ */
  function fixCreateSellerStore() {
    const orig = window.createSellerStore;
    if (!orig || orig._v78) return;

    window.createSellerStore = function safeCreateSellerStore() {
      // Call original (saves store, shows toast, opens addListing)
      try { orig.apply(this, arguments); } catch(e) {
        console.error('[v78] createSellerStore error:', e);
        return;
      }

      // Refresh seller directory so new store appears immediately
      setTimeout(function() {
        try { if (typeof renderSellerDirectory === 'function') renderSellerDirectory(); } catch(e) {}
        try { if (typeof renderProducts === 'function') renderProducts(); } catch(e) {} // show seller's products in browse
      }, 400);
    };
    window.createSellerStore._v78 = true;
    console.info('[AfribConnect v78] ✅ createSellerStore patched to refresh seller directory');
  }


  /* ══════════════════════════════════════════════════════════
   * § 7  FIX saveListingProduct — also refresh seller directory
   *      When a product is published, the sellers tab listing count
   *      should update and the browse grid should show the new product.
   *      script.js already calls renderProducts + renderMyListings,
   *      but NOT renderSellerDirectory.
   * ══════════════════════════════════════════════════════════ */
  function fixSaveListingProduct() {
    const orig = window.saveListingProduct;
    if (!orig || orig._v78) return;

    window.saveListingProduct = function safeSaveListingProduct() {
      // Call original (validates, saves, calls renderProducts + renderMyListings)
      try { orig.apply(this, arguments); } catch(e) {
        console.error('[v78] saveListingProduct error:', e);
        return;
      }

      // Also refresh seller directory (listing count changes)
      setTimeout(function() {
        try { if (typeof renderSellerDirectory === 'function') renderSellerDirectory(); } catch(e) {}
      }, 300);
    };
    window.saveListingProduct._v78 = true;
    console.info('[AfribConnect v78] ✅ saveListingProduct patched to refresh seller directory');
  }


  /* ══════════════════════════════════════════════════════════
   * § 8  FIX openSellerDashboard — ensure market screen is active
   *      If called from home/other screens, the market screen may
   *      not be visible, making the dashboard modal feel orphaned.
   *      Also ensure user is prompted to create store if none exists.
   * ══════════════════════════════════════════════════════════ */
  function fixOpenSellerDashboard() {
    const orig = window.openSellerDashboard;
    if (!orig || orig._v78) return;

    window.openSellerDashboard = function safeOpenSellerDashboard() {
      if (!window.currentUser) {
        if (typeof showAuth === 'function') showAuth('login');
        return;
      }

      // If not on market screen, navigate there first
      const activeScreen = document.querySelector('.screen.active');
      if (!activeScreen || activeScreen.id !== 'screen-market') {
        if (typeof showScreen === 'function') showScreen('market');
        setTimeout(function() {
          try { orig.apply(this, arguments); } catch(e) {}
        }, 300);
        return;
      }

      try { orig.apply(this, arguments); } catch(e) {
        console.error('[v78] openSellerDashboard error:', e);
      }
    };
    window.openSellerDashboard._v78 = true;
  }


  /* ══════════════════════════════════════════════════════════
   * § 9  FIX openAddListing — ensure padding + desc counter
   *      addListingModal's modal-card has no padding — CSS fix in §1
   *      handles that, but also ensure the desc character counter
   *      is always wired and the form is fully reset on open.
   * ══════════════════════════════════════════════════════════ */
  function fixOpenAddListing() {
    const orig = window.openAddListing;
    if (!orig || orig._v78) return;

    window.openAddListing = function safeOpenAddListing(listingId) {
      if (!window.currentUser) {
        if (typeof showAuth === 'function') showAuth('login');
        return;
      }

      const store = (typeof getCurrentUserStore === 'function') ? getCurrentUserStore() : null;
      if (!store) {
        if (typeof openCreateStoreModal === 'function') openCreateStoreModal();
        return;
      }

      try { orig.apply(this, arguments); } catch(e) {
        console.error('[v78] openAddListing error:', e);
        // Fallback: open the modal directly
        const modal = document.getElementById('addListingModal');
        if (modal) modal.classList.add('open');
      }

      // Ensure modal card has padding (in case CSS injection was blocked)
      setTimeout(function() {
        const card = document.querySelector('#addListingModal .modal-card');
        if (card && !card.style.padding) card.style.padding = '20px';

        // Wire desc counter
        const descEl  = document.getElementById('listingDesc');
        const countEl = document.getElementById('listingDescCount');
        if (descEl && countEl && !descEl._v78wired) {
          descEl.addEventListener('input', function() {
            countEl.textContent = descEl.value.length + '/500';
          });
          descEl._v78wired = true;
          countEl.textContent = descEl.value.length + '/500';
        }

        // Wire title field for enter-key nav
        const titleEl = document.getElementById('listingTitle');
        if (titleEl && !titleEl._v78wired) {
          titleEl.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
              e.preventDefault();
              document.getElementById('listingPrice')?.focus();
            }
          });
          titleEl._v78wired = true;
        }
      }, 80);
    };
    window.openAddListing._v78 = true;
  }


  /* ══════════════════════════════════════════════════════════
   * § 10  FIX openCreateStoreModal — ensure padding
   * ══════════════════════════════════════════════════════════ */
  function fixOpenCreateStoreModal() {
    const orig = window.openCreateStoreModal;
    if (!orig || orig._v78) return;

    window.openCreateStoreModal = function safeOpenCreateStoreModal(isEdit) {
      try { orig.apply(this, arguments); } catch(e) {
        console.error('[v78] openCreateStoreModal error:', e);
        const modal = document.getElementById('createStoreModal');
        if (modal) modal.classList.add('open');
      }

      setTimeout(function() {
        const card = document.querySelector('#createStoreModal .modal-card');
        if (card && !card.style.padding) card.style.padding = '20px';
      }, 50);
    };
    window.openCreateStoreModal._v78 = true;
  }


  /* ══════════════════════════════════════════════════════════
   * § 11  ENSURE PRODUCTS RENDER ON LOGIN
   *       When user logs in while on market screen, or navigates
   *       to market after login, products must render.
   * ══════════════════════════════════════════════════════════ */
  function wireLoginRefresh() {
    document.addEventListener('afrib:login', function() {
      setTimeout(function() {
        const activeScreen = document.querySelector('.screen.active');
        if (activeScreen && activeScreen.id === 'screen-market') {
          try { if (typeof renderProducts === 'function') renderProducts(); } catch(e) {}
          try { if (typeof renderMyListings === 'function') {
            const myPanel = document.getElementById('mkt-mystore-panel');
            if (myPanel && myPanel.style.display !== 'none') renderMyListings();
          }} catch(e) {}
        }
      }, 600);
    });
  }


  /* ══════════════════════════════════════════════════════════
   * § 12  INITIAL RENDER
   *       On cold load, ensure products grid is populated.
   *       afrib_market_upgrade.js does this via tryInject() on load,
   *       but add a safety net in case it ran before the DOM was ready.
   * ══════════════════════════════════════════════════════════ */
  function ensureInitialRender() {
    // Check if products grid is empty
    const grid = document.getElementById('productsGrid');
    if (grid && grid.children.length === 0) {
      try { if (typeof renderProducts === 'function') renderProducts(); } catch(e) {}
    }

    // If market screen is active, also fix tab styling
    const activeScreen = document.querySelector('.screen.active');
    if (activeScreen && activeScreen.id === 'screen-market') {
      _v78FixMarketTabStyling('browse');
    }
  }

  function _v78FixMarketTabStyling(activeTab) {
    ['browse', 'sellers', 'mystore'].forEach(function(t) {
      const btn = document.getElementById('mkt-tab-' + t);
      if (!btn) return;
      const active = t === activeTab;
      btn.style.background = active ? 'var(--gold, #D4AF37)' : 'none';
      btn.style.color      = active ? '#000'                  : 'var(--w60)';
    });
  }


  /* ══════════════════════════════════════════════════════════
   * § 13  INIT
   * ══════════════════════════════════════════════════════════ */
  function init() {
    registerMarketRouterHandler();
    installSafeSwitchMarketTab();
    fixFilterByCategory();
    fixBuyNow();
    fixCreateSellerStore();
    fixSaveListingProduct();
    fixOpenSellerDashboard();
    fixOpenAddListing();
    fixOpenCreateStoreModal();
    wireLoginRefresh();

    // Initial render safety net (runs after all deferred scripts)
    setTimeout(ensureInitialRender, 200);

    // Re-register AfribRouter handler after login (AfribRouter may be re-inited)
    document.addEventListener('afrib:login', function() {
      setTimeout(function() {
        registerMarketRouterHandler();
        fixBuyNow();
        fixFilterByCategory();
      }, 500);
    });

    console.info('%c✅ AfribConnect v78 Market Fix loaded', 'color:#D4AF37;font-weight:bold');
  }

  // Run after all deferred scripts (500ms ensures v76 AfribRouter is available)
  if (document.readyState !== 'loading') {
    setTimeout(init, 600);
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(init, 600);
    });
  }

})();
