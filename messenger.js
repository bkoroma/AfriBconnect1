/* ═══════════════════════════════════════════════════════════════════════════
   AfriBConnect — MESSENGER v2.0
   Facebook Messenger–style DM system with:
   • Online presence (green dot) with user-controlled visibility toggle
   • Typing indicators (animated dots)
   • Message reactions (emoji tap / double-tap)
   • Image/media sharing with lightbox
   • Read receipts (double-tick)
   • Reply-to-message threading
   • Starred messages
   • Pinnable conversations
   • New chat composer with people search
   • Full mobile-first sliding panel UI
═══════════════════════════════════════════════════════════════════════════ */
'use strict';

/* ── Storage helpers ─────────────────────────────────────────────────── */
const _MS={
  get:(k,fb)=>{try{const v=localStorage.getItem(k);return v!==null?JSON.parse(v):fb;}catch{return fb;}},
  set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch{}},
  del:(k)=>{try{localStorage.removeItem(k);}catch{}}
};

function _msMe(){if(typeof currentUser!=='undefined'&&currentUser)return currentUser;return _MS.get('afrib_session',null);}
function _msAccounts(){try{return JSON.parse(localStorage.getItem('afrib_accounts')||'{}');}catch{return{};}}
function _msEsc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function _msConvoKey(a,b){return'ms_conv_'+[a,b].sort().join('::');}
function _msGetMessages(a,b){return _MS.get(_msConvoKey(a,b),[]);}
function _msSaveMessages(a,b,msgs){_MS.set(_msConvoKey(a,b),msgs);}
function _msGetConvos(email){return _MS.get('ms_convos_'+email,[]);}
function _msSaveConvos(email,convos){_MS.set('ms_convos_'+email,convos);}
function _msEnsureConvo(myEmail,otherEmail){
  const convos=_msGetConvos(myEmail);
  if(!convos.find(c=>c.email===otherEmail)){
    convos.unshift({email:otherEmail,ts:new Date().toISOString(),unread:0,pinned:false});
    _msSaveConvos(myEmail,convos);
  }
}

/* ── Online presence ─────────────────────────────────────────────────── */
const _PRESENCE_KEY='ms_presence';
const _PRESENCE_TTL=3*60*1000;
function _msSetOnline(email,online){
  const p=_MS.get(_PRESENCE_KEY,{});
  p[email]={ts:Date.now(),status:online?'online':'offline'};
  _MS.set(_PRESENCE_KEY,p);
}
function _msIsOnline(email){
  const p=_MS.get(_PRESENCE_KEY,{})[email];
  return p&&p.status==='online'&&(Date.now()-p.ts)<_PRESENCE_TTL;
}
function _msLastSeen(email){
  const p=_MS.get(_PRESENCE_KEY,{})[email];
  if(!p)return null;
  const d=(Date.now()-p.ts)/1000;
  if(d<60)return'just now';
  if(d<3600)return Math.floor(d/60)+'m ago';
  if(d<86400)return Math.floor(d/3600)+'h ago';
  return Math.floor(d/86400)+'d ago';
}
function _msOnlineVisible(email){
  const u=_msAccounts()[email];
  return!u||u.privacy?.showOnline!==false;
}

let _msHeartbeatTimer=null;
function _msStartHeartbeat(){
  const me=_msMe();if(!me)return;
  if(_msOnlineVisible(me.email))_msSetOnline(me.email,true);
  if(_msHeartbeatTimer)clearInterval(_msHeartbeatTimer);
  _msHeartbeatTimer=setInterval(()=>{
    const m=_msMe();
    if(m&&_msOnlineVisible(m.email))_msSetOnline(m.email,true);
  },60000);
}
function _msStopHeartbeat(){
  if(_msHeartbeatTimer){clearInterval(_msHeartbeatTimer);_msHeartbeatTimer=null;}
  const me=_msMe();if(me)_msSetOnline(me.email,false);
}
document.addEventListener('visibilitychange',()=>{if(document.hidden)_msStopHeartbeat();else _msStartHeartbeat();});
window.addEventListener('beforeunload',_msStopHeartbeat);

/* ── State ───────────────────────────────────────────────────────────── */
const _msState={view:'list',activePeer:null,replyTo:null,searchQuery:'',tab:'all'};

/* ═══════════════════════════════════════════════════════════════════════
   INJECT UI
═══════════════════════════════════════════════════════════════════════ */
function _msInject(){
  const target=
    document.getElementById('screen-messages')||
    document.getElementById('messagesScreen')||
    document.querySelector('[data-screen="messages"]');
  if(!target||target.dataset.msv2)return;
  target.dataset.msv2='1';

  target.innerHTML=`
<style>
@keyframes msTypingPulse{0%,100%{opacity:.3;transform:scale(.75)}50%{opacity:1;transform:scale(1)}}
.ms-app{display:flex;flex-direction:column;height:100%;background:var(--bg,#0D0A07);color:#fff;font-family:'DM Sans',system-ui,sans-serif;position:relative;overflow:hidden}
.ms-view{display:flex;flex-direction:column;height:100%;position:absolute;inset:0;transition:transform .28s cubic-bezier(.4,0,.2,1)}
.ms-header{display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid rgba(255,255,255,.07);background:rgba(0,0,0,.35);flex-shrink:0;position:sticky;top:0;z-index:10}
.ms-convo-item{display:flex;align-items:center;gap:12px;padding:12px 16px;cursor:pointer;border-bottom:1px solid rgba(255,255,255,.04);transition:background .15s;position:relative}
.ms-convo-item:active,.ms-convo-item:hover{background:rgba(255,255,255,.04)}
.ms-convo-item.unread{background:rgba(212,175,55,.03)}
.ms-avatar{width:50px;height:50px;border-radius:50%;background:linear-gradient(135deg,#D4AF37,#E85D26);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;color:#000;flex-shrink:0;position:relative;overflow:hidden}
.ms-avatar img{width:100%;height:100%;object-fit:cover;border-radius:50%}
.ms-online-dot{position:absolute;bottom:1px;right:1px;width:12px;height:12px;border-radius:50%;background:#22c55e;border:2px solid var(--bg,#0D0A07)}
.ms-unread-badge{background:#D4AF37;color:#000;border-radius:50%;min-width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;padding:0 4px}
.ms-bubble{max-width:72%;padding:9px 13px;border-radius:18px;font-size:14px;line-height:1.5;word-break:break-word;position:relative}
.ms-bubble.mine{background:linear-gradient(135deg,#D4AF37,#c4960a);color:#000;border-bottom-right-radius:4px}
.ms-bubble.theirs{background:rgba(255,255,255,.11);color:#fff;border-bottom-left-radius:4px}
.ms-msg-row{display:flex;margin-bottom:2px;align-items:flex-end;gap:6px}
.ms-msg-row.mine{flex-direction:row-reverse}
.ms-date-sep{text-align:center;font-size:11px;color:rgba(255,255,255,.3);padding:10px 0;flex-shrink:0;position:relative}
.ms-date-sep::before,.ms-date-sep::after{content:'';position:absolute;top:50%;height:1px;background:rgba(255,255,255,.07);width:38%}
.ms-date-sep::before{left:0}.ms-date-sep::after{right:0}
.ms-img-msg{max-width:220px;border-radius:14px;cursor:pointer;display:block;transition:.2s}
.ms-img-msg:hover{transform:scale(1.02)}
.ms-reply-quote{background:rgba(0,0,0,.25);border-left:3px solid currentColor;border-radius:4px;padding:4px 8px;margin-bottom:6px;font-size:12px;opacity:.85}
.ms-reaction-strip{display:flex;gap:3px;margin-top:3px;flex-wrap:wrap}
.ms-react-pill{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);border-radius:12px;padding:2px 7px;font-size:13px;cursor:pointer;transition:.15s;display:inline-flex;align-items:center;gap:3px}
.ms-react-pill:hover{background:rgba(255,255,255,.2)}
.ms-tab-btn{padding:5px 16px;border-radius:20px;font-size:12px;font-weight:700;cursor:pointer;transition:.2s;white-space:nowrap}
.ms-tab-btn.active{background:#D4AF37;border:none;color:#000}
.ms-tab-btn:not(.active){background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.6)}
.ms-input{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);border-radius:22px;padding:10px 14px;color:#fff;font-size:14px;outline:none;transition:border-color .2s;font-family:inherit}
.ms-input:focus{border-color:rgba(212,175,55,.5)}
.ms-icon-btn{padding:8px 10px;border-radius:12px;border:none;font-size:16px;cursor:pointer;transition:.2s;display:flex;align-items:center;justify-content:center}
.ms-send-btn{width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#D4AF37,#b8901f);border:none;color:#000;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;font-weight:900;box-shadow:0 4px 16px rgba(212,175,55,.35);flex-shrink:0;transition:.2s}
.ms-typing-dot{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.5);display:inline-block;animation:msTypingPulse .9s ease-in-out infinite}
</style>

<div class="ms-app" id="msApp">

  <!-- LIST VIEW -->
  <div class="ms-view" id="msListView" style="transform:translateX(0);background:var(--bg,#0D0A07)">
    <div class="ms-header">
      <div style="font-size:20px;font-weight:900;color:#D4AF37;flex:1">💬 Messages</div>
      <button id="msOnlineToggle" onclick="msToggleOnline()"
        style="background:rgba(34,197,94,.15);border:1px solid rgba(34,197,94,.3);border-radius:20px;padding:5px 12px;font-size:12px;font-weight:700;color:#22c55e;cursor:pointer;display:flex;align-items:center;gap:5px">
        <span id="msOnlineDot" style="width:8px;height:8px;border-radius:50%;background:#22c55e;display:inline-block"></span>
        <span id="msOnlineLbl">Online</span>
      </button>
      <button onclick="msOpenNewChat()" class="ms-send-btn" style="background:linear-gradient(135deg,#D4AF37,#b8901f);width:36px;height:36px;font-size:20px;margin-left:6px" title="New message">✏</button>
    </div>
    <!-- Search -->
    <div style="padding:8px 16px;flex-shrink:0">
      <div style="position:relative">
        <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:14px;color:rgba(255,255,255,.3);pointer-events:none">🔍</span>
        <input class="ms-input" id="msSearchInput" placeholder="Search conversations…"
          oninput="msSearchConvos(this.value)"
          style="width:100%;padding-left:36px;border-radius:24px"/>
      </div>
    </div>
    <!-- Tabs -->
    <div style="display:flex;gap:8px;padding:0 16px 10px;flex-shrink:0">
      <button class="ms-tab-btn active" id="msTab_all"    onclick="msSetTab('all')">All</button>
      <button class="ms-tab-btn"        id="msTab_unread" onclick="msSetTab('unread')">Unread</button>
      <button class="ms-tab-btn"        id="msTab_online" onclick="msSetTab('online')">🟢 Online</button>
    </div>
    <!-- Convo list -->
    <div id="msConvoList" style="flex:1;overflow-y:auto;padding-bottom:80px"></div>
  </div>

  <!-- CHAT VIEW -->
  <div class="ms-view" id="msChatView" style="transform:translateX(100%);display:none">
    <!-- Chat header -->
    <div class="ms-header" id="msChatHeader">
      <button onclick="msBackToList()" style="background:none;border:none;color:rgba(255,255,255,.7);font-size:22px;cursor:pointer;padding:4px;flex-shrink:0">←</button>
      <div id="msChatAvatar" style="flex-shrink:0"></div>
      <div style="flex:1;min-width:0">
        <div id="msChatName" style="font-weight:800;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"></div>
        <div id="msChatStatus" style="font-size:11px;color:#22c55e"></div>
      </div>
      <div style="display:flex;gap:5px">
        <button onclick="msStartVoiceCall()" class="ms-icon-btn" style="background:rgba(34,197,94,.15);color:#22c55e">📞</button>
        <button onclick="msStartVideoCall()" class="ms-icon-btn" style="background:rgba(59,130,246,.15);color:#60a5fa">📹</button>
        <button onclick="msChatMenu()" class="ms-icon-btn" style="background:rgba(255,255,255,.08);color:rgba(255,255,255,.7)">⋯</button>
      </div>
    </div>
    <!-- Messages -->
    <div id="msMsgArea" style="flex:1;overflow-y:auto;padding:12px 14px 6px;display:flex;flex-direction:column;gap:1px;scroll-behavior:smooth"></div>
    <!-- Typing -->
    <div id="msTypingRow" style="display:none;padding:3px 16px;flex-shrink:0;height:22px">
      <span id="msTypingTxt" style="font-size:12px;color:rgba(255,255,255,.4)"></span>
      <span style="display:inline-flex;gap:3px;margin-left:5px;vertical-align:middle">
        <span class="ms-typing-dot"></span>
        <span class="ms-typing-dot" style="animation-delay:.2s"></span>
        <span class="ms-typing-dot" style="animation-delay:.4s"></span>
      </span>
    </div>
    <!-- Reply bar -->
    <div id="msReplyBar" style="display:none;margin:0 12px;padding:7px 12px;background:rgba(212,175,55,.1);border-left:3px solid #D4AF37;border-radius:0 8px 8px 0;align-items:center;gap:8px;flex-shrink:0">
      <div style="flex:1;min-width:0">
        <div id="msReplyName" style="font-weight:700;color:#D4AF37;font-size:12px;margin-bottom:1px"></div>
        <div id="msReplyTxt" style="font-size:12px;color:rgba(255,255,255,.6);white-space:nowrap;overflow:hidden;text-overflow:ellipsis"></div>
      </div>
      <button onclick="msClearReply()" style="background:none;border:none;color:rgba(255,255,255,.4);font-size:16px;cursor:pointer">✕</button>
    </div>
    <!-- Input -->
    <div style="display:flex;align-items:flex-end;gap:7px;padding:9px 12px;border-top:1px solid rgba(255,255,255,.07);background:rgba(0,0,0,.4);flex-shrink:0">
      <label class="ms-icon-btn" style="background:rgba(255,255,255,.07);cursor:pointer;padding:9px" title="Attach">
        📎<input type="file" id="msFileInput" accept="image/*,video/*" style="display:none" onchange="msSendMedia(this)"/>
      </label>
      <button onclick="msToggleEmoji()" class="ms-icon-btn" style="background:rgba(255,255,255,.07)">😊</button>
      <textarea id="msChatTextInput" class="ms-input" placeholder="Aa" rows="1"
        style="flex:1;resize:none;max-height:100px;padding:9px 13px;line-height:1.45;overflow-y:hidden"
        oninput="msHandleTyping(this)"
        onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();msSend()}"></textarea>
      <button class="ms-send-btn" onclick="msSend()">➤</button>
    </div>
    <!-- Emoji picker -->
    <div id="msEmojiPicker" style="display:none;padding:8px 14px;background:rgba(0,0,0,.6);border-top:1px solid rgba(255,255,255,.07);flex-shrink:0">
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        ${['❤️','😂','😍','🔥','🎉','👏','😭','🙏','😊','💯','✨','😅','🤩','💕','🙌','😎','🤔','💪','🌍','👍','🫶','🥰','😘','👀','🤣'].map(e=>`<span onclick="msInsertEmoji('${e}')" style="font-size:22px;cursor:pointer;padding:3px;border-radius:6px;transition:.1s" onmouseover="this.style.background='rgba(255,255,255,.1)'" onmouseout="this.style.background=''">${e}</span>`).join('')}
      </div>
    </div>
  </div>

  <!-- NEW CHAT VIEW -->
  <div class="ms-view" id="msNewView" style="transform:translateX(100%);display:none">
    <div class="ms-header">
      <button onclick="msCloseNewChat()" style="background:none;border:none;color:rgba(255,255,255,.7);font-size:22px;cursor:pointer">←</button>
      <div style="font-size:17px;font-weight:800">New Message</div>
    </div>
    <div style="padding:10px 16px;flex-shrink:0">
      <input class="ms-input" id="msNewSearch" style="width:100%;border-radius:24px" placeholder="Search people by name or @username…" oninput="msSearchPeople(this.value)"/>
    </div>
    <div id="msNewList" style="flex:1;overflow-y:auto;padding-bottom:60px"></div>
  </div>

  <!-- LIGHTBOX -->
  <div id="msLightbox" onclick="msCloseLightbox()" style="display:none;position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.95);align-items:center;justify-content:center">
    <img id="msLbImg" style="max-width:94vw;max-height:90vh;object-fit:contain;border-radius:8px"/>
    <button onclick="msCloseLightbox()" style="position:absolute;top:16px;right:16px;background:rgba(255,255,255,.15);border:none;color:#fff;border-radius:50%;width:40px;height:40px;font-size:20px;cursor:pointer">✕</button>
  </div>
</div>`;

  _msRenderInit();
}

/* ── Init ─────────────────────────────────────────────────────────────── */
function _msRenderInit(){
  const me=_msMe();if(!me)return;
  _msUpdateOnlineToggle(_msOnlineVisible(me.email));
  _msStartHeartbeat();
  _msRenderConvoList();
}

/* ── Online toggle ────────────────────────────────────────────────────── */
window.msToggleOnline=function(){
  const me=_msMe();if(!me)return;
  const accs=_msAccounts();
  const user=accs[me.email];if(!user)return;
  user.privacy=user.privacy||{};
  user.privacy.showOnline=user.privacy.showOnline===false?true:false;
  accs[me.email]=user;
  try{localStorage.setItem('afrib_accounts',JSON.stringify(accs));}catch{}
  if(user.privacy.showOnline){_msStartHeartbeat();}else{_msSetOnline(me.email,false);}
  _msUpdateOnlineToggle(user.privacy.showOnline);
  if(typeof showToast==='function')showToast(user.privacy.showOnline?'🟢 You appear Online':'⚫ You appear Invisible');
};

function _msUpdateOnlineToggle(vis){
  const dot=document.getElementById('msOnlineDot');
  const lbl=document.getElementById('msOnlineLbl');
  const btn=document.getElementById('msOnlineToggle');
  if(!dot||!lbl||!btn)return;
  if(vis){dot.style.background='#22c55e';lbl.textContent='Online';btn.style.cssText+='background:rgba(34,197,94,.15);border-color:rgba(34,197,94,.3);color:#22c55e';}
  else{dot.style.background='#6b7280';lbl.textContent='Invisible';btn.style.cssText+='background:rgba(107,114,128,.15);border-color:rgba(107,114,128,.3);color:#9ca3af';}
}

/* ── Convo list ────────────────────────────────────────────────────────── */
window.msSetTab=function(tab){
  _msState.tab=tab;
  ['all','unread','online'].forEach(t=>{
    const b=document.getElementById('msTab_'+t);if(!b)return;
    if(t===tab){b.className='ms-tab-btn active';}else{b.className='ms-tab-btn';}
  });
  _msRenderConvoList();
};

window.msSearchConvos=function(q){_msState.searchQuery=q;_msRenderConvoList();};

function _msRenderConvoList(){
  const me=_msMe();
  const el=document.getElementById('msConvoList');
  if(!el||!me)return;
  const accs=_msAccounts();
  let convos=_msGetConvos(me.email);
  const q=(_msState.searchQuery||'').toLowerCase().trim();

  const enriched=convos.map(c=>{
    const peer=accs[c.email]||{first:'Unknown',last:'',email:c.email};
    const msgs=_msGetMessages(me.email,c.email);
    const last=msgs[msgs.length-1]||null;
    const unread=msgs.filter(m=>m.to===me.email&&!m.read).length;
    return{...c,peer,last,unread};
  });

  let filtered=enriched;
  if(_msState.tab==='unread')filtered=enriched.filter(c=>c.unread>0);
  if(_msState.tab==='online')filtered=enriched.filter(c=>_msIsOnline(c.email)&&_msOnlineVisible(c.email));
  if(q)filtered=filtered.filter(c=>{
    const n=((c.peer.first||'')+' '+(c.peer.last||'')).toLowerCase();
    const u=(c.peer.username||'').toLowerCase();
    const p=(c.last?.text||'').toLowerCase();
    return n.includes(q)||u.includes(q)||p.includes(q);
  });

  filtered.sort((a,b)=>{
    if(a.pinned&&!b.pinned)return-1;if(!a.pinned&&b.pinned)return 1;
    const ta=a.last?.ts||a.ts||'';const tb=b.last?.ts||b.ts||'';
    return tb>ta?1:-1;
  });

  if(!filtered.length){
    el.innerHTML=`<div style="text-align:center;padding:60px 20px;color:rgba(255,255,255,.3)">
      <div style="font-size:44px;margin-bottom:12px">💬</div>
      <div style="font-size:15px;font-weight:600;margin-bottom:6px">No messages yet</div>
      <div style="font-size:13px">Tap ✏ to start a conversation</div>
    </div>`;return;
  }

  el.innerHTML=filtered.map(c=>{
    const p=c.peer;
    const init=((p.first||'U')[0]+(p.last||'')[0]).toUpperCase();
    const online=_msIsOnline(c.email)&&_msOnlineVisible(c.email);
    const last=c.last;
    const time=last?_msFmtTime(last.ts):'';
    const preview=last?(last.image?'📷 Photo':last.text||''):'Say hello!';
    const unread=c.unread;
    return`<div class="ms-convo-item${unread>0?' unread':''}"
        onclick="msOpenChat('${_msEsc(c.email)}')"
        oncontextmenu="msConvoCtx(event,'${_msEsc(c.email)}');return false">
      <div class="ms-avatar" style="position:relative">
        ${p.avatar?`<img src="${_msEsc(p.avatar)}"/>`:`<span>${init}</span>`}
        ${online?'<div class="ms-online-dot"></div>':''}
      </div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px">
          <div style="font-weight:700;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1">${_msEsc((p.first||'')+' '+(p.last||''))}${c.pinned?' 📌':''}</div>
          <div style="font-size:11px;color:rgba(255,255,255,.3);flex-shrink:0;margin-left:8px">${time}</div>
        </div>
        <div style="display:flex;align-items:center;gap:6px">
          <div style="font-size:12px;color:${unread>0?'rgba(255,255,255,.85)':'rgba(255,255,255,.4)'};font-weight:${unread>0?700:400};flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${_msEsc(preview)}</div>
          ${unread>0?`<span class="ms-unread-badge">${unread>99?'99+':unread}</span>`:''}
        </div>
      </div>
    </div>`;
  }).join('');
}

window.msConvoCtx=function(e,peerEmail){
  e.preventDefault();
  const me=_msMe();if(!me)return;
  const convos=_msGetConvos(me.email);
  const c=convos.find(x=>x.email===peerEmail);
  document.getElementById('msMsgMenu')?.remove();
  const m=document.createElement('div');
  m.id='msMsgMenu';
  m.style.cssText=`position:fixed;top:${e.clientY}px;left:${e.clientX}px;z-index:9000;background:#1a1614;border:1px solid rgba(255,255,255,.12);border-radius:12px;overflow:hidden;min-width:180px;box-shadow:0 12px 40px rgba(0,0,0,.6)`;
  m.innerHTML=[
    {icon:c?.pinned?'📌':'📌',label:c?.pinned?'Unpin':'Pin Chat',fn:`msTogglePin('${peerEmail}')`},
    {icon:'🗑',label:'Delete Chat',fn:`msDeleteConvo('${peerEmail}')`,danger:true}
  ].map(item=>`<div onclick="${item.fn};document.getElementById('msMsgMenu').remove()" style="padding:12px 16px;cursor:pointer;font-size:14px;font-weight:600;color:${item.danger?'#f87171':'#fff'};display:flex;align-items:center;gap:10px" onmouseover="this.style.background='rgba(255,255,255,.07)'" onmouseout="this.style.background=''">${item.icon} ${item.label}</div>`).join('');
  document.body.appendChild(m);
  setTimeout(()=>document.addEventListener('click',()=>m.remove(),{once:true}),50);
};

window.msTogglePin=function(peer){
  const me=_msMe();if(!me)return;
  const c=_msGetConvos(me.email);
  const i=c.find(x=>x.email===peer);if(i)i.pinned=!i.pinned;
  _msSaveConvos(me.email,c);_msRenderConvoList();
};
window.msDeleteConvo=function(peer){
  if(!confirm('Delete this conversation?'))return;
  const me=_msMe();if(!me)return;
  _msSaveConvos(me.email,_msGetConvos(me.email).filter(c=>c.email!==peer));
  _MS.del(_msConvoKey(me.email,peer));
  _msRenderConvoList();
};

/* ── Open chat ──────────────────────────────────────────────────────────── */
window.msOpenChat=function(peerEmail){
  const me=_msMe();if(!me)return;
  _msState.activePeer=peerEmail;
  _msState.replyTo=null;

  const lv=document.getElementById('msListView');
  const cv=document.getElementById('msChatView');
  if(!lv||!cv)return;

  cv.style.display='flex';
  requestAnimationFrame(()=>{
    cv.style.transform='translateX(0)';
    lv.style.opacity='0';lv.style.pointerEvents='none';
  });
  setTimeout(()=>{lv.style.display='none';lv.style.opacity='1';lv.style.pointerEvents='';},300);

  _msMarkRead(me.email,peerEmail);

  const accs=_msAccounts();
  const peer=accs[peerEmail]||{first:'Unknown',last:'',email:peerEmail};
  const init=((peer.first||'U')[0]+(peer.last||'')[0]).toUpperCase();
  const online=_msIsOnline(peerEmail)&&_msOnlineVisible(peerEmail);
  const lastSeen=_msLastSeen(peerEmail);

  const nameEl=document.getElementById('msChatName');
  const stEl=document.getElementById('msChatStatus');
  const avEl=document.getElementById('msChatAvatar');
  if(nameEl)nameEl.textContent=(peer.first||'')+' '+(peer.last||'');
  if(stEl){
    if(online){stEl.textContent='● Online';stEl.style.color='#22c55e';}
    else{stEl.textContent=lastSeen?`Last seen ${lastSeen}`:'Offline';stEl.style.color='rgba(255,255,255,.4)';}
  }
  if(avEl){
    avEl.innerHTML=`<div class="ms-avatar" style="width:40px;height:40px;font-size:14px">
      ${peer.avatar?`<img src="${_msEsc(peer.avatar)}"/>`:`<span>${init}</span>`}
      ${online?'<div class="ms-online-dot"></div>':''}
    </div>`;
  }

  _msEnsureConvo(me.email,peerEmail);
  _msEnsureConvo(peerEmail,me.email);
  _msRenderMessages();
  msClearReply();

  setTimeout(()=>document.getElementById('msChatTextInput')?.focus(),350);
  _msStartTypingPoll();
};

window.msBackToList=function(){
  const lv=document.getElementById('msListView');
  const cv=document.getElementById('msChatView');
  if(!lv||!cv)return;
  cv.style.transform='translateX(100%)';
  setTimeout(()=>{cv.style.display='none';lv.style.display='flex';},300);
  _msState.activePeer=null;
  _msStopTypingPoll();
  msClearReply();
  _msRenderConvoList();
};

/* ── Render messages ──────────────────────────────────────────────────── */
function _msRenderMessages(){
  const me=_msMe();
  const area=document.getElementById('msMsgArea');
  if(!area||!me||!_msState.activePeer)return;
  const msgs=_msGetMessages(me.email,_msState.activePeer);
  if(!msgs.length){
    area.innerHTML=`<div style="text-align:center;padding:60px 20px;color:rgba(255,255,255,.3)"><div style="font-size:36px;margin-bottom:8px">👋</div><div>Say hello!</div></div>`;
    return;
  }

  const peerAcct=_msAccounts()[_msState.activePeer]||{};
  let html='';let lastDate='';

  msgs.forEach(msg=>{
    const isMine=msg.from===me.email;
    const dl=_msDayLabel(msg.ts);
    if(dl!==lastDate){html+=`<div class="ms-date-sep">${dl}</div>`;lastDate=dl;}

    const time=_msTimeOnly(msg.ts);
    const ticks=isMine?(msg.read?'<span style="color:#22c55e;font-size:11px;margin-left:3px">✓✓</span>':'<span style="font-size:11px;margin-left:3px;opacity:.6">✓</span>'):'';
    const reactions=msg.reactions||{};
    const reactHTML=Object.keys(reactions).length?
      `<div class="ms-reaction-strip" style="${isMine?'justify-content:flex-end':''}">
        ${Object.entries(reactions).map(([e,users])=>`<span class="ms-react-pill" onclick="msAddReaction('${msg.id}','${e}')" title="${users.join(', ')}">${e} ${users.length}</span>`).join('')}
      </div>`:'';

    const replyHTML=msg.replyTo?`<div class="ms-reply-quote">
      <div style="font-weight:700;font-size:11px;margin-bottom:2px">${_msEsc(msg.replyTo.fromName||'')}</div>
      <div style="opacity:.7">${_msEsc((msg.replyTo.text||'📷 Photo').slice(0,80))}</div>
    </div>`:'';

    let body='';
    if(msg.image){
      body=`<img src="${msg.image}" class="ms-img-msg" onclick="msOpenLightbox('${msg.id}')" alt="Photo"/>`;
      if(msg.text)body+=`<div style="margin-top:4px">${_msEsc(msg.text)}</div>`;
    }else{
      body=_msEsc(msg.text||'');
    }

    const peerInit=((peerAcct.first||'U')[0]+(peerAcct.last||'')[0]).toUpperCase();
    const peerAvatar=peerAcct.avatar
      ?`<img src="${_msEsc(peerAcct.avatar)}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
      :peerInit;

    html+=`<div class="ms-msg-row ${isMine?'mine':'theirs'}" id="msg_${msg.id}"
        ondblclick="msQuickReact('${msg.id}')"
        oncontextmenu="msMsgCtx(event,'${msg.id}');return false">
      ${!isMine?`<div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#D4AF37,#E85D26);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#000;flex-shrink:0;overflow:hidden">${peerAvatar}</div>`:''}
      <div style="display:flex;flex-direction:column;align-items:${isMine?'flex-end':'flex-start'};max-width:72%">
        <div class="ms-bubble ${isMine?'mine':'theirs'}"${msg.starred?' style="border:1.5px solid rgba(212,175,55,.6)"':''}>
          ${replyHTML}${body}
          <div style="font-size:10px;color:${isMine?'rgba(0,0,0,.4)':'rgba(255,255,255,.3)'};margin-top:3px;text-align:right">
            ${time}${ticks}${msg.starred?' ⭐':''}
          </div>
        </div>
        ${reactHTML}
      </div>
    </div>`;
  });

  area.innerHTML=html;
  area.scrollTop=area.scrollHeight;
}

/* ── Send ──────────────────────────────────────────────────────────────── */
window.msSend=function(){
  const me=_msMe();const peer=_msState.activePeer;if(!me||!peer)return;
  const inp=document.getElementById('msChatTextInput');
  const text=(inp?.value||'').trim();if(!text)return;
  _msPushMessage(me,peer,{text});
  if(inp){inp.value='';inp.style.height='auto';}
  msClearReply();
  _MS.del('ms_typing_'+me.email+'_'+peer);
};

window.msSendMedia=function(input){
  const file=input.files[0];if(!file)return;
  const me=_msMe();const peer=_msState.activePeer;if(!me||!peer)return;
  const r=new FileReader();
  r.onload=e=>_msPushMessage(me,peer,{image:e.target.result,text:''});
  r.readAsDataURL(file);input.value='';
};

function _msPushMessage(me,peer,data){
  const msgs=_msGetMessages(me.email,peer);
  const id='ms_'+Date.now()+'_'+Math.random().toString(36).slice(2,6);
  const accs=_msAccounts();
  const msg={
    id,from:me.email,to:peer,
    text:data.text||'',image:data.image||null,
    ts:new Date().toISOString(),read:false,reactions:{},starred:false,
    replyTo:_msState.replyTo?{
      id:_msState.replyTo.id,
      fromName:_msState.replyTo.from===me.email
        ?(me.first||'You')
        :((accs[peer]?.first||'')+' '+(accs[peer]?.last||'')).trim(),
      text:_msState.replyTo.text,image:_msState.replyTo.image
    }:null
  };
  msgs.push(msg);
  _msSaveMessages(me.email,peer,msgs);

  _msEnsureConvo(me.email,peer);
  const mc=_msGetConvos(me.email);
  const ci=mc.find(x=>x.email===peer);
  if(ci){ci.ts=msg.ts;ci.lastText=msg.text||'📷 Photo';}
  _msSaveConvos(me.email,mc);

  _msEnsureConvo(peer,me.email);
  const pc=_msGetConvos(peer);
  const pi2=pc.find(x=>x.email===me.email);
  if(pi2){pi2.ts=msg.ts;pi2.lastText=msg.text||'📷 Photo';pi2.unread=(pi2.unread||0)+1;}
  _msSaveConvos(peer,pc);

  if(typeof addNotification==='function'){
    addNotification(peer,{type:'message',from:me.email,fromName:(me.first||'')+' '+(me.last||''),preview:msg.text?msg.text.slice(0,60):'📷 Photo',ts:msg.ts});
  }
  _msState.replyTo=null;
  _msRenderMessages();
}

function _msMarkRead(myEmail,peerEmail){
  const msgs=_msGetMessages(myEmail,peerEmail);
  let changed=false;
  msgs.forEach(m=>{if(m.to===myEmail&&!m.read){m.read=true;changed=true;}});
  if(changed){
    _msSaveMessages(myEmail,peerEmail,msgs);
    const c=_msGetConvos(myEmail);
    const ci=c.find(x=>x.email===peerEmail);
    if(ci)ci.unread=0;
    _msSaveConvos(myEmail,c);
  }
}

/* ── Typing ─────────────────────────────────────────────────────────────── */
let _msTypingTO=null;
let _msTypingPollTO=null;

window.msHandleTyping=function(el){
  el.style.height='auto';el.style.height=Math.min(el.scrollHeight,100)+'px';
  const me=_msMe();const peer=_msState.activePeer;if(!me||!peer)return;
  _MS.set('ms_typing_'+me.email+'_'+peer,Date.now());
  if(_msTypingTO)clearTimeout(_msTypingTO);
  _msTypingTO=setTimeout(()=>_MS.del('ms_typing_'+me.email+'_'+peer),3500);
};

function _msStartTypingPoll(){
  _msStopTypingPoll();
  _msTypingPollTO=setInterval(()=>{
    const me=_msMe();const peer=_msState.activePeer;if(!me||!peer)return;
    const ts=_MS.get('ms_typing_'+peer+'_'+me.email,null);
    const typing=ts&&(Date.now()-ts)<4500;
    const row=document.getElementById('msTypingRow');
    const txt=document.getElementById('msTypingTxt');
    if(!row)return;
    const accs=_msAccounts();
    const pName=accs[peer]?.first||'They';
    if(typing){row.style.display='block';if(txt)txt.textContent=pName+' is typing';}
    else{row.style.display='none';}
  },800);
}
function _msStopTypingPoll(){if(_msTypingPollTO){clearInterval(_msTypingPollTO);_msTypingPollTO=null;}}

/* ── Reactions ──────────────────────────────────────────────────────────── */
window.msAddReaction=function(msgId,emoji){
  const me=_msMe();if(!me)return;
  const peer=_msState.activePeer;if(!peer)return;
  const msgs=_msGetMessages(me.email,peer);
  const msg=msgs.find(m=>m.id===msgId);if(!msg)return;
  msg.reactions=msg.reactions||{};
  msg.reactions[emoji]=msg.reactions[emoji]||[];
  const idx=msg.reactions[emoji].indexOf(me.email);
  if(idx>-1){msg.reactions[emoji].splice(idx,1);if(!msg.reactions[emoji].length)delete msg.reactions[emoji];}
  else msg.reactions[emoji].push(me.email);
  _msSaveMessages(me.email,peer,msgs);
  _msRenderMessages();
};

window.msQuickReact=function(msgId){
  const el=document.getElementById('msg_'+msgId);if(!el)return;
  const r=el.getBoundingClientRect();
  document.getElementById('msReactPicker')?.remove();
  const picker=document.createElement('div');
  picker.id='msReactPicker';
  picker.style.cssText=`position:fixed;top:${r.top-58}px;left:${Math.min(r.left,window.innerWidth-280)}px;z-index:8000;background:#1a1614;border:1px solid rgba(255,255,255,.12);border-radius:40px;padding:8px 12px;display:flex;gap:8px;box-shadow:0 8px 32px rgba(0,0,0,.6)`;
  picker.innerHTML=['❤️','😂','😮','😢','😡','👍','🔥'].map(e=>
    `<span onclick="msAddReaction('${msgId}','${e}');document.getElementById('msReactPicker').remove()" style="font-size:26px;cursor:pointer;transition:.15s;padding:2px" onmouseover="this.style.transform='scale(1.3)'" onmouseout="this.style.transform=''">${e}</span>`
  ).join('');
  document.body.appendChild(picker);
  setTimeout(()=>document.addEventListener('click',()=>picker.remove(),{once:true}),50);
};

/* ── Message context menu ────────────────────────────────────────────────── */
window.msMsgCtx=function(e,msgId){
  e.preventDefault();
  const me=_msMe();if(!me)return;
  const peer=_msState.activePeer;if(!peer)return;
  const msgs=_msGetMessages(me.email,peer);
  const msg=msgs.find(m=>m.id===msgId);if(!msg)return;
  const isMine=msg.from===me.email;
  document.getElementById('msMsgCtxMenu')?.remove();
  const menu=document.createElement('div');
  menu.id='msMsgCtxMenu';
  menu.style.cssText=`position:fixed;top:${Math.min(e.clientY,window.innerHeight-220)}px;left:${Math.min(e.clientX,window.innerWidth-200)}px;z-index:9000;background:#1a1614;border:1px solid rgba(255,255,255,.12);border-radius:12px;overflow:hidden;min-width:185px;box-shadow:0 12px 40px rgba(0,0,0,.6)`;
  const items=[
    {icon:'😊',label:'React',fn:`msQuickReact('${msgId}')`},
    {icon:'↩️',label:'Reply',fn:`msReplyTo('${msgId}')`},
    {icon:'📋',label:'Copy text',fn:`msCopyMsg('${msgId}')`},
    {icon:msg.starred?'⭐':'☆',label:msg.starred?'Unstar':'Star',fn:`msToggleStar('${msgId}')`},
    ...(isMine?[{icon:'🗑',label:'Delete',fn:`msDeleteMsg('${msgId}')`,danger:true}]:[])
  ];
  menu.innerHTML=items.map(i=>`<div onclick="${i.fn};document.getElementById('msMsgCtxMenu').remove()" style="padding:12px 16px;cursor:pointer;font-size:14px;color:${i.danger?'#f87171':'#fff'};font-weight:600;display:flex;align-items:center;gap:10px" onmouseover="this.style.background='rgba(255,255,255,.07)'" onmouseout="this.style.background=''">${i.icon} ${i.label}</div>`).join('');
  document.body.appendChild(menu);
  setTimeout(()=>document.addEventListener('click',()=>menu.remove(),{once:true}),50);
};

window.msReplyTo=function(msgId){
  const me=_msMe();if(!me)return;
  const peer=_msState.activePeer;if(!peer)return;
  const msgs=_msGetMessages(me.email,peer);
  const msg=msgs.find(m=>m.id===msgId);if(!msg)return;
  _msState.replyTo=msg;
  const accs=_msAccounts();
  const fromName=msg.from===me.email?(me.first||'You'):((accs[peer]?.first||'')+' '+(accs[peer]?.last||'')).trim();
  const bar=document.getElementById('msReplyBar');
  const nm=document.getElementById('msReplyName');
  const tx=document.getElementById('msReplyTxt');
  if(bar)bar.style.display='flex';
  if(nm)nm.textContent=fromName;
  if(tx)tx.textContent=msg.text||(msg.image?'📷 Photo':'');
  document.getElementById('msChatTextInput')?.focus();
};
window.msClearReply=function(){
  _msState.replyTo=null;
  const bar=document.getElementById('msReplyBar');if(bar)bar.style.display='none';
};
window.msCopyMsg=function(msgId){
  const me=_msMe();if(!me)return;
  const peer=_msState.activePeer;if(!peer)return;
  const msg=_msGetMessages(me.email,peer).find(m=>m.id===msgId);
  if(!msg||!msg.text)return;
  navigator.clipboard?.writeText(msg.text).then(()=>{if(typeof showToast==='function')showToast('📋 Copied!');});
};
window.msToggleStar=function(msgId){
  const me=_msMe();if(!me)return;
  const peer=_msState.activePeer;if(!peer)return;
  const msgs=_msGetMessages(me.email,peer);
  const msg=msgs.find(m=>m.id===msgId);if(!msg)return;
  msg.starred=!msg.starred;
  _msSaveMessages(me.email,peer,msgs);_msRenderMessages();
};
window.msDeleteMsg=function(msgId){
  const me=_msMe();if(!me)return;
  const peer=_msState.activePeer;if(!peer)return;
  _msSaveMessages(me.email,peer,_msGetMessages(me.email,peer).filter(m=>m.id!==msgId));
  _msRenderMessages();
};

/* ── Emoji picker ────────────────────────────────────────────────────────── */
window.msToggleEmoji=function(){
  const el=document.getElementById('msEmojiPicker');if(!el)return;
  el.style.display=el.style.display==='none'?'flex':'none';
  el.style.flexWrap='wrap';
};
window.msInsertEmoji=function(e){
  const inp=document.getElementById('msChatTextInput');if(!inp)return;
  const p=inp.selectionStart||inp.value.length;
  inp.value=inp.value.slice(0,p)+e+inp.value.slice(p);
  inp.focus();inp.selectionStart=inp.selectionEnd=p+e.length;
};

/* ── Lightbox ────────────────────────────────────────────────────────────── */
window.msOpenLightbox=function(msgId){
  const me=_msMe();if(!me)return;
  const peer=_msState.activePeer;if(!peer)return;
  const msg=_msGetMessages(me.email,peer).find(m=>m.id===msgId);
  if(!msg||!msg.image)return;
  const lb=document.getElementById('msLightbox');
  const img=document.getElementById('msLbImg');
  if(!lb||!img)return;
  img.src=msg.image;lb.style.display='flex';
};
window.msCloseLightbox=function(){const lb=document.getElementById('msLightbox');if(lb)lb.style.display='none';};

/* ── New chat ────────────────────────────────────────────────────────────── */
window.msOpenNewChat=function(){
  const lv=document.getElementById('msListView');
  const nv=document.getElementById('msNewView');
  if(!lv||!nv)return;
  nv.style.display='flex';
  requestAnimationFrame(()=>nv.style.transform='translateX(0)');
  lv.style.display='none';
  msSearchPeople('');
  setTimeout(()=>document.getElementById('msNewSearch')?.focus(),350);
};
window.msCloseNewChat=function(){
  const lv=document.getElementById('msListView');
  const nv=document.getElementById('msNewView');
  if(!nv||!lv)return;
  nv.style.transform='translateX(100%)';
  setTimeout(()=>{nv.style.display='none';},300);
  lv.style.display='flex';
};
window.msSearchPeople=function(q){
  const me=_msMe();if(!me)return;
  const list=document.getElementById('msNewList');if(!list)return;
  const accs=_msAccounts();
  const query=(q||'').toLowerCase().trim();
  const users=Object.values(accs)
    .filter(u=>u.email!==me.email&&u.status!=='banned')
    .filter(u=>{
      if(!query)return true;
      const n=((u.first||'')+' '+(u.last||'')).toLowerCase();
      const un=(u.username||'').toLowerCase();
      return n.includes(query)||un.includes(query)||(u.email||'').toLowerCase().includes(query);
    }).slice(0,40);

  if(!users.length){list.innerHTML=`<div style="text-align:center;padding:40px;color:rgba(255,255,255,.3)"><div style="font-size:32px;margin-bottom:8px">🔍</div>No users found</div>`;return;}
  list.innerHTML=users.map(u=>{
    const init=((u.first||'U')[0]+(u.last||'')[0]).toUpperCase();
    const online=_msIsOnline(u.email)&&_msOnlineVisible(u.email);
    return`<div onclick="msStartNewChat('${_msEsc(u.email)}')"
      style="display:flex;align-items:center;gap:12px;padding:12px 16px;cursor:pointer;border-bottom:1px solid rgba(255,255,255,.04);transition:.15s"
      onmouseover="this.style.background='rgba(255,255,255,.04)'" onmouseout="this.style.background=''">
      <div class="ms-avatar" style="width:46px;height:46px;font-size:16px;position:relative">
        ${u.avatar?`<img src="${_msEsc(u.avatar)}"/>`:`<span>${init}</span>`}
        ${online?'<div class="ms-online-dot"></div>':''}
      </div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;font-size:14px">${_msEsc((u.first||'')+' '+(u.last||''))}</div>
        <div style="font-size:12px;color:rgba(255,255,255,.4)">${u.username?'@'+_msEsc(u.username):''}${online?` · <span style="color:#22c55e">Online</span>`:''}</div>
      </div>
      <span style="font-size:18px;color:rgba(255,255,255,.25)">→</span>
    </div>`;
  }).join('');
};
window.msStartNewChat=function(peer){msCloseNewChat();setTimeout(()=>msOpenChat(peer),320);};

/* ── Chat menu ───────────────────────────────────────────────────────────── */
window.msChatMenu=function(){
  const peer=_msState.activePeer;if(!peer)return;
  const accs=_msAccounts();const p=accs[peer]||{first:'User',last:''};
  document.getElementById('msChatMenuSheet')?.remove();
  const s=document.createElement('div');
  s.id='msChatMenuSheet';
  s.style.cssText='position:fixed;bottom:0;left:0;right:0;z-index:9000;background:#1a1614;border-top:1px solid rgba(255,255,255,.1);border-radius:20px 20px 0 0;padding:20px 16px 30px;box-shadow:0 -20px 60px rgba(0,0,0,.7)';
  s.innerHTML=`<div style="width:40px;height:4px;border-radius:4px;background:rgba(255,255,255,.2);margin:0 auto 20px"></div>
    <div style="font-size:16px;font-weight:800;margin-bottom:16px">${_msEsc((p.first||'')+' '+(p.last||''))}</div>
    ${[
      {icon:'🔍',label:'Search messages',fn:'msSearchInChat()'},
      {icon:'⭐',label:'Starred messages',fn:'msShowStarred()'},
      {icon:'🔇',label:'Mute notifications',fn:'msMuteChat()'},
      {icon:'🗑',label:'Clear conversation',fn:`msClearChat('${peer}')`,danger:true},
    ].map(i=>`<div onclick="${i.fn};document.getElementById('msChatMenuSheet').remove()" style="display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px solid rgba(255,255,255,.06);cursor:pointer;color:${i.danger?'#f87171':'#fff'};font-size:15px;font-weight:600" onmouseover="this.style.opacity='.7'" onmouseout="this.style.opacity='1'">${i.icon} ${i.label}</div>`).join('')}
    <button onclick="document.getElementById('msChatMenuSheet').remove()" style="width:100%;margin-top:16px;padding:12px;background:rgba(255,255,255,.08);border:none;border-radius:12px;color:rgba(255,255,255,.6);font-size:15px;cursor:pointer">Cancel</button>`;
  document.body.appendChild(s);
};
window.msClearChat=function(peer){
  if(!confirm('Clear all messages?'))return;
  const me=_msMe();if(!me)return;
  _msSaveMessages(me.email,peer,[]);_msRenderMessages();
};
window.msShowStarred=function(){
  const me=_msMe();if(!me)return;const peer=_msState.activePeer;if(!peer)return;
  const n=_msGetMessages(me.email,peer).filter(m=>m.starred).length;
  if(typeof showToast==='function')showToast(n?`⭐ ${n} starred message${n>1?'s':''}`:'No starred messages');
};
window.msSearchInChat=function(){
  const q=prompt('Search messages:');if(!q)return;
  const me=_msMe();if(!me)return;const peer=_msState.activePeer;if(!peer)return;
  const n=_msGetMessages(me.email,peer).filter(m=>(m.text||'').toLowerCase().includes(q.toLowerCase())).length;
  if(typeof showToast==='function')showToast(`Found ${n} result${n!==1?'s':''} for "${q}"`);
};
window.msMuteChat=function(){if(typeof showToast==='function')showToast('🔇 Muted this conversation');};

/* ── Call stubs ──────────────────────────────────────────────────────────── */
window.msStartVoiceCall=function(){if(typeof startDmVoiceCall==='function')startDmVoiceCall();else if(typeof showToast==='function')showToast('📞 Starting voice call…');};
window.msStartVideoCall=function(){if(typeof startDmVideoCall==='function')startDmVideoCall();else if(typeof showToast==='function')showToast('📹 Starting video call…');};

/* ── Public API ───────────────────────────────────────────────────────────── */
window.openMessengerChat=function(peerEmail){
  if(typeof showScreen==='function')showScreen('messages');
  setTimeout(()=>{_msInject();msOpenChat(peerEmail);},400);
};
window.messageUser=window.openMessengerChat;

/* ── Date / time helpers ──────────────────────────────────────────────────── */
function _msFmtTime(iso){
  if(!iso)return'';const d=new Date(iso);const now=new Date();const diff=(now-d)/1000;
  if(diff<60)return'now';
  if(diff<3600)return Math.floor(diff/60)+'m';
  if(diff<86400)return d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
  if(diff<604800)return d.toLocaleDateString([],{weekday:'short'});
  return d.toLocaleDateString([],{month:'short',day:'numeric'});
}
function _msDayLabel(iso){
  const d=new Date(iso);const now=new Date();const diff=(now-d)/1000;
  if(diff<86400&&d.getDate()===now.getDate())return'Today';
  if(diff<172800)return'Yesterday';
  return d.toLocaleDateString([],{weekday:'long',month:'short',day:'numeric'});
}
function _msTimeOnly(iso){if(!iso)return'';return new Date(iso).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});}

/* ── Patch navigation ─────────────────────────────────────────────────────── */
(function(){
  const origShowScreen=window.showScreen;
  if(origShowScreen){
    window.showScreen=function(screen){
      origShowScreen.apply(this,arguments);
      if(screen==='messages')setTimeout(()=>{_msInject();_msRenderInit();},120);
    };
  }
  document.addEventListener('DOMContentLoaded',()=>{
    const sc=document.getElementById('screen-messages')||document.getElementById('messagesScreen');
    if(sc){_msInject();_msRenderInit();}
    document.querySelectorAll('[onclick*="messages"],[data-screen="messages"]').forEach(btn=>{
      btn.addEventListener('click',()=>setTimeout(()=>{_msInject();_msRenderInit();},200));
    });
    const session=_MS.get('afrib_session',null);
    if(session)_msStartHeartbeat();
  });
  setTimeout(()=>{
    const session=_MS.get('afrib_session',null);
    if(session)_msStartHeartbeat();
  },1000);
})();
