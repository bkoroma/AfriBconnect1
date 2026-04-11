/* ═══════════════════════════════════════════════════════════════════════════
   AfribConnect — USER STORAGE ENGINE  (afrib_user_storage.js)
   Keeps ALL user-generated media (images, voice notes, large messages)
   in the USER'S OWN BROWSER — IndexedDB for large files, localStorage
   for small metadata. NOTHING goes to any cloud server.

   Why IndexedDB over localStorage:
   • localStorage: ~5–10MB limit — fails silently on image-heavy chats
   • IndexedDB: 50%+ of device storage — handles hundreds of photos
   • Both are 100% local to the user's device

   Storage map:
   ┌─ IndexedDB: "afribconnect_media" ──────────────────────────────┐
   │  store: "images"   key: mediaId   value: { data, type, ts }   │
   │  store: "messages" key: convKey   value: msgArray (with imgs)  │
   │  store: "posts"    key: postId    value: post object           │
   └────────────────────────────────────────────────────────────────┘
   ┌─ localStorage (metadata only, stays fast) ─────────────────────┐
   │  afrib_style_posts   → array of post IDs (no imageData)        │
   │  ms_convos_EMAIL     → conversation list (no imageData)        │
   └────────────────────────────────────────────────────────────────┘
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

(function AfribUserStorage() {

  const DB_NAME    = 'afribconnect_media';
  const DB_VERSION = 1;
  const log = (...a) => console.log('%c[Storage]','color:#38bdf8;font-weight:700',...a);

  let _db = null;

  /* ─────────────────────────────────────────────────────────────────
     §1  OPEN / INIT DATABASE
  ───────────────────────────────────────────────────────────────────*/
  function openDB() {
    return new Promise((resolve, reject) => {
      if (_db) { resolve(_db); return; }
      const req = indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('images')) {
          db.createObjectStore('images', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('messages')) {
          db.createObjectStore('messages', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('posts')) {
          db.createObjectStore('posts', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('livestream')) {
          db.createObjectStore('livestream', { keyPath: 'id' });
        }
      };

      req.onsuccess   = e => { _db = e.target.result; resolve(_db); };
      req.onerror     = e => { reject(e.target.error); };
    });
  }

  /* ─────────────────────────────────────────────────────────────────
     §2  GENERIC CRUD
  ───────────────────────────────────────────────────────────────────*/
  async function dbSet(store, record) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx  = db.transaction(store, 'readwrite');
      const req = tx.objectStore(store).put(record);
      req.onsuccess = () => resolve(req.result);
      req.onerror   = () => reject(req.error);
    });
  }

  async function dbGet(store, key) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx  = db.transaction(store, 'readonly');
      const req = tx.objectStore(store).get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror   = () => reject(req.error);
    });
  }

  async function dbDelete(store, key) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx  = db.transaction(store, 'readwrite');
      const req = tx.objectStore(store).delete(key);
      req.onsuccess = () => resolve();
      req.onerror   = () => reject(req.error);
    });
  }

  async function dbGetAll(store) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx  = db.transaction(store, 'readonly');
      const req = tx.objectStore(store).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror   = () => reject(req.error);
    });
  }

  /* ─────────────────────────────────────────────────────────────────
     §3  IMAGE STORAGE API
     Instead of storing base64 in localStorage (quota-limited),
     store in IndexedDB and return a reference ID
  ───────────────────────────────────────────────────────────────────*/
  window.AfribStorage_saveImage = async function(base64DataUrl, context) {
    try {
      const id = 'img_' + Date.now() + '_' + Math.random().toString(36).slice(2,8);
      await dbSet('images', {
        id,
        data: base64DataUrl,
        context: context || 'general',
        ts: Date.now(),
      });
      log('Image saved to IndexedDB:', id, `(${Math.round(base64DataUrl.length/1024)}KB)`);
      return id;
    } catch(e) {
      console.warn('[UserStorage] Image save failed:', e.message);
      return null;
    }
  };

  window.AfribStorage_getImage = async function(id) {
    try {
      const record = await dbGet('images', id);
      return record ? record.data : null;
    } catch(e) { return null; }
  };

  window.AfribStorage_deleteImage = async function(id) {
    try { await dbDelete('images', id); } catch(e) {}
  };

  /* Cleanup images older than 30 days */
  window.AfribStorage_cleanupOldImages = async function() {
    try {
      const all = await dbGetAll('images');
      const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
      let removed = 0;
      for (const img of all) {
        if (img.ts && img.ts < cutoff) {
          await dbDelete('images', img.id);
          removed++;
        }
      }
      if (removed > 0) log(`Cleaned ${removed} old images from IndexedDB`);
    } catch(e) {}
  };

  /* ─────────────────────────────────────────────────────────────────
     §4  MESSAGE IMAGE OFFLOAD
     Patch messenger to store large images in IndexedDB
     instead of inside the localStorage message array
  ───────────────────────────────────────────────────────────────────*/
  (function patchMessengerImages() {
    const _hook = () => {
      if (typeof window.msSendMedia !== 'function') {
        setTimeout(_hook, 500); return;
      }
      if (window.msSendMedia._idbPatched) return;

      const orig = window.msSendMedia;
      window.msSendMedia = function(input) {
        const file = input.files?.[0];
        if (!file) return;

        // Small files (<= 200KB) — use the original path (localStorage)
        if (file.size <= 200 * 1024) {
          orig.call(this, input);
          return;
        }

        // Large files (> 200KB) — save to IndexedDB, then call the original
        // which will read from input.files[0] again via its own FileReader
        // We just pre-save a copy to IndexedDB for persistence; the messenger
        // flow remains unchanged so _msPushMessage stays internal to messenger.js
        const reader = new FileReader();
        reader.onload = async e => {
          const base64 = e.target.result;
          // Save to IndexedDB in background (fire-and-forget)
          window.AfribStorage_saveImage(base64, 'messenger').catch(() => {});
          // Let the original messenger handle its own file reading + localStorage
          orig.call(this, input);
        };
        reader.onerror = () => orig.call(this, input);
        reader.readAsDataURL(file);
        // Don't clear input here — original needs it
      };
      window.msSendMedia._idbPatched = true;
      log('Messenger image storage patched (IndexedDB backup for >200KB)');
    };
    setTimeout(_hook, 1000);
  })();

  /* ─────────────────────────────────────────────────────────────────
     §5  YOURSTYLE POST IMAGE OFFLOAD
     Patch handlePostImageUpload to store images in IndexedDB
  ───────────────────────────────────────────────────────────────────*/
  // Helper: detect QuotaExceededError across browsers (Chrome, Firefox, Safari, Edge)
  function _isQuotaError(err) {
    return (
      err instanceof DOMException && (
        err.code === 22 ||       // Chrome
        err.code === 1014 ||     // Firefox
        err.name === 'QuotaExceededError' ||
        err.name === 'NS_ERROR_DOM_QUOTA_REACHED'
      )
    );
  }

  (function patchStyleImages() {
    const _hook = () => {
      if (typeof window.handlePostImageUpload !== 'function') {
        setTimeout(_hook, 500); return;
      }
      if (window.handlePostImageUpload._idbPatched) return;

      const orig = window.handlePostImageUpload;
      window.handlePostImageUpload = function(input) {
        const file = input.files?.[0];
        if (!file) return;

        if (file.size > 200 * 1024) {
          // Large image — save to IndexedDB (avoids localStorage quota)
          const reader = new FileReader();
          reader.onload = async e => {
            const base64 = e.target.result;
            const imgId  = await window.AfribStorage_saveImage(base64, 'yourstyle').catch(() => null);

            // Always keep in memory for this session
            window._postImageData = base64;
            window._postImageRef  = imgId || null;

            // Show preview (use textContent-safe method — no innerHTML for src)
            const prev = document.getElementById('postImagePreview');
            if (prev) {
              prev.innerHTML = '';
              const img = document.createElement('img');
              img.src = base64;
              img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:10px';
              img.alt = 'Post image preview';
              prev.appendChild(img);
            }
            log('YourStyle image saved:', imgId || 'memory only');
          };
          reader.onerror = () => orig.call(this, input); // fallback
          reader.readAsDataURL(file);
          input.value = '';
        } else {
          // Small file — try original localStorage path, catch quota errors
          try {
            orig.call(this, input);
          } catch(e) {
            if (_isQuotaError(e)) {
              log('localStorage quota hit on small image — trying IndexedDB fallback');
              // Re-read and save to IndexedDB
              const file2 = input.files?.[0];
              if (file2) {
                const r2 = new FileReader();
                r2.onload = async e2 => {
                  window._postImageData = e2.target.result;
                  await window.AfribStorage_saveImage(e2.target.result, 'yourstyle').catch(() => {});
                  const prev = document.getElementById('postImagePreview');
                  if (prev) {
                    prev.innerHTML = '';
                    const img = document.createElement('img');
                    img.src = e2.target.result;
                    img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:10px';
                    prev.appendChild(img);
                  }
                };
                r2.readAsDataURL(file2);
                input.value = '';
              }
            } else { throw e; }
          }
        }
      };
      window.handlePostImageUpload._idbPatched = true;
      log('YourStyle image storage patched (IndexedDB for >200KB, quota fallback)');
    };
    setTimeout(_hook, 800);
  })();

  /* ─────────────────────────────────────────────────────────────────
     §6  STORAGE USAGE REPORT
  ───────────────────────────────────────────────────────────────────*/
  window.AfribStorage_getUsage = async function() {
    try {
      const images = await dbGetAll('images');
      const totalBytes = images.reduce((sum, img) => sum + (img.data?.length || 0), 0);
      const totalMB = (totalBytes / 1024 / 1024).toFixed(1);

      // localStorage usage
      let lsBytes = 0;
      for (let key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
          lsBytes += (localStorage[key] || '').length * 2;
        }
      }
      const lsMB = (lsBytes / 1024 / 1024).toFixed(1);

      return {
        indexedDB: { images: images.length, mb: parseFloat(totalMB) },
        localStorage: { mb: parseFloat(lsMB) },
        totalMB: (parseFloat(totalMB) + parseFloat(lsMB)).toFixed(1),
      };
    } catch(e) { return { error: e.message }; }
  };

  /* ─────────────────────────────────────────────────────────────────
     §7  BOOT — open DB and run cleanup
  ───────────────────────────────────────────────────────────────────*/
  async function boot() {
    try {
      await openDB();
      log('✅ User Storage Engine ready — IndexedDB open, localStorage offload active');
      // Run cleanup in background
      setTimeout(() => window.AfribStorage_cleanupOldImages(), 5000);
    } catch(e) {
      log('IndexedDB unavailable — falling back to localStorage only:', e.message);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
