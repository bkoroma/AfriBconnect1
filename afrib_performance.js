/*!
 * AfribConnect — No Games Stub
 * Removes all traces of games from the app runtime.
 * Stubs all game functions to safe no-ops so no crashes occur
 * from game code remaining in script.js.
 */
(function NoGames() {
  'use strict';
  if (window.__afrib_no_games) return;
  window.__afrib_no_games = true;

  /* ── CSS: Hide any remaining game UI traces ── */
  const style = document.createElement('style');
  style.id = 'no-games-css';
  style.textContent = `
    #screen-games,
    [data-screen="games"],
    .abn-item[data-screen="games"],
    .app-tab[data-screen="games"],
    #games-lobby, #ludo-lobby, #ludo-setup, #ludo-game, #ludo-shop,
    #snake-lobby, #snake-game, #tod-lobby, #tod-game,
    #du-lobby, #du-game, #coin-shop,
    #ludoOnlineModal, #snakeOnlineModal, #todOnlineModal,
    #gcOverlay, #gcGrid, #groupCallOverlay,
    .game-lobby-card, .glc-banner, .ludo-board-wrap,
    #yourstyleFAB[style*="display:none"] { display: none !important; }

    /* Remove coin balance display from areas outside wallet */
    .coin-bar:not(#screen-wallet .coin-bar) { display: none !important; }
  `;
  document.head.appendChild(style);

  /* ── Stub all game functions ── */
  const STUBS = [
    // Games lobby
    'showGamesLobby','showLudoLobby','showLudoSetup','showLudoGame',
    'showSnakeLobby','showSnakeGame',
    'showTruthDareLobby','showTruthDareGame',
    'showDrinkUpLobby','showDrinkUpGame',
    // Ludo
    'openLudoSetup','startLudoGame','ludoRoll','onLudoDiceClick',
    'drawLudoBoard','renderLudoBoard','beginTurn','movePiece',
    'startLudoOnlineRandom','openLudoOnlineModal','joinLudoRoom',
    'showLudoRules','openLudoShop','renderShopBoards','renderShopDice',
    'renderShopTokens','renderShopPowerups','buyShopItem','equipShopItem',
    // Snake
    'startSnake','snakeDoRoll','performSnakeMove','drawSnakeBoard',
    'renderSnakeBoard','showSnakeLobby','finishSnakeTurn',
    // Truth or Dare
    'startTruthDare','nextTodTurn','drawChallenge','doneChallenge',
    'skipChallenge','exitTruthDare','renderTodPlayers','showTodNameModal',
    'todBottle','spinBottle','todPickTruth','todPickDare',
    // Drink Up
    'duStartGame','duRoll','duEndGame','updateDuCanvas','drawDuBoard',
    // Coin system
    'saveCoins','getCoinBalance','spendCoins','addCoins','openCoinShop',
    'renderCoinShop','buyCoinPack','awardGameCoins',
    // Group call (game-screen feature)
    'startGroupCall','gcToggleMute','gcToggleVideo','gcShareScreen',
    'gcAddParticipant','gcEndCall','gcLeave','gcKick','_renderGcGrid',
    // Online multiplayer
    'joinOnlineGame','hostOnlineGame','leaveOnlineGame',
    // 3D dice
    'renderDiceCanvas','drawDiceCanvas','rollDice3D','initDice3D',
    // Leaderboard
    'renderLeaderboard','showFullLeaderboard','openGamesLeaderboard',
    // Game init
    'initGames','initLudo','initSnake','initTruthDare','initDrinkUp',
  ];

  STUBS.forEach(function(name) {
    if (typeof window[name] !== 'function') {
      window[name] = function() {
        console.debug('[NoGames] stub called:', name);
      };
    }
  });

  /* ── Override showScreen to redirect games → home ── */
  function redirectGamesNav() {
    const origShow = window.showScreen;
    if (!origShow || origShow._noGames) return;

    window.showScreen = function(name) {
      if (name === 'games') {
        if (typeof showToast === 'function') showToast('Games have been removed');
        return origShow.apply(this, ['home']);
      }
      return origShow.apply(this, arguments);
    };
    window.showScreen._noGames = true;

    // Also patch AfribRouter if present
    if (window.AfribRouter && !window.AfribRouter._noGames) {
      const origGo = window.AfribRouter.go.bind(window.AfribRouter);
      window.AfribRouter.go = function(name) {
        if (name === 'games') return origGo('home');
        return origGo(name);
      };
      window.AfribRouter._noGames = true;
    }
  }

  /* ── Remove game nav items from DOM ── */
  function removeGameNavFromDOM() {
    document.querySelectorAll('[data-screen="games"]').forEach(function(el) {
      el.style.display = 'none';
      el.setAttribute('aria-hidden', 'true');
    });
    // Also remove any injected game FABs
    const fab = document.getElementById('gamesFAB');
    if (fab) fab.remove();
  }

  /* ── Remove game references from AI assistant responses ── */
  function patchAIResponses() {
    const origAI = window.getAfribAIResponse || window.afribChatResponse;
    if (!origAI) return;
    const patchFn = function(input) {
      const result = origAI.apply(this, arguments);
      if (typeof result === 'string') {
        return result
          .replace(/[•\-]\s*\*?\*?Games?\*?\*?[^\n]*/gi, '')
          .replace(/Ludo[^.!?\n]*/gi, '')
          .replace(/Snake & Ladder[^.!?\n]*/gi, '')
          .replace(/Truth or Dare[^.!?\n]*/gi, '')
          .replace(/Drink ?Up[^.!?\n]*/gi, '')
          .replace(/\n{3,}/g, '\n\n');
      }
      return result;
    };
    if (window.getAfribAIResponse) {
      window.getAfribAIResponse = patchFn;
    }
    if (window.afribChatResponse) {
      window.afribChatResponse = patchFn;
    }
  }

  /* ── Remove games from home trending/quick actions ── */
  function removeGamesFromHome() {
    // Remove "Try Ludo" suggestion from AI suggestions
    try {
      const origSugg = window.renderAISuggestions || window.getHomeSuggestions;
      if (origSugg && !origSugg._noGames) {
        const patched = function() {
          const result = origSugg.apply(this, arguments);
          return result;
        };
        patched._noGames = true;
        if (window.renderAISuggestions) window.renderAISuggestions = patched;
      }
    } catch(_) {}

    // Remove game quick-action buttons from home
    setTimeout(function() {
      document.querySelectorAll('[onclick*="showScreen(\'games\')"], [onclick*="showGamesLobby"], [onclick*="showLudoLobby"]').forEach(function(el) {
        const card = el.closest('.trend-card, .quick-action, .suggestion-item, li, div[onclick]') || el;
        card.style.display = 'none';
      });
    }, 500);
  }

  /* ── Init ── */
  function init() {
    redirectGamesNav();
    removeGameNavFromDOM();
    patchAIResponses();
    removeGamesFromHome();

    // Re-run after login in case home screen re-renders
    document.addEventListener('afrib:login', function() {
      setTimeout(function() {
        redirectGamesNav();
        removeGameNavFromDOM();
        patchAIResponses();
        removeGamesFromHome();
      }, 600);
    });

    // Watch DOM for any dynamically injected game elements
    const obs = new MutationObserver(function() {
      document.querySelectorAll('[data-screen="games"]:not([style*="none"])').forEach(function(el) {
        el.style.display = 'none';
      });
    });
    obs.observe(document.body, { childList: true, subtree: true });

    console.info('[AfribConnect] ✅ Games removed — no_games stub active');
  }

  if (document.readyState !== 'loading') {
    init();
    setTimeout(init, 500); // re-run after deferred scripts settle
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }

})();
