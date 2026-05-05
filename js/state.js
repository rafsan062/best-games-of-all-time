// Application runtime state (mutable globals shared across modules)
window.gameData = [];
window.activePlatform = null;
window.activeGenre = null;
/** Start year of decade (e.g. 1990), or null for no decade filter. */
window.activeDecade = null;
window.activeSort = "score-desc";
window.activeSearch = "";
window.cardsPage = 1;
