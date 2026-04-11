/* ═══════════════════════════════════════════════════════════════════════
   AfribConnect — Marketplace Configuration & Commerce Settings
   afrib_market_config.js

   WHAT THIS FILE DOES:
   ─────────────────────────────────────────────────────────────────────
   1.  FREE SHIPPING THRESHOLD  — admin/SA configurable $ amount
   2.  SHIPPING FEE             — flat fee when below threshold
   3.  PLATFORM COMMISSION      — % taken from each sale (seller-side)
   4.  BUYER PROTECTION FEE     — % added to buyer total (like Vinted 3.6%)
   5.  TAX RATE                 — % applied at checkout (VAT/Sales Tax)
   6.  PROCESSING FEE           — flat + % (like eBay $0.30 + 2.9%)
   7.  CONTACT SELLER           — button on product modal to contact seller
   8.  SELLER INFO REQUIRED     — phone/WhatsApp/email enforced on store setup
   9.  ADMIN PANEL SECTION      — hidden in admin.html under "Marketplace"
  10.  SUPERADMIN PANEL SECTION — full fee schedule config in SA panel
  11.  CHECKOUT BREAKDOWN       — live fee breakdown shown to buyer

   RESEARCH BASIS (2025):
   • eBay: 12.9–15% commission + $0.30/transaction
   • Facebook Marketplace: 10% on shipped orders ($0.80 min)
   • Mercari 2025/2026: 10% seller + 3.6% buyer protection
   • Amazon: 8–15% referral fee by category
   • Vinted: 0% seller, buyer pays 3–5% protection
   • VAT (EU standard): 20% / Reduced 5–10% / Zero-rated
   • US Sales Tax: 0–10.25% depending on state/city
   ═══════════════════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────────────────────────────
   CONSTANTS & STORAGE KEY
───────────────────────────────────────────────────────────────────── */
const MKT_CFG_KEY = 'sa_settings'; // piggyback on existing SA settings

/** Read marketplace config from sa_settings */
function _mktCfg() {
  try {
    const s = JSON.parse(localStorage.getItem(MKT_CFG_KEY) || '{}');
    return {
      freeShippingThreshold: parseFloat(s.freeShippingThreshold ?? 25),
      flatShippingFee:       parseFloat(s.flatShippingFee       ?? 3.99),
      commissionRate:        parseFloat(s.commissionRate        ?? 10),
      buyerProtectionFee:    parseFloat(s.buyerProtectionFee    ?? 0),
      taxRate:               parseFloat(s.taxRate               ?? 0),
      taxLabel:              s.taxLabel                         || 'Tax',
      processingFeeFlat:     parseFloat(s.processingFeeFlat     ?? 0),
      processingFeePct:      parseFloat(s.processingFeePct      ?? 0),
      shippingTaxable:       !!s.shippingTaxable,
      marketEnabled:         s.marketEnabled !== false,
    };
  } catch(e) {
    return {
      freeShippingThreshold: 25, flatShippingFee: 3.99,
      commissionRate: 10, buyerProtectionFee: 0,
      taxRate: 0, taxLabel: 'Tax',
      processingFeeFlat: 0, processingFeePct: 0,
      shippingTaxable: false, marketEnabled: true,
    };
  }
}

/** Save a subset of marketplace config into sa_settings */
function _saveMktCfg(patch) {
  try {
    const s = JSON.parse(localStorage.getItem(MKT_CFG_KEY) || '{}');
    Object.assign(s, patch);
    localStorage.setItem(MKT_CFG_KEY, JSON.stringify(s));
    return true;
  } catch(e) { return false; }
}

/* Expose globally so afrib_market_upgrade.js can use it */
window._mktCfg    = _mktCfg;
window._saveMktCfg = _saveMktCfg;

/* ─────────────────────────────────────────────────────────────────────
   PATCH _mktCheckout — use live config for fee calculation
───────────────────────────────────────────────────────────────────── */
const _origCheckout = window._mktCheckout;
window._mktCheckout = function() {
  const cfg   = _mktCfg();
  const items = window.cartItems || [];
  if (!items.length) return;

  const useCb    = document.getElementById('cartUseCoinsCb');
  const useCoins = useCb?.checked;

  const subtotal = items.reduce((s,i) => {
    const price = parseFloat((i.product.price||'0').replace(/[^0-9.]/g,'')) || i.product.priceUSD || 0;
    return s + price * i.qty;
  }, 0);

  const shipping      = subtotal >= cfg.freeShippingThreshold ? 0 : cfg.flatShippingFee;
  const taxBase       = subtotal + (cfg.shippingTaxable ? shipping : 0);
  const tax           = parseFloat((taxBase * cfg.taxRate / 100).toFixed(2));
  const buyerProt     = parseFloat((subtotal * cfg.buyerProtectionFee / 100).toFixed(2));
  const procFee       = parseFloat((cfg.processingFeeFlat + subtotal * cfg.processingFeePct / 100).toFixed(2));
  const coinDiscount  = useCoins ? (window._mktCoinDiscount || 0) : 0;
  const total         = Math.max(0, subtotal + shipping + tax + buyerProt + procFee - coinDiscount);

  // Coin deduction
  if (useCoins && window.currentUser) {
    const coinKey  = `afrib_coins_${window.currentUser.email}`;
    const curCoins = parseInt(localStorage.getItem(coinKey) || '0');
    localStorage.setItem(coinKey, String(Math.max(0, curCoins - (window._mktCoinsNeeded || 0))));
  }

  // Log order with full fee breakdown
  try {
    const orders = JSON.parse(localStorage.getItem('afrib_mkt_orders') || '[]');
    orders.unshift({
      id: Date.now(),
      items: items.map(i => ({ name: i.product.name, qty: i.qty, price: i.product.priceUSD || 0, seller: i.product.seller })),
      subtotal, shipping, tax, taxLabel: cfg.taxLabel, buyerProt, procFee,
      coinDiscount, total,
      status: 'pending',
      ts: new Date().toISOString(),
      user: window.currentUser?.email || 'guest',
    });
    localStorage.setItem('afrib_mkt_orders', JSON.stringify(orders));
  } catch(e) {}

  // Clear cart
  window.cartItems = [];
  window.cartCount = 0;
  if (window._mkt) window._mkt.set('afrib_mkt_cart', []);
  if (typeof updateCartBadge === 'function') updateCartBadge();
  document.getElementById('cartModal')?.classList.remove('open');
  if (typeof showToast === 'function') showToast(`✅ Order placed! Total: $${total.toFixed(2)} — Seller will contact you soon 📦`);
};

/* ─────────────────────────────────────────────────────────────────────
   PATCH openCart — live fee breakdown with config-driven values
───────────────────────────────────────────────────────────────────── */
const _origOpenCart = window.openCart;
window.openCart = function() {
  const cfg   = _mktCfg();
  const saved = (window._mkt ? window._mkt.get('afrib_mkt_cart', []) : []);
  if (saved.length) { window.cartItems = saved; window.cartCount = saved.reduce((s,i) => s+i.qty, 0); }
  const items = window.cartItems || [];

  let modal = document.getElementById('cartModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'cartModal';
    modal.className = 'modal-overlay';
    modal.onclick = e => { if (e.target === modal) modal.classList.remove('open'); };
    document.body.appendChild(modal);
  }

  if (!items.length) {
    modal.innerHTML = `
      <div class="modal-card" onclick="event.stopPropagation()" style="max-width:480px">
        <div class="modal-body" style="padding:28px;text-align:center">
          <div style="font-size:48px;margin-bottom:12px">🛒</div>
          <h3 style="font-size:18px;font-weight:800;margin-bottom:8px">Your cart is empty</h3>
          <p style="font-size:13px;color:var(--w60);margin-bottom:20px">Browse the marketplace to find amazing products</p>
          <button onclick="document.getElementById('cartModal').classList.remove('open')" class="btn-primary">Continue Shopping</button>
        </div>
      </div>`;
    modal.classList.add('open');
    return;
  }

  const esc = s => String(s||'').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const subtotal = items.reduce((s,i) => {
    const price = parseFloat((i.product.price||'0').replace(/[^0-9.]/g,'')) || i.product.priceUSD || 0;
    return s + price * i.qty;
  }, 0);
  const shipping     = subtotal >= cfg.freeShippingThreshold ? 0 : cfg.flatShippingFee;
  const taxBase      = subtotal + (cfg.shippingTaxable ? shipping : 0);
  const tax          = parseFloat((taxBase * cfg.taxRate / 100).toFixed(2));
  const buyerProt    = parseFloat((subtotal * cfg.buyerProtectionFee / 100).toFixed(2));
  const procFee      = parseFloat((cfg.processingFeeFlat + subtotal * cfg.processingFeePct / 100).toFixed(2));
  const userCoins    = parseInt(localStorage.getItem(`afrib_coins_${window.currentUser?.email}`) || '0');
  const coinDiscount = Math.min(Math.floor(userCoins / 100) * 0.5, subtotal * 0.2);
  const coinsNeeded  = Math.ceil(coinDiscount / 0.5) * 100;
  window._mktCoinDiscount = coinDiscount;
  window._mktCoinsNeeded  = coinsNeeded;

  const baseTotal    = subtotal + shipping + tax + buyerProt + procFee;

  modal.innerHTML = `
    <div class="modal-card" onclick="event.stopPropagation()" style="max-width:480px">
      <button class="modal-close" onclick="document.getElementById('cartModal').classList.remove('open')">✕</button>
      <div class="modal-body" style="padding:20px;max-height:80vh;overflow-y:auto">
        <h3 style="font-size:18px;font-weight:800;margin-bottom:16px">🛒 Cart (${window.cartCount} item${window.cartCount!==1?'s':''})</h3>

        <!-- Cart items -->
        <div id="cartItemsList">
          ${items.map((item,idx) => {
            const p     = item.product;
            const price = parseFloat((p.price||'0').replace(/[^0-9.]/g,'')) || p.priceUSD || 0;
            const store = (() => { try { return JSON.parse(localStorage.getItem('afrib_seller_stores')||'{}')[p.email||''] || null; } catch(e) { return null; } })();
            const contactInfo = store?.contact || store?.phone || store?.whatsapp || p.contact || '';
            return `
              <div style="display:flex;gap:12px;padding:12px 0;border-bottom:1px solid var(--border)">
                <div style="width:60px;height:60px;border-radius:8px;overflow:hidden;flex-shrink:0;background:var(--bg3);display:flex;align-items:center;justify-content:center;font-size:24px">
                  ${p.imageData ? `<img src="${esc(p.imageData)}" style="width:100%;height:100%;object-fit:cover" alt="${esc(p.name)}"/>` : esc(p.emoji||'📦')}
                </div>
                <div style="flex:1;min-width:0">
                  <div style="font-size:13px;font-weight:700;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(p.name)}</div>
                  <div style="font-size:11px;color:var(--w60);margin-bottom:4px">by ${esc(p.seller||'AfribConnect')}</div>
                  ${contactInfo ? `<div style="font-size:11px;color:var(--gold);margin-bottom:4px">📱 ${esc(contactInfo)}</div>` : ''}
                  <div style="display:flex;align-items:center;gap:8px">
                    <div style="display:flex;align-items:center;border:1px solid var(--border);border-radius:8px;overflow:hidden">
                      <button onclick="_mktCartQty(${idx},-1)" style="width:28px;height:28px;background:var(--bg3);border:none;color:var(--white);cursor:pointer;font-size:14px">−</button>
                      <span style="min-width:28px;text-align:center;font-size:13px;font-weight:700">${item.qty}</span>
                      <button onclick="_mktCartQty(${idx},1)" style="width:28px;height:28px;background:var(--bg3);border:none;color:var(--white);cursor:pointer;font-size:14px">+</button>
                    </div>
                    <button onclick="_mktCartRemove(${idx})" style="background:none;border:none;color:rgba(239,68,68,.7);font-size:11px;cursor:pointer;font-weight:600">Remove</button>
                  </div>
                </div>
                <div style="text-align:right;flex-shrink:0">
                  <div style="font-size:15px;font-weight:800;color:var(--gold)">$${(price*item.qty).toFixed(2)}</div>
                  <div style="font-size:10px;color:var(--w30)">$${price.toFixed(2)} ea</div>
                </div>
              </div>`;
          }).join('')}
        </div>

        <!-- Coin discount toggle -->
        ${userCoins >= 100 ? `
          <div style="background:rgba(212,175,55,.07);border:1px solid rgba(212,175,55,.2);border-radius:10px;padding:10px 12px;margin:12px 0;display:flex;align-items:center;justify-content:space-between">
            <div>
              <div style="font-size:12px;font-weight:700;color:var(--gold)">🪙 Use ${coinsNeeded.toLocaleString()} coins</div>
              <div style="font-size:11px;color:var(--w60)">Save $${coinDiscount.toFixed(2)} on your order</div>
            </div>
            <label style="position:relative;display:inline-block;width:40px;height:22px">
              <input type="checkbox" id="cartUseCoinsCb" style="opacity:0;position:absolute;width:100%;height:100%;cursor:pointer;margin:0" onchange="_mktUpdateCartTotal()"/>
              <span onclick="this.previousElementSibling.click()" style="position:absolute;inset:0;background:var(--border);border-radius:11px;transition:background .2s;cursor:pointer">
                <span style="position:absolute;top:2px;left:2px;width:18px;height:18px;background:#fff;border-radius:50%;transition:transform .2s;pointer-events:none"></span>
              </span>
            </label>
          </div>` : ''}

        <!-- Order summary with full fee breakdown -->
        <div style="background:var(--bg3);border-radius:12px;padding:14px;margin-top:12px">
          <div style="font-size:12px;font-weight:700;color:var(--w60);margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px">Order Summary</div>

          <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px">
            <span style="color:var(--w60)">Subtotal (${items.reduce((s,i)=>s+i.qty,0)} items)</span>
            <span>$${subtotal.toFixed(2)}</span>
          </div>

          <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px">
            <span style="color:var(--w60)">Shipping</span>
            <span style="color:${shipping===0?'#22c55e':'inherit'}">${shipping===0 ? 'FREE' : '$'+shipping.toFixed(2)}</span>
          </div>
          ${shipping === 0 && subtotal < cfg.freeShippingThreshold + 50 ? '' :
            subtotal < cfg.freeShippingThreshold ?
            `<div style="font-size:10px;color:var(--w30);margin-top:-4px;margin-bottom:5px">Add $${(cfg.freeShippingThreshold-subtotal).toFixed(2)} for free shipping</div>` :
            `<div style="font-size:10px;color:#22c55e;margin-top:-4px;margin-bottom:5px">✓ Free shipping applied</div>`
          }

          ${tax > 0 ? `
            <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px">
              <span style="color:var(--w60)">${esc(cfg.taxLabel)} (${cfg.taxRate}%)</span>
              <span>$${tax.toFixed(2)}</span>
            </div>` : ''}

          ${buyerProt > 0 ? `
            <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px">
              <span style="color:var(--w60);display:flex;align-items:center;gap:4px">
                🛡️ Buyer Protection (${cfg.buyerProtectionFee}%)
                <span title="Covers you if the seller doesn't deliver" style="cursor:help;font-size:10px;background:rgba(255,255,255,.1);border-radius:50%;width:14px;height:14px;display:inline-flex;align-items:center;justify-content:center">?</span>
              </span>
              <span>$${buyerProt.toFixed(2)}</span>
            </div>` : ''}

          ${procFee > 0 ? `
            <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px">
              <span style="color:var(--w60)">Processing fee</span>
              <span>$${procFee.toFixed(2)}</span>
            </div>` : ''}

          <div id="cartCoinSavings" style="display:none;justify-content:space-between;font-size:13px;margin-bottom:5px;color:var(--gold)">
            <span>🪙 Coin discount</span>
            <span>-$${coinDiscount.toFixed(2)}</span>
          </div>

          <div style="border-top:1px solid var(--border);margin:8px 0;padding-top:8px;display:flex;justify-content:space-between;font-size:16px;font-weight:800">
            <span>Total</span>
            <span id="cartTotal" style="color:var(--gold)">$${baseTotal.toFixed(2)}</span>
          </div>
        </div>

        <!-- Actions -->
        <div style="display:flex;gap:8px;margin-top:14px">
          <button onclick="document.getElementById('cartModal').classList.remove('open')" style="flex:1;padding:12px;background:transparent;border:1px solid var(--border);border-radius:12px;color:var(--w60);font-size:13px;font-weight:600;cursor:pointer">← Continue</button>
          <button onclick="_mktCheckout()" style="flex:2;padding:12px;background:linear-gradient(135deg,var(--gold),#b8860b);color:#000;border:none;border-radius:12px;font-size:14px;font-weight:800;cursor:pointer">Checkout →</button>
        </div>

        <div style="font-size:10px;color:var(--w30);text-align:center;margin-top:8px">
          🛡️ Secured by AfribConnect Buyer Protection · Sellers notified immediately
        </div>
      </div>
    </div>`;
  modal.classList.add('open');
};

/* ─────────────────────────────────────────────────────────────────────
   CONTACT SELLER — button on product detail modal
───────────────────────────────────────────────────────────────────── */
const _origOpenProduct2 = window.openProduct;
window.openProduct = function(id) {
  if (typeof _origOpenProduct2 === 'function') _origOpenProduct2(id);

  setTimeout(() => {
    const allProducts = (typeof getAllListings === 'function') ? getAllListings() : [];
    const p = allProducts.find(x => String(x.id) === String(id));
    if (!p) return;

    // Find seller contact info
    const esc = s => String(s||'').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const stores = (() => { try { return JSON.parse(localStorage.getItem('afrib_seller_stores')||'{}'); } catch(e) { return {}; } })();
    const store  = stores[p.email || ''] || null;
    const contact = store?.contact || store?.phone || store?.whatsapp || p.contact || '';
    const whatsapp= store?.whatsapp || '';

    // Check if contact seller button already exists
    const existingBtn = document.getElementById('contactSellerBtn');
    if (existingBtn) return;

    const body = document.querySelector('#productModal .modal-body');
    if (!body) return;

    // Add contact seller button after seller info line
    const sellerEl = document.getElementById('modalSeller');
    if (!sellerEl) return;

    // Only add if there's contact info
    if (!contact && !whatsapp) {
      // Show a "request contact" note
      const note = document.createElement('div');
      note.id = 'contactSellerBtn';
      note.style.cssText = 'font-size:11px;color:var(--w30);margin-top:6px;margin-bottom:8px';
      note.textContent = 'Contact seller via messages after purchase';
      sellerEl.after(note);
      return;
    }

    const contactDiv = document.createElement('div');
    contactDiv.id = 'contactSellerBtn';
    contactDiv.style.cssText = 'margin-top:8px;margin-bottom:12px;display:flex;gap:8px;flex-wrap:wrap';

    if (contact) {
      const btn = document.createElement('button');
      btn.style.cssText = 'display:flex;align-items:center;gap:6px;padding:8px 14px;background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.3);border-radius:10px;color:#22c55e;font-size:12px;font-weight:700;cursor:pointer';
      btn.innerHTML = `📱 Contact Seller`;
      btn.onclick = () => {
        const msg = `Hi, I'm interested in your product "${p.name||''}". Is it still available?`;
        if (contact.startsWith('+') || /^\d/.test(contact)) {
          window.open(`https://wa.me/${contact.replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`, '_blank');
        } else if (contact.includes('@')) {
          window.open(`mailto:${contact}?subject=Enquiry: ${encodeURIComponent(p.name||'Product')}&body=${encodeURIComponent(msg)}`, '_blank');
        } else {
          if (typeof showToast === 'function') showToast(`📱 Contact seller: ${contact}`);
        }
      };
      contactDiv.appendChild(btn);
    }

    if (whatsapp) {
      const waBtn = document.createElement('button');
      waBtn.style.cssText = 'display:flex;align-items:center;gap:6px;padding:8px 14px;background:rgba(37,211,102,.1);border:1px solid rgba(37,211,102,.3);border-radius:10px;color:#25D366;font-size:12px;font-weight:700;cursor:pointer';
      waBtn.innerHTML = `💬 WhatsApp`;
      waBtn.onclick = () => {
        const msg = `Hi, I'm interested in your product "${p.name||''}" listed on AfribConnect. Is it still available?`;
        window.open(`https://wa.me/${whatsapp.replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`, '_blank');
      };
      contactDiv.appendChild(waBtn);
    }

    sellerEl.after(contactDiv);
  }, 80);
};

/* ─────────────────────────────────────────────────────────────────────
   SELLER STORE — add WhatsApp + Phone fields to create/edit store modal
───────────────────────────────────────────────────────────────────── */
const _origCreateSellerStore = window.createSellerStore;
window.createSellerStore = function() {
  // Intercept to save extra contact fields
  try {
    const whatsapp = document.getElementById('storeWhatsAppInput')?.value?.trim() || '';
    const phone    = document.getElementById('storePhoneInput')?.value?.trim() || '';
    const email2   = document.getElementById('storeEmailInput')?.value?.trim() || '';
    const location = document.getElementById('storeLocationInput')?.value?.trim() || '';

    // Temporarily patch the stores object after save
    if (typeof _origCreateSellerStore === 'function') _origCreateSellerStore();

    // Patch with extra fields
    if (window.currentUser) {
      const stores = (() => { try { return JSON.parse(localStorage.getItem('afrib_seller_stores')||'{}'); } catch(e) { return {}; } })();
      if (stores[window.currentUser.email]) {
        Object.assign(stores[window.currentUser.email], { whatsapp, phone, contactEmail: email2, location });
        localStorage.setItem('afrib_seller_stores', JSON.stringify(stores));
      }
    }
  } catch(e) {
    if (typeof _origCreateSellerStore === 'function') _origCreateSellerStore();
  }
};

/** Inject extra contact fields into the create/edit store modal */
(function patchStoreModal() {
  function tryPatch() {
    const contactInput = document.getElementById('storeContactInput');
    if (!contactInput || contactInput.parentElement?.dataset?.extraPatched) return;
    contactInput.parentElement.dataset.extraPatched = '1';

    // After the existing contact input, inject extra fields
    const extras = document.createElement('div');
    extras.style.cssText = 'display:flex;flex-direction:column;gap:10px;margin-top:10px';
    extras.innerHTML = `
      <div>
        <label style="font-size:12px;color:var(--w60);display:block;margin-bottom:4px">💬 WhatsApp Number <span style="color:#25D366;font-size:10px">(with country code, e.g. +2348012345678)</span></label>
        <input id="storeWhatsAppInput" type="tel" placeholder="+2348012345678"
          style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:10px 12px;color:var(--white);font-size:13px"/>
      </div>
      <div>
        <label style="font-size:12px;color:var(--w60);display:block;margin-bottom:4px">📞 Phone Number</label>
        <input id="storePhoneInput" type="tel" placeholder="Your phone number"
          style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:10px 12px;color:var(--white);font-size:13px"/>
      </div>
      <div>
        <label style="font-size:12px;color:var(--w60);display:block;margin-bottom:4px">📧 Business Email <span style="color:var(--w30);font-size:10px">(optional)</span></label>
        <input id="storeEmailInput" type="email" placeholder="store@example.com"
          style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:10px 12px;color:var(--white);font-size:13px"/>
      </div>
      <div>
        <label style="font-size:12px;color:var(--w60);display:block;margin-bottom:4px">📍 Store Location <span style="color:var(--w30);font-size:10px">(city/country)</span></label>
        <input id="storeLocationInput" type="text" placeholder="Lagos, Nigeria"
          style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:10px 12px;color:var(--white);font-size:13px"/>
      </div>`;
    contactInput.parentElement.after(extras);

    // Pre-fill if editing
    if (window.currentUser) {
      const stores = (() => { try { return JSON.parse(localStorage.getItem('afrib_seller_stores')||'{}'); } catch(e) { return {}; } })();
      const store  = stores[window.currentUser.email];
      if (store) {
        if (store.whatsapp)      document.getElementById('storeWhatsAppInput').value = store.whatsapp;
        if (store.phone)         document.getElementById('storePhoneInput').value    = store.phone;
        if (store.contactEmail)  document.getElementById('storeEmailInput').value    = store.contactEmail;
        if (store.location)      document.getElementById('storeLocationInput').value = store.location;
      }
    }
  }

  // Re-patch every time the modal opens
  const origOpen = window.openCreateStoreModal;
  if (typeof origOpen === 'function') {
    window.openCreateStoreModal = function(isEdit) {
      origOpen.apply(this, arguments);
      setTimeout(tryPatch, 80);
    };
  }
  setTimeout(tryPatch, 1200);
})();

/* ─────────────────────────────────────────────────────────────────────
   ADMIN PANEL — Marketplace Settings section (hidden, admin-only)
   Injected into admin.html's settings panel
───────────────────────────────────────────────────────────────────── */
(function injectAdminMarketPanel() {
  function tryInject() {
    // Find the admin settings panel — look for the last settings section
    const adminPanels = document.querySelectorAll('#aspanel-app .as-section, .as-panel .as-section');
    if (!adminPanels.length) return;

    const lastPanel = adminPanels[adminPanels.length - 1];
    if (!lastPanel || lastPanel.dataset.mktAdminInjected) return;
    lastPanel.dataset.mktAdminInjected = '1';

    const cfg = _mktCfg();
    const section = document.createElement('div');
    section.className = 'as-section';
    section.style.cssText = 'margin-top:16px';
    section.innerHTML = `
      <h4 style="font-size:14px;font-weight:700;margin-bottom:12px;display:flex;align-items:center;gap:8px">
        🛒 Marketplace Settings
        <span style="font-size:9px;background:rgba(239,68,68,.15);color:#f87171;border:1px solid rgba(239,68,68,.2);border-radius:4px;padding:2px 6px;font-weight:700">ADMIN ONLY</span>
      </h4>

      <div style="display:flex;flex-direction:column;gap:12px">
        <!-- Free Shipping Threshold -->
        <div style="background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:12px 14px">
          <label style="font-size:12px;color:var(--w60);display:block;margin-bottom:4px">🚚 Free Shipping Threshold ($)</label>
          <div style="display:flex;gap:8px">
            <input id="adminFreeShipThresh" type="number" min="0" step="0.01" value="${cfg.freeShippingThreshold}"
              style="flex:1;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:8px 10px;color:var(--white);font-size:13px"/>
            <button onclick="_adminSaveMktField('freeShippingThreshold','adminFreeShipThresh',parseFloat)"
              style="background:var(--gold);color:#000;border:none;border-radius:8px;padding:8px 14px;font-size:12px;font-weight:700;cursor:pointer">Save</button>
          </div>
          <div style="font-size:10px;color:var(--w30);margin-top:4px">Orders above this amount get free shipping. Currently: $${cfg.freeShippingThreshold}</div>
        </div>

        <!-- Flat Shipping Fee -->
        <div style="background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:12px 14px">
          <label style="font-size:12px;color:var(--w60);display:block;margin-bottom:4px">📦 Standard Shipping Fee ($)</label>
          <div style="display:flex;gap:8px">
            <input id="adminFlatShipFee" type="number" min="0" step="0.01" value="${cfg.flatShippingFee}"
              style="flex:1;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:8px 10px;color:var(--white);font-size:13px"/>
            <button onclick="_adminSaveMktField('flatShippingFee','adminFlatShipFee',parseFloat)"
              style="background:var(--gold);color:#000;border:none;border-radius:8px;padding:8px 14px;font-size:12px;font-weight:700;cursor:pointer">Save</button>
          </div>
          <div style="font-size:10px;color:var(--w30);margin-top:4px">Charged when order is below free shipping threshold</div>
        </div>

        <!-- Marketplace Toggle -->
        <div style="background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:12px 14px;display:flex;align-items:center;justify-content:space-between">
          <div>
            <div style="font-size:13px;font-weight:700">Marketplace Active</div>
            <div style="font-size:10px;color:var(--w30)">Disable to take marketplace offline for maintenance</div>
          </div>
          <label style="position:relative;display:inline-block;width:44px;height:24px">
            <input type="checkbox" id="adminMktEnabled" ${cfg.marketEnabled?'checked':''} onchange="_adminSaveMktField('marketEnabled','adminMktEnabled',el=>el.checked)"
              style="opacity:0;position:absolute;width:100%;height:100%;cursor:pointer;margin:0"/>
            <span onclick="this.previousElementSibling.click()" style="position:absolute;inset:0;background:${cfg.marketEnabled?'var(--gold)':'var(--border)'};border-radius:24px;transition:background .2s;cursor:pointer">
              <span style="position:absolute;height:18px;width:18px;left:3px;bottom:3px;background:#fff;border-radius:50%;transition:transform .2s;transform:${cfg.marketEnabled?'translateX(20px)':'translateX(0)'}"></span>
            </span>
          </label>
        </div>
      </div>`;

    lastPanel.after(section);
  }

  window.addEventListener('load', () => setTimeout(tryInject, 800));
})();

/* ─────────────────────────────────────────────────────────────────────
   SUPERADMIN PANEL — Full Commerce Settings Panel
   Injected into the existing SA revenue/commission section
───────────────────────────────────────────────────────────────────── */
(function injectSACommercePanel() {
  function tryInject() {
    // Find a good anchor in SA panel — the commission card
    const commCard = document.querySelector('.sa-card-title');
    if (!commCard || document.getElementById('saCommercePanel')) return;

    const cfg = _mktCfg();
    const panel = document.createElement('div');
    panel.id = 'saCommercePanel';
    panel.className = 'sa-card';
    panel.style.cssText = 'margin-top:16px';
    panel.innerHTML = `
      <style>
        #saCommercePanel .fee-row{display:grid;grid-template-columns:1fr auto auto;gap:8px;align-items:end;margin-bottom:10px}
        #saCommercePanel .fee-input{background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:8px 10px;color:var(--white);font-size:13px;width:100%}
        #saCommercePanel .fee-label{font-size:11px;color:var(--w60);display:block;margin-bottom:3px}
        #saCommercePanel .fee-unit{font-size:12px;color:var(--w60);padding:8px 6px;white-space:nowrap;align-self:end}
        #saCommercePanel .fee-desc{font-size:10px;color:var(--w30);margin-bottom:8px;margin-top:2px}
        #saCommercePanel .section-divider{border-top:1px solid var(--border);margin:14px 0;padding-top:14px}
        #saCommercePanel .section-title{font-size:12px;font-weight:700;color:var(--w60);text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px}
      </style>

      <div class="sa-card-title"><span>🛒</span> Marketplace Fee Schedule</div>
      <div class="sa-card-sub">Configure all buyer/seller fees, taxes, and shipping rules</div>

      <!-- Live preview bar -->
      <div id="saFeePreview" style="background:rgba(212,175,55,.07);border:1px solid rgba(212,175,55,.2);border-radius:10px;padding:12px 14px;margin-bottom:16px">
        <div style="font-size:11px;color:var(--w60);margin-bottom:6px">💡 Example: $50 order breakdown</div>
        <div id="saFeePreviewContent" style="font-size:12px;color:var(--w80)">Loading...</div>
      </div>

      <!-- === SHIPPING === -->
      <div class="section-title">🚚 Shipping Rules</div>

      <div class="fee-row">
        <div>
          <label class="fee-label">Free Shipping Threshold ($)</label>
          <input id="saCfgFreeShipThresh" class="fee-input" type="number" min="0" step="0.01" value="${cfg.freeShippingThreshold}" oninput="_saUpdateFeePreview()"/>
        </div>
        <div class="fee-unit">USD</div>
      </div>
      <div class="fee-desc">Orders at or above this amount qualify for free shipping. Amazon uses $25, many use $35–$50.</div>

      <div class="fee-row">
        <div>
          <label class="fee-label">Standard Shipping Fee ($)</label>
          <input id="saCfgFlatShip" class="fee-input" type="number" min="0" step="0.01" value="${cfg.flatShippingFee}" oninput="_saUpdateFeePreview()"/>
        </div>
        <div class="fee-unit">USD</div>
      </div>
      <div class="fee-desc">Charged when order is below free shipping threshold. Industry average: $3.99–$7.99.</div>

      <!-- === PLATFORM FEES === -->
      <div class="section-divider"></div>
      <div class="section-title">💰 Platform Commission (Seller-Side)</div>

      <div class="fee-row">
        <div>
          <label class="fee-label">Commission Rate (%)</label>
          <input id="saCfgCommission" class="fee-input" type="number" min="0" max="40" step="0.1" value="${cfg.commissionRate}" oninput="_saUpdateFeePreview()"/>
        </div>
        <div class="fee-unit">%</div>
      </div>
      <div class="fee-desc">Deducted from seller payout on each sale. eBay: 12.9–15% · Facebook: 10% · Mercari: 10% · Etsy: 6.5%</div>

      <!-- === BUYER FEES === -->
      <div class="section-divider"></div>
      <div class="section-title">🛡️ Buyer Fees (Added to Buyer Total)</div>

      <div class="fee-row">
        <div>
          <label class="fee-label">Buyer Protection Fee (%)</label>
          <input id="saCfgBuyerProt" class="fee-input" type="number" min="0" max="20" step="0.1" value="${cfg.buyerProtectionFee}" oninput="_saUpdateFeePreview()"/>
        </div>
        <div class="fee-unit">%</div>
      </div>
      <div class="fee-desc">Added to buyer's total. Covers refunds if seller fails to deliver. Vinted: 3.6% · OfferUp: $2.99 flat</div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:4px">
        <div>
          <label class="fee-label">Processing Fee — Flat ($)</label>
          <input id="saCfgProcFlat" class="fee-input" type="number" min="0" step="0.01" value="${cfg.processingFeeFlat}" oninput="_saUpdateFeePreview()"/>
        </div>
        <div>
          <label class="fee-label">Processing Fee — % of total</label>
          <input id="saCfgProcPct" class="fee-input" type="number" min="0" max="10" step="0.01" value="${cfg.processingFeePct}" oninput="_saUpdateFeePreview()"/>
        </div>
      </div>
      <div class="fee-desc">Payment processing cost passed to buyer. PayPal/Stripe standard: $0.30 + 2.9%. Set to 0 to absorb it yourself.</div>

      <!-- === TAX === -->
      <div class="section-divider"></div>
      <div class="section-title">🏛️ Tax Configuration</div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:4px">
        <div>
          <label class="fee-label">Tax Rate (%)</label>
          <input id="saCfgTaxRate" class="fee-input" type="number" min="0" max="30" step="0.1" value="${cfg.taxRate}" oninput="_saUpdateFeePreview()"/>
        </div>
        <div>
          <label class="fee-label">Tax Label (shown to buyer)</label>
          <input id="saCfgTaxLabel" class="fee-input" type="text" placeholder="VAT / Sales Tax" value="${cfg.taxLabel}" oninput="_saUpdateFeePreview()"/>
        </div>
      </div>
      <div class="fee-desc">Common rates: UK VAT 20% · EU standard 19–25% · US Sales Tax 0–10.25% · Nigeria VAT 7.5% · SA VAT 15%</div>

      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <label style="position:relative;display:inline-block;width:40px;height:22px">
          <input type="checkbox" id="saCfgShipTaxable" ${cfg.shippingTaxable?'checked':''} style="opacity:0;position:absolute;width:100%;height:100%;cursor:pointer;margin:0" oninput="_saUpdateFeePreview()"/>
          <span onclick="this.previousElementSibling.click()" style="position:absolute;inset:0;background:${cfg.shippingTaxable?'var(--gold)':'var(--border)'};border-radius:11px;transition:background .2s;cursor:pointer">
            <span style="position:absolute;top:2px;left:2px;width:18px;height:18px;background:#fff;border-radius:50%;transition:transform .2s;pointer-events:none;transform:${cfg.shippingTaxable?'translateX(18px)':'translateX(0)'}"></span>
          </span>
        </label>
        <span style="font-size:12px;color:var(--w60)">Tax shipping costs too</span>
      </div>

      <!-- === SAVE BUTTON === -->
      <button onclick="_saSaveCommerceSettings()" style="width:100%;padding:13px;background:linear-gradient(135deg,var(--gold),#b8860b);color:#000;border:none;border-radius:12px;font-size:14px;font-weight:800;cursor:pointer;margin-top:6px">
        💾 Save All Commerce Settings
      </button>

      <div id="saCommerceMsg" style="display:none;text-align:center;margin-top:8px;font-size:12px;color:#22c55e;font-weight:700"></div>
    `;

    // Insert after the commission card
    commCard.closest('.sa-card')?.after(panel);
    _saUpdateFeePreview();
  }

  window.addEventListener('load', () => setTimeout(tryInject, 800));
})();

/* ─────────────────────────────────────────────────────────────────────
   SA HELPERS — fee preview + save
───────────────────────────────────────────────────────────────────── */
window._saUpdateFeePreview = function() {
  const el = document.getElementById('saFeePreviewContent');
  if (!el) return;

  const exampleSubtotal = 50;
  const thresh     = parseFloat(document.getElementById('saCfgFreeShipThresh')?.value) || 25;
  const flatShip   = parseFloat(document.getElementById('saCfgFlatShip')?.value)       || 3.99;
  const commPct    = parseFloat(document.getElementById('saCfgCommission')?.value)     || 0;
  const buyerProt  = parseFloat(document.getElementById('saCfgBuyerProt')?.value)      || 0;
  const procFlat   = parseFloat(document.getElementById('saCfgProcFlat')?.value)       || 0;
  const procPct    = parseFloat(document.getElementById('saCfgProcPct')?.value)        || 0;
  const taxRate    = parseFloat(document.getElementById('saCfgTaxRate')?.value)        || 0;
  const taxLabel   = document.getElementById('saCfgTaxLabel')?.value || 'Tax';
  const shipTaxable= document.getElementById('saCfgShipTaxable')?.checked;

  const shipping   = exampleSubtotal >= thresh ? 0 : flatShip;
  const taxBase    = exampleSubtotal + (shipTaxable ? shipping : 0);
  const tax        = parseFloat((taxBase * taxRate / 100).toFixed(2));
  const bProtFee   = parseFloat((exampleSubtotal * buyerProt / 100).toFixed(2));
  const procFee    = parseFloat((procFlat + exampleSubtotal * procPct / 100).toFixed(2));
  const buyerTotal = exampleSubtotal + shipping + tax + bProtFee + procFee;
  const sellerPays = parseFloat((exampleSubtotal * commPct / 100).toFixed(2));
  const platformEarns = sellerPays + bProtFee + procFee;

  el.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <div>
        <div style="font-size:10px;color:var(--w30);font-weight:700;text-transform:uppercase;margin-bottom:4px">Buyer Pays</div>
        <div style="display:flex;justify-content:space-between"><span style="color:var(--w60)">Subtotal</span><span>$${exampleSubtotal.toFixed(2)}</span></div>
        ${shipping > 0 ? `<div style="display:flex;justify-content:space-between"><span style="color:var(--w60)">Shipping</span><span>$${shipping.toFixed(2)}</span></div>` : `<div style="display:flex;justify-content:space-between"><span style="color:#22c55e">Shipping</span><span style="color:#22c55e">FREE</span></div>`}
        ${tax > 0 ? `<div style="display:flex;justify-content:space-between"><span style="color:var(--w60)">${taxLabel} (${taxRate}%)</span><span>$${tax.toFixed(2)}</span></div>` : ''}
        ${bProtFee > 0 ? `<div style="display:flex;justify-content:space-between"><span style="color:var(--w60)">Buyer Protection</span><span>$${bProtFee.toFixed(2)}</span></div>` : ''}
        ${procFee > 0 ? `<div style="display:flex;justify-content:space-between"><span style="color:var(--w60)">Processing</span><span>$${procFee.toFixed(2)}</span></div>` : ''}
        <div style="border-top:1px solid var(--border);margin:5px 0;padding-top:5px;display:flex;justify-content:space-between;font-weight:700"><span>Total</span><span style="color:var(--gold)">$${buyerTotal.toFixed(2)}</span></div>
      </div>
      <div>
        <div style="font-size:10px;color:var(--w30);font-weight:700;text-transform:uppercase;margin-bottom:4px">Platform Earns</div>
        ${sellerPays > 0 ? `<div style="display:flex;justify-content:space-between"><span style="color:var(--w60)">Commission (${commPct}%)</span><span>$${sellerPays.toFixed(2)}</span></div>` : ''}
        ${bProtFee > 0 ? `<div style="display:flex;justify-content:space-between"><span style="color:var(--w60)">Buyer protection</span><span>$${bProtFee.toFixed(2)}</span></div>` : ''}
        ${procFee > 0 ? `<div style="display:flex;justify-content:space-between"><span style="color:var(--w60)">Processing fee</span><span>$${procFee.toFixed(2)}</span></div>` : ''}
        <div style="border-top:1px solid var(--border);margin:5px 0;padding-top:5px;display:flex;justify-content:space-between;font-weight:700"><span>Total</span><span style="color:#22c55e">$${platformEarns.toFixed(2)}</span></div>
        <div style="font-size:10px;color:var(--w30);margin-top:4px">Seller nets: $${(exampleSubtotal - sellerPays).toFixed(2)}</div>
      </div>
    </div>`;
};

window._saSaveCommerceSettings = function() {
  const patch = {
    freeShippingThreshold: parseFloat(document.getElementById('saCfgFreeShipThresh')?.value) || 25,
    flatShippingFee:       parseFloat(document.getElementById('saCfgFlatShip')?.value)       || 3.99,
    commissionRate:        parseFloat(document.getElementById('saCfgCommission')?.value)     || 10,
    buyerProtectionFee:    parseFloat(document.getElementById('saCfgBuyerProt')?.value)      || 0,
    processingFeeFlat:     parseFloat(document.getElementById('saCfgProcFlat')?.value)       || 0,
    processingFeePct:      parseFloat(document.getElementById('saCfgProcPct')?.value)        || 0,
    taxRate:               parseFloat(document.getElementById('saCfgTaxRate')?.value)        || 0,
    taxLabel:              document.getElementById('saCfgTaxLabel')?.value?.trim()           || 'Tax',
    shippingTaxable:       document.getElementById('saCfgShipTaxable')?.checked             || false,
  };
  _saveMktCfg(patch);
  const msg = document.getElementById('saCommerceMsg');
  if (msg) { msg.textContent = '✅ Commerce settings saved'; msg.style.display='block'; setTimeout(()=>{ msg.style.display='none'; }, 3000); }
  if (typeof showToast === 'function') showToast('✅ Marketplace fee schedule saved');
};

/** Admin panel save helper */
window._adminSaveMktField = function(key, inputId, transform) {
  const el  = document.getElementById(inputId);
  if (!el) return;
  const val = transform ? transform(el) : el.value;
  _saveMktCfg({ [key]: val });
  if (typeof showToast === 'function') showToast(`✅ ${key} updated`);
};

/* ─────────────────────────────────────────────────────────────────────
   PATCH renderProducts — use config-driven free shipping threshold
───────────────────────────────────────────────────────────────────── */
const _origRenderProductsCfg = window.renderProducts;
if (typeof _origRenderProductsCfg === 'function') {
  window.renderProducts = function() {
    // Update the free shipping threshold in afrib_market_upgrade's closure
    const cfg = _mktCfg();
    window._mktFreeShipThreshold = cfg.freeShippingThreshold;
    _origRenderProductsCfg.apply(this, arguments);
  };
}

/* ─────────────────────────────────────────────────────────────────────
   MARKETPLACE GATE — disable if admin has turned market off
───────────────────────────────────────────────────────────────────── */
(function marketGate() {
  const origShowScreen = window.showScreen;
  if (typeof origShowScreen !== 'function') return;
  window.showScreen = function(screen) {
    if (screen === 'market') {
      const cfg = _mktCfg();
      if (!cfg.marketEnabled) {
        if (typeof showToast === 'function') showToast('🛒 Marketplace is temporarily offline — check back soon');
        return;
      }
    }
    origShowScreen.apply(this, arguments);
  };
})();

console.log('[AfribMarket Config] Commerce settings module loaded ✅');
